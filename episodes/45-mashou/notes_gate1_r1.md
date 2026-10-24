# Gate 1 notes: 圆明园马首, script v1 + lines.json (51 lines, 2:34), r1. Verdict: REVISE

Scores (rubric 1–5, only the areas this gate covers): **script 4** · facts **pass with 6 fixes** (one overclaim, five cautions; see the facts table) · visual / info / edit / motion / sound: not at this gate.

**Bottom line.**
- This is a strong v1. It opens on 「假如说」 with the topic on frame 0. The cold open chains seven fates over hard cuts in 18 s and ends on a present-day hook. The counter, the hammer set-piece and the noon image (A7, then K1) all exist, and so does the film's one new device: the counter that changes meaning at H4.
- The cold reader says it would keep watching. Its strongest feelings are exactly the ones we want: E4 「他没等到」, the curled ear, and the noon fountain.
- Four things keep it from a 5:
  1. **The 「回家」 counter contradicts the story before the twist.** Your slot relights as 回家 at 2007, but the lines say 你回家 in 2020.
  2. **The 40 s hammer section reads as exam recall.** It is years, prices and names. The cold reader's #1 swipe point is 59.5–91 s. Several lines also fail "reads alone": 他 with no antecedent, 它们, 这十二年, and "which time was it 6910万".
  3. **The ending repeats instead of landing.** K3 restates C7, K2 and K3 put 十一 and 五 next to each other, and the one new fact that would earn the closing question (the 2018 dragon lot) is left off screen.
  4. **Wording slips.** 十二个兄弟 is wrong, 又上拍 and 在圆明园出生 overstate, and the 2026 「今天 / 至今」 claims rest on 2025 sources.
- One screenwriter pass plus one researcher pass fixes all of it. Length stays at about 2:33 bare (about 2:45 after the bar retime, under the 3:00 cap).

**Inputs read:**
- director.md, SKILL.md (Director), the rubric and all owner-notes rows.
- ep45: brief.md, facts.md (all rows, corrections, Risks), script.md, lines.json, coldread_gate1.json, crew_log.md.
- ep44: notes_gate1_r1.md, as the bar.

**Checks I ran myself:**
- `pace.py lines.json --film-end 153.75`:
  - no line is TOO FAST, and waiting is 7.7 s = 5 %;
  - the CHECK at 18–21 s is the named title/rewind beat (note 13);
  - the WAITs at A7, B4, H4 and Q are the named picture beats.
- `facts.py script.md --lines lines.json`: no problems. That script only checks that each number appears in script.md, so I traced every number and named claim by hand (table below).

## Gate 1 checklist

| Check | Result | Evidence |
|---|---|---|
| Hook, first 3 s | **Pass; one soft spot** | 「假如说，你是圆明园的马首。」 satisfies the owner's 假如说 note and rows 22 and 47. It gives the viewer's situation and the topic, with the glowing head on frame 0. Cold read: "puts me in the artefact's place, not a history lesson" and keeps watching. The soft spot: 0–3.5 s is one static premise with no countable number and no contradiction (row 47 wants the contradiction by 3 s). The first curiosity spike is C4–C5 (花6910万买下，又送了出去). Note 12. |
| Cold open | **Pass** | 7 lines in 18 s, each a hard cut with an event; ends on a present-day hook (C7). The cold reader says it spoils the whole story arc and it stays for the "why". That is fine here, because the film's real answer (回国 ≠ 回园, noon) is not in it. One misread: C3 → C4 reads as a single London sale (note 4). |
| Structure | **Pass** | Cold open → 你是谁 (noon) → 1860 → hammer → 他 → 哪个家 → 正午. Every beat is an event except the post-A7 explainer run, where A1–A2 are description. The B section is school-known (cold read #15–17, a swipe point). The D section is dense (note 7). |
| Every line reads alone | **Fails on 10 lines** | See notes 2, 4, 5, 6, 8, 9 (十二个兄弟, 又被送了出去, 还是他 / 他 in E2, 它们, 这十二年, 离开，160年, the H5/H6 split sentence, 其中五个). |
| 你 voice | **Mostly** | 你 is in every line except the brothers' own sales (D3–D5, D11–D14): 7 of 15 lines in the hammer section are about someone else. Note 7. |
| Counter device | **Strong idea, one defect** | 12/12 → 0/12 → 3 → 4 → 5 → 7 → split into 回国 7/12 / 回园 1/12 is the new device and it works. The label 回家 before the split contradicts C6 / E4 / H1. Note 1 (STRUCTURAL). |
| Repeated set-piece | **Pass** | Hammer 1 full wind-up, hammer 2 three quick hits, hammer 3 held in the air (the pause), hammer 4 fast, then no hammer for the gift. It varies and speeds up. A7 → K1 is the second bookend. |
| Ending + comment question | **Ending image strong, K3 weak; question good** | K1–K2 (noon, 还差十一个) is the film's best close. K3 repeats C7 and adds nothing new (note 3). Q 「如果找到了，该花钱买回来吗？」 is a real argument starter. The cold reader would go to the comments for it. Keep it. |
| Titles | See ranking below | |
| Length | **Pass** | 2:34 bare, target ~2:30, cap 3:00. After notes 3, 12 and 15 about 2:33. A bar retime of +8 % gives about 2:45. |
| Facts | See table | One overclaim (A1), one wording mismatch (D6), five cautions. |

## Title ranking (owner's pick; ≤ 10 字)

1. **马首回家，用了160年.** 160 is F21's estimate (1860 → 2020), and the plain reading is what the film shows. It does not give away the twist and names the subject. **Against:** the cold open already told 1860 → 2020, so the card adds only 「160」. The cold reader finds it "a bit memorial-article" and "slightly exaggerated". It is still the safest card.
2. **6910万买下，又送了出去** (the cold reader's click). It has a real contradiction, and the cold reader says it is the thing that made them ask "why". **Against:** it is 12 字, over the cap; the card does not say what was bought (no 马首), which fails the feed and search; 送 is ambiguous; and C4–C5 already say exactly this, so the card repeats the cold open. It frames the film as a tycoon story. It becomes #1 if shortened to something like 「花6910万买下，又捐了出去」 and the subject is carried by the cover. That is the owner's taste call.
3. **回到圆明园的，只有它.** **Against:** it gives away the H4 twist (row 105). The cold reader says its plain reading misleads ("only one came back", while seven did): fails row 11. It also says 它 where the film's rule is 你.

Dropped by the screenwriter and I agree: the 「假如你是…」 shape, and 「十二兽首，还差十一个」.
Optional fourth for the owner to consider: **马首回家那天，他没等到.** E4 is the cold reader's strongest feeling and its comment bait ("破防"). It spoils E4, and it makes the film Ho's story more than the horse's.

## Facts table (every number and named claim in the lines)

| Line(s) | On screen | Row | Status |
|---|---|---|---|
| C1, A3, K1 | 圆明园 · 海晏堂 · 十一个兄弟 · 水池两边 | F1, F4 | ✓ |
| A1 | 乾隆年间，你在圆明园**出生** | F1, F2, F7 | **Overclaims.** F2 says the court artisans made it; no row says it was cast in the garden. 乾隆年间 is the safe date. Note 10. |
| A2 | 红铜 · 一次铸成 | F5 | ✓ |
| A4–A7, K1 | 每个时辰（两小时）轮流喷水 · 水力钟 · 午时 · 正午十二个一起喷 | F3 | ✓ Press sources only (人民日报 2009, 2019). This is the film's emotional key, so it wants a second source (note 11, R3). 时辰 is fine, but 「每两小时」 is clearer. |
| C2, B1–B4 | 1860年10月 · 英法联军 · 都被搬走 · 10月18日 · 一把火 · 不知去了哪 | F9, F10 | ✓ No one is named as taker. B2's "dry fountain" would assert F8 (one source): show the fountain neutral. |
| C3, D1, D2 | 伦敦 · 一百多年后 · 1989 · 台湾收藏家 | F11, correction 6 | ✓ Do not put a number on the 1989 tag beyond 「几十万美元」 (sources: $367k / $400k). |
| C4, D9 | 6910万港元 | F13 | ✓ A private sale brokered by Sotheby's. The line says 买下, never 拍卖纪录: correct. |
| D3, D4 | 2000 · 牛、猴、虎 · 买回中国 · 3/12 | F17 | ✓ No prices on screen: correct. |
| D5 | 2003 · 何鸿燊买回猪首 · 4/12 | F18 | ✓. The H4 label 「保利艺术博物馆」 for the pig is **not** in F18's wording, which says 保利剧院 (note 11, R2). |
| D6 | 2007年，轮到你**又上拍** | F12 | **Wording mismatch.** F12 says 「要上拍」 (scheduled; the sale never took place). Use 又要上拍. |
| D7, D8 | 锤子没有落下 · 拍卖前，买下了你 | F12, F13 | ✓ The "why no hammer" (国家文物局 stance to stop the public sale) is in F12 and is not stated on screen (note 6). |
| D10 | 贵了二十多倍 | F11 / F13 估算 22–24× | ✓ in USD (8.84 m / 0.367–0.40 m). The two price tags must both be in USD (「几十万美元」 vs 「884万美元」, Sotheby's own figure), not HK$6910万 against a USD tag. |
| D11–D13 | 2009 · 巴黎 · 鼠首和兔首 · 3149万欧元 · 拒绝付款 | F19 | ✓ 3149万 is for both heads together: the label must say so. The buyer is unnamed: correct. |
| D14 | 2013 · 法国一家人送回 · 7/12 | F20 | ✓ |
| E1 | 这十二年 · 香港、澳门 · 展出 | F14 | ✓ 2007 → 2019 = 12 年 (估算). The anchor is missing (note 8). |
| E2 | 2019年11月13日 · 捐给国家 | F15 | ✓ |
| E3, E4 | 2020年5月 · 去世 · 98岁 · 没等到 | F16 | ✓ |
| H1, H2 | 2020年12月1日 · 回到圆明园 · 160年 | F21 | ✓ 估算. Never 「回到原来的位置」 (correction 1): not said. |
| H3, H4 | 七个回到中国 · 回到圆明园的只有你 | F21, F23, F24 | ✓ as the **present** state (the six are in museums; the 2023 visit was a loan). F21 says 「第一件」, not 「唯一」, so 只有你 depends on the 2025–26 situation (note 11). |
| H5, H6 | 正觉寺 · 唯一没被烧掉 | F22 | ✓ A superlative with one press source (中新网 2011) plus a tourism page: add the 圆明园管理处 page (note 11). |
| H7, H8 | 耳朵卷了 · 研究的人说：被撞过 | F6 | ✓ Correctly attributed. |
| H9, H10 | 2023 · 牛虎猴猪 · 待了12天 | F24 | ✓ 10-18 → 10-29 = 12 天. |
| C7, K2, K3 | 还有五个没回来 · 还差十一个 · 至今没回来 | F21, F23 | ✓ The dragon is not claimed: correct. **「今天 / 2026 / 至今」 are caution** (F23 and F22 are checked to 2025). |
| Q | 如果找到了，该花钱买回来吗？ | F12, F19 | ✓ It is a question, not a claim. |
| Counter | 12/12 → 0 → 3 → 4 → 5 → 7 → 7/12 + 1/12 | F17–F21 | ✓ arithmetic. Label problem: note 1. |

Not in any line, correctly: F8 (1795 pipes), the collector's and the bidder's names, all 2000 prices, 「原址」, the 2018 dragon lot (note 3 proposes it, if confirmed).

## Notes

| # | Sev | Where | Note | Route to | Owner note it relates to |
|---|---|---|---|---|---|
| 1 | **High · STRUCTURAL (device)** | Counter label, D4–D14, C7, E2 | **Rename the early counter 「回国 x/12」 and keep 「回家」 for the garden.** Today the horse's slot relights as 「回家 5/12」 at 2007 and stays lit through 2019, while C6 / E4 / H1 say 你回家 in **2020**. A viewer who tracks the counter sees a contradiction at E4, and the twist at H4 (回国 vs 回园) lands as a correction instead of a reveal. With 「回国」 from the first slot (2000, 3/12) → 4 → 5 → 7, every line stays true: 买回中国, 送回, 回到中国. H3 「回到中国的有七个」 matches the label. At H4 the second row 「回园 1/12」 appears under it. The twist is still a surprise, and it is now fair-play. C7's counter reads 「回国 7/12」. B4 can stay 「在家 12/12 → 0/12」. | screenwriter (spec), then art-director | brief "counter changes meaning"; row 11 |
| 2 | **High** | C7 (14.5), H3 (115.0) | **「十二个兄弟」 is wrong.** There are eleven brothers: A3 says 十一个兄弟 and the horse is the twelfth. C7 → 「可十二个里，还有【五个】没回来。」 H3 → 「十二个里，回到中国的有【七个】。」 Same slots, same width. Cold read #39 was confused on the arithmetic here. | screenwriter | row 13 |
| 3 | **High** | K2–K3 (142.25–148.0) | **The ending restates C7 and mixes 十一 with 五.** Cold read: "到底差五个还是差十一个？" K3 「其中五个，至今没回来」 adds nothing new after 134 s. **(a)** Researcher: find what happened to the suspected dragon head sold in France on 17 Dec 2018 (sold or withdrawn, to whom if public, what experts said) and keep F23's safe wording 「疑似龙首…不能确认100%」. **(b)** If it is confirmed, K3 becomes one new beat that earns Q, which is the same dilemma in real life: 「2018年，法国拍场出现一个【疑似龙首】。」 then 「真假，至今【没法确认】。」 (+2.5 s). The dragon is a suspected lot only, never 找到了. **(c)** Fallback, if (a) can't be confirmed: K3 → 「六个在博物馆里，五个至今没【回中国】。」 It re-uses H4's six glows and uses 回中国 (not 回来), so 十一 = 六 + 五 is visible. The window needs about 3.25 s (take 0.25 s from Q). | researcher (a), screenwriter (b / c) | rubric 1 "the ending lands rather than restates"; row 12 |
| 4 | **High** | C3 → C4 (5.5–10.0) | **The hook sentence reads as one London sale for 6910万.** 「在伦敦，被拍卖，被人花6910万港元买下」 is, on plain reading, a single event. Cold read: "到底是谁在伦敦买的？6910万是哪一次？前后对不上." D2 then says a Taiwan collector bought it in London. Fix: C4 → 「又被人花【6910万港元】买下，」 (one character; 0.1 s from C7's spare). The stamp already changes to 2007 · 香港. Also put 「几十万美元」 in D2's stamp so D10's 「比1989年」 has a number to compare to (cold read #28). | screenwriter | row 11 "plain reading" |
| 5 | Med | C5 (10.0) | **「又被送了出去」 is ambiguous** (sent where, by whom, sold again?) and the sources say 捐. It is the cold reader's first curiosity spike, so keep the contradiction and make the verb exact: 「又被【捐了出去】。」 Same slot. | screenwriter | row 13 |
| 6 | Med | D5, D7, D8, E2 | **Name the man and say why the hammer didn't fall.** Cold read #25–26: "他是谁?" (D8 refers back 7 s to D5, with two lines in between), "没落下是流拍?" **(a)** D5 stamp: 「何鸿燊 · 澳门企业家」 (F18 says 企业家). **(b)** D8 → 「拍卖前，还是何鸿燊，买下了你：」 (14 字). **(c)** E2 → 「2019年11月，何鸿燊把你【捐给了国家】。」 After that, 他 is safe (E3 onwards). **(d)** D7's why goes in the stamp, not the line: 「国家文物局：终止公开拍卖」 (F12). The researcher confirms the order (R5). No casino wording anywhere. | screenwriter (lines, stamps), researcher (R5) | row 13; Risks "real people" |
| 7 | Med | D3–D14 (63–96.5 s) | **Number soup.** The cold reader's #1 swipe point: "全是年份+金额+人名，没有一句是感受，像背考试题." The years are in the stamp **and** in the line (D3, D5, D6, D11, D14, E2, E3, H1), which is the row 104 duplicate. **(a)** Where the stamp carries the year, take it out of the line. **(b)** Give 你 back its voice in the brothers' sales: D3 → 「你的兄弟牛、猴、虎，【上了拍卖台】。」 and D11 → 「鼠首和兔首，在巴黎【上拍】，」 (the stamp keeps 2000 / 2009). **(c)** D12's label: 「3149万欧元 · 两件合计」. **(d)** Keep D4, D7, D9, D13 as written: they are the four punches. Re-run pace.py after; D3's saving buys back the time for note 6. | screenwriter | row 12 · row 104 · brief "你 voice" |
| 8 | Med | D14, E1 | **Two reads-alone failures.** D14 「它们被法国一家人送回」: 它们 (the film's rule is never 它; the cold reader had to work out who) → 「2013年，法国一家人，把鼠首兔首【送回】。」 E1 「这十二年」 has no anchor (D14 just said 2013): → 「从2007年起，你在港澳【展出】了十二年。」 | screenwriter | row 13 |
| 9 | Med | H2, H5–H6, H8, H10 | **Four small reads-alone fixes.** H2 「离开，160年。」 is cryptic → 「你离开了整整【160年】。」 H5 / H6 split one sentence across two subtitles, so H5 ends dangling (「…正觉寺：园子里，」) → H5 「你住进了【正觉寺】。」 H6 「圆明园里，唯一【没被烧掉】的老房子。」 H8 → 「研究的人说：这一路，你【被撞过】。」 (ties the scar to the lost years; cold read: "被什么撞的?"). H10 「又走了」 puzzled the cold reader (why leave?) → 「待了【12天】，又回了博物馆。」 | screenwriter | row 13 |
| 10 | Med | A1–A2 (21–26.75) | **Fix the "born in 圆明园" overclaim and save 2.5 s in one move.** F2: made by court artisans; no row says it was cast in the garden. Merge A1 + A2 into 「乾隆年间，你由红铜【一次铸成】。」 (12 字, 3.25 s). The colour is in the picture and 圆明园 · 海晏堂 stay in the stamp. Also A4 → 「每两小时，轮到谁，【谁就喷水】。」 (F3 says 两小时): it makes the "clock" idea land for viewers who don't know 时辰. | screenwriter | rubric 1 · row 12 |
| 11 | Med | facts.md | **Five checks.** **R1:** is the horse still shown at 正觉寺 as of Oct 2026, and has anything changed for the five? The stamps 「今天」, 「2026」 and the lines 「至今」 (C1, C7, K1, K3) rest on 2025 sources. If the answer is not confirmable, stamp 「2025年底」 and keep the lines. **R2:** where the pig head is now. F18 says 保利剧院; the H4 picture labels 保利艺术博物馆 for four heads. **R3:** one more source for the noon claim (圆明园管理处 or a scholar) in addition to the press. **R4:** the dragon lot (note 3). **R5:** the sequence of the 国家文物局 statement, the 9/20 purchase and the withdrawal of the lot. Add F22's 圆明园管理处 page for 唯一. | researcher | row 19 · brief "must avoid legends as fact" |
| 12 | Low-Med | C1 (0–3.5) | **Give C1 something that moves.** One premise line sits 3.5 s over a still glowing head. The water drop must land on the first beat (inside 1 s, row 22), and a second small event at about 2 s (a slow push toward the eye / the curled ear) keeps the shot alive. No new subtitle. Carry-forward for the storyboard. | art-director, editor | rows 22, 47 |
| 13 | Low-Med | Title card (18–21) | **Keep the card from reading as dead air.** The cold reader (lines only) sees 3 s with no text and thinks the film froze. It is the rewind + title, so the picture must be all motion, the music must keep running into the hit (row 91), and the card carries 马首. The title belongs on bgm2's **hardest** drop; if that is later than 18 s, row 133 puts the title on the first drop and moves the E4 → H1 beat to the hardest drop (the script already has the full pause then the drop there). Measure before the retime. | editor, art-director | rows 26, 84, 91, 133 |
| 14 | Low | D10 picture | **Both price tags in USD, same unit** (see facts table). Tag 1989: 「几十万美元」; tag 2007: 「884万美元（约6910万港元）」, with 884万 from Sotheby's own conversion. | art-director | row 76 |
| 15 | Low | B1–B3 (43–52.5) | **The 1860 run is what 18–25 viewers already know** (cold read: "没有新信息，容易划"). Fold B2 into B3: 「能搬的搬走，剩下的，【一把火】。」 (11 字, 3.2 s) and move 10月18日 to the stamp. −3.0 s, and the run is two lines before the one line that is new (B4, 你被带走了). | screenwriter | row 12 |

**Length after notes:** 153.75 − 2.5 (A) − 3.0 (B2) + 2.5 (K3) + small line changes ≈ **2:33**, about **2:45** after the retime to bars, under the 3:00 cap. Do not cut H7–H8 or H9–H10 (the cold reader liked them).

## STRUCTURAL notes (change the device or the beat order)

- **Note 1 only** (the counter label). Everything else keeps the beat order. Note 3 changes the content of one ending beat but not the order.
- Everything else is line-level or a fact check.

## What must not change (it works)

**Story and lines**
- **C1 on frame 0**, 「假如说，你是圆明园的马首。」, with the typed line and the glowing head.
- **C1–C7 as one sentence over hard cuts**, each fate paid off later on the same shot (C2 → B3, C3 → D2, C4 → D7–D9, C5 → E2, C6 → H1).
- **A4–A7 → K1–K2**, the noon image that opens and closes the film: 「正午十二点，十二个一起喷水」 and 「你们本该一起喷水」.
- **B4 「你被带走了，不知去了哪」** (F10 / correction 6: no claim about who).
- **The hammer set-piece** and its escalation, especially D7's held hammer and D9's 「6910万港元」 slam. No 拍卖纪录, no names for the bidder or the collector.
- **D13 「买家却拒绝付款」** (the film's most dramatic fact).
- **E1–E4**, ending on the one full pause, 「他没等到，你回家那天」.
- **H3–H4**, the twist and its counter split. Only the label before the split changes (note 1).
- **H5–H6**, the temple the fire missed.
- **H7–H8**, the curled ear. The cold reader's second surprise: "它不是一件文物，是活过的东西." Attribution stays 「研究的人说」.
- **H9–H10**, the four brothers' 12-day visit (loan, not a move).
- **Q 「如果找到了，该花钱买回来吗？」** on the Juno end card (the alternative is softer and starts fewer arguments).

**Discipline**
- Only ✓ rows, 估算 shown as 约 / 多 / 整整, F8 kept off screen.
- No 国耻 slogan; the sources' own verbs (抢, 烧, 拍卖, 买回, 捐).
- No maps with borders; London, Hong Kong and Beijing as skylines or labels. Silhouettes only for people, no faces, no flags.
- Lines ≤ 16 wide, the reading floors met, waiting at 5 %.
