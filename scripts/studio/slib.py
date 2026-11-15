"""Shared helpers for the studio tools: paths, logging with clock times, running commands, probing media.

Python 3.9 compatible (the Mac's /usr/bin/python3 makes the studio's venv). No third-party imports at module level.
"""
import hashlib, json, os, shutil, subprocess, sys, time

HOME = os.path.expanduser("~")
STUDIO = os.environ.get("STUDIO", os.path.join(HOME, "Claude", "studio"))
TOOLS = os.environ.get("STUDIO_TOOLS", os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
HERE = os.path.dirname(os.path.abspath(__file__))
# where finished films land (item 3). One line to change for a synced folder later, e.g.
#   STUDIO_DELIVER="$HOME/Library/Mobile Documents/com~apple~CloudDocs/Films"
DELIVER = os.environ.get("STUDIO_DELIVER", os.path.join(HOME, "Claude", "films"))
REPO = os.path.join(STUDIO, "repo")          # the film checkout (one clone, detached at the commit being made)
WORK = os.path.join(STUDIO, "work")          # per film: voice, sound clips, versions
LIBRARY = os.path.join(STUDIO, "library")    # the shared sound library (item 12)
VOICE = os.path.join(STUDIO, "voice")        # every voice / sfx / music request's output, by request id
LOGS = os.path.join(STUDIO, "logs")
GH_REPO = os.environ.get("STUDIO_GH_REPO", "https://github.com/jayjiao-debug/video")
FPS = 30

_LOGF = None


def now():
    return time.strftime("%H:%M:%S")


def set_log(path):
    global _LOGF
    os.makedirs(os.path.dirname(path), exist_ok=True)
    _LOGF = open(path, "a", encoding="utf-8")


def log(*a):
    s = f"[{now()}] " + " ".join(str(x) for x in a)
    print(s, flush=True)
    if _LOGF:
        _LOGF.write(s + "\n"); _LOGF.flush()


def die(msg, code=1):
    log("FAILED: " + msg)
    sys.exit(code)


def run(cmd, cwd=None, env=None, check=True, quiet=False, capture=False):
    """run a command (list, or a string for the shell); its output goes to the log. Returns stdout when capture."""
    shell = isinstance(cmd, str)
    e = dict(os.environ); e.update(env or {})
    if not quiet:
        log("$ " + (cmd if shell else " ".join(cmd)))
    p = subprocess.Popen(cmd, cwd=cwd, env=e, shell=shell, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                         text=True, errors="replace")
    out = []
    for line in p.stdout:
        out.append(line)
        if _LOGF:
            _LOGF.write(line); _LOGF.flush()
        if not quiet and not capture:
            sys.stdout.write(line); sys.stdout.flush()
    p.wait()
    if check and p.returncode != 0:
        tail = "".join(out[-25:])
        die(f"command failed ({p.returncode}): {cmd if shell else ' '.join(cmd)}\n{tail}")
    return "".join(out) if capture else p.returncode


def which(x):
    return shutil.which(x)


def ffmpeg():
    return which("ffmpeg") or die("no ffmpeg on PATH (run: studio setup)")


def ffprobe():
    return which("ffprobe") or die("no ffprobe on PATH (run: studio setup)")


def probe(path):
    """{w, h, fps, frames, dur, adur, asr} of a media file (frames counted from the stream header or by decoding)"""
    j = json.loads(subprocess.check_output([ffprobe(), "-v", "error", "-print_format", "json", "-show_streams", "-show_format", path]))
    r = {"dur": float(j.get("format", {}).get("duration", 0) or 0)}
    for s in j.get("streams", []):
        if s.get("codec_type") == "video" and "w" not in r:
            r["w"], r["h"] = int(s["width"]), int(s["height"])
            n, d = s.get("avg_frame_rate", "30/1").split("/")
            r["fps"] = float(n) / float(d or 1) if float(d or 1) else 30.0
            r["frames"] = int(s.get("nb_frames") or 0) or int(round(float(s.get("duration", r["dur"]) or 0) * r["fps"]))
            r["vdur"] = float(s.get("duration", 0) or 0)
        if s.get("codec_type") == "audio" and "asr" not in r:
            r["asr"] = int(s.get("sample_rate", 0) or 0)
            r["adur"] = float(s.get("duration", 0) or 0)
    return r


def sha256(path, limit=None):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        while True:
            b = f.read(1 << 20)
            if not b:
                break
            h.update(b)
    return h.hexdigest()


def load_json(path, default=None):
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except (OSError, ValueError):
        return default


def save_json(path, obj):
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=1)
    os.replace(tmp, path)


def subst(s, vals):
    """{KEY} placeholders in a film config command"""
    for k, v in vals.items():
        s = s.replace("{" + k + "}", str(v))
    return s


class Step:
    """a timed step with a clock-time estimate from the last run of the same step (item 14)"""
    def __init__(self, name, times_path, key):
        self.name, self.path, self.key = name, times_path, key

    def __enter__(self):
        self.t0 = time.time()
        last = (load_json(self.path, {}) or {}).get(self.key)
        eta = f", done about {time.strftime('%H:%M', time.localtime(self.t0 + last))} (last time {fmt_s(last)})" if last else ""
        log(f"== {self.name} started{eta}")
        return self

    def __exit__(self, et, ev, tb):
        dt = time.time() - self.t0
        if et is None:
            t = load_json(self.path, {}) or {}
            t[self.key] = round(dt, 1)
            save_json(self.path, t)
            log(f"== {self.name} done in {fmt_s(dt)}")
        return False


def fmt_s(s):
    s = int(round(s or 0))
    return f"{s // 60} m {s % 60:02d} s" if s >= 60 else f"{s} s"


def lock(name):
    """one studio job at a time (renders saturate the Mac); a stale lock (dead pid) is taken over"""
    os.makedirs(LOGS, exist_ok=True)
    p = os.path.join(LOGS, name + ".lock")
    if os.path.exists(p):
        try:
            pid = int(open(p).read().split()[0])
            os.kill(pid, 0)
            die(f"another studio job is running (pid {pid}, {p}). Wait for it, or remove the file if it is stale.")
        except (ValueError, OSError, IndexError):
            pass
    with open(p, "w") as f:
        f.write(f"{os.getpid()} {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
    import atexit
    atexit.register(lambda: os.path.exists(p) and os.remove(p))
