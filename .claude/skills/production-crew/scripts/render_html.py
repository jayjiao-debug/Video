#!/usr/bin/env python3
"""Render self-contained HTML style frames to 1920x1080 PNGs (next to each file, or into --out).
usage: render_html.py frame1.html [frame2.html ...] [--out DIR]"""
import argparse, os
from pathlib import Path
from playwright.sync_api import sync_playwright

ap = argparse.ArgumentParser(); ap.add_argument('files', nargs='+'); ap.add_argument('--out')
a = ap.parse_args()
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 1920, 'height': 1080})
    for f in a.files:
        f = Path(f).resolve()
        out = Path(a.out) / (f.stem + '.png') if a.out else f.with_suffix('.png')
        out.parent.mkdir(parents=True, exist_ok=True)
        pg.goto('file://' + str(f)); pg.wait_for_timeout(800)
        pg.screenshot(path=str(out))
        print(out)
    b.close()
