# Model 4: history only. 2023-2025 Worlds Swiss (gol.gg match lists): what happened to teams with a given record.
import pandas as pd,collections as C,json
A=pd.read_csv('worlds_series_2023_2026.csv')
N={'Gen.G eSports':'Gen.G','Hanwha Life eSports':'Hanwha Life Esports','MAD Lions KOI':'Movistar KOI'}
A['t1']=A.t1.replace(N);A['t2']=A.t2.replace(N)
LPL={'Anyone s Legend','Bilibili Gaming','Invictus Gaming','JD Gaming','LNG Esports','Top Esports','Weibo Gaming'}
LCK={'Dplus KIA','Gen.G','Hanwha Life Esports','KT Rolster','T1'}
reg=lambda t:'LPL' if t in LPL else 'LCK' if t in LCK else 'other'
def winner(r):
  a,b=[int(x) for x in r.score.split('-')];return (r.t1,r.t2) if a>b else (r.t2,r.t1)
H=[];R1=[]
for y in [2023,2024,2025]:
  d=A[A.year==y];rec=C.defaultdict(list)
  for rn in ['ROUND1','ROUND2','ROUND3','ROUND4','ROUND5']:
    for _,r in d[d['round']==rn].iterrows():
      w,l=winner(r);rec[w].append(1);rec[l].append(0)
      if rn=='ROUND1':R1.append((y,w,l))
  ko=d[d['round'].isin(['QUARTERFINALS','SEMIFINALS','FINALS'])]
  qf=set(ko[ko['round']=='QUARTERFINALS'].t1)|set(ko[ko['round']=='QUARTERFINALS'].t2)
  sf=set(ko[ko['round']=='SEMIFINALS'].t1)|set(ko[ko['round']=='SEMIFINALS'].t2)
  fr=ko[ko['round']=='FINALS'].iloc[0];champ=winner(fr)[0]
  for t,v in rec.items():H.append(dict(year=y,team=t,reg=reg(t),res=''.join(map(str,v)),qf=t in qf,sf=t in sf,champ=t==champ))
H=pd.DataFrame(H)
out={}
for k in [1,2,3]:
  H['r%d'%k]=H.res.str[:k].map(lambda s:f'{s.count("1")}-{s.count("0")}')
  g=H.groupby('r%d'%k).agg(n=('team','size'),qf=('qf','sum'),sf=('sf','sum'),champ=('champ','sum'))
  out['after_R%d'%k]=g.reset_index().to_dict('records');print(f'after round {k}\n',g)
print('\nchampions:',H[H.champ][['year','team','res']].to_string(index=False))
print('\nQF teams that lost >=1 Swiss game:',int((H.qf&H.res.str.contains('0')).sum()),'of',int(H.qf.sum()))
print('\nR1 LPL results by year:')
for y in [2023,2024,2025]:
  w=sum(1 for yy,a,b in R1 if yy==y and reg(a)=='LPL');l=sum(1 for yy,a,b in R1 if yy==y and reg(b)=='LPL');print(y,f'LPL {w}-{l} in R1')
lp=H[H.reg=='LPL'];print('\nLPL teams by record after R2:\n',lp.groupby('r2').agg(n=('team','size'),qf=('qf','sum'),sf=('sf','sum')))
json.dump(dict(base=out,champs=H[H.champ][['year','team','res']].to_dict('records'),table=H.to_dict('records')),open('hist_out.json','w'),ensure_ascii=False,indent=1)
