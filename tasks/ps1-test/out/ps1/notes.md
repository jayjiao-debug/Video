# PS1 test clip – where each trick lives

Files: `index.html` (canvas + HTML overlay + CSS), `main.js` (scene, shaders, animation), `render.py` (renderer).
All tunables are in the `K` object at the top of `main.js` unless noted.

| Trick | Where | Knob |
|---|---|---|
| Vertex snapping | `VERT` shader in main.js: `p.xy = floor(p.xy/p.w*g+0.5)/g*p.w`, g = res/2*SNAP | `K.SNAP` (1 = brief's grid; 0.5 = coarser, stronger wobble) |
| Affine textures | `VERT` passes `vec3(uv*w, w)`; `FRAG` divides `xy/z` | `K.TEX_UV_SCALE` (sand repeats/m; bigger = finer, less visible swim). Terrain grid `xs`/`zs` arrays = polygon size (bigger polys swim more) |
| Pixel textures | `makeTex(size, fn)`: sand 64px, rock 32, cloth 32, bark 32, skin 16; Nearest, no mipmaps | the generator functions `texSand` etc. |
| Low poly | terrain 220 tris (`xs`,`zs`), figure ~156 (boxes), rocks 20 tris each, tree, mesas. Counts in `window.TRIS` | geometry builders |
| Gouraud light | `VERT`: ambient + sun + fill per vertex | `shared.uSunDir/uSunCol/uAmb/uFill`; figure has its own brighter `uAmb` |
| Low res | render target `K.W x K.H` = 384x216, canvas CSS-scaled x5 with `image-rendering: pixelated` | `K.W`, `K.H` |
| 5-bit colour + Bayer dither | `postMat` fragment shader (post pass on the 384x216 target) | `K.BITS` (5), `K.DITHER` (1 = one LSB, 0 = off) |
| Fog / draw distance | per-vertex linear fog in `VERT`, mixed in `FRAG`; sky bottom matches fog colour | `K.FOG_NEAR`, `K.FOG_FAR`, `K.FOG_COL` |
| No AA | `antialias:false`, nearest target | – |
| 15 fps 3D | `drawFrame`: 3D time = `floor(f/2)/15`; overlay uses real time (30 fps) | `K.FPS3D` |

Clip timing (seconds): card 0–2 (`cardAt`), desert 2–10 (`sceneAt`; camera keys in the `// camera` block, figure path `figX/figZ`, mirage `mirageAmt`, mirage position `MIR`). Subtitles: `SUBS`; water-bar drain at 4.0 s in `overlayAt`. Everything deterministic (seeded RNG, time = frame/30).

Render: `python3 render.py` (full clip), `--out path.mp4`, `--frames 60:120`, `--stills 1.0,3.0 --stills-dir /tmp/ps1`.
Needs python playwright + Chromium, ffmpeg, npm (installs three@0.160.0 locally on first run). Full render ≈ 1 min on a CI box.
