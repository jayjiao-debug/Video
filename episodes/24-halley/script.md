# Script: 一颗会回来的彗星  (v1)

**Status:** first draft for gate 1. Written in an unattended overnight run on 2026-10-12. Every default I chose is listed under "Choices made without the owner" at the end.

**Logline:**
- This comet comes back about once every 76 years, so most viewers will see it once in their lives.
- In 1705 Halley "dared venture to foretell" its return in 1758, a year he would have been 102.
- He reasoned that three comets (1531, 1607, 1682) were one, and blamed Jupiter for the uneven gaps.
- After his death, three people in Paris worked out that the planets would hold it back 618 days and predicted mid-April 1759, give or take a month.
- On 25 Dec 1758 a farmer saw it, 16 years after Halley died. It reached perihelion on 13 March 1759, about a month earlier than they had worked out.
- Records go back to 公元前240年 (《史记》), and every lap is different (74–79 years), so each lap is recomputed.
- Next: 2061. Halley never saw it. The viewer probably will.

**Takeaway:** 规律能跨过一个人的一生：算对了，自己等不到的那一天，也会准时来。（哈雷没等到的，2061年，轮到你。）

**Length:** lines run 0.00–114.40 s, then the Juno end card runs 115.87–~122 s (music FIN 121.95). Total ≈ 122 s.

**Music map** (series track `public/bgm.mp3`, same as 《池塘里有多少条鱼？》)
- intro 0–16.625, with beat 1 at 0.441
- **drop 1 at 16.625 (title)**
- main section from 20.689
- breakdown 49.041
- build 63.205
- **silent gap 79.412–81.432**
- **drop 2 at 81.432 (reveal: 1758年12月25日夜)**
- outro texture 115.868 (end card)
- FIN 121.951
- One bar ≈ 2.03 s.

**Checks:**
- `pace.py lines_arr.json --film-end 122`: no line too fast, 0 % waiting. The only flags are the title (16.40–20.80) and the silent gap (79.30–81.45), both named beats.
- All 39 lines are ≤ 16 glyphs, counting punctuation and digits (the longest is 16).
- `lines.json` uses the object format `{start, end, text}`. `lines_arr.json` holds the same lines as `[[s,e,"text"]]` for the house tools. `[ ]` marks the gold keyword.

**Visual through-line:**
- One **gold dot on a dotted ellipse**: the comet as Halley's maths sees it.
- It is born as the inked "1758" on Halley's page (L4–L6) and becomes the comet on the title.
- In the build it is the dot that Jupiter and Saturn tug.
- On drop 2 it is the fuzzy smudge in Palitzsch's eyepiece.
- On the long scroll of returns it is a row of gold ticks.
- At the end it is the comet over the viewer's rooftop again (bookend with frame 0).
- **Flat 2D look** (the Tank-episode / pond figure system). People are few and pose-checked:
  - the young viewer, seated, from behind
  - Halley, seated at his desk
  - the three calculators, seated at a table
  - Palitzsch at his telescope

---

## Title options (≤ 10 字)

1. **死后16年，它回来了** (recommended)
   - A concrete number and an emotional turn in six characters.
   - "Who died?" makes people tap. The film answers it at drop 2 (L29), word for word.
   - It is exactly true: Halley died in 1742, and the comet was seen on 25 Dec 1758 (#12, #13, #14).
   - It does not claim the prediction was exact.
2. **他没等到的那颗彗星**
   - The emotional core (L5, L17, L39) and the viewer callback ("he didn't; you will").
   - Recognisable without naming 哈雷, so viewers can identify the comet themselves.
   - Softer, with no number.
3. **写给身后的预言**
   - Literary and accurate: the prediction was published in 1705 and came true after his death in 1742.
   - Reads more like an essay than a hook, so it is the weakest at stopping a swipe.

**Title-card sub-line (options 1 and 2):** 1705年，一个写给身后的预言. *(If option 3 is chosen, the sub-line becomes 一颗彗星，和它的归期, so the words don't repeat.)*

---

## Beat sheet

| Beat | Time | Purpose | What the viewer learns / feels |
|---|---|---|---|
| Hook (tiny story) | 0–16.4 | Your situation, why it matters, what you'll get | "I'll see this comet maybe once (76 years)." A man in 1705 wrote down its return, though he'd be 102 then. "The answer took 53 years." Numbers on screen by 3.3 s (76) and 8.6 s (1758). |
| Title | 16.6–20.7 | Drop 1 | The inked "1758" flies off the page and becomes the comet, which swings round the Sun on the drop. 《死后16年，它回来了》 |
| Setup: what he did and why | 20.8–49.0 | The one counter-intuitive idea | Anything that circles the Sun comes back. He computed 24 orbits with Newton's gravity, and three of them matched. **Three comets are one comet**, so its next return can be worked out. But the gaps are 76 and 75 years: Jupiter pulls on it. So he expected late 1758 to early 1759. |
| Breakdown: the relay | 49.1–63.2 | Loss, then others take over | He died in 1742. In Paris, three people redid the sum with Jupiter and Saturn included, working six months "from morning to night, sometimes at meals". |
| Build: the number | 63.3–79.3 | What the planets do | Compared with no planets, Jupiter makes it 518 days late and Saturn 100 more, 618 in total. Their prediction: mid-April 1759, give or take a month. "它会回来吗？" |
| Silence | 79.4–81.4 | Breath | An empty eyepiece of stars |
| Reveal | 81.45–95.1 | Drop 2 | 25 Dec 1758: an amateur-astronomer farmer sees it first, 16 years after Halley's death. Perihelion on 13 March, about a month early. |
| Evidence: it always came back | 95.2–103.5 | New beat: deep time | The earliest confirmed record is 公元前240年 (《史记》, on screen), and Chinese histories noted almost every return after that. |
| The catch | 103.6–109.4 | Its limit | No lap is the same: 74 to 79 years. The planets pull, so every lap has to be recomputed. |
| Ending | 109.5–114.4 | Callback + takeaway | Next: 2061. Halley never saw it; this time it's your turn. The rooftop from frame 0 returns, now labelled 2061. |
| End card | 115.87–~122 | Comment bait | 2061年它回来时，你多少岁？ |

---

## Lines

Chars = the units `pace.py` counts (Chinese characters, plus one per number). Needs = 0.5 + n/7 + 0.6 s. Glyphs = everything on screen, which must be ≤ 16.

| # | Start | End | Line (≤ 16 字) | Glyphs | Chars | Needs | Picture (what the viewer sees) | Beat · music | Fact # |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 0.00 | 3.15 | 这颗彗星，你这辈子多半只见一次 | 15 | 14 | 3.10 | **Frame 0:** a flat-illustrated night sky over a city rooftop. A large, bright comet with a long pale tail crosses the upper two-thirds of the frame and is already moving. At the bottom edge a twenty-something (cast, seen from behind, seated on the parapet) has a phone raised; the phone screen frames the comet. **Beat 1 (0.44 s):** the tail flares and lengthens, and a soft shimmer runs along it. | intro · hit on beat 1 | #25 (interpretation of a 76-yr average) |
| 2 | 3.25 | 5.83 | 它平均[76]年，才回来一次 | 12 | 10 | 2.53 | A thin dotted ellipse draws itself through the comet's path and loops off-frame. A slim ruler fades in along the parapet: **"你的一生"**, with year ticks. One comet icon lands on it, and a bracket "76年" shows the next landing **past the ruler's end**. Only one fits. | intro | #25 |
| 3 | 5.93 | 8.51 | 1705年，天文学家哈雷写下 | 14 | 10 | 2.53 | The ruler slides left and the years run backwards. The rooftop dissolves into the same sky seen through a 1700s window: a candlelit desk, and **Halley** (cast, seated, period wig and coat) writing with a quill on a page. Hand on the quill, quill on the paper (pose-check). Small card: "1705 · 天文学家 哈雷". | intro | #1, #11 |
| 4 | 8.61 | 11.33 | 我斗胆预言：[1758]年它会回来 | 15 | 11 | 2.67 | Close on the page. A small, faint English line inks itself in: "…I dare venture to foretell…" (tag: "1705年英文版原话"). Then **"1758"** is written large and **turns gold**. | intro, rising | #7 (1705 English, hedged) |
| 5 | 11.43 | 14.01 | 可到那一年，他该[102]岁了 | 13 | 10 | 2.53 | **The turn.** An overlay life-bar for Halley runs "1656 ──" and an age counter climbs 48 → **102**. Past 1742 the bar turns dotted and faint, tagged "推算". The quill lifts and stops above the page for one beat. Halley looks out of the window at the empty sky. | intro | #11, #12 (102 = 估算 arithmetic) |
| 6 | 14.11 | 16.40 | 要等[53]年，才有答案 | 10 | 8 | 2.24 | He closes the book. The gold "1758" peels off the page, flies out of the window and becomes a **gold dot on the dotted ellipse**. A counter "53年" ticks along the ellipse. From ~15.6 s the camera **accelerates along the ellipse** toward the Sun. | pre-drop | #13 (1758 − 1705) |
| T | 16.63 | 20.69 | *(title card)* | | | | **Drop 1:** the gold dot swings hard around a flat Sun, and its tail sweeps out on the drop. The tail becomes the underline of the title, set on a period star-chart page (themed card, juno-brand §2.2): **死后16年，它回来了**. Sub-line: 1705年，一个写给身后的预言. | **DROP 1** | #12, #13 |
| 7 | 20.80 | 23.84 | 如果彗星绕太阳转圈，就会回来 | 14 | 13 | 2.96 | **Clean diagram world** (flat, parchment ground, ink lines): the Sun at the centre, faint planet circles, one comet on a long ellipse that goes round once and **returns to its start**. A ghost copy traces the next lap. | main section | — (the premise; logic, no fact claim) |
| 8 | 23.94 | 26.84 | 哈雷翻出[24]颗彗星的旧记录 | 13 | 12 | 2.90 | Old observation cards fan out across the parchment, each with a year from "1337" to "1698". Counter: **24**. | main | #2 |
| 9 | 26.94 | 29.84 | 用牛顿的引力，逐个算出轨道 | 13 | 12 | 2.90 | Each card throws a thin ink orbit onto the diagram, 24 lines in all. Margin tag: "牛顿引力理论". | main | #5, #2 |
| 10 | 29.94 | 32.55 | 其中三颗，轨道几乎一样 | 11 | 10 | 2.61 | 21 orbits fade. **Three** orbits glow and lie almost on top of each other. | main | #3 |
| 11 | 32.65 | 34.96 | 1531、1607、1682年 | 15 | 4 | 2.31 (padded +0.55 for three 4-digit years) | Each of the three orbits gets a year label: **1531 · 1607 · 1682**, popping on the beats. | main | #3 |
| 12 | 35.06 | 37.67 | 不是三颗彗星，是[同一颗] | 11 | 10 | 2.61 | **The idea, shown.** The three orbits slide together into one gold ellipse, and the three comet icons merge into a single gold dot. | main · key line | #4 |
| 13 | 37.77 | 40.53 | 那就能算：它下次哪年回来 | 12 | 11 | 2.76 | The gold dot runs one more lap. A timeline under the diagram reads 1531 → 1607 → 1682 → **"？"**, and a ruler swings out from 1682. | main | — (logic of #4) |
| 14 | 40.63 | 43.24 | 可间隔不等：76年，又75年 | 14 | 10 | 2.61 | Two brackets on the timeline, **76** and **75**, are visibly unequal; a small "≠" pulses between them. | main | #3 (arithmetic) |
| 15 | 43.34 | 46.24 | 他的解释：[木星]的引力在拉它 | 13 | 12 | 2.90 | Jupiter's circle lights up. As the gold dot passes near it (tag "1681 · 靠近木星"), a tug arrow bends the ellipse slightly and stretches the next lap. | main | #9, #27 |
| 16 | 46.34 | 48.95 | 他预计：1758年底到次年初 | 14 | 10 | 2.61 | The timeline extends from 1682 to a **shaded window "1758年底 — 1759年初"**. The gold dot parks at the window's edge. | main | #8 |
| 17 | 49.10 | 51.63 | 1742年，哈雷去世，没等到 | 14 | 9 | 2.53 | **Breakdown (quiet).** Back at Halley's desk, by day: an empty chair and a cold candle, with the closed book on the desk. Through the window the dotted ellipse still hangs, the gold dot not yet arrived. Card "1742". No deathbed, no body. | **breakdown 49.04** | #12 |
| 18 | 51.73 | 54.55 | 巴黎，三个人重算它的归期 | 12 | 11 | 2.82 | A slow slide across to a Paris study. **Three seated figures** (cast) sit at one table covered in paper, with name tags **克莱罗 · 拉朗德 · 勒波特夫人**. Pens on paper, pose-checked. Small card "1757–1758". | breakdown | #18, #22 |
| 19 | 54.65 | 57.61 | 这次，把木星和土星都算进去 | 13 | 12 | 2.96 | The diagram projects above the table. **Jupiter and Saturn** both light up, and two faint pull-lines reach from them to the gold dot. | breakdown | #18, #19 |
| 20 | 57.71 | 60.81 | 拉朗德回忆：六个月，从早算到晚 | 15 | 13 | 3.10 | Time-lapse through the window, day to night to day. Paper stacks grow and a wall calendar flips **6 months**. Quote tag: "拉朗德回忆". | breakdown | #23 |
| 21 | 60.91 | 63.15 | 有时吃饭，也在算 | 8 | 7 | 2.24 | Dinner plates appear between the paper stacks. A fork lies beside a column of figures. The pens keep moving (no hand close-ups). | breakdown · last bar | #23 |
| 22 | 63.25 | 66.34 | 比起没有行星，木星让它晚[518]天 | 16 | 13 | 3.09 | **Build.** Full-frame diagram. A **ghost dot** (label "没有行星时") races ahead on the ellipse. The gold dot, held back by Jupiter's tug arrow, lags behind it, and a day counter between them rolls to **+518天**. | **build 63.2** | #19 |
| 23 | 66.44 | 68.82 | 土星再让它晚[100]天 | 10 | 8 | 2.38 | Saturn's arrow tugs too. The gap grows and a second counter reads **+100天**. | build | #19 |
| 24 | 68.92 | 71.15 | 加起来，晚了[618]天 | 10 | 7 | 2.23 | The two counters slam together: **518 + 100 = 618天**. Small tag: "拉朗德、勒波特计算 · 克莱罗方法". | build | #19, #18 |
| 25 | 71.25 | 74.34 | 他们算出它最接近太阳的日子 | 13 | 13 | 3.09 | The ellipse zooms to the point nearest the Sun, which is marked with a gold tick. Card: "1758年11月14日 · 向科学院公布". | build | #20, #22 |
| 26 | 74.44 | 77.25 | [1759年4月中旬]，前后一个月 | 15 | 11 | 2.81 | A 1759 calendar strip. **Mid-April** is circled in gold, with a translucent band "±1个月" from mid-March to mid-May. | build | #20 |
| 27 | 77.35 | 79.30 | 它会回来吗？ | 6 | 5 | 1.95 | The calendar shrinks into a round **telescope eyepiece**: black sky, a few stars, nothing else. | build peak | — |
| — | 79.41 | 81.43 | *(no subtitle)* | | | | **Silence.** The eyepiece holds still: stars only. | **SILENT GAP** | — |
| 28 | 81.45 | 83.64 | [1758年12月25日]夜 | 12 | 7 | 2.19 | **Drop 2.** On the drop a **faint fuzzy smudge** appears in the eyepiece, and the gold dot inks in on top of it. Date card. | **DROP 2** | #14 |
| 29 | 83.74 | 86.93 | 一位业余观星的农民，先看到了它 | 15 | 14 | 3.19 | Pull back out of the eyepiece. A snowy field at night with a farmhouse, and a farmer (cast, standing, winter coat) at a long telescope on a wooden stand. Eye at the eyepiece, one hand on the tube (pose-check). Tag: "帕利奇 · 萨克森 · 德累斯顿附近". Telescope length is not stated (示意). | | #14, #15 |
| 30 | 87.03 | 89.51 | 这时，哈雷已去世[16]年 | 11 | 9 | 2.48 | Above the field, Halley's life-bar from L5 returns: "1656 — 1742". A gold bracket spans from 1742 to the comet: **"16年"**. | | #13, #12 |
| 31 | 89.61 | 92.23 | 3月13日，它离太阳最近 | 12 | 10 | 2.62 | Back to the diagram: the gold dot swings round the Sun. Card: **"1759年3月13日 · 近日点"**. | | #17 |
| 32 | 92.33 | 95.09 | 比他们算的，早了[约一个月] | 12 | 11 | 2.76 | The L26 calendar strip returns. The gold circle on mid-April and a new marker on **13 March** sit **about one month apart**, with a bracket "约1个月". No "hit/miss" stamp. | | #21, #17, #20 |
| 33 | 95.19 | 97.38 | 其实，它早就来过 | 8 | 7 | 2.19 | The gold dot's tail stretches back along the ellipse. The parchment unrolls to the **left** into a long horizontal scroll of time. | transition | — |
| 34 | 97.48 | 100.53 | 能确认的最早记录：公元前[240]年 | 16 | 13 | 3.05 | At the far left of the scroll, a stylised bamboo-slip / scroll fragment: **《史记·秦始皇本纪》 秦始皇七年** with the comet entry in brush script (exact characters pending check, see Unresolved 1). Tag: "公元前240年 · 目前能确认的最早记录". | | #28, #29 |
| 35 | 100.63 | 103.53 | 此后，中国史书几乎次次记下 | 13 | 12 | 2.90 | The scroll runs right. A row of **gold ticks** (one per return) each gets a small red seal "有记录", with one or two gaps. Year labels are sparse: "公元前240 … 1066 … 1682 … 1910". | | #30 |
| 36 | 103.63 | 106.53 | 但它一圈，最短[74]年，最长[79]年 | 16 | 12 | 2.90 | **The catch.** The ticks are visibly uneven. Two brackets lift out: "79.25年 (451–530)" and "74.42年 (1835–1910)". The "76" from L2 shrinks to a small tag: "平均". | | #26, #25 |
| 37 | 106.63 | 109.39 | 行星一拉，每一圈都得重算 | 12 | 11 | 2.76 | Jupiter and Saturn tug arrows flicker along the scroll, and each future tick shifts slightly. The ruler from L13 redraws at every tick. | | #27, #19 (consequence: logic) |
| 38 | 109.49 | 111.54 | 下一次，在[2061]年 | 10 | 6 | 2.05 | The scroll runs past "1986" to a bright gold tick: **2061**. | callback | #39 (year only) |
| 39 | 111.64 | 114.40 | 哈雷没等到的，这次[轮到你] | 12 | 11 | 2.76 | **Bookend.** The 2061 tick becomes the comet over **the rooftop from frame 0**, the same young viewer with the phone raised. A small card in the corner: "2061". Halley's dotted life-bar fades out at the edge. Hold, slow crane up into the sky. | payoff | #39, #12 |
| E | 115.87 | ~122 | *(Juno end card)* | | | | The night sky dims into the **Juno end card**: J monogram, gold title, question, follow pill `关注 Juno · 一起看懂世界`, sources line. | **outro 115.87 → FIN** | — |

---

## End card

- **Question for comments:** 2061年它回来时，你多少岁？
  - alt: 你想和谁一起，等它回来？
- **@ prompt:** @一个想和你2061年一起看它的人
- **Sources line:**
  - Halley, *Synopsis of the Astronomy of Comets* (1705), via Rigaud 1835
  - NASA Science "1P/Halley"
  - Yeomans, IAU Colloq. 83 (1985)
  - Marsden, NASA NTRS
  - Messier, *Phil. Trans.* 55 (1765)
  - Observatoire de Paris
  - *Allgemeine Deutsche Biographie* "Palitzsch" (1887)
  - MacTutor "Lepaute"
  - Westminster Abbey
  - 《史记·秦始皇本纪》

---

## Every number or named claim on screen → facts row

| On screen | Value | Row | Status |
|---|---|---|---|
| 平均76年 | "on average, 76 Earth years" | #25 | OK |
| 多半只见一次 | interpretation of a 76-yr average vs a lifetime | #25 | wording, hedged with 多半 |
| 1705, 哈雷 | Synopsis, *Phil. Trans.* Mar 1705; English ed. 1705 | #1 | OK |
| 我斗胆预言：1758年它会回来 | "I dare venture to foretell" (1705 English) | #7 | OK. 斗胆 = "dare venture" (hedged). No Latin on screen. |
| 102岁 | born Oct 1656; Dec 1758 → 102 | #11, #12 | **估算 (arithmetic)**, tagged 推算 in the picture |
| 53年 | 1758 − 1705 | #13 | OK |
| 24颗, 1337–1698 | "orbits of 24 comets… between 1337 and 1698" | #2 | OK |
| 牛顿的引力 | "used Isaac Newton's theories of gravitation" | #5 | OK |
| 1531、1607、1682 | similar orbits | #3 | OK (1531, not 1535) |
| 同一颗 | "one comet returning repeatedly" | #4 | OK (NASA paraphrase) |
| 76年, 75年 | 1607−1531, 1682−1607 | #3 | arithmetic |
| 木星的引力 | Halley attributed unequal periods to Jupiter | #9 | OK |
| 1681 · 靠近木星 (picture) | "a close Jupiter approach in 1681" | #27, #9 | OK |
| 1758年底到次年初 | "the latter end of 1758, or the beginning of the next year" | #8 | OK |
| 1742年去世; 1656 | died 1742 (OS date; year only); born Oct 1656 | #12, #11 | OK |
| 巴黎, 克莱罗 · 拉朗德 · 勒波特夫人 | Clairaut with Lalande and Lepaute; Académie | #18, #22 | OK (Nicole-Reine Lepaute) |
| 木星和土星都算进去 | three-body treatment; Jupiter and Saturn | #18, #19 | OK |
| 六个月，从早算到晚，有时吃饭也在算 | Lalande 1803, as quoted | #23 | OK (secondary quotation, attributed 拉朗德回忆) |
| 518天 / 100天 / 618天 | "retard de 518 jours dû à Jupiter et de 100 jours dû à Saturne" | #19 | OK. **Framed as delay vs no planets, not Halley's error.** |
| 1758年11月14日 公布 (picture) | announced to the Academy | #22 | OK (secondary, university) |
| 1759年4月中旬，前后一个月 | "avril 1759, plus ou moins un mois"; "mid-April" | #20 | OK. No exact day shown. |
| 1758年12月25日夜 | Palitzsch's sighting | #14 | OK (3 sources). Not "圣诞夜". |
| 业余观星的农民, 帕利奇, 萨克森 | "schlichter Landmann"; near Dresden | #15 | OK. "Self-made telescope" not used (#16). |
| 已去世16年 | "16 years after his death" | #13 | OK |
| 1759年3月13日, 近日点 | "March 13.1" | #17 | OK |
| 早了约一个月 | "just one month earlier than predicted" | #21 | OK. Not claimed as a hit or as within the margin. |
| 公元前240年, 《史记》秦始皇七年 | probable 240 BC apparition; 史记 entry | #28, #29 | OK with 「目前能确认的最早记录」 wording. Brush-script quote pending check (Unresolved 1). |
| 中国史书几乎次次记下 | "nearly unbroken record" | #30 | OK |
| 1066 (scroll label only) | Bayeux tapestry year | #34 | OK (label only) |
| 74 / 79年; 74.42 (1835–1910), 79.25 (451–530) | NASA range | #26 | OK |
| 行星一拉，每一圈都得重算 | Jupiter lengthens the next period; planets' delays | #27, #19 | consequence (logic) |
| 1986 (scroll label only) | perihelion 9 Feb 1986 | #37 | OK |
| 2061 | "It will return in 2061" | #39 | OK, **year only** |

**Not used, on purpose:**
- the "impartial posterity… an Englishman" quote (#10, UNVERIFIED)
- 《春秋》613 BC (#32, UNVERIFIED)
- 1057 BC / 武王伐纣 (#33)
- "self-made" telescope (#16)
- "圣诞夜" (#14: the ADB doesn't say it)
- an exact predicted day (13 vs 15 April, #20)
- the 2061 day (#39: preprint only)
- the Lepaute omission from Clairaut's book (#24: sensitive, secondary, and no time for it)
- 1910 comet pills (#36)
- Giotto (#38) and the Westminster memorial (#40): good material, but each would need its own beat
- Babylonian tablets (#31)

---

## Choices made without the owner (unattended run)

1. **The opening's "your situation" is the viewer's own lifetime against a 76-year comet** (L1–L2). It is not a school memory.
   - The emotional turn is Halley at 102 (L5).
   - What the viewer gets is "the answer, 53 years later" (L6).
   - No question is asked in the opening (owner row 47). The only question is at the build peak (L27), the same pattern as the approved pond script.
2. **Halley's words appear as 「我斗胆预言」**, a faithful rendering of the 1705 English "I dare venture to foretell". It is hedged, as the producer asked: it states neither certainty nor the stronger Latin.
3. **618 days** is introduced with "比起没有行星" so it cannot read as Halley's mistake. A picture tag credits the arithmetic to Lalande and Lepaute using Clairaut's method.
4. **"早了约一个月"** is left without a verdict. The film doesn't say it hit, or that it was inside or outside the ±1 month (#21).
5. **公元前240年**, not "前240年", so it cannot be misread as "240 years ago".
6. **The ending bookend reveals that the frame-0 rooftop is 2061.** The opening is the viewer's future sighting. No 2061 appears before L38, so the payoff stays fresh.
7. **Nothing signals a school/textbook origin.** Recognition of 哈雷彗星 is left to the viewer. The end-card question is about age, not recognition.
8. Recommended title: **死后16年，它回来了**.

## Still unresolved / needs checking

1. **The 《史记》 characters in L34's picture.** The researcher could only source the wording through a Japanese scholarly quotation (#28): 「七年，彗星先出东方，见北方，五月见西方」. It must be checked against the 中华书局点校本 before the art director letters it. The subtitle itself quotes no ancient text, so the script does not depend on it.
2. **L1 "多半只见一次"** is an interpretation of the 76-year average (#25), not a sourced statistic. "多半" hedges it.
3. **L7 and L13 are logic lines with no facts row**: anything that circles the Sun comes back, and if it is one comet its return can be computed. The director should confirm this is acceptable as a premise.
4. **"巴黎" (L18):** #18 and #22 place the work with Clairaut, Lalande and Lepaute and the announcement at the Academy. The Observatoire de Paris page (#17/#19) is the Paris source. No street or building is shown.
5. **People to pose-check** (figure-rules):
   - the rooftop viewer (L1, L39)
   - Halley at the desk (L3–L6)
   - the three calculators (L18–L21)
   - Palitzsch at the telescope (L29)

   All are seated except Palitzsch. No hand close-ups except the quill.
