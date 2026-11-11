"""Motion capture -> side-view segment angles for the ink-puppet rig (shz02).
CMU Graphics Lab Motion Capture Database (mocap.cs.cmu.edu; BVH conversion by B. Hahne; free for research and commercial
use; "The data used in this project was obtained from mocap.cs.cmu.edu. The database was created with funding from NSF
EIA-0196217.").

Unlike shz01's bvh2d.py this projects every frame onto the body's *own* sagittal plane at that moment (facing from the
hip axis, smoothed), so clips that turn still give clean side views, and it writes absolute segment angles:
  angle of each segment from straight down, + = toward the facing direction (degrees), for
  thighR/L, shinR/L, footR/L (ankle->toe, from horizontal forward, + = toes down), upperR/L, foreR/L,
  spine (hips->chest from straight up, + = leaning forward), neck (chest->head from up),
  hipY (pelvis height / leg length), dx (forward travel per output frame / leg length).
usage: mocap2d.py <clip.bvh> <out.json> [start] [end] [fps_out=30]
"""
import sys, json, math
import numpy as np
src = open('/home/claude/video/episodes/shz01-linchong/film/mocap/bvh2d.py').read()
ns = {}
exec(src[:src.index('\ndef main')], ns)
parse, fk = ns['parse'], ns['fk']

def main():
    path, out = sys.argv[1:3]
    start = int(sys.argv[3]) if len(sys.argv) > 3 else 0
    end = int(sys.argv[4]) if len(sys.argv) > 4 else None
    fps_out = float(sys.argv[5]) if len(sys.argv) > 5 else 30.0
    joints, data, ft = parse(path)
    names = [j['name'] for j in joints]
    end = len(data) if end is None else min(end, len(data))
    P = []
    for f in range(start, end):
        pos = fk(joints, data[f])
        P.append({k2: np.array(v) for k2, v in pos.items()})
    n = len(P)
    # facing: hip axis (left -> right) x up, smoothed over ~0.35 s
    fw = np.zeros((n, 3))
    for i, p in enumerate(P):
        ax = p['RightUpLeg'] - p['LeftUpLeg']; ax[1] = 0
        f = np.cross(np.array([0, 1.0, 0]), ax); f /= np.linalg.norm(f) + 1e-9
        fw[i] = f
    # sign: make facing agree with the direction of travel where the body is moving
    hip = np.array([p['Hips'] for p in P]); vel = np.gradient(hip, axis=0); vel[:, 1] = 0
    sgn = np.sign(np.sum(np.sum(vel * fw, axis=1)))
    fw *= sgn if sgn != 0 else 1
    k = max(1, int(0.35 / ft)); ker = np.hanning(2 * k + 1); ker /= ker.sum()
    for a in (0, 2): fw[:, a] = np.convolve(np.pad(fw[:, a], k, mode='edge'), ker, mode='valid')
    fw /= np.linalg.norm(fw, axis=1, keepdims=True) + 1e-9
    def to2(i, v): return np.array([v @ fw[i], v[1]])
    def down(a, b): d = b - a; return math.degrees(math.atan2(d[0], -d[1]))      # from straight down, + forward
    def up(a, b): d = b - a; return math.degrees(math.atan2(d[0], d[1]))         # from straight up, + forward
    leg = np.linalg.norm(P[0]['RightUpLeg'] - P[0]['RightLeg']) + np.linalg.norm(P[0]['RightLeg'] - P[0]['RightFoot'])
    rows = []
    for i, p in enumerate(P):
        q = {k2: to2(i, v) for k2, v in p.items()}
        chest = (q['LeftArm'] + q['RightArm']) / 2
        hips = (q['LeftUpLeg'] + q['RightUpLeg']) / 2
        r = {'spine': up(hips, chest), 'neck': up(chest, q['Head']), 'hipY': float(hips[1] / leg)}
        for s, S in (('R', 'Right'), ('L', 'Left')):
            r['thigh' + s] = down(q[S + 'UpLeg'], q[S + 'Leg']); r['shin' + s] = down(q[S + 'Leg'], q[S + 'Foot'])
            d = q[S + 'ToeBase'] - q[S + 'Foot']; r['foot' + s] = math.degrees(math.atan2(-d[1], d[0]))
            r['upper' + s] = down(q[S + 'Arm'], q[S + 'ForeArm']); r['fore' + s] = down(q[S + 'ForeArm'], q[S + 'Hand'])
            r['toeY' + s] = float(q[S + 'ToeBase'][1] / leg); r['ankY' + s] = float(q[S + 'Foot'][1] / leg)
        r['_fwd'] = float(vel[i] @ fw[i] / leg)
        rows.append(r)
    # unwrap angles, resample to fps_out
    keys = [k2 for k2 in rows[0] if k2 != '_fwd']
    A = {k2: np.array([r[k2] for r in rows]) for k2 in keys}
    for k2 in keys:
        if k2 not in ('hipY', 'toeYR', 'toeYL', 'ankYR', 'ankYL'): A[k2] = np.degrees(np.unwrap(np.radians(A[k2])))
    step = (1 / fps_out) / ft
    idx = np.arange(0, n - 1, step)
    def samp(a): return np.interp(idx, np.arange(n), a)
    fwdv = np.array([r['_fwd'] for r in rows])
    cum = np.concatenate([[0], np.cumsum(fwdv)])[:n]
    X = samp(cum)
    frames = []
    for j in range(len(idx)):
        fr = {k2: round(float(samp(A[k2])[j]), 3 if 'Y' in k2 else 1) for k2 in keys}
        fr['x'] = round(float(X[j]), 4)
        frames.append(fr)
    json.dump({'clip': path.split('/')[-1], 'start': start, 'end': end, 'fps': fps_out, 'frames': frames}, open(out, 'w'), separators=(',', ':'))
    print(path.split('/')[-1], n, 'capture frames ->', len(frames), 'at', fps_out, 'fps; travel', round(float(X[-1]), 2), 'leg lengths')
main()
