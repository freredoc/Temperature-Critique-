// Garde (pas un test) : src/sim/ est de la logique pure. Le temps lui arrive
// en argument ; elle ne touche ni au navigateur, ni à l'horloge, ni au hasard.
// C'est ce qui la fait tourner sous Node pour les tests et le joueur
// automatique. `npm run check` échoue au premier nom interdit trouvé hors
// commentaire.
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const DOSSIER = join(RACINE, "src", "sim");

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

const fichiers = fichiersJs(DOSSIER);
for (const fichier of fichiers) {
  const lignes = sansCommentaires(readFileSync(fichier, "utf8")).split("\n");
  for (const [n, ligne] of lignes.entries()) {
    for (const [nom, motif] of INTERDITS) {
      if (motif.test(ligne)) {
        const ou = `${relative(RACINE, fichier).replaceAll("\\", "/")}:${n + 1}`;
        console.error(`garde-sim : « ${nom} » interdit dans src/sim/ (${ou})`);
        console.error(`  ${ligne.trim()}`);
        console.error("  src/sim/ reçoit le temps en argument et ne touche jamais au navigateur.");
        process.exit(1);
      }
    }
  }
}
console.log(`garde-sim : src/sim/ est pur (${fichiers.length} fichiers lus).`);
