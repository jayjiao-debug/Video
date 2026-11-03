"""ep57 explanation shots for 泰姬陵 (taj): two self-contained animated pages (see shots/BRIEF.md).
  taj_when  3.344 s  「穿越时间轴」 on blueprint (the shared device in petra.py): the camera trucks along the ruler from
            2026 back to 1632, 你 runs and skids onto the year, the counter lands on t = 1.672 (年开工), then the Taj
            draws itself in chalk (hist_c.taj proportions) with scaffolding round the dome, a ramp, an elephant
            hauling marble and tiny masons; its height is dimensioned.
  taj_what  5.016 s  taj_fort (hist_c), rebuilt in depth layers: the room wall and window, the view through it (sky,
            the far Taj, the river with a shimmering reflection, the fort's ramparts), the old emperor on the sill,
            你 beside him and a near pillar; a gold gaze line draws from his eyes to the Taj and lands on bar 2;
            你 shades its eyes to look, then puts a hand on its heart on bar 3; the camera trucks and pushes past.
usage: python3 taj.py OUTDIR   → OUTDIR/taj_when.html, OUTDIR/taj_what.html"""
import sys, os, math, json, random
SHOTS = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, SHOTS)
import petra as K
from petra import hc, INK, GOLD, CREAM, BAR, BEAT, G, keys, REST, page, chalk, timed, cline, silhouette, dim_v, CHALK

# ======================================================================================================
# taj_when
# ======================================================================================================
def taj_monument(cx, by):
    """the Taj as chalk line art (hist_c.taj's elevation) at the start of the works: scaffolding round the dome,
    a ramp up to the plinth with an elephant hauling a block, tiny masons; the height dimensioned"""
    k = 1.65; by = by - 20 * k; T = lambda x, y: (cx + x * k, by + y * k)
    out = timed(chalk(hc.taj(cx, by, k, hc.TAJ_DUSK, 2.6, detail=True), swk=1.0, deco_op=.5), BAR, BAR + 3 * BEAT + .05, .28)
    a0 = BAR + 2.1 * BEAT
    # scaffold hugging the dome: poles from the drum to above the dome's profile, ledgers, a few braces
    prof = hc.dome_side(0, -121, -200, 46, 53, -150)
    def dome_top(u):
        u = abs(u); best = -110
        for (x0, y0), (x1, y1) in zip(prof, prof[1:]):
            if x1 <= u <= x0: best = y0 + (y1 - y0) * (u - x0) / (x1 - x0 or 1)
        if u < prof[-2][0]: best = -200 + (prof[-2][1] + 200) * u / prof[-2][0]
        return best - 9
    xs = list(range(-60, 61, 15))
    for j, x in enumerate(xs):
        out.append(cline([T(x, -98), T(x, dome_top(x))], 1.8, .85, a=a0 + j * .03, d=.25))
    for j, y in enumerate(range(-112, -205, -16)):
        row = [x for x in xs if dome_top(x) <= y + 2]
        if len(row) > 1: out.append(cline([T(row[0] - 4, y), T(row[-1] + 4, y)], 1.6, .8, a=a0 + .12 + j * .04, d=.2))
    for j, (xa, xb, y) in enumerate(((-60, -45, -112), (15, 30, -128), (-30, -15, -160), (30, 45, -112))):
        out.append(cline([T(xa, y), T(xb, y - 16)], 1.4, .7, a=a0 + .3 + j * .04, d=.15))
    # the ramp up to the plinth, a block on a sled, the elephant hauling it, masons
    out.append(cline([T(-292, 20), T(-186, 0)], 2.2, .9, a=a0, d=.3))
    out.append(cline([T(-292, 22), T(-186, 22)], 1.6, .6, a=a0 + .05, d=.25))
    sx, sy = T(-226, 8)
    out.append(cline([(sx - 16, sy - 2), (sx + 16, sy - 8), (sx + 16, sy - 30), (sx - 16, sy - 24), (sx - 16, sy - 2)], 2, .9, a=a0 + .35, d=.2))
    ex, ey = T(-205, 4); el, E = hc.elephant(ex, ey, .3, 1, mahout=False)
    out.append(silhouette(el, BAR + 3 * BEAT, ex, ey))
    out.append(cline([(sx + 16, sy - 14), E['rear']], 1.4, .8, a=a0 + .5, d=.15))
    for i, (x, y, pose) in enumerate(((-30, -100, 'pick'), (40, -150, 'pick'), (-262, 14, 'carry'), (120, 0, 'carry'))):
        fx, fy = T(x, y); el, _ = hc.figure(fx, fy, .26, 1 if x < 0 else -1, robe='#fff', head='turban', pose=pose, tool=None, sw=1.2)
        out.append(silhouette(el, BAR + 3 * BEAT + (i + 1) * BEAT / 3, fx, fy))
    out += dim_v(cx - 200 * k, by, by - 232 * k, '73 m', BAR + 3 * BEAT, side=-1)
    return out

def taj_when():
    return K.when_page('taj_when', 1632, '', '年开工', 1590, [('民国', 1930), ('清', 1778), ('明', 1506)], '1632', '明末', taj_monument,
                       minor=10, mid=50, major=500, label_every=100)

# ======================================================================================================
# taj_what
# ======================================================================================================
def emperor_parts(ox, oy, k, fill='#1C1316', rim='#FFC088', sw=3):
    """hist_c.emperor_seat split in two: the body (cushion, bolster, staff, arm) and the head drawn upright,
    with the pivot it bows about (rotated in the page)"""
    T = hc.tf(ox, oy, k, 1); body = []
    body.append(hc.path(hc.curve(hc.TP(T, [(-26, 0), (-24, -9), (-12, -12), (30, -12), (38, -8), (38, 4), (30, 8), (-22, 8)])), '#2E1A1A', INK, sw))
    body.append(hc.path(hc.curve(hc.TP(T, [(-27, -34), (-19, -36), (-17, -24), (-18, -2), (-27, -2), (-30, -18)])), '#2E1A1A', INK, sw))
    body.append(hc.path(hc.curve(hc.TP(T, hc.EMP_SEAT)), fill, INK, sw))
    body += hc.bar(hc.TP(T, [(33, 6), (29, -74)]), '#2A1A16', max(3, .9 * k), sw * .8)
    c = T((29, -75)); body.append(f'<circle cx="{c[0]:.1f}" cy="{c[1]:.1f}" r="{2 * k:.1f}" fill="#2A1A16" stroke="{INK}" stroke-width="{sw * .8}"/>')
    body.append(hc.path(hc.curve(hc.TP(T, [(-1, -56), (5, -46), (18, -43), (29, -45), (30.5, -41), (18, -38), (4, -39), (-5, -48)])), '#281C21', INK, sw * .7))
    body.append(hc.path(hc.curve(hc.TP(T, [(9.5, -48), (10, -38), (9, -26)]), False), 'none', rim, max(2, .5 * k), 'opacity=".75"'))
    body.append(hc.path(hc.curve(hc.TP(T, [(18, -15.5), (28, -13), (32, -6)]), False), 'none', rim, max(2, .55 * k), 'opacity=".85"'))
    body.append(hc.path(hc.curve(hc.TP(T, [(29, -45), (30.5, -41)]), False), 'none', rim, max(2, .5 * k), 'opacity=".85"'))
    body.append(hc.line(hc.TP(T, [(30.6, -68), (32, 4)]), rim, max(1.5, .35 * k), 'opacity=".8"'))
    Tq = lambda p: T((p[0], p[1] + 16))
    head = hc.emp_head(Tq, (2, -79), 0, fill, rim, k, sw)
    return body, head, Tq((2, -79)), Tq((10.5, -86.5))

def taj_what():
    R = random.Random(5704)
    W, H = hc.W, hc.H
    defs = [hc.grad('wall', [(0, '#2E1512'), (.6, '#3E1B16'), (1, '#33160F')], 0, 0, 0, 1080, True),
            hc.grad('dusk', [(0, '#4C3E66'), (.35, '#8E5A78'), (.62, '#E0906C'), (.8, '#F6C08A'), (1, '#F7CC96')], 0, 260, 0, 700, True),
            hc.grad('river', [(0, '#E6A684'), (.5, '#B67E86'), (1, '#6E5272')], 0, 712, 0, 812, True),
            hc.grad('reveal', [(0, '#7E3A28'), (.5, '#B65A3C'), (1, '#9A4630')], 0, 280, 0, 900, True),
            hc.rgrad('halo', [(0, '#FFF2E0', .95), (.3, '#FFE0C0', .55), (1, '#F8C098', 0)]),
            hc.rgrad('spill', [(0, '#F49A64', .38), (.6, '#C8603C', .12), (1, '#8E3A24', 0)]),
            hc.rgrad('gold', [(0, '#FFE7A8', .9), (.5, '#F2C66E', .35), (1, '#F2C66E', 0)]),
            '<filter id="vblur" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur id="vblurS" stdDeviation="0"/></filter>',
            '<filter id="wob" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence id="wobT" type="fractalNoise" baseFrequency=".004 .09" numOctaves="1" seed="1"/>'
            '<feDisplacementMap in="SourceGraphic" scale="9" xChannelSelector="R" yChannelSelector="G"/></filter>',
            '<filter id="fgb" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5"/></filter>',
            '<filter id="glw" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>']
    # ---- the room wall: warm spill, blind arches, the alfiz frame and rosettes, the window's reveal ----
    wall = [f'<rect x="-600" y="-300" width="{W + 1200}" height="{H + 600}" fill="url(#wall)"/>', hc.ell(990, 600, 760, 520, 'url(#spill)')]
    for x in (-110, 110, 330):
        wall.append(hc.path(hc.arch_d(x, x + 150, 520, 430, 900), '#371812', '#24100D', 2.5))
        wall.append(hc.path(hc.arch_d(x + 18, x + 132, 540, 462, 900), 'none', '#4A2218', 2))
    fx0, fx1, fy0 = 520, 1462, 205
    wall.append(hc.poly([(fx0, fy0), (fx1, fy0), (fx1, 905), (fx0, 905)], '#4A2118', INK, 3))
    wall.append(hc.poly([(fx0 + 22, fy0 + 22), (fx1 - 22, fy0 + 22), (fx1 - 22, 905), (fx0 + 22, 905)], 'none', '#6A2E20', 3))
    for rx_ in (650, 1332):
        ry_ = 336
        wall.append(f'<circle cx="{rx_}" cy="{ry_}" r="34" fill="#55251A" stroke="{INK}" stroke-width="2.5"/>')
        for i in range(8):
            a = i * math.pi / 4; px, py = rx_ + 19 * math.cos(a), ry_ + 19 * math.sin(a)
            wall.append(hc.ell(px, py, 11, 6, '#6E3222', f'stroke="{INK}" stroke-width="2" transform="rotate({math.degrees(a):.0f} {px:.1f} {py:.1f})"'))
        wall.append(f'<circle cx="{rx_}" cy="{ry_}" r="9" fill="#8E4430" stroke="{INK}" stroke-width="2"/>')
        wall.append(hc.path(f'M{rx_ - 25},{ry_ - 22} A34,34 0 0 1 {rx_ + 25},{ry_ - 22}', 'none', '#A65038', 2.5, 'opacity=".7"'))
    x0, x1, spring, apex, sill = 590, 1392, 500, 262, 886
    inner = hc.cusp_arch(x0, x1, spring, apex, sill, 9, .3)
    sc_, ox_, oy_ = .93, 900, 700
    outer = hc.cusp_arch(ox_ + (x0 - ox_) * sc_, ox_ + (x1 - ox_) * sc_, oy_ + (spring - oy_) * sc_, oy_ + (apex - oy_) * sc_, sill, 9, .3)
    defs.append(f'<clipPath id="view"><path d="{outer}"/></clipPath>')
    wall.append(hc.path(inner, 'url(#reveal)', INK, 3))
    # ---- the view, in depth: sky (with birds), the far Taj, the river and its reflection, the fort's ramparts ----
    vsky = [f'<rect x="-200" y="-200" width="{W + 400}" height="{H + 400}" fill="url(#dusk)"/>']
    for y, op in ((560, .2), (618, .26), (668, .3)):
        vsky.append(hc.poly([(200, y), (1700, y - 16), (1700, y + 16), (200, y + 28)], '#FBE0C4', 'none', 0, f'opacity="{op}"'))
    vsky.append('<g id="birds"></g>')
    vtaj = [hc.ell(1132, 636, 270, 170, 'url(#halo)', 'id="halo"')]
    d_ = 'M200,718'; x = 200
    while x < 1700:
        w_ = R.uniform(18, 34); hh = R.uniform(5, 13) * (1.4 if R.random() < .15 else 1); d_ += f' Q{x + w_ / 2:.0f},{708 - hh * 2:.0f} {x + w_:.0f},708'; x += w_
    vtaj.append(hc.path(d_ + ' L1700,722 L200,722 Z', '#9A7690', '#7A5A76', 1.5))
    taj_el = hc.taj(1132, 702, .63, hc.TAJ_GLOW, 1.6, detail=False)
    vtaj += taj_el
    vriv = [hc.poly([(200, 716), (1700, 716), (1700, 830), (200, 830)], 'url(#river)', 'none', 0),
            f'<g opacity=".32" filter="url(#wob)"><g transform="translate(0 {2 * 716 + 4}) scale(1 -1)">' + ''.join(hc.taj(1132, 702, .63, hc.TAJ_GLOW, 1.2, detail=False)) + '</g></g>',
            '<g id="shim"></g>', '<g id="rip"></g>']
    vram = [hc.poly([(200, 820), (1700, 804), (1700, 960), (200, 960)], '#3A1A18', INK, 2.5)]
    for i in range(30):
        x = 210 + i * 50; y = hc.edge_y([(200, 820), (1700, 804)], x)
        vram.append(hc.path(f'M{x},{y + 1} L{x},{y - 18} Q{x + 14},{y - 30} {x + 28},{y - 18} L{x + 28},{y + 1} Z', '#3A1A18', INK, 2))
        vram.append(hc.line([(x + 2, y - 18), (x + 14, y - 27)], '#B86A4A', 2, 'opacity=".7"'))
    view = (f'<g clip-path="url(#view)"><g id="vwrap" filter="url(#vblur)">' + G('V_sky', vsky) + G('V_taj', vtaj) + G('V_riv', vriv) + G('V_ram', vram) + '</g></g>')
    wall2 = [hc.path(outer, 'none', INK, 2.5), hc.path(inner, 'none', INK, 3.5),
             hc.poly([(560, 886), (1424, 886), (1440, 906), (544, 906)], '#C8714E', INK, 3),
             hc.poly([(544, 906), (1440, 906), (1440, 934), (544, 934)], '#5A2618', INK, 3),
             hc.poly([(544, 934), (1440, 934), (1440, 1400), (544, 1400)], '#33160F', INK, 3)]
    # ---- the old emperor on the sill (his head bows about the nape), moved right to give 你 room ----
    body, head, piv, eye = emperor_parts(790, 878, 4.3)
    emp = body + [f'<g id="ehead">' + ''.join(head) + '</g>']
    # ---- a near pillar of the room (red sandstone, cusped bracket), out of focus ----
    px0, px1 = 300, 400
    pil = [hc.poly([(px0, -300), (px1, -300), (px1, 1400), (px0, 1400)], '#2C1310', INK, 3),
           hc.line([(px1 - 8, -300), (px1 - 8, 1400)], '#B86A4A', 5, 'opacity=".55"'),
           hc.poly([(px0 - 30, 300), (px1 + 30, 300), (px1 + 30, 330), (px0 - 30, 330)], '#3A1A14', INK, 3),
           hc.path(f'M{px1},{330} Q{px1 + 40},{340} {px1 + 54},{390} Q{px1 + 30},{372} {px1},{380} Z', '#3A1A14', INK, 3),
           hc.poly([(px0 - 20, 960), (px1 + 20, 960), (px1 + 20, 990), (px0 - 20, 990)], '#3A1A14', INK, 3)]
    D = dict(wall=10, sky=600, taj=300, riv=260, ram=60, emp=9.5, FIG=9.3, fg=5.2)
    world = [G('L_wall', wall + [view] + wall2), G('L_emp', emp), G('L_FIG', ['<g id="FIG"></g>']),
             G('L_fg', pil, 'filter="url(#fgb)"'), '<g id="gaze"></g>']
    fill = ('<linearGradient id="yfill" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFEBD6"/><stop offset=".5" stop-color="#EBCDBE"/>'
            '<stop offset="1" stop-color="#9C7476"/></linearGradient>')
    # 你: two steps in on the first beats, shades its eyes to look at the far Taj, then a hand on its heart on bar 3
    fig = keys((0, dict(REST, tilt=8)),
               (.9, dict(REST, tilt=10)),
               (1.3, dict(ra1=-60, ra2=200, tilt=12, lean=4), 'out'),
               (2.6, dict(ra1=-58, ra2=198, tilt=10, lean=5)),
               (3.05, dict(ra1=60, ra2=96, tilt=6, lean=2)),
               (3.344, dict(ra1=50, ra2=191, la1=122, la2=96, tilt=14, lean=0, squat=.15), 'out'),
               (5.016, dict(ra1=50, ra2=191, tilt=16, squat=.08)))
    cfg = dict(S0=1.45, P0=[700, 640], V=[960, 540], dref=10, D=D, piv=list(piv), eye=list(eye), taj=[1132, 600],
               cam=keys((0, dict(Z=0, zoom=1, TX=0, TY=0, roll=.8)),
                        (5.016, dict(Z=.5, zoom=1.03, TX=270, TY=0, roll=-.6), 'io')),
               fig=fig, feet0=[505, 886], feet1=[610, 886], sc=.84)
    js = 'const CFG=' + json.dumps(cfg) + ';\n' + r'''
const VL=[['V_sky','sky'],['V_taj','taj'],['V_riv','riv'],['V_ram','ram']];
window.render=function(t){
  const cam=track(CFG.cam,t), M={}, L={};
  for(const k of ['wall','emp','FIG','fg']){ L[k]=layerK(cam,CFG.D[k]); M[k]=rotM(L[k],cam.roll); $('L_'+k).setAttribute('transform',mstr(M[k])); }
  // the view moves with its own depth, expressed inside the wall (it is clipped by the window)
  for(const [id,k] of VL){ const Lv=layerK(cam,CFG.D[k]), s=Lv.k/L.wall.k; $(id).setAttribute('transform',`matrix(${s.toFixed(5)} 0 0 ${s.toFixed(5)} ${((Lv.ex-L.wall.ex)/L.wall.k).toFixed(2)} ${((Lv.ey-L.wall.ey)/L.wall.k).toFixed(2)})`); M[k]=rotM(Lv,cam.roll); }
  // rack focus: the far view sharpens as the gaze line reaches it
  $('vblurS').setAttribute('stdDeviation',f1(2.4*(1-ease((t-.7)/1.0))));
  // the emperor bows his head a little as he watches
  const bow=6+9*ease((t-2.2)/1.6)+1.2*Math.sin(t*1.7);
  $('ehead').setAttribute('transform',`rotate(${f1(bow)} ${CFG.piv[0]} ${CFG.piv[1]})`);
  // birds going home, flapping
  let bd=''; for(const [bx,by,ph] of [[760,380,0],[790,370,1.3],[1240,330,2.1],[1270,345,.7]]){ const x=bx-14*t, w=-7+6*Math.sin(t*9+ph);
    bd+=`<path d="M${f1(x-12)},${by} q6,${f1(w)} 12,0 q6,${f1(w)} 12,0" fill="none" stroke="#3A2A3A" stroke-width="2.5"/>`; }
  $('birds').innerHTML=bd;
  // the reflection shimmers: wobbling copy (seeded turbulence) + bright slices + drifting ripples
  $('wobT').setAttribute('seed',String(1+Math.floor(t*12)%50));
  const lit=.45+.35*ease((t-BAR)/.6);
  let sh=''; for(let i=0;i<9;i++){ const y=722+i*9, w=(30-i*1.6)*(1+.25*Math.sin(t*5+i)), x=1132+6*Math.sin(t*3.2+i*1.3);
    sh+=`<rect x="${f1(x-w/2)}" y="${y}" width="${f1(w)}" height="4.5" rx="2" fill="#FFF3E6" opacity="${f1(lit*(1-i/11))}"/>`; }
  $('shim').innerHTML=sh;
  let rp=''; const RR=rng(31); for(let i=0;i<30;i++){ const y=728+(i%10)*8, x0=220+RR()*1460, L=20+RR()*40, x=x0+((t*(10+RR()*14))%60)-30;
    rp+=`<path d="M${f1(x)},${y} h${f1(L)}" stroke="#FCE6D4" stroke-width="2" opacity="${f1(.3+.2*Math.sin(t*3+i))}"/>`; }
  $('rip').innerHTML=rp;
  $('halo').setAttribute('opacity',f1(.75+.35*kick(t,BAR,.8)+.1*Math.sin(t*2.4)));
  // 你: two steps in (on the beats), then the keyed poses, breathing
  const S=track(CFG.fig,t), wk=cl(t/(2*BEAT));
  const bx=lerp(CFG.feet0[0],CFG.feet1[0],ease(wk)), by=CFG.feet1[1];
  if(t<2*BEAT){ S.walk=Math.PI/2+Math.PI*t/BEAT; S.stride=10*(1-wk); S.lift+=6*Math.abs(Math.cos(S.walk)); }
  S.squat+=.03*Math.sin(t*2*Math.PI/1.6); S.squat+=.2*dip(t,3.344,.35); S.tilt+=1.2*Math.sin(t*2.2);
  const Y=you(S,bx,by,CFG.sc,'url(#yfill)');
  $('FIG').innerHTML=Y.svg;
  const top=apply(M.FIG,Y.top); bubble(t,[top[0],top[1]-12],.04,inFrame(top));
  // the gold gaze line: from his eyes to the Taj, drawn from 0.6 s, landing on the bar
  const a=apply(M.emp,CFG.eye), b=apply(M.taj,CFG.taj), g=cl((t-.55)/(BAR-.55)), gg=EASE.io(g);
  let gz='';
  if(g>0){ const ex=lerp(a[0],b[0],gg), ey=lerp(a[1],b[1],gg), fade=1-.35*ease((t-3.6)/1.2);
    gz+=`<path d="M${f1(a[0])},${f1(a[1])} L${f1(ex)},${f1(ey)}" stroke="#FFD27A" stroke-width="22" opacity="${f1(.55*fade)}" filter="url(#glw)" fill="none"/>`;
    gz+=`<path d="M${f1(a[0])},${f1(a[1])} L${f1(ex)},${f1(ey)}" stroke="#F2C66E" stroke-width="3" opacity="${f1(.8*fade)}" fill="none"/>`;
    gz+=`<path d="M${f1(a[0])},${f1(a[1])} L${f1(ex)},${f1(ey)}" stroke="#FFF1C8" stroke-width="8" stroke-linecap="round" stroke-dasharray="1 22" stroke-dashoffset="${f1(-t*60)}" opacity="${f1(fade)}" fill="none"/>`;
    if(g<1) gz+=`<circle cx="${f1(ex)}" cy="${f1(ey)}" r="9" fill="#FFF1C8"/><circle cx="${f1(ex)}" cy="${f1(ey)}" r="26" fill="url(#gold)"/>`;
    const r=kick(t,BAR,.7); if(t>=BAR) gz+=`<circle cx="${f1(b[0])}" cy="${f1(b[1]+10)}" r="${f1(60+130*(1-r))}" fill="none" stroke="#F2C66E" stroke-width="${f1(1+5*r)}" opacity="${f1(r)}"/>`;
    gz+=`<circle cx="${f1(b[0])}" cy="${f1(b[1]+10)}" r="${f1(80+20*Math.sin(t*3))}" fill="url(#gold)" opacity="${f1(.5*ease((t-BAR+.1)/.4))}"/>`;
  }
  $('gaze').innerHTML=gz;
  $('ctr').setAttribute('opacity','0'); filmFX(t,0); $('vig').setAttribute('opacity','.3');
};'''
    return page('taj_what', round(3 * BAR, 3), '\n'.join(world), js, ''.join(defs), fill, extra_hud=K.counter_svg())

if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else '.'
    os.makedirs(out, exist_ok=True)
    only = sys.argv[2:] or ['taj_when', 'taj_what']
    for name in only:
        html = {'taj_when': taj_when, 'taj_what': taj_what}[name]()
        open(os.path.join(out, name + '.html'), 'w').write(html); print('ok', name, len(html) // 1024, 'KB')
