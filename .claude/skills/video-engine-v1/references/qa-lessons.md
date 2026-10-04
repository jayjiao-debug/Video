# QA: what went wrong before, and the fix

Run these checks on stills (scripts/stills.mjs + scripts/sheet.py) before any full render, and on the rendered
film (finish.py's glitch scan) after.

## Rendering correctness
| Symptom | Cause | Fix |
|---|---|---|
| Fonts change between chunks; canvas labels in the wrong font | canvas text drawn before webfonts loaded | gate the canvas on `document.fonts.load(...)` + delayRender; prefer HTML labels projected from 3D (toScreen) |
| Gold gradient text vanishes in the render | `background-clip:text` unsupported headless | solid gold + text-shadow glow (GOLD_TEXT) |
| Blank 3D frame / model missing | continueRender before the loaded scene rendered | load in a module cache, continueRender only after assets + fonts; for previews render once explicitly |
| Blocky flicker on overlays (seat tiles) | z-fighting: a glow plane coplanar with the tile's top face | lift overlays clearly above (e.g. +0.012 × scale), never at the same height |
| Overlay squares stick out of a model | layout on a guessed oval | measure the model (trimesh: half-width per x, gunwale height) and fit the grid inside |
| Things vanish/appear at the edge of the camera | near-plane clipping through props | clear props from the camera path; keep near ≥ 0.03 for small scales, ≥ 0.1 for big worlds |
| Camera inside a building ("穿模") | key-to-key path crosses geometry | check footprints; route around; side-tracking with clamped offsets |
| Washed-out daylight scene | backlit sun + haze + procedural Sky shader | sun behind/side of camera, own gradient dome + PMREM env, exposure ~0.85 |
| Steep wave renders as a smear | grid too coarse for the face | refine the grid along the travel axis (≈0.7 units), dark face + white lip only |
| Regular "checkerboard" foam | product of two sines on one axis pair | rotate coordinates, add incommensurate terms |
| Instances at scale 0 break | degenerate matrices | clamp scales to ≥ 0.0001 |
| Things far away look like white haze | fog colour too light/near | far fog (300–2600), bluish colour |
| Composition rejected | id contains "_" | ids: letters, digits, "-" only |
| `remotion` OOM / killed when splicing | two decoders on the same 1080p input | stream: cut parts separately, concat demuxer (scripts/splice.py) |

## Readability
- Subtitles never sit on top of the key visual: move grids/boats up, add SubBand.
- Labels on bright backgrounds get a dark pill or a dark band at the top of frame.
- Don't run two animations the viewer must follow at once.
- Small text (map labels) ≥ 18 px at 1080p; key numbers ≥ 60 px.

## Facts
- Verify every number, name, date and place with a source before it goes on screen; note estimates as 估算.
- When sources disagree (boat 7: 26/28/34 people), phrase the claim so it holds for all of them
  ("最早6艘平均不到一半满").
- Read the primary account: on Tilly Smith's own beach the sea did **not** recede — it frothed and kept coming in.
  The storyboard was changed to show the drawback on *other* Phuket beaches.
- Handle deaths respectfully: grey/dim dots and tallies, no depiction of people being swept away.
