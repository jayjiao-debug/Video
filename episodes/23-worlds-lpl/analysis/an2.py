import pandas as pd,collections as C
G=pd.read_csv('games.csv',dtype={'patch':str})
G=G[G.patch.notna()]
G['win']=(G.res=='WIN').astype(int)
pn=lambda p:int(p.split('.')[1]) if p.startswith('16') else 0
G['pn']=G.patch.map(pn)
W=['GEN','HLE','T1','DK','BLG','AL','TES','IG','G2','MKOI','KC','TL','LYON','TSW','CFO','LOS','MVK']
LCK={'GEN','HLE','T1','DK'};LPL={'BLG','AL','TES','IG'}
# H2H game-level 2026 between Worlds teams (each pair counted from team A's log)
alias={'TLAW':'TL'}
G['vs2']=G.vs.replace(alias)
print('H2H games (2026, all events) — row team wins-losses vs column team')
hdr=['GEN','HLE','T1','DK','BLG','AL','TES','IG','G2','KC','TL','LYON','TSW']
print('%-5s'%''+''.join('%7s'%h for h in hdr))
for a in hdr:
  row=''
  for b in hdr:
    x=G[(G.team==a)&(G.vs2==b)]
    row+='%7s'%('-' if a==b or len(x)==0 else '%d-%d'%(x.win.sum(),len(x)-x.win.sum()))
  print('%-5s'%a+row)
# form
print('\nform: overall / patches 16.13+ (summer) / 16.16+ (late) / playoffs & intl since July')
for t in W:
  x=G[G.team==t];y=x[x.pn>=13];z=x[x.pn>=16]
  po=x[x.tour.str.contains('Playoffs|Grand Finals|Regional|MSI|World|Esports World Cup|Play-In')&(x.pn>=13)]
  f=lambda d:'%3d-%-3d %5.1f%%'%(d.win.sum(),len(d)-d.win.sum(),100*d.win.mean()) if len(d) else '-'
  print('%-5s %s | %s | %s | %s'%(t,f(x),f(y),f(z),f(po)))
# LPL vs LCK at game level 2026 among Worlds teams
x=G[G.team.isin(LPL)&G.vs2.isin(LCK)];print('\nLPL Worlds teams vs LCK Worlds teams 2026 games: %d-%d'%(x.win.sum(),len(x)-x.win.sum()))
print(x.groupby(['team','vs2']).win.agg(['sum','count']).to_string())
