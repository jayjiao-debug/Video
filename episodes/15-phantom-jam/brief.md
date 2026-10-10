# Brief: 幽灵堵车（暂定）

- **Episode:** ep15 · VIBE知识大赏 (Juno). Owner request 2026-10-09: "用minimetro的画风帮我做一个关于堵车类似的视频". Topic chosen by producer (owner can redirect): phantom traffic jam.
- **Idea in one sentence:** 很多堵车没有任何原因——没有车祸、没有修路，只是车太密时某个人轻点一脚刹车，后面的人刹得更重，这一脚刹车变成一道往后跑的波；你堵在里面，其实是在等一个早就不在那儿的刹车。
- **Why a 18–25 viewer cares:** 每个人都堵过：堵了半小时，到前面什么都没有，一下就通了。"到底谁堵的？" 看完知道：是"我们"，而且可以少堵一点（留车距、别急刹、别乱并线）。
- **Opening (owner rules):** first line = the viewer's own moment (subtitle on frame 0): 堵了40分钟，前面什么都没有。Then the turn (谁堵的？没人。也是每个人), why it matters.
- **Evidence to verify (primary sources, DOI):**
  1. Sugiyama et al. (2008) New Journal of Physics 10:033001 — 22 cars on a 230 m circle, ~30 km/h, a jam emerged with no bottleneck; jam wave moved backwards (~20 km/h?). Exact numbers.
  2. Stern et al. (2018) Transportation Research Part C — one autonomous/controlled car in a ring of ~20 cars damped stop-and-go waves; % reductions in braking / fuel.
  3. Traffic-wave speed on real motorways (stop-and-go waves travel upstream ~15–20 km/h): Kerner / Treiber & Helbing / Schönhof & Helbing (2007) Transportation Science, or Federal Highway Administration / official data.
  4. Optional: Tadaki et al. 2013 (NJP) larger ring; critical density figure; what drivers can do (keep a gap, "drive to the car two ahead" – only if a source says so).
  5. Optional: how much time Chinese drivers lose to congestion — only from an official source (e.g. 高德/百度 reports are company reports: mark as such, or skip).
- **Length:** ~120 s (owner prefers a comfortable pace: ep14 v19 was 2:00) · 1920×1080 · subtitle-only · BGM: one untouched track chosen with the owner (no cutting/processing; only an end fade on a beat) · minimal SFX · Juno end card (关注 Juno · 一起看懂世界).
- **Visual direction (owner):** Mini Metro-like minimalist transit-map look — ORIGINAL: pale flat paper background, thick round-capped coloured lines as roads, simple geometric shapes as cars (small rounded rectangles / dots), stations as circles/triangles/squares, clean sans type. Must NOT copy Mini Metro's UI, assets, icons, fonts or name it on screen.
- **Engine rules carried over from ep14:** subtitle standard B (Noto Sans CJK SC Bold, white, gold key words, dark rounded strip rgba(6,8,13,.80), 64 px, bottom 70 px) — on a pale background this strip still works; no whole-screen beat pulses, no flashes; nothing pulses on a metronome.
- **Must avoid:** Braess / induced demand (done in 《越修越堵》); overclaiming ("所有堵车都是幽灵堵车" — say "很多"); blaming individuals; Wikipedia/百度百科/知乎.
- **Approvals:** owner: look demo early, then the cut.

## Format change (owner, 2026-10-09 19:15)
Owner sent a reference (Vibe知识大赏《再见》, 46万赞) and asked for its format: 一镜到底. Analysis:
- one continuous camera low over a tilted paper map with a grid; "you" = black line among coloured lines; station pills with big bilingual ground labels; camera rises to overhead, dives into a night city (buildings rise, lines become light trails) and back, no hard cuts;
- numbered chapters (00 · SEE YOU AROUND) shown inside the scene; HUD (legend + counters top-right, progress timeline top); paper data cards inside the scene; closed loop (last chapter returns to the first shot).
Plan: borrow the format, not their content (no line=life metaphor, no their station names). Road = the lines, your car = black lane; chapters 00 堵了 → 01 幽灵堵车 (ring) → 02 往后跑 (ring unrolls, night motorway light trails) → 03 临界点 → 04 一辆车 → 05 你 → 06 loop.
Build: three.js 0.169 (build3d/one.html), swiftshader WebGL in headless Chromium, ~0.5 s/frame.

## 360 / 全景 idea (owner, 2026-10-09 23:10)
Owner: make it a VR/全景 video the viewer explores by turning the phone. Built a 16 s test (build3d/pano.html): CubeCamera 6×1536 → equirect 3840×1920 shader, ~6 s/frame on swiftshader; spherical metadata injected with google/spatial-media (`spatialmedia -i`). Viewer stands at the centre of the 230 m ring, cars circle round them, the jam drifts backwards so they must turn to follow it.
Open question: does the Douyin phone feed play it as interactive 360 (gyro/drag)? Only third-party posts claim so; official info found is the PICO "VR全景创作计划" (uploads via 抖音创作服务平台, distributed to PICO). Owner to test with a private upload.
Design rules if we go 360: camera only translates (viewer owns rotation), slow moves; the default front view must work as a normal film; text repeated at 0/120/240° or anchored in front with hints; ≥4K equirect, big text.

## 3D audio demo (owner, 2026-10-09 23:36)
build3d/flat.html: flat 16:9, 16.58 s (ends on bar 8 of the Slowed BGM, one-bar cos² fade 14.557→16.58). Binaural sound rendered offline with Web Audio HRTF PannerNodes (OfflineAudioContext at 44.1 kHz, `renderAudio('sfx'|'orbit')`, aud.mjs): each car = speed-scaled tyre roar at its 3D position; each hard brake = a soft hiss at that car, so the braking wave is heard travelling round the listener; listener turns with the camera. A = song untouched + 3D cars (SFX bus 0.6, SFX ducked only where peak > −0.3 dBFS); B = song itself orbiting the head (8D style, period 4 bars) + 3D cars. Sim time ×1.8 (the 360 test used ×3, which the owner felt spun too fast: "疯狂转圈圈").

## 4K 360 + spatial audio test (owner, 2026-10-09 23:47–23:48: "只支持4K", "need to be 3D also" = 3D 环绕声)
build3d/pano2.html (4096×2048 equirect, cube faces 1600, ~12 s/frame/worker), dump.js → cars.json, foa.py → first-order ambisonics (ambiX ACN/SN3D) for the cars + the untouched song as head-locked stereo (6 ch PCM, `spatialmedia -i -a`), plus a stereo fallback mp4 (front L/R decode, SFX ducked only above −0.3 dBFS). Delivered via deliver-jam360 artifact (run 37997433371).

## Look v2 (owner, 2026-10-10 07:47: "leave 360 for now, go back to the original style, make the rectangle look a bit more like a car, change things up so it seems we're not copying that reference 100%")
build3d/one2.html. Own identity = Chinese highway signage: green highway-sign plates for chapters/title (exit-number badge "01"), amber LED 情报板 (variable-message sign) for counters and for "前方情况：车祸/施工/收费站 —— 无", overhead gantry "最前面" instead of station pills, km-post strip instead of the progress bar, black map-pin "你" instead of ground text, cool concrete ground with a dot grid instead of beige paper + line grid, saturated teal/black/amber/blue lanes with white dashed separators. Cars = body + light glass cabin + wheels + rear brake lights; stopped = brake lights on + red glow (no longer whole red blocks).

## Props picked (owner, 2026-10-10 08:19–08:28)
Car B (low-poly sedan: hood/cabin/trunk, dark greenhouse, small wheels, brake lights + short red ground glow). From the screenshot the owner circled column A for the rest: board A (LED 情报板; fix: post now sits behind the cabinet, it used to poke through the face), front-of-queue A (green gantry "最前面"), chapter plate A (green highway sign with exit number). Not chosen explicitly, used for now: white data card, black map-pin "你", dot-grid concrete ground, teal/black/amber/blue lanes.
Scene openings (build3d/scenes.html, `shot(0..6)`): 00 堵了 (behind your car, LED counters, km strip) · 01 一个圈 (ring, 22 cars, white card) · 02 往后跑 (night motorway, light trails, red brake band) · 03 临界点 (spacing tightens toward the front + density gauge) · 04 一辆车 (white self-driving car with a gap, card −74%/−22%) · 05 你 (your car leaves a gap, "留出空当") · 06 下次 (opening shot again, traffic flowing, "前方情况：什么都没有").

## Look v3 (owner, 2026-10-10 08:37: "不要用夜间了，color scheme尽量不用黑色（除了这两个牌子），参考 mini metro 的画风，确保 Dynamic 的画面还有一镜到底")
build3d/scenes2.html (`shot(0..6)`): no night scene (02 is now a daytime motorway with a red brake band + green "车 往前开" / red "堵点 往后跑" floor arrows). No black anywhere except the two LED boards: your lane/car = yellow #F5B700 (pin yellow), lanes green #3FAE49 / blue #2F7FD3 / orange #F28C28, ring red #E8413C with multicolour cars, map lines purple/cyan/red with white stations (circle/square/triangle, slate outline), pale-blue rivers, cream ground #F3EFE6 without grid, light-blue car glass, slate #34495E for text, subtitle strip slate rgba(44,62,80,.9) instead of near-black. Flatter lighting (hemisphere 2.4, sun 0.85). Lower, more dramatic camera angles.
