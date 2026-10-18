import sim,bt,numpy as np
GPR={**{k:v[0] for k,v in sim.T.items() if k!='PI'},**{k:v[0] for k,v in sim.PI.items()}}
R=bt.fit(6,1.5);key={'TLAW':'TL'}
BT={k:R[key.get(k,k)] for k in GPR}
m=np.mean([GPR[k] for k in GPR]);mb=np.mean(list(BT.values()))
BT={k:v-mb+m for k,v in BT.items()}
# shrink BT spread to GPR spread for a fair 'shape-only' version
sg=np.std(list(GPR.values()));sb=np.std(list(BT.values()))
BTs={k:m+(v-m)*sg/sb for k,v in BT.items()}
BL={k:(GPR[k]+BT[k])/2 for k in GPR}
for lab,rt in [('GPR',GPR),('BT form (raw)',BT),('BT form (GPR spread)',BTs),('Blend GPR+BT',BL)]:
  c,r,s,N=sim.run(40000,400,40,0.85,1,rt)
  print(f'{lab:22s} LPL {100*r["LPL"]/N:4.1f}%  LCK {100*r["LCK"]/N:4.1f}%  LEC {100*r["LEC"]/N:4.1f}%  | '+' '.join(f'{k}:{100*v/N:.1f}' for k,v in c.most_common(7)))
import json;json.dump({'GPR':GPR,'BT':BT,'BTs':BTs,'BL':BL},open('ratings.json','w'),indent=1)
