// Le seul fichier impur du joueur automatique : il lit la version dans
// package.json, écrit mesures/MESURE.md et affiche la durée d'exécution.
// Cette durée ne va QUE dans la console : le texte versionné n'en porte
// aucune, pour que deux mesures des mêmes règles donnent le même fichier.
//
// `npm run mesure`. Hors de `npm run check`, délibérément : une partie
// jusqu'au palier 6 et douze comparaisons de hors ligne, dont celles d'un
// jour entier avec huit machines, prennent une demi-minute.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { performance } from "node:perf_hooks";
import { fileURLToPath } from "node:url";
import { mesurer } from "./mesurer.js";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

// Les options de référence (brief FROID §6.3). Les changer change la
// mesure : un lot qui le fait le dit dans son rapport.
//
// Les instantanés tombent juste avant les paliers 1, 2, 4 et 6, avec 4, 5, 7
// puis 8 machines en marche.
export const OPTIONS_DE_REFERENCE = {
  strategie: "froid",
  cadenceMs: 250,
  jusquaPalier: 6,
  dureeMaxMs: 7_200_000,
  instantanes: ["1e9", "1e15", "1e30", "1e44"],
  absences: [3_600_000, 28_800_000, 86_400_000],
};

const paquet = JSON.parse(readFileSync(join(RACINE, "package.json"), "utf8"));
const entete = { version: paquet.version, build: paquet.config.build };

const debut = performance.now();
const texte = mesurer(OPTIONS_DE_REFERENCE, entete);
const duree = performance.now() - debut;

const dossier = join(RACINE, "mesures");
mkdirSync(dossier, { recursive: true });
writeFileSync(join(dossier, "MESURE.md"), texte.endsWith("\n") ? texte : `${texte}\n`);

console.log(texte);
console.log(`(mesure écrite dans mesures/MESURE.md en ${(duree / 1000).toFixed(1)} s)`);
