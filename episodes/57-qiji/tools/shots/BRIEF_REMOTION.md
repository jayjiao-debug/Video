# ep57 history scenes in Remotion — shared brief (owner-approved standard, 2026-11-03 09:54)

The owner approved two reference scenes. Build your stop's history section to the same standard.
- `episodes/37-qiqing/remotion/src/qq57/Q57CHICHEN.tsx` (奇琴伊察): a live 3D model, natural backgrounds, the sun→stairs relation, widgets.
- `episodes/37-qiqing/remotion/src/qq57/Q57COLO.tsx` + `episodes/57-qiji/tools/export_colosseum.py` (斗兽场): still layers exported as SVG from the Python drawing code, with the building built live from exported geometry.

Read both reference files first, and copy their helpers (`Widget`, `T2`, `Callout`, the easing functions) into your file.

## What it is
Each stop has two story shots, each **3 bars = 5.016 s** (150 frames at 30 fps), so the composition is 300 frames.
- t = 0 of each shot is a downbeat (the kick). Beats fall every 0.418 s, bars every 1.672 s.
- Put the strong moments on beats, and the strongest on bar starts.
- Alternatively, a stop can be one continuous 6-bar time-lapse, if that tells it better.

Subtitles are added later, so don't draw them. But each shot must *show* its line:

| stop | shot A | shot B |
|---|---|---|
| 马丘比丘 (machu) | 它很可能是印加皇帝的山顶行宫，建在两千多米高的山上。 | 后来西班牙人征服了印加，却一直没找到它。 |
| 基督像 (christ) | 1922年，里约的天主教徒觉得这座城越来越不信神了， | 于是大家捐钱，在山顶立起了它。 |
| 佩特拉 (petra) | 两千年前，运香料的骆驼队都要经过这里。 | 纳巴泰人收过路税发了财，把城刻进了石头里。 |
| 泰姬陵 (taj) | 皇后生下第14个孩子后去世，皇帝为她修了二十多年。 | 晚年他被软禁，只能远远望着它；死后，葬在了她身边。 |

## The owner's rules (all of these came from feedback today)
1. **The look.** Use the history drawings' style: flat colour, ink line `#2A211B` at 2–3 px, warm rim light, faceless figures. Start from your stop's existing history drawings in `episodes/57-qiji/tools/hist_a.py` / `hist_b.py` / `hist_c.py`; their PNGs are in `/tmp/claude-0/-home-claude/240969aa-174a-5914-92b5-d529595dbe80/scratchpad/sb57/hist/`.
   - No new styles: no silhouettes-only, no blueprint, no "你" character, no photos.
2. **Built live in Remotion, not a still picture with effects.**
   - Things that are built must actually be built with vector art: courses rising, parts placed in order, scaffolding, cranes or ropes, workers, rubble.
   - Never a wipe, clip reveal, fade-in or slide-in of a finished picture. The owner rejected "just revealing or effects" explicitly.
3. **Natural backgrounds.**
   - Real-looking sky, terrain and vegetation, with depth (far, mid and near layers).
   - Not flat colour fields.
   - Grass and props must never slide under or poke through buildings when the camera moves: place them in the same space as the building, or keep them clear of it.
4. **No jitter.**
   - Tiny figures must not jitter or wobble. No per-frame random, and no walk cycles on figures under ~80 px.
   - Movement must be smooth: rigid groups gliding, slow eased motion.
   - Never re-project a dense drawing every frame. It shimmered.
5. **Camera.**
   - Smooth moves only: layered parallax via transforms, or a live 3D model as in 奇琴伊察.
   - For construction time-lapses, a **fixed camera** is fine (the owner asked for that on 斗兽场).
   - Shots A and B should differ in framing.
6. **Show cause and relation, not things happening on their own.**
   - Example: the owner asked to show the *sun's relation* to the stairs (rays through the terrace corners) and to add the serpent head.
   - Make the explanation visible.
7. **Interactive elements.**
   - Counters, year or date widgets, progress bars, callouts with leader lines that draw in, labels that count up.
   - Use the reference `Widget`, `T2` and `Callout` look.
   - Keep them out of the subtitle zone (x 150–1250, y 110–330), the counter zone (x 1480–1800, y 55–135), the odometer zone (x 130–720, y 960–1050) and the seal (x 1700–1800, y 950–1050). The right column from y 150 down is where the references put widgets.

## Facts you may put on screen (don't add others without a primary source; never Wikipedia, 百度百科 or 知乎)
- **马丘比丘:**
  - Built about 1450 for the Inca ruler Pachacuti, as a royal estate.
  - Altitude about 2,350 m (Britannica: 7,710 ft).
  - Spanish conquest of the Inca 1532–1572; the site never appears in Spanish records.
  - Made known to the outside world in 1911 (Hiram Bingham).
- **基督像:**
  - The Catholic campaign and donations started 1922.
  - Built 1926–1931, inaugurated 12 Oct 1931.
  - The statue is about 30 m tall (38 m with its pedestal), arms about 28 m.
- **佩特拉:**
  - The Nabataean capital on the incense route (frankincense, myrrh, spices). Caravans paid tolls.
  - The Treasury (Al-Khazneh) was carved in the 1st century AD, *from the top down*, out of the rose sandstone. It is about 39 m high.
  - It was most likely a royal tomb.
- **泰姬陵:**
  - Mumtaz Mahal died in 1631 giving birth to their 14th child. Shah Jahan began the mausoleum in 1632; the complex was finished about 1653.
  - Built by about 20,000 workers.
  - Shah Jahan was deposed by his son in 1658 and confined in Agra Fort, from where he could see the Taj. He died in 1666 and was buried beside her.

## How (the method that worked)
- **Still parts:** export them from the Python drawing code as SVG layers into `episodes/37-qiqing/remotion/public/ep57/<stop>/` with a new `episodes/57-qiji/tools/export_<stop>.py`.
  - Capture the drawing's element list between function calls (see export_colosseum.py; `HB.write` is monkeypatched).
  - Load the layers with `<Img src={staticFile(...)} />`.
- **Moving parts:** build them in TSX.
  - Either from exported geometry as JSON (anchors and parameters), or by porting small drawing functions.
  - Import JSON as `import data from '../../public/ep57/<stop>/<stop>.json'`.
- **Your file:** `episodes/37-qiqing/remotion/src/qq57/Q57<STOP>.tsx`, with its own `registerRoot` and composition id `Q57<STOP>` (e.g. Q57TAJ, Q57PETRA, Q57CHRIST, Q57MACHU).
- **Rendering.** Use the local Chromium, because Remotion can't download its own. The machine has 2 CPUs shared by 4 agents, so check with `npx remotion still` frames and do one full render at the end with `--concurrency=1`.
  ```
  CH=$(python3 -c "from playwright.sync_api import sync_playwright as s; p=s().start(); print(p.chromium.executable_path); p.stop()")
  cd /home/claude/video/episodes/37-qiqing/remotion
  npx remotion still src/qq57/Q57X.tsx Q57X /tmp/.../scratchpad/sb57/shots/q57/<stop>_f60.png --frame=60 --browser-executable="$CH"
  npx remotion render src/qq57/Q57X.tsx Q57X /tmp/claude-0/-home-claude/240969aa-174a-5914-92b5-d529595dbe80/scratchpad/sb57/shots/q57/<stop>_raw.mp4 --browser-executable="$CH" --concurrency=1
  ```
- **Checking.** Look at your stills and at a contact sheet of the final render at full size and at 480×270. Fix what looks wrong:
  - joints and figures;
  - anything floating;
  - text overlapping the zones;
  - grass or props under buildings;
  - any shimmer between consecutive frames.

## Don't
- Don't commit. The main session commits.
- Don't edit any other existing file: copy code out of the references and drawing scripts; don't change them.
- Never run `pkill -f`.

## Report (a few lines)
- The files you wrote.
- The final mp4 path.
- What moves in each shot and on which beat.
- What is still weak.
