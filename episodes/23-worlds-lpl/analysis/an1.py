import pandas as pd,json,collections as C
S=pd.read_csv('series.csv',dtype={'Patch':str})
REG={}
for n in ['Bilibili Gaming','Anyone s Legend','Top Esports','Invictus Gaming','JD Gaming','Weibo Gaming','Team WE','LGD Gaming']:REG[n]='LPL'
for n in ['Gen.G','Gen.G eSports','Hanwha Life Esports','Hanwha Life eSports','T1','Dplus KIA','KT Rolster','BNK FearX','HANJIN BRION']:REG[n]='LCK'
for n in ['G2 Esports','Karmine Corp','Movistar KOI','Fnatic','Team Vitality','Natus Vincere']:REG[n]='LEC'
for n in ['Team Liquid','LYON','FlyQuest','Cloud9','100 Thieves','Sentinels','Shopify Rebellion','Disguised']:REG[n]='LCS'
for n in ['Team Secret Whales','CTBC Flying Oyster','MVK Esports','GAM Esports','PSG Talon','Deep Cross Gaming','Vivo Keyd Stars']:REG[n]='LCP' 
for n in ['LOUD','FURIA','Los Grandes','RED Canids','paiN Gaming','Vivo Keyd Stars']:REG[n]='CBLOL'
REG['Vivo Keyd Stars']='CBLOL'
S['r1']=S.t1.map(REG);S['r2']=S.t2.map(REG)
S[['s1','s2']]=S.Score.str.split(' - ',expand=True).astype(int)
def rr(df,A,B):
  sw=sl=gw=gl=0;bo5=[0,0]
  for _,r in df.iterrows():
    if {r.r1,r.r2}!={A,B}:continue
    a,b=(r.s1,r.s2) if r.r1==A else (r.s2,r.s1)
    if a==b: continue
    sw+=a>b;sl+=a<b;gw+=a;gl+=b
    if max(a,b)==3: bo5[0]+=a>b;bo5[1]+=a<b
  return sw,sl,gw,gl,bo5
INT26=['2026_First_Stand','MSI_2026','Esports_World_Cup_2026','Worlds_2026_Play-In']
INT25=['First_Stand_2025','2025_Mid-Season_Invitational','Esports_World_Cup_2025','Worlds_2025_Main_Event']
print('unmapped',set(S[S.tour.isin(INT26+INT25)].t1.tolist()+S[S.tour.isin(INT26+INT25)].t2.tolist())-set(REG))
for lab,ts in [('2026 intl',INT26),('2025 intl',INT25)]:
  d=S[S.tour.isin(ts)]
  for A in ['LPL']:
    for B in ['LCK','LEC','LCS','LCP','CBLOL']:
      print(lab,A,'vs',B,'series %d-%d games %d-%d Bo5 %s'%rr(d,A,B))
  print(lab,'LCK vs LEC','series %d-%d games %d-%d Bo5 %s'%rr(d,'LCK','LEC'))
# region record overall at intl (series) per region
for lab,ts in [('2026',INT26),('2025',INT25)]:
  d=S[S.tour.isin(ts)];R=C.defaultdict(lambda:[0,0,0,0])
  for _,r in d.iterrows():
    if r.r1==r.r2 or r.s1==r.s2: continue
    for x,y,a,b in [(r.r1,r.r2,r.s1,r.s2),(r.r2,r.r1,r.s2,r.s1)]:
      R[x][0]+=a>b;R[x][1]+=a<b;R[x][2]+=a;R[x][3]+=b
  print(lab,{k:'%d-%d (%d-%d g)'%tuple(v) for k,v in R.items()})
# team intl 2026 record
d=S[S.tour.isin(INT26)];T=C.defaultdict(lambda:[0,0,0,0])
for _,r in d.iterrows():
  for x,a,b in [(r.t1,r.s1,r.s2),(r.t2,r.s2,r.s1)]:
    if a==b: continue
    T[x][0]+=a>b;T[x][1]+=a<b;T[x][2]+=a;T[x][3]+=b
for k,v in sorted(T.items(),key=lambda kv:-(kv[1][2]/(kv[1][2]+kv[1][3]))): print(' %-22s series %d-%d games %d-%d'%(k,*v))
