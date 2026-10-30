I've built the v3 storyboard and 33 key frames: one per leg, plus one per line in the 勾践 thread. All 33 render in the `KFV3` composition. I looked at every frame and fixed what was wrong; the renders are only in `/tmp/kf3`, nothing was committed, and the type check found no errors in the new files.

## The 勾践 thread (49.5–82.75 s), one continuous glide
After 「鸠浅，就是勾践」 the camera drops low over the polished face beside the inscription. It keeps gliding toward the tip at about 1.1 cm/s, with about 12 cm of blade across the frame. The bronze works as a mirror, and the story plays in it as a 皮影-style shadow play:
- **Figures:** one-tone near-black, faceless, with a warm firelight rim and a few cut-out slits.
- **Lattice:** the diamond lattice stays over the reflection at about 20 %, so it reads as a reflection and gives the scale.
- **Placement:** one scene per line, 4.2 cm apart along the blade, each sliding in as its line starts.
- **Period details:** chariots instead of riders (no cavalry in 494 BC), straight roofs without upturned eaves, no maps.
- **夫差's death:** shown only by a fallen cap and a dropped sword.

## Leg table (time · leg · status · picture)
| Time | Leg | Status | Picture |
|---|---|---|---|
| 0.00–1.50 | 1 H1 | KEPT (v2 0–1.58) | kitchen, rusting cleaver, bronze glint on the same line |
| 1.50–5.50 | 2 H1 | CHANGED | low skim along the blade; [亮] is a real specular highlight on the pale diamonds; the ridge is a gold crease, not a white stripe |
| 5.50–9.50 | 3 H2 | CHANGED | new sloped plinth (23°) with a low glass hood, all hood edges in frame, sword on two clear rests at 55 % of frame width |
| 9.50–11.75 | 4 TITLE | CHANGED | title etched on the hood: 越王勾践剑 above the sword, 真的没锈吗？ below it |
| 11.75–16.25 | 5 S1 | CHANGED | dark hall, faceless visitors at the rope, plinth lit in the middle |
| 16.25–20.75 | 6 S3 | CHANGED | v2 axis push, 「镀铬？」, plus the Cr tile with a "？" (never struck through) |
| 20.75–23.75 | 7 S4 | KEPT (v2 20.82–24.22) | the 11 pommel rings turn into the shaft's stepped rim |
| 23.75–28.00 | 8 D1 | CHANGED | snowy dig; depth tag starts at 0 |
| 28.00–32.00 | 9 D2 | CHANGED | descent at about twice v2's speed; depth reaches 10.8 m |
| 32.00–36.50 | 10 D3 | CHANGED | top-down open coffin: simple bone-cream skeleton at low contrast; black sheath on the occupant's left, pommel to the right |
| 36.50–49.50 | 11–12 D6, I0, I1 | KEPT (v2 43.46–56.48) | the draw, the inscription, 鸠浅＝勾践 |
| 49.50–54.00 | 13 G1 | NEW | 会稽山, the broken army climbing it, 戈 closing round its foot; the inscription still at the right |
| 54.00–58.25 | 13 G2 | NEW | envoy kneeling before 夫差 on a dais; 勾践 and his wife standing behind, heads bowed |
| 58.25–62.75 | 13 G3 | NEW | 伍子胥 walks away; the palace sinks into rippling water |
| 62.75–66.75 | 13 G4 | NEW | 勾践 on foot leading the horse of 夫差's chariot |
| 66.75–71.00 | 13 G5 | NEW | alone on his mat, tasting the hanging gall; low table with a 豆 |
| 71.00–74.25 | 13 G6 | NEW | push in on the same scene; 会稽山 and the spears faint behind him, like a memory |
| 74.25–78.75 | 13 G7 | NEW | 越 ranks advance; the palace goes under on [应验了]; fallen cap and sword |
| 78.75–82.75 | 13 G8 | NEW | the reflection clears to bright bronze near the tip, ready for the 90° roll into the paper test |
| 82.75–87.75 | 14 B1 | KEPT (v2 56.48–61.58) | 1977 paper test |
| 87.75–101.25 | 15 M1–M3 | CHANGED | element tiles: Cu and Pb (faint "≈ 0"), then Cr and Sn side by side; one lit pale diamond as the focal point, the rest darker |
| 101.25–107.75 | 16 T1–T2 | CHANGED | rust spots drawn on the surface in perspective, with find-rings; then specks next to a 1 mm scale bar |
| 107.75–112.00 | 17 T3 | CHANGED | rewind back to the coffin and skeleton |
| 112.00–120.25 | 18–19 E1, L1 | KEPT (v2 86.48–95.54) | the other swords; the layers named |
| 120.25–123.75 | 20 R2 | CHANGED | back on the plinth, slightly duller, one faint rust spot |
| 123.75–129.25 | 21 P1 | CHANGED | backing out; the kitchen appears reflected in the hood |
| 129.25–133.75 | 22 END | KEPT (v2 109.13–113.63) | end card |

Dive end to the open coffin now takes about 11 s, and the ending (R2 to the end of the film) is 13.5 s instead of 18.1 s.

## Files
- `episodes/53-goujian/storyboard_v3.md` — the full leg table with camera, hits, match moves and v2 ranges, a timing table for the eight 勾践 scenes, owner note → frame mapping, and build notes.
- `tasks/ep53-kf3/out/kf_list.md` — the 33 frames with their labels.
- Code in `episodes/37-qiqing/remotion/src/qq53/`:
  - `KF53V3.tsx` — registers `KFV3`, with the v3 lines, stamps, overlay and label band.
  - `kfG53.tsx` — the 勾践 thread.
  - `kfH53.tsx` — the frame list, the v2 pictures for KEPT legs, the element tiles.
  - `kfI53.tsx` — the plinth, hood, title and hall.
  - `kfJ53.tsx` — the coffin and skeleton.
  - `kfK53.tsx` — the specular highlight, rust spots and focal diamond.
- Render with: `ENTRY=qq53/KF53V3 CID=KFV3 SFPS=1 node scripts/frame_ms.mjs stills /tmp/kf3 0 … 32`

## Still open
- **Plinth:** it is my own stand-in, because `display53k.tsx` doesn't exist yet. Its cameras are named in the code so the real display can be swapped in.
- **v2 details still visible in some frames:**
  - The cleaver in leg 1 is the old v2 drawing; the more iconic cleaver comes from the other engineer's component.
  - The M1–M3 macro frames still show v2's white stripe underneath the new tiles and focal diamond.
- **Rough spots:**
  - In P1 the reflected cleaver doesn't yet line up exactly with the sword's edge line. That should be tuned once the real hood geometry exists.
  - The T3 rewind ghost is barely visible.
- **Stamp scrim:** the key-frame overlay adds a soft dark patch behind the stamp, which the bright frames need. The film's stamp would need the same.
- **Timing:** all times follow the draft lines and will move with the music re-cut.
