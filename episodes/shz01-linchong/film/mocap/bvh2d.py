"""Real-motion references for the 2D rigs, from the CMU Graphics Lab Motion Capture Database (BVH conversion by B. Hahne;
"free for use in research and commercial projects"). Parses a BVH clip, runs forward kinematics, projects the body onto its
own side (sagittal) plane, and writes
  - <out>/<name>_strip.png : stick-figure strip (one pose every `step` frames), scaled to 7.5 heads, for eyeballing,
  - <out>/<name>_angles.json : per sampled frame, side-view joint angles in our rig's convention (degrees):
      torso (pitch of hips->neck from vertical, + = leaning forward), head (pitch of neck->head rel. torso),
      thighR/thighL (hip->knee from vertical, + = forward), kneeR/kneeL (flexion, 0 = straight),
      shinR/shinL (knee->ankle from vertical), upperR/upperL (shoulder->elbow from vertical, + = forward),
      elbowR/elbowL (flexion), plus the pelvis height and the 2D points.
usage: bvh2d.py <clip.bvh> <out_dir> <name> [step_frames] [start] [end]
"""
import sys, json, math
import numpy as np
from PIL import Image, ImageDraw


def parse(path):
    lines = open(path).read().split('\n')
    joints, stack, i = [], [], 0
    while not lines[i].strip().startswith('MOTION'):
        t = lines[i].split()
        if t and t[0] in ('ROOT', 'JOINT'):
            joints.append({'name': t[1], 'parent': stack[-1] if stack else None, 'offset': None, 'channels': [], 'end': None})
            cur = len(joints) - 1
        elif t and t[0] == 'End':
            joints.append({'name': joints[stack[-1]]['name'] + '_End', 'parent': stack[-1], 'offset': None, 'channels': [], 'end': True})
            cur = len(joints) - 1
        elif t and t[0] == '{':
            stack.append(cur)
        elif t and t[0] == '}':
            stack.pop()
        elif t and t[0] == 'OFFSET':
            joints[stack[-1]]['offset'] = np.array([float(x) for x in t[1:4]])
        elif t and t[0] == 'CHANNELS':
            joints[stack[-1]]['channels'] = t[2:]
        i += 1
    nf = int(lines[i + 1].split()[1]); ft = float(lines[i + 2].split()[2])
    data = np.array([[float(x) for x in l.split()] for l in lines[i + 3:i + 3 + nf] if l.strip()])
    return joints, data, ft


def rot(axis, deg):
    a = math.radians(deg); c, s = math.cos(a), math.sin(a)
    if axis == 'X': return np.array([[1, 0, 0], [0, c, -s], [0, s, c]])
    if axis == 'Y': return np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]])
    return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]])


def fk(joints, frame):
    pos, R, k = {}, {}, 0
    for j, J in enumerate(joints):
        ch = J['channels']; vals = frame[k:k + len(ch)]; k += len(ch)
        local = np.eye(3); trans = np.zeros(3)
        for c, v in zip(ch, vals):
            if c.endswith('position'): trans['XYZ'.index(c[0])] = v
            else: local = local @ rot(c[0], v)
        if J['parent'] is None:
            R[j] = local; pos[j] = J['offset'] + trans
        else:
            p = J['parent']; R[j] = R[p] @ local; pos[j] = pos[p] + R[p] @ J['offset']
    return {joints[j]['name']: pos[j] for j in pos}


def main():
    path, out, name = sys.argv[1:4]
    step = int(sys.argv[4]) if len(sys.argv) > 4 else 12
    joints, data, ft = parse(path)
    a = int(sys.argv[5]) if len(sys.argv) > 5 else 0
    b = int(sys.argv[6]) if len(sys.argv) > 6 else len(data)
    frames = list(range(a, min(b, len(data)), step))
    P = [fk(joints, data[f]) for f in frames]
    # side plane: forward = average horizontal direction of travel / facing (hips->toes), up = +Y
    fwd = np.zeros(3)
    for p in P:
        f = (p['LeftToeBase'] + p['RightToeBase']) / 2 - (p['LeftFoot'] + p['RightFoot']) / 2
        fwd += np.array([f[0], 0, f[2]])
    fwd /= np.linalg.norm(fwd) + 1e-9
    def to2(v):  # (forward, up)
        return np.array([v @ fwd, v[1]])
    def ang_v(a2, b2):  # angle of a->b from straight down (+ = toward forward), degrees
        d = b2 - a2; return math.degrees(math.atan2(d[0], -d[1]))
    def ang_up(a2, b2):
        d = b2 - a2; return math.degrees(math.atan2(d[0], d[1]))
    recs, figs = [], []
    for f, p in zip(frames, P):
        q = {k: to2(v) for k, v in p.items()}
        hip = q['Hips']; neck = q['Neck'] if 'Neck' in q else q['Neck1']; head = q['Head']
        r = {'frame': f, 't': round(f * ft, 3)}
        r['torso'] = round(ang_up(hip, neck), 1)
        r['head'] = round(ang_up(neck, head) - r['torso'], 1)
        for S, s in (('R', 'Right'), ('L', 'Left')):
            th = ang_v(q[f'{s}UpLeg'], q[f'{s}Leg']); sh = ang_v(q[f'{s}Leg'], q[f'{s}Foot'])
            r[f'thigh{S}'] = round(th, 1); r[f'shin{S}'] = round(sh, 1); r[f'knee{S}'] = round(th - sh, 1)
            ua = ang_v(q[f'{s}Arm'], q[f'{s}ForeArm']); fa = ang_v(q[f'{s}ForeArm'], q[f'{s}Hand'])
            r[f'upper{S}'] = round(ua, 1); r[f'elbow{S}'] = round(fa - ua, 1)
        r['pts'] = {k: [round(float(v[0]), 2), round(float(v[1]), 2)] for k, v in q.items() if not k.endswith('_End')}
        recs.append(r); figs.append(q)
    json.dump({'clip': path.split('/')[-1], 'fps': round(1 / ft), 'step': step, 'frames': recs}, open(f'{out}/{name}_angles.json', 'w'))
    # strip: heads -> 7.5 heads tall figure of 300 px
    cols = min(8, len(figs)); rows = math.ceil(len(figs) / cols); cw, chh = 260, 360
    img = Image.new('RGB', (cols * cw, rows * chh), (244, 238, 226)); d = ImageDraw.Draw(img)
    allh = max(max(v[1] for v in q.values()) - min(v[1] for v in q.values()) for q in figs)
    k = 300 / allh
    bones = [('Hips', 'Spine'), ('Spine', 'Spine1'), ('Spine1', 'Neck'), ('Neck', 'Head'),
             ('Neck', 'LeftArm'), ('LeftArm', 'LeftForeArm'), ('LeftForeArm', 'LeftHand'),
             ('Neck', 'RightArm'), ('RightArm', 'RightForeArm'), ('RightForeArm', 'RightHand'),
             ('Hips', 'LeftUpLeg'), ('LeftUpLeg', 'LeftLeg'), ('LeftLeg', 'LeftFoot'), ('LeftFoot', 'LeftToeBase'),
             ('Hips', 'RightUpLeg'), ('RightUpLeg', 'RightLeg'), ('RightLeg', 'RightFoot'), ('RightFoot', 'RightToeBase')]
    for n, (q, r) in enumerate(zip(figs, recs)):
        ox, oy = (n % cols) * cw, (n // cols) * chh
        base = min(v[1] for v in q.values()); cx = q['Hips'][0]
        P2 = lambda v: (ox + cw / 2 + (v[0] - cx) * k, oy + chh - 30 - (v[1] - base) * k)
        for a_, b_ in bones:
            if a_ in q and b_ in q:
                col = (200, 60, 50) if 'Right' in a_ + b_ else (60, 90, 160) if 'Left' in a_ + b_ else (40, 30, 25)
                d.line([P2(q[a_]), P2(q[b_])], fill=col, width=5)
        hx, hy = P2(q['Head']); d.ellipse([hx - 16, hy - 16, hx + 16, hy + 16], outline=(40, 30, 25), width=4)
        d.text((ox + 6, oy + 4), f"f{r['frame']} t{r['t']}s torso{r['torso']:+.0f} kneeR{r['kneeR']:.0f} kneeL{r['kneeL']:.0f}", fill=(80, 60, 40))
    img.save(f'{out}/{name}_strip.png')
    print(name, len(data), 'frames @', round(1 / ft), 'fps; sampled', len(recs))


main()
