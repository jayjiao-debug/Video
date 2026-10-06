# Looks (gate 2a): 旋转的硬币（配音版） ep12

Owner's rule for this episode: take the **most analytical and dynamic** look. Previous look (ep11, and every film
before it, including the subtitle-only version of this topic): navy night + warm gold light. None of the three below
uses it. All three keep the engine layer the same: the subtitle band at y 820–960 (white Noto Serif CJK SC Bold 46 px
on a dark soft band), the corner mark `◆ Juno · VIBE知识大赏` top-right at 55 %, the top-left kept clear except for a small
chapter label, and the Juno end card (gold J and gold title) as the one place the warm gold appears.

Frames: `style/look<A|B|C>_<hook|key>.png` (source HTML + generator `style/make_frames.py`), sheet `style/looks_sheet.png`.
Subtitle lines on the frames are placeholders; the script isn't written yet. Every number shown (10²⁵ years, < 5 min, 105 qubits, 10 mK, 2¹⁰⁵) still has to be added to facts.md by the researcher.

---

## A · 示波器 Phosphor Scope (recommended)
1. **World:** a lab oscilloscope. Each idea is a signal you can watch: a qubit is a wave, measurement is the trigger
   that freezes it, and interference is two traces added on the MATH channel where wrong answers go flat and the
   right one grows. Graticule, channel labels CH1/CH2, cursors and live mono readouts carry the numbers.
2. **Palette / type:** screen #020604 → #07140D, graticule #1C3D2C, phosphor trace #7DFFB3 (dim #3E9D6C), readout
   white #F4FFF8, signal red #FF3B30 (the right answer, Willow, cursors). DejaVu Sans Mono for readouts and labels,
   Noto Sans CJK SC Black for big Chinese words. Gold only on the end card.
3. **Must NOT look like:** a hacker/Matrix terminal (no falling code, no scanlines everywhere), a sci-fi HUD with rings,
   or a navy night. Show one trace group at a time and keep the bezel out of frame. It should look like a real
   instrument screen, not a costume.

- Hook: the readout `10,000,000,000,000,000,000,000,000 年` (CH1, supercomputer) over a red `<5 分钟` (CH2, Willow).
  The burst on the trace is Willow's output.
- Key: 8 channels |000⟩…|111⟩. Seven traces go flat (dashed ghosts show 波峰 + 波谷 = 0) and |101⟩ grows into a red
  wave with a readout of 94.1 %.
- Build: Remotion + SVG/Canvas 2D (path data computed per frame). Traces draw live, readouts count up, and the cursor
  sweeps to the beat. Transitions are trace morphs (the coin's spin wave → the superposition wave → the 8 channels),
  each change motivated by the signal.

## B · 工程手稿 Drafting Plate (bold: leaves the dark family)
1. **World:** an engineer's drawing plate on cream graph paper. A qubit is a drafted coin with stroboscopic ghost
   outlines (which also read as a Bloch sphere). Interference is drawn as an equation of panels (路径1 + 路径2 = 0 /
   ×2). Each chapter is a numbered plate (图 1, 图 3) with leaders, dimension lines and red-pencil notes.
2. **Palette / type:** paper #F1ECE0, grid #E3DCCB / #D2C8B2, ink #1C1B19, red pencil #D0342C, construction blue
   #2F6DB5. Type: Noto Serif CJK SC Bold for plate titles, Noto Sans CJK SC for notes, DejaVu Sans Mono for dimensions.
   The subtitle sits on a dark ink strip.
3. **Must NOT look like:** a school worksheet or clip-art infographic, a navy-and-white architectural blueprint, or
   torn-paper "notebook" kitsch. The lines are drafted, not doodled.

- Hook: flat coins `0` / `1` → a large spinning coin with a red rotation arrow and the dimension `α|0⟩ + β|1⟩`.
- Key: two equation rows (错的答案 → red flat `= 0`, 对的答案 → red `× 2`) next to a hatched histogram with 101 at 94 %.
- Build: Remotion + SVG with stroke-dashoffset drawing-on, so lines are drafted live. Risk: a light frame is a
  change in brand feel, and the dark subtitle strip is heavier on paper.

## C · 翻牌显示屏 Split-Flap Board
1. **World:** a station departure board. Answers are "trains". Every digit is a mechanical flap, so numbers flip into
   place (2¹⁰⁵ rolling out to 32 digits). After interference the wrong answers' status flips to 已抵消 CANCELLED and the
   right one to 放大 AMPLIFIED.
2. **Palette / type:** board #0E0E0E, flap #202020 / #151515 with a #050505 hinge, flap text #F5F1E6, amber header
   #FFB81C, cancel red #FF3B2F, go green #3DDC84. Type: DejaVu Sans Mono Bold on the digit flaps, Noto Sans CJK SC Black on the Chinese flaps.
3. **Must NOT look like:** a casino or neon Vegas sign, a stock-ticker dashboard, or a skeuomorphic airport photo.
   The board is flat and graphic, with no 3D station around it.

- Hook: `2¹⁰⁵ =` on huge flaps, then the full 40 564 819 … 032 with the last group still rolling, `真的？` in red flaps.
- Key: 8 rows, probability flaps, bars, status column: 7 × 已抵消 in red, 101 lit green at 94.1 %.
- Build: Remotion + HTML/CSS flaps (rotateX half-tiles). The flap clack is a ready-made sound design layer. Risk: it
  shows the *result* of interference (a table) better than the *mechanism* (waves cancelling).

---

## Pick for this episode
**A · Phosphor Scope.** Of the three it's the most analytical and the most dynamic:
- The film's key idea is interference, and only A can show it physically. The waves really add and cancel on
  screen, so the "it's not trying all answers at once" reveal becomes something the viewer watches happen, not a
  claim in a table (C) or a diagram (B).
- Every scene can be a trace that's drawn live, with a readout counting next to it. That gives a visual change every
  few seconds by construction.
- It matches the owner's own reference closely without copying it: a big white mono number readout, red + white
  accents, small chapter labels top-left, and curves drawn live.

Second choice is B, if the owner wants to break out of the dark family. C is the most fun but the least analytical
about the mechanism.
