# Gate 2a notes — 为什么一到深夜就emo (ep52) — round 1

Scope: looks only (rubric area 2, visual design). Reviewed `style/looks.md`, `style/looks_sheet.png`, and
all 9 individual frames in `style/ledger/`, `style/lab/`, `style/glitch/`. No cold-read file exists yet
for this gate (`coldread_*.json` not found in the episode folder) — ranking below is my own read, cross-
checked against `production-crew/references/looks.md` numbers only.

## Buildable / readable per direction

**A — 夜灯手账 (Night Ledger):** Buildable (CSS/SVG gradients, index cards, cable+lever — all within our
HTML→PNG engine, nothing requiring 3D or unavailable assets). Readable at phone scale: subtitle strip,
"杏仁核/前额叶" labels and the counter are all large and high-contrast; warm-on-dark reads fine at 1/4
screen. Mean brightness is mid-tone, not the ep21 "27/255 too dark" failure. **Pass.**

**B — 诊疗观测室 (Lab Scope):** Buildable (flat panels, monospace HUD type, simple waveform path — same
engine). Readable: dark teal is close to black in the hook frame (a_hook) — the device housing and
background are nearly the same value, so at phone size the console reads as a dark rectangle floating in
a darker rectangle until the waveform catches the eye; still passes but is the least contrasty of the
three. Labels (REC·CH1 AMYG, 02:00) are small monospace — legible in the exported still but will need
to be sized up for in-video legibility (same note the series already has on HUD type, owner-notes row
"make sure the reading is big enough"). **Pass, with a type-size flag for the storyboard stage, not a
send-back.**

**C — 信号故障 (Signal Glitch):** Buildable (chromatic-offset duplicate layers, dashed cables, pixel-
block map — all flat 2D, no risk). Readable: the chromatic-split numerals ("2:00", "5亿条") are the one
risk — a few-pixel red/cyan offset on small type can blur at phone scale and compressed video, but the
subtitle strip itself is explicitly NOT glitched (per the pitch's own rule), so the one thing that must
always be legible stays legible. The in-world HUD glitch is decorative, not load-bearing. **Pass.**

All three pass buildable/readable. None needs to be sent back on that bar alone.

## Phone-glow-face check (owner specified: hook frame must show a phone lighting a face from below)

The owner's instruction for this stage was explicit: hook frame = "凌晨两点 / phone glow," matching
script.md's picture column verbatim: "Phone screen in the dark, screen-glow lighting a face from below."
None of the three delivered hook frames do this as specified:

- **A (ledger):** The dominant light source is an overhead/wall lamp (the big radial glow filling the top
  two-thirds of frame) — the figure's head and shoulders are lit from above/behind by that lamp, not from
  below by the phone. The phone sits low, small, off to the side of the torso, screen facing up/forward,
  and its own glow is faint and local to the device — it does not visibly rim-light the face. This is a
  "warm room with a phone in it," not "phone-lit face." **Off-brief.**
- **B (lab scope):** There is no face and no figure at all — the phone has been replaced entirely by an
  oscilloscope housing. This doesn't just fail to light a face from below, it removes the face/figure
  from the hook frame entirely. Of the three, this is the furthest from the owner's spec. **Off-brief
  (most severe).**
- **C (glitch):** Also no face/figure in frame — just the glowing phone itself, centred, floating in
  colour. Closer to "phone glow" than B (the phone is at least the hero object and the glow is the
  dominant light), but there is no face being lit by it, below or otherwise — the brief's picture
  ("lighting a face from below") is simply not there. **Off-brief.**

None of the three delivers the specified shot. This is a should've-been-caught miss across all three
directions, not a one-off: whoever briefed/built these hook frames substituted "a phone is present" for
"a phone-glow is the key light on a face, from below," which is a different, weaker image (no intimacy,
no silhouette-with-a-secret feeling the brief was going for). This needs a fix pass before the owner
picks, since the hook frame is the first thing a viewer and the owner judge the whole look by.

## Structural-reuse check (do b/c differ in layout across directions, not just palette?)

**b (brain) frames: fail the novelty bar.** All three use the identical composition: two bordered panels
side by side, left panel = warm/alarm-toned glowing circle labelled 杏仁核 + "在报警" tag, right panel =
cool-toned glowing circle labelled 前额叶 + "刹车松懈" tag, a single curved/dashed cable between them with
a brake-lever pin at the sag point, same caption line below. Only the panel skin changes (torn corkboard
index cards in A, instrument-console channels in B, broken-app windows in C) and the palette shifts
(amber/red → amber/cyan → magenta/cyan). The metaphor pitch text in looks.md claims three different
worlds ("hand-pinned cards" vs "dual-channel monitor" vs "broken app windows"), but the actual geometry —
panel positions, circle sizes, label placement, cable curve, tag positions — is one layout with three
skins. This is exactly the failure mode the owner's note warned about ("the looks must differ in the
world they come from... not just in colour").

**c (drop) frames: fail the novelty bar, more severely.** All three use the identical composition: a
circular 24h dial on the left (violet night-wedge in the same clock position, same dipping orange/pink
mood-line shape, "0" and "12" in the same spots) connected by the same dotted arrow to a cluster of blob/
continent shapes on the right scattered with the same number and rough placement of lit dots, with the
5亿条 counter sitting in the same lower-left position of that right panel. A changes the right panel to
soft glowing ellipses, B puts it inside a console-bordered "GLOBAL SENTIMENT SCAN" panel, C renders the
same blobs as pixel blocks — but the dial geometry, the mood-line's exact dip shape, and the map's dot
layout are reused frame-for-frame. This reads as one Figma source duplicated three times with a find-
replace on colours and a border style, not three distinct metaphors for "the clock pulls mood down /
the data confirms it everywhere."

**a (hook) frames: differ structurally** (desk+figure vs device-on-stand vs single floating phone) — this
one trio is NOT a reskin, which makes the b/c reuse more noticeable by contrast, not less.

## Ranking (all three pass buildable/readable; ranked assuming the hook-frame and reskin notes below get
fixed — this is not a pick for the owner, per gate 2a scope)

1. **A — 夜灯手账 (Night Ledger).** Best fit to the brief's own stated mood (warm, comforting, intimate,
   never clinical) and to the topic (ends on "write it down" — a notebook world closes the loop with the
   ending beat). Per `references/looks.md`, warm/intimate journal-adjacent treatments (马首回家 copperplate,
   定情信物 paper-cut) are the two most recent looks the owner has approved without a "too cold/too
   stylised" complaint — this direction sits in that same lane. Safest, but "safest" here is not a
   knock: the brief explicitly says mental-health-adjacent topics must avoid clinical-cold, and this is
   the only one of the three with zero clinical-reading risk.
2. **B — 诊疗观测室 (Lab Scope).** Thematically the smartest idea (device = "this is measured, not felt"
   literalizes the film's actual argument), but it is the one most exposed to the owner's standing
   "clinical-cold" rejection pattern (ep36 breakup episode: 临床戒断/light-medical was rejected in favour
   of a warmer look; owner said "stick to dark toned and aesthetic"). The pitch text tries to pre-empt
   this (amber/cool instead of red/green, no cross iconography) and the frames do stay out of hospital-
   white territory, but an oscilloscope/monitor console is still a device aesthetic for a topic about
   lying awake feeling bad, and it is also the direction that dropped the phone/face from its hook frame
   entirely — the weakest hook of the three as delivered.
3. **C — 信号故障 (Signal Glitch).** The intended bold swing, and the metaphor logic is sound (glitch =
   signal problem, not a character flaw), but of the three it carries the most legibility risk at
   delivery (chromatic-split numerals under video compression) and the most "trendy aesthetic over
   substance" risk for a comforting-ending topic — the brief's own "must NOT look like" list for this
   direction (horror jump-scare, cyberpunk cliché) shows the art director already knew this was the
   closest to overdoing it. Rank it third not because it's unbuildable, but because the upside case (owner
   wants the riskier swing) is narrower here than on a lower-stakes topic — this film must land soft at
   the end, and a glitch world asks more work from the edit to land soft.

None repeats the previous episode's main look (ep47 folded paper-cut) or the franchise's navy-gold
default — confirmed against `references/looks.md`. That requirement is met by all three.

## Keep (don't break in revision)

- The engine layer is correctly fixed across all 9 frames: same subtitle treatment (bold sans, gold key
  words, dark scrim), same Juno "J" corner mark position/style. Don't touch this while fixing the notes
  below.
- Palette-per-scene tables in looks.md are well specified (hex values, clear per-scene breakdown) — keep
  this level of detail when the directions are revised.
- None of the three frames has a body-logic error, missing render, or broken prop — no R1–R8 figure-rule
  issues to flag here (A's silhouette figure has no hands/face detail, which is fine per the ep6
  "better no hands than wrong hands" rule).

## Verdict: REVISE

Route to **art-director**:

1. **All three hook frames (a):** rebuild to match the owner's explicit spec — phone screen is the key
   light source and it visibly lights a face/figure from below (chin/jaw/underside-of-features catching
   the glow), not an overhead lamp (A) and not a phone with no face present at all (B, C). B additionally
   needs a figure back in frame; a device alone does not satisfy "phone glow lighting a face."
2. **The b (brain) frames across all three directions:** at least two of the three need a genuinely
   different layout, not just a different panel skin and palette on the same two-circles-plus-cable
   composition — e.g. vary panel shape/count, the relationship drawn between 杏仁核 and 前额叶 (not always
   a side-by-side pair joined by one cable), or where the labels sit. Keep one direction's current layout
   as the baseline if it is the strongest; the other(s) must show a visibly different idea of "two brain
   signals, one up one down," not a reskin.
3. **The c (drop) frames across all three directions:** same note — the dial + dotted-arrow + blob-map
   composition is identical in all three. At least two directions need a different structural idea for
   "the clock causes the dip, the data confirms it at scale" (e.g. a different map treatment, a different
   relationship between the two panels, or dropping the dial-plus-side-panel split entirely for one
   direction).

After these three fixes, re-run gate 2a before the owner sees the sheet — don't let the owner choose
between three frames that are still one layout in two of three scenes.
