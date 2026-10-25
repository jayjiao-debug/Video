# Script v7 (rewritten from scratch, 2026-10-25 evening)

Screenwriter. The owner heard v6 (2:20) and said **"the beginning is not catching enough, can we redo the whole script?"** So v7 changes the hook, the framing, the order and most of the lines. Only the facts are fixed. Files:
- `lines_v7.json`: 38 × `[null, null, text]`, in order.
- `vo_map_v7.json`: `{"01": "NEW" | "REUSE nn", …}`. Here nn is the clip key in `vo/durs.json`, which maps to `lines_v5.json` line nn.
- `lines_v7_est.json`: my estimated times, for the producer to re-time on the measured clips.

**Runtime: 2:08.2.** Q is read by 123.71, the end card runs 123.71 → 128.21 (4.5 s), and the music fades over the last bar into 128.21. v6 ran 2:20.7.

## Owner note → what changed
| Note | What changed |
|---|---|
| Owner (2026-10-25): "the beginning is not catching enough … redo the whole script" | **1. The new hook asks the question people actually wonder about and turns it twice by 9 s.** 「圆明园十二兽首，你猜回来了几个？」 → 「七个回了中国。」 → 「可住回圆明园的，[只有一个]。」 The viewer guesses from frame 0, and the twist (回国 7, 回园 1) lands by 7 s. v6 opened on a framing line (「假如说，你是圆明园的马首。」) and reached its money paradox at 3.7 s. |
| | **2. 你 now means the viewer, not the horse.** The horse is 它 all the way through. 你 comes back twice, each time as a turn: the guess at 0 s and the price guess at 33 s 「你猜，它卖了多少？」. The data says "you" framing works when it is about the viewer. Two meanings of 你 in one film would confuse. |
| | **3. 11–42 s (where we lose people) has no exposition.** It is a new image or a turn every 2–4 s: the Hangzhou queue (now) → 「原本是喷泉的出水口」 (a 原来如此) → noon, all twelve spout → 1860 → taken → London → the guess → the hammer → 2007. |
| | **4. The title is laid over the picture, 9.05 → 11.07 (2.0 s), with no card.** The analytics name the title card as the first big leak. |
| | **5. The film is 12.5 s shorter, and the payoff and question come before a 4.5 s end card.** Cut: the old teaser (T1–T5), the rewind, 「假如说…」, 「6910万…捐了出去」 up front, 「今夏杭州…看你兄弟」 after the drop, and 「如今…只有你」 (now the hook). |
| | **6. The emotional peaks keep v6's music landmarks, with one change in purpose.** The build now carries the money thread (pay 6910万 → win and refuse to pay → give for free), which sets up the closing question. |
| Director's don't-change list (gate 1 v5 r2) | Kept: the breakdown → the stop → the drop block (D6a–E2b, 「同年12月1日，」 「回到了圆明园」), the Paris phone bid + 5-day refusal + 一个法国家族 + 「也」, the ear, the noon callback, 「还差十一个」 / 「没回中国」, the 疑似龙首 / 说不清 pair, and Q. **Changed on purpose** (the owner asked for a full redo): the year-less teaser and the rewind are gone, because the hook now does their job. 你 = horse becomes 它. |

## Step 1: four hooks

Each hook gives the first ~3 s and the first ~15 s (narration = subtitle, word for word).

### A. 「你猜回来了几个」: the search question + a guess + the 7 ≠ 1 twist (**picked**)
- **0–3 s.** Frame 0: twelve bronze heads on two arcs of robed stone seats at night. Eleven are dark, and the copper horse glows in the middle of the near arc. A counter reads 「回来了 ?/12」 with the digit rolling, and the push-in starts on frame 0.
  - Line: 「圆明园十二兽首，你猜回来了几个？」
- **3–15 s.**
  - 「七个回了中国。」 Seven heads light up, one per half-beat, and the counter reads 7/12.
  - 「可住回圆明园的，[只有一个]。」 Six slide off into two museum cases (保利 ×4, 国博 ×2). The horse is left alone.
  - Title 「七个回国，一个回家」 over the push, on the 9.05 drop.
  - 「今年夏天，四个兽首去了杭州，」 Night museum, lit door.
  - 「人们排了[几个小时]去看。」 The queue.
- **Why a 19-year-old stops:**
  - It is the exact question people half-know: 兽首 come back in the news every few years, and 成龙 made a film about them. A guess costs nothing.
  - The answer comes at 4 s and a second surprise at 6 s (「七个都回来了，怎么只有一个在圆明园？」), so two gaps open and close in 9 s.
  - 你 is in line 1.
  - 「国宝原来是喷泉出水口」 at 17 s is a fact people send to a friend.
- **Risk:**
  - Twelve heads at phone size. The r4 cold read found the brothers weak, so they stay silhouettes and only the horse is modelled.
  - It could feel like a 百科 quiz if the story doesn't start by ~20 s.
  - 「住回」 must not be misread as 「回来」.
  - The twist (1 of 12) is spent early, so the drop has to pay off **how**, not **what**.

### B. 「拍下了，却不付钱」: the 2009 refusal
- **0–3 s.** Frame 0: a saleroom. A clerk with a phone to his ear raises a paddle, and the gavel falls on bar 0 (1.45 s).
  - Line: 「有人花3149万欧元，拍下两个兽首。」
- **3–15 s.**
  - 「5天后，他说：[这个款不能付]。」 A 「未付款」 stamp lands.
  - 「这样做，对不对？」
  - Title.
  - 「圆明园十二兽首，回来了七个。」 …
- **Why:** a real-life plot twist (won, then refused to pay) makes the viewer ask 为什么 at once, and it gives them something to argue about.
- **Risk:**
  - The hero (the copper horse, our whole look) isn't in the hook.
  - Euros and 3149万 at frame 0 are cold.
  - Refusing to pay breaks the auction's terms, so the hook can read as an endorsement.
  - It spends the build's beat in the first 5 s.

### C. 「卷耳朵」: the physical clue
- **0–3 s.** Frame 0: a macro shot. Copper light rakes up a bronze ear curled at its tip, with the straight ear soft behind it.
  - Line: 「这只铜马头，有一只耳朵是卷的。」
- **3–15 s.**
  - 「研究的人说，它被撞过。」 Pull back to the whole head.
  - 「被撞的这一路，走了160年。」
  - Title.
  - 1860, the fire.
- **Why:** an intimate, specific detail invites the viewer to play detective, and it makes a beautiful still.
- **Risk:**
  - Frame 0 is an abstract copper curl, and the data says abstract openings lose the first 2 s.
  - The cause is only a researcher's observation (F6), so the mystery can't pay off with proof.
  - Nothing in it is about the viewer.

### D. 「你买不买」: the viewer's dilemma first
- **0–3 s.** Frame 0: an empty auction podium under one lamp. On it is the dashed outline of a bronze head, with the gavel raised.
  - Line: 「五个圆明园兽首，至今没回中国。」
- **3–15 s.**
  - 「要是明天上拍，你会花钱买回来吗？」
  - 「这道题，真有人答过：」
  - 「有人花了[6910万港元]，」
  - 「有人拍下了，却[不付钱]。」
  - Title.
- **Why:** everyone has an opinion within a second, so it is the strongest comment driver, and 你 is the decision-maker.
- **Risk:**
  - Once viewers have answered in their heads, there is no information gap left, so they swipe.
  - Opinion first can read as bait or as nationalist.
  - It uses up the end-card question at 0 s.
  - Frame 0 is an outline, not a thing.

Also considered:
- the money paradox (v6's own opening, which the owner heard);
- the price jump;
- the Hangzhou queue.

All three are folded into A's body.

**Ranking: A > D > B > C.**
- A is the only one with a concrete object, a guessable question and two turns inside 9 s.
- D is the best ending, so it stays the end-card question.
- B is the best middle beat, and it stays on the build.
- C is the best close-up, and it stays after the drop.

## Title options (≤ 10 字)
1. **七个回国，一个回家** (recommended for the title overlay and the end card). It puts the film's twist in 8 字, and it is short enough to read in the 2 s overlay. It doesn't overclaim: the film shows 7 回中国 and 1 住回圆明园 by 7 s. The only risk is that someone reads 一个回家 as 「只回来一个」, and the hook corrects that by 4 s.
2. **十二兽首，回来了几个** (for the Douyin caption/cover). It is the search question itself, it invites the guess, and it can't overclaim.
3. **只有它，住回了圆明园**. It is the hero plus the payoff. It is true as read (the four only *visited* in 2023 for 12 days, F24; 住回 marks the difference), but it is less curious than 1.

## Story in 3 lines
1. 圆明园十二兽首，七个回了中国，住回圆明园的只有马首；它们原本是喷泉的出水口，正午十二个一起喷水。
2. 1860年马首被带走，1989年在伦敦卖了三四十万美元；2007年锤子没落下，何鸿燊私下花6910万港元买下，后来捐给国家，自己没等到它回家。
3. 2020年12月1日，它回到圆明园：红铜一次铸成，只有一只耳朵被撞卷了。还差十一个，五个没回中国——要是上拍，该不该花钱买回来？

## Music map v7 (the v6 cut, music_v5.md last section)
| Landmark | Film s | Lands on |
|---|---|---|
| frame 0 / bar 0 | 0.00 / 1.45 | H1 on frame 0; a copper rim sweeps the horse on bar 0 |
| drop 1 | **9.05** | title overlay 「七个回国，一个回家」 (9.05 → 11.07, 2.0 s, no VO) |
| join | 17.30 | (inaudible) A1 starts here |
| bar 9 | 21.83 | the twelve arcs fire (A2) |
| bar 12 | 28.62 | the fire flares as it is lifted (B2) |
| bar 15 | 35.41 | the London gavel strike (D3) |
| breakdown | **42.20** | D5 「这一次，锤子[没有落下]。」 bass drops out under the untouched gavel |
| bar 22 | 51.26 | 「6910万港元」 rises (D8) |
| build | **60.32** | P2 spoken 「锤子落下」 = Paris strike ×2 (subtitle at 60.03) |
| stop | **76.17** | E2 「2020年5月，何鸿燊去世，98岁。」 the lamp goes out |
| pickup | 85.23 | inside E4 「同年12月1日，」 the van light |
| hardest drop | **87.17** | R1 「它回到了圆明园。」 the 正觉寺 doors open in copper light |
| phrase | 105.60 | K1: the noon fountain returns as a lamp shadow |
| bar 54 | **123.71** | end card (Q read by then) |
| fade | 125.95 → 128.21 | the music fades over the last bar; film end 128.21 (the outro at 132.77 is not reached) |

**Why the peaks stay where they were:**
- **Breakdown = a gavel that doesn't fall.** The bass drops out as the hammer stays still.
- **Build = the money war.** 3149万 is won, then refused, then given for free. It rises to the stop and sets up Q.
- **Stop = Ho's death.** The silence is the lamp going out.
- **Drop = the answer to the hook's 「只有一个」.**

Alternatives were tried and rejected:
- 「十二个一起喷水」 on the drop: the noon image already plays at 21 s and returns as K1.
- The hook's 7/12 on the drop: a repeat.

## Script v7
Times are estimates on the beat grid (`bar(k) = 1.4498 + 2.26415·k`). Each window is at least the spoken length + 0.36 s (0.06 lead + 0.30 breath), with the spoken length taken from:
- the measured clip, for REUSE (and for NEW lines that only swap 你 → 它);
- syllables ÷ 4.6 + 0.25 s per comma, × 1.05, for the other NEW lines.

Every window is also at least pace.py's reading need − 0.25.

**pace.py** (`lines_v7_est.json`, film end 128.21): 0 lines too fast, **3 % waiting**. The flags are music-held beats:
- the title gap 9.05–11.07;
- P2 on the build;
- E2 on the stop.

**Highlights:** 13 / 38 (34 %), all on payoffs.

**Counter** (bottom-left, house style):
- **Hook:** 「回来了 ?/12」 → 回国 7/12 → row 2 回园 1/12.
- **A1–B2:** 在家 12/12 → 11 on the lift → 0 under the smoke.
- **D1–E4:** hidden. The past is one head's journey, and the 2000–2003 buys are not in this cut, so a 回国 count there wouldn't add up.
- **From R1:** back as 回园 1/12.
- **K2/K3:** six tagged, five dashed.

| # | id | subtitle = VO | what we see | music | VO | est. s (window · voice) | facts |
|---|---|---|---|---|---|---|---|
| 01 | H1 | 圆明园十二兽首，你猜回来了几个？ | **RING, night garden, lit on frame 0.** Twelve bronze heads on two arcs of robed stone seats, frontal. Eleven are dark patina; **the copper horse in the middle of the near arc glows**. The push-in starts on frame 0. Counter 「回来了 ?/12」, digit rolling. Stamp 「圆明园 · 十二兽首」. | frame 0; copper rim sweep on bar 0 (1.45) | NEW | 0.00–3.86 (3.86 · 3.46) | F1, F23 |
| 02 | H2 | 七个回了中国。 | Seven heads light **ivory**, one per half-beat (牛 虎 猴 猪 鼠 兔, the horse last in copper). Counter → 回国 7/12. Five stay dark, outlines dashed (龙 蛇 羊 鸡 狗, no labels). | lights on half-beats from 3.99 | NEW | 3.86–5.70 (1.84 · 1.37) | F23, F27 |
| 03 | H3 | 可住回圆明园的，[只有一个]。 | The six ivory heads lift off and slide **right** (away) into two glass cases that slide in at the frame edge, tags 「保利艺术博物馆 ×4」 「国家博物馆 ×2」 (≥ 48 px). **The horse stays on its seat, alone in copper.** Row 2 punches 「回园 1/12」. Push to the horse. | bar 2 (5.98) | NEW | 5.70–9.05 (3.35 · 2.77) | F21, F17, F18, F20, F27 |
| — | title | *(on screen, no VO)* 七个回国，一个回家 | **Overlaid on the push, not a card:** the title slams centred-low over the horse (scale-down + short damped jolt), with the J seal. The cases dim. The subtitle clears at 9.05. | **DROP 1 9.05** → 11.07 | — | 2.02 | — |
| 04 | N1 | 今年夏天，四个兽首去了杭州， | Cut on the beat to **MUSEUM-杭州** at night: the museum mass, a lit doorway. Through the glass, four heads (牛 虎 猴 猪) in ivory light. Stamp 「2026 · 杭州」. | 11.07 (beat) | NEW | 11.07–14.47 (3.40 · 3.00) | F28 |
| 05 | N3 | 人们排了[几个小时]去看。 | The camera tracks left along **the queue**: profile silhouettes in two depth rows, rope stanchions, a few phone torches. The line keeps coming and folds back on itself; the doorway shrinks far left. No faces, no number on screen. | — | NEW | 14.47–17.30 (2.83 · 2.28) | F31 (safe wording) |
| 06 | A1 | 十二兽首，原本是喷泉的出水口。 | **Match cut:** the four heads in the vitrine become the same four on their stone seats in daylight (**POOL NOON**, frontal 八). Pull back to all twelve and 海晏堂. Stamp 「乾隆年间 · 海晏堂」. Push to the horse's mouth: a thin trickle of water starts. Counter 在家 12/12. | join 17.30 | NEW | 17.30–20.98 (3.68 · 3.23) | F1, F3, F4 |
| 07 | A2 | 正午12点，十二个[一起喷水]。 | Beat 1: two arcs hop across the pool (the clock), and the hand-over light crosses to the horse. **On bar 9 all twelve fire together**: white arcs, the horse's arc copper, splash rings. Slow push. | **arcs on bar 9 (21.83)** | REUSE 13 | 20.98–24.37 (3.40 · 2.99) | F3, F4 |
| 08 | B1 | 1860年，英法联军进了园子。 | The light goes red-dusk. Tilt to the front flagstones; kepi silhouettes march in (never on the water). Stamp 「1860 · 圆明园」. | bar 10 | REUSE 14 | 24.37–28.05 (3.68 · 3.13) | F9 |
| 09 | B2 | 它被带走了。 | **The fire flares behind the façade on bar 12.** A looter lifts the horse with both hands and walks out **right**. Counter 12 → 11 on the lift, → 0 once smoke covers the pool. | fire on bar 12 (28.62) | NEW (was 17 with 你) | 28.05–29.75 (1.70 · 1.09) | F9, F10 |
| 10 | D1 | 一百多年后，它出现在伦敦。 | The smoke tilts down into saleroom haze: **SALE, LONDON 1989**. The horse on the podium under the work light; seated bidders. Stamp 「1989 · 伦敦」. The counter hides. | — | NEW (was 18) | 29.75–32.87 (3.11 · 2.51) | F11 |
| 11 | D2 | 你猜，它卖了多少？ | Paddles rise, one per beat. The lectern card is face-down with a 「?」. The gavel lifts. (The viewer's guess.) | beats | NEW | 32.87–35.41 (2.54 · 1.86) | — |
| 12 | D3 | 锤子落下：三四十万美元。 | **The gavel strikes exactly on bar 15.** The card flips to 「三四十万美元」 (≥ 96 px). | **strike on bar 15 (35.41)** | REUSE 19 | 35.41–38.80 (3.39 · 2.77) | F11 (估算 range) |
| 13 | D4 | 2007年，它又要上拍了。 | **The lamp swing:** London's lamp lands on the 2007 work light in the same room. Empty chairs, catalogues, the gavel at rest. Stamp 「2007 · 香港」. A slow push to the gavel starts. | holds into the breakdown | NEW (was 22) | 38.80–42.20 (3.40 · 2.45) | F12 |
| 14 | D5 | 这一次，锤子[没有落下]。 | The untouched gavel, the lamp hum, the slow push continuing. | **BREAKDOWN 42.20** | REUSE 23 | 42.20–45.03 (2.83 · 2.34) | F12 |
| 15 | D6 | 国家文物局反对公开拍卖。 | 「撤拍」 on the lot board; the lamps go out row by row (2 rows per beat). | — | REUSE 24 | 45.03–47.87 (2.83 · 2.37) | F12 |
| 16 | D7 | 拍卖前，何鸿燊私下买下了它： | The last spot becomes the **DESK** lamp. A silhouette (Ho, no face) signs; the horse on the desk. | — | NEW (was 25) | 47.87–51.26 (3.40 · 2.97) | F13 |
| 17 | D8 | [6910万港元]。 | The price card rises: 「6910万港元」, fixed, no count-up, no paddles. | **slam on bar 22 (51.26)** | REUSE 26 | 51.26–53.81 (2.55 · 2.03) | F13 |
| 18 | D9 | 比伦敦那次，贵了[二十多倍]。 | **PRICE:** two columns of light on the desk wall, short 「三四十万美元」 and tall 「6910万港元」 (small: ≈884万美元), with the bracket 「二十多倍」. | — | REUSE 27 | 53.81–56.92 (3.11 · 2.56) | F11, F13 (估算) |
| 19 | P1 | 兄弟鼠和兔，在巴黎上拍。 | **SALE, PARIS 2009:** tall windows, the rat and rabbit on the podium, a phone bank of clerks with handsets (no buyer in the room). Stamp 「2009 · 巴黎」. | — | REUSE 28 | 56.92–60.03 (3.11 · 2.55) | F19 |
| 20 | P2 | 锤子落下，两个共拍出3149万欧元。 | **The gavel strikes on 60.32 and the next beat.** The result board on an easel: 「两件合计 3149万欧元」. | **BUILD 60.32** = spoken 「锤子落下」 | REUSE 29 | 60.03–64.56 (4.53 · 4.08 at ×1.05) | F19 |
| 21 | P3 | 5天后，买家却说：[这个款不能付]。 | A day flip 2.25 → 3.2, then a press-room table with microphones and a silhouette (not the saleroom). Stamp 「2009.3.2 · 北京」. A 「未付款」 stamp lands on the result board on 「不能付」. | — | REUSE 30 | 64.56–68.53 (3.96 · 3.47 at ×1.05) | F19 |
| 22 | P4 | 一个法国家族，把鼠和兔无偿捐回。 | **HALL, 国家博物馆:** the rat and rabbit on one plinth, the cloth drawn off. Stamp 「2013 · 北京」. | — | REUSE 31 | 68.53–72.77 (4.25 · 3.61 at ×1.05) | F20 |
| 23 | E1 | 何鸿燊，也把它捐给了国家。 | The same HALL, 2019: the horse unveiled; a brass donation plaque. Stamp 「2019 · 北京」. **Match: the brass plaque becomes the lamp base.** | — | NEW (was 32) | 72.77–76.17 (3.40 · 2.36) | F15 |
| 24 | E2 | 2020年5月，何鸿燊去世，98岁。 | **DESK at night, the chair empty. The lamp goes out on the stop**; moonlight. Stamp 「2020.5 · 香港」. | **STOP 76.17** | REUSE 33 | 76.17–81.26 (5.09 · 4.45) | F16 |
| 25 | E3 | 他[没等到]，它回家的那天。 | The moonlit room, a star in the window; slow push into the star. | in the stop / re-entry | NEW (was 34) | 81.26–84.37 (3.11 · 2.55) | F16, F21 (估算) |
| 26 | E4 | 同年12月1日， | The star becomes the crate light in a van. **ROAD:** the van drives **left** (toward home), night turning to blue hour. Stamp 「2020.12.1」. | pickup 85.23 | REUSE 35 | 84.37–87.17 (2.80 · 1.60) | F21 |
| 27 | R1 | 它回到了圆明园。 | **COURT: the 正觉寺 doors swing open in copper light** and the horse is inside. The counter returns: 回园 1/12. | **HARDEST DROP 87.17** | NEW (was 36) | 87.17–89.19 (2.02 · 1.39) | F21 |
| 28 | R2 | 它离开了[160年]。 | Push through the doors. Stamp 「1860 → 2020」. | — | NEW (was 37) | 89.19–91.73 (2.55 · 2.00) | F21 (估算) |
| 29 | R3 | 它住进园里唯一没烧掉的古建筑。 | Wide: the 文殊亭 intact; far off, the 西洋楼 ruins in haze; ghost smoke beyond the wall fades (a callback to B2's fire). | — | NEW | 91.73–95.41 (3.68 · 3.20) | F22 |
| 30 | R4 | 细看，它是红铜一次铸成的。 | **CASE:** the head turns slowly under raking copper light. One highlight runs over the whole surface without a seam (one casting). | — | NEW | 95.41–98.81 (3.40 · 2.77) | F5 |
| 31 | R5 | 只有一只耳朵，是卷的。 | Push into the **curled near ear**, with the straight far ear beside it in the same frame. | — | NEW | 98.81–101.64 (2.83 · 2.32) | F6 |
| 32 | R6 | 研究的人说：它这一路被撞过。 | A macro on the curl; the light trembles once. Stamp line 2 「研究者观察」. | — | NEW (was 43) | 101.64–105.32 (3.68 · 3.10) | F6 |
| 33 | K1 | 正午12点，它们本该[一起喷水]。 | **The look's signature:** the horse's own light throws the noon fountain as a **shadow-play on the paper lattice** behind it, twelve shadow arcs. Stamp 「12:00 · 正午」 (never 今天). | **phrase 105.60** | NEW (was 44) | 105.32–108.71 (3.40 · 2.97) | F3 |
| 34 | K2 | 现在，还差[十一个]。 | The shadow arcs go out one by one; eleven empty seat shadows. Six get small tags 「保利 ×4 · 国博 ×2」. Counter row 2 回园 1/12. | — | REUSE 45 | 108.71–111.26 (2.55 · 2.02) | F21, F23, F27 |
| 35 | K3 | 其中五个，至今[没回中国]。 | Five seats turn dashed (龙 蛇 羊 鸡 狗). | — | REUSE 46 | 111.26–114.37 (3.11 · 2.63) | F23, F27 |
| 36 | K4 | 法国还拍出过一个疑似龙首， | The dragon's dashed outline flickers; in a small lit inset a French saleroom gavel strikes. Stamp 「2018 · 法国」. | strike on a beat | REUSE 47 | 114.37–117.49 (3.11 · 2.64) | F26 |
| 37 | K5 | 真假，说不清。 | The outline holds half-drawn with a 「?」. | — | REUSE 48 (brackets dropped; same words) | 117.49–119.75 (2.26 · 1.80) | F26 |
| 38 | Q | 五个要是上拍，该不该[花钱买回来]？ | Back to the horse alone in its case, the lattice empty behind it. Q is typed centred. **At 123.71 the end card forms around it** and Q slides into its slot. | — | REUSE 49 | 119.75–123.71 (3.96 · 3.06) | F12, F19, F26 |
| — | END | *(card)* | The house end card: the title 「七个回国 / 一个回家」, Q, the J seal, the pill 「关注 Juno · 一起看懂世界」, sources. The music fades over the last bar. | bar 54 → fade to 128.21 | — | 123.71–128.21 (4.5) | — |

**VO: 20 NEW, 18 REUSE.**
- **10 of the NEW lines only swap 你 → 它** in an existing clip: 09, 10, 13, 16, 23, 25, 27, 28, 32, 33. Their timing uses the old clip's length.
- **10 NEW lines are new words:** 01–06, 11, 29–31.

**For the producer (re-timing and mix):**
- Re-time on the measured clips with plan45vo's rules. The anchors are H1 0.00, H2 3.856 (a quarter beat), H3 5.70, N1 11.07, D3 35.41, D4 38.80, D5 42.20, P2 60.03, E2 76.17, R1 87.17 and the end card 123.71.
- **Tight spots:**
  - **H1** has 0.04 s slack on my ×1.05 estimate. If its clip is > 3.44 s, re-take H1 at speed 1.12, or drop 可 from H3 and move H2 → 3.997, H3 → 5.98.
  - **N1** has 0.04 s slack. If needed, the title may end at 10.79 (1.74 s on screen).
- **TEMPO ×1.05** stays on clips 29–31. Clip 32 is no longer used (E1 is NEW).
- **FREE** (no duck): (9.05, 11.07), (87.17, 88.60), (123.71, end).
- **FADE:** (125.95, 128.21).
- Read numbers as before: 十二, 一八六零年, 二零零七年, 六千九百一十万港元, 一百六十年.

**For the art director (changes vs storyboard.md):**
- **New or re-used sets:**
  - the hook uses **RING**, re-staged as two seat arcs with eleven silhouettes and the copper horse, plus two glass cases that slide in;
  - **MUSEUM-杭州** moves to 11–17 s;
  - **POOL NOON** opens by matching from the vitrine.
- **Gone:** the teaser cuts T1–T4, the rewind, 2000–2003 (D3 roll call, the pig handshake), FOUNDRY, CASE as the hook (the hook is now RING).
- **The end card title** changes to the picked title (not 「假如你是 / 圆明园马首」).

---

# Script v6 (2:20 cut on music candidate 3, 2026-10-25)

Screenwriter. v6 cuts v5.1 (kept below, unchanged) from 49 to **40 lines** so the film fits candidate 3's map and the owner's retention data. **Every v6 line is an existing voice clip, word for word (40 × REUSE, 0 NEW).** Files:
- `lines_v6.json`: 40 × `[null, null, text]`, in order;
- `vo_map_v6.json`: `{"01": "REUSE 01", …}`, where the v6 index maps to the clip key in `vo/durs.json` and `audio/vo/NN.wav`;
- `lines_v6_est.json`: my estimated times (plan45vo rules, below), for the editor to check against.

## The brief this answers
- **Music, candidate 3:**
  - title 9.05 → 11.32;
  - breakdown **42.20**;
  - build **60.32** (D9b);
  - stop **76.17** (E2a, the lamp goes out);
  - hardest drop **87.17** (H1b);
  - outro **132.77** (Q);
  - the music runs to 148.05.

  Everything from the build on keeps today's spacing (−31.70 s = 14 bars). The music join at 17.3 s is inaudible and needs nothing.
- **Owner, on retention:**
  - Keep the hook and teaser intact, and take the time out of the middle.
  - Make 20–40 s a concrete image plus a turn, not exposition.
  - Speak and read Q fully before an end card of about 4 s.
  - Keep the title at or under about 2.3 s.

## What changed (v5.1 → v6)
| # | Change | Why |
|---|---|---|
| 1 | **C1–C2b, the title and T1–T5 are untouched** (same lines, same times, 0.32 → 24.87). | The owner's data says the opening holds people. The title is still 9.05 → 11.32 (2.27 s). |
| 2 | **Nine lines are cut from the middle:** A1, A2, A3a, A3b, B1b, B2, D2a, D2b, D3 (31.7 s). See "Cuts" below. | The time had to come out between the teaser and the breakdown. |
| 3 | **20–40 s is now one image, then turns, every 3 s:** noon spout (A4) → the soldiers come in (B1a) → you are taken (B3) → London (D1) → 2007 (D5). It drops all the clock exposition. The picture carries the count: the rewind spins the ring back from 回国 7/12 to a full **在家 12/12**, and B3 empties it to **0**. | Owner point 2. The count the teaser just showed (7/12) is the hook that runs through the turn. |
| 4 | **D6a starts ON the breakdown (42.205 = beat 72)**, not 2.26 s before it, so 「这一次，锤子【没有落下】」 appears as the bass drops out. D6b–D9a keep their lines, at the tightest legal windows (clip + 0.36 s, on half-beats). | This bought the 2.26 s that let T3 stay in the teaser. |
| 5 | **D9b's subtitle appears half a beat before the build (60.03).** The spoken 「锤子落下」 lands on the build strike (60.32), and D10a–E1 are re-laid on half-beats. | v5.1's E1 had a 0.07 s breath before the stop, against the 0.3 s rule. Now it has 0.35 s, and E2a still starts exactly on the stop (76.17). |
| 6 | **The ending:** Q runs 132.21 → 136.17 (voice ends 135.33, read by 135.7). The **end card runs 136.17 → 140.70 (4.5 s)**, and the music fades over the last bar into 140.70 (bar 61.5). The film is **2:20.7**, not 2:28, saving 7.35 s. The saving is **not** spent: the owner's data says shorter is better, and nothing after the drop is missing. If the owner wants ≥ 141 s, end on bar 62 = 141.83 (a 5.7 s card). | Owner point 3. |
| 7 | Text, highlights and facts are unchanged for every kept line. | So every clip is reused. |

## Cuts (one line each: what the picture loses)
| Cut | Line | What the picture loses |
|---|---|---|
| A1 | 乾隆年间，你由红铜一次铸成。 | **The foundry (set FOUNDRY, scene 06b) is gone:** the pour, the mould breaking, the profile match. The rewind now lands straight on the noon pool, with the stamp 「乾隆年间 · 海晏堂」. One of the risky builds disappears. |
| A2 | 你和十一个兄弟，坐在水池两边。 | No separate pull-back to the 八 layout. A4 opens on the frontal 八 wide, and 在家 12/12 draws on A4's first beat. |
| A3a | 每两小时，轮到谁，谁就喷水。 | The turn-taking time-lapse shrinks to a 1-beat flick at the top of A4: two or three arcs hop across the pool, then the hand-over reaches you. The 「水力钟」 label goes. |
| A3b | 你，是午时。 | The close-up of only you spouting is gone. The ripple outward from you on A4 still shows that you are the noon one. |
| B1b | 能搬走的，都被搬走了。 | The crate and vase carriers and the track pause go. B1a's soldiers walk in, and B3 follows straight on. |
| B2 | 然后，一把火。 | **No line for the fire, but the fire stays in the picture.** It flares behind the façade on B3's downbeat (33.15), and B3 plays in front of it: the b3_1860 key frame is exactly this shot. H4's ghost smoke still has its source. |
| D2a | 锤子落下：三四十万美元。 | The London strike (T2's payoff) moves under D1. On a beat inside D1, the gavel strikes and the lectern card reads 「三四十万美元」 (≥ 56 px), unvoiced. D8's short bar keeps that number. |
| D2b | 你被台湾收藏家买走。 | The porter, the crate and the trolley go. The buyer appears only as a small tag 「台湾收藏家」 on the lectern card (optional). |
| D3 | 牛、猴、虎、猪，先后被买回中国。 | **The turntable roll call and the 2003 handshake go**, and so does the counter's 0 → 4 step. Suggestion: under D5, while the lamp swings onto the 2007 podium, four dots fill ivory in one beat under a small stamp 「2000–2003 · 牛 猴 虎 猪 购回」, so D7b's 回国 5/12 still adds up. The four brothers are first named by H3c (Hangzhou) and counted by H3a (七个). |

The lines cut in v5.1 stay cut. The callbacks that remain:
- T1 → B3
- T2 → the strike under D1
- T3 → D5/D6a
- T4 → H1b
- T5 → H3a/H3b
- A4 → K1a
- the fire under B3 → H4
- C2a → D7a
- C2b → E1

D8 still reads alone (「比伦敦那次」, with London said in D1 and the price on the bar).

## Title options (≤ 10 字; the board already uses 1)
1. **假如你是圆明园马首.** This is the one in use on the title and end cards. It is the series format: "you" framing (highest share rate in the owner's data), it says who 你 is, and it can't overclaim.
2. **马首回家，用了160年.** It is true as read (1860 → 2020, F21 估算) and uses the film's twist word, 回家. It is a little CCTV-like.
3. **6910万买下，又捐了出去.** A number plus a contradiction: the hook's own paradox. The cover must say 港元 (F13).

## Story in 3 lines
1. 你是圆明园水力钟的马首：正午12点，十二兄弟一起喷水；1860年你被抢走，一百多年后出现在伦敦拍卖台。
2. 2007年你又要上拍，锤子没有落下：何鸿燊私下用6910万港元买下你，后来捐给国家，自己没等到你回家。
3. 2020年你回到圆明园：回国的有七个，回家的只有你。还差十一个，其中五个没回中国——要是上拍，该不该花钱买回来？

## Lines v6
Times are estimates using plan45vo.py's rules. Each line starts on a beat (on a half-beat in the busy blocks). The window is at least clip + 0.36 s (0.06 lead + 0.30 breath), with the reading minimum capped at clip + 0.7. **Act 1 is not on a hard anchor between 11.64 and 42.20**: the v5.1 HIT marks there (A4, B2) were for the old track. The editor puts picture hits on the nearest real hits in candidate 3.

**pace.py:** 0 lines too fast, 8 % waiting (target ≤ 12 %). The holds flagged are the title under C2b, D5 before the breakdown, D9b, D10a, E2a's stop, and H3c. All are music-held beats.

| v6 | id | VO | est. time | clip | line | music | picture (changes vs storyboard in **bold**) | facts |
|---|---|---|---|---|---|---|---|---|
| 01 | C1 | REUSE 01 | 0.32–3.71 | 2.67 | 假如说，你是圆明园的马首。 | frame 0 | Unchanged (scene 01). | F1 |
| 02 | C2a | REUSE 02 | 3.71–7.39 | 3.19 | 有人花【6910万港元】买下你， | DB | Unchanged. | F13 |
| 03 | C2b | REUSE 03 | 7.39–11.64 | 1.42 | 又把你【捐了出去】。 | → title 9.05–11.32 | Unchanged (02, 03). | F15 |
| 04 | T1 | REUSE 04 | 11.64–13.90 | 1.24 | 你被人抢走， | hard cut | Unchanged (04). | F9 |
| 05 | T2 | REUSE 05 | 13.90–16.17 | 1.32 | 被一锤子卖掉， | hard cut, gavel | Unchanged (05). | F11 |
| 06 | T3 | REUSE 06 | 16.17–19.00 | 1.80 | 差点又上了拍卖台， | hard cut (music join 17.3 is inaudible) | Unchanged. | F12 |
| 07 | T4 | REUSE 07 | 19.00–21.26 | 1.73 | 终于，你回了家。 | hard cut | Unchanged; the door move into the ring. | F21 |
| 08 | T5 | REUSE 08 | 21.26–24.87 | 2.85 | 可十二个里，还有【五个】没回中国。 | — | Unchanged: the ring, 回国 7/12. | F23, F27 |
| — | rewind | — | 24.87–26.07 | — | *(picture only, ≈ 1.2 s)* | — | **The ring spins back and its dots relight to a full 在家 12/12** while T4 → T1 flash in reverse with their years, landing on the noon pool. **The last stamp is 「乾隆年间 · 海晏堂」 (no foundry).** | F1, F7 |
| 09 | A4 | REUSE 13 | 26.07–29.47 | 2.99 | 正午12点，十二个【一起喷水】。 | the act's peak; land the arcs on the nearest downbeat | **POOL NOON from the frontal 八 wide.** Beat 1: two or three single arcs hop across the pool (the clock, a 1-beat flick), and the hand-over light crosses to you. Then all twelve fire outward from you, with thick cores and splash rings. 在家 12/12, your dot copper. Slow push. | F3, F4 |
| 10 | B1a | REUSE 14 | 29.47–33.15 | 3.13 | 1860年，英法联军进了园子。 | DB | Unchanged (08): the light change to red dusk, the tilt to the flagstones, kepis walking in. **The track runs through; no picture pause.** | F9 |
| 11 | B3 | REUSE 17 | 33.15–35.13 | 1.09 | 你被带走了。 | DB: the fire flares on it | **B2's fire moves here:** it flares behind the façade on the downbeat while the looter lifts you and carries you right (pays off T1). The counter goes 12 → 11 on the lift, then rolls to 0 and flips to 回国 0/12 once the smoke covers the pool. | F9, F10 |
| 12 | D1 | REUSE 18 | 35.13–38.52 | 2.51 | 一百多年后，你出现在伦敦。 | **strike on a beat inside the line** | Smoke → saleroom haze (unchanged hand-over). London 1989: you on the podium; the paddles rise. **D2a's strike moves here**: the gavel strikes on a beat (pays off T2), and the lectern card turns to 「三四十万美元」 (no line). Optional tag 「台湾收藏家」. **No porter or crate.** | F11 |
| 13 | D5 | REUSE 22 | 38.52–42.20 | 2.45 | 2007年，你又要上拍了。 | holds into the breakdown | The lamp swing: London's lamp lands on the 2007 work light (the same room, empty chairs, the gavel at rest), pays off T3. **The counter's 0 → 4 lands in one beat here, with the stamp 「2000–2003 · 牛 猴 虎 猪 购回」.** The push to the gavel starts. | F12, (F17, F18 stamp only) |
| 14 | D6a | REUSE 23 | **42.20**–45.03 | 2.34 | 这一次，锤子【没有落下】。 | **BREAKDOWN 42.20**: the line appears as the bass drops | The slow push to the untouched gavel **starts on the breakdown** (it no longer crosses it). | F12 |
| 15 | D6b | REUSE 24 | 45.03–47.87 | 2.37 | 国家文物局反对公开拍卖。 | — | Unchanged: 「撤拍」 and the lamps out row by row. **Over 2.8 s, so 2 rows per beat.** | F12 |
| 16 | D7a | REUSE 25 | 47.87–51.26 | 2.97 | 拍卖前，何鸿燊私下买下了你： | — | Unchanged: spot → desk lamp; Ho signs. | F13 |
| 17 | D7b | REUSE 26 | 51.26–53.81 | 2.03 | 【6910万港元】。 | slam on its first beat | Unchanged. 回国 5/12. | F13 |
| 18 | D8 | REUSE 27 | 53.81–56.92 | 2.56 | 比伦敦那次，贵了【二十多倍】。 | — | Unchanged: the two light columns. | F11, F13 估算 |
| 19 | D9a | REUSE 28 | 56.92–60.03 | 2.55 | 兄弟鼠和兔，在巴黎上拍。 | — | Unchanged. | F19 |
| 20 | D9b | REUSE 29 | **60.03**–64.85 | 4.29 (×1.05) | 锤子落下，两个共拍出3149万欧元。 | **BUILD 60.32** = the spoken 「锤子落下」, strikes ×2 | Unchanged; the strikes stay on 60.32 and the next beat. | F19 |
| 21 | D10a | REUSE 30 | 64.85–69.09 | 3.65 (×1.05) | 5天后，买家却说：【这个款不能付】。 | — | Unchanged. | F19 |
| 22 | D11 | REUSE 31 | 69.09–73.34 | 3.79 (×1.05) | 一个法国家族，把鼠和兔无偿捐回。 | — | Unchanged. | F20 |
| 23 | E1 | REUSE 32 | 73.34–76.17 | 2.48 (×1.05) | 何鸿燊，也把你捐给了国家。 | — | Unchanged. | F15 |
| 24 | E2a | REUSE 33 | 76.17–81.26 | 4.45 | 2020年5月，何鸿燊去世，98岁。 | **STOP 76.17**: the lamp goes out | Unchanged. | F16 |
| 25 | E2b | REUSE 34 | 81.26–84.37 | 2.55 | 他【没等到】，你回家的那天。 | in the stop | Unchanged. | F16, F21 |
| 26 | H1a | REUSE 35 | 84.37–87.17 | 1.60 | 同年12月1日， | pickup | Unchanged. | F21 |
| 27 | H1b | REUSE 36 | **87.17**–89.75 | 1.39 | 你回到了圆明园。 | **HARDEST DROP 87.17** | Unchanged. | F21 |
| 28 | H2 | REUSE 37 | 89.75–92.58 | 2.00 | 你离开了【160年】。 | — | Unchanged. | F21 估算 |
| 29 | H3a | REUSE 38 | 92.58–96.54 | 2.90 | 十二个里，回到中国的有七个。 | — | Unchanged. | F21, F23 |
| 30 | H3c | REUSE 39 | 96.54–101.07 | 3.79 | 今夏杭州，人们排几小时看你兄弟。 | — | Unchanged. | F28, F31 |
| 31 | H3b | REUSE 40 | 101.07–104.47 | 2.65 | 如今回到圆明园的，【只有你】。 | HIT | Unchanged. | F21, F23, F24, F27 |
| 32 | H4 | REUSE 41 | 104.47–108.43 | 2.84 | 你住进园里唯一幸存的古建筑。 | — | Unchanged (the ghost smoke now calls back B3's fire). | F22 |
| 33 | H5a | REUSE 42 | 108.43–111.83 | 2.92 | 细看，你有一只耳朵是卷的。 | — | Unchanged. | F6 |
| 34 | H5b | REUSE 43 | 111.83–115.79 | 3.10 | 研究的人说：你这一路被撞过。 | — | Unchanged. | F6 |
| 35 | K1a | REUSE 44 | 115.79–119.75 | 2.97 | 正午12点，你们本该一起喷水。 | section return | Unchanged (calls back A4). | F3 |
| 36 | K1b | REUSE 45 | 119.75–122.58 | 2.02 | 现在，还差【十一个】。 | — | Unchanged. | F21, F23, F27 |
| 37 | K2 | REUSE 46 | 122.58–125.98 | 2.63 | 其中五个，至今【没回中国】。 | — | Unchanged. | F23, F27 |
| 38 | K3a | REUSE 47 | 125.98–129.94 | 2.64 | 法国还拍出过一个疑似龙首， | strike | Unchanged. | F26 |
| 39 | K3b | REUSE 48 | 129.94–132.21 | 1.80 | 真假，【说不清】。 | — | Unchanged. | F26 |
| 40 | Q | REUSE 49 | 132.21–136.17 | 3.06 | 五个要是上拍，该不该【花钱买回来】？ | **OUTRO 132.77** | The last image. Q is spoken (ends 135.33) and read before the card. **The end card runs 136.17 → 140.70 (4.5 s), and Q slides into its slot.** The fade runs over the last bar, ending at 140.70. | F12, F19, F26 |

**Highlights:** 15 / 40 (38 %), the same 15 as v5.1. The cuts removed only unhighlighted lines, so the ratio rose from 31 %. If the director wants it nearer ⅓, unbracket K3b 「说不清」. That changes no clip.

**For the producer (re-timing):**
- `plan45vo.py` needs v6's 40 rows and these anchors: D6a 42.205, D9b 60.03 (half a beat early), E2a 76.165, H1b 87.17. D6a–E1 need floor windows (clip + 0.36, no HOLD); with HOLD, D9a would run past the build.
- In `mix45vo.py`:
  - keep TEMPO on clips 29–32;
  - VOGAIN stays on clip 36;
  - FREE becomes (9.05, 11.32), (87.17, 88.60), (136.17, end);
  - FADE becomes (138.43, 140.70).

---

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
| D3 | D9a/D9b: a phone bank (a clerk with a handset raises the paddle). **Two strikes** on two beats, and the board reads 「鼠首 + 兔首 · 合计」. The line is the coordinator's/director's own: 「锤子落下，两个共拍出3149万欧元。」 (F19), no highlight. D10a: a visible time step (the lamp sweeps five times, stamp 2009.2.25 → 「2009.3.2 · 北京」), then 「未付款」, with the line 「5天后，买家却说：【这个款不能付】。」 (F19: 5 days, announced in Beijing). D10b: the handset laid back on its cradle; no buyer is ever in the room. |
| D4 | D11 is staged at the **国家博物馆, Beijing, 2013.6.28** (F20), with its own move: push into rat and rabbit as the wine light warms, and the podium becomes a museum plinth (shape match). The line names the giver (cold read: 「谁送回的？」): 「一个法国家族，把鼠和兔无偿捐回。」 Stamp 「皮诺家族」. |
| D5 | **(a) K2a cut.** The tags 「保利 ×4 · 国博 ×2」 move onto six seats during K1b. **(b) Roll call made one beat:** D3a + D3b + D4 → D3 「牛、猴、虎、猪，先后被买回中国。」 (also the cold read's 2000/2003 note). Who bought them is in the stamps (2000 · 保利购回 / 2003 · 何鸿燊购回). |
| D6 | Highlights removed from D2a (三四十万美元) and D9b (3149万欧元). |
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
- **A real price for 1989:** F11's two figures disagree ($367k / $400k). The safe wording stays 「三四十万美元」, and D8's bars make the 20× visible. Option for the director: 「三四十万美元」 covers both sources, but facts.py flags it as not in a row, so I left it out.
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
| ~~D10b~~ | ~~他认为：这本就是中国的。~~ (cut at gate 1 r2: no verified row; D10a now quotes the buyer, F19) | — | 3.10 | — | `[wall]` The clerk's hinged arm lays the handset back on its cradle. Stamp 「买家本人宣布」. No buyer is ever in the room, and no name. | **Push into rat and rabbit** as the wine light warms to day. The podium becomes a museum plinth (**shape match**). |
| D11 | 一个法国家族，把鼠和兔无偿捐回。 | — | 4.10 | DB | `[wall]` The 国家博物馆 hall (stamp 「2013.6.28 · 北京 · 国家博物馆 · 皮诺家族」). Two relief figures pass one certificate across, each with both hands on it, in front of rat and rabbit on their plinth. Two medallions light: 「回国 7/12」. | The certificate is laid on a table, and a second one slides on top of it: yours, dated 2019 (**paper match**), out of the wall. |
| E1 | 何鸿燊，也把你捐给了国家。 | — | 3.35 | — | Pays off C2b, the same hall run longer (stamp 「2019.11.13 · 国家博物馆」). Two staff pull the cloth off you, and a brass donation plaque stands beside you. Ho is not drawn. | **Push into the brass plaque.** Its brass becomes the brass base of the desk lamp in his room (material match). |
| E2a | 2020年5月，何鸿燊去世，98岁。 | — | 3.60 | **STOP**: the lamp goes out on the stop | The private room from D7a, empty: his chair empty, the lamp on, night in the window (stamp 「2020.5.26」). The lamp goes out exactly on the stop. | Same shot. |
| E2b | 他【没等到】，你回家的那天。 | 没等到 | 3.10 | in the stop (≤ 1 bar) · centred | The dark room. A star in the window and a stirring curtain keep one living motion. | **Push through the window into the star**, which becomes your copper glow inside a crate in a van. |
| H1a | 同年12月1日， | — | 2.10 | pickup into the drop | The van drives from night into dawn with parallax (near and far trees). Glow leaks between the crate's slats. The van reaches the 圆明园 gate about 2 beats before the drop (stamp 「2020.12.1」). | The camera keeps moving **through the gate** to the courtyard doors. |
| H1b | 你回到了圆明园。 | — | 2.35 | **DROP (hardest)** | Pays off T4. Two staff push the doors open on the hit and copper light spills across the flagstones. No white flash; the sky is kept darker so you are the brightest thing. Fast push 1.0 → 1.12, then ease. You stand in the 文殊亭. | Continuous. |
| H2 | 你离开了【160年】。 | 160年 | 2.35 | beat | A slow orbit around you (stamp 「1860 → 2020」). | **Crane up** out of the courtyard. |
| H3a | 十二个里，回到中国的有七个。 | — | 3.60 | — | The T5 ring forms over the garden and seven medallions light. 「回国 7/12」. | Same shot. |
| H3c | 今夏杭州，人们排几小时看你兄弟。 | — | 4.35 | — | Hangzhou, summer 2026 (F28, F31): a long night queue of silhouettes winds up to a lit museum door; inside, four copper glows (牛、虎、猴、猪) side by side. No "5小时" on screen. Stamp 「2026夏 · 杭州」 (浙江省博物馆). | Match the four warm glows back onto the four tags on your empty-seat ring, then pull back to you alone at 正觉寺 for H3b. |
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
