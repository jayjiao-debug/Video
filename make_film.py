#!/usr/bin/env python3
"""Render PAPER STARS.

  python make_film.py                  # full film -> output/paper_stars.mp4
  python make_film.py --stills         # contact sheet of key frames -> output/stills/
  python make_film.py --preview 57 72  # render a time range without audio
  python make_film.py --audio-only     # just the soundtrack -> output/soundtrack.wav
  python make_film.py --poster         # poster frame -> output/poster.png
"""

import argparse
import os
import time

from paperstars import config as C

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "output")

KEY_FRAMES = [3.5, 12.0, 21.5, 25.5, 33.0, 36.0, 38.8, 40.5, 44.5, 48.5, 53.5, 60.0, 67.0,
              75.5, 80.0, 85.5, 88.5, 93.0, 99.0, 104.0, 108.5, 111.6, 118.0, 121.0, 124.0]


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--stills", action="store_true")
    ap.add_argument("--preview", nargs=2, type=float, metavar=("START", "END"))
    ap.add_argument("--audio-only", action="store_true")
    ap.add_argument("--poster", action="store_true")
    ap.add_argument("--workers", type=int, default=None)
    args = ap.parse_args()
    os.makedirs(OUT, exist_ok=True)
    t_start = time.time()

    if args.poster:
        import cv2
        from paperstars.render import post
        from paperstars.shots import shot_together
        from paperstars.util import Canvas
        T = 111.75  # the shooting star over the two rooftops
        frame = shot_together(T)
        cv = Canvas()
        cv.text(C.W / 2, 96, C.TITLE, 60, (0.95, 0.9, 0.82), 0.95, tracking=0.32)
        cv.text(C.W / 2, 150, "look up.", 22, (0.8, 0.82, 0.88), 0.85, font="serif-italic", tracking=0.15)
        img = post().apply(cv.composite(frame), T, 0)
        path = os.path.join(OUT, "poster.png")
        cv2.imwrite(path, cv2.cvtColor(img, cv2.COLOR_RGB2BGR))
        print("wrote", path)
        return

    if args.stills:
        from paperstars.render import still
        os.makedirs(os.path.join(OUT, "stills"), exist_ok=True)
        for T in KEY_FRAMES:
            path = os.path.join(OUT, "stills", f"t{T:06.1f}.png")
            still(T, path)
            print("wrote", path)
        return

    from paperstars.audio import write_soundtrack
    wav = os.path.join(OUT, "soundtrack.wav")
    if args.audio_only:
        write_soundtrack(wav)
        print("wrote", wav)
        return

    from paperstars.render import encode
    if args.preview:
        a, b = args.preview
        path = os.path.join(OUT, f"preview_{a:g}-{b:g}.mp4")
        encode(path, range(int(a * C.FPS), int(b * C.FPS)), workers=args.workers, crf=23)
    else:
        print("composing soundtrack...")
        write_soundtrack(wav)
        path = os.path.join(OUT, "paper_stars.mp4")
        print("rendering picture...")
        encode(path, range(int(C.DURATION * C.FPS)), audio_path=wav, workers=args.workers)
    print(f"wrote {path} in {time.time() - t_start:.0f}s")


if __name__ == "__main__":
    main()
