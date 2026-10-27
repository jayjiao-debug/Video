"""Real-instrument music for the 30 s test: the same score.json the picture reads, played by sampled instruments
(FluidSynth + the MuseScore General soundfont) and mixed with Spotify's Pedalboard (EQ, compression, reverb,
kick ducking, limiter). Layers enter one by one, like the lanes: 60 (big drum + 808) → 120 (marimba + bass) → 180 (glock + claps).
python3 music_gm.py <workdir>   (needs <workdir>/score.json from score.py) → <workdir>/stems/*.wav, <workdir>/music_gm.wav
needs: apt fluidsynth musescore-general-soundfont; pip pedalboard mido"""
import json, os, subprocess, sys
import numpy as np, mido
from pedalboard import (Pedalboard, Compressor, Reverb, HighpassFilter, LowpassFilter, LowShelfFilter, HighShelfFilter,
                        PeakFilter, Limiter, Gain, Distortion)
from pedalboard.io import AudioFile

WD = sys.argv[1]; SC = json.load(open(f'{WD}/score.json'))
SF = '/usr/share/sounds/sf3/MuseScore_General.sf3'
SR, DUR = 48000, SC['dur']; N = int(SR * DUR)
ST = f'{WD}/stems'; os.makedirs(ST, exist_ok=True)
lanes = {ln['bpm']: ln for ln in SC['lanes']}
END = SC['end']

# ------------------------------------------------------------------ harmony: C Am F G, one chord per 2 s from 12 s
CH = [[48, 52, 55], [45, 48, 52], [41, 45, 48], [43, 47, 50]]
def chord(t): return CH[int((t - 12) // 2) % 4] if t >= 12 else CH[0]

# ------------------------------------------------------------------ stems as note lists → MIDI → FluidSynth
TPB, TEMPO = 960, 500000                       # 120 BPM: 1 tick = 0.52 ms
def render(name, notes, prog=0, drums=False, gain=0.5):
    """notes: (t, dur, midi, vel). One instrument per stem so each can be mixed on its own."""
    mid = mido.MidiFile(ticks_per_beat=TPB); tr = mido.MidiTrack(); mid.tracks.append(tr)
    ch = 9 if drums else 0
    ev = [(0, mido.MetaMessage('set_tempo', tempo=TEMPO))]
    if not drums: ev.append((0, mido.Message('program_change', program=prog, channel=ch)))
    for t, d, m, v in notes:
        a = round(t * 2 * TPB); b = round((t + d) * 2 * TPB)
        ev.append((a, mido.Message('note_on', note=int(m), velocity=int(max(1, min(127, v))), channel=ch)))
        ev.append((b, mido.Message('note_off', note=int(m), velocity=0, channel=ch)))
    ev.sort(key=lambda e: (e[0], 0 if e[1].type == 'note_off' else 1))
    last = 0
    for tick, msg in ev: msg.time = tick - last; last = tick; tr.append(msg)
    tr.append(mido.MetaMessage('end_of_track', time=round(2 * TPB)))
    mid.save(f'{ST}/{name}.mid')
    subprocess.run(['fluidsynth', '-ni', '-q', '-R', '0', '-C', '0', '-g', str(gain), '-r', str(SR), '-F', f'{ST}/{name}.wav', SF, f'{ST}/{name}.mid'],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    with AudioFile(f'{ST}/{name}.wav') as f: x = f.read(f.frames)
    out = np.zeros((2, N), dtype=np.float32); n = min(N, x.shape[1]); out[:, :n] = x[:, :n]
    return out

# heartbeat: kick + low tom, lub-dub at 72 BPM
heart = []
for h in SC['heart']:
    heart += [(h, 0.3, 36, 112), (h, 0.3, 41, 46), (h + 0.19, 0.3, 36, 72)]
# 60 lane: the tuxedo cat's big drum
h60 = lanes[60]['hits']
drum60 = [(h, 0.6, 35, 127 if abs(h - END) > 1e-3 else 127) for h in h60] + [(h, 0.6, 36, 100) for h in h60]
# 120 lane: marimba arpeggio (accent on the beat that lines up with the 60 lane)
h120 = lanes[120]['hits']
mar = [(h, 0.45, [c[0], c[1], c[2], c[1]][i % 4] + 24, 112 if i % 2 == 0 else 88) for i, h in enumerate(h120) for c in [chord(h)]]
# 180 lane: glockenspiel triplets
h180 = lanes[180]['hits']
glk = [(h, 0.4, [c[2], c[1], c[0]][i % 3] + 24, 100 if i % 3 == 0 else 78) for i, h in enumerate(h180) for c in [chord(h)]]
# bass (enters with the 120 lane): root on the bar, root again on beat 3, a pickup into the next chord
bass = []
for k in range(9):
    t0 = 12 + 2 * k
    if t0 < 17 - 1e-3 or t0 >= END: continue
    r = chord(t0)[0] - 12; nxt = chord(t0 + 2)[0] - 12
    bass += [(t0, 0.9, r, 110), (t0 + 1.0, 0.4, r, 96), (t0 + 1.5, 0.22, r + 12, 90), (t0 + 1.75, 0.22, nxt + (0 if nxt <= r else -12) + 12, 84)]
bass += [(END, 2.0, 36, 120)]
# strings + warm pad: a swell on C under the hook, then the chords
strings, pad = [(3.0, 9.0, m, 50) for m in (60, 64, 67)], [(2.0, 10.0, m, 55) for m in (48, 55, 64)]
for k in range(9):
    t0 = 12 + 2 * k
    if t0 >= END: break
    c = chord(t0)
    strings += [(t0, 2.0, m + 12, 64) for m in c] + [(t0, 2.0, c[0], 58)]
    pad += [(t0, 2.0, m + 12, 60) for m in c]
strings += [(END, 1.0, m + 12, 80) for m in CH[0]] + [(END, 1.0, 72, 80)]
pad += [(END, 1.0, m + 12, 70) for m in CH[0]]
# claps on 2 and 4 once all three lanes play (the "everyone in" moment)
claps = [(12 + 2 * k + o, 0.2, 39, 100) for k in range(9) for o in (0.5, 1.5) if 22 <= 12 + 2 * k + o < END]
# cymbals: crash on the last unison hit, a crash at 22 when the 180 lane joins
cym = [(END, 2.0, 49, 120), (END, 2.0, 57, 100), (22.0, 1.5, 57, 70), (17.0, 1.5, 55, 64)]
sparkle = [(9.95, 1.2, 84, 90), (END, 1.5, 84, 100), (END, 1.5, 91, 90), (END, 1.5, 88, 90)]

print('rendering stems with FluidSynth …')
S = {
    'heart': render('heart', heart, drums=True, gain=0.6),
    'drum60': render('drum60', drum60, drums=True, gain=0.6),
    'marimba': render('marimba', mar, prog=12, gain=0.5),
    'glock': render('glock', glk, prog=9, gain=0.5),
    'bass': render('bass', bass, prog=33, gain=0.6),
    'strings': render('strings', strings, prog=48, gain=0.5),
    'pad': render('pad', pad, prog=89, gain=0.5),
    'claps': render('claps', claps, drums=True, gain=0.5),
    'cym': render('cym', cym, drums=True, gain=0.5),
    'sparkle': render('sparkle', sparkle, prog=9, gain=0.5),
}

# ------------------------------------------------------------------ synth layers: 808 sub under the big drum, heartbeat sub, riser
t_ = lambda sec: np.arange(int(sec * SR)) / SR
def put(buf, sig, t, g=1.0):
    i = int(round(t * SR)); j = min(N, i + len(sig))
    if i < N: buf[:, i:j] += sig[..., :j - i] * g
def hz(m): return 440 * 2 ** ((m - 69) / 12)
def sub808(m, sec=0.7):
    t = t_(sec); f = hz(m) * (1 + 1.5 * np.exp(-t * 35))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4.0) * np.minimum(1, t / 0.002)
    return np.tanh(2.2 * s) / np.tanh(2.2)                    # a little drive so phones hear it
sub = np.zeros((2, N), dtype=np.float32)
for h in h60:
    r = chord(h)[0]
    while hz(r) > 90: r -= 12                                 # 45–90 Hz: deep, but phones still hear it
    put(sub, sub808(r, 0.9 if abs(h - END) < 1e-3 else 0.7), h, 0.9)
for h in SC['heart']:
    t = t_(0.35); f = 62 - 18 * np.minimum(1, t / 0.08)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 14) * np.minimum(1, t / 0.004)
    put(sub, s, h, 0.7); put(sub, s * 0.5, h + 0.19, 0.7)
# reverse crash into the jump (ends when the cat leaves the ground)
crash = S['cym'][:, int(END * SR):int((END + 1.4) * SR)].copy()
rev = crash[:, ::-1] * np.linspace(0, 1, crash.shape[1]) ** 2
fx = np.zeros((2, N), dtype=np.float32); put(fx, rev, SC['jump'] + 0.12 - rev.shape[1] / SR, 0.9)

# ------------------------------------------------------------------ sidechain: everything soft ducks under the big drum
duck = np.ones(N, dtype=np.float32)
for h in h60:
    i = int(h * SR); t = t_(0.45); d = 1 - 0.55 * np.exp(-t / 0.12) * np.minimum(1, t / 0.004)
    j = min(N, i + len(d)); duck[i:j] = np.minimum(duck[i:j], d[:j - i])

def fxchain(x, board): return board(x, SR)
def pan(x, p):                                               # constant-power pan of a stereo stem
    gl, gr = np.cos((p + 1) * np.pi / 4) * 1.414, np.sin((p + 1) * np.pi / 4) * 1.414
    return np.stack([x[0] * gl, x[1] * gr])
room = lambda wet: Reverb(room_size=0.55, damping=0.5, wet_level=wet, dry_level=1.0, width=1.0)

mix = np.zeros((2, N), dtype=np.float32)
mix += 1.5 * fxchain(S['heart'], Pedalboard([LowShelfFilter(cutoff_frequency_hz=90, gain_db=4), Compressor(threshold_db=-18, ratio=3, attack_ms=3, release_ms=90)]))
mix += 0.65 * fxchain(S['drum60'], Pedalboard([LowShelfFilter(cutoff_frequency_hz=80, gain_db=5), PeakFilter(cutoff_frequency_hz=350, gain_db=-4, q=1.2),
                                              HighShelfFilter(cutoff_frequency_hz=4000, gain_db=3), Compressor(threshold_db=-16, ratio=4, attack_ms=8, release_ms=120), room(0.12)]))
mix += 0.3 * fxchain(sub, Pedalboard([LowpassFilter(cutoff_frequency_hz=180)]))
mix += 0.75 * pan(fxchain(S['marimba'], Pedalboard([HighpassFilter(cutoff_frequency_hz=120), PeakFilter(cutoff_frequency_hz=2500, gain_db=3, q=0.8),
                                                     Compressor(threshold_db=-20, ratio=3, attack_ms=2, release_ms=80), room(0.22)])), 0.3)
mix += 0.55 * pan(fxchain(S['glock'], Pedalboard([HighpassFilter(cutoff_frequency_hz=400), HighShelfFilter(cutoff_frequency_hz=6000, gain_db=-3), room(0.3)])), -0.35)
mix += 0.8 * fxchain(S['bass'], Pedalboard([HighpassFilter(cutoff_frequency_hz=35), Distortion(drive_db=6), LowpassFilter(cutoff_frequency_hz=2500),
                                            Compressor(threshold_db=-18, ratio=4, attack_ms=10, release_ms=100)])) * duck
mix += 0.38 * fxchain(S['strings'], Pedalboard([HighpassFilter(cutoff_frequency_hz=180), room(0.35)])) * duck
mix += 0.30 * fxchain(S['pad'], Pedalboard([HighpassFilter(cutoff_frequency_hz=200), room(0.4)])) * duck
mix += 0.55 * fxchain(S['claps'], Pedalboard([HighpassFilter(cutoff_frequency_hz=250), room(0.35)]))
mix += 0.45 * fxchain(S['cym'], Pedalboard([HighpassFilter(cutoff_frequency_hz=300)]))
mix += 0.45 * fxchain(fx, Pedalboard([HighpassFilter(cutoff_frequency_hz=300)]))
mix += 0.40 * fxchain(S['sparkle'], Pedalboard([room(0.45)]))

master = Pedalboard([HighpassFilter(cutoff_frequency_hz=28), HighShelfFilter(cutoff_frequency_hz=8000, gain_db=2.5), Compressor(threshold_db=-14, ratio=2.5, attack_ms=12, release_ms=150),
                     Gain(gain_db=4), Limiter(threshold_db=-2.0, release_ms=80)])
mix = mix / max(1e-9, np.abs(mix).max()) * 0.7
out = master(mix, SR)
fade = np.ones(N, dtype=np.float32); k = int(0.4 * SR); fade[-k:] = np.linspace(1, 0, k)
out = out * fade
with AudioFile(f'{WD}/music_gm_raw.wav', 'w', SR, 2) as f: f.write(out)
print('mixed → music_gm_raw.wav')
