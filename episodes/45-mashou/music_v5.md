# Music map: ep45 rebuild (v5)

**Track:** the owner's BGM, sent again 2026-10-25 13:33 (`audio/bgm_owner.mp3`, local only, never committed). It is the
same file as ep43's (md5 32975059…). 254.1 s, mono 71 kbps, 106.00 BPM, `bar(k) = 1.4498 + 2.26415·k` (track time).
Sections: see `../43-qingming/music.md` (intro 0–2, drop 1 at bar 3, long 2-bar-loop section 16–63, breakdown 64,
build 72, stop 79, re-entry 80, pickup 83, hardest drop 84, outro 104, song end 252.2).

## The one cut (owner: one cut + fade-out, no loops / silences / dead stops)
- **Remove track bars 26–57 (32 bars = 72.45 s):** play to 60.32 s, jump to 132.77 s, 20 ms crossfade on the bar line.
  Inside the 2-bar loop: the bars either side match at 0.999 (spectral similarity), same level. Inaudible.
- **Result:** `audio/bgm_cut45.wav`, 181.6 s; the music ends at **film 179.75 s (3:00)**. A fade over the last bar, as in ep43.
- **Film bars:** film bar j = track bar j for j < 26, track bar j+32 for j ≥ 26; `bar(j) = 1.4498 + 2.26415·j` throughout.

## Film landmarks (film time)
| Film bar | Time | Music | Lands on |
|---|---|---|---|
| 3 | 8.24 grid · **9.05 audible** | drop 1 | title card (9.05 → 11.64) after C2b |
| 26 | 60.32 | (splice, inaudible) | — |
| 32 | 73.90 | breakdown (bass on alternate bars) | the 2007 room before the sale: D6a/D6b |
| 40 | **92.02** | build | Paris D9b 「锤子落下，两个共拍出…」 |
| 47 | **107.87** | stop (one bar, near-silence) | E2a 「2020年5月，何鸿燊去世，98岁。」 — the lamp goes out on the stop |
| 48 | 110.13 | re-entry, no bass | E2b 他没等到 |
| 51 | 116.92 | pickup | H1a 「同年12月1日，」 |
| 52 | 119.19 grid · **118.87 audible** | hardest drop | H1b 「你回到了圆明园。」 |
| 72 | 164.47 | outro | Q + Juno end card |
| — | 179.75 | song ends | film end |

Line times: `plan45v5.py` → `lines_bars.json` (each line on a beat, at least its reading minimum, anchors above).

## v6 cut, for a 2:30 film (owner, 2026-10-25 19:40: "they all sound fine"; candidate ③ chosen so the whole film fits in 2:30)
- **Remove track bars 7–52 (46 bars):** play to bar 7 (track 17.30 s), then jump to bar 53, with a 20 ms crossfade. No candidate reaching 2:30 matches at 0.999; this one is 0.97/0.97, and the owner heard all three and found them fine.
- **File:** `audio/bgm_cut45_150.wav` (local only, never commit).
- **Film bars:** j < 7 → track j; j ≥ 7 → track j + 46.
- **Landmarks (film s):**
  - title 9.05
  - join 17.30
  - breakdown 42.20
  - build 60.32
  - stop 76.17
  - drop 87.17 (audible; the grid is 87.49 − 0.32)
  - outro 132.77
  - music ends 148.05
