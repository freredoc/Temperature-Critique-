// Le seul fichier impur du joueur automatique : il lit la version dans
// package.json, écrit mesures/MESURE.md et affiche la durée d'exécution.
// Cette durée ne va QUE dans la console : le texte versionné n'en porte
// aucune, pour que deux mesures des mêmes règles donnent le même fichier.
//
// `npm run mesure`. Hors de `npm run check`, délibérément : une partie de
// 10⁹ J et neuf comparaisons de hors ligne prennent quelques secondes.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { performance } from "node:perf_hooks";
import { fileURLToPath } from "node:url";
import { mesurer } from "./mesurer.js";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

// Les options de référence (brief JOUEUR-AUTO §4.1). Les changer change la
// mesure : un lot qui le fait le dit dans son rapport.
export const OPTIONS_DE_REFERENCE = {
  strategie: "machines",
  cadenceMs: 250,
  jusqua: "1e9",
  dureeMaxMs: 7_200_000,
  instantanes: ["1e3", "1e6", "1e9"],
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
