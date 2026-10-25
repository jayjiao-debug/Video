"""Recalibrate the topic rubric against what actually happened.
   python3 topics/score.py            -> per-dimension Spearman vs plays / 5s / share, and score buckets
   ledger.csv: one row per published episode (metrics from 创作者中心 at ~48 h or later) + the six rubric marks
   given BEFORE production (labeled=pre) or after the fact (labeled=retro, biased: the labeler knew the result)."""
import pandas as pd, sys
from scipy.stats import spearmanr
df = pd.read_csv(sys.argv[1] if len(sys.argv) > 1 else 'topics/ledger.csv')
dims = ['A_self', 'B_twist', 'C_search', 'D_conflict', 'E_barrier', 'F_forward']
df['score'] = df[dims].sum(axis=1)
print(f'{len(df)} episodes ({(df.labeled=="pre").sum()} scored before production)\n')
print(f'{"":12}{"plays":>8}{"5s":>8}{"share":>8}')
for c in dims + ['score']:
    print(f'{c:12}' + ''.join(f'{spearmanr(df[c], df[m])[0]:>8.2f}' for m in ['plays', 's5', 'share']))
print('\nscore bucket -> plays (median)')
print(df.groupby(pd.cut(df['score'], [-9, 3, 5, 6, 12]), observed=True)['plays'].agg(['count', 'median']).to_string())
print('\n5s bucket -> plays (median)')
print(df.groupby(pd.cut(df['s5'], [0, 40, 45, 50, 100]), observed=True)['plays'].agg(['count', 'median']).to_string())
