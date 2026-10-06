# Script: 量子计算机不是同时算  (v2, gate 1 round 1 revision)

**Title (producer's pick, director's top pick):** 量子计算机不是同时算. The cover should finish it with "所有答案".
**Logline:** 都说量子计算机能同时算所有答案，这句话其实很误导. Its coins do hold an astronomical number of combinations, but measuring gives you only one. Its real trick is interference: wrong answers cancel and the right one grows. So it's crazy-fast only on a few problems, and one of them is today's encryption.
**Takeaway:** 它快，不是因为算得多，而是它让错的答案自己抵消。
**Length:** ≈ 119.9 s at 5.0 字/s (VO ends ≈ 114.5 s; the end card holds ≈ 5 s with no VO). VO = 446 字 in 37 lines (v1 was 463 字 in 42 lines, 124.9 s).
**Look:** A · 示波器 Phosphor Scope.

## Revision notes (gate 1, round 1)
Line ids were renumbered in v2. "v1 x" gives the old id.

- **Note 1 (h2 "只对了一半" contradicts 不是)** → h2 is now "这句话，其实很误导" (the same 8 字 and timing). On screen, a red **误导 ✗** replaces ½ ✓ ½ ✗. u4, r1, the title and e1 are now consistent.
- **Note 2 (手机内存 reads as storage)** → s1 is now "你手机的运行内存，有几百亿个比特". On screen: **8 GB 运行内存（以此计）≈ 64,000,000,000 bit**.
- **Note 3 (no headroom; 纠错格子 jargon)** → I deleted v1 r19–r20. v1 r18 (the benchmark is useless) moved up to r10, right after "所以它只在少数题上快得离谱", and now reads "开头那道题只是测速，本身还没什么用". Placed there, it pays off "fast only on a few problems" and leads into "真正的用处…". The payoff (r17–r18) now follows the "门槛还在降" beat, with a 0.75 s pause in which the key frame returns. Est. film length is 119.9 s (it was 124.9 s).
- **Note 4 (s5 subject unclear)** → s5 is now "就凭这一百零五个？" (sub: 就凭这105个？). It ends at 29.8 s, inside the 30.5 s limit.
- **Note 5 (r2 也)** → r2 is now "一测量，只倒出一个答案".
- **Note 6 (94.1 % before 示意)** → r7's on-screen text is now "94.1 %  示意", with the tag attached to the readout from its first frame.
- **Note 7 (sources)** → I added Google Research (2026) · Caltech (2026) to the end-card sources line. The researcher should confirm it.
- **Note 8 (11.5–14.2 s must not be static)** → the h4 Picture now requires the 10²⁵ counter and the CH1 trace to keep running through the gap, and a big **远超宇宙年龄** readout lands on a beat there. This also fixes the cold reader's swipe point at 12–16.8 s and their "10²⁵ 年, how big is that?" question.
- **Producer: title** → 量子计算机不是同时算.
- **Producer / cold reader: the doubling lines feel like a math lesson** → v1 u1–u4 became 3 lines that stay with the coin. u1 "两枚硬币一起转，就有四种组合" and u2 "每多一枚，组合就翻一倍" add the concrete coin image, and u3 "三百枚，组合比宇宙的原子还多" drops the confusing "要记…个数". "Combinations" are the 2ⁿ basis states (row 11, arithmetic).
- **Cold reader: 振幅 is a new word with no picture** → b4 is now "每面的概率，看振幅，也就是波有多高". On screen, a dimension arrow shows **振幅 = 波的高度**, so r4 "振幅像波" lands on something the viewer has already seen.
- **Producer / cold reader: the encryption part feels like a second video** → v1 r11–r17 (7 lines, 76 字) became r12–r16 (5 lines, 74 字), and each line stays with the viewer:
  - r13: 而**你**用的很多加密，就靠大数难分解
  - r14: **你今天的**加密数据，可以先存着以后解
  - r15: 破解它，估计要不到一百万个量子比特
  - r16: 谷歌那块才一百零五个，可门槛还在降

  r15 now says what would be broken. "它" refers back to the encryption in r13–r14, and the on-screen cursor reads **破解 RSA-2048 需要 < 1,000,000（估计·2025）** against **Willow 105**. r16 puts the 105 comparison into the VO, as the cold reader asked. The standards line is now a reassuring on-screen stamp, **好在：抗量子加密标准已发布（NIST · 2024.08）**, which answers "does it protect me?" without spending VO time.
- **Cold reader: "要记4个数, who remembers?"** → fixed by the u1–u3 rewrite above.
- **Kept unchanged, per the director's list:** h1, h3/h4 wording, "不是。" alone at 63.1 s, r4–r8, all fact-safety phrasings, the payoff and e1–e2. One small edit was needed: s2 went from "每一个，都是躺平的硬币" to "每个都是躺平的硬币" (−0.2 s) so the setup fits its window.

## Title
**量子计算机不是同时算** (chosen). It has the topic word for search, its plain reading is exactly what the film proves, and it is the line people forward to "that friend".
The alternatives from v1 were 错的答案会自己抵消 and 旋转的硬币. Both lack the topic word, and the cold reader read them as a study tip and a coin trick.

## Beat sheet (music map, film time)
| Beat | Time | Music | Purpose | What the viewer learns / feels |
|---|---|---|---|---|
| Hook | 0.0–14.24 | build | the myth they've heard, then the record | "I've heard that. Misleading? 5 minutes vs 10²⁵ years, longer than the universe?" |
| Title | 14.24–16.8 | HARDEST DROP, no VO | 《量子计算机不是同时算》 | |
| Setup | 16.8–30.5 | loud | the paradox in numbers | your phone's RAM has ~640亿 bits, all flat coins. Willow has 105 and must be colder than space. "就凭这105个？" |
| Break | 30.5–46.8 | quiet | the qubit | a spinning coin (示意): superposition. Measuring stops it at random, and the odds are set by the wave's height (振幅) |
| Build | 46.8–63.1 | rising | why it's powerful | 2 coins make 4 combinations, which double with each coin. 300 coins make more combinations than there are atoms in the universe. "So it computes every answer at once?" |
| Reveal | 63.1 | SECOND DROP | "不是。" | measuring gives only one answer |
| Mechanism | 66–79 | loud | interference | waves cancel (your noise-cancelling headphones). Wrong answers cancel, the right one grows, and the measurement lands on it |
| Where fast | 79.5–89 | loud | honesty about speed | only a few problems. The opening record was just a speed test. Future molecules and batteries |
| Your data | 89–105 | loud | what it means for you | it factors numbers, and your encryption relies on that being hard. Today's data can be stored and decrypted later. That needs an estimated < 1M qubits vs Willow's 105, but the bar keeps dropping (and the new standards are already out, on screen) |
| Payoff | 105.6–110.4 | loud | the takeaway | not "computes more": wrong answers cancel |
| End | 110.9–119.9 | outro | share | 谁说它能同时算所有答案，就把这条发给谁, then the end card for ≈ 5 s |

## Time budget (chars / 5.0 + 0.25 s per line)
| Section | Window | Lines | 字 | Budget | Est. VO | Fits? |
|---|---|---|---|---|---|---|
| hook | 0.0–14.24 (VO ≈ 11–12 s) | 4 | 53 | 11.60 s | 0.1–11.45 | yes, 2.8 s of moving build into the drop |
| title | 14.24–16.8 | 0 | 0 | — | — | music slam |
| setup | 16.8–30.5 (13.7 s) | 5 | 60 | 13.25 s | 16.8–29.8 | yes, 0.7 s spare |
| break | 30.5–46.8 (16.3 s) | 4 | 54 | 11.80 s | 30.6–45.15 | yes, ≈ 1.25 s breath between lines |
| build | 46.8–62.5 (15.7 s) | 4 | 51 | 11.20 s | 46.9–62.5 | yes, ≈ 1.8 s between lines; u4 59.5–62.5 |
| reveal | 63.1 → | 18 | 210 | 46.50 s | 63.1–110.35 | +0.2 s after 不是, +0.5 s before the payoff |
| end | → | 2 | 18 | 4.10 s | 110.9–114.45 | end card 114.85–119.9 |
| **total** | | **37** | **446** | | | **film ≈ 119.9 s** (target 112–120) |

There is ≈ 5 s of headroom under the 125 s ceiling if the TTS runs slow. If it does, trim r11 first ("将来或许是新药和电池", −1.0 s) and then the payoff pause.
`pace.py` (the subtitle-only reading budget) flags 8 short lines as 0.3–0.5 s under the 7 字/s budget. This is a VO film, so the viewer hears each line as it appears, and these flags are for information only. Waiting is 6 %. The one CHECK (12.1–16.8 s) is the moving build into the title drop (note 8).

## Lines
Start/End are estimates at 5.0 字/s. The producer re-times them from the real TTS, keeping these anchors: h1 0.1 s · s1 16.8 · b1 30.6 · u1 46.9 · u4 ends by 62.5 · r1 exactly 63.1.

| # | Start | End | VO (spoken, TTS-friendly) | Subtitle (if different) | 字 | On-screen text | Picture (what is on screen) | Fact # |
|---|---|---|---|---|---|---|---|---|
| h1 | 0.1 | 3.1 | 都说量子计算机，能同时算所有答案 | = | 15 | 同时算所有答案？ | Frame 0: dark scope graticule, one green trace already running on CH1. On the first beat (<1 s) the trace bursts into dozens of traces fanning out across the screen (the "every answer at once" image). Chapter label top-left: 00 · 传说. | 13 |
| h2 | 3.4 | 5.0 | 这句话，其实很误导 | = | 8 | 误导 ✗ | The fan of traces freezes; a vertical cursor sweeps through it and a red readout stamps 误导 ✗ over the fan. | 13 |
| h3 | 5.2 | 8.2 | 谷歌的芯片，不到五分钟算完一道题 | 谷歌的芯片，不到5分钟算完一道题 | 15 | CH2 · Google Willow · 2024.12 / < 5 分钟 | Trace morphs into a two-channel compare. CH2 (red): a short sharp burst that ends almost at once; red readout "< 5 分钟" lands on a beat. | 1, 2 |
| h4 | 8.4 | 11.4 | 顶级超算估计要十的二十五次方年 | 顶级超算估计要 10²⁵ 年 | 15 | CH1 · 最快的超级计算机之一 / 10,000,000,000,000,000,000,000,000 年 / 远超宇宙年龄 · Google 估计 | CH1 (green): a trace that never ends, running off the right edge; the white mono readout counts up zero by zero to 10,000,000,000,000,000,000,000,000 年 (tag: 最快的超级计算机之一 · Google 估计). In the VO-free 11.5–14.2 s the counter is STILL running and the CH1 trace still moving, and a big second readout lands on a beat: 远超宇宙年龄 (138 亿年 marked as a tiny tick at the far left of the time axis). Energy rises into the drop; nothing static. | 2, 3 |
| s1 | 16.8 | 19.8 | 你手机的运行内存，有几百亿个比特 | = | 15 | 8 GB 运行内存（以此计） / ≈ 64,000,000,000 bit | CH1: a dense digital square wave (bit stream) scrolling fast. Readout: 8 GB 运行内存（以此计）≈ 64,000,000,000 bit. | 26 |
| s2 | 20.1 | 21.9 | 每个都是躺平的硬币 | = | 9 | 0 / 1 / 非 0 即 1 | Zoom into one step of the square wave: its two levels are two coins lying flat, seen edge-on as flat lines, labelled 0 and 1. Nothing moves between them. | 9 |
| s3 | 22.1 | 25.1 | 那块芯片，只有一百零五个量子比特 | 那块芯片，只有105个量子比特 | 15 | Google Willow / 105 qubits | Hard switch: a small grid of 105 dots (one per qubit) draws on in a few sweeps; big red readout 105 next to the dim 64,000,000,000. | 1, 20 |
| s4 | 25.4 | 27.9 | 这类芯片，要比太空冷一百多倍 | 这类芯片，要比太空冷100多倍 | 13 | 外太空 2.7 K / ≈ 10 mK / ×100+ | A temperature channel: the trace falls down a log axis past 外太空 2.7 K and settles at ≈10 mK; a ΔY cursor between 2.7 K and 10 mK reads ×100+. Label: 超导量子芯片 (no Willow figure). | 6, 7, 8 |
| s5 | 28.2 | 29.8 | 就凭这一百零五个？ | 就凭这105个？ | 8 | 64,000,000,000  vs  105 | Both readouts side by side, 64,000,000,000 bit (dim) vs 105 qubit (red), cursor blinking on the 105. Music starts to fall away. | 1, 26 |
| b1 | 30.6 | 33.6 | 你可以把量子比特，想成旋转的硬币 | = | 15 | QUBIT / 示意 | Quiet. One channel, slow sweep. A coin spinning, shown as the scope sees it: its edge traces a slow sine wave. Small label 示意 in the corner. Chapter label: 02 · 量子比特. | 9 |
| b2 | 34.9 | 37.5 | 转着的时候，零和一叠加在一起 | 转着的时候，0和1[叠加]在一起 | 13 | \|0⟩ + \|1⟩ / 叠加 SUPERPOSITION | The sine splits into two thin component traces labelled \|0⟩ and \|1⟩ that sum back into the one wave. | 9 |
| b3 | 38.7 | 40.9 | 一测量，它就随机倒向一面 | = | 11 | TRIG · 测量 / → 1 | A red trigger marker drops; the wave freezes and collapses to a flat line at level 1. Readout → 1. Silence on the music. | 10 |
| b4 | 42.1 | 45.1 | 每面的概率，看振幅，也就是波有多高 | 每面的概率，看[振幅]，也就是波有多高 | 15 | 振幅 = 波的高度 / P = \|振幅\|² | The two component waves from b2 come back; a vertical dimension arrow measures each one's height, labelled 振幅 = 波的高度. Beside it, the coin spins and drops again and again, and a small histogram of 0s and 1s builds up with bar heights matching the two waves. Readout P = \|振幅\|². | 10 |
| u1 | 46.9 | 49.5 | 两枚硬币一起转，就有四种组合 | 2枚硬币一起转，就有4种组合 | 13 | \|00⟩ \|01⟩ \|10⟩ \|11⟩ / 2 枚 → 4 种 | Build starts. Two spinning-coin traces merge, and the screen splits into 4 channels \|00⟩ \|01⟩ \|10⟩ \|11⟩, all running at once, each its own wave. Readout 2 枚 → 4 种组合. | 11 |
| u2 | 51.3 | 53.3 | 每多一枚，组合就翻一倍 | = | 10 | 2ⁿ / 8 · 16 · 32 · 64 · 128 … | Channels keep doubling faster than the eye can count (8, 16, 32 …); the channel-count readout ticks on the beats; label 2ⁿ. | 11 |
| u3 | 55.1 | 57.7 | 三百枚，组合比宇宙的原子还多 | 300枚，组合比宇宙的原子还多 | 13 | 2³⁰⁰ ≈ 2 × 10⁹⁰ 种组合 / 可观测宇宙的原子 ≈ 10⁸⁰（估算） | The traces merge into a solid wall of phosphor glow. Two readouts stacked: 2³⁰⁰ ≈ 2×10⁹⁰ 种组合 above 可观测宇宙的原子 ≈10⁸⁰ (估算); the top one overflows its box. | 11, 12 |
| u4 | 59.5 | 62.5 | 所以它是把所有答案，同时算了一遍？ | = | 15 | 同时算所有答案？ | The hook's question returns over the glowing wall, cursor blinking, music at its highest. Must END by 62.5 s. | 13 |
| r1 | 63.1 | 63.5 | 不是。 | = | 2 | ✗ | ON THE DROP (63.1): a trigger cuts the wall; every trace collapses at once into a single spike. Red ✗ over 同时算所有答案. | 13 |
| r2 | 64.0 | 66.0 | 一测量，只倒出一个答案 | = | 10 | MEASURE → \|1011…⟩ / 1 个 · 随机 | Readout: MEASURE → \|1011…⟩, 1 个 · 随机. The rest of the screen is empty graticule. | 10 |
| r3 | 66.2 | 67.8 | 真正的本事，叫干涉 | 真正的本事，叫[干涉] | 8 | 05 · 干涉 INTERFERENCE / CH1 + CH2 = MATH | Chapter label 05 · 干涉. Three rows appear: CH1, CH2 and the MATH channel (CH1 + CH2) below them. | 14 |
| r4 | 68.0 | 70.2 | 振幅像波，峰撞上谷就抵消 | = | 11 | 波峰 + 波谷 = 0 | CH1 a wave, CH2 the same wave upside down; MATH draws live and comes out flat. Label 波峰 + 波谷 = 0. | 14 |
| r5 | 70.5 | 72.7 | 你的降噪耳机，靠的就是它 | = | 11 | CH1 噪声 / CH2 耳机放出的反相波 / MATH ≈ 安静 | Same three rows, relabelled: CH1 噪声 (a ragged hum), CH2 耳机放出的反相波, MATH ≈ 安静 (almost flat). A simple line icon of headphones, no hands or faces. | 15 |
| r6 | 73.0 | 75.2 | 算法让错的答案，互相抵消 | = | 11 | \|000⟩ … \|111⟩ / 错的 → 0 | KEY FRAME: back to the 8 channels. Each wrong answer's trace meets its dashed mirror ghost and goes flat, one after another. | 14 |
| r7 | 75.4 | 77.0 | 对的答案，越叠越强 | = | 8 | \|101⟩ ▲ 互相加强 / 94.1 %  示意 | \|101⟩ turns red and its wave grows taller with each cycle; the readout climbs to 94.1 %, with the 示意 tag attached to the readout from its first frame. | 14 |
| r8 | 77.2 | 79.2 | 最后一测，大概率就是它 | = | 10 | RESULT 101 / 94.1 %  (示意) | Trigger fires; the result readout shows RESULT 101 in red. Small 示意. | 10, 14 |
| r9 | 79.5 | 82.1 | 所以它只在少数题上快得离谱 | = | 13 | 少数题：快得离谱 / 大多数题：强不了多少 | Two-row readout: 少数题 ▲▲▲快得离谱 vs 大多数题 ▲ 强不了多少 (Aaronson, SciAm 2008). The VO only reads the first row. | 14 |
| r10 | 82.3 | 85.5 | 开头那道题只是测速，本身还没什么用 | = | 16 | 10²⁵ 年 vs < 5 分钟 / 测速题 · 暂无实际用途（Google） | Callback: the hook's two-channel compare comes back small, and a stamp lands across it: 测速题 · 暂无实际用途 (Google's own words). | 4 |
| r11 | 85.8 | 88.8 | 真正的用处，将来或许是新药和电池 | = | 15 | 分子模拟 → 新药 · 电池 / 将来 · 可能 | A channel draws a simple molecule outline as a Lissajous figure; labels 新药 · 电池 and a small tag 将来 · 可能. | 21 |
| r12 | 89.0 | 91.2 | 它还擅长一件事，分解大数 | = | 11 | N = p × q / Shor · 1994 | A long number on the readout splits into two factors: N = p × q. Tag Shor · 1994. | 16 |
| r13 | 91.5 | 94.5 | 而你用的很多加密，就靠大数难分解 | = | 15 | RSA / 靠「大数难分解」 | The number is wrapped by a padlock drawn as a trace; label RSA · 靠「大数难分解」. Small 你 marker on the lock (the viewer's data). | 17 |
| r14 | 94.8 | 98.0 | 你今天的加密数据，可以先存着以后解 | = | 16 | REF · 已存储 · 今天 / 先存后解 HARVEST NOW, DECRYPT LATER（NIST） | The padlocked trace is captured into the scope's REF memory slot (a saved waveform, dimmed, time stamp 今天) while a time readout runs fast forward. Big label 先存后解; source tag NIST. | 24 |
| r15 | 98.2 | 101.4 | 破解它，估计要不到一百万个量子比特 | = | 16 | 破解 RSA-2048 需要 < 1,000,000（估计 · 2025） / Willow  105 / 什么时候？专家估计 几年～几十年 | Log-scale ΔY cursors: top cursor at < 1,000,000 labelled 破解 RSA-2048（估计）, bottom cursor at Willow 105 (red); the gap between them is the tall empty space. Small readout: 什么时候？专家估计 几年～几十年 (NIST), on screen only. | 18, 20, 25 |
| r16 | 101.7 | 104.8 | 谷歌那块才一百零五个，可门槛还在降 | 谷歌那块才105个，可门槛还在降 | 16 | 2019  20,000,000 / 2025  < 1,000,000 / 2026  ↓ 新论文更少 / 好在：抗量子加密标准已发布（NIST · 2024.08） | The top cursor slides down: 2019 20,000,000 → 2025 <1,000,000 → 2026 ↓ (新论文更少), and the gap to 105 narrows. As the line ends, a green stamp lands on the padlock: 好在：抗量子加密标准已发布（NIST · 2024.08）. It stays through the beat before the payoff. | 18, 19, 20, 22 |
| r17 | 105.6 | 107.4 | 它快，不是因为算得多 | = | 9 | ✗ 算得多 | Payoff: the 8-channel key frame again, wide. 算得多 struck through. | 13, 14 |
| r18 | 107.7 | 110.0 | 而是它让错的答案，自己抵消 | = | 12 | ✓ 错的抵消 | Seven traces go flat together, one red trace stays: ✓ 错的抵消. | 14 |
| e1 | 110.6 | 112.8 | 谁说它能同时算所有答案 | = | 11 | 同时算所有答案？ ✗ | The fan of traces from frame 0 returns for a moment, struck by the red ✗. | 13 |
| e2 | 113.0 | 114.5 | 就把这条发给谁 | = | 7 | — | Cut to the Juno end card (gold J, gold title) with the question text; holds ~5 s with no VO. | - |
## End card
**Question (on the card, no VO):** 你身边谁还以为，量子计算机能同时算所有答案？
**@ prompt:** 发给那个说量子计算机能同时算所有答案的朋友 @他
**Sources line (small, on the end card):** Google Quantum AI (2024, 2025) · Google Research (2026) · Caltech (2026) · NIST (2024) · IBM Quantum · Fermilab SQMS · S. Aaronson (SciAm 2008) · P. Shor (1994) · C. Gidney (arXiv 2025) · Bose · NASA/ESA · Stanford CS109

## Fact safety (the researcher's corrections, all still applied)
- **105 is tied to Willow** (s3, s5, r16 "谷歌那块才一百零五个"). We never say "today's chips only have ~100" (row 20).
- **Only the benchmark is useless:** "开头那道题只是测速，本身还没什么用" (row 4: a benchmark with "yet to demonstrate practical commercial applications"). We never say "Willow 没用".
- **The ~1M figure is an estimate and falling.** We say "估计要不到一百万个" and "门槛还在降" (rows 18–19). On screen, 2019 and 2025 are Gidney's RSA-2048 estimates; 2026 appears only as "↓ 新论文更少", without mixing platforms into one number. No year for "when"; the screen shows NIST's "几年～几十年" (row 25).
- **The cold:** "这类芯片，要比太空冷一百多倍". ≈10 mK is labelled for superconducting chips in general, with no Willow mK figure (rows 6–7). The unsourced "室温 300 K" label is gone.
- **No supercomputer name:** "顶级超算 / 最快的超级计算机之一", and 10²⁵ is "Google 估计" (row 2).
- **Harvest now, decrypt later** is a possibility: "可以先存着以后解" (NIST, row 24). We don't claim anyone has already stored *your* data.
- **8 GB** is marked as an assumption (以此计, row 26). Uses are "将来或许" (row 21). The coin is "想成" plus 示意, and 94.1 % carries 示意 from its first frame.
- **"Combinations":** u1–u3 count the 2ⁿ basis states (row 11 + arithmetic: 2³⁰⁰ ≈ 2×10⁹⁰ > ≈10⁸⁰ atoms, row 12).
- **"同时算所有答案"** appears only as the myth (h1, u4, e1), and each time it's corrected (h2 误导, r1 不是, the payoff).
