import assert from "node:assert/strict";
import { test } from "node:test";

import { avancer } from "../src/sim/avancer.js";
import { etatInitial } from "../src/sim/etat.js";
import { apercuRefroidir, refroidir, seuilSuivant } from "../src/sim/froid.js";
import { acheter, machinesDebloquees, multiplicateur, prix } from "../src/sim/machines.js";
import { Decimal } from "../src/sim/nombre.js";
import { SAVE_VERSION, envelopper, exporter, importer, relire, serialiser } from "../src/sim/sauvegarde.js";

test("FROID T1 — la partie v2 s'ouvre en v3, et le palier voyage", () => {
  // 1. Une enveloppe v2 exactement comme le lot MACHINES l'écrit : la forme
  // de la partie d'Ethan, sur son téléphone depuis le 28/09.
  const v2 = {
    saveVersion: 2,
    build: 2,
    sauveLe: 2_000,
    etat: {
      meta: { creeLe: 1_000, modeTestUtilise: false },
      temps: { totalMs: 90_000 },
      energie: new Decimal("12345.678"),
      machines: [
        { quantite: new Decimal(1_500), achetees: 12 },
        { quantite: new Decimal(3), achetees: 3 },
        ...Array.from({ length: 6 }, () => ({ quantite: new Decimal(0), achetees: 0 })),
      ],
      decouvertes: { machines: 2 },
      preferences: { modeAchat: "lot" },
    },
  };
  const lu = relire(serialiser(v2));
  // Chaque message commence par le numéro de son point.
  assert.equal(lu.ok, true, `1. ${lu.message}`);
  // La version courante se lit : un test n'écrit pas en dur un numéro qu'il
  // n'a pas construit lui-même.
  assert.equal(lu.enveloppe.saveVersion, SAVE_VERSION, "1. version après migration");
  assert.equal(lu.migreeDepuis, 2, "1. migrée depuis");
  const etat = lu.enveloppe.etat;
  assert.equal(etat.froid.palier, 0, "1. palier");
  assert.equal(etat.decouvertes.paliers, 0, "1. plus haut palier atteint");
  // Tout le reste intact.
  assert.ok(etat.energie.eq(new Decimal("12345.678")), `1. énergie : ${etat.energie}`);
  const [dynamo, alternateur] = etat.machines;
  assert.ok(dynamo.quantite.eq(1_500), `1. dynamos : ${dynamo.quantite}`);
  assert.equal(dynamo.achetees, 12, "1. dynamos achetées");
  assert.ok(alternateur.quantite.eq(3), `1. alternateurs : ${alternateur.quantite}`);
  assert.equal(alternateur.achetees, 3, "1. alternateurs achetés");
  assert.equal(etat.decouvertes.machines, 2, "1. plus haute machine découverte");
  assert.equal(etat.preferences.modeAchat, "lot", "1. mode d'achat");
  assert.equal(etat.temps.totalMs, 90_000, "1. temps de partie");

  // 2. Le palier et le plus haut palier atteint traversent un code TC1.
  const e2 = etatInitial(1_000);
  e2.froid.palier = 4;
  e2.decouvertes.paliers = 5;
  const importe = importer(exporter(envelopper(e2, { build: 3, sauveLe: 2_000 })));
  assert.equal(importe.ok, true, `2. ${importe.erreur}`);
  assert.equal(importe.enveloppe.etat.froid.palier, 4, "2. palier relu");
  assert.equal(importe.enveloppe.etat.decouvertes.paliers, 5, "2. plus haut palier relu");

  // 3. Deux refus, chacun nommant son champ.
  const importerAvec = (palier, paliers) => {
    const e = etatInitial(1_000);
    e.froid.palier = palier;
    e.decouvertes.paliers = paliers;
    return importer(exporter(envelopper(e, { build: 3, sauveLe: 2_000 })));
  };
  // Un palier 7 (et un plus haut palier resté à 0) : c'est le palier qui est
  // nommé, vérifié AVANT le plus haut palier.
  const horsBornes = importerAvec(7, 0);
  assert.equal(horsBornes.ok, false, "3. un palier 7 est accepté");
  assert.match(horsBornes.erreur, /froid\.palier/, `3. message : ${horsBornes.erreur}`);
  assert.doesNotMatch(horsBornes.erreur, /decouvertes\.paliers/, `3. message : ${horsBornes.erreur}`);
  // Un plus haut palier sous le palier courant.
  const incoherent = importerAvec(4, 3);
  assert.equal(incoherent.ok, false, "3. un plus haut palier (3) sous le palier courant (4) est accepté");
  assert.match(incoherent.erreur, /decouvertes\.paliers/, `3. message : ${incoherent.erreur}`);
});

test("FROID T2 — le palier suit la règle", () => {
  const e = etatInitial(0);
  e.machines[0].quantite = new Decimal(123);
  e.machines[0].achetees = 37;
  e.decouvertes.machines = 4;
  e.energie = new Decimal("999999999");

  // Chaque message commence par le numéro de son point : une falsification
  // dit d'elle-même où elle tombe.

  // 1. Un joule sous le seuil : rien ne bouge.
  assert.equal(refroidir(e), false, "1. refroidir à 999 999 999 J");
  assert.equal(e.froid.palier, 0, "1. palier");
  assert.ok(e.energie.eq(new Decimal("999999999")), `1. énergie : ${e.energie}`);
  assert.ok(e.machines[0].quantite.eq(123), `1. dynamos : ${e.machines[0].quantite}`);
  assert.equal(e.machines[0].achetees, 37, "1. dynamos achetées");

  // 2. Au seuil pile : égal suffit.
  e.energie = new Decimal("1e9");
  assert.equal(refroidir(e), true, "2. refroidir à 1e9 J");
  assert.equal(e.froid.palier, 1, "2. palier");
  assert.ok(e.energie.eq(10), `2. énergie : ${e.energie}`);
  e.machines.forEach((m, i) => {
    assert.ok(m.quantite.eq(0), `2. machine ${i + 1} : quantité ${m.quantite}`);
    assert.equal(m.achetees, 0, `2. machine ${i + 1} : achats`);
  });
  assert.equal(e.decouvertes.paliers, 1, "2. plus haut palier atteint");
  assert.equal(e.decouvertes.machines, 4, "2. la plus haute machine découverte a bougé");
  assert.equal(machinesDebloquees(e), 5, "2. machines débloquées");
  assert.ok(prix(e, 1).eq(10), `2. prix de la dynamo : ${prix(e, 1)}`);
  assert.ok(prix(e, 5).eq(new Decimal("1e9")), `2. prix du réseau : ${prix(e, 5)}`);
  assert.ok(multiplicateur(e, 1).eq(2), `2. multiplicateur de la dynamo : ${multiplicateur(e, 1)}`);

  // 3. 10 J sont loin de 1e15.
  assert.equal(refroidir(e), false, "3. refroidir à 10 J");

  // 4. Une dynamo pendant une seconde : 2 J, elle produit ×2.
  assert.equal(acheter(e, 1), true, "4. achat d'une dynamo");
  avancer(e, 1_000);
  assert.ok(e.energie.eq(2), `4. énergie : ${e.energie}`);

  // 5. Le ×2 du lot et le ×2 du palier se composent.
  e.machines[0].achetees = 10;
  assert.ok(multiplicateur(e, 1).eq(4), `5. multiplicateur de la dynamo : ${multiplicateur(e, 1)}`);

  // 6. Jusqu'au palier 6, seuil après seuil.
  for (const seuil of ["1e15", "1e22", "1e30", "1e39", "1e44"]) {
    e.energie = new Decimal(seuil);
    assert.equal(refroidir(e), true, `6. refroidir à ${seuil} J`);
  }
  assert.equal(e.froid.palier, 6, "6. palier");
  assert.equal(e.decouvertes.paliers, 6, "6. plus haut palier atteint");
  assert.equal(machinesDebloquees(e), 8, "6. machines débloquées");
  // Les achats sont repartis de zéro : 2⁶ seul.
  assert.ok(multiplicateur(e, 1).eq(64), `6. multiplicateur de la dynamo : ${multiplicateur(e, 1)}`);
  assert.equal(seuilSuivant(e), null, "6. seuil suivant");
  assert.equal(apercuRefroidir(e), null, "6. aperçu");

  // 7. Plus rien sous le palier 6, même à 1e400 J.
  e.energie = new Decimal("1e400");
  assert.equal(refroidir(e), false, "7. refroidir au palier 6");
  assert.equal(e.froid.palier, 6, "7. palier");
});
