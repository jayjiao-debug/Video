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

---

## Hybrid (owner pick)
Owner, 2026-10-25 13:30: 「一般他们喜欢暗调的能在晚上观看，我感觉1和3都不错但是各有各在不同场景的强项」, and remove the tear (S2 a).
Art director, v3. Stills: `style/v3/{hook_L1, key_L1_1860, handover, key_L3_2007}.png`, sheet `style/v3/sheet.png`,
sources `style/v3/src/` (`hero.js` the rebuilt hero, `figs.js` figures, `sc1860.js` the 1860 stage, `relief.py` the bronze
shader, `build.py <name>` renders a frame, `sheet.py` the sheet).

**The idea in one line:** what you **live through** is L1 铜灯影 (silhouette theatre, you are the only light); what was
**put on record** is L3 铜壁 (a bronze relief wall under one raking lamp, only you in the round). The auction years are
the public record, so they are cast; everything done to you by hands (made, carried, signed for, unveiled, driven home) is
lived, so it is theatre. Ho's deal was private (私下), so the camera steps **off** the wall for it.

### The split (improved from the producer's)
- **L1** (29 lines, plus K1b where the switch happens): C1 museum · C2a/D7a/E2 Ho's room · C2b/E1 the 2019 hall · T1/T4/T5 · A1 casting · A2–A4 the
  海晏堂 water clock (memory) · B1–B3 1860 · H1–H5 the 2020 night van, the doors, the courtyard, the ear.
- **L3** (22 lines): T2/T3 (flashes of the wall in the cold open, so the second world is planted in the first
  15 s) · D1–D6b 1989/2000/2003/2007 · D8 the prices cast as two columns · D9–D11 2009/2013 · K1b–Q the end of the wall.
- **Changes vs the suggested split:** T2/T3 move to L3, so the wall is seen before it takes over; D8 (the price
  comparison) is cast, because a number on record belongs to the wall; the ending starts on L1 (K1a, the memory
  fountain, a callback to A4) and **cools into** L3 on K1b, so the last switch is the story's own turn (memory →
  record); the title plaque is cast bronze (the material of both worlds' hero).

### The two hand-overs (each crossing below is a different move: owner row 86)
1. **L1 → L3, "it sets into bronze".** The lived scene stops moving and becomes metal: a cooling front (a strip of hot
   copper glow under smoke) crosses the frame and leaves a cast relief of the same composition behind it, lit by the
   raking lamp. The camera then dollies right along the wall, and the moulding between panels is the cut.
   Uses: B3 → D1 (smoke), D7b → D8 (the price card is poured), K1a → K1b (the memory cools). Still: `handover.png`.
2. **L3 → L1, "the lamp leaves the wall".** The raking lamp narrows to one practical light in the next lived room,
   and the relief around it falls into the dark. The silhouette room rebuilds around that same light.
   Uses: D6b → D7a (the work lamp → Ho's desk lamp), D11 → E1 (the cast certificate → a paper one under your glow).

### One shared rule (so it is one film)
1. **One hero, one copper.** `K.horseHead` (hero.js) is the same asset in both worlds:
   - ramp `#FFD9A6 / #E8874A / #B4532A / #6A2612 / #250B04`;
   - true scale ¼ of a person;
   - ears straight before 1860, the near ear folded from 1989.

   You are the only saturated red-copper in every frame. Fire is yellow-orange (`#F09A50`, `#FFB04E`), and the L3
   bronze is desaturated. Its ramp in relief.py: `#0F0A06 → #3C2B1C → #7E5E3E → #CEA676 → #FFE8C2`, with a muted
   石青 patina `#546E64` only in deep crevices and only in patches (no edge fringe).
2. **One light direction.** The key always comes from upper-left:
   - L3: the lamp at az 145°, el 24°;
   - L1: the dusk sky or the fire behind-left.

   Shadows fall down-right in both worlds. Your glow is always the second light, rimming whatever is near you on
   your side.
3. **Time runs left → right** in both worlds: the looter exits right, the wall dollies right, and the van drives
   right. A hand-over never reverses screen direction.
4. **One texture layer.** The engine grain pass is the same over both worlds (or off over both, row 44). It is never
   on one world and off the other. The cast grain of L3 lives in the material.
5. **One caption layer.**
   - It is the ep43 v6 layer, unchanged.
   - The adaptive scrim (`bk` 0.5) switches on only over L3's brighter bronze.
   - The story counter follows the picture: tally dots render at ≥ 28 px.
   - The age counter and the stamp's second line are dropped (S6).
6. **One brightness band.** L1 night/indoor mean luma ≥ 45 (the hook ≥ 70). L3 55–70.

### Buildability
- **L1:** ep43's three.js 2.5D stage engine, as in my v2 note.
- **L3:**
  - Each panel is a height map drawn with the same vector shapes. relief.py's maths (normals, AO, cavity mask) is
    baked into normal and AO textures on a plane, lit by one moving three.js `SpotLight`.
  - Figures that act (porters, Ho shaking hands, the clerk with the stamp) are **separate relief cut-outs on their
    own planes**, driven by the IK rig, with the same shading. You are a separate lit layer in front of them with a
    projected shadow.
  - **Still owed before the build (director L3-4):** a 5-s motion test of one relief figure carrying you (D2b, the
    porter).

### Scene by scene (script v5 / lines_v5 ids)
| id | world | one-line picture | → transition into the next |
|---|---|---|---|
| C1 | L1 | 正觉寺·文殊亭 at dusk: you in the glass case glowing, a visitor at the case's depth (her head ≈ ½ of you), the courtyard through the bay (`hook_L1.png`) | **glass-reflection rack:** a desk lamp appears in the case glass; focus racks into the reflection, which becomes Ho's room |
| C2a | L1 | Ho's room 2007: he signs (right hand pen, left hand flat), price card already 6910万 beside you | **draped-shape match:** he lays a cloth over you; the covered form cuts to the lit hall |
| C2b | L1 | 2019 hall: two staff pull the cloth off you with both hands | **cloth wipe** toward the lens |
| TTL | L3 material | the title as a **cast bronze plaque** (your copper profile + twelve arcs), slams in | hard cut (format) |
| T1 | L1 | smoke on the terrace: a looter in a kepi lifts you with both hands off the stone body | hard cut |
| T2 | L3 | flash of the wall: the 1989 London panel, the relief gavel arm strikes on the beat | hard cut |
| T3 | L3 | flash: the 2007 panel, the gavel **lying still** on its block, the 撤拍 board (gate-1 v5 note 1) | hard cut |
| T4 | L1 | night, the 正觉寺 courtyard gate: two staff push the doors open a crack, copper light on the flagstones | **crane up:** the strip of door light shrinks to a dot = your medallion |
| T5 | L1 | a ring of twelve medallions over the dark garden: seven lit, five dashed | **rewind** (ring spins back, flashes T4 → T1 in their own worlds) into the foundry glow |
| A1 | L1 | the foundry: tongs tip the crucible, the pour, the mould knocked apart: you glow, seamless (≈ ¼ of the founder) | **profile match:** your face cools to copper in the same screen spot, now on a stone body |
| A2 | L1 | noon memory, silhouettes on a pale-gold sky: the twelve in a 八 by the pool, you the warm one; 在家 12/12 | the sun's shadow starts to move |
| A3a | L1 | time-lapse: one arc at a time passes from head to head | **ride the arc** from the snake across the pool to you |
| A3b | L1 | close on you; only you spout | fast pull-back as the eleven fire outward |
| A4 | L1 | all twelve arcs up on the hit | **light change** noon → red dusk, tilt down to the flagstones |
| B1a | L1 | soldiers in kepis walk in on the front flagstones | continuous track |
| B1b | L1 | a crate carried in both hands, a vase hugged, walking out left | picture pause |
| B2 | L1 | fire flares behind 海晏堂 on the hit; embers | **push through the embers** to your seat |
| B3 | L1 | the looter lifts you in both hands and walks right; your seat between 龙 and 猴 is empty; 在家 11/12 (`key_L1_1860.png`) | **hand-over 1, "it sets into bronze":** a cooling front under smoke turns the stage into a relief behind him (`handover.png`); counter → 回国 0/12 once the seats are covered; dolly right along the wall |
| D1 | L3 | 1989 London panel: you in the round on the relief podium under the lamp; relief bidders' paddles rise on the beat | ease from you to the lectern |
| D2a | L3 | the relief gavel arm winds up and strikes; the cast lot card flips to 几十万美元 | same shot |
| D2b | L3 | a relief porter (cut-out plane) lifts you, in the round, into a crate | **lamp swing:** this panel goes dark, the next lights |
| D3a | L3 | 2000 Hong Kong panel: 牛 猴 虎 set on the podium in relief, one per beat | continuous |
| D3b | L3 | three strikes; three cast cards flip to 购回; counter 0 → 3 | **dolly right**; the moulding is the cut |
| D4 | L3 | 2003 panel: Ho and the seller shake hands over the pig head on its crate (relief) | **crate match:** the pig's crate becomes your crate in the 2007 panel |
| D5 | L3 | 2007: two relief porters lift you out and set you on the pedestal; empty chairs with catalogues; the gavel on its block | continuous |
| D6a | L3 | the room before the sale: the gavel lies still, 撤拍 board, a gloved porter beside you (≈ 4× your height) (`key_L3_2007.png`) | same shot |
| D6b | L3 | the board's letters rise as 撤拍; the lamp dims row by row until only your pool is left | **hand-over 2, "the lamp leaves the wall":** the pool narrows into a desk lamp; the relief falls dark; the silhouette room builds around it (off the record) |
| D7a | L1 | Ho's room (the C2a callback): he walks in, sits, signs | same shot |
| D7b | L1 | the price card stands up: 6910万港元 slams in | **the price is poured:** the card slides right off the desk and lands on the wall as the cast cap of a bronze column, molten metal filling it |
| D8 | L3 | two cast columns on the wall: 几十万美元 short, 884万美元 tall, bracket 二十多倍 cast between | **rise up the tall column**; its capital is the ceiling moulding of the Paris panel; tilt down |
| D9a | L3 | 2009 Paris panel: rat and rabbit in relief on the podium; a phone clerk with a handset raises the paddle (F19: the buyer was on the phone) | continuous |
| D9b | L3 | the strike; the cast result board: 鼠首 + 兔首 · 3149万欧元 | same shot |
| D10a | L3 | a clerk drives a die into the result line: 未付款 is punched into the bronze | **pan to the phone desk** |
| D10b | L3 | the handset laid down, the paddle left on an empty chair (screenwriter: F19 says the buyer was never in the room) | **push past the empty chair**; the lamp warms |
| D11 | L3 | 2013: two relief figures pass one certificate, both hands on it; two medallions light; 回国 7/12 | **hand-over 2b, cast → paper:** the camera follows the certificate down; as it is laid on a table it is paper under your glow (the 2019 hall) |
| E1 | L1 | the 2019 hall (the C2b callback): the cloth pulled off, a donation plaque | **lateral track left** through a wall edge into Ho's room at night |
| E2a | L1 | Ho's room empty, the lamp on; it goes out on the music's stop | same shot |
| E2b | L1 | the dark room: one star in the window, a curtain stirring | **push through the window into the star** → the glow in your crate |
| H1a | L1 | the van drives night → dawn, your glow between the slats, parallax trees | forward **through the gate** |
| H1b | L1 | the T4 doors open on the drop; copper light spills; you stand in the 文殊亭 | continuous |
| H2 | L1 | slow orbit around you, 1860 → 2020 | **crane up** |
| H3a | L1 | the T5 ring forms over the courtyard; seven light | same shot |
| H3b | L1 | six medallions arc away to 保利 (4) and 国博 (2); yours stays: 回家 1/12 | **pull back wide** |
| H4 | L1 | the courtyard among the ruins; the ghost of B2's smoke stops at the temple wall | **push in and orbit** to your profile |
| H5a | L1 | close-up: the folded near ear fills ~30 % of the height (the S4 fold with the lit bend) | same shot |
| H5b | L1 | a thin ring closes on the fold | **ring → basin** of the remembered fountain |
| K1a | L1 | the memory fountain at noon (the A4 callback): twelve arcs | same shot |
| K1b | L1 → L3 | eleven arcs fall; brother by brother, from the far end inward, the memory **cools into the wall**; only you and your arc stay copper and alive | (hand-over 1c, in the shot) |
| K2a | L3 | the last panel: twelve niches; six get small cast tags 保利 ×4 · 国博 ×2 | same shot |
| K2b | L3 | five niches are uncast: rough mould cavities with incised outlines of 龙 蛇 羊 鸡 狗 | **dolly right**; the dragon's outline leads into a small 2018 panel |
| K3a | L3 | 2018 France panel: the gavel arm already raised, strikes on the final hit; the dragon outline shakes | same shot |
| K3b | L3 | the outline half-fills with molten copper, then drains; an incised ？ | **lamp out, panel by panel**; pull back through the dark to the wall's end |
| Q | L3 | the end of the wall: eleven niches (six tagged, five empty), you in the round with your single arc catching the lamp; the Juno end card forms over it | end |

### The stills (v3)
| Still | Mean luma |
|---|---|
| hook_L1 | 72 |
| key_L1_1860 | 61 |
| handover | 71 |
| key_L3_2007 | 66 |

Every still was checked at full size and at 400 px wide.

**Hero fixes (S1–S4) are in `src/hero.js`:**
- the cast copper eye: a dome, an incised pupil ring, a brow ridge, no white and no dot;
- no tear line, and no line from the eye corner;
- three layers of grooved, wavy locks of unequal length, with shadows under them;
- curled forelock locks;
- the neck as deep as the jaw, ending in a cast collar ring;
- a darker core shadow and narrow unblurred speculars;
- the folded near ear drawn as one leaf, with the top third bent forward and down and a lit bend.

**Captions:** S5 and S6 are applied:
- line 1 has no tag;
- the lines come from lines_v5;
- the stamps keep line 1 only;
- the age counter is dropped;
- the dots are ≥ 28 px.
