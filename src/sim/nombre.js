// Le SEUL fichier du projet qui importe break_infinity.js. Tout le reste
// importe `Decimal` d'ici.
//
// Deux copies de la bibliothèque rendraient `instanceof Decimal` faux entre
// @antimatter-dimensions/notations et notre code, sans aucune erreur : un
// nombre venu de l'une ne serait pas reconnu par l'autre (il deviendrait 0).
//
// Règles : toute quantité de jeu qui peut grandir est un Decimal, même quand
// elle vaut 10. Jamais `Number(decimal)` hors de `formater`, et seulement
// sous 10⁶ : Number(new Decimal("1e400")) vaut Infinity.
import Decimal from "break_infinity.js";

export { Decimal };
