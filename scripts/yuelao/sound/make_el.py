#!/usr/bin/env python3
"""采访月老的一天 v7: the music and sound effects made with ElevenLabs (the owner, 28 Nov 2026: "sound generate using Eleven
labs"), rebuilt anywhere from the voice farm's SEALED outputs. The repo is public, so the farm encrypts every file it makes
for the keys the request lists and deletes the plain ones (voice-farm vault.py, "seal_rsa"): <name>.mp3.aes is the file
under AES-256-CBC, <name>.mp3.k0, .k1 ... its key and iv wrapped with RSA-OAEP for each key. Only a machine holding one of
the private keys can open them: the Mac studio (~/Claude/keys/yuelao_sound.pem) and the cloud workspace.

  make_el.py fetch <el.json> <runs root>              git fetch the farm branches el.json names (run from a clone of
                                                      jayjiao-debug/video); their sealed files go under <runs root>/<branch>/
  make_el.py open <el.json> <runs root> <opened dir>  open every file with the private key $YL_SOUND_KEY (default
                                                      ~/Claude/keys/yuelao_sound.pem): openssl only (pkeyutl OAEP, else
                                                      rsautl -oaep; then enc -d -aes-256-cbc), so a Mac's LibreSSL does it
  make_el.py clips <el.json> <opened dir> <clips dir> the clip files the cues name (mp3, 48 kHz mono, what the kit's
                                                      build.py plays): a BED is its loop from the generated piece, joined
                                                      end to start with equal-power crossfades of "xf" s until it is "len" s
                                                      long (one static gain, never automated: the owner's rule); a HIT is
                                                      the stretch "in" .. "in" + "len" of a pack, with 4 ms fades ("fo": a longer fade-out)
el.json: {"runs": {branch: [file stem, ...]}, "clips": {clip: {"src", "in", "len", "fo"?} | {"src", "loop": [t0, t1], "len", "xf",
"head": [h0, t1]?, "tail": t?, "xf_curve": "gain"?}}} (a bed with "tail" plays its head, then the music from t0 on to t once:
an ending; "xf_curve": "gain" = linear crossfades, for music, whose two sides of a joint are alike). Needs python3 with numpy, ffmpeg, openssl, git."""
import json, os, subprocess, sys, tempfile
import numpy as np
SR = 48000

def load(f):
    return np.frombuffer(subprocess.check_output(["ffmpeg", "-v", "error", "-i", f, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"]), np.float32).copy()

def save_mp3(y, f):
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-c:a", "libmp3lame", "-b:a", "256k", f],
                   input=np.clip(y, -1, 1).astype(np.float32).tobytes(), check=True)

def fetch(spec, root):
    for b, stems in spec["runs"].items():
        subprocess.run(["git", "fetch", "-q", "origin", f"refs/heads/{b}:refs/remotes/origin/{b}"], check=True)
        names = subprocess.check_output(["git", "ls-tree", "--name-only", f"origin/{b}"], text=True).split()
        d = os.path.join(root, b); os.makedirs(d, exist_ok=True)
        for s in stems:
            got = [n for n in names if n.startswith(s + ".mp3.")]
            if not any(n.endswith(".aes") for n in got): raise SystemExit(f"make_el: {b} has no sealed {s}.mp3 (files: {', '.join(names)[:300]})")
            for n in got:
                with open(os.path.join(d, n), "wb") as fh: fh.write(subprocess.check_output(["git", "show", f"origin/{b}:{n}"]))
        print(f"make_el: fetched {len(stems)} sealed files from {b}")

def unwrap(key, kfile):
    """the 48-byte key + iv from one wrapped copy, or None if this private key is not the one it was wrapped for"""
    with tempfile.NamedTemporaryFile(delete=False) as t: out = t.name
    try:
        for cmd in (["openssl", "pkeyutl", "-decrypt", "-inkey", key, "-pkeyopt", "rsa_padding_mode:oaep", "-in", kfile, "-out", out],
                    ["openssl", "rsautl", "-decrypt", "-oaep", "-inkey", key, "-in", kfile, "-out", out]):
            if subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode == 0:
                kiv = open(out, "rb").read()
                if len(kiv) == 48: return kiv
        return None
    finally: os.remove(out)

def open_all(spec, root, out):
    key = os.path.expanduser(os.environ.get("YL_SOUND_KEY", "~/Claude/keys/yuelao_sound.pem"))
    if not os.path.exists(key): raise SystemExit(f"make_el: no private key at {key} (set YL_SOUND_KEY)")
    os.makedirs(out, exist_ok=True)
    for b, stems in spec["runs"].items():
        d = os.path.join(root, b)
        for s in stems:
            kiv = None; i = 0
            while kiv is None and os.path.exists(os.path.join(d, f"{s}.mp3.k{i}")):
                kiv = unwrap(key, os.path.join(d, f"{s}.mp3.k{i}")); i += 1
            if kiv is None: raise SystemExit(f"make_el: {s} was not sealed for the key {key}")
            subprocess.run(["openssl", "enc", "-d", "-aes-256-cbc", "-K", kiv[:32].hex(), "-iv", kiv[32:].hex(),
                            "-in", os.path.join(d, f"{s}.mp3.aes"), "-out", os.path.join(out, f"{s}.mp3")], check=True)
        print(f"make_el: opened {len(stems)} files of {b}")

def bed(x, c):
    """the loop x[t0:t1] (after an optional head that ends at t1) joined to itself with equal-power crossfades of "xf" s
    until it is c["len"] s long. Each crossfade overlaps t1 .. t1 + xf with t0 .. t0 + xf (the same place in the music),
    so the loop's period is exactly t1 - t0 and the beat never slips. A head [h0, h1] must end at t1 (h1 = t1); a last
    pass may run on past t1 to the piece's own ending ("tail": the time it stops, instead of t1)."""
    t0, t1 = c["loop"]; xf = int(c.get("xf", 0.25) * SR); n = int(round(c["len"] * SR)); i0, i1 = int(t0 * SR), int(t1 * SR)
    if i1 - i0 < 2 * xf: raise SystemExit("make_el: a bed loop shorter than two crossfades")
    if c.get("head"):
        h0, h1 = c["head"]
        if abs(h1 - t1) > 1e-6: raise SystemExit("make_el: a bed's head must end where its loop ends (h1 = t1)")
        out = x[int(h0 * SR): i1 + xf].copy()
    else: out = x[i0: i1 + xf].copy()
    if c.get("xf_curve") == "gain":   # music loops: the two sides are the same place in the music (correlated), so a linear
        fin = np.linspace(0, 1, xf, dtype=np.float32); fout = 1 - fin   # (equal-gain) crossfade keeps the level; equal power would bump it up to 3 dB
    else:                             # room tones: unrelated noise on the two sides, so equal power keeps the level
        k = np.linspace(0, np.pi / 2, xf, dtype=np.float32); fin, fout = np.sin(k), np.cos(k)
    while len(out) - xf < n:
        tail = int(c["tail"] * SR) if c.get("tail") else i1 + xf
        nxt = x[i0: tail].copy()
        out[-xf:] = out[-xf:] * fout + nxt[:xf] * fin
        out = np.concatenate([out, nxt[xf:]])
        if c.get("tail"): break
    return out[:n]

def clips(spec, opened, dst):
    os.makedirs(dst, exist_ok=True); cache = {}
    for name, c in spec["clips"].items():
        if c["src"] not in cache: cache[c["src"]] = load(os.path.join(opened, c["src"] + ".mp3"))
        x = cache[c["src"]]
        if "loop" in c: y = bed(x, c)
        else:
            y = x[int(c["in"] * SR): int((c["in"] + c["len"]) * SR)].copy(); f = min(len(y) // 2, int(0.004 * SR))
            if f: y[:f] *= np.linspace(0, 1, f); y[-f:] *= np.linspace(1, 0, f)
            fo = min(len(y), int(c.get("fo", 0) * SR))   # "fo": a longer fade-out for a hit cut inside its ring (the thread's twang)
            if fo: y[-fo:] *= np.linspace(1, 0, fo) ** 2
        y = y * (10 ** (c.get("gain", 0.0) / 20))
        save_mp3(y, os.path.join(dst, name + ".mp3"))
    print(f"make_el: {len(spec['clips'])} clips in {dst}")

if __name__ == "__main__":
    cmd, spec = sys.argv[1], json.load(open(sys.argv[2]))
    {"fetch": lambda: fetch(spec, sys.argv[3]), "open": lambda: open_all(spec, sys.argv[3], sys.argv[4]), "clips": lambda: clips(spec, sys.argv[3], sys.argv[4])}[cmd]()
