import { Decimal } from "./nombre.js";
import { MACHINES, MACHINES_AU_DEPART, MULTIPLICATEUR_LOT, TAILLE_LOT } from "../data/machines.js";

// La cascade : prix, multiplicateurs, production et achats des machines.
// Les machines se numérotent de 1 à 8, comme dans MACHINES ; `etat.machines`
// les range de 0 à 7.
//
// ⚠ PAS DE DIVISION PAR 10 : la machine n produit la machine n − 1 au plein.
// AD n'en produit que le dixième (antimatter-dimension.js, ligne 664) ; ici
// c'est un écart voulu, celui de la simulation du 23/09 qui a calé le plan.
// Ne pas « corriger » vers AD.

// Les textes de MACHINES deviennent des Decimal ici, une fois.
const COUTS = MACHINES.map((m) => new Decimal(m.cout));
const FACTEURS = MACHINES.map((m) => new Decimal(m.facteur));
const MULTIPLICATEUR = new Decimal(MULTIPLICATEUR_LOT);

// Combien de machines s'achètent et produisent. Les paliers de froid en
// ouvriront davantage.
export function machinesDebloquees(etat) {
  return MACHINES_AU_DEPART;
}

// Les lots complets achetés : c'est `achetees`, jamais `quantite`, qui fixe
// le prix et le multiplicateur. Une machine produite par la cascade ne coûte
// rien et n'avance pas le lot.
function lotsComplets(etat, n) {
  return Math.floor(machine(etat, n).achetees / TAILLE_LOT);
}

// Le multiplicateur de production de la machine n. Les multiplicateurs se
// composent ici, et nulle part ailleurs : le lot FROID y ajoutera le ×2 par
// palier.
export function multiplicateur(etat, n) {
  return MULTIPLICATEUR.pow(lotsComplets(etat, n));
}

// Le prix de la prochaine unité de la machine n.
export function prix(etat, n) {
  return COUTS[n - 1].times(FACTEURS[n - 1].pow(lotsComplets(etat, n)));
}

// Combien d'unités restent à acheter avant la fin du lot en cours : de 1 à
// TAILLE_LOT.
export function resteDuLot(etat, n) {
  return TAILLE_LOT - (machine(etat, n).achetees % TAILLE_LOT);
}

// Le prix du reste du lot en cours, au prix courant.
export function prixDuLot(etat, n) {
  return prix(etat, n).times(resteDuLot(etat, n));
}

// Ce que la machine n produit par seconde : des joules pour la machine 1,
// des machines n − 1 pour les autres. Zéro si elle n'est pas débloquée.
export function production(etat, n) {
  if (n > machinesDebloquees(etat)) return new Decimal(0);
  return machine(etat, n).quantite.times(multiplicateur(etat, n));
}

// Un pas de production, appelé par `avancer`. Euler explicite : toutes les
// productions se calculent sur les quantités du DÉBUT du pas, puis
// s'ajoutent, l'énergie d'abord, les machines ensuite. C'est la règle de la
// simulation du 23/09 ; laisser la Dynamo profiter des dynamos produites dans
// le même pas donnerait un autre jeu, plus rapide sans que personne l'ait
// décidé.
//
// Un grand pas sous-estime une cascade : le rattrapage hors ligne est donc un
// peu plus avare qu'en jeu. C'est accepté, et ne se corrige pas ici.
export function produire(etat, dtMs) {
  const secondes = dtMs / 1000;
  const gains = [];
  for (let n = 1; n <= machinesDebloquees(etat); n++) {
    gains.push(production(etat, n).times(secondes));
  }
  etat.energie = etat.energie.plus(gains[0]);
  for (let n = 2; n <= gains.length; n++) {
    const produite = machine(etat, n - 1);
    produite.quantite = produite.quantite.plus(gains[n - 1]);
  }
}

// Achète une unité de la machine n si elle est débloquée et si l'énergie
// suffit. Rend true ou false.
export function acheter(etat, n) {
  return acheterUnites(etat, n, 1);
}

// Achète le reste du lot en cours de la machine n, au prix courant, si et
// seulement si l'énergie suffit pour tout : jamais de lot partiel. Rend le
// nombre d'unités achetées, 0 ou le reste du lot.
export function acheterLot(etat, n) {
  const reste = resteDuLot(etat, n);
  return acheterUnites(etat, n, reste) ? reste : 0;
}

// Achète tout ce que l'énergie paie, de la plus haute machine débloquée à la
// plus basse. Le prix ne change qu'en fin de lot : on achète donc lot par
// lot, k = min(reste du lot, floor(énergie / prix)) unités d'un coup, ce qui
// donne exactement le même état que la boucle unité par unité. Rend le nombre
// d'unités achetées.
export function toutAcheter(etat) {
  let total = 0;
  for (let n = machinesDebloquees(etat); n >= 1; n--) {
    for (;;) {
      const p = prix(etat, n);
      // k se cherche en descendant depuis le reste du lot (au plus 10
      // essais), en comparant le produit à l'énergie : jamais de division,
      // jamais de Number tiré d'un Decimal, et jamais d'énergie négative.
      let k = resteDuLot(etat, n);
      while (k > 0 && p.times(k).gt(etat.energie)) k--;
      if (k === 0) break;
      payer(etat, n, p.times(k), k);
      total += k;
    }
  }
  return total;
}

function acheterUnites(etat, n, k) {
  verifierNumero(n);
  if (n > machinesDebloquees(etat)) return false;
  const cout = prix(etat, n).times(k);
  if (cout.gt(etat.energie)) return false;
  payer(etat, n, cout, k);
  return true;
}

function payer(etat, n, cout, k) {
  etat.energie = etat.energie.minus(cout);
  const m = machine(etat, n);
  m.quantite = m.quantite.plus(k);
  m.achetees += k;
  etat.decouvertes.machines = Math.max(etat.decouvertes.machines, n);
}

function machine(etat, n) {
  verifierNumero(n);
  return etat.machines[n - 1];
}

// Un numéro de machine hors de 1…8 est une faute de programme, pas un achat
// refusé.
function verifierNumero(n) {
  if (!Number.isInteger(n) || n < 1 || n > MACHINES.length) {
    throw new RangeError(`numéro de machine invalide : ${n}`);
  }
}
