I changed four lines in `tasks/ep53-script-polish/out/script_notes.md` and left the other 22 alone, including H1, T1, P1 and the end question. No line start or end times moved, and I edited no other file. I checked the reading budgets by hand rather than with `pace.py`, because the sandbox blocked it. Please re-run it on the final JSON.

The four changes:

| Start (s) | Line | New text | What it fixes |
|---|---|---|---|
| 61.58 | M1 | 博物馆的解释，先说[料好]：铜质好，杂质少，铅几乎为零。 | Drops the 18–20% tin figure, which the cold reader found lecture-like. This also removes the hanging 「原因之一」, since 墓, 剑鞘 and 隔绝空气 follow in T3, E1 and L1. |
| 66.11 | M2 | 镀铬？博物馆研究了7年多：剑身的菱形花纹，是热镀[锡]。 | Turns the noun pile into a full sentence that matches E5. 「镀铬？」 still opens it, with no verdict word. |
| 86.48 | E1 | 证据：同一座墓里的其他剑，也几乎没锈。 | Makes this line explicit proof of T3's 「主要是那座墓」. |
| 95.54 | R2 | 出土时是亮的，如今[没那么亮]了。 | Says that H1's 「亮」 was the 1965 state, so the opening and the later 「锈了」 no longer clash. |

- **Budgets:** every row is ≤ 16 characters, and every window covers its budget. The tightest is M2, with a 4.528 s window against 4.49 s once the script's +0.25 s for two rows and numerals is added.
- **Highlights:** still 9 of 26 lines, on the same payoff words.
- **Biggest remaining weakness:** the real answer ("it did rust, lightly, and the tomb held it off") only arrives at 75–82 s. The 24–61 s stretch is a chronology with little cause-and-effect, and the 镀铬 question opened at 16 s is closed only implicitly at 66 s. Wording can't fix that with timing locked. If a later round can touch timing, cutting or merging one of the dig lines or the 40-letters line would let T1 land earlier.
- **Mis-stated sourcing to double-check:**
  - E8 (the brightness and "it rusted too" claims) is 后德俊 in 北京日报 2016. R2 now says 「如今」 and its stamp reads 「1965 → 2026」, so the stamp should say 「据后德俊 2016」.
  - T3's 「主要是墓」 is 后德俊's own weighting, while the museum's 2025 answer (E10) lists three reasons starting with material. Keep the 「据研究员后德俊」 stamp on T1–T3.
  - The tin figure has two published values (B7 18–20%, B8 16–17%). The new M1 avoids the conflict by not printing a percentage.
  - The timing columns in `script.md` are stale against `lines_bars.json`. I used `lines_bars.json`.
- **Considered and not changed:** S1, S3 (a faucet analogy for 镀铬), M3, T2 and T3. The notes file gives the reason for each.
