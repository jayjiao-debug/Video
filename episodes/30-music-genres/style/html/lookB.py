"""Look B: 唱片封套 (Record Sleeve) - the beat grid wrapped onto a record: 4 rings x 16 steps, read like a clock."""
import math, sys
sys.path.insert(0, '/home/claude/video/episodes/30-music-genres/style/html')
from common import *

BG, BG2 = '#1F5C4A', '#123A2F'
CREAM = '#F5E8CF'
COL = {'dong': '#FF7A33', 'da': '#F7C744', 'ci': '#F5E8CF', 'sig': '#FF6F9C'}
RING = {'dong': (282, 354), 'da': (230, 274), 'ci': (178, 222), 'sig': (126, 170)}
ORDER = ['dong', 'da', 'ci', 'sig']  # outer -> inner
CX, CY, RR = 960, 440, 396


def pol(r, deg):
    a = math.radians(deg)
    return CX + r * math.cos(a), CY + r * math.sin(a)


def ang(i):
    return -90 + i * 22.5


def sector(r0, r1, a0, a1):
    x0, y0 = pol(r1, a0); x1, y1 = pol(r1, a1); x2, y2 = pol(r0, a1); x3, y3 = pol(r0, a0)
    return (f'M{x0:.1f},{y0:.1f} A{r1},{r1} 0 0,1 {x1:.1f},{y1:.1f} L{x2:.1f},{y2:.1f} '
            f'A{r0},{r0} 0 0,0 {x3:.1f},{y3:.1f} Z')


def defs():
    return '''<defs>
<filter id="paper" x="0" y="0" width="100%" height="100%">
  <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="2" seed="3"/>
  <feColorMatrix values="0 0 0 0 1  0 0 0 0 .95  0 0 0 0 .85  0 0 0 .07 0"/>
</filter>
<filter id="g6" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
<filter id="g14" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="14"/></filter>
<filter id="g30" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="30"/></filter>
<filter id="shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#04140f" flood-opacity=".6"/></filter>
<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#256A56"/><stop offset=".62" stop-color="#1F5C4A"/><stop offset="1" stop-color="#103329"/>
</linearGradient>
<radialGradient id="vinyl" cx="50%" cy="50%" r="50%">
  <stop offset="0" stop-color="#232327"/><stop offset=".8" stop-color="#151518"/><stop offset="1" stop-color="#0d0d0f"/>
</radialGradient>
<radialGradient id="label" cx="40%" cy="35%" r="70%">
  <stop offset="0" stop-color="#FF9152"/><stop offset="1" stop-color="#F0662A"/>
</radialGradient>
<radialGradient id="hot"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
</defs>'''


def backdrop():
    s = [f'<rect width="{W}" height="{H}" fill="url(#bg)"/>']
    # 70s sleeve stripes: concentric bands behind the record
    for k, (c, op) in enumerate([('#F7C744', .85), ('#FF7A33', .85), ('#FF6F9C', .75), (CREAM, .5)]):
        r = RR + 40 + k * 34
        s.append(f'<circle cx="{CX}" cy="{CY}" r="{r}" fill="none" stroke="{c}" stroke-width="20" opacity="{op*0.32}"/>')
    s.append(f'<rect y="790" width="{W}" height="{H-790}" fill="{BG2}" opacity=".55"/>')
    s.append(f'<rect width="{W}" height="{H}" filter="url(#paper)"/>')
    return ''.join(s)


def record(pat, play, label, states=None, pops=()):
    states = states or {}
    s = [f'<circle cx="{CX}" cy="{CY}" r="{RR}" fill="url(#vinyl)" filter="url(#shadow)"/>']
    for r in range(118, RR - 4, 4):
        s.append(f'<circle cx="{CX}" cy="{CY}" r="{r}" fill="none" stroke="#fff" stroke-width="1" opacity="{.025 + .02*((r//4)%2)}"/>')
    # sheen
    for a0, a1, op in [(-60, -20, .10), (120, 160, .08)]:
        s.append(f'<path d="{sector(124, RR-6, a0, a1)}" fill="#fff" opacity="{op}" filter="url(#g30)"/>')
    # beat dividers
    for b in range(4):
        a = ang(b * 4) - 11.25
        x0, y0 = pol(130, a); x1, y1 = pol(RR - 2, a)
        s.append(f'<line x1="{x0:.1f}" y1="{y0:.1f}" x2="{x1:.1f}" y2="{y1:.1f}" stroke="{CREAM}" stroke-width="2" opacity=".28"/>')
    # playhead trail
    pa = ang(play)
    for k in range(18):
        s.append(f'<path d="{sector(128, RR-4, pa-11.25-2.2*(k+1), pa-11.25-2.2*k)}" fill="{CREAM}" opacity="{.10*(1-k/18):.3f}"/>')
    # playhead hand
    x0, y0 = pol(124, pa); x1, y1 = pol(280, pa)
    s.append(f'<line x1="{x0:.1f}" y1="{y0:.1f}" x2="{x1:.1f}" y2="{y1:.1f}" stroke="#fff" stroke-width="10" opacity=".35" filter="url(#g6)"/>')
    s.append(f'<line x1="{x0:.1f}" y1="{y0:.1f}" x2="{x1:.1f}" y2="{y1:.1f}" stroke="#FFF7E6" stroke-width="3.5"/>')
    # cells
    for row in ORDER:
        r0, r1 = RING[row]
        c = COL[row]
        for i in range(16):
            a0, a1 = ang(i) - 9.2, ang(i) + 9.2
            st = states.get((row, i)) or (('hit' if i == play else 'on') if i in pat[row] else 'off')
            d = sector(r0, r1, a0, a1)
            if st == 'off':
                s.append(f'<path d="{d}" fill="#2E2E33"/>')
            elif st == 'on':
                s.append(f'<path d="{d}" fill="{c}" opacity=".35" filter="url(#g6)"/>')
                s.append(f'<path d="{d}" fill="{c}" opacity=".9"/>')
            elif st == 'hit':
                s.append(f'<path d="{sector(r0-10, r1+10, a0-4, a1+4)}" fill="{c}" filter="url(#g14)"/>')
                s.append(f'<path d="{d}" fill="{c}"/>')
                s.append(f'<path d="{d}" fill="#fff" opacity=".45"/>')
            elif st == 'ghost':
                s.append(f'<path d="{d}" fill="#2E2E33" stroke="{c}" stroke-width="3" opacity=".8"/>')
            elif st == 'empty':
                s.append(f'<path d="{sector(r0-14, r1+12, a0-5, a1+5)}" fill="#fff" opacity=".10" filter="url(#g14)"/>')
                s.append(f'<path d="{d}" fill="#18181b" stroke="#fff" stroke-width="4.5" stroke-dasharray="12 8"/>')
                x, y = pol((r0 + r1) / 2, ang(i))
                s.append(f'<text x="{x:.1f}" y="{y+19:.1f}" text-anchor="middle" font-size="52" font-weight="900" fill="#fff">空</text>')
    # beat numbers on the run-in groove
    for b in range(4):
        x, y = pol(376, ang(b * 4))
        on = b * 4 <= play < b * 4 + 4
        if on:
            s.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="30" fill="#fff" opacity=".45" filter="url(#g14)"/>')
        s.append(f'<text x="{x:.1f}" y="{y+18:.1f}" text-anchor="middle" font-size="50" font-weight="900" fill="{"#fff" if on else CREAM}" opacity="{1 if on else .62}">{b+1}</text>')
    # centre label = the genre tag
    s.append(f'<circle cx="{CX}" cy="{CY}" r="114" fill="url(#label)"/>')
    s.append(f'<circle cx="{CX}" cy="{CY}" r="114" filter="url(#paper)"/>')
    s.append(f'<circle cx="{CX}" cy="{CY}" r="100" fill="none" stroke="#7a2a0c" stroke-width="2" opacity=".45"/>')
    s.append(f'<text x="{CX}" y="{CY-38}" text-anchor="middle" font-size="40" font-weight="700" fill="#5a1d06" opacity=".8">曲风</text>')
    s.append(f'<text x="{CX}" y="{CY+48}" text-anchor="middle" font-size="76" font-weight="900" fill="#2B1206">{label}</text>')
    for ch, row, size, rr, da in pops:
        x, y = pol(rr, pa + da)
        c = COL[row]
        s.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{size*0.58}" fill="{c}" opacity=".65" filter="url(#g30)"/>')
        s.append(f'<text x="{x:.1f}" y="{y+size*0.36:.1f}" text-anchor="middle" font-size="{size}" font-weight="900" fill="#fff" stroke="{c}" stroke-width="7" paint-order="stroke" style="filter:drop-shadow(0 6px 14px rgba(0,0,0,.5))">{ch}</text>')
    return ''.join(s)


def legend(names=True, sig='电吉他', x=96, y0=268, dy=104):
    s = []
    for k, row in enumerate(ORDER):
        y = y0 + k * dy
        c = COL[row]
        # tiny ring swatch: an arc the colour of its ring
        s.append(f'<path d="M{x},{y+30} A44,44 0 0,1 {x+44},{y-14}" fill="none" stroke="{c}" stroke-width="16" stroke-linecap="round"/>')
        if row == 'sig':
            s.append(f'<text x="{x+64}" y="{y+32}" font-size="56" font-weight="900" fill="{c}">{sig}</text>')
        else:
            s.append(f'<text x="{x+64}" y="{y+40}" font-size="86" font-weight="900" fill="{c}">{SYL[row]}</text>')
            if names:
                s.append(f'<text x="{x+166}" y="{y+24}" font-size="42" font-weight="500" fill="{CREAM}" opacity=".9">{NAME[row]}</text>')
    return ''.join(s)


def stickers(x, y, w, h, gap, labels):
    cols = ['#FF7A33', '#F7C744', '#FF6F9C', '#8FD9B6']
    s = []
    for k, lab in enumerate(labels):
        Y = y + k * (h + gap)
        rot = [-2, 1.5, -1, 2][k]
        s.append(f'<g transform="rotate({rot} {x+w/2} {Y+h/2})" filter="url(#shadow)">'
                 f'<rect x="{x}" y="{Y}" width="{w}" height="{h}" rx="{h/2}" fill="{CREAM}"/>'
                 f'<circle cx="{x+h/2}" cy="{Y+h/2}" r="{h/2-14}" fill="{cols[k]}"/>'
                 f'<text x="{x+h/2}" y="{Y+h/2+13}" text-anchor="middle" font-size="40" font-weight="900" fill="#2B1206">{k+1}</text>'
                 f'<text x="{x+h-4}" y="{Y+h/2+19}" font-size="52" font-weight="900" fill="#1C2A24">{lab}</text></g>')
    return ''.join(s)


def fader(x, y, w, h, val):
    s = [f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="14" fill="#173F33" stroke="{CREAM}" stroke-opacity=".25" stroke-width="2"/>']
    a, b, ty = x + 76, x + w - 76, y + h - 36
    s.append(f'<rect x="{a}" y="{ty-4}" width="{b-a}" height="8" rx="4" fill="#0b211a"/>')
    for k in range(9):
        tx = a + (b - a) * k / 8
        s.append(f'<line x1="{tx:.1f}" y1="{ty-20}" x2="{tx:.1f}" y2="{ty-10}" stroke="{CREAM}" stroke-width="2.5" opacity=".6"/>')
    wx = a + (b - a) * 0.62
    s.append(f'<line x1="{wx:.1f}" y1="{ty-30}" x2="{wx:.1f}" y2="{ty+14}" stroke="#F7C744" stroke-width="4"/>')
    s.append(f'<g transform="translate({wx-24:.1f},{y+22}) rotate(12) scale(.8)" fill="#F7C744"><ellipse cx="0" cy="8" rx="9" ry="14"/><ellipse cx="1" cy="28" rx="7" ry="7"/><circle cx="-6" cy="-10" r="3"/><circle cx="0" cy="-12" r="3"/><circle cx="6" cy="-9" r="2.6"/></g>')
    s.append(f'<text x="{wx-2:.1f}" y="{y+50}" font-size="40" font-weight="900" fill="#F7C744">走路</text>')
    s.append(f'<text x="{x+18}" y="{ty+14}" font-size="40" font-weight="900" fill="{CREAM}">慢</text>')
    s.append(f'<text x="{x+w-18}" y="{ty+14}" text-anchor="end" font-size="40" font-weight="900" fill="{CREAM}">快</text>')
    vx = a + (b - a) * val
    s.append(f'<rect x="{vx-17:.1f}" y="{ty-24}" width="34" height="48" rx="6" fill="#E8E2D6" stroke="#0b211a" stroke-width="3"/>')
    s.append(f'<line x1="{vx-11:.1f}" y1="{ty}" x2="{vx+11:.1f}" y2="{ty}" stroke="#FF7A33" stroke-width="4"/>')
    return ''.join(s)


def hook():
    s = [defs(), backdrop()]
    s.append(record(ROCK, 4, '摇滚', pops=[('打', 'da', 128, 496, 8), ('次', 'ci', 96, 478, -13)]))
    s.append(legend(names=False))
    # 0.25 s stopwatch: a cream sticker with an arc
    x, y, r = 1650, 610, 112
    s.append(f'<g filter="url(#shadow)"><circle cx="{x}" cy="{y}" r="{r}" fill="{CREAM}"/></g>')
    s.append(f'<circle cx="{x}" cy="{y}" r="{r-20}" fill="none" stroke="#e2d2b2" stroke-width="16"/>')
    a1 = math.radians(-90 + 360 * 0.7)
    s.append(f'<path d="M{x},{y-r+20} A{r-20},{r-20} 0 1,1 {x+(r-20)*math.cos(a1):.1f},{y+(r-20)*math.sin(a1):.1f}" fill="none" stroke="#FF7A33" stroke-width="16" stroke-linecap="round"/>')
    s.append(f'<text x="{x}" y="{y+18}" text-anchor="middle" font-size="52" font-weight="900" fill="#1C2A24">0.25秒</text>')
    svg = f'<svg width="{W}" height="{H}" viewBox="0 0 {W} {H}">{"".join(s)}</svg>'
    return page(svg + corner_html() + sub_html('只听<span class="k">0.25秒</span>，就猜得出曲风', '6,22,17'))


def key():
    states = {('dong', 0): 'empty', ('sig', 4): 'ghost', ('sig', 12): 'ghost'}
    s = [defs(), backdrop()]
    s.append(record(REGGAE, 0, '雷鬼', states))
    s.append(legend(sig='吉他嚓'))
    s.append(fader(70, 678, 450, 100, 0.30))
    s.append(stickers(1420, 214, 410, 104, 30, ['鼓点在哪拍', '直·摇摆', '快·慢', '招牌声']))
    svg = f'<svg width="{W}" height="{H}" viewBox="0 0 {W} {H}">{"".join(s)}</svg>'
    return page(svg + corner_html() + sub_html('<span class="k">雷鬼</span>常见打法：第一拍空着', '6,22,17'))


if __name__ == '__main__':
    d = '/home/claude/video/episodes/30-music-genres/style/html/'
    open(d + 'lookB_hook.html', 'w').write(hook())
    open(d + 'lookB_key.html', 'w').write(key())
