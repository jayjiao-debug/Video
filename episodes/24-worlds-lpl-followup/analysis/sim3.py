# Condition the ep23 model on real Swiss R1-R2 results (+ fixed R3 pairings).
# Ratings get a Bayesian update: each run's noisy ratings are weighted by the likelihood of the 16 observed results.
import random,collections as C,json,sys,math
import sim
R=json.load(open('ratings.json'))['BL']
REG={k:v[1] for k,v in sim.T.items() if k!='PI'};REG['KC']='LEC'
TEAMS=list(REG)
PLAYED=[('GEN','IG'),('HLE','TES'),('MKOI','BLG'),('KC','AL'),('DK','G2'),('CFO','TLAW'),('T1','LOS'),('LYON','TSW'),   # R1 (winner first)
        ('TES','AL'),('IG','TSW'),('BLG','TLAW'),('GEN','HLE'),('DK','T1'),('MKOI','CFO'),('G2','LOS'),('LYON','KC')]  # R2
R3=[('GEN','LYON'),('DK','MKOI'),('TES','G2'),('HLE','IG'),('KC','BLG'),('T1','CFO'),('LOS','TSW'),('TLAW','AL')]
def run(N,seed=1,noise=40,fixed=None,update=True):
  fixed=fixed or {}
  rnd=random.Random(seed);out=[]
  for _ in range(N):
    r={t:R[t]+rnd.gauss(0,noise) for t in TEAMS}
    pg=lambda a,b:1/(1+10**(-(r[a]-r[b])/400))
    w8=1.0
    if update:
      for a,b in PLAYED: w8*=pg(a,b)
    def ser(a,b,bo):
      p=pg(a,b);w=l=0;need=bo//2+1
      while w<need and l<need:
        if rnd.random()<p:w+=1
        else:l+=1
      return (a,b) if w==need else (b,a)
    rec={t:[0,0] for t in TEAMS};met={t:set() for t in TEAMS}
    for a,b in PLAYED: rec[a][0]+=1;rec[b][1]+=1;met[a].add(b);met[b].add(a)
    pairs=R3;rnd3={}
    while True:
      for a,b in pairs:
        bo=3 if (rec[a][0]==2 or rec[a][1]==2) else 1
        key=frozenset((a,b))
        if key in fixed and pairs is R3: w,l=fixed[key],(a if fixed[key]==b else b)
        else: w,l=ser(a,b,bo)
        if pairs is R3: rnd3[key]=w
        rec[w][0]+=1;rec[l][1]+=1;met[a].add(b);met[b].add(a)
      alive=[t for t in TEAMS if rec[t][0]<3 and rec[t][1]<3]
      if not alive:break
      groups=C.defaultdict(list);pairs=[]
      for t in alive:groups[tuple(rec[t])].append(t)
      for g in groups.values():
        for _ in range(2000):
          rnd.shuffle(g);pp=list(zip(g[0::2],g[1::2]))
          if all(b not in met[a] for a,b in pp):break
        pairs+=pp
    q=[t for t in TEAMS if rec[t][0]==3]
    s30=[t for t in q if rec[t][1]==0];s32=[t for t in q if rec[t][1]==2];s31=[t for t in q if rec[t][1]==1]
    rnd.shuffle(s32);qf=list(zip(s30,s32[:len(s30)]));rest=s31+s32[len(s30):];rnd.shuffle(rest);qf+=list(zip(rest[0::2],rest[1::2]));rnd.shuffle(qf)
    qr=[ser(a,b,5) for a,b in qf];sr=[ser(qr[0][0],qr[1][0],5),ser(qr[2][0],qr[3][0],5)];fr=ser(sr[0][0],sr[1][0],5)
    out.append(dict(w=w8,rec={t:tuple(v) for t,v in rec.items()},q=q,sf=[x[0] for x in qr],f=[x[0] for x in sr],champ=fr[0],r3=rnd3))
  return out
def summarize(o):
  W=sum(x['w'] for x in o);S=C.defaultdict(lambda:[0,0,0,0])
  reg=C.Counter()
  for x in o:
    for t in x['q']:S[t][0]+=x['w']
    for t in x['sf']:S[t][1]+=x['w']
    for t in x['f']:S[t][2]+=x['w']
    S[x['champ']][3]+=x['w'];reg[REG[x['champ']]]+=x['w']
  teams={t:{k:round(100*v/W,1) for k,v in zip(['QF','SF','F','W'],S[t])} for t in TEAMS}
  return dict(region={k:round(100*v/W,1) for k,v in reg.items()},teams=teams,ess=round(W*W/sum(x['w']**2 for x in o)))
if __name__=='__main__':
  N=int(sys.argv[1]) if len(sys.argv)>1 else 200000
  res={}
  o=run(N,7);res['now']=summarize(o);res['now_noupdate']=summarize(run(N,7,update=False))
  # today's two LPL Bo1s: TES-G2, HLE-IG -> four scenarios; also BLG-KC tomorrow
  W=sum(x['w'] for x in o)
  sc=C.defaultdict(lambda:[0,0])
  for x in o:
    k=(x['r3'][frozenset(('TES','G2'))],x['r3'][frozenset(('HLE','IG'))],x['r3'][frozenset(('KC','BLG'))],x['r3'][frozenset(('TLAW','AL'))])
    sc[k][0]+=x['w'];sc[k][1]+=x['w']*(REG[x['champ']]=='LPL')
  res['scen']=[dict(k=list(k),p=round(100*v[0]/W,1),lpl=round(100*v[1]/v[0],1)) for k,v in sorted(sc.items(),key=lambda kv:-kv[1][0])]
  for name,ks in [('TES',0),('IG',1),('BLG',2),('AL',3)]:
    tot=C.defaultdict(lambda:[0,0])
    for x in o:
      k=list(x['r3'].values())  # unused
    pass
  json.dump(res,open('sim3_out.json','w'),indent=1);print(json.dumps({k:res[k]['region'] for k in ['now','now_noupdate']}),res['now']['ess'])
  for t in ['BLG','AL','TES','IG','GEN','HLE','DK','T1','G2','MKOI','LYON','KC']:print(t,res['now']['teams'][t])
