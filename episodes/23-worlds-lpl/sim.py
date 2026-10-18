import random, collections, sys
# Riot LoL Esports Global Power Rankings, snapshot 2026-10-18 05:00 (lolesports.com/en-US/gpr/2026/current)
T={'GEN':(1519,'LCK',1),'AL':(1409,'LPL',1),'TLAW':(1369,'LCS',1),'G2':(1478,'LEC',1),
   'LOS':(1183,'CBLOL',2),'TSW':(1370,'LCP',2),'HLE':(1540,'LCK',2),'BLG':(1513,'LPL',2),
   'LYON':(1424,'LCS',3),'MKOI':(1320,'LEC',3),'T1':(1471,'LCK',3),'TES':(1364,'LPL',3),
   'CFO':(1316,'LCP',4),'IG':(1348,'LPL',4),'DK':(1409,'LCK',4),'PI':(None,None,4)}
PI={'KC':(1396,'LEC'),'MVK':(1269,'LCP')}
def run(N=100000,scale=400,noise=40,pi_kc=0.85,seed=1):
    rnd=random.Random(seed);champ=collections.Counter();reg=collections.Counter();stage=collections.Counter()
    for _ in range(N):
        pi='KC' if rnd.random()<pi_kc else 'MVK'
        R={};REG={};TIER={}
        for k,(r,g,t) in T.items():
            if k=='PI': r,g=PI[pi];k2=pi
            else:k2=k
            R[k2]=r+rnd.gauss(0,noise);REG[k2]=g;TIER[k2]=t
        teams=list(R)
        pg=lambda a,b:1/(1+10**(-(R[a]-R[b])/scale))
        def series(a,b,bo):
            p=pg(a,b);w=l=0;need=bo//2+1
            while w<need and l<need:
                if rnd.random()<p:w+=1
                else:l+=1
            return a if w==need else b
        rec={t:[0,0] for t in teams};met={t:set() for t in teams}
        # round 1: tier1 v tier4, tier2 v tier3, no same region
        def draw(A,B,avoid_region):
            for _ in range(1000):
                b=B[:];rnd.shuffle(b);ok=all(not(avoid_region and REG[x]==REG[y]) for x,y in zip(A,b))
                if ok:return list(zip(A,b))
            return list(zip(A,B))
        t1=[t for t in teams if TIER[t]==1];t4=[t for t in teams if TIER[t]==4];t2=[t for t in teams if TIER[t]==2];t3=[t for t in teams if TIER[t]==3]
        pairs=draw(t1,t4,True)+draw(t2,t3,True)
        rnd_no=1
        while True:
            for a,b in pairs:
                bo=3 if (rec[a][0]==2 or rec[a][1]==2) else 1
                w=series(a,b,bo);l=b if w==a else a;rec[w][0]+=1;rec[l][1]+=1;met[a].add(b);met[b].add(a)
            alive=[t for t in teams if rec[t][0]<3 and rec[t][1]<3]
            if not alive:break
            rnd_no+=1;pairs=[]
            groups=collections.defaultdict(list)
            for t in alive:groups[tuple(rec[t])].append(t)
            for g in groups.values():
                for _ in range(2000):
                    rnd.shuffle(g);pp=list(zip(g[0::2],g[1::2]))
                    if all(b not in met[a] for a,b in pp):break
                pairs+=pp
        q=[t for t in teams if rec[t][0]==3]
        for t in q: stage[('QF',REG[t])]+=1
        s30=[t for t in q if rec[t][1]==0];s32=[t for t in q if rec[t][1]==2];s31=[t for t in q if rec[t][1]==1]
        rnd.shuffle(s32);qf=list(zip(s30,s32[:len(s30)]));rest=s31+s32[len(s30):];rnd.shuffle(rest);qf+=list(zip(rest[0::2],rest[1::2]))
        rnd.shuffle(qf)
        w=[series(a,b,5) for a,b in qf];sf=[series(w[0],w[1],5),series(w[2],w[3],5)];c=series(sf[0],sf[1],5)
        champ[c]+=1;reg[REG[c]]+=1
    return champ,reg,stage,N
if __name__=='__main__':
    for scale,noise in [(400,0),(400,40),(400,80),(300,40),(500,40)]:
        c,r,s,N=run(40000,scale,noise)
        print(f'scale {scale} noise {noise}: LPL {100*r["LPL"]/N:.1f}%  LCK {100*r["LCK"]/N:.1f}%  LEC {100*r["LEC"]/N:.1f}%  LCS {100*r["LCS"]/N:.1f}%  | '+' '.join(f'{k}:{100*v/N:.1f}' for k,v in c.most_common(8)))
