#!/usr/bin/env python3
"""Render the PS1-style test clip (10 s, 30 fps, 1920x1080) to MP4.

  python3 render.py                       # full clip -> ps1_test.mp4 next to this file
  python3 render.py --out /tmp/x.mp4 --frames 60:120
  python3 render.py --stills 1.0,3.0,5.0,7.5,9.0 --stills-dir /tmp/ps1
Needs: python playwright + chromium, ffmpeg, npm (only to fetch three@0.160.0 once).
"""
import argparse, functools, http.server, shutil, subprocess, sys, threading
from pathlib import Path

HERE = Path(__file__).resolve().parent
FPS, TOTAL = 30, 300


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default=str(HERE / 'ps1_test.mp4'))
    ap.add_argument('--frames', default=f'0:{TOTAL}', help='a:b (b exclusive)')
    ap.add_argument('--stills', default='', help='comma list of seconds -> PNGs, no video')
    ap.add_argument('--stills-dir', default=str(HERE / 'stills'))
    a = ap.parse_args()

    if not (HERE / 'node_modules' / 'three').exists():
        subprocess.check_call(['npm', 'install', 'three@0.160.0', '--no-save', '--prefix', str(HERE)])

    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *x): pass
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Q, directory=str(HERE)))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    url = f'http://127.0.0.1:{srv.server_address[1]}/index.html'

    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        br = p.chromium.launch(headless=True, args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        pg = br.new_page(viewport={'width': 1920, 'height': 1080}, device_scale_factor=1)
        pg.on('console', lambda m: print('[page]', m.text) if m.type in ('error', 'warning') else None)
        pg.on('pageerror', lambda e: print('[pageerror]', e))
        pg.goto(url)
        pg.wait_for_function('window.ready === true', timeout=60000)

        if a.stills:
            d = Path(a.stills_dir); d.mkdir(parents=True, exist_ok=True)
            for s in a.stills.split(','):
                pg.evaluate('f => window.renderFrame(f)', float(s) * FPS)
                pg.screenshot(path=str(d / f'still_{float(s):.3f}.png'))
                print('still', s)
            br.close(); return

        f0, f1 = (int(x) for x in a.frames.split(':'))
        fr = HERE / 'frames'; shutil.rmtree(fr, ignore_errors=True); fr.mkdir()
        for i in range(f0, f1):
            pg.evaluate('f => window.renderFrame(f)', i)
            pg.screenshot(path=str(fr / f'f_{i:04d}.png'))
            if i % 30 == 0: print('frame', i, flush=True)
        br.close()
    subprocess.check_call(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', str(FPS), '-start_number', str(f0),
                           '-i', str(fr / 'f_%04d.png'), '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p',
                           '-movflags', '+faststart', a.out])
    shutil.rmtree(fr, ignore_errors=True)
    print('wrote', a.out)


if __name__ == '__main__':
    sys.exit(main())
