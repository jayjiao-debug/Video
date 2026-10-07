# Re-review: 谁按错了 v2 (发送版) — verdict: READY (0 blockers, 0 majors; 5 minor polish items)

v2 fixes both blockers and all six majors. I found no new 穿模 or broken renders. What's left is polish that the producer can apply in film.html if there is time; none of it blocks publishing.

Checked: `out/谁按错了_v2_发送版.mp4`.
- 1080p30, 109.0 s, 26.1 MB, 1.74 Mbps, −14.27 LUFS, −0.98 dBTP.
- 0 black frames (v1 had 10), 0 glitches.
- Pace and facts are unchanged and clean.
- probe.py's "bitrate too low" flag is dismissed again: owner rows 21 and 44 set delivery at 1.5–2 Mbps.

Evidence (all in `review/14_v2/`):
- `sheet_01..16.png`, grids `g1–g7.png`, full-res `c_cards.png`, `c_misc.png`, `c_door.png` and `z_insag.png`.
- `yavg.txt` (per-frame luma) and `diff.txt` (per-frame motion).

## Fixed since v1 (each confirmed on new frames)
| v1 # | Status | Evidence |
|---|---|---|
| 1 BLOCKER memo | **Fixed.** The memo is lit and readable from 84.4: "1983 · 同型电站 / 拟加限制（未落实）". It stays above the lid and fades at 87.0. There is no black slab and no sinking. | g5 84.4/85.0/85.6, g6 86.4/87.0, c_misc 86.4 |
| 2 BLOCKER 穿模 | **Fixed.** The Chapanis card is an overlay, and the B-17 stays distant with nothing crossing the card (24.6–27.2). The cockpit levers stay apart (23.0/23.5). At the shape fix, the wheel and wedge don't touch (41.2/41.6). Diorama levers are clear (90.4–96.0). | g2, g3 row 1, g6 |
| 3 MAJOR hook | **Fixed.** A visible jolt and shake land on the 0.30 s hit (frame-diff 40 at 0.30, against ≈0 before). The rim-lit handle reads. | g1 0.0/0.3/0.5, diff.txt |
| 4 MAJOR transitions | **Fixed.** There are no black dips (min Y > 20) and subtitles stay on through every cut, including the 9.2 white-out. The 64.6 AZ-5 close-up and the 87.6 diorama opening on the reactor are now motivated. The remaining changes are plain cuts. | yavg.txt; g1 9.2; g4 64.8/65.4; g6 87.7/88.6 |
| 5 MAJOR card text | **Fixed.** INSAG-1 shows "主要归于", Chapanis shows "心理学家", FCC shows "调查结论", and the memo lines are separate. | g1 10.9, g2 25.0, g4 62.5, c_misc 86.4 |
| 6 MAJOR Hawaii snaps | **Fixed.** The one-frame jumps are gone, and the clock is lit, so the 38-minute sweep reads. | g3 55.5–58.8, g4 59.6/60.6 |
| 7 MAJOR cut-away | **Fixed.** The channel is about 3× larger, the chapter line is hidden, and "18 秒" holds from 73.0 to 74.2. | g5 72.0/73.5/75.0 |
| 8 MAJOR 90.5 drop | **Fixed for the drop**: a flash and light hit land at 90.6. The 93–96 stillness remains (see below). | g6 90.4/90.6 |
| 9–12 MINOR | **Fixed.** The button reads AZ-5. The cockpit gets a 驾驶舱 stat and no floor labels. The rod bars sit above the subtitle. The chapter is blank at the end, the door swings away (`rotation.y` positive, l.348), and there is a push-in from 96.4. | g1 5.3/21.5, g5 79.5, g7 |

## Remaining (minor; optional tonight)
| # | Sev | Time | What's wrong | Evidence | Suggested fix |
|---|---|---|---|---|---|
| 1 | MINOR | 1:33.1–1:36.4 | The picture is almost frozen under a talking line: mean frame-diff 0.06, with only dHot pulsing. The camera pull-back seems to stop and the levers freeze at 93.1. | diff.txt; g6 94.0/96.0; probe "almost static" | Let the l.341 camera keep dollying to 96.4, or add a slow orbit. Keep the frozen "fixed" lever but let the reactor glow swell more visibly. |
| 2 | MINOR | 0:55.5, 0:58.8, 1:01.9 | The Hawaii blends now resolve in about 0.2 s, which reads as quick whips (diff ≈ 30 over 4–7 frames). At 58.85 the shot passes over bare desk with the monitor half out of frame. | diff.txt; c_misc 58.85 | Lengthen each blend window to about 0.8 s. |
| 3 | MINOR | 1:13.5–1:17.5 | In the cut-away, the label "吸收体（刹车）" is clipped by the right frame edge and crowds the "很可能" stat. | g5 73.5/75.0, c_misc 75.0 | Move the label about 0.6 units left, or lower it below the stat. |
| 4 | MINOR | 1:27.7 | The subtitle "错，确实是人犯的" sits on the bright reactor-diorama lid with no band, so contrast is low. | c_misc 87.7 | Frame the diorama about 10 % higher at the start, or add a soft dark band behind the subtitle for 87.6–88.4. |
| 5 | MINOR | 0:42.2 | The red wedge pushes into the subtitle line ("一摸就分清"). It is still legible. | c_misc 42.2 | End the push-in slightly higher or wider. |

## New issues check
- **穿模:** none found. Checked: cockpit and diorama levers, door swing (opens through the doorway and clears the walls), memo vs lid, B-17 vs camera, INSAG-7 sliding over INSAG-1. The two INSAG cards are layered 0.05 apart, not intersecting. For about 0.1 s around 65.7, mid-slide, text from both cards is visible at once, which is acceptable.
- **Broken renders:** none.
- **Not checked by geometry:** as before, I did not run raycasts. The verdict is based on frames and the code changes.

**Verdict: READY.** Ship v2 as is, or apply minors 1–2 first (both small edits in film.html) if a re-render fits before the owner wakes.
