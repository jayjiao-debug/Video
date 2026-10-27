"""Motion test, standing kitten only: bounce + steps + arm and tail sway, head spring bob, jiggly ears on springs.
100 BPM, 4 bars, TR-707 beat."""
import math, os, sys, numpy as np, soundfile as sf
from PIL import Image, ImageDraw
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rigrender import Rig
W, H, FPS, BPM = 1920, 1080, 30, 100; B = 60 / BPM; T0 = .5; BEATS = 24; DUR = T0 + BEATS * B + 1.4; K = .95
RIG = Rig(os.path.dirname(os.path.abspath(__file__)), 'stand', K)
def on(t): return T0 < t < T0 + BEATS * B
def env(t):                                    # ease the dance in and out so it starts and stops softly
    if not on(t): return 0.
    u = min((t - T0) / B, (T0 + BEATS * B - t) / B); return min(1., max(0., u))
def headbob(t):
    if not on(t): return 0
    u = ((t - T0 - .07) / B) % 1
    return 10 * math.exp(-u * 6) * math.cos(u * 9)
def pose(t):
    if not on(t): return {}
    e = env(t); beat = (t - T0) / B
    bounce = abs(math.sin(math.pi * beat)) * e                 # up between beats, down on the beat
    step = max(0, math.sin(math.pi * beat)) * 16 * e
    sw = math.sin(math.pi * beat / 2) * e
    return {'armL': (max(0, 24 * sw) + 4 * e,), 'armR': (min(0, 24 * sw) - 4 * e,),
            'tail': (12 * math.sin(math.pi * beat / 2 + 1) * e,),
            'legL': (step if int(beat) % 2 == 0 else 0,), 'legR': (step if int(beat) % 2 == 1 else 0,),
            'head': (4 * sw, 0, headbob(t) * e), 'body': (-16 * bounce, .03 * (1 - bounce) * e)}
class Spring:
    """damped spring, integrated at 480 Hz: the ear tip lags the head and wobbles back"""
    def __init__(s, freq, damp): s.w = 2 * math.pi * freq; s.z = damp; s.x = 0.; s.v = 0.
    def step(s, target, dt):
        for _ in range(16):
            h = dt / 16; a = -s.w * s.w * (s.x - target) - 2 * s.z * s.w * s.v; s.v += a * h; s.x += s.v * h
        return s.x
def stage():
    bg = Image.new('RGB', (W, H), (243, 233, 216)); d = ImageDraw.Draw(bg)
    d.rectangle([0, 900, W, H], fill=(228, 211, 186)); d.line([0, 900, W, 900], fill=(205, 186, 160), width=4)
    d.ellipse([960 - 300, 960 - 34, 960 + 300, 960 + 34], fill=(220, 200, 172))
    return bg
def render(a):
    i, P = a; c = stage(); im = RIG.compose(P); c.paste(im, (int(960 - 512 * K), int(960 - 965 * K)), im)
    c.save(f'frames_stand/f{i:04d}.jpg', quality=92)
if __name__ == '__main__':
    BG = stage(); os.makedirs('frames_stand', exist_ok=True)
    eL, eR = Spring(3.0, .28), Spring(3.4, .28)     # ~3 Hz, soft: a jiggle, not a flutter
    prev = None; dt = 1 / FPS; PS = []; drive = 0.
    for i in range(int(DUR * FPS)):
        t = i / FPS; P = pose(t)
        hd = P.get('head', (0, 0, 0)); by = P.get('body', (0, 0))[0]
        head_y = hd[2] + by; head_a = hd[0]
        if prev is None: prev = (head_y, head_a)
        vy = (head_y - prev[0]) / dt; va = (head_a - prev[1]) / dt; prev = (head_y, head_a)
        # a drop of the head flicks both ears outward; a tilt drags them the other way; springs make them wobble
        drive += (.08 * vy - drive) * (1 - math.exp(-dt / .07))   # low-passed head velocity, so the ears never snap
        kick = drive
        for tw, sp, imp in ((.25, eR, -260), (T0 + BEATS * B + .7, eL, 260)):   # idle ear flicks before and after the dance
            if 0 <= i - round(tw * FPS) < 3: sp.v += imp / 3     # spread over 3 frames so the flick doesn't pop
        aL = eL.step(-kick - .5 * va * .05, dt); aR = eR.step(kick - .5 * va * .05, dt)
        P['earL'] = (max(-14, min(14, aL)),); P['earR'] = (max(-14, min(14, aR)),)
        PS.append(P)
    from multiprocessing import Pool
    with Pool(int(os.environ.get('NP', '2'))) as pool: pool.map(render, list(enumerate(PS)), chunksize=4)
    D = '/tmp/claude-0/-home-claude/240969aa-174a-5914-92b5-d529595dbe80/scratchpad/m707/package/TR707WAV/'
    ld = lambda f: (lambda x: x.mean(1) if x.ndim > 1 else x)(sf.read(D + f, dtype='float32')[0])
    SR = 44100; out = np.zeros(int(DUR * SR) + SR, np.float32)
    def put(x, t, g): a = int(t * SR); out[a:a + len(x)] += x[:len(out) - a] * g
    for b in range(BEATS):
        t = T0 + b * B; put(ld('BassDrum1.wav' if b % 2 == 0 else 'Snare1.wav'), t, .8)
        put(ld('HhC.wav'), t, .3); put(ld('HhC.wav'), t + B / 2, .2)
    put(ld('Crash.wav'), T0 + BEATS * B, .5); put(ld('BassDrum1.wav'), T0 + BEATS * B, .8)
    out *= .9 / np.abs(out).max(); sf.write('motion_stand.wav', np.stack([out, out], 1), SR)
    print('frames', int(DUR * FPS))
