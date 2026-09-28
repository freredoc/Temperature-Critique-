import { produire } from "./machines.js";

// La seule fonction qui fait avancer le temps du jeu. La boucle, le
// rattrapage hors ligne et les sauts du mode test passent tous par elle.
// Chaque lot futur branche sa mécanique ici, et nulle part ailleurs.
export function avancer(etat, dtMs) {
  produire(etat, dtMs);
  etat.temps.totalMs += dtMs;
}
