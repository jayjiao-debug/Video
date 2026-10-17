# Script: 一耳朵听出曲风  (v1)

**Logline:** You can tell a genre from a quarter of a second of sound, but you can't say why. We play ONE melody of our own in 8 genres. Only the style changes, so you can hear the 4 clues that give a genre away.
**Takeaway:** 听歌认曲风，问4个问题：鼓点落在哪一拍？直的还是摇摆？比走路快还是慢？谁的声音最显眼？
**Length:** 2:13.3 (133.29 s) · subtitle-only, no voiceover · 44 lines · pace check: 0 % waiting, only flag = the planned title gap 18.5–22.0 s.

## Title options (≤ 10 字)
1. **同一段旋律，8种曲风** (10) — RECOMMENDED. It names the film's device exactly: the viewer knows what they will hear and wants to hear it happen. It has a concrete number. It cannot overclaim, because it promises nothing the film doesn't do.
2. **4步听出曲风** (6) — the practical payoff as a promise: short, concrete, a skill to show off to friends. It is honest because the film ends on exactly those 4 steps, and the quiz shows that one step alone isn't enough.
3. **你怎么听出是爵士？** (9 incl. ？) — starts from the viewer's own experience ("I can tell, but how?"), which is the hook's tension. Plain reading = the film explains how you recognise jazz and the other genres: true. **Optical-centring rule:** the title ends in a full-width ？, so the art director / animator must pull back its trailing half-em (`<span style={{marginRight:'-0.5em'}}>？</span>` or shift the line +0.25em) and check the centring on the rendered pixels.

Rejected: "0.25秒听出曲风" (the study shows guesses above chance, not recognition: overclaim) and "曲风，听鼓就知道" (the film's own quiz shows that drums alone fool you).

## Beat sheet
| Beat | Time | Purpose | What the viewer learns / feels |
|---|---|---|---|
| Hook | 0.0–16.2 | 8 genre snippets of 0.25 s each fire on frame 0; surprise number by 0:03 | "I really can tell them apart that fast… but I can't say why." Promise: 4 clues, 8 genres, one melody. |
| Setup | 16.2–20.0 | the control: the bare melody | This is the one thing that will NOT change. |
| Title | 20.0–22.0 | title on the hardest drop (rock band enters) | — |
| Clue: where the drums hit | 22.0–35.7 | rock (kick 1 & 3, snare 2 & 4 = 动次打次) → house (kick on every beat = walking pace) | drum position is a fingerprint; tempo ≈ walking pace |
| Clue: straight vs swing | 35.7–43.7 | jazz at the SAME 120 as rock: long-short | swing = 蹦蹦跳跳, rock = 齐步 |
| Clue: fast vs slow + signature sound | 43.7–62.9 | lo-fi (slower than walking, crackle) → reggae (beat 1 empty, the 嚓) | slow + one sound can name a genre |
| Twist / quiz | 62.9–77.9 | play a clip whose kick is on every beat (lure: "House!"); reveal it is reggae | one clue alone fools you, so listen for several |
| Evidence | 77.9–101.2 | bossa (one guitar = band) → trap (fast hats, sparse snare: feels both fast and slow) → metal (why only 2 notes) | each adds a NEW clue/why; energy rises to the climax |
| Payoff | 101.2–122.7 | the bare melody again: "一个音都没改"; the 4-question checklist over the rock groove | the takeaway, usable tomorrow |
| End card | 123.2–133.3 | unlabelled bonus clip (reggaeton, never named on screen) + comment question | answer in comments using the 4 steps |

## Music plan (everything synthesized in code; one original melody; all BPMs are 估算 demo choices unless a row is cited)

**The theme (never changes pitch):** A minor, 2 bars of 4/4.
- Bar 1 (chord Am): A4 ♩ · C5 ♪ · E5 ♪ · D5 ♩ · C5 ♩
- Bar 2 (chord F for beats 1–2, G for beats 3–4): C5 ♩ · A4 ♩ | B4 ♩ · G4 ♩
- Same pitches, same order, same octave (A4–E5) in every genre, so line 35 "旋律一个音都没改" is literally true. Only the rhythm feel may change (swing pairs C5–E5 long-short in jazz/lo-fi; bossa may anticipate a note by ≤ one 8th). Lead instrument changes per genre (listed below). Lo-fi/jazz may colour the chords (7ths/9ths); metal bars 3–4 deliberately use complex chords (see metal).
- Grid convention (facts.md): 16 steps per bar, beats on steps 1/5/9/13. K = kick, S = snare/clap/rim, H = hi-hat.
- Transitions: every segment starts on its own downbeat, straight after the last bar of the previous one. The last beat of each segment carries a 1-beat fill or riser into the new tempo. No silence and no fades to nothing (owner rules). Keep it pleasant at −14 LUFS.

| # | Segment | Time (s) | BPM | Bar (s) | Bars | Grid (16 steps) | Bar by bar: who enters / leaves | What the demo isolates | Rows |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Hook scan | 0.00–4.00 | 120 | 2.000 | 2 | — | 8 snippets × 0.25 s, one on every beat (0.0, 0.5 … 3.5), cut from the FINISHED genre renders at a moment with a drum hit + the signature sound. Order: 摇滚, 爵士, House, 雷鬼, Trap, 金属, Lo-fi, 波萨诺瓦. The 0.25 s between snippets = a soft tick (no hiss, no silence). | a quarter second is enough to tell them apart | 1 |
| 1 | Hook bed | 4.00–16.00 | 120 | 2.000 | 6 | tick on each beat | warm pad on the theme chords (Am \| F G, looping), quiet tick = the empty grid's playhead, low-pass opening slowly over 6 bars. No drums. | nothing; calm under 5 lines, building | — |
| 2 | Theme | 16.00–20.00 | 120 | 2.000 | 2 | — | piano plays the theme alone (pad drops out on bar 1's downbeat); reverse-cymbal swell over the last 2 beats into the drop | the control: melody only | — |
| 3 | Rock | 20.00–28.00 | 120 | 2.000 | 4 | K 1, 9 · S 5, 13 · H 1,3,5…15 (8ths) | b1 **DROP + TITLE**: drums + bass 8ths + crunchy (light overdrive) guitar chords + theme on lead guitar · b2 theme part 2, band −8 dB so kick/snare lead · b3 drums ALONE ("动次打次" = K-H-S-H) · b4 drums + bass + guitar, fill into house | kick vs snare positions | 12, 18 |
| 4 | House | 28.00–35.74 | 124 | 1.9355 | 4 | K 1,5,9,13 · clap 5,13 · open H 3,7,11,15 | b1 kick + clap ALONE · b2 + off-beat open hat + bass · b3–4 + theme on synth pluck over a pad that ducks on every kick (sidechain pump) | kick on every beat; pace ≈ walking | 7–9, 19, 35 |
| 5 | Jazz swing | 35.74–43.74 | 120 (same as rock), swing ≈ 2:1 | 2.000 | 4 | ride 1,5,9,13 + swung "哒" at ⅔ of beats 2 and 4 · hi-hat foot 5,13 · no backbeat snare | b1 ride + hat foot ALONE ("叮——叮哒") · b2 + walking bass, one note per beat · b3–4 + piano theme, 8th pairs swung | straight vs swing at an identical tempo | 21, 23 |
| 6 | Lo-fi | 43.74–53.34 | 75 | 3.200 | 3 | K 1,(8),11 · S 5,13 · H swung 8ths, soft | vinyl crackle all through · b1 loose, relaxed drums + crackle + Rhodes 7th/9th chords (Am9 \| Fmaj7 G6) · b2–3 theme on muffled e-piano (low-pass ≈ 5 kHz, slight wow) | slower than walking; crackle; lazy drums | 11, 36 |
| 7 | Reggae (one drop) | 53.34–62.94 | 75 (slow count: drop on beat 3) | 3.200 | 3 | K+rim 9 only; step 1 empty · H swung 8ths · skank on 5, 13 | b1 drums ALONE, and leave the beat-1 hat out too so the hole is audible · b2 + bass + skank (short muted guitar chord stabs, organ doubling) + theme on melodica · b3 theme part 2 | the empty first beat; the "嚓" | 15, 24, 25 |
| 8 | Quiz (reggae "steppers") | 62.94–77.94 | 80 | 3.000 | 5 | K 1,5,9,13 · rim 9 · H swung 8ths · skank 5,13 | b1–2 unlabelled clip: the kick on every beat is loud (the lure), skank + organ theme a little back. Countdown ticks 3-2-1 on beats 2-3-4 of b2 (66.69 / 67.44 / 68.19) · b3 (68.94) REVEAL: same groove, skank +6 dB · b4–5 groove continues, fill into bossa | the lure (kick every beat) vs the real tells (slow + 嚓) | 15, 25, 26 |
| 9 | Bossa nova | 77.94–85.33 | 130 | 1.8462 | 4 | guitar thumb (bass) 1, 9 · finger chords syncopated (e.g. 1,4,7,11,14) · optional shaker, very soft | b1 nylon guitar ALONE (thumb + fingers) · b2–3 + theme on a soft, breathy flute-like tone · b4 + brushes, whisper quiet | one guitar does the whole rhythm section | 37 |
| 10 | Trap | 85.33–92.18 | 140 (felt 70) | 1.7143 | 4 | K 1 + syncopated (e.g. 8, 11), long 808 · S 9 only (half-time) · H 8ths + 1/16, 1/32 and triplet rolls | b1 808 + snare ALONE, no hats · b2 + hats in 8ths, first roll starts on beat 3 (87.90, with line 30) · b3 + theme on bell pluck, 1/32 "zipper" rolls · b4 808 glide on the last note | sparse snare vs very fast hats = fast AND slow | 10, 20, 28 |
| 11 | Metal | 92.18–101.18 | 160 | 1.500 | 6 | K 16ths (double kick) · S 5,13 · crash on 1 | b1–2 full metal: palm-muted power-chord riff (root + 5th) + theme on lead guitar · b3–4 SAME drums, but rhythm guitar plays complex chords (Am7add9, Fmaj7, G with 3rds) at heavy distortion → audibly muddy · b5–6 back to power chords + theme, the film's loudest moment, choke on beat 4 | distortion + why only 2 notes (A/B) | 31, 32 |
| 12 | Payoff: piano | 101.18–107.18 | 120 | 2.000 | 3 | — | b1–2 the bare piano theme, identical to 0:16 · b3 piano holds + drum fill over the last 2 beats | proof: the melody never changed | — |
| 13 | Payoff: band | 107.18–123.18 | 120 | 2.000 | 8 | rock grid | the title-drop rock arrangement, theme ×4, counter-melody on the 2nd pass; ends on a downbeat hit + ring | home; checklist bed | — |
| 14 | End card | 123.18–133.29 | 95 | 2.5263 | 4 | K 1,5,9,13 · S 4,7,12,15 · closed H 1,5,9,13 | unlabelled bonus clip: theme on marimba-like pluck + bass; one fade over the final bar, ending exactly on the downbeat | bonus quiz (answer = Reggaeton; never named on screen) | 14, 30 |

Why metal gets 6 bars (not 2–4): the A/B (normal → muddy → clean) needs 2 bars each. At 160 BPM, 6 bars = 9.0 s, about the same time as 4–5 bars of the slower genres.

## Picture system (for the art director; the look is yours)
One **beat grid** stays on screen all film: 4 rows × 16 steps, filling most of the frame. Rows: 底鼓 / 军鼓 / 踩镲 / 招牌 (the 4th row is renamed per genre: 电吉他, 合成器, 叮叮镲, 黑胶, 吉他"嚓", 尼龙吉他, 808, 失真吉他). Every cell lights on its hit, a playhead sweeps each bar, and big beat numbers **1 2 3 4** sit above steps 1/5/9/13. Also on screen: a **genre tag** (big, top-left) and a **tempo meter** (BPM number + a "走路 ≈120" footprint mark, so faster/slower than walking is visible). For swing, the second dot of each pair visibly slides late. The signature instrument gets a spotlight or glow on its row. No real songs, no brands (generic drum machine), no flags/maps, no smoke/leaf/skull imagery, no people's appearance as genre stereotypes.

## Lines
n = characters as pace.py counts them; Need = 0.5 + n/7 + 0.6 s. All lines ≤ 16 characters as displayed.

| # | Start | End | Line (≤ 16 字) | n | Need | Music at this moment | Picture (what the viewer sees) | Fact # |
|---|---|---|---|---|---|---|---|---|
| 1 | 0.00 | 2.60 | 只听[0.25秒]，就猜得出曲风 | 10 | 2.53 | Seg 0: snippets fire on every beat from frame 0 | Frame 0: the grid is already full-frame and flashing the rock pattern. A genre tag flips like a split-flap board on every snippet (摇滚→爵士→House…). A small stopwatch arc labelled 0.25秒 fills and empties with each snippet. | 1 |
| 2 | 2.60 | 5.50 | 实验里，猜对的明显比瞎猜多 | 12 | 2.81 | snippets end at 4.0 → pad + tick | The flipping board stops. Two bars rise: a dashed line "瞎猜" and a bar "实际猜对", clearly taller. No numbers. | 1 |
| 3 | 5.50 | 8.10 | 学没学过音乐，几乎一样 | 10 | 2.53 | pad + tick | Two headphone icons, "学过音乐" / "没学过", with bars of equal height. | 2, 5 |
| 4 | 8.10 | 11.00 | 你听得出来，却说不出为什么 | 12 | 2.81 | pad, filter opening | The grid empties; one big "？" sits in the middle of it, the playhead still sweeping. | — (framing) |
| 5 | 11.00 | 13.60 | 其实，靠[4个线索]就能说清 | 11 | 2.67 | pad builds | 4 empty slots appear under the grid, each with a lock icon (the clues to unlock). | — (framing; the 4 clues = brief takeaway) |
| 6 | 13.60 | 16.20 | 同一段旋律，换成[8种曲风] | 11 | 2.67 | pad builds | 8 genre tags line up in a row like tracks on a playlist, all greyed out. | — (device) |
| 7 | 16.20 | 18.50 | 先听原版：只有旋律 | 8 | 2.24 | Seg 2: piano theme alone | All drum rows are dark. Only a melody lane lights up, one dot per note (8 notes in 2 bars). | — |
| — | 18.50 | 22.00 | *(no subtitle: listen + TITLE)* | | | 18.5–20.0 theme bar 2 + swell; **20.00 DROP** into rock | 20.00: the title slams in on the drop, built out of grid cells lighting up together, then settles to the top. | — |
| 8 | 22.00 | 24.75 | [摇滚]：底鼓1、3拍，军鼓2、4拍 | 12 | 2.81 | Seg 3 b2: drums forward | Tag 摇滚. Kick cells under 1 and 3 and snare cells under 2 and 4 flash bright; the other rows dim. | 18 |
| 9 | 25.00 | 27.50 | 就是常说的“动次打次” | 9 | 2.39 | b3: drums ALONE | Each hit gets its syllable popping out of its cell in time: 动 (kick), 次 (hat), 打 (snare), 次 (hat). | 18 |
| 10 | 28.00 | 30.42 | [House]：每一拍都踩底鼓 | 8 | 2.24 | Seg 4 b1: kick + clap alone | Tag House. The kick row lights on all 4 beats; a footprint lands under each kick. | 19 |
| 11 | 30.42 | 33.08 | 像走路：人每分钟约走120步 | 11 | 2.67 | b2: + off-beat hat, bass | A walking-figure icon (or footprints) steps in sync along the bottom; the tempo meter shows "走路 ≈120". | 7 |
| 12 | 33.08 | 35.74 | 最常见的舞曲速度：120拍左右 | 12 | 2.81 | b3–4: + synth theme, pad pumping | Tempo meter: the needle sits at 124, right next to the 120 footprint mark. The pad bar shrinks on every kick (the pump). | 8, 9 |
| 13 | 35.74 | 38.49 | [爵士]：节奏一长一短，叫“摇摆” | 11 | 2.67 | Seg 5 b1: ride + hat foot alone | Tag 爵士. The hat row becomes 叮叮镲: in each pair of dots, the second slides visibly late (long gap, short gap). | 21 |
| 14 | 38.49 | 40.99 | 叮——叮哒，像蹦蹦跳跳 | 8 | 2.24 | b2: + walking bass | The footprints now skip: long step, short step (a bouncy hop path). The bass row lights once per beat, each dot at a different height. | 21, 23 |
| 15 | 40.99 | 43.69 | 前面的摇滚：一样长，是“直”的 | 11 | 2.67 | b3–4: + swung piano theme | Split row: top = 摇滚 dots evenly spaced (直), bottom = 爵士 long-short pairs (摇摆), a ruler between them. | 18, 21 |
| 16 | 43.74 | 46.54 | [Lo-fi]：每分钟70到80拍 | 9 | 2.39 | Seg 6 b1: loose drums + crackle + Rhodes | Tag Lo-fi. The tempo needle swings DOWN to 75, well left of the 120 walking mark. The whole grid tints warm and faded. | 11 |
| 17 | 46.54 | 49.74 | 比走路还慢，鼓也懒懒散散 | 11 | 2.67 | b2: theme enters, muffled | The footprints slow to a stroll. The drum cells light slightly blurred and wobbly, never quite on the line. | 11, 36 |
| 18 | 49.74 | 53.24 | 背景一直“沙沙”响，像老唱片 | 11 | 2.67 | b3: crackle forward | The 招牌 row is renamed 黑胶: dust specks crackle across it continuously; a spinning record icon. | 36 |
| 19 | 53.34 | 56.54 | [雷鬼]常见打法：第一拍空着 | 11 | 2.67 | Seg 7 b1: drums ALONE, hole on beat 1 | Tag 雷鬼. Step 1 of the kick row is outlined but EMPTY (a pulsing dashed box); the kick + rim light together under beat 3. | 24 |
| 20 | 56.54 | 59.34 | 像下楼梯，一脚踩空 | 8 | 2.24 | b2: + bass, skank, melodica theme | A little staircase of 4 steps along the bottom; the first step is missing, and the foot drops through to land on step 3. | 24 |
| 21 | 59.34 | 62.84 | 吉他只弹短短的“嚓、嚓” | 9 | 2.39 | b3: skank forward | The 招牌 row = 吉他"嚓": short, sharp flashes, each with a small "嚓" stamp. | 25 |
| 22 | 63.13 | 65.75 | 考考你：这段是哪种？ | 8 | 2.24 | Seg 8 b1: unlabelled clip | QUIZ card: the genre tag is replaced by "？". Three answer buttons: A House · B 雷鬼 · C 摇滚. The grid plays normally: the kick lights on every beat (the lure), the 嚓 row too. | — |
| 23 | 65.75 | 68.00 | 先在心里选一个 | 7 | 2.10 | b2; ticks 66.69 / 67.44 / 68.19 | Big countdown 3 · 2 · 1 on the beats. | — |
| 24 | 68.94 | 71.94 | 是[雷鬼]！它也能每拍踩底鼓 | 11 | 2.67 | b3 REVEAL: skank +6 dB | On the downbeat, B 雷鬼 lights green; A House gets a "差一点" shake. The kick row stays lit on every beat. | 26 |
| 25 | 71.94 | 74.75 | 但它很慢，吉他还在“嚓” | 9 | 2.39 | b4 | Two clue cards pop beside the grid: the tempo needle (far left of the walking mark) and the 嚓 row glowing. | 15, 25 |
| 26 | 74.75 | 77.84 | 只听一个线索，容易被骗 | 10 | 2.53 | b5, fill into bossa | One lock in the 4-slot row (from line 5) half-opens and snaps shut again: one key isn't enough. | 26 (note) |
| 27 | 77.94 | 81.40 | [波萨诺瓦]：一把吉他就是乐队 | 12 | 2.81 | Seg 9 b1: nylon guitar ALONE | Tag 波萨诺瓦. All 4 rows light, yet one guitar icon feeds every row (lines from the guitar into each row). Soft, low-contrast glow: the quietest frame of the film. | 37 |
| 28 | 81.40 | 85.28 | 拇指当底鼓，其他手指当打击乐 | 13 | 2.96 | b2–4: + breathy theme, brushes | A simple hand outline: the thumb is linked to the kick row, the fingers to the percussion row; both light on their hits. | 37 |
| 29 | 85.33 | 87.90 | [Trap]：军鼓隔好久才“啪”一下 | 10 | 2.53 | Seg 10 b1: 808 + snare alone | Tag Trap. The snare row has ONE lit cell per bar (step 9); long empty stretches either side. The 808 cell glows long and low. | 20, 28 |
| 30 | 87.90 | 90.12 | 踩镲快得像拉拉链 | 8 | 2.24 | b2 beat 3: first hat roll | The hat row subdivides on screen (8ths → 16ths → 32nds) until the cells blur into a zipper sliding across. | 28 |
| 31 | 90.12 | 92.46 | Trap听起来又快又慢 | 8 | 2.24 | b3–4: rolls + bell theme, 808 glide | The tempo meter shows two needles at once: a fast one (hats) and a slow one (snare). | 10 |
| 32 | 92.46 | 95.00 | [金属]：吉他声被故意“弄脏” | 10 | 2.53 | Seg 11 b1–2: full metal | Tag 金属. The guitar row's waveform turns jagged and clipped; the tempo needle jumps far right (160). | 31 |
| 33 | 95.00 | 98.15 | 这时按复杂的和弦，容易糊成一团 | 14 | 3.11 | b3–4: complex chords, muddy | A chord shown as 4–5 coloured dots; under distortion they smear into one grey blob. | 32 |
| 34 | 98.18 | 101.18 | 所以常只弹两个音：又干净又重 | 13 | 2.96 | b5–6: power chords + theme, loudest | Only 2 dots remain, crisp and heavy (thick stroke); the grid hits hardest here. | 31, 32 |
| 35 | 101.31 | 104.43 | 8种曲风，旋律一个音都没改 | 12 | 2.81 | Seg 12: bare piano theme | The drum rows go dark; the melody lane from 0:16 lights again with the same 8 dots. The 8 genre tags stack above it, all pointing to the same dots. | — (device; true by construction) |
| 36 | 104.43 | 107.08 | 变的只是节奏、速度和乐器 | 11 | 2.67 | b3: hold + fill | Three labels slide onto the grid: 节奏 (drum rows), 速度 (tempo meter), 乐器 (招牌 row). | — |
| 37 | 107.18 | 109.93 | 下次听歌，问自己[4个问题] | 11 | 2.67 | Seg 13: rock band returns | The 4 locked slots from line 5 come back as a checklist board, one line per question (steps appear one per beat). | brief takeaway |
| 38 | 109.93 | 112.43 | 第一：鼓点落在哪一拍？ | 9 | 2.39 | rock groove | Slot 1 unlocks: kick/snare rows light, with tiny callbacks (动次打次 / 每拍都踩 / 第一拍空). | 18, 19, 24 |
| 39 | 112.43 | 114.93 | 第二：是直的，还是摇摆？ | 9 | 2.39 | rock groove | Slot 2: the 直 vs 摇摆 ruler from line 15. | 21 |
| 40 | 114.93 | 117.43 | 第三：比走路快，还是慢？ | 9 | 2.39 | rock groove, counter-melody | Slot 3: the tempo meter with the walking mark; Lo-fi on the left, Metal on the right. | 7, 11 |
| 41 | 117.43 | 119.93 | 第四：谁的声音最显眼？ | 9 | 2.39 | rock groove | Slot 4: a spotlight sweeps the 招牌 row icons (嚓, 黑胶, 尼龙吉他, 808, 失真吉他). | 25, 28, 31, 36, 37 |
| 42 | 119.93 | 122.68 | 4个一起听，才不容易被骗 | 11 | 2.67 | last bars, ending on the downbeat hit | All 4 slots lit at once and the checklist board snaps shut like a closed lock. | 26 |
| 43 | 123.34 | 126.50 | 最后一题：这段是什么曲风？ | 11 | 2.67 | Seg 14: unlabelled bonus clip | Juno end card. The grid plays the bonus pattern small on the card; the genre tag reads "？". | 14, 30 (not shown) |
| 44 | 126.50 | 129.50 | 用这4步听，评论区写答案 | 11 | 2.67 | bonus clip continues; one fade over the final bar to 133.29 | End card question + follow pill `关注 Juno · 一起看懂世界` + sources line; card holds to 133.29. | — |

## End card
- **Question for comments:** 最后一题：这段是什么曲风？用这4步听，评论区写答案
- **Pinned comment (producer, after publishing):** 答案：Reggaeton（雷鬼动）。底鼓每拍都踩，军鼓"嘣—嚓—嘣嚓"，直的，比走路慢（约95拍）。你答对了吗？ Rows 14 and 30 only. Do NOT mention who owns or invented the rhythm (row 43 is an ongoing lawsuit).
- **Alternative question** (if the director prefers a personal one): 你单曲循环的那首，用4步拆拆看？
- **Sources line:** Gjerdingen & Perrott 2008 (J. New Music Research) · Mace et al. 2012 (Psychology of Music) · MacDougall & Moore 2005 (J. Appl. Physiol.) · Dahl et al. 2014 · Open Music Theory · Winston & Saywood 2019 · Neal 2022 · Herbst 2017, 2019 · Smithsonian 2019 · Modern Drummer 2018 · MusicRadar · TIDAL 2020

## Wording decisions (for the director and cold reader)
- **Hook number:** "就猜得出曲风" + the next line "猜对的明显比瞎猜多" keeps the claim at "above chance" (row 1). No % on screen: 44 % is agreement with the listener's own 3-second answer, not accuracy (row 2). "学没学过音乐，几乎一样" rests on row 2 (43 % ≈ 44 %) and row 5 (training made no difference).
- **Reggae:** "常见打法：第一拍空着" holds in both counts (row 24). I chose "常见" so the quiz reveal (reggae can also kick every beat, row 26) doesn't contradict it. The guitar is described by its sound ("短短的嚓、嚓"), not its position: in the slow count the skank sits ON beats 2 and 4, so "拍子中间" would be wrong there (row 25).
- **Trap:** I used "军鼓隔好久才'啪'一下" instead of "军鼓每小节只打一下". The latter is true only in the fast count; row 28 says slow-feel listeners hear the snare on beat 2 (so twice per slow bar). The grid is drawn in the fast count, so the picture still shows exactly one snare per bar.
- **Metal:** row 32 found major chords still pleasant with distortion; it was minor and altered (complex) chords that suffered. So the line says "复杂的和弦…容易糊", and "常只弹两个音" (metal "largely prefers" power chords). The demo uses minor-7th/add9 chords for the muddy bars.
- **Lo-fi:** "懒懒散散" = "loose, rhythmically relaxed" (row 36). I avoided "拖" (late), which the source doesn't say.
- **Dance tempo:** a comparison (像走路 / 最常见的舞曲速度), never "because we walk" (row 8 note).
- **Bossa:** rows 37's thumb/fingers description is of João Gilberto, the style's pioneer. He is not named on screen.
- **Not used (time):** row 22 (swing ratio 1:1–3.5:1), row 41 (moombahton 130→108), row 40 (Warehouse). Each is true and verified, and each could replace a line if the director wants a different surprise.
- **Avoided risks:** no real songs or artists, no trap etymology, no smoke/leaf/skull imagery, no dembow lawsuit or origin, no brand drum machines, no flags or maps.
- **Density:** 0 % waiting. Every genre line plays over the exact sound it describes, so viewers read while they listen. If the director wants more pure-listening room, there is ~17 s of headroom to 150 s. The best places for 1 extra listen-only bar are the start of jazz, reggae and metal.
