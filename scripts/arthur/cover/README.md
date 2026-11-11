# Arthur short: the covers

Three covers from one moment of the film (frame 138: Arthur shrugs, the sword is back in the anvil, the crown and the
"?" hang over his head), with the hook set in the film's caption type: 拔出石中剑 / 又插了回去？

| cover | size | for |
|---|---|---|
| `arthur_cover_9x16.png` | 1080 x 1920 | YouTube Shorts (upload in Studio on a computer), the video's own ratio |
| `arthur_cover_3x4.png` | 1080 x 1440 | Douyin 竖版 |
| `arthur_cover_4x3.png` | 1440 x 1080 | Douyin 横版 |

The pictures are not kept in the repository (`*.png` is ignored here). To make them again:

1. Clean stills, one per ratio (no captions; each one shows more around the film's frame, see the cover props in
   `src/videos/arthur/world.ts`). From the repository root, about half a minute each:

   ```
   R="npx remotion still src/index.ts ArthurFilm"; O="--frame=138 --gl=swangle --timeout=900000 --log=error"
   $R scripts/arthur/cover/c916_f138.png $O --props='{"nocap":true,"zoom":0.75,"sy":0.096}'
   $R scripts/arthur/cover/c34_f138.png  $O --props='{"nocap":true,"zoom":0.58,"ov":0.75}'
   $R scripts/arthur/cover/c43_f138.png  $O --props='{"nocap":true,"zoom":0.37,"sx":0.19,"ov":0.56}' --scale=1.5
   ```

   `zoom` < 1 shows more around the same frame, `sx` / `sy` move the picture right / down by that fraction of the
   frame, `ov` is the size of the crown and the "?" (they are drawn in screen px, so they do not shrink with `zoom`).

2. Crop and type: `python3 cover_text.py spec.json` (needs Pillow and numpy). `spec.json` holds, per cover, the crop,
   the scrim behind the type, the lines with their sizes, and the anchor (the middle of the lines and the top of the
   first one).

The English cover (YouTube Shorts, 9:16 only): the same clean still with `python3 cover_text.py spec_en.json`
(`arthur_cover_en_9x16.png`, PULLED IT OUT. / PUT IT BACK?). Latin capitals in this face are wide, so the two lines are
94 and 111 px tall, smaller than the Chinese glyphs, and keep 7.8 % from the sides.

What the script checks and prints: every line is centred by its ink, not by its advance width (a line that ends in a
full-width ？ would otherwise sit left of centre), and the margins of the type. The type keeps at least 6 % from every
edge, the glyphs are 120 to 160 px tall, and on the two Douyin covers the lower 18 % holds no type.
