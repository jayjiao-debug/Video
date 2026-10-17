"""Look A v2 (storyboard frames): 鼓机面板 with gate-2a notes applied.
One hero per line (everything else ~30 %), the 0.25 s window on the grid, labels from frame 0,
no ghost outlines, 走路 >= 52 px, clue keys collapse to 4 bezel LEDs when not in use.
Each function maps 1:1 to a planned React/SVG component (Panel, PadGrid, Vfd, BeatNumbers, ...)."""
import math, sys
sys.path.insert(0, '/home/claude/video/episodes/30-music-genres/style/html')
from common import W, H, GOLD, page, sub_html, corner_html
from lookA import defs, panel, COL, SILK, X0, P, PW, cx, lcd, tag_text, foot

ROWS = ['sig', 'ci', 'da', 'dong']
SYL = {'ci': '次', 'da': '打', 'dong': '动'}
NAME = {'ci': '踩镲', 'da': '军鼓', 'dong': '底鼓'}
TOPS, PH = [258, 366, 456, 546], 84          # default framing: rows 招牌 / 次 / 打 / 动
MINT = '#A6FFE4'


def pad(i, top, h, row, st, dim=1.0):
    """st: off | on (sounding earlier in this bar, afterglow) | hit (sounding now) | empty (the missing hit)."""
    x = cx(i); c = COL[row]
    s = f'<rect x="{x-5:.1f}" y="{top-5}" width="{PW+10}" height="{h+10}" rx="14" fill="#1E1F22" opacity=".85"/>'
    base = f'<rect x="{x:.1f}" y="{top}" width="{PW}" height="{h}" rx="11" fill="url(#padOff)"/>' \
           f'<rect x="{x+4:.1f}" y="{top+3}" width="{PW-8}" height="3" rx="1.5" fill="#fff" opacity=".10"/>'
    if st == 'off':
        return s + base
    if st == 'on':
        return (s + base + f'<g opacity="{dim}"><rect x="{x-10:.1f}" y="{top-10}" width="{PW+20}" height="{h+20}" rx="18" fill="{c}" opacity=".32" filter="url(#g18)"/>'
                f'<rect x="{x:.1f}" y="{top}" width="{PW}" height="{h}" rx="11" fill="{c}" opacity=".88"/>'
                f'<ellipse cx="{x+PW/2:.1f}" cy="{top+h*0.55}" rx="{PW*0.38}" ry="{h*0.32}" fill="#fff" opacity=".28" filter="url(#g8)"/></g>')
    if st == 'hit':
        return (s + f'<g opacity="{dim}"><rect x="{x-18:.1f}" y="{top-18}" width="{PW+36}" height="{h+36}" rx="24" fill="{c}" filter="url(#g18)"/>'
                f'<rect x="{x:.1f}" y="{top}" width="{PW}" height="{h}" rx="11" fill="{c}"/>'
                f'<ellipse cx="{x+PW/2:.1f}" cy="{top+h/2}" rx="{PW*0.55}" ry="{h*0.5}" fill="url(#hot)"/></g>')
    if st == 'empty':
        s += f'<rect x="{x:.1f}" y="{top}" width="{PW}" height="{h}" rx="11" fill="#26282C"/>'
        for pad_, op in [(26, .30), (48, .14)]:
            s += f'<rect x="{x-pad_:.1f}" y="{top-pad_}" width="{PW+2*pad_}" height="{h+2*pad_}" rx="{14+pad_/2}" fill="none" stroke="#fff" stroke-width="3.5" opacity="{op}"/>'
        s += f'<rect x="{x-7:.1f}" y="{top-7}" width="{PW+14}" height="{h+14}" rx="16" fill="none" stroke="#fff" stroke-width="6" stroke-dasharray="15 10"/>'
        s += f'<text x="{x+PW/2:.1f}" y="{top+h/2+21}" text-anchor="middle" font-size="60" font-weight="900" fill="#fff">空</text>'
        return s


def labels(dims, sig_label, sig_dim=1.0, show_tags=True):
    out = [f'<text x="58" y="246" font-size="40" font-weight="700" fill="{SILK}" opacity="{.8*sig_dim}">招牌声</text>']
    for r, top in zip(ROWS, TOPS):
        cy = top + PH / 2
        d = dims.get(r, 1)
        if r == 'sig':
            out.append(f'<g opacity="{sig_dim}"><rect x="52" y="{cy-40}" width="252" height="80" rx="10" fill="url(#lcd)" stroke="#111" stroke-width="3"/>'
                       f'<text x="178" y="{cy+20}" text-anchor="middle" font-size="56" font-weight="900" fill="{COL["sig"]}" style="filter:drop-shadow(0 0 8px {COL["sig"]})">{sig_label}</text></g>')
        else:
            out.append(f'<g opacity="{d}"><text x="58" y="{cy+31}" font-size="88" font-weight="900" fill="{COL[r]}">{SYL[r]}</text>')
            if show_tags:
                out.append(f'<text x="160" y="{cy+15}" font-size="42" font-weight="500" fill="{SILK}" opacity=".9">{NAME[r]}</text>')
            out.append('</g>')
    return ''.join(out)


def grid(states, play, dims, col_light=None):
    out = []
    if col_light is not None:
        a, b, op = col_light
        x0 = cx(a) - 14; x1 = cx(b) + PW + 14
        out.append(f'<rect x="{x0:.1f}" y="{TOPS[0]-34}" width="{x1-x0:.1f}" height="{TOPS[-1]+PH-TOPS[0]+50}" rx="18" fill="#fff" opacity="{op}"/>')
    for i in range(16):
        on = i == play
        lx = cx(i) + PW / 2
        if on:
            out.append(f'<circle cx="{lx:.1f}" cy="{TOPS[0]-24}" r="17" fill="#FF3B30" opacity=".9" filter="url(#g8)"/>')
        out.append(f'<circle cx="{lx:.1f}" cy="{TOPS[0]-24}" r="7" fill="{"#FF5A4E" if on else "#5A2724"}"/>')
    for r, top in zip(ROWS, TOPS):
        for i in range(16):
            st, dm = states.get((r, i), ('off', 1))
            out.append(pad(i, top, PH, r, st, dm))
    return ''.join(out)


def beat_numbers(lit, y=212, dim_others=.55):
    out = []
    for b in range(4):
        x0 = cx(b * 4); x1 = cx(b * 4 + 3) + PW
        on = b == lit
        out.append(f'<line x1="{x0:.1f}" y1="{y+14}" x2="{x1:.1f}" y2="{y+14}" stroke="{SILK}" stroke-width="3" opacity="{.9 if on else .3}"/>')
        if on:
            out.append(f'<circle cx="{x0+PW/2:.1f}" cy="{y-22}" r="46" fill="#fff" opacity=".42" filter="url(#g18)"/>')
        out.append(f'<text x="{x0+PW/2:.1f}" y="{y}" text-anchor="middle" font-size="{72 if on else 62}" font-weight="900" fill="{"#fff" if on else SILK}" opacity="{1 if on else dim_others}">{b+1}</text>')
    return ''.join(out)


def bezel_leds(lit, x=1640, y=806):
    """Clue keys collapsed: 4 small LEDs on the bezel edge (top-right of the subtitle strip)."""
    s = []
    for k in range(4):
        on = k < lit
        cxp = x + k * 56
        if on:
            s.append(f'<circle cx="{cxp}" cy="{y}" r="13" fill="#FFB23E" opacity=".8" filter="url(#g8)"/>')
        s.append(f'<rect x="{cxp-18}" y="{y-6}" width="36" height="12" rx="6" fill="{"#FFE2A6" if on else "#3a3b3f"}"/>')
    return ''.join(s)


def pop_side(row, step, ch, size=104):
    """A syllable rising out of its own lit pad: a light streak from the pad to the glyph, glyph to the right of the window."""
    top = TOPS[ROWS.index(row)]
    x0 = cx(step) + PW; y = top + PH / 2
    gx = x0 + 120
    c = COL[row]
    return (f'<path d="M{x0-8:.1f},{y} L{gx-50:.1f},{y}" stroke="{c}" stroke-width="14" stroke-linecap="round" opacity=".55" filter="url(#g8)"/>'
            f'<circle cx="{gx:.1f}" cy="{y}" r="{size*0.55}" fill="{c}" opacity=".45" filter="url(#g30)"/>'
            f'<text x="{gx:.1f}" y="{y+size*0.36:.1f}" text-anchor="middle" font-size="{size}" font-weight="900" fill="#fff" stroke="{c}" stroke-width="7" paint-order="stroke" style="filter:drop-shadow(0 4px 12px rgba(0,0,0,.55))">{ch}</text>')


def vfd(text, sub='曲风', size=84, extra=''):
    return lcd(600, 28, 720, 104, f'<text x="640" y="96" font-size="40" font-weight="500" fill="#5FAF98">{sub}</text>'
               + tag_text(960, 110, text, size) + extra)


def frame(svg_body, subtitle, zoom=None):
    g = ''.join(svg_body)
    if zoom:
        zx, zy, s = zoom
        g = f'<g transform="translate({zx},{zy}) scale({s}) translate({-zx},{-zy})">{g}</g>'
    svg = f'<svg width="{W}" height="{H}" viewBox="0 0 {W} {H}">{defs()}{panel()}{g}</svg>'
    return page(svg + corner_html() + sub_html(subtitle))


# ---------------------------------------------------------------- frames

def hook():
    """0:00, line 1. The rock snippet is heard inside the 0.25 s window (steps 1-2); the rest of the bar waits at 30 %."""
    rock = {'sig': [0, 3, 6, 8, 11, 14], 'ci': [0, 2, 4, 6, 8, 10, 12, 14], 'da': [4, 12], 'dong': [0, 8]}
    st = {}
    for r, steps in rock.items():
        for i in steps:
            st[(r, i)] = ('hit', 1) if i == 0 else ('on', .3)
    body = [vfd('摇滚')]
    body.append(beat_numbers(0))
    body.append(grid(st, 0, {}, col_light=(0, 1, .10)))
    # the window: 2 sixteenths = 0.25 s at 120 bpm, mint frame over the whole grid height
    x0 = cx(0) - 16; x1 = cx(1) + PW + 16; y0 = TOPS[0] - 38; y1 = TOPS[-1] + PH + 16
    body.append(f'<rect x="{x0:.1f}" y="{y0}" width="{x1-x0:.1f}" height="{y1-y0}" rx="20" fill="none" stroke="{MINT}" stroke-width="12" opacity=".5" filter="url(#g8)"/>')
    body.append(f'<rect x="{x0:.1f}" y="{y0}" width="{x1-x0:.1f}" height="{y1-y0}" rx="20" fill="none" stroke="{MINT}" stroke-width="5"/>')
    # bracket + big number riding under the window
    by = y1 + 18
    body.append(f'<path d="M{x0+6:.1f},{by} L{x0+6:.1f},{by+16} L{x1-6:.1f},{by+16} L{x1-6:.1f},{by}" fill="none" stroke="{MINT}" stroke-width="5"/>')
    body.append(f'<text x="{(x0+x1)/2:.1f}" y="{by+118}" text-anchor="middle" font-size="104" font-weight="900" fill="{MINT}" style="filter:drop-shadow(0 0 14px rgba(120,255,215,.7))">0.25秒</text>')
    body.append(labels({}, '电吉他'))
    body.append(pop_side('dong', 1, '动', 104))
    body.append(pop_side('ci', 1, '次', 92))
    return frame(body, '只听<span class="k">0.25秒</span>，就猜得出曲风')


def reggae():
    """1:07, line 20. Hero = the beat-1 column: the empty 动 pad, beat number 1, the playhead. Camera pushed in ~8 %."""
    reg = {'ci': [2, 4, 6, 8, 10, 12, 14], 'da': [8], 'dong': [8]}
    st = {}
    for r, steps in reg.items():
        for i in steps:
            st[(r, i)] = ('on', .3)
    st[('dong', 0)] = ('empty', 1)
    body = [vfd('雷鬼')]
    body.append(beat_numbers(0, dim_others=.4))
    body.append(grid(st, 0, {}, col_light=(0, 0, .13)))
    body.append(labels({'ci': .45, 'da': .45, 'dong': 1}, '吉他嚓', sig_dim=.35))
    return _reggae_with_leds(body)


def _reggae_with_leds(body):
    g = ''.join(body)
    zx, zy, s = 330, 30, 1.08
    svg = (f'<svg width="{W}" height="{H}" viewBox="0 0 {W} {H}">{defs()}{panel()}'
           f'<g transform="translate({zx},{zy}) scale({s}) translate({-zx},{-zy})">{g}</g>{bezel_leds(4)}</svg>')
    return page(svg + corner_html() + sub_html('<span class="k">雷鬼</span>常见打法：第一拍空着'))


def answer_keys(x, y, w, h, gap, items):
    s = []
    for k, (letter, name) in enumerate(items):
        X = x + k * (w + gap)
        s.append(f'<rect x="{X-5}" y="{y-5}" width="{w+10}" height="{h+10}" rx="18" fill="#1E1F22"/>')
        s.append(f'<rect x="{X}" y="{y}" width="{w}" height="{h}" rx="14" fill="#4A4C52"/>')
        s.append(f'<rect x="{X+3}" y="{y+3}" width="{w-6}" height="6" rx="3" fill="#fff" opacity=".12"/>')
        s.append(f'<circle cx="{X+56}" cy="{y+h/2}" r="34" fill="#2A2C30" stroke="{SILK}" stroke-width="3"/>')
        s.append(f'<text x="{X+56}" y="{y+h/2+19}" text-anchor="middle" font-size="52" font-weight="900" fill="{SILK}">{letter}</text>')
        s.append(f'<text x="{X+110}" y="{y+h/2+20}" font-size="58" font-weight="900" fill="#FFF6E2">{name}</text>')
    return ''.join(s)


def quiz():
    """1:16, line 23. The lure is the hero: 动 on every beat. Everything else 30 %. VFD = ？, 4/4 clues, A/B/C keys."""
    q = {'sig': [4, 12], 'ci': [0, 2, 4, 6, 8, 10, 12, 14], 'da': [8], 'dong': [0, 4, 8, 12]}
    st = {}
    for r, steps in q.items():
        for i in steps:
            st[(r, i)] = ('on', .3)
    for i in (0, 4, 8, 12):
        st[('dong', i)] = ('hit', 1) if i == 4 else ('on', 1)
    body = [vfd('？', sub='曲风', size=96)]
    body.append(beat_numbers(1, dim_others=.55))
    body.append(grid(st, 4, {}))
    body.append(labels({'ci': .45, 'da': .45, 'dong': 1}, '？', sig_dim=.45))
    # 4 lit clue LEDs + counter (the tool you now hold)
    body.append(f'<rect x="55" y="655" width="440" height="114" rx="14" fill="#1E1F22"/>')
    body.append(f'<rect x="60" y="660" width="430" height="104" rx="12" fill="#3A3C41"/>')
    body.append(f'<text x="84" y="704" font-size="40" font-weight="700" fill="{SILK}">线索</text>')
    body.append(f'<text x="84" y="752" font-size="52" font-weight="900" fill="#FFE2A6">4/4</text>')
    for k in range(4):
        X = 230 + k * 62
        body.append(f'<circle cx="{X+22}" cy="712" r="22" fill="#FFB23E" opacity=".7" filter="url(#g8)"/>')
        body.append(f'<rect x="{X}" y="702" width="44" height="20" rx="10" fill="#FFE2A6"/>')
    body.append(answer_keys(530, 660, 420, 104, 25, [('A', 'House'), ('B', '雷鬼'), ('C', '摇滚')]))
    return frame(body, '线索齐了，考考你：这是哪种？')


if __name__ == '__main__':
    d = '/home/claude/video/episodes/30-music-genres/style/html/'
    open(d + 'storyA_hook.html', 'w').write(hook())
    open(d + 'storyA_reggae.html', 'w').write(reggae())
    open(d + 'storyA_quiz.html', 'w').write(quiz())
