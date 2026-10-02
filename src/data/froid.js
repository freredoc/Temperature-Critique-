// Les paliers de froid (plan §6.2). Les températures sont celles des vrais
// fluides : sublimation du CO₂, ébullition de l'azote, du néon, de
// l'hydrogène et de l'hélium à pression ambiante, hélium pompé.
// `seuil` : l'énergie qu'il faut pour descendre À ce palier.
export const PALIERS = [
  { palier: 0, technique: "Ambiante",          kelvins: 300 },
  { palier: 1, technique: "Glace carbonique",  kelvins: 194.65, seuil: "1e9"  },
  { palier: 2, technique: "Azote liquide",     kelvins: 77.36,  seuil: "1e15" },
  { palier: 3, technique: "Néon liquide",      kelvins: 27.1,   seuil: "1e22" },
  { palier: 4, technique: "Hydrogène liquide", kelvins: 20.28,  seuil: "1e30" },
  { palier: 5, technique: "Hélium liquide",    kelvins: 4.22,   seuil: "1e39" },
  { palier: 6, technique: "Hélium pompé",      kelvins: 1.5,    seuil: "1e44" },
];
export const MULTIPLICATEUR_PALIER = 2;   // toutes les machines, cumulatif
export const ENERGIE_APRES_PALIER = "10";
