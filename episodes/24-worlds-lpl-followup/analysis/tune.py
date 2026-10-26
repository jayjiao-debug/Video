# Calibration study on the 120 Worlds main-event series 2023-2025 (pre-tournament ratings only).
import sys,numpy as np,collections as C,re,itertools
sys.argv=['x','../keep_lol/lol-backtest-01/files']
import importlib.util
spec=importlib.util.spec_from_file_location('bt',  'backtest.py');src=open('backtest.py').read().replace('\nmain()\n','\n')
ns={};exec(compile(src,'backtest.py','exec'),ns)
A=ns['load']();fit=ns['fit'];pser=ns['pser'];MAIN=ns['MAIN'];LEAGUE=ns['LEAGUE']
z=np.random.default_rng(0).standard_normal(4000)
def run(half,ib,lam,sig,alpha):
  P=[]
  for y in [2023,2024,2025]:
    S=A[A.year==y];M=S[S.tour==MAIN[y]];start=M.date.min();T=S[(S.date<start)&(S.tour!=MAIN[y])]
    R=fit(T,start,half,ib,lam);teams=set(M.n1)|set(M.n2)
    lg=C.Counter()
    for t1,t2,tour in zip(T.n1,T.n2,T.tour):
      m=LEAGUE.match(tour)
      if m:g=m.group(1).split()[0];lg[(t1,g)]+=1;lg[(t2,g)]+=1
    REG={t:max([(c,l) for (tt,l),c in lg.items() if tt==t] or [(0,'?')])[1] for t in teams}
    rm={g:np.mean([R[t] for t in teams if REG[t]==g]) for g in set(REG.values())}
    E={t:alpha*R[t]+(1-alpha)*rm[REG[t]] for t in teams}
    for t1,t2,a,b in zip(M.n1,M.n2,M.a,M.b):
      w,l=(t1,t2) if a>b else (t2,t1);bo={1:1,2:3,3:5}[max(a,b)]
      d=E[w]-E[l]+sig*np.sqrt(2)*z;p=np.mean(pser(1/(1+10**(-d/400)),bo))
      P.append(p)
  P=np.clip(np.array(P),1e-6,1-1e-6);return np.mean(-np.log(P)),np.mean(P>.5),np.mean((1-P)**2)
base=run(84,1.5,.05,0,1)

print('--- wider grid')
best=[]
for half,ib,lam,alpha in itertools.product([168,250,365,10000],[3,4,6],[.02,.05,.2],[1,.75,.5]):
  r=run(half,ib,lam,40,alpha);best.append((r[0],half,ib,lam,alpha,r[1],r[2]))
best.sort()
for b in best[:6]:print('logloss %.3f half %d ib %.1f lam %.2f alpha %.2f acc %.3f brier %.3f'%b)
# leave-one-year-out check for the chosen direction
for hold in [2023,2024,2025]:
  pass
