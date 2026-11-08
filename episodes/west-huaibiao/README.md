# 一块怀表，引发了西部史上第一场对决 · hero cold open (2026-11-07)

Production bible (facts W1–W16, story map, script): https://claude.ai/artifact/AH9fdFhdPves8eVS5CyNAw

## The cold open, 23.8 s, 9:16 (1080x1920, 30 fps)
| Time | Shot (`godot/west.gd`, shot=) | Frame |
|---|---|---|
| 0–7.8 | `duel`: over the shoulder → dolly zoom into his eyes → POV → crash push onto the opponent's eyes; he narrows them | 16:9 band → full → 16:9 → 2.39 slit → squint slit |
| 7.8–10.4 | cutaways `hhand`, `tumble`, `ohand`, `heyes`, `oeyes`, then `flash` (the draw) | band / slit |
| 10.4–12.6 | black, 「这是电影里的西部对决。」 | — |
| 12.6–17.0 | `reveal`: one crane up and back; a line grows on the ground between them: 69 米 | band → full |
| 17.0–23.8 | `watch`: the gold pocket watch on the felt, ticking; title | full |

- Set: Synty POLYGON Western demo street (dressed by Synty) + desert, buttes, clock tower, cacti; Western Frontier for the
  gunslinger (`SK_Chr_Bandit_Male_01`); `SK_Character_Badguy_01` as the opponent. Golden hour, sun down the street.
- The squint: the Western rigs carry `eyes` and `eyebrows` bones; `squint()` squashes the eyes along the world-vertical
  axis and lowers the brows.
- Characters stand on the demo scene's own terrain (`ground_y()` samples its triangles).
- Materials: `west_mat.json` (mesh → slots from both material lists); default atlas per pack; glass slots transparent.
- Render: Modal, locked bundle `assets_west.tar.sealed` (11 MB, only the files west.gd uses), job shots carry
  `[name, frames, args, "1080x1920", "res://west.tscn", "assets_west.tar.sealed"]`. 679 frames ≈ 3.5 min wall.
- Edit, bars, text, voice, mix: `tools/hero_build.py` (bars = two black strips whose y follows one visible-height
  expression of t). Sound: `tools/west_sfx.py`, all synthesised (wind, watch-tick motif, Karplus–Strong guitar,
  heartbeat/toms, fly, leather creak, tumbleweed, spurs, gunshot with echoes, pad, chime, title hit). −14 LUFS.
- Voice: placeholder narrator Martin Li (voice farm id west-hero-vo-01), 1.06x.


## The body (after the cold open), v1 2026-11-08 · full film 3:01
Script v2 (39 lines, `lines.json`; timing from the voice clips in `timeline.json`). Voices are placeholders: Martin Li
(narrator), Vincent (Hickok), Xinghe Jiang (Tutt), voice farm ids west-body-vo-01/02.

| Body time | Shot (`godot/westb.gd`, shot=) | What |
|---|---|---|
| 0–6.3 | `night` | Springfield at night, down to the hotel's lit window |
| 5.8–46.2 | `cardroom` (4 segments, t0=0/10.1/20.2/30.3) | one take round the poker table: the $10 dispute, Tutt takes the watch and dangles it, Hickok's warning |
| 45.6–55.0 | `square_a` | 6 pm: the street clears; Tutt walks in toward Hickok in the low sun |
| 55.0–61.4 | REVEAL3 (cold-open v3 shot) | the backward flight down the 69 m line, counter 0→69 米 |
| 61.4–71.6 | `square_b` | 「戴夫，别过来！」 Tutt fires and misses; Hickok braces on his forearm and fires |
| 71.6–76.8 | `square_c` | Tutt staggers; his hat rolls toward the courthouse |
| 76.8–90.3 | `trial` | the packed room, Exhibit No. 1, the gavel, Hickok walks out into the light |
| 90.3–99.7 | `press` | the legend goes to print (invented magazine page); counter to 100 |
| 99.7–103.1 | `novels` | dime novels (invented covers) tumbling past |
| 103.1–108.45 | cold open reused | 「好莱坞把它拍成了你开头看到的样子」 |
| 108.45–115.4 | `square_wide` | the real square, wide |
| 115.4–121.3 | `archive` | 2026: the rediscovered records (no real documents) |
| 121.3–128.9 | `map` | top-down: the two marks, 69 米; Hickok's mark slides closer; the number breaks up |
| 128.9–139.5 | `saloon` | Deadwood 1876: Hickok at cards, a man comes up behind him; black before the shot |
| 139.9–154.0 | `cards` | two black aces, two black eights (+1 face down); the lamp goes out |
| 154.0–164.0 | `square_wide dusk=1` + end card | the empty square at dusk, the closing question, end card |

- Characters move with code poses on top of the idle (`puppet`, `sit`, `reach` two-bone IK, `walk_pose`, `bend`).
- Own textures (`tools/make_textures.py`): card faces, an invented page and covers, a ledger of scribbles, a tag.
- Render: Modal, bundle `assets_westb.tar.sealed` (only the 74 FBX + 5 textures these shots load), scene `res://westb.tscn`.
- Sound: `tools/body_sfx.py` (all synthesised), bed compressed to sit ~10 dB under the voice; edit `tools/body_build.py`.
