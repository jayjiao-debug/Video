# Task: script v3 for ep53 越王勾践剑 (about 2:20): faster start, more history, shorter ending. Write the lines; don't touch code.

You are the screenwriter (编剧) for 「Juno · 一起看懂世界」, a Chinese Douyin channel of subtitle-only history shorts (no voice-over; the owner's BGM バケモノの唄 instrumental under it). Episode 53, 「越王勾践剑 / 真的没锈吗？」, is built and the owner watched v2 (1:53). It is ONE continuous camera move (一镜到底): kitchen cleaver → the sword in the museum → down through the soil into the 1965 tomb → the draw, the inscription, the 1977 paper test → macro into the metal (tin, not chrome) → "it did rust, lightly" → the tomb's layers kept the air out → back up into the museum and the kitchen. Read first: `episodes/53-goujian/brief.md`, `script.md` (v2 beats, the gate notes it answered), `lines_bars.json` (the 26 approved v2 lines with start/end seconds: `[start, end, text, flag]`; `[x]` marks the underlined keyword, `{…}` a small second row, `\n` a row break), `facts.md` (only ✓ rows on screen as fact; `?` rows only as labelled 说法/推测), `storyboard.md` (the legs), `notes_gate1_r1.md`.

## The owner's notes on v2 (verbatim intent)
1. "We can make the video a bit longer, around 2:20, to add more information about the sword: its history, background and interesting facts. Now we only explain why it shines and doesn't rust."
2. "0:25–0:36 is a whole scene going down to the grave. The tempo is too slow at the beginning: viewers who reach half the video will likely stay, but this early it loses retention." (Today: 20.8 「是不是真的？先回到它出土那天。」, 23.0 「1965年冬，湖北江陵，修水渠时，挖出一片楚墓。」, 28.7 「其中一座，深10.8米，用夯土和白膏泥层层封住。」, 33.3 「两千多年，从没被盗过。」, 35.8 「木椁里，套着两层棺。」, 38.9 「内棺里，墓主人左边，一把剑插在黑漆鞘里。」.)
3. "These (锡 etc.) most viewers won't know." → 铜/锡/铅/铬 will appear as periodic-table element tiles on screen (Cu 29, Sn 50, Pb 82, Cr 24). Write the lines so the tiles can carry the meaning (a tile appears when its element is named).
4. "The whole scene at the end is just camera moves around the sword; shorten it and make room for the other requests." (Today 95.5–109: 「出土时是亮的，如今没那么亮了。」, 「再好的保管，也没法让锈完全停下。」, 「它不是不会锈，是那座墓，替它挡了两千多年。」.)

## What to write
- **Target: 132–142 s including the end card (about 4.5 s)**, i.e. about 25–30 s more than now, of which the start must get FASTER: from the dive (20.8) to the coffin open should take about 10–12 s instead of 18 s (fewer, denser lines; merge or cut; keep 10.8 m and 从没被盗过 only if they earn their place).
- **Add 25–35 s of new content** from ✓ facts that makes the viewer say "原来如此/我不知道": candidates (choose, order and compress; you need not use all):
  - whose tomb: 悼固, 楚悼王曾孙, died before 30 (A13);
  - why a 越 king's sword lies in a 楚 tomb: 陪嫁说 is the mainstream view (勾践之女嫁楚昭王, 生楚惠王, H2), plus 战利品说 / 赏赐说 (H3, H4), always as 说法, never as fact;
  - the reading of the inscription: 方壮猷 first read 「邵滑」 (C3), then letters to a dozen scholars, 唐兰 1966 「鸠浅，即勾践」 (C4, C5);
  - how it was made: cast in parts, the pommel cast separately with 11 rings, the diamond pattern by hot tinning; in 2025 the museum recast a replica with the original technique (B10, B11);
  - its travels: 1984 to Hong Kong together with 吴王夫差矛 (the two rivals' weapons side by side, D5); since 2013 on the list of relics barred from exhibition abroad (D2/G1).
  Keep the spine: the question 「真的没锈吗？」 must stay open until the turn (「其实，它也锈了。」), and the payoff 「它不是不会锈，是那座墓，替它挡了两千多年。」 stays. New content must not stall the spine: place each new fact where the picture already is (e.g. the tomb owner while we are in the coffin; 陪嫁 right after 鸠浅＝勾践; the rivals' weapons in the museum at the end, replacing pure camera moves).
- **Keep approved v2 lines** wherever they still work; change only what the notes require, and mark every change (kept / changed / new / cut).
- **House rules:** each row ≤ 16 字; one or two rows per line; about one line in three has a [keyword]; questions alone are centred (flag `q`); reading pace about 4.1 字/s, about 2.6 s per line at most 4.5 s; no line on screen longer than it takes to read plus about 1.5 s (except held beats on the music); 你 = the viewer; no 「Juno出品」; never call 镀铬 a 谣言 (it is 「一种流传很广的说法」).
- **Stamps** (top-right, two rows: 年份 · 地点 / a ≤ 10 字 note): give one per line or 〃 (same as before), and source each new one to a facts row.

## Output (write these files)
1. `episodes/53-goujian/lines_v3_draft.json`: the full line list in the `lines_bars.json` format `[start, end, text, flag]` with provisional seconds (the music will be re-cut to bars later, so ±0.5 s is fine), plus a parallel `episodes/53-goujian/stamps_v3_draft.json` (`[{"i": line index, "y": "...", "place": "...", "note": "..."}]`).
2. `episodes/53-goujian/script_v3.md`: the beat sheet (beats with start–end), a table of every line (kept / changed / new / cut, facts rows used), where each element tile appears, the picture idea for each NEW line in one sentence (one continuous camera; what the camera passes through), and the total length.
3. Run the pace check: `python3 .claude/skills/video-reviewer/scripts/pace.py <a 3-column copy of your json: [start,end,text]> --film-end <your end>` and fix anything worse than MINOR.
4. Your final reply: in Chinese, a short summary for the owner (what changed and why, the new facts, the new length) followed by the full line list (one line per row with its time).
