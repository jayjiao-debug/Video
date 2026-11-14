# overlay/: building blocks for a film's title, intro cards and screen effects

Shared kit (`src/kit/overlay/`, KIT.md). From a film folder `src/videos/<film>/` the import is `../../kit/overlay`.

Every 采访XX的一天 film has a themed title, a quick intro card for the people who matter in the episode, and
综艺-style screen effects (花字, counters, stamps). They are a standard feature, and each film's must be its own: the
owner wants them "unique and fitting for the theme and characters", and asked for "building blocks just to make
things easier", not "something generic".

So this folder has **no title, no card and no effect in it**. It has the parts every film would otherwise write again
(the timing, the freeze, where things may sit, measuring and setting type, marks that look made by hand) and it stops
there. There is no default skin and no ready-made component: a film cannot draw a title until someone has decided
what this person's title is made of. Each film writes its own `hud/title.tsx`, `hud/card.tsx` and `hud/fx.tsx` on top.

**The bar is 秦始皇's title** (`src/videos/qin/hud/title.tsx`): a dry brush stroke, the name in gold set by hand, a
red seal slapped on. Rebuilt from these blocks it matches the original (see "Proof").

## The files

| file | what is in it |
|---|---|
| `time.ts` | the clock of an overlay: `life` (arrive, hold, leave), `part`, `stagger`, `pop`, `slap`, `shake`, `drift`, the eases, `hash01` |
| `freeze.ts` | the picture stops while a card speaks: `clock` / `worldClock` (`at`, `hold`, `world`, `film`, `total`) |
| `frame.ts` | where things may sit: `FRAME_9x15`, `FRAME_9x16`, `free`, `slots`, `fit`, `pointer`, and the check `checkOverlays` |
| `skin.ts` | a film's skin written down once: `defineSkin` (no defaults), `sameLook` |
| `text.tsx` | words and numbers: `textW`, `fitPx`, `wrapRows`, `glyph`, `setRow`, `typeOn`, `countAt`, `odometer` |
| `marks.tsx` | marks made by hand: `roughFilter`, `grainFilter`, `gradient`, `clipBox`, `clipPathOf`, `cutMask`, `sweep`, `slash`, `bandPath`, `streaks`, `spatter`, `tornBox`, `seal`, `ring`, `burst`, `leader`, `barBoxes` |
| `index.ts` | one import for all of it |

## Rules every overlay keeps

- A plain function of the frame: no hooks, no state, no `Math.random`, no clock. `hash01(i, seed)` is the only
  "random". Frames render in any order on fresh pages, so render-farm chunks give the same picture.
- DOM and SVG only, in film px (1080 wide). Ids of filters, clips and gradients are unique on the page: start them
  with the film's and the overlay's name (`"qin-title-edge"`).
- One CJK face in the repo (FrSans, `public/bt/sans700.ttf`) and no new font files, so a "typeface" is a way of
  TREATING that face: how heavy its ink line is, how the characters are set by hand, how rough their edge is.
- No media in the repo. Paper, ink, silk and wax are drawn (paths, noise filters, gradients).

## The order of work in a film

1. **The skin** (`hud/skin.ts`): where the look comes from in one sentence (the lead and their world), four colours,
   two ways of treating the type, the material, one way of moving. `defineSkin` throws until every field is filled.
   Everything the film draws over the picture uses this one skin, so the edit looks like one hand.
2. **The title**: at the end of the cold open. Pick what it is MADE OF in this person's world (a brush stroke, a
   clipping, a standard, a blackboard, a wanted poster) and build that from the marks. Say the hit in words first
   (`motion.hit`), then time it with `life`, `part`, `pop`, `slap`.
3. **The intro cards**: the lead, and only the side characters who play a role. The card's design is the film's; the
   kit gives the freeze (`clock`), the place (`slots`, `fit`), the pointer to the face (`pointer`, `leader`) and the
   pieces for a stat (`barBoxes`, `countAt`, `odometer`, `typeOn`). On his card the lead is ISOLATED: cut out of the
   picture in full colour while the rest drops to a wash. That half is in the picture, not in this layer:
   `IsolatePass` in `src/kit/fx/isolate.ts` (`src/kit/fx/README.md`), with the wash, the line and the lift from the
   film's skin. Its `screenBox` and `liftBox` give the box the card's words must keep clear.
4. **The effects**: a 花字 is `setRow` + `glyph` + `slap` or `pop`, with `burst`, `ring` or `shake` for the hit. A
   counter is `odometer` or `countAt`. A stamp is `seal` + `slap`.
5. **The check**: list everything the film shows as `Shown` items and run `checkOverlays` in the film's smoke test.

Looks already taken (add a row when a film's skin is settled; `sameLook(a, b)` compares two skins):

| film | made of | colours | moves |
|---|---|---|---|
| 秦始皇 | a dry ink brush stroke, splashes, one red seal | gold on black lacquer, cinnabar | the brush sweeps in, the name pops one character at a time, the seal slaps down |

## 秦始皇's title, from the blocks

This is 秦始皇's. It is here to show how the blocks fit together, not to be copied: change the words and it is still
his title on someone else's film.

```tsx
const L = life(f, from, to, M.arrive, M.leave);                       // M = SKIN.motion; null outside the title's frames
const t = L.t, out = easeIn(L.leave);
const row = setRow("秦始皇", 200, SKIN.display, 3, { rot: [-3.5, 1.8, -1.4], lift: [8, -7, 4], scale: [1, 1.07, 0.98] });
<svg style={{ opacity: 1 - out, transform: `scale(${drift(L) + 0.05 * out})`, transformOrigin: `540px ${CY}px` }}>
  <defs>
    {gradient("qin-title-gold", ["#fff4cc", [C.lead, 0.55], "#f2a822"])}
    {roughFilter("qin-title-drag", { fx: 0.005, fy: 0.075, scale: 16, seed: 4 })}     // dragged along the row: a brush
    {roughFilter("qin-title-edge", SKIN.display.rough, 2)}                              // the edge of everything
    {clipBox("qin-title-clip", sweep(strokeBox, easeOut(part(t, 0, M.arrive))))}        // the stroke is uncovered left to right
    {cutMask("qin-title-dry", wholeFrame, streaks(X0, X1, CY, TH, { rise: 36, seed: 21 }))}
  </defs>
  <g filter="url(#qin-title-edge)">
    <g clipPath="url(#qin-title-clip)"><g filter="url(#qin-title-drag)">
      <g mask="url(#qin-title-dry)"><path d={bandPath(X0, X1, CY, TH, { rise: 36, seed: 3 })} fill={C.ink} opacity={0.9} /></g>
      <g fill={C.ink}>{spatter(X0 + 10, CY, TH * 0.6, { n: 3, seed: 5 })}{spatter(X1 - 35, CY, TH * 0.48, { n: 4, seed: 8 })}</g>
    </g></g>
    {row.map((c) => { const p = pop(t, 2 + 2 * c.i, 7, M.over);       // each character has its own moment
      return <g key={c.i} opacity={p.o} transform={`translate(${540 + c.x},${CY + c.y}) rotate(${c.rot - 10 * (1 - p.k)}) scale(${p.s * c.s})`}>
        {glyph("g", c.ch, 0, 0, 200, "url(#qin-title-gold)", { ink: SKIN.display.ink * 200 })}</g>; })}
    {/* 采访 slides in from frame 8, 的一天 from frame 11 (glyph + part + easeOut) */}
    <g transform={`translate(880,${CY + 150}) rotate(-6) scale(${slap(t, 15)})`}>
      {seal("s", ["秦"], 44, { fill: C.accent, text: C.paper, carve: 2.5, rim: { color: C.paper, ink: TOON_INK }, inner: C.paper })}</g>
  </g>
</svg>
```

## The freeze

A card that speaks while the picture stands still is planned in the SCRIPT as a gap in the voice track; the picture
holds for that gap. `clock([{ at, frames }])` is the arithmetic, and a film uses one of two ways:

- **HOLD**: the film's beats are in film frames and the voice track already has the gap. Pose the picture at
  `CLOCK.hold(f)`. Nothing may move across the gap: the action after it starts from the held pose.
- **SHIFT**: the shots are written on the picture's own clock and the freeze is put in afterwards. Pose the picture
  at `CLOCK.world(f)`; `CLOCK.film(w)` is the film frame that first shows a picture frame (for a caption or a sound
  that follows a gesture); `CLOCK.total(n)` is the film's length. `worldClock()` takes the freezes on the picture's
  clock.

`CLOCK.at(f)` gives `{ i, t, n, k }` while frozen (t = 0 on the frame the picture stops), else null: the card's own
`life` runs on it. Camera, sound and captions are the film's; this only keeps the frame numbers honest.

## Where things may sit

`FRAME_9x15` (1080 x 1800, new films) and `FRAME_9x16` (1080 x 1920, the films before 14 Nov 2026) hold what the
phone app does to the frame, measured on one phone: the cut sides, the icons, the button column, the post's own text,
the REC display, the caption band. Measure again when a screenshot shows a different crop, and change the numbers
there so every film gets them.

```ts
const S = slots(FRAME_9x15, face, { keep: [body] });          // the free slots round a face, largest clear one first
const B = fit({ w: 300, h: 372 }, S[0].r, { ay: 0.8 });       // the film's card placed in it (shrunk if it must, never grown)
const P = pointer(B.r, face);                                 // the two ends of a pointer from the card to the face
```

**A card that rides a camera move.** A side character's card stays up while the camera travels, and travels with its
person. Take the slot BY NAME (`S.find((s) => s.name === "right")`, not `S[0]`, which may be another slot on the next
frame) from the person's box on every frame (`screenBox`), and align the card to the person's side of it (`ax: 0` in
the slot on his right). Its place then follows him frame by frame with nothing remembered.

**The REC display in 9:15** starts 32 px from the left edge and the battery ends 32 px from the right (`FRAME_9x15.rec`;
it was 54). The owner asked for them nearer the sides in 9:15, where the app cuts nothing off the sides; 32 is this
file's number until it has been seen on a phone.

The check, in the film's smoke test (plain Node; import `../../kit/overlay/frame` alone):

```ts
const faults = checkOverlays(items, {
  spec: FRAME_9x15,
  protect: (f) => [...facesOn(f), ...captionOn(f)],            // the film knows these
  quiet: [EMOTIONAL_SCENE],                                    // spans that take no cards and no effects
  budget: { perScene: 2, gap: 45 },
});
```

It reports an overlay outside the phone-safe frame, over the REC display, the app's buttons, a face, a caption or
another overlay, a card or effect inside a quiet span, and effects over budget. Example (the try-out below): a card
placed in the slot beside 李白's face while a counter sat above his head came back as `李白's card: over the cup
counter`; moved onto his face it came back as `over 李白's face`, `over 李白's body`, `over 又喝！`.

## Proof (14 Nov 2026)

Rendered outside the repo (the try-out code is kept in the project's files under
`pose-clipping/kit_blocks/tryout_code/`, not committed: they are try-outs, and the Sherlock and Napoleon films will
design their own):

- **秦始皇's title rebuilt from the blocks**, next to the original component, on nine frames of its 48: the two
  differ by 0.8 to 1.8 levels of 255 on average, and 1 to 3 % of the pixels differ visibly (the ink splashes are
  scattered by a different rule; the stroke, the name, the small words and the seal sit on the same pixels).
- **A clipping from the evening paper** (torn newsprint with grain, letterpress type pressed on one letter at a time,
  a red pencil underline, a rubber stamp) and **a silk standard** (gilt engraved type marching up in step, gold
  rules, a wax seal) from the same blocks. `sameLook` is false for every pair.
- **A card, a slammed 花字 and a rolling counter** on a frame of 李白, placed with `slots` and `fit` and passed
  through `checkOverlays`.
- `clock`: `world(film(w)) === w` for every frame of a 1000-frame picture with two freezes.

## What is left to each film, on purpose

The look (the skin), the words, which marks it uses and how, what a card says and shows, where the title lands in the
cold open, the sounds, and how many effects the film takes. If two films start to share a title shape or a card
layout, that shape belongs in neither of them.

## What this did not change

No existing code was edited (KIT.md got one row in the tools table, in a commit of its own).
`src/videos/group/kit/overlay.tsx` (the friends film's overlays) and each finished
film's own `hud/` stay as they are. A film branch that does not carry this folder yet can take it with a cherry-pick:
the first commit only adds files under `src/kit/overlay/`.
