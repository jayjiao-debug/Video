# Backtest of the ep23/ep24 model on Worlds 2023, 2024, 2025.
# For each year: fit ratings on that season's games played BEFORE the Worlds main event only,
# then (a) predict every main-event series, (b) simulate the whole tournament from the real Round-1 draw,
# (c) re-simulate after locking in the real Round 1-2 results (the situation of this video).
import pandas as pd, numpy as np, io, glob, os, re, json, random, collections as C, sys, math
from scipy.optimize import minimize
D = sys.argv[1]  # folder with S13__*.html etc.
HALF, IB, LAM, ALPHA = [float(x) for x in (sys.argv[2:6] if len(sys.argv) > 5 else [84, 1.5, .05, 1])]
TAG = sys.argv[6] if len(sys.argv) > 6 else 'v1'
YEAR = {'S13': 2023, 'S14': 2024, 'S15': 2025}
MAIN = {2023: 'Worlds Main Event 2023', 2024: 'Worlds Main Event 2024', 2025: 'Worlds 2025 Main Event'}
INTL = re.compile(r'MSI|Mid-Season|First Stand|Esports World Cup|Worlds')
LEAGUE = re.compile(r'^(LPL|LCK|LEC|LCS|LTA North|LTA South|LTA|PCS|VCS|LCP|CBLOL|LJL|LLA)')
norm = lambda s: re.sub(r'esports$|e sports$', '', re.sub(r'[^a-z0-9 ]', '', str(s).lower())).replace(' ', '')

def load():
    rows = []
    for f in glob.glob(os.path.join(D, 'S1*__*.html')):
        s = os.path.basename(f).split('__')[0]
        try: t = max(pd.read_html(io.StringIO(open(f, encoding='utf8', errors='ignore').read())), key=lambda t: t.size)
        except ValueError: continue
        if t.shape[1] < 7 or len(t) == 0: continue
        t.columns = ['game', 't1', 'score', 't2', 'round', 'patch', 'date'][:t.shape[1]]
        name = None
        m = re.search(r'<title>([^<]+)</title>', open(f, encoding='utf8', errors='ignore').read())
        t['tour'] = os.path.basename(f).split('__')[1][:-5].replace('_', ' ')
        t['year'] = YEAR[s]; rows.append(t)
    A = pd.concat(rows)
    A = A[A.score.astype(str).str.match(r'^\d+\s*-\s*\d+$')].copy()
    A[['a', 'b']] = A.score.str.split('-', expand=True).astype(int)
    A['date'] = pd.to_datetime(A.date); A['n1'] = A.t1.map(norm); A['n2'] = A.t2.map(norm)
    return A

def fit(S, ref, half=84, ib=1.5, lam=0.05):
    teams = sorted(set(S.n1) | set(S.n2)); ix = {t: i for i, t in enumerate(teams)}
    # expand series into games: a wins for t1, b wins for t2
    a = np.r_[np.repeat(S.n1.map(ix).values, S.a.values), np.repeat(S.n2.map(ix).values, S.b.values)]
    b = np.r_[np.repeat(S.n2.map(ix).values, S.a.values), np.repeat(S.n1.map(ix).values, S.b.values)]
    age = np.r_[np.repeat((ref - S.date).dt.days.values, S.a.values), np.repeat((ref - S.date).dt.days.values, S.b.values)]
    intl = np.r_[np.repeat(S.tour.str.contains(INTL).values, S.a.values), np.repeat(S.tour.str.contains(INTL).values, S.b.values)]
    w = 0.5 ** (age / half) * np.where(intl, ib, 1.0)
    def f(r):
        d = r[a] - r[b]; p = 1 / (1 + np.exp(-d))
        ll = np.sum(w * np.log(p + 1e-12)) - lam * np.sum(r * r)
        gr = np.zeros_like(r); e = w * (1 - p); np.add.at(gr, a, e); np.add.at(gr, b, -e); gr -= 2 * lam * r
        return -ll, -gr
    r = minimize(f, np.zeros(len(teams)), jac=True, method='L-BFGS-B').x
    return {t: r[ix[t]] * 400 / np.log(10) for t in teams}

pg = lambda d: 1 / (1 + 10 ** (-d / 400))
def pser(p, bo):
    if bo == 1: return p
    if bo == 3: return p * p * (3 - 2 * p)
    q = 1 - p; return p ** 3 * (1 + 3 * q + 6 * q * q)

def simulate(R, teams, r1, fixed_rounds, N, seed, noise=40):
    """Swiss from the real R1 draw. fixed_rounds: list of rounds, each a list of (winner, loser) to lock in.
    Returns weighted outcome counts (likelihood re-weighting by the locked-in results, as in sim3)."""
    rnd = random.Random(seed); out = C.defaultdict(lambda: np.zeros(4)); W = 0; WW = 0; ess = 0
    locked = [g for rd in fixed_rounds for g in rd]
    for _ in range(N):
        r = {t: R[t] + rnd.gauss(0, noise) for t in teams}
        w8 = 1.0
        for wn, ls, bo in locked: w8 *= pser(pg(r[wn] - r[ls]), bo)
        def ser(x, y, bo):
            p = pser(pg(r[x] - r[y]), bo); return (x, y) if rnd.random() < p else (y, x)
        rec = {t: [0, 0] for t in teams}; met = {t: set() for t in teams}
        pairs = r1; k = 0
        while True:
            if k < len(fixed_rounds):
                res = [(wn, ls) for wn, ls, bo in fixed_rounds[k]]
            else:
                res = [ser(x, y, 3 if (rec[x][0] == 2 or rec[x][1] == 2) else 1) for x, y in pairs]
            for wn, ls in res: rec[wn][0] += 1; rec[ls][1] += 1; met[wn].add(ls); met[ls].add(wn)
            k += 1
            alive = [t for t in teams if rec[t][0] < 3 and rec[t][1] < 3]
            if not alive: break
            groups = C.defaultdict(list); pairs = []
            for t in alive: groups[tuple(rec[t])].append(t)
            for g in groups.values():
                for _ in range(2000):
                    rnd.shuffle(g); pp = list(zip(g[0::2], g[1::2]))
                    if all(y not in met[x] for x, y in pp): break
                pairs += pp
        q = [t for t in teams if rec[t][0] == 3]
        s30 = [t for t in q if rec[t][1] == 0]; s32 = [t for t in q if rec[t][1] == 2]; s31 = [t for t in q if rec[t][1] == 1]
        rnd.shuffle(s32); qf = list(zip(s30, s32[:len(s30)])); rest = s31 + s32[len(s30):]; rnd.shuffle(rest)
        qf += list(zip(rest[0::2], rest[1::2])); rnd.shuffle(qf)
        qr = [ser(x, y, 5)[0] for x, y in qf]; sr = [ser(qr[0], qr[1], 5)[0], ser(qr[2], qr[3], 5)[0]]; ch = ser(sr[0], sr[1], 5)[0]
        for t in q: out[t][0] += w8
        for t in qr: out[t][1] += w8
        for t in sr: out[t][2] += w8
        out[ch][3] += w8; W += w8; WW += w8 * w8
    return {t: v / W for t, v in out.items()}, W * W / WW

def main():
    A = load(); report = {}
    allser = []
    for y in [2023, 2024, 2025]:
        S = A[A.year == y]; M = S[S.tour == MAIN[y]].copy(); start = M.date.min()
        T = S[(S.date < start) & (S.tour != MAIN[y])]
        R0 = fit(T, start, HALF, IB, LAM)
        teams = sorted(set(M.n1) | set(M.n2))
        missing = [t for t in teams if t not in R0]
        # region of each team = league it played most series in
        lg = C.Counter()
        for _, r in T.iterrows():
            m = LEAGUE.match(r.tour)
            if m: lg[(r.n1, m.group(1).replace('LTA North', 'LTA').replace('LTA South', 'LTA'))] += 1; lg[(r.n2, m.group(1).replace('LTA North', 'LTA').replace('LTA South', 'LTA'))] += 1
        REG = {t: max([(c, l) for (tt, l), c in lg.items() if tt == t] or [(0, '?')])[1] for t in teams}
        if 'LTA' in REG.values(): pass
        regmean = {g: np.mean([R0[t] for t in teams if REG[t] == g]) for g in set(REG.values())}
        R = {t: ALPHA * R0[t] + (1 - ALPHA) * regmean[REG[t]] for t in teams}
        # (a) every main-event series, pre-tournament ratings
        M['bo'] = M[['a', 'b']].max(axis=1).map({1: 1, 2: 3, 3: 5})
        M['w'] = np.where(M.a > M.b, M.n1, M.n2); M['l'] = np.where(M.a > M.b, M.n2, M.n1)
        M['p'] = [pser(pg(R[w] - R[l]), bo) for w, l, bo in zip(M.w, M.l, M.bo)]
        M['preg'] = [pser(pg(regmean[REG[w]] - regmean[REG[l]]), bo) for w, l, bo in zip(M.w, M.l, M.bo)]
        M['year_'] = y; allser.append(M)
        # (b) tournament from the real R1 draw
        R1 = M[M['round'] == 'ROUND1']; r1 = list(zip(R1.n1, R1.n2))
        rounds = [[(w, l, bo) for w, l, bo in zip(M[M['round'] == rn].w, M[M['round'] == rn].l, M[M['round'] == rn].bo)] for rn in ['ROUND1', 'ROUND2']]
        pre, _ = simulate(R, teams, r1, [], 40000, 1)
        post, ess = simulate(R, teams, r1, rounds, 40000, 2)
        ko = M[M['round'].isin(['QUARTERFINALS'])]; qf = set(ko.n1) | set(ko.n2)
        champ = M[M['round'] == 'FINALS'].w.iloc[0]
        def score(P):
            br = np.mean([(P.get(t, np.zeros(4))[0] - (t in qf)) ** 2 for t in teams])
            rank = sorted(teams, key=lambda t: -P.get(t, np.zeros(4))[3]).index(champ) + 1
            reg = C.Counter(); [reg.update({REG[t]: P.get(t, np.zeros(4))[3]}) for t in teams]
            top = sorted(teams, key=lambda t: -P.get(t, np.zeros(4))[3])[:3]
            return dict(champ=champ, p_champ=round(100 * P.get(champ, np.zeros(4))[3], 1), champ_rank=rank,
                        qf_brier=round(br, 3), qf_brier_coin=0.25, qf_hits=int(sum(1 for t in sorted(teams, key=lambda t: -P.get(t, np.zeros(4))[0])[:8] if t in qf)),
                        top3=[(t, round(100 * P.get(t, np.zeros(4))[3], 1)) for t in top], region={k: round(100 * v, 1) for k, v in reg.items()})
        report[y] = dict(n_train=int(len(T)), missing=missing, pre=score(pre), after_r2=score(post), ess=round(ess),
                         reg=REG, lpl_after_r2={t: [round(100 * x, 1) for x in post.get(t, np.zeros(4))] for t in teams if REG[t] == 'LPL'})
    S = pd.concat(allser)
    def metr(p): p = np.clip(p, 1e-6, 1 - 1e-6); return dict(acc=round(float(np.mean(p > .5)), 3), logloss=round(float(np.mean(-np.log(p))), 3), brier=round(float(np.mean((1 - p) ** 2)), 3))
    report['series'] = dict(n=int(len(S)), model=metr(S.p.values), region_only=metr(S.preg.values), coin=metr(np.full(len(S), .5)),
                            by_year={int(y): dict(n=int(len(g)), model=metr(g.p.values), region_only=metr(g.preg.values)) for y, g in S.groupby('year_')})
    # calibration: favourite's predicted prob vs how often the favourite won
    fav = np.where(S.p >= .5, S.p, 1 - S.p); won = (S.p >= .5)
    bins = [.5, .6, .7, .8, .9, 1.01]; cal = []
    for lo, hi in zip(bins[:-1], bins[1:]):
        m = (fav >= lo) & (fav < hi)
        if m.sum(): cal.append(dict(bin=f'{int(lo*100)}-{int(min(hi,1)*100)}%', n=int(m.sum()), predicted=round(float(fav[m].mean()) * 100, 1), actual=round(float(won[m].mean()) * 100, 1)))
    report['calibration'] = cal
    json.dump(report, open(f'backtest_out_{TAG}.json', 'w'), ensure_ascii=False, indent=1, default=str)
    print(json.dumps({k: v for k, v in report.items() if k in ('series', 'calibration')}, indent=1))
    for y in [2023, 2024, 2025]:
        r = report[y]; print(y, 'train series', r['n_train'], 'missing', r['missing'], 'ESS', r['ess'])
        print('  pre   ', r['pre']); print('  afterR2', r['after_r2']); print('  LPL after R2 [QF,SF,F,W]', r['lpl_after_r2'])
main()
