"""Motion reference from the CMU motion-capture database (BVH, 120 fps).

Parses a BVH file, runs forward kinematics, projects the skeleton onto the
character's side plane (the rig is drawn in profile, facing right) and converts
every frame into the rig's joint angles (`Pose` in src/art/Figure.tsx):

  lean, head            spine and neck, degrees forward of vertical
  armNear/armFar        [upper arm from hanging-down (+ = forward), elbow bend]
  legNear/legFar        [thigh from hanging-down (+ = forward), knee bend]
  wristNear/wristFar    hand direction relative to the forearm (+ = toward the front)
  palmNear/palmFar      1 if the palm faces the camera side, -1 if away (from the thumb)

plus the 2D projected joints for drawing the reference skeleton. Output is a small
JSON clip (resampled to 30 fps) the Remotion side reads with `useMocap`.

Data: CMU Graphics Lab Motion Capture Database (mocap.cs.cmu.edu), BVH conversion
by B. Hahne (cgspeed); both release the data without restrictions. Mirror:
github.com/una-dinosauria/cmu-mocap.

  python -m pipeline.mocap 13_04 [start_s end_s] [--near right|left]
"""

import json
import math
import os
import sys

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "models", "mocap")
OUT = os.path.join(ROOT, "src", "art", "mocap")


def parse_bvh(path):
    with open(path) as f:
        tokens = f.read().split()
    i = 0
    joints = []  # name, parent, offset, channels
    stack = []

    def take():
        nonlocal i
        t = tokens[i]
        i += 1
        return t

    assert take() == "HIERARCHY"
    while True:
        t = take()
        if t in ("ROOT", "JOINT"):
            name = take()
            parent = stack[-1] if stack else -1
            assert take() == "{"
            assert take() == "OFFSET"
            off = [float(take()) for _ in range(3)]
            assert take() == "CHANNELS"
            n = int(take())
            ch = [take() for _ in range(n)]
            joints.append({"name": name, "parent": parent, "offset": np.array(off), "channels": ch, "end": None})
            stack.append(len(joints) - 1)
        elif t == "End":
            take()  # Site
            assert take() == "{"
            assert take() == "OFFSET"
            joints[stack[-1]]["end"] = np.array([float(take()) for _ in range(3)])
            assert take() == "}"
        elif t == "}":
            stack.pop()
        elif t == "MOTION":
            break
    assert take() == "Frames:"
    nf = int(take())
    assert take() == "Frame" and take() == "Time:"
    dt = float(take())
    nch = sum(len(j["channels"]) for j in joints)
    data = np.array(tokens[i:i + nf * nch], dtype=float).reshape(nf, nch)
    return joints, data, dt


def rot(axis, deg):
    a = math.radians(deg)
    c, s = math.cos(a), math.sin(a)
    if axis == "X":
        return np.array([[1, 0, 0], [0, c, -s], [0, s, c]])
    if axis == "Y":
        return np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]])
    return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]])


def fk(joints, row):
    """World positions of every joint (and end sites) for one frame."""
    pos, R = {}, {}
    k = 0
    for idx, j in enumerate(joints):
        local_t = j["offset"].copy()
        local_r = np.eye(3)
        for ch in j["channels"]:
            v = row[k]
            k += 1
            if ch.endswith("position"):
                local_t["XYZ".index(ch[0])] = v if j["parent"] < 0 else local_t["XYZ".index(ch[0])]
            else:
                local_r = local_r @ rot(ch[0], v)
        if j["parent"] < 0:
            R[idx] = local_r
            pos[j["name"]] = local_t
        else:
            p = joints[j["parent"]]["name"]
            R[idx] = R[j["parent"]] @ local_r
            pos[j["name"]] = pos[p] + R[j["parent"]] @ j["offset"]
        if j["end"] is not None:
            pos[j["name"] + "_end"] = pos[j["name"]] + R[idx] @ j["end"]
    return pos


def angle_down(v):
    """Angle of a 2D (forward, up) vector from pointing straight down; + = forward."""
    return math.degrees(math.atan2(v[0], -v[1]))


def angle_up(v):
    return math.degrees(math.atan2(v[0], v[1]))


def wrap(a):
    return (a + 180) % 360 - 180


def convert(clip, t0=None, t1=None, near="right", fps_out=30):
    joints, data, dt = parse_bvh(os.path.join(SRC, f"{clip}.bvh"))
    fps_in = 1 / dt
    a = 1 if t0 is None else int(t0 * fps_in)  # frame 0 is the added T-pose
    b = len(data) if t1 is None else min(len(data), int(t1 * fps_in))
    step = fps_in / fps_out
    frames = [fk(joints, data[int(round(a + k * step))]) for k in range(int((b - a) / step))]
    # the side plane: forward = the hips' facing direction (averaged over the clip), up = +Y
    up = np.array([0.0, 1.0, 0.0])
    fw = np.zeros(3)
    for p in frames:
        across = p["RightUpLeg"] - p["LeftUpLeg"]
        f = np.cross(up, across)
        fw += f / (np.linalg.norm(f) + 1e-9)
    fw[1] = 0
    fw /= np.linalg.norm(fw)
    side = np.cross(up, fw)  # toward the character's left
    tpose = fk(joints, data[0])
    height = tpose["Head_end"][1] - min(tpose["LeftToeBase"][1], tpose["RightToeBase"][1])
    N = "Right" if near == "right" else "Left"
    F = "Left" if near == "right" else "Right"

    def p2(p, name):
        v = p[name] - p["Hips"]
        return np.array([v @ fw, v @ up]) / height  # in body heights, hips at the origin

    out = []
    for p in frames:
        q = {k: p2(p, k) for k in p}
        spine = q["Neck"] - q["Hips"]
        lean = angle_up(spine)
        neck = q["Head"] - q["Neck"]
        head = wrap(angle_up(neck) - lean)

        def arm(S):
            sh, el, wr = q[f"{S}Arm"], q[f"{S}ForeArm"], q[f"{S}Hand"]
            a1 = angle_down(el - sh)
            a2 = angle_down(wr - el)
            hand = q[f"{S}HandIndex1"] - wr
            wrist = wrap(angle_down(hand) - a2)
            # thumb on the camera side → palm toward the camera (for the near hand, camera is on the near side)
            thumb = p[f"{'L' if S == 'Left' else 'R'}Thumb"] - p[f"{S}Hand"]
            cam_side = -side if S == "Right" else side
            palm = 1 if (thumb @ cam_side) > 0 else -1
            # elbows only flex: a "negative" bend in profile is a bend in depth (arm out to the side)
            return [round(a1, 1), round(abs(wrap(a2 - a1)), 1)], round(wrist, 1), palm

        def leg(S):
            hp, kn, an = q[f"{S}UpLeg"], q[f"{S}Leg"], q[f"{S}Foot"]
            a1 = angle_down(kn - hp)
            a2 = angle_down(an - kn)
            return [round(a1, 1), round(abs(wrap(a1 - a2)), 1)]

        aN, wN, pN = arm(N)
        aF, wF, pF = arm(F)
        out.append({
            "lean": round(wrap(lean), 1), "head": round(head, 1),
            "armNear": aN, "armFar": aF, "wristNear": wN, "wristFar": wF, "palmNear": pN, "palmFar": pF,
            "legNear": leg(N), "legFar": leg(F),
            "hipY": round(float((p["Hips"] - tpose["Hips"])[1] / height), 3),
            "joints": {k: [round(float(v[0]), 3), round(float(v[1]), 3)] for k, v in q.items() if k in KEEP},
        })
    return {"clip": clip, "near": near, "fps": fps_out, "t0": t0 or 0, "frames": out}


KEEP = ["Hips", "Spine1", "Neck", "Head", "Head_end", "LeftArm", "LeftForeArm", "LeftHand", "LeftHandIndex1", "RightArm",
        "RightForeArm", "RightHand", "RightHandIndex1", "LeftUpLeg", "LeftLeg", "LeftFoot", "LeftToeBase", "RightUpLeg",
        "RightLeg", "RightFoot", "RightToeBase", "LThumb", "RThumb"]


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    near = "left" if "--near" in sys.argv and sys.argv[sys.argv.index("--near") + 1] == "left" else "right"
    clip = args[0]
    t0 = float(args[1]) if len(args) > 1 else None
    t1 = float(args[2]) if len(args) > 2 else None
    res = convert(clip, t0, t1, near)
    os.makedirs(OUT, exist_ok=True)
    name = f"{clip}" + (f"_{int(t0)}-{int(t1)}" if t0 is not None else "")
    with open(os.path.join(OUT, f"{name}.json"), "w") as f:
        json.dump(res, f, separators=(",", ":"))
    print(f"{name}: {len(res['frames'])} frames @30fps")
