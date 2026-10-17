# Gate 4 notes: 《为什么好听？》 full cut v4 (`out/为什么好听_v4_高清原片.mp4`, 163.2 s) — verdict: REVISE (one small fix, then deliver)

Director, round 1. Inputs: brief.md, lines_v2b_arr.json, facts.md, review/qa/REVIEW.md + REVIEW_r2.md,
review/music_review.md + music_review_r2.md, review/coldread_gate4.md. My own frames are in `review/director/`
(sheets every 2 s, 3×3 strips at 0.1 s around every listed transition, full-res crops). Measured on the v4 file:
−14.1 LUFS, −2.0 dBTP, LRA 5.6. A lit-pixel scan of all 4,896 frames finds no empty frames. The only two dim
stretches are the wave shrinking into the head at 9.47–9.53 s (3 frames) and the hush from the finale wave into the
end card at 152.9–153.1 s. In both, the object stays on screen, so neither reads as a blink. The end card is no
longer frozen: it moves about 0.5 per frame against 0.05 before.

Scores: script 4 · visual 4 · info 4 · edit 5 · motion 4 · sound 5 (by measurement; I did not listen on earbuds)

There is no earlier director round at gate 4. Against QA r2, every row the producer listed is fixed in v4:
- The 3000 Hz / 每秒上万次 labels at 0:30 are now well apart.
- The 0:45, 0:48, arrow and recap handovers are now overlaps. The arrow flips at 66.76 and fades to 骗你的！ at 68.8 with no empty frame.
- The first subtitle is at full opacity on frame 0.
- Title → 363 Hz wave has no double image.
- The music r2 tweaks are in process_v3.py: limiter at −2.1, the reverse-reverb roll, return pad 0.08/0.07.

| # | Sev | Where | Note | Route to | Owner note it relates to |
|---|---|---|---|---|---|
| 1 | MAJOR (only blocker) | 0:42.4–0:44.6 (S5Stage, 合回来！) | **Text on text.** The header `合回来！主音 ≈ 363 Hz` (gold, `Labs y={100}`) sits on top of the returning stage label `主旋律` (also gold). The ink gap is **4 px** (header rows 68–104, 主旋律 from row 109) for 2.2 s. The expanding gold ring also passes through both. On a phone they read as one stuck gold block. At 0:38 the same header row is clear only because 主旋律 is gone then. Fix it one of two ways. (a) Drop the second `Labs` item `[cB, cB + 2.6, '合回来！主音 ≈ 363 Hz']`, because the subtitle already says 合回来！主音约360赫兹, and set `≈ 363 Hz` (≥ 52 px, gold) to the right of the 主旋律 dot. (b) Keep it but give it its own row, e.g. `y ≈ 50`, so the clear gap is ≥ 40 px. Accept when a crop at 43.0 s shows ≥ 40 px of clear background between the two inks. Re-render 41.8–45.2 s only and splice it into v4 with the audio untouched. Don't change anything else. | animator | "text over text" (rubric 1); ep15 "make sure the reading is big enough"; same class as QA r2 N1 (0:30) |
| 2 | MINOR (optional, same re-render if you widen it to 38.0) | 0:38.3–0:38.6 | `这里空了` fades in on the same spot as `鼓·贝斯` while that label is still fading out. That is about 9 frames of overlapping text (`review/director/z_38_center.jpg`). Let 鼓·贝斯 finish fading before 这里空了 starts (offset its fade-in by about 0.25 s). The owner won't send this back. Do it only if the segment is being re-rendered anyway. | animator | ep28 "outgoing labels leave before the move starts" |

**Producer checklist before it goes to the owner** (not role notes; nothing here needs a re-render):
- **Delivery file.** The 129 MB 高清原片 can't be sent in the chat (owner-notes row 21). Make the ≤ 28 MB send version (2-pass, about 2 Mbps). In that same encode, convert full range to limited: the cut is still `yuvj420p` / `color_range=pc` (QA r2 N2). This film is near-black almost throughout, so compare one dark frame, e.g. 1:56, before and after the encode.
- **Stale soundtrack.** `out/声音_配乐_v4.m4a` (22:40) is older than the r2 music tweaks (soundtrack_v4_raw.wav, 23:10). Don't send it as the soundtrack. Delete it, or re-export it from the wav.
- **Tell the owner about the wording change.** His fixed subtitle 最易起鸡皮疙瘩 is now 更易起鸡皮疙瘩 (2:07.6). Facts support only "more than static" (Honda 2020 compared a sound rotating around the head with a static one). Give him the reason in one line. He may also say whether he minds that `慢慢` stays in the line; the paper's point is the rotation.
- **Facts checker flag.** `facts.facts_flags.json` still flags 0.02. That flag predates the facts.md edit, and the precedence row now says "18 ms ≈ 0.02 秒". Re-run the checker so the flag clears.

**Not sent back. These are taste calls the owner may raise; listed so nobody is surprised:**
- **Arrows (1:04–1:08).** The two big pale-lavender block arrows are the one stretch not drawn in the film's glow/particle language. They are what the owner asked for (显示⬅️…), they flip cleanly and they read instantly. If he calls them flat, the fix is a glowing outline arrow built from the cyan/magenta particles.
- **Recap step 绕着你转 (2:18).** A small head with one gold dot on an otherwise empty field is the sparsest frame in the film.
- **Cold-read swipe risks.** The physics stretch (0:15–0:24) and the one-word recap (2:10–2:20) are swipe risks according to the cold read. Both sit on owner-fixed words, so the picture already carries them as well as it can. The cold read's other worry, that the title burst reads as an outro, is handled: the line 可为什么，有的声音好听？ is on screen from 1:22.6.
- **Brightness.** Mean luma is about 19/255 by my measure. That is the approved deep-navy look and the owner didn't object to it on v1, but it is the series' darkest film.

What must not change (it works):
- **Opening (0:00–0:10).** Frame 0 is the glowing cyan wave, the headphone pill and the subtitle together. The varispeed proves 你听的这首歌，被放慢过 within 5 s; the wave turns gold and tight when sped up, then relaxes.
- **The morph chain.** These handovers are the film's best editing; leave them alone:
  - wave → head (9.4)
  - head → speaker (15.6)
  - air bands → spectrum (24.5)
  - spectrum → stage (38.1)
  - binaural → spectrum (60.1)
  - age line → arrow (64.7)
  - the arrow flip (66.76)
  - precedence → Shepard rings (75.0)
  - harmony → sad head (113.6)
  - sad head → recap spectrum (130.4)
  - stage → ping-pong (136.7)
  - recap head → particle sphere (140.6)
  - particles → gold wave → end card (150–153)
- **Title on the drop (1:21.06).** The rings burst into particles that form 为什么好听? in the ear colours with a live wave underline. The audio jump and the picture burst land on the same frame, there's no flash and no freeze, and the title pours into the 363 Hz wave by 1:26.5. This is the film's biggest image, and it sits on the hardest drop.
- **Key numbers on the objects.** 45 Hz, 45 Hz?, 6 Hz with 369 − 363 = 6, 你还听得见吗？ 12900→2500 Hz, 0.02 秒 / 先到, the ×8 tick count, and the 2:1 / 3:2 / 对不齐 Lissajous figures. Each passes the 5-second test at phone size.
- **The prank → 第二招 header → precedence sequence (1:04–1:16).** The cold reader's favourite moment.
- **Sound.** The demos are done on the song itself, conformed to the beat grid. The mix is mono-safe, at −14.1 LUFS / −2.0 dBTP. The reverse-reverb inhale runs into the drop with no stop, and the octave/fifth return under the closing lines.
- **Subtitles and end card.** Boxless subtitles are readable on every frame I checked. The Juno end card is grown from the finale wave, with the question 你单曲循环最多的是哪首歌？评论区说说, the 关注 Juno · 一起看懂世界 pill and the sources line, and it now breathes.

After note 1 is fixed and the 41.8–45.2 s splice is checked with the gap measurement, this is APPROVE. There's no need for a second director round unless something else changes.
