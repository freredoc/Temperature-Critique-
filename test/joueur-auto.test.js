import assert from "node:assert/strict";
import { test } from "node:test";

import { etatInitial } from "../src/sim/etat.js";
import { Decimal } from "../src/sim/nombre.js";
import { mesurerHorsLigne } from "../tools/joueur-auto/horsligne.js";
import { mesurer } from "../tools/joueur-auto/mesurer.js";

// Le texte privé de son en-tête : tout ce qui précède la première ligne qui
// commence par « ## ». L'en-tête affiche les options demandées ; le reste
// est ce que la partie a mesuré.
function sansEntete(texte) {
  const lignes = texte.split("\n");
  const premiere = lignes.findIndex((l) => l.startsWith("##"));
  assert.ok(premiere > 0, "le texte n'a pas de section « ## »");
  return lignes.slice(premiere).join("\n");
}

test("JOUEUR-AUTO T1 — deux mesures de suite donnent le même texte", () => {
  const A = {
    strategie: "machines",
    cadenceMs: 250,
    jusqua: "1e6",
    dureeMaxMs: 7_200_000,
    instantanes: ["1e3"],
    absences: [600_000],
  };
  const entete = { version: "test", build: 0 };

  // Dans le même processus : un état qui survivrait entre deux appels se
  // verrait à la troisième mesure.
  const A1 = mesurer(A, entete);
  const B = mesurer({ ...A, cadenceMs: 1000 }, entete);
  const A2 = mesurer(A, entete);

  // 1. Même options, même texte, au caractère près.
  assert.equal(A2, A1, "deux mesures des mêmes options ont rendu deux textes");

  // 2. La cadence change la mesure elle-même, pas seulement l'en-tête.
  // (10⁶ J arrive à 130,35 s au lieu de 128,3 s ; pas d'assertion sur un
  // temps : ce serait un test d'équilibrage.)
  assert.notEqual(
    sansEntete(B),
    sansEntete(A1),
    "une cadence de 1000 ms rend la même mesure qu'une cadence de 250 ms : la cadence est ignorée",
  );
});

// Écart relatif ≤ 1e-9, en Decimal.
function presque(obtenu, attendu, nom) {
  const ecart = obtenu.minus(attendu).abs().div(attendu);
  assert.ok(ecart.lte(1e-9), `${nom} : obtenu ${obtenu.toString()}, attendu ${attendu} (écart relatif ${ecart.toString()})`);
}

test("JOUEUR-AUTO T2 — l'instrument du hors ligne compare les bonnes choses", () => {
  const etat = etatInitial(0);
  etat.energie = new Decimal(0);
  etat.machines[0].quantite = new Decimal(10);
  etat.machines[0].achetees = 0;
  etat.machines[1].quantite = new Decimal(10);
  etat.machines[1].achetees = 0;

  const { gainRattrape, gainPasAPas } = mesurerHorsLigne(etat, 3_600_000);

  // Valeurs exactes, aT + bT²(N − 1) / (2N), a = b = 10, T = 3600 s.
  // 1. Le chemin du jeu au retour : 1000 pas de 3,6 s.
  presque(gainRattrape, 64_771_200, "gain rendu au retour (N = 1000)");
  // 2. L'appli restée ouverte : 72 000 pas de 50 ms.
  presque(gainPasAPas, 64_835_100, "gain appli ouverte (N = 72 000)");

  // 3. L'état d'entrée n'a pas bougé.
  assert.ok(etat.energie.eq(0), `énergie de l'état d'entrée : ${etat.energie}`);
  assert.ok(etat.machines[0].quantite.eq(10), `Dynamo de l'état d'entrée : ${etat.machines[0].quantite}`);
  assert.ok(etat.machines[1].quantite.eq(10), `Alternateur de l'état d'entrée : ${etat.machines[1].quantite}`);
  assert.equal(etat.temps.totalMs, 0, "le temps de l'état d'entrée a avancé");
});
