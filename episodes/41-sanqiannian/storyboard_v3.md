# Storyboard v3 · 《为了跟你说一句话，人类努力了三千年》

Art director, 2026-10-24, reconciled to `script_v3.md` (beats + line times), `facts.md` (rows cited as #) and the
Bell prototype `src/qq/s41bell.tsx`.
- Scene windows are from `brief_v3.md`. Film times are in seconds.
- ⚑ = a fact still PENDING.
- **PROPOSED CHANGE TO SCRIPT** marks where the board departs from the script, so the director can rule.

The look is fixed: flat one-tone silhouettes, layered parallax era worlds with gradient skies, warm practical lights
and Chinese subtitles at the bottom. Build: Remotion SVG/HTML only (no three.js); Voyager comes from `voyager.tsx`.

---------------------------------------------------------------------------------------------------------------------

## 0. Owner notes → what changes on screen

| # | Owner note (v2) | v3 fix (shots) |
|---|---|---|
| 1 | Western envelope in 757; floating city | No envelope anywhere. The Tang letter is folded paper tied with a cord (D4); the 1825 letter is a folded, wax-sealed sheet (MO2). Every building is an item on its own layer's ridge (`v3base.Layer`), and every ridge is overlapped by the next one (§2.3). |
| 2 | Boring opening | Frame 0 is a phone calling 妈, already moving. We dive into the earpiece and race back along a wire through the eras to Bell's window, then freeze (C0–C2). |
| 3 | Rewind | One bar (9.30–11.564) of VHS ◀◀ REW: 6 flashes, the year counter running back, tracking noise, then ▶ PLAY (R1). |
| 4 | Two-tone figures | `Figure4` one fill; no lighter far limbs, no seams. Rims ≤ 0.3 on the lit side only (§2.2). |
| 5 | Junk tape | There is no paper tape. Morse = the key and gold pulses on the wire. |
| 6 | Bell static | One man, one room, push in, shout, through the funnel into the wire, out at Watson's receiver, and Watson arrives at Bell's door (B1–B6, = `s41bell.tsx`). |
| 7 | Silent caption | Every story subtitle is voiced (script). Only titles, labels and in-world tags are silent. |
| 8 | Marconi | Poldhu sends S = · · · → across the Atlantic → the kite lifts the aerial → Kemp hears three short sounds (M1–M4). |
| 9 | ARPANET | Kline sits at the teletype with a telephone headset from his first frame. Lamps are on the panels, troffers in the ceiling (A1–A4). |
| 10 | 1977 | Ann dials → along the line to Tucson → the message slip → shot/reverse shot → the split closes on "Yes." → the record cut → the launch (V1–V5). |
| 11 | Finale | Voyager is drawn in detail in space. The people stand on a hill on Earth under the Milky Way (O1–O3). |
| 12 | 运镜/转场 | 15 hand-overs, each a different motivated move (§3). |

## 1. Look

**Motif.** The "sentence" is always gold `#F2CF7A`. That covers:
- the call's light (C0) and the crack glow;
- the pulses on the wire and Bell's voice ripples;
- the S sounds and the chalk line;
- the LO/L letters' glint;
- the email's light line and the 1977 phone line;
- the Golden Record.

Everything else is the era's own palette.

**Must NOT look like:**
- clip-art (every frame has ≥ 3 depth layers, one practical light and atmosphere);
- icons on a starfield;
- slide-show pop-ins;
- figures with a second tone, visible joints or bright rim lines;
- anything floating;
- any prop from the wrong era (no envelope, no floppy, no Eiffel Tower, no cast-iron Capitol dome, no 350 MILES).

**Palettes (hex).** The figure is the darkest value. The brightest band of sky sits behind its head and torso.

| Era | Sky (top → horizon) | Layers far → near | Practical light | Figure |
|---|---|---|---|---|
| Today (C0) | street night `#0A0C16 → #1A2240` | LED streetlights `#E8F0FF`, phone screen `#0E1A14` | screen glow `#7CF0A0` (call button), ring `#F2CF7A` | hand `#05060A` |
| Through the eras (C1) | `#0B1230 → #2A2E50` | LED `#E8F0FF` → neon `#FF4A8A` / `#4AE0FF` → sodium `#FFB45A` → gas `#FFD58A` | — | — |
| 1876 Boston dusk | `#0B1230 → #1E2A55 → #4A4F7E → #8E7A96` | roofs `#1A2142` / `#121833` / `#0A0E22` | window `#FFC56E`, moon `#F3EBD2` | `#0A0C18` |
| Bell rooms (plates bellA / bellB) | — | lit wall `#6B4A2E` → `#3A2616`; Watson's room cooler `#4A3A30 → #22180F` | kerosene lamp `#FFC56E`, hall light `#FFDCA0` | `#1A120C` / `#10121A` |
| 商 pre-dawn | `#070A1C → #1B1838 → #4A2C3E → #B5653A` (east = right, brighter) | `#2B2238` / river `#3A3456` / `#1C1528` / `#120D1C` / ground `#0B0812` | fire `#FF9B2E` + `#FFE08A`, shell `#D9C49A` | `#0A0710` |
| 757 dusk | `#2A1D3A → #6E3346 → #C8604A → #F0A868`, sun `#FFD9A0` (left = west) | `#7A3A46` / `#6A3446` / `#4A2433` / `#2A141E` / `#1D0F16` | beacons `#FFC06A`, smoke `#4A2A36`, blossom `#F4A6B8` | `#120810` |
| 1825 winter | day `#5E6E86 → #9AA6B5 → #D9D4C8`; dusk `#3E4A62 → #8C8FA6 → #D4B9A0` | `#B6BECB` / `#39424E` / `#4A5260` / snow `#DDE2E8` | windows `#FFC97A`, wax `#B3261E` | `#151A20` |
| 1844 May | `#3F78B5 → #9CC3E3 → #E9E2CC` | `#7D9A86` / `#5E7F66` / `#3F5A45`, poles `#2A2A24`; Capitol room `#D8CDB4`, columns `#B9AC90` | pulses gold | `#1A1E1A` |
| 1860 Paris night | `#070B1E → #1B2348 → #33406B` | roofs `#10142C`, Notre-Dame `#0C1024`; room `#2B2F4A` lit `#6E5A3E` | oil lamp `#FFCF8A`, gas `#FFD58A`, moon `#F6EFD6`, trace `#F4ECD4` → `#BFE9FF` | `#07080F` |
| 1901 Poldhu sunset | `#1E2340 → #6A4A6E → #E07A4A → #FFC27A` | sea `#2A2F4A` + glitter `#FFB070`, cliff `#141826` | spark `#CFEFFF`, rings `#9FE8FF` | `#0B0E16` |
| 1901 Signal Hill | `#2A323F → #4A5868 → #7D8B96` | swell `#3A4058` / waves `#2A3048` / foam `#9FB4C4`, hill `#141A22`, snow patches `#C9D2DA` | candle `#FFCF8A`, grey daylight `#9AA8B4` | `#0E1216` |
| 1969 UCLA / SRI | ceiling `#16302C`, walls `#1F3C37`; SRI walls `#2E2C3C` | cabinets `#3A4A4E`, panels `#0D0E12`, floor `#0B1414` | lamps `#FFCF6A` / `#FF6A4A`, troffers `#E8F4EC`, paper `#E8E2D0` | `#0A1212` |
| 1987 Beijing | window night `#0C1020 → #1E2440`, day flips `#6E9BD0` | wall `#2E2A3A`, roofs `#1A1E30`, Wall `#222842` | tube `#F2F6E8`, CRT `#8DFFAE` on `#031008`, calendar `#F4EFE4` / `#C8281E` | `#0B0A12` |
| 1977 night | `#0B1024 → #1F2A50`; Tucson desert `#141026 → #3A2A4A` | city `#121830`, saguaros `#0E0A16` | lamps `#FFC48A` / `#FFB870`, moon `#F6EFD6` | `#0B0910` |
| 1977 launch morning | `#2A4A7A → #7FB2E0 → #E8D8C0` darkening upward to `#04050C` | pad / ground `#2A2A30` | plume `#FFF4D8` → `#FFB04A` | rocket `#E8E6E0` / `#2A2A30` |
| Space | `#04050C` + `MilkyWay` | — | Sun: hard key from the left | — |
| Hilltop | `#05040C → #14123A → #2E2A5A`, glow `#5A4A7A` | hill `#07060C` | Voyager point `#FFF4D8` | `#050409` |

**Type.**
- **Titles:** Noto Serif CJK SC Black (white line 1, gold line 2).
- **Subtitles:**
  - Chinese: Noto Sans CJK SC Bold 60 px, white, key words gold, baseline y 940.
  - Native line: Cormorant Garamond Italic 36 px `#E8E4DA` at y 872. Classical Chinese native lines use Noto Serif CJK SC 36 px instead.
  - Both sit on a feathered scrim (blur 34, `#06080D` @ 0.5).
- **Era label:** top-left, the brief's owner-approved format. Red dash `#E0453A`, year Noto Sans CJK SC Medium 28 px, name Noto Serif CJK SC Black 44 px. It leaves 0.4 s before every transition.
- **Corner mark:** top-right.
- **In-world text:** DejaVu Sans Mono.

**Light.** Every light sits on its object: panel lamps on the panels, troffers in the ceiling, flames on wicks. The
hero is the brightest readable thing in the frame. Moons are textured (maria `#D9CFB2`, halo ≤ 0.18), never a white
disc.

**Moon phases (computed).**
- 9 Apr 1860: waning gibbous, 91 %, lit on the left.
- 10 Mar 1876 (evening, #P-B1): full.
- 12 Dec 1901: new.
- 20 Sep 1987: 11 % crescent, not up in the evening.
- 1 Jun 1977 (#V1 ✓): 99 %, full.

## 2. Build rules

### 2.1 Camera (`fx.tsx`)
- **Push/pull:** `Cam zoom` about (`fx`, `fy`), easeInOut, one move per phrase.
- **Tilt/crane:** `Cam py` with parallax.
- **Walker:** the figure stays at x 760; layers slide at f 0.04 / 0.1 / 0.22 / 0.55 / 1.0 / 1.6.
- **Whip:** `Whip` for 5–6 frames.
- **Match cut:** the shapes match within ±10 px and ±5 % in size.
- **Through object:** `Iris` for round mouths.
- **Split:** `Wipe` vertical, 40 px feather.
- **Letterbox:** `Letterbox` at the hits the script names (Bell's door, Beijing's Enter, all of 1977).
- **Shake:** 2–4 frames on hit frames only.
- **No full-frame flashes:** `Flash` only as a ≤ 0.35 tint inside a light-to-light hand-over.
- **Grain:** off or ≤ 0.03.

### 2.2 Figures (`figure4.Figure4`, `v3base.Walker` / `Poser` / `walkToStand`)
- **One fill per figure.** `Rimmed` only where marked "rim", rimOp ≤ 0.3, on the side facing the light.
  - ⚠ The Bell prototype uses rimOp 0.85–0.9: lower it to ≤ 0.3 (owner note 4).
- **Poses blend** (0.4–0.8 s). Walkers stop through `walkToStand`, never freezing mid-stride.
- **Contacts and checks:** contacts declared; `pose_check` PASS.
- **New poses** (FK, same convention as `POSES`):

| Pose | FK spec | Used in |
|---|---|---|
| `carry` | arms `la 40 le 60 ra 40 re 60` over the gait | SH1 |
| `kneelLookUp` | `kneel` + `neck -28`, hands on thighs | SH2 |
| `kneelOffer` | `kneel` + arms `la 160 le 10 ra 160 re 10` | SH4 |
| `paint` | `stand` + `ra 120 re 20`, `la 40 le 70` | MO2 |
| `read` | `stand` + `la 50 le 100 ra 50 re 100`, `neck 22` | MO2 |
| `hatOff` | `stand` + `ra 30 re 90` (hat in hand), `neck 24` | MO3 |
| `key` | `sit` + `ra 60 re 40` | MO4 |
| `singCrank` | `lean 18`, right hand on the crank knob (contact, circling), `la 30 le 60` | S1 |
| `holdUp` | `stand` + `la 100 le 30 ra 100 re 30` | S2 |
| `LEAN` / `STAND` / `TURN` / `HOLD` | as in `s41bell.tsx` | B1–B6 |
| `handOut` | `phoneSit` + `ra 70 re 20` | M4 |
| `listenBent` | `listen` + `lean 25` | M4 |
| `headsetType` | `type` + a **1960s telephone headset** (single earpiece + boom mic, drawn on the head) | A1–A4 |
| `armsCrossed` | `sit` + `la 60 le 120 ra 60 re 120` | BJ2 |
| `handsBehind` | `stand` + `la -30 le 60 ra -30 re 60` | BJ1 |
| `phoneSitWin` | `phoneSit` on a low window seat | V1 |
| `slip` | `phoneStand` with the free hand holding a paper slip at chest height | V2 |
| `holdHand` | `lookUp` + inner hands meeting at one contact point | O3 |

- **Looks** (fixes to `LOOK4`; ⚑ = check against a portrait):

| Figure | Look4 | Notes |
|---|---|---|
| 贞人 | `tunic` calf-length, narrow sleeves (drop `wide`), `legs 'bare'`; **NEW head `cylcap`** (short cylindrical cap over a coiled braid, Fu Hao jade figure); **NEW `apron`** (蔽膝) | — |
| 杜甫 | `robe` = round-collar 圆领袍, **narrow sleeves**, `futou` (soft tails), `beard 'long'`, `build 0.9`, stoop +5° | — |
| 莫尔斯 1825 | tailcoat, `tophat` outside / `short` inside, clean-shaven | — |
| 莫尔斯 1844 | frock coat, `short` | ⚑ clean-shaven? |
| 斯科特 | `coat`, `short`, `beard 'full'` | ⚑ |
| 贝尔 | shirtsleeves + waistcoat, `short`, `beard 'full'` | — |
| 沃森 | `shirt`, `short`, `moustache` | ⚑ |
| 马可尼 | `coat`, `short`, `moustache` | ⚑ |
| 肯普 | `coat`, **NEW `bowler`**, `beard 'full'` | ⚑ Must read as a different man from Marconi at a glance. |
| 克莱恩 | `shirt`, `bowl` + headset | 21, grad student (#A5) |
| 杜瓦尔 (Duvall, NEW) | `shirt`, `short` + headset | — |
| 北京 scientists ×3 | `shirt` + `glasses` (CN); `jacket` stand collar (CN, elder); `jacket` + beard (DE) | Unnamed (#E4) |
| 安 | `dress`, `long` | — |
| 卡尔 | `jacket` over a turtleneck, `short` | — |

### 2.3 Ground rule (owner note 1)
- Every layer is a `Layer` with its own ridge. Its buildings are `item`s at that ridge's `gy`.
- The layer's ground runs down to the frame bottom under the next nearer layer.
- Interiors: furniture legs end on the floor line. On the hill, feet use `hill().yAt(x)`.
- Debug check: draw each ridge in yellow on a contact sheet of every 15th frame. No base may sit above its ridge.

### 2.4 Text zones
- Subtitles: y 820–960.
- Era label: top-left.
- Corner mark: top-right.
- Action: y 120–800.
- In-world tags (S = · · ·, 2008, the chalk, the tape box, the slip) are props, not captions.

## 3. Hand-overs

| # | Time | From → to | Move | Motivated by |
|---|---|---|---|---|
| 1 | 0.8–3.2 | today → 1876 | DIVE into the phone's earpiece, then race back along a wire as the world ages | the call travels back to the first call |
| 2 | 9.30 | cold open → rewind | FREEZE on parted lips + tape stop → ◀◀ REW | the question is posed, so go back for the answer |
| 3 | 11.564 | rewind → title | tape slows → ▶ PLAY; the title is revealed by gold cracks | the tape reaches the beginning; cracks = the first sentence |
| 4 | 16.6–19.4 | title → 商 | TILT DOWN from the sky to the plain | from the heavens to the man asking them |
| 5 | 34.836 | 商 → 杜甫 | MATCH CUT: gold branching cracks → blossom branches | same branching shape; spring |
| 6 | 54.875 | 杜甫 → 莫尔斯 | MATCH CUT on the gallop: Tang courier → 1825 post rider | 1,000 years at horse speed |
| 7 | 70.4–74.0 | 莫尔斯 → 斯科特 | ALONG A LINE: ride the wire; the pulses merge into a waveform → the white trace on soot | from code to the voice itself |
| 8 | 90.845 | 斯科特 → 贝尔 | MATCH CUT on the moon: Paris gibbous → Boston full moon in Bell's window | «Au clair de la lune» |
| 9 | 99.6–101.0 | inside 贝尔 | THROUGH OBJECT: funnel → `WireTunnel` → iris out of Watson's receiver | owner note 6 |
| 10 | 108.2 | inside 贝尔 | WHIP PAN with the running Watson → Bell's door opens | he came |
| 11 | 110.385 | 贝尔 → 马可尼 | THROUGH LIGHT: lamp flame core → Poldhu spark arc | wire → wireless |
| 12 | 127.265 | 马可尼 → 阿帕网 | MATCH CUT: three gold S dots → three amber panel lamps | dots of signal → dots of a machine |
| 13 | 144.165–145.70 | 阿帕网 → 北京 | CRASH (SRI half dies first; silence) → MATCH ON TEXT: printed LO → CRT text | the message picks up where LO stopped |
| 14 | 154.1–161.0 | 北京 → 1977 | CRANE OUT on the hit → the light over the Great Wall → TILT UP, star trails turn backwards (1987 → 1977) → down along a phone wire into Ann's window | the line goes out to the world; the sky turns back ten years |
| 15 | 168.8–172.935 | 1977 → Voyager | SPLIT CLOSES on "Yes." → record cut → launch; the trail arcs off Earth | the call's love goes on the record and up |
| 16 | 178.0–181.0 | Voyager → hilltop | Voyager shrinks to a moving star → TILT DOWN through the Milky Way to the hill | they look up at what they sent |

**PROPOSED CHANGE TO SCRIPT (#14):** the script cites "along a line into 1977". The board adds the backward star-trail
turn before the wire, so the jump from 1987 back to 1977 reads on screen without a line.

## 4. Shots

### COLD OPEN · 0.00–9.30 · H1 0.20–4.70, H2 6.25–8.75

**C0 · 0.00–0.80 · today**
- **Frame:** a smartphone fills ~70 % of the frame at night, moving on frame 0 (slow push 1.00 → 1.06, roll 2° → 0).
  - The screen reads `正在呼叫… · 妈` with a call ring pulsing gold.
  - A thumb has just lifted off the green button.
  - Behind: soft city bokeh `#1A2240`, out of focus.
- **Phone:** a generic slab with a rounded rectangle and an earpiece grille slot at the top. **No brand logos** (owner rule ep14).
- **Text:** subtitle H1a 「人类打出的第一通电话，」 on frame 0.
- **OUT:** the camera tilts to the earpiece slot.

**C1 · 0.80–3.20 · the wire back through time**
- **0.8–1.2:** DIVE into the earpiece grille (zoom ×10, `Iris` through one slot). The voice becomes a gold point of light inside a glass fibre (cyan-white core `#CFF6FF`, 0.4 s).
- **Then:** it turns into a copper wire on poles at night. The camera rides the wire fast (locked at y 380, poles whipping past at f 1.6, `Whip` 0.5).
- **The world below ages:**
  - 1.2–1.8: LED streets `#E8F0FF`, glass towers.
  - 1.8–2.4: neon signs `#FF4A8A` / `#4AE0FF`, 1950s cars.
  - 2.4–2.8: sodium lamps, 1920s brick and trams.
  - 2.8–3.2: gas lamps `#FFD58A` and chimney pots: 1876 Boston.
  - Each band is a `Layer` set on its own ground.
  - The year shows small in the label slot: 2026 → 1876.
- **Logic guard:** the wire is a city line (telegraph/telephone poles with crossarms). The camera **leaves** it at the roofs and swoops to the window. Bell's own wire ran only between his two rooms (#B4), so the city wire must not enter his window.
- **Text:** H1b 「第一句话，说的是什么？」 from ~2.6.
- **OUT:** swoop off the wire toward one lit top-floor window.

**C2 · 3.20–9.30 · Bell's window**
- **3.2–5.5:** crane down over the roofs to a brick boarding house's top floor (`#0A0E22`, lit 2-over-2 sash window `#FFC56E`). The full moon is low at right (east), behind the camera's line, so it lights the facade cool.
- **5.5–8.6:** push to the glass and stop outside (zoom → 3.2). A faint moon reflection streaks across the pane.
  - Through it, Bell in silhouette against the warm wall bends over the funnel of the `LiquidTransmitter` (`STAND` → `LEAN`).
  - On the table: the lamp and the battery jars.
- **8.6–9.3:** he draws a breath (chest +1.5 %) and his lips part.
- **Props:**
  - Top floor of a cheap boarding house, evening, doors closed (#P-B1 ✓).
  - Liquid transmitter: brass pipe mouthpiece over a cup (#P-B2 ✓).
  - Gas street lamps ✓; full moon ✓ (computed).
- **Text:**
  - Label at 5.5: `1876 年 / 贝尔 · 波士顿`.
  - H2 「答案，要从三千年前说起。」 (6.25–8.75).
- **OUT:** at 9.30, FREEZE. 2-frame jolt (8 px), one tear line, saturation −30 % → R1.

### REWIND · R1 · 9.30–11.564 (68 frames) · `VhsOverlay` + frames played backwards at ×8 · no voice
- **Frames:**

| Frames | What plays (backwards) | Year |
|---|---|---|
| 0–4 | Tape-stop jitter; OSD `◀◀ REW` | 1876 |
| 5–11 | **1860**: Scott's moon slides down out of frame and the trace un-scratches | 1860 |
| 12–18 | **1844**: the telegraph key rises; the pulses run back into it | 1844 |
| 19–25 | **1825**: the wax-sealed letter folds itself shut; the seal re-forms | 1825 |
| 26–33 | **757**: beacon fires shrink back into darkness, ridge by ridge | 757 |
| 34–42 | **前1200**: the crack runs back into the shell | 公元前 1200 |
| 43–67 | **Slow-down**: the clear Shang pre-dawn sky stutters (every frame shown twice) and the noise fades. Frames 56–62: OSD becomes `▶ PLAY`. Frame 63: overlay amt → 0 | — |

- **Year counter:** bottom-right, `yearAt(1876, −1200, u)`.
- **Logic:** we rewind from 1876, so no later era flashes.
- **Sound:** a tape-rewind squeal, then a clunk on PLAY.
- **OUT:** PLAY on the bar 11.564.

### TITLE · T1 · 11.564–18.965 · no voice
- **Background:** the Shang pre-dawn sky (near-black, `#070A1C` top): `StarField`, plus a faint dawn glow at the right horizon.
- **11.564, the title arrives through cracks:** gold crack lines (the 卜 crack's style, `#F2CF7A` glow) shoot through the letter shapes of 「为了跟你说一句话」 in 4 frames. Then the white letters fill in, with scale 1.06 → 1.00 and a damped 3 px jolt. No flash.
- **12.13 (one beat later):** 「人类努力了三千年」 cracks in and fills gold.
- **Type:** Noto Serif CJK SC Black 104 px, ls 0.06em, baselines y 430 / 560.
- **12.7–13.8:** a gold 2 px hairline draws left to right under it (x 360 → 1560, y 620), lighting 9 dots along it, one per era.
- **Camera:** 11.6–16.6 slow push 1.00 → 1.04. 16.6–19.4 tilt down 900 px. The title is in the sky layer (f 0.3), so it leaves upwards.
- **OUT:** tilt down to the 商 plain.

### 商 · 18.965–34.836 · S1 19.40–21.90 · SQ 22.40–24.40 · S2 24.90–27.40 · S3 27.90–30.90

**Layers:**
- Sky (pre-dawn).
- L2 far plain: f 0.04, base 700, `#2B2238`.
- 洹河 band: y 735–760, `#3A3456`, sheen `#8B7FA8`, overlapped by L4.
- L4: f 0.22, base 770, `#1C1528`. Items: `shang_hall` (rammed-earth platform, timber posts, thatched hip roof; one lit doorway `#FFB766`).
- L5: f 0.55, base 820, `#120D1C`. Items: millet clumps, a bare tree, the fire pit, a bronze 鼎.
- Ground: GR 862, `#0B0812`.
- FG grass: f 1.6, blurred.

**SH1 · 18.965–22.20 · walk → kneel**
- **Camera:** the tilt lands at 19.4. Then a walker track: the diviner holds x 760 (h 430) while the layers slide.
- **Figure:** he walks left to right (`carry`, the plastron at his chest). 21.4–21.9 `walkToStand`, then 21.9–22.4 → `kneel` at the fire (x 1060 on L5).
- **Vignette:** two tiny figures kneel facing east by a far hall; hearth smoke rises.
- **Props:** thatched halls on rammed-earth platforms ✓, no tiles or upturned eaves; 鼎 ✓; millet ✓.
- **Text:**
  - Label at 19.3: `约公元前 1200 年 / 商 · 殷墟` ⚑ (date wording).
  - S1 「商朝人有一句话，想问老天。」
- **OUT:** continuous into SH2.

**SH2 · 22.20–24.70 · he asks the sky**
- **Camera:** low angle; pull back 1.1 → 1.0 and tilt up 120 px.
- **Figure:** `kneel` → `kneelLookUp`. His face is lifted to the eastern sky on the right.
- **Vignette:** wind tugs at the robe hem and the fire. A cloud bank (`#2A2A44` / `#22223A`, f 0.1) **rolls in from the right (east)** and swallows stars over 2.5 s.
- **No rain.** The script forbids it until SH2 (the 验辞) is ✓.
- **Text:** SQ 「雨，会从东边来吗？」 with the native line 「其自东来雨？」 above (Noto Serif CJK SC 36 px). The voice carries an echo.
- **OUT:** tilt back down to his hands.

**SH3 · 24.70–27.70 · fire and crack** (rim: fire side)
- **Camera:** push 1.0 → 1.9 on the hands (x 980, y 640).
- **Action:**
  - The right hand takes a **thorn-wood brand** from the fire, with an ember tip.
  - The left holds the `Plastron` with its **back (the drilled pits)** to us.
  - 25.4: the ember touches a pit (sparks, a puff of smoke).
  - 25.9: a 0.4 s flip shows the **front**. *Crack:* the 卜 crack grows on the beat (Plastron `k`), glowing gold inside, with a 3-frame shake.
- **Props:** brand on drilled hollows ✓ (灼以荆; script [verify]); shell front/back ✓.
- **Text:** S2 「火烤龟甲，裂纹就是回答。」
- **OUT:** CU of the front.

**SH4 · 27.70–31.20 · the carved question**
- **Framing:** the CU front of the shell fills ~45 % of the frame height.
- **Key visual:** **oracle-bone glyphs 其 自 東 來 雨, traced from the rubbing** (not a font, not placeholder marks), appear one by one beside the crack as if incised (`ink`), each glowing gold for 0.3 s and then settling dark. This is the carving, done after the crack ✓.
- **Camera:** pull back to medium (1.9 → 1.2). He raises the shell to the clouded east (`kneelOffer`).
- **Text:** S3 「刻下的这句问话，留到了今天。」
- **OUT:** push in.

**SH5 · 31.20–34.836 · into the crack** (music)
- **Camera:** push from the raised shell into the crack (zoom ×6 on its branching). The cracks glow gold one last time and fill the frame. Wind and gathering clouds; no rain.
- **OUT:** MATCH CUT at 34.836 to the 757 apricot branches, drawn from the crack path and scaled.

### 杜甫 · 34.836–54.875 · D1 35.30–38.50 · D2 39.00–42.60 · D3 43.10–45.00 · DQ 45.50–49.70

**Layers:**
- L1: the sun, low at left.
- L2: Qinling ridge, f 0.04, base 640, `#7A3A46`. Items: **烽燧 beacon towers** on the ridge line.
- L3: f 0.1, base 700, `#6A3446`. Item: **大雁塔** on its own mound.
- L4: f 0.25, base 790, `#4A2433`. Items:
  - a **rammed-earth wall** (battered sides, earthen parapet);
  - a **gate tower** (timber hall, hipped tile roof, broad gently curved eaves);
  - burned roofs with smoke wisps.
- L5: f 0.55, base 840, `#2A141E`. Items: tall grass ("城春草木深"), a ruined wall, apricot trees.
- Ground: `#1D0F16`.
- FG: blurred grass.

**D1 · 34.836–39.00 · dolly back through the tree**
- **Camera:** zoom ×4 on the branch tips → ×1 by 37.0. Blossoms open along the branches 0.1 s apart.
- **Figure:** Du Fu enters from the left at 35.6 and reaches x 760 at 37.0. From there it is a walker track (stoop +5°).
- **Props:** 大雁塔 (652/704) ✓; rammed-earth wall ✓ (brick is Ming ✗); Tang roofs ✓.
- **Text:** label `757 年 / 杜甫 · 长安` at 35.3. D1 「757年，长安被叛军攻破。」
- **OUT:** continuous.

**D2 · 39.00–43.00 · walker track**
- **Vignette:** a rebel patrol (two horsemen with spears and one banner) rides right to left along the wall-top. Crows burst from a ruined roof.
- **Figure:** Du Fu turns his head north (screen right, `neck -15` for 0.5 s) while walking. His hands are **empty**.
- **Text:** D2 「杜甫困在城里，不知道家人还在不在。」 ⚑ (#DF1).
- **OUT:** he slows at a breach.

**D3 · 43.00–49.70 · the beacons and the poem**
- **Figure:** `walkToStand` (43.0–43.6) → `lookUp` to the right.
- **Camera:** crane up (`py` −220) and push 1.0 → 1.15 (43.2–47.0) over the wall to the ridges.
- **Beacons:** the **烽燧** (square, tapered rammed-earth towers with a parapet and a brushwood stack, standing on L2's ridge) ignite near to far, five fires 0.57 s apart on the beats, each with a leaning smoke column.
- **The poem:** during DQ, the ten characters 烽火连三月，家书抵万金 write themselves faintly into the dusk sky above the beacons. Noto Serif CJK SC 64 px, `#F2CF7A` @ 0.35, stroke-reveal, two columns read right to left.
- **Props:** Tang 烽燧 ✓. The v2 lighthouse sprite ✗; replace it.
- **Text:**
  - D3 「那年春天，他写下：」
  - DQ 「战火连烧三个月，一封家书抵得上万两黄金。」 with the classical line above.
- **OUT:** tilt down to the road.

**D4 · 49.70–54.875 · the courier (music only)**
- **49.7–50.6:** CU of the courier's sash: a folded **`TangLetter`** (paper tied with a red cord) tucked in and bouncing with the gallop.
- **50.6–52.4:** pull out to the rider galloping left to right below the beacon ridge. The rider holds x 820 and the layers slide at ~3× walk speed. The sky deepens to `#1A1430 → #6A3040`.
- **52.4–54.875:** match the gallop phase so the hooves are gathered at 54.85.
- **Figure:** Tang 驿使 (幞头, hitched round-collar robe, boots) on a stocky horse with a **knotted tail**.
- **Props:** paper letter, no envelope ✓.
- **PROPOSED CHANGE TO SCRIPT:** the script names "a letter tube". The board uses the folded `TangLetter` (already built). Either is era-true.
- **Alternative B** (the producer's note: Du Fu writes and folds the letter → letter-to-letter wipe to Morse's sealed letter) is also possible. The board keeps the gallop match cut because the script specifies it and it reads in one frame.
- **OUT:** MATCH CUT on the gallop at 54.875.

### 莫尔斯 · 54.875–73.015 · M1 55.30–58.80 · M2 59.30–62.40 · M3 63.30–67.20 · MQ 67.80–70.00

**MO1 · 54.875–56.90 · 1825 winter road**
- **Camera:** track with the post rider (holds x 820).
- **Layers:** winter sky, snowy hills, bare woods, a split-rail fence, snow ground with ruts, sparse `Snow`.
- **Figure:** rider in a caped greatcoat and round hat, with mail saddlebags.
- **Vignette:** at 56.2 a Federal brick house with lit windows enters.
- **Text:** label `1825 年 / 画家莫尔斯 · 华盛顿`.
- **OUT:** cut on the beat inside.

**MO2 · 56.90–59.30 · the easel and the letter**
- **Set:**
  - A tall window with winter light `#DCE3EA`.
  - An easel with a **full-length canvas** (cream, faint gesture lines of a standing man).
  - Lafayette (stout, dark coat) on a dais at left.
- **Figure:**
  - Morse `paint` → a hand enters with a **folded letter, red wax seal**.
  - 57.6: he breaks the seal → `read`.
  - 58.6: the brush falls.
- **Camera:** push 1.0 → 1.35.
- **Props:** a folded sheet, wax seal, no envelope ✓ (MO1 ⚑ the facts).
- **Text:** M1 「一封信告诉莫尔斯：他的妻子去世了。」
- **OUT:** cut to the road.

**MO3 · 59.30–63.30 · home too late**
- **Figure:** Morse walks fast (`08_11`, tailcoat, top hat) through a snowy New England dusk.
- **Layers:** a white church with a steeple and lit houses on L4's ridge; a stone wall on L5.
- **The grave:**
  - 61.2: a churchyard enters: rounded-top 1820s slate stones and one **fresh grave mound** `#3A2E26`.
  - 61.2–61.8: `walkToStand`.
  - 61.9–62.6: `hatOff`, head bowed.
- **Camera:** the track decelerates to zero with him and holds 0.7 s.
- **Text:** M2 「等他赶回家，她已经下葬了。」
- **OUT:** crane up.

**MO4 · 63.30–67.80 · nineteen years later**
- **63.3–64.3:** crane up into the sky. **64.0–65.2:** time-lapse as the sky turns to May blue.
- **64.8–66.2:** crane down to the same road in spring.
  - Poles rise one per beat (`PoleLine` **no crossarms**, glass knobs ⚑); the wire draws itself along them.
  - A Norris 4-2-0 with two coaches crosses L4.
- **66.2 (cut on the beat):** the Capitol's Supreme Court chamber (arched window, Ionic columns, a hint of the half-dome). Morse (53) sits at the `TelegraphKey` (`key`); two gentlemen stand behind. Label → `1844 年 / 华盛顿 → 巴尔的摩`.
- **67.0–67.8:** wind-up. The finger rests on the key.
- **Props:** the line along the B&O ✓; 4-2-0 ✓ (v2 loco ✗); low Bulfinch dome if the exterior shows (cast-iron dome ✗); **no paper tape**.
- **Text:** M3 「十九年后，他的电报，一瞬间就把话送到：」
- **OUT:** the press.

**MO5 · 67.80–70.40 · What hath God wrought**
- **67.8:** the key presses (`press` 0 → 1, spark). Gold pulses (abstract capsules and dots) run out of the window along the wire.
- **Camera:** 68.4–70.4, a slow push from the key to the window, following the pulses outside.
- **Text:** MQ 「上帝创造了何等奇迹。」 + *What hath God wrought.*
- **OUT:** the camera picks up the wire.

**MO6 · 70.40–74.00 · ride the wire → the trace** (crosses into 斯科特 at 73.015; music)
- **70.4–72.4:** the camera locks onto the wire and rides it fast. Poles whip past (`Whip` 0.6); the country below runs toward Baltimore.
- **72.4–73.2:** the sky drops to night, the pulse train merges into one continuous gold line, and the wire starts to oscillate.
- **73.2–74.0:** the wavy line turns white, the space around it turns soot-black, and it is now the trace on Scott's drum. The speed settles to the drum's surface speed.
- **OUT:** ALONG A LINE into S1.

### 斯科特 · 73.015–90.845 · C1 73.50–76.40 · C2 76.90–80.50 · CQ 81.30–84.30 · C3 84.90–87.00

**Set:**
- Workroom at night, wall `#2B2F4A` lit by an oil lamp.
- Through a tall window: Paris roofs (mansards, chimney pots), **Notre-Dame with its 1859 spire**, gas lamps on a quay, and a **waning gibbous moon lit on the left**.

**S1 · 74.00–76.60 · singing, but silent**
- **Camera:** CU of the bristle scratching the white trace into the lampblack on the turning drum → pull back (×4 → ×1).
- **Figure:** Scott (`singCrank`) sings into the barrel horn of the `Phonautograph` and turns the crank. **We hear only the scratch.**
- **Props:** soot paper on a hand-cranked cylinder ✓ (#S2); horn + membrane ✓; **no Eiffel Tower** ✗.
- **Text:** label `1860 年 4 月 9 日 / 斯科特 · 巴黎`. C1 「斯科特造了一台机器，能把声音写下来。」
- **OUT:** continuous.

**S2 · 76.60–81.20 · 148 years**
- **Figure:** Scott unwraps the sheet and holds it to the lamp (`holdUp`): a white wavy line on black.
- **79.0–81.2:** the lamp gutters. Time-lapse: the room darkens, and the label's year runs `1860 → 2008`.
- **Camera:** push to the sheet.
- **Text:** C2 「可这声音，要等148年，才有人听见。」
- **OUT:** the sheet fills the frame.

**S3 · 81.20–84.70 · the scan plays it**
- **Key visual:** a cool scan bar (`#BFE9FF`, 6 px + glow) sweeps left to right along the trace. The trace glows behind it, and **the real 1860 recording plays** (#S1, #S4 CC BY).
- **In-world tag:** `2008` at the top of the sheet.
- **Text:** CQ 「在月光下……」 + *Au clair de la lune…*
- **OUT:** the glowing trace peels off the paper.

**S4 · 84.70–90.845 · himself, under the moon**
- **84.7–86.4:** the trace lifts like a ribbon and drifts out of the window. Through object: the window frame passes the camera.
- **86.4–90.8:** tilt up and push over the roofs to the moon (~30 % of the frame height, centred at x 960, y 400).
- **Double exposure:** Scott's singing silhouette at @ 0.3 sits over the moonlit roofs, mouth moving in time with the sound.
- **Text:** C3 「唱歌的人，很可能就是他自己。」 (#S3 "很可能").
- **OUT:** MATCH CUT on the moon at 90.845.

### 贝尔 · 90.845–110.385 · B1 91.30–95.20 · BQ 96.60–99.60 · B2 101.20–103.40 · B3 104.00–108.10
Staged as in the prototype `s41bell.tsx` (plates bellA / bellB). Retime `BELL_T` to these film times.

**B1 · 90.845–95.20 · one man, one room**
- **Camera:** from the full moon in Bell's window (the match), pull back (×3 → ×1) into the lab.
- **Set:** the table with the lamp, battery jars and `LiquidTransmitter`; the wire runs to a hole by the closed door (#P-B1: doors closed). The room is the inside of C2's window.
- **Figure:** Bell `STAND`, adjusting the stand.
- **Text:** label `1876 年 3 月 10 日晚 / 贝尔 · 波士顿`. B1 「贝尔的电线通到另一个房间，沃森在那头等着。」
- **OUT:** continuous.

**B2 · 95.20–96.60 · the voiceless push** (the wind-up before the hit)
- **Figure:** `STAND` → `LEAN` over the funnel.
- **Camera:** push 1.0 → 2.5, accelerating.
- **OUT:** continuous.

**B3 · 96.60–99.60 · he shouts**
- **Framing:** profile of `LEAN` at the funnel. Gold voice rings sink into the cone (`Rings`); the needle vibrates (`vib`).
- **Text:** BQ 「沃森先生——过来——我想见你。」 + *Mr. Watson — Come here — I want to see you.*
- **Camera:** 99.0–99.6 dive into the funnel mouth (zoom → 40, easeIn).
- **OUT:** THROUGH OBJECT.

**B4 · 99.60–101.00 · inside the wire**
- `WireTunnel` u 0 → 1, with the gold voice pulse ahead.
- ⚠ Replace the prototype's black `Flash` k 0.9 into the tunnel with the `Iris` from the funnel throat, and the warm `#FFF2D0` flash out of it with the iris from the receiver (no full-frame flashes, §2.1).
- **OUT:** iris out of the receiver.

**B5 · 101.00–104.00 · Watson's room**
- **Camera:** iris out of the `ReedReceiver` at Watson's ear (a small boxy instrument with an armature, **not** a handset, #P-B3).
- **Figure:** Watson **already holds it to his ear** (`HOLD`) when we arrive. He was stationed with it (#B1).
  - ⚠ Logic note on the prototype: if he picks it up only after the voice arrives (`grab`), he could not have heard the sentence. Start in `HOLD`, and use `grab` for setting it down.
- **Action:**
  - 102.0: his head lifts.
  - 102.6: he sets the receiver down.
  - 103.0: he runs out to the left (`08_01` ×1.6).
- **Room:** cooler (`#4A3A30 → #22180F`) with its own window.
- **Text:** B2 「沃森听见了——他真的来了。」
- **OUT:** WHIP PAN left with him (~103.6–104.0).

**B6 · 104.00–110.385 · he came** (letterbox in)
- **Camera:** out of the whip, Bell's room wide.
- **Action:**
  - The door opens: warm hall light, and Watson standing in it (walk → stand).
  - Bell straightens from `LEAN` and turns (`TURN`).
  - They face each other in profile across the table, the lamp between them.
- **Text:** B3 (the ZH hook voice) 「人类第一通电话的第一句话， / 是：「我想见你」。」 Optional small tag 「贝尔当晚的笔记」.
- **Camera:** 108.8–110.385, push into the lamp flame (zoom → 7). The core flickers blue-white.
- **Props:** no acid spill (#B4).
- **OUT:** THROUGH LIGHT. The flame core becomes the Poldhu spark (≤ 0.35 tint inside the light).

### 马可尼 · 110.385–127.265 · K1 110.85–114.05 · K2 115.20–117.70 · KQ 119.40–121.70 · sounds 121.95 / 122.25 / 122.55 · K3 123.00–126.20

**M1 · 110.385–114.10 · Poldhu, Cornwall, sunset**
- **CU:** the spark gap (two brass spheres, a blue-white arc) fires · · ·, pauses, and fires · · · again. The operator's hand is on a heavy key.
- **Camera:** pull back through the hut window to the cliff station, with the Atlantic and the **sun on the horizon at right (west)**.
- **The station:** the hut and the aerial. Default: a fan of wires between two masts ⚑ (#P-M4: what stood on 12 Dec). The 20-mast ring had been wrecked by then.
- **The signal:**
  - A big in-world tag **S = · · ·** (Cormorant Italic 72 px gold + three dots) appears beside the hut.
  - Each S sends three rings `#9FE8FF` flying right.
- **Props:** 12:30 NST = 16:00 GMT; the sun at Poldhu is ~1.6° high ✓ (computed). S, repeated ✓ (#M2).
- **Text:** label `1901 年 12 月 12 日 / 康沃尔 → 纽芬兰 · 约 3400 公里`. K1 「英国康沃尔的电台，一遍遍只发一个字母：S。」
- **OUT:** whip pan right with the rings.

**M2 · 114.10–115.20 · the Atlantic** (music)
- **Camera:** `Whip` right, then a fast track over the sea (swell, waves, whitecaps; a two-funnel 1901 steamer). The rings expand ahead.
- **Light:** sunset grades into grey storm daylight (the 3.5 h time difference).
- **Arrival:** Signal Hill with **Cabot Tower** (stone, 1900 ✓).
- **OUT:** we reach the hill.

**M3 · 115.20–118.90 · the kite**
- **Key visual:** beside Cabot Tower, in the gale, with snow patches on the grass: a **large linen kite on bamboo spars**, man-sized (2.7 m), drawn as a big flat hexagon (`HexKite`, s large; never a small diamond, #P-M2). It yaws ±12°. The 400–500 ft aerial `Wire` sags to the roof of the old **hospital building**.
- **Figure:** an assistant braces at the line.
- **Action:** the rings arrive; a gold glint runs down the wire.
- **Camera:** tilt down along the wire into the window.
- **Props:** hospital ✓ (#P-M1). No lost kite.
- **Text:** K2 「大西洋对岸，风筝把天线拉上天，接住它。」
- **OUT:** THROUGH the window.

**M4 · 118.90–127.265 · Kemp hears**
- **Set:** a bare room, grey daylight and a candle on the table. The receiver box (detector + batteries) and a **telephone earpiece on a cord** (#P-M3).
- **Figures:**
  - Marconi sits listening (`phoneSit`).
  - 119.4: `handOut` to Kemp (bowler, beard ⚑).
  - Kemp bends to listen (`listenBent`).
- **Camera:** push 1.0 → 2.4 on Kemp's head and the earpiece.
- **The three sounds:** at 121.95 / 122.25 / 122.55, three small gold sparks run down the kite wire, through the window, into the earpiece. Three gold dots form in a row beside it. 122.8: Kemp's head lifts.
- **124.5–127.2:** the camera pushes past to the three dots, which drift to the frame centre.
- **Text:** KQ 「肯普先生，你听到什么了吗？」 + *Can you hear anything, Mr Kemp?* K3 「三声短响，就是S——它越过了大西洋。」
- **OUT:** MATCH CUT at 127.265: three dots → three amber lamps.

### 阿帕网 · 127.265–145.70 · A1 127.75–131.65 · A2 132.10–136.00 · AQ/AA 136.80–143.40 · A3 144.30–145.65 (in the silence)

**Set, UCLA (3420 Boelter Hall, evening):**
- A suspended tile ceiling with **troffers in it**.
- A Sigma 7 `Cabinet` row with **lamps on the panels**; a tape drive.
- The **IMP** (tall grey cabinet) beside a `Teletype` on its pedestal.
- A raised floor; a night window.

**Set, SRI:** the same kit re-coloured (walls `#2E2C3C`, SDS 940 cabinets), and Bill Duvall at a teletype.

**A1 · 127.265–131.90 · UCLA**
- **Camera:** from the three lamps (match), pull back (×5 → ×1) to the room.
- **Figure:** Kline is **seated and typing** in a **telephone headset** (`headsetType`; #A2, #P-A1).
- **Props:** Sigma 7 ✓, teletype ✓ (model ⚑), headsets ✓. The UCLA room is "nearly empty" (#P-A1).
- **Text:** label `1969 年 10 月 29 日晚 / 阿帕网 · UCLA → SRI` (no clock time, #A1). A1 「互联网的前身，要发出第一条消息了。」
- **OUT:** lateral dolly.

**A2 · 131.90–136.60 · chalkboard**
- **Camera:** dolly right past the IMP (its dark edge wipes the frame at f 1.6) to a chalkboard reading `UCLA ——→ SRI` and `LOGIN`. **No mileage** (#A4). The chalk line fills gold. Then dolly back.
- **Text:** A2 「克莱恩要给几百公里外的电脑，敲一个词：login。」
- **OUT:** the split.

**A3 · 136.60–144.165 · split screen, headset to headset**
- **136.6:** a `Wipe` splits the frame. UCLA (Kline) is on the left, SRI (Duvall, headset, at his terminal) on the right. The split line is a thin gold line: the phone and the data line.
- **On the beats:**

| Time | Left (UCLA) | Right (SRI) |
|---|---|---|
| 136.8 | Kline presses L. AQ1 "Did you get the L?" | — |
| 137.5 | — | a teletype CU prints `L` |
| 138.2 | — | Duvall: "Got the L." |
| 139.4 | O, AQ2 | — |
| 140.1 | — | `LO` |
| 140.8 | — | "Got the O." |
| 142.3 | G, AQ3 "Did you get the G?" | — |

- **The crash** is at the **SRI end** (#A3): at 143.4 the right half's lamps flicker and the teletype stalls; **G never prints**.
- **144.165, total silence:** the SRI half dies (lamps out in a 4-frame ripple, black-blue). Then the UCLA half's troffers stutter and dim.
- **Text:** 「收到 L 了吗？」「收到 L 了。」 / 「收到 O 了吗？」「收到 O 了。」 / 「收到 G 了吗？」
- **OUT:** the silence.

**A4 · 144.165–145.70 · LO**
- **Framing:** the frame closes on the UCLA paper `LO`, the last lit thing (window light `#9FB8D8` @ 0.25). Push 1.0 → 1.08. Kline is still.
- **Text:** A3 「然后，系统崩溃了。」 (voiced in the silence).
- **OUT:** MATCH ON TEXT at 145.70: paper `LO` → the 1987 CRT text at the same spot.

### 北京 · 145.70–160.885 · J1 146.45–149.45 · J2 149.90–152.40 · JQ 154.10–158.90

**BJ1 · 145.70–149.90 · the CRT**
- **CU:** green phosphor (`#8DFFAE` on `#031008`, scanlines, tube vignette) showing the mail:
  - `Date: Mon, 14 Sep 87 21:07 China Time`
  - the German line `Ueber die Grosse Mauer erreichen wir alle Ecken der Welt`
  - then `Across the Great Wall we can reach every corner in the world.` (#E1, #E3)
- **Camera:** pull back (×4 → ×1) to the ICA room at night: a CRT terminal on the Siemens system (#E5), a ceiling fluorescent tube, a **tear-off calendar** at `1987 九月 14 星期一`, a 1980s **thermos**, and a night window with hutong roofs and TV antennas.
- **Figures:** Chinese and German scientists, unnamed (#E4). A Chinese engineer sits typing; a Chinese elder stands (`handsBehind`); a German colleague leans on the desk.
- **Props:** **no floppy**; 14 Sep = Monday ✓.
- **Text:** label `1987 年 9 月 / 中国第一封电子邮件 · 北京`. J1 「中国的第一封电子邮件，写好了。」
- **OUT:** locked wide.

**BJ2 · 149.90–154.095 · six days**
- **Camera:** locked.
- **Six tears:** the calendar tears 14 → 20 on half-beats. Each page flutters down, the window flips day/night, and the poses change (sit / `armsCrossed` / stand / `listen`). The screen holds a frozen cursor (deadlock, #E2).
- **152.4–154.1:** hold. A finger hovers over Enter (lean in 3°).
- **Props:** 20 Sep = Sunday ✓.
- **Text:** J2 「可程序卡住了，整整六天。」
- **OUT:** Enter on the hit.

**BJ3 · 154.095–161.00 · the climax flight** (letterbox)
- **154.095:** Enter, 3-frame shake. The text lifts off the screen as a **gold line of light** and shoots out of the window.
- **Camera:** crane out over the night roofs. Below: 28-inch roadsters (二八大杠) under streetlights, a trolleybus.
- **The Wall:** the camera flies north to **the Great Wall**, crenellations and watchtowers following its ridge exactly. The gold line races along the wall-top and lights each tower. Moonless ✓ (computed).
- **158.0–159.4:** the line lifts off over the mountains and splits into many lines arcing to the horizon.
- **159.4–161.0:** tilt up into the stars. **Star trails turn backwards** around the pole star while the label ticks `1987 → 1977`. Then tilt down along a telephone wire into a city at night with the full moon.
- **Text:** JQ 「越过长城，走向世界。」 + *Across the Great Wall we can reach every corner in the world.*
- **OUT:** see #14 (proposed change).

### 1977 · 160.885–172.935 (letterbox throughout) · V1 161.25–165.15 · VQ1 165.60 · VQ2 166.90–168.40 · VQ3 168.80–169.40
Ann is always on the left facing right; Carl is always on the right facing left. Their eyelines meet across every cut.

**V1 · 161.00–164.20 · Ann**
- **Camera:** the wire leads into a tall apartment window at night; push in 1.0 → 1.25.
- **Figure:** Ann sits on the window seat (`phoneSitWin`) and **dials the rotary `DeskPhone`**: finger in a hole, the dial spins back.
- **Props:** a **tape box `《流水》· 古琴 · 管平湖`** on the sill (#V4); a desk lamp; the city with roof water towers (no WTC; city unnamed, #P-V1); the full moon (1 Jun 1977 ✓).
- **Text:** label `1977 年 6 月 1 日 / 安·德鲁扬 · 卡尔·萨根`. V1 「安·德鲁扬找到了那首中国古曲，打给卡尔·萨根。」
- **OUT:** follow the cord.

**V2 · 164.20–165.60 · to Tucson**
- **164.2–164.9:** `Whip` along the cord → the wall jack → outside, then a fast flight along poles (`PoleLine` with crossarms ✓) over a moonlit desert with **saguaro** silhouettes (Tucson ✓, #P-V1).
- **The gold pulse:** runs ahead and drops into a lit hotel window.
- **164.8–165.3:** insert: a hand holds the hotel message slip **`Annie called`**.
- **165.3–165.6:** Carl, phone at his ear (`slip`).
- **OUT:** shot/reverse shot.

**V3 · 165.60–168.80 · "For keeps?" / "You mean… get married?"**
- **165.6:** Ann MCU (left, facing right) on VQ1.
- **166.9:** Carl MCU (right, facing left) on VQ2. A lamp `#FFB870`, the same moon through his window.
- **Cuts:** on the beats; both are seen **speaking and listening**.
- **Text:** 「是一辈子吗？」「你是说……结婚？」
- **OUT:** the split.

**V4 · 168.80–169.50 · "Yes."**
- The split (`Wipe` x 960) closes into **one frame**. Both stand (Ann `phoneSitWin` → `phoneStand`, Carl already standing) and face each other.
- The two windows merge around **one moon** at the centre top. A gold phone line arcs between the handsets. The lamps warm up +30 %.
- **Text:** 「是。」
- **OUT:** match on the gold disc.

**V5 · 169.50–172.935 · record and launch** (music)
- **169.5–170.9:** the moon becomes a **gold disc** on a cutting lathe (match on the circle). A cutting stylus spirals the groove. Hard cut on the beat: the disc in its **gold aluminium cover** is bolted to Voyager's bus side (#V8).
- **170.9–172.935:** morning at the Cape (#V6: launched 20 Aug / 5 Sep 1977, morning). A **Titan IIIE-Centaur** lifts off: a white core with a pointed shroud and two segmented side boosters, and a plume `#FFF4D8 → #FFB04A`. The sky darkens to black as it climbs, and its trail arcs up off the Earth's curve.
- **Props:** Titan IIIE-Centaur ✓; record on the outside of the bus ✓.
- **PROPOSED CHANGE TO SCRIPT:** start the record cut on a moon → disc match.
- **OUT:** the trail leads into space.

### 尾声 · 172.935–188.1 · O1 173.40–177.00 · O2 177.60–182.60 · O3 183.70–185.90

**O1 · 172.935–178.00 · Voyager in detail** (the hush)
- **Layers:** `#04050C`, `StarField` and a diagonal `MilkyWay`, with a pale blue dot at the left edge.
- **Key visual:** **`Voyager`** in 3/4 view (dish ~520 px across, pointing left to Earth, hard sunlight from the left), drifting in from the right.
  - It shows: 3.7 m dish with subreflector, ten-sided bus, three RTGs on their boom, the science boom with the scan platform, the 13 m magnetometer boom and the two whips (#P-V2).
  - It is **3-axis stabilised, so it never spins**.
- **Camera:** push to the record (×1 → ×1.9, a gentle yaw +12°). `RecordCover` takes over in close-up.
- **The record's pulse:** a soft pulse of light beats on it (EEG crackle; or two heartbeats if 心跳 is ✓).
- **Optional data tag:** 「旅行者1号 · 约258亿公里外」 (#V7, 估算).
- **Text:** O1 「唱片上，还录着她恋爱时的脑电波和身体的声音。」 The board uses #V3's safe wording until EKG is ✓.
- **OUT:** pull out.

**O2 · 178.00–181.00 · the greeting; Voyager becomes a star**
- **Camera:** pull back (×1.9 → ×0.05). Voyager shrinks to a moving point of light. 179.4–181.0: tilt down through the Milky Way.
- **Text:** O2 「各位都好吧？我们都很想念你们。」 / 「有空，请到这儿来玩。」 (with a space echo).
- **OUT:** the hill rises into frame.

**O3 · 181.00–188.10 · the hilltop and the end card**
- **Layers:** `hill()` peak at x 960, y 760, `#07060C`; the Milky Way arches over; the Voyager point crawls across the top right.
- **Cast:** ten figures on the crest, every foot at `yAt(x)`, h ≈ 230 px, uneven spacing, mostly `lookUp`. One figure points at the light.
- **Order, left to right:**
  - 贞人
  - 杜甫
  - 莫尔斯 (hat in hand)
  - 斯科特
  - 贝尔
  - 马可尼
  - 克莱恩
  - 北京 engineer
  - 安 and 卡尔 (`holdHand`)
- **End card**, built over the living frame from 182.8:
  - J monogram (y 150).
  - Gold title 「为了跟你说一句话 / 人类努力了三千年」 (72 px, y 300 / 380; the T1 hairline redraws under it).
  - The question 「你最想对谁说一句话？」 (84 px white, y 560) at 183.7 with O3's voice. The ？ gets −0.5em, centring checked on pixels.
  - Follow pill 「关注 Juno · 一起看懂世界」 (y 700).
  - Sources (22 px, y 1030; the script's list + 音频 First Sounds CC BY).
- **Ending:** hold, and fade on the last bar.

## 5. Assets to build or change (one line each)

**Figures:**
1. `cylcap` head (Shang cylindrical cap over a coiled braid).
2. `apron` 蔽膝 part.
3. `bowler` head.
4. 1960s telephone headset (earpiece + boom mic) for Kline and Duvall.
5. Narrow-sleeve option for `robe`.
6. The new poses in §2.2.
7. Duvall look.
8. Three Beijing scientist looks.
9. Lafayette (static).
10. Capitol witnesses ×2.
11. Rebel horsemen with spears and a banner.
12. Kite assistant.
13. Shang kneeling worshippers.
14. Crows (procedural).
15. Tang courier + knotted-tail horse, 8-frame gallop.
16. 1825 post rider + horse, 8-frame gallop, phase-matched to #15.

**Props and sets:**
17. Modern phone (no logo) with the `正在呼叫… · 妈` screen and an earpiece grille.
18. Fibre and wire chase with era bands (LED → neon → sodium → gas) on their own grounds.
19. `Plastron` gains `side: 'back' | 'front'`; **traced oracle glyphs 其自東來雨** replace the placeholder marks.
20. Thorn-wood brand.
21. `shang_hall` (rammed earth + thatch; replaces `hall`).
22. Millet.
23. 大雁塔.
24. Tang rammed-earth wall + gate tower.
25. 烽燧 with fire and smoke states (replaces `beacon`).
26. Sky calligraphy reveal for DQ.
27. `FoldedLetter1825` (wax seal breaks, `open` 0..1).
28. Easel + full-length canvas.
29. Federal house.
30. Church with steeple.
31. 1820s headstones and a fresh grave.
32. Split-rail fence and stone wall.
33. Top hat in hand.
34. `Snow`.
35. `PoleLine` gains `crossarm={false}` + glass knobs (1844); crossarms stay for city and 1977 lines.
36. Norris 4-2-0 + coaches (replaces `loco`).
37. Capitol Supreme Court chamber interior.
38. `Moon` with `phase` (1860 waning 91 % lit left; 1876 and 1977 full).
39. Paris window plate (Notre-Dame with spire, no Eiffel Tower).
40. Held soot sheet with the scan bar and the 2008 tag.
41. 1876 Boston roofs and the boarding-house facade with a 2-over-2 sash window.
42. Spark gap CU.
43. Heavy key.
44. Poldhu station + aerial ⚑.
45. S = · · · tag.
46. 1901 steamer.
47. Hospital building.
48. Large linen `HexKite` (scale ~2.7 m).
49. Receiver box + telephone earpiece.
50. IMP and tape-drive `Cabinet` variants.
51. SRI re-colour of the room.
52. Chalkboard (`UCLA ——→ SRI`, `LOGIN`).
53. Teletype CU mode (200 px letters).
54. CRT terminal.
55. Tear-off calendar with the tear animation.
56. Thermos.
57. Beijing night window.
58. 二八大杠 cyclist (replaces `cyclist`).
59. Trolleybus.
60. Great Wall ridge item with a lit mask.
61. Reversing star trails.
62. Rotary dial animation for `DeskPhone`, plus `CoilCord`.
63. 《流水》 tape box.
64. `Annie called` message slip.
65. Saguaro desert.
66. Hotel room.
67. Cutting lathe + gold disc.
68. Titan IIIE-Centaur + launch plume.
69. Earth curve.
70. Pale blue dot.
71. End card (engine).

**Reused as is:** `Voyager`, `RecordCover`, `MilkyWay`, `StarField`, `hill`, `Cam`, `Whip`, `Wipe`, `Iris`, `Letterbox`, `WireTunnel`, `VhsOverlay`, `yearAt`, `Layer`, `Walker`, `Poser`, `walkToStand`, `Fire`, `TangLetter`, `TelegraphKey`, `Phonautograph`, `LiquidTransmitter`, `ReedReceiver`, `Wire`, `Cabinet`, `CeilingLights`, `Teletype`, `DeskPhone`, and the Bell scene `s41bell.tsx` with the four fixes in B4/B5/§2.2.

## 6. Open items

**⚑ For the researcher:**
- SH1/SH2: the 合集 number, plastron or bone, and the 验辞.
- DF1.
- MO1/MO2: the facts, Morse's beard, and the 1844 insulators.
- Scott's beard.
- Watson's, Marconi's and Kemp's looks.
- What stood at Poldhu on 12 Dec.
- The teletype model.
- V3: whether 心跳 (EKG) is on the record.

**Bell prototype fixes:**
- rimOp ≤ 0.3.
- Watson starts in `HOLD`.
- Replace the black and warm full-frame `Flash`es with irises.
- Retime to B1–BQ–B2–B3.

**Proposed changes to the script:**
- #14: backward star trails.
- D4: TangLetter instead of a tube.
- V5: the moon → disc match.

## 7. Style frames for gate 2b

| Frame | Time | What it proves |
|---|---|---|
| C0 | 0.00 | Frame 0 is striking, moving and subtitled |
| C1 | 2.6 | The aging wire chase |
| SH3 / SH4 | 26.0, 29.0 | The crack and the traced glyphs |
| D3 | 46.5 | Nothing floats; 烽燧; the sky poem |
| MO3 | 62.3 | Hat off at the grave |
| B3 / B4 | 98.0, 100.3 | The push into the funnel and the tunnel |
| M1 | 112.5 | Poldhu with S = · · · |
| A3 | 140.5 | Headset split screen; lamps on panels, lights in the ceiling |
| BJ3 | 156.5 | The light on the Great Wall |
| V4 | 169.2 | One frame, one moon |
| O1 / O3 | 175.5, 184.5 | Voyager in detail; people on the hill with the end card |
