#!/usr/bin/env python3
"""Render ep33 key frames: python3 shoot.py [frame ...]  -> ../style/kf_<frame>.png"""
import sys, http.server, threading, functools
from pathlib import Path
from playwright.sync_api import sync_playwright

HERE = Path(__file__).resolve().parent
OUT = HERE.parent / 'style'; OUT.mkdir(exist_ok=True)
FRAMES = sys.argv[1:] or ['hook', 'title', 'setup', 'number', 'page', 'back', 'busy', 'end', 'card']

srv = http.server.ThreadingHTTPServer(('127.0.0.1', 8733), functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(HERE)))
srv.RequestHandlerClass.log_message = lambda *a: None
threading.Thread(target=srv.serve_forever, daemon=True).start()
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    pg = b.new_page(viewport={'width': 1920, 'height': 1080})
    pg.on('console', lambda m: m.type == 'error' and print('console:', m.text))
    pg.on('pageerror', lambda e: print('pageerror:', e))
    for f in FRAMES:
        pg.goto(f'http://127.0.0.1:8733/keyframes.html?f={f}')
        pg.wait_for_function('window.READY === true', timeout=120000)
        pg.wait_for_timeout(300)
        out = OUT / f'kf_{f}.png'; pg.screenshot(path=str(out)); print(out)
    b.close()
srv.shutdown()
