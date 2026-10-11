# Gate 4 notes r1: 为什么一比，就觉得穷？ v3 · 满意度热像, full cut (master_v3.mp4, 129.97 s) — verdict: REVISE

**One more render is worth it.** The film now has a real look, object-carried transitions, cuts on bar lines, the title on the groove (16.58) and a hard drop at 81.375. The owner won't send it back for 转场 or 卡点. He would send it back for two things: the street (97.6–105.7), which is still the flat clip-art he called "very cheap looking", and the move-then-freeze camera. Every bar the camera moves, then stops dead for 1.5–3 s. The ending (110.5–117.4) is almost a still for 7 s. That is the "static slides" he named in v2. Both fixes are inside the animator's code, with no new design and no change to script or music, so one ~25-min farm run covers all render notes. No video-reviewer REVIEW.md was given to me, so I ran my own checks.

How I checked: 260 frames at 2 fps (contact sheets in `scratchpad/g4d/sheet_01–09.jpg`). fps-10 windows at 16.3, 20.0, 48.4, 72.7, 79.3–83, 97.0, 105.0 and 117.5 (`w_*.jpg`). Full-res stills at 5, 13, 14.5, 25.5, 39, 48, 51, 70, 83, 90, 96.5, 100, 103.5, 114, 122 and 127 (`F_*.jpg`). Frame-difference and luma per 0.5 s (240×135 grey). EBU R128 on the master, the song and the mix. SFX vs music level at all 11 events.

Scores (rubric 1–5): script 4 · visual 4 (street 2) · info 4 · edit 4 · motion 3 · sound 4 · **overall 3** (would post after the notes below)

| Area | Gate 3 (stills) → now | Evidence |
|---|---|---|
| Script | — / 4 | Approved lines, read at pace, and every line is now acted on screen except "用小石子换黄瓜" (note 5). The end card question invites comments. |
| Visual | 3 → **4** | Hook, title, drop and payoff are strong stills: 13.0 two phones with the legend swap, 17.5 plaque fits, 83 ice crowd under the white line with 满意度▼, 122 white-hot +¥4000. The monkey eye-hole and bars are gone (39). Still 2-level: the street (100, 103.5) is pentagon boxes with two windows, flat in depth. Your house's roof vanishes into the ambient, so the ring circles a roofless box. |
| Info | 3 → **4** | 95→60→20 % (with "21 %" counting at 41), 48 %, 85 % counting 0→85 on b33, and the towers side by side at 54 (fixed). The drop passes the 5-second test. Losses: clipped and overlapping labels (note 4), and no readable cucumber (note 5). |
| Editing | 4 → **4** | Cuts and moves land on bars (motion spikes at 4.43, 8.48, 10.51, 12.53, 16.58, 24.68, 28.73, 32.78, 36.83, 40.88, 44.93, 53.0, 57.1, 61.1, 81.4). Transitions are carried by objects: plaque → steam → lab, grape bloom → coin (48.4–49.6, clean), coin edges → pay rows (72.7–73.9, clean), rows → crowd, door, window → room. One fault: the door pass goes through a body (note 3). The end card's 0.5-s dissolve is fine. |
| Motion | n/a → **3** | The moves are eased and on the beat, but each one is followed by a dead hold. Frame difference was < 1/255 (no drift at all) at 22–24, 30–32.5, 38.5, 50.5–52.5, 54–56.5, 59–60.5, 63–64.5, 108.5, 110.5–113.5, 114.5–117 and 119.5–121.5. That is a slideshow rhythm in 3D. |
| Sound | plan 4 → **4** | The song is untouched (master −9.9 LUFS = the song's −9.9; the mix adds 0 dB). Five ignites sit 15–20 dB under the music RMS, five whooshes ~24 dB under (likely inaudible on a phone, which fits the owner's "few, quiet" rows), and one frost impact ~10 dB under, on 81.375. No whoosh masks the drop and there are no per-house ignites in the street. No change needed. |

## Gate-3 notes: what landed
- Closed:
  - 1 title fits the plaque.
  - 2 monkey eye-hole and bars gone, grape whole at 48, cucumber throw visible at 37.5–38.
  - 5 end HUD clean at 122; placards on 114–117.
  - 6 no claw hand.
  - 9 steam visible at 19.5–20.5, flat field at 105 is ≤ 0.6 s, 64+ px day counter at 4.5–8.
  - 10 你 ring under the line and ice.
- Partly closed:
  - 3: grape yes, stone/cucumber no.
  - 7: towers side by side yes; the B tower at 70 still leans out of the top edge into the corner mark.
  - 8: "你的假期/别人的" labels added, but the tiles still read as coins. Accepted, because the labels carry it.
- Not done: 4 (street).

## Notes (ranked; 1–7 are one render, 8 is delivery only)

| # | Sev | Where | Note (problem → fix) | Route to | Owner note it relates to |
|---|---|---|---|---|---|
| 1 | High | 97.6–105.7 street (F_100, F_103.5) | **The street is still the v2 clip-art.** Problems: flat pentagon boxes with two square windows in one row, no depth, no foreground. Your house loses its roof (it drops to ambient), so at 103.5 the gold ring circles a magenta box. "你家 · 收入不变" floats at y≈290 and is gone after 102. Fix (geometry only, same thermal pipeline): (a) give each house real depth (≥ 0.6× its width) with a roof overhang, a door and a chimney; heat shimmer over the hot chimneys only. (b) Add a row of fence posts or trees in the foreground, nearer the lens, so the dolly has parallax (one direction, left→right as now). (c) Keep your house's roof and walls one band above ambient the whole time: it is *colder*, not gone. (d) Pin "你家 · 收入不变" 44 px above the ring from 97.6 to 105.67, and let the neighbours' windows heat one per beat as planned. | animator | ep21 v2 "very cheap looking… simple houses"; ep13 "太low" |
| 2 | High | Every bar hold, worst 110.5–117.4 and 119.5–121.5; also 22–24.5, 26–28.5, 30–32.5, 38–40.5, 42–44.5, 50.5–52.5, 54–56.5, 59–60.5, 63–64.5 | **The camera freezes after every move.** "A hold is just two identical keys", so the frame stops dead for 1.5–3 s each bar. Over 2 minutes that reads as slides. Fix: (a) replace every hold with a slow drift that continues the previous move's direction, a 2–3 % push or ≤ 1° orbit across the hold, eased into the next key, so no 0.5-s window is ever static (only the end card ≥ 126 may be). (b) 109.7–113.8: a slow push toward the roommate's phone and grape. (c) 113.8–117.8: a slow dolly back between the two placards, each placard scaling 0.92→1 on its beat (emphasis on the thing that appears, never the whole frame). (d) 119.5–121.9: a slow push on your white phone. | animator | ep21 v2 "no 运镜… static slides"; ep11/12 "不像是SLIDESHOW"; rubric motion 5 |
| 3 | Med-High | 96.6–97.5 door (w_97.0) | **The camera flies through a walker's body:** the frame fills with a translucent blue torso showing its inner contours before the street. This is 穿模. Fix: offset the camera path ≥ 1 body-width to the side of the walkers and enter the door beside them, or let the lead walker step through first and the camera follow into the white light. Check with a bounding-volume test per frame. | animator | ep14 "注意不要穿模"; ep15 "make sure no 穿模" |
| 4 | Med | 12.5–16.4; 69.5–71; 81.5–85.4; 89.5–93.5; 117.4–117.8 | **Text clipped at frame edges or drawn over other text.** (a) 13.5–16.4 (F_14.5): the roommate's phone slides under the legend, and "室 / ¥6" glyphs collide with "满意度 / 越开心越热". (b) 69.5–71 (F_70): B's tower leans out of the top edge through the corner mark. (c) 81.5–85.4 (F_83): the wall header "加州大学 · 员工工资 · 全部可查" is cut by the top edge. (d) 89.5–93.5 (F_90): "找新工作" is cut at the right edge. (e) 117.4–117.8: the legend fades in over the "+¥4,000" placard. Fix: clamp every projected label inside a 96-px safe box. Frame or move the roommate's phone so it stays outside the legend box (x < 1500), or let it leave frame by 13.5. Keep B's tower upright and below the corner mark. Fade the placards fully out before the legend's first frame (117.85). | animator | rubric visual 1 "text over text"; ep14 v6 "must clear what's below" |
| 5 | Med | 24.7–28.7 exchange (F_25.5) | **"用小石子换黄瓜" is still not shown.** The hand holds a yellow nub, and the "cucumbers" are 60-px half-domes on the shelf. The stone is a small blue disc on the floor. Fix: a cool grey-blue pebble ≥ 80 px in A's hand on beat 1. Then a long, bumpy, lukewarm cucumber ≥ 140 px (clearly elongated, one band cooler than the body) handed in on beats 2–3, held in front of the face on beat 4. Same timing as the storyboard. | animator | ep14 "act the line out"; rubric info 1 |
| 6 | Low-Med | 20.0–20.35 steam dive (w_20.0) | A dark-violet window slab with stair-stepped, aliased edges sits top-right in the haze for ~10 frames. It is the only "broken render" look in the film. Fix: fade the window out of the haze before 19.9, or take its edge from the full-res depth instead of the 1/16 buffer. | animator | ep9 "没有render好" |
| 7 | Low | 0.0–4.4 hook | **Nothing happens on the music in the first second.** The frame drifts < 3/255 per 0.5 s for 4 s. Fix, without changing the shot: on the first downbeat (0.383) the 到账 banner drops onto the phone and ¥4000 counts 0→4000 by 1.4, with the phone flaring one band whiter, plus one ignite at −12 dB. Keep frame 0 as it is (phone hot, subtitle on). | animator, editor | ep11 v3 "开头的冲击力度有点弱" (something happens on the music inside the first second) |
| 8 | Delivery (no render) | the file | master_v3 is 171 MB at 10.5 Mbps, so the chat can't send it. Deliver one file ≤ 28 MB: 2-pass ~1.55 Mbps H.264 1080p30 + 128 kbps AAC. Keep the audio at the song's own level (−9.9 LUFS, no loudnorm or limiting: owner row "1 coherent untouched BGM", which supersedes upload_master's −14 LUFS). The +1.4 dBTP after AAC is the song's own 0 dBFS peaks; leave it. | producer | 2026-10-05 "≤ 28 MB, ~2 Mbps"; ep14 "please dont cut or process anything to the BGM" |

**Proof before the full farm run:** stills at 14.5, 25.5, 70, 83, 90, 97.0, 100, 103.5, 112, 116 and 117.6. Also a 10-fps strip of 109.7–118 and 97.4–101 to confirm the drift and the parallax.

## What must not change (it works)
- **The look:** thermal 满意度 with auto-range, the ironbow/ice LUT, contour lines, bloom only on the hottest band. Mean luma 73–150, nowhere "dark".
- **The hook mechanic:**
  - 8.5–13: the roommate's phone ignites.
  - 10.5: auto-range, and your same ¥4000 cools to orange.
  - The legend markers swap.
- **The title plaque erupting from your screen on 16.58,** and steam → haze → lab.
- **The lab:**
  - A turns ice and throws the cucumber.
  - The 95/60/20 % numerals with live counting.
  - The white-hot grape at 48 blooming into the coin.
- **The worlds:**
  - The towers side by side at 54.
  - The 48 % and 85 % counters settling on their bars.
  - The coin edges → pay rows match (72–74).
- **The drop:**
  - The line-only flare on 81.375.
  - The cold front over 2 beats.
  - 满意度▼ on beat 2.
  - 你 under the line and ice.
  - The white-hot 找新工作 door.
  - 高于中位数 · 满意度不变.
- **The ending:**
  - The two placards.
  - The reference switch at 117.8 (去年的你 ¥0 at the bottom, phone flares white).
  - The clean 122 frame.
- **The end card:** J monogram, gold title, question + 评论区说说, the pill "关注 Juno · 一起看懂世界", the full sources with "开头的工资是举例 · 画面为示意". No "Juno 出品".
- **The engine subtitles** (Noto Sans CJK 900, gold keywords, dark strip), the corner mark, and the per-scene source lines.
- **The sound:** the song untouched, three SFX types, the levels as they are.
