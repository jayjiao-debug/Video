"""Shot rigging for the train film: the train moves on the tempo map, cameras ride with it.

- animate_train(root, t0, t1, C): keyframe the train root so x(t) = tempo.train_x(t) + C at every frame (linear).
  Pick C so that a chosen wheel sits on a rail joint on every beat: C ≡ −(car offset + wheel offset) (mod 12.5).
- camera_path(cam, target, keys, parent): keys = [(t, pos, look, lens, focus_m, fstop), ...] in the parent's local
  space (the hero car), smooth bezier between keys. focus_m None keeps the previous value.
"""
import bpy, math, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..'))
sys.path.insert(0, os.path.join(HERE, '..', '..'))
import tempo as T

FPS = 30


def frame_of(t):
    return int(round(t * FPS)) + 1          # frame 1 = film time 0


def time_of(frame):
    return (frame - 1) / FPS


def animate_train(root, t0, t1, C, wheel_spin=None):
    """x(t) = train_x(t) + C for every frame in [t0, t1]; wheel_spin(distance) optional callback is not keyed
    (call spin per still instead)."""
    f0, f1 = frame_of(t0), frame_of(t1)
    root.animation_data_clear()
    for f in range(f0, f1 + 1):
        root.location.x = T.train_x(time_of(f)) + C
        root.keyframe_insert('location', index=0, frame=f)
    for fc in root.animation_data.action.fcurves:
        for k in fc.keyframe_points:
            k.interpolation = 'LINEAR'


def train_x_at(t, C):
    return T.train_x(t) + C


def camera_path(cam, target, keys, parent=None):
    """keys: list of dicts {t, pos, look, lens?, focus?, fstop?}. Camera tracks the target empty."""
    if parent is not None:
        cam.parent = parent
        target.parent = parent
    c = cam.constraints.get('aim') or cam.constraints.new('TRACK_TO')
    c.name = 'aim'; c.target = target; c.track_axis = 'TRACK_NEGATIVE_Z'; c.up_axis = 'UP_Y'
    cam.data.dof.use_dof = True
    cam.animation_data_clear(); target.animation_data_clear(); cam.data.animation_data_clear()
    for k in keys:
        f = frame_of(k['t'])
        cam.location = k['pos']; cam.keyframe_insert('location', frame=f)
        target.location = k['look']; target.keyframe_insert('location', frame=f)
        if 'lens' in k:
            cam.data.lens = k['lens']; cam.data.keyframe_insert('lens', frame=f)
        if k.get('focus') is not None:
            cam.data.dof.focus_distance = k['focus']; cam.data.dof.keyframe_insert('focus_distance', frame=f)
        if 'fstop' in k:
            cam.data.dof.aperture_fstop = k['fstop']; cam.data.dof.keyframe_insert('aperture_fstop', frame=f)
        if 'roll' in k:
            pass
    for ob in (cam, target, cam.data):
        ad = ob.animation_data
        if ad and ad.action:
            for fc in ad.action.fcurves:
                for kp in fc.keyframe_points:
                    kp.interpolation = 'BEZIER'
                    kp.handle_left_type = kp.handle_right_type = 'AUTO_CLAMPED'
                fc.update()


def hold(keys, t, dt=0.0):
    """repeat the key at time t (for holds)."""
    k = next(k for k in keys if abs(k['t'] - t) < 1e-6)
    return dict(k, t=t + dt)
