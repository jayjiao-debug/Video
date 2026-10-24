# Gate 1 notes: 定情信物 · 一人一半, script v1 + lines.json (45 lines, 2:25), r1. Verdict: REVISE

Scores (rubric 1–5, only the areas this gate covers): **script 3** (4 once the notes below are done) · facts **pass with 6 fixes** (2 overclaims in lines, 1 missing 相传, 3 fact rows to extend) · visual / info / edit / motion / sound: not at this gate. Picture-column body-logic notes go forward to the storyboard (notes 15–24).

**Bottom line.** The idea is strong and honest at its core. The viewer's own couple avatar is on frame 0, 破镜 is the true payoff, and the music map is tight: every line start is on the grid (I checked all 45, 0 ms off), with the drop on 「今天的情侣头像，还是一人一半」. Four things block it:
1. The hook's number arrives at 4.5 s with no 相传, and the hook never says what the "招" was.
2. Two lines claim more than the facts. 「两千多年过去了」→「还是一人一半」 dates the split to 2,000 years ago, but the earliest split we have is 589 (1,437 years). 「意思没变过」 says 木瓜, 三转一响 and 520 all mean "my half is yours". They don't.
3. 破镜 skips its own cause: the poem 「镜归人不归」 is why 杨素 lets her go. 「杨素把她还给了他」 reads as handing over property.
4. Five lines are over 16 字 or don't read alone: D4, G1, G4, G5, E3's 「他」.
All of this is line-level. One screenwriter pass keeps every section boundary.

**Checks I ran:** `pace.py lines.json --film-end 145.1` gives 7 % waiting and 0 TOO FAST. The CHECKs (title 9.06–11.89, dead stop 127.0–129.3) are named beats. I traced every line to facts.md by hand. Grid check: 0.5688 + 0.56605·k, the coda chords and the intro-return grid. After all my replacements: 46 lines, 0 TOO FAST, 5 % waiting, every start on the grid, no line moves across a music section. File: `/tmp/claude-0/-home-claude/80d4d845-657a-5caf-b801-b3009dd8b8fb/scratchpad/lines_proposed_gate1_r1.json` (reference only; the screenwriter owns lines.json and build_lines.py).

## Gate 1 checklist

| Check | Result | Evidence |
|---|---|---|
| Hook, first 3 s | **Fix** | Frame 0 = your own couple avatar (rows 22, 47). Good. But the contradiction (1400多年前) only appears at 4.53 s, behind two 2.27 s lines. The thing "used" 1,400 years ago is never named, and a half bronze mirror won't read at phone size. There's no 相传, though the brief requires it for 破镜. Note 1. |
| Facts trace | **6 fixes** | Table below. |
| Throughline 「一人一半」 honest? | **Mostly, two lines overreach** | The film shows exchange (木瓜/玉), pairs (rings), real splits (mirror 589, hairpin 806, avatar today), and wedding/number tokens (三转一响, 520). That's honest as long as the ending says only the split *trick* kept coming back. H4 and P2 say more. Notes 2, 3. |
| Each line reads alone | **Fails on 6** | E3 「寄一股给他」: who is 他? 玄宗 is never named. E2: why does she split it? 死后 is never said, so 天上人间 has no context. D5 「杨素」: who is he? D9 has no cause. G5: which 红包, and forever? D8 「两个一半」 is awkward. |
| Chinese naturalness | **4 lines** | 「两个一半」, 「只能天上人间」 (awkward, and 天上人间 is also the Beijing nightclub, a snicker risk when it stands alone), 「打破一面镜子」 (打破 reads as accidental smashing; the source 破 is deliberate), 「把她还给了他」 (she is not an object). |
| ≤ 16 字 | **5 over** | C3 17, D4 18, G1 17, G4 22, G5 21. |
| Music map | **Pass** | All starts on the grid. Title HIT at 9.06/9.626, 破镜 break 47.55 → re-entry 48.117 on 「约好」, valley at 66.23 for 长恨歌, stop HIT 96.231 on 「可你回头看」, DROP 106.986 on P1, coda on its chords, final hit 137.765. My notes move lines only *inside* the cold open (0–9.06), S4 (52.644–66.23) and the S6 / pre-drop split at 93.399. No line crosses a boundary in brief.md / music_map v2. |
| Every scene adds something | **Pass** | Exchange → pair → split → split again → objects become money and numbers → the split returns. The one risk is the 27 s between the hook's mirror and its payoff at 39 s (A + B). Note 14 makes the B → D handover show the progression. |
| Ending | **Pass** | K1/K2 contrast (reunited / apart forever) → K3 into the dead stop → the end question. Two questions 10 s apart is acceptable: K3 is private, Q2 is the comment bait (「换过几次」 = avatar or partner, which will start an argument in the comments). |

## Fact trace (line → row)

| Line | Row | Status |
|---|---|---|
| C1–C2 | F17 | ✓ observation, no figure. |
| C3 「一千四百多年前就有人用了」 | F10 (估算 589) | **No 相传**, and the object isn't named. Note 1. |
| A1–A5 | F1 | ✓ |
| B1–B3 | F2 | ✓ (绾臂双金环, 耳中双明珠, 约指一双银). |
| B4 「一千八百年前」 | F3 | ✓ 估算. 繁钦 d. 218 → at least 1,808 years, so 「1800多年前」 is more exact. Note 6. |
| B5 「好多都是一对」 | F2 | **Under-sourced.** F2 quotes four lines, all with 双. "好多" needs the full count of gifts in the poem. Notes 6, 25. |
| D1–D3 | F4 | ✓ 相传 present. |
| D4 | F5 | ✓ one future date. |
| D5 | F6 | ✓ |
| D6 「一路找到京城」 | — | F7 has no 京城. Add the source line (「德言流离辛苦，仅能至京」) or drop the line (note 4 drops it). Note 25. |
| D7–D8 | F7 | ✓ |
| D9 | F9 | ✓ fact, but no cause shown (F8 unused). Note 4. |
| D10 | F4 | ✓ |
| E1–E5 | F11 | ✓ the split. 「死后成仙」 and 「托人(方士)寄」 are needed for clarity but aren't in F11's quote. Add 「上穷碧落下黄泉」…「中有一人字太真」 and 「临邛道士」. Note 25. |
| G1 「1970年代」 | F13 | **Decade not in the quoted wording.** F14 says 六七十年代. Note 25. |
| G2 | F13 | ✓ |
| G3 | F14 | ✓ 估算 (100 ÷ 35 ≈ 2.9; range 2.5–4). 「约等于/顶」 is fine. |
| G4 「一首歌把520唱成了我爱你」 | F15 | **Overclaim**: the plain reading is "this song created it". F15 = earliest known link. Note 8. |
| G5 | F16 | ✓, but it omits "that day only" and "微信", so it reads as a permanent rule. Note 9. |
| H2–H3 | F4, F11 | ✓ |
| H4 「两千多年过去了」 | F1 | **Overclaim** together with P1: the first split is 589. Note 2. |
| P1 | F17 | ✓ |
| P2 「意思没变过」 | — | **Unsupported** for 木瓜 / 三转一响 / 520. Note 3. |
| K1–K3, Q | F9, F11 | ✓ |

## Notes

| # | Sev | Where | Note (exact wording) | Route to | Owner note |
|---|---|---|---|---|---|
| 1 | **MAJOR** | C1–C3, 0–9.06 | Merge C1+C2 so the number lands by 3 s, name the object, and add 相传. Three lines on the grid: **0.000–2.833 「你们的情侣头像，[一人一半]。」** / **2.833–5.664 「这招，[1400多年前]就有人用了。」** / **5.664–9.060 「相传，是一面[分成两半的镜子]。」** The halves start sliding apart on the first note (0.555), not at 2.27. | screenwriter (lines), animator (motion start) | rows 22, 47 (contradiction by 3 s, something moves in the first second); brief "相传" |
| 2 | **MAJOR** | H4 103.02 | 「两千多年过去了，」 → **「1400多年过去了，」**. Followed by 「还是一人一半」, the old line dates the split to the 诗经, which never split anything. It also bookends C2's number. | screenwriter | row 11 (plain reading must be what the film shows) |
| 3 | **MAJOR** | P2 110.38 | 「东西一直在换，意思[没变过]：」 → **「东西换了又换，这一招[还在]：」** (echoes the hook's 这招). Then P4 「我把一半，留给你。」 stays. This claims only that the split trick came back, which is what the film shows. Producer: this softens the brief's takeaway wording (意思没变过); log it. | screenwriter, producer | row 11 |
| 4 | **MAJOR** | D6–D9, 54.34–63.97 (inside S4) | Cut D6 (the walk stays in the picture) and add the poem as the cause. New slots: **54.344 「正月十五，真有人在卖[半面镜子]。」** / **57.174 「两半一合，[对上了]。」** / **59.438 「他题诗：[镜归人不归]。」** (small under it: 「镜与人俱去，镜归人不归」) / **61.702 「杨素动容，[成全二人]。」** / 63.966 D10 unchanged. This drops 「还给了他」 (she's a person, not property) and the 京城 row gap. | screenwriter | row 128 (state cause and effect) |
| 5 | **MAJOR** | E1, E3 (and E4/E5) | Who and why: E1 → **「白居易笔下，杨贵妃死后成仙，」** (14, fits 3.40 s). E3 → **「留一股，[托人寄给玄宗]。」**. E4/E5, plainer, with the original line small under: **「她说：只要心不变，」 / 「[天上人间]，总会相见。」** (金钿 ≠ the 金钗 we just saw). | screenwriter | rows 13, 128 |
| 6 | MINOR | B4, B5 | B4 → **「1800多年前，就送[戒指]了。」**. B5 → **「诗里的信物，好多都是[一对]。」** ("好多" is scoped to the poem). Only if the researcher's count supports "好多" (note 25); otherwise **「诗里还有好几样，也是[一对]。」** | screenwriter | brief "Must get right" |
| 7 | MINOR | D2, D4, D5, D8 | D2 → **「驸马徐德言把铜镜[一分为二]，」** (deliberate, not 打破). D4 (18 字) → **「约好正月十五，在集市[卖镜相认]。」**. D5 → **「国破，她被送进权臣[杨素]府里。」** (who 杨素 is). D8 is covered in note 4. | screenwriter | rows 13, 104 (≤16) |
| 8 | **MAJOR** | G4 88.31 | 22 字 and an origin overclaim. → **「1998年的歌里，[520]就是“我爱你”。」** Keep the stamp 「目前能追溯的最早出处」. | screenwriter | row 11; brief 520 rule |
| 9 | MINOR | G5 91.14 | 21 字, reads as permanent. Split it at the pre-drop boundary: **91.137–93.399 「2016年5月20日这一天，」** / **93.399–95.600 「微信红包上限，[200变520]。」** (the brief allows naming 微信 in text; no logo in the picture). | screenwriter | row 104 |
| 10 | MINOR | G1 79.82 | 17 字. → **「七十年代，结婚讲究[三转一响]：」**, or 「六七十年代，…」 if note 25 doesn't confirm the decade. Keep the picture as a wedding. | screenwriter | row 104; brief 三转一响 rule |
| 11 | MINOR | G3 85.48 | Whose wages? Optional: **「一辆自行车，顶工人[三个月工资]。」** (passes pace). The pay-slip picture already says 工人. | screenwriter | row 13 |
| 12 | MINOR | K2 120.26 | 「只能天上人间」 is awkward, and the phrase standing alone invites nightclub jokes. → **「金钗那一对，一个天上，[一个人间]。」** (16). | screenwriter | row 13 |
| 13 | — | Titles | Rank: **1 > 3 > 2.** **1** 「情侣头像这招，古人1400年前就用过了」: the viewer's own object plus a surprising number; true as a 相传 story. Use digits so it fits two cover lines. **3** 「从木瓜到520…」: clearest, but a list title with the least curiosity, and it files 520/三转一响 under 定情信物. **2** 「中国人谈恋爱，一千多年都在"一人一半"」: misleading. "都在" claims continuous practice; the film has three splits (589, 806, today), and 三转一响/520 aren't halves. Don't use 2 as the cover's second line either. | screenwriter, producer | rows 10, 11, 105 |
| 14 | MINOR | B5 → D1, 38.5–39.06 | Show the progression instead of telling it: the two rings slide apart and become the two halves of the mirror (the brief's slide-into-the-gap device). The 0:12–0:38 stretch then reads as the road to the hook's mirror, not a detour. | art-director | rows 15, 86 |
| 15 | **MAJOR** | Picture C1/P1 (phone logic) | A couple avatar is two accounts. In one chat screen, the partner's avatar sits left and yours sits right. Draw it so the **left half is on the left account and the right half on the right**, and the halves line up across the middle. P1's "two phones": side by side, edges touching so the picture completes across the bezels. | art-director | row 11 |
| 16 | **MAJOR** | Picture B4 「One ring slides to a hand」, P4 「One hand slides a phone to another」 | Disembodied hands entering from off-screen. Owner: "这个手好奇怪 → 干脆别画手了". B4: the rings slide apart (feeds note 14), no hand. P4: two full figures standing side by side in profile, each holding a phone at chest height, screens to camera, edges touching. Sliding your phone to someone doesn't mean "我把一半留给你" anyway. | art-director, animator | rows 9, 74 |
| 17 | MAJOR | Picture A1–A3 (fence) | Throw and catch: her arm swings and releases at the top. The quince follows a real arc in one continuous shot (both figures in frame or a camera follow). His eyes follow it, and he catches it with both hands at chest height. A3 「hands back」 over a fence: both step up to the fence. He holds the pendant by its cord over the top rail; her hand closes on the pendant. Both feet on the ground, in profile, facing each other. Don't throw the jade. | animator | rows 52, 77, 101 |
| 18 | MAJOR | Picture D2–D3 (mirror) | A bronze mirror can't be snapped by bare hands in mid-air. He holds it by the rim with both hands, a crack runs across, and the halves part, one in each hand. Then he turns to her (both in profile) and holds out one half; her hand takes it at the half. 「Each holds a half to the light」: the light must be in frame (the fires on the horizon or the moon), and the halves catch it on the side facing it. | animator, art-director | rows 74, 77, 129 |
| 19 | MINOR | Picture D5 「she is led through a great gate」 | "Led" needs a leader: two guards walk ahead of / beside her. Everyone on the ground line, gate to human scale (≥ 2× height). | animator | rows 74, 98 |
| 20 | MAJOR | Picture D7–D8 (market) | Get the hands right. The servant (not the wife) holds her half up at a stall. He walks in, stops by changing pose (not frozen mid-stride), takes his half from his sleeve, and the two men bring the halves together between them, both in profile, hands at the join. The script's "His half meets hers" must be shown as servant + husband. Lantern light lands on the mirror. | animator | rows 77, 129, 81 |
| 21 | **MAJOR** | Picture E2–E5 (hairpin) | 「One prong floats down out of the clouds」: objects don't float. In the poem a messenger (方士) carries it. She stands on a palace terrace on a cloud bank (not on mist). She pulls the hairpin from her hair, pulls the two prongs apart and hands one to the messenger. He walks down a cloud path; at the window he hands it to the old emperor, who faces him. E5 split level: he looks up, she looks down. **Pick one: her prong stays in her hand** (script says "in her hair" at E3 but "holds the other" at E5). It must match H3 and K2. | animator, art-director | rows 77, 121, 131 |
| 22 | MINOR | Picture G1–G2 (三转一响) | True scale: bicycle wheel ≈ the groom's hip. A watch at true scale is invisible, so put it on the groom's wrist with a ring callout, not as a floating giant watch. The sewing machine and radio sit on the ground or a table, not in the air. The four "stamps" land on surfaces. | animator, art-director | row 98 |
| 23 | MINOR | Picture P2 「two phones light up across a city」 | If there are people, give each a window with a figure in profile looking at their phone, sightlines across the street to each other's window. Otherwise keep it phones-only, no hands. | art-director | row 52 |
| 24 | MINOR | Picture D1/E1 stamps vs titles | Stamp texts as in script.md. Keep 相传 on the 破镜 stamp even though D1 says it, because the stamp outlives the subtitle. | art-director | brief |
| 25 | MINOR | facts.md | (a) F2: count every gift line in 繁钦《定情诗》 and list which contain 双, so "好多" can be checked. (b) F7: add 「德言流离辛苦，仅能至京」 or confirm D6 is cut. (c) F11: add the lines showing she is in the immortal realm after death and the 临邛道士 messenger. (d) F13: quote the decade sentence from 新华网 (七十年代 vs 六七十年代). Primary sources only (row 19: not Wikipedia; the zh.wikisource *text* of 本事诗 is a transcription, so cite the edition if there is one). | researcher | row 19 |

## Proposed lines (all on the grid, pace OK: 0 TOO FAST, 5 % waiting)
Only the changed lines are listed; every other line stays as in lines.json.

| Start–end | Line |
|---|---|
| 0.000–2.833 | 你们的情侣头像，[一人一半]。 |
| 2.833–5.664 | 这招，[1400多年前]就有人用了。 |
| 5.664–9.060 | 相传，是一面[分成两半的镜子]。 |
| 32.834–35.664 | 1800多年前，就送[戒指]了。 |
| 35.664–38.500 | 诗里的信物，好多都是[一对]。 |
| 41.324–44.155 | 驸马徐德言把铜镜[一分为二]， |
| 48.117–51.513 | 约好正月十五，在集市[卖镜相认]。 |
| 51.513–54.344 | 国破，她被送进权臣[杨素]府里。 |
| 54.344–57.174 | 正月十五，真有人在卖[半面镜子]。 |
| 57.174–59.438 | 两半一合，[对上了]。 |
| 59.438–61.702 | 他题诗：[镜归人不归]。 |
| 61.702–63.966 | 杨素动容，[成全二人]。 |
| 66.231–69.627 | 白居易笔下，杨贵妃死后成仙， |
| 71.891–74.155 | 留一股，[托人寄给玄宗]。 |
| 74.155–76.419 | 她说：只要心不变， |
| 76.419–79.200 | [天上人间]，总会相见。 |
| 79.816–82.646 | 七十年代，结婚讲究[三转一响]： |
| 88.307–91.137 | 1998年的歌里，[520]就是“我爱你”。 |
| 91.137–93.399 | 2016年5月20日这一天， |
| 93.399–95.600 | 微信红包上限，[200变520]。 |
| 103.024–105.800 | 1400多年过去了， |
| 110.383–113.213 | 东西换了又换，这一招[还在]： |
| 120.260–123.610 | 金钗那一对，一个天上，[一个人间]。 |

## What must not change (it works)
- Frame 0 = the viewer's own couple avatar, the topic itself, no detour (rows 22, 45, 47).
- The device: split objects as two halves that slide apart, the next object slides into the gap. Halves return at H2/H3 and fly together on the DROP into the avatar.
- 破镜 as the spine: 相传 labels, the 1-beat break after 「和妻子一人一半」, the re-entry hit on 「约好」, 「这就是，破镜重圆」.
- 长恨歌 in the valley (no kick). 三转一响 worded as marriage, pictured as a wedding. The 520 stamp 「目前能追溯的最早出处」.
- H1 「可你回头看：」 on the stop HIT and the 0.98 s silence, then 「镜子，一人一半 / 金钗，一人一股」, then P1 on the DROP.
- K1/K2 contrast (重圆 vs 天上人间), K3 「你手里那一半，给了谁？」 into the dead stop. End question 「你们的情侣头像，换过几次了？」.
- The original classical line set small under the subtitle. Every line start on the bgm2 v2 grid / coda chords. Length 145.1 s = the cut.
- The in-film title card 「定情信物：一人一半」 on the 9.06 HIT / 9.626 downbeat (row 133 precedent).
