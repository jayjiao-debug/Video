# ep25 build runbook (for the 02:30 SAST scheduled run)

Paths are under the scratchpad. Look A; numbers come from data.json; text from lines.json + intro CFG.

1. Data
   - asset farm: gol.gg Worlds 2026 Main Event match list + new game pages (ids 83662+), as in lol-ep25-01.
   - `cd ep25/an && python3 parse_games.py <files dir> && python3 an25.py`
   - `cd ep23/an && python3 sim5.py 200000`  (copy of sim4.py with R3B locked; writes sim5_out.json)
   - AI poll → `ep25/an/ai25.json` as [{model, top3:[..], lpl:bool}]
   - `cd ep25/an && python3 mkdata25.py`  → ep25/film/data.json (uses sim5 if present)
2. Text
   - ep25/film/lines.json (bars 10–61.74, [keyword] in brackets), ep25/intro/intro.html CFG (l1,l2,l3,title,tag),
     film.html #endT title.
3. Render
   - intro (2D, 0 → B(10)=20.63 s): `cd ep25/intro && node ../../ep24/film/rec.mjs`-style loop over frames 0..618 of intro.html
     (copy ep24/demo/rec.mjs, set DUR=20.63).
   - run `python3 mkfonts.py` in ep25/film after the text is final.
   - 3D (frames 619..3899): copy ep25/film/{film.html,main.js,panels.js,util.js,data.json,lines.json,serve.mjs,InterDisplay-Black.otf,fonts/} to mf/ep25/ (no icons: the farm loads them from Data Dragon via ?cdn=1, chunk.mjs already passes it), add chunk.mjs + package.json from mf/ep23,
     job.json {"id":"ep25-v1","entry":"render_ep25.py","range":[619,3899]}, commit + push modal-farm, collect from modal-output.
     Fallback: local stills.mjs loop (swiftshader, ~1–2 s/frame).
4. Sound: s130f.wav untouched; intro slams = ep24/sfx dum C (ep24/film/sfx24.py events from the intro), whoosh on each
   station glide (bars 14,22,26,32,38,44,50,54,56), boom on DROP; mix17 clip guard.
5. Assemble: concat intro + 3D picture, mux the mix, 2-pass to ≤30 MB; QA (luma jumps, window.check() collisions and
   backwards camera, ebur128, reading pace, banned words).
