import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Shell,
  Panel,
  Formula,
  Tabs,
  Range,
  Stat,
  Bars,
  Tokens,
  Note,
  Transport,
  usePlayback,
} from "./shared";
import { train, encode, symbolCount, show, type Pair } from "./model";
const corpora = {
  classic:
    "low low low low low\nlower lower\nnewest newest newest newest newest newest\nwidest widest widest",
  research:
    "研究 研究 研究 研究\n研究者 研究者\n金融 金融 金融\n金融研究 金融研究 金融研究\n决策智能 决策智能",
  code: "token token tokens tokenization tokenization\nencode encode encoder encoder\ndecode decode decoder decoder",
};
export default function App() {
  const [example, setExample] = useState("classic"),
    [draft, setDraft] = useState(corpora.classic),
    [corpus, setCorpus] = useState(corpora.classic),
    [limit, setLimit] = useState(12),
    [probe, setProbe] = useState("lowest newer"),
    [error, setError] = useState("");
  const history = useMemo(() => train(corpus, limit), [corpus, limit]),
    play = usePlayback(history.length - 1, `${corpus}|${limit}`, 1600);
  const snap = history[play.step],
    rules = history.slice(1, play.step + 1).map((s) => s.merge as Pair),
    encoded = encode(probe, rules),
    count = symbolCount(snap.words);
  function choose(id: string) {
    setExample(id);
    setDraft(corpora[id as keyof typeof corpora]);
    setCorpus(corpora[id as keyof typeof corpora]);
    setProbe(
      id === "research"
        ? "金融研究者"
        : id === "code"
          ? "tokenizers decoder"
          : "lowest newer",
    );
    setError("");
  }
  function apply() {
    if (!draft.trim()) {
      setError("请先输入训练语料。");
      return;
    }
    if (draft.includes("</w>")) {
      setError("请移除保留的词边界标记 </w>。");
      return;
    }
    setCorpus(draft);
    setExample("custom");
    play.onReset();
    setError("");
  }
  const chars = new Set(Array.from(corpus.replace(/\s/g, ""))),
    unknown = [...new Set(Array.from(probe.replace(/\s/g, "")))].filter(
      (c) => !chars.has(c),
    );
  return (
    <Shell
      slug="tokenizer-playground"
      title="Tokenizer Playground"
      subtitle="把分词器的词表亲手做出来。从字符到子词，每一次 merge 都有频次依据，也会改变新句子的切分结果。"
      sources={[
        [
          "Neural Machine Translation of Rare Words with Subword Units",
          "https://arxiv.org/abs/1508.07909",
        ],
        ["SentencePiece", "https://arxiv.org/abs/1808.06226"],
        [
          "Hugging Face · Tokenizers",
          "https://huggingface.co/docs/tokenizers/index",
        ],
      ]}
    >
      <div className="grid">
        <Panel title="Build a vocabulary" eyebrow="01 / BPE TRAINING">
          <Tabs
            options={[
              { id: "classic", label: "Classic words" },
              { id: "research", label: "Chinese research" },
              { id: "code", label: "Code vocabulary" },
            ]}
            value={example}
            onChange={choose}
            label="Training example"
          />
          <div className="row">
            <h3>
              {snap.merge
                ? `${show(snap.merge.left)} + ${show(snap.merge.right)} → ${show(snap.merge.left + snap.merge.right)}`
                : "Start from characters"}
            </h3>
            <span className="badge">
              Merge {play.step} / {history.length - 1}
            </span>
          </div>
          <div className="stack" style={{ margin: "24px 0" }}>
            {snap.words.map((w) => (
              <div className="bpeWord" key={w.text}>
                <div>
                  <b>{w.text}</b>
                  <small> × {w.count}</small>
                </div>
                <Tokens
                  tokens={w.pieces.map(show)}
                  active={
                    snap.merge
                      ? w.pieces.indexOf(snap.merge.left + snap.merge.right)
                      : -1
                  }
                />
              </div>
            ))}
          </div>
          <Transport {...play} />
          <div className="stats">
            <Stat
              label="WEIGHTED SYMBOLS"
              value={count}
              detail="包含词尾标记，按词频计数"
            />
            <Stat
              label="SYMBOLS REMOVED"
              value={symbolCount(history[0].words) - count}
            />
            <Stat label="RULES LEARNED" value={rules.length} />
          </div>
          <Note>
            高亮的是本轮合并结果。相同词的计数会参与频次统计；词对出现次数包含重叠位置，但真正合并时从左到右处理非重叠匹配。
          </Note>
        </Panel>
        <div className="stack">
          <Panel title="Choose the next merge" eyebrow="02 / PAIR FREQUENCIES">
            {snap.pairs.length ? (
              <Bars
                items={snap.pairs
                  .slice(0, 8)
                  .map((p, i) => ({
                    label: `${show(p.left)} + ${show(p.right)}`,
                    value: p.count,
                    display: String(p.count),
                    active: i === 0,
                  }))}
              />
            ) : (
              <Note>每个训练词已合并完毕，没有剩余相邻词对。</Note>
            )}
            <Formula
              tex={String.raw`(a,b)^*=\arg\max_{(a,b)}\sum_w f(w)\,N_w(a,b)`}
            />
            <Note>
              同频时按固定词对顺序打破平局，结果可以重现。点击 Next step
              会把排名第一的词对合并。
            </Note>
          </Panel>
          <Panel title="Your training corpus" eyebrow="EDIT & REPLAY">
            <label className="field">
              Corpus
              <textarea
                maxLength={1200}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
            </label>
            <div className="buttonRow">
              <button className="primary" onClick={apply}>
                Apply corpus
              </button>
              <span className="caption">{draft.length} / 1200 characters</span>
            </div>
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <div style={{ marginTop: 18 }}>
              <Range
                label="Merge budget"
                min={1}
                max={30}
                value={limit}
                onChange={setLimit}
              />
            </div>
          </Panel>
        </div>
      </div>
      <Panel title="Encode unseen text" eyebrow="03 / APPLY THE LEARNED RULES">
        <div className="grid equal">
          <div className="stack">
            <label className="field">
              Input text
              <textarea
                maxLength={240}
                value={probe}
                onChange={(e) =>
                  setProbe(e.target.value.replaceAll("</w>", ""))
                }
              />
            </label>
            <Note>
              训练时学到的是 merge
              的先后顺序。推理时按这套顺序匹配，不会在新句子上重新统计频次。空白单独保留；本实验采用
              Unicode 字符作为起点，不是生产模型常用的 byte-level BPE。
            </Note>
          </div>
          <div className="stack">
            <Tokens tokens={encoded.map(show)} />
            <div className="stats">
              <Stat label="OUTPUT PIECES" value={encoded.length} />
              <Stat
                label="LOSSLESS ROUND TRIP"
                value={encoded.join("") === probe ? "Pass" : "Fail"}
              />
            </div>
            <Note>
              {unknown.length
                ? `未在训练语料见过的字符：${unknown.join("、")}。此教学实现以字符保留；真实 tokenizer 可能使用 byte fallback 或 UNK。`
                : "所有输入字符都出现在训练语料中。"}{" "}
              词尾用 ▁ 表示，空格用 ␠ 表示。
            </Note>
          </div>
        </div>
      </Panel>
      <Panel title="Merge history" eyebrow="04 / A REUSABLE TOKENIZER">
        <div className="mergeHistory">
          {rules.length ? (
            rules.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <small>{String(i + 1).padStart(2, "0")}</small>
                <span>
                  {show(r.left)} + {show(r.right)}
                </span>
                <b>→ {show(r.left + r.right)}</b>
                <span>{r.count} pairs</span>
              </motion.div>
            ))
          ) : (
            <Note>推进训练后，这里会保留每一条 merge 规则。</Note>
          )}
        </div>
        <div className="callout">
          <h3>Why vocabulary size is a trade-off</h3>
          <Note>
            更多 merge 往往缩短常见文本的 token 序列，但扩大词表和 embedding
            参数量。压缩率不是语义理解分数。中文、代码、英文的最优粒度也会随语料与预分词方式改变。
          </Note>
        </div>
      </Panel>
    </Shell>
  );
}
