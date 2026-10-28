#!/usr/bin/env python3
"""Render self-contained three.js HTML frames to 1920x1080 PNGs using software WebGL
(SwiftShader) because headless chromium has no GPU here and the default render_html.py
produces a black canvas for WebGL content.

usage: render_planet.py frame1.html [frame2.html ...] [--out DIR] [--wait MS]
"""
import argparse
from pathlib import Path
from playwright.sync_api import sync_playwright

ap = argparse.ArgumentParser()
ap.add_argument('files', nargs='+')
ap.add_argument('--out')
ap.add_argument('--wait', type=int, default=2000)
a = ap.parse_args()

with sync_playwright() as p:
    b = p.chromium.launch(args=[
        '--use-angle=swiftshader',
        '--enable-unsafe-swiftshader',
        '--ignore-gpu-blocklist',
        '--disable-gpu-sandbox',
    ])
    pg = b.new_page(viewport={'width': 1920, 'height': 1080})
    for f in a.files:
        f = Path(f).resolve()
        out = Path(a.out) / (f.stem + '.png') if a.out else f.with_suffix('.png')
        out.parent.mkdir(parents=True, exist_ok=True)
        pg.goto('file://' + str(f))
        pg.wait_for_timeout(a.wait)
        pg.screenshot(path=str(out))
        print(out)
    b.close()
