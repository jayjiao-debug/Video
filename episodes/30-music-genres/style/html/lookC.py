"""Look C: 鼓手草稿本 (Drummer's Notebook) - ballpoint grid on dot paper, highlighter hits, marker syllables."""
import math, random, sys
sys.path.insert(0, '/home/claude/video/episodes/30-music-genres/style/html')
from common import *

PAPER = '#F7F2E6'
INK = '#1F3A93'
RED = '#D9362B'
HL = {'sig': '#6EC6FF', 'ci': '#8BE36B', 'da': '#FF7DB8', 'dong': '#FFA040'}     # highlighters
MK = {'sig': '#1F78C8', 'ci': '#2C9A47', 'da': '#E0378A', 'dong': '#E8621A'}     # markers (text)
X0, X1, GG = 330, 1840, 22
P = (X1 - X0 - 3 * GG) / 16
random.seed(7)


def cx(i):
    return X0 + i * P + (i // 4) * GG


def defs():
    return '''<defs>
<filter id="rough" x="-5%" y="-5%" width="110%" height="110%">
  <feTurbulence type="fractalNoise" baseFrequency="0.025" numOctaves="2" seed="2" result="n"/>
  <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G"/>
</filter>
<filter id="hl" x="-10%" y="-20%" width="120%" height="140%">
  <feTurbulence type="fractalNoise" baseFrequency="0.06 0.012" numOctaves="2" seed="5" result="n"/>
  <feDisplacementMap in="SourceGraphic" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G" result="d"/>
  <feGaussianBlur in="d" stdDeviation=".6"/>
</filter>
<filter id="fibre" x="0" y="0" width="100%" height="100%">
  <feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="3" seed="11"/>
  <feColorMatrix values="0 0 0 0 .45  0 0 0 0 .38  0 0 0 0 .25  0 0 0 .10 0"/>
</filter>
<filter id="wood" x="0" y="0" width="100%" height="100%">
  <feTurbulence type="fractalNoise" baseFrequency="0.003 0.09" numOctaves="3" seed="8"/>
  <feColorMatrix values="0 0 0 0 .55  0 0 0 0 .36  0 0 0 0 .22  0 0 0 .55 0"/>
</filter>
<filter id="pshadow" x="-5%" y="-5%" width="110%" height="120%"><feDropShadow dx="0" dy="14" stdDeviation="14" flood-color="#000" flood-opacity=".55"/></filter>
<filter id="g10" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"/></filter>
<pattern id="dots" width="36" height="36" patternUnits="userSpaceOnUse"><circle cx="18" cy="18" r="2" fill="#C9BFA8"/></pattern>
<radialGradient id="light" cx="22%" cy="10%" r="95%"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#7a6a4a" stop-opacity=".16"/></radialGradient>
<linearGradient id="desk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A2A1F"/><stop offset="1" stop-color="#22180F"/></linearGradient>
</defs>'''


def world(page_bottom=796):
    s = [f'<rect width="{W}" height="{H}" fill="url(#desk)"/>',
         f'<rect width="{W}" height="{H}" filter="url(#wood)" opacity=".7"/>',
         f'<g filter="url(#pshadow)"><rect x="-10" y="-10" width="{W+20}" height="{page_bottom+10}" fill="{PAPER}"/></g>',
         f'<rect x="-10" y="-10" width="{W+20}" height="{page_bottom+10}" fill="url(#dots)"/>',
         f'<rect x="-10" y="-10" width="{W+20}" height="{page_bottom+10}" filter="url(#fibre)"/>',
         f'<rect x="-10" y="-10" width="{W+20}" height="{page_bottom+10}" fill="url(#light)"/>',
         # page stack edge
         f'<path d="M0,{page_bottom} L{W},{page_bottom}" stroke="#d8cfbb" stroke-width="3"/>',
         f'<path d="M0,{page_bottom+5} L{W},{page_bottom+4}" stroke="#cbbfa6" stroke-width="2" opacity=".8"/>']
    return ''.join(s)


def wob(x1, y1, x2, y2, w=3.2, col=INK, op=.92):
    mx, my = (x1 + x2) / 2 + random.uniform(-2, 2), (y1 + y2) / 2 + random.uniform(-2, 2)
    return f'<path d="M{x1:.1f},{y1:.1f} Q{mx:.1f},{my:.1f} {x2:.1f},{y2:.1f}" stroke="{col}" stroke-width="{w}" fill="none" stroke-linecap="round" opacity="{op}"/>'


def grid(pat, tops, h, play, states=None, label_sig='电吉他', names=True):
    states = states or {}
    out = ['<g style="mix-blend-mode:multiply">']
    bot = tops[-1] + h
    # highlighter hits first (under the ink)
    for r, top in zip(ROWS, tops):
        for i in pat[r]:
            st = states.get((r, i)) or ('hit' if i == play else 'on')
            if st in ('on', 'hit'):
                x = cx(i)
                sk = random.uniform(-3, 3)
                out.append(f'<rect x="{x+6:.1f}" y="{top+8}" width="{P-12:.1f}" height="{h-16}" rx="6" fill="{HL[r]}" opacity="{.95 if st=="hit" else .82}" filter="url(#hl)" transform="rotate({sk:.1f} {x+P/2:.1f} {top+h/2})"/>')
                if st == 'hit':
                    out.append(f'<rect x="{x+6:.1f}" y="{top+8}" width="{P-12:.1f}" height="{h-16}" rx="6" fill="{HL[r]}" opacity=".7" filter="url(#hl)" transform="rotate({-sk:.1f} {x+P/2:.1f} {top+h/2})"/>')
    out.append('</g>')
    # ghosted (not yet playing): a pencil outline
    for (r, i), st in states.items():
        if st == 'ghost':
            top = tops[ROWS.index(r)]
            x = cx(i)
            out.append(f'<rect x="{x+10:.1f}" y="{top+12}" width="{P-20:.1f}" height="{h-24}" rx="8" fill="none" stroke="{MK[r]}" stroke-width="3" stroke-dasharray="7 7" opacity=".7" filter="url(#rough)"/>')
    # ballpoint ruling
    g = ['<g filter="url(#rough)">']
    for k, top in enumerate(tops):
        g.append(wob(X0 - 8, top, X1 + 8, top + random.uniform(-2, 2)))
        g.append(wob(X0 - 8, top + h, X1 + 8, top + h + random.uniform(-2, 2)))
    for i in range(17):
        x = cx(i) if i < 16 else cx(15) + P
        if i % 4 == 0 and 0 < i < 16:
            for xx in (cx(i) - GG + 3, cx(i)):
                for top in tops:
                    g.append(wob(xx, top - 2, xx + random.uniform(-2, 2), top + h + 2, 3.6))
        else:
            if i % 4 == 0 and i == 0:
                x = cx(0)
            for top in tops:
                g.append(wob(x, top - 2, x + random.uniform(-2, 2), top + h + 2, 2.6 if i % 4 else 3.6, op=.8))
    g.append('</g>')
    out += g
    # playhead: a red pencil arrow over the current column
    px = cx(play) + P / 2
    out.append(f'<g filter="url(#rough)"><path d="M{px:.1f},{tops[0]-40} L{px:.1f},{tops[0]-12}" stroke="{RED}" stroke-width="5" stroke-linecap="round"/>'
               f'<path d="M{px-12:.1f},{tops[0]-26} L{px:.1f},{tops[0]-10} L{px+12:.1f},{tops[0]-26}" stroke="{RED}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>')
    # row labels
    for r, top in zip(ROWS, tops):
        cy = top + h / 2
        if r == 'sig':
            out.append(f'<text x="70" y="{cy+19}" font-size="56" font-weight="900" fill="{MK[r]}" transform="rotate(-2 70 {cy})">{label_sig}</text>')
            out.append(f'<path d="M66,{cy+32} q90,8 180,-2" stroke="{HL["sig"]}" stroke-width="12" fill="none" opacity=".7" stroke-linecap="round"/>')
        else:
            if names:
                out.append(f'<text x="66" y="{cy+31}" font-size="90" font-weight="900" fill="{MK[r]}" transform="rotate(-3 100 {cy})">{SYL[r]}</text>')
                out.append(f'<text x="172" y="{cy+15}" font-size="42" font-weight="500" fill="{INK}">{NAME[r]}</text>')
            else:
                out.append(f'<text x="150" y="{cy+34}" text-anchor="middle" font-size="98" font-weight="900" fill="{MK[r]}" transform="rotate(-3 150 {cy})">{SYL[r]}</text>')
    return ''.join(out)


def beat_numbers(y, lit):
    s = ['<g filter="url(#rough)">']
    for b in range(4):
        x = cx(b * 4) + P / 2
        on = b == lit
        col = RED if on else INK
        s.append(f'<ellipse cx="{x:.1f}" cy="{y-21}" rx="38" ry="35" fill="none" stroke="{col}" stroke-width="{4.5 if on else 3}" transform="rotate(-8 {x:.1f} {y-21})"/>')
        s.append(f'<text x="{x:.1f}" y="{y}" text-anchor="middle" font-size="58" font-weight="900" fill="{col}">{b+1}</text>')
    s.append('</g>')
    return ''.join(s)


def sticky(x, y, w, h, text, rot=-3, sub=None):
    s = [f'<g transform="rotate({rot} {x+w/2} {y+h/2})">',
         f'<rect x="{x+6}" y="{y+10}" width="{w}" height="{h}" fill="#000" opacity=".18" filter="url(#g10)"/>',
         f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="#FFD95A"/>',
         f'<rect x="{x}" y="{y}" width="{w}" height="{h}" filter="url(#fibre)"/>',
         f'<path d="M{x},{y+h} L{x+w},{y+h} L{x+w},{y+h-14} Q{x+w*0.6},{y+h-4} {x},{y+h} Z" fill="#E9BE38" opacity=".7"/>',
         f'<rect x="{x+w/2-80}" y="{y-20}" width="160" height="42" fill="#FF8FB8" opacity=".55" transform="rotate(4 {x+w/2} {y})"/>']
    if sub:
        s.append(f'<text x="{x+30}" y="{y+h/2+14}" font-size="40" font-weight="700" fill="#6b5410">{sub}</text>')
        s.append(f'<text x="{x+w/2+40}" y="{y+h/2+30}" text-anchor="middle" font-size="86" font-weight="900" fill="#1d1d1d">{text}</text>')
    else:
        s.append(f'<text x="{x+w/2}" y="{y+h/2+30}" text-anchor="middle" font-size="86" font-weight="900" fill="#1d1d1d">{text}</text>')
    s.append('</g>')
    return ''.join(s)


def foot(x, y, sc, col, rot=12):
    return (f'<g transform="translate({x:.1f},{y:.1f}) scale({sc}) rotate({rot})" fill="none" stroke="{col}" stroke-width="3.2">'
            '<ellipse cx="0" cy="8" rx="9" ry="14"/><ellipse cx="1" cy="28" rx="7" ry="7"/>'
            f'<circle cx="-6" cy="-10" r="2.6" fill="{col}"/><circle cx="0" cy="-12" r="2.6" fill="{col}"/><circle cx="6" cy="-9" r="2.2" fill="{col}"/></g>')


def meter(x, y, w, h, val):
    s = ['<g filter="url(#rough)">']
    a, b, ty = x + 70, x + w - 70, y + h - 30
    s.append(wob(a, ty, b, ty, 3.4))
    for k in range(9):
        tx = a + (b - a) * k / 8
        s.append(wob(tx, ty, tx, ty - (18 if k % 2 == 0 else 10), 3))
    wx = a + (b - a) * 0.62
    s.append(wob(wx, ty + 8, wx, ty - 34, 4, RED))
    s.append(foot(wx - 22, y + 18, 0.85, RED))
    s.append(f'<text x="{wx-2:.1f}" y="{y+44}" font-size="40" font-weight="900" fill="{RED}">走路</text>')
    s.append(f'<text x="{x+12}" y="{ty+14}" font-size="40" font-weight="900" fill="{INK}">慢</text>')
    s.append(f'<text x="{x+w-12}" y="{ty+14}" text-anchor="end" font-size="40" font-weight="900" fill="{INK}">快</text>')
    vx = a + (b - a) * val
    s.append(f'<path d="M{vx:.1f},{ty-50} L{vx:.1f},{ty-6} M{vx-12:.1f},{ty-20} L{vx:.1f},{ty-4} L{vx+12:.1f},{ty-20}" stroke="#111" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>')
    s.append('</g>')
    return ''.join(s)


def checks(x, y, w, h, gap, labels):
    s = []
    X = x
    for k, lab in enumerate(labels):
        if k:
            X += 78 + 52 * len(lab.replace('·', '')) + (26 if '·' in prev else 0) + gap
        prev = lab
        s.append('<g filter="url(#rough)">')
        s.append(f'<rect x="{X}" y="{y+h/2-28}" width="56" height="56" rx="4" fill="none" stroke="{INK}" stroke-width="4"/>')
        s.append(f'<path d="M{X+8},{y+h/2+2} L{X+26},{y+h/2+22} L{X+66},{y+h/2-40}" fill="none" stroke="{RED}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>')
        s.append('</g>')
        s.append(f'<text x="{X+78}" y="{y+h/2+19}" font-size="52" font-weight="900" fill="{INK}">{lab}</text>')
        X -= 0
    return ''.join(s)


def pop(x, y, ch, size, col):
    s = [f'<g filter="url(#rough)">']
    for k in range(8):
        a = math.radians(-160 + k * 20)
        r1, r2 = size * 0.62, size * 0.86
        if k in (3, 4):
            continue
        s.append(f'<path d="M{x+r1*math.cos(a):.1f},{y+r1*math.sin(a):.1f} L{x+r2*math.cos(a):.1f},{y+r2*math.sin(a):.1f}" stroke="#111" stroke-width="5" stroke-linecap="round"/>')
    s.append('</g>')
    s.append(f'<text x="{x:.1f}" y="{y+size*0.36:.1f}" text-anchor="middle" font-size="{size}" font-weight="900" fill="{col}" stroke="#111" stroke-width="7" paint-order="stroke" transform="rotate(-6 {x:.1f} {y:.1f})">{ch}</text>')
    return ''.join(s)


def hook():
    tops, h = [250, 388, 500, 612], 100
    s = [defs(), world()]
    s.append(sticky(640, 30, 430, 128, '摇滚', -3, sub='曲风'))
    # stopwatch doodle
    x, y, r = 1240, 96, 50
    s.append(f'<g filter="url(#rough)"><circle cx="{x}" cy="{y}" r="{r}" fill="none" stroke="{INK}" stroke-width="4"/>'
             f'<path d="M{x-10},{y-r-12} L{x+10},{y-r-12} M{x},{y-r-12} L{x},{y-r}" stroke="{INK}" stroke-width="4"/>'
             f'<path d="M{x},{y} L{x},{y-r} A{r},{r} 0 0,1 {x+r},{y} Z" fill="#FF7DB8" opacity=".75" style="mix-blend-mode:multiply"/>'
             f'<path d="M{x},{y} L{x+r-8},{y}" stroke="{RED}" stroke-width="5" stroke-linecap="round"/></g>')
    s.append(f'<text x="{x+70}" y="{y+18}" font-size="52" font-weight="900" fill="{INK}">0.25秒</text>')
    s.append(beat_numbers(198, 1))
    s.append(grid(ROCK, tops, h, 4, names=False))
    s.append(pop(cx(4) + P / 2, tops[2] + h / 2 + 6, '打', 128, MK['da']))
    s.append(pop(cx(4) + P / 2 + 8, tops[1] + h / 2 - 18, '次', 92, MK['ci']))
    svg = f'<svg width="{W}" height="{H}" viewBox="0 0 {W} {H}">{"".join(s)}</svg>'
    return page(svg + corner_html('rgba(31,58,147,.82)', 'none') + sub_html('只听<span class="k">0.25秒</span>，就猜得出曲风', '20,12,6'))


def key():
    tops, h = [262, 368, 456, 544], 82
    states = {('dong', 0): 'empty', ('sig', 4): 'ghost', ('sig', 12): 'ghost'}
    s = [defs(), world()]
    s.append(sticky(700, 30, 520, 128, '雷鬼', -2.5, sub='曲风'))
    s.append(beat_numbers(214, 0))
    s.append(grid(REGGAE, tops, h, 0, states=states, label_sig='吉他嚓'))
    # the empty first beat: red dashed ring + 空
    x, y = cx(0) + P / 2, tops[3] + h / 2
    s.append(f'<g filter="url(#rough)"><ellipse cx="{x:.1f}" cy="{y}" rx="62" ry="54" fill="none" stroke="{RED}" stroke-width="5" stroke-dasharray="14 9" transform="rotate(-10 {x:.1f} {y})"/></g>')
    s.append(f'<text x="{x:.1f}" y="{y+20}" text-anchor="middle" font-size="58" font-weight="900" fill="{RED}" transform="rotate(-6 {x:.1f} {y})">空</text>')
    s.append(meter(60, 660, 440, 110, 0.30))
    s.append(checks(560, 666, 260, 100, 60, ['鼓点在哪拍', '直·摇摆', '快·慢', '招牌声']))
    svg = f'<svg width="{W}" height="{H}" viewBox="0 0 {W} {H}">{"".join(s)}</svg>'
    return page(svg + corner_html('rgba(31,58,147,.82)', 'none') + sub_html('<span class="k">雷鬼</span>常见打法：第一拍空着', '20,12,6'))


if __name__ == '__main__':
    d = '/home/claude/video/episodes/30-music-genres/style/html/'
    open(d + 'lookC_hook.html', 'w').write(hook())
    open(d + 'lookC_key.html', 'w').write(key())
