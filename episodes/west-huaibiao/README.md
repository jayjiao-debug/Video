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
