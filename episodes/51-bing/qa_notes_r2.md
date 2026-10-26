# Review r2: 古代没有冰箱，夏天怎么吃冰？ rough_v2 — verdict: FIX FIRST (one MAJOR)

Round 1's eleven notes are almost all fixed:
- The counter now lands cleanly.
- The title is fully opaque on the hit (f285).
- 先猜？ plays fairly.
- The hush keeps a floor.
- The palace hall turns cold.
- The peak is one smooth pull-back and one push into a single fridge.

One new problem blocks it. The two new "push into the light" transitions, machine → 1990 window (1:37.6) and grid → kitchen (1:43.45), are whip-zooms that blow out to an almost-white frame. They are the biggest picture jumps in the film, and the owner has asked for no white flashes. Five small leftovers remain: the walker's look changes at 13.5 s, the block leads the walker's body at the hand-off, the buyer still walks through the walker, two crane moves are fast, and the walker now clutters the end card.

**Reviewed:**
- Film: `scratchpad/r51/rough_v2.mp4`, 119.25 s.
- Scanners: run on `scratchpad/r51/pic.mp4`, 3578 frames.

**Evidence:** `/tmp/claude-0/-home-claude/bf206d1e-1152-5595-9b84-b15be6e5a777/scratchpad/qa51r2/`
- `sh/s_00–s_11.jpg`: 2 fps contact sheets of the whole film.
- `out/`: the reviewer sheets and `auto_checks.md`.
- `x/`: full-resolution frame strips and crops.
- `scan/`: glitchscan and stripsig output.

**Owners:** A = Builder A, B = Builder B, S = sound, P = producer.

| # | Sev | Time | What's wrong | Evidence | Suggested fix | Owner |
|---|-----|------|--------------|----------|---------------|-------|
| R1 | MAJOR | 1:37.6–1:38.2 and 1:43.45–1:43.95 | **Both new push-in transitions whip-zoom into a near-white frame.**<br>• Mean frame brightness (luma) jumps from 35 to 199 at 97.77–98.17, and from 30 to 202 at 103.67–103.93. Across the rest of this dark film it sits between 25 and 45.<br>• Frame-to-frame differences reach 35–58, the largest in the film; every other change is 12 or less.<br>• The box and window edges move from about 60 px per frame to over 150 px per frame (quality bar: about 25 or less).<br>• Owner, ep14 v6: "No white flashes on cuts unless asked".<br>• The last 0.2 s of M1's subtitle (97.8–98.0) and the first frames of M4's 「冰箱，」 (103.75–103.9) are white on white.<br>• glitchscan flags 97.70 and 103.60; stripsig flags 97.90–97.97 and 103.43–103.60. | `x/g977.jpg` (f2928–2950); `x/g1036.jpg` (f3100–3120); luma and frame-difference curves from `qa51r2/lowres.npy` | Keep the idea (the box's glow becomes the lit window; the window becomes your fridge's light). Change how it plays:<br>• Make each push an eased move of 0.8–1.0 s or more. The beats around 97.1 and 102.9 leave room.<br>• Let only the glowing rectangle brighten. Keep the frame's mean luma at 70 or below, with no full-frame bloom.<br>• Hand over (match-cut) when the rectangle fills about 60 % of the frame, rather than going through white.<br>• Keep the subtitles on a dark ground the whole way through. | B |
| R2 | MINOR | 0:13.5–0:14.0 | **The walker still changes person mid-scene.** In the chisel pose he wears a short padded coat and trousers. From 14.0 s, hauling the block, he is a long flared robe with a bun, and reads as a woman. This was the cold reader's biggest risk; FIX A4 is not done. | `x/walk.jpg` (12.5–15.33) | Use one costume for both poses: the padded coat and trousers in the haul, or the robe in the chisel pose. Compare the two silhouettes overlaid. | A |
| R3 | MINOR | 0:55.90–0:55.97 | **At the hand-off the ice block arrives before the walker.** The carried block shows at the Song shopfront pillar for about 3 frames (f1677–f1679) before his body appears. FIX A10 is not done. | `x/hand.jpg` | Clip the block to the walker's own layer, or start it hidden until his hand clears the pillar. | A |
| R4 | MINOR | 0:57.6–0:58.2 (also 1:21.4–1:21.6) | **The buyer still walks through the walker.** At 58.0 the two one-tone silhouettes merge into a four-legged blob; FIX B9 is not done. In the hutong, the seller's carrying pole crosses the walker for a few frames at 81.4–81.6. The rest of the hutong is fixed: the figures are apart, and the bowls read as two bowls. | `x/s1.jpg` (57.2–58.2); `sh/s_08.jpg` | Send the buyer out behind the counter, or upstage of the walker on a lower ground line. Keep at least 40 px between figures. | B |
| R5 | MINOR | 1:06.8–1:07.3, 1:15.4–1:15.9 | **The two crane moves are motivated now, but quick.**<br>• Moat → vault drops a whole frame height in about 0.35 s: roughly 60–100 px per frame, with frame differences of 10–12.<br>• Vault → 冰票 window peaks at about 28 px per frame.<br>On a phone the first one strobes. | `x/m67.jpg`; `x/v75.jpg` | Ease both over 0.8 s or more. The drop can start at about 66.6, because the Q4 rows hold until 67.25. | B |
| R6 | MINOR | 1:52.75–1:58.75 | **The walker clutters the end card.** He now stands behind the end card at fridge brightness. His cup touches 「冰？」 in the title, and the question 「你家冰箱里，现在冻着什么？」 runs across his legs. Everything is still readable (the halo holds), but the card is busy where v1's was calm. | `x/endc.jpg`; `x/endcrop.jpg` | Dim him with the card (≈30 %, like the fridge), or let him step out of frame right during 112.6–113.2. | B |
| R7 | MINOR (carry-over, optional) | 0:41.75–0:45.75 | **Counter and stamp still disagree on W1.** The counter reads 战国早期 while the stamp reads 历代 · 据上海社科院 程鹏. | `sh/s_04.jpg` | Show no era on the counter for W1, or change the stamp's first line. | A |

## Round-1 notes: status
| v1 | Status | Evidence |
|---|---|---|
| Q1 counter | **Fixed.** Checked on every frame from 0 to 9.67 s: 2026 (to 1.00), then 清, 明, 宋, 唐, 汉, 秦, then 战国早期 from 1.87, held to 7.50. Then 春秋 7.50–7.97, then 周 from 7.97. There is no snap back to 2026 and no early 周. | `x/counter_runs.jpg` (34 runs, one tile each) |
| Q2 dissolves | **Fixed. Every scene change is now a wipe, a camera move or a match**: 20.5 pillar, 41.0 red pillar, 66.8 crane, 75.4 crane, 78.5 one set with a truck move, 80.6 gate, 97.6 and 103.45 pushes, 105.8 pull-back, 108.0 push. The ×80 tag clears before the wipe, and the walker is never doubled. The 97.6 and 103.45 pushes are the new R1. | `sh/s_02`, `s_04`, `s_06`–`s_10` |
| Q3 先猜？ | **Fixed.** All three options are up from 35.0 to about 36.5. 「肉？」 sits about 160 px right of the head. 酒 lights at about 36.5, and the wine shows only from 37.5, with the J4 line. | `sh/s_03.jpg` |
| Q4 hush | **Fixed to the FIX spec.** The mix never drops below −35 LUFS-M; it is below −30 for only 0.7 s (71.9–73.6, in pieces) and between −24 and −30 for 3.1 s (71.2–74.2), where the stop chord rings under the drips. Still 14–16 dB under the body for about 3 s, so it needs the owner's ear. | `qa51r2/ebu.txt` |
| Q5 整间屋子 | **Fixed.** The hall grades to cool blue with frost on the lattice by 93.5. The mist pours down from the coin holes across the floor. The cable-like loops are gone. | `sh/s_09.jpg` |
| Q6 peak | **Fixed.**<br>• Pull-back: frame differences of 6.3 or less (v1: 16–17).<br>• One fridge throughout, with no second fridge in a dissolve. The glitchscan flag at 108.767 is the P1 → P2 subtitle change: f3262–3264 show the fridge moving steadily.<br>• Lineup labels sit at about y 850, clear of the counter and the J seal. In the wide shot the leftmost prop is about 134 px from the edge. | `x/p1.jpg` |
| Q7 rewind | **Fixed.** A ◀◀ mark about 72 px wide, green → orange leaves, then snow. | `sh/s_00.jpg` |
| Q8 text | **Fixed.**<br>• Q1's stamp note is now 「周人冬天凿冰」.<br>• The Q rows sit about 38 px below the stamp.<br>• Tags use a feathered scrim, not a box.<br>• The ×80 tag clears the walker's head.<br>• Stamp notes are 28 px, per the producer's FIX (I had suggested 36). | `x/q1st.jpg`; `sh/s_01`, `s_02`, `s_07` |
| Q9 actions | **Partly fixed.** The rope haul in Q1 is now drawn (thin) and the hutong is fixed. The S1 buyer is not (R4). | `x/walk.jpg`; `x/s1.jpg` |
| Q10 scope | **Fixed.** The grid is labelled 「农村」 in 1990 and 「全国 · 城乡」 in 2024, and both value panels show together. | `sh/s_10.jpg` |
| Q11 last line | **Fixed.** P2's subtitle sits on the dark wall. The kitchen grades cold, snow falls, and the frost blooms through the air beat. | `x/p2end.jpg` |

Other FIX items checked on the frames:
- Title f285 is fully opaque at scale 1.10, and f286 is at 1.0. The jolt and snow gust follow.
- The fridge-door ghost at 27.6–28.3 is a blue door panel at about 35 %.
- The ice-cream cone ghost is solid at 55.0.
- The vault stack goes from 6 rows to 2.
- 「约2/3 化掉」 is large (about 96 px) and held through C3. The gauge is labelled 存冰.
- The 冰票 window is lit and the slip is large.
- The grade blocks step 1× / 2× / 3.5×.
- 冰雪冷元子 is gone after the vermilion wipe.
- The end-card J seal lands on f3383.

## Automatic checks (v2)
- **Format:** 1920×1080, 30 fps, 119.25 s, 37.9 MB.
  - Video is 2.28 Mbps. This is a rough encode; the final script makes the crf 17 master.
  - The mux again has 3577 video frames (pic.mp4 has 3578): the last fade frame is dropped. Harmless.
- **Loudness:** −14.05 LUFS integrated, true peak −2.2 dBTP, LRA 4.0.
- **glitchscan (pic.mp4):** three suspects.
  - 97.70 and 103.60: real (R1).
  - 108.767: false positive (subtitle change during a steady push).
- **stripsig:** no duplicated-strip glitch in any of the hits.
  - 21.47–22.17: the symmetric pit section, a false positive.
  - 75.57–75.60: the crane (R5).
  - 97.90–97.97 and 103.43–103.60: R1.
  - 113.10–113.17 and 119.10–119.23: the end-card and final fades.
- **Black and cuts:** no black frames. The only hard cut is the intended fridge-light cut at 2.73.
- **Pace:** unchanged and passing. Waiting is 3 %; the CHECKs are only the title, 先猜？ and the end card.
- **Subtitles:** all 36 lines in `lines51.ts` match `lines_read.json` verbatim (ASCII → curly quotes).
- **Banned wording:** none of 硝石, 最早, 凌人, 2400年前 without 多, 冰酪, 杨国忠 or 「Juno 出品」 appears in the qq51 sources.
- **Corners** (measured in pixels at 20, 50, 80 and 102 s): all pass.
  - Seal: 124 px from the right, 60 from the bottom.
  - Counter: 152 px from the left, 62–68 from the bottom.
  - Stamp: 160 px from the right, 64 from the top.
- **Centring:** title card and Q rows were not re-measured in r2. End-card lines are 959–961.5, except the sources rows (955 / 966, as in v1).
- **End card:** contains the J seal, gold title, question, follow pill (from 114.6) and the sources line, which matches script.md. The counter, stamp and corner seal are hidden.

## Not checked / can't judge
- **The hush and the SFX by ear:** whether 3 s of ring still sounds like the music broke on a phone speaker. Owner row 50 is the test.
- **Motion between samples:** judged from 2 fps sheets, the frame-difference curve, phase correlation on the cranes, and full-frame strips at each transition. Not every frame of every wipe was viewed.
- **Key frames:** this cut was not compared against KF01–16.
- **Final encodes:** the crf 17 master and the 1.6 Mbps send versions were not reviewed.
