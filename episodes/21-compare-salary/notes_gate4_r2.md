# Gate 4 notes r2: 为什么一比，就觉得穷？ v3 · 满意度热像, render r3 (master_v3r3.mp4 + 发送版 一比就觉得穷_v3.mp4) — verdict: REVISE (one spot-fix, no new round)

**This is one ~15-minute spot-fix away from delivery.** Almost every r1 note and review_v3_r1 item has landed. The camera never freezes now. The white-outs and luma snaps are gone. The door no longer has 穿模. The A→B whip is now a glide, and 85 % lands with its line. The ending moves and the placards stay clear of the phone. One thing would still get the film sent back: the **aliased dark-violet window slab at 19.8–20.35**. It is a hard, stair-stepped block in the top right of the steam dive, half a second after the title, and it is the only "没有render好" frame left. It was r1 note 6 and review #3a, and r3 didn't touch it. The fix is about 20 frames: re-render 19.7–20.5 (frames 591–615; `renderAt` is pure in T, so a frame-exact splice is safe), then re-encode both files. No director round is needed after it: the producer checks the frames listed under note 1 and delivers.

How I checked:
- 260 frames at 2 fps from the 发送版 (`scratchpad/g4r2/sheet_0–8.jpg`, all opened).
- fps-10 strips from the master at 0–1.6, 12–17, 19.8–21, 55–58, 64–69, 72.4–74.1, 85–98, 104.8–106.2 and 109–122 (`ws_*.jpg`, all opened).
- Full-res stills at 19.9/20.2, 86–91 (door label crop), 98.6/100.5/102/103.6 (street) and the hold pairs (`holds.jpg`).
- Per-frame luma and frame difference on all 3899 frames (240×135).
- Affine ECC on the centre crop across every hold, to measure the drift.
- EBU R128 on both files.
- SFX event levels against the song, and a mix − song residual.

Scores (rubric 1–5): script 4 · visual 4 (street 3) · info 4 · edit 5 · motion 4 · sound 4 · **overall 4**. With note 1 fixed, the owner would post it. He may still remark on the street (note 3), but that is not a send-back.

| Area | r1 → r2 | Evidence |
|---|---|---|
| Script | 4 → **4** | "换成假期呢？[85%]的人选了B" now says what the source says. The HUD reads "换成假期 · 选 B 的人". The other 29 lines are unchanged and read at pace. The end question invites comments. |
| Visual | 4 → **4** | The strong stills hold: 0.5 (banner on the hot phone), 17.5 (plaque), 83 (ice crowd under the white line), 115 (two placards clear of the phone), 120 (white-hot +¥4000). The street is better: 3/4 depth on the houses, lamp posts with parallax, labels pinned (102.0). But it is still the weakest scene. The windows read as "m"/"ш" shapes and luma is ~72 against the film's 94 (note 3). The 20.0 slab is the one broken-render frame (note 1). |
| Info | 4 → **4** | 85 % now counts 3→44→68→80→84→85 from 65.2 to 65.7 (beat 2). B's "你的假期" tower is clearly taller than A's, and the crowd streams into B (65.8–66.7), so the picture settles the line. 48 % lands at 61.5. The drop passes the 5-second test. Small losses: "找新工作" sits flush on the right edge at 86.0–87.5 (note 2), and the cucumber is a long hot pill without bumps (accepted). |
| Editing | 4 → **5** | Every transition is carried by an object, with no flash: steam → lab, grape bloom → coin, coin → pay list (72.4–74.0, haze dissolve, no white-out), door → street, window → room. Largest one-frame luma steps: 19.37–19.43 (−6.6 ×3), 97.2 (−6.2), 105.4 (+5.6). The only big step is the drop at 81.40 (+11.4), which is intended. r1 had −91 at 73.30 and −64 at 20.63. After the drop the camera travels one way toward the door (85–97.6), with no reversals. The A→B move (55.2–57.4) is an eased glide, and B's towers rise from 57.4. The title is on 16.58 and the drop on 81.375. |
| Motion | 3 → **4** | No hold is frozen any more; only the end card (≥ 126.4) has zero diff. Measured drift across the old dead holds: 22.0–24.6 +5.0 %, 42.5–44.8 +2.2 %, 50.6–52.9 +1.0 %, 59–61 +1.5 %, 76–77.2 +2.9 %, 106.2–109.6 +5.1 %, 110.7–113.7 +1.9 %, 114.8–117.5 −1.6 % (pull-back), 119.6–121.8 +2.2 %. Two are on the slow side (30.0–32.6 +0.7 %, 63.3–65.0 +0.6 %), but they are alive and short. Not worth a render. |
| Sound | 4 → **4** | The song is untouched: mix − s130f ≤ 1.1e-6 wherever the SFX are silent. Both files are −9.9 LUFS. There are 12 SFX events. The new ignite at 0.25 peaks at −16 dBFS, 18 dB under the music RMS, so it adds a lift on b0 without poking out. The frost on 81.35 is the only loud one (−3.8 dBFS peak). |

## r1 notes and review_v3_r1: status
- **Closed:**
  - r1 note 2: freeze → drift (see Motion).
  - r1 note 3: 穿模 at the door. The walkers enter the white-hot door and vanish, and the camera passes beside them, above head height (96.9–97.6).
  - r1 note 4a: the roommate's phone leaves the legend box from 13.4.
  - r1 note 4c: the header is fully in frame 73.5–77.0 and fades during the pull-back.
  - r1 note 7: the banner drops on 0.38 with a soft ignite.
  - r1 note 8: the 发送版 is 27.7 MB, H.264 1.56 Mbps + AAC 132 kbps, 129.97 s, −9.9 LUFS.
  - review #2, #3b/c, #4, #5, #6, #7, #8, #10 and #11.
- **Partly closed, accepted:**
  - r1 note 1 / review #9, the street: depth, parallax, labels and brightness are better. The "m" windows remain (note 3, optional).
  - r1 note 5, the exchange: the pebble is a ~80 px ice disc and the cucumber a long hot stick. It reads as "token out, food in".
  - r1 note 4e: the placards and legend cross-fade at 117.6–117.8, both semi-transparent, for 0.2 s. Not worth fixing.
- **Not done:** r1 note 6 / review #3a, the 20.0 slab → note 1 below.

## Notes

| # | Sev | Where | Note (problem → fix) | Route to | Owner note it relates to |
|---|---|---|---|---|---|
| 1 | **Must-fix** (spot re-render) | 19.80–20.35 steam dive (`F_20pair.jpg`, `ws_c0.jpg`) | **A dark-violet window slab with stair-stepped, aliased edges sits top right in the haze** for ~16 frames, right after the title. It is the hook room's window (`winM`, heat −0.22, s_hook.js:18), seen through the steam. Its negative heat survives the haze mix (thermal.js:65 only clamps `H` toward max(H,0) by uHaze), and its edge comes from the low-res diffusion buffer. Fix (either one): in s_hook.js, fade `winM` heat to the ambient value between B(9)+0.2 and B(9)+0.55 (≈18.8–19.2), *or* set `win.visible=false` for T > 19.3 (the camera is inside the steam by then, so nothing else changes). Re-render frames 591–615 only, splice them into the frame sequence, then re-encode the master and the 发送版 (same settings: 2-pass ~1.55 Mbps, AAC 128k, song level untouched). **Check before delivery:** stills at 19.8, 20.0 and 20.2 show no hard-edged dark shape, and the per-frame luma step stays ≤ 7 across 19.3–20.7. | animator, producer | ep9 "中间的剪刀没有render好" (every prop renders whole) |
| 2 | Low (only if a render happens anyway) | 85.9–87.5 (`c_door.png`) | "找新工作" fades in clipped, then sits flush on the right edge, with no margin until ~88.5. Clamp its x to ≤ 1824 (96-px safe box). It is readable, so this alone is not a reason to re-render. | animator | ep14 v6 "must clear what's below"; rubric visual |
| 3 | Optional (owner's call if he mentions it) | 97.6–105.7 street (`street.jpg`) | It is no longer clip-art boxes, but the window + door shapes fuse into "m"/"ш" glyphs (most visible in your ringed house at 103.6), and the scene is the darkest in the film (luma ~72). If the owner comments on the street: separate panes with a mullion and a 10-px gap from the door, and lift the ambient floor one ramp step. Do not do it pre-emptively. It is 8 s, and the auto-range idea reads. | animator | ep21 v2 "very cheap looking… simple houses" |

## What must not change (it works)
- **The opening:**
  - Frame 0 is the hot phone with the subtitle on.
  - The "+¥4000 已到账" banner drops on 0.38.
  - The roommate's ignite on b4 and the auto-range on b5, with your phone cooling.
  - The roommate's phone leaving frame by 13.4.
- **The title and the lab:**
  - The title plaque on 16.58.
  - The steam → lab haze (after note 1, it stays exactly as it is otherwise).
  - The lab: A turns ice and throws the cucumber, and 95/60/20 % count onto beats.
  - The grape bloom → coin.
- **The worlds:**
  - The A→B glide.
  - 48 % and 85 %, with the new line and HUD.
  - B's taller vacation tower and the crowd flowing into B.
- **The wall and the drop:**
  - The coin → pay-list haze.
  - The drop: the line flare on 81.375, the cold front, 满意度▼.
  - The one-direction travel to the door, the walkers vanishing into it.
- **The street:**
  - The 3/4 dolly with lamp parallax.
  - The pinned labels and the gold ring.
  - The push through the window.
- **The ending:**
  - The roommate's grape callback with the push.
  - The placards scaling in, clear of your phone.
  - The reference switch at 117.8 with the white flare.
  - The slow pull-back.
- **The end card:** J monogram, gold title, question, "关注 Juno · 一起看懂世界", sources. No "Juno 出品".
- **The engine and the sound:** the engine subtitles and corner mark. The song bit-exact, SFX levels as they are.
- **Delivery:** the 发送版 ≤ 28 MB at ~1.55 Mbps, keeping the song's own loudness.
