All nine items are fixed in TakeC except the stamp part of item 1, which needs a change in `master53.tsx`, a file I wasn't allowed to edit. I checked each fix by rendering consecutive frames and measuring the mean grey difference. I did not check the pixel stills at the film's real frame rate, and nothing was rendered into the repo. Nothing is committed.

I measured the difference two ways: over the full frame, and over the picture below y = 330, which leaves out the subtitle and the stamp.

| # | Before → after |
|---|---|
| 1 (61.567) | Picture diff 17.3 → 0.82. Leg 12 now opens on the same blade drawing the paper test ends on, then cross-fades to the macro over 62.0–62.8. |
| 2 (57.033) | Diff 31 → no spike. The stack now fades in over 56.75–57.35 and rises 60 px. The per-frame diff there is still about 10, but about 7–8 of that is the camera swing that was already in the baseline. |
| 3 (38.4) | Diff 11.3 → 1.0. The lid was being lifted above the camera and filling the frame. It now lifts less and goes translucent while overhead, so the interior fades up behind it. |
| 5 (36.3) | Diff 8.5 → 3.4. The roof planks now rise and slide away one by one from the middle outward. I opened all eight rather than only two, because a two-plank gap would hide the coffin and the men. |
| 6 | The blade no longer ends or frays at the right edge while the camera looks down. |
| 9 | Lean 2.0 → 5.0, sag 1.5 → 3.5, sheet edges drawn on the offcut, glint r = 70, lift held to 60.7. The 3-frame cold flash is in too. |
| 11 | The tag fade-in is smooth; its diff now matches its neighbours (about 8–9, which is camera motion). |
| 17 | Outline is thicker and brighter, with a 「墓主人」 caption and a contact shadow under the sword. |
| 16 | The right-hand digger moves 120 px left during 37.15–38.4, clear of the stamp. |

- **Handoff check:** across 2229–2254, picture diff is 0.12 at the 74.412 swap and 0.00 after. The full-frame 2.56 at that frame is the subtitle line change, and it is the same before and after my work.
- **Item 1 stamp, needs master53:** the stamp and the subtitle swap at 61.577 because the line changes from B1 to M1. To keep the stamp until 62.0 and fade it over 0.3 s, `stampAt` in `master53.tsx` has to be changed. That swap accounts for the remaining full-frame diff of about 5 there.
- **Item 17 judgement call:** I mirrored the skeleton so the head is on the screen's right. With the head on the left, the sword would have been on the owner's right, not the left as the line says. If you meant "left" as the screen's left, revert the `-x` in `Occupant` in `scene53c.tsx`.
- **Item 9 camera trade-off:** to keep the camera rise from getting faster after the longer hold, I made it start at 60.1 and the lift end at 61.577. The peak per-frame diff there is 16.8, against 15.8 before.
- **Two hard switches I left alone:** frame 1083→1084 (diff 7.5) at the roof/shaft swap, and frame 1168→1169 (diff 3.4) at the top-down switch. Neither was in my list.

The edits are in `paper53c.tsx`, `macro53c.tsx`, `macrob53c.tsx` and `scene53c.tsx` under `episodes/37-qiqing/remotion/src/qq53/`. The full write-up is `tasks/ep53-fix-c2/out/selfcheck.md`.
