import sys, json, base64, math, glob
sys.path.insert(0, '/home/claude/video/episodes/57-qiji/tools')
from you_figure import figure, DEFS
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw, ImageFont
S = '/tmp/claude-0/-home-claude/240969aa-174a-5914-92b5-d529595dbe80/scratchpad/ep57ai'
P = json.load(open(S + '/christ_pose_orig.json')); J = {k: tuple(v) for k, v in P['joints'].items()}
u = math.dist(J['l_shoulder'], J['r_shoulder']) * .95
photo = S + '/../ep57photos/christ.jpg'; W, H = Image.open(photo).size; b64 = base64.b64encode(open(photo, 'rb').read()).decode()
V = {'A 深色「你」': dict(color='#2B2724'), 'B 红色「你」': dict(color='#D8483C'), 'C 金色圆章「你」': dict(color='#2B2724', badge='#F2C66E', size=.3)}
stand = dict(head=(0, -330), neck=(0, -262), l_shoulder=(-55, -250), r_shoulder=(55, -250), l_elbow=(-72, -185), r_elbow=(72, -185), l_wrist=(-78, -125), r_wrist=(78, -125),
             l_hip=(-22, -120), r_hip=(22, -120), l_knee=(-25, -60), r_knee=(25, -60), l_ankle=(-26, 0), r_ankle=(26, 0))
wave = dict(stand, r_elbow=(100, -300), r_wrist=(120, -380)); cheer = dict(stand, l_elbow=(-95, -320), l_wrist=(-110, -400), r_elbow=(95, -320), r_wrist=(110, -400), l_knee=(-40, -62), l_ankle=(-55, 0), r_knee=(40, -62), r_ankle=(55, 0))
def pose(base, d): return {k: (base[0] + v[0], base[1] + v[1]) for k, v in d.items()}
files = []
with sync_playwright() as pw:
    br = pw.chromium.launch(); pg = br.new_page()
    for name, ch in V.items():
        pg.set_viewport_size({'width': W, 'height': H})
        pg.set_content(f'<html><body style="margin:0"><div id="f" style="position:relative;width:{W}px;height:{H}px"><img src="data:image/jpeg;base64,{b64}" style="position:absolute;width:{W}px;height:{H}px">'
                       f'<svg style="position:absolute;left:0;top:0" width="{W}" height="{H}">{DEFS}{figure(J, u, face=True, tag=False, chest=ch)}</svg></div></body></html>')
        pg.wait_for_timeout(300); pg.evaluate('document.fonts.ready'); f1 = f'{S}/chest_{len(files)}_photo.jpg'; pg.locator('#f').screenshot(path=f1, type='jpeg', quality=90)
        pg.set_viewport_size({'width': 900, 'height': 520})
        g = ''.join(figure(pose((150 + i * 300, 500), p), 120, face=True, tag=False, tilt=t, chest=ch) for i, (p, t) in enumerate([(stand, 4), (wave, 8), (cheer, 6)]))
        pg.set_content(f'<html><body style="margin:0"><div id="f" style="position:relative;width:900px;height:520px;background:linear-gradient(#EADBC4,#D8C3A5)"><svg width="900" height="520">{DEFS}{g}</svg></div></body></html>')
        pg.wait_for_timeout(300); pg.evaluate('document.fonts.ready'); f2 = f'{S}/chest_{len(files)}_sheet.jpg'; pg.locator('#f').screenshot(path=f2, type='jpeg', quality=90)
        files.append((name, f1, f2))
    br.close()
ft = ImageFont.truetype(glob.glob('/usr/share/fonts/**/NotoSansCJK*Bold*', recursive=True)[0], 34)
c = Image.new('RGB', (1860, 1260), '#F4F1EA'); d = ImageDraw.Draw(c)
for i, (name, f1, f2) in enumerate(files):
    x = 20 + i * 615; d.text((x, 10), name, font=ft, fill='#1C1A18')
    ph = Image.open(f1).crop((0, 1100, W, H)); ph.thumbnail((600, 760)); c.paste(ph, (x, 60))
    sh = Image.open(f2).crop((0, 80, 900, 520)); sh.thumbnail((600, 400)); c.paste(sh, (x, 60 + ph.height + 20))
c.save(S + '/you_chest_v1.jpg', quality=88); print('ok')
