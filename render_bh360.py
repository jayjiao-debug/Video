"""《掉进黑洞》 360: per chunk on one Modal T4 — ray-trace the 4K equirect plates on the GPU (CuPy), composite 小J /
props / dust / HUD in Chromium (WebGL via Vulkan on the same GPU), encode both outputs with NVENC. Joined here.
MODE smoke: a few frames per container, stills returned for QA, timings logged. MODE full: frames [0, N)."""
import modal, pathlib, subprocess, os, json, time
MODE = json.load(open("job.json")).get("mode", "full") if os.path.exists("job.json") else "full"
img = (modal.Image.from_registry("mcr.microsoft.com/playwright/python:v1.48.0-jammy", add_python="3.11")
       .apt_install("ffmpeg", "fonts-noto-cjk", "fonts-noto-cjk-extra")
       .pip_install("playwright==1.48.0", "cupy-cuda12x[ctk]==14.2.0", "numpy", "scipy", "pillow")
       .env({"PLAYWRIGHT_BROWSERS_PATH": "/ms-playwright"})
       .add_local_dir("bh360", "/app/bh360"))
app = modal.App("juno-bh360")
FPS, N, CHUNKS = 30, 900, 10

def sh(cmd, log):
    t = time.time(); r = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    log.append(f"$ {cmd[:90]} -> rc {r.returncode} in {time.time() - t:.0f}s\n" + (r.stdout + r.stderr)[-1500:]); return r.returncode

@app.function(image=img, gpu="T4", timeout=3600, memory=16384)
def chunk(a: int, b: int, frames: str = ""):
    log = []
    sh("nvidia-smi --query-gpu=name,memory.total,driver_version --format=csv,noheader", log)
    sh("rm -rf /tmp/w && cp -r /app/bh360 /tmp/w", log)
    fl = f"--frames {frames}" if frames else ""
    sh(f"cd /tmp/w && python plates.py {a} {b} /tmp/w/plates --gpu {fl}", log)
    sh(f"cd /tmp/w && python drive.py {a} {b} /tmp/o {fl}", log)
    out = {}
    if frames:
        for f in frames.split(","):
            for k in ("e", "d"):
                p = pathlib.Path(f"/tmp/o/{k}{int(f):05d}.jpg")
                if p.exists(): out[p.name] = p.read_bytes()
        return out, "\n".join(log)
    for k, q in (("e", "-cq 19 -b:v 0"), ("d", "-cq 21 -b:v 0")):
        base = f"ffmpeg -y -v error -framerate {FPS} -start_number {a} -i /tmp/o/{k}%05d.jpg -pix_fmt yuv420p"
        if sh(f"{base} -c:v h264_nvenc -preset p6 -rc vbr {q} /tmp/{k}.mp4", log) != 0:
            sh(f"{base} -c:v libx264 -preset veryfast -crf 18 /tmp/{k}.mp4", log)
        if pathlib.Path(f"/tmp/{k}.mp4").exists(): out[k] = pathlib.Path(f"/tmp/{k}.mp4").read_bytes()
    return out, "\n".join(log)

@app.local_entrypoint()
def main():
    o = pathlib.Path("out"); o.mkdir(exist_ok=True); logs = []
    if MODE == "smoke":
        jobs = [(0, 0, "15,282,414"), (0, 0, "558,738,852")]
        for i, (res, log) in enumerate(chunk.starmap(jobs)):
            logs.append(f"===== container {i}\n{log}")
            for n, data in res.items(): (o / n).write_bytes(data)
    else:
        jobs = [(i * N // CHUNKS, (i + 1) * N // CHUNKS, "") for i in range(CHUNKS)]
        lists = {"e": [], "d": []}
        for i, (res, log) in enumerate(chunk.starmap(jobs)):
            logs.append(f"===== chunk {i}\n{log}")
            for k in ("e", "d"):
                if k in res: p = o / f"{k}{i:02d}.mp4"; p.write_bytes(res[k]); lists[k].append(f"file '{p.name}'")
        for k, name in (("e", "bh360_equi_pic.mp4"), ("d", "bh360_flat_pic.mp4")):
            (o / f"{k}.txt").write_text("\n".join(lists[k]))
            subprocess.run(f"cd out && ffmpeg -y -v error -f concat -safe 0 -i {k}.txt -c copy -movflags +faststart {name} && rm {k}??.mp4 {k}.txt", shell=True)
    (o / "chunks.log").write_text("\n".join(logs))
    print("\n".join(l for l in "\n".join(logs).splitlines() if any(s in l for s in ("RENDERER", "MS_PER", "PLATE_S", "SKY_S", "PAGEERR", "rc ", "Error", "error", "Tesla"))))
