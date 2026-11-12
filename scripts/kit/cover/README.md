# cover/: covers and thumbnails

`cover.py` sets the hook on a clean still: gold lines with a dark outline and a soft shadow, a dark ramp behind them,
a vignette, a cream title and an optional gold series line. Pillow only. Built from the Hongmen cover scripts
(`gold_text`, `plain`, `shade`, `side_shade`, `vignette`, `fit`); Hongmen's published covers are
`scripts/hongmen/cover/spec.json` and `spec_en.json` and come out pixel for pixel as before.

```bash
# one cover from the command line
python3 scripts/kit/cover/cover.py --bg /home/user/work/still_34.png --layout low --target douyin34 \
  --hook "他靠上厕所" --hook "躲过了一场暗杀" --title "《鸿门宴，到底死了谁？》" [--series "系列名"] \
  [--font public/bt/sans700.ttf] --out /home/user/work/cover_3x4.png
# every cover of a film (paths in the spec are relative to the spec's folder)
python3 scripts/kit/cover/cover.py scripts/hongmen/cover/spec.json
```

Inputs: the background (`bg`, optional `crop` [x0, y0, x1, y1], optional `size` for a uniform resize), the `layout`,
the `hook` lines, the `title`, the `series` line, the `font` (default `public/bt/sans700.ttf`, already in the repo),
the `target` (shape and safe zone to check), `same` (all hook lines at one size), and `override` (any layout number).
Layouts (px sizes for a 1080 px short side, scaled with it; each line is fitted to its width, the size only shrinks):

| layout | where the type goes | made for |
|---|---|---|
| `low` | a band under the middle (hooks at 66.5 % and 74.5 % of the height, title 80.5 %), dark ramp from 58 % to 74 % | Douyin 3:4, Shorts 9:16 |
| `side` | a column on the left (centre at 27 % of the width), subject on the right, dark side ramp to 56 % | Douyin 4:3, YouTube 16:9 |
| `top` | the top third (12 %, 19 %, title 24.5 %), dark ramp from the top to 40 % | Shorts 9:16 |
| `bottom` | the lower half (66 %, 80 %, title 91 %) | 16:9 with the subject high |

## Safe zones (checked and printed for `--target`)

| target | size | rule |
|---|---|---|
| `douyin34` (竖版) | 1080 x 1440 | type at least 6 % from every edge; the lower 18 % holds no type (Douyin lays its own text there) |
| `douyin43` (横版) | 1440 x 1080 | the same: 6 % from every edge, nothing in the lower 18 % |
| `shorts916` | 1080 x 1920 | 6 % from every edge; nothing in the lower 22 % (the Shorts title and channel row); the hook in the upper or middle band |
| `youtube169` | 1280 x 720 | 5 % from every edge |

Glyphs read best at 120 to 160 px tall on the 1080 covers (Chinese); Latin capitals are wider, so English lines come
out smaller (60 to 100 px) and need the full width.

## Two rules learned the hard way

- **Never stretch a cover.** `cover.py` refuses a background whose shape is not the target's (after the crop); it
  only resizes uniformly. Hongmen's first 4:3 / 3:4 preview covers came out stretched (a 9:16 lens on a 4:3 picture: wide
  faces) and had to be made again.
- **Render the still at the cover's own shape (lens aspect).** The film's World takes the drawing buffer's shape for
  the lens (Hongmen `world.ts` `aspect()`, commit def97b77), so a 4:3 still shows MORE of the set at the same vertical
  field of view instead of a squashed 9:16 frame. Clean stills (no captions, no HUD) at the cover's size:
  ```
  bash scripts/kit/queue/still.sh src/videos/hongmen/preview/film.ts /home/user/hm_work/cover/wide --pick 20 --size 1440x1080
  bash scripts/kit/queue/still.sh src/videos/hongmen/preview/film.ts /home/user/hm_work/cover/tall --pick 20 --size 1080x1440
  bash scripts/kit/queue/remotion_still.sh HongmenFilm 20 /home/user/hm_work/cover/c916.png --props='{"cover":true}' --scale=1
  ```
  (`cover: true` = no captions, HUD or overlays; `zoom`, `sx`, `sy` frame it: `src/kit/film/env.ts`.) A new film's
  World needs the same `aspect()` before its covers are rendered at other shapes.

Pictures never go into the repo: stills and covers live under `/home/user/<film>_work/cover/`.
