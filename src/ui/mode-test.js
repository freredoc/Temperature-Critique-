import { etatInitial } from "../sim/etat.js";
import { rattraper } from "../sim/rattrapage.js";
import { SAVE_VERSION, serialiser } from "../sim/sauvegarde.js";
import { formater, formaterDuree, formaterEntier, lireNombre } from "./format.js";
import { afficher } from "./options.js";

// Le mode test n'a aucune logique à lui : les sauts passent par `rattraper`
// (le chemin du hors ligne), la taille par `serialiser`, la nouvelle partie
// par `etatInitial` puis le même remplacement qu'un import. Seule l'énergie
// s'écrit directement : se donner une ressource est sa raison d'être.
//
// Il est visible tant que la partie est marquée modeTestUtilise, marque
// posée pour toujours dans la sauvegarde au premier passage.
export function monterModeTest(jeu) {
  const $ = (id) => document.getElementById(id);
  const section = $("mode-test");
  const boutonsVitesse = [...section.querySelectorAll("[data-vitesse]")];
  const champEnergie = $("champ-energie");
  const boutonNouvelle = $("nouvelle-partie");
  let prochaineMesure = 0;

  function marquer() {
    jeu.etat.meta.modeTestUtilise = true;
  }

  function ouvrir() {
    marquer();
    rafraichir(true);
  }

  // La vitesse n'est jamais sauvegardée : un rechargement repart à ×1.
  for (const bouton of boutonsVitesse) {
    bouton.addEventListener("click", () => {
      marquer();
      jeu.vitesse = Number(bouton.dataset.vitesse);
      for (const b of boutonsVitesse) b.setAttribute("aria-pressed", String(b === bouton));
    });
  }

  for (const bouton of section.querySelectorAll("[data-saut]")) {
    bouton.addEventListener("click", () => {
      marquer();
      jeu.dernierRattrapage = rattraper(jeu.etat, Number(bouton.dataset.saut));
      rafraichir(true);
    });
  }

  $("form-energie").addEventListener("submit", (e) => {
    e.preventDefault();
    const message = $("message-energie");
    const valeur = lireNombre(champEnergie.value);
    if (valeur === null) {
      const saisie = champEnergie.value.trim();
      afficher(message, `${saisie ? `« ${saisie} » refusé : écris` : "Écris"} un nombre positif, `
        + "par exemple 1e400, 12,5 ou 3.2e15.", true);
      return;
    }
    marquer();
    jeu.etat.energie = valeur;
    afficher(message, `Énergie : ${formater(valeur)} J.`);
  });

  // Confirmation en deux temps : le premier toucher change le texte du
  // bouton, le second (dans les 5 s) confirme.
  let confirmerAvant = 0;
  const desarmer = () => {
    confirmerAvant = 0;
    boutonNouvelle.textContent = "Nouvelle partie";
  };
  boutonNouvelle.addEventListener("click", () => {
    const message = $("message-nouvelle-partie");
    if (performance.now() < confirmerAvant) {
      desarmer();
      const etat = etatInitial(Date.now());
      etat.meta.modeTestUtilise = true; // créée depuis le mode test
      const sauve = jeu.remplacer(etat);
      afficher(message, sauve.ok ? "Nouvelle partie commencée." : `Nouvelle partie commencée, mais non sauvegardée : ${sauve.erreur}.`, !sauve.ok);
      rafraichir(true);
      return;
    }
    confirmerAvant = performance.now() + 5000;
    boutonNouvelle.textContent = "Toucher encore : tout effacer";
    afficher(message, "");
    setTimeout(() => {
      if (performance.now() >= confirmerAvant) desarmer();
    }, 5000);
  });

  // Les mesures, rafraîchies 4 fois par seconde au plus.
  function rafraichir(forcer = false) {
    section.hidden = !jeu.etat.meta.modeTestUtilise;
    if (section.hidden) return;
    const maintenant = performance.now();
    if (!forcer && maintenant < prochaineMesure) return;
    prochaineMesure = maintenant + 250;
    const r = jeu.dernierRattrapage;
    $("mesure-temps").textContent = formaterDuree(jeu.etat.temps.totalMs);
    $("mesure-rattrapage").textContent = r ? `${formaterEntier(r.ms)} ms en ${r.pas} pas` : "aucun";
    $("mesure-save-version").textContent = String(SAVE_VERSION);
    const octets = new TextEncoder().encode(serialiser(jeu.enveloppe())).length;
    $("mesure-taille").textContent = `${formaterEntier(octets)} octets`;
  }

  return { ouvrir, rafraichir };
}
