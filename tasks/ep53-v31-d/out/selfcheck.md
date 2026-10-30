# ep53 v3.1 · TakeD3 owner notes · self-check

Started 13:19 UTC, finished 13:50 UTC. Everything rendered under /tmp only. Nothing committed by me.

**Files changed:** `macro53c.tsx` (M2 only), `world53d.tsx`, `take53d3.tsx`.
**Not touched:** `scene53d.tsx`, `hall53d.tsx`, the L1 camera (125.5–130.069: `camD3` still returns `worldCam(v2Of(t))` for every t < 131.9), the overlay, and the shared sword renderers.
**Type check:** `tsc --noEmit` reports no errors in these files. The only errors are the old qq45/qq46 file-name case clashes.

| # | item | status |
|---|------|--------|
| 1 | M2 top view (102.332–106.861) | **done** |
| 2 | E1 other swords: colouring, glow, tag | **done** |
| 3 | R2 → P1 move (130.069–138.5) | **done** |

---

## 1 · M2 top view (`macro53c.tsx`, v2 time = v3 − 36.227)

**Camera.** A new `CAM_TOP` is defined: pitch 74°, directly above the subject diamond (v = SV). Focal length scales with distance, so the subject stays 22 px/mm. It sits at (960, 770).
- `camBase` blends M1 → top view with `camMix` (height and f in log). The blend runs over v3 100.627–102.827 (v2 64.4–66.6).
- The subject lock fades in over the same window, so the diamond holds its place while the camera cranes up and tips down. It is a crane, not an arc.
- After the blend, a slow 7 % push-in.
- The hush (`B3`) now starts at v3 105.827 (was 106.327) and ends 110.527 as before, still landing on KF11 / `HandoffMacro`.

**The cut.** Seen from above, a vertical section has no visible face, so `SectionCut` is now a **taper section**: a shallow ramp ground into the blade from the line through the subject's widest point, sloping 2.6 mm down over 13 mm toward the lens.
- From above, the 0.85 mm tin skin opens into a broad white band, only under the pale diamond. The dark neighbours show bare bronze with a dark lattice notch.
- The grained cast bronze lies below the band. Shadowed lips on the near and left sides, a lit lip on the right.

**Hits.**
- 102.332 「镀铬？」 appears on its frame (unchanged).
- 103.464: the cut opens on its frame. On the hit frame (3104) about 12 % of the ramp is already there, then it grows downward (skin first, then bronze) with an ease-out over 0.6 s.
- 104.597 「热镀锡 · 2025研究」 appears on its frame (unchanged).

**Tags.** Both sit either side of the subject with leaders, at y = 600, x 535–710 and 1230–1714. They clear the subtitle area and the Cr/Sn tiles.
- 「镀铬？」's leader now lands on the subject's pale face above the cut (its old corner target is inside the cut now).
- 「热镀锡」's leader lands in the white skin band.
- **Change outside the item:** I moved both tags from 62 px to **56 px** to meet the 44/56/72 rule.

**Checks**
- Stills at 101.0, 101.6, 101.8, 102.4, 103.5, 103.7, 104.6, 104.7 (full resolution), 104.8, 105.5, 106.0, 106.8, 107.5, 107.8, 108.5, 109.5, 110.5.
- **Hand-off:** frames 3316/3317/3318 against 3320 (`HandoffMacro`), outside the subtitle box: mean difference 0.17 each (limit 0.3). The raw 3319→3320 difference of 2.5 is the overlay's M3 subtitle switching off on 110.639.
- **Smoothness** (¼-scale video, 100.5–111.6, full-frame mean grey difference per frame): all smooth curves, no single-frame spikes except the 「镀铬？」 hit (9.5 on f3070).

| stretch | v3.1 peak | original v3 |
|---|---|---|
| M1 → top crane, about 101.0–101.9 | 16.5 | 10.8 here (the old tip-down) |
| return to KF11, 108.2–109.3 | 9–11.4 | under 3 |

  These values are high because the whole frame is the contrasting diamond lattice and the view really does turn about 60°. The subject's screen position is locked through the crane.

## 2 · E1 other swords (`world53d.tsx` + tag in `take53d3.tsx`)

**The swords.** `OtherSword` keeps the same positions (on the 椁 floor) and real size. When lit it now has:
- a warm bronze-gold gradient body (#E2B66C → #B88848), well above the floor's #3A2A1C–#4A3624;
- a clear outline: a dark keyline plus a gold edge at up to 0.8 opacity;
- the ridge caught;
- a blurred warm glow under the blade and hilt, plus a warm floor pool (a 0.34).

They still light one per half-bar on frames 3681 / 3715 / 3749 (122.711 / 123.843 / 124.975), switched by `frameOf` as before.

**The hero.** The hero (`SwordSheath`) gets a larger, stronger E1 glow (two pools: 1.05 × span at a 0.42, and a core of 0.62 × span at a 0.40). It is in from v2 85.9–86.483 and out over v2 89.2–90.6, easing out early in L1 with no pop.

**The tag.** 「其他剑」 at 44 px, at (1330, 400), clear of the subtitle and the stamp.
- It appears on the first sword's frame (3681) and fades out over 125.15–125.5, before the L1 move.
- Its leader goes to sword 1. A thin extra leader fans out to sword 2 and sword 3, each on its own lighting frame. They land just past each guard, so the leaders don't cross the hilts.
- The new export `otherAt(c, i)` in `world53d.tsx` gives the leader end points.

**Checks.** Stills at 122.2, 122.7, 122.8, 123.9, 124.0, 124.4 (full resolution), 125.1 (crop), 125.6. In the frame-difference run, 121.9–125.5 has nothing above 3 except the overlay's E1 subtitle on 122.144.

## 3 · R2 → P1, one calm move (`take53d3.tsx`)

**The new camera.** A look-at path: eye, target, log f and principal point, each a C1 monotone Hermite.
- Up to **131.9** (the case hold) the camera is unchanged (`worldCam(v2Of(t))`), so 130.069 and the L1 hand-off are exactly as before.
- From 131.9 it starts with that path's velocity and comes in, without stopping, to a close view of the dulling blade on **134.031** (P1 start, kept): the whole sword across the frame, the rust spot inside it, the eye 0.55 m off.
- It then goes on down the blade's own line toward the tip. The target slides along the blade from the guard side to near the tip, while the eye pulls back past the hood's tip-end corner and turns 34° to look back along the sword.
- It comes to rest on frame 0's camera (`camAt(0)`) at **138.5**, with zero velocity, and holds.
- Every channel is monotone from 134.031 to 138.5: no arc, no swing. The old wide pass at 136.1 is gone.

**Motion** (5 sword points projected per frame, 131.9–138.5)
- Peak 13.3 px/frame at 133.7 (limit 25).
- 0–10 px/frame during the pull-back, easing to 0 by 138.5.
- The whole sword, pommel to tip, stays inside the frame on every frame from 131.9 to 138.5. (In the original, the tip left the frame from about 133.7 to 135.2.)

**Dissolve**
- The plinth and hood no longer pop away at 134.03–134.43. They fade with the hall (`mus`, 134.8–137.8); the hall's walls and floor go a little earlier (134.5–137.0).
- The kitchen comes in over 135.0–138.0. The hood's glass streak sweeps across the frame over 135.0–137.6 at 21 px/frame or less, and the kitchen shows first *inside* the streak, as its reflection (masked layer over the hall, under the sword), then everywhere.
- The cleaver, the dark/warm pools, the far blur, the glint and the 138.2–138.5 cross-fade into `TakeA(0)` are as before. The end card at 140.824 is untouched.

**Two render artefacts fixed on the way**
- The blur filters `d3far` (the far blur) and `kwB3` (the kitchen wall) used bounding-box filter regions, which clipped the world to a hard rectangle during the dissolve. They now use full-frame user-space regions.
- display53k's lit deck pool (`DeckPool` rings) pops as the eye passes over the deck; the original code hid this by popping the plinth away. Now only the case's *light* (`lite`) eases off over 134.3–135.3, so the plinth itself can dissolve smoothly.

**Checks**
- Stills at 130.1, 131.0, 132.0, 133.0, 133.5, 134.0, 134.031, 134.6, 134.8, 135.2, 135.5, 135.8, 136.0, 136.4, 136.5, 136.7–137.5 (every 0.1), 137.6, 138.0, 138.2, 138.4, 138.5, 139.0.
- Full-frame mean grey difference per frame:

| stretch | v3.1 max (mean) | original v3 max (mean) |
|---|---|---|
| 131.9–134.0 | 2.97 (1.73) | 3.80 (2.60) |
| 134.05–135.0 | 3.35 (1.73) | 6.76 (3.79) |
| 135.0–136.5 | 4.27 | 2.67 |
| 136.5–138.2 | 1.66 | 1.79 |
| 138.2–138.6 (home) | 1.57 | 2.36 |

- In 135.0–136.5 the remaining frames above 3 come from the overlay's per-character subtitle reveal and its growing scrim (f4032, 4035, 4051; I checked them on full-resolution difference maps). The dissolve itself stays around 3.

## Notes for the other engineers
- `world53d.tsx` has a new export `otherAt`. `SwordSheath` has a new optional prop `e1`. Nothing was renamed or removed.
- `macro53c.tsx`: `B3` (the hush) now starts at v2 69.6 instead of 70.1. It is still used only inside Leg12.
- Picture outside my items is unchanged: T1–T3, L1, the end card.
- `display53k`'s `DeckPool` rings break up whenever a camera passes low over the deck. I worked around it, but it is still in that shared file.
