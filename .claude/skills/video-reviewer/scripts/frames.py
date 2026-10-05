#!/usr/bin/env python3
"""Pull frames for a visual review and lay them out as labelled contact sheets.

Frames: every --every seconds, the middle of every subtitle line, both sides of every hard cut
(from probe.json), and any --at times. Sheets are 3x2 grids of 640x360 frames with the timestamp
and (if given) the subtitle on screen, so the reviewer can read them at a glance.

usage: frames.py VIDEO --out DIR [--every 5] [--lines lines.json] [--probe probe.json] [--at 1.5,40]
"""
import argparse, json, subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

FONT = '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'


def grab(video, t, path):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{max(0, t):.3f}', '-i', str(video), '-frames:v', '1', '-vf', 'scale=640:360', str(path)], check=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('video'); ap.add_argument('--out', required=True)
    ap.add_argument('--every', type=float, default=5.0)
    ap.add_argument('--lines'); ap.add_argument('--probe'); ap.add_argument('--at', default='')
    a = ap.parse_args()
    out = Path(a.out); fr = out / 'frames'; fr.mkdir(parents=True, exist_ok=True)
    for old in out.glob('sheet_*.png'):
        old.unlink()  # never leave sheets from an earlier run
    dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', a.video], capture_output=True, text=True).stdout)
    lines = json.loads(Path(a.lines).read_text()) if a.lines else []
    want = {}  # t -> reason
    t = 0.0
    while t < dur:
        want.setdefault(round(t, 2), 'grid'); t += a.every
    for s, e, txt in lines:
        want[round((s + e) / 2, 2)] = 'line'
    if a.probe:
        p = json.loads(Path(a.probe).read_text())
        for c in p.get('hard_cuts', []):
            want[round(c - 0.2, 2)] = 'cut-before'; want[round(c + 0.2, 2)] = 'cut-after'
        for g in p.get('single_frame_glitches', []):
            want[round(g, 2)] = 'GLITCH'
    for x in filter(None, a.at.split(',')):
        want[round(float(x), 2)] = 'asked'
    times = sorted(t for t in want if 0 <= t < dur - 0.05)
    font = ImageFont.truetype(FONT, 22); small = ImageFont.truetype(FONT, 18)
    def sub_at(t):
        for s, e, txt in lines:
            if s <= t <= e:
                return txt
        return ''
    cells = []
    for t in times:
        f = fr / f't{t:07.2f}.png'
        if not f.exists():
            grab(a.video, t, f)
        cells.append((t, want[t], f))
    sheets = []
    for k in range(0, len(cells), 6):
        sheet = Image.new('RGB', (1920, 2 * 360 + 2 * 44), '#111')
        d = ImageDraw.Draw(sheet)
        for j, (t, why, f) in enumerate(cells[k:k + 6]):
            x, y = (j % 3) * 640, (j // 3) * (360 + 44)
            sheet.paste(Image.open(f), (x, y))
            col = '#ff6b6b' if why == 'GLITCH' else '#8fd3ff' if why.startswith('cut') else '#f6cf78'
            d.text((x + 8, y + 362), f'{int(t // 60)}:{t % 60:05.2f}  {why}', font=font, fill=col)
            s = sub_at(t)
            if s:
                d.text((x + 250, y + 365), s[:22], font=small, fill='#ddd')
        p = out / f'sheet_{k // 6 + 1:02d}.png'
        sheet.save(p)
        sheets.append(str(p))
    (out / 'sheets.json').write_text(json.dumps(sheets, ensure_ascii=False, indent=1))
    print(f'{len(cells)} frames on {len(sheets)} sheets in {out}')


if __name__ == '__main__':
    main()
