"""ep57: creative tourist-pose options on the owner's new photos (greatwall2, petra2, machu2).
3 options per photo; light-matched fills (golden hour / candle-lit night / overcast); props (lantern), contact shadows.
Outputs scratchpad sb57/opt_<key>.jpg and opt_sheet_<photo>.jpg. Photos/renders are never committed."""
import sys, os, base64, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from you_figure import figure, DEFS
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw, ImageFont

S = '/tmp/claude-0/-home-claude/240969aa-174a-5914-92b5-d529595dbe80/scratchpad'
PH, OUT = f'{S}/ep57photos', f'{S}/sb57'

stand = dict(head=(0, -298), neck=(0, -262), l_shoulder=(-55, -250), r_shoulder=(55, -250), l_elbow=(-72, -185), r_elbow=(72, -185), l_wrist=(-78, -125), r_wrist=(78, -125),
             l_hip=(-22, -120), r_hip=(22, -120), l_knee=(-25, -60), r_knee=(25, -60), l_ankle=(-26, 0), r_ankle=(26, 0))
POSE = {
    'go': dict(stand, l_elbow=(-88, -318), l_wrist=(-112, -392), r_elbow=(88, -318), r_wrist=(112, -392), l_knee=(-30, -60), l_ankle=(-38, 0), r_knee=(32, -80), r_ankle=(46, -34)),
    'sitledge': dict(head=(0, -178), neck=(0, -142), l_shoulder=(-55, -130), r_shoulder=(55, -130), l_elbow=(-82, -60), l_wrist=(-104, -8), r_elbow=(100, -180), r_wrist=(118, -240),
                     l_hip=(-22, 0), r_hip=(22, 0), l_knee=(-52, 14), r_knee=(52, 14), l_ankle=(-46, 92), r_ankle=(58, 84)),
    'selfie': dict(stand, l_elbow=(-120, -190), l_wrist=(-210, -112), r_elbow=(96, -305), r_wrist=(70, -372)),
    'sitlantern': dict(head=(0, -218), neck=(0, -182), l_shoulder=(-55, -170), r_shoulder=(55, -170), l_elbow=(-74, -112), r_elbow=(74, -112), l_wrist=(-30, -80), r_wrist=(30, -80),
                       l_hip=(-22, -60), r_hip=(22, -60), l_knee=(-86, -42), r_knee=(86, -42), l_ankle=(-32, -26), r_ankle=(32, -26)),
    'wideback': dict(stand, l_elbow=(-100, -305), l_wrist=(-152, -350), r_elbow=(100, -305), r_wrist=(152, -350), l_knee=(-32, -60), l_ankle=(-42, 0), r_knee=(32, -60), r_ankle=(42, 0)),
    'wave': dict(stand, r_elbow=(100, -300), r_wrist=(118, -360)),
    'sitback': dict(head=(0, -218), neck=(0, -182), l_shoulder=(-55, -170), r_shoulder=(55, -170), l_elbow=(-80, -100), r_elbow=(80, -100), l_wrist=(-94, -30), r_wrist=(94, -30),
                    l_hip=(-22, -60), r_hip=(22, -60), l_knee=(-84, -44), r_knee=(84, -44), l_ankle=(-36, -28), r_ankle=(36, -28)),
    'jump': dict(stand, l_elbow=(-86, -318), l_wrist=(-114, -394), r_elbow=(86, -318), r_wrist=(114, -394), l_knee=(-48, -66), l_ankle=(-84, -34), r_knee=(48, -66), r_ankle=(84, -34)),
}
FILLS = ('<defs><linearGradient id="gwf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF3DE"/><stop offset=".55" stop-color="#F1E3D0"/><stop offset="1" stop-color="#B7B2B4"/></linearGradient>'
         '<linearGradient id="pf" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#FFD9A8"/><stop offset=".55" stop-color="#E2A77E"/><stop offset="1" stop-color="#A26C50"/></linearGradient>'
         '<linearGradient id="mf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#F1F1EF"/><stop offset="1" stop-color="#C3C8D0"/></linearGradient>'
         '<radialGradient id="glow"><stop offset="0" stop-color="#FFC77E" stop-opacity=".75"/><stop offset="1" stop-color="#FFB060" stop-opacity="0"/></radialGradient>'
         '<linearGradient id="bag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF8E6"/><stop offset="1" stop-color="#FFC983"/></linearGradient>'
         '<filter id="sb" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"/></filter></defs>')

# key: (photo, label, pose, base(feet/seat), s, tilt, face, fill, extras)
OPTS = [
    ('gwA', 'greatwall2', 'A 「出发！」背影冲下台阶', 'go', (1290, 1330), .82, 4, False, 'gwf', ['ground']),
    ('gwB', 'greatwall2', 'B 坐在城墙上挥手', 'sitledge', (640, 1180), 1.05, 7, True, 'gwf', ['seat']),
    ('gwC', 'greatwall2', 'C 自拍（照片就是自拍）', 'selfie', (2060, 2300), 4.0, 10, True, 'gwf', []),
    ('pA', 'petra2', 'A 抱着一盏灯坐在灯海里', 'sitlantern', (860, 2140), 1.55, 6, True, 'pf', ['ground', 'lantern']),
    ('pB', 'petra2', 'B 背影张开双臂，面对宝库', 'wideback', (870, 1900), 1.22, 0, False, 'pf', ['ground']),
    ('pC', 'petra2', 'C 小小一个站在门口挥手', 'wave', (1050, 1702), .4, 6, True, 'pf', ['ground']),
    ('mA', 'machu2', 'A 坐在草坡边，背影看风景', 'sitback', (430, 1625), 1.65, -5, False, 'mf', ['ground']),
    ('mB', 'machu2', 'B 跳起来（游客必拍）', 'jump', (380, 1665), 1.95, 6, True, 'mf', ['jump']),
    ('mC', 'machu2', 'C 背影张开双臂', 'wideback', (400, 1700), 1.95, 3, False, 'mf', ['ground']),
]

def svg_for(o):
    key, photo, label, pose, (bx, by), s, tilt, face, fill, ex = o
    lift = 150 if 'jump' in ex else 0
    J = {k: (bx + x * s, by - lift + y * s) for k, (x, y) in POSE[pose].items()}
    if pose == 'selfie':   # chest-up, legs out of frame
        J = {k: v for k, v in J.items() if 'knee' not in k and 'ankle' not in k}
    u = 120 * s; g = ''
    if 'ground' in ex: g += f'<ellipse cx="{bx}" cy="{by}" rx="{u * .45:.1f}" ry="{u * .07:.1f}" fill="#000" opacity=".32" filter="url(#sb)"/>'
    if 'seat' in ex: g += f'<ellipse cx="{bx}" cy="{by + u * .04:.1f}" rx="{u * .42:.1f}" ry="{u * .08:.1f}" fill="#000" opacity=".35" filter="url(#sb)"/>'
    if 'jump' in ex: g += f'<ellipse cx="{bx}" cy="{by}" rx="{u * .5:.1f}" ry="{u * .08:.1f}" fill="#000" opacity=".28" filter="url(#sb)"/>'
    g += figure(J, u, face=face, tilt=tilt, fill=f'url(#{fill})', tag=False)
    if 'lantern' in ex:
        lx, ly = (J['l_wrist'][0] + J['r_wrist'][0]) / 2, (J['l_wrist'][1] + J['r_wrist'][1]) / 2 + u * .02
        w, h = u * .5, u * .62
        g += f'<circle cx="{lx:.1f}" cy="{ly - h * .2:.1f}" r="{u * 1.1:.1f}" fill="url(#glow)"/>'
        top = ' '.join(f'L{lx - w / 2 + w * i / 6:.1f},{ly - h + (u * .05 if i % 2 else 0):.1f}' for i in range(7))
        g += (f'<path d="M{lx - w / 2:.1f},{ly:.1f} {top} L{lx + w / 2:.1f},{ly:.1f} Z" fill="url(#bag)"/>'
              f'<ellipse cx="{lx:.1f}" cy="{ly - h * .35:.1f}" rx="{w * .22:.1f}" ry="{h * .2:.1f}" fill="#FFFFFF" opacity=".8" filter="url(#sb)"/>')
    return g

with sync_playwright() as pw:
    br = pw.chromium.launch(); pg = br.new_page()
    for o in OPTS:
        key, photo = o[0], o[1]; path = f'{PH}/{photo}.jpg'; W, H = Image.open(path).size
        b64 = base64.b64encode(open(path, 'rb').read()).decode()
        pg.set_viewport_size({'width': W, 'height': H})
        pg.set_content(f'<html><body style="margin:0"><div id="f" style="position:relative;width:{W}px;height:{H}px;overflow:hidden"><img src="data:image/jpeg;base64,{b64}" style="position:absolute;width:{W}px;height:{H}px">'
                       f'<svg style="position:absolute;left:0;top:0" width="{W}" height="{H}">{DEFS}{FILLS}{svg_for(o)}</svg></div></body></html>')
        pg.wait_for_timeout(250); pg.locator('#f').screenshot(path=f'{OUT}/opt_{key}.jpg', type='jpeg', quality=90)
        print('done', key, flush=True)
    br.close()

# one sheet per photo: 3 options side by side, labelled
ft = ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc', 34)
for photo in ('greatwall2', 'petra2', 'machu2'):
    opts = [o for o in OPTS if o[1] == photo]; ims = [Image.open(f'{OUT}/opt_{o[0]}.jpg') for o in opts]
    th = 900 if ims[0].width < ims[0].height else 560
    ims = [i.resize((int(i.width * th / i.height), th), Image.LANCZOS) for i in ims]
    sheet = Image.new('RGB', (sum(i.width for i in ims) + 40 * 4 - 40 + 40, th + 120), '#1B1612'); d = ImageDraw.Draw(sheet); x = 40
    for o, im in zip(opts, ims):
        d.text((x, 24), o[2], font=ft, fill='#F6EBDD'); sheet.paste(im, (x, 90)); x += im.width + 40
    sheet.save(f'{OUT}/opt_sheet_{photo}.jpg', quality=88); print('sheet', photo, sheet.size)
