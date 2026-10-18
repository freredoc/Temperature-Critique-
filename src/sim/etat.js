import { Decimal } from "./nombre.js";
import { MACHINES } from "../data/machines.js";

// L'état complet d'une partie : tout ce qui se sauvegarde.
// Quantités de jeu : des Decimal. Durées et compteurs : des Number entiers.
// `creeLe` arrive en argument : src/sim ne lit jamais l'horloge.
//
// Une machine porte deux nombres qui ne se confondent jamais : `quantite`,
// ce qu'on possède (achats plus cascade, un Decimal), et `achetees`, les
// seuls achats (un Number entier), qui fixent son prix et son multiplicateur.
// `decouvertes.machines` est la plus haute machine jamais achetée : il ne
// descend jamais, et c'est lui qui dévoile les cartes.
//
// `froid.palier` est le palier de froid courant (0 à 6), et
// `decouvertes.paliers` le plus haut jamais atteint. Lui non plus ne descend
// jamais : le lot SUPRA remettra `froid.palier` à 0 à chaque quench, mais ce
// qui a été vu ne disparaît pas. En jeu, seul `refroidir` (src/sim/froid.js)
// les fait bouger.
export function etatInitial(creeLe) {
  return {
    meta: { creeLe, modeTestUtilise: false },
    temps: { totalMs: 0 },
    energie: new Decimal(10),
    machines: MACHINES.map(() => ({ quantite: new Decimal(0), achetees: 0 })),
    froid: { palier: 0 },
    decouvertes: { machines: 0, paliers: 0 },
    preferences: { modeAchat: "un" },
  };
}
