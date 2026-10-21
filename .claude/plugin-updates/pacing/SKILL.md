---
name: "pacing"
description: "Pace a subtitle-only Juno / VIBE知识大赏 film so the viewer never finishes a line and waits: reading budget per line, planned visual beats, what to do when the song is longer than the story, the pace check. Use when timing lines or when it feels slow (节奏太慢, 字幕读完了干等) or too fast (看不过来)."
---

# Pacing

The owner has said both "节奏太慢了，好多时候我字幕都读完了干等" (《夸完就翻车》, 22 % of the runtime spent waiting)
and "感觉节奏太快有点看不过来" (ep14 at 1:36). The target sits between: every line gets time to be read and the
picture gets time to land, but nothing just sits. The owner's comfortable length is about 2:00.

## 1. The reading budget

A phone viewer reads Chinese subtitles at about **7 characters a second**, plus ~0.5 s to notice a new line:

    on screen ≈ 0.5 s + characters / 7 + 0.6 s to look at the picture

| line | on screen |
|---|---|
| 这就是回归均值。 (7 字) | ~2.1 s |
| 第一枚最近的几位，第二枚大多变远了。 (16 字) | ~3.4 s |

Longer is allowed only when the picture is delivering something new in that time (a reveal landing, an action,
a cut). A slow camera drift is not news.

## 2. Visual beats are scripted, not leftover

Time without a new line is fine when it is planned and something happens in it: the title on the drop, a
payoff image, the end card (~6 s). Write it into the script with the event named. If you can't name the event,
it is dead air.

## 3. When the song is longer than the story

The owner's track is never cut, looped or crossfaded (house-rules §8.1), so length = where the song ends. Fix a
gap with, in this order:
1. **Add story**, not filler: a concrete detail, a number, a second example, each with its own visual change.
2. **Give payoffs room:** 10–12 beats for a big visual payoff instead of 8.
3. **Fade out over the final bar** at an earlier section end (the only allowed music edit).
Never fix it by holding lines longer.

## 4. The pace check (before every render you send)

```
python3 .claude/skills/video-reviewer/scripts/pace.py episodes/<NN>/lines.json --film-end <seconds>
```

Targets: waiting ≤ 12 % of the runtime, up to ~20 % only where the picture carries the time (owner, ep14); no
line waits > 1.2 s unless the picture makes a big change; no gap without a line over ~2 s except the title, a
named visual beat and the end card.

## 5. After re-timing

Check anything with a fixed frame count (action schedules, counters, person cards): shrink the schedule rather
than letting an action spill into the next line.
