"""Case 01 · 雨夜书房 (v2, harder) — vertical 1080x1920 immersive detective short.

You are the detective: the camera is your eyes, a lantern lights where you look,
suspects face you in interrogation boxes, and clues fill your notebook. The key clue
(a dark-red hair on the saucer) is on screen but never pointed out until the reveal.

Shots are keyed to line ids in lines.json via the voice timeline.
python3 case_render.py              -> out/case01_raw.mp4
python3 case_render.py 30 45        -> out/case01_part.mp4
python3 case_render.py still 31.5   -> out/still_0.png
"""
import math, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw
from case_kit import *   # noqa: F401,F403  (assets, helpers, timeline)

s_ = lambda i: S[IDX[i]]
e_ = lambda i: E[IDX[i]]
k_ = lambda i: KY[IDX[i]]

# ------------------------------------------------------------------ immersion layers
def lantern(frame, t, cx, cy, r=330, show_hand=True, warm=True):
    """Darkness everywhere except a flickering pool of lantern light at (cx, cy).
    The mask is built on a coarse grid so the light falls off in chunky pixel rings."""
    g = 10
    gw, gh = W // g, H // g
    yy, xx = np.mgrid[0:gh, 0:gw]
    fl = 1 + 0.03 * math.sin(t * 23) + 0.02 * math.sin(t * 37 + 1)
    d = np.hypot(xx * g + g / 2 - cx, yy * g + g / 2 - cy) / (r * fl)
    a = np.select([d < 0.7, d < 0.85, d < 1.0, d < 1.2], [0, 60, 120, 175], 215).astype(np.uint8)
    dark = np.zeros((gh, gw, 4), np.uint8)
    dark[..., :3] = (8, 5, 14)
    dark[..., 3] = a
    m = Image.fromarray(dark, "RGBA").resize((W, H), Image.NEAREST)
    frame.alpha_composite(m)
    if warm:
        glow = np.zeros((gh, gw, 4), np.uint8)
        glow[..., :3] = (255, 170, 80)
        glow[..., 3] = np.where(d < 0.85, 26, 0).astype(np.uint8)
        frame.alpha_composite(Image.fromarray(glow, "RGBA").resize((W, H), Image.NEAREST))
    if show_hand:
        sw = int(10 * math.sin(t * 1.6))
        im = up(LANTERN, 5)
        frame.alpha_composite(im, (W - im.width + 150 + sw, 1000 + int(6 * math.sin(t * 2.3))))


def breathe(t):
    """Handheld sway in art pixels, so the frame never feels locked off."""
    return 0.6 * math.sin(t * 0.9), 0.4 * math.sin(t * 1.3 + 1)


def rewind_fx(frame, t):
    a = np.array(frame)
    rows = (np.arange(H) + int(t * 900)) % 240 < 14
    a[rows, :, :3] = np.clip(a[rows, :, :3].astype(int) + 60, 0, 255)
    frame = Image.fromarray(a, "RGBA")
    paste_c(frame, text_img("◀◀ 倒带", 5, WHITE), W / 2, 300)
    return frame


# ------------------------------------------------------------------ HUD + text
CLUES = [(k_("clock"), "9:45"), (k_("poison"), "毒杯"), (k_("rain"), "下雨"), (k_("will2"), "遗嘱"),
         (k_("p4"), "黑指"), (k_("hall2"), "两伞")]
NAMES = {"B": "管家", "S": "秘书", "P": "侄子"}


def hud(frame, t):
    d = ImageDraw.Draw(frame)
    d.rectangle((0, 0, W, 132), fill=(16, 12, 24, 230))
    d.rectangle((0, 132, W, 137), fill=(52, 40, 66, 255))
    frame.alpha_composite(text_img("第一案 · 雨夜书房", 3, GOLD), (36, 18))
    frame.alpha_composite(text_img("笔记", 3, CREAM), (36, 72))
    x = 150
    for tc, lab in CLUES:
        box = (x, 66, x + 142, 124)
        if t >= tc:
            hot = t - tc < 0.3
            d.rectangle(box, fill=(232, 182, 72) if hot else (60, 44, 24), outline=GOLD)
            im = text_img(lab, 3, CREAM)
        else:
            d.rectangle(box, outline=(80, 64, 96))
            im = text_img("?", 3, (110, 92, 130), None)
        frame.alpha_composite(im, (x + 71 - im.width // 2, 68))
        x += 152


def wrap(txt, n=14):
    """Greedy: break after the last punctuation that fits in n chars, else at n."""
    rows = []
    while len(txt) > n:
        if len(txt) <= n + 2 and all(ch in "，。：？！…" for ch in txt[n:]):
            break                          # never leave punctuation alone on a row
        cut = max([i + 1 for i, ch in enumerate(txt[:n]) if ch in "，。：？！…"] or [n])
        if cut < n // 2:
            cut = n
        rows.append(txt[:cut]); txt = txt[cut:]
    return rows + ([txt] if txt else [])


def line_at(t):
    idx = max([i for i in range(len(S)) if t >= S[i] - 0.05] or [-1])
    if idx < 0 or t > E[idx] + 0.6:
        return None
    return idx


def subtitle(frame, t):
    idx = line_at(t)
    if idx is None:
        return
    ln = LINES[idx]
    rows = wrap(ln["t"])
    d = ImageDraw.Draw(frame)
    if ln["w"] in NAMES:      # interrogation box: name plate + text typed out as they speak
        y0 = 1520
        d.rectangle((24, y0, W - 24, y0 + 90 + 74 * len(rows)), fill=(250, 244, 226, 245), outline=K, width=8)
        d.rectangle((36, y0 + 12, W - 36, y0 + 78 + 74 * len(rows)), outline=(190, 170, 130), width=3)
        tagim = text_img(NAMES[ln["w"]], 3, CREAM, None)
        d.rectangle((48, y0 - 50, 48 + tagim.width + 36, y0 + 4), fill=(120, 40, 44), outline=K, width=5)
        frame.alpha_composite(tagim, (66, y0 - 44))
        frac = clamp((t - S[idx]) / max(0.3, (E[idx] - S[idx]) * 0.92))
        shown = int(len(ln["t"]) * frac + 0.999)
        y, used = y0 + 40, 0
        for r in rows:
            part = r[: max(0, shown - used)]
            used += len(r)
            if part:
                frame.alpha_composite(text_img(part, 4, INK, None), (70, y))
            y += 74
        if frac >= 1 and (t * 2) % 1 < 0.5:
            d.polygon([(W - 90, y0 + 54 + 74 * len(rows)), (W - 60, y0 + 54 + 74 * len(rows)), (W - 75, y0 + 70 + 74 * len(rows))], fill=(120, 40, 44))
        return
    y = 1590
    d.rectangle((0, y - 30, W, y + 70 * len(rows) + 30), fill=(14, 10, 20, 205))
    for r in rows:
        im = text_img(r, 4, CREAM, INK, spans=[(ln["k"], GOLD)] if ln["k"] in r else [])
        frame.alpha_composite(im, (W // 2 - im.width // 2, y))
        y += 70


def hold_it(frame, t, t0, text="追问！"):
    """Ace-Attorney style shout bubble slammed onto the screen."""
    if not (t0 <= t < t0 + 1.0):
        return
    k = clamp((t - t0) / 0.1)
    im = text_img(text, 10, WHITE, INK)
    pad = 40
    bub = Image.new("RGBA", (im.width + 2 * pad, im.height + 2 * pad), (0, 0, 0, 0))
    bd = ImageDraw.Draw(bub)
    pts = []
    cx, cy = bub.width / 2, bub.height / 2
    for i in range(24):
        a = 2 * math.pi * i / 24
        rr = (0.5 if i % 2 else 0.62)
        pts.append((cx + math.cos(a) * bub.width * rr, cy + math.sin(a) * bub.height * rr))
    bd.polygon(pts, fill=(214, 56, 56, 255), outline=K)
    bub.alpha_composite(im, (pad, pad))
    s = 0.6 + 0.4 * k
    bub = bub.resize((int(bub.width * s), int(bub.height * s)), Image.NEAREST)
    paste_c(frame, bub, W / 2, 560)


def sweat(frame, t, x, y):
    d = ImageDraw.Draw(frame)
    k = (t * 1.5) % 1
    yy = y + k * 60
    d.polygon([(x, yy), (x - 14, yy + 26), (x, yy + 38), (x + 14, yy + 26)], fill=(140, 210, 250), outline=K)


def choice_menu(frame, t, t0, items, pick):
    """'Where do you look first?' menu; the cursor steps through and picks."""
    if t < t0:
        return
    d = ImageDraw.Draw(frame)
    x0, y0 = 120, 1120
    d.rectangle((x0, y0, W - 120, y0 + 80 + 76 * len(items)), fill=(16, 12, 24, 235), outline=GOLD, width=6)
    frame.alpha_composite(text_img("你先看哪里？", 3, GOLD), (x0 + 30, y0 + 18))
    cur = [0, 1, 2, 1, 0][min(4, int((t - t0) / 0.18))] if pick == 0 else min(pick, int((t - t0) / 0.28))
    for i, it in enumerate(items):
        col = GOLD if i == cur else CREAM
        frame.alpha_composite(text_img(("▶ " if i == cur else "  ") + it, 4, col, None), (x0 + 40, y0 + 80 + 76 * i))


# ------------------------------------------------------------------ shots
def shot_cold(t):
    f = Image.new("RGBA", (W, H), (6, 4, 10, 255))
    fl = max(0, 1 - abs(t - (k_("open1") + 0.1)) / 0.12) + 0.6 * max(0, 1 - abs(t - (k_("open1") + 0.45)) / 0.08)
    f.alpha_composite(up(door_art(0), 5))
    darken(f, 0.86 - 0.7 * fl)
    if t > 0.3:
        paste_c(f, text_img("22:00 · 伦敦", 5, CREAM), W / 2, 420, ramp(t, 0.3, 0.4))
    return f


def shot_door(t):
    t0 = s_("open2")
    k = ease((t - t0) / 1.2)
    cx, cy, z = cam_path(t, [(t0, 108, 192, 5), (k_("open2") - 0.05, 104, 214, 6)])
    f = camera(study_at(t), cx, cy, z).convert("RGBA")
    darken(f, 0.3)
    if k < 1:
        f.alpha_composite(up(door_art(k), 5))
    if t >= k_("open2"):
        f = camera(study_at(t), 100, 224, 10).convert("RGBA")
        darken(f, 0.2)
        dx, dy = shake(t, k_("open2"), 14)
        f = f.transform(f.size, Image.AFFINE, (1, 0, -dx, 0, 1, -dy))
        f.alpha_composite(Image.new("RGBA", f.size, (120, 0, 0, int(80 * max(0, 1 - (t - k_("open2")) / 1.2)))))
    return f


def shot_intro(t):
    f = camera(study_at(t), 108, 200, 5).convert("RGBA")
    darken(f, 0.6)
    pose = "deduce" if t > s_("rule") + 0.3 else "idle"
    holmes(f, t, pose, W / 2, 1540, 9, talking=True, enter=s_("me"), leave=e_("rule") + 0.05)
    if s_("me") + 0.3 < t < e_("me") + 0.2:
        tag(f, "福尔摩斯", W / 2, 600, t=t - s_("me") - 0.3)
    if t > k_("me") - 0.1:
        stamp(f, "侦探：你", W / 2, 470, t - k_("me") + 0.1, GOLD, 6, -6)
    return f


def shot_title(t):
    """End of the rules: title card, then the lantern is raised (line 'dark')."""
    f = camera(study_at(t), 108, 200, 5).convert("RGBA")
    t0 = s_("dark")
    lantern(f, t, W / 2, 800, r=40 + 300 * ramp(t, k_("dark"), 0.6), show_hand=t > k_("dark") - 0.3)
    if t < k_("dark"):
        paste_c(f, text_img("第一案", 5, GOLD), W / 2, 700, 1 - ramp(t, k_("dark") - 0.3, 0.3))
        paste_c(f, text_img("雨夜书房", 9, CREAM), W / 2, 840, 1 - ramp(t, k_("dark") - 0.3, 0.3))
    return f


def study_lit(t, keys, light, flash_at=None, **kw):
    cx, cy, z = cam_path(t, keys)
    bx, by = breathe(t)
    fl = 0.0
    if flash_at is not None:
        fl = max(0, 1 - abs(t - flash_at) / 0.1) + 0.5 * max(0, 1 - abs(t - flash_at - 0.3) / 0.08)
    f = camera(study_at(t, flash=fl, **kw), cx + bx, cy + by, z).convert("RGBA")
    if fl < 0.5:
        lt = light(t) if callable(light) else light
        lantern(f, t, *lt)
    else:
        flash(f, 0.25 * fl, (210, 225, 255))
    return f


def shot_clock(t):
    t0 = s_("clock")
    f = study_lit(t, [(t0 + 0.6, 108, 230, 6), (t0 + 1.4, 150, 300, 10)], (W / 2, 1000))
    if t < t0 + 1.0:
        choice_menu(f, t, t0 - 0.12, ["座钟", "茶杯", "窗户", "遗嘱"], 0)
    if t > k_("clock") - 0.25:
        k = ramp(t, k_("clock") - 0.25, 0.25)
        paste_c(f, up(CLOCK, 10), W / 2, 820, k)
        tag(f, "9:45", W / 2, 1280, RED, WHITE, 5, t - k_("clock"))
    return f


TEA_CAM = (118, 236, 10)


def shot_tea(t):
    t0 = s_("tea")
    f = study_lit(t, [(t0, 150, 300, 10), (t0 + 0.7, *TEA_CAM)],
                  lambda t: (330 + 230 * ramp(t, s_("poison") + 1.0, 0.6), 950, 330 + 160 * ramp(t, s_("poison") + 1.0, 0.6)))
    d = ImageDraw.Draw(f)
    if t > s_("poison") + 0.3:
        if (t * 3) % 1 < 0.7:
            d.rectangle((30, 820, 260, 1010), outline=RED, width=8)
        tag(f, "茶杯：有毒", 200, 740, RED, WHITE, 3, t - s_("poison") - 0.3)
    if t > k_("poison"):
        d.rectangle((760, 840, 1075, 1110), outline=GREEN, width=8)
        tag(f, "茶壶：没毒", 880, 760, GREEN, INK, 3, t - k_("poison"))
    return f


def shot_rain(t):
    t0 = s_("rain")
    return study_lit(t, [(t0, *TEA_CAM), (t0 + 0.6, 106, 110, 6)], (W / 2, 800), flash_at=t0 + 0.9) \
        if t < k_("rain") else _rain_tag(t)


def _rain_tag(t):
    f = study_lit(t, [(0, 106, 110, 6)], (W / 2, 800))
    tag(f, "9:30 开始下雨", W / 2, 1320, SKY, INK, 4, t - k_("rain"))
    return f


def will_card(f, t, t_key, glow=False):
    big = up(WILL, 8)
    paste_c(f, big, W / 2, 880)
    x0, y0 = W / 2 - big.width / 2, 880 - big.height / 2
    head = text_img("遗嘱", 6, INK, None)
    f.alpha_composite(head, (int(W / 2 - head.width / 2), int(y0 + 36)))
    rows = [("明天起：", INK), ("侄子若与", INK), ("秘书成婚，", INK), ("取消其全部", RED), ("继承权。", RED)]
    for k, (s, col) in enumerate(rows):
        if glow or t >= t_key - 2.2 + 0.4 * k:
            f.alpha_composite(text_img(s, 4, col, None), (int(x0 + 60), int(y0 + 170 + 92 * k)))
    if glow or t >= t_key:
        ImageDraw.Draw(f).rectangle((x0 + 60, y0 + 170 + 92 * 4 + 66, x0 + 60 + 4 * 16 * 4, y0 + 170 + 92 * 4 + 76), fill=RED)


def shot_will(t):
    f = study_lit(t, [(s_("will1"), 112, 238, 10)], (W / 2, 900))
    if t > k_("will1") - 0.2:
        darken(f, 0.4 * ramp(t, k_("will1") - 0.2, 0.3))
        will_card(f, t, k_("will2"))
    return f


def room_dark(t):
    f = camera(study_at(t), 108, 192, 5).convert("RGBA")
    darken(f, 0.84)
    return f


SUS = [("butler", "管家"), ("secretary", "秘书"), ("nephew", "侄子")]


def shot_three(t):
    f = room_dark(t)
    for i, (n, lab) in enumerate(SUS):
        tt = t - (s_("three") + 0.15 * i)
        if tt > 0:
            portrait_card(f, n, 200 + i * 340, 820 + (1 - ease(tt / 0.3)) * 1200, 2, "？", sil=t < k_("three") + 0.6)
    return f


def interrogate(t, who, extra=None):
    f = room_dark(t)
    i = [n for n, _ in SUS].index(who)
    for j, (m, l2) in enumerate(SUS):
        if j != i:
            portrait_card(f, m, 180 + j * 360, 300, 1, l2, alpha=0.5)
    lv = loud(t)
    bob = 5 if (t * 2) % 1 < 0.5 else 0
    box = portrait_card(f, who, W / 2, 900 + bob - (5 if lv > 0.3 else 0), 6, None)
    if extra:
        extra(f, t, box)
    return f


def shot_butler(t):
    def ex(f, t, box):
        if t > k_("b3"):
            stamp(f, "厨娘作证 ✓", W / 2 + 120, 1290, t - k_("b3"), GREEN, 4)
    return interrogate(t, "butler", ex)


def shot_secretary(t):
    def ex(f, t, box):
        tw = up(TYPEW, 2)
        f.alpha_composite(tw, (W - tw.width - 20, 1170 - tw.height))
        if s_("s1") < t < e_("s2") and (t * 9) % 1 < 0.5:
            tag(f, "嗒嗒嗒", W - 150, 860, CREAM, INK, 2)
        if t > k_("s2"):
            stamp(f, "两小时没停 ✓", W / 2 - 60, 1290, t - k_("s2"), GREEN, 4)
    return interrogate(t, "secretary", ex)


def shot_nephew(t):
    def ex(f, t, box):
        if t > s_("p2"):
            sweat(f, t, box[2] - 60, box[1] + 70)
        hold_it(f, t, s_("p3"))
    f = interrogate(t, "nephew", ex)
    if s_("p2") <= t < s_("p2") + 0.4:
        dx, dy = shake(t, s_("p2"), 16)
        f = f.transform(f.size, Image.AFFINE, (1, 0, -dx, 0, 1, -dy))
    if t > k_("p3"):
        darken(f, 0.5)
        k = ramp(t, k_("p3"), 0.25)
        paste_c(f, up(HAND, 6), W / 2, 820 + (1 - k) * 600)
        lantern(f, t, W / 2, 650, r=420, show_hand=False)
        if t > s_("p4"):
            tag(f, "墨水？", 780, 420, CREAM, INK, 4, t - s_("p4"))
            sweat(f, t, 200, 300)
    return f


def shot_hall(t):
    t0 = s_("hall1")
    bx, by = breathe(t)
    cx, cy, z = cam_path(t, [(t0, 108, 192, 5), (t0 + 1.4, 54, 262, 10)])
    f = camera(hall_at(t), cx + bx, cy + by, z).convert("RGBA")
    if t > s_("hall2") + 0.2:
        tag(f, "医生的伞", 340, 520, CREAM, INK, 3, t - s_("hall2") - 0.2)
    if t > k_("hall2") - 0.2:
        tag(f, "侄子的伞", 790, 520, CREAM, INK, 3, t - k_("hall2") + 0.2)
    return f


def ev_card(f, x, y, w, h, img, label):
    d = ImageDraw.Draw(f)
    d.rectangle((x, y, x + w, y + h), fill=(36, 28, 46), outline=GOLD, width=5)
    im = img.copy()
    im.thumbnail((w - 20, h - 70), Image.NEAREST)
    f.alpha_composite(im, (int(x + w / 2 - im.width / 2), int(y + 12)))
    lab = text_img(label, 2, CREAM)
    f.alpha_composite(lab, (int(x + w / 2 - lab.width / 2), y + h - 48))


def evidence_imgs(t):
    st = study_at(t)
    tea = st.crop((64, 222, 96, 250)).resize((32 * 8, 28 * 8), Image.NEAREST)   # hair is in here, fairly
    hall = hall_at(t).crop((36, 228, 70, 304)).resize((34 * 4, 76 * 4), Image.NEAREST)
    return [(up(CLOCK, 3), "座钟 9:45"), (tea, "半杯毒茶"), (up(WILL, 2), "遗嘱"),
            (up(TYPEW, 2), "打字两小时"), (up(HAND, 2), "侄子的手"), (hall, "两把伞")]


def shot_pause(t):
    f = room_dark(t)
    if t < k_("ask") - 0.05:
        holmes(f, t, "idle", W / 2, 1500, 8, talking=True, enter=s_("ready"))
        return f
    paste_c(f, text_img("是谁下的毒？", 7, GOLD), W / 2, 250 - (1 - ramp(t, k_("ask"), 0.25)) * 200)
    for i, (n, lab) in enumerate(SUS):
        portrait_card(f, n, 190 + i * 350, 520, 1, f"{i + 1} {lab}")
    for i, (img, lab) in enumerate(evidence_imgs(t)):
        ev_card(f, 40 + (i % 3) * 340, 700 + (i // 3) * 380, 320, 360, img, lab)
    hold0 = e_("ask")
    if t > hold0:
        n = 5 - int(t - hold0)
        if n >= 1:
            ph = (t - hold0) % 1
            num = text_img(str(n), 10, RED)
            s = 1 + 0.3 * (1 - ph / 0.2) if ph < 0.2 else 1
            paste_c(f, num.resize((int(num.width * s), int(num.height * s)), Image.NEAREST), W / 2, 1520)
        if (t * 2) % 1 < 0.6:
            paste_c(f, text_img("⏸ 暂停 · 把推理写在评论区", 3, WHITE), W / 2, 1680)
    return f


def mini_holmes(f, t, pose="idle"):
    holmes(f, t, pose, 170, 1560, 5, talking=True)


def shot_r0(t):
    f = room_dark(t)
    flash(f, 1 - (t - s_("r0")) / 0.3)
    portrait_card(f, "nephew", W / 2, 820, 5, "侄子？")
    if t > k_("r0"):
        stamp(f, "侄子？", W / 2 + 80, 1180, t - k_("r0"), GOLD, 6)
    paste_c(f, text_img("答案揭晓", 6, GOLD), W / 2, 260)
    mini_holmes(f, t, "deduce")
    return f


def umbrellas(t, wet=True):
    return hall_at(t, wet).crop((30, 222, 74, 306)).resize((44 * 10, 84 * 10), Image.NEAREST)


def shot_r1(t):
    f = Image.new("RGBA", (W, H), (14, 10, 20, 255))
    paste_c(f, umbrellas(t), W / 2, 780)
    tag(f, "医生的：滴水", 300, 380, SKY, INK, 3, t - s_("r1"))
    tag(f, "侄子的：干的", 790, 380, GOLD, INK, 3, t - s_("r1") - 0.6)
    if t > k_("r1") - 0.4:
        stamp(f, "他早就到了", W / 2 + 120, 1300, t - k_("r1") + 0.4, RED, 5)
    mini_holmes(f, t)
    return f


def shot_r2(t):
    f = Image.new("RGBA", (W, H), (14, 10, 20, 255))
    paste_c(f, up(HAND, 5), 330, 760)
    tw = up(TYPEW, 3)
    paste_c(f, tw, 760, 1060)
    if t > k_("r2") - 0.6:
        d = ImageDraw.Draw(f)
        d.line((420, 560, 700, 960), fill=GOLD, width=10)
        tag(f, "= 打字机色带", 700, 560, GOLD, INK, 4, t - k_("r2") + 0.6)
    mini_holmes(f, t)
    return f


def shot_r3(t):
    f = Image.new("RGBA", (W, H), (14, 10, 20, 255))
    paste_c(f, up(TYPEW, 4), W / 2, 640)
    d = ImageDraw.Draw(f)
    y = 1120
    x0, x1 = 90, 990
    d.rectangle((x0, y, x1, y + 40), fill=(60, 50, 70))
    k = clamp((t - s_("r3")) / 1.6)
    mid = x0 + (x1 - x0) * 0.62     # ~9:15
    d.rectangle((x0, y, x0 + (mid - x0) * min(1, k / 0.6), y + 40), fill=(150, 52, 34))
    if t > k_("r3") - 0.5:
        d.rectangle((mid, y, mid + (x1 - mid) * ramp(t, k_("r3") - 0.5, 0.5), y + 40), fill=(232, 200, 90))
        f.alpha_composite(text_img("侄子", 3, (232, 200, 90)), (int(mid + 40), y + 60))
    f.alpha_composite(text_img("秘书", 3, (220, 110, 80)), (x0 + 40, y + 60))
    f.alpha_composite(text_img("8:00", 2, CREAM), (x0 - 20, y - 50))
    f.alpha_composite(text_img("10:00", 2, CREAM), (x1 - 60, y - 50))
    if (t * 9) % 1 < 0.5:
        tag(f, "嗒嗒嗒", 860, 340, CREAM, INK, 2)
    mini_holmes(f, t)
    return f


def shot_r4(t):
    f = study_lit(t, [(s_("r4"), 108, 192, 5), (s_("r4") + 1.0, *TEA_CAM)], (330, 950))
    if t < s_("r4") + 1.2:
        f = rewind_fx(f, t)
    mini_holmes(f, t)
    return f


def shot_r5(t):
    hx, hy = HAIR_AT[0] + 6, HAIR_AT[1] + 2
    z = 10 if t < k_("r5") - 0.3 else 15
    f = camera(study_at(t), hx, hy - 6, z).convert("RGBA")
    lantern(f, t, W / 2, 1040, r=380, show_hand=False)
    if t > k_("r5") - 0.3:
        d = ImageDraw.Draw(f)
        sx = W / 2 - (6 * 15) + 6 * 15     # hair centre on screen at this framing
        if (t * 3) % 1 < 0.7:
            d.ellipse((W / 2 - 160, 1050 - 90, W / 2 + 160, 1050 + 90), outline=GOLD, width=10)
        tag(f, "暗红色的头发", W / 2, 760, (150, 52, 34), WHITE, 4, t - k_("r5") + 0.3)
    mini_holmes(f, t)
    return f


def shot_r6(t):
    f = room_dark(t)
    marks = [("butler", "白发", False), ("nephew", "金发", False), ("secretary", "暗红", True)]
    for i, (n, lab, hit) in enumerate(marks):
        x = 190 + i * 350
        portrait_card(f, n, x, 760, 2, lab, glow=(90, 30, 30) if hit and t > k_("r6") else None)
        tt = t - (s_("r6") + 0.8 * i)
        if tt > 0 and not hit:
            stamp(f, "✗", x, 760, tt, RED, 8, 0)
        if hit and t > k_("r6"):
            stamp(f, "✓", x, 760, t - k_("r6"), GOLD, 8, 0)
    mini_holmes(f, t)
    return f


def shot_r7(t):
    f = camera(study_at(t, poison=(t - (k_("r7") - 0.5)) / 0.5 if t > k_("r7") - 0.5 else None), 100, 232, 10).convert("RGBA")
    darken(f, 0.35)
    k = ease((t - s_("r7")) / 1.2)
    portrait_card(f, "secretary", W + 200 - 520 * k, 700, 3, None, sil=t < k_("r7") - 0.6)
    tag(f, "9:42", 200, 300, RED, WHITE, 5, t - s_("r7"))
    mini_holmes(f, t)
    return f


def shot_r8(t):
    f = camera(study_at(t), 112, 238, 10).convert("RGBA")
    darken(f, 0.7)
    will_card(f, t, 0, glow=True)
    dx, dy = shake(t, s_("r8") + 0.3, 10, 0.5)
    f = f.transform(f.size, Image.AFFINE, (1, 0, -dx, 0, 1, -dy))
    mini_holmes(f, t)
    return f


def shot_culprit(t):
    f = room_dark(t)
    hit = t > k_("r9")
    portrait_card(f, "secretary", W / 2, 720, 5, "秘书", glow=(60, 20, 26) if hit else None)
    if hit:
        stamp(f, "凶手", W / 2 + 60, 940, t - k_("r9"), (255, 72, 72), 9)
    t_help = s_("r9") + (e_("r9") - s_("r9")) * 0.5
    if t > t_help:
        portrait_card(f, "nephew", 880, 1290, 1, None)
        stamp(f, "帮手", 880, 1300, t - t_help, GOLD, 3)
    if hit:
        dx, dy = shake(t, k_("r9"), 22)
        f = f.transform(f.size, Image.AFFINE, (1, 0, -dx, 0, 1, -dy))
    holmes(f, t, "deduce", 190, 1560, 5)
    return f


def shot_outro(t):
    f = room_dark(t)
    darken(f, 0.1)
    pose = "sit" if t < s_("end") + 1.6 else "idle"
    holmes(f, t, pose, W / 2, 1450, 9, talking=pose == "idle")
    if t > k_("end") - 0.2:
        paste_c(f, text_img("第二案 · 敬请期待", 4, GOLD), W / 2, 380, ramp(t, k_("end") - 0.2, 0.3))
    return f


SHOTS = [
    (0, shot_cold), (s_("open2"), shot_door), (s_("me"), shot_intro), (e_("rule") + 0.2, shot_title),
    (s_("clock"), shot_clock), (s_("tea"), shot_tea), (s_("rain"), shot_rain), (s_("will1"), shot_will),
    (s_("three"), shot_three), (s_("b1"), shot_butler), (s_("s1"), shot_secretary), (s_("p1"), shot_nephew),
    (s_("hall1"), shot_hall), (s_("ready"), shot_pause), (s_("r0"), shot_r0), (s_("r1"), shot_r1),
    (s_("r2"), shot_r2), (s_("r3"), shot_r3), (s_("r4"), shot_r4), (s_("r5"), shot_r5), (s_("r6"), shot_r6),
    (s_("r7"), shot_r7), (s_("r8"), shot_r8), (s_("r9"), shot_culprit), (s_("end"), shot_outro),
]
NO_HUD = {shot_cold, shot_door, shot_title}


def frame_at(t):
    fn = [f for t0, f in SHOTS if t >= t0 - 0.12][-1]
    f = fn(t)
    if fn not in NO_HUD and t < s_("r0"):
        hud(f, t)
    subtitle(f, t)
    for t0, _ in SHOTS[1:]:
        if 0 <= t - (t0 - 0.12) < 2 / FPS:
            flash(f, 0.35)
    return f


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "still":
        for i, s in enumerate(sys.argv[2:]):
            frame_at(float(s)).convert("RGB").save(HERE / "out" / f"still_{i}.png")
        sys.exit()
    a, b = (float(sys.argv[1]), float(sys.argv[2])) if len(sys.argv) > 2 else (0, DUR)
    out = HERE / "out" / ("case01_raw.mp4" if len(sys.argv) <= 2 else "case01_part.mp4")
    ff = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                           "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-crf", "16", "-preset", "medium",
                           "-pix_fmt", "yuv420p", str(out)], stdin=subprocess.PIPE)
    for n in range(int(a * FPS), int(b * FPS)):
        ff.stdin.write(frame_at(n / FPS).convert("RGB").tobytes())
        if n % 300 == 0:
            print("frame", n, flush=True)
    ff.stdin.close(); ff.wait()
    print("->", out)
