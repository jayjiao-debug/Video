# Review: 定情信物 · 一人一半 v4 (ep47_v4_上传版.mp4) — verdict: READY (ship)

All seven v2 majors are fixed on the v4 frames. The six match cuts sit exactly where they were in v3 (the breath is zero at every scene boundary). The new camera breath keeps every scene alive without touching the cuts. Nothing on screen is broken. What remains is polish. The two items worth a quick re-render if there is time: the pager passing through the bike in the look-back drift (104.6–104.8), and a 1-frame breath pop at the 11.89 title dissolve.

| # | Sev | Time | What's wrong | Evidence | Suggested fix |
|---|-----|------|--------------|----------|---------------|
| 1 | MINOR | 1:44.6–1:44.8 | **Look-back drift: the pager slides through the bike.** They cross in the same lane at y≈800, so the 520 screen is drawn over the frame and wheels for ~0.25 s. Logic r2 M3 asked for two lanes; both objects still use one. The bike now faces the way it moves (left), so that part is fixed. | `review_v4/frames/lookback_bike.png` (104.65, 104.8), `bike_zoom.png` | In `LookBack`, put the left-to-right pair (quince, pager) at y≈800 and the right-to-left pair (rings, bike) at y≈930. Or stagger the pager and bike windows so they are never within 500 px of each other. |
| 2 | MINOR | 0:11.89 (and any `F` dissolve) | **The breath pops for one frame at the title→诗经 dissolve.** During the dissolve, film47 redraws the outgoing scene with `b={prev.b + 0.3}`, so its breath jumps from 0 to sin(0.9π) ≈ 0.31: about 1 % zoom plus 5 px drift. The title halves jump 11 px between f354 and f355, against 3 px on the next frame. At 25.48 it is invisible (w≈0.07). | `review_v4/frames/cuts/d354–d357` (measured disc centre 392→381→378→376) | Pass `b={prev.b}` to the outgoing `Breath`. k is clamped to 1, so w stays 0 through the dissolve. |
| 3 | MINOR | 0:41–0:47, 0:54.4–0:57 | **徐德言 and the princess are now different, but only just.** He wears a straight thigh-length tunic over trousers, broader. She wears a flared calf-length dress (it reads clearly at the gate, 53.0). Both still have the same topknot bun and the same height. At phone size in the palace two-shot, and at 55.0 right after 「她被送进…府里」, the clothes have to carry the whole difference. I can't see the short beard at phone size. | `review_v4/frames/figures_compare.png`, `pojing_couple_43.5.png`, `xu_vs_princess.png` | If you re-render anyway, give Xu a different head (a 冠/幞头-style cap instead of the bun) and enlarge the beard. Otherwise leave it: it no longer reads as the same person. |
| 4 | MINOR | 1:03.90–1:03.966 | During the last two frames of the reunion push, her bun touches row 2 of the subtitle (「杨素动容，成全二人。」, at the comma). | `review_v4/frames/heads_6393.png`, `reunion_full.png` (f1918) | End the push at scale ≈3.6 instead of 4, or fade the story rows out over 63.8–63.95. |
| 5 | MINOR | 1:14.15–1:14.45 | Unchanged from v2 #8: the Tang camera drop still reads as a whip pan (most of ~1,000 px in 0.3 s), and the messenger pops in. | `review_v4/frames/tang_down.png` | Use a 1.5–2 s ease, or follow the messenger down. |
| 6 | MINOR | 0:51.5, 0:54.4, 0:59.4, 1:01.7 | Unchanged from v2 #9: four hard cuts in 10 s. The other hand-overs are all motivated. | probe hard cuts | Optional. See v2 #9. |
| 7 | MINOR | various | Unchanged polish. (a) The 原文 lines are still ~30 px and pale over bright scenes (0:15, 0:34). (b) The 「换过几次」 pairs are recolours of one avatar. (c) The end card fades in rather than hitting 137.77. (d) The 发送版 is still 720p / 28.4 MB. | sheets 02, 04, 19 | As in v2 #12. |

## Fixed since v2 (checked on v4 frames)
- **#1 reunion (was MAJOR):** fixed. She walks out through the opening doors and he walks in from the right (61.9–63.0). Both stop, raise the offer hand with a half on each palm, and the halves close between their touching hands (63.4–63.7). Nothing floats. The push-in frames hands plus mirror and matches into CodaMirror. `frames/reunion.png`, `reunion_full.png`
- **#2 same silhouette (was MAJOR):** fixed enough. Tunic and trousers against a flared dress; see row 3 for the remaining weakness.
- **#3 drop bubble under the subtitle (was MAJOR):** fixed. The bubbles pop at ~112 s, after the pull-back, below the text row. Each bubble now shows its own person (woman left, man right). `frames/drop_coda.png` 110.45–112.5
- **#4 K2 over 杨贵妃 (was MAJOR):** fixed. The cloud palace and her figure sit right of the text box (121–123.4). The roof is inside the frame. `sheet_18`
- **#5 grey bar on the empty phone (was MAJOR):** fixed. There is no stand behind the ghost phone, and the dashed square is clean. `sheet_18`, `drop_coda.png` 124.5–129
- **#6 dead stops (was MAJOR):** fixed. (a) 96.95–97.9 is digital silence (−84 dB) for 0.95 s, while the halves fade in and drift (96.3→97.9). That is within the ≤1 s rule. (b) 127.0–129.3: the music tails down (−23 → −49 dB, not silent) while the phones push and the empty square breathes. probe finds no frozen picture before the end card.
- **#7 music bed:** resolved. crew_log 03:30 says the owner asked for the cut bed this session.
- **#10 drop landing:** improved. The halves converge on the centre seam at 106.97 and the phones' avatar seam is in the same place on 107.000.
- **#11 K1:** fixed. The couple are now ~45 % of frame height (sheet_17).
- **Logic r2:** M1 hairpin: the hand reaches the bun and draws it up, with no jump (67.8–68.25). M2: same as #4. M3: bike direction fixed, but the lane overlap remains (row 1). M4: halves on stands at constant size. M5: same as #3. B1: same as #1.

## Match cuts vs the breath (measured)
- Code: `Breath` uses sin(π·k), so it is exactly 0 at each scene's first and last frame. The v4 cut frames differ from v3 by 0.2–0.9 grey levels (mean abs), i.e. identical apart from grain. The breath does move inside scenes: in the 2.26 s Poem scene the paper edge shifts by 17 px.
- 39.06 rings→mirror: the disc centre is at (930, 428) on both sides of the cut, same size. ✓
- 48.117 halves→stalls: the halves sit at the same x, y and size. ✓
- 57.17 stall→meet: a punch-in on the halves, unchanged from v3. ✓
- 63.97 push-in→mirror: the disc centre moves (949, 539) → (958, 545), diameter ~300 → 286. ✓
- 66.23 mirror→moon: the small mirror at (1500, 331) lands on the Tang moon. ✓
- 106.986 landing→phones: the halves at the centre seam, then the phones at 107.000 with the seam on the same x. ✓
- The only breath artefact is at the cross-dissolve (row 2).

## Automatic checks (upload master)
- 1920×1080, 30 fps, H.264 High yuv420p, 145.13 s. 11.98 Mbps / 222.1 MB. AAC 48 kHz stereo, 247 kbps. −14.01 LUFS, −2.0 dBTP, LRA 4.9. The stated PASS is confirmed.
- No black frames, no single-frame glitches, no silences flagged by probe. 19 hard cuts. The only frozen stretch is 139.07–145.1, which is the end card holding (fine).
- Pace: 0 lines too fast, 5 % waiting. The 9.1–11.9 gap is the title card. The 127–129.3 gap is the coda push.
- facts.py: the same four flags as v2 (1400 ×2, 1800, 七十), all false positives. They are covered by F10, F3 and F13. lines.json and facts.md are unchanged since 01:06.
- Brand: no 「Juno 出品」. The end card has the J monogram, the 「关注 Juno · 一起看懂世界」 pill and the sources line.

## What works (keep)
- Frame 0: the couple avatar is on screen and moving, and the contradiction lands by 2.8 s.
- The reunion is now a real act between two people: walk, stop, offer, join in the hands, push.
- The match-cut chain (lamp → mirror → stalls → meet → push → moon → phones) is pixel-aligned.
- The breath: every scene moves slowly, no frame is frozen, and the cuts are untouched.
- The coda: drop bubbles, K1, K2 and the empty phone are all clean and on the right side of the text.

## Not checked / can't judge
- Audio taste and whether the bed's splices are audible (I measured levels only).
- Foot sliding per frame, and check47 / pose_check: not re-run (by eye, no sliding on the reunion walk).
- I reviewed the upload master. The 1080p master and the 720p 发送版 were only probed for size and resolution.
- Frames and measurements: `/home/claude/video/episodes/47-dingqing/review_v4/frames/`. Sheets and auto checks: `/home/claude/video/episodes/47-dingqing/review_v4/`.
