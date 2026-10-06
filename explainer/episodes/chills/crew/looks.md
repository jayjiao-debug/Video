# Looks (gate 2a): 鸡皮疙瘩 ep13

Previous looks: ep12 was "Phosphor Scope" (green trace on black). Everything before that was navy night with gold light.
None of the three looks below uses either family. All three keep the same engine layer: the subtitle band at y 820–960
(white Noto Serif CJK SC Bold 46 px on a soft dark band, also on the light looks), the corner mark `◆ Juno · VIBE知识大赏`
top-right at 55 %, the top-left kept clear except a 34 px chapter label, and the Juno end card. Warm gold appears only on
the end card and on the subtitle's [key words] (engine `Rich`).

Frames: `style/look<A|B|C>_<hook|key>.png`. The source HTML and the generator are in `style/make_frames.py`, the sheet is
`style/looks_sheet.png` (`style/make_sheet.py`). Every waveform and energy shape is computed from the real `bgm.mp3`
(breath ~79.7 s, drop 81.39 s, bar ruler at 118 BPM). Subtitles are real lines from lines.json (hook: 听歌起过[鸡皮疙瘩]吗？ · key: 第一刀：[删掉]高潮。).
Build note for every look: the master is brick-limited (peaks ≈ full scale throughout), so a raw waveform looks
like a flat slab. The engine has to draw **per-bar RMS in dB** (`bars()` in make_frames.py) so the build, the breath and
the drop look different.

---

## A · 白色剪辑台 Daylight Edit (light, the clearest for the demos)
1. **World:** a music editor (DAW) made beautiful. The bgm is a row of clips on a timeline with a bar ruler. The playhead
   is a pair of scissors, and an automation lane under the track named **鸡皮疙瘩** is the "inside": it climbs through
   the build and jumps on the drop. Every edit is a native, visible DAW gesture: cut (hatched gap 已删除), move the clip
   (delay), drag the breath gap shut, filter (a cutoff curve drawn over the clip), mute, stretch.
2. **Palette / type:** desk #E8E6E1, panel #F5F4F0, clip grey #DCD8CF / header #C9C4B9, ink #141414, muted #8C877D,
   signal orange #FF4F1A (the drop, the scissors, the chills curve). Noto Sans CJK SC Black for labels (≥ 40 px),
   DejaVu Sans Mono Bold for timecodes.
3. **Must NOT look like:** a real screenshot of Ableton/FL (no menus, knobs or tiny track names), a dark "pro audio"
   UI, or a navy night. One or two tracks per frame, never a 12-track mix. Orange means only "the drop / the chills".

- Hook: one huge clip row, BUILD grey → dashed 吸气 gap → orange DROP, with the scissors playhead parked on 01:21.39 and
  "← 起鸡皮疙瘩" at 80 px.
- Key: two tracks stacked, 保留 (orange drop, chills lane jumps) and 删掉 (hatched 已删除 → 静音, the chills lane
  sags to a lower level but never reaches zero, marked 示意). The 吸气 gap is ≥ 120 px with a dark outline and a 42 px label.
- Build: Remotion + SVG (bars from precomputed RMS JSON, clip rects, automation paths). The playhead moves with the audio
  frame by frame, so picture and sound match exactly. Transitions are timeline moves: zoom into a clip, scroll the
  timeline, and the cut gap closing.

## B · 汗毛起立 Goosebump Field (bold, dark crimson)
1. **World:** your own skin in close-up. A field of fine hairs lies flat while the music plays. On the drop they
   **stand up** in a wave spreading out from one spot, each on a small raised bump. This is the real mechanism
   (piloerection) shown as a texture. The bgm runs as a cream bar ribbon across the top with a red playhead, and
   edits happen on the ribbon (bars vanish, stretch, dim) while the field answers below.
2. **Palette / type:** skin dark #24040A → #6A0C1C (centre #8A1426), lying hair #7E2A36, standing hair #FFE9DC with a
   #FF5A3C glow, signal #FF5A3C (playhead, scissors, 起立). Noto Sans CJK SC Black for words, DejaVu Sans Mono for the
   timecode.
3. **Must NOT look like:** a dermatology or medical image, a rash, gore, or trypophobia (no holes, no dark pits, no
   clustered dots; the bumps are soft highlights). No limbs, hands or body outlines, only the surface. Not a navy night.

- Hook: the ribbon with the playhead on 01:21.39 and a ring of standing hairs spreading across the field: 汗毛，起立.
- Key: 保留高潮 (ribbon intact, all hairs standing) over 删掉高潮 (drop cut from the ribbon, 已删除; only about half the
  hairs stand: 汗毛 · 少一片, 示意). Fewer chills, not none.
- Build: Remotion + Canvas 2D (about 900 hairs per frame, one quadratic stroke and one ellipse each; the raise value per
  hair = f(distance to the wave front, chills envelope)). Risk: at phone size (about 1/4 screen) the hairs are ~1 px,
  so the field reads as a **texture change** (dark/combed → bright/standing), not as single hairs. The scenes should
  push in close (hairs 2–3× larger than in the frames) for the big moments.

## C · 过山车 Riso Coaster (light, warm, the most immediate)
1. **World:** the song's tension drawn as a roller-coaster track, printed like a risograph poster. The build is the
   climb, the quiet breath is the crest where the cart hangs (屏住呼吸), and the drop is the plunge. Every edit
   reshapes the track live: delete the drop and the track runs **flat** at the top (平着开：没冲下去). A drop without a
   build becomes a small bump from flat ground. A delayed drop makes a longer crest. Removing the breath takes away the
   crest. The track's height is 紧张/期待 (tension), not loudness; the yellow halftone is texture, not a loudness claim.
2. **Palette / type:** paper #F2ECDF, fluorescent pink #FF48B0 (track, cart, 高潮), riso blue #0078BF (struts, riders,
   type), yellow #FFE800 halftone fill, ink #1D2B5E for the corner mark. The inks overprint (multiply), with grain and a
   slight rough edge. Noto Sans CJK SC Black (headlines 70–110 px), DejaVu Sans Mono for times.
3. **Must NOT look like:** a theme-park ad or a 3D ride simulation, a kids' cartoon with faces (riders are three round
   blue heads, no faces, no hands), a clean vector infographic with no ink texture, or a navy night.

- Hook: the cart balanced on the crest under a pink halftone sun, tremble marks above it. 屏住 / 呼吸 at 110 px, 01:21 ↓ 冲！ at 60 px.
- Key: 保留高潮 · 冲下去 (cart plunging) over 删掉高潮 · 平着开：没冲下去 (scissors through the track, the plunge left as a
  dashed ghost, 已删除, the cart rolling flat). The labels describe the music, not zero chills.
- Build: Remotion + SVG (the track path from a tension curve keyed to the song's sections, the cart placed by
  arc length synced to the audio time, SVG halftone patterns, and feTurbulence grain rendered once to a texture).
  Transitions: the camera rides the cart (pan along the track); each new experiment redraws the track ahead of it.
  Risk: the coaster shows the "inside" best. The exact edit (filter, volume) needs a small ribbon/knob strip along the
  ground line.

---

## Which one stops the scroll
**C** is the most likely to stop a thumb. It is a bright, warm poster in a feed of dark explainers, and the cart on the
crest is a feeling everyone has had (the half-second before the plunge), which reads in under a second on a small
screen. It also maps one to one onto build → breath → drop. **A** is the strongest for the film's core promise (you
SEE exactly what was cut, moved or muted, frame-accurate to the sound) and the safest to build. **B** is the boldest and
the most physical, but its hairs are fine texture and lose detail at phone size.
