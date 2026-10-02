import { toutAcheter } from "../../src/sim/machines.js";

// Les stratégies du joueur automatique. Une stratégie reçoit l'état, agit
// comme le ferait un joueur — en appelant les fonctions du jeu, jamais en
// recalculant un prix, une production ou un seuil — et rend le nombre
// d'unités achetées.
//
// Tout lot qui ajoute une mécanique ajoute ici sa stratégie : le lot FROID
// ajoutera « refroidir dès que le seuil est atteint ».

// Le joueur du lot MACHINES : il appuie sur « Tout acheter » à chaque
// décision.
export function machines(etat) {
  return toutAcheter(etat);
}

// La phrase dit, pour Ethan, ce que fait la stratégie : elle entre telle
// quelle dans l'en-tête de la mesure.
export const STRATEGIES = {
  machines: {
    agir: machines,
    phrase:
      "à chaque décision, le joueur achète tout ce que son énergie paie, " +
      "de la machine la plus chère à la moins chère, lot par lot.",
  },
};
