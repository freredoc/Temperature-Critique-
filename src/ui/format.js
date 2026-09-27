import { ScientificNotation } from "@antimatter-dimensions/notations";

import { Decimal } from "../sim/nombre.js";

// Tout l'affichage des nombres passe par ce fichier : `formater` pour les
// quantités de jeu (des Decimal), `formaterDuree` et `formaterEntier` pour
// les durées et les compteurs techniques (des Number).

// U+00A0, et non l'espace fine U+202F : elle n'est dans aucune des deux
// polices (mesuré) et s'afficherait dans une autre, au milieu du nombre.
const ESPACE = " ";
const MOINS = "−";

const scientifique = new ScientificNotation();

// - sous 1000 : jusqu'à 3 décimales sans zéros inutiles, virgule (10, 0,052) ;
// - de 1000 à 10⁶ : entier groupé par milliers (1 917) ;
// - à partir de 10⁶ : notation scientifique à 2 décimales (7,77e11, 1,00e400).
// Sous 10⁶, on tronque au lieu d'arrondir : l'écran n'affiche jamais plus que
// ce que le joueur a (9,9996 s'affiche 9,999, pas 10).
export function formater(d) {
  if (!Number.isFinite(d.mantissa) || !Number.isFinite(d.exponent)) return "?";
  if (d.sign() < 0) return MOINS + formater(d.abs());
  if (d.lt(1000)) {
    // Le facteur 1 + 1e-12 absorbe le bruit binaire (1,001 × 1000 = 1000,9999…).
    const tronque = Math.floor(d.toNumber() * 1000 * (1 + 1e-12)) / 1000;
    return String(tronque).replace(".", ",");
  }
  if (d.lt(1e6)) return formaterEntier(d.toNumber());
  // notations écrit « 1.00e400 », et groupe les très grands exposants par des
  // virgules (« 1.00e100,000 ») : point → virgule, virgule → espace.
  return scientifique.format(d, 2, 0).replace(/[.,]/g, (c) => (c === "." ? "," : ESPACE));
}

// 3600000 → « 3 600 000 ». Tronque vers zéro.
export function formaterEntier(n) {
  return String(Math.trunc(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ESPACE);
}

// Deux unités au plus : « 45 s », « 2 min 5 s », « 3 h 12 min », « 2 j 3 h ».
export function formaterDuree(ms) {
  const s = Math.floor(ms / 1000);
  const j = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const min = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const u = (n, unite) => `${formaterEntier(n)}${ESPACE}${unite}`;
  if (j > 0) return `${u(j, "j")} ${u(h, "h")}`;
  if (h > 0) return `${u(h, "h")} ${u(min, "min")}`;
  if (min > 0) return `${u(min, "min")} ${u(sec, "s")}`;
  return u(sec, "s");
}

// Lit une saisie du joueur : « 1e400 », « 12,5 », « 3.2e15 ». Rend un Decimal
// fini, positif ou nul, ou null si la saisie n'en est pas un. (break_infinity
// ne lève pas toujours : « 1E400 » deviendrait l'infini, « hello » un NaN.)
export function lireNombre(texte) {
  const net = String(texte).trim().replace(",", ".").toLowerCase();
  if (!/^(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/.test(net)) return null;
  const d = new Decimal(net);
  const fini = Number.isFinite(d.mantissa) && Number.isSafeInteger(d.exponent) && Math.abs(d.exponent) < 9e15;
  return fini ? d : null;
}
