# trim public/cut2/<id>_raw.png to its content, write <id>.png and src/cut2.json {id: {w, h, ax, ay, k}} (ax, ay = the feet, in image pixels)
import json, glob, os
from PIL import Image
J = 'src/cut2.json'; out = json.load(open(J)) if os.path.exists(J) else {}
for f in sorted(glob.glob('public/cut2/*_raw.png')):
    id = os.path.basename(f)[:-8]; im = Image.open(f).convert('RGBA'); bb = im.getchannel('A').point(lambda a: 255 if a > 4 else 0).getbbox()
    x0, y0, x1, y1 = max(0, bb[0] - 6), max(0, bb[1] - 6), min(im.width, bb[2] + 6), min(im.height, bb[3] + 6)
    im.crop((x0, y0, x1, y1)).save(f'public/cut2/{id}.png', optimize=True); os.remove(f)
    out[id] = {'w': x1 - x0, 'h': y1 - y0, 'ax': 2000 - x0, 'ay': 2200 - y0, 'k': 2}
    print(id, out[id])
json.dump(out, open(J, 'w'), indent=0)
