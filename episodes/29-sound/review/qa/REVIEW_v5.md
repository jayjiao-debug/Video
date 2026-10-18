# Review: 为什么好听？ v5 (上传版, 2:51.5) — verdict: FIX FIRST (0 BLOCKER, 3 MAJOR)

The new owner requests mostly land. The remix drop and the recap now sit on real downbeats. The struck notes pulse in sync with the audio. The title still bursts on the drop frame.

Three problems stop it being final:
- **The ending sags.** There are about 2.6 s of empty frame, and after that the end card gets only about 2.7 s of readable time, over silence.
- **Scene handovers.** About ten of them still show the old scene's objects under the new one, which breaks the standing "props leave first" rule.
- **Phone speakers.** Neither drop is louder than the bar before it on a phone speaker.

Inputs:
- Master: `scratchpad/为什么好听_v5_上传版.mp4`
- Subtitles: `review/lines_v5_filmtime.json`
- Facts: `facts.md`
- Source: `Film29.tsx` (10:50), `timing29.json` (film = song + 3.163)

Evidence is in `review/qa/v5/`:
- `sheet_01–15.png`: 90 frames, every 5 s and the middle of every line.
- `z_*.png` strips: frame-accurate. The frame number is printed under each frame.

## Fix list (ranked)

| # | Sev | Time | What's wrong | Evidence | Suggested fix |
|---|-----|------|--------------|----------|---------------|
| 1 | MAJOR | 2:44.8–2:51.5 | **Empty ending, then a rushed end card.**<br>• **Empty stretch:** the wave has dissolved by 2:45.6. From 2:44.8 to 2:47.4 the frame is empty: 79 frames with lit pixels under 0.1 %, mean luma 10 (film mean 19), no subtitle. That breaks the "no blank frames" rule.<br>• **Card start:** the card starts at 2:46.4 and builds slowly. The question is fully on only from ~2:48.8, which leaves ~2.7 s to read 17 characters. The follow pill (26 px) gets ~2.0 s and the sources (18 px) ~1.5 s.<br>• **Silence:** the audio is below −45 dB from 2:48.9 (probe: silence 168.87–171.71), so the question appears in silence. | `z_end_161-172.png` (164.4–167.4 empty; 168.0–171.43 card)<br>probe.json `silences` | Start the end card at ~2:44.4, when the wave starts to break.<br>• Let the breaking particles fly into the card's own wave motif (a match cut instead of a dissolve to nothing).<br>• Keep the break to ~1 s.<br>• The card then gets ~7 s: the question is readable for ≥ 4 s, while the outro is still audible. |
| 2 | MAJOR | 0:02.9, 0:41.1, 0:51.3, 1:03.1, 1:18.3, 1:56.6, 2:21.4, 2:22.9, 2:26.6, 2:28.3 | **The old scene is still on screen under the new one,** for 0.2–0.5 s each. The brief lists this as a standing rule, and the owner called it a "big nono" in ep28.<br>• **0:02.9–0:03.5:** the card's head shows through the first wave. The orbit flattens into a line but never becomes the wave.<br>• **0:41.1–0:41.5:** spectrum bars under the stage.<br>• **0:51.3–0:51.6:** the 8× waves under the binaural head.<br>• **1:03.1–1:03.4:** binaural head over the age spectrum.<br>• **1:18.3–1:18.6:** precedence diagram under the Shepard rings.<br>• **1:56.6–1:56.9:** harmony waves under the sad head.<br>• **2:21.39–2:21.7:** two heads (sad and recap) overlap on the remix drop.<br>• **2:22.9–2:23.3:** the drop head under the recap spectrum.<br>• **2:26.55–2:26.75:** spectrum bars and the "3000 Hz" label under the recap stage, with the label sitting on the right blue orb.<br>• **2:28.3–2:28.4:** double head (stage head plus the rising rings head), reading "L L / R R". | `z_card_0-4.png` (3.00–3.45)<br>`z_cancel_41-46.png` (41.40)<br>`z_dips.png` (51.35, 63.27, 78.47, 116.77)<br>`z_melt_130-143.png` (141.40, 143.10)<br>`z_recap_143-154.png` (146.65, 148.30)<br>`z_crops_overlap.png` (146.65) | Make each handover a real morph of one shared object, or end A's fade before B's begins (out, then in, within ≤ 0.15 s, with the air particles still moving so it never blinks).<br>• **0:03:** let the orbit line actually *become* the wave: draw the wave path from the flattened orbit, and shrink the head into the wave's centre before the wave is fully up.<br>• **2:21.4:** swap the sad head for the recap head on the burst frame, at the same x/y/scale, with no overlap window.<br>• **2:22.9:** end `dropK` at R0 − 0.2.<br>• **2:26.6:** drop the spectrum bars into the stage floor before the stage fades in.<br>• **2:28.3:** hide the Stage's own head while the rings head takes over. |
| 3 | MAJOR | 1:24.2, 2:21.4 | **On a phone speaker neither drop hits.**<br>• **Headphones:** the title drop is a clear jump (RMS −18 → −8 dB at 1:24.20).<br>• **Phone speaker** (300 Hz high-pass, mono, 200 ms windows, relative to the whole film): the title is +2.0 dB at 1:24.2, against +3.1 one second earlier (1:23.0). The loudest window of the film is 1:56.4 (+7.9). The remix drop is −2.7 dB at 2:21.4, under the film average.<br>• **Owner's rule:** "the hardest drop is the title" (ep11). Most Douyin plays are on speakers.<br>• This agrees with `review/music_review_v5.md` MAJOR 2. | Measured on the master's audio (method above) | This one belongs to the music side.<br>• Pull the last bar before each drop down 2–3 dB in the 300 Hz–4 kHz range rather than full-band.<br>• Reduce limiter gain reduction on the drop bar (3.9 dB now).<br>• Let the drop's mid band jump at least +4 dB on the phone curve.<br>• Re-measure with the same phone weighting. |
| 4 | MINOR | 0:41.4–0:48.0 | **Text collisions in the stereo stage.**<br>• **0:41.70:** 这里空了 is written over the fading 鼓·贝斯 for ~0.3 s.<br>• **0:41.45:** 主旋律 sits about 4 px under the header line.<br>• **0:45.5–0:48.0:** "≈ 363 Hz" runs onto the right blue source orb ("Hz" over the glow) for 2.5 s. | `z_crops_overlap.png` (41.45, 41.70, 46.80) | Fade 鼓·贝斯 out before 这里空了 fades in (or put 这里空了 at the slot, below the 鼓 label).<br>Move "≈ 363 Hz" to the left of 主旋律, or lift it about 60 px above the blue orb row. |
| 5 | MINOR | 0:45.40 | **The 和声/混响 animation snaps off in 2–4 frames** on 合回来: `verb` is cut over 0.08 s and `harm` over 0.15 s. The audio bloom is also cut on that downbeat, so it is in sync. But the big reverb rings and the three harmony notes vanish at once and read as a pop. | `z_cancel_41-46.png` (45.35 → 45.45) | Let the rings finish their current expansion and the notes fold back into the 和声 orb over ½ beat (0.25 s), riding the 合回来 burst. |
| 6 | MINOR | 1:29.8–1:30.5 | **v3 N4 is still open:** two cyan waves with different amplitude and phase overlap at the title exit (the particle wave and the S12 wave). Over the same stretch, 可为什么，有的声音好听？ holds 2.0 s past reading time over a nearly empty frame. | `z_titleexit_88-91.png` (90.00, 90.20) | Hide the S12 wave until the particles have landed, or give the particles' target the S12 wave's exact amplitude and phase (`wy` vs `wave(…,70*amp,240,…)`). |
| 7 | MINOR | 2:23.2, 2:24.9 | **The recap spectrum lags the cut by 0.4–0.5 s.** The audio filter switches cleanly on the downbeat (bass −125 dB from 2:25.0). The live bars fall at ~90 dB/s, so at the start of 高音 (2:24.9–2:25.4) the bars still show full bass under "3000 Hz 以上". With 1.74 s per bar, about a quarter of the bar shows the wrong picture. | `z_recap_143-154.png` (144.90–145.30)<br>`live29.json` bins 0–8: 145.07 = 22 dB, 145.47 = −14 dB | In the recap only, snap the bars (release ≥ 400 dB/s) or zero the filtered bins on the bar line. |
| 8 | MINOR | various | **Sizes under the label and tag rule.**<br>• 几个音一起响 and 房间的回声 are 40 px (46 px after the stage's 1.14 scale). They explain a new idea, so they are labels and should be ≥ 52 px.<br>• The L/R tags in the small heads are 25 px (stage, recap stage), 30 px (骗你的, finale) and 32 px (Shepard).<br>• End card: the follow pill is 26 px and the sources line 18 px. | Film29.tsx lines 92–93, 305, 310, 315, 399, 442; Brand.tsx lines 421, 425 | Raise the two stage labels to 46 px before the stage scale (= 52 px).<br>Give `Head` a minimum on-screen tag size (`fontSize: 40 / s`). |
| 9 | MINOR | 0:00–0:00.9, 0:01.9–0:02.9 | **The card's hook line is missing on frame 0.** 听：歌声正绕着你的头转 fades in only at 0.5–0.9 s, so frame 0 carries only 戴上耳机 (owner note: words on frame 0, something happening in the first second).<br>**Vocal panning, not verified:** from 1.9 to 2.9 s the orb is hard left, but the vocal band (300 Hz–3 kHz) is centred (L−R within ±1 dB). Panning tracks well from 0.3 to 1.4 s (R +6 to +11 dB). This may be a gap in the singing, so I can't call it. The music review also measured the vocal 5.4 dB under the instrumental. | `z_card_0-4.png` (0.00, 0.30)<br>per-100 ms L−R table (my measurement) | Show the line from frame 0.<br>Have the music side confirm the vocal is singing at 1.9–2.9 s, or lift the vocal stem 3–5 dB in the card. |
| 10 | MINOR | 2:14.5–2:16.0 | **The reverb "wash" reads as a flat pale oval** with a visible edge, then lifts the whole frame. It is close to the mood effects the owner asked to drop (ep14 "dont try add the effect anymore"). | `z_wash_134-136.png` (134.60, 135.20) | Make the wash out of the air particles (they slow, spread and glow blue) instead of a blurred ellipse; or feather it to off-frame from the first frame. |
| 11 | MINOR | 0:03.6, 1:59.8–2:07.5 | **Script and pace, words untouched (the owner locked v2).**<br>• **0:03.6:** the first line shows 2.3 s and needs 2.5 s.<br>• **1:59.8–2:07.5:** "研究发现：又慢又低的音乐 / 再放慢一点—— / 常常被听成悲伤" splits the study's sentence around an action line. While 常常被听成悲伤 is on, the top label says 再降 2 个半音 · 更慢 with the Juslin citation, so the claim reads as if it were about our slow-down. | auto_checks.md (pace)<br>`sheet_12.png` (2:04–2:06) | Extend line 1 to 6.10 and shift 把它调快一点 to 6.20–8.00 (the speed-up starts at 7.61).<br>From 2:03.0 to 2:07.5, keep 又慢又低 → 常被听成悲伤 on screen as the top label, with 再降 2 个半音 as a small tag under it, so the subtitle's subject stays visible. |

## Checked and OK (keep)

- **Remix drop and recap sync:** the strongest onset is at 141.416–141.43; the burst is first drawn on frame 4244 (141.467), so the burst lags the onset by about one frame (~40 ms).
  - The beat grid over 141–166 sits within 16 ms of the RDROP grid.
  - The recap filter switches land on the bar lines: low-pass at 2:23.15–2:23.20, high-pass at 2:24.90–2:25.00, and the cancel at 2:26.6.
  - The picture and subtitle changes (低音 143.17, 高音 144.91, 去掉中间 146.65, 左右跳 148.39, 绕着你转 150.13) are all on those downbeats.
  - So the "3 eighths off" bug in music_review_v5 looks fixed in this master.
- **Title drop:** the audio hit is at 1:24.20–1:24.22 and the burst is first drawn on frame 2527 (1:24.23). The inhale before it is a −4 to −6 dB dip, not silence, and the picture keeps moving (gold core, rings contracting). There is no freeze or stutter.
  - The title ink is centred at x = 960.5 (the ？ optical centring holds).
  - The particles pour into the 363 Hz wave.
- **Struck notes in the ratio demo:** the visual strikes every 2 beats match the audio note onsets within one frame (90.34, 91.37, 92.40, 96.48). The pulse is clear on both waves (`z_strike_92-94.png`).
  - The clash (对不齐) starts on 如果只差一点点 at 1:46.7 and resolves at 1:51.4.
- **Card → song weld:** the first subtitle (3.61) lands on the song's first downbeat (audio 3.56–3.58). There is no audio gap: RMS stays above −27 dB through the weld.
- **Sad → breakdown:** the blue song orbit hands over to the gold 人声 orb at the top of the orbit (2:14.5–2:15.2), and the orb circles once to the front for the drop. This is a good motivated handover.
- **Technical:**
  - 1920×1080, 30 fps, 11.99 Mbps.
  - −14.04 LUFS, −1.79 dBTP.
  - `yuv420p` limited range (v3 N2 is fixed).
  - No hard cuts, no single-frame glitches, no black frames, no white flash. The biggest frame-to-frame jumps are the two colour bursts.
- **Brand:** the end card has the J monogram, the gold title, the question, the follow pill and the sources. There is no "Juno 出品".
- **Facts:** facts.py against facts.md reports no problems. 369 and 0.02 are now covered.

## Fixed since v3

- **Fixed:** N1 (每秒上万次 now sits ~100 px clear of the header, not touching 3000 Hz); N2 (colour range).
- **Fixed:** the dip-to-empty blinks at 0:48, the arrows, 骗你的 and the recap. No frame in 0:05–2:44 drops below 0.15 % lit, and the arrow is a single flip (z_dips.png).
- **Still open:** N4, the double wave at the title exit (row 6).
- **Changed:** the end card is no longer static for 7 s. It is now too short and preceded by an empty stretch (row 1).
- **Not re-checked:** N5, the precedence audio hold.

## Not checked / can't judge

- **Music taste and audibility:** whether the remix vocal "leads" in the card, the 138 → 117 bpm jump at the weld, and the brightness lift into the outro. These are music_review_v5's items. I measured only onsets, band levels, panning and loudness.
- **Phone-speaker test:** a 300 Hz high-pass on a mono fold is a rough stand-in. I didn't play the film on a real phone.
- **Song identity:** whether the main slowed BGM is the same song as 若如初见. If it is not, 你听的这首歌 right after a card credited "♪ 若如初见（remix）" points at a different song than the one the viewer just heard. The film never credits the main track.
- **Sources:** I didn't read the cited papers. The words are owner-locked v2, apart from 最易 → 更易.
