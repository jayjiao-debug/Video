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
L1, L2 = 64, 60   # upper arm / forearm in units: the standing pose's lengths, so raised arms never stretch
def arms(P, r=None, l=None, mirror=True):
    """set elbows/wrists from screen angles (deg; 0 = right, 90 = down) with fixed segment lengths"""
    P = dict(P); nk = P['neck']; hc = ((P['l_hip'][0] + P['r_hip'][0]) / 2, (P['l_hip'][1] + P['r_hip'][1]) / 2)
    ry = nk[1] + math.dist(nk, hc) * .14
    if l is None and r is not None and mirror: l = (180 - r[0], 180 - r[1])
    for side, ang, sx in (('r', r, 1), ('l', l, -1)):
        if ang is None: continue
        x0 = nk[0] + sx * 36; e = (x0 + L1 * math.cos(math.radians(ang[0])), ry + L1 * math.sin(math.radians(ang[0])))
        P[f'{side}_elbow'] = e; P[f'{side}_wrist'] = (e[0] + L2 * math.cos(math.radians(ang[1])), e[1] + L2 * math.sin(math.radians(ang[1])))
    return P
sitbase = dict(head=(0, -218), neck=(0, -182), l_shoulder=(-55, -170), r_shoulder=(55, -170), l_hip=(-22, -60), r_hip=(22, -60))
ledge = dict(head=(0, -178), neck=(0, -142), l_shoulder=(-55, -130), r_shoulder=(55, -130), l_hip=(-22, 0), r_hip=(22, 0), l_knee=(-52, 14), r_knee=(52, 14), l_ankle=(-46, 92), r_ankle=(58, 84))
POSE = {
    'go': arms(dict(stand, l_knee=(-30, -60), l_ankle=(-38, 0), r_knee=(32, -80), r_ankle=(46, -34)), r=(-62, -75)),
    'sitledge': arms(ledge, r=(-55, -88), l=(115, 100)),
    'selfie': arms(stand, r=(-55, -95), l=(125, 118)),
    'selfie_pt': arms(stand, r=(-60, -66), l=(125, 118)),
    'selfie_cheek': arms(stand, r=(-20, -100), l=(125, 115)),
    'selfie_peak': arms(stand, r=(55, 62), l=(-150, -160)),
    'sitlantern': arms(dict(sitbase, l_knee=(-86, -42), r_knee=(86, -42), l_ankle=(-32, -26), r_ankle=(32, -26)), r=(75, 165)),
    'wideback': arms(dict(stand, l_knee=(-32, -60), l_ankle=(-42, 0), r_knee=(32, -60), r_ankle=(42, 0)), r=(-35, -45)),
    'wave': arms(stand, r=(-55, -88), l=(100, 92)),
    'sitback': arms(dict(sitbase, l_knee=(-84, -44), r_knee=(84, -44), l_ankle=(-36, -28), r_ankle=(36, -28)), r=(70, 80)),
    'jump': arms(dict(stand, l_knee=(-48, -66), l_ankle=(-84, -34), r_knee=(48, -66), r_ankle=(84, -34)), r=(-62, -75)),
}
FILLS = ('<defs><linearGradient id="gwf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF3DE"/><stop offset=".55" stop-color="#F1E3D0"/><stop offset="1" stop-color="#B7B2B4"/></linearGradient>'
         '<linearGradient id="pf" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#FFD9A8"/><stop offset=".55" stop-color="#E2A77E"/><stop offset="1" stop-color="#A26C50"/></linearGradient>'
         '<linearGradient id="mf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#F1F1EF"/><stop offset="1" stop-color="#C3C8D0"/></linearGradient>'
         '<radialGradient id="glow"><stop offset="0" stop-color="#FFC77E" stop-opacity=".75"/><stop offset="1" stop-color="#FFB060" stop-opacity="0"/></radialGradient>'
         '<linearGradient id="bag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF8E6"/><stop offset="1" stop-color="#FFC983"/></linearGradient>'
         '<filter id="sb" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"/></filter></defs>')

# key: (photo, label, pose, base(feet/seat), s, tilt, face, fill, extras)
OPTS = [
    ('gwA', 'greatwall2', 'A 「出发！」背影冲下台阶', 'go', (1290, 1330), .82, 4, False, 'gwf', ['ground'], 'greatwall2'),
    ('gwB', 'greatwall2', 'B 坐在城墙上挥手', 'sitledge', (640, 1180), 1.05, 7, True, 'gwf', ['seat'], 'greatwall2'),
    ('gwC', 'greatwall2', 'C 自拍（照片就是自拍）', 'selfie', (2060, 2300), 4.0, 10, True, 'gwf', [], 'greatwall2'),
    ('pA', 'petra2', 'A 抱着一盏灯坐在灯海里', 'sitlantern', (860, 2140), 1.55, 6, True, 'pf', ['ground', 'lantern'], 'petra2'),
    ('pB', 'petra2', 'B 背影张开双臂，面对宝库', 'wideback', (870, 1900), 1.22, 0, False, 'pf', ['ground'], 'petra2'),
    ('pC', 'petra2', 'C 小小一个站在门口挥手', 'wave', (1050, 1702), .4, 6, True, 'pf', ['ground'], 'petra2'),
    ('mA', 'machu2', 'A 坐在草坡边，背影看风景', 'sitback', (430, 1625), 1.65, -5, False, 'mf', ['ground'], 'machu2'),
    ('mB', 'machu2', 'B 跳起来（游客必拍）', 'jump', (400, 1690), 1.95, 6, True, 'mf', ['jump'], 'machu2'),
    ('mC', 'machu2', 'C 背影张开双臂', 'wideback', (400, 1700), 1.95, 3, False, 'mf', ['ground'], 'machu2'),
    # selfie vibes (owner 23:08: likes 长城 C)
    ('s1', 'greatwall2', '自拍 1 · 右下，另一只手比耶', 'selfie', (2060, 2300), 4.0, 10, True, 'gwf', [], 'selfie_gw'),
    ('s2', 'greatwall2', '自拍 2 · 左下，指着身后的城楼', 'selfie_pt', (560, 2260), 3.7, 8, True, 'gwf', [], 'selfie_gw'),
    ('s3', 'greatwall2', '自拍 3 · 大头特写，手举在脸边', 'selfie_cheek', (1990, 2700), 5.4, 14, True, 'gwf', [], 'selfie_gw'),
    ('s4', 'petra2', '自拍 · 佩特拉，灯海在身后', 'selfie', (1330, 3150), 4.0, 8, True, 'pf', [], 'selfie_more'),
    ('s5', 'machu2', '自拍 · 马丘比丘，指着身后的山', 'selfie_peak', (2180, 2350), 3.7, -8, True, 'mf', [], 'selfie_more'),
]

def svg_for(o):
    key, photo, label, pose, (bx, by), s, tilt, face, fill, ex, grp = o
    lift = 150 if 'jump' in ex else 0
    J = {k: (bx + x * s, by - lift + y * s) for k, (x, y) in POSE[pose].items()}
    if pose.startswith('selfie'):   # chest-up, legs out of frame
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

if __name__ == '__main__':
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

    # one sheet per group: options side by side at a common height, labelled
    ft = ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc', 34)
    for grp in dict.fromkeys(o[-1] for o in OPTS):
        opts = [o for o in OPTS if o[-1] == grp]; ims = [Image.open(f'{OUT}/opt_{o[0]}.jpg') for o in opts]
        th = 900 if all(i.width < i.height for i in ims) else (760 if any(i.width < i.height for i in ims) else 560)
        ims = [i.resize((int(i.width * th / i.height), th), Image.LANCZOS) for i in ims]
        sheet = Image.new('RGB', (sum(i.width for i in ims) + 40 * (len(ims) + 1), th + 120), '#1B1612'); d = ImageDraw.Draw(sheet); x = 40
        for o, im in zip(opts, ims):
            d.text((x, 24), o[2], font=ft, fill='#F6EBDD'); sheet.paste(im, (x, 90)); x += im.width + 40
        sheet.save(f'{OUT}/opt_sheet_{grp}.jpg', quality=88); print('sheet', grp, sheet.size)
