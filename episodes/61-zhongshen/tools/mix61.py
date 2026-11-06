#!/usr/bin/env python3
"""ep61 《古埃及众神，其实是一家人》 first-cut mix (film 148.72 s, story61.ts timeline): the ep60-approved v4 music library
(intro_hook / mystic / paradise / playful / groove / tension, D Hijaz, one ensemble) re-laid on the 22 shots, plus the ep60 SFX library
synced to the picture's animation beats (shots61.tsx, film61ctx: up/env times are seconds into each shot).

    python3 mix61.py LIB_DIR SFX_DIR SFX_OLD_DIR OUT.wav     -> OUT.wav (48 kHz 24-bit), OUT.json (events, levels)

Deliberate moments: the title gong (3.0); Tefnut's short low roar (ep60 lioness take ammit_roar_1, cut to 1.5 s, the music dips -9 dB);
the box: lid thud + three nails; Sekhmet's FULL roar alone (the music cuts at the shot change 115.49 and comes back swelling at 117.6);
the feather lands on the pan; the end card rides the paradise ending to the fade.
Levels: as ep60 v7 (each SFX against the local music, clamped to the music average -6/+3 dB; takes with the music out against the
music average), music bus -3 dB, master -14 LUFS, <= -2.6 dBTP.
"""
import os, sys, json, numpy as np, soundfile as sf
T60 = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '60-xinzang', 'tools'); sys.path.insert(0, T60)
import egypt_cues as E, lib60
SR = 48000; FILM = 148.72; lib60.FILM = FILM

def sm_inv(u):
    """t in [0,1] with smoothstep(t) = u"""
    lo, hi = 0.0, 1.0
    for _ in range(40):
        m = (lo + hi) / 2
        if m * m * (3 - 2 * m) < u: lo = m
        else: hi = m
    return (lo + hi) / 2

MUSIC = [
 (0.0, 5.86, 'intro_hook', dict(inn='hard', out='x')),                    # 1: the 1500 gods, the title (gong SFX on 3.0)
 (5.86, 29.89, 'mystic_16bar', dict(inn='x', out='x')),                   # 2-5: black water, Atum = Ra, Shu and Tefnut, Geb and Nut
 (29.89, 35.99, 'paradise_16bar', dict(inn='x', out='x')),                # 6: Shu lifts the sky: the music opens
 (35.99, 43.04, 'tension_8bar', dict(inn='x', out='x')),                  # 7: Ra's curse
 (43.04, 55.83, 'playful_24bar', dict(inn='x', out='x')),                 # 8-9: Thoth plays the moon at senet, 365 days
 (55.83, 75.67, 'groove_24bar', dict(inn='x', out='x')),                  # 10-12: the five children (stately)
 (75.67, 82.95, 'tension_8bar', dict(inn='x', out='x', off_s=7.0)),       # 13: the box
 (82.95, 89.52, 'paradise_16bar', dict(inn='x', out='x', off_s=6.1)),     # 14: Isis brings him back, Horus
 (89.52, 97.16, 'mystic_16bar', dict(inn='x', out='x', off_s=24.0, lp=1400, db=-1)),   # 15: king of the underworld (darker)
 (97.16, 104.21, 'tension_8bar', dict(inn='x', out='x', off_s=12.3)),     # 16: 80 years in court
 (104.21, 111.73, 'mystic_16bar', dict(inn='x', out='x', off_s=31.6)),    # 17: Anubis
 (111.73, 115.49, 'groove_24bar', dict(inn='x', out='cut', off_s=19.8)),  # 18: Ra's daughters; cut on the shot change
 (117.6, 121.35, 'tension_8bar', dict(inn='swell', out='x', off_s=14.0, db=-1)),   # 19: back after the roar: the rampage
 (121.35, 128.39, 'playful_24bar', dict(inn='x', out='x', off_s=12.8)),   # 20: Bastet, Ma'at
 (128.39, 142.2, 'paradise_16bar', dict(inn='x', out='x', off_s=12.7)),   # 21-22: Thoth writes the tree, the mural
 (142.2, FILM, 'paradise_end', dict(inn='x')),                            # the paradise ending rings through the end card
]
MENV = [(20.0, 21.95, -9.0)]   # Tefnut's short roar: the music dips (0.15 s ramps)

EV = []
def ev(t, name, off, **o): EV.append((round(t, 3), name, off, o))
# 1  the 1500 gods light up row by row, the counter, the empty tree, the title
ev(0.12, 'glyph_light', -6)
for k in range(5): ev(0.15 + k * 0.3 + 0.15, 'chime_glint', -10 - k)
ev(2.40, 'swell_rise', -8, dur=1.6); ev(2.95, 'gong_title', -3)
# 2  black water; the mound and Atum rise (8.65-10.15)
ev(5.95, 'old:S09_sand_wind_loop', -14, dur=3.0, fin=1.0, fout=1.2)
ev(8.50, 'swell_rise', -6, dur=1.8); ev(8.80, 'door_boom', -9); ev(9.95, 'magic_shimmer', -6)
# 3  the sun disc rises, Ra appears, "=", Atum breathes out the twins
ev(12.25, 'swell_rise', -8, dur=1.8); ev(13.15, 'chime_glint', -5); ev(13.65, 'chime_ding', -7); ev(14.93, 'whoosh_long', -8); ev(15.10, 'magic_shimmer', -8)
# 4  Shu's wind; Tefnut's short low roar (ep60 lioness take, onset on the roar's rise 20.25)
ev(17.95, 'whoosh_long', -7)
ev(20.25, 'ammit_roar_1', 3.0, onset=True, abs=True, dur=1.5)
# 5  Nut sinks onto Geb, the world goes dark
ev(23.30, 'chime_glint', -9); ev(26.30, 'whoosh_reverse', -7); ev(27.70, 'gong_warm', -9)
# 6  Shu grows and pushes the sky up (30.19-32.59), the stars come out, the grass grows
ev(30.05, 'swell_rise', -5, dur=2.6); ev(30.50, 'creak', -11); ev(32.95, 'glyph_light', -5); ev(33.55, 'magic_shimmer', -10)
# 7  Ra's curse: the flare; the calendar fills day by day; the cross
ev(36.30, 'flare_hit', -1); ev(36.34, 'stinger_doom', -8, dur=2.4)
a7 = 39.04 + 0.1
for k in range(1, 13): ev(a7 + 3.3 * sm_inv(k / 12), 'tick_metal', -11)
ev(42.54, 'stinger_hit', -3, dur=0.5)
# 8  Thoth reaches and moves the piece; the moon frowns; her light drops
ev(44.19, 'tick_wood', -3); ev(47.33, 'stinger_comic', -4); ev(47.90, 'chime_glint', -4); ev(48.05, 'glyph_light', -8)
# 9  the light drops into the wheel, five gold days, 360 -> 365
ev(50.70, 'chime_ding', -4); ev(50.75, 'glyph_light', -7)
for k, nm in enumerate(('D6', 'Eb6', 'Fs6', 'G6', 'A6')): ev(52.78 + 0.1 + 1.2 * sm_inv((k + 0.5) / 5), f'chime_{nm}', -5)
ev(54.15, 'chime_ding', -4)
# 10 the five niches light, Osiris appears on the throne
for k, nm in enumerate(('D6', 'Eb6', 'Fs6', 'G6', 'A6')): ev(55.83 + 0.25 + k * 0.4 + 0.15, f'chime_{nm}', -7)
ev(58.89, 'magic_shimmer', -6); ev(59.20, 'gong_warm', -7)
# 11 Isis opens her wings; Set sneers in his sand storm
for k in range(4): ev(62.95 + k * 0.28, 'wing_flap', -8)
ev(63.15, 'magic_shimmer', -6); ev(65.75, 'old:S09_sand_wind_loop', -6, dur=2.6, fin=0.4, fout=0.8); ev(65.96, 'hiss', -7)
# 12 Nephthys walks to Set; Osiris and Isis rule
for k in range(4): ev(68.90 + k * 0.4, 'step_stone', -10)
ev(72.20, 'chime_glint', -6)
# 13 the box: the lid closes (thud), three nails, the river takes it
ev(76.10, 'creak', -4); ev(77.10, 'thup', -1); ev(77.12, 'door_boom', -8)
for d in (0.25, 0.7, 1.15): ev(79.19 + d, 'metal_clang', -3)
ev(80.95, 'old:X22_comic_plop', -6); ev(81.10, 'old:X14_reeds_birds_water_loop', -12, seek=0.5, dur=1.8, fin=0.3, fout=0.9)
# 14 Isis' wings and the gold light round Osiris; Horus appears and cries (synth falcon cry)
ev(83.05, 'magic_shimmer', -3); ev(83.40, 'swell_rise', -7, dur=1.6); ev(86.61, 'chime_glint', -5); ev(87.21, 'synth:falcon', -7)
# 15 the underworld throne; the picture-in-picture of episode 1's hall
ev(89.60, 'flare_hit', -9); ev(93.32, 'papyrus_flick', -4); ev(93.50, 'chime_glint', -6)
# 16 the empty throne; the years count up to 80
a16 = 100.92 + 0.15
for k in range(1, 11): ev(a16 + 1.9 * sm_inv(k / 10), 'tick_metal', -11 + 0.3 * k)
ev(103.02, 'gong_verdict', -7, dur=3.0)
# 17 Anubis appears; his ears twitch twice
ev(104.46, 'magic_shimmer', -8); ev(108.50, 'papyrus_flick', -8); ev(109.05, 'papyrus_flick', -9)
# 18 Ra's node lights; the daughters' places
ev(112.03, 'glyph_light', -4)
# 19 Sekhmet roars ALONE (the music is out 115.49-117.6); the people flee
ev(115.82, 'ammit_roar_1', 4.0, onset=True, abs=True)
ev(116.60, 'skitter', -12, abs=True); ev(117.40, 'old:S09_sand_wind_loop', -10, dur=3.0, fin=0.6, fout=1.0)
# 20 Bastet's sistrum; Ma'at's feather drifts down and lands on the pan
ev(121.50, 'old:S06_sistrum', -6); ev(123.10, 'old:S06_sistrum', -8)
ev(125.20, 'whoosh_long', -14); ev(127.12, 'old:X11_feather_land', 2); ev(127.20, 'old:X12b_scale_ding_settle', -6)
# 21 Thoth writes; the family tree lights up
ev(128.55, 'pen_scratch', -5); ev(128.75, 'glyph_light', -6); ev(131.50, 'chime_ding', -5)
# 22 the mural; the end card (J seal, title)
ev(135.30, 'magic_shimmer', -8)

def falcon():
    """a short raptor 'kee-eer': a falling whistle with fast vibrato + a breathy edge, a small room"""
    d = 0.62; t = np.arange(int(d * SR)) / SR; u = t / d
    f = 3100 - 900 * u ** 0.7 + 70 * np.sin(2 * np.pi * 27 * t); ph = 2 * np.pi * np.cumsum(f) / SR
    env = np.minimum(t / 0.03, 1) * (1 - u) ** 1.4
    x = (np.sin(ph) + 0.28 * np.sin(2 * ph) + 0.08 * np.sin(3 * ph)) * env
    rng = np.random.default_rng(3); n = rng.standard_normal(len(t)); n = np.convolve(n, np.ones(6) / 6, 'same') * 0.06 * env
    y = np.repeat((x + n)[:, None], 2, 1) * 0.5
    return lib60.ring(y, rt=0.9, wet=0.3)

def onset(x):
    e = np.sqrt(np.convolve((x ** 2).sum(1), np.ones(int(0.02 * SR)) / int(0.02 * SR), 'same')); i = np.flatnonzero(e > e.max() * 10 ** (-15 / 20))
    return int(i[0]) if len(i) else 0
def st_lufs(y, a, b):
    a, b = max(0, int(a * SR)), min(len(y), int(b * SR)); seg = y[a:b]
    if b - a < int(0.45 * SR): return -70.0
    L = E.lufs(seg); return L if np.isfinite(L) else -70.0

def load_sfx(name, sfxd, oldd):
    if name == 'synth:falcon': return falcon()
    p = f'{oldd}/{name[4:]}.wav' if name.startswith('old:') else f'{sfxd}/{name}.wav'
    x = sf.read(p, always_2d=True)[0]
    if x.shape[1] == 1: x = np.repeat(x, 2, 1)
    return x

def mix(lib, sfxd, oldd, out):
    music = lib60.render_plan(lib, MUSIC); Mavg = E.lufs(music); n = len(music); fx = np.zeros((n, 2)); rep = []
    for t, name, off, o in EV:
        x = load_sfx(name, sfxd, oldd)
        if o.get('seek'): x = x[int(o['seek'] * SR):]
        if o.get('dur') and len(x) > o['dur'] * SR: x = x[:int(o['dur'] * SR)].copy(); f = int(min(0.25, o['dur'] / 3) * SR); x[-f:] *= np.linspace(1, 0, f)[:, None] ** 2
        if o.get('fin'): f = int(o['fin'] * SR); x = x.copy(); x[:f] *= np.linspace(0, 1, f)[:, None] ** 2
        if o.get('fout'): f = int(o['fout'] * SR); x = x.copy(); x[-f:] *= np.linspace(1, 0, f)[:, None] ** 2
        t0 = t - (onset(x) / SR if o.get('onset') else 0.0)
        Lx = E.lufs(np.concatenate([x, np.zeros((max(0, int(0.5 * SR) - len(x)), 2))]))
        Lm = st_lufs(music, t - 0.4, t + 0.8); ref = Mavg if o.get('abs') else float(np.clip(Lm, Mavg - 6, Mavg + 3))
        g = 10 ** ((ref + off - Lx) / 20); i = int(round(t0 * SR)); j = min(n, i + len(x)); fx[i:j] += x[:j - i] * g
        rep.append(dict(t=t, sfx=name, music_local=round(Lm, 1), target=round(ref + off, 1)))
    music *= 10 ** (-3 / 20)
    tt = np.arange(n) / SR
    for a, b, gdb in MENV:
        r = np.clip(np.minimum((tt - a) / 0.15, (b - tt) / 0.15), 0, 1); music *= (10 ** (gdb * r / 20))[:, None]
    y = music + fx; k = int(0.9 * SR); y[-k:] *= np.linspace(1, 0, k)[:, None] ** 2   # the picture fades to black over its last 0.9 s
    from scipy import signal as _sg; y = _sg.sosfiltfilt(_sg.butter(8, 16500, 'low', fs=SR, output='sos'), y, axis=0)
    y = lib60.master(y, target=-14.0, ceil=-2.6)
    sf.write(out, y.astype(np.float32), SR, subtype='PCM_24')
    meta = dict(seconds=round(len(y) / SR, 2), lufs=round(E.lufs(y), 2), tp=round(E.true_peak(y), 2), music_avg_lufs_premaster=round(Mavg, 1),
                events=rep, music_plan=[(a, round(b, 2), c) for a, b, c, _ in MUSIC])
    json.dump(meta, open(out[:-4] + '.json', 'w'), indent=1, ensure_ascii=False)
    print(f"mix {out}: {meta['seconds']} s, {meta['lufs']} LUFS, {meta['tp']} dBTP; {len(rep)} SFX events")

if __name__ == '__main__':
    mix(*sys.argv[1:5])
