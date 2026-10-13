"""Case 01 voice: one TTS clip per line (placeholder voice), timings to timeline.json.
A line with "hold" gets that many seconds of silence after it (the pause-and-guess beat)."""
import json, sys, wave, pathlib
import numpy as np
HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / "tools"))
import voice
voice.TEMPO = 1.38
from voice import tts, load, voiced_span, key_time, SR

GAP, LEAD, TAIL = 0.28, 1.4, 1.6

VOICE = {"N": (1.0, 1.0), "B": (0.86, 0.95), "S": (1.16, 1.0), "P": (1.06, 1.08)}   # pitch, speed


def voice_of(x, who):
    """Cheap character voices from the one TTS voice: resample for pitch, then
    time-stretch back so only the pitch (and a little pace) changes."""
    p, sp = VOICE[who]
    if p == 1.0 and sp == 1.0:
        return x
    import subprocess
    raw = subprocess.run(["ffmpeg", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-",
                          "-af", f"asetrate={int(SR * p)},aresample={SR},atempo={sp / p:.4f}",
                          "-f", "f32le", "-"], input=x.astype(np.float32).tobytes(), capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()


def main():
    lines = json.loads((HERE / "lines.json").read_text())
    cache = HERE / "tts_cache"; cache.mkdir(exist_ok=True)
    out, t, tl = [np.zeros(int(LEAD * SR), np.float32)], LEAD, []
    for i, ln in enumerate(lines):
        mp3 = cache / f"{i:02d}_{abs(hash(ln['t'])) % 10**8}.mp3"
        if not mp3.exists():
            tts(ln["t"], mp3)
        x = load(mp3)
        x = voice_of(x, ln.get("w", "N"))
        a, b = voiced_span(x)
        x = x[int(a * SR): int(b * SR) + int(0.05 * SR)]
        dur = len(x) / SR
        k = key_time(ln["t"], ln["k"], 0, dur)
        tl.append({"start": round(t, 3), "end": round(t + dur, 3), "key": round(t + k, 3)})
        gap = GAP + ln.get("hold", 0)
        out += [x, np.zeros(int(gap * SR), np.float32)]
        t += dur + gap
    out.append(np.zeros(int(TAIL * SR), np.float32))
    y = np.concatenate(out)
    y = y / (np.abs(y).max() + 1e-9) * 0.89
    with wave.open(str(HERE / "audio/voice.wav"), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((y * 32767).astype("<i2").tobytes())
    total = len(y) / SR
    (HERE / "timeline.json").write_text(json.dumps({"duration": round(total, 3), "lines": tl}, indent=1))
    print(f"voice {total:.2f}s")
    for ln, x in zip(lines, tl):
        print(f'{x["start"]:6.2f} {x["key"]:6.2f} {x["end"]:6.2f}  {ln["t"]}')

if __name__ == "__main__":
    main()
