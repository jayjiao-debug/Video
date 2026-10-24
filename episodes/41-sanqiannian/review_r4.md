# Review: 《为了跟你说一句话，人类努力了三千年》 v3 r4 — verdict: FIX FIRST

The new ending works. It answers the cold open: the same 23:47 phone, the call connects, the dive through the window lands on the song's hit (measured onset 200.24 s), and the cast with the caller stand on the hill under the Juno end card. Twelve of the 16 picture/sound notes are fixed, and so are all three story notes. Two of the owner's own notes still show up as render glitches, though, so the film can't go out yet. Du Fu's writing arm still flickers (it's worse now: a dark slab appears over the paper), and the black shape in the 商 close-up is back for one frame. Both look like the same per-frame, non-deterministic render problem. The 1860 voice is cleaner, but on measurement it is quieter in the band a phone speaker plays.

Film: `scratchpad/farm/r4_mux.mp4`. 1920×1080, 30 fps, 215.33 s, −14.0 LUFS, peak −2.33 dBTP, 6.31 Mbps video, 176.7 MB.
Evidence files are in `/tmp/claude-0/-home-claude/bf206d1e-1152-5595-9b84-b15be6e5a777/scratchpad/rev4/` (written below as `rev4/…`).

## MUST (fix before the owner sees it)

| # | Time | What's wrong | Evidence | Fix |
|---|------|--------------|----------|-----|
| 1 | 0:46–0:50 (45.8–50.1) | **Owner note 6 is NOT FIXED: Du Fu's hand still flickers.** The arm and brush pop between two poses frame by frame. A second writing arm with its own brush appears on single frames: 46.3, 46.5, 46.7, 47.07, 47.10, 48.0, 48.1, 48.3, 49.3 and 49.4 (at 48.0 there are two brush hands on the paper at once). On 47.17, 47.20, 47.33 and 47.37 a hard-edged dark rectangle covers the lower half of the letter. r3 flickers on *different* frames, so the bug is non-deterministic, not in the animation curve. | `rev4/dufu_dense.jpg` (every 0.1 s), `rev4/dufu_block.jpg` (every frame 47.0–47.37), `rev4/f/r4_48.00.jpg`, `rev4/f/r4_47.20.jpg`; r3 for comparison: `rev4/dufu_dense_r3.jpg` | Find what changes per frame or per worker. Likely suspects: an image layer not awaited with `delayRender`, an unseeded `Math.random`, `Date.now()`, or two arm sprites toggled by a float compare. Render 45–51 s on one worker. Then run a one-frame-outlier scan (diff to both neighbours vs the neighbours' diff to each other): it must find nothing between 45 and 51 s. |
| 2 | 0:31.300 (frame 939) | **Owner note 3: the black shape is back for one frame.** A 425×285 px black rectangle sits behind the bone at x 435–860, y 740–1025. Every frame from 31.10 to 31.50 is clean except this one, so it reads as a flash. Same signature as #1. | `rev4/f/frame939.jpg`; `rev4/outl.jpg` row 4 | Same root cause as #1. After the fix, scan the whole film again. My scan of r4 found only #1, #2 and the intended flashes (2.5, 3.3, 4.0 year montage; 63.7–64.0 day/night; 110.3 spark). |
| 3 | 1:20–1:26 (80.6–85.7) | **Owner note 8 is only PARTLY done: the 1860 voice may now sound *quieter* on a phone.** Compared with r3 at the same seconds, the denoise worked (above 5 kHz it is down 8 dB) and the music dip is in. But 300–3400 Hz energy is 1–3 dB *lower* than r3 (81 s: −31.6 vs −28.7 dB RMS) and about 9–11 dB below the narrator around it (−19.5 to −20.5 dB). About 99 % of the clip's energy is a ~146 Hz component, and a phone speaker barely plays 146 Hz. Likely cause in `build_v3.py` line 51: the clip is matched on its speech band and then capped by `min(1, 0.6/pk)`. The 146 Hz peaks hit that cap, so the band match never takes effect. **Not heard: there is no audio playback here.** | 300–3400 Hz RMS at 81 / 82 / 83 / 84 s: r3 −28.7 / −26.9 / −27.6 / −29.7 dB, r4 −31.6 / −27.7 / −28.3 / −31.6 dB. Narration at 77–79 s: −19.5 to −20.5 dB. r3 audio is from the delivered r3 master (`rev4/r3_master.mp4`, md5 80ed564d…). In the source `audio/vo07/CQ_cut.mp3`, 100–150 Hz holds −0.4 dB of the total energy. | Cut the 146 Hz component by about 6–8 dB (steeper high-pass or a notch) *before* the speech-band match, so the 0.6 cap doesn't bind. Then aim the 300–3400 Hz band at about narrator −3 dB. Listen on a phone speaker before sending. |

## SHOULD

| # | Time | What's wrong | Evidence | Fix |
|---|------|--------------|----------|-----|
| 4 | 0:35.93 | **Owner note 4 is PARTLY fixed.** The big jump at 34.87 is gone, but at 35.933 the colour around the fire still jumps in one frame, from RGB (159, 94, 52) to (197, 125, 70). It goes dim and then pops back. r3 had the same step (128→187). | `rev4/fire_cut.jpg` (35.90 vs 35.93); per-frame edge colours measured | Ramp the surround over the cut (8–10 frames), or match the incoming plate's edge colour to the outgoing one on frame 35.900. |
| 5 | 3:08–3:11 (188.0–191.5) | **3.5 s with no music, and the last 0.8 s is digital silence (−56 to −61 dBFS, 190.7–191.5) over a still dot.** The coda stops at 188.04. 「可人类，还是把它寄了出去」 ends at 190.68. Then there is nothing until the intro's own 0.55 s lead-in ends at 191.5. Owner-notes rows 50 and 91: "sounds like the music broke" and "a silent gap plus frozen picture reads as the video lagging". Your camera creep fixes the picture, not the sound. | RMS every 0.1 s, 187.5–192.5 | Put a soft phone ring-back tone (嘟——, in the song's key) into 189.5–191.5. It is the motivated sound for "the point becomes the ringing phone", and it makes the match in #10 read. Or extend the coda's reverb tail through the gap. |
| 6 | 3:22–3:34 (202–214) | **The caller on the hill reads oddly. He is the film's last image, held about 12 s.** His head, hand and phone merge into one blob with a spike on top. No arm reaches up to the ear, and the phone glow is a slab inside the head. Also pre-existing from r3 (not flagged then): the first five relay figures hang their heads forward and down with no visible neck, while the star is above them. | `rev4/caller_hill.jpg` (2.5× crops at 202.6, 205, 209, 213); `rev4/f/cast_crop.jpg`; `rev4/f/r4_212.50.jpg` | Pose the caller like the bedroom: near arm bent, elbow down, phone at the ear, the glow on the phone. Make him slightly larger or rim-lit so he reads at phone size. Tilt the first five heads up toward the star. |
| 7 | 3:26–3:30 (206.5–209.84) | **The title comes in over the narration.** 「为了跟你说一句话，人类努力了三千年。」 fades in at 206.5, while 「想跟够不着的人，说一句话。」 and then 「现在，这句话，只要一秒钟。」 are still being read: two texts to read at once. The owner's plan was narration first, *then* the title and the question. | `rev4/end_b.jpg` tiles 206.5–209.5 | Bring the title in at about 209.9, when N5 ends. Move the question and the O3 voice about 1 s later; the end card has room. |
| 8 | 3:15–3:20 (195.4–199.9) | Bedroom (owner note 16 is FIXED: flat vector style, mean luminance 20/255 vs 18.7 in the cold open). Two details: the caller's free hand floats about 40 px above his knee and touches nothing (owner-notes row 74), and the bed and wall are almost black, so on a phone it's a dark blob with a window. | `rev4/f/caller_crop.jpg` (brightened); `rev4/f/r4_196.50.jpg` | Rest the hand on the knee or the bed edge. Lift the wall and bed a few levels; keep the window the brightest thing. |
| 9 | 1:41–1:42 (101.3–102.2) | Watson listens to the receiver held at chin/chest height in front of his face, not at his ear. This is the same logic slip as the r2 1977 note. Pre-existing. | `rev4/f/r4_101.30.jpg`, `rev4/f/r4_102.00.jpg` | Receiver to the ear, cord hanging from it to the wall knob. |

## NICE

| # | Time | Note | Evidence |
|---|------|------|----------|
| 10 | 3:10.9–3:11.6 | The point → phone match is exact in position: the dot is the centre of the 妈 avatar ring, (157, 52) on the 320 px sheet in every frame. But it is a plain 0.6 s dissolve. Grow the dot into the ring and start the ring pulses from it, ideally on the ring-back tone from #5. Then the match reads in one glance. | `rev4/match.jpg` (every 0.1 s, 189.9–192.2) |
| 11 | 0:04.8–0:05.1 | A pure-black vertical slab, the edge of the plate, sweeps out of the right edge. It is 127→9 px wide and runs from the top of the frame to the roofline. Pre-existing (r3: 104 px at 4.75). | `rev4/coldopen_45.jpg`, `rev4/f/crop_5_right.jpg` |
| 12 | 1:43.37–1:43.87 | The whip-pan from Watson's room to Bell's shows a pure-black void between the two rooms, the plate's end (owner asked about the room plate seams). Pre-existing. Put a wall or door jamb there, or make it one continuous wall. | `rev4/watson_tr.jpg` |
| 13 | 2:58.95–2:59.25 | Record → Voyager is a double exposure: the big record and the small record on the bus are visible at once. A single continuous pull-back would be cleaner. | `rev4/tr_record.jpg` row 3 |
| 14 | 1:39.8–1:40.9 | Inside the wire, the white wave ring jumps between two radii on alternate frames (a 15 Hz strobe). Pre-existing and identical in r3. Slow its phase. | `rev4/outl.jpg` row 3 (100.00 / 100.03 / 100.07) |
| 15 | 2:34.9–2:35.1 | For about 4 frames the email light sits on the wall beside the window before it is outside. Let it pass through the window opening. | `rev4/bj_win.jpg` |

## Owner notes on r3: status in r4

| # | Note | Status | Evidence (r4 time) |
|---|------|--------|--------------------|
| 1 | Circle in the lit window | **FIXED.** The wire ends at a knob left of the window. | `rev4/f/r4_5.00.jpg` |
| 2 | Bell listening / glass of water | **FIXED.** The funnel is at his lips, the rings run from the rim into the throat (95.4–98.6), and the small acid cup sits under the needle (8.0, 97.0). | `rev4/bell_rings.jpg`, `rev4/f/r4_8.00.jpg`, `rev4/f/r4_97.00.jpg` |
| 3 | Black shapes, 商 close-up | **NOT FIXED.** Clean on every frame except 31.300, where the black rectangle flashes. | MUST #2 |
| 4 | Fire-to-fire colour jump | **PARTLY.** One step remains at 35.933. | SHOULD #4 |
| 5 | Birds hidden by the beacon | **FIXED.** The birds rise in front of the tower top (41.9–42.7). | `rev4/birds_zoom.jpg`, `rev4/birds.jpg` |
| 6 | Hand flicker, Du Fu | **NOT FIXED** (now also a dark slab). | MUST #1 |
| 7 | Label text outside the box | **FIXED.** "Académie des sciences" fits, and the year runs 1860 → 2008 before the cut (78.8–79.8). | `rev4/f/r4_79.00.jpg`, `rev4/label_counter.jpg` |
| 8 | 1860 voice clearer | **PARTLY / not verified by ear.** | MUST #3 |
| 9 | Moon on Bell's head | **FIXED.** The Paris moon stays put and becomes the moon in Bell's window. The room irises open from it with Bell below the sill (90.7). No roofs over the room. | `rev4/dissolve.jpg` (every 0.1 s, 89.4–91.7) |
| 10 | Wire disconnected | **FIXED.** The pole and wire are continuous through the whole push (91.5–99.0); at 99.0 the pole runs past the bracket to the table. | `rev4/wire.jpg`, `rev4/wire2.jpg` |
| 11 | Watson's door / painting | **FIXED.** No door; a framed landscape on the wall. He puts the receiver on the table (102.4) and exits left (102.6–103.0). The pose is SHOULD #9. | `rev4/watson_exit.jpg`, `rev4/f/r4_102.80.jpg` |
| 12 | Marconi window goes flat | **FIXED.** The room stays visible in the window all the way out (110.8–114.0). | `rev4/marconi.jpg`, `rev4/marconi_win.jpg` |
| 13 | Room → street → Wall | **FIXED.** One move: the light leaves the CRT and goes out the window (154.6–155.1), over the hutong (155.1–156.5), up into the sky (156.5–157.7) and down to the Wall (157.8–158.3). Nit: NICE #15. | `rev4/bj_a.jpg`, `rev4/bj_b.jpg` |
| 14 | Light leaves the wall suddenly | **FIXED.** It runs the ridge (158.3–159.9) and rises in one arc to a star (159.9–160.4), then match-cuts to the 1977 moon (160.7). | `rev4/bj_b.jpg` |
| 15 | 「和身体的声音」 | **FIXED.** The subtitle is 「唱片上，还录着她恋爱时的脑电波。」 (176.59–179.81); the voice O1c runs 176.61–179.45 inside it. Wording not heard. Backed by facts V3. | `subs3.ts`, `lines_v3.json` |
| 16 | Anime bedroom style | **FIXED.** Flat vector, the same look and luminance as the cold open. Details: SHOULD #8. | `rev4/f/r4_196.50.jpg` |
| S1 | Ending answers the opening | **FIXED in structure.** Polish items: SHOULD #5–#8, NICE #10. | `rev4/end_a.jpg`, `rev4/end_b.jpg`, `rev4/dive.jpg` |
| S2 | Turtle shell ↔ communication | **FIXED.** The three lines are on screen 19.21–34.39 and voiced. The subtitle splits sit in the voice pauses (31.57/31.65 is 0.17 s after the voice resumes: fine). | `rev4/shang_close.jpg` |
| S3 | What's special about the Golden Record | **FIXED.** Letter → brain waves → greeting → 没人知道 → 寄了出去, all voiced, with the splits in the pauses. | `rev4/end_a.jpg` |

## New ending, 172.64–215.33: checks

- **Order:** 1977 room → push into the moon → the moon becomes the record (172.6→172.7) → the record pulls back onto Voyager (179–180) → Voyager recedes to a point (184.5–186) → hold → point → phone (191.0–191.6) → the call connects, 00:01 at 192 → bedroom (195.4) → dive through the window (199.8–200.6) → sky, tilt down to the hill (201–202.3) → end card (210–214) → fade (214.3–215.3). Every step is there and in order.
- **Point → phone match:** exact in position and readable, but plain (NICE #10).
- **Bedroom style:** matches the cold open (note 16 FIXED). Hand and darkness: SHOULD #8.
- **Caller's pose and phone:** right in the bedroom (phone at the near ear, elbow down). Wrong on the hill (SHOULD #6).
- **Subtitles vs voice:** every ending split falls in a voice pause. N4: 204.26/204.34, in the pause 203.91–204.11. Greeting: 182.71/182.79, in 182.55–182.91. All lines end after the voice. O3 「你最想对谁说一句话？」 is voiced 210.03–211.99 with the card's question.
- **Music** (measured against `build_v3.py` spans; joins at 172.63, 188.04, 190.93):
  - The coda stops at 188.04 and rings out under G3. ✓
  - The intro returns with the call: the song's 0.55 s lead-in, audible from 191.5 while the phone dissolves in. ✓
  - The hit onset is at **200.24**, the same hit as the cold open's 9.31, while the camera crosses the window glass at 200.2–200.3. ✓
  - The fade runs 212.3 → 215.3 (−21 → −56 dB) under the picture fade, after O3. ✓
  - Gap problem: SHOULD #5.
- **Loudness:** the integrated level is −14.0 LUFS and the peak −2.33 dBTP. The phone call (192–199.5) sits 3–6 dB under the body: intentional, and within owner-notes row 50's ~6 dB. The only digital silences in the film are 0.0–0.4 (the song's own lead-in), 190.7–191.5 (#5) and the final fade.
- **Static stretches:** apart from the two you already know about (188.3–190.9 and the hilltop), only 210.5–213.9 is flagged, which is the end card.

## Automatic flags checked on frames (not problems)
- Black frames at 1.27–1.40, 18.93–19.33 and 72.80–72.97 are the intended iris, title → crack and wire → trace transitions, the same as in r2.
- The one-frame "glitches" at 10.37 and 10.77 are the rewind flashes.
- The pace "TOO FAST" flags (29.6, 45.5, 91.1, 104.4, 119.9, 204.3) are all voice-locked lines; the subtitle follows the voice.
- facts.py flags 万两 (the poem's own translation) and 十九 (1825 → 1844, MO rows). Both pre-existing and fine.

## What works (keep)
- The bookend: the same 23:47 phone. The point of light lands exactly on 妈's ring, and the intro and its hit come back as in the cold open.
- The Bell sequence: the moon iris (90.6–91.6), the speaker into the funnel with rings, the dive into the wire, Watson's room with the painting.
- Beijing → Great Wall → star → 1977 moon as one unbroken move.
- The Marconi window holding the room all the way out, and the 148-year counter.
- The end card: J monogram, follow pill, sources and the First Sounds CC BY credit, all centred (the question's ink centre is at 961 px).

## Not checked / can't judge
- **Nothing was heard.** There is no audio playback or speech-to-text here. The wording of every voice line, the 1860 clip's quality, and the ring-out's taste were judged only by levels, spectra and voice-activity timing.
- **Coverage:** your 1.5 s sheets r4s_0–5, plus about 450 targeted frames (every 0.1 s on Du Fu, the dissolve, Beijing, the match and the dive; every frame where it mattered), plus a whole-film one- and two-frame outlier scan of r4 and r3. I did not open the 26 auto sheets in `rev4/auto/` one by one.
- **Facts:** only the new lines were checked (V3, V5; the 商 framing is a simplification of SH2's 帝).
