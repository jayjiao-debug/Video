"""Mira (a posable silhouette rig), the neighbor, props, and paper stars."""

import math

from .util import add_glow, clamp, hash_noise, keyframes, lerp, star_polygon

INK = (0.012, 0.011, 0.016)
PAPER = (0.96, 0.88, 0.70)
STAR_GLOW = (1.0, 0.72, 0.36)


def pt(p, angle_deg, length):
    a = math.radians(angle_deg)
    return (p[0] + math.cos(a) * length, p[1] - math.sin(a) * length)


# ------------------------------------------------------------------ poses
# Absolute limb angles in degrees (0 = screen right, 90 = up).

POSES = {
    "rest": dict(torso=95, face=18, far_up=-72, far_lo=-8, near_up=-66, near_lo=-4, swing=1),
    "search": dict(torso=100, face=52, far_up=-75, far_lo=-10, near_up=-70, near_lo=-6, swing=1),
    "point": dict(torso=100, face=58, far_up=-75, far_lo=-10, near_up=58, near_lo=64, swing=0.3),
    "slump": dict(torso=93, face=6, far_up=-70, far_lo=-5, near_up=-68, near_lo=-2, swing=0.6),
    "cup": dict(torso=96, face=0, far_up=-58, far_lo=52, near_up=-62, near_lo=48, swing=0.2),
    "raise": dict(torso=103, face=55, far_up=78, far_lo=88, near_up=74, near_lo=84, swing=0.0),
    "watch": dict(torso=104, face=62, far_up=-72, far_lo=-10, near_up=-66, near_lo=-6, swing=0.5),
    "reach": dict(torso=92, face=-40, far_up=-118, far_lo=-150, near_up=-70, near_lo=-8, swing=0.2),
    "lid": dict(torso=90, face=-50, far_up=-112, far_lo=-165, near_up=-100, near_lo=-150, swing=0.2),
    "lean": dict(torso=116, face=64, far_up=-116, far_lo=-104, near_up=-122, near_lo=-108, swing=0.8),
    "wave": dict(torso=112, face=20, far_up=-116, far_lo=-104, near_up=36, near_lo=100, swing=0.8),
    "lean_point": dict(torso=114, face=58, far_up=-116, far_lo=-104, near_up=52, near_lo=58, swing=0.4),
}


def pose_at(t, keys):
    """keys: list of (time, pose_name). Returns interpolated pose dict."""
    return keyframes(t, [(k, POSES[p]) for k, p in keys])


class Mira:
    """Seated silhouette. hip: (x, y) screen px; u: body scale in px."""

    def __init__(self, hip, u):
        self.hip = hip
        self.u = u

    def joints(self, pose, T):
        u, hip = self.u, self.hip
        J = {"hip": hip}
        J["shoulder"] = pt(hip, pose["torso"], 0.42 * u)
        J["neck"] = pt(J["shoulder"], pose["torso"], 0.05 * u)
        J["head"] = pt(J["neck"], pose["torso"] - 0.25 * (pose["torso"] - 90) + 0.3 * pose["face"], 0.17 * u)
        sw = pose["swing"]
        for side, ph, knee_ang in (("far", 1.3, -2), ("near", 0.0, -6)):
            k = pt(hip, knee_ang, 0.36 * u)
            swing = sw * 14 * math.sin(T * 2.1 + ph)
            a = pt(k, -95 + swing, 0.36 * u)
            J[side + "_knee"], J[side + "_ankle"] = k, a
            J[side + "_toe"] = pt(a, -10 + swing * 0.5, 0.1 * u)
            sh = pt(J["shoulder"], 180 if side == "far" else 0, 0.02 * u)
            e = pt(sh, pose[side + "_up"], 0.25 * u)
            J[side + "_shoulder"], J[side + "_elbow"] = sh, e
            J[side + "_hand"] = pt(e, pose[side + "_lo"], 0.23 * u)
        return J

    def draw(self, cv, pose, T, wind=1.0, scarf=(0.20, 0.035, 0.045), rim=None):
        """Draw the figure. With rim=(r,g,b), first lay down a copy nudged
        up-left in the rim colour so the silhouette catches the sky light."""
        if rim is not None:
            ox, oy = cv.ox, cv.oy
            cv.ox, cv.oy = ox - 0.9, oy - 1.6
            self._draw(cv, pose, T, wind, rim, rim, rim)
            cv.ox, cv.oy = ox, oy
        return self._draw(cv, pose, T, wind, scarf, INK, tuple(c * 0.7 for c in INK))

    def _draw(self, cv, pose, T, wind, scarf, INK, far_ink):
        u = self.u
        J = self.joints(pose, T)
        # far limbs (behind body)
        cv.limb(J["far_shoulder"], J["far_elbow"], 0.065 * u, far_ink)
        cv.limb(J["far_elbow"], J["far_hand"], 0.06 * u, far_ink)
        cv.limb(J["hip"], J["far_knee"], 0.11 * u, far_ink)
        cv.limb(J["far_knee"], J["far_ankle"], 0.08 * u, far_ink)
        cv.limb(J["far_ankle"], J["far_toe"], 0.075 * u, far_ink)

        # scarf tail streaming behind (wind blows to screen-left)
        pts = []
        base = J["neck"]
        n = 9
        for i in range(n):
            s = i / (n - 1)
            flap = math.sin(T * 5.5 - s * 5) * 0.06 * u * s * wind
            gust = hash_noise(T * 0.8, 3) * 0.05 * u * s
            pts.append((base[0] - s * 0.45 * u * (0.6 + 0.4 * wind),
                        base[1] + s * 0.18 * u * (1.3 - wind) + flap + gust))
        for i in range(n - 1):
            w = lerp(0.075, 0.03, i / (n - 1)) * u
            cv.limb(pts[i], pts[i + 1], w, scarf)

        # torso, head
        cv.limb(J["hip"], J["shoulder"], 0.2 * u, INK)
        cv.circle(J["hip"][0] - 0.02 * u, J["hip"][1] - 0.02 * u, 0.11 * u, INK)
        cv.circle(J["neck"][0], J["neck"][1], 0.07 * u, scarf)
        hx, hy = J["head"]
        cv.circle(hx, hy, 0.16 * u, INK)
        face = pose["face"]
        nose = pt(J["head"], face - 8, 0.155 * u)
        cv.circle(nose[0], nose[1], 0.035 * u, INK)
        # ponytail from the back of the head
        anchor = pt(J["head"], face + 150, 0.14 * u)
        prev = anchor
        for i in range(1, 6):
            s = i / 5
            sway = math.sin(T * 4.2 - s * 3) * 0.035 * u * s * wind
            p = (anchor[0] - s * 0.2 * u * (0.5 + 0.5 * wind), anchor[1] + s * s * 0.14 * u + sway)
            cv.limb(prev, p, lerp(0.075, 0.03, s) * u, INK)
            prev = p

        # near limbs (in front)
        cv.limb(J["hip"], J["near_knee"], 0.11 * u, INK)
        cv.limb(J["near_knee"], J["near_ankle"], 0.08 * u, INK)
        cv.limb(J["near_ankle"], J["near_toe"], 0.075 * u, INK)
        cv.limb(J["near_shoulder"], J["near_elbow"], 0.065 * u, INK)
        cv.limb(J["near_elbow"], J["near_hand"], 0.06 * u, INK)
        cv.circle(J["near_hand"][0], J["near_hand"][1], 0.04 * u, INK)
        return J


def draw_neighbor(cv, feet, u, T, raise_amt, wag, face=120.0, rim=None):
    """Standing figure on the next roof. raise_amt 0..1 lifts the left arm;
    wag 0..1 turns the raised arm into a wave. face: gaze angle in degrees."""
    if rim is not None:
        ox, oy = cv.ox, cv.oy
        cv.ox, cv.oy = ox + 0.8, oy - 1.4
        _neighbor(cv, feet, u, T, raise_amt, wag, face, rim)
        cv.ox, cv.oy = ox, oy
    _neighbor(cv, feet, u, T, raise_amt, wag, face, (0.008, 0.009, 0.014))


def _neighbor(cv, feet, u, T, raise_amt, wag, face, ink):
    x, y = feet
    hip = (x, y - 0.5 * u)
    sh = (x, y - 1.05 * u)
    head = (x - 0.02 * u, y - 1.32 * u)
    cv.limb((x - 0.1 * u, y), hip, 0.14 * u, ink)
    cv.limb((x + 0.1 * u, y), hip, 0.14 * u, ink)
    cv.limb(hip, sh, 0.26 * u, ink)
    cv.circle(head[0], head[1], 0.15 * u, ink)
    nose = pt(head, face, 0.14 * u)
    cv.circle(nose[0], nose[1], 0.04 * u, ink)
    cv.limb(sh, (x + 0.12 * u, y - 0.55 * u), 0.09 * u, ink)
    # left arm (screen-left, toward Mira)
    elbow = (x - lerp(0.14, 0.34, raise_amt) * u, y - lerp(0.62, 1.22, raise_amt) * u)
    w = math.sin(T * 9.0) * 0.16 * u * raise_amt * wag
    hand = (elbow[0] - lerp(0.02, 0.12, raise_amt) * u + w,
            elbow[1] - lerp(-0.3, 0.38, raise_amt) * u)
    cv.limb(sh, elbow, 0.09 * u, ink)
    cv.limb(elbow, hand, 0.085 * u, ink)


def draw_water_tower(cv, x, roof_y, s, tone):
    legs_top = roof_y - 1.4 * s
    tank_top = legs_top - 1.15 * s
    w = 1.0 * s
    for lx in (x - 0.42 * w, x - 0.14 * w, x + 0.14 * w, x + 0.42 * w):
        cv.rect(lx - 0.025 * s, legs_top, lx + 0.025 * s, roof_y, tone)
    # cross bracing
    cv.line([(x - 0.42 * w, roof_y - 0.1 * s), (x + 0.42 * w, legs_top + 0.1 * s)], 0.02 * s, tone)
    cv.line([(x + 0.42 * w, roof_y - 0.1 * s), (x - 0.42 * w, legs_top + 0.1 * s)], 0.02 * s, tone)
    cv.rect(x - 0.5 * w, legs_top - 0.05 * s, x + 0.5 * w, legs_top + 0.04 * s, tone)
    cv.rect(x - 0.48 * w, tank_top, x + 0.48 * w, legs_top, tone)
    cv.poly([(x - 0.54 * w, tank_top + 0.02 * s), (x + 0.54 * w, tank_top + 0.02 * s),
             (x, tank_top - 0.45 * s)], tone)
    band = tuple(c * 1.6 + 0.01 for c in tone)
    for k in (0.25, 0.55, 0.85):
        yb = lerp(tank_top, legs_top, k)
        cv.rect(x - 0.48 * w, yb - 0.012 * s, x + 0.48 * w, yb + 0.012 * s, band, 0.6)
    # ladder
    cv.rect(x + 0.3 * w, tank_top, x + 0.32 * w, roof_y, band, 0.5)
    cv.circle(x, tank_top - 0.47 * s, 0.04 * s, tone)


def draw_rooftop(cv, T, glow, edge_x=780, top=572):
    """Mira's roof: deck, parapet, clutter. Returns parapet top y."""
    tone = (0.022, 0.02, 0.026)
    lip = tuple(lerp(0.04, 0.16, glow) * c for c in (1.0, 0.72, 0.6))
    draw_water_tower(cv, 210, top + 20, 150, (0.03, 0.026, 0.033))
    # vent pipe and antenna
    cv.rect(430, top - 60, 446, top, tone)
    cv.rect(424, top - 70, 452, top - 58, tone)
    cv.rect(560, top - 150, 564, top, tone)
    for k in range(4):
        yy = top - 150 + k * 16
        cv.rect(540 + k * 3, yy, 584 - k * 3, yy + 3, tone)
    # deck and parapet
    cv.rect(-10, top, edge_x, 740, (0.018, 0.017, 0.022))
    cv.rect(-10, top - 4, edge_x + 6, top + 14, (0.028, 0.025, 0.03))
    cv.rect(-10, top - 5, edge_x + 6, top - 3, lip, 0.9)
    return top - 4


def draw_neighbor_roof(cv, glow, starlight=0.0):
    tone = tuple(lerp(a, b, glow) + 0.012 * starlight * k
                 for a, b, k in zip((0.010, 0.011, 0.016), (0.034, 0.032, 0.044), (0.6, 0.8, 1.4)))
    cv.rect(930, 522, 1300, 740, tone)
    cv.rect(1010, 488, 1064, 522, tone)
    lip = tuple(lerp(0.05, 0.13, glow) * c for c in (1.0, 0.72, 0.6))
    cv.rect(928, 519, 1300, 521, lip, 0.8)
    # a few windows on its face, lit only while the city is lit
    return tone


class Jar:
    def __init__(self, x, base_y, u):
        self.x, self.y, self.u = x, base_y, u

    def draw(self, cv, frame_glows, T, open_t, stream, glow_boost=1.0):
        u = self.u
        x, y = self.x, self.y
        w, h = 0.22 * u, 0.32 * u
        remaining = 1.0 - clamp((T - stream[0]) / (stream[1] - stream[0]))
        # inner stars (dim glows seen through glass)
        n = int(22 * remaining + 0.5)
        for i in range(n):
            # stars settle in a heap: fill from the bottom, jittered in 2-D
            row, col = divmod(i, 4)
            px = x + ((col + 0.5) / 4 - 0.5) * w * 0.8 + hash_noise(i * 7.3, 11) * 0.02 * u
            py = y - 0.035 * u - row * 0.042 * u + hash_noise(i * 5.1, 4) * 0.012 * u
            frame_glows.append((px, py, 0.05 * u, 0.16 * glow_boost))
            tint = tuple(c * (0.75 + 0.25 * hash_noise(i * 1.7, 9)) for c in PAPER)
            cv.poly(star_polygon(px, py, 0.024 * u, 0.012 * u, i * 0.9), tint, 0.9)
        # glass
        cv.rect(x - w / 2, y - h, x + w / 2, y, (0.55, 0.6, 0.65), 0.1)
        cv.rect(x - w / 2, y - h, x - w / 2 + 0.012 * u, y, (0.8, 0.85, 0.9), 0.3)
        cv.rect(x + w / 2 - 0.012 * u, y - h, x + w / 2, y, (0.8, 0.85, 0.9), 0.2)
        cv.rect(x - w / 2 + 0.03 * u, y - h * 0.85, x - w / 2 + 0.042 * u, y - h * 0.2, (1, 1, 1), 0.12)
        # lid: on until opened, then set down beside the jar
        k = clamp((T - open_t) / 0.6)
        lx = lerp(x, x - 0.36 * u, k)
        ly = lerp(y - h - 0.03 * u, y - 0.02 * u, k)
        cv.rect(lx - w / 2 - 0.01 * u, ly - 0.02 * u, lx + w / 2 + 0.01 * u, ly + 0.03 * u, (0.05, 0.05, 0.06))


def draw_paper_star(cv, glows, x, y, r, rot, glow, alpha=1.0):
    """Body into the vector canvas; its glow is queued for the float frame."""
    body = tuple(c * (0.35 + 0.65 * clamp(glow)) for c in PAPER)
    cv.poly(star_polygon(x, y, r, r * 0.52, rot, puff=0.7), body, alpha)
    if r > 6:
        ridge = tuple(c * 0.8 for c in body)
        for i in range(5):
            a = rot + i * 2 * math.pi / 5 - math.pi / 2
            cv.line([(x, y), (x + math.cos(a) * r * 0.85, y + math.sin(a) * r * 0.85)],
                    max(0.6, r * 0.05), ridge, 0.5 * alpha)
    glows.append((x, y, r * 3.2, glow * alpha))


def flush_glows(frame, glows, color=STAR_GLOW):
    for (x, y, r, g) in glows:
        add_glow(frame, x, y, r, color, 0.55 * g)
        add_glow(frame, x, y, r * 0.35, (1.0, 0.9, 0.7), 0.5 * g)
