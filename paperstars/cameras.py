"""Camera paths for every shot, as functions of absolute film time T.

A camera is {x, y, ground}: horizontal pan (in near-layer pixels), upward
tilt (positive = looking up, content moves down), and each layer's ground
line in screen pixels at y = 0. Parallax scales x and y per layer.
"""

from . import config as C
from .util import ease_in_out, lerp


def _cam(x, y, far, mid, near):
    return {"x": x, "y": y, "ground": {"far": far, "mid": mid, "near": near}}


def city_open_cam(T):
    u = (T - 6.0) / 14.0
    return _cam(lerp(160, 420, u), 0.0, 560, 650, 900)


def rooftop_cam(T):
    # a very slow drift so the background breathes
    return _cam(700 + (T - 19) * 2.0, 0.0, 500, 640, 1180)


def drift_cam(T):
    u = ease_in_out((T - 56.0) / 17.0)
    return _cam(lerp(1180, 900, u), 0.0, 470, 560, 860)  # follow the stars leftward


def blackout_cam(T):
    tilt = 380 * ease_in_out((T - C.TILT[0]) / (C.TILT[1] - C.TILT[0]))
    x = 1500 + (T - 72.0) * 1.5
    return _cam(x, tilt, 540, 615, 900)


def end_cam(T):
    tilt = 1500 * ease_in_out((T - 116.5) / 9.0)
    return dict(rooftop_cam(T), y=tilt)


def sky_offset(cam):
    """How far the sky image scrolls for a given camera (sky has low parallax)."""
    return cam["y"] * 0.35
