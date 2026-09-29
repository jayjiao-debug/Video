"""Every shot of the film as a function of absolute time T -> float RGB frame."""

import math

import cv2
import numpy as np

from . import cameras as cam
from . import config as C
from .characters import (PAPER, Jar, Mira, draw_neighbor, draw_neighbor_roof,
                         draw_paper_star, draw_rooftop, flush_glows, pose_at, pt)
from .city import City, WARM, COOL
from .sky import Sky, airplane
from .util import (Canvas, add_glow, align_polygon, blur, clamp, ease_in_out, fbm,
                   hash_noise, lerp, resample_polygon, smoothstep, star_polygon)

_WORLD = None


class World:
    def __init__(self):
        self.city = City()
        self.sky = Sky()
        rng = np.random.default_rng(C.SEED + 2)
        self._make_paper_stars(rng)
        self._make_fold_background(rng)

    def _make_paper_stars(self, rng):
        # stars streaming out of the jar
        self.jar_stars = []
        n = 30
        for i in range(n):
            t0 = C.JAR_STREAM[0] + (C.JAR_STREAM[1] - C.JAR_STREAM[0]) * (i / n) ** 0.85 \
                + rng.uniform(-0.1, 0.1)
            self.jar_stars.append(dict(
                t0=t0, vx=rng.uniform(-70, -25), vy=rng.uniform(-75, -45),
                r=rng.uniform(4.5, 8.0), rot=rng.uniform(0, 6), spin=rng.uniform(-1, 1),
                ph=rng.uniform(0, 10)))
        # the river of stars over the city (drifting right-to-left)
        self.drift_stars = []
        for i in range(34):
            self.drift_stars.append(dict(
                t0=53.0 + i * 0.5 + rng.uniform(-0.3, 0.3), y=rng.uniform(90, 360),
                v=rng.uniform(55, 95), r=rng.uniform(4.0, 8.5), rot=rng.uniform(0, 6),
                spin=rng.uniform(-0.8, 0.8), ph=rng.uniform(0, 10)))
        # stars hanging over the blacked-out city
        self.hang_stars = []
        for i in range(30):
            self.hang_stars.append(dict(
                x=rng.uniform(40, C.W - 40), y=rng.uniform(80, 360),
                r=rng.uniform(3.5, 7.0), rot=rng.uniform(0, 6), spin=rng.uniform(-0.5, 0.5),
                ph=rng.uniform(0, 10), rise=rng.uniform(14, 30)))
        # a few left in the sky above the rooftop at the end
        self.high_stars = [dict(x=rng.uniform(80, 1200), y=rng.uniform(40, 300),
                                r=rng.uniform(2.5, 4.5), ph=rng.uniform(0, 10))
                           for _ in range(14)]

    def _make_fold_background(self, rng):
        h, w = C.H, C.W
        bg = np.zeros((h, w, 3), np.float32)
        bg[:] = np.linspace(0.03, 0.09, h, dtype=np.float32)[:, None, None] * \
            np.array((1.0, 0.75, 0.62), np.float32)
        for _ in range(170):
            x, y = rng.uniform(-40, w + 40), rng.uniform(-40, h * 0.75)
            r = rng.uniform(10, 46)
            col = np.array(WARM[rng.integers(4)] if rng.random() < 0.75 else COOL[rng.integers(2)],
                           np.float32)
            layer = np.zeros((h, w), np.float32)
            cv2.circle(layer, (int(x), int(y)), int(r), 1.0, -1, lineType=cv2.LINE_AA)
            bg += layer[..., None] * col * rng.uniform(0.03, 0.14)
        self.bokeh = blur(bg, 3.0)
        # the concrete ledge the paper sits on
        ledge = np.zeros((h, w), np.float32)
        yy, xx = np.mgrid[0:h, 0:w]
        top = 478 - xx * 0.015
        ledge[yy > top] = 1.0
        self.ledge_mask = blur(ledge, 1.0)[..., None]
        tex = fbm(rng, h, w, 16, 4)
        shade = np.clip(1.0 - (yy - top) / 420.0, 0.35, 1.0)
        self.ledge = ((0.035 + 0.03 * tex) * shade)[..., None] * np.array((1.0, 0.86, 0.78), np.float32)
        self.ledge = self.ledge.astype(np.float32)


def world():
    global _WORLD
    if _WORLD is None:
        _WORLD = World()
    return _WORLD


def city_glow(T):
    """Light pollution follows how much of the city is still lit."""
    f = world().city.lit_fraction(T)
    return clamp(f) ** 0.7


def starlight(T):
    return smoothstep(*C.STARS_IN, T) ** 1.4


def milky(T):
    return smoothstep(*C.MILKY_WAY_IN, T)


# ------------------------------------------------------------------ shots

def shot_title(T):
    frame = np.zeros((C.H, C.W, 3), np.float32)
    cv = Canvas()
    a = smoothstep(1.0, 2.6, T) * (1 - smoothstep(5.0, 6.6, T))
    cv.text(C.W / 2, C.H / 2 + 10, C.TITLE, 64, (0.93, 0.88, 0.8), a, tracking=0.32)
    frame = cv.composite(frame)
    # one tiny star glows above the title with the music-box phrase
    g = smoothstep(1.8, 3.4, T) * (1 - smoothstep(5.2, 6.8, T))
    glows = []
    cv_star = Canvas()
    draw_paper_star(cv_star, glows, C.W / 2, C.H / 2 - 70 - 4 * math.sin(T * 1.3), 7, T * 0.3, g, g)
    frame = cv_star.composite(frame)
    flush_glows(frame, glows)
    return frame


def shot_city_open(T):
    w = world()
    c = cam.city_open_cam(T)
    g = city_glow(T)
    frame = w.sky.render(T, g, 0, 0, cam.sky_offset(c), c["x"] * 0.05)
    airplane(frame, T, 9.5, 19.5, 150, 118)
    return w.city.render(frame, T, c, g)


ROOF_TOP = 590
HIP = (752, 574)
U = 175
ROOF_LAYERS = ("far", "mid")


def _rooftop_base(T, sky_boost=0.0):
    w = world()
    c = cam.rooftop_cam(T)
    g = city_glow(T)
    s, m = starlight(T), milky(T)
    frame = w.sky.render(T, g, s, m, cam.sky_offset(c), c["x"] * 0.05)
    return w, c, g, s, frame


def mira_rim(g, s):
    """Warm city glow before the blackout, cool starlight after."""
    warm = tuple(c * g for c in (0.22, 0.13, 0.08))
    cool = tuple(c * s for c in (0.16, 0.2, 0.32))
    return tuple(a + b for a, b in zip(warm, cool))


def _draw_roof_set(cv, T, g, s, neighbor=None):
    draw_neighbor_roof(cv, g, s)
    if neighbor:
        neighbor(cv)
    draw_rooftop(cv, T, g, top=ROOF_TOP)


def shot_rooftop_wait(T):
    w, c, g, s, frame = _rooftop_base(T)
    airplane(frame, T, 22.2, 29.5, 110, 160)
    frame = w.city.render(frame, T, c, g, layers=ROOF_LAYERS)
    cv = Canvas()
    _draw_roof_set(cv, T, g, s)
    glows = []
    jar = Jar(HIP[0] - 0.42 * U, ROOF_TOP - 4, U)
    jar.draw(cv, glows, T, 1e9, (1e9, 1e10), glow_boost=0.8)
    pose = pose_at(T, [(19.0, "rest"), (20.8, "search"), (23.6, "search"),
                       (C.PLANE_POINT, "point"), (26.6, "point"), (27.6, "slump"),
                       (29.6, "slump"), (31.0, "cup"), (33.0, "cup")])
    # a small breath: shoulders rise and fall
    breath = 1.2 * math.sin(T * 1.4)
    pose = dict(pose, torso=pose["torso"] + breath)
    Mira(HIP, U).draw(cv, pose, T, wind=0.8 + 0.3 * hash_noise(T * 0.5, 2), rim=mira_rim(g, s))
    frame = cv.composite(frame)
    flush_glows(frame, glows)
    return frame


def _fold_shape(t):
    """Paper outline and a crease-detail list for the insert shot (local t in s)."""
    cx, cy = 640, 404
    N = 140

    def strip(rot):
        L, Wd = 200, 18
        pts = [(-L, -Wd), (L, -Wd), (L, Wd), (-L, Wd)]
        ca, sa = math.cos(rot), math.sin(rot)
        return [(cx + x * ca - y * sa, cy + x * sa + y * ca) for x, y in pts]

    def knot(tail, rot, r=36):
        verts = [(cx + r * math.cos(rot + 2 * math.pi * i / 5 - math.pi / 2),
                  cy + r * math.sin(rot + 2 * math.pi * i / 5 - math.pi / 2)) for i in range(5)]
        (x1, y1), (x2, y2) = verts[1], verts[2]
        ax, ay = lerp(x1, x2, 0.25), lerp(y1, y2, 0.25)
        bx, by = lerp(x1, x2, 0.75), lerp(y1, y2, 0.75)
        nx, ny = (y2 - y1), -(x2 - x1)
        d = math.hypot(nx, ny)
        nx, ny = -nx / d, -ny / d
        if (ax - cx) * nx + (ay - cy) * ny < 0:
            nx, ny = -nx, -ny
        return [verts[0], verts[1], (ax, ay), (ax + nx * tail, ay + ny * tail),
                (bx + nx * tail, by + ny * tail), (bx, by), verts[2], verts[3], verts[4]]

    def star(rot, puff):
        return star_polygon(cx, cy, 64, 34, rot, puff=puff, n_sub=6)

    def morph(a, b, u):
        A = resample_polygon(a, N)
        B = align_polygon(A, resample_polygon(b, N))
        return [tuple(p) for p in A * (1 - u) + B * u]

    wraps = ease_in_out((t - 2.6) / 2.6) * 3  # three wraps, each turns the knot 72 degrees
    rot = -0.14 + (2 * math.pi / 5) * wraps
    tail = lerp(170, 5, ease_in_out((t - 2.6) / 2.6))
    if t < 1.2:
        return strip(-0.14 + 0.03 * math.sin(t)), "strip"
    if t < 2.6:
        return morph(strip(-0.14), knot(170, -0.14), ease_in_out((t - 1.2) / 1.4)), "knot"
    if t < 6.2:
        r = lerp(36, 40, ease_in_out((t - 2.6) / 2.6))
        return knot(tail, rot, r), "wrap"
    if t < 6.9:
        u = ease_in_out((t - 6.2) / 0.7)
        return morph(knot(5, rot, 40), star(rot, 0.9), u), "puff"
    return star(rot + (t - 6.9) * 0.08, 0.9), "star"


def shot_fold(T):
    w = world()
    t = T - C.FOLD_START
    frame = w.bokeh * (0.9 + 0.1 * math.sin(T * 0.7)) * lerp(1.0, 0.8, smoothstep(6, 9, t))
    frame = frame * (1 - w.ledge_mask) + w.ledge * w.ledge_mask
    frame[470:476] += np.array((0.05, 0.035, 0.028), np.float32) * np.linspace(1, 0, 6)[:, None, None]
    glow = smoothstep(C.FOLD_GLOW - C.FOLD_START, 9.0, t)
    lift = -18 * ease_in_out((t - 7.5) / 2.5)
    cv = Canvas()
    cv.oy = lift

    shape, stage = _fold_shape(t)
    light = 0.5 + 0.5 * glow
    paper = tuple(c * light for c in PAPER)
    # contact shadow
    cv.oy = 6
    cv.poly(shape, (0.0, 0.0, 0.0), 0.35 * (1 - smoothstep(7.5, 9, t)))
    cv.oy = lift
    cv.poly(shape, paper)
    edge = tuple(c * 0.72 for c in paper)
    cv.line(shape + shape[:1], 1.6, edge, 0.9)
    cx, cy = 640, 404
    if stage in ("wrap", "puff"):
        # layers of wound paper
        for k in range(3):
            a = -0.14 + k * 1.3 + ease_in_out((t - 2.6) / 2.6) * 3.7
            p0 = pt((cx, cy), math.degrees(a), 34)
            p1 = pt((cx, cy), math.degrees(a) + 150, 30)
            cv.line([p0, p1], 1.4, edge, 0.5 * (1 - smoothstep(6.2, 6.9, t)))
    if stage in ("puff", "star"):
        a = smoothstep(6.4, 7.0, t)
        rot = -0.14 + (2 * math.pi / 5) * 3 + max(0, t - 6.9) * 0.08
        for i in range(5):
            ang = rot + i * 2 * math.pi / 5 - math.pi / 2
            cv.line([(cx, cy), (cx + math.cos(ang) * 56, cy + math.sin(ang) * 56)], 2.0,
                    tuple(c * 0.78 for c in paper), 0.7 * a)
            ang2 = ang + math.pi / 5
            cv.line([(cx, cy), (cx + math.cos(ang2) * 30, cy + math.sin(ang2) * 30)], 1.4,
                    tuple(min(1, c * 1.08) for c in paper), 0.5 * a)

    # Mira's fingertips working the paper: two silhouetted hands
    cv.oy = 0
    _fold_hands(cv, t, shape, lift)
    frame = cv.composite(frame)
    add_glow(frame, cx, cy + lift, 170, (1.0, 0.62, 0.28), 0.55 * glow)
    add_glow(frame, cx, cy + lift, 60, (1.0, 0.85, 0.55), 0.5 * glow)
    return frame


def _fold_hands(cv, t, shape, lift):
    """Fingertips hold the paper's two outermost points, pinch it into shape,
    then let go and withdraw to reveal the star."""
    ink = (0.05, 0.034, 0.032)
    rim = (0.26, 0.15, 0.1)
    xs = [p[0] for p in shape]
    li, ri = xs.index(min(xs)), xs.index(max(xs))
    enter = smoothstep(0.0, 1.0, t)
    leave = ease_in_out((t - 7.1) / 1.3)
    pinch = math.sin(math.pi * clamp((t - 6.1) / 0.8))
    for idx, side in ((li, -1), (ri, 1)):
        px, py = shape[idx]
        px -= side * (4 + 8 * pinch)
        tip = (px - side * (1 - enter) * 160 - side * leave * 220,
               py + lift + (1 - enter) * 120 + leave * 180)
        for col, dy in ((rim, -2.5), (ink, 0.0)):
            wrist = (tip[0] - side * 72, tip[1] + 78 + dy)
            elbow = (tip[0] - side * 190, 790 + dy)
            palm = (lerp(wrist[0], tip[0], 0.3), lerp(wrist[1], tip[1] + dy, 0.3))
            cv.limb(elbow, wrist, 60, col)
            cv.ellipse(palm[0], palm[1], 32, 28, col)
            cv.limb((palm[0] + side * 4, palm[1] - 16), (tip[0], tip[1] + dy), 12, col)
            thumb = (tip[0] - side * 6, tip[1] + 12 + dy)
            cv.limb((palm[0] + side * 16, palm[1] + 6), thumb, 13, col)
            cv.limb((palm[0] - side * 2, palm[1] - 8),
                    (palm[0] + side * 26, palm[1] - 24 + dy * 0), 11, col)


RELEASE_POSES = [(41.0, "cup"), (44.2, "cup"), (45.6, "raise"), (C.FIRST_RELEASE + 0.3, "raise"),
                 (47.6, "watch"), (49.6, "watch"), (50.1, "lid"), (51.0, "lid"),
                 (52.2, "watch"), (57.0, "lean")]


def shot_release(T):
    w, c, g, s, frame = _rooftop_base(T)
    frame = w.city.render(frame, T, c, g, layers=ROOF_LAYERS)
    cv = Canvas()
    _draw_roof_set(cv, T, g, s)
    glows = []
    jar = Jar(HIP[0] - 0.42 * U, ROOF_TOP - 4, U)
    jar.draw(cv, glows, T, C.JAR_OPEN, C.JAR_STREAM, glow_boost=1.0)
    pose = pose_at(T, RELEASE_POSES)
    pose = dict(pose, torso=pose["torso"] + 1.0 * math.sin(T * 1.4))
    mira = Mira(HIP, U)
    J = mira.draw(cv, pose, T, wind=0.8 + 0.3 * hash_noise(T * 0.5, 2), rim=mira_rim(g, s))

    # the first star: in her hands, then floating up to hang in the sky
    hands = ((J["near_hand"][0] + J["far_hand"][0]) / 2, (J["near_hand"][1] + J["far_hand"][1]) / 2 - 6)
    if T < C.FIRST_RELEASE:
        sx, sy = hands
    else:
        u = ease_in_out((T - C.FIRST_RELEASE) / 4.0)
        dest = (640, 150)
        sx = lerp(hands[0], dest[0], u) + 10 * math.sin((T - C.FIRST_RELEASE) * 1.1) * u
        sy = lerp(hands[1], dest[1], u) + 5 * math.sin(T * 1.7) * u
        sx -= max(0, T - 50) * 6  # the wind picks it up once the others follow
    draw_paper_star(cv, glows, sx, sy, 8, T * 0.4, 1.0)

    # the jar empties into the wind
    mouth = (jar.x, jar.y - 0.34 * U)
    for st in w.jar_stars:
        dt = T - st["t0"]
        if dt < 0:
            continue
        x = mouth[0] + st["vx"] * dt - 6 * dt * dt + 10 * math.sin(dt * 1.5 + st["ph"])
        y = mouth[1] + st["vy"] * dt + 4 * math.sin(dt * 2.1 + st["ph"])
        if y < -30 or x < -30:
            continue
        a = smoothstep(0, 0.4, dt)
        draw_paper_star(cv, glows, x, y, st["r"] * lerp(0.6, 1.0, a), st["rot"] + st["spin"] * dt, 0.9, a)
    frame = cv.composite(frame)
    flush_glows(frame, glows)
    # warm light from the star on Mira while she holds it
    held = 1 - smoothstep(C.FIRST_RELEASE, C.FIRST_RELEASE + 1.5, T)
    add_glow(frame, hands[0], hands[1], 90, (1.0, 0.6, 0.3), 0.25 * held)
    return frame


def shot_drift(T):
    w = world()
    c = cam.drift_cam(T)
    g = city_glow(T)
    frame = w.sky.render(T, g, 0, 0, cam.sky_offset(c), c["x"] * 0.05)
    frame = w.city.render(frame, T, c, g)
    cv = Canvas()
    glows = []
    pan = (c["x"] - cam.drift_cam(57.0)["x"]) * 0.7  # stars sit between mid and near layers
    for st in w.drift_stars:
        dt = T - st["t0"]
        x = C.W + 40 - st["v"] * dt - pan
        y = st["y"] + 12 * math.sin(dt * 0.9 + st["ph"]) - dt * 2.0
        if -40 < x < C.W + 40:
            draw_paper_star(cv, glows, x, y, st["r"], st["rot"] + st["spin"] * dt, 0.9)
    frame = cv.composite(frame)
    flush_glows(frame, glows)
    return frame


def shot_blackout(T):
    w = world()
    c = cam.blackout_cam(T)
    g = city_glow(T)
    s, m = starlight(T), milky(T)
    frame = w.sky.render(T, g, s, m, cam.sky_offset(c), c["x"] * 0.05)
    frame = w.city.render(frame, T, c, g, starlight=s)
    cv = Canvas()
    glows = []
    rise_t = max(0.0, T - 94.0)
    for st in w.hang_stars:
        x = st["x"] - (T - 72) * 6 + 8 * math.sin(T * 0.5 + st["ph"])
        x = (x + 60) % (C.W + 120) - 60
        y = st["y"] + 6 * math.sin(T * 0.8 + st["ph"]) + c["y"] * 0.55 - rise_t ** 1.3 * st["rise"] * 0.5
        fade = 1 - 0.5 * smoothstep(97, 102, T)
        r = st["r"] * lerp(1.0, 0.6, smoothstep(95, 102, T))
        if -30 < y < C.H + 30:
            draw_paper_star(cv, glows, x, y, r, st["rot"] + st["spin"] * T, 0.95 * fade)
    frame = cv.composite(frame)
    flush_glows(frame, glows)
    return frame


def shot_together(T, cam_fn=cam.rooftop_cam):
    w = world()
    c = cam_fn(T)
    g = city_glow(T)
    s, m = starlight(T), milky(T)
    frame = w.sky.render(T, g, s, m, cam.sky_offset(c), c["x"] * 0.05)
    # drifting paper stars, high up now among the real ones
    cv = Canvas()
    glows = []
    for st in w.high_stars:
        x = st["x"] - (T - 102) * 3
        y = st["y"] + 4 * math.sin(T * 0.6 + st["ph"]) + c["y"] * 0.4
        draw_paper_star(cv, glows, x, y, st["r"], T * 0.2 + st["ph"], 0.7)
    _shooting_star(frame, T)
    frame = cv.composite(frame)
    flush_glows(frame, glows)
    frame = w.city.render(frame, T, c, g, layers=ROOF_LAYERS, starlight=s)

    cv = Canvas()
    cv.oy = c["y"]  # the rooftop leaves frame as we tilt up
    nb_raise = keyframes_raise(T)
    nb_wag = 1.0 if T < 110.6 else 0.0
    face = 150 if C.NEIGHBOR_WAVE - 1.0 < T < 110.8 else 60

    def neighbor(cvx):
        draw_neighbor(cvx, (1122, 522), 62, T, nb_raise, nb_wag, face, rim=mira_rim(g, s))

    _draw_roof_set(cv, T, g, s, neighbor)
    glows = []
    jar = Jar(HIP[0] - 0.42 * U, ROOF_TOP - 4, U)
    jar.draw(cv, glows, T, 0, (0, 1))
    pose = pose_at(T, [(101.0, "lean"), (C.MIRA_WAVE - 1.0, "lean"), (C.MIRA_WAVE, "wave"),
                       (110.2, "wave"), (C.SHOOTING_STAR + 0.2, "lean"),
                       (C.SHOOTING_STAR + 0.7, "lean_point"), (114.5, "lean_point"),
                       (116.0, "lean")])
    Mira(HIP, U).draw(cv, pose, T, wind=0.5, rim=mira_rim(g, s))
    frame = cv.composite(frame)
    return frame


def keyframes_raise(T):
    """Neighbor's arm: wave, lower, then point at the shooting star."""
    up = smoothstep(C.NEIGHBOR_WAVE, C.NEIGHBOR_WAVE + 0.5, T)
    down = smoothstep(110.2, 110.9, T)
    point = smoothstep(C.SHOOTING_STAR + 0.4, C.SHOOTING_STAR + 0.9, T) * \
        (1 - smoothstep(114.5, 115.5, T))
    return max(up * (1 - down), point)


def _shooting_star(frame, T):
    t0, dur = C.SHOOTING_STAR, 0.9
    if not (t0 <= T <= t0 + dur + 0.6):
        return
    head_u = clamp((T - t0) / dur)
    x0, y0, x1, y1 = 300, 70, 980, 250
    for k in range(26):
        u = head_u - k * 0.012
        if u < 0:
            break
        fade = (1 - k / 26) * (1 - smoothstep(t0 + dur, t0 + dur + 0.6, T))
        add_glow(frame, lerp(x0, x1, u), lerp(y0, y1, u), 4 if k else 7, (0.9, 0.95, 1.0), 0.9 * fade)


def shot_end(T):
    frame = shot_together(T, cam.end_cam)
    cv = Canvas()
    a1 = smoothstep(119.0, 120.2, T) * (1 - smoothstep(122.0, 122.8, T))
    cv.text(C.W / 2, C.H / 2 - 20, "Look up.", 44, (0.92, 0.9, 0.86), a1, font="serif-italic", tracking=0.08)
    a2 = smoothstep(122.9, 123.8, T)
    cv.text(C.W / 2, C.H / 2 - 16, C.TITLE, 54, (0.93, 0.88, 0.8), a2, tracking=0.32)
    cv.text(C.W / 2, C.H / 2 + 36, "every frame and every note made from code", 16,
            (0.7, 0.72, 0.78), a2 * 0.9, font="serif-italic", tracking=0.12)
    return cv.composite(frame)


SHOT_FUNCS = {
    "title": shot_title,
    "city_open": shot_city_open,
    "rooftop_wait": shot_rooftop_wait,
    "fold": shot_fold,
    "release": shot_release,
    "drift": shot_drift,
    "blackout": shot_blackout,
    "together": shot_together,
    "end": shot_end,
}
