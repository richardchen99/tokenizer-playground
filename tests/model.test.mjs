import test from "node:test";
import assert from "node:assert/strict";
import { model as m } from "../scripts/load-model.mjs";
test("Weighted frequencies count repeated training words", () => {
  const words = m.vocabulary("low low lower"),
    found = m.pairs(words).find((p) => p.left === "l" && p.right === "o");
  assert.equal(found.count, 3);
});
test("Overlapping pairs merge left-to-right without reusing symbols", () => {
  const p = m.pairs(m.vocabulary("aaa"))[0];
  assert.equal(p.count, 2);
  assert.deepEqual(
    m.mergePieces(["a", "a", "a"], { left: "a", right: "a", count: 2 }),
    ["aa", "a"],
  );
});
test("Training strictly reduces symbols and terminates; learned rules encode losslessly", () => {
  const h = m.train("low low lower newest widest 金融研究 金融 金融研究", 100);
  for (let i = 1; i < h.length; i++)
    assert.ok(m.symbolCount(h[i].words) < m.symbolCount(h[i - 1].words));
  assert.equal(h.at(-1).pairs.length, 0);
  const rules = h.slice(1).map((x) => x.merge);
  for (const text of ["lowest newer", "金融研究者", "a  b\n猫\t🧠", "", "  "])
    assert.equal(m.encode(text, rules).join(""), text);
});
test("Empty corpus is safe and does not invent rules", () =>
  assert.equal(m.train("", 20).length, 1));
