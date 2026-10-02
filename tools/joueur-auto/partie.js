import { PAS_MS } from "../../src/data/constantes.js";
import { avancer } from "../../src/sim/avancer.js";
import { etatInitial } from "../../src/sim/etat.js";
import { Decimal } from "../../src/sim/nombre.js";
import { deserialiser, serialiser } from "../../src/sim/sauvegarde.js";
import { STRATEGIES } from "./strategies.js";

// Une partie jouée par le joueur automatique, du début jusqu'à `jusqua`
// joules ou jusqu'à `dureeMaxMs` de temps de jeu.
//
// Trois règles, et elles tiennent toutes ici :
// - rien n'est recalculé : le temps avance par `avancer`, les achats passent
//   par la stratégie, qui appelle les fonctions du jeu ;
// - rien n'est gardé entre deux appels : tout ce qui se relève vit dans
//   `jouer`, et une partie ne voit rien de la précédente ;
// - le temps avance au pas du jeu, PAS_MS, et les événements se relèvent
//   après CHAQUE pas.
//
// options :
//   strategie    nom d'une stratégie de STRATEGIES ;
//   cadenceMs    une décision toutes les cadenceMs de jeu, multiple de PAS_MS ;
//   jusqua       énergie à atteindre (texte, nombre ou Decimal) ;
//   dureeMaxMs   temps de jeu au-delà duquel on s'arrête ;
//   instantanes  seuils d'énergie où l'on photographie l'état.
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
  const jusqua = new Decimal(options.jusqua);
  const seuilsInstantanes = (options.instantanes ?? []).map((s) => new Decimal(s));

  const etat = etatInitial(0);
  const pasParDecision = cadenceMs / PAS_MS;

  // Tout ce qui se relève, et rien au niveau du module.
  const decades = [];
  let prochaineDecade = 1;
  const premiersAchats = etat.machines.map(() => null);
  let dernierAchatMs = null;
  let ecart = null;
  const instantanes = seuilsInstantanes.map((seuil) => ({ seuil, ms: null, etat: null }));
  let arriveeMs = null;

  const decider = () => {
    const ms = etat.temps.totalMs;
    const avant = etat.machines.map((m) => m.achetees);
    const unites = agir(etat);
    etat.machines.forEach((m, i) => {
      if (avant[i] === 0 && m.achetees > 0 && premiersAchats[i] === null) premiersAchats[i] = ms;
    });
    if (unites > 0) {
      if (dernierAchatMs !== null && (ecart === null || ms - dernierAchatMs > ecart.ms)) {
        ecart = { debutMs: dernierAchatMs, finMs: ms, ms: ms - dernierAchatMs };
      }
      dernierAchatMs = ms;
    }
  };

  // Après chaque pas : décades franchies, instantanés, arrivée. Rend true
  // quand la partie s'arrête.
  const relever = () => {
    const ms = etat.temps.totalMs;
    while (etat.energie.gte(new Decimal(`1e${prochaineDecade}`))) {
      decades.push({ exposant: prochaineDecade, ms });
      prochaineDecade++;
    }
    for (const instantane of instantanes) {
      if (instantane.ms === null && etat.energie.gte(instantane.seuil)) {
        instantane.ms = ms;
        instantane.etat = deserialiser(serialiser(etat));
      }
    }
    if (etat.energie.gte(jusqua)) {
      arriveeMs = ms;
      return true;
    }
    return ms >= dureeMaxMs;
  };

  let fini = false;
  while (!fini) {
    decider();
    for (let i = 0; i < pasParDecision && !fini; i++) {
      avancer(etat, PAS_MS);
      fini = relever();
    }
  }

  return {
    decades,
    premiersAchats,
    ecart,
    instantanes,
    arriveeMs,
    finMs: etat.temps.totalMs,
    etatFinal: etat,
  };
}
