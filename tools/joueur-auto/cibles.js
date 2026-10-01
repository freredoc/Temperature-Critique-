// Les cibles du plan, repère par repère, avec leur source et le lot qui les
// rendra mesurables. `mesure` nomme ce que le joueur automatique sait déjà
// relever ; `null` veut dire « pas encore mesurable ».
//
// Les paliers supposent la règle du plan §6.2 : retour à 10 J et zéro
// machine, ×2 cumulatif par palier, une machine de plus.
//
// `cibleMs` : une durée à atteindre, jugée à ±20 % (plan §14).
// `plafondMs` : une durée à ne pas dépasser.
export const CIBLES = [
  {
    repere: "Seuil du palier 1 (10⁹ J), partie neuve, 4 machines",
    cible: "223,5 s",
    cibleMs: 223500,
    source: "simulation du 23/09 (plan v1 §6.2)",
    lot: "ce lot",
    mesure: "palier1",
    // La décade qui fait le seuil : 10⁹ J.
    exposant: 9,
  },
  {
    repere: "Plus long écart sans achat possible",
    cible: "plafond 31 s",
    plafondMs: 31000,
    source: "plan §6.5",
    lot: "ce lot",
    mesure: "ecartSansAchat",
  },
  { repere: "Palier 2 atteint", cible: "8 min 58 s", source: "simulation du 23/09", lot: "FROID (lot 4)", mesure: null },
  { repere: "Palier 3 atteint", cible: "14 min 42 s", source: "simulation du 23/09", lot: "FROID", mesure: null },
  { repere: "Palier 4 atteint", cible: "21 min 41 s", source: "simulation du 23/09", lot: "FROID", mesure: null },
  {
    repere: "Palier 5 atteint, transition du plomb",
    cible: "29 min 11 s",
    source: "plan §6.5",
    lot: "FROID, puis SUPRA (lot 5)",
    mesure: null,
  },
  { repere: "Palier 6 atteint", cible: "~35 min 36 s", source: "simulation du 23/09", lot: "FROID", mesure: null },
  { repere: "Premier matériau (NbTi)", cible: "35,6 min", source: "plan v1 §6.2", lot: "SUPRA", mesure: null },
  { repere: "Un nouveau matériau toutes les…", cible: "34 à 52 min", source: "plan §6.5", lot: "SUPRA", mesure: null },
  { repere: "Le Graal", cible: "~5 h (301,4 min)", source: "plan §6.5", lot: "SUPRA", mesure: null },
  { repere: "Couche 1 entière", cible: "~5 h", source: "plan §4.1", lot: "SUPRA", mesure: null },
];

// Au-delà de cet écart relatif, une durée est « hors cible » (plan §14).
export const TOLERANCE_POUR_MILLE = 200;
