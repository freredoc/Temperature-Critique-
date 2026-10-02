import { MACHINES } from "../../src/data/machines.js";
import { machinesDebloquees } from "../../src/sim/machines.js";
import { Decimal } from "../../src/sim/nombre.js";
import { formater, formaterDuree, formaterEntier } from "../../src/ui/format.js";
import { CIBLES, TOLERANCE_POUR_MILLE } from "./cibles.js";
import { STRATEGIES } from "./strategies.js";

// Ce que la mesure rend : un texte Markdown, écrit pour Ethan. Des phrases
// courtes, aucun nom de fonction.
//
// Le texte ne dépend QUE des résultats et de l'entête : ni date, ni durée
// d'exécution. Deux mesures des mêmes règles donnent le même texte à l'octet.
//
// Les quantités de jeu passent par `formater`, jamais par Number : un Decimal
// ne devient un nombre JavaScript qu'une fois ramené à un pour-mille.

const MOINS = "−";
const INSECABLE = "\u00a0";

// resultats : ce que rend `jouer`, plus `horsLigne` (voir mesurer.js).
// entete : { version, build }.
export function rediger(resultats, entete) {
  const options = resultats.options;
  const lignes = [];

  lignes.push(`# Mesure — Température Critique ${entete.version} · build ${entete.build}`);
  lignes.push("");
  lignes.push(`Le joueur automatique joue une partie neuve. Stratégie : ${STRATEGIES[options.strategie].phrase}`);
  lignes.push("");
  lignes.push(
    `Il décide une fois toutes les ${secondes(options.cadenceMs)} de jeu, et s'arrête à ` +
      `${formater(new Decimal(options.jusqua))} J ou après ${formaterDuree(options.dureeMaxMs)} de jeu.`,
  );
  lignes.push("");

  lignes.push(...sectionReperes(resultats));
  lignes.push(...sectionDecades(resultats));
  lignes.push(...sectionPremiersAchats(resultats));
  lignes.push(...sectionHorsLigne(resultats));
  lignes.push(...sectionPasEncore());

  return lignes.join("\n");
}

// 1. Repères face au plan.
function sectionReperes(resultats) {
  const lignes = [
    "## 1. Repères face au plan",
    "",
    `Une durée est « dans la cible » si elle tient à ±${formaterPourMille(TOLERANCE_POUR_MILLE)} % de la cible, ` +
      "sinon « hors cible ».",
    "",
    "| Repère | Mesuré | Cible | Écart | Verdict |",
    "|---|---|---|---|---|",
  ];
  for (const cible of CIBLES) {
    if (cible.mesure === null) continue;
    lignes.push(ligneDeRepere(cible, resultats));
  }
  lignes.push("");
  return lignes;
}

function ligneDeRepere(cible, resultats) {
  if (cible.mesure === "palier1") {
    // Le temps de la décade du seuil, jamais celui de l'arrêt de la partie :
    // une partie arrêtée plus tôt (`jusqua` plus bas) ne dit rien du seuil.
    const decade = resultats.decades.find((d) => d.exposant === cible.exposant);
    if (decade === undefined) {
      const verdict = resultats.arriveeMs === null ? "hors cible" : "non mesuré";
      return `| ${cible.repere} | non atteint en ${formaterDuree(resultats.finMs)} de jeu | ${cible.cible} | — | ${verdict} |`;
    }
    const ms = decade.ms;
    const pourMille = ecartPourMille(ms, cible.cibleMs);
    const verdict = Math.abs(pourMille) <= TOLERANCE_POUR_MILLE ? "dans la cible" : "hors cible";
    return `| ${cible.repere} | ${duree(ms)} | ${cible.cible} | ${formaterPourMilleSigne(pourMille)} % | ${verdict} |`;
  }
  if (cible.mesure === "ecartSansAchat") {
    const ecart = resultats.ecart;
    if (ecart === null) {
      return `| ${cible.repere} | aucun (moins de deux achats) | ${cible.cible} | — | sous le plafond |`;
    }
    const verdict = ecart.ms <= cible.plafondMs ? "sous le plafond" : "au-dessus";
    const mesure = `${duree(ecart.ms)}, de ${secondes(ecart.debutMs)} à ${secondes(ecart.finMs)}`;
    const pourMille = ecartPourMille(ecart.ms, cible.plafondMs);
    return `| ${cible.repere} | ${mesure} | ${cible.cible} | ${formaterPourMilleSigne(pourMille)} % | ${verdict} |`;
  }
  throw new RangeError(`rapport : mesure inconnue (${cible.mesure})`);
}

// 2. Les décades.
function sectionDecades(resultats) {
  const lignes = ["## 2. Les décades", "", "Le temps de jeu pour atteindre chaque puissance de dix.", ""];
  lignes.push("| Énergie | Atteinte à |", "|---|---|");
  for (const { exposant, ms } of resultats.decades) {
    lignes.push(`| 10${exposantEnChiffres(exposant)} J | ${duree(ms)} |`);
  }
  lignes.push("");
  return lignes;
}

// 3. Les premiers achats.
function sectionPremiersAchats(resultats) {
  const etat = resultats.etatFinal;
  const lignes = [
    "## 3. Les premiers achats",
    "",
    "Quand chaque machine est achetée pour la première fois, et où elle en est à la fin.",
    "",
    "| Machine | Premier achat | Achetées | Possédées à la fin |",
    "|---|---|---|---|",
  ];
  for (let n = 1; n <= machinesDebloquees(etat); n++) {
    const ms = resultats.premiersAchats[n - 1];
    const machine = etat.machines[n - 1];
    const quand = ms === null ? "jamais" : duree(ms);
    lignes.push(`| ${MACHINES[n - 1].nom} | ${quand} | ${formaterEntier(machine.achetees)} | ${formater(machine.quantite)} |`);
  }
  lignes.push("");
  lignes.push(`Énergie à la fin : ${formater(etat.energie)} J.`);
  lignes.push("");
  return lignes;
}

// 4. Le hors ligne.
function sectionHorsLigne(resultats) {
  const lignes = [
    "## 4. Le hors ligne",
    "",
    "Quand tu reviens, le jeu calcule en une fois ce que tes machines ont produit pendant ton absence. " +
      "On compare à ce qu'elles auraient produit si l'appli était restée ouverte sans toi. " +
      "Aucun achat pendant l'absence, des deux côtés.",
    "",
    "| Moment de la partie | Absence | Gain rendu au retour | Gain appli ouverte | Écart |",
    "|---|---|---|---|---|",
  ];
  const groupes = [];
  for (const mesure of resultats.horsLigne) {
    const pourMille = rapportPourMille(mesure.gainRattrape, mesure.gainPasAPas);
    let groupe = groupes.at(-1);
    if (groupe === undefined || groupe.ms !== mesure.ms) {
      groupe = { ms: mesure.ms, machinesEnMarche: mesure.machinesEnMarche, pourMilles: [] };
      groupes.push(groupe);
    }
    groupe.pourMilles.push(pourMille);
    const moment =
      `${formater(mesure.seuil)} J, à ${secondes(mesure.ms)}, ` +
      `${mesure.machinesEnMarche} machine${mesure.machinesEnMarche > 1 ? "s" : ""} en marche`;
    lignes.push(
      `| ${moment} | ${formaterDuree(mesure.absenceMs)} | ${formater(mesure.gainRattrape)} J | ` +
        `${formater(mesure.gainPasAPas)} J | ${formaterPourMilleSigne(pourMille)} % |`,
    );
  }
  lignes.push("");
  if (groupes.length > 0) {
    const pertes = groupes.flatMap((g) => g.pourMilles).map((p) => -p);
    const plusPetite = Math.min(...pertes);
    const plusGrande = Math.max(...pertes);
    const x =
      plusPetite === plusGrande
        ? formaterPourMille(plusPetite)
        : `${formaterPourMille(plusPetite)} à ${formaterPourMille(plusGrande)}`;
    lignes.push(`Quand tu reviens, le jeu te rend ${x} % de moins que s'il était resté ouvert.`);
    // Ce qui suit se lit dans les nombres ci-dessus, il ne s'écrit pas d'avance.
    const stable = groupes.every((g) => g.pourMilles.every((p) => p === g.pourMilles[0]));
    if (stable && groupes.length > 1) {
      const machines = groupes.map((g) => g.machinesEnMarche);
      lignes.push(
        "L'écart ne change pas avec la durée de l'absence. Il grandit avec le nombre de machines en marche " +
          `(${enumerer(machines)}).`,
      );
    } else if (!stable) {
      lignes.push("L'écart change avec la durée de l'absence.");
    }
    lignes.push("Pas de verdict : la cible n'est pas encore chiffrée.");
  } else {
    lignes.push("Aucun instantané n'a été atteint : rien à comparer.");
  }
  lignes.push("");
  return lignes;
}

// 5. Pas encore mesurable.
function sectionPasEncore() {
  const lignes = [
    "## 5. Pas encore mesurable",
    "",
    "Ces repères du plan demandent une mécanique que le jeu n'a pas encore.",
    "",
    "| Repère | Cible | Source | Mesurable avec |",
    "|---|---|---|---|",
  ];
  for (const cible of CIBLES) {
    if (cible.mesure !== null) continue;
    lignes.push(`| ${cible.repere} | ${cible.cible} | ${cible.source} | ${cible.lot} |`);
  }
  lignes.push("");
  return lignes;
}

// « 3 min 42 s (222,75 s) ». Quand les deux écritures disent la même chose
// (« 10 s »), une seule.
function duree(ms) {
  const lisible = formaterDuree(ms);
  const exacte = secondes(ms);
  return lisible === exacte ? lisible : `${lisible} (${exacte})`;
}

// « 222,75 s », l'unité collée au nombre par une espace insécable, comme le
// fait l'écran du jeu : c'est ce qui permet de comparer les deux écritures.
function secondes(ms) {
  return `${formaterSecondes(ms)}${INSECABLE}s`;
}

// [2, 3, 4] → « 2, 3 puis 4 ».
function enumerer(nombres) {
  if (nombres.length === 1) return String(nombres[0]);
  return `${nombres.slice(0, -1).join(", ")} puis ${nombres.at(-1)}`;
}

// 222750 → « 222,75 » ; 69000 → « 69 ». Des millisecondes entières, sans
// arrondi : la virgule tombe à trois chiffres de la fin.
function formaterSecondes(ms) {
  const entier = formaterEntier(Math.floor(ms / 1000));
  const reste = String(ms % 1000).padStart(3, "0").replace(/0+$/, "");
  return reste === "" ? entier : `${entier},${reste}`;
}

// Écart relatif entre deux durées, en pour-mille arrondi.
function ecartPourMille(mesureMs, cibleMs) {
  return Math.round(((mesureMs - cibleMs) * 1000) / cibleMs);
}

// (a / b − 1), en pour-mille arrondi. Le rapport est un Decimal ; il ne
// devient un Number qu'une fois ramené à l'échelle d'un pour-mille, jamais
// comme quantité de jeu.
function rapportPourMille(a, b) {
  const pourMille = a.div(b).minus(1).times(1000).round();
  return pourMille.toNumber();
}

// −3 → « 0,3 », au signe près : un pour-mille à une décimale de pour-cent.
function formaterPourMille(pourMille) {
  const n = Math.abs(pourMille);
  return `${formaterEntier(Math.floor(n / 10))},${n % 10}`;
}

// −3 → « −0,3 », 12 → « +1,2 », 0 → « 0,0 ».
function formaterPourMilleSigne(pourMille) {
  if (pourMille < 0) return MOINS + formaterPourMille(pourMille);
  if (pourMille > 0) return "+" + formaterPourMille(pourMille);
  return formaterPourMille(0);
}

const EXPOSANTS = "⁰¹²³⁴⁵⁶⁷⁸⁹";

function exposantEnChiffres(n) {
  return String(n)
    .split("")
    .map((c) => EXPOSANTS[Number(c)])
    .join("");
}
