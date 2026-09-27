import { MAX_PAS_RATTRAPAGE, PAS_MS } from "../data/constantes.js";
import { avancer } from "./avancer.js";

// Rejoue `ms` millisecondes d'un coup : hors ligne, retour au premier plan,
// grosse image, saut du mode test.
//
// - Aucun plafond de durée (règle P6) : une semaine se rattrape en entier.
// - Au plus MAX_PAS_RATTRAPAGE appels à `avancer`, avec des pas entiers dont
//   la somme vaut exactement `ms` : les `ms − base × n` premiers pas reçoivent
//   1 ms de plus.
// - Mêmes formules, mais des pas plus grands : pour une production en
//   cascade, le résultat approche celui de la boucle sans l'égaler.
// - Une durée nulle ou négative (horloge reculée) ne fait rien.
export function rattraper(etat, ms) {
  if (!(ms > 0)) return { pas: 0, ms: 0 };
  if (!Number.isSafeInteger(ms)) {
    throw new RangeError(`rattraper : la durée doit être un nombre entier de ms (reçu ${ms})`);
  }
  const pas = Math.min(MAX_PAS_RATTRAPAGE, Math.ceil(ms / PAS_MS));
  const base = Math.floor(ms / pas);
  const reste = ms - base * pas;
  for (let i = 0; i < pas; i++) avancer(etat, i < reste ? base + 1 : base);
  return { pas, ms };
}
