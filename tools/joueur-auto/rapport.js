import { ENERGIE_APRES_PALIER, PALIERS } from "../../src/data/froid.js";
import { MACHINES } from "../../src/data/machines.js";
import { machinesDebloquees, machinesDebloqueesAuPalier } from "../../src/sim/machines.js";
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
const INSECABLE = " ";

// L'écart hors ligne « change un peu » avec la durée de l'absence tant que,
// d'une absence à l'autre, il ne bouge pas de plus de 10 pour-mille (un point
// de pourcentage) ; au-delà, il « change ». C'est un choix d'écriture, pas
// une cible.
const VARIATION_FAIBLE_POUR_MILLE = 10;

// resultats : ce que rend `jouer`, plus `options` et `horsLigne` (voir
// mesurer.js). entete : { version, build }.
export function rediger(resultats, entete) {
  const options = resultats.options;
  const lignes = [];

  lignes.push(`# Mesure — Température Critique ${entete.version} · build ${entete.build}`);
  lignes.push("");
  lignes.push(`Le joueur automatique joue une partie neuve. Stratégie : ${STRATEGIES[options.strategie].phrase}`);
  lignes.push("");
  lignes.push(
    `Il décide une fois toutes les ${secondes(options.cadenceMs)} de jeu, et s'arrête ${conditionsDArret(options)}.`,
  );
  lignes.push("");

  lignes.push(...sectionReperes(resultats));
  lignes.push(...sectionPaliers(resultats));
  lignes.push(...sectionDecades(resultats));
  lignes.push(...sectionPremiersAchats(resultats));
  lignes.push(...sectionHorsLigne(resultats));
  lignes.push(...sectionPasEncore(resultats));

  return lignes.join("\n");
}

// « au palier 6 (1,5 K) ou après 2 h 0 min de jeu ».
function conditionsDArret(options) {
  const conditions = [];
  if (options.jusqua !== undefined) conditions.push(`à ${formater(new Decimal(options.jusqua))} J`);
  if (options.jusquaPalier !== undefined) {
    conditions.push(`au palier ${options.jusquaPalier} (${temperature(options.jusquaPalier)})`);
  }
  conditions.push(`après ${formaterDuree(options.dureeMaxMs)} de jeu`);
  return ou(conditions);
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
  if (cible.mesure === "palier") {
    // Un palier se lit au refroidissement, quand le joueur appuie.
    const atteint = resultats.paliers.find((p) => p.palier === cible.palier);
    if (atteint === undefined) {
      // Trop lent, si la partie a joué toute sa durée bien au-delà de la
      // cible ; sinon elle s'est arrêtée trop tôt pour en rien dire.
      const tropLent = resultats.arret.cause === "duree"
        && ecartPourMille(resultats.finMs, cible.cibleMs) > TOLERANCE_POUR_MILLE;
      const verdict = tropLent ? "hors cible" : "non mesuré";
      return `| ${cible.repere} | non atteint en ${formaterDuree(resultats.finMs)} de jeu | ${cible.cible} | — | ${verdict} |`;
    }
    const pourMille = ecartPourMille(atteint.ms, cible.cibleMs);
    const verdict = Math.abs(pourMille) <= TOLERANCE_POUR_MILLE ? "dans la cible" : "hors cible";
    return `| ${cible.repere} | ${duree(atteint.ms)} | ${cible.cible} | ${formaterPourMilleSigne(pourMille)} % | ${verdict} |`;
  }
  if (cible.mesure === "ecartEntreAchats") {
    const ecart = resultats.ecart;
    if (ecart === null) {
      return `| ${cible.repere} | aucun (jamais deux achats dans un même palier) | ${cible.cible} | — | sous le plafond |`;
    }
    const verdict = ecart.ms <= cible.plafondMs ? "sous le plafond" : "au-dessus";
    const mesure = `${duree(ecart.ms)}, de ${secondes(ecart.debutMs)} à ${secondes(ecart.finMs)}, au palier ${ecart.palier}`;
    const pourMille = ecartPourMille(ecart.ms, cible.plafondMs);
    return `| ${cible.repere} | ${mesure} | ${cible.cible} | ${formaterPourMilleSigne(pourMille)} % | ${verdict} |`;
  }
  throw new RangeError(`rapport : mesure inconnue (${cible.mesure})`);
}

// 2. Les paliers.
function sectionPaliers(resultats) {
  const lignes = [
    "## 2. Les paliers",
    "",
    "Une ligne par palier joué. « Écart max » : le plus long écart entre deux achats dans le palier. " +
      "« Attente du seuil » : du dernier achat du palier au refroidissement suivant ; le joueur ne peut " +
      "plus rien acheter, il regarde la jauge monter.",
    "",
    "| Palier | Température | Atteint à | Durée du palier | Machines | Écart max entre deux achats | Attente du seuil |",
    "|---|---|---|---|---|---|---|",
  ];
  for (const { palier, debutMs, finMs, ecart, attente } of resultats.releves) {
    const quoi = `${temperature(palier)}, ${PALIERS[palier].technique.toLowerCase()}`;
    const dureeDuPalier = finMs === null ? "—" : duree(finMs - debutMs);
    const ecartMax = ecart === null
      ? "—"
      : `${secondes(ecart.ms)}, de ${secondes(ecart.debutMs)} à ${secondes(ecart.finMs)}`;
    const attenteDuSeuil = attente === null ? "—" : secondes(attente.ms);
    lignes.push(
      `| ${palier} | ${quoi} | ${duree(debutMs)} | ${dureeDuPalier} | ${machinesDebloqueesAuPalier(palier)} | ` +
        `${ecartMax} | ${attenteDuSeuil} |`,
    );
  }
  lignes.push("");
  const dernier = resultats.releves.at(-1);
  if (dernier.finMs === null) {
    lignes.push(
      `La partie s'arrête au palier ${dernier.palier}, à ${duree(resultats.finMs)} : ` +
        "ce palier n'a encore ni durée, ni attente.",
    );
    lignes.push("");
  }
  return lignes;
}

// 3. La montée du premier palier : les décades, jusqu'à son seuil.
function sectionDecades(resultats) {
  const seuil = new Decimal(PALIERS[1].seuil);
  const depart = new Decimal(ENERGIE_APRES_PALIER);
  const lignes = [
    "## 3. La montée du premier palier",
    "",
    `Le temps de jeu pour atteindre chaque puissance de dix, jusqu'au seuil du palier 1 (${formater(seuil)} J). ` +
      `Plus haut, l'énergie repart de ${formater(depart)} J à chaque palier : une décade n'y voudrait plus rien dire.`,
    "",
    "| Énergie | Atteinte à |",
    "|---|---|",
  ];
  for (const { exposant, ms } of resultats.decades) {
    lignes.push(`| 10${exposantEnChiffres(exposant)} J | ${duree(ms)} |`);
  }
  lignes.push("");
  return lignes;
}

// 4. Les premiers achats.
function sectionPremiersAchats(resultats) {
  const lignes = [
    "## 4. Les premiers achats",
    "",
    "Quand chaque machine est achetée pour la première fois.",
    "",
    "| Machine | Premier achat |",
    "|---|---|",
  ];
  for (let n = 1; n <= machinesDebloquees(resultats.etatFinal); n++) {
    const ms = resultats.premiersAchats[n - 1];
    lignes.push(`| ${MACHINES[n - 1].nom} | ${ms === null ? "jamais" : duree(ms)} |`);
  }
  lignes.push("");
  return lignes;
}

// 5. Le hors ligne.
function sectionHorsLigne(resultats) {
  const lignes = [
    "## 5. Le hors ligne",
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
      `${formater(mesure.seuil)} J, à ${secondes(mesure.ms)}, palier ${mesure.palier}, ` +
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
    if (groupes[0].pourMilles.length > 1) lignes.push(phraseDeLaDuree(groupes));
    if (grandit(groupes)) {
      lignes.push(`Il grandit avec le nombre de machines en marche (${enumerer(groupes.map((g) => g.machinesEnMarche))}).`);
    }
    lignes.push("Pas de verdict : la cible n'est pas encore chiffrée.");
  } else {
    lignes.push("Aucun instantané n'a été atteint : rien à comparer.");
  }
  lignes.push("");
  return lignes;
}

// La durée de l'absence change-t-elle l'écart ? On prend, à chaque moment de
// la partie, l'écart entre la plus petite et la plus grande perte d'une
// absence à l'autre, en pour-mille arrondi comme dans le tableau : un écart
// qui ne bouge qu'en deçà du pour-mille « ne change pas ».
function phraseDeLaDuree(groupes) {
  const variation = Math.max(...groupes.map((g) => Math.max(...g.pourMilles) - Math.min(...g.pourMilles)));
  if (variation === 0) return "L'écart ne change pas avec la durée de l'absence.";
  const points = `${formaterPourMille(variation)} point${variation >= 20 ? "s" : ""}`;
  if (variation <= VARIATION_FAIBLE_POUR_MILLE) {
    return `L'écart change un peu avec la durée de l'absence : ${points} au plus d'une absence à l'autre.`;
  }
  return `L'écart change avec la durée de l'absence : jusqu'à ${points} d'une absence à l'autre.`;
}

// L'écart grandit-il avec le nombre de machines en marche ? Oui si, d'un
// moment de la partie au suivant, il y a plus de machines ET la perte est
// plus grande, pour chaque durée d'absence.
function grandit(groupes) {
  if (groupes.length < 2) return false;
  return groupes.every((g, i) => i === 0 || (
    g.machinesEnMarche > groupes[i - 1].machinesEnMarche
    && g.pourMilles.every((p, j) => p < groupes[i - 1].pourMilles[j])
  ));
}

// 6. Pas encore mesurable.
function sectionPasEncore(resultats) {
  const lignes = [
    "## 6. Pas encore mesurable",
    "",
    "Ces repères du plan demandent une mécanique que le jeu n'a pas encore.",
    "",
    "| Repère | Cible | Source | Mesurable avec |",
    "|---|---|---|---|",
  ];
  const notes = [];
  for (const cible of CIBLES) {
    if (cible.mesure !== null) continue;
    lignes.push(`| ${cible.repere} | ${cible.cible} | ${cible.source} | ${cible.lot} |`);
    // Un palier atteint se lit au § 2, mais sa cible ne se juge pas encore.
    const atteint = cible.palier === undefined ? undefined : resultats.paliers.find((p) => p.palier === cible.palier);
    if (atteint !== undefined) {
      notes.push(`${cible.repere} : ${duree(atteint.ms)} (§ 2), sans verdict : ${cible.pourquoi}.`);
    }
  }
  lignes.push("");
  if (notes.length > 0) lignes.push(...notes, "");
  return lignes;
}

// « 194,65 K » : `formater` garde jusqu'à trois décimales, sans zéros
// inutiles (« 27,1 K »).
function temperature(palier) {
  return `${formater(new Decimal(PALIERS[palier].kelvins))} K`;
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

// ["a", "b", "c"] → « a, b ou c ».
function ou(elements) {
  if (elements.length === 1) return elements[0];
  return `${elements.slice(0, -1).join(", ")} ou ${elements.at(-1)}`;
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
