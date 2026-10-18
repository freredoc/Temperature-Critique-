import { PAS_MS } from "../../src/data/constantes.js";
import { PALIERS } from "../../src/data/froid.js";
import { avancer } from "../../src/sim/avancer.js";
import { etatInitial } from "../../src/sim/etat.js";
import { Decimal } from "../../src/sim/nombre.js";
import { deserialiser, serialiser } from "../../src/sim/sauvegarde.js";
import { STRATEGIES } from "./strategies.js";

// Une partie jouée par le joueur automatique, du début jusqu'à la première
// condition d'arrêt atteinte : `jusqua` joules, le palier `jusquaPalier`, ou
// `dureeMaxMs` de temps de jeu.
//
// Trois règles, et elles tiennent toutes ici :
// - rien n'est recalculé : le temps avance par `avancer`, les achats et les
//   paliers passent par la stratégie, qui appelle les fonctions du jeu ;
// - rien n'est gardé entre deux appels : tout ce qui se relève vit dans
//   `jouer`, et une partie ne voit rien de la précédente ;
// - le temps avance au pas du jeu, PAS_MS. L'énergie se relève après CHAQUE
//   pas ; les achats et les paliers, à chaque décision, puisque c'est là
//   qu'ils ont lieu.
//
// options :
//   strategie     nom d'une stratégie de STRATEGIES ;
//   cadenceMs     une décision toutes les cadenceMs de jeu, multiple de PAS_MS ;
//   jusqua        énergie à atteindre (texte, nombre ou Decimal), facultatif ;
//   jusquaPalier  palier de froid à atteindre, facultatif : la partie
//                 s'arrête à la décision qui l'atteint ;
//   dureeMaxMs    temps de jeu au-delà duquel on s'arrête ;
//   instantanes   seuils d'énergie où l'on photographie l'état.
export function jouer(options) {
  const { strategie, cadenceMs, dureeMaxMs } = options;
  const agir = STRATEGIES[strategie]?.agir;
  if (!agir) throw new RangeError(`joueur automatique : stratégie inconnue (${strategie})`);
  if (!Number.isSafeInteger(cadenceMs) || cadenceMs <= 0 || cadenceMs % PAS_MS !== 0) {
    throw new RangeError(`joueur automatique : la cadence doit être un multiple entier de ${PAS_MS} ms (reçu ${cadenceMs})`);
  }
  if (!Number.isSafeInteger(dureeMaxMs) || dureeMaxMs <= 0) {
    throw new RangeError(`joueur automatique : durée maximale invalide (${dureeMaxMs})`);
  }
  const jusqua = options.jusqua === undefined ? null : new Decimal(options.jusqua);
  const jusquaPalier = options.jusquaPalier ?? null;
  if (jusquaPalier !== null && !(Number.isInteger(jusquaPalier) && jusquaPalier >= 1 && jusquaPalier < PALIERS.length)) {
    throw new RangeError(`joueur automatique : palier à atteindre invalide (${jusquaPalier})`);
  }
  const seuilsInstantanes = (options.instantanes ?? []).map((s) => new Decimal(s));
  // Les décades de la montée du premier palier, de 10 J à son seuil. Plus
  // haut, l'énergie repart de 10 J à chaque palier : une décade n'y voudrait
  // plus rien dire.
  const seuilPremierPalier = new Decimal(PALIERS[1].seuil);

  const etat = etatInitial(0);
  const pasParDecision = cadenceMs / PAS_MS;

  // Tout ce qui se relève, et rien au niveau du module.
  const decades = [];
  let prochaineDecade = 1;
  const premiersAchats = etat.machines.map(() => null);
  // Chaque changement de palier : { palier, ms }.
  const paliers = [];
  // Un relevé par palier joué, dans l'ordre. `finMs` et `attente` restent
  // nuls pour le palier où la partie s'arrête : il n'est pas fini.
  const releves = [nouveauReleve(0, 0)];
  const instantanes = seuilsInstantanes.map((seuil) => ({ seuil, ms: null, etat: null }));
  let arret = null;

  // Une décision : la stratégie agit, puis on relève ce qu'elle a fait. Rend
  // true quand la partie s'arrête.
  const decider = () => {
    const ms = etat.temps.totalMs;
    const palierAvant = etat.froid.palier;
    const unites = agir(etat);
    const palier = etat.froid.palier;
    if (palier !== palierAvant) {
      paliers.push({ palier, ms });
      // L'attente du seuil : du dernier achat du palier au refroidissement.
      // Le joueur ne pouvait plus rien acheter ; il regardait la jauge.
      const quitte = releves.at(-1);
      quitte.finMs = ms;
      if (quitte.dernierAchatMs !== null) {
        quitte.attente = { debutMs: quitte.dernierAchatMs, finMs: ms, ms: ms - quitte.dernierAchatMs };
      }
      releves.push(nouveauReleve(palier, ms));
    }
    etat.machines.forEach((m, i) => {
      if (premiersAchats[i] === null && m.achetees > 0) premiersAchats[i] = ms;
    });
    // Un achat se range dans le palier où il a lieu, après un éventuel
    // refroidissement à la même décision : un écart ne court jamais d'un
    // palier à l'autre.
    if (unites > 0) {
      const courant = releves.at(-1);
      if (courant.dernierAchatMs !== null) {
        const ecart = ms - courant.dernierAchatMs;
        if (courant.ecart === null || ecart > courant.ecart.ms) {
          courant.ecart = { debutMs: courant.dernierAchatMs, finMs: ms, ms: ecart };
        }
      }
      courant.dernierAchatMs = ms;
    }
    if (jusquaPalier !== null && palier >= jusquaPalier) {
      arret = { cause: "palier", ms };
      return true;
    }
    return false;
  };

  // Après chaque pas : décades franchies, instantanés, arrêt. Rend true
  // quand la partie s'arrête.
  const relever = () => {
    const ms = etat.temps.totalMs;
    while (etat.froid.palier === 0) {
      const decade = new Decimal(`1e${prochaineDecade}`);
      if (decade.gt(seuilPremierPalier) || etat.energie.lt(decade)) break;
      decades.push({ exposant: prochaineDecade, ms });
      prochaineDecade++;
    }
    for (const instantane of instantanes) {
      if (instantane.ms === null && etat.energie.gte(instantane.seuil)) {
        instantane.ms = ms;
        instantane.etat = deserialiser(serialiser(etat));
      }
    }
    if (jusqua !== null && etat.energie.gte(jusqua)) {
      arret = { cause: "energie", ms };
      return true;
    }
    if (ms >= dureeMaxMs) {
      arret = { cause: "duree", ms };
      return true;
    }
    return false;
  };

  let fini = false;
  while (!fini) {
    fini = decider();
    for (let i = 0; i < pasParDecision && !fini; i++) {
      avancer(etat, PAS_MS);
      fini = relever();
    }
  }

  return {
    decades,
    premiersAchats,
    paliers,
    releves: releves.map(({ palier, debutMs, finMs, ecart, attente }) => ({ palier, debutMs, finMs, ecart, attente })),
    ecart: plusLongEcart(releves),
    instantanes,
    arret,
    finMs: etat.temps.totalMs,
    etatFinal: etat,
  };
}

function nouveauReleve(palier, debutMs) {
  return { palier, debutMs, finMs: null, dernierAchatMs: null, ecart: null, attente: null };
}

// Le plus long écart entre deux achats d'un même palier, avec ses bornes et
// son palier ; à égalité, le premier. null s'il n'y a eu nulle part deux
// achats.
function plusLongEcart(releves) {
  let plusLong = null;
  for (const { palier, ecart } of releves) {
    if (ecart !== null && (plusLong === null || ecart.ms > plusLong.ms)) plusLong = { palier, ...ecart };
  }
  return plusLong;
}
