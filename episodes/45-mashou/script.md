# Script v5 (rebuild, 2026-10-25)

Screenwriter. Basis: brief_v2.md, facts.md (✓ rows only, no new rows), HANDOFF §5 beats and §6 logic rules, notes_gate4_r1, review/v2, owner-notes, ep43 `lines_bars.json` as the standard. Lines file: `lines_v5.json` (`[null, null, "text with [key]"]`, in order, times left for the producer).

- **52 lines.** Reading minimum adds up to **157.7 s**. With the title bar, the rewind bar and the end-card tail (about 2.3 + 2.3 + 3 s), the film comes to **about 165 s**. It will grow a few per cent once lines snap to the bars, and that still sits inside 150–170.
- **Min duration** = max(1.8 s, 0.25 s × 字 + 0.6 s). 字 = CJK characters, with each number counted as ⌈digits/2⌉ (1860 → 2, 98 → 1). Every line also passes pace.py with 0 % waiting when laid end to end at these minimums.
- **Width** ≤ 16 on every line: CJK and full-width punctuation count 1, digits count 0.5. The widest lines are Q at 16 and A2, D9a and K3a at 15.
- **Highlights:** 17 of 52 lines (33 %). They mark only numbers, turns and outcomes, never a name or a place.
- **Blocks:** ids ending a/b form a two-line block. Line a stays top-left and line b adds under it (14 blocks). T1–T4 are one running sentence over hard cuts, and each line replaces the one before. **Centred** = punch line, bigger.
- **HIT** = wants a music hit. **DB** = wants a downbeat or a section start. **STOP** = the track's stop or near-silence. **DROP** = the hardest drop. Rows without a mark go on the next free beat. The music is bgm2 with one cut and a fade-out, so nothing here is timed in seconds.

## Title options (≤ 10 字)
1. **马首回家，用了160年.** True as read (1860 → 2020, F21 估算). It names the subject, and 回家 is the film's own twist word (回国 7, 回家 1). This is the current working title.
2. **假如你是圆明园马首.** The ep43 format title the owner liked. It says who 你 is at a glance and promises the device rather than an event, so it can't overclaim.
3. **6910万买下，又捐了出去.** A number plus a contradiction, and the cold reader's click. Both halves are true (F13, F15), and 又 (not 转手) keeps the 12-year gap honest. Weak spot: it doesn't name the horse, so the cover must show it.

## Story in 3 lines
1. 你是圆明园水力钟的马首：十二兄弟轮流喷水报时，只有正午，十二个一起喷。
2. 1860年你被抢走；一百多年后你一次次上拍卖台；2007年锤子没落下，何鸿燊私下用6910万港元买下你，2019年把你捐给国家，自己没等到你回家。
3. 2020年你回到圆明园：回国的有七个，回家的只有你。正午还差十一个，五个没回中国——再上拍，该花钱买回来吗？

## Lines
Every person is a whole-figure silhouette with no face. Hands hold real props, and feet stand on real ground. **Ho** (何鸿燊) uses one silhouette design all film (suit, short hair, a slight stoop). The **counter** (bottom-left) follows the picture: 在家 12/12 → 回国 0 → 3 → 4 → 5 → 7, then a second row 回家 1/12 from H3b. **Your ear** is straight before 1860 and folded from 1989 on.

| id | line | highlight | min s | HIT / DB | picture (what we see, who does what, what moves) | → transition into the next line's picture |
|---|---|---|---|---|---|---|
| C1 | 假如说，你是圆明园的马首。 | — | 3.35 | DB (beat 1) | **Frame 0:** your red-copper head fills the frame in three-quarter profile on a dark desk. The line is already typed on frame 0. On beat 1 a desk lamp clicks on and its light slides across your cheek and mane. Eased push 1.00 → 1.05. The folded ear is already visible. | One continuous pull-back with no cut. The desk, the lamp and a seated silhouette behind you come into frame. |
| C2a | 有人花【6910万】买下你， | 6910万 | 2.85 | DB | The private room (stamp 「2007 · 私下成交」). Ho sits behind the desk. His right hand signs a paper with a pen and his left hand lies flat on it. A price card stands beside you, **already** reading HK$6910万: it never counts up, and there are no paddles and no gavel (§6.1). | Ho stands, lifts a cloth from the desk with both hands and lays it over you. On the beat, a **match cut on the draped shape**: the same covered form, now in a lit hall. |
| C2b | 又把你【捐了出去】。 | 捐了出去 | 2.35 | wind-up into the drop | A museum hall (stamp 「2019 · 北京」). Two staff silhouettes, one each side, grip the cloth with both hands and pull it off you. It flies up toward the lens. Ho is **not** in the hall (his attendance isn't in facts.md). | The flying cloth fills the frame as a **wipe carried by the cloth**. The title lands as it clears. |
| TTL | *(title card, no subtitle)* | — | ≈ 1 bar | **HIT: first big drop** | 「马首回家，用了160年」 on a plaque built from the film's own shapes: your copper profile plus twelve water arcs. It slams in (fast scale-down, short damped jolt, no flash). | **Hard cut** on the next downbeat (the cold-open format). |
| T1 | 1860年，你被人抢走， | — | 2.60 | DB · hard cut | Smoke over the fountain terrace (stamp 「1860 · 圆明园」). A looter in a kepi (flat forward-tilted top, short visor) grips you under the collar with both hands and lifts you off the robed stone body. The stone shoulders stay empty. Your ears are straight. | **Hard cut** on the beat. |
| T2 | 在伦敦，被人买走， | — | 2.35 | HIT (gavel) · hard cut | London saleroom, green walls (stamp 「1989 · 伦敦」). You sit on the podium under a spot. The auctioneer stands behind the lectern, his right hand wrapped round the gavel as one mitten shape, and strikes on the beat. | **Hard cut.** |
| T3 | 2007年，锤子没有落下， | — | 2.85 | DB · hold | Hong Kong saleroom, blue walls (stamp 「2007 · 香港」). The auctioneer holds the gavel up and it trembles but never comes down. No paddles anywhere. A picture pause. | **Hard cut** on the next downbeat. |
| T4 | 2020年，你终于回了家。 | — | 2.85 | DB · hard cut | Night outside the 正觉寺 courtyard gate (stamp 「2020 · 圆明园」). Two staff silhouettes push the door leaves open a crack, hands flat on the wood. Copper light spills onto the flagstones. H1b pays this framing off. | Crane up and back over the roof. The strip of door light narrows to a dot, and the dot becomes **your medallion** in a ring of twelve (match on the light). |
| T5 | 可十二个里，还有【五个】没回来。 | 五个 | 3.60 | HIT · **centred** | The counter, grown to fill the frame: a ring of twelve medallions, each a clear animal silhouette. Seven are faintly lit and five are thick dashed outlines. Text 「回国 7/12」, stamp 「— 2026年10月」. | **REWIND ◀◀** (≈ 1 bar, tracking lines). The ring spins backwards like a clock dial, with 3–4-frame flashes of T4 → T1 in reverse (doors close, gavel rises, you fly back onto the stone body). Each flash carries its own year: 2026 → 2020 → 2007 → 1989 → 1860 → 乾隆年间. It lands in the foundry glow. |
| A1 | 乾隆年间，你由红铜一次铸成。 | — | 3.60 | DB (section start) | The foundry (stamp 「乾隆年间 · 清宫匠师」). A founder tips a crucible with both hands on long tongs, and a molten stream pours into a clay mould. Then he holds the mould with his left hand and knocks it apart with a mallet in his right. The halves fall to the floor and you are there, glowing and seamless. At true scale your head is about ¼ of his height. | Your face cools from orange to copper. A **match cut on your profile** in the same screen spot: daylight, and you now sit on a robed stone body. The pull-back begins. |
| A2 | 你和十一个兄弟，坐在水池两边。 | — | 3.85 | — | One continuous pull-back to the 海晏堂 fountain: twelve robed stone bodies sit in a 八 on both sides of the pool. Every head reads at phone size: ox horns, tiger ears, monkey face, dragon horns, snake, goat's curled horns, rooster comb, dog ears, pig snout, rat ears, rabbit ears. You are the warm one. The counter appears: 「在家 12/12」. | No cut: the sun's shadow starts to move across the terrace. |
| A3a | 每两小时，轮到谁，谁就喷水。 | — | 3.35 | on the beat | Time-lapse. A shadow pointer sweeps the terrace while one water arc at a time leaves a head's mouth, always facing the pool. The arc passes from head to head, speeding up. The 「水力钟」 label sits on the picture and leaves before A3b. | The camera **rides along the arc** as it passes from the snake to you. |
| A3b | 你，是午时。 | — | 1.80 | beat | Close on you, and only you spout (§6.7). Stamp 「11:00–13:00 · 午时」. | On the downbeat a fast pull-back, as the other eleven fire in a ripple outward from you. |
| A4 | 正午12点，十二个【一起喷水】。 | 一起喷水 | 3.35 | **HIT** | All twelve arcs are up at once, completing on the hit: thick arcs with bright cores, droplets at the tips, splash rings in the pool. Slow push 1.00 → 1.08 over the hold. The film's first big image. | **The light changes**: noon goes to a red October dusk. The arcs fall and stop, and the camera tilts down from the last drops to the front flagstones, where boots step in. |
| B1a | 1860年，英法联军进了园子。 | — | 3.35 | DB (darker section) | Soldiers in kepis walk in on the **front flagstones**, never on the pool or through the plinths (§6.4, §6.8). No flags. Stamp 「1860.10 · 圆明园」. The camera tracks with them at a fraction of their speed. | Continuous track. |
| B1b | 能搬走的，都被搬走了。 | — | 2.85 | — | On the same flagstones, one looter carries a crate with both hands under it and another hugs a vase in both arms. They walk out of frame to the left. | The track stops for a picture pause just before the hit. |
| B2 | 然后，一把火。 | — | 1.85 | **HIT** | Fire flares behind the 海晏堂 facade on the hit, and embers drift across the frame. The fountain is dry. Stamp 「1860.10.18」. | **Push in through the embers** to your seat. |
| B3 | 你被带走了。 | — | 1.85 | DB | Pays off T1, the same shot run longer. The looter lifts you with both hands and walks off right, and the counter goes 12 → 11. The camera tilts up into the smoke, and only once the smoke covers the pool does the counter roll to 0 and flip to 「回国 0/12」. Nothing pops, and no seat empties on its own (§6.2, §6.6). | The smoke thins into the **haze of a spotlight beam**, which lands where your seat was. The beam is now in London. |
| D1 | 一百多年后，你出现在伦敦。 | — | 3.35 | DB | London saleroom, green walls (stamp 「1989 · 伦敦苏富比」). You sit on the podium in the spot. Seated bidders' paddle arms rise from the shoulder with the paddle in front of the face, alternating on the beat. | Continuous ease from you to the lectern. |
| D2a | 锤子落下：【几十万美元】。 | 几十万美元 | 2.85 | **HIT** (hammer 1) | Pays off T2. The auctioneer winds up slow → fast and strikes. The lot card flips to 「几十万美元」. | Same shot. |
| D2b | 你被台湾收藏家买走。 | — | 2.85 | — | A porter (whole figure) lifts you off the podium with both hands into a crate, and a seated buyer silhouette nods. Stamp 「台湾收藏家」. | The camera **holds on the empty podium** while the wallpaper re-papers in a vertical wipe from the stamp corner (green → blue), and the stamp flips to 「2000 · 香港」. |
| D3a | 2000年，兄弟牛、猴、虎上拍。 | — | 3.10 | three beats | The porter sets 牛, 猴 and 虎 on the podium, one per beat, each with a name tag. Paddles rise. | Continuous. |
| D3b | 锤子落下，三个都被买了回来。 | — | 3.60 | **HIT ×3** | Three quick strikes on three beats. Each lot card flips to 「购回」 and the counter ticks 0 → 1 → 2 → 3. Stamp 「保利购回」. | A **lateral track right** along the podium, past the three heads to a fourth stand. Behind it the saleroom dims into a quiet office. |
| D4 | 2003年，何鸿燊买回了猪首。 | — | 3.35 | DB | Stamp 「2003 · 港澳企业家」. Ho and a seller shake hands across the stand, hands meeting and pumping twice, with the pig head on its crate between them. No hammer. Counter 「回国 4/12」. | **Match cut on the crate**: the pig's crate becomes your crate, opened in the 2007 saleroom store (stamp 「2007 · 香港苏富比」). |
| D5 | 2007年，你又要上拍了。 | — | 2.85 | — | Two porters lift you out of the crate, hands under the collar, and set you on the podium. The lot board shows your lot number and the gavel rests on the block. Bidders sit with catalogues on their laps: **no paddles** (§6.1). | Continuous. |
| D6a | 这一次，锤子【没有落下】。 | 没有落下 | 2.85 | **no hit**: wants the music's thinnest moment | Pays off T3. The auctioneer lifts the gavel slow → fast. It stops at the top and trembles (2–3 px, ≈ 6 Hz), and it never comes down. | Same shot. |
| D6b | 国家文物局反对公开拍卖。 | — | 3.35 | DB | The lot board flips to 「撤拍」. The bidders stand and walk out, feet on the floor, and the room lights go out row by row until only your spot is left. Stamp 「2007.8 · 国家文物局」. The board and stamp leave before the next move. | The spot narrows to a desk lamp's pool and the room rebuilds around that same light into the private room. **One light becomes the next.** |
| D7a | 拍卖前，何鸿燊私下买下了你： | — | 3.60 | — | Pays off C2a in the same room. Ho walks in (feet stepping, hips steady), sits, and signs with his right hand while his left lies flat on the paper. You stand on the desk. | Same shot. |
| D7b | 【6910万港元】。 | 6910万港元 | 1.85 | **HIT** · **centred** | The price card stands up beside you, and 「6910万港元」 slams in big (≥ 120 px, scale-down plus damped jolt), fixed with no count-up. Counter 「回国 5/12」. | The price card slides right and becomes **the top of a tall bar**. |
| D8 | 比伦敦那次，贵了【二十多倍】。 | 二十多倍 | 3.35 | — | Two bars in US dollars. On the left, the London card 「几十万美元」 on a short bar. On the right, 「884万美元」 on a tall bar. A bracket between the bar tops reads 「二十多倍」, with labels ≥ 48 px. | The camera **rises up the tall bar**. Its top edge becomes the ceiling edge of the Paris saleroom, and the camera tilts down into the wine-coloured room. |
| D9a | 2009年，兄弟鼠和兔在巴黎上拍。 | — | 3.85 | — | Paris saleroom (stamp 「2009 · 巴黎佳士得」). Rat and rabbit sit on the podium with name tags. Paddles rise faster, alternating on half-beats. | Continuous. |
| D9b | 锤子落下：【3149万欧元】。 | 3149万欧元 | 2.85 | **HIT** (hammer 4) | A fast strike. The result board reads 「鼠首 + 兔首 · 3149万欧元」. | Same shot. |
| D10a | 买家却【拒绝付款】。 | 拒绝付款 | 2.35 | DB | The winning paddle lowers. A clerk standing at the board presses a stamp onto the result line with one hand, and 「未付款」 appears. | The camera **pans to the winning seat**. |
| D10b | 他认为：这本就是中国的。 | — | 3.10 | — | The buyer stands and walks out, leaving his paddle on the chair. The chair stays empty. No name, no face. | **Push past the empty chair** to the podium, while the wine light warms to daylight. |
| D11 | 2013年，鼠和兔被无偿送回。 | — | 3.35 | DB | Stamp 「2013 · 法国皮诺家族 · 无偿捐赠」. In front of rat and rabbit, two silhouettes hold one certificate, both with both hands on it, and pass it across. Two medallions light and the counter reads 「回国 7/12」. | The camera **follows the certificate** as it is laid on a table. A second certificate slides on top of it: yours, dated 2019 (paper match). |
| E1 | 2019年，何鸿燊把你捐给国家。 | — | 3.60 | — | Pays off C2b in the same hall, run longer (stamp 「2019.11.13 · 国家博物馆」). Two staff pull the cloth off you, and a donation plaque stands beside you. Ho is not drawn here. | A **lateral track left** past a wall edge, out of the hall and into the private room from D7a, now at night. |
| E2a | 2020年5月，何鸿燊去世，98岁。 | — | 3.60 | **STOP**: the lamp goes out on the music's stop | The same private room, empty. His chair is empty, the desk lamp is on, and the window shows night (stamp 「2020.5.26」). The lamp goes out exactly on the stop. | Same shot. |
| E2b | 他【没等到】，你回家的那天。 | 没等到 | 3.10 | in the stop (≤ 1 bar) · **centred** | The dark room. A single star in the window and a curtain stirring keep one living motion: no frozen frame (§6.12). | **Push through the window into the star.** The star becomes the copper glow inside your crate in a van. |
| H1a | 2020年12月1日， | — | 2.35 | pickup into the drop | The van drives from night into dawn, tracked with parallax (near and far trees at different speeds). Your glow leaks between the crate's slats. The van reaches the 圆明园 gate about 2 beats before the drop. | The camera keeps moving forward off the van, **through the gate** and up to the courtyard doors. |
| H1b | 你回到了圆明园。 | — | 2.35 | **DROP (hardest)** | Pays off T4 in the same framing. Two staff push the doors open on the hit, and warm copper light spills across the flagstones. No white flash, and the sky stays about 15 % darker so you are the brightest thing. A fast push 1.0 → 1.12 in half a second, then ease. You stand in the 文殊亭. The 午 dot on the counter lights. | Continuous. |
| H2 | 你离开了【160年】。 | 160年 | 2.35 | beat | A slow orbit around you (stamp 「1860 → 2020」). No hold. | **Crane up** out of the courtyard. |
| H3a | 十二个里，回到中国的有七个。 | — | 3.60 | — | Above the courtyard, the T5 ring of twelve medallions forms over the garden and seven light. Counter 「回国 7/12」. | Same shot. |
| H3b | 如今回到圆明园的，【只有你】。 | 只有你 | 3.35 | **HIT** (twist) | Six lit medallions arc out over the wall toward two building silhouettes on the skyline, labelled 「保利艺术博物馆」 (4) and 「国家博物馆」 (2) at ≥ 40 px. Only yours stays over the courtyard. 「回家 1/12」 punches in centred, then settles into the counter as its second row. | **Pull back wide.** |
| H4 | 你住进园里唯一幸存的古建筑。 | — | 3.85 | — | Wide: the courtyard among the garden's ruins (stamp 「正觉寺 · 文殊亭」). A ghost of the 1860 smoke (B2) drifts across the ruins and stops at the temple wall. | **Push in on you** and orbit to your profile, closing on the ear. |
| H5a | 细看，你有一只耳朵是卷的。 | — | 3.35 | — | Close-up. The near ear fills about 30 % of the frame height, with its top third visibly folded outward. The far ear is straight. | Same shot. |
| H5b | 研究的人说：你这一路被撞过。 | — | 3.60 | — | A thin ring closes on the fold (stamp 「研究者观察」, never 「检测」). Faint reflections of the saleroom spots slide across the copper. | **Match cut on the circle**: the ring becomes the round basin of the remembered fountain. |
| K1a | 正午12点，你们本该一起喷水。 | — | 3.60 | DB (section return) | Memory in warm sepia (stamp 「记忆里的水力钟 · 12:00」, never 「今天」, §6.9). The twelve sit on their stone bodies and twelve arcs rise, a callback to A4. | Same shot. |
| K1b | 现在，还差【十一个】。 | 十一个 | 2.35 | beat · **centred** | Eleven arcs fall, and those eleven heads fade to bare stone shoulders. Only your arc stays. | Same shot. |
| K2a | 六个，在国内的博物馆里， | — | 3.10 | — | Six of the empty seats get small tags 「保利 ×4 · 国博 ×2」. | Same shot. |
| K2b | 五个，至今【没回中国】。 | 没回中国 | 2.60 | DB | The other five seats show thick dashed outlines of 龙, 蛇, 羊, 鸡 and 狗, each recognisable. | The dragon's dashed outline **slides forward and stands on a podium**, and a violet saleroom builds itself around it. |
| K3a | 2018年，法国拍出一个疑似龙首， | — | 3.85 | **HIT (final hit)** | Stamp 「2018.12.17 · 法国」. The gavel is already raised as the shot opens and strikes on the hit. The dragon outline (long snout, whiskers, horns) shakes for 2–4 frames. | Same shot. |
| K3b | 真假，【说不清】。 | 说不清 | 1.85 | — | The outline half-lights and flickers, with a 「?」 over it. Stamp 「真伪仍存疑」. | The room's lights go out and the camera **pulls back through the dark** to the memory fountain: your single arc, eleven empty seats, five of them dashed. |
| Q | 剩下五个再上拍，该【花钱买回来】吗？ | 花钱买回来 | 4.10 | DB, then **fade-out** over the final bar, ending on a downbeat | **The one last image**: your single arc at noon among the empty seats. The Juno end card forms over it: J monogram, gold title, the question centred with its ？ pulled back by ½ em, the pill 「关注 Juno · 一起看懂世界」 and the sources, all arriving together with the question. | — (end) |

**Callbacks (set-up → payoff, the same shot run longer):**
- C2a → D7a, the private room.
- C2b → E1, the cloth pulled off in the hall.
- T1 → B3, the looter lifts you.
- T2 → D2a, hammer 1.
- T3 → D6a, the held gavel.
- T4 → H1b, the doors open on the drop.
- T5's ring → H3a/H3b.
- A4's twelve arcs → K1a.
- B2's fire → H4, where the smoke stops at the wall.
- D2a's London price → D8's bars.

**Transitions:** every hand-over between rooms is a different move. In order:
- continuous pull-back
- draped-shape match
- cloth wipe
- crane into the light dot
- rewind
- profile match
- arc ride
- light change + tilt
- ember push
- smoke → spotlight haze
- wallpaper re-paper
- lateral track
- crate match
- spot → lamp
- price card → bar
- rise up the bar
- pan to the chair
- certificate match
- track through a wall
- window → star → crate glow
- forward through the gate
- crane
- push into the ear
- ring → basin
- outline → podium reveal
- pull back through the dark

Hard cuts happen only in the T-montage and out of the title.

## Facts per line
- C1: F1.
- C2a: F13.
- C2b: F15.
- T1: F9.
- T2: F11.
- T3: F12.
- T4: F21.
- T5: F23, F27.
- A1: F5, F7 (乾隆年间 is the safe wording).
- A2: F4.
- A3a, A3b, A4: F3 (plus F8b for 11–13 h).
- B1a, B1b, B2: F9.
- B3: F9, F10.
- D1: F11 (correction 6).
- D2a, D2b: F11.
- D3a, D3b: F17.
- D4: F18 (港澳企业家: F13 note).
- D5: F12.
- D6a, D6b: F12.
- D7a, D7b: F13.
- D8: F11 + F13 估算.
- D9a, D9b, D10a, D10b: F19.
- D11: F20.
- E1: F15.
- E2a: F16.
- E2b: F16 + F21 估算.
- H1a, H1b: F21.
- H2: F21 估算.
- H3a, H3b: F21, F23, F24, F27.
- H4: F22.
- H5a, H5b: F6.
- K1a: F3.
- K1b: F21, F23.
- K2a, K2b: F23, F27.
- K3a, K3b: F26.
- Q: F12, F19, F26.

facts.py on these lines: every number traces.

**Flags (check before the build):**
1. **D6b 「反对公开拍卖」** paraphrases F12's 「表达了终止公开拍卖的坚定立场」. If the director wants the source's own words, use 「国家文物局：终止公开拍卖。」 (same duration).
2. **D10b** gives the view 环球人物 reports (「他认为这本来就是中国的东西」, F19). It is not a direct quote, and the buyer stays unnamed. It is the most pointed line in the film. It's optional: cutting it saves 3.1 s, and D10a works alone.
3. **Estimates:**
   - D2a 几十万美元: sources give $367k (NYRB) and $400k (MIT), so no exact figure goes on screen.
   - D8 二十多倍: US$8.84 m ÷ $0.367–0.40 m = 22–24×.
   - H2 160年 and E2b 没等到 are worked out from the dates.
4. **2026 status** (T5, H3b 如今, K2a, K2b) is caution under F27: nothing new to Oct 2026 and nothing contradicts it.
5. **Staging, not facts** (keep these off the stamps):
   - the private desk room (C2a, D7a; F13 says only "private sale brokered by Sotheby's");
   - the 2003 handshake (F18/MIT: bought from a New York collector);
   - the van in H1a.
   - **Don't draw Ho at the 2019 ceremony.** His presence isn't in facts.md.
6. **Ear (H5a/H5b)** is the researchers' observation (F6): the stamp reads 研究者观察 and the line says 研究的人说.

## What changed vs v4 (and why)
1. **Hook.** The paradox (「有人花6910万买下你，」 / 「又把你捐了出去。」) now comes before the title, so the first ~8 s carry a number and a contradiction. The title moves to the first drop (ep43 order, owner row 133). C1 「假如说…」 stays (owner's ask).
2. **Teaser.** v4 C2–C7 are rewritten as four fates and a punch after the title. Each one is paid off later on the same shot: T1 → B3, T2 → D2a, T3 → D6a, T4 → H1b. This replaces 「被捐了出去」 and 6910万 in the montage, which the hook now carries, and answers the cold read's "前14秒剧透完了".
3. **Rewind** moves from before the title to T5 → A1, where it carries the cut from 2026 back to 乾隆.
4. **Highlights** fall from 46 of 47 lines to 17 of 52. They come off places and names (伦敦, 圆明园, 猪首, 马首, 疑似龙首, 水池两边) and stay only on numbers, turns and outcomes.
5. **Fourteen two-line blocks**, and every line is ≤ 16 wide (v4 D14 was 16.5).
6. **B section** goes from 3 lines to 5 short ones with the fire as its own HIT line. 「不知去了哪」 becomes 「你被带走了。」 (correction 6: no claim about 1860–1989).
7. **D2a** puts the London price on screen (几十万美元), so D8 has a baseline. 「比上一次」 becomes 「比伦敦那次」. Cold read: "1989年是什么？"
8. **D3b** 「被买回中国」 becomes 「三个都被买了回来」, and who bought them goes in the stamp (保利购回). Cold read: "谁买回的？"
9. **D4:** 港澳企业家 moves to the stamp to fit 16, and the line keeps the name.
10. **D6b (new)** says why the hammer didn't fall (F12). Cold read: "流拍？撤拍？没解释".
11. **D7a:** 「还是何鸿燊」 becomes 「何鸿燊私下买下了你」, which names the private sale (F13) instead of relying on the pig-head memory.
12. **D10b (new)** gives the buyer's reason (F19). It answers the cold read's "为什么拒付" and sets up the end question.
13. **D11:** 「4年后，鼠和兔被法国一家人送回」 becomes 「2013年，鼠和兔被无偿送回」. It reads alone, and 无偿 is F20's word. The family goes in the stamp.
14. **E1 「2007到2019年，你在港澳展出」 is cut.** It held no turn and was the weakest beat in the number run. The old E2 is now E1.
15. **H1b** no longer highlights 圆明园, a place. The drop picture carries it, and H2's 160年 is the number.
16. **H3/H4** keep 「如今…只有你」 (guards the 2023 visit). In the picture the twist uses the same ring as T5, so set-up and payoff match.
17. **H7 「人们发现」 becomes H5a 「细看」.** It invites the viewer to find the fold before H5b explains it (gate 4 N8).
18. **K2 「还差十一个：六个在博物馆，」** is split into K1b and K2a so each reads alone (cold read: "差五个还是差十一个？").
19. **K5 「2018年，法国拍出疑似龙首，」/「真假，说不清。」** keeps its wording. 「疑似」 and 「说不清」 stay (F26).
20. **Q:** 「如果找到了」 becomes 「剩下五个再上拍」. It is a concrete case, since one has already come up for sale, so it starts arguments.
21. **Timing:** no seconds. Every line has a reading minimum and a HIT/DB/STOP/DROP mark for the producer to lay onto bgm2 (one cut + fade-out). The old landmarks are void.

**Reinstate if the cut runs short:** 「谁带走的，没有记录。」 after B3 (F10, +2.6 s) · 「2007到2019年，你在港澳展出。」 before E1 (F14, +3.6 s) · 「240万欧元」 on K3b (F26, +1.25 s).

---

# Script v4 (gate-4 fixes, 2026-10-25 overnight)

**Bed:** `music/build45film.py` v2 — same cut; softer lead-in before the drop (−2 dB from 106.986, breath −8 dB) so the drop lifts on a phone; the −3 dB bookend now ramps over the gap; XF[3] 20 ms.
Landmarks (measured by the music review): title crash 18.115 · B section 20.947 · S2 34.53 · S3 48.12 · **D2 hammer HIT 57.175** (the old "re-entry HIT 63.97" was a wrong offset; D4 stays a hammer on the grid) · valley 75.29 · 808 booms 79.815 (D9) / 84.344 (D11) · crash 88.87 · stop HIT 105.29 · silence 105.98–106.96 · re-entry 106.986 · lead-in 109.25 (H1a) · DROP 116.04 · coda cut 125.10 · coda chords 128.16 / 131.64 / 134.98 · dead STOP 136.09 · intro return **138.332** (K1) · FINAL HIT 146.82 · end 154.18.
**Line changes from v3:** E1 「2007到2019年，你在港澳展出。」 (v3 read as 2013–2025) · E2 「2019年，何鸿燊把你捐给国家。」 (names him again) · K5 split: 「2018年，法国拍出疑似龙首，」 + stack 「真假，说不清。」 · anchors moved to the measured music (D9, D11, H1a, H5, H7, H8, K1, K2, Q). Pace: no line too fast.

| # | Time | Line | Kind |
|---|---|---|---|
| C1 | 0.00–3.40 | 假如说，你是圆明园的【马首】。 | typed |
| C2 | 3.40–5.66 | 1860年，你被【抢走】， | cut |
| C3 | 5.66–7.93 | 在伦敦，被【拍卖】， | cut |
| C4 | 7.93–10.19 | 又被人花【6910万】买下， | cut |
| C5 | 10.19–12.46 | 又被【捐了出去】。 | cut |
| C6 | 12.46–14.72 | 2020年，你【回家】了。 | cut |
| C7 | 14.72–17.55 | 可十二个里，还有【五个】没回来。 | punch |
| A1 | 20.95–24.91 | 乾隆年间，你由红铜【一次铸成】。 | typed |
| A3 | 24.91–28.87 | 你和十一个兄弟，坐在【水池两边】。 | typed |
| A4 | 28.87–32.27 | 每两小时，轮到谁，【谁就喷水】。 | typed |
| A6 | 32.27–34.53 | 你是【午时】。 | cut |
| A7 | 34.53–40.19 | 正午十二点，十二个【一起喷水】。 | typed |
| B1 | 40.19–43.59 | 1860年，英法联军【进了园子】。 | typed |
| B2 | 43.59–48.12 | 能搬走的都被搬走，然后【一把火】。 | typed |
| B4 | 48.12–52.08 | 你被带走了，【不知去了哪】。 | typed |
| D1 | 52.08–55.48 | 一百多年后，你出现在【伦敦】。 | typed |
| D2 | 55.48–59.44 | 锤子落下，你被台湾收藏家【买走】。 | typed |
| D3 | 59.44–63.97 | 兄弟牛、猴、虎，也【上了拍卖台】。 | typed |
| D4 | 63.97–66.23 | 锤子落下：被【买回中国】。 | cut |
| D5 | 66.23–69.63 | 港澳企业家何鸿燊，买回了【猪首】。 | typed |
| D6 | 69.63–72.46 | 2007年，你又要【上拍】了。 | typed |
| D7 | 72.46–75.29 | 这一次，锤子【没有落下】。 | cut |
| D8 | 75.29–79.81 | 拍卖前，还是何鸿燊，买下了你： | typed |
| D9 | 79.81–81.51 | 【6910万港元】。 | punch |
| D10 | 81.51–84.34 | 比上一次，贵了【二十多倍】。 | typed |
| D11 | 84.34–88.87 | 巴黎，你的兄弟鼠和兔上拍， | typed |
| D12 | 88.87–91.14 | 锤子落下：【3149万欧元】。 | cut |
| D13 | 91.14–93.40 | 买家却【拒绝付款】。 | cut |
| D14 | 93.40–96.80 | 4年后，鼠和兔被法国一家人【送回】。 | typed |
| E1 | 96.80–99.63 | 2007到2019年，你在港澳【展出】。 | typed |
| E2 | 99.63–102.46 | 2019年，何鸿燊把你【捐给国家】。 | typed |
| E3 | 102.46–105.29 | 2020年5月，他去世了，【98岁】。 | typed |
| E4 | 105.29–109.25 | 他没等到，【你回家】那天。 | punch |
| H1a | 109.25–116.04 | 2020年12月1日， | typed |
| H1b | 116.04–118.87 | 你回到【圆明园】。 | stack |
| H2 | 118.87–121.14 | 你离开了【160年】。 | cut |
| H3 | 121.14–125.10 | 十二个里，回到中国的有【七个】。 | typed |
| H4 | 125.10–128.16 | 如今回到圆明园的，【只有你】。 | stack |
| H5 | 128.16–131.64 | 你住进园里唯一【幸存】的古建筑。 | typed |
| H7 | 131.64–134.98 | 人们发现，你的一只耳朵【卷了】。 | typed |
| H8 | 134.98–138.33 | 研究的人说：你一路【被撞过】。 | typed |
| K1 | 138.33–141.73 | 正午十二点，你们本该【一起喷水】。 | typed |
| K2 | 141.73–144.57 | 还差【十一个】：六个在博物馆， | cut |
| K4 | 144.57–146.82 | 五个，至今【没回中国】。 | cut |
| K5 | 146.82–149.65 | 2018年，法国拍出【疑似龙首】， | typed |
| K5b | 149.65–151.36 | 真假，【说不清】。 | stack |
| Q | 151.36–154.18 | 如果找到了，该【花钱买回来】吗？ | end |

# Script v3 (film cut on the music, 2026-10-24 night; owner OK'd v2.1 at 22:23, then asked for the final video)

**Bed:** `music/build45film.py` = the ep42 'v2' cut of bgm2 with the 4-bar intro loop in front (154.18 s, −14 LUFS).
Landmarks: title crash 18.115 · B section 20.947 (A1) · S2 34.53 (A7 noon) · S3 48.12 (B4) · re-entry HIT 63.97 (D4 hammer) · valley 75.29 (D8) · crash 88.87 (D12 hammer) · stop HIT 105.29 (E4) + silence 105.98–106.96 · lead-in (H1a) · DROP 116.04 (H1b 你回到圆明园) · coda cut 125.10 (H4 只有你) · dead STOP 136.09 · intro return 137.77 (K1 noon memory) · FINAL HIT 146.82 (K5 dragon hammer) · end 154.18.
**Line changes from v2.1 (to fit the music, no new facts):** C4 drops 港元 (in the stamp) · A5 dropped (the 「水力钟」 label is on the picture) · D12 drops 两件 (stamp 鼠首 + 兔首) · E1 「之后12年，你在港澳展出。」 · E2 「2019年，他把你捐给国家。」 · H1 split into H1a 「2020年12月1日，」 + H1b 「你回到圆明园。」 on the drop · H5+H6 → 「你住进园里唯一幸存的古建筑。」 (F22: 唯一幸存保留至今的古建筑) · H8 「研究的人说：你一路被撞过。」 · K2+K3 → 「还差十一个：六个在博物馆，」 · K5+K6 → 「2018年，法国拍出疑似龙首：真假说不清。」 (F26). Pace: waiting 10 % (≤ 12 %), no line too fast.

| # | Time | Line | Kind |
|---|---|---|---|
| C1 | 0.00–3.40 | 假如说，你是圆明园的【马首】。 | typed |
| C2 | 3.40–5.66 | 1860年，你被【抢走】， | cut |
| C3 | 5.66–7.93 | 在伦敦，被【拍卖】， | cut |
| C4 | 7.93–10.19 | 又被人花【6910万】买下， | cut |
| C5 | 10.19–12.46 | 又被【捐了出去】。 | cut |
| C6 | 12.46–14.72 | 2020年，你【回家】了。 | cut |
| C7 | 14.72–17.55 | 可十二个里，还有【五个】没回来。 | punch |
| A1 | 20.95–24.91 | 乾隆年间，你由红铜【一次铸成】。 | typed |
| A3 | 24.91–28.87 | 你和十一个兄弟，坐在【水池两边】。 | typed |
| A4 | 28.87–32.27 | 每两小时，轮到谁，【谁就喷水】。 | typed |
| A6 | 32.27–34.53 | 你是【午时】。 | cut |
| A7 | 34.53–40.19 | 正午十二点，十二个【一起喷水】。 | typed |
| B1 | 40.19–43.59 | 1860年，英法联军【进了园子】。 | typed |
| B2 | 43.59–48.12 | 能搬走的都被搬走，然后【一把火】。 | typed |
| B4 | 48.12–52.08 | 你被带走了，【不知去了哪】。 | typed |
| D1 | 52.08–55.48 | 一百多年后，你出现在【伦敦】。 | typed |
| D2 | 55.48–59.44 | 锤子落下，你被台湾收藏家【买走】。 | typed |
| D3 | 59.44–63.97 | 兄弟牛、猴、虎，也【上了拍卖台】。 | typed |
| D4 | 63.97–66.23 | 锤子落下：被【买回中国】。 | cut |
| D5 | 66.23–69.63 | 港澳企业家何鸿燊，买回了【猪首】。 | typed |
| D6 | 69.63–72.46 | 2007年，你又要【上拍】了。 | typed |
| D7 | 72.46–75.29 | 这一次，锤子【没有落下】。 | cut |
| D8 | 75.29–79.25 | 拍卖前，还是何鸿燊，买下了你： | typed |
| D9 | 79.25–81.51 | 【6910万港元】。 | punch |
| D10 | 81.51–84.91 | 比上一次，贵了【二十多倍】。 | typed |
| D11 | 84.91–88.87 | 巴黎，你的兄弟鼠和兔上拍， | typed |
| D12 | 88.87–91.14 | 锤子落下：【3149万欧元】。 | cut |
| D13 | 91.14–93.40 | 买家却【拒绝付款】。 | cut |
| D14 | 93.40–96.80 | 4年后，鼠和兔被法国一家人【送回】。 | typed |
| E1 | 96.80–99.63 | 之后12年，你在港澳【展出】。 | typed |
| E2 | 99.63–102.46 | 2019年，他把你【捐给国家】。 | typed |
| E3 | 102.46–105.29 | 2020年5月，他去世了，【98岁】。 | typed |
| E4 | 105.29–110.40 | 他没等到，【你回家】那天。 | punch |
| H1a | 110.40–116.04 | 2020年12月1日， | typed |
| H1b | 116.04–118.87 | 你回到【圆明园】。 | stack |
| H2 | 118.87–121.14 | 你离开了【160年】。 | cut |
| H3 | 121.14–125.10 | 十二个里，回到中国的有【七个】。 | typed |
| H4 | 125.10–127.93 | 如今回到圆明园的，【只有你】。 | stack |
| H5 | 127.93–131.33 | 你住进园里唯一【幸存】的古建筑。 | typed |
| H7 | 131.33–134.72 | 人们发现，你的一只耳朵【卷了】。 | typed |
| H8 | 134.72–137.77 | 研究的人说：你一路【被撞过】。 | typed |
| K1 | 137.77–141.17 | 正午十二点，你们本该【一起喷水】。 | typed |
| K2 | 141.17–144.57 | 还差【十一个】：六个在博物馆， | cut |
| K4 | 144.57–146.82 | 五个，至今【没回中国】。 | cut |
| K5 | 146.82–150.79 | 2018年，法国拍出疑似龙首：真假【说不清】。 | typed |
| Q | 150.79–154.18 | 如果找到了，该【花钱买回来】吗？ | end |

---

# Script: 圆明园马首 (v2.1 · gate 1 r1 + r2 notes; for the owner)

Screenwriter (producer), 2026-10-24. Files: this script + `lines.json` (49 lines, `[[start, end, "text"], ...]`, `[ ]` = key word).
**Length:** 155.0 s (2:35) on the reading budget (0.5 + 字/7 + 0.6; typed lines +0.4), 0.25 s grid. Retime to bgm2's bars comes with the music (±8 % → ≈2:45 worst case, under 3:00).
**Title card:** 18.0–21.0 placeholder; it goes on bgm2's first big drop once measured (owner row 133). **Widest line:** 15.55. **Pace:** waiting 6 % (≤ 12 %); MINOR holds are named beats (noon fountain, fire, counter going dark, the twist, the end card).

## Changelog v2.1 (gate 1 r2: director REVISE, wording only, replacements pre-approved; score 4.5)
| Note | Change |
|---|---|
| N1 | K3 「六个，在国内的博物馆里，」 (four of the six originals are touring in 2026, F27); picture label 「收藏：保利艺术博物馆 · 国家博物馆」. |
| N2 | H8 stamp 「研究者观察」 (北大 tested the copper; the curled ear is an observation, F6 updated); picture: highlight ring, no scan line. |
| N3 | H4 「如今回到圆明园的，只有你。」 (guards against the 2023 12-day visit, F24). |
| N4 | K6 「240万欧元。是真是假，说不清。」 (no 它). |
| N5 | C7's counter reads 回国 7/12 (storyboard). C7 stamp 「— 2026年10月」. |
| N6 | D7 stamp in F12's words. |
| N7 | F18 → 保利艺术博物馆; 港澳企业家 sourced (F13: 人民日报海外版/中国日报 「港澳知名企业家」); takeaway arithmetic fixed. |
| optional | B1 drops 「10月」 (stamp has it). |

## Changelog v2 (director REVISE 4/5 + cold read)
| Note | Change |
|---|---|
| 1 (STRUCTURAL, device) | Counter renamed: 乾隆 「在家 12/12」 → 1860 「回国 0/12」 → 3 → 4 → 5 → 7. **「回家」 is kept only for 圆明园**: at H4 a second row appears, 「回家 1/12」. C6/E4/H1 「回家」 now agree with the counter; the twist is a reveal, not a correction. |
| 2 | 「十二个兄弟」 → C7 「可十二个里…」, H3 「十二个里…」 (you + eleven brothers). |
| 3 | Ending rebuilt: K2 还差十一个 → K3 六个在北京城里的博物馆 → K4 五个至今没回中国 → **new K5–K6: the 2018 suspected dragon (240万欧元, 真假说不清)** (F26) → Q. The question now has a live case behind it. |
| 4 | C4 「**又**被人花6910万港元买下」 (two sales, not one). D2 stamp: 「— 1989 · 伦敦苏富比 · 几十万美元」. |
| 5 | C5 「又被[捐了出去]」. |
| 6 | 何鸿燊 named at D5 (港澳企业家, the sources' words), D8 「还是何鸿燊」, E2. D7 stamp: 「国家文物局：主张终止公开拍卖」 (F12). |
| 7 | Number soup: years moved to stamps (D3, D11, D14 → 「4年后」); brothers keep the 你 voice (「兄弟…」 「你的兄弟鼠和兔」); D12 「两件 3149万欧元」. |
| 8 | 它们 gone (D14 「鼠和兔」). E1 「2007年起，你在港澳展出12年」. |
| 9 | H2 「你离开了160年」. H5/H6 each read alone (「你住进了正觉寺，」/「园里唯一没被烧掉的古建筑。」, F22's 古建筑). H8 「这一路」. H9–H10 (2023 visit) **cut for length** (−5.75 s); the six are covered by K3. Reinstate if the owner wants the beat. |
| 10 | A1+A2 → 「乾隆年间，你由红铜一次铸成。」 (no 出生 overclaim). A4 「每两小时…」. |
| 11 | facts.md: F26 dragon lot; F27 status to Oct 2026 (Kunshan show from 31 Oct 2026 lists the same seven, four originals; no new return); R3/R5/唯一 sources noted. |
| 15 | B2 folded into one line 「能搬走的都被搬走，然后一把火。」 (stamp 1860.10.18). |
| facts | D6 「又要上拍」. |
| 12, 13, 14 | Art/editor notes, logged for key frames and the demo: C1 water drop on beat 1 + a second event ≈2 s; the title gap is all motion with music; D10 tags both in USD (几十万美元 vs 884万美元). |

**Not changed (director's list):** C1 on frame 0 and C1–C7 as one sentence over hard cuts · A4–A7 + K1–K2 noon bookend · B4 · the hammer set-piece (D7 held hammer, D9 slam) · D13 · E1–E4 + the full pause · H3–H4 · H5–H6 · H7–H8 · Q.

---

**Logline:** 假如说，你是圆明园的马首。你是水力钟的午时：只有到你，十二个才一起喷水。1860年你被带走，在伦敦、香港的拍卖台上一次次被估价；2007年锤子没落下，何鸿燊买下你，又把你捐了出去。2020年你回到圆明园：回国的有七个，回家的只有你。
**Takeaway:** 回国 ≠ 回家。正午本该十二个一起喷水，现在还差十一个；五个没回中国：四个下落不明，一个真假未定。该不该花钱买回来？

## Device
- **「你」 = the horse head**; other heads are 兄弟. **Counter (bottom-left, the series position):** 在家 12/12 → 回国 0/12 … 7/12; at H4 a second row 回家 1/12, only your slot lit. Fallback 「你 X 岁」 not used (birth year is caution, F7).
- **Stamp** (top right): year · place · one source note, every dated line.
- **Set-piece: the hammer**, 4 auctions, faster each time, each a different result (falls → sold · falls ×3 → brothers back · **held, never lands** · falls → nobody pays), then the dragon (falls → 说不清).

## Title options (owner picks)
1. **马首回家，用了160年** — director's #1: true as read (1860→2020), names the subject, keeps the twist. Weak spot: the cold open already gives 1860 and 2020.
2. **花6910万买下，又捐了出去** — the cold reader's click; director: rises to #1 if the cover carries 马首. Leads with the gift paradox.
3. **回到圆明园的，只有它** — strongest curiosity but spoils H4, and the cold reader read it as "only one came back" (misleads). Not recommended.

## Cold open, written out (0–21 s)
| # | Time | Line | Stamp | Picture (one event per cut) |
|---|---|---|---|---|
| C1 | 0.00–3.50 | 假如说，你是圆明园的【马首】。 | — 圆明园 | Frame 0: the red-copper head fills the frame, the only warm colour; a water drop falls from its mouth on beat 1, the light swings across it at ≈2 s. Typed on. |
| C2 | 3.50–5.50 | 1860年，你被【抢走】， | — 1860 · 圆明园 | Hard cut: flames reflected on the copper. |
| C3 | 5.50–7.50 | 在伦敦，被【拍卖】， | — 1989 · 伦敦 | Hard cut: podium, the hammer lands on the beat. |
| C4 | 7.50–10.25 | 又被人花【6910万港元】买下， | — 2007 · 香港 | Hard cut: the price rolls up on a lot card; the hammer rises and stops. |
| C5 | 10.25–12.25 | 又被【捐了出去】。 | — 2019 · 北京 | Hard cut: the head passed between two silhouettes. |
| C6 | 12.25–14.75 | 2020年，你【回家】了。 | — 2020 · 圆明园 | A small lit pavilion at night. |
| C7 | 14.75–18.00 | 可十二个里，还有【五个】没回来。 | — 2026年10月 | Pull back: twelve slots, seven faintly lit, five empty outlines. Centred, bigger. |
| T | 18.00–21.00 | **(title on the drop)** | | ◀◀ rewind, all motion: the year spins back, the twelve fly into one fountain, title slams in. |

## Full script
| # | Time | Line | Stamp · counter | Picture | Facts |
|---|---|---|---|---|---|
| A1 | 21.00–24.25 | 乾隆年间，你由红铜【一次铸成】。 | — 乾隆年间 · 海晏堂 · 在家 12/12 | Copper poured; the mould opens on you, seamless. | F2, F5 |
| A3 | 24.25–27.75 | 你和十一个兄弟，坐在【水池两边】。 | | Push out: Haiyantang fountain, twelve robed stone bodies in a 八, you warm, the rest cool. | F4 |
| A4 | 27.75–31.00 | 每两小时，轮到谁，【谁就喷水】。 | | A shadow sweeps; one arc passes head to head, speeding up. | F3 |
| A5 | 31.00–33.75 | 人们叫你们：【水力钟】。 | | | F3 |
| A6 | 33.75–35.50 | 你是【午时】。 | — 11:00–13:00 | The shadow reaches 午; your arc rises. | F3, F8b |
| A7 | 35.50–40.50 | 正午十二点，十二个【一起喷水】。 | | **Set-piece:** twelve arcs rise together. Hold. | F3 |
| B1 | 40.50–43.50 | 1860年，英法联军【进了园子】。 | — 1860.10 · 圆明园 | Flat silhouettes at the gate (no faces, no flags). | F9 |
| B2 | 43.50–48.00 | 能搬走的都被搬走，然后【一把火】。 | — 1860.10.18 | Silhouettes carrying things past the fountain, then fire; C2 paid off. | F9 |
| B4 | 48.00–51.75 | 你被带走了，【不知去了哪】。 | 在家 12/12 → 回国 0/12 | Your seat empty; the twelve slots go dark. | F9, F10 |
| D1 | 51.75–55.00 | 一百多年后，你出现在【伦敦】。 | — 1989 · 伦敦苏富比 | You under a spotlight on a podium. | F11 |
| D2 | 55.00–58.50 | 锤子落下，你被台湾收藏家【买走】。 | 几十万美元 | **Hammer 1**, full wind-up. C3 paid off. | F11 |
| D3 | 58.50–61.75 | 兄弟牛、猴、虎，也【上了拍卖台】。 | — 2000 · 香港 | Three brothers in turn. | F17 |
| D4 | 61.75–64.25 | 锤子落下：被【买回中国】。 | 回国 3/12 | **Hammer 2**, three quick hits. | F17 |
| D5 | 64.25–67.75 | 港澳企业家何鸿燊，买回了【猪首】。 | — 2003 · 回国 4/12 | No hammer: a handshake silhouette. | F18 |
| D6 | 67.75–70.50 | 2007年，你又要【上拍】了。 | — 2007 · 香港苏富比 | You back on the podium. | F12 |
| D7 | 70.50–73.75 | 这一次，锤子【没有落下】。 | 国家文物局：主张终止公开拍卖 | **Hammer 3** raised and held (the pause before a hit that never comes). | F12 |
| D8 | 73.75–77.00 | 拍卖前，还是何鸿燊，买下了你： | | The same silhouette. | F13 |
| D9 | 77.00–79.00 | 【6910万港元】。 | 回国 5/12 | The number slams in, centred; C4 paid off. | F13 |
| D10 | 79.00–82.00 | 比上一次，贵了【二十多倍】。 | 几十万美元 → 884万美元 | Two tags, both in USD. | F11, F13 (估算) |
| D11 | 82.00–85.25 | 巴黎，你的兄弟鼠和兔上拍， | — 2009 · 巴黎 | | F19 |
| D12 | 85.25–88.00 | 锤子落下：两件【3149万欧元】。 | | **Hammer 4**, fast. | F19 |
| D13 | 88.00–90.25 | 买家却【拒绝付款】。 | | The lot card stamps 未付款. | F19 |
| D14 | 90.25–93.75 | 4年后，鼠和兔被法国一家人【送回】。 | — 2013 · 回国 7/12 | No hammer: two slots light. | F20 |
| E1 | 93.75–97.00 | 2007年起，你在港澳【展出】12年。 | — 2007–2019 · 香港 · 澳门 | Glass case; visitors time-lapse. | F14 |
| E2 | 97.00–100.25 | 2019年，何鸿燊把你【捐给国家】。 | — 2019.11.13 · 国家博物馆 | C5 paid off. | F15 |
| E3 | 100.25–103.25 | 2020年5月，他去世了，【98岁】。 | — 2020.5 | An empty chair; a lamp goes out. | F16 |
| E4 | 103.25–106.75 | 他没等到，【你回家】那天。 | | The one full pause (pauses.md), then the drop. | F16, F21 |
| H1 | 106.75–110.00 | 2020年12月1日，你回到【圆明园】。 | — 2020.12.1 · 圆明园 | On the drop; C6 paid off. | F21 |
| H2 | 110.00–112.50 | 你离开了【160年】。 | 1860 → 2020 | Centred. | F21 (估算) |
| H3 | 112.50–115.75 | 十二个里，回到中国的有【七个】。 | 回国 7/12 | | F23, F27 |
| H4 | 115.75–119.75 | 如今回到圆明园的，【只有你】。 | 回国 7/12 + **回家 1/12** | **Twist:** a second counter row; six glows drift to two buildings in the city (收藏：保利艺术博物馆 · 国家博物馆). | F21, F23, F24, F27 |
| H5 | 119.75–122.25 | 你住进了【正觉寺】， | — 正觉寺 · 文殊亭 | Temple courtyard among ruins. | F22 |
| H6 | 122.25–125.25 | 园里唯一【没被烧掉】的古建筑。 | | The B2 fire as a ghost layer stops at the temple wall. | F22 |
| H7 | 125.25–128.50 | 人们发现，你的一只耳朵【卷了】。 | | Close: one ear curled. | F6 |
| H8 | 128.50–131.50 | 研究的人说：这一路，你【被撞过】。 | 研究者观察 | A highlight ring on the curled ear. | F6 |
| K1 | 131.50–135.00 | 正午十二点，你们本该【一起喷水】。 | — 正午 | A7 returns as a translucent memory. | F3 |
| K2 | 135.00–137.50 | 还差【十一个】。 | 回家 1/12 | Memory fades; only your arc stays. Centred. | F21, F23 |
| K3 | 137.50–140.50 | 六个，在国内的博物馆里， | 收藏：保利艺术博物馆 · 国家博物馆 | Six glows in two buildings. | F23, F27 |
| K4 | 140.50–142.75 | 五个，至今【没回中国】。 | | Five empty outlines. | F23, F27 |
| K5 | 142.75–146.00 | 2018年，法国拍出一个【疑似龙首】， | — 2018.12.17 · 法国 | **Hammer 5** falls on an outline with a question mark. | F26 |
| K6 | 146.00–149.25 | 240万欧元。是真是假，【说不清】。 | 真伪仍存疑 | The outline stays half-lit. | F26 |
| Q | 149.25–155.00 | 如果找到了，该【花钱买回来】吗？ | | Juno end card. | F12, F19, F26 |

**Alternative end question:** 「你觉得，它们还能【回家】吗？」
**Cut candidates if the retime runs long:** D10 (−3.0), K3 (−3.25, the picture carries it), A5 (−2.75).
