import { mesurerHorsLigne } from "./horsligne.js";
import { jouer } from "./partie.js";
import { rediger } from "./rapport.js";

// Une mesure complète : une partie, puis le hors ligne à chaque instantané
// atteint et pour chaque absence, puis le texte.
//
// Rien ne sort d'ici que le texte, et rien n'y entre que les options et
// l'entête : deux appels avec les mêmes arguments rendent le même texte.
//
// options : celles de `jouer`, plus `absences` (en ms, multiples de PAS_MS).
// entete : { version, build }, pour la première ligne du texte.
export function mesurer(options, entete) {
  const resultats = jouer(options);
  const horsLigne = [];
  for (const instantane of resultats.instantanes) {
    if (instantane.ms === null) continue;
    // Les machines qui tournent à cet instant : celles qu'on possède.
    const machinesEnMarche = instantane.etat.machines.filter((m) => m.quantite.gt(0)).length;
    const palier = instantane.etat.froid.palier;
    for (const absenceMs of options.absences ?? []) {
      const { gainRattrape, gainPasAPas } = mesurerHorsLigne(instantane.etat, absenceMs);
      horsLigne.push({
        seuil: instantane.seuil,
        ms: instantane.ms,
        palier,
        machinesEnMarche,
        absenceMs,
        gainRattrape,
        gainPasAPas,
      });
    }
  }
  return rediger({ ...resultats, options, horsLigne }, entete);
}
