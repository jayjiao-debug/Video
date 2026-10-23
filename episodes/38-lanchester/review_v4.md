# Review: 为什么要"集中优势兵力" v6 (review round 4) — verdict: FIX FIRST (one MAJOR)

There is no BLOCKER and one MAJOR remains. All four v5 MAJORs are fixed or now MINOR:
- The smoke bank is a smooth fog.
- The ★4 crane no longer opens on a red plane.
- DROP 2 is now the strongest image in the film (121.0).
- The peel bars read as two equal gold bars with = between them.

The remaining MAJOR is the front-view aim close-up at 1:05–1:11. The low fly-in now shows the blue men's hands large, and they are open, spread-finger claws that float near the musket instead of holding it. Owner rows 9, 74 and 77 are exactly about this. Fix that and v7 can be called final. The other items are polish.

Master checked: `ep38out/集中优势兵力_v6.mp4`, 1920x1080, 30 fps, 176.3 s, 14.2 Mbps, 319.8 MB.
- 0 black frames, 0 single-frame glitches. The v5 glitch at 123.8 is gone.
- 5 hard cuts: 30.07 (title slam), 110.7 (sky to sky, invisible), and 120.07, 127.57, 135.07 (climax beat cuts). The v5 cuts at 4.9, 103.2 and 150.07 are gone.
- Frozen 165.83–176.27 (end card).
- −12.57 LUFS, TP −0.31 dBTP: the untouched Rynos Theme, reported only (owner row 64).

pace.py: 0 too fast; 1 minor wait (⑦ +1.3 s); waiting 1 %. facts.py: no problems. Brand: no "Juno 出品". lines.json matches the 25 `sub()` calls (the Lanchester sentence is a `tag`, not a subtitle). Title ink centre is 966.5 px; my gold mask includes the closing quote mark, and 6.5 px is not visible.
Evidence frames were pulled at full resolution into the scratchpad and deleted afterwards (disk). Re-pull any of them with `frames.py <master> --at <t>`.

| # | Sev | Time | What's wrong | Evidence | Suggested fix |
|---|-----|------|--------------|----------|---------------|
| 1 | MAJOR | 1:05–1:11 | **The front-view aim pose has floating claw hands.** This is the closest look at soldiers in the film (the low fly-in, under ⑨ 他的子弹，要分给两倍的人 and the 两人才挨 1 枪 tag). Seen from the front, the blue men's support hands are open with spread fingers, raised in front of the chest above the barrel, not around the fore-stock. The trigger hand is also open beside the face. At 1:1 (69.0, centre man) the left hand floats about 35 px above the barrel. Several men in 67.34 show the same. It reads as reaching or "hands up", not aiming. The rear view (1.0) and the red line at mid distance (65.5) are fine. | Frames 67.34 and 69.0 (crops 900×560 and 1:1 600×500) | Give the aim pose closed grip hands: curl the finger bones to a fist or grip. Snap the left palm onto the fore-stock about 0.45 m ahead of the lock and the right hand onto the wrist of the stock, using the same two-bone solve as the musket. Re-check 65–71 at 1:1. If there is no time, keep this shot's camera behind or at the side of the blue line, or hold it 2× farther away so the hands stay under about 10 px. |
| 2 | MINOR (borderline) | 1:43.17, 2:30.05, 2:41.27 | **Three hand-overs swap the whole scene in one frame while the camera holds.** The cameras now match, but the content pops: (a) at 103.17 the big 707, its label and all the field smoke vanish, after 4 held frames; (b) at 150.05 both labels vanish and the X formation becomes a single 12-ship line; (c) at 161.27 the two smoke-lined firing lines become six small blocks. Measured mean frame-to-frame change: 6.8 / 5.5 / 3.6 in that one frame, against about 0.1 around it. Each lands on a downbeat (bars 55, 80, 86), so it reads as a beat cut rather than a glitch. But the owner asked for camera-carried hand-overs, with labels leaving before the move (rows 33, 86). | Frames 103.15 / 103.17, 150.03 / 150.07, 161.2 / 161.27; frame-diff measurement | Fade the labels out over 0.3 s ending on the bar. Cross-dissolve the outgoing scene over 8–12 frames on the bar, or thin the smoke out over half a bar first. At 150, let the X sail apart (or dissolve) as the camera starts to move. |
| 3 | MINOR | 1:23–1:27 | **The peel is clear now (84.0: two gold bars of the same size with =), with small residue:** (a) the labels 红方掉的 / 蓝方掉的 appear on peel 1 only, at about 40 px; (b) the left bar overlaps red's ghost square; (c) during peel 2 the strips fly across the blue square for about 0.3 s (85.5); (d) dark, striped smudges show on the blue slab (80.5, 84.0, 86.3) where grass or shadow comes through it with stripe aliasing. | Frames 84.0 (crop), 85.5 (crop), 85.85, 86.85, 80.5 | Put the labels on every peel at ≥ 48 px. Shift the pair 2–3 m right, clear of red's ghost. Route peel 2's strips around the square, not over it. Raise the slab a few cm above the grass, or hide grass under the squares. |
| 4 | MINOR | 0:01.9, 0:45, 1:05 | Muzzle flashes are smaller but still read as round soft glow balls (about 100–150 px at full resolution), not cones at the muzzle. | Frames 1.95, 45.0, 65.5 (crop) | Short, elongated orange-white cones (2–3 frames) at the muzzle. |
| 5 | MINOR | 2:37.9–2:45 | Carried over. The limit is still two tidy smoke lines (161.2). The ending's blocks start tiny and far away (161.3), and at 164.5 blue and red are hard to tell apart in the dusk light. | Frames 161.2, 161.5, 163.0, 164.5 | Break the limit lines (gaps, a late company). Bring the camera lower and closer for 比他多, and tint red more strongly. |
| 6 | MINOR | 2:45–2:56; whole film | Carried over. The end card is frozen for 10.4 s, and there are 25 subtitles against the owner's ep38 aim of about 20 (row 111). | Frame 170; lines.json | Give the end card a slow background drift. ⑤ → 这是[冷兵器]的算法; ⑬ → 两边掉的面积[一样多]. |

**For the v7 check (excluded here as instructed):** the flat grey "lens smoke" discs run past 2:05. I saw them at 121.5, 122.0, 123.0, 124.0, 125.0, 127.37 and 127.5, so up to the 2:07.57 cut. Make sure the v7 fix covers 2:01–2:07.6, including the two discs flanking the lone ship in the overhead at 2:07.4.

## Fixed since v5
- **#1 smoke bank: fixed.** 157.0–157.9 is a smooth full-frame fog. Luminance ramps 195 → 200 with no single-frame jump, and no discs are visible. ㉓ fades in at 158.2, after the bank has cleared.
- **#2 ★4 crane: fixed.** There is no red plane. The field is low at 103.25 and high at 103.5; the squares fade in at 103.9, then slide (104.3, 104.8). The one-frame label pop is in #2.
- **#3 DROP 2: fixed.**
  - 120.1–121.0: the camera rides low behind the lead ship between two hulls, and flame jets ripple out of both sides.
  - 127.6–127.8: Nelson's column breaks through the same way.
  - 129.4–130.0, bar 69: flashes and grey-brown smoke on the ships in the crane-up.
  - Owner row 88 is met: 121.0 is now the strongest frame of the film.
- **#4 peel: now MINOR** (#3 above).
- **#5 Lanchester tag: fixed.** 140.0 reads 兰彻斯特在 1916 年的书里，用平方律分析过纳尔逊的打法, which matches facts L9.
- **#6 aim pose:** the rear view and mid distance are fine. The front close-up is now the MAJOR (#1); the lower camera made it visible.
- **#7** chart → quiet and limit → ending now start from the previous camera, but the content still swaps (#2). The limit lines are unchanged (#5 above).
- **#8 flashes:** smaller, and the 4.9 probe cut is gone (#4 above).
- **#9:** the 前队：先不理它 label now sits over the van (116.5). The end card is unchanged (#6 above).
- **Hook:** red reads 500 through ① (0.5–1.85). The volley lands at 1.9 (458 at 1.95), and 你猜：剩 500 is struck through on the 866 slam (15.3).

## What works (keep)
- The hook does what the owner asked (rows 22, 47): your guess is on screen, blue is hidden, and 866 overturns it, struck through.
- The ◀◀ rewind device, used three times.
- ★4 and the 1000 v 1000 → 0 : 7 → ◀◀ → 707 sequence; the crane into the halved squares is now clean.
- The DROP 2 downbeat (120.1–121.0) and the sunset line of British ships (155).
- The numbers are honest (866, 500, 707, 0 : 7 straight from the sim), and the subtitles run at reading pace.

## Not checked / can't judge
- The music's taste; any send version of v6.
- Whether the enemy hulls visibly heel.
- The march/carry and charge poses close up (they never appear close).
- Frames were sampled every 5 s, at subtitle midpoints, on both sides of every cut, plus about 95 targeted full-resolution frames and frame-difference scans at four hand-overs. A short fault between samples could be missed. Not checked on a phone.
