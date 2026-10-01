import { PAS_MS } from "../../src/data/constantes.js";
import { avancer } from "../../src/sim/avancer.js";
import { rattraper } from "../../src/sim/rattrapage.js";
import { deserialiser, serialiser } from "../../src/sim/sauvegarde.js";

// Ce que le jeu rend après une absence de `ms`, comparé à ce qu'il aurait
// produit si l'appli était restée ouverte sans le joueur.
//
// - `gainRattrape` : l'énergie gagnée par `rattraper`, le chemin que prend
//   le jeu quand on revient (1000 grands pas au plus) ;
// - `gainPasAPas` : l'énergie gagnée par `avancer` au pas du jeu, PAS_MS
//   après PAS_MS, comme la boucle d'une appli restée ouverte.
//
// Aucun achat pendant l'absence, des deux côtés. L'état reçu n'est pas
// touché : chaque côté travaille sur sa propre copie.
export function mesurerHorsLigne(etat, ms) {
  if (!Number.isSafeInteger(ms) || ms <= 0 || ms % PAS_MS !== 0) {
    throw new RangeError(`hors ligne : l'absence doit être un multiple entier de ${PAS_MS} ms (reçu ${ms})`);
  }
  const rattrape = cloner(etat);
  rattraper(rattrape, ms);

  const ouvert = cloner(etat);
  const pas = ms / PAS_MS;
  for (let i = 0; i < pas; i++) avancer(ouvert, PAS_MS);

  return {
    gainRattrape: rattrape.energie.minus(etat.energie),
    gainPasAPas: ouvert.energie.minus(etat.energie),
  };
}

function cloner(etat) {
  return deserialiser(serialiser(etat));
}
