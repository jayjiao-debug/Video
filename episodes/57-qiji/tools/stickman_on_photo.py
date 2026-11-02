"""ep57: draw the 「你」 stick man on a real photo from pose keypoints (read off an AI pose guide, then scaled to
the original photo). The output is the real photo + our drawing only. usage: stickman_on_photo.py photo pose.json out.jpg"""
import sys, json, base64
from playwright.sync_api import sync_playwright
from PIL import Image
photo, posef, out = sys.argv[1:4]; P = json.load(open(posef))
W, H = Image.open(photo).size; k = P.get('scale', 1.0)
J = {n: (x * k, y * k) for n, (x, y) in P['joints'].items()}
st = P.get('style', {}); sw = st.get('limb', 38) * k; tw = st.get('torso', 70) * k; hr = st.get('head', 50) * k
col = st.get('color', '#FFFFFF')
def L(*names): return 'M' + ' L'.join(f'{J[n][0]:.1f},{J[n][1]:.1f}' for n in names)
neck, hipc = J['neck'], ((J['l_hip'][0] + J['r_hip'][0]) / 2, (J['l_hip'][1] + J['r_hip'][1]) / 2)
limbs = [L('neck', 'l_shoulder', 'l_elbow', 'l_wrist'), L('neck', 'r_shoulder', 'r_elbow', 'r_wrist')]
if 'l_knee' in J: limbs += [L('l_hip', 'l_knee', 'l_ankle'), L('r_hip', 'r_knee', 'r_ankle')]
body = ''.join(f'<path d="{d}"/>' for d in limbs)
torso = f'<path d="M{neck[0]:.1f},{neck[1]:.1f} L{hipc[0]:.1f},{hipc[1]:.1f}" stroke-width="{tw:.1f}"/>'
hx, hy = J['head']; ts = st.get('tag', 46) * k; ty = hy - hr - ts * .55
tag = (f'<g filter="url(#ds)"><rect x="{hx - ts * .85:.1f}" y="{ty - ts * 1.25:.1f}" width="{ts * 1.7:.1f}" height="{ts * 1.25:.1f}" rx="{ts * .3:.1f}" fill="#FFF"/>'
       f'<path d="M{hx - ts * .18:.1f},{ty - 1:.1f} L{hx:.1f},{ty + ts * .28:.1f} L{hx + ts * .18:.1f},{ty - 1:.1f}Z" fill="#FFF"/></g>'
       f'<text x="{hx:.1f}" y="{ty - ts * .62:.1f}" font-family="Noto Sans CJK SC" font-weight="900" font-size="{ts * .9:.1f}" text-anchor="middle" dominant-baseline="central" fill="#1C1A18">你</text>')
b64 = base64.b64encode(open(photo, 'rb').read()).decode()
html = f'''<html><body style="margin:0"><div id="f" style="position:relative;width:{W}px;height:{H}px">
<img src="data:image/jpeg;base64,{b64}" style="position:absolute;width:{W}px;height:{H}px">
<svg style="position:absolute;left:0;top:0" width="{W}" height="{H}"><defs>
<filter id="ds" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="{6 * k:.1f}" dy="{9 * k:.1f}" stdDeviation="{9 * k:.1f}" flood-color="#000" flood-opacity=".38"/></filter></defs>
<g filter="url(#ds)"><g stroke="{col}" stroke-width="{sw:.1f}" stroke-linecap="round" stroke-linejoin="round" fill="none">{body}{torso}</g>
<circle cx="{hx:.1f}" cy="{hy:.1f}" r="{hr:.1f}" fill="{col}"/></g>{tag}</svg></div></body></html>'''
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': W, 'height': H}); pg.set_content(html); pg.wait_for_timeout(400); pg.evaluate('document.fonts.ready')
    pg.locator('#f').screenshot(path=out, type='jpeg', quality=92); b.close()
print('ok', out)
