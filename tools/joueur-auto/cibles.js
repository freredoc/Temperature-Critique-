// Les cibles du plan, repère par repère, avec leur source et le lot qui les
// rendra mesurables. `mesure` nomme ce que le joueur automatique sait déjà
// relever ; `null` veut dire « pas encore mesurable ».
//
// Les paliers suivent la règle du plan §6.2, celle du lot FROID : retour à
// 10 J et zéro machine, ×2 cumulatif par palier, une machine de plus. Un
// palier se lit au refroidissement, quand le joueur appuie, et non plus à la
// décade de son seuil.
//
// `cibleMs` : une durée à atteindre, jugée à ±20 % (plan §14).
// `plafondMs` : une durée à ne pas dépasser.
export const CIBLES = [
  { repere: "Palier 1 atteint", cible: "223,5 s", cibleMs: 223_500, source: "simulation du 23/09", mesure: "palier", palier: 1 },
  { repere: "Palier 2 atteint", cible: "8 min 58 s", cibleMs: 538_000, source: "simulation du 23/09", mesure: "palier", palier: 2 },
  { repere: "Palier 3 atteint", cible: "14 min 42 s", cibleMs: 882_000, source: "simulation du 23/09", mesure: "palier", palier: 3 },
  { repere: "Palier 4 atteint", cible: "21 min 41 s", cibleMs: 1_301_000, source: "simulation du 23/09", mesure: "palier", palier: 4 },
  { repere: "Palier 5 atteint", cible: "29 min 11 s", cibleMs: 1_751_000, source: "plan §6.5", mesure: "palier", palier: 5 },
  {
    repere: "Plus long écart entre deux achats d'un même palier",
    cible: "plafond 31 s",
    plafondMs: 31_000,
    source: "plan §6.5",
    mesure: "ecartEntreAchats",
  },
  {
    repere: "Palier 6 atteint",
    cible: "~35 min 36 s",
    source: "simulation du 23/09",
    lot: "SUPRA (lot 5)",
    mesure: null,
    // Le palier 6 se mesure (tableau des paliers), mais sans verdict :
    palier: 6,
    pourquoi: "sa cible supposait le ×10 de la supraconductivité, qui n'existe pas encore",
  },
  { repere: "Premier matériau (NbTi)", cible: "35,6 min", source: "plan v1 §6.2", lot: "SUPRA", mesure: null },
  { repere: "Un nouveau matériau toutes les…", cible: "34 à 52 min", source: "plan §6.5", lot: "SUPRA", mesure: null },
  { repere: "Le Graal", cible: "~5 h (301,4 min)", source: "plan §6.5", lot: "SUPRA", mesure: null },
  { repere: "Couche 1 entière", cible: "~5 h", source: "plan §4.1", lot: "SUPRA", mesure: null },
];

// Au-delà de cet écart relatif, une durée est « hors cible » (plan §14).
export const TOLERANCE_POUR_MILLE = 200;
