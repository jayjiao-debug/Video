# ep50 fix round 1 (from: director gate 4 → notes_gate4_r1.md, QA → qa_notes_r1.md, cold read → coldread_frames.json)

Keep the director's must-not-change list (in notes_gate4_r1.md). The sound is handled by the producer: effects are cut to 16 story hits. Do not add effect-dependent picture beats, and do not rely on the crowd sound or the 77.75 chime. Both are off.

## Builder A (0–54.75 s + master50 / lines50 / shared furniture)
1. **Two-row lines (QA 1).** Row 2 types immediately after row 1 (gap ≤ 0.2 s), so the punch rows (金字旁, 一张纸, 刀铲圆贝, 半两, and B's 二十五斤八两 and 防人伪造) are fully readable. In the hook, 钱 stays visible until 3.0 s.
2. **Title (D3, QA 5).**
   - Put it on a lacquer plaque built from styleB parts, with the ink at about y 140–330, above the walker's head, at +15 % size. Slam it in on 9.25. The walker's first step comes on 12.25.
   - Optically centre it: the ink centre within 960 ± 2 px.
3. **Centred punctuation (D5, QA 7).**
   - In the shared centred-subtitle component, pull back about ½ em of the trailing 。？ for C1 and the Q lines.
   - Measure the ink centre on stills (960 ± 2).
   - Builder B applies the same rule to the end card.
4. **Counter and stamp glitches (D4).**
   - No 「唐 621」 flash at 45.0.
   - The rewind spin lands on 「约前1300」, including 约.
   - When a line's stamp header is unchanged, the stamp stays and does not vanish and retype.
   - During pillar wipes, subtitles stay fully opaque. The cold reader read the wipe at 36 s as a glitch.
5. **Fewer standing stations (D6, cold read: 38–52 boring).**
   - Make the 五铢 balance an in-stride insert: he keeps walking and the balance slides past.
   - Keep the 半两 levelling and the 开元 tag fly-off.
6. **3.0–6.0 (D7, QA 9).**
   - Scale the phone and QR up about 2×.
   - The walker's one-tone forearm holds the phone; it never floats. The 交子 peels off in his hand.
7. **商 section, 6–19 s (D13, cold read: slow).**
   - Make 「海边运来」 visible: a sea line and a file of porters with baskets coming inland.
   - Give each line one visible event: the cowrie bounce, the belt string, the casting.
   - Keep the walker moving.
8. **Guess labels (D14):** 金块？/刀？/铲子？ at ≥ 44 px, on one baseline, readable.
9. **「钱 = 铲子」 tag (D15):** leaves when the glyph melts, at about 30.5.
10. **战国 fan (QA 6):** spread the four coins apart so each shape reads; don't clump them in the fist.
11. **Text (QA 8, QA 12).**
    - Stamp line 2 at ≥ 28 px.
    - In-picture labels/tags at ≥ 40 px where they carry meaning.
    - Subtitles use 「」 or “” instead of ASCII quotes. Regenerate lines50 from lines_read.json with the quotes replaced.

## Builder B (54.75–127 s + end card)
1. **Iron vs copper (D1, QA 2):** replace the weighing with a counter trade.
   - Iron coins drop onto the counter one per beat, count 1→10, and the seller slides back one copper coin.
   - Tags: 「铁钱 10枚 ⇄ 铜钱 1枚」.
   - Remove the black tube; hands only.
2. **「不到1文」 (D2):** the spin lasts ≤ 0.6 s. Land it by 94.15 at ≥ 56 px and hold it until the crumble at 96.45.
3. **Iron string reads as coins (cold read: "像锁链").** Larger visible coins with square holes at the loop's bottom and along it, and a brighter rim. The 54–66 section is long, so keep it moving: cart, haulers, the keeper's reaction.
4. **Gate → print shop (D10):** push into the slip and match-cut to the drying line; no double-exposure of figures, and the old slip doesn't linger.
5. **官司不断 (D11):** a few silhouettes hold up slips at the doors and the shutters drop. Remove the phone ghost at 77.75 (D12), or keep it silent and short; preferably remove it.
6. **Counter (QA 10):** 「明初」 instead of 1375 for 宝钞.
7. **QR plaque (D8):** fades in at ≥ 107.5, not while the counter says 1948.
8. **10.17亿 panel (QA 11):** no solid black box lingering into the next scene; fade it with its scene. Land the count as a stamp, with no partial values readable.
9. **Walk line, 110–116.5 (D9, cold read confused).**
   - Drop the 重→轻 curve.
   - Track along the props at about 120 px each and light each group on its word (贝壳 / 铜 / 纸 / the phone's number).
   - Keep 「16.80」 only if it plainly reads as "a balance" (a ¥ sign is fine); otherwise use 「···」.
10. **D16 small items.**
    - Drop the 「半两」 tag next to the silver's weights at 104 s.
    - The balance beam doesn't hang in mid-air during the hush at 97 s: fade the whole balance, or keep its post.
    - The raised slip stays off the subtitle rows at 79.5.
    - The printer's hands touch the table and the block at 83.
    - He scans from arm's length at 108.
    - Follow pill in at about 123.0.
11. **End card centring (D5):** trailing ？ ½ em rule; ink centre 960 ± 2 for the question and the title lines.

## Both
- Check every changed shot with full-size stills against QUALITY_BAR.md and the key frames.
- Typecheck `npx tsc --noEmit -p .`.
- No full video render; the producer re-renders.
- Hand back a short list (item → time → what you did) and refreshed strip_A.jpg / strip_B.jpg.
- Budget about 75 minutes.
- Disk is limited; delete bundles.
