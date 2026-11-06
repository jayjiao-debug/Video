# Task: fix the FACE RIGS of the animal-headed characters (古埃及神话故事 series)

Owner's note (2026-11-06, with screenshots of RIGTEST61): "the rigging for their face is all out of place, especially where they move
their facials" — limited to the NON-HUMAN heads. Human heads are fine; do not touch them.
Code: `episodes/37-qiqing/remotion/src/qq61/` (cast61.tsx, chars61.tsx, expr61.tsx, sheetkit61.tsx, sheets61.tsx: SHEETS61 +
RIGTEST61) and the shared rig `episodes/37-qiqing/remotion/src/qq60/rig60.tsx` (heads, `jaw`, `ear` options). Design canon:
`episodes/61-zhongshen/designbook.md`. Look at the faces in RIGTEST61 / SHEETS61 first (render them, see "Check" below).

## What is wrong (from the owner's screenshots)
- Tefnut / Sekhmet (lioness): when the jaw opens, the lower jaw is a thin sliver detached from the muzzle, the teeth float in front
  of the face, the mouth line runs past the muzzle, the background shows through the mouth; the eye is a round cartoon eye with a
  white sclera sitting on the cheek outline. The head reads as a dog/bear, not a lioness.
- Bastet (cat): the eye's white crosses the head outline (sticks out of the face); the whiskers start outside the muzzle; the ears
  move but the inner-ear colour shifts off the ear.
- Horus / Ra (falcon): the white crescent under the eye is misplaced; when the beak opens the lower mandible does not meet the upper
  beak at the gape; parts overlap the outline.
- Check the same faults on Anubis (jackal), Thoth (ibis), Set (Set-animal), Ammit (crocodile, ep60 Ammit2 — keep its ep60 look
  unchanged in ep60) and the falcon form of Ra.

## How each moving face must be built (rules)
1. Layered parts per head: skull/back (with mane/ears/headdress), upper muzzle or upper beak (with the nose / cere), lower jaw or
   lower mandible as a SEPARATE shape rotating around an anatomically placed hinge (lion/jackal/croc: at the back of the gape below
   and in front of the ear; falcon/ibis: at the gape corner under the eye), the mouth interior (dark red, tongue) drawn BEHIND both
   jaws and big enough to fill every opening angle (no background showing), teeth attached to their jaw (they rotate with it), the
   cheek / jowl fur overlapping the hinge so the joint is never seen.
2. Everything is clipped to (or drawn inside) the head silhouette: no eye, whisker, brow, marking or tooth may cross the outer
   outline. Eyes sit inside the face, Egyptian almond shape with a kohl line (not a round cartoon eye with a big white), pupil inside
   the eye shape; blinks close the lids along the eye shape.
3. Species-true and recognisable at phone size: lioness = broad flat nose, strong muzzle, cheek ruff, round ears; cat = small
   triangle nose, muzzle pads with whiskers rooted on them, tall ears; falcon = hooked beak with the dark cere, round eye, the
   falcon's dark malar stripe below the eye (the wedjat marking) as a clean stripe from the eye down the cheek; ibis = long curved
   beak, small eye; jackal = long snout, black nose, tall ears; Set-animal = curved snout, square-tipped ears.
4. Expressions per head type, every state clean: closed / talk (small open) / wide (roar or screech, 40–60°) for jaws and beaks;
   eyes open / half / closed + look direction; brow raise and frown where the head has a brow ridge; ears up / back for jackal, cat,
   Set. A roar opens the jaw wide, shows teeth on both jaws and the tongue, throws the head back a little — clearly readable small.
5. ep60 must render exactly as before (it uses Anubis, Thoth, Horus, Osiris, Isis heads and Ammit2): new behaviour only behind
   options that default to the old drawing, or verify by rendering ep60 frames before/after (EP60PIC frames 1500, 2500, 4300 must look
   the same).

## Deliverables
1. The fixed head/face code (qq61 casts and, if needed, rig60.tsx options).
2. A check composition `FACECHECK61` in `src/qq61/sheets61.tsx` (or its own file with registerRoot): 1440 × 1080, one frame per
   non-human character (Tefnut, Sekhmet, Bastet, Horus, Ra, Anubis, Thoth, Set, Ammit): the head big, in a row of states — closed,
   talk, wide roar/screech, eyes half, eyes closed, brow/ears state — with a thin magenta overlay of the head outline on top, so any
   part crossing it is visible.
3. Re-render RIGTEST61 and SHEETS61 frames in the runner, look at every face at full size, fix, repeat until clean.
   DO NOT COMMIT IMAGES, VIDEO OR AUDIO (public repo) — only code and markdown.
4. Update `episodes/61-zhongshen/designbook.md` (face-rig section: pivots, layers, states per head).
5. `tasks/ep61-facerig/result.md` (Chinese, short): what was wrong, what changed per head, the render commands.

Rules: no keys in files; only change `episodes/37-qiqing/remotion/src/qq61/`, `src/qq60/rig60.tsx` (non-breaking), the designbook
and `tasks/ep61-facerig/`. End commits with: Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
