# ep52 key frames: shared brief (two builders, in parallel)

The owner approved the script (v4, hook C) on 2026-10-29 09:30. Make **14 key frames** for 《从一支箭，到火箭云》 (working title): China's rocket history, opening on today's 火箭云. Same engine and look as ep51 (approved).

## Read first
- **Script:** `/home/claude/video/episodes/52-huojian/script.md`. Read the **v4 hook C** section at the end first; the line table above it is v3. The timeline is `lines_read.json` (`[start, end, text, N]`, `[ ]` = highlight). Facts are in `facts.md`, section R plus rows A, D, G, H and I1. Put nothing on screen without a ✓ row.
- **ep51 code (the look to match):** `/home/claude/video/episodes/37-qiqing/remotion/src/qq51/`.
  - `palette51.ts`: the 「时代色」 tokens, `LookCtx` / `usePal` / `palOf`.
  - `props51.tsx`: `Walker51` / `LOOKS51` (the rim-lit faceless walker), `Forearm`, `Snow`, `Fridge`, `Defs51`.
  - `master51.tsx`: the subtitles (layout D), stamp, hollow J seal, title plaque. **No bottom-left counter.**
  - `partA.tsx`, `partB.tsx`, `partsB51.tsx`: how scenes are built.
  - `KF51A.tsx`: the key-frame entry pattern.
- **ep51 frames:** `/tmp/claude-0/-home-claude/bf206d1e-1152-5595-9b84-b15be6e5a777/scratchpad/kf51/` and `look51/配色对比.jpg` (the chosen 时代色 column).
- **Quality bar:** `/home/claude/video/docs/history-video-style/QUALITY_BAR.md`.

## Look
- ep51's 「时代色」: each era has its own mid-value colour key, figures are one-tone silhouettes with a warm rim, and gold hairlines.
- **The hero in this film is the rocket's light:** flame, exhaust and the glowing cloud. It is the brightest thing in every frame. Each era's rocket or flame sits warm against the era's colour field.
- **New era keys** (add them to a new `src/qq52/palette52.ts` and import ep51's palette for the rest):
  - **today night (火箭云):** deep blue-violet dusk sky, a dark town and ridge silhouette, and the cloud lit gold-white from the sun below the horizon;
  - **宋:** ochre and pale teal (from ep51's Song);
  - **明 (water):** slate-green water, vermilion accents;
  - **1956–1960 上海:** grey-blue sea dawn, sand, reed-straw yellow;
  - **1970 / space:** near-black with a blue limb of the Earth;
  - **月背:** cool grey regolith, black sky;
  - **太原 2026 launch:** night with floodlights.
- **No faces.** People are silhouettes, including 钱学森, 王希季 and 杨利伟, who are only ever shown from behind or as tiny figures, with no likeness. No real photos copied, no logos or flags on rockets (generic markings only), no maps.
- Hands are simple mittens that touch what they hold.

## Furniture (as in ep51)
- Subtitle layout D (top-left), verbatim from `lines_read.json`, curly “ ”, highlight = cream with a gold underline.
- Two-line stamp top-right (era/year · place / a short source note: use the script's stamp column; for the v4 hook lines use 「1960 · 上海 / 国防科工局」 and 「2024 · 嫦娥六号 / 新华社」).
- Hollow J seal bottom-right. **No counter.**
- Phone-safe: ≥ 120 px from the sides, ≥ 58 px from top and bottom.
- Labels ≥ 40 px; big numbers ≥ 96 px on a feathered scrim.

## The frames (t = film seconds in the v4 timeline)
| KF | t | Line | What must be in it | Builder |
|---|---|---|---|---|
| KF01 | 0.0 | H1 | **Frame 0 (must read in 2 s on a phone):** today's glowing 火箭云 (a luminous jellyfish/teardrop plume with a bright twisting trail rising from the horizon) over a dark town and ridge at dusk. Row 1 of H1 is on screen. The picture is today, the words are 1960: the contrast is the hook. | A |
| KF02 | 8.0 | H3 | The same sky: the cloud brighter, and a small capsule glint arcing back down toward the viewer (「带回来」). Both rows typed, 带回来 highlighted. | A |
| KF03 | 11.5 | TITLE | The ep51 plaque with the title 「从一支箭，到火箭云」 (two rows) over the rewind: the cloud collapsing back into a single fire-arrow in a Song hand. No subtitle, no stamp. | A |
| KF04 | 19.0 | 先猜？ | 宋 (ochre and teal): the walker in Song clothes holds a fire-arrow (an arrow with a small paper-wrapped powder tube behind the head). Q line 「可宋朝的火箭，靠什么飞？」, with 先猜？ options 火药？ · 弓？ (≥ 44 px, one baseline). | A |
| KF05 | 23.5 | A1 | The answer: the walker draws a bow with the fire-arrow nocked, its fuse lit. 靠[弓] highlighted. | A |
| KF06 | 31.5 | 一窝蜂 | 明: a wooden barrel launcher bristling with 32 small rocket-arrows firing as a swarm of sparks. Tag 「一桶32支」. | A |
| KF07 | 36.5 | 火龙出水 | 明, on the water: a dragon-shaped tube flying low over the waves on four booster rockets, and smaller rockets bursting out of its mouth (the second stage). Label 「相当于两级火箭」 (国家航天局). | A |
| KF08 | 45.0 | 1960 | 上海 beach at dawn, grey-blue: a slim liquid sounding rocket (T-7M-like, generic) on a simple launch rail, **a bicycle pump with a hose to the rocket**, reed huts behind. The stamp says 1960. | B |
| KF09 | 52.0 | 王希季 | A sandbag command post (a low wall of 麻袋), a small silhouette behind it with a hand-held phone or flag, and the rocket rising off the rail on a bright thin flame. Respectful, small figure, no face. | B |
| KF10 | 56.5 | 1970 | Space: near-black with the Earth's blue limb, a faceted ball satellite with four whip antennas (东方红一号, generic) in orbit, and a big panel 「最高 2384公里」. | B |
| KF11 | 73.0 | O5 「而且，它回来了」 | **The hand motif:** a small return capsule glowing from re-entry drops into the walker's open mitten (modern jacket), at dusk on grassland. Tag 「1935.3克 · 人类首份月背样品」. | B |
| KF12 | 85.0 | 672 | 太原 at night under floodlights: a generic medium rocket with **four strap-on solid boosters** lifting off on a bright flame. A big numeral 「第672次」 on a scrim. | B |
| KF13 | 96.0 | R2 | **Why it glows**, as a clear diagram-like picture: the ground and town in dark night at the bottom, the curved horizon, the sun below it on one side, and its rays lighting the high plume only. Label 「高空还有阳光」 (≥ 40 px). Subtitle with [阳光]. | B |
| KF14 | 113.0 | END | Juno end card over the dimmed 火箭云: red J stamp, title (two rows), the question 「你见过火箭云吗？在哪儿？」 centred (with the trailing ？ ½-em pull), the 「关注 Juno · 一起看懂世界」 pill, and the sources line from script.md. No stamp, no seal. | B |

## Files (do not edit qq51/ or each other's files)
- Folder: `/home/claude/video/episodes/37-qiqing/remotion/src/qq52/`.
- **Builder A owns** `palette52.ts` (create it first, because B imports it), `props52.tsx` (the 火箭云 plume, fire-arrow, bow, rocket flame, generic rocket body: export early), and `KF52A.tsx`:
  - registerRoot;
  - `KF52A-ALL` (frame i = KF01…KF07);
  - one id per frame.
- **Builder B owns** `KF52B.tsx` (+ `partsB52.tsx`):
  - `KF52B-ALL` (KF08…KF14);
  - B imports A's palette52 and props52; anything it needs changed, it copies locally.
- **Stills**, run from `/home/claude/video/episodes/37-qiqing/remotion`:
  `ENTRY=qq52/KF52A CID=KF52A-ALL BUNDLE_DIR=<own scratch dir> REMOTION_BROWSER=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell node scripts/frame_ms.mjs stills <outdir> <t…>`
  - frame i = t·30;
  - `JPG=1 SCALE=0.5` for quick looks.
- **Final PNGs** go to `/tmp/claude-0/-home-claude/bf206d1e-1152-5595-9b84-b15be6e5a777/scratchpad/kf52/KF01.png … KF14.png`.
- Typecheck with `npx tsc --noEmit -p .`.
- Disk is tight: keep one bundle each and delete it when done. Don't commit. Never `pkill -f` a pattern from your own command line.

## Before handing back
- Check every frame at full size and at 25 % against QUALITY_BAR.md and the ep51 frames: the same family, the same walker, the same furniture.
- Fix anything weak yourself.
- Hand back: frame → contents → anything unsure, plus the PNG paths.
- Budget: about 60 minutes.
