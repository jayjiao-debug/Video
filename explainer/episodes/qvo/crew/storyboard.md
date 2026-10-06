# Storyboard: 量子计算机不是同时算 (ep12, voice-over) · Look A · 示波器 Phosphor Scope

Gate 2b, round 1. Built on script.md v2 + vo.json (37 VO lines), looks.md (Look A), and notes_gate2a_r1.md. All 9
gate-2a fixes are applied. The "Fix map" at the end says where each one lands.
Times are vo.json estimates. Real TTS will move lines by up to ~1 s, so **every motion beat is tied to a line**
("on r6", "r6 + 0.4 s", "end of r7"). Only the music anchors are absolute: 0.0 first beat, 14.24 HARDEST DROP,
16.8, 30.5, 46.8, **63.1 second drop (= r1 "不是。")**, and the end card for the last ~5 s.

**Engine:** Remotion, **SVG only** (inline `<svg>` + absolutely positioned HTML text is fine). No CSS 3D, no
three.js, no canvas needed. 1920×1080, **30 fps**. Every trace is a `<path d>` computed per frame from a function
(sample every 3 px in x; 2 px for hero traces). Randomness only through Remotion `random(seed)`, so renders are
deterministic.

---

## Look

**One sentence:** each idea is a signal on a lab oscilloscope. A qubit is a wave, measuring is the trigger that
freezes it, and interference is the MATH channel where the wrong answers go flat and the right one grows.

### Palette (exact hex, nothing else on screen)
| Token | Hex | Use |
|---|---|---|
| `screen` | `#020604` | page background (body + every scene) |
| `screenCore` | `#07140D` | centre of the radial screen glow: `radial-gradient(ellipse at 50% 45%, #07140D 0%, #030A06 60%, #010302 100%)` |
| `grat` | `#1C3D2C` | graticule dotted grid + centre axes + ticks |
| `gratRows` | `#173323` | graticule in the 4/8-row layouts (one step darker, so rows stay readable) |
| `frame` | `#2A5A40` | the graticule border rectangle |
| `trace` | `#7DFFB3` | the phosphor trace, green labels, histogram bars |
| `traceDim` | `#3E9D6C` | component traces, the dashed anti-phase ghost, dim readouts, source tags |
| `texture` | `#5FD99A` | status strip, % column (≤ 60 % opacity: instrument texture, not text to read) |
| `hot` | `#E9FFF2` | the 1.2 px hot core inside hero green traces, and the beam head dot |
| `readout` | `#F4FFF8` | white mono readouts, big Chinese words |
| `signal` | `#FF3B30` | **red, only for:** Willow, the right answer \|101⟩, cursors/trigger, and the ✗/✓ the cursor stamps |
| `signalLabel` | `#FF6B5F` | red text labels (CH2 Willow label, ▲ 互相加强) |
| `signalHot` | `#FFE3E0` | 1.2 px hot core inside red traces |
| `plate` | `#04100A` @ 92 % | backing plate behind labels that sit over traces |
| `subBand` | `rgba(2,6,4,.85)` | subtitle band |
| `subText` | `#FFFFFF` | subtitles |
| gold (end card ONLY) | `#F1C56D`, deep `#C8913A`, metal stops `#FFF3CF → #F3CD7A → #C99140 → #8A5A22` | J monogram, title, motif, follow pill on the end card. **No gold anywhere before 114.8 s.** |
| card ink | `#F3EDE2` | end-card question text |

**Red discipline:** red appears only at h3–h4 (Willow), h2/r1/r17/e1 (cursor stamps ✗), b3/r8/r1 (trigger), s3/s5/r15
(Willow 105), r7–r8, r17–r18, e2 (the right answer). Every red appearance should mean "Willow / the answer / the
instrument acting". No other red.

### Type (all available on the render machines)
| Role | Font | Weight / size | Colour |
|---|---|---|---|
| Hero numeric readouts | DejaVu Sans Mono | Bold 700, 74–220 px (per scene) | `readout` or `signal` |
| Channel labels, kets \|000⟩, units, tags | DejaVu Sans Mono, fallback Noto Sans CJK SC for Chinese | Bold 700, **≥ 44 px** | `trace` / `signalLabel` / `readout` |
| Big Chinese words (误导, 叠加, 先存后解, title) | Noto Sans CJK SC | Black 900, 72–140 px | `readout` |
| Chinese labels/callouts | Noto Sans CJK SC | Bold 700, **≥ 44 px** | `readout` / `trace` |
| Subtitles | Noto Serif CJK SC | Bold 700, 46 px, letter-spacing 2 px | `#FFFFFF` |
| Chapter label (top-left) | DejaVu Sans Mono + Noto Sans CJK SC | 500, **34 px**, letter-spacing 2 px, 85 % | `trace` |
| Status strip, % column (texture) | DejaVu Sans Mono | 500, 24–26 px, **≤ 60 % opacity** | `texture` |
| Corner mark | Noto Sans CJK SC | 500, 24 px, 55 % | `readout` |

- **Superscripts** (10²⁵, 2³⁰⁰, 10⁹⁰, 10⁸⁰, 2ⁿ): never use Unicode superscript glyphs (Noto CJK has no ⁵/⁹/⁰).
  Use `<tspan font-size="0.62em" baseline-shift="super">` (HTML: `<sup>` with the same size). The exponent itself must
  still be **≥ 44 px**, so any line with an exponent is ≥ 71 px.
- Every readout is laid out at its **final width from frame 1**. Mono slots that aren't lit yet are drawn as dim
  ghost digits (`grat`, 100 %), so counting never pushes text sideways (fix 5).
- **Minimum size for anything the viewer must read: 44 px.** That covers ket labels, CH labels that carry meaning,
  示意, Google 估计, source tags, ×100+, 少数题/大多数题 and cursor labels. Only the status strip and % column go
  below 44, and they stay ≤ 60 % opacity.

### Strokes
| Element | Core | Glow underlay | Notes |
|---|---|---|---|
| Hero trace (CH1 at full size, \|101⟩, coin) | 3 px, 100 % | 12 px, 22 % | + hot core 1.2 px (`hot` / `signalHot`) at 80 % |
| Normal trace (rows, channels) | 2.6 px, 90 % | 10 px, 18 % | |
| Component / thin trace (\|0⟩, \|1⟩ parts) | 2 px, 75 % `traceDim` | none | |
| Anti-phase ghost (r4, r6) | **2.5 px `traceDim`, dash `10 8`, 100 %** while it explains, then fades to 0 over 12 frames | none | fix 6 |
| Cursor (vertical/horizontal) | 2 px `signal`, dash `10 8`, 85 % | 8 px, 20 % | 24 px solid triangle marker at the graticule edge |
| Trigger slam (b3, r1, r8) | 4 px solid `signal` | 16 px, 30 % | lands in 2 frames |
| Graticule minor | 1.5 px `grat`, dash `2 7` | — | 10 × 8 divisions over the graticule box |
| Graticule axes + ticks | 2 px `grat`, ticks ±7 px every 1/5 div | — | |
| Graticule frame | 2.5 px `frame` | — | |
| Padlock, molecule, coin rim | 3.5 px `trace` | 14 px, 22 % | |
| Stamp boxes (误导, 测速题, 好在) | 3 px border, 6 px radius | — | text colour = border colour |

### Glow method (SVG Gaussian-blur duplicate)
Each glowing element is drawn twice: (1) an **underlay** with the same `d`, wider stroke (table above), lower
opacity, inside a group with `filter="url(#phos)"`; (2) the **core** on top, unfiltered.
```
<filter id="phos" filterUnits="userSpaceOnUse" x="-100" y="-100" width="2120" height="1280">
  <feGaussianBlur stdDeviation="6"/>
</filter>
<filter id="phosHero" … same region …><feGaussianBlur stdDeviation="9"/></filter>   // readouts' halo, red hero
```
- `userSpaceOnUse` with an oversized region is required, so peaks never clip (gate 2a buildability note).
- Put **one filter on a `<g>` holding all underlays of a layer**, never a filter per path (render cost: the 8-row and
  wall scenes would otherwise run ~200 filters).
- Readout halos: white readouts get `text-shadow: 0 0 18px rgba(180,255,215,.35)`, red readouts
  `0 0 30px rgba(255,59,48,.45)` (HTML), or a blurred duplicate `<text>` in SVG.
- **Persistence (phosphor decay):** hero traces also draw their path at f−1, f−2, f−3 with opacity .35/.18/.08 (no
  blur). When something "freezes" (b3, r1, r8), the last live frame stays at 100 % and the ghosts fade over 10
  frames. This is what makes the screen feel like phosphor and not like vector UI.
- **Beam head:** while a trace draws on, its leading point is a `hot` dot r 5 with an r 18 glow (`phos`).

### Texture overlay (subtle, not "scanlines everywhere")
- **Grain:** one full-frame `<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={f % 6}>`
  rect, desaturated (`feColorMatrix` saturate 0), `mix-blend-mode: overlay`, **opacity 0.06**. Same on every scene.
- **Raster lines:** a `<pattern>` of 1 px lines every 4 px, `#000` at **4 % opacity**, **only inside the graticule
  box (y 100–800)**. On a phone they are invisible as lines and read only as a slight CRT density. Never over the
  subtitle band.
- **Vignette:** radial `rgba(0,0,0,0)` 60 % → `rgba(0,0,0,.45)` 100 %, full frame, under the subtitle band.
- **No:** falling code, glitch RGB split, HUD rings, bezel or knobs in frame, flicker of the whole screen.

### Frame grid (every scene)
```
y   0 ┌─────────────────────────────────────────────────────────────┐
y  44 │ 05 · 干涉 (34 px)      [status strip 24 px ≤60 %]   ◆ Juno · VIBE知识大赏 │
y 100 │ ┌───────── graticule box x 60–1860, y 100–800 ─────────────┐ │
      │ │ readouts inside x 96–1824 · traces may run off the right  │ │
y 800 │ └──────────────── CLIP everything at y 800 ─────────────────┘ │
y 820 │        subtitle band (only white text on the dark band)       │
y 960 │                                                             │
y1080 └─────────────────────────────────────────────────────────────┘
```
- **Clip (fix 4):** every scene layer (graticule, traces, cursors, glow underlays, readouts) sits inside
  `<clipPath id="scr"><rect x="0" y="0" width="1920" height="800"/></clipPath>`. Below y 800 there is only the screen
  background, the vignette, grain and the subtitle band. **Nothing green or red in y 820–960.**
- **Subtitle band:** container y 820–960, centred. Band = rect from (text width + 2×90 px) wide, min 900, max 1400, inset
  18 px top/bottom, radius 60, `rgba(2,6,4,.85)`, `filter: blur(14px)`. Text: Noto Serif CJK SC Bold 46 px, `#FFFFFF`,
  letter-spacing 2 px, `text-shadow 0 2px 10px rgba(0,0,0,.65)`. Bracketed keywords in `sub` (`[叠加]`, `[振幅]`,
  `[干涉]`): drop the brackets and render the word white with a 3 px white underline at 60 %, offset 8 px. **No
  colour.** The subtitle appears at line start (2-frame fade) and holds to line end, or to the next line if the gap
  is < 0.3 s. Digits in subs (10²⁵) use the superscript tspan rule.
- **Chapter label:** x 64, cap-top y 44, 34 px. It changes with a 6-frame mono "scramble" (random glyphs → final).
- **Corner mark:** `◆ Juno · VIBE知识大赏`, top 40, right 56. It is hidden during the title card (14.24–16.8) and
  under the end card.
- **Status strip (texture):** centred at x 560–1400, y 50, 24 px, `texture` at 55 %, e.g.
  `CH1 200 mV/div · TIME 1 ms/div · TRIG ▲ AUTO`. It changes per layout. Nothing on it needs reading.

### Motion grammar
- **Easing:** arrivals `Easing.bezier(.2,.8,.2,1)` over 8–14 frames. Morphs `Easing.inOut(Easing.cubic)` over
  12–20 frames. Hits (trigger slam, stamp) are 2–4 frames in, with a 6-frame settle (scale 1.06 → 1.0).
- **Readout lock-on:** a new readout flickers 2 frames at 40 %, 1 frame at 100 %, 1 at 70 %, then holds 100 %.
  Counters ease out (fast start, slow last digits).
- **Continuous motion runs on its own physical clock** (scrolling waves, the spinning coin, the timebase). It is never
  pulsed to the beat. Only **structural** moments hit the music: frame 0 burst, < 5 分钟, 远超宇宙年龄, 14.24, 16.8,
  30.5 (quiet), b3 trigger (silence), 46.8, the u2 doublings, **63.1**, r8 trigger, the end-card cut.
- **Camera:** a `<g transform>` translate/scale on the scope layer only (the chapter label, corner mark and subtitles
  never move). One move per line at most. Pushes ≤ 1.06, except the deliberate zoom-throughs (T4, T8).
- **Layout change every ~5 s** (fix 7). The longest stretch on one layout is r15–r16 (≈ 6.6 s), and its cursor moves
  and stamp keep it alive. See the layout column.

### Must NOT look like
- A hacker/Matrix terminal (no falling code, no green monospace walls of text, no glitch).
- A sci-fi HUD (no rings, hexagons, targeting reticles, holograms).
- A skeuomorphic scope photo (no bezel, no knobs, no brand logo, no CRT curvature).
- The navy-and-gold night of ep1–ep11. Gold appears only on the end card.
- A dashboard: one trace group and one hero readout at a time. Never two hero numbers fighting.

---

## Scenes

L-codes are instrument layouts (specs under "Layout specs"). Chapter labels: 00 · 传说 → 00 · 纪录 → 01 · 比特 →
02 · 量子比特 → 03 · 组合 → 04 · 测量 → 05 · 干涉 → 06 · 用处 → 07 · 加密 → 08 · 结论.

| Scene | Time / lines | Shot (layout, camera) | Key visual | Text placement | Motion beats (tied to lines) | Transition OUT (motivated by…) | Sound cues |
|---|---|---|---|---|---|---|---|
| **1 Fan** | 0.0–≈5.2 · h1, h2 | **L1** single CH1, full graticule. No camera move until h2. | 32 green traces fanning out from one: "every answer at once" | Chapter **00 · 传说**. `同时算所有答案？` Noto Sans Black 110 px `readout`, centred, top at y 150, on a `plate`. h2: stamp `误导 ✗` 140 px, red border box, centred at y 480, rotated −4° | **Frame 0** (fix 8): the CH1 sine is already running at y 460, the h1 subtitle is on, and so is the chapter label (no empty graticule). **First beat (≤ 1 s):** the trace bursts into 32 traces (each its own freq 1.2–3.4 cycles and phase, amplitude ±40–300) fanning out over 12 frames from the x 96 origin. `同时算所有答案？` locks on at h1 + 0.6 s. **On h2:** the fan freezes (persistence holds), a red vertical cursor enters at x 96 and sweeps to x 1824 over the line (ease-in-out). As it passes x 960 the stamp `误导 ✗` slams (3 frames, settle 6). | **T1 channel split.** End of h2: the cursor reaches the right edge and acts as the trigger. The 32 frozen traces fold (16 frames) into 2: one slides up to the CH1 band and one down to the CH2 band, and a horizontal divider draws at y 450. The stamp fades with the fan. | burst whoosh on beat 1; cursor sweep tick; stamp thud |
| **2 Record** | ≈5.2–14.24 · h3, h4, VO-free gap | **L2** two-channel compare (CH1 top, CH2 bottom). Slow push 1.00 → 1.03 across h4. Timebase zoom-out in the gap. | Huge red `< 5 分钟` vs a white 26-digit `10…000 年` that keeps counting | Chapter **00 · 纪录**. CH2 label `CH2 ▸ Google Willow · 2024.12` 44 px `signalLabel` at (150, 490). `< 5 分钟` 170 px mono + 130 px Black `signal` at x 150, baseline 680. CH1 label `CH1 ▸ 最快的超级计算机之一 · Google 估计` 44 px `trace` at (150, 160). Readout `10,000,000,000,000,000,000,000,000 年` **74 px** mono Bold, left-anchored x 150, baseline 270, ends ≈ x 1750 (fix 5). TIME/DIV readout 44 px at x 1360–1790, y 160 (gap only). **No temperature or qubit count here** (fix 3). | **On h3:** CH2 (red) fires one short sharp burst (x 900–1300, centre y 620, ±120) that ends almost at once and goes flat. `< 5 分钟` locks on with the burst peak, on a beat. CH1 sits dim and flat. **On h4:** CH1 lights and its trace scrolls from the left and runs off the right edge without end. The readout's "1" lights, and the 25 ghost zeros light left→right on an ease-out clock that **finishes ≈ 0.6 s before 14.24**, so it is still counting through the VO-free gap. **Gap (end of h4 → 14.24), first strong beat:** `远超宇宙年龄` 96 px Black `readout` lands at (150, baseline 660), replacing the CH2 band. `< 5 分钟` shrinks to a 44 px tag pinned to a 2 px red spike at x 150 (the burst squashed by the zoom). **Next 3 beats:** TIME/DIV steps `1 min/div → 1 年/div → 10⁸ 年/div → 10²⁴ 年/div`, and at each step CH1's wave compresses horizontally (frequency ×). At the 10⁸ step a tiny tick appears at x ≈ 152 on the time axis, with a leader to `宇宙年龄 138 亿年` 44 px `traceDim` at (190, 560). Energy rises, and nothing is static. | **T2 timebase collapse → title.** Over the last 6 frames before 14.24 the compressed CH1 wave flattens into one bright horizontal line at y 560 (amplitude → 0, brightness ↑). Everything else decays like persistence. **On 14.24** a red trigger marker slams onto the line: it becomes the title's baseline. | rising riser into the drop; tick per TIME/DIV step |
| **3 Title** | 14.24–16.8 · no VO | **L3** empty graticule, one glowing baseline. Settle 1.06 → 1.0 on the drop. Corner mark hidden. | The beam writes 《量子计算机不是同时算》 on the trace | Title Noto Sans CJK SC Black **132 px** `readout`, centred, baseline 520, sitting on the glowing line at y 560. Kicker `QUANTUM COMPUTING · GOOGLE WILLOW · 2024` 26 px mono `texture` 55 % at y 640 (texture). Red trigger triangle at (960, 100) on the top edge. | Brand rule: built from the episode's own object, stamped on accents, no white flash, no light sweep. **On 14.24:** the beam head runs along the baseline and writes the title in 3 accents: `《量子计算机` (on the drop), `不是` (next half-beat; it lands at 112 % and settles), `同时算》` (next half-beat). Each group appears as a phosphor bloom (2 frames over-bright `hot`, then `readout`). The graticule pulses once (`grat` → `frame` → `grat`, 8 frames). | **T3 the baseline steps into bits.** At 16.8 − 0.4 s the baseline under the title starts stepping up/down into a square wave scrolling left. The title decays like persistence (opacity → 0 over 12 frames, slight blur). On 16.8 the square wave fills CH1. | hard drop hit 14.24 (music); soft "beam write" sizzle per accent |
| **4 Bits** | ≈16.8–20.0 · s1 | **L4** logic analyzer: one wide digital CH1 + 8 thin lanes D0–D7. | A dense bit stream scrolling fast | Chapter **01 · 比特**. `8 GB 运行内存（以此计）` 44 px `trace` at (150, 170). `≈ 64,000,000,000 bit` **96 px** mono `readout`, baseline 290, x 150–1310, digits light in place. Lane labels `D0…D7` 24 px texture. | **On s1:** CH1 square wave scrolls right→left at ~900 px/s (its own clock). The 8 lanes fill below (y 420–780), each a different random bit pattern, staggered 2 frames. The readout counts up in place (ease-out), finishing at s1 + 2.0 s. | **T4 zoom into one step.** End of s1: camera pushes ×14 into one rising edge of CH1 (centre ≈ x 960, y 560), 14 frames, ease-in-out. The lanes and readout fly off-frame with the push. | data-chatter tick bed; whoosh on the push |
| **5 Flat coins** | ≈20.0–22.0 · s2 | **L5** the two levels of the step, enlarged: two flat coins. | Two phosphor coins **lying flat** (thin ellipses with a rim), labelled 0 and 1 | `0` and `1` 140 px mono `readout` above each coin. `非 0 即 1` 72 px Black `readout` centred at baseline 760. | **On s2:** the low and high levels of the edge pull together into two flat-coin glyphs at (640, 600) and (1280, 360): a thin ellipse rx 150, ry 26, plus a second ellipse 10 px lower (the rim), joined at the ends, 3.5 px `trace`. A beam dot rests on each (XY: a static signal is a dot). **Nothing moves** except phosphor shimmer (±3 % opacity). `非 0 即 1` locks on at s2 + 0.5 s. | **T5 coins shrink into the count.** End of s2: both coins shrink to dots (10 frames) and slide left into a dim `64,000,000,000` readout at the left. The right half lights: a screen split into L6. | soft "clink" when the coins settle |
| **6 105** | ≈22.0–25.3 · s3 | **L6** split screen: left dim (classical), right Willow. | A 15 × 7 grid of **105 red dots** drawn on by raster sweeps, beside a huge red `105` | Left: `64,000,000,000 bit` 60 px `traceDim` at (150, 300). Right: `Google Willow` 44 px `signalLabel` at (1000, 170). Dot grid x 1000–1700, y 220–480. `105` **220 px** mono `signal` at x 1000, baseline 730, `qubits` 56 px `signalLabel` after it. | **On s3:** a red horizontal sweep line (cursor) passes down the grid 3 times, writing rows of dots (35 per pass). `105` locks on at s3 + 1.2 s, on a beat. | **T6 the chip goes into the cold.** End of s3: the 105 dots collapse (12 frames) into one bright dot at the top-left of a new log axis. The dot becomes the beam of the temperature trace and starts falling. | three sweep ticks; low thud on 105 |
| **7 Cold** | ≈25.3–28.1 · s4 | **L7** temperature channel with a vertical **log axis** (K). | A trace falling down a log axis past 外太空 2.7 K and settling at ≈ 10 mK | Axis at x 220 (y 140–780), labels 44 px: `外太空 2.7 K` at y ≈ 330 (dashed `traceDim` line across). `≈ 10 mK` at y ≈ 690 (96 px mono `readout` at x 1100, baseline 700). `超导量子芯片` 56 px Bold `trace` at (1100, 200). ΔY readout `×100+` **64 px** mono `signal` beside the cursor pair at x 760. **No Willow figure** (fix 3). | **On s4:** the beam falls along a cooling curve (x 260→1700, exponential approach) through 2.7 K at s4 + 0.6 s and settles at 10 mK at s4 + 1.6 s. Then two red horizontal ΔY cursors draw at 2.7 K and 10 mK (6 frames each), and `×100+` locks on between them. | **T7 settle → face-off.** End of s4: the flat 10 mK trace rises (12 frames) to become the baseline at y 600 under the next layout. The cursors close into a single red blinking text cursor, which jumps to the `105`. | cold "hiss" falling in pitch; cursor clicks |
| **8 Face-off** | ≈28.1–30.5 · s5 | **L8** two readouts on one baseline. Slow push 1.0 → 1.03. | `64,000,000,000` (dim) vs a huge red `105` with a blinking cursor | Left `64,000,000,000` 72 px `traceDim` at x 150, baseline 560, `bit` 44 px. `vs` 64 px `readout` 60 % at x 960. Right `105` **220 px** `signal` at x 1130, baseline 600, `qubit` 56 px. Cursor block ▌ 220 px tall `signal` blinking at 2 Hz after `105`. | **On s5:** the left readout settles first, then `105` slides in from the right (10 frames). The cursor blinks through the line. Music falls away. | **T8 zoom into one qubit.** At 30.5 (break): camera pushes into the blinking cursor/`105` (×8, 16 frames). The red cursor turns into a single green beam dot at screen centre, and the dot starts to spin: the XY coin. | music falls away; no SFX |
| **9 Spinning coin** | 30.5–≈34.8 · b1 | **L9** XY mode (left) + YT channel (right). Quiet. No camera move. | A phosphor coin in XY: an ellipse whose **width oscillates** as it spins, with a sine on the right drawn by its width | Chapter **02 · 量子比特**. `QUBIT` 56 px mono `trace` at (150, 170). **`示意`** tag 44 px `readout` in a 3 px `readout` box at (600, 170), from the coin's first frame. Status strip `MODE XY ⟶ YT`. | **On b1 (30.5):** the coin at (560, 450): an ellipse ry 230, rx = 230·\|cos θ\|, θ at 0.55 rev/s (its own clock). It has a second ellipse offset 12 px in x (the rim) that is visible when edge-on, a `1` 160 px mono scaled by the same x-factor on the face, and `0` on the back (when cos < 0). Persistence ghosts give a stroboscopic look. On the right (x 1000–1780, centre y 450) the YT channel draws **the coin's width over time** = a slow sine, drawn by a beam head synced to θ. | **T9 the wave splits.** On b2 the right-hand sine splits (14 frames) into two thin component traces that slide to their own rows above and below the sum. The coin shrinks to the left third (scale .6). | quiet "shimmer" loop |
| **10 Superposition** | ≈34.8–38.6 · b2 | **L10** coin (small, left) + 3 rows: \|0⟩, \|1⟩, sum. | Two thin waves adding back into the one wave | Row labels `|0⟩` and `|1⟩` 52 px mono Bold `traceDim` at x 600. `= 叠加` row label 52 px. `|0⟩ + |1⟩` 72 px mono `readout` at (1000, 180). `叠加 SUPERPOSITION` 72 px Black + 44 px mono at (1000, 760). | **On b2:** the component traces (2 px `traceDim`) scroll in sync. A vertical dotted guide every half-period shows the two heights adding to the sum's height. The coin keeps spinning. `叠加` locks on with the subtitle's [叠加] keyword. | **T10 measurement.** On b3, the trigger. | — |
| **11 Measure** | ≈38.6–42.1 · b3 | **L10 → L11**: the trigger freezes everything. | The red trigger drops, and the coin **falls flat** to 1 | `TRIG · 测量` 44 px `signalLabel` beside the trigger triangle at the top edge. `→ 1` **160 px** mono `readout` at (1100, baseline 520). | **On b3 + 0.3 s:** a red trigger triangle slams to the top edge above the coin, and a vertical 4 px red line drops through it (2 frames). The coin stops mid-spin, then **falls flat** in 10 frames: ry 230 → 26 and rx → 150, becoming the flat-coin glyph from s2, showing `1`. All three waves freeze (persistence holds) and collapse onto one flat line at the `1` level. `→ 1` locks on. The music is silent: no shake. | **T11 re-run.** End of b3: the flat coin stands up again (ry 26 → 230, 12 frames) and spins. The two component waves come back, now with dimension arrows. The histogram panel slides in from the right. | single sharp "click" in the silence |
| **12 Amplitude** | ≈42.1–46.8 · b4 | **L11** left: 2 component waves + dimension arrows. Right: a small coin + a 2-bar histogram. | **振幅 = 波的高度**: arrows measure each wave's height, and a histogram builds to the same proportions | `振幅 = 波的高度` 64 px Bold `readout` at (150, 170). Arrows labelled `|0⟩` / `|1⟩` 52 px. `P = |振幅|²` 64 px mono `readout` at (1100, 170). Histogram x 1200–1700, y 300–760, bar labels `0` / `1` 56 px mono, counts 44 px. | **On b4:** a vertical double-headed arrow (2 px `readout`) draws on each wave from axis to crest: \|0⟩ amplitude 0.6 (smaller), \|1⟩ 0.8. **On "振幅"**, the label locks on. On the right, a small coin (ry 110) spins and drops every 0.45 s, alternating 0/1 at random with p = .36/.64 (seeded). Each drop adds a unit to the bar (bars filled `trace` 70 %, 2 px outline). By line end the bars stand at ≈ 36 : 64. | **T12 a second coin.** On 46.8 (build start): a second spinning coin slides in beside the first (14 frames). Their two YT traces cross and **split into 4 channels** (the screen splits in 4). | soft tick per coin drop; build swell at 46.8 |
| **13 Combinations** | 46.8–≈51.2 · u1 | **L12** coin strip on top + 4 channels. | 2 coins → 4 rows \|00⟩ \|01⟩ \|10⟩ \|11⟩, all running at once | Chapter **03 · 组合**. Top strip y 120–250: 2 small XY coins (ry 60) at x 200, 330. `2 枚 → 4 种组合` 64 px mono+Bold `readout` at (1100, 200). Row labels 52 px mono Bold `trace` at x 150. Rows at y 330/450/570/690. | **On u1:** the 4 rows draw on top→bottom, staggered 4 frames, each wave with its own phase/frequency (seeded). The readout locks on at u1 + 1.0 s. | **T13 doubling.** On u2's beats, each row splits in two. | — |
| **14 Doubling** | ≈51.2–55.0 · u2 | **L13** same grid, rows halving. | Channels doubling faster than the eye can count | `2ⁿ` 140 px mono `readout` at (1300, 220). Count readout `n = 3 → 8 种` … `n = 7 → 128 种` 64 px at (1300, 320), updating per doubling. Coin strip gains one small coin per doubling. Ket labels fade below 16 rows (too small to read, so they are removed rather than shrunk). | **On u2, on 4 consecutive beats:** 4 → 8 → 16 → 32 → 64 → 128 rows (the last two on half-beats). Each split takes 6 frames (a row "unzips" into two). Rows switch to `gratRows` spacing. A small coin is added to the top strip on each split. | **T14 density → wall.** On u3, rows pass 1 px apart: 256 → 512 traces blend into a solid band of phosphor. | riser; a tick per doubling (structural, allowed) |
| **15 The wall** | ≈55.0–59.4 · u3 | **L14** a wall of glow + 2 stacked readout boxes. | A solid wall of phosphor, and a readout **overflowing its box** | Readout box (3 px `frame`) x 150–1250, y 160–330. Inside it `2³⁰⁰ ≈ 2 × 10⁹⁰ 种组合` **110 px** (exponents 68 px) runs to ≈ x 1410, past the box's right edge but inside x 1824 (fix 5). Below, box x 150–1250, y 360–480: `可观测宇宙的原子 ≈ 10⁸⁰（估算）` **72 px** (exponent 45 px) `traceDim`. | **On u3:** the wall is 120 drawn traces at 1.2 px, 35 % opacity, with random phases, over a vertical gradient band (`trace` 0 → 25 % → 0) blurred with `phos`, in y 520–790. It brightens slowly (its own clock). The top readout types left→right and **pushes through its box border at u3 + 1.6 s** (the border breaks into dashes where the text exits). The atoms line locks on 0.4 s later, dim. | **T15 the question returns.** On u4 the readouts slide up and out (10 frames). A `plate` fades in behind the hook question and the wall fills the whole graticule (y 100–790). | building whoosh |
| **16 The myth again** | ≈59.4–63.1 · u4 (must end ≤ 62.5) | **L15** full wall + centred question. Push 1.00 → 1.05 over u4 (music at its highest). | `同时算所有答案？` over a blazing wall, red cursor blinking | `同时算所有答案？` **120 px** Black `readout` centred, baseline 470, on a `plate` (x 330–1590, y 360–520). Red text-cursor block ▌ after `？`, blinking at 2 Hz. | **On u4:** the wall rises to full brightness. The question locks on at u4 start. From **62.5 to 63.1**, hold at peak: the wall's amplitude jitters ±2 px and the cursor blinks fast (4 Hz). This is the coiled spring before the drop. | **T16 (SECOND DROP, the hard hit) → see scene 17.** | peak of the build |
| **17 不是。** | **63.1**–≈66.1 · r1, r2 | **L16** empty graticule + one spike. Kick 1.06 → 1.0 (6 frames) on 63.1. | The whole wall **collapses into a single spike** under a red trigger | Chapter **04 · 测量**. Red ✗ **240 px** `signal` stamped over the question (now struck with a 6 px red line), centred. r2: `MEASURE → |1011…⟩` **96 px** mono `readout` at x 150, baseline 300. `1 个 · 随机` 64 px Bold `readout` at (150, 400). | **On 63.1 exactly:** (frame 0) the red trigger line slams vertically at x 960 (2 frames, 4 px + glow). (Frames 1–4) every trace in the wall collapses with ease-in toward the centre line, leaving **one spike** at x 960 (height 360). The question plate is struck and the ✗ stamps (3 frames). No white flash; the hit is the collapse plus the kick. The graticule pulses. **On r2:** the ✗ and question fade (8 frames). The spike's tip draws a leader to the readout, which types `MEASURE → |1011…⟩` (mono, 1 char/frame). `1 个 · 随机` locks on at r2 + 0.8 s. The rest is empty graticule. | **T17 channel split.** End of r2: the spike splits into two waves that slide to the CH1 and CH2 rows, and a **MATH** row opens below them (14 frames). | **impact on 63.1** (music + a low "thunk"); typing ticks |
| **18 Interference** | ≈66.1–72.9 · r3, r4, r5 | **L17** three rows CH1 / CH2 / MATH (= CH1 + CH2). Relabel at r5. | The MATH channel drawing live and **coming out flat** | Chapter **05 · 干涉**. `干涉 INTERFERENCE` 96 px Black + 44 px mono at (150, 190) on r3. Row labels 52 px mono Bold at x 150: `CH1`, `CH2`, `MATH = CH1 + CH2`. Rows at y 330 / 500 / 680. r4: `波峰 + 波谷 = 0` **64 px** Bold `readout` on a `plate` at (1150, 590), with a leader to the flat MATH line. r5 labels: `CH1 噪声`, `CH2 耳机放出的反相波`, `MATH ≈ 安静` (52 px). Headphones icon (2 cups + band, 3.5 px `trace`, 180 px) at (1650, 680). | **On r3:** the 3 rows draw on, top→bottom. **On r4:** CH1 sine. CH2 is the same sine inverted, and its **dashed anti-phase ghost** (2.5 px `traceDim` dash 10 8, 100 %) is also overlaid on the CH1 row (fix 6). A ▲ marker at a CH1 crest and a ▼ at the matching CH2 trough join with a dotted vertical guide to MATH. MATH draws live left→right with a beam head and stays flat. The label locks on at r4 + 0.8 s. **On r5:** the labels re-scramble (6 frames) into the new names. CH1 becomes a ragged hum (sum of 3 sines + seeded noise), CH2 its mirror, and MATH an almost-flat line (±3 px). The headphones icon draws on (stroke-dashoffset, 12 frames). | **T18 3 → 8.** On r6, MATH's flat line and the two rows **split into the 8 answer rows** (rows unzip, 16 frames). The headphones icon fades. | ghost "whoosh-in"; a soft hum that cancels to silence on r5 |
| **19 KEY: wrong answers cancel** | ≈72.9–79.4 · r6, r7, r8 | **L18** 8 rows \|000⟩…\|111⟩ + right readout panel. No camera move until r8. | Seven traces meet their dashed mirrors and **go flat**. \|101⟩ turns red and grows to **94.1 %**. | Ket labels **48 px** mono Bold at x 270 (right-aligned), rows y 190 + 80·i (i = 0…7; \|101⟩ at y 590). Traces x 300–1380. % column 26 px `texture` 55 % at x 1420 (texture). r6: `错的 → 0` **64 px** Bold `readout` on a `plate` at the top-right of the trace area (x 980–1360, y 100–170). Row 0 then starts at y 190, so rows sit at y 190 + 80·i. **Right panel** (fix 2) x 1420–1824, centred on the \|101⟩ row (y 590): `94.1 %` **100 px** mono `readout` (red glow), with `示意` 44 px boxed **directly under it from its first frame**, then `▲ 互相加强` 44 px `signalLabel` under that. When the panel lands, the % readouts of \|100⟩ and \|110⟩ fade out and the other %s fade to 40 %. r8: `RESULT 101` **120 px** mono `signal` on a `plate` x 300–1100, y 200–340. | **On r6:** row by row, top→bottom, every 0.22 s (skipping \|101⟩), each wrong row's dashed ghost (2.5 px, full opacity) slides in from the left over 8 frames, and the row's amplitude decays to flat over 12 frames. The ghost then fades. **On r7:** \|101⟩ turns red (6 frames), and its amplitude grows each cycle (40 → 110 px). The `94.1 %` readout counts up 12.5 → 94.1 (ease-out) with `示意` attached. **On r8:** a red trigger cursor sweeps left→right across all rows (12 frames). Everything freezes (persistence). The 7 flat rows dim to 25 %, and `RESULT 101` locks on. | **T20 cursor wipe.** End of r8: the trigger cursor keeps sweeping right, and behind it (left of the cursor) the screen is already the next layout. The 8 rows are wiped away as it passes. | 7 soft "cancel" thumps (falling); a rising tone on r7; trigger click on r8 |
| **20 Only some problems** | ≈79.4–82.3 · r9 | **L19** two horizontal channels as a speed-up chart. | Two curves: one shoots up steeply, one barely leaves the baseline | Chapter **06 · 用处**. Row 1 label `少数题 ▲▲▲ 快得离谱` 64 px Bold `readout` at (150, 230). Row 2 `大多数题 ▲ 强不了多少` 64 px Bold `traceDim` at (150, 520). Source `Aaronson · SciAm 2008` 44 px `traceDim` at (150, 760). | **On r9:** row 1's trace (`trace`, hero) draws on with an exponential climb that runs off the top of its band. Row 2 draws on 0.4 s later and stays near its classical dashed reference line (\`traceDim\` dashed). The VO reads only row 1, and row 2 is there to be seen. | **T21 RECALL REF.** End of r9: a `RECALL REF1` tag flickers top-right (status strip). The hook's two-channel compare (L2) zooms back in from a small slot at the bottom-left (14 frames): a callback. | recall "blip" |
| **21 Just a speed test** | ≈82.3–85.7 · r10 | **L2'** compact rebuild of the hook compare (full-size type, small traces). | The hook's record with a stamp across it | `10²⁵ 年` **110 px** mono `readout` (exponent 68 px) at x 150, baseline 330. `vs` 56 px. `< 5 分钟` **110 px** `signal` at x 900, baseline 330. Thin CH1/CH2 traces under them at y 430 / 520. Stamp: `测速题 · 暂无实际用途（Google）` **60 px** Bold `readout`, 3 px `readout` box, rotated −4°, centred at (960, 560). | **On r10:** the compare is already there (from T21). At r10 + 1.2 s (on "只是测速") the stamp slams (3 frames, settle 6). | **T22 trace morph to XY.** End of r10: the compare shrinks back into the REF slot (bottom-left, 10 frames). CH1's trace **curls**, its points morphing (16 frames) into the closed XY path of a molecule outline. Status strip: `MODE YT ⟶ XY`. | stamp thud; morph whoosh |
| **22 Molecules** | ≈85.7–89.0 · r11 | **L20** XY mode: a Lissajous-drawn molecule. | A benzene-like ring + two side bonds drawn by the beam | `分子模拟 → 新药 · 电池` 64 px Bold `readout` at (1050, 300). `将来 · 可能` 44 px tag in a 3 px box `readout` at (1050, 380). | **On r11:** the beam retraces the molecule (hexagon r 170 at (560, 440), 2 bonds, 3 atom dots) continuously at 1 loop/1.2 s with persistence, so it looks like a live XY figure. Labels lock on at r11 + 0.5 s / + 1.0 s. | **T23 the beam moves on.** End of r11: the molecule collapses into the beam dot (10 frames). The dot shoots to the left, and the next line's number is written by it. | — |
| **23 Factoring** | ≈89.0–94.7 · r12, r13 | **L21** one big number readout. At r13, a padlock trace wraps it. | `999,985,999,949 = 1,000,003 × 999,983`, then a padlock drawn around N | Chapter **07 · 加密**. `N = 999,985,999,949` **100 px** mono `readout` centred at baseline 380 (width ≈ 1080). Factors `= 1,000,003 × 999,983` 72 px mono `trace` at baseline 500, centred. `Shor · 1994` 44 px `traceDim` at (150, 760). `示意` 44 px boxed at (1500, 760). r13: `RSA · 靠「大数难分解」` 56 px Bold `readout` at baseline 720, centred. `你` 64 px Black in a 3 px `readout` circle (r 48) on the lock body's right side. | **On r12:** the beam writes N digit by digit (1 digit / 2 frames). At r12 + 1.0 s, N **splits**: a vertical cursor cuts it, and the two factors drop out below it (12 frames). (Verified: 1,000,003 and 999,983 are prime, and their product is 999,985,999,949.) **On r13:** the factors fade. A padlock trace (shackle arc + body rect, 3.5 px `trace` + glow) draws on around N (stroke-dashoffset, 18 frames). `你` pops on at r13 + 1.0 s (on "你用的"). | **T25 SAVE → REF.** End of r13: the whole padlock waveform is captured into the REF slot. It shrinks and dims (to 45 %) into the box at the bottom-left (14 frames), and a `REF1 SAVED` tag flickers. | beam-write ticks; "clunk" when the lock closes |
| **24 Harvest now** | ≈94.7–98.1 · r14 | **L22** REF slot (bottom-left) + big label + fast-forward timebase. | The locked waveform sitting in **REF memory**, while time runs forward | REF box x 120–620, y 520–780, `REF1 · 已存储 · 今天` 44 px `trace` at (120, 500). `先存后解` **120 px** Black `readout` at x 760, baseline 300. `HARVEST NOW, DECRYPT LATER · NIST` 44 px mono `traceDim` at (760, 380). `TIME/DIV ▸▸` 44 px mono `readout` at (760, 640) with the value rolling `1 天 → 1 月 → 1 年 →`. | **On r14:** the REF trace sits dim and static (a saved waveform does not scroll). A live CH1 trace above it scrolls faster and faster (frequency ramps ×6 over the line), and the TIME/DIV value rolls on beats. `先存后解` locks on at r14 + 0.8 s. | **T26 cursors drop in.** End of r14: the fast trace's motion blurs into horizontal streaks. Two red horizontal cursors drop from the top (12 frames, staggered 4) onto a new vertical log axis, and the REF lock moves to the right as a thumbnail (x 1500–1780, y 400–620). | fast-forward whir |
| **25 How many qubits** | ≈98.1–105.5 · r15, r16 (+ the beat before the payoff) | **L23** a log qubit axis (10¹–10⁸, x 260, y 140–780) with ΔY cursors x 300–1300. The lock thumbnail is at the right. | The **tall empty gap** between < 1,000,000 and Willow's 105, which then narrows | Top cursor at y ≈ 331 (10⁶). Its label is `破解 RSA-2048 需要 < 1,000,000（估计 · 2025）` 44 px `readout` at (340, 311). Bottom cursor at y ≈ 673 (105). Its label is `Willow 105` 56 px `signal` at (340, 650). The gap gets a 6 % `trace` hatch. `什么时候？专家估计 几年～几十年（NIST）` 44 px `traceDim` at (420, 540). r16: ghost mark at y ≈ 220 (2×10⁷), dashed `traceDim`, label `2019 · 20,000,000` 44 px `traceDim` at (340, 200). After the slide, a second line under the top cursor: `2026 ↓ 新论文更少` 44 px. Stamp: `好在：抗量子加密标准已发布` 48 px Bold `trace` + `NIST · 2024.08` 44 px mono, in a 3 px `trace` box x 1100–1790, y 620–770, rotated −3°, overlapping the lock thumbnail. | **On r15:** the cursors are in place (from T26). The ΔY readout between them counts the decades: `Δ ≈ 10⁴ 倍` 56 px at (1000, 520) is **optional**, so drop it if it crowds. The NIST "when" line fades on at r15 + 1.6 s. **On r16:** the 2019 ghost mark appears above (6 frames). A dashed trail draws from the 2019 ghost down to the cursor (2019 → 2025, 10 frames). Then the top cursor **slides a further ~40 px down** (ease-in-out, 20 frames) with an ↓ arrow, and `2026 ↓ 新论文更少` locks on (no number: the 2026 paper concerns a different cipher). The gap visibly narrows. **At the end of r16** the green stamp slams onto the lock (3 frames) and **holds through the pause** before the payoff. | **T27 cursors frame the key frame.** On r17 the two red cursors swing apart to the graticule's top and bottom edges (14 frames), and the 8 answer rows fill in between them (the key frame returns, wide). The axis, labels and lock fade. | cursor glide; stamp thud (green = relief) |
| **26 Payoff** | ≈105.5–110.5 · r17, r18 | **L18 wide** 8 rows (y 260–780, spacing 74) + a top statement strip. | **✗ 算得多** → **✓ 错的抵消**: seven traces go flat together, one red stays | Chapter **08 · 结论**. r17: `✗ 算得多` **96 px**: `算得多` Black `readout` with a 6 px red strike line, and `✗` `signal`, at x 300, baseline 210. r18: `✓ 错的抵消` **96 px** (`✓` `signal`, words `readout`) at x 1000, baseline 210. At the same moment `✗ 算得多` dims to 40 %. Ket labels 44 px. | **On r17:** all 8 rows are running again at full amplitude (the myth picture). The strike line draws through 算得多 at r17 + 0.8 s (on "不是"). **On r18:** **all 7 wrong rows go flat together on one beat** (their ghosts flash at full opacity for 6 frames), and \|101⟩ stays red and grows. `✓ 错的抵消` locks on with it. | **T28 back to frame 0.** On e1 the 8 rows unfreeze and **fan out** into the hook's 32-trace fan (match to frame 0, 14 frames). The statement strip fades. | 7 rows' "cancel" as one thump; resolve chord in the music |
| **27 Send it** | ≈110.5–114.8 · e1, e2 | **L1** (the opening fan) again. | The opening fan, struck by a red ✗, collapsing into one red beam | Chapter **00 · 传说** (the label scrambles back). `同时算所有答案？` 110 px Black on a `plate`, centred at the top (as in h1). `✗` 240 px `signal` stamped over it. | **On e1:** the fan is there. At e1 + 1.2 s (end of "同时算所有答案") the ✗ stamps (3 frames) and the text gets a red strike. **On e2:** the fan collapses (14 frames) into **one red trace** (the right answer), whose beam head travels to (960, 250). | **T29 hard cut to the end card (fix 9).** At the end of e2 (+0.3 s), on a beat: hard cut. The red beam dot's position (960, 250) is exactly where the J monogram's gold ring starts drawing. No dip, no fade from black. | cut on a beat; a soft chime under the monogram |
| **28 End card** | ≈114.8–≈119.9 (~5 s) · no VO | Engine **`EndCard`** (Brand.tsx), with the overrides below. Corner mark hidden. | Gold J monogram, gold 《量子计算机不是同时算》, and the gold **qubit** motif (a spinning coin, which closes the coin thread) | Monogram at (960, 250). `GoldTitle` 92 px at y 470. Motif `qubit` at (960, 556). Question `你身边谁还以为，量子计算机能同时算所有答案？` Noto Serif CJK SC Bold **52 px** `#F3EDE2` at y 690. Follow pill `关注 Juno · 每期一个反直觉的知识` **40 px** gold in a 960 × 72 pill (rx 36) at y 730–802. Sources line 22 px at 45 % at y 1010 (reference texture). | Engine timing: the ring draws first, then the title, motif, question and pill. The engine's own final 18-frame fade to black is allowed: it is the end of the film, not a bridge. | — (film end) | music outro under it |

**Overrides to the engine `EndCard` for this film:**
1. Backdrop: instead of `#05060b` + brand-key, use `screen` `#020604` with the graticule at 20 % opacity (no traces),
   so the card stays in the scope world while the gold is the only colour.
2. Sources line: **no "Juno 出品"** (brief "must avoid"). It reads `《量子计算机不是同时算》 · VIBE知识大赏　|　Google Quantum AI (2024, 2025) · Google Research (2026) · Caltech (2026) · NIST (2024) · IBM Quantum · Fermilab SQMS · S. Aaronson (SciAm 2008) · P. Shor (1994) · C. Gidney (arXiv 2025) · Bose · NASA/ESA · Stanford CS109`.
3. Question 46 → 52 px and follow pill text 26 → 40 px (phone readability, gate 2a fix 1). Everything else is unchanged.

**Brand exception to flag for the director:** juno-brand asks for a *gold* title card that includes `— Juno 出品 ·
VIBE知识大赏 —`. This film follows the producer's palette rule (**gold only on the end card**) and the brief (**no
"Juno 出品"**). So the title card (scene 3) is in phosphor white, built from the episode's own object (the beam writes
the title on the trace, in accents), with no white flash or light sweep, which follows the brand's entrance rule.
Its window is 2.56 s (14.24–16.8), which is short of the brand's 3.2 s minimum, because script v2 fixed it. If the
director wants the gold title back, it can be poured into the title glyphs at 14.24 + 1.0 s without changing anything
else.

---

## Layout specs (instrument layouts; all inside the y ≤ 800 clip)

| Code | Scenes | Channels / readouts | Graticule |
|---|---|---|---|
| L1 | 1, 27 | CH1 only, centre y 460. Fan of 32 traces. Question at the top. | full 10 × 8 box, x 60–1860, y 100–800 |
| L2 | 2 | CH1 band y 120–440 (label, 74 px readout, trace y 380). CH2 band y 460–790 (label, 170 px readout, burst). TIME/DIV top-right. | full, centre axis at y 450 |
| L2' | 21 | compact compare, 2 readouts in one row, thin traces at y 430/520 | full |
| L3 | 3 | one glowing baseline at y 560 + the title | full |
| L4 | 4 | digital CH1 (y 470–560) + lanes D0–D7 (y 600–780, 22 px each) + 96 px readout | full |
| L5 | 5 | 2 flat coins, no axes except the centre cross | full, 50 % |
| L6 | 6 | split: left dim readout, right 105-dot grid + 220 px `105` | vertical divider at x 900 |
| L7 | 7 | vertical log K axis at x 220, cooling trace, ΔY cursors | log ticks on the y-axis |
| L8 | 8 | 2 readouts on a baseline at y 600 | full, 60 % |
| L9 | 9 | XY coin (left, centre 560,450) + YT channel (x 1000–1780) | XY: square grid on the left half, YT on the right |
| L10 | 10–11 | small coin (left) + 3 rows \|0⟩ / \|1⟩ / sum at y 300/450/640 | rows |
| L11 | 12 | 2 component waves with dimension arrows (left) + coin + histogram (right) | split at x 1100 |
| L12–L13 | 13–14 | coin strip y 120–250, then 4 → 128 rows in y 300–790 | `gratRows` |
| L14–L15 | 15–16 | wall y 520–790 (u3), then the whole box (u4) + readout boxes / question plate | full, dimmed behind the wall |
| L16 | 17 | empty graticule + one spike at x 960 + top-left readout | full |
| L17 | 18 | 3 rows CH1 / CH2 / MATH at y 330 / 500 / 680 | rows |
| L18 | 19, 26 | 8 rows y 190 + 80 i (r6–r8), or 8 rows y 260 + 74 i (payoff). Right panel x 1420–1824. | `gratRows` |
| L19 | 20 | 2 horizontal channel bands (y 160–440, 460–740), each with a dashed classical reference | rows |
| L20 | 22 | XY molecule (left) + labels (right) | XY square grid |
| L21 | 23 | one big readout centred + padlock trace | full, 50 % |
| L22 | 24 | REF slot bottom-left + big label + live fast trace at y 470 | full |
| L23 | 25 | vertical log qubit axis x 260 + 2 horizontal ΔY cursors + lock thumbnail right | log y-axis |

Layout changes by time (≈): 0 L1 · 5.2 L2 · 14.24 L3 · 16.8 L4 · 20.0 L5 · 22.0 L6 · 25.3 L7 · 28.1 L8 · 30.5 L9 ·
34.8 L10 · 38.6 (measure) · 42.1 L11 · 46.8 L12 · 51.2 L13 · 55.0 L14 · 59.4 L15 · 63.1 L16 · 66.1 L17 (relabel at
70.5) · 72.9 L18 · 79.4 L19 · 82.3 L2' · 85.7 L20 · 89.0 L21 (padlock at 91.5) · 94.7 L22 · 98.1 L23 (cursor slide
at 101.7, stamp at 104.8) · 105.5 L18 wide · 110.5 L1 · 114.8 end card.

---

## Transitions (all motivated, no dips to black)
| # | Where | What happens | Motivated by |
|---|---|---|---|
| T1 | h2 → h3 | The cursor finishes its sweep, and the frozen fan folds into CH1 + CH2 | the trigger cursor sweeps; channel split |
| T2 | h4/gap → title (14.24) | The timebase zooms out until CH1 is a single bright line, the trigger slams on the drop, and the line becomes the title's baseline | zoom-out of the time axis |
| T3 | title → s1 (16.8) | The title's baseline steps into a square wave, and the title decays like persistence | the trace changes signal |
| T4 | s1 → s2 | Push ×14 into one step of the square wave | zoom into a trace |
| T5 | s2 → s3 | The flat coins shrink to dots and slide into the dim 64,000,000,000. The screen splits, and the 105 grid sweeps on | screen split; the count becomes dots |
| T6 | s3 → s4 | 105 dots collapse into one chip dot, which becomes the beam falling down the log K axis | the chip goes into the cold |
| T7 | s4 → s5 | The 10 mK flat line rises to become the baseline, and the ΔY cursors close into the blinking cursor on 105 | the cursor carries over |
| T8 | s5 → b1 (30.5) | Push into the blinking 105 cursor, which becomes one dot that starts spinning: the XY coin | zoom into one qubit |
| T9 | b1 → b2 | The coin's width-sine splits into \|0⟩ and \|1⟩ components | MATH-style channel split |
| T10 | b2 → b3 | The red trigger drops, everything freezes, the coin falls flat | measurement = the trigger |
| T11 | b3 → b4 | The flat coin stands back up and spins, and the histogram panel slides in | the experiment is re-run |
| T12 | b4 → u1 (46.8) | A second coin slides in, and their traces split into 4 channels | a second coin |
| T13 | u1 → u2 | Rows unzip in two on the beats | doubling |
| T14 | u2 → u3 | The rows get so dense they merge into a wall of glow | density |
| T15 | u3 → u4 | The readouts slide out, the wall fills the screen, and the question plate fades in | build to the peak |
| T16 | u4 → r1 (63.1) | **The trigger slams and the whole wall collapses into one spike** (hard hit, no flash) | measurement gives one answer |
| T17 | r2 → r3 | The spike splits into CH1 + CH2, and a MATH row opens | the MATH channel splits |
| T18 | r4 → r5 | Same rows: the labels scramble to 噪声 / 反相波 / ≈ 安静 | relabel; same physics, your headphones |
| T19 | r5 → r6 | 3 rows unzip into the 8 answer rows | channel split |
| T20 | r8 → r9 | The trigger cursor keeps sweeping and wipes in the next layout behind it | the cursor sweeps |
| T21 | r9 → r10 | RECALL REF1: the hook's compare zooms back out of a slot | callback to the record |
| T22 | r10 → r11 | The compare is saved back, and CH1 curls into an XY molecule | trace morph; MODE YT → XY |
| T23 | r11 → r12 | The molecule collapses into the beam dot, which writes N | the beam moves on |
| T24 | r12 → r13 | The trace draws a padlock around N | draw-on |
| T25 | r13 → r14 | SAVE → REF: the padlock waveform shrinks into the REF memory slot | storing = "harvest now" |
| T26 | r14 → r15 | Fast-forward streaks, then two red ΔY cursors drop onto a log qubit axis, and the lock moves right | the cursor sweep |
| T27 | r16 → r17 | The two cursors swing apart to the edges, and the 8 rows fill between them | cursor framing; the key frame returns |
| T28 | r18 → e1 | The 8 rows fan out into the opening fan | match to frame 0 |
| T29 | e2 → end card | The fan collapses into one red beam dot at (960, 250), then a hard cut on a beat; the gold J ring draws from that point | position match; fix 9 |

---

## Build notes for the animator
- One `Scope` wrapper component draws everything shared: the background gradient, graticule (props: layout, opacity,
  rows), raster lines (clipped), the `phos` filters, status strip, chapter label (with scramble), corner mark, vignette,
  grain and subtitle band. Scenes draw only their traces and readouts, inside `<g clipPath="url(#scr)">`.
- Helpers: `trace(fn, x0, x1, step)` → path d. `glow(d, color, w)` → underlay + core (+ hot core).
  `persist(fnAtFrame)` → f−1…f−3 ghosts. `readout(text, {x, y, size, finalWidth})` with ghost digits and lock-on.
  `cursor(x | y, label)`. `stamp(text, box, rotation, frameIn)`. `xyCoin(cx, cy, R, theta, face)`.
  `flatCoin(cx, cy, label)`.
- Scenes start at a line's **real** TTS start (read from the timed lines file). Every "on rN + 0.6 s" in this table is
  relative to that start. Absolute anchors: 14.24, 16.8, 30.5, 46.8, 63.1.
- Performance: the u3/u4 wall is 120 traces at a 6 px step plus one blurred gradient band (not 512 traces). The 128-row
  doubling uses a 6 px step and no persistence.
- QA per scene still (gate 3): nothing green/red in y 820–960; every readout inside x 96–1824; no label < 44 px
  except the status strip and % column (≤ 60 %); 94.1 % always has 示意; no Willow temperature; no gold before the end
  card; no "Juno 出品".

## Fix map (notes_gate2a_r1.md)
| Fix | Where it's applied |
|---|---|
| 1 labels ≥ 44 px, chapter 34 px | Type table + every scene's Text placement. Kets 48 px (r6–r8), 52 px (u1, b2, r3–r5). 示意 / Google 估计 / ×100+ / 少数题 rows / source tags 44–64 px. Status strip + % column 24–26 px at ≤ 60 %. |
| 2 94.1 % collision + 示意 | Scene 19: a right panel x 1420–1824 aligned to \|101⟩, with 示意 directly under 94.1 % from the first frame and ▲ 互相加强 under it. The \|100⟩/\|110⟩ % readouts fade out, the others go to 40 %. |
| 3 no 0.010 K; CH1 wording | Scene 2: the CH1 label is "最快的超级计算机之一 · Google 估计", and there is no temperature or qubit count in the hook. ≈ 10 mK appears only in scene 7, labelled 超导量子芯片. |
| 4 clip at y 800, band .85 + blur 14 | The frame grid: `clipPath` y ≤ 800 on every scene layer. Band `rgba(2,6,4,.85)` blur 14, white 46 px only. |
| 5 safe area x 96–1824 | Fixed-width readouts with ghost digits: 10²⁵ at 74 px ends ≈ 1750. 64,000,000,000 ends ≈ 1310. 2³⁰⁰ overflows its box (≈ 1410), not the frame. Cursor labels end ≤ 1500. |
| 6 dashed ghost visible | Strokes table: 2.5 px `#3E9D6C`, dash 10 8, 100 % during r4 and r6 (and the flash on r18), then fades. |
| 7 layout change ~5 s, red discipline, no scanlines | 23 layouts, with a change every ≈ 2–6.6 s (Layout changes by time). Red discipline in the palette. Raster lines at 4 % inside the graticule only, so they are not visible as scanlines. |
| 8 frame 0 | Scene 1: a running trace, the h1 subtitle and 00 · 传说 on frame 0, and the burst on the first beat ≤ 1 s. |
| 9 end card | Scene 27 → 28: a hard cut from the last red trace (after the red ✗) onto the gold J ring at the same point. Gold only there. No "Juno 出品" (EndCard override 2). |

## Style frames
| Frame | File | What it proves |
|---|---|---|
| Hook (look A) | `style/lookA_hook.png` (HTML `style/lookA_hook.html`, generator `style/make_frames.py`) | The hero pairing (white 26-digit 10²⁵ over red `< 5 分钟`), the palette and glow. **Predates fixes 1, 3, 4, 5:** it still shows "T = 0.010 K", the "经典超算 · 需要" wording, 22–26 px labels and a cursor running into the subtitle band. The build follows this storyboard, not the frame. |
| Key (look A) | `style/lookA_key.png` | The 8-row cancellation key visual and the 94.1 % readout. **Predates fixes 1, 2, 6:** 30 px kets, ▲ 互相加强 colliding with \|110⟩'s %, the ghost too faint, no 示意. The scene 19 spec supersedes it. |
| Gate 3 stills (animator) | `stills/` per scene | Will prove the fixes: frame 0, 14.24 title, b1 coin, r6/r7 key, 63.1 collapse, the end card. |
