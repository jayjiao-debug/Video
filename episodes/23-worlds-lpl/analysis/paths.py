import pickle,collections as C,json
from sim2 import REG,TEAMS,R
recs=pickle.load(open('recs.pkl','rb'));N=len(recs)
LPL=[t for t in TEAMS if REG[t]=='LPL'];LCK=[t for t in TEAMS if REG[t]=='LCK']
champ=C.Counter(x['fr'][0] for x in recs);lpl=sum(REG[x['fr'][0]]=='LPL' for x in recs)
out={'N':N,'lpl_title':lpl/N}
print('LPL title %.1f%%'%(100*lpl/N), {t:round(100*champ[t]/N,1) for t in LPL})
# R1 opponent conditional
r1=C.defaultdict(lambda:[0,0,0])
for x in recs:
  for t in LPL:
    o=x['r1'][t];k=(t,o);r1[k][0]+=1;r1[k][1]+=x['fr'][0]==t;r1[k][2]+=REG[x['fr'][0]]=='LPL'
out['r1']=[]
for t in LPL:
  rows=sorted([(o,v) for (tt,o),v in r1.items() if tt==t],key=lambda z:-z[1][2]/z[1][0])
  for o,v in rows: out['r1'].append({'team':t,'opp':o,'share':v[0]/N,'team_title':v[1]/v[0],'lpl_title':v[2]/v[0]}); print(f'{t} R1 vs {o:5s} drawn {100*v[0]/N:4.1f}%  {t} title {100*v[1]/v[0]:4.1f}%  LPL title {100*v[2]/v[0]:4.1f}%')
# swiss record conditional for BLG
for t in ['BLG','AL']:
  d=C.defaultdict(lambda:[0,0])
  for x in recs:
    k=x['rec'][t];d[k][0]+=1;d[k][1]+=x['fr'][0]==t
  print(t,{f'{k[0]}-{k[1]}':(round(100*v[0]/N,1),round(100*v[1]/max(1,v[0]),1)) for k,v in sorted(d.items())})
  out['rec_'+t]={f'{k[0]}-{k[1]}':{'share':v[0]/N,'title':v[1]/max(1,v[0])} for k,v in d.items()}
# BLG in QF: title chance by QF opponent region, and by # LCK teams in BLG's half
qo=C.defaultdict(lambda:[0,0]);hl=C.defaultdict(lambda:[0,0]);
for x in recs:
  for a,b in x['qf']:
    if 'BLG' in (a,b):
      o=b if a=='BLG' else a;qo[o][0]+=1;qo[o][1]+=x['fr'][0]=='BLG'
  for h in x['half']:
    ts=[t for p in h for t in p]
    if 'BLG' in ts:
      n=sum(REG[t]=='LCK' for t in ts);hl[n][0]+=1;hl[n][1]+=x['fr'][0]=='BLG'
print('BLG QF opp:',{o:(v[0],round(100*v[1]/v[0],1)) for o,v in sorted(qo.items(),key=lambda z:-z[1][1]/z[1][0])})
print('BLG half LCK count:',{n:(v[0],round(100*v[1]/v[0],1)) for n,v in sorted(hl.items())})
out['blg_qf_opp']={o:{'n':v[0],'title':v[1]/v[0]} for o,v in qo.items()}
out['blg_half_lck']={n:{'n':v[0],'title':v[1]/v[0]} for n,v in hl.items()}
# finals
fin=C.Counter(tuple(sorted([REG[x['fr'][0]],REG[x['fr'][1]]])) for x in recs)
print('final regions',{'-'.join(k):round(100*v/N,1) for k,v in fin.most_common(8)})
out['final_regions']={'-'.join(k):v/N for k,v in fin.items()}
# LPL teams in QF
nq=C.Counter(sum(1 for t in LPL if x['rec'][t][0]==3) for x in recs);print('LPL teams in QF',{k:round(100*v/N,1) for k,v in sorted(nq.items())})
out['lpl_in_qf']={k:v/N for k,v in nq.items()}
nk=C.Counter(sum(1 for t in LCK if x['rec'][t][0]==3) for x in recs);print('LCK teams in QF',{k:round(100*v/N,1) for k,v in sorted(nk.items())})
# BLG title path: who did BLG beat in QF/SF/F
pth=C.Counter()
for x in recs:
  if x['fr'][0]!='BLG':continue
  q=[l for w,l in x['qr'] if w=='BLG'][0];s=[l for w,l in x['sr'] if w=='BLG'][0];f=x['fr'][1];pth[(q,s,f)]+=1
print('BLG title paths', [(k,v) for k,v in pth.most_common(6)])
lckbeat=C.Counter(sum(REG[t]=='LCK' for t in k) for k,v in pth.items() for _ in range(v));print('LCK teams BLG beats en route',{k:round(100*v/sum(lckbeat.values()),1) for k,v in sorted(lckbeat.items())})
out['blg_lck_beaten']={k:v/sum(lckbeat.values()) for k,v in lckbeat.items()}
# last LPL win chance by meeting T1
json.dump(out,open('paths.json','w'),indent=1)
