# Storyboard: 越王勾践剑 / 真的没锈吗？ (ep53 · gate 2b · one take)

Art director, 2026-10-29. Timeline = **`lines_bars.json` (FINAL, 113.633 s = 3409 frames at 30 fps)** and the music contract
`MUSIC_NOTES.md` (beat P = 0.56605 s, downbeats DA(k) = 0.4432 + 2.2642·k). Every time below is film seconds on that timeline.
Key frames: `episodes/37-qiqing/remotion/src/qq53/KF53B.tsx` (KFS list, 14 frames, render id `KF53B-ALL`).

## Look (owner-approved: style B「漆」 dark, the three KF53 style frames)
- **World:** one continuous camera through one object. A night museum case, your night kitchen, a 1965 pit and the
  metal itself are all one dark lacquer space; the sword is the brightest thing in every frame. 2.5D: world geometry
  (mm or m) projected through one look-at perspective camera into SVG paths (`parts53` Cam/proj/poly, `macro53`
  BladeMacro, `sword3d`). No three.js, no CSS 3D, no photos.
- **Palette (hex):** lacquer ground `#120906` `#1A0D09` `#1C0E0A` · bronze `#FFF3CF` `#F4D088` `#DCAA5E` `#BC8744` `#80552A`
  `#4A2E14` · lattice dark `#22140A` · tin-pale diamonds `#FFF0CC` · blue glass `#6AA8F0` `#2F6CC8` `#163C84` · turquoise
  `#3FA89A` · gold accent `#E8BC66` / `#FFE6A8` · cream `#F2E6CC` · ink `#FFF6E6`. Secondary, never saturated: knife steel
  `#6E7274` with rust `#8A4620` `#A6582A`; soil `#54402A` (夯土) `#434C4B` (青灰泥) `#9E9A8B→#77736A` (白膏泥); air dots
  `#E6F4F8`. **The one exception:** the bronze rust bloom, olive `#4E5E38` / `#6E7E46` with a weak rust-brown rim `#7A5434`,
  only from T1 on, always small. Seal red `#D0583C` (hollow corner seal), the red J stamp on the end card.
- **Type:** subtitles Noto Sans CJK SC 900, 65 px, cream, gold underline on [key] words; picture tags Noto Sans CJK SC 900,
  ≥ 44 px (key numbers ≥ 96 px) on feathered scrims; stamp LXGW WenKai (bundled `public/fonts/wenkai`) + Cormorant Garamond
  lining figures 52 px, note 30 px; end-card pill Noto Serif CJK SC.
- **Light:** one motivated key per leg (named in the table), aimed at the sword; everything else falls off into lacquer.
- **Must NOT look like:** a museum slideshow (labels on a static object), a game engine fly-through, a rusty sword
  (rust stays a few specks), a "magic gleam" ad (no sparkle storms), a cartoon. Never: a photo of the real sword, a face for
  any real person, bones in detail, a map, a struck-through or stamped 「镀铬？」, anything about the export ban.

## Furniture (the ep50–52 engine layer, unchanged)
- **Subtitles: layout D**, top-left (x 150, y 132, rows stack, row 2 types after row 1); I0 (the Q line) centred with its
  gloss. This is the series standard since ep44 and the brief's choice for ep53; it replaces the generic "y 820–960" rule
  for this film. The bottom band stays free for the depth tag (bottom-left) and the seal (bottom-right).
- **Stamp:** two lines, top-right (top 64, right 160), after the subtitle has typed; held while unchanged, line 2 retyped
  when only the note changes. Hidden on the title (9.500–11.764) and the end card.
- **Corner seal:** the hollow J (`SealHollow`, qq51/master51), bottom-right, every frame until the end card.
- **Depth tag:** bottom-left, 104 px numerals, D2 → D5 (0 → 10.8 m) and L1 (10.8 → 0 m) only.
- **Phone-safe:** nothing important within 120 px of the sides or 58 px of top/bottom; the right ~200 px column carries
  picture only.

## The one take (no cuts, no wipes, no fades to black: every change of place or time is a camera move)

Scale words: "field" = the width the frame shows at the subject; lens = horizontal field of view.

| Leg | Lines (time) | Camera start → end (position, direction, lens/scale) | What moves | Match move into the next leg | SFX cue | Hero light |
|---|---|---|---|---|---|---|
| 1 | H1 row 1 · 0.000–1.575 | 19 cm above your wet cleaver on the rack, looking down its cutting edge toward the far end of the same line; wide lens (~88° horizontal), field ~25 cm at the knife → gliding along the edge line | Frame 0 already moving; rust blooms on the steel on beat 1 (0.443); water beads glint; the bronze edge already glints far down the line, out of focus | **Match 1** (1.575, f47): the edge line carries straight on from steel into bronze at 1:1 scale; the kitchen falls away into lacquer | water drip 0.1 · rust tick 0.443 · bronze shimmer 1.575 | under-cabinet light from upper left on the steel; a museum spot already on the far bronze |
| 2 | H1 · 1.575–5.538 | skimming ~3 mm above the blade, looking tip → guard along the ridge; very wide macro (~100°), field ~3 cm → glide on | the diamond lattice streams under the lens; [亮] pulses on DA(1) 2.707; the guard rises on the horizon | the guard's blue glass comes up into frame: the camera lifts over it (motivated rise, same direction) | low bronze hum under the glide | raking warm key from the right, catching the pale (tin) diamonds |
| 3 | H2 · 5.538–9.500 | over the guard 5 cm → rise and pull back to 1.2 m, looking down at the whole sword level in its case; field 8 cm → 70 cm | blue glass glints on the near face (turquoise seen once in the plinth mirror); the 11-ring mirror catches light; the deep break 8.93–9.50 is the wind-up | the case's front glass plane reaches the lens (one reflection streak) | air pulls back in the break | the case spot from above |
| 4 | TITLE · 9.500–11.764 | 1.2 → 2 m, backing out through the front glass, the sword small and low in frame | 「越王勾践剑 / 真的没锈吗？」 etched on the glass, slam contact on f285 (scale 1.10 → 1.0, damped jolt, no flash), held 2.26 s, slides out with the glass | the glass passes behind the lens; the camera keeps backing and starts to arc | glass shimmer 9.500 on the drop | case spot; title frosted, never brighter than the sword's highlight |
| 5 | S1 · 11.764–16.293 | 2 → 4 m, orbiting 90° round the case to the pommel end; ~45° lens, field ~5 m | a dark hall, faceless one-tone visitor silhouettes at the rope, the lit case in the middle | the orbit ends exactly on the sword's axis behind the pommel (director 10: no yo-yo) | murmur of the hall, low | case spot; hall falls off |
| 6 | S3 · 16.293–20.821 | 4 m → 3 cm, pushing along the sword's axis from the pommel side, through the glass; field 1.5 m → 4 cm | on the lull hit 18.557 a silvery sheen washes along the blade and 「镀铬？」 hangs beside it (question tag, never mocked); the push ends with the **11 concentric rings filling the frame** | **Match 2** (20.821, the dive): the camera falls through the ring centre; the rings grow and harden into the stepped rim of a tomb shaft seen from straight above | sheen chime 18.557 · crash on 20.821 | case spot, then the rings lit from the top-left |
| 7 | S4, D1 · 20.821–28.746 | falling straight down; scale ×100–250 (4 cm of rings → a 4 m shaft mouth) on a constant log-zoom; the fall slows to a hover 6 m above the rim | stamp rolls 2026 → 1965 on its own clock; snow starts; the half-dug canal, workers' silhouettes with spades and a lamp, more shaft mouths (the tomb group) | the camera sinks into one shaft; its walls become the section face | wind and snow from 20.8 · spades | grey winter daylight from above; the workers' lamp is the warm accent |
| 8 | D2, D3 · 28.746–36.104 | inside the emptied shaft, pitched ~62° down, sinking at ~1.2 m/s, field ~4 m at the floor | the walls stream upward (near walls smeared): mottled 五花土 courses, 青灰泥, then the pale 白膏泥; the survey pole on the far wall; **depth tag 0 → 8.8 m**; bands unbroken all the way (从没被盗) | reaching the chamber roof at 36.104 (8.8 m), the pitch eases up as the walls open into the chamber | earth rumble 28.7–36 | the diggers' two lamps at the bottom, warm, the only light |
| 9 | D4, D5 · 36.104–43.463 | eased tilt from the shaft into the chamber: camera 4.5 m in front of and 4 m above the chamber floor, looking down at 3/4; then settling top-down 0.6 m over the open inner coffin on DA(17) 38.935 | the 椁 roof lifted on 36.104, the outer lid on DA(16) 36.670 (tag ①), the inner lid on 37.803 (tag ②), two one-tone excavators lifting it; **depth tag reaches 10.8 m at the 椁 floor**; then the faint line outline of the occupant, the black lacquer sheath at its left beside a bronze knife; on the bar-15 fill (41.199) a gloved hand lifts the sheath and water rinses it | the draw on 43.463: the sword comes out along the lens and the camera rides it | lid lifts ×3 · water rinse 41.2 | the hurricane lamp hung over the pit (one key), rim light on the figures |
| 10 | D6, I0, I1 · 43.463–56.482 | 5 cm above the blade, top-down, riding the draw to the guard (pommel to the right), then gliding guard → tip (right → left) at ~3 cm/s; field ~25 cm | a cold flash runs down the blade on f1304; the inscription passes: 越王鸠浅 in the lower row read from the guard, glyph pairs lighting per half-bar from 47.991; the 1966 letters (vertical red-framed envelopes) fly in the polish, 「40多封信」 counting per beat; **鸠浅 ＝ 勾践** resolves on DA(24) 54.784 under the 3rd–4th marks | **Match 3**: the glide reaches the edge near the tip and the camera rolls 90° to look along the cutting edge; the tomb's dark becomes the dark of a film set | sword draw ring 43.463 (tuned to F) · paper flutter 48–55 | the lamp, then the blade's own cold sheen |
| 11 | B1 · 56.482–61.577 | profile along the edge, then a short crane up to a 3/4 view from the front-right, 3° roll; field ~40 cm | the film light clicks on at DA(25) 57.048; the clapper 「古剑 1977」 at 58.180; the blade passes through the stack on DA(26) 59.312: 20多 of 30多 sheets cut, the bracket counts; halves fall in the break 61.01–61.58 | the film light falls across the flat of the blade; the camera turns from the edge to the flat and pushes in | clapper 58.18 · paper slice 59.31 | the film light (hard, from the right) |
| 12 | M1, M2, M3 · 61.577–75.162 | macro push into the flat of the blade: field 10 cm → 1 cm → 1 mm → ~0.1 mm (×1000), skimming low with the horizon held at ~y 380 for the subtitle | the bar 「原因之一：料好」 (铜 · 锡 约18–20% · 铅 ≈ 0) lands on DA(28) 63.841 and leaves before M2; 「镀铬？」 returns on 66.105; a **section cut opens at the edge of one pale diamond** on 67.237: thin bright tin skin over the cast bronze body, bare at the dark lattice line; 「热镀锡 · 2025研究」 lands beside 「镀铬？」 on DA(30) 68.369 (never struck, it is simply left behind by the push); the push carries past the cut onto the pale skin; M3 hush 70.633: the camera drifts to a stop, the light dims to one warm key; 74.412–75.162 one slow breath, no event | the hardest drop lands on the same frame (no camera change on the hit) | deep low tone 61.6–70.6 · silence from 70.6 (keep 74.41–75.16 clean) | raking warm key; one dimmed warm key in the hush |
| 13 | T1, T2 · 75.162–81.954 | holding at the deepest scale, then easing back a notch (field ~0.1 → 0.5 mm) | the first olive bloom **on f2255**, the 2nd on 75.728, the 3rd on 76.860, each with a thin cream find-ring; faint grey dulling around them; T2: they shrink to specks next to a thin scale bar | **Match 4**: one bloom's find-ring widens and becomes the round mouth of the sheath as the zoom pulls out (×1000 → ×1) | the drop + a tiny crackle on 75.162 (tuned to E) | warm key back on the drop |
| 14 | T3, E1 · 81.954–90.445 | fast pull-out from the sheath mouth to 0.6 m over the inner coffin, then rising to 2 m above it, looking down | ◀◀ rewind from 81.954: the sword slides back into its sheath and settles at the outline's left on the arrival 84.219; stamp rewinds 1965 → 战国中期; E1: the chamber seen as a dark cutaway, the tomb's other swords light one per half-bar from 86.483, the 勾践 sword the brightest | the camera keeps rising and arcs round (≤ 25 px/frame at the frame edge) to face the cut-away section from the front | rewind whirr 81.95–84.2 · key-change arrival 84.219 | the sword's own glow in the dark chamber; the others dimmer |
| 15 | L1 · 90.445–95.540 | in front of the section face (the cut plane; the camera never on the solid side), pulling back as it rises; depth on an ease-in clock 10.8 → 6.9 m at 93.5 → 0 at 95.54; field 2 m → 7 m | each layer closes over the sword and is named as it closes, one per beat from DA(40): 剑鞘 91.011 · 内棺 91.577 · 外棺 92.143 (one label 「两层棺」 forked to both) · 木椁 92.709 · 白膏泥 93.275 · 夯土 93.841; pale air dots drift down through the fill, almost all bounce off the white clay, **two get through** to the blade and leave the faint specks from T2 | **Match 5** (95.540): the topmost fill layer closes flat and becomes the museum floor as the camera breaks the surface | layers closing thud ×6 on the beats · air ticks | a soft top light on the section; the sword's glow brightest, fading a little as layers close |
| 16 | R2, R3 · 95.540–102.332 | rising up from the floor into the case from below, then 5 cm over the blade | stamp runs 1965 → 2026; a soft brightness gauge beside the blade slips a little, the gleam dulls a shade; R3: the perfect case (clean light, still air, the climate panel glowing, no numbers) and still one faint dull bloom on the bronze | the camera starts backing out on P1 (102.332) along the same line it came in | soft hall air · lift 97.8 | the case's clean top light |
| 17 | P1, AIR · 102.332–109.125 | 5 cm → 3 m, backing out through the front glass, then on until the camera holds **frame 0's framing** (the KF01 camera) | the glass's reflection fills the frame and **resolves into your kitchen by DA(47) 106.861**: the night window, the rack, your cleaver lying on the sword's own edge line, tip to tip; as the camera keeps backing the kitchen becomes real and the sword becomes only a faint glow in the window; AIR 107.993–109.125: the kitchen holds, the glow fades last | none: the card lays over this held frame | glass shimmer 102.3 · kitchen hum fades in · dead stop before the card | case spot handing over to the kitchen's under-cabinet light (Match 6) |
| 18 | END · 109.125–113.633 | held (frame 0's framing, dimmed to ~30 %) | the red J stamp presses on 109.125 (f3274, complete on its frame); the title (gold, two rows) +0.35; the question 「你第一次见到它，是在哪？」 (76 px, one row, ？ pulled back ½ em) +0.7; the pill 「关注 Juno · 一起看懂世界」 by +1.2; the sources line +1.3; 4.0 s; then the film ends with a 0.5 s fade (113.125–113.633): the end of the film, not a transition | — | J seal 109.125 (B♭ / F) | none (dimmed) |

**Transitions, all inside the one move:** 1 knife edge → sword edge (match on the edge line) · 2 the guard lifts the
camera · 3 out through the front glass (the title rides it) · 4 orbit into the axis · 5 rings → shaft rim (Match 2) ·
6 shaft walls → section face → tilt into the chamber · 7 ride the draw · 8 roll to the edge, tomb dark → film-set dark
(Match 3) · 9 edge → flat of the blade → macro push · 10 the drop on a held frame · 11 rust ring → sheath mouth
(Match 4) · 12 rise and arc to the section front · 13 top fill layer → museum floor (Match 5) · 14 rise into the case and
back out along the same line · 15 glass reflection → your kitchen (Match 6) · 16 the card over the held kitchen.

**Path symmetry:** legs 6–10 go down (glass → pommel → shaft → layers → coffin → blade); legs 14–17 come back up the same
path (coffin → layers → surface → floor → case → glass → kitchen). The way down shows the layers without naming them; the
way up names them.

## Key frames on the path (rendered from `KF53B-ALL`)
| KF | Name (film time) | Leg | What it proves |
|---|---|---|---|
| 01 | `01_H1_0.0` | 1 | frame 0: both halves (rusting knife near, bronze glint far on the same line), subtitle on frame 0 |
| 02 | `02_H1_1.6` | 2 | Match 1 complete by 1.575: the lattice fills the frame |
| 03 | `03_TITLE_9.6` | 4 | the title on the case glass, the sword still the brightest |
| 04 | `04_S3_18.6` | 6 | the axis push from the pommel side; 「镀铬？」 as a question tag |
| 05 | `05_D2_29.9` | 8 | the descent geometry: inside the shaft, section face, depth marks (no years on soil) |
| 06 | `06_D4_37.9` | 9 | lids lifted (① ②), the camera outside every lid, 10.8 m |
| 07 | `07_D6_43.5` | 9→10 | the draw out of the washed black sheath, pommel to the right |
| 08 | `08_I1_54.8` | 10 | 鸠浅 = the 3rd–4th marks of the 越王鸠浅 row, read from the guard; 鸠浅 ＝ 勾践 104 px; 40多封信 72 px |
| 09 | `09_B1_59.5` | 11 | 1977 film set, 20多 of 30多 sheets cut, counted on the picture |
| 10 | `10_M2_68.4` | 12 | the section cut: tin skin under the pale diamond only; the two tags side by side, 「镀铬？」 unstruck |
| 11 | `11_T1_76.9` | 13 | three tiny blooms on the bright lattice: rust, but not a rusty sword |
| 12 | `12_L1_93.5` | 15 | every layer named on the section; the air bounces off the white clay; two dots reach the blade |
| 13 | `13_P1_106.9` | 17 | the loop closes: the sword in its case and your cleaver (in the glass) on one edge line |
| 14 | `14_END_110.6` | 18 | the Juno end card, ep51 layout, 4 s |

Legs 3, 5, 7, 14 and 16 have no key frame yet.

## The three riskiest legs and how to prove them
1. **Leg 7, the dive (20.821–24.2): rings → shaft rim, ×100–250, no key frame.** Risks: it reads as a zoom-dissolve
   (two sets of concentric shapes half-visible at once), it strobes on a phone, or the 2026 → 1965 roll fights the
   subtitle. Proof before the full build: render 20.5–24.5 s as a 1-frame-step contact sheet plus a 360 p phone clip.
   Pass if (a) every frame shows exactly one set of concentric shapes at full opacity (the rings harden into steps, never
   cross-fade), (b) the scale changes on a constant log rate (the ring spacing at the frame edge grows smoothly, no frame
   jumps more than 1.08×), (c) the snow and the dig fade in only after 22.5 when the rim is recognisable.
2. **Legs 14 → 15 (81.954–95.54): the rewind, the rise and the arc into the cut-away, no key frame between KF11 and KF12.**
   Risks: the switch from a top-down coffin to a front section reads as a jump; the camera passes a lid or the cut
   plane while the layers close; the sword gets too small to read on a phone (KF12: ~110 px long). Proof: stills at 81.95,
   83.0, 84.22, 86.5, 88.5, 90.45, 91.0, 92.2, 93.5, 95.0 and a geometry check per frame that the camera stays on the open
   side of the cut plane (y < 0) and above every lid while it is open; a 25 % sheet of the same stills: pass if the
   gold sliver and its glow are visible at every step and the 4 labels never overlap.
3. **Leg 17, P1 (102.332–109.125): the reflection becomes the kitchen.** Risks: double-exposure mush; two knives or two
   swords on screen during the hand-over (QUALITY_BAR); the end framing missing KF01 by a few pixels so the loop does not
   close. Proof: stills at 102.3, 104.5, 106.86, 107.5, 107.99, 109.1; check that the cleaver's screen box is continuous
   from the reflection to the real knife (one knife, moving on its own line), that the sword is never drawn twice, and
   that the frame at 107.99 differs from KF01 only by the dimmer sword glow and the extra rust (pixel diff on the knife).

## Build notes for the animator
- Reuse `parts53` (Frame53, Sub53, Stamp53, Tag, DepthTag, Cam), `macro53` (BladeMacro), `sword3d` and `props53`; every
  key-frame component is a pose of the same geometry, so the film is the camera interpolated between them.
- A hit is complete on its frame (`frameOf(t) = Math.round(t·30)`): the title, each bloom, each layer close, the seal.
- On their own clock: camera travel, snow, the depth tag, the letters, the year rolls, the air dots, the gauge.
- Nothing pulses on the beat except the thing that appears. Camera moves ≤ ~25 px per frame at the frame edge, except
  the eased constant-rate zooms of legs 7, 12 and 14, which are proven by the strip test above.
