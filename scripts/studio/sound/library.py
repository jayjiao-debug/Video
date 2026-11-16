#!/usr/bin/env python3
"""The shared sound library (item 12): sounds the owner has approved, reused across films instead of made again.

Lives on the Mac at ~/Claude/studio/library/ (never in the repo: it is public and holds no audio):
  library.json                  the index: one entry per sound
  <category>/<name>.<ext>       the files (rec, poweroff, knock, steps, door, paper, amb, music, ui, voice, misc)
  index.html                    a page with a play button per sound (studio library page)

  studio library add <file> --name knock_wood_2 --cat knock [--film newton] [--tags "door,two"] [--note "..."]
                     [--approved "owner, 15 Nov"] [--loop] [--move]
  studio library list [--cat knock] [--q door]
  studio library retire <name> --why "..."
  studio library page                     write index.html and print its path
  studio library measure                  fill seconds / loudness / peak for every entry

Rules (from the owner's notes on 李白 and Newton): a sound is placed ONCE by an event and is never looped unless it is
a bed ("loop": true only for ambience beds and music beds, made to loop); one-shot effects carry "loop": false and the
gate flags them when heard again and again. The film's clips folder sees every library sound by its file name (studio
links them in), so a cues.json names a library sound exactly as it names its own clips; a film's own file of the same
name wins.
"""
import argparse, html, json, os, shutil, sys, time
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import slib

LIB = slib.LIBRARY
IDX = os.path.join(LIB, "library.json")
CATS = ["rec", "poweroff", "knock", "steps", "door", "paper", "cloth", "hit", "ui", "amb", "music", "voice", "misc"]


def load():
    return slib.load_json(IDX, {"sounds": []})


def save(lib):
    lib["updated"] = time.strftime("%Y-%m-%d %H:%M:%S")
    slib.save_json(IDX, lib)


def measure(path):
    try:
        import numpy as np
        sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "gate"))
        import av
        x = av.audio(path)
        return {"seconds": round(len(x) / 48000, 2), "lufs": round(av.lufs(x), 1) if len(x) > 48000 * 0.5 else None,
                "peak_db": round(float(20 * np.log10(np.max(np.abs(x)) + 1e-12)), 1)}
    except Exception as e:
        return {"measure_error": str(e)[:200]}


def cmd_add(a):
    lib = load()
    if any(s["name"] == a.name for s in lib["sounds"]):
        slib.die(f"there is already a sound named {a.name} (retire it first, or pick another name)")
    if a.cat not in CATS:
        slib.die(f"category must be one of {', '.join(CATS)}")
    ext = os.path.splitext(a.file)[1].lower()
    rel = os.path.join(a.cat, a.name + ext)
    dst = os.path.join(LIB, rel)
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    (shutil.move if a.move else shutil.copyfile)(a.file, dst)
    e = {"name": a.name, "file": rel, "category": a.cat, "film": a.film, "tags": [t.strip() for t in (a.tags or "").split(",") if t.strip()],
         "note": a.note, "approved": a.approved, "loop": bool(a.loop), "status": "approved" if a.approved else "candidate",
         "added": time.strftime("%Y-%m-%d")}
    e.update(measure(dst))
    lib["sounds"].append(e)
    save(lib)
    print(f"added {a.name} -> {dst} ({e.get('seconds')} s, {e['status']})")


def cmd_list(a):
    for s in load()["sounds"]:
        if a.cat and s["category"] != a.cat: continue
        if a.q and a.q.lower() not in json.dumps(s, ensure_ascii=False).lower(): continue
        print(f"{s['name']:28s} {s['category']:9s} {str(s.get('seconds', '?')):>6s} s  {'loop ' if s.get('loop') else ''}{s.get('status')}  {s.get('film') or ''}  {s.get('note') or ''}")


def cmd_retire(a):
    lib = load()
    for s in lib["sounds"]:
        if s["name"] == a.name:
            s["status"] = "retired"; s["retired_because"] = a.why
            save(lib); print(f"retired {a.name}"); return
    slib.die(f"no sound named {a.name}")


def cmd_measure(a):
    lib = load()
    for s in lib["sounds"]:
        s.update(measure(os.path.join(LIB, s["file"])))
    save(lib); print(f"measured {len(lib['sounds'])} sounds")


def cmd_page(a):
    lib = load()
    rows = []
    for cat in CATS:
        ss = [s for s in lib["sounds"] if s["category"] == cat and s.get("status") != "retired"]
        if not ss: continue
        rows.append(f"<h2>{cat}</h2>")
        for s in ss:
            rows.append(f"<div class='s'><button onclick=\"play(this,'{html.escape(s['file'])}')\">▶</button>"
                        f"<b>{html.escape(s['name'])}</b> <span>{s.get('seconds', '?')} s{' · loop' if s.get('loop') else ''} · {html.escape(s.get('status', ''))}"
                        f"{' · ' + html.escape(s['film']) if s.get('film') else ''}</span><div class='n'>{html.escape(s.get('note') or '')}</div></div>")
    page = PAGE.replace("{{ROWS}}", "\n".join(rows) or "<p>The library is empty. Add a sound with: studio library add &lt;file&gt; --name … --cat …</p>")
    out = os.path.join(LIB, "index.html")
    open(out, "w", encoding="utf-8").write(page)
    print(out)


PAGE = """<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Sound library</title><style>
:root{--bg:#fafaf7;--fg:#1d1d1b;--mut:#6b6b66;--card:#fff;--line:#e4e2dc;--acc:#c2410c}
@media (prefers-color-scheme:dark){:root{--bg:#161615;--fg:#ecebe6;--mut:#9a9890;--card:#1f1f1d;--line:#33322f;--acc:#fb923c}}
body{background:var(--bg);color:var(--fg);font:15px/1.45 -apple-system,system-ui,sans-serif;margin:0 auto;max-width:760px;padding:16px}
h2{font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:var(--mut);margin:24px 0 8px}
.s{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:10px 12px;margin:6px 0}
.s span{color:var(--mut);font-size:13px}.n{color:var(--mut);font-size:13px;margin-left:42px}
button{width:32px;height:32px;border-radius:50%;border:0;background:var(--acc);color:#fff;margin-right:10px;cursor:pointer}
</style></head><body><h1>Sound library</h1><p style="color:var(--mut)">Approved sounds, reused across films. One-shots are placed once, never looped.</p>
{{ROWS}}
<script>let cur=null,btn=null;function play(b,f){if(cur){cur.pause();btn.textContent='▶';if(btn===b){cur=null;return}}
cur=new Audio(f);btn=b;b.textContent='■';cur.onended=()=>{b.textContent='▶';cur=null};cur.play()}</script></body></html>"""


def main():
    ap = argparse.ArgumentParser(prog="studio library")
    sp = ap.add_subparsers(dest="cmd", required=True)
    p = sp.add_parser("add"); p.add_argument("file"); p.add_argument("--name", required=True); p.add_argument("--cat", required=True)
    p.add_argument("--film"); p.add_argument("--tags"); p.add_argument("--note"); p.add_argument("--approved"); p.add_argument("--loop", action="store_true")
    p.add_argument("--move", action="store_true"); p.set_defaults(fn=cmd_add)
    p = sp.add_parser("list"); p.add_argument("--cat"); p.add_argument("--q"); p.set_defaults(fn=cmd_list)
    p = sp.add_parser("retire"); p.add_argument("name"); p.add_argument("--why", required=True); p.set_defaults(fn=cmd_retire)
    sp.add_parser("page").set_defaults(fn=cmd_page)
    sp.add_parser("measure").set_defaults(fn=cmd_measure)
    a = ap.parse_args()
    os.makedirs(LIB, exist_ok=True)
    a.fn(a)


if __name__ == "__main__":
    main()
