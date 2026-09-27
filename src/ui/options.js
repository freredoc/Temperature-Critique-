import { exporter, importer } from "../sim/sauvegarde.js";

// Le panneau Options : version et build, sauvegarde, export, import,
// licences. Sept touchers en moins de 3 s sur la ligne de version appellent
// `surSeptTouchers` (le mode test).
export function monterOptions(jeu, { surSeptTouchers }) {
  const $ = (id) => document.getElementById(id);
  const panneau = $("options");
  const coquille = $("coquille");
  const boutonOuvrir = $("ouvrir-options");
  const ligneVersion = $("ligne-version");
  const partieDeTest = $("partie-de-test");
  const codeExport = $("code-export");
  const codeImport = $("code-import");
  const licences = $("licences");
  const boutonLicences = $("afficher-licences");

  ligneVersion.textContent = `${jeu.version} · build ${jeu.build}`;

  function ouvrir() {
    panneau.hidden = false;
    coquille.inert = true;
    document.body.classList.add("panneau-ouvert");
    boutonOuvrir.setAttribute("aria-expanded", "true");
    rafraichir();
    $("fermer-options").focus();
  }

  function fermer() {
    panneau.hidden = true;
    coquille.inert = false;
    document.body.classList.remove("panneau-ouvert");
    boutonOuvrir.setAttribute("aria-expanded", "false");
    boutonOuvrir.focus();
  }

  function rafraichir() {
    partieDeTest.hidden = !jeu.etat.meta.modeTestUtilise;
  }

  boutonOuvrir.addEventListener("click", ouvrir);
  $("fermer-options").addEventListener("click", fermer);
  panneau.addEventListener("keydown", (e) => {
    if (e.key === "Escape") fermer();
  });

  const touchers = [];
  ligneVersion.addEventListener("click", (e) => {
    touchers.push(e.timeStamp);
    while (e.timeStamp - touchers[0] > 3000) touchers.shift();
    if (touchers.length >= 7) {
      touchers.length = 0;
      surSeptTouchers();
      rafraichir();
    }
  });

  $("sauvegarder").addEventListener("click", () => {
    const r = jeu.sauvegarder();
    afficher($("message-sauvegarde"), r.ok ? "Sauvegardé." : `Sauvegarde refusée : ${r.erreur}.`, !r.ok);
  });

  $("exporter").addEventListener("click", () => {
    try {
      codeExport.value = exporter(jeu.enveloppe());
      afficher($("message-export"), `Code prêt (${codeExport.value.length} caractères). Copie-le en entier.`);
    } catch (e) {
      codeExport.value = "";
      afficher($("message-export"), `Export impossible : ${e.message}.`, true);
    }
  });

  $("copier-export").addEventListener("click", async () => {
    const message = $("message-export");
    if (codeExport.value === "") {
      afficher(message, "Touche d'abord « Exporter ».", true);
      return;
    }
    try {
      await navigator.clipboard.writeText(codeExport.value);
      afficher(message, "Copié.");
    } catch {
      codeExport.select();
      afficher(message, "Copie automatique impossible : le code est sélectionné, copie-le à la main.", true);
    }
  });

  $("importer").addEventListener("click", () => {
    const message = $("message-import");
    const r = importer(codeImport.value);
    if (!r.ok) {
      afficher(message, `Code refusé : ${r.erreur}. Rien n'a changé.`, true);
      return;
    }
    const sauve = jeu.remplacer(r.enveloppe.etat);
    codeImport.value = "";
    rafraichir();
    afficher(message, sauve.ok ? "Code importé : la partie est remplacée et sauvegardée."
      : `Code importé, mais non sauvegardé : ${sauve.erreur}.`, !sauve.ok);
  });

  boutonLicences.addEventListener("click", () => {
    if (licences.textContent === "") {
      licences.textContent = JSON.parse(document.getElementById("licences-tierces").textContent);
    }
    licences.hidden = !licences.hidden;
    boutonLicences.setAttribute("aria-expanded", String(!licences.hidden));
  });

  return {
    ouvert: () => !panneau.hidden,
    rafraichir,
  };
}

export function afficher(element, texte, erreur = false) {
  element.textContent = texte;
  element.classList.toggle("erreur", erreur);
}
