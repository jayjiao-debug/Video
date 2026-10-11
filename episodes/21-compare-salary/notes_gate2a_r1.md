# Gate 2a notes: 为什么一比，就觉得穷？ looks v3 r1 — verdict: APPROVE Look A (玻璃展馆 Prism Gallery) for the storyboard, with the routed notes below

Ranking: **1 · A Prism Gallery · 2 · C Thermal · 3 · B Foil Party.** No look is sent back as unbuildable or unreadable.
This reverses the art director's order (C > A > B). The reasons are below.
The owner delegated the pick ("不要问…你自己可以做决定"), so the producer builds A. Log it in crew_log.md.

**No cold-read:** no `coldread_*.json` exists for these frames. This ranking rests on my own phone-size test (`scratchpad/phone_sim.png`: every frame at 480×270) plus measured contrast and render time. Producer: run the cold-reader's 5-second test on the storyboard frames at gate 2b.

## Scores (gate-2a areas only; edit and motion are judged from the written plans)

| Look | visual | info | edit (plan) | motion (plan) | vs v2 (flat moonlit, "cheap") |
|---|---|---|---|---|---|
| A Prism Gallery | 4 | 4 | 4 | 4 | Better on every axis. Real refraction, bloom, depth and 3D camera. |
| B Foil Party | 3 | 4 | 4 | 4 | Brighter and more fun. But the balloon capuchins are capsule figures, the series' rejected cheap look. |
| C Thermal | 3 | 3 | 3 | 3 | New and glowing, but still flat 2D shapes under a colour LUT. It gives the camera the least to move through. |

## Check per look

### Measured on this 2-core box (Chromium + SwiftShader, `renderAt` + readback, median of 5)
- **A:** key 4.1 s, hook 3.9 s per frame. The art director claimed 3.4–3.8 s.
  My test copy at pixel ratio 0.75, no MSAA and half-res bloom ran at **2.4 s**. At phone size it looks the same (`scratchpad/atest/lookA_key_fast.png`).
  The proposed half-res transmission patch is still unproven. **Conditional.**
- **B:** key 1.9–2.0 s per frame. The claim was 1.1–1.3 s. Slightly over budget.
- **C:** the style frames are static canvases with no `renderAt`. The key frame takes 8.0 s to draw at full res.
  The 0.55 s quarter-res figure is plausible but there is no file to verify it. It is the cheapest look by design.
- **All three:** the HTML imports three.js from the session scratchpad (`/tmp/claude-0/.../scratchpad/ep21/node_modules`). The farm cannot load that.

| | A Prism Gallery | B Foil Party | C Thermal |
|---|---|---|---|
| Buildable ≤ ~1.5 s, all ~10 scenes | Not yet. 4.1 s as built, 2.4 s with easy cuts. Heavier scenes (40 tubes, houses, crowd) will cost more. Glass-behind-glass rule needed in the monkey vitrine. | Nearly. 1.9–2.0 s measured. The CJK foil title needs an offline typeface conversion. | Yes. 2D canvas or one shader, deterministic. |
| Readable at ~1/4 phone | Yes. ¥4000 is dark-on-white on a card. The drop reads at a glance (warm tall tubes above, iced short tubes below, 满意度▼). Weak spots: the "你" marker floats between two tubes; the hook phone is small in an empty void. | Best. The foil 4000 fills the frame. Labels are pills ≥ 40 px. | Mixed. The key frame is the clearest 5-second read of all six. The hook ¥4000 is white-hot glyphs on a yellow-hot phone, contrast **1.27:1**, and 刚刚 / 实习工资 are 1.59:1. HUD text (MAX 39.6°C, 你·37.4°C, scale ticks) is unreadable at phone size. |
| 炫丽 | Yes. Refraction, prism spectrum, sheen, bloom. It is the only look with "refraction", the brief's own definition of 炫丽. | Yes. Chrome, iridescence, confetti. | Partly. Glow and colour, but no depth, sheen or refraction. |
| Never seen in series | Yes (ep20 = gold doors on a black mirror floor; ep19 = navy + gold/pink). | Yes. | Yes. But the drop frame's lower half is navy with gold figures above, which edges back toward the banned navy + gold family. |
| 运镜 | Strongest. A real 3D dolly, crane and fly-into vitrine. Needs a world with parallax (note 2). | Strong. Rides balloons upward. | Weakest. 2D pans and zooms over flat heat fields. "Follow heat through walls" has no depth to fly through. |
| 转场 | Object-carried: rainbow → plaque, fly into vitrine glass, grape facet → coin, towers → tubes, tubes → houses, window → phone, light → glass J. | Object-carried: burst → confetti → title, string tilt, grape lift. | Object-carried: steam through ceiling, heat bloom → coin. |
| 卡点 / drop | Median light-sheet snaps on; frost climbs the tubes over one beat; 满意度▼ on beat 2. Hard and on the right object. | Ribbon whips taut; balloons crumple in a wave. Pops are naturally on-beat. | Isotherm slams; cold front rolls down. |
| Carries every scene without encoding | Mostly. Light inside = happy and frost = unhappy need no decoding. The prism turning to 去年的你 is a clean, literal "choose whom you compare with". Gaps: 开心了整整三天, the 257 people choosing, 钱上最爱比, 更想跳槽, 并没有更开心 (note 3). | Yes. 泄气 is a plain Chinese idiom. Bouncy-castle houses and balloon people push it childish. | No. "Satisfaction measured in °C" plus an auto-ranging scale is a symbol system the viewer must decode, the exact failure in owner note "很难带入". Two number systems (¥ and °C) compete. |
| Childish / surveillance / generic risk | Generic (glossy gradient-void 3D render, "Apple store"). Fixable with a real gallery space and specific hero objects. | **Childish: high.** Candy pastel, party confetti, capsule-and-sphere balloon monkeys (owner: "Stylised capsule figures … read as cheap"). The grape cluster hides the right monkey's head, so it reads as a grape-headed toy. The 4 is faceted extrusion while the 0s are puffy foil. | **Surveillance: high.** Viewfinder corner brackets, MAX °C readout, a yellow targeting box around 你, a scan line that "finds you". The crowd is generic person pictograms (owner prefers our own drawn props to stock pictograms). |

## Ranking, one line each
1. **A Prism Gallery.** The only look that answers every word of the complaint (炫丽 with real refraction and light, true 3D 运镜, object-carried 转场, a hard drop on the right object, clearly not clip-art). Its one hard problem, render cost, is an engineering fix I measured as partly done (4.1 → 2.4 s), not a taste risk.
2. **C Thermal.** The boldest idea, the cheapest build and the best drop still. But it is flat 2D again (the v2 failure), encoded (°C = 满意度), surveillance-looking, and its hook number is 1.27:1 contrast. Its strengths are mainly ones the owner did not ask for.
3. **B Foil Party.** Most readable and naturally on-beat, and 泄气 is a perfect plain metaphor. But capsule-figure balloon monkeys and party pastel hit the owner's standing "cheap / 太low / childish" rejections head-on, and "master piece" is the brief.

## Notes for the winner (A), to be addressed in storyboard.md (Step B)

| # | Sev | Where | Note | Route to | Owner note it relates to |
|---|---|---|---|---|---|
| 1 | High | whole film, render | **Prove the budget before the storyboard is approved.** Today: 4.1 s/frame as built; 2.4 s at pixel ratio 0.75, no MSAA, half-res bloom (visually identical at phone size). Next: half-res transmission target (vendored three patch, or a three version with `transmissionResolutionScale`), bloom with fewer mips, dispersion only on the 2–3 hero shots. Time the **heaviest** planned shots, not the two style frames: the pay wall with ~40 tubes, the street of glass houses, the A/B worlds with the 257-person crowd, and the glass title plaque. Report s/frame per shot in storyboard.md. If it stalls at ~2–2.5 s, the producer decides whether to accept it (about 3899 × 2.4 / 60 ≈ 2.6 min per worker); do not downgrade the look to save it. Vendor three.js into `build/` (the frames import from the session scratchpad). | animator (producer decides on budget) | "模型，光源，还有流畅程度"; brief "≈1.5 s/frame" |
| 2 | High | every scene | **Build a place, not a gradient void.** The hook is a phone on a pedestal in empty magenta bokeh. Camera moves in a void read as "the object turned", not 运镜. Give the gallery real architecture: a polished floor with reflections, receding rows of pedestals and vitrines, tall sunset windows with the low sun as the key light (warm practical glow), and columns or doorframes that pass the lens for parallax. Every shot needs foreground, middle and background layers. Keep highlights under the bloom threshold over any number (the hook already has a white bloom blob on the phone screen above the ¥ card). | art-director | ep13 "运镜很舒服很爽"; ep14 3D quality bar (big readable model, warm practical glow, strong silhouettes); "大制作 every frame a still" |
| 3 | High | 4.4, 61.1, 69.2, 85.4, 89.5, 93.5 | **Fill the metaphor gaps with concrete pictures, each with its transition and hit beat.** (a) 4.4 开心了整整三天: three sun sweeps cross the vitrine, and a glass day counter 1→2→3 ticks on beats. (b) 61.1 the 257 people: 257 small iridescent, non-transmissive glass beads roll into A or B; 123 settle in A; a big 48% (≥ 92 px) lands on a beat. (c) 69.2 钱上最爱比: the day tiles fall away and only the coin towers stay lit. (d) 85.4 更想跳槽: the frosted tubes' light leans and drips toward a glowing gallery exit at frame edge. (e) 89.5 并没有更开心: the warm tubes stay exactly as bright, with no extra glow; show the non-change deliberately, held steady. (f) 93.5 比输的人在痛: hairline cracks only on the frosted tubes. Restrained, no shake. | art-director | "后面的内容好无聊" (every scene adds something); "不要encode / 很难带入"; numbers on the picture (brief) |
| 4 | High | 20.6–48.9 monkeys | **The crystal capuchins must not read as capsule figures.** Give a sculpted side-profile silhouette (muzzle, curled tail, hunched sitting pose), readable as "monkey" at 1/4 screen. Prefer a CC0 capuchin mesh re-materialed as crystal over primitive capsules. Act the experiment out: hand out the pebble, take the cucumber, the angry one throws the cucumber out of the vitrine. Put 95% / 60% / 20% as large etched placard numerals on the vitrine (≥ 92 px on screen), each landing on a beat. Obey the glass-behind-glass rule: the vitrine walls are thin iridescent, non-transmissive glass; the figurines carry the transmission. | art-director, animator | ep14 "Stylised capsule figures … read as cheap"; ep6 "干脆别画手了" (no hands, just paws/silhouette); brief faceless capuchins |
| 5 | High | whole film | **Write the beat map and the palette arc into storyboard.md.** For every line, give the bar/beat, the object that hits, and the camera move (motion every 1–2 beats; cuts on bars or half-bars; beat emphasis on the thing that appears, never on the whole frame). Two minutes of violet-magenta glass will cause 视觉疲劳, so plan a colour arc. Sunset magenta/apricot for the hook and monkeys. Cooler cobalt glass for the breakdown (48.98–65.18, A/B worlds, slow orbit). Back to warm on the build. Ice at the drop. A dawn apricot light for 113.8–125.4 as the prism turns to 去年的你. | art-director, editor | "No 爽的卡点"; ep14 beat-grid rule; "dont make the whole screen shake on a beat"; ep13 "视觉疲劳" |
| 6 | Med | 0–3 s hook | Frame 0: the glass phone fills ≥ 60 % of frame height, already moving (notification dropping in, or the prism's rainbow sweeping onto ¥4000 on beat 1). The subtitle is on frame 0. At 8.5 the roommate's taller phone must rise **beside** yours so the height difference is the comparison. Show 6000 on its card at ≥ the same size as your 4000. | art-director | ep14 opening formula; ep11 "开头的冲击力度有点弱" |
| 7 | Med | 81.4 drop (key frame) | Pin "你" to one specific tube just below the median sheet: that tube gets a gold rim and the shock ring, not a ring floating between tubes. Use one liquid colour per tube (today the warm tubes are orange on top, pink below, which reads as two liquids). Put "中位数" on the sheet's edge, ≥ 44 px. | art-director | ep15 "make sure the reading is big enough"; 5-second test (rubric 3) |
| 8 | Med | camera, all one-take sections | "Left to right forward dolly" must stay slow. No fast lateral sweeps. The 48.98 pull-back is a crane-out (up and back, eased over ≥ 1 bar), never a turn-around. Every fly-into enters along the current travel direction. | animator | ep15 "转场运镜有点让人不适应" |
| 9 | Med | 16.58 title | The glass plaque must read as a title, not a ghost. Use frosted or back-lit glass with bright solid lettering (not clear etched text that disappears into the background), big, framed, landing on the bar-8 downbeat. | art-director | ep13 "title … 现在根本不像title" |
| 10 | Low | 113.8–121.9 ending | The prism-turn device is the payoff; keep it literal. Two placards, 跟室友比 −¥2,000 and 跟去年的自己比 +¥4,000, at ≥ 64 px. The rainbow leaves the first and lands on the second on a beat. Your phone re-lights to the warm state from the hook (visual callback). 去年这时候 ¥0 must be visible. | art-director | "一个visual payoff must be a designed image" (ep14) |
| 11 | Low | process | No cold-read was run at 2a. Run the cold-reader's 5-second test on the storyboard's key frames (hook, monkeys, A/B, drop, ending) at gate 2b. | producer | SKILL gate 2a |

## Worth keeping from the runners-up (optional; the art director may use these within A)
- From C: the idea that **your thing gets colder only because something brighter appeared**. In A, the prism's rainbow can literally swing from your phone to the roommate's at 8.5, so yours dims without changing.
  The plan already half-does this. Make it the explicit mechanic of the hook and of the neighbours scene (97.6).
- From B: on-beat physical hits. Coins dropping onto towers, tubes filling and day tiles stacking can each land on a beat, glass-on-glass.

## What must not change (it works)
- **The world:** a glass museum at sunset; light inside objects = happiness; frost and drained light = comparison lost.
- **The palette family:** ultraviolet, violet, magenta, coral, apricot, glass white plus prism spectrum, with ice #5FD8FF for "below". Not navy + gold.
- **The transition chain** in looks.md: rainbow → plaque, fly into vitrine glass, grape facet → coin, towers → tubes (match-cut on verticals), tubes → houses, window → phone, light → glass J.
- **The drop design at 81.375:** light-sheet snap with the flash on the line only, frost climbing over one beat, magenta → ice drain, 满意度▼ on beat 2, one eased half-metre crane down, no frame shake.
- **The ending device:** the prism turns from the roommate's vitrine to 去年的你.
- **The engine layer** exactly as in the frames: Noto Sans CJK SC 900 subtitles on the dark strip, gold keywords, corner mark top right, Juno end card with "关注 Juno · 一起看懂世界".
- **The key frame's read:** warm tall tubes above the sheet, iced short tubes below.
- **Mean luma ~117–123.** Do not let it drift darker.

---

# r1b (after coldread_gate2a.json + producer's hybrid proposal) — verdict: APPROVE **hybrid C-in-3D** (thermal 满意度 look rendered from real three.js scenes). Supersedes the r1 pick of A.

**Decision: (1) hybrid C-in-3D.**
The cold-read is good evidence on the two things r1 could only guess at.
- **C:** the viewer read heat = satisfaction unaided, called it never-seen and 扎心, and would watch it for 2 minutes. My "encoded" objection is refuted.
- **A:** the viewer saw a 广告感 phone-launch render and had to decode the tubes. The "generic" risk I listed is confirmed, and that is exactly the "never seen" word the owner used.
- **The hybrid:** it removes my other C objections (flat 2D / no 运镜, surveillance cues, 1.27:1 hook contrast, navy + gold drift) without losing the idea.

**Revised ranking:** 1 · hybrid C-in-3D · 2 · A Prism Gallery (fallback if the hybrid's proof frames fail at 2b) · 3 · C as 2D (flat again; it would repeat v2's "no 运镜") · 4 · B.

**Condition (gate 2b cannot approve without it):** the hybrid has no frame yet. Before storyboard approval, provide:
- three proof stills from the real pipeline: hook at 3 s, monkeys at 38 s (cucumber one cold, grape one hot), drop at 81.6 s;
- one 3-s camera-move test clip;
- measured s/frame on the heaviest shot.

The cold-reader re-reads the three stills.

## Top notes for the storyboard (hybrid)

| # | Sev | Where | Note | Route to | Owner note / evidence |
|---|---|---|---|---|---|
| H1 | High | whole film | **Forms must read as 3D, not as flat blobs.** Heat per pixel = the object's 满意度 scalar × a shape term: a rim/fresnel boost plus a soft normal falloff, so a head, a phone edge and a capuchin's back show volume. Add depth falloff (distant objects slightly cooler and softer) for depth. Add 炫丽 cues the brief asks for: heat shimmer above the hottest object (screen-space refraction wobble), steam, and bloom only on the hottest band. Cold must never read as a black hole: the floor of the ramp is mid violet (≈#681696) or ice. Mean luma ≥ 90 (cold-read: "dark empty rectangle reads as a dead black hole"). | animator, art-director | ep21 v1 "too dark"; "炫丽 = real light, depth, texture"; coldread frame 5 |
| H2 | High | whole film, camera moves | **No flicker, no crawling contours.** Diffusion blur radius scales with depth (world units, not fixed pixels), so the glow doesn't swim when the camera dollies. Isotherm contours are anti-aliased and drawn only where the heat gradient is strong. No contour noise on flat cold areas (cold-read: the lower crowd is "glitchy mush"). Cold figures get one clean ice-cyan rim silhouette instead of stacked contours. `renderAt(T)` stays pure (no temporal accumulation). Check a camera-path contact sheet for shimmer between frames. | animator | ep15 "the ground is flickering"; coldread frame 6 |
| H3 | High | HUD, all scenes | **One legend, no surveillance.** No corner brackets, no target box, no scan line, no °C readouts, no "MAX/IR" text. One big legend bar "满意度 · 越开心越热" (≥ 44 px, readable at 1/4 screen; the cold-reader couldn't read "IR · 满意度热像", the label that explains the concept). Show it from 0:00 to the title, then only when a scene re-uses the scale. Mark 你 with a gold label and a soft gold halo on the figure, not a box. Keep that moment: it is what stuck with the cold-reader. Numbers on screen are only the script's (¥4000/6000, 95/60/20 %, 257, 48 %, 85 %, 2008, the end placards), at ≥ 64–92 px. | art-director | brief "no reticle"; coldread frames 5 and 6 |
| H4 | High | 0–16.4 hook | Text on hot objects is dark/cold "print": ¥4000 in deep violet on the white-yellow phone, aiming for ≥ 4.5:1. The 刚刚 / 实习工资 small labels are cut or made ≥ 40 px. Keep the auto-range mechanic plainly visible: at 8.5 the roommate's phone (6000) blazes on the top bunk, and over 2 beats yours cools from yellow to magenta while its number doesn't change (不香了 on 12.5). Frame 0: the phone fills ≥ 60 % of the height and is already warming. The "you" figure is a side or back three-quarter view so it reads as a person looking at their phone. | art-director, animator | ep14 opening formula; r1 contrast 1.27:1 |
| H5 | High | 20.6–48.9 monkeys | Steal B's strongest moment (cold-read: "cucumber monkey going cold while the grape one glows… I'd send to friends"). Sculpted capuchins in side profile, faces hidden by pose rather than blank, so the emotion reads through posture. The grape is the hottest object in the room. The refusing monkey cools and **throws the cucumber**: a hot-to-cold arc out of the vitrine on a beat. 95 / 60 / 20 % as big numerals in the scene, each on a beat. Never cover a monkey's head with the grape. Thermal hides model detail, so silhouette quality is what matters. | art-director, animator | coldread "steal_from_B"; ep14 side-view rule |
| H6 | High | whole film, 卡点 + palette | Beat map in storyboard.md: per line, give the bar/beat, the object that heats or cools on it, and the camera move. Motion every 1–2 beats, cuts on bars or half-bars, never pulse the whole frame. Palette arc inside the ironbow so 2 minutes don't tire: warm night dorm, the lab, a cooler breakdown in the A/B towns (48.98–65.18, slow orbit), heat returns on the build, ice-cyan + white at the drop, white-hot flare at 113.8–117.8. Cold = ice-cyan #50E6FF + white frost on a violet/ice ground, **not navy**. Warm crowd above stays orange-yellow but the background is magenta, not navy. | art-director, editor | "No 爽的卡点"; banned navy + gold; ep13 视觉疲劳 |
| H7 | Med | scene coverage | Every line gets a picture.
- 开心了整整三天: the phone stays hot across three day/night cycles in the window.
- A/B worlds: coin towers as heat columns, 1 coin = 2.5万, A 2 vs 1, B 4 vs 8. 257 small heat figures walk in; 123 to A; 48 % lands big.
- 85 %: the towers become day tiles and the figures re-sort.
- 钱上最爱比: only the coins stay hot.
- 2008 pay list: the tiered hall of staff sorted by pay, with an illustrative public list board.
- 更想跳槽: cold figures turn toward a warm doorway.
- 并没有更开心: the warm tier holds its exact heat.
- Neighbours: the street with your house's heat constant while the neighbours heat up, so yours *reads* colder (auto-range again).
- Ending: the roommate's phone leaves the view, the reference becomes last year's cold ¥0 phone, and yours flares white: +4000. Two placards: 跟室友比 −¥2,000 / 跟去年的自己比 +¥4,000. | art-director | "every scene adds something"; script.md picture column |
| H8 | Med | render | Unlit heat pass + depth-scaled blur at half or quarter res + LUT + contours + bloom. Measure on the heaviest shots (the 257-figure towns, the tiered hall, the street) and report s/frame; target ≤ 1.5 s. Vendor three.js into `build/` (the style frames import from the session scratchpad). Use instancing for crowds. | animator | brief budget |
| H9 | Med | camera | One operator's take, always forward, down or up, following heat. Mug steam → crane up through the ceiling into the lab. Grape bloom → match-cut to the sun-coin over the towns. Crane down through the median isotherm at the drop. No 180° turns, no fast lateral sweeps; fly-throughs never pass through a model or a floor. | animator | ep15 "转场运镜有点让人不适应"; ep14 "不要穿模" |
| H10 | Med | 16.58 title | Plaque drawn from heat, flashing white-hot on the bar-8 downbeat. The lettering is solid and readable (dark-on-hot or white with a cool outline), framed, big. Not a contour ghost. | art-director | ep13 "现在根本不像title" |

## What must not change (hybrid)
- **The idea:** the frame is a thermal view where heat = 满意度, and your thing cools only because something hotter appeared (auto-range).
- **The ironbow ramp:** #260A68 → #681696 → #BA2280 → #EE3E56 → #FF761A → #FFBE28 → #FFEC96 → #FFFFFA, with the ice accent #50E6FF for "below".
- **The drop at 81.375:** the median isotherm slams across the tiered hall (flash on the line only). A cold front rolls down over two beats. 满意度▼ on beat 2. The camera cranes down through the line. You sit just under it, marked in gold.
- **The transition chain:** steam → lab; grape bloom → coin; tiers → street; back to your phone + one hot grape; reference switch → white flare; violet settle → J end card.
- **The engine layer:** Noto Sans CJK SC 900 subtitles on the dark strip, gold keywords, corner mark, Juno end card "关注 Juno · 一起看懂世界".
- **The r1 notes for A no longer apply** except the process notes (beat map, vendored three, cold-read at 2b).
