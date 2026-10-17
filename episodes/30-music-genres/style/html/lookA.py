"""Look A: 鼓机面板 (Pad Machine) - a generic hardware drum machine faceplate, backlit rubber pads."""
import math, sys
sys.path.insert(0, '/home/claude/video/episodes/30-music-genres/style/html')
from common import *

COL = {'sig': '#FF5AA5', 'ci': '#6EF0CC', 'da': '#FFCF3A', 'dong': '#FF6A2B'}
SILK = '#ECE5D3'
X0, X1, GG = 330, 1840, 24
P = (X1 - X0 - 3 * GG) / 16
PW = 74


def cx(i):
    return X0 + i * P + (i // 4) * GG


def defs():
    d = '''<defs>
<filter id="brush" x="0" y="0" width="100%" height="100%">
  <feTurbulence type="fractalNoise" baseFrequency="0.002 0.85" numOctaves="2" seed="4"/>
  <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .09 0"/>
</filter>
<filter id="grain" x="0" y="0" width="100%" height="100%">
  <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="9"/>
  <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .10 0"/>
</filter>
<filter id="g8" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"/></filter>
<filter id="g18" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="18"/></filter>
<filter id="g30" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="30"/></filter>
<filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter>
<linearGradient id="panel" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#45484E"/><stop offset=".55" stop-color="#393B40"/><stop offset="1" stop-color="#303236"/>
</linearGradient>
<linearGradient id="padOff" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#5E6168"/><stop offset="1" stop-color="#4A4D53"/>
</linearGradient>
<linearGradient id="bezel" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#26272A"/><stop offset="1" stop-color="#1A1B1D"/>
</linearGradient>
<linearGradient id="lcd" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#0E2420"/><stop offset="1" stop-color="#0A1A17"/>
</linearGradient>
<radialGradient id="hot"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".55" stop-color="#fff" stop-opacity=".25"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<radialGradient id="vign" cx="50%" cy="42%" r="75%"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></radialGradient>
</defs>'''
    return d


def panel(bezel_y=792):
    return f'''
<rect width="{W}" height="{H}" fill="url(#panel)"/>
<rect width="{W}" height="{H}" filter="url(#brush)"/>
<ellipse cx="1080" cy="440" rx="1100" ry="520" fill="#FFF3DD" opacity=".05" filter="url(#g30)"/>
<rect y="{bezel_y}" width="{W}" height="{H-bezel_y}" fill="url(#bezel)"/>
<rect y="{bezel_y}" width="{W}" height="3" fill="#6A6D74" opacity=".55"/>
<rect y="{bezel_y+3}" width="{W}" height="10" fill="#000" opacity=".25" filter="url(#soft)"/>
<rect width="{W}" height="{H}" filter="url(#grain)"/>
<rect width="{W}" height="{H}" fill="url(#vign)"/>
''' + ''.join(f'<g transform="translate({x},{y})"><circle r="11" fill="#2A2B2E"/><circle r="9" fill="#77797f"/><path d="M-6,-1 L6,1" stroke="#3b3c40" stroke-width="2.4"/></g>'
              for x, y in [(1880, 760), (40, 760)])


def pad(i, top, h, row, state):
    x = cx(i)
    c = COL[row]
    s = f'<rect x="{x-5:.1f}" y="{top-5}" width="{PW+10}" height="{h+10}" rx="14" fill="#1E1F22" opacity=".85"/>'
    if state == 'off':
        s += f'<rect x="{x:.1f}" y="{top}" width="{PW}" height="{h}" rx="11" fill="url(#padOff)"/>'
        s += f'<rect x="{x+4:.1f}" y="{top+3}" width="{PW-8}" height="3" rx="1.5" fill="#fff" opacity=".10"/>'
    elif state == 'on':   # programmed, lit softly from below
        s = f'<rect x="{x-10:.1f}" y="{top-10}" width="{PW+20}" height="{h+20}" rx="18" fill="{c}" opacity=".30" filter="url(#g18)"/>' + s
        s += f'<rect x="{x:.1f}" y="{top}" width="{PW}" height="{h}" rx="11" fill="{c}" opacity=".88"/>'
        s += f'<ellipse cx="{x+PW/2:.1f}" cy="{top+h*0.55}" rx="{PW*0.38}" ry="{h*0.32}" fill="#fff" opacity=".28" filter="url(#g8)"/>'
        s += f'<rect x="{x+4:.1f}" y="{top+3}" width="{PW-8}" height="3" rx="1.5" fill="#fff" opacity=".22"/>'
    elif state == 'hit':  # sounding now
        s += f'<rect x="{x-14:.1f}" y="{top-14}" width="{PW+28}" height="{h+28}" rx="20" fill="{c}" opacity=".95" filter="url(#g18)"/>'
        s += f'<rect x="{x:.1f}" y="{top}" width="{PW}" height="{h}" rx="11" fill="{c}"/>'
        s += f'<ellipse cx="{x+PW/2:.1f}" cy="{top+h/2}" rx="{PW*0.55}" ry="{h*0.5}" fill="url(#hot)"/>'
    elif state == 'ghost':
        s += f'<rect x="{x:.1f}" y="{top}" width="{PW}" height="{h}" rx="11" fill="url(#padOff)"/>'
        s += f'<rect x="{x+3:.1f}" y="{top+3}" width="{PW-6}" height="{h-6}" rx="9" fill="none" stroke="{c}" stroke-width="3" opacity=".55"/>'
    elif state == 'empty':  # the missing beat-1 kick: a pulsing dashed socket
        s += f'<rect x="{x:.1f}" y="{top}" width="{PW}" height="{h}" rx="11" fill="#2A2C30"/>'
        for k, (pad_, op) in enumerate([(22, .22), (40, .12)]):
            s += f'<rect x="{x-pad_:.1f}" y="{top-pad_}" width="{PW+2*pad_}" height="{h+2*pad_}" rx="{14+pad_/2}" fill="none" stroke="#fff" stroke-width="3" opacity="{op}"/>'
        s += f'<rect x="{x-6:.1f}" y="{top-6}" width="{PW+12}" height="{h+12}" rx="15" fill="none" stroke="#fff" stroke-width="5" stroke-dasharray="14 10" opacity=".95"/>'
        s += f'<text x="{x+PW/2:.1f}" y="{top+h/2+19}" text-anchor="middle" font-size="54" font-weight="900" fill="#fff" opacity=".9">空</text>'
    return s


def grid(pat, tops, h, play, states=None, label_sig='电吉他', names=True, flap=False):
    states = states or {}
    out = []
    # playhead light column
    x = cx(play)
    out.append(f'<rect x="{x-10:.1f}" y="{tops[0]-30}" width="{PW+20}" height="{tops[-1]+h-tops[0]+44}" rx="16" fill="#fff" opacity=".07"/>')
    # step LEDs
    for i in range(16):
        on = i == play
        lx = cx(i) + PW / 2
        if on:
            out.append(f'<circle cx="{lx:.1f}" cy="{tops[0]-26}" r="16" fill="#FF3B30" opacity=".9" filter="url(#g8)"/>')
        out.append(f'<circle cx="{lx:.1f}" cy="{tops[0]-26}" r="7" fill="{"#FF5A4E" if on else "#5A2724"}"/>')
    for r, top in zip(ROWS, tops):
        for i in range(16):
            st = states.get((r, i))
            if st is None:
                st = ('hit' if i == play else 'on') if i in pat[r] else 'off'
            out.append(pad(i, top, h, r, st))
    # row labels
    for r, top in zip(ROWS, tops):
        cy = top + h / 2
        if r == 'sig':
            out.append(f'<rect x="58" y="{cy-40}" width="236" height="80" rx="10" fill="url(#lcd)" stroke="#111" stroke-width="3"/>')
            if flap:
                out.append(f'<rect x="64" y="{cy-34}" width="224" height="34" rx="5" fill="#16302B"/>')
                out.append(f'<line x1="62" y1="{cy}" x2="290" y2="{cy}" stroke="#050b0a" stroke-width="3"/>')
            out.append(f'<text x="176" y="{cy+17}" text-anchor="middle" font-size="48" font-weight="900" fill="{COL["sig"]}" style="filter:drop-shadow(0 0 8px {COL["sig"]})">{label_sig}</text>')
            if flap:
                out.append(f'<line x1="62" y1="{cy}" x2="290" y2="{cy}" stroke="#050b0a" stroke-width="3" opacity=".9"/>')
        else:
            if names:
                out.append(f'<text x="62" y="{cy+31}" font-size="88" font-weight="900" fill="{COL[r]}">{SYL[r]}</text>')
                out.append(f'<text x="168" y="{cy+15}" font-size="42" font-weight="500" fill="{SILK}" opacity=".88">{NAME[r]}</text>')
            else:
                out.append(f'<text x="150" y="{cy+34}" text-anchor="middle" font-size="96" font-weight="900" fill="{COL[r]}">{SYL[r]}</text>')
    return ''.join(out)


def beat_numbers(tops, lit, y):
    out = []
    for b in range(4):
        x0 = cx(b * 4)
        x1 = cx(b * 4 + 3) + PW
        on = b == lit
        out.append(f'<line x1="{x0:.1f}" y1="{y+16}" x2="{x1:.1f}" y2="{y+16}" stroke="{SILK}" stroke-width="3" opacity="{.9 if on else .35}"/>')
        if on:
            out.append(f'<circle cx="{x0+PW/2:.1f}" cy="{y-20}" r="42" fill="#fff" opacity=".35" filter="url(#g18)"/>')
        out.append(f'<text x="{x0+PW/2:.1f}" y="{y}" text-anchor="middle" font-size="62" font-weight="900" fill="{"#fff" if on else SILK}" opacity="{1 if on else .7}">{b+1}</text>')
    return ''.join(out)


def lcd(x, y, w, h, inner):
    return (f'<rect x="{x-6}" y="{y-6}" width="{w+12}" height="{h+12}" rx="16" fill="#1c1d20"/>'
            f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="11" fill="url(#lcd)"/>'
            f'<rect x="{x+8}" y="{y+6}" width="{w-16}" height="{h*0.38}" rx="8" fill="#fff" opacity=".04"/>' + inner)


def tag_text(x, y, s, size=82):
    return f'<text x="{x}" y="{y}" text-anchor="middle" font-size="{size}" font-weight="900" fill="#A6FFE4" style="filter:drop-shadow(0 0 10px rgba(120,255,215,.75))">{s}</text>'


def hook():
    tops, h = [246, 382, 496, 610], 98
    pat = ROCK
    s = [defs(), panel()]
    s.append(lcd(600, 30, 720, 104,
                 f'<text x="640" y="98" font-size="40" font-weight="500" fill="#5FAF98">曲风</text>'
                 + tag_text(820, 112, '摇滚', 84)
                 + '<circle cx="1046" cy="82" r="34" fill="none" stroke="#244a42" stroke-width="9"/>'
                 + '<path d="M1046,48 A34,34 0 1,1 1013.7,92.5" fill="none" stroke="#A6FFE4" stroke-width="9" stroke-linecap="round" style="filter:drop-shadow(0 0 6px #7fffd8)"/>'
                 + '<text x="1100" y="98" font-size="46" font-weight="900" fill="#A6FFE4">0.25秒</text>'))
    s.append(beat_numbers(tops, 1, 186))
    s.append(grid(pat, tops, h, 4, label_sig='电吉他', names=False, flap=False))
    # syllable pops on the sounding pads
    for r, ch, size, dx, dy in [('ci', '次', 92, 0, 0), ('da', '打', 120, 0, 0)]:
        top = tops[ROWS.index(r)]
        x = cx(4) + PW / 2
        y = top + h / 2
        s.append(f'<circle cx="{x:.1f}" cy="{y}" r="{size*0.62}" fill="{COL[r]}" opacity=".55" filter="url(#g30)"/>')
        s.append(f'<circle cx="{x:.1f}" cy="{y}" r="{size*0.6}" fill="none" stroke="#fff" stroke-width="3" opacity=".45"/>')
        s.append(f'<text x="{x:.1f}" y="{y+size*0.36:.1f}" text-anchor="middle" font-size="{size}" font-weight="900" fill="#fff" stroke="{COL[r]}" stroke-width="6" paint-order="stroke" style="filter:drop-shadow(0 4px 14px rgba(0,0,0,.6))">{ch}</text>')
    svg = f'<svg width="{W}" height="{H}" viewBox="0 0 {W} {H}">{"".join(s)}</svg>'
    return page(svg + corner_html() + sub_html('只听<span class="k">0.25秒</span>，就猜得出曲风'))


def meter(x, y, w, h, val):
    """Tempo strip: 慢 .. 快 scale, footprint at the 走路 mark, red needle at val (0..1)."""
    s = [f'<rect x="{x-5}" y="{y-5}" width="{w+10}" height="{h+10}" rx="16" fill="#1E1F22"/>',
         f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="12" fill="#E9E0CB"/>']
    a, b, ty = x + 70, x + w - 70, y + h - 34
    s.append(f'<line x1="{a}" y1="{ty}" x2="{b}" y2="{ty}" stroke="#2b2a27" stroke-width="3"/>')
    for k in range(13):
        tx = a + (b - a) * k / 12
        s.append(f'<line x1="{tx:.1f}" y1="{ty}" x2="{tx:.1f}" y2="{ty-(16 if k%3==0 else 9)}" stroke="#2b2a27" stroke-width="3"/>')
    wx = a + (b - a) * 0.62
    s.append(f'<line x1="{wx:.1f}" y1="{ty+6}" x2="{wx:.1f}" y2="{ty-30}" stroke="#D2452B" stroke-width="5"/>')
    s.append(foot(wx - 22, y + 26, 0.85, '#D2452B'))
    s.append(f'<text x="{wx-4:.1f}" y="{y+52}" font-size="40" font-weight="900" fill="#D2452B">走路</text>')
    s.append(f'<text x="{x+16}" y="{ty+14}" font-size="40" font-weight="900" fill="#2b2a27">慢</text>')
    s.append(f'<text x="{x+w-16}" y="{ty+14}" text-anchor="end" font-size="40" font-weight="900" fill="#2b2a27">快</text>')
    vx = a + (b - a) * val
    s.append(f'<path d="M{vx-13:.1f},{ty+20} L{vx+13:.1f},{ty+20} L{vx:.1f},{ty+2} Z" fill="#151515"/>')
    s.append(f'<line x1="{vx:.1f}" y1="{ty+4}" x2="{vx:.1f}" y2="{y+14}" stroke="#151515" stroke-width="5" stroke-linecap="round"/>')
    return ''.join(s)


def foot(x, y, sc, col):
    return (f'<g transform="translate({x:.1f},{y:.1f}) scale({sc}) rotate(12)" fill="{col}">'
            '<ellipse cx="0" cy="8" rx="9" ry="14"/><ellipse cx="1" cy="28" rx="7" ry="7"/>'
            '<circle cx="-6" cy="-10" r="3"/><circle cx="0" cy="-12" r="3"/><circle cx="6" cy="-9" r="2.6"/></g>')


def slots(x, y, w, h, gap, labels, lit):
    s = []
    cols = ['#FFB23E'] * 4
    for k, lab in enumerate(labels):
        X = x + k * (w + gap)
        on = lit[k]
        s.append(f'<rect x="{X-5}" y="{y-5}" width="{w+10}" height="{h+10}" rx="16" fill="#1E1F22"/>')
        s.append(f'<rect x="{X}" y="{y}" width="{w}" height="{h}" rx="12" fill="{"#4A4C52" if on else "#3A3C41"}"/>')
        if on:
            s.append(f'<rect x="{X+24}" y="{y+8}" width="{w-48}" height="8" rx="4" fill="{cols[k]}" opacity=".9" filter="url(#g8)"/>')
            s.append(f'<rect x="{X+24}" y="{y+8}" width="{w-48}" height="8" rx="4" fill="#FFE2A6"/>')
        s.append(f'<text x="{X+w/2}" y="{y+h/2+26}" text-anchor="middle" font-size="52" font-weight="900" fill="{"#FFF6E2" if on else "#77797f"}">{lab}</text>')
    return ''.join(s)


def key():
    tops, h = [262, 368, 456, 544], 80
    pat = REGGAE
    states = {('dong', 0): 'empty', ('sig', 4): 'ghost', ('sig', 12): 'ghost'}
    s = [defs(), panel()]
    s.append(lcd(600, 30, 720, 104,
                 f'<text x="640" y="98" font-size="40" font-weight="500" fill="#5FAF98">曲风</text>'
                 + tag_text(960, 112, '雷鬼', 84)))
    s.append(beat_numbers(tops, 0, 204))
    s.append(grid(pat, tops, h, 0, states=states, label_sig='吉他嚓'))
    # annotation on the empty beat
    x = cx(0) + PW / 2
    s.append(f'<text x="{x+66:.1f}" y="{tops[3]+h+4}" font-size="52" font-weight="900" fill="#fff" opacity="0">.</text>')
    s.append(meter(60, 650, 440, 120, 0.30))
    s.append(slots(530, 660, 304, 104, 31, ['鼓点在哪拍', '直·摇摆', '快·慢', '招牌声'], [1, 1, 1, 1]))
    svg = f'<svg width="{W}" height="{H}" viewBox="0 0 {W} {H}">{"".join(s)}</svg>'
    return page(svg + corner_html() + sub_html('<span class="k">雷鬼</span>常见打法：第一拍空着'))


if __name__ == '__main__':
    d = '/home/claude/video/episodes/30-music-genres/style/html/'
    open(d + 'lookA_hook.html', 'w').write(hook())
    open(d + 'lookA_key.html', 'w').write(key())
