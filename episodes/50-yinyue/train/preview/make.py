import sys; sys.path.insert(0, '.')
from animatic import *

K = f'{S}/kit'
tea = load(f'{S}/docimg/sleeper.jpg', crop=(600, 400, 1080, 670))
joint = load(f'{K}/track_env/joint_macro.png')
flank = load(f'{K}/carriage/flank.png')
wide = load(f'{K}/carriage/train_wide.png')
tq = load(f'{K}/carriage/three_quarter.png')
bridge = load(f'{S}/docimg/bridge.jpg')
bridge_tight = load(f'{S}/docimg/bridge.jpg', crop=(560, 250, 1280, 655))


def under_fn(im, t, u):
    # deep blue, never black: window-light bands sweep the concrete, one per beat
    a = np.zeros((H, W, 3), np.float32); a[:] = (14, 26, 44)
    b = T.beat_at_time(t)
    for k in range(-2, 4):
        x = ((k - (b % 1.0)) * 520 + 300)
        a[int(H * 0.30):int(H * 0.62), max(0, int(x)):max(0, int(x + 160))] += np.array((90, 66, 34), np.float32) * 0.9
    a = np.clip(a, 0, 255).astype(np.uint8)
    return Image.fromarray(a).filter(ImageFilter.GaussianBlur(18))


def title_fn(im, t, u):
    if t < T.t_of('title') + 0.12:      # the burst
        k = 1 - (t - T.t_of('title')) / 0.12
        im = ImageEnhance.Brightness(im).enhance(1 + 1.4 * k)
    a = (t - (T.t_of('title') + 0.5)) / 0.4
    if a > 0:
        im = im.filter(ImageFilter.GaussianBlur(min(1, a) * 4))
    return plaque(im, a)


A = [dict(a=0.0, b=2.81, im=tea, z=(1.0, 1.10)),
     dict(a=2.81, b=T.t_of('hook.accel', 1), im=joint, z=(1.05, 1.15)),
     dict(a=T.t_of('hook.accel', 1), b=T.t_of('hook.accel', 2), im=flank, z=(1.0, 1.10), c=(0.2, 0.5)),
     dict(a=T.t_of('hook.accel', 2), b=T.t_of('hook.underpass'), im=wide, z=(1.0, 1.08), c=(0.7, 0.5)),
     dict(a=T.t_of('hook.underpass'), b=T.t_of('title'), im=wide, fn=under_fn, amt=0.0),
     dict(a=T.t_of('title'), b=15.6, im=tq, z=(1.0, 1.06), fn=title_fn)]
dA, nA = (None, 0)  # opening already rendered

ZT = T.ZERO


def led(im, t):
    if t >= ZT:
        return im
    d = ImageDraw.Draw(im)
    txt = f'距零点 {T.countdown(t)}'
    d.rounded_rectangle((W - 330, 26, W - 26, 96), 8, fill=(10, 6, 6))
    d.text((W - 312, 32), txt, font=ImageFont.truetype('/home/user/assets/fonts/unifont.otf', 48), fill=(255, 59, 47))
    left = ZT - t
    if left <= 3.0 and left > 0.43:
        n = str(int(np.ceil(left)))
        tw = d.textlength(n, font=F_BIG)
        d.text(((W - tw) / 2, H * 0.22), n, font=F_BIG, fill=(255, 210, 122), stroke_width=4, stroke_fill=(40, 20, 10))
    return im


def zero_fn(im, t, u):
    if ZT - 0.43 <= t < ZT:            # one beat of breath
        im = ImageEnhance.Brightness(im).enhance(0.75)
    if ZT <= t < ZT + 0.15:
        k = 1 - (t - ZT) / 0.15
        im = ImageEnhance.Brightness(im).enhance(1 + 1.6 * k)
    if t >= ZT:
        im = ImageEnhance.Color(im).enhance(1.25)
    return im


B = [dict(a=258.2, b=ZT, im=bridge_tight, z=(1.0, 1.10), c=(0.35, 0.5), fn=zero_fn, pulse='clack', amt=0.06),
     dict(a=ZT, b=281.1, im=bridge, z=(1.12, 1.22), c=(0.3, 0.45), fn=zero_fn, pulse='kick', amt=0.16)]
dB, nB = render(B, 258.2, 281.0, 'zero', extra=led)
print(nA, nB)
