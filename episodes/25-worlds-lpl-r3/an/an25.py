import json, collections as C
G = [g for g in json.load(open('games25.json')) if g['minutes'] > 0]
REG = {'GEN':'LCK','HLE':'LCK','T1':'LCK','DK':'LCK','BLG':'LPL','AL':'LPL','TES':'LPL','IG':'LPL','G2':'LEC','MKOI':'LEC','KC':'LEC','TL':'LCS','LYON':'LCS','TSW':'LCP','CFO':'LCP','LOS':'CBLOL'}
def view(g, team):
    me, op, sign = (g['blue'], g['red'], 1) if g['blue']['team'] == team else (g['red'], g['blue'], -1)
    gd = [sign * x for x in (g['gold_diff_blue'] or [])]
    at = lambda m: gd[m] if len(gd) > m else None
    return dict(game=g['id'], rnd=g['rnd'], team=team, opp=op['team'], win=me['res'] == 'WIN', min=g['minutes'], side='blue' if sign == 1 else 'red',
                gd10=at(10), gd15=at(15), gd20=at(20), maxlead=max(gd) if gd else None, maxdef=min(gd) if gd else None,
                fb=me['first_blood'], ft=me['first_tower'], drag=me['dragons'], odrag=op['dragons'], baron=me['barons'], obaron=op['barons'],
                kills=me['kills'], okills=op['kills'], picks=me['picks'], bans=me['bans'], obans=op['bans'], gd=gd)
res = {}
lpl = [view(g, t) for g in G for t in (g['blue']['team'], g['red']['team']) if REG[t] == 'LPL']
res['lpl_games'] = [{k: v for k, v in x.items() if k != 'gd'} for x in lpl]
for x in lpl: print(x['rnd'], x['team'], 'W' if x['win'] else 'L', 'vs', x['opp'], x['side'], f"{x['min']:.0f}m", 'gd10', x['gd10'], 'gd15', x['gd15'], 'max', x['maxlead'], 'min', x['maxdef'], 'drag', x['drag'], '-', x['odrag'], 'baron', x['baron'], '-', x['obaron'])
# throws: the loser led by >= 1500 gold at some point after 10 min
thr = []
for g in G:
    for t in (g['blue']['team'], g['red']['team']):
        v = view(g, t)
        if not v['win'] and v['gd'] and max(v['gd'][10:] or [0]) >= 1500: thr.append((g['rnd'], t, v['opp'], max(v['gd'][10:])))
res['throws'] = thr; print('throws (loser led >=1.5k after 10 min):', thr)
# side
blue = sum(1 for g in G if g['blue']['res'] == 'WIN'); res['blue_wr'] = [blue, len(G)]; print('blue side wins', blue, '/', len(G))
# gold @15 by region (average of the region's games), win rate when ahead at 15
for r in ['LPL', 'LCK']:
    v = [view(g, t) for g in G for t in (g['blue']['team'], g['red']['team']) if REG[t] == r]
    a = [x['gd15'] for x in v if x['gd15'] is not None]; res[f'gd15_{r}'] = round(sum(a) / len(a))
    print(r, 'games', len(v), 'wins', sum(x['win'] for x in v), 'avg gd15', round(sum(a) / len(a)), 'ahead@15', sum(1 for x in v if (x['gd15'] or 0) > 0), 'first dragon share', round(sum(x['drag'] for x in v) / max(1, sum(x['drag'] + x['odrag'] for x in v)), 2))
ahead = [(view(g, t)['gd15'] > 0, view(g, t)['win']) for g in G for t in (g['blue']['team'],) if view(g, t)['gd15'] not in (None, 0)]
res['ahead15_wins'] = [sum(1 for a, w in ahead if a == w), len(ahead)]; print('team ahead @15 won', res['ahead15_wins'])
# champions: presence = picked or banned
pk = C.Counter(); bn = C.Counter(); wn = C.Counter(); byreg = C.defaultdict(lambda: [0, 0])
for g in G:
    for s in ('blue', 'red'):
        for c in g[s]['picks']:
            pk[c] += 1; wn[c] += g[s]['res'] == 'WIN'; byreg[(REG[g[s]['team']], c)][0] += 1; byreg[(REG[g[s]['team']], c)][1] += g[s]['res'] == 'WIN'
        for c in g[s]['bans']: bn[c] += 1
pres = sorted(set(pk) | set(bn), key=lambda c: -(pk[c] + bn[c]))
res['presence'] = [(c, pk[c], bn[c], round(100 * (pk[c] + bn[c]) / len(G)), round(100 * wn[c] / pk[c]) if pk[c] else None) for c in pres[:15]]
print('games', len(G)); [print(' ', r) for r in res['presence']]
# picks LPL vs LCK on the top-10 presence champions
res['lpl_vs_lck'] = [(c, byreg[('LPL', c)], byreg[('LCK', c)]) for c in pres[:10]]
print('LPL vs LCK [picks, wins] on top champs:'); [print(' ', r) for r in res['lpl_vs_lck']]
# bans aimed at each LPL team (bans made by its opponents)
for t in ['BLG', 'AL', 'TES', 'IG']:
    c = C.Counter(); n = 0
    for g in G:
        for me, op in (('blue', 'red'), ('red', 'blue')):
            if g[me]['team'] == t: c.update(g[op]['bans']); n += 1
    res[f'bans_vs_{t}'] = [n, c.most_common(5)]; print('bans vs', t, n, c.most_common(5))
# picks by LPL team
for t in ['BLG', 'AL', 'TES', 'IG']:
    c = C.Counter()
    for g in G:
        for s in ('blue', 'red'):
            if g[s]['team'] == t: c.update(g[s]['picks'])
    res[f'picks_{t}'] = c.most_common(10)
json.dump(res, open('an25_out.json', 'w'), ensure_ascii=False, indent=1)
