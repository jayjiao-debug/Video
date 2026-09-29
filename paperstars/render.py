"""Frame pipeline (shot lookup, dissolves, post-processing) and video encoding."""

import multiprocessing as mp
import os
import subprocess

import cv2
import numpy as np

from . import config as C
from .shots import SHOT_FUNCS, world
from .util import blur, smoothstep

_POST = None


class Post:
    def __init__(self):
        yy, xx = np.mgrid[0:C.H, 0:C.W].astype(np.float32)
        d = np.sqrt(((xx - C.W / 2) / (C.W * 0.62)) ** 2 + ((yy - C.H / 2) / (C.H * 0.72)) ** 2)
        self.vignette = (1.0 - 0.38 * np.clip(d, 0, 1.3) ** 2.2)[..., None].astype(np.float32)
        rng = np.random.default_rng(C.SEED + 9)
        self.grain = [blur(rng.normal(0, 1, (C.H, C.W)).astype(np.float32), 0.6)[..., None]
                      for _ in range(12)]

    def apply(self, frame, T, index):
        # bloom: bright parts bleed light, as they would through a real lens
        bright = np.maximum(frame - 0.42, 0)
        small = cv2.resize(bright, (C.W // 4, C.H // 4), interpolation=cv2.INTER_AREA)
        bloom = blur(small, 1.5) * 0.9 + blur(small, 6.0) * 1.2
        frame = frame + cv2.resize(bloom, (C.W, C.H), interpolation=cv2.INTER_LINEAR) * 0.55
        # grade: lift shadows toward blue, gentle shoulder on highlights
        frame = frame * 0.97 + np.array((0.004, 0.006, 0.012), np.float32)
        frame = np.where(frame < 0.75, frame, 0.75 + 0.25 * np.tanh((frame - 0.75) / 0.25))
        frame = frame * self.vignette
        # grain + dither against banding in the night skies
        frame = frame + self.grain[index % len(self.grain)] * 0.006
        # fade in from black at the head, out at the tail
        fade = smoothstep(0.0, 0.8, T) * (1 - smoothstep(C.DURATION - 1.6, C.DURATION - 0.1, T))
        frame = frame * fade
        return np.clip(frame * 255 + 0.5, 0, 255).astype(np.uint8)


def post():
    global _POST
    if _POST is None:
        _POST = Post()
    return _POST


def shot_at(T):
    for name, t0, t1 in C.SHOTS:
        if t0 <= T < t1:
            return name
    return C.SHOTS[-1][0]


def render_raw(T):
    """Float frame for time T, including cross-dissolves."""
    for boundary, hw in C.DISSOLVES.items():
        if boundary - hw <= T < boundary + hw:
            a = shot_at(boundary - 1e-3)
            b = shot_at(boundary)
            u = smoothstep(boundary - hw, boundary + hw, T)
            fa = SHOT_FUNCS[a](T)
            fb = SHOT_FUNCS[b](T)
            return fa * (1 - u) + fb * u
    return SHOT_FUNCS[shot_at(T)](T)


def render_frame(index):
    T = index / C.FPS
    return post().apply(render_raw(T), T, index)


def _init_worker():
    world()
    post()


def ffmpeg_exe():
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        return "ffmpeg"


def encode(out_path, frames, audio_path=None, workers=None, crf=20, log_every=48):
    """Render `frames` (iterable of indices) in parallel and pipe to ffmpeg."""
    os.makedirs(os.path.dirname(out_path) or ".", exist_ok=True)
    cmd = [ffmpeg_exe(), "-y", "-loglevel", "error",
           "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{C.W}x{C.H}", "-r", str(C.FPS),
           "-i", "-"]
    if audio_path:
        cmd += ["-i", audio_path, "-c:a", "aac", "-b:a", "192k", "-shortest"]
    cmd += ["-c:v", "libx264", "-preset", "slow", "-crf", str(crf), "-tune", "film",
            "-pix_fmt", "yuv420p", "-movflags", "+faststart", out_path]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    frames = list(frames)
    world()  # build once in the parent so forked workers share it
    post()
    ctx = mp.get_context("fork")
    with ctx.Pool(workers or os.cpu_count(), initializer=_init_worker) as pool:
        for k, img in enumerate(pool.imap(render_frame, frames, chunksize=4)):
            proc.stdin.write(img.tobytes())
            if log_every and k % log_every == 0:
                print(f"  frame {frames[k]:5d}  t={frames[k] / C.FPS:6.2f}s", flush=True)
    proc.stdin.close()
    if proc.wait() != 0:
        raise RuntimeError("ffmpeg failed")


def still(T, path):
    img = render_frame(int(round(T * C.FPS)))
    cv2.imwrite(path, cv2.cvtColor(img, cv2.COLOR_RGB2BGR))
