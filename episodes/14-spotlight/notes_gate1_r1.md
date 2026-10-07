# Gate 1 notes: 你以为大家都在看你 script v1 / lines.json — verdict: REVISE (4 exact line swaps the producer applies directly + 3 picture notes for the storyboard; no round 2 needed if the swaps are applied verbatim)

Scores (rubric 1–5, only the areas this gate covers): script **4** (5 once notes 1–4 are in) · info **4** (planned; see notes 5–6) · visual – · edit – · motion – · sound –

No cold-read was provided for this round, so this judgement is the director's alone. There is no previous round. The two ep14 films the owner rejected today (坚忍号 too cold; 切尔诺贝利 "not relatable") are the comparison I judged against.

**Relatability and the first 3 s (owner row 45, newest; rows 22, 35, 36). This is the test that matters most at this gate.**
- **Topic:** it passes, and clearly. The film is about the viewer's own feeling (糗, 社死, 半夜回放, 聊砸了). The Cornell shirt is only the illustration. That is what the owner asked for after Chernobyl. No industrial or military history.
- **0–3.5 s:** L1 has the viewer's own moment and the topic itself (全班好像都看见了) with the subtitle on frame 0. The door bang and the spotlight slam land on the first beat. A 20-year-old can say "这说的就是我" from this line.
- **Two things weaken it, and both are fixed below:**
  - L1 has no 你, so the line reads as someone else's anecdote until L3 (note 1).
  - The planned frame 0 (a seminar table with questionnaires) does not read as 教室 on a phone (note 5).
- **The rest of the opening:**
  - L2 is the emotional turn (脸烧一整天 → 半夜回放), the strongest meme-able line in the film.
  - L3 gives a number-shaped guess (一半) by 6.6 s.
  - L4 asks the question the plaque answers.
  - L5–L6 give "it's not you, it's X" and what the viewer gets.
  - All pass.

**Pace.**
- **v1:** `pace.py` gives 0.0 s waiting (0 %), no TOO FAST, and one CHECK: the planned 2.8 s plaque gap at 12.4–15.2 s, which is on the hardest drop.
- **With the four swaps applied:** I re-ran it. Still 0 % waiting, no TOO FAST, and the same single CHECK.
- **Length:** body 100.6 s + a ≤ 4 s card ≈ 104.6 s, inside the brief's 90–105.
- **Sources:** `facts.py` finds no banned source.

**Fact trace (lines.json order).**
- L1–L4: the viewer's moment. L3's 一半 is the viewer's guess and mirrors #7 (46 %); it is not stated as data ✓.
- L5 #1 ✓ · L6 #13 (the hedge 也许) ✓ · L7 #1, #2 ✓ (the why) · L8 #3 ✓ (歌星头像 = "depicting … image"; no name) · L9 #3 (pretest majority) ✓ · L10 #4 ✓ · L11 #5 ✓ ("一小会儿", no seconds) · L12 #6 ✓
- L13–L14 #7 46 % / 23 % ✓, and the ×2 bracket = "exactly twice" ✓ · L15–L17 #9 48 % / 8 % ✓, ×6 = "six times" ✓, "不到十分之一" ✓ · L18 #9, #2 ✓
- L19 #14 ✓ · L20 #18 ✓ (see note 2) · L21 #18 51.8 → 52 ✓ (see note 3 for the framing) · L22 #18 69.4 → 69 ✓ · L23 #17 ✓ (the row's own wording)
- L24–L26 #19 ✓ (no Likert numbers, no %) · L27 #20 ✓ in substance (see note 4) · L28 #21 ✓ (5岁)
- L29–L31: metaphor and takeaway. "比你以为的" / "没你想的那么" keep clear of the banned "没人在看你" ✓.
- **Not used anywhere:**
  - the UNVERIFIED rows #22 and #23
  - the unsourced "how fast people forget" (#24)
  - the shaky 54 (#16) and the control-group figure readings (#8)
  - the celebrity names (only 歌星 / 有面子)
  - All correct.

| # | Sev | Where | Note | Route to | Owner note it relates to |
|---|---|---|---|---|---|
| 1 | MAJOR | L1 (0.0–3.5) | Frame 0 has to pass "这说的就是我" on its own. Without a subject, "进教室绊了一跤" reads as the narrator's anecdote, and the viewer is first addressed at L3 (6.6 s). Put 你 first. **Replace with:** `你进教室绊了一跤，全班好像都[看见了]` (16字, 3.5 s, needs 3.4 ✓). The picture and timing stay as planned. | screenwriter | row 45 "would a 20-year-old say 这说的就是我 in the first 3 s"; row 22 "first line = the viewer's own situation" |
| 2 | MAJOR | L20 (61.1–64.6) | "自我介绍里**藏**个尴尬小秘密" reads as *hiding* a secret, and then the viewer asks how anyone could judge something hidden. In the study the embarrassing detail was *in* the introduction the observers heard (#18). **Replace with:** `另一实验：自我介绍里加个[尴尬小秘密]` (16 by pace.py, 3.5 s, needs 3.4 ✓). The picture keeps the content hidden from *us* (blurred, never the bedwetting detail), but the padlock should open toward the observers so it's clear they heard it. | screenwriter (line) · art-director (picture) | "这句话意义不明确"; "No line … whose plain reading is not what the film shows" |
| 3 | MINOR | L21 (64.6–67.6) | "满分100…只有52" makes a Chinese viewer read 52 as 不及格. But the scale runs from "much more negative" to "much more positive than the average student" (#18), so 52 means "about average". The real finding is "expected to be seen as just average, was rated well above it". **Replace with:** `50分算普通，本人只敢猜[52]` (11字, 3.0 s, needs 2.7 ✓). L22 stays as written. Picture: the 0–100 bar gets one tick at 50 labelled **普通**. Researcher: add one line to row #18 saying the midpoint of the bipolar scale = the average student (the same reading row #16's safe wording already uses). | screenwriter (line) · art-director (tick) · researcher (row note) | ep13 85 % row: "never state a result the source doesn't" |
| 4 | MAJOR | L27 (83.7–87.1) | "也低估了**好几个月**" can be read as "underestimated *by* several months", which is nonsense, so it fails "clear alone". "耶鲁新生" adds a name but no meaning. "室友" is the relatable word for this audience (宿舍), so lead with it. **Replace with:** `室友之间，这种低估能[持续好几个月]` (15字, 3.4 s, needs 3.2 ✓). "这种低估" refers back to L26. The calendar picture stays as planned: 9月 → …, no end month (#20). | screenwriter | "这句话意义不明确" ("你发的那张合照…") |
| 5 | MAJOR (for the gate-2a hook frame) | L1 picture / hero room | The line says 教室 / 全班, but the planned set is a seminar table with 4–6 people and questionnaires. Small on a phone, that reads as a meeting or interview room, and the viewer has to recognise *their* classroom in frame 0. **Build the hero room as a small Chinese classroom:** the door at the front beside the blackboard (the 前门), two short rows of desks, and 5–6 seated figures facing the front, which means they face the door. This keeps Study 1's true layout (observers facing the doorway, #4) and L10's "4到6个同学", and frame 0 reads as 教室. Questionnaire sheets stay on the desks. Stylised figures as planned: no faces, no hands. | art-director | rows 16/22 "first frame and first 3 s striking"; row 24 "on a phone a landscape film is ~1/4 of the screen" |
| 6 | MINOR (for the storyboard) | L3–L17 gauge | The gauge is the key infographic and the film's 5-second frame. Keep it to **two needles + one big number + the ×2/×6 bracket**. The five seat icons in L12 and the "?" in L4 must not compete with the number. The number should be the largest element after the subtitle (data on the model, row 44). | art-director | rubric 3 "passes the 5-second test"; row 44 "spend effort on what reads small" |
| 7 | MINOR | script.md cut list | The cut list's first choice is L9, but L9 is the only line that tells a Chinese viewer *why* the shirt is embarrassing. The singer means nothing to them, and the shirt is unnamed. **Never cut L9.** If the end card must run over 4 s, cut L28 first; L27 already shows the gap lasting. Also write the four swaps above into script.md (lines table, Chars and Needs columns). | screenwriter | "后面的内容好无聊，保留精华" (keep the essentials) |

**Title ranking**
1. **你以为大家都在看你** (cover, feed and the in-film plaque). It is the purest "这说的就是我" of the three: it names the viewer's feeling, not the paper. It covers all four beats (noticed less, judged kinder, liked more, everyone in their own spotlight). It asserts nothing about other people, so it cannot overclaim. On the 12.4 s drop it answers L4's "到底有多少人记得？". Risk: it is also the most common phrasing of this topic on Chinese platforms, so the film's distinct beats (8 %, 52 → 69, the 5-year-olds, the pull-back reveal) have to carry it. Keep them (see below).
2. **你的糗，别人记得吗？** It is concrete and it is a real question the film answers with numbers (L13–L14). But it promises only beats 1–3. The liking gap (L24–L28) is not about 糗, and 糗 is softer than the 社死 the end card uses.
3. **别人没那么在意你** It is honest, but it gives the ending away in the feed and reads like a self-help quote or a put-down. It gives the least reason to watch.

I agree with the screenwriter's pairing: cover = plaque = 1.

**Replacement lines (apply verbatim to lines.json, timings unchanged; pace-checked together: 0 % waiting, no TOO FAST):**
- #1 0.0–3.5 → `你进教室绊了一跤，全班好像都[看见了]`
- #20 61.1–64.6 → `另一实验：自我介绍里加个[尴尬小秘密]`
- #21 64.6–67.6 → `50分算普通，本人只敢猜[52]`
- #27 83.7–87.1 → `室友之间，这种低估能[持续好几个月]`

What must not change (it works):
- **The cold open's structure and timings:** the viewer's single physical moment at a door (not a list of 糗事), the subtitle on frame 0, and the door and spotlight on the first beat. Then L2 脸烧了一整天，半夜还在回放 (verbatim), L3's guess 一半, and L4's question into the plaque on the 12.4 s drop.
- **L5 不怪你敏感 + L6's promise with 也许.** WHY comes before every study (L7, L19, L25).
- **The single-student story of Study 1:** shirt → why it's embarrassing (L9) → door → 先在外面等 → the question → 46 % / 23 % with ×2 on the gauge.
- **The twist L15–L18:** the proud shirt at 48 % → 8 %, ×6, the hardest data hit. This and 52 → 69 and the 5-year-olds are what make this more than the much-told T-shirt clip. Don't cut them for time.
- **The liking-gap beat:** opened with the relatable 聊砸了 (L24), no numbers on the bars, no end month on the calendar.
- **The payoff on the 2nd drop:** pull back through the window to everyone in their own small spotlight (L29), the bookend 门口那一跤，回放最多的人是你自己 (L30), and the takeaway with 好消息 (L31).
- **The guardrails:** no singer name or likeness, no proud-shirt names, the 小秘密 never revealed, no "没人在看你", no "所有人", nothing from rows #22–#24.
- **The end card:** the 社死 question, the @ prompt, the DOI sources line and the 美国大学生小样本实验 caveat. No Wikipedia; no "Juno 出品".
