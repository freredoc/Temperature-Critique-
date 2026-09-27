// Constantes du socle. Toutes les durées sont en millisecondes entières.

// Pas fixe de la simulation : `avancer` reçoit PAS_MS à chaque pas normal.
export const PAS_MS = 50;

// Un rattrapage (hors ligne, retour au premier plan, saut du mode test) se
// fait en au plus MAX_PAS_RATTRAPAGE appels à `avancer`, quelle que soit la
// durée : il n'y a pas de plafond de durée (règle P6 du plan).
export const MAX_PAS_RATTRAPAGE = 1000;

// Au-delà de PAS_MS × MAX_PAS_PAR_IMAGE écoulées en une seule image (onglet
// revenu, vitesse ×1000), la boucle passe par `rattraper`.
export const MAX_PAS_PAR_IMAGE = 100;

export const AUTOSAUVEGARDE_MS = 10000;

// Au-delà de cette absence, le bandeau « Tu étais absent … » s'affiche.
export const SEUIL_ABSENCE_MS = 60000;
