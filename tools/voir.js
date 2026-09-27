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
  } else {
    reponse.writeHead(404);
    reponse.end();
  }
});
await new Promise((ok) => serveur.listen(0, "127.0.0.1", ok));
const origine = `http://127.0.0.1:${serveur.address().port}`;

mkdirSync(CAPTURES, { recursive: true });
const navigateur = await chromium.launch();
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

  await etape("3. ≡ ouvre les Options, version « 0.1.0 · build 1 »", async () => {
    await ouvrirOptions();
    await page.locator("#options").waitFor({ state: "visible" });
    egal(await page.locator("#ligne-version").innerText(), "0.1.0 · build 1", "ligne de version");
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
console.log("captures : principal.png, options.png, mode-test.png, phrase-temoin.png, absence.png (dans captures/)");
if (echec) {
  console.log("voir : ÉCHEC");
  process.exit(1);
}
console.log(`voir : ${resultats.length} étapes réussies`);
