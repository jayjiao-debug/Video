# Real-motion references (motion capture)

Owner (2026-11-08): the rock push looked too still — "one foot forward, back bent, please try getting reference of real
human geometry when doing movement". Poses for actions now come from real motion capture instead of guesswork.

**Source.** CMU Graphics Lab Motion Capture Database (mocap.cs.cmu.edu), BVH conversion by B. Hahne, mirrored on GitHub
as `meshula/cmu-mocap`. Licence (READMEFIRST): free for use in research and commercial projects worldwide. Credit line:
*The data used in this project was obtained from mocap.cs.cmu.edu. The database was created with funding from NSF
EIA-0196217.*

**Tool.** `bvh2d.py <clip.bvh> <out_dir> <name> [step] [start] [end]` parses a clip, runs forward kinematics, projects
the body onto its own side plane and writes a stick-figure strip (`<name>_strip.png`, not committed) and per-frame
side-view angles (`<name>_angles.json`): torso (hips → neck from vertical, + forward), thigh, knee flexion, shin, upper
arm (world), elbow flexion, head, plus the 2D joint points.

**Clips kept in the repo** (`clips/`, angles only, small):
- `push_heavy.json` — 82_06 "pushing on heavy object", frames 380–620 every 4 (120 fps). Used by T10 (S22): frames
  428 → 508, front foot planted, pelvis travel ≈ 160 px at our scale in 0.66 s = the stone's slide.

**Clips checked out for later** (in `/dev/shm/cmu-mocap/data`, not committed): 81_06 push heavy box, 104_02 walk,
09_01 run, 02_05 punch/strike, 02_07 swordplay, 90_18 fall, 111_02 bow, 23_03 kneel.

**Rig.** `chars/rig/linchong.mjs` side view takes the same quantities: `torso`, `spine`, `legR/L` (thigh), `kneeR/L`,
`footR/L` (heel lift; the floating foot rises onto its toes automatically), `armsWorld`, `headWorld`. Joints sit at
anatomical heights (hip 0.515, knee 0.285, ankle 0.06 of stature). `chars/rig/push.mjs` adds two-bone IK so the arms
reach the object and places the 2D hands (`film/hand2d` 'stone'). `chars/rig/pose_sheet.mjs` renders capture vs rig.
