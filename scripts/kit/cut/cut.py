#!/usr/bin/env python3
"""The driver behind make_cut.sh (read scripts/kit/cut/README.md first). Any film with a kit.json: make_cut.sh passes
its path as $KIT_CONFIG.

Three layers -> one mp4:
  pic   the 3D picture with the film's post chain, drawn by the preview harness (preview/film_cut.ts) in short chunks
        through scripts/kit/queue/still.sh (the machine-wide render queue)
  ov    the DOM layers (HUD, Pose.overlays, caption, Pose.top) as transparent PNGs, drawn by Remotion with the input
        prop "ovonly" from a bundle made once per source state, in short chunks through the same queue
        (scripts/kit/queue/q.sh)
  snd   the sound engineer's mix, rebuilt right before the mux (kit.json sound.build, into the cut's own
        folder) and put on with kit.json sound.mux (scripts/kit/sound/mux.sh) (no padding, no trimming)
Everything is resumable: manifest.json records for each chunk the hash of the sources its frames were made from
(deps.mjs: esbuild's import graph per segment) and which frames exist with that hash. A chunk is rendered only for the
frames that are missing or were made from other sources.
Nothing is written into the repo; all outputs live under $HM_CUT_DIR (default: kit.json cut.dir).
"""
import argparse
import fcntl
import json
import os
import re
import shutil
import subprocess
import sys
import threading
import time
import wave
from concurrent.futures import ThreadPoolExecutor

HERE = os.path.dirname(os.path.abspath(__file__))
LIVE = os.path.abspath(os.path.join(HERE, "../../.."))
REPO = os.path.abspath(os.environ.get("HM_CUT_REPO") or LIVE)      # the tree the film is read from (a frozen copy: make_cut.sh --freeze)
if not os.environ.get("KIT_CONFIG"):
    sys.exit("cut.py: no film config: run it through make_cut.sh --film <name> (or --config <kit.json>)")
CFG = json.load(open(os.environ["KIT_CONFIG"], encoding="utf8"))        # the film's kit.json (KIT.md)
ENT = CFG["entries"]
FILM = os.path.join(REPO, CFG["dir"])
FINAL = os.environ.get("HM_CUT_DIR", CFG["cut"]["dir"])
# the queue scripts of the LIVE repo, never the frozen copy's (the copy has no node_modules of its own to cd into)
STILL = os.environ.get("HM_STILL", os.path.join(LIVE, "scripts/kit/queue/still.sh"))
QSH = os.environ.get("HM_QSH", os.path.join(LIVE, "scripts/kit/queue/q.sh"))   # the machine-wide render queue: EVERY locked job goes through it
HS = os.environ.get("KIT_CHROME", "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell")
FONT = os.path.join(REPO, "public/bt/sans700.ttf")
COMP = CFG["composition"]
CUT_NAME = CFG["cut"]["name"]
FILM_W, FILM_H = CFG.get("size", [1080, 1920])
FPS = 30                    # set from story.ts by deps() (the timeline deps.mjs evaluates)
# measured in this container (x_cut.md): seconds a frame, and the seconds a job needs before its first frame
PIC_SPF = float(os.environ.get("HM_CUT_PIC_SPF", "2.4"))     # 1.9 (privy, quiet machine) .. 3.1 (tent, busy machine)
PIC_START = 16.0                                            # bundle, browser, world, the first frame's shader compile
OV_SPF = float(os.environ.get("HM_CUT_OV_SPF", "0.15"))
OV_START = 20.0
OV_CHUNK_MAX = 300
LOCK_BUDGET = 90.0          # the longest a job of ours should hold the render lock (seconds)
PRIORITY = False            # --priority (the director's call): picture chunks jump the render queue
SOUND_DIR = os.path.join(FINAL, "sound")     # the rebuilt mix (a range builds into sound_range/, so that it never touches the film's)
MLOCK = threading.RLock()   # the manifest, deps.json and the counters: one thread at a time

BUILD = os.path.join(FINAL, "build")
LOGS = os.path.join(FINAL, "log")
MANIFEST = os.path.join(FINAL, "manifest.json")
DEPS = os.path.join(BUILD, "deps.json")
BUNDLE = os.path.join(BUILD, "bundle")
BUNDLE_STAMP = os.path.join(BUILD, "bundle.stamp.json")


LENS_MODE = os.path.join(FINAL, "build", "lens.mode")


def lens_mode(arg):
    """--lens auto | on, or (file) what build/lens.mode says right now"""
    if arg != "file":
        return arg
    try:
        return "auto" if open(LENS_MODE).read().strip() == "auto" else "on"
    except OSError:
        return "on"


def say(msg):
    print(time.strftime("%H:%M:%S ") + msg, flush=True)


def sh(cmd, **kw):
    return subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, **kw)


def ranges(frames):
    """[1,2,3,7,8] -> '1-3,7-8'"""
    out, fs = [], sorted(frames)
    i = 0
    while i < len(fs):
        j = i
        while j + 1 < len(fs) and fs[j + 1] == fs[j] + 1:
            j += 1
        out.append(str(fs[i]) if i == j else f"{fs[i]}-{fs[j]}")
        i = j + 1
    return ",".join(out) if out else "-"


def expand(text):
    """'1-3,7' -> {1, 2, 3, 7}"""
    out = set()
    for part in (text or "").split(","):
        part = part.strip()
        if not part or part == "-":
            continue
        if "-" in part:
            lo, hi = part.split("-")
            out.update(range(int(lo), int(hi) + 1))
        else:
            out.add(int(part))
    return out


# ------------------------------------------------------------------------------------------------ manifest
def load_manifest():
    if os.path.exists(MANIFEST):
        with open(MANIFEST) as f:
            return json.load(f)
    return {"version": 1, "pic": {}, "ov": {}}


def save_manifest(m):
    tmp = MANIFEST + ".tmp"
    with open(tmp, "w") as f:
        json.dump(m, f, indent=1)
    os.replace(tmp, MANIFEST)


# ------------------------------------------------------------------------------------------------ sources
def deps(pic_entry=None):
    """runs deps.mjs; returns its json (hashes per segment and layer, the timeline, the ink modules, the chain check)"""
    os.makedirs(BUILD, exist_ok=True)
    cmd = ["node", os.path.join(HERE, "deps.mjs"), DEPS]
    if pic_entry:
        cmd += ["--pic-entry", pic_entry]
    with MLOCK:
        r = sh(cmd, cwd=REPO, env=dict(os.environ, HM_CUT_REPO=REPO))
        if r.returncode != 0:
            raise RuntimeError("deps.mjs failed: " + r.stdout[-800:])
        with open(DEPS) as f:
            d = json.load(f)
    if "total" not in d:
        raise RuntimeError("story.ts could not be evaluated (the film's length is unknown): " + d.get("timelineError", "?"))
    global FPS
    FPS = int(d.get("fps", FPS))
    return d


def seg_ids(d):
    """the film's segment ids in order (from story.ts SEGMENTS, through deps.json)"""
    return [g["id"] for g in d["segs"]]


def pic_entry_for(d):
    """the picture entry: preview/film_cut.ts, or (when Film.tsx imports its ink pass from another module than
    film_cut.ts does) a generated copy with Film.tsx's own import lines, outside the repo"""
    if d["ink"]["same"]:
        return os.path.join(FILM, ENT["pic"]), None
    src = open(os.path.join(FILM, ENT["overlay"])).read()
    lines = []
    for m in re.finditer(r"^import\s*\{([^}]*)\}\s*from\s*[\"']([^\"']+)[\"'];?\s*$", src, re.M):
        names = [n.strip() for n in m.group(1).split(",")]
        keep = [n for n in names if n.split(" as ")[0].strip() in ("InkPass", "noInkFallback")]
        if keep:
            lines.append("import { %s } from %s;" % (", ".join(keep), json.dumps(os.path.normpath(os.path.join(FILM, m.group(2))))))
    if not any("InkPass" in l for l in lines):
        raise RuntimeError("Film.tsx no longer imports a class named InkPass: port the change to preview/film_cut_core.ts by hand")
    if not any("noInkFallback" in l for l in lines):
        lines.append("import { noInkFallback } from %s;" % json.dumps(os.path.join(REPO, "src/videos/vasa/ink")))
    ent = os.path.join(BUILD, "entry", "film_cut_ink.ts")
    os.makedirs(os.path.dirname(ent), exist_ok=True)
    body = "// GENERATED by scripts/kit/cut/cut.py: %s with the ink imports of %s as it is now\n" % (ENT["pic"], ENT["overlay"])
    body += "\n".join(lines) + "\n"
    body += "import { runCut } from %s;\n" % json.dumps(os.path.join(FILM, ENT.get("picCore", "preview/film_cut_core")))
    ids = [g["id"] for g in d["segs"]]
    for s in ids:
        body += "import { SEG as SEG_%s } from %s;\n" % (s, json.dumps(os.path.join(FILM, ENT["segFile"].replace("{SEG}", s))))
    body += "runCut({ InkPass, noInkFallback } as any, [%s]);\n" % ", ".join("SEG_" + s for s in ids)
    if not os.path.exists(ent) or open(ent).read() != body:
        with open(ent, "w") as f:
            f.write(body)
    return ent, "Film.tsx imports its ink pass from %s, preview/film_cut.ts from %s: rendering through the generated entry %s" % (d["ink"]["film"], d["ink"]["cut"], ent)


# ------------------------------------------------------------------------------------------------ the plan
class Layer:
    def __init__(self, name, chunk, settings, pattern, folder):
        self.name, self.chunk, self.settings, self.pattern, self.dir = name, chunk, settings, pattern, folder

    def path(self, f):
        return os.path.join(self.dir, self.pattern % f)

    def key(self, seg_hash):
        return f"{seg_hash}|{self.settings}"

    def chunks(self, d):
        """fixed grid: every segment is cut into chunks of self.chunk frames from its first frame"""
        out = []
        for s in d["segs"]:
            a, k = s["from"], 0
            while a <= s["to"]:
                b = min(a + self.chunk - 1, s["to"])
                out.append({"id": "%s.%03d" % (s["id"], k), "seg": s["id"], "from": a, "to": b})
                a, k = b + 1, k + 1
        return out

    def done(self, man, key):
        return expand(man[self.name].get("done", {}).get(key, ""))

    def todo(self, man, d, c, A, B, force):
        """frames of chunk c inside [A, B] that are missing or were made from other sources"""
        h = d[self.name][c["seg"]].get("hash")
        fs = list(range(max(c["from"], A), min(c["to"], B) + 1))
        if force or h is None:
            return fs
        done = self.done(man, self.key(h))
        return [f for f in fs if f not in done or not os.path.exists(self.path(f))]

    def record(self, man, c, key, frames, secs, extra=None):
        """the frames now exist, made from the sources `key`: they leave every other key's list"""
        with MLOCK:
            self._record(man, c, key, frames, secs, extra)

    def _record(self, man, c, key, frames, secs, extra=None):
        lay = man[self.name]
        done = lay.setdefault("done", {})
        fs = set(frames)
        for k in list(done):
            if k != key:
                rest = expand(done[k]) - fs
                if rest:
                    done[k] = ranges(rest)
                else:
                    del done[k]
        done[key] = ranges(expand(done.get(key, "")) | fs)
        rec = {"seg": c["seg"], "from": c["from"], "to": c["to"], "hash": key.split("|")[0], "rendered": ranges(frames),
               "at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "secs": round(secs, 1)}
        if extra:
            rec.update(extra)
        lay.setdefault("chunks", {})[c["id"]] = rec
        save_manifest(man)

    def state(self, man, d, A, B):
        """(current, stale, missing) frame lists for [A, B]"""
        cur, stale, miss = [], [], []
        for s in d["segs"]:
            h = d[self.name][s["id"]].get("hash")
            done = self.done(man, self.key(h)) if h is not None else set()
            for f in range(max(s["from"], A), min(s["to"], B) + 1):
                if not os.path.exists(self.path(f)):
                    miss.append(f)
                elif f in done:
                    cur.append(f)
                else:
                    stale.append(f)
        return cur, stale, miss


def png_ok(path, w, h):
    """a complete PNG of the right size (reads the header and the end marker, not the pixels)"""
    try:
        with open(path, "rb") as f:
            head = f.read(24)
            f.seek(-12, os.SEEK_END)
            tail = f.read(12)
        if head[:8] != b"\x89PNG\r\n\x1a\n" or tail[4:8] != b"IEND":
            return False
        return int.from_bytes(head[16:20], "big") == w and int.from_bytes(head[20:24], "big") == h
    except OSError:
        return False


# ------------------------------------------------------------------------------------------------ picture
def render_pic(L, c, todo, entry, size, logf, ink=8, lens="auto"):
    """one chunk of picture frames through still.sh. Returns (ok, seconds in the page, message)"""
    w, h = size
    tmp = os.path.join(BUILD, "tmp", "pic_" + c["id"].replace(".", "_"))
    shutil.rmtree(tmp, ignore_errors=True)
    opts = {"f": todo[0], "font": FONT}
    if ink != 8:
        opts["inksamples"] = ink
    if lens == "auto":
        opts["lens"] = "auto"
    env = dict(os.environ, HM_RENDER_KIND="cut")       # q.sh's class: the director's policy file decides when the cut's jobs run
    # the queue's cost in tenths of a second (q.sh reads HM_RENDER_COST). An HM_RENDER_COST the caller set (the
    # director, for the full film) is passed on as it is; --priority = 0; otherwise this chunk's true time.
    if "HM_RENDER_COST" not in os.environ:
        env["HM_RENDER_COST"] = "0" if PRIORITY else str(int((PIC_START + len(todo) * PIC_SPF * (w * h) / (540 * 960)) * 10))
    cmd = [STILL, entry, tmp, "--pick", ",".join(map(str, todo)), "--size", f"{w}x{h}", "--timeout", "100", "--opts", json.dumps(opts)]
    t0 = time.time()
    first = None
    lines = []
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, env=env, cwd=REPO)
    for line in p.stdout:
        if first is None:
            first = time.time()
        lines.append(line.rstrip("\n"))
    rc = p.wait()
    t1 = time.time()
    with open(logf, "a") as f:
        f.write(f"\n==== pic {c['id']} frames {ranges(todo)}  rc {rc}  waited+ran {t1 - t0:.0f} s\n" + "\n".join(lines) + "\n")
    bad = [l for l in lines if re.search(r"pageerror|render failed|PREVIEW FAILED|SHADER ERROR", l)]
    missing = [f for f in todo if not png_ok(os.path.join(tmp, "f%04d.png" % f), w, h)]
    if rc != 0 or bad or missing:
        why = (bad[0] if bad else f"exit code {rc}" if rc else f"{len(missing)} frame(s) not written") [:300]
        return False, 0.0, why
    T = [re.search(r"QA: T f(\d+) pose (\d+) draw (\d+)", l) for l in lines]
    T = [(int(m.group(2)), int(m.group(3))) for m in T if m]
    page = (t1 - first) if first else 0.0
    qa = [l for l in lines if re.search(r"QA: f\d+ seg .* \| #", l)]
    if qa:
        with open(os.path.join(LOGS, "qa_figures.txt"), "a") as f:
            f.write("\n".join(qa) + "\n")
    os.makedirs(L.dir, exist_ok=True)
    return True, page, {"tmp": tmp, "pose_ms": round(sum(a for a, _ in T) / max(len(T), 1)), "draw_ms": round(sum(b for _, b in T) / max(len(T), 1))}


# ------------------------------------------------------------------------------------------------ overlays
def ensure_bundle(d, logf):
    """the Remotion bundle of the film as the sources are now; returns the ov hashes it was made from, or None"""
    want = {s: d["ov"][s].get("hash") for s in seg_ids(d)}
    if os.path.exists(BUNDLE_STAMP) and os.path.exists(os.path.join(BUNDLE, "index.html")):
        have = json.load(open(BUNDLE_STAMP))
        if have == want:
            return have
    if any(v is None for v in want.values()):
        return None                                  # a source file is broken right now: no bundle can be made
    for attempt in range(3):
        say(f"[ov] bundling the film for Remotion (about 20 s, no render lock) ...")
        t0 = time.time()
        tmp = BUNDLE + ".new"
        shutil.rmtree(tmp, ignore_errors=True)
        r = sh(["npx", "remotion", "bundle", "src/index.ts", "--out-dir=" + tmp, "--log=error"], cwd=REPO)
        with open(logf, "a") as f:
            f.write(f"\n==== bundle rc {r.returncode} {time.time() - t0:.0f} s\n{r.stdout[-3000:]}\n")
        if r.returncode != 0 or not os.path.exists(os.path.join(tmp, "index.html")):
            say("[ov] the bundle failed: " + (r.stdout.strip().splitlines() or ["?"])[-1][:200])
            return None
        d2 = deps(d.get("_pic_entry_arg"))
        now = {s: d2["ov"][s].get("hash") for s in seg_ids(d2)}
        if now == want:
            shutil.rmtree(BUNDLE, ignore_errors=True)
            os.replace(tmp, BUNDLE)
            json.dump(want, open(BUNDLE_STAMP, "w"))
            say(f"[ov] bundle ready in {time.time() - t0:.0f} s")
            return want
        say("[ov] the sources changed while bundling; again")
        want = now
        if any(v is None for v in want.values()):
            return None
    return None


def render_ov(L, c, a, b, scale, logf):
    """frames a..b of the overlay layer (transparent PNGs). Returns (ok, seconds, message | tmp dir)"""
    tmp = os.path.join(BUILD, "tmp", "ov_" + c["id"].replace(".", "_"))
    shutil.rmtree(tmp, ignore_errors=True)
    props = os.path.join(BUILD, "ovonly.props.json")
    if not os.path.exists(props):
        json.dump({"ovonly": True}, open(props, "w"))
    got = tmp + "_lock_at"
    os.makedirs(os.path.dirname(got), exist_ok=True)
    # through the queue (q.sh <cost in tenths of a second> <command>; the first in line takes the render lock), never a
    # raw flock: that would jump everybody's queue. The small bash wrapper notes when the lock became ours.
    cost = int((OV_START + (b - a + 1) * OV_SPF) * 10)
    cmd = [QSH, str(cost), "bash", "-c", 'date +%s.%N > "$1"; shift; exec "$@"', "_", got,
           "npx", "remotion", "render", BUNDLE, COMP, tmp, "--sequence", "--image-format=png", f"--frames={a}-{b}",
           "--props=" + props, f"--scale={scale}", "--gl=swangle", "--concurrency=1", "--browser-executable=" + HS,
           "--timeout=600000", "--log=error"]
    t0 = time.time()
    r = sh(cmd, cwd=REPO, env=dict(os.environ, HM_RENDER_KIND="cut"))
    t1 = time.time()
    with open(logf, "a") as f:
        f.write(f"\n==== ov {c['id']} frames {a}-{b}  rc {r.returncode}  waited+ran {t1 - t0:.0f} s\n{r.stdout[-4000:]}\n")
    if r.returncode != 0:
        ls = r.stdout.strip().splitlines() or ["?"]
        return False, 0.0, next((l for l in ls if "Error" in l), ls[-1])[:300]
    try:
        held = t1 - float(open(got).read().strip())           # from the moment the lock was ours
    except (OSError, ValueError):
        held = t1 - t0
    return True, held, tmp


def collect_ov(tmp, a, b, w, h):
    """Remotion names a sequence element-<frame>.png, the number zero padded; returns {frame: path} or None"""
    found = {}
    for n in os.listdir(tmp):
        m = re.match(r"element-(\d+)\.png$", n)
        if m:
            found[int(m.group(1))] = os.path.join(tmp, n)
    want = list(range(a, b + 1))
    if all(f in found for f in want):
        pass
    elif all(f in found for f in range(0, b - a + 1)):               # (numbered from 0 within the range)
        found = {a + k: found[k] for k in range(0, b - a + 1)}
    else:
        return None
    if not all(png_ok(found[f], w, h) for f in want):
        return None
    return {f: found[f] for f in want}


# ------------------------------------------------------------------------------------------------ compose / sound
def compose(pic, ov, A, B, out, size, logf):
    w, h = size
    n = B - A + 1
    pw, ph = pic.size
    chain = "[0:v]format=gbrp"
    if (pw, ph) != (w, h):
        chain += f",scale={w}:{h}:flags=area"          # a larger picture is averaged down (supersampling, as the film's --scale)
    # straight (un-premultiplied) alpha, laid over in RGB at full resolution; then BT.709 limited-range 4:2:0
    fc = (chain + "[p];[1:v]format=gbrap[o];[p][o]overlay=format=gbrp:alpha=straight:eof_action=endall,"
          "scale=out_color_matrix=bt709:out_range=tv:flags=accurate_rnd+full_chroma_int+bitexact,format=yuv420p[v]")
    cmd = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
           "-framerate", str(FPS), "-start_number", str(A), "-i", os.path.join(pic.dir, pic.pattern),
           "-framerate", str(FPS), "-start_number", str(A), "-i", os.path.join(ov.dir, ov.pattern),
           "-filter_complex", fc, "-map", "[v]", "-frames:v", str(n), "-r", str(FPS),
           "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p",
           "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv",
           "-movflags", "+faststart", out]
    t0 = time.time()
    r = sh(cmd)
    with open(logf, "a") as f:
        f.write(f"\n==== compose {A}-{B} rc {r.returncode} {time.time() - t0:.0f} s\n{' '.join(cmd)}\n{r.stdout[-2000:]}\n")
    if r.returncode != 0:
        raise RuntimeError("ffmpeg (compose) failed: " + r.stdout[-400:])
    got = sh(["ffprobe", "-v", "error", "-count_packets", "-select_streams", "v:0", "-show_entries", "stream=nb_read_packets,width,height,pix_fmt,r_frame_rate,codec_name", "-of", "json", out]).stdout
    st = json.loads(got)["streams"][0]
    if int(st["nb_read_packets"]) != n:
        raise RuntimeError(f"{out}: {st['nb_read_packets']} frames, expected {n}")
    say(f"[compose] {out}: {st['nb_read_packets']} frames {st['width']}x{st['height']} {st['codec_name']} {st['pix_fmt']} {st['r_frame_rate']} fps in {time.time() - t0:.0f} s")
    return st


def build_sound(logf):
    """the sound engineer's one command, into the cut's own folder (his files are not touched); returns the 48 kHz mix"""
    work = SOUND_DIR
    os.makedirs(work, exist_ok=True)
    env = dict(os.environ, NAME="mix_cut", WORK=work, CLIPS=os.environ.get("CLIPS", CFG.get("sound", {}).get("clips", os.path.join(work, "clips"))))
    t0 = time.time()
    r = sh(["bash", os.path.join(REPO, CFG["sound"]["build"])], env=env, cwd=REPO)
    with open(logf, "a") as f:
        f.write(f"\n==== sound build rc {r.returncode} {time.time() - t0:.0f} s\n{r.stdout[-6000:]}\n")
    mix = os.path.join(work, "mix_cut_48k.wav")
    if r.returncode != 0 or not os.path.exists(mix):
        raise RuntimeError("the sound build failed (see the log): " + (r.stdout.strip().splitlines() or ["?"])[-1][:300])
    say(f"[sound] mix rebuilt in {time.time() - t0:.0f} s -> {mix}")
    return mix


def excerpt(mix, A, B, out):
    """frames A..B of the 48 kHz mix, to the sample (1600 samples a frame), for a clip of a range"""
    with wave.open(mix, "rb") as wv:
        sr, ch, sw = wv.getframerate(), wv.getnchannels(), wv.getsampwidth()
        per = sr // FPS
        wv.setpos(A * per)
        data = wv.readframes((B - A + 1) * per)
    with wave.open(out, "wb") as o:
        o.setnchannels(ch); o.setsampwidth(sw); o.setframerate(sr)
        o.writeframes(data)
    return out


def mux(silent, mix, out, logf):
    r = sh(["bash", os.path.join(REPO, CFG.get("sound", {}).get("mux", "scripts/kit/sound/mux.sh")), silent, mix, out])
    with open(logf, "a") as f:
        f.write(f"\n==== mux rc {r.returncode}\n{r.stdout[-3000:]}\n")
    for l in r.stdout.strip().splitlines()[-2:]:
        say("[mux] " + l)
    if r.returncode != 0:
        raise RuntimeError("mux.sh failed: " + r.stdout[-400:])


def same_picture(a, b):
    """(identical, mean abs difference, max) of two PNGs"""
    from PIL import Image
    import numpy as np
    x = np.asarray(Image.open(a).convert("RGB")).astype(int)
    y = np.asarray(Image.open(b).convert("RGB")).astype(int)
    if x.shape != y.shape:
        return False, 255.0, 255
    dd = abs(x - y)
    return bool(dd.max() == 0), float(dd.mean()), int(dd.max())


# ------------------------------------------------------------------------------------------------ main
def main():
    ap = argparse.ArgumentParser(description="the %s cut: picture (harness) + overlays (Remotion ovonly) + sound" % CFG["film"])
    ap.add_argument("--from", dest="a", type=int, default=None, help="first frame (default 0)")
    ap.add_argument("--to", dest="b", type=int, default=None, help="last frame, inclusive (default: the film's last)")
    ap.add_argument("--force", action="store_true", help="re-render the range even where the manifest says it is current")
    ap.add_argument("--only", default="pic,ov,compose,sound,mux", help="steps, comma separated: pic, ov, compose, sound, mux (default: all)")
    ap.add_argument("--size", default="540x960", help="the size the PICTURE is rendered at (default 540x960; 1080x1920 is averaged down: the film's sampling, 4x the time)")
    ap.add_argument("--chunk", type=int, default=0, help="picture frames per locked job (default: what fits in 90 s)")
    ap.add_argument("--ov-chunk", type=int, default=0, help="overlay frames per locked job (default: what fits in 90 s)")
    ap.add_argument("--passes", type=int, default=4, help="how often to go round again for chunks that failed or whose sources changed while they rendered")
    ap.add_argument("--out", default=None, help="the mp4 (default <cut.name>.mp4, or <cut.name>_<A>-<B>.mp4 for a range)")
    ap.add_argument("--ink-samples", type=int, default=8, choices=[1, 2, 4, 8, 16], help="the ink pass's sub-pixel buffers (8 = the film; 4 saves about 0.3 s a frame and crawls a little more). Frames made with another value count as made from other sources")
    ap.add_argument("--lens", default="file", choices=["auto", "on", "file"], help="auto: frames without depth of field (Pose.post.dof unset: all of them tonight) skip the two lens passes, which copy their input unchanged there: the same picture, 0.5 to 0.8 s a frame less. on: the film's passes on every frame. file (default): what " + LENS_MODE + " says (auto | on; no file = on), read again before every chunk, so that a running cut can be switched")
    ap.add_argument("--wait-broken", type=int, default=20, help="minutes to wait, per pass, for a source file that does not build (somebody mid-edit)")
    ap.add_argument("--jobs", type=int, default=2, help="picture chunks that wait in the render queue at the same time (default 2). Each is its own job of at most ~90 s; more = a larger share of a busy queue")
    ap.add_argument("--priority", action="store_true", help="picture chunks go to the front of the render queue (cost 1); one job of somebody else still gets in between two chunks. The director's call")
    ap.add_argument("--status", action="store_true", help="only print what is current / stale / missing")
    ap.add_argument("--adopt", metavar="OLD_DEPS_JSON", default=None, help="the sources MOVED but draw the same (checked with stills first): frames made from the hashes in this older deps.json count as made from today's, per segment and layer; the manifest is rewritten (a copy is kept), nothing is rendered")
    ap.add_argument("--no-sound", action="store_true", help="leave the mp4 silent (same as --only pic,ov,compose)")
    a = ap.parse_args()
    global PRIORITY
    PRIORITY = a.priority
    steps = set(x.strip() for x in a.only.split(",") if x.strip())
    if a.no_sound:
        steps -= {"sound", "mux"}
    bad = steps - {"pic", "ov", "compose", "sound", "mux"}
    if bad:
        ap.error("unknown step(s): " + ", ".join(sorted(bad)))
    os.makedirs(BUILD, exist_ok=True); os.makedirs(LOGS, exist_ok=True)
    lockf = open(os.path.join(BUILD, "cut.lock"), "w")
    if not a.status and ({"pic", "ov"} & steps):          # (a run that renders nothing may go beside a render run: a clip of a range)
        try:
            fcntl.flock(lockf, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except OSError:
            say("another make_cut.sh is running (" + os.path.join(BUILD, "cut.lock") + "): not starting a second one")
            return 3
    logf = os.path.join(LOGS, "jobs.log")
    pw, ph = (int(x) for x in a.size.split("x"))
    out_w, out_h = 540, 960
    scale = out_w / FILM_W

    d = deps()
    entry, note = pic_entry_for(d)
    arg = None if entry.startswith(FILM) else entry
    if arg:
        d = deps(arg)
    d["_pic_entry_arg"] = arg
    total = d["total"]
    A = 0 if a.a is None else max(0, a.a)
    B = total - 1 if a.b is None else min(total - 1, a.b)
    if A > B:
        ap.error(f"empty range {A}-{B} (the film has frames 0..{total - 1})")
    whole = A == 0 and B == total - 1
    if not whole:
        global SOUND_DIR
        SOUND_DIR = os.path.join(FINAL, "sound_range")
    scale_pic = (pw * ph) / (540 * 960)
    pic_chunk = a.chunk or max(4, int((LOCK_BUDGET - PIC_START) / (PIC_SPF * scale_pic)))
    ov_chunk = a.ov_chunk or min(OV_CHUNK_MAX, max(20, int((LOCK_BUDGET - OV_START) / OV_SPF)))
    pic = Layer("pic", pic_chunk, f"entry={os.path.relpath(entry, REPO)}|size={pw}x{ph}|v1" + ("" if a.ink_samples == 8 else f"|ink={a.ink_samples}"), "f%04d.png", os.path.join(FINAL, "frames", f"pic_{pw}x{ph}"))
    pic.size = (pw, ph)
    ov = Layer("ov", ov_chunk, f"props=ovonly|scale={scale}|v1", "o%04d.png", os.path.join(FINAL, "frames", "ov"))
    man = load_manifest()
    for L in (pic, ov):
        man.setdefault(L.name, {})

    say(f"cut: frames {A}-{B} of {total} | picture {pw}x{ph} in chunks of {pic.chunk}, overlays in chunks of {ov.chunk} | steps {','.join(sorted(steps))}")
    fz = os.path.join(REPO, "FROZEN_AT")
    say("sources: " + (f"the FROZEN copy {REPO} (as of {open(fz).read().strip()})" if os.path.exists(fz) else f"the live tree {REPO}"))
    if note:
        say("NOTE: " + note)
    if not d["chain"]["ok"]:
        say("WARNING: the post section of %s changed since %s was written (chain.sha): the cut's look may differ from the film's. Port the change, then update %s" % (ENT["overlay"], ENT.get("picCore", "preview/film_cut_core") + ".ts", CFG["chainSha"]))
    if d.get("blend"):
        say("note: mix-blend-mode / backdrop-filter appears in " + ", ".join(d["blend"]) + ": a DOM effect that reads the picture under it cannot be reproduced by a separate overlay layer")

    def report(dd):
        res = {}
        for L in (pic, ov):
            cur, stale, miss = L.state(man, dd, A, B)
            res[L.name] = {"current": len(cur), "stale": stale, "missing": miss}
            say(f"[{L.name}] current {len(cur)}/{B - A + 1}  stale {ranges(stale)}  missing {ranges(miss)}")
        return res

    if a.adopt:
        old = json.load(open(a.adopt))
        n = 0
        with MLOCK:
            shutil.copy(MANIFEST, MANIFEST + ".before_adopt")
            for L in ("pic", "ov"):
                done = man.get(L, {}).get("done", {})
                for s in seg_ids(d):
                    ho, hn = old.get(L, {}).get(s, {}).get("hash"), d[L][s].get("hash")
                    if not ho or not hn or ho == hn:
                        continue
                    for k in [k for k in done if k.split("|", 1)[0] == ho]:
                        nk = hn + "|" + k.split("|", 1)[1]
                        done[nk] = ranges(sorted(expand(done.get(nk)) | expand(done.pop(k))))
                        n += 1
            save_manifest(man)
        say(f"adopted {n} manifest entr{'y' if n == 1 else 'ies'} from {a.adopt} (the old manifest: {MANIFEST}.before_adopt)")
        report(d)
        return 0

    if a.status:
        report(d)
        return 0

    fails = {}
    t_start = time.time()
    for p in range(max(1, a.passes)):
        # a source file that does not build (somebody is in the middle of an edit) stops BOTH layers, whichever
        # segment it is in: the picture entry and Film.tsx import all five. Wait for it instead of failing chunk by chunk.
        waited = 0
        while True:
            broken = sorted({f"{l}.{s}" for l in ("pic", "ov") for s in seg_ids(d) if d[l][s].get("hash") is None})
            if not broken or waited >= a.wait_broken * 60:
                break
            if waited == 0:
                say(f"the sources do not build right now ({', '.join(broken)}: {d[broken[0][:broken[0].index('.')]][broken[0][-1]].get('error', '?')[:200]}); waiting up to {a.wait_broken} min for the edit to finish")
            time.sleep(30); waited += 30
            d = dict(deps(arg), _pic_entry_arg=arg)
        deps_now = lambda: dict(deps(arg), _pic_entry_arg=arg)
        count = {"work": 0, "problems": 0}

        # ---------------- picture: up to --jobs chunks wait in the render queue at the same time (each is its own
        # job of at most ~90 s under the lock; the queue decides who goes next, so other people's jobs get in between)
        def run_pic(d0):
            jobs = [(c, pic.todo(man, d0, c, A, B, a.force and p == 0)) for c in pic.chunks(d0)]
            jobs = [(c, t) for c, t in jobs if t]
            left = [sum(len(t) for _, t in jobs)]
            pb = [x for x in broken if x.startswith("pic.")]
            if jobs and pb:
                say(f"[pic] still not building ({', '.join(pb)}): the picture waits for the next pass")
                count["problems"] += 1; jobs = []
            if jobs:
                say(f"[pic] pass {p + 1}: {left[0]} frame(s) in {len(jobs)} chunk(s) to render (about {left[0] * PIC_SPF * scale_pic / 60 + len(jobs) * PIC_START / 60:.0f} min of render lock; {a.jobs} chunk(s) in the queue at a time)")
            stop = threading.Event()

            def one(job):
                c, todo = job
                if stop.is_set():
                    return
                try:
                    h = deps_now()["pic"][c["seg"]].get("hash")
                    if h is None:
                        say(f"[pic] {c['id']}: segment {c['seg']} cannot be bundled right now: later")
                        with MLOCK:
                            count["problems"] += 1
                        return
                    t0 = time.time()
                    lm = lens_mode(a.lens)
                    ok, page, info = render_pic(pic, c, todo, entry, (pw, ph), logf, a.ink_samples, lm)
                    with MLOCK:
                        d2 = deps_now()
                        if not ok:
                            say(f"[pic] {c['id']} f{ranges(todo)} FAILED: {info}")
                            fails[c["id"]] = info; count["problems"] += 1
                            if "Build failed" in info or any(d2["pic"][x].get("hash") is None for x in seg_ids(d2)):
                                if not stop.is_set():
                                    say("[pic] the entry does not bundle: the rest of the picture waits for the next pass")
                                stop.set()
                            return
                        changed = d2["pic"][c["seg"]].get("hash") != h
                        for f in todo:
                            os.replace(os.path.join(info["tmp"], "f%04d.png" % f), pic.path(f))
                        shutil.rmtree(info["tmp"], ignore_errors=True)
                        extra = {"pose_ms": info["pose_ms"], "draw_ms": info["draw_ms"], "lens": lm}
                        left[0] -= len(todo)
                        if changed:
                            # somebody saved a source file between the hash and the end of the job: the frames show the
                            # film in SOME state of the last minutes. They are kept (a cut can be composed from them if
                            # time runs out) but recorded under a key no source state has: stale, they come round again.
                            pic.record(man, c, "changed-while-rendering|" + pic.key(h), todo, page, dict(extra, stale=True))
                            say(f"[pic] {c['id']} f{ranges(todo)}: segment {c['seg']}'s sources changed while it waited or rendered: kept as STALE frames, it comes round again | {left[0]} left")
                            count["problems"] += 1
                            return
                        pic.record(man, c, pic.key(h), todo, page, extra)
                        fails.pop(c["id"], None)
                        count["work"] += len(todo)
                        say(f"[pic] {c['id']} f{ranges(todo)}: {len(todo)} frames, {time.time() - t0:.0f} s with the queue, {page:.0f} s in the page ({page / len(todo):.2f} s/frame; pose {info['pose_ms']} ms, draw {info['draw_ms']} ms; lens {lm}) | {left[0]} left")
                except Exception as e:                                   # one chunk must not take the run down
                    say(f"[pic] {c['id']} f{ranges(todo)} FAILED: {str(e)[:300]}")
                    with MLOCK:
                        fails[c["id"]] = str(e)[:300]; count["problems"] += 1

            if jobs:
                with ThreadPoolExecutor(max_workers=max(1, a.jobs)) as ex:
                    list(ex.map(one, jobs))

        # ---------------- overlays (their own thread: Remotion takes the lock with a blocking flock, not the queue)
        def run_ov(d0):
            jobs = [(c, ov.todo(man, d0, c, A, B, a.force and p == 0)) for c in ov.chunks(d0)]
            jobs = [(c, t) for c, t in jobs if t]
            left = sum(len(t) for _, t in jobs)
            if not jobs:
                return
            say(f"[ov] pass {p + 1}: {left} frame(s) in {len(jobs)} chunk(s) to render")
            stamp = ensure_bundle(d0, logf)
            if stamp is None:
                say("[ov] no bundle (a source file does not build right now): the overlays wait for the next pass")
                with MLOCK:
                    count["problems"] += 1
                return
            for c, todo in jobs:
                h = stamp[c["seg"]]
                lo, hi = min(todo), max(todo)
                t0 = time.time()
                ok, secs, info = render_ov(ov, c, lo, hi, scale, logf)
                files = collect_ov(info, lo, hi, out_w, out_h) if ok else None
                if not ok or files is None:
                    why = info if not ok else "the sequence is incomplete or has the wrong size"
                    say(f"[ov] {c['id']} f{lo}-{hi} FAILED: {why}")
                    with MLOCK:
                        fails["ov " + c["id"]] = why; count["problems"] += 1
                    continue
                os.makedirs(ov.dir, exist_ok=True)
                for f, src in files.items():
                    os.replace(src, ov.path(f))
                shutil.rmtree(info, ignore_errors=True)
                ov.record(man, c, ov.key(h), list(files), secs)
                with MLOCK:
                    fails.pop("ov " + c["id"], None)
                    count["work"] += len(files)
                left -= len(files)
                say(f"[ov] {c['id']} f{lo}-{hi}: {len(files)} frames, {time.time() - t0:.0f} s with the lock wait, {secs:.0f} s under the lock ({secs / len(files):.2f} s/frame) | {left} left")

        def guarded(fn, name):
            def go():
                try:
                    fn(d)
                except Exception as e:
                    say(f"[{name}] stopped: {str(e)[:400]}")
                    with MLOCK:
                        fails[name] = str(e)[:300]; count["problems"] += 1
            return go

        th = threading.Thread(target=guarded(run_ov, "ov")) if "ov" in steps else None
        if th:
            th.start()
        if "pic" in steps:
            guarded(run_pic, "pic")()
        if th:
            th.join()
        work, problems = count["work"], count["problems"]
        d = deps_now()
        st = report(d)
        clean = all(not st[k]["stale"] and not st[k]["missing"] for k in st if k in steps)
        if clean or not ({"pic", "ov"} & steps):
            break
        if p + 1 < max(1, a.passes):
            say(f"pass {p + 1} left work behind ({problems} problem(s)); going round again in 20 s")
            time.sleep(20)

    st = report(d)
    summary = {"range": [A, B], "total": total, "whole": whole, "pic": {k: (ranges(v) if isinstance(v, list) else v) for k, v in st["pic"].items()},
               "ov": {k: (ranges(v) if isinstance(v, list) else v) for k, v in st["ov"].items()}, "failed": fails,
               "hashes": {"pic": {s: d["pic"][s].get("hash") for s in seg_ids(d)}, "ov": {s: d["ov"][s].get("hash") for s in seg_ids(d)}},
               "chain_ok": d["chain"]["ok"], "ink": d["ink"], "minutes": round((time.time() - t_start) / 60, 1)}
    name = CUT_NAME if whole else f"{CUT_NAME}_{A}-{B}"
    out = a.out or os.path.join(FINAL, name + ".mp4")
    silent = os.path.splitext(out)[0] + "_silent.mp4"
    rc = 0
    if "compose" in steps:
        if st["pic"]["missing"] or st["ov"]["missing"]:
            say(f"[compose] NOT composed: frames are missing (picture {ranges(st['pic']['missing'])}; overlays {ranges(st['ov']['missing'])}). Run the same command again")
            rc = 1
        else:
            if st["pic"]["stale"] or st["ov"]["stale"]:
                say(f"[compose] WARNING: composing with frames made from OLDER sources (picture {ranges(st['pic']['stale'])}; overlays {ranges(st['ov']['stale'])}); run again to refresh them")
            summary["video"] = compose(pic, ov, A, B, silent, (out_w, out_h), logf)
            if whole:
                same, mean, mx = same_picture(pic.path(0), pic.path(total - 1))
                summary["loop"] = {"picture_frame0_equals_last": same, "mean_abs_diff": round(mean, 4), "max": mx}
                say(f"[loop] the picture of frame {total - 1} {'IS' if same else 'IS NOT'} the picture of frame 0 (mean difference {mean:.3f}, max {mx})")
    if rc == 0 and ("sound" in steps or "mux" in steps):
        if not os.path.exists(silent):
            say(f"[mux] no silent picture {silent}: compose first")
            rc = 1
        else:
            work = SOUND_DIR
            mix = os.path.join(work, "mix_cut_48k.wav")
            if "sound" in steps or not os.path.exists(mix):
                mix = build_sound(logf)
            if "mux" in steps:
                if not whole:
                    mix = excerpt(mix, A, B, os.path.join(BUILD, f"mix_{A}-{B}.wav"))
                mux(silent, mix, out, logf)
                summary["out"] = out
                say(f"DONE: {out}")
    elif rc == 0 and "compose" in steps:
        summary["out"] = silent
        say(f"DONE (silent): {silent}")
    with open(os.path.splitext(out)[0] + ".report.json", "w") as f:
        json.dump(summary, f, indent=1)
    if fails:
        say("still failing: " + "; ".join(f"{k}: {v}" for k, v in fails.items())[:600])
    return rc


if __name__ == "__main__":
    sys.exit(main())
