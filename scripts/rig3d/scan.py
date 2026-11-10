#!/usr/bin/env python3
"""Frame-by-frame glitch scan of a rendered film: python3 scan.py film.mp4 out_dir [expected_frames]
Flags (each with the frame number):
  pop    a frame that differs from both neighbours while the neighbours match each other (single-frame glitch)
  black  a near-black frame
  line   a transient near-black row or column at 540x960 (in this frame, absent within +-3 px in both neighbours)
  block  a transient near-black block (30x30 px cell at 270x480) absent in both neighbours
Writes report.json and a contact sheet of flagged frames (prev | frame | next)."""
import json, subprocess, sys, os
import numpy as np
from PIL import Image

src, out = sys.argv[1], sys.argv[2]
expect = int(sys.argv[3]) if len(sys.argv) > 3 else None
os.makedirs(out, exist_ok=True)
W, H = 540, 960
cmd = ["ffmpeg", "-v", "error", "-i", src, "-vf", f"scale={W}:{H}:flags=area,format=gray", "-f", "rawvideo", "-"]
p = subprocess.Popen(cmd, stdout=subprocess.PIPE)
N = W * H
small, B, flags = [], [], []
GY, GX = 16, 9
def near(a, k=3):
    o = a.copy()
    for s_ in range(1, k + 1): o = np.maximum(o, np.maximum(np.roll(a, s_), np.roll(a, -s_)))
    return o
win = []   # (index, dark rows frac, dark cols frac, dark mask)
def line_check(prev, cur, nxt):
    i, rc, cc = cur[0], cur[1], cur[2]
    # present in a neighbour = a darkish (< 70) run near the same row / column (an anti-aliased moving edge counts)
    rows = np.where((rc > 0.6) & (near(prev[3]) < 0.3) & (near(nxt[3]) < 0.3))[0]
    cols = np.where((cc > 0.6) & (near(prev[4]) < 0.3) & (near(nxt[4]) < 0.3))[0]
    if len(rows) or len(cols): flags.append({"f": i, "kind": "line", "v": f"rows {rows.tolist()[:6]} cols {cols.tolist()[:6]}"})
i = 0
while True:
    b = p.stdout.read(N)
    if len(b) < N: break
    a = np.frombuffer(b, np.uint8).reshape(H, W)
    s2 = a.reshape(H // 2, 2, W // 2, 2).mean(axis=(1, 3)).astype(np.uint8)
    small.append(s2)
    B.append(s2.astype(np.float32).reshape(GY, H // 2 // GY, GX, W // 2 // GX).mean(axis=(1, 3)))
    if a.mean() < 8: flags.append({"f": i, "kind": "black", "v": round(float(a.mean()), 1)})
    d = a < 14; e = a < 70
    win.append((i, d.mean(1), d.mean(0), e.mean(1), e.mean(0)))
    if len(win) == 3: line_check(*win); win.pop(0)
    i += 1
p.wait()
n = len(small)
def dd(x, y): return float(np.abs(B[x] - B[y]).max())
for k in range(1, n - 1):
    dp, dn, ds = dd(k, k - 1), dd(k, k + 1), dd(k - 1, k + 1)
    if min(dp, dn) - ds > 18: flags.append({"f": k, "kind": "pop", "v": round(min(dp, dn) - ds, 1)})
    bk = np.argwhere((B[k] < 12) & (B[k - 1] > 40) & (B[k + 1] > 40))
    if len(bk): flags.append({"f": k, "kind": "block", "v": bk.tolist()[:6]})
flags.sort(key=lambda x: x["f"])
rep = {"src": src, "frames": n, "expected": expect, "count_ok": (expect is None or n == expect), "flags": flags,
       "summary": {k: sum(1 for x in flags if x["kind"] == k) for k in ("pop", "black", "line", "block")}}
json.dump(rep, open(os.path.join(out, "report.json"), "w"), indent=1)
fl = sorted({x["f"] for x in flags})[:60]
if fl:
    tw, th = 135, 240
    sheet = Image.new("L", (tw * 3, th * len(fl)), 255)
    for r, k in enumerate(fl):
        for c, j in enumerate((max(0, k - 1), k, min(n - 1, k + 1))):
            sheet.paste(Image.fromarray(small[j]).resize((tw, th)), (c * tw, r * th))
    sheet.save(os.path.join(out, "flags_sheet.jpg"), quality=85)
print(json.dumps({k: rep[k] for k in ("frames", "expected", "count_ok", "summary")}))
for x in flags[:40]: print(x)
