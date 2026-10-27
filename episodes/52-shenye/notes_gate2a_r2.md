# Gate 2a notes — 为什么一到深夜就emo (ep52) — round 2

Scope: looks only (rubric area 2, visual design). Reviewed updated `style/looks.md`, `style/looks_sheet.png`,
and the 9 individual frames in `style/ledger/`, `style/lab/`, `style/glitch/`, against round-1 notes
(`notes_gate2a_r1.md`), `brief.md`, `script.md` v2's picture column, `production-crew/references/looks.md`,
and the owner-notes rows on phone legibility, no slide/PPT, no "too dark" night, subtitle readability,
clinical-cold mental-health treatment, bold swing, and engine-layer consistency.

## Fix 1 — hook frame: phone/device must visibly light a face from below

**Landed, in all three.**

- **A (ledger):** rebuilt. The desk lamp is now a small, dim glow confined to the upper background; the
  phone held at chest height is the dominant light source, and there is a clear warm highlight on the
  underside of the silhouette's head/jaw rising from the screen. Reads correctly at a glance even scaled
  down. **Pass.**
- **B (lab):** rebuilt. A figure is back in frame (it was missing entirely in r1), arms bracketing the
  scope device at chest level, and the phosphor-green glow visibly rim-lights the jaw/chin from below.
  This was the most severe r1 miss (no face at all) and it's fixed. **Pass.**
- **C (glitch):** rebuilt. A silhouette now sits behind/above the phone, lit only from below by the
  magenta/violet glow, chromatic-split ghost kept to the lit edge rather than the whole frame. **Pass.**
  One smaller, new issue: the in-world "2:00" readout sits directly under/behind the white glitch bar
  crossing the device and is nearly unreadable in the still (see note 1 below) — not a repeat of the r1
  structural miss, but worth a pass before storyboard.

All three now match the brief's and script.md's explicit picture spec ("Phone screen in the dark,
screen-glow lighting a face from below"). Fix 1 confirmed across all 3/3 frames.

## Fix 2 — b (brain) frames: at least 2 of 3 need a structurally different idea

**Landed.** All three are now genuinely different layouts, not a reskin:
- A: two pinned index cards side by side + one sagging cable with a brake-lever pin (kept as baseline).
- B: one shared dial face with two needles pivoting from a single centre point (new).
- C: one continuous waveform showing two failure modes along its length — spike/clip on the left,
  flatline "NO SIGNAL" gap on the right (new).

Three distinct objects (two-cards-and-cable / one-dial-two-needles / one-line-two-failures), three
different panel counts (2 / 1 / 1-with-internal-split), three different ways "alarm up + brake down" is
drawn. This is not a palette swap on one Figma frame anymore. Fix 2 confirmed, exceeds the ≥2-of-3 bar
(it's 3 of 3).

## Fix 3 — c (drop) frames: at least 2 of 3 need a structurally different idea

**Landed.** All three now differ in structure, not just skin:
- A: 24h dial (violet night-wedge, dipping mood-line) + separate side panel of glowing map-blobs,
  joined by a dotted arrow (kept as baseline).
- B: dial and map data fused into one circular instrument — the tweet-dots sit as a ring on the dial's
  own outer rim, counter at the centre hub (new — "the dial IS the map").
- C: the dial is dropped entirely; a vertical falling ticker-tape of tweet-pixels crosses a "NOW·深夜"
  line and visibly corrupts from warm to cool pixels (new — furthest from A of all three).

Fix 3 confirmed, also 3 of 3 rather than the minimum 2 of 3 asked for.

## Buildable / readable per direction (re-checked on the revised frames)

**A — 夜灯手账 (Night Ledger):** Buildable in the HTML→PNG engine (gradients, index cards, dial/map —
nothing new or risky added by the revision). Readable at phone scale: subtitle strip, labels and counter
stay large/high-contrast; mean brightness is mid-tone, not an ep21-style "27/255 too dark" failure.
**Pass.**

**B — 诊疗观测室 (Lab Scope):** Buildable (dial/needle SVG, waveform-free in b now, console panel — same
engine, no new risk). Readable: the gauge's needles, labels and "MAX"/"正常" tags are larger and higher-
contrast than r1's small HUD type; this also incidentally fixes the r1 "type-size flag" on this direction
without being asked to. Dark teal background is still the series' most monochrome of the three but no
longer competes with a near-black device housing the way the old hook frame did. **Pass.**

**C — 信号故障 (Signal Glitch):** Buildable (chromatic-offset layers, falling-pixel grid, dashed cables —
flat 2D, no new engine risk). Readable: the falling-ticker drop frame is actually the clearest of the
three c frames at a glance (a flat grid of dots above/below one bright line reads instantly, even small).
The hook frame's in-world "2:00" readout is the one legibility soft spot (see note 1) but it is decorative
in-world type, not the subtitle — the one thing that must always be legible stays legible. **Pass, with
note 1 below for the storyboard pass.**

All three pass buildable/readable on this round. None needs to be sent back on that bar.

## Ranking (all three pass; this is not a pick for the owner, per gate 2a scope)

1. **A — 夜灯手账 (Night Ledger).** Still the best fit to the brief's "never clinical" instruction and to
   the ending beat (写下来 — a notebook world closes the loop with its own object); per
   `references/looks.md`, warm/intimate journal-adjacent looks are the ones the owner has approved without
   a "too cold" complaint on this kind of topic, and the fixed hook frame now delivers the phone-glow
   image the brief specifically asked for with zero remaining risk.
2. **B — 诊疗观测室 (Lab Scope).** The single dual-needle gauge is the single smartest image across all 9
   b/c frames — "alarm up, brake down, same instrument, same moment" is instantly legible and literalizes
   the film's actual argument better than any other frame. Ranked second only because a device/console
   world sits closest to the owner's standing rejection on ep36 (分手以后): a "临床戒断/light-medical" look
   was turned down in favor of a warmer dark-toned look on a closely related emotional topic ("stick to
   dark toned and aesthetic"). The art director's palette choices (no red/green, no hospital white, warm
   amber vs cool blue) genuinely mitigate this, and the hook fix removes the worst of it, but the
   instrument-console premise itself is the one most likely to draw that same note again.
3. **C — 信号故障 (Signal Glitch).** Still the intended bold swing and the metaphor is sound ("it's a
   signal problem, not a character flaw" de-stigmatizes exactly like the brief wants). The b and c frames
   are now the most structurally inventive of the three directions (one-waveform-two-failures; falling
   ticker with a corruption band) and genuinely readable. Ranked third because the hook frame's "2:00"
   legibility is still rough in-world (note 1) and because a glitch/chromatic-aberration treatment carries
   more residual "trendy over substance" risk for a topic that must land soft and comforting at the very
   end — the upside case here is narrower than on a lower-stakes topic, not because anything is broken.

## Note for the next stage (not a send-back)

1. **C hook frame (`style/glitch/a_hook.png`):** the in-world "2:00" clock readout is nearly swallowed by
   the horizontal white glitch bar crossing the device at that exact height. It's decorative type, not the
   subtitle, so this isn't a legibility failure under the owner's rules, but if direction C is chosen,
   shift the glitch bar or the readout by a few px in the storyboard pass so the number itself is still
   legible, not just implied. Route to **art-director** at storyboard stage, only if C is picked.

## Keep (confirmed still intact from round 1, don't break going forward)

- Engine layer unchanged and correct across all 9 frames: same subtitle treatment (bold sans, gold key
  words, dark scrim), same Juno "J" corner mark position/style.
- Palette-per-scene tables in looks.md remain fully specified (hex values per scene) for all three
  directions, including the two new (b)/(c) structures in B and C — the revision didn't lose this detail
  while rebuilding the layouts.
- No body-logic errors, missing renders, or broken props in any of the 9 frames.
- None of the three repeats the previous episode's main look (ep47 paper-cut) or the franchise's
  navy-gold default — still true after revision (B and C left that family entirely; A stays warm-brass,
  which is a different palette from ep47's cool paper-white).

## Verdict: APPROVE

All three round-1 fixes landed, in every frame they needed to (hook: 3/3; b: 3/3 — exceeds the ≥2/3 ask;
c: 3/3 — exceeds the ≥2/3 ask). All three directions are buildable and readable on a phone. Ready for the
owner to pick from; send the contact sheet with the ranking above and the one storyboard-stage note on C's
hook readout (non-blocking, only relevant if C is chosen).
