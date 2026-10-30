# ep53 v3 TakeG (51.954 → 92.709): self-check

Started 08:36 UTC, finished 09:05 UTC. All renders were made under /tmp only. I commit nothing.

## Files
- `episodes/37-qiqing/remotion/src/qq53/take53g.tsx`: `TakeG`. The stub body is replaced and the export is unchanged.
- New `cam53g.ts`: the one camera (spline channels for distance, tilt, lens and height, plus an integrated glide speed along
  the blade), `worldG`, `mapG`, the scene positions `GA` and the scene envelopes `vigK`. It is `.ts`, not `.tsx`, because it
  holds no JSX; it has the `53g` suffix.
- New `shadow53g.tsx`: the shadow play (scenes G1–G7) and the reflection panel, with the spec lattice over it.
- **Nothing outside my files was edited.** Read-only imports: `paper53c.camAt`, `cam53c.aCenter`, `blade53c.BladeFlat/MarkSet`,
  `inscr53c.litOf/hexMix/LATC`, `scene53c.Chamber53`, `take53c.TakeC`, `kfG53` (`Sil`, `Stand`, `Soldier`, `KingSeat`,
  `Palace`, `Mountain`, `SpearRing`, `homog`), `swordspec53s` (`latCells`, `cellQuad`, `LAT`, `hwS`, `edgeS`, `A`, `LBLADE`, `METAL`).
- `tsc --noEmit` reports no errors in my three files.

## How it is built
- The picture is the paper test's own picture: `BladeFlat` and `MarkSet` from the one sword spec, the same lit marks as at
  v2 56.482, the same ground `#24100C`, the same pool and the same vignette. It is seen through `cam53g`, a real look-at
  camera in `paper53c`'s world. At 51.967 the camera equals `paper53c.camAt(56.482)`: face-on, 76 px/cm, the axis on y 639.
- The story is drawn on a flat panel lying on the blade face. The panel is mapped to the screen by the camera's homography
  (CSS `matrix3d`, as in kfG53) and clipped to the face inside the polished edge strips. Over each scene the panel draws the
  **spec lattice** (`latCells` + `cellQuad`, `LAT.ink`, `LAT.line`, cores `LAT.coreSc`, pale `LAT.paleHi`) at about 30 %,
  plus the ridge as a thin gold crease (`METAL.lit`, 0.45 mm, 32 %). The edge strips stay bright gold throughout.

## Items

| # | Item | Status | What I checked |
|---|---|---|---|
| 1 | Hand-off at 51.954 = v2 TakeC 56.482 | **done** | Frame 1559 is rendered as `<TakeC t={56.482}/>`. Its mean grey difference against the stub's frame 1559 is **0.000**. Neighbouring frame diffs (0.25-scale video): 1558→1559 **1.5**, 1559→1560 1.6, 1560→1561 1.6, the same as the glide before it (1.6–2.2). The v2 picture at 56.482 is a 50/50 blend of Chamber53 and Paper53. My renderer matches Paper53, and Chamber53's half fades out over 0.4 s while it keeps its own 0.83 cm/s glide. My camera also starts at 0.83 cm/s, so there is no speed jump. |
| 2 | Hand-off at 92.709 = v2 TakeC 56.482 | **done** | Frame 2781 is `<TakeC t={56.482}/>`: diff against the stub **0.000**. Neighbouring diffs: 2779→2780 0.8, 2780→2781 **0.5**, 2781→2782 **1.0** (the paper test's own move then starts: 1.8, 4.3, 5.6, 7.8). The camera arrives with zero speed. Chamber53's half fades back in over the last 0.4 s, shifted with the blade. |
| 3 | One continuous move | **done** | No cut and no dissolve of the picture. Drop: 52.1 → 56.2. Then a slow constant glide toward the tip at 0.48 cm/s (it slows to 0.2 cm/s on the seat for G5/G6). G6 push-in: 77.5 → 79.9, out 80.4 → 82.9. Rise and return: 85.0 → 92.7, an eased slide back to a = 21.1. **Drift, measured analytically on 300 blade points per frame: worst 16.2 px/frame (frame 2636), ≤ 25 ✓.** Typical: drop ≤ 15.5, glide ≈ 2.5, return ≤ 16. |
| 3b | Mean grey diff ≤ 3 per frame | **partly** | 0.25-scale video, 51.5–93.2: the glide reads **2.6–3.2** (mostly 3.0), the seat reads 1.3–1.4, the hand-offs 0.5–1.6. Above 3: the **drop** (peak 5.8 at 54.7), the **G6 push-in/out** (4.1) and the **return** (5.1 at 88–89). They are camera moves the brief asks for (drop low / push in / come back up), over the high-contrast lattice, and they are smooth (no frame-to-frame jumps). For scale: v2's own paper-test move right after 92.709 measures 7.8–8.6 in the same test. Slower versions would mean a shorter glide or no return, so I kept them. |
| 4 | Eight scenes, one per line | **done** | G1 51.954 会稽山, the broken army climbing, two rings of 戈 closing round the foot (53.3 → 55.6, before 「被围在会稽山」 ends); the deep break 56.482–57.048 holds still apart from the slow glide (nothing new happens) · G2 57.048 the envoy kneels **alone** before 夫差 on a dais with a screen; his bow (顿首) is complete on **DA(26) 59.312 (frame 1779)** · G3 61.577 伍子胥 walks off to the left; the palace sinks into rippling water (63.2 → 66.3) · G4 67.237 夫差 on a **chariot** under a canopy (turning wheel), two horses walking (leg gait), **勾践 on foot a pace ahead of the horses, hands free, facing the road** · G5 71.766 alone on his mat; the gall **on a small stemmed stand beside the mat, its top above his eye line**; on [尝] he leans up and reaches it, complete on **DA(33) 75.159 (frame 2255)**, and the firelight dims a shade · G6 77.426 push-in on the same seat; 会稽山 and the ring of 戈 rise faint behind him (78 → 80) · G7 81.388 越's ranks march on; the palace goes fully under on **DA(38) 86.484 (frame 2595)**; 夫差 is shown only as a fallen cap and a dropped sword · G8 87.049 the reflection fades out (87.25 → 89.4) and a soft glint crosses the clear bronze (88.4 → 91.9). |
| 5 | Fact-check picture fixes | **done** | G2: no 勾践 and no wife in the scene. G4: 前马, no bridle, a chariot (no rider on a horse). G5: the gall is placed, not hanging. 夫差's death: no rope, no blade at a throat. Dress: kfG53's generic robes and caps; faceless one-tone silhouettes with a warm rim (`Sil`). |
| 6 | Continuity #2: lattice and marks from the spec | **done** | The blade is `BladeFlat`; the marks are `MarkSet` = `birdScript(markSeed)` × `MARK_K` (12.5 mm), the same as the inscription leg. Full-size crops of frames 1558/1559/1560/1561: the 8 marks have identical shapes and only move about 2 px/frame. The reflection's lattice is `latCells`/`cellQuad` and lines up cell for cell with the blade's lattice at the scene edges (checked on 59.4, 69.5). kfG53's `LatticeOver`, `Mark`/`birdGlyph` and `bladePath` are **not** used. |
| 7 | Figures move a little, no beat pulsing | **done** | Climbing drift, closing rings, the bow, walking, horse gait, wheel turn, the reach, marching, ripples. The firelight flicker is two slow sines (2.3 and 5.7 rad/s) on its own clock. Nothing is keyed to the beat except the three hits above. |
| 8 | Tags | **n/a** | My picture has no text or tags (the overlay draws the depth tags). |
| 9 | Style B | **done** | Dark warm ground; the sword is the brightest thing; the only saturated colours are bronze-gold and the blue guard glass (visible at the hand-offs). The firelight in the reflection is a warm orange inside the gold blade. |

## Stills I looked at (film s)
52.1, 52.8, 53.0, 53.6, 54.4, 55.0, 56.8, 57.6, 58.0, 59.4, 61.0, 63.0, 64.5, 65.5, 66.5, 67.0, 69.5, 71.0, 73.5, 74.0, 75.3,
78.0, 79.5, 79.8, 82.5, 84.0, 85.0, 86.5, 88.0, 89.5, 90.5, 91.0, 92.4, 92.6, plus frames 1558–1561, 1777–1780, 2253–2256,
2593–2596 and 2779–2782.

## Notes for the producer / other engineers
- Scenes sit about 2–3 cm apart on the blade (the glide is slow, to keep the frame-diff test near 3). When a line changes,
  the outgoing scene cross-fades out over about 1.6 s inside the mirror while the new one comes up beside it. The camera
  never cuts.
- The subtitle area (x < 1150, y < 280) lies over the upper-left part of the blade during the glide. The overlay's scrim
  handles that; the scenes' figures sit in the lower half of the face, under it.
- The storyboard's 「Match 3」 (a 90° roll at the tip) is not built: the brief asks for a return to the inscription view at
  92.709 instead.
