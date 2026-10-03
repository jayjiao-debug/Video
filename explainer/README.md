# Explainer pipeline

Cinematic, subtitle-driven science explainers (no narration): a story told in
short burned-in lines over one background track, with hand-built motion
graphics cut to the music.

```
episodes/<id>/episode.yaml   the script: scenes, subtitle lines, sources, music anchors
episodes/<id>/scenes.tsx     the visuals: one React component per scene
        │
python make.py <id> --plan   analyse the track → timeline.json, subset fonts
python make.py <id> --stills QA contact sheet (one frame per subtitle line)
python make.py <id>          render 1920×1080 → master audio to −14 LUFS → out/<id>.mp4
python make.py <id> --share  small copy for chat/previews → out/<id>-share.mp4
npm run studio               live preview in the browser (after --plan)
```

## Setup

```bash
./setup.sh                     # npm + pip deps, source fonts
cp ~/my-track.mp3 assets/music/bgm.mp3
python3 make.py survivorship --plan
```

Needs Node 18+, Python 3.10+, ffmpeg, and Chrome/Chromium (Remotion finds its
own; on this cloud box `make.py` points it at the preinstalled headless shell,
or set `REMOTION_BROWSER`). Remotion is free for individuals and companies of
up to three people; larger teams need a [company license](https://remotion.pro).

## How timing works

There is no voice track, so the script drives the clock:

1. `pipeline/music.py` finds the track's beat grid (~118 bpm here), an energy
   curve, and section markers: `break` (the quiet stretch), `build`, `drop`,
   `outro`. Episodes can add their own (`markers: {a: 16.1}`).
2. A scene with `at: drop` starts exactly on the drop. Scenes between two
   anchors share that window. Each line gets a reading-speed duration
   (≈4.6 Chinese characters per second, min 1.9 s), scaled to fill the window.
   The plan step warns if a window is badly over- or under-filled.
3. Line starts snap to the nearest beat (±0.22 s), so subtitles land on the music.
4. The backdrop's key light follows the track's energy, dims through the break
   and flashes on the drop, on every episode without extra work.

Scene components read their cue points with `useCue()`: `cue(2)` is the frame
the third line appears, so visuals change exactly when the words do.

## Script format

```yaml
scenes:
  - id: twist
    component: Twist          # export from scenes.tsx
    at: break                 # optional anchor: marker name, "drop+1.5", or seconds
    kicker: 统计研究小组 · SRG  # small chapter label above the stage
    cite: Wald, 1943          # source line under the subtitles
    lines:
      - 统计学家[亚伯拉罕·瓦尔德]却说：   # [gold] = the answer
      - {text: 不。, hold: 2.2}        # fixed duration
      - 结论很明显：就{加固}哪里。       # {red} = the trap
      - pause: 2                       # visual beat, no subtitle
```

## Design system (`src/`)

- `components/Backdrop.tsx`: night gradient, music-reactive key light, fog,
  depth-of-field dust, drop flash, film grain and vignette.
- `components/Subtitles.tsx`: characters ripple in; gold/red markup glows.
- `components/Chrome.tsx`: series badge, scene progress pips, kicker, citation.
- `components/Stage.tsx`: the scene canvas (slow push-in, cross-fades), `<T>`
  for themed SVG text, `countUp`, glow filters.
- `lib/theme.ts`: colours, fonts, and layouts for landscape and vertical.
- `lib/context.tsx`: `useCue`, `useBeat`, `useEnergy`, `prog`, easing.

Set `format: vertical` in an episode for a native 1080×1920 version; the layout
keeps clear of the Douyin/TikTok overlays.

## Demo episode

`episodes/survivorship`: 《飞回来的飞机》, Abraham Wald and survivorship bias,
2:44 to a single instrumental track. Sources are listed at the top of its
`episode.yaml`.
