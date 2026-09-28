import { MACHINES, TAILLE_LOT } from "../data/machines.js";
import {
  acheter,
  acheterLot,
  multiplicateur,
  prix,
  prixDuLot,
  production,
  resteDuLot,
  toutAcheter,
} from "../sim/machines.js";
import { Decimal } from "../sim/nombre.js";
import { formater } from "./format.js";

const ESPACE = " ";
const MINUTE = new Decimal(60);
const HEURE = new Decimal(3600);
const PRESQUE = new Decimal(10);

// Les cartes des machines, la ligne de production, la ligne d'aide et les
// commandes d'achat.
//
// Les huit cartes naissent ici, de MACHINES, AVANT que monterEcran ne vérifie
// le dévoilement : c'est lui qui décide lesquelles se voient. Ce module ne
// décide de rien ; il lit src/sim/machines.js et n'écrit un texte que s'il a
// changé — huit cartes réécrites soixante fois par seconde feraient chauffer
// le téléphone.
export function monterMachines(jeu, { apresAchat }) {
  const conteneur = document.getElementById("machines");
  const ligneProduction = document.getElementById("production");
  const boutonsMode = [...document.querySelectorAll("[data-mode-achat]")];
  const boutonTout = document.getElementById("tout-acheter");

  document.getElementById("aide-debut").textContent =
    `Une ${MACHINES[0].nom.toLowerCase()} produit de l'énergie.`;

  const cartes = MACHINES.map((m, i) => creerCarte(m, i === 0 ? null : MACHINES[i - 1]));
  for (const carte of cartes) conteneur.append(carte.el);

  for (const carte of cartes) {
    carte.bouton.addEventListener("click", () => {
      const etat = jeu.etat;
      if (etat.preferences.modeAchat === "lot") acheterLot(etat, carte.n);
      else acheter(etat, carte.n);
      apresAchat();
    });
  }
  for (const bouton of boutonsMode) {
    bouton.addEventListener("click", () => {
      jeu.etat.preferences.modeAchat = bouton.dataset.modeAchat;
      apresAchat();
    });
  }
  boutonTout.addEventListener("click", () => {
    toutAcheter(jeu.etat);
    apresAchat();
  });

  let productionAffichee = null;
  let modeAffiche = null;

  return {
    rendre(etat) {
      const parSeconde = production(etat, 1);

      const texteProduction = `+${formater(parSeconde)}${ESPACE}J/s`;
      if (texteProduction !== productionAffichee) {
        ligneProduction.textContent = texteProduction;
        productionAffichee = texteProduction;
      }

      const mode = etat.preferences.modeAchat;
      if (mode !== modeAffiche) {
        for (const b of boutonsMode) {
          b.setAttribute("aria-pressed", String(b.dataset.modeAchat === mode));
        }
        modeAffiche = mode;
      }

      for (const carte of cartes) {
        // Une carte cachée ne se calcule pas : le dévoilement passe avant.
        if (carte.el.hidden) continue;
        rendreCarte(carte, etat, mode, parSeconde);
      }
    },
  };
}

function creerCarte(m, precedente) {
  const el = document.createElement("article");
  el.className = "machine";
  el.dataset.devoile = `machine-${m.id}`;
  el.hidden = true;

  const gauche = document.createElement("div");
  gauche.className = "machine-gauche";

  const nom = document.createElement("h2");
  nom.className = "machine-nom";
  const texteNom = document.createElement("span");
  texteNom.textContent = m.nom;
  const nouveau = document.createElement("span");
  nouveau.className = "nouveau";
  nouveau.textContent = "Nouveau";
  nom.append(texteNom, " ", nouveau);

  const ligneEtat = document.createElement("p");
  ligneEtat.className = "machine-etat";

  const produit = document.createElement("p");
  produit.className = "machine-produit";
  produit.textContent = precedente === null ? "produit l'énergie" : `produit des ${precedente.pluriel}`;

  gauche.append(nom, ligneEtat, produit);

  const droite = document.createElement("div");
  droite.className = "machine-droite";
  const bouton = document.createElement("button");
  bouton.type = "button";
  bouton.className = "machine-prix";
  const attente = document.createElement("p");
  attente.className = "machine-attente";
  droite.append(bouton, attente);

  el.append(gauche, droite);

  return {
    n: m.id,
    nom: m.nom,
    el,
    nouveau,
    ligneEtat,
    bouton,
    attente,
    // Ce qui est à l'écran : on n'écrit que ce qui change.
    affiche: {},
  };
}

function rendreCarte(carte, etat, mode, parSeconde) {
  const n = carte.n;
  const m = etat.machines[n - 1];
  const lot = mode === "lot";
  const cout = lot ? prixDuLot(etat, n) : prix(etat, n);
  const texteCout = formater(cout);
  const payable = cout.lte(etat.energie);
  // undefined : payable, rien à attendre ; null : rien ne produit.
  const secondes = payable ? undefined : attenteEnSecondes(cout, etat.energie, parSeconde);

  ecrire(carte, "nouveau", etat.decouvertes.machines < n, (v) => { carte.nouveau.hidden = !v; });
  ecrire(
    carte,
    "etat",
    `${formater(m.quantite.floor())} · ×${formater(multiplicateur(etat, n))} · lot ${m.achetees % TAILLE_LOT}/${TAILLE_LOT}`,
    (v) => { carte.ligneEtat.textContent = v; },
  );
  ecrire(carte, "prix", `${texteCout}${ESPACE}J`, (v) => { carte.bouton.textContent = v; });
  ecrire(
    carte,
    "label",
    lot
      ? `Acheter ${resteDuLot(etat, n)} : ${carte.nom}, ${texteCout} J`
      : `Acheter : ${carte.nom}, ${texteCout} J`,
    (v) => { carte.bouton.setAttribute("aria-label", v); },
  );
  ecrire(carte, "disabled", !payable, (v) => { carte.bouton.disabled = v; });
  ecrire(carte, "attente", texteAttente(secondes), (v) => { carte.attente.textContent = v; });
  // Bordure orange : on peut payer, ou presque (moins de 10 s d'attente).
  ecrire(
    carte,
    "presque",
    payable || (secondes != null && secondes.lt(PRESQUE)),
    (v) => { carte.el.classList.toggle("presque", v); },
  );
}

function ecrire(carte, cle, valeur, appliquer) {
  if (carte.affiche[cle] === valeur) return;
  carte.affiche[cle] = valeur;
  appliquer(valeur);
}

// L'attente avant de pouvoir payer, en secondes, avec la production d'énergie
// COURANTE : null si rien ne produit. Elle ignore que la production monte
// d'ici là, donc elle surestime ; c'est une indication, pas une promesse.
function attenteEnSecondes(cout, energie, parSeconde) {
  if (parSeconde.lte(0)) return null;
  return cout.minus(energie).div(parSeconde);
}

function texteAttente(secondes) {
  if (secondes === undefined) return "";
  if (secondes === null) return "plus tard";
  if (secondes.lt(MINUTE)) return `dans ${formater(secondes.ceil())}${ESPACE}s`;
  if (secondes.lt(HEURE)) return `~${formater(secondes.div(MINUTE).ceil())}${ESPACE}min`;
  return "plus tard";
}
