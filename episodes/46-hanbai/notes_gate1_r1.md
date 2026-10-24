# Gate 1 notes: 泰山汉柏, script v1 + lines.json (59 lines, 2:34), r1. Verdict: REVISE

Scores (rubric 1–5, only the areas this gate covers): **script 4** · facts **pass with 3 fixes** (one implied false cause, one missing 相传 label, one unsourced adjacency) · visual / info / edit / motion / sound: not at this gate (two editor carry-forwards below).

**Bottom line.**
- This is a strong v1, and it is close. The cold open follows the brief to the letter. It opens on 「假如说」 with a number on frame 0, gives five fates in 13.6 s and ends on a present-day jolt: 「今天，你只靠一条树皮活着」, which is the cold reader's first real jolt. The researcher's binding corrections are all respected: 相传 on every planting claim, no procession passing the tree, no 「史记没写」, and 2100多岁 on screen.
- The film has two real 原来如此 beats: 「盖」 = 大概, so your birth is a "maybe"; and 你活了下来 → 其实只活着一半. Its peak (F6, the children guarding 茂陵) is the cold reader's strongest memory ("I got chills").
- Five things keep it from going to the owner today:
  1. **E2 tells the viewer the 1928 cooking fires burned your west trunk.** The sources give no year (note 1).
  2. **The middle sags in two places:** the emperor list (D2–D8, the cold reader's #1 swipe point) and the 赤眉 legend, where the cold reader lost track of who 你 is (notes 2, 4).
  3. **The title card and the first post-title line repeat ep41's door problem in a smaller form** (note 3).
  4. **The end-card question is a mood line, not an argument,** and its 你 now reads as the viewer (note 5).
  5. **Several lines fail "reads alone":** what tree you are, 封禅 never explained, 唐槐 out of nowhere, 2135岁 without 相传 (notes 6–9).
- All of this is line-level. One screenwriter pass plus a small researcher pass fixes it. The beat order does not change.

**Inputs read:**
- director.md, production-crew SKILL.md, rubric.md, all owner-notes rows.
- ep46: brief.md, facts.md (all 50 rows, Story-worthy, Risks), script.md, lines.json, lines_pace_flags.json, coldread_v1.json.
- Precedent: ep45 notes_gate1_r1.md, ep44 brief (ep41 data), ep42 music_map (bgm2 grid), ep45 build45.py.

**Checks I ran myself:**
- `pace.py lines.json --film-end 153.96`: waiting 7.1 s = 5 %, 0 TOO FAST. The CHECK at 13.6–17.0 is the title (note 3). The MINOR holds at Q7, F6 and the end card are named beats.
- `facts.py script.md --lines lines.json`: no problems. That script only matches numbers to script.md, so I traced the lines to facts.md by hand: 41 lines, table below.
- Counter arithmetic (AD year + 109): 165 / 775 / 834 / 1117 / 1857 / 1871 / 1880 / 1899 / 2037 / 2133 / 2135 all correct. Wu Di 0 → 21 matches 110 → 89 BC.

## Gate 1 checklist

| Check | Result | Evidence |
|---|---|---|
| Hook, first 2 s | **Pass; small tweaks** | Frame 0 shows the two-tone tree (green trunk + charred trunk, the only glow) with 「假如说，你是一棵2100多岁的树」 typed on. Cold read: "puts me in the tree's body right away… enough to stay on". That matches owner rows 196 / 221: the topic on frame 0, the number on the picture, something moving on beat 1. The soft spots: (a) the viewer doesn't know what kind of tree it is (cold read, "I never hear 柏"); (b) the half-dead / half-alive contradiction is in the picture but nothing points to it before 3 s; (c) the typing must finish early enough to read inside 2 s. Notes 6 and 12. |
| Cold open (5 fates, present-day hook, title at ~12 s) | **Pass** | C2–C6: a new fate every 1.7–2.8 s, each paid off later (C2 → A2/A7, C3 → D, C4 → E2, C5 → Q2, C6 → E3). C6 is centred and is the jolt. Title at 13.58. |
| Title card vs ep41's silent-card drop | **Risk: fix** | 3.4 s (6 beats) with no subtitle, then a static location line (A0). ep41's average watch fell inside a silent title card; ep44's notes called the first post-title beat "exactly where ep41 lost its viewers". The cold reader flags the gap: "if the picture isn't doing something big there, I'll feel the story stall and swipe". Note 3. |
| Middle: a pile of examples? | **Partly** | A (the 盖 record), Q (乾隆), W (smoke) → E (half) and F (children) are events with a twist. **D2–D8 is a list:** four years and four names in 8 s, then a 6/5 count puzzle. It is the cold reader's #1 swipe point ("reads like a history quiz"), and D8 confused them about Wu Di. **B1–B5** is a legend about another tree: "I lose track of who 'you' is". Notes 2 and 4. |
| Every line reads alone | **Fails on 7 lines** | C1 (what tree), A1 / D1 / D6 / D7 / D10 (封禅 never explained), B2 / B5 (you or the other tree?), D8, W4 (唐槐 with no context), G3 (age without 相传), end card (who is 你?). Notes 2, 4, 5, 6, 7, 8, 9. |
| 你 voice + counter | **Pass** | 你 in nearly every line. The 「相传 · 你 X 岁」 counter with the 估算 small print is honest and is a real device. The dashed legend style for 相传 / 传说 is a good teaching code. Keep both. |
| Repeated set-piece | **Pass in the picture, weak in the lines** | The torch line behind the tree, getting shorter each time and ending with tourists, respects row 24. The lines over it are the list (note 2). |
| Ending | **Lands** | F5 → one empty bar → F6 on the peak is the best close in recent episodes (it fits pauses.md: a pause, then the hit). G2 「来了，又走了」 echoes the torch lines, and G4 「你一直在」 bookends frame 0. G1's stat "doesn't connect to the tree" (cold read). G2 rescues it (note 11). |
| End-card question | **Weak: fix** | 「皇帝和你，谁是主，谁是客？」 The cold reader didn't know who is host and who is guest: "sounds profound … works as a mood line, less as an answer". After 2:30 the film has argued one answer (the tree), so the comments won't split. At the end card, 「你」 reads as the viewer. The cold reader's predicted comment is the real fight: "so was it even planted by Han Wudi or not?". Note 5. |
| Titles | See ranking | The cold reader clicks #3 and calls #2 misleading. |
| Length | **Pass** | 2:34 now. After notes 2, 3 and 4 it is about 2:26, and the editor re-spends the freed beats on named holds (note 10). Cap 3:00. |
| Facts | See table | 38 of 41 traced lines are clean. E2 (implied cause), G3 (相传 missing) and W4 (隔壁) need fixes. |

## Facts spot-check (41 lines against facts.md wording)

| Line | On screen | Row: source wording | Status |
|---|---|---|---|
| C1 | 2100多岁 | 1: 「历经2100多年风霜雪雨」 | ✓ the official wording, as required |
| C2, A2, F5 | 相传，汉武帝种下了你 | 9: 「蓋漢武所植也」; 8: no dating study | ✓ labelled every time |
| C3 | 皇帝来泰山，来了又走 | 14, 18–21 | ✓ |
| C4 | 大火烧过你 | 5: 「西干曾遭火焚而枯」 | ✓ no year (but see E2) |
| C5, Q2 | 乾隆画过你 · 1762 | 27: 乾隆二十七年, 《岱庙汉柏图》, 故宫藏 | ✓ |
| C6, E3 | 只靠一条树皮活着 | 5: 「仅靠树干北面32厘米宽的树皮输送养分」 | ✓ |
| A0 | 泰山脚下，岱庙的院子里 | 4: 「位于岱庙汉柏院西北角」 | ✓ |
| A1 | 公元前110年，汉武帝来泰山封禅 | 13/14: 元封元年夏四月「登封泰山」 | ✓ |
| A3 | 他前后来了8次 | 14: eight 武帝纪 entries, 110–89 BC | ✓ |
| A4–A5 | 《汉书·武帝纪》次次都记，却一个字没提种树 | 12: 植 absent; 種 only in 種宿麥 | ✓ It names only 武帝纪, never 史记. This is exactly the restriction row 12 asks for. |
| A6 | **现存最早**的记载，在几百年后 | 9: the researcher's claim column says 最早的记载; no source sentence says "earliest" | **Caution.** A superlative built from our own search. Note 13. |
| A7–A8 | “盖汉武所植也” · 盖 = 大概 | 9: 「蓋」 = "probably / it is said" | ✓ |
| B1–B4 | 赤眉军砍了一棵柏树 · 传说砍出了血 · 斧头停了 | 10: 「赤眉嘗斫一樹，見血而止」 | ✓ 传说 label on the blood |
| B5 | 岱庙至今有棵树叫「赤眉斧痕」 | 10: 泰山管委会 2019 | ✓ (至今 rests on a 2019 source; acceptable) |
| D2–D5 | 56 光武帝 · 666 唐高宗 · 725 唐玄宗 · 1008 宋真宗 | 18, 19, 20, 21 | ✓ (the 725 rite, not the 726 inscription: correct) |
| D6, D10 | 最后一位封禅的皇帝 · 从此再没有皇帝封禅 | 21: 「在泰山封禅的最后一位皇帝」 | ✓ |
| D7 | 封禅泰山的皇帝只有6位 | 22: 中新网 2023, verbatim | ✓ |
| D8 | 除了秦始皇，5位来时你都在山下 | 17, 22: 估算 | ✓ arithmetic, but it confuses (note 2) |
| Q1 | 七百多年后，乾隆来岱庙10次 | 26: 「十次拜谒岱庙」; 1008 → 1748 = 740 估算 | ✓ |
| Q3 | 称你为「数千年神物」 | 27: 「其西北隅一株尤为轮囷奇，数千年神物」; 4: 西北角 = 汉柏连理 | ✓ |
| Q4–Q5 | 1771 · 刻成石碑 · 立在你旁边 | 28: 「勒碑立于岱庙汉柏院内」, 央广 「立碑于树旁」 | ✓ |
| Q6–Q7 | 石头里的你望着真的你 · 谁是主，谁是客 | 29: 「殿旁亭里相望近，名实主宾谁是乎」 | ✓ fair paraphrase |
| W1 | **1928年**，军队住进岱庙 | 30: the government sat in 泰安 1928.6–1929.5; 「孙良诚的部队还曾驻扎岱庙」 | **Caution.** The quoted wording does not pin the troops to 1928. Note 13. |
| W2 | 大殿里养马、烧火做饭 | 30: 「天贶殿内住宿、养马、烧火做饭」 | ✓ |
| W3 | 几十株千年古柏枯死 | 31: 「岱庙内几十株千年古柏先后枯死」 | ✓ (single source, stamped) |
| W4 | **隔壁**的唐槐，也死在战乱里 | 33: 「民国年间因战乱受摧残，渐渐枯死」 | The death is ✓. **「隔壁」 is not in any source** (row 48 only lists both courtyards). Note 8. |
| W5 | 你活了下来 | alive today (1, 5) | ✓ |
| E1–E2 | 只活着一半 · 西边那根被火烧死 | 5: west trunk dead by fire; **date UNVERIFIED** | **Fix: implied cause.** Note 1. |
| E4–E5 | 32厘米 · 11.5米 | 5, 6 | ✓ |
| E7 | 古树被24小时监测 | 36: 「24小时智能监测系统实时预警」 | ✓ (这里的古树, not "you" specifically: correct) |
| F1–F2 | 收集种子 · 2024 · 6棵小树出发 | 43: 「6株为…"汉柏连理"的种子所育」, 4月16日 | ✓ |
| F3–F4 | 茂陵 · 汉武帝的墓 | 43 | ✓ |
| F6 | 轮到你的孩子守他了 | 43: 「泰山汉柏（幼苗）守护茂陵」 | ✓ |
| G1 | 泰山一年来800多万人次 | 41: 泰山景区, 2023–2025 | ✓ in the line (泰山, not 岱庙). The picture must not show 800万 at the tree (note 11). |
| G3 | 2026年，你2135岁 | 13: 「相传你2135岁」 with 按汉武帝首次封禅推算 in small print | **Fix: the line drops 相传.** A big centred line states a legend-based age as fact, and the small print alone is too small for that job. Note 9. |
| End | 谁是主，谁是客 | 29 (callback) | ✓ as a question; but note 5 |

Not on screen, correctly: the 5 vs 6 tree count, 汉武帝亲手, 史记, 康熙, the 1967 stele story, the Japanese bombing, the ginkgo rescue, 孙良诚's name, any fire year.

## Notes

| # | Sev | Where (line) | Note | Route to | Owner note it relates to |
|---|---|---|---|---|---|
| 1 | **High** | E2 「西边那根树干，被火[烧死]了。」 (108.68) | **The sequence tells the viewer the 1928 cooking fires burned you.** W2 「烧火做饭」 → W3 cypresses die → W5 你活了下来 → E1 只活着一半 → E2 被火烧死: every viewer will connect them. Row 5 gives **no year**, and the 「年代不详」 stamp is too small to undo what the order says. Put the unknown year in the line itself: 「西边那根，不知哪年被火[烧死]。」 (12 字, needs 2.81 s, fits the 2.83 s window). Keep the stamp. Do not add 早就 / 当年 or any other word that dates it. | screenwriter | row 11 "plain reading"; brief "chest-beating the sources don't carry"; facts row 5 |
| 2 | **High** | D1–D10 (53.77–73.58) | **Turn the emperor list into the six-seal counter, and let the seals carry names and years.** Cold read: "four years and four emperor names in 8 s … the tree is absent … reads like a history quiz". D8 also made them doubt the story: "Han Wudi is one of the six and he supposedly planted me, so what does 'I was at the foot' mean?" The counter (相传 · 你 165 → 775 → 834 → 1117) already carries the years, so the lines repeat them. Suggested replacement, about 15 s instead of 19.8 s: **D1** 「史上封禅泰山的皇帝，[只有6位]。」 (13 字; six seals appear under the counter); **D2** 「秦始皇来时，你[还没出生]。」 (seal 1 greys, stamp 前219 · 估算); seal 2 lights in the dashed legend style as 汉武帝 · 前110 (no line, since he was told at A1–A3); **D3** 「汉武帝之后，还有[4位]：」 then seals 3–6 light on the beat, two beats each, each seal carrying its name and year (光武帝 56 · 唐高宗 666 · 唐玄宗 725 · 宋真宗 1008) while the torch line behind gets shorter each time and the counter jumps; **D6** 「宋真宗之后，[再没有第7位]。」 Then the time-lapse as planned. Every claim is still rows 17–22. The number lives on the picture as something countable (row 221), and the 5/6 puzzle is gone. If you want one name line, make it one line of names with no years (「光武帝、唐高宗、唐玄宗、宋真宗。」), not four lines. | screenwriter (lines), art-director (seal row spec) | row 186 "every scene must add something new"; row 221; row 283 |
| 3 | **High** | Title card T (13.58–16.98) + A0 「你在泰山脚下，[岱庙]的院子里。」 (16.98) | **Keep the door open after the hook.** ep41's average watch fell inside a silent title card, and ep44's notes found the first post-title beat is where viewers left. Three changes: **(a)** Cut the card from 6 beats to **4** (13.58–15.85). The title is readable on the very first frame of the hit; it does not build up after the rewind. The rewind runs *behind* the title, and the counter spins 「相传 · 你 2135 → 0 岁」 in large numerals, so the screen always has text moving and a question (how old?) in it. **(b)** The first line after the title must be an event, not a location. Fold A0 into A1's stamp (it already reads 岱庙 · 泰山脚下) and the picture, and open the body on **A1** 「公元前110年，汉武帝来泰山[封禅]，」 followed by the 封禅 gloss (note 7). **(c)** Carry the location in A2: 「相传，山脚下的你，就是他[种下]的。」 (13 字, needs 2.96 s; it takes the time freed by A0). Net: −1.13 s on the card, ±0 in section A. | screenwriter (a–c lines), editor (a timing) | brief rhythm (title ~12 s); ep41 data in the ep44 brief; rows 196, 221, 265 "no dead stop" |
| 4 | Med | B1–B5 (41.89–53.77) | **The 赤眉 legend loses the 你 thread.** Cold read: "it's a different tree from me … I lose track of who 'you' is", and "赤眉斧痕 makes me wonder whether it's the same tree". Say plainly it is another tree, and merge the blood and the axe: **B1** 「后来，起义的[赤眉军]，」 (keep) · **B2** 「砍了庙里[另一棵]柏树。」 · **B3** 「传说，砍出了血，[斧头停了]。」 (10 字, about 2.5 s; dashed legend style) · **B5** 「那棵树，今天还叫[“赤眉斧痕”]。」 (11 字). 「另一棵」 rests on the tradition that puts the story on the named 赤眉斧痕 tree (row 10); no source puts it on 汉柏连理. Saves about 2.3 s. Keep the counter visible (dimmed) instead of fading it out, so the viewer never loses "this is still you watching". | screenwriter | row 187 "makes sense alone"; row 281 "one example must not take over" |
| 5 | Med | End card Q 「皇帝和你，[谁是主，谁是客]？」 (147.74) | **Ask the question people will actually argue about.** (a) At the end card the film turns to the audience, so 「你」 reads as the viewer: the cold reader asked "is it the emperor or the tree who is the host?". (b) The film has spent 2:30 arguing that the tree is the host, so the answers won't split. (c) The cold reader's predicted comment is the real argument: "so was it even planted by Han Wudi or not?" The 盖 scene was their #1 surprise. Use **「它真是汉武帝种的吗？[你信吗]？」**. Comments split into 信 / 不信, and people bring evidence: UNESCO says "planted 2,100 years ago" (row 2), the oldest text says 盖. It is also your own takeaway, 「一棵谁也说不清来历的树」. Keep 「谁是主，谁是客」 at Q7, where it belongs to 乾隆 and is explained by the two trees facing each other. Keep the @ prompt 「@一个去过泰山的朋友：你在岱庙见过它吗？」: it is a good send-to-someone line. If you keep the 主/客 callback anyway, at least make it concrete and in the third person: 「皇帝和这棵树，谁才是[泰山的主人]？」. | screenwriter | rubric 1 "end-card question invites comments"; row 247 (recognition invited in the end card) |
| 6 | Med | C1 「假如说，你是一棵[2100多岁]的树。」 (0.00) | **Say what tree you are on frame 0.** Cold read: "what tree is it? I never hear 柏", which then causes the B2 confusion. Use 「假如说，你是棵[2100多岁]的柏树。」: the same 12-character count, so the window doesn't change, and 柏 also sets up 汉柏 in the title. | screenwriter | row 187; row 196 "the topic itself on line 1" |
| 7 | Med | A1 (19.81), D1, D6, D7, D10 | **封禅 is used six times and never explained.** The cold reader doesn't know it. The brief assumes 18–25 viewers do; a v1 cold read says otherwise. Add one gloss line right after A1, e.g. 「在山顶祭天：证明[天选的是他]。」 (12 字, 2.8 s). It pays for itself three times: it explains why emperors climb past you to the summit (rite at the top, you at the foot, rows 16 and 24), it plants the brief's takeaway (they came to prove they were chosen; you never had to prove anything), and it gives note 2's seal counter its meaning. **Researcher first:** add a verified facts row with source wording for what 封禅 is. The 中新网 / 中国日报 道中华 2023 pieces in rows 17 and 22 likely define it. The line follows that row's wording. | researcher (row), then screenwriter | row 209 "why it was done, not just what"; row 253 "if a term is unavoidable, the next line says what it means" |
| 8 | Med | W4 「隔壁的[唐槐]，也死在战乱里。」 (101.32) | **Two problems: 隔壁 is unsourced, and 唐槐 arrives with no context** (cold read: "as if I should know about it"). Use 「庙里那棵唐朝的[槐树]，也死在战乱里。」 (15 字, needs 3.24 s; take the 0.4 s from W5's slack or the note 2 savings). Row 33 supports the death in 民国 wars. Nothing supports "next door". | screenwriter | row 187; facts row 33 / 48 |
| 9 | Med | G3 「2026年，你[2135岁]。」 (143.21) | **The line drops 相传.** Row 13's allowed on-screen form is 「相传你2135岁」 plus the small print. As a big centred punch line, the bare 2135 reads as a measured age, and row 8 says no study exists. Use 「相传，你今年[2135岁]。」 (7 字, needs 2.1 s, fits the 2.26 s window). The counter's small print stays as is. | screenwriter | brief "presenting legends as fact"; facts rows 8, 13 |
| 10 | Low-Med | E4–E5 (114.34–118.87); time freed by notes 2–4 | **Spend the ~8 s saved on the holds that carry the film, not on new text.** The cold reader found 「32厘米宽，给11.5米高的你输送养分」 "a quick two-number line that gets lost". Give E4 two more beats with the dimension line snapping across, and E5 two more as the glow climbs to the crown. Give the D10 time-lapse a bar if the music wants it. Do **not** add lines. Target about 2:28–2:32 after the retime. | screenwriter, editor | row 239 (room to look at the picture); row 278 |
| 11 | Low | G1 picture (138.68) | **The 800万 figure is 泰山, not 岱庙** (row 41: 岱庙 count UNVERIFIED). Draw the stream of visitors on the mountain path *behind* the tree, as the last version of the torch line, which the script already calls it. Only a few phones at the tree itself. Otherwise the picture claims 8 million a year pass you, which echoes the row 24 trap. The line can stay. | art-director | facts rows 24, 41 |
| 12 | Low | C1 picture + timing (0–2.83) | **Make the first 2 s do two things.** (a) Type the line fast enough that it is fully readable by about 1.2 s, with the first words on frame 0 (row 289). (b) bgm2's first note is at 0.555 s (ep42 music map), so the gust in the crown lands there, not at 0.00. A second event at about 2.0 s (the light slides across from the green trunk onto the charred one) lands the "half dead, still alive" contradiction by 3 s with no new text (row 221). | art-director, editor | rows 196, 221, 289 |
| 13 | Low | facts.md: A6 (31.70), W1 (93.40) | **Two wording checks.** **R1:** does any source say 《水经注》/《从征记》 is the *earliest surviving* record? If not, A6 becomes 「几百年后，一本书里写着：」 (no superlative, same picture). **R2:** quote the 齐鲁晚报 2015 sentence that dates the troops in 岱庙. If it doesn't say 1928, W1 becomes 「1928年后，军队住进[岱庙]，」 or the year sits only in the 1928—1929 stamp. | researcher, then screenwriter | facts rows 9, 30 |

### Editor carry-forwards (for the music cut; not blocking gate 1)
- **The grid is one beat off bgm2.** The script puts bar lines at n × 2.264 s from 0, while bgm2's downbeats sit at 0.5688 + 2.2642·n. bgm2's first crash (song beat 16, 9.06 s) is a **pickup**, one beat before the A-section downbeat. One extra 2-bar intro loop, the build45.py method (which loops twice for ep45), puts the crash at **13.587 s**, which is the planned title time. So the title can slam on the crash. Every later "bar line" in the plan then lands one beat early: shift the whole plan by +0.566 s or re-anchor once before the retime. The track's hardest drop is the later DROP section, so put that under **F6**, not the title (row 307 precedent: title on the first drop).
- **The hush at bar 48 runs 106.4–121.7 s, about 15 s.** Owner row 224 says a long quiet breakdown "sounds like the music broke" on a phone. "Thins" must stay within about 6 dB of the body for anything longer than a bar. Thin the arrangement, not the level.

## STRUCTURAL notes
- None. The beat order stays: cold open → title → birth / record → axe → emperors → 乾隆 → smoke → half → children → today → end card. Note 2 rewrites the lines of one beat, and note 3 moves A0's content into a stamp.

## Title ranking (owner's pick)

1. **它的孩子，去守汉武帝** → I suggest **「汉柏的孩子，去守汉武帝」** (10 字). This is the cold reader's click ("the only one that makes me ask 'wait, how?'"). It is a true twist (row 43), it reverses the power relation, and it promises exactly the film's peak. 汉柏 names the subject for the feed and for search, where 它 relies on the cover. **Against:** it spends the peak. The cold reader thinks that's fine ("makes me want to see how it gets there").
2. **皇帝走了，这棵树还在.** Honest as read and the safest. **Against:** the cold reader calls it the familiar "the dynasty falls, the mountain stays" trope. It sets a mood but raises no question.
3. **乾隆画了它，又问谁是主.** Every word is sourced, but its plain reading promises a 乾隆 / painting story, and 乾隆 is 19 s of 154. 「谁是主」 is cryptic out of context. The cold reader names it as the misleading one (row 185 / 11 "plain reading").

## What must not change (it works)

**Story and lines**
- **C1 on frame 0:** 「假如说，你是…2100多岁…」, with the two-tone tree as the only glow (only 柏 is added, note 6).
- **The cold open C2–C6 as one run of fates over hard cuts**, ending on **C6 「今天，你只靠[一条树皮]活着。」**, centred. Every fate is paid off later.
- **The 盖 turn A4–A9**, ending on **「你的出生，是个“大概”。」** It is the cold reader's #1 surprise, and A4–A5 name only 《汉书·武帝纪》, exactly as row 12 requires.
- **The whole 乾隆 scene Q1–Q7**, especially 「石头里的你，[望着]真的你。」 and the question kept at Q7.
- **W3 → W5 → E1:** 几十株千年古柏枯死 → 「你活了下来。」 → 「可你，其实只活着[一半]。」, the film's best mid-film twist.
- **E3–E5:** one strip of bark, 32 cm, feeding 11.5 m (more time, not fewer words).
- **F1–F6:** the seeds, 6 seedlings, 茂陵, 「相传种下你的那个人」, **one empty bar**, then **F6 「两千多年后，轮到你的孩子[守他]了。」** on the peak.
- **G2 「来了，又走了。」 and G4 「[你一直在]。」**, the bookend to frame 0.

**Devices and discipline**
- The counter **「相传 · 你 X 岁」** with the small print 按汉武帝首次封禅推算 · 估算, and the arithmetic as computed.
- **The dashed-outline legend style** for every 相传 / 传说. Solid means fact.
- **The torch line on the mountain behind the tree.** No procession ever passes you (row 24), and the tourists are its last version.
- **The camera never leaves the tree** (the episode's new device; F6's split frame keeps it).
- No 史记 claim, no fire year, no tree count (5 vs 6), soldiers unnamed with no insignia, 2100多岁 as the on-screen age.
- The end-card sources line, the @ prompt, 「关注 Juno · 一起看懂世界」, and never 出品.
- The cut list (A8, D10, E7, G2) as the safety valve if the music cut runs short. After note 2, D10's content lives in D6.
