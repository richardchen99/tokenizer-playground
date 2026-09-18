# Tokenizer Playground

**Watch a vocabulary emerge, one merge at a time.**

Train a small Unicode character BPE, inspect the frequency behind every merge, and apply the learned rules to new text. English, Chinese, code vocabulary, and your own corpus all pass through the same transparent algorithm.

[**Open the playground ↗**](https://richardchen99.github.io/tokenizer-playground/) · [Research note · 中文](https://richardchen99.github.io/blog/tokenizer-playground-note/) · [中文 README](README.zh-CN.md) · [Quick start](#quick-start)

Created by **Richard Chen · Renmin University of China / 中国人民大学** · [Homepage](https://richardchen99.github.io)

[![BPE playground with a training corpus, adjacent pair frequencies, token sequences, and learned rules](docs/assets/overview.jpg)](https://richardchen99.github.io/tokenizer-playground/)

*Real application capture: corpus frequencies explain the next merge, and the learned rule order explains later tokenization.*

## From counts to reusable rules

| Experiment | Control | What becomes visible |
| --- | --- | --- |
| **Vocabulary construction** | Play, pause, or step back | How characters become longer symbols |
| **Pair frequencies** | Inspect the top eight pairs | Why a particular merge wins at this step |
| **Custom corpus** | Edit up to 1,200 characters and set the merge budget | How the training distribution changes the vocabulary |
| **Unseen text** | Encode with the rules learned so far | Which fragments transfer to new words |
| **Round-trip check** | Try spaces, newlines, or emoji | Whether the original input is recovered exactly |

Three presets cover **Classic words** (`low / lower / newest / widest`), **Chinese research** (`研究 / 研究者 / 金融研究 / 决策智能`), and **Code vocabulary** (`token / tokenization / encoder / decoder`). The interface uses English controls and Chinese explanations.

## Algorithmic framework

![BPE framework showing weighted pair counting and merge training, followed by ordered-rule encoding and reconstruction](docs/assets/architecture.png)

*Original schematic: training learns an ordered rule list; encoding reuses it without relearning frequencies. [Editable SVG](docs/assets/architecture.svg) · [Figure provenance](docs/assets/README.md).*

## Reproduce the first five merges

1. Choose **Classic words** and step through five merges.
2. Inspect the merge history. The sequence is `e + s` (9), `es + t` (9), `est + </w>` (9), `l + o` (7), then `lo + w` (7).
3. Enter `lowest newer` in **Input text**. Move between training steps and observe when a learned fragment becomes available.
4. Switch to **Chinese research**. After six merges, `金融研究者` is segmented as `金融 / 研究 / 者`.
5. Try the custom corpus `aaa aaa aa a`. Pair counts include overlapping occurrences, while the actual replacement proceeds left to right without overlap.

The numbers in parentheses are weighted pair frequencies at selection time. They are not simply the number of replacements a rule will perform.

<details>
<summary><strong>Inspect merge history and Chinese tokenization</strong></summary>

![Ordered history of the first five BPE merges with their weighted frequencies](docs/assets/history.jpg)

*Rules retain their training order and the frequency that selected them.*

![Chinese research corpus after six merges, with 金融研究者 split into learned fragments](docs/assets/chinese.jpg)

*New text reuses learned fragments; the reconstruction check preserves the input.*

</details>

## Mathematical scope

Training chooses the most frequent adjacent pair:

$$
(a,b)^*=\arg\max_{(a,b)}\sum_w f(w)N_w(a,b).
$$

Here, $f(w)$ is the corpus frequency of word $w$, and $N_w(a,b)$ counts adjacent occurrences in its current symbol sequence, including overlaps. The chosen pair is merged through non-overlapping, left-to-right replacements. Counts are recomputed after every merge; ties use a fixed English-locale ordering.

Encoding applies the **ordered learned rules**, rather than counting pairs again in the new sentence. Whitespace is preserved separately, and unseen characters remain available for lossless reconstruction.

This is an educational BPE initialized from **Unicode code points**, with whitespace pre-tokenization and an internal `</w>` marker. It does not reproduce GPT byte-level BPE, SentencePiece, or any production model tokenizer. Its token counts are not a model billing estimate. The reserved `</w>` marker is disallowed in the training input.

## Quick start

Use **Node.js 24**; the supported minimum is 22.12.

```bash
git clone https://github.com/richardchen99/tokenizer-playground.git
cd tokenizer-playground
npm ci
npm run dev -- --host 127.0.0.1
```

```bash
npm test
npm run build
npm run preview -- --host 127.0.0.1
```

Training and encoding run in the browser, with no model service, API key, or GPU required. Built with React 19, TypeScript, Vite, Framer Motion, and KaTeX.

## Implementation and verification

| Entry point | Responsibility |
| --- | --- |
| [`src/model.ts`](src/model.ts) | Word frequencies, pair counting, merging, encoding, and display mapping |
| [`src/App.tsx`](src/App.tsx) | Corpus editor, training state, rule history, and unseen-text experiments |
| [`src/shared.tsx`](src/shared.tsx) · [`src/style.css`](src/style.css) | Token animation, formulas, glass panels, and reduced-motion support |
| [`tests/model.test.mjs`](tests/model.test.mjs) | Weighted counts, overlap behavior, symbol reduction, Unicode/whitespace round trips, and empty input |

`npm test` compiles the model and runs the Node test runner. The [Pages workflow](.github/workflows/deploy.yml) tests, type-checks, builds, and deploys `main` using Node 24. For a fork, select **GitHub Actions** as the Pages source.

## Reading and citation

- Sennrich et al. [*Neural Machine Translation of Rare Words with Subword Units*](https://arxiv.org/abs/1508.07909), 2015 preprint — BPE for subword segmentation.
- Kudo and Richardson. [*SentencePiece*](https://arxiv.org/abs/1808.06226), 2018 — a related tokenizer system with a different input-processing design.
- Hugging Face. [*Tokenizers*](https://huggingface.co/docs/tokenizers/index) — practical tokenizer components and pipelines.
- [Project research note](https://richardchen99.github.io/blog/tokenizer-playground-note/) — the experiment explained in Chinese.

For teaching or writing, link to this repository and record the commit used. [CITATION.cff](CITATION.cff) provides machine-readable software attribution.

## Explore the series

| Lab | Central question |
| --- | --- |
| **Tokenizer Playground** | How does a corpus become a reusable vocabulary? |
| [Transformer Architecture Lab](https://github.com/richardchen99/transformer-architecture-lab) | How does attention turn token representations into context? |
| [Position Encoding Lab](https://github.com/richardchen99/position-encoding-lab) | How does position change attention geometry? |
| [LLM Inference Lab](https://github.com/richardchen99/llm-inference-lab) | When can past computation be reused? |
| [LLM RL Lab](https://github.com/richardchen99/llm-rl-lab) | How does reward change a response distribution? |

Found it useful? A star helps others discover the series. Small corpora that reveal interesting merge behavior make especially useful contributions.
