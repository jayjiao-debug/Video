# Pixel detective series: where things stand

Pixel-art vertical shorts for Douyin (Chinese audience), narrated by a cute chibi Sherlock Holmes.
The current format is an **interactive mystery**: the viewer is the detective, the video pauses so they can
name the culprit in the comments, and then the solution is shown.

## Finished cuts (`deliverables/`)
| File | What it is |
|---|---|
| `case01_v2_with_opening.mp4` | Case 1 with the series opening, 2:48. This is the latest cut. |
| `case01_v2.mp4` | Case 1 v2 without the opening, 2:36 |
| `opening_v1.mp4` | Series opening only, 12.5 s |
| `case01_script.md` | Case 1 clues and solution |
| `vn_sample.mp4`, `vn_faces_sheet.png` | Visual-novel style test: detailed 128×128 portraits (Holmes, secretary) with layered expressions, 25 s dialogue |
| `sherlock_movement_test_v5.mp4`, `sherlock_cute_faces.png` | The approved character: v3 rig with the cute expression faces |

## Decisions already made by the owner
- **Character:** keep the v3 rig style, with cute faces only (^^ happy, round shiny eyes, blush). No eyewear for now.
  The "hybrid" redraw (`tools/holmes_hybrid.py`, v4) was rejected because it changed the style.
- **Case format:** about 2:30 or a little more. It must not be too easy: use two layers, never point out the key clue,
  and make sure every clue is visible before the pause.
- **Opening:** the owner asked for one like the *Moonflower Murders*–style fan opening (navy, black and white
  silhouettes, a cut on every beat, round shapes morphing into each other). The pixel version is in `opening/`.
  The series title "像素福尔摩斯" is a placeholder until the owner picks a name.

## Visual-novel portraits (`vn/`)
The owner asked whether the characters could look more real, with specific facial expressions.
`vn/vn_faces.py` takes one generated bust per character and pixelises it to 128×128. Expressions are then painted
onto that same bust as layers (eyes, brows, mouth, extras), so the character never drifts between expressions.
`vn/vn_scene.py` renders the dialogue sample: typed text with blips, mouth flaps, blinks, a 追问！ shout,
and a flash and speed lines on the shock beat. Not yet approved by the owner.

## Pipeline
All art is drawn on a 216x384 grid and shown at 5x (1080x1920, 30 fps). The frames are rendered with PIL and piped into ffmpeg.

```bash
# character sprites (writes public/sprites/holmes_*.png)
python3 tools/holmes_rig.py

# case 1
cd case01
python3 case_art.py          # pixelise art_src/*.webp into art/*.png
python3 case_voice.py        # TTS per line -> audio/voice.wav + timeline.json (everything is timed from this)
python3 case_render.py       # -> out/case01_raw.mp4   (case_render.py still 31.5 for a single frame)
python3 case_sound.py        # -> audio/mix.wav
ffmpeg -i out/case01_raw.mp4 -i audio/mix.wav -c:v copy -af loudnorm=I=-14:TP=-1.5 -c:a aac -b:a 192k out/case01.mp4

# opening (edit SUBTITLE / SUSPECTS at the top for each case)
cd ../opening
python3 opening_sound.py && python3 opening.py
ffmpeg -i out/opening_raw.mp4 -i out/opening.wav -c:v copy -af loudnorm=I=-14:TP=-1.5 -c:a aac -b:a 192k out/opening.mp4
```

- The script is in `case01/lines.json`. Speakers are N (narrator), B (butler), S (secretary) and P (nephew). Each voice is pitch-shifted from one TTS voice.
- The opening is spliced in after the hook (17.1 s, just before the case title card).
- Scene and portrait art was generated with an image model (seed 559153) and then pixelised by `case_art.py`.
  The sources are in `case01/art_src/`.

## Open items
- **Voice is a placeholder.** It uses free Google Translate TTS. edge-tts was blocked in the cloud environment.
  A production voice, from a TTS service or real recordings, is still needed.
- The nephew's portrait cut-out lost its dark jacket fill. The opening fills it back in; the case portrait card does not yet.
- Douyin note: the platform cracked down on "探案/说案" accounts that narrate real crime cases (Dec 2024).
  Keep cases fictional, label them original, and avoid gore.
