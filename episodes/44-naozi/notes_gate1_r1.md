# Gate 1 notes: 你是爱因斯坦的大脑, script v1 + lines.json (49 lines, 2:41), r1. Verdict: REVISE

Scores (rubric 1–5, only the areas this gate covers): **script 4** · facts **pass** (small precision fixes in stamps, picture and counter, note 6) · visual/info/edit/motion/sound: not at this gate.

**Bottom line.** This is the strongest opening we have written for this format.
- Frame 0 has the cracking brain with 约240块 on it, and the cider box arrives at 3.5 s. There are six picture events in 10 s, and the cold reader would not swipe at 2 s or 5 s.
- The spine works. 「他停在了76岁。/ 你没有。」 is the cold reader's second curiosity spike.
- 63–117 s (death → 她没有收) is the cold reader's no-swipe stretch.

Three things keep it from a 5, and each is something the brief warned about:
1. 28–54 s reads as an Einstein résumé. It is the cold reader's biggest swipe point.
2. The genius hunt speeds up from G1 to G2 and then stays flat, and G2/G3 carry jargon.
3. The ending's 「可」 sets up a contrast its own lines don't contain.

Fixing this takes one screenwriter pass plus one sentence from the researcher. It also brings the length from 2:41 to about **2:36** without touching the best stretch.

**Inputs read:**
- SKILL.md (director), the rubric and all owner-notes rows.
- ep44: brief.md, facts.md (all rows, corrections, Risks), script.md, lines.json, lines_pace_flags.json, script.facts_flags.json, coldread_gate1.json.
- ep43 (the sister episode and the bar): lines.json, script.md (head and changelog), notes_gate1_r1.md, notes_gate1_r2.md.

**Checks I ran myself:**
- `pace.py lines.json --film-end 160.5`:
  - no line is TOO FAST;
  - waiting is 4.4 s = 3 %;
  - the CHECK at 12.25–14.75 is the named rewind/title beat;
  - the two WAITs (D2, Q) are deliberate.
- `facts.py script.md --lines lines.json`: no problems. That script only checks that each number appears somewhere in script.md, so I traced every number by hand (table below).
- Display width and the script's own floors (typed lines Needs + 0.4 s; cut-on lines C2–C5, D1, D2, R4, Q at Needs):
  - all 49 lines pass;
  - the widest is 16.0 (K2, S2, A1, A3, A4).
- Every replacement line in the notes below was width- and timing-checked the same way (all ≤ 16.0).
- Banned wording: no 偷, 藏了, 展出 or 疯 in any line.

**Previous round:** none for ep44. Against ep43 v1 at the same gate, both are a 4:
- ep44's door is stronger. A concrete image plus a number on frame 0, against ep43's paradox lines, which read as a 情感语录 until the picture explained them.
- ep44's weak stretch is structural: the life section the owner asked for has to hold on its own. ep43's was a run of names.

## The producer's questions

| Question | Answer | Evidence |
|---|---|---|
| Hook in the first 2 s? New event every ~1.5–2 s? | **Yes.** | The brain is on frame 0 with the line typed. It cracks into cubes on the first beat (0.5 s) and drops into jars at 2.0. Then three hard cuts follow (3.5 / 5.75 / 7.75), and the 2026 drawers at 9.75: six events in 10 s, ~1.7 s each. Cold read at 2 s: "No [swipe] … the concrete 约240块 saves it". At 5 s: "the cider box … I need to know why". Subtitles at 2.0–2.5 s are the reading floor, and the picture carries the faster rhythm (departure 3, accepted). |
| Counter 「你 X 岁」 as the spine; the 76 → 「你没有。」 turn? | **Yes.** | 76 on frame 0, then 99 → 106 → 117 → 147, spun back to 0 under the title, frozen at D1, split at D2, and running to 147 after that. Cold read: 「你没有。」 "pulled me back in after the biography stretch". One counter error at D2 (note 6f). |
| Each beat a result or twist, or a list of achievements? | **After death, yes. In the life section, 28–54 s is a list.** | Nearly every line from A1 on has a result or a twist: 你不在里面, 不比别人重, the cider box, 只有1块, 她没有收, the debunks. The exception is T1 (note 5). In the life section, P1 → W3 is the cold reader's #1 swipe point: "an Einstein CV montage … feels like a timeline I've seen in a hundred videos". L1 asks a question nothing answers. Z1's cause sits only in the stamp. 你 drops out: 5 of 8 lines in 28–54 s are 他 lines. Note 1. |
| Genius-hunt set-piece clear? Does it speed up? | **Clear, yes. It speeds up once, then goes flat.** | G1 10 s (full kit) → G2 6.25 s → G3 6.25 s. The cold reader's interest dips at 117–136 s: "claim, debunk, claim, debunk … predictable"; 顶叶 and "15%" "land as noise"; "why on photos?". The escalation of who debunks it (the data → another expert → the author himself) is good and should stay. Note 3. |
| Every claim on a ✓ row? Safe wording for consent, block count, 收着, no 偷? | **Pass.** | Consent is facts.md's safe line word for word (A2, A3). The block count is 约240块, which facts correction 2 allows (Harvey's own paper). T1 says 进了博物馆, the stamp says 收着, and the picture card says 藏品, never 展出. There is no 偷 anywhere. 之后23年，外界不知道你在哪 follows correction 4. 坐车 is right because Paterniti drove. The table below has every number. Seven small precision slips sit in stamps, picture and counter, not in lines (note 6). |
| Ending pays off the compass and the cold-open question? | **By design, yes. In the words, the logic breaks.** | C5 → G4b 「天才在哪？没有找到」 → F3–F4 works. K2's compass shot and words come back at F2. But F1–F2 say the researchers think like the curious boy, and F3 「可他自己说…只是有强烈的好奇心」 then says the same thing, so 「可」 has nothing to turn against. The cold reader tripped on it (#47). Note 4. |
| Length 2:41 (target ~2:30, cap 3:00): which cuts? | **About 2:35.5 after notes 1–4, around 2:48 once retimed to bars.** | Z1 −3.0 · G3 −1.5 · F1/F2 −0.75 · G2a +0.25. I would **not** take the screenwriter's cuts A5 + B1 or G4a (see ruling 4). If the track forces it, the next cut is P1 (−3.25 s → ~2:32). Don't cut anything in 60–117 s. |
| Safety | **Pass.** | The brain is a light outline. The autopsy is a closed door and a lamp switching off. 1933 has no symbols. 1939 is a letter and a pen, with no cloud. 1997 has no map, only a road, an odometer and signs. Einstein is a silhouette with no photo, and so are Harvey, Evelyn and the researchers. Logos (CIDER, mastheads) are our own. If note 1 cuts Z1, the film's only Nazi-era surface goes with it. |

## Facts table (every number and named claim in the lines)

| Line(s) | On screen | Row | Status |
|---|---|---|---|
| C1, A6 | 约240块 · 每块都编了号 | B11, B20 | Disputed → 约240块 is allowed (Witelson/Harvey 1999, Falk, Burrell). Never a bare 240 on screen (6g). |
| C2, A8–A9 | 1978 · 堪萨斯 · 记者 · 苹果酒纸箱 | B18, B19 | ✓ The cooler is only an ignored prop (correction 1). |
| C3, G1a–G1c | 1985 · 4小块 · 胶质细胞比别人多 · 4块里只有1块不一样 | G1 | ✓ as summarised by UC, Falk and Burrell. The counter lands on 106 at G1b, as flagged. |
| C4, R1–R4 | 1997 · 84岁 · 坐车横穿美国 · 6000多公里 · 孙女 · 没有收 | B22, P6 | ✓ 6000多 is 估算 from 4,000 miles. 坐车 is correct. The stamp's 保鲜盒装着你 overstates the amount (6d). |
| B1 | 刚出生 · 后脑勺大得吓人 | L1, L2 | ✓ (Maja's memoir; the stamp attributes it to 妹妹回忆). |
| K1, K2, F2 | 四五岁 · 爸爸给他看指南针 · 事物背后，一定深藏着什么 | L5 | ✓ 「给他看」, not 送 (correction 9). The line is 本片译. |
| L1 | 16岁 · 追着光跑 | L6 | ✓ (note 2 adds the sentence that gives it a result). |
| P1, P2 | 专利局 · 三级技术员 · 1905 · 4篇论文 | L7, L8 | ✓ |
| E1 | 1919 · 日全食 · 你对了 · 他红了 | L10 | ✓ The mock headline 天上的光全歪了 is 本片译 of the NYT. |
| N1 | 诺奖 · 不是因为相对论 | L11 | ✓ (stamp 1922 · 光电效应). |
| Z1 | 1933 · 再也没回德国 | L12 | ✓ The wording avoids the "left in 1933" error. Cut by note 1. |
| W1–W3 | 1939 · 怕德国先造出原子弹 · 建议美国也造 · 一生最大的错误 | L13 | ✓ Keeps the "some justification" half. 也造 = his own "recommending that atom bombs be made". |
| S1, S2 | 1955 · 医生劝他手术 · 我做完了我的那份，该走了 | B2 | ✓ caution. The stamp names 据秘书杜卡斯回忆, as the row requires. |
| D1 | 76岁 | B1 | ✓ (stamp 凌晨1点多). |
| A1–A3 | 几小时后 · 哈维 · 事先没有家属同意 · 事后儿子同意 · 只许用于科学 | B4, B5, B6 | ✓ The disputed hour and consent use the rows' safe wording exactly. |
| A4 | 骨灰被悄悄撒掉 · 你不在里面 | B7, B8 | ✓ The stamp's 「当天」 is attached to the wrong event (6c). |
| A5 | 约1.2公斤 · 不比别人重 | B10 | ✓ 不比别人重, not 更轻. |
| A7 | 之后23年 · 外界不知道你在哪 | B18 (估算), correction 4 | ✓ The picture's 「1960」 drive is wrong (6a). |
| G2a, G2b | 1999 · 顶叶 · 宽了15% · 同年就有专家说得不出结论 | G2 | ✓ (Witelson; Stern, BU Bridge, Jul 1999). |
| G3a, G3b | 2012 · 照片上 · 多了一道褶 · 作者自己说只是假设 | G3, B12 | ✓ |
| G4a, G4b | 至少18个研究者 · 没有找到可信的证据 | G4 | ✓ Not 「证明很普通」. Falk's verb is "received", so 拿到过你 is the exact one (6e). |
| T1 | 147岁 · 有一部分进了博物馆 | §D, B26, B27 | ✓ (收着 / 藏品, display UNVERIFIED and not claimed). |
| F3, F4 | 我没有特别的天赋，我只是有强烈的好奇心 | L16 | ✓ caution. Caption 「——爱因斯坦」, no date, stamp 柏林纪念牌. |
| Counter | 76 · 99 · 106 · 117 · 120 · 133 · 136 · 147 and the life ages | §D | 估算 ✓ (except D2's 77, 6f). |

## Notes

| # | Sev | Where | Note | Route to | Owner note it relates to |
|---|---|---|---|---|---|
| 1 | **High** | Life run 25.25–54.5 (L1, P1, P2, E1, N1, Z1, W1–W3) | **It reads as a CV, which is what the brief warned about and the cold reader's #1 swipe point** ("five years in 26 seconds … I'm getting his résumé"). Turn it from a list into a chain in which each line is a cause, a result or a twist, and give 你 its voice back. **(a) Cut Z1** (−3.0 s). Its line has no result, its cause (纳粹上台) lives only in the stamp, it doesn't touch the brain's thread, and it is the film's only Nazi-era surface. W1's 「怕德国先造出原子弹」 still carries the stakes. **(b) Make P2 the result of L1:** 「你想了10年，答案叫【相对论】。」 (13.1 wide, 11 字, 3.25 s, same slot). 4篇论文 moves to stamp line 2 and to the picture (four sheets drop, the relativity sheet lights). The counter ticking 16 → 26 between L1 and P2 shows the ten years on screen. This gives E1's 「你对了」 something to be right about (cold read: "right about what?") and sets up N1. It rests on note 2. **(c) N1 in 你's voice:** 「他拿诺奖，不是因为你的【相对论】。」 (15.0 wide, 13 字, 3.5 s, same slot). **Result:** 追光? → ten years → the answer → proven → famous → the prize skips it → fear → signature → regret. **Fallback** if note 2 can't confirm the sentence: keep L1 and P2 as written, and still make (a) and (c). | screenwriter | brief "every beat an event with a result" · row 109 "not a list of facts" · row 12 |
| 2 | Med | facts.md L6 | **Add the half sentence that gives the light-beam question its result.** In the same *Autobiographical Notes* passage that L6 already quotes (Norton course copy, the sentence before "a paradox upon which I had already hit at the age of sixteen"), Einstein writes: "After ten years of reflection such a principle resulted from a paradox upon which I had already hit at the age of sixteen". Quote it in full in L6, say what "such a principle" refers to in context (the principle of special relativity) and mark it ✓ or not. If the copy doesn't contain it, say so, and the screenwriter uses note 1's fallback. | researcher | row 32 "never state a result the source doesn't" |
| 3 | Med | Hunt G2a–G3b (117.25–129.75) | **Remove the jargon and make the third rep the fastest.** **(a) G2a** → 「你管空间想象的那块，【宽了15%】！」 (14.65 wide, 12 字, 3.25 s). facts.md G2 already approves this wording. 1999 goes to the stamp and the counter, and 顶叶 to the picture label. Cold read: 顶叶 "is jargon … the number lands as noise". **(b) G3** as two **cut-on** lines: G3a 「2012年：你【多了一道褶】！」 (11.2 wide, 8 字, 2.25 s) and G3b unchanged (2.5 s). G3 becomes 4.75 s (was 6.25). Dropping 照片上 also removes the cold read's "why on photos?". The photo snapping in (A6's flash paying off) says it in the picture. The rhythm becomes G1 10 → G2 6.5 → G3 4.75 → the G4 pull-back, so the predictability turns into the joke. **Keep** G3b's wording: the author debunking his own find is the top of the escalation. | screenwriter | brief "one repeated set-piece … speeds up" · row 79 "no jargon … say what it means" · row 13 |
| 4 | Med | Ending F1–F4 (140.25–154.5) | **「可」 turns against nothing.** F1–F2 say the researchers think like the curious boy. F3–F4 say he only had curiosity, which is the same thing. The cold reader: "That isn't a contrast … at speed the '可' felt wrong". **Default fix:** make F1–F2 the belief that genius is hidden in the tissue, in the compass's words, so 「可」 becomes a real turn. F1 「几十年来，研究你的人都相信：」 (14.0 wide, 12 字, 3.25 s). F2 「你身上，一定【深藏着什么】。」 (12.0 wide, 10 字, 3.0 s), still on K2's compass shot. F3–F4 stay as written. **Alternative,** if you'd rather keep "they were like the boy": put the quote first without 可, 「他自己说：我没有【特别的天赋】，」 / F4, then end on 「研究你的人，也和小时候的你一样：」 (16.0) / F2 unchanged. This also takes the familiar quote off the last line before Q (cold read: "I've heard that quote in 鸡汤 videos … I might swipe before #49"). Either way, K2 gave the compass thought to 你 (你想), so if the child is named it is 小时候的**你**, not 他. | screenwriter | row 13 "each subtitle must make sense on first read" · rubric 1 "the ending … lands" |
| 5 | Med–Low | T1 (136.75) | **T1 is a status line. Make it the irony A4 set up.** A4 says the ashes were scattered and 你不在里面, and its stamp says 不想被人朝拜. The researcher flagged this as the film's "strong irony", but the line never pays it off. Use 「他没有坟墓，你的切片在【博物馆】。」 (15.0 wide, 13 字, 3.5 s, same slot). It rests on B8 + B26/B27, and 切片 keeps the claim to part of you. 147 stays on the counter and in the stamp, where it reads as the clock it has been since 0:00. In a line, the cold reader stopped to do the arithmetic. Keep the card 「藏品」, not 「展出」. | screenwriter | brief "every beat … a result or a twist" · row 12 |
| 6 | Low | Stamps, picture, counter | **Seven precision fixes (none in a line except e):** **(a) A7 picture:** drop the 「1960」 label on the westward drive. In 1960 Harvey left the hospital and moved to Freehold, NJ (B16, Levy), and the move to Kansas has no ✓ date (B17: 1972 is caution). Show the drive west undated. **(b) A6 stamp** 「1955 · 费城」: B13 gives the place but no year, and the work took months. Use 「— 费城 · 宾大实验室」. **(c) A4:** 「当天」 belongs to the cremation (B7), not the scattering (B8 has no date). Use 「— 1955.4.18 · 当天火化 / 骨灰秘密撒掉：不想被人朝拜」. Change the picture from "dawn by water": water stands in for the disputed river (B8, don't place it), and dawn comes before the autopsy. Show ashes lifting into an unplaced sky. **(d) R1 stamp line 3** 「保鲜盒装着你」 → 「保鲜盒里：约十分之一的你」 (B22, Paterniti: "about a tenth of the brain"). **(e) G4a** 「研究过你」 → 「至少【18个研究者】，拿到过你。」 (13.1 wide, same slot). This is Falk's verb ("received"; only 6 papers resulted), and it echoes G1a's 拿到了你4小块. **(f) Counter at D2:** 「你 76 → 77…」 contradicts A1–A6, which show 76; he would turn 77 only on 14 Mar 1956. At D2 the 你 counter unfreezes (pulse, or a date line under it starts running) but holds 76 until A7 rolls 76 → 99. **(g) C1 tally:** never a bare 「240」 (B11 is disputed). Let the count be the cubes' own sticker numbers, or end it on 「约240」. | screenwriter | row 32 · row 121 "every prop must belong to its era" · brief "every stamp maps to a row" |

**Length after notes 1–6:** 160.5 − 3.0 (Z1) + 0.25 (G2a) − 1.5 (G3) − 0.25 (F1) − 0.5 (F2) ≈ **155.5 s (2:35.5)**. An ep43-sized retime (+8 %) gives about **2:48**, under the 3:00 cap with room to spare.
- Spend any extra bar time on D2, R4, G4b, F2 and the end card, as the script already plans.
- If the owner insists on 2:30, the next cut is P1 (the clerk moves to the P2 stamp).

## Rulings on the screenwriter's departures

| # | Departure | Ruling |
|---|---|---|
| 1 | Open on 约240块; end the cold open on the question, with the museum later | **Accept.** The removal has to stay behind a closed door, and the cubes are the fastest true image. Correction 7 rules out 「展出」 as a present-day hook. |
| 2 | C5 is a question | **Accept.** ep43's N2 is the precedent. It is the one question the film answers (G4b, F3–F4), and it gives the cold open's four fates a motive. The cold reader held through 15 s on it. |
| 3 | Subtitles every 2.0–2.5 s; the picture carries the 1.5–2 s rhythm | **Accept.** Shorter fragments would break row 13. |
| 4 | Cut list A5 + B1, G4a, P1 | **Partly.** **Reject A5 + B1:** A5 is the hunt's first failed guess and one of the cold reader's surprises that stuck ("I assumed a genius's brain would be bigger"). B1 is the first beat after the title, exactly where ep41 lost its viewers. **Reject G4a:** 18 gives the verdict its weight, and a stamp is too small to carry it. **Take Z1 instead** (note 1). P1 is the next cut. |
| 5 | 「之后23年，外界不知道你在哪」, not 藏了23年 | **Accept.** It follows correction 4, and 藏 would imply hiding he didn't do in 1955. |
| 6 | 坐车, not 开车 | **Accept.** Paterniti rented the car and drove. |
| 7 | Title #1 「你是爱因斯坦的大脑」 | See "For the owner" below. |

## For the owner (taste calls at the gate-1 touchpoint, not notes)

**Title.** My ranking:
1. **你是爱因斯坦的大脑.**
   - It is the right hinge after C5: the card says who 你 is, then the rewind.
   - It can't overclaim, and it pays off at D2. The cold reader would click it.
   - **Against:** the brief rules out 「假如你是」 as the reference's signature, and this is that shape minus 假如. The owner has to OK the shape. The cold reader also warns it could read as a personality test or an AI "imagine you are" clip.
2. **爱因斯坦的大脑去哪了.**
   - The clickiest, and the brief's own direction. The after-death half answers it.
   - **Against:** on the card it is a second question 2 s after C5, followed by 46 s of his life.
   - The film's answer to "where now" is partial: 一部分 in museums, and the rest's 2026 status is unchecked. Expect 「剩下的呢？」 comments.

Drop #3 (it doesn't say whose brain) and #4 (it sounds like a children's book, and 漂流 implies chance). The cold reader's idea 「…在苹果酒纸箱里躺了23年」 can't be used: it is over 10 字, and it is false. The 23 years were "unknown to the public", and the box is only where Levy found the jars in 1978 (B18, B19).

**End-card question.**
- **「你觉得，天才是【天生的】吗？」** (the screenwriter's pick) ties straight to F3–F4.
- **「如果是你，愿意把大脑留给科学吗？」** (16.0 wide) is the other option. The cold reader would not answer the first ("feels like a school essay prompt") and would comment on consent instead.
- 「如果是你」 also marks the switch of 你 from the brain to the viewer, which tripped the cold reader at #49.
- My lean is the second, on the cold-read evidence. It is the owner's call; both are ready.

## Carry-forward (non-blocking; for the storyboard and build)
1. **Frame 0 (art director).** Four numbers compete in the first 2 s: 约240 in the line, the tally, 1955 in the stamp and 76 on the counter. Let the line and the cracking brain lead. The count lives on the cubes' stickers (6g). The stamp and counter come in small (rubric 3, "several numbers compete"; row 47).
2. **The picture must teach the 你/他 rule at K2.** The glow flares on every 你 line and dims on 他 lines. With lines only, the cold reader didn't get the rule until 0:35 (#12).
3. **Title card, 12.25–14.75: all motion.** The rewind and the spinning counter fill it, and it lands on the first drop (row 133). The cold read calls it the riskiest 2.5 s of the first 15.
4. **G1b label 「胶质细胞：给神经细胞打下手」 big and on screen with the line** (row 76 sizes). The cold reader drew a blank on 胶质细胞.
5. **The hunt speeds up in the picture too:** fewer steps each rep, as planned. I'll check it at gate 2b.
6. **If the owner adds a voice (brief: TBD),** stamps that carry story must be voiced or moved into lines (row 127): A4's 不想被人朝拜, N1's 光电效应, A9's 大概还要一年.

## What must not change (it works)

**Story and lines**
- **C1 on frame 0**, with 约240块 and the cubes cracking on the first beat.
- **C1–C4 as one sentence over three hard cuts.** Each fate is paid off on the same shot (A6, A9, G1b, R2), and there are six picture events in 10 s.
- **C5 「天才，藏在你【哪一块】？」**, answered at G4b.
- **The rewind title**, with the counter spinning 147 → 0 into the newborn's head.
- **The counter as the spine.** 76 shows on frame 0 and then jumps. It freezes at D1 and splits at D2 (this episode's new device). It never stops after that.
- **D1/D2 「他停在了【76岁】。」 / 「你没有。」** and the film's one full pause.
- **The 你/他 rule** (你 thinks, 他 acts) and **E1 「【你对了】，【他红了】」**.
- **B1 → A5:** the big head at birth set against 不比别人重, the first failed guess.
- **K1/K2 compass set-up**, with 「给他看」.
- **W1–W3**, keeping the 「怕德国先造出」 half of the quote.
- **S1/S2**, attributed to Dukas in the stamp.
- **A1–A4:** 几小时后, the consent pair exactly as facts.md gives it, and 「你不在里面」.
- **A7 「之后23年，外界不知道你在哪」** (not 藏).
- **A8/A9 the cider box**, with the red cooler only as an ignored prop.
- **G1a–G1c in full**, with 「找到了！」 then 「存疑」.
- **R1–R4 untouched.** It is the cold reader's "surprise that stuck": 坐车, 84岁, 6000多公里, 她【没有收】.
- **The escalation of who debunks it:** the data → another expert → the author himself.
- **G4b 「没有找到可信的证据」** (never 证明很普通).
- **T1's 收着 / 藏品**, never 展出.
- **F3/F4, the plaque quote**, captioned 「——爱因斯坦」 with no date.
- **The end card:** a one-word-answer question on the Juno end card, 「关注 Juno · 一起看懂世界」, and never 出品.

**Discipline**
- Only ✓ rows (or 估算 shown as 约/多).
- No 偷 anywhere.
- Safety: the closed door, no symbols, no cloud, no map, silhouettes only, and our own logos.
- Lines ≤ 16 wide, the reading floors met, and waiting at 3 %.
