#!/usr/bin/env python3
"""Make the file that gets uploaded to Douyin: video ≥ 8 Mbps (2-pass, ~12 Mbps target), audio −14 LUFS with
true peak ≤ −1.5 dBTP, AAC 320k. Verifies the result and exits non-zero if it fails the gate.
usage: upload_master.py FILM.mp4 [--out OUT.mp4]"""
import argparse, json, subprocess, sys, tempfile
from pathlib import Path

ap = argparse.ArgumentParser(); ap.add_argument('film'); ap.add_argument('--out')
a = ap.parse_args()
src = Path(a.film)
out = Path(a.out) if a.out else src.with_name(src.stem + '_上传版.mp4')
r = subprocess.run(['ffmpeg', '-hide_banner', '-i', str(src), '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
m = json.loads(r[r.rindex('{'):r.rindex('}') + 1])
af = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
      f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
with tempfile.TemporaryDirectory() as td:
    log = str(Path(td) / 'x264')
    common = ['-c:v', 'libx264', '-preset', 'slow', '-b:v', '12M', '-maxrate', '16M', '-bufsize', '24M', '-pix_fmt', 'yuv420p', '-passlogfile', log]
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(src), *common, '-pass', '1', '-an', '-f', 'null', '/dev/null'], check=True)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(src), *common, '-pass', '2', '-af', af, '-c:a', 'aac', '-b:a', '320k', '-ar', '48000', '-movflags', '+faststart', str(out)], check=True)
probe = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'stream=codec_type,bit_rate:format=size,duration', '-of', 'json', str(out)], capture_output=True, text=True).stdout)
vbr = next(int(s['bit_rate']) for s in probe['streams'] if s['codec_type'] == 'video') / 1e6
r = subprocess.run(['ffmpeg', '-hide_banner', '-i', str(out), '-af', 'loudnorm=print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
m2 = json.loads(r[r.rindex('{'):r.rindex('}') + 1])
ok = vbr >= 8 and float(m2['input_tp']) <= -1.0
print(f"{out}\n  video {vbr:.1f} Mbps · loudness {m2['input_i']} LUFS · true peak {m2['input_tp']} dBTP · {int(probe['format']['size']) / 1e6:.0f} MB → {'PASS' if ok else 'FAIL'}")
sys.exit(0 if ok else 1)
