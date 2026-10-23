"""Turn a CMU mocap walk (BVH) into a looping side-view gait for the 2D walker.
FK every frame → project onto the walking plane (forward, up) → remove the forward travel (treadmill) →
cut one clean cycle between two left heel-strikes → resample to N phases → normalise to body height = 1.
Output: JSON {stride (body heights per cycle), joints: {name: [[x,y]*N]}} with y up, feet at y≈0."""
import numpy as np, json, sys, re
def parse(path):
    txt = open(path).read(); hier, motion = txt.split('MOTION')
    joints, stack, order = {}, [], []
    tok = re.findall(r'\S+', hier); i = 0; cur = None
    while i < len(tok):
        t = tok[i]
        if t in ('ROOT', 'JOINT'): name = tok[i + 1]; joints[name] = {'parent': stack[-1] if stack else None, 'ch': [], 'off': None, 'end': None}; cur = name; order.append(name); i += 2; continue
        if t == 'End': cur = ('END', stack[-1]); i += 2; continue
        if t == '{': stack.append(cur if not isinstance(cur, tuple) else cur); i += 1; continue
        if t == '}': stack.pop(); i += 1; continue
        if t == 'OFFSET':
            off = np.array([float(x) for x in tok[i + 1:i + 4]])
            if isinstance(stack[-1], tuple): joints[stack[-1][1]]['end'] = off
            else: joints[stack[-1]]['off'] = off
            i += 4; continue
        if t == 'CHANNELS': n = int(tok[i + 1]); joints[stack[-1]]['ch'] = tok[i + 2:i + 2 + n]; i += 2 + n; continue
        i += 1
    lines = [l for l in motion.strip().split('\n') if l.strip()]
    ft = float(lines[1].split(':')[1]); data = np.array([[float(x) for x in l.split()] for l in lines[2:]])
    return joints, order, ft, data
def rot(axis, deg):
    a = np.radians(deg); c, s = np.cos(a), np.sin(a)
    return {'X': np.array([[1, 0, 0], [0, c, -s], [0, s, c]]), 'Y': np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]]), 'Z': np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]])}[axis]
def fk(joints, order, data):
    F = len(data); pos = {n: np.zeros((F, 3)) for n in order}; R = {n: np.zeros((F, 3, 3)) for n in order}; endp = {}
    col = 0; cols = {}
    for n in order: cols[n] = (col, joints[n]['ch']); col += len(joints[n]['ch'])
    for f in range(F):
        for n in order:
            c0, ch = cols[n]; vals = data[f, c0:c0 + len(ch)]; M = np.eye(3); t = np.zeros(3)
            for k, cname in enumerate(ch):
                if cname.endswith('position'): t['XYZ'.index(cname[0])] = vals[k]
                else: M = M @ rot(cname[0], vals[k])
            p = joints[n]['parent']
            if p is None: R[n][f] = M; pos[n][f] = t + joints[n]['off']
            else: R[n][f] = R[p][f] @ M; pos[n][f] = pos[p][f] + R[p][f] @ joints[n]['off']
            if joints[n]['end'] is not None: endp.setdefault(n, np.zeros((F, 3)))[f] = pos[n][f] + R[n][f] @ joints[n]['end']
    return pos, endp
def gait(path, N=64):
    joints, order, ft, data = parse(path); pos, endp = fk(joints, order, data)
    root = pos['Hips']; d = root[-1] - root[0]; fwd = np.array([d[0], 0, d[2]]); fwd /= np.linalg.norm(fwd)
    up = np.array([0, 1, 0])
    P = {n: np.stack([(pos[n] - root * [1, 0, 1]) @ fwd, pos[n] @ up], -1) for n in order}
    P['HeadTop'] = np.stack([(endp['Head'] - root * [1, 0, 1]) @ fwd, endp['Head'] @ up], -1)
    P['LToeTip'] = np.stack([(endp['LeftToeBase'] - root * [1, 0, 1]) @ fwd, endp['LeftToeBase'] @ up], -1)
    P['RToeTip'] = np.stack([(endp['RightToeBase'] - root * [1, 0, 1]) @ fwd, endp['RightToeBase'] @ up], -1)
    fwd_travel = (root - root[0]) @ fwd
    # left heel strikes: left ankle forward-most and low → local maxima of (ankle x - hip x)
    ax = P['LeftFoot'][:, 0]; strikes = [i for i in range(2, len(ax) - 2) if ax[i] == ax[i - 2:i + 3].max() and ax[i] > np.percentile(ax, 70)]
    mid = len(strikes) // 2; a, b = strikes[mid - 1], strikes[mid]
    floor = min(P['LToeTip'][a:b, 1].min(), P['RToeTip'][a:b, 1].min(), P['LeftFoot'][a:b, 1].min(), P['RightFoot'][a:b, 1].min())
    height = P['HeadTop'][a:b, 1].mean() - floor
    out = {}
    for n, arr in P.items():
        seg = arr[a:b + 1].copy(); seg[:, 1] -= floor; seg /= height
        drift = (seg[-1] - seg[0]); seg -= np.outer(np.linspace(0, 1, len(seg)), drift)    # close the loop
        t = np.linspace(0, len(seg) - 1, N, endpoint=False); out[n] = np.stack([np.interp(t, np.arange(len(seg)), seg[:, k]) for k in (0, 1)], -1).round(4).tolist()
    stride = (fwd_travel[b] - fwd_travel[a]) / height
    return {'src': path.split('/')[-1], 'frames': b - a, 'seconds': round((b - a) * ft, 3), 'stride': round(stride, 4), 'joints': out}
if __name__ == '__main__':
    res = {p.split('/')[-1][:-4]: gait(p) for p in sys.argv[1:]}
    for k, v in res.items(): print(k, 'cycle', v['seconds'], 's, stride', v['stride'], 'body heights/cycle', 'frames', v['frames'])
    json.dump(res, open('/tmp/claude-0/-home-claude/bf206d1e-1152-5595-9b84-b15be6e5a777/scratchpad/mocap/gaits.json', 'w'))
