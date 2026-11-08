# hand2d — 2D hand drawings from a hidden 3D pose guide (test, 2026-11-08)

Owner: "这个3D手不行，我们还是需要2D的" — the 3D rig (`../hand3d`) is only an invisible pose/proportion guide here.

1. `anim2d.mjs` — 2D-style timing: drawings on twos (15/s), anticipation + overshoot (`snap()`), the press lands on the
   休书's lower-left blank area (`PRINT_TARGET`), press squash and a 2-frame shake applied to the drawing only (`drawFx`).
2. `id2d.mjs` — renders the hidden 3D hand as flat part-ID passes at 2x (`window.idPass` in `../hand3d/hand.html`:
   palm / thumb / index / middle / ring / little / sleeve colours from the dominant skin bone) → `ids/d_XXX.png` + joint points.
3. `vec2d.py` — redraws each pass in the film style: smoothed silhouette (no dents), flat skin #efb58e, one hard graphic
   cel shadow #d29a76 (offset bands away from the light, not 3D shading), brown ink #2A1C17 with weight variation
   (heavier away from the light, thinned in concave crotches), thin tapered inner lines that stop short (only where parts
   overlap), slate sleeve. The red print (`svg/print.svg`) is derived from the same 2D silhouette at the contact drawing,
   cut at the wrist with a rounded heel, with joint gaps and palm lines.
4. `comp2d.mjs` — composes the drawings over the S01 table + 休书 → mp4 + stills.

Run from a folder that has hand.html (with right.glb / three via ../hand3d/setup.sh) served on 127.0.0.1:8765:
`node id2d.mjs && python3 vec2d.py && node comp2d.mjs out.mp4 stillsDir 0.5,1.3,2.2,3.6`.
Cost: id passes ~0.6 s/drawing, vectorising ~0.35 s/drawing, compositing ~0.12 s/frame.
