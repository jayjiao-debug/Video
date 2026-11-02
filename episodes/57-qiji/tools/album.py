"""ep57: export the chosen poses on the owner's new photos as storyboard assets (same names sb57.py reads):
clean_<name>.jpg (the photo), fig_<name>.png (character layer, RGBA), comp_<name>.jpg (photo + character).
Picks (owner 23:13): 长城 = selfie 3; 马丘比丘 = jump; 佩特拉 = lantern. Never committed: photos/renders."""
import os, shutil, base64
import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright
from opt_comp import OPTS, svg_for, FILLS, PH, OUT
from you_figure import DEFS
PICKS = {'greatwall2': 's3', 'machu2': 'mB', 'petra2': 'pA'}
O = {o[0]: o for o in OPTS}
with sync_playwright() as pw:
    br = pw.chromium.launch(); pg = br.new_page()
    for name, key in PICKS.items():
        path = f'{PH}/{name}.jpg'; W, H = Image.open(path).size
        shutil.copy(path, f'{OUT}/clean_{name}.jpg')
        pg.set_viewport_size({'width': W, 'height': H})
        pg.set_content(f'<html><body style="margin:0;background:transparent"><svg id="f" width="{W}" height="{H}" style="display:block">{DEFS}{FILLS}{svg_for(O[key])}</svg></body></html>')
        pg.wait_for_timeout(250); pg.locator('#f').screenshot(path=f'{OUT}/fig_{name}.png', omit_background=True)
        fig = np.array(Image.open(f'{OUT}/fig_{name}.png').convert('RGBA')).astype(np.float32) / 255.; a = fig[..., 3:4]
        img = np.array(Image.open(path).convert('RGB')).astype(np.float32) / 255.
        Image.fromarray(((img * (1 - a) + fig[..., :3] * a) * 255).clip(0, 255).astype(np.uint8)).save(f'{OUT}/comp_{name}.jpg', quality=92)
        print('album', name, key)
    br.close()
