"""Render ep25 (ep25/film.html, raw three.js) at 1080p30 on 10 Modal T4s (WebGL via Vulkan), NVENC chunks,
joined by stream copy on the GitHub runner. Picture only; music is muxed afterwards. Optional job.json "range": [a,b]."""
import modal, pathlib, subprocess, json
img = (modal.Image.from_registry("mcr.microsoft.com/playwright:v1.48.2-jammy", add_python="3.11")
       .apt_install("ffmpeg")
       .run_commands("mkdir -p /app && cd /app && npm init -y >/dev/null && npm i three@0.170.0 playwright-core@1.48.2")
       .add_local_dir("ep25", "/app/src"))
app = modal.App("juno-ep25")
JOB = json.load(open("job.json")) if pathlib.Path("job.json").exists() else {}
FPS, CHUNKS = 30, int(JOB.get("chunks", 14))
A, Bn = JOB.get("range", [0, 3899])

@app.function(image=img, gpu="T4", timeout=3600)
def chunk(args):
    i, a, b = args
    subprocess.run("cp -r /app/src/* /app/ && cp /app/src/package.json /app/package.json", shell=True, check=True)
    r = subprocess.run(["node", "chunk.mjs", "/tmp/f", str(a), str(b), str(FPS)], cwd="/app", capture_output=True, text=True)
    log = (r.stdout + r.stderr)[-1500:]
    base = ["ffmpeg", "-y", "-v", "error", "-framerate", str(FPS), "-start_number", str(a), "-i", "/tmp/f/f%05d.jpg", "-pix_fmt", "yuv420p"]
    if subprocess.run(base + ["-c:v", "h264_nvenc", "-preset", "p6", "-rc", "vbr", "-cq", "17", "-b:v", "0", "/tmp/c.mp4"]).returncode != 0:
        log += " | NVENC unavailable, used libx264"
        subprocess.run(base + ["-c:v", "libx264", "-preset", "veryfast", "-crf", "16", "/tmp/c.mp4"], check=True)
    return pathlib.Path("/tmp/c.mp4").read_bytes(), log

@app.local_entrypoint()
def main():
    out = pathlib.Path("out"); out.mkdir(exist_ok=True); lst = []
    n = Bn - A; parts = [(i, A + i * n // CHUNKS, A + (i + 1) * n // CHUNKS) for i in range(CHUNKS)]
    for (i, a, b), (data, log) in zip(parts, chunk.map(parts)):
        p = out / f"c{i:02d}.mp4"; p.write_bytes(data); lst.append(f"file '{p.name}'")
        print(i, a, b, " / ".join(l for l in log.splitlines() if l.startswith(("RENDERER", "MS_PER", "PAGEERR")) or "NVENC" in l))
    (out / "list.txt").write_text("\n".join(lst))
    subprocess.run("cd out && ffmpeg -y -v error -f concat -safe 0 -i list.txt -c copy -movflags +faststart film_pic.mp4 && rm c*.mp4 list.txt && md5sum film_pic.mp4 > md5.txt", shell=True, check=True)
    print("DONE", (out / "film_pic.mp4").stat().st_size)
