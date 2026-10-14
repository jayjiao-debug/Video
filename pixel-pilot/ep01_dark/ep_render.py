"""Ep1 《三十秒的黑暗》: subtitle-only cut on the owner's BGM from the very start (no opening, no voice).

Every picture change comes from timeline.json (ep_timeline.py): lines start on beats, the lights go
out on a quiet bar and come back on the kick's return, the question sits in the quiet before the
drop and the answer on the drop. The picture lands one frame before its subtitle.
Pixel art on a 5x grid (1080x1920, 30 fps); text and clues stay in the Douyin safe zone
(x 40-900, y 220-1400). Portraits are 128x128 with an expression per line and a manga symbol.

python3 ep_render.py              -> out/ep01_raw.mp4, deliverables/ep01_dark.mp4
python3 ep_render.py still 12 45  -> out/still_012.00.png ...
"""
import functools, json, math, pathlib, subprocess, sys
from concurrent.futures import ProcessPoolExecutor
import numpy as np
from PIL import Image, ImageDraw

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent
sys.path.insert(0, str(ROOT / "case01"))
sys.path.insert(0, str(ROOT / "opening"))
import case_kit as CK   # noqa: E402
from case_kit import W, H, FPS, K, INK, CREAM, GOLD, WHITE, up, camera, cam_path, ease, clamp, flash, shake, stamp, tag, study_at   # noqa: E402

ART, OUT = HERE / "art", HERE / "out"
MP3 = pathlib.Path("/mnt/user-data/uploads/hearth/7508b24e-b160-478f-9183-bf8b78c53551/7508b24e-b160-478f-9183-bf8b78c53551.mp3")
TL = json.loads((HERE / "timeline.json").read_text())
EV = TL["events"]
DUR = TL["duration"]
BEATS = np.array(TL["beats"])
BEAT = float(np.median(np.diff(BEATS)))
T0 = {e["id"]: e["t0"] for e in EV}
T1 = {e["id"]: e["t1"] for e in EV}
LEAD = 1 / FPS
NF = int(DUR * FPS)

SAFE_T, SAFE_B, SAFE_R, SAFE_CX, WRAP = 220, 1395, 900, 470, 12
BG = (14, 10, 20)
WINE = (120, 40, 44)
NAMES = dict(v="薇恩夫人", l="莉莉", z="扎卡里", g="格兰特上校", h="管家")
NET_RED = (226, 30, 42)          # the network's colour: only on the ink-line seal
INDIGO, PAPER, COPPER, MUSTARD = (44, 48, 110), (240, 230, 206), (110, 210, 190), (214, 170, 60)
MOON = (40, 60, 120)


def nb(t):
    return float(BEATS[np.argmin(np.abs(BEATS - t))])


def rgba(p):
    return Image.open(p).convert("RGBA")


@functools.lru_cache(maxsize=None)
def A(name):
    return rgba(ART / f"{name}.png")


# ------------------------------------------------------------------ small helpers
@functools.lru_cache(maxsize=1024)
def txt(s, scale=4, color=CREAM, outline=INK):
    return CK.text_img(s, scale, color, outline)


def put(f, im, x, y):
    f.paste(im, (int(round(x)), int(round(y))), im)


def put_c(f, im, cx, cy):
    put(f, im, cx - im.width / 2, cy - im.height / 2)


def blank(col=BG):
    return Image.new("RGBA", (W, H), col + (255,))


def shade(f, k, tint=(10, 6, 18), box=None):
    if k <= 0:
        return f
    if box is None:
        f.alpha_composite(Image.new("RGBA", f.size, tint + (int(255 * clamp(k)),)))
    else:
        x0, y0, x1, y1 = (int(v) for v in box)
        f.alpha_composite(Image.new("RGBA", (x1 - x0, y1 - y0), tint + (int(255 * clamp(k)),)), (x0, y0))
    return f


def breath(t, period=2.9, amp=4):
    return int(round(math.sin(2 * math.pi * t / period) * amp))


def ring(f, cx, cy, r, col=GOLD, w=8):
    ImageDraw.Draw(f).ellipse((cx - r, cy - r, cx + r, cy + r), outline=col + (255,), width=w)


@functools.lru_cache(maxsize=128)
def card_img(name, scale, dim=0.0, tint=None):
    p = A(name)
    im = up(p, scale)
    pad = 3 * scale
    c = Image.new("RGBA", (im.width + 2 * pad, im.height + 2 * pad), (0, 0, 0, 0))
    ImageDraw.Draw(c).rectangle((0, 0, c.width - 1, c.height - 1), fill=(44, 34, 58, 255), outline=K, width=max(4, scale))
    c.alpha_composite(im, (pad, pad))
    if tint:
        a = np.array(c).astype(float)
        g = a[..., :3].mean(2, keepdims=True)
        a[..., :3] = np.clip(g * np.array(tint) / 255 * 1.6, 0, 255)
        c = Image.fromarray(a.astype(np.uint8), "RGBA")
    if dim:
        c.alpha_composite(Image.new("RGBA", c.size, (10, 6, 18, int(255 * dim))))
    return c


def card(f, name, cx, cy, scale, dim=0.0, tint=None):
    im = card_img(name, scale, dim, tint)
    put_c(f, im, cx, cy)
    return (cx - im.width / 2, cy - im.height / 2, cx + im.width / 2, cy + im.height / 2)


def emote(f, name, box, t, t_on, scale=5):
    """Manga symbol at the card's top-right corner, popping in when the line lands."""
    if t < t_on:
        return
    k = clamp((t - t_on) / 0.12)
    s = max(1, int(round(scale * (0.6 + 0.4 * k + 0.25 * math.sin(math.pi * k)))))
    im = up(A(f"emote_{name}"), s)
    x1, y0 = box[2], box[1]
    put_c(f, im, min(x1 - 30, SAFE_R - im.width / 2 - 4), y0 + 40)


@functools.lru_cache(maxsize=32)
def holmes_img(pose, scale, patch=False):
    im = CK.HOLMES[pose].copy()
    if patch:   # the pirate: a patch over his right eye
        d = ImageDraw.Draw(im)
        d.line((18, 15, 31, 20), fill=K)
        d.line((36, 21, 41, 23), fill=K)
        d.ellipse((30, 19, 36, 26), fill=K)
    return up(im, scale)


def holmes(f, t, pose, cx, feet, scale=8, enter=None, patch=False):
    if pose == "idle" and (t % 3.7) < 0.12:
        pose = "blink"
    im = holmes_img(pose, scale, patch)
    dy = 0
    if enter is not None and t < enter + 0.35:
        dy = (1 - ease((t - enter) / 0.35)) * 600
    put(f, im, cx - im.width / 2, feet - im.height + dy)


def wrap(txt_, n=14):
    """Fewest rows of at most n characters, balanced, breaking after punctuation (from case_render)."""
    P = "，。：？！…、"
    L = len(txt_)
    if L <= n:
        return [txt_]
    best = None
    kmin = -(-L // n)
    for k in range(kmin, L + 1):
        ideal = L / k
        cost = {0: (0.0, [])}
        for j in range(1, L + 1):
            for i in list(cost):
                seg = txt_[i:j]
                body = seg[:-1] if seg[-1] in P else seg
                if len(body) > n or seg[0] in P or len(cost[i][1]) >= k:
                    continue
                if j < L and txt_[j] in P:
                    continue
                c = cost[i][0] + (len(seg) - ideal) ** 2 + (0 if seg[-1] in P or j == L else 60)
                if j not in cost or c < cost[j][0]:
                    cost[j] = (c, cost[i][1] + [seg])
        if L in cost:
            c = cost[L][0] + 40 * (k - kmin)
            if best is None or c < best[0]:
                best = (c, cost[L][1])
            if k > kmin:
                break
    best = best and best[1]
    return best or [txt_[i:i + n] for i in range(0, L, n)]


def rows_of(text):
    out = []
    for seg in text.split("|"):
        out += wrap(seg, WRAP)
    return out


# ------------------------------------------------------------------ subtitles
SHOW_FROM = {e["id"]: e["t0"] for e in EV}
SHOW_UNTIL = {e["id"]: e["t1"] for e in EV}
SHOW_FROM["r10"] = T0["r10"] + BEAT          # the flip lands first, its line one beat later
SHOW_UNTIL["r9"] = SHOW_FROM["r10"]          # so the verdict reads in full


def sub_at(t):
    cur = None
    for e in EV:
        if e["kind"] in ("n", *NAMES) and SHOW_FROM[e["id"]] <= t < SHOW_UNTIL[e["id"]]:
            cur = e
    return cur


def subtitle(f, t):
    e = sub_at(t)
    if not e:
        return
    rows = rows_of(e["text"])
    d = ImageDraw.Draw(f)
    if e["kind"] in NAMES:
        y0 = SAFE_B - 90 - 74 * len(rows)
        d.rectangle((24, y0, SAFE_R + 4, y0 + 90 + 74 * len(rows)), fill=(250, 244, 226, 255), outline=K, width=8)
        d.rectangle((36, y0 + 12, SAFE_R - 8, y0 + 78 + 74 * len(rows)), outline=(190, 170, 130), width=3)
        nm = txt(NAMES[e["kind"]], 3, CREAM, None)
        d.rectangle((48, y0 - 50, 48 + nm.width + 36, y0 + 4), fill=WINE, outline=K, width=5)
        put(f, nm, 66, y0 - 44)
        y = y0 + 40
        for r in rows:
            put(f, txt(r, 4, INK, None), 60, y)
            y += 74
        return
    y = SAFE_B + 5 - 30 - 70 * len(rows)
    shade(f, 0.8, (14, 10, 20), (0, y - 30, W, y + 70 * len(rows) + 30))
    for r in rows:
        im = txt(r, 4, CREAM, INK)
        put(f, im, SAFE_CX - im.width // 2, y)
        y += 70


# ------------------------------------------------------------------ the drawing room
def _pad(im):
    """Floor continued below the art so the camera can sit lower: the table lands at screen y ~1000."""
    return Image.fromarray(np.pad(np.array(im), ((0, 64), (0, 0), (0, 0)), mode="edge"), "RGBA")


SALON = {k: _pad(A(f"salon_{k}")) for k in ("before", "after")}
ROOM_CY = 252                  # camera centre (art y) for the room view at 5x
CLOCK = (170, 105, 11)


def room_y(art_y):
    return (art_y - (ROOM_CY - 192)) * 5


def clock_art(which, hh, mm):
    a = SALON[which].copy()
    d = ImageDraw.Draw(a)
    cx, cy, r = CLOCK
    am = math.pi * 2 * mm / 60
    ah = math.pi * 2 * ((hh % 12) + mm / 60) / 12
    d.line((cx, cy, cx + (r - 3) * math.sin(am), cy - (r - 3) * math.cos(am)), fill=K)
    d.line((cx, cy, cx + (r - 6) * math.sin(ah), cy - (r - 6) * math.cos(ah)), fill=K, width=2)
    d.point((cx, cy), fill=(150, 50, 40, 255))
    return a


@functools.lru_cache(maxsize=16)
def room(which, k=0.0, hh=10, mm=40):
    return shade(camera(clock_art(which, hh, mm), 108, ROOM_CY, 5).copy(), k)


def room_push(t, t0, which, d=6.0, k=0.0):
    """Slow push into the room on its own clock (5x -> ~5.6x), easing to rest."""
    z = 5 + 0.6 * ease((t - t0) / d)
    return shade(camera(clock_art(which, 10, 40), 108, ROOM_CY + 6 * ease((t - t0) / d), z).copy(), k)


PIANO_XY = (790, room_y(250))
EASEL_XY = (200, room_y(240))


def notes(f, t, t0, alpha_k=1.0):
    """Music notes drifting up from the piano on their own clock (the magician kept playing)."""
    rng = np.random.default_rng(9)
    offs = rng.uniform(0, 1, 12)
    xs = rng.uniform(-90, 90, 12)
    for i in range(12):
        ph = ((t - t0) * 0.55 + offs[i]) % 1
        if t - t0 < offs[i] / 0.55:
            continue
        x = PIANO_XY[0] + xs[i] + 30 * math.sin(ph * 6 + i)
        y = PIANO_XY[1] - 40 - ph * 420
        if ph < 0.85:
            put_c(f, up(A("emote_note"), 5), x, y)


def dark_room(t, t0, colonel_eye=False):
    """Lights out: the room in moonlight. Through the colonel's eyes it stays readable, in blue."""
    f = room("before" if not colonel_eye else "before", 0.0).copy()
    if colonel_eye:
        a = np.array(f).astype(float)
        g = a[..., :3].mean(2, keepdims=True)
        a[..., :3] = np.clip(g * np.array([0.55, 0.75, 1.25]) * 0.8, 0, 255)
        return Image.fromarray(a.astype(np.uint8), "RGBA")
    shade(f, 0.93, (4, 6, 16))
    # moonlight through the window
    win = camera(clock_art("before", 10, 45), 108, ROOM_CY, 5).crop((350, 0, 700, room_y(240)))
    wa = np.array(win).astype(float)
    wa[..., :3] = np.clip(wa[..., :3].mean(2, keepdims=True) * np.array([0.35, 0.45, 0.8]), 0, 255)
    f.paste(Image.fromarray(wa.astype(np.uint8), "RGBA"), (350, 0))
    return f


# ------------------------------------------------------------------ scenes
def sc_hook(t):
    f = blank((4, 4, 8))
    k = 0.5 + 0.5 * math.sin(t * 2.1)                      # a slow glint in the dark
    s = 7 + int(2 * k)
    put_c(f, up(A("emote_spark"), s), SAFE_CX, 720)
    return f


def sc_holmes(t):
    f = study_at_cached(t)
    if t < T0["past"] - LEAD:
        pose = "idle"
    elif t < T0["vow"] - LEAD:
        pose = "think"
    else:
        pose = "deduce"
    holmes(f, t, pose, SAFE_CX, 1120, 8, enter=T0["me"] - LEAD)
    if T0["me"] + 0.3 <= t < T0["past"] - LEAD:
        tag(f, "福尔摩斯", SAFE_CX, 470, t=t - T0["me"] - 0.3)
    if t >= nb(T0["vow"] + 1.9) - LEAD:
        stamp(f, "侦探：你", SAFE_CX, 400, t - (nb(T0["vow"] + 1.9) - LEAD), GOLD, 6, -6)
    return f


def study_at_cached(t):
    return shade(camera(study_at(t), 108, 192, 5).copy(), 0.35)


def sc_room(t):
    return room_push(t, T0["look"] - LEAD, "before")


INTRO = dict(c_lady=("lady_smile", "note", "夫人"), c_lily=("lily_angry", "anger", "画家"), c_mag=("magician_smug", "spark", "魔术师"),
             c_col=("colonel_calm", None, "上校"), c_but=("butler_calm", None, "管家"))


def intro(t, key, extra=None):
    name, emo, role = INTRO[key]
    f = room("before", 0.5).copy()
    t_on = min(e["t0"] for e in EV if e["scene"] == key) - LEAD
    dy = (1 - ease((t - t_on) / 0.2)) * 80 if t < t_on + 0.2 else 0
    cx = SAFE_CX if extra is None else 600
    box = card(f, name, cx, 720 + breath(t) + dy, 4)
    tag(f, role, cx, 410, GOLD, INK, 3, t - t_on)
    if emo:
        emote(f, emo, box, t, t_on + 0.1)
    if extra:
        extra(f, t, t_on)
    return f, box


def sc_c_lady(t):
    return intro(t, "c_lady")[0]


def painting_inset(f, which, cx, cy, scale):
    p = up(A(f"painting_{which}"), scale)
    d = ImageDraw.Draw(f)
    x0, y0 = cx - p.width / 2, cy - p.height / 2
    d.rectangle((x0 - 14, y0 - 14, x0 + p.width + 14, y0 + p.height + 14), fill=(110, 70, 40), outline=K, width=6)
    put(f, p, x0, y0)


def sc_c_lily(t):
    def ex(f, t, t_on):
        painting_inset(f, "before", 230, 560, 3)
    f, _ = intro(t, "c_lily", ex)
    return f


def sc_c_mag(t):
    return intro(t, "c_mag")[0]


def sc_c_col(t):
    f, box = intro(t, "c_col")
    if t >= T0["g2"] - LEAD:
        emote(f, "spark", box, t, T0["g2"])
    return f


def sc_c_but(t):
    return intro(t, "c_but")[0]


def sc_clock(t):
    t0 = T0["clock"] - LEAD
    mm = 45 if t >= T0["dark"] - BEAT - LEAD else 44     # the minute hand clicks over one beat before the dark
    cx, cy, z = cam_path(t, [(t0, 108, ROOM_CY, 5), (t0 + 0.5, CLOCK[0], CLOCK[1], 14)])
    return camera(clock_art("before", 10, mm), cx, cy, z if t < t0 + 0.5 else 14).copy()


def sc_dark(t):
    t0 = T0["dark"]
    f = dark_room(t, t0)
    notes(f, t, t0)
    if t >= t0 + 0.8:
        put_c(f, txt("哗啦！", 4, (150, 190, 230)), EASEL_XY[0], EASEL_XY[1] - 120)
    return f


def sc_lights(t):
    t0 = T0["v2"]
    dx, dy = shake(t, t0, 14, 0.3)
    f = room("after").copy()
    box = card(f, "lady_shock", 300 + dx, 560 + dy, 3)
    emote(f, "bang", box, t, t0 + 0.05)
    if t0 - LEAD <= t < t0 + 0.25:
        flash(f, 0.8 * (1 - (t - t0) / 0.25))
    return f


TITLE_CUTS = ["三", "十", "秒", "的", "黑", "暗"]


def sc_title(t):
    t0 = T0["title"]
    f = room("after", 0.75).copy()
    lab = txt("案卷 No.001", 3, GOLD)
    put(f, lab, SAFE_CX - lab.width / 2, 600)
    full = txt("".join(TITLE_CUTS), 8, CREAM)
    n = int(clamp((t - t0) / (BEAT / 2) + 1, 0, len(TITLE_CUTS)))
    if n > 0:
        w = int((2 + CK.FONT.getlength("".join(TITLE_CUTS[:n]))) * 8 + 8)
        put(f, full.crop((0, 0, min(w, full.width), full.height)), SAFE_CX - full.width / 2, 720)
    if n == len(TITLE_CUTS):
        ImageDraw.Draw(f).rectangle((SAFE_CX - full.width / 2, 900, SAFE_CX + full.width / 2, 906), fill=GOLD)
    return f


def sc_room_after(t):
    return room_push(t, T0["n1"] - LEAD, "after")


AFTER = dict(a_lady=("lady_cry", "sweat"), a_mag=("magician_after", "sweat"), a_lily=("lily_after", "bang"),
             a_but=("butler_nervous", "sweat"), a_col=("colonel_after", None))


def jar(f, cx, cy):
    d = ImageDraw.Draw(f)
    d.ellipse((cx - 110, cy + 30, cx + 110, cy + 70), fill=(110, 150, 190), outline=K, width=4)       # puddle
    d.rectangle((cx - 60, cy - 10, cx + 50, cy + 40), fill=(170, 160, 150), outline=K, width=5)        # jar on its side
    d.ellipse((cx + 30, cy - 14, cx + 70, cy + 44), fill=(80, 100, 130), outline=K, width=5)


def after(t, key, extra=None):
    name, emo = AFTER[key]
    f = room("after", 0.5).copy()
    t_on = min(e["t0"] for e in EV if e["scene"] == key) - LEAD
    box = card(f, name, SAFE_CX, 720 + breath(t), 4)
    if emo:
        emote(f, emo, box, t, t_on + 0.1)
    if extra:
        extra(f, t, t_on, box)
    return f


def sc_a_lady(t):
    return after(t, "a_lady")


def sc_a_mag(t):
    return after(t, "a_mag")


def sc_a_lily(t):
    return after(t, "a_lily", lambda f, t, t_on, box: jar(f, 760, 1040))


def sc_a_but(t):
    return after(t, "a_but")


def sc_a_col(t):
    def ex(f, t, t_on, box):
        if t >= T0["g4"] - LEAD:
            emote(f, "spark", box, t, T0["g4"])
    return after(t, "a_col", ex)


def sc_painting(t):
    f = blank((30, 22, 26))
    painting_inset(f, "after", SAFE_CX, 720, 10)
    return f


def envelope(f, cx, cy, sealed_t):
    d = ImageDraw.Draw(f)
    x0, y0, x1, y1 = cx - 160, cy - 105, cx + 160, cy + 105
    d.rectangle((x0 + 10, y0 + 10, x1 + 10, y1 + 10), fill=(8, 6, 12))
    d.rectangle((x0, y0, x1, y1), fill=(236, 222, 186), outline=K, width=6)
    d.line((x0, y0, cx, cy + 10), fill=(170, 150, 110), width=5)
    d.line((x1, y0, cx, cy + 10), fill=(170, 150, 110), width=5)
    if sealed_t > 0:
        k = min(1, sealed_t / 0.12)
        r = int(44 * (1 + (1 - k) * 1.2))
        d.ellipse((cx - r, cy + 10 - r, cx + r, cy + 10 + r), fill=WINE, outline=K, width=5)
        if k >= 1:
            put_c(f, txt("H", 4, GOLD, None), cx, cy + 10)


SEAL = nb(T0["ask"] - 1.5)


def sc_ready(t):
    t0 = T0["ready"] - LEAD
    f = shade(camera(study_at(t), 108, 192, 5).copy(), 0.45)
    holmes(f, t, "deduce", 300, 1130, 7)
    dx = (1 - ease((t - t0) / 0.3)) * 600 if t < t0 + 0.3 else 0
    dsx, dsy = shake(t, SEAL, 10, 0.25)
    envelope(f, 690 + dx + dsx, 760 + dsy, t - SEAL)
    return f


# ---- evidence board: each person before -> after, and the painting
PAIRS = [("lady_smile", "lady_cry", "夫人"), ("lily_angry", "lily_after", "莉莉"), ("magician_smug", "magician_after", "扎卡里"),
         ("colonel_calm", "colonel_after", "上校"), ("butler_calm", "butler_nervous", "管家"), (None, None, "那幅画")]
COUNT = [nb(T1["ask"] - (5 - i) * 2 * BEAT) for i in range(5)]


@functools.lru_cache(maxsize=1)
def board_base():
    f = blank((16, 12, 24))
    put_c(f, txt("蓝宝石在哪？", 4, CREAM), SAFE_CX, 262)
    put_c(f, txt("是谁拿走的？", 4, GOLD), SAFE_CX, 336)
    put_c(f, txt("灯灭前 → 灯亮后", 2, (200, 190, 170)), SAFE_CX, 418)
    d = ImageDraw.Draw(f)
    for i, (a, b, lab) in enumerate(PAIRS):
        cx, cy = (175, 470, 765)[i % 3], 610 + 360 * (i // 3)
        d.rectangle((cx - 134, cy - 150, cx + 134, cy + 170), fill=(44, 34, 58), outline=GOLD, width=4)
        if a:
            put_c(f, A(a), cx - 66, cy)
            put_c(f, A(b), cx + 66, cy)
        else:
            put_c(f, A("painting_before").resize((120, 96), Image.NEAREST), cx - 64, cy)
            put_c(f, A("painting_after").resize((120, 96), Image.NEAREST), cx + 64, cy)
        put_c(f, txt("→", 2, GOLD), cx, cy + 4)
        put_c(f, txt(lab, 2, CREAM), cx, cy + 128)
    put_c(f, txt("⏸ 暂停 · 把推理写在评论区", 3, WHITE), SAFE_CX, 1345)
    return f


def sc_board(t):
    f = board_base().copy()
    for i, c in enumerate(COUNT):
        nxt = COUNT[i + 1] if i + 1 < len(COUNT) else T1["ask"]
        if c - LEAD <= t < nxt - LEAD:
            put_c(f, txt(str(5 - i), 7, GOLD), 832, 300)
    return f


# ---- the answer
def sc_most(t):
    t0 = T0["r0"]
    f = blank((20, 14, 26))
    dx, dy = shake(t, t0, 16, 0.3)
    b1 = card(f, "magician_smug", 260 + dx, 700 + dy, 3)
    b2 = card(f, "lily_angry", 680 + dx, 700 + dy, 3)
    emote(f, "ask", b1, t, t0, 6)
    emote(f, "ask", b2, t, nb(t0 + 2.1) - LEAD, 6)
    if t0 - LEAD <= t < t0 + 0.25:
        flash(f, 0.75 * (1 - (t - t0) / 0.25))
    return f


def sc_piano(t):
    f = dark_room(t, T0["dark"])
    notes(f, t, T0["r1"] - 3)
    card(f, "magician_after", 760, 420, 2, dim=0.3)
    return f


def sc_gem(t):
    t0 = T0["r2"] - LEAD
    t2 = nb(T0["r2"] + 2.0)
    f = blank((24, 18, 26))
    painting_inset(f, "before", SAFE_CX, 520, 5)
    painting_inset(f, "after", SAFE_CX, 900, 5)
    tag(f, "灯灭前", 140, 360, CREAM, INK, 2)
    tag(f, "灯亮后", 140, 740, GOLD, INK, 2)
    if t >= t2 - LEAD:
        gx, gy = SAFE_CX, 900 - 160 + int(64 * 0.56) * 5
        ring(f, gx, gy, 46)
    return f


def sc_jar(t):
    f = room("after", 0.55).copy()
    box = card(f, "lily_after_sad", SAFE_CX, 700, 4)
    jar(f, 760, 1040)
    put_c(f, txt("哗啦！", 4, (150, 190, 230)), 760, 960)
    return f


def sc_replay(t):
    """The dark again, seen through the colonel's dark-adapted eyes: dim blue, but everyone is visible."""
    t0 = T0["r4"] - LEAD
    f = dark_room(t, t0, colonel_eye=True)
    for name, x, y in (("lily_shock", 200, 700), ("lady_shock", 470, 560), ("magician_shock", 780, 660), ("butler_nervous", 820, 380)):
        card(f, name, x, y, 1, tint=MOON)
    notes(f, t, t0 - 2)
    # the stone travels from the cushion to the canvas, on its own clock
    k = ease(clamp((t - t0 - 0.8) / 1.4))
    sx, sy = 505, room_y(255)
    ex, ey = EASEL_XY[0] - 5, room_y(239)
    x = sx + (ex - sx) * k
    y = sy + (ey - sy) * k - math.sin(math.pi * k) * 160
    if k < 1:
        put_c(f, up(A("emote_spark"), 4), x, y)
    vig = Image.new("L", (W, H), 0)
    ImageDraw.Draw(vig).ellipse((-160, 120, W + 160, 1560), fill=255)
    black = blank((2, 2, 6))
    black.paste(f, (0, 0), vig)
    return black


def sc_lenses(t):
    t2 = nb(T0["r5"] + 1.6)
    f = blank((20, 14, 26))
    card(f, "colonel_calm", 250, 700, 3)
    b = card(f, "colonel_after", 690, 700, 3)
    tag(f, "灯灭前", 250, 470, CREAM, INK, 2)
    tag(f, "灯亮后", 690, 470, GOLD, INK, 2)
    if t >= t2 - LEAD:
        ring(f, 690 - 192 + 9 + 70 * 3, 700 - 192 + 9 + 52 * 3, 90)
    return f


def sc_pirate(t):
    t2 = nb(T0["r6"] + 2.9)
    f = blank((22, 18, 30))
    b = card(f, "colonel_calm", 250 if t >= t2 - LEAD else SAFE_CX, 700, 3)
    if t >= t2 - LEAD:
        holmes(f, t, "deduce", 680, 1000, 7, patch=True)
        emote(f, "spark", (520, 420, 840, 900), t, t2)
    return f


def sc_meter(t):
    t0 = T0["r7"] - LEAD
    k = ease(clamp((t - t0 - 0.4) / 1.3))                  # one quick sweep: 9:45 -> 10:45
    mins = 9 * 60 + 45 + 60 * k
    hh, mm = int(mins // 60), mins % 60
    f = camera(clock_art("before", hh, mm), CLOCK[0], CLOCK[1] + 30, 10).copy()
    put_c(f, txt(f"{hh}:{int(mm):02d}", 6, GOLD), SAFE_CX, 1020)
    return f


def sc_glove(t):
    t2 = nb(T0["r8"] + 1.7)
    f = blank((20, 14, 26))
    crop = A("colonel_after").crop((28, 80, 88, 128))
    im = up(crop, 12)
    d = ImageDraw.Draw(f)
    d.rectangle((SAFE_CX - im.width / 2 - 16, 700 - im.height / 2 - 16, SAFE_CX + im.width / 2 + 16, 700 + im.height / 2 + 16),
                fill=(44, 34, 58), outline=K, width=8)
    put_c(f, im, SAFE_CX, 700)
    if t >= t2 - LEAD:
        a = np.array(A("colonel_after"))
        ys, xs = np.where((a[..., 2] > 150) & (a[..., 0] < 80) & (a[..., 1] > 70) & (a[..., 1] < 120))
        sel = ys > 85
        gx, gy = xs[sel].mean(), ys[sel].mean()
        ring(f, SAFE_CX - im.width / 2 + (gx - 28 + 0.5) * 12, 700 - im.height / 2 + (gy - 80 + 0.5) * 12, 70)
    return f


def sc_verdict(t):
    t0 = T0["r9"]
    f = blank((18, 12, 22))
    dx, dy = shake(t, t0, 14, 0.3)
    box = card(f, "colonel_caught", SAFE_CX + dx, 720 + dy, 5)
    emote(f, "sweat", box, t, t0)
    stamp(f, "凶手", 650 + dx, 980 + dy, t - t0 + LEAD, GOLD, 7, -12)
    return f


def sc_flip(t):
    t0 = T0["r10"]
    f = blank((24, 18, 26))
    painting_inset(f, "after", SAFE_CX, 700, 7)
    dx, dy = shake(t, t0, 12, 0.25)
    stamp(f, "已售 · 1000镑", 600 + dx, 470 + dy, t - t0 + LEAD, GOLD, 4, -8)
    if t0 - LEAD <= t < t0 + 0.2:
        flash(f, 0.6 * (1 - (t - t0) / 0.2))
    gy = 700 - 224 + int(64 * 0.56) * 7
    if (t - t0) % 1.7 < 0.5:
        put_c(f, up(A("emote_spark"), 5), SAFE_CX + 40, gy - 40)
    return f


def sc_end(t):
    f = room("after", 0.45).copy()
    for i, (n, e) in enumerate((("lady_smile", "note"), ("lily_happy", "note"), ("magician_laugh", "spark"), ("butler_smile", "note"))):
        cx, cy = (290, 650)[i % 2], 560 + 400 * (i // 2)
        b = card(f, n, cx, cy + breath(t + i), 2)
        emote(f, e, b, t, T0["end"] + 0.15 * i, 4)
    return f


# ---- lights out: the ink-line card
def ink_lines(im):
    a = np.array(im.convert("RGB")).astype(float).mean(2)
    e = np.zeros_like(a, bool)
    e[:, 1:] |= np.abs(np.diff(a, axis=1)) > 26
    e[1:, :] |= np.abs(np.diff(a, axis=0)) > 26
    out = np.zeros((*a.shape, 4), np.uint8)
    out[...] = (*PAPER, 255)
    out[e] = (*INDIGO, 255)
    return Image.fromarray(out, "RGBA")


@functools.lru_cache(maxsize=1)
def ink_card():
    f = blank(PAPER)
    f.paste(camera(ink_lines(clock_art("after", 10, 45)), 108, ROOM_CY, 5), (0, 0))
    shade(f, 0.55, PAPER)
    d = ImageDraw.Draw(f)
    # the spectacles, big, on the paper: flip-up plates on a sprung hinge
    cx, cy = SAFE_CX, 640
    for sx in (-130, 130):
        d.ellipse((cx + sx - 100, cy - 100, cx + sx + 100, cy + 100), outline=INDIGO, width=12)
        d.ellipse((cx + sx - 100, cy - 300, cx + sx + 100, cy - 150), fill=PAPER, outline=INDIGO, width=10)
        d.line((cx + sx, cy - 150, cx + sx, cy - 100), fill=INDIGO, width=10)
    d.line((cx - 30, cy, cx + 30, cy), fill=INDIGO, width=12)
    for i in range(3):   # ///: copper green on the hinge, "press here"
        d.line((cx + 108 + i * 22, cy - 98, cx + 128 + i * 22, cy - 138), fill=COPPER, width=8)
    sx0, sy0 = 250, 900                                                   # the delivery slip
    d.rectangle((sx0, sy0, sx0 + 420, sy0 + 190), fill=(250, 244, 226), outline=INDIGO, width=5)
    put(f, txt("十点四十五", 4, INDIGO, None), sx0 + 40, sy0 + 50)
    d.rectangle((sx0 + 360, sy0 + 140, sx0 + 379, sy0 + 159), fill=NET_RED)  # wax seal, 4x4 art px
    return f


def graves(f, t, t0):
    """A figure in the doorway, back to us: long mustard scarf, sketchbook. No face."""
    d = ImageDraw.Draw(f)
    cx, top = 720, 900
    d.ellipse((cx - 40, top, cx + 40, top + 84), fill=INDIGO)
    d.polygon([(cx - 70, top + 90), (cx + 70, top + 90), (cx + 100, top + 460), (cx - 100, top + 460)], fill=INDIGO)
    d.rectangle((cx - 50, top + 80, cx + 50, top + 104), fill=MUSTARD)
    d.polygon([(cx + 20, top + 100), (cx + 46, top + 100), (cx + 60, top + 380), (cx + 34, top + 380)], fill=MUSTARD)
    bx = cx - 210
    d.rectangle((bx, top + 160, bx + 150, top + 270), fill=(250, 244, 226), outline=INDIGO, width=4)
    k = clamp((t - t0) / 0.8)
    # he is drawing the dove
    if k > 0.2:
        d.ellipse((bx + 40, top + 200, bx + 40 + 50 * k, top + 230), outline=INDIGO, width=3)
    d.line((cx - 70, top + 140, bx + 140, top + 215), fill=INDIGO, width=14)


def sc_ink(t):
    t0 = T0["lights_out"]
    if t < nb(t0 + 0.5) - LEAD:
        return blank((4, 3, 6))
    f = ink_card().copy()
    if t >= DUR - 1.0:
        graves(f, t, DUR - 1.0)
    return f


SCENES = {k[3:]: v for k, v in globals().items() if k.startswith("sc_")}


def scene_at(t):
    cur = EV[0]
    for e in EV:
        if t >= e["t0"] - LEAD:
            cur = e
    return cur["scene"]


def frame(t):
    f = SCENES[scene_at(t)](t)
    subtitle(f, t)
    return f.convert("RGB")


# ------------------------------------------------------------------ render
def render_part(args):
    i0, i1, path = args
    p = subprocess.Popen(["ffmpeg", "-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS),
                          "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "16", "-pix_fmt", "yuv420p", str(path)],
                         stdin=subprocess.PIPE)
    for i in range(i0, i1):
        p.stdin.write(frame(i / FPS).tobytes())
    p.stdin.close()
    p.wait()
    return path


def render_video(out, workers=4):
    OUT.mkdir(exist_ok=True)
    edges = np.linspace(0, NF, workers + 1).astype(int)
    parts = [(int(a), int(b), OUT / f"part{k}.mp4") for k, (a, b) in enumerate(zip(edges, edges[1:]))]
    with ProcessPoolExecutor(workers) as ex:
        list(ex.map(render_part, parts))
    lst = OUT / "parts.txt"
    lst.write_text("".join(f"file '{p[2].name}'\n" for p in parts))
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", str(lst), "-c", "copy", str(out)], check=True)


# ------------------------------------------------------------------ audio: the music edit + a few effects
SR = 48000


def music_edit():
    raw = OUT / "bgm_full.f32"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(MP3), "-ar", str(SR), "-ac", "2", "-f", "f32le", str(raw)], check=True)
    x = np.fromfile(raw, np.float32).reshape(-1, 2).astype(np.float64)
    raw.unlink()
    start, end, cuts = TL["start"], TL["end"], TL["cuts"]
    n = int(0.03 * SR)                      # 30 ms crossfade centred on each cut keeps the timing exact
    segs, a0 = [], start
    for a, b in cuts:
        segs.append((a0, a))
        a0 = b
    segs.append((a0, end))
    out = None
    for k, (a, b) in enumerate(segs):
        i0 = max(0, int(round(a * SR)) - (n // 2 if k > 0 else 0))
        i1 = int(round(b * SR)) + (n // 2 if k < len(segs) - 1 else 0)
        s = x[i0:i1].copy()
        if out is None:
            out = s
        else:
            r = np.linspace(0, 1, n)[:, None]
            out[-n:] = out[-n:] * (1 - r) + s[:n] * r
            out = np.concatenate([out, s[n:]])
    fo = int(1.5 * SR)
    out[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.5
    return out


def effects(nsamp):
    import opening_sound as OS
    fx = np.zeros(nsamp)
    OS.add(fx, OS.tick(), T0["dark"] - BEAT, 0.8)                 # the clock's minute hand
    OS.add(fx, OS.thud(), T0["v2"], 0.35)                          # lights back on
    OS.add(fx, OS.thud(), T0["title"], 0.4)
    OS.add(fx, OS.noise_sweep(0.35, 600, 4000, up=False), T0["dark"] + 0.8, 0.35)   # 哗啦
    OS.add(fx, OS.thud(), SEAL, 0.55)                              # the envelope sealed
    OS.add(fx, OS.thud(), T0["r9"], 0.75)                          # 凶手, in the music's drop-out
    OS.add(fx, OS.crash(1.2), T0["r9"], 0.12)
    OS.add(fx, OS.thud(), T0["r10"], 0.4)                          # 已售
    OS.add(fx, OS.tick(), T0["lights_out"], 0.8)                   # lights out
    return fx


def make_audio():
    OUT.mkdir(exist_ok=True)
    mus = music_edit()
    fx = effects(len(mus))
    mix = mus + fx[:, None]
    mix /= max(1e-9, np.abs(mix).max()) / 0.89
    pcm = (mix * 32767).astype("<i2")
    import wave
    (HERE / "audio").mkdir(exist_ok=True)
    path = HERE / "audio" / "bgm_edit.wav"
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print("audio", path, f"{len(mus) / SR:.2f}s (timeline {DUR:.2f}s)")
    return path


def mux(video, audio, out):
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(video), "-i", str(audio), "-map", "0:v", "-map", "1:a",
                    "-c:v", "copy", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "48000", "-c:a", "aac", "-b:a", "192k",
                    "-shortest", str(out)], check=True)


if __name__ == "__main__":
    a = sys.argv[1:]
    if a and a[0] == "still":
        OUT.mkdir(exist_ok=True)
        for s in a[1:]:
            frame(float(s)).save(OUT / f"still_{float(s):06.2f}.png")
        sys.exit()
    wav = make_audio()
    if a and a[0] == "audio":
        sys.exit()
    raw = OUT / "ep01_raw.mp4"
    render_video(raw)
    (ROOT / "deliverables").mkdir(exist_ok=True)
    final = ROOT / "deliverables" / "ep01_dark.mp4"
    mux(raw, wav, final)
    print("wrote", final)
