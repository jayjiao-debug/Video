All four items are done: one shared sword spec now drives every renderer in my files, the hook "shine" is fixed, the blooms sit on the blade, and M2 has a single subject. `EP53` and the key-frame sheet typecheck clean and render at every time I checked; nothing is committed.

**1. One accurate sword, everywhere**
- **Spec:** new `swordspec53s.tsx` holds the outline, the ridge and edge strips, one lattice constant (20.5 × 11.8 mm diamonds, line widths, pale and dark fills), the guard, the grip with two hoops, the outward-turned pommel, and the inscription.
- **Shape:** 55.6 cm overall. The blade is widest (5 cm) about a third of the way from the guard, then a gentle waist and a sharp point. Blue glass is on the front of the guard, turquoise on the back.
- **Flat views:** the chamber, the inscription view and the paper test now draw one shared flat sword (new `flat53s.tsx`).
- **3-D views:** the hook, the museum, the case in TakeD and the kitchen glow all use the rewritten `sword3d.tsx`. Hidden faces are culled and parts are painted in camera order, so the grip can no longer draw over the guard and the blade can't poke into it.
- **Macro:** its cells were 15 × 6.2 mm; they now match every other view. The pommel mirror image uses the same 11-ring face.
- **Inscription:** the marks used to run across the blade, never appeared in 3-D, and faded out at 62–63.6 s. They now sit on the blade's real surface in two columns of four along it, heads toward the guard. In M1 the camera flies forward exactly 5 cells (102.5 mm) and the marks slide out behind it instead of fading.
- **Check:** a QA composition (`test53s.tsx`, not in the film) shows the flat and 3-D swords agree part for part.

**2. Hook shine (0:01–0:05)**
- **Cause:** the ridge's line width was computed from the distance to the middle of the blade, so it swelled to about 50 px as the camera passed over it.
- **Now:** a crisp ridge line at most 2.6 px wide, lit by a lamp ahead so it travels with the light and fades with distance. Pale cells catch light on their rims, with up to 7 small glints.
- **[亮] at 2.707:** the lamp flares on the ridge and rims at that spot, with a small star on the ridge instead of the 34 px star.

**3. Rust blooms (1:15–1:21)**
- **On the surface:** new `blooms53s.tsx`, used by the film and the KF11 key frame. Each bloom is pinned to a lattice cell and projected through the same camera as the lattice, fogged the same way. The rings are dashed in world units and foreshorten with the blade; there are no screen-space blurs.
- **Timing and size:** 75.162 / 75.728 / 76.860 kept; small and olive.
- **Hand-off:** below the subtitle area (y > 420), frames 2229–2254 are identical, and 2254→2255 differs only by bloom 1.
- **Overlay changes:** the full-frame differences (2.55 at 2232→2233, 2.04 at 2254→2255) come only from subtitle and stamp changes drawn by `master53`.

**4. M2 (1:06–1:10)**
- **Subject:** one pale diamond, held at (960, 770) in the lower middle third. It is lit and sharp; the rest of the lattice gets darker and softer with distance, not a vignette.
- **Cut:** the section cut opens on that diamond, showing tin skin over bronze.
- **Tags:** 「镀铬？」 and 「热镀锡 · 2025研究」 sit either side with thin leader lines. 「镀铬？」 is never struck through.
- **Hits:** all three kept (66.105, 67.237, 68.369).
- **Hush:** 70.1–74.412 runs continuously into `HandoffMacro`, and is smoother than before because the lattice no longer changes.

**Frame jumps:** every large one-frame jump I found in the hook, M1–M3 and the TakeD case dive is a planned hit or a subtitle change. The original code shows the same high motion differences in the fast glide, and the 20.821 ring match measures exactly as before.

**Edits outside the obvious files:**
- **`kfF53.tsx`:** besides `Blooms11` I changed `SP11`, which the hand-off also uses, so the blooms lie on exactly the surface the hand-off draws. I also removed the old bloom helpers there.
- **`take53.tsx`:** I changed only the sword code. That component is drawn for all of TakeA (0–20.8 s), not just the hook, so the museum orbit picks up the new sword too. `Museum` is untouched.

**Still wrong, in files that aren't mine** (fixes are described in the self-check):
- `scene53d.tsx`: the pommel mirror is painted over the hilt around 97–101 s.
- `scene53c.tsx`, `world53d.tsx` and kfF53's KF12: the sheathed and coffin swords still have box hilts (no hoops, no V-shaped guard); their blade outline already follows the new shape.
- `inscr53c.tsx` hard-codes the mark positions; they match the new ones, but it should import them.
- `kfE53.tsx` (KF08, key frame only) still draws its own upright marks.
- `take53` `Museum`: at 8 s the 「长55.6厘米 · 重875克」 tag sits on the mirror.

**Judgement calls:**
- The new inscription marks are 12.5 mm tall at 85 % ink. If the owner wants them quieter, lower `MARK_H` in `swordspec53s.tsx` or the mark opacity in `land53.tsx`.
- Seen from the blade side, the grip hoops read as thin rings. That's how a raised band looks along its axis, but they read better from the side.

Self-check (per-item status and every still and frame range checked): `tasks/ep53-sword/out/selfcheck.md`. All renders are under `/tmp/r53`, none in the repo.
