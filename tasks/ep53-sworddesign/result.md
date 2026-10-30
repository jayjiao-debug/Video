I researched the real sword from 30+ museum photos and drew three accurate design options (A, B, C) as one shared spec with three looks, plus a comparison frame against the current sword. All 4 frames render without errors and the new files pass the type check. I didn't commit anything, and no photos are in the repo; they stayed in `/tmp/ref`.

## What our current sword gets wrong (worst first)
1. **The hilt and guard should be near-black, not gold.** On the real sword the guard, grip and pommel are dark greenish-black bronze. Only the blade is light.
2. **The guard is the wrong shape and colour.** The real guard is a dark block. Its blade-side edge rises to a point on the centre ridge, toward the tip; ours dips the other way. Its grip-side corners droop toward the pommel. Its face is a beast mask of rounded raised scrolls with small blue glass spots: a round "eye" and a comma shape on each side. Ours is one big bright-blue panel.
3. **The diamond pattern is different.** Real: square diamonds about 12 mm across, about 3 across the blade, the same size all the way to the tip. Each pale diamond sits inside a thin pale frame, with a **dark 8-point star at every point where the lines cross**. Ours: stretched diamonds (1.7 : 1) in a two-tone checkerboard.
4. **The inscription should be pale and spread out.** The eight characters are light-coloured, about 11 mm tall and about 22 mm apart, spanning about 10 cm and starting about 3 cm from the guard. Ours are small, dark and squeezed into the first 7 cm.
5. **The blade outline is off.** Real: widest right at the guard, tapering steadily, narrowing slightly in the front third, then a long gradual point. Ours: widest a third of the way along, with a wavy waist and a short sharp point.
6. **Smaller differences:**
   - The real blade is olive brass-grey in neutral light (sources describe it as "yellow-black"). It only looks gold under warm display lights, and it is darker and blotchy near the guard.
   - The plain edge strips are wider (about 4.5 mm).
   - The pommel is a thin outturned dish about 2.8 times the grip's width (ours is 2.2 times).
   - The two rings on the grip are low and thin, not raised bands.

## The three options
All three share exactly the same geometry and details; only colours and contrast change.
- **A, museum-faithful:** the sword as the photos show it. Olive-grey blade, charcoal pattern, faded and blotchy around the inscription, black hilt, matte blue spots. The most truthful, but low-contrast and murky at small sizes.
- **B, clean hero:** brighter and warmer blade, bolder pattern and stars, white characters with a dark outline, a light rim along the edge. Each frame has a preview with the sword at 30% of the frame width, and B's pattern and silhouette still read there.
- **C, my pick, "textbook gold":** the warm gold people remember from the textbook photo and the spot-lit display case, with a near-black star pattern, a black hilt with a clearly ringed pommel, vivid blue glass, and white characters on a slightly darker zone near the guard. It keeps the real structure, so it fixes everything the owner noticed.

## Caveats
- **Measurements are approximate (about ±10%).** The Hubei Museum website loads its collection pages with JavaScript, so I couldn't reach its official pages or photos. The look comes from high-resolution gallery photos of the real sword on Wikimedia Commons. The published dimensions come from a 澎湃 excerpt of the book 《国家宝藏》 and the museum's own label. The excavation report with the measured drawing isn't online.
- **The characters are my own simplified traces by eye** from the photos. I didn't copy the existing vector tracing on Commons because its CC BY-SA licence would carry over to this public repo. They should be checked against a published rubbing before any close-up shots.
- **I didn't draw the sheath.** No photo shows it; sources only say it was black lacquered wood.
- **Switching the film to the new spec needs a little porting.** The new spec can replace `swordspec53s.tsx`, but the 3-D, landing and macro renderers (`sword3d`, `land53`, `macro53`) still use the old pattern and guard data.

## Files
In `episodes/37-qiqing/remotion/src/qq53/`:
- `sworddesign53x.tsx`: the `SWORDDESIGN` composition. Frames 0, 1, 2 are options A, B, C; frame 3 is the comparison with the current sword.
- `swordspec53x.tsx`: the one shared geometry plus the three looks.
- `swordflat53x.tsx`: draws the sword and the pommel face.

In `tasks/ep53-sworddesign/out/`:
- `reference_notes.md`: sources with URLs, what each photo shows, the measured proportions, and the ranked differences.

To render the frames: `ENTRY=qq53/sworddesign53x CID=SWORDDESIGN SFPS=1 BUNDLE_DIR=$(mktemp -d) REMOTION_BROWSER=<headless shell> node scripts/frame_ms.mjs stills /tmp/sd 0 1 2 3`
