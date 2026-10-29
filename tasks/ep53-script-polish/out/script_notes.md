# ep53 越王勾践剑: subtitle polish (wording only, timing locked)

Source of truth for timing: `lines_bars.json`. The timing columns in `script.md` are older (for example T1 is at 69.25 s there and 75.16 s in `lines_bars.json`), so every window below is `end − start` from `lines_bars.json`.

Four lines changed (limit was about 8). The other 22 are untouched, including H1, T1, P1 and the end question.

**Budget method.** Characters are counted the `pace.py` way: Chinese characters, plus each digit run as 1. Budget = 0.5 + chars/7 + 0.6 s. The "strict" column adds the script's own +0.25 s for two rows or numerals. I did this arithmetic by hand, because my attempt to run `pace.py` was blocked by the sandbox. Please re-run `pace.py` on the final JSON before locking.

**Chars per row** is the visible width including punctuation. The limit is 16.

## 1. Changes

| Start (s) | Old text | New text | Chars per row | Window s | Budget s (strict, +0.25) | Fact IDs | Why |
|---|---|---|---|---|---|---|---|
| 61.577 (M1) | 不锈的原因之一，是[料好]：<br>含锡约18–20%，铅几乎为零。 | 博物馆的解释，先说[料好]：<br>铜质好，杂质少，铅几乎为零。 | 12 / 14 (old 12 / 16) | 4.528 | 4.10 (4.35); old was 3.96 | E10, B9 (unchanged set; B7 no longer on screen) | Fixes the lecture feel and the hanging 「原因之一」. The 18–20% figure is gone: the cold reader could not tell why it matters, and B7 itself calls it a common Wu-Yue composition. 「铅几乎为零」 stays as the one concrete detail. The words 「博物馆的解释，先说」 attribute the claim and signal that more follows, and it does: 墓, 剑鞘 and 隔绝空气 arrive in T3, E1 and L1. No other 原因 is promised, so nothing hangs. |
| 66.105 (M2) | 镀铬？博物馆研究了7年多，<br>结论是：菱形花纹，热镀[锡]。 | 镀铬？博物馆研究了7年多：<br>剑身的菱形花纹，是热镀[锡]。 | 13 / 13 (old 13 / 13) | 4.528 | 4.24 (4.49); old was 4.10 | E5, E7 ? | The old row 2 was a noun pile (「菱形花纹，热镀锡」) and the cold reader lost a step. Now it is a full sentence: the diamond pattern is hot-dip tin, which is exactly E5. 「镀铬？」 still opens the line and nothing is struck. There is no 不是铬 / 没有铬 / 谣言. It still makes no claim that the tin stops rust. |
| 86.483 (E1) | 同一座墓里的其他剑，<br>也几乎没锈。 | 证据：同一座墓里的其他剑，<br>也几乎没锈。 | 13 / 6 (old 10 / 6) | 3.962 | 3.53 (3.78); old was 3.24 | E11, E10 | Cause and effect. T3 just claimed 「主要是那座墓」, and this line is the proof. Without 「证据：」 it read as one more fact in a row. |
| 95.540 (R2) | 出土几十年，它反而[没那么亮]了。 | 出土时是亮的，如今[没那么亮]了。 | 15 (old 15) | 3.396 | 2.96 (one row, no numerals); old was 2.96 | E8, A9 | Fixes the 「还是亮的」 vs 「没那么亮」 doubt where it is cheapest. It does not touch H1 or T1. It says out loud that H1's 「亮」 was the 1965 state (A9 「出鞘时仍寒光闪闪」; E8 「不如出土时明亮」). The viewer then sees H1 as true and T1 as the twist, not as a contradiction. The highlight stays on the payoff, 「没那么亮」. |

Highlights: still 9 of 26 lines, about one in three. The highlighted words are unchanged: [料好], [锡] and [没那么亮] each keep theirs.

Every row is ≤ 16. Every window ≥ the plain budget, and also ≥ the strict budget. The tightest is M2: 4.528 s window against a strict 4.49 s.

**Considered and not changed:**
- **S1** 「独立展厅」: flat, but the next line pulls the viewer back. The tempting fix 「独占一间展厅」 goes past D1 (director note 7).
- **S3** 「镀了铬」: a faucet analogy would clarify why chromium matters. But it adds an everyday claim with no facts.md row, and the 4.528 s window would be at its limit.
- **M3** 「那它，到底为什么不锈？」: kept. With M1 now saying 「先说」, it reads as "and the rest?", which is what the twist answers.
- **T2 and T3** (「锈得很轻」 and 「不是什么秘方，主要是那座墓」): kept. They already carry the answer to the 「亮」 doubt for the eye, and T3 sits on the E8 wording.

## 2. Verdict

The biggest remaining weakness is structural and wording cannot fix it with the timeline locked. The film's real answer ("it did rust, lightly, and the tomb held it off") arrives only at 75–82 s. Before that, 24–61 s is a chronology (dig site, inscription, paper test) in which only the 「先回到它出土那天」 promise (S4) ties back to the title question. The 镀铬 loop opened at 16 s is closed only implicitly at 66 s. My edits fix the three weak spots the cold reader named:
- the lecture-like tin/lead line;
- the hanging 「原因之一」;
- the 「亮」 / 「锈了」 doubt.

They also give E1 an explicit "proof" role. They do not shorten the middle stretch. If a later round can touch timing or order, the cheapest gain is to cut or merge one of D2 / D3 / D4 or the 40-letters line, so that T1 lands earlier.

## 3. Things in facts.md and on screen to double-check

- **E8 is dated 2016, but R2 now says 「如今」, and the script's R2 stamp reads 「1965 → 2026」.** The brightness statement is 后德俊 in 北京日报 2016. Suggest the stamp read 「据后德俊 2016」. The existing end-card sources line already dates it correctly (note 6).
- **T3 「不是什么秘方，主要是那座墓」 is one researcher's opinion (E8, 后德俊 2016).** The museum's own 2025 list (E10, 江旭东) gives three co-equal reasons, starting with material. M1 now says 「博物馆的解释，先说料好」, which is consistent with E10. But T3's 「主要」 is 后德俊's weighting, so keep the stamp 「据研究员后德俊」 on T1–T3. Without the stamp the film speaks as if the museum agrees on 主要.
- **B7 (tin 18–20%) and B8 (16–17%, 陈振裕 2023) are two published figures.** The facts file picks B7 correctly. The new M1 avoids the conflict by not printing a percentage. B7's own source line calls this a common Wu-Yue alloy, so 「含锡18–20%」 was never evidence of 「料好」.
- **H2 「卧薪尝胆」 (I5 ?)**: acceptable as a label. 「卧薪」 has no Shiji source, so nothing may say where the phrase comes from.
- **H1 「埋了两千多年」**: safe (战国中期 to 1965, A14). Never write 2400. The tomb owner is not 勾践 (A14 puts the burial at 战国中期, long after 勾践), so 「主人，是…勾践」 in H2 must stay about the sword's owner, as it is.
- **M2 plus S3**: the film still never says tin protects the sword (E5 says nothing about that; E16 is another sword). Do not let a stamp or picture tag add it.
