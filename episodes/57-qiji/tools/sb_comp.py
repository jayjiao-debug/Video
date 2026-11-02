"""ep57 storyboard: put the D+ 可爱 「你」 character into each of the 7 tourist photos.
Real posers (chichen, machu, petra) are segmented (rembg u2net_human_seg) and inpainted (OpenCV, rough);
the character is drawn over the spot. Outputs per stop (scratchpad sb57/): clean_<k>.jpg (no person),
fig_<k>.png (character layer, RGBA, photo size), comp_<k>.jpg (photo + character).
Photos and renders are never committed (repo is public)."""
import sys, json, math, os
import numpy as np, cv2
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from you_figure import figure, DEFS
from playwright.sync_api import sync_playwright

S = '/tmp/claude-0/-home-claude/240969aa-174a-5914-92b5-d529595dbe80/scratchpad'
PH, OUT = f'{S}/ep57photos', f'{S}/sb57'
os.makedirs(OUT, exist_ok=True)

# poses in unit space (shoulder unit 120, origin = between the feet, y up is negative)
stand = dict(head=(0, -298), neck=(0, -262), l_shoulder=(-55, -250), r_shoulder=(55, -250), l_elbow=(-72, -185), r_elbow=(72, -185), l_wrist=(-78, -125), r_wrist=(78, -125),
             l_hip=(-22, -120), r_hip=(22, -120), l_knee=(-25, -60), r_knee=(25, -60), l_ankle=(-26, 0), r_ankle=(26, 0))
POSES = {
    'wave': dict(stand, r_elbow=(100, -300), r_wrist=(118, -360)),
    'shade': dict(stand, l_elbow=(-92, -292), l_wrist=(-30, -318), r_elbow=(90, -192), r_wrist=(44, -140), r_knee=(32, -60), r_ankle=(48, 0)),
    'tada': dict(stand, l_elbow=(-98, -212), l_wrist=(-152, -160), r_elbow=(98, -212), r_wrist=(152, -160), l_knee=(-34, -60), l_ankle=(-44, 0), r_knee=(34, -60), r_ankle=(44, 0)),
    'akimbo': dict(stand, l_elbow=(-94, -190), l_wrist=(-44, -138), r_elbow=(94, -190), r_wrist=(44, -138), l_knee=(-36, -60), l_ankle=(-48, 0), r_knee=(36, -60), r_ankle=(48, 0)),
    'sitback': dict(head=(0, -218), neck=(0, -182), l_shoulder=(-55, -170), r_shoulder=(55, -170), l_elbow=(-70, -112), r_elbow=(70, -112), l_wrist=(-74, -66), r_wrist=(74, -66),
                    l_hip=(-22, -60), r_hip=(22, -60), l_knee=(-84, -44), r_knee=(84, -44), l_ankle=(-36, -28), r_ankle=(36, -28)),
}
# per stop: pose, feet base (photo px), scale s (px per unit), tilt, face, removal box for a real poser
STOPS = {
    'greatwall': dict(pose='wave', base=(1760, 1705), s=2.45, tilt=6, face=True),
    'chichen': dict(pose='shade', base=(1610, 1935), s=3.35, tilt=-7, face=True, rm=(1300, 600, 1932, 2150), grow=45, occ=True),
    'machu': dict(pose='akimbo', base=(960, 1650), s=4.05, lean=-28, tilt=-4, face=True, rm=(430, 150, 1320, 1717), grow=71),
    'christ': dict(json=f'{S}/ep57ai/christ_pose_orig.json', tilt=6, face=True),
    'colosseum': dict(pose='akimbo', base=(2190, 1905), s=2.2, tilt=5, face=True),
    'petra': dict(pose='sitback', base=(1262, 2392), s=2.3, tilt=-4, face=False, rm=(980, 1780, 1560, 2470), grow=45),
    'taj': dict(pose='wave', base=(1880, 2330), s=3.9, tilt=6, face=True),
}

def joints(k, c):
    if 'json' in c:
        J = {a: tuple(v) for a, v in json.load(open(c['json']))['joints'].items()}
        return J, math.dist(J['l_shoulder'], J['r_shoulder']) * .95
    bx, by = c['base']; s = c['s']; ln = c.get('lean', 0)
    return {a: (bx + (x + ln * (-y / 330)) * s, by + y * s) for a, (x, y) in POSES[c['pose']].items()}, 120 * s

def person_mask(img, box, grow=31):
    from rembg import remove, new_session
    x0, y0, x1, y1 = box
    m = np.array(remove(Image.fromarray(img[y0:y1, x0:x1]), session=new_session('u2net_human_seg'), only_mask=True))
    full = np.zeros(img.shape[:2], np.uint8); full[y0:y1, x0:x1] = (m > 110).astype(np.uint8) * 255
    return cv2.dilate(full, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (grow, grow)))

def softfill(img, mask):
    """streak-free fill: mask-normalised blurs at growing scales (reads as soft background blur), plus grain"""
    w = (mask < 128).astype(np.float32); f = img.astype(np.float32); out = f.copy(); todo = mask >= 128
    for sg in (6, 12, 24, 48, 96, 192):
        k = int(sg * 3) | 1
        num = cv2.GaussianBlur(f * w[..., None], (k, k), sg); den = cv2.GaussianBlur(w, (k, k), sg)
        ok = todo & (den > .25); out[ok] = num[ok] / den[ok][..., None]; todo &= ~ok
        if not todo.any(): break
    out += np.random.default_rng(1).normal(0, 3.5, out.shape) * (mask[..., None] / 255.)
    a = cv2.GaussianBlur(mask, (31, 31), 0)[..., None] / 255.
    return (out * a + f * (1 - a)).clip(0, 255).astype(np.uint8)

def inpaint(img, mask, fast=False):
    """inpaint at half size inside the mask's bbox (FSR texture synthesis), paste back (rough clean plate)"""
    ys, xs = np.nonzero(mask); pad = 80
    x0, y0, x1, y1 = max(0, xs.min() - pad), max(0, ys.min() - pad), min(img.shape[1], xs.max() + pad), min(img.shape[0], ys.max() + pad)
    sub, sm = img[y0:y1, x0:x1], mask[y0:y1, x0:x1]
    h, w = sm.shape; hs, ws = h // 2, w // 2
    small, msk = cv2.resize(sub, (ws, hs), interpolation=cv2.INTER_AREA), cv2.resize(sm, (ws, hs))
    if fast:
        r = cv2.inpaint(small, msk, 12, cv2.INPAINT_TELEA)
    else:
        r = np.zeros_like(small); cv2.xphoto.inpaint(cv2.cvtColor(small, cv2.COLOR_RGB2BGR), (255 - msk), r, cv2.xphoto.INPAINT_FSR_FAST); r = cv2.cvtColor(r, cv2.COLOR_BGR2RGB)
    r = cv2.resize(r, (w, h), interpolation=cv2.INTER_CUBIC)
    a = cv2.GaussianBlur(sm, (21, 21), 0)[..., None] / 255.
    out = img.copy(); out[y0:y1, x0:x1] = (r * a + sub * (1 - a)).astype(np.uint8)
    return out

def main(keys):
    with sync_playwright() as pw:
        br = pw.chromium.launch(); pg = br.new_page()
        for k in keys:
            c = STOPS[k]; img = np.array(Image.open(f'{PH}/{k}.jpg').convert('RGB')); H, W = img.shape[:2]
            J, u = joints(k, c)
            svg = figure(J, u, face=c['face'], tilt=c['tilt'], tag=False)
            pg.set_viewport_size({'width': W, 'height': H})
            pg.set_content(f'<html><body style="margin:0;background:transparent"><svg id="f" width="{W}" height="{H}" style="display:block">{DEFS}{svg}</svg></body></html>')
            pg.wait_for_timeout(200); pg.locator('#f').screenshot(path=f'{OUT}/fig_{k}.png', omit_background=True)
            fig = np.array(Image.open(f'{OUT}/fig_{k}.png').convert('RGBA')).astype(np.float32) / 255.
            pm = None; clean = img
            if 'rm' in c:
                pm = person_mask(img, c['rm'], c.get('grow', 31))
                cover = cv2.erode((fig[..., 3] > .9).astype(np.uint8) * 255, np.ones((25, 25), np.uint8))
                left = cv2.bitwise_and(pm, 255 - cover)
                clean = softfill(img, pm)   # whole person: the fill must only pull from background
                cv2.imwrite(f'{OUT}/mask_{k}.png', pm)
            Image.fromarray(clean).save(f'{OUT}/clean_{k}.jpg', quality=92)
            if c.get('occ'):   # foreground plants stay in front of the character
                hsv = cv2.cvtColor(img, cv2.COLOR_RGB2HSV)
                green = ((hsv[..., 0] > 30) & (hsv[..., 0] < 95) & (hsv[..., 1] > 60)).astype(np.uint8)
                green[:1500] = 0
                if pm is not None: green[cv2.erode(pm, np.ones((41, 41), np.uint8)) > 0] = 0
                green = cv2.morphologyEx(green, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
                occ = cv2.GaussianBlur(green.astype(np.float32), (5, 5), 0)
                fig[..., 3] *= (1 - occ); Image.fromarray((fig * 255).astype(np.uint8)).save(f'{OUT}/fig_{k}.png')
            a = fig[..., 3:4]
            comp = clean.astype(np.float32) / 255. * (1 - a) + fig[..., :3] * a
            Image.fromarray((comp * 255).clip(0, 255).astype(np.uint8)).save(f'{OUT}/comp_{k}.jpg', quality=92)
            print('done', k, W, H, flush=True)
        br.close()

if __name__ == '__main__':
    main(sys.argv[1:] or list(STOPS))
