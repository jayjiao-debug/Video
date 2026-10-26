# gol.gg game pages (page-game + page-timeline) -> games25.json
import re, json, glob, os, sys
from bs4 import BeautifulSoup
D = sys.argv[1]
ABBR = {'Gen.G':'GEN','Invictus Gaming':'IG','Hanwha Life Esports':'HLE','Top Esports':'TES','Movistar KOI':'MKOI','Bilibili Gaming':'BLG',
        'Karmine Corp':'KC',"Anyone s Legend":'AL',"Anyone's Legend":'AL','Dplus KIA':'DK','G2 Esports':'G2','CTBC Flying Oyster':'CFO','Team Liquid':'TL',
        'T1':'T1','Los Grandes':'LOS','LYON':'LYON','Team Secret Whales':'TSW'}
out = []
for f in sorted(glob.glob(os.path.join(D, 'g*_page-game.html'))):
    gid = int(re.search(r'g(\d+)_', f).group(1)); h = open(f, encoding='utf8', errors='ignore').read()
    s = BeautifulSoup(h, 'lxml'); title = s.title.text if s.title else ''
    m = re.match(r'(.+?) vs (.+?) game (\d+) - (.+?) (ROUND\d|QUARTERFINALS|SEMIFINALS|FINALS)', title)
    if not m or 'Worlds 2026 Main Event' not in title: continue
    gt = re.search(r'Game Time<br/>\s*<h1>([\d:]+)</h1>', h); mins = int(gt.group(1).split(':')[0]) + int(gt.group(1).split(':')[1]) / 60
    sides = []
    for cls in ['blue-line-header', 'red-line-header']:
        hd = s.find('div', class_=cls); col = hd.find_parent('div', class_='col-12 col-sm-6') or hd.parent.parent
        name = hd.find('a').text.strip(); res = 'WIN' if 'WIN' in hd.get_text() else 'LOSS'
        box = {}
        for sp in col.find_all('span', class_='score-box'):
            k = sp.find('img')['alt']; box[k] = sp.get_text(strip=True)
        drakes = [i['alt'] for i in col.find_all('img', class_='champion_icon_XS')]
        rows = col.find_all('div', class_='row')
        bans = picks = []
        for r in rows:
            c2 = r.find('div', class_='col-2')
            if c2 and c2.get_text(strip=True).startswith('Bans'): bans = [i['alt'] for i in r.find_all('img', class_='champion_icon_medium')]
            if c2 and c2.get_text(strip=True).startswith('Picks'): picks = [i['alt'] for i in r.find_all('img', class_='champion_icon_medium')]
        fb = bool(col.find('img', alt='First Blood')); ft = bool(col.find('img', alt='First Tower'))
        g = box.get('Team Gold', '0').replace('k', ''); gold = float(g) * 1000 if g else 0
        sides.append(dict(team=ABBR.get(name, name), res=res, kills=int(box.get('Kills', 0) or 0), towers=int(box.get('Towers', 0) or 0),
                          dragons=int(box.get('Dragons', 0) or 0), barons=int(box.get('Nashor', 0) or 0), gold=gold, drakes=drakes,
                          bans=bans, picks=picks, first_blood=fb, first_tower=ft))
    # gold per minute from the timeline page (5 blue players then 5 red)
    gd = None; tl = os.path.join(D, f'g{gid}_page-timeline.html')
    if os.path.exists(tl):
        t = open(tl, encoding='utf8', errors='ignore').read(); i = t.find('var golddatas'); j = t.find('var csdatas')
        if i > 0:
            arr = [list(map(int, re.findall(r'-?\d+', a))) for a in re.findall(r'data: \[([^\]]*)\]', t[i:j])]
            if len(arr) == 10:
                n = min(len(a) for a in arr); blue = [sum(a[k] for a in arr[:5]) for k in range(n)]; red = [sum(a[k] for a in arr[5:]) for k in range(n)]
                gd = [b - r for b, r in zip(blue, red)]
    out.append(dict(id=gid, rnd=m.group(5), game=int(m.group(3)), minutes=round(mins, 2), blue=sides[0], red=sides[1], gold_diff_blue=gd))
json.dump(out, open('games25.json', 'w'), ensure_ascii=False, indent=1)
print(len(out)); [print(g['id'], g['rnd'], g['blue']['team'], g['blue']['res'], 'vs', g['red']['team'], g['red']['res'], g['minutes'], 'gd15', (g['gold_diff_blue'] or [None]*16)[15] if g['gold_diff_blue'] and len(g['gold_diff_blue'])>15 else None, g['blue']['picks'][:2]) for g in out]
