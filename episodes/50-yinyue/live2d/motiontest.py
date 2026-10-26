"""4-bar motion test of the layered kittens through the shared renderer (bend deformers, head spring bob).
Sitting cat taps with both paws; standing cat bounces, steps and swings. 100 BPM, TR-707 beat."""
import math, os, sys, numpy as np, soundfile as sf
from PIL import Image, ImageDraw
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from rigrender import Rig
W, H, FPS, BPM = 1920, 1080, 30, 100; B = 60 / BPM; T0 = .4; DUR = T0 + 16 * B + 1.2; K = .78
RIGS = {p: Rig('..', p, K) for p in ('sit', 'stand')}
def ease(x): return x * x * (3 - 2 * x)
def on(t): return T0 < t < T0 + 16 * B
def stroke(t, phase=0):
    """paw stroke 0..1: quick strike on the beat, slow wind-up before the next"""
    u = ((t - T0 - phase) / B) % 1
    return math.exp(-u * 9) if u < .5 else ease((u - .5) / .5) * .35
def headbob(t, amp, lag=.05):
    """the head lags the body: dips just after each beat and springs back"""
    if not on(t): return 0
    u = ((t - T0 - lag) / B) % 1
    return amp * math.exp(-u * 6) * math.cos(u * 9)
def pose_sit(t):
    beat = (t - T0) / B
    if not on(t): return {}
    aL, aR = stroke(t), stroke(t, B / 2)
    sq = .025 * math.exp(-(((t - T0) / B) % 1) * 7)
    return {'armL': (38 * aL - 6,), 'armR': (-38 * aR + 6,), 'tail': (8 * math.sin(math.pi * beat / 2),),
            'head': (3 * math.sin(math.pi * beat), 0, headbob(t, 7)), 'body': (0, sq)}
def pose_stand(t):
    beat = (t - T0) / B
    if not on(t): return {}
    bounce = abs(math.sin(math.pi * beat))                     # up between beats, down on the beat
    step = max(0, math.sin(math.pi * beat)) * 16
    sw = math.sin(math.pi * beat / 2)
    return {'armL': (20 * sw + 6,), 'armR': (20 * sw - 6,), 'tail': (12 * math.sin(math.pi * beat / 2 + 1),),
            'legL': (step if int(beat) % 2 == 0 else 0,), 'legR': (step if int(beat) % 2 == 1 else 0,),
            'head': (4 * sw, 0, headbob(t, 10, .07)), 'body': (-14 * bounce, .03 * (1 - bounce))}
def stage():
    bg = Image.new('RGB', (W, H), (243, 233, 216)); d = ImageDraw.Draw(bg)
    d.rectangle([0, 840, W, H], fill=(228, 211, 186)); d.line([0, 840, W, 840], fill=(205, 186, 160), width=4)
    for x, y in ((560, 905), (1360, 905)): d.ellipse([x - 260, y - 32, x + 260, y + 32], fill=(220, 200, 172))
    return bg
if __name__ == '__main__':
    BG = stage(); os.makedirs('frames', exist_ok=True)
    for i in range(int(DUR * FPS)):
        t = i / FPS; c = BG.copy()
        for p, fn, (cx, fy, ref) in (('sit', pose_sit, (560, 905, 950)), ('stand', pose_stand, (1360, 905, 965))):
            im = RIGS[p].compose(fn(t)); c.paste(im, (int(cx - 512 * K), int(fy - ref * K)), im)
        c.save(f'frames/f{i:04d}.jpg', quality=92)
    D = '/tmp/claude-0/-home-claude/240969aa-174a-5914-92b5-d529595dbe80/scratchpad/m707/package/TR707WAV/'
    ld = lambda f: (lambda x: x.mean(1) if x.ndim > 1 else x)(sf.read(D + f, dtype='float32')[0])
    SR = 44100; out = np.zeros(int(DUR * SR) + SR, np.float32)
    def put(x, t, g): a = int(t * SR); out[a:a + len(x)] += x[:len(out) - a] * g
    for b in range(16):
        t = T0 + b * B; put(ld('BassDrum1.wav' if b % 2 == 0 else 'Snare1.wav'), t, .8)
        put(ld('HhC.wav'), t, .3); put(ld('HhC.wav'), t + B / 2, .2)
    out *= .9 / np.abs(out).max(); sf.write('motion.wav', np.stack([out, out], 1), SR)
    print('frames', int(DUR * FPS))
