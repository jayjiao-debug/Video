#!/usr/bin/env python3
"""One command to run after adding or changing an accessory (kit/rigacc/): it stops at the first thing that broke.

  python3 scripts/rig3d/acc_check.py            everything below
  python3 scripts/rig3d/acc_check.py --fast     steps 1 to 3 only (no pictures are rendered)
  python3 scripts/rig3d/acc_check.py --jobs 2   renders at a time in steps 4 and 5 (default 3)

  1. types: npx tsc -p scripts/rig3d/tsconfig.rig.json
  2. arms: every accessory in the catalogue (kit/rigacc/catalog.ts) on 13 builds x 5 poses x 32 camera positions;
     no case may clip that does not clip without the accessory, every hand must reach its place, and a thing in the
     hand must not pass through the figure's own body or head
     rules: the rules every accessory keeps (RIG3D.md, "rules"), checked from its geometry on the same 13 builds:
     nothing in 3D in front of the face
  3. the list: every catalogue name needs a line "acc_<name>" in golden/cases_acc.json and a recorded picture
  4. pictures: regress.py, all cases. The figures without accessories and every accessory that was recorded before
     must come out the same, pixel for pixel. Only a NEW accessory's own case may be new: look at its pictures, then
     record them with  python3 scripts/rig3d/regress.py --update acc_<name>
  5. motion: every accessory on a figure that turns on the spot and walks, at the size it has in a film. Counts the
     single-pixel specks (one wrong pixel that flickers as the figure moves; RIG3D.md, "specks") and compares with
     the same figure in the same place without the accessory. Stills cannot show these. The line it prints names
     the accessories that add the most, also when all pass.
"""
import sys, os, re, json, math, shutil, subprocess, tempfile
HERE = os.path.dirname(os.path.abspath(__file__))
HELD_TOL = 0.003     # metres a thing in the hand may sink into the body or head before it counts (a brush of cloth)
# step 5: five figures to a row, 395 pixels to the metre (a figure about 670 px tall: a film's full shot at 1080 x 1920)
MOTION = [("turn", 21, {"sweep": [-50, 50]}, {}),                              # the row turns 5 degrees a frame
          ("walk", 16, {"run": 15}, {"pose": "walk", "facing": 25})]           # one walk cycle, 2 film frames apart
# specks an accessory may add to its figure over all the motion frames before it counts. What it has to let through:
# the faint dots of thin details (the tip of a highlight, a painted crease), 0 to 3 for an accessory depending on
# where in the row it stands. What it has to catch: an outline that breaks up in motion (the brims' dotted rows
# were 10 to 16 more). A figure without accessories has the same count in the same place from run to run.
SPECKS_OVER = 3

def motion(names, jobs, keep):
    """-> {name: (specks with it, specks of the same place in the row without it)}, the frames' folder"""
    sys.path.insert(0, HERE)
    from specks import find
    # five to a row, 0.72 m apart: a walker's headphones must stay inside its own fifth of the picture, or their specks
    # are counted on the figure beside it (at six to a row, 0.6 m apart, a headset's specks landed on the tie's count)
    PER, GAP, Y0, Y1, H = 5, 0.72, -0.04, 1.78, 720
    W = int(round(PER * GAP / (Y1 - Y0) * H / 2) * 2)
    cam = {"pos": [-1.2, 1.05, 2.44], "look": [-1.2, (Y0 + Y1) / 2, 0.2], "fov": 2 * math.degrees(math.atan((Y1 - Y0) / 2 / 2.24))}
    groups = [names[i:i + PER] for i in range(0, len(names), PER)] + [[]]         # the last row: nobody wears anything
    tmp = tempfile.mkdtemp(prefix="rig3d-motion.")
    todo = [(gi, tag, n, lu, wh) for gi in range(len(groups)) for tag, n, lu, wh in MOTION]
    for k in range(0, len(todo), jobs):
        run = []
        for gi, tag, n, lu, wh in todo[k:k + jobs]:
            who = [{"look": "you", **wh, **({"set": groups[gi][c]} if c < len(groups[gi]) else {})} for c in range(PER)]
            o = {"w": W, "h": H, "frames": n, "cam": cam, "lineup": {"gap": GAP, "who": who, **lu}}
            out = os.path.join(tmp, "g%d_%s" % (gi, tag))
            run.append((out, subprocess.Popen(["node", os.path.join(HERE, "render.mjs"), os.path.join(ROOT, "src/videos/group/preview/rig3d_acc_row.ts"), out, "--pick", ",".join(map(str, range(n))), "--opts", json.dumps(o)], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)))
        for out, pr in run:
            txt = pr.communicate()[0]
            if pr.returncode != 0 or len([f for f in os.listdir(out) if f.endswith(".png")]) != dict((t, n) for t, n, *_ in MOTION)[out.rsplit("_", 1)[1]]:
                return None, tmp, "\n   ".join(txt.strip().splitlines()[-4:])
    count = []
    for gi in range(len(groups)):
        col = [0] * PER
        for tag, n, *_ in MOTION:
            d = os.path.join(tmp, "g%d_%s" % (gi, tag))
            for f in sorted(os.listdir(d)):
                for x, *_r in find(os.path.join(d, f)): col[min(PER - 1, x * PER // W)] += 1
        count.append(col)
    res = {nm: (count[gi][c], count[-1][c], "g%d" % gi, c) for gi, g in enumerate(groups) for c, nm in enumerate(g)}
    if not keep: shutil.rmtree(tmp, ignore_errors=True)
    return res, tmp, ""
ROOT = os.path.abspath(os.path.join(HERE, "../.."))

def main():
    args = sys.argv[1:]
    fast = "--fast" in args
    jobs = int(args[args.index("--jobs") + 1]) if "--jobs" in args else 3
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
    rows = re.findall(r"QA: acc (\S+) clear (-?[\d.]+) at \S+ drop (-?[\d.]+)(?: at (\S+))? new (\d+) reach (-?[\d.]+) held (-?[\d.]+) at (\S+)", r.stdout)
    names = [n for n, *_ in rows]
    worse = [(n, d, at, nw, rc) for n, _c, d, at, nw, rc, _h, _hat in rows if int(nw) > 0 or float(rc) > 0.0005 or float(d) > 0.0005]
    through = [(n, h, hat) for n, _c, _d, _at, _nw, _rc, h, hat in rows if float(h) < -HELD_TOL]
    rules = re.findall(r"QA: rule (\S+) (\S+) on (\d+) of (\d+) looks \(([^)]*)\): (.*)", r.stdout)
    shutil.rmtree(tmp, ignore_errors=True)
    if r.returncode != 0 or not rows:
        bad.append("arms"); print("2. arms: the check did not run"); print("   " + "\n   ".join((r.stdout + r.stderr).strip().splitlines()[-5:]))
    else:
        print("2. arms: %d accessories, %s" % (len(rows), "none makes an arm clip or miss" if not worse else "%d make it worse" % len(worse)))
        for n, d, at, nw, rc in worse: print("   %s: %s new clipping cases, clearance down by %s m at %s, reach %s" % (n, nw, d, at or "-", rc))
        for n, h, hat in through: print("   %s: the thing in the hand passes %.0f mm into the figure's own body or head at %s (move it with held({ offset }), or say hang: true if it hangs from the hand)" % (n, -1000 * float(h), hat))
        if worse or through: bad.append("arms")
        print("   rules: " + ("every accessory keeps them" if not rules else "%d broken" % len(rules)))
        for n, rule, k, of, looks, msg in rules: print("   %s breaks the rule \"%s\" on %s of %s builds (%s): %s" % (n, rule, k, of, looks, msg))
        if rules: bad.append("rules")
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
        r = subprocess.run([sys.executable, os.path.join(HERE, "regress.py"), "--jobs", str(jobs)], capture_output=True, text=True)
        out = r.stdout.strip().splitlines()
        changed = [l for l in out if "CHANGED" in l or "RENDER FAILED" in l]
        new = [l for l in out if "NEW (" in l]
        print("4. pictures: " + (out[-1] if out else "the check did not run"))
        for l in changed[:20]: print("   " + l)
        if new: print("   %d new pictures (an accessory that is not recorded yet)" % len(new))
        if changed or not out: bad.append("pictures")
    # 5. motion
    if not fast and names:
        res, tmp, err = motion(names, jobs, keep=True)
        if res is None:
            bad.append("motion"); print("5. motion: the check did not run\n   " + err)
        else:
            more = [(n, a, b, g, c) for n, (a, b, g, c) in res.items() if a > b + SPECKS_OVER]
            frames = sum(n for _t, n, *_ in MOTION)
            top = sorted(((a - b, n) for n, (a, b, g, c) in res.items() if a > b), reverse=True)[:3]
            most = "; the most: " + ", ".join("%s +%d" % (n, d) for d, n in top) + "; the limit is +%d" % SPECKS_OVER if top else ""
            print("5. motion: %d accessories turning and walking, %s" % (len(res), "none adds specks" + most if not more else "%d add specks (the limit is +%d)" % (len(more), SPECKS_OVER)))
            for n, a, b, g, c in more: print("   %s: %d single-pixel specks in %d frames (the same figure without it: %d). Frames: %s/%s_turn and _walk, figure %d from the left; RIG3D.md \"specks\" has the causes" % (n, a, frames, b, tmp, g, c + 1))
            if more: bad.append("motion")
            else: shutil.rmtree(tmp, ignore_errors=True)
    print("FAILED: " + ", ".join(bad) if bad else "ALL GOOD" + ("" if not fast else " (pictures not checked)"))
    sys.exit(1 if bad else 0)

if __name__ == "__main__":
    main()
