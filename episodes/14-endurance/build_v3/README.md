# 坚忍号 v3 build (2026-10-10)
- film.html + main.js: one page, `renderAt(T)` pure in T, 30 fps, 3899 frames, song s130f untouched (title bar 8 = 16.58 s, drop bar 40 = 81.375 s, end card 125.4 s).
- 3D set-pieces (three.js 0.169): deep.js (our own built stern, own lettering, beam), ship.js (kitbashed CC-BY Merchant Schooner by gogiart → 3-mast + funnel, polar night, Hurley-style flash at 9.25 s), sea.js (James Caird scan, The Watt Institution, CC BY; the wave).
- Map: tex/ant_polar.jpg = polar stereographic reprojection (polar.py, lon0 −45°) of NASA Blue Marble NG topo-bathy Dec 2004 (public domain, asset farm job antarctic-01). No borders, place labels only. Routes approximate (示意).
- Compositor: every GL scene renders to a half-float target; quad applies ACES+sRGB (3D) or sRGB only (map) and crossfades two scenes.
- Assets (not in git): assets/*.glb + Poly Haven planks/snow (asset-output endurance-01/03).
