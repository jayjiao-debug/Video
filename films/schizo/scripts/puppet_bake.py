"""Bake the wooden puppet's motion for 《身体里的两个人》 from CMU motion capture.

Every pose is a real actor's joint rotations (BVH local rotations, CMU Graphics Lab
database, B. Hahne's BVH release, no restrictions) or a small blend between two
referenced poses. Sources (BVH files in films/schizo/mocap/):

  14_30  sit on stepstool, hands on thighs (13.2-16.8 s)   -> seated base + idle life
  77_04  looking around (5.04 -> 5.71 s)                    -> the head/chest turn toward the window
  80_25  answering a phone (2.45 -> 4.0 s, after the pick-up) -> the left hand rising to the ear, hold, lower (reversed)
  80_25  standing still (0.5 s)                             -> standing pose for the model sheet
  (79_79 putting on headphones was tried first: its hands hold the cups 28 cm out, too wide for a hand at the ear)

Output: src/puppet/takes.json (skeleton offsets in metres, per-frame local quaternions [x,y,z,w]).
QA printed at the end: elbow/knee flexion range, feet height, wrist-to-ear distance.

  python3 scripts/puppet_bake.py          (run from films/schizo)
"""
import json, math, os, sys
import numpy as np
from scipy.interpolate import PchipInterpolator
from scipy.spatial.transform import Rotation as Rot

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BVH = os.path.join(HERE, 'mocap')
OUT = os.path.join(HERE, 'src', 'puppet', 'takes.json')
FPS = 30
HEIGHT = 1.72  # puppet height in metres


# ---------------------------------------------------------------- BVH
def parse(path):
    tok = open(path).read().split(); i = 0; J = []; st = []
    def take():
        nonlocal i; i += 1; return tok[i - 1]
    assert take() == 'HIERARCHY'
    while True:
        t = take()
        if t in ('ROOT', 'JOINT'):
            name = take(); take(); take()
            off = np.array([float(take()) for _ in range(3)]); take(); n = int(take())
            J.append({'name': name, 'parent': st[-1] if st else -1, 'offset': off, 'ch': [take() for _ in range(n)], 'end': None})
            st.append(len(J) - 1)
        elif t == 'End':
            take(); take(); take(); J[st[-1]]['end'] = np.array([float(take()) for _ in range(3)]); take()
        elif t == '}':
            st.pop()
        elif t == 'MOTION':
            break
    take(); nf = int(take()); take(); take(); dt = float(take())
    nch = sum(len(j['ch']) for j in J)
    return J, np.array(tok[i:i + nf * nch], dtype=float).reshape(nf, nch), dt


class Clip:
    def __init__(self, name):
        self.J, self.D, self.dt = parse(os.path.join(BVH, name + '.bvh'))
        self.names = [j['name'] for j in self.J]

    def local(self, t):
        """local rotations (scipy Rotation per joint) and root position at time t (s), linear-in-time sample"""
        x = t / self.dt; a = int(math.floor(x)); k = x - a
        a = max(1, min(len(self.D) - 2, a))
        rows = [self.D[a], self.D[a + 1]]
        res = []
        for row in rows:
            out = {}; c = 0; root = None
            for j in self.J:
                m = np.eye(3); p = None
                for ch in j['ch']:
                    v = row[c]; c += 1
                    if ch.endswith('position'):
                        if p is None: p = np.zeros(3)
                        p['XYZ'.index(ch[0])] = v
                    else:
                        m = m @ Rot.from_euler(ch[0].lower(), v, degrees=True).as_matrix()
                out[j['name']] = Rot.from_matrix(m)
                if j['parent'] < 0: root = p
            res.append((out, root))
        q = {n: slerp(res[0][0][n], res[1][0][n], k) for n in self.names}
        return q, res[0][1] * (1 - k) + res[1][1] * k


def slerp(a, b, k):
    qa, qb = a.as_quat(), b.as_quat()
    if qa @ qb < 0: qb = -qb
    d = min(1.0, abs(qa @ qb))
    if d > 0.9995:
        q = qa + (qb - qa) * k
    else:
        th = math.acos(d); q = (math.sin((1 - k) * th) * qa + math.sin(k * th) * qb) / math.sin(th)
    return Rot.from_quat(q / np.linalg.norm(q))


def ident():
    return Rot.identity()


# ---------------------------------------------------------------- skeleton: subject 14's proportions, in metres
SK = Clip('14_30')
NAMES = SK.names
PARENT = {j['name']: (SK.J[j['parent']]['name'] if j['parent'] >= 0 else None) for j in SK.J}
_raw = {j['name']: j['offset'].copy() for j in SK.J}
_ends = {j['name']: j['end'] for j in SK.J if j['end'] is not None}


def _fk_rest():
    P = {}
    for n in NAMES:
        P[n] = _raw[n] if PARENT[n] is None else P[PARENT[n]] + _raw[n]
    return P


_rp = _fk_rest()
_h = (_rp['Head'] + _ends['Head'])[1] - min(_rp['LeftToeBase'][1], _rp['RightToeBase'][1])
SCALE = HEIGHT / (_h + 0.6)  # +0.6 units: crown above the head end site, sole below the ankle
OFF = {n: (_raw[n] * SCALE) for n in NAMES}
ENDS = {n: (_ends[n] * SCALE) for n in _ends}


def fk(q, root):
    """world positions and rotations; q: name -> Rotation (local), root: hips position (m)"""
    P, R = {}, {}
    for n in NAMES:
        p = PARENT[n]
        if p is None:
            R[n] = q[n]; P[n] = np.array(root, float)
        else:
            R[n] = R[p] * q[n]; P[n] = P[p] + R[p].apply(OFF[n])
    return P, R


# ---------------------------------------------------------------- helpers for composing
def yaw_of(r):
    """heading of the hips (rotation about +Y) from a root rotation"""
    f = r.apply([0, 0, 1.0]); return math.atan2(f[0], f[2])


def keys(pts):
    """monotone cubic through (t, v) keys: holds exactly, no invented overshoot"""
    t, v = zip(*pts); f = PchipInterpolator(t, v, extrapolate=True)
    return lambda x: float(f(min(max(x, t[0]), t[-1])))


def scaled(r, k):
    """rotation r scaled by k (slerp from identity; k may be slightly <0 or >1 for anticipation/overshoot)"""
    return Rot.from_rotvec(r.as_rotvec() * k)


SPINE = ['LowerBack', 'Spine', 'Spine1']
NECK = ['Neck', 'Neck1', 'Head']
LARM = ['LeftShoulder', 'LeftArm', 'LeftForeArm', 'LeftHand', 'LeftFingerBase', 'LeftHandIndex1', 'LThumb']

BASE = SK
LOOK = Clip('77_04')
EAR = Clip('80_25')
STAND = Clip('80_25')

# the look: per-joint delta from a neutral frame (5.04 s) to the looking-left frame (5.71 s)
_la, _ = LOOK.local(5.04); _lb, _ = LOOK.local(5.71)
LOOK_D = {n: _la[n].inv() * _lb[n] for n in SPINE + NECK}
LOOK_AMP = 0.62

# base orientation: face +Z
_b0, _r0 = BASE.local(13.2)
YAW0 = yaw_of(_b0['Hips'])
UNYAW = Rot.from_euler('y', -YAW0)


def base_pose(t, speed_src):
    q, root = BASE.local(speed_src(t))
    q = dict(q); q['Hips'] = UNYAW * q['Hips']
    d = UNYAW.apply((root - _r0) * SCALE); d[1] *= 0.6
    return q, d


# ---------------------------------------------------------------- the test take (9.5 s)
DUR = 9.5
src_base = lambda t: 13.2 + 3.5 * (t / DUR)  # 14_30's seated stretch, played at 0.37x: real micro-motion, slowed

k_look = keys([(0, 0), (1.9, 0), (2.15, -0.05), (3.35, 1.05), (3.85, 1.0), (4.6, 1.0), (5.7, 0.30), (7.3, 0.28), (8.7, 0.08), (9.5, 0.08)])
# the arm: 80_25 source time. the hand comes up from the thigh (blend into the actor's hand-in-front-of-chest pose at 2.45 s),
# then the actor's own move to the ear and settle (2.45 -> 3.2 s, 1.6x slower), hold (3.2 -> 4.0 s, slowed), lower = that move reversed
src_ear = keys([(0, 2.45), (4.85, 2.45), (6.05, 3.2), (7.3, 4.0), (7.45, 3.1), (8.25, 2.45), (9.5, 2.45)])
w_ear = keys([(0, 0), (4.45, 0), (5.15, 0.8), (5.5, 1.0), (7.75, 1.0), (8.4, 0.75), (9.2, 0.0), (9.5, 0)])
w_earhead = keys([(0, 0), (4.8, 0), (5.9, 0.5), (7.3, 0.5), (8.9, 0.0), (9.5, 0)])
antic = keys([(0, 0), (4.3, 0), (4.5, 1), (4.75, 0), (9.5, 0)])  # a small dip of the chest before the hand rises


HEAD_TILT = Rot.from_euler('x', -12, degrees=True)  # CMU head frames sit ~15 deg nose-down at rest; the egg is mounted tilted back
EAR_L = HEAD_TILT.apply([0.084, 0.062, -0.005])      # left ear on the egg, in the Head frame
PALM_AT_EAR = HEAD_TILT.apply([0.084 + 0.035, 0.030, 0.035])  # palm centre at the jaw just outside/in front of the ear: fingertips reach the ear
MITTEN = 0.165                                        # wrist -> mitten tip (m)


def palm_centre(P, R):
    d = P['LeftHandIndex1'] - P['LeftHand']; d /= np.linalg.norm(d)
    return P['LeftHand'] + d * MITTEN * 0.5


def ik_to_ear(q, root, w, iters=8, max_corr=28.0):
    """small correction so the mitten (longer than CMU's short hand segment) actually rests at the ear:
    swing at the shoulder (ball joint) and flex/extend only about the elbow's own hinge axis. Faded with w."""
    if w <= 0.001: return q, 0.0
    q = dict(q); q0 = dict(q); total = 0.0
    for _ in range(iters):
        P, R = fk(q, root)
        tgt = P['Head'] + R['Head'].apply(PALM_AT_EAR)
        # elbow hinge
        ua = P['LeftForeArm'] - P['LeftArm']; fa = P['LeftHand'] - P['LeftForeArm']
        axis = np.cross(ua, fa); axis /= np.linalg.norm(axis) + 1e-9
        pc = palm_centre(P, R); a = pc - P['LeftForeArm']; b = tgt - P['LeftForeArm']
        a_p = a - axis * (a @ axis); b_p = b - axis * (b @ axis)
        ang = math.atan2(np.cross(a_p, b_p) @ axis, a_p @ b_p)
        Dw = Rot.from_rotvec(axis * ang * 0.5)
        Rp = R['LeftArm']; q['LeftForeArm'] = Rp.inv() * Dw * Rp * q['LeftForeArm']
        # shoulder swing
        P, R = fk(q, root)
        pc = palm_centre(P, R); a = pc - P['LeftArm']; b = tgt - P['LeftArm']
        ax = np.cross(a, b); n = np.linalg.norm(ax)
        if n > 1e-9:
            ang = math.atan2(n, a @ b); Dw = Rot.from_rotvec(ax / n * ang * 0.5)
            Rp = R['LeftShoulder']; q['LeftArm'] = Rp.inv() * Dw * Rp * q['LeftArm']
    for n in ('LeftArm', 'LeftForeArm'):
        d = (q0[n].inv() * q[n]).magnitude() * 180 / math.pi
        k = min(1.0, max_corr / d) if d > 1e-6 else 1.0
        q[n] = slerp(q0[n], q[n], w * k); total = max(total, d)
    return q, total


def compose(t):
    q, d = base_pose(t, src_base)
    # 1) the look (chest turns less and later than the head)
    kl = k_look(t); kc = k_look(t - 0.18)
    for n in SPINE: q[n] = q[n] * scaled(LOOK_D[n], kc * LOOK_AMP)
    for n in NECK: q[n] = q[n] * scaled(LOOK_D[n], kl * LOOK_AMP)
    # 2) the hand to the ear (absolute arm from 80_25), and its head
    eq, _ = EAR.local(src_ear(t))
    w = w_ear(t)
    if w > 0:
        for n in LARM: q[n] = slerp(q[n], eq[n], w)
    wh = w_earhead(t)
    if wh > 0:
        for n in NECK: q[n] = slerp(q[n], eq[n] * scaled(LOOK_D[n], k_look(t) * LOOK_AMP * 0.5), wh)
    # 3) anticipation + breathing (4.4 s cycle, chest and shoulders)
    a = antic(t)
    br = math.sin(2 * math.pi * t / 4.4)
    q['Spine'] = q['Spine'] * Rot.from_euler('x', 0.8 * br + 1.6 * a, degrees=True)
    q['Spine1'] = q['Spine1'] * Rot.from_euler('x', -0.6 * br, degrees=True)
    q['LeftShoulder'] = q['LeftShoulder'] * Rot.from_euler('z', 0.7 * br - 1.2 * a, degrees=True)
    q['RightShoulder'] = q['RightShoulder'] * Rot.from_euler('z', -0.7 * br, degrees=True)
    return q, d


def compose_ik(t, root):
    q, d = compose(t)
    q, corr = ik_to_ear(q, root + d, w_ear(t) ** 2)
    return q, d, corr


# ---------------------------------------------------------------- seat height from the base pose (feet flat on the floor)
def sole_y(P, R):
    """lowest point of the feet: toe end and heel (behind/below the ankle)"""
    ys = []
    for s in ('Left', 'Right'):
        ys.append((P[s + 'ToeBase'] + R[s + 'ToeBase'].apply(ENDS[s + 'ToeBase']))[1])
        ys.append(P[s + 'Foot'][1] - 0.055)
    return min(ys)


q0, _ = compose(0.0)
P0, R0 = fk(q0, [0, 0, 0])
HIPS_Y = -sole_y(P0, R0)


def frame_rec(q, root):
    rec = [round(float(x), 4) for x in root]
    for n in NAMES:
        rec += [round(float(x), 4) for x in q[n].as_quat()]
    return rec


frames, qa = [], {'elbow': [], 'knee': [], 'sole': [], 'ear': [], 'wrist_in_head': []}
for i in range(int(DUR * FPS)):
    t = i / FPS
    q, d, corr = compose_ik(t, np.array([0, HIPS_Y, 0]))
    root = np.array([0, HIPS_Y, 0]) + d
    qa.setdefault('corr', []).append(corr)
    frames.append(frame_rec(q, root))
    P, R = fk(q, root)
    for s in ('Left', 'Right'):
        u = P[s + 'ForeArm'] - P[s + 'Arm']; v = P[s + 'Hand'] - P[s + 'ForeArm']
        qa['elbow'].append(math.degrees(math.acos(np.clip(u @ v / np.linalg.norm(u) / np.linalg.norm(v), -1, 1))))
        u = P[s + 'Leg'] - P[s + 'UpLeg']; v = P[s + 'Foot'] - P[s + 'Leg']
        qa['knee'].append(math.degrees(math.acos(np.clip(u @ v / np.linalg.norm(u) / np.linalg.norm(v), -1, 1))))
    qa['sole'].append(sole_y(P, R))
    ear = P['Head'] + R['Head'].apply(EAR_L)
    qa['ear'].append((t, float(np.linalg.norm(P['LeftHand'] - ear)), float(np.linalg.norm(palm_centre(P, R) - ear))))



# ---------------------------------------------------------------- single poses for the model sheet
def still(clip, t, unyaw=True):
    q, _ = clip.local(t); q = dict(q)
    if unyaw: q['Hips'] = Rot.from_euler('y', -yaw_of(q['Hips'])) * q['Hips']
    P, R = fk(q, [0, 0, 0]); y = -sole_y(P, R)
    return frame_rec(q, [0, y, 0])


poses = {
    'stand': still(STAND, 0.5),
    'sit': frames[0],
    'ear': frames[int(6.6 * FPS)],
    'look': frames[int(4.2 * FPS)],
}

meta = {'hipsY': round(float(HIPS_Y), 4), 'scale': SCALE, 'dur': DUR,
        'sources': {'base': '14_30 13.2-16.7s', 'look': '77_04 5.04->5.71s x0.62', 'ear': '80_25 2.45-4.0s (+ear IK <=28deg)', 'stand': '80_25 0.5s'}}
# lowest point of the pelvis/thighs in the base pose = top of the seat
q0, d0 = compose(0.0); P0, R0 = fk(q0, np.array([0, HIPS_Y, 0]) + d0)
thigh_r = 0.068
seat = min(P0['LeftUpLeg'][1], P0['RightUpLeg'][1], (P0['LeftUpLeg'][1] + P0['LeftLeg'][1]) / 2, (P0['RightUpLeg'][1] + P0['RightLeg'][1]) / 2) - thigh_r
meta['seatY'] = round(float(seat), 4)
meta['hips0'] = [round(float(x), 4) for x in P0['Hips']]
meta['knees0'] = [[round(float(x), 4) for x in P0[s]] for s in ('LeftLeg', 'RightLeg')]

json.dump({'fps': FPS, 'names': NAMES, 'parents': [PARENT[n] for n in NAMES],
           'offsets': [[round(float(x), 5) for x in OFF[n]] for n in NAMES],
           'ends': {n: [round(float(x), 5) for x in v] for n, v in ENDS.items()},
           'meta': meta, 'poses': poses, 'test': frames}, open(OUT, 'w'), separators=(',', ':'))

print('wrote', OUT, len(frames), 'frames; scale', round(SCALE, 4), 'hipsY', round(HIPS_Y, 3), 'seatY', meta['seatY'])
print(f"elbow flexion {min(qa['elbow']):.0f}..{max(qa['elbow']):.0f} deg   knee flexion {min(qa['knee']):.0f}..{max(qa['knee']):.0f} deg")
print(f"IK correction at the ear: max {max(qa['corr']):.1f} deg (applied up to 28)")
print(f"sole height {min(qa['sole'])*100:.1f}..{max(qa['sole'])*100:.1f} cm")
for t, dw, di in qa['ear'][::15]:
    print(f"  t={t:4.1f}  wrist->ear {dw*100:5.1f} cm   palm->ear {di*100:5.1f} cm")
