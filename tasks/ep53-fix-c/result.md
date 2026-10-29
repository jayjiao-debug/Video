I fixed all the assigned TakeC items except item 12 outside my range. The one soft spot is the 61.58 s handoff from the paper test into the macro, which still shows a small tone pop instead of a fade.

**Checks.** The code type-checks for `qq53`. I looked at half-scale stills for every item. I also rendered frames 1000–2256 (33.3–75.2 s) at quarter scale and ran a neighbour-frame difference test. The only large jumps are planned hits: the film-light click at 57.03, the tags at 63.84 and 66.13, and the Paper-to-Leg12 switch at 61.6.

**Items**
- **4 (paper test):**
  - **Rebuild:** I rebuilt it in a 3/4 view with 30 thin separate sheets. The blade lowers edge-first, base end leading, from 59.15 to 59.45. At 59.312 the top 20 sheets split, and their halves lean out and sag about 55 px. The bottom 10 stay intact.
  - **Look:** The stack is mid-tan (#B89C6E), so the blade is the brightest thing. The tags 「划破20多张」 and 「共30多张」 sit beside the stack inside the safe area at 56 px and 48 px. After the cut the blade lifts out and the camera rises with it.
  - **Camera:** The camera now ends on the exact view the macro starts from.
- **9 (hands):** The hands are redrawn as lacquer-brown sleeves with cuff, wrist and thumb. The right hand leaves the pommel from 43.8 and is gone by 46 s. The left hand drops out with the sheath by 47 s.
- **10 (no fades):** The `Fade` wrappers are gone. The chamber and paper test now draw the same blade with the same marks and camera, so that seam is nearly invisible. At the Paper to Leg12 seam the picture is one blade each side with no dissolve, but the two renderers are not pixel-identical (about 17 against 1–2 for neighbouring frames). The macro-to-hush seam is identical.
- **11 (roof):** Eight planks rise and slide aside from 36.1, centre planks first. The excavators fade in from the dark at 36.7–37.1.
- **Coffin push-in and ladle:** The sheathed sword is about 46 % of the frame width at 40.5 s. The water is a hand-held ladle with a visible stream, a splash and a sheen that travels along the sheath.
- **鸟篆 marks, letter count, paper tags:** The marks are redrawn with long verticals, curled ends and bird heads. The count runs 10 → 20 → 30 → 「40多封信」 with no bare 40. Tag placement is covered under item 4.
- **16 and 17:** Lid tags ① and ② now fade as their lid leaves the frame. The 38.2 shot opens earlier and the lids are lit, so it is no longer black. The macro tag has a feathered scrim, and its second row is raised to 56 px.
- **12 (lattice):** Within TakeC, one lattice look runs from 43.5 to 75.16 s. The macro now uses the real 20.5 × 11.8 mm pitch and blade width, and its palette morphs back to `HandoffMacro`'s old look only during the hush. I did not touch the lattice in `take53.tsx`, `tomb53.tsx`'s `Blade3D`, or `scene53d.tsx` (not my files).
- **14 (shaft walls):** `tomb53.tsx` and `shaft53c.tsx` got the same patch: mottled brown #54402A, a grey-green course #434C4B and a pale course #9E9A8B. The seam at 33.274 matches its neighbours once the typed subtitle is ignored.

**Outside my files.** The subtitle at 56.5 and 61.6 s shows only its first typed character; that comes from the `master53` overlay.

Nothing is committed and no rendered images are in the repo; all renders are under `/tmp`.

Files are in `tasks/ep53-fix-c/out/`:
- selfcheck.md

Code changes are in `episodes/37-qiqing/remotion/src/qq53/`; the two new files are `blade53c.tsx` and `macrob53c.tsx`.
