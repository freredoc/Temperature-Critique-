import { MACHINES } from "./machines.js";
import { seuilSuivant } from "../sim/froid.js";
import { machinesDebloquees } from "../sim/machines.js";

// Ce qui s'affiche, et à quelle condition. src/ui/ecran.js ne montre
// l'élément [data-devoile="<id>"] que si `condition(etat)` est vraie.
//
// Chaque lot ajoute ici ses entrées : jamais de « if (lot >= 3) » éparpillé
// dans l'écran. Au montage, ecran.js refuse un id sans élément, et un élément
// sans entrée.
//
// Les conditions lisent `decouvertes`, qui ne descend jamais : ce qui s'est
// montré une fois ne disparaît plus, même quand l'énergie retombe à zéro
// après un achat. « production » se lit sur la première machine ACHETÉE, pas
// sur une production non nulle, pour la même raison.
export const DEVOILEMENT = [
  { id: "energie", condition: () => true },
  { id: "production", condition: (etat) => etat.decouvertes.machines >= 1 },
  // Le froid arrive avec la première Turbine (machine 3), et ne repart plus.
  // Une condition sur l'énergie le ferait clignoter : elle redescend à chaque
  // achat, et retombe à 10 J à chaque palier.
  { id: "froid", condition: (etat) => etat.decouvertes.machines >= 3 || etat.decouvertes.paliers >= 1 },
  { id: "froid-explication", condition: (etat) => etat.decouvertes.paliers >= 1 },
  // La jauge, le bouton et l'aperçu, tant qu'il reste un palier à descendre
  // (froid.palier < 6).
  { id: "froid-suivant", condition: (etat) => seuilSuivant(etat) !== null },
  { id: "aide-debut", condition: (etat) => etat.decouvertes.machines === 0 },
  { id: "commandes-achat", condition: (etat) => etat.decouvertes.machines >= 2 },
  // Une entrée par machine, tirée de MACHINES : la machine n se montre quand
  // elle est débloquée et que la n − 1 a été achetée une fois. La Dynamo est
  // toujours là.
  ...MACHINES.map(({ id: n }) => ({
    id: `machine-${n}`,
    condition: n === 1
      ? () => true
      : (etat) => n <= machinesDebloquees(etat) && etat.decouvertes.machines >= n - 1,
  })),
];
