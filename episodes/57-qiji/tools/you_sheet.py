import sys, json, base64, math, glob
sys.path.insert(0, '/home/claude/video/episodes/57-qiji/tools')
from you_figure import figure, DEFS
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw, ImageFont
S = '/tmp/claude-0/-home-claude/240969aa-174a-5914-92b5-d529595dbe80/scratchpad/ep57ai'
P = json.load(open(S + '/christ_pose_orig.json')); J = {k: tuple(v) for k, v in P['joints'].items()}
u = math.dist(J['l_shoulder'], J['r_shoulder']) * .95
photo = '/tmp/claude-0/-home-claude/240969aa-174a-5914-92b5-d529595dbe80/scratchpad/ep57photos/christ.jpg'; W, H = Image.open(photo).size
b64 = base64.b64encode(open(photo, 'rb').read()).decode()
# poses for a mini character sheet (unit 120, origin feet centre)
def pose(base, d):
    return {k: (base[0] + v[0], base[1] + v[1]) for k, v in d.items()}
stand = dict(head=(0, -330), neck=(0, -262), l_shoulder=(-55, -250), r_shoulder=(55, -250), l_elbow=(-72, -185), r_elbow=(72, -185), l_wrist=(-78, -125), r_wrist=(78, -125),
             l_hip=(-22, -120), r_hip=(22, -120), l_knee=(-25, -60), r_knee=(25, -60), l_ankle=(-26, 0), r_ankle=(26, 0))
wave = dict(stand, r_elbow=(100, -300), r_wrist=(120, -380))
walk = dict(stand, l_elbow=(-40, -190), l_wrist=(-10, -135), r_elbow=(60, -195), r_wrist=(95, -150), l_knee=(-45, -62), l_ankle=(-70, 0), r_knee=(30, -60), r_ankle=(55, -5))
cheer = dict(stand, l_elbow=(-95, -320), l_wrist=(-110, -400), r_elbow=(95, -320), r_wrist=(110, -400), l_knee=(-40, -62), l_ankle=(-55, 0), r_knee=(40, -62), r_ankle=(55, 0))
sit = dict(stand, head=(0, -250), neck=(0, -182), l_shoulder=(-55, -170), r_shoulder=(55, -170), l_elbow=(-60, -110), r_elbow=(60, -110), l_wrist=(-40, -70), r_wrist=(40, -70),
           l_hip=(-22, -60), r_hip=(22, -60), l_knee=(-30, -50), r_knee=(30, -50), l_ankle=(-30, 0), r_ankle=(30, 0))
def sheet(face):
    g = ''.join(figure(pose((180 + i * 330, 560), p), 120, face=face, tag=(i == 0), tilt=t) for i, (p, t) in enumerate([(stand, 4), (wave, 8), (walk, -4), (cheer, 6), (sit, 5)]))
    return f'<svg width="1800" height="640" style="position:absolute;left:0;top:0">{DEFS}{g}</svg>'
with sync_playwright() as pw:
    br = pw.chromium.launch(); pg = br.new_page(viewport={'width': W, 'height': H}); outs = []
    for face in (False, True):
        pg.set_viewport_size({'width': W, 'height': H})
        pg.set_content(f'<html><body style="margin:0"><div id="f" style="position:relative;width:{W}px;height:{H}px"><img src="data:image/jpeg;base64,{b64}" style="position:absolute;width:{W}px;height:{H}px">'
                       f'<svg style="position:absolute;left:0;top:0" width="{W}" height="{H}">{DEFS}{figure(J, u, face=face)}</svg></div></body></html>')
        pg.wait_for_timeout(300); pg.evaluate('document.fonts.ready'); f = f'{S}/you_photo_{int(face)}.jpg'; pg.locator('#f').screenshot(path=f, type='jpeg', quality=90); outs.append(f)
        pg.set_viewport_size({'width': 1800, 'height': 640})
        pg.set_content(f'<html><body style="margin:0"><div id="f" style="position:relative;width:1800px;height:640px;background:linear-gradient(#EADBC4,#D8C3A5)">{sheet(face)}</div></body></html>')
        pg.wait_for_timeout(300); pg.evaluate('document.fonts.ready'); f = f'{S}/you_sheet_{int(face)}.jpg'; pg.locator('#f').screenshot(path=f, type='jpeg', quality=90); outs.append(f)
    br.close()
ft = ImageFont.truetype(glob.glob('/usr/share/fonts/**/NotoSansCJK*Bold*', recursive=True)[0], 34)
canvas = Image.new('RGB', (1840, 1700), '#F4F1EA'); d = ImageDraw.Draw(canvas)
for i, face in enumerate((False, True)):
    ph = Image.open(f'{S}/you_photo_{int(face)}.jpg').crop((0, 900, W, H)); ph = ph.resize((int(ph.width * 800 / ph.height * .55), int(800 * .55)))
    ph = Image.open(f'{S}/you_photo_{int(face)}.jpg').crop((0, 900, W, H)); ph.thumbnail((560, 560))
    sh = Image.open(f'{S}/you_sheet_{int(face)}.jpg'); sh.thumbnail((1240, 600))
    y = 20 + i * 850; d.text((20, y), ['D+ 优雅版（无脸）', 'D+ 可爱版（豆豆眼 + 微笑 + 腮红）'][i], font=ft, fill='#1C1A18')
    canvas.paste(ph, (20, y + 60)); canvas.paste(sh, (590, y + 60 + (ph.height - sh.height) // 2))
canvas.save(f'{S}/you_figure_v1.jpg', quality=88); print('ok')
