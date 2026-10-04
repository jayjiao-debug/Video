---
name: character-motion
description: Make characters move like people, not puppets - motion reference from CMU motion capture (or the owner's own phone clips via MediaPipe), the rig's human joint limits, wrist/palm/drop, hand shapes, reach rules, and a side-by-side reference board before anything is sent. Use whenever animating or posing a character, hands, fingers or arms in a Juno / explainer video, or when the owner says a pose or bend looks weird (诡异, 尴尬, why is it bending like that).
---

# Character motion

The owner's complaint that started this: "every time it's weird - why is it
bending like that". Poses invented by eye fail in the same few ways: elbows or
wrists folding the wrong way, arms pulled straight like sticks to reach
something too far, hands that don't turn toward what they hold, extra limbs
drawn over the rig, bodies that crouch without sinking. The fix is to **pose
from reference and let the rig refuse impossible joints.**

## Where the code is

Repo **jayjiao-debug/Video**, branch `claude/hopeful-curie-hm3mlq`, under `explainer/`:

- `src/art/Figure.tsx` - the shared rig: `Pose`, `JOINT_LIMITS`, `limitPose`,
  `handAt`, hand shapes (`hands={{near, far}}`: relaxed, grip, open, point, pinch).
- `pipeline/mocap.py` - BVH → side-view rig angles (30 fps JSON in `src/art/mocap/`).
- `src/art/mocap/index.ts` - `MOCAP` clips and `mocapPose(clip, frame)`.
- `src/MocapBoard.tsx` - reference board: actor skeleton (left) vs rig (right).
- `models/mocap/` (not in git) - downloaded BVH files and `index.txt`.

## 1. Rules the rig enforces (don't fight them)

Every pose passes through `limitPose` before drawing:

| joint | range (deg, rig convention) |
|---|---|
| lean (forward +) | -30 … 90 |
| head | -40 … 45 |
| upper arm (from hanging down, forward +) | -70 … 185 |
| elbow (flexes forward only) | 0 … 150 |
| thigh | -45 … 130 |
| knee (flexes backward only) | 0 … 150 |
| wrist (relative to forearm, toward the front +) | -70 … 80 |

Optional `Pose` fields (old poses unaffected): `wristNear/Far`, `palmNear/Far`
(1 = palm to the camera side, -1 = back of the hand), `drop` (the body above
the knees sinks, for crouching). Change ranges only in `JOINT_LIMITS`, never per scene.

## 2. Where poses come from

1. **Owner's own clip (best for desk work, fingers).** A 5–10 s phone clip
   from the side, well lit, hands in frame. Run MediaPipe (installed with
   `pip install --break-system-packages mediapipe`): 33 body points + 21 per
   hand (three joints per finger). Convert to rig angles the same way as
   `mocap.py` (side plane, angles from hanging-down).
2. **CMU motion capture (free, no restrictions).** Mirror on GitHub:
   `https://raw.githubusercontent.com/una-dinosauria/cmu-mocap/master/data/<SSS>/<SS_TT>.bvh`
   (subject zero-padded to 3 digits), index at `.../master/cmu-mocap-index-text.txt`.
   mocap.cs.cmu.edu and Hugging Face are blocked from the sandbox; raw.githubusercontent works.
   `curl` the BVH into `models/mocap/`, then `python -m pipeline.mocap <clip> [t0 t1] [--near left]`.
   Already converted:

   | clip | action | use it for |
   |---|---|---|
   | 13_07 | unscrew bottlecap, drink | holding an object at the chest, raising it |
   | 77_08 | investigate a thing with two hands | bending over / examining |
   | 15_06 | lean forward, reach for | reaching for something on a desk |
   | 13_04 | sit on stool, chin in hand | thinking (actor half-turned: arms out to the side project badly) |
   | 18_08 | explain with hand gestures | talking, startle-ish recoil |
   | 26_10 | bend, lift | picking something up |

   CMU has no individual fingers (wrist, index base and thumb only): it gives
   the wrist angle and which way the palm faces; finger shape comes from the
   rig's five hand shapes. CMU has no "write at a desk / turn pages" clip; use
   the closest clip or ask the owner for a phone clip.
3. **Hand-keyed poses** only for small blends between referenced key poses,
   and checked against a reference frame on the board.

Projection caveats: the rig is drawn in profile. A bend toward or away from the
camera looks like a backward bend in profile; `mocap.py` takes elbows and knees
as absolute flexion for that reason. Prefer clips where the action happens in
the side plane. The facing axis comes from the hips (`cross(up, right→left)`);
if a clip comes out mirrored, that sign is the first thing to check.

## 3. Acting rules (what reads as natural)

- **Never reach beyond the arm.** If a target is more than ~0.95 of the arm
  length from the shoulder, lean the body, move the figure, or bring the object
  closer. An arm pulled straight to a far target is the "stick arm" the owner hates.
- **The hand turns to the object.** Set `wrist*`/`palm*` from the reference
  (holding a book: palm toward the book, wrist slightly back); choose the hand
  shape for the job (grip to hold, pinch for a page or a pen, open to present, point).
- **No extra limbs.** Never draw a thumb, hand or sleeve overlay on top of a
  rig arm: it reads as a second arm. If the rig's hand is too simple for a
  close-up, frame the close-up so the hand is out of shot, or replace the hand
  through the rig, not on top of it.
- **Crouch with `drop`.** Bending at the knees without sinking the body makes the
  figure float; take `drop` from the reference (`mocapPose` sets it from the hips).
- **Anticipation and follow-through.** A small move against the direction before a
  reach (4–6 frames), a spring settle after it, and breathing (±1–2 units, ~22-frame
  period) while still. Blend key poses with `lerpPose` + `spring`, never linear snaps.
- **Close-ups of hands** need a real hand at that scale (fingers, knuckles,
  nails). The rig hand is built for medium shots; zoomed past ~2.5× it looks like
  a blob. Either keep hands out of macro shots or draw a dedicated hand asset
  posed from the reference's wrist/palm angles.

## 4. Check before sending (every character shot)

1. Render the reference board for the clips you used:
   `COMPOSITION=MocapBoard REMOTION_BROWSER=<headless_shell> node scripts/stills.mjs <ep> <dir> 0 1 2 …`
   and a side-by-side of each key pose in the scene next to its reference frame.
2. Look at every key pose at phone size: elbow and knee direction, wrist angle,
   palm toward the object, nothing stretched straight, nothing floating, one arm per shoulder.
3. If the owner calls a pose weird, find the closest reference frame first, then fix.
   Don't guess angles.

## 5. Gotchas

- After changing `Figure.tsx`, clear the bundler cache (`rm -rf node_modules/.cache`)
  if stills don't change.
- `Figure.tsx` is shared by every episode: add optional fields, never change defaults.
