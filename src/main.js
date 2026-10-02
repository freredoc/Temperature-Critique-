import { AUTOSAUVEGARDE_MS, MAX_PAS_PAR_IMAGE, PAS_MS, SEUIL_ABSENCE_MS } from "./data/constantes.js";
import { avancer } from "./sim/avancer.js";
import { etatInitial } from "./sim/etat.js";
import { rattraper } from "./sim/rattrapage.js";
import { envelopper, relire, serialiser } from "./sim/sauvegarde.js";
import { monterEcran } from "./ui/ecran.js";
import { formaterDuree } from "./ui/format.js";
import { monterFroid } from "./ui/froid.js";
import { monterMachines } from "./ui/machines.js";
import { monterModeTest } from "./ui/mode-test.js";
import { monterOptions } from "./ui/options.js";
import { copierAvantMigration, ecrireSauvegarde, lireSauvegarde, mettreDeCote } from "./ui/stockage.js";

// Le temps réel entre dans la simulation par deux chemins exclusifs :
// - page visible : la boucle d'images (horodatages requestAnimationFrame) ;
// - page cachée puis revenue : `rattraper(Date.now() − cacheLe)` au retour,
//   puis l'horloge de la boucle repart de maintenant ;
// - page tuée puis rechargée : `rattraper(Date.now() − sauveLe)` au
//   chargement. `sauveLe` est l'heure jusqu'à laquelle l'état a été simulé.

let precedent = null; // horodatage de la dernière image comptée ; null = à reprendre
let accumulateur = 0; // temps de jeu (vitesse comprise) pas encore simulé, en ms
let cacheLe = null; // Date.now() au passage en arrière-plan ; null au premier plan
let derniereSauvegarde = 0; // performance.now() : une horloge système reculée ne la bloque pas
let alerteEcriture = false;

// Ce qui interdit d'écrire (sauvegarde plus récente présente, stockage
// inaccessible, sauvegarde illisible impossible à mettre de côté) ; null
// sinon. On n'écrase jamais ce qu'on n'a pas su lire ou mettre de côté.
let ecritureBloquee = null;

const jeu = {
  etat: null,
  vitesse: 1, // mode test ; jamais sauvegardée
  dernierRattrapage: null, // { pas, ms }
  version: __VERSION__, // injectés par tools/build.js (define d'esbuild)
  build: __BUILD__,
  // sauveLe : l'heure jusqu'à laquelle l'état a été simulé. Le reste de
  // l'accumulateur (moins d'un pas) n'y est pas encore : on le retranche, pour
  // qu'un rechargement le rattrape au lieu de le perdre.
  enveloppe: () => envelopper(jeu.etat, {
    build: jeu.build,
    sauveLe: Math.round((cacheLe ?? Date.now()) - accumulateur / jeu.vitesse),
  }),
  sauvegarder,
  // Import et nouvelle partie : l'état est remplacé, puis sauvegardé aussitôt.
  remplacer(etat) {
    jeu.etat = etat;
    return sauvegarder();
  },
};

function sauvegarder() {
  derniereSauvegarde = performance.now();
  if (ecritureBloquee) return { ok: false, erreur: ecritureBloquee };
  try {
    return ecrireSauvegarde(serialiser(jeu.enveloppe()));
  } catch (e) {
    return { ok: false, erreur: e.message };
  }
}

function sauvegarderAuto() {
  const r = sauvegarder();
  if (!r.ok && !ecritureBloquee && !alerteEcriture) {
    alerteEcriture = true;
    ecran.bandeau(`La sauvegarde automatique échoue : ${r.erreur}.`, "orange");
  }
}

function constaterAbsence(etat, ms) {
  jeu.dernierRattrapage = rattraper(etat, ms);
  if (ms > SEUIL_ABSENCE_MS) ecran.bandeau(`Tu étais absent ${formaterDuree(ms)}.`, "cyan", "absence");
}

// Au chargement : la sauvegarde, rattrapée jusqu'à maintenant, ou une
// nouvelle partie. Rien ne s'efface en silence.
function charger() {
  const maintenant = Date.now();
  const lu = lireSauvegarde();
  if (!lu.ok) {
    ecritureBloquee = lu.erreur;
    ecran.bandeau(`Sauvegarde impossible : ${lu.erreur}. Cette partie ne sera pas sauvegardée.`, "orange");
    return etatInitial(maintenant);
  }
  if (lu.texte === null) return etatInitial(maintenant);

  const r = relire(lu.texte);
  if (r.ok) {
    // Une sauvegarde d'une version antérieure est copiée telle quelle AVANT
    // la première écriture. Si la copie échoue, on joue sans rien écrire :
    // l'ancienne reste intacte, et rien ne l'écrase.
    if (r.migreeDepuis !== null) {
      const copie = copierAvantMigration(lu.texte, r.migreeDepuis, new Date(maintenant).toISOString());
      if (!copie.ok) {
        ecritureBloquee = "la sauvegarde d'avant la mise à jour n'a pas pu être copiée";
        ecran.bandeau(`Ta sauvegarde vient d'une version précédente, et ${copie.erreur}. `
          + "Elle reste intacte ; rien n'est sauvegardé tant que la copie n'est pas possible.", "orange");
      }
    }
    constaterAbsence(r.enveloppe.etat, maintenant - r.enveloppe.sauveLe);
    return r.enveloppe.etat;
  }
  if (r.cause === "future") {
    ecritureBloquee = "une sauvegarde plus récente est conservée telle quelle";
    ecran.bandeau(`Ta sauvegarde n'est pas chargée : ${r.message}. Elle reste intacte. `
      + "Recharge la page pour obtenir la dernière version ; d'ici là, rien n'est sauvegardé.", "orange");
    return etatInitial(maintenant);
  }
  const copie = mettreDeCote(lu.texte, new Date(maintenant).toISOString());
  if (!copie.ok) {
    ecritureBloquee = "la sauvegarde illisible n'a pas pu être mise de côté";
    ecran.bandeau(`Ta sauvegarde est illisible (${r.message}), et ${copie.erreur}. `
      + "Elle reste en place ; rien n'est sauvegardé.", "orange");
    return etatInitial(maintenant);
  }
  ecran.bandeau(`Ta sauvegarde était illisible (${r.message}). Elle est copiée telle quelle `
    + `sous « ${copie.cle} », et une nouvelle partie commence.`, "orange");
  return etatInitial(maintenant);
}

// Fait entrer `ms` de temps réel (déjà multiplié par la vitesse) dans la
// simulation. Le reste de moins d'un pas est gardé pour l'image suivante.
function ecouler(ms) {
  if (ms > PAS_MS * MAX_PAS_PAR_IMAGE) {
    const entier = Math.floor(ms);
    accumulateur += ms - entier;
    jeu.dernierRattrapage = rattraper(jeu.etat, entier);
  } else {
    accumulateur += ms;
  }
  while (accumulateur >= PAS_MS) {
    avancer(jeu.etat, PAS_MS);
    accumulateur -= PAS_MS;
  }
}

function image(maintenant) {
  requestAnimationFrame(image);
  // Une page cachée peut être gelée : ses horodatages ne comptent pas.
  if (cacheLe !== null) return;
  if (precedent !== null) ecouler((maintenant - precedent) * jeu.vitesse);
  precedent = maintenant;
  if (performance.now() - derniereSauvegarde >= AUTOSAUVEGARDE_MS) sauvegarderAuto();
  rendre();
}

function rendre() {
  // Le dévoilement d'abord : les cartes cachées ne se calculent pas.
  ecran.rendre(jeu.etat);
  machines.rendre(jeu.etat);
  froid.rendre(jeu.etat);
  if (options.ouvert()) {
    options.rafraichir();
    modeTest.rafraichir();
  }
}

// Passage en arrière-plan : le temps écoulé depuis la dernière image entre
// dans l'état, puis on sauvegarde. Sur téléphone, beforeunload ne suffit
// pas : le navigateur peut tuer une page cachée sans prévenir.
function suspendre() {
  if (cacheLe === null) {
    if (precedent !== null) ecouler((performance.now() - precedent) * jeu.vitesse);
    precedent = null;
    cacheLe = Date.now();
  }
  sauvegarderAuto();
}

// Retour au premier plan : l'absence est rattrapée ici et seulement ici,
// puis l'horloge de la boucle repart de maintenant (pas de double compte).
function reprendre() {
  if (cacheLe === null) return;
  const absence = Date.now() - cacheLe;
  cacheLe = null;
  precedent = performance.now();
  constaterAbsence(jeu.etat, absence);
  rendre();
}

// Les cartes naissent avant que monterEcran ne confronte le dévoilement à la
// page : il exige un élément par entrée de DEVOILEMENT.
const machines = monterMachines(jeu, { apresAchat: rendre });
const ecran = monterEcran();
// Refroidir est un geste du joueur, et seulement ici : ni `avancer`, ni le
// rattrapage hors ligne ne descendent un palier.
const froid = monterFroid(jeu, { apresRefroidir: rendre });
jeu.etat = charger();
if (document.visibilityState === "hidden") cacheLe = Date.now();
sauvegarderAuto();

const modeTest = monterModeTest(jeu);
const options = monterOptions(jeu, { surSeptTouchers: () => modeTest.ouvrir() });

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") suspendre();
  else reprendre();
});
window.addEventListener("pagehide", suspendre);
window.addEventListener("pageshow", () => {
  if (document.visibilityState === "visible") reprendre();
});

rendre();
requestAnimationFrame(image);
