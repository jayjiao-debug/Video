# Model 2: in-game margin rating. Each game's gold difference (kgold) = r_a - r_b + noise, same recency and
# international weights as bt.py; then the rating gap is calibrated to a win probability on the same games.
import pandas as pd,numpy as np,json
from scipy.optimize import minimize_scalar
from bt import G,INTL
g=G.copy();g['gd']=g.x1-g.ox1;g=g[g.gd.notna()]
teams=sorted(set(g.team)|set(g.vs2));ix={t:i for i,t in enumerate(teams)}
a=g.team.map(ix).values;b=g.vs2.map(ix).values;y=g.gd.values;win=(g.res=='WIN').values
w=0.5**((20-g.pn.values)/6)*np.where(INTL[g.index],1.5,1.0)
n=len(teams);X=np.zeros((len(g),n));X[np.arange(len(g)),a]=1;X[np.arange(len(g)),b]=-1
lam=2.0;W=np.sqrt(w)[:,None]
r=np.linalg.solve((X*W).T@(X*W)+lam*np.eye(n),(X*W).T@(y*np.sqrt(w)))
m=r[a]-r[b]
nll=lambda c:-np.sum(w*np.where(win,np.log(1/(1+np.exp(-m/c))),np.log(1-1/(1+np.exp(-m/c)))))
c=minimize_scalar(nll,bounds=(.5,50),method='bounded').x
WT=['HLE','GEN','BLG','G2','T1','LYON','DK','AL','KC','TSW','TL','TES','IG','MKOI','CFO','LOS']
elo={t:r[ix[t]]/c*400/np.log(10) for t in WT}
base=np.mean(list(elo.values()));RAT=json.load(open('ratings.json'));bl=np.mean([RAT['BL'][k if k!='TL' else 'TLAW'] for k in WT])
out={('TLAW' if t=='TL' else t):round(elo[t]-base+bl,1) for t in WT}
print('scale c=%.2f kgold per logit'%c)
for t in sorted(out,key=lambda t:-out[t]):print(t,out[t],'  BL',round(RAT['BL'][t]),'  kgold/game',round(r[ix[t if t!='TLAW' else 'TL']]-np.mean([r[ix[k]] for k in WT]),2))
RAT['MARGIN']=out;json.dump(RAT,open('ratings.json','w'),indent=1)
