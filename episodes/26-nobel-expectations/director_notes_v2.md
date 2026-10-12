# Director notes · ep26 《画饼，到底有没有用？》 · v2 full cut (gate 4, owner round 1)

Reviewed: `out/画饼_v2_发送版.mp4` (2:43), every frame at 5 fps (28 sheets), 15 fps strips around 2.2, 13.3, 16.4, 34.3, 68.0, 73.3, 81.2, 148.0, HD stills at 22 points, per-frame luminance of the whole film, the source (OpenC/OpenB/Film27/kit/Open26) and the v1 contact sheet.

## 1. Verdict: **REVISE**

The story, the subtitles and the music anchors are right (title lands at 16.63, vault at 81.43, end card at 154.37). The craft is not. These are the biggest problems, in order:

1. **Every scene change is a blink to black.** Per-frame luminance shows 12 hard cuts to near-black (luma 45–65 → 18) followed by a 0.25 s fade-up: 20.67, 49.00, 63.20, 73.53, 76.50, 83.70, 86.70, 98.53, 111.17, 123.60, 135.67, 154.37. There are also two cream flashes, at 16.63 (luma 45 → 127) and at 81.43 (40 → 151). That is a stutter every 10–15 s. It is the main reason the film feels "not smooth", and it breaks owner rows 15, 33, 55 (no flashes) and 56 (same phone means a continuous move).
2. **There is no camera, so the film plays like a slideshow.** Every scene is a locked frame where props fade in place. Long dead holds: 43.3–49.0 (city band plus one banner), 49.0–52.0 (a lone IOU), **86.7–98.5 (the same loop diagram for ~12 s, only labels change)**, 111.2–120.5 (two cards), 126.8–135.6 (phone plus box shop). This breaks owner rows 14, 29, 33 and 72.
3. **The spine object never travels.** The 饼 appears and disappears by fades. Draghi's 饼 does not move onto Spain's IOU (it pops there after a black cut at 73.53). The 2D medal does not become the 3D medal (it jumps from small, bright and centred to huge, dark bronze and left, with a flash). The phone that runs from 126 to 154 s is cut to black and re-shown at 135.67.
4. **Many props are clip-art.** The temple bank reads as jail bars. The euro notes are mint rectangles. The cart is a line icon. The loop is a boxed flowchart. The scale is a stick drawing. The weather card is an emoji on a navy card. The noodle shop is a box with scallops. The vault is a cardboard box. The city is confetti squares. Next to the good opening (lock screen, app, textured 饼) they look template-made (owner row 72).
5. **Visual bugs and readability:** ghosting at 144.8 and 148.0 (the cracked 饼 and its caption come back during cross-fades). The "2012 · 欧洲" tag collides with the 意大利 IOU (60.8–63.2). A full-frame black overlay dims the red key line "下次，没人信了" (121–123.6). A 3 px, 6 Hz shake on the IOU reads as judder. Typing dots on the "管着全国钱的人" banner (owner row 54). Per-frame film grain (owner row 44). About 20 labels are 26–42 px and in serif (owner row 76). The one verified hard number (the spread falling from 6+ to under 3 points) is missing: the frame only shows a 34 px "借钱的利息↓".

**v2 compared with v1 (contact sheets):** the layout, props and transitions are the same. v2 improved the 饼 texture and some type sizes; motion and transitions did not change. That matches the owner's note.

### Scores (gate 4 areas, evidence above and in §3)
| Area | v2 | Evidence |
|---|---|---|
| 1 Script | 4 | Paradox and number (¥0 / +¥32) by 0:05; clear spine. Keep. |
| 2 Visual design | 3 | Coherent palette and key light; generic clip-art props (§4); white phone slabs out-shine the hero (131, 140 s); overlaps at 61 s. |
| 3 Information design | 3 | Hall chart reads but its lines and labels are thin and small (30 px); the spread number is missing; the loop needs the subtitle to be understood. |
| 4 Editing / transitions | 1 | 12 dips to black and 2 flashes; only one motivated transition (饼 flips into medal). |
| 5 Motion | 2 | Things are eased, but there is no camera, holds run up to 12 s, there is jitter, and the medal flip is flat (scaleX only). |
| 6 Sound | n/a | Not re-assessed. The anchors hit (16.63 / 81.43 / 154.37). |
| Overall | 2 | The owner would send it back, and already has. |

## 2. Keep (do not break these)
- All subtitles, line timings and the music anchors: title on drop 1 (16.625), vault opening on drop 2 (81.43), the silent hold on the closed vault 79.4–81.4, end card at 154.34. **No timing change is needed for any note below.** Transitions are scheduled inside the existing line windows.
- Opening 0–13.4 s and its concrete actions: lock-screen banner from 老板 at 21:04 (good first frame, see 1.5 s), the tap ¥26 → ¥58 with the "¥0 到账 / +¥32 多花了" pair, the 预期 ring rising out of 去结算, the dashed tie from the 饼 to the boss's banner, the bite with crumbs.
- The textured 饼 (OpenB `Bread`) as the recurring object: boss → Draghi → cracked → kept vs broken.
- Title card typography and layout (serif, gold second line, subtitle rule).
- Concepts that work: the "0 次" stamp slam, the vault "一分钱都没有" reveal, Hall's news day vs payday with the X over the old jump, the ¥58 → ¥26 callback, 说到做到 vs 说了不做, the five gold ticks.
- Look B: near-black, one warm key light, champagne gold for ideas, muted crimson for fear. Juno end card.

## 3. Global motion spec (apply everywhere; add to kit.tsx as tokens)

**Easing tokens**
| Token | Curve | Use | Duration |
|---|---|---|---|
| `EASE_IN_OUT` (enter) | `cubic-bezier(0.16, 1, 0.3, 1)` (expo-out) | anything arriving: props, labels, numbers | 0.5–0.7 s (labels 0.45 s) |
| `EASE_OUT` (exit) | `cubic-bezier(0.7, 0, 0.84, 0)` (cubic-in) | anything leaving; exits are faster than entrances | 0.3–0.4 s |
| `MOVE` | `cubic-bezier(0.65, 0, 0.35, 1)` (in-out cubic) | objects travelling inside or between scenes | 0.6–1.2 s |
| `CAM` | `cubic-bezier(0.45, 0, 0.55, 1)` (in-out sine) | every camera move | 1.0–3.0 s |
| `SPRING` | Remotion spring, damping 15, stiffness 120, mass 1, overshoot ≤ 6 % | landings, drops, banners, a scale settling | — |
| `SLAM` | scale 1.25 → 1 over 0.2 s with `Easing.out(Easing.back(1.4))`, plus a 2-frame 3 px shake **of the stamped object only** | stamps, the vault bolt release | 0.2 s |
Nothing uses `Easing.linear` except a constant drift or a continuously flowing dash.

**Entrances and exits**
- No bare opacity. Every entrance = opacity (first 60 % of the time) + either translate 24–40 px along the direction of travel or scale 0.94 → 1. Text may add blur 6 → 0 px (kit `rise`). Props never blur.
- Exits: reverse the entrance with EASE_OUT. Outgoing and incoming content in the **same place** must not overlap: outgoing ends, then incoming starts 0.1 s later. Or use a cross-move (old moves up and out, new comes up from below). This also prevents the ghosting bug in §4 #6.
- Stagger groups by 60–90 ms (ticks, notes, coins, windows by distance). Never move a group in lockstep. Use at most 6 staggered items, then switch to a wave.
- Numbers roll (a counter with scroll detents), never swap. Colour and light changes ease over ≥ 0.4 s.
- **Must never pop:** props, labels, banners, numbers, backgrounds, light pools, the whole frame. Subtitles are the only thing that may hard-switch (keep them as they are).

**Scene transitions** (cuts to black are banned, flashes are banned). Four allowed types; §4 #1 assigns one to every boundary:
1. **Camera move in one world:** truck, pan, tilt or pull-back to the next subject sitting in the same space (CAM, 0.9–1.4 s).
2. **Dive or match:** push into an object until its texture or light fills the frame, and that texture is the next scene (MOVE, 0.8–1.0 s); or the reverse pull-out.
3. **Shared element:** one object (饼, phone, banner, paper, gold dot) travels from its last position in scene A to its first position in scene B (MOVE along a gentle arc, 0.6–0.9 s) while the backgrounds cross-dissolve underneath it. Start from the object's exact last pivot, scale and drift (owner row 58).
4. **Light-wipe:** the single key light slides from the old subject to the new one. The old subject falls into darkness because the light left it (compute its brightness from distance to the light), not through an opacity fade (0.8–1.0 s).
Fallback only: a ≥ 0.6 s cross-dissolve where both scenes are in motion, never through black. Transitions start 0.4–0.6 s before the new line and finish on the nearest beat at or after the line start. The bar grid is ≈ 2.025 s per bar and beat ≈ 0.506 s (from the anchors: 16 bars from 16.625 to 49.0); the editor confirms by measuring.

**Camera**
- Wrap every scene in a `<Camera x y s>` transform. Each scene gets at least one motivated move (follow, reveal, dive). Between moves there is a drift of ≤ 1.5 % scale and ≤ 20 px per 5 s on CAM.
- Keep one travel direction within a section (owner row 67): Europe section trucks left to right, Woodford section left to right, "near you" section dives in. No 180° reversals and no fast sideways sweeps.
- Parallax: 3 layers. Background light/haze at 0.3×, props at 1×, foreground edge props at 1.3×. Labels ride with their prop. Subtitles and the Juno mark never move.
- No whole-frame zoom or pulse on beats (owner row 54). Beat emphasis goes only on the thing that appears.

**Holds and jitter**
- No frame unchanged for > 3 s, except the silent gap 79.4–81.4 (the hold is right there). No element unchanged for > 6 s.
- Delete all sine shakes on objects (Loop `shake`). Bobs: amplitude ≤ 4 px, period ≥ 3 s. Impact shake only through SLAM.
- **Remove `<Grain/>` everywhere.** Owner row 44 says no film grain. Re-seeding it every frame also wastes the ~2 Mbps budget on the dark gradients and makes them crawl.

**Type (all scenes; owner row 76 plus the look-B readability ask)**
- Serif (Noto Serif CJK / Cormorant) only for display words ≥ 72 px: 预期, 我保证, 一句话, big numerals, the title and end card.
- Every label, tag, pill, plate subline and phone UI text: 思源黑体 Bold/Black. Labels ≥ 52–56 px, tags ≥ 40 px, key numbers 96–160 px. Each sits on a feathered scrim (blur ≈ 34 px, 0.55–0.6 opacity, scene-tinted, no border; owner row 78). No boxed pills.

**Preview before re-render (owner row 75):** first send the owner one 20–25 s preview, with stills, containing 3 items: (a) the title transition, (b) the vault set-piece 76–87 s, (c) the Near → Back phone continuity 133–140 s. Wait for his OK before the full render.

## 4. Ranked fix list

Kind: **M** = motion, **V** = visual experience, **I** = illustration. Role in brackets.

### #1 · All scene boundaries · M · [editor + animator]
**Problem:** 12 cuts to black plus 0.25 s fade-up (`Film27` `fadeIn` from `#000`, `TitleB` `out`), plus the flashes at 16.63 and 81.43 (`flash` in `TitleB` and `Vault`). Luminance evidence is in §1.
**Fix:** delete `fadeIn`, `TitleB.out` and both `flash` layers. Render adjacent scenes overlapping (each scene gets `[from − 1.0, to + 1.0]` and a `tr` progress). Use this table (times are the existing line starts):

| # | Boundary | Type | Exactly what moves |
|---|---|---|---|
| T0 | 2.50 lock screen → app | 1 + 3 | The tilted phone rotates to frontal: rotateX 46 → 0, rotateZ −16 → 0, slides to PX/PY, scale 1 → 1.12 over 2.25–2.95 (MOVE). The screen cross-dissolves lock screen → app inside the phone only (2.45–2.75). The table plane slides down 120 px and darkens out of frame (0.5× parallax). Replaces the current cut. |
| T1 | 16.0–16.625 medal → title | 3 | See #4. |
| T2 | 20.73 title → Hall | 4 | A gold light streak (3 px line with 40 px bloom) sweeps left → right at y = 700 from 20.45 to 20.95. The title text exits upward (EASE_OUT 0.35 s) and the medal image fades out above the streak. Where the streak passed, the chart's x-axis remains (the streak *becomes* the axis). |
| T3 | 34.53 chart → app | 2 + 3 | The boss banner, which landed on the "今天" tick at line 11 (see #11), scales up along an arc into the phone's banner position (34.1–34.9, MOVE). The phone and its app screen assemble around it (phone frame enters at scale 0.94 → 1). |
| T4 | 37.64 app → city | 2 (pull-out) | The phone shrinks into one lit window of the nearest building (scale 1 → 0.035 over 37.4–38.4, CAM). The city fades in around it at 0.3× speed, then the existing pull-back continues. The window it lands in keeps the phone's cool-white glow. |
| T5 | 46.23 boss → nation | 3 | The same banner stays. The sender text rolls vertically "老板" → "管着全国钱的人" (0.3 s), the icon cross-dissolves to a gold ¥ seal, the body keeps "明年……" without dots. Then a gold ripple runs through every window from the centre outward (0.9 s, stagger by distance, each window a 0.15 s brighten pulse). |
| T6 | 49.0 city → IOU (breakdown) | 4 | Lights-out: windows switch off in a wave from the frame edges inward (48.4–49.0, stagger by distance). The last lit window at centre grows (49.0–49.7, CAM) into the key-light pool on a dark table. The Spain IOU drops 30 px into the pool and its shadow tightens (SPRING). |
| T7 | 63.25 loop → ECB (build) | 1 | Camera pulls back and up (scale 1 → 0.75, y +180, 62.9–63.9) while the crimson glow drains. The ECB tower rises into frame at right (translateY 320 → 0, 1.2 s, EASE_IN_OUT). Its floors light one by one on the build's beats through line 22. |
| T8 | 73.0–73.82 Draghi → loop | 3 | The 饼 flies from the lectern (see #3) along an arc to the IOU: scale r 170 → 120, rotate 0 → 8°, MOVE 0.8 s. It lands with SPRING and shadow contact. The ECB / lectern side trucks out left (CAM) while the loop table slides in under the 饼. This is the script's "把饼放在借钱桌上". |
| T9 | 76.2–77.2 loop → vault | 1 | Truck left along the same table by −1,400 px (CAM 1.0 s) to the vault door, which stands in its own light pool. The loop exits right. |
| T10 | 83.3–84.1 vault → ledger | 2 | Push into the open vault (scale 1 → 2.6 toward the interior). On the empty shelf lies the open ledger, which ends full-frame. |
| T11 | 86.4–87.4 ledger → loop | 2 + 1 | Reverse pull-out of the vault, then truck right back to the IOU with the 饼 on it. Same world, same direction rule: this section is one table. |
| T12 | 98.2–99.0 loop → book | 4 | The key light slides right from the IOU to Woodford's book. The IOU darkens because the light left it. |
| T13 | 102.0–102.6 book → scale | 1 | Truck right one screen. The book stays as a 1.3× foreground parallax edge at left until it exits. |
| T14 | 110.9–111.7 scale → cards | 3 | The "一句话" paper on the right pan lifts (SPRING), flies to centre-right and unfolds into the 我保证 document (scaleY 0.4 → 1, a two-panel fold opening). The scale falls into darkness as the key light follows the paper. |
| T15 | 122.9–124.0 cards → city | 1 | The torn halves fall out of the bottom (gravity: easeInQuad, 0.6 s, rotating ±12°). The camera tilts down after them onto the city skyline (same city asset as 40 s). The crimson loop (same stroke as Europe) draws around the nearest building from 124.0. |
| T16 | 126.5–127.3 city → phone + shop | 2 | Push into one window (the reverse of T4) → your phone. The shop slides in from the right at street level. |
| T17 | 135.3–136.1 near → back | 3 | **Same phone, no cut** (owner row 56). The phone holds its position. Its screen cross-dissolves from the cart to the boss chat. The shop slides out right (EASE_OUT) while the boss's 饼 slides in from the right edge with a 6° rotation settle (EASE_IN_OUT 0.7 s). |
| T18 | 148.0–148.45 boss chat → friend chat | 3 | An iOS page push inside the phone: the old chat goes left −30 %, the new one comes in from the right, 0.45 s MOVE. The "我保证" bubble then sends with the usual send arc (from the input bar up to its slot, SPRING). |
| T19 | 153.6–154.34 ticks → end card | 3 | The five ticks converge into one gold dot (stagger 60 ms, MOVE 0.6 s). The dot travels to the end card motif's position and scales into the motif while everything else dissolves to the end card background `#05060b`. Replaces the gold wash plus cut. The producer reads the motif's x/y from `brand/EndCard`. |

### #2 · Dead holds → motivated motion · M · [animator]
- **20.8–23.4** (empty axes for 2.6 s): the axis draws at once (T2). Start drawing the grey dashed "old belief" line at 21.4 (2.2 s draw, MOVE), so line 7 already shows the textbook picture and line 8 labels it.
- **43.3–49.0:** T5 plus a slow continued pull-back (scale −3 % over 5 s, CAM). On line 15 the boss banner slides up out of frame (EASE_OUT) before the nation banner rolls in. Not a cross-fade.
- **49.0–52.0:** IOU coupons (see §5 IOU). On line 17 the camera pushes in 6 % to the name "西班牙".
- **52.0–63.2:** each loop node arrives as its paper slip slides into place (EASE_IN_OUT). The arrows draw with a bright head (a 6 px dot riding the dash end). From line 20 the dash flow speeds up (`spinOff` already does this; keep it). The camera rotates the whole ring +4° over lines 20–21 (CAM). Delete `shake`.
- **86.7–98.5 (worst hold):** line 30: camera pushes 8 % onto the 饼 on the IOU. Line 31: above each lender's coin stack a gold "信" glyph lights (stagger 90 ms, rise), and the stacks slide back into the light toward the IOU (MOVE 0.8 s): the lenders return. Line 32: the 饼 slides under the IOU and spreads into the net (see §5 net); the IOU drops 20 px onto it and bounces (SPRING). Line 33: the arrows' dash flow decelerates to zero over 2 s (easeOutCubic on the speed), the arrows desaturate to grey, the camera pulls back 10 %, and "漩涡停了" rises in.
- **111.2–114.0:** the document arrives by T14, then settles into the light (translateY −40 → 0, SPRING) and its shadow tightens.
- **114.1–117.1:** the weather card blows away as the script says (§5 weather).
- **126.8–135.6:** the shop's shutter lowers and the notice is taped on (§5 shop). The crimson loop arrows travel continuously (dash flow) between phone and shop.
- **141.9–144.8:** replace the static "¥58 → ¥26" text with the concrete callback. The phone screen returns to the delivery app and the tap reverses: the selection ring moves from 牛排套餐 back to 番茄牛腩饭, and the 合计 rolls 58 → 26 (counter). Optional caption "这次，一分都不多花" stays at right in 黑体 56 px.

### #3 · The 饼 as the travelling spine (68–76, 92–94, 135–154) · M + I · [animator, art-director]
- **68.2 (line 24):** Draghi gets a stand-in object: a **lectern with one gooseneck microphone** in a tight key light (no figure; owner rows 9 and 80). On line 24 the 饼 *rises out of the lectern's light* (translateY 120 → 0, scale 0.6 → 1, EASE_IN_OUT 0.7 s) instead of fading in mid-air.
- **Line 25:** "我来借" is debossed on the 饼 (dark-brown text with a 1 px light lower edge so it reads stamped). The "要多少，给多少 · 上限 ∞" pill becomes a 黑体 56 px line on a scrim under the 饼, with ∞ drawn on as a gold stroke (0.5 s).
- **73.0:** T8 flight onto the IOU. Keep the IOU's name visible: the 饼 sits over the left two-thirds and the name shifts right, so the two never cover each other's text (74.5 s currently hides "西班牙" behind the 饼).
- **92.9:** the 饼 becomes the net (§5).
- **135.7:** the boss's 饼 enters by T17, not by appearing in the black.

### #4 · Title hand-off (13.4–16.8) · M + V · [animator]
**Problem:** the 2D medal flip is a flat `scaleX`, which reads as a card. At 16.63 there is a hard cut plus cream flash to a much larger, darker 3D medal in a different position (m_16.4 frames 0.20 → 0.27).
**Fix:**
- (a) Give the flip thickness: draw a reeded edge band (width = r·0.09·|sin θ|, colour `#8a6424` with 1 px highlight hairlines every 6 px) beside the face, so the flip reads as a coin turning.
- (b) From 15.9 to 16.625 push the 2D medal to the 3D medal's frame-1 position and size (from x 960 / r 210 toward the still's centre and radius, measure them; MOVE).
- (c) Over the same 0.7 s, grade the 2D medal toward the still's bronze: multiply toward `#6e4a14`, drop the specular. On the drop frame they then match.
- (d) Delete the flash. The drop hit is the title's first word landing (`rise` 0.25 s) plus a 1.03 → 1.0 settle of the medal still over 0.4 s.

### #5 · Vault set-piece (76.5–86.8) · I + M · [art-director, animator]
**Problem:** the 3D stills read as a cardboard box. On the drop the image swaps (no lid motion) with a flash (81.43). The shut and open renders are framed differently (sheet 13).
**Fix:** a 2.5D bank-vault door in CSS 3D / SVG (design in §5). Timeline:
- 76.6: arrives by T9.
- 79.4–81.4: hold; only dust in the beam and a 2 % push.
- 81.0–81.43: the wheel spins 120° (MOVE).
- 81.43 (drop): the 12 bolts retract with SLAM timing (stagger 25 ms).
- 81.5–82.4: the door swings open on its right hinge, rotateY 0 → −78° (EASE_IN_OUT, 3 % overshoot back).
- Interior light spills out as a growing radial pool: no flash.
- Inside: empty steel shelves and dust in the beam.
- 83.3: T10 dive to the ledger on the bottom shelf.

### #6 · Ghosting bug (144.8–145.1, 147.9–148.3) · V · [animator]
`Back`: the cracked group's opacity is `(1-price)*(1-two)`, so it comes back while `price` fades out and `two` fades in. Sheet 24 at 144.8 shows "去年那张，没兑现" and the grey 饼 reappearing; at 148.0 three 饼 overlap. Give each beat its own envelope:
- cracked: on until `st(48)−0.05`, out over 0.3 s;
- the ¥26 callback: in at `st(48)+0.1`, out at `st(49)−0.35`;
- kept/broken pair: in at `st(49)`;
- the pair exits before the flip.
Then check every scene for the same pattern: grep for `(1 - x) * (1 - y)` opacities.

### #7 · Overlaps, dims, jitter, UI noise · V · [animator, art-director]
- **60.6–63.2:** the "2012 · 欧洲" tag overlaps the 意大利 IOU, and a coin stack overlaps the 希腊 IOU (sheet 10, g2). Move the other IOUs into a ring beyond the loop (x ≤ 230 or ≥ 1690, y 260–820) with ≥ 40 px clearance from the tag and the coins. The tag fades out at line 21, or moves to bottom-left.
- **120.6–123.6:** remove the full-frame `dark` overlay (owner row 54: no dim). The "light goes out" is the document's own key light switching off: its pool radius shrinks 360 → 0, EASE_OUT 0.8 s. The red line "下次，没人信了" stays full brightness, 黑体 56 px.
- **108.2–111.2:** remove the blue `screen` tint (it muddies the frame; owner row 54). Belief = a pendant lamp over the right pan turning on (§5 scale).
- **46.2–49.0:** remove the typing dots `···` (owner row 54).
- **57.8–63.2:** delete the IOU `shake` (judder).
- **Whole film:** remove `<Grain/>`.

### #8 · The missing number (73.8–76.5) · V (info) · [art-director; researcher checks the wording]
Facts row 14 (ECB, Asmussen, 11 Jun 2013, verified): Spain's extra cost over Germany fell from more than 6 points (Jul 2012) to just under 3 (May 2013).
- Replace the 34 px "借钱的利息↓" with a right-side panel on a scrim. Label: "西班牙借钱，比德国多付的利息" (黑体 48 px).
- Under it, one horizontal crimson bar labelled "6 个多点" that shrinks to a gold bar labelled "不到 3 个点" (MOVE 1.0 s, starting at `st(26)+0.4`). The old length stays as a faint dashed outline (owner row 55 style). Labels 黑体 64–96 px. No decimals.
- The subtitle does not change. The researcher confirms the exact labels against row 14.

### #9 · Type sizes and families · V · [art-director]
Current offenders, all → 黑体 at the sizes in §3:
- Hall: "你花的钱" 30, tick sublabels 30, plate sublines 34, "以前以为：到账才多花" 36.
- City: "每扇亮着的窗……" 44, pinned to the top edge.
- Loop: Pill labels 42 serif.
- "借钱的利息" 34; "要多少，给多少" 38; tag "2012 · 欧洲" 26.
- Woodford: "研究的是" 42; "前提：有人信" 44, cut by the top edge.
- Cards: "说错了，不负责" 40.
- Phones: chat bubbles 27, "已发送" 20, notification text 23/29.
- Ticks caption 46.
Phone UI fix: scale the phone in the chat scenes (135–154) to 1.4–1.5×, cropped by the frame top, so the bubbles render ≥ 40 px on the 1080p canvas.

### #10 · Phone continuity and the white slabs (126–154) · V + M · [animator, art-director]
- The cream phone screens (`#f4efe7`, `#ece6dc`) are the brightest thing in frame and compete with the 饼 and the shop (g5).
- Switch the in-film chat and cart screens to a **warm dark mode**: screen `#1a1714`; boss bubbles `#2b2621` with cream text; my bubbles champagne `#e2c27f` with `#2a1d08` text; system lines 75 % cream. The screen glow lights the table around the phone (a soft cool-white pool, 0.15).
- Keep the opening's light delivery app exactly as is (owner liked it).
- T17 and T18 keep it one phone.

### #11 · Hall chart craft (20.7–34.5) · M + V · [animator]
- Chart spans x 160–1760. Gold line 9 px with a bloom; ticks "今天 / 明年" 72 px 黑体.
- **Line 9 (data check):** replace the 6 px linear scan line with a 60 px soft gold light band sweeping on MOVE. It leaves ~40 small gold data dots behind it, scattered around the true step. Line 10's gold line then draws *through* those dots.
- The X draws as two strokes (0.15 s each, stroke-dash), not a fade.
- **Line 11:** the boss banner (the same component as the opening) drops onto the "今天" tick (SPRING) and the jump pulses once there. Remove the breathing `sin(t*5)` circle. This ties the chart to the story and sets up T3.

### #12 · City composition (37.6–49, 123.6–126.8) · I + V · [art-director]
At 40.4+ the city is a thin band in the bottom quarter with empty black above (sheets 6–7). End the pull-back with the skyline filling ~65 % of the frame height and the horizon at y ≈ 360, with haze layers. The design is in §5.

### #13 · Opening polish (0–2.5) · V · [animator]
Frame 0 is a dark, unlit phone. The screen should already be at 40 % wake on frame 0 and reach full by 0.25 s, so something moves on frame 0 (owner row 47). The table's hard horizon at y ≈ 370 (st 1.5) needs a 200 px soft fade into darkness.

### #14 (optional, low) · Subtitles · V · [art-director]
The series standard (owner row 63) is 64 px, weight 800–900. This film uses 60 px at weight 600. Raise to 64/800. No strip is needed on these dark backgrounds, because no bright UI sits behind the subtitle band. Text and timing stay the same.

## 5. Illustration replacements (new designs; all in look B: near-black, one warm key light, gold = ideas, crimson = fear)

| Prop (time) | Problem now | New design (buildable in SVG/CSS; readable at ¼ screen) |
|---|---|---|
| **饼** (8–16, 68–98, 136–148) | Good texture, but at phone size it reads as a cookie or moon. "画" is not shown. | 3/4 tilt (top ellipse ry = 0.82 r) plus a 0.10 r crust side band (darker `#8a5a22` with a toasted lower edge) so it reads as a flatbread. Blistered crust: 6–8 darker blotches via feTurbulence, sesame denser at the top. **Drawn-on beat at 8.12:** a gold pen line draws the outline and a few sesame dots (stroke-dash 0.5 s, 3 px `#e2c27f`), then the bake fills as a radial wipe from the line inward (0.4 s). The boss literally *draws* the 饼. One faint steam wisp on first appearance (two soft white bezier strokes, 0.15 opacity, rising 40 px). |
| **Cracked 饼** (138.8–148) | A single black zigzag line. | The 饼 snaps into 3 pieces along a jagged path (clipPaths). The pieces separate 10 px and rotate ±4° (SPRING), 6 crumbs drop, and the colour drains to grey `grayscale(0.85)` over 0.6 s. Kept vs broken: same shapes, the broken one stays apart. |
| **2D medal flip** (14–16.6) | Flat scaleX card. | Reeded edge band during the flip (#4). Face: laurel engraved as a 1.5 px dark-bronze stroke with a 1 px light offset (embossed), "2026" in Cormorant 700. |
| **ECB building** (63–73) | Greek-temple line art; the columns read as jail bars. | The real ECB headquarters silhouette, as a **dark glass high-rise**: two slim polygon towers with slightly skewed (non-parallel) faces, joined by a lower glass atrium. The window grid is 1.5 px hairlines; floors light warm `#e8c27a` at 0.7 one by one on the build beats. A narrow vertical specular strip on the glass follows the key light. Height ~80 % of the frame, camera tilts up it (T7). Label "欧洲央行" 黑体 64 px at the foot. No real logo. |
| **Euro notes** (65.9–68) | Mint-green rectangles with a "€". | Engraved notes in the look-B palette, not real euro designs: paper `#ece2c8`; a guilloche rosette (8 overlaid rotated ellipses, 0.8 px `#4a3420` at 0.4); a fine double border; a serif "€" and a 7-digit serial. They stream out of a slot at the tower's base in a fan (stagger 70 ms, arc MOVE) and stack into a **banded brick** (paper band with "€", 10 visible note edges). The same brick is used on the scale's left pan. |
| **Draghi** (68–73) | Floating 饼 plus a corner plate. | Lectern (trapezoid front, wood `#3a2a1a` with top-edge highlight), one gooseneck mic (2 px curve plus a capsule), in a tight spot. The plate "德拉吉 · 欧洲央行行长 / 2012 年 7 月 · 伦敦" becomes 黑体 52/40 on a scrim near the lectern, not in the corner. |
| **IOU 借条** (49–98) | Small (440 px), template-like double border. | 760 × 440 engraved bond paper with fibre texture (feTurbulence 0.04 opacity) and a deckled top edge. A guilloche corner rosette; "借 条" letterspaced serif 40; "西班牙" serif 120. **A row of 5 tear-off coupons along the bottom with dates.** Line 18 "旧债到期": red "到期" stamps hit the coupons one per beat (SLAM). That is the script's "欠条上的日期一张张到期". Soft contact shadow, lit from the key at upper left. |
| **Lenders' coins** (54–98) | 4 tiny 5-coin cylinders. | 2 stacks per side, 10 coins each, r ≈ 46 px. The edges are reeded (vertical hairlines). Tops have an engraved ring and a warm specular arc. Brightness comes from distance to the key light, so when they slide back on "不敢借" they visibly leave the light. |
| **Loop / 漩涡** (52–98) | A boxed flowchart. | Four paper slips (same paper as the IOU, 黑体 52 px text, slight rotations ±3°) placed on an ellipse around the IOU on the dark table. Crimson arcs are 8 px with a bright travelling head; arrowheads are filled chevrons. The fear glow is a crimson light pool under the table that grows, not a flat overlay. Calm state: arcs fade to `#9a9184` and the dash flow stops. |
| **Safety net 兜底** (92.9–98.5) | Reads as a railing or fence. | The 饼 slides under the IOU and **unrolls into a gold mesh**: a diamond lattice (≈ 9 × 4 cells) hung between two small posts with a catenary sag, 2.5 px gold thread with knot dots, lit from above. The IOU drops onto it and the mesh deflects 12 px and springs back (SPRING). Label "有人兜底" 黑体 56. |
| **Vault** (76.5–83.7) | 3D cardboard-looking box, image swap. | Front view, slight 3/4 on CSS 3D. A thick round steel door (r ≈ 300) with a brushed radial gradient `#3a3a3c → #1a1a1c`, an outer ring of 12 cylindrical bolts (rects with end highlights), a central 5-spoke wheel, and a hinge block at right. A rectangular frame set into a dark wall. One top key light, so the door's top edge catches a gold rim. Open: interior of empty steel shelves (3 shelf lines), dust motes in the beam (existing particle look), with light spilling onto the floor. Timeline in #5. |
| **Ledger** (83.7–86.8) | Lined notepad / sticky note. | An open hardcover ledger book (two pages, spine shadow down the middle, page curl at the corners). Faint red and blue column rules; header "借款记录 · 欧洲央行" 黑体 48. Both pages empty, then the "0 次" stamp (keep the current SLAM). It lies on the vault's bottom shelf (T10). |
| **Woodford's book** (98.6–102.2) | Flat green rectangle. | A hardcover at 3/4 (CSS rotateY 18°): a spine of visible thickness (24 px, darker), cloth texture (fine crosshatch at 0.06), gold-foil title "利息与价格" serif 64 with a 1 px specular, a page-block edge in cream. Key light from upper left. Plate "伍德福德 · 哥伦比亚大学 / 另一位 2026 年得主" 黑体 52/40 beside it. |
| **Scale** (102.3–111.2) | Stick drawing; small pans and loads; the tilt is tiny. | A brass balance about 75 % of frame height. Stepped plinth, a column with a finial, a tapered beam with ball ends. Three-strand chains (dashed 2 px with link dots). Shallow dish pans drawn as ellipses with rim highlights. Brass gradient `#f0d79a → #b8924a → #6e4a14` with a vertical specular stripe. Left pan: the euro brick (big). Right pan: a folded paper "一句话". The tilt goes −14° → +14° with SPRING (two damped swings), so the promise visibly outweighs the money. Labels "钱 / 承诺" 黑体 64 under the pans. |
| **"信" bulb** (108.2–111.2) | Tiny bulb cut by the top edge; blue tint over the frame. | A pendant lamp (cord, conical brass shade) hanging over the right pan, inside the frame. On line 37 it switches on (two-frame flicker, then steady): a warm cone of light down onto the "一句话" pan. "信" is engraved on the shade (serif 56). The rest of the frame keeps its light. |
| **我觉得 → weather card** (114.1–117.1) | Navy card with an emoji sun and cloud, off-palette; it never blows away. | A smoked-glass card: `rgba(30,32,36,0.7)` with a 1 px light border, a line-drawn cloud with 6 slanted rain strokes in cool grey `#9aa3ad`, and "明天 降雨 70%" in 黑体 52. "我觉得" sits above it in grey serif. On `st(39)+1.6` it **is blown away**: translateX −500, rotate −18°, EASE_OUT 0.7 s, with 8 rain streaks passing across. "说错了，不负责" leaves with it. |
| **我保证 document** (111.3–123.6) | A plain card; on tearing the halves go blank. | Heavy cream paper with a deckled edge and a thin gold border. "我保证" serif 110. A pen signature stroke drawn on (keep the current draw, colour `#1d2f6b`, 5 px) and a red seal "信用" (square chop, 96 px, slightly rough edge via feTurbulence displacement) that lands with SLAM on line 40. Tear on line 41: two clipPath halves along a jagged vertical path **through the characters** (each half keeps half the glyphs and half the seal). They separate 70 px, rotate ±10° and sink 30 px while the key light goes out (#7). |
| **City** (37.6–49, 123.6–126.8) | Confetti grid of squares; buildings are plain rects; a thin band. | Three depth layers with haze between them. Buildings have rooftop silhouettes (water tanks, AC boxes, antennas), rim light on the left edges, and a 1 px top highlight. Windows are 2:3 rectangles with mullions and a warm interior gradient (`#e8c27a` top → `#a8763a` bottom); about 1 in 6 has a small cool-white phone glow at the lower third. Lit fraction animates as now. Frame fill and horizon per #12. The "同一个漩涡" dashed marquee becomes the same crimson loop arc used in Europe (shared design). |
| **Noodle shop 楼下小面馆** (126.8–135.6) | Box with scallop awning and a beige rectangle. | A narrow street-level shopfront. Lightbox sign "面" (cream panel, red serif 90 px, glow). A half-raised roll-up shutter (ribbed metal: 12 horizontal hairlines, grey `#5a5a5e`). Warm interior through the opening with steam from a pot (3 soft wisps). Two plastic stools on the pavement and a warm light spill on the pavement. Line 44: the shutter lowers by a third (MOVE 0.8 s), the interior light drops one notch and the steam thins. Line 45: a paper notice "暂停招聘 · 下月起不招人了" (黑体 52/36) is taped to the shutter (two tape strips; drops in with a 5° settle). Label "楼下小面馆" 黑体 56 on a scrim. |
| **Cart icon** (34.5–37.6) | Line-icon cart plus calendar. | Replaced by the opening's own app (T3). The 去结算 button reads "去结算 · 花的是明年的钱" (黑体 26 inside the phone, phone at 1.3× so it renders ≥ 34 px), and the 2027 calendar page sits in the order card as the item thumbnail. Concrete and on-story. |
| **Phone chat UI** (135.7–154) | Cream screen, tiny bubbles, mostly empty. | Dark mode (#10), phone at 1.4–1.5×, bubbles ≥ 40 px. Line 47: the history reveals by a real scroll (content moves down 260 px on MOVE with a rubber-band settle), not a fade. "已发送" becomes a ✓ read tick. |
| **Five ticks** (150.7–154.3) | Thin outline circles. | Gold seal-like discs (r 46, filled `#e2c27f`, dark check). Each pops with SPRING on a beat; they then gather into the gold dot (T19). |

Rejected candidates, kept as they are: the opening app UI and lock screen (owner liked them), the title card, the "0 次" stamp design, the end card.

## 6. Hand-off order (for the producer)
1. #1 transitions plus the §3 tokens, #6, #7 (bugs). These alone fix most of "not smooth".
2. #4 title, #5 vault, #3 饼 travel, T17/T18 phone continuity → **send the owner the 3-item preview (§3) and wait for his OK.**
3. #2 holds, #8 number, #11 Hall, §5 illustrations in this order: IOU and coins and loop, ECB and notes and lectern, scale and lamp, documents and weather, city, shop, chat.
4. #9, #10, #12, #13, #14 polish → full render → gate-4 re-review (the director checks every T-row by luminance scan: zero dips, zero flashes).
