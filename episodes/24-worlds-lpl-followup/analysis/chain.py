import sys,json,collections as C
sys.argv=['x','.'];src=open('../../ep24/backtest.py').read().replace('\nmain()\n','\n');ns={};exec(compile(src,'backtest.py','exec'),ns)
sim=ns['simulate'];RAT=json.load(open('ratings.json'))
import sim3
REG=dict(sim3.REG);teams=list(REG)
r1=[(a,b) for a,b in sim3.PLAYED[:8]]
R1=[(w,l,1) for w,l in sim3.PLAYED[:8]];R2=[(w,l,1) for w,l in sim3.PLAYED[8:16]]
out={}
for name in ['BL','V2']:
  R=RAT[name];row={}
  for lab,fx in [('pre',[]),('afterR1',[R1]),('afterR2',[R1,R2])]:
    P,ess=sim(R,teams,r1,fx,60000,3)
    lpl=sum(P[t][3] for t in teams if REG[t]=='LPL');row[lab]=dict(LPL=round(100*lpl,1),BLG=round(100*P['BLG'][3],1),share=round(100*P['BLG'][3]/lpl),LCK=round(100*sum(P[t][3] for t in teams if REG[t]=='LCK'),1),ess=round(ess))
  out[name]=row;print(name,row)
json.dump(out,open('../../ep24/chain_out.json','w'),indent=1)
