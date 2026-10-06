# Gate 4 notes: 鸡皮疙瘩在等什么 v3 spot re-check — verdict: REVISE (2 small items; then send to the owner without another full gate)

Scores (rubric 1–5, vs r1): script 4 (=) · visual 5 (↑) · info 5 (↑) · edit 4 (=) · motion 4 (=) · sound 4 (=)

Scope: only the spots changed since r1. Evidence comes from full-res frames pulled from /tmp/claude-0/chills/master.mp4 (21:43 render) at 0.9–1.45 (every frame), 2.9, 3.1, 27.7, 43.5, 45.5/45.6/45.7, 50.0, 52.5, 72.0, 74.7, 75.2, 78.5, 79.6–80.2, 99.5, 120.0–122.1, and 121.40–121.90 (every frame). The meter fill was measured at 10 fps over 68.5–80.5. Both delivery files were measured with ffprobe and ebur128.

## Verified fixed (r1 notes + reviewer v2)

| Spot | Result |
|---|---|
| Reviewer v2 MAJOR: meter overclaims in Demo 3 | **Fixed.** Hatched + "?" from 69.1 to 79.6. The strain stays at 67–74 % and never goes above the drop. The late drop lands at 74 % and rises into it rather than falling. It then decays to 44 % under "更爽，还是更烦？", the same decay as after the hook drop. The picture no longer answers the question. |
| 3.042: 01:21 flag | Fixed. Absent at 2.9, present at 3.1, on the hit. |
| 0–4: 蓄力 | Fixed. It sits left of the cart's path and stays clear through the climb. |
| 27.7: 越高 = 越紧张（示意） | Fixed. It is clear of the rail. |
| 42.5–45.6: Demo 2 strip | Fixed. The strip shows 铺垫·吸气·高潮, matching the hill, until the snip. At 45.6 the strip, the world (it drops to a dashed ghost) and the counter (1/4 → 2/4) all change on the same frame. |
| 48.6–53.4: ghost hill | Fixed. The dashed hill stays over the flat track, so the still alone reads "the build is missing". |
| 79.5–80.3: 预判 / 紧张 | Fixed. 预判 is gone by 79.9, and 紧张 lands alone at 80.2. |
| +4秒 | Fixed. The paper halo makes it readable at phone scale. |
| 97.7–101: Nagel sheet | Fixed. The cart is fully visible below the sheet. |
| Counter in the header row | Clean. It does not overlap the meter or the corner mark. The gap to "◆ Juno" is tight (~15 px) but clear. |
| 119.4–121.5: outro | Fixed. The freeze is gone: the world scrolls on, 兑现 and the bowl are pinned, and the strip runs out at the track's end. |
| 121.47: end card | Fixed. The cart darkens into a navy seed at 121.47 and the circle covers the frame by ~121.8. Title and question appear only after coverage. The gold coaster motif reads clean. |
| HD upload master | PASS by my measurement: 11.99 Mbps, −14.0 LUFS, −2.2 dBTP, 1920×1080, 125.6 s. |

## Notes

| # | Sev | Where | Note | Route to | Owner note it relates to |
|---|---|---|---|---|---|
| 1 | MINOR | 0:01.02 | **The hook hit is in the code but cannot be seen.** film.tsx:316 moves the cart −12 px sideways over 0.2 s. On a 1920 frame that is about 3 px on a phone, and the frame-to-frame change at 1.02–1.12 is no bigger than the normal drift (pixel diffs at 0.92–1.12 stay at 3.6–4.7 k px, all in the cart's box). The meter does not tick on the hit either: its fill edge creeps 133 → 135 → 137 px. Make it read on the 1.01 snare: a vertical bump of ≥ 30 px with a squash, eased out over ~0.25 s, and a meter step of ≥ 5 % on the same frame. Optionally stamp 蓄力 ↗ in on that frame. Re-render chunk 0 only. | animator | "开头的冲击力度有点弱" (something happens on the music inside the first second) |
| 2 | MAJOR (delivery) | /tmp/claude-0/chills/out/鸡皮疙瘩在等什么.mp4 | **The ≤ 28 MB chat file clips: true peak 0.0 dBTP at −14.8 LUFS.** Size (26.5 MB) and picture (1.55 Mbps, PSNR 42 dB vs the master; the riso halftone holds at the shaking late drop) are fine. Re-encode only the audio. Take it from the HD master's already-normalised track (−14.0 LUFS, −2.2 dBTP), or apply loudnorm with I −14, TP −2, linear, before AAC 128k. Check ≤ −1.5 dBTP on the encoded file. | editor | Douyin delivery row (≤ 28 MB, −14 LUFS); brief "music that clips" |

After both: no director gate is needed. The producer confirms three things on the new files:
- (a) The frame diff at 1.02–1.25 shows a clear spike in the cart's box, and the meter steps.
- (b) The small file measures ≤ −1.5 dBTP, about −14 LUFS and ≤ 28 MB.
- (c) The HD master is rebuilt from the new render with upload_master.py PASS.

Then send it to the owner. The BGM name line still waits for the owner.

What must not change (it works): everything in r1's list, plus:
- The Demo 3 meter: hatch + "?" from 68.84, strain capped at ~70 %, the drop rising into 74 %.
- The Demo 2 snip, with strip, world and counter on one frame, and the ghost hill.
- The 预判 → 紧张 hand-off.
- The +4秒 halo.
- The shorter Nagel sheet.
- The counter in the header row.
- The outro ride-on with pinned lamps.
- The end card growing from the cart, with content after coverage.
