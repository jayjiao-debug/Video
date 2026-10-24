# Gate 1 notes: 假如你是清明上河图, script v2 + lines.json (48 lines), r2. Verdict: APPROVE

Scores (rubric 1–5, only the areas this gate covers): **script 5** (r1: 4) · facts **pass** · visual/info/edit/motion/sound: not at this gate.

**Bottom line.** All 10 round-1 notes landed. I accept all five places where the screenwriter departed from my notes; each change improves on my wording. Every number in the lines and the stamps traces to a ✓ row (or to an 估算 row shown as 约/多). The 61–96 s run no longer reads as a list: each line is now the cause or the consequence of the one before it. The 冯保 beat was the cold reader's most likely swipe point, and it is now the best new line in the film. Nothing here would make the owner send the script back. The four carry-forward notes below are for the storyboard and the build. None of them needs another script round.

**Inputs read:** SKILL.md (director), rubric, all owner-notes rows, brief.md, notes_gate1_r1.md, script.md v2 (changelog and "Where I differ"), lines.json, lines_pace_flags.json, script.facts_flags.json, facts.md (all rows, including Pass 2 and Pass 3: C6, C9, C11, C20, C24b, C25, C27b, C31, K7), coldread_gate1.json (r1; there is no v2 cold read yet), style/lookA_hook.png and lookA_key.png (the owner's pick), crew_log.md.

**Checks I ran myself:**
- `pace.py lines.json --film-end 170`: no line is TOO FAST, waiting is 16.0 s = 9 % (target ≤ 12 %), and the only CHECK is the title card at 23.2–26.2 s, which is the named beat. This matches the screenwriter's numbers.
- `facts.py script.md --lines lines.json`: no problems. It only checks that each number appears somewhere in script.md, so I traced every number by hand (table below).
- Display width of all 48 lines: the widest is 16.0 (N1, BO, M1, F2, P2, D2, E7). lines.json matches the script's line table on all 48 rows: same text, same start and end times.
- Stamp line 2 (the script's own limit is ≤ 14 字): M3 and P1 are 15 if brackets count (carry-forward 3).
- Typed lines against the script's own retiming floor ("Needs + 0.4 s"): M2 and Q2 are 0.15 s under it and D1 is 0.1 s under. pace.py passes all three, and M2 stays on screen through M3 as stacked line 1 (carry-forward 4).

## Did each round-1 note land?

| # | r1 note | v2 | Landed? |
|---|---|---|---|
| 1 | 冯保 payoff (High) | F1 「1578年，太监冯保把你【偷】出了宫。」 escalates T2's 带出 into 偷. F2 「画你的人没留名，偷你的倒【题了字】。」 calls back to Z1, and its picture is an insert that implies no order (C20 Pass 2). | **Yes.** It was the most likely swipe point and is now the run's turning point. |
| 2 | 陆完 → 严嵩 link | M1 / M2 「几经辗转，你落到权臣【严嵩】手里，」 / M3. This is C16's own 辗转. | **Yes.** Same running time. |
| 3 | Names; seal meaning | 杨准 moves to the W3 stamp, 毕沅 to the Q1 stamp, and Q2 becomes 「嘉庆盖了五方大印：你归【皇家】了。」 | **Yes.** In 58–100 s, new names drop from six to four (陆完, 严嵩, 冯保, 嘉庆), and 溥仪 was already teased at 11 s. Q2 → P1 now lands as irony: the royal house itself takes you out. |
| 4 | 4 out vs 3 found | Researcher: the three came from the same 《佚目》 batch, but no source maps them to the 1923 list entries (C31). Screenwriter: Y2 now gives no count (「好几卷“你”」), Y3 is unchanged, and script.md says outright that P3 → Y3 is not a callback. The P3 picture shows that one of the two 张择端 rolls is you, so nobody reads "both 张择端 scrolls were fakes". | **Yes.** It no longer invites the "where's the fourth?" question. |
| 5 | Handover compression | BO 「你进了北宋【皇宫】，靖康后流入【金国】。」, with 进 and 出 on consecutive beats. Saves 3.0 s. M3 → F1 stays on one shot. | **Yes.** |
| 6 | 「抄你」 | C1 is cut as a line. The 抄 flash is now the wall of copies labelled 「约一百卷 · 只有一卷是你」 (K1, K4), with the stamp 「约百卷仿本（余辉估）」. M3's red word is moved off 抄进. | **Yes.** See the ruling on 抄 below. |
| 7 | Donkey detour | D1 「1973年重裱，揭掉了一头【假驴】。」 / D2 「原来，明朝人把草棚看成了【驴耳朵】。」. Climax → E1 is now 10 s (it was 17.5). | **Yes.** 假驴 ties the gag to the fakes thread instead of pulling away from it. |
| 8 | 代价 subject; Q | E7 「安全的代价：展一次静养【三年以上】。」. Q 「要是排【五小时】看两分钟，你去吗？」 has one 你 and is a hypothetical, so the 五/两 rounding is not a claim. | **Yes.** |
| 9 | Frame-0 name; 1922 | The frame-0 stamp is 「— 《清明上河图》」 with 张择端 still held back. The P2 stamp is 「25天内 · 4卷（清宫档案）」. 1922 appears nowhere on screen. | **Yes.** |
| 10 | V2 picture; small rows | V2 is kept inside C27 (headlights sweep away, no crates). C24b is added and used in the P1 stamp. C6 Pass 2 settles 藏者宜宝之 as 张著's own words. C27b (the 1945 小白楼 looting) arrived ✓ after the script was written (see carry-forward 2). | **Yes.** |

## Rulings on the screenwriter's five departures

| # | Departure | Ruling |
|---|---|---|
| 1 | W3 keeps 后来 (「后来买下你的文人，【记下】了调包。」), and M2 opens with 几经辗转 so two lines in 7 s don't both start with 后来. | **Accept.** Without 后来, the 文人 can be read as the 权贵 from the line before. That was the confusion r2 of gate 2a fixed. The 几经辗转 swap is also better than my 后来你辗转. |
| 2 | BO 「你进了北宋皇宫」 instead of 「你先进北宋皇宫」 | **Accept.** 先进 can misparse as "advanced". Same width. |
| 3 | P3 reworded to 「清单上，其中两卷都写着【张择端】。」 (not routed) | **Accept.** It answers the cold reader's "does the real one count as 写着张择端?" without a new fact: the label belongs to the list (C24, C25), and the ledger is already on screen in P2. |
| 4 | Y2 「好几卷“你”」 rather than 好几卷清明上河图 | **Accept.** The full name makes it 17 wide, and the quoted 你 sets up Y4 「才是你」. 好几 for three is fair usage. It is a cold-read check item if the producer runs one, not a note. |
| 5 | K7 (乾隆's catalogued fake) not used; offered as a spare for Q2 | **Accept.** It would spend the Y3/Y4 payoff 30 s early, add 乾隆 and a catalogue idea to the run we just lightened, and lead viewers into the C31 mapping we may not show. Keep it out. |

**On 抄 (no note).** 抄 means confiscation three times in 69–89 s (M1 被抄家, M3 被抄进, Q1 被抄), so some viewers will read E3's 抄你 as 抄家. That is fine: either reading is true. Confiscation is how you entered the palace twice, and the picture shows the wall of copies, so the line carries a double meaning rather than a contradiction. Moving M3's red word off 抄进 was the right small fix.

## Facts: what changed since r1 (everything else in the r1 table still passes)

| Line / stamp | On screen | Row | Ruling |
|---|---|---|---|
| T1, W1–W2 stamps; counter | 元 · 1351年前 · 「以似本易去」 · 200多 | C9 (revised), C11 | ✓ No 至正 and no single year on the swap. 200多 fits the Palace Museum's 元代后期 (C9). |
| W3 stamp | 1351 · 江西泰和 / 文人杨准买下，次年题跋 | C11 | ✓ (bought 1351 and taken home that year; colophon 1352). |
| F1, T2 stamp | 1578 · 太监冯保 · 偷 | C20 | ✓ 故宫VR dates the removal to 万历六年（1578）, and 故宫纪录片 supplies the verb 偷盗. Both are Palace Museum texts. The researcher's caution (the VR date may rest on the colophon date) is an inference, and F2 and its picture make no claim about order. **Pass.** Fallback if a fact-check ever challenges it: 「万历年间，太监冯保把你【偷】出了宫。」 (16 wide), which is the 纪录片's own phrasing. |
| F2 | 画你的人没留名 · 偷你的倒题了字 | C2, C20, C7 | ✓ |
| P1 stamp | 以赏给弟弟溥杰为名 | C24b | ✓ |
| P2–P3 | 一个月内 · 四卷 · 清单上两卷写着张择端 · 25天内 | C25 | ✓ |
| Y2–Y3 | 好几卷 · 标着真迹的两卷都是仿的 | C30, K5, C31 | ✓ The mapping to the 1923 entries is not stated (UNVERIFIED, so correctly left out). |
| E3 抄 frame | 约一百卷 · 只有一卷是你 / 约百卷仿本（余辉估） | K1, K4 | ✓ Attributed as 余辉's estimate. |
| E7 | 安全的代价：展一次静养三年以上 | O9 | ✓ (as reported, 北京晚报). |
| Q | 五小时 / 两分钟 | P3 | ✓ A hypothetical at the top of the reported ranges, not a claim. |
| V2–V3 | 1945 · 伪满覆灭 · 溥仪出逃 · 下落不明 | C27, C28 (C27b now available) | ✓ |

Political wording: 伪 is used every time, 伪满 is never an era chip (民国 is), 溥仪 appears only as Palace Museum verbs (偷运) and is never drawn as a likeness, and there is no 1945 place or Soviet claim. ✓

## The 61–96 s run, re-read as a viewer (58.75–99.75)

| Time | Line | What I felt |
|---|---|---|
| 58.75 W1 | 宫里的裱画匠，拿【假画】换走了你。 | T1 pays off on the same shot. Clear. |
| 62.25 W2 | 真的你，被偷偷卖给了一个【权贵】。 | Clear. 权贵 stays vague, but the stamp attributes the account to 杨准. |
| 65.75 W3 | 后来买下你的文人，【记下】了调包。 | 后来 separates him from the 权贵. The "you carry your own diary" idea lands with the replay drawn inside his columns. |
| 69.25 M1 | 陆完被抄家前，把你藏进了【朋友家】。 | The run's only unknown name. The chip and stamp carry the jump from 元 to 明. Softest 10 s of the run, but it pays off at E3 藏你. |
| 72.75 M2 | 几经辗转，你落到权臣【严嵩】手里， | The missing link from r1 is there. 严嵩 is a villain people know. |
| 76.00 M3 | 严家倒台，你被抄进了【皇宫】。 | Cause, then effect, then the tally lights 进. |
| 79.25 F1 | 1578年，太监冯保把你【偷】出了宫。 | The teaser is paid off and escalated. This is where the run turns. |
| 82.50 F2 | 画你的人没留名，偷你的倒【题了字】。 | The best new line in v2: a joke with an edge, calling back to Z1 from 45 s earlier. r1's swipe point is now a reason to stay. |
| 86.00 Q1 | 清朝，主人家被抄，你【又进了宫】。 | The one line that repeats a shape (M3, 10 s earlier). It holds up because it is short, names the era, lights a tally mark and hands off to Q2. |
| 89.25 Q2 | 嘉庆盖了五方大印：你归【皇家】了。 | The seals now mean something. |
| 92.50 P1 | 1923年，溥仪把你【偷运】出了宫。 | Lands as irony right after 你归皇家了. T3 is paid off. |
| 95.75 P2 | 一个月内，四卷【清明上河图】出了宫。 | A curiosity spike ("four?"), with a bar of rest after it as planned. |

**Verdict on the run:** it is still a chronology, but it is a chain now, not a list. A payoff or a turn arrives every 3 lines (58–69 s the swap and the diary, 69–79 s hide → 辗转 → confiscated, 79–86 s the theft and the joke, 86–96 s sealed → smuggled out by the court itself). No note. The one thing that could make this stretch feel samey again is picture repetition (the crest carry shows up five times in 41 s), which is a gate-2b matter (carry-forward 4).

## Comparison with r1

- **Script: v2 is better.**
  - The worst stretch (58–100 s) gained a payoff, a joke and an irony, and lost three names.
  - The climax-to-moral detour went from 17.5 s to 10 s.
  - The ending has no loose logic left: E7 names what the price buys, and Q has one 你.
  - The length went from 3:00 to 2:50, with nothing of value cut.
  - Rubric 5 anchors met:
    - the paradox plus 九百年 on frame 0, and a concrete fate with a year stamp by 8.75 s;
    - every beat adds something;
    - one takeaway (the r1 cold read already matched it);
    - an end-card question with a one-word answer.
- **Facts: same pass, tighter.** The swap is no longer dated to 至正, 1922 is gone from the stamps, 溥杰 is identified, and the 张著 punctuation is settled.

## Carry-forward notes (non-blocking; no script re-gate)

| # | Sev | Where | Note | Route to | Owner note it relates to |
|---|---|---|---|---|---|
| 1 | Med | Style frames → storyboard: T1, W1–W2 | **The gate-2a frames show text the facts have since superseded.** Key frame: 「元 · 至正年间」, 「杨准：1351年买下你的文人」, 「你约240岁」 and the old two-line subtitle. Hook frame: 「元 · 宫中」. Don't copy them into the storyboard or the build. Use v2: T1 stamp 「— 元 · 1351年前」 (line 1 only on teaser cuts); W1–W2 stamp 「— 元 · 1351年前 / 裱画匠调包（杨准记）/ 杨准原话："以似本易去"」; counter **200多** (never 240, never 至正); every subtitle verbatim from lines.json. | art-director (storyboard), animator | row 32 "never state a result the source doesn't" · brief "every stamp maps to a row" |
| 2 | Low (option) | V2–V3 picture (107–112.75) | **C27b (✓) now allows a picture for 「混乱中」.** After the headlights leave: the 小白楼 doors stand open, the room is being emptied, scrolls lie on the floor, and whole figures (no faces) carry armfuls out into the dark. The camera searches among them for your glow and finds none, then the 1-s pause. Limits from C27b: no prying tools, no tearing, and never your glow in a looter's hands or in the pile (C28). Keep the stamp 「— 1945年8月 / 伪满覆灭，下落不明」 and keep the lines as they are. The v2 headlights-only picture also passes, so this is the art director's call, and I'll look at it at gate 2b. | art-director | ep41 "every scene's cause and effect must be stated" |
| 3 | Trivial | Stamps M3, P1 | **Line 2 is 15 字 against the script's own ≤ 14** (if brackets count). Use 「严家被抄入宫（故宫博物院）」 and 「以赏弟弟溥杰为名（清宫档案）」. Fix at build time. | animator (build) | — |
| 4 | Trivial / gate 2b | Retiming; the crest set | (a) **Retiming floor.** M2, Q2 and D1 sit 0.1–0.15 s under the script's own retiming floor (Needs + 0.4 s for typed lines). When retiming to bars, give these three lines the extra fraction; never take time from them. Q2 also has to fit five seal slams. (b) **Varied hand-overs.** The crest hand-over recurs nine times. The fixed direction (进 leftward toward the palace, 出 rightward into the dark) is right and should stay. But the moves into and out of the crest must differ each time (push through the silk, painted bridge → stage bridge match, the M3 → F1 sky change, the Q2 roofs closing). I'll check this at gate 2b. | editor (a), art-director (b) | row 104 reading time · row 86 "every hand-over a different, motivated move" · row 116 fixed layout |

**If the producer runs a v2 cold read** (optional, not a condition of approval): check (1) whether Y2's 「“你”」 reads cleanly, (2) whether E3's 抄你 reads as copy, confiscation or both (any of them works), and (3) whether 58–100 s still feels like a list.

## Title pick

**1 · 假如你是清明上河图** (same as r1).
- It is the title shape of the format the owner asked us to replicate, and the reference with that shape earned 5.5万 likes and 9,360 saves.
- It answers the film's biggest comprehension risk ("who is 你?") the moment it is seen, and it cannot overclaim.
- On the in-film title card it lands on the drop as a reveal straight after N2's question.
- **Against:** the cold reader finds "假如你是X" template-like.

**Runner-up · 谁偷走过清明上河图.** The clickiest. It is honest: three thefts, each on a ✓ row and in the Palace Museum's own verbs (C9 盗出, C20 偷盗, C24 偷运). But it is narrower than the film (hiding, the find, 难见). As the title card it would put a second, different question 3 s after N2, and on the end card it would not match the closing question about the queue. It is the owner's call if he wants more click.

**Last · 清明上河图，为什么难见.** Fully paid off and viewer-relevant. But it promises the film's least dramatic answer (a conservation rule) and hides the heist life. On the title card it would repeat N2's 「你，为什么这么难见？」 almost word for word 3 s later.

## What must not change (it works)

**Story and lines**
- Everything on the r1 list: H1/H2 and their E4/E6 payoffs; T1–T4 as one sentence over four hard cuts, each paid off on the same shot; N1/N2 and the 撤展回库 / 下次展出：未公布 card; the title on the hardest drop; S1 with the on-screen tally; Z1–Z5; W1–W2; P2; the V1–V3 discipline and the 1-s pause; Y1, Y3, Y4; E1 → E3; E5/E6; the end-card format.
- New in v2, keep:
  - F1 (偷 escalating T2's 带出) and **F2** (画你的人没留名，偷你的倒题了字), with F2's picture as an insert that implies no order.
  - M1–M3 with 几经辗转.
  - W3 with 后来.
  - **Q2 → P1** (你归皇家了 → the court's own emperor smuggles you out).
  - BO in one line, with 进 then 出 on consecutive beats.
  - P3's 清单上.
  - Y2's 好几卷“你” with no count.
  - E3's 抄 frame, the wall of copies labelled 约一百卷 · 只有一卷是你.
  - D1–D2 in two lines, tied to the fakes by 假驴.
  - E7 「安全的代价」.
  - Q as a would-you with one 你.
  - The frame-0 stamp 「— 《清明上河图》」, with 张择端 held back until Z3.
  - K7 kept out.

**Picture logic (look A)**
- You are the only glowing thing on screen, and you rim-light whoever holds you.
- Fixed screen direction: 进 is leftward toward the far-bank palace, 出 is rightward into the dark.
- The mood follows the deal: official entries at dusk or in daylight, secret exits at night with the lanterns out.
- Per era, only the sky, the hats, the boat and the far-bank palace change.
- Inserts are entered through the silk.

**Discipline**
- Only ✓ rows. No 至正 or single year on the swap. 1923 everywhere and no 1922 on screen. Ages shown as 约/多 and never 250. 伪 every time.
- No likeness of 溥仪. Whole figures only, no hands from off-screen. Deaths neither shown nor mentioned.
- Lines ≤ 16 wide, reading budget met, waiting at 9 %.
