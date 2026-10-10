# 《你买的不是包》 · 镭射纸雕剧场 — production brief for scene builders

The owner (Chinese Douyin channel "Juno · VIBE知识大赏") rejected the last cut as cheap: no camera moves (运镜), no
transitions (转场), no satisfying beat hits (卡点). He asked for a completely new, dazzling (炫丽) style nobody has seen,
master-class quality. The look is set; your job is to build scenes at the level of the two reference scenes
(`src/scenes/S01_hook.tsx`, `src/scenes/S02_title.tsx`). Read them first, and read `src/scene.ts`, `src/foil.tsx`,
`src/kit.tsx`, `src/beats.ts`, `src/Film.tsx`.

## The look: 镭射纸雕剧场 (holographic-foil paper-cut theatre)
- Every object is a **flat cut-out with a little thickness** (`<Cut d=… kind=…>` from an SVG path in mm, y down),
  standing in **depth layers** (2–60 cm apart) on a black velvet stage, so the camera's moves give real parallax and
  layers throw shadows on each other. Think luxury window display × pop-up book × laser show.
- Palette and materials (`kind`): `black` velvet paper (most of the frame), `gold` foil (structure, trims, numbers),
  `holo` rainbow foil (accents only: rays, charms, a highlight, a key word; it shimmers as the camera moves),
  `lacquer` (the crimson hero bag `#6e0818`), `paper` (cream tags, documents), `chrome`, `rosegold`, `glow` (emissive).
- **Restraint is luxury.** Mostly black with a few precious, lit things. Holo is an accent; never fill the frame with
  rainbow. Backdrop rays: `<Backdrop burst="holo" glow={0.3–0.5}>` or `burst="gold"` or `"none"`.
- Light: one warm key spot from above (`#fff0d8`), magenta `#ff3ec8` and cyan `#29e6ff` side kickers, beams
  (`<Beam>`), confetti glints (`<Confetti>`), the mirror floor (`<MirrorFloor>`). Shadows on (castShadow on the key).
- Text in the world: `<Word text size kind="gold"|"holo"|"cream"|"glow">` (gold gets a holo rim automatically),
  `<PaperCard w h lines>` for tags/notices/documents. Numbers and words land and then **hold still** (no float/bob).
- The hero bag: `<HeroBag swing leather stitch glowStitch tag>` (our own design: crimson lacquer, gold bar clasp,
  saddle stitching, a holo price-tag charm on a gold chain). It is the motif through every scene.
- No real brand logos, monograms, prints or signature shapes anywhere. Our own emblem is the ◆ diamond.
- People: only as **still black paper silhouettes** (no limb motion). Objects act; people don't.

## Camera, transitions, hits (the three things the owner asked for)
- **The camera never stops dead.** 3–6 keys per scene: push-ins, orbits, cranes, trucks along rows of layers, a dutch
  roll that eases out. Use focus (`ap` 0.004–0.02) to rack between layers. Moves flow (Catmull-Rom); fast moves go
  through the frame, not into a wall.
- **Transitions** are handled by `enter` on the next scene: `'whip'` = the camera flies 14 m sideways to the next stage
  with motion blur and chromatic split, fastest exactly at `t0` (your first key must be at `t0 + 0.3`, the previous
  scene's last key at its `t1 − 0.3`); `'cut'` = hard cut on `t0` with the global flash if t0 is an A hit. For a cut,
  frame your first key to **match** the previous scene's last frame (shape/position/colour) — a match cut.
- **卡点:** A-tier hits (beats.ts `A`) already flash + shake + chromatic split globally. Land your scene's big reveal
  exactly on them with `slam(T, a)` / `pop(T, a)`. Add `hits: [[t, strength]]` for B-tier moments you want to punch
  (0.3–0.6). C accents: small prop ticks, light kicks. **Never animate on every beat** (the owner hates metronome
  motion); continuous things (flames, confetti, swings, counters) run on their own clock.
- Quiet sections: break 49.008–63.18 (slow, dark, one light), pre-drop gap 79.384–81.404 (cut to near black, hold).

## Rules
- Subtitles live at the bottom (the lowest 230 px of 1080). Keep important things out of that band.
- The corner mark sits top-right; keep the top-right 300×110 px clear. Small source captions go in an `Overlay`
  (HTML, `position:absolute; top:150px; right:56px; font 26px; rgba(243,237,226,0.6)`), fading in/out.
- Every subtitle line: ≤ 22 Chinese characters, on screen ≥ 0.5 s + chars/7 + 0.6 s, gaps ≥ 0.1 s, lines of one scene
  inside its [t0, t1]. Use the lines given below exactly (they are fact-checked; see `factcheck.md`).
- Local coordinates: floor y = 0 at the stage centre, +z toward camera. Keep your set within x ∈ [−5, 5] so the
  neighbouring stages (14 m away) don't intrude; a black velvet backdrop at z ≈ −1.6.
- Performance: SwiftShader renders this; keep shadow-casting lights ≤ 2 per scene, ≤ ~400 cut-outs, one `MirrorFloor`.
- Only edit **your own scene files** (and new files you create under `src/scenes/` with your scene prefix). Do not edit
  shared files (foil, kit, Film, Stage, scene, beats, index). If you need a helper, put it in your scene file.
- `npx tsc --noEmit -p .` must pass.

## How to test
```
cd /home/claude/video/films/lux2
COMP=Lux2 SCALE=0.5 timeout 1500 node scripts/stills.mjs /tmp/claude-0/<you>/<round> <t1> <t2> …   # film times in s
python3 scripts/sheet.py /tmp/claude-0/<you>/<round> /tmp/claude-0/<you>/<round>/sheet.jpg
find /tmp -maxdepth 1 -type d -name 'remotion-webpack-bundle-*' -mmin +30 -exec rm -rf {} +   # only stale bundles
```
Render stills at every line midpoint, every hit (and 0.05 s before/after it), and through each transition
(t0 − 0.2, t0, t0 + 0.2). Look at every sheet yourself (Read the jpg). Iterate at least 3 rounds. Taste test each round
against: (1) would a luxury brand's creative director accept this frame? (2) is there one clear subject, lit, with depth
behind and in front? (3) is anything cheap: flat lighting, empty black with nothing happening, text too small or
clashing, rainbow overload, objects floating with no shadow/ground, clutter? Fix before you stop.

## Running order (x = world position; times are film seconds)
| scene | t0 – t1 | x | enter | owner |
|---|---|---|---|---|
| S01 hook | 0 – 8.505 | 0 | cut | done |
| S02 title | 8.505 – 12.4 | 14 | cut | done |
| S03 workshop | 12.4 – 24.707 | 28 | whip | agent A |
| S04 design | 24.707 – 32.806 | 42 | whip | agent A |
| S05 queue | 32.806 – 40.907 | 56 | cut | agent A |
| S06 waiting | 40.907 – 57.106 | 70 | whip | agent B |
| S07 wine | 57.106 – 65.206 | 84 | cut | agent B |
| S08 after | 65.206 – 73.304 | 98 | cut | agent B |
| S09 unsold | 73.304 – 81.404 | 112 | cut | agent B |
| S10 fakes | 81.404 – 89.508 | 126 | cut | agent C |
| S11 logo | 89.508 – 97.606 | 140 | whip | agent C |
| S12 reveal | 97.606 – 105.707 | 154 | cut | agent C |
| S13 lineup | 105.707 – 113.806 | 168 | whip | agent C |
| S14 questions | 113.806 – 121.904 | 182 | cut | agent C |
| S15 end card | 121.904 – 130.0 | 196 | cut | agent C |

## Scenes: lines and picture
**S03 workshop** (whip in at 12.4; A hit 16.603 = strongest onset of the film)
- 12.5–16.45 `2024年，米兰法院公布了一份调查文件：` · 16.65–20.55 `迪奥一款包，代工厂每只最低收53欧元；` · 20.65–24.6 `店里，同款卖2600欧元。`
- Overlay caption 17–24.5: `注：该子公司整改后，2025年2月法院提前解除管理`
- A subcontractor's workroom as a paper-cut diorama: rows of hanging hides, a sewing-machine silhouette, thread spools,
  a lamp; a court document (PaperCard with lines) in front; a holo highlighter sweeps one line; at **16.603** a gold
  stamp `€53 / 只` SLAMS onto the document; the hero bag on the bench; at 20.65 a gold price tag `€2,600` swings in.
  Camera: whip arrival → close on the document → pull/crane to the bench and the bag.

**S04 design** (whip at 24.707)
- 24.8–28.6 `多出来的钱，买的是欲望。` · 28.7–32.7 `而欲望，是可以被设计出来的。`
- The bag on a slowly turning turntable in a "design studio" of the dark: gold-wire / holo blueprint lines draw
  themselves around it (compass arcs, a golden spiral, dimension lines, a 1:1 grid), as layers in depth; the word
  `欲望` assembles in gold. Camera orbits. Land the blueprint completing at 28.7. End on a frame that **matches**
  S05's opening (e.g. the gold arc of the blueprint ≈ the arch of the boutique door).

**S05 queue** (cut at 32.806, A hit)
- 32.9–36.75 `第一步：门口限流，让人排队。` · 36.85–40.8 `我们想要的，往往是别人想要的。`
- Overlay caption 37–40.7: `一种解释：模仿欲望（勒内·基拉尔）`
- A grand deco boutique facade (arched glass doors, gold trims, warm light inside), velvet rope on gold stanchions,
  and a long queue of still black paper silhouettes receding in many depth layers; camera trucks along the queue
  toward the door (big parallax), 37.616 small light pulse from the door.

**S06 waiting** (whip at 40.907; the break begins 49.008 — go quiet then)
- 41.0–44.9 `第二步：等候名单，让你买不到。` · 45.0–48.9 `大脑里，"想要"和"喜欢"是两套系统。` · 49.2–53.0 `学会以后，多巴胺在信号出现时就放电，` · 53.1–57.0 `而不是真正拿到手的那一刻。`
- An empty vitrine (dashed gold outline where the bag was) with a card `暂时缺货 · 可登记等候`, a ticket `37`; then a
  glowing holo curve drawn in space (`wanting` rising, peaking just BEFORE a marker labelled `拿到`, falling after).
  At 49.008 lights fall to one spot; slow push.

**S07 wine** (cut at 57.106, gentle; riser stabs 64.447/64.699/64.952; next scene slams at 65.206)
- 57.2–60.6 `第三步：价格。同一瓶酒，标两个价；` · 60.7–63.1 `贵的那杯，被评得更好喝；` · 63.2–65.15 `大脑也真的更愉悦。`
- Overlay caption 57.5–65: `Plassmann 等，2008，PNAS：同一款酒分别标10美元和90美元`
- Two crystal wine-glass cut-outs (chrome/holo rims, deep red wine), paper tags `$10` / `$90`; the $90 glass gets a holo
  halo and warmer light; a small brain silhouette above each, the pleasure spot lights brighter over $90 and flickers on
  the three riser stabs.

**S08 after** (cut at 65.206, A hit: +30 dB jump — big)
- 65.3–68.9 `可拿到手以后，那股劲很快就退了。` · 69.3–73.2 `心理学叫它：享乐适应。`
- Home at night: window with city lights, table, the bag next to an empty open box and tissue; the gold backdrop rays
  switch off a few at a time on build hits (69.257, 70.775, 71.534, 72.8 — not every beat); light cools gold → blue.

**S09 unsold** (cut at 73.304; 77.356 strong hit; 79.384 pre-drop gap: cut to near black and hold until 81.404)
- 73.4–76.9 `卖不掉的呢？宁可销毁，也不打折。` · 77.4–81.2 `2018年，博柏利销毁了2860万英镑存货。`
- Overlay caption 77.6–81.2: `同年9月，博柏利宣布停止销毁`
- A back room: stacks of luxury boxes, a furnace/shutter with layered holo-and-orange flame cut-outs flickering; a gold
  counter `£ 28,600,000` rolls and lands on 77.356; at 79.384 everything drops to black except embers.

**S10 fakes** (cut at 81.404 = THE DROP, biggest slam)
- 81.45–85.0 `全球假货贸易：约4670亿美元。` (gold) · 85.1–89.4 `研究发现：被仿得最多的，是大logo款。`
- Overlay captions: 81.6–85 `OECD–EUIPO 2025（2021年数据）`; 85.2–89.4 `Han, Nunes & Drèze 2010`
- On the drop a UV blacklight snaps on: violet world; two identical bags, the fake's stitches glow cyan (`glowStitch`);
  then a vast wall of identical bag silhouettes multiplying in rows into depth; a giant `$4670亿` in holo.

**S11 logo** (whip at 89.508)
- 89.6–93.5 `而有钱又不靠牌子证明自己的人，偏爱低调款。` · 93.6–97.5 `同一品牌里，logo越低调，价格反而越高。`
- Two bags on two plinths: one covered in our own ◆ pattern (loud, gold), one plain crimson (quiet); price tags, the
  quiet one higher; gold vs holo light.

**S12 reveal** (cut at 97.606, A hit)
- 97.7–101.5 `所以，53欧元和2600欧元之间——` · 101.6–105.6 `是排队、等待、价格和logo，被设计出来的欲望。` (gold)
- A thin cream slab `€53` at the base; at 101.6 a towering gold/holo monolith `€2,547` rises from it to `€2,600`,
  labelled `排队 · 等待 · 价格 · logo`; the camera tilts up dramatically; the bag beside it for scale. Only two
  blocks (no invented proportions between the four words).

**S13 lineup** (whip at 105.707)
- 105.8–109.7 `包、表、钻戒、香水，都是同一套设计。` · 109.85–113.7 `下次心动之前，问自己三个问题：`
- A grand stepped stage with every luxury icon as foil cut-outs (bag, a watch with an open balance wheel, a solitaire
  in a velvet box, a perfume flacon, a gold lipstick, a pump), popping in on bar lines (not every beat), crane move.

**S14 questions** (cut at 113.806 = peak; no subtitles)
- Three cards slam in on bars: 113.806 `① 这是给谁看的？`, 115.831 `② 没有logo，我还想要吗？`, 117.856 `③ 一年后，它还让我开心吗？`
  (large, readable: gold foil card frames with cream text, or `Word`s). At 119.88 the callback: the bag's holo tag
  charm close-up; the lights go out one by one, the tag glints last.

**S15 end card** (cut at 121.904; music continues to 130.0)
- 3D: J monogram ring in gold foil, `《你买的不是包》` gold title, `你最想要的一件奢侈品是什么？`, `评论区说说，为什么想要它`,
  a follow pill `关注 Juno · 一起看懂世界`, on black with a quiet holo glint. Overlay (HTML, small, bottom):
  `资料：米兰法院文件（路透社，2024；法新社，2025）· 博柏利2017/18年报 · OECD–EUIPO 2025 · Plassmann et al. 2008, PNAS · Berridge & Robinson 1998 · Schultz et al. 1997 · Han, Nunes & Drèze 2010 · 基拉尔《浪漫的谎言与小说的真实》 · 画面为代码绘制的示意，包与物件均为原创设计`
  No subtitles; the corner mark is hidden automatically.
