# ep43 film kit: how scenes are built

Standalone three.js page: `film.html` + esbuild bundle `main.js` (`./node_modules/.bin/esbuild src/main.ts --bundle --format=esm --outfile=main.js --log-level=warning`).
`window.renderAt(t)` draws film time `t` (seconds). **Every frame is a pure function of `t`.** Never keep state between frames
except caches keyed by what they draw.

## Read first
- `../storyboard.md` (r3, approved): your scenes' rows, the Look section (palette hexes, luma targets), Engine layer, the crest
  handover table, the transitions table. Follow it exactly; anything you can't build as written → tell the producer, don't improvise.
- `../lines_bars.json` (subtitles; drawn automatically), `src/furniture.ts` (stamps, era chip + age, tally, labels; drawn
  automatically from film time — don't draw them yourself), `../facts.md` (a picture may not show what no row supports).
- Owner rules: no AI images; not black-and-white; whole figures in profile standing/sitting on a surface; hands touch real
  points (no hand entering from off-screen); every transition motivated (no crossfades/dips to black); luma: night/indoor frame
  mean ≥ 45, darkest beats ≥ 40, dusk 75–100, day 110–150; you (the scroll) are the only glowing, saturated thing.

## Modules (read the code; don't edit core.ts / hud.ts / furniture.ts / film.ts / figures.ts / silk.ts — ask the producer)
- `core.ts` — `Stage` (a three.js scene + camera). World px: x right, y down; a layer added with `st.add(name, tex, cx, cy, w, h, z, opts)`
  at depth `z` (negative = farther) frames identically at rest and gets parallax when the camera moves.
  `st.setCam(x, y, zoom, roll)` centres the camera on world px (960,540 = rest), zoom 2 = twice as close.
  `st.heroAt(px, py, z, radius)` puts the rim light source (you) at a world point; layers with `rim > 0` get a warm edge facing it.
  Paint options: `fog: [hex, amt]`, `rim`, `rimPx`, `emissive` (bloom: only you, lanterns, practicals), `opacity`, `tint`.
  `Live` = a canvas layer redrawn when its key changes: `live.drawW(key, g => …)` draws in world px.
  `Motes` = snow/embers/dust. `svgDoc(body, w, h, defs, ox, oy)` + `svgToCanvas` rasterise SVG; `gradCanvas(stops)`.
  `bar(j)` = film time of bar j (106 BPM, `bar(j) = 1.4498 + 2.26415·j`); `BEAT`; easing helpers.
  Transition masks (scene `in`): 1 cut · 2 wipe (roller edge) · 3 ink bleed · 4 ripple · 5 iris · 6 foreground band ·
  7 dissolve (in-shot only) · 9 pane · 10 smear (whip) · 11 picture-in-picture (shrink into a rect) · 12 light-edged wipe · 13 overlay.
- `film.ts` — `addScene({id, a, z, draw: (t) => Frame, in?})`. `Frame = {st, grade?, bloom?, hud?, hideFurniture?, under?, blurUnder?}`.
  `grade`: `exposure`, `vig`, `vigCol`, `corners` (warm dark under the HUD corners for bright silk inserts), `tint`, `lift`.
  An `in` transition `{mode, a, z, dir, pt, soft, band}` overlaps the previous scene; both are drawn at the same `t`.
- `crest.ts` — `new Crest(name, {sky: 'dusk'|'day'|'night'|'fire'|'snow', era: '宋'|'元'|'明'|'清'|'1923'|'1950'|'none', lanterns, boat, bankCrowd, snow, embers})`;
  `deck(x)` = deck surface y at world x (crest top (960, 900)); `setLanterns((i, x) => 0..1)`, `setBoat(x, mastDeg)`, `setStreak(x, k, t)`.
  The palace slot is on the far LEFT; **进 = carried left, 出 = carried right** (fixed all film).
- `rooms.ts` — `Store`, `XBL`, `RoomYuan(sky)`, `Wumen` (ext + hall), `Desk(kind)`. Extend by adding new set classes in your own file.
- `draw.ts` — SVG builders: roofs, halls, city gate, Dagoba, 角楼, 午门, skylines, willows, tiny crowd figures, boats, the 虹桥, railings, lanterns.
- `figures.ts` + `actors.ts` — one-tone profile silhouettes. `LOOKS` (17 era looks), `POSES`, `walkFor(look, u)`, `reach`, `underArm`,
  `underArmRoll`, `carryArmful`, `bendTable`, `crouch`, `kneel`, `bow`, `holdOpen`, `handOver`, `sit`.
  **Always place figures with `rig(fig, contacts, groundFn, 'who')`** — it aims hands at screen targets and puts each sole on the ground curve,
  and logs contact errors. `Cast(stage, …)` draws figures on a rimmed live layer: `cast.draw(key, figs)`.
  Props: `drawRoller`, `drawSilk`, `drawRoll`, `drawBundle`, `glowBlob`.
- `silk.ts` — the painted scroll: `paintSection('river'|'gate'|'shed'|'end'|'colophon', {mode: 'mono'|'colour'|'grey', …})`,
  `paintRelief`, `layerShadow`, `paintRiverSprites`, `paintSeal`, `stampSeals`, `silkWeave`, `ZHANG_ZHU_TEXT`. Canvases include `.silk` info
  (rects of the bridge, patch, glyph boxes, phrases, seal slots). Paint once at boot and cache.
- `s_open.ts` — scenes 01–02, the reference example of a scene module.

## Your module
- One file per group `src/s_<group>.ts`: `export const boot<Group> = async () => {…}` builds stages/textures; scenes registered with `addScene` at import.
- Your file `src/s_<group>.ts` already exists as a stub and is wired into `src/modules.ts` (don't edit modules.ts). Fill it in.
- Dev speed: `ONLY=<group> node preview.mjs …` boots only your module (plus the opening).
- Glow-lock point (960, 580) for glow-locked cuts. Labels leave before any move starts.

## Check your work
- Stills: `node preview.mjs <outDir> t1 t2 …` (SwiftShader, ~5–25 s/frame). Look at every still at full size and at 480 px.
- Contacts: `node tools/contact_check.mjs <from> <to> 15` must print PASS for your time range.
- Keep only final stills; disk is tight (delete scratch frames). Commit nothing large.
