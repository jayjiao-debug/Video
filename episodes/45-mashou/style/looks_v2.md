# 《马首回家，用了160年》: three looks for the rebuild (gate 2a v2)

Art director, 2026-10-25. Inputs: brief_v2.md, HANDOFF.md §5/§6, facts.md, script.md v4 (for the beats only), review/v2
(REVIEW + animator_review), looks.md, owner-notes, and the ep43 storyboard + style frames.

- Contact sheet: `style/v2/contact_sheet.png`.
- Frames: `style/v2/look{1,2,3}_{hook,key}.png`.
- Sources: `style/v2/src/`.
  - `kit.js` holds the shared hero, brothers, figures and caption layer.
  - `look*.js` holds one file per frame.
  - `build.py <name>` inlines the kit and renders through render_html.py.
  - `sheet.py` rebuilds the contact sheet.
- Mean luma (owner row 71, night/indoor ≥ 45):

| Frame | L1 hook | L1 key | L2 hook | L2 key | L3 hook | L3 key |
|---|---|---|---|---|---|---|
| Mean luma | 51 | 52 | 130 | 166 | 53 | 52 |

## Shared by all three
**Caption layer.** Every frame carries the ep43 v6 caption layer, copied from `43-qingming/film/film.html` with
`body.capC lay2 bl1 ad` and seal C1:
- Subtitle: top-left (x 150, y 124), Noto Serif CJK SC Black 64 px, ivory, with the key word as a white-on-#D8392A tag.
- Stamp: top-right, 72/64 px from the edges, red rule, at 0.6 scale.
- Bottom-left block at 140/56 px: the era chip plus the counter. The 12-dot tally shows only where the beat needs it
  (L1 key: 在家 11/12).
- Seal: a round 朱文 J, bottom-right.
- Adaptive scrim: only on bright ground (L2, and lightly on L3).

**Counter.** Two forms for now:
- **Age:** 你 约267 岁. The age comes from facts F7 (caution, 1759) and needs the screenwriter's OK.
- **Story counter:** 在家 12 → 回国 n → 回家 1/12.

The story counter is what the beats need. The screenwriter and producer pick which one the block carries per beat.

**The hero (one asset, `K.horseHead`, the same in every look).** A real horse head in profile, with:
- the long nasal bone, the round jowl, and the throat latch with the neck running down to a flared cast base;
- a slanted comma nostril, upper and lower lip, an eye under a brow ridge, the facial crest and veins;
- a forelock between the ears;
- a 13-lock flame mane set along the crest, each lock tapering and flicking past the crest line.

Red-copper shading: a lit face plane, a jowl crescent, a core shadow under the jaw, crisp speculars, a fine cast grain, and a
rim light that takes each look's light colour.

- **Ear:** `curl` param. The **near ear is folded** from 1989 on (the root stands, the top third bends forward and down) and
  straight before (L1 key 1860, L2 memory). The far ear always stands.
- **Scale:** ≈ ¼ of a person, shown in L1 hook (the viewer's head is half the bronze's height).
- **The brothers.** The eleven get their own profile heads (`K.ZODIAC`) on robed stone bodies (`K.stoneBody`). The demo's
  blob complaint is answered with a defining silhouette for each:

  | Head | Defining shapes |
  |---|---|
  | 鼠 | round ear, pointed snout, whiskers |
  | 牛 | horns, broad muzzle |
  | 虎 | round ears, stripes |
  | 兔 | two long ears |
  | 龙 | antlers, beard |
  | 蛇 | flat head |
  | 羊 | curled horn |
  | 猴 | flat face, brow |
  | 鸡 | comb, wattle |
  | 狗 | drop ear |
  | 猪 | snout disc with nostrils |

  Every head also has an eye. The rows follow 澎湃 2019: 鼠虎龙马猴狗 | 牛兔蛇羊鸡猪.
- **Not yet proven:** the brothers at full-frame size, e.g. the H3 gathering. Before any close-up they need a modelling pass
  like the horse's (jowl, eye socket, speculars).

**Figures.** One-tone profile rigs from joints (`K.figure`, `K.seated`, `K.bust`):
- the 1860 soldier wears a **kepi** (crown higher at the back, tilted forward, short flat visor);
- hands are mitten ends on IK arms;
- no hands enter from off-screen, and there is no facial detail.

**Not black-and-white, no AI images.** Everything is code-drawn vector, and the end card is the Juno card, unchanged.

---

## Look 1 · 铜灯影 (copper lantern shadows): the ep43 approach, re-made for copper
1. **World:** the 汴河暮影 silhouette theatre, but you are a copper lamp. Every stage is layered 2.5D silhouettes against a
   dusk sky, and the only warm light is yours: it rims whoever stands near you (the viewer at the case, the looter's arms,
   the brothers' edges). Moods follow the story:
   - dusk in the present;
   - fire for 1860 (the second light, behind);
   - night for the auction years;
   - dawn for the return.
2. **Palette and type:**

   | Role | Hex |
   |---|---|
   | Dusk sky | `#2B4552 → #6E827E → #D79A62 → #EDB277` |
   | Fire sky | `#2A1D1F → #5E2A22 → #B5502D → #E88A45` |
   | Silhouettes | `#140D0A` |
   | Hall interior | `#1a120d` |
   | Copper | `#FFD6A0 / #E58448 / #B0502A / #6A2814` |
   | Rim from you | `#FFB070` |
   | Fire rim | `#FF9A50` |

   Type: Noto Serif CJK SC (subtitles and stamps) and Cormorant Garamond (numerals).
3. **Must NOT look like:**
   - ep43 with a horse pasted in (no silk-gold, no 虹桥 crest; the handover stage here is the stone seat / plinth);
   - navy-and-gold (the sky is 石青 → copper, never navy);
   - flat clip-art rooms;
   - front-on figures;
   - a glowing blob (the head keeps its modelling inside the glow).

- **Hook frame:**
  - 正觉寺·文殊亭 at dusk: lattice side doors and open bays onto the courtyard (hip roofs, a pine).
  - You in a glass case lit by your own copper.
  - A foreground visitor in profile, rimmed by you, at true scale.
- **Key frame (B4, 1860):**
  - 海晏堂 burning behind its balustrade, its windows lit from inside.
  - Your row of brothers on the pool rim, your seat empty.
  - A looter in a kepi walks right (出) carrying you at chest height on his forearms. The ear is still straight.
  - Counter 在家 11/12.
- **Risk:** the third silhouette-on-dusk film in four (looks.md row at ep43 warns about this). It is the safest pick and the
  closest to what the owner loved.
- **Buildability (ep43 three.js engine, nearly 1:1):**
  - **Same as ep43:** Stage layers with fog and parallax, `heroAt()` rim light (copper instead of silk), `Cast` + `rig()`
    figures, `Motes` (dust, embers).
  - **New sets:**
    - 文殊亭 hall (lattice and bays);
    - 海晏堂 façade (balustrade, raised centre, arched windows as emissive cut-outs);
    - the pool rim with seated statues;
    - a fire layer (animated flame sprites + smoke columns);
    - the auction room;
    - the 正觉寺 courtyard for the drop.
  - **Hardest:**
    - (a) the carry: hands locked to the base and neck every frame, on the contact checker;
    - (b) fire that is not a comb of flames (two layers, noise-driven tongue heights, heat shimmer on the façade);
    - (c) keeping the copper rim confined to edges that face you (a per-layer `rim` the engine already has).
  - **Transitions:**
    - glow-lock on your light (the case glow becomes the fire glow);
    - the looter walks out of frame right into the dark → the dark becomes the auction-room wall;
    - the star → truck glow from v3 survives.

## Look 2 · 正午倒影 (the noon mirror): daylight, a world of reflections
1. **World:**
   - **The film's device:** every polished surface (the museum floor, the case glass, the pool, an auction-room table top, a
     wet road at the gate) reflects not this room but where you belong: noon at 海晏堂, your stone seat, your arc of
     water, your ear unbroken.
   - **Above, below:** above the line is today, below it is the memory. At the turns the mirror changes: the reflection goes
     to ruins after 1860, it is empty during the auction years, and at the end it fills with twelve arcs again (K1 只是
     记忆).
   - **The palace:** 海晏堂 itself is drawn in full daylight. It is the only bright, saturated place in the film.
2. **Palette and type:**

   | Role | Hex |
   |---|---|
   | Noon sky | `#8FC0D0 → #CFE3E2 → #F1EEDF` |
   | Marble | `#EEE7D6 / #C3BAA6 / #8F8776` |
   | Pool jade | `#5FA79A → #2F7E74 → #174C47` |
   | Matte bronze brothers | `#8A6A4E → #33251B` |
   | Present-day hall | warm grey `#6B5E50 → #8E8170`, columns `#8E3B2C`, beam 彩画 `#3F6F6A / #C9A45C / #2F5560` |
   | Mirror stone | `#1E2B2A` |
   | Water arcs | white `#FFFFFF` with jade edge `#BFEAE2` |
   | You | red copper (the only glowing thing); your arc is copper-gold `#FFD9A0` |

   Type: Noto Serif CJK SC, with an adaptive scrim on bright ground.
3. **Must NOT look like:**
   - a mirror trick or horror reflection (no warped faces, no kaleidoscope);
   - the demo's flat beige clip-art (sets need depth, shadow and reflections);
   - a navy night (this is the first daylight look of the series' recent run);
   - upside-down text.

- **Hook frame:**
  - 文殊亭 today in soft window light, you in the case.
  - The dark polished floor below the line does not reflect the hall. It shows 海晏堂 at noon, upside-down and rippling:
    your stone seat, you on it with the ear still straight, your arc into the pool.
- **Key frame (A7):**
  - Noon, frontal: the palace façade, the twelve on their seats in the 八 shape, twelve arcs meeting over the pool.
  - The pool mirrors the palace and the arcs.
  - You are the only copper and the only gold arc. Counter 在家 12/12.
- **Risk:** the mirror rule must be read once (hook) and then trusted. Day scenes have to keep the hero the brightest saturated
  thing against a bright sky (I solved it with copper vs jade/marble, not with darkness).
- **Buildability (three.js):**
  - **The reflection layer:** a mirrored copy of a second stage, rendered to a texture, flipped about the floor line and
    drawn through a ripple shader (UV displacement from a scrolling noise) with a fade mask. That is one render target per
    reflective shot and is cheap.
  - **Day sets:** the palace façade, the stepped 八 platforms with depth-sorted statues, arcs as tube/ribbon geometry with
    animated `dashOffset`.
  - **Hardest:**
    - (a) designing a matching memory composition for each present-day surface (about 8 of them);
    - (b) 12 arcs that read as water (white core + jade edge, splash sprites, the hour-by-hour one-spout sequence for A4–A6,
      only you during 你是午时);
    - (c) the brothers seen big in daylight (they need the modelling pass first).
  - **Transitions:**
    - a drop hits the floor and the ripple carries us into the memory (ripple mask, mode 4, exists);
    - tilt down through the seam (now → then);
    - the mirror empties on 「不知去了哪」.

## Look 3 · 铜壁 (the bronze wall): bold
1. **World:**
   - **The wall:** history is cast. Your 160 years are one long bronze relief wall, like a monument door, and the camera
     travels along it panel by panel (乾隆 → 1860 → London → Hong Kong → home). Every person, room and palace is a raised
     relief lit by one raking lamp, with verdigris in the crevices.
   - **You:** you alone are in the round. Real, polished red copper standing in front of the wall, casting a real shadow on
     it, glowing.
   - **The ending:** the end of the wall is still uncast: five empty niches for 龙蛇羊鸡狗.
2. **Palette and type:**

   | Role | Hex |
   |---|---|
   | Bronze base | `#86603A` |
   | Lit tops | `#FFE0B8` |
   | Speculars | `#FFEBD0` |
   | Verdigris | `#4E9A86` |
   | Vignette | `#0C0704` |
   | You | red copper (the only saturated warm colour, the only glow) |

   - Cast inscriptions (撤拍, 乾隆年间) are part of the relief, so labels and props become metal.
   - Type: Noto Serif CJK SC for captions over the bronze, with an adaptive scrim.
3. **Must NOT look like:**
   - a museum display board or a coin;
   - the demo's v2 copperplate engraving (the earlier ep45 look: line-hatched slate);
   - a dull brown monochrome (the raking light moves, the verdigris and your copper give colour);
   - a game-engine bump-map demo (one lamp, soft forms, cast grain).

- **Hook frame:**
  - You in the case at 文殊亭.
  - Behind you, the hall wall is a relief of your own story: 文殊亭 with a visitor on the left and, past the moulding, the
    first panel of the past (乾隆年间, the rabbit spouting at 海晏堂).
  - The shot opens by sliding along it.
- **Key frame (D7, 2007):**
  - A relief auction room: three bidders seated with paddles down, the auctioneer holding the gavel high (it does not fall),
    the board cast with 撤拍.
  - You stand in the round on the stand, lit. Counter 回国 4/12.
- **Risk:** the boldest one.
  - Relief figures are tonal, so readability on a phone depends on the raking light and on big, simple shapes. Small details
    like paddles get lost.
  - It is the least "warm human" look: emotion has to come from light moves (the lamp dims, your glow stays).
- **Buildability (three.js):**
  - **The relief:** each panel is a height map painted procedurally (the same vector shapes, as greys) → normal map
    (Sobel) + AO from the blurred height → `MeshStandardMaterial` with metalness ~0.9, roughness ~0.45 and the verdigris
    mask from the crevices.
  - **The light:** one moving `SpotLight` rakes the wall. The style frames fake this with SVG `feDiffuseLighting` /
    `feSpecularLighting` on the same height maps, so the look is already proven at frame level.
  - **The hero:** the copper head as a lit layer (or a real downloaded/cast-model replica if one exists with a licence)
    with a projected shadow on the wall.
  - **Hardest:**
    - (a) motion: relief figures can't walk. Motion comes from the camera dolly along the wall, light sweeps, panels
      "casting" in (molten pour → cooled relief), and a few relief parts that hinge (the gavel arm, the doors);
    - (b) generating normal maps for about 15 panels at 1080p without a 3D sculpt;
    - (c) phone readability (shapes ≥ 300 px tall, one action per panel).
  - **Transitions:**
    - a dolly along the wall where the moulding between panels is the cut;
    - the lamp swing (one panel goes dark, the next lights);
    - a molten pour that fills a mould into the next panel (A1 一次铸成, the casting beat, becomes the film's own grammar);
    - a push into your copper surface.

---

## My read (the director ranks, not me)
- **Look 1** is the safe continuation of what the owner loved. Its risk is sameness: three dusk-silhouette films in four.
- **Look 2** has the strongest idea for this story: the mirror is "home", and the water clock is literally water. It also
  breaks the run of dark films.
- **Look 3** is the most distinctive and the hardest to animate well.

**Known limits of these frames:**
- L1: the looter's torso is still slim.
- L2: the hook's reflected seat is low-contrast against the marble.
- L3: the auctioneer's near arm makes an odd angle; it needs rig work in the build.
- The brothers are proven at mid size only.
