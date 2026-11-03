"""ep57 马丘比丘 self-timer jump (owner 2026-11-03 11:13): the figure stands, anticipates on the countdown (crouches, arms
swing down), springs off on 「1」, and is at the top of the jump on the downbeat, where the camera flashes and the photo is
taken. The figure is the same rig and pose as the photo (opt_comp 'mB' / you_figure), drawn straight at film size, one image
per frame of the countdown bar, cached next to the demo frames (renders are never committed).

frames(t0, tc, beat, fps, out) -> (list of RGBA PIL images for t0 <= t < tc, list of head offsets (dx, dy) from the peak pose)"""
import os, math
from PIL import Image
from playwright.sync_api import sync_playwright
from opt_comp import POSE, stand, arms, FILLS, OPTS
from you_figure import figure, DEFS

O = {o[0]: o for o in OPTS}
_, PHOTO, _, _, (BX, BY), SC, TILT, FACE, FILL, _, _ = O['mB']
CROP = (0, 268, 2576, 1717); K = 1920 / (CROP[2] - CROP[0])       # photo px -> film px
LIFT = 150                                                          # the photo's jump height (photo px), as in opt_comp.svg_for

crouch = dict(head=(0, -236), neck=(0, -200), l_shoulder=(-55, -188), r_shoulder=(55, -188),
              l_hip=(-24, -72), r_hip=(24, -72), l_knee=(-48, -40), r_knee=(48, -40), l_ankle=(-28, 0), r_ankle=(28, 0))
CROUCH = arms(crouch, r=(56, 70))                                   # arms swung down and back, ready to fling up
DIP = {k: (x, y + 8) for k, (x, y) in CROUCH.items() if 'ankle' not in k}; DIP.update(l_ankle=CROUCH['l_ankle'], r_ankle=CROUCH['r_ankle'])
reach = dict(head=(0, -312), neck=(0, -276), l_shoulder=(-55, -264), r_shoulder=(55, -264),
             l_hip=(-22, -132), r_hip=(22, -132), l_knee=(-24, -68), r_knee=(24, -68), l_ankle=(-22, -6), r_ankle=(22, -6))
TAKEOFF = arms(reach, r=(-72, -84))                                 # stretched on the toes, arms flung up
STAND = dict(stand)
JUMP = POSE['jump']

def ease(x): x = min(1, max(0, x)); return x * x * (3 - 2 * x)
def lerpP(a, b, u): return {k: (a[k][0] + (b[k][0] - a[k][0]) * u, a[k][1] + (b[k][1] - a[k][1]) * u) for k in a}

def pose_at(s, beat):
    """s = seconds since t0 (the bar of the countdown: 3 on beat 1, 2 on beat 2, 1 on beat 3, the photo on beat 4)"""
    b = s / beat
    if b < 1.0: return STAND, 0.0
    if b < 2.5: return lerpP(STAND, CROUCH, ease((b - 1.0) / 1.5)), 0.0          # anticipation through 「3」「2」
    if b < 3.0: return lerpP(CROUCH, DIP, ease((b - 2.5) / .5)), 0.0             # wind-up: the last little dip before 「1」
    tk = .10                                                                     # push-off: 0.1 s from the dip to full stretch
    if s < 3 * beat + tk: u = (s - 3 * beat) / tk; return lerpP(DIP, TAKEOFF, u * u), 0.0
    tau = min(1.0, (s - 3 * beat - tk) / (beat - tk))                           # airborne: decelerating rise, top exactly on beat 4
    return lerpP(TAKEOFF, JUMP, ease(min(1, tau * 1.5))), LIFT * (1 - (1 - tau) ** 2)

def svg_at(P, lift):
    u = 120 * SC; L = lift / LIFT
    J = {k: (BX + x * SC, BY - lift + y * SC) for k, (x, y) in P.items()}
    sh = (f'<ellipse cx="{BX}" cy="{BY}" rx="{u * (.45 + .05 * L):.1f}" ry="{u * (.07 + .01 * L):.1f}" fill="#000" '
          f'opacity="{.32 - .04 * L:.3f}" filter="url(#sb)"/>')
    return sh + figure(J, u, face=FACE, tilt=TILT, fill=f'url(#{FILL})', tag=False), J['head']

def frames(t0, tc, beat, fps, out):
    os.makedirs(out, exist_ok=True); n = int(round((tc - t0) * fps)); ims, offs = [], []
    _, head_pk = svg_at(JUMP, LIFT)
    todo = []
    for i in range(n):
        P, lift = pose_at(i / fps, beat); g, head = svg_at(P, lift)
        offs.append(((head[0] - head_pk[0]) * K, (head[1] - head_pk[1]) * K)); todo.append((f'{out}/j{i:03d}.png', g))
    if any(not os.path.exists(p) for p, _ in todo):
        with sync_playwright() as pw:
            br = pw.chromium.launch(); pg = br.new_page(viewport={'width': 1920, 'height': 1080})
            for p, g in todo:
                pg.set_content(f'<html><body style="margin:0;background:transparent"><svg id="f" width="1920" height="1080" style="display:block">{DEFS}{FILLS}'
                               f'<g transform="scale({K:.6f}) translate({-CROP[0]},{-CROP[1]})">{g}</g></svg></body></html>')
                pg.wait_for_timeout(30); pg.locator('#f').screenshot(path=p, omit_background=True)
            br.close()
    for p, _ in todo: ims.append(Image.open(p).convert('RGBA'))
    return ims, offs
