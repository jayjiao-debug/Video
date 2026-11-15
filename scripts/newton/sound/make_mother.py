#!/usr/bin/env python3
"""mus_mother: the music under Newton talking about his mother (scene F, F09-F16), composed and synthesised here.

  python3 scripts/newton/sound/make_mother.py [--clips DIR] [--timing voice_timing.json] [--voice voice_48k.wav]
                                              [--wav DIR] [--check] [--force]

Owner's note 7 (15 Nov): "we can add some soft fitting music as BGM when newton talks about his mother". Until now this
stretch had the fire and, from F14's end, one bowed cello D (mus_cello, two bows). The film's other music is baroque
chamber colour around D (mus_morning D major, mus_night "plucked lute and harp over dark strings, D minor", the cello's
D, the clock's D5): this piece stays there.

THE PIECE (D minor, unmeasured, like a 17th-century lute prelude: nothing counts beats, every note waits for a pause)
  two players, a continuo pair of the 1680s: a THEORBO (plucked, synthesised below) and a BASS VIOL (the film's own
  mus_cello note, bowed: the same sound the stretch already had).
  - the held bass: the viol's D3, one slow bow per phrase, each swell coming up in a pause between lines;
  - THE IDEA (it returns): the lament's falling fourth, D - C - B flat - A (D5 down to A4), one plucked note per
    pause over a tenth in the tenor (A3, A3, G3, F3), so every pair is a consonance over the held D. Pass 1 under
    F09-F10, pass 2 under F11-F13. The idea lies in the treble because a phone speaker plays nothing under about
    450 Hz: an octave lower (the first try) the phone heard the music 5-7 dB under the fire until F15;
  - F14 (the threat to burn the house): nothing new. The last pair and the bow die away under the line;
  - THE LIFT, in the pause before F15 (changing her dressings with his own hands): the viol's full bow with its octave
    double (the two bows the cut already had, same anchors and levels), and the theorbo, for the only time, RISES:
    D4 A4 D5 F5 (the piece's highest note, and its first F on top: D minor said plainly);
  - then back down the same chord, D5 (over B flat, after "when she was gravely ill") and the resolution in the breath
    between F15 and F16: open fifths D3 A3 A4, as the piece began, and one last quiet D4 in F16's own pause. The cue's
    fade-out takes the rest away under F16: the scene ends on the fire, and the town clock's D5 stroke falls a second
    later into that silence.
  Every plucked note and every bow is anchored on a line (SCORE, BOWS: [line id, start|end, offset s]) and the script
  CHECKS, on the voice track, that each plucked onset falls where nobody is speaking (voice under -45 dBFS from 30 ms
  before to 60 ms after). It refuses to write the clip if one lands on a word (--force overrides).
  Tuning: A4 = 438.8 Hz, the viol's own D (mus_cello + 2 st measures 146.44 Hz, 4.7 cents under A 440).

THE SOUNDS
  theorbo: each note a pair of gut strings a hair apart (a course), 40 partials at most, plucked a fifth of the way
  along with the flesh of the finger (soft top: -12 dB/oct above about 1.5 kHz), the upper partials dying first, a
  2 ms finger noise and the body's thump, then a small room (1.0 s). Little energy between 1 and 4 kHz after the
  first 0.2 s of a note: the words stay clear.
  viol: mus_cello.mp3 through ffmpeg's rubberband, + 2 st (D3) and + 26 st (D5), exactly as cues.json played it.

THE CLIPS (mono 48 kHz, mp3 192k), both 30.04 s on the timing of 15 Nov, t = 0 on [F08, end, 0]:
  mus_mother.mp3      the piece as above (IN THE MIX: cues.json bed "F the mother music")
  mus_mother_alt.mp3  the alternative, sparser: the theorbo alone, single notes (the falling fourth without its
                      companions, no held bass before F15), then the two viol bows as the old cut had them. Not in
                      the mix: to try it, change the bed's "clip" to mus_mother_alt (same anchors, same gain).
  Each clip has a sidecar <clip>.json (the timing it was composed on). After any change of F08-F16's timing run this
  script again (--check tells whether the clips are stale), then hot_syllables.py --build and build.py.
The clip is 3 dB under the old cello cues (CLIP_DB, headroom): play it at gain -18 dB and the two full bows sound as
they did (D3 -21 / -25 dB, D5 -24 / -28 dB)."""
import argparse, json, os, subprocess, sys, numpy as np
from scipy.signal import butter, sosfilt, fftconvolve, iirpeak, lfilter
SR = 48000
A4 = 440.0 * 2 ** (-4.7 / 1200)
CLIP_AT = ("F08", "end", 0.0)                 # the clip's first sample on the film clock (cues.json "at")
CLIP_END = ("F16", "end", 0.3)                # its last (cues.json "until"): gone before the G cut and the clock's stroke
NAMES = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}

def hz(note):
    n = NAMES[note[0]] + (-1 if "b" in note else 1 if "#" in note else 0); o = int(note[-1])
    return A4 * 2 ** ((12 * (o + 1) + n - 69) / 12)

# ------------------------------------------------------------------------------------------------ the score
# (anchor, [(note, velocity 0-1, seconds after the anchor), ...], pause it lands in, in "alt")
SCORE = [
    # PASS 1: D - C - B flat - A in the treble (D5 .. A4: where a phone speaker still plays), each over a tenth in the tenor
    (("F09", "start", 0.70), [("A3", 0.50, 0.0), ("D5", 0.62, 0.11)], "after 我母亲。", ["D5"]),
    (("F09", "start", 2.10), [("A3", 0.46, 0.0), ("C5", 0.58, 0.11)], "after 她临终时，", ["C5"]),
    (("F09", "end", -0.12), [("G3", 0.46, 0.0), ("Bb4", 0.56, 0.11)], "F09 | F10", ["Bb4"]),
    (("F10", "end", -0.11), [("F3", 0.46, 0.0), ("A4", 0.54, 0.11)], "F10 | F11", ["A4"]),
    (("F11", "start", 0.80), [("D2", 0.50, 0.0)], "after 亲？", []),
    # PASS 2: the idea returns, a shade quieter
    (("F11", "end", -0.22), [("A3", 0.46, 0.0), ("D5", 0.58, 0.11)], "after 父亲就死了。 (before the poker)", ["D5"]),
    (("F12", "start", 0.06), [("A3", 0.44, 0.0), ("C5", 0.55, 0.11)], "after the poker, before 我三岁那年", ["C5"]),
    (("F12", "start", 2.56), [("G3", 0.44, 0.0), ("Bb4", 0.54, 0.11)], "after 她改嫁了。", ["Bb4"]),
    (("F12", "end", -0.10), [("F3", 0.44, 0.0), ("A4", 0.52, 0.11)], "F12 | F13", ["A4"]),
    (("F13", "end", -0.09), [("D2", 0.46, 0.0)], "F13 | F14", []),
    # F14: nothing.  THE LIFT (the pause before F15): the only rising figure, up to F5
    (("F15", "start", -0.72), [("D4", 0.46, 0.0), ("A4", 0.52, 0.22), ("D5", 0.60, 0.44), ("F5", 0.66, 0.68)], "the pause before F15", ["A4", "F5"]),
    # and the way back down the same chord: (F5) - D5 - A4 - D4
    (("F15", "start", 1.92), [("Bb3", 0.44, 0.0), ("D5", 0.56, 0.10)], "after 她最后病重时，", ["D5"]),
    (("F15", "end", -0.085), [("D3", 0.50, 0.0), ("A3", 0.46, 0.09), ("A4", 0.54, 0.18)], "F15 | F16: the resolution (open fifths, as it began)", ["D3", "A4"]),
    (("F16", "start", 1.22), [("D4", 0.40, 0.0)], "after 她丢下了您，: the last note", ["D4"]),
]
OCTAVE = set()                                # (note, anchor) pairs to play on an octave course: none (the idea already lies in the treble)
# the viol's bows: (anchor of the bow's first sample, until anchor or None, gain dB re the old first bow, fade in, fade out, octave double dB or None, in "alt")
BOWS = [
    (("F08", "end", 0.0), None, -7.5, 0.0, 0.0, None, False),             # swell up in the pause after 我母亲。
    (("F10", "start", 0.635), None, -8.5, 0.0, 0.0, None, False),        # ... in F10 | F11
    (("F11", "end", -0.26), None, -8.0, 0.0, 0.0, None, False),           # ... after the poker
    (("F12", "end", -0.355), None, -9.0, 0.0, 0.0, None, False),         # ... in F13 | F14, dying under F14
    (("F14", "end", 0.05), ("F15", "end", -0.2), 0.0, 0.3, 0.6, -3.0, True),      # THE LIFT: the old cut's first bow (D3 -21, D5 -24)
    (("F15", "end", -0.3), ("F16", "end", 0.3), -4.0, 0.3, 1.0, -3.0, True),      # the old cut's second bow (D3 -25, D5 -28)
]
LUTE_DB = -5.0                                # the theorbo against the viol's full bow (set by measurement, notes6/S)
CLIP_DB = -3.0                                # the whole clip, for headroom: cue gain -18 dB = the old cello cue's -21
ROOM_DB = -15.0                               # the theorbo's room under its dry sound

# ------------------------------------------------------------------------------------------------ the theorbo
def bp(x, lo, hi, order=2): return sosfilt(butter(order, [lo, hi], "bp", fs=SR, output="sos"), x)
def lp(x, f, order=2): return sosfilt(butter(order, f, "lp", fs=SR, output="sos"), x)
def hp(x, f, order=2): return sosfilt(butter(order, f, "hp", fs=SR, output="sos"), x)

def pluck(note, vel, rng, octave=False):
    """one plucked course: two gut strings a hair apart; additive, each partial with its own decay.
    octave: the course's second string is an octave string (as a lute's lower courses are), 2 dB under the first:
    it puts the note's octave (440-590 Hz for the idea's A3-D4) into the band a phone speaker plays"""
    f0 = hz(note); bass = f0 < 100
    tau0 = 0.50 * (220.0 / f0) ** 0.55 * (1.25 if bass else 1.0)            # the fundamental's decay (s): long in the bass
    n = int(min(7.0, 9.0 * tau0) * SR); t = np.arange(n) / SR; y = np.zeros(n)
    beta = 0.14 if bass else 0.20                                           # where the finger plucks (fraction of the string)
    fc = 850.0 + 1100.0 * vel                                               # the flesh of the finger: a harder pluck is brighter
    K = int(min(40, 5200.0 / f0))
    for s in range(1 if bass else 2):                                       # the diapasons are single strings
        det = 2 ** ((1.6 if s else -1.1) / 1200) if not bass else 1.0
        if s and octave: det *= 2.0
        d = int((0.0030 + 0.0012 * rng.random()) * SR) * s                  # the finger crosses the second string 3-4 ms later
        ph = rng.uniform(0, 2 * np.pi, K + 1)
        for k in range(1, K + 1):
            fk = k * f0 * det * np.sqrt(1 + 4e-5 * k * k)
            a = np.sin(k * np.pi * beta) / k / (1 + (fk / fc) ** 2)
            tau = tau0 / (1 + (fk / 1000.0) ** 2)                            # gut: the top dies first, the octave above the note rings on
            env = 0.72 * np.exp(-t / tau) + 0.28 * np.exp(-t / (3.4 * tau))  # the two strings hand the sound back and forth: a fast and a slow decay
            if fk > 5200: break
            part = a * env * np.sin(2 * np.pi * fk * t + ph[k]) * ((0.80 if octave else 0.85) if s else 1.0)
            y[d:] += part[:n - d]
    y *= 1 - np.exp(-t / 0.0011)                                            # the release: 1 ms
    y /= np.abs(y).max() + 1e-12
    m = int(0.05 * SR); tt = np.arange(m) / SR
    y[:m] += 0.045 * bp(rng.standard_normal(m), 350, 1700) * np.exp(-tt / 0.0045)        # the finger on the string
    y[:m * 2] += 0.07 * np.sin(2 * np.pi * 172 * np.arange(2 * m) / SR) * np.exp(-np.arange(2 * m) / SR / 0.030)   # the body's thump
    f = int(0.3 * SR); y[-f:] *= np.linspace(1, 0, f)
    return y * (0.25 + 0.95 * vel ** 1.4)

def body(x):
    """the theorbo's body: air and top resonances, and nothing brittle on top"""
    y = x.copy()
    for f, q, g in ((178, 2.5, 0.55), (410, 3.0, 0.35), (760, 3.5, 0.18)):
        b, a = iirpeak(f, q, fs=SR); y += g * lfilter(b, a, x)
    return lp(hp(y, 55), 3600)

def room(x, rng):
    """a small room: two early reflections and a 1.0 s tail (200 Hz - 3.2 kHz)"""
    n = int(1.3 * SR); t = np.arange(n) / SR
    h = bp(rng.standard_normal(n), 200, 3200) * np.exp(-6.908 * t / 1.0) * np.minimum(1, t / 0.02)
    h /= np.sqrt(np.sum(h ** 2))
    wet = fftconvolve(x, h)[:len(x)]
    early = np.zeros(len(x));
    for d, g in ((0.011, 0.30), (0.023, 0.22)):
        i = int(d * SR); early[i:] += g * lp(x, 2400)[:len(x) - i]
    return x + early * 0.5 + wet * 10 ** (ROOM_DB / 20)

# ------------------------------------------------------------------------------------------------ the viol
def cello(st, clips):
    """mus_cello through rubberband at +st semitones (the chain build.py used for the old cello cues)"""
    f = os.path.join(clips, "mus_cello.mp3")
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", f, "-af",
                                   f"aresample={SR},aformat=channel_layouts=mono,rubberband=pitch={2 ** (st / 12):.6f}:transients=smooth:window=long",
                                   "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"])
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)

# ------------------------------------------------------------------------------------------------ the build
def at(L, a):
    k, which, off = a
    return L[k]["start" if which == "start" else "end"] + off

def voice_clear(v, t):
    """is the voice under -45 dBFS from 30 ms before to 60 ms after t? (the level, dBFS)"""
    s = v[int((t - 0.03) * SR):int((t + 0.06) * SR)]
    return 10 * np.log10(np.mean(s ** 2) + 1e-20)

def compose(L, v, clips, alt, force):
    t0 = at(L, CLIP_AT); t1 = at(L, CLIP_END); n = int(round((t1 - t0) * SR))
    rng = np.random.default_rng(1686)
    lute = np.zeros(n + 8 * SR); viol = np.zeros(n + 10 * SR); rows = []; bad = 0
    for anchor, notes, where, alt_notes in SCORE:
        for note, vel, dt in notes:
            if alt and note not in alt_notes: continue
            t = at(L, anchor) + dt; lvl = voice_clear(v, t); ok = lvl < -45
            bad += not ok
            rows.append((t, note, vel, where, lvl, ok))
            y = pluck(note, vel, rng, octave=(note, anchor) in OCTAVE); i = int(round((t - t0) * SR)); lute[i:i + len(y)] += y
    lute = room(body(lute), rng) * 10 ** (LUTE_DB / 20)
    c2, c26 = cello(2, clips), cello(26, clips); bows = []
    for anchor, until, g, fi, fo, dbl, in_alt in BOWS:
        if alt and not in_alt: continue
        a0 = at(L, anchor); i = int(round((a0 - t0) * SR))
        m = len(c2) if until is None else int(round((at(L, until) - a0) * SR))
        def shaped(x):
            y = x[:m].copy()
            if fi: k = int(fi * SR); y[:k] *= np.linspace(0, 1, k)
            if fo: k = int(fo * SR); y[-k:] *= np.linspace(1, 0, k)
            return y
        y = shaped(c2) * 10 ** (g / 20)
        if dbl is not None: y = y + shaped(c26)[:len(y)] * 10 ** ((g + dbl) / 20)
        viol[i:i + len(y)] += y; bows.append((a0, a0 + m / SR, g, dbl))
    out = (lute[:n] + viol[:n]) * 10 ** (CLIP_DB / 20)
    return out, t0, t1, rows, bows, bad

def write_mp3(x, path, title):
    raw = (np.clip(x, -1, 1) * 32767).astype("<i2").tobytes()
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "1", "-i", "-", "-c:a", "libmp3lame", "-b:a", "192k",
                    "-metadata", f"title={title}", "-metadata", "comment=composed and synthesised: scripts/newton/sound/make_mother.py", path], input=raw, check=True)

def fingerprint(L):
    return {k: [L[k]["start"], L[k]["end"]] for k in ("F08", "F09", "F10", "F11", "F12", "F13", "F14", "F15", "F16")}

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--clips", default="/home/user/newton_work/film/sound/clips")
    ap.add_argument("--timing", default="/home/user/newton_work/film/voice/voice_timing.json")
    ap.add_argument("--voice", default="/home/user/newton_work/film/voice/voice_48k.wav")
    ap.add_argument("--out", default=None, help="write the clips here instead of --clips (mus_cello is still read from --clips)")
    ap.add_argument("--wav", default=None, help="also write 16-bit wavs into this folder (for measuring)")
    ap.add_argument("--check", action="store_true", help="only say whether the clips in --clips were composed on this timing")
    ap.add_argument("--force", action="store_true", help="write the clip even if a plucked note lands on a word")
    a = ap.parse_args()
    L = {l["id"]: l for l in json.load(open(a.timing))["lines"]}
    out_dir = a.out or a.clips
    if a.check:
        stale = 0
        for name in ("mus_mother", "mus_mother_alt"):
            side = os.path.join(out_dir, name + ".json")
            ok = os.path.exists(side) and json.load(open(side))["lines"] == fingerprint(L)
            print(name, "fits the timing" if ok else "IS STALE (F08-F16 moved, or no sidecar): run make_mother.py again"); stale += not ok
        sys.exit(1 if stale else 0)
    v = np.frombuffer(subprocess.check_output(["ffmpeg", "-v", "error", "-i", a.voice, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"]), dtype=np.float32).astype(np.float64)
    for name, alt, title in (("mus_mother", False, "the mother music (theorbo and bass viol, D minor)"), ("mus_mother_alt", True, "the mother music, the sparser alternative (theorbo alone, then the viol)")):
        x, t0, t1, rows, bows, bad = compose(L, v, a.clips, alt, a.force)
        print(f"== {name}: {t0:.3f} .. {t1:.3f} s on the film clock = {t1 - t0:.3f} s; peak {20 * np.log10(np.abs(x).max()):.1f} dBFS")
        for t, note, vel, where, lvl, ok in rows:
            print(f"   {t:8.3f} s  f{t * 30:7.1f}  {note:4s} {hz(note):6.1f} Hz  vel {vel:.2f}  voice there {lvl:6.1f} dBFS  {'in a pause' if ok else 'ON A WORD'}   {where}")
        for b0, b1, g, dbl in bows:
            print(f"   bow {b0:8.3f} .. {b1:8.3f} s  D3 {g:+.1f} dB" + (f", D5 {g + dbl:+.1f} dB" if dbl is not None else "") + f"  (its swell is fullest about {b0 + 1.6:.2f} s)")
        if bad and not a.force: raise SystemExit(f"make_mother.py: {bad} plucked note(s) land on a word: move their anchors (or --force)")
        if np.abs(x).max() > 0.89: raise SystemExit("make_mother.py: the clip would clip: lower LUTE_DB or the bows")
        write_mp3(x, os.path.join(out_dir, name + ".mp3"), title)
        json.dump({"clip": name, "at": list(CLIP_AT), "until": list(CLIP_END), "seconds": round(t1 - t0, 4), "lines": fingerprint(L),
                   "notes": [[round(t, 3), note, vel] for t, note, vel, *_ in rows], "bows": [[round(b0, 3), round(b1, 3), g, dbl] for b0, b1, g, dbl in bows]},
                  open(os.path.join(out_dir, name + ".json"), "w"), indent=1, ensure_ascii=False)
        print("   wrote", os.path.join(out_dir, name + ".mp3"))
        if a.wav:
            import soundfile as sf
            sf.write(os.path.join(a.wav, name + ".wav"), x.astype(np.float32), SR, subtype="PCM_16")

if __name__ == "__main__":
    main()
