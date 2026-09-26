import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const records = JSON.parse(
  fs.readFileSync(new URL("../data/prompts.json", import.meta.url), "utf8"),
);
const source = fs.readFileSync(
  new URL("../data/source.txt", import.meta.url),
  "utf8",
);
test("30 prompts consecutivos y completos, idénticos al Word extraído", () => {
  assert.deepEqual(
    records.map((p: { number: number }) => p.number),
    Array.from({ length: 30 }, (_, i) => i + 1),
  );
  const heads = [...source.matchAll(/^(\d+)\. PROMPT[^\n]*/gm)];
  for (let i = 0; i < 30; i++) {
    const start = heads[i].index! + heads[i][0].length;
    const end =
      i === 29
        ? source.indexOf("Flujo diario recomendado", start)
        : heads[i + 1].index;
    assert.equal(records[i].content, source.slice(start, end).trim());
    assert.ok(records[i].objective);
    assert.ok(records[i].category);
  }
});
test("Relaciones válidas, sin duplicar fichas", () => {
  assert.equal(new Set(records.map((p: { id: string }) => p.id)).size, 30);
  for (const p of records)
    for (const n of p.related)
      assert.ok(records.some((r: { number: number }) => r.number === n));
});
