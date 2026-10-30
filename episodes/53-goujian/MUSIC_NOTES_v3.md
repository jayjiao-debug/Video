# ep53 v3 music contract (2:25, build the picture to this)

The v3 bed is cut and measured: `music/build53v3.py` → `music/ep53v3_bed.wav` (gitignored), 145.333 s = **4360 frames at 30 fps**, −14.0 LUFS, true peak −2.2 dBTP. Map: `music/_build_info_v3.json`. **The timeline is `lines_v3.json`** (`[start, end, text, flag]`). Same grid as v2: beat P = 0.56605 s, **DA(k) = 0.4432 + 2.2642·k**, `frameOf(t) = Math.round(t·30)`; a hit is complete ON its frame.

## Song layout (film DA bar ← song bar)
DA(−1…8) as v2 (hook, title on bar 24, lull) · DA(9) DIVE = B pre 72 … 76 → (copy join) 12 … 15 fill at DA(16) · **DA(17) DRAW = chorus-1 bar 16** … 23 (deep break 23 b4 = 56.482–57.048) · **DA(25…40) verse 24–39 = the 勾践 thread** · DA(41–42) chorus 22–23 again (paper test; deep break 97.238–97.804) · DA(43–46) valley 64–67 (M1, M2) · DA(47–48) hush (drumless intro), near silence 110.639–111.389 · **DA(49) T1 = DROP bar 84** … 89 · (90–91 left out) · DA(55) 92, 93 · DA(57) lift 94–95 · **DA(59) P1 = bar 96** · 97 · 98 · **DA(62) END CARD = coda 105**, fade 143.088 → 145.248.

## v2 → v3 time maps (where the picture can be reused)
- 0 → 20.821: identical.
- v3 38.935 → 51.954 = v2 43.463 → 56.482 (**t_v2 = t_v3 + 4.528**): the draw, the inscription, 鸠浅＝勾践.
- v3 92.709 → 111.389 = v2 56.482 → 75.162 (**t_v2 = t_v3 − 36.227**): the paper test, M1, M2, the hush (still from 110.639 is v2's 74.412 still: HandoffMacro).
- v3 111.389 → 124.976 = v2 75.162 → 88.748 (t_v2 = t_v3 − 36.227); v3 124.976 → 140.824 = v2 93.275 → 109.125 region with the lines re-timed (bars 90–91 removed): see the hits below.
- NEW: 20.821 → 38.935 (faster descent + chamber, was 20.821 → 43.463) and **51.954 → 92.709 (the 勾践 thread)**.

## Lines and hits (film s; land each hit on its frame)
| # | Line | Start | End | Hits / notes |
|---|---|---|---|---|
| 0 | H1 你家菜刀… | 0.000 | 5.538 | rust 0.443; knife→bronze match 1.575; [亮] 2.707 |
| 1 | H2 它的主人… | 5.538 | 9.500 | |
| — | TITLE | 9.500 | 11.764 | slam f285 |
| 2 | S1 如今它在湖北省博物馆… | 11.764 | 16.293 | |
| 3 | S3 有一种流传很广的说法… | 16.293 | 20.821 | sheen on the lull 18.557; Cr tile (question) |
| 4 | S4 是不是真的？… | 20.821 | 24.217 | DIVE 20.821 |
| 5 | D1 1965年冬…10.8米深的楚墓 | 24.217 | 29.312 | the dig in the snow; depth tag starts |
| 6 | D2 夯土和白膏泥层层封住… | 29.312 | 33.840 | the descent (≈2.4 m/s), depth reaches 10.8 at the 椁 floor by ≈34.4 |
| 7 | D3 打开木椁和两层棺… | 33.840 | 38.935 | roof 33.840 · lid ① DA(15) 34.406 · lid ② 35.538 · top-down over the inner coffin DA(16) 36.670 (fill bar: the sheath is lifted and rinsed 36.670–38.3) |
| 8 | D6 洗净剑鞘，拔出来 | 38.935 | 42.897 | DRAW on DA(17) 38.935 (chorus downbeat) |
| 9 | I0 越王鸠浅，自作用剑 (q) | 42.897 | 47.425 | glyph pairs per half-bar from DA(19) 43.463 |
| 10 | I1 十几位学者…40多封信… | 47.425 | 51.954 | 信 counter per beat; 鸠浅＝勾践 on DA(22) 50.255 |
| 11 | G1 前494年…被围在会稽山 | 51.954 | 57.048 | deep break 56.482–57.048 (bass and kick out) |
| 12 | G2 他派人跪着求和… | 57.048 | 61.577 | verse downbeat 57.048 |
| 13 | G3 吴王答应了…吴国怕要变成沼泽 | 61.577 | 67.237 | |
| 14 | G4 他去吴国服侍夫差三年… | 67.237 | 71.766 | |
| 15 | G5 回国后…苦胆…[尝] | 71.766 | 77.426 | |
| 16 | G6 他问自己…会稽之耻 | 77.426 | 81.388 | |
| 17 | G7 前473年…[应验了] | 81.388 | 87.049 | the palace under water on a downbeat (DA(37) 84.220 or DA(38) 86.484) |
| 18 | G8 吴国没了…还亮着 | 87.049 | 92.709 | back to the bright real blade |
| 19 | B1 1977年拍科教片… | 92.709 | 97.804 | light click DA(41) 93.275 · clapper 94.407 · slice DA(42) 95.540 · halves fall in the deep break 97.238–97.804 |
| 20 | M1 博物馆的解释，先说[料好] | 97.804 | 102.332 | macro begins 97.804 · 料好 bar + Cu, Pb tiles on DA(44) 100.068 |
| 21 | M2 镀铬？…热镀[锡] | 102.332 | 106.861 | 「镀铬？」 + Cr tile 102.332 · cut opens 103.464 · 热镀锡 + Sn tile DA(46) 104.597 |
| 22 | M3 那它，到底为什么不锈？ | 106.861 | 110.639 | HUSH; picture still (HandoffMacro) from 110.639 |
| 23 | T1 其实，它也[锈]了。 | 111.389 | 114.219 | DROP: bloom 1 on f3342 (111.389), 2nd 111.955, 3rd 113.087 |
| 24 | T2 只是锈得很轻… | 114.219 | 117.616 | |
| 25 | T3 保住它的…主要是那座[墓] | 117.616 | 122.144 | rewind from 117.616; the sword settles in the coffin on the arrival DA(53) 120.446 |
| 26 | E1 证据：同一座墓里的其他剑… | 122.144 | 125.540 | other swords light one per half-bar from DA(54) 122.711 |
| 27 | L1 剑鞘、两层棺、木椁、白膏泥… | 125.540 | 130.069 | six layers close one per beat from DA(55)+2P 126.108: 126.108 / 126.674 / 127.240 / 127.806 / 128.372 / 128.938; lift bars from DA(57) 129.505 |
| 28 | R2 出了墓，再好的保管…[变暗] | 130.069 | 134.031 | surface → museum floor on 130.069; up into the case |
| 29 | P1 它不是不会锈…[两千多年] | 134.031 | 139.692 | P1 peak: pull-back starts 134.031; the kitchen (frame 0's framing) holds from ≈138.5 |
| — | air | 139.692 | 140.824 | the kitchen holds |
| 30 | END 你第一次见到它，是在哪？ | 140.824 | 144.824 | END CARD + J seal on f4225 (140.824); 0.5 s fade to black, film ends at frame 4360 |

On their own clock (never on the beat): the camera's travel, snow, the depth tag, letters, the stamp's year rolls, water, air dots, the shadow-play's slow drift. Never pulse the whole frame on a beat.
