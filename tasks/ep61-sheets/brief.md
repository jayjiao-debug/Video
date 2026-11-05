# Task: character design sheets (model sheets) for the 古埃及神话故事 series (Juno / VIBE知识大赏)

The owner wants every recurring character to stay identical and recognisable across all episodes of the series. This branch already
contains the ep61 storyboard work (`episodes/61-zhongshen/storyboard.md`, the iconography table I-rows in
`episodes/61-zhongshen/facts.md`, and the new casts in `episodes/37-qiqing/remotion/src/qq61/`). Episode 1 (ep60) code is
`episodes/37-qiqing/remotion/src/qq60/` (rig60.tsx: God, CAST, POSES; cast60.tsx: ANI the deceased; act60a_kit.tsx: MaskFront, the
frontal Anubis mask; frame60.tsx; heart60.tsx; props60.tsx). Build ON these designs — do not redesign gods that ep60/ep61 already draw.

## Characters (one sheet each)
Atum-Ra (and Ra falcon form), Shu, Tefnut, Geb, Nut, Osiris, Isis, Set, Nephthys, Horus, Anubis, Thoth, Sekhmet, Bastet, Ma'at,
Ammit (ep60 `Ammit2` in act60b_kit.tsx), the deceased protagonist (ep60 `ANI`). Plus one LINE-UP sheet with all of them side by side
at their fixed relative heights (gods and the human), and one PROPS sheet (the jar heart, Ma'at's feather, the balance, the ankh,
the was-sceptre, crook and flail, sistrum, Thoth's palette and pen, the heart scarab).

## Each sheet (1440 × 1080, the series' flat-vector tomb-painting style, lapis/gold/terracotta, ink outlines, warm papyrus or deep
lapis background; title band with the god's Chinese name + one-line role, e.g. 「托特 · 智慧之神 / 众神的书记官」)
- The main full-figure view (Egyptian canon: head in profile, shoulders frontal) at sheet scale, plus, where the series uses it, the
  frontal mask view (Anubis has one: MaskFront).
- 3–4 key poses from the rig: rest, walk, the signature action (Tefnut/Sekhmet roar with the jaw open, Isis wings spread, Thoth
  writing, Horus falcon cry, Set sneer, Shu lifting the sky, Nut arched with stars, Geb reclining with plants, Bastet sistrum + paw
  lick, Anubis at the balance plumb, Osiris enthroned, Ma'at feather), and a head close-up row with 3 expressions (neutral, angry or
  roaring, pleased) — only expressions the rig can actually perform.
- Callouts with thin leader lines: head, crown/headdress, held objects, skin colour, collar, dress — each with its source tag
  (I-row id from facts.md: object, museum, accession number).
- A colour palette strip with hex codes (taken from the code's PAL / cast colours, not invented).
- A short "必须 / 不要" list in Chinese (e.g. 赛特兽：耳朵方顶、鼻子弯长 / 不要画成驴或狗; hands: no drawn nails).
- The height mark against the deceased (e.g. 「神 = 凡人 × 1.15」 or whatever the series uses).

## Deliverables
1. Code: `episodes/37-qiqing/remotion/src/qq61/sheets61.tsx` calling `registerRoot`, composition `SHEETS61` (1440 × 1080, 30 fps,
   durationInFrames = number of sheets; frame i = sheet i+1), reusing the real components (the sheets must render the SAME drawing code
   the films use, so they can never drift). Keep ep60/ep61 rendering unchanged.
2. `episodes/61-zhongshen/designbook.md`: the canon in words — per character: Chinese name, role, attested iconography + source,
   palette hex, proportions/height, signature action, the 必须/不要 rules; the frame index of each sheet; how future episodes must use
   these components (which cast/component to import).
3. Render every sheet in the runner to check it (e.g. `cd episodes/37-qiqing/remotion && ENTRY=qq61/sheets61 CID=SHEETS61 JPG=1 node
   scripts/frame.mjs stills /tmp/sheets 0 0.0333 …`), look at each, fix layout overlaps, clipping, unreadable text and layering.
   DO NOT COMMIT ANY IMAGE, VIDEO OR AUDIO (public repo). Commit only code and markdown.
4. `tasks/ep61-sheets/result.md`: a short summary in Chinese for the owner + the render command + anything still missing.

## Rules
No keys in files. No Wikipedia/百度百科/知乎 as sources. Only change files under `episodes/37-qiqing/remotion/src/qq61/`,
`episodes/61-zhongshen/` and `tasks/ep61-sheets/` (exports added to qq60 files only if needed, without changing what they render).
End commit messages with: Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>

## Added by the owner (22:50): joints, actions, expressions — logical and good-looking
- Every character must be RIGGED for animation, not a static drawing: each sheet gets a "关节/动作" row showing the joint chain
  moving — neck/head, shoulder/elbow/wrist, hip/knee/ankle, and the special parts: jaws (lioness Tefnut/Sekhmet, crocodile Ammit,
  jackal Anubis), beaks (falcon Horus/Ra, ibis Thoth), ears (Anubis, Bastet, Set), wings (Isis, Ma'at), tails where the canon has
  them. Show 3 stress poses per character (e.g. arm fully raised, deep step, head thrown back) and check there are NO seams, breaks,
  gaps or outlines crossing at the joints, no limb through the body, hands holding objects correctly (object between fingers/fist,
  hand drawn over it), weight on the feet, and that poses are anatomically and physically plausible.
- Expressions that the face rig can really perform, built per head type: eyes (open/half/closed, look direction), brows (raise, frown),
  mouth/jaw/beak (closed, talk, wide roar/screech, smile where the head allows). The roar must be big and readable at phone size:
  jaw wide open, teeth visible, head thrown back, mane/ears reacting — like the reference video's lioness close-up.
- Reference video style (another creator's Egyptian-myth film the owner likes): flat papyrus-texture tomb-painting look; figures in
  profile with clearly articulated limbs; marching rows of priests with stepping legs; big dramatic close-ups (a lioness goddess
  roaring with the jaw wide open, eyes blazing, red sky); calm iconic poses for gods on thrones. Match that clarity, but keep our own
  designs and palette.
- Add an animated check: composition `RIGTEST61` (1440 × 1080, 30 fps, ~6 s per character) cycling each character through its
  walk / signature action / roar or expression changes, so the owner can see the joints move. Render a few frames of it in the runner
  to check, but again commit only code.
