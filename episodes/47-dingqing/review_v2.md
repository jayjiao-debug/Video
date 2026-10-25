# Review: 定情信物 · 一人一半 v2 (ep47_v2.mp4, rendered 02:25) — verdict: FIX FIRST

The film is strong and on brand. The hook is the viewer's own couple avatar on frame 0, with the contradiction landing by 2.8 s. The paper look holds together, the facts are clean, and all four music hits land within one frame. Before the owner sees it, though, there is one clear body-logic error at the 破镜重圆 payoff: the two halves float together in mid-air. Viewers also can't tell 徐德言 from his wife. Four frames put text or artefacts on the subject.

Note: `scenes47.tsx`, `kit47.tsx` and `pose47.ts` were changed at 03:13, after this render. Everything below is about the rendered v2 file. If those edits ship, re-render and send the new file for review.

| # | Sev | Time | What's wrong | Evidence | Suggested fix |
|---|-----|------|--------------|----------|---------------|
| 1 | MAJOR | 1:03.5–1:03.97 | **The two mirror halves leave the couple's hands and join in mid-air.** The princess is still mid-stride (63.72). At 63.62 both halves hang between the couple with no hand on either. At 63.8 the push-in frames a glowing mirror floating between two people whose arms hang at their sides. The push also puts 「成全二人。」 over her head and the stamp over his. This is the film's 破镜重圆 moment. | `review_v2/x_meet.png`, `x_meet2.png`, `full/f_63.77.png` | In `Return`, end her walk ≥0.6 s before `d`: start her nearer, or use stopX ≈1200. Blend both into `offer` with the halves on their hands, and drive `pR`/`xLp` from the hands, not from a lerp to M. Join only when the hands meet, then push in. During the push, keep heads out of x<1150, y<330. |
| 2 | MAJOR | 0:41–0:47, 0:54.4–0:57.2, 1:56–2:00 | **徐德言 and the princess are the same silhouette** (`LK.xu` = `LK.princess`: robe, bun, wide sleeves). In the palace they read as one person mirrored. At 54.6, right after 「她被送进…府里」, the figure carrying a half mirror to the stall reads as *her*, so the viewer thinks she escaped and he never searched. | `full/compare_figures.png` (53.0 her / 55.0 him / 45.8 both / 62.8), `sheet_07` | Give Xu a man's 冠 with a pin, a belt and a straighter, shorter robe. Give her a high 髻 with a pin, long trailing sleeves or a 披帛, and a fuller skirt. Check that the two read apart at phone size. |
| 3 | MAJOR | 1:50.4–1:53.2 | **The subtitle covers the left avatar bubble.** 「这一招还在：」 runs over the bubble, the moon sits right behind the 「：」, and the avatar is the subject of the line. | `full/f_111.8.png`, `sheet_16` (1:50.60, 1:51.80) | Lower the windows and bubbles by ~150 px so the bubble tops sit below y≈380. Or set this line as the bottom-centred punch, like 「我把一半，留给你。」 right after it. |
| 4 | MAJOR | 2:00.3–2:03.6 | **K2: 杨贵妃 and her cloud palace sit inside the subtitle block.** 「重圆了。」 and the scrim cover her body while the line names her (「一个天上」). | `full/f_120.5.png`, `sheet_18` | In the `coda` tag, set camera y so the sky level sits below y≈420, or move the sky storey to the right half. Or set K2 as a bottom-centred punch. |
| 5 | MAJOR | 2:03.6–2:08.6 | **A render artefact sits on the key question.** The empty phone is drawn at 0.7 opacity, so the grey `PhoneStand` wedge behind it shows through as a grey bar on its screen. It stays still for 5 s under 「你手里那一半，给了谁？」 and disappears at 129.3. | `full/f_125.5.png`, `x_end.png` | Draw the ghost phone opaque: pale screen fill, dashed square, dimmed bezel. Or don't draw the stand behind a translucent phone. |
| 6 | MAJOR | 1:36.3–1:38.5 and 2:03.9–2:09.3 | **Two still, quiet stretches.** (a) An empty cream frame with only 「可你回头看：」 for 2.2 s, including 1.02 s of digital silence (−70 dB, 96.90–97.92). (b) The picture is frozen 123.9–127.0 (probe), then near-still to 129.3, while the music drops 13–29 dB under the body after the 127.03 stop. That is 5.4 s with almost nothing moving. Owner rows 50 and 91 (「不用那一段awkward的卡顿」: silence plus a frozen picture reads as the video lagging). | `x_stop.png`, `x_end.png`, probe frozen 123.93–126.97 | Keep one thing moving through each stop. (a) Let the era objects lift off and drift out during the silence, with the mirror halves already entering from the edges. (b) Let the left half-moon glow breathe and the dashed square draw itself, then fill on 129.26. Keep each true silence ≤1 s. |
| 7 | MAJOR (owner call) | whole film | **The music is an edited bed, not one continuous track.** `music_map_ep42.json` v2 lists 6 splices (10–40 ms crossfades), an inserted 1.7 s gap, added reverb tails, a −5 dB dip, a −3 dB return and the song restarting from 0:00 at 128.7. This conflicts with owner rows 51, 56, 64 and 66 (「I want 1 coherent untouched BGM … dont cut or process anything」). Row 112 (pauses) only partly allows it. I found no record that the owner approved this cut in the ep42 or ep47 folders. I can't judge by ear whether the splices are audible. | `music_map_ep42.json` key `v2`, `42-yiyi/music/build_v2.py` | Ask the owner before publishing. If he hasn't approved bgm2 v2, the safe version is the untouched song with one fade-out over the last bar. |
| 8 | MINOR | 1:14.17–1:14.45 | The Tang camera drops ~1,000 px. The eased move is 0.9 s, but most of it happens in about 0.3 s, so it reads as a whip pan, and the messenger pops in at the right edge. Owner row 67. | `x_tangdown.png` | Use a 1.5–2 s ease, or follow the messenger down. |
| 9 | MINOR | 0:50–1:02 | Four hard cuts in 10 s (51.53, 54.37, 59.47, 61.73). The other hand-overs are now motivated (rings→mirror 39.07, halves→stalls 48.13, mirror→moon 66.23 all match). Owner rows 33 and 86. | probe hard cuts, `sheet_06`–`09` | 54.37: follow Xu's half from the gate into the stall. 59.47: the joined mirror settles onto the stand beside the poem. 61.73: the paper slides off to show the gate. |
| 10 | MINOR | 1:46.99 | The DROP lands on time (cut at 107.000, 14 ms after the hit). But the halves converge and then the film cuts to a medium two-phone shot: they never visibly land in the avatars, and it isn't the film's biggest frame (row 88). | `x_drop.png` | Carry the halves across the cut into the two avatar squares, add a gold seam flash on 106.986 and a scale punch on the phones only. |
| 11 | MINOR | 1:56–2:00 | K1: the reunited couple are ~13 % of frame height and the shot stays nearly still for 4 s (owner row 98, 「为什么人这么小」). | `sheet_17`, `x_crack.png` (116.3–120.2) | Slow push in to figures at ~40 % of frame height. |
| 12 | MINOR | various | Polish. (a) The 原文 lines are ~30 px and pale on bright scenes (0:15 over the tree, 0:34 on the scroll edge); row 76 asks ≥40 px. (b) The 「换过几次」 pairs (2:09–2:17) are recolours of one avatar, not different pairs. (c) The end card fades in over 137.8–139.0 instead of hitting 137.765. (d) The emperor's 幞头 tail reads as a hand on his head at phone size (1:17.8, 2:00.5). (e) Delivery: the 1080p master is 33 MB, over the 28 MB chat cap, so 发送版 dropped to 720p. Rows 21 and 44 ask for 1080p at ~1.5 Mbps; a 2-pass encode at ~1.35 Mbps video + 128 kbps AAC fits in ~26 MB. (f) F4 cites zh.wikisource. That isn't Wikipedia, but a print edition or ctext citation is safer. | `full/f_15.0.png`, `full/f_34.25.png`, `x_final.png`, `full/f_77.81.png` | As listed. |

## Music sync (measured on frames)
- Title 9.06: hard cut at 9.067 to the cracked mirror, title text fully in by 9.2, mirror closed on 9.626. ✓
- DROP 106.986: the halves converge 106.3–106.9, then the cut to the phones lands at 107.000. ✓ (but see #10)
- Dead stop 127.03: the subtitle clears at 127.0. ✓ The picture is still dead around it (#6).
- Final hit 137.765: phones flash and the end card starts at 137.77. ✓ Full card by ~139 (#12c).

## Automatic checks
- 1920×1080, 30 fps, 145.13 s. Master 1.56 Mbps / 33.0 MB. 上传版 12.0 Mbps / 222 MB. 发送版 720p 1.39 Mbps / 28.3 MB. All three: −14.0 LUFS, −2.0 dBTP, LRA 4.9.
- No black frames, no single-frame glitches, 19 hard cuts.
- probe's "bitrate too low" MAJOR is overridden by owner rows 21 and 44 (1.5–2 Mbps is the house bar).
- Pace: 0 too fast, 5 % waiting. facts.py's four flags (1400, 1800, 七十) are false positives: F10 (589 → 1,437), F3 (d. 218 → 1,808) and F13 (中新网 1970年代) cover them. I traced every line to facts.md by hand and found no overclaim.
- Brand: no 「Juno 出品」, no Wikipedia on screen. End card has the J monogram, the 「关注 Juno · 一起看懂世界」 pill and a sources line. ？ ink centres measure 957–961 px.

## Earlier gate notes: verified fixed on v2 frames
Real-size phones with avatar bubbles. Redesigned 钗 with a flower head. Door order and 杨素 in plum, taller. Stall roof above the servant. Matched mirror scale. Guards walk into the gate. Market halves on stands. Rings stay on the tray and fly into the mirror. Messenger lowers his arm. Quince arc kept below the text. Two-row subtitle cap with a tinted scrim. 雙 glyphs lit correctly. ×3 and ≈ added. Pager with plain zeros. Bike and pager in the LookBack drift. Phone stands. Sources line.

Not fixed or new: #1, #2, #4 (gate3 #13 was only partly fixed), #5, #11.

## What works (keep)
- Frame 0: the couple avatar parts on the first note (0.57), and the contradiction lands by 2.8 s.
- The paper world: ink figures with paper rims, the token as the only metal, the split-tally stamps.
- Hand-overs at reach: 17.6 jade over the fence, 44.8 half mirror, 57.0 stall join, 72.6 and 77.2 hairpin. Walk direction always matches facing.
- The match moves at 39.07, 48.13 and 66.23. The 天上人间 split level. The 三转一响 wedding at true scale.

## Not checked / can't judge
- I can't hear: the music's taste, or whether the bed's splices are audible. I measured levels only, and the sample-jump scan was inconclusive.
- Foot sliding: checked by eye on two walks (`x_feet.png`), no sliding seen, not measured per frame.
- check47 / pose_check: not re-run.
