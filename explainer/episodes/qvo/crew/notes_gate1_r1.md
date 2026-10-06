# Gate 1 notes: 旋转的硬币（配音版） script v1 + vo.json — verdict: REVISE

Scores (rubric 1–5, only the areas this gate covers): script 4 · info (on-screen numbers) 4

Evidence: h1 at 0.1 s names the topic and the line the viewer has heard (no detour), a concrete number by 8–11 s
(< 5 分钟 vs 10²⁵ 年), title on the measured drop, the "不是。" on the second drop, one takeaway, and a 发给谁 ending.
Every number in VO, subtitles and on-screen text traces to a VERIFIED or 计算 row: 105 (1), < 5 min / 10²⁵ / 远超宇宙年龄 /
Google 估计 (2, 3), 无实际用途 (4), 3×3→7×7 ÷2 (5), 10 mK / 2.7 K / ×100+ (6, 7), 2ⁿ / 2³⁰⁰≈2×10⁹⁰ / 10⁸⁰ (11, 12),
SciAm 少数题 (14), Shor 1994 (16), NIST (17, 22, 24, 25), < 1M · 2019 20M · 2026 ↓ (18, 19), 64,000,000,000 (26).
No supercomputer name, 105 tied to Willow, no year for "when", 示意 on the coin and the 94.1 %. Fact safety is clean.
What holds it back is one logic contradiction in the hook, one word that most viewers will misread, and no time headroom.

| # | Sev | Where | Note | Route to | Owner note it relates to |
|---|---|---|---|---|---|
| 1 | MAJOR | h2 3.4 s "这句话，只对了一半" | Not paid off, and the film contradicts it. The film never says which half is right; u5 then asks the same claim and r1 answers a flat "不是。"; the title and e1 treat the claim as simply wrong. The viewer hears "half right" and then "No". Replace with the sourced framing (Aaronson, row 13: "very seriously misleading"): **h2 VO/sub → 这句话，其实很误导** (8 字, same timing). On screen: replace ½ ✓ ½ ✗ with a red readout **误导 ✗**, and keep the left/right split cursor if you like. Everything downstream (u5, r1, title 1, e1) is then consistent. If you insist on keeping "只对了一半", you must name the right half at u5 (e.g. "这半句是对的，可答案能全拿到吗？" 14 字), change e1 to "谁说它是同时试遍所有答案", and title 1 can't be the pick. The first fix is simpler and costs nothing. | screenwriter | "只有我过得不好…误导"; "每句字幕第一次读就要懂" |
| 2 | MAJOR | s1 16.8 s "你手机内存里，有几百亿个比特" | In everyday Chinese, 手机内存 usually means storage (128/256 GB ≈ 1–2 万亿 bits), so viewers will think "几百亿" is wrong. → **你手机的运行内存，有几百亿个比特** (14 字, +0.2 s, fits in setup's 1.7 s spare). On screen: **8 GB 运行内存（以此计）≈ 64,000,000,000 bit**. Row 26 says 8 GB is an assumption. | screenwriter | first-read clarity |
| 3 | MAJOR | whole film, 124.9 s est. | It sits at the 125 s ceiling with zero margin, and the reveal block (63.1 s →, 231 字) is the only one that isn't anchored, so any TTS slower than 5.0 字/s pushes it over. Cut now and don't wait for the TTS: **delete r19–r20** (纠错格子… / 错误率减半…, 26 字 ≈ 5.7 s). It brings in new jargon (纠错格子) at 1:45 that the film has no time to explain. It isn't in the brief's must-include list, and r17 "这个数还在变小" already gives the honest "progress" note. r18 → r21 then reads as callback → why it's fast, which is a cleaner run into the payoff. Target ≈ 119 s. If the owner wants the error-correction beat kept, at minimum change r20 to **错误率就减半，越大反而越准** ("这条路走得通" overclaims; row 5 shows below-threshold scaling, not a working road to RSA) and trim the end-card hold to 4 s. | screenwriter | "后面的内容好无聊，保留精华" |
| 4 | MINOR | s5 28.0 s "它凭什么？" | Too short, and its subject is unclear right after the cold line (凭什么 to be cold?). → **就凭这一百零五个？** (sub: 就凭这105个？; 8 字, 1.6 s, ends 29.6 < 30.5). | screenwriter | first-read clarity |
| 5 | MINOR | r2 64.0 s "一测量，也只倒出一个答案" | "也" reads oddly here. → **一测量，只倒出一个答案** (or 还是只倒出). | screenwriter | |
| 6 | MINOR | r7 on-screen 94.1 % | The 示意 tag only appears at r8, but the number shows from r7. Put 示意 next to the readout from the first frame it appears. | screenwriter (→ animator) | no misleading numbers |
| 7 | MINOR | end card sources | 2026 ↓ (r17) rests on Google Research 2026-03-31 and Caltech 2026-03-31 (row 19). Add **Google Research (2026) · Caltech (2026)** to the sources line. | researcher | sources |
| 8 | NOTE | 11.45–14.24 s (no VO, build) | Not a script change. The 10²⁵ readout must still be counting or the CH1 trace still running here, so these 2.8 s before the drop aren't static. Flag for the storyboard. | animator | "第一帧和前3秒就要抓人" |

Length after notes 1–4 (+0.2 s, −5.7 s, +0.8 s): ≈ 120 s at 5.0 字/s, with ~5 s of headroom under 125.

What must not change (it works):
- h1 at 0.0/0.1 s: the topic and the myth the viewer has heard, subtitle on frame 0, the burst on the first beat.
- h3/h4 numbers and wording ("顶级超算估计要", "Google 估计", "远超宇宙年龄").
- "不是。" alone on the second drop (63.1 s); u5 → r1 is the best moment in the script.
- r4–r8: the noise-cancelling bridge (r5) into the 8-channel cancellation. This is the episode's core.
- All fact-safety phrasings: 105 tied to Willow, 这类芯片 for 10 mK, 将来或许, 可以先存着, 估计 + 还在变小, 这道题 (not Willow) 没用.
- The payoff r21–r22 and e1–e2 发给谁, plus the end-card question.

## Title ranking
1. **量子计算机不是同时算** (top pick): it has the topic word for search, the plain reading is exactly what the film proves (once note 1 is applied), and it's the line people forward to "that friend". Small cost: it reads clipped, so the cover should finish it with "所有答案".
2. **错的答案会自己抵消**: the most intriguing and accurate, but it has no "量子", so search and the cover have to do all the work of saying what it's about.
3. **旋转的硬币**: says nothing on its own, and the coin is only the 15 s break analogy, not the point.
