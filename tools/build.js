// Construit dist/index.html : UN seul fichier, qui marche hors ligne et sans
// aucune requête réseau. JavaScript bundlé par esbuild (IIFE, es2020, non
// minifié), CSS, polices en base64 et licences inlinés, version et build
// injectés depuis package.json.
//
// Le build se garde lui-même : il échoue si le fichier charge quoi que ce
// soit depuis le réseau, s'il embarque deux copies de break_infinity.js, ou
// si une couleur hors palette apparaît dans le code.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import * as esbuild from "esbuild";

import { PALETTE } from "../src/data/palette.js";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const SORTIE = join(RACINE, "dist", "index.html");
const lire = (chemin) => readFileSync(join(RACINE, chemin), "utf8");

// Sous-ensemble `latin` seulement : il contient tous les accents du français
// et œ ² ³ × − · … « » ’ ; `latin-ext` n'ajoute aucun symbole qui nous manque.
const POLICES = [
  { famille: "VT323", poids: 400, fichier: "node_modules/@fontsource/vt323/files/vt323-latin-400-normal.woff2" },
  { famille: "Pixelify Sans", poids: 400, fichier: "node_modules/@fontsource/pixelify-sans/files/pixelify-sans-latin-400-normal.woff2" },
  { famille: "Pixelify Sans", poids: 700, fichier: "node_modules/@fontsource/pixelify-sans/files/pixelify-sans-latin-700-normal.woff2" },
];

// Ce qu'un fichier hors ligne ne doit jamais contenir. Les URL du TEXTE des
// licences restent permises : elles ne chargent rien.
const INTERDITS = [
  [/\b(?:src|href)\s*=\s*["']?\s*(?:https?:)?\/\//i, "une ressource chargée depuis le réseau (src= ou href=)"],
  [/url\(\s*["']?\s*(?:https?:)?\/\//i, "une ressource chargée depuis le réseau (url())"],
  [/@import/i, "un @import"],
];

export async function construire() {
  const paquet = JSON.parse(lire("package.json"));
  const gabarit = lire("src/index.html");
  const css = lire("src/ui/theme.css");
  verifierCouleurs(css, gabarit);

  const bundle = await esbuild.build({
    entryPoints: [join(RACINE, "src", "main.js")],
    bundle: true,
    format: "iife",
    target: "es2020",
    platform: "browser",
    minify: false,
    charset: "utf8",
    write: false,
    metafile: true,
    logLevel: "silent",
    define: {
      __VERSION__: JSON.stringify(paquet.version),
      __BUILD__: JSON.stringify(paquet.config.build),
    },
  });
  const modules = Object.keys(bundle.metafile.inputs);
  const copies = modules.filter((m) => m.includes("node_modules/break_infinity.js/"));
  if (copies.length !== 1) {
    throw new Error(`il faut UNE copie de break_infinity.js dans le bundle, il y en a ${copies.length} :\n  ${copies.join("\n  ")}`);
  }
  // Rien, dans le code, ne doit pouvoir fermer la balise <script>.
  const js = bundle.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");
  if (js.includes("<!--")) throw new Error("le JavaScript contient « <!-- », qui trouble l'analyse d'un <script> inliné");

  const policesCss = POLICES.map(({ famille, poids, fichier }) => {
    const base64 = readFileSync(join(RACINE, fichier)).toString("base64");
    return `@font-face{font-family:"${famille}";font-style:normal;font-weight:${poids};font-display:block;`
      + `src:url(data:font/woff2;base64,${base64}) format("woff2")}`;
  }).join("\n");
  const base64Polices = POLICES.reduce((total, { fichier }) => total + Math.ceil(readFileSync(join(RACINE, fichier)).length / 3) * 4, 0);

  // Les licences, en texte : les lignes de clôture ``` du Markdown sont
  // retirées pour l'affichage, et « < » est échappé pour que rien ne puisse
  // fermer le <script> qui les porte.
  const texteLicences = lire("LICENCES-TIERCES.md").replace(/^```[a-z]*\n/gm, "");
  const licences = JSON.stringify(texteLicences).replace(/</g, "\\u003c");

  const html = remplir(gabarit, {
    "@@STYLE@@": `${policesCss}\n${css}`,
    "@@LICENCES@@": licences,
    "@@SCRIPT@@": js,
  });

  for (const [motif, quoi] of INTERDITS) {
    const trouve = html.match(motif);
    if (trouve) {
      const avant = html.slice(Math.max(0, trouve.index - 60), trouve.index + 60).replace(/\s+/g, " ");
      throw new Error(`dist/index.html contient ${quoi} : « ${avant} »`);
    }
  }

  mkdirSync(dirname(SORTIE), { recursive: true });
  writeFileSync(SORTIE, html);

  const octets = (texte) => Buffer.byteLength(texte, "utf8");
  const postes = {
    javascript: octets(js),
    css: octets(css),
    polices: octets(policesCss),
    licences: octets(licences),
  };
  postes.balisage = octets(html) - Object.values(postes).reduce((a, b) => a + b, 0);
  return { total: octets(html), postes, base64Polices, modules, version: paquet.version, build: paquet.config.build };
}

// Remplace chaque marqueur, présent exactement une fois. Une fonction de
// remplacement : un « $& » dans le code ne doit pas être interprété.
function remplir(gabarit, valeurs) {
  let html = gabarit;
  for (const [marqueur, valeur] of Object.entries(valeurs)) {
    const n = html.split(marqueur).length - 1;
    if (n !== 1) throw new Error(`le gabarit doit contenir ${marqueur} une fois, pas ${n}`);
    html = html.replace(marqueur, () => valeur);
  }
  return html;
}

// Les 16 couleurs de src/data/palette.js, et aucune autre.
function verifierCouleurs(css, gabarit) {
  for (const [nom, hex] of Object.entries(PALETTE)) {
    const m = css.match(new RegExp(`--${nom}:\\s*(#[0-9a-fA-F]{6})\\s*;`));
    if (!m || m[1].toLowerCase() !== hex) {
      throw new Error(`theme.css : --${nom} doit valoir ${hex} (src/data/palette.js), trouvé ${m ? m[1] : "rien"}`);
    }
  }
  const permises = new Set(Object.values(PALETTE));
  const sources = [["src/ui/theme.css", css], ["src/index.html", gabarit]];
  for (const chemin of fichiersJs(join(RACINE, "src"))) {
    sources.push([relative(RACINE, chemin).replaceAll("\\", "/"), readFileSync(chemin, "utf8")]);
  }
  for (const [chemin, texte] of sources) {
    for (const m of texte.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
      if (!permises.has(m[0].toLowerCase())) throw new Error(`${chemin} : la couleur ${m[0]} n'est pas dans la palette`);
    }
    const fonction = texte.match(/\b(?:rgba?|hsla?)\(/i);
    if (fonction) throw new Error(`${chemin} : couleur ${fonction[0]}…) hors palette ; utiliser var(--…)`);
  }
}

function fichiersJs(dossier) {
  return readdirSync(dossier, { withFileTypes: true }).flatMap((entree) => {
    const chemin = join(dossier, entree.name);
    if (entree.isDirectory()) return fichiersJs(chemin);
    return entree.name.endsWith(".js") ? [chemin] : [];
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const { total, postes, base64Polices, version, build } = await construire();
    const ligne = (nom, n) => `  ${nom.padEnd(12)}${String(n).padStart(9)} octets`;
    console.log(`build : dist/index.html, version ${version} · build ${build}`);
    for (const [nom, n] of Object.entries(postes)) console.log(ligne(nom, n));
    console.log(ligne("= total", total));
    console.log(`  (polices : ${base64Polices} octets de base64 pour 3 fichiers woff2)`);
  } catch (e) {
    console.error(`build : ÉCHEC — ${e.message}`);
    process.exit(1);
  }
}
