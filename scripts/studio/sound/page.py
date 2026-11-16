#!/usr/bin/env python3
"""The sound page (item 12): each layer of a version's sound on its own button, for the owner's ear, before the
picture is built on it.

  studio soundpage <film> --version v3 [--deliver]

Reads the version's stems (voice, music, amb, sfx: made by the film config's "sound.stems") and the mix, encodes each
as a small m4a, and writes soundpage/index.html with: the full mix, each layer alone, the mix without each layer, and
the cue list of the film's sound build if it wrote one (*_cues.txt / cues_table.json in the version folder). With
--deliver it lands in ~/Claude/films/<film>/<version>/sound/ (open index.html on the Mac, or AirDrop the folder).
"""
import argparse, glob, html, json, os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import slib

NAMES = {"voice": "Voice", "music": "Music", "amb": "Room and ambience", "sfx": "Sound effects"}


def enc(src, dst, filt=None):
    cmd = [slib.ffmpeg(), "-v", "error", "-y"] + sum((["-i", s] for s in (src if isinstance(src, list) else [src])), [])
    if filt: cmd += ["-filter_complex", filt]
    cmd += ["-c:a", "aac", "-b:a", "128k", "-ac", "2", dst]
    slib.run(cmd, quiet=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--vdir", required=True); ap.add_argument("--film", required=True); ap.add_argument("--work")
    a = ap.parse_args()
    job = slib.load_json(os.path.join(a.vdir, "job.json"), {}) or {}
    stems = {g: p for g, p in (job.get("stems") or {}).items() if os.path.exists(p)}
    if not stems:
        stems = {os.path.splitext(os.path.basename(p))[0]: p for p in glob.glob(os.path.join(a.vdir, "stems", "*.wav"))}
    mix = job.get("mix")
    out = os.path.join(a.vdir, "soundpage")
    os.makedirs(out, exist_ok=True)
    items = []
    if mix and os.path.exists(mix):
        enc(mix, os.path.join(out, "mix.m4a")); items.append(("The whole mix", "mix.m4a", "everything together, as on the film"))
    for g, p in stems.items():
        enc(p, os.path.join(out, f"{g}.m4a")); items.append((f"{NAMES.get(g, g)} alone", f"{g}.m4a", ""))
    if len(stems) > 1:
        for g in stems:
            rest = [p for k, p in stems.items() if k != g]
            filt = "".join(f"[{i}:a]" for i in range(len(rest))) + f"amix=inputs={len(rest)}:normalize=0"
            enc(rest, os.path.join(out, f"without_{g}.m4a"), filt)
            items.append((f"Everything but {NAMES.get(g, g).lower()}", f"without_{g}.m4a", ""))
    cues = ""
    for c in glob.glob(os.path.join(a.vdir, "*cues*.txt")) + glob.glob(os.path.join(a.vdir, "soundwork", "*cues*.txt")):
        cues = open(c, encoding="utf-8", errors="replace").read()[:20000]; break
    ver = os.path.basename(a.vdir)
    rows = "\n".join(
        f"<div class='s'><button onclick=\"play(this,'{f}')\">▶</button><div><b>{html.escape(t)}</b>"
        f"<div class='n'>{html.escape(n)}</div></div><audio src='{f}' preload='none'></audio></div>" for t, f, n in items)
    page = PAGE.replace("{{TITLE}}", html.escape(f"{a.film} {ver}: sound")).replace("{{ROWS}}", rows or "<p>No sound in this version.</p>")
    page = page.replace("{{CUES}}", f"<h2>Cue list</h2><pre>{html.escape(cues)}</pre>" if cues else "")
    open(os.path.join(out, "index.html"), "w", encoding="utf-8").write(page)
    print(os.path.join(out, "index.html"))


PAGE = """<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{{TITLE}}</title><style>
:root{--bg:#fafaf7;--fg:#1d1d1b;--mut:#6b6b66;--card:#fff;--line:#e4e2dc;--acc:#c2410c}
@media (prefers-color-scheme:dark){:root{--bg:#161615;--fg:#ecebe6;--mut:#9a9890;--card:#1f1f1d;--line:#33322f;--acc:#fb923c}}
body{background:var(--bg);color:var(--fg);font:15px/1.45 -apple-system,system-ui,sans-serif;margin:0 auto;max-width:760px;padding:16px}
.s{display:flex;align-items:center;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px;margin:8px 0}
.n{color:var(--mut);font-size:13px} h2{font-size:13px;text-transform:uppercase;color:var(--mut);margin-top:28px}
pre{white-space:pre-wrap;font-size:12px;color:var(--mut)}
button{flex:none;width:44px;height:44px;border-radius:50%;border:0;background:var(--acc);color:#fff;font-size:16px;margin-right:12px;cursor:pointer}
</style></head><body><h1>{{TITLE}}</h1>
<p class="n">Each layer on its own button. Listen for: lines cut at the start or end, a sound that loops, music too loud or too quiet under the voice, a thump, anything that should not be there.</p>
{{ROWS}}
{{CUES}}
<script>let cur=null,btn=null;function play(b,f){if(cur){cur.pause();btn.textContent='▶';if(btn===b){cur=null;return}}
cur=new Audio(f);btn=b;b.textContent='■';cur.onended=()=>{b.textContent='▶';cur=null};cur.play()}</script></body></html>"""

if __name__ == "__main__":
    main()
