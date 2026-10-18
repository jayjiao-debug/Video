import json,sys,collections as C
P=json.load(open(sys.argv[1]))
AL={'GEN.G':'GEN','GENG':'GEN','HANWHA':'HLE','HLE':'HLE','BILIBILI':'BLG','TL':'TLAW','TEAMLIQUID':'TLAW','ANYONE':'AL',"ANYONE'S LEGEND":'AL','TOP':'TES','DPLUS':'DK','DK':'DK'}
VALID={'GEN','HLE','T1','DK','AL','BLG','TES','IG','G2','MKOI','KC','TLAW','LYON','TSW','CFO','LOS'}
def norm(t):
  u=str(t).strip().upper().replace(' ','')
  u=AL.get(u,u);return u if u in VALID else None
LAB={'DeepSeek':'DeepSeek-R1 蒸馏版','OpenAI':'OpenAI gpt-oss','Alibaba Qwen':'通义千问 Qwen3','Zhipu GLM':'智谱 GLM-4','Microsoft':'微软 Phi-4','Mistral':'Mistral Small'}
models=[];tally=C.Counter();total=0;rows=[]
for r in P['results']:
  if 'parsed' not in r: rows.append((r['lab'],'ERROR',r.get('error','')[:200]));continue
  ans=[[norm(x) for x in p['top3']] for p in r['parsed'] if p and isinstance(p.get('top3'),list) and len(p['top3'])>=3]
  ans=[a[:3] for a in ans if all(a[:3]) and len(set(a[:3]))==3]
  if not ans: rows.append((r['lab'],'NO VALID',str(r['raw'][0][-300:])));continue
  pts=C.Counter();first=C.Counter()
  for a in ans:
    for k,t in enumerate(a): pts[t]+=3-k
    first[a[0]]+=1;tally[a[0]]+=1;total+=1
  top=[t for t,_ in pts.most_common(3)]
  reasons=[p.get('reason','') for p in r['parsed'] if p]
  models.append({'label':LAB.get(r['lab'],r['lab']),'lab':r['lab'],'model':r['model'],'top3':top,'share':first[top[0]],'valid':len(ans),'first':dict(first),'reason':reasons[0] if reasons else ''})
  rows.append((r['lab'],top,dict(first),len(ans)))
for x in rows: print(x)
out={'samples':P['samples'],'total':total,'models':models,'tally':tally.most_common()}
json.dump(out,open(sys.argv[2],'w'),ensure_ascii=False,indent=1);print(out['tally'],total)
