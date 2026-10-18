import random,collections as C,json,sys
R=json.load(open('ratings.json'))['BL']
import sim
REG={k:v[1] for k,v in sim.T.items() if k!='PI'};REG['KC']='LEC';POT={k:v[2] for k,v in sim.T.items() if k!='PI'};POT['KC']=4
TEAMS=[t for t in REG]
def run(N,seed=1,noise=40,rating=R):
  rnd=random.Random(seed);recs=[]
  for _ in range(N):
    r={t:rating[t]+rnd.gauss(0,noise) for t in TEAMS}
    pg=lambda a,b:1/(1+10**(-(r[a]-r[b])/400))
    def ser(a,b,bo):
      p=pg(a,b);w=l=0;need=bo//2+1
      while w<need and l<need:
        if rnd.random()<p:w+=1
        else:l+=1
      return (a,b) if w==need else (b,a)
    def draw(A,B):
      for _ in range(1000):
        b=B[:];rnd.shuffle(b)
        if all(REG[x]!=REG[y] for x,y in zip(A,b)):return list(zip(A,b))
    p1=[t for t in TEAMS if POT[t]==1];p2=[t for t in TEAMS if POT[t]==2];p3=[t for t in TEAMS if POT[t]==3];p4=[t for t in TEAMS if POT[t]==4]
    pairs=draw(p1,p4)+draw(p2,p3);r1={};
    for a,b in pairs: r1[a]=b;r1[b]=a
    rec={t:[0,0] for t in TEAMS};met={t:set() for t in TEAMS};swiss_opp={t:[] for t in TEAMS}
    while True:
      for a,b in pairs:
        bo=3 if (rec[a][0]==2 or rec[a][1]==2) else 1
        w,l=ser(a,b,bo);rec[w][0]+=1;rec[l][1]+=1;met[a].add(b);met[b].add(a);swiss_opp[a].append(b);swiss_opp[b].append(a)
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
    recs.append(dict(r1=r1,rec={t:tuple(v) for t,v in rec.items()},qf=qf,qr=qr,sr=sr,fr=fr,half=[[qf[0],qf[1]],[qf[2],qf[3]]],swiss_opp=swiss_opp))
  return recs
if __name__=='__main__':
  import pickle
  N=int(sys.argv[1]) if len(sys.argv)>1 else 100000
  recs=run(N,int(sys.argv[2]) if len(sys.argv)>2 else 11)
  pickle.dump(recs,open('recs.pkl','wb'));print(len(recs))
