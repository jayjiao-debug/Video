"""Pacing check: where does the viewer finish reading and then wait?

For every subtitle, compares how long it stays on screen with how long it takes to read
(a phone viewer reads Chinese subtitles at ~7 characters a second, plus ~0.5 s to notice
the new line), and reports the wait. If the rendered video exists, it also measures how
much the picture moves during each wait, because a wait over a picture that is doing
something worth watching (a reveal landing, coins flying) is not dead air; a wait over a
held shot is.

  python -m pipeline.pace regress                 # timeline only
  python -m pipeline.pace regress out/regress.mp4 # + picture motion during each wait
  python -m pipeline.pace regress out/regress.mp4 --ref out/ox.mp4   # + flow vs an approved episode

Targets (pacing skill): no single wait over ~1.2 s unless something big happens on
screen in it (a cut, a landing), total waiting under ~12 % of the runtime, no stretch without a subtitle longer than ~2 s outside the
title card, end card and planned visual beats.
"""
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CPS = 7.0  # characters per second a phone viewer reads
NOTICE = 0.5  # seconds to notice a new line and start reading
GRACE = 0.6  # a moment to take the picture in after the line is read
PUNCT = set("，。、：；！？“”‘’《》（）—…·[]{}①②③④⑤ ,.!?:;\"'()")


def read_time(text):
    n = sum(1 for c in text if c not in PUNCT)
    return max(1.3, NOTICE + n / CPS)


def flow(path):
    """How busy and how jerky the picture is: mean and p95 motion, and p99 of the change in motion
    frame to frame (a camera that starts and stops, or moves crammed into too little time, shows here)."""
    import numpy as np
    from pipeline.stillness import motion as mo
    m, _ = mo(path, fps=30)
    sm = np.convolve(m, np.ones(3) / 3, mode="same")
    jerk = np.abs(np.diff(sm))
    return float(m.mean()), float(np.percentile(m, 95)), float(np.percentile(jerk, 99)), float(jerk.mean())


def main():
    args = sys.argv[1:]
    ref = None
    if "--ref" in args:
        i = args.index("--ref")
        ref = args[i + 1]
        args = args[:i] + args[i + 2:]
    ep = args[0]
    video = args[1] if len(args) > 1 else None
    tl = json.load(open(os.path.join(ROOT, "public", "build", ep, "timeline.json"), encoding="utf-8"))
    fps = tl["fps"]
    total = tl["durationInFrames"] / fps
    motion = None
    if video:
        from pipeline.stillness import motion as mo
        m, mfps = mo(video)
        motion = lambda a, b: float(m[int(a * mfps):max(int(a * mfps) + 1, int(b * mfps))].mean())
    # every line the viewer reads: subtitles, and lines shown as on-screen cards (subtitles: false)
    subs = []
    for sc in tl["scenes"]:
        for ln in sc["lines"]:
            if ln["text"] and not ln["silent"]:
                subs.append({"text": ln["text"], "from": sc["from"] + ln["from"], "to": sc["from"] + ln["from"] + ln["duration"]})
    waits, dead = [], []
    for s in subs:
        a, b = s["from"] / fps, s["to"] / fps
        r = read_time(s["text"])
        w = (b - a) - r - GRACE
        mv = motion(a + r + GRACE, b) if motion and w > 0.2 else None
        waits.append((w, a, b, r, mv, s["text"]))
    # gaps with no subtitle (the title card, planned visual beats and the end card show up here too)
    for prev, nxt in zip(subs, subs[1:]):
        g = (nxt["from"] - prev["to"]) / fps
        if g > 2.0:
            dead.append((prev["to"] / fps, nxt["from"] / fps, g))
    tail = total - subs[-1]["to"] / fps if subs else total
    tot = sum(max(0.0, w[0]) for w in waits)
    quiet = sum(max(0.0, w[0]) for w in waits if w[4] is not None and w[4] < 1.0)
    print(f"{tl['title']}  {total:.1f}s, {len(subs)} subtitles; reading model {CPS:g} cps + {NOTICE}s, grace {GRACE}s")
    print(f"waiting after reading: {tot:.1f}s total = {100 * tot / total:.0f}% of the runtime" + (f" ({quiet:.1f}s of it with no big change on screen)" if motion else ""))
    print("\nlongest waits:")
    for w, a, b, r, mv, t in sorted(waits, key=lambda x: -x[0])[:12]:
        if w <= 0.5:
            break
        tag = "" if mv is None else f"  picture motion {mv:.2f}" + (" (a big change: cut or landing)" if mv >= 1.0 else "")
        print(f"  {a:6.1f}s  on {b - a:4.1f}s, read {r:3.1f}s → wait {w:3.1f}s{tag}  {t}")
    if dead:
        print("\nno subtitle for > 2 s:")
        for a, b, g in dead:
            print(f"  {a:6.1f} – {b:6.1f}s  ({g:.1f}s)")
    print(f"  end card / tail: {tail:.1f}s")
    # a camera drift is not news: only a big change on screen (a cut, a landing) excuses a wait
    over = [w for w in waits if w[0] > 1.2 and (w[4] is None or w[4] < 1.0)]
    # too tight is a failure too: squeezed windows cram camera moves and cuts (v2 of 《夸完就翻车》 at 5 %)
    verdict = "TOO TIGHT" if tot < 0.06 * total else ("PASS" if tot <= 0.12 * total and not over else "TOO SLOW")
    print(f"\n{verdict}: {len(over)} lines wait > 1.2 s with nothing new on screen; waiting {100 * tot / total:.0f}% (target 6–12%)")
    if video:
        rows = [("this", flow(video))] + ([("ref", flow(ref))] if ref else [])
        print("\nflow (motion mean / p95, jerk mean / p99): keep within ~15 % of an approved episode")
        for name, (mm, p95, j99, jm) in rows:
            print(f"  {name:<5} {mm:.2f} / {p95:.2f}   {jm:.3f} / {j99:.2f}")


if __name__ == "__main__":
    main()
