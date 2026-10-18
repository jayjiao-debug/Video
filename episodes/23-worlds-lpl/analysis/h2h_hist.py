import json,collections as C
F='/tmp/claude-0/-home-claude/131bbb47-cdc6-59f9-b59e-78638f10b457/scratchpad/ao/out/lol-worlds26-02/files/'
rows=[r['title'] for f in ['ms_intl_00000.json','ms_intl_00500.json'] for r in json.load(open(F+f))['cargoquery']]
LPL={'Royal Never Give Up','Edward Gaming','EDward Gaming','Team WE','Invictus Gaming','FunPlus Phoenix','JD Gaming','Top Esports','Suning','LNG Esports','Bilibili Gaming','Weibo Gaming','Gen.G?','Anyone\'s Legend','Ninjas in Pyjamas'}
LCK={'SK Telecom T1','T1','Samsung Galaxy','Longzhu Gaming','KT Rolster','Gen.G','Afreeca Freecs','Griffin','DAMWON Gaming','DWG KIA','DRX','Damwon Gaming','Hanwha Life Esports','Dplus KIA'}
reg=lambda t:'LPL' if t in LPL else 'LCK' if t in LCK else None
print(len(rows), sorted(set(r['Page'] for r in rows))[:3])
teams=C.Counter(t for r in rows for t in (r['Team1'],r['Team2']));
print([t for t,_ in teams.most_common(80) if not reg(t)][:50])
