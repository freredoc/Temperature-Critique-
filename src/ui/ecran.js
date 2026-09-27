import { DEVOILEMENT } from "../data/devoilement.js";
import { formater } from "./format.js";

// L'écran principal : le dévoilement, l'énergie, les bandeaux.
export function monterEcran() {
  // Chaque entrée de devoilement.js a son élément, et chaque élément marqué
  // data-devoile a son entrée : un oubli casse au démarrage, pas en silence.
  const elements = new Map();
  for (const { id } of DEVOILEMENT) {
    const el = document.querySelector(`[data-devoile="${id}"]`);
    if (!el) throw new Error(`dévoilement : aucun élément [data-devoile="${id}"]`);
    elements.set(id, el);
  }
  for (const el of document.querySelectorAll("[data-devoile]")) {
    if (!elements.has(el.dataset.devoile)) {
      throw new Error(`dévoilement : « ${el.dataset.devoile} » manque dans src/data/devoilement.js`);
    }
  }

  const valeurEnergie = document.getElementById("valeur-energie");
  const bandeaux = document.getElementById("bandeaux");
  let energieAffichee = null;

  return {
    rendre(etat) {
      for (const { id, condition } of DEVOILEMENT) {
        const visible = Boolean(condition(etat));
        const el = elements.get(id);
        if (el.hidden === visible) el.hidden = !visible;
      }
      const texte = formater(etat.energie);
      if (texte !== energieAffichee) {
        valeurEnergie.textContent = texte;
        energieAffichee = texte;
      }
    },

    // Un bandeau refermable en haut de l'écran. ton : "cyan" (information)
    // ou "orange" (alerte). Un bandeau qui porte une clé remplace le
    // précédent de même clé (deux absences ne s'empilent pas).
    bandeau(message, ton = "cyan", cle = null) {
      if (cle) bandeaux.querySelector(`[data-cle="${cle}"]`)?.remove();
      const boite = document.createElement("div");
      if (cle) boite.dataset.cle = cle;
      boite.className = `bandeau encart encart-${ton}`;
      boite.setAttribute("role", ton === "orange" ? "alert" : "status");
      const texte = document.createElement("p");
      texte.textContent = message;
      const fermer = document.createElement("button");
      fermer.type = "button";
      fermer.textContent = "OK";
      fermer.setAttribute("aria-label", "Fermer ce message");
      fermer.addEventListener("click", () => boite.remove());
      boite.append(texte, fermer);
      bandeaux.append(boite);
    },
  };
}
