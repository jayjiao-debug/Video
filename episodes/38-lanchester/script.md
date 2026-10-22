# Script v4 (as built): 为什么要"集中优势兵力" (2026-10-23)

**Source of truth:** `film/src/timeline.ts` (`T` table + `TIMELINE`), built by the producer from v3 + gate-1 director notes + cold read + facts.md (T5–T17, L9–L10, Changes) + music.md (Rynos Theme, 128 BPM, bar(k) = 0.045 + 1.875·k). This section only writes down what the code does; nothing here was changed in code.
**Logline:** 1000 v 500 leaves 866, not 500. The film replays that fight until the viewer can see why (count the balls → ×4 → squares), then shows the same arithmetic in a split enemy and at Trafalgar.
**Takeaway:** 同一时刻、同一地方，[比他多]。
**Length:** 176.3 s (bars 0–94), 19 shots, **24 subtitles**, all ≤ 13 字. pace.py: 0 too fast, 1 minor wait (人越少 +1.3 s), waiting 1 % (target ≤ 12 %). Every gap > 2 s is a named picture beat (hook battle + 866 + rewind, title, fan-out + first volley, the battle to 866, bullet-time counts, ×4 → overhead, fold + tape, the two waves, the climax, the van sailing away, quiet sea, end card).
**Files:** `lines.json` = the 24 subtitles below at their absolute times (regenerated from the code).

## Gate-1 notes → what changed (as built)
- Note 1 → squares are drawn off the firing lines (3-rank lines, edge = line length); tag "边长 = 一排人的长度"; four 500-squares tile the 1000-square.
- Note 2 → ★3 is a live replay: both squares lose area together; ⑫ = "每一刻，两边掉的面积[一样多]"; the lost area folds beside red's empty ghost ("一样大"), tape → 866.
- Note 3 → ⑲ = "两列，全压向[同一段]"; gold tracks + gold bracket on the attacked stretch, grey bracket on the van.
- Note 4 → "13 · 5 · 15" removed from screen (T3: Chan's model). See check 2, item F2: the van geometry still equals Chan's 13.
- Note 5 → 866 on the bar-8 lift (15.05), title on DROP 1 (bar 16, 30.05), climax on DROP 2 (bar 64, 120.05).
- Note 6 → ③ = "拼刺刀，只能[一对一]", mid-high camera, lunges + dust; tag "拼刺刀：剩 500".
- Note 7 → guns in 3-rank lines, swords in deep columns; shot 07 fans the columns (incl. the idle back half) into the line before the first volley.
- Note 8 → ratio tag reads "人数比 X : 1"; ×4 leaves before the overhead; ×1→×4 recounted on the tiling.
- Note 9 → bullet-time counts on objects ("1", "2", "½"); "火力 ×2" + "挨打 ÷2" merge into "战斗力 ×4"; no board.
- Note 10 → no split screen: 1000 v 1000, then two waves of 500 on one field; "打团最忌：一拨一拨上".
- Note 11 → no 2D inserts: 孙子 written in light on the grass + tag 《孙子·虚实篇》; sky bridge to the sea; Lanchester tag over the approach; memo overlay cut.
- Note 12 → ㉒ (Nelson's death) and the date tag cut; quiet sea has no text; a smoke bank carries the cut to land.
- Note 13 → dial cut; the limit is a messy dusk fight (smoke, idle flank companies).
- Note 15 → "1000² − 500² ≈ 866²".
- Note 16 → "直觉：500？" is a tick on a bar under the blue counter, from 7.3 s (after ② ends at 7.2).
- Note 18 → title held 2 bars; rewind 1 bar; ③ on the first bayonet frame.
- Researcher Changes → no 「一战前夕」 (1914 tag only); no 16→12 or memo quote on screen; tally "对方 损失一半以上" (T4/T14); 1914 on the law, 1916 on the Trafalgar analysis (L1, L10).

## Shot list (as built; times absolute, s)
| Shot | Bars | Start–end | Picture & camera (from the code) | On-screen text | Subtitle (in–out) | Fact |
|---|---|---|---|---|---|---|
| 01 Hook | 0–8 | 0.00–15.05 | Two firing lines, 1000 blue v 500 red, 3 ranks deep; the battle runs live from frame 0 (11 s of sim in 15 s, slowing at the end). Camera starts low behind the blue line at shoulder height, creeps in, cranes up and back from 3.8 s to a high wide at 7.5 s and keeps rising to a very high ¾ view. | Live counters blue / red (top corners). From 7.3: a thin bar under the blue counter, grey tick **直觉：500？**, blue dot at the live count. From 9.0: live blue/red curves along the bottom. | 0.10–3.40 你有1000人，对面500人 · 3.80–7.20 打光对面，你还剩[几个]？ | L4 |
| 02 866 | 8–10 | 15.05–18.80 | Battle over; camera eases down from the high view toward the blue block in smoke. | **866** slams at centre (15.05–18.65); guess bar fades out in 0.6 s; counters fade; **只倒下 134 人** 15.95–18.45 | — | L4 |
| 03 Rewind | 10–11 | 18.80–20.67 | The battle plays backwards: the fallen stand up, smoke goes back into the muzzles. Camera eases up and back; cooler grade. | ◀◀; counters roll back to 1000 / 500 | — | — |
| 04 Bayonets | 11–14 | 20.67–26.30 | Deep columns meet; men lunge one-on-one along the contact strip with dust puffs, 10× time-lapse. Camera 30–40 m up; at 3.75 s it pulls up and back to 70 m: the back half stands idle. | Counters fall in lockstep; tag **在排队** on the idle men from 23.87 | 20.72–23.57 拼刺刀，只能[一对一] · 23.67–26.17 多出的人，只能[排队] | L2 |
| 05 ★1 | 14–16 | 26.30–30.05 | Melee finishes; slow high orbit. | Guess bar back; at red 0: green **✓** by the blue counter + **拼刺刀：剩 500** (27.10–29.80) | 26.35–29.90 你的直觉，属于[冷兵器时代] | L2 (sim) |
| 06 Title | 16–18 | 30.05–33.80 | DROP 1. A smoke bank over the finished melee; the title condenses out of it (blur → sharp, slight scale-down); smoke clears and the exposure flares at the end (sun flare into 07). | 为什么要“集中优势兵力” | — | — |
| 07 Guns | 18–28 | 33.80–52.55 | Out of the flare the columns, including the idle back half, march and fan out into 3-rank lines (34.2–40.0) while the camera rises to a wide. First volley at 41.30 (bar 22) with the camera low behind blue; then the battle at 1×, camera pulling back to a high wide; red goes to 0, blue ends at 866. | Counters; from 42.0 gold **人数比 X : 1** (live) | 33.84–37.30 有了枪，[人人]都能开火 · 45.09–48.50 人越少，还手[越弱] | L2, L3, L4 |
| 08 Why | 28–32 | 52.55–60.05 | Flash back to just before the first volley, low behind blue; from 53.75 the volley erupts in slow motion and decelerates to a stop; camera rises from 2 m to 26 m. | Counters 1000 / 500 | 52.84–55.95 为什么差这么多？ | — |
| 09 Bullet time | 32–40 | 60.05–75.05 | Frozen first volley, balls as glowing streaks. (a) 60.05–65.65: camera flies to one red man with two blue balls frozen just short of him (red ground ring). (b) 65.65–71.30: swings to two blue men in blue rings sharing one red ball. (c) 71.30–75.05: climbs to a wide over both lines. | (a) **1**, **2** at the ball tips (63.25 / 63.70). (b) **½** over the blue pair (68.65–71.15). (c) **火力 ×2** over blue (71.35), **挨打 ÷2** over red (71.85), both fly to centre and merge into **战斗力 ×4** (73.95) | 60.09–63.45 你开的枪，是他的[两倍] · 65.64–69.05 他的子弹，要分给[两倍]的人 · 71.34–74.84 人多一倍，强了[不止一倍] | L2, L3 (our arithmetic) |
| 10 Resume | 40–42 | 75.05–78.80 | Time resumes; camera climbs to straight down (820 m) over both lines. | **战斗力 ×4** holds, leaves at 76.25; live counters | — | L3 |
| 11 Squares ★3 | 42–50 | 78.80–93.80 | Overhead. Glowing ground squares grow off each firing line (edge = line length). Four red-sized squares tile blue's (80.70–81.84). Replay 1000 v 500 (82.55–86.65): both live squares shrink from their lines, dim ghosts of the full squares stay. 87.0–88.6: blue's lost area folds into one square beside red's empty ghost: the same size. A tape counts along blue's remaining square to 866. | **边长 = 一排人的长度** (blue), **500 人** (red) 79.20–82.40; **×1→×4** 80.70–82.40; counters during the replay; **一样大** 88.40–89.90; tape count → **866** slam 90.05; **1000² − 500² ≈ 866²** from 90.40; **英国工程师 兰彻斯特 · 1914** from 91.00 | 78.84–82.20 战斗力，看人数的[平方] · 82.59–86.09 每一刻，两边掉的面积[一样多] · 90.09–93.59 开头的866，就是[这么来的] | L3, L4, L1, L10 |
| 12 Divide | 50–55 | 93.80–103.17 | 93.80–97.55: camera drops from overhead to a high wide; 1000 v 1000 at 30×, both sides melt to a handful. 97.55–103.17: the same 1000 v red in two waves of 500; wave 1 is beaten (→ 866), wave 2 marches in from behind and is beaten (→ 707). | Live counters; red label **两拨，各 500**; **打团最忌：一拨一拨上** 100.80–103.10 | 93.84–97.20 两边一样多？[两败俱伤] · 97.59–101.00 要是对面分[两拨]来呢？ | L5 (sim) |
| 13 ★4 | 55–57 | 103.17–106.92 | Camera rises to straight down. A pale ghost of red's whole 1000-square; two solid 500-squares slide in side by side and fill only half of it. | **两块加起来 = 一半** 105.37–106.77 | 103.47–106.87 分成两拨，总力量只剩[一半] | L5 |
| 14 孙子 | 57–59 | 106.92–110.67 | Overhead: 我专为一，敌分为十，/ 是以十攻其一也 written in gold light across the empty half, one character at a time (to 108.8). The ghost square fades; the camera tilts up and rises into the evening sky, flaring white at the end. | **《孙子·虚实篇》** 107.22–109.52; the ground text | 106.97–109.82 我专为一，敌分为十 | S1 |
| 15 Sea | 59–64 | 110.67–120.05 | Down from the clouds onto the sea: the Combined line of 33 in a loose arc (van to the north) and two British columns (12 north, 15 south) coming from the west. From 114.4 gold tracks run from each column to its cut point, a gold bracket over the attacked centre + rear, a grey one over the van; the enemy line fires. Camera descends to the waterline beside the lead ship of the southern column. | **1805 · 特拉法加** (header); **兰彻斯特专门算过这一仗 · 1916** 111.87–114.37; counters **英国 27 / 法西联合 33**; on the water **两列，打同一段** (gold, 115.07–118.35) and **前队：没人跟它打** (grey, 115.67–118.35) | 110.72–114.07 英国船少，硬拼[该输] · 114.47–117.87 两列，全压向[同一段] | T1, T2, T3, T8, T9, L1, L9 |
| 15b Climax | 64–72 | 120.05–135.05 | DROP 2. Waterline camera beside the lead ship as it passes astern of an enemy ship (slow motion 121.25–123.05), broadsides both sides; at 127.55 to the northern column breaking through further up; crane up through the smoke to a high wide. | — | — | T3, T9 |
| 15c Chart | 72–80 | 135.05–150.05 | Straight up to top-down; sepia chart grade; the line is in pieces and the van sails off north and away. | **前队** on the van (from 136.05, dims from 142.55); tally **英国 损失 0 艘 · 对方 损失一半以上** from 142.55 | 135.34–138.74 敌人的前队，[赶不回来] · 142.54–145.94 英国，一艘船都[没丢] | T4, T11, T14, T15 |
| 16 Quiet | 80–84 | 150.05–157.55 | One British ship drifting at sunset, camera low over the water, slow drift; a smoke bank crosses the lens in the last 1.6 s. | — | — | — |
| 17 Limit | 84–86 | 157.55–161.30 | Out of the smoke: the land field at dusk, a messy 1000 v 1000 in heavy smoke, flank companies out of line and idle. | — | 157.59–161.14 真实的仗，没这么[夸张] | L8 |
| 18 Ending | 86–88 | 161.30–165.05 | Eight scattered blue companies march together into one block; camera pulls back and up; light dims toward the card. | — | 161.34–164.99 同一时刻、同一地方，[比他多] | L3, L5 |
| 19 End card | 88–94 | 165.05–176.30 | Dim dusk field; card fades up from 165.25. | **你还在哪见过「集中优势兵力」？** · 评论区聊聊 · **关注 Juno · 一起看懂世界** · sources + sim note (命中率约14%) + music credit (Rynos Theme, CC BY 4.0) | — | L1, T1, T2, S1 |

## Checks on v4 (2026-10-23)
**Reading budget.** All 24 subtitles fit (≤ 13 字; tightest 多出的人，只能[排队] 2.50 s vs 2.24 needed). None crosses a cut: every line ends ≥ 0.05 s before its shot ends. Two on-screen **tags** are too short: 兰彻斯特专门算过这一仗 · 1916 (2.5 s under a subtitle + header + counters; needs 2.8 s) and 打团最忌：一拨一拨上 (2.3 s, 0.2 s under ⑮; needs 2.4 s). Fixes F3, F4.
**Facts.** All numbers trace to ✓ rows: 1000/500/866/134 L4 · 两倍/½/×4/平方 L3 · 两败俱伤/707/一半 L5 · 1914 L1, L10 · 1916 L1 · 1805/27/33 T1 · 12 + 15 columns T8 · 赶不回来 T11 · 0 艘/一半以上 T4, T14, T15 · S1 verbatim · L8. No 「一战前夕」, no 13·5·15, no 16→12, no Nelson quote. Unsafe: 前队：没人跟它打 (F1), and the van geometry (F2).
**Lines to improve.** ⑧ 为什么差这么多？ (F5); the gold water tag repeats ⑲ word for word (F6).

**Fixes for the producer (timeline.ts; not applied by the screenwriter)**
- **F1 (fact, must)** L293 `'前队：没人跟它打'` → `'前队：先不理它'`. Nelson's plan left the van "untouched" (T2), but the van did fight later: it came back to windward and lost its sternmost ship (T11).
- **F2 (fact, should; picture only)** The van is `i >= 20` (13 ships). That is Chan's model piece (T3), and Nelson cuts about 13th from the van, while T9 says "about the Tenth Ship from the Van". In 15c the 9th/10th ships (Trinidad, Bucentaure, both fought and were taken) sail away. Fix: L57 `const van = i >= 20` → `i >= 25`; L59 `z: 460 + k * 6` → `z: 650 + k * 6`; L67 `460, 30, 470` → `650, 30, 660`; L68 `150, 520` → `150, 820` and `230, 560` → `230, 880`; L300 `z: 460}` → `z: 650}`; L302 z values `400 / 470 / 300 / 380` → `590 / 660 / 490 / 570`; L316 `1100 + van` → `1250 + van`.
- **F3 (reading, should)** L291: delete the Lanchester tag from shot 15, and add it in shot 15c, where nothing else is on screen between ⑳ and ㉑: `tag(c.hud, W / 2, 132, '兰彻斯特专门算过这一仗 · 1916', env(u, 3.9, 7.3) * 0.85, 40, '#fff');` (138.95–142.35). The chart grade also reads as "his diagram", and 这一仗 now points at a battle the viewer has just seen.
- **F4 (reading, should)** L258: sub `u, 3.8, 7.2` → `u, 3.8, 6.3`; tag `env(u, 7.0, 9.3)` → `env(u, 6.4, 9.3)`. Both then fit their budget, they no longer overlap, and the tag lands as wave 2 marches in.
- **F5 (line, should)** L176 `'为什么差这么多？'` → `'差距，从第一枪就开始了'` (10 字, needs 2.53 s, has 3.10 s). Gate-1 ruling 1 / row 47 say not to ask the 为什么; the new line also tells the viewer why we are back at the first volley.
- **F6 (words, should)** L293: delete the gold tag `'两列，打同一段'`. It repeats ⑲ word for word at the same moment, and the gold bracket already shows it.
- **F7 (could; animator)** Tags under the 40 px minimum (owner row 76): `直觉：500？` 32 px (L90), `英国工程师 兰彻斯特 · 1914` 34 px (L238).

## Title options (unchanged ranking)
1. **为什么要"集中优势兵力"** — everyone knows the phrase, few know the maths; promises a reason, not a result. (Recommended; on screen.)
2. **1000打500，还剩几个？** — the hook puzzle; anyone can guess in a second.
3. **以十攻其一** — short and classical; weakest for a stranger.

---

# (v3, superseded)
# Script v3: 为什么要"集中优势兵力" (2026-10-22, night; 3D battlefield + agent sim)

**Logline:** You have 1000 men and they have 500. You'd guess 500 of yours are left when it's over; the battle itself says 866. The film replays that battle until the viewer can work the 866 out on their own, then shows the same arithmetic winning Trafalgar.
**Takeaway (the ending line):** 同一时刻、同一地方，比他多。Having more men only counts where and when the fighting happens, because with guns, fighting strength goes with the square of the headcount.
**Length:** ~158 s (2:38) including the end card. **24 subtitles** (+ end-card question), every one ≤ 14 characters and most ≤ 10. pace.py shows 0 % waiting, and every gap over 2 s is a named visual beat (listed below).
**Files:** `lines.json` (same 24 lines). The producer snaps the shot boundaries to the music specialist's bar grid. The times here are the intended order and length, not final.

## Owner notes → what changed in v3
- **"show dont tell … insanely long text"** → 63 subtitles became 24. Every number and equation is on the picture as a live counter, tag or square, and no subtitle carries a calculation.
- **"没有解释 maths concept"** → there are 4 steps the viewer can redo on screen: (1) counting the tracers in bullet time (2 shots per red man, 1 shot per 2 blue men → 4×), (2) four 500-squares tiling the 1000-square, (3) square − square → the L folds into 866, (4) two half-squares fill only half of the whole one → 707.
- **"looks like PPT / cheap assets / can we do simulation"** → every land beat is the real 3D field and the agent sim (counters and curve live). The squares are made of the soldiers themselves. 2D appears only in 3 short inserts (bamboo slips, Lanchester's page, Nelson's memorandum line).
- **"masterpiece"** → a three-act music shape: the first drop is the 866 answer, a hush for bullet time with the drums back on ×4, and the biggest drop on Trafalgar's line-break as the most spectacular frame. The ending falls quiet at dusk.
- **Row 109 (原来如此, one thread)** → 4 marked beats (★1–★4). Jellicoe's letter and the separate "强4倍才能以一敌二" line (L6) are cut because they repeat ★2.
- **Row 73 (no textbook framing)** → no "公式/这道题/课本". Lanchester is a 2-s tag and a page, never a lecture.

## Beat sheet
| Beat | Time | Purpose | What the viewer learns / feels |
|---|---|---|---|
| Hook | 0–20 | A battle runs live from frame 0. The guess "500" is on screen, the counter stops at 866 on the drop, then the title | "Wait, why not 500?" |
| Swords | 20–36 | Replay with swords: one-on-one, the extra men queue, 500 left | ★1 "My guess wasn't stupid, it's the sword rule" |
| Guns + WHY | 36–54 | Replay with guns, then freeze on the first volley and count the bullets | ★2 "Twice the men is four times the strength" |
| Snowball | 54–61 | Time resumes and the ratio runs away | Fewer men means weaker return fire, so they fall faster |
| Squares | 61–79 | Soldiers form squares, the squares subtract, the L folds into 866 | ★3 "So that's where the 866 came from" |
| Divide | 79–104 | 1000 v 1000 = 0; the same 1000 v two 500s = 707; two half-squares are only half; 孙子 | ★4 "Splitting an army halves its strength" |
| Trafalgar | 103–141 | 27 v 33 should lose; Nelson cuts the line; the van can't return; no British ship lost | The idea working at full scale, the biggest image |
| Limit + end | 141–158 | Real battles are less extreme; scattered men gather into one block | Quiet. The title's meaning in one line |

## Shot list
Sim facts used for timing (from `film/src/sim.ts`): rifle 1000 v 500 at 1× runs about 12 s from the first volley to red = 0 (formula ending 866). The ratio blue:red goes 2.0 → 2.4 (2 s) → 3.0 (4 s) → 4.1 (6 s) → 6.7 (9 s) → 20 (11 s). Melee at 25 duels at a time takes about 90 s, so it is shown time-lapsed (~8×).

| Shot | Start–End (s) | Picture & camera (what moves) | On-screen text / numbers | Subtitle (time) | Fact |
|---|---|---|---|---|---|
| 01 Volley | 0.0–6.4 | **Frame 0 = the first blue volley on the downbeat.** Low over-the-shoulder, 2 m behind the blue front rank at shoulder height. Flashes ripple down the line, white smoke rolls forward, the red line sits 90 m away against the sun. The camera pushes slowly into the smoke, then from 3.0 s starts to crane up and back. | Live counters: blue **1000** (top left), red **500** (top right). At 4.4 s a grey ghost tag under the blue counter: **直觉：500？** | ① 0.0–3.0 你有1000人，对面500人 · ② 3.2–6.4 打光对面，你还剩[几个]？ | L4 |
| 02 Run | 6.4–14.0 | The crane rises to a high ¾ wide view: both blocks firing, smoke lines, and red visibly thinning much faster than blue. Real-time sim. From ~11.5 s time slows to 0.3× on the riser: the last red soldiers fall in slow motion while the blue counter decelerates. | Counters roll live (≈955/402 → 893/218 → 870/86 …). Red ticks 3, 2, 1, **0**. Blue stops far above the ghost "500？". | (none: the battle is the beat) | L4 (sim) |
| 03 DROP | 14.0–16.5 | **Music drop.** The blue counter **866** slams to centre (fast scale-down + short damped jolt, no flash). The ghost "500？" cracks and drops out of frame. Camera: slow push toward the blue block standing in drifting smoke. | **866** big; under it, small: **只倒下 134** | (none) | L4 |
| 04 Title | 16.5–20.5 | Title slams in one bar later on a hard hit, built in the world (e.g. gold letters condensing out of the smoke bank, the art director's call). The push continues. | 《为什么要"集中优势兵力"》 | (title) | — |
| 05 Rewind | 20.5–22.4 | **Tape-rewind:** the battle runs backwards fast. Fallen men spring up, smoke is sucked back into the muzzles, and the counters spin back to 1000 / 500. Muskets turn into sabres as the rewind ends (motivated transition). | 1000 / 500 | (none) | — |
| 06 Swords | 22.4–31.4 | Melee mode. Low camera tracking sideways along the contact line at walking pace, always the same direction. Pairs duel one-on-one (25 at a time), one falls each time. At 26.0 the camera cranes up and back: the contact line is a thin strip, and **the whole back half of the blue block stands still, waiting**, picked out with a soft blue rim light. Time-lapse ~8×. | Counters drop **in lockstep** (900/400 → 800/300 …). Tag on the waiting men: **在排队** | ③ 22.4–25.4 拼刀的年代，只能[一对一] · ④ 26.0–29.2 多出来的人，只能[排队等] | L2 |
| 07 ★1 | 31.4–36.0 | Melee ends at red 0. The ghost "500？" from shot 01 drops back in and snaps onto the blue counter's 500 with a tick. A high camera holds with a gentle orbit. | **500 ✓** · tag **拼刀：剩 500** | ⑤ 31.6–34.9 你的直觉，属于[冷兵器时代] | L2 |
| 08 Guns | 36.0–41.0 | 1-s rewind; sabres back to muskets. Low over-the-shoulder, then a fast crane up. The first volley fires from **every** blue soldier, **including the rim-lit back half that queued in shot 06** (the same rim now flashing). | 1000 / 500 | ⑥ 37.2–40.2 有了枪，[人人]都能开火 | L2 |
| 09 Bullet time | 41.0–54.0 | **Freeze mid-first-volley; music hushes.** Tracers hang in the air as glowing threads, smoke is frozen, one red soldier is caught mid-fall. The camera orbits slowly, always in one direction. **(a)** 41.0–45.5: from behind blue, the thick sheaf of blue threads; follow them to **one red soldier with 2 tracer tips frozen inches from him**. **(b)** 45.5–50.3: keep orbiting round to the blue side. Red's thinner sheaf is spread across the deep blue block, and **two blue soldiers lit together share 1 tracer**. **(c)** 50.3–54.0: a step board fades up on a feathered scrim, one line per beat. | (a) **他：每人挨 2 枪** · (b) **你：两人挨 1 枪** · (c) board: **火力 ×2 · 挨打 ÷2 · = 4 倍** → at 54.0 **×4** slams big as the drums return | ⑦ 41.6–44.6 你开的枪，是他的[两倍] · ⑧ 45.8–49.0 他的子弹，要分给[两倍]的人 · ⑨ 50.6–53.9 人多一倍，强了[不止一倍] | L2, L3 (per-volley counts: our arithmetic) |
| 10 Snowball | 54.0–61.4 | Time resumes at full speed. The camera rises to a straight-down overhead (120 m, slow 10° rotation). Red melts from its front, blue barely dents. A live curve runs along the bottom: the red line dives, the blue line stays nearly flat. | Live ratio tag between the counters: **2倍 → 3倍 → 4倍 → 7倍 …** (blue ÷ red, from the sim) | ⑩ 55.6–58.4 人越少，还手[越弱] | L3, L4 |
| 11 Squares | 61.4–70.0 | Overhead. The sim pauses; both armies march at 3× into **solid square formations** on the grass (side ∝ headcount, ground square glowing under the men). The red square then copies itself as 4 ghost outlines that **tile the blue square exactly**, and the ×4 from shot 09 flies into the tiling. At 66.2 the red square slides onto a corner of the blue square. Where they overlap, **pairs of soldiers fall together** as it advances, and the overlap empties, leaving blue's **L-shape** standing. | **边长 = 人数 · 面积 = 战斗力** · **×4** | ⑪ 61.4–64.5 战斗力，看人数的[平方] · ⑫ 66.2–69.3 打一仗，就是[面积相减] | L3 |
| 12 ★3 | 70.0–79.0 | The L's soldiers march and re-form into one smaller solid square. A measuring tape runs along its edge and the number rolls up to 866. The 866 from shot 03 flies down from the top of frame and lands on it (match). | **1000² − 500² = 866²** · small tag bottom-left: **英国工程师 兰彻斯特 · 1914** | ⑬ 74.0–77.3 开头的866，就是[这么来的] | L4, L1 |
| 13 Split | 79.0–94.0 | **Split screen**, same light. **Left:** 1000 blue v 1000 red, and both counters fall together to about 0. **Right:** the same 1000 blue, but red's 1000 come as **two blocks of 500**, the second held back behind the forest line. Blue destroys the first block, turns, and destroys the second as it arrives. Low wide on each, then both crane up to overhead. | Left: **1000 : 1000 → 0 : 0**. Right: **1000 → 866 → 707** | ⑭ 79.4–82.5 两边一样多？[同归于尽] · ⑮ 83.6–86.6 要是对面，分[两拨]来呢？ | L5 |
| 14 ★4 | 94.0–98.4 | Right field, overhead. A ghost outline of red's whole 1000-square appears; its two 500-squares slide in side by side and **fill only half of it**, so the other half is visibly empty grass. | **两块加起来 = 一半** | ⑯ 94.0–97.4 分成两拨，总力量只剩[一半] | L5 (our arithmetic) |
| 15 孙子 | 98.4–103.4 | The empty half-square's outline becomes the frame of a 竹简 unrolling (2D insert, warm light). Brush characters write on: 我专为一，敌分为十，是以十攻其一也, with the last phrase in gold. | **《孙子·虚实篇》** | ⑰ 98.6–101.6 我专为一，敌分为十 | S1 |
| 16 Page | 103.4–106.4 | 2D insert: Lanchester's 1916 book, open at the chapter heading "Nelson's Tactical Scheme — The N-Square Law at Trafalgar". The camera pushes into the page and its paper grain **match-dissolves into the sea surface**. | **兰彻斯特 1916：专门算过这一仗** | (none) | L1 |
| 17 Approach | 106.4–118.0 | Ocean at golden hour, high wide. The Combined Fleet is one long line of 33 (Bucentaure models) across the frame. From the left, the British 27 come in **two columns** (Agamemnon models) bearing straight at it. A translucent square hovers over each fleet, blue clearly smaller than red. At 110.6 a handwritten line from Nelson's memorandum fades in top-left for 2.5 s. From 113.5 the camera descends to just above the waves ahead of the lead British bow. | Header **特拉法加 · 1805**. Counters **英 27** / **法西 33**. Memo: *"lead through… their twelfth Ship from their Rear"* + **从敌队尾约第12艘，切进去** | ⑱ 106.4–109.4 英国船少，硬拼[该输] · ⑲ 110.6–113.5 纳尔逊：[拦腰切开] | T1, L3 (27² < 33², our arithmetic), T2 |
| 18 ★ CLIMAX | 118.0–126.0 | **The track's biggest drop; the most spectacular frame of the film.** A waterline camera tracks beside the lead British bow as it **cuts through the gap between two towering enemy ships**. Full broadsides fire from both of its sides at once, flashes run down every hull, and smoke banks roll across the water. 1.5 s of slow motion as the bow passes the enemy stern (an echo of the land bullet time), then full speed. The camera rises through the smoke into a sweeping crane, and **the second column breaks the line further down**. | (none: picture only) | (none) | T3 |
| 19 Chart | 126.0–134.0 | The crane goes straight up to top-down and the grade turns into a period-chart look (paper tone, ink ships) while the ships keep moving. The line is now **3 pieces**. **The front piece keeps sailing on out of the top of the frame and greys out.** The red square above the Combined Fleet **cracks into three** and the front piece's square fades with it. The blue square stays whole. At 130.4 the tally rises. | **13 · 5 · 15** · tag on the front piece **前队** · tally: **英 损失 0 艘 / 对方 损失 一半以上** | ⑳ 126.0–129.2 敌人的前队，[赶不回来] · ㉑ 130.4–133.4 英国，一艘船都[没丢] | T3, T4 |
| 20 Quiet | 134.0–140.4 | The music begins to fall apart. Low over still water at sunset: drifting smoke and one British ship of the line in silhouette, barely moving. A slow drift, no cuts. | **1805.10.21** | ㉒ 134.6–137.6 纳尔逊本人，中弹身亡 | T4, T1 |
| 21 Limit | 140.4–145.4 | Back to the land field at dusk (same world as frame 0, sun lower, long shadows). A slow overhead drift. A horizontal dial on a feathered scrim: left end **一换一（刀）**, right end **平方（枪）**, and a soft band from the left end to halfway labelled **真实战役**. | dial as described | ㉓ 141.0–144.2 真实的仗，没这么[夸张] | L8 |
| 22 Ending | 145.4–151.0 | Ending image: a wide crane at low sun on the forest line. Small blue companies scattered across the field **march toward each other and merge into one block**. The camera pulls back and up, quiet, and the light turns gold. No counters. | (none) | ㉔ 146.0–149.8 同一时刻、同一地方，[比他多] | L3, L5 |
| 23 End card | 151.0–158.0 | Juno end card (J monogram, gold title, follow pill **关注 Juno · 一起看懂世界**, sources line). | **你还在哪见过「集中优势兵力」？** | (end-card question) | — |

**Named silent beats (pace.py CHECK flags, all intended):** 6.4–22.4 the battle, 866 drop, title and rewind (the on-screen ghost guess and counters carry it). 29.2–31.6 and 34.9–37.2 the melee finish and the rewind. 58.4–61.4 the snowball curve. 69.3–74.0 the L folding. 77.3–79.4 into the split screen. 86.6–94.0 the two fights. 101.6–106.4 the slips → page → sea. **113.5–126.0 the line-break climax.** 137.6–141.0 the quiet sea.

**原来如此 beats:** ★1 0:32 (your 500 is the sword rule) · ★2 0:54 (×4 from counting bullets) · ★3 1:14 (the hook's 866 is square − square) · ★4 1:34 (two halves = half the strength). Trafalgar is where they pay off.

**Music shape the editor should look for in the bar grid:** build from frame 0 → **drop 1 at ~14 s (866)** → groove → **hush at ~41 s (freeze)** → drums back on **×4 at ~54 s** → groove → build from ~106 s → **biggest drop at ~118 s (line-break)** → falling apart from ~134 s → quiet end. If the song's biggest drop comes earlier than ~1:50, move shots 17–18 to it rather than the other way round.

## Title options
1. **《为什么要"集中优势兵力"》** (10 字) — Everyone knows the phrase and nobody knows the maths under it, so it is the "懂但不了解" topic in its purest form. It promises a reason, not a result, so it can't overclaim. *(Recommended.)*
2. **《1000打500，还剩几个？》** — The puzzle itself, in the style of 《第几个人》. Anyone can try a guess in one second, and the cover doesn't give away 866.
3. **《以十攻其一》** (5 字) — Short and classical, with a sense of mystery. Viewers who know 孙子 will click to find out why it works. The weakest at telling a stranger what the film is.

## Questions & assumptions (for the owner / director / cold reader)
**Questions I'd ask the owner**
1. **Question in the hook.** Row 47 says "never ask the question", but the brief's puzzle is a question. ② "打光对面，你还剩几个？" asks it, and the ghost "直觉：500？" answers for the viewer. Keep it, or show only "你还剩 ？" on screen with ② as "打光对面——"?
2. **Title vs. hardest drop.** Rows 26/84 put the title on the hardest drop. The brief puts 866 on the drop with the title right after, and I followed the brief: 866 on the downbeat, title one bar later inside the same drop section. OK?
3. **Relatable line (row 45).** The topic is military. The end-card question invites everyday cases, but an extra line before it such as "打团，别一个一个上" would land with 18–25 viewers. Should I add it? It isn't a fact claim, but it is our application.
4. **Nelson's death (㉒).** I kept it as the quiet emotional beat after the climax (one line, row 107 respected). Cut it if it feels like Trafalgar is taking over.

**Assumptions (please check)**
5. **Order change.** The brief's order is snowball → why. I freeze on the **first** volley (why) and run the snowball after it, because only at the first volley are the counts exactly 1000:500, so "每人挨 2 枪 / 两人挨 1 枪" is exact rather than "about 2.4".
6. **Hook seed.** For shot 02 the producer runs seeds until the 1000 v 500 run ends **exactly at 866**, so the callback ⑬ "开头的866" is literally true. If no seed does, show the sim's number in the hook and change ⑬ to "开头的数，就是这么来的". The same applies to melee ending at 500 and to 1000 v 1000 ending at 0:0 or within a handful. If the left side of shot 13 ends with a visible survivor count, ⑭ should become "两边一样多？两败俱伤".
7. **Melee is time-lapsed** (~8×; the real sim takes ~90 s). Counters roll accordingly.
8. **Every soldier fires** in the sim (real musket lines fired by ranks). The "排队等 → 人人都能开火" contrast depends on it. This is the idealised law (L3), and the honest-limit shot covers the gap.
9. **Trafalgar 13 / 5 / 15 (T3, Chan).** I assume the 13 is the front piece (the van ahead of Nelson's cut). Researcher, please confirm the order. I don't draw local square comparisons (which British ships fought which piece is not in facts.md), only the red square cracking and the van's piece fading.
10. **Trafalgar is not claimed as a pure square-law result.** British gunnery and seamanship also mattered (quality, L3). The lines only say what happened (T3/T4). "硬拼该输" is the square-law reading of 27 v 33 at equal quality, labelled as our arithmetic. Lanchester's own chapter (L1) is why it's fair to use the battle.
11. **Swords on Napoleonic infantry.** The melee uses the same soldier models with sabres/bayonets. "拼刀" covers both, and "冷兵器时代" refers to the rule, not to these uniforms.
12. **Cut on purpose:** Jellicoe's letter (L7), the 4×-to-beat-two line (L6), the round-by-round table (L4 rounds; the live curve replaces it), "两千多年前" (not in facts.md).

## Safe-phrasing checklist
866 / 134 / 707 are our arithmetic (L4, L5). 27 v 33 and the date are from the Gazette (T1). The memo quote is verbatim (T2). "赶不回来" = "could not get back into the fight in time" (T3). "一艘没丢" and "一半以上" (T4). Nelson "中弹身亡" (T4). "真实的仗，没这么夸张" + the 1–1.5 band (L8). No clock times at Trafalgar, and no claim that Nelson knew the maths.

---

# (v2, superseded)
# Script v2 — show, don't tell (2026-10-22, after "show dont tell … instead of insainly long text")
The picture explains; on-screen numbers carry the maths; subtitles only where the picture can't speak (13 lines). Keyframes: `board/Lan38.tsx` (LAN38, 9 frames).

| Beat | Picture (what moves) | On screen | Subtitle |
|---|---|---|---|
| 1 | Two dot armies on a dark map table | 1000 · 500 | 打完，你还剩几个人？ |
| 2 | Counter over blue: 500 appears, cracks; 866 slams in on the drop | 500 → **866** | — |
| 3 | Title built from the dots | | 《为什么要"集中优势兵力"》 |
| 4 | Swords: front ranks pair off and vanish together; 500 blue left | 拼刀：一换一 · 500 | 冷兵器时代，直觉是对的 |
| 5 | Rifles: tracers from every dot; red thins fast, blue slowly; live table runs 1000/500 → 950/400 → 910/305 → 880/214, ratio 2:1 → 4:1 | table | 有了枪：越打越悬殊 |
| 6 | 2× tracers out of blue; red's fire spread over 2× men | 火力×2 · 挨打÷2 · =强4倍 | — |
| 7 | Each army slides into a square, side = its number; the 500 square tiles the 1000 square four times | 1000 · 500 · ×4 | 战斗力 = 人数的平方 |
| 8 | The red square is cut out of the blue; the L folds into a new square; ruler reads 866 | 1000² − 500² = 866² | — |
| 9 | Lanchester's page, 1914; Jellicoe's 1916 letter | 兰彻斯特 · 1914 | — |
| 10 | 1000 vs 1000: equal squares cancel to nothing | 0 | 两边一样多？同归于尽 |
| 11 | Red splits in two; blue eats one half (→866), then the other (→707) | 866 → **707** | 同样的兵，换个打法 |
| 12 | Bamboo slips | 我专为一，敌分为十 | — |
| 13 | Trafalgar chart: 27 vs 33 in parallel lines; the squares say Britain loses | 1805 · 27 · 33 | 按平方律，英国该输 |
| 14 | Two columns cut the line; the van drifts away; local squares flip blue | 16 → 12 (Nelson's plan) | 拦腰切开，以多打少 |
| 15 | Tally | 英 0 艘 · 敌 18+ 艘 | 纳尔逊中弹牺牲，英国一艘未失 |
| 16 | Scattered small squares slide together into one big square | | 同一时刻、同一地点人多，才算 |
| End | | | 你还在哪见过"以十攻其一"？ |

---

# (v1, superseded)
# Script: 为什么要"集中优势兵力" — v1 (2026-10-22)

**Spine:** a puzzle (1000 vs 500 → 866, not 500) → swords are one-for-one, guns let everyone shoot → round-by-round the gap snowballs → why: 2× shooters × ½ the fire each = 4× → strength = the square of the number, drawn as squares → split the enemy and 1000 vs 1000 becomes a win with 707 left (孙子) → Trafalgar.
**Takeaway:** 人多不算优势；在同一时刻、同一个地方人多，才算——因为战斗力看的是人数的平方。
**Length:** ~2:50 at ~2.7 s a subtitle; timing from the BGM. Every subtitle ≤ 16 字 (numbers counted per digit).

| # | Section | Header | Subtitle | Picture | Fact |
|---|---|---|---|---|---|
| 1 | 开场 |  | 你有1000个兵，对面只有500个 | two dot armies face each other across a field | L4 |
| 2 | 开场 |  | 双方举枪，互相射击 | muzzle flashes on both sides |  |
| 3 | 开场 |  | 打到对面一个不剩，你还剩多少人？ | a counter over your army: ??? | L4 |
| 4 | 开场 |  | 直觉会说：500 | "500" appears, then cracks |  |
| 5 | 开场 |  | 答案是：866 | "866" slams in on the drop | L4 |
| 6 | 开场 |  | 人多一倍，为什么损失这么少？ |  |  |
| 7 | 标题 |  | 《为什么要"集中优势兵力"》 |  |  |
| 8 | 一、刀和枪 |  | 先看冷兵器时代 | dots become swordsmen, lined up | L2 |
| 9 | 一、刀和枪 |  | 一个人，只能和面前的一个人拼刀 | the front rows pair off one-on-one | L2 |
| 10 | 一、刀和枪 |  | 1000对500，一换一 | pairs vanish together; 500 left | L2 |
| 11 | 一、刀和枪 |  | 剩500，正好是直觉的答案 | counter: 500 ✓ (old times) |  |
| 12 | 一、刀和枪 |  | 可有了枪，事情变了 | swords → rifles | L2 |
| 13 | 一、刀和枪 |  | 每个人，都能朝任何一个敌人开枪 | fire lines fan out from every dot | L2 |
| 14 | 二、一轮一轮算 |  | 一轮轮算：每10人，一轮打倒1个敌人 | 10 blue dots → 1 red dot falls (示意) | L4 |
| 15 | 二、一轮一轮算 |  | 第一轮：1000人打倒对面100个 | 100 red dots fall | L4 |
| 16 | 二、一轮一轮算 |  | 对面500人，只打倒你50个 | 50 blue dots fall | L4 |
| 17 | 二、一轮一轮算 |  | 于是，950比400 | table row 1 | L4 |
| 18 | 二、一轮一轮算 |  | 第二轮，910比305 | row 2 | L4 |
| 19 | 二、一轮一轮算 |  | 第三轮，880比214 | row 3; the ratio tag 2:1 → 4:1 | L4 |
| 20 | 二、一轮一轮算 |  | 差距不是在缩小，是越拉越大 | ratio bar stretching | L4 |
| 21 | 二、一轮一轮算 |  | 人越少，还手越弱，倒得越快 | red side collapsing faster each round | L3 |
| 22 | 二、一轮一轮算 |  | 把每一轮切得再细，最后剩下866 | rounds blur into a smooth curve ending at 866 | L4 |
| 23 | 三、为什么是平方 |  | 人多一倍，有两个好处 |  | L3 |
| 24 | 三、为什么是平方 |  | 开枪的人，多了一倍 | twice the muzzle flashes | L3 |
| 25 | 三、为什么是平方 |  | 每个人挨的子弹，少了一半 | incoming fire split over twice the men | L3 |
| 26 | 三、为什么是平方 |  | 两个"一倍"乘起来，就是4倍 | ×2 × ×2 = ×4 | L3 |
| 27 | 三、为什么是平方 |  | 所以战斗力不看人数，看人数的平方 |  | L3 |
| 28 | 三、为什么是平方 |  | 把人数当边长，画一个正方形 | each army's dots slide into a square, side = its number | L3 |
| 29 | 三、为什么是平方 |  | 它的面积，就是战斗力 | the square fills with light | L3 |
| 30 | 三、为什么是平方 |  | 1000的正方形，是500的4倍大 | the 500 square fits 4 times into the 1000 square | L3 |
| 31 | 三、为什么是平方 |  | 打仗，就是拿面积去抵消面积 | the small square is cut out of the big one | L3 |
| 32 | 三、为什么是平方 |  | 1000×1000，减去500×500 | the L-shaped remainder | L4 |
| 33 | 三、为什么是平方 |  | 剩下的75万，正好是866×866 | the L folds into a square of side 866 | L4 |
| 34 | 三、为什么是平方 |  | 一战前夕，一位英国工程师 | portrait card: F. W. Lanchester, 1914 | L1 |
| 35 | 三、为什么是平方 |  | 把这条规律写成了公式 | A² − B² = const, chalk-drawn | L1 |
| 36 | 三、为什么是平方 |  | 英国舰队司令写信给他 | letter, 1916 | L7 |
| 37 | 三、为什么是平方 |  | "你的平方律，在大舰队里出名了" |  | L7 |
| 38 | 四、各个击破 |  | 平方还意味着：想以一敌二，你得强4倍 | 1 ship vs 2 ships; a ×4 gauge | L6 |
| 39 | 四、各个击破 |  | 两边一样多？最后同归于尽 | two equal squares cancel to nothing | L5 |
| 40 | 四、各个击破 |  | 可如果，你能把敌人分成两半 | the red army splits; the halves drift apart | L5 |
| 41 | 四、各个击破 |  | 先用1000人，打其中500个 | fight 1 → 866 left | L5 |
| 42 | 四、各个击破 |  | 剩下866人，再打另外500个 | fight 2 | L5 |
| 43 | 四、各个击破 |  | 最后，你还剩707个人 | counter: 707 | L5 |
| 44 | 四、各个击破 |  | 同样的兵，只换了个打法 | side by side: 0 vs 707 | L5 |
| 45 | 四、各个击破 |  | 两千多年前，孙子就写过 | bamboo slips | S1 |
| 46 | 四、各个击破 |  | "我专为一，敌分为十" |  | S1 |
| 47 | 四、各个击破 |  | "是以十攻其一也" |  | S1 |
| 48 | 五、特拉法加 | 1805 · 特拉法加 | 英国27艘战舰，对面33艘 | two fleets, top-down chart | T1 |
| 49 | 五、特拉法加 |  | 当时的海战，是两排战舰平行对轰 | two parallel lines | T3 |
| 50 | 五、特拉法加 |  | 按平方律，船少的一方必输 | square sizes: 27² vs 33² | L3 |
| 51 | 五、特拉法加 |  | 纳尔逊在作战计划里写 | the 1805 memorandum, handwriting | T2 |
| 52 | 五、特拉法加 |  | 用16艘，去打敌人队尾的12艘 | plan sketch: 16 → 12 | T2 |
| 53 | 五、特拉法加 |  | 开战那天，他的舰队排成两列 | two columns sail at the line | T3 |
| 54 | 五、特拉法加 |  | 直直冲进敌人的战列线，拦腰切开 | the line breaks into pieces | T3 |
| 55 | 五、特拉法加 |  | 敌人的前队，被甩在了战场外 | the van drifts off, too far to help | T3 |
| 56 | 五、特拉法加 |  | 那天，英国一艘船都没丢 | 27 ✓ | T4 |
| 57 | 五、特拉法加 |  | 对面33艘，一半以上被俘或被毁 |  | T4 |
| 58 | 五、特拉法加 |  | 纳尔逊自己，中弹牺牲 |  | T4 |
| 59 | 结尾 |  | 真实的战场，当然没这么整齐 | fog, terrain | L8 |
| 60 | 结尾 |  | 但这道算术的方向，从没变过 |  | L8 |
| 61 | 结尾 |  | 人多不算优势 | two squares, scattered |  |
| 62 | 结尾 |  | 在同一时刻、同一个地方人多，才算 | they merge into one big square | L3 |
| 63 | 片尾 |  | 你还在哪见过"以十攻其一"？评论区说说 |  |  |

## Title options
1. 《为什么要"集中优势兵力"》 — the phrase everyone knows, now with the maths.
2. 《1000人打500人，还剩几个？》 — the puzzle as the title, like 第几个人.
3. 《以十攻其一》 — short, classical.

## Notes
- Round-by-round numbers use 10 % per round (示意); coarse rounds end at ≈842, finer rounds → 866 (exact √750,000).
- "强4倍" (L6) is for equal numbers of guns per ship; say 单兵/单舰 on screen.
- Trafalgar: quote the memorandum (16 → 12) and the outcome; no claim of exact local numbers on the day.
- 707 = √(866² − 500²); "等于凭空多一倍兵力" is wrong — it is 2× strength ≈ 1.41× men. Do not say 多一倍兵力.
