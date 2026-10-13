"""Voice step: one TTS clip per line, then timings for every line and keyword.

Writes public/audio/voice.wav and src/timeline.json. Swap `tts()` for a production
voice (cloned voice, Azure, ByteDance, CosyVoice...) without touching anything else.
Keyword timing is estimated from the line's voiced span (Mandarin is ~1 syllable per
character); a real forced aligner (WhisperX, MFA) can replace `key_time()`.
"""
import json, subprocess, sys, urllib.parse, urllib.request, wave, pathlib
import numpy as np

ROOT = pathlib.Path(__file__).resolve().parent.parent
SR = 48000
TEMPO = 1.18          # the free voice reads slowly
GAP = 0.32            # breath between lines (s)
LEAD = 0.6            # silence before the first line
TAIL = 2.4            # hold after the last line

def tts(text, out):
    q = urllib.parse.quote(text)
    url = f"https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=zh-CN&q={q}"
    out.write_bytes(urllib.request.urlopen(url, timeout=30).read())

def load(mp3):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(mp3), "-af",
        f"atempo={TEMPO},highpass=f=90,acompressor=threshold=-20dB:ratio=3:attack=5:release=80",
        "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()

def voiced_span(x, thr_db=-38):
    win = int(0.01 * SR)
    n = len(x) // win
    rms = np.sqrt((x[: n * win].reshape(n, win) ** 2).mean(1) + 1e-12)
    db = 20 * np.log10(rms / (rms.max() + 1e-12))
    idx = np.where(db > thr_db)[0]
    return idx[0] * win / SR, (idx[-1] + 1) * win / SR

def key_time(text, key, a, b):
    chars = [c for c in text if c not in "，。：；、《》！？「」"]
    pos = text.find(key)
    before = len([c for c in text[:pos] if c not in "，。：；、《》！？「」"])
    pauses = sum(1 for c in text[:pos] if c in "，：；")
    span = b - a
    unit = span / (len(chars) + 0.6 * text.count("，") + 0.6 * text.count("："))
    return a + (before + 0.6 * pauses) * unit

def main():
    script = json.loads((ROOT / "lines.json").read_text())
    cache = ROOT / "tools" / "tts_cache"; cache.mkdir(exist_ok=True)
    out, t, timeline = [np.zeros(int(LEAD * SR), np.float32)], LEAD, []
    for i, line in enumerate(script["lines"]):
        mp3 = cache / f"{i:02d}.mp3"
        if not mp3.exists():
            tts(line["text"], mp3)
        x = load(mp3)
        a, b = voiced_span(x)
        x = x[int(a * SR): int(b * SR) + int(0.05 * SR)]
        dur = len(x) / SR
        k = key_time(line["text"], line["key"], 0, dur)
        timeline.append({"start": round(t, 3), "end": round(t + dur, 3), "key": round(t + k, 3)})
        out += [x, np.zeros(int(GAP * SR), np.float32)]
        t += dur + GAP
    out.append(np.zeros(int(TAIL * SR), np.float32))
    y = np.concatenate(out)
    y = y / (np.abs(y).max() + 1e-9) * 0.89
    with wave.open(str(ROOT / "public/audio/voice.wav"), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((y * 32767).astype("<i2").tobytes())
    total = len(y) / SR
    (ROOT / "src/timeline.json").write_text(json.dumps({"duration": round(total, 3), "lines": timeline}, indent=1))
    print(f"voice {total:.2f}s")
    for l, tl in zip(script["lines"], timeline):
        print(f'{tl["start"]:6.2f} {tl["key"]:6.2f} {tl["end"]:6.2f}  {l["text"]}  [{l["key"]}]')

if __name__ == "__main__":
    main()
