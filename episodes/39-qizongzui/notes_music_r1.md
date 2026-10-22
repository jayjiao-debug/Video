# 《七宗罪》梗图版 · music notes r1 (music specialist, 2026-10-23)

Deliverables
- `audio/sins7_mix.wav`: 59.460 s, 48 kHz, 24-bit stereo, **−14.0 LUFS integrated, true peak −2.8 dBTP** (checked with pyloudnorm and ffmpeg ebur128), 1 s fade-out.
- `audio/build_soundtrack.py` rebuilds everything and prints the checks.
- `audio/sfx_cues.json`: every SFX cue (time, type, level relative to the music) plus the track's own pause points, for the picture.
- `audio/plots/`: `energy_src.png` (track loudness and brightness against the picture), `spec_breaks.png` (the three breaks), `spec_sections.png`, `mix_energy_title.png` (mix, music alone and SFX alone, plus the title spectrogram).

**Scope (producer update, owner rows 37/51/64/91):** the BGM is untouched. The only changes to it are one static gain (−7.29 dB, applied to the whole mix to reach −14 LUFS) and the final fade. The check `max |mix − gain·music|` where there is no SFX is 7e-18, so the music is sample-identical. The pauses (停顿) are made **in the picture**, at the points where the track already pauses.

---

## 1. What I measured

| | value |
|---|---|
| source | qiqing_music.wav, 64.0 s, 48 kHz/16-bit, **−6.7 LUFS**, true peak **+1.08 dBTP** (it already has inter-sample overs; after −7.29 dB that becomes −6.2 dBTP, so it is safe) |
| shape | **A flat wall of sound.** 400 ms loudness stays between −9.2 and −5.2 LUFS for the whole film (median −6.7). Every bar's RMS is −9.3 ± 0.3 dB except bars 10 and 26. LRA of the final mix is **1.0 LU**. There is no build and no release. |
| key | **F# minor**: the bass is an F# pedal in every bar; the mids are C#, A, F#, B, G#, E. Bar 27 (title) is a pure F#–A–C# triad. Tuned **+12 cents** (A4 ≈ 443 Hz), measured from 10 partials (+0.10…+0.15 st). |
| kick | Four-on-the-floor on every beat (template match r ≥ 0.95), except beat 4 of bar 2, all of bar 10 and all of bar 26. The beater click is at grid **−14 ms** at 0 s and drifts to **−10 ms** at 59 s, so the grid is good to ±15 ms throughout. |
| brightness | The spectral centroid peaks *inside* the breaks (the track's own fills): 5.4–6.1 s (4.6 kHz), 21.5–22.3 s (5.2 kHz), 54.0–54.8 s (4.8 kHz). After the title the high band falls by 3–4 dB (bars 28–29), so the track darkens into the end on its own. |

### The track's own pause points (they confirm the director's numbers, with more detail)
Each pause opens with a **half-beat sub hole**: the band below 100 Hz drops 20–50 dB. Then come kickless beats, and the kick returns on a downbeat.

| | sub hole | no kick | inside | kick returns (click) | picture there |
|---|---|---|---|---|---|
| **P1** | 5.635–5.885 (−20…−39 dB) | beat 4 of bar 2 (5.62) | 5.885–6.129: a low-mid pickup stab (100–400 Hz, +10 dB) | **6.129** | reveal 1 (傲慢) |
| **P2** | 20.09–20.34 (−35…−51 dB) | all of bar 10 (20.33–22.35) | bass drops in and out (holes at 20.88, 21.36–21.60, 21.90); highs +5…+14 dB (a bright fill) | **22.351** | end of 暴怒 → iris → 懒惰 moment line |
| **P3** | 52.55–52.80 (−25…−41 dB) | all of bar 26 (52.77–54.79) | one off-beat thud at 53.54; sub holes 53.29–53.35, 53.83–54.01, 54.31–54.55; low-mid stab 54.13–54.19; brightness climbs to 54.8 | **54.795** | outro question → **title slam** |

Map against the picture: P1 sits on the first reveal and P3 on the title, which is ideal. P2 sits on the 暴怒 closing line, and its kick return (the strongest drop inside the film's body) lands on the iris into 懒惰, not on a reveal. Reveals 2–7 all fall in unbroken four-on-the-floor; nothing in the music marks them.

## 2. Edits to the music: none
- Gain −7.29 dB, static.
- Fade: equal-power cosine from 58.46 to 59.46 on the whole mix (music and bell together). The fade gain is −1.8 dB at the 58.86 downbeat (the bar-29 kick still lands), −8 dB at 59.20 and −∞ at 59.46. No filter.

The edits I designed before the producer's update (a half-beat silence before 6.14, a low-pass dip before 30.47, a high-pass beat before 42.64, a one-beat silence before 54.80) are **withdrawn**. See question 1 for the one I would still ask the owner about.

## 3. SFX: one family, one bell
The synthesised church bell is tuned to the track: prime F#3 (186.3 Hz). Partials: hum F#2, tierce A3 (a minor-third bell, so it sits inside F# minor), quint C#4, nominal F#4, plus the upper partials A4, C#5 and F#5. Each partial carries a slow ±0.15 Hz warble (about 5 dB deep, never a null). Under it is a sub that glides F#2→F#1 and fuses with the 808. The bell is mono, plus a decorrelated hall on the title only; the SFX mono fold-down is −0.7 dB.

The story reason: Gregory's 6th-century church. Each sin gets **one toll**, and the title is the eighth toll, the bell ringing free. This is the only new timbre in the film. It is saved for the climax, which is where the chill comes from.

| cue | time (on the measured kick click, not the grid: no flam) | level vs music (400 ms, K-weighted) | character |
|---|---|---|---|
| reveal 1 傲慢 | 6.1288 | −10.0 LU | damped toll (ring ×0.22): the hook drop, slightly stronger |
| reveal 2 嫉妒 | 12.2121 | −12.0 | ×0.14, softest |
| reveal 3 暴怒 | 18.2954 | −11.5 | ×0.16 |
| reveal 4 懒惰 | 24.3787 | −11.0 | ×0.18 |
| reveal 5 贪婪 | 30.4620 | −10.5 | ×0.21 |
| reveal 6 暴食 | 36.5453 | −10.5 | ×0.24 |
| reveal 7 色欲 | 42.6286 | −10.0 | ×0.30, brightest hammer |
| **title** | **54.7952** | **−4.0** (the one impact) | full bell + sub + short hall, ringing into the fade |

Audibility: in the bins of the bell's partials, each reveal toll is **+8 to +14 dB above the music for the first 100 ms** and masked by 400 ms. On earbuds that reads as a short, dark "dong" fused with the kick, not as a separate effect. The title toll stays **+9 to +15 dB above the music in its partial bins for 2 s and more**, so it is clearly heard.

**Built but OFF** (flags in `build_soundtrack.py`), with the reason for each:
- `QUIP_POP`: the bubble lands on beat 3, where the kick already pops it. A second tonal family would make the pile the owner rejected (row 37).
- `IRIS_SWELL`: every iris ends on a downbeat kick, and the owner rejected whooshes (row 58).
- `CAL_FLICKS`, `COINS`: cute, but each adds a new family for one scene.
- `TYPING`: owner row 37 says no per-character blips.

## 4. What the picture should do (the 停顿 lives here)

**Global fix 1: beat pulses fire where the track has no kick.** `MemeSil` `pulse`, `FigMeme` `pulse` (hop/squash) and `MemeScene` `beatPulse` all run on every grid beat, including the nine kickless beats. That gives visual "kicks" over no kick, which kills the pause. Gate them:
```ts
const NO_KICK = new Set([11, 40, 41, 42, 43, 104, 105, 106, 107]);   // beat index n = floor((T - PH) / BEAT)
const kickOn = (T: number) => !NO_KICK.has(Math.floor((T - PH) / BEAT + 1e-6));
// multiply every pulse / beatPulse / hop by (kickOn(T) ? 1 : 0)
```

**Global fix 2: reveals 2, 4 and 6 are a frame late.** `rv = Math.round(REV[i] * FPS - 0.2) / FPS` rounds 12.226, 24.391 and 36.557 up to frames 367, 732 and 1097. The kick clicks at 12.212, 24.379 and 36.545, so the picture comes **21 ms after the sound**. Use `Math.floor(REV[i] * FPS) / FPS` in `MemeScene` (line 1371), `VoiceScene` (1196) and `Outro` `tq` (1339). Measured result: every reveal and the title fall within **±12.1 ms** of the kick (now: 1, 3, 5, 7 and title at −4.5…−4.8 ms; 2, 4 and 6 at −21 ms).

**P1, 5.62–6.13 (before 傲慢): action pause (动作停顿), a wind-up, never a freeze.**
- 5.12–5.62: the `urge` jitter and the ? growth as now.
- 5.62 (no kick): **hold**. Jitter goes to 0, the ? stays at full size, no pulse. Keep only the slow camera push, so the frame is still alive (row 91).
- 5.885 (the pickup stab): the `wind` push accelerates, slow then fast.
- 6.133 (frame 184): the reveal, one-frame lift, `hitShake`, name lands; the toll and kick hit together.

**P2, 20.09–22.35 (暴怒 burns out): picture-density pause.**
- The closing line is 怒火，最先烧的是自己. Let the rage visibly burn itself out: from the sub hole at 20.09, the `rage` jitter (`rotAll` 37 Hz) and the crack shake decay to still across bar 10. No new elements in bar 10. Pulses are gated.
- The bright fill (21.5–22.3) can carry a few rising embers. That is slow, continuous motion, not locked to a beat.
- The iris closes 22.03–22.35. Its end is **the strongest drop in the body of the film** (kick returns at 22.351), so it should feel like the release: a fast ease-in, with the 懒惰 moment line landing on it.

**P3, 52.55–54.80 (before the title): the film's biggest pause, in the picture.**
- 52.55 (sub hole): everything stops arriving. The seven chips are all in by 50.75; no new element after this point.
- 52.78–54.30: a slow push-in on the gold circle (scale 1.00→1.04, ease-in). The chips stop moving. **Do not hit the off-beat thud at 53.54.**
- 54.30–54.80 (last beat, brightest point of the track's fill): the circle **inhales**, scaling 1.04→1.00 slow then fast, as the wind-up. The question dissolves (`qOut` already starts at 54.60).
- 54.800 (frame 1644; kick click 54.795): the title slams with the full bell. `Rings` + `Lift` as now. No white flash.
- After the slam, the bell rings over the end card. The picture should get calmer from here, nothing brighter (row 95), and can dim with the 58.46–59.46 fade.

## 5. Answers

**(a) Is this track strong enough for a "drop" film?** Not by itself. It is a wall: LRA 1.0 LU, every bar within ±0.3 dB, and its breaks are only about 2 dB down in short-term loudness. Its only real drops are the three kick returns at 6.13, 22.35 and 54.80. With the music untouched, **the picture has to create the drops**: density, stillness and motion (hold, push, slam) around those three returns, with the beat pulses gated so the pauses read as pauses. On top of that, the bell gives the title a sound the track never had.

**(b) Which ONE moment deserves the biggest silence?** The title at 54.80. Bar 26 is the longest break in the film (a whole kickless bar with four sub holes), it leads straight into the title, and the owner's standing rule is that the title lands on the hardest drop. In the picture that is the stillest bar of the film (P3).

**(c) How long can a silence last before it hurts the flow?** At 118.4 bpm:
- True silence: ½ beat (0.25 s) to 1 beat (0.5 s) reads as a breath. 2 beats (about 1 s) is the ceiling (owner row 50).
- A kickless bar (2 s) works only because the bass and the fill keep going, as in this track.
- Frozen picture: never more than about 2 beats; a dead stop reads as lag (row 91). A held composition with slow motion can last a bar.

**(d) Should the 7 reveals get the same hit or escalate?** The same bell, escalating slightly:
- the ring gets longer (×0.14 → ×0.30) and the hammer brighter;
- the level climbs from −12 to −10 LU;
- reveal 1 is a touch stronger because it is the hook;
- the title is the same bell undamped, the eighth toll.

Seven different sounds would break the one-family rule.

**(e) What should happen in sound at the iris transitions?** Nothing added. Every iris ends on a downbeat where the kick already hits, and the 22.35 iris rides the track's own kick return. A reversed air swell is built (`IRIS_SWELL`, −20 LU) but off. If a transition feels thin once the picture is final, switch it on for 22.35 only.

**(f) Can these edits stop Douyin's copyright matcher recognising the track?** Low risk:
- The recording is sample-identical from 0:00 for 59.46 s.
- The static gain does not matter (fingerprints ignore level).
- SFX touch 27 % of the samples and sit ≥ 10 LU under the music, except the title's last 4.7 s (−4 LU).
- Only the last 1 s is faded.

The real risk is **doubling**. If the track is also added from Douyin's music library in the app, it plays twice, with a flam or an offset, because the library edit or master may not line up with our file. Upload the film with its own sound. If the library track is attached for credit, set its volume (配乐) to 0 and keep 原声 at 100.

## 6. Questions for the owner
1. Your new 停顿 lesson ("让耳朵休息一下") and your earlier rule ("1 coherent untouched BGM") pull in opposite directions. I followed the earlier rule. Would you allow **one** exception: muting the music for exactly the last beat before the title (54.29–54.79, about 0.5 s of true silence after the bar-26 fill, with the picture inhaling), so the title toll lands on silence? Everything else stays untouched. It is a 10-line change to the script.
2. The film ends at 59.46, 1.18 beats into bar 29, so the fade cannot end on a downbeat (row 66). Extend the end card to **60.89 s** (bar 30) so the fade spans bar 29 and ends on the beat?
3. Is the church bell OK as this episode's only sound (one toll per sin, the free bell on the title)?

## 7. Masterclass techniques (picture side, since the music is locked)
- **Gate the pulses to the real kick map** (P1, P2, P3). The pauses only exist if the picture stops pulsing with the music.
- **Wind-up, hold, snap** at 5.62 → 5.885 → 6.133: the action pause the owner's tutorial describes, timed to the track's own sub hole and pickup.
- **Burn-out as a pause** at 20.09–22.35: the rage decays to still on 怒火，最先烧的是自己. The story beat and the break are the same thing.
- **Inhale before the title** at 54.30–54.80: a scale-down slow then fast, then the slam on the full bell. Holding a new timbre back until the climax is the chill.
- **Frame-accurate snapping** (`Math.floor`): every reveal within ±12 ms of the kick click instead of 21 ms late on even sins.
