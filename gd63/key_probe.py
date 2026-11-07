"""ep63 Godot on Modal, step 1: make the key pair for the Synty hand-off INSIDE Modal and check Godot draws on the T4.

- The RSA-4096 private key is written to the Modal Volume `juno-vault` (only the Modal account can read it) and is never
  returned or printed. The public key comes back in out/modal_pub.pem: the workspace encrypts the Synty files to it.
- GPU probe: a small non-Synty Godot scene (SDFGI, SSAO, volumetric fog, shadows), 1440x1080, Vulkan on the NVIDIA driver
  under Xvfb; reports the adapter, ms/frame, and returns one still + a short clip (no Synty content, safe to publish)."""
import modal, os, subprocess, time, json, pathlib

GODOT = "https://github.com/godotengine/godot/releases/download/4.5.1-stable/Godot_v4.5.1-stable_linux.x86_64.zip"
img = (modal.Image.debian_slim(python_version="3.11")
       .apt_install("curl", "unzip", "xvfb", "xauth", "libvulkan1", "vulkan-tools", "mesa-vulkan-drivers", "ffmpeg",
                    "libxcursor1", "libxinerama1", "libxrandr2", "libxi6", "libgl1", "libxkbcommon0", "libasound2",
                    "libpulse0", "libfontconfig1", "libxext6", "libxrender1", "libdbus-1-3", "pciutils")
       .pip_install("cryptography==43.0.3")
       .run_commands(f"mkdir -p /opt/godot && cd /opt/godot && curl -sSL -o g.zip {GODOT} && unzip -q g.zip && rm g.zip && chmod +x Godot_v4.5.1-stable_linux.x86_64")
       .add_local_dir("gd63/probe", "/work/probe"))
vault = modal.Volume.from_name("juno-vault", create_if_missing=True)
app = modal.App("juno-gd63-key")
GD = "/opt/godot/Godot_v4.5.1-stable_linux.x86_64"


def sh(c, env=None, t=900):
    r = subprocess.run(c, shell=True, capture_output=True, text=True, env={**os.environ, **(env or {})}, timeout=t)
    return (r.stdout + r.stderr)


def nvidia_icd():
    for d in ("/usr/share/vulkan/icd.d", "/etc/vulkan/icd.d"):
        if os.path.exists(f"{d}/nvidia_icd.json"): return f"{d}/nvidia_icd.json", "found"
    lib = sh("ldconfig -p | grep -o '/[^ ]*libGLX_nvidia.so.0' | head -1").strip()
    if not lib: lib = sh("find / -name 'libGLX_nvidia.so.0' -not -path '/proc/*' 2>/dev/null | head -1").strip()
    os.makedirs("/etc/vulkan/icd.d", exist_ok=True)
    p = "/etc/vulkan/icd.d/nvidia_icd.json"
    open(p, "w").write('{"file_format_version":"1.0.0","ICD":{"library_path":"%s","api_version":"1.3.0"}}' % (lib or "libGLX_nvidia.so.0"))
    return p, "written, lib=" + (lib or "not found")


def godot(n, icd):
    d = f"/tmp/p{n}"; sh(f"rm -rf {d}; mkdir -p {d}")
    t0 = time.time()
    log = sh(f'xvfb-run -a -s "-screen 0 1440x1080x24" {GD} --path /work/probe --rendering-driver vulkan --write-movie {d}/f.png '
             f'--fixed-fps 30 --quit-after {n} --resolution 1440x1080', {"VK_ICD_FILENAMES": icd})
    return time.time() - t0, len(list(pathlib.Path(d).glob("*.png"))), log, d


@app.function(image=img, gpu="T4", volumes={"/vault": vault}, timeout=1200)
def key_and_probe():
    from cryptography.hazmat.primitives import serialization
    from cryptography.hazmat.primitives.asymmetric import rsa
    kp = "/vault/synty_rsa.pem"
    if not os.path.exists(kp):
        k = rsa.generate_private_key(public_exponent=65537, key_size=4096)
        open(kp, "wb").write(k.private_bytes(serialization.Encoding.PEM, serialization.PrivateFormat.PKCS8, serialization.NoEncryption()))
        vault.commit(); made = "new"
    else: made = "existing"
    pub = serialization.load_pem_private_key(open(kp, "rb").read(), None).public_key().public_bytes(
        serialization.Encoding.PEM, serialization.PublicFormat.SubjectPublicKeyInfo)
    rep = {"key": made, "nvidia_smi": sh("nvidia-smi --query-gpu=name,driver_version --format=csv"),
           "cpus": os.cpu_count(), "icd_dirs": sh("ls -la /usr/share/vulkan/icd.d /etc/vulkan/icd.d 2>&1")}
    icd, how = nvidia_icd(); rep["icd"] = f"{icd} ({how})"
    rep["vulkaninfo"] = sh(f'xvfb-run -a vulkaninfo --summary', {"VK_ICD_FILENAMES": icd})[-2500:]
    still = clip = b""
    t1, n1, _, _ = godot(2, icd)
    t2, n2, log, d = godot(92, icd)
    rep["nvidia"] = {"frames": n2, "startup_s": round(t1, 1), "total_s": round(t2, 1),
                     "ms_per_frame": round((t2 - t1) / 90 * 1000) if n2 >= 90 else None,
                     "renderer": [l for l in log.splitlines() if l.startswith("RENDERER") or "Vulkan" in l][:6],
                     "log_tail": log[-2500:]}
    if n2 == 0:   # compare: does Godot run at all here on software Vulkan?
        lv = sh("ls /usr/share/vulkan/icd.d/lvp_icd*.json | head -1").strip()
        t3, n3, log3, d = godot(10, lv)
        rep["lavapipe"] = {"frames": n3, "total_s": round(t3, 1), "log_tail": log3[-1200:]}
    if list(pathlib.Path(d).glob("*.png")):
        last = sorted(pathlib.Path(d).glob("*.png"))[-1]
        sh(f"ffmpeg -v error -y -i {last} -q:v 3 /tmp/still.jpg"); still = pathlib.Path("/tmp/still.jpg").read_bytes()
        enc = sh(f"ffmpeg -v error -y -framerate 30 -i {d}/f%08d.png -c:v h264_nvenc -cq 19 -pix_fmt yuv420p /tmp/clip.mp4 && echo NVENC_OK")
        if "NVENC_OK" not in enc:
            rep["nvenc"] = enc[-400:]; sh(f"ffmpeg -v error -y -framerate 30 -i {d}/f%08d.png -c:v libx264 -crf 18 -pix_fmt yuv420p /tmp/clip.mp4")
        else: rep["nvenc"] = "ok"
        clip = pathlib.Path("/tmp/clip.mp4").read_bytes() if os.path.exists("/tmp/clip.mp4") else b""
    return pub, rep, still, clip


@app.local_entrypoint()
def main():
    out = pathlib.Path("out"); out.mkdir(exist_ok=True)
    pub, rep, still, clip = key_and_probe.remote()
    (out / "modal_pub.pem").write_bytes(pub)
    (out / "probe.json").write_text(json.dumps(rep, indent=1, ensure_ascii=False))
    if still: (out / "probe.jpg").write_bytes(still)
    if clip: (out / "probe.mp4").write_bytes(clip)
    print("KEY", rep["key"], "| GPU", rep["nvidia_smi"].strip().splitlines()[-1:], "| frames", rep["nvidia"]["frames"], "| ms/frame", rep["nvidia"]["ms_per_frame"])
    print("DONE")
