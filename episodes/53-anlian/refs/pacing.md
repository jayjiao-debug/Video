---
name: "pacing"
description: "Pace a subtitle-only Juno / VIBE知识大赏 explainer so the viewer never finishes a line and waits: reading budget per line, no stretched windows, whole-bar music cuts, the pace check. Use when timing lines or when it feels slow (节奏太慢, 字幕读完了干等)."
---

# Pacing

The owner on 《夸完就翻车》 (first cut, 2:44): "节奏太慢了，好多时候我字幕都读完了干等". The pace check
measured it: 22 % of the runtime was the viewer waiting after finishing a line, with
lines held 5–7 s for 10–16 characters. 《八百人猜牛》 measured 25 %. The cause was the
pipeline, not the story: every episode was stretched to fill the whole 164 s track, and
the planner scales each window's lines up to fit its music anchors (×1.3–1.6), so the
emptier the window, the longer each line sat on screen.

**Rule: the story sets the length, not the track.** A line stays on screen as long as it
takes to read, plus a moment to take in the picture. When the music leaves more time than
the story needs, take music out (whole bars) or add story. Never let lines just sit.

The pipeline lives in the GitHub repo jayjiao-debug/Video (branch claude/hopeful-curie-hm3mlq), under `explainer/`.

## 1. The reading budget

A phone viewer reads Chinese subtitles at about **7 characters a second**, plus ~0.5 s to
notice a new line. Budget per line:

    on screen ≈ 0.5 s + characters / 7  +  0.6 s to look at the picture

| line | read | on screen |
|---|---|---|
| 这就是回归均值。 (7 字) | 1.5 s | ~2.1 s |
| 第一枚最近的几位，第二枚大多变远了。 (16 字) | 2.8 s | ~3.4 s |
| the 22-character maximum | 3.6 s | ~4.2 s |

Longer is allowed only when the picture is delivering something new in that time: a
reveal landing, coins in flight, a cut. A slow camera drift is not news.

Set this in `episode.yaml` so the plan warns when a window stretches lines:

```yaml
reading: {cps: 6.5, base: 0.5, min: 1.6, gap: 0.2, maxStretch: 1.15}
```

`--plan` then warns for any window that would hold lines more than 15 % longer than their
natural length. Fix every one (§3).

## 2. Visual beats are scripted, not leftover

Time without a new line is fine when it is planned and something happens in it: the
title card, the drop's impact, the coins being thrown, a time-lapse. Write it as a
`pause:` with a comment naming the event. If you cannot name the event, it is dead air: cut it.

- hook question → title: the question's hold covers the transition action, ≤ 2 s;
- the drop: the answer's first line lands with the drop, no extra hold;
- the end card: ~6 s, it carries its own reading;
- tip cards: each card is read like a line (no subtitle under it).

## 3. When a window is too long for its lines

1. **Cut whole bars out of the track** where the music repeats (`music_cut` in
   `episode.yaml`, original-track seconds). The planner snaps each cut to the beat grid
   and whole bars, crossfades 30 ms, and maps markers through the cuts, so keep writing
   markers in original-track time. Good places: the middle of the break, the middle of a
   long drop section after the answer has landed, bars between two anchored accents. Never
   cut across the hook→title hit, the drop's onset, or an accent a line is pinned to.
2. **Add story**, not filler: a concrete detail, a number, a second example. Each new line
   needs its own visual change.
3. **Move the anchor** to an earlier accent so the window shrinks.

Do not fix it by raising `hold:` or adding unnamed pauses. One idea at this density runs
~2:00–2:20 (《夸完就翻车》: 2:44 → 2:12 with six music cuts, waiting 22 % → 5 %).

## 4. The pace check (before every render you send)

```
python3 -m pipeline.pace <id>                  # from the timeline, after --plan
python3 -m pipeline.pace <id> out/<id>.mp4     # after the render, + picture motion in each wait
```

Targets: total waiting ≤ 12 % of the runtime; no line waits > 1.2 s unless the picture
makes a big change in that time; no gap without a line over ~2 s except the title card, a
named visual beat and the end card. `TOO SLOW` means back to §3, re-plan, re-check, before
rendering (a full render costs ~40 minutes).

## 5. Scenes that must follow the new timing

Scenes are timed from cues and mostly follow a re-plan. After a big cut, check fixed frame
counts: action schedules (throws, rows written, ticks), person-card facts (each needs ~1 s
on screen), anything that must finish before the next cue. Shrink the schedules rather than
letting actions spill into the next line.