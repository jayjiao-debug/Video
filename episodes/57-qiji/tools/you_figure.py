"""ep57: the 「你」 character, elegant + loveable, gender-neutral. Built from joints so it animates:
tapered curved limbs, a soft bean body, a slightly big egg head (tilt), small round hands and feet,
soft volume shading. Variant 'face' adds dot eyes, a small smile and blush.
Use: from you_figure import figure; figure(J, unit, face=False) -> SVG string."""
import math
def _mid(a, b, t=.5): return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)
def _bez(a, c, b, n=24):
    return [((1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0], (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]) for t in [i / n for i in range(n + 1)]]
def limb(a, e, b, w0, w1, fill):
    """smooth tapered limb from a through (near) e to b"""
    c = (2 * e[0] - (a[0] + b[0]) / 2, 2 * e[1] - (a[1] + b[1]) / 2)
    pts = _bez(a, c, b); L, R = [], []
    for i, (x, y) in enumerate(pts):
        j = min(i + 1, len(pts) - 1); k = max(i - 1, 0); dx, dy = pts[j][0] - pts[k][0], pts[j][1] - pts[k][1]
        d = math.hypot(dx, dy) or 1; nx, ny = -dy / d, dx / d; w = (w0 + (w1 - w0) * i / (len(pts) - 1)) / 2
        L.append((x + nx * w, y + ny * w)); R.append((x - nx * w, y - ny * w))
    poly = L + R[::-1]
    return (f'<path d="M' + ' L'.join(f'{x:.1f},{y:.1f}' for x, y in poly) + f'Z" fill="{fill}"/>'
            f'<circle cx="{a[0]:.1f}" cy="{a[1]:.1f}" r="{w0 / 2:.1f}" fill="{fill}"/>')
def figure(J, u, face=False, tilt=6, fill='url(#yb)', tag=True, uid='y', chest=None):
    """J: joints dict (head, neck, l/r_shoulder, l/r_elbow, l/r_wrist, l/r_hip, l/r_knee, l/r_ankle); u: unit = shoulder width"""
    nk, hc = J['neck'], _mid(J['l_hip'], J['r_hip']); tl = math.dist(nk, hc)
    side = 1 if J['r_shoulder'][0] > J['l_shoulder'][0] else -1
    lr = (nk[0] - side * u * .3, nk[1] + tl * .14); rr = (nk[0] + side * u * .3, nk[1] + tl * .14)
    lh = (hc[0] - side * u * .17, hc[1]); rh = (hc[0] + side * u * .17, hc[1])
    g = []
    for root, (e, w) in ((lr, ('l_elbow', 'l_wrist')), (rr, ('r_elbow', 'r_wrist'))):
        g.append(limb(root, J[e], J[w], u * .15, u * .095, fill)); g.append(f'<circle cx="{J[w][0]:.1f}" cy="{J[w][1]:.1f}" r="{u * .072:.1f}" fill="{fill}"/>')
    for root, (k, a) in ((lh, ('l_knee', 'l_ankle')), (rh, ('r_knee', 'r_ankle'))):
        if k in J:
            g.append(limb(root, J[k], J[a], u * .19, u * .12, fill))
            fx = 1 if J[a][0] >= root[0] else -1
            g.append(f'<ellipse cx="{J[a][0] + fx * u * .05:.1f}" cy="{J[a][1] + u * .03:.1f}" rx="{u * .11:.1f}" ry="{u * .065:.1f}" fill="{fill}"/>')
    # soft bean body
    wc, ww, wh = u * .34, u * .3, u * .36
    body = (f'M{nk[0] - wc:.1f},{nk[1] + tl * .08:.1f} C{nk[0] - wc * 1.05:.1f},{nk[1] - tl * .06:.1f} {nk[0] + wc * 1.05:.1f},{nk[1] - tl * .06:.1f} {nk[0] + wc:.1f},{nk[1] + tl * .08:.1f} '
            f'C{nk[0] + ww * 1.05:.1f},{nk[1] + tl * .5:.1f} {hc[0] + wh * 1.15:.1f},{hc[1] + tl * .02:.1f} {hc[0] + wh * .6:.1f},{hc[1] + tl * .13:.1f} '
            f'Q{hc[0]:.1f},{hc[1] + tl * .2:.1f} {hc[0] - wh * .6:.1f},{hc[1] + tl * .13:.1f} C{hc[0] - wh * 1.15:.1f},{hc[1] + tl * .02:.1f} {nk[0] - ww * 1.05:.1f},{nk[1] + tl * .5:.1f} {nk[0] - wc:.1f},{nk[1] + tl * .08:.1f} Z')
    g.append(f'<path d="{body}" fill="{fill}"/>')
    chest_svg = ''
    if chest:
        cx, cy = _mid(nk, hc, .46); fs = u * chest.get('size', .34)
        if chest.get('badge'):
            chest_svg += f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{fs * .78:.1f}" fill="{chest["badge"]}"/>'
        chest_svg += (f'<text x="{cx:.1f}" y="{cy + fs * .04:.1f}" font-family="Noto Sans CJK SC" font-weight="900" font-size="{fs:.1f}" '
                      f'text-anchor="middle" dominant-baseline="central" fill="{chest.get("color", "#2B2724")}">你</text>')
    hx, hy = J['head']; hr = u * .28
    g.append(f'<g transform="rotate({tilt} {hx:.1f} {hy:.1f})"><ellipse cx="{hx:.1f}" cy="{hy:.1f}" rx="{hr:.1f}" ry="{hr * 1.08:.1f}" fill="{fill}"/>')
    if face:
        ex, ey = hr * .34, hr * .05
        g.append(f'<ellipse cx="{hx - ex:.1f}" cy="{hy + ey:.1f}" rx="{hr * .075:.1f}" ry="{hr * .1:.1f}" fill="#2B2724"/><ellipse cx="{hx + ex:.1f}" cy="{hy + ey:.1f}" rx="{hr * .075:.1f}" ry="{hr * .1:.1f}" fill="#2B2724"/>'
                 f'<path d="M{hx - hr * .16:.1f},{hy + hr * .3:.1f} Q{hx:.1f},{hy + hr * .45:.1f} {hx + hr * .16:.1f},{hy + hr * .3:.1f}" fill="none" stroke="#2B2724" stroke-width="{hr * .055:.1f}" stroke-linecap="round"/>'
                 f'<circle cx="{hx - hr * .56:.1f}" cy="{hy + hr * .3:.1f}" r="{hr * .14:.1f}" fill="#F4A9A0" opacity=".45"/><circle cx="{hx + hr * .56:.1f}" cy="{hy + hr * .3:.1f}" r="{hr * .14:.1f}" fill="#F4A9A0" opacity=".45"/>')
    g.append('</g>')
    out = f'<g filter="url(#yds)">{"".join(g)}</g>{chest_svg}'
    if tag:
        ts = u * .2; ty = hy - hr * 1.08 - ts * .45
        out += (f'<g filter="url(#yds)"><rect x="{hx - ts * .85:.1f}" y="{ty - ts * 1.25:.1f}" width="{ts * 1.7:.1f}" height="{ts * 1.25:.1f}" rx="{ts * .32:.1f}" fill="#FFF"/>'
                f'<path d="M{hx - ts * .18:.1f},{ty - 1:.1f} L{hx:.1f},{ty + ts * .28:.1f} L{hx + ts * .18:.1f},{ty - 1:.1f}Z" fill="#FFF"/></g>'
                f'<text x="{hx:.1f}" y="{ty - ts * .62:.1f}" font-family="Noto Sans CJK SC" font-weight="900" font-size="{ts * .9:.1f}" text-anchor="middle" dominant-baseline="central" fill="#1C1A18">你</text>')
    return out
DEFS = ('<defs><linearGradient id="yb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#FCFBF8"/><stop offset="1" stop-color="#E4E6EC"/></linearGradient>'
        '<filter id="yds" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="6" dy="12" stdDeviation="12" flood-color="#1A1410" flood-opacity=".3"/></filter></defs>')
