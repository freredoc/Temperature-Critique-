// Ce qui s'affiche, et à quelle condition. src/ui/ecran.js ne montre
// l'élément [data-devoile="<id>"] que si `condition(etat)` est vraie.
//
// Chaque lot ajoute ici ses entrées : jamais de « if (lot >= 3) » éparpillé
// dans l'écran. Au montage, ecran.js refuse un id sans élément, et un élément
// sans entrée.
export const DEVOILEMENT = [
  { id: "energie", condition: () => true },
];
