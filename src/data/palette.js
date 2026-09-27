// Les 16 couleurs du jeu, reprises en variables CSS dans src/ui/theme.css.
// Aucune autre couleur dans le code : tools/build.js vérifie les deux points.
//
// Contrastes mesurés sur le fond : texte 15,3:1 · texte-2 7,6:1 (6,9:1 sur
// surface) · orange 9,2:1 · cyan 11,0:1. `trait-fort` n'atteint que 2,6:1 :
// il est réservé aux contours d'éléments inactifs.
export const PALETTE = Object.freeze({
  "fond": "#0b0f1a",             // fond de page
  "surface": "#141a2b",          // cartes
  "surface-2": "#1f2740",        // jauges vides, cases passées
  "trait": "#2a3350",            // bordures
  "trait-fort": "#4a5572",       // bordures d'éléments inactifs seulement
  "texte-2": "#9aa3b8",          // texte secondaire
  "texte-doux": "#c9ccd6",       // texte atténué
  "texte": "#e8e6d9",            // texte
  "cyan": "#5fd3f3",             // froid, supra, sélection
  "cyan-graphe": "#1d93b8",      // graphiques
  "cyan-fond": "#0f2230",        // fond d'encart cyan
  "orange": "#ff9d3b",           // énergie, action principale
  "orange-graphe": "#d9701a",    // graphiques
  "orange-fond": "#22170c",      // fond d'encart orange
  "orange-ombre": "#7a3f0a",     // ombre pixel des boutons orange
  "texte-sur-orange": "#d8c9b4", // texte dans un encart orange
});
