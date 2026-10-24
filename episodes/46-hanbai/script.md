# Script: 泰山汉柏 (v1 · for gate 1)

Screenwriter, 2026-10-24 23:20. Files: this script + `lines.json` (59 lines, `[[start, end, "text"], ...]`, `[ ]` = key word).

**Logline:** 假如说，你是一棵树。相传汉武帝种下你，从此你站在泰山脚下、岱庙的院子里，一步没动。皇帝来泰山封禅，又走了；赤眉军的斧头、乾隆的画笔、1928年的炊烟都到过你身边；你半边身子被火烧死，靠一条32厘米的树皮活到今天。2024年，你的孩子被送去汉武帝的茂陵，替你守那个"相传种下你的人"。

**Takeaway:** 来的人都走了，留下的是一棵谁也说不清来历的树。乾隆问"谁是主，谁是客"；两千年后答案反过来了：皇帝是客，你是主，连他的墓都要你的孩子来守。

**Length:** 153.96 s (2:34) = exactly 68 bars at 106 BPM (one bar = 2.264 s, one beat = 0.566 s). Every line starts on a beat; the four structural moments start on a bar line.

**Pace (pace.py on lines.json):** waiting 7.1 s = **5 %** (target ≤ 12 %), **0 TOO FAST**. Widest line 16 (F6). Flags, all named beats:
- CHECK 13.6–17.0 s no subtitle → the **title drop** (6 beats).
- MINOR Q7 holds 1.4 s → secondary accent: both trees glow, the stele dims.
- MINOR F6 holds 2.0 s → the **emotional peak** (split frame, music at full).
- MINOR end question holds 3.7 s → the end card.

## Device
- **「你」 = 汉柏连理** (rows 4, 49): one root, two trunks, west trunk charred black, east trunk green. It is the only glowing colour. **The camera never leaves it.** Every scene is the same tree in the same courtyard; only what is behind it changes (mountain, torches, temple halls, smoke, crowds, seasons).
- **Counter (bottom-left): 「相传 · 你 X 岁」.** It first appears at A1 with the 相传 tag and the small print 「按汉武帝首次封禅（前110年）推算 · 估算」 (row 13), and that small print returns at G3. Values: 110 BC = 0, so AD year + 109 (row 13; e.g. 56 → 165, 1008 → 1117, 2026 → 2135). During the 赤眉 legend (no date, row 10) it fades out.
- **Second counter (D7–D8 only):** six seals, 封禅泰山的皇帝 (row 22). Seal 1 (秦始皇) greys out (before you), seals 2–6 light: 5/6 (估算).
- **Legend style:** anything 相传 / 传说 (the planting, the blood) is drawn as a translucent dashed outline, never solid. Facts are solid. The viewer learns the code at C2 and A9.
- **Repeated set-piece: the torch line.** A line of torches climbs the mountain *behind* the tree to the summit and goes out (the rite is up there; you stay at the foot; no procession passes you, row 24). Wu Di ×8 at A3, then one per emperor at D2–D5, shorter each time, then it goes out for good (D6). The tourists at G1–G2 are its last version: they come, and they go.
- **Text:** big lines **top-left that stack and stay** (`TL`; `TL new` = clear the stack and start a new block); **punch lines centred and bigger** (`C`). Stamps (year · source) top-right, small.

## Title options (≤ 10 字; owner picks)
1. **皇帝走了，这棵树还在** (9 字). States the device plainly and is true as read: the emperors did come to 泰山 and leave, the tree is there today (rows 1, 14, 18–22). Low risk, works with a cover of the two-coloured tree. Weak spot: it gives away the mood, not a surprise.
2. **乾隆画了它，又问谁是主** (10 字). The most curious one: an emperor painting a tree is unexpected, and "谁是主" makes you want the question explained. Fully sourced (rows 27–29). Weak spot: viewers who don't care about 乾隆 may not click.
3. **它的孩子，去守汉武帝** (9 字). The twist as a hook: why would a tree's children guard an emperor? True as read: in 2024 six seedlings from 汉柏连理 went to 茂陵 (row 43). It does not claim Wu Di planted it. Weak spot: it spends the ending; cover must show it's a tree.

My pick: **2** for curiosity, **1** if the owner wants the safest. None says 「汉武帝种的」 as fact or uses a number we can't stand behind.

## Music plan (for the music specialist: cut bgm2 to these, then retime)
Grid: 106 BPM, 0 s = bar 1 beat 1. Bars below are 1-based (bar n starts at (n−1) × 2.264 s).

| Moment | Plan time | Bar | What the music should do |
|---|---|---|---|
| Frame 0 | 0.00 | 1 | Already playing (no silent intro); a hit on beat 1 for the gust in the crown. C1–C6 = one fast phrase, a new event every ~1.7–2.8 s. |
| **TITLE DROP** | **13.58** | **7** | **The hardest drop of the track.** Title slams in after the rewind (owner row 84/133). 6 beats with no subtitle. If bgm2's first big drop sits elsewhere, move the drop and slide everything after it; C1–C6 can't shrink (they're at their reading minimum), only gain beats. |
| Secondary accent | 89.43 | 40 (beat 3) | 「谁是主，谁是客？」: a lift or stop-time, not the peak. |
| Hush | 106.42 | 48 | Music thins right after 「你活了下来。」: the half-dead trunk, the 32 cm strip (E1–E7) are told over a quiet bed. |
| Rebuild | 121.70 | 54.75 | Seeds, the 6 seedlings leaving, 茂陵: the build-up. |
| **EMOTIONAL PEAK** | **133.58** | **60** | **The biggest moment of the film:** 「两千多年后，轮到你的孩子守他了。」 lands on the downbeat, full arrangement, held 9 beats. One bar of no new line before it (132.45–133.58) so it lands clean. |
| Outro | 138.68–153.96 | 62.25–69 | Settles; G3 「你2135岁」 and G4 「你一直在」 on the falling phrase; end card ~6 s to the last bar. |

Lengths in whole bars between anchors: frame 0 → title 6 bars; title → peak 53 bars; peak → end 9 bars. If the cut track needs ±1–2 bars between anchors, the safe places to add or drop text are A8 (盖=大概), D10, E7 and G2.

## Beat sheet
| Beat | Time | Counter | Purpose | Event → result / twist |
|---|---|---|---|---|
| Cold open | 0.00–13.58 | — | 假如说 + fates fast + present-day hook | You're a 2100-year-old tree; maybe Wu Di planted you; emperors came and went; fire burned you; Qianlong painted you → **today you live on one strip of bark.** |
| Title | 13.58–16.98 | 2135 → 0 | drop | Rewind to a sapling; title. |
| 1. Birth | 16.98–24.91 | 相传 · 0 | where + the legend | Foot of 泰山, 岱庙 courtyard; 110 BC Wu Di comes for 封禅; legend says he planted you. |
| 2. The record | 24.91–41.89 | 0 → 21, then held | twist on the legend | He came **8 times**; his annals log every visit and **never mention a tree**; the oldest record, centuries later, says **「盖」= 大概** → your birth is itself a "maybe". |
| 3. The axe | 41.89–53.77 | faded (legend) | danger + legend | 赤眉 rebels hack a cypress; legend: it bled and the axe stopped → a tree there is still called 「赤眉斧痕」. |
| 4. Emperors | 53.77–74.72 | 165 → 775 → 834 → 1117 | the set-piece, faster | 光武, 高宗, 玄宗, 真宗 (last ever). Only 6 emperors ever did 封禅 here; except 秦始皇 you saw all 5 come, from below → then **no emperor came for 封禅 again.** Seasons time-lapse. |
| 5. Qianlong | 74.72–93.40 | 1857 → 1899 | the strongest scene | 740 years later Qianlong comes to 岱庙 10 times, paints you (1762), calls you 「数千年神物」, carves the painting in stone beside you (1771) → asks: **which is host, which is guest?** |
| 6. Smoke | 93.40–106.42 | 2037 | near-death | 1928: soldiers in the temple, horses and cooking fires in the hall; dozens of ancient cypresses die; the 唐槐 next door dies → **you survived.** |
| 7. Half | 106.42–121.70 | holds | reveal: the cost | Twist on 「你活了下来」: only half of you. West trunk burned dead (no date); east trunk lives on a strip **32 cm** wide feeding **11.5 m** of tree; today watched 24 h. |
| 8. Children | 121.70–138.68 | 2133 | the closing twist / peak | Your seeds are collected; 2024, six seedlings leave for 茂陵, Wu Di's tomb, the man said to have planted you → **two thousand years on, your children guard him.** |
| 9. Today | 138.68–147.74 | 2135 | bookend | 8 million a year come to 泰山 and leave, like the emperors → 2026, 2135 (估算) → **你一直在。** |
| End card | 147.74–153.96 | — | argument | 皇帝和你，谁是主，谁是客？ |

## Cold open, written out (0–13.58 s)
| # | Start | End | Bar | Line | Chars (count / width) | Needs | Layout | Stamp · counter | Picture: the tree fixed, what changes behind it | Fact # |
|---|---|---|---|---|---|---|---|---|---|---|
| C1 | 0.00 | 2.83 | 1.00 | 假如说，你是一棵[2100多岁]的树。 | 12 / 15 | 2.81 | TL new | — | Frame 0: the tree fills the frame, one green trunk and one charred grey-black trunk from one root, the only glowing colour; stone tablets around it. A gust moves the living crown on beat 1. Typed on. | 1, 4, 5, 49 |
| C2 | 2.83 | 5.09 | 2.25 | 相传，汉武帝[种下]了你。 | 9 / 11 | 2.39 | TL | stamp 相传 | Hard cut, same framing: dawn, the tree is a sapling; a translucent dashed-outline Han silhouette (the legend style, used for every 相传/传说) straightens up beside it. | 9 |
| C3 | 5.09 | 7.36 | 3.25 | 皇帝来泰山，[来了又走]， | 9 / 11 | 2.39 | TL | — | Same framing: behind the tree a torch line climbs the mountain and fades, three times, fast; the tree grows between cuts. | 14, 18–21 |
| C4 | 7.36 | 9.06 | 4.25 | 大火[烧]过你， | 5 / 6 | 1.81 | TL | — | Night: orange light on the west trunk; it goes black. | 5 |
| C5 | 9.06 | 10.75 | 5.00 | 乾隆[画]过你。 | 5 / 6 | 1.81 | TL | — | A scroll unrolls beside the tree: the painted tree, ink on paper. | 27 |
| C6 | 10.75 | 13.58 | 5.75 | 今天，你只靠[一条树皮]活着。 | 11 / 13 | 2.67 | C | stamp 2026 | Today: tourists' phones flash; close on a narrow living strip of bark on the east trunk, lit. Centred, bigger. | 5 |
| T | 13.58 | 16.98 | 7.00 | *(no line)* | | | title | counter rewinds 相传 · 你 2135 → 0 岁 | TITLE DROP (bar 7 downbeat). Rewind: phones, scroll, fire, torches fly back, the tree shrinks to a sapling; the title slams in over it. | — |

The first line opens on 「假如说…」 (owner rule) and a number (2100多岁, row 1) on frame 0. C2–C5 are one sentence of fates, one event per cut (~1.7–2.3 s each). C6 is the present-day hook, centred. The title follows on the drop at 13.58 s.

## Full script (lines table)
| # | Start | End | Bar | Line (≤ 16 字) | Chars (count / width) | Needs (0.5+n/7+0.6) | Layout | Stamp · counter | Picture: the tree fixed, what changes behind it | Fact # |
|---|---|---|---|---|---|---|---|---|---|---|
| A0 | 16.98 | 19.81 | 8.50 | 你在泰山脚下，[岱庙]的院子里。 | 12 / 14 | 2.81 | TL new | stamp 岱庙 · 泰山脚下 | Pull back slightly: a walled temple courtyard at the foot of the mountain; the sapling in it. Mountain fills the back. | 4, 16 |
| A1 | 19.81 | 22.64 | 9.75 | 公元前110年，汉武帝来[泰山封禅]。 | 13 / 15.5 | 2.96 | TL | stamp 前110 · 汉书·武帝纪; counter appears: 相传 · 你 0 岁 | Far behind the tree: a torch line climbs to the summit (the rite is up there, you stay below). | 13, 14, 16 |
| A2 | 22.64 | 24.91 | 11.00 | 相传，你就是他[种下]的。 | 9 / 11 | 2.39 | TL | 你 0 岁 (small print: 按汉武帝首次封禅推算 · 估算) | The sapling glows. | 9, 13 |
| A3 | 24.91 | 27.17 | 12.00 | 他前后来了[8次]。 | 7 / 7.5 | 2.10 | TL | 你 0 → 21 岁 | Set-piece 1: the torch line climbs 8 times, each faster; the sapling grows a little each time. | 14 |
| A4 | 27.17 | 29.43 | 13.00 | 《汉书·武帝纪》次次都记， | 9 / 13 | 2.39 | TL new | stamp 《汉书·武帝纪》 | A long bamboo-slip strip unrolls across the sky behind the tree; 8 entries light up one by one. | 12, 14 |
| A5 | 29.43 | 31.70 | 14.00 | 却[一个字]没提种树。 | 8 / 9 | 2.24 | TL | 你 21 岁 | The slips scan for 种 / 植: nothing lights. They roll up. | 12 |
| A6 | 31.70 | 34.53 | 15.00 | 现存最早的记载，在几百年后： | 12 / 14 | 2.81 | TL | stamp 北魏 · 郦道元《水经注》引《从征记》; counter frozen | Fast seasons behind the tree; the tree thickens. | 9 |
| A7 | 34.53 | 37.36 | 16.25 | “[盖]汉武所植也。” | 6 / 9 | 1.96 | C | — | One line of old text appears on a stone tablet beside the tree; 盖 glows. Centred, bigger. | 9 |
| A8 | 37.36 | 39.06 | 17.50 | “盖”，就是[大概]。 | 5 / 9 | 1.81 | C | — | 盖 turns into 大概. | 9 |
| A9 | 39.06 | 41.89 | 18.25 | 你的出生，是个[“大概”]。 | 8 / 12 | 2.24 | C | counter label 相传 pulses | The counter's 相传 tag pulses once. Hold on the tree. | 9, 12 |
| B1 | 41.89 | 44.15 | 19.50 | 后来，起义的[赤眉军]， | 8 / 10 | 2.24 | TL new | counter fades out (legend, no date) | Behind the tree a rough crowd of silhouettes enters the courtyard. | 10 |
| B2 | 44.15 | 46.42 | 20.50 | 砍了庙里一棵柏树。 | 8 / 9 | 2.24 | TL | — | Not you: a neighbouring cypress at the frame edge; an axe silhouette swings. | 10 |
| B3 | 46.42 | 48.68 | 21.50 | 传说，[砍出了血]， | 6 / 8 | 1.96 | TL | stamp 传说 · 《水经注》 | In the dashed legend style: a red mark spreads in the neighbour's bark (flat colour, no gore). | 10 |
| B4 | 48.68 | 50.94 | 22.50 | 斧头，[停了]。 | 4 / 6 | 1.67 | C | — | The axe freezes mid-air, then the crowd backs out. Hold. | 10 |
| B5 | 50.94 | 53.77 | 23.50 | 岱庙至今有棵树叫[“赤眉斧痕”]。 | 12 / 15 | 2.81 | TL new | stamp 泰山管委会 · 2019 | Back to normal style. The neighbour today: a small name plaque 赤眉斧痕 on a cypress whose bark has an old healed gash (the plaque is the fact; the blood stays legend). | 10 |
| D1 | 53.77 | 56.04 | 24.75 | 后来的皇帝，也来[封禅]。 | 9 / 11 | 2.39 | TL new | counter fades back in and spins | Set-piece 2 returns: torch lines up the mountain behind the tree, each shorter, banners in a different colour per dynasty. | 18–21 |
| D2 | 56.04 | 57.74 | 25.75 | 56年，[光武帝]。 | 5 / 7 | 1.81 | TL | 你 165 岁 (估算) | Torch line 1 (East Han). | 18 |
| D3 | 57.74 | 59.43 | 26.50 | 666年，[唐高宗]。 | 5 / 7.5 | 1.81 | TL | 你 775 岁 | Torch line 2 (Tang), shorter. | 19 |
| D4 | 59.43 | 61.13 | 27.25 | 725年，[唐玄宗]。 | 5 / 7.5 | 1.81 | TL | 你 834 岁 | Torch line 3; a bright mark appears on the summit cliff (the inscription), far away. | 20 |
| D5 | 61.13 | 62.83 | 28.00 | 1008年，[宋真宗]。 | 5 / 8 | 1.81 | TL | 你 1117 岁 | Torch line 4; behind the tree the temple grows a big main hall (天贶殿). | 21, 23 |
| D6 | 62.83 | 65.09 | 28.75 | [最后一位]封禅的皇帝。 | 9 / 10 | 2.39 | C | — | The torch line reaches the top and goes out for good. | 21 |
| D7 | 65.09 | 67.92 | 29.75 | 封禅泰山的皇帝，[只有6位]。 | 11 / 12.5 | 2.67 | TL new | row of 6 seals (second counter) | A row of six seals appears under the counter. | 22 |
| D8 | 67.92 | 71.32 | 31.00 | 除了秦始皇，5位来时你都[在山下]。 | 14 / 15.5 | 3.10 | TL | seal 1 greys (stamp 前219 · 你还没出生 · 估算), seals 2–6 lit: 5/6 | Seal 1 greys out; seals 2–6 light one by one. The tree at the bottom of frame, the summit far above (you stayed below; no procession passes you). | 16, 17, 22 (5/6 = 估算) |
| D10 | 71.32 | 73.58 | 32.50 | 从此，再没有皇帝[封禅]。 | 9 / 11 | 2.39 | TL new | 你 1117 岁 (counter keeps running) | The torch path on the mountain fades out. Time-lapse in one move begins: the same frame through spring, summer, autumn, snow, several cycles; the courtyard fills with stone tablets; the counter spins. | 21 |
| — | 73.58 | 74.72 | 33.50 | *(no new line: time-lapse finishes on the bar)* | | | | | | |
| Q1 | 74.72 | 77.55 | 34.00 | 七百多年后，乾隆来岱庙[10次]。 | 12 / 14 | 2.81 | TL new | 你 1857 → 1899 岁 (1748–1790) · stamp 故宫《紫禁城》2022 | A Qing silhouette arrives in the courtyard, leaves, arrives again (10 quick ghost passes). | 21, 26 (740 yrs = 估算) |
| Q2 | 77.55 | 79.81 | 35.25 | 1762年，他把你[画了下来]， | 9 / 12 | 2.39 | TL | 你 1871 岁 · stamp 1762 | Beside the tree a 2.9 m paper scroll unrolls (our own drawing): the painted tree, its trunk spiralling. | 27 |
| Q3 | 79.81 | 82.08 | 36.25 | 称你为[“数千年神物”]。 | 8 / 11 | 2.24 | TL | — | The four characters glow on the scroll's inscription. | 4, 27 |
| Q4 | 82.08 | 84.34 | 37.25 | 1771年，他把画刻成[石碑]， | 9 / 12 | 2.39 | TL new | 你 1880 岁 · stamp 1771 | The scroll turns to stone: a stele rises next to the tree inside a small pavilion. | 28 |
| Q5 | 84.34 | 86.60 | 38.25 | 立在你的[旁边]。 | 6 / 7 | 1.96 | TL | — | Camera holds: real tree left, carved tree right, side by side. | 28 |
| Q6 | 86.60 | 89.43 | 39.25 | 石头里的你，[望着]真的你。 | 10 / 12 | 2.53 | TL | — | The carved tree's outline brightens toward the real one. | 29 |
| Q7 | 89.43 | 93.40 | 40.50 | 他题诗问：[谁是主，谁是客]？ | 10 / 13 | 2.53 | C | stamp 乾隆《题汉柏》1771 ·「殿旁亭里相望近，名实宾主谁是乎」(故宫 reading) | Secondary accent. Both trees glow equally for a beat, then the stele dims back to stone. Hold. | 29 |
| W1 | 93.40 | 95.66 | 42.25 | 1928年，军队住进[岱庙]， | 8 / 11 | 2.24 | TL new | 你 2037 岁 · stamp 1928—1929 | Behind the tree: flat soldier silhouettes, no faces, no insignia; tents in the courtyard. | 30 |
| W2 | 95.66 | 98.49 | 43.25 | 在大殿里养马、[烧火做饭]。 | 10 / 12 | 2.53 | TL | — | Smoke drifts from the big hall across the tree; horses' silhouettes. | 30 |
| W3 | 98.49 | 101.32 | 44.50 | 烟熏火燎，几十株[千年古柏]枯死。 | 13 / 15 | 2.96 | TL | stamp 据《齐鲁晚报》2015 | In the haze, other cypresses in the background turn grey one by one. | 31 |
| W4 | 101.32 | 104.15 | 45.75 | 隔壁的[唐槐]，也死在战乱里。 | 11 / 13 | 2.67 | TL | stamp 民国年间 | Over the wall, the old pagoda tree's crown goes bare and dark. | 33 |
| W5 | 104.15 | 106.42 | 47.00 | [你活了下来]。 | 5 / 6 | 1.81 | C | — | Smoke clears: the tree, still green on one side. Hold. | 1, 5 |
| E1 | 106.42 | 108.68 | 48.00 | 可你，其实只活着[一半]。 | 9 / 11 | 2.39 | TL new | — | Music hush (bar 48). Slow push in on the trunk: the green half and the black half. | 5 |
| E2 | 108.68 | 111.51 | 49.00 | 西边那根树干，被火[烧死]了。 | 11 / 13 | 2.67 | TL | stamp 年代不详 | The west trunk desaturates fully; a faint ember glow inside the east trunk's hollow. | 5 |
| E3 | 111.51 | 114.34 | 50.25 | 东边那根活着，只靠一条树皮， | 12 / 14 | 2.81 | TL | — | X-ray-like reveal: a thin glowing band runs up the north face of the east trunk. | 5 |
| E4 | 114.34 | 116.04 | 51.50 | [32厘米]宽， | 4 / 5 | 1.67 | C | measure line 32 cm | A dimension line snaps across the band. | 5 |
| E5 | 116.04 | 118.87 | 52.25 | 给[11.5米]高的你输送养分。 | 10 / 12 | 2.53 | TL | measure line 11.5 m | A vertical dimension line runs root to crown; the glow rises with it to the leaves. | 5, 6 |
| E7 | 118.87 | 121.70 | 53.50 | 今天，这里的古树被[24小时]监测。 | 13 / 15 | 2.96 | TL new | stamp 泰山景区 · 一树一策 | Pull back to today: a small numbered tag and a sensor box near the roots (generic, not a copied prop); a slow pulse line runs across the screen corner. | 36 |
| F1 | 121.70 | 123.96 | 54.75 | 人们收集了你的[种子]。 | 9 / 10 | 2.39 | TL new | — | Music starts to rebuild toward the peak. Small seeds drop from the crown into a soft light. | 43, 44 |
| F2 | 123.96 | 126.79 | 55.75 | 2024年，你的6棵小树[出发了]， | 11 / 13.5 | 2.67 | TL | 你 2133 岁 · stamp 2024.4 · 新京报 | Six seedlings in pots glow, the same colour as you, and slide out of frame west. | 43 |
| F3 | 126.79 | 128.49 | 57.00 | 去[茂陵]—— | 3 / 5 | 1.53 | TL | — | Background slides: a long low road, then a large earth mound on a plain. | 43 |
| F4 | 128.49 | 130.19 | 57.75 | 汉武帝的墓， | 5 / 6 | 1.81 | TL | — | The mound fills the back. | 43 |
| F5 | 130.19 | 132.45 | 58.50 | 相传种下你的那个人。 | 9 / 10 | 2.39 | TL | — | A faint ghost of the opening's Han silhouette over the mound. | 9, 43 |
| — | 132.45 | 133.58 | 59.50 | *(no new line: the peak lands on a bar line)* | | | | | | |
| F6 | 133.58 | 138.68 | 60.00 | 两千多年后，轮到你的孩子[守他]了。 | 14 / 16 | 3.10 | C | stamp 泰山汉柏（幼苗）守护茂陵 | EMOTIONAL PEAK (bar 60 downbeat): the six seedlings stand around the mound, glowing; split frame: you at Taishan, them at Maoling, same colour. Hold. | 43 |
| G1 | 138.68 | 141.51 | 62.25 | 如今，泰山一年来[800多万]人次， | 12 / 14.5 | 2.81 | TL new | stamp 泰山景区 · 2023—2025 · 新华社 | Back at the tree: tourists stream past in time-lapse, phone flashes. | 41 |
| G2 | 141.51 | 143.21 | 63.50 | 来了，又走了。 | 5 / 7 | 1.81 | TL | — | The crowd thins and passes, like the torch lines did. | — |
| G3 | 143.21 | 145.47 | 64.25 | 2026年，你[2135岁]。 | 5 / 9 | 1.81 | C | 你 2135 岁 (small print: 相传 · 按汉武帝首次封禅推算 · 估算) | Counter stops. The courtyard empties; snow or dusk. Only the tree glows. | 13 |
| G4 | 145.47 | 147.74 | 65.25 | [你一直在]。 | 4 / 5 | 1.67 | C | — | Hold on the tree, same framing as frame 0. | 1 |
| Q | 147.74 | 153.96 | 66.25 | 皇帝和你，[谁是主，谁是客]？ | 10 / 13 | 2.53 | C | end card | Juno end card over the tree; follow pill 关注 Juno · 一起看懂世界. | 29 (callback), 21, 22 |

`Chars` = pace.py count (a number counts as 1) / display width (digits ½). `Bar` = 1-based bar position on the 106 BPM grid.

## End card
**Question for comments:** 「皇帝和你，[谁是主，谁是客]？」. A callback to Qianlong's own question (row 29), now asked of the whole film. Either answer is defensible (the emperors made the place sacred; the tree outlived and outranked them, and its children guard Wu Di), so people will argue.
**Alternative:** 「你信，它是[汉武帝种的]吗？」. A sharper yes/no fight over the 「盖」 line (rows 9, 12).
**@ prompt (description):** 「@一个去过泰山的朋友：你在岱庙见过它吗？」 (people send it to whoever climbed 泰山 with them).
**Sources line (end card, small):** 《汉书·武帝纪》· 郦道元《水经注》· 故宫博物院《紫禁城》2022 · 央广网/经济参考报 2026 · 新京报 2024 · 齐鲁晚报 2015 · 泰山管委会 · 新华社.

## Fact discipline (what was kept off screen and why)
- **Planting:** 相传 at C2, A2 and F5; the counter carries 相传; the 「盖」 scene (A6–A9) makes the doubt part of the story (rows 9, 12). No 「史记没写」: only 《汉书·武帝纪》 is named, and the line says exactly what row 12 found (every visit logged, no tree).
- **Age:** 「2100多岁」 on screen at C1 (row 1); 「2135岁」 only as the counter and at G3, with 相传 + 「按汉武帝首次封禅推算 · 估算」 small print (row 13). Not 2136.
- **No procession passes the tree** (row 24): the torch line is always on the mountain, behind; D8 says 「在山下」.
- **No 5 vs 6 trees:** the film never counts the cypresses. The 「6」 on screen is 6 封禅 emperors (row 22) and 6 seedlings (row 43).
- **Fire:** no year; the stamp reads 「年代不详」 (row 5).
- **1928–29:** soldiers unnamed, no insignia; the dead-cypress line is stamped 「据《齐鲁晚报》2015」 (rows 30–31).
- **Left out:** 1967 stele story; Japanese bombing (row 34, nothing ties it to the tree); 康熙 (row 25, temple visit unverified); 挂印封侯 / 萧何 (row 45, quote not captured); UNESCO / 卢卡斯 / 双遗产 (rows 38–39, good but a list, not an event); the ginkgo rescue (row 37, a different tree); 武则天 (row 19, not sourced); railing / "no touching" props (row 42, UNVERIFIED: the art director checks a licensed photo first).

## Cut candidates if the music cut runs short
A8 (−1.70; A9 still lands the idea), D10 + its pad (−3.39; the time-lapse can carry it), E7 (−2.83), G2 (−1.70).
