"""Smoke test: is the token valid, and can we get a GPU?"""
import modal, pathlib, subprocess

app = modal.App("juno-check")

@app.function(gpu="T4", timeout=300)
def gpu_info() -> str:
    return subprocess.run(["nvidia-smi"], capture_output=True, text=True).stdout

@app.local_entrypoint()
def main():
    info = gpu_info.remote()
    print(info)
    pathlib.Path("out").mkdir(exist_ok=True)
    pathlib.Path("out/nvidia-smi.txt").write_text(info)
    print("MODAL_OK")
