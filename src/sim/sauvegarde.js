import { Decimal } from "./nombre.js";
import { PALIERS } from "../data/froid.js";
import { MACHINES } from "../data/machines.js";

// Version du schéma de l'état, déclarée ici et nulle part ailleurs. Elle ne
// bouge que si le schéma change, et une entrée de `migrations` l'accompagne.
export const SAVE_VERSION = 3;

// migrations[v] transforme une enveloppe de version v en version v + 1.
// Une migration décrit la forme de SON époque, en toutes lettres : elle ne lit
// jamais une table de src/data, qui peut changer après elle.
export const migrations = [];

// 1 → 2 (lot MACHINES) : les huit machines, la plus haute découverte et le
// mode d'achat. Une partie v1 n'avait aucune machine : tout part de zéro, et
// rien d'autre ne bouge — ni l'énergie, ni le temps, ni le mode test.
migrations[1] = (env) => {
  if (estObjet(env.etat)) {
    env.etat.machines = Array.from({ length: 8 }, () => ({ quantite: new Decimal(0), achetees: 0 }));
    env.etat.decouvertes = { machines: 0 };
    env.etat.preferences = { modeAchat: "un" };
  }
  return env;
};

// 2 → 3 (lot FROID) : le palier de froid, et le plus haut palier jamais
// atteint. Une partie v2 n'a jamais refroidi : elle est à l'ambiante, au
// palier 0, et rien d'autre ne bouge — ni l'énergie, ni les machines, ni la
// plus haute machine découverte, ni le mode d'achat, ni le temps.
migrations[2] = (env) => {
  if (estObjet(env.etat)) {
    env.etat.froid = { palier: 0 };
    if (estObjet(env.etat.decouvertes)) env.etat.decouvertes.paliers = 0;
  }
  return env;
};

const MODES_ACHAT = ["un", "lot"];
const DERNIER_PALIER = PALIERS.length - 1;

const PREFIXE_CODE = "TC1.";

// Un Decimal s'écrit {"$d":"<mantisse>e<exposant>"}. Ce format relit
// exactement la même valeur, alors que toString() passe par un Number sous
// 1e21 et arrondit (mesuré : 24 écarts sur 240 valeurs).
const FORMAT_DECIMAL = /^-?\d+(?:\.\d+)?e-?\d{1,16}$/;

// Texte JSON de n'importe quelle valeur. Tout Decimal, où qu'il soit dans
// l'arbre, devient {"$d": …} : un champ ajouté par un lot futur est couvert
// sans rien écrire ici.
export function serialiser(valeur) {
  return JSON.stringify(valeur, function (cle, v) {
    // JSON.stringify a déjà appelé Decimal#toJSON : `v` est la chaîne
    // "1e+400". L'objet d'origine se lit sur this[cle].
    const brut = this[cle];
    if (brut instanceof Decimal) {
      const texte = `${brut.mantissa}e${brut.exponent}`;
      // On n'écrit que ce qu'on sait relire : un NaN ne remplace jamais une
      // bonne sauvegarde.
      if (!FORMAT_DECIMAL.test(texte)) throw new Error(`nombre invalide, non sauvegardé (${texte})`);
      return { $d: texte };
    }
    // Un objet d'état dont la seule clé serait $d se relirait comme un nombre.
    if (estObjet(brut) && Object.keys(brut).length === 1 && "$d" in brut) {
      throw new Error("la clé « $d » est réservée aux nombres Decimal");
    }
    return v;
  });
}

// L'inverse de `serialiser` : tout objet qui a exactement la clé $d
// redevient un Decimal. Lève une erreur sur un JSON ou un nombre illisible.
export function deserialiser(texte) {
  return JSON.parse(texte, (cle, v) => {
    if (estObjet(v)) {
      const cles = Object.keys(v);
      if (cles.length === 1 && cles[0] === "$d") {
        if (typeof v.$d !== "string" || !FORMAT_DECIMAL.test(v.$d)) {
          throw new Error(`nombre illisible (${JSON.stringify(v.$d)})`);
        }
        return new Decimal(v.$d);
      }
    }
    return v;
  });
}

// Ce qui s'écrit dans le stockage et dans un code d'export.
// `sauveLe` : l'heure (ms) jusqu'à laquelle l'état a été simulé.
export function envelopper(etat, { build, sauveLe }) {
  return { saveVersion: SAVE_VERSION, build, sauveLe, etat };
}

// Relit le texte JSON d'une enveloppe, venu du stockage ou d'un code.
// Rend { ok: true, enveloppe, migreeDepuis } ou { ok: false, cause, message }
// avec cause = "illisible" ou "future". `migreeDepuis` est la version lue si
// elle était plus ancienne que SAVE_VERSION, null sinon : c'est ce qui dit au
// chargement qu'il faut mettre le texte d'origine de côté. Ne lève jamais.
export function relire(texte) {
  let brut;
  try {
    brut = JSON.parse(texte);
  } catch {
    return refus("illisible", "le texte n'est pas du JSON");
  }
  // La version se lit avant tout le reste : une sauvegarde plus récente peut
  // avoir un format que ce build ne comprend pas.
  const version = estObjet(brut) ? brut.saveVersion : undefined;
  if (!Number.isSafeInteger(version) || version < 1) {
    return refus("illisible", "la version de sauvegarde manque ou est invalide");
  }
  if (version > SAVE_VERSION) {
    return refus("future", `c'est une sauvegarde de version ${version}, venue d'une version `
      + `plus récente du jeu ; celle-ci lit jusqu'à la version ${SAVE_VERSION}`);
  }
  let enveloppe;
  try {
    enveloppe = migrer(deserialiser(texte));
  } catch (e) {
    return refus("illisible", e.message);
  }
  const defaut = defautDeForme(enveloppe);
  if (defaut) return refus("illisible", defaut);
  return { ok: true, enveloppe, migreeDepuis: version < SAVE_VERSION ? version : null };
}

// "TC1." + base64url(UTF-8(JSON de l'enveloppe)).
export function exporter(enveloppe) {
  return PREFIXE_CODE + versBase64url(new TextEncoder().encode(serialiser(enveloppe)));
}

// Rend { ok: true, enveloppe } ou { ok: false, erreur } : un message qui dit
// pourquoi le code est refusé. Ne lève jamais.
export function importer(code) {
  if (typeof code !== "string") return { ok: false, erreur: "le code n'est pas un texte" };
  // Un copier-coller peut ajouter des espaces ou des retours à la ligne.
  const net = code.replace(/\s+/g, "");
  if (net === "") return { ok: false, erreur: "le code est vide" };
  if (!net.startsWith(PREFIXE_CODE)) {
    return { ok: false, erreur: `le code doit commencer par « ${PREFIXE_CODE} »` };
  }
  let texte;
  try {
    const octets = depuisBase64url(net.slice(PREFIXE_CODE.length));
    texte = new TextDecoder("utf-8", { fatal: true }).decode(octets);
  } catch {
    return { ok: false, erreur: "le code est abîmé : il ne se décode pas" };
  }
  const lu = relire(texte);
  return lu.ok ? { ok: true, enveloppe: lu.enveloppe } : { ok: false, erreur: lu.message };
}

function migrer(enveloppe) {
  let env = enveloppe;
  for (let v = env.saveVersion; v < SAVE_VERSION; v++) {
    const migration = migrations[v];
    if (typeof migration !== "function") throw new Error(`la migration ${v} → ${v + 1} manque`);
    env = migration(env);
    env.saveVersion = v + 1;
  }
  return env;
}

// La forme minimale qu'une enveloppe doit avoir pour remplacer une partie.
function defautDeForme(enveloppe) {
  const { sauveLe, etat } = enveloppe;
  if (!Number.isSafeInteger(sauveLe) || sauveLe < 0) return "la date de sauvegarde manque ou est invalide";
  if (!estObjet(etat)) return "l'état de la partie manque";
  if (!estObjet(etat.meta)) return "l'état est incomplet : « meta » manque";
  if (!estObjet(etat.temps) || !Number.isSafeInteger(etat.temps.totalMs) || etat.temps.totalMs < 0) {
    return "l'état est incomplet : « temps » manque ou est invalide";
  }
  if (!(etat.energie instanceof Decimal)) return "l'état est incomplet : « energie » manque ou n'est pas un nombre";
  const machines = etat.machines;
  if (!Array.isArray(machines) || machines.length !== MACHINES.length) {
    return `l'état est incomplet : « machines » manque ou n'a pas ${MACHINES.length} entrées`;
  }
  for (let i = 0; i < machines.length; i++) {
    const m = machines[i];
    if (!estObjet(m)) return `l'état est incomplet : « machines[${i}] » manque`;
    if (!(m.quantite instanceof Decimal) || !estFini(m.quantite) || m.quantite.lt(0)) {
      return `l'état est incomplet : « machines[${i}].quantite » manque ou n'est pas un nombre positif`;
    }
    if (!Number.isSafeInteger(m.achetees) || m.achetees < 0) {
      return `l'état est incomplet : « machines[${i}].achetees » manque ou n'est pas un entier positif`;
    }
  }
  const decouvertes = estObjet(etat.decouvertes) ? etat.decouvertes : {};
  if (!entierEntre(decouvertes.machines, 0, MACHINES.length)) {
    return `l'état est incomplet : « decouvertes.machines » manque ou n'est pas entre 0 et ${MACHINES.length}`;
  }
  // Le palier courant AVANT le plus haut palier atteint : un palier hors
  // bornes se nomme lui-même, au lieu de passer pour un « plus haut palier »
  // trop bas.
  const palier = estObjet(etat.froid) ? etat.froid.palier : undefined;
  if (!entierEntre(palier, 0, DERNIER_PALIER)) {
    return `l'état est incomplet : « froid.palier » manque ou n'est pas un entier entre 0 et ${DERNIER_PALIER}`;
  }
  if (!entierEntre(decouvertes.paliers, 0, DERNIER_PALIER)) {
    return `l'état est incomplet : « decouvertes.paliers » manque ou n'est pas un entier entre 0 et ${DERNIER_PALIER}`;
  }
  // Le plus haut palier atteint ne peut pas être sous le palier courant.
  if (decouvertes.paliers < palier) {
    return `l'état est incohérent : « decouvertes.paliers » vaut ${decouvertes.paliers}, `
      + `sous le palier courant (${palier})`;
  }
  const mode = estObjet(etat.preferences) ? etat.preferences.modeAchat : undefined;
  if (!MODES_ACHAT.includes(mode)) {
    return "l'état est incomplet : « preferences.modeAchat » manque ou n'est pas « un » ou « lot »";
  }
  return null;
}

function estFini(d) {
  return Number.isFinite(d.mantissa) && Number.isFinite(d.exponent);
}

function entierEntre(n, min, max) {
  return Number.isInteger(n) && n >= min && n <= max;
}

function refus(cause, message) {
  return { ok: false, cause, message };
}

function estObjet(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

// base64url (RFC 4648 §5), sans remplissage.
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

function versBase64url(octets) {
  let s = "";
  let i = 0;
  for (; i + 2 < octets.length; i += 3) {
    const n = (octets[i] << 16) | (octets[i + 1] << 8) | octets[i + 2];
    s += ALPHABET[n >> 18] + ALPHABET[(n >> 12) & 63] + ALPHABET[(n >> 6) & 63] + ALPHABET[n & 63];
  }
  if (octets.length - i === 1) {
    const n = octets[i] << 16;
    s += ALPHABET[n >> 18] + ALPHABET[(n >> 12) & 63];
  } else if (octets.length - i === 2) {
    const n = (octets[i] << 16) | (octets[i + 1] << 8);
    s += ALPHABET[n >> 18] + ALPHABET[(n >> 12) & 63] + ALPHABET[(n >> 6) & 63];
  }
  return s;
}

function depuisBase64url(texte) {
  if (!/^[A-Za-z0-9_-]*$/.test(texte) || texte.length % 4 === 1) throw new Error("base64url invalide");
  const octets = new Uint8Array(Math.floor((texte.length * 3) / 4));
  let o = 0;
  let tampon = 0;
  let bits = 0;
  for (const c of texte) {
    tampon = ((tampon << 6) | ALPHABET.indexOf(c)) & 0xffff;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      octets[o++] = (tampon >> bits) & 0xff;
    }
  }
  return octets;
}
