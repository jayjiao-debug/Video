#!/usr/bin/env python3
"""The delivery gate (item 4 of the pipeline review). One command, run on every version before it is delivered:

  studio gate <film> --version v7          (studio film runs it for you, after the mux)

Checks, each with evidence the reviewer can look at:
  clipping   the kit's headless clearance checker over the whole film (figures, props and sets passing through each other)
  overlays   cards, titles and effects against in-world signs and against each other (Newton's E4 board behind
             Humphrey's card); without the film's sign export, a sheet of what each card covers, before and during
  text       time on screen against reading time for every caption and card (too short, too long, lingering)
  sound      length, loudness, true peak, clicks, holes, line edges cut, voice over the rest, looped sounds, low thump
  ground     pixels that pop and come back (sparkle, a jiggling ground or outline) per second, worst frames shown
  mask       the phone mask over a sheet of frames, and a masked watch copy; boxes outside the safe area
  changes    every second that changed since the last version, with before / after frames
The result is gate/gate.md (for people), gate/gate.json (for the deliver step: it holds the master's hash, so any change
after the gate means the gate runs again) and the evidence images. Exit 1 = FAIL (nothing is delivered), 0 = PASS or LOOK.
"""
import argparse, json, os, subprocess, sys, time
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.dirname(HERE))
import slib, timeline, av
from slib import log

# starting thresholds; a film config may override any of them under "gate": {"rules": {...}}
RULES = {
    "clip_fail_cm": 3.0,          # an on-screen interpenetration this deep fails
    "clip_look_cm": 1.0,
    "text_min_ratio": 0.8,        # a caption shown for less than 0.8 x its reading time
    "text_max_extra_s": 2.5,      # a caption or card shown more than reading time + 2.5 s
    "card_min_s": 1.6,
    "lufs": [-19.5, -13.0],       # integrated loudness of the mix (mono reading)
    "true_peak_db": -1.0,
    "under_voice_db": [10.0, 30.0],   # voice over everything else, per line (house rule 14 to 22; warn outside 10..30)
    "edge_db": -28.0,             # a line's first / last 25 ms louder than this against the line: cut
    "flicker_fail": 3.0,          # gray levels of pop-and-return averaged over the ground region
    "flicker_look": 1.2,
    "change_thr": 2.0,
}
SAFE = {"x0": 110, "x1": 970, "x1_low": 890, "low_y": 1000, "top_y": 222, "bottom_y": 1490}


class Gate:
    def __init__(self, a):
        self.a = a
        self.vdir = a.vdir
        self.g = os.path.join(a.vdir, "gate")
        os.makedirs(self.g, exist_ok=True)
        self.cfg = slib.load_json(a.config, {}) or {}
        self.rules = dict(RULES, **(self.cfg.get("gate", {}).get("rules", {})))
        self.job = slib.load_json(os.path.join(a.vdir, "job.json"), {}) or {}
        self.master = os.path.join(a.vdir, "master.mp4")
        self.watch = os.path.join(a.vdir, "watch540.mp4")
        self.findings = []          # (check, level FAIL|LOOK|INFO, text, evidence or None)
        self.summary = {}
        self.fps = slib.FPS
        self.offset = int(a.frames.split("-")[0]) if a.frames else 0   # a range: film frame of the video's frame 0

    def add(self, check, level, text, ev=None):
        """a finding; the film config's "gate.accept" list ([{"check", "match" (regex on the text), "why"}]) turns a
        known, intended one (a rider sitting into the horse, a thrown cup in the air) into INFO with its reason"""
        import re
        if level in ("FAIL", "LOOK"):
            for acc in self.cfg.get("gate", {}).get("accept", []):
                if acc.get("check", check) == check and re.search(acc["match"], text):
                    level, text = "INFO", f"accepted ({acc.get('why', 'intended')}): {text}"
                    break
        self.findings.append((check, level, text, ev))

    def t(self, f):
        s = (f + self.offset) / self.fps
        return f"{int(s // 60)}:{s % 60:04.1f}"

    # -------------------------------------------------------------------------------------------- timeline
    def load_timeline(self):
        exp = None
        cmd = self.cfg.get("gate", {}).get("export")
        if cmd:
            exp = os.path.join(self.g, "timeline_export.json")
            rc = slib.run(slib.subst(cmd, {"REPO": self.a.repo, "GATE_JSON": exp, "WORK": self.a.work, "VER": self.vdir}), cwd=self.a.repo, check=False)
            if rc != 0:
                self.add("overlays", "LOOK", f"the film's timeline export failed (rc {rc}); captions and cards read from the generated files instead")
                exp = None
        self.tl = timeline.load(self.a.repo, self.a.film, exp)
        if self.a.frames:   # a range: keep what is inside it, on the video's clock
            a, b = [int(x) for x in self.a.frames.split("-")]
            for k in ("captions", "overlays", "signs"):
                self.tl[k] = [dict(x, **{"from": x["from"] - a, "to": x["to"] - a}) for x in self.tl[k] if x["to"] >= a and x["from"] <= b]
        log(f"timeline ({self.tl['source']}): {len(self.tl['captions'])} captions, {len(self.tl['overlays'])} overlays, {len(self.tl['signs'])} signs, {len(self.tl.get('lines', []))} voice lines")

    # -------------------------------------------------------------------------------------------- checks
    def check_clipping(self):
        run_sh = os.path.join(self.a.repo, "scripts", "kit", "qa", "clearance", "run.sh")
        kit = os.path.join(self.a.repo, "src", "videos", self.a.film, "kit.json")
        if not (os.path.exists(run_sh) and os.path.exists(kit)):
            self.add("clipping", "LOOK", "no clearance checker for this film (needs scripts/kit/qa/clearance and the film's kit.json): not checked")
            return
        out = os.path.join(self.g, "clearance")
        args = ["bash", run_sh, "--film", self.a.film, "--out", out, "--quiet"]
        if self.a.frames:
            a, b = self.a.frames.split("-"); args += ["--from", a, "--to", b]
        rc = slib.run(args, cwd=self.a.repo, check=False, env={"CLEARANCE_BUILD": os.path.join(self.g, "clearance_build")})
        files = [f for f in os.listdir(out) if f.endswith(".json")] if os.path.isdir(out) else []
        if rc != 0 and not files:
            self.add("clipping", "FAIL", f"the clearance checker did not run (rc {rc}); see the log")
            return
        n_fail = n_look = n_acc = 0
        for fn in sorted(files):
            j = slib.load_json(os.path.join(out, fn), {}) or {}
            for r in j.get("ranges", []):
                if not r.get("nOn"): continue
                d = r.get("maxOn", 0)
                lvl = "FAIL" if d >= self.rules["clip_fail_cm"] else "LOOK" if d >= self.rules["clip_look_cm"] else None
                if not lvl: continue
                f = int(r.get("fMax", 0)) - self.offset
                ev = self.crop_evidence(f, r.get("s"), f"clip_{fn[:-5]}_{r.get('fMax')}.jpg") if 0 <= f else None
                self.add("clipping", lvl, f"{self.t(f)} f{r.get('fMax')}: {r.get('a')} into {r.get('b')} by {d:.1f} cm on screen ({r.get('cat', '')}, {r.get('nOn')} frames)", ev)
                got = self.findings[-1][1]
                n_fail += got == "FAIL"; n_look += got == "LOOK"; n_acc += got == "INFO"
        self.summary["clipping"] = f"{n_fail} fail, {n_look} to look at, {n_acc} accepted as intended"

    def check_overlays(self):
        ovs, signs = self.tl["overlays"], self.tl["signs"]
        hits = 0
        for o in ovs:
            for s in signs:
                f0, f1 = max(o["from"], s["from"]), min(o["to"], s["to"])
                for f in range(f0, f1 + 1, 3):
                    bo, bs = timeline.box_at(o, f), timeline.box_at(s, f)
                    if bo and bs and overlap(bo, bs) > 0.15 * bs[2] * bs[3]:
                        ev = self.crop_evidence(f, None, f"overlay_{o.get('id')}_{s.get('id')}.jpg".replace(" ", "_"), boxes=[bo, bs])
                        self.add("overlays", "FAIL", f"{self.t(f)}: {o.get('id')} covers the in-world sign '{s.get('id')}'", ev)
                        hits += 1
                        break
        # overlays against each other (a card over a caption is by design; card over card / effect is not)
        for i, o in enumerate(ovs):
            for p in ovs[i + 1:]:
                if o.get("kind") == p.get("kind") == "caption": continue
                f0, f1 = max(o["from"], p["from"]), min(o["to"], p["to"])
                if f1 < f0: continue
                bo, bp = timeline.box_at(o, f0), timeline.box_at(p, f0)
                if bo and bp and overlap(bo, bp) > 0.1 * min(bo[2] * bo[3], bp[2] * bp[3]):
                    self.add("overlays", "LOOK", f"{self.t(f0)}: {o.get('id')} and {p.get('id')} overlap")
        # what each card covers, before and during: for the eye, always (signs the export does not know about)
        cards = [o for o in ovs if o.get("kind") in ("card", "title", "fx", None)]
        if cards and os.path.exists(self.watch):
            frames, labels = [], []
            for o in cards[:30]:
                b = max(0, o["from"] - 3); m = (o["from"] + o["to"]) // 2
                frames += [b, m]; labels += [f"before {o.get('id')}", f"{o.get('id')}"]
            import sheet
            sheet.make_sheet(self.watch, os.path.join(self.g, "under_cards.jpg"), frames, cols=8, width=170,
                             title="what each card covers: the frame before it and the middle of it (look for signs, boards, faces under the card)", labels=labels)
            self.add("overlays", "LOOK" if not signs else "INFO",
                     f"{len(cards)} cards: check under_cards.jpg for anything in the world the card hides" + ("" if signs else " (the film exports no in-world signs, so only the eye can catch this)"), "under_cards.jpg")
        self.summary["overlays"] = f"{hits} card over a sign" + ("" if signs else "; signs not exported")

    def check_text(self):
        r = self.rules
        n = 0
        for c in self.tl["captions"]:
            shown = (c["to"] - c["from"] + 1) / self.fps
            need = timeline.reading_s(c["text"], spoken=c.get("end") is not None)
            if shown < r["text_min_ratio"] * need:
                self.add("text", "LOOK", f"{self.t(c['from'])} caption '{c['text']}' {shown:.1f} s on screen, reading needs about {need:.1f} s"); n += 1
            elif shown > need + r["text_max_extra_s"] and c.get("end") is not None and (c["to"] - c["end"]) / self.fps > 1.0:
                self.add("text", "LOOK", f"{self.t(c['from'])} caption '{c['text']}' stays {shown:.1f} s ({(c['to'] - c['end']) / self.fps:.1f} s after the words end)"); n += 1
        for o in self.tl["overlays"]:
            if o.get("kind") != "card" or not o.get("text"): continue
            shown = (o["to"] - o["from"] + 1) / self.fps
            need = max(r["card_min_s"], timeline.reading_s(o["text"]))
            if shown < need:
                self.add("text", "FAIL" if shown < 0.6 * need else "LOOK", f"{self.t(o['from'])} {o['id']} '{o['text'][:24]}' {shown:.1f} s on screen, reading needs about {need:.1f} s"); n += 1
            elif shown > need + r["text_max_extra_s"] + 1.0:
                self.add("text", "LOOK", f"{self.t(o['from'])} {o['id']} stays {shown:.1f} s for {need:.1f} s of reading"); n += 1
        self.summary["text"] = f"{len(self.tl['captions'])} captions and {sum(1 for o in self.tl['overlays'] if o.get('kind') == 'card')} cards timed, {n} flagged"

    def check_sound(self):
        r = self.rules
        mix = self.job.get("mix")
        if not mix or not os.path.exists(mix):
            self.add("sound", "FAIL", "the version has no sound mix (silent master)")
            return
        x = av.audio(mix)
        sr = 48000
        p = slib.probe(self.master)
        vd = p["frames"] / p.get("fps", 30)
        if abs(len(x) / sr - vd) > 1 / 30:
            self.add("sound", "FAIL", f"sound {len(x) / sr:.3f} s against picture {vd:.3f} s")
        L, tp = av.lufs(x), av.true_peak_db(x)
        lvl = "LOOK" if not (r["lufs"][0] <= L <= r["lufs"][1]) else None
        if lvl: self.add("sound", lvl, f"loudness {L:.1f} LUFS, outside {r['lufs'][0]} to {r['lufs'][1]}")
        if tp > r["true_peak_db"]: self.add("sound", "FAIL", f"true peak {tp:.1f} dBTP, over {r['true_peak_db']} (it will clip after AAC)")
        for t, j in av.clicks(x)[:10]:
            self.add("sound", "LOOK", f"{self.t(t * 30)} a click (jump {j})")
        for t, d in av.holes(x)[:10]:
            self.add("sound", "LOOK", f"{self.t(t * 30)} {d:.2f} s of digital silence")
        stems = self.job.get("stems") or {}
        lines = [(i, s - self.offset / 30, e - self.offset / 30) for i, s, e in self.tl.get("lines", [])]
        notes = [f"{L:.1f} LUFS", f"true peak {tp:.1f} dBTP"]
        if stems.get("voice") and lines:
            v = av.audio(stems["voice"])
            for lid, side, db in av.line_edges(v, lines, rel_db=r["edge_db"])[:20]:
                self.add("sound", "LOOK", f"line {lid}: the voice is still loud at its {side} ({db} dB): cut mid-sound?")
            rest = sum(av.audio(stems[g]) for g in stems if g != "voice")
            if not isinstance(rest, int):
                n = min(len(v), len(rest))
                uv = av.under_voice(v[:n], rest[:n], lines)
                lo, hi = r["under_voice_db"]
                for lid, db in uv:
                    if db < lo: self.add("sound", "LOOK", f"line {lid}: the voice is only {db} dB over the rest (hard to hear)")
                    elif db > hi: self.add("sound", "LOOK", f"line {lid}: nothing under the voice ({db} dB): music or room too quiet?")
                if uv: notes.append(f"voice over the rest {min(d for _, d in uv)} to {max(d for _, d in uv)} dB")
        elif not stems:
            notes.append("no stems: line edges and voice-over-the-rest not measured")
        for g in ("sfx", "amb"):
            if stems.get(g):
                for t0, cnt, times in av.repeats(av.audio(stems[g])):
                    self.add("sound", "LOOK", f"{g}: the same sound {cnt} times ({', '.join(self.t(t * 30) for t in times[:6])}): a loop?")
        mus = stems.get("music")
        if mus:
            share, per, reg = av.low_thump(av.audio(mus))
            if share > 0.35 and reg > 0.6:
                self.add("sound", "LOOK", f"music: {share:.0%} of its energy is below 120 Hz with a steady {per} s pulse (a thump on a phone?)")
        self.summary["sound"] = ", ".join(notes)

    def check_ground(self):
        if not os.path.exists(self.watch):
            return
        W, H = 270, 480
        r = self.rules
        cmd = [slib.ffmpeg(), "-v", "error", "-i", self.watch, "-vf", f"scale={W}:{H}:flags=area,format=gray", "-f", "rawvideo", "-pix_fmt", "gray", "-"]
        proc = subprocess.Popen(cmd, stdout=subprocess.PIPE)
        size = W * H
        prev = None
        scores_g, scores_all, cut_at = [], [], []
        keep = {}
        chunk = 300
        while True:
            b = proc.stdout.read(size * chunk)
            if not b: break
            F = np.frombuffer(b, dtype=np.uint8).reshape(-1, H, W)
            if prev is not None: F = np.concatenate([prev, F])
            sg = av.flicker(F, (int(H * 0.62), int(H * 0.92), 20, W - 20))     # the ground band, inside the phone's crop
            sa = av.flicker(F, (int(H * 0.13), int(H * 0.92), 20, W - 20))
            c = av.cuts(F)
            start = 0 if prev is None else 2
            base = len(scores_g) - (0 if prev is None else 2)
            for i in range(start, len(F) - (2 if len(b) == size * chunk else 0)):
                scores_g.append(sg[i]); scores_all.append(sa[i])
                if i in c: cut_at.append(base + i)
            prev = F[-4:] if len(b) == size * chunk else None
            if prev is not None:
                scores_g, scores_all = scores_g, scores_all
            keep_window = F
        proc.wait()
        sg, sa = np.array(scores_g), np.array(scores_all)
        for c in cut_at:     # a cut is not a flicker
            sg[max(0, c - 1):c + 2] = 0; sa[max(0, c - 1):c + 2] = 0
        n = len(sg)
        per_s = [(i, float(sg[i * 30:(i + 1) * 30].mean()), float(sa[i * 30:(i + 1) * 30].mean())) for i in range(n // 30 + (1 if n % 30 else 0))]
        bad = [(i, g, w) for i, g, w in per_s if max(g, w) >= r["flicker_look"]]
        bad.sort(key=lambda x: -max(x[1], x[2]))
        worst_frames = []
        for i, g, w in bad[:8]:
            f = i * 30 + int(np.argmax(sa[i * 30:(i + 1) * 30]))
            lvl = "FAIL" if max(g, w) >= r["flicker_fail"] else "LOOK"
            self.add("ground", lvl, f"{self.t(f)}: pixels pop and come back (ground {g:.1f}, whole frame {w:.1f} gray levels): a jiggling ground, crawling outline or sparkle?")
            worst_frames.append(f)
        if worst_frames:
            self.flicker_sheet(worst_frames, "ground_worst.jpg")
            self.findings[-1] = self.findings[-1][:3] + ("ground_worst.jpg",)
        self.summary["ground"] = f"median {float(np.median(sg)):.2f}, worst second {max((max(g, w) for _, g, w in per_s), default=0):.2f} gray levels; {len(bad)} seconds flagged"
        slib.save_json(os.path.join(self.g, "ground.json"), {"per_second": per_s})

    def check_mask(self):
        if not os.path.exists(self.watch):
            return
        import sheet
        p = slib.probe(self.watch)
        n = p.get("frames", 0)
        fr = set(range(0, n, 6 * 30))
        for c in self.tl["captions"] + self.tl["overlays"]:
            if 0 <= c["from"] + 2 < n: fr.add(c["from"] + 2)
        fr = sorted(fr)
        if len(fr) > 64: fr = fr[::int(np.ceil(len(fr) / 64))]
        sheet.make_sheet(self.watch, os.path.join(self.g, "mask_sheet.jpg"), fr, cols=8, width=170, mask=True,
                         title="phone mask: red is cut by Douyin, orange is under its buttons and text, green is safe")
        # a masked watch copy for the review (day-in-life rule: draw the phone mask over every review cut)
        s = 0.5
        vf = (f"drawbox=x=0:y=0:w={int(58 * s)}:h=ih:color=red@0.35:t=fill,drawbox=x={int(1024 * s)}:y=0:w=iw:h=ih:color=red@0.35:t=fill,"
              f"drawbox=x=0:y=0:w=iw:h={int(222 * s)}:color=orange@0.25:t=fill,drawbox=x=0:y={int(1490 * s)}:w=iw:h=ih:color=orange@0.25:t=fill,"
              f"drawbox=x={int(890 * s)}:y={int(1000 * s)}:w=iw:h={int(490 * s)}:color=orange@0.25:t=fill")
        slib.run([slib.ffmpeg(), "-v", "error", "-y", "-i", self.watch, "-vf", vf, "-c:v", "libx264", "-preset", "veryfast", "-crf", "24",
                  "-c:a", "copy", "-movflags", "+faststart", os.path.join(self.g, "watch_phone_mask.mp4")], check=False, quiet=True)
        out = 0
        for o in self.tl["overlays"] + self.tl["captions"]:
            b = timeline.box_at(o, o["from"])
            if not b: continue
            x0, y0, x1, y1 = b[0], b[1], b[0] + b[2], b[1] + b[3]
            low = y1 > SAFE["low_y"]
            if x0 < SAFE["x0"] or x1 > (SAFE["x1_low"] if low else SAFE["x1"]) or y0 < SAFE["top_y"] or y1 > SAFE["bottom_y"]:
                self.add("mask", "LOOK", f"{self.t(o['from'])} {o.get('id', o.get('text', '')[:12])} reaches outside the phone's safe area ({b})"); out += 1
        self.add("mask", "INFO", "phone mask over the film: mask_sheet.jpg, and the masked watch copy watch_phone_mask.mp4", "mask_sheet.jpg")
        self.summary["mask"] = f"{len(fr)} frames on the sheet, {out} boxes outside the safe area"

    def check_changes(self):
        prev = self.a.prev
        if not prev or not os.path.exists(os.path.join(prev, "watch540.mp4")):
            self.summary["changes"] = "no earlier version to compare with"
            return
        old = av.frames_gray(os.path.join(prev, "watch540.mp4"))
        new = av.frames_gray(self.watch)
        rng, no, nn = av.changed_ranges(old, new, thr=self.rules["change_thr"])
        pv = os.path.basename(prev)
        lines = [f"# What changed since {pv}", "", f"{pv}: {no} frames ({no / 30:.1f} s). This version: {nn} frames ({nn / 30:.1f} s).", ""]
        if not rng:
            lines.append("Nothing changed in the picture.")
        tot = 0
        frames, labels, ofr = [], [], []
        for a, b, o, kind, size in rng:
            if kind == "cut":
                lines.append(f"- {self.t(a)}: {size} frames of {pv} are gone here ({size / 30:.1f} s cut)")
                continue
            tot += b - a + 1
            ot = f" ({pv} at {self.t(o)})" if o is not None else ""
            lines.append(f"- {self.t(a)} to {self.t(b)} ({(b - a + 1) / 30:.1f} s): {'new frames' if kind == 'new' else 'changed'}{ot}" + (f", up to {size} gray levels" if size else ""))
            if len(frames) < 32:
                frames.append((a + b) // 2); labels.append(f"now {kind}"); ofr.append(o + ((b - a) // 2) if o is not None else None)
        lines += ["", f"{tot / 30:.1f} s of the picture changed or are new."]
        # the sound, per second
        try:
            mo = os.path.join(prev, "watch540.mp4")
            x0, x1 = av.audio(mo, sr=8000), av.audio(self.watch, sr=8000)
            e0 = [float(np.sqrt(np.mean(x0[i:i + 8000] ** 2))) for i in range(0, len(x0), 8000)]
            e1 = [float(np.sqrt(np.mean(x1[i:i + 8000] ** 2))) for i in range(0, len(x1), 8000)]
            diff = [i for i in range(min(len(e0), len(e1))) if abs(20 * np.log10((e1[i] + 1e-6) / (e0[i] + 1e-6))) > 3]
            if diff:
                lines += ["", "Sound louder or quieter by more than 3 dB at the same second (before any length change, this is only a hint): " + ", ".join(f"{i // 60}:{i % 60:02d}" for i in diff[:40])]
        except Exception as e:
            lines += ["", f"(sound not compared: {e})"]
        open(os.path.join(self.g, "changes.md"), "w", encoding="utf-8").write("\n".join(lines) + "\n")
        if frames:
            self.pair_sheet(os.path.join(prev, "watch540.mp4"), ofr, frames, labels, "changes_sheet.jpg")
        self.add("changes", "INFO", f"{len([r for r in rng if r[3] != 'cut'])} changed stretches, {tot / 30:.1f} s, against {pv}: changes.md", "changes_sheet.jpg" if frames else None)
        self.summary["changes"] = f"{tot / 30:.1f} s changed against {pv}"

    # -------------------------------------------------------------------------------------------- evidence images
    def crop_evidence(self, f, s=None, name="ev.jpg", boxes=None):
        """the frame (from the 1080 master), with a ring at the screen point or the boxes drawn"""
        try:
            import sheet
            from PIL import ImageDraw
            im = sheet.grab(self.master, [f], 540, self.fps)[0]
            d = ImageDraw.Draw(im)
            k = im.width / 1080
            if s: d.ellipse([s[0] * k - 30, s[1] * k - 30, s[0] * k + 30, s[1] * k + 30], outline=(255, 0, 0), width=3)
            for b in boxes or []:
                d.rectangle([b[0] * k, b[1] * k, (b[0] + b[2]) * k, (b[1] + b[3]) * k], outline=(255, 0, 0), width=3)
            im.save(os.path.join(self.g, name), quality=85)
            return name
        except Exception as e:
            log(f"evidence {name} not made: {e}")
            return None

    def flicker_sheet(self, frames, name):
        from PIL import Image
        import sheet
        W = 270
        tiles = []
        for f in frames:
            ims = sheet.grab(self.watch, [max(0, f - 1), f, f + 1], W, self.fps)
            g = [np.asarray(i.convert("L"), dtype=np.int16) for i in ims]
            d1, d2 = g[1] - g[0], g[1] - g[2]
            pop = np.where(np.sign(d1) == np.sign(d2), np.minimum(np.abs(d1), np.abs(d2)), 0)
            hm = Image.fromarray(np.clip(pop * 8, 0, 255).astype(np.uint8)).convert("RGB")
            row = Image.new("RGB", (W * 2, ims[1].height))
            row.paste(ims[1], (0, 0)); row.paste(hm, (W, 0))
            tiles.append(row)
        sh = Image.new("RGB", (W * 4, tiles[0].height * ((len(tiles) + 1) // 2)))
        for i, t in enumerate(tiles):
            sh.paste(t, ((i % 2) * W * 2, (i // 2) * t.height))
        sh.save(os.path.join(self.g, name), quality=85)

    def pair_sheet(self, old_video, ofr, frames, labels, name):
        from PIL import Image, ImageDraw
        import sheet
        W = 160
        new = sheet.grab(self.watch, frames, W, self.fps)
        old = [sheet.grab(old_video, [o], W, self.fps)[0] if o is not None else Image.new("RGB", new[0].size, (40, 0, 0)) for o in ofr]
        cols = 6
        th = new[0].height
        sh = Image.new("RGB", (cols * W * 2 + (cols - 1) * 6, ((len(new) + cols - 1) // cols) * (th + 16)), (15, 15, 15))
        d = ImageDraw.Draw(sh)
        for i, (a, b) in enumerate(zip(old, new)):
            x, y = (i % cols) * (W * 2 + 6), (i // cols) * (th + 16)
            sh.paste(a, (x, y)); sh.paste(b, (x + W, y))
            d.text((x + 2, y + th + 2), f"before | now {self.t(frames[i])}", fill=(230, 230, 230))
        sh.save(os.path.join(self.g, name), quality=85)

    # -------------------------------------------------------------------------------------------- report
    def report(self):
        lv = [f[1] for f in self.findings]
        verdict = "FAIL" if "FAIL" in lv else "LOOK" if "LOOK" in lv else "PASS"
        res = {"film": self.a.film, "version": os.path.basename(self.vdir), "sha": self.job.get("sha"), "verdict": verdict,
               "when": time.strftime("%Y-%m-%d %H:%M:%S"), "master_sha256": slib.sha256(self.master) if os.path.exists(self.master) else None,
               "frames": self.a.frames, "summary": self.summary, "rules": self.rules,
               "findings": [{"check": c, "level": l, "text": t, "evidence": e} for c, l, t, e in self.findings]}
        slib.save_json(os.path.join(self.g, "gate.json"), res)
        md = [f"# Delivery gate: {self.a.film} {res['version']}: {verdict}", "",
              f"Commit {str(res['sha'])[:10]}, checked {res['when']}." + (f" Frames {self.a.frames} only (a test, not a delivery)." if self.a.frames else ""),
              "FAIL stops the delivery. LOOK needs a person's eye before the owner sees the film. INFO is evidence.", "",
              "| check | result |", "|---|---|"]
        for c in ("clipping", "overlays", "text", "sound", "ground", "mask", "changes"):
            n = [f for f in self.findings if f[0] == c]
            worst = "FAIL" if any(f[1] == "FAIL" for f in n) else "LOOK" if any(f[1] == "LOOK" for f in n) else "ok"
            md.append(f"| {c} | {worst}: {self.summary.get(c, '')} |")
        for lvl in ("FAIL", "LOOK", "INFO"):
            n = [f for f in self.findings if f[1] == lvl]
            if not n: continue
            md += ["", f"## {lvl}", ""]
            md += [f"- **{c}** {t}" + (f" ([{e}]({e}))" if e else "") for c, _, t, e in n]
        ck = os.path.join(HERE, "checklist.md")
        if os.path.exists(ck):
            md += ["", "---", "", open(ck, encoding="utf-8").read()]
        open(os.path.join(self.g, "gate.md"), "w", encoding="utf-8").write("\n".join(md) + "\n")
        log(f"gate {verdict}: " + "; ".join(f"{k}: {v}" for k, v in self.summary.items()))
        for c, l, t, e in self.findings:
            if l != "INFO": log(f"  {l} {c}: {t}")
        log(f"report: {os.path.join(self.g, 'gate.md')}")
        return 1 if verdict == "FAIL" else 0


def overlap(a, b):
    x = max(0, min(a[0] + a[2], b[0] + b[2]) - max(a[0], b[0]))
    y = max(0, min(a[1] + a[3], b[1] + b[3]) - max(a[1], b[1]))
    return x * y


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--film", required=True); ap.add_argument("--vdir", required=True); ap.add_argument("--repo", required=True)
    ap.add_argument("--work", required=True); ap.add_argument("--config", required=True); ap.add_argument("--prev")
    ap.add_argument("--frames"); ap.add_argument("--only", help="comma list of checks")
    a = ap.parse_args()
    g = Gate(a)
    g.load_timeline()
    only = set(a.only.split(",")) if a.only else None
    for c in ("clipping", "overlays", "text", "sound", "ground", "mask", "changes"):
        if only and c not in only: continue
        t0 = time.time()
        try:
            getattr(g, "check_" + c)()
        except Exception as e:
            import traceback; traceback.print_exc()
            g.add(c, "LOOK", f"the {c} check crashed: {e!r} (not checked)")
        log(f"check {c}: {time.time() - t0:.0f} s")
    sys.exit(g.report())


if __name__ == "__main__":
    main()
