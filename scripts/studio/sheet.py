#!/usr/bin/env python3
"""Contact sheet of a film: one tile every N seconds (or at given frames), with the time on each tile.

  sheet.py <video> <out.jpg> [--every 3] [--frames 10,200,..] [--cols 8] [--width 180] [--mask] [--title "..."]
--mask draws the phone mask of the 9:16 frame on every tile (the 抖音 crop and the safe area, day-in-life-film skill).
Needs ffmpeg on PATH and Pillow.
"""
import argparse, io, os, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import slib
from PIL import Image, ImageDraw

# the 9:16 phone mask, in 1080 x 1920 film px (measured on the owner's phone, 15 Nov)
MASK = {"visible_x": (58, 1024), "safe_x": (110, 970), "safe_x_low": (110, 890), "low_y": 1000, "top_y": 222, "bottom_y": 1490}


def grab(video, frames, width, fps=30.0):
    """frames as PIL images, width wide, via one ffmpeg call per frame (fast seek)"""
    out = []
    for f in frames:
        t = f / fps
        b = subprocess.run([slib.ffmpeg(), "-v", "error", "-ss", f"{t:.4f}", "-i", video, "-frames:v", "1",
                            "-vf", f"scale={width}:-2", "-f", "image2pipe", "-vcodec", "png", "-"], capture_output=True).stdout
        out.append(Image.open(io.BytesIO(b)).convert("RGB") if b else Image.new("RGB", (width, width * 16 // 9)))
    return out


def draw_mask(im):
    d = ImageDraw.Draw(im, "RGBA")
    s = im.width / 1080.0
    W, H = im.width, im.height
    vx0, vx1 = [x * s for x in MASK["visible_x"]]
    d.rectangle([0, 0, vx0, H], fill=(255, 0, 0, 90)); d.rectangle([vx1, 0, W, H], fill=(255, 0, 0, 90))   # cut by the app
    d.rectangle([0, 0, W, MASK["top_y"] * s], fill=(255, 160, 0, 60))                                      # back / search icons
    d.rectangle([0, MASK["bottom_y"] * s, W, H], fill=(255, 160, 0, 60))                                   # caption / buttons area
    d.rectangle([MASK["safe_x_low"][1] * s, MASK["low_y"] * s, W, MASK["bottom_y"] * s], fill=(255, 160, 0, 60))   # like / share column
    d.rectangle([MASK["safe_x"][0] * s, MASK["top_y"] * s, MASK["safe_x"][1] * s, MASK["low_y"] * s], outline=(0, 255, 120, 200))
    d.rectangle([MASK["safe_x_low"][0] * s, MASK["low_y"] * s, MASK["safe_x_low"][1] * s, MASK["bottom_y"] * s], outline=(0, 255, 120, 200))
    return im


def make_sheet(video, out, frames=None, every=3.0, cols=8, width=180, mask=False, title=None, labels=None, fps=None):
    p = slib.probe(video)
    fps = fps or p.get("fps", 30.0)
    n = p.get("frames") or int(p["dur"] * fps)
    if not frames:
        step = max(1, int(round(every * fps)))
        frames = list(range(0, n, step))
    tiles = grab(video, frames, width, fps)
    th = tiles[0].height if tiles else width * 16 // 9
    lab = 16
    rows = (len(tiles) + cols - 1) // cols
    top = 28 if title else 0
    sheet = Image.new("RGB", (cols * width, top + rows * (th + lab)), (20, 20, 20))
    d = ImageDraw.Draw(sheet)
    if title: d.text((6, 6), title, fill=(255, 255, 255))
    for i, (f, im) in enumerate(zip(frames, tiles)):
        if mask: draw_mask(im)
        x, y = (i % cols) * width, top + (i // cols) * (th + lab)
        sheet.paste(im, (x, y))
        t = f / fps
        txt = f"{int(t // 60)}:{t % 60:04.1f}  f{f}" + (f"  {labels[i]}" if labels and i < len(labels) and labels[i] else "")
        d.text((x + 3, y + th + 2), txt[:40], fill=(230, 230, 230))
    sheet.save(out, quality=88)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video"); ap.add_argument("out")
    ap.add_argument("--every", type=float, default=3.0); ap.add_argument("--frames"); ap.add_argument("--cols", type=int, default=8)
    ap.add_argument("--width", type=int, default=180); ap.add_argument("--mask", action="store_true"); ap.add_argument("--title")
    a = ap.parse_args()
    fr = [int(x) for x in a.frames.split(",")] if a.frames else None
    make_sheet(a.video, a.out, fr, a.every, a.cols, a.width, a.mask, a.title or os.path.basename(a.video))
    print(a.out)


if __name__ == "__main__":
    main()
