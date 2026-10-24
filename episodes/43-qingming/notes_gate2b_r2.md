# Gate 2b notes: 假如你是清明上河图, storyboard r3 (look A, 37 scenes), r2. Verdict: APPROVE

Scores (rubric 1–5, from the plan): script n/a · **visual 4** (r1 4) · **info 5** (r1 4) · **edit 5** (r1 4) · **motion 4** (r1 4) · sound n/a (music only)

**Bottom line.** Every r1 note routed to the art director has landed. The blocking timing note is fixed and I verified it: all 48 line starts in the map match `lines_bars.json` within 0.005 s, and the 37 scene windows are continuous, on bars or half-bars except the two measured drops. There is no storyboard defect left that needs another round.

Four one-line fixes remain. Make them in the storyboard text or at build time; none needs re-review:
- the E3 label timing (art-director flag 1; my own r1 table was wrong);
- a stale time on scenes 34/35;
- the 1945 stamp text, to sync with v2.3.1;
- scene 25's last bar, which is overloaded.

Separately, the **build** has five conditions to meet before specific gate-3 stills go to the owner, mainly the contact checker and the night sky in code (listed below).

**What I read:**
- storyboard.md r3 (all 560 lines);
- script.md v2.3.1 (the changelog and line rows V2, V3, E4);
- lines_bars.json;
- the r1 notes;
- film/src: core.ts (modes 9–12), actors.ts (`rig`, `slopeFeet`, `CONTACTS`), rooms.ts, crest.ts, timeline.ts and the silk.ts API.

**Checks I ran:**
- The storyboard's line map compared with `lines_bars.json` (48 of 48, worst 0.005 s), plus scene-window continuity.
- **Painter evidence.** I rendered two crops with `tools/silksheet.mjs crop` into the scratchpad, sized as frame 0 would show them (2730 × 1536 of the strip at 1920 × 1080):
  - `…/scratchpad/g2b/f0_river_mono.png`
  - `…/scratchpad/g2b/peak_relief_colour.png`

  Both read as a painting at full frame: dense 界画 linework on a silk weave, the 虹桥 crowd, the boat with its A-frame mast coming down, and the right mineral palette in colour. Paint times were 0.4 s (mono) and 1.7 s (relief). That retires most of r1's risk 1. What's left is the corner shading under the subtitle, because the painting's top-left is busy (still 1 measures it).

## r1 notes: status

| r1 # | Status | Evidence |
|---|---|---|
| 1 Timing | ✓ | Map = file (48/48). Scene windows: 21 b35.5–37.5, 22 b37.5–39, 23 b39–41 (seals 39.0–40.0, eaves in the bass-less bar 40), 26 V3 whole on the b49 hit, 30 D2/stamp/chip on b60.5, 31 E1 b62.25 (glyphs b63), 32 偷 on the b64 accent, 33 eras b66–66.75, 34 the moral picture b71–72, 35 lid on b73.0, 37 Q in the end-card slot on b76.5. **One leftover:** see fix A. |
| 2 Cameras | ✓ | CR-E and CR-G are retired. I2 is a side-on day push toward the Dagoba; P2 is a side-on track with a pan down into the snow, which becomes the ledger; Q1 is a low framing with a near boat plane. "Tilt" now means a vertical pan. The crest visits stay distinct. |
| 3 Body logic | ✓ board · **partial in code** | The Build section describes the real pipeline and the checker spec. In code, `rig()` aims hands and logs misses over 4 px. **Still missing:** `tools/contact_check.mjs`; float detection on planted feet; true leg IK. See build condition 1. |
| 4 Peak | ✓ | One move, three sprites shared with frame 0, the HUD hidden for b56, the bridge-match exit, no mode 8 or flash. My crop shows the painted arch spans the frame almost level (ends at y ≈ 650 / 640), so matching it onto the side-on crest arch is feasible. Ghosts and shadows aren't in silk.ts yet; they can be done at render time, and still 3 checks them. |
| 5 Daybreak | ✓ | The carrier is out of frame right by b67.4. Mode 12 (light-edged wipe) is in core.ts and changes the standing bank crowd. The visitors walk left from b68.25. |
| 6 Luma | ✓ board · **partial in code** | The palette and floors are set (≥ 45; the named darkest beats ≥ 40). In code, `crest.ts` night is still the old `#16222B…`, and `rooms.ts` is only partly raised: the STORE wall top is `#2a2622` (luma 39, the board says 52) and the XBL wall `#33383d` (55, the board says 63). See build condition 2. |
| 7 Colour | ✓ | One colour source per scene from 16 to 27, plus the saturation check. Flag 3 is ruled below. |
| 8 Stills | ✓ | The order is right (frame 0, drop pair, peak, night sale, day crest, 1945, pane, pull-back). Every still with a person in it is gated on the contact checker. |
| 9 Figures | ✓ | Profiles only; a child walks beside a parent; no gloves; the researcher's rolls and his crate are within reach. |
| 10 WALL → E4 | ✓ | The push into the one glowing roll replaces the sky tilt, and the glow stays on the lock point through the flip-book. |
| 11 E4 chip; V2/V3 stamps | ✓ in script v2.3.1 | The board still carries the old V2 stamp (fix C). |
| 12 Colophons, scroll, labels | ✓ | Columns at x 1200–1700; about 2 m of the tail; labels ≥ 56 px. |
| 13 Facts rows | open (researcher) | Safe placeholders are in place: the seals on the mounting silk, the lamp shade "to confirm". See build condition 5. |
| 14 Kit | ✓ compositor · **HUD open** | Modes 9 (pane), 10 (smear), 11 (PiP) and 12 (light edge) are in core.ts. Not yet in hud.ts (unchanged since r1): the title ink clipped to the band, E3's per-word red, Q in the end-card slot, and the V3 stamp's line-2 slam. See build condition 3. |

## The art director's four flags: rulings

1. **The E3 label gets 1.7 s against about 2.1 s needed. Agreed, and the error was mine:** my r1 table put the label on b65.0, three beats before the push. **Fix B below.**
2. **Night sky zenith raised to luma 43 (`#1F2E38 → #2E404B → #45565D`). Accepted.** It is still clearly night: teal-blue, with the lanterns out and your glow the brightest thing. It is what makes the ≥ 45 frame mean reachable. Ivory subtitles on it keep about 10 : 1 contrast. Put the same hexes into `crest.ts` (build condition 2).
3. **Colour sources vs the hero's saturation. No conflict, if one rule holds.** The torches and windows (`#FFB868`) are more chromatic than your ivory core, so "only saturated thing" can't mean chroma alone. You lead on **luminance, bloom area and rim**. The rule:
   - Every colour source is either non-emissive (banana-leaf green, oxblood lacquer, the seasonal tree, the sky) or small and sitting on its own object (a practical).
   - None is brighter than you.
   - None is bloomed beyond its object.
   - None sits within about 300 px of the lock point while you're on screen.
   - On the 5-second reads of stills 4–6, "eye went first" must name you. If it names a lamp or a window, dim that source; don't drop the colour.
4. **D1's posts on b58.75 and 出③ on b35.25. Both accepted.**
   - The camera only arrives in the painting on b58.5 (through the painted gate), so the posts can't appear before b58.75. The picture then follows the reading order of D1 (草棚 → 驴耳 → 驴).
   - b35.25 is the measured bass return in bar 35, where the bass comes back on beat 2 (owner row 26).
   - Both are picture beats inside a scene, and no line time moves. The script's anchor table says "58.5" and "bar 35". That's approximate wording, and the screenwriter can align it in the next pass. It isn't a note.

## Fixes (no re-review; the producer checks them in the file)

| # | Where | Fix | Route to |
|---|---|---|---|
| A | Scenes 34/35 header | Scene 34 reads "b67.5 → b72 · 154.28–**163.34**" and scene 35 "b72 → b74 · **163.34**–169.00", but b72 is **164.47** (163.34 is b71.5). The beats inside are right (lights die b72.0 → 72.25). Change both times to 164.47. | art-director |
| B | Scene 32, E3 label | Show 「约一百卷 · 只有一卷是你」 **on b64.75 with 抄**, as the pull-back starts from your one glowing roll, so 只有一卷是你 lands on the roll while the wall opens around it. Hold it to **b65.75** (2.26 s), when it leaves before the push. Move the stamp change 「— 今天 / 约百卷仿本（余辉估）」 to **b65.0**, so the 抄 beat brings only one new piece of text. If the cut still reads tight, the screenwriter may shorten the label to 「只有一卷是你」, since the stamp already carries 约百卷. | art-director (timing); screenwriter (only if the label text changes) |
| C | Scene 26 stamps | Sync the stamps with v2.3.1 and the producer's decision:<br>• **b46:** 「— 伪满时期 · 长春 / 存于伪满皇宫图书楼」<br>• **b47.5:** 「— 1945年8月 · 长春 / 伪满覆灭」<br>• **b49 (the hit, with V3):** 「— 1945年8月 / 下落不明（伪满皇宫博物院）」<br>**I endorse dropping 长春 on b49.** Next to 下落不明 it would read as "lost in 长春", and C28 lists three unproven accounts, one of them 沈阳机场. The script's line table still shows V3's line 1 as 〃 (which keeps 长春), so the screenwriter should record the decision there too, and both files then agree. Also mark the E4 chip/counter as settled (v2.3.1), not "pending". | art-director; screenwriter (one cell) |
| D | Scene 25, b45.5 → 46 | **One bar carries four events:** two entries ink in, a pull-back, a figure lays you in a box, then the lid and a push into the slats. That leaves 0.57 s for "lays the roll in the box", which won't read (row 77). **Fix:** the b45.5 pull-back reveals the figure already holding the lid over the open box with your glow inside [TOUCH: hands on the lid], and the lid comes down on b45.75. That is one action in two beats. | art-director |

## Build conditions (before the named gate-3 stills go to the owner)

1. **Contact checker: before stills 2, 3, 4, 5, 6 and 8, all of which have people.** Still 1 has only painted figures and can go now.
   - **`tools/contact_check.mjs`:** it renders each person shot's frames with `window.CHECK` and prints PASS or the worst frame.
   - **`rig()` foot logic needs fixing.** It logs only penetration beyond 1.2 % of height, so a planted foot floating 10 px is never caught, and sinking up to about 9 px passes. Required: the **stance foot** (the lower foot, or by gait phase) within **3 px** of `deck(x)` or the floor, whether floating or sinking.
   - **`slopeFeet()` is a vertical shift, not the "2-bone leg IK" the board describes.** That is fine under robes. For figures whose legs show (visitors, cadres, restorers, the guards' lower legs), either solve the leg with IK, or keep their walks within ±500 px of the crest centre (slope < 10°). Add a check that thigh and shin lengths stay within ±3 %.
   - Add seated-hip-on-surface, and hands and feet outside the railing and table rectangles, as the board specifies.
2. **Code catches up with the palette: before stills 2, 4 and 6.** Put `crest.ts` night into the r3 hexes (`#1F2E38 → #2E404B → #45565D`, horizon `#5A5A4C`). Bring `rooms.ts` to the board's interior hexes, or prove the means on the stills: ≥ 45, and ≥ 40 for the named darkest beats.
3. **HUD: before still 2.** Clip the title ink to the band's projected rect and move it with the band, slam and bounce included. Also add E3's per-word red, Q in the end-card slot only, and the V3 stamp's line-2 slam on b49.
4. **Relief ghosts and shadows: before still 3.** Each lifted layer leaves an ink ghost on the base silk and casts a soft dark copy on the layer behind (silk.ts doesn't do this yet; the stage can).
5. **Researcher rows: before the stills that show them.** The White Dagoba is on the 大都 far bank in still 4 (scene 16, P-元). The boat-and-mast composition is in still 1; my crop shows it is already drawn, so the row only confirms it. The 五玺 placement (scene 23), the 封条 (19) and the 1950s lamp (27) are needed before those scenes are built.

## Highest risks now (r1 → r2)
1. **Body logic on the curved deck.** The design is done; the checker isn't (build condition 1). This is now the top risk, because the owner treats it as blocking.
2. **The peak relief** reading as a diorama, not floating cards (still 3). The painter itself is no longer the risk.
3. **Lanterns in the glass.** Mode 9 crossfades B *inside* the pane and draws no edge line. The still 7 test stands: it needs a visible pane edge and the lanterns lighting right → left in the pane before the push, or it reads as a crossfade.
4. **Subtitle over frame 0's busy top-left** (still 1): the corner shading must do real work.
5. **Day glow** (still 5).

## Build order (unchanged from r1)
0. The kit. Build conditions 1 and 3 can run in parallel with still 1.
1. Scenes 01–02 → stills 1 and 2.
2. Scenes 27–28 → still 3.
3. Scene 16 → still 4.
4. The rest of the teaser (03, 05, 06) and the day crest → still 5.
5. WUMEN: 07 → still 7, then 34–37.
6. Scenes 08–13.
7. Scenes 14–21.
8. Scenes 22–26 → still 6.
9. Scenes 30–31.
10. Scenes 32–33 last.

## What must not change (it works)

Everything on the r1 list stands (look, opening, edit, the deliberate departures, the HUD).

**Added in r3:**
- the line map as a verbatim copy of `lines_bars.json`, and the rule that the board never moves a line;
- side-on cameras only, with "tilt" as a vertical pan;
- the one-move peak with three shared sprites, the HUD hidden on b56, and the bridge-match exit;
- the daybreak wipe that changes the standing crowd after the carrier has left right;
- the push from the one glowing roll on the wall into the E4 flip-book, glow on the lock point;
- 偷 on the b64 accent, and the eras one per beat b66–66.75;
- the raised night and interior palette, with the floors 45 / 40;
- one non-competing colour source per scene from 16 to 27;
- seals on the mounting silk until a row places them;
- profiles only; no gloves; reachable props;
- the stills order, gated on the checker.
