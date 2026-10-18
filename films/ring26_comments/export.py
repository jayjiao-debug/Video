"""Pick the sharpest crop per unique comment, save it, and write a CSV with simple features for the awards."""
import json, re, csv, os
from PIL import Image
G = json.load(open('groups.json'))
os.makedirs('crops', exist_ok=True)
rows = []
def likes_num(s):
    if not s: return 0
    m = re.match(r'([\d.]+)\s*([万wW]?)', s); v = float(m.group(1)); return int(v * 10000) if m.group(2) else int(v)
for i, g in enumerate(G):
    best = max(g['members'], key=lambda m: m['sharp'])
    text = max((m['text'] for m in g['members']), key=len)
    name = next((m['name'] for m in sorted(g['members'], key=lambda m: -m['sharp']) if m['name']), '')
    lk = max((likes_num(m['likes']) for m in g['members']), default=0)
    im = Image.open(best['frame']).crop((0, best['top'], 1320, best['bot']))
    fn = f'c{i:04d}.jpg'; im.convert('RGB').save('crops/' + fn, quality=88)
    rows.append({'id': i, 'name': name, 'text': text, 'when': best['when'], 'prov': best['prov'], 'likes': lk,
                 'tags': len(re.findall(r'@\S', text)), 'height': best['bot'] - best['top'], 'seen': len(g['members']),
                 'passes': ''.join(sorted({m['frame'].split('/')[-1][:2] for m in g['members']})), 'crop': fn})
with open('comments_all.csv', 'w', newline='', encoding='utf-8-sig') as f:
    w = csv.DictWriter(f, fieldnames=list(rows[0].keys())); w.writeheader(); w.writerows(rows)
json.dump(rows, open('rows.json', 'w'), ensure_ascii=False)
print(len(rows), 'comments exported')
