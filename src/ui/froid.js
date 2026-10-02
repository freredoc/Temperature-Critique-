import { ENERGIE_APRES_PALIER, MULTIPLICATEUR_PALIER, PALIERS } from "../data/froid.js";
import { MACHINES } from "../data/machines.js";
import { apercuRefroidir, peutRefroidir, refroidir, seuilSuivant } from "../sim/froid.js";
import { multiplicateurDePalier } from "../sim/machines.js";
import { Decimal } from "../sim/nombre.js";
import { formater } from "./format.js";

// U+00A0 entre un nombre et son unité, et devant « : » : jamais de « K » ni
// de « : » seul en début de ligne.
const ESPACE = " ";

// Les textes qui ne tiennent qu'aux tables, écrits une fois.
const DEPART = new Decimal(ENERGIE_APRES_PALIER);
const TEXTE_DEPART = `${formater(DEPART)}${ESPACE}J`; // « 10 J »
const PAR_PALIER = formater(new Decimal(MULTIPLICATEUR_PALIER)); // « 2 »

// Le bloc froid : la température, l'explication, l'objectif, la jauge, le
// bouton « Refroidir » et son aperçu.
//
// Ce module ne calcule aucune règle : il lit src/sim/froid.js (le seuil, le
// geste, l'aperçu), `multiplicateurDePalier` et les tables. Le dévoilement
// décide de ce qui se voit ; un bloc caché ne se calcule pas, et un texte ne
// s'écrit que s'il a changé.
export function monterFroid(jeu, { apresRefroidir }) {
  const $ = (id) => document.getElementById(id);
  const bloc = $("froid");
  const temperature = bloc.querySelector(".froid-temperature");
  const explication = $("froid-explication");
  const objectif = $("objectif");
  const suivant = $("froid-suivant");
  const jauge = suivant.querySelector(".jauge");
  const remplie = suivant.querySelector(".jauge-remplie");
  const bouton = $("refroidir");
  const apercu = $("apercu-refroidir");

  // Pas de confirmation en deux temps : le bouton ne s'allume qu'au seuil,
  // et l'aperçu dit ce qu'on perd.
  bouton.addEventListener("click", () => {
    refroidir(jeu.etat);
    apresRefroidir();
  });

  // Ce qui est à l'écran : on n'écrit que ce qui change.
  const affiche = {};
  function ecrire(cle, valeur, appliquer) {
    if (affiche[cle] === valeur) return;
    affiche[cle] = valeur;
    appliquer(valeur);
  }

  return {
    rendre(etat) {
      if (bloc.hidden) return;
      const ici = PALIERS[etat.froid.palier];
      ecrire("temperature", `${kelvins(ici.kelvins)} · ${ici.technique.toLowerCase()}`, (v) => {
        temperature.textContent = v;
      });
      if (!explication.hidden) {
        ecrire(
          "explication",
          `Plus il fait froid, moins le cuivre résiste${ESPACE}: toutes les machines ×${PAR_PALIER} par palier. `
            + `Ici${ESPACE}: ×${formater(multiplicateurDePalier(etat.froid.palier))}.`,
          (v) => { explication.textContent = v; },
        );
      }

      const prochain = apercuRefroidir(etat);
      if (prochain === null) {
        ecrire(
          "objectif",
          `${kelvins(ici.kelvins)}${ESPACE}: le plus froid pour l'instant. La suite viendra avec la supraconductivité.`,
          (v) => { objectif.textContent = v; },
        );
        return;
      }
      const seuil = seuilSuivant(etat);
      const possible = peutRefroidir(etat);
      const cible = kelvins(prochain.kelvins);
      ecrire(
        "objectif",
        possible
          ? `Tu peux refroidir à ${cible}.`
          : `Prochain palier${ESPACE}: ${cible}, ${prochain.technique.toLowerCase()}. `
            + `Il faut ${formater(seuil)}${ESPACE}J.`,
        (v) => { objectif.textContent = v; },
      );

      if (suivant.hidden) return;
      ecrire("bouton", `Refroidir à ${cible}`, (v) => { bouton.textContent = v; });
      ecrire("disabled", !possible, (v) => { bouton.disabled = v; });
      const machine = prochain.machineNeuve === null
        ? ""
        : `, et une nouvelle machine${ESPACE}: ${MACHINES[prochain.machineNeuve - 1].nom}`;
      ecrire(
        "apercu",
        `Tu repars de ${TEXTE_DEPART}, sans machines. En échange${ESPACE}: toutes les machines ×${PAR_PALIER}${machine}.`,
        (v) => { apercu.textContent = v; },
      );
      ecrire("jauge", demiPourcent(partDuChemin(etat.energie, seuil)), (v) => {
        remplie.style.width = `${v}%`;
        jauge.setAttribute("aria-valuenow", String(v));
      });
    },
  };
}

// « 194,65 K » : `formater` garde jusqu'à trois décimales, sans zéros
// inutiles (« 27,1 K », et non « 27,10 K »).
function kelvins(k) {
  return `${formater(new Decimal(k))}${ESPACE}K`;
}

// La part du chemin parcourue de 10 J au seuil, de 0 à 1, en échelle
// logarithmique : une jauge linéaire resterait à 0 % pendant presque tout le
// palier. `log10()` d'un Decimal rend un Number : ce n'est pas
// Number(decimal), et il tient même à 1e400 J.
function partDuChemin(energie, seuil) {
  const part = energie.div(DEPART).log10() / seuil.div(DEPART).log10();
  // Sous 10 J, à 0 J (−∞) ou sur un nombre illisible (NaN) : la jauge est vide.
  if (!(part > 0)) return 0;
  return Math.min(1, part);
}

// En pourcents, au demi-pourcent inférieur : comme `formater`, la jauge
// n'affiche jamais plus que ce que le joueur a. Elle n'est pleine qu'au
// seuil, quand le bouton s'allume.
function demiPourcent(part) {
  return Math.floor(part * 200) / 2;
}
