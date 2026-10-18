import json, re, csv, os, shutil
import numpy as np
from PIL import Image
from rapidocr_onnxruntime import RapidOCR
eng = RapidOCR()
G = json.load(open('groups.json'))
os.makedirs('final', exist_ok=True)
rows = []
for i, g in enumerate(G):
    M = g['members']
    best = max(M, key=lambda m: (m['src'] == 'new', m['sharp']))
    text = max((m['text'] for m in M), key=len)
    name = next((m['name'] for m in sorted(M, key=lambda m: -len(m['name'])) if m['name']), '')
    when = next((m['when'] for m in M if m['src'] == 'new' and m['when']), best['when'])
    prov = best['prov'] or next((m['prov'] for m in M if m['prov']), '')
    im = Image.open(best['frame']).convert('RGB'); im = im.crop((0, best['top'], im.width, best['bot'])) if best['top'] or best['bot'] < im.height else im
    fn = f'c{i:04d}.jpg'; im.save('final/' + fn, quality=88)
    h = im.height; res, _ = eng(np.asarray(im.crop((1040, max(0, h - 140), 1250, h))))
    nums = [t.strip() for b, t, s in (res or []) if re.fullmatch(r'\d+(\.\d+)?\s*[万wW]?', t.strip())]
    likes = 0
    if nums:
        m = re.match(r'([\d.]+)\s*([万wW]?)', nums[0]); likes = int(float(m.group(1)) * (10000 if m.group(2) else 1))
        if re.search(r'\s' + re.escape(nums[0]) + r'$', text): text = text[:-len(nums[0])].rstrip()
    old_likes = max((int(m['likes']) for m in M if m['src'] == 'old' and str(m['likes']).isdigit()), default=0)
    rows.append({'id': i, 'name': name, 'text': text, 'when': when, 'prov': prov, 'likes': max(likes, old_likes), 'tags': len(re.findall(r'@\S', text)),
                 'height': h, 'seen': len(M), 'src': ''.join(sorted({m['src'] for m in M})), 'crop': fn})
    if i % 500 == 0: print(i, flush=True)
json.dump(rows, open('rows.json', 'w'), ensure_ascii=False)
with open('评论索引.csv', 'w', newline='', encoding='utf-8-sig') as f:
    w = csv.writer(f); w.writerow(['截图文件', '昵称', '评论内容(识别)', '时间(手机显示,南非时间)', 'IP属地', '点赞', '@人数', '来源'])
    for r in rows: w.writerow([r['crop'], r['name'], r['text'], r['when'], r['prov'], r['likes'], r['tags'], {'new': '慢速录屏', 'old': '第一次录屏', 'newold': '两次都有'}[r['src']]])
print(len(rows), 'exported')
