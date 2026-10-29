TakeC (legs 8–12, 33.274 → 75.162 s) is built, and the whole range renders. I checked this with a low-scale test render of 1258 frames (33.274 → 75.2 s) with no errors, and `tsc` is clean for `qq53`. I committed nothing, and no images or video are in the repo (renders are in `/tmp/r53`).

I took every approved key-frame composition and plan point as the target. Where I changed the plan, it is noted below and in the selfcheck.

## What each leg does
- **8 · D2 tail, D3 (33.274–36.104).** The camera continues `tombCam` exactly, so the first frame matches TakeB. The pixel diff at the same time (33.3) between TakeB and TakeC is 0.03 mean grey level.
- **9 · D4/D5 (36.104–43.463).**
  - The 椁 roof planks are hoisted past the lens from 36.104. Two diggers lift the outer lid on 36.670 (tag ①) and the inner lid on 37.803 (tag ②).
  - The camera is straight over the open inner coffin on 38.935. The sword lies in its black sheath left of a faint skeleton outline.
  - Gloved hands lift the sheath at 41.199 and water rinses the soil off. The draw begins at 42.85, and 43.463 matches KF07.
- **10 · D6/I0/I1 (to 56.482).**
  - The camera rides the draw, then glides guard to tip.
  - The marks are lit per half-bar from 47.991.
  - The 1966 letters fly in with the count per beat, from 10封信 to 「40多封信」.
  - 「鸠浅 ＝ 勾践」 lands on 54.784 (KF08).
- **11 · B1 (56.15–61.577).**
  - The film light clicks on at 57.048 and the clapper snaps at 58.180.
  - The blade goes through the stack and the cut completes on 59.312, with 「划破20多张」/「共30多张」 tags.
  - The camera then comes back face-on to the blade.
- **12 · M1–M3 (61.577–75.162).**
  - The camera starts face-on over the flat and tips down into the grazing macro.
  - 「原因之一：料好」 lands on 63.841 and leaves before M2. 「镀铬？」 returns on 66.105 and is never struck.
  - The section cut opens on 67.237 and 「热镀锡 · 2025研究」 lands beside the question on 68.369 (KF10).
  - The cut and tags fade out. The camera eases to KF11's picture and arrives at 74.0.
  - From 74.412 the picture is `<HandoffMacro />`. Frames 74.35 and 74.40 are pixel-identical, and 74.40 differs from 74.45 only in the ending subtitle.

## Plan changes
- **Depth tag.** The camera follows the 1.2 m/s depth until about 8.3 m, which is just above the roof (36.1 s). It then goes through the opened roof and tips over the coffin.
  - The tag still reaches 10.8 at 37.746, as the chamber floor with the open coffin is on screen.
  - KF06's own camera is not physically possible inside the shaft, so I approximated it with a wide lens.
- **Coffin size.** The coffins are 0.8× the KF06 size so two diggers fit inside the roof opening shown in TakeB.
- **Stack.** The KF09 stack is moved along the blade to cut the camera travel, and mirrored so the tip stays on the left.
- **Leg 11 → 12 join.** The only blend in the range is a 0.33 s cross-fade where two renderers draw the same face-on blade. The leg 10 → 11 join is a similar 0.33 s match. Both are described in the selfcheck.

## Known weak spots
- **Camera speed.** The 25 px/frame limit is met for the sword plan view, the paper test and the macro, and is exceeded by up to 2 px on 4 frames of the chamber tip-over (38.1–38.6). The near rim of the inner coffin reaches about 50 px/frame at 37.6–38.6.
- **Roof swap at 36.14.** There is a one-frame shading step when TakeB's roof is replaced by the planks. The mean grey difference is about 4, against about 2 for a normal frame.
- **Lid lift.** The inner-lid lift (37.8–38.9) happens at the top edge of the frame, so it mostly reads through the diggers' hands and tag ②.
- **Water and letters.** The water is a thin stream with ripples. The 1966 letters are faint, as in KF08.

My helper-agent calls failed at launch, so I built leg 12 myself.

## Files
In `episodes/37-qiqing/remotion/src/qq53/`:
- `take53c.tsx`
- `cam53c.ts`
- `shaft53c.tsx`
- `scene53c.tsx`
- `parts53c.tsx`
- `inscr53c.tsx`
- `paper53c.tsx`
- `macro53c.tsx`

Self-check with the hit table: `tasks/ep53-take-c/out/selfcheck.md`.
