// Les huit machines de la cascade. Chacune produit la précédente ; la
// première produit l'énergie.
//
// Coûts de base et facteurs : ceux d'Antimatter Dimensions (MIT, © 2017 IvarK),
// BASE_COSTS et BASE_COST_MULTIPLIERS de src/core/dimensions/antimatter-dimension.js
// (lignes 337 et 339), relevés le 23/09/2026 et revérifiés le 27/09 :
// https://github.com/IvarK/AntimatterDimensionsSourceCode
//
// Les nombres sont écrits en texte et ne deviennent des Decimal qu'une fois,
// dans src/sim/machines.js. Les noms 6 et 7 sont une proposition, en attente
// d'Ethan : aucun nom de machine n'est écrit ailleurs dans le code.
export const MACHINES = [
  { id: 1, nom: "Dynamo",        pluriel: "dynamos",        cout: "10",   facteur: "1e3"  },
  { id: 2, nom: "Alternateur",   pluriel: "alternateurs",   cout: "100",  facteur: "1e4"  },
  { id: 3, nom: "Turbine",       pluriel: "turbines",       cout: "1e4",  facteur: "1e5"  },
  { id: 4, nom: "Centrale",      pluriel: "centrales",      cout: "1e6",  facteur: "1e6"  },
  { id: 5, nom: "Réseau",        pluriel: "réseaux",        cout: "1e9",  facteur: "1e8"  },
  { id: 6, nom: "Cyclotron",     pluriel: "cyclotrons",     cout: "1e13", facteur: "1e10" },
  { id: 7, nom: "Synchrotron",   pluriel: "synchrotrons",   cout: "1e18", facteur: "1e12" },
  { id: 8, nom: "Collisionneur", pluriel: "collisionneurs", cout: "1e24", facteur: "1e15" },
];

// Tous les TAILLE_LOT achats d'une machine, sa production est multipliée par
// MULTIPLICATEUR_LOT et son prix par son facteur.
export const TAILLE_LOT = 10;
export const MULTIPLICATEUR_LOT = 2;

// Combien de machines ce lot débloque. Les suivantes arrivent avec les
// paliers de froid.
export const MACHINES_AU_DEPART = 4;
