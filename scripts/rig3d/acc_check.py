#!/usr/bin/env python3
"""One command to run after adding or changing an accessory (kit/rigacc/): it stops at the first thing that broke.

  python3 scripts/rig3d/acc_check.py            everything below
  python3 scripts/rig3d/acc_check.py --fast     skip step 4 (the pictures)

  1. types: npx tsc -p scripts/rig3d/tsconfig.rig.json
  2. arms: every accessory in the catalogue (kit/rigacc/catalog.ts) on 13 builds x 5 poses x 32 camera positions;
     no case may clip that does not clip without the accessory, and every hand must reach its place
  3. the list: every catalogue name needs a line "acc_<name>" in golden/cases_acc.json and a recorded picture
  4. pictures: regress.py, all cases. The figures without accessories and every accessory that was recorded before
     must come out the same, pixel for pixel. Only a NEW accessory's own case may be new: look at its pictures, then
     record them with  python3 scripts/rig3d/regress.py --update acc_<name>
"""
import sys, os, re, json, subprocess, tempfile
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "../.."))

def main():
    fast = "--fast" in sys.argv[1:]
    bad = []
    # 1. types
    r = subprocess.run(["npx", "tsc", "-p", "scripts/rig3d/tsconfig.rig.json"], cwd=ROOT, capture_output=True, text=True)
    errs = [l for l in (r.stdout + r.stderr).splitlines() if "error TS" in l and "TS7016" not in l]
    print("1. types: " + ("ok" if not errs else "%d errors" % len(errs)))
    for l in errs[:10]: print("   " + l)
    if errs: bad.append("types")
    # 2. arms
    tmp = tempfile.mkdtemp(prefix="rig3d-acc.")
    r = subprocess.run(["node", os.path.join(HERE, "render.mjs"), os.path.join(ROOT, "src/videos/group/preview/rig3d_acc_qa.ts"), os.path.join(tmp, "x.png")], capture_output=True, text=True)
    rows = re.findall(r"QA: acc (\S+) clear (-?[\d.]+) at \S+ drop (-?[\d.]+)(?: at (\S+))? new (\d+) reach (-?[\d.]+)", r.stdout)
    names = [n for n, *_ in rows]
    worse = [(n, d, at, nw, rc) for n, _c, d, at, nw, rc in rows if int(nw) > 0 or float(rc) > 0.0005 or float(d) > 0.0005]
    if r.returncode != 0 or not rows:
        bad.append("arms"); print("2. arms: the check did not run"); print("   " + "\n   ".join((r.stdout + r.stderr).strip().splitlines()[-5:]))
    else:
        print("2. arms: %d accessories, %s" % (len(rows), "none makes an arm clip or miss" if not worse else "%d make it worse" % len(worse)))
        for n, d, at, nw, rc in worse: print("   %s: %s new clipping cases, clearance down by %s m at %s, reach %s" % (n, nw, d, at or "-", rc))
        if worse: bad.append("arms")
    # 3. the list
    cases = {c["name"] for c in json.load(open(os.path.join(HERE, "golden/cases_acc.json")))}
    hf = os.path.join(HERE, "golden/hashes_acc.json")
    hashes = json.load(open(hf)) if os.path.exists(hf) else {}
    recorded = {k.split("/")[0] for k in hashes}
    no_case = [n for n in names if "acc_" + n not in cases]
    no_pic = [n for n in names if "acc_" + n in cases and "acc_" + n not in recorded]
    print("3. the list: %d in the catalogue, %d without a case, %d not recorded yet" % (len(names), len(no_case), len(no_pic)))
    for n in no_case: print('   add to golden/cases_acc.json:  { "name": "acc_%s", "entry": "rig3d_acc.ts", "size": "360x640", "pick": [0, 30, 60], "opts": { "turn": { "set": "%s", "look": "you" } } }' % (n, n))
    for n in no_pic: print("   look at its pictures, then:  python3 scripts/rig3d/regress.py --update acc_%s" % n)
    if no_case: bad.append("list")
    # 4. pictures
    if not fast:
        r = subprocess.run([sys.executable, os.path.join(HERE, "regress.py"), "--jobs", "3"], capture_output=True, text=True)
        out = r.stdout.strip().splitlines()
        changed = [l for l in out if "CHANGED" in l or "RENDER FAILED" in l]
        new = [l for l in out if "NEW (" in l]
        print("4. pictures: " + (out[-1] if out else "the check did not run"))
        for l in changed[:20]: print("   " + l)
        if new: print("   %d new pictures (an accessory that is not recorded yet)" % len(new))
        if changed or not out: bad.append("pictures")
    print("FAILED: " + ", ".join(bad) if bad else "ALL GOOD" + ("" if not fast else " (pictures not checked)"))
    sys.exit(1 if bad else 0)

if __name__ == "__main__":
    main()
