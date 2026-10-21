# Figure rules: body logic for the cast

Why: the owner kept catching bodies no real body could make — legs from the chest, sitting in the air, hands
floating at the stomach (pond, 2026-10-11), a "pusher" leaning his head on the boulder with his arms hanging
(ep35). His words: "I don't want to keep pointing out the same logical issue". So bodies are **checked by code,
not by eye**, before any frame with a person goes to the owner.

> **Code location (fix first):** the pond-episode rig (`<Person>`, `seatOn`, `ikArm`, `Figure.tsx`) and
> `pose_check.mjs` are imported by `episodes/2x-*/build/kf/*.tsx` as `../art/poseCheck` but are **not committed
> to this repo**. The ep35 contact solver is: `episodes/35-sisyphus/build/pushIK.ts` + `checks/push_check.mjs`.
> Move both into one shared engine folder before the next episode with people, and update the paths here.

## The pivot: every figure states what its body is doing

Never drop a figure into a scene with a bare `translate/scale`. Place it with `<Person>` and declare:

- **intent**: `stand`, `walk`, `sit`, `crouch`, `push`, `hold` or `portrait` (a cropped picture; not checked).
- **env**: what the body touches — `ground` (the floor or slope line), `seat`/`surfaces` (solid boxes), `contacts`
  (where each hand or foot must be), `onBody` (hands allowed to touch the body).

**Positions come from contacts, never from joint angles typed by eye.** Compute the contact targets (a point on a
seat, the outline of a rock, a handle, the slope line), solve each limb with two-bone IK from shoulder or hip to its
target, then place hips, spine and head from the limb solutions. Animate by moving the targets (the object
advances, a foot steps), not by rotating limbs.

## The rules

| Rule | What must be true | The mistake it prevents |
|---|---|---|
| R1 legs-at-hip | Legs start at the hip; `lift` is only a walk bounce. | legs coming out of the chest |
| R2 joint-range | No joint past a human limit; elbows and knees keep one bend direction through a move. | bent-back elbows, IK flips |
| R3 support | Standing: feet on the ground line, soles along its slope. Walking: one foot down. Sitting: seat on a declared surface, hip over it. | floating, sitting in the air, sinking |
| R4 no-pass-through | No body part inside a solid surface or prop. | legs through the deck, a head inside a rock |
| R5 hand-purpose | Every hand is holding, touching or gesturing as declared; a free hand is never inside the torso. | hands floating at the chest |
| R6 reachable | Every target is within limb length; otherwise move the body or the target. | a hand that never reaches the prop |
| R7 balance | A standing body's chest stays over its support, unless it is pushing against something. | a person who would fall over |
| R8 contact-hold | A declared contact stays on its surface every frame (held prop at the hand, planted foot fixed). | floating poles, sliding feet |
| R9 contact-only | Only the declared contact parts touch the object; everything else keeps a clear gap. | head leaning on the rock instead of hands pushing |

## The gate

1. **While building a shot:** render with the pose debug overlay (skeleton, surfaces, broken rules in red).
2. **Before stills go to the owner:** run the pose/contact check over every frame with a person. It prints the
   worst frame per rule and must PASS (e.g. hands ≤ 4 px from their surface, head ≥ 15 px from the object,
   planted feet ≤ 3 px). A FAIL blocks the stills, like a failed loudness check blocks the upload.
3. **Then look:** one full-size still per pose, and answer in one line "what body parts touch what?" The code
   checks the body, not taste.

## Common poses

- **Pushing** (a boulder, a cart, a door): palms flat on the object's outline at about shoulder height, arms
  nearly straight, back fairly straight at ~45° into the object, head in line with the spine and clear of the
  object, back leg driving, front knee bent, feet stepping in short alternating steps on the ground line. The
  pusher is drawn in front of the object.
- **Sitting on an edge** (jetty, wall, bench): thighs ~80° forward, shins hanging, knees just past the edge; far
  hand on the surface beside the hip, or both hands on the thighs.
- **Reaching down over an edge:** hand just past and above the near knee, torso leaned 10–16°; further is out of
  reach (R6): move the body or the target.
- **Holding a long tool** (net, pole): both hands on the tool, near hand lower, lean ≤ 16°, both feet down.

Seated figures: the coat ends at the lap and the thighs are drawn over it, so lap and hands are visible.
