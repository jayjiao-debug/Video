# Script v5.1 (rebuild, gate 1 r1 fixes, 2026-10-25)

Screenwriter. v5 revised in place after `notes_gate1_v5_r1.md` (director REVISE, notes 1–9) and `coldread_gate1_v5.json`. Facts as amended: F4b, F19 and F20. Lines file: `lines_v5.json` (49 × `[null, null, "text with [key]"]`, in order).

- **Length:** 49 lines (was 52). Reading minimums add up to **148.4 s** (was 157.7). Each line rounded up to whole beats (0.566 s) gives **≈ 162.5 s**. Add the title bar, the rewind bar and the end-card tail (≈ 7.5 s) and the film is **≈ 170 s**.
- **Min duration** = max(1.8, 0.25 × 字 + 0.6). 字 counts CJK characters plus ⌈digits/2⌉ per number.
- **Width:** every line is ≤ 16 (CJK and punctuation 1, digits 0.5). Lines at 16: D3, D9b, D11, Q.
- **Checks:** pace.py shows 0 lines too fast and 0 % waiting at the minimums. facts.py traces every number.
- **Highlights:** 15 / 49 (31 %), on numbers, turns and outcomes only.
- **Year mentions in lines:** 3, down from 13 (1860, 2007, 2020年5月, plus 「同年12月1日」). Every other year lives in its stamp.
- **Markers:** a/b = two-line block. **HIT** = music hit. **DB** = downbeat or section start. **STOP** = the track's stop. **DROP** = the hardest drop.
- **World tag `[wall]`**: the shot obviously sits on the hybrid look's bronze relief wall (Look 3 铜壁: recorded history = the sale years, plus the ending). Untagged shots are the main world (Look 1 铜灯影) or for the art director to place. `style/looks_v2.md` ("Hybrid") is the authority.
- **On the wall:** relief figures don't walk. Their actions are hinged relief parts (gavel arm, paddles, hands, doors), and labels are cast in (molten letters fill, then cool). You stay in the round in front of the wall and are never moved by a relief hand; the history changes behind you.

## Changelog v5 → v5.1
| Note | What changed |
|---|---|
| D1 (High) 2007 staged before the sale | T3, D5, D6a and D6b are now the saleroom **before** the sale: empty chairs with catalogues on the seats, you on the podium under a work light, the gavel lying on its block. D6a = a slow push to the untouched gavel. D6b = 「撤拍」 cast into the lot card, then the room lights go out row by row to your spot. No bidders, no auctioneer, nobody lifts the gavel. The lines stay. |
| D2 | T5 → 「可十二个里，还有【五个】没回中国。」. The ring reads 「回国 7/12」. |
| D3 | D9a/D9b: a phone bank (a clerk with a handset raises the paddle). **Two strikes** on two beats, and the board reads 「鼠首 + 兔首 · 合计」. The line is the coordinator's/director's own: 「锤子落下，两个共拍出3149万欧元。」 (F19), no highlight. D10a: a visible time step (the lamp sweeps five times, stamp 2009.2.25 → 「2009.3.2 · 北京」), then 「未付款」, with the line 「5天后，买家却【拒绝付款】。」 (F19: 5 days, announced in Beijing). D10b: the handset laid back on its cradle; no buyer is ever in the room. |
| D4 | D11 is staged at the **国家博物馆, Beijing, 2013.6.28** (F20), with its own move: push into rat and rabbit as the wine light warms, and the podium becomes a museum plinth (shape match). The line names the giver (cold read: 「谁送回的？」): 「一个法国家族，把鼠和兔无偿捐回。」 Stamp 「皮诺家族」. |
| D5 | **(a) K2a cut.** The tags 「保利 ×4 · 国博 ×2」 move onto six seats during K1b. **(b) Roll call made one beat:** D3a + D3b + D4 → D3 「牛、猴、虎、猪，先后被买回中国。」 (also the cold read's 2000/2003 note). Who bought them is in the stamps (2000 · 保利购回 / 2003 · 何鸿燊购回). |
| D6 | Highlights removed from D2a (几十万美元) and D9b (3149万欧元). |
| D7 | Q → 「五个要是上拍，该不该【花钱买回来】？」 |
| D8 | (a) E1 → E2a: push into the brass donation plaque, which becomes the brass base of the desk lamp (material match; no second lateral track). (b) H4: the 西洋楼 ruins only far in the background (正觉寺 is in 绮春园). |
| D9 | A2/A3: two rows of six on either side of the pool, with you in the middle of your row and never the snake beside you (F4b). At 午时 the water and light hand-over **crosses the pool** from the snake on the far bank to you. Because the hours alternate banks, every hand-over crosses. No 南/北 labels and no seat numbers on screen. |
| Cold read: teaser = summary, then restart (biggest swipe risk) | T1–T4 keep the director's structure (one running sentence over hard cuts, each paid off later) but lose every year and become images: 「你被人抢走，」/「被一锤子卖掉，」/「差点又上了拍卖台，」/「终于，你回了家。」 (8.4 s, was 10.65). They read as a promise of four scenes. The rewind carries the restart. The T3 riddle (「锤子没有落下」) is gone, and the gavel line now lands first at D6a. |
| Cold read: 13 years in lines | Down to 3. Years dropped where the stamp carries them: T1, T3, T4, D3 (2000, 2003), D9a (2009), D11 (2013), E1 (2019), H1a (→ 「同年」), K3a (2018). |
| Cold read: 五个 vs 十一个 | T5 says 没回**中国** (note 2). K2 → 「**其中**五个，至今【没回中国】。」, so the five are visibly a subset of the eleven. |
| Cold read: 6910万 reads as RMB | C2a → 「有人花【6910万港元】买下你，」 (+0.5 s). |
| Cold read: D1 repeats T2's 伦敦 | T2 no longer names London. D1 is the first time it is said. |
| Cold read: who gave 2019 | E1 → 「何鸿燊，也把你捐给了国家。」. 也 rhymes with the French family's gift one line earlier. |
| Cold read: dragon detour muddies the end | K3a is shorter and has no year: 「法国还拍出过一个疑似龙首，」. K3a/K3b stay (director's don't-change list), and Q follows straight after. |
| Kept as peaks | E2b 「他【没等到】，你回家的那天。」 on the stop. H3b 「如今回到圆明园的，【只有你】。」 on a hit. Neither changed. |

**Not taken from the cold read, and why:**
- **A real price for 1989:** F11's two figures disagree ($367k / $400k). The safe wording stays 「几十万美元」, and D8's bars make the 20× visible. Option for the director: 「三四十万美元」 covers both sources, but facts.py flags it as not in a row, so I left it out.
- **The buyer's name:** F19 says to keep it off screen. The stamp says 「买家本人宣布 · 北京」.
- **正觉寺 in the H4 line:** no room within 16. The name is in the stamp.

## Title options (≤ 10 字)
1. **马首回家，用了160年.** True as read (1860 → 2020, F21 估算), names the subject, and uses the twist word 回家. The cold reader finds it CCTV-like.
2. **假如你是圆明园马首.** The ep43 format title; it says who 你 is and can't overclaim. The cold reader finds it template-like.
3. **6910万买下，又捐了出去.** The cold reader's click: a number plus a contradiction. It fits the 10-字 cap, but the cold read took bare 6910万 as RMB, so the cover must carry HK$ (the film's C2a now says 港元).

## Story in 3 lines
1. 你是圆明园水力钟的马首：十二兄弟轮流喷水报时，只有正午，十二个一起喷。
2. 1860年你被抢走；一百多年后你一次次上拍卖台；2007年拍卖被叫停，何鸿燊私下用6910万港元买下你，后来把你捐给国家，自己没等到你回家。
3. 2020年你回到圆明园：回国的有七个，回家的只有你。正午还差十一个，其中五个没回中国——要是上拍，该不该花钱买回来？

## Lines
Every person is a whole-figure silhouette or a relief figure with no face. Hands hold real props, and feet stand on real ground. **Ho** (何鸿燊) uses one silhouette design all film. The **counter** (bottom-left) follows the picture: 在家 12/12 → 回国 0 → 4 → 5 → 7, then a second row 回家 1/12 from H3b. **Your ear** is straight before 1860 and folded from 1989 on.

| id | line | highlight | min s | HIT / DB | picture (what we see, who does what, what moves) | → transition into the next line's picture |
|---|---|---|---|---|---|---|
| C1 | 假如说，你是圆明园的马首。 | — | 3.35 | DB (beat 1) | **Frame 0:** your red-copper head fills the frame on a dark desk, with the line already typed. On beat 1 a desk lamp clicks on and its light slides across your cheek and mane. Eased push 1.00 → 1.05. The folded ear is visible. | One continuous pull-back with no cut. The desk, the lamp and a seated silhouette come into frame. |
| C2a | 有人花【6910万港元】买下你， | 6910万港元 | 3.35 | DB | The private room (stamp 「2007 · 私下成交」). Ho signs with his right hand while his left lies flat on the paper. A price card beside you **already** reads HK$6910万 and never counts up. No paddles, no gavel. | Ho stands and lays a cloth over you with both hands. On the beat, a **match cut on the draped shape** into a lit hall. |
| C2b | 又把你【捐了出去】。 | 捐了出去 | 2.35 | wind-up into the drop | A museum hall (stamp 「2019 · 北京」). Two staff silhouettes pull the cloth off you with both hands, and it flies toward the lens. Ho is not in the hall. | The flying cloth fills the frame as a **wipe carried by the cloth**. |
| TTL | *(title card)* | — | ≈ 1 bar | **HIT: first big drop** | 「马首回家，用了160年」 on a plaque built from your profile and twelve water arcs. It slams in (scale-down, damped jolt, no flash). | **Hard cut** on the next downbeat. |
| T1 | 你被人抢走， | — | 1.85 | DB · hard cut | Smoke on the fountain terrace (stamp 「1860 · 圆明园」). A looter in a kepi lifts you off the robed stone body with both hands under the collar. The empty stone shoulders stay. Your ears are straight. | **Hard cut.** |
| T2 | 被一锤子卖掉， | — | 2.10 | HIT (gavel) · hard cut | `[wall]` The London relief saleroom (stamp 「1989 · 伦敦」). You stand in the round on the podium. The relief auctioneer's hinged gavel arm strikes on the beat. | **Hard cut.** |
| T3 | 差点又上了拍卖台， | — | 2.60 | DB · hold | `[wall]` The 2007 relief saleroom **before** the sale (stamp 「2007 · 香港」): empty chairs with catalogues on the seats, you under a work light, the gavel lying on its block. 「撤拍」 casts into the lot card. | **Hard cut.** |
| T4 | 终于，你回了家。 | — | 2.10 | DB · hard cut | Night outside the 正觉寺 courtyard gate (stamp 「2020 · 圆明园」). Two staff push the door leaves open a crack, hands flat on the wood, and copper light spills on the flagstones. H1b pays this framing off. | Crane up over the roof. The strip of door light narrows to a dot, and the dot becomes **your medallion** in a ring of twelve. |
| T5 | 可十二个里，还有【五个】没回中国。 | 五个 | 3.85 | HIT · centred | The counter grown to fill the frame: twelve animal medallions, seven faintly lit and five thick dashed. 「回国 7/12」, stamp 「— 2026年10月」. | **REWIND ◀◀** (≈ 1 bar). The ring spins back like a clock dial, with 3–4-frame flashes of T4 → T1 in reverse, each with its own year (2026 → 2020 → 2007 → 1989 → 1860 → 乾隆年间), landing in the foundry glow. |
| A1 | 乾隆年间，你由红铜一次铸成。 | — | 3.60 | DB | The foundry (stamp 「乾隆年间 · 清宫匠师」). A founder tips a crucible on long tongs with both hands, and molten copper pours into a clay mould. He steadies the mould with his left hand and knocks it apart with a mallet in his right. The halves fall and you are there, glowing and seamless. Your head is ≈ ¼ of his height. | Your face cools from orange to copper. A **match cut on your profile**: daylight, and you sit on a robed stone body. |
| A2 | 你和十一个兄弟，坐在水池两边。 | — | 3.85 | — | One pull-back to the 海晏堂 fountain: **two rows of six robed stone bodies, one row on each side of the pool**. You sit in the middle of your row. The snake is **across** the pool, never beside you (F4b). Every head reads at phone size. You are the warm one. 「在家 12/12」. No 南/北 labels, no seat numbers. | No cut: a sun shadow starts across the terrace. |
| A3a | 每两小时，轮到谁，谁就喷水。 | — | 3.35 | on the beat | Time-lapse. One arc at a time leaves a head's mouth, always facing the pool. The turn hops from one bank to the other each time, speeding up. The 「水力钟」 label is on the picture and leaves before A3b. | The camera follows the hand-over light **across the pool** from the snake on the far bank to you. |
| A3b | 你，是午时。 | — | 1.80 | beat | Close on you, and only you spout. Stamp 「11:00–13:00 · 午时」. | On the downbeat a fast pull-back as the eleven fire in a ripple outward from you. |
| A4 | 正午12点，十二个【一起喷水】。 | 一起喷水 | 3.35 | **HIT** | All twelve arcs up at once (thick bright cores, droplets, splash rings), completing on the hit. Slow push 1.00 → 1.08. | **The light changes**: noon goes to a red October dusk and the arcs stop. Tilt down to the front flagstones as boots step in. |
| B1a | 1860年，英法联军进了园子。 | — | 3.35 | DB | Soldiers in kepis walk in on the **front flagstones** (never on the pool or the plinths). No flags. Stamp 「1860.10」. The camera tracks at a fraction of their speed. | Continuous track. |
| B1b | 能搬走的，都被搬走了。 | — | 2.85 | — | One looter carries a crate with both hands under it and another hugs a vase in both arms. They walk out left. | The track stops for a picture pause. |
| B2 | 然后，一把火。 | — | 1.85 | **HIT** | Fire flares behind the 海晏堂 facade on the hit, embers drifting. Stamp 「1860.10.18」. | **Push in through the embers** to your seat. |
| B3 | 你被带走了。 | — | 1.85 | DB | Pays off T1, the same shot run longer. The looter lifts you and walks off right, and the counter goes 12 → 11. The camera tilts into the smoke, and only once the smoke hides the pool does the counter roll to 0 and flip to 「回国 0/12」. | The smoke thins into the beam of **a raking lamp on a bronze wall**: the first relief panel. |
| D1 | 一百多年后，你出现在伦敦。 | — | 3.35 | DB | `[wall]` The London relief saleroom (stamp 「1989 · 伦敦苏富比」). You stand in the round on the podium in the lamp's pool. The relief bidders' paddles hinge up alternately on the beat. | The lamp eases from you to the relief auctioneer. |
| D2a | 锤子落下：几十万美元。 | — | 2.85 | **HIT** (hammer 1) | `[wall]` Pays off T2. The gavel arm winds up slow → fast and strikes, and 「几十万美元」 casts into the lot card. | Same shot. |
| D2b | 你被台湾收藏家买走。 | — | 2.85 | — | `[wall]` Beside the podium a relief hand takes the lot card, and the tag 「台湾收藏家」 casts in. You stay lit in the round, and no relief hand touches you. | **Dolly along the wall**: the moulding between panels is the cut. |
| D3 | 牛、猴、虎、猪，先后被买回中国。 | — | 3.35 | **HIT ×3 + 1 beat** | `[wall]` One panel of four niches. 牛, 猴 and 虎 each get one hinged-gavel strike on three beats (stamp 「2000 · 保利购回」). On the fourth beat two relief hands meet over the pig (no hammer; stamp 「2003 · 何鸿燊购回」). Each niche casts 「购回」, and the counter ticks 0 → 4. | **Lamp swing**: this panel goes dark and the next one lights. |
| D5 | 2007年，你又要上拍了。 | — | 2.85 | — | `[wall]` The 2007 relief saleroom **before** the sale, pays off T3 (stamp 「2007 · 香港苏富比」): rows of empty chairs with catalogues on the seats, the lot board with your number, the gavel lying on its block. You stand in the round on the podium under a work light. | Continuous. |
| D6a | 这一次，锤子【没有落下】。 | 没有落下 | 2.85 | **no hit**: wants the music's thinnest moment | `[wall]` A slow push toward the gavel lying still on its block. Nobody touches it; the push is the picture pause, and it rhymes with D2a's strike. | Same shot. |
| D6b | 国家文物局反对公开拍卖。 | — | 3.35 | DB | `[wall]` 「撤拍」 casts into the lot card, and the room's lamps go out row by row until only your spot is left. Stamp 「2007.8 · 国家文物局」. The card and stamp leave before the next move. | The spot narrows to a desk lamp's pool, and the private room rebuilds around that light. **One light becomes the next**, and we leave the wall. |
| D7a | 拍卖前，何鸿燊私下买下了你： | — | 3.60 | — | Pays off C2a in the same room. Ho walks in (feet stepping, hips steady), sits and signs with his right hand, his left flat on the paper. You stand on the desk. | Same shot. |
| D7b | 【6910万港元】。 | 6910万港元 | 1.85 | **HIT** · centred | The price card stands up and 「6910万港元」 slams in big (≥ 120 px, scale-down + damped jolt), fixed with no count-up. Counter 「回国 5/12」. | The price card slides right and becomes **the top of a tall bar**. |
| D8 | 比伦敦那次，贵了【二十多倍】。 | 二十多倍 | 3.35 | — | `[wall]` Two bars cast in the wall in US dollars. The London 「几十万美元」 is a short bar and 「884万美元」 a tall one, with a bracket between their tops: 「二十多倍」 (labels ≥ 48 px). | **Rise up the tall bar.** Its top edge becomes the moulding of the Paris panel, and the camera tilts down into it. |
| D9a | 兄弟鼠和兔，在巴黎上拍。 | — | 3.10 | — | `[wall]` The Paris relief saleroom (stamp 「2009.2.25 · 巴黎佳士得」). Rat and rabbit stand on the podium. At a side table, a **phone bank**: relief clerks with handsets at their ears, each with a paddle. | Continuous. |
| D9b | 锤子落下，两个共拍出3149万欧元。 | — | 4.10 | **HIT ×2** | `[wall]` One clerk's hinged paddle rises with the handset at his ear. The gavel strikes twice on two beats, and the board casts 「鼠首 + 兔首 · 合计 3149万欧元」. | Same shot. |
| D10a | 5天后，买家却【拒绝付款】。 | 拒绝付款 | 3.10 | DB | `[wall]` **A visible time step**: the lamp sweeps the panel five times, like five days, while the stamp ticks to 「2009.3.2 · 北京」. Then 「未付款」 casts across the board's result line. | Same shot. |
| D10b | 他认为：这本就是中国的。 | — | 3.10 | — | `[wall]` The clerk's hinged arm lays the handset back on its cradle. Stamp 「买家本人宣布」. No buyer is ever in the room, and no name. | **Push into rat and rabbit** as the wine light warms to day. The podium becomes a museum plinth (**shape match**). |
| D11 | 一个法国家族，把鼠和兔无偿捐回。 | — | 4.10 | DB | `[wall]` The 国家博物馆 hall (stamp 「2013.6.28 · 北京 · 国家博物馆 · 皮诺家族」). Two relief figures pass one certificate across, each with both hands on it, in front of rat and rabbit on their plinth. Two medallions light: 「回国 7/12」. | The certificate is laid on a table, and a second one slides on top of it: yours, dated 2019 (**paper match**), out of the wall. |
| E1 | 何鸿燊，也把你捐给了国家。 | — | 3.35 | — | Pays off C2b, the same hall run longer (stamp 「2019.11.13 · 国家博物馆」). Two staff pull the cloth off you, and a brass donation plaque stands beside you. Ho is not drawn. | **Push into the brass plaque.** Its brass becomes the brass base of the desk lamp in his room (material match). |
| E2a | 2020年5月，何鸿燊去世，98岁。 | — | 3.60 | **STOP**: the lamp goes out on the stop | The private room from D7a, empty: his chair empty, the lamp on, night in the window (stamp 「2020.5.26」). The lamp goes out exactly on the stop. | Same shot. |
| E2b | 他【没等到】，你回家的那天。 | 没等到 | 3.10 | in the stop (≤ 1 bar) · centred | The dark room. A star in the window and a stirring curtain keep one living motion. | **Push through the window into the star**, which becomes your copper glow inside a crate in a van. |
| H1a | 同年12月1日， | — | 2.10 | pickup into the drop | The van drives from night into dawn with parallax (near and far trees). Glow leaks between the crate's slats. The van reaches the 圆明园 gate about 2 beats before the drop (stamp 「2020.12.1」). | The camera keeps moving **through the gate** to the courtyard doors. |
| H1b | 你回到了圆明园。 | — | 2.35 | **DROP (hardest)** | Pays off T4. Two staff push the doors open on the hit and copper light spills across the flagstones. No white flash; the sky is kept darker so you are the brightest thing. Fast push 1.0 → 1.12, then ease. You stand in the 文殊亭. | Continuous. |
| H2 | 你离开了【160年】。 | 160年 | 2.35 | beat | A slow orbit around you (stamp 「1860 → 2020」). | **Crane up** out of the courtyard. |
| H3a | 十二个里，回到中国的有七个。 | — | 3.60 | — | The T5 ring forms over the garden and seven medallions light. 「回国 7/12」. | Same shot. |
| H3b | 如今回到圆明园的，【只有你】。 | 只有你 | 3.35 | **HIT** (twist) | Six lit medallions arc out over the wall to two skyline buildings labelled 「保利艺术博物馆」 (4) and 「国家博物馆」 (2) (≥ 40 px). Only yours stays. 「回家 1/12」 punches in centred, then settles into the counter. | **Pull back wide.** |
| H4 | 你住进园里唯一幸存的古建筑。 | — | 3.85 | — | Wide: the 正觉寺 courtyard (stamp 「正觉寺 · 文殊亭」). The 西洋楼 ruins appear only far in the background. A ghost of B2's smoke drifts in and stops at the temple wall. | **Push in on you**, orbiting to the ear. |
| H5a | 细看，你有一只耳朵是卷的。 | — | 3.35 | — | Close-up. The near ear fills ≈ 30 % of the frame height, its top third folded outward. The far ear is straight. | Same shot. |
| H5b | 研究的人说：你这一路被撞过。 | — | 3.60 | — | A thin ring closes on the fold (stamp 「研究者观察」). Faint saleroom lamp reflections slide over the copper. | **Match cut on the circle**: the ring becomes the round basin of the fountain cast in the wall. |
| K1a | 正午12点，你们本该一起喷水。 | — | 3.60 | DB (section return) | `[wall]` The wall's fountain panel as memory (stamp 「记忆里的水力钟 · 12:00」, never 「今天」). Twelve arcs rise, a callback to A4. You stand in the round in front of it. | Same shot. |
| K1b | 现在，还差【十一个】。 | 十一个 | 2.35 | beat · centred | `[wall]` Eleven arcs fall, and those eleven seats go bare. Six of the bare seats get small tags 「保利 ×4 · 国博 ×2」. Only your arc stays. | Same shot. |
| K2 | 其中五个，至今【没回中国】。 | 没回中国 | 3.10 | DB | `[wall]` The five remaining seats are **uncast niches**: thick outlines of 龙, 蛇, 羊, 鸡 and 狗, each recognisable. | The lamp swings into the dragon's niche, and a relief podium casts itself around the outline. |
| K3a | 法国还拍出过一个疑似龙首， | — | 3.60 | **HIT (final hit)** | `[wall]` Stamp 「2018.12.17 · 法国」. The hinged gavel arm, already raised, strikes on the hit, and the dragon outline shakes for 2–4 frames. | Same shot. |
| K3b | 真假，【说不清】。 | 说不清 | 1.85 | — | `[wall]` The outline half-lights and flickers, with a 「?」. Stamp 「真伪仍存疑」. | The lamp pulls back along the wall to the end panel. |
| Q | 五个要是上拍，该不该【花钱买回来】？ | 花钱买回来 | 4.10 | DB, then **fade-out** over the final bar, ending on a downbeat | `[wall]` **The last image:** you in the round, your single arc lit, in front of the wall's last panel with eleven bare seats and five uncast niches. The Juno end card forms over it, arriving all at once with the question: J monogram, gold title, the question centred with ？ pulled back ½ em, the pill 「关注 Juno · 一起看懂世界」, and the sources. | — |

**Callbacks:**
- C2a → D7a
- C2b → E1
- T1 → B3
- T2 → D2a
- T3 → D5/D6a (the gavel at rest)
- T4 → H1b
- T5 ring → H3a/H3b
- A4 → K1a
- B2 → H4
- D2a → D8
- D11's gift → E1's 「也」

**Transitions, all different:**
1. pull-back
2. draped-shape match
3. cloth wipe
4. crane into the light dot
5. rewind
6. profile match
7. light across the pool
8. light change + tilt
9. ember push
10. smoke → raking lamp
11. dolly along the wall (once)
12. lamp swing
13. spot → desk lamp
14. card → bar
15. rise up the bar
16. podium → plinth match
17. certificate match
18. brass → brass
19. window → star → crate
20. through the gate
21. crane
22. push into the ear
23. ring → basin
24. lamp into the niche
25. pull back along the wall

Hard cuts happen only in the T-montage and out of the title.

## Facts per line
| Line | Facts |
|---|---|
| C1 | F1 |
| C2a | F13 |
| C2b | F15 |
| T1 | F9 |
| T2 | F11 |
| T3 | F12 |
| T4 | F21 |
| T5 | F23, F27 |
| A1 | F5, F7 (乾隆年间) |
| A2 | F4, F4b (caution: two rows, snake across the pool; exact seat UNVERIFIED, so no seat numbers) |
| A3a–A4 | F3, F8b |
| B1a–B2 | F9 |
| B3 | F9, F10 |
| D1–D2b | F11 |
| D3 | F17, F18 |
| D5–D6b | F12 |
| D7a, D7b | F13 |
| D8 | F11 + F13 估算 |
| D9a–D10b | F19 (phone, two together incl. premium, 5 days, Beijing) |
| D11 | F20 |
| E1 | F15 |
| E2a | F16 |
| E2b | F16 + F21 估算 |
| H1a, H1b | F21 |
| H2 | F21 估算 |
| H3a, H3b | F21, F23, F24, F27 |
| H4 | F22 |
| H5a, H5b | F6 |
| K1a | F3 |
| K1b | F21, F23, F27 |
| K2 | F23, F27 |
| K3a, K3b | F26 |
| Q | F12, F19, F26 |

facts.py: every number traces.

**Flags:**
1. D10a 「5天后」 is worked out from F19's dates (2.25 → 3.2).
2. D9b follows F19: total for both heads, never 落槌/每个. The board says 合计.
3. D11 「捐回」 = F20's 无偿捐给中方. The heads went into 国家博物馆's collection.
4. D3 「先后被买回中国」 covers 2000 (保利, HK auctions) and 2003 (何鸿燊, private purchase). The stamps say who.
5. Staging, not facts:
   - the desk room;
   - the 2003 hands meeting;
   - the van;
   - the phone-bank clerks (F19 supports "a phone held by someone in the room").
6. Earlier flags still stand: 几十万美元, 二十多倍 and 160年 are estimates, and the 2026 status is caution under F27.

**Reinstate if the music needs more:**
- 「谁带走的，没有记录。」 after B3 (F10, +2.6 s)
- 「六个，在国内的博物馆里，」 before K2 (+3.1 s)

**Next to cut if it needs less:** B1b (−2.85 s; director's candidate).

## What changed vs v4 (kept from v5, still true)
1. The paradox hook (6910万港元 买下 → 捐了出去) comes before the title, and the title moves to the first drop.
2. The teaser is four year-less fates plus T5, each paid off later on the same shot.
3. The rewind carries 2026 → 乾隆.
4. Highlights go from 46 of 47 lines to 15 of 49, never on names or places.
5. There are two-line blocks, and every line is ≤ 16.
6. 「不知去了哪」 → 「你被带走了。」 (correction 6).
7. The London price is on screen, and the comparison is 「比伦敦那次」.
8. 「国家文物局反对公开拍卖」 explains the missing hammer, and 「私下」 names the private sale.
9. The buyer's reason (D10b) is new.
10. 2007–2019 港澳展出 is cut.
11. 「细看」 invites the viewer to find the ear.
12. 「还差十一个」 / 「其中五个」 are split so each reads alone.
13. Q is a concrete either-or.
14. There are no seconds anywhere: reading minimums plus HIT/DB/STOP/DROP marks.

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
