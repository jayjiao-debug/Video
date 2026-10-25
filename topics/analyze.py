"""Statistical analysis of the creator-center export (作品名称…粉丝增量). python3 topics/analyze.py <xlsx>"""
import sys, re, numpy as np, pandas as pd
from scipy.stats import spearmanr, mannwhitneyu
import statsmodels.api as sm
pd.set_option('display.width', 250)
df = pd.read_excel(sys.argv[1])
for c in ['完播率', '5s完播率', '2s跳出率']: df[c] = pd.to_numeric(df[c], errors='coerce') * 100
df = df[df['播放量'] > 100].copy()
P = df['播放量']; df['lp'] = np.log10(P)
df['点赞率'] = df['点赞量'] / P * 100; df['分享率'] = df['分享量'] / P * 100; df['评论率'] = df['评论量'] / P * 100
df['收藏率'] = df['收藏量'] / P * 100; df['主页率'] = df['主页访问量'] / P * 100; df['涨粉/万播'] = df['粉丝增量'] / P * 1e4
t = df['作品名称'].astype(str); head = t.str.split('\n').str[0]
title = head.str.replace(r'Vibe知识大赏.*|VIBE知识大赏.*|#.*', '', regex=True).str.strip()
df['T'] = title.str[:22]
df['标题有你'] = title.str.contains('你').astype(int)
df['标题问句'] = title.str.contains('？|\\?').astype(int)
df['标题有数字'] = title.str.contains(r'\d|几|多少').astype(int)
df['标题长'] = title.str.len()
desc = t.str.split('》', n=1).str[1].fillna('')
df['简介年份开头'] = desc.str.strip().str.match(r'^\s*(\d{3,4}年|[一二三四五六七八九十]+世纪|\d世纪)').astype(int)
d = pd.to_datetime(df['发布时间']); df['天'] = (d - d.min()).dt.days; df['时'] = d.dt.hour
df['长视频'] = df['体裁'].astype(str).str.contains('3-5').astype(int); df['1分钟'] = df['体裁'].astype(str).str.contains('1min').astype(int)
num = ['5s完播率', '2s跳出率', '完播率', '平均播放时长', '点赞率', '分享率', '评论率', '收藏率', '主页率', '涨粉/万播',
       '标题有你', '标题问句', '标题有数字', '标题长', '简介年份开头', '长视频', '1分钟', '天', '时']
print(f'n = {len(df)} videos\n\n== Spearman with log(plays) ==')
rows = [(c, *spearmanr(df[c], df['lp'], nan_policy='omit')) for c in num]
print(pd.DataFrame(rows, columns=['metric', 'rho', 'p']).sort_values('rho', key=abs, ascending=False).round(3).to_string(index=False))
print('\n== what drives 5s完播率 (Spearman) ==')
for c in ['标题有你', '标题问句', '标题有数字', '标题长', '简介年份开头', '长视频', '1分钟', '天']:
    r, p = spearmanr(df[c], df['5s完播率']); print(f'{c:8} rho={r:+.2f} p={p:.3f}')
print('\n== OLS log10(plays) ~ 5s + share rate ==')
X = sm.add_constant(df[['5s完播率', '分享率']]); m = sm.OLS(df['lp'], X).fit(); print(m.summary().tables[1]); print('R2 =', round(m.rsquared, 2))
X = sm.add_constant(df[['5s完播率']]); m1 = sm.OLS(df['lp'], X).fit(); print('R2 (5s only) =', round(m1.rsquared, 2), ' slope: +1pt 5s ->', f'x{10**m1.params["5s完播率"]:.2f} plays')
X = sm.add_constant(df[['5s完播率', '分享率', '天']]); m2 = sm.OLS(df['lp'], X).fit(); print('with time trend:', m2.params.round(4).to_dict(), 'p(天)=', round(m2.pvalues['天'], 3), 'R2=', round(m2.rsquared, 2))
print('\n== hit rate (>=100k) by 5s x share ==')
df['5s≥47'] = df['5s完播率'] >= 47; df['分享≥1%'] = df['分享率'] >= 1
print(df.pivot_table(index='5s≥47', columns='分享≥1%', values='播放量', aggfunc=[lambda x: f"{(x >= 1e5).sum()}/{len(x)}", 'median']).to_string())
print('\n== binary features: median plays / median 5s ==')
for c in ['标题有你', '标题问句', '标题有数字', '简介年份开头', '长视频', '1分钟']:
    a, b = df[df[c] == 1], df[df[c] == 0]
    if len(a) and len(b):
        print(f'{c:8} yes n={len(a):2} plays {int(a.播放量.median()):>8} 5s {a["5s完播率"].median():.1f} | no n={len(b):2} plays {int(b.播放量.median()):>8} 5s {b["5s完播率"].median():.1f} | MW p={mannwhitneyu(a.播放量, b.播放量).pvalue:.3f}')
print('\n== follower conversion (per 10k plays) ==')
print(df.sort_values('涨粉/万播', ascending=False)[['T', '播放量', '涨粉/万播', '主页率', '分享率', '5s完播率']].round(2).head(8).to_string(index=False))
print('\n== residuals: over/under-performers given 5s+share ==')
df['resid'] = m.resid; print(df.sort_values('resid')[['T', '播放量', '5s完播率', '分享率', 'resid']].round(2).to_string(index=False))
