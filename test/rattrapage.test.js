import assert from "node:assert/strict";
import { test } from "node:test";

import { etatInitial } from "../src/sim/etat.js";
import { rattraper } from "../src/sim/rattrapage.js";

test("SOCLE T2 — le rattrapage rend tout le temps, au pas près", () => {
  // 1. Sept jours et 13 ms : tout est rendu, sans plafond, en 1000 pas au plus.
  const e1 = etatInitial(0);
  const r1 = rattraper(e1, 604_800_013);
  assert.equal(e1.temps.totalMs, 604_800_013);
  assert.ok(r1.pas <= 1000, `${r1.pas} pas`);

  // 2. 120 ms : trois pas.
  const e2 = etatInitial(0);
  const r2 = rattraper(e2, 120);
  assert.equal(e2.temps.totalMs, 120);
  assert.equal(r2.pas, 3);

  // 3. Une horloge reculée ne fait pas reculer le jeu.
  const e3 = etatInitial(0);
  const r3 = rattraper(e3, -5000);
  assert.equal(e3.temps.totalMs, 0);
  assert.equal(r3.pas, 0);
});
