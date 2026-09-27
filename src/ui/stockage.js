// La seule porte vers localStorage pour la sauvegarde. Chaque fonction rend
// { ok, … } et ne lève jamais : un navigateur peut refuser le stockage
// (navigation privée, quota plein), et le jeu doit pouvoir le dire.
const CLE = "temperature-critique:sauvegarde";
const PREFIXE_ILLISIBLE = "temperature-critique:sauvegarde-illisible:";

export function lireSauvegarde() {
  try {
    return { ok: true, texte: localStorage.getItem(CLE) };
  } catch (e) {
    return { ok: false, erreur: `le stockage du navigateur est inaccessible (${e.message})` };
  }
}

export function ecrireSauvegarde(texte) {
  try {
    localStorage.setItem(CLE, texte);
    return { ok: true };
  } catch (e) {
    return { ok: false, erreur: `le navigateur refuse l'écriture (${e.message})` };
  }
}

// Copie une sauvegarde illisible telle quelle sous une clé horodatée, pour
// que rien ne s'efface en silence.
export function mettreDeCote(texte, horodatage) {
  const cle = PREFIXE_ILLISIBLE + horodatage;
  try {
    localStorage.setItem(cle, texte);
    return { ok: true, cle };
  } catch (e) {
    return { ok: false, erreur: `impossible de la mettre de côté (${e.message})` };
  }
}
