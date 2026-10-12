#!/usr/bin/env python3
"""Replace a frame range of the full picture track with a re-rendered range (streaming, low memory).

    python3 splice.py out/<film>_pic.mp4 out/<fix>_pic.mp4 <start_frame> out/ep5_full2_pic.mp4

The fix clip must have been rendered from the same composition with --start <start_frame>.
"""
import subprocess
import sys
from pathlib import Path

full, fix, start, out = sys.argv[1], sys.argv[2], int(sys.argv[3]), sys.argv[4]
import os
tmp = Path(os.environ.get('VE_TMP', '/tmp/video-engine')) / 'splice'
tmp.mkdir(parents=True, exist_ok=True)


def frames(p):
    return int(subprocess.run(['ffprobe', '-v', 'error', '-count_packets', '-select_streams', 'v:0', '-show_entries',
                               'stream=nb_read_packets', '-of', 'csv=p=0', p], capture_output=True, text=True).stdout.strip().strip(','))


n_full, n_fix = frames(full), frames(fix)
end = start + n_fix
enc = ['-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', '-r', '30']
parts = []
if start > 0:
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', full, '-vf', f'trim=end_frame={start},setpts=PTS-STARTPTS', *enc, str(tmp / 'a.mp4')], check=True)
    parts.append(tmp / 'a.mp4')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', fix, '-vf', 'setpts=PTS-STARTPTS', *enc, str(tmp / 'b.mp4')], check=True)
parts.append(tmp / 'b.mp4')
if end < n_full:
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', full, '-vf', f'trim=start_frame={end},setpts=PTS-STARTPTS', *enc, str(tmp / 'c.mp4')], check=True)
    parts.append(tmp / 'c.mp4')
(tmp / 'list.txt').write_text(''.join(f"file '{p}'\n" for p in parts))
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', str(tmp / 'list.txt'), '-c', 'copy', out], check=True)
print(f'spliced frames {start}-{end - 1} into {out}: {frames(out)} frames (was {n_full})')
