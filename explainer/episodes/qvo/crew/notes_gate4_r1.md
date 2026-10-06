# Gate 4 notes: 量子计算机不是同时算（配音版） full cut v3 — verdict: APPROVE

Cut: /tmp/claude-0/qvo/master.mp4 (130.1 s, 1920×1080/30). I opened all 11 v3 sheets and spot-checked 16 more frames from
the master: 16.3, 27.9, 30.7, 46.6, 58.3, 66.0, 81.5, 91.9, 104.6, 108.6, 113.3, 113.6, 113.75, 113.9, 119.0 and 126.5 s.
Probe: black 0, glitches 0, −14.1 LUFS, −1.75 dBTP, LRA 3.5. The only frozen stretch is the end card (125.4–129.6).
I discarded the probe's "6.47 Mbps too low" flag: this file is the HD master, and delivery is the separate ≤ 28 MB encode (owner-notes row).

Scores (rubric 1–5, all six areas): script 5 · visual 5 · info 5 · edit 4 · motion 4 · sound 3

| Area | Score | Evidence (vs v1) |
|---|---|---|
| Script | 5 | **Better than v1.** The myth is on frame 0 ("都说量子计算机，能同时算所有答案"), and it is called 误导 by 0:05. The concrete numbers (<5 分钟 vs 10²⁵ 年) land by 0:10. r12 now says "理论上". The crypto section now ends on relief: r16b "好在，抗量子的新加密标准，已经发布了" plays 1:49.5–1:53.1 and the stamp is held through it (sheet_10 1:50.00/1:51.27). The takeaway r17/r18 is followed by the share question e1/e2. Every number traces to facts.md (rows 2–4, 6–8, 11–12, 18–20, 22, 24, 26, 28–30). |
| Visual | 5 | One committed oscilloscope world from 0:00 to 2:03, ending on the gold Juno end card (J, title, coin, question, follow pill, two-line sources; 126.5 s). Frame 0 already shows the opening fan, the `00 · 传说` label and the subtitle (sheet_01 0:00.00). No hands, faces or maps, and no "Juno 出品". |
| Info | 5 | **Amplitude now proves the line:** at 0:45.00 the \|0⟩ wave is taller and the bars read 64 % / 36 % 示意 (row 30). There are 10 coins on "10枚 = 1,024" (0:54.15). 2³⁰⁰ ≈ 2×10⁹⁰ sits over the 10⁸⁰ atoms box (58.3 s). The payoff: 7 rows go flat with their % faded, and \|101⟩ climbs 91.8 → 94.1 % to `RESULT 101` (sheet_07). ≈ 1 万倍 is now clear of the stamp (113.3 s). 10 mK ×100+ reads on its own (27.9 s). |
| Edit | 4 | The title lands on drop 1 (0:15 grid) and "不是。" + the spike on drop 2 (1:02.97). Transitions are motivated by the instrument: the wall collapses into one spike, the cursor carries over, and the crypto chart fades before the rows draw (113.6 → 113.9). That one has no double exposure now; there is a ~0.2 s empty graticule at 113.75, which reads as a beat, not a dip. Subtitles hold until the next line. Not 5 because the chapter-label decode shows junk glyphs for a few frames (`?* · ?FB9` at 30.7, `3D ·` at 113.9). |
| Motion | 4 | Something purposeful happens every 2–4 s: counters type, the coin spins, the trigger snaps, rows flatten, the camera pushes on the stamp. Clip-to-graticule is fixed (0:20.00). The 1:30 molecule hold is gentle but short. |
| Sound | 3 | VO plus the owner's BGM. The duck starts 250 ms early (mix.py l.28), and the producer's ASR shows 你/谁说 are now intact. Levels are on spec. There is no designed SFX (whooshes, ticks), which is the same as every episode so far. That isn't a blocker. |

**Overall:** I would post it today. All 12 v1 reviewer items and the 4 known issues are fixed or acceptably resolved, except the two below. Neither would make the owner send it back, so I have not routed them as revisions.

| # | Sev | Where | Note | Route to | Owner note it relates to |
|---|---|---|---|---|---|
| 1 | nit (optional, do not block) | 30.7 s, 113.9 s (every chapter change) | The chapter-label scramble shows random glyphs (`?* · ?FB9`, `3D ·`) for a few frames. On a phone this is ~6 px of top-left text. If it is ever touched: scramble only the characters that change, or resolve within 4 frames. | animator (next episode) | "中间的剪刀没有render好" (everything renders whole) |
| 2 | nit (optional, do not block) | 1:42.1–1:45.4 (r15) | v1 #1 also asked to restore the screen label `什么时候？专家估计 几年～几十年（NIST）` (facts row 25). It is still absent (104.6 s). The film never states a year, so there is no overclaim. The label would just make the r15 → r16b relief arc firmer. | animator (only if a re-render happens anyway) | "只有我过得不好感觉有点误导" (plain reading = truth) |
| 3 | delivery check | upload file | Before sending: (a) make the ≤ 28 MB 2-pass encode (~2 Mbps, −14 LUFS) and look at its frames at 0:01.8, 0:55, 1:00 and 1:15. The 1.2 px traces of the fan, the wall and the rows must survive the encode; if they mush, raise the trace weight in the encode only, not the master. (b) Take the cover from ≈0:01.8. (c) Declare the AI content (TTS voice). | producer | Douyin 低质/批量 row |

What must not change (it works):
- **The hook:** the myth on frame 0 with the fan opening, 误导 ✗ at 0:05, the <5 分钟 vs 10²⁵ 年 channels, and the title on the hardest drop.
- **The "不是。" spike** on drop 2 (1:02.8), and the wall-to-spike collapse.
- **The interference payoff:** 1:14–1:21 (faded %, \|101⟩ in red to 94.1 % 示意, `RESULT 101`), and its reprise at 1:54–1:58 with ✗ 算得多 / ✓ 错的抵消.
- **The amplitude scene** at 0.8 / 0.6 → 64 / 36 示意.
- **The crypto arc:** Shor 1994 示意 → RSA → 先存后解 (NIST) → <1,000,000 估计 · 2025 / 2026 ↓ → 好在 + NIST 2024.08 stamp, held during r16b.
- **Hedges:** 理论上, 估计, 示意, 将来 · 可能, Google 估计, and 测速题 · 暂无实际用途（Google）.
- **The end card:** the gold Juno card, which builds immediately, with the share question and two-line sources. No "Juno 出品".
- **The mix:** the 250 ms early duck, −14.1 LUFS and −1.75 dBTP.
