import pandas as pd
C=pd.read_csv('champs.csv')
C['g']=C.groupby('tour').Picks.transform('sum')/10
for c in ['Picks','Bans','Wins','Losses']: C[c]=pd.to_numeric(C[c],errors='coerce').fillna(0)
def agg(tours,lab,n=25):
  x=C[C.tour.isin(tours)];g=x.drop_duplicates('tour').g.sum()
  a=x.groupby('Champion')[['Picks','Bans','Wins','Losses']].sum()
  a['pres']=100*(a.Picks+a.Bans)/g;a['ban%']=100*a.Bans/g;a['wr']=100*a.Wins/a.Picks.where(a.Picks>0)
  a=a.sort_values('pres',ascending=False)
  print(f'== {lab}  ({g:.0f} games)');print(a.head(n).round(1).to_string());return a
late=['LPL_2026_Grand_Finals','LPL_2026_Regional_Finals','LCK_2026_Season_Playoffs','LEC_2026_Summer_Playoffs','LCS_2026_Summer_Playoffs','CBLOL_2026_Split_2_Playoffs','Demacia_Cup_Global_Invitational_2026','Worlds_2026_Play-In']
A=agg(late,'ALL late season 16.16-16.20',30)
L=agg(['LPL_2026_Grand_Finals','LPL_2026_Regional_Finals'],'LPL playoffs 16.16-17',20)
K=agg(['LCK_2026_Season_Playoffs'],'LCK playoffs 16.16',20)
P=agg(['Worlds_2026_Play-In'],'Worlds play-in 16.20',20)
M=agg(['MSI_2026','Esports_World_Cup_2026'],'MSI+EWC 16.13',15)
A.to_csv('meta_late.csv');L.to_csv('meta_lpl.csv');K.to_csv('meta_lck.csv');P.to_csv('meta_pi.csv')
