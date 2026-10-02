// Garde (pas un test) : src/sim/ est de la logique pure. Le temps lui arrive
// en argument ; elle ne touche ni au navigateur, ni à l'horloge, ni au hasard.
// C'est ce qui la fait tourner sous Node pour les tests et le joueur
// automatique. `npm run check` échoue au premier nom interdit trouvé hors
// commentaire.
//
// Depuis le lot JOUEUR-AUTO, elle garde aussi tools/joueur-auto/, sauf
// lancer.js, qui est le seul fichier impur du joueur (il lit l'horloge et
// écrit sur le disque). Pour ces fichiers-là, deux règles de plus : `process`
// est interdit, et un import ne peut venir que du joueur lui-même, de src/sim/,
// de src/data/ ou de src/ui/format.js.
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const DOSSIER = join(RACINE, "src", "sim");
const JOUEUR = join(RACINE, "tools", "joueur-auto");
const LANCEUR = join(JOUEUR, "lancer.js");

// Les six noms du brief SOCLE (Date couvre Date.now et new Date), plus les
// autres portes vers le navigateur, l'horloge et le hasard.
const INTERDITS = [
  ["window", /\bwindow\b/],
  ["document", /\bdocument\b/],
  ["localStorage", /\blocalStorage\b/],
  ["sessionStorage", /\bsessionStorage\b/],
  ["Date (Date.now, new Date)", /\bDate\b/],
  ["performance", /\bperformance\b/],
  ["Math.random", /\bMath\s*\.\s*random\b/],
  ["crypto", /\bcrypto\b/],
  ["navigator", /\bnavigator\b/],
  ["globalThis", /\bglobalThis\b/],
  ["requestAnimationFrame", /\brequestAnimationFrame\b/],
  ["setTimeout", /\bsetTimeout\b/],
  ["setInterval", /\bsetInterval\b/],
];

// Remplace les commentaires par des blancs (les sauts de ligne restent, pour
// que les numéros de ligne tombent juste). Les chaînes, les gabarits et les
// expressions régulières sont sautés, pour ne pas prendre un « // » qu'ils
// contiennent pour un commentaire.
function sansCommentaires(source) {
  let sortie = "";
  let i = 0;
  let precedent = ""; // dernier caractère significatif hors commentaire
  const copier = (j) => {
    sortie += source.slice(i, j);
    i = j;
  };
  while (i < source.length) {
    const c = source[i];
    const d = source[i + 1];
    if (c === "/" && d === "/") {
      while (i < source.length && source[i] !== "\n") i++;
    } else if (c === "/" && d === "*") {
      const fin = source.indexOf("*/", i + 2);
      const j = fin === -1 ? source.length : fin + 2;
      sortie += source.slice(i, j).replace(/[^\n]/g, " ");
      i = j;
    } else if (c === '"' || c === "'" || c === "`") {
      let j = i + 1;
      while (j < source.length && source[j] !== c) j += source[j] === "\\" ? 2 : 1;
      copier(j + 1);
      precedent = c;
    } else if (c === "/" && (precedent === "" || "(,=:[!&|?{};+-*%<>~^".includes(precedent))) {
      // Expression régulière littérale : jusqu'au « / » fermant hors classe.
      let j = i + 1;
      let classe = false;
      while (j < source.length && source[j] !== "\n") {
        if (source[j] === "\\") j++;
        else if (source[j] === "[") classe = true;
        else if (source[j] === "]") classe = false;
        else if (source[j] === "/" && !classe) break;
        j++;
      }
      copier(j + 1);
      precedent = "/";
    } else {
      if (!/\s/.test(c)) precedent = c;
      copier(i + 1);
    }
  }
  return sortie;
}

function fichiersJs(dossier) {
  return readdirSync(dossier, { withFileTypes: true }).flatMap((entree) => {
    const chemin = join(dossier, entree.name);
    if (entree.isDirectory()) return fichiersJs(chemin);
    return entree.name.endsWith(".js") ? [chemin] : [];
  });
}

// Les imports permis au joueur automatique. Le chemin est RÉSOLU avant d'être
// jugé : « ./../../src/ui/ecran.js » commence par « ./ » et sort pourtant du
// joueur. lancer.js est exclu même en import : un fichier gardé qui
// l'importerait ferait entrer l'horloge et le disque par la porte d'à côté.
function importPermis(depuis, specificateur) {
  if (!specificateur.startsWith("./") && !specificateur.startsWith("../")) return false;
  const cible = resolve(dirname(depuis), specificateur);
  const dans = (dossier) => cible.startsWith(dossier + sep);
  if (dans(JOUEUR)) return cible !== LANCEUR;
  if (dans(join(RACINE, "src", "sim")) || dans(join(RACINE, "src", "data"))) return true;
  return cible === join(RACINE, "src", "ui", "format.js");
}

// Les imports d'une ligne décommentée : « from "x" », « import "x" » et
// « import("x") ». Un import dynamique dont l'argument n'est pas une chaîne
// écrite en toutes lettres ne se juge pas : il est refusé.
function importsDeLaLigne(ligne) {
  const trouves = [];
  for (const m of ligne.matchAll(/\bfrom\s*(["'])([^"']*)\1/g)) trouves.push(m[2]);
  for (const m of ligne.matchAll(/(?:^|[;{}]\s*)import\s*(["'])([^"']*)\1/g)) trouves.push(m[2]);
  for (const m of ligne.matchAll(/\bimport\s*\(\s*(?:(["'])([^"']*)\1\s*\))?/g)) {
    trouves.push(m[2] ?? "(import dynamique non littéral)");
  }
  return trouves;
}

function echouer(fichier, n, ligne, message, explication) {
  const ou = `${relative(RACINE, fichier).replaceAll("\\", "/")}:${n + 1}`;
  console.error(`garde-sim : ${message} (${ou})`);
  console.error(`  ${ligne.trim()}`);
  console.error(`  ${explication}`);
  process.exit(1);
}

const gardes = [
  ...fichiersJs(DOSSIER).map((fichier) => ({ fichier, joueur: false })),
  ...fichiersJs(JOUEUR)
    .filter((fichier) => fichier !== LANCEUR)
    .map((fichier) => ({ fichier, joueur: true })),
];
const PROCESS = ["process", /\bprocess\b/];

for (const { fichier, joueur } of gardes) {
  const dossier = joueur ? "tools/joueur-auto/" : "src/sim/";
  const explication = joueur
    ? "tools/joueur-auto/ joue la simulation pure ; seul lancer.js touche à l'horloge et au disque."
    : "src/sim/ reçoit le temps en argument et ne touche jamais au navigateur.";
  const interdits = joueur ? [...INTERDITS, PROCESS] : INTERDITS;
  const lignes = sansCommentaires(readFileSync(fichier, "utf8")).split("\n");
  for (const [n, ligne] of lignes.entries()) {
    for (const [nom, motif] of interdits) {
      if (motif.test(ligne)) echouer(fichier, n, ligne, `« ${nom} » interdit dans ${dossier}`, explication);
    }
    if (!joueur) continue;
    for (const specificateur of importsDeLaLigne(ligne)) {
      if (!importPermis(fichier, specificateur)) {
        echouer(
          fichier,
          n,
          ligne,
          `import « ${specificateur} » interdit dans tools/joueur-auto/`,
          "Seuls ./…, ../../src/sim/…, ../../src/data/… et ../../src/ui/format.js sont permis.",
        );
      }
    }
  }
}
console.log(`garde-sim : src/sim/ et tools/joueur-auto/ sont purs (${gardes.length} fichiers lus).`);
