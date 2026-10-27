"""Acoustic drums from DRSKit (DrumGizmo, CC-BY 4.0) rendered by the drumgizmo CLI, returned as mixed stereo stems.

render(hits, length) → {'kick','snare','toms','hats','oh','room'} stereo float32 at 48 kHz.
A hit is {t (s), d (name in NOTES), vel (1–127)}. Times are absolute seconds: the MIDI file runs at a fixed
120 qpm so one tick is 1/1920 s, whatever the film's tempo is.
"""
import os, subprocess, tempfile, math
import numpy as np
import soundfile as sf
import mido

KIT = '/home/user/samples/lib/drskit/DRSKit'
SR = 48000
NOTES = {'kick': 36, 'kick_soft': 35, 'snare': 38, 'rim': 37, 'snare_rest': 40, 'hh': 56, 'hh_shank': 42,
         'hh_semi': 46, 'hh_open': 58, 'hh_open_tip': 61, 'hh_foot': 44, 'ride': 51, 'ride_bell': 53,
         'ride_shank': 66, 'crash': 49, 'crash2': 57, 'tom1': 47, 'tom2': 43, 'tom3': 41}
TPS = 1920  # ticks per second at 120 qpm, 960 tpb


def write_mid(hits, path):
    mid = mido.MidiFile(ticks_per_beat=960)
    tr = mido.MidiTrack(); mid.tracks.append(tr)
    tr.append(mido.MetaMessage('set_tempo', tempo=500000))
    ev = []
    for h in hits:
        tk = max(0, int(round(h['t'] * TPS)))
        n = NOTES[h['d']] if isinstance(h['d'], str) else int(h['d'])
        v = int(np.clip(round(h.get('vel', 100)), 1, 127))
        ev.append((tk, 1, n, v))
        ev.append((tk + 10, 0, n, 0))
    ev.sort()
    now = 0
    for tk, on, n, v in ev:
        tr.append(mido.Message('note_on' if on else 'note_off', note=n, velocity=v, time=tk - now, channel=9))
        now = tk
    mid.save(path)


def _pan(m, p):
    return np.stack([m * math.cos((p + 1) * math.pi / 4), m * math.sin((p + 1) * math.pi / 4)], 1) * 1.4142


def _polarity(a, b):
    """+1 or −1 so that b lines up with a (zero-lag correlation)."""
    c = float(np.dot(a, b))
    return 1.0 if c >= 0 else -1.0


def render(hits, length, kit='DRSKit_basic.xml', midimap='Midimap_basic.xml', humanize=True):
    if not hits:
        z = np.zeros((int(length * SR), 2), 'float32')
        return {k: z.copy() for k in ('kick', 'snare', 'toms', 'hats', 'oh', 'room')}
    with tempfile.TemporaryDirectory() as d:
        write_mid(hits, f'{d}/in.mid')
        cmd = ['drumgizmo', '-i', 'midifile', '-I', f'file={d}/in.mid,midimap={KIT}/{midimap}',
               '-o', 'wavfile', '-O', f'file={d}/o,srate={SR}', '-e', str(int((length + 1) * SR))]
        if humanize:
            cmd += ['-x']
        cmd += [f'{KIT}/{kit}']
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        ch = {}
        for f in os.listdir(d):
            if f.endswith('.wav'):
                name = f[1:].rsplit('-', 1)[0]
                x, sr = sf.read(f'{d}/{f}', dtype='float32')
                ch[name] = x[:int(length * SR)]
    n = int(length * SR)
    fit = lambda x: np.pad(x, (0, max(0, n - len(x))))[:n]
    ch = {k: fit(v) for k, v in ch.items()}
    kb = ch['Kdrum_back'] * _polarity(ch['Kdrum_front'], ch['Kdrum_back'])
    sb = ch['Snare_bottom'] * _polarity(ch['Snare_top'], ch['Snare_bottom'])
    out = {
        'kick': _pan(ch['Kdrum_front'] + 0.7 * kb, 0.0),
        'snare': _pan(ch['Snare_top'] + 0.45 * sb, 0.0),
        'toms': _pan(ch['Tom1'], -0.25) + _pan(ch['Tom2'], 0.2) + _pan(ch['Tom3'], 0.45),
        'hats': _pan(ch['Hihat'], 0.3) + _pan(ch['Ride'], -0.35),
        'oh': np.stack([ch['OHL'], ch['OHR']], 1),
        'room': np.stack([ch['AmbL'], ch['AmbR']], 1),
    }
    return {k: v.astype('float32') for k, v in out.items()}
