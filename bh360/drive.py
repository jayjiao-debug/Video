"""Composite frames [a, b): serve this folder, open film.html in Chromium (GPU via Vulkan on Modal, SwiftShader locally),
call renderAt(t) for every frame and screenshot the equirect (e#####.jpg) and the flat director view (d#####.jpg).
    python3 drive.py <a> <b> <outdir> [--w 3840] [--cube 2048] [--plates plates] [--local] [--frames 1,2,3]"""
import sys, os, time, argparse, threading, functools, http.server, socketserver
from playwright.sync_api import sync_playwright
ap = argparse.ArgumentParser(); ap.add_argument('a', type=int); ap.add_argument('b', type=int); ap.add_argument('out')
ap.add_argument('--w', type=int, default=3840); ap.add_argument('--cube', type=int, default=2048); ap.add_argument('--plates', default='plates')
ap.add_argument('--local', action='store_true'); ap.add_argument('--frames', default=''); ap.add_argument('--fps', type=int, default=30)
a = ap.parse_args()
here = os.path.dirname(os.path.abspath(__file__)); os.makedirs(a.out, exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *x): pass
srv = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Q, directory=here)); srv.daemon_threads = True
threading.Thread(target=srv.serve_forever, daemon=True).start(); port = srv.server_address[1]
args = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] if a.local else ['--use-angle=vulkan', '--enable-features=Vulkan', '--ignore-gpu-blocklist', '--enable-gpu', '--no-sandbox']
EQH = a.w // 2
frames = [int(x) for x in a.frames.split(',')] if a.frames else list(range(a.a, a.b))
with sync_playwright() as p:
    b = p.chromium.launch(args=args)
    pg = b.new_page(viewport={'width': max(a.w, 1920), 'height': EQH + 1080})
    pg.on('pageerror', lambda e: print('PAGEERR', e, flush=True))
    pg.on('console', lambda m: print('CONSOLE', m.text, flush=True) if m.type in ('error', 'warning') else None)
    pg.goto(f'http://127.0.0.1:{port}/film.html?w={a.w}&cube={a.cube}&plates={a.plates}')
    pg.wait_for_function('window.READY === true', timeout=600000)
    print('RENDERER', pg.evaluate("(() => { const g = document.createElement('canvas').getContext('webgl2'); const e = g.getExtension('WEBGL_debug_renderer_info'); return g.getParameter(e.UNMASKED_RENDERER_WEBGL); })()"), flush=True)
    t0 = time.time()
    for i in frames:
        pg.evaluate('t => window.renderAt(t)', i / a.fps)
        pg.screenshot(path=f'{a.out}/e{i:05d}.jpg', clip={'x': 0, 'y': 0, 'width': a.w, 'height': EQH}, type='jpeg', quality=95)
        pg.screenshot(path=f'{a.out}/d{i:05d}.jpg', clip={'x': 0, 'y': EQH, 'width': 1920, 'height': 1080}, type='jpeg', quality=93)
    print('MS_PER_FRAME', round((time.time() - t0) * 1000 / max(len(frames), 1)), flush=True)
    b.close()
srv.shutdown()
