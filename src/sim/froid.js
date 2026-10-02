import { ENERGIE_APRES_PALIER, PALIERS } from "../data/froid.js";
import { machinesDebloqueesAuPalier, multiplicateurDePalier } from "./machines.js";
import { Decimal } from "./nombre.js";

// Les paliers de froid (plan §6.2) : un seuil d'énergie pour descendre d'un
// cran, et la partie repart de 10 J sans machines. En échange, toutes les
// machines ×2, et une machine de plus.
//
// ⚠ AUCUN PALIER NE PASSE PAR `avancer`. Refroidir est un geste du joueur
// (« c'est le joueur qui appuie ») ; le Régulateur, qui refroidira tout seul,
// arrive avec le lot SUPRA. Le rattrapage hors ligne ne refroidit donc
// jamais : l'énergie s'accumule au-delà du seuil, et le joueur refroidit en
// revenant.
//
// ⚠ LES IMPORTS VONT DANS UN SEUL SENS : ce fichier importe
// src/sim/machines.js, jamais l'inverse. Les règles « une machine de plus »
// et « ×2 par palier » vivent là-bas ; l'aperçu les y appelle au lieu de les
// recopier.

// Les seuils deviennent des Decimal ici, une fois. Le palier 0 n'en a pas.
const SEUILS = PALIERS.map((p) => (p.seuil === undefined ? null : new Decimal(p.seuil)));
const DERNIER_PALIER = PALIERS.length - 1;

// Le seuil du palier suivant (un Decimal), ou null au dernier palier.
export function seuilSuivant(etat) {
  const suivant = etat.froid.palier + 1;
  return suivant > DERNIER_PALIER ? null : SEUILS[suivant];
}

// Égal suffit : à 1e9 J pile, on descend au palier 1.
export function peutRefroidir(etat) {
  const seuil = seuilSuivant(etat);
  return seuil !== null && etat.energie.gte(seuil);
}

// Descend d'un palier si le seuil est atteint, et rend true ; sinon rend
// false sans rien toucher. L'énergie repart de ENERGIE_APRES_PALIER, et
// chaque machine de zéro, `achetees` compris : le prix et le ×2 par lot
// repartent du début. `decouvertes.machines` ne bouge pas : les cartes déjà
// vues restent là. Rien d'autre ne bouge : ni le temps, ni le mode d'achat.
export function refroidir(etat) {
  if (!peutRefroidir(etat)) return false;
  etat.froid.palier += 1;
  etat.energie = new Decimal(ENERGIE_APRES_PALIER);
  for (const m of etat.machines) {
    m.quantite = new Decimal(0);
    m.achetees = 0;
  }
  etat.decouvertes.paliers = Math.max(etat.decouvertes.paliers, etat.froid.palier);
  return true;
}

// Ce que le prochain palier apporte, pour l'écran (P5 : un aperçu avant
// chaque choix) ; null au dernier palier. Rien n'y est recalculé : les deux
// règles « au palier » de machines.js sont appelées avec le palier suivant.
//   multiplicateur   le ×2^p de toutes les machines APRÈS (un Decimal) ;
//   machineNeuve     le numéro de la machine débloquée, ou null (paliers 5
//                    et 6 : les huit sont déjà là).
export function apercuRefroidir(etat) {
  const suivant = etat.froid.palier + 1;
  if (suivant > DERNIER_PALIER) return null;
  const { palier, kelvins, technique } = PALIERS[suivant];
  const avant = machinesDebloqueesAuPalier(etat.froid.palier);
  const apres = machinesDebloqueesAuPalier(suivant);
  return {
    palier,
    kelvins,
    technique,
    multiplicateur: multiplicateurDePalier(suivant),
    machineNeuve: apres > avant ? apres : null,
  };
}
