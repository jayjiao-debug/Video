# ep25: the ep23 model (ratings 'BL') conditioned on ALL real Swiss results through Round 3 (r3b.json),
# with the real Round 4 pairings when r3b.json has them.
# Ratings get the same Bayesian update as sim3: each run's noisy ratings are weighted by the likelihood of every
# game played so far (Bo3s counted game by game).
import random, collections as C, json, sys
import sim
RAT = json.load(open('ratings.json')); R = RAT['BL']
REG = {k: v[1] for k, v in sim.T.items() if k != 'PI'}; REG['KC'] = 'LEC'
TEAMS = list(REG)
R1 = [('GEN','IG'),('HLE','TES'),('MKOI','BLG'),('KC','AL'),('DK','G2'),('CFO','TLAW'),('T1','LOS'),('LYON','TSW')]
R2 = [('TES','AL'),('IG','TSW'),('BLG','TLAW'),('GEN','HLE'),('DK','T1'),('MKOI','CFO'),('G2','LOS'),('LYON','KC')]
R3A = [('GEN','LYON'),('DK','MKOI'),('TES','G2'),('IG','HLE')]            # played 10.25 (winner first)
import os
J = json.load(open('r3b.json'))   # {"results":[["winner","loser",gamesW,gamesL],...], "r4":[["A","B"],...] or []}
R3B = [(w, l) for w, l, *_ in J['results']]
GAMES = R1 + R2 + [('GEN','LYON'),('GEN','LYON'),('LYON','GEN'),('DK','MKOI'),('DK','MKOI'),('TES','G2'),('IG','HLE')]
for w, l, gw, gl in J['results']: GAMES += [(w, l)] * gw + [(l, w)] * gl
R4 = [tuple(p) for p in J.get('r4', [])]
def run(N, seed=1, noise=40, rating=R, update=True):
    rnd = random.Random(seed); out = []
    for _ in range(N):
        r = {t: rating[t] + rnd.gauss(0, noise) for t in TEAMS}
        pg = lambda a, b: 1 / (1 + 10 ** (-(r[a] - r[b]) / 400))
        w8 = 1.0
        if update:
            for a, b in GAMES: w8 *= pg(a, b)
        def ser(a, b, bo):
            p = pg(a, b); w = l = 0; need = bo // 2 + 1
            while w < need and l < need:
                if rnd.random() < p: w += 1
                else: l += 1
            return (a, b) if w == need else (b, a)
        rec = {t: [0, 0] for t in TEAMS}; met = {t: set() for t in TEAMS}; opp = C.defaultdict(list)
        for a, b in R1 + R2 + R3A:
            rec[a][0] += 1; rec[b][1] += 1; met[a].add(b); met[b].add(a)
        r3b = {}
        for w, l in R3B:
            r3b[(w, l)] = w; rec[w][0] += 1; rec[l][1] += 1; met[w].add(l); met[l].add(w)
        rnd_no = 4; r4w = {}
        while True:
            alive = [t for t in TEAMS if rec[t][0] < 3 and rec[t][1] < 3]
            if not alive: break
            groups = C.defaultdict(list); pairs = []
            for t in alive: groups[tuple(rec[t])].append(t)
            if rnd_no == 4 and R4: pairs = list(R4)
            else:
                for g in groups.values():
                    for _ in range(2000):
                        rnd.shuffle(g); pp = list(zip(g[0::2], g[1::2]))
                        if all(b not in met[a] for a, b in pp): break
                    pairs += pp
            for a, b in pairs:
                opp[a].append((rnd_no, b)); opp[b].append((rnd_no, a))
                w, l = ser(a, b, 3); rec[w][0] += 1; rec[l][1] += 1; met[a].add(b); met[b].add(a)
                if rnd_no == 4: r4w[(a, b)] = w
            rnd_no += 1
        q = [t for t in TEAMS if rec[t][0] == 3]
        s30 = [t for t in q if rec[t][1] == 0]; s32 = [t for t in q if rec[t][1] == 2]; s31 = [t for t in q if rec[t][1] == 1]
        rnd.shuffle(s32); qf = list(zip(s30, s32[:len(s30)])); rest = s31 + s32[len(s30):]; rnd.shuffle(rest)
        qf += list(zip(rest[0::2], rest[1::2])); rnd.shuffle(qf)
        qr = [ser(a, b, 5) for a, b in qf]; sr = [ser(qr[0][0], qr[1][0], 5), ser(qr[2][0], qr[3][0], 5)]; fr = ser(sr[0][0], sr[1][0], 5)
        qfo = {}
        for a, b in qf: qfo[a] = b; qfo[b] = a
        sfo = {}
        for (a, _), (b, _) in [(qr[0], qr[1]), (qr[2], qr[3])]: sfo[a] = b; sfo[b] = a
        out.append(dict(w=w8, r3b=r3b, r4w=r4w, rec={t: tuple(v) for t, v in rec.items()}, q=q, sf=[x[0] for x in qr], f=[x[0] for x in sr],
                        champ=fr[0], opp=dict(opp), qfo=qfo, sfo=sfo, fo=(fr[0], fr[1])))
    return out
def summarize(o):
    W = sum(x['w'] for x in o); S = C.defaultdict(lambda: [0, 0, 0, 0]); reg = C.Counter()
    for x in o:
        for t in x['q']: S[t][0] += x['w']
        for t in x['sf']: S[t][1] += x['w']
        for t in x['f']: S[t][2] += x['w']
        S[x['champ']][3] += x['w']; reg[REG[x['champ']]] += x['w']
    return dict(region={k: round(100 * v / W, 1) for k, v in reg.items()},
                teams={t: {k: round(100 * v / W, 1) for k, v in zip(['QF', 'SF', 'F', 'W'], S[t])} for t in TEAMS},
                ess=round(W * W / sum(x['w'] ** 2 for x in o)))
if __name__ == '__main__':
    N = int(sys.argv[1]) if len(sys.argv) > 1 else 200000
    o = run(N, 7); res = {'now': summarize(o), 'lock_only': summarize(run(N, 7, update=False))}
    W = sum(x['w'] for x in o); LPL = lambda x: REG[x['champ']] == 'LPL'
    LPLT = [t for t in TEAMS if REG[t] == 'LPL']
    # each LPL team's Round-4 opponent (first R4 entry in its opp list) and the civil-war chance
    r4o = {t: C.Counter() for t in LPLT}; civil = 0; civ5 = 0
    for x in o:
        cw = False; c5 = False
        for t in LPLT:
            for rn, op in x['opp'].get(t, []):
                if rn == 4: r4o[t][op] += x['w']; cw |= REG[op] == 'LPL'
                if rn == 5 and REG[op] == 'LPL': c5 = True
        civil += x['w'] * cw; civ5 += x['w'] * c5
    res['r4_opp'] = {t: [(op, round(100 * v / W, 1)) for op, v in r4o[t].most_common(6)] for t in LPLT}
    res['civil_r4'] = round(100 * civil / W, 1); res['civil_r5'] = round(100 * civ5 / W, 1)
    res['lpl_teams'] = {t: res['now']['teams'][t] for t in LPLT}
    res['blg_share'] = round(100 * res['now']['teams']['BLG']['W'] / res['now']['region']['LPL'])
    # QF opponents for each LPL team (conditional on reaching the QF)
    res['qf_opp'] = {}
    for t in LPLT:
        c = C.Counter(); w = 0
        for x in o:
            if t in x['qfo']: c[x['qfo'][t]] += x['w']; w += x['w']
        res['qf_opp'][t] = [(op, round(100 * v / w, 1)) for op, v in c.most_common(6)] if w else []
    # best / worst Round-4 outcome sets for LPL (by the LPL teams' own R4 results)
    sc = C.defaultdict(lambda: [0, 0])
    for x in o:
        k = tuple(sorted((t, any(w == t for w in x['r4w'].values())) for t in LPLT if any(t in p for p in x['r4w'])))
        sc[k][0] += x['w']; sc[k][1] += x['w'] * LPL(x)
    res['r4_combos'] = sorted([dict(k=[list(a) for a in k], p=round(100 * v[0] / W, 1), lpl=round(100 * v[1] / v[0], 1)) for k, v in sc.items() if v[0] / W > .005], key=lambda d: -d['lpl'])
    # BLG's likely opponents, given BLG beats / loses to KC
    pg0 = lambda a, b: 1 / (1 + 10 ** (-(R[a] - R[b]) / 400))
    b3 = lambda p: p * p * (3 - 2 * p); b5 = lambda p: p ** 3 * (1 + 3 * (1 - p) + 6 * (1 - p) ** 2)
    for res_ in ['win']:
        m = o; w = sum(x['w'] for x in m)
        d = {}
        for rn in [4, 5]:
            c = C.Counter()
            for x in m:
                for r_, t in x['opp'].get('BLG', []):
                    if r_ == rn: c[t] += x['w']
            d[f'R{rn}'] = [(t, round(100 * v / w, 1), round(100 * b3(pg0('BLG', t)))) for t, v in c.most_common(5)]
        c = C.Counter(); [c.update({x['qfo']['BLG']: x['w']}) for x in m if 'BLG' in x['qfo']]
        d['QF'] = [(t, round(100 * v / w, 1), round(100 * b5(pg0('BLG', t)))) for t, v in c.most_common(5)]
        c = C.Counter(); [c.update({x['sfo']['BLG']: x['w']}) for x in m if 'BLG' in x['sfo']]
        d['SF'] = [(t, round(100 * v / w, 1), round(100 * b5(pg0('BLG', t)))) for t, v in c.most_common(5)]
        res[f'blg_path_{res_}'] = d
    res['r4_winp'] = {f'{a}-{b}': round(100 * b3(pg0(a, b))) for a, b in R4}
    json.dump(res, open('sim5_out.json', 'w'), indent=1, ensure_ascii=False)
    print(json.dumps({k: res[k] for k in ['blg_share', 'civil_r4', 'civil_r5', 'r4_opp', 'lpl_teams']}, ensure_ascii=False))
    print('now', res['now']['region'], 'lock_only', res['lock_only']['region'], 'ess', res['now']['ess'])
    for t in ['BLG', 'TES', 'IG', 'AL', 'GEN', 'DK', 'HLE', 'T1', 'G2', 'LYON', 'MKOI', 'KC']: print(t, res['now']['teams'][t])
    for c in res['r4_combos'][:3] + res['r4_combos'][-3:]: print(c)
    print('qf', res['qf_opp'])
