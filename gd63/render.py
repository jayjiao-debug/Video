"""ep63 Godot on Modal, step 2+: render storyboard shots of 法老的诅咒 on T4s, one container per shot.

Synty files: the workspace pushes them ONLY as gd63/vault/assets.tar.sealed (AES-256-GCM, key wrapped with RSA-OAEP to
the public key from step 1). The runner copies that ciphertext into the Modal Volume `juno-synty`; each GPU container
unseals it into its own /tmp with the private key from the Volume `juno-vault`, renders, and deletes nothing it didn't
make (the container is thrown away). Plain Synty files never leave a running container.
Output: each shot's MP4 sealed to the workspace key (gd63/ws_pub.pem) -> out/<shot>.mp4.sealed. Nothing viewable is
published. job.json: {"id", "entry": "gd63/render.py", "shots": [["S6", 90, "shot=seal t0=0"(, "1080x1920")], ...]}"""
import modal, os, subprocess, time, json, pathlib, hashlib

GODOT = "https://github.com/godotengine/godot/releases/download/4.5.1-stable/Godot_v4.5.1-stable_linux.x86_64.zip"
img = (modal.Image.debian_slim(python_version="3.11")
       .apt_install("curl", "unzip", "xvfb", "xauth", "libvulkan1", "vulkan-tools", "mesa-vulkan-drivers", "ffmpeg",
                    "libxcursor1", "libxinerama1", "libxrandr2", "libxi6", "libgl1", "libxkbcommon0", "libasound2",
                    "libpulse0", "libfontconfig1", "libxext6", "libxrender1", "libdbus-1-3", "pciutils")
       .pip_install("cryptography==43.0.3")
       .run_commands(f"mkdir -p /opt/godot && cd /opt/godot && curl -sSL -o g.zip {GODOT} && unzip -q g.zip && rm g.zip && chmod +x Godot_v4.5.1-stable_linux.x86_64")
       .add_local_dir("gd63/project", "/work/project")
       .add_local_file("gd63/ws_pub.pem", "/work/ws_pub.pem"))
vault = modal.Volume.from_name("juno-vault", create_if_missing=True)
synty = modal.Volume.from_name("juno-synty", create_if_missing=True)
app = modal.App("juno-gd63-render")
GD = "/opt/godot/Godot_v4.5.1-stable_linux.x86_64"
JOB = json.load(open("job.json")) if pathlib.Path("job.json").exists() else {}


def sh(c, env=None, t=3000):
    r = subprocess.run(c, shell=True, capture_output=True, text=True, env={**os.environ, **(env or {})}, timeout=t)
    return r.stdout + r.stderr


def nvidia_icd():
    for d in ("/usr/share/vulkan/icd.d", "/etc/vulkan/icd.d"):
        if os.path.exists(f"{d}/nvidia_icd.json"): return f"{d}/nvidia_icd.json"
    lib = sh("ldconfig -p | grep -o '/[^ ]*libGLX_nvidia.so.0' | head -1").strip()
    if not lib: lib = sh("find / -name 'libGLX_nvidia.so.0' -not -path '/proc/*' 2>/dev/null | head -1").strip()
    os.makedirs("/etc/vulkan/icd.d", exist_ok=True)
    p = "/etc/vulkan/icd.d/nvidia_icd.json"
    open(p, "w").write('{"file_format_version":"1.0.0","ICD":{"library_path":"%s","api_version":"1.3.0"}}' % (lib or "libGLX_nvidia.so.0"))
    return p


def seal(data, pub_pem):
    from cryptography.hazmat.primitives import serialization, hashes
    from cryptography.hazmat.primitives.asymmetric import padding
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM
    k = AESGCM.generate_key(256); n = os.urandom(12)
    wk = serialization.load_pem_public_key(pub_pem).encrypt(k, padding.OAEP(mgf=padding.MGF1(hashes.SHA256()), algorithm=hashes.SHA256(), label=None))
    return len(wk).to_bytes(2, "big") + wk + n + AESGCM(k).encrypt(n, data, None)


def unseal(blob, priv_pem):
    from cryptography.hazmat.primitives import serialization, hashes
    from cryptography.hazmat.primitives.asymmetric import padding
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM
    L = int.from_bytes(blob[:2], "big"); wk = blob[2:2 + L]; n = blob[2 + L:14 + L]
    k = serialization.load_pem_private_key(priv_pem, None).decrypt(wk, padding.OAEP(mgf=padding.MGF1(hashes.SHA256()), algorithm=hashes.SHA256(), label=None))
    return AESGCM(k).decrypt(n, blob[14 + L:], None)


@app.function(image=img, gpu="T4", volumes={"/vault": vault, "/synty": synty}, timeout=3600, memory=16384)
def shot(args):
    name, frames, uargs = args[:3]
    res = args[3] if len(args) > 3 else "1440x1080"   # e.g. "1080x1920" for a vertical shot
    scene = args[4] if len(args) > 4 else ""          # e.g. "res://west.tscn"; default = the project main scene
    bundle = args[5] if len(args) > 5 else "assets.tar.sealed"
    t0 = time.time()
    tar = unseal(pathlib.Path("/synty/" + bundle).read_bytes(), pathlib.Path("/vault/synty_rsa.pem").read_bytes())
    pathlib.Path("/tmp/a.tar").write_bytes(tar); del tar
    sh("rm -rf /tmp/gp && mkdir -p /tmp/gp && cp -r /work/project/. /tmp/gp/ && tar xf /tmp/a.tar -C /tmp/gp && rm /tmp/a.tar")
    t_unpack = time.time() - t0
    d = "/tmp/frames"; sh(f"rm -rf {d}; mkdir -p {d}")
    t1 = time.time()
    log = sh(f'xvfb-run -a -s "-screen 0 2048x2048x24" {GD} --path /tmp/gp {scene} --rendering-driver vulkan --write-movie {d}/f.png '
             f'--fixed-fps 30 --quit-after {frames} --resolution {res} -- {uargs}',
             {"VK_ICD_FILENAMES": nvidia_icd(), "GP_ASSETS": "/tmp/gp/assets/"})
    t_render = time.time() - t1
    got = len(list(pathlib.Path(d).glob("*.png")))
    base = f"ffmpeg -v error -y -framerate 30 -i {d}/f%08d.png -frames:v {frames} -pix_fmt yuv420p"
    enc = sh(f"{base} -c:v h264_nvenc -preset p6 -rc vbr -cq 17 -b:v 0 /tmp/s.mp4 && echo NVENC_OK")
    if "NVENC_OK" not in enc: sh(f"{base} -c:v libx264 -preset veryfast -crf 16 /tmp/s.mp4")
    data = pathlib.Path("/tmp/s.mp4").read_bytes() if os.path.exists("/tmp/s.mp4") else b""
    info = {"shot": name, "frames": got, "of": frames, "unpack_s": round(t_unpack, 1), "render_s": round(t_render, 1),
            "ms_per_frame": round(t_render / max(got, 1) * 1000), "nvenc": "NVENC_OK" in enc,
            "renderer": [l for l in log.splitlines() if "Vulkan" in l and ("NVIDIA" in l or "llvmpipe" in l)][:2],
            "errors": [l for l in log.splitlines() if "SCRIPT ERROR" in l or "Parse Error" in l or "crash" in l.lower()][:6]}
    return name, (seal(data, pathlib.Path("/work/ws_pub.pem").read_bytes()) if data else b""), info


@app.local_entrypoint()
def main():
    out = pathlib.Path("out"); out.mkdir(exist_ok=True)
    for b in sorted(pathlib.Path("gd63/vault").glob("*.sealed")):   # ciphertext only; the Volume holds it so shots can read it
        with synty.batch_upload(force=True) as up: up.put_file(str(b), "/" + b.name)
        print("uploaded sealed", b.name, b.stat().st_size, hashlib.sha256(b.read_bytes()).hexdigest()[:12])
    shots = JOB.get("shots", [["S6", 90, "shot=seal t0=0"]])
    t0 = time.time(); infos = []
    for name, blob, info in shot.map([tuple(s) for s in shots]):
        if blob: (out / f"{name}.mp4.sealed").write_bytes(blob)
        infos.append(info); print(json.dumps(info, ensure_ascii=False))
    (out / "report.json").write_text(json.dumps({"wall_s": round(time.time() - t0, 1), "shots": infos}, indent=1, ensure_ascii=False))
    print("DONE wall", round(time.time() - t0, 1))
