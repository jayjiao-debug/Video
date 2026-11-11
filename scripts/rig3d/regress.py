#!/usr/bin/env python3
"""Regression check for the rig3d figures: renders a fixed list of small stills and compares them, pixel for pixel,
with the recorded ones. Run it before and after any change to kit/rig3d.ts, kit/rigacc/ or the previews.

  python3 scripts/rig3d/regress.py                 render every case, compare; exit 1 on any difference
  python3 scripts/rig3d/regress.py trio turn_      only the cases whose name starts with one of these
  python3 scripts/rig3d/regress.py --update [...]  record the current renders as the reference (after an intended
                                                   change: look at the pictures first)
  --jobs N (default 2)   --keep DIR (keep the new renders there)   --tol T (allow a per-channel difference of T)

The cases are listed in golden/cases*.json (one list per subject: cases.json = the figures, cases_acc.json = the
accessories, ...). Each has its hashes beside it (golden/hashes*.json, in git: a hash of each picture's pixels); the
pictures themselves are kept in golden/png/ (not in git) so that a mismatch can be shown as a diff. The renders are deterministic
on one machine and browser build. On another build the hashes may all differ: record once (--update) on the
untouched branch there, then make the change and run the check.
A mismatch writes <keep or golden/diff>/<case>__<frame>.png: reference | new | difference x 8."""
import sys, os, json, subprocess, hashlib, shutil, tempfile
from concurrent.futures import ThreadPoolExecutor
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "../.."))
GOLD = os.path.join(HERE, "golden")
PREV = os.path.join(ROOT, "src/videos/group/preview")

def main():
    args = sys.argv[1:]
    update = "--update" in args
    def val(flag, d):
        return args[args.index(flag) + 1] if flag in args else d
    jobs, keep, tol = int(val("--jobs", "2")), val("--keep", None), float(val("--tol", "0"))
    skip = set()
    for f in ("--jobs", "--keep", "--tol"):
        if f in args: skip.update((args.index(f), args.index(f) + 1))
    names = [a for i, a in enumerate(args) if i not in skip and not a.startswith("--")]
    cases, hashes, home = [], {}, {}
    for cf in sorted(f for f in os.listdir(GOLD) if f.startswith("cases") and f.endswith(".json")):
        hf = os.path.join(GOLD, "hashes" + cf[5:])
        for c in json.load(open(os.path.join(GOLD, cf))):
            assert c["name"] not in home, "two cases are called " + c["name"]
            home[c["name"]] = hf; cases.append(c)
        if os.path.exists(hf): hashes.update(json.load(open(hf)))
    if names: cases = [c for c in cases if any(c["name"].startswith(n) for n in names)]
    tmp = keep or tempfile.mkdtemp(prefix="rig3d-regress.")
    os.makedirs(tmp, exist_ok=True)

    def run(c):
        out = os.path.join(tmp, c["name"])
        shutil.rmtree(out, ignore_errors=True)
        cmd = ["node", os.path.join(HERE, "render.mjs"), os.path.join(PREV, c["entry"])]
        cmd += [out] if "pick" in c else [os.path.join(out, "still.png")]
        if "pick" in c: cmd += ["--pick", ",".join(map(str, c["pick"]))]
        if "size" in c: cmd += ["--size", c["size"]]
        if "opts" in c: cmd += ["--opts", json.dumps(c["opts"])]
        r = subprocess.run(cmd, capture_output=True, text=True)
        log = r.stdout + r.stderr
        files = sorted(f for f in os.listdir(out)) if os.path.isdir(out) else []
        return c, out, files, r.returncode, log

    bad, rows = 0, []
    with ThreadPoolExecutor(jobs) as ex:
        for c, out, files, rc, log in ex.map(run, cases):
            want = len(c.get("pick", [0]))
            if rc != 0 or len(files) != want:
                bad += 1; rows.append((c["name"], "RENDER FAILED", log.strip().splitlines()[-3:]))
                continue
            qa = [l for l in log.splitlines() if "QA: frame" in l and (" clear -" in l or "reach 0.0" not in l.split("|")[0])]
            for f in files:
                key = c["name"] + "/" + f
                im = Image.open(os.path.join(out, f)).convert("RGB")
                h = hashlib.sha256(("%dx%d" % im.size).encode() + im.tobytes()).hexdigest()[:24]
                ref = os.path.join(GOLD, "png", c["name"], f)
                if update:
                    hashes[key] = h
                    os.makedirs(os.path.dirname(ref), exist_ok=True); shutil.copy(os.path.join(out, f), ref)
                    rows.append((key, "recorded", ""))
                elif key not in hashes:
                    bad += 1; rows.append((key, "NEW (no reference; --update records it)", ""))
                elif hashes[key] == h:
                    rows.append((key, "same", ""))
                else:
                    note = "reference picture not on this machine (golden/png): record on the base commit to see a diff"
                    ok = False
                    if os.path.exists(ref):
                        a = np.asarray(Image.open(ref).convert("RGB"), np.int16); b = np.asarray(im, np.int16)
                        if a.shape != b.shape: note = "size changed %s -> %s" % (a.shape, b.shape)
                        else:
                            d = np.abs(a - b).max(axis=-1); n = int((d > tol).sum())
                            ok = n == 0
                            note = "%d px differ (%.3f %%), largest difference %d" % (n, 100.0 * n / d.size, int(d.max()))
                            if not ok:
                                dd = os.path.join(keep or os.path.join(GOLD, "diff")); os.makedirs(dd, exist_ok=True)
                                vis = np.clip(np.abs(a - b) * 8, 0, 255).astype(np.uint8)
                                sheet = np.concatenate([a.astype(np.uint8), b.astype(np.uint8), vis], axis=1)
                                Image.fromarray(sheet).save(os.path.join(dd, key.replace("/", "__")))
                    if ok: rows.append((key, "same within --tol", note))
                    else: bad += 1; rows.append((key, "CHANGED", note))
            if qa: rows.append((c["name"], "QA lines", qa[:3]))
    if update:
        for hf in sorted(set(home.values())):
            mine = {k: v for k, v in sorted(hashes.items()) if home.get(k.split("/")[0]) == hf}
            json.dump(mine, open(hf, "w"), indent=1)
    w = max(len(r[0]) for r in rows) if rows else 10
    for r in rows:
        if r[1] != "same" or len(rows) < 12: print(r[0].ljust(w), r[1], r[2] if r[2] else "")
    same = sum(1 for r in rows if r[1] == "same")
    print("%d pictures the same, %d problems%s" % (same, bad, " (recorded %d)" % sum(1 for r in rows if r[1] == "recorded") if update else ""))
    if not keep: shutil.rmtree(tmp, ignore_errors=True)
    sys.exit(1 if bad and not update else 0)

if __name__ == "__main__":
    main()
