# Storyboard: 薄肌说明书 (script v9) — look: 「说明书」

**Look:** a premium product manual drawn as a blueprint.
- Background: dark navy (#0b1630) with a faint 48 px grid and a soft vignette.
- Colours: cyan (#5ce1e6) for muscle, "good" and step numbers; gold (#ffd166) for numbers and highlights; red (#ff7a7a) for ✗ and myths; pale blue for fat and neutral elements.
- Recurring hero: a **faceless IKEA-style mannequin**. Its cyan body is the muscle layer and a pale outline around it is the fat layer. It is friendly and never realistic.
- Every step page has a step box (`01 练`) top-left. Subtitles sit bottom-centre (Noto Sans CJK Bold 54, white with a dark stroke). Watermark top-right.
- Camera and transitions:
  - Each step change is a **whip-left on the downbeat**.
  - Within a step, a slow push-in (1.00 → 1.04 over the scene).
  - Every number lands with a 2-frame scale pop (1.12 → 1.0) on a beat where one falls nearby. Continuous animations (curves drawing, bars growing) run on their own clock.
- Original-voice quotes (🔊): the podcast frame appears in a rounded picture-in-picture window (60% size, cropped so its burned-in subtitles are hidden), with a waveform under it and the caption 「播客原声」. The BGM ducks ~10 dB.

Style frames: `style/frames/*.png` · sheet: `style/storyboard_sheet.jpg`.

| # | Time | Scene | Visual | Move / transition |
|---|---|---|---|---|
| S0 | 0:00–0:13 | Intro montage | Original podcast footage. **Zoom-crop 1.25× to hide the source's burned-in CN/EN subtitles.** A huge white 「薄肌」 (Noto Black 300, dark stroke) pops on every cut; a gold counter ×1…×30 top-right. As it gets squeaky, a slight shake and chroma split grow with it. | Hard cuts, no black. Pop scale 1.15 → 1.0 per cut |
| S0b | 0:13–0:14.5 | 「薄肌圣经」 slowed | The footage desaturates and tints navy; letterbox bars slide in; gold serif 「薄肌圣经」 centre. | Slow push-in; freeze on the last frame |
| S1 | 0:14.8 | 今天说说怎么练 | Black → the grid page fades up; the line types on | Still (no BGM yet) |
| S2 | 0:17.0 | **Title** | The manual cover slams in on the drum hit: 「MANUAL · 使用说明」, a huge 薄肌, cyan 说明书, spec line 「型号：薄肌 · 适用：普通人 · 无需用药」; the mannequin stands beside it | Cover drops from 1.15 → 1.0 + 6-frame shake **on the drum** |
| S3 | 0:19–0:28 | 先翻译 | The 薄肌 grid: x = 体脂率, y = 肌肉量. The glowing cyan 「薄肌」 zone; a red dashed ceiling at FFMI 25 with 「再往上：药」; a gold dot settles in the zone. Then the mannequin: the muscle layer thickens ↑, the fat outline shrinks ↓ | The axes draw; push-in |
| S4 | 0:28–0:55 | **01 练** | (a) A Mon–Sun calendar; ten cyan blocks drop, then split 5 + 5 onto 周一 / 周四. (b) Under it, a gold "肌肉合成" curve rises after each session and falls back by ~36 h. (c) A light dumbbell with a fill bar to 「力竭」. (d) A staircase, one step a beat. (e) ⚠ 「酸痛≠有效」: a muscle-fibre cross-section with small repair dashes; a week counter runs to "第10周" and the fibre widens | Whip-left in; each sub-beat slides up on a downbeat |
| S5 | 0:55–1:27 | **02 吃** | (a) 「70 公斤 × 1.6 克 ≈ 110 克 / 天」 big. (b) 110 g splits into four plates, 28 克 each. (c) 🔊 Q5 picture-in-picture. (d) A crunch icon ✗; a 6-week calendar fills 30 ticks while a belly-fat gauge needle stays stuck. (e) The mannequin's fat outline lowers, revealing six ab lines. (f) Two arrows, slow vs fast; the lean bars: slow +2%, fast flat | Whip-left in; push-in |
| S6 | 1:27–1:34 | **03 睡** | Two identical plates; 8.5 h vs 5.5 h; paired bars: fat lost 1.4 vs 0.6 kg (gold), lean lost 1.5 vs 2.4 kg (pale); the 5.5 h header in red | Whip-left; the bars grow on beats |
| S7 | 1:34–1:42 | **04 有氧** | A 43-tile grid flips green tile by tile; three bars: 肌肉 ↑, 力量 ↑, a small 爆发力 dips | Whip-left |
| S8 | 1:42–1:55 | **05 什么时候开始** | 🔊 Q2 picture-in-picture → a red pen strikes it. Ten small mannequins with grey "hair arcs" (age 90); bars: 练之前 vs 8周后 **+174%**; cyan stamp 「90岁都来得及」. Then the muscle curve from 30 → 80, held level by early "deposits" | Whip-left; the stamp lands on a downbeat |
| S9 | 1:55–2:05 | Ending | 🔊 Q4: the quote as a gilded card glowing like a share-count meme → an empty footnote 「无」 → a red strike-through → the mannequin, older (hair arc), still standing tall in cyan | Push-in; **tape-stop**: the picture slows and desaturates with the music |
| S10 | 2:05–2:07 | End card | Juno card (EndCard speed 2.5): 《薄肌说明书》 · 你今天练了吗？评论区报个体脂 · source line | ~2 s |
