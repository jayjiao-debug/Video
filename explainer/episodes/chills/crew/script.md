# Script: 鸡皮疙瘩在等什么  (v2, gate 1 round 1 revisions)

## Notes addressed (notes_gate1_r1.md, notes routed to the screenwriter)
- **Note 1 (editor) → re-timed.** The audio is now the producer's measured re-cut, `audio/segments.json` (drop crash ON the downbeat at track 81.42; title drop at film 8.10; total 123.53 s). Every line is anchored to a segment in `lines_anchored.json` and converted to film time in `lines.json`. My v1 `audio_plan.json` is superseded; do not build from it.
- **Note 2 (editor) → picture note.** The muffled-drop picture note no longer says "same height on the meter". It now describes brightness only (the clip stays dull). If the editor's ±1 LU match holds, the storyboard may restore equal meter height.
- **Note 3 → line 25.** "心理学家Huron：快到时，身体先绷紧" is now **"预期理论：等它来时，人会先[紧张]"** (#24). The body word and the unsourced "心理学家" are gone. "Huron 2020" moves to a small on-screen caption.
- **Note 4 → line 11 + sil1.** The line is now **"是不是少了点什么？"**, which matches the ~30 % finding. It starts **0.75 s into the silence** (sil1 + 0.75 = film 33.15). The ear gets 0.75 s of pure silence with no text, plus the untexted breath before it (30.68–33.15).
- **Note 5 → line 17.** It is now the open question **"没有铺垫，还一样带劲吗？"**. The finding comes after, without needing the viewer to agree.
- **Note 6 → lines 18–20.** Three lines are cut to two, leading with the surprise: **"扫描发现：高潮[之前]，大脑已在兴奋"** (#4) and **"[等待]本身，就是奖励的一部分"** (#4, #5). 多巴胺 / 伏隔核 / 尾状核 move to lamp tags in the picture (#3, #4). bed3 is a fixed 12.15 s, so the freed time goes into reading air (≤ 0.9 s extra per line, no waiting flag).
- **Note 7 → cut the old line 27** ("一种理论：先被吓一下…"). Kept: new line 25 (note 3) and the 铺垫、拖延、兑现 line. "EDM" is written as **电子舞曲** (cold reader: "my mom wouldn't know EDM").
- **Note 8 → line 20.** "大脑会数拍子" is now **"大脑跟着节拍，[预判]高潮何时来"** (#5: "temporal cues signaling that a potentially pleasurable auditory sequence is coming … reward prediction"; tempo from #33).
- **Note 9 → jargon.** "晚到两小节" is now **"晚到[4秒]"** in lines 21 and 24 (two measured breath bars = 4.03 s in segments.json; #33). Line 29 is now **"起疙瘩的片段里，[中高音]突然变响"** (#18); "920–4400 Hz" moves to the frequency strip in the picture. Line 30 "声部" is now **"所有乐器[一下全回来]"** (#28).
- **Note 10 → lines 5, 6.** Line 5 is now **"同一段莫扎特，38人只有[7人]起疙瘩"** (#16; 15 by pace.py count). Line 6 is now **"起疙瘩时，大脑[奖赏区]被调动"** (#1), so it reads on its own.
- **Note 11 → line 9.** It is now **"剪四刀。第一刀：[删掉]高潮"**. The 1/4…4/4 counter stays in the picture.
- **Note 12 → end card.** Neither facts.md nor the music README gives the track's real name, so the end card carries the placeholder **"BGM：频道配乐"** for the producer to fill from the owner. The pinned comment gets the same name.
- **Note 13 → line 33.** It is now **"然后在那一拍，刚好[喂饱]你。"**
- **Unchanged, as the notes asked:** line 1 on frame 0, "1分21秒 + 剪掉呢？" by 0:03, "听——" into the breath, the title card on the hardest drop (now film 8.10), the four-cut structure and counter, Demo 3 in full ("……还没来？", "更爽，还是更烦？"), the 24个人 + 少了约三成 + 30→21 bars, the 示意 meter that never hits zero, no subtitles over any drop, the muffled bed under the band line, the sweep payoff with 预测·等待·兑现 as track labels, the 不能吃 → 吊你胃口 / 喂饱你 callback, the end-card question.

**Title:** 鸡皮疙瘩在等什么 (the director's top pick; the owner will confirm). Alternatives kept for the owner: 我把高潮剪掉了 (strongest click, but it reads 擦边 in a feed: the owner's risk), 为什么偏偏是这一秒 (weakest as a cover).

**Logline:** 我们把这部片子自己的背景音乐当场剪了四刀（删掉高潮、删掉铺垫、让高潮晚到4秒、把高音闷住），你用耳朵听鸡皮疙瘩变弱或变强，每一刀配一个研究结论。
**Takeaway:** 鸡皮疙瘩 = 大脑先预判，再等待，然后刚好兑现。音乐不能吃，但它会吊你胃口。
**Length:** 123.53 s (producer's measured cut). 36 subtitle lines. Subtitle-only; the owner's bgm is the only sound.

Picture vocabulary (look-neutral): **the track** is a row of per-bar loudness with the parts 铺垫 / 吸气 / 高潮, a track timecode and a playhead. **The edit** is a visible tool acting on the track at the frame the sound changes. **The inside meter** shows the expected response; it is an illustration tagged "示意" and never reaches zero.

## Beat sheet
| Beat | Film | Segments | Purpose |
|---|---|---|---|
| Hook | 0–8.10 | hook | Own experience + topic on frame 0; 1分21秒 + 剪掉呢？ by 0:03; "听——" into the breath |
| Title | 8.10–12.16 | title | 鸡皮疙瘩在等什么 slams on the hardest drop |
| Setup | 12.16–26.33 | bed1 | 不是人人都会 (7 of 38) → 奖赏区 → 美食、金钱 → **paradox: 可音乐又不能吃，凭什么？** |
| Demo 1 + twist | 26.33–44.4 | cut1, sil1, bed2 | Drop deleted → silence → 少了点什么？ → 24 people, ~30 % fewer → **twist: the seconds before matter too** |
| Demo 2 | 44.4–64.4 | cut2, drop2, bed3 | Drop with no build → open question → 高潮之前大脑已在兴奋 → 等待本身就是奖励 → 大脑预判高潮何时来 |
| Demo 3 | 64.8–86.7 | cut3, wait3, drop3, bed4 | Drop 4 s late → 还没来？ → 更爽还是更烦？ → 预期理论：紧张 → 铺垫、拖延、兑现 |
| Demo 4 | 86.9–104 | bed4 end, cut4, drop4, bed5 | Highs muffled → 闷了 → 中高音突然变响 → 所有乐器一下全回来 |
| Payoff | 104–119.4 | bed5 end, sweep, breath, final | 还给你 → filter opens → original breath → full drop → 吊你胃口 / 喂饱你 |
| End card | 119.4–123.53 | outro | 发给谁 |

## Lines (film time = segment film_from + at)
| # | Seg | At | Start | End | Line (≤ 16 字) | n | Needs | Picture (what is on screen) | Fact # |
|---|---|---|---|---|---|---|---|---|---|
| 1 | hook | 0.00 | 0.00 | 2.75 | 听歌起过[鸡皮疙瘩]吗？ | 9 | 2.39 | Frame 0 already full: the track fills the frame, playhead at 01:13 in 铺垫; 吸气 and 高潮 ahead; meter low, climbing. | viewer |
| 2 | hook | 2.75 | 2.75 | 5.80 | 这首歌高潮在1分21秒。[剪掉]呢？ | 13 | 2.96 | Marker drops on 01:21 at the 高潮 clip; the cutting tool hovers beside it. | #28 (owner marker) |
| 3 | hook | 5.90 | 5.90 | 8.00 | 听—— | 1 | 1.24 | The playhead enters 吸气 (film 6.08); the picture holds still; the meter trembles near the top. | — |
| — | title | — | 8.10 | 12.16 | TITLE CARD: 鸡皮疙瘩在等什么 | — | — | The title slams exactly on the drop; 高潮 lights; the meter jumps. | — |
| 4 | bed1 | 0.10 | 12.26 | 14.81 | 起了吗？[不是人人都会]。 | 9 | 2.39 | The title clears; the meter settles. | #10 (+#9) |
| 5 | bed1 | 2.65 | 14.81 | 18.16 | 同一段莫扎特，38人只有[7人]起疙瘩 | 15 | 3.24 | 38 dots, 7 light up; caption 莫扎特《安魂曲》选段 · Grewe 2007. | #16 |
| 6 | bed1 | 6.00 | 18.16 | 20.91 | 起疙瘩时，大脑[奖赏区]被调动 | 12 | 2.81 | A schematic 奖赏区 lamp switches on (no realistic brain). | #1 |
| 7 | bed1 | 8.75 | 20.91 | 23.66 | 和[美食]、金钱是同一套系统 | 11 | 2.67 | Food and coin icons feed the same lamp. | #2, #5 |
| 8 | bed1 | 11.50 | 23.66 | 26.28 | 可音乐又不能吃，[凭什么]？ | 10 | 2.53 | The food icon falls away; only the track feeds the lamp; a big "?". | #35 |
| 9 | cut1 | 0.05 | 26.38 | 29.03 | 剪四刀。第一刀：[删掉]高潮 | 10 | 2.53 | Back to the track; the tool cuts the 高潮 clip out, leaving a hatched gap 已删除; counter "1/4". | — |
| 10 | cut1 | 2.80 | 29.13 | 30.68 | 听。 | 1 | 1.24 | Still; the playhead runs through the build toward the gap; the meter climbs. | — |
| — | cut1→sil1 | — | 30.68 | 33.15 | (no subtitle: breath, then ≥ 0.75 s of pure silence) | — | — | The playhead crosses 吸气 and runs onto the hatched gap at 32.40 in silence. | — |
| 11 | sil1 | 0.75 | 33.15 | 35.55 | 是不是少了点什么？ | 8 | 2.24 | The meter hangs where it was, with a "?". Not zero. | self-test |
| 12 | bed2 | 1.15 | 35.56 | 38.36 | 科学家真这么做过：24个人 | 11 | 2.67 | 24 listener dots; caption Bannister & Eerola 2018. | #19 |
| 13 | bed2 | 3.95 | 38.36 | 41.56 | 删掉那一段，鸡皮疙瘩[少了约三成] | 14 | 3.10 | Bars 原版 30 次 → 删掉后 21 次: shorter, not zero. | #19, #34 |
| 14 | bed2 | 7.15 | 41.56 | 44.41 | 而高潮[之前]那几秒，同样关键 | 12 | 2.81 | The highlight slides from 高潮 back onto 铺垫 + 吸气. | #20 |
| 15 | cut2 | 1.95 | 44.45 | 47.30 | 第二刀：删掉铺垫，[直接]给高潮 | 12 | 2.81 | 高潮 is restored; 铺垫 + 吸气 are removed and the gap closes, so the quiet part sits against the drop; counter "2/4". | — |
| 16 | cut2 | 4.80 | 47.30 | 48.55 | 听。 | 1 | 1.24 | Still; the playhead in the quiet part, heading for the drop; the meter flat. | — |
| — | drop2 | — | 48.58 | 50.88 | (no subtitle: the drop with no build) | — | — | The drop hits; the meter moves without a build-up behind it. | — |
| 17 | drop2 | 2.30 | 50.88 | 53.58 | 没有铺垫，还一样带劲吗？ | 10 | 2.53 | Hold on the drop. | self-test (open) |
| 18 | bed3 | 0.95 | 53.59 | 57.34 | 扫描发现：高潮[之前]，大脑已在兴奋 | 14 | 3.10 | The meter splits into two lamps. **等待** (tag 尾状核) lights over 铺垫, *before* the drop; caption Salimpoor 2011. | #4 |
| 19 | bed3 | 4.70 | 57.34 | 60.79 | [等待]本身，就是奖励的一部分 | 12 | 2.81 | The **兑现** lamp (tag 伏隔核 · 多巴胺) lights at the drop; both lamps on, and the 等待 lamp sits over the part cut in Demo 2. | #3, #4, #5 |
| 20 | bed3 | 8.15 | 60.79 | 64.39 | 大脑跟着节拍，[预判]高潮何时来 | 13 | 2.96 | Track restored; beat ticks light along the bars ("每拍约0.5秒"); a ghost marker predicts the drop's position. | #5 (+#33) |
| 21 | cut3 | 0.05 | 64.84 | 67.34 | 第三刀：让它[晚到]4秒。 | 9 | 2.39 | The tool repeats 吸气 (×3); 高潮 slides right, away from the ghost marker, labelled "+4秒"; counter "3/4". | #33 (measured bars) |
| 22 | cut3 | 2.60 | 67.39 | 68.84 | 听。 | 1 | 1.24 | Still; the build with beat ticks. | — |
| — | wait3 | — | 68.84 | 71.10 | (no subtitle: breath 1; the predicted drop point passes at 70.86) | — | — | The playhead passes the ghost marker; nothing happens. | — |
| 23 | wait3 | 2.26 | 71.10 | 73.00 | ……还没来？ | 3 | 1.53 | The meter strains at the top. | — |
| — | wait3→drop3 | — | 73.00 | 77.18 | (no subtitle: breath 3, the late drop at 74.88) | — | — | The meter strains, then the drop lands 4 s late. | — |
| 24 | drop3 | 2.30 | 77.18 | 79.88 | 晚了4秒，更爽，还是更烦？ | 10 | 2.53 | Hold on the gap between the ghost marker and the real hit. | self-test (open) |
| 25 | bed4 | 1.00 | 79.94 | 83.34 | 预期理论：等它来时，人会先[紧张] | 13 | 2.96 | Label 紧张 stretched over the three 吸气 bars, widening; small caption Huron 2020. | #24 |
| 26 | bed4 | 4.40 | 83.34 | 86.74 | 电子舞曲的套路：铺垫、拖延、兑现 | 13 | 2.96 | The whole song shape zoomed out (dip at the break, climb, maximum at the drop) labelled 铺垫 · 拖延 · 兑现; caption Solberg & Dibben 2019. | #30 (+#28) |
| 27 | bed4 | 8.00 | 86.94 | 89.44 | 第四刀：把高音[闷住]。 | 8 | 2.24 | A filter knob/curve appears and closes at 89.06; the top of every bar dims; counter "4/4". | — |
| 28 | cut4 | 0.50 | 89.56 | 91.06 | 听。 | 1 | 1.24 | Still; the muffled build. | — |
| — | cut4→drop4 | — | 91.06 | 95.31 | (no subtitle: muffled breath and drop at 93.11) | — | — | The drop lands, but the 高潮 clip stays dull-coloured (brightness missing). Equal meter height only if the editor's ±1 LU match holds (note 2). | — |
| 29 | drop4 | 2.20 | 95.31 | 97.66 | 高潮还在，却[闷]了。 | 7 | 2.10 | Hold. | self-test |
| 30 | bed5 | 0.50 | 97.66 | 101.01 | 起疙瘩的片段里，[中高音]突然变响 | 14 | 3.10 | Frequency strip: the band **920–4400 Hz** highlighted, and the filter curve shows this is exactly the band removed; caption Nagel 2008. | #18 |
| 31 | bed5 | 3.85 | 101.01 | 103.96 | 高潮时，所有乐器[一下全回来] | 12 | 2.81 | Layer stack (bass / drums / highs): all return on the drop line at once. | #28 |
| 32 | bed5 | 6.80 | 103.96 | 106.31 | 现在，全部[还给你]。 | 7 | 2.10 | The cut, delay and filter marks peel off; the knob starts to open at 105.27. | — |
| 33 | sweep | 1.05 | 106.32 | 107.82 | 听。 | 1 | 1.24 | Still; the bars brighten as the filter opens; the meter climbs. | — |
| — | sweep→final | — | 107.82 | 113.73 | (no subtitle: the payoff) | — | — | Original breath (109.32), then the **final full drop at 111.33**: 高潮 fully lit, meter at the top, track labels (not subtitles) 预测 · 等待 · 兑现 on 铺垫 / 吸气 / 高潮. | — |
| 34 | final | 2.40 | 113.73 | 116.58 | 音乐不能吃，但会[吊你胃口] | 11 | 2.67 | The food icon returns beside the track; the 等待 lamp glows over 铺垫. | takeaway (#4, #5, #30) |
| 35 | final | 5.25 | 116.58 | 119.38 | 然后在那一拍，刚好[喂饱]你。 | 11 | 2.67 | The 兑现 lamp glows on the drop's downbeat. | takeaway (#3, #4) |
| 36 | outro | 2.00 | 119.42 | 123.32 | 你会发给哪个听歌起疙瘩的朋友？ | 14 | 3.10 | End card (see below). | — |

Pace check (`pace.py lines.json --film-end 123.53`): **0.0 s waiting (0 %)**, no TOO FAST lines. No-subtitle windows, all named listening beats: 8.0–12.3 title on the hardest drop; 30.7–33.1 breath + silence (Demo 1); 48.5–50.9 drop with no build; 68.8–71.1 breath 1 / missed drop point; 73.0–77.2 breath 3 + late drop; 91.1–95.3 muffled breath + drop; 107.8–113.7 payoff.

Lines per segment: hook 3 · title 0 · bed1 5 · cut1 2 · sil1 1 · bed2 3 · cut2 2 · drop2 1 · bed3 3 · cut3 2 · wait3 1 · drop3 1 · bed4 3 · cut4 1 · drop4 1 · bed5 3 · sweep 1 · breath 0 · final 2 · outro 1 (= 36).

## Demos (what each proves)
| Demo | Segments | What the ear gets | What it teaches | Science |
|---|---|---|---|---|
| Hook | hook, title | build → breath → hardest drop | the reference; the title lands on it | — |
| 1 | cut1, sil1 | build, breath, 2.01 s silence | the peak release matters; the moments before it matter too | #19, #34, #20 |
| 2 | cut2, drop2 | quiet bars → drop, no build | anticipation is part of the reward | #3, #4, #5 |
| 3 | cut3, wait3, drop3 | breath ×3, drop 4 s late | prediction + tension; 铺垫·拖延·兑现 | #5, #24, #30 |
| 4 | cut4, drop4, bed5 | muffled build and drop | contrast: chill passages get brighter (920–4400 Hz) | #18, #28 |
| Payoff | sweep, breath, final | filter opens → original breath → full drop | everything given back | — |

## Claims check
- "1分21秒" = track position of the measured drop (81.42 s, the owner's marker); shown as the track timecode.
- "4秒" = two extra breath bars in segments.json (2 × 2.014 s = 4.03 s); tempo per #33.
- "少了约三成" always paired with "24个人"; bars 30 → 21; line 11 is a question, not a result.
- Lines 18–19: "高潮之前大脑已在兴奋" (#4); 多巴胺 only as the 兑现 lamp tag (#3). No timer and no "15 秒" (#5).
- Line 25: "预期理论" + Huron 2020 caption; tension preceding an anticipated event (#24). No body wording.
- Only 美食、金钱 named (#2, #5). No drugs, no sex.
- Demos 2 and 3 end in open questions; no study claims a delay or a breath gives more chills (#32).

## End card
Question (subtitle): 你会发给哪个听歌起疙瘩的朋友？ · Comment prompt: 你在哪首歌的哪一秒起过鸡皮疙瘩？（评论区报歌名+秒数） · @ prompt: 发给那个听歌会起鸡皮疙瘩的朋友 / 做音乐的朋友 · **BGM：频道配乐** (placeholder: the producer fills in the real title/artist from the owner, on the end card and in the pinned comment, as "音乐：<title> — 本片现场剪辑") · Sources: Blood & Zatorre 2001 PNAS; Salimpoor et al. 2011 Nat Neurosci; Grewe et al. 2007 Emotion; Jain et al. 2023 Front Neurosci; Bannister & Eerola 2018 Front Psychol; Huron 2020 J Conscious Stud; Solberg & Dibben 2019 Music Percept; Nagel et al. 2008 Musicae Sci.
