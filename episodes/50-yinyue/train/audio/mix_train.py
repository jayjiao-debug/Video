"""Render and mix the score of 《开往零点的列车》 into a record.

python3 mix_train.py --win 0 17 --out poc_a.wav       (render a time window of the film, film time in seconds)
Stems per track → buses (rail, drums, low end, music, fx) → master (glue comp, EQ, limiter, −14 LUFS).
Sidechain ducking is computed from the score's kick times, not detected.
"""
import argparse, json, math, os, sys, time, functools
import numpy as np
import soundfile as sf
import pedalboard as pb
import pyloudnorm as pyln

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import sampler as SM
import synth as SY
import drums as DR
import score_train as SC

SR = 48000
L = '/home/user/samples/lib'
V = f'{L}/vcsl/VCSL-1.2.2-RC'
KIT = '/home/user/samples/foley/kit'
VST = '/usr/lib/vst3'
rng = np.random.default_rng(11)


# ---------------------------------------------------------------- instruments (lazy)
@functools.lru_cache(maxsize=None)
def inst(name):
    p = {
        'piano': f'{L}/salamander/SalamanderGrandPiano-SFZ+FLAC-V3+20200602/SalamanderGrandPiano-V3+20200602.sfz',
        'oldpiano': f'{L}/pianofb/PianoFB SFZ+FLAC-20200401/PianoFB 20200401.sfz',
        'sax': f'{L}/sax/TenorSaxophone-SFZ+FLAC-20200717/TenorSaxophone-20200717.sfz',
        'fbass': f'{L}/fbass/FingerBassYR SFZ+FLAC-20190930/FingerBassYR 20190930.sfz',
        'zither': f'{V}/Chordophones/Zithers/Dan Tranh - Normal.sfz',
        'claps': f'{V}/Idiophones/Struck Idiophones/Claps.sfz',
        'woodblock': f'{V}/Idiophones/Struck Idiophones/Woodblock.sfz',
        'gong': f'{V}/Idiophones/Struck Idiophones/Gong 1.sfz',
        'bigdrum': f'{V}/Membranophones/Struck Membranophones/Bass Drum 2.sfz',
        'marching': f'{V}/Membranophones/Struck Membranophones/Legacy Snares - drum3_marching.sfz',
        'suscym': f'{V}/Idiophones/Struck Idiophones/Suspended Cymbal 1.sfz',
        'timpani': f'{V}/Membranophones/Struck Membranophones/Timpani 2 - Scale.sfz',
        'harmonica': f'{V}/Aerophones/Free Aerophones/Harmonica-Hohner-Special20-F - Normal.sfz',
        'vibes': f'{V}/Idiophones/Struck Idiophones/Vibraphone - Soft Mallets.sfz',
        'glock': f'{V}/Idiophones/Struck Idiophones/Glockenspiel.sfz',
        'shaker': f'{V}/Idiophones/Struck Idiophones/Shaker, Small.sfz',
        'tambourine': f'{V}/Idiophones/Struck Idiophones/Tambourine 1.sfz',
        'handchime': f'{V}/Idiophones/Struck Idiophones/Hand Chimes.sfz',
        'toywhistle': f'{V}/Aerophones/Edge-blown Aerophones/Train Whistle, Toy.sfz',
        'sleigh': f'{V}/Idiophones/Struck Idiophones/Sleigh Bells.sfz',
        'claves': f'{V}/Idiophones/Struck Idiophones/Claves.sfz',
    }.get(name)
    if p:
        return SM.Instrument.load(p)
    if name == 'ep':
        return folder_inst(f'{V}/Electrophones/TX81Z/FM Piano', 'FMPiano')
    return SM.Instrument.load(f'{L}/vsco/{name}.xrni')


def folder_inst(d, prefix):
    """VCSL folders without SFZ: <prefix>_<Note><oct>_vl<n>.wav, C4 = 60 (checked by pitch)."""
    import re
    files = sorted(os.listdir(d))
    by_key = {}
    for f in files:
        mm = re.match(rf'{prefix}_([A-G]#?)(-?\d)_vl(\d)\.wav', f)
        if mm:
            by_key.setdefault(SM.key_of(mm.group(1).lower() + mm.group(2)), []).append((int(mm.group(3)), f))
    keys = sorted(by_key)
    regs = []
    for i, k in enumerate(keys):
        lo = (keys[i - 1] + k) // 2 + 1 if i else 0
        hi = (k + keys[i + 1]) // 2 if i + 1 < len(keys) else 127
        layers = sorted(by_key[k])
        nl = len(layers)
        for j, (vl, f) in enumerate(layers):
            regs.append(SM.Region(f'{d}/{f}', lo, hi, k, 1 + 127 * j // nl, 127 * (j + 1) // nl, release=0.35, veltrack=40))
    return SM.Instrument(prefix, regs)


@functools.lru_cache(maxsize=None)
def oneshots(name):
    kit = json.load(open(f'{KIT}/kit.json'))
    return [SM._read(p) for p in kit[name]]


# ---------------------------------------------------------------- track renderers
def trim_lead(x, thr_db=-36):
    a = np.abs(x).max(1)
    i = int(np.argmax(a > a.max() * 10 ** (thr_db / 20)))
    return x[max(0, i - 48):]

def evfx(x, e):
    """per-event colour: muffle = heard through a closed door; phone = a phone speaker on 公放."""
    if e.get('muffle') == 'door':
        x = SY.svf(x, 650, 0.6, 'low') * 0.7
    if e.get('phone'):
        m = x.mean(1)
        m = SY.svf(SY.svf(m, 600, 0.9, 'high'), 3800, 0.9, 'low')
        m = SY.sat(m * 2.5, 2.0) * 0.5
        x = np.stack([m, m], 1).astype('float32')
    return x


def render_sampled(evs, w0, n, instrument, key_shift=0, split=None):
    """sampler track. split = (key, low_inst): keys below `key` play low_inst."""
    buf = np.zeros((n, 2), 'float32')
    I = inst(instrument)
    I2 = inst(split[1]) if split else None
    for e in evs:
        use = I2 if (split and e['key'] < split[0]) else I
        v = use.voice(e['key'] + key_shift, e.get('vel', 100), e.get('dur', 0.5), e.get('cents', 0.0), e.get('release'))
        SY.place(buf, evfx(v, e) * e.get('gain', 1.0), e['t'] - w0)
    return buf


def render_oneshot(evs, w0, n, name, pick='cycle'):
    buf = np.zeros((n, 2), 'float32')
    smp = [trim_lead(y) for y in oneshots(name)]
    for k, e in enumerate(evs):
        x = smp[k % len(smp)] if pick == 'cycle' else smp[rng.integers(len(smp))]
        if 'dur' in e:
            x = x[:int(e['dur'] * SR)].copy()
            f = min(len(x), 2400)
            x[-f:] *= np.linspace(1, 0, f)[:, None]
        SY.place(buf, evfx(x, e) * e.get('gain', 1.0) * (e.get('vel', 100) / 110) ** 1.5, e['t'] - w0)
    return buf


def render_clack(evs, w0, n):
    """the rail kit: real 哐-当 recordings (cycled) + a short low body thump so it works as a kick on phones."""
    buf = np.zeros((n, 2), 'float32')
    smp = oneshots('clack')
    order = [3, 5, 4, 0, 3, 5, 2, 1]
    body = SY.kick_punch(dur=0.18, f0=95, f1=180, tau_p=0.012, tau_a=0.05, click=0.0, drive=1.2)
    muf = None
    for k, e in enumerate(evs):
        g = (e.get('vel', 100) / 110) ** 1.6
        x = smp[order[k % len(order)]][:int(0.45 * SR)].copy()
        x[-2400:] *= np.linspace(1, 0, 2400)[:, None]
        x = x.copy()
        x[:len(body)] += body[:len(x)] * 0.35
        if e.get('muffle'):
            x = SY.svf(x, 500, 0.7, 'low')
        SY.place(buf, x * g, e['t'] - w0 - 0.03)   # samples were cut 30 ms early
    return buf


def render_synth(evs, w0, n, kind):
    buf = np.zeros((n, 2), 'float32')
    for e in evs:
        t = e['t'] - w0
        g = e.get('gain', 1.0)
        if kind == 'sub':
            x = SY.sub_bass(e['note'], e['dur'])
            if e.get('muffle'):
                x = SY.svf(x, 160, 0.7, 'low')
        elif kind == '808':
            x = SY.kick808(e['note'], dur=e['dur'], drop=12, drive=2.2, click=0.15)
        elif kind == 'kick_e':
            x = SY.kick_punch()
        elif kind == 'supersaw':
            x = SY.supersaw(e['notes'], e['dur'], cutoff=5200, a=0.01, d=0.4, s=0.75, r=0.25)
        elif kind == 'pad':
            x = SY.supersaw(e['notes'], e['dur'], voices=5, spread=0.12, cutoff=1400, a=0.25, d=0.5, s=0.9, r=0.6)
        elif kind == 'lead_saw':
            x = SY.supersaw([e['key']], e['dur'], voices=5, spread=0.1, cutoff=6000, a=0.003, d=0.15, s=0.7, r=0.08, width=0.5)
        elif kind == 'riser':
            x = SY.noise_riser(e['dur'], f0=e.get('f0', 300), f1=e.get('f1', 9000))
        elif kind == 'whoosh':
            x = SY.noise_riser(e['dur'] * 0.6, 150, 1500, q=1.0)
            x = np.concatenate([x, SY.downlifter(e['dur'] * 0.4, 1500, 120)])
        elif kind == 'impact':
            x = SY.impact(note=e.get('note', 26))
        elif kind == 'squeal':     # brake squeal tuned to the key: a narrow resonant noise band + a wavering partial
            nn = int(e['dur'] * SY.SR)
            tt = np.arange(nn) / SY.SR
            f = SY.mtof(e.get('key', 86)) * (1 + 0.004 * np.sin(2 * np.pi * 6.3 * tt))
            nz = SY.svf(SY.rng.standard_normal(nn).astype('float32'), f, 40.0, 'band') * 6
            y = (nz + 0.25 * SY.sine(f, nn)) * np.clip(tt / (0.6 * e['dur']), 0, 1) * np.clip((e['dur'] - tt) / 0.3, 0, 1)
            x = SY.st(SY.sat(y.astype('float32'), 1.3), 0.3)
        elif kind == 'steam':      # a steam puff: band-passed noise with a fast attack
            nn = int(e.get('dur', 0.6) * SY.SR)
            tt = np.arange(nn) / SY.SR
            y = SY.svf(SY.rng.standard_normal(nn).astype('float32'), 2500, 0.8, 'band') * np.exp(-tt / (e.get('dur', 0.6) / 3)) * np.clip(tt / 0.01, 0, 1)
            x = SY.st(y.astype('float32'))
        elif kind == 'clap_e':
            x = SY.clap_synth()
        elif kind == 'hat_e':
            x = SY.hat(open_=e.get('open', False))
        elif kind == 'pluck':
            x = SY.pluck(e['key'], dur=e.get('dur', 0.3), bright=e.get('bright', 5000), decay=e.get('decay', 0.15))
        elif kind == 'cheap_lead':      # the 广场舞 DJ lead: a bright square, no detune, a touch of vibrato
            nn = int((e['dur'] + 0.05) * SY.SR)
            tt = np.arange(nn) / SY.SR
            f = SY.mtof(e['key']) * (1 + 0.006 * np.sin(2 * np.pi * 5.5 * tt) * np.clip(tt / 0.15, 0, 1))
            y = np.sign(SY.sine(f, nn)) * 0.5 + 0.3 * SY.polyblep_saw(f, nn)
            y = y * SY.env_adsr(nn, 0.004, 0.08, 0.8, 0.05, gate=int(e['dur'] * SY.SR))
            x = SY.st(y.astype('float32'))
        else:
            raise KeyError(kind)
        x = evfx(x, e)
        SY.place(buf, x * g, t)
    return buf


def render_revcrash(evs, w0, n):
    """a real suspended-cymbal crescendo (2 s) that peaks on the downbeat."""
    buf = np.zeros((n, 2), 'float32')
    I = inst('suscym')
    for e in evs:
        x = I.voice(65, 110, 2.6, release=0.05)
        pk = int(np.argmax(np.abs(x).mean(1)))
        x = x[:pk + 200].copy()
        x[-400:] *= np.linspace(1, 0, 400)[:, None]
        SY.place(buf, x * e.get('gain', 1.0), e['t'] - w0 - len(x) / SR)
    return buf


def render_drums(evs, w0, n, mutes):
    hits = [dict(e, t=e['t'] - w0) for e in evs if -0.5 < e['t'] - w0 < n / SR]
    st = DR.render(hits, n / SR + 0.01)
    st = {k: np.pad(v, ((0, max(0, n - len(v))), (0, 0)))[:n] for k, v in st.items()}
    for (a, b) in mutes:
        i0, i1 = int((a - w0) * SR), int((b - w0) * SR)
        if i1 > 0 and i0 < n:
            for k in st:
                seg = st[k][max(0, i0):max(0, i1)]
                fade = np.ones(len(seg), 'float32')
                fade[:min(len(seg), 480)] = np.linspace(1, 0, min(len(seg), 480))
                st[k][max(0, i0):max(0, i1)] = seg * np.where(np.arange(len(seg)) < 480, fade, 0)[:, None]
    return st


# ---------------------------------------------------------------- processing helpers
def chain(x, plugins):
    return pb.Pedalboard(plugins)(x.T.copy(), SR).T.astype('float32')


@functools.lru_cache(maxsize=None)
def vst(name):
    return pb.load_plugin(f'{VST}/{name}.vst3')


def reverb(x, kind='hall', decay=2.2, size=30, predelay=12, low_cut=200, high_cut=9000, wet=1.0):
    """100 % wet send return."""
    try:
        if kind == 'plate':
            p = vst('DragonflyPlateReverb')
            p.dry_level, p.wet_level, p.decay_s, p.predelay_ms, p.low_cut_hz, p.high_cut_hz = 0, 100, decay, predelay, low_cut, high_cut
        elif kind == 'room':
            p = vst('DragonflyRoomReverb')
            p.dry_level, p.early_level, p.late_level, p.size_m, p.decay_s, p.predelay_ms = 0, 30, 60, size, decay, predelay
            p.low_cut_hz, p.high_cut_hz = low_cut, high_cut
        else:
            p = vst('DragonflyHallReverb')
            p.dry_level, p.early_level, p.late_level, p.size_m, p.decay_s, p.predelay_ms = 0, 20, 60, size, decay, predelay
            p.low_cut_hz, p.high_cut_hz = low_cut, high_cut
        y = p(np.ascontiguousarray(x.T), SR, reset=True).T
    except Exception as ex:
        print('reverb fallback', ex)
        y = chain(x, [pb.Reverb(room_size=0.8, damping=0.4, wet_level=1.0, dry_level=0.0)])
    return (y * wet).astype('float32')


def duck_env(kick_times, n, w0, depth=0.7, attack=0.004, release=0.16):
    e = np.ones(n, 'float32')
    t = np.arange(n) / SR
    for tk in kick_times:
        i0 = int((tk - w0) * SR)
        if i0 >= n or i0 + int(0.6 * SR) < 0:
            continue
        a = max(0, i0 - int(attack * SR))
        b = min(n, i0 + int(0.6 * SR))
        u = t[a:b] - (tk - w0)
        g = 1 - depth * np.where(u < 0, (u + attack) / attack, np.exp(-u / release))
        e[a:b] = np.minimum(e[a:b], g.clip(0, 1))
    return e


def limit(x, ceiling_db=-1.0, lookahead=0.004, release=0.08):
    """transparent lookahead brickwall (pedalboard's Limiter adds makeup gain, so it is not used on the master)."""
    from scipy.ndimage import minimum_filter1d, uniform_filter1d
    c = 10 ** (ceiling_db / 20)
    pk = np.abs(x).max(1)
    g = np.minimum(1.0, c / np.maximum(pk, 1e-9))
    La = max(1, int(lookahead * SR))
    g = minimum_filter1d(g, 2 * La + 1, origin=-La)          # start reducing La samples before a peak
    g = _release(g.astype(np.float64), math.exp(-1 / (release * SR)))
    g = uniform_filter1d(g, La)                                 # smooth the attack corner
    g = np.minimum(g, minimum_filter1d(np.minimum(1.0, c / np.maximum(pk, 1e-9)), 3))
    return np.clip(x * g[:, None], -c, c).astype('float32')


def _release(g, a):
    from numba import njit
    return _rel_nb(g, a)


def finish(master, target=-14.0, ceiling=-1.2):
    lo = lufs(master)
    g = 10 ** ((target - lo) / 20) if lo > -60 else 1.0
    y = limit(master * g, ceiling)
    lo2 = lufs(y)
    if lo2 > -60:
        y = limit(master * g * 10 ** ((target - lo2) / 20), ceiling)
    return y


def lufs(x):
    try:
        return pyln.Meter(SR).integrated_loudness(x.astype('float64'))
    except Exception:
        return -70.0


from numba import njit as _njit


@_njit(cache=True)
def _rel_nb(g, a):
    y = np.empty_like(g)
    cur = 1.0
    for i in range(len(g)):
        if g[i] < cur:
            cur = g[i]
        else:
            cur = g[i] + (cur - g[i]) * a
        y[i] = cur
    return y


# ---------------------------------------------------------------- the mix
TRACKS = {
    # name: (renderer, bus, gain dB)
    'clack': ('clack', 'rail', 0.0),
    'ep': ('s:ep', 'music', 3.0),
    'piano': ('s:piano', 'music', -4.0),
    'oldpiano': ('s:oldpiano', 'music', -4.0),
    'strings': ('s:ViolinEnsSusVib|55|ViolaEnsSusVib', 'music', -3.0),
    'strings_lo': ('s:CelloEnsSusVib|36|ContrabassSusVB', 'music', -3.0),
    'trumpet': ('s:TrumpetSus', 'music', 2.0),
    'horn': ('s:FHornSus', 'music', 0.0),
    'trombone': ('s:TromboneSus', 'music', 0.0),
    'trumpet_stac': ('s:TrumpetStac', 'music', 3.0),
    'trombone_stac': ('s:TromboneStac', 'music', 1.0),
    'tuba_stac': ('s:TubaStac', 'music', 0.0),
    'brass_lead': ('brass_lead', 'music', 2.0),
    'sax': ('s:sax', 'music', -3.0),
    'zither': ('s:zither', 'music', -2.0),
    'glock': ('s:glock', 'music', -8.0),
    'vibes': ('s:vibes', 'music', -6.0),
    'timpani': ('s:timpani', 'fx', -2.0),
    'claps': ('s:claps', 'drums_x', -4.0),
    'drumline': ('s:marching', 'drums_x', -7.0),
    'woodblock': ('s:woodblock', 'drums_x', -6.0),
    'bigdrum': ('s:bigdrum', 'drums_x', -1.0),
    'gong': ('gong', 'fx', -1.0),
    'bottle': ('o:bottle', 'drums_x', -8.0),
    'shaker': ('s:shaker', 'drums_x', -10.0),
    'tambourine': ('s:tambourine', 'drums_x', -12.0),
    'cracker': ('o:cracker', 'fx', -8.0),
    'crackers': ('o:crackers', 'fx', -6.0),
    'bass': ('s:fbass', 'low', -2.0),
    'bass_dist': ('bass_dist', 'low', -4.0),
    'sub': ('y:sub', 'low', -9.0),
    '808': ('y:808', 'low', -7.0),
    'kick_e': ('y:kick_e', 'drums_x', -4.0),
    'clap_e': ('y:clap_e', 'drums_x', -8.0),
    'door_slide': ('o:door', 'fx', -6.0),
    'handchime': ('s:handchime', 'music', -4.0),
    'toywhistle': ('s:toywhistle', 'fx', -10.0),
    'sleigh': ('s:sleigh', 'drums_x', -12.0),
    'claves': ('s:claves', 'drums_x', -8.0),
    'marimba': ('s:Marimba', 'music', -2.0),
    'organ': ('s:OrganQuiet', 'music', -8.0),
    'squeal': ('y:squeal', 'fx', -14.0),
    'steam': ('y:steam', 'fx', -12.0),
    'hat_e': ('y:hat_e', 'drums_x', -12.0),
    'pluck': ('y:pluck', 'music', -10.0),
    'cheap_lead': ('y:cheap_lead', 'music', -14.0),
    'harp': ('s:Harp', 'music', -4.0),
    'pizz_bass': ('s:ContrabassPizz', 'low', 0.0),
    'pizz_hi': ('s:ViolinEnsPizz|55|ViolaEnsPizz', 'music', -2.0),
    'violin_solo': ('s:SViolinVib', 'music', -3.0),
    'flute': ('s:FluteSusVib', 'music', -3.0),
    'supersaw': ('y:supersaw', 'music', -10.0),
    'pad': ('y:pad', 'music', -10.0),
    'lead_saw': ('y:lead_saw', 'music', -13.0),
    'riser': ('y:riser', 'fx', -10.0),
    'whoosh': ('y:whoosh', 'fx', -8.0),
    'impact': ('y:impact', 'fx', -4.0),
    'revcrash': ('revcrash', 'fx', -6.0),
}


def render_track(name, evs, w0, n):
    kind = TRACKS[name][0]
    if kind == 'clack':
        return render_clack(evs, w0, n)
    if kind.startswith('s:'):
        spec = kind[2:].split('|')
        split = (int(spec[1]), spec[2]) if len(spec) == 3 else None
        return render_sampled(evs, w0, n, spec[0], split=split)
    if kind.startswith('o:'):
        return render_oneshot(evs, w0, n, kind[2:])
    if kind.startswith('y:'):
        return render_synth(evs, w0, n, kind[2:])
    if kind == 'brass_lead':
        a = render_sampled(evs, w0, n, 'TrumpetSusVib')
        b = render_sampled([dict(e, key=e['key'] - 12) for e in evs], w0, n, 'FHornSus')
        return a + 0.6 * b
    if kind == 'bass_dist':
        x = render_sampled(evs, w0, n, 'fbass')
        return chain(x, [pb.Distortion(drive_db=22), pb.LadderFilter(mode=pb.LadderFilter.Mode.LPF24, cutoff_hz=2600, resonance=0.25), pb.Gain(-12)])
    if kind == 'gong':
        a = render_sampled(evs, w0, n, 'gong')
        return a
    if kind == 'revcrash':
        return render_revcrash(evs, w0, n)
    raise KeyError(kind)


def mix(win, out, stems_dir=None, verbose=True, norm=True):
    w0, w1 = win
    n = int((w1 - w0) * SR)
    S = SC.build()
    clock = time.time()
    # evs in window (+ pre-roll for long notes)
    def in_win(e):
        return (w0 - 8) <= e['t'] < w1
    tracks = {k: [e for e in v if in_win(e)] for k, v in S.tracks.items()}
    mutes = [(e['t'], e['t1']) for e in tracks.get('mute_drums', [])]
    mute_all = [(e['t'], e['t1']) for e in tracks.get('mute_all', [])]
    free = {k: [e for e in v if e.get('nomute')] for k, v in tracks.items()}
    tracks = {k: [e for e in v if not e.get('nomute')] for k, v in tracks.items()}
    kicks = sorted([e['t'] for e in tracks.get('drums', []) if e['d'] in ('kick',)] + [e['t'] for e in tracks.get('kick_e', [])]
                   + [e['t'] for e in tracks.get('808', [])])
    buses = {b: np.zeros((n, 2), 'float32') for b in ('rail', 'drums', 'drums_x', 'low', 'music', 'fx')}
    stems = {}
    for name, evs in tracks.items():
        if name in ('drums', 'mute_drums', 'mute_all', 'filter_open', 'level') or not evs:
            continue
        x = render_track(name, evs, w0, n)
        x *= 10 ** (TRACKS[name][2] / 20)
        stems[name] = x
        buses[TRACKS[name][1]] += x
        if verbose:
            print(f'  {name:14s} {len(evs):4d} ev  peak {np.abs(x).max():.2f}  {time.time() - clock:5.1f}s')
    # ------------- drums (DrumGizmo stems)
    if tracks.get('drums'):
        d = render_drums(tracks['drums'], w0, n, mutes)
        kick = chain(d['kick'], [pb.HighpassFilter(30), pb.LowShelfFilter(70, 3.0, 0.7), pb.PeakFilter(380, -5, 1.2),
                                 pb.PeakFilter(4000, 4, 1.0), pb.Compressor(-16, 4, 5, 90), pb.Gain(4)])
        snare = chain(d['snare'], [pb.HighpassFilter(90), pb.PeakFilter(220, 3, 1.0), pb.PeakFilter(5500, 5, 0.8),
                                   pb.Compressor(-18, 4, 3, 120), pb.Gain(3)])
        snare = snare + reverb(snare, 'plate', decay=1.3, predelay=8, low_cut=200) * 0.22
        toms = chain(d['toms'], [pb.HighpassFilter(60), pb.Compressor(-16, 3, 5, 120), pb.Gain(2)])
        hats = chain(d['hats'], [pb.HighpassFilter(350), pb.HighShelfFilter(9000, 2, 0.7)])
        oh = chain(d['oh'], [pb.HighpassFilter(250), pb.HighShelfFilter(10000, 2, 0.7)])
        room = chain(d['room'], [pb.HighpassFilter(80), pb.Compressor(-30, 8, 1, 60), pb.Gain(6)])
        kit = kick + snare + toms * 0.9 + hats * 0.8 + oh * 0.6 + room * 0.35
        stems.update({'dg_kick': kick, 'dg_snare': snare, 'dg_toms': toms, 'dg_hats': hats, 'dg_oh': oh, 'dg_room': room})
        buses['drums'] += kit * 10 ** (-2 / 20)
    # ------------- buses
    rail = chain(buses['rail'], [pb.HighpassFilter(45), pb.PeakFilter(160, 3, 1.0), pb.PeakFilter(2800, 2, 1.0), pb.Compressor(-14, 3, 2, 100)])
    rail = rail + reverb(rail, 'room', decay=0.6, size=12, predelay=4, low_cut=200) * 0.15
    dr = buses['drums'] + buses['drums_x']
    dr = chain(dr, [pb.PeakFilter(320, -2.5, 1.0), pb.Compressor(-12, 2.5, 20, 150), pb.Distortion(4), pb.HighShelfFilter(6000, 3.0, 0.7), pb.Gain(-3)])
    duck = duck_env(kicks, n, w0, depth=0.65, release=0.14)[:, None]
    low = chain(buses['low'], [pb.HighpassFilter(28), pb.Compressor(-14, 3, 10, 120)]) * duck
    mus = buses['music']
    mus_v = reverb(mus, 'hall', decay=2.4, size=34, predelay=18, low_cut=200, high_cut=8000) * 0.28
    mus = chain(mus, [pb.HighpassFilter(110), pb.PeakFilter(300, -3.0, 0.9), pb.Compressor(-16, 2, 15, 200), pb.HighShelfFilter(6000, 3.0, 0.7)])
    mus = (mus + mus_v) * (0.55 + 0.45 * duck)
    fx = buses['fx'] + reverb(buses['fx'], 'hall', decay=3.2, size=40, predelay=10, low_cut=150) * 0.25
    master = rail * 1.6 + dr + low * 0.7 + mus + fx
    lv = sorted(S.tracks.get('level', []), key=lambda e: e['t'])
    if lv:
        tt = w0 + np.arange(n) / SR
        db = np.interp(tt, [e['t'] for e in lv], [e['db'] for e in lv])
        master *= (10 ** (db / 20)).astype('float32')[:, None]
    if mute_all:
        mask = np.ones(n, 'float32')
        for (a, b) in mute_all:
            i0, i1 = int((a - w0) * SR), int((b - w0) * SR)
            if i1 <= 0 or i0 >= n:
                continue
            f = min(720, max(1, i1 - i0))
            mask[max(0, i0):max(0, i1)] = 0.0
            if i0 >= 0:
                mask[i0:i0 + f] = np.linspace(1, 0, f) ** 2
        master *= mask[:, None]
    fb = np.zeros((n, 2), 'float32')
    for name, evs in free.items():
        if evs and name in TRACKS:
            fb += render_track(name, evs, w0, n) * 10 ** (TRACKS[name][2] / 20)
    if np.abs(fb).max() > 0:
        master += fb + reverb(fb, 'hall', decay=3.0, size=40, predelay=10, low_cut=150) * 0.3
    master = chain(master, [pb.HighpassFilter(22), pb.Compressor(-10, 1.8, 30, 250), pb.HighShelfFilter(9000, 1.5, 0.7)])
    if not norm:
        if out:
            sf.write(out, master, SR, subtype='FLOAT')
        return master
    # loudness to −14 LUFS integrated, then a transparent brickwall at −1.2 dBFS (iterate once: limiting lowers loudness)
    lo = lufs(master)
    g = 10 ** ((-14 - lo) / 20) if lo > -60 else 1.0
    out_ = limit(master * g, -1.2)
    lo2 = lufs(out_)
    if lo2 > -60:
        out_ = limit(master * g * 10 ** ((-14 - lo2) / 20), -1.2)
    master = out_
    sf.write(out, master, SR, subtype='PCM_24')
    if stems_dir:
        os.makedirs(stems_dir, exist_ok=True)
        for k, v in stems.items():
            sf.write(f'{stems_dir}/{k}.wav', v, SR, subtype='FLOAT')
        for k, v in (('bus_rail', rail), ('bus_drums', dr), ('bus_low', low), ('bus_music', mus), ('bus_fx', fx)):
            sf.write(f'{stems_dir}/{k}.wav', v, SR, subtype='FLOAT')
    if verbose:
        print(f'master {out}: LUFS before norm {lo:.1f}, gain {20 * math.log10(g):+.1f} dB, peak {np.abs(master).max():.3f}, {time.time() - clock:.1f}s')
    return master


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--win', nargs=2, type=float, default=[0, 17])
    ap.add_argument('--out', default='out.wav')
    ap.add_argument('--stems', default=None)
    a = ap.parse_args()
    mix(a.win, a.out, a.stems)
