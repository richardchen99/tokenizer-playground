# 图片来源与实验状态

截图均采自实际运行的 [Tokenizer Playground](https://richardchen99.github.io/tokenizer-playground/)，使用公开的内置案例，仅包含应用内容，也用于[配套研究笔记](https://richardchen99.github.io/blog/tokenizer-playground-note/)。截图日期：**2026-09-18**。

| 文件 | 截图状态 |
| --- | --- |
| [`overview.jpg`](overview.jpg) | 经典英文词汇；已学习五次合并 |
| [`history.jpg`](history.jpg) | 有序合并：`e + s`（9）、`es + t`（9）、`est + </w>`（9）、`l + o`（7）、`lo + w`（7）；括号内为加权频次 |
| [`chinese.jpg`](chinese.jpg) | 中文研究词汇；六次合并；`金融研究者` 编码为 `金融 / 研究 / 者`，并可无损还原 |

框架图采用统一布局，区分训练中的加权统计与编码时的有序规则复用。重叠计数与 Unicode 处理约定见 [README](../../README.md#数学机制与实现范围)。

- 中文版：[高清 PNG](architecture.png) · [可编辑 SVG](architecture.svg)
- 英文版：[高清 PNG](architecture.en.png) · [可编辑 SVG](architecture.en.svg)

PNG 宽度为 3,200 像素。框架图由矢量图形与文字绘制，截图来自真实界面，均未使用文生图模型。图片不包含编辑器窗口、浏览器边框、本机路径或私人账户信息；数值仅对应所述实验，不作为性能基准。
