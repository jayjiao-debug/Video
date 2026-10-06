"""Render the 15 s ice-ship test in HQ: 4K supersampling, 8-subframe motion blur, GTAO, bloom.
10 T4 containers in parallel; each encodes its own 1080p chunk; chunks are joined here."""
import modal, pathlib, subprocess

RAW = "https://raw.githubusercontent.com/jayjiao-debug/Video/asset-output/out"
ASSETS = [f"{RAW}/endurance-03/models/merchant_schooner.glb", f"{RAW}/endurance-01/polyhaven/belfast_sunset_puresky_2k.hdr",
          f"{RAW}/endurance-01/polyhaven/snow_02/textures/snow_02_diff_2k.jpg", f"{RAW}/endurance-01/polyhaven/snow_02/textures/snow_02_nor_gl_2k.jpg",
          f"{RAW}/endurance-01/polyhaven/snow_02/textures/snow_02_rough_2k.jpg"]
web = (modal.Image.from_registry("mcr.microsoft.com/playwright:v1.48.2-jammy", add_python="3.11")
       .apt_install("ffmpeg")
       .run_commands("mkdir -p /app && cd /app && npm init -y >/dev/null && npm i three@0.169 playwright-core@1.48.2",
                     "mkdir -p /app/assets && cd /app/assets && " + " && ".join(f"curl -sSLO {u}" for u in ASSETS))
       .add_local_dir("web", "/app/src"))
app = modal.App("juno-render")
QUERY = "hq&ss=1&mb=1"  # owner: 1080p is the bar (phone viewing); no 4K / multi-subframe blur
FRAMES, CHUNKS = 360, 10

@app.function(image=web, gpu="T4", timeout=3600)
def chunk(i: int) -> tuple[bytes, str]:
    subprocess.run("cp -r /app/src/* /app/", shell=True, check=True)
    a, b = i * FRAMES // CHUNKS, (i + 1) * FRAMES // CHUNKS
    r = subprocess.run(["node", "chunk.mjs", "/tmp/f", str(a), str(b), QUERY], cwd="/app", capture_output=True, text=True)
    log = (r.stdout + r.stderr)[-800:]
    base = ["ffmpeg", "-y", "-v", "error", "-framerate", "24", "-start_number", str(a), "-i", "/tmp/f/f%05d.png", "-vf", "scale=1920:1080", "-pix_fmt", "yuv420p"]
    # encode on the GPU (NVENC) so no extra CPU is billed; fall back to a fast CPU encode only if NVENC is unavailable
    if subprocess.run(base + ["-c:v", "h264_nvenc", "-preset", "p5", "-cq", "19", "/tmp/c.mp4"]).returncode != 0:
        log += " | NVENC unavailable, used libx264"
        subprocess.run(base + ["-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "/tmp/c.mp4"], check=True)
    return pathlib.Path("/tmp/c.mp4").read_bytes(), log

@app.local_entrypoint()
def main():
    out = pathlib.Path("out"); out.mkdir(exist_ok=True)
    lst = []
    for i, (data, log) in enumerate(chunk.map(range(CHUNKS))):
        p = out / f"chunk{i:02d}.mp4"; p.write_bytes(data); lst.append(f"file '{p.name}'"); print(i, log.strip().splitlines()[-1:] )
    (out / "list.txt").write_text("\n".join(lst))
    subprocess.run("cd out && ffmpeg -y -v error -f concat -safe 0 -i list.txt -c copy -movflags +faststart ice_hq.mp4 && rm chunk*.mp4 list.txt", shell=True, check=True)
    print("DONE", (out / "ice_hq.mp4").stat().st_size)
