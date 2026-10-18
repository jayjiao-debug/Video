import re,json,io,glob,os,pandas as pd
from bs4 import BeautifulSoup
D='/tmp/claude-0/-home-claude/131bbb47-cdc6-59f9-b59e-78638f10b457/scratchpad/ao/out/'
F3=D+'lol-worlds26-03/files/'
rd=lambda f:open(f,encoding='utf8',errors='ignore').read()
ABBR={'GEN':'Gen.G','AL':"Anyone s Legend",'TL':'Team Liquid','G2':'G2 Esports','LOS':'Los Grandes','TSW':'Team Secret Whales','HLE':'Hanwha Life Esports','BLG':'Bilibili Gaming','LYON':'LYON','MKOI':'Movistar KOI','T1':'T1','TES':'Top Esports','CFO':'CTBC Flying Oyster','IG':'Invictus Gaming','DK':'Dplus KIA','KC':'Karmine Corp','MVK':'MVK Esports'}
teams={}
for k in ABBR:
  s=BeautifulSoup(rd(F3+f'team_{k}.html'),'lxml');T={}
  for t in s.find_all('table'):
    x=t.get_text(' ',strip=True)
    if x.startswith('Most banned champions by'): T['banned_by']=list(zip([i['alt'] for i in t.find_all('img')][:6],re.findall(r'\d+%',x)[:6]))
    if x.startswith('Most banned champions against'): T['banned_vs']=list(zip([i['alt'] for i in t.find_all('img')][:6],re.findall(r'\d+%',x)[:6]))
    for tr in t.find_all('tr'):
      td=[c.get_text(' ',strip=True) for c in tr.find_all(['td','th'])]
      if len(td)==2 and td[0].endswith(':'): T.setdefault('kv',{})[td[0][:-1]]=td[1]
    if "player's stats" in x:
      ro=[];cur=None
      for tr in t.find_all('tr'):
        td=tr.find_all('td')
        if len(td)<8: 
          if 'line-up' in tr.get_text(): cur=tr.get_text(' ',strip=True)
          continue
        a=td[1].find('a');pid=re.search(r'player-stats/(\d+)/',a['href']).group(1) if a else None
        ch=[]
        for sp in td[7].find_all('span',class_='text-center'):
          st=sp.find('strong');tx=sp.get_text(' ',strip=True)
          wr=re.search(r'Winrate : ([\d.]+)%',tx);kda=re.search(r'KDA : ([\d.]+)',tx);n=re.findall(r'(\d+)\s*$',tx)
          ch.append([st.get_text(),int(n[-1]) if n else None,float(wr.group(1)) if wr else None,float(kda.group(1)) if kda else None])
        ro.append(dict(sec=cur,role=td[0].get_text(strip=True),player=a.get_text() if a else td[1].get_text(strip=True),pid=pid,kda=td[2].get_text(strip=True),kp=td[3].get_text(strip=True),vspm=td[4].get_text(strip=True),dmg=td[5].get_text(' ',strip=True),gold=td[6].get_text(' ',strip=True),champs=ch))
      T['roster']=ro
  teams[k]=T
json.dump(teams,open('teams.json','w'),ensure_ascii=False,indent=1)
# team game logs
G=[]
for k in ABBR:
  t=max(pd.read_html(io.StringIO(rd(F3+f'tml_{k}.html')),converters={'Patch':str}),key=lambda t:t.size)
  t.columns=['res','score','side','k','x1','x2','x3','vs','ok','ox1','ox2','ox3','dur','game','patch','week','tour'][:len(t.columns)]
  t['team']=k;G.append(t)
G=pd.concat(G);G.to_csv('games.csv',index=False)
# tournament series
S=[]
for f in glob.glob(F3+'m_*.html'):
  try: t=max(pd.read_html(io.StringIO(rd(f)),converters={'Patch':str}),key=lambda t:t.size)
  except ValueError: continue
  t=t.rename(columns={'Unnamed: 1':'t1','Unnamed: 3':'t2','Unnamed: 4':'round'});t['tour']=os.path.basename(f)[2:-5];S.append(t)
S=pd.concat(S);S.to_csv('series.csv',index=False)
# champions per tournament
C=[]
for f in glob.glob(F3+'c_*.html'):
  t=max(pd.read_html(io.StringIO(rd(f))),key=lambda t:t.size);t['tour']=os.path.basename(f)[2:-5];C.append(t)
C=pd.concat(C);C.to_csv('champs.csv',index=False)
TT=[]
for f in glob.glob(F3+'t_*.html'):
  t=max(pd.read_html(io.StringIO(rd(f))),key=lambda t:t.size);t['tour']=os.path.basename(f)[2:-5];TT.append(t)
pd.concat(TT).to_csv('teamstats_by_tour.csv',index=False)
print(len(G),len(S),len(C))
