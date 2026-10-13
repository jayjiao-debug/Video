"""Visual-novel dialogue sample: Holmes questions the secretary. Big detailed portraits swap expression
line by line; the text types out with per-character blips; mouths flap while text is typing; blinks;
a 追问！ shout, a flash and shake on the shock beat, speed lines behind the reaction.

python3 vn_scene.py              -> out/vn_sample.mp4 (with sound)
python3 vn_scene.py still 3.2    -> out/still_3.2.png
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
SCALE = 7                       # 128-px bust -> 896 px on screen
CPS = 12                        # typing speed, characters per second
HOLD = 1.5                      # reading time after a line finishes typing
NAMES = {"holmes": "福尔摩斯", "secretary": "秘书"}

# (who, expression, text, beat)   beat: None | "shout" (追问！ before the line) | "shock"
SCRIPT = [
    ("holmes", "neutral", "你说，八点到十点，|你一直在楼上打字。", None),
    ("secretary", "smile", "是的，先生。|打字声两个小时都没停过。", None),
    ("holmes", "think", "嗯……|可茶杯的托盘上，有一根头发。", None),
    ("secretary", "nervous", "头、头发？那又能说明什么？", None),
    ("holmes", "smirk", "深红色的。|这栋房子里，只有你是这个发色。", "shout"),
    ("secretary", "shock", "……！", "shock"),
    ("holmes", "serious", "九点四十二分，你下过楼。", None),
    ("secretary", "despair", "……", None),
]

SHOUT_D = 1.0
SWAP = 0.22


def timeline():
    t = 0.6
    out = []
    for who, ex, text, beat in SCRIPT:
        if beat == "shout":
            out.append(dict(kind="shout", t0=t, t1=t + SHOUT_D))
            t += SHOUT_D
        d = len(text.replace("|", "")) / CPS
        hold = HOLD + (0.8 if beat == "shock" else 0) + (0.6 if text.startswith("……") and len(text) <= 3 else 0)
        out.append(dict(kind="line", who=who, ex=ex, text=text, beat=beat, t0=t, t_typed=t + d, t1=t + d + hold))
        t += d + hold
    return out, t + 0.6


TL, DUR = timeline()
LINES = [e for e in TL if e["kind"] == "line"]

# ------------------------------------------------------------------ assets
STUDY = K.STUDY
BG = K.camera(STUDY, 108, 190, 5).convert("RGBA")
BG = K.darken(BG, 0.45, (16, 10, 30))
BLINKS = {who: [1.7 + i * 2.9 + (0.6 if i % 2 else 0) for i in range(40)] for who in NAMES}
BLINKS["secretary"] = [b + 1.1 for b in BLINKS["secretary"]]


def wrap(text, n=14):
    rows, cur = [], ""
    for ch in text:
        if ch == "|":
            rows.append(cur)
            cur = ""
            continue
        if len(cur) >= n and ch not in "，。？！、…":
            rows.append(cur)
            cur = ""
        cur += ch
    rows.append(cur)
    return rows


def speed_lines(t, col=(240, 236, 255)):
    im = Image.new("RGBA", (W, H), (150, 40, 50, 255))
    d = ImageDraw.Draw(im)
    rng = np.random.default_rng(int(t * 12))
    cx, cy = W / 2, 900
    for _ in range(70):
        a = rng.uniform(0, 2 * math.pi)
        r0 = rng.uniform(300, 520)
        wdt = rng.uniform(0.01, 0.03)
        pts = [(cx + math.cos(a) * r0, cy + math.sin(a) * r0),
               (cx + math.cos(a - wdt) * 2000, cy + math.sin(a - wdt) * 2000),
               (cx + math.cos(a + wdt) * 2000, cy + math.sin(a + wdt) * 2000)]
        d.polygon(pts, fill=col + (255,))
    # chunk it to the 5x art grid so it stays pixel art
    return im.resize((W // 5, H // 5), Image.NEAREST).resize((W, H), Image.NEAREST)


def shout(frame, k, text="追问！"):
    im = K.text_img(text, 11, (255, 255, 255), K.INK)
    pad = 50
    bub = Image.new("RGBA", (im.width + 2 * pad, im.height + 2 * pad), (0, 0, 0, 0))
    bd = ImageDraw.Draw(bub)
    cx, cy = bub.width / 2, bub.height / 2
    pts = []
    for i in range(26):
        a = 2 * math.pi * i / 26
        rr = 0.5 if i % 2 else 0.64
        pts.append((cx + math.cos(a) * bub.width * rr, cy + math.sin(a) * bub.height * rr))
    bd.polygon(pts, fill=(214, 56, 56, 255), outline=K.K)
    bub.alpha_composite(im, (pad, pad - 6))
    s = 0.5 + 0.5 * min(1, k / 0.12)
    bub = bub.resize((int(bub.width * s), int(bub.height * s)), Image.NEAREST)
    K.paste_c(frame, bub, W / 2, 330)


def textbox(frame, line, t):
    d = ImageDraw.Draw(frame)
    x0, y0, x1, y1 = 40, 1440, W - 40, 1800
    d.rectangle((x0 + 8, y0 + 8, x1 + 8, y1 + 8), fill=(6, 4, 10, 200))
    d.rectangle((x0, y0, x1, y1), fill=(22, 18, 40, 238), outline=(236, 214, 160, 255), width=6)
    d.rectangle((x0 + 12, y0 + 12, x1 - 12, y1 - 12), outline=(90, 74, 120, 255), width=2)
    col = (236, 186, 70) if line["who"] == "holmes" else (214, 96, 86)
    name = K.text_img(NAMES[line["who"]], 4, K.INK, None)
    nx, ny = x0 + 30, y0 - 50
    d.rectangle((nx, ny, nx + name.width + 40, ny + 84), fill=col + (255,), outline=K.K + (255,), width=5)
    frame.alpha_composite(name, (nx + 20, ny + 4))
    n = int(clamp01((t - line["t0"]) / max(0.01, line["t_typed"] - line["t0"])) * len(plain(line["text"])))
    rows = wrap(line["text"])
    shown, y = n, y0 + 60
    for r in rows:
        part = r[:max(0, shown)]
        shown -= len(r)
        if part:
            frame.alpha_composite(K.text_img(part, 4, K.CREAM, K.INK), (x0 + 50, y))
        y += 92
    if t > line["t_typed"] and int(t * 3) % 2 == 0:   # "next" arrow
        d.polygon([(x1 - 70, y1 - 60), (x1 - 40, y1 - 60), (x1 - 55, y1 - 40)], fill=(236, 214, 160, 255))


def plain(s):
    return s.replace("|", "")


def clamp01(x):
    return max(0.0, min(1.0, x))


def portrait(who, ex, t, line):
    txt = plain(line["text"]) if line else ""
    typing = line and line["who"] == who and line["t0"] <= t < line["t_typed"] and txt[
        min(len(txt) - 1, int((t - line["t0"]) * CPS))] not in "，。？！、…"
    talk = 0
    if typing:
        talk = (1, 2, 1, 0)[int(t * 12) % 4]
    blink = any(b <= t < b + 0.12 for b in BLINKS[who])
    return F.render(who, ex, blink=blink, talk=talk)


def frame_at(t):
    line = None
    for l in LINES:
        if l["t0"] - (SHOUT_D if l["beat"] == "shout" else 0) <= t:
            line = l
    f = None
    shock_t = None
    if line and line["beat"] == "shock":
        shock_t = t - line["t0"]
    f = speed_lines(t) if shock_t is not None else BG.copy()
    shouting = next((e for e in TL if e["kind"] == "shout" and e["t0"] <= t < e["t1"]), None)
    if line:
        idx = LINES.index(line)
        prev = LINES[idx - 1] if idx else None
        k = clamp01((t - line["t0"]) / SWAP)
        bust = F.render(line["who"], line["ex"]) if shouting else portrait(line["who"], line["ex"], t, line)
        if shouting:   # during the shout, Holmes is shown, already pointing the finger
            bust = F.render("holmes", "serious")
        big = K.up(bust, SCALE)
        bx = W / 2 - big.width / 2
        if prev and prev["who"] != line["who"] and k < 1 and not shouting and line["beat"] != "shock":
            out = K.up(F.render(prev["who"], prev["ex"]), SCALE)
            e = K.ease(k)
            f.alpha_composite(out, (int(bx - e * W), 520))
            f.alpha_composite(big, (int(bx + (1 - e) * W), 520))
        else:
            dx, dy = 0, 0
            if shock_t is not None:
                dx, dy = K.shake(t, line["t0"], amp=30, d=0.5)
                if shock_t < 0.5:   # jolt back
                    dy -= int(40 * (1 - shock_t / 0.5))
            f.alpha_composite(big, (int(bx + dx), 520 + dy))
        textbox(f, line, t)
        if shock_t is not None:
            K.flash(f, max(0, 1 - shock_t / 0.25))
    if shouting:
        shout(f, t - shouting["t0"])
    return f


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
    bpm_beat = 60 / 84
    walk = [38, 41, 45, 41, 34, 38, 41, 38, 31, 34, 38, 34, 33, 37, 40, 37]
    shock = next(l["t0"] for l in LINES if l["beat"] == "shock")
    t, i = 0.0, 0
    while t < DUR:
        if not (shock - 0.05 < t < shock + 1.6):
            S.add(mus, S.pluck(walk[i % len(walk)], 0.5), t, 0.55)
            if i % 2 == 0:
                S.add(mus, S.hat(), t, 0.08)
        t += bpm_beat
        i += 1
    S.add(mus, S.pad([50, 57, 62, 65], DUR), 0, 0.25)
    for l in LINES:   # a blip per typed character
        pitch = 62 if l["who"] == "holmes" else 76
        for j, ch in enumerate(plain(l["text"])):
            if ch in "，。？！、…":
                continue
            m = pitch + (j % 3)
            nb = int(0.045 * SR)
            x = np.sign(np.sin(2 * np.pi * S.hz(m) * S.t_(nb))) * np.exp(-S.t_(nb) * 50)
            S.add(fx, x, l["t0"] + j / CPS, 0.10)
    for e in TL:
        if e["kind"] == "shout":
            S.add(fx, S.noise_sweep(0.25, 400, 6000), e["t0"], 0.4)
            S.add(fx, S.stab([62, 65, 69, 74], 0.5, 3600), e["t0"] + 0.02, 0.6)
            S.add(fx, S.thud(), e["t0"], 0.8)
    S.add(fx, S.crash(2.0), shock, 0.5)
    S.add(fx, S.kick(), shock, 1.0)
    S.add(fx, S.stab([57, 61, 64, 70], 0.9, 3000), shock, 0.6)
    S.add(fx, S.bell(69, 1.6), shock + 0.02, 0.3)
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
            frame_at(float(s)).convert("RGB").save(OUT / f"still_{s}.png")
    else:
        render_video(OUT / "vn_raw.mp4")
        sound(OUT / "vn.wav")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(OUT / "vn_raw.mp4"), "-i", str(OUT / "vn.wav"),
                        "-c:v", "copy", "-af", "loudnorm=I=-14:TP=-1.5", "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
                        "-shortest", str(OUT / "vn_sample.mp4")], check=True)
        print("wrote", OUT / "vn_sample.mp4", f"{DUR:.1f}s")
