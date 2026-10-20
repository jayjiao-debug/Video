# 《两个我》 script v2 (~2:02) · working title 《身体里的两个人》

v1 (orchestra / mirror / radio looks) is replaced. Owner's brief for v2: melancholic (忧郁) — quiet, restrained, lots of
space, cold desaturated night with one lonely warm lamp; rain, fog, empty rooms; ends on a little light. Not horror.
Every person is an articulated wooden puppet (artist's mannequin, wood grain, ball joints, no face).

**Core twist:** "两个人住在一个身体里" is a different illness (分离性身份障碍). What Bleuler split in 1908 was not a person
but the parts of one mind that should move together; Japan, Korea and Taiwan renamed it, and all three new names
carry the same character, **调** — one person whose strings went out of tune, and strings can be retuned.

## Title candidates (3–6 字)

| | title | why |
|---|---|---|
| **★ recommended** | **《两个我》** (3) | the audience's misconception, said in their own words; matches the hook's double reflection; the tagline turns it over |
| 2 | 《不是两个人》 (5) | states the twist outright; strong but gives the answer away on the cover |
| 3 | 《走调的弦》 (4) | the episode's answer and metaphor; most melancholic, least clickable |

The working title 《身体里的两个人》 is 7 characters (over the 3–6 rule); keep it only if the owner wants an exception.

- **Kicker:** `SCHIZOPHRENIA · BLEULER · MCMVIII`
- **Tagline (中文):** 精神分裂，到底分裂了什么？
- **Tagline (EN):** *What, exactly, splits?*
- **Motif (gold, title + end card):** one wooden ball joint with a single string rising from it (the puppet's joint + the 弦 of the answer)
- **End question:** 三个新名字，你觉得哪个最贴切？评论区见
- **End-card note (faint line above sources):** 如果你或身边的人正在经历，可以拨打 12356 全国心理援助热线（24小时）
- **Sources line:** Bleuler 1908 (AJP 2008) · Luhrmann et al., Br J Psychiatry 2015 · Cho et al., Psychiatry Investig 2018 · 卫福部 2014 · WHO 2026

## Music map (same track as previous episodes, 117.94 bpm, beat 0.509 s, 2 bars = 4.07 s)

| time | point | story beat |
|---|---|---|
| 0.334 · 4.404 · 8.473 · 12.54* | intro accents, every 2 bars | cold open: one line per accent |
| **16.613** | strong hit | gold title card (stamped 两 / 个 / 我 on 16.613, 17.12, 17.63; gold pour on 18.65*) |
| 20.683 | strong hit | story starts (through the glass) |
| 49.172 | break | quiet: "和你我差不多的年纪", the voices |
| 65.451 | build | three cities, ends on a question |
| **82.239** | drop | the answer: culture → names → 调 → recovery |
| 108.184 | strong hit | callback to the window |
| 111.745 | strong hit | rain stops; last line |
| 115.815* | grid (+2 bars) | end card, ~6.1 s → end ≈ 121.9 |

\* on the 2-bar grid, not in the given hit list: confirm with `make.py --plan` / RMS onsets before building.
If the owner prefers the end card on 111.745, cut line 29 and let line 28 land on 108.184 (runtime 1:58).

## Timed subtitles

On-screen time = 0.5 s + characters/7 + 0.6 s + 0.4 s (characters counted without punctuation, as `pipeline/pace.py`).
Gaps between lines are named visual beats in `shotlist.md`. Planned waiting ≈ 10.8 s of 121.9 s ≈ **8.9 %** (target 6–12 %);
no unnamed gap over 2 s (only the title card 15.8–20.7 and the end card).

| # | start | end | line | 字 | fact |
|---|---|---|---|---|---|
| | | | **1 · Hook / cold open (intro)** | | |
| 1 | 0.33 | 3.54 | 你可能也随口说过：“我精分了” | 12 | — |
| 2 | 4.40 | 7.76 | 在电影里，精神分裂常常是这样： | 13 | — |
| 3 | 8.47 | 11.40 | 一个身体里，住着{两个人} | 10 | Z1 (the myth) |
| 4 | 12.54 | 15.75 | 可医生说的“分裂”，到底是什么？ | 12 | — |
| — | 16.613 | 20.683 | **TITLE 《两个我》** · 精神分裂，到底分裂了什么？ | | |
| | | | **2–3 · The real meaning (first full section)** | | |
| 5 | 20.68 | 24.61 | “好几个人格”，是另一种病：分离性身份障碍 | 17 | Z1 |
| 6 | 25.12 | 29.19 | 1908年，瑞士医生布洛伊勒造了这个词 | 18 | Z2, Z9 |
| 7 | 29.70 | 32.91 | 他说的“分裂”，不是分成两个人 | 12 | Z2 |
| 8 | 33.42 | 36.35 | 而是看见、听见、思考、感受—— | 10 | Z2 |
| 9 | 36.86 | 40.36 | 这些本该一起动的部分，[不再合拍] | 14 | Z2 |
| 10 | 40.87 | 44.51 | 全世界，大约每300人里就有1个 | 15 | Z3 |
| 11 | 45.02 | 48.66 | 它最常出现在十几岁末到二十几岁 | 15 | Z12 |
| | | | **4 · The quiet (break)** | | |
| 12 | 49.17 | 51.96 | 和你我，差不多的年纪 | 9 | Z12 |
| 13 | 52.53 | 56.17 | 最常见的，是听见别人听不到的声音 | 15 | textbook (DSM-5) |
| 14 | 56.74 | 59.95 | 对他来说，那声音和真的一样 | 12 | textbook |
| 15 | 60.52 | 64.88 | 斯坦福的人类学家，问了三座城市的60位患者 | 20 | Z5 |
| | | | **5 · Three windows (build)** | | |
| 16 | 65.45 | 68.95 | 美国加州：声音大多刺耳，带着{威胁} | 14 | Z5 |
| 17 | 69.51 | 73.43 | 印度金奈：过半的人听到家人，像长辈叮嘱 | 17 | Z5 (11/20) |
| 18 | 73.99 | 77.77 | 加纳阿克拉：一半人说，大多是好的声音 | 16 | Z5 (10/20) |
| 19 | 78.33 | 81.68 | 同一种病，为什么听到的不一样？ | 13 | — |
| | | | **6–8 · The answer (drop)** | | |
| 20 | 82.24 | 85.74 | 研究者认为：声音，也有[文化]的口音 | 14 | Z5 (hedged) |
| 21 | 86.44 | 90.65 | 名字也是一种声音。日本、韩国、台湾先后改了名 | 19 | Z6, Z10, Z7 |
| 22 | 91.29 | 94.65 | 三个新名字里，都有同一个字：[调] | 13 | Z6, Z7, Z10 |
| 23 | 95.28 | 98.78 | 韩国的新名字，意思是“给琴弦调音” | 14 | Z10 |
| 24 | 99.42 | 102.92 | 不是两个人，是一个人的弦，[走了调] | 14 | Z2 + Z10 (the synthesis) |
| 25 | 103.55 | 107.62 | 世卫组织说：至少三分之一的人，能完全康复 | 18 | Z11 |
| | | | **9 · Callback (coda)** | | |
| 26 | 108.18 | 111.55 | 所以，下次别再随口说“我精分了” | 13 | — (callback to line 1) |
| 27 | 111.75 | 115.75 | 身体里没有两个人，只有一个人，在慢慢调弦 | 18 | — |
| — | 115.815 | ~121.9 | **END CARD** · J · 《两个我》 · motif · 三个新名字，你觉得哪个最贴切？评论区见 · 12356 · 关注 Juno · 一起看懂世界 · sources | | Z8 |

Keywords: red {两个人} (the myth), {威胁} (the harsh voices); gold [不再合拍], [文化], [调], [走了调] (the answers).

## Notes for the build
- Non-stigmatising by construction: no line or shot says or implies danger, violence or "疯"; no diagnosis advice; voices are
  shown by an object (the radio), never acted out by the puppet.
- Line 20 is an interpretation (Luhrmann's), hence "研究者认为". Line 24 is the film's metaphor, built on Bleuler's
  definition and the Korean name; it is not a clinical claim.
- Cut from v1 (kept in facts.md): China 0.6 % / 0.7 % (Z4: a lifetime figure next to a point-prevalence figure confuses),
  Japan's unchanged crime-word headlines (Z6), WHO care gap (Z13). Any of them can come back if the owner wants a longer cut.
