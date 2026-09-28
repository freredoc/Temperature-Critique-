// Vérification sans écran (npm run voir) : construit le jeu, le sert en HTTP
// local (pas file://), puis joue le scénario du brief SOCLE dans Chromium,
// en 360 × 780 à DPR 3 (le S25 FE d'Ethan), avec de vrais clics à la souris.
// Captures dans captures/ (ignoré par git).
//
// Premier lancement : npx playwright install chromium
import { mkdirSync, readFileSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";

import { construire } from "./build.js";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const CAPTURES = join(RACINE, "captures");
const CLE = "temperature-critique:sauvegarde";
// La ligne de version se lit dans package.json, jamais recopiée : un bump ne
// doit pas faire tomber ce scénario.
const PAQUET = JSON.parse(readFileSync(join(RACINE, "package.json"), "utf8"));
const VERSION = `${PAQUET.version} · build ${PAQUET.config.build}`;
const NBSP = / /g;

const { total } = await construire();
console.log(`build : dist/index.html, ${total} octets`);
const html = readFileSync(join(RACINE, "dist", "index.html"));

// « / » sert le jeu ; « /atelier » est une page vide de même origine, qui
// permet de toucher au stockage sans que le jeu tourne (et ne réécrive).
const serveur = createServer((requete, reponse) => {
  const chemin = new URL(requete.url, "http://x").pathname;
  if (chemin === "/" || chemin === "/atelier") {
    reponse.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    reponse.end(chemin === "/" ? html : "<!doctype html><title>atelier</title>");
  } else if (chemin === "/favicon.ico") {
    // Le Chromium complet demande l'icône de lui-même, le « headless shell »
    // non : un 404 ici serait une erreur console qui ne vient pas du jeu.
    reponse.writeHead(204);
    reponse.end();
  } else {
    reponse.writeHead(404);
    reponse.end();
  }
});
await new Promise((ok) => serveur.listen(0, "127.0.0.1", ok));
const origine = `http://127.0.0.1:${serveur.address().port}`;

mkdirSync(CAPTURES, { recursive: true });
// TC_CHROMIUM : chemin d'un Chromium déjà installé, pour les machines où
// Playwright ne peut pas télécharger le sien (conteneur sans réseau sortant).
// Absente, rien ne change : c'est le navigateur de `npx playwright install`.
const navigateur = await chromium.launch(
  process.env.TC_CHROMIUM ? { executablePath: process.env.TC_CHROMIUM } : {},
);
const contexte = await navigateur.newContext({
  viewport: { width: 360, height: 780 },
  deviceScaleFactor: 3,
  isMobile: true,
  locale: "fr-FR",
});
const page = await contexte.newPage();
const erreurs = [];
const avertissements = [];
const horsOrigine = [];
page.on("console", (m) => {
  if (m.type() === "error") erreurs.push(m.text());
  if (m.type() === "warning") avertissements.push(m.text());
});
page.on("pageerror", (e) => erreurs.push(String(e)));
page.on("request", (r) => {
  if (!r.url().startsWith(origine) && !r.url().startsWith("data:")) horsOrigine.push(r.url());
});

const resultats = [];
async function etape(nom, action) {
  try {
    await action();
    resultats.push(`ok      ${nom}`);
    console.log(`ok      ${nom}`);
  } catch (e) {
    resultats.push(`ÉCHEC   ${nom} : ${e.message}`);
    console.log(`ÉCHEC   ${nom} : ${e.message}`);
    throw e;
  }
}
function egal(obtenu, attendu, quoi) {
  if (obtenu !== attendu) throw new Error(`${quoi} : attendu « ${attendu} », obtenu « ${obtenu} »`);
}

const energie = async () => (await page.locator(".energie").innerText()).replace(NBSP, " ");
const attendreEnergie = (texte) => page.waitForFunction(
  (t) => document.querySelector(".energie")?.innerText.replace(/ /g, " ") === t, texte, { timeout: 5000 },
);
const ouvrirOptions = () => page.getByRole("button", { name: "Options" }).click();
const fermerOptions = () => page.getByRole("button", { name: "Fermer", exact: true }).click();
const capture = async (nom, cible = page) => {
  await page.evaluate(() => document.fonts.ready);
  await cible.screenshot({ path: join(CAPTURES, nom) });
};
// Texte d'un élément, espaces insécables ramenées à des espaces.
const texteDe = async (selecteur) => (await page.locator(selecteur).innerText()).replace(NBSP, " ");
const attendreTexte = (selecteur, texte) => page.waitForFunction(
  ([s, t]) => document.querySelector(s)?.innerText.replace(/ /g, " ") === t,
  [selecteur, texte], { timeout: 5000 },
);
// Les numéros des cartes de machine visibles, « 1,2,3,4 ».
const cartesVisibles = async () => {
  const visibles = [];
  for (let n = 1; n <= 8; n++) {
    if (await page.locator(`[data-devoile="machine-${n}"]`).isVisible()) visibles.push(n);
  }
  return visibles.join(",");
};
// L'énergie affichée, en nombre (sous 1000 J seulement : trois décimales).
const nombreEnergie = async () => Number((await energie()).replace(" J", "").replace(",", "."));
// Deux images : ce qu'un geste a changé dans l'état est à l'écran.
const deuxImages = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
const carte = (n, partie) => `[data-devoile="machine-${n}"] .machine-${partie}`;
const toucherDynamo = () => page.locator(carte(1, "prix")).click();
async function energieDuModeTest(texte) {
  await ouvrirOptions();
  await page.locator("#champ-energie").fill(texte);
  await page.getByRole("button", { name: "Appliquer" }).click();
  await fermerOptions();
}
let dureeToutAcheter = null;

let code = "";
let echec = false;
try {
  await etape("1. chargement sans erreur", async () => {
    await page.goto(`${origine}/`);
    await attendreEnergie("10 J");
  });

  await etape("2. « 10 J » est visible", async () => {
    if (!(await page.locator(".energie").isVisible())) throw new Error("l'énergie n'est pas visible");
    egal(await energie(), "10 J", "écran principal");
    await capture("principal.png");
  });

  await etape(`3. ≡ ouvre les Options, version « ${VERSION} »`, async () => {
    await ouvrirOptions();
    await page.locator("#options").waitFor({ state: "visible" });
    egal(await page.locator("#ligne-version").innerText(), VERSION, "ligne de version");
    await capture("options.png");
  });

  await etape("4. 7 clics sur la version ouvrent le mode test", async () => {
    const version = page.locator("#ligne-version");
    for (let i = 0; i < 7; i++) await version.click();
    await page.locator("#mode-test").waitFor({ state: "visible" });
    if (!(await page.locator("#partie-de-test").isVisible())) throw new Error("« Partie de test » n'apparaît pas");
  });

  await etape("5. énergie 1e400 → « 1,00e400 J » sur l'écran principal", async () => {
    await page.locator("#champ-energie").click();
    await page.keyboard.type("1e400");
    await page.getByRole("button", { name: "Appliquer" }).click();
    await page.locator("#mode-test").evaluate((el) => el.scrollIntoView({ block: "start" }));
    await capture("mode-test.png");
    await capture("phrase-temoin.png", page.locator("#phrase-temoin"));
    await fermerOptions();
    await attendreEnergie("1,00e400 J");
    // Le nombre tient sur 360 px, sans défilement horizontal.
    const mesure = await page.evaluate(() => {
      const el = document.querySelector(".energie");
      const r = el.getBoundingClientRect();
      return { gauche: r.left, droite: r.right, pageLarge: document.documentElement.scrollWidth, fenetre: innerWidth };
    });
    if (mesure.gauche < 16 || mesure.droite > mesure.fenetre - 16 || mesure.pageLarge > mesure.fenetre) {
      throw new Error(`« 1,00e400 J » déborde : ${JSON.stringify(mesure)}`);
    }
  });

  await etape("6. « Sauvegarder », rechargement : toujours « 1,00e400 J »", async () => {
    await ouvrirOptions();
    await page.getByRole("button", { name: "Sauvegarder maintenant" }).click();
    egal(await page.locator("#message-sauvegarde").innerText(), "Sauvegardé.", "message");
    await page.reload();
    await attendreEnergie("1,00e400 J");
  });

  await etape("7. « Exporter » : le code commence par TC1.", async () => {
    await ouvrirOptions();
    await page.getByRole("button", { name: "Exporter" }).click();
    code = await page.locator("#code-export").inputValue();
    if (!code.startsWith("TC1.")) throw new Error(`code : « ${code.slice(0, 20)}… »`);
  });

  await etape("8. « Nouvelle partie » (deux touchers) : « 10 J », puis « Importer » : « 1,00e400 J »", async () => {
    const bouton = page.locator("#nouvelle-partie");
    await bouton.click();
    egal(await bouton.innerText(), "Toucher encore : tout effacer", "premier toucher");
    await bouton.click();
    await fermerOptions();
    await attendreEnergie("10 J");
    await ouvrirOptions();
    await page.locator("#code-import").click();
    await page.keyboard.insertText(code);
    await page.getByRole("button", { name: "Importer", exact: true }).click();
    egal(await page.locator("#message-import").innerText(), "Code importé : la partie est remplacée et sauvegardée.", "message");
    await fermerOptions();
    await attendreEnergie("1,00e400 J");
  });

  // --- Vérifications en plus du scénario du brief ------------------------

  await etape("+ « +1 h » : dernier rattrapage « 3 600 000 ms en 1000 pas »", async () => {
    await ouvrirOptions();
    await page.getByRole("button", { name: "+1 h" }).click();
    egal((await page.locator("#mesure-rattrapage").innerText()).replace(NBSP, " "), "3 600 000 ms en 1000 pas", "dernier rattrapage");
    await fermerOptions();
  });

  // Les chemins du chargement : on écrit le stockage depuis /atelier, où le
  // jeu ne tourne pas, puis on ouvre le jeu.
  const depuisAtelier = async (fonction, argument) => {
    await page.goto(`${origine}/atelier`);
    return page.evaluate(fonction, argument);
  };

  await etape("+ absence de 2 h : rattrapée au chargement, bandeau « Tu étais absent 2 h 0 min. »", async () => {
    const avant = await depuisAtelier((cle) => {
      const env = JSON.parse(localStorage.getItem(cle));
      env.sauveLe -= 2 * 3600 * 1000;
      localStorage.setItem(cle, JSON.stringify(env));
      return env.etat.temps.totalMs;
    }, CLE);
    await page.goto(`${origine}/`);
    await page.locator(".bandeau").first().waitFor({ state: "visible" });
    egal((await page.locator(".bandeau p").first().innerText()).replace(NBSP, " "), "Tu étais absent 2 h 0 min.", "bandeau");
    await capture("absence.png");
    const apres = await page.evaluate((cle) => JSON.parse(localStorage.getItem(cle)).etat.temps.totalMs, CLE);
    if (apres - avant < 2 * 3600 * 1000) throw new Error(`temps de partie : +${apres - avant} ms au lieu de 2 h au moins`);
  });

  // Le retour au premier plan : la page est « cachée » (l'événement du
  // navigateur est simulé) pendant 3 s réelles, l'horloge avance de 2 min,
  // puis la page revient. Attendu : 2 min + 3 s, une seule fois. Les images
  // que la page reçoit pendant sa cachette ne doivent rien compter : un
  // double compte ajouterait encore 3 s.
  await etape("+ page cachée puis revenue : rattrapée au retour, une seule fois", async () => {
    const lireTotal = (cle) => JSON.parse(localStorage.getItem(cle)).etat.temps.totalMs;
    const avant = await page.evaluate((cle) => {
      Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "hidden" });
      document.dispatchEvent(new Event("visibilitychange"));
      window.cacheA = performance.now();
      return JSON.parse(localStorage.getItem(cle)).etat.temps.totalMs;
    }, CLE);
    await page.waitForTimeout(3000);
    const cachette = await page.evaluate(() => {
      const vraie = Date.now.bind(Date);
      Date.now = () => vraie() + 2 * 60 * 1000;
      Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "visible" });
      document.dispatchEvent(new Event("visibilitychange"));
      return performance.now() - window.cacheA;
    });
    const absences = page.locator('[data-cle="absence"]');
    egal(await absences.count(), 1, "nombre de bandeaux d'absence");
    egal((await absences.locator("p").innerText()).replace(NBSP, " "), "Tu étais absent 2 min 3 s.", "bandeau");
    await ouvrirOptions();
    await page.getByRole("button", { name: "Sauvegarder maintenant" }).click();
    const ecart = (await page.evaluate(lireTotal, CLE)) - avant;
    const attendu = 120000 + cachette;
    if (ecart < attendu - 60 || ecart > attendu + 2000) {
      throw new Error(`temps de partie : +${ecart} ms, attendu ${Math.round(attendu)} ms (+ moins de 2 s visible)`);
    }
    await fermerOptions();
  });

  await etape("+ sauvegarde illisible : copiée telle quelle, nouvelle partie avec message", async () => {
    await depuisAtelier((cle) => localStorage.setItem(cle, "{pas du JSON"), CLE);
    await page.goto(`${origine}/`);
    await attendreEnergie("10 J");
    const copies = await page.evaluate(() => Object.keys(localStorage)
      .filter((k) => k.startsWith("temperature-critique:sauvegarde-illisible:"))
      .map((k) => localStorage.getItem(k)));
    if (!copies.includes("{pas du JSON")) throw new Error("la sauvegarde illisible n'a pas été mise de côté");
    if (!(await page.locator(".bandeau.encart-orange").isVisible())) throw new Error("pas de message");
  });

  await etape("+ sauvegarde de version future : refusée, laissée intacte, message", async () => {
    const future = JSON.stringify({ saveVersion: 99, build: 99, sauveLe: 0, etat: {} });
    await depuisAtelier(([cle, texte]) => localStorage.setItem(cle, texte), [CLE, future]);
    await page.goto(`${origine}/`);
    await attendreEnergie("10 J");
    await page.locator(".bandeau.encart-orange").waitFor({ state: "visible" });
    await ouvrirOptions();
    await page.getByRole("button", { name: "Sauvegarder maintenant" }).click();
    await page.reload();
    const reste = await page.evaluate((cle) => localStorage.getItem(cle), CLE);
    egal(reste, future, "sauvegarde future après sauvegarde et rechargement");
  });

  // --- Lot MACHINES (brief §8) --------------------------------------------
  // La sauvegarde de version future bloque l'écriture jusqu'au prochain
  // chargement : on repart d'un stockage vidé. Sous 1000 J l'énergie a trois
  // décimales et le jeu tourne : on lit des bornes, pas des égalités.

  await etape("M1. partie neuve : « 10 J », la ligne d'aide, la dynamo seule", async () => {
    await depuisAtelier((cle) => localStorage.removeItem(cle), CLE);
    await page.goto(`${origine}/`);
    await attendreEnergie("10 J");
    if (!(await page.locator("#aide-debut").isVisible())) throw new Error("la ligne d'aide n'est pas visible");
    if (await page.locator("#production").isVisible()) throw new Error("la ligne de production est visible");
    if (await page.locator("#commandes-achat").isVisible()) throw new Error("les commandes d'achat sont visibles");
    egal(await cartesVisibles(), "1", "cartes visibles");
    await capture("debut.png");
  });

  await etape("M2. toucher la dynamo : « +1 J/s », l'alternateur paraît « Nouveau », l'aide s'en va", async () => {
    await toucherDynamo();
    const e = await nombreEnergie();
    if (!(e < 2)) throw new Error(`énergie ${e} J juste après l'achat, attendu moins de 2 J`);
    await attendreTexte("#production", "+1 J/s");
    if (!(await page.locator("#production").isVisible())) throw new Error("la ligne de production n'est pas visible");
    egal(await cartesVisibles(), "1,2", "cartes visibles");
    if (!(await page.locator('[data-devoile="machine-2"] .nouveau').isVisible())) throw new Error("l'alternateur n'est pas marqué « Nouveau »");
    if (await page.locator("#aide-debut").isVisible()) throw new Error("la ligne d'aide est encore visible");
  });

  await etape("M3. mode test « +1 min » : l'énergie gagne au moins 60 J", async () => {
    const t0 = Date.now();
    const e0 = await nombreEnergie();
    await ouvrirOptions();
    const version = page.locator("#ligne-version");
    for (let i = 0; i < 7; i++) await version.click();
    await page.locator("#mode-test").waitFor({ state: "visible" });
    await page.getByRole("button", { name: "+1 min" }).click();
    await fermerOptions();
    await deuxImages();
    const e1 = await nombreEnergie();
    const secondes = (Date.now() - t0) / 1000;
    const gain = e1 - e0;
    if (gain < 60 || gain > 60 + secondes + 1) {
      throw new Error(`gain ${gain.toFixed(3)} J en ${secondes.toFixed(2)} s réelles, attendu entre 60 et ${(61 + secondes).toFixed(3)}`);
    }
  });

  await etape("M4. énergie 1e6, neuf dynamos de plus : « 10 · ×2 · lot 0/10 », « 10 000 J »", async () => {
    await energieDuModeTest("1e6");
    await attendreEnergie("1,00e6 J");
    for (let i = 0; i < 9; i++) await toucherDynamo();
    await deuxImages();
    egal(await texteDe(carte(1, "etat")), "10 · ×2 · lot 0/10", "état de la dynamo");
    egal(await texteDe(carte(1, "prix")), "10 000 J", "prix de la dynamo");
    if (await page.locator("#commandes-achat").isVisible()) throw new Error("les commandes d'achat sont visibles");
  });

  await etape("M5. toucher l'alternateur : les commandes paraissent ; « Jusqu'à 10 » : « 900 J », « 100 000 J »", async () => {
    await page.locator(carte(2, "prix")).click();
    await page.locator("#commandes-achat").waitFor({ state: "visible" });
    await page.getByRole("button", { name: "Jusqu'à 10" }).click();
    await deuxImages();
    egal(await texteDe(carte(2, "prix")), "900 J", "prix de l'alternateur, jusqu'à 10");
    egal(await texteDe(carte(1, "prix")), "100 000 J", "prix de la dynamo, jusqu'à 10");
    await page.getByRole("button", { name: "×1" }).click();
    await deuxImages();
    egal(await texteDe(carte(1, "prix")), "10 000 J", "prix de la dynamo, retour à ×1");
  });

  await etape("M6. énergie 1e400, « Tout acheter » : moins de 50 ms, centrale 660, cartes 5–8 cachées", async () => {
    await energieDuModeTest("1e400");
    await attendreEnergie("1,00e400 J");
    dureeToutAcheter = await page.evaluate(() => {
      const bouton = document.getElementById("tout-acheter");
      const t0 = performance.now();
      bouton.click();
      return performance.now() - t0;
    });
    if (!(dureeToutAcheter < 50)) throw new Error(`« Tout acheter » : ${dureeToutAcheter.toFixed(1)} ms`);
    const centrale = await texteDe(carte(4, "etat"));
    if (!centrale.startsWith("660 ·")) throw new Error(`centrale : « ${centrale} »`);
    egal(await cartesVisibles(), "1,2,3,4", "cartes visibles");
    const mesure = await page.evaluate(() => ({ page: document.documentElement.scrollWidth, fenetre: innerWidth }));
    if (mesure.page > mesure.fenetre) throw new Error(`défilement horizontal : ${JSON.stringify(mesure)}`);
    await capture("couche1.png");
  });

  await etape("M7. « Sauvegarder », rechargement : centrale toujours 660, quatre cartes", async () => {
    await ouvrirOptions();
    await page.getByRole("button", { name: "Sauvegarder maintenant" }).click();
    egal(await page.locator("#message-sauvegarde").innerText(), "Sauvegardé.", "message");
    await page.reload();
    await page.waitForFunction(
      () => document.querySelector('[data-devoile="machine-4"] .machine-etat')?.innerText.startsWith("660 ·"),
      null, { timeout: 5000 },
    );
    egal(await cartesVisibles(), "1,2,3,4", "cartes visibles");
  });

  await etape("M8. sauvegarde du SOCLE (v1) : chargée, copiée telle quelle, réécrite en v2", async () => {
    const texte = await depuisAtelier((cle) => {
      const t = `{"saveVersion":1,"build":1,"sauveLe":${Date.now()},"etat":{"meta":{"creeLe":1000,"modeTestUtilise":true},"temps":{"totalMs":5000},"energie":{"$d":"1e400"}}}`;
      localStorage.setItem(cle, t);
      return t;
    }, CLE);
    await page.goto(`${origine}/`);
    await attendreEnergie("1,00e400 J");
    egal(await page.locator(".bandeau.encart-orange").count(), 0, "bandeaux orange");
    egal(await cartesVisibles(), "1", "cartes visibles");
    if (!(await page.locator("#aide-debut").isVisible())) throw new Error("la ligne d'aide n'est pas visible");
    const copies = await page.evaluate(() => Object.keys(localStorage)
      .filter((k) => k.startsWith("temperature-critique:sauvegarde-v1:"))
      .map((k) => localStorage.getItem(k)));
    egal(copies.length, 1, "copies de la sauvegarde v1");
    egal(copies[0], texte, "copie de la sauvegarde v1");
    await ouvrirOptions();
    await page.getByRole("button", { name: "Sauvegarder maintenant" }).click();
    egal(await page.evaluate((cle) => JSON.parse(localStorage.getItem(cle)).saveVersion, CLE), 2, "saveVersion après sauvegarde");
    await fermerOptions();
  });

  await etape("zéro erreur dans la console, aucune requête hors de l'origine locale", async () => {
    if (erreurs.length) throw new Error(`${erreurs.length} erreur(s) : ${erreurs.join(" | ")}`);
    if (horsOrigine.length) throw new Error(`requêtes hors origine : ${horsOrigine.join(", ")}`);
  });
} catch {
  echec = true;
} finally {
  await navigateur.close();
  serveur.close();
}

console.log(`\nerreurs console : ${erreurs.length} · avertissements : ${avertissements.length}`);
for (const a of avertissements) console.log(`  avertissement : ${a}`);
console.log("captures : principal.png, options.png, mode-test.png, phrase-temoin.png, absence.png, debut.png, couche1.png (dans captures/)");
if (dureeToutAcheter !== null) console.log(`« Tout acheter » à 1e400 J : ${dureeToutAcheter.toFixed(1)} ms`);
if (echec) {
  console.log("voir : ÉCHEC");
  process.exit(1);
}
console.log(`voir : ${resultats.length} étapes réussies`);
