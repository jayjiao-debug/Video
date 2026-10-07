"""Render ep14 谁按错了 (film/film.html) at 1080p30 on 10 Modal T4s (WebGL via Vulkan), encode chunks with NVENC,
join by stream copy on the GitHub runner. Picture only; music is muxed afterwards."""
import modal, pathlib, subprocess
RAW = "https://raw.githubusercontent.com/jayjiao-debug/Video/asset-output/out"
ASSETS = [f"{RAW}/spot-02/models/{m}.glb" for m in ["classroom_titi", "spotlight"]]
img = (modal.Image.from_registry("mcr.microsoft.com/playwright:v1.48.2-jammy", add_python="3.11")
       .apt_install("ffmpeg", "fonts-noto-cjk")
       .run_commands("mkdir -p /app && cd /app && npm init -y >/dev/null && npm i three@0.169 playwright-core@1.48.2",
                     "mkdir -p /app/assets && cd /app/assets && " + " && ".join(f"curl -sSLO {u}" for u in ASSETS))
       .add_local_dir("spotfilm", "/app/src"))
app = modal.App("juno-spot")
FPS, DUR, CHUNKS = 30, 104.6, 10
N = int(FPS * DUR)

@app.function(image=img, gpu="T4", timeout=3600)
def chunk(i: int):
    subprocess.run("cp -r /app/src/* /app/", shell=True, check=True)
    a, b = i * N // CHUNKS, (i + 1) * N // CHUNKS
    r = subprocess.run(["node", "chunk.mjs", "/tmp/f", str(a), str(b), str(FPS)], cwd="/app", capture_output=True, text=True)
    log = (r.stdout + r.stderr)[-1200:]
    base = ["ffmpeg", "-y", "-v", "error", "-framerate", str(FPS), "-start_number", str(a), "-i", "/tmp/f/f%05d.jpg", "-pix_fmt", "yuv420p"]
    if subprocess.run(base + ["-c:v", "h264_nvenc", "-preset", "p5", "-cq", "20", "/tmp/c.mp4"]).returncode != 0:
        log += " | NVENC unavailable, used libx264"
        subprocess.run(base + ["-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "/tmp/c.mp4"], check=True)
    return pathlib.Path("/tmp/c.mp4").read_bytes(), log

@app.local_entrypoint()
def main():
    out = pathlib.Path("out"); out.mkdir(exist_ok=True); lst = []
    for i, (data, log) in enumerate(chunk.map(range(CHUNKS))):
        p = out / f"c{i:02d}.mp4"; p.write_bytes(data); lst.append(f"file '{p.name}'")
        print(i, " / ".join(l for l in log.splitlines() if l.startswith(("RENDERER", "MS_PER", "PAGEERR")) or "NVENC" in l))
    (out / "list.txt").write_text("\n".join(lst))
    subprocess.run("cd out && ffmpeg -y -v error -f concat -safe 0 -i list.txt -c copy -movflags +faststart film_pic.mp4 && rm c*.mp4 list.txt", shell=True, check=True)
    print("DONE", (out / "film_pic.mp4").stat().st_size)
