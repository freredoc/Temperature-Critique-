import { Decimal } from "./nombre.js";

// L'état complet d'une partie : tout ce qui se sauvegarde.
// Quantités de jeu : des Decimal. Durées : des Number en millisecondes
// entières. `creeLe` arrive en argument : src/sim ne lit jamais l'horloge.
export function etatInitial(creeLe) {
  return {
    meta: { creeLe, modeTestUtilise: false },
    temps: { totalMs: 0 },
    energie: new Decimal(10),
  };
}
