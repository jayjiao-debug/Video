import pandas as pd,numpy as np,sys
from scipy.optimize import minimize
G=pd.read_csv('games.csv',dtype={'patch':str});G=G[G.patch.notna()].copy()
G['vs2']=G.vs.replace({'TLAW':'TL'});W=set(G.team)
G=G[~(G.vs2.isin(W)&(G.team>G.vs2))]
G['pn']=G.patch.map(lambda p:int(p.split('.')[1]) if p.startswith('16') else -2)
INTL=G.tour.str.contains('MSI|World|First Stand|Esports World Cup|Play-In')
def fit(h=6,ib=1.5,lam=0.05,since=-99):
  g=G[G.pn>=since];teams=sorted(set(g.team)|set(g.vs2));ix={t:i for i,t in enumerate(teams)}
  a=g.team.map(ix).values;b=g.vs2.map(ix).values;y=(g.res=='WIN').values.astype(float)
  w=0.5**((20-g.pn.values)/h)*np.where(INTL[g.index],ib,1.0)
  def f(r):
    d=r[a]-r[b];p=1/(1+np.exp(-d))
    ll=np.sum(w*(y*np.log(p+1e-12)+(1-y)*np.log(1-p+1e-12)))-lam*np.sum(r*r)
    gr=np.zeros_like(r);e=w*(y-p);np.add.at(gr,a,e);np.add.at(gr,b,-e);gr-=2*lam*r
    return -ll,-gr
  r=minimize(f,np.zeros(len(teams)),jac=True,method='L-BFGS-B').x
  return {t:r[ix[t]]*400/np.log(10) for t in teams}
if __name__=='__main__':
  WT=['HLE','GEN','BLG','G2','T1','LYON','DK','AL','KC','TSW','TL','TES','IG','MKOI','CFO','MVK','LOS']
  for h,ib in [(6,1.5),(4,1.5),(10,1.5),(6,3)]:
    R=fit(h,ib);base=np.mean([R[t] for t in WT])
    print(f'h={h} ib={ib}:',' '.join(f'{t}:{R[t]-base:+.0f}' for t in sorted(WT,key=lambda t:-R[t])))
