# ep25: every possible Round-4 draw of the 2-1 pool, each run with the ep23 model ('BL') conditioned on R1-R3.
import sim5, itertools, json, sys, collections as C
from multiprocessing import Pool
POOL = ['BLG', 'TES', 'IG', 'T1', 'LYON', 'MKOI']
MET = {('BLG', 'MKOI')}
def matchings(xs):
    if not xs: yield []; return
    a = xs[0]
    for i in range(1, len(xs)):
        b = xs[i]; rest = xs[1:i] + xs[i + 1:]
        for m in matchings(rest): yield [(a, b)] + m
M = [m for m in matchings(POOL) if not any((a, b) in MET or (b, a) in MET for a, b in m)]
LPL = ['BLG', 'TES', 'IG']
def one(args):
    k, seed = args; sim5.R4 = M[k]; o = sim5.run(int(sys.argv[1]), seed)
    W = sum(x['w'] for x in o); f = lambda c: 100 * sum(x['w'] for x in o if c(x)) / W
    reg = lambda t: sim5.REG[t]
    return dict(k=k, pairs=M[k], lpl=f(lambda x: reg(x['champ']) == 'LPL'),
                qf={t: f(lambda x, t=t: t in x['q']) for t in LPL}, w={t: f(lambda x, t=t: x['champ'] == t) for t in LPL},
                n3=f(lambda x: all(t in x['q'] for t in LPL)), n0=f(lambda x: not any(t in x['q'] for t in LPL)),
                nqf=sum(f(lambda x, t=t: t in x['q']) for t in LPL) / 100,
                r4={t: f(lambda x, t=t: x['rec'][t] in [(3, 1)] ) for t in LPL},
                ess=W * W / sum(x['w'] ** 2 for x in o))
if __name__ == '__main__':
    with Pool(2) as p: R = p.map(one, [(k, 100 + k) for k in range(len(M))])
    json.dump(R, open('draw25_out.json', 'w'), ensure_ascii=False, indent=1)
    for r in sorted(R, key=lambda r: -r['lpl']):
        print(round(r['lpl'], 1), ' '.join(f'{a}-{b}' for a, b in r['pairs']), 'QF', {t: round(v) for t, v in r['qf'].items()}, 'nQF', round(r['nqf'], 2), 'all3', round(r['n3']), 'none', round(r['n0'], 1), 'ess', int(r['ess']))
