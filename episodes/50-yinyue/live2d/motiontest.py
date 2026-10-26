"""4-bar motion test of the layered kittens: sitting cat taps with both arms, standing cat bounces and steps. 100 BPM."""
import json, math, os, numpy as np, soundfile as sf
from PIL import Image, ImageDraw
W, H, FPS, BPM = 1920, 1080, 30, 100; B = 60 / BPM; T0 = .4; DUR = T0 + 16 * B + 1.2
K = .78   # layer scale
def load(pose):
    info = json.load(open(f'{pose}.json')); L = {}
    for k, (x0, y0, x1, y1) in info['boxes'].items():
        im = Image.open(f'{pose}_{k}.png'); L[k] = (im.resize((max(1, round(im.size[0] * K)), max(1, round(im.size[1] * K))), Image.LANCZOS), x0 * K, y0 * K)
    return info, L
S = {p: load(p) for p in ('sit', 'stand')}
def ease(x): return x * x * (3 - 2 * x)
def hitenv(t, period, phase=0):
    """0..1 stroke curve: wind up then strike on the beat, quick rebound"""
    u = ((t - T0 - phase) / period) % 1
    return math.exp(-u * 9) if u < .5 else ease((u - .5) / .5) * .35
def headbob(t, amp, lag=.05):
    """the head lags the body: dips just after each beat, springs back up"""
    if t < T0 or t > T0 + 16 * B: return 0
    u = ((t - T0 - lag) / B) % 1
    return amp * math.exp(-u * 6) * math.cos(u * 9)
def put(canvas, layer, ox, oy, ang=0, piv=None, dx=0, dy=0, sy=1.0, base_y=None):
    im, x0, y0 = layer
    if ang:
        px, py = piv[0] * K - x0, piv[1] * K - y0
        pad = max(im.size) ; big = Image.new('RGBA', (im.size[0] + 2 * pad, im.size[1] + 2 * pad)); big.paste(im, (pad, pad))
        big = big.rotate(ang, resample=Image.BICUBIC, center=(px + pad, py + pad)); im = big; x0 -= pad; y0 -= pad
    canvas.alpha_composite(im, (int(round(ox + x0 + dx)), int(round(oy + y0 + dy))))
def cat(canvas, pose, ox, oy, t):
    info, L = S[pose]; P = info['pivots']; nk = info['head']['neckY']
    beat = (t - T0) / B; on = t > T0 and t < T0 + 16 * B
    if pose == 'sit':
        bob = (1 - math.cos(2 * math.pi * beat)) * 2.5 if on else 0
        aL = hitenv(t, B, 0) if on else 0; aR = hitenv(t, B, B / 2) if on else 0
        put(canvas, L['tail'], ox, oy, ang=6 * math.sin(2 * math.pi * t / (2 * B)), piv=P['tail'])
        put(canvas, L['body'], ox, oy, dy=bob * .4)
        put(canvas, L['armL'], ox, oy, ang=-38 * aL + 8, piv=P['armL'], dy=bob * .4)
        put(canvas, L['armR'], ox, oy, ang=38 * aR - 8, piv=P['armR'], dy=bob * .4)
        hb_ = headbob(t, 7)
        put(canvas, L['head'], ox, oy, ang=3 * math.sin(math.pi * beat) if on else 0, piv=(512, nk), dy=bob + hb_)
    else:
        ph = 2 * math.pi * beat
        bounce = abs(math.sin(math.pi * beat)) * 14 if on else 0          # up on the off-beat, down on the beat
        stepL = max(0, math.sin(math.pi * beat)) * 16 if on and int(beat) % 2 == 0 else 0
        stepR = max(0, math.sin(math.pi * beat)) * 16 if on and int(beat) % 2 == 1 else 0
        sway = 4 * math.sin(ph / 2) if on else 0
        put(canvas, L['tail'], ox, oy, ang=10 * math.sin(ph / 2 + 1), piv=P['tail'], dy=-bounce)
        put(canvas, L['legL'], ox, oy, dy=-stepL * .6 - bounce * .15)
        put(canvas, L['legR'], ox, oy, dy=-stepR * .6 - bounce * .15)
        put(canvas, L['body'], ox, oy, dy=-bounce)
        put(canvas, L['armL'], ox, oy, ang=-20 * math.sin(ph / 2) - 6, piv=P['armL'], dy=-bounce)
        put(canvas, L['armR'], ox, oy, ang=-20 * math.sin(ph / 2) + 6, piv=P['armR'], dy=-bounce)
        put(canvas, L['head'], ox, oy, ang=sway, piv=(512, nk), dy=-bounce + headbob(t, 10, lag=.07))
def stage():
    bg = Image.new('RGBA', (W, H), (243, 233, 216, 255)); d = ImageDraw.Draw(bg)
    d.rectangle([0, 840, W, H], fill=(228, 211, 186, 255)); d.line([0, 840, W, 840], fill=(205, 186, 160, 255), width=4)
    for x, y in ((560, 905), (1360, 905)): d.ellipse([x - 260, y - 32, x + 260, y + 32], fill=(220, 200, 172, 255))
    return bg
BG = stage(); os.makedirs('frames', exist_ok=True)
for i in range(int(DUR * FPS)):
    t = i / FPS; c = BG.copy()
    cat(c, 'sit', 560 - 512 * K, 905 - 950 * K, t)
    cat(c, 'stand', 1360 - 512 * K, 905 - 965 * K, t)
    c.convert('RGB').save(f'frames/f{i:04d}.jpg', quality=92)
# sound: hats on 8ths, kick/snare, so the motion can be judged against the beat
D = '/tmp/claude-0/-home-claude/240969aa-174a-5914-92b5-d529595dbe80/scratchpad/m707/package/TR707WAV/'
ld = lambda f: (lambda x: x.mean(1) if x.ndim > 1 else x)(sf.read(D + f, dtype='float32')[0])
SR = 44100; out = np.zeros(int(DUR * SR) + SR, np.float32)
def put_s(x, t, g): a = int(t * SR); out[a:a + len(x)] += x[:len(out) - a] * g
for b in range(16):
    t = T0 + b * B; put_s(ld('BassDrum1.wav' if b % 2 == 0 else 'Snare1.wav'), t, .8)
    put_s(ld('HhC.wav'), t, .3); put_s(ld('HhC.wav'), t + B / 2, .2)
out *= .9 / np.abs(out).max(); sf.write('motion.wav', np.stack([out, out], 1), SR)
print('frames', int(DUR * FPS))
