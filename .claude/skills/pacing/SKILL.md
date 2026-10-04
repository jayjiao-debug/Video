---
name: pacing
description: Pace a subtitle-only Juno / VIBE知识大赏 explainer so the viewer never finishes a line and then waits, without breaking the music or the flow - reading-speed budget per line, story added where windows are long, music cut only in whole half-phrases, a 6–12 % waiting band, and the pace + flow check (pipeline/pace.py) before any render is sent. Use when writing or timing an episode's lines, when a plan warns a window is stretched, before rendering, or when the owner says it is slow, drags, 节奏太慢, 字幕读完了干等, 拖, or after a re-pace that 卡不上点 / 不流畅.
---

# Pacing

The owner on 《夸完就翻车》 (first cut, 2:44): "节奏太慢了，好多时候我字幕都读完了干等". The pace check
measured it: 22 % of the runtime was the viewer waiting after finishing a line, with
lines held 5–7 s for 10–16 characters. 《八百人猜牛》 measured 25 %. The cause was the
pipeline, not the story: every episode was stretched to fill the whole 164 s track, and
the planner scales each window's lines up to fit its music anchors (×1.3–1.6), so the
emptier the window, the longer each line sat on screen.

**Rule: a line stays on screen as long as it takes to read, plus a moment to take in the
picture.** When the music leaves more time than the story needs, add story first; cut music
only in whole half-phrases. Never let lines sit, and never squeeze the picture to get there:
the music must still land and the camera must still breathe (§3).

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

`--plan` then warns `have 12.8s of text for a 15.9s window (x1.25)` for any window that
would hold lines more than 15 % longer than their natural length. Fix every one (§3).

## 2. Visual beats are scripted, not leftover

Time without a new line is fine when it is planned and something happens in it: the
title card, the drop's impact, the coins being thrown, a time-lapse. Write it as a
`pause:` with a comment naming the event (`- pause: 1.2   # the second coins land`). If
you cannot name the event, it is dead air: cut it.

Budget per beat type:
- hook question → title: the question's hold covers the transition action (the coin toss), ≤ 2 s;
- the drop: the answer's first line lands with the drop, no extra hold;
- the end card: ~6 s, it carries its own reading (title, question, follow line);
- tip cards: each card is read like a line (no subtitle under it, see explainer-video §5).

## 3. When a window is too long for its lines

v2 of 《夸完就翻车》 cut six 2–4-bar pieces out of the track to kill every wait (2:44 → 2:12,
waiting 5 %). The owner: "音乐卡不上点了，画面流畅性不够". Three things went wrong: the
cuts broke the music's phrases (a 24-beat phrase where the ear expects 32), each crossfade
pulled the rest of the track 30 ms early (~90 ms off by the drop, three frames), and the
squeezed windows crammed every camera move and cut into less time. So, in this order:

1. **Add story.** A concrete detail, a number, the doubters' question, a line that leads
   into the next scene ("他说：去机库，我做给你们看。"). Each new line needs its own visual
   change (a new shot, a cut back, a push toward the next place).
2. **Move the anchor** to an earlier accent so the window shrinks.
3. **Cut music only in whole half-phrases** (16 beats ≈ 8.1 s at 118 bpm, on the 16-beat
   phrase grid counted from the break), at most one or two per episode, in a section
   that repeats (the second half of the drop section after the answer has landed). Never
   inside the hook, across the title hit, the drop's onset, or an accent a line is
   pinned to. The planner snaps `music_cut` to that grid and compensates the crossfade,
   and maps markers through the cuts (keep writing them in original-track time).

   ```yaml
   music_cut:
     - [98.01, 106.15]   # beats 192–208: the drop section's second 8 bars
   ```

   After cutting, check the alignment: cross-correlate a second of the original after
   each cut with the edited track; the offset must be 0 ms.

Do not fix a long window by raising `hold:` or adding unnamed pauses, and do not squeeze
it until nothing breathes.

## Too tight is a failure too

Waiting below ~6 % means every window is squeezed: camera moves get faster, shots
shorter, transitions jump. Target **6–12 %**. When a scene's window shrinks, drop camera
keys instead of compressing all of them, and give every shot change at least ~1.5 s.

## 4. The pace check (before every render you send)

```
python3 -m pipeline.pace <id>                  # from the timeline: run after --plan
python3 -m pipeline.pace <id> out/<id>.mp4     # after the render: + picture motion in each wait
```

```
python3 -m pipeline.pace <id> out/<id>.mp4 --ref out/ox.mp4   # + flow next to an approved episode
```

It lists every line's on-screen time, its reading time and the wait after it, plus gaps
with no line, and with a video the flow numbers (motion mean / p95, jerk mean / p99).
Targets:
- total waiting **6–12 %** of the runtime (`TOO TIGHT` below 6 %, `TOO SLOW` above 12 %);
- flow within ~15 % of an approved episode (v2 of 《夸完就翻车》 was +20 % motion, +21 % jerk);
- no line waits more than **1.2 s** unless the picture makes a big change in that time
  (the report marks waits with a cut or landing in them);
- no gap without a line over ~2 s except the title card, a named visual beat and the end card.

`TOO SLOW` or `TOO TIGHT` means: go back to §3, re-plan, and re-check before rendering. Run it on the
plan first; a full render costs ~40 minutes.

## 5. Scenes that must follow the new timing

Scenes are timed from cues, so most follow a re-plan automatically. Check the ones with
fixed frame counts after a big cut: action schedules (throws, rows written, ticks), person
card facts (each needs ~1 s on screen before the card leaves), and anything that must
finish before the next cue. Shrink the schedules rather than letting actions spill into
the next line.
