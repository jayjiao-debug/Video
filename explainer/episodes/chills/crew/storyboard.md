# Storyboard: 鸡皮疙瘩在等什么 (ep13) · Look C · 过山车 Riso Coaster

Gate 2b, round 1. This storyboard is built on these inputs:
- script.md v2 (36 lines) and lines.json (film time)
- audio/segments.json, which is the soundtrack and the clock for everything below
- looks.md (Look C)
- notes_gate2a_r1.md. Fixes C1–C6 are applied, and the "Fix map" at the end says where each one lands.

Times are **film seconds**. Frames are `round(t × 30)`. Every audio edit has an exact frame, and the picture
event on the strip lands **on that frame**. The lines are fixed (subtitle-only film), so line times are exact too.

**Engine:** Remotion, **SVG only** (inline `<svg>` layers plus absolutely positioned HTML text). No canvas, no
three.js, no CSS 3D. Format 1920×1080 at **30 fps**, 3706 frames (123.53 s). Audio is `audio/master.wav` as is.
All randomness comes from Remotion `random(seed)`, so every render is identical.
**Sound:** the bgm is the only sound (script and brief). Add no SFX, because the ear is the hero.

---

## Look

**One sentence:** the song's *tension* is a roller-coaster track printed on a risograph poster. The build is
the lift hill, the quiet breath bar is the crest where the cart hangs, and the drop is the plunge. Under the
ground runs the real **track strip**: the soundtrack itself, bar by bar. Its playhead *is* the cart. Every edit
is a scissors cut, a stamp or a knob acting on the strip and the track on the frame the sound changes.

### Palette (exact hex, nothing else on screen)
| Token | Hex | Use |
|---|---|---|
| `paper` | `#F2ECDF` | the page (every scene) |
| `paperShade` | `#E2D8C4` | the 10 px edge shadow of a sheet being pulled (print-pull transitions), the backs of pinned sheets |
| `pink` | `#FF48B0` | the track rail, cart body, the 高潮 clip, the halftone sun, pink type. **Pink = the thrill / the highs.** |
| `blue` | `#0078BF` | posts, braces, ground line, riders' heads, wheels, scissors, knob, strip columns, most type. **Blue = structure / the editor.** |
| `yellow` | `#FFE800` | halftone fill under the track (texture only, it encodes nothing), the tint of the bed clips on the strip |
| `ink` | `#1D2B5E` | corner mark, subtitle band base, end-card backdrop |
| `drained` | `#A6A2B0` | pink ink after it has been muffled (Demo 4). It replaces `pink` in the muffled range. |
| `drainedType` | `#7F7B8C` | type printed in drained ink (闷) |
| `pinkSub` | `#FF8FCC` | the subtitle's [key words] on the dark band (pink lightened for 5:1 contrast) |
| gold (END CARD ONLY) | `#F1C56D`, deep `#C8913A`, metal stops `#FFF3CF → #F3CD7A → #C99140 → #8A5A22` | J monogram, title, motif, follow pill. **No gold before frame 3583.** |
| card text | `#F3EDE2` | end-card question, BGM line, sources |

All inks print with `mix-blend-mode: multiply` on `paper`. Where pink crosses blue you get the riso purple
overprint for free, so don't specify it as a colour.

### Type (all on the render machines)
| Role | Font | Weight / size | Colour |
|---|---|---|---|
| Title (stamp) | Noto Sans CJK SC | Black 900, **128 px**, two lines, letter-spacing 6 px | line 1 `blue`, line 2 `pink`; each has the other ink misregistered under it |
| Big labels (屏住呼吸, 已删除, +4秒, 紧张, 预测/等待/兑现, 闷…) | Noto Sans CJK SC | Black 900, **56–110 px** (never under 56) | `blue` / `pink` / `drainedType` |
| Secondary labels (美食, 金钱, lamp tags, 每拍约0.5秒) | Noto Sans CJK SC | Bold 700, **44–48 px** | `blue` / `pink` |
| Numbers, timecode, Hz, counter, 7/38, 30/21 | DejaVu Sans Mono | Bold 700, **56–72 px** (timecode 60 px) | `blue` / `pink` |
| Strip clip tabs (铺垫, 吸气, 高潮…) | Noto Sans CJK SC | Bold 700, 34 px | `blue` (the 高潮 tab `pink`) |
| Citation captions (Grewe 2007 …) | Noto Sans CJK SC + DejaVu Sans Mono | 500, 36 px, 75 % | `blue` |
| Meter label | Noto Sans CJK SC | Black 900, 36 px; 示意 tag Bold 28 px | `pink`; the tag `blue` 70 % |
| Subtitles (engine) | Noto Serif CJK SC | Bold 700, 46 px, letter-spacing 2 px | `#FFFFFF`, [key words] in `pinkSub` (no gold) |
| Chapter label (engine) | DejaVu Sans Mono + Noto Sans CJK SC | Bold 700, 34 px, letter-spacing 2 px, 90 % | `blue` |
| Corner mark (engine) | Noto Sans CJK SC | 500, 24 px, 60 % | `ink` |

### Strokes (screen px at zoom 1; under zoom z use `max(min, w·z)`)
| Element | Stroke | Notes |
|---|---|---|
| Track rail | `pink` **17 px** (min 10), round join/cap | tie texture on top: `paper` 3 px, dash `2 14`, 90 % |
| Posts | `blue` 4.5 px (min 3) | one per beat (≈ 68 px at z 1), from rail +9 px down to the ground |
| Cross braces | `blue` 2 px, 45 % | between alternate posts, only where the post is > 70 px tall |
| Ground line | `blue` 5 px at **y 652** | fixed in y, never zoomed vertically (zoom pivots on it) |
| Deleted / lifted track (ghost) | `pink` 7 px, dash `16 13`, 70 % | |
| Cut line | `blue` 3 px, dash `10 8` | the vertical line the scissors travel down |
| Prediction marker (预判) | `blue` 4 px, dash `12 10` | from the ground to y 230, with a 26 px solid triangle flag |
| Playhead (strip) | `blue` 4 px solid, 22 px triangle head at y 662 | |
| Playhead connector | `blue` 3 px, dash `8 8`, 80 % | from the ground (y 652) up to the cart's axle |
| Tremble marks (held breath) | `blue` 9 px, round cap, 40 px long | 2 → 6 above the riders |
| Speed streaks (plunges) | `blue` 6 px, round cap, 40–60 px | 3 behind the cart while vertical speed > 600 px/s |
| Strip clip | 3 px `blue` 80 % border, rx 10 | the `吸气` clip border is dashed `8 6` |
| Scissors | engine `scissors()` in `style/make_frames.py`: blades filled `blue`, ring stroke 10 px, rings filled `paper` | plus a `pink` copy beneath, offset (+3, −2) (misregistration) |
| Meter frame | 3 px `blue`, rx 15 | |
| Knob | ring 6 px `blue`, pointer 10 px `pink` round cap | |

### Riso texture (how to build it)
1. **Three ink layers.** Each scene renders three absolutely positioned full-frame `<svg>`s in this order:
   `inkYellow`, `inkPink`, `inkBlue`. Each has CSS `mix-blend-mode: multiply` over a `paper` `<div>`. Every element
   goes on the layer of its ink (the cart's body on pink; its heads and wheels on blue). Big HTML type sits in the
   same stack, also `multiply`.
2. **Misregistration, 2–3 px, static.** Blue is the key at (0, 0). Pink is offset by `(dxP, dyP)` and yellow by
   `(dxY, dyY)`. Each component is picked from {−3, −2, 2, 3} px by `random('reg-' + sheetId)`. Offsets are constant
   within a sheet. A new sheet (print-pull) or a stamp gets new offsets, like a fresh pass through the machine.
   **Never jitter per frame.**
3. **Rough print edge, locked to the world.**
   - Wrap the pink and blue *world* geometry in `<g transform="translate(${-panX},0)">`. Compute the zoom in JS, not
     as a transform.
   - Put one filter on that `<g>`: `feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="1" seed="9"`
     → `feDisplacementMap scale="3"`.
   - Use `filterUnits="userSpaceOnUse"` with region `x = panX − 120, y = −120, w = 2160, h = 1320`, updated per frame.
   - The noise field translates with the world, so edges don't boil on pans.
   - One filter per layer group, never one per path.
4. **Halftone, pitch ≥ 12 px.** Use SVG `<pattern patternUnits="userSpaceOnUse">` inside the translated world group.
   The dots then move rigidly with the world and keep their screen pitch during zooms.

   | Pattern | Ink | Pitch | Dot | Angle | Use |
   |---|---|---|---|---|---|
   | `htY` | yellow | **14 px** | r 4.6 | 20° | fill under the rail |
   | `htP` | pink | **14 px** | r 4.0 | 45° | the sun, the 高潮 clip edge |
   | `htB` | blue | **12 px** | r 2.6 | 70° | cart shading, 50 % |
   | `htD` | drained | 14 px | r 4.0 | 45° | the Demo 4 sun |

   Nothing ever goes below 12 px pitch.
5. **Grain, static.** Render once to `public/ep13/grain.png` (1920×1080) with the feTurbulence + feColorMatrix of
   `style/make_frames.py` `RISO_DEFS #grain`. Lay it full-frame over the scene layers and under the subtitle band, at
   `multiply` 35 %. It is screen-fixed and the same image in every frame (C4).
6. **Encode test before building scenes (C4).**
   - Render a 5 s pan (f365–515) and a zoom (f2370–2400).
   - Encode at the delivery setting (2-pass, ~2 Mbps).
   - Check for halftone moiré or mush. If the dots smear, raise the pitch to 16 px and r to 5.2. Don't drop the
     halftone.

### The cart and riders (C5)
The cart is `c_cart()` in `style/make_frames.py`:
- a pink rounded car 140×48 (rx 17), shaded with `htB` at 50 %
- two blue wheels, r 12
- three **faceless round blue heads**, r 18

No faces, eyes, hands, arms, hair, sparkles, sweat drops or cartoon motion lines. Scale = z (min 0.6).
Emotion comes only from motion: the lurch, the tremble, the compress (heads drop 6 px, the cart squashes to
0.94 in y) and the tilt of the track.

### Must NOT look like
- **A kids' cartoon or edu-app:** no faces, no smiling sun, no stars or sparkles, no rainbow gradients, no
  bubbly rounded type. Every edge keeps its rough print, and the type is Black and poster-sized.
- **A theme-park ad or 3D ride sim:** no perspective, no sky gradient, no clouds, no realistic steel.
- **A clean vector infographic:** every frame has the three-ink overprint, misregistration, halftone and grain.
- **A DAW screenshot:** the strip is a printed band of clips, not UI. No menus, transport buttons, track names or
  meters except ours. One knob, only in Demo 4.
- **The navy+gold night (ep1–ep11) or the green phosphor scope (ep12):** `ink` appears only as the subtitle band,
  the corner mark and the end card.

---

## Frame grid (every scene)

```
y    0 ┌───────────────────────────────────────────────────────────────────────────────┐
y   38 │ 02 · 第一刀 删掉高潮 (34 px)    鸡皮疙瘩 [▓▓▓▓▓░░░░] 示意      ◆ Juno · VIBE知识大赏 │
y   96 │                                                                  ✂ 1/4 (56 px) │
y  120 │  SKY: big labels, info sheets (beds: y 120–440)                                │
       │                         ___ crest (T .94 → y 248)                              │
       │       cart ▣  ____/      \     the track: y = 652 − 430·T                       │
y  652 │━━━━━━━━━━━━━━━━━━ ground line (5 px blue) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
y  662 │┌原曲───────┐┌铺垫────────────────┐┌吸气┄┄┄┄┐┌高潮──────────┐   ▲ playhead          │
       ││ 01:13.3  ││▂▃▅▆▅▃▂▃▅▇ columns  ││▂▂▃▂▂▃▂ ││▅▇█▇▆▇█▇      │   │                   │
y  806 │└──────────┘└────────────────────┘└┄┄┄┄┄┄┄┄┘└──────────────┘   │  TRACK STRIP 144 px│
y  820 │                ┌──── subtitle band (engine) ────┐                              │
y  960 │                └────────────────────────────────┘                              │
y 1080 └───────────────────────────────────────────────────────────────────────────────┘
```
- **Top-left: the chapter label only** (x 64, y 38, 34 px), so the Douyin watermark stays clear. Nothing else sits
  at x < 420, y < 190. Chapter labels change with a 4-frame stamp (scale 1.1 → 1, new misregistration).
- **Corner mark:** top-right (top 40, right 56). It hides during the title (f243–365) and the end card.
- **Inside meter** (示意), top centre, screen-fixed:
  - label `鸡皮疙瘩` 36 px Black `pink`, x 640–790, y 50–92
  - bar x 806–1226, y 56–86 (420×30, rx 15, 3 px `blue` frame, `paper` fill)
  - fill: solid `pink` with an `htP` leading edge 20 px wide
  - `示意` 28 px Bold `blue` 70 % at x 1240
  - a 4 px `blue` peak-hold tick that decays 1.5 %/frame
  - **floor 12 %, so it never shows zero**; values in the meter table below
- **Cut counter:** top-right under the mark. A 44 px scissors glyph plus `1/4` in DejaVu Mono Bold **56 px** `blue`,
  right-aligned at x 1864, y 96–152. Shown f790–3123. Each new cut stamps the number.
- **Track strip:** y **662–806 (144 px)**, along the ground line (C1). It uses the world's x-mapping, so a clip sits
  exactly under the track it plays. See "The track strip" below.
- **Strip header** (screen-fixed, covers the strip's past): x 40–330, y 662–806, `paper` fill, 3 px `blue` frame,
  rx 10.
  - Line 1: `原曲`, 30 px Bold `blue`.
  - Line 2: the **track timecode** `mm:ss.s` in DejaVu Mono Bold **60 px** (C5: ≥ 56). It is the position *in the
    original song*, so edits show as jumps in it.
  - The playhead never goes left of x 420.
- **Subtitle band (engine, unchanged):** y 820–960, white Noto Serif Bold 46 px. The band is
  `rgba(22,30,64,.88)` (dark `ink`), blurred 5 px, rx 22. Key words in `pinkSub`.
  **No world or strip element enters y 812–1080.**

---

## The world: track, cart, strip, camera

### World ↔ film time
- **World x = 135 px per film second** at zoom 1 (1 bar ≈ 272 px, 1 beat ≈ 68 px). The track is the graph of
  tension T over *film* time, so the track ahead is literally what you are about to hear.
- **Cart x = playhead x = 135·t** (world).
  - The cart's y is the rail at that x.
  - Its angle = `atan2` of the rail at ±6 px, clamped to ±80°.
  - The axle sits 7 px above the rail centreline.
  - The cart and the playhead separate in only three places: the sil1 cliff, the bed2 catch-up and the outro loop.
    Each scene below describes its case.
- **Camera:**
  - `screenX = (worldX − panX)·z`, `screenY = 652 − (652 − worldY)·z`. Zoom pivots on the ground line, so the
    ground and the strip never move vertically.
  - It is specified as **A(t) = cart screen x** and **z(t)**, with `panX = 135·t − A/z`.
  - Moves use `Easing.inOut(Easing.cubic)` unless stated.
  - **STATIC** = panX constant, so A grows at 135·z px/s (the cart walks across the frame).
- **Shake on plunges:** a screen-space offset on the world layers only (the strip, header, meter and text never
  shake). 10–14 px, decaying `e^(−f/3)` over 10 frames.

### Track height T(t): the producer's formula (C2: height = tension/expectation, not loudness)
`y = 652 − 430·T`. T = 0.94 is the crest (y 248). For each segment, `n` = bars and
`k = (t − film_from)/((film_to − film_from)/n)`.

```ts
const CREST = 0.94, LOW = 0.03, PL = 0.375;                    // PL: a plunge lasts 1.5 beats (~0.76 s)
const climb  = (k, a, b, n) => a + (b - a) * Math.pow(k / n, 1.3) + 0.02 * Math.sin(2 * Math.PI * k) * (1 - k / n);
const crest  = (k, n, amp = 0.015) => CREST + amp * Math.sin(Math.PI * k / n);
const hills  = (k, base, amp, per = 2) => base + amp * Math.sin(Math.PI * k / per) ** 2;
const plunge = (k, n, t0, low, peak, end) => k < PL
  ? t0 - (t0 - low) * (1 - Math.cos(Math.PI * k / PL)) / 2                     // cosine plunge, steepest mid-way
  : ((u) => low + (end - low) * u + (peak - (low + end) / 2) * Math.sin(Math.PI * u) ** 2)((k - PL) / (n - PL)); // rebound hill
```

| Segment | Film | n | T(k) | What the shape says |
|---|---|---|---|---|
| (pre-roll, world left of frame 0) | −4.06–0 | 2 | `climb(k, .12, .26, 2)` | we join mid-climb |
| hook | 0–8.098 | 4 | k<3: `climb(k, .26, CREST, 3)`; else `crest(k−3, 1)` | lift hill, then the crest (吸气) |
| title | 8.098–12.156 | 2 | `plunge(k, 2, CREST, LOW, .36, .16)` | **the hardest drop** |
| bed1 | 12.156–26.331 | 7 | `hills(k, .16, .08)` | low rolling hills (released, loud) |
| cut1 | 26.331–32.398 | 3 | k<2: `climb(k, .24, CREST, 2)`; else `crest(k−2, 1)` | climb and crest. Before the snip (f851), the world after 32.398 is drawn as the original `plunge(…)` plus bed hills. |
| sil1 | 32.398–34.412 | 1 | **no track**: a cliff edge at x(32.398) | silence: the rail just ends |
| bed2 | (32.398) 34.412–42.504 | 4 | `CREST + (H − CREST)·smoothstep((t − 32.398)/4.6)` with `H = hills(k, .10, .04)` (k may be < 0) | a gentle patched ramp down into quiet hills (泄气, not a plunge) |
| cut2 | 42.504–48.582 | 3 | `hills(k, .10, .03, 1)` | flat and low: no lift hill. Before the snip (f1367) the world after 48.582 shows the original: 2 flat bars at `.10`, then `climb(.10→CREST, 7 bars)`, `crest(1)`, `plunge`. |
| drop2 | 48.582–52.640 | 2 | `plunge(k, 2, .10, .04, .20, .16)` | **a drop without a build: it starts low and dips a little** |
| bed3 | 52.640–64.789 | 6 | `hills(k, .16, .08)` | |
| cut3 | 64.789–68.841 | 2 | `climb(k, .16, CREST, 2)` | |
| wait3 | 68.841–74.884 | 3 | `crest(k, 3, .02)` | **the crest, 3× longer**. Before the edit (f1989) the world shows `crest(k,1)`, then the plunge at 70.856. |
| drop3 | 74.884–78.942 | 2 | `plunge(k, 2, CREST, LOW, .36, .16)` | the late drop, as deep as the title's |
| bed4 | 78.942–89.060 | 5 | `hills(k, .16, .08)` | ends at .24 |
| cut4 | 89.060–93.106 | 2 | k<1: `climb(k, .24, CREST, 1)`; else `crest(k−1, 1)` | a short steep climb and crest (**drained ink**) |
| drop4 | 93.106–97.164 | 2 | `plunge(k, 2, CREST, LOW, .36, .16)` | **same height**: the tension is the same, only the pink is gone |
| bed5 | 97.164–105.268 | 4 | `hills(k, .16, .08)` | drained |
| sweep | 105.268–109.320 | 2 | `climb(k, .16, CREST, 2)` | a climb while the ink comes back |
| breath | 109.320–111.334 | 1 | `crest(k, 1)` | the original crest (callback to frame 0) |
| final | 111.334–117.418 | 3 | `plunge(k, 3, CREST, .02, .40, .12)` | the deepest plunge, the biggest rebound |
| outro | 117.418–119.432 | 2 | `hills(k, .12, .04)` until film 118.75, then a **loop** (geometry below) | |

- **Sampling and smoothing:** sample T every 4 world px (≈ 0.03 s). Smooth with a `[1,2,1]/4` kernel twice,
  **except within ±0.06 s of a plunge start** (keep the lip sharp).
- **Previews before an edit:** the world *ahead* of the cart uses the same functions to show the **original
  arrangement**, and the strip shows the original clips. On the edit frame the scissors, stamp or knob acts. From
  then on the ahead shows the edited arrangement, which is the true film audio.
- **The yellow halftone under the rail is texture only** (C2). Its density is the same everywhere and it never
  claims loudness. Loudness lives in the strip.

### The track strip (C1)
**Clips**
- One clip per segment, with a 6 px gap between clips.
  - hook splits into 铺垫 (0–6.084) and 吸气 (6.084–8.098)
  - cut1 splits at 30.383, cut4 at 91.092
  - wait3 is three 吸气 clips
- **Non-contiguous joins** (where the song jumps) get a 28 px `blue` ✂ splice glyph on the gap at y 668. They are at
  26.331, 34.412, 42.504, 48.582, 64.789, 70.856, 72.870, 89.060, 105.268 and 117.418.
- **Tab** (y 666–700): the clip's name in 34 px Bold, top-left.
  - Names by source bars: 铺垫 (bars 32–38), 吸气 (bar 39), 高潮 (bars 40–41), 高潮后 (42+), 间奏 (24–31), 尾声 (78–80).
  - Muffled clips add `·闷`. Silence is `已删除`, in `pink`.
- **Fills:**

  | Clip | Fill |
  |---|---|
  | 铺垫 | `blue` 18 % |
  | 吸气 | `paper`, dashed border |
  | 高潮 | `pink` 22 % with an `htP` border band |
  | 高潮后 / 间奏 / 尾声 | `yellow` 35 % |
  | 已删除 | 45° `blue` hatch (3 px every 14 px, 45 %), no columns |
  | muffled | the 高潮 tint becomes `drained` 25 % |

**Columns** (y 706–800, bottom-aligned at 800, max 92 px)
- One column per 1/16 bar: ≈ 17 px at z 1 (11 px wide + 6 px gap), min width 4 px under zoom.
- Computed from **`audio/master.wav` at film time**:
  - Column height `h = 92·clamp((dB_full + 30)/22, .04, 1)^1.3`, drawn in `blue`.
  - **Pink cap** = the 中高音 share: `cap = h·clamp(1.6·10^((dB_band − dB_full)/20), 0, .6)`, where `dB_band` is the
    RMS of the 920–4400 Hz band-pass. Drawn in `pink` on top of the blue.
- In muffled clips the real cap is ≈ 0. Also draw a **ghost cap**: the cap computed from the *unfiltered* source
  bars, as a 2 px `drained` dashed outline. It shows exactly what the low-pass took (C3).
- For previews of the original arrangement, compute from `bgm.mp3` at the source bars.

**Playhead:** a 4 px `blue` line from y 662 to 806 with a triangle head, plus the dashed connector up to the cart.

### Inside meter values (示意; floor 12 %, never zero)
| Film | Value | Note |
|---|---|---|
| 0 → 6.084 | 30 → 70 % | rises with the climb |
| 6.084–8.098 | 72–78 %, 12 Hz jitter ±2 % | held breath |
| 8.098 (f243) | → 96 % in 4 f | the drop |
| 8.1 → 13.5 | 96 → 40 % | settles under 起了吗？ |
| beds | 35–45 %, slow drift | |
| cut1 26.33 → 30.38 | 35 → 70 % | |
| sil1 32.398 → 34.4 | **holds 72 %**, sags to 58 % by 34.4; pink **`?`** 48 px Black right of the bar | not zero (line 11) |
| cut2 | 30 % flat | no build behind it |
| drop2 48.582 | → 62 % | it moves, with no build-up |
| cut3 → wait3 | 35 → 72 → **88 %**, jitter ±3 %, the bar frame shakes 2 px | the strain (……还没来？) |
| drop3 74.884 | → 96 % | |
| cut4 / drop4 | 40 → 65 % / → 62 % | muffled, so it rises less. The fill stays pink: the meter is "inside". |
| sweep → breath | 40 → 75 → 82 % | |
| final 111.334 | → **100 %**, then a second pink pass prints over the bar (misregistered 3 px) | |
| outro | → 50 % | hidden at f3583 |

---

## Scenes
Layout codes:
- **RIDE:** the camera follows the cart (A fixed).
- **STATIC:** the camera holds and the cart walks across the frame.
- **SHEET:** an info print in the sky (y 120–440, paper with a 3 px `blue` frame and its own misregistration).
  Sheets arrive and leave by **print-pull**: in from the top in 14 f with `Easing.bezier(.2,.8,.2,1)`, out upward in
  12 f ease-in, showing a 10 px `paperShade` edge.

| Scene | Time (film · frames) | Shot (track layout, camera) | Key visual | Text placement | Motion beats (and the strip **on the exact frame** of each audio edit) | Transition OUT (motivated by…) | Sound (segments.json) |
|---|---|---|---|---|---|---|---|
| **1 Hook** | 0–8.098 · f0–243 · `hook` | **STATIC**, z 1. **Frame 0:** the cart at A 430 on the lift hill (T .26, y 540). The climb runs to the crest at x 1251–1523 (y 248). The plunge starts at x 1523 (bottom at x 1625, y 639), then the rebound hill to x 1847. A pink halftone **sun** (`htP`, r 200, 55 %) is centred at (1390, 170), partly off the top, behind the meter. | The cart on the climb with the crest and sun ahead. Striking on frame 0: a bright poster, a tall pink rail, no empty area. | **Frame 0:** subtitle line 1. `屏住` (blue) + `呼吸` (pink) in one line, Black 96 px, world-anchored above the climb at x 820–1210, y 130–226. `蓄力 ↗` Black 56 px `blue` near the cart at (470, 420). Chapter `00 · 1分21秒`. Meter at 30 %. Header timecode `01:13.3`. **f83 (2.75, line 2):** stamp `01:21` in DejaVu Mono Bold **72 px** `blue` and `↓ 冲！` in Black 64 px `pink`, right of the plunge at x 1560–1860, y 270–440. | **f0:** the cart is already mid-kick (tilted back 4°, 3 speed ticks behind the wheels, settled by f6), and the first strip column is lit: frame 0 is a hit. **f22 (0.74 s, the measured strongest onset): THE JOLT** (C6). The cart kicks back 10 px along the rail and returns in 6 f with squash 1.08/0.92. The world shakes 4 px for 4 f, and three blue clack ticks appear under the wheels. Smaller clacks on the next downbeats (2.032, 4.052). **f83:** the 01:21 flag stamps on the plunge point (4 f, scale 1.2 → 1). **f137 (4.557, "剪掉呢"):** the scissors (scale .8) drop from the top and hover over the rail at the plunge lip. They open and close once in the air on 5.062 (f152), cut nothing, and lift out of frame by f183. **f183 (6.084): the playhead enters the 吸气 clip.** Tremble marks go 2 → 4 above the riders and the meter jitters. Otherwise the picture holds still under "听——". | **T1, no cut.** The cart itself crosses the crest lip at f243 and the title stamps on that frame. The motion *is* the transition. | build bars 36–38, breath bar 39 |
| **2 Title** | 8.098–12.156 · f243–365 · `title` | STATIC until 9.2. Then a **RIDE catch-up**: A eases 1672 → 760 over 9.2–11.6. The camera catches up with the cart's momentum (peak pan ≈ 515 px/s), with a 6 px horizontal smear on the world layer while the pan is faster than 400 px/s. | **The title stamp + the plunge** | `鸡皮疙瘩` (blue) / `在等什么` (pink), Black **128 px**, two lines, screen-fixed at x 160–672, y 190–318 and 326–454 (it clears the rail by ≥ 30 px). Each line has the other ink under it, offset (+3, +2). Chapter label and corner mark hidden. No subtitle (a listening window). | **f243 (8.098) exactly:** the cart tips over the lip (PLUNGE, 0.76 s). **The title stamps:** scale 1.25 → 1.0 in 4 f (`Easing.out(Easing.back(1.4))`), and the ink spreads (2 px blur → 0 in 4 f). World shake 12 px. The sun bursts (r 200 → 260, with three `blue` rings expanding over 12 f). Meter → 96 %. **Strip at f243:** the playhead crosses from 吸气 into 高潮; the 高潮 clip flashes (tint 22 → 60 → 22 % over 8 f); the timecode `01:21.4` turns pink. f266 (8.85): bottom of the plunge, speed streaks. The rebound hill peaks at 9.6. | **T2, print-pull.** At **f365 (12.156, the downbeat)** the title sheet is pulled up out of the top (12 f ease-in, `paperShade` edge) while the camera is already riding. The cart carries on into the low hills. | the hardest drop (bars 40–41) |
| **3 不是人人都会** | 12.156–26.331 · f365–790 · `bed1` | **RIDE**, A 760, z 1. Low rolling hills (T .16–.24) keep the sky (y 120–440) free. | One SHEET at a time in the sky, as named | Chapter `01 · 不是人人都会`. A 36 px caption under each sheet. | **f365:** the playhead enters 高潮后 (contiguous; −8 dB, so only the columns shrink). The meter settles. **14.81 (line 5): SHEET *38 heads*.** 2 rows × 19 round `blue` heads (r 20, the riders' style) at x 420–1500, y 200–330. From 15.30, **7 heads** turn pink with an `htP` ring, stamped 3 f apart. `7 / 38` Mono Bold **72 px** `pink` at (1560, 230). Caption `莫扎特《安魂曲》选段 · Grewe 2007`. **18.16 (line 6):** sheet swap (print-pull) to a **lamp** at (960, 270): an r 90 circle, 3 px `blue`, with 8 short rays, and `奖赏区` Black **64 px** `pink` under it. It lights (`htP` fill) on the downbeat 18.222. **20.91 (line 7):** a bowl icon (120 px, blue + pink, steam lines, no hands) at (560, 280) and a ¥ coin at (1360, 280), with dashed `blue` 4 px arrows into the lamp. Labels `美食` / `金钱` 48 px. **23.66 (line 8):** the bowl falls out of the sheet (gravity, 18 f, behind the track), and a dashed arrow rises from the cart/strip to the lamp. **24.305 (downbeat): a `?`** in Black **140 px** `pink` stamps right of the lamp. | **T3, print-pull and a new lift hill.** At **f790 (26.331)** the sky sheet is pulled up as the rail ahead starts to climb. The ride never stops. | loud bed after the drop |
| **4 Demo 1 · 删掉高潮** | 26.331–34.412 · f790–1032 · `cut1`, `sil1` | **RIDE**, A 560, z 1. From f790 the crest and the original plunge are in frame (x 1107–1379). From 30.383 **STATIC**: the cart walks onto the crest, reaches the edge at x 1379, and the playhead runs on to x 1651. | **The snipped rail, and the cart stopped dead at the cliff edge** | Chapter `02 · 第一刀 删掉高潮`. The counter stamps `1/4`. **Shown once (C2), 26.33–29.0:** a `blue` 5 px arrow up the left sky (x 440, y 600 → 300) with `越高 = 越紧张（示意）` Bold **48 px** `blue` at (470, 290). After the snip, `已删除` in Black **72 px** `pink` sits in the void right of the cliff at (x_cliff + 60, 330). Line 11's `?` goes on the meter. | **f790: the strip shows a splice ✂.** The timecode jumps back `01:39.7 → 01:15.4`, with a pink `↺` for 6 f. **f851 (28.352, the downbeat on "删掉"): THE SNIP.** A cut line draws down at x(32.398) from y 200 to 806 (6 f). The scissors (scale .9) travel down it and close twice: on the rail (f857) and on the strip (f863). The piece right of the cut **lifts 40 px and becomes the dashed ghost** (12 f): on the rail the plunge and rebound, on the strip the 高潮 clip. The strip clip becomes the hatched `已删除` clip; everything after it is blank. **29.13 (line 10 听。):** stillness; the meter climbs. **f911 (30.383):** the playhead enters 吸气; tremble marks. **f972 (32.398) exactly: THE CART STOPS DEAD at the cliff edge.** No glide: it lurches forward 12° and back in 10 f, and the heads lurch 8 px. **The playhead runs on alone** into the hatched clip, so its connector stretches into a diagonal from the strip to the cart. The timecode reads `--:--.-` in `pink` with `静音` 30 px. The meter holds. **f995 (33.15, line 11):** a `?` on the meter. | **T4, the patch.** At **f1032 (34.412)** a gentle ramp (the bed2 formula) is **stamped** onto the cliff edge (4 f, new misregistration). The 间奏 clip stamps onto the strip at the playhead (timecode `00:49.0`). The cart rolls down the ramp and **catches up with the playhead by 35.4**: cart x = playhead − 272·(1 − easeIn(τ)) over 1 s, faster downhill. Motivated by the sound coming back. | build + breath (bars 37–39), then **2.01 s of silence** |
| **5 24个人** | 34.412–42.504 · f1032–1275 · `bed2` | The camera follows the cart down the ramp. A eases from ≈ 1790 back to **760** over 34.9–36.4. Then **RIDE**, z 1. Quiet low hills (T .10–.14). | SHEETs: heads → bars → the mini-map | Chapter stays `02`. 36 px captions. | **35.56 (line 12): SHEET of 24 heads** (2 × 12, r 22) at x 460–1460, y 190–320. Caption `Bannister & Eerola 2018`. **38.36 (line 13):** the heads slide left and shrink, and two bars grow from x 460 (20 f, ease-out). `原版`: 30 units = 600 px, `pink` + `htP`, y 200–264. `删掉后`: 21 units = 420 px, `blue` 60 %, y 300–364, with a dashed outline of the missing 9. The numbers `30` / `21` in Mono Bold **64 px** at the bar ends. `少了约三成` in Black **56 px** `pink` with a bracket over the 9-unit gap. Not zero. **41.56 (line 14):** sheet swap to the **mini-map** `原曲小样`: the hook's coaster profile (build → crest → plunge) at x 560–1500, y 140–430, rail 8 px. A pink halftone highlight band sits on the plunge, then **slides back** onto the climb and crest (20 f), labelled `铺垫 + 吸气` Bold 48 px. | **T5, match-move.** At **f1275 (42.504)** the camera pulls back (z 1 → **0.4**, A → 400, 24 f) to show the long original climb ahead. On the same frames the mini-map's highlighted climb **flies down and scales onto that real climb** (18 f). What was just highlighted becomes what is about to be cut. | quiet break (bars 24–27) |
| **6 Demo 2 · 删掉铺垫** | 42.504–52.640 · f1275–1579 · `cut2`, `drop2` | z **0.4** (A 400) from f1299 to 46.6, showing the whole original ahead: 2 flat bars, the 7-bar climb, the crest and the plunge (drop at screen x ≈ 1817). Then z → 1, A 560 (30 f, 46.6–47.6), and **RIDE**. | **The lifted-out climb, and the drop sitting flat on the ground (a small dip)** | Chapter `03 · 第二刀 删掉铺垫`. Counter `2/4`. On the lifted ghost: `铺垫` Black **64 px** `blue` 60 %. On the slid-in piece: `高潮` Black **56 px** `pink` with a ↓. | **f1275: the strip shows a splice ✂**, timecode `00:57.1 → 00:55.1 ↺`. Ahead on the strip are the preview clips 间奏, 铺垫 ×7, 吸气, 高潮. **f1367 (45.581, the beat on "删掉铺垫"): TWO SNIPS**, at x(48.582) and at the crest's end. Each is a cut line plus scissors through the rail and the strip (8 f each, f1367 and f1375). The climb and crest **lift away** as a dashed ghost (rise 60 px, 14 f). The 高潮 piece **slides left** along the ground to the join (20 f, ease-out, with a 2 px `blue` clack mark at the join). As it slides, its height collapses from the crest-height plunge to the `drop2` dip. **The strip does the same:** the 铺垫/吸气 clips lift out and the 高潮 clip slides left to butt against 间奏. The ghost then **detaches and pins** to the sky at x 980–1780, y 130–360, held by two `blue` tape strips. It keeps this size while the camera zooms back in. **47.30 (line 16 听。):** stillness. **f1457 (48.582) exactly:** the playhead crosses into 高潮 (splice ✂, timecode `01:21.4`). **The cart dips a little** (T .10 → .04 → .20). A small sun (r 120) flashes. Meter → 62 %. | **T6, the cut piece becomes the next diagram.** The pinned ghost climb stays in the sky as the ride continues into bed3, and its lamps light next. | quiet bars (27–29), then the drop with no build |
| **7 等待也是奖励** | 52.640–64.789 · f1579–1944 · `bed3` | **RIDE**, A 560, z 1 (hills). From 60.79: A → 420 and z → **0.85** (24 f), so the original build, the crest and the predicted plunge at 70.856 (screen x ≈ 1576) are ahead. | The pinned ghost with **two lamps** (等待 over the climb, 兑现 over the plunge). Then **beat ticks running toward the 预判 marker**. | 36 px captions. Lamp words Black **56 px**, tags Bold 44 px. | **53.59 (line 18):** the **等待** lamp lights over the ghost's climb: r 60, `blue`, `htB` fill when lit, with `等待` 56 px `blue` and the tag `尾状核` 44 px. Caption `Salimpoor 2011`. **57.34 (line 19):** the **兑现** lamp (`pink`) lights over the plunge end of the pinned ghost, with `兑现` 56 px `pink` and the tag `伏隔核 · 多巴胺` 44 px. Both lamps stay on. **60.79 (line 20):** the pinned sheet is pulled up and the camera goes to z .85. **Beat ticks** (4×14 px `blue`, one per beat) run along the strip's top edge: `pink` once the playhead has passed, dim ahead. `每拍约0.5秒` Bold 44 px `blue` at (cart x + 80, 470). The **预判 marker** draws up at x(70.856) (dashed `blue`, triangle flag), with `预判` in Black **56 px** `blue` beside the flag. | **T7, the ticks lead the eye forward.** The ride goes on. At **f1944 (64.789)** the rail starts its climb toward the marker; the strip shows a splice ✂ and the timecode jumps `01:37.6 → 01:15.4 ↺`. | loud bed |
| **8 Demo 3 · 晚到4秒** | 64.789–78.942 · f1944–2368 · `cut3`, `wait3`, `drop3` | RIDE, A 420, z .85. Over 67.4–68.4: z → 1, A → 620. RIDE until 70.856. From f2126 **STATIC**, with a push-in to 1.04 (pivot (900, 652)) until 74.884; then STATIC through 78.9. The predicted point stays at screen x ≈ 620 and the real plunge lands at x ≈ 1164. | **The cart hanging on a crest 3× longer, past the 预判 marker** | Chapter `04 · 第三刀 晚到4秒`. Counter `3/4`. `+4秒` in Black **72 px** `pink` between the marker and the new plunge, with a double arrow. Stamp tags `×2` and `×3` in Mono Bold 56 px on the copied crest bars. | **f1989 (66.305, the beat on "晚到"): THE STRETCH.** A snip at the crest's end, x(70.856), on the rail and the strip. The plunge and everything after it **slide right by 2 bars** (20 f, ease-in-out). **Two copies of the crest bar are stamped** into the gap 6 f apart (f2011, f2017), each with its own misregistration and its `×2` / `×3` tag. On the strip, two 吸气 clips are stamped the same way. The ghost of the old plunge stays at the marker, dashed. **67.39 (line 22 听。).** **f2065 (68.841):** the playhead enters 吸气. **f2126 (70.856) exactly: the cart passes the 预判 marker and nothing happens.** The marker flashes `pink` for 4 f and the dashed ghost plunge under it flickers once. **The timecode jumps back `01:21.4 → 01:19.4 ↺ 2/3`** (the header flashes pink for 4 f). Held breath: tremble marks go 2 → 4 → 6 over the three bars, the heads compress (−6 px, squash .94), the meter strains at 88 % and its frame shakes. **f2133 (71.10, line 23 ……还没来？).** **f2186 (72.870):** `↺ 3/3`. **f2247 (74.884) exactly: THE LATE PLUNGE.** The push-in snaps back to 1.0 (6 f), shake 12 px, sun burst, meter 96 %. **77.18 (line 24):** hold the static frame with the marker (x 620), the gap and the plunge (x 1164) all in view. | **T8, look back.** At **79.94 (line 25)** the camera pulls back (z → **0.62**, 24 f), so the three-bar crest we just rode is in frame behind the cart. | build (bars 37–38), breath bar 39 ×3, the drop 4.03 s late |
| **9 紧张 · 套路** | 78.942–89.060 · f2368–2672 · `bed4` | From 79.94: z .62 with the crest (68.84–74.88) centred at screen x 700. From 83.34: RIDE, A 1100 at z .62. From 86.94: z → 1, A 620 (24 f). | **`紧张` stretched over the three crest bars**, then the whole song's shape | Chapter stays `04`. 36 px captions. | **79.94 (line 25):** a `pink` bracket over the crest grows from 1 bar wide to 3 bars wide (20 f), with `紧张` in Black **72 px** `pink` above it. Caption `预期理论 · Huron 2020`. **83.34 (line 26): SHEET *whole song*** (x 120–1800, y 110–500). The 164 s song as a small coaster: intro climb, first drop at 16.6, hills, the flat break at 49.1, the long climb from 65.2, the crest at 79.4, the plunge at 81.4, hills, outro. Labels in Black **56 px**: `铺垫` over the climb, `拖延` over the crest, `兑现` over the plunge. Caption `Solberg & Dibben 2019`. **86.94 (line 27):** the sheet is pulled up and the camera zooms in. **The knob stamps in** at (1560, 330): an r 64 ring with a `yellow` halftone face and the `pink` pointer at "全开". `高音` in Black **56 px** `blue` above it, readout `全开` in Mono Bold 56 px below. Counter `4/4`. **f2657 (88.561):** the pointer is gripped and wiggles ±4°. | **T9, the knob does it.** On **f2669–2672** the knob **snaps closed** (pointer −135°, readout `800 Hz`). **On f2672 (89.060) exactly, the pink drains** from the playhead forward. | loud bed |
| **10 Demo 4 · 闷住** | 89.060–97.164 · f2672–2915 · `cut4`, `drop4` | **RIDE**, A 620, z 1. The crest is at x 894–1166 and the plunge at x 1166. | **The same coaster printed without its pink**: rail, cart, sun and strip caps all in `drained` grey | Chapter `05 · 第四刀 闷住高音`. **95.31 (line 29):** `闷` in Black **110 px** `drainedType`, stamped beside the grey sun at (1480, 300). | **f2672 (89.060) exactly:** the strip shows a splice ✂ and timecode `01:17.4 ·闷`. **The drain** is a wave from the playhead to the right edge over 10 f: every pink thing ahead (the rail, the sun, the 高潮 tint, the strip caps) turns `drained`, and the strip caps become **dashed ghost caps** (what's missing). **Behind the cart stays pink**: what already played was bright. The knob stays at 800 Hz. **89.56 (line 28 听。).** **f2733 (91.092):** the playhead enters 吸气·闷. **f2793 (93.106) exactly: the grey plunge**, with the same depth and shake as before. The sun bursts in `htD` grey. The meter reaches only 62 %. | **T10, the knob's curve opens into the chart.** At **97.66 (line 30)** the knob's tiny filter-curve glyph grows into the frequency SHEET (16 f, scaled from the knob centre). | build + breath + drop through an 800 Hz low-pass, at matched loudness |
| **11 中高音** | 97.164–105.268 · f2915–3158 · `bed5` | **RIDE**, A 620, z 1, grey hills. From 104.64 STATIC (it sets up scene 12). | **The 920–4400 Hz band inside the removed region** (C3) | Axis labels Mono 36 px. Band label Black **56 px**. | **97.66 (line 30): SHEET *frequency strip*** (x 300–1640, y 130–470). A log axis 50 Hz–16 kHz with ticks `100 · 1k · 10k`. The low-pass curve (`blue` 6 px) is flat to 800 Hz, then rolls off. **Everything right of 800 Hz is hatched in `drained`**, labelled `闷掉的部分`. Inside it, the 920–4400 Hz box is `pink` + `htP` (not grey), labelled `中高音 920–4400 Hz`: clearly *inside* the removed region and narrower than it. Caption `Nagel 2008`. **101.01 (line 31):** sheet swap to a **layer stack**: three lanes `低音 · 鼓 · 高音` (Bold 48 px) at y 160–400, with a dashed `高潮` line at x 990. Left of the line: 低音 solid, 鼓 dashed, 高音 absent. **On "一下全回来" (the beat at 102.226)** the right half stamps in: all three lanes solid, 高音 in `pink`. **103.96 (line 32):** the sheet is pulled up. The counter's four cut marks **peel off** one by one (4 × 5 f, curling), and the knob reappears at (1560, 330), still reading `800 Hz`. | **T11, the knob turns back.** At **f3158 (105.268)** the knob starts to open. Cause and effect stay on one object. | muffled bed |
| **12 Payoff · 还给你** | 105.268–117.418 · f3158–3523 · `sweep`, `breath`, `final` | **STATIC** (since 104.64). The cart walks from x 705 (105.268) to **x 1251 at 109.32**, which is the **frame-0 composition** again: the crest at 1251–1523 and the sun at (1390, 170). At 112.0 the camera pulls back (z → .7, 24 f) to frame build, crest and plunge. RIDE, A 900, from 114.0. | **The ink coming back**, then the full pink plunge with `预测 · 等待 · 兑现` | Chapter `06 · 还给你`. Knob readout in Mono Bold **56 px**, counting Hz. Labels stamped in Black **64 px**: `预测` (blue) over the climb, `等待` (blue) over the crest, `兑现` (pink) over the plunge. 113.73: the bowl icon (120 px) at sky left (300, 260). | **f3158:** the strip shows a splice ✂, timecode `01:15.4`. The knob turns with the real cutoff, `fc = 400·30^(k^1.6)` with `k = (t − 105.268)/4.052`, and the readout counts `400 → 12000 Hz`. **The re-ink is truthful:** every column and rail point at the playhead and ahead is coloured `mix(drained, pink, m)`, with `m = clamp((ln fc − ln 920)/(ln 4400 − ln 920), 0, 1)`. So the pink returns between 106.95 and 108.53, as fc crosses the 中高音 band, and the strip's real caps grow back. Behind the cart the rail keeps the colour it had when it played, which leaves a grey → pink gradient. **106.32 (line 33 听。).** **f3280 (109.320):** the playhead enters 吸气, the knob reads `全开`, everything ahead is pink, tremble marks. **f3340 (111.334) exactly: THE FINAL PLUNGE**, the deepest. Shake 14 px, sun burst r 200 → 300, meter 100 % plus an overprint. **Labels stamp on the beats:** f3371 (112.356) 预测, f3386 (112.861) 等待, f3401 (113.371) 兑现. **113.73 (line 34):** the bowl returns, and `预测` + `等待` get a `blue` halftone halo (吊你胃口). **f3507 (116.907, the beat on line 35 "那一拍"):** `兑现` gets a `pink` halftone burst (喂饱你). | **T12, ride on.** The camera zooms back to 1 as the rebound flattens, and the rail heads toward a loop. | the filter opens over the build → the original breath → the full drop |
| **13 Outro** | 117.418–119.432 · f3523–3583 · `outro` | RIDE, A 760, z 1. Ahead, the rail rises into a **vertical loop**: a circle r 150, tangent to the rail at x(118.75). The cart **decouples** from the playhead here (the song is ending). The strip and header slide down out of frame (y +160, 14 f from f3540). | The cart riding the loop | No new text. The meter fades from f3570. | **f3523 (117.418):** the strip shows a splice ✂, timecode `02:38.4 尾声`. **f3563–3583:** the cart enters the loop and goes around 360° (the riders upside down at the top). The camera **pushes into the loop centre**, with z chosen so the loop lands at (960, 250) with the engine J ring's radius. | **T13, match shape.** At **f3583 (119.432, the downbeat)** the pink loop **becomes** the J monogram ring. It turns gold over 6 f (the first gold in the film) while the inside floods with `ink` from the centre outward (10 f, a riso flood). No dip, no black. | outro bars, fading |
| **14 End card** | 119.432–123.53 · f3583–3706 | Engine **`EndCard`** (Brand.tsx) with the overrides below. Corner mark, chapter label, meter and counter hidden. | Gold J monogram, gold 《鸡皮疙瘩在等什么》, gold coaster motif | Monogram at (960, 250). `GoldTitle` 92 px at y 470. Motif **coaster**: one gold 6 px line (climb → crest → plunge), 360 px wide, at (960, 556). Question `你会发给哪个听歌起疙瘩的朋友？` in Noto Serif CJK SC Bold **52 px** `#F3EDE2` at y 690. Follow pill `关注 Juno · 每期一个反直觉的知识`, **40 px**, gold, in a 960×72 pill (rx 36) at y 730–802. `BGM：频道配乐` 26 px `#F3EDE2` 60 % at y 960. Sources 22 px 45 % at y 1010. | Engine timing: the ring is already there from T13; then the title, motif, question and pill draw. Line 36 (119.42–123.32) appears **as the card's question, not in the subtitle band** (no duplicate text). The engine's final 18-frame fade at the very end is allowed: it is the film's end, not a bridge. | — (film end) | outro fade |

**Overrides to the engine `EndCard`:**
1. Backdrop `ink` `#1D2B5E` with the static grain at 20 % and **no** halftone. Gold is the only colour.
2. **No "Juno 出品".** The sources line reads `《鸡皮疙瘩在等什么》 · VIBE知识大赏　|　Blood & Zatorre 2001 · Salimpoor et al. 2011 · Grewe et al. 2007 · Jain et al. 2023 · Bannister & Eerola 2018 · Huron 2020 · Solberg & Dibben 2019 · Nagel et al. 2008`.
3. `BGM：频道配乐` is a placeholder until the owner names the track. The producer fills it in here and in the
   pinned comment.
4. Question at 52 px and pill text at 40 px (as in ep12, for phone readability).

---

## Transitions (every one motivated; no dips to black, no unrelated jumps)
| # | Where (film · frame) | What happens | Motivated by |
|---|---|---|---|
| T1 | hook → title · 8.098 · f243 | No cut. The cart tips over the crest lip and the title stamps on the same frame. | the drop itself |
| T2 | title → bed1 · 12.156 · f365 | The title print is pulled up off the top while the camera catches up with the cart's momentum | the downbeat; the cart's speed out of the plunge |
| T3 | bed1 → Demo 1 · 26.331 · f790 | The sky sheet is pulled up as the rail ahead begins a new lift hill; splice ✂ + timecode ↺ | the song jumps back to the build, visibly on the strip |
| T4 | silence → bed2 · 34.412 · f1032 | A gentle ramp is stamped onto the cliff edge; the cart rolls down it and catches the playhead, and the camera follows | the sound coming back |
| T5 | bed2 → Demo 2 · 42.504 · f1275 | Pull back to z .4; the mini-map's highlighted climb flies onto the real climb ahead | match-move: what was just highlighted is what gets cut |
| T6 | Demo 2 → bed3 · 52.640 | The lifted-out climb is pinned in the sky, and its lamps light next | the cut piece becomes the diagram |
| T7 | bed3 → Demo 3 · 60.79 → 64.789 · f1944 | The sheet is pulled up; beat ticks run toward the 预判 marker; the rail climbs | the prediction line ("预判高潮何时来") |
| T8 | Demo 3 → bed4 · 79.94 | The camera holds static (marker, gap and plunge in frame), then pulls back to show the 3-bar crest | looking back at what we just rode |
| T9 | bed4 → Demo 4 · 89.060 · f2672 | The song sheet is pulled up, the knob snaps closed, the pink drains ahead | the knob is the edit |
| T10 | Demo 4 → bed5 · 97.66 | The knob's curve glyph grows into the frequency chart | match shape (the filter curve) |
| T11 | bed5 → payoff · 105.268 · f3158 | The knob turns open and the ink returns | cause and effect on one object |
| T12 | final → outro · ~116–117.4 | The ride goes on; the rebound flattens toward the loop | the cart's momentum |
| T13 | outro → end card · 119.432 · f3583 | Push into the loop; the pink loop becomes the gold J ring; the inside floods with ink | match shape (loop = ring) |

The print-pulls inside a scene (info sheets swapping in the sky) are one consistent motif: a riso print sliding
off the drum. They never cross the strip or the subtitle band.

## Audio edits on the strip (exact frames)
| Frame | Film | Audio edit | Strip | Track / cart |
|---|---|---|---|---|
| 243 | 8.098 | breath → the hardest drop | 吸气 → 高潮; the clip flashes; timecode pink `01:21.4` | plunge + title stamp |
| 790 | 26.331 | jump back to the build | splice ✂, `01:39.7 → 01:15.4 ↺` | a new lift hill |
| 851 | 28.352 | (preview edit, on the downbeat) | scissors snip; 高潮 → hatched `已删除` | the plunge lifts into a dashed ghost; a cliff |
| 972 | 32.398 | **drop deleted → silence** | playhead into the hatched clip, `--:--.-` | **the cart stops dead at the cliff** |
| 1032 | 34.412 | silence → quiet break | 间奏 clip stamped, `00:49.0` | ramp stamped; the cart rolls down |
| 1275 | 42.504 | jump back | splice ✂, `00:57.1 → 00:55.1 ↺` | pull back to the original climb |
| 1367 / 1375 | 45.581 | (preview edit) | 铺垫/吸气 clips lifted out, 高潮 slides in | climb lifted; the drop piece slides to the join |
| 1457 | 48.582 | **the drop with no build** | splice ✂, 高潮, `01:21.4` | **a small dip from low ground** |
| 1944 | 64.789 | jump back | splice ✂, `01:37.6 → 01:15.4 ↺` | lift hill toward 预判 |
| 1989 | 66.305 | (preview edit) | two 吸气 copies stamped; 高潮 slides right | crest stretched ×3, `+4秒` |
| 2126 | 70.856 | **breath, repeat 2** (the predicted drop point) | `01:21.4 → 01:19.4 ↺ 2/3` | the cart passes the marker; nothing happens |
| 2186 | 72.870 | breath, repeat 3 | `↺ 3/3` | held breath; the meter strains |
| 2247 | 74.884 | **the late drop** | 高潮 | plunge, 4 s late |
| 2672 | 89.060 | jump back + **800 Hz low-pass** | splice ✂, `·闷`; caps drain to ghost outlines | the knob snaps; the pink drains ahead |
| 2793 | 93.106 | the muffled drop | 高潮·闷 | grey plunge, same depth |
| 3158 | 105.268 | jump back + **sweep 400 → 12000 Hz** | splice ✂; caps regrow as fc crosses 920–4400 | the knob opens; re-ink |
| 3280 | 109.320 | the original breath | 吸气, full colour | crest = the frame-0 composition |
| 3340 | 111.334 | **the full drop** | 高潮 | the deepest plunge; labels |
| 3523 | 117.418 | jump to the outro | splice ✂, `02:38.4` | toward the loop |
| 3583 | 119.432 | (downbeat) | strip gone | loop → gold J ring; end card |

## Style frames
| Frame | File | What it proves |
|---|---|---|
| Hook (look C) | `style/lookC_hook.png` (`style/make_frames.py → lookC_hook`) | Palette, rail, cart, halftone sun, 屏住呼吸 type, the three-ink overprint. **It predates C1/C5/C6:** no strip, no meter, a 60 px timecode in the sky, the crest further left. Build from this storyboard, not from the frame. |
| Key (look C) | `style/lookC_key.png` (`lookC_key`) | The snip grammar: scissors on the rail, the dashed ghost, `已删除`. In the film it is a single row (not two stacked rows), and the cart **stops dead at the cliff** instead of rolling flat (the script now has silence there). |
| Layout proof (step B) | `style/sb_f0000.png` (`style/make_sb_frames.py`) | The frame-0 layout of this storyboard: track (T formula), strip with real columns + caps, header timecode, meter, chapter, corner mark, subtitle band. It checks the vertical budget: nothing but the band in y 812–960. |
| Gate-3 stills the animator must show | `stills/` | f0 (layout), f22 (jolt), f243 (title + plunge), f863 (the snip through the strip), f990 (cart dead on the cliff, playhead running on), f1370 (Demo 2 at z .4), f2140 (past the marker), f2690 (drain), f2950 (frequency sheet), f3300 (frame-0 callback), f3410 (labels), f3590 (ring). Plus the 5 s pan encode test (C4). |

## Fix map (gate 2a → this storyboard)
| Fix | Where it lands |
|---|---|
| C1: a real strip ≥ 140 px; playhead = cart; edits act on the strip on the sound frame | Frame grid (strip y 662–806); "The track strip"; every scene's motion column; the "Audio edits on the strip" table |
| C2: height = tension, not loudness; plunge keyed to the measured drop | The T(t) formula (tension functions, no loudness input); the yellow halftone is texture only; `越高 = 越紧张（示意）` shown once in Demo 1; every plunge starts on its segment frame (f243 …) |
| C3: the Demo 4 picture | The drain at f2672 (pink → `drained`, ghost caps); the frequency sheet with 920–4400 Hz *inside* the hatched removed region; the truthful re-ink from the real sweep cutoff |
| C4: compression | Halftone pitch 14/14/12 px; world-locked patterns; a static grain PNG; static misregistration; no per-frame noise; an encode test before building |
| C5: not a kids' cartoon | Faceless heads only, no sparkles or faces; rough print edge; Black poster type ≥ 56 px for labels; timecode 60 px |
| C6: the first second | f0 already mid-kick; **the jolt at f22 (0.74 s, the measured strongest onset)**; smaller clacks on the downbeats |
