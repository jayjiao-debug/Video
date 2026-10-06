# Gate 2a notes: 鸡皮疙瘩 looks A/B/C — verdict: REVISE (one shared fix, ~15 min), then show the owner all three

Round 1. Inputs: looks.md, style/looks_sheet.png, lookA/B/C_hook.png and _key.png (all opened), coldread_gate1.json
(5-second reads), references/looks.md, owner-notes.md (all rows). I do not pick for the owner. The ranking is below.

**Build check (Remotion, 2D only):**
- A: SVG rects and paths plus RMS JSON. Trivial to build.
- B: Canvas 2D, ~900 strokes per frame. Buildable if the hair layout uses a seeded random so each frame is deterministic.
- C: SVG paths, pattern halftone, `mix-blend-mode: multiply` (2D), and feTurbulence rendered once to a texture. Buildable.
- None needs CSS 3D. **All pass.**

**Phone check (film ≈ 1/4 of the screen):**
- A **passes**. The orange drop clip, the scissors and 起鸡皮疙瘩 (≈ 80 px) read. The 吸气 gap is too thin and grey (fix A1).
- C **passes**. It has the biggest shapes and type (屏住呼吸 110 px) and one clear silhouette.
- B **passes only with fix B1**. The key visual is 1–2 px hairs that read as a bright patch / rain streaks. The waveform ribbon, where every live edit happens, is ≈ 10 % of the frame height (≈ 25 px tall on a phone), so the edits would not be legible as drawn.

**Differ / repeat check:**
- The three come from different worlds: a DAW timeline, skin, and a fairground poster. At least one is bold (B; C is also a risk).
- None is navy+gold, and none is ep12's green phosphor scope.
- B's glowing light waveform on a dark field is the nearest cousin to the scope in feel; say so to the owner.
- references/looks.md has no numbers for any non-navy look yet. Its one finding is that 2s跳出 tracked the opening line, not the look. So the ranking leans on the cold read and the owner notes, not on data.

Scores (gate 2a covers visual + info design), per look:
- **A:** visual 3 · info 4. Clean and exact, but generic and cold. The cold reader read it as a "剪映 tutorial". The build bars are as tall as the drop bars, so the loudness difference doesn't show.
- **B:** visual 4 · info 2. Distinctive mood, felt in the arms. But the edit layer is tiny and the hairs need their label to read.
- **C:** visual 4 · info 3. Distinctive and serves the idea (the cart hanging on the crest *is* "waiting"). The consequence of each cut reads at thumb speed. The edit itself is not shown, and the yellow "energy" fill plunges at the drop, which contradicts the audio (#30: maximum amplitude at the drop).

## Ranking (one line each)
1. **C · 过山车 Riso Coaster.** It has the best 5-second read (the cold reader would stop on it and "gets the whole film in one second"). It is the most legible on a phone and the only look whose picture *is* the takeaway (等待 = the crest). Every demo reshapes the track, which is exactly the owner's ep11 ask: "change one input, show the outcome flip". It needs C1–C6.
2. **A · 白色剪辑台 Daylight Edit.** It makes the **live edits most legible**: the exact clip that is cut, moved or filtered, frame-synced to the sound. It is the safest build. But the first frame is grey and cold, and it risks reading as an editing tutorial in the feed.
3. **B · 汗毛起立 Goosebump Field.** It is the boldest and most physical and stands out in a feed. But the edits, which are the format, are the smallest thing on screen. The hairs need a label and close-ups to read. Skin texture reads "slightly gross/medical" to some (cold read; owner's ep6 rule on body parts that read oddly).

**Owner's format idea ("real-time changes on the bgm"):** A makes the edit itself the most legible (you see the scissors cut the clip as the sound stops). C makes the *result* most legible (the track goes flat, the crest gets longer), and with fix C1 it shows both. B makes the edit least legible.

| # | Sev | Where | Note | Route to | Owner note it relates to |
|---|---|---|---|---|---|
| 1 | **High** | All three key frames (+ hook subtitles) | Before the sheet goes to the owner: the key frames say **没了** (A "没了", B "躺平"/hairs all flat, C "平着开：没了", placeholder subtitle "鸡皮疙瘩就没了"). That contradicts facts #19/#34 (≈ 30 % fewer) and the script's rule that the meter never hits zero. The cold reader caught it on all three. Change the labels to describe the *music*, not zero chills (A "高潮那段：已删除" + a meter that sags but stays above zero; B: some hairs still standing; C **"平着开：没冲下去"**). Replace the placeholder subtitles with the real lines (hook: "听歌起过[鸡皮疙瘩]吗？"; key: "删掉那一段，鸡皮疙瘩[少了约三成]"). Re-render the sheet. | art-director | "只有我过得不好…误导" (no picture whose plain reading isn't true) |
| 2 | — | Look C, if chosen (fixes for the storyboard) | **C1 · show the edit literally.** Add a per-bar RMS clip strip along the ground line (≥ 140 px tall at 1080p). Its playhead is frame-synced to the audio, and the cart's position along the track = the playhead. The scissors / slide / filter act on this strip at the exact frame the sound changes, and the track above reshapes in the same frame. | art-director | "让观众能看到…变化" (ep11); brief "on-screen indicator of what is being changed" |
| 3 | — | Look C | **C2 · fix the energy contradiction.** Define the track's height as 紧张/期待 (label it once), not loudness. The yellow halftone must not be "the music's energy", because it plunges where the music is loudest (#30). Either drop that claim, or make loudness = halftone density/brightness (densest at the drop, independent of height). Key the plunge to the measured drop frame so the title slam rides the plunge. | art-director | rubric 3 (one frame says what the scene means) |
| 4 | — | Look C | **C3 · design Demo 4 (闷住) now.** It has no coaster analogue yet. Proposal: the highs = the fluorescent pink ink. Muffling drains the pink overprint to dull blue/grey on the affected bars, and the payoff sweep re-inks it bar by bar. Show 920–4400 Hz on a small frequency strip, *inside* the removed region (an 800 Hz low-pass removes that band and more, so don't draw it as "exactly this band"). | art-director | — |
| 5 | — | Look C | **C4 · compression.** Halftone and grain are the costliest texture for the encoder at the ~2 Mbps delivery (owner note 10-05). Use a halftone pitch ≥ 12 px at 1080p, keep the grain a *static* texture (not re-randomised per frame) at low opacity, and move the halftone layer under pans rather than regenerating it. Test-encode a 5 s pan at delivery bitrate and check for moiré/mush before building scenes. | art-director, animator | "低质/批量" restriction; ≤ 28 MB delivery |
| 6 | — | Look C | **C5 · not kids-edu** (cold read). Keep the riders as three faceless dots (no faces, no hands, no sparkles or cartoon eyes). Keep the rough riso edge and overprint, which make it a poster and not a cartoon. Keep type in Noto Sans Black at the frame sizes (headline ≥ 70 px, timecode ≥ 56 px). The hook frame's 01:21 is ≈ 44 px; raise it. | art-director | ep6 hands rule; "fill the frame / bigger type" (ep11) |
| 7 | — | Look C | **C6 · first second.** On frame 0 the cart is already climbing, and the first build hit (0.5 s) gives it a visible jolt, so something moves on the music inside the first second. Plan it in the storyboard. | art-director, animator | "开头的冲击力度有点弱" (ep11) |
| 8 | — | Look A, if chosen | **A1** Make the 吸气 gap the hero: ≥ 120 px wide, darker outline, label ≥ 40 px (Demos 2/3 live in it). **A2** Show the energy difference: as drawn, the build bars are as tall as the drop bars. Use the per-bar RMS in dB scaling that looks.md promises. **A3** A first frame that is not a tutorial: larger scale (the clip row fills ~80 %), the orange drop already pulsing on frame 0, and fewer grey UI cues. | art-director | "把视频变得更有开头" (ep9); ep11 fill-the-frame |
| 9 | — | Look B, if chosen | **B1** Ribbon ≥ 220 px tall (≥ 20 % of frame height) during every demo. **B2** Fewer, thicker hairs (~300, 3–4 px strokes) and push-ins for the big moments, so the hairs read without the label. **B3** Seeded randomness and a 2 Mbps test-encode (900 moving strokes compress badly). **B4** Stay on texture: no pores or bumps that read as a rash. | art-director, animator | ep6 "手好奇怪" (anatomy that reads oddly); "低质" restriction |

## What must not change (it works)
- The shared engine layer in all three: the subtitle band at y 820–960 (white Noto Serif Bold on a dark band, also on the light looks), the corner mark, the clear top-left with its chapter label, the Juno end card, and gold only on the end card.
- Waveforms/energy computed from the real bgm.mp3, with per-bar RMS in dB (not the raw brick-limited slab).
- C: the cart on the crest under the halftone sun on frame 0; the cut-and-roll-flat key frame (it is the cold reader's favourite key frame); the three-ink palette (#F2ECDF / #FF48B0 / #0078BF / #FFE800), which is far from navy and from phosphor.
- A: the 保留 vs 删掉 stacked tracks and the hatched 已删除 gap, which is the clearest single-frame read of a cut. Reuse this grammar inside C1's strip if C is picked.
- B: the "汗毛·躺平" wording (the cold reader smiled). Keep it if B is picked, with partial hairs per note 1.
