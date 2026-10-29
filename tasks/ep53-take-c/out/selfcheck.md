# ep53 TakeC (legs 8–12, 33.274 → 75.162 s) — self-check

Status: all five legs built, in order, in the files below. The whole range renders (a 0.35-scale test render of 33.274 → 75.2 s, 1258 frames, ran without errors). Nothing was committed by me.

## Files (all in `episodes/37-qiqing/remotion/src/qq53/`)
- `take53c.tsx` — TakeC: routes time to the scenes below; HandoffMacro from 74.412.
- `cam53c.ts` — the camera (33.274 → 56.482) and the sword's motion (lift, draw), pure functions of t.
- `shaft53c.tsx` — TakeB's shaft code copied (tomb53.tsx 21–45, 77, 124–188) with the camera passed in, so the first frame is TakeB's last frame.
- `scene53c.tsx` — legs 8–10: chamber, lids, diggers, sword in sheath, wash, draw, inscription (Chamber53).
- `parts53c.tsx` — OpenCoffin / Digger / Glove copied from kfD53 / kfE53 (reach clamped instead of thrown).
- `inscr53c.tsx` — the eight marks (lit per half-bar), the 1966 letters + count per beat, 鸠浅 ＝ 勾践, the water.
- `paper53c.tsx` — leg 11, the 1977 paper test.
- `macro53c.tsx` — leg 12, M1/M2/M3 and the hush (Leg12).

## Legs and hits (film seconds; every hit complete ON its frame via frameOf)
- **8 · D2 tail, D3 (33.274–36.104)**: TakeB's camera continues (position, pitch, lens and velocity equal at 33.274; frame-diff at 33.30 TakeB vs TakeC = 0.03 mean grey level). It keeps sinking, the walls stream; depth tag (master) counts on.
- **9 · D4/D5 (36.104–43.463)**: the camera hovers 1.6 m over the 椁 roof (3.2 × 2.3 m planks, the diggers' lamps on them); the eight planks are hoisted away past the lens in sequence from 36.104 (a 1-frame shading step at the swap from TakeB's roof to the planks, mean grey diff 4); the outer lid is lifted by two diggers on DA(16) 36.670 (tag ①) and leaned on the wall; the inner lid on 37.803 (tag ②). The camera tips over the open inner coffin and is straight above it on 38.935 (DA 17). Sword (55.6 cm) in a black lacquer sheath at the occupant's left (a faint dashed outline only). Gloved hands lift the sheath 41.199; water rinses it and the soil washes off; draw 42.85 → 44.9, the beat 43.463 shows KF07's picture (17 cm of blade out, cold flash running down it).
- **10 · D6, I0, I1 (43.463–56.482)**: the camera rides the draw (K 27 → 76 px/cm), then glides guard → tip at 0.8 cm/s over the blade. Marks light per half-bar from 47.991 (越王 / 鸠浅 / 自作 / 用剑), 鸠浅 stays lit from 51.954; letters fly in the polish from 52.520 with the count per beat 10 → 20 → 30 → 40 → 「40多封信」 (54.784); 「鸠浅 ＝ 勾践」 lands on DA(24) 54.784 (KF08).
- **11 · B1 (56.15–61.577)**: the same blade, in the same place, takes over from the 2-D one under 0.33 s (a match); the camera swings out to a 3/4 view; film light clicks on DA(25) 57.048; clapper snaps 58.180; the blade goes through the stack and the slice completes on DA(26) 59.312 (23 of 32 sheets cut); tags 「划破20多张」/「共30多张」 from 59.512; the camera comes back to face the blade's flat.
- **12 · M1–M3 (61.577–75.162)**: face-on over the flat, then it tips down and turns to look along the blade (the "turns from the edge to the flat" move); 「原因之一：料好」 + 铜 · 锡 约18–20% · 铅 ≈ 0 land on DA(28) 63.841, leave by 65.95; 「镀铬？」 returns on 66.105 (never struck); the section cut opens on 67.237 (KF10: tin skin only under the pale diamond); 「热镀锡 · 2025研究」 lands beside it on DA(30) 68.369; the cut and tags fade 70.2–71; M3: the camera eases back to KF11's picture and arrives at 74.0; from 74.412 the picture is `<HandoffMacro />` (frames 74.35 / 74.40 pixel-identical; 74.40 vs 74.45 differ only in the subtitle that ends at 74.412).

## Checks done
- Stills at every key-frame time and every 1.5 s (contact sheets), one frame either side of the leg joins (33.274, 56.15–56.48, 61.25–61.577, 74.412).
- Camera speed (≤ 25 px/frame): measured on world points per frame — plan view over the sword 22, paper test 23, macro 24; chamber floor 27 at the tip-over (38.1–38.6, 4 frames over 25). Known exception: the near rim of the inner coffin reaches ~50 px/frame at 37.6–38.6 (the camera dips close over the coffin; the subject points are fine).
- Frame-0 continuity: TakeB 33.3 vs TakeC 33.3 pixel diff 0.03 (mean).
- 「镀铬？」 is never struck or crossed out; no 谣言/假的/没有铬 anywhere. Only ✓ facts on screen (A6/A7/A8/A9/A10, B7/B9, C1/C2/C4, the museum's 7年多/热镀锡 line).

## Changes to the plan / things to know
1. **Depth tag vs picture.** The camera follows the 1.2 m/s depth until about 8.3 m (just above the roof, 36.1 s); it then slows, goes through the opened roof and tips over the coffin. The tag keeps counting to 10.8 at 37.746 = the chamber floor (the room with the open coffin is on screen from 36.5; the camera ends 1.2 m above the sword plane). KF06's own camera (4.5 m back and above) is not physically possible in a 3 m shaft, so the KF06 composition is approximated with a wide lens (f 700) from inside the shaft footprint.
2. **Chamber scale**: coffins drawn 0.8 × KF06 (outer 2.1 × 0.84 m, inner 1.8 × 0.6 m) so two diggers fit inside the 3.2 × 2.3 m roof opening seen in TakeB's picture. The sword is 55.6 cm on that scale.
3. **Storyboard leg 11/12 join**: the storyboard's 'roll 90° to look along the edge' is built as: the blade stays face-on in the picture, the world behind it changes (tomb dark → film set, lit at 57.048); leg 12 then starts face-on above the flat and tips to the grazing macro. Leg 11 hands over to leg 12 with a 0.33 s cross-fade of near-identical face-on blade pictures (two different renderers of the same lattice) — the only blend in the range.
4. KF09's stack is shifted along the blade (centre at x = −14 cm) so the camera needs less travel; the tip pokes out of the stack's end face on the screen's left (the tip stays on the left as in KF07/08; KF09 mirrored).
5. M3 uses la 40 → 15 and z 10.5 → 14 (a gentle pull-back) to land on KF11's picture; the hush is not dimmed further (kept the picture identical to HandoffMacro).

## Not done / weak spots
- The inner-lid lift (37.8–38.9) happens at the top edge of the frame (the camera is above it), so it reads mostly through the diggers' hands and tag ②.
- Water is a thin stream + ripples (no vessel drawn except a small dark lip at the top edge).
- The 1966 letters are faint (42 % opacity in the polish) as in KF08.

## Process note
Leg 12 was meant to go to a helper agent; the agent calls failed at launch (API error), so I built it myself (macro53c.tsx). Everything else was built in the order of the legs, then polished.
