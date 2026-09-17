export type Word = { text: string; count: number; pieces: string[] };
export type Pair = { left: string; right: string; count: number };
export type Snapshot = { words: Word[]; pairs: Pair[]; merge?: Pair };
export function vocabulary(text: string): Word[] {
  const counts = new Map<string, number>();
  for (const word of text.match(/\S+/gu) ?? [])
    counts.set(word, (counts.get(word) ?? 0) + 1);
  return [...counts].map(([text, count]) => ({
    text,
    count,
    pieces: [...Array.from(text), "</w>"],
  }));
}
export function pairs(words: Word[]): Pair[] {
  const map = new Map<string, Pair>();
  for (const word of words)
    for (let i = 0; i < word.pieces.length - 1; i++) {
      const left = word.pieces[i],
        right = word.pieces[i + 1],
        key = JSON.stringify([left, right]);
      if (!map.has(key)) map.set(key, { left, right, count: 0 });
      map.get(key)!.count += word.count;
    }
  return [...map.values()].sort(
    (a, b) =>
      b.count - a.count ||
      JSON.stringify([a.left, a.right]).localeCompare(
        JSON.stringify([b.left, b.right]),
        "en",
      ),
  );
}
export function mergePieces(pieces: string[], rule: Pair) {
  const result: string[] = [];
  for (let i = 0; i < pieces.length; i++) {
    if (pieces[i] === rule.left && pieces[i + 1] === rule.right) {
      result.push(rule.left + rule.right);
      i++;
    } else result.push(pieces[i]);
  }
  return result;
}
export function train(text: string, limit = 16): Snapshot[] {
  let words = vocabulary(text);
  const history: Snapshot[] = [{ words, pairs: pairs(words) }];
  for (let i = 0; i < limit; i++) {
    const rule = pairs(words)[0];
    if (!rule) break;
    words = words.map((w) => ({ ...w, pieces: mergePieces(w.pieces, rule) }));
    history.push({ words, pairs: pairs(words), merge: rule });
  }
  return history;
}
export function encode(text: string, rules: Pair[]): string[] {
  return (text.match(/\s+|\S+/gu) ?? []).flatMap((span) => {
    if (/^\s+$/u.test(span)) return [span];
    let pieces = [...Array.from(span), "</w>"];
    for (const rule of rules) pieces = mergePieces(pieces, rule);
    return pieces.map((p) => p.replace("</w>", "")).filter(Boolean);
  });
}
export const symbolCount = (words: Word[]) =>
  words.reduce((s, w) => s + w.count * w.pieces.length, 0);
export const show = (s: string) =>
  s
    .replace("</w>", "▁")
    .replaceAll(" ", "␠")
    .replaceAll("\n", "↵")
    .replaceAll("\t", "⇥");
