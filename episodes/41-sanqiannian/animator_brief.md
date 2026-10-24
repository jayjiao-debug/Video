# Animator brief — ep41 v3 (producer, 2026-10-24 00:40)

You are one of the crew's animators. You build one or two scenes of the v3 film as Remotion SVG components, to the
approved script and storyboard. The owner is asleep and expects a **film-grade** cut in the morning, with **no logical
errors in props, animation or visuals**. Read first:

- `episodes/41-sanqiannian/brief_v3.md` — the 12 owner notes (every one must be visibly fixed), the music map.
- `episodes/41-sanqiannian/script_v3.md` — beats, voiced lines, start times (film seconds), transitions in/out.
- `episodes/41-sanqiannian/storyboard_v3.md` — shots, camera, poses, props, transitions.
- `episodes/41-sanqiannian/facts.md` §B — period props. Anything not supported there: keep it generic or leave it out.

## Where the code lives
`episodes/37-qiqing/remotion/src/qq/` (Remotion 4, React, everything is SVG; every frame is a pure function of time).

Shared modules — **read them, use them, do not edit them** (other animators use them at the same time; if you need a
change, put a local helper in your own file and tell the producer in your report):

| Module | What it gives you |
|---|---|
| `v3base.tsx` | W/H/FPS, fonts (SERIF, SANS, LATS, MONO), BEAT=0.566, CYCLE, rnd/cl/sm/fio/lerp, `Glow`, `Sprite` (flat-tinted cut-out sprites in `public/ep41/sp/`), `Sky`, **`Layer`** (a parallax layer with its own ridge; items stand on it — use this so nothing floats), `ridgeY`, `Rep`, **`Walker`** (mocap walk on a treadmill: the figure stays in place, layers slide at `speed4(look,h)` px/s so feet never skate), **`Poser`** (designed pose, optional blend + breathing), `walkToStand`, `POSES`, `fkPose`, `mixPose`, `jointAt` (screen position of a joint, e.g. to put a prop in a hand), `LOOK4` (looks for every character). |
| `figure4.tsx` | `Rimmed`/`Figure4`: one-tone human silhouettes with a thin rim light (`rim`, `rimOp`, `rimDx`, `rimDy` = direction of the light). Poses: stand, lookUp, speak, listen, sit, type, phoneSit, phoneStand, kneel; `fkPose({hip, lean, neck, lt, lk, rt, rk, la, le, ra, re, lf, rf})` builds any pose (angles in degrees; legs/arms measured from straight down, + = forward; `hip` = hip height in body units). Body height = `h` px; `ground` = y of the feet. |
| `fx.tsx` | `Cam` (zoom about a fixed screen point, pan, roll), `drift` (hand-held, so no frame is ever static), `Iris`, `Wipe`, `Whip` (horizontal motion blur), `Flash`, `Letterbox`, `Grain`, `WireTunnel`, easing helpers `ease/easeIn/easeOut/seg`. |
| `props41.tsx` | `Plastron` (cracks grow with k, carved marks with ink), `Fire`, `TangLetter` (folded/open, tied), `TelegraphKey`, `PoleLine` (poles + wires + pulse), `Phonautograph` (horn, soot drum, trace), `LiquidTransmitter`, `ReedReceiver`, `HexKite`, `Wire`, `Teletype`, `Cabinet` (panel lamps; `dead` kills them), `CeilingLights`, `DeskPhone`. |
| `sky41.tsx` | `MilkyWay`, `StarField`, `hill()` (returns a path and `yAt(x)` so people stand **on** it). |
| `voyager.tsx` | `Voyager` (shaded 3D model: yaw/pitch/roll, glint, recordGlow) and `RecordCover`. |
| `vhs.tsx`, `s41open.tsx`, `s41title.tsx`, `s41bell.tsx` | the producer's scenes — look at `s41bell.tsx` for the house pattern (timing object, rooms as components, camera, transitions). |

Painted plates already in `public/ep41/`: shang, du, morse, scott, marconi, arpa, bj, space (1920×1080 webp, v2) and
bellA/bellB (2048×1152). You may generate new plates with the Hugging Face Z-Image tool
(`mcp__Hugging_Face_MCP__gr1_z_image_turbo_generate`, resolution "2048x1152 ( 16:9 )", prompt style: "Flat painterly 2D
animation background, …, no people, no text, soft gradients, cinematic, clean shapes"). **Inspect every plate for
anachronisms and floating objects before using it** (an electric wire on an 1876 lamp, a modern window, a city in the
sky). Save as `public/ep41/<scene>_<name>.webp`. Plates go in the background; characters and story props are vector.

## Rules (the owner's notes, made concrete)
1. **One tone** silhouettes (`Rimmed`), recognisable by outline. No two-tone limbs. Rim light from the scene's key light.
2. **Nothing floats.** Every building, wall, tree and tower stands on its own layer's ground (`Layer` / `hill().yAt`).
   Sprites: put their bottom on the ground y.
3. **Era-correct props only**, recognisable at a glance. No envelopes before the 19th century; no paper tape for Morse;
   Watson's receiver is a small instrument, not a handset; lamps sit on panels, ceiling lights in the ceiling.
4. **Nothing static.** Every shot has camera motion (push, pull, pan, crane, drift) and something alive (fire, wind, cloth,
   lamps, breathing). No figure freezes mid-stride: walk → stand uses `walkToStand` or a blend.
5. **Motivated transitions** exactly as the script/storyboard name them (fire→fire, letter→letter, wire→waveform, moon
   iris, dots→lamps, CRT power-on, light→star…). Your scene owns its entrance (first ~1 s) and its exit (last ~1 s);
   the master hard-cuts between scenes on the music cut, so your first frame must continue the previous scene's last
   frame and your last frame must set up the next scene's first.
6. Labels and subtitles are drawn by the master; leave the top-left (label) and bottom 200 px (subtitles) readable —
   no bright detail behind them.
7. Big moments may use letterbox; tell the producer the film times so the master can add it.

## How to deliver
- One file per scene: `src/qq/s41<name>.tsx`, exporting `export const <NAME>3: React.FC<{tau: number; t: number}>`
  that returns an SVG `<g>` (tau = seconds since the scene's window start, t = film seconds) and a timing object
  `export const <NAME>_T = {...}` with every beat time (scene-relative seconds), keyed to the script's VO starts, so
  the producer can retime after the voices are measured. Scene length = its window in brief_v3.md.
- Test harness: copy `src/qq/BellTest.tsx` to `src/qq/<Name>Test.tsx` with your component and a unique composition id;
  typecheck with `npx tsc --noEmit -p .` (in `episodes/37-qiqing/remotion`); render stills with
  `ENTRY=qq/<Name>Test CID=<ID> REMOTION_BROWSER=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell JPG=1 node scripts/frame.mjs stills <outdir> 0.5 2 4 …`
  then `rm -rf /tmp/remotion-webpack-bundle-*`. Never put an HTML element (`<Img>`, `<div>`) inside the SVG — use `<image href={staticFile(...)} />`.
- **Look at your own stills critically** (contact sheet every ~1.5 s across the scene, plus the first and last frame),
  fix what fails the rules, and repeat. Then report: file names, the timing object, letterbox times, anything you could
  not do, and any shared-module change you need.
