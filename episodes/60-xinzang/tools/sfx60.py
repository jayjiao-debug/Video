#!/usr/bin/env python3
"""ep60 v7 SFX library (owner 23:03 "same logic for sound effects"): one style, made by us in code, in the same sonic family as the
score (hijaz60: same instruments, same room + warm hall, same stem processing and stereo stage); tonal ones in D Hijaz. Named by
function so they can be reused across scenes and future Egypt episodes. Exception (owner-approved realistic takes): Ammit's roars,
growl, grunt, the jaw slam, the small chomp and the lick come from the voice-farm takes, run through the same room and tone.

    python3 sfx60.py build OUT_DIR SFX_TAKES_DIR     -> OUT_DIR/<name>.wav (48 kHz 24-bit, -16 LUFS active, <= -1 dBTP), sfx.json
    python3 sfx60.py sampler OUT_DIR OUT.wav         -> ~30 s tour of the library
"""
import os, sys, json, numpy as np, soundfile as sf
from scipy import signal
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import egypt_cues as E, hijaz60 as H, lib60
SR = 48000
H.CFG.update({'fx': dict(db=0.0, hp=35, room=0.22, hall=0.12), 'fxdry': dict(db=0.0, hp=30, room=0.12, hall=0.04),
              'fxc': dict(db=0.0, hp=30, eq=[(9000, -2.0, 0.7)], room=0.12, hall=0.1)})
H.PERC |= {'fx', 'fxdry', 'fxc'}

def noise(rng, n): return rng.standard_normal(n)
def env(n, a, d, hold=0.0):
    t = np.arange(n) / SR; e = np.minimum(1, t / max(a, 1e-4)); k = int(hold * SR)
    dec = np.exp(-np.maximum(0, t - a - hold) / d); return e * dec
def grains(rng, n, rate, kernel_ms=2.0, amp_env=None, lo=1500, hi=9000):
    """sparse random impulses (Poisson) convolved with a tiny decaying-noise grain: sand, crinkle, grit."""
    rate = np.broadcast_to(rate, (n,)) if np.ndim(rate) else np.full(n, rate)
    imp = (rng.random(n) < rate / SR) * rng.uniform(0.2, 1.0, n) * (amp_env if amp_env is not None else 1)
    k = int(kernel_ms / 1000 * SR); ker = noise(rng, k) * np.exp(-np.arange(k) / (k / 4))
    return E.filt(E.sos_bp(lo, hi), signal.fftconvolve(imp, ker)[:n])
def sweep_noise(rng, dur, f0, f1, bw=0.6, curve=None):
    """noise through a band whose centre glides f0 -> f1 (STFT mask): the whoosh."""
    n = int(dur * SR); x = noise(rng, n); f, t, Z = signal.stft(x, SR, nperseg=1024)
    fc = np.geomspace(f0, f1, Z.shape[1]) if curve is None else curve(np.linspace(0, 1, Z.shape[1]), f0, f1)
    mask = np.exp(-0.5 * (np.log(np.maximum(f[:, None], 20) / fc[None, :]) / bw) ** 2)
    return signal.istft(Z * mask, SR, nperseg=1024)[1][:n]

def T1(dur, seed): return H.Take(1, False, pre=0.05, tail=dur, seed=seed)

# ---------------------------------------------------------------- tonal / musical (the score's instruments)
def gong_title(T):
    for k, v in (('G', 1.0), ('F', 1.0), ('Z', 0.9), ('D', 0.7)): H.stroke(T, 0.0, k, v)
    H.pluck(T, 'oud', E.midi('D3'), 0.0, 2.0, 0.8, 0.35, 'oud'); H.pluck(T, 'oud', E.midi('D2'), 0.006, 2.2, 0.55, 0.35, 'oud')
    H.qroll(T, 0.0, 'D5', 1.0, 0.3)
def gong_verdict(T):
    T.put('gong', H.gong(T.rng, 1.0, f0=36.7, dur=7.0), 0.0); T.put('gong', H.gong(T.rng, 0.6, f0=55.0, dur=6.0), 0.004)
    H.stroke(T, 0.0, 'F', 1.0); H.stroke(T, 0.0, 'D', 0.8)
def chime_ding(T):
    T.put('zills', E.bowl(T.rng, 'D6', 0.9, 2.5), 0.0, -0.2); H.pluck(T, 'qanun', E.midi('A6'), 0.0, 1.2, 0.5, -0.2, 'qanun')
    H.pluck(T, 'qanun', E.midi('D6'), 0.003, 1.2, 0.45, -0.2, 'qanun')
def chime_glint(T):
    H.stroke(T, 0.0, 'z', 0.6); H.pluck(T, 'qanun', E.midi('D7'), 0.01, 0.8, 0.4, 0.3, 'qanun'); T.put('sis', E.sistrum(T.rng, 0.4, 2, 0.04), 0.02, 0.3)
def glyph_light(T):
    H.qrun(T, 0.0, 'D5', 'D6', 0.45, 0.4); T.put('zills', E.bowl(T.rng, 'A5', 0.6, 2.5), 0.3, 0.1); T.put('sis', E.sistrum(T.rng, 0.5, 3, 0.06), 0.25, 0.3)
def magic_shimmer(T):
    for j in range(7): T.put('sis', E.sistrum(T.rng, 0.3 + 0.08 * j, 2, 0.05), 0.12 * j, 0.3 * np.sin(j))
    for nm, d in (('D5', 0.0), ('A5', 0.15), ('D6', 0.3)):
        b = E.bowl(T.rng, nm, 0.5, 3.0); b *= np.minimum(1, np.arange(len(b)) / (0.6 * SR)); T.put('zills', b, d, 0.0)
    H.stroke(T, 0.0, 'z', 0.35)
def stinger_hit(T):
    for k, v in (('F', 0.95), ('D', 0.8), ('Z', 0.85)): H.stroke(T, 0.0, k, v)
    H.pluck(T, 'oud', E.midi('D3'), 0.0, 2.0, 0.85, 0.35, 'oud'); H.pluck(T, 'oud', E.midi('D2'), 0.006, 2.2, 0.6, 0.35, 'oud')
    H.pluck(T, 'qanun', E.midi('D5'), 0.004, 1.8, 0.5, -0.38, 'qanun'); H.pluck(T, 'qanun', E.midi('D4'), 0.008, 1.8, 0.45, -0.38, 'qanun')
def stinger_comic(T):
    H.lead(T, H.score('D5:1. A4:1f r:6'), 0.0, kind='mizmar', vel=0.6, breath=0.06); H.stroke(T, 0.0, 'T', 0.7); H.stroke(T, 0.25, 'K', 0.6); H.stroke(T, 0.25, 'z', 0.4)
def stinger_doom(T):
    T.put('gong', H.gong(T.rng, 0.9, f0=36.7), 0.0); H.stroke(T, 0.0, 'F', 1.0); H.stroke(T, 0.0, 'D', 0.9)
    H.pluck(T, 'oud', E.midi('D2'), 0.0, 2.5, 0.7, 0.3, 'oud'); H.pluck(T, 'oud', E.midi('Eb2'), 0.5, 2.0, 0.45, 0.3, 'oud')
def swell_rise(T):
    n = int(2.2 * SR); dr = np.zeros((n, 2))
    for k, (nm, a) in enumerate((('D2', 1.0), ('A2', 0.6), ('D3', 0.5))): dr += a * E.drone_voice(n, nm, None, E.strings if k < 2 else E.arghul, seed=k)
    dr *= (np.linspace(0, 1, n) ** 2.2)[:, None]; T.put('drone', dr * 3.0, 0.0)
    for j in range(10): T.put('sis', E.sistrum(T.rng, 0.15 + 0.07 * j, 2, 0.05), 0.2 * j, 0.25)
    H.qroll(T, 1.2, 'D5', 1.0, 0.35, rate=0.0625); H.stroke(T, 2.2, 'z', 0.7)
def heartbeat(T):
    for t, v in ((0.0, 1.0), (0.28, 0.65)): H.stroke(T, t, 'H', v)
def heartbeat_fast(T):
    t = 0.0
    for k in range(6): H.stroke(T, t, 'H', 0.8 + 0.04 * k); H.stroke(T, t + 0.22, 'H', 0.55); t += 0.62 - 0.05 * k
def tick_wood(T):
    n = int(0.08 * SR); s = E.modes(n, [(2350, 1.0, 0.012), (1180, 0.6, 0.018), (3900, 0.4, 0.008)], T.rng) + noise(T.rng, n) * np.exp(-np.arange(n) / (0.002 * SR)) * 0.4
    T.put('fxdry', E.fade_edges(s * 0.6, 0.0002, 0.01), 0.0, 0.1)
def tick_metal(T):
    n = int(0.35 * SR); s = E.modes(n, [(3520, 1.0, 0.09), (5400, 0.5, 0.05), (7900, 0.3, 0.03), (1760, 0.3, 0.12)], T.rng)
    T.put('fxdry', E.fade_edges(s * 0.35, 0.0002, 0.02), 0.0, -0.1)

# ---------------------------------------------------------------- foley-like, synthesised, through the same room
def whoosh(T, dur=0.6, f0=300, f1=4000, pan=(-0.5, 0.5)):
    x = sweep_noise(T.rng, dur, f0, f1) * np.sin(np.linspace(0, np.pi, int(dur * SR))) ** 1.5
    n = len(x); h = n // 2; T.put('fx', x[:h] * 0.9, 0.0, pan[0]); T.put('fx', x[h:] * 0.9, h / SR, pan[1])
def whoosh_short(T): whoosh(T, 0.5, 400, 5000)
def whoosh_long(T):
    whoosh(T, 1.2, 150, 3500); n = int(1.2 * SR); low = E.filt(E.sos_lp(180), noise(T.rng, n)) * np.sin(np.linspace(0, np.pi, n)) ** 2 * 2.5
    T.put('fx', low, 0.0, 0.0)
def whoosh_reverse(T):
    U = T1(2.5, 9); H.stroke(U, 0.0, 'z', 0.8); whoosh(U, 0.4, 3000, 600); U.put('gong', H.gong(U.rng, 0.4, f0=110, dur=2.0), 0.0)
    y = H.mixdown(U)[0][::-1].copy(); i = np.flatnonzero(np.abs(y).max(1) > 1e-4); y = y[i[0]:] if len(i) else y
    T.put('fxdry', y, 0.0)
def papyrus_flick(T):
    n = int(0.22 * SR); e = env(n, 0.004, 0.05); x = grains(T.rng, n, 1800 * e, 1.2, e, 900, 7000) * 3 + E.filt(E.sos_bp(1500, 6000), noise(T.rng, n)) * e * 0.08
    T.put('fx', x, 0.0, 0.15)
def papyrus_unroll(T):
    n = int(1.4 * SR); t = np.arange(n) / SR; e = np.minimum(1, t / 0.08) * np.exp(-np.maximum(0, t - 1.0) / 0.12) * (0.7 + 0.3 * np.sin(2 * np.pi * 3.1 * t) ** 2)
    x = grains(T.rng, n, 900 * e, 1.5, e, 700, 6500) * 3 + E.filt(E.sos_bp(300, 2500), noise(T.rng, n)) * e * 0.05
    T.put('fx', x, 0.0, -0.1)
def page_flips(T):
    for k in range(4): papyrus_flick_at(T, k * 0.25, 0.25 * (k % 2) - 0.1)
def papyrus_flick_at(T, t0, pan):
    n = int(0.2 * SR); e = env(n, 0.004, 0.045); x = grains(T.rng, n, 1800 * e, 1.2, e, 900, 7000) * 3; T.put('fx', x, t0, pan)
def step_stone(T, t0=0.0, v=1.0, pan=0.0):
    n = int(0.25 * SR); t = np.arange(n) / SR
    thump = np.sin(2 * np.pi * (95 + 60 * np.exp(-t / 0.01)) * t) * np.exp(-t / 0.035) * 0.8 + E.filt(E.sos_lp(450), noise(T.rng, n)) * np.exp(-t / 0.02) * 0.9
    grit = grains(T.rng, n, 3000 * np.exp(-t / 0.03), 0.8, np.exp(-t / 0.03), 2500, 9000) * 1.5
    s = thump.copy(); k = int(0.028 * SR); s[k:] += 0.6 * thump[:n - k]   # heel, then toe
    T.put('fx', (s + grit) * v, t0, pan)
def steps_stone(T):
    for k in range(4): step_stone(T, k * 0.5 + H.jit(T.rng, 0.01), 0.85 + 0.1 * (k % 2), 0.15 * (-1) ** k)
def knife_shing(T):
    n = int(1.3 * SR); t = np.arange(n) / SR; f0 = E.hz('A6')
    ring = E.modes(n, [(f0, 1.0, 0.5), (f0 * 1.58, 0.7, 0.35), (f0 * 2.31, 0.5, 0.25), (f0 * 3.05, 0.35, 0.15), (f0 * 0.62, 0.3, 0.4)], T.rng)
    scrape = sweep_noise(T.rng, 0.3, 2500, 9000, 0.35) * np.sin(np.linspace(0, np.pi, int(0.3 * SR))); s = ring * 0.25; s[:len(scrape)] += scrape * 0.9
    s *= np.minimum(1, t / 0.08) ** 0.5; T.put('fx', s, 0.0, 0.2)
def jar_clunk(T):
    n = int(0.4 * SR); t = np.arange(n) / SR
    s = E.modes(n, [(147, 1.0, 0.09), (331, 0.7, 0.06), (588, 0.45, 0.04), (990, 0.25, 0.025)], T.rng) + E.filt(E.sos_lp(1500), noise(T.rng, n)) * np.exp(-t / 0.008) * 0.8
    T.put('fx', E.fade_edges(s * 0.6, 0.0003, 0.03), 0.0, -0.1)
def sand_trickle(T):
    n = int(2.6 * SR); t = np.arange(n) / SR; e = np.minimum(1, t / 0.4) * np.minimum(1, (2.6 - t) / 0.8)
    x = grains(T.rng, n, 2500 * e + 50, 0.7, e, 2000, 10000) * 1.4 + E.filt(E.sos_bp(3000, 9000), noise(T.rng, n)) * e * 0.04
    T.put('fx', x, 0.0, 0.0)
def sand_reverse(T):
    U = T1(3.0, 13); sand_trickle(U); y = H.mixdown(U)[0][::-1].copy(); i = np.flatnonzero(np.abs(y).max(1) > 1e-4); T.put('fxdry', y[i[0]:], 0.0)
def door_boom(T):
    n = int(2.4 * SR); t = np.arange(n) / SR
    boom = np.sin(2 * np.pi * (48 + 30 * np.exp(-t / 0.05)) * t) * np.exp(-t / 0.5) + E.filt(E.sos_bp(80, 400), noise(T.rng, n)) * np.exp(-t / 0.06) * 1.2
    grind = E.filt(E.sos_lp(260), noise(T.rng, n)) * (0.6 + 0.4 * np.sin(2 * np.pi * 7.3 * t)) * np.exp(-t / 0.8) * 0.8
    T.put('fx', boom + grind, 0.0, 0.0); H.stroke(T, 0.0, 'F', 0.6)
def bite_hit(T):
    H.stroke(T, 0.0, 'D', 1.0); H.stroke(T, 0.0, 'F', 0.8); T.put('gong', H.gong(T.rng, 0.35, f0=55.0, dur=2.5), 0.0)
    n = int(0.15 * SR); T.put('fx', E.filt(E.sos_bp(150, 900), noise(T.rng, n)) * np.exp(-np.arange(n) / (0.012 * SR)) * 1.2, 0.0)

SYNTH = {   # name: (composer, length s, what it is for)
 'gong_title': (gong_title, 6.0, 'the title / chapter gong: gong + bendir + zills + oud D + qanun roll (D)'),
 'gong_verdict': (gong_verdict, 7.0, 'the verdict: a lower, darker double gong + bendir, no cymbal'),
 'chime_ding': (chime_ding, 2.5, 'a highlight / correct answer: small bowl D6 + qanun A6/D6'),
 'chime_glint': (chime_glint, 1.2, 'a glint on metal or a key word: finger cymbal + qanun D7 + sistrum'),
 'glyph_light': (glyph_light, 2.5, 'glyphs / lights appearing: qanun run D5-D6, bowl A5, sistrum'),
 'magic_shimmer': (magic_shimmer, 3.0, 'magic / spell / protection: sistrum roll over D5-A5-D6 bowls swelling'),
 'stinger_hit': (stinger_hit, 2.5, 'a button / hard cut: everyone on D (oud, qanun, bendir, dum, zills)'),
 'stinger_comic': (stinger_comic, 1.5, 'a comic beat: mizmar D5-A4 fall, tek-ka, cymbal tap'),
 'stinger_doom': (stinger_doom, 5.0, 'doom / second death: low gong, bendir, dum, oud D2 then the Eb2 rub'),
 'swell_rise': (swell_rise, 3.0, 'anticipation: drone crescendo D/A + sistrum + qanun tremolo to a cymbal tap at 2.2 s'),
 'heartbeat': (heartbeat, 1.0, 'one heartbeat (bendir lub-dub)'),
 'heartbeat_fast': (heartbeat_fast, 3.6, 'six heartbeats speeding up'),
 'tick_wood': (tick_wood, 0.3, 'a dry wooden tick (reed pen, plumb-bob, glyph column)'),
 'tick_metal': (tick_metal, 0.6, 'a small metallic tick (plumb-bob on the post, scale)'),
 'whoosh_short': (whoosh_short, 0.9, 'a short whoosh (toss, quick move), L to R'),
 'whoosh_long': (whoosh_long, 1.8, 'a long whoosh with a low body (big move, transition)'),
 'whoosh_reverse': (whoosh_reverse, 2.5, 'a reverse swell into a hit (it ends on its last sample: align the end to the beat)'),
 'papyrus_flick': (papyrus_flick, 0.5, 'one papyrus / page flick'),
 'papyrus_unroll': (papyrus_unroll, 1.8, 'a scroll unrolling'),
 'page_flips': (page_flips, 1.4, 'four quick page flips on the eighths'),
 'step_stone': (lambda T: step_stone(T), 0.6, 'one footstep on stone (heel-toe, grit)'),
 'steps_stone': (steps_stone, 2.6, 'four footsteps on stone on the beats'),
 'knife_shing': (knife_shing, 1.6, 'a blade glint: scrape into a metal ring (A6)'),
 'jar_clunk': (jar_clunk, 0.7, 'a clay jar set down (D3 body)'),
 'sand_trickle': (sand_trickle, 3.0, 'dry sand trickling / dissolving'),
 'sand_reverse': (sand_reverse, 3.2, 'the sand trickle reversed (gathering into a stop)'),
 'door_boom': (door_boom, 3.0, 'huge stone doors: a low boom + grind + bendir'),
 'bite_hit': (bite_hit, 3.0, 'a designed bite hit (dum + bendir + low gong), to sit under the jaw slam'),
}
# ---------------------------------------------------------------- v6 sync additions (acts A-C), same family
def flare_hit(T): H.stroke(T, 0.0, 'Z', 0.9); H.stroke(T, 0.0, 'D', 0.8); H.stroke(T, 0.0, 'f', 0.6)
def metal_clang(T):
    n = int(2.0 * SR); s = E.modes(n, [(311, 1.0, 0.9), (523, 0.8, 0.7), (741, 0.6, 0.5), (1046, 0.5, 0.4), (1480, 0.35, 0.3), (2210, 0.25, 0.2)], T.rng)
    s += E.filt(E.sos_bp(300, 3000), noise(T.rng, n)) * np.exp(-np.arange(n) / (0.01 * SR)) * 1.5; T.put('fx', s * 0.4, 0.0, -0.1); H.stroke(T, 0.0, 'D', 0.6)
def chain_rattle(T):
    for j in range(9):
        n = int(0.06 * SR); ff = 2400 + 1500 * T.rng.random()
        T.put('fx', E.modes(n, [(ff, 1, 0.02), (ff * 1.7, 0.5, 0.012)], T.rng) * (0.5 - 0.04 * j), 0.08 * j + 0.02 * T.rng.random(), 0.3 * np.sin(j))
def string_snap(T):
    H.pluck(T, 'oud', E.midi('D5'), 0.0, 0.5, 0.9, 0.2, 'oud', stacc=True); n = int(0.03 * SR)
    T.put('fx', E.filt(E.sos_hp(3000), noise(T.rng, n)) * np.exp(-np.arange(n) / (0.003 * SR)) * 0.8, 0.0, 0.2)
def wing_flap(T):
    n = int(0.35 * SR); t = np.arange(n) / SR; e = np.sin(np.pi * np.minimum(1, t / 0.3)) ** 2
    T.put('fx', E.filt(E.sos_bp(120, 1800), noise(T.rng, n)) * e * 1.2, 0.0, 0.0)
def pen_scratch(T):
    n = int(1.1 * SR); t = np.arange(n) / SR; e = np.where((t % 0.38) < 0.28, 1.0, 0.1) * np.minimum(1, (1.1 - t) / 0.1)
    T.put('fx', grains(T.rng, n, 4000 * e, 0.5, e, 2500, 9000) * 1.2, 0.0, 0.1)
def hiss(T):
    n = int(0.9 * SR); t = np.arange(n) / SR; e = np.minimum(1, t / 0.05) * np.exp(-np.maximum(0, t - 0.4) / 0.2)
    T.put('fx', E.filt(E.sos_bp(3500, 11000), noise(T.rng, n)) * e * 0.8, 0.0, -0.3)
def bone_crack(T):
    for j, (d, v) in enumerate(((0, 1.0), (0.025, 0.7), (0.06, 0.5))):
        n = int(0.08 * SR); T.put('fx', E.filt(E.sos_bp(600, 5000), noise(T.rng, n)) * np.exp(-np.arange(n) / (0.006 * SR)) * v * 1.6, d, 0.0)
    H.stroke(T, 0.0, 'D', 0.4)
def cricket(T):
    n = int(0.9 * SR); t = np.arange(n) / SR; chirp = np.sin(2 * np.pi * 4400 * t) * (np.sin(2 * np.pi * 30 * t) > 0.2) * (((t % 0.45) < 0.16)) * 0.3
    T.put('fxdry', chirp * np.exp(-t / 0.9), 0.0, 0.5)
def claw_scrape(T):
    n = int(0.4 * SR); t = np.arange(n) / SR; e = np.sin(np.pi * t / 0.4)
    T.put('fx', grains(T.rng, n, 2500 * e, 1.0, e, 800, 6000) * 1.4 + E.filt(E.sos_bp(500, 2000), noise(T.rng, n)) * e * 0.08, 0.0, 0.2)
def plop(T):
    n = int(0.3 * SR); t = np.arange(n) / SR; f = 320 * np.exp(-t / 0.08) + 110
    T.put('fx', np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.07) * 0.8, 0.0, 0.0); H.stroke(T, 0.0, 'g', 1.2)
def creak(T):
    n = int(0.7 * SR); t = np.arange(n) / SR; imp = (np.sin(2 * np.pi * np.cumsum(28 + 18 * np.sin(2 * np.pi * 1.3 * t)) / SR) > 0.97) * 1.0
    s = sum(E.filt(E.sos_bp(f * 0.9, f * 1.1), imp) * a for f, a in ((420, 1.0), (930, 0.6), (1650, 0.4))) * np.sin(np.pi * t / 0.7)
    T.put('fx', s * 6, 0.0, -0.1)
def pan_crash(T):
    metal_clang(T); H.stroke(T, 0.0, 'Z', 1.0); H.stroke(T, 0.0, 'F', 0.9); T.put('gong', H.gong(T.rng, 0.5, f0=73.4, dur=3.0), 0.0)
def whip_crack(T):
    n = int(0.12 * SR); t = np.arange(n) / SR; s = sweep_noise(T.rng, 0.12, 800, 7000, 0.4) * np.minimum(1, t / 0.08) ** 3
    k = int(0.09 * SR); s[k:] += E.filt(E.sos_hp(1500), noise(T.rng, n - k)) * np.exp(-np.arange(n - k) / (0.004 * SR)) * 3; T.put('fx', s, 0.0, 0.3)
def hoe_chop(T):
    n = int(0.25 * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * (130 + 80 * np.exp(-t / 0.01)) * t) * np.exp(-t / 0.04) + grains(T.rng, n, 2500 * np.exp(-t / 0.04), 1.0, np.exp(-t / 0.04), 500, 4000)
    T.put('fx', s * 0.8, 0.0, 0.25)
def squeak_chorus(T):
    for j, nm in enumerate(('D6', 'F#6', 'A6', 'Eb6', 'G6')):
        H.lead(T, H.score(f'{nm}:0.7. r:7.3'), 0.004 * j * 5 + 0.01 * T.rng.random(), kind='mizmar', vel=0.25, pan=-0.4 + 0.2 * j, breath=0.05, octv=-1)
def chime_note(note):
    def f(T):
        T.put('zills', E.bowl(T.rng, note, 0.7, 2.0), 0.0, 0.1); H.pluck(T, 'qanun', E.midi(note), 0.0, 1.0, 0.45, 0.1, 'qanun')
    return f
def leadin_roll(T):   # the lead-in to the roar: a darbuka roll + the mizmar climbing D Hijaz, a breath, then (the roar)
    H.roll(T, 0.0, 0.34, 0.25, 1.0, rate=0.042)
    H.lead(T, H.score('D4:0.25 Eb4:0.25 F#4:0.25 G4:0.25 A4:0.25 Bb4:0.25 r:6.5'), 0.0, kind='mizmar', vel=0.55, breath=0.05)
def darbuka_roll(T): H.roll(T, 0.0, 0.7, 0.15, 0.85, rate=0.0625); H.stroke(T, 0.71, 'D', 0.8); H.stroke(T, 0.71, 'z', 0.5)
def rasp(T):
    n = int(0.8 * SR); t = np.arange(n) / SR; e = 0.6 + 0.4 * np.sin(2 * np.pi * 5 * t) ** 2
    T.put('fx', grains(T.rng, n, 3500 * e, 1.2, e, 1500, 8000) * np.minimum(1, (0.8 - t) / 0.08) * 1.1, 0.0, 0.1)
def skitter(T):
    n = int(0.65 * SR); t = np.arange(n) / SR; e = (np.sin(2 * np.pi * 14 * t) > 0) * np.sin(np.pi * t / 0.65)
    T.put('fx', grains(T.rng, n, 1800 * e, 0.6, e, 2500, 9000) * 1.5, 0.0, 0.4)
def tek_hit(T): H.stroke(T, 0.0, 'T', 0.9)
def thup(T):
    n = int(0.2 * SR); t = np.arange(n) / SR
    T.put('fx', E.filt(E.sos_lp(500), noise(T.rng, n)) * np.exp(-t / 0.025) * 1.2 + np.sin(2 * np.pi * 120 * t) * np.exp(-t / 0.04) * 0.4, 0.0, 0.0)
def magic_blast(T):
    whoosh(T, 0.5, 2500, 300); T.put('gong', H.gong(T.rng, 0.45, f0=110.0, dur=2.5), 0.0); H.stroke(T, 0.0, 'Z', 0.8); H.stroke(T, 0.0, 'F', 0.7)
def gong_warm(T): T.put('gong', H.gong(T.rng, 0.7, f0=73.4, dur=5.0), 0.0); H.pluck(T, 'oud', E.midi('D3'), 0.0, 2.0, 0.5, 0.3, 'oud')

SYNTH.update({
 'flare_hit': (flare_hit, 2.0, 'torches flare / a frame-0 accent: finger cymbals + dum + soft bendir'),
 'metal_clang': (metal_clang, 2.2, 'a heavy bronze clang (the heart lands on the pan)'),
 'chain_rattle': (chain_rattle, 1.2, 'the balance chains rattle'),
 'string_snap': (string_snap, 0.8, 'a cord / bow snaps loose'),
 'wing_flap': (wing_flap, 0.6, 'one wing downstroke (the ba)'),
 'pen_scratch': (pen_scratch, 1.4, 'a reed pen writing (three strokes)'),
 'hiss': (hiss, 1.2, 'a cobra hiss'),
 'bone_crack': (bone_crack, 0.6, 'a bone crack'),
 'cricket': (cricket, 1.2, 'one cricket (the awkward silence)'),
 'claw_scrape': (claw_scrape, 0.7, 'claws dragged on stone'),
 'plop': (plop, 0.6, 'a comic plop (the hippo rump)'),
 'creak': (creak, 1.0, 'a wooden lid / chain creak'),
 'pan_crash': (pan_crash, 3.0, 'the pan crashes down (clang + cymbal + bendir + gong)'),
 'whip_crack': (whip_crack, 0.6, 'a comic whip crack'),
 'hoe_chop': (hoe_chop, 0.5, 'a hoe chopping earth'),
 'squeak_chorus': (squeak_chorus, 1.2, 'a tiny squeaky chorus (the shabtis: 「我在!」)'),
 'leadin_roll': (leadin_roll, 1.0, 'the lead-in to a roar: darbuka roll + mizmar climb D-Eb-F#-G-A-Bb (0.34 s), then space'),
 'darbuka_roll': (darbuka_roll, 1.5, 'a sly darbuka roll landing on a dum + cymbal tap at 0.71 s'),
 'rasp': (rasp, 1.0, 'sanding / rasping stone'),
 'skitter': (skitter, 0.9, 'a beetle skittering'),
 'tek_hit': (tek_hit, 0.5, 'one darbuka tek'),
 'thup': (thup, 0.4, 'a soft landing thud'),
 'magic_blast': (magic_blast, 2.8, 'a spell blast: reverse whoosh into a gong, cymbal and bendir'),
 'gong_warm': (gong_warm, 4.0, 'a warm low gong (the verdict is good)'),
})
for nm in ('D6', 'Eb6', 'F#6', 'G6', 'A6', 'Bb6'):
    SYNTH[f'chime_{nm.replace("#", "s")}'] = (chime_note(nm), 2.0, f'a chime on {nm} (D Hijaz): bowl + qanun')

TAKES = {   # owner-approved realistic takes (voice farm), through the same room and tone
 'ammit_roar_1': ('X40_ammit_roar_deep.wav', 'Ammit roar 1 (shot 31): deep lioness, saturated chest'),
 'ammit_roar_2': ('X31_ammit_snarl_heavy.wav', 'Ammit roar 2 (shot 41): the heavy snarl (place it a touch softer)'),
 'ammit_growl': ('X28_ammit_growl.wav', 'Ammit growl'), 'ammit_grunt': ('X27_ammit_grunt.wav', 'Ammit grunt (reveal)'),
 'ammit_jaw_slam': ('X41_ammit_slam.wav', 'the bite: heavy wet jaw slam'),
 'chomp_small': ('X42_shadow_chomp.wav', 'the shadow eater chomp (small)'), 'lick_dog': ('X43_blood_lick.wav', 'the dog lick'),
 'gulp': ('X13_ammit_gulp.wav', 'a gulp (the shadow is swallowed)'),
}

def finish(y, name):
    i = np.flatnonzero(np.abs(y).max(1) > 1e-5); y = y[max(0, i[0] - int(0.002 * SR)):] if len(i) else y
    y = E.trim_tail(y, -66, 0.15); yy = np.concatenate([y, np.zeros((max(0, int(0.5 * SR) - len(y)), 2))])
    try: L = E.lufs(yy)
    except Exception: L = -30.0
    g = 10 ** ((-16 - L) / 20) if np.isfinite(L) else 1.0; y = E.limit(y * g, -1.0); return y

def build(out, takes):
    os.makedirs(out, exist_ok=True); meta = {}
    for k, (fn, dur, what) in SYNTH.items():
        T = T1(dur, abs(hash(k)) % 9999); fn(T); y = finish(H.mixdown(T)[0], k)
        sf.write(f'{out}/{k}.wav', y.astype(np.float32), SR, subtype='PCM_24'); meta[k] = dict(seconds=round(len(y) / SR, 2), kind='synth', what=what)
    for k, (fn, what) in TAKES.items():
        p = f'{takes}/{fn}'
        if not os.path.exists(p): print('missing', p); continue
        x = lib60.load(p); T = H.Take(1, False, pre=0.0, tail=len(x) / SR + 1.5, seed=3); T.put('fxc', x, 0.0)
        y = finish(H.mixdown(T, side=1.0)[0], k); sf.write(f'{out}/{k}.wav', y.astype(np.float32), SR, subtype='PCM_24')
        meta[k] = dict(seconds=round(len(y) / SR, 2), kind='approved take', source=fn, what=what)
    json.dump(meta, open(f'{out}/sfx.json', 'w'), indent=1, ensure_ascii=False); print('wrote', out, len(meta))

TOUR = ['gong_title', 'chime_ding', 'glyph_light', 'magic_shimmer', 'tick_wood', 'tick_wood', 'whoosh_short', 'papyrus_unroll',
        'page_flips', 'steps_stone', 'knife_shing', 'jar_clunk', 'heartbeat_fast', 'sand_trickle', 'sand_reverse', 'door_boom', 'stinger_comic',
        'swell_rise', 'ammit_roar_1', 'ammit_jaw_slam', 'stinger_doom']
CAP = {'gong_title': 2.2, 'magic_shimmer': 1.6, 'door_boom': 1.8, 'stinger_doom': 2.4, 'ammit_roar_1': 2.4, 'heartbeat_fast': 2.0,
       'sand_trickle': 1.6, 'sand_reverse': 1.4, 'swell_rise': 2.3, 'ammit_jaw_slam': 1.2, 'papyrus_unroll': 1.4, 'steps_stone': 2.0}
def sampler(out_dir, out):
    t = 0.2; parts = []; marks = []
    for k in TOUR:
        x = sf.read(f'{out_dir}/{k}.wav', always_2d=True)[0]; cap = CAP.get(k, 1.1)
        if len(x) > cap * SR:
            f = int(0.3 * SR)
            if 'reverse' in k: x = x[-int(cap * SR):].copy(); x[:f] *= np.linspace(0, 1, f)[:, None] ** 2   # reverse sounds: keep the end (the point)
            else: x = x[:int(cap * SR)].copy(); x[-f:] *= np.linspace(1, 0, f)[:, None] ** 2
        parts.append((t, x)); marks.append((round(t, 2), k)); t += len(x) / SR + (0.1 if k.startswith('tick') else 0.2)
    y = np.zeros((int((t + 0.3) * SR), 2))
    for t0, x in parts: i = int(t0 * SR); y[i:i + len(x)] += x
    y = lib60.master(y, target=-16.0); sf.write(out, y.astype(np.float32), SR, subtype='PCM_24'); print('sfx sampler', round(len(y) / SR, 2), 's'); print(marks)

if __name__ == '__main__':
    if sys.argv[1] == 'build': build(sys.argv[2], sys.argv[3])
    else: sampler(sys.argv[2], sys.argv[3])
