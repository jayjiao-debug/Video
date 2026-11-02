import subprocess, time, json, sys, base64, os
from playwright.sync_api import sync_playwright
R = os.path.dirname(os.path.abspath(__file__)); url, outdir, cfgs = sys.argv[1], sys.argv[2], json.loads(sys.argv[3]); os.makedirs(outdir, exist_ok=True)
srv = subprocess.Popen(['python3', '-m', 'http.server', '8765'], cwd=R, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
try:
    with sync_playwright() as p:
        br = p.chromium.launch(args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']); pg = br.new_page(viewport={'width': 900, 'height': 700})
        pg.on('pageerror', lambda e: print('pageerror:', e)); pg.goto('http://localhost:8765/view.html'); pg.wait_for_function('window.ready')
        print(json.dumps(pg.evaluate('u => load(u)', url)))
        for name, cfg in cfgs.items():
            d = pg.evaluate('c => render(c)', cfg); open(f'{outdir}/{name}.png', 'wb').write(base64.b64decode(d.split(',', 1)[1]))
        br.close()
finally: srv.terminate()
