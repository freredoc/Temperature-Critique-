import assert from "node:assert/strict";
import { test } from "node:test";

import { avancer } from "../src/sim/avancer.js";
import { etatInitial } from "../src/sim/etat.js";
import { acheter, multiplicateur, prix } from "../src/sim/machines.js";
import { Decimal } from "../src/sim/nombre.js";
import { envelopper, exporter, importer, relire, serialiser } from "../src/sim/sauvegarde.js";

test("MACHINES T1 — une sauvegarde v1 devient v2, et les machines se relisent", () => {
  // 1. L'enveloppe exacte qu'un joueur du lot SOCLE a dans son stockage.
  const v1 = {
    saveVersion: 1,
    build: 1,
    sauveLe: 2_000,
    etat: { meta: { creeLe: 1_000, modeTestUtilise: true }, temps: { totalMs: 5_000 }, energie: new Decimal("1e400") },
  };
  const lu = relire(serialiser(v1));
  assert.equal(lu.ok, true, lu.message);
  assert.equal(lu.enveloppe.saveVersion, 2);
  assert.equal(lu.migreeDepuis, 1);
  const etat = lu.enveloppe.etat;
  assert.equal(etat.machines.length, 8);
  etat.machines.forEach((m, i) => {
    assert.ok(m.quantite instanceof Decimal, `machine ${i + 1} : quantité ${JSON.stringify(m.quantite)}`);
    assert.ok(m.quantite.eq(0), `machine ${i + 1} : quantité ${m.quantite}`);
    assert.equal(m.achetees, 0, `machine ${i + 1}`);
  });
  assert.equal(etat.decouvertes.machines, 0);
  assert.equal(etat.preferences.modeAchat, "un");
  // Rien d'autre ne bouge.
  assert.ok(etat.energie.eq(new Decimal("1e400")), `énergie : ${etat.energie}`);
  assert.equal(etat.meta.modeTestUtilise, true);
  assert.equal(etat.temps.totalMs, 5_000);

  // 2. Une machine à 1,23e45 et 37 achats traverse un code TC1.
  const e2 = etatInitial(1_000);
  e2.machines[2].quantite = new Decimal("1.23e45");
  e2.machines[2].achetees = 37;
  e2.decouvertes.machines = 3;
  const importe = importer(exporter(envelopper(e2, { build: 2, sauveLe: 2_000 })));
  assert.equal(importe.ok, true, importe.erreur);
  const m3 = importe.enveloppe.etat.machines[2];
  assert.ok(m3.quantite instanceof Decimal, `quantité relue comme ${JSON.stringify(m3.quantite)}`);
  assert.ok(m3.quantite.eq(new Decimal("1.23e45")), `quantité relue : ${m3.quantite}`);
  assert.equal(m3.achetees, 37);
  assert.equal(importe.enveloppe.etat.decouvertes.machines, 3);

  // 3. Une machine de moins : refusé, et le message nomme le champ.
  const e3 = etatInitial(1_000);
  e3.machines.pop();
  const refuse = importer(exporter(envelopper(e3, { build: 2, sauveLe: 2_000 })));
  assert.equal(refuse.ok, false);
  assert.match(refuse.erreur, /machines/);
});

test("MACHINES T2 — la cascade suit ses règles, pas à pas", () => {
  const e = etatInitial(0);
  e.energie = new Decimal(1_000);
  const dynamo = e.machines[0];

  function constater(etape, attendu) {
    assert.ok(e.energie.eq(attendu.energie), `${etape} : énergie ${e.energie}, attendu ${attendu.energie}`);
    assert.ok(dynamo.quantite.eq(attendu.quantite), `${etape} : dynamos ${dynamo.quantite}, attendu ${attendu.quantite}`);
    assert.equal(dynamo.achetees, attendu.achetees, `${etape} : achats`);
    assert.ok(prix(e, 1).eq(attendu.prix), `${etape} : prix ${prix(e, 1)}, attendu ${attendu.prix}`);
    assert.ok(multiplicateur(e, 1).eq(attendu.mult), `${etape} : multiplicateur ${multiplicateur(e, 1)}, attendu ${attendu.mult}`);
  }

  // 1. Neuf dynamos et un alternateur.
  for (let i = 0; i < 9; i++) assert.equal(acheter(e, 1), true, `achat de la dynamo ${i + 1}`);
  assert.equal(acheter(e, 2), true, "achat de l'alternateur");
  constater("étape 1", { energie: 810, quantite: 9, achetees: 9, prix: 10, mult: 1 });

  // 2. Une seconde, en un seul pas : les dynamos du début du pas produisent,
  // la dynamo que l'alternateur vient de faire ne produit pas encore.
  avancer(e, 1_000);
  constater("étape 2", { energie: 819, quantite: 10, achetees: 9, prix: 10, mult: 1 });

  // 3. Le dixième ACHAT fait le lot, pas la dixième dynamo.
  assert.equal(acheter(e, 1), true, "achat de la dixième dynamo");
  constater("étape 3", { energie: 809, quantite: 11, achetees: 10, prix: 10_000, mult: 2 });

  // 4. Onze dynamos au ×2.
  avancer(e, 1_000);
  constater("étape 4", { energie: 831, quantite: 12, achetees: 10, prix: 10_000, mult: 2 });
});
