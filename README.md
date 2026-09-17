# Tokenizer Playground

An interactive research lab by **Richard Chen · 中国人民大学 / Renmin University of China**.

[Live lab](https://richardchen99.github.io/tokenizer-playground/) · [Personal research](https://richardchen99.github.io)

一个可以亲手训练、回放和使用的 Unicode character BPE。每次 merge 都来自当前语料的加权词对频次。

## Experiments

- **Build a vocabulary**：从字符与词尾标记出发，播放 / 暂停 / 回退每一步，观察相邻符号合并。
- **Pair frequencies**：显示当前最高频的 8 个词对，最高频项是下一次 merge 的依据。
- **Custom corpus**：编辑至多 1200 字符的训练语料与 merge budget，重新训练。
- **Encode unseen text**：用当前已学规则分词，实时展示结果、未见字符与无损还原检查。
- **Merge history**：保留规则顺序、词对与选择时的频次；规则按这个顺序用于新输入。

内置三组语料：经典 `low / lower / newest / widest`，中文 `研究 / 研究者 / 金融研究 / 决策智能`，以及 `token / tokenization / encoder / decoder` 代码词汇。

## Try this

1. 在 Classic words 中逐步训练，观察词频如何影响规则顺序。
2. 在 Input text 输入 `lowest newer`，比较不同 merge 步数的切分。
3. 切换 Chinese research，观察 `金融研究者` 是否复用训练中学到的片段。
4. 使用自定义语料 `aaa aaa aa a`：`a + a` 的频次包含重叠出现，但合并从左到右只处理非重叠匹配。
5. 输入换行、多重空格或 emoji，检查 lossless round trip。

## Algorithm

训练阶段选择：

$$
(a,b)^*=\arg\max_{(a,b)}\sum_w f(w)N_w(a,b).
$$

这里的频次统计包含所有相邻位置；执行规则时从左到右做非重叠替换。同频词对使用固定英语 locale 的排序规则打破平局。每步重新统计训练语料中的词对。

推理阶段按训练所得的 merge 顺序应用规则，不在新句子上重新统计频次。空白片段独立保留，未见字符保留原字符，便于验证还原。

**边界**：此处是以 Unicode code point 起步、空白预分词、带词尾标记的教学 BPE，不等同于 GPT 系列 byte-level BPE、SentencePiece 或实际模型的 tokenizer。输出数量不是任何线上模型的 token 计费估算。保留标记 `</w>` 在训练输入中禁止使用。

## Run locally

Use Node.js **24** (supported minimum: 22.12).

```bash
npm ci
npm run dev -- --host 127.0.0.1
npm test
npm run build
npm run preview -- --host 127.0.0.1
```

## Implementation

- `src/model.ts`：词频聚合、词对计数、BPE 合并、编码、显示映射。
- `src/App.tsx`：语料编辑、训练状态、规则历史和新输入实验。
- `src/shared.tsx` / `src/style.css`：token 布局动画、KaTeX、键盘可访问控件、浅色玻璃 UI、reduced-motion 支持。
- `tests/model.test.mjs`：加权频次、重叠匹配、加权符号减少、Unicode / whitespace 无损编码。

训练与编码完全在浏览器本地完成，不上传输入。`npm test` 编译模型并运行 Node test runner；`npm run build` 完成类型检查和静态构建。

`.github/workflows/deploy.yml` 使用 Node 24，在 `main` 推送后测试、构建并发布 GitHub Pages。首次部署需将 Pages source 设为 GitHub Actions。

## Research series

[Transformer Architecture Lab](https://richardchen99.github.io/transformer-architecture-lab/) ·
[Position Encoding Lab](https://richardchen99.github.io/position-encoding-lab/) ·
[LLM Inference Lab](https://richardchen99.github.io/llm-inference-lab/) ·
[LLM RL Lab](https://richardchen99.github.io/llm-rl-lab/)

## Sources

- [Neural Machine Translation of Rare Words with Subword Units](https://arxiv.org/abs/1508.07909)
- [SentencePiece](https://arxiv.org/abs/1808.06226)
- [Hugging Face: Tokenizers](https://huggingface.co/docs/tokenizers/index)
