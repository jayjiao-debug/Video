# ep45 《马首回家，用了160年》 — rebuild brief (v2, 2026-10-25)

Owner, after watching the ep43 《假如你是清明上河图》 final: "I feel like the general direction is good, but the art, logic,
visuals and animation logic, animation, transitions is not good. Please see if you can use this script as a basis, you
can completely change everything here, these are just for reference."

## Decisions (owner, 2026-10-25 11:58)
- **Look:** propose 2–3 NEW looks (2 style frames each: hook + key visual) for the owner to pick. One of them may carry
  the ep43 approach over (silhouette theatre; the hero is the only light), but re-made for this story: the hero is the
  red-copper horse head, so its light is copper, not silk-gold. The others must come from a different world.
- **Script:** the story and the facts stay (facts.md F1–F27 incl. corrections; HANDOFF.md §5 beats, §6 logic rules).
  The lines are rewritten to the ep43 standard: key-word highlights on about a third of the lines, only on the payoff
  (numbers, turns), not on names/places; ≤ 16 字 per line; each line reads alone; picture logic per line (who does
  what, what moves, how we get to the next room). Owner sees the lines before the build.
- **Music:** bgm2 (owner's track; file must be re-attached — not in the repo), **one cut + a fade-out at the end**, as
  in ep43. No loops, no inserted silences, no dead stops. Picture and lines are timed to the music, not the other way.
- **Engine:** the ep43 three.js engine (2.5D layered stages, camera as a pure function of time, transitions as masks
  with each side graded by its own scene, figures on the IK rig with contact checks, Modal T4 farm). Caption style =
  ep43 v6: C tags (white on red), top-left subtitles 64 px, corner items inside the Douyin-safe margin (stamp 72/64 px,
  corner block 140/56 px), round 朱文 J seal bottom-right, adaptive backing only on bright ground.
- **Owner touchpoints:** pick the look, OK the lines, watch the cut. Everything else automatic.

## What failed in the demo (owner + v1/v2 reviews; must not repeat)
Art (zodiac heads read as blobs; claw hands), logic (counter vs picture; scale; feet on water), visuals (flat sets,
canvas edges), animation (pops, frozen frames, stiff walkers), transitions (36 hard cuts; whips standing in for ideas).
