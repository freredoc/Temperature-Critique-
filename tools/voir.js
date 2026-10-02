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

import { Decimal } from "../src/sim/nombre.js";
import { SAVE_VERSION, serialiser } from "../src/sim/sauvegarde.js";
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
async function ouvrirModeTest() {
  await ouvrirOptions();
  const version = page.locator("#ligne-version");
  for (let i = 0; i < 7; i++) await version.click();
  await page.locator("#mode-test").waitFor({ state: "visible" });
  await fermerOptions();
}
async function visible(selecteur) {
  return page.locator(selecteur).isVisible();
}
// Ni défilement horizontal, ni rien qui dépasse du bloc froid ou de la
// gouttière de 16 px.
async function sansDebordement() {
  const mesure = await page.evaluate(() => {
    const bloc = document.getElementById("froid");
    const cadre = bloc.hidden ? null : bloc.getBoundingClientRect();
    const dehors = cadre === null ? [] : [...bloc.querySelectorAll("*")]
      .filter((el) => el.getClientRects().length > 0 && el.getBoundingClientRect().right > cadre.right + 0.5)
      .map((el) => el.id || el.className);
    return {
      page: document.documentElement.scrollWidth,
      fenetre: innerWidth,
      droiteDuBloc: cadre === null ? null : cadre.right,
      dehors,
    };
  });
  if (mesure.page > mesure.fenetre) throw new Error(`défilement horizontal : ${JSON.stringify(mesure)}`);
  if (mesure.droiteDuBloc !== null && mesure.droiteDuBloc > mesure.fenetre - 16) {
    throw new Error(`le bloc froid mord sur la gouttière : ${JSON.stringify(mesure)}`);
  }
  if (mesure.dehors.length) throw new Error(`débordement du bloc froid : ${mesure.dehors.join(", ")}`);
}
const apercuAttendu = (machine) => "Tu repars de 10 J, sans machines. En échange : toutes les machines ×2"
  + (machine === null ? "." : `, et une nouvelle machine : ${machine}.`);
const explicationAttendue = (fois) => "Plus il fait froid, moins le cuivre résiste : toutes les machines ×2 par palier. "
  + `Ici : ×${fois}.`;
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

  await etape("M8. sauvegarde du SOCLE (v1) : chargée, copiée telle quelle, réécrite dans la version courante", async () => {
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
    // La version courante se lit, elle ne s'écrit pas en dur.
    egal(await page.evaluate((cle) => JSON.parse(localStorage.getItem(cle)).saveVersion, CLE), SAVE_VERSION, "saveVersion après sauvegarde");
    await fermerOptions();
  });

  // --- Lot FROID (brief §7) -----------------------------------------------
  // Une partie neuve, depuis un stockage vidé. Le mode test ne sert qu'à se
  // donner de l'énergie : chaque palier se descend en touchant « Refroidir ».

  await etape("F1. le bloc froid arrive avec la Turbine : « 300 K · ambiante », « … Il faut 1,00e9 J. », bouton grisé", async () => {
    await depuisAtelier(() => localStorage.clear());
    await page.goto(`${origine}/`);
    await attendreEnergie("10 J");
    await ouvrirModeTest();
    await energieDuModeTest("1e7");
    await attendreEnergie("1,00e7 J");
    if (await visible("#froid")) throw new Error("le bloc froid est visible dans une partie neuve");
    await page.locator(carte(1, "prix")).click();
    await page.locator(carte(2, "prix")).click();
    if (await visible("#froid")) throw new Error("le bloc froid est visible avant la Turbine");
    await page.locator(carte(3, "prix")).click();
    await page.locator("#froid").waitFor({ state: "visible" });
    egal(await texteDe(".froid-temperature"), "300 K · ambiante", "température");
    egal(await texteDe("#objectif"), "Prochain palier : 194,65 K, glace carbonique. Il faut 1,00e9 J.", "objectif");
    egal(await texteDe("#refroidir"), "Refroidir à 194,65 K", "bouton");
    if (!(await page.locator("#refroidir").isDisabled())) throw new Error("le bouton « Refroidir » n'est pas grisé");
    if (await visible("#froid-explication")) throw new Error("l'explication est visible avant le premier palier");
    await sansDebordement();
    await capture("froid-debut.png");
    await page.locator(carte(4, "prix")).click();
    egal(await cartesVisibles(), "1,2,3,4", "cartes visibles");
  });

  await etape("F2. énergie 1e9 : le bouton s'allume, « Tu peux refroidir à 194,65 K. », l'aperçu nomme le Réseau", async () => {
    await energieDuModeTest("1e9");
    await page.waitForFunction(() => !document.getElementById("refroidir").disabled, null, { timeout: 5000 });
    egal(await texteDe("#objectif"), "Tu peux refroidir à 194,65 K.", "objectif");
    egal(await texteDe("#apercu-refroidir"), apercuAttendu("Réseau"), "aperçu");
    egal(await page.locator(".jauge").getAttribute("aria-valuenow"), "100", "jauge");
    await sansDebordement();
    await capture("froid.png");
  });

  await etape("F3. « Refroidir » : « 10 J », « 194,65 K · glace carbonique », « +0 J/s », la Dynamo ×2, le Réseau « Nouveau »", async () => {
    await page.locator("#refroidir").click();
    await attendreEnergie("10 J");
    egal(await texteDe(".froid-temperature"), "194,65 K · glace carbonique", "température");
    egal(await texteDe("#production"), "+0 J/s", "production");
    egal(await cartesVisibles(), "1,2,3,4,5", "cartes visibles");
    egal(await texteDe(carte(1, "etat")), "0 · ×2 · lot 0/10", "état de la Dynamo");
    egal(await texteDe(carte(1, "prix")), "10 J", "prix de la Dynamo");
    if (!(await visible('[data-devoile="machine-5"] .nouveau'))) throw new Error("le Réseau n'est pas marqué « Nouveau »");
    egal(await texteDe(carte(5, "prix")), "1,00e9 J", "prix du Réseau");
    egal(await texteDe("#froid-explication"), explicationAttendue(2), "explication");
    egal(await texteDe("#objectif"), "Prochain palier : 77,36 K, azote liquide. Il faut 1,00e15 J.", "objectif");
    // Rien de ce qui a été vu ne disparaît après un palier.
    for (const s of ["#production", "#commandes-achat", "#froid"]) {
      if (!(await visible(s))) throw new Error(`${s} a disparu après le palier`);
    }
  });

  await etape("F4. jusqu'au palier 6 : « 1,5 K · hélium pompé », bouton et jauge cachés, « Ici : ×64. »", async () => {
    const paliers = [
      ["1e15", "77,36 K · azote liquide", "Cyclotron"],
      ["1e22", "27,1 K · néon liquide", "Synchrotron"],
      ["1e30", "20,28 K · hydrogène liquide", "Collisionneur"],
      ["1e39", "4,22 K · hélium liquide", null],
      ["1e44", "1,5 K · hélium pompé", null],
    ];
    for (const [seuil, temperature, machine] of paliers) {
      egal(await texteDe("#apercu-refroidir"), apercuAttendu(machine), `aperçu avant ${seuil} J`);
      await energieDuModeTest(seuil);
      await page.locator("#refroidir").click();
      await attendreTexte(".froid-temperature", temperature);
      await attendreEnergie("10 J");
    }
    egal(await texteDe("#objectif"), "1,5 K : le plus froid pour l'instant. La suite viendra avec la supraconductivité.", "objectif");
    if (await visible("#refroidir")) throw new Error("le bouton « Refroidir » est visible au palier 6");
    if (await visible(".jauge")) throw new Error("la jauge est visible au palier 6");
    egal(await texteDe("#froid-explication"), explicationAttendue(64), "explication");
    egal(await cartesVisibles(), "1,2,3,4,5", "cartes visibles");
    await sansDebordement();
    await capture("palier6.png");
    // Le pire cas de la mise en page : 10⁴⁰⁰ J, les huit cartes, de grands
    // nombres partout. À 1e400 J pile, « Tout acheter » dépense tout en
    // Collisionneurs : leur 26ᵉ lot coûte 1e400 J, et les 1e385 J déjà
    // dépensés se perdent dans les 15 chiffres d'un Decimal. Un jour de
    // cascade remplit les autres cartes, puis l'énergie revient à 1e400.
    await energieDuModeTest("1e400");
    await attendreEnergie("1,00e400 J");
    await page.locator("#tout-acheter").click();
    egal(await cartesVisibles(), "1,2,3,4,5,6,7,8", "cartes visibles après « Tout acheter »");
    await ouvrirOptions();
    await page.getByRole("button", { name: "+1 jour" }).click();
    await fermerOptions();
    await energieDuModeTest("1e400");
    await attendreEnergie("1,00e400 J");
    await sansDebordement();
    await capture("palier6-huit.png");
  });

  await etape("F5. « Sauvegarder maintenant », rechargement : toujours « 1,5 K », le bloc sans bouton", async () => {
    await ouvrirOptions();
    await page.getByRole("button", { name: "Sauvegarder maintenant" }).click();
    egal(await page.locator("#message-sauvegarde").innerText(), "Sauvegardé.", "message");
    await page.reload();
    await attendreTexte(".froid-temperature", "1,5 K · hélium pompé");
    if (!(await visible("#froid"))) throw new Error("le bloc froid n'est pas visible");
    if (await visible("#refroidir")) throw new Error("le bouton « Refroidir » est visible au palier 6");
  });

  await etape("F6. la partie d'Ethan (v2) : chargée sans bandeau, copiée telle quelle, réécrite dans la version courante", async () => {
    // La forme exacte qu'écrivait le lot MACHINES, en toutes lettres et dans
    // l'ordre de son etatInitial : 3 dynamos achetées, 1 alternateur, 500 J.
    // `serialiser` n'a pas changé : c'est le texte qu'il écrivait (« 500 »
    // s'écrit {"$d":"5e2"}).
    const maintenant = Date.now();
    const texte = serialiser({
      saveVersion: 2,
      build: 2,
      sauveLe: maintenant,
      etat: {
        meta: { creeLe: maintenant - 600_000, modeTestUtilise: false },
        temps: { totalMs: 600_000 },
        energie: new Decimal(500),
        machines: [
          { quantite: new Decimal(3), achetees: 3 },
          { quantite: new Decimal(1), achetees: 1 },
          { quantite: new Decimal(0), achetees: 0 },
          { quantite: new Decimal(0), achetees: 0 },
          { quantite: new Decimal(0), achetees: 0 },
          { quantite: new Decimal(0), achetees: 0 },
          { quantite: new Decimal(0), achetees: 0 },
          { quantite: new Decimal(0), achetees: 0 },
        ],
        decouvertes: { machines: 2 },
        preferences: { modeAchat: "un" },
      },
    });
    if (!texte.includes('"energie":{"$d":"5e2"}')) throw new Error(`texte v2 inattendu : ${texte.slice(0, 160)}…`);
    await depuisAtelier(([cle, t]) => localStorage.setItem(cle, t), [CLE, texte]);
    await page.goto(`${origine}/`);
    await page.locator('[data-devoile="machine-2"]').waitFor({ state: "visible" });
    egal(await page.locator(".bandeau.encart-orange").count(), 0, "bandeaux orange");
    const e = await nombreEnergie();
    if (!(e >= 500 && e < 600)) throw new Error(`énergie ${e} J, attendu entre 500 et 600 J`);
    const dynamo = await texteDe(carte(1, "etat"));
    if (!/^\d+ · ×1 · lot 3\/10$/.test(dynamo) || Number(dynamo.split(" ")[0]) < 3) {
      throw new Error(`état de la Dynamo : « ${dynamo} »`);
    }
    egal(await texteDe(carte(2, "etat")), "1 · ×1 · lot 1/10", "état de l'Alternateur");
    egal(await cartesVisibles(), "1,2,3", "cartes visibles");
    if (await visible("#froid")) throw new Error("le bloc froid est visible sans Turbine achetée");
    const copies = await page.evaluate(() => Object.keys(localStorage)
      .filter((k) => k.startsWith("temperature-critique:sauvegarde-v2:"))
      .map((k) => localStorage.getItem(k)));
    egal(copies.length, 1, "copies de la sauvegarde v2");
    egal(copies[0], texte, "copie de la sauvegarde v2");
    await ouvrirOptions();
    await page.getByRole("button", { name: "Sauvegarder maintenant" }).click();
    const relue = await page.evaluate((cle) => JSON.parse(localStorage.getItem(cle)), CLE);
    egal(relue.saveVersion, SAVE_VERSION, "saveVersion après sauvegarde");
    egal(relue.etat.froid.palier, 0, "palier après migration");
    egal(relue.etat.decouvertes.paliers, 0, "plus haut palier après migration");
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
console.log("captures : principal.png, options.png, mode-test.png, phrase-temoin.png, absence.png, debut.png, couche1.png, "
  + "froid-debut.png, froid.png, palier6.png, palier6-huit.png (dans captures/)");
if (dureeToutAcheter !== null) console.log(`« Tout acheter » à 1e400 J : ${dureeToutAcheter.toFixed(1)} ms`);
if (echec) {
  console.log("voir : ÉCHEC");
  process.exit(1);
}
console.log(`voir : ${resultats.length} étapes réussies`);
