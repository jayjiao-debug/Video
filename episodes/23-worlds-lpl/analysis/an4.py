import json,pandas as pd
T=json.load(open('teams.json'));A=pd.read_csv('meta_late.csv',index_col=0)
meta=list(A.head(25).index)
P=pd.read_csv('meta_pi.csv',index_col=0)
BUFF=['Lillia','Lucian','Vayne','Neeko','Diana','Kennen','Kindred','Mordekaiser','Smolder','Tahm Kench','Swain']
NERF=['Ashe','Yunara','KSante','Ambessa','Cassiopeia']
rows=[]
for k,t in T.items():
  pm=0;cm=0;g=0;nerf=0;ex=[]
  for r in t['roster'][:5]:
    for c,n,wr,kda in r['champs']:
      g+=n
      if c in meta: pm+=n
      if c in meta and n>=8 and wr>=70: ex.append(f"{r['player']}-{c}({n}g {wr:.0f}%)")
      if c in NERF: nerf+=n
  rows.append((k,g,round(100*pm/g),round(100*nerf/g),', '.join(ex[:6])))
D=pd.DataFrame(rows,columns=['team','pool_games','%meta25','%nerfed','meta comfort picks (>=8g, >=70%)']).sort_values('%meta25',ascending=False)
print(D.to_string(index=False))
D.to_csv('pool_meta.csv',index=False)
