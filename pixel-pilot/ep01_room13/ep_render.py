"""Ep1 《消失的13号房》: subtitle-only cut on the owner's BGM (no opening, no voice).

Every picture change comes from timeline.json (ep_timeline.py), where each line starts on a beat and
the structural moments are pinned to the music. The picture lands one frame before its subtitle, on the beat.
Pixel art is 216x384 on a 5x grid (1080x1920, 30 fps); text and clues stay in the Douyin safe zone
(x 40-900, y 220-1400).

python3 ep_render.py              -> audio/bgm_edit.wav, out/ep01_raw.mp4, deliverables/ep01_room13.mp4
python3 ep_render.py still 12 45  -> out/still_12.00.png, out/still_45.00.png
python3 ep_render.py audio        -> only the music edit + sound effects
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
T0 = {e["id"]: e["t0"] for e in EV}
T1 = {e["id"]: e["t1"] for e in EV}
LEAD = 1 / FPS          # the picture lands one frame before its line: on the beat to the eye
NF = int(DUR * FPS)

SAFE_T, SAFE_B, SAFE_R, SAFE_CX, WRAP = 220, 1395, 900, 470, 12
BG = (14, 10, 20)
WINE = (120, 40, 44)
NAMES = dict(a="艾达", m="经理", b="门房", l="女仆")
NET_RED = (226, 30, 42)          # the network's colour: only on the ink-line seal
INDIGO, PAPER, COPPER, MUSTARD = (44, 48, 110), (240, 230, 206), (110, 210, 190), (214, 170, 60)


def nb(t):
    """Nearest beat (video time)."""
    return float(BEATS[np.argmin(np.abs(BEATS - t))])


def rgba(p):
    return Image.open(p).convert("RGBA")


LOBBY, FACADE, CORR = rgba(ART / "lobby.png"), rgba(ART / "facade.png"), rgba(ART / "corridor.png")
PORT = {n: rgba(ART / f"{n}.png") for n in ("manager", "porter", "maid", "ada", "thomas")}
# corridor (art px): doors and the papered-over panel; key board (art px)
DOORS = {"11": (37, 120), "12": (154, 237), "13": (270, 356), "14": (389, 472), "15": (507, 590)}
DOOR_Y = (59, 202)
BOARD = (57, 114, 150, 176)


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
    """Slow idle bob on its own clock (never the beat)."""
    return int(round(math.sin(2 * math.pi * t / period) * amp))


@functools.lru_cache(maxsize=None)
def dark_mask(r, a):
    yy, xx = np.ogrid[-H:H, -W:W]
    d = np.sqrt(xx.astype(np.float32) ** 2 + yy.astype(np.float32) ** 2) / r
    k = np.round(np.clip((d - 0.7) / 0.5, 0, 1) * 4) / 4
    m = np.zeros((2 * H, 2 * W, 4), np.uint8)
    m[..., :3] = (8, 6, 12)
    m[..., 3] = (k * a * 255).astype(np.uint8)
    return Image.fromarray(m, "RGBA")


def lantern(f, cx, cy, r=560, a=0.7):
    x0, y0 = int(W - cx), int(H - cy)
    f.alpha_composite(dark_mask(r, a).crop((x0, y0, x0 + W, y0 + H)))


@functools.lru_cache(maxsize=64)
def card_img(name, scale, sil=False, dim=0.0):
    p = PORT[name]
    if sil:
        a = np.array(p)
        a[..., :3] = (8, 6, 12)
        p = Image.fromarray(a, "RGBA")
    im = up(p, scale)
    pad = 3 * scale
    c = Image.new("RGBA", (im.width + 2 * pad, im.height + 2 * pad), (0, 0, 0, 0))
    ImageDraw.Draw(c).rectangle((0, 0, c.width - 1, c.height - 1), fill=(44, 34, 58, 255), outline=K, width=max(4, scale))
    c.alpha_composite(im, (pad, pad))
    if dim:
        c.alpha_composite(Image.new("RGBA", c.size, (10, 6, 18, int(255 * dim))))
    return c


def card(f, name, cx, cy, scale, sil=False, dim=0.0):
    im = card_img(name, scale, sil, dim)
    put_c(f, im, cx, cy)
    return (cx - im.width / 2, cy - im.height / 2, cx + im.width / 2, cy + im.height / 2)


@functools.lru_cache(maxsize=32)
def holmes_img(pose, scale):
    return up(CK.HOLMES[pose], scale)


def holmes(f, t, pose, cx, feet, scale=8, enter=None):
    if pose == "idle" and (t % 3.7) < 0.12:
        pose = "blink"
    im = holmes_img(pose, scale)
    dy = 0
    if enter is not None and t < enter + 0.35:
        dy = (1 - ease((t - enter) / 0.35)) * 600
    put(f, im, cx - im.width / 2, feet - im.height + dy)


def ring(f, cx, cy, r, col=GOLD, w=8):
    ImageDraw.Draw(f).ellipse((cx - r, cy - r, cx + r, cy + r), outline=col + (255,), width=w)


def wrap(txt_, n=14):
    """Fewest rows of at most n characters (one trailing punctuation mark may overhang), balanced,
    preferring breaks after punctuation; a row never starts with punctuation. (from case_render)"""
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
SHOW_UNTIL = {e["id"]: e["t1"] for e in EV}
SHOW_UNTIL["r7"] = T0["tear"] + 0.9          # the verdict stays up into the tear


def sub_at(t):
    cur = None
    for e in EV:
        if e["kind"] in ("n", "a", "m", "b", "l") and e["t0"] <= t < SHOW_UNTIL[e["id"]]:
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


# ------------------------------------------------------------------ backgrounds
@functools.lru_cache(maxsize=8)
def lobby_bg(k):
    return shade(camera(LOBBY, 108, 192, 5).copy(), k)


def corridor_strip(art, x0):
    x0 = round(x0 * 5) / 5
    return art.resize((1080, 1080), Image.NEAREST, box=(x0, 0, x0 + 216, 216))


@functools.lru_cache(maxsize=4)
def corridor_edges(art_id):
    """Ceiling above and carpet below the strip, continued from its first and last rows."""
    art = {"plain": CORR, "door": CORR13}[art_id]
    s = corridor_strip(art, 0)
    top = s.crop((0, 0, 1080, 1)).resize((1080, 260))
    bot = s.crop((0, 1079, 1080, 1080)).resize((1080, H - 1340))
    return shade(top, 0.55), shade(bot, 0.45)


def corridor_frame(x0, art_id="plain"):
    art = {"plain": CORR, "door": CORR13}[art_id]
    f = blank()
    top, bot = corridor_edges(art_id)
    f.paste(top, (0, 0))
    f.paste(bot, (0, 1340))
    f.paste(corridor_strip(art, x0), (0, 260))
    return f


@functools.lru_cache(maxsize=8)
def corridor_bg(x0, k):
    return shade(corridor_frame(x0), k)


FAC_PAD = Image.fromarray(np.pad(np.array(FACADE), ((60, 60), (45, 45), (0, 0)), mode="edge"), "RGBA")
FAC_UP = up(FAC_PAD, 4)


def facade_frame(oy):
    """Facade at 4x: the building spans screen x ~124-830; oy = screen y of art row 0."""
    f = blank()
    f.paste(FAC_UP, (52 - 45 * 4, int(round(oy)) - 60 * 4))
    return f


@functools.lru_cache(maxsize=8)
def facade_bg(oy, k):
    return shade(facade_frame(oy), k)


@functools.lru_cache(maxsize=4)
def study_dark(k):
    return shade(camera(study_at(0.0), 108, 192, 5).copy(), k)


def study_live(t, k):
    return shade(camera(study_at(t), 108, 192, 5).copy(), k)


# the wall torn open: door 14 copied into the panel's place, its plate restamped 13
def _corr13():
    a = np.array(CORR)
    x0, x1 = DOORS["14"]
    px0 = DOORS["13"][0] + (DOORS["13"][1] - DOORS["13"][0] - (x1 - x0)) // 2
    a[:, px0:px0 + (x1 - x0)] = a[:, x0:x1]
    import room13_art
    cx = (2 * px0 + (x1 - x0)) // 2
    py = 384 // 4 + 2
    a[py - 1:py + 7, cx - 5:cx + 5] = (196, 150, 64, 255)
    a[py - 1, cx - 5:cx + 5] = (236, 196, 100, 255)
    a[py + 6, cx - 5:cx + 5] = (120, 84, 30, 255)
    x = cx - 4
    for ch in "13":
        for r, bits in enumerate(room13_art.DIGITS[ch]):
            for c, b in enumerate(bits):
                if b == "1":
                    a[py + r, x + c] = (40, 24, 12, 255)
        x += 4
    return Image.fromarray(a, "RGBA")


sys.path.insert(0, str(HERE))
CORR13 = _corr13()


# ------------------------------------------------------------------ the register
LEFT_ROWS = [("10.01", "布朗先生", "14:10", "11"), ("10.02", "格林夫人", "16:35", "14"), ("10.03", "史密斯", "11:50", "12"),
             ("10.04", "怀特小姐", "18:05", "15"), ("10.05", "琼斯先生", "13:25", "11"), ("10.06", "泰勒", "20:15", "14"),
             ("10.07", "克拉克", "17:40", "12")]
RIGHT_ROWS = [("10.08", "霍尔先生", "15:30", "15"), ("10.09", "沃克夫人", "12:20", "11"), ("10.10", "赖特", "19:05", "14"),
              ("10.11", "贝克", "16:45", "12"), ("10.12", "希尔小姐", "14:55", "15"), ("10.13", "摩尔", "18:30", "11"),
              ("10.14", "艾达·韦恩", "21:45", "12")]
OLD_PAGE, OLD_INK = (226, 206, 160), (150, 110, 70)
NEW_PAGE, NEW_INK = (244, 236, 214), (24, 20, 28)


@functools.lru_cache(maxsize=2)
def book_img():
    """Open register, 840x680: left page faded brown ink, right page all fresh black ink."""
    b = Image.new("RGBA", (840, 680), (0, 0, 0, 0))
    d = ImageDraw.Draw(b)
    d.rectangle((0, 8, 839, 679), fill=(70, 40, 30, 255), outline=K, width=6)          # cover
    for side, (page, ink, rows) in enumerate(((OLD_PAGE, OLD_INK, LEFT_ROWS), (NEW_PAGE, NEW_INK, RIGHT_ROWS))):
        x0 = 14 + side * 412
        d.rectangle((x0, 0, x0 + 400, 660), fill=page + (255,), outline=K, width=4)
        hdr = (150, 130, 100) if side == 0 else (110, 100, 96)
        for lab, cx in (("日期", 8), ("姓名", 96), ("时间", 262), ("房", 354)):
            b.alpha_composite(txt(lab, 2, hdr, None), (x0 + cx, 24))
        d.line((x0 + 10, 72, x0 + 390, 72), fill=hdr + (255,), width=3)
        for i, (dt, nm, tm, rm) in enumerate(rows):
            y = 92 + i * 78
            for s, cx in ((dt, 4), (nm, 92), (tm, 258), (rm, 356)):
                b.alpha_composite(txt(s, 2, ink, None), (x0 + cx, y))
            d.line((x0 + 10, y + 52, x0 + 390, y + 52), fill=tuple(int(c * 0.88) for c in page) + (255,), width=2)
    d.rectangle((410, 0, 429, 666), fill=(60, 34, 26, 255))                            # spine shadow
    return b


BOOK_XY = (50, 430)


def register_frame(t, t_in):
    f = lobby_bg(0.78).copy()
    dy = (1 - ease((t - t_in) / 0.3)) * 260 if t < t_in + 0.3 else 0
    put(f, book_img(), BOOK_XY[0], BOOK_XY[1] + dy)
    return f


# ------------------------------------------------------------------ scenes (one function per picture)
def sc_hook(t):
    s2 = T0["h2"] - LEAD
    if t < s2:   # one quick pan past all four doors, never pausing on a wall
        k = ease(clamp(t / (s2 - 0.1)))
        f = corridor_frame(411 * k)
        lantern(f, 540, 800, 640, 0.55)
        return f
    f = corridor_bg(380, 0.55).copy()      # Ada turns round: the row of plates behind her
    card(f, "ada", SAFE_CX, 760 + breath(t), 4)
    return f


TITLE = "消失的13号房"
TITLE_CUTS = ["消", "失", "的", "13", "号", "房"]


def sc_title(t):
    t0 = T0["title"]
    f = facade_bg(100, 0.74).copy()
    dx, dy = shake(t, t0, 14, 0.3)
    lab = txt("案卷 No.001", 3, GOLD)
    put(f, lab, SAFE_CX - lab.width / 2 + dx, 600 + dy)
    full = txt(TITLE, 8, CREAM)
    hb = float(np.median(np.diff(BEATS))) / 2       # one character per half-beat (the title stamp)
    n = int(clamp((t - t0) / hb + 1, 0, len(TITLE_CUTS)))
    if n > 0:
        w = int((2 + CK.FONT.getlength("".join(TITLE_CUTS[:n]))) * 8 + 8)
        put(f, full.crop((0, 0, min(w, full.width), full.height)), SAFE_CX - full.width / 2 + dx, 720 + dy)
    if n == len(TITLE_CUTS):
        d = ImageDraw.Draw(f)
        d.rectangle((SAFE_CX - full.width / 2 + dx, 900 + dy, SAFE_CX + full.width / 2 + dx, 906 + dy), fill=GOLD)
    if t0 <= t < t0 + 0.2:
        flash(f, 0.7 * (1 - (t - t0) / 0.2))
    return f


def sc_holmes(t):
    f = study_live(t, 0.35)
    if t < T0["past"] - LEAD:
        pose = "idle"
    elif t < T0["vow"] - LEAD:
        pose = "think"
    elif t < T0["you"] - LEAD:
        pose = "sit"
    else:
        pose = "deduce"
    holmes(f, t, pose, SAFE_CX, 1120, 8, enter=T0["me"] - LEAD)
    if T0["me"] + 0.3 <= t < T0["past"] - LEAD:
        tag(f, "福尔摩斯", SAFE_CX, 470, t=t - T0["me"] - 0.3)
    if t >= T0["you"] - LEAD:
        stamp(f, "侦探：你", SAFE_CX, 400, t - (T0["you"] - LEAD), GOLD, 6, -6)
    return f


def sc_rule(t):
    t0 = T0["rule"] - LEAD
    t2 = nb(T0["rule"] + 1.9)
    f = study_dark(0.78).copy()
    d = ImageDraw.Draw(f)
    d.rectangle((60, 520, 880, 1000), fill=(20, 16, 30, 255), outline=GOLD, width=6)
    put_c(f, txt("我看到的，你都能看到。", 4, CREAM), SAFE_CX, 690)
    if t >= t2 - LEAD:
        put_c(f, txt("但我不会替你指出来。", 4, GOLD), SAFE_CX, 830)
        stamp(f, "规则", 790, 540, t - (t2 - LEAD), GOLD, 4, -10)
    holmes(f, t, "magnify", SAFE_CX, 1340, 4)
    return f


def sc_three(t):
    t0 = T0["three"] - LEAD
    f = lobby_bg(0.72).copy()
    for i, (n, lab) in enumerate((("manager", "经理"), ("porter", "门房"), ("maid", "女仆"))):
        cx = (180, 470, 760)[i]
        lit = t >= t0 + 0.5 + i * 0.15          # one quick sweep, not one per beat
        card(f, n, cx, 720, 2, sil=not lit)
        if lit:
            put_c(f, txt(lab, 3, CREAM), cx, 890)
    return f


def desk(t, who, punch=None):
    f = lobby_bg(0.4).copy()
    dx, dy = shake(t, punch, 10, 0.25) if punch is not None else (0, 0)
    card(f, who, SAFE_CX + dx, 790 + breath(t) + dy, 4)
    return f


def sc_desk_ada(t):
    return desk(t, "ada")


def sc_desk_mgr(t):
    return desk(t, "manager", T0["m1"] if t < T0["m2"] else None)


def sc_desk_porter(t):
    return desk(t, "porter")


def sc_desk_mgr_porter(t):
    f = lobby_bg(0.4).copy()
    card(f, "manager", 250, 800 + breath(t), 3)
    card(f, "porter", 690, 800, 3, dim=0.35)
    return f


def sc_keyboard(t):
    t0 = T0["kb"] - LEAD
    cx, cy, z = cam_path(t, [(t0, 108, 192, 5), (t0 + 0.9, 106, 145, 9)])
    if t >= t0 + 0.9:
        z = 9
    return camera(LOBBY, cx, cy, z).copy()


def sc_register(t):
    return register_frame(t, T0["book"] - LEAD)


def sc_corridor(t):
    t0 = T0["up"] - LEAD
    k = clamp((t - t0) / 4.3)
    k = k * k * (3 - 2 * k) * 0.35 + k * 0.65          # nearly constant speed: no stop on any wall
    f = corridor_frame(411 * k)
    lantern(f, 540 + 14 * math.sin(t * 2.3), 800 + 10 * math.sin(t * 1.7), 560, 0.72)
    return f


def sc_corr_mgr(t):
    f = corridor_bg(390, 0.4).copy()
    card(f, "manager", SAFE_CX, 800 + breath(t), 4)
    return f


def sc_corr_maid(t):
    f = corridor_bg(390, 0.4).copy()
    card(f, "maid", SAFE_CX, 800 + breath(t), 4)
    return f


def sc_facade(t):
    t0 = T0["street"] - LEAD
    oy = 40 + 60 * ease((t - t0) / 3.5)                 # you look up: the building slides down
    return facade_frame(oy)


def sc_facade_ada(t):
    f = facade_bg(100, 0.3).copy()
    card(f, "ada", 300, 560 + breath(t), 3)
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
    f = study_live(t, 0.45)
    holmes(f, t, "deduce", 300, 1130, 7)
    dx = (1 - ease((t - t0) / 0.3)) * 600 if t < t0 + 0.3 else 0
    dsx, dsy = shake(t, SEAL, 10, 0.25)
    envelope(f, 690 + dx + dsx, 760 + dsy, t - SEAL)
    return f


# ---- evidence board
def _fit(im, w, h):
    s = min(w / im.width, h / im.height)
    return im.resize((max(1, int(im.width * s)), max(1, int(im.height * s))), Image.NEAREST)


@functools.lru_cache(maxsize=1)
def evidence():
    return [
        (_fit(FACADE.crop((15, 182, 201, 266)), 242, 220), "二楼外窗"),
        (_fit(CORR.crop((150, 30, 470, 216)), 242, 220), "二楼走廊"),
        (_fit(LOBBY.crop(BOARD), 242, 220), "前台钥匙板"),
        (_fit(book_img(), 242, 220), "登记簿"),
        (up(PORT["porter"].crop((4, 18, 125, 128)), 2), "门房"),
        (up(PORT["maid"].crop((4, 18, 125, 128)), 2), "女仆"),
    ]


def ev_card(f, cx, cy, img, label):
    d = ImageDraw.Draw(f)
    x0, y0 = cx - 131, cy - 150
    d.rectangle((x0 + 8, y0 + 8, x0 + 270, y0 + 308), fill=(6, 4, 10))
    d.rectangle((x0, y0, x0 + 262, y0 + 300), fill=(44, 34, 58), outline=GOLD, width=4)
    put_c(f, img, cx, y0 + 122)
    put_c(f, txt(label, 2, CREAM), cx, y0 + 268)


COUNT = [nb(T1["ask"] - (5 - i) * 2 * float(np.median(np.diff(BEATS)))) for i in range(5)]


def sc_board(t):
    t0 = T0["ask"] - LEAD
    f = blank((16, 12, 24))
    put_c(f, txt("13号房去哪了？", 4, CREAM), SAFE_CX, 262)
    put_c(f, txt("是谁让它消失的？", 4, GOLD), SAFE_CX, 336)
    for i, c in enumerate(COUNT):
        nxt = COUNT[i + 1] if i + 1 < len(COUNT) else T1["ask"]
        if c - LEAD <= t < nxt - LEAD:
            put_c(f, txt(str(5 - i), 7, GOLD), 832, 300)
    for i, (n, lab) in enumerate((("manager", "经理"), ("porter", "门房"), ("maid", "女仆"))):
        cx = (200, 470, 740)[i]
        card(f, n, cx, 455, 1)
        put_c(f, txt(lab, 2, CREAM), cx + 0, 552)
    for i, (img, lab) in enumerate(evidence()):
        if t >= t0 + 0.13 * i:
            ev_card(f, (190, 470, 750)[i % 3], 765 + 330 * (i // 3), img, lab)
    put_c(f, txt("⏸ 暂停 · 把推理写在评论区", 3, WHITE), SAFE_CX, 1345)
    return f


# ---- the answer
def sc_most(t):
    t0 = T0["r0"]
    f = blank((20, 14, 26))
    dx, dy = shake(t, t0, 16, 0.3)
    card(f, "ada", 260 + dx, 720 + dy, 3)
    card(f, "porter", 680 + dx, 720 + dy, 3)
    put_c(f, txt("？", 8, GOLD), 260 + dx, 440 + dy)
    if t >= nb(t0 + 2.1) - LEAD:
        put_c(f, txt("？", 8, GOLD), 680 + dx, 440 + dy)
    if t0 <= t < t0 + 0.25:
        flash(f, 0.75 * (1 - (t - t0) / 0.25))
    return f


WIN_FRAC = [(85 + 139 * (i + 0.5)) / 4 for i in range(5)]       # window centres (art px)
CORR_Y, CORR_S = 700, 744 / 627


@functools.lru_cache(maxsize=1)
def count_base():
    f = blank((18, 14, 24))
    put(f, up(FACADE.crop((15, 190, 201, 262)), 4), 98, 240)
    f.paste(CORR.resize((744, 256), Image.NEAREST), (98, CORR_Y))
    return f


def sc_count(t):
    t0 = T0["r1"] - LEAD
    t2 = nb(T0["r1"] + 2.7)
    f = count_base().copy()
    d = ImageDraw.Draw(f)
    for i in range(5):
        wx = 98 + (WIN_FRAC[i] - 15) * 4
        if t >= t0 + 0.15 + i * 0.17:                       # one quick sweep along the windows
            put_c(f, txt(str(11 + i), 3, GOLD), wx, 556)
    for i, room in enumerate(("11", "12", "13", "14", "15")):
        x0, x1 = DOORS[room]
        dx = 98 + (x0 + x1) / 2 * CORR_S
        if room != "13" and t >= t0 + 1.2 + i * 0.17:
            put_c(f, txt(room, 3, GOLD), dx, 990)
            for y in range(586, CORR_Y - 6, 22):           # window above, door below
                d.line((dx, y, dx, y + 10), fill=GOLD, width=4)
        if room == "13":
            if t >= t2 - LEAD:
                bx0, bx1 = 98 + x0 * CORR_S - 6, 98 + x1 * CORR_S + 6
                d.rectangle((bx0, CORR_Y + DOOR_Y[0] * CORR_S - 6, bx1, CORR_Y + DOOR_Y[1] * CORR_S + 6), outline=GOLD, width=6)
                d.line((dx, 586, dx, CORR_Y + 40), fill=GOLD, width=8)
                d.polygon([(dx - 18, CORR_Y + 30), (dx + 18, CORR_Y + 30), (dx, CORR_Y + 56)], fill=GOLD)
                put_c(f, txt("13", 3, GOLD), dx, 990)
            elif t >= t0 + 1.2 + i * 0.17:
                put_c(f, txt("?", 3, CREAM), dx, 990)
    return f


def sc_cuff(t):
    t0 = T0["r3"] - LEAD
    f = blank((20, 14, 26))
    x0, y0, _, _ = card(f, "porter", SAFE_CX, 720, 4)
    if t >= t0 + 0.15:
        sx, sy = x0 + 12 + 33.5 * 4, y0 + 12 + 104.5 * 4
        ring(f, sx, sy, 58)
        tag(f, "浆糊", sx + 190, sy + 70, GOLD, INK, 3, t - t0 - 0.15)
    return f


def sc_pages(t):
    t0 = T0["r4"] - LEAD
    t2 = nb(T0["r4"] + 1.8)
    f = register_frame(t, -10)
    if t >= t0 + 0.15:
        bx, by = BOOK_XY
        ImageDraw.Draw(f).rectangle((bx + 422, by - 8, bx + 422 + 412, by + 670), outline=GOLD, width=6)
        tag(f, "褪色的棕墨", bx + 214, by - 40, (200, 160, 110), INK, 3, t - t0 - 0.15)
        tag(f, "整页新墨", bx + 632, by - 40, GOLD, INK, 3, t - t0 - 0.15)
    if t >= t2 - LEAD:
        stamp(f, "一夜重抄", BOOK_XY[0] + 632, BOOK_XY[1] + 380, t - (t2 - LEAD), (176, 112, 20), 4, -10)   # darker gold: it sits on cream paper
    return f


def bubble(f, box, rows, tail):
    d = ImageDraw.Draw(f)
    x0, y0, x1, y1 = box
    d.polygon(tail, fill=(250, 244, 226), outline=K)
    d.rectangle(box, fill=(250, 244, 226), outline=K, width=6)
    d.polygon([(p[0], p[1]) for p in tail], fill=(250, 244, 226))
    y = y0 + 26
    for r in rows:
        put(f, txt(r, 2, INK, None), x0 + 26, y)
        y += 50


def sc_quotes(t):
    t0 = T0["r5"] - LEAD
    t2 = nb(T0["r5"] + 2.8)
    f = blank((20, 14, 26))
    card(f, "manager", 200, 520, 2)
    bubble(f, (360, 450, 880, 590), ["每一位客人，", "都是我亲手登记的。"], [(362, 520), (340, 560), (362, 560)])
    card(f, "porter", 740, 880, 2, dim=0.2)
    if t >= t2 - LEAD:
        bubble(f, (60, 810, 580, 950), ["他？他连自己的", "名字都不会写。"], [(578, 870), (604, 910), (578, 910)])
        put_c(f, txt("经理说的", 2, GOLD), 320, 984)
    return f


@functools.lru_cache(maxsize=1)
def plate_base():
    return camera(LOBBY, 106, 145, 9).copy()


def sc_plate(t):
    t0 = T0["r6"] - LEAD
    t2 = nb(T0["r6"] + 2.3)
    f = plate_base().copy()
    if t >= t0 + 0.15:
        ring(f, 517, 780, 72)
    if t >= t2 - LEAD:
        card(f, "manager", SAFE_CX, 420, 2)
    return f


def sc_verdict(t):
    t0 = T0["r7"]
    f = blank((18, 12, 22))
    dx, dy = shake(t, t0, 14, 0.3)
    card(f, "manager", SAFE_CX + dx, 740 + dy, 5)
    stamp(f, "凶手", 650 + dx, 990 + dy, t - t0 + LEAD, GOLD, 7, -12)
    return f


def sc_tear(t):
    t0 = T0["tear"]
    dx, dy = shake(t, t0, 18, 0.3)
    f = corridor_frame(205)
    k = clamp((t - t0) / 0.28)
    if k > 0:   # the paper rips away left to right, a jagged edge, a door behind it
        g = corridor_frame(205, "door")
        m = Image.new("L", (W, H), 0)
        md = ImageDraw.Draw(m)
        px0, px1 = (DOORS["13"][0] - 205) * 5 - 20, (DOORS["13"][1] - 205) * 5 + 20
        edge = px0 + k * (px1 - px0 + 80)
        rng = np.random.default_rng(3)
        jag = rng.integers(-26, 26, 40)
        pts = [(px0, 520)]
        for i, y in enumerate(np.linspace(520, 1300, 40)):
            pts.append((min(px1, edge + jag[i] - (y - 520) * 0.08), y))
        pts.append((px0, 1300))
        md.polygon(pts, fill=255)
        f.paste(g, (0, 0), m)
        if k < 1:
            ImageDraw.Draw(f).line(pts[1:-1], fill=(236, 222, 190), width=10)
    f2 = blank()
    f2.paste(f, (dx, dy))
    if t0 <= t < t0 + 0.18:
        flash(f2, 0.6 * (1 - (t - t0) / 0.18))
    return f2


def sc_thomas(t):
    f = blank((34, 24, 34))
    d = ImageDraw.Draw(f)
    d.rectangle((90, 980, 850, 1120), fill=(96, 70, 60), outline=K, width=6)     # the bed
    d.rectangle((110, 940, 830, 990), fill=(220, 214, 200), outline=K, width=4)
    card(f, "thomas", SAFE_CX, 700 + breath(t, 3.4, 5), 4, dim=0.15)
    lantern(f, SAFE_CX, 760, 620, 0.6)
    return f


def wanted(f, cx, cy):
    d = ImageDraw.Draw(f)
    x0, y0, x1, y1 = cx - 200, cy - 290, cx + 200, cy + 290
    d.rectangle((x0 + 10, y0 + 10, x1 + 10, y1 + 10), fill=(6, 4, 10))
    d.rectangle((x0, y0, x1, y1), fill=(222, 198, 150), outline=K, width=6)
    put_c(f, txt("通缉", 6, (70, 40, 26), None), cx, y0 + 80)
    p = np.array(up(PORT["manager"], 2)).astype(float)
    g = p[..., :3].mean(2, keepdims=True)
    p[..., :3] = np.clip(g * np.array([0.95, 0.78, 0.58]) + 20, 0, 255)
    put_c(f, Image.fromarray(p.astype(np.uint8), "RGBA"), cx, cy + 10)
    put_c(f, txt("利物浦·1889", 2, (70, 40, 26), None), cx, y1 - 110)
    put_c(f, txt("卷款潜逃", 3, (70, 40, 26), None), cx, y1 - 56)


def sc_motive(t):
    t2 = nb(T0["r9"] + 1.9)
    f = blank((24, 18, 30))
    card(f, "manager", 250, 640 + breath(t), 3)
    if t >= t2 - LEAD:
        dx, dy = shake(t, t2, 10, 0.25)
        s = 1 - ease((t - t2 + LEAD) / 0.15)
        wanted(f, 670 + dx, 720 + dy - s * 80)
    return f


def sc_leave(t):
    t0 = T0["end"] - LEAD
    f = facade_bg(100, 0.12).copy()
    card(f, "ada", 330, 820 + breath(t), 2)
    card(f, "thomas", 610, 820 + breath(t + 1.1), 2)
    return f


# ---- lights out: the ink-line card
def ink_lines(art):
    a = np.array(art.convert("RGB")).astype(float).mean(2)
    e = np.zeros_like(a, bool)
    e[:, 1:] |= np.abs(np.diff(a, axis=1)) > 26
    e[1:, :] |= np.abs(np.diff(a, axis=0)) > 26
    out = np.zeros((*a.shape, 4), np.uint8)
    out[...] = (*PAPER, 255)
    out[e] = (*INDIGO, 255)
    return Image.fromarray(out, "RGBA")


@functools.lru_cache(maxsize=1)
def lights_card():
    f = blank(PAPER)
    f.paste(corridor_strip(ink_lines(CORR13), 205), (0, 260))
    d = ImageDraw.Draw(f)
    # the panel, lifted off and turned round, leaning in front of door 13
    x0, y0, x1, y1 = 160, 470, 600, 1330
    d.polygon([(x0, y0 + 30), (x1, y0), (x1, y1), (x0, y1 - 10)], fill=PAPER, outline=INDIGO)
    for i in range(4):
        d.line((x0 + 4, y0 + 30 + i * 3, x1 - 4, y0 + i * 3), fill=INDIGO, width=3)
    for gx in range(x0 + 50, x1, 60):                                    # battens on the back
        d.line((gx, y0 + 30 - (gx - x0) * 30 // (x1 - x0), gx, y1 - 10 + (gx - x0) * 10 // (x1 - x0)), fill=INDIGO, width=3)
    for i in range(3):                                                   # ///, copper green
        d.line((x0 + 40 + i * 26, y0 + 130, x0 + 70 + i * 26, y0 + 70), fill=COPPER, width=8)
    sx0, sy0 = 250, 800                                                  # the delivery slip
    d.rectangle((sx0, sy0, sx0 + 280, sy0 + 150), fill=(250, 244, 226), outline=INDIGO, width=4)
    put(f, txt("十点四十五", 3, INDIGO, None), sx0 + 22, sy0 + 40)
    d.rectangle((sx0 + 230, sy0 + 108, sx0 + 249, sy0 + 127), fill=NET_RED)  # wax seal, 4x4 art px
    return f


@functools.lru_cache(maxsize=1)
def street_card():
    f = blank(PAPER)
    f.paste(up(ink_lines(FAC_PAD), 4), (52 - 45 * 4, 100 - 60 * 4))
    return f


def graves(f, t, t0):
    """A figure across the street, back to us: long mustard scarf, sketchbook. No face."""
    d = ImageDraw.Draw(f)
    cx, top = 760, 940
    d.ellipse((cx - 40, top, cx + 40, top + 84), fill=INDIGO)                    # head, from behind
    d.polygon([(cx - 70, top + 90), (cx + 70, top + 90), (cx + 100, top + 460), (cx - 100, top + 460)], fill=INDIGO)
    d.rectangle((cx - 50, top + 80, cx + 50, top + 104), fill=MUSTARD)            # scarf round the neck
    d.polygon([(cx + 20, top + 100), (cx + 46, top + 100), (cx + 60, top + 380), (cx + 34, top + 380)], fill=MUSTARD)
    bx = cx - 190                                                                  # sketchbook held out left
    d.rectangle((bx, top + 170, bx + 130, top + 260), fill=(250, 244, 226), outline=INDIGO, width=4)
    k = clamp((t - t0) / 0.8)
    d.line((bx + 16, top + 230, bx + 16 + 100 * k, top + 230 - 40 * k * (1 - k) * 4), fill=INDIGO, width=3)
    d.line((cx - 70, top + 140, bx + 120, top + 215), fill=INDIGO, width=14)      # arm


def sc_lights(t):
    t0 = T0["lights"]
    if t < nb(t0 + 0.5) - LEAD:
        return blank((4, 3, 6))                     # the lights go out for one beat
    if t < DUR - 1.0:
        return lights_card().copy()
    f = street_card().copy()
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
        i0 = int(round(a * SR)) - (n // 2 if k > 0 else 0)
        i1 = int(round(b * SR)) + (n // 2 if k < len(segs) - 1 else 0)
        s = x[i0:i1].copy()
        if out is None:
            out = s
        else:
            r = np.linspace(0, 1, n)[:, None]
            out[-n:] = out[-n:] * (1 - r) + s[:n] * r
            out = np.concatenate([out, s[n:]])
    fi, fo = int(0.02 * SR), int(1.5 * SR)
    out[:fi] *= np.linspace(0, 1, fi)[:, None]
    out[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.5
    return out


def effects(nsamp):
    import opening_sound as OS
    fx = np.zeros(nsamp)
    OS.add(fx, OS.thud(), T0["title"], 0.45)                     # title lands with the kick's return
    OS.add(fx, OS.thud(), SEAL, 0.55)                            # the envelope sealed
    OS.add(fx, OS.thud(), T0["r7"], 0.75)                        # 凶手, in the music's drop-out
    OS.add(fx, OS.crash(1.2), T0["r7"], 0.12)
    OS.add(fx, OS.noise_sweep(0.3, 900, 7000, up=True), T0["tear"] - 0.02, 0.5)   # wallpaper ripped
    OS.add(fx, OS.thud(), nb(T0["r9"] + 1.9), 0.35)              # the wanted notice slapped down
    OS.add(fx, OS.tick(), T0["lights"], 0.8)                     # lights out
    return fx


def make_audio():
    OUT.mkdir(exist_ok=True)
    mus = music_edit()
    fx = effects(len(mus))
    mix = mus + fx[:, None]
    mix /= max(1e-9, np.abs(mix).max()) / 0.89
    pcm = (mix * 32767).astype("<i2")
    import wave
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
    final = ROOT / "deliverables" / "ep01_room13.mp4"
    mux(raw, wav, final)
    print("wrote", final)
