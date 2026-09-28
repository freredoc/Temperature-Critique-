import assert from "node:assert/strict";
import { test } from "node:test";

import { etatInitial } from "../src/sim/etat.js";
import { Decimal } from "../src/sim/nombre.js";
import {
  SAVE_VERSION, deserialiser, envelopper, exporter, importer, serialiser,
} from "../src/sim/sauvegarde.js";

test("SOCLE T1 — la sauvegarde rend les grands nombres tels quels", () => {
  // 1. Un objet qui n'est pas l'état du jeu : l'étiquetage $d est générique.
  const objet = {
    a: new Decimal("1e400"),
    b: { c: [new Decimal("1.5e-3"), new Decimal(0)] },
    t: 123456789,
  };
  const relu = deserialiser(serialiser(objet));
  const paires = [[relu.a, objet.a], [relu.b.c[0], objet.b.c[0]], [relu.b.c[1], objet.b.c[1]]];
  for (const [lu, original] of paires) {
    assert.ok(lu instanceof Decimal, `relu comme ${JSON.stringify(lu)}, pas comme un Decimal`);
    assert.ok(lu.eq(original), `${lu} ≠ ${original}`);
  }
  assert.equal(relu.t, 123456789);

  // 2. L'état du jeu à 10⁴⁰⁰ J, à travers un code TC1.
  const etat = etatInitial(1_000);
  etat.energie = new Decimal("1e400");
  const code = exporter(envelopper(etat, { build: 1, sauveLe: 2_000 }));
  assert.ok(code.startsWith("TC1."));
  const importe = importer(code);
  assert.equal(importe.ok, true, importe.erreur);
  const energie = importe.enveloppe.etat.energie;
  assert.ok(energie instanceof Decimal);
  assert.ok(energie.eq(new Decimal("1e400")), `énergie relue : ${energie}`);

  // 3. Une enveloppe venue d'une version plus récente est refusée, sans lever.
  const future = { ...envelopper(etat, { build: 1, sauveLe: 2_000 }), saveVersion: SAVE_VERSION + 1 };
  const refuse = importer(exporter(future));
  assert.equal(refuse.ok, false);
  assert.match(refuse.erreur, new RegExp(`version ${SAVE_VERSION + 1}.*plus récente`));
});
