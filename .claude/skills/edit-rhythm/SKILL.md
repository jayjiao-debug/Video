---
name: edit-rhythm
description: Edit rhythm for Juno / explainer videos - what lands on the music (卡点) and what must not, shot length and cut placement, continuous actions on their own physical clock, measuring it with the beat-lock check, and building a reference table from the owner's reference videos. Use whenever timing cuts, hits, effects or actions to the music, reviewing pacing, or when the owner says something moves with the beat too much (突兀, 一直跟着beat动), feels mechanical, or asks about 剪辑 / editing.
---

# Edit rhythm

The owner's note that started this: "有些特效没有必要一直和beat动，很突兀" (some
effects don't need to move with the beat all the time; it's jarring). 卡点 is
mandatory, but only for the moments that mean something. A picture that hits
every beat is a metronome. The ear stops hearing the music and the eye stops
believing the action.

## Where the code is

Repo **jayjiao-debug/Video**, branch `claude/hopeful-curie-hm3mlq`, under `explainer/`:

- `pipeline/beatlock.py`: the beat-lock check (§4).
- `pipeline/stillness.py`: the opposite check (dead air).
- `public/build/<id>/music.json`: `beats`, `hits` (accent, strength), `markers` (break/build/drop/outro).

## 1. What gets a hit (and nothing else)

Rank every moment. Only tiers 1 and 2 land on the music.

| tier | what | lands on |
|---|---|---|
| 1 structural | cold-open freeze, title stamps, scene cuts, the break, the drop | the strongest accents (`hits` ≥ 0.6) and section markers |
| 2 story punch | a reveal, a stamp (不符合规律), a slam of the key number, the 10,000 flash, a door bangs open | the beat nearest the line that names it |
| 3 everything else | printing, writing, dealing cards, counting, pouring, flicking pages, walking, lights | **its own physical clock, not the beat grid** |

- **No metronome.** Never four or more consecutive beats each carrying a visual
  hit. The only exception is the title stamp (one character per half-beat, ≤ 2 s).
- **Budget.** Outside the drop, at most about one visual hit per 2 s, and under
  ~35 % of a scene's beats carrying a hit. The drop may go denser in a short burst
  (≤ 2 s), then must hold still.
- **Nothing pulses on beats.** Bars, light, glow, text, scale and camera do not
  throb or bounce with the beat. Landed text and charts stay still (explainer-video §5).
  A camera punch (`onBeat` scale or shake) is for tier 1 and 2 hits only, ≤ 3 per scene.
- **Hits mean more when rare.** Put calm before a hit (a held frame, a slow move)
  and stillness after it. The quiet before the drop is part of the drop.

## 2. Continuous actions keep their own clock

Quantising a repeated action to the beat is the most common mistake. Rules:

- **Machines** (a printer, a ticker, a clock): a steady period that is *not* the
  beat period (e.g. 17 frames against a 15.25-frame beat), with an occasional
  longer pause (paper feed).
- **People** (writing, dealing, counting): start slow, speed up as they get into
  it, small irregularity (±15 %), never metronomic. Example from 《第一位数字》:
  `t += 6 + 14·0.84^i + jitter` for dealing cards; writing weights `1.35 − 0.07·i`.
- **Sweeps** (tabs lighting 1→9, a finger along a row): one quick gesture
  (4–6 frames per item), started on the line; don't spread it over nine beats.
- Highlights that accompany a sequence (red circles on the cheques' first digits)
  arrive together on the line that talks about them, not one per item per beat.

## 3. Cuts and shot length

- Cut on a tier-1 accent, on an action (a hand reaches, a page flies), or on the
  line, in that order of preference. A cut carries something across (explainer-video §5, Flow).
- Picture changes land with their subtitle; the picture may lead the line by
  2–4 frames, never trail it.
- Shot length follows the music section, not a constant. Long, moving shots in
  the intro and break; shorter shots in the build; on the drop, one big hit and
  then a held shot that the viewer can read.
- Measure, don't guess: compare against the owner's reference series (§5).

## 4. Check it (every render)

```
python -m pipeline.beatlock out/<id>.mp4 <id>      # metronome runs + per-scene hit share
python -m pipeline.stillness out/<id>.mp4 0.2      # dead air
```

`beatlock` masks the subtitle band, finds sudden picture changes (not camera
moves), and counts a beat as hit when a change lands within ±1 frame. Before the
fix, 《第一位数字》 showed `reveal 23/23 (100 %)` (bars and light pulsing on every
beat) and a 17-beat run in `cheques` (printing on the beat); both are now gone.
Fix any metronome run outside the title, and any scene above ~35 % unless it is
a short burst on the drop. Then watch the flagged stretch with sound.

## 5. The reference table (our "database")

Public datasets describe film editing in general, not this genre:
- AVE (Argaw et al., ECCV 2022): ~196k movie shots labelled with shot size,
  angle, motion and cut type; useful vocabulary, not tempo targets.
- Visual Rhythm and Beat (Davis & Agrawala, SIGGRAPH 2018; `pip install visbeat3`):
  detects visual beats in video; a second opinion on `beatlock`.

The real reference is the owner's series (Vibe知识大赏). When the owner shares
reference episodes, measure each one and append a row to
`explainer/references/edit-stats.json`:
- cuts per minute per music section (ffmpeg `scdet`);
- the share of cuts on an accent;
- `beatlock` hit share and the longest metronome run;
- the mean shot length on the drop.

Use those numbers as targets for new episodes. Do not commit the reference
videos themselves; keep them under `models/` (not in git).
