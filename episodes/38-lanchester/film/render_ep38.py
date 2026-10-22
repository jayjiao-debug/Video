"""Render ep38 兰彻斯特 (ep38/film.html, raw three.js bundle) at 1080p30 on Modal T4s (WebGL via Vulkan), NVENC chunks,
joined by stream copy on the GitHub runner. Picture only; music is muxed afterwards. job.json: {"range": [a, b], "chunks": n}."""
import modal, pathlib, subprocess, json
RAW = "https://raw.githubusercontent.com/jayjiao-debug/Video/asset-output/out/lanchester-assets-01"
GET = [("polyhaven/kloppenheim_06_puresky_4k.hdr", "sky.hdr"),
       ("polyhaven/aerial_grass_rock/textures/aerial_grass_rock_diff_2k.jpg", "ground_diff.jpg"),
       ("polyhaven/aerial_grass_rock/textures/aerial_grass_rock_nor_gl_2k.jpg", "ground_nor.jpg"),
       ("polyhaven/aerial_grass_rock/textures/aerial_grass_rock_rough_2k.jpg", "ground_rough.jpg"),
       ("models/infantry_rigged.glb", "soldier.glb"), ("models/ship_bucentaure.glb", "ship_bucentaure.glb"), ("models/ship_agamemnon.glb", "ship_agamemnon.glb"),
       ("polyhaven/grass_medium_01/grass_medium_01.gltf", "grass/grass.gltf"), ("polyhaven/grass_medium_01/grass_medium_01.bin", "grass/grass_medium_01.bin"),
       ("polyhaven/grass_medium_01/textures/grass_medium_01_diff_1k.jpg", "grass/textures/grass_medium_01_diff_1k.jpg"),
       ("polyhaven/grass_medium_01/textures/grass_medium_01_nor_gl_1k.jpg", "grass/textures/grass_medium_01_nor_gl_1k.jpg"),
       ("polyhaven/grass_medium_01/textures/grass_medium_01_arm_1k.jpg", "grass/textures/grass_medium_01_arm_1k.jpg")]
img = (modal.Image.from_registry("mcr.microsoft.com/playwright:v1.48.2-jammy", add_python="3.11")
       .apt_install("ffmpeg", "fonts-noto-cjk")
       .run_commands("mkdir -p /app/assets/grass/textures && cd /app && npm init -y >/dev/null && npm i playwright-core@1.48.2",
                     " && ".join(f"curl -sSL -o /app/assets/{d} '{RAW}/{s}'" for s, d in GET))
       .add_local_dir("ep38", "/app/src"))
app = modal.App("juno-ep38")
FPS = 30
JOB = json.load(open("job.json")) if pathlib.Path("job.json").exists() else {}
A, Bn = JOB.get("range", [0, 30]); CHUNKS = JOB.get("chunks", 10)

@app.function(image=img, gpu="T4", timeout=3600)
def chunk(args):
    i, a, b = args
    subprocess.run("cp -r /app/src/* /app/ && cp /app/src/assets_extra/* /app/assets/ 2>/dev/null; echo '[]' > /app/lines.json; echo '{\"type\":\"module\"}' > /app/package.json.tmp", shell=True, check=True)
    r = subprocess.run(["node", "chunk.mjs", "/tmp/f", str(a), str(b), str(FPS)], cwd="/app", capture_output=True, text=True)
    log = (r.stdout + r.stderr)[-2500:]
    base = ["ffmpeg", "-y", "-v", "error", "-framerate", str(FPS), "-start_number", str(a), "-i", "/tmp/f/f%05d.jpg", "-pix_fmt", "yuv420p"]
    if subprocess.run(base + ["-c:v", "h264_nvenc", "-preset", "p6", "-rc", "vbr", "-cq", "17", "-b:v", "0", "/tmp/c.mp4"]).returncode != 0:
        log += " | NVENC unavailable, used libx264"
        subprocess.run(base + ["-c:v", "libx264", "-preset", "veryfast", "-crf", "16", "/tmp/c.mp4"], check=True)
    return pathlib.Path("/tmp/c.mp4").read_bytes(), log

@app.function(image=img, gpu="T4", timeout=3600)
def stills(ts):
    subprocess.run("cp -r /app/src/* /app/ && cp /app/src/assets_extra/* /app/assets/ 2>/dev/null; true", shell=True, check=True)
    r = subprocess.run(["node", "stills.mjs", "/tmp/s"] + [str(t) for t in ts], cwd="/app", capture_output=True, text=True)
    subprocess.run("cd /tmp/s && tar cf /tmp/s.tar *.jpg", shell=True)
    return pathlib.Path("/tmp/s.tar").read_bytes(), (r.stdout + r.stderr)[-3000:]

@app.local_entrypoint()
def main():
    if "stills" in JOB:
        out = pathlib.Path("out"); out.mkdir(exist_ok=True); ts = JOB["stills"]; n = 4
        groups = [ts[i::n] for i in range(n)]
        for k, (data, log) in enumerate(stills.map(groups)):
            (out / f"s{k}.tar").write_bytes(data); print(k, log)
        subprocess.run("cd out && mkdir -p stills && for f in s*.tar; do tar xf $f -C stills; done && rm s*.tar", shell=True, check=True)
        print("DONE stills"); return
    out = pathlib.Path("out"); out.mkdir(exist_ok=True); lst = []
    n = Bn - A; parts = [(i, A + i * n // CHUNKS, A + (i + 1) * n // CHUNKS) for i in range(CHUNKS)]
    for (i, a, b), (data, log) in zip(parts, chunk.map(parts)):
        p = out / f"c{i:02d}.mp4"; p.write_bytes(data); lst.append(f"file '{p.name}'")
        print(i, a, b, " / ".join(l for l in log.splitlines() if l.startswith(("RENDERER", "MS_PER", "PAGEERR", "BOOT", "LOG")) or "NVENC" in l))
    (out / "list.txt").write_text("\n".join(lst))
    subprocess.run("cd out && ffmpeg -y -v error -f concat -safe 0 -i list.txt -c copy -movflags +faststart film_pic.mp4 && rm c*.mp4 list.txt && md5sum film_pic.mp4 > md5.txt", shell=True, check=True)
    print("DONE", (out / "film_pic.mp4").stat().st_size)
