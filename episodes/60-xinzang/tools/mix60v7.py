#!/usr/bin/env python3
"""ep60 v6 full mix with the v7 sound (our D Hijaz music library + our SFX library), placed on the v6 sync tables
(sync60_a/b/c.md, film 169.25 s).

    python3 mix60v7.py LIB_DIR SFX_DIR OUT.wav      -> OUT.wav (48 kHz 24-bit), OUT.mp3, OUT.json (levels, audibility, the deliberate moments)

Music: the modules on the film's bar grid (downbeats 0.3 + 2k s), changes on bar lines except where the picture asks for a
deliberate stop (the freeze 73.38, the roar's lead-in 90.30, the pan crash 121.89, the dead stop 130.11, the hiccup 143.57).
SFX: each event is levelled against the music's local loudness (window -0.4/+0.8 s, clamped to the music's average -6/+3 dB) plus a
per-sound offset; the creature takes are aligned by their onset and levelled against the music's average (the BGM is out under them).
Then the music bus -3 dB (owner 19:21 "BGM overpowering the sound effects"), master to -14 LUFS with a soft clip + true-peak limiter
(-2.0 dBTP in the wav, <= -1 dBTP after the mp3 encode).
"""
import os, sys, json, subprocess, numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import egypt_cues as E, lib60
SR = 48000; FILM = 169.25

MUSIC = [
 (0.0, 8.3, 'hook_intro_4bar', dict(inn='hard', out='x')),             # ney solo; D5 + gong on the title 6.30
 (8.3, 26.3, 'calm_8bar', dict(inn='x')),                               # 5-9: you die, the mummy
 (26.3, 42.3, 'calm2_8bar', dict(inn='eg', bar0=1)),                    # 10-14: the Book (same melody, the qanun joins)
 (42.3, 52.3, 'danger_4bar', dict(inn='x')),                            # 15-17: the road (the riff)
 (52.3, 73.38, 'theme_8bar', dict(inn='x', out='cut')),                 # 18-25: the hall, the leitmotif; the freeze 73.38 stops it
 (73.38, 76.3, 'dark_4bar_thin', dict(inn='swell', out='x', db=-1)),   # owner 12:38: a low drone bed under the squeak and the cricket
 (76.3, 90.3, 'tension_8bar', dict(inn='x', out='cut')),                # 27-30: the weighing builds; out at 90.30 for the lead-in + roar
 (91.6, 96.3, 'dark_4bar', dict(inn='swell')),                          # back 0.8 s after the roar: the hush, drone + low gong
 (96.3, 98.3, 'dark_4bar_thin', dict(inn='x', out='cut', db=-3)),       # 33: drone only under the heartbeats; cut on 98.3
 (98.3, 106.3, 'playful_8bar', dict(inn='hard')),                       # 34 「等等——」 crash: the cheat, the theme staccato
 (106.3, 114.3, 'playful_8bar_thin', dict(inn='eg', out='eg', bar0=4)), # 37: drums out under the papyrus line
 (114.3, 121.89, 'playful_8bar', dict(inn='eg', out='cut', bar0=0)),    # 39-40, cut on the pan crash 121.89
 (121.95, 126.82, 'dark_4bar_thin', dict(inn='swell', out='x', db=0)), # a low drone under roar 2 and the bite (no dead silence)
 (126.82, 130.3, 'dark_4bar', dict(inn='x', out='x', db=-2)),          # 43: the doom drone, fading out as
 (130.3, 143.57, 'bright_8bar', dict(inn='x', out='cut')),          # 44-48: the theme an octave up swells in; the hiccup 143.57
 (143.57, 144.3, 'dark_4bar_thin', dict(inn='hard', out='x', db=-1)),  # a drone holds through the hiccup
 (144.3, 156.3, 'bright_8bar', dict(inn='x', out='x', bar0=7)),         # 48-52: picks up on the next downbeat
 (156.3, 169.25, 'resolution_6bar', dict(inn='x')),                     # 53-55: the theme slow, chromatic slide, final D 164.3 through the card
]
# owner 23:55: "another of the film with music similar to v4" -- the v4/v6b egypt_cues score re-laid on the v6 acts, smoother changes
MUSIC_V4 = [
 (0.0, 8.41, 'intro_hook', dict(inn='hard', out='x')),                 # v6b intro: Egyptian from frame 0, gong on the title 6.30
 (8.41, 26.03, 'paradise_16bar', dict(inn='x', db=-2)),                # you die, the mummy: a melodic, calm cue (owner 12:38)
 (26.03, 41.64, 'playful_24bar', dict(inn='x')),                       # the Book (the playful eighths the stall was built on)
 (41.64, 51.73, 'tension_8bar', dict(inn='x')),                        # the road
 (51.73, 73.38, 'groove_24bar', dict(inn='x', out='cut')),             # hall + oath; the freeze 73.38 stops it
 (73.38, 76.3, 'mystic_16bar', dict(inn='swell', out='x', db=-12)),   # a low bed under the squeak and the cricket
 (76.3, 90.3, 'tension_8bar', dict(inn='x', out='cut')),               # the weighing; out for the lead-in + roar
 (91.6, 98.3, 'mystic_16bar', dict(inn='swell', out='cut', db=-8, lp=700)),   # back after the roar: the hush, dark and low
 (98.3, 121.89, 'playful_24bar', dict(inn='hard', out='cut')),         # the cheat; cut on the pan crash
 (121.95, 130.3, 'mystic_16bar', dict(inn='swell', out='x', db=-10, lp=500)),    # runs on under the doom into the pass   # a low dark bed under roar 2 and the bite
 (126.82, 130.3, 'sting_doom', dict(inn='x', out='x', db=-3)),         # the second death, fading as
 (130.3, 143.57, 'paradise_16bar', dict(inn='x', out='cut')),      # pass swells in; the hiccup 143.57
 (143.57, 144.3, 'mystic_16bar', dict(inn='hard', out='x', db=-12)),   # a bed through the hiccup
 (144.3, 156.3, 'playful_24bar', dict(inn='x', out='x')),              # shabtis
 (156.3, 164.3, 'paradise_16bar', dict(inn='x', out='x')),             # close
 (164.3, 169.25, 'paradise_end', dict(inn='x')),                       # the paradise ending rings through the end card
]

# owner 16:09: our own score in the reference's style at 117.5 BPM, cues entering at the scene starts (v8 library)
MUSIC_V8 = [
 (0.0, 8.41, 'hook_intro_4bar', dict(inn='hard', out='x')),            # gong on the title 6.30
 (8.41, 26.03, 'calm_8bar', dict(inn='x')), (26.03, 41.64, 'calm2_8bar', dict(inn='x')),
 (41.64, 51.73, 'danger_4bar', dict(inn='x')),                         # the one driving section
 (51.73, 73.38, 'theme_8bar', dict(inn='x', out='cut')), (73.38, 76.88, 'dark_4bar_thin', dict(inn='swell', out='x', db=-1)),
 (76.88, 90.3, 'tension_8bar', dict(inn='x', out='cut')), (91.1, 96.13, 'dark_4bar', dict(inn='swell')),
 (96.13, 98.33, 'dark_4bar_thin', dict(inn='x', out='cut', db=-3)),
 (98.33, 107.0, 'playful_8bar', dict(inn='hard')), (107.0, 114.05, 'playful_8bar_thin', dict(inn='eg', out='eg', off_s=8.67)),
 (114.05, 121.89, 'playful_8bar', dict(inn='eg', out='cut', off_s=15.72)),
 (121.95, 126.82, 'dark_4bar_thin', dict(inn='swell', out='x', db=0)), (126.82, 130.11, 'dark_4bar', dict(inn='x', out='x', db=-2)),
 (130.11, 143.57, 'bright_8bar', dict(inn='x', out='cut')), (143.57, 144.41, 'dark_4bar_thin', dict(inn='hard', out='x', db=-1)),
 (144.41, 157.15, 'bright_8bar', dict(inn='x', out='x', off_s=14.30)),
 (157.15, 169.25, 'resolution_6bar', dict(inn='x')),                   # final D at 165.32, ring through the card
]

# (time, sfx, offset dB vs local music, options)   options: dur (crop + fade), crop_end (keep the last s), onset (align the take's onset),
# abs (level vs the music's average, not the local music: the music is out)
EV = []
def ev(t, name, off, **o): EV.append((t, name, off, o))
# act A
ev(0.00, 'flare_hit', 0); ev(0.55, 'whoosh_short', -5); ev(1.30, 'thup', -6)
for t in (3.58, 4.35): ev(t, 'heartbeat', -1)
ev(5.31, 'metal_clang', 2); ev(5.31, 'chain_rattle', -4); ev(5.90, 'glyph_light', -4); ev(7.16, 'ammit_growl', -6, onset=True)
ev(10.16, 'tick_wood', -6)
for t in (12.75, 13.32, 13.90, 14.48): ev(t, 'jar_clunk', -3)
ev(15.84, 'whoosh_short', -7); ev(16.56, 'stinger_comic', -3); ev(17.18, 'tick_wood', -7); ev(17.73, 'whoosh_short', -6); ev(18.45, 'thup', -6)
for t in (19.27, 20.27, 21.27, 22.27): ev(t, 'heartbeat', -3)
for t in (19.86, 20.51, 21.15, 21.80): ev(t, 'papyrus_flick', -6)
ev(22.06, 'chime_glint', -5); ev(23.70, 'tick_wood', -5); ev(23.99, 'chime_ding', -2)
ev(26.45, 'thup', -5); ev(26.93, 'string_snap', -3); ev(26.98, 'papyrus_unroll', -3); ev(26.98, 'whoosh_long', -8); ev(29.43, 'chime_glint', -5)
for t in (30.01, 30.27, 30.53, 30.79, 31.05, 31.31, 31.57): ev(t, 'wing_flap', -7)
for t in (32.22, 32.49, 32.76, 33.29, 33.56, 33.83, 34.36): ev(t, 'papyrus_flick', -5)
for t in (33.02, 34.09): ev(t, 'tick_wood', -5)
ev(36.39, 'chime_ding', -2); ev(39.54, 'pen_scratch', -5)
# act B
ev(42.52, 'door_boom', 1)
for t in (45.04, 45.75, 46.45, 47.15): ev(t, 'knife_shing', -1)
ev(48.48, 'hiss', -2); ev(48.64, 'ammit_growl', -4, onset=True); ev(49.38, 'ammit_jaw_slam', -6, onset=True)
ev(49.86, 'glyph_light', -3); ev(50.02, 'magic_shimmer', -3); ev(50.82, 'magic_blast', 1); ev(50.88, 'skitter', -5)
ev(51.91, 'door_boom', 1)
for t in (53.15, 53.71, 54.27): ev(t, 'step_stone', -6)
ev(57.35, 'bone_crack', -1); ev(58.36, 'chomp_small', -1, onset=True); ev(58.41, 'gulp', -5, onset=True); ev(59.46, 'lick_dog', -2, onset=True)
for t in (61.00, 61.60, 62.20, 62.80): ev(t, 'tek_hit', -4)
for t in (64.45, 65.05, 65.65, 68.57, 71.87): ev(t, 'tick_wood', -4)
ev(70.22, 'chime_glint', -4)
ev(73.48, 'stinger_comic', -1); ev(74.28, 'cricket', -4); ev(75.44, 'chime_glint', -5)
for t in (77.33, 77.85): ev(t, 'step_stone', -6)
for t in (78.05, 78.64, 79.17): ev(t, 'tick_metal', -4)
for t in (80.80, 81.40): ev(t, 'tick_metal', -2)
ev(85.14, 'pen_scratch', -6); ev(86.77, 'ammit_growl', 0, onset=True); ev(88.02, 'claw_scrape', -2); ev(89.82, 'ammit_jaw_slam', -7, onset=True)
ev(90.30, 'leadin_roll', 0, abs=True)
ev(90.77, 'ammit_roar_1', 5.0, onset=True, abs=True)          # [deliberate] Ammit roars alone, BGM out (90.30-92.30)
ev(92.07, 'plop', -3, abs=True)
for i, t in enumerate((96.35, 96.83, 97.23, 97.56, 97.82, 98.02, 98.18)): ev(t, 'heartbeat', -6 + 0.5 * i, abs=True, dur=0.45 if i < 2 else 0.22)
ev(97.08, 'creak', -5, abs=True)
# act C
ev(98.33, 'flare_hit', 1); ev(98.38, 'magic_shimmer', -8); ev(99.33, 'chime_glint', -3); ev(101.99, 'tick_wood', -3)
for t, nm in zip((102.09, 102.39, 102.69, 102.99, 103.29, 103.59), ('D6', 'Eb6', 'Fs6', 'G6', 'A6', 'Bb6')): ev(t, f'chime_{nm}', -4)
ev(104.32, 'creak', -3); ev(105.03, 'whoosh_short', -5); ev(105.79, 'tick_wood', -3); ev(105.92, 'chime_glint', -5)
ev(112.42, 'chime_glint', -3); ev(115.55, 'rasp', -4)
for t in (116.65, 117.00, 117.35): ev(t, 'tick_metal', -2)
ev(118.76, 'chime_glint', -5); ev(119.40, 'darbuka_roll', -2)
ev(121.89, 'pan_crash', 3)                                     # [deliberate] the pan crashes, the music cuts
ev(122.02, 'ammit_growl', -2, onset=True, abs=True)
ev(122.69, 'ammit_roar_2', 1.5, onset=True, abs=True)         # roar 2, a touch softer than roar 1 (owner 21:13)
ev(125.15, 'ammit_jaw_slam', 4, onset=True, abs=True); ev(125.15, 'bite_hit', -3, abs=True)   # [deliberate] the bite, then silence
ev(127.28, 'sand_trickle', -1, abs=True, dur=2.4)
ev(130.06, 'sand_reverse', -2, abs=True, crop_end=1.2)        # ends on 131.26
ev(131.31, 'chime_ding', 0); ev(132.41, 'magic_shimmer', -7)
for t, o in ((132.69, -7), (133.44, -7), (134.19, -7), (135.12, -10)): ev(t, 'step_stone', o)
ev(135.90, 'pen_scratch', -5); ev(136.85, 'gong_warm', -2)
ev(145.28, 'creak', -4)
for t in (146.33, 146.63, 146.93): ev(t, 'tick_wood', -5)
ev(149.40, 'squeak_chorus', -1)
for t in (151.59, 152.11, 152.61, 153.13, 153.65, 154.15, 154.67): ev(t, 'hoe_chop', -5)
ev(153.65, 'whip_crack', -1); ev(158.45, 'papyrus_unroll', -4); ev(161.70, 'heartbeat', -2)

DELIBERATE = [
 (0.00, 'start', 'frame 0: torches flare (finger cymbals + dum) as the hook drone begins: Egyptian from the first frame'),
 (6.30, 'loud', 'the title: ney D5 + gong + bendir + zills + oud D on the downbeat (the biggest musical moment of the opening)'),
 (73.38, 'quiet', '「话太多」: the picture freezes and the music stops (short room ring); a low drone bed (-12 dB) holds under the reed squeak and the cricket'),
 (90.30, 'silent', 'the BGM drops for Ammit: a lead-in (darbuka roll + mizmar climb, 0.34 s), a breath, the ROAR alone at 90.77; the drone is back from 91.1 (swell to 91.6)'),
 (96.30, 'quiet', 'the hush: drone only under the speeding heartbeats and the chain creak before 「等等——」'),
 (98.33, 'loud', '「等等——」: finger-cymbal crash + gold flare, the playful theme comes straight in on the downbeat'),
 (121.89, 'loud', 'the pan crashes and the music cuts to a low drone; growl and roar 2 at 122.69 over it'),
 (125.15, 'loud', 'the bite: the deep wet jaw slam on the bite frame, then the low drone alone until 43'),
 (130.30, 'swell', 'the doom fades as the bright theme swells in under the reversed sand and the chime (no dead stop)'),
 (143.57, 'hiccup', 'the music hiccups on the deadpan look (a drone holds 143.57-144.30, the theme is back on the next downbeat)'),
]

def onset(x):
    e = np.sqrt(np.convolve((x ** 2).sum(1), np.ones(int(0.02 * SR)) / int(0.02 * SR), 'same')); i = np.flatnonzero(e > e.max() * 10 ** (-15 / 20))
    return int(i[0]) if len(i) else 0
def st_lufs(y, a, b):
    a, b = max(0, int(a * SR)), min(len(y), int(b * SR)); seg = y[a:b]
    if b - a < int(0.45 * SR): return -70.0
    L = E.lufs(seg); return L if np.isfinite(L) else -70.0

def mix(lib, sfxd, out, plan=None):
    plan = plan or MUSIC; music = lib60.render_plan(lib, plan); Mavg = E.lufs(music); n = len(music); fx = np.zeros((n, 2)); rep = []
    for t, name, off, o in EV:
        x = sf.read(f'{sfxd}/{name}.wav', always_2d=True)[0]
        if o.get('crop_end'): x = x[-int(o['crop_end'] * SR):].copy(); f = int(0.15 * SR); x[:f] *= np.linspace(0, 1, f)[:, None]
        if o.get('dur') and len(x) > o['dur'] * SR: x = x[:int(o['dur'] * SR)].copy(); f = int(min(0.25, o['dur'] / 3) * SR); x[-f:] *= np.linspace(1, 0, f)[:, None] ** 2
        t0 = t - (onset(x) / SR if o.get('onset') else 0.0)
        Lx = E.lufs(np.concatenate([x, np.zeros((max(0, int(0.5 * SR) - len(x)), 2))]))
        Lm = st_lufs(music, t - 0.4, t + 0.8); ref = Mavg if o.get('abs') else float(np.clip(Lm, Mavg - 6, Mavg + 3))
        g = 10 ** ((ref + off - Lx) / 20); i = int(round(t0 * SR)); j = min(n, i + len(x)); fx[i:j] += x[:j - i] * g
        rep.append(dict(t=t, sfx=name, music_local=round(Lm, 1), target=round(ref + off, 1)))
    music *= 10 ** (-3 / 20)   # the music bus -3 dB (owner 19:21)
    y = music + fx; k = int(0.5 * SR); y[-k:] *= np.linspace(1, 0, k)[:, None] ** 2
    y = lib60.master(y, target=-14.0, ceil=-2.6)   # owner 12:38: <= -2 dBTP so the AAC encode doesn't overshoot
    sf.write(out, y.astype(np.float32), SR, subtype='PCM_24')
    ceil = -3.0   # the mp3: re-limit its source until the decoded mp3 is <= -1.1 dBTP (sharp SFX transients overshoot in the encode)
    while True:
        tmp = out[:-4] + '_mp3src.wav'; sf.write(tmp, E.limit(y, ceil).astype(np.float32), SR, subtype='PCM_24')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-c:a', 'libmp3lame', '-b:a', '256k', out[:-4] + '.mp3'], check=True); os.remove(tmp)
        dec = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'quiet', '-i', out[:-4] + '.mp3', '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout, np.float32).reshape(-1, 2).astype(np.float64)
        if E.true_peak(dec) <= -2.6 or ceil < -7: break
        ceil -= 1.0
    # audibility: each event's loudness in the final mix vs the music around it (same gains as the master)
    gm = np.sqrt(np.mean(y ** 2) / max(np.mean((music + fx) ** 2), 1e-20))
    for r in rep: r['sfx_vs_music_db'] = round(r['target'] - (r['music_local'] - 3 if r['music_local'] > -60 else -70), 1)
    meta = dict(seconds=round(len(y) / SR, 2), lufs=round(E.lufs(y), 2), tp=round(E.true_peak(y), 2), mp3_lufs=round(E.lufs(dec), 2), mp3_tp=round(E.true_peak(dec), 2),
                music_avg_lufs_premaster=round(Mavg, 1), events=rep, deliberate=DELIBERATE, music_plan=[(a, b, c) for a, b, c, _ in plan])
    json.dump(meta, open(out[:-4] + '.json', 'w'), indent=1, ensure_ascii=False)
    print(f"mix {out}: {meta['seconds']} s, {meta['lufs']} LUFS, {meta['tp']} dBTP; mp3 {meta['mp3_lufs']} LUFS, {meta['mp3_tp']} dBTP; {len(rep)} SFX events")

if __name__ == '__main__':
    mode = sys.argv[4] if len(sys.argv) > 4 else ''
    if mode == 'v8':
        import hijaz60 as H; lib60.B = int(round(H.BAR * SR))   # the 117.5 BPM bar for bar0
        if len(sys.argv) > 5: lib60.preview(sys.argv[1], sys.argv[5], MUSIC_V8)
    mix(sys.argv[1], sys.argv[2], sys.argv[3], {'v4': MUSIC_V4, 'v8': MUSIC_V8}.get(mode))
