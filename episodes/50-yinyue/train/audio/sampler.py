"""A small multisample player for SFZ and Renoise XRNI libraries (Salamander, VSCO 2, FreePats …).

Instrument.load(path) → instrument; inst.render(notes, length_s) → stereo float32 at SR.
A note is a dict: t (s), key (MIDI), vel (1–127), dur (s), optional pan (-1..1), gain (linear), cents.
Pitch: linear-interpolated resampling from the nearest sampled key. Round robins cycle per key.
"""
import io, os, re, zipfile, math, functools
import numpy as np
import soundfile as sf
from scipy.signal import resample_poly

SR = 48000
NOTE = {'c': 0, 'd': 2, 'e': 4, 'f': 5, 'g': 7, 'a': 9, 'b': 11}


def key_of(s):
    """'c#4' / 'a#3' / '60' → MIDI number (C4 = 60)."""
    s = str(s).strip().lower()
    if re.fullmatch(r'-?\d+', s):
        return int(s)
    m = re.fullmatch(r'([a-g])([#b]?)(-?\d+)', s)
    n = NOTE[m.group(1)] + (1 if m.group(2) == '#' else -1 if m.group(2) == 'b' else 0)
    return 12 * (int(m.group(3)) + 1) + n


class Region:
    __slots__ = ('src', 'lokey', 'hikey', 'center', 'lovel', 'hivel', 'tune', 'gain', 'release', 'veltrack', 'oneshot', 'rr', 'offset')

    def __init__(self, src, lokey=0, hikey=127, center=60, lovel=1, hivel=127, tune=0.0, gain=1.0,
                 release=0.25, veltrack=100.0, oneshot=False, rr=0, offset=0):
        self.src, self.lokey, self.hikey, self.center = src, lokey, hikey, center
        self.lovel, self.hivel, self.tune, self.gain = lovel, hivel, tune, gain
        self.release, self.veltrack, self.oneshot, self.rr, self.offset = release, veltrack, oneshot, rr, offset


@functools.lru_cache(maxsize=4096)
def _read(src):
    """src = path or 'zip::member' → stereo float32 (n, 2) at SR."""
    if '::' in src:
        z, m = src.split('::', 1)
        with zipfile.ZipFile(z) as zf:
            data, sr = sf.read(io.BytesIO(zf.read(m)), dtype='float32', always_2d=True)
    else:
        data, sr = sf.read(src, dtype='float32', always_2d=True)
    if data.shape[1] == 1:
        data = np.repeat(data, 2, axis=1)
    data = data[:, :2]
    if sr != SR:
        g = math.gcd(int(sr), SR)
        data = resample_poly(data, SR // g, int(sr) // g, axis=0).astype('float32')
    return data


class Instrument:
    def __init__(self, name, regions, release=None):
        self.name, self.regions = name, regions
        self.rr_count = {}
        if release is not None:
            for r in regions:
                r.release = release

    # ---------- loaders ----------
    @classmethod
    def load(cls, path, **kw):
        if path.endswith('.xrni'):
            return cls.from_xrni(path, **kw)
        return cls.from_sfz(path, **kw)

    @classmethod
    def from_sfz(cls, path, **kw):
        base = os.path.dirname(path)
        txt = open(path, encoding='utf-8', errors='replace').read()
        txt = re.sub(r'//[^\n]*', '', txt)
        defines = dict(re.findall(r'#define\s+(\$\w+)\s+(\S+)', txt))
        for k, v in defines.items():
            txt = txt.replace(k, v)
        control, glob, master, group = {}, {}, {}, {}
        regions = []
        # split into headers; opcode values may contain spaces only for sample= (up to next opcode)
        for hdr, body in re.findall(r'<(\w+)>([^<]*)', txt):
            ops = {}
            for m in re.finditer(r'(\w+)=(.*?)(?=\s+\w+=|\s*$)', body.strip(), flags=re.S):
                ops[m.group(1)] = m.group(2).strip()
            if hdr == 'control':
                control.update(ops)
            elif hdr == 'global':
                glob = ops
            elif hdr == 'master':
                master = ops
            elif hdr == 'group':
                group = ops
            elif hdr == 'region':
                o = {**glob, **master, **group, **ops}
                if 'sample' not in o:
                    continue
                smp = o['sample'].replace('\\', '/')
                p = os.path.join(base, control.get('default_path', '').replace('\\', '/'), smp)
                key = o.get('key')
                lo = key_of(o.get('lokey', key if key is not None else 0))
                hi = key_of(o.get('hikey', key if key is not None else 127))
                ctr = key_of(o.get('pitch_keycenter', key if key is not None else lo))
                vol = float(o.get('volume', 0)) + float(o.get('gain', 0) if 'gain' in o else 0)
                rr = int(o.get('seq_position', 1)) - 1 if 'seq_length' in o else 0
                regions.append(Region(
                    p, lo, hi, ctr, int(o.get('lovel', 1)), int(o.get('hivel', 127)),
                    float(o.get('tune', 0)) + 100 * float(o.get('transpose', 0)), 10 ** (vol / 20),
                    float(o.get('ampeg_release', 0.25)), float(o.get('amp_veltrack', 100)),
                    o.get('loop_mode', '') == 'one_shot', rr, int(o.get('offset', 0))))
                if o.get('trigger', 'attack') != 'attack' or lo < 0:
                    regions.pop()          # release triggers and pedal noises are not played
        return cls(os.path.basename(path), regions, **kw)

    @classmethod
    def from_xrni(cls, path, **kw):
        with zipfile.ZipFile(path) as zf:
            xml = zf.read('Instrument.xml').decode('utf-8')
            members = sorted(n for n in zf.namelist() if n.startswith('SampleData/'))
        regions = []
        blocks = re.findall(r'<Sample>(.*?)</Sample>', xml, flags=re.S)
        seen = {}
        for i, b in enumerate(blocks):
            g = lambda tag, d=None: (re.search(rf'<{tag}>(.*?)</{tag}>', b, flags=re.S) or [None, d])[1]
            name = g('Name', '')
            member = next((m for m in members if m.startswith(f'SampleData/Sample{i:02d} ') or m.startswith(f'SampleData/Sample{i:03d} ')), None)
            if member is None:
                continue
            lo, hi, base = int(g('NoteStart', 0)), int(g('NoteEnd', 119)), int(g('BaseNote', 48))
            vlo, vhi = int(g('VelocityStart', 0)), int(g('VelocityEnd', 127))
            zone = (lo, hi, vlo, vhi)
            rr = seen.get(zone, 0)
            seen[zone] = rr + 1
            # BaseNote is the MIDI note (checked by pitch detection: trumpet c3 sample = 261.6 Hz at BaseNote 60)
            vol = float(g('Volume', 1.0))
            fine = float(g('Finetune', 0)) / 128 * 100 + 100 * float(g('Transpose', 0))
            regions.append(Region(f'{path}::{member}', lo, hi, base, max(1, vlo), max(1, vhi),
                                  fine, vol, 0.3, 30.0, False, rr))
        return cls(os.path.basename(path), regions, **kw)

    # ---------- playing ----------
    def pick(self, key, vel):
        cand = [r for r in self.regions if r.lokey <= key <= r.hikey and r.lovel <= vel <= r.hivel]
        if not cand:
            # nearest key zone, any velocity layer closest to vel
            cand = sorted(self.regions, key=lambda r: (min(abs(key - r.lokey), abs(key - r.hikey)), abs(vel - (r.lovel + r.hivel) / 2)))
            best = cand[0]
            cand = [r for r in self.regions if (r.lokey, r.hikey, r.lovel, r.hivel) == (best.lokey, best.hikey, best.lovel, best.hivel)]
        n = max(r.rr for r in cand) + 1
        i = self.rr_count.get((key, vel // 16), 0)
        self.rr_count[(key, vel // 16)] = i + 1
        pool = [r for r in cand if r.rr == i % n] or cand
        return pool[0]

    def voice(self, key, vel, dur, cents=0.0, release=None):
        r = self.pick(int(round(key)), int(np.clip(vel, 1, 127)))
        smp = _read(r.src)[r.offset:]
        ratio = 2 ** ((key - r.center) / 12 + (r.tune + cents) / 1200)
        rel = r.release if release is None else release
        need = int((dur + rel) * SR) + 2
        n_out = min(need, int(len(smp) / ratio) - 1)
        if n_out <= 8:
            return np.zeros((8, 2), 'float32')
        if abs(ratio - 1) < 1e-6:
            out = smp[:n_out].copy()
        else:
            x = np.arange(n_out) * ratio
            i0 = x.astype(np.int64)
            f = (x - i0)[:, None].astype('float32')
            out = smp[i0] * (1 - f) + smp[np.minimum(i0 + 1, len(smp) - 1)] * f
        # release envelope after the note's duration
        nd = int(dur * SR)
        if nd < n_out:
            nr = max(1, int(rel * SR))
            env = np.ones(n_out, 'float32')
            k = np.arange(n_out - nd)
            env[nd:] = np.clip(1 - k / nr, 0, 1) ** 2
            out *= env[:, None]
        # velocity → gain (sfz curve), scaled by the region's veltrack
        vg = (vel / 127) ** 2
        g = 1 - r.veltrack / 100 * (1 - vg)
        # tiny fade-in against clicks
        fi = min(32, len(out))
        out[:fi] *= np.linspace(0, 1, fi, dtype='float32')[:, None]
        return out * (g * r.gain)

    def render(self, notes, length):
        buf = np.zeros((int(length * SR) + SR, 2), 'float32')
        for nt in notes:
            v = self.voice(nt['key'], nt.get('vel', 100), nt.get('dur', 0.5), nt.get('cents', 0.0), nt.get('release'))
            i = int(round(nt['t'] * SR))
            if i >= len(buf) or i + len(v) <= 0:
                continue
            if i < 0:
                v, i = v[-i:], 0
            pan = nt.get('pan', 0.0)
            lg, rg = math.cos((pan + 1) * math.pi / 4), math.sin((pan + 1) * math.pi / 4)
            seg = buf[i:i + len(v)]
            seg[:, 0] += v[:len(seg), 0] * lg * 1.4142 * nt.get('gain', 1.0)
            seg[:, 1] += v[:len(seg), 1] * rg * 1.4142 * nt.get('gain', 1.0)
        return buf[:int(length * SR)]
