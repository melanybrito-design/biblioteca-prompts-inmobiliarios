import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { searchScore } from "../lib/search.ts";
import { variables, personalize } from "../lib/template.ts";
import { validDrafts } from "../lib/drafts.ts";
const prompts = JSON.parse(
  fs.readFileSync(new URL("../data/prompts.json", import.meta.url), "utf8"),
);
test("número exacto y relevancia de títulos", () => {
  assert.equal(prompts.filter((p: any) => searchScore(p, "18") > 0).length, 1);
  assert.equal(
    prompts.filter((p: any) => searchScore(p, "#9") > 0)[0].number,
    9,
  );
  for (const [q, id] of [
    ["contestar whatsapp", 9],
    ["plan semanal", 19],
    ["OBJECIONES", 16],
    ["publicar una propiedad", 6],
  ] as const) {
    const results = [...prompts].sort(
      (a, b) => searchScore(b, q) - searchScore(a, q),
    );
    assert.equal(results[0].number, id, q);
  }
  assert.equal(searchScore(prompts[15], "objeción inexistentezz"), 0);
});
test("campos repetidos independientes y original intacto", () => {
  const original = prompts[14].content;
  assert.equal(variables(original).length, 2);
  const custom = personalize(original, { "0": "Cliente A", "1": "Casa B" });
  assert.ok(custom.includes("Cliente A"));
  assert.ok(custom.includes("Casa B"));
  assert.ok(!custom.includes("[DATOS]"));
  assert.equal(prompts[14].content, original);
  assert.ok(personalize(original, { "0": "Cliente A" }).includes("[DATOS]"));
});
test("validación estricta del respaldo de borradores", () => {
  assert.ok(validDrafts({ "15": { "0": "Cliente", "1": "Casa" } }));
  assert.ok(validDrafts({}));
  for (const value of [
    null,
    [],
    { "99": {} },
    JSON.parse('{"15":{"__proto__":"x"}}'),
    { "1": { "0": 42 } },
    { "1": { "0": "x".repeat(20001) } },
  ])
    assert.equal(validDrafts(value), false);
});
