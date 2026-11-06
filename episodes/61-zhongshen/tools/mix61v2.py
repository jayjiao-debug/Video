#!/usr/bin/env python3
"""ep61 v2 mix: score61 (one continuous piece) + the ep60 SFX library re-synced to the v2 picture (EP61V2.tsx, story61v2.ts).
Sound engineering: music bus high-passed at 60 Hz with a -3.5 dB low shelf under 160 Hz (no rumble, the owner's "deep humming"),
a slow loudness ride (3 s short-term, held within -20 ± 3 LU, intended dips untouched), SFX levelled against the local music
(clamped to the music average -6/+3 dB; takes with the music out against the average), dips under Tefnut's roar, the music OUT
158.0-160.0 for Sekhmet's full roar, master -14 LUFS, true peak <= -1.5 dBTP, a 0.9 s fade with the picture.

    python3 mix61v2.py SCORE.wav SFX_DIR SFX_OLD_DIR OUT.wav   -> OUT.wav (48 kHz 24-bit), OUT.json
"""
import os, sys, json, numpy as np, soundfile as sf
from scipy import signal
T60 = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '60-xinzang', 'tools'); sys.path.insert(0, T60)
import egypt_cues as E, lib60
SR = 48000; FILM = 191.83
from mix61 import falcon, onset, st_lufs, sm_inv   # shared helpers (synth falcon cry, onset finder, short-term loudness)

EV = []
def ev(t, name, off, **o): EV.append((round(t, 3), name, off, o))
# S1 0.0: the gods light up row by row; the empty tree (the title rides the music's gong at 6.0)
ev(0.12, 'glyph_light', -7)
for k in range(5): ev(0.3 + k * 0.3, 'chime_glint', -11 - k)
ev(2.4, 'swell_rise', -9, dur=1.6)
# S2 7.30: black water; the mound and Atum rise
ev(7.4, 'old:S09_sand_wind_loop', -16, dur=3.2, fin=1.0, fout=1.2)
ev(10.4, 'swell_rise', -7, dur=1.8); ev(10.8, 'door_boom', -10); ev(12.0, 'magic_shimmer', -7)
# S3 14.58: the disc rises, Ra appears, "=", the breath
ev(14.6, 'swell_rise', -9, dur=1.8); ev(15.48, 'chime_glint', -6); ev(15.98, 'chime_ding', -8); ev(18.49, 'whoosh_long', -9); ev(18.7, 'magic_shimmer', -9)
# S4 22.11: Shu's wind; Tefnut's short low roar
ev(22.2, 'whoosh_long', -8); ev(24.9, 'ammit_roar_1', 3.0, onset=True, abs=True, dur=1.5)
# N1 27.97: the two lights; Geb (earth) sprouts; Nut's stars; she grows into the sky; the couple; pressed + the bud; Shu forms; the push; air
ev(28.3, 'magic_shimmer', -9); ev(29.2, 'chime_glint', -10)
ev(31.3, 'glyph_light', -10); ev(33.1, 'swell_rise', -11, dur=1.4); ev(33.8, 'chime_glint', -9)
ev(35.3, 'swell_rise', -7, dur=3.0); ev(36.6, 'magic_shimmer', -9)
ev(39.6, 'chime_ding', -10)
ev(42.6, 'whoosh_reverse', -10); ev(44.45, 'old:X22_comic_plop', -7); ev(44.84, 'thup', -7)
ev(46.1, 'whoosh_long', -7); ev(46.2, 'old:S09_sand_wind_loop', -15, dur=2.5, fin=0.4, fout=0.8); ev(47.0, 'magic_shimmer', -8)
ev(50.38, 'door_boom', -5); ev(50.4, 'flare_hit', -7); ev(50.42, 'whoosh_long', -8)
ev(52.8, 'chime_glint', -9); ev(53.0, 'glyph_light', -11); ev(52.7, 'old:S09_sand_wind_loop', -19, dur=3.4, fin=0.6, fout=1.0)
# S7 56.16: Ra's flare; the calendar fills; the cross
ev(56.51, 'flare_hit', -2); ev(56.55, 'stinger_doom', -9, dur=2.4)
for k in range(1, 13): ev(60.02 + 3.3 * sm_inv(k / 12), 'tick_metal', -12)
ev(63.42, 'stinger_hit', -4, dur=0.5)
# S8 64.39: the piece; the moon frowns; her light drops
ev(65.54, 'tick_wood', -3); ev(69.15, 'stinger_comic', -4); ev(69.65, 'chime_glint', -4); ev(69.8, 'glyph_light', -8)
# S9 72.15: the light falls in; 5 gold days; 360 -> 365
ev(73.0, 'glyph_light', -7); ev(73.05, 'chime_ding', -4)
for k, nm in enumerate(('D6', 'Eb6', 'Fs6', 'G6', 'A6')): ev(76.26 + 1.2 * sm_inv((k + 0.5) / 5), f'chime_{nm}', -5)
ev(77.46, 'chime_ding', -4)
# S9b 79.46: the curse flies in and shatters on the five days
ev(79.5, 'whoosh_long', -9); ev(80.48, 'metal_clang', -5); ev(80.5, 'magic_shimmer', -6); ev(80.6, 'glyph_light', -8)
# S10 84.18: the niches light; Osiris appears
for k, nm in enumerate(('D6', 'Eb6', 'Fs6', 'G6', 'A6')): ev(84.58 + k * 0.4, f'chime_{nm}', -10)
ev(88.56, 'magic_shimmer', -6); ev(88.9, 'gong_warm', -8)
# S11 92.90: Isis' wings; Set's storm
for k in range(4): ev(93.05 + k * 0.28, 'wing_flap', -8)
ev(93.25, 'magic_shimmer', -6); ev(96.4, 'old:S09_sand_wind_loop', -7, dur=2.6, fin=0.4, fout=0.8); ev(96.58, 'hiss', -7)
# S12 99.72: Nephthys walks; Osiris & Isis rule
for k in range(4): ev(99.9 + k * 0.4, 'step_stone', -10)
ev(103.78, 'chime_glint', -7)
# S13a 107.71: Set measures him with a knotted cord
ev(108.2, 'papyrus_unroll', -10); ev(109.4, 'hiss', -10)
# S13 112.18: the lid, three nails, the river
ev(112.6, 'creak', -6); ev(113.65, 'thup', -3); ev(113.67, 'door_boom', -10)
for d in (0.25, 0.7, 1.15): ev(116.18 + d, 'metal_clang', -7)
ev(117.88, 'old:X22_comic_plop', -6); ev(118.0, 'old:X14_reeds_birds_water_loop', -13, seek=0.5, dur=1.8, fin=0.3, fout=0.9)
# S14 120.65: Isis' wings and the gold light; Horus and his cry
ev(120.75, 'magic_shimmer', -3); ev(121.25, 'swell_rise', -7, dur=1.6); ev(124.79, 'chime_glint', -5); ev(125.39, 'synth:falcon', -7)
# S15 128.18: through the gate; the underworld throne; episode 1
for k in range(4): ev(128.3 + k * 0.45, 'step_stone', -10)
ev(128.4, 'magic_shimmer', -9); ev(130.0, 'flare_hit', -10); ev(132.21, 'papyrus_flick', -4); ev(132.4, 'chime_glint', -6)
# S16 136.90: 0 -> 80 years
for k in range(1, 11): ev(141.52 + 1.9 * sm_inv(k / 10), 'tick_metal', -11 + 0.3 * k)
ev(143.47, 'gong_verdict', -10, dur=3.0)
# S17 145.62: Anubis appears; the ear twitches
ev(145.87, 'magic_shimmer', -8); ev(150.35, 'papyrus_flick', -8); ev(150.9, 'papyrus_flick', -9)
# S18 154.09: Ra's node lights
ev(154.4, 'glyph_light', -4)
# S19 158.32: Sekhmet roars ALONE (no music 158.0-160.0); the people flee
ev(158.65, 'ammit_roar_1', 4.0, onset=True, abs=True); ev(159.5, 'skitter', -12, abs=True); ev(160.3, 'old:S09_sand_wind_loop', -10, dur=3.0, fin=0.6, fout=1.0)
# S20 165.13: the sistrum; the feather lands
ev(165.3, 'old:S06_sistrum', -6); ev(166.9, 'old:S06_sistrum', -8); ev(169.5, 'whoosh_long', -14); ev(171.38, 'old:X11_feather_land', 6); ev(171.45, 'old:X12b_scale_ding_settle', -3)
# S21 173.13: Thoth writes; the tree lights
ev(173.3, 'pen_scratch', -5); ev(173.5, 'glyph_light', -6); ev(176.0, 'chime_ding', -6)
# S22 177.60 + end card 185.83
ev(177.8, 'magic_shimmer', -8); ev(186.18, 'thup', -5); ev(186.6, 'chime_ding', -7)
MENV = [(24.75, 26.6, -9.0)]

def load_sfx(name, sfxd, oldd):
    if name == 'synth:falcon': return falcon()
    p = f'{oldd}/{name[4:]}.wav' if name.startswith('old:') else f'{sfxd}/{name}.wav'
    x = sf.read(p, always_2d=True)[0]; return np.repeat(x, 2, 1) if x.shape[1] == 1 else x

def mix(score, sfxd, oldd, out):
    music = sf.read(score, always_2d=True)[0][:int(FILM * SR)]; n = len(music)
    music = signal.sosfiltfilt(signal.butter(4, 60, 'high', fs=SR, output='sos'), music, axis=0)
    music = E.peak_eq(music, 110, -3.5, 0.7)
    # slow loudness ride: 3 s short-term loudness every 0.5 s -> gain toward -20 within ±3 LU (smooth), skip near-silence
    hop = int(0.5 * SR); gs = []
    for i in range(0, n, hop):
        a, b = max(0, i - int(1.5 * SR)), min(n, i + int(1.5 * SR)); L = E.lufs(music[a:b]) if b - a > SR else -20
        gs.append(0.0 if not np.isfinite(L) or L < -40 else float(np.clip(-20 - L, -4, 4)) * 0.75)
    g = np.interp(np.arange(n), np.arange(len(gs)) * hop, signal.savgol_filter(np.array(gs), 9, 2))
    music *= (10 ** (g / 20))[:, None]
    Mavg = E.lufs(music); fx = np.zeros((n, 2)); rep = []
    for t, name, off, o in EV:
        x = load_sfx(name, sfxd, oldd)
        if o.get('seek'): x = x[int(o['seek'] * SR):]
        if o.get('dur') and len(x) > o['dur'] * SR: x = x[:int(o['dur'] * SR)].copy(); f = int(min(0.25, o['dur'] / 3) * SR); x[-f:] *= np.linspace(1, 0, f)[:, None] ** 2
        if o.get('fin'): f = int(o['fin'] * SR); x = x.copy(); x[:f] *= np.linspace(0, 1, f)[:, None] ** 2
        if o.get('fout'): f = int(o['fout'] * SR); x = x.copy(); x[-f:] *= np.linspace(1, 0, f)[:, None] ** 2
        t0 = t - (onset(x) / SR if o.get('onset') else 0.0)
        Lx = E.lufs(np.concatenate([x, np.zeros((max(0, int(0.5 * SR) - len(x)), 2))]))
        Lm = st_lufs(music, t - 0.4, t + 0.8); ref = Mavg if o.get('abs') else float(np.clip(Lm, Mavg - 6, Mavg + 3))
        gg = 10 ** ((ref + off - Lx) / 20); i = int(round(t0 * SR)); j = min(n, i + len(x)); fx[i:j] += x[:j - i] * gg
        rep.append(dict(t=t, sfx=name, target=round(ref + off, 1)))
    music *= 10 ** (-3 / 20)
    tt = np.arange(n) / SR
    for a, b, gdb in MENV:
        r = np.clip(np.minimum((tt - a) / 0.15, (b - tt) / 0.15), 0, 1); music *= (10 ** (gdb * r / 20))[:, None]
    y = music + fx; k = int(0.9 * SR); y[-k:] *= np.linspace(1, 0, k)[:, None] ** 2
    y = signal.sosfiltfilt(signal.butter(8, 16500, 'low', fs=SR, output='sos'), y, axis=0)
    y = lib60.master(y, target=-14.0, ceil=-2.0)
    sf.write(out, y.astype(np.float32), SR, subtype='PCM_24')
    meta = dict(seconds=round(len(y) / SR, 2), lufs=round(E.lufs(y), 2), tp=round(E.true_peak(y), 2), music_avg=round(Mavg, 1), events=rep)
    json.dump(meta, open(out[:-4] + '.json', 'w'), indent=1, ensure_ascii=False); print(f"mix {out}: {meta['seconds']} s, {meta['lufs']} LUFS, {meta['tp']} dBTP, {len(rep)} SFX")

if __name__ == '__main__':
    mix(*sys.argv[1:5])
