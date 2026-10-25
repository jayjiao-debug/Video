# Review: 七个回国，一个回家 v1 — verdict: BLOCKED (one cheap blocker), then FIX FIRST

The story works: the hook question, the 6910万 loop, the music anchors and the C1/C2 payoff are clear and well sourced. The risks are on screen:
- the 2013 museum shot shows the horse already donated;
- the three biggest emotional beats don't show what their lines say: the reunion, the curled ear and the five that never came back;
- the 20–47 s stretch is dark and static, exactly where the account's retention falls;
- the end-card title reads as a caption.

Master reviewed: `/tmp/claude-0/-home-claude/240969aa-174a-5914-92b5-d529595dbe80/scratchpad/ep45_final/七个回国一个回家_v1.mp4` (2:14.8, 1920×1080, 30 fps). Timing source: `lines_v81s.json`. Script: `script.md` v8.1. Facts: `facts.md`.

The evidence is in `/home/claude/video/episodes/45-mashou/review/v1_evidence/`:
- `sheets/sheet_01–31.jpg`: 1 frame per second, plus the middle of every line and both sides of every cut;
- `e01–e11` crops;
- `auto_checks.md`;
- `luma_per_second.txt`.

## Ranked fix list

| # | Sev | Time | What's wrong | Evidence | Suggested fix | Route |
|---|-----|------|--------------|----------|---------------|-------|
| 1 | BLOCKER | 1:08.6–1:12.2 | **Anachronism.** P4's 2013 hall (stamp 「2013.6.28 · 北京 · 国家博物馆 · 皮诺家族」) already shows the horse on a plinth with the plaque 「马首铜像 · 何鸿燊先生捐赠」. The horse was donated on 2019-11-13 (F15) and was shown in Hong Kong and Macau from 2007 to 2019 (F14). The plain reading is that it was already given and on show in 2013. | e01; sheet_16 (1:08.77–1:12.00) | Keep the right plinth out of frame, or empty with no plaque, for all of P4. Let the horse arrive with E1 at 72.2, when the stamp flips to 2019.11.13. The pan to it already exists, so this is a builder-only change. | builder |
| 2 | MAJOR | 0:00–0:03 | **The hook's picture is weaker than its line.** The line, with its subtitle on frame 0, is strong. But:<br>- the horse is about 210×150 px (≈ 11 % of the frame width), among eleven grey cut-outs on grey-teal;<br>- mean frame change is only 0.3–0.7 over the first 3 s (2–5 at the scene changes later);<br>- the audio is silent from 0 to 0.55 s;<br>- the first visible event is the tag at 4.0 s.<br>Owner rule (opening formula): one recognisable object fills the frame, and something happens on the music inside the first second. | e10; sheet_01; RMS −83 dBFS until 0.55 s | Open on the copper horse at about 40 % of the frame height and pull back to the ring by about 2 s (the opposite of the current push). Land a visible event on the first audible hit (0.55 s), e.g. the eleven heads dim one by one or the copper rim sweeps. Keep the subtitle on frame 0.<br>The silent 0.55 s is in the track itself: ask the owner whether the film may start at its first audible sample (his BGM rule). | art → builder; editor |
| 3 | MAJOR | whole film | **The HUD can't be read on a phone.** In the frame's own pixels:<br>- the counter's labels and digits are about 23–26 px and its dots about 17 px (`.blk` scale .58);<br>- stamp line 2 is 24 px;<br>- the day tag 「第 1 天」 is about 26 px.<br>At 390 px wide (the film inside a portrait phone) the counter is specks, yet it carries the payoff (回国 7/12 / 回园 1/12). Owner rule: HUD numbers 64–92 px, labels ≥ 40 px.<br>Also, the 「?」 is a slot machine of random digits. It flashes 「回来了 12/12」, 「7/12」 and 「0/12」 for 0.1–0.2 s each, at 1.5–3.9 s and 26.0–28.2 s. | e06, e09 | Scale the counter to about 1.0 (labels 40 px, numerals ≥ 64 px). Show it only on its story beats (hook, RR, C1/C2, K3–Q) and hide it in between. Replace the random digits with a spinning or blurred 「?」. Set stamp line 2 to ≥ 32 px or drop it. | builder (art sign-off) |
| 4 | MAJOR | 0:26.4–0:29.5 | **Dark, dead re-raise (the builder's flag, confirmed).** Mean luma is 35, the 95th percentile 52, and only 2.6 % of pixels are above 60: a flat brown haze for 3 s, exactly under 「后来回来了几个？先说马首。」. The question exists only in the tiny counter, and ghost looters are still walking through the smoke. | luma_per_second.txt (s 26–28); e05 (28 s); sheets 06–07 | Make the re-raise a picture: punch 「回来了 ?/12」 to the centre at ≥ 120 px, the same grammar as the C2 punch. Lift the smoke with fire-lit edges (95th percentile ≥ 110). Make the copper glint big on 「先说马首」, then ink-bleed to London. | art → builder |
| 5 | MAJOR | 0:29.5–0:47 | **Danger zone: about 17 s of two near-static rooms.** Mean frame change is 0.16–0.9 through 31–37 s and 39–47 s; other stretches run 2–5. The events are small: paddles about 20 px tall, a board flip, the 撤拍 sign. The owner's data shows the account dropping below Douyin's average for similar videos (同类) at 20–40 s. | sheets 07–11; diffs | Keep every beat, but move the camera:<br>- on 你猜: wide → push in to the board;<br>- b56–58: paddles rise large in the foreground;<br>- 35.4: the strike as a full-frame hit, with the board filling about ⅓ of the frame;<br>- 2007: a quicker push to the gavel, and trim D4's 1.7 s hold. | builder; editor |
| 6 | MAJOR | 0:55.4–0:57.3 | **Collision, then a carry-over.**<br>- The tall column's label 「6910万港元」 runs into the subtitle; at 56.3 s the subtitle covers 「69」, so the hook's own number can't be read.<br>- Then the 「二十多倍」 tag and bracket stay on screen into Paris (57.0), with the Paris stamp and line already up. Owner: "prop from past scene only fades after in the next scene … big nono". | e07; sheet_13 | Keep the label below the subtitle band (y ≥ 260), or stop the tilt before it gets there. Fade the tag and bracket out before the column → easel move starts. | builder |
| 7 | MAJOR | 1:37.7–1:44.5 | **The reunion doesn't land.**<br>- Scale: each brother is about 130 px against the horse's 450 px, though the real heads are the same size.<br>- Light: they are dark, unlit silhouettes. The script asked for "their glass catches the horse's copper glow, five heads lit in one room".<br>- The day tag is about 26 px (the script asks for ≥ 96 px numerals).<br>- On the exit, the left cases slide right through the horse and through each other (1:43.6–1:44.2); the label is cut to 「猴i」.<br>Owner: 「注意不要穿模」. | e03; sheets 24–25 | Heads at ≥ 80 % of the horse's scale, lit warm (rim light plus glass reflection). Day-tag numerals ≥ 96 px. Exit the left cases to the left, or lift and fade them in place, never across the horse. Check every frame for overlap. Send the V1/V2 stills to the owner before re-rendering, as the script's own note asks. | art → builder |
| 8 | MAJOR | 1:47.6–1:53.8 | **The ear isn't shown.** 「只有一只耳朵，是卷的。」 has one upright ear on screen. Its light cap reads as a highlight, not a curl, and the straight far ear never appears, so the comparison the line makes is missing.<br>R6 「被撞过」 then holds the same frame (frame change 0.2–0.5 at 110–113 s). | e04 (109.5 / 112.4 s); sheets 26–27 | Turn the head to 3/4 so both ears read. Draw the curl as a visibly rolled-over rim. Sweep the warm band across the fold on R5 and keep the tremble for R6. | art → builder |
| 9 | MAJOR | 1:57.5–2:06.0 | **「还有五个」 and 「疑似龙首」 have no readable picture.**<br>- A mush of shadow heads sits left of a half-frame horse, the same macro as R4–R6.<br>- Only five storage tags show (3 保利 + 2 国博); the counts are 4 + 2.<br>- The dashed five are barely visible.<br>- The dragon outline and its little saleroom (figures about 40 px) vanish at phone size. | e08 (119.0 / 120.5 / 122.0 s); sheets 28–30 | Pull back so the shadow ring is the subject: twelve seats across the frame, the horse small in the centre. Make the dashed five bright and show all six tags at ≥ 40 px. Give the dragon outline ≥ 300 px with a large 「?」, and make its gavel strike a visible hit. | art → builder |
| 10 | MAJOR | 2:10.3–2:14.8 | **End card: the title is too small (confirmed).**<br>- The 「七个回国 / 一个回家」 lines are 54 px (112 px of ink for both), below a 72 px question.<br>- There is only about 25 px between the title and the question.<br>- Grey dial dots sit behind 「个」 and 「？」, and the dimmed horse's ear pokes between words.<br>- The sources are 41 px from the bottom (house rule ≥ 58).<br>The payoff phrase reads as a caption. | e02; sheet_31 | Title 120–140 px, gold, two lines, the largest thing on the card. Question 56–60 px, at least 48 px below it. Fade the dial and the horse to ≤ 15 % under the card. Sources ≥ 58 px from the bottom. Keep the 4.5 s length and the seal on bar 57. | art → builder |
| 11 | MINOR | 1:04.6–1:08.2 | **Press-conference figure.** The arm hooks out at head height, the torso melts into the table, and there's no chair or legs. It reads oddly at full size. Owner: odd anatomy is worse than none. | e11 (66.0 s) | Use a side-profile figure at a lectern, or drop the figure and let the mics and the 未付款 stamp carry the line. | art |
| 12 | MINOR | 0:22.4, 0:35.4, 1:00.3 | **Wording and fact edges.**<br>- 「锤子落下，两个共拍出3149万欧元」 reads as a hammer price. F19: 3149万 includes the buyer's premium (the hammer was 2800万) — "never 落槌3149万". London 「锤子落下：三四十万美元」 has the same pattern.<br>- B2 shows kepi soldiers carrying the horse. F10: who took it is not recorded.<br>- The B2 stamp 「1860.10.18 · 英法联军火烧圆明园」 sits over the looting, which began on 10.7. | facts.md F10, F11, F19 | 「两个加佣金，共3149万欧元。」 (13 字, fits the window), or drop 锤子落下 from this line. Give the looters no uniform cue. B2 stamp 「1860.10 · 圆明园」. | editor (screenwriter), art |
| 13 | MINOR | various | **Polish.**<br>- 1:17.5–1:20: a 1.6 s silence (the track's own stop) over a near-frozen desk (frame change 0.04–0.10) can read as lag (owner: no dead stop).<br>- 1:15.3: the horse pushes up into the subtitle with its ears out of frame.<br>- 2:06.6–2:07.5: dial dots land on 「来？」 and on the counter.<br>- 1:23.0: the previous stamp 「2020.5.26 · 何鸿燊去世」 is still over the van.<br>- 1:04.0: the stamp rolls through 「2009.3.1 · 巴黎」 under the hammer line.<br>- 1:37.67: the hard cut ring → hall loses the parked 保利 case.<br>- 1:08.6–1:15.6: the J seal sits on a dark square on the grey floor.<br>- 1:36: the 保利 case's frame edge is 110 px from the right edge. | sheets 15, 17–24, 30; e05 | Keep a slow drift through the stop. Limit the push so the horse clears the subtitle band. Route the dial dots around the subtitle. Switch stamps on the cut, and start the date roll on 「5天后」. Dissolve the hall in under the ring, keeping the case. Remove the box behind the seal. | builder |
| 14 | MINOR | delivery | **Send file below the owner's spec.** It is 1280×720, 1.25 Mbps video, 23.8 MB, −17.4 LUFS. Owner: render 1080p, deliver about 1.5–2 Mbps, ≤ 28 MB. Probe's "< 8 Mbps" flag doesn't apply here; the owner's data overrides it. | ffprobe | 1080p, 2-pass, about 1.45 Mbps + 128 kbps AAC ≈ 26.6 MB. Leave the loudness at the track's own level (owner rule: BGM untouched) and confirm that no gain was added. | editor |

**If only five things get fixed:**
1. Row 1 (minutes).
2. Row 10, the end card.
3. Row 7, the reunion.
4. Row 8, the ear.
5. Rows 4 + 5 together: the 26–47 s block.

Rows 3 and 9 are the next pass.

## Automatic checks (summary)
- **Format:** 1920×1080, 30 fps, H.264 High, 4.0 Mbps video, AAC 48 kHz at 243 kbps, 134.8 s, 71.8 MB. This is fine as a master.
- **Loudness:** −17.4 LUFS integrated, true peak −5.9 dBTP, LRA 3.3. The mix sits around −16.5 to −17 LU short-term. The quietest bed is the breakdown at 42–54 s, about 3–4.5 dB under, which is within the owner's 6 dB rule.
  - There is one silence, 76.5–78.1 s: the track's own stop, intended.
  - The fade runs from 132.8 to 134.8 s.
  - The send file measures −17.4 LUFS, true peak −6.0.
- **Glitches and strips:**
  - 0 single-frame glitches, 0 black frames, 0 frozen stretches longer than 3 s, 0 exact-duplicate runs.
  - The band scan flagged 31.47 s and 56.9 s. On the frames these are the designed work-light flicker and the light-wipe into Paris, not render faults.
  - Hard cuts at 11.07, 68.57, 75.6, 76.17, 87.17, 92.0 and 97.67 s; all are motivated except 97.67 (row 13).
- **Reading pace** (pace.py, plus a recount with every digit counted as one 字): 0 lines too fast, 9 % waiting (target ≤ 12 %).
  - The biggest hold is 「同年12月1日，」: 2.3 s over the van.
  - The title gap at 9.05–11.64 is a named beat (an overlay on drop 1).
- **Subtitles vs facts:**
  - facts.py is clean, and every number on screen traces to a ✓ row: 6910万港元, 884万美元, 3149万欧元, 160年, 12天, 98岁, 5天, and the dates.
  - I checked the written-out numbers and names by hand: 十二 / 七 / 五 / 四, 二十多倍 and 三四十万美元 (both 估算 notes), 一百多年, 何鸿燊, 国家文物局, 法国家族 (皮诺), 疑似龙首 + 说不清, and 研究的人说. Exceptions are in row 12.
  - No banned sources appear in the script or the source code.
- **Brand:** no 「Juno 出品」 and no 反直觉 slogan.
  - The end card has the J seal, the gold title, the question, the pill 「关注 Juno · 一起看懂世界」 and the sources.
  - One copper accent for key words (#A84A26). The red J and the red 未付款 prop stamp are allowed.
- **Margins:**
  - All in spec: subtitle left 150 / top 124; stamp right 120 / top 62; counter left 140 / bottom 64; seal right 120 / bottom 60.
  - Fail: end-card sources 41 px from the bottom (needs ≥ 58).

## Visual pass (1 fps, all 31 sheets)
- **Logic:**
  - The zodiac order on the counter is right: 子丑寅卯 lit, 辰巳 dashed, 午 copper, 未 dashed, 申 lit, 酉戌 dashed, 亥 lit.
  - C1 lights 4 → 7 in the order of return, and the C2 cases hold the right heads (保利: 牛 虎 猴 猪; 国博: 鼠 兔).
  - The counter state matches the lines everywhere except K3's tag count (row 9).
  - Who does what reads correctly in the 1860 carry, the 2020 delivery, the Paris phone bank and the empty chair after Ho's death.
  - Wrong: 2013 (row 1), the brothers' scale (row 7), the ear (row 8).
- **Hook (0–3 s):** see row 2. The line and the second loop (tag → 「捐」 at 6.83 s) are good; the picture is not yet "striking at phone size".
- **20–40 s:** see rows 4 and 5. Brightness is 35–39 mean from 19 to 28 s, then the saleroom holds.
- **Dark or dead:** 26–29 s (row 4); 47 s (iris, under 1 s, fine); 77.5–80 s (row 13); 110–113 s (row 8); the end card at 28 mean luma (row 10).
- **Phone size** (e09, frames at 390 px wide): subtitles (64 px serif with shadow) and the 48 px case labels read. The counter, stamp line 2, the day tag, the brothers, K3/K4 and the sources don't.

## Script pass
- The hook asks a real search question, and H2/H3 open a second loop without giving a count. The two loops close where the script says they do (72.2 s and 92–97.7 s). The end question invites a debate, which suits comments.
- **The why is missing.** 「5天后，买家却说：[这个款不能付]。」 never tells a cold viewer why the buyer wouldn't pay (F19: a patriotic refusal), so it may read as "he was broke". Consider a picture cue (the press-table banner) rather than more words.
- **After the peak.** 「细看，它是红铜一次铸成的。」 is the one post-payoff line that doesn't serve "who came home". If the ending must get shorter, it is the first candidate to cut (owner: 保留精华).

## Owner-notes pass (rows that apply)
- 「这个手好奇怪」 / odd anatomy → row 11.
- 「只有我过得不好感觉有点误导」 (no misleading plain reading) → rows 1 and 12.
- 「开头的冲击力度有点弱」 + the opening formula (ep14) → row 2.
- 「屏幕本来就不大…」 + 「make sure the reading is big enough」 (HUD 64–92 px, labels ≥ 40 px) → rows 3 and 9.
- 「可以的，注意不要穿模」 → row 7.
- 「prop from past scene only fades after in the next scene is a big nono」 → row 6.
- 「学习最快的方式 title…现在根本不像title」 → row 10.
- 「不用那一段awkward的卡顿」 (silence plus a frozen picture) → row 13.
- 「is the guy suppose to be feeding the fish?」 (counters must match the picture) → row 9 (5 tags shown for 6).
- 「后面的内容好无聊，保留精华」 → the script-pass note on R4, and rows 8–9: the last 30 s hold one macro image.
- Delivery: 1080p at ~1.5–2 Mbps, ≤ 28 MB → row 14.

## What works (keep)
- **Frame-0 subtitle and hook line, and the 6910万 loop.** The tag flips to 「捐」 on the half-beat, and the same type returns at 51.5 s.
- **The C1/C2 payoff, 92–97.7 s.** Seven lights in zodiac order, five dashed, the cases ×4 / ×2 with readable labels, and the 回园 1/12 punch. It is the clearest frame in the film, so build rows 4 and 9 in its grammar.
- **Motivated transitions:**
  - the title → noon match on the horse;
  - the curtain wipe into 2013;
  - plaque → lamp base;
  - the lamp going out on the music's stop;
  - van doors → 正觉寺 doors on the hardest drop;
  - the horse's face → the ring.
- **Fact discipline.** Correct dated stamps; honest bar ratio for 二十多倍; the 疑似龙首 / 说不清 and 研究的人说 wording.
- **Clean technical render and pace.** No glitches, black frames or freezes; 0 lines too fast; the end card at exactly 4.5 s with the seal on bar 57.

## Not checked / can't judge
- **Music:** I can't judge its taste. I didn't verify that the BGM is sample-identical to the owner's file or that the fade ends on a downbeat; I only measured levels. The v6 bar cut was approved by the owner on 2026-10-25.
- **Coverage:** I looked at 185 sampled frames plus about 40 targeted full-resolution frames. Motion smoothness between samples is judged only from frame-difference statistics.
- **Phone viewing:** simulated by downscaling only. I didn't judge Douyin's re-encode, the cover, or the hidden 0.4 s typing on each line.
- **Sources:** I spot-checked the end-card list against facts.md, not item by item. 都市快报 is listed but no longer used on screen (minor).
