#!/usr/bin/env python3
"""Render the three.js scene to frames/f_%04d.png (360x640) with headless Chromium (software GL).
usage: render_frames.py [--out frames] [--times 1.5,4.5,7.2,10.5] [--start 0 --end 360]"""
import argparse, base64, functools, http.server, os, threading
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ARGS = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist',
        '--use-gl=angle', '--enable-webgl']

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default=os.path.join(HERE, 'frames'))
    ap.add_argument('--times', default='')
    ap.add_argument('--start', type=int, default=0)
    ap.add_argument('--end', type=int, default=360)
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    if a.times:
        jobs = [(int(round(float(t) * 30)), 'f_%04d.png' % int(round(float(t) * 30))) for t in a.times.split(',')]
    else:
        jobs = [(i, 'f_%04d.png' % i) for i in range(a.start, a.end)]

    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *x): pass
    handler = functools.partial(Q, directory=os.path.join(HERE, 'scene'))
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    url = 'http://127.0.0.1:%d/index.html' % srv.server_address[1]

    with sync_playwright() as p:
        b = p.chromium.launch(args=ARGS)
        pg = b.new_page(viewport={'width': 360, 'height': 640}, device_scale_factor=1)
        pg.on('console', lambda m: print('[page]', m.text) if m.type in ('error', 'warning') else None)
        pg.on('pageerror', lambda e: print('[pageerror]', e))
        pg.goto(url)
        pg.wait_for_function('window.sceneReady === true', timeout=120000)
        for n, (i, name) in enumerate(jobs):
            data = pg.evaluate('i => { window.renderFrame(i); return document.getElementById("c").toDataURL("image/png"); }', i)
            with open(os.path.join(a.out, name), 'wb') as f:
                f.write(base64.b64decode(data.split(',', 1)[1]))
            if n % 60 == 0: print('frame', i, flush=True)
        b.close()
    srv.shutdown()

if __name__ == '__main__':
    main()
