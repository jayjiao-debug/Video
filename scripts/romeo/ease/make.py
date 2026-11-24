#!/usr/bin/env python3
"""The easing's tables and their check, from a motion dump (motion.ts).
   python3 make.py table raw.json <ease.data.ts>     finds the hands and the facings that jump in one frame, writes the tables
   python3 make.py check eased.json                  the jumps that are left (hands, elbows, heads, feet, the body's turn)
A JUMP: a hand moves LIM or more against its own torso (a facing: TURN or more) in one or two frames, with next to no
motion before and after (a keyed move is slower and longer). Jumps of one hand up to GAP frames apart are one move
(cheer > idle > hold in three frames is cheer > hold). A PERSON is all the figures of one character (the Friar with
the vial, the quill, the letter: the World swaps them on a frame, and a hand that is up on one and down on the next
jumps like any other). Not eased: a jump on the frame of a camera cut or a scene join (nobody sees it), the arm swing
of a walk or a run, and a figure a shot lays down or carries (it is solved again after the World's solve; fix those in
the shot)."""
import json, math, re, sys
MODE, SRC = sys.argv[1], sys.argv[2]
D = json.load(open(SRC)); n = len(D)
LIM, QUIET, GAP, TURN = 0.10, 2.5, 8, 0.2
# OVER: a hand whose arc would pass THROUGH something (the desk's writing slope from below, the balcony's rail, the end
# of the bier: the clipping check finds these, scripts/kit/qa/clearance) goes over it instead: up to the level of the
# higher of its two ends plus this many metres, then across (or across first, then down; below zero: across first and
# down at once, for a hand that only has to get AWAY from the thing: Romeo's off the end of the bier, where higher
# would be through his own face). The key is the person, the jump's first frame and the hand; a key that no longer
# meets a row is reported (a shot's timing changed: look again).
OVER = {("juliet", 2193, 1): 0.08, ("friar", 4061, 0): 0.12, ("friar", 4106, 0): 0.12, ("friar", 4106, 1): 0.10}   # (v7: +30 frames, B02 starts 1 s later)
dist = math.dist
cut = {i for i in range(1, n) if D[i]['seg'] != D[i-1]['seg'] or dist(D[i]['cam'], D[i-1]['cam']) > 0.25 or abs(D[i]['fov'] - D[i-1]['fov']) > 4}
names = sorted({nm for fr in D for nm in fr['figs']})
def person(nm):
    """the character a figure is: "friarQuill" is "friar" (the shortest other name it continues with a capital)"""
    best = nm
    for o in names:
        if o != nm and nm.startswith(o) and nm[len(o):len(o) + 1].isupper() and len(o) < len(best): best = o
    return best
people = sorted({person(nm) for nm in names})
PF = [{person(nm): g for nm, g in fr['figs'].items()} for fr in D]           # per frame: person -> its figure that shows
def fig(i, who): return PF[i].get(who) if 0 <= i < n else None
def wrap(x): return (x + math.pi) % (2 * math.pi) - math.pi
def kindof(g): return g.get('kind') or '?'
def step(i, who, get):
    a, b = fig(i - 1, who), fig(i, who)
    return dist(get(a), get(b)) if a and b and D[i]['seg'] == D[i-1]['seg'] else 0.0
def jumps(who, get, lim):
    """runs of one or two frames in which get() moves lim or more, quiet on both sides: [(first, last, metres)]"""
    out, i = [], 1
    while i < n:
        d = step(i, who, get)
        if d < lim: i += 1; continue
        j = i
        while j + 1 < n and step(j + 1, who, get) >= lim: j += 1
        big = max(step(k, who, get) for k in range(i, j + 1))
        if j - i <= 1 and big > QUIET * max(step(i - 1, who, get), step(j + 1, who, get), 0.01): out.append((i, j, big))
        i = j + 1
    return out
hand = lambda k: (lambda g: g['ht'][k])
def swing(who, k, i, j):
    """a free hand of a walker, before and after: the arm swing of a walk or a run (fast at a run), not a jump"""
    a, b = fig(i - 1, who), fig(j, who)
    return bool(a and b and kindof(a) == 'walk' and kindof(b) == 'walk' and not a['wt'][k] and not b['wt'][k])
def carried(who, a, b): return any((fig(x, who) or {}).get('carried') for x in range(a, b + 1))
def turns():
    """a facing jumps TURN or more in one frame, still before and after: [(frame, who, radians the short way)]"""
    out = []
    for who in people:
        for i in range(1, n):
            a, b = fig(i - 1, who), fig(i, who)
            if not a or not b or D[i]['seg'] != D[i-1]['seg']: continue
            d = wrap(b['facing'] - a['facing'])
            if abs(d) < TURN: continue
            aa, bb = fig(i - 2, who), fig(i + 1, who)
            bef = abs(wrap(a['facing'] - aa['facing'])) if aa else 0; aft = abs(wrap(bb['facing'] - b['facing'])) if bb else 0
            if abs(d) > QUIET * max(bef, aft, 0.01): out.append((i, who, d))
    return out
def room(who, lo, hi, seg):
    """every frame lo .. hi has the person on stage in this scene, not carried"""
    return all(0 < x < n and D[x]['seg'] == seg and fig(x, who) and not fig(x, who).get('carried') for x in range(lo, hi + 1))

if MODE == 'table':
    OUT = sys.argv[3]
    ev, oncut = [], 0
    for who in people:
        for k in (0, 1):
            for (i, j, d) in jumps(who, hand(k), LIM):
                if any(x in cut for x in range(i, j + 1)): oncut += 1; continue
                if swing(who, k, i, j): continue
                ev.append(dict(who=who, k=k, i=i, j=j, d=d))
    # one move = the jumps of ONE HAND up to GAP frames apart (by person, Juliet's reach for the vial, keyed by the shot
    # from the frame her left hand jumps, and her right hand's jump seven frames on were one move of fourteen frames:
    # the eased left hand was 30 cm short of the vial on the frame it changed hands)
    chains, skipped = [], []
    for who in people:
        for k in (0, 1):
            cur = None
            for e in sorted([e for e in ev if e['who'] == who and e['k'] == k], key=lambda e: e['i']):
                # ... but not across a place the SHOT holds the hand at for four frames or more (the young friar's
                # hand out for the letter, eight frames: as one move, out and back, it never left his side)
                held = cur and e['i'] - cur['j1'] >= 4 and all((fig(x, who) or {'wt': [0, 0]})['wt'][k] for x in range(cur['j1'], e['i']))
                if cur and e['i'] - cur['j1'] <= GAP and not held: cur['j1'] = max(cur['j1'], e['j']); cur['ev'].append(e)
                else: cur = dict(who=who, j0=e['i'], j1=e['j'], ev=[e]); chains.append(cur)
    rows = []
    for c in sorted(chains, key=lambda c: (c['j0'], c['who'])):
        who, J0, J1 = c['who'], c['j0'], c['j1']
        ga, gb = fig(J0 - 1, who), fig(J1, who)
        if carried(who, J0 - 1, J1): skipped.append((c, 'laid down or carried by the shot')); continue
        hands = sorted({e['k'] for e in c['ev']})
        mv = {k: dist(ga['ht'][k], gb['ht'][k]) for k in hands}
        dom = max(hands, key=lambda k: max(e['d'] for e in c['ev'] if e['k'] == k))
        N = max(4, min(8, round(3.5 + 6 * max(mv.values()))))
        rest = lambda g, k: dist(g['ht'][k], g['shl'][k]) / g['arm'] >= 0.93
        kA, kB = kindof(ga), kindof(gb)
        swapped = any(set(D[x]['figs']) != set(D[x - 1]['figs']) and fig(x, who) and fig(x - 1, who) and
                      next(nm for nm, g in D[x]['figs'].items() if g is fig(x, who)) != next(nm for nm, g in D[x - 1]['figs'].items() if g is fig(x - 1, who)) for x in range(J0, J1 + 1))
        # WHERE THE MOVE GOES. after = it starts on the jump's frame (nothing happens earlier than the shot said: a hand
        # that gives, holds or lets go keeps its place until then); before = it ends there (a gesture let go: the arm
        # is down when the pose changes, so the elbow never changes sides while bent); across = half and half.
        if swapped or (ga['wt'][dom] and not gb['wt'][dom]): where = 'after'
        elif kA != kB and kA in ('cheer', 'wave', 'point') and rest(gb, dom): where = 'before'
        elif kA != kB and rest(ga, dom) and not rest(gb, dom): where = 'after'
        else: where = 'across'
        seg = D[J0]['seg']
        def window(where):
            a, b = (J0, J1 + N - 1) if where == 'after' else (J0 - N, J1 - 1) if where == 'before' else (J0 - N // 2, J1 + (N + 1) // 2 - 1)
            while a < J0 and not room(who, a - 1, J0 - 1, seg): a += 1
            while b >= J1 and not room(who, J1, b + 1, seg): b -= 1
            return a, b
        a, b = window(where)
        for alt in ('after', 'across', 'before'):
            if b - a + 1 >= 3: break
            a2, b2 = window(alt)
            if b2 - a2 > b - a: where, a, b = alt + '*', a2, b2
        near = set()
        for (g, fr) in ((ga, D[J0 - 1]), (gb, D[J1])):
            for k in hands:
                for pn, pp in fr['props'].items():
                    if dist(pp, g['hands'][k]) < 0.15: near.add(pn)
        for k in hands:
            rows.append(dict(who=who, i=k, a=a, b=b, j0=J0, j1=J1, A=ga['ht'][k], B=gb['ht'][k], cm=round(mv[k] * 100), seg=seg, kinds=f"{kA}>{kB}" if kA != kB else kA, where=where + ('/swap' if swapped else ''),
                             wt=f"{ga['wt'][k]}>{gb['wt'][k]}", on=int(bool(ga['hs'][k][2] or gb['hs'][k][2])), near=sorted(near), big=round(max(e['d'] for e in c['ev'] if e['k'] == k) * 100)))
    rows.sort(key=lambda r: (r['who'], r['i'], r['a']))
    for x, y in zip(rows, rows[1:]):                        # one window per person and hand at a time
        if x['who'] == y['who'] and x['i'] == y['i'] and y['a'] <= x['b']:
            m = (x['j1'] + y['j0']) // 2; x['b'] = min(x['b'], m); y['a'] = max(y['a'], m + 1)
    rows.sort(key=lambda r: (r['j0'], r['who'], r['i']))
    L = ["// GENERATED by scripts/romeo/ease/run.sh (make.py) from the film's own motion: do not edit, run it again after any",
         "// change to a shot. HAND_EASE: one row = one hand that jumped between two poses in a single frame, and the frames",
         "// over which it now travels there (shots/ease.ts reads it).",
         "//   who, i   the person (every figure of one character: \"friar\" is also the Friar with the quill) and the hand (0 = the right)",
         "//   a, b     the first and last frame the hand is eased on",
         "//   j0, j1   the frame of the jump (j0 .. j1: several jumps a few frames apart are one move)",
         "//   A, B     the hand before the jump (frame j0 - 1) and after it (frame j1), in the torso's own frame",
         "//   over     (some) the hand goes OVER what its arc would pass through: this many metres above its higher end (make.py's OVER)",
         "export type HandEase = { who: string; i: 0 | 1; a: number; b: number; j0: number; j1: number; A: [number, number, number]; B: [number, number, number]; over?: number };",
         "export const HAND_EASE: HandEase[] = ["]
    for r in rows:
        note = f"{r['seg']} {r['kinds']}, {r['big']} cm in one frame, {r['where']}" + (f", at {'/'.join(r['near'])}" if r['near'] else "") + ("" if r['on'] else ", off screen")
        over = OVER.get((r['who'], r['j0'], r['i']))
        if over is not None: note += f", over ({over * 100:+.0f} cm)"
        L.append(f"  {{ who: {json.dumps(r['who'])}, i: {r['i']}, a: {r['a']}, b: {r['b']}, j0: {r['j0']}, j1: {r['j1']}, A: {json.dumps(r['A'])}, B: {json.dumps(r['B'])}{'' if over is None else f', over: {over}'} }},   // {note}")
    L += ["];",
          "// TURN_EASE: one row = one person whose facing jumped in a single frame (a turn to the lens, a walker snapping to",
          "// its path), and the frames over which it now turns:  j = the frame of the jump, d = the turn (rad, the short way),",
          "// a .. b = the frames it is eased on (half before the jump, half after).",
          "export type TurnEase = { who: string; a: number; b: number; j: number; d: number };",
          "export const TURN_EASE: TurnEase[] = ["]
    for r in rows:
        print(f"f{r['j0']:5d}{'-' + str(r['j1']) if r['j1'] != r['j0'] else '':6s} {r['seg']} {r['who']:11s} hand{r['i']} {r['big']:3d} cm (A>B {r['cm']:3d}) {r['kinds']:14s} wt {r['wt']} {r['where']:12s} eased f{r['a']}-{r['b']} {'ON ' if r['on'] else 'off'} {' '.join(r['near'])}")
    nt = 0
    for (i, who, d) in sorted(turns()):
        g, p = fig(i, who), fig(i - 1, who)
        if i in cut or g.get('carried') or p.get('carried'): print(f"TURN NOT EASED f{i} {who} {math.degrees(d):.0f} deg: {'camera cut' if i in cut else 'carried'}"); continue
        N = max(4, min(10, round(3 + abs(math.degrees(d)) / 22)))
        a, b = i - N // 2, i + (N + 1) // 2 - 1
        while a < i and not room(who, a - 1, i - 1, D[i]['seg']): a += 1
        while b >= i and not room(who, i, b + 1, D[i]['seg']): b -= 1
        nt += 1
        L.append(f"  {{ who: {json.dumps(who)}, a: {a}, b: {b}, j: {i}, d: {d:.4f} }},   // {D[i]['seg']} {kindof(p)}{'>' + kindof(g) if kindof(g) != kindof(p) else ''}, {abs(math.degrees(d)):.0f} degrees in one frame" + ("" if g['on'] or p['on'] else ", off screen"))
        print(f"TURN f{i:5d} {D[i]['seg']} {who:11s} {math.degrees(d):7.1f} deg eased f{a}-{b} {'ON ' if g['on'] or p['on'] else 'off'}")
    L.append("];")
    open(OUT, 'w').write("\n".join(L) + "\n")
    for c, why in skipped: print(f"NOT EASED f{c['j0']} {c['who']}: {why}")
    for key in OVER:
        if not any((r['who'], r['j0'], r['i']) == key for r in rows): print(f"OVER WITHOUT A ROW {key}: the shot's timing changed, look at this hand again")
    print(f"{len(rows)} hands in {len({(r['who'], r['j0']) for r in rows})} moves and {nt} turns eased; {len(skipped)} moves not eased; {oncut} more jumps on a camera cut")
else:
    left = []
    def why(who, i, j): return 'CUT' if any(x in cut for x in range(i, j + 1)) else 'carried' if carried(who, i - 1, j) else ''
    for who in people:
        for k in (0, 1):
            for (i, j, d) in jumps(who, hand(k), LIM):
                if not swing(who, k, i, j): left.append((i, who, f"hand{k}", d, why(who, i, j)))
            for (i, j, d) in jumps(who, (lambda k: (lambda g: g['et'][k]))(k), 0.08):
                if not swing(who, k, i, j): left.append((i, who, f"elbow{k}", d, why(who, i, j)))
            for (i, j, d) in jumps(who, (lambda k: (lambda g: g['feet'][k]))(k), 0.08):
                if kindof(fig(i, who)) != 'walk' or kindof(fig(i - 1, who)) != 'walk': left.append((i, who, f"foot{k}", d, why(who, i, j)))
        for (i, j, d) in jumps(who, lambda g: g['head'], 0.05): left.append((i, who, "head", d, why(who, i, j)))
        for i in range(1, n):                                  # the body's own turn (what the feet and the torso show)
            a, b = fig(i - 1, who), fig(i, who)
            if not a or not b or D[i]['seg'] != D[i-1]['seg']: continue
            d = abs(wrap(b['yaw'] - a['yaw']))
            aa, bb = fig(i - 2, who), fig(i + 1, who)
            if d >= TURN and d > QUIET * max(abs(wrap(a['yaw'] - aa['yaw'])) if aa else 0, abs(wrap(bb['yaw'] - b['yaw'])) if bb else 0, 0.01): left.append((i, who, "turn", d * 0.3, why(who, i, i)))
    left.sort()
    for (i, who, part, d, y) in left:
        g, p = fig(i, who), fig(i - 1, who)
        k = f"{kindof(p)}>{kindof(g)}" if p and kindof(p) != kindof(g) else kindof(g)
        print(f"f{D[i]['f']:5d} {D[i]['seg']} {who:11s} {part:7s} {d*100:4.0f} cm  {k:14s} {'ON ' if g['on'] else 'off'} {y}")
    seen = [x for x in left if not x[4]]
    print(f"{len(left)} jumps left; {len(seen)} of them not on a camera cut and not a carried figure:", ", ".join(f"{sum(1 for x in seen if x[2].rstrip('01') == p)} {p}" for p in sorted({x[2].rstrip('01') for x in seen})) or "none")
