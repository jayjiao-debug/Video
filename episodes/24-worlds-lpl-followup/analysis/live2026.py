# Apply the backtested configuration (v2: half-life 168 d, international x4, ridge .05, 25% shrink to region mean) to 2026.
import sys,json,numpy as np,collections as C,pandas as pd
sys.argv=['x','../keep_lol/lol-backtest-02/files']
src=open('backtest.py').read().replace('\nmain()\n','\n').replace("YEAR = {'S13': 2023, 'S14': 2024, 'S15': 2025}","YEAR = {'S16': 2026}")
ns={};exec(compile(src,'backtest.py','exec'),ns)
A=ns['load']();A=A[~A.tour.str.contains('Worlds 2026 Main Event')]
start=pd.Timestamp('2026-10-23')
R0=ns['fit'](A[A.date<start],start,168,4,.05)
AB={'GEN':'geng','AL':'anyoneslegend','TLAW':'teamliquid','G2':'g2','LOS':'losgrandes','TSW':'teamsecretwhales','HLE':'hanwhalife','BLG':'bilibiligaming','LYON':'lyon','MKOI':'movistarkoi','T1':'t1','TES':'top','CFO':'ctbcflyingoyster','IG':'invictusgaming','DK':'dpluskia','KC':'karminecorp'}
miss=[k for k,v in AB.items() if v not in R0];print('missing',miss,[n for n in R0 if 'liquid' in n or 'top' in n or 'gen' in n][:10])
REG={'GEN':'LCK','HLE':'LCK','T1':'LCK','DK':'LCK','BLG':'LPL','AL':'LPL','TES':'LPL','IG':'LPL','G2':'LEC','MKOI':'LEC','KC':'LEC','TLAW':'LCS','LYON':'LCS','TSW':'LCP','CFO':'LCP','LOS':'CBLOL'}
r={k:R0[v] for k,v in AB.items()}
rm={g:np.mean([r[k] for k in r if REG[k]==g]) for g in set(REG.values())}
E={k:.75*r[k]+.25*rm[REG[k]] for k in r}
RAT=json.load(open('../ep23/an/ratings.json'));bl=np.mean([RAT['BL'][k] for k in E]);m=np.mean(list(E.values()))
V2={k:round(E[k]-m+bl,1) for k in E}
RAT['V2']=V2;json.dump(RAT,open('../ep23/an/ratings.json','w'),indent=1)
print('series used',int((A.date<start).sum()))
for k in sorted(V2,key=lambda k:-V2[k]):print(k,V2[k],' BL',round(RAT['BL'][k]),' GPR',RAT['GPR'][k])
