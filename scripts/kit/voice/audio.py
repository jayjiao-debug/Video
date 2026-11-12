"""Small audio helpers for a film's narration (numpy + the ffmpeg binary): decode, wav in / out, the level envelope.
First written for Hongmen (scripts/hongmen/voice/hmaudio.py is now this module under its old name). README.md here."""
import subprocess, wave, os, re
import numpy as np

SR = 44100
RAW = os.environ.get("HM_VOICE_RAW", "raw")       # the folder with the delivered clips (<name>.mp3) and report.json
WORK = os.environ.get("HM_VOICE_WORK", "work")    # scratch: decoded clips, speed-up in / out files


def configure(raw, work):
    """set the two folders (the assembler's --raw and --work)"""
    global RAW, WORK
    RAW, WORK = raw, work
cjk = lambda s: len(re.findall(r"[一-鿿]", s))
strip = lambda s: re.sub(r"[^一-鿿]", "", s)


def run(*a):
    subprocess.run(["ffmpeg", "-y", "-v", "error", *a], check=True)


def decode(name):
    """raw/<name>.mp3 -> float mono array at SR (cached as work/dec/<name>.wav)"""
    os.makedirs(WORK + "/dec", exist_ok=True)
    w = f"{WORK}/dec/{name}.wav"
    if not os.path.exists(w):
        run("-i", f"{RAW}/{name}.mp3", "-ar", str(SR), "-ac", "1", "-c:a", "pcm_s16le", w)
    return read_wav(w)


def read_wav(p):
    with wave.open(p, "rb") as f:
        assert f.getframerate() == SR and f.getnchannels() == 1, (p, f.getframerate(), f.getnchannels())
        sw = f.getsampwidth()
        raw = f.readframes(f.getnframes())
    if sw == 2:
        return np.frombuffer(raw, dtype="<i2").astype(np.float64) / 32768.0
    if sw == 3:
        b = np.frombuffer(raw, dtype=np.uint8).reshape(-1, 3).astype(np.int32)
        v = b[:, 0] | (b[:, 1] << 8) | (b[:, 2] << 16)
        v = np.where(v >= 1 << 23, v - (1 << 24), v)
        return v.astype(np.float64) / (1 << 23)
    raise ValueError(sw)


def write_wav(p, x, bits=24):
    x = np.clip(x, -1.0, 1.0)
    with wave.open(p, "wb") as f:
        f.setnchannels(1); f.setframerate(SR)
        if bits == 16:
            f.setsampwidth(2); f.writeframes((x * 32767.0).round().astype("<i2").tobytes())
        else:
            f.setsampwidth(3)
            v = (x * 8388607.0).round().astype(np.int32)
            b = np.empty((len(v), 3), dtype=np.uint8)
            b[:, 0] = v & 255; b[:, 1] = (v >> 8) & 255; b[:, 2] = (v >> 16) & 255
            f.writeframes(b.tobytes())


HOP = 0.002      # envelope hop, s
WIN = 0.010      # envelope window, s


def env_db(x):
    """RMS level in dBFS, one value every HOP seconds (window WIN centred on the hop)"""
    w = int(SR * WIN)
    c = np.concatenate([[0.0], np.cumsum(x * x)])
    n = int(len(x) / (SR * HOP)) + 1
    mid = np.round(np.arange(n) * SR * HOP).astype(np.int64)      # value i is at exactly i * HOP seconds
    a = np.clip(mid - w // 2, 0, len(x)); b = np.clip(mid + w // 2, 0, len(x))
    ms = (c[b] - c[a]) / np.maximum(1, b - a)
    return 10 * np.log10(ms + 1e-12)


def runs_below(e, thr, min_s):
    """[(start s, end s)] of stretches where the envelope stays below thr for at least min_s"""
    out, i, n = [], 0, len(e)
    while i < n:
        if e[i] < thr:
            j = i
            while j < n and e[j] < thr: j += 1
            if (j - i) * HOP >= min_s: out.append((i * HOP, j * HOP))
            i = j
        else: i += 1
    return out
