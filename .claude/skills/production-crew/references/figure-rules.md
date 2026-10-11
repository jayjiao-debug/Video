# Figure rules: body logic for the 2D cast

Why this file exists: the owner kept catching the same kind of mistake in the 2D cast — a body that no
real body could make (pond episode, 2026-10-11): legs starting at the chest, a man "sitting" in the air
off the end of a jetty, hands floating in front of the stomach, legs disappearing under a coat. His words:
"I don't want to keep pointing out the same logical issue … can you do some key pivots or rules to mitigate
occurrences of such cases". These rules are checked by code, not by eye, before any frame with a person
goes to the owner.

## The pivot: every figure states what its body is doing

Never drop a `<Figure>` into a scene with a bare `translate/scale`. Place it with `<Person>`
(`explainer/src/art/poseCheck.tsx`) and say:

- **intent**: `stand`, `walk`, `sit`, `crouch` or `portrait` (a cropped picture; not checked).
- **env**: what the body touches. `ground` (y of the floor line), `seat` and `surfaces` (solid boxes such as a
  deck, table or floor: `{x0, x1, y, depth}`), `contacts` (where each hand must be: on a thigh, on the deck,
  holding the pole end), `onBody` (hands that are allowed to touch the body, e.g. hand on chest).

Positions come *from* the body, not the other way round:

- Seated figures are placed with `seatOn(x, surfaceY, scale)`, so the seat rests on the surface.
- Hands are aimed with `ikArm` at points computed from the body (`jointsAt(pose)`: a knee, a thigh) or from
  the prop. Props hang from `handAt(...)`. Never use a hand-typed screen coordinate for a hand.

## The rules (R1–R8)

| Rule | What must be true | The mistake it prevents |
|---|---|---|
| R1 legs-at-hip | Legs start at the hip. `lift` is only a walk bounce (≤ 10). | legs coming out of the chest |
| R2 joint-range | No joint asked past a human limit (the rig clamps silently; the check flags the request). | elbows or knees bent backwards, a snapped neck |
| R3 support | Standing: feet on the ground line. Walking: one foot down. Sitting: the seat on a declared surface and the hip over it. | sitting in the air, floating, sinking into the floor |
| R4 no-pass-through | Feet, knees and hands never inside a solid surface. | legs through the deck, hands through a table |
| R5 hand-purpose | Every hand is holding, touching or gesturing as declared. A free hand is never inside the torso. | hands floating at the stomach or chest, a white cuff in the middle of the chest |
| R6 reachable | A hand target is within arm's length (`reachable()`); otherwise the arm is stretched and the hand falls short. | a hand that never reaches the prop |
| R7 balance | A standing body's chest stays over its feet. | a person who would fall over |
| R8 contact-hold | A held prop's handle is at the hand, every frame. | a pole or net floating next to the hand |

Layering rules built into the rig (`Figure.tsx`), so they cannot be forgotten:

- **Seated** (both thighs forward past 45°): the coat ends at the lap and the thighs are drawn on top of
  it, so the lap and resting hands are visible.
- **Standing**: the coat covers the top of the legs as before.
- `POSES.sit` has `lift: 0`. Seated people sit on something; the legs never start higher up the body.

## The gate

1. **While building a shot:** render it with `inputProps {poseDebug: true}`. The skeleton is drawn in green and
   blue, seats and ground in yellow, and every broken rule in red with its name.
2. **Before stills go to the owner:**
   `node scripts/pose_check.mjs <entry> <Composition> <from-to,…> [step]`
   It renders every Nth frame of the shots with people and lists each violation with its frame range. It
   must print `POSE CHECK: PASS`. A FAIL blocks the stills, the same as a failed loudness check blocks the
   upload.
3. **Still look at it.** Check one full-size still per pose. The code checks the body, not taste.

## Quick reference for common poses

- **Sitting on an edge** (jetty, wall, bench): `EDGE_SIT` (thighs about 80° forward, shins hanging).
  Use `seatOn(edgeX - 80, surfaceY, s)`, so the knees end just past the edge. Rest the far hand on the
  surface beside the hip, or both hands on the thighs (two-thirds of the way to the knee, just above the thigh).
- **Reaching down over an edge:** aim the hand just past and above the near knee, and lean the torso
  10–16° forward. Further than that is out of reach (R6): move the body or the target, not the arm length.
- **Standing with a long tool** (net, pole): both hands on the tool, the near hand lower. Lean at most 16°.
  Both feet stay on the ground line.
