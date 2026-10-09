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
