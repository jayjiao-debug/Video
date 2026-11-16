#!/usr/bin/env python3
"""The Mac mini studio (README.md next to this file). Run through the `studio` shim, which puts the studio's node,
python and ffmpeg first on PATH.

  studio setup                                  folders, node, ffmpeg, python venv, the film checkout (once)
  studio update                                 pull the newest studio tools
  studio film <film> --ref <branch|sha> [...]   THE one command: fetch, render, sound, mux, phone copy, sheet, gate, deliver
  studio voice <request.json> [--film F]        ElevenLabs voice / sfx / music on this Mac (key from the keychain)
  studio gate <film> [--version v3]             the delivery gate again on a made version
  studio deliver <film> [--version v3]          copy a gated version to ~/Claude/films/<film>/<version>/
  studio library add|list|page|link ...         the shared sound library
  studio soundpage <film> [--version v3]        a page with each sound layer on its own button
  studio status [film]                          what is set up, what was made, what is running
"""
import argparse, glob, json, os, re, shutil, subprocess, sys, time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import slib
import drive as drivemod
from slib import log, die, run, STUDIO, REPO, WORK, LIBRARY, VOICE, LOGS, DELIVER, HERE

NODE_VERSION = "v22.12.0"


# ------------------------------------------------------------------------------------------------ setup / update
def cmd_setup(a):
    for d in (STUDIO, WORK, LIBRARY, VOICE, LOGS, os.path.join(STUDIO, "bin"), DELIVER):
        os.makedirs(d, exist_ok=True)
    slib.set_log(os.path.join(LOGS, "setup.log"))
    log(f"studio at {STUDIO}, tools at {slib.TOOLS}, deliveries to {DELIVER}")
    mac = sys.platform == "darwin"
    arch = os.uname().machine
    # node
    if not slib.which("node"):
        if not mac:
            die("no node on PATH")
        plat = "darwin-arm64" if arch == "arm64" else "darwin-x64"
        url = f"https://nodejs.org/dist/{NODE_VERSION}/node-{NODE_VERSION}-{plat}.tar.gz"
        run(f"curl -fsSL '{url}' | tar -xz -C '{STUDIO}' && rm -rf '{STUDIO}/node' && mv '{STUDIO}/node-{NODE_VERSION}-{plat}' '{STUDIO}/node'")
    else:
        # a portable node inside an old test clone (~/Claude/libai-render-test/node): copy it into the studio, so the
        # old clones can be deleted to free disk
        nd = os.path.dirname(os.path.dirname(os.path.realpath(slib.which("node"))))
        claude = os.path.join(slib.HOME, "Claude")
        if nd.startswith(claude + os.sep) and not nd.startswith(os.path.realpath(STUDIO)) and not os.path.isdir(os.path.join(STUDIO, "node")):
            shutil.copytree(nd, os.path.join(STUDIO, "node"), symlinks=True)
            log(f"copied node from {nd} into {STUDIO}/node")
    # ffmpeg + ffprobe (the film sound scripts call them by name)
    if not (slib.which("ffmpeg") and slib.which("ffprobe")):
        if slib.which("brew"):
            run(["brew", "install", "ffmpeg"], check=False)
        if mac and not (slib.which("ffmpeg") and slib.which("ffprobe")):
            b = os.path.join(STUDIO, "bin")
            for tool in ("ffmpeg", "ffprobe"):
                if os.path.exists(os.path.join(b, tool)):
                    continue
                url = f"https://ffmpeg.martin-riedl.de/redirect/latest/macos/{'arm64' if arch == 'arm64' else 'amd64'}/release/{tool}.zip"
                run(f"cd '{b}' && curl -fsSL -o {tool}.zip '{url}' && unzip -o -q {tool}.zip && rm {tool}.zip && chmod +x {tool} && (xattr -d com.apple.quarantine {tool} 2>/dev/null || true)")
            os.environ["PATH"] = b + os.pathsep + os.environ["PATH"]
    # the film sound builds use rubberband (pitch) and the gate sheets may use drawtext: Homebrew's plain ffmpeg has neither
    ff0 = subprocess.run([slib.which("ffmpeg") or "ffmpeg", "-hide_banner", "-filters"], capture_output=True, text=True).stdout
    if " rubberband " not in ff0 and slib.which("brew"):
        run(["brew", "install", "ffmpeg-full"], check=False)
        full = "/opt/homebrew/opt/ffmpeg-full/bin"
        if os.path.isdir(full):
            os.environ["PATH"] = full + os.pathsep + os.environ["PATH"]
    for tool in ("ffmpeg", "ffprobe", "git", "node", "npm"):
        log(f"{tool}: {slib.which(tool) or 'MISSING'}")
    ff = subprocess.run([slib.which("ffmpeg") or "ffmpeg", "-hide_banner", "-filters"], capture_output=True, text=True).stdout
    for flt in ("ebur128", "rubberband", "loudnorm", "drawbox", "drawtext"):
        pat = r"\s" + flt + r"\s"
        log(f"ffmpeg filter {flt}: " + ("yes" if re.search(pat, ff) else "NO"))
    # python venv with what the sound scripts, the gate and the voice check need
    py = os.path.join(STUDIO, "py", "bin", "python3")
    if not os.path.exists(py):
        run([sys.executable, "-m", "venv", os.path.join(STUDIO, "py")])
    run([py, "-m", "pip", "install", "-q", "--upgrade", "pip"], check=False)
    run([py, "-m", "pip", "install", "-q", "numpy", "scipy", "pillow", "soundfile", "requests", "faster-whisper"])
    # the film checkout: an empty clone that fetches one commit at a time
    if not os.path.isdir(os.path.join(REPO, ".git")):
        os.makedirs(REPO, exist_ok=True)
        run(["git", "init", "-q", REPO]); run(["git", "-C", REPO, "remote", "add", "origin", slib.GH_REPO])
    # a short name: ~/Claude/studio/studio -> this shim
    link = os.path.join(STUDIO, "studio")
    if not os.path.islink(link):
        try: os.symlink(os.path.join(HERE, "studio"), link)
        except OSError: pass
    key = keychain_key() is not None
    log("ElevenLabs key in the keychain: " + ("yes" if key else "no  (save it once: security add-generic-password -U -a \"$USER\" -s elevenlabs -w)"))
    if mac:
        log("sleep settings: " + subprocess.run("pmset -g | grep -E ' sleep|displaysleep' | tr -s ' ' | tr '\\n' ';'", shell=True, capture_output=True, text=True).stdout)
    log(f"setup done. The one command: {link} film <film> --ref <branch or commit>")


def cmd_update(a):
    """pull new tools: one branch, one commit deep. A full clone (every branch's history, 14 GB once) is shrunk."""
    g = ["git", "-C", slib.TOOLS]
    br = subprocess.run(g + ["rev-parse", "--abbrev-ref", "HEAD"], capture_output=True, text=True).stdout.strip() or "claude/pipeline-tools"
    if br == "HEAD": br = "claude/pipeline-tools"
    run(g + ["config", "remote.origin.fetch", f"+refs/heads/{br}:refs/remotes/origin/{br}"])
    run(g + ["fetch", "--depth", "1", "origin", br])
    run(g + ["reset", "--hard", f"origin/{br}"])
    others = [r for r in subprocess.run(g + ["for-each-ref", "--format=%(refname)", "refs/remotes/", "refs/tags/", "refs/heads/"],
                                         capture_output=True, text=True).stdout.split() if r not in (f"refs/remotes/origin/{br}", f"refs/heads/{br}")]
    for r in others:
        subprocess.run(g + ["update-ref", "-d", r])
    if others:
        log(f"dropped {len(others)} other branches and tags from the tools clone; packing it down")
        run(g + ["reflog", "expire", "--expire=now", "--all"])
        run(g + ["gc", "--prune=now", "--quiet"])
    r = subprocess.run(["du", "-sh", os.path.join(slib.TOOLS, ".git")], capture_output=True, text=True).stdout.split()
    log(f"tools at {subprocess.run(g + ['log', '-1', '--format=%h %s'], capture_output=True, text=True).stdout.strip()}"
        + (f"; clone {r[0]}" if r else ""))


# ------------------------------------------------------------------------------------------------ film config
def film_config(film, repo=REPO):
    """the film's studio config: src/videos/<film>/studio.json in the film's own commit wins, else the tools' films/<film>.json"""
    for p in (os.path.join(repo, "src", "videos", film, "studio.json"), os.path.join(HERE, "films", film + ".json")):
        c = slib.load_json(p)
        if c:
            c["_from"] = p
            return c
    die(f"no studio config for '{film}': add scripts/studio/films/{film}.json (README: a new film)")


def work_dirs(film, version):
    w = os.path.join(WORK, film)
    v = os.path.join(w, "versions", version)
    for d in (w, v, os.path.join(w, "voice"), os.path.join(w, "sound", "clips")):
        os.makedirs(d, exist_ok=True)
    return w, v


def next_version(film, lang):
    seen = []
    for root in (os.path.join(WORK, film, "versions"), os.path.join(DELIVER, film)):
        for d in glob.glob(os.path.join(root, "v*")):
            m = re.match(r"v(\d+)", os.path.basename(d))
            if m: seen.append(int(m.group(1)))
    return f"v{max(seen) + 1 if seen else 1}"


def vals_for(film, cfg, wdir, vdir, lang):
    return {"REPO": REPO, "WORK": wdir, "VER": vdir, "FILM": film, "LANG": lang, "STUDIO": STUDIO,
            "CLIPS": os.path.join(wdir, "sound", "clips"), "MIX": os.path.join(vdir, "mix_48k.wav"),
            "VOICE": os.path.join(wdir, "voice"), "LIB": LIBRARY, "TOOLS": slib.TOOLS}


# ------------------------------------------------------------------------------------------------ the steps
def fetch(ref):
    if not os.path.isdir(os.path.join(REPO, ".git")):
        die("the film checkout is missing: run studio setup")
    run(["git", "-C", REPO, "fetch", "-q", "--depth", "50", "origin", ref])
    run(["git", "-C", REPO, "checkout", "-q", "--force", "--detach", "FETCH_HEAD"])
    run(["git", "-C", REPO, "clean", "-q", "-fd", "-e", "node_modules"])
    sha = run(["git", "-C", REPO, "rev-parse", "HEAD"], capture=True, quiet=True).strip()
    msg = run(["git", "-C", REPO, "log", "-1", "--format=%s"], capture=True, quiet=True).strip()
    log(f"checked out {ref} = {sha[:10]}: {msg}")
    # npm ci only when the lock file changed
    lock = os.path.join(REPO, "package-lock.json")
    stamp = os.path.join(REPO, "node_modules", ".studio-lock-sha")
    h = slib.sha256(lock) if os.path.exists(lock) else ""
    if not os.path.exists(stamp) or open(stamp).read().strip() != h:
        run(["npm", "ci", "--no-audit", "--no-fund"], cwd=REPO)
        open(stamp, "w").write(h)
    return sha


def render(cfg, vdir, lang, frames=None, out_name="picture.mp4", scale=None):
    r = dict({"entry": "src/index.ts", "crf": 16, "gl": "angle", "concurrency": "50%", "timeout": 600000}, **cfg.get("render", {}))
    props = dict(cfg.get("props", {}))
    props.update((cfg.get("langs", {}).get(lang) or {}).get("props", {}))
    out = os.path.join(vdir, out_name)
    cmd = ["npx", "remotion", "render", r["entry"], cfg["composition"], out, "--muted", f"--gl={r['gl']}",
           f"--concurrency={r['concurrency']}", f"--timeout={r['timeout']}", "--log=error", f"--crf={r['crf']}"]
    if props: cmd.append("--props=" + json.dumps(props, ensure_ascii=False))
    if frames: cmd.append(f"--frames={frames}")
    if scale: cmd.append(f"--scale={scale}")
    cmd += r.get("extra", [])
    run(["npx", "remotion", "browser", "ensure"], cwd=REPO, check=False, quiet=True)
    run(cmd, cwd=REPO)
    p = slib.probe(out)
    log(f"picture: {p.get('w')}x{p.get('h')}, {p.get('frames')} frames, {p.get('dur', 0):.2f} s")
    return out


def build_sound(cfg, vals, vdir, frames=None):
    s = cfg.get("sound", {})
    mix = vals["MIX"]
    if not s.get("build"):
        return None
    link_library(vals["CLIPS"], cfg)
    if cfg.get("voice", {}).get("build"):
        run(slib.subst(cfg["voice"]["build"], vals), cwd=REPO)
    run(slib.subst(s["build"], vals), cwd=REPO)
    if not os.path.exists(mix):
        die(f"the sound build ran but wrote no {mix}")
    if frames:   # a range: cut the mix to the same frames
        a, b = [int(x) for x in frames.split("-")]
        cut = os.path.join(vdir, f"mix_{a}-{b}_48k.wav")
        run([slib.ffmpeg(), "-v", "error", "-y", "-i", mix, "-af", f"atrim=start_sample={a * 1600}:end_sample={(b + 1) * 1600}", "-c:a", "pcm_s16le", cut])
        return cut
    return mix


def build_stems(cfg, vals, vdir):
    s = cfg.get("sound", {})
    if not s.get("stems"):
        return {}
    out = {}
    for g in s.get("groups", ["voice", "music", "amb", "sfx"]):
        p = os.path.join(vdir, "stems", f"{g}.wav")
        os.makedirs(os.path.dirname(p), exist_ok=True)
        rc = run(slib.subst(s["stems"], dict(vals, GROUP=g, STEM=p)), cwd=REPO, check=False)
        if rc == 0 and os.path.exists(p): out[g] = p
        else: log(f"stem {g}: not made (rc {rc})")
    return out


def link_library(clips_dir, cfg):
    """the film's clips folder sees every library sound by name; the film's own clips (real files) win"""
    lib = slib.load_json(os.path.join(LIBRARY, "library.json"), {"sounds": []})
    n = 0
    for s in lib.get("sounds", []):
        if s.get("status") == "retired": continue
        src = os.path.join(LIBRARY, s["file"])
        dst = os.path.join(clips_dir, os.path.basename(s["file"]))
        if os.path.exists(src) and (not os.path.exists(dst) or os.path.islink(dst)):
            if os.path.islink(dst): os.remove(dst)
            os.symlink(src, dst); n += 1
    if n: log(f"library: {n} approved sounds linked into {clips_dir}")


def mux(picture, mix, out, kbps=256):
    p, m = slib.probe(picture), slib.probe(mix)
    vd, ad = p["frames"] / p.get("fps", 30), m.get("adur") or m["dur"]
    if abs(vd - ad) > 1.0 / p.get("fps", 30) + 1e-3:
        die(f"picture {vd:.3f} s and sound {ad:.3f} s differ by more than a frame: the sound was built for another cut")
    run([slib.ffmpeg(), "-v", "error", "-y", "-i", picture, "-i", mix, "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy",
         "-c:a", "aac", "-b:a", f"{kbps}k", "-aac_pns", "0", "-movie_timescale", "48000", "-movflags", "+faststart", out])
    return out


def encode_copy(src, out, width, crf, abr="160k", preset="slow"):
    """the phone copy (1080 wide, small) and the 540 watch copy the gate reads"""
    h = width * 16 // 9
    run([slib.ffmpeg(), "-v", "error", "-y", "-i", src, "-vf", f"scale={width}:{h}:flags=lanczos", "-c:v", "libx264",
         "-preset", preset, "-crf", str(crf), "-pix_fmt", "yuv420p", "-colorspace", "bt709", "-color_primaries", "bt709",
         "-color_trc", "bt709", "-c:a", "aac", "-b:a", abr, "-movflags", "+faststart", out])
    return out


def cmd_film(a):
    film, lang = a.film, a.lang
    slib.lock("studio")
    if a.ref:
        pass
    version = a.version or next_version(film, lang)
    tag = version + ("" if lang == "zh" else f"_{lang}")
    wdir, vdir = work_dirs(film, tag)
    slib.set_log(os.path.join(vdir, "log.txt"))
    times = os.path.join(wdir, "times.json")
    skip = set((a.skip or "").split(",")) - {""}
    t0 = time.time()
    log(f"studio film {film} {tag} ref={a.ref or '(checkout as it is)'} frames={a.frames or 'all'}")
    job = slib.load_json(os.path.join(vdir, "job.json"), {}) or {}
    with slib.Step("fetch", times, "fetch"):
        sha = fetch(a.ref) if a.ref else run(["git", "-C", REPO, "rev-parse", "HEAD"], capture=True, quiet=True).strip()
    cfg = film_config(film)
    log(f"film config: {cfg['_from']}")
    vals = vals_for(film, cfg, wdir, vdir, lang)
    job.update({"film": film, "version": tag, "lang": lang, "ref": a.ref, "sha": sha, "frames": a.frames, "started": time.strftime("%Y-%m-%d %H:%M:%S")})
    slib.save_json(os.path.join(vdir, "job.json"), job)
    picture = os.path.join(vdir, "picture.mp4")
    if "render" not in skip:
        with slib.Step("render 1080 picture", times, f"render{'_' + a.frames if a.frames else ''}"):
            render(cfg, vdir, lang, a.frames)
    elif not os.path.exists(picture):
        die("--skip render, but there is no picture.mp4 in " + vdir)
    mix = None
    if a.mix:
        mix = os.path.abspath(a.mix)
    elif "sound" not in skip:
        with slib.Step("sound", times, "sound"):
            mix = build_sound(cfg, vals, vdir, a.frames)
            if mix and not a.frames and "stems" not in skip:
                job["stems"] = build_stems(cfg, vals, vdir)
    master = os.path.join(vdir, "master.mp4")
    with slib.Step("mux, phone copy, watch copy, contact sheet", times, "copies"):
        if mix:
            mux(picture, mix, master)
        else:
            log("WARNING: no sound for this version (no sound.build in the film config and no --mix): the master is silent")
            shutil.copyfile(picture, master)
        encode_copy(master, os.path.join(vdir, "phone.mp4"), 1080, 26)
        encode_copy(master, os.path.join(vdir, "watch540.mp4"), 540, 20, "128k", "veryfast")
        run([sys.executable, os.path.join(HERE, "sheet.py"), os.path.join(vdir, "watch540.mp4"), os.path.join(vdir, "sheet.jpg"), "--every", "3"])
    job.update({"mix": mix, "master": master})
    slib.save_json(os.path.join(vdir, "job.json"), job)
    if "gate" not in skip:
        with slib.Step("delivery gate", times, "gate"):
            rc = gate(film, tag, cfg, a)
        if rc == 1 and not a.accept:
            log("the gate FAILED: nothing is delivered. Fix and run again, or deliver anyway with --accept \"<why>\"")
            sys.exit(1)
    if "deliver" not in skip:
        deliver(film, tag, accept=a.accept, reveal=a.reveal, drive=not a.no_drive)
    log(f"all done in {slib.fmt_s(time.time() - t0)}")


# ------------------------------------------------------------------------------------------------ gate / deliver
def prev_version_dir(film, tag):
    """the version before this one that has a watch copy (for 'seconds changed since the last version')"""
    vs = []
    for d in glob.glob(os.path.join(WORK, film, "versions", "v*")):
        b = os.path.basename(d)
        if b == tag or not os.path.exists(os.path.join(d, "watch540.mp4")): continue
        if ("_" in b) != ("_" in tag): continue
        vs.append((os.path.getmtime(os.path.join(d, "watch540.mp4")), d))
    cur = os.path.join(WORK, film, "versions", tag, "watch540.mp4")
    t = os.path.getmtime(cur) if os.path.exists(cur) else time.time()
    vs = [x for x in vs if x[0] < t]
    return max(vs)[1] if vs else None


def gate(film, tag, cfg, a):
    vdir = os.path.join(WORK, film, "versions", tag)
    cmd = [sys.executable, os.path.join(HERE, "gate", "gate.py"), "--film", film, "--vdir", vdir, "--repo", REPO,
           "--work", os.path.join(WORK, film), "--config", cfg["_from"]]
    prev = getattr(a, "prev", None) or prev_version_dir(film, tag)
    if prev: cmd += ["--prev", prev]
    if getattr(a, "frames", None): cmd += ["--frames", a.frames]
    if getattr(a, "only", None): cmd += ["--only", a.only]
    return run(cmd, check=False)


def cmd_gate(a):
    tag = a.version + ("" if a.lang == "zh" else f"_{a.lang}")
    vdir = os.path.join(WORK, a.film, "versions", tag)
    slib.set_log(os.path.join(vdir, "log.txt"))
    cfg = film_config(a.film)
    sys.exit(gate(a.film, tag, cfg, a))


def deliver(film, tag, accept=None, reveal=False, drive=True):
    vdir = os.path.join(WORK, film, "versions", tag)
    g = slib.load_json(os.path.join(vdir, "gate", "gate.json"))
    master = os.path.join(vdir, "master.mp4")
    if not g:
        if not accept: die("no gate result for this version: run studio gate first (or --accept \"<why>\")")
    elif g.get("master_sha256") != slib.sha256(master):
        die("the master changed after the gate ran: run the gate again (any change after the gate reruns it)")
    elif g.get("verdict") == "FAIL" and not accept:
        die("the gate FAILED for this version (gate/gate.md); fix it, or deliver with --accept \"<why>\"")
    job = slib.load_json(os.path.join(vdir, "job.json"), {})
    out = os.path.join(DELIVER, film, tag)
    os.makedirs(out, exist_ok=True)
    base = f"{film}_{tag}"
    copies = [("master.mp4", f"{base}_hd.mp4"), ("phone.mp4", f"{base}_phone.mp4"), ("sheet.jpg", f"{base}_sheet.jpg")]
    for src, dst in copies:
        if os.path.exists(os.path.join(vdir, src)):
            shutil.copyfile(os.path.join(vdir, src), os.path.join(out, dst))
    rv = os.path.join(out, "review")
    os.makedirs(rv, exist_ok=True)
    for f in glob.glob(os.path.join(vdir, "gate", "*.md")) + glob.glob(os.path.join(vdir, "gate", "*.jpg")) + glob.glob(os.path.join(vdir, "gate", "*.mp4")):
        shutil.copyfile(f, os.path.join(rv, os.path.basename(f)))
    if os.path.isdir(os.path.join(vdir, "soundpage")):
        shutil.copytree(os.path.join(vdir, "soundpage"), os.path.join(out, "sound"), dirs_exist_ok=True)
    note = {"film": film, "version": tag, "sha": job.get("sha"), "ref": job.get("ref"), "delivered": time.strftime("%Y-%m-%d %H:%M:%S"),
            "gate": (g or {}).get("verdict", "none"), "accepted_because": accept}
    slib.save_json(os.path.join(out, "delivery.json"), note)
    # films/<film>/versions.md: one line per delivery, newest last
    with open(os.path.join(DELIVER, film, "versions.md"), "a", encoding="utf-8") as f:
        f.write(f"- {note['delivered']} {tag}: commit {str(note['sha'])[:10]} ({note['ref']}), gate {note['gate']}" + (f", accepted: {accept}" if accept else "") + "\n")
    latest = os.path.join(DELIVER, film, "latest")
    if os.path.islink(latest): os.remove(latest)
    try: os.symlink(tag, latest)
    except OSError: pass
    log(f"delivered to {out}: " + ", ".join(sorted(os.listdir(out))))
    if reveal and sys.platform == "darwin":
        subprocess.run(["open", "-R", os.path.join(out, f"{base}_phone.mp4")])
    if drive:
        to_drive(film, tag, out)
    return out


def to_drive(film, tag, out):
    """copy the delivery into its channel's Google Drive folder (drive.py); write the links into delivery.json and versions.md"""
    suf = tag.rsplit("_", 1)[-1] if "_" in tag else ""
    lang = suf if (len(suf) == 2 and suf.isalpha()) else "zh"
    try:
        channels = (film_config(film) or {}).get("drive")
    except SystemExit:
        channels = None
    if not drivemod.root(lang, channels):
        log("Drive: no Google Drive folder on this machine (or STUDIO_DRIVE=off): the film stays local only")
        return None
    try:
        res = drivemod.push(out, film, tag, lang=lang, channels=channels, log=log)
    except OSError as e:
        log(f"Drive: copy failed ({e}); the local delivery is complete. Retry with: studio drive push {film} --version {tag}")
        return None
    note = slib.load_json(os.path.join(out, "delivery.json"), {}) or {}
    note["drive"] = res
    slib.save_json(os.path.join(out, "delivery.json"), note)
    try:
        drivemod._copy(os.path.join(out, "delivery.json"), os.path.join(res["drive_path"], "delivery.json"))
    except OSError:
        pass
    if res.get("folder") and res.get("hd") and res.get("phone") and not KEEP_LOCAL:
        free_local(film, tag)
    if res.get("folder"):
        with open(os.path.join(DELIVER, film, "versions.md"), "a", encoding="utf-8") as f:
            f.write(f"  - {tag} on Google Drive ({res['channel']}): {res['folder']}" + (f" (phone copy {res['phone']})" if res.get("phone") else "") + "\n")
        print("\nDRIVE " + json.dumps({"film": film, "version": tag, "channel": res["channel"], "folder": res["folder"], "phone": res.get("phone"), "hd": res.get("hd")}), flush=True)
    return res


# ------------------------------------------------------------------------------------------------ disk space
# The Mac mini's disk is small: once Drive has a delivery, the big local copies go. Kept: the watch copy (the next
# version's gate compares with it), the mix, the sheets, the gate report, job.json, the log and delivery.json.
KEEP_LOCAL = os.environ.get("STUDIO_KEEP_LOCAL", "") not in ("", "0", "no")
BIG_WORK = ("picture.mp4", "master.mp4", "phone.mp4", "stems", "gate/watch_phone_mask.mp4", "soundpage")


def _size(p):
    if os.path.isfile(p): return os.path.getsize(p)
    return sum(os.path.getsize(os.path.join(d, f)) for d, _, fs in os.walk(p) for f in fs if os.path.isfile(os.path.join(d, f)))


def _remove(paths, dry=False):
    freed = 0
    for p in paths:
        if not os.path.lexists(p): continue
        freed += _size(p)
        if dry: continue
        if os.path.isdir(p) and not os.path.islink(p): shutil.rmtree(p)
        else: os.remove(p)
    return freed


def free_local(film, tag, dry=False, why="on Google Drive"):
    """remove a version's big local files; the delivery folder keeps delivery.json, the sheet and the gate report"""
    vdir = os.path.join(WORK, film, "versions", tag)
    out = os.path.join(DELIVER, film, tag)
    paths = [os.path.join(vdir, b) for b in BIG_WORK]
    paths += glob.glob(os.path.join(out, "*.mp4")) + glob.glob(os.path.join(out, "review", "*.mp4"))
    paths += [os.path.join(out, "sound")]
    freed = _remove(paths, dry)
    if freed:
        log(f"{'would free' if dry else 'freed'} {freed / 1e9:.2f} GB of {film} {tag} ({why})")
    return freed


def cmd_clean(a):
    """free disk: versions whose delivery is on Drive lose their local copies; test versions (never delivered) older
    than --days lose their renders. Old checkouts and caches are listed, never removed."""
    total = 0
    cutoff = time.time() - a.days * 86400
    for vdir in sorted(glob.glob(os.path.join(WORK, "*", "versions", "*"))):
        film, tag = vdir.split(os.sep)[-3], os.path.basename(vdir)
        note = slib.load_json(os.path.join(DELIVER, film, tag, "delivery.json"), {}) or {}
        d = note.get("drive") or {}
        if d.get("hd") and d.get("folder"):
            total += free_local(film, tag, a.dry_run)
        elif not note and os.path.getmtime(vdir) < cutoff:
            total += free_local(film, tag, a.dry_run, why=f"a test, not delivered, older than {a.days} days")
    log(f"{'would free' if a.dry_run else 'freed'} {total / 1e9:.2f} GB in all")
    big = []
    for p in glob.glob(os.path.join(slib.HOME, "Claude", "*")):
        if os.path.realpath(p) in (os.path.realpath(STUDIO), os.path.realpath(DELIVER)) or not os.path.isdir(p): continue
        big.append((_size(p), p))
    if big:
        print("other folders in ~/Claude (not touched):")
        for sz, p in sorted(big, reverse=True)[:8]:
            print(f"  {sz / 1e9:6.2f} GB  {p}")
    try:
        u = shutil.disk_usage(slib.HOME)
        print(f"disk: {u.free / 1e9:.0f} GB free of {u.total / 1e9:.0f} GB")
    except OSError:
        pass


def cmd_drive(a):
    rest = a.rest or ["status"]
    if rest[0] == "push":
        p = argparse.ArgumentParser(prog="studio drive push"); p.add_argument("film"); p.add_argument("--version", required=True); p.add_argument("--lang", default="zh")
        b = p.parse_args(rest[1:])
        tag = b.version + ("" if b.lang == "zh" else f"_{b.lang}")
        out = os.path.join(DELIVER, b.film, tag)
        if not os.path.isdir(out): die(f"no delivery at {out}: run studio deliver first")
        slib.set_log(os.path.join(WORK, b.film, "versions", tag, "log.txt"))
        sys.exit(0 if (to_drive(b.film, tag, out) or {}).get("folder") else 1)
    sys.exit(drivemod.main(rest))


def cmd_deliver(a):
    tag = a.version + ("" if a.lang == "zh" else f"_{a.lang}")
    slib.set_log(os.path.join(WORK, a.film, "versions", tag, "log.txt"))
    deliver(a.film, tag, accept=a.accept, reveal=a.reveal, drive=not a.no_drive)


# ------------------------------------------------------------------------------------------------ voice
def keychain_key():
    if os.environ.get("ELEVENLABS_API_KEY"):
        return os.environ["ELEVENLABS_API_KEY"]
    if sys.platform != "darwin":
        return None
    r = subprocess.run(["security", "find-generic-password", "-s", "elevenlabs", "-w"], capture_output=True, text=True)
    return r.stdout.strip() or None if r.returncode == 0 else None


def cmd_voice(a):
    req = slib.load_json(a.request) if a.request != "-" else json.load(sys.stdin)
    if not req or "id" not in req: die("the request needs an id and items (scripts/studio/voice/README.md)")
    out = os.path.join(VOICE, req["id"])
    if os.path.exists(os.path.join(out, "report.json")) and not a.again:
        die(f"request {req['id']} was already made ({out}); give it a new id, or --again")
    os.makedirs(out, exist_ok=True)
    slib.save_json(os.path.join(out, "request.json"), req)
    slib.set_log(os.path.join(out, "run.txt"))
    key = keychain_key()
    if not key and not a.dry_run:
        die("no ElevenLabs key: save it once with  security add-generic-password -U -a \"$USER\" -s elevenlabs -w  (it asks for the key; nothing is shown)")
    env = {"ELEVENLABS_API_KEY": key or "", "VOICE_OUT": out}
    cmd = [sys.executable, os.path.join(HERE, "voice", "speak.py"), os.path.join(out, "request.json"), out]
    if a.dry_run: cmd.append("--dry-run")
    if a.no_whisper: cmd.append("--no-whisper")
    rc = run(cmd, env=env, check=False)
    if a.film and rc == 0:
        d = os.path.join(WORK, a.film, "voice", "takes")
        os.makedirs(d, exist_ok=True)
        dst = os.path.join(d, req["id"])
        if not os.path.exists(dst): os.symlink(out, dst)
        log(f"takes linked at {dst}")
    sys.exit(rc)


# ------------------------------------------------------------------------------------------------ library / sound page / status
def cmd_library(a):
    sys.exit(run([sys.executable, os.path.join(HERE, "sound", "library.py")] + a.rest, check=False, quiet=True))


def cmd_soundpage(a):
    tag = a.version + ("" if a.lang == "zh" else f"_{a.lang}")
    vdir = os.path.join(WORK, a.film, "versions", tag)
    cmd = [sys.executable, os.path.join(HERE, "sound", "page.py"), "--vdir", vdir, "--film", a.film, "--work", os.path.join(WORK, a.film)]
    rc = run(cmd, check=False)
    if rc == 0 and a.deliver:
        out = os.path.join(DELIVER, a.film, tag, "sound")
        shutil.copytree(os.path.join(vdir, "soundpage"), out, dirs_exist_ok=True)
        log(f"sound page at {out}/index.html")
        if sys.platform == "darwin": subprocess.run(["open", "-R", os.path.join(out, "index.html")])
    sys.exit(rc)


def cmd_status(a):
    print(f"studio {STUDIO}\ntools  {slib.TOOLS}\nfilms  {DELIVER}\ndrive  {drivemod.root('zh') or 'none (films stay local)'} (zh); {drivemod.root('en') or '-'} (en)")
    for t in ("node", "ffmpeg", "ffprobe", "git"):
        print(f"{t:8s}{slib.which(t) or 'MISSING'}")
    print("key     " + ("in the keychain" if keychain_key() else "not saved"))
    lk = os.path.join(LOGS, "studio.lock")
    print("running " + (open(lk).read().strip() if os.path.exists(lk) else "nothing"))
    if os.path.isdir(os.path.join(REPO, ".git")):
        print("checkout " + subprocess.run(["git", "-C", REPO, "log", "-1", "--format=%h %s"], capture_output=True, text=True).stdout.strip())
    films = [a.film] if a.film else sorted(os.listdir(WORK)) if os.path.isdir(WORK) else []
    for f in films:
        for d in sorted(glob.glob(os.path.join(WORK, f, "versions", "*"))):
            g = slib.load_json(os.path.join(d, "gate", "gate.json"), {}) or {}
            j = slib.load_json(os.path.join(d, "job.json"), {}) or {}
            print(f"  {f} {os.path.basename(d):8s} commit {str(j.get('sha'))[:10]}  gate {g.get('verdict', '-')}")


def main():
    ap = argparse.ArgumentParser(prog="studio", description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sp = ap.add_subparsers(dest="cmd", required=True)
    sp.add_parser("setup").set_defaults(fn=cmd_setup)
    sp.add_parser("update").set_defaults(fn=cmd_update)
    p = sp.add_parser("film", help="the one command")
    p.add_argument("film"); p.add_argument("--ref", help="branch, tag or commit to fetch (default: the checkout as it is)")
    p.add_argument("--version", help="v7 (default: the next number)"); p.add_argument("--lang", default="zh")
    p.add_argument("--frames", help="a range a-b (a test; not for delivery)"); p.add_argument("--mix", help="a ready sound mix (48 kHz wav) instead of the film's sound build")
    p.add_argument("--skip", help="comma list of steps to skip: render,sound,stems,gate,deliver")
    p.add_argument("--only", help="gate checks to run (default all)"); p.add_argument("--prev", help="the earlier version folder to compare with")
    p.add_argument("--accept", help="deliver even though the gate failed, with the reason (it is written into the delivery)")
    p.add_argument("--reveal", action="store_true", help="show the phone copy in Finder when delivered")
    p.add_argument("--no-drive", action="store_true", help="deliver locally only, not to Google Drive")
    p.add_argument("--keep-local", action="store_true", help="keep the big local copies after Drive has them")
    p.set_defaults(fn=cmd_film)
    for name, fn in (("gate", cmd_gate), ("deliver", cmd_deliver)):
        p = sp.add_parser(name); p.add_argument("film"); p.add_argument("--version", required=True); p.add_argument("--lang", default="zh")
        p.add_argument("--accept"); p.add_argument("--reveal", action="store_true"); p.add_argument("--only"); p.add_argument("--prev"); p.add_argument("--frames")
        p.add_argument("--no-drive", action="store_true"); p.add_argument("--keep-local", action="store_true"); p.set_defaults(fn=fn)
    p = sp.add_parser("voice"); p.add_argument("request", help="request.json (the voice-farm format), or - for stdin")
    p.add_argument("--film"); p.add_argument("--again", action="store_true"); p.add_argument("--dry-run", action="store_true"); p.add_argument("--no-whisper", action="store_true")
    p.set_defaults(fn=cmd_voice)
    p = sp.add_parser("library"); p.add_argument("rest", nargs=argparse.REMAINDER); p.set_defaults(fn=cmd_library)
    p = sp.add_parser("soundpage"); p.add_argument("film"); p.add_argument("--version", required=True); p.add_argument("--lang", default="zh")
    p.add_argument("--deliver", action="store_true"); p.set_defaults(fn=cmd_soundpage)
    p = sp.add_parser("status"); p.add_argument("film", nargs="?"); p.set_defaults(fn=cmd_status)
    p = sp.add_parser("clean", help="free disk: drop local copies of versions already on Drive, and old test renders")
    p.add_argument("--days", type=int, default=7); p.add_argument("--dry-run", action="store_true"); p.set_defaults(fn=cmd_clean)
    p = sp.add_parser("drive", help="Google Drive: status | push <film> --version v7 | link <path>"); p.add_argument("rest", nargs=argparse.REMAINDER)
    p.set_defaults(fn=cmd_drive)
    a = ap.parse_args()
    global KEEP_LOCAL
    KEEP_LOCAL = KEEP_LOCAL or bool(getattr(a, "keep_local", False))
    a.fn(a)


if __name__ == "__main__":
    main()
