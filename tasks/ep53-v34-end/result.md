I did both items. The paper test is gone from B1, which now holds on the blade's edge. The ending stays in the museum, comes to rest on the title shot, and hands over to `<TakeA t={10.4} />` with no visible seam. The film renders throughout. I committed nothing and kept all renders in /tmp.

**Item 1: B1, 92.709–97.804, the edge with no paper**
- **Removed:** the paper stack and its table plane, the cut halves and cut flash, the 「古剑 1977」 clapper slate, the 「划破20多张 / 共30多张」 tags, and the film light (beam and wash).
- **Unchanged:** the blade, today's camera (`camAt` untouched) and both hand-off frames.
- **Blade movement:** the old fast 3 cm drop "into the stack" would look like a jolt with no paper. It is now a calm 2.2 s settle that ends before the hit.
- **Glint:** it first appears on frame 2866 (95.540; frame 2865 has none). It runs along the lower cutting edge from the guard to the tip in about 0.5 s.
- **Resting sheen:** there before and after the glint. It fades out as the camera rises, so the M1 macro's first frame is unchanged.
- **Frame differences (92–99 s):** compared with the old cut rendered the same way, no frame changes more than before (none by more than 0.3). Removing the paper lowered the values through 93.1–94.4.
  - The values above 3 come from today's camera swing and rise, which I kept as asked.
  - The spikes at the two hand-offs (6.14 and 6.17) are the overlay's subtitle switch, the same as before.

**Item 2: the ending, 134.031–145.333, in the museum**
- **Kitchen removed:** `KitchenW`, `toKitchen`, `CleaverK`, the masked reflection, the `d3swB` streak, the kitchen pools and blur, and the `TakeA(0)` hold. The case's deck pool still fades only by group opacity, but it now stays at full strength because the camera moves away from it.
- **Camera:** it comes to rest on R2's close view about 0.35 s into P1, then pulls straight back and up. It settles with zero speed on exactly `camAt(10.4)` at 138.7, and the move after the turn has no reversal.
  - Peak speed is 6.6 px per frame in P1 and 23.4 in R2's tail (the old cut had 23.3).
- **Look and hand-off:** a new component draws TakeA's look at 10.4 from the moving camera, crossfading in over 134.6–137.4. `TakeA(10.4)` then dissolves in over 138.7–139.2 with the camera still. The two pictures differ by 0.002 on average at full resolution, so the hand-off can't be seen.
- **139.692–140.824:** the hall darkens around the case while the sword and its spot stay clear. One glint runs along the near edge, peaking at 140.3.
- **End card:** unchanged, over the held museum picture, with the J seal on frame 4225 and the fade to black as before.
- **Frame differences (130–145.333):** the R2 rise is the same as before. The only other values above 3 are the overlay's subtitle changes at frames 4021 (7.89, was 6.98) and 4191 (4.93). The rest of P1 is ≤ 2.8 and the end is ≤ 0.6. The J seal shows 1.40 at quarter resolution.

**Things to know**
- **R2's last segment changed shape.** The old move carried on toward the kitchen, so the camera now has to stop on the close view before pulling back. As a result it enters the glass hood around 134.0 and leaves it by about 135, so the thin hood edges cross the frame borders twice.
- **Dependency on the opening rebuild:** the look in 134.6–138.7 copies TakeA's lighting values at 10.4. The camera and the final picture come straight from `TakeA` and `camAt`, so they always match. If the other engineer changes TakeA's lighting around 10.4, re-compare frame 4161 with 139.2.
- **Outside my files:** `MUSIC_NOTES_v3.md` row 29 and the "air" row still describe the kitchen hold. B1's 1977 stamp (from `lines53v3`) still says 「30多张纸划破20多张」; I left it as is because it isn't mine.

**Files** (in `episodes/37-qiqing/remotion/src/qq53/`)
- Changed:
  - `paper53c.tsx`: only the `Paper53` drawing; exports unchanged.
  - `take53d3.tsx`
  - `end53d3.tsx`: one comment only.
- New:
  - `edge53e4.tsx`: the edge glint and sheen.
  - `museum53e4.tsx`: TakeA's look for any camera, plus the darkening and last glint.
- Self-check with all the numbers: `tasks/ep53-v34-end/out/selfcheck.md`
