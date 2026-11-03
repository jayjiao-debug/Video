# ep59 v3 build brief (for the act builders)

Film: 《他走路回家，走了28年》 — Karl Bushby walked from Punta Arenas (1 Nov 1998) to his mother's door in Hull (2 Nov 2026). Douyin, 1920×1080, 30 fps, subtitle-only + 3 short clips of his real voice, ~2:44 on the DJ track.

## What the owner said about the last cut (粗剪2) — the bar you must clear
- "a lot of the animation is very weak, as the background is not layered, or not gorgeous imagery enough, please think about how a professional producer will do"
- "The swimming animation is so bad"; "unify his hairstyle and figure, different attire through the scenes"
- "Visa and arrest imagery is confusing"; skip the less exciting bureaucracy; more hardships and remarkable moments; "make it very exciting", 热血.
- Earlier: fast DJ BGM, story fast-paced, emotional, powerful; 运镜 and 转场; every scene must make sense.
Contact sheets of the old cut (what NOT to do): scratchpad/r59/sheet1.jpg, sheet2.jpg. The new look: scratchpad/v3/sets/contact_sheet_v3.jpg and the set stills set1_jungle.png … set6b_hull.png; the character: scratchpad/v3/karl/sheet_dark.png, actions.png, swim.mp4. (scratchpad = /tmp/claude-0/-home-claude/240969aa-174a-5914-92b5-d529595dbe80/scratchpad)

## Code (Remotion, /home/claude/video/episodes/37-qiqing/remotion)
- `src/qq59v3/story3.ts` — THE timeline: every scene's id, nominal length, subtitle rows, photo, voice, date, stamp and a `note` that is its brief. Read it first. Don't change rows/dates/order without asking the producer (main session); you may tweak a row's `at` if the picture needs it.
- `src/qq59v3/EP59V3.tsx` — the master. It lays the scenes on the music, draws subtitles (top-left, layout D), the stamp (top-right), the counter (bottom-left), the seal (bottom-right), plays music and voice. **Scenes draw picture only** (plus their own photo prints, in-frame tallies and transitions).
- Your act file `src/qq59v3/act<N>.tsx` exports `ACT<N>: Record<sceneId, SceneDef>`; `SceneDef = {C, tin?, ov?, noCounter?, noStamp?, noSubs?}`; `C` gets `{t, dur, beat, tr}`: t = seconds since the scene starts (negative during an incoming 'dissolve'/'own' transition, and it may run past dur while the next scene transitions in over it — keep drawing sensibly there), dur = the scene's real length on this track (≈ 0.85–1.15 × nominal, differs per track), beat = seconds per beat (0.426 on the DJ track; the other track will differ). **Never hard-code film times or the DJ tempo**: continuous moves run on t/dur; hits land on multiples of `beat` from the scene start (the scene starts on a downbeat or a half-bar).
- `tin`: 'cut' (default; a hard cut on the downbeat — good, use it often on this fast track), 'dissolve' (master cross-fades over ov s), 'own' (you draw the incoming transition over the outgoing scene for ov s: a wipe, a light flood, a match move). Prefer motivated transitions: match on shape/motion/light, whip-free (a fast whip strobes on phones).
- Shared, owned by others — **do not edit**: `kit3.tsx` (Stage/Layer parallax kit, Sun, Shafts, Fog, Mist, Particles, grain/vignette, FigureSlot), `sets3a–d.tsx` (Jungle, Ice, Siberia, Gobi, Caspian, Bridge, Hull), `karl3.tsx` (`<Karl x y h attire action phase facing rim lightDir t …/>`, `karlTravel(action, t, h)` for slide-free travel, `<Mum/>`, `<Camel/>`, `<Cart/>`, `<Sled/>`; API at the top of the file), `karl3sea.tsx`, `photo3.tsx` (`<Print3 {...PH3.key} t dur cx cy w rot from caption/>`), `story3.ts`, `EP59V3.tsx`, `../qq59/*` (skin59 furniture, globe59 `Earth`/`Globe`, fx59 wipes — reuse freely). If you need a change in a shared file, write a local variant in your own file (or `act<N>_*.tsx`), or ask the producer.
- You may create new sets/variants in your own files built from kit3 primitives (e.g. the jungle river at night, the ice at night with a tent, a jail cell, a beach). Keep the same family: flat vector + gradients, 5–8 depth layers, haze with distance, a key light, particles, foreground framing, grain.

## Look rules
- Every frame works as a poster: layered depth, atmosphere, a clear key light, a focal point where Karl is. No flat single-colour backgrounds; no empty lower thirds.
- One Karl (karl3) everywhere, same head/hair/build; attire per scene: 1998 'start1998', Darién 'jungle', ice 'ice', Siberia 'siberia', Gobi 'gobi', the swims 'swim', 2026 'home2026'. Big enough to read on a phone in hero shots (≥ ~22 % of frame height); tiny only in deliberate vast wides.
- One saturated accent: gold #FFC24A (route lines, lit windows, key highlights).
- Camera: every shot moves (dolly / truck / crane / push-in with parallax), ≤ ~25 px/frame for the main subject; no whip pans. Acting beat on each line.
- People behave plausibly; hands simple; props sized to the person; threats (guns) as silhouettes only, no violence shown; no gore; no national flags of China; maps/globes without borders.
- Subtitles live top-left (x 150, y 132 → ~400): keep that zone calm/darker; keep key action out of it. The counter is bottom-left, the seal bottom-right, the stamp top-right: keep those corners clear of key action. Douyin's buttons cover the right ~15 %: nothing important at x > 1650.
- Photo prints (`Print3`): small (w 380–620), beside the action, not covering Karl, x between ~900 and ~1600, toss in on a beat, hold 1.5–3 s, leave. Available keys: nowFace, young1998, jungle, americas, beringIce, beringDusk, frostFace, snowRoad, swimDawn, hug. Keys in story3 that aren't in PH3 yet (caspian, bosphorus, dover) are photos the owner is still sending: write the call guarded (`PH3[key as keyof typeof PH3] && …`) so it appears once the producer adds them.
- Captions on prints: 「2001 · 达连隘口」 style (date · place).

## Checking your work
- Composition for your act: add one to a test file of your own (e.g. `src/qq59v3/act<N>test.tsx`) that plays only your scenes back-to-back with the DJ layout (import `layout`, `TRACKS` from story3 and render through the master's `Film` logic, or simply mount `EP59V3`'s composition and render your frame range: `npx remotion render src/qq59v3/EP59V3.tsx EP59V3DJ out.mp4 --frames=a-b`).
- Render stills with `TMPDIR=/dev/shm/<yourdir> npx remotion still src/qq59v3/EP59V3.tsx EP59V3DJ <png> --frame=N --browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell`. The box has 2 cores shared by 4 builders: prefer stills; render motion previews at `--scale=0.5 --concurrency=1` for your range only. Remove your /dev/shm dir when done.
- For every scene: look at its first, middle and last frames and both transitions at full size and at phone size (~400 px wide). Check: is it gorgeous and layered; does it make sense to a first-time viewer in 2 s; does Karl read; do feet slide; are the subtitles readable; do hits land on beats.
- Frame budget: keep a frame under ~400 ms.
- Typecheck: `npx tsc --noEmit -p .` filtered to qq59v3.

## Report
A contact sheet of your act (one frame per scene at its strongest moment + one per transition) saved to scratchpad/v3/act<N>/sheet.jpg, what each scene does, frame times, what's still weak. **Don't commit** (the producer commits).
