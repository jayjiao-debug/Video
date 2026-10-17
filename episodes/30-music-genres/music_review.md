# Music review: ep30 《同一段旋律，8种曲风》 soundtrack v1 → v2 (song30.js)

Reviewer: music specialist. All numbers are measured on the rendered wav; I don't listen. Checked against script.md ("Music plan" and "Listen bars") and notes_gate1_r2.md.

**Verdict.** The arrangement does what the plan asks: every genre has its textbook pattern and tempo, the clues are isolated, and the theme is note-for-note identical everywhere. The v1 render had one engine bug that made the whole mix dry and mono, plus a doubled melody bar and several loudness-plan misses. I fixed all of them in `song30.js` (16 `// MUSIC FIX n` tags) and re-rendered. Every check in the plan now passes.

**What did not move:** segment times, bar lengths, BPMs, patterns and theme pitches. Every `segs[*].t0` and `bar` in `events.json` is identical to v1; the only seg change is the corrected `recap.t1`. The picture can be built on the new `events.json`.

## Files
- **Edited:** `/tmp/claude-0/-home-claude/240969aa-174a-5914-92b5-d529595dbe80/scratchpad/ep30a/song30.js`. Backup of v1: `song30.orig.js` in the same folder.
- **Re-rendered:** `ep30a/out/music.wav` and `ep30a/out/events.json`. The wav is already −14.0 LUFS, so encode it with no loudnorm.
- **Not yet updated in the episode folder:** `build/song30.js`, `build/events30.json` and `music/曲风_配乐_v1.m4a` are still v1. Copy the scratch `song30.js` and `out/events.json` over, then encode `music/曲风_配乐_v2.m4a` from `out/music.wav` (e.g. `-c:a aac -b:a 256k`, no loudnorm).
- **Plot:** `review_music/loudness_after_fixes.png`.

## Plan checks: v1 → v2

| Check (plan / gate) | v1 | v2 | |
|---|---|---|---|
| Whole film | −14.01 LUFS, **−1.40 dBTP** | −14.00 LUFS, −1.72 dBTP | pass |
| 20.0 is the largest step-up, ≥ +4 dB | +5.3 dB | +5.7 dB | pass |
| Later step-ups ≤ +2 dB | **theme2→recap +8.5**, recap lo-fi→reggae +3.2 | +1.7, +1.5 (max of all later steps: +1.7) | pass |
| Trap→metal ≤ +2 | −0.2 | 0.0 | pass |
| No bar more than 6 dB under the body | bed b1–2 −7.7, bossa b1 −7.4, theme2 b3 −8.9 | none (bed b1–2 −5.4) | pass |
| Hook bed ~−6 → ~−3 by 16.0 | −7.7 → −2.6 | −5.4 → −2.6 | pass |
| No dead air (momentary > body −20) | holes at 54.2–54.6 (−37 LUFS) and 135.5–136.2 (−40) | none | pass |
| Theme pitch identical (events `mel`) | house bar 2 doubled (13 notes, overlapping) | all segments match A4 C5 E5 D5 C5 / C5 A4 B4 G4. Audio check: expected pitch dominant in 182/183 notes; one note in metal is masked by distortion. | pass |
| Hook snippets: ~5 ms fades, readable | 2.5/5 ms fades; reggae snippet **−16 dB** quieter (empty beat, no 嚓); bossa −10 dB | 5/8 ms fades; reggae taken on a skank; all 8 within 0.7 dB (−13.8…−14.5) | pass |
| Mono / phone | mono-sum loss ≤ 0.1 dB everywhere | same | pass |
| Metal A/B on a phone | level matched; inharmonic ("mud") gap 5.1 dB | level matched (−17.3 vs −17.0 dB, phone band); gap **7.1 dB** | pass |

## Clues (measured on v2)
- **Rock:** straight. Hats at beat phase 0.01 / 0.52. 动 on 1 and 3, 打 on 2 and 4.
- **House:** four-on-the-floor kick, off-beat open 次, clap on 2 and 4, pad pumping on every kick, 124 bpm.
- **Jazz vs rock at the same 120:** ride "da" measured at beat phase **0.67** (rock hats sit at 0.52), so the swing is 2:1. The hat foot is on 2 and 4.
- **Lo-fi:** 78 bpm, swung 0.6, ±12 ms looseness, crackle, Rhodes 7th/9th chords with wow.
- **Reggae's empty beat 1** (b1–2, first 120 ms after each beat):
  - Full band: beat 1 −25, beat 2 −30, **beat 3 −9.3**, beat 4 −29 dB.
  - Below 150 Hz: beat 1 is −48 dB, beat 3 −10 dB. Beat 1 is clearly empty and the drop lands on 3.
  - The count tick is now loud enough to hear "1-2-3-4" (FIX 5).
  - On a phone (no sub), the rim makes beat 3 the strongest transient. In b1, beat 1 measures −26 dB in the phone band, but that is the lo-fi Rhodes ringing across the barline, not a hit.
- **Quiz lure:** the kick is equal on all 4 beats. Phone band: on-beat 10–14 dB above between-beat, so the lure works on a speaker.
- **Bossa:** no kit. Thumb on 1 and 3, finger chords on steps 1/4/7/11/14, 130 bpm.
- **Trap:** HF onsets per bar: 6–7 in b1–2 (8ths), then 10–15 from b3 (the zipper), against one 打 on step 9.
- **Metal:**
  - Double kick in 16ths at 160.
  - The A/B changes only the rhythm-guitar chord. Muddy bars are Am7add9 / Fmaj7add9 / **G7♭9**, so gate note 1 is applied.
  - Energy on the 55 Hz harmonic comb against everything else (250–3000 Hz): normal +3.2 dB, **muddy −0.6 dB**, clean +6.5 dB. That 7 dB is the intermodulation "糊" the line describes, at equal level.

## What I changed (ranked by impact)

1. **MAJOR: no reverb at all. The mix was bone-dry and essentially mono (L/R correlation 1.00).** `reverb()` in the engine *returns* the wet bus; the code discarded it and mixed the dry send back in.
   - Fix: `B.verb = reverb(B.verb, …)`, and the return goes from 0.6 to 1.2.
   - Side/mid is now −16…−31 dB (keys and pads get room; drums stay dry). It is still mono-safe.
   - This is the single biggest "cheap" → "produced" change on earbuds.
2. **MAJOR: theme2 b3 (126.8–128.8) was a −8.9 dB hole, followed by a +8.5 dB jump into the recap.** That jump was bigger than the 20.0 drop. (FIX 7)
   - b3 now builds: kick on every beat, 次 8ths, the bass, the pad +4.7 dB, and a louder roll.
   - The recap rock kick is trimmed. The step is now +1.7 dB.
3. **MAJOR: dead air before the recap's "谁的声音最显眼？" (135.5–136.2, −40 LUFS).** The lo-fi recap chord stopped short and the reggae bar opens on its empty beat with no count.
   - Fixes: chord legato (FIX 6), the teaching bar's 1-2-3-4 count added to the recap reggae (FIX 9), and the lo-fi recap +2 dB (FIX 14).
4. **MAJOR: the hook (0–4 s) didn't read.** The reggae snippet came from 70.14, the empty beat 1: melodica only, −16 dB. (FIX 4)
   - It now comes from 70.90 (skank + hats + bass).
   - All 8 snippets are level-matched (bossa was −10 dB) with 5 ms in / 8 ms out fades.
   - The hook now sits at −1.2 dB vs the body (owner rule: the first second must already be striking).
5. **MINOR: house played theme bar 2 twice on top of itself at 37.81** (+6 dB doubled notes; `mel` had 13 notes). b5 now plays theme bar 1, as jazz and trap do. (FIX 2)
6. **MINOR: true peak −1.40 dBTP.** Master ceiling 0.84 → 0.81, now −1.72 dBTP, with headroom for AAC. (FIX 3)
7. **MINOR: lo-fi b1 (the listen bar) fell to −37 LUFS at 54.2–54.6.** A Rhodes re-strike on the and-of-3 and legato chords fix it. (FIX 6)
8. **MINOR: missing 1-beat fills the plan asks for:**
   - lo-fi→reggae and the three recap joins: snare rolls in each genre's style;
   - bossa→trap: a riser, because bossa has no kit;
   - trap→metal: a 32nd hat zipper.

   Together with the theme2 b3 build (FIX 7) and the recap count (FIX 9), these add 35 events (`S`, `H`, `K`, `T` rows) to `events.json`. (FIX 8)
9. **MINOR: reggae count tick +5 dB with a faint higher "ONE".** The rim on 3 is +3 dB, so on a phone beat 3 stays the loudest hit and beat 1 is no louder than 2 and 4. (FIX 5) The lo-fi crackle now stops on the reggae downbeat; its 0.4 s tail sat on the empty beat. (FIX 16)
10. **MINOR, plan targets:**
    - bed b1–2 raised to −5.4 (FIX 11);
    - bossa b1 solo +2.9 dB (FIX 10);
    - bossa finger chords low-passed at 3.2 kHz, because nylon is dark and the 2–5 kHz band was brighter than rock's (FIX 15);
    - metal chord drive 9 → 14 on both the muddy and clean bars (gate note 5c, FIX 12).
11. **INFO: `segs.recap.t1` said 136.81; the recap really ends at 138.96** (2 + 2 + 3.08 + 3.08). Metadata only, but the picture reads it. (FIX 13)

## Not changed (recommendations, low priority)
- **Trap 808 is A2 (110 Hz)** (`bass808(r - 12 + 12)`). It reads on a phone, but earbuds miss the 808 "boom". To fix, layer a −6 dB sine sub an octave below (A1, 55 Hz) under each 808. Not done: it is a timbre choice and was not needed for the plan.
- **Segment starts are rounded to 2 decimals in the script:** jazz 41.68 vs house end 41.677, reggae 63.99 vs 63.988, quiz 76.29 vs reggae end 76.298, metal 110.81 vs 110.806. The offsets are 2–8 ms, which is inaudible. The picture should still take times from `events.json`, not from the script table.
- **Stereo stays narrow** (instrument pans ≤ ±0.35). That is right for phone viewing; the reverb fix gives earbuds the space.
- **Metal is the loudest segment** (+3.0 dB over the body; +5.1 dB on a phone), but it enters with a 0.0 dB step, so the 20.0 drop remains the biggest step-up as the plan requires.
