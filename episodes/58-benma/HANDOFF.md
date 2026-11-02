# ep58 马踏飞燕: handoff (paused 2026-11-02 22:00, owner switched back to ep57)

## Done
- brief.md, facts.md (rows 1–72, 2 research rounds), music_map.md (owner's track uncut; film exactly 179.5 s; fade 178.5–179.5; bed = -14.1 LUFS, no gain).
- **script.md = v3** (owner's spine: 「这匹马，你肯定见过」, the only galloping horse of 39, "why this one": Han horse hunger → 天马 war → 马援's standard horse → craft (balance, bird base, X-ray iron bones) → 顺拐 → fame → the bird with a real answer 「更像猛禽，不太像燕子——但学界还没定论」 → 铜奔马 has no bird in its name → payoff + vote). pace.py OK. **The owner has not approved v3 yet.** script_v1.md kept.
- Gate 1 (v1): director REVISE + cold read; their notes are folded into v3.

## The horse look (owner feedback, in order)
1. Traced flat (draw_horse2d.py): too plain. 3D (TRELLIS GLB): "wacky", the torso came apart → dropped.
2. "尽可能还原，我们code出来" → vector_trace.py (k-means regions + potrace).
3. "give it our look" → juno_horse.py / juno_frame.py (Juno museum set, glow, rim).
4. "bronze recreation" → bronze25d.py (lit metal; golden-new vs green-patina states).
5. "dots are not bumps", "so many details missing" (tuft, eye, mouth, throat, tail knot, hoof, bird).
6. **Current direction (22:00): "not ultra realistic, recognisable, cartoonish, vector art".** Best so far: `vector_trace.py ref k=5 ss=70 sr=.38 ps=5 turd=40`, recoloured to the Juno patina palette (#16271F #2C4D3E #4B7A63 #77A88D #B2D3BE) + a dark outline. **Not confirmed by the owner yet.**

## Next
- Owner confirms the vector look → add hand line-art (eye + highlight, nostril, mane grooves, tail knot, hoof) + rim light + glow; bird close-up in the same style (ref: 新华社 HD close-up, Kontext-cleaned).
- References: scratchpad `ep58art/ref/horse_zoom.webp` (side, ~560 px horse, soft) and `ref/bird_close.webp` (HD bird). **Better, sharper references would help** (the owner's image-search results are in chat; he can save and attach full-res files).
- Then the 30 s demo with the music, then the full build.
- Assets are not committed (photos, the GLB and renders stay in the scratchpad).
