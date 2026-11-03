"""dump the bounding box of every top-level element of a drawing SVG (for picking the parts to animate).
usage: svg_bbox.py in.svg out.json"""
import sys, json, os
from playwright.sync_api import sync_playwright
src = open(sys.argv[1]).read()
with sync_playwright() as pw:
    br = pw.chromium.launch(); pg = br.new_page(viewport={'width': 1920, 'height': 1080})
    pg.set_content('<html><body style="margin:0">' + src + '</body></html>'); pg.wait_for_timeout(200)
    out = pg.evaluate('''() => { const s = document.querySelector('svg'); const r = [];
      [...s.children].forEach((e, i) => { let b = null; try { const q = e.getBBox(); b = [q.x, q.y, q.width, q.height]; } catch (_) {}
        r.push({i, tag: e.tagName, id: e.id || '', fill: e.getAttribute('fill') || '', stroke: e.getAttribute('stroke') || '', b}); });
      return {vb: s.getAttribute('viewBox'), w: s.getAttribute('width'), h: s.getAttribute('height'), els: r}; }''')
    br.close()
json.dump(out, open(sys.argv[2], 'w')); print(sys.argv[2], len(out['els']), out['vb'], out['w'], out['h'])
