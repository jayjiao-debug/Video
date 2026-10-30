# ep53 case / cleaver / skeleton / element tiles — self-check

Start: Fri Oct 30 06:59:57 UTC 2026 · end: 07:21 UTC. The film renders throughout (final sweep: 0, 5, 9.6, 13, 20.5, 33, 39.5, 41.5, 60, 80, 96, 98, 102, 106, 108, 112 s). Baseline stills (v2, git HEAD in a /tmp worktree) under /tmp/r53/base, /tmp/r53/*b.

| # | item | status |
|---|------|--------|
| 1 | display (展台) | done (sword size limited by the camera — see notes) |
| 2 | cleaver | done |
| 3 | tomb occupant | done |
| 4 | element tiles | done |

## 1 · the display — done (partly on the 45 %/60 % sword-size target)
- New `display53k.tsx`: a 760 × 520 mm lectern vitrine (deck tilted 22° toward the viewer, deck under the sword axis at z 955),
  brass lip on the front edge, toe shadow, spot pool on the sloped deck, the sword's shadow, two small clear rests (x −150 / +160),
  the pommel mirror small on the deck beside the hilt (x −342, y −96), and a LOW glass hood (115 mm): faint glass faces, thin bright
  edges (far edges dim under the sword, near edges over it), one reflection streak. The hood dissolves when the lens is within
  ~30 cm of it (no cutting through glass, no near-plane slivers). Exports: `DisplayBack`, `DisplayFront`, `PommelMirror`,
  `mirrorAt`, `titleQuadOn`, `hoodDist`, geometry constants.
- Start hall: `take53.tsx` `Museum` now draws `DisplayBack` (old 1.6 m box, holders, mirror, hood edges removed); `PaneStreaks`
  (already drawn after the sword in `TakeA`) now draws `DisplayFront`. Exports kept: `PANE_Y` (= hood front, −176), `TITLE_W/H/C`,
  `titleQuad` (now the quad on the hood's top glass). Mirror tag 「剑首 · 11道同心圆」 moved to the left of the mirror.
- End hall: `hall53d` `CaseHall` (via `Museum`) + `scene53d` `CaseW` → the same display; `CaseW` draws `PommelMirror` (fades when it
  gets big in the close pass 101–104 s) and `DisplayFront` over the sword. `GlassPass`: the v2 pane at y = −0.8 m is gone; now only a
  soft streak when the lens is within 25 cm of the hood (≈ 101.8–102.6 s).
- Title: etched on the hood's top glass behind the blade, plaque 680 mm; slam f285 unchanged (master logic untouched).
  On-screen plaque ≈ 880 px wide at 9.6 s vs ≈ 1240 px in v2 (≈ 71 %), centred, just above the sword — the hood is only 732 mm
  wide and the camera is ~1.5 m away, so this is as large as the glass allows with the current camera.
- **Sword size: NOT reached with the current cameras** (not my lines). Measured sword width / frame width: 9.6 s 41 %, 11 s 38 %,
  13 s 44 %, 15 s 38 %, 17 s 28 %, 96 s 39 %, 98 s 42 %, 100 s 49 %. The display is made narrow so the v3 re-time can dolly in:
  test composition **`DISPLAY53K`** (`demo53k.tsx`) uses the film's own cameras pulled in along their view axis to 60 % (title) /
  48 % (hall, end): the hood stays inside the frame (9.6, 11, 13, 96, 98, 99.5, 104.5 s); at 15–16 s the plinth's front corner and
  the mirror touch the frame bottom unless the principal point CY (790 → ~600) is raised too.
  **For the camera owner (take53 `LND`/`FF`, scene53d `POSES`)**: for 60 % at f = 2100 the pommel distance must be ≈ 1010 mm
  (now 1505 at 9.5 s; i.e. × 0.67); for 48 % in the hall ≈ × 0.85–0.9 of the current distances; the end poses 95.8–99.8 s ≈ × 0.82.
  With that dolly the title (on the glass) comes back to ≈ v2 size by itself.
- Not done: the sword does not tilt with the deck (`SwordPose` has no roll; sword renderers are the other engineer's). It lies level
  on the rests, which reads fine; if a roll is added, use `DTILT` (22°) from display53k.
- Stills checked (half and full size): 7.2, 9.6, 11, 13, 15, 17, 18, 19, 19.6, 20.3, 96, 98, 100, 100.5, 101, 102, 103, 104, 106;
  demo 9.6, 11, 13, 15, 16, 96, 98, 99.5, 104.5. Consecutive frames (mean grey diff, v3 vs v2): f198–201 3.9/3.8, 230 5.3/5.0,
  250 4.2/3.0, 283→284 1.2/0.7, f285 slam 9.7/12.8 (planned), 285→287 3.0/2.1 vs 7.4/7.2, 300 1.2/4.4, 3000 3.3/2.8, 3020 3.5/2.3,
  3040 3.4/3.0, 3060 7.5/7.7, 3090 6.6/6.9, 3120 3.6/2.5 — all at or near v2 levels (camera motion), no new jumps.

## 2 · the cleaver — done
- New `cleaver53k.tsx` `CleaverK`: broad rectangular blade 205 × 96 mm (same footprint/edge line as v2, so the glide still lands),
  slightly curved edge (2.5 mm belly), flat spine with a light spine band, rounded front-top corner, small hanging hole, short steel
  neck, metal ferrule, short ROUND wooden handle (11 cm, slight swell, grain lines, end cap) with two rivets; brushed steel (26 faint
  strokes) + polished edge band and shoulder line; small rust clusters (bloom with rho as before) and water beads.
  Cooler and darker than v2 (steel #2C3134–#525A5E). Handle parts are skipped when any point is < 25 mm from the lens (the glide
  passes over the handle — avoids near-plane slivers).
- `end53d.tsx` `CleaverD` = `CleaverK` (used by take53 frame 0 and the end kitchen); `kfA53.tsx` `Cleaver` = `CleaverK` too (key
  frames match the film; v2 drawing kept as unused `CleaverV2`).
- Stills: 0.0, 0.5, 1.0, 106, 108, 110 (full size). Consecutive f0–41 (every 5): 1.3–7.1, all ≤ v2 (1.9–6.9).

## 3 · the tomb's occupant — done
- `scene53c.tsx` `Occupant` replaced (only the occupant drawing + its clip/placement lines in `Chamber53`): a simplified skeleton
  lying supine on the inner floor, pale bone-cream line art (skull and jaw as outlines only, no detail inside the skull; vertebrae
  as short dashes; clavicles; six curved ribs each side; pelvis wings + sacrum; humerus, radius/ulna, a few hand bones; femur,
  kneecap, tibia/fibula, a few foot bones — long bones drawn as hollow capsules), ochre-brown soil stains under it, decayed textile
  as soft dark blurred shapes over pelvis/thighs/chest. Group opacity 0.62, so it stays well under the sword and the hilt.
- Sword on the occupant's LEFT (facts A9): head at x −0.72 facing up, so its left is +y, where the sheath already lies (y 0.15);
  body axis moved to y −0.07 so the left arm runs just beside the sheath, not under it.
- v2's occupant was invisible from ≈ 40 s on (it was clipped to the inner coffin's rim, which is above the lens once the camera
  drops below 0.7 m). It now has its own floor clip (rim clip only while the lens is above the rim), so it is also there **under
  the hands 41–44 s**; while the sword is lifted (41.2–42.55) it dims to 60 % and goes softly out of focus (DOF blur ≤ 4 px).
- 「墓主人」 caption kept (same timing), re-aimed at the new skull position.
- Stills: 39.0, 39.5, 40.5, 41.5, 42.5, 43.5, 44.5 (full size). Consecutive frames f1168/1185/1215/1236/1260/1290/1305: 5.2 (the
  plan-view switch at 38.93, v2 5.4), 4.2, 0.5, 0.8, 3.1, 2.4, 1.5 — no jumps.

## 4 · element tiles — done
- `elements53k.tsx` `ElementTile53` (SVG `<g>`): props `el` ('Cu'|'Sn'|'Pb'|'Cr' or custom `{z, sym, zh, en}`), `x`, `y` (centre),
  `s` (side, default 260 px → symbol 112 px), `state` ('normal' | 'hi' | 'question'), `o`, `id`. Lacquer-dark rounded square, thin
  gold rule + hairline, atomic number top-left (Cormorant lining figures), big symbol (Noto Sans 700, cream; gold when 'hi'),
  Chinese name (文楷), English name. 'hi': warmer ground, brighter/thicker rule, soft gold glow. 'question' (铬): dashed rule + a gold
  「?」 badge — never struck through (there is no strike state). Data table `ELEMENTS53` (29 Cu 铜 Copper, 50 Sn 锡 Tin, 82 Pb 铅 Lead,
  24 Cr 铬 Chromium). Loads the 文楷/Cormorant fonts via `useStampFonts`.
- Test composition **`ELEMENTS53`** (`elemtest53k.tsx`): all four at 260 px (Cu normal, Sn hi, Pb normal, Cr question) and at 170 px.
  Rendered and checked at full size: legible; at 170 px the English name is ≈ 16 px (use ≥ 210 px if the English must read on a phone).

## Files
New: `display53k.tsx`, `demo53k.tsx` (test comp DISPLAY53K), `cleaver53k.tsx`, `elements53k.tsx`, `elemtest53k.tsx` (test comp ELEMENTS53).
Edited: `take53.tsx` (`Museum` case lines, `PaneStreaks`, title quad constants only; camera and hook untouched), `hall53d.tsx` (unchanged
code, it uses `Museum`), `scene53d.tsx` (`CaseW`, `GlassPass`), `end53d.tsx` (`CleaverD`), `kfA53.tsx` (`Cleaver`), `scene53c.tsx` (occupant).
No exports removed or renamed. Nothing rendered into the repo (all under /tmp/r53).

## Needs someone else
- Camera owner: dolly in for the sword-size target (numbers in item 1; `DISPLAY53K` shows the framing).
- Sword owner: optional 22° roll (`DTILT`) if the sword should follow the deck's slope.
