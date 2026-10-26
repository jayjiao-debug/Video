# ep51 sound review, round 1 (rough_v1)

**Verdict.** The music and picture line up well: all eight music hits, and 14 of the 15 effect events, land within ±1 frame. The mix itself had real faults, and these are now fixed in `sfx_cues.json` and `ep51_mix.wav`:
- three effects landed 5–7 frames off their picture;
- three cue windows let through extra strikes or drips that have nothing on screen;
- two effects were inaudible.

Two picture items are for the builders: the title and the end-card seal reach their contact frame 2–4 frames after the downbeat.

Mix now: −14.0 LUFS, true peak −2.16 dBTP, 48 kHz / 24-bit / 119.25 s. That is 22 cues mixed and 4 off, across 15 events. `ep51_bed.wav` is untouched.

Method: frame-difference scan of rough_v1.mp4 plus contact sheets around every cue. For each rendered cue I measured its envelope, onset and peak. Pitch was measured as the FFT partials of each effect against the bed's chroma. Audibility uses the `mix51.py --report` metrics. The mp4's audio is sample-identical to the r0 `ep51_mix.wav` (lag 0).

## For the builders (picture)

1. **Title slam, 9.50 (MAJOR).**
   - Now:
     - Frame 285 (9.500), the drop frame, is empty: H3 has gone and the plaque is at opacity 0 (`o = cl(f/2)` in `TitleCard`, master51.tsx).
     - The plaque first shows on f286 at scale ~1.25.
     - It reaches contact (scale 1.0) on **f289 (9.633), 4 frames after** the drop and the title_hit transient (9.500).
   - It should: be fully opaque **on f285** and touch scale 1.0 by **f286**.
   - Fix: in `TitleCard`, set `o = 1` from f = 0 and change the scale to `sc = f < 1 ? 1.10 : 1 + 0.03*exp(-(f-1)/9)*sin(2π(f-1)/8)*(f < 17 ? 1 : 0)`.
   - Alternative: start the 4-frame scale-down at 9.367 (f281), so that contact is f285.
2. **End-card J seal, 112.75 (MINOR).**
   - Now: the seal shows on f3383 at scale 1.7 and touches 1.0 on **f3385 (112.833)**. The seal sound and the music's fall are on 112.75, so the picture is 2.4 frames late.
   - It should land on **f3383 (112.767)**.
   - Fix: in partB.tsx `EndCard`, use `seal = land(seg(t, T0 - 0.07, T0 + 0.33))` and draw it from `t >= T0 - 0.07`.
3. All other picture events are on their transients (first frame at or after the cue). Verified:
   - fridge door f14;
   - light dies f82;
   - ◀◀ f210;
   - chisel bursts f387 and f404;
   - ice knock f999;
   - 先猜？ pill f1048;
   - 酒 f1101;
   - pour stream f1135;
   - silver glint f1831;
   - Q4 strikes f1916 and f1933;
   - 两米 f2086;
   - 「？」 return f2228;
   - stamp f2296;
   - bowl clangs f2449 and f2483;
   - the machine's block "sets" on f2907 (96.90 drop);
   - cubes in the cup f3128;
   - P1 dissolve 105.8–106.1 across the 105.957 peak.
4. **Optional (POLISH).** At Q4 the walker's own big strike, 65.539 (BA(115)), the camera's focus and the KF11 pose, has no sound. The two chisel sounds sit on the workers' strikes (63.841, 64.407). If you want 「声如錾石」 to land on the hero, move the 64.407 cue to 65.539. I left it alone.

## Ranked notes (sound): fixed unless marked

**MAJOR**

1. **Brass bowls 81.617 / 82.749: 6 frames late.**
   - Cause: the clang sits 0.18 s into `sfx_brass_bowls.mp3`, with no lead, so the peaks fell at 81.818 / 82.950. The picture clang rays are on f2449 / f2483.
   - Fixed: `src_start 0.16, lead 0.02`. Onset is now +1 ms.
2. **Ice glass 104.259: 7 frames early.**
   - Cause: `lead 0.25` assumed the clink at 0.25 s, but the file's loudest clink is at 0.025 s, so it fired at 104.03, while the cubes were still in the hand.
   - Fixed: `lead 0.025`. The two small settle-clinks now follow at +0.24 and +0.55 s.
   - Also pitched `+1.5 st`, which puts its partials on E/G/B/D (Em7 over the Cmaj7 bed); before, they sat between D and E♭.
   - db −8 → −10.5, because the tuned clink set the film's true peak (−0.98 dBTP).
3. **Extra strikes with nothing on screen.**
   - Cause: `ice_chisel` 13.462 (`len 0.4`) let the file's next strike through at 13.73, and `chisel_stone` 64.407 (`len 0.4`) let one through at 64.69.
   - Fixed: `ice_chisel` `len 0.25`; `chisel_stone` `src_start 0.53, lead 0.027, len 0.3, fade_in 0.005`. Each cue is now exactly one strike.
4. **Hush drips 71.43–73.69 were doubled, dry and uneven.** They were not too loud (about 20 dB under the body, which is right).
   - Doubled: each 0.3 s slice held two drips, so 10 sounds played against 5 picture drips (e.g. 73.13 and 73.35).
   - Dry: the cut sat about 60 ms after each plink.
   - Uneven: the first drip was only 2 dB over the stop-bar ring (inaudible), the middle ones 25 dB over.
   - Out of key: the 72.56 slice was an A♯6 plink, a tritone against the E ring.
   - Fixed with a new file, `sfx/sfx_drip_room.mp3`: one clean drip from `sfx_drips.mp3` (0.335–0.52 s) plus a synthetic stone-vault tail (RT60 1.0 s, 15 ms pre-delay, 350 Hz–5 kHz, decorrelated L/R; the dry drip stays centred). It is built by `make_drip.py` (path below).
   - Cues: `lead 0.012`, pitched E6–C6–E6–C6–E6 (`−0.35 / −4.35 st`). Those are chord tones of Am, and the last E leads into the F return (Fmaj7).
   - Crescendo: `db −20 → −16`.
   - Result: peaks −12 dBFS against body peaks −4. Every drip is now 5–25 dB clear of the ring, and the tails glue to the bed's own ring.
   - Plot: `hush_v1.png` (before) vs `hush_r1.png` (after).

**MINOR**

5. **先猜？ tick 34.972 was masked.**
   - `tick1` had a band SNR of −0.5 dB: its 1.27 kHz sat under the bright B-pre pedal.
   - Replaced with ep50's `sfx_guess_tick.mp3`, first tick only (`src_start 0.15, lead 0.05, len 0.4, db −2`). Band SNR is now +8.3 dB at 3.2 kHz, −12.9 LU under the bed, and it lands on the pill's landing (34.98).
6. **冰票 stamp 76.523 was masked.**
   - `seal1` sat 25–30 dB under the bed in every band (it falls on the DB(1) downbeat).
   - Replaced with ep50's `sfx_stamp_char.mp3`: `lead 0.07, len 0.45, db +2`. That gives +6 dB band SNR at 634 Hz, −11.4 LU under the bed, dPeak −0.6. Its 223 Hz body is A3, the root of that Am/C bar.
   - Note: this is as far as it can go without poking out. The downbeat itself carries the hit.
7. **Ladle pour 37.803: 5 frames late.** The splash sits 0.18 s into the file, while the stream appears on f1135. Fixed: `lead 0.14`.
8. **Light click 2.707.**
   - Cause: with `len 0.75` from 0, the default 0.15 s fade started 0.08 s before the click (−6.6 dB on it) and cut its decay.
   - Fixed: `src_start 0.2, lead 0.48, len 0.62, fade_in 0.05, fade_out 0.1, db −10`. Band SNR is now +9 dB, dPeak −0.1.
9. **Levels against the owner's "≥10 dB under the music except one impact" rule.**
   - `silver_ting2` was −7.7 LU, a pure 1.77 kHz ring. Now db −8, so about −9.7 LU, still +7 dB band SNR.
   - `ice_bronze` was −8.7 LU, but its 217 Hz partial was masked mud (band SNR only 2.7 dB). Now `hp 400`, so −9.3 LU, with the same audibility.
   - title_hit (−3.4 LU) is the one impact.
10. **ice_bronze 33.274 is still weak on earbuds** (+2.7 dB at 1.27 kHz). It is acceptable as a "soft" cue. If the reviewer doesn't hear the knock, it is the next cut, not a raise.

**POLISH / count**

11. **Effect count.** `ice_slide` 15.161 is now **off**: it was masked (+4 dB at 634 Hz), carried no story beat, and sat 1.7 s after the two chisels in the busy title stretch. That leaves 15 events, each on a visible action.
    - The densest stretch is 61–83 s (ting, 2 chisels, 5 drips, stamp, 2 bowls). The drips play in the music's hush, so they don't compete.
    - I would not cut more; light_click and the fridge pop are quiet (−15/−17 LU) and on story beats.
12. **Tuning check**, effect partial vs bed chord:
    - title_hit F3 on Fmaj7 ✓;
    - silver_ting2 A6 +8 c on E→Am ✓;
    - brass_bowls C7 +5 c on Am/C and F ✓;
    - stamp_char A3 on Am ✓;
    - drips E6 / C6 ✓;
    - ice_glass now E/G/B/D on Cmaj7 ✓;
    - end seal1 was G +37 c over the B♭-minor fall, now `semitones −2.37` = F3, the chord's 5th ✓.
    - ice_bronze and guess_tick are inharmonic knocks (no clear pitch), so I left them unshifted.
13. **Music bed (not touched, report only).**
    - The 400 ms loudness is very flat across the film: −13…−14 LUFS from 0–70 and 74–112 (`mix_overview_r1.png`).
    - The drop at 96.90 is only about 1 dB above the verse, and the peak about 2 dB above it.
    - The shape comes from arrangement and brightness, not level. That is fine for the owner's "smooth / whole" brief.
    - If round 2 wants more lift: raise `BUILD_DB` from −1.5 to −2.5 and `RISE_DB` from 1.0 to 1.5 in build51.py. That gives about 1 dB more contrast into the drop and the arrival, with no edits.
14. **Mono / format.**
    - The film is near-mono (L/R r = 0.992). Only the drip tails are wide (r = 0.39); their dry hits are centred, so the mono fold is safe.
    - `final51.sh`'s untouched-bed alternative reuses `sfx_cues.json`, so it picks up all of these fixes when it is re-run.

## What changed (files)

- `music/sfx_cues.json`: every changed cue carries an `r1` field explaining why. The pre-review copy is `sfx_cues_r0.json` (path below).
- `sfx/sfx_drip_room.mp3`: new.
- `sfx/sfx_guess_tick.mp3` and `sfx/sfx_stamp_char.mp3`: copied from the ep50 sfx pool.
- `music/ep51_mix.wav`: rebuilt, plus `_sfx_report.json`.
- Audio files are gitignored; nothing is committed.
- Preview (rough_v1 picture + the r1 mix): `/tmp/claude-0/-home-claude/bf206d1e-1152-5595-9b84-b15be6e5a777/scratchpad/snd51/rough_v1_sound_r1.mp4`.
- Evidence (sheets, envelopes, plots, scripts): `/tmp/claude-0/-home-claude/bf206d1e-1152-5595-9b84-b15be6e5a777/scratchpad/snd51/`
  - contact sheets `s1.png`–`s7.png`;
  - effect envelopes `env1.png`, `env2.png`;
  - `hush_v1.png`, `hush_r1.png`, `mix_overview_r1.png`;
  - per-cue onset table `cue_onsets.json`;
  - drip builder `make_drip.py`;
  - r0 backups.

## Masterclass techniques (next round, optional)

- **69.50 → 74.26, the hush as a held breath.** The drips now count down in key. To make the return lift more, end the last drip's tail on the inhale. One option is a 1-beat pre-delay so the tail is still blooming at 74.26; the "silence" then ends inside a sound and doesn't cut to the chorus.
- **96.90, the drop.** The block "sets" on the frame, which is right. Don't add an effect here. Let the modulation be the event, and keep the picture still for the 2 frames before it (a picture pause before the hit, owner row 112).
- **112.75, the end-card fall.** The seal is now on F over the V→i fall. Once the picture contact moves to f3383, the stamp, the downbeat and the dim all become one gesture. That is the cleanest "full stop" the film can have.
