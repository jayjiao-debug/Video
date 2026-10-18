import json, re, numpy as np
from PIL import Image
from rapidocr_onnxruntime import RapidOCR
eng = RapidOCR()
R = json.load(open('rows.json'))
for k, r in enumerate(R):
    im = Image.open('crops/' + r['crop']); w, h = im.size
    reg = np.asarray(im.crop((1040, max(0, h - 140), 1250, h)))
    res, _ = eng(reg)
    nums = [t for b, t, s in (res or []) if re.fullmatch(r'\d+(\.\d+)?\s*[万wW]?', t.strip())]
    v = 0
    if nums:
        m = re.match(r'([\d.]+)\s*([万wW]?)', nums[0].strip()); v = int(float(m.group(1)) * (10000 if m.group(2) else 1))
    r['likes'] = v
    if v and re.search(r'\s' + re.escape(nums[0].strip()) + r'$', r['text']): r['text'] = r['text'][: -len(nums[0].strip())].rstrip()
    if k % 300 == 0: print(k, flush=True)
json.dump(R, open('rows.json', 'w'), ensure_ascii=False)
import csv
with open('comments_all.csv', 'w', newline='', encoding='utf-8-sig') as f:
    w = csv.DictWriter(f, fieldnames=list(R[0].keys())); w.writeheader(); w.writerows(R)
print('likes>0', sum(r['likes'] > 0 for r in R)); print(sorted([(r['likes'], r['name'], r['text'][:30]) for r in R], reverse=True)[:15])
