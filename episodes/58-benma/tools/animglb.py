import subprocess, time, sys, os
from playwright.sync_api import sync_playwright
R = os.path.dirname(os.path.abspath(__file__)); url, outdir, secs = sys.argv[1], sys.argv[2], float(sys.argv[3]); os.makedirs(outdir, exist_ok=True)
srv = subprocess.Popen(['python3', '-m', 'http.server', '8765'], cwd=R, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
try:
    with sync_playwright() as p:
        br = p.chromium.launch(args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']); pg = br.new_page(viewport={'width': 1280, 'height': 720})
        pg.on('pageerror', lambda e: print('pageerror:', e)); pg.goto('http://localhost:8765/anim.html'); pg.wait_for_function('window.ready')
        pg.evaluate('([u, s]) => init(u, s)', [url, 0.58]); pg.evaluate('document.fonts.ready')
        n = int(secs * 30); t0 = time.time()
        for i in range(n):
            pg.evaluate('t => frame(t)', i / 30); pg.locator('#f').screenshot(path=f'{outdir}/f{i:04d}.jpg', type='jpeg', quality=92)
        print('frames', n, 'sec/frame', round((time.time() - t0) / n, 3)); br.close()
finally: srv.terminate()
