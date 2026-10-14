"""Suspect dossier card: the first time a suspect appears, the picture freezes and a file card slides in.
The portrait has a Live2D-style idle (breathing, a slow head tilt, loose hair strands swaying, blinks, a glance),
done by warping the layered VN bust in screen space every frame. All text sits inside the Douyin safe zone
(x 40-900, y 220-1400; see tools/safe_zone_overlay.py).

python3 dossier.py              -> out/dossier_sample.mp4 (with sound)
python3 dossier.py still 2.0    -> out/dossier_2.0.png
"""
import math, pathlib, subprocess, sys, wave
import numpy as np
from PIL import Image, ImageDraw

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / "case01"))
sys.path.insert(0, str(HERE.parent / "opening"))
import case_kit as K
import vn_faces as F

W, H, FPS = 1080, 1920, 30
OUT = HERE / "out"
SCALE = 7
NAVY, NAVY2, GOLD, CREAM, INK = (14, 30, 118), (28, 50, 150), (232, 182, 72), (244, 230, 196), (22, 17, 30)
STAMP = (196, 52, 48)          # not the reserved pure red (226, 30, 42)

CARD = dict(
    who="secretary", no="02", name="伊迪丝", latin="EDITH",
    rows=[("年龄", "26岁"), ("职业", "勋爵的私人秘书"), ("与死者", "受雇三年")],
    quote="我八点到十点，一直在楼上打字。",
)
# loose strands (art px): rect, and the row they hang from (they sway more further down)
STRANDS = [((40, 56, 52, 70), 56), ((84, 50, 93, 75), 50)]
PIVOT = (72, 70)               # neck, art px

T_FLASH, T_IN, T_HEAD, T_ROWS, T_STAMP, T_QUOTE, T_OUT, DUR = 0.25, 0.3, 0.75, 1.0, 2.05, 2.5, 5.1, 5.6
ROW_GAP = 0.3
CPS = 12

BG = K.darken(K.camera(K.STUDY, 108, 190, 5).convert("RGBA"), 0.45, (16, 10, 30))


def clamp01(x):
    return max(0.0, min(1.0, x))


def back_out(k):
    k = clamp01(k)
    s = 1.6
    k -= 1
    return k * k * ((s + 1) * k + s) + 1


# ------------------------------------------------------------------ Live2D-style idle
def strand_mask(bust):
    a = np.array(bust)
    m = np.zeros(a.shape[:2], bool)
    for (x0, y0, x1, y1), _ in STRANDS:
        reg = a[y0:y1, x0:x1]
        m[y0:y1, x0:x1] = (reg[..., 3] > 128) & (reg[..., 1] < 110)
    return m


def live(bust, t):
    """Warp the 128-px bust into a SCALE-x image: breathing, head tilt, strand sway."""
    n = 128 * SCALE
    a = np.array(bust)
    m = strand_mask(bust)
    body = a.copy()
    body[m] = 0
    hair = np.zeros_like(a)
    hair[m] = a[m]
    body = np.repeat(np.repeat(body, SCALE, 0), SCALE, 1)
    hair = np.repeat(np.repeat(hair, SCALE, 0), SCALE, 1)
    # strands: per-row horizontal sway, a wave travelling down the strand
    ys = np.arange(n) / SCALE
    for (x0, y0, x1, y1), root in STRANDS:
        r0, r1 = y0 * SCALE, y1 * SCALE
        x0s, x1s = x0 * SCALE, x1 * SCALE
        for yy in range(r0, r1):
            u = ys[yy]
            dx = 1.1 * math.sin(2 * math.pi * t / 2.4 - (u - root) * 0.28) * clamp01((u - root) / 14)
            dx = int(round(dx * SCALE))
            if dx:
                hair[yy, x0s - 12:x1s + 12] = np.roll(hair[yy, x0s - 12:x1s + 12], dx, 0)
    al = hair[..., 3:4] / 255.0
    comb = (hair * al + body * (1 - al)).astype(np.uint8)
    comb[..., 3] = np.maximum(hair[..., 3], body[..., 3])
    # breathing + head tilt: inverse map (output px samples the source at p - d)
    b = (1 - math.cos(2 * math.pi * t / 3.2)) / 2
    b2 = (1 - math.cos(2 * math.pi * (t - 0.25) / 3.2)) / 2
    th = math.radians(1.1 * math.sin(2 * math.pi * t / 5.3))
    yy, xx = np.mgrid[0:n, 0:n].astype(np.float32) / SCALE
    below = np.clip((yy - PIVOT[1]) / (128 - PIVOT[1]), 0, 1)
    head = np.clip((PIVOT[1] + 2 - yy) / 10, 0, 1)
    dy = -1.3 * b * (1 - below) - 0.5 * b2 * head
    dx = (xx - PIVOT[0]) * 0.012 * b * np.clip((yy - 74) / 30, 0, 1)
    dx += -th * (yy - PIVOT[1]) * head
    dy += th * (xx - PIVOT[0]) * head
    sx = np.clip(np.round((xx - dx) * SCALE), 0, n - 1).astype(int)
    sy = np.clip(np.round((yy - dy) * SCALE), 0, n - 1).astype(int)
    return Image.fromarray(comb[sy, sx], "RGBA")


# ------------------------------------------------------------------ layout pieces
def stripes(t, k):
    """Navy panel with slow diagonal stripes, wiped in from the left by k."""
    p = Image.new("RGBA", (W, H), NAVY + (255,))
    d = ImageDraw.Draw(p)
    off = int(t * 40) % 120
    for x in range(-H, W + 120, 120):
        x += off
        d.polygon([(x, 0), (x + 40, 0), (x + 40 - H // 2, H), (x - H // 2, H)], fill=NAVY2 + (255,))
    d.polygon([(0, 560), (W, 330), (W, 560), (0, 790)], fill=(40, 34, 90, 255))     # band behind the head
    d.polygon([(0, 790), (W, 560), (W, 584), (0, 814)], fill=GOLD + (255,))          # gold edge
    big = K.text_img(CARD["no"], 26, NAVY2, None)
    p.alpha_composite(big, (W - big.width + 40, 280))
    if k < 1:   # diagonal wipe
        mask = Image.new("L", (W, H), 0)
        x = int(k * (W + H // 2))
        ImageDraw.Draw(mask).polygon([(0, 0), (x, 0), (x - H // 2, H), (0, H)], fill=255)
        q = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        q.paste(p, (0, 0), mask)
        return q
    return p


def quote_box(f, t):
    if t < T_QUOTE:
        return 0
    s = CARD["quote"]
    n = min(len(s), int((t - T_QUOTE) * CPS) + 1)
    k = K.ease(clamp01((t - T_QUOTE) / 0.15))
    d = ImageDraw.Draw(f)
    y = 320
    d.rectangle((40, y, 40 + int(860 * k), y + 110), fill=(250, 244, 226, 240), outline=INK + (255,), width=6)
    d.polygon([(300, y + 110), (340, y + 110), (310, y + 150)], fill=(250, 244, 226, 240))
    if k >= 1:
        f.alpha_composite(K.text_img("「" + s[:n] + ("」" if n == len(s) else ""), 3, INK, None), (62, y + 25))
    return n


def file_card(f, t):
    k = K.ease(clamp01((t - T_IN - 0.15) / 0.3))
    if k <= 0:
        return
    x0, y0, x1, y1 = 40, 1160, 900, 1390
    yo = int((1 - k) * 260)
    d = ImageDraw.Draw(f)
    d.rectangle((x0, y0 + yo, x1, y1 + yo), fill=CREAM + (255,), outline=INK + (255,), width=6)
    d.rectangle((x0, y0 + yo, x0 + 18, y1 + yo), fill=GOLD + (255,))
    for i, (lab, val) in enumerate(CARD["rows"]):
        tr = t - (T_ROWS + i * ROW_GAP)
        if tr < 0:
            continue
        y = y0 + yo + 22 + i * 70
        f.alpha_composite(K.text_img(lab, 3, (120, 96, 70), None), (x0 + 50, y))
        n = min(len(val), int(tr * 30) + 1)
        f.alpha_composite(K.text_img(val[:n], 3, INK, None), (x0 + 260, y))


def name_plate(f, t):
    k = back_out((t - 0.55) / 0.35)
    if t < 0.55:
        return
    nm = K.text_img(CARD["name"], 7, CREAM, INK)
    x = int(-nm.width + (60 + nm.width) * k)
    f.alpha_composite(nm, (x, 950))
    lat = K.text_img(CARD["latin"] + "  ·  嫌疑人", 3, GOLD, INK)
    f.alpha_composite(lat, (x + 6, 950 + nm.height - 4))


def expression(t):
    if T_QUOTE <= t:
        return "nervous" if t > T_QUOTE + 1.6 else "neutral"
    return "neutral"


BLINKS = [1.6, 3.1, 4.6]
GLANCE = (1.85, 2.3)


def bust_at(t):
    ex = expression(t)
    s = CARD["quote"]
    talk = 0
    i = int((t - T_QUOTE) * CPS)
    if 0 <= i < len(s) and s[i] not in "，。":
        talk = (1, 2, 1, 0)[int(t * 12) % 4]
    blink = any(b <= t < b + 0.12 for b in BLINKS)
    im = F.render(CARD["who"], ex, blink=blink, talk=talk)
    if GLANCE[0] <= t < GLANCE[1] and not blink:   # a quick look away, then back to camera
        d = ImageDraw.Draw(im)
        F.eyes(d, F.FACES[CARD["who"]], "side")
    return im


def frame_at(t):
    f = BG.copy()
    if t < T_FLASH:
        return f
    if t >= T_OUT:   # whole card slides off to the right
        k = K.ease((t - T_OUT) / 0.35)
        card = card_layer(t)
        f.alpha_composite(card, (int(k * W * 1.1), 0))
        return f
    f.alpha_composite(card_layer(t))
    K.flash(f, max(0, 1 - (t - T_FLASH) / 0.18))
    return f


def card_layer(t):
    c = stripes(t, clamp01((t - T_FLASH) / 0.25))
    k = back_out((t - T_IN) / 0.4)
    por = live(bust_at(t), t)
    dx, dy = K.shake(t, T_STAMP, amp=14, d=0.25)
    c.alpha_composite(por, (int(-por.width + (por.width - 10) * k) + dx, 380 + dy))
    name_plate(c, t)
    file_card(c, t)
    if t >= T_HEAD:
        hd = "人物档案 · FILE " + CARD["no"]
        n = min(len(hd), int((t - T_HEAD) * 30) + 1)
        c.alpha_composite(K.text_img(hd[:n], 3, GOLD, INK), (44, 236))
    K.stamp(c, "嫌疑人", 740, 520, t - T_STAMP, col=STAMP, scale=5, angle=-14)
    quote_box(c, t)
    return c


def render_video(path):
    OUT.mkdir(exist_ok=True)
    p = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                          "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-crf", "16", "-preset", "medium",
                          "-pix_fmt", "yuv420p", str(path)], stdin=subprocess.PIPE)
    for i in range(int(DUR * FPS)):
        p.stdin.write(frame_at(i / FPS).convert("RGB").tobytes())
    p.stdin.close()
    p.wait()


# ------------------------------------------------------------------ sound
def sound(path):
    import opening_sound as S
    SR = S.SR
    n = int(DUR * SR)
    mus = np.zeros(n)
    fx = np.zeros(n)
    S.add(fx, S.noise_sweep(0.3, 400, 7000), T_FLASH - 0.2, 0.35)
    S.add(fx, S.stab([62, 65, 69, 74], 0.6, 3200), T_FLASH, 0.55)
    S.add(fx, S.kick(), T_FLASH, 0.8)
    S.add(mus, S.pad([50, 57, 62, 65, 69], DUR - T_FLASH), T_FLASH, 0.3)
    walk = [38, 41, 45, 48, 46, 45, 41, 38]
    for i in range(int((T_OUT - T_FLASH) / (60 / 120))):
        S.add(mus, S.pluck(walk[i % len(walk)], 0.4), T_FLASH + i * 0.5, 0.5)
        S.add(mus, S.hat(), T_FLASH + i * 0.5 + 0.25, 0.08)
    hd = len("人物档案 · FILE " + CARD["no"])
    for j in range(hd):
        S.add(fx, S.tick(), T_HEAD + j / 30, 0.25)
    for i, (_, val) in enumerate(CARD["rows"]):
        t0 = T_ROWS + i * ROW_GAP
        S.add(fx, S.thud(), t0, 0.25)
        for j in range(len(val)):
            S.add(fx, S.tick(), t0 + j / 30, 0.35)
    S.add(fx, S.thud(), T_STAMP, 1.0)
    S.add(fx, S.kick(), T_STAMP, 0.7)
    S.add(fx, S.stab([57, 60, 63, 66], 0.5, 2600), T_STAMP, 0.45)
    for j, ch in enumerate(CARD["quote"]):
        if ch in "，。":
            continue
        nb = int(0.045 * SR)
        x = np.sign(np.sin(2 * np.pi * S.hz(76 + j % 3) * S.t_(nb))) * np.exp(-S.t_(nb) * 50)
        S.add(fx, x, T_QUOTE + j / CPS, 0.1)
    S.add(fx, S.noise_sweep(0.35, 300, 6000, up=False), T_OUT, 0.35)
    mix = 0.8 * mus + fx
    mix /= np.abs(mix).max() / 0.9
    st = np.stack([mix, mix], 1)
    with wave.open(str(path), "w") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((st * 32767).astype("<i2").tobytes())


if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    if len(sys.argv) > 1 and sys.argv[1] == "still":
        for s in sys.argv[2:]:
            frame_at(float(s)).convert("RGB").save(OUT / f"dossier_{s}.png")
    else:
        render_video(OUT / "dossier_raw.mp4")
        sound(OUT / "dossier.wav")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(OUT / "dossier_raw.mp4"), "-i", str(OUT / "dossier.wav"),
                        "-c:v", "copy", "-af", "loudnorm=I=-14:TP=-1.5", "-c:a", "aac", "-b:a", "192k",
                        str(OUT / "dossier_sample.mp4")], check=True)
        print("wrote", OUT / "dossier_sample.mp4")
