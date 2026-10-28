# Owner-override direction: E 心里的天气 · 小星球 (tiny planet)

One additional new look direction for ep52 (为什么一到深夜就emo), built alongside — not replacing —
the existing A/B/C looks in `style/looks.md` (夜灯手账 / 诊疗观测室 / 信号故障). This direction is a
single fourth option for the owner to compare against those three.

## Pitch

- **World/metaphor:** a tiny round planet adrift in deep night space — Little-Prince-*feeling* only
  (a small private world you can see the whole curve of), never a copy of the book. On it, small
  rounded clay/vinyl-toy figures and props act out each beat: a bed, a storm cloud, a cracking dam,
  a rotating 24-hour ring, a stylised Earth. Soft key + rim lighting, gentle contact-shadow AO,
  shallow-feeling depth via fog falloff, a scatter of distant stars.
- **Why it fits:** "深夜emo" is a small, private, enclosed feeling — a tiny self-contained world you
  sit on alone at 2am is a literal image of that enclosure, and letting the camera pull back to see
  the *whole* planet (CLOCK beat) and then the whole Earth (DROP beat) mirrors the film's own move
  from "just you" to "measured at planetary scale."
- **Mood:** dark and aesthetic, not flat and not neon-city — deep navy/plum space, warm clay-toy
  accent colours only on the key objects (phone, storm, leak, tweet-dots), everything else recedes
  into soft shadow. Must NOT look like: a flat 2D illustration, a neon cyberpunk skyline, or a literal
  human silhouette cutout — the figures are always small, rounded, toylike 3D volumes with visible
  light falloff, never flat shapes.

## Palette (hex)

| Element | Hex | Notes |
|---|---|---|
| Deep space background | `#05060c` | scene background + fog colour on every frame |
| Planet base (navy-plum) | `#2a3660` | main planet sphere, all 4 frames |
| Planet hill/ground patch | `#323e68` | slightly lighter patch where props sit |
| Day-side sliver (warm plum) | `#4a3f66` | faint warm cap opposite the night side, HOOK/CLOCK |
| Hoodie (character, main) | `#d27f3c` / `#db8f4c` | oversized hoodie clay tone |
| Skin/body (character) | `#e7a85a` | round head + torso base tone |
| Phone glow (key light) | `#8fd8ff` core, `#bfe8ff` screen | the dominant light source in HOOK |
| Mood-cloud (dark, forming) | `#241a3a` | small puffs above the character's head, HOOK |
| 杏仁核 storm / alarm | `#ff5a3c` core glow, `#ffb23c` bolts, label chip `rgba(60,15,20,.62)` text `#FF8F6A` | BRAIN left |
| 前额叶 dam / brake | `#6a7aa8` dam body, `#8fd4ff` leak glow, label chip `rgba(15,35,55,.62)` text `#8FD4FF` | BRAIN right |
| 24h ring (CLOCK) | `#cfd8ff` ring, night-wedge `#8250ff` | thin ring + brighter violet arc over the night half |
| Mood-meter needle | `#e7a8ff` / emissive `#aa6aff` | dips toward the night side, CLOCK |
| Earth ocean (DROP) | `#16294a` | base sphere |
| Earth land (DROP) | `#3f6b42` | continent blobs |
| Terminator glow (DROP) | `#ffd98a` | thin ring sweeping the day/night edge |
| Tweet-dots: day / night | `#ffd98a` (warm) → `#8fd4ff` (cool) | colour = sentiment, per fact #9 |
| Gold accent (engine, subtitle keywords + corner mark) | `#D4AF6A` | unchanged series engine colour |
| Subtitle scrim | `rgba(6,8,13,.80)` | unchanged series engine value |

## Materials / lighting recipe

- **Clay/vinyl-toy material:** `THREE.MeshStandardMaterial`, `roughness` 0.55–0.7 for toy-plastic
  surfaces (character, bed, dam), 0.85–0.95 for the planet/ground (chalkier, less specular),
  `metalness` ~0.04–0.05 everywhere except the phone body (0.3, slightly harder) — keeps the whole
  world reading as soft matte toys, not glossy plastic or metal.
- **Key + rim light setup (shared across frames):**
  - `DirectionalLight` "moon key" `#aab8f0` intensity ~1.0–1.1 from upper-left-front — the cool
    ambient "moonlight" that reads the whole scene.
  - `DirectionalLight` "rim" `#6a7ad0` intensity ~0.8–0.9 from behind/opposite side — separates
    subjects from the black background with a cool edge-light.
  - Scene-specific **practical key lights** carry the emotional point of each frame: the phone's
    `PointLight` (`#9fd8ff`, intensity ~6.5, tight falloff) in HOOK is the dominant light on the
    character's face; the storm's `PointLight` (`#ff5a3c`, intensity 5.0) and the dam-leak's
    `PointLight` (`#8fd4ff`, intensity 2.2) carry BRAIN; the sun `DirectionalLight` (`#ffe9c2`,
    intensity 1.3) carries DROP's day side.
- **Fill / AO:** `AmbientLight` `#2a3360` ~0.6–0.75 and a `HemisphereLight` (sky `#4a5690`/
  `#3a4a80`, ground `#0a0812`) ~0.4–0.55 keep shadow sides readable without flattening the look;
  a semi-transparent dark `CircleGeometry` disc (`opacity` ~0.32) sits under the bed/props as a
  cheap contact-AO shadow since real shadow-mapping reads too hard at this scale.
- **Depth of field (implied, not a true post-process lens-blur in this static-frame pipeline):**
  `FogExp2` on the scene (`#05060c`, density 0.008–0.012) softens distant stars/edges, standing in
  for shallow DOF falloff; camera FOV kept narrow (32–42°) so perspective stays gentle/toylike
  rather than wide-angle distorted.
- **Tone mapping:** `ACESFilmicToneMapping`, exposure 1.2–1.35 (boosted up from three.js defaults —
  the raw scene reads too dark otherwise; this was the single biggest fix needed to make the "dark
  and aesthetic" direction actually legible rather than a black frame).

## Character design sheet: original chibi (NOT Little Prince)

- **Proportions:** one oversized round torso (sphere, squashed 0.9–0.95 on Y/Z) + one round head
  (roughly 60–65% of torso diameter) sitting directly on the shoulders — no visible neck, no limbs
  drawn except the one arm holding the phone. Chibi/toy proportions, not anatomical.
- **Hoodie, not hair:** the "hood" is modelled as a separate shell (a partial sphere sitting slightly
  behind and above the head, same hoodie-orange material as the torso) so it reads unambiguously as
  an oversized hoodie hood, not a hairstyle. Two short rounded drawstring capsules sit at the chest.
  No cape, no scarf, no robe folds.
- **Face:** two plain dot-eyes only (small dark spheres), no nose, no mouth, no eyebrows — keeps the
  character squarely in "soft toy" territory and avoids any realistic-anatomy concern.
- **Palette:** warm orange-clay hoodie (`#d27f3c`/`#db8f4c`) over a lighter warm skin-clay tone
  (`#e7a85a`) — warm colours chosen specifically so the cool blue phone-glow in HOOK reads as an
  obvious temperature contrast lighting the face from below.
- **Explicitly avoided (per brief):** no blond curly hair (there is no hair at all — only a hood),
  no long scarf, no green suit (hoodie is warm orange, not green, and has no tailored suit silhouette),
  no rose/glass dome, no fox, no baobab trees. The world is a bare navy-plum planet with a bed/storm/
  dam/ring on it, not a desert-planet-with-flower.

## Per-frame notes — how each image explains its line without reading it

**(a) HOOK — 凌晨两点 (0.00–1.67s), `a_hook.html`/`.png`**
The planet sits mostly in shadow (deep navy, a faint warm sliver opposite = "half in night"); the
character sits up in a small bed built onto a hill patch on the planet's near side. The phone, held
low and angled up, is the single bright light source in the frame — its cool glow is the only thing
lighting the character's face/head from below (two additional point lights: a broad `phoneLight` and
a tight `chinLight` aimed at the jaw). A small dark, rounded storm-cloud shape already floats just
above the character's head, foreshadowing BRAIN before any text explains it. Reading order: dark
world → one lit bed → one lit face from a glowing rectangle → a small dark cloud already forming
overhead — "awake, alone, lit only by the phone, something building" reads without the subtitle.

**(b) BRAIN — 杏仁核在报警，前额叶的刹车松了 (30.86–32.82s), `b_brain.html`/`.png`**
Two built objects sit on the same ground platform, on the same tiny planet, with the character
standing between them looking up: on the left, a dark storm cloud labelled 杏仁核 with a glowing
orange-red alarm core and jagged lightning bolts shooting outward/down — reads as "alarm going off."
On the right, a boxy dam/levee labelled 前额叶 with a visible jagged dark crack running down its face
and a bright cool leak spilling through the crack into a small puddle below — reads as "the thing
that holds it back is failing/leaking," independent of the caption. Putting both on one shared
platform with the character physically between them (rather than two separate panels) makes "one is
too loud, the other can't hold it back, at the same time, in the same place" a single legible image.

**(c) CLOCK — 情绪也会被生物钟拖下去 (57.26–59.93s), `c_clock.html`/`.png`**
Camera pulls back to show the whole tiny planet for the first time (previously we were close on the
bed/ground patch). A thin 24-hour ring with tick marks encircles the planet; a brighter violet arc on
that ring marks the night-time wedge. The planet itself is split warm (day, sunlit side) / cool-dark
(night side), with thin rain streaks falling only over the night hemisphere. A small mood-meter
(a needle on a little stand, placed near the terminator) is drawn tilted sharply downward on the
night side — a literal "the needle points down specifically where the ring says it's night," so the
causal link (clock-position → mood dipping) is legible without reading the line. A dashed motion-arc
drawn in the HTML (not WebGL) around the whole planet implies the slow rotation/orbit.

**(d) DROP — 5亿条真实推文也测到了 (86.13–88.80s), `d_drop.html`/`.png`**
Camera pulls back further to a full stylised clay Earth (ocean base + six continent blobs placed by
real lat/lon so they sit roughly where N. America, S. America, Europe, Africa, India and wider Asia
actually are). A night cap + a thin gold terminator ring mark the day/night edge, with faint rain
streaks only over the night hemisphere (visually rhyming with the CLOCK frame's rain-on-night-side).
Roughly 160 small glowing dots are scattered across the whole globe's surface — warm gold on the day
side, cool blue on the night side — reading as "thousands of individual data points, and their colour
literally flips as night crosses them," i.e. sentiment-by-time-of-day at planetary scale. An on-screen
counter chip (top-left, clear of both the Douyin-watermark corner and the subtitle zone) reads
"5.09亿条 · 真实推文 · day→night sentiment" reinforcing the number as a real, large dataset rather
than an illustration-only claim.

## Honest limitations / what I could not fully verify in this pass

- **Continent recognisability:** the brief asked that US/Europe/India read as "recognisable shapes."
  At the rendered scale the six continent blobs are placed at correct lat/lon and are legible as
  "a world made of continents," but they are soft clay blobs, not crisp coastline silhouettes — a
  next pass could swap in real simplified coastline geometry (extruded SVG outlines wrapped onto the
  sphere) if the owner wants tighter geographic recognisability.
- **BRAIN frame density at a distance:** the storm/dam pairing reads clearly as two objects with the
  character between them, but the dam's crack-and-leak detail is small relative to the full 1920×1080
  frame; a tighter camera crop on just the dam (for the key-visual beat specifically, separate from
  this establishing angle) would read the "cracking/leaking" idea more forcefully if this becomes the
  chosen direction for a full storyboard.
- **CLOCK frame rain density:** rain streaks on the night hemisphere are present but sparse at this
  distance (camera pulled back to show the whole planet) — a closer pass or a second, tighter CLOCK
  shot would make "rain falls only on the night side" unmistakable rather than a detail you have to
  look for.
- These are noted as honest open items for the next iteration, not hidden — per the per-frame-look
  budget for this task (look at the rendered sheet once), I did not re-render to chase every fix.

## WebGL rendering note (important for whoever re-renders this folder)

The shared `production-crew/scripts/render_html.py` (default Playwright Chromium launch) produces a
**black canvas** for these three.js/WebGL frames in this sandbox — headless Chromium here has no real
GPU, and more importantly the default WebGL context does not `preserveDrawingBuffer`, so by the time
Playwright takes its screenshot the drawn frame has already been cleared. Per the task instructions I
did not edit the shared script. Two things fixed it together:
1. Every `THREE.WebGLRenderer` constructor in these 4 files passes
   `{ antialias:true, preserveDrawingBuffer:true }` — this is the actual fix; without it the canvas
   reads back as solid black regardless of launch flags.
2. `style/planet/render_planet.py` — a small standalone Playwright script (not a modification of the
   shared one) that launches Chromium with `--use-angle=swiftshader`,
   `--enable-unsafe-swiftshader`, `--ignore-gpu-blocklist`, `--disable-gpu-sandbox`, and waits ~1.8s
   before screenshotting. In isolated testing, plain default-launch Chromium could already create a
   working WebGL2 context (`WebKit WebGL | WebGL 2.0 (OpenGL ES 3.0 Chromium)`) on this machine, so the
   swiftshader flags were not strictly the blocking factor here — `preserveDrawingBuffer` was — but
   the flags are kept in `render_planet.py` as the safer, more portable default per the task spec, in
   case a different machine's default GL path is less forgiving.

Usage: `python3 style/planet/render_planet.py style/planet/a_hook.html style/planet/b_brain.html style/planet/c_clock.html style/planet/d_drop.html`
