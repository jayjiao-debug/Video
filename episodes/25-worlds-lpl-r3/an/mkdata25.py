# games25.json + an25_out.json + sim (sim5_out.json if present, else sim4_out.json) -> ../film/data.json
import json, os, sys, collections as C
G = [g for g in json.load(open('games25.json')) if g['minutes'] > 0]
A = json.load(open('an25_out.json'))
simf = '../../ep23/an/sim5_out.json' if os.path.exists('../../ep23/an/sim5_out.json') else '../../ep23/an/sim4_out.json'
S = json.load(open(simf))
zh = {v['id']: v['title'] for v in json.load(open('../film/champion_zh_CN.json'))['data'].values()}
ids = json.load(open('champ_ids.json')); fix = {'LeBlanc': 'Leblanc', 'RenataGlasc': 'Renata', 'Wukong': 'MonkeyKing'}
cn = {n: zh.get(fix.get(i, i), n) for n, i in ids.items()}
REG = {'GEN':'LCK','HLE':'LCK','T1':'LCK','DK':'LCK','BLG':'LPL','AL':'LPL','TES':'LPL','IG':'LPL','G2':'LEC','MKOI':'LEC','KC':'LEC','TL':'LCS','TLAW':'LCS','LYON':'LCS','TSW':'LCP','CFO':'LCP','LOS':'CBLOL'}
gid = {g['id']: g for g in G}
def slim(g): return {k: g[k] for k in ('id', 'rnd', 'minutes', 'blue', 'red', 'gold_diff_blue')}
lplg = A['lpl_games']
r1 = [x for x in lplg if x['rnd'] == 'ROUND1']; later = [x for x in lplg if x['rnd'] != 'ROUND1']
tally = lambda L: dict(drag=sum(x['drag'] for x in L), odrag=sum(x['odrag'] for x in L), baron=sum(x['baron'] for x in L), obaron=sum(x['obaron'] for x in L), w=sum(x['win'] for x in L), n=len(L))
# later games: count each LPL-vs-LPL game once (from the winner's side)
seen = set(); later1 = []
for x in later:
    if x['game'] in seen: continue
    seen.add(x['game']); later1.append(x if x['win'] or REG[x['opp']] != 'LPL' else next(y for y in later if y['game'] == x['game'] and y['win']))
D = dict(
    sim=os.path.basename(simf), region=REG, cn=cn, ids={n: fix.get(i, i) for n, i in ids.items()},
    lpl=S['now']['region']['LPL'], lock=S['lock_only']['region']['LPL'], reg=S['now']['region'], teams=S['now']['teams'],
    chain=[['赛前', 21.1], ['首轮后', 14.8], ['第二轮后', 16.5], ['第三轮上半', 20.0]],
    blg_share=S.get('blg_share'),
    r1_games=[slim(gid[i]) for i in [83638, 83640, 83642, 83645]], r1_view=r1, r1_tally=tally(r1),
    later=later1, later_tally=tally(later1),
    presence=A['presence'], lpl_vs_lck=A['lpl_vs_lck'], bans_vs=[{t: A[f'bans_vs_{t}']} for t in ['BLG', 'AL', 'TES', 'IG']],
    picks_lpl={t: A[f'picks_{t}'] for t in ['BLG', 'AL', 'TES', 'IG']},
    ahead15=A['ahead15_wins'], blue=A['blue_wr'], throws=A['throws'], n_games=len(G),
    paths={k: S[k] for k in S if k.startswith('blg_path')}, combos=S.get('combos', [])[:4] + S.get('combos', [])[-4:],
    ai=json.load(open('ai25.json')) if os.path.exists('ai25.json') else None,
    r4_opp=S.get('r4_opp'), qf_opp=S.get('qf_opp'), civil_r4=S.get('civil_r4'), civil_r5=S.get('civil_r5'), lpl_teams=S.get('lpl_teams'),
    r4_winp=S.get('r4_winp'), r4_combos=S.get('r4_combos', [])[:3] + S.get('r4_combos', [])[-3:])
if 'sim5' in simf: D['chain'] = D['chain'] + [['第三轮后', D['lpl']]]
else: D['chain'][-1][1] = D['lpl']
json.dump(D, open('../film/data.json', 'w'), ensure_ascii=False)
print('data.json from', simf, 'LPL', D['lpl'], 'r1 tally', D['r1_tally'], 'later', D['later_tally'])
