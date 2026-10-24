# Gate 1 notes: 圆明园马首, script v2 + lines.json (50 lines, 2:35), r2. Verdict: REVISE (small: 4 wording fixes, no structural change; replacements below are pre-approved, so no round 3 read is needed once they are applied)

Scores (rubric 1–5, only the areas this gate covers): **script 4.5** (r1: 4) · facts **pass with 2 on-screen slips and 3 hygiene items** (r1: one overclaim plus five cautions, all closed except what is listed here) · visual / info / edit / motion / sound: not at this gate.

**Bottom line.**
- v2 answers all 15 r1 notes. The counter fix works and the ending now lands.
- Two things are still wrong on screen. Both are one-line fixes:
  1. **K3 「六个在北京城里的博物馆」** is a present-tense location. The researcher's own F27 contradicts it: four of the six originals are on tour (Zhejiang Museum until 18 Oct 2026, Kunshan from 31 Oct 2026).
  2. **The H8 stamp 「北京大学检测」** misattributes the ear finding. I fetched the 中新网 2022 article. 北大 tested the copper (98 %). The ear observation is 圆明园专家刘阳's, by eye. No institution examined the ear.
- Two smaller things follow from the v2 cuts:
  - With H9–H10 gone, H4 「回到圆明园的，只有你」 can be contested by anyone who remembers the 2023 reunion at the garden. 「如今」 fixes it.
  - K6 says 它, against the film's own rule.
- Length is fine at 155.25 s. After a worst-case +8 % bar retime that is about 2:47, under the 3:00 cap.

**Inputs read:** director.md, SKILL.md (Director), rubric, all owner-notes rows, brief, r1 notes, script.md v2, lines.json, facts.md (F1–F27), crew_log.

**Checks I ran myself:**
- I did not run `pace.py` or `facts.py`, because they write flag files into the episode folder and I was told to edit only this file. I recomputed the reading budget (0.5 + 字/7 + 0.6, +0.4 for the typed C1) for all 50 lines in a throwaway script.
  - No line is more than 0.4 s too fast. The worst are C2 at −0.39 and C4 at −0.21, inside the cold open's deliberate hard-cut rhythm.
  - Every other window is within +0.6 s of its budget, except the named picture beats: A7 +2.2, B2 +1.5, H4 +1.4, B4 +1.2, E4 +1.1 and the Q end card +2.9.
- I traced every number, date and name in lines.json and the stamps in script.md by hand against F1–F27. Details are in the facts section.

## 1. Did each r1 note get answered?

| r1 # | Result | Why |
|---|---|---|
| 1 STRUCTURAL (counter label) | **Done** (one spec gap, N5) | 在家 12/12 → 回国 0/12 → 3 → 4 → 5 → 7; 回家 appears only at C6, E4, H1 and the H4 second row, and every use now means the garden. The spec gap is that C7's counter label is not written down. |
| 2 十二个兄弟 | **Done** | C7 「可十二个里，还有五个没回来」, H3 「十二个里，回到中国的有七个」. |
| 3 Ending (K2–K3 repeat, dragon) | **Done, with two defects** | R4 answered by F26 and the beat added as K5–K6, which is the right fix. Defects: K3 location (N1), K6 它 (N4). |
| 4 C4 reads as one sale | **Done** | 「又被人花6910万港元买下」; D2 stamp 几十万美元. |
| 5 C5 「送」 | **Done** | 「又被捐了出去」. |
| 6 Name Ho; why no hammer | **Done** | D5 names him, D8 「还是何鸿燊」, E2 names him again, so 他 in E3 and E4 is safe. The D7 stamp carries the 国家文物局 reason. Wording is a shade off F12 (N6). |
| 7 Number soup | **Done in substance** | D3 and D11 now keep the 你 voice and the year lives in the stamp. D12 carries 「两件」. D14 says 「4年后」. D6, E1, E2, E3 and H1 still repeat the stamp's year in the line. They are short, they read alone, and the budget is met, so I accept them. The stretch D3–D14 is now 35 s of mostly punches, and I no longer call it a swipe risk. |
| 8 它们 / 这十二年 | **Done** | D14 「鼠和兔」; E1 「2007年起…12年」. |
| 9 Four small reads-alone fixes | **Done** | H2, H5/H6, H8 are fixed; H10 is cut with H9. |
| 10 A1/A2 overclaim | **Done** | 「乾隆年间，你由红铜一次铸成」; A4 「每两小时」. |
| 11 R1–R5 | **Done** | F26 and F27 answer R1, R2, R4 and R5. R3 is answered by MIT plus CityU (F3, F8b), and the 唯一 source is 北京旅游网. See hygiene item N7 for what is still loose. |
| 12 C1 moves | **Carried** | Logged for key frames, not a script issue. |
| 13 Title gap | **Carried** | Same. Measure bgm2's hardest drop first (rows 84, 91, 133). |
| 14 USD tags | **Done** | D10 stamp 「几十万美元 → 884万美元」. |
| 15 Fold B2 | **Done** | One line, 1860.10.18 in the stamp. Its window is 4.5 s against a 3.0 s budget. That is a named fire beat, but 0.5–1.0 s could come back at the retime. |

## 2. The STRUCTURAL change: does it work now?

**Yes.**
- I traced the counter line by line, plus the cold open. The labels stay true to what each line says:
  - A1 在家 12/12 → B4 回国 0/12 → D4 3 → D5 4 → D9 5 → D14 7 → H3 「回到中国的有七个」, with the label 回国 7/12.
  - 回家 first lights at C6 (2020), E4 and H1, all of which are the garden.
- At H4 the second row 回家 1/12 appears under 回国 7/12. It now reads as a reveal, not a correction: the viewer has already been told seven are back, and the twist is that only one is back in the garden.
- Counting the horse in 回国 from 2007 (D9) is consistent. Hong Kong and Macau are inside the label, and the pig head in 2003 was treated the same way.
- C6 「你回家了」 followed by C7 「五个没回来」 is safe in the cold open. 回来 is deliberately loose there and H3–H4 define it.
- **One spec gap (N5).** The C7 picture says "seven lit, five empty" but not the counter text. It must read 回国 7/12, not 回家, or C6 and C7 contradict each other on frame.

## 3. The new ending K1–K6 + Q

**Facts against F26 and F27.**
- K5 「2018年，法国拍出一个疑似龙首」: F26 gives 17 Dec 2018 at Tessier & Sarrou, hammered at 240万欧元 (中央社). 「疑似」 is kept. Stamp 2018.12.17 · 法国 ✓.
- K6 「240万欧元」 ✓. The stamp 「真伪仍存疑」 is 中央社's own phrase ✓. The buyer is unnamed ✓, and no one claims it was found ✓.
- K4 「五个，至今没回中国」 ✓ (F23, no new return up to Oct 2026 per F27). The dragon is not counted as returned.
- K2 + K3 + K4 now add up on screen: 十一 = 六 + 五. The cold reader's "到底差五个还是差十一个" is answered.
- **K3 is not safe as written (N1).** F27 shows the four 保利 originals touring Hangzhou and Kunshan, so 「在北京城里」 is false at publication. 「在国内的博物馆里」 stays true even while they tour, and it pairs cleanly with K4's 「没回中国」.

**Does it land?**
- Yes. K1 noon → K2 「还差十一个」 is still the film's best close. K3–K4 explain the number in 5.5 s without a third repeat of C7.
- K5–K6 is the one new fact that earns Q. It is the same dilemma in real life (a hammer falls, the head might be fake, someone paid 240万), and it echoes D7 and D13. Hammer 5 on an outline with a question mark also finishes the set-piece's escalation.
- The risk is that the emotional image (K1–K2) is followed by about 12 s of facts before Q. That is a picture problem, not a script one: keep K3–K6 inside the fountain's twelve slots, so the slots, not a new graphic, carry the count. Carried to the storyboard (N8).
- Q 「如果找到了，该花钱买回来吗？」 now has a live case behind it. Keep it.

## 4. New overclaims and reads-alone failures; numbers checked against ✓ rows

Every number, date and name in lines.json traces to a ✓ row, except the items below.

| Line | On screen | Row | Status |
|---|---|---|---|
| K3 | 六个在北京城里的博物馆 | F27 | **Contradicted for the 4 touring originals.** N1. |
| H8 stamp | 北京大学检测 | F5, F6 | **Misattribution.** 北大 did the copper test (F5). The ear is 刘阳's observation (中新网 2022, which I fetched). N2. |
| H4 | 回到圆明园的，只有你 | F21, F24, F27 | True as present state, but contestable by the 2023 visit (F24) now that H9–H10 are cut. N3. |
| K6 | 是不是它，说不清 | F26 | Content ✓. 它 breaks the 你 / 兄弟 rule. N4. |
| D7 stamp | 国家文物局：反对公开拍卖 | F12 | Paraphrase of 「表达了终止公开拍卖的坚定立场」. Acceptable, but use the source's word. N6. |
| D5 | 港澳企业家何鸿燊 | F18 | F18 says 「著名企业家」. 港澳 is not in a row. Low. N7. |
| H4 picture | 保利艺术博物馆 for the pig | F18 vs F27 | F18's row still says 保利剧院. F27 resolves it, but the F18 row text should be updated so the label has a ✓ row. N7. |
| script.md Takeaway | 五个不知在哪，一个说不清真假 | F23 | That is 6, not 5, and it is the exact flat claim correction 3 forbids. Not in lines.json, but the owner reads script.md. N7. |

**Everything else is ✓:**
- C1–C6 and all stamps.
- A1–A7: 乾隆年间 is the safe date; 每两小时 and 午时 are F3, press sources plus MIT and CityU.
- B1–B4: no taker named.
- D1–D14:
  - 4年后 = 2013 − 2009 ✓.
  - 二十多倍 is the USD ratio, 22–24× ✓.
  - 3149万 is for both heads and says 两件 ✓.
  - 买家 and 收藏家 are unnamed ✓.
- E1–E4: 12年 is an estimate, shown as 2007–2019; 98岁 and 他没等到 ✓.
- H1–H3, H5–H7:
  - 160年 is arithmetic ✓.
  - 唯一 古建筑 is F22: 中新网 2011 plus 北京旅游网 ✓.
- C7 and K1–K2, K4 「今天 / 至今」 now rest on F27 (evidence to 20 Oct 2026). Acceptable. I would date the C7 stamp 「2026年10月」 instead of 「今天」, so it ages honestly. Optional.

## 5. Cut of H9–H10

**I agree with the cut, on one condition: N3 (H4 gets 「如今」).**
- Reasons to agree:
  - H8 → K1 is tighter, and the ear is the better last beat before the noon image.
  - The six are covered by K3.
  - Putting H9–H10 back costs about 5.75 s (about 2:54 after a worst-case retime, under the cap but uncomfortable).
  - The owner's row 104 says the number of subtitles should not stretch.
- Without 「如今」, the cut removes the only line that told the viewer the four brothers had visited and left, and that is exactly the guard H4 needs.
- If the owner misses the brothers' 12-day visit, it can be reinstated whole (F24, ✓).

## 6. Final title ranking (owner's pick; ≤ 10 字)

1. **马首回家，用了160年.** The edits to the counter and to 回家 make it more accurate than in r1: 回家 means the garden everywhere in the film, and 1860 → 2020 = 160 (H2 shows the same number). It keeps the twist and names the subject. The cold open already gives both years, so the card adds only 「160」. It is still the safest card.
2. **花6910万买下，又捐了出去.** Real contradiction, and the cold reader's click. It is 13 字 against the 10 cap, the card has no 马首, and it repeats C4 and C5 word for word. It becomes #1 only if the owner accepts a shortened form and the cover carries the horse (owner's taste call).
3. **回到圆明园的，只有它.** Still spoils H4. It says 它 where the film says 你, and its plain reading is wrong (seven came back to China). Do not use it.

Optional 4th, unchanged from r1: 马首回家那天，他没等到 (spoils E4). The cover carries the title alone (row 105).

## Notes

| # | Sev | Where | Note | Route to | Owner note it relates to |
|---|---|---|---|---|---|
| N1 | **Med · facts** | K3 (137.5–140.75) | **The location claim is false for four of the six.** F27: the four 保利 originals toured Hangzhou to 18 Oct and Kunshan from 31 Oct 2026. **K3 → 「六个，在国内的博物馆里，」** (10 字, fits the 3.25 s window; it stays true on tour and pairs with K4 「没回中国」). H4 and K3 pictures: label the two collectors as holders (「收藏：保利艺术博物馆 · 国家博物馆」); do not draw the six as sitting in one city. | screenwriter (line), art-director (labels) | brief "present-day claims"; Risks "legends / unverified as fact" |
| N2 | **Med · facts** | H8 stamp + picture | **Wrong source on a stamp.** The ear finding is 圆明园专家刘阳's visual observation (中新网 2022, which I fetched: 「说明它在100多年的经历中受到过外力撞击」). 北大 tested only the copper. **Stamp → 「圆明园专家刘阳 · 观察」**; fallback 「研究者观察」. The researcher adds his title and the 中新网 sentence to F6. Picture: drop the "scan line over the ear" (it implies a lab test); use a soft highlight ring on the curl. The line 「研究的人说：这一路，你被撞过」 is fine as written. | screenwriter (stamp), researcher (F6), art-director (picture) | row 11 "plain reading"; Risks "ear damage is an interpretation" |
| N3 | **Med · reads alone** | H4 (116.0–119.75) | **Guard the twist now that H9–H10 are cut.** **→ 「如今回到圆明园的，【只有你】。」** (10 字, window 3.75 s). It keeps the parallel with H3 「回到中国的有七个」, keeps the 回国 / 回家 reveal and is true despite the 2023 visit. | screenwriter | row 11; row 13 |
| N4 | Low | K6 (146.25–149.5) | **Remove 它.** The rule is 你 / 兄弟, and 「是不是它」 needs the picture to resolve. **→ 「240万欧元。是真是假，【说不清】。」** (13 字, same width as now). It matches the stamp 「真伪仍存疑」. | screenwriter | row 13 |
| N5 | Low · spec | C7 picture | **Write the C7 counter label: 「回国 7/12」.** Without it, C6 「回家」 and C7 show different things on the same counter. In the key-frame spec, also keep the counter's 回国 row visible from D4 through H3, so H4's second row reads as new. | screenwriter (spec), art-director | brief "counter changes meaning" |
| N6 | Low | D7 stamp | **Use F12's verb.** 「国家文物局：反对公开拍卖」 → 「国家文物局：主张终止公开拍卖」. | screenwriter | brief "must avoid unverified" |
| N7 | Low · hygiene | facts.md, script.md | **(a)** Update F18's row text to 「保利艺术博物馆」 (the H4 picture label's source, per F27). **(b)** Add one ✓ line for 「港澳企业家」 (D5), or drop 港澳 (F18 says 著名企业家). **(c)** Fix the script.md Takeaway: 「五个不知在哪，一个说不清真假」 → 「四个下落不明，一个真假未定」 (F23, correction 3). The owner reads that file. **(d)** Optional: C7 stamp 「2026 · 今天」 → 「2026年10月」. | researcher (a, b), screenwriter (c, d) | row 19; brief |
| N8 | Low · carry-forward | Storyboard K1–K6 | **Keep K3–K6 inside the fountain's twelve slots** (the dragon outline lights half-way in its own slot; Q lands on the end card over the same twelve slots), so the ending stays one image and the count does not become another list. Also carried from r1: C1 second event at ≈2 s, the title gap as pure motion on bgm2's hardest drop, and D10 tags both in USD. | art-director, editor | rows 22, 47, 84, 91, 133 |

**Optional, not required:**
- Take 0.5–1.0 s back from B2's 4.5 s fire window at the retime.
- Drop 「10月」 from B1 (the stamp already shows it).

## What must not change (it works)

- **C1 on frame 0**, and C1–C7 as one sentence over hard cuts, now reading as two sales (C4) and a donation (C5).
- **A1–A7 → K1–K2**, the noon bookend.
- **B4 「你被带走了，不知去了哪」** and the folded B2.
- **The hammer set-piece** with D7's held hammer, D9 slam and D13 「买家却拒绝付款」; hammer 5 on the dragon outline.
- **Ho named at D5, D8, E2**, and E1–E4 ending on the one full pause.
- **H3–H4**, the twist and its two counter rows (only H4's wording changes, N3).
- **H5–H6, H7–H8** (the ear).
- **K2 → K3 → K4**, 十一 = 六 + 五, and K5–K6 with 「疑似」 never dropped.
- **Q** on the Juno end card.
- **Discipline:**
  - ✓ rows only, and 估算 shown as 约 / 多.
  - F8 stays off screen.
  - No 国耻 slogan, no maps with borders, silhouettes only.
  - No names for the 2009 buyer or the 1989 collector.
