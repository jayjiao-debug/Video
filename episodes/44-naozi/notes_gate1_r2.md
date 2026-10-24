# Gate 1 notes: 你是爱因斯坦的大脑, script v2 + lines.json (49 lines, 2:37.75), r2. Verdict: APPROVE

Scores (rubric 1–5, only the areas this gate covers): **script 5** (r1: 4) · facts **pass** · visual/info/edit/motion/sound: not at this gate.

**Bottom line.** All six r1 notes landed, and I accept all three of the screenwriter's flags. Nothing here would make the owner send the script back.
- **25–54 s is now a chain, not a résumé.** The light-beam question at 16 → ten years → the answer → proven in 1919 → famous → the prize skips it → fear → signature → regret.
- **The hunt speeds up:** 10 → 6.5 → 4.75 s.
- **The ending's 「可」 now turns** against a real belief.
- **T1 now pays off A4.**

The title and the end-card question are still the owner's picks. The notes below carry forward to the storyboard and the edit; none of them needs another script round.

**Inputs read:**
- script.md v2 (changelog, "Where I differ", line table), lines.json, lines_pace_flags.json, script.facts_flags.json.
- facts.md L6 and L10 (revised), plus B7/B8 and B26/B27 for T1.
- My notes_gate1_r1.md and coldread_gate1.json (r1; there is no v2 cold read).

**Checks I ran myself:**
- `pace.py --film-end 157.75`: no TOO FAST, waiting 3.9 s = 2 %. The CHECK is the rewind title and the two WAITs (D2, Q) are deliberate.
- `facts.py --lines`: no problems.
- Width and floors on all 49 lines:
  - the widest is 16.0;
  - typed lines all have Needs + 0.4 s;
  - the new cut-on lines meet Needs (E1b 2.25 / 1.96, G3a 2.25 / 2.24, G3b 2.50 / 2.39).

## Did each r1 note land?

| # | r1 note | v2 | Landed? |
|---|---|---|---|
| 1 | Life run reads as a CV | Z1 is cut. P2 「你想了10年，答案叫【相对论】。」 and N1 「他拿诺奖，不是因为你的【相对论】。」 are in. P1's picture keeps the L1 beam running in his head, and the counter shows 16 → 23 → 26. The E1 split (routed by the producer from the cold read) answers "right about what?". | **Yes.** Every line from 25 to 54 s is now a cause, a result or a twist, and 你 is back in four of them. |
| 2 | L6 sentence (researcher) | It is quoted in full, ✓, with "the germ of the special relativity theory" from the same page. The limits are set: no 整整, and 狭义 only if 1915 appears. | **Yes.** |
| 3 | Hunt jargon and speed | G2a 「你管空间想象的那块，【宽了15%】！」 (顶叶 moves to the label). G3a and G3b are cut-on, 4.75 s. The order of who debunks each find is kept. | **Yes.** |
| 4 | Ending 「可」 | F1 「几十年来，研究你的人都相信：」 / F2 「你身上，一定【深藏着什么】。」, on K2's shot. | **Yes.** |
| 5 | T1 | 「他没有坟墓，你的切片在【博物馆】。」. The picture matches the A4 sky before the drawer opens, and the card says 藏品. | **Yes.** The match cut is a good addition. |
| 6 | Precision a–g | The 1960 label is gone. The stamps are fixed: 费城 · 宾大实验室, 当天火化, 约十分之一的你. G4a reads 拿到过你. The counter holds 76 through D2–A6. No bare 240 appears. | **Yes**, all seven. |

## Rulings on the three flags

| # | Flag | Ruling |
|---|---|---|
| 1 | E1a 「1919年日全食：星光真的【弯了】。」 | **Accept.** It is better than the fallback 「天上的光真歪了」. L10 now holds the measurement itself: Dyson, Eddington & Davidson 1920 found starlight deflected by the Sun's gravity, "confirm[ing] EINSTEIN'S generalised relativity theory". So 弯了 is the sourced physical claim, not just a gloss of a headline. 歪 is the NYT's joke word, and it stays on the headline prop and the stamp. The line says that the light bent, not that only Einstein predicted it. E1b's 你对了 is the 1919 verdict as announced. Limits for everything downstream (picture, cover, description, pinned comment): never 「精确证明」, never 「牛顿说光不会弯」, and no angle number on the drawing (the bend is drawn exaggerated, as L10 says). |
| 2 | P2 says 相对论, not 狭义相对论 | **Accept.** In plain Chinese, 相对论 covers both, and 1919 did confirm relativity in that sense. With 狭义 in P2, E1b's 你对了 would point at a theory the film never names, and it would suggest the 1905 paper predicted the bend, which is worse. Condition (from the researcher's L6 limit): 1915, 广义 and 狭义 stay off screen everywhere, stamps included. |
| 3 | The compass callback is now partial (「事物背后」 → 「你身上」) | **Accept.** My r1 note asked for this change, because a true 「可」 needed the belief to be about the tissue. The callback still lives in two places: the gold phrase 一定【深藏着什么】 and K2's exact shot. The cold reader's problem was the logic, not recognising the callback. Carry-forward 1 keeps the callback readable. |

**Also accepted:**
- The end-card default is now 「如果是你，愿意把大脑【留给科学】吗？」 (producer-routed). 天生 stays as the alternative in the same slot. It remains the owner's call.
- Length is 2:37.75 (+2.25 s for the E1 split, which is worth it). Retimed to bars, that is about 2:50, under the 3:00 cap. P1 stays the next cut if 2:30 is ever required.

## Carry-forward (non-blocking; storyboard and edit)

| # | Note | Route to |
|---|---|---|
| 1 | **F2's callback.** Put 一定【深藏着什么】 in the same position, colour and size as at K2, on K2's exact frame, so the half-changed sentence still reads as the same thought. | art-director, animator |
| 2 | **Floors in the retime.** E1b, G3a (0.01 s spare), G3b, R4, D1 and D2 are cut-on at Needs. Bars may only add time to them. G3 must stay the shortest rep (≤ G2), or the speed-up joke is lost. | editor |
| 3 | **E1 picture:** the starlight bend is drawn exaggerated, with no number. **P2 picture:** the lit sheet says 相对论 only, and E=mc² stays small. No 1915, 广义 or 狭义 anywhere (ruling 2). | art-director |
| 4 | **r1 carry-forwards 1–6 still stand:** frame-0 number clutter, the 你/他 glow at K2, the title card all motion on the first drop, a big 胶质细胞 label, the hunt speeding up in the picture, and voiced stamps if a voice is added. | art-director, editor, producer |

**Optional v2 cold read** (not a condition of approval). Check:
1. whether 25–54 s still feels like a résumé;
2. whether 星光真的弯了 → 你对了 reads in one pass;
3. whether F1 → F3 now reads as a turn;
4. which end-card question the reader would actually answer.

## What must not change
- **Everything on the r1 list:** the cold open and rewind title, the counter spine and the D1/D2 split, the 你/他 rule, B1 → A5, K1/K2, W1–W3, S1/S2, A1–A9, R1–R4, G1 in full, the debunker order, G4b, 收着 / 藏品, and F3/F4 with 「——爱因斯坦」.
- **New in v2:**
  - P2 「你想了10年，答案叫【相对论】。」 with the 16 → 26 counter;
  - E1a/E1b as a stacked pair, with 你对了，他红了 cut on the beat;
  - N1 「…不是因为你的【相对论】」;
  - G2a 「你管空间想象的那块」;
  - G3 as two cut-on lines;
  - F1/F2 as the researchers' belief;
  - T1 「他没有坟墓，你的切片在【博物馆】。」 with the A4 sky match;
  - the counter holding 76 from D2 to A7;
  - Z1 out, so no Nazi-era surface.
