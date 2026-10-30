# ep53 TakeC round-2 self-check

Method: stills rendered with SFPS=1 (frame numbers), mean grey difference between consecutive frames. Two numbers where the top overlay matters: "full" and "below y=330" (picture only, excluding the top-left subtitle and top-right stamp, which are master53.tsx, not my files). All files under /tmp, nothing rendered into the repo. `tsc` clean for *53c files.

| # | Result | Before -> after |
|---|---|---|
| 1 | DONE (picture). Stamp part NOT done (master53) | f1847->1848: full 17.5 / picture 17.3 (luma -7.7) -> picture 0.82 (full 5.9 = subtitle line change + stamp swap only). 61.50-61.70 picture <= 1.0 per frame |
| 2 | DONE, residual is camera motion | f1710->1711: 31.2 (luma +34) -> no spike; 1709..1714 ~9.8-10.5 full / 14 picture per frame, of which ~7-8 is the pre-existing camera swing across the lattice (baseline 7.4-7.8 before the stack) |
| 3 | DONE | f1152->1153: 11.3 (luma -9.7) -> 1.0-1.3; 38.0-38.8 now 0.0-7.8 per frame (motion of lid + men), no hole, no luma step > 3.4 (peak at 1145) |
| 5 | DONE | f1089->1090: 8.5 (luma -6) -> 3.4; max over 36.1-36.7 is 5.8 (was 10 at 36.3-36.6 in the first version of my fix, 8.5 baseline) |
| 6 | DONE | right end no longer frays; lattice, edge strips continue past both frame edges while the camera looks down |
| 9 | DONE | see below |
| 11 | DONE | f1914->1915: 15.9 -> 8.6 which equals its neighbours (9.1/8.3, camera motion); no spike |
| 17 | DONE (one reading to confirm) | see below |
| 16 | DONE in take; stamp fade not touched | see below |

## Item 1 (61.567 -> 61.600)
- `paper53c.tsx`: new export `BladeEnd53` = the same `BladeFlat` + `MarkSet` as Paper53 at its last frame (END_CAM, lifted, same lit colours).
- `macro53c.tsx` (Leg12): from 61.577 it draws `BladeEnd53` on top of the macro, scaled/rotated with the macro camera (`c0.z / m.z`, rot delta), opaque until 62.0, then cross-faded to the macro land over 0.8 s (62.0-62.8).
- Stamp: the stamp is replaced at 61.577 because the subtitle line changes from B1 to M1 and `stampAt` in `master53.tsx` fades the new head in only after the line has typed. Not my file. Needed there: keep B1's stamp until 62.0 and fade it over 0.3 s. The subtitle line swap (B1 -> M1) at 61.577 is the remaining ~5 of the "full" diff.
## Item 2
- `paper53c.tsx`: stack + table + front halves use `riseU = sstep(seg(t, 56.75, 57.35))` as opacity (x the existing fade-out at 60.55-61.4) and rise 60 px (translateY) while the camera swings. `T_LIGHT` still drives the beam and lamp glint only.
## Item 3 (and the chamber)
- Cause: lid 2 was lifted to 1.36 m, i.e. above the camera (1.35 m at 38.4) and its near edge crossed the near plane, so the lid filled the frame and then flipped away.
- `scene53c.tsx`: lid 2 lifts only 0.34 m with a 0.22 m hump (`lidEdges` takes `lift`/`hmp`; lid 1 unchanged), the pass ends 38.5 (was 38.85) and lid 2 is drawn at 15 % opacity while it is overhead (38.0-38.25 down, 38.45-38.8 back up), so the interior fades up behind its rim-lit edge. Camera unchanged.
## Item 5
- `scene53c.tsx` `Planks`: planks now open from the middle outward (centre pair at 36.10, then 0.1 s steps), each rising 0.6 m and sliding 2.3 m with smoothstep over 0.85 s, so the roof is seen lifting, not dissolving. Men still fade in 36.7-37.1 (unchanged `dOp`). I did not do the literal "two planks, 120 px/400 px": a two-plank opening would hide the coffin and the men; this opens all 8 in sequence instead.
## Item 6
- `macrob53c.tsx`: while `pal < 0.999` the lattice, the edge strips and the near-blur layer run on past the base end to `U0` (the nearest u still in front of the lens, down to -450); at pal = 1 everything is exactly the old BladeMacro code path (U0 = 8).
- Handoff check: 2229-2254 picture diff (y>330) 0.12 at the 74.412 swap, 0.00 after; full-frame 2.56 at that frame is the same before and after my work (subtitle line change), not a regression.
## Item 9
- `paper53c.tsx`: lean 2.0 -> 5.0, sag 1.5 -> 3.5, 1 px #6A5535 edge at full opacity on the fresh offcut faces, glint r 30 -> 70 held 0.25 s, tag fade-out moved to 60.45-60.8, lift start 60.35 -> 60.7 (ends at 61.577 so it still lands on END_CAM), camera move start 60.0 -> 60.1 (to keep the camera speed up to the baseline: peak 16.8 vs baseline 15.8 mean grey diff per frame at 61.0-61.3).
- Visual upgrade done: 3-frame cold flash #F2F6F8 (75 %) over the blade from frame(59.312) (diff 13 at that frame, a planned hit).
## Item 11
- `macro53c.tsx`: tag + scrim opacity = `sstep(seg(t, 63.6, 63.9))`.
## Item 17
- `scene53c.tsx`: outline 3 px #E8C9A0 at 55 %, dash 16/6; 「墓主人」 caption 28 px at the skull (38.6-41.15); a 20 px contact shadow #000 35 % under the sheathed sword in the plan view (gone as the hands lift it at 41.2).
- Reading to confirm: the skeleton is mirrored (head to screen right), because with the head to the left the sword (which lies on the screen's upper side) would be on his RIGHT. Now the sword is on 墓主人's left, as the line says, and the caption makes the head readable. If "left" meant screen-left, revert the `-x` in `Occupant`.
## Item 16
- `scene53c.tsx`: the digger on the screen's right is moved 120 px left 37.15-38.4 (eased in/out), clear of the stamp. The stamp itself (master53.tsx) not touched.

## Not done / for others
- master53.tsx: stamp hand-over at 61.577 (item 1), stamp is not faded when a figure is under it (item 16 alternative).
- Pre-existing, not in my list: 36.104->36.137 (f1083->1084) diff 7.5 at the roof/shaft swap, and 38.935->38.97 (f1168->1169) diff 3.4 at the plan-regime swap (`top`), both from hard switches in `scene53c.tsx`/`shaft53c.tsx`.
