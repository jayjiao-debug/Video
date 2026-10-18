import json,pandas as pd,collections as C
O='../dash/'
R=json.load(open('ratings.json'));SO=json.load(open('sim_out.json'))
import sim
REG={k:v[1] for k,v in sim.T.items() if k!='PI'};REG['KC']='LEC';POT={k:v[2] for k,v in sim.T.items() if k!='PI'};POT['KC']=4
NAME={'GEN':'Gen.G','HLE':'Hanwha Life','BLG':'Bilibili Gaming','G2':'G2 Esports','T1':'T1','LYON':'LYON','DK':'Dplus KIA','AL':"Anyone's Legend",'KC':'Karmine Corp','TSW':'Team Secret Whales','TLAW':'Team Liquid','TES':'Top Esports','IG':'Invictus Gaming','MKOI':'Movistar KOI','CFO':'CTBC Flying Oyster','LOS':'Los Grandes'}
LAB={'GPR':'Riot power ranking','BTs':'2026 results, ranking spread','BT':'2026 results, raw','BL':'Blend of both'}
rows=[{'model':LAB[m],'model_id':m,**{r:SO[m]['region'].get(r,0.0) for r in ['LPL','LCK','LEC','LCS','LCP','CBLOL']}} for m in ['GPR','BTs','BL','BT']]
json.dump(rows,open(O+'sim_region.json','w'),indent=0)
tr=[]
for t in NAME:
  d={'team':t,'name':NAME[t],'region':REG[t],'pot':POT[t],'gpr':R['GPR'][t],'form_rating':round(R['BTs'][t])}
  for m in ['GPR','BTs','BL','BT']: d['win_'+m]=SO[m]['teams'][t]['W']
  for st in ['QF','SF','F']: d[st.lower()+'_BL']=SO['BL']['teams'][t][st]
  tr.append(d)
json.dump(tr,open(O+'sim_teams.json','w'),indent=0)
# form
G=pd.read_csv('games.csv',dtype={'patch':str});G=G[G.patch.notna()].copy();G['win']=(G.res=='WIN').astype(int)
G['pn']=G.patch.map(lambda p:int(p.split('.')[1]) if p.startswith('16') else 0)
T=json.load(open('teams.json'))
K={'TLAW':'TL'}
fr=[]
for t in NAME:
  k=K.get(t,t);x=G[G.team==k];y=x[x.pn>=13];z=x[x.pn>=16]
  po=x[x.tour.str.contains('Playoffs|Grand Finals|Regional|MSI|World|Esports World Cup|Play-In')&(x.pn>=13)]
  kv=T[k]['kv'];gd=lambda s:int(s.replace('+','')) if s else None
  dr=kv.get('Dragons / game','');na=kv.get('Nashors / game','');he=kv.get('Herald / game','')
  pct=lambda s:float(s.split('(')[1].rstrip('%)')) if '(' in s else None
  fr.append({'team':t,'region':REG[t],'games':len(x),'wins':int(x.win.sum()),'losses':int(len(x)-x.win.sum()),'wr':round(100*x.win.mean(),1),
   'wr_summer':round(100*y.win.mean(),1),'g_summer':len(y),'wr_late':round(100*z.win.mean(),1),'g_late':len(z),'wr_big':round(100*po.win.mean(),1) if len(po) else None,'g_big':len(po),
   'gd15':gd(kv.get('Gold Differential at 15 min')),'gdm':gd(kv.get('Gold Differential per Minute')),'dragon_pct':pct(dr),'nashor_pct':pct(na),'herald_pct':pct(he),
   'duration':kv.get('Average game duration ','').strip(),'kills_pg':float(kv.get('Kills Per Game','0')),'deaths_pg':float(kv.get('Deaths Per Game','0'))})
json.dump(fr,open(O+'form.json','w'),indent=0)
# h2h (Worlds teams only)
G['vs2']=G.vs.replace({'TLAW':'TL'});W=set(G.team)
h=[]
for (a,b),g in G[G.vs2.isin(W)].groupby(['team','vs2']):
  ta={'TL':'TLAW'}.get(a,a);tb={'TL':'TLAW'}.get(b,b)
  h.append({'pair':f'{ta}-{tb}','team':ta,'opp':tb,'wins':int(g.win.sum()),'losses':int(len(g)-g.win.sum())})
json.dump(h,open(O+'h2h.json','w'),indent=0)
# intl series 2025/2026
S=pd.read_csv('series.csv',dtype={'Patch':str})
INT={'2026_First_Stand':'First Stand 2026','MSI_2026':'MSI 2026','Esports_World_Cup_2026':'EWC 2026','Worlds_2026_Play-In':'Worlds 2026 Play-In','First_Stand_2025':'First Stand 2025','2025_Mid-Season_Invitational':'MSI 2025','Esports_World_Cup_2025':'EWC 2025','Worlds_2025_Main_Event':'Worlds 2025'}
from regions import REG as RG
ss=[]
for _,r in S[S.tour.isin(INT)].iterrows():
  if pd.isna(r.Patch): continue
  s1,s2=map(int,r.Score.split(' - '))
  ss.append({'event':INT[r.tour],'year':int(r.Date[:4]),'date':r.Date,'stage':str(r['round']).title(),'team1':r.t1.replace(' s ',"'s "),'region1':RG[r.t1],'score1':s1,'score2':s2,'team2':r.t2.replace(' s ',"'s "),'region2':RG[r.t2],'best_of':'Bo5' if max(s1,s2)==3 else ('Bo3' if max(s1,s2)==2 else 'Bo1')})
json.dump(ss,open(O+'intl_series.json','w'),indent=0)
# Worlds/MSI LPL-vs-LCK Bo5 since 2017 (Leaguepedia 2017-Oct 2024 + gol.gg rest)

F2='/tmp/claude-0/-home-claude/131bbb47-cdc6-59f9-b59e-78638f10b457/scratchpad/ao/out/lol-worlds26-02/files/'
F4='/tmp/claude-0/-home-claude/131bbb47-cdc6-59f9-b59e-78638f10b457/scratchpad/ao/out/lol-worlds26-04/files/'
LP=[r['title'] for f in ['ms_intl_00000.json','ms_intl_00500.json'] for r in json.load(open(F2+f))['cargoquery']]
LPL={'Royal Never Give Up','EDward Gaming','Team WE','Invictus Gaming','FunPlus Phoenix','JD Gaming','Top Esports','Suning','LNG Esports','Bilibili Gaming','Weibo Gaming','LGD Gaming','Anyone s Legend'}
LCK={'SK Telecom T1','T1','Samsung Galaxy','Longzhu Gaming','KT Rolster','Gen.G','Gen.G eSports','Afreeca Freecs','Griffin','DAMWON Gaming','DWG KIA','DRX','Hanwha Life Esports','Hanwha Life eSports','Dplus KIA','Dplus Kia','Kingzone DragonX','BNK FearX','HANJIN BRION'}
bo=[]
def add(date,ev,a,s1,s2,b,src):
  if a in LCK and b in LPL: a,b,s1,s2=b,a,s2,s1
  if a in LPL and b in LCK and max(s1,s2)==3:
    bo.append({'date':date,'year':int(date[:4]),'event':ev,'lpl_team':a.replace(' s ',"'s "),'lpl_score':s1,'lck_score':s2,'lck_team':b,'lpl_won':int(s1>s2),'source':src})
for r in LP:
  if r['Date']>='2024-09-01' or not r['Team1Score']: continue
  ev=('Worlds ' if 'World' in r['Page'] else 'MSI ')+r['Date'][:4]
  add(r['Date'][:10],ev,r['Team1'],int(r['Team1Score']),int(r['Team2Score'] or 0),r['Team2'],'Leaguepedia MatchSchedule')
import io
t=max(pd.read_html(io.StringIO(open(F4+'m_Worlds_Main_Event_2024.html',encoding='utf8',errors='ignore').read())),key=lambda t:t.size)
for _,r in t.iterrows():
  s1,s2=map(int,r.Score.split(' - '));add(r.Date,'Worlds 2024',r['Unnamed: 1'],s1,s2,r['Unnamed: 3'],'gol.gg')
for _,r in S[S.tour.isin(['2025_Mid-Season_Invitational','Worlds_2025_Main_Event','MSI_2026','2026_First_Stand','Esports_World_Cup_2026','First_Stand_2025','Esports_World_Cup_2025'])].iterrows():
  if pd.isna(r.Patch): continue
  s1,s2=map(int,r.Score.split(' - '));add(r.Date,INT[r.tour],r.t1,s1,s2,r.t2,'gol.gg')
bo.sort(key=lambda x:x['date'])
json.dump(bo,open(O+'bo5_lpl_lck.json','w'),indent=0)
print(len(bo));[print(x) for x in bo if x['year']>=2024]
w=sum(x['lpl_won'] for x in bo if x['event'].startswith('Worlds'));n=sum(1 for x in bo if x['event'].startswith('Worlds'));print('Worlds Bo5',w,n-w)
t1=[x for x in bo if x['lck_team'] in ('T1','SK Telecom T1') and x['event'].startswith('Worlds')];print('T1 at Worlds vs LPL Bo5', sum(1-x['lpl_won'] for x in t1),'-',sum(x['lpl_won'] for x in t1))
print([ (x['date'],x['lpl_team'],x['lpl_score'],x['lck_score']) for x in t1])
# meta
ms=[]
for sc,f in [('All events, late season','meta_late.csv'),('LPL playoffs','meta_lpl.csv'),('LCK playoffs','meta_lck.csv'),('Worlds play-in','meta_pi.csv')]:
  d=pd.read_csv(f)
  for i,r in d.head(30).iterrows():
    ms.append({'key':f'{sc}|{r.Champion}','scope':sc,'champion':r.Champion,'picks':int(r.Picks),'bans':int(r.Bans),'presence':round(r.pres,1),'ban_rate':round(r['ban%'],1),'win_rate':None if pd.isna(r.wr) else round(r.wr,1),'rank':i+1})
json.dump(ms,open(O+'meta.json','w'),indent=0)
# pools and bans
BUFF=['Lillia','Lucian','Vayne','Neeko','Diana','Kennen','Kindred','Mordekaiser','Smolder','Tahm Kench','Swain']
NERF=['Ashe','Yunara','KSante','Ambessa','Cassiopeia']
pl=[];bn=[]
for t in NAME:
  k=K.get(t,t)
  for r in T[k]['roster'][:5]:
    for i,(c,n,wr,kda) in enumerate(r['champs'][:8]):
      pl.append({'key':f'{t}|{r["player"]}|{c}','team':t,'role':r['role'].title(),'player':r['player'],'champion':c,'games':n,'win_rate':wr,'kda':kda,'patch_note':'buffed on 26.20' if c in BUFF else ('nerfed on 26.20' if c in NERF else '')})
  for side,lst in [('Banned by them','banned_by'),('Banned against them','banned_vs')]:
    for i,(c,p) in enumerate(T[k].get(lst,[])):
      bn.append({'key':f'{t}|{side}|{c}','team':t,'side':side,'champion':c,'share':float(p.rstrip('%')),'rank':i+1})
json.dump(pl,open(O+'pools.json','w'),indent=0);json.dump(bn,open(O+'team_bans.json','w'),indent=0)
