"""kit/track.py — the track, the snowy night world, the underpass and the snowfall
for 《开往零点的列车》 (bpy 4.2, Cycles).

World conventions (see common.py): metres, Z up, track along +X centred on y = 0, rail top z = 0.
Rails: CHN60 (60 kg/m) profile, centre lines at y = ±RAIL_Y (0.754), gauge 1.435.
Joints every 12.5 m (x = 12.5·k), 8 mm gap. 21 sleepers per 12.5 m rail (≈0.595 m pitch), the joint
suspended midway between two sleepers. Sleeper bottoms sit on the ballast bed at z ≈ −0.40 (BALLAST_TOP);
crib ballast is filled up to z ≈ −0.245, shoulders heaped to −0.215, slopes 1:1.75 down to the
subgrade (−0.75); field snow level −0.9. All datablocks are prefixed 'trk_'.

API
---
build_track(x0, x1, coll=None, lod='hero', seed=0, snow=1.0)
    -> dict(rails=[rail_R, rail_L], joints=[x, ...], sleepers=obj, fishplates=[objs], stones=obj|None,
            ballast=obj, snow=obj, foot_snow=[objs], coll=collection)
    lod='hero': CHN60 rails, fishplates + 6 bolts/nuts per joint side, Type-III concrete sleepers with ω-clips,
    nuts, insulators and pads, instanced crushed-stone ballast, powder snow on sleepers / four-foot,
    banked snow on shoulders, snow on the rail foot (never on the head).
    lod='mid': same rails/joints, plain fishplates (no bolts), simpler instanced sleepers, textured ballast
    surface (no stones), coarser snow. Use for track further than ~40 m from camera.
build_field(x0, x1, coll=None, seed=0, poles=True, trees=True, village=True, hills=True, pole_x=None)
    -> dict(snow=obj, poles=[objs], wires=obj, trees=[objs], hills=obj, village=obj, coll=collection)
    Rolling moonlit snow plain around the track, snow embankment from the ballast down to z ≈ −0.9, poplar
    wind-break rows, low hills, concrete line-side poles every 50 m along y = −4 with 4 sagging wires,
    a few warm village lights on the horizon. pole_x=(xa, xb) overrides the pole range (default x0..x1).
build_underpass(x_center, length=14.0, coll=None, lamp=True, fill=1.0, width=11.6)
    -> dict(walls=[objs], deck=obj, floor=obj, lamp=light, icicles=obj, coll=collection, zone=(x_a, x_b))
    Concrete road bridge over the track: two board-formed abutment walls (y = ±width/2) with cap beams and
    bearings, precast slab deck (soffit z = 5.4) with cornices and parapets, wing walls, wet concrete aprons
    with puddles, a drainage channel, water stains/efflorescence, icicles, one caged blue-white wall lamp.
    Inside the zone the track snow disappears and the ballast/sleepers turn wet (shader zone, any build order).
snowfall(center, size=(60, 20, 12), density=1.0, coll=None, seed=0) -> obj
    Static, world-space, instanced soft flakes (flattened icospheres / clumps, 0.8–2.4 cm), ~1.4·density
    flakes per m³. Geometry-nodes driven, wrap-around inside the box.
advance_snow(snow, t) -> None        moves every flake to its position at time t (s): fall + wind + sway.
animate_snow(snow, frame_start, frame_end, fps=None) -> None   keyframes t linearly (t = frame / fps).
night_world(kind='plain'|'underpass', strength=1.0, moon_azimuth=110, moon_elevation=16, hdri=None, haze=1.0)
    -> dict(world=world, moon=sun_obj, moon_disc=obj|None)
    'plain': day-for-night graded HDRI (common.world_hdri) with the sun capped, aligned to a moon sun-lamp
    and a small moon disc; 'underpass': a dark-blue low world with a dimmer moon. Also sets the distance
    haze shared by all field materials and a soft glare in the compositor.
    moon_azimuth uses common.moon's convention: the moon sits in direction (sin az, −cos az) in XY,
    so 90° = straight down +X (the direction of travel), 110° = +X slightly to the left (+y).

Review stills:  /home/user/venv-bpy/bin/python kit/track.py [joint|plain|underpass|embankment|all]
"""
import sys, os, math, time
sys.path.insert(0, '/home/user/Video/episodes/50-yinyue/train/blender')
from common import *          # noqa: F401,F403
import common
import bpy
import numpy as np

# ----------------------------------------------------------------------------- constants
GAUGE = 1.435
RAIL_Y = GAUGE / 2 + 0.0365          # rail centre lines
RAIL_H = 0.176
SLEEPER_TOP = -0.186                 # rail seat (rail foot −0.176 on a 10 mm pad)
SLEEPER_BOT = -0.416
BALLAST_TOP = -0.40                  # bed the sleepers sit on (world convention)
CRIB_Z = -0.245                      # crib / four-foot ballast fill level
SHOULDER_Z = -0.215
SUBGRADE_Z = -0.75
FIELD_Z = -0.90
JOINT_EVERY = 12.5
JOINT_GAP = 0.008
SLEEPERS_PER_RAIL = 21
FISH_HALF = 0.41                     # 820 mm six-hole joint bar
BOLT_X = (0.07, 0.21, 0.35)
BOLT_Z = -0.100
SCRATCH = '/tmp/claude-0/-home-user-Video/ca950e1c-26f8-5f17-9c2a-78a6336a8884/scratchpad/kit/track_env'

_ZONE_KEY = 'trk_zones'              # scene custom prop: list of (xa, xb) underpass zones


# ============================================================================= small utilities
def _smooth(t):
    t = np.clip(t, 0.0, 1.0)
    return t * t * (3 - 2 * t)


def _hash(ix, iy, seed):
    h = (ix.astype(np.int64) * 374761393 + iy.astype(np.int64) * 668265263 + (seed * 1013904223) % 2147483647) & 0xFFFFFFFF
    h = ((h ^ (h >> 13)) * 1274126177) & 0xFFFFFFFF
    h = h ^ (h >> 16)
    return (h & 0xFFFFFF).astype(np.float64) / 16777215.0


def vnoise(x, y, seed=0):
    """2D value noise in [0, 1] (numpy, vectorised)."""
    x = np.asarray(x, float); y = np.asarray(y, float)
    xi = np.floor(x); yi = np.floor(y)
    xf = x - xi; yf = y - yi
    xi = xi.astype(np.int64); yi = yi.astype(np.int64)
    u = xf * xf * (3 - 2 * xf); v = yf * yf * (3 - 2 * yf)
    a = _hash(xi, yi, seed); b = _hash(xi + 1, yi, seed)
    c = _hash(xi, yi + 1, seed); d = _hash(xi + 1, yi + 1, seed)
    ab = a + (b - a) * u; cd = c + (d - c) * u
    return ab + (cd - ab) * v


def fbm(x, y, octaves=4, seed=0, lac=2.03, gain=0.5):
    """Fractal value noise, roughly in [-1, 1]."""
    x = np.asarray(x, float); y = np.asarray(y, float)
    s = 0.0; amp = 1.0; norm = 0.0
    for o in range(octaves):
        s = s + amp * (vnoise(x, y, seed + 31 * o) * 2 - 1)
        norm += amp
        x = x * lac + 17.31; y = y * lac + 3.71; amp *= gain
    return s / norm


def _coll(coll, name):
    return coll if coll is not None else collection(name)


def _templates():
    """Hidden collection that holds instancing sources (excluded from the view layer)."""
    sc = bpy.context.scene
    c = bpy.data.collections.get('trk_templates')
    if c is None:
        c = bpy.data.collections.new('trk_templates')
    if c.name not in [x.name for x in sc.collection.children]:
        sc.collection.children.link(c)
    lc = bpy.context.view_layer.layer_collection.children.get(c.name)
    if lc:
        lc.exclude = True
    return c


def _subtemplates(name):
    parent = _templates()
    c = bpy.data.collections.get(name) or bpy.data.collections.new(name)
    if c.name not in [x.name for x in parent.children]:
        parent.children.link(c)
    return c


# ----------------------------------------------------------------------------- 2D profile helpers
def _round_path(pts, radii=None, seg=3, closed=False):
    """Polyline with filleted corners. pts (N,2); radii per corner (0 = sharp)."""
    pts = [np.array(p, float) for p in pts]
    n = len(pts)
    out = []
    for i in range(n):
        r = radii[i] if radii is not None else 0.0
        if r <= 0 or (not closed and (i == 0 or i == n - 1)):
            out.append(pts[i]); continue
        p0, p1, p2 = pts[i - 1], pts[i], pts[(i + 1) % n]
        d1 = p0 - p1; d1 /= np.linalg.norm(d1)
        d2 = p2 - p1; d2 /= np.linalg.norm(d2)
        ang = math.acos(float(np.clip(np.dot(d1, d2), -1, 1)))
        if ang < 1e-3 or ang > math.pi - 1e-3:
            out.append(p1); continue
        t = r / math.tan(ang / 2)
        a = p1 + d1 * t; b = p1 + d2 * t
        bis = d1 + d2; bis /= np.linalg.norm(bis)
        c = p1 + bis * (r / math.sin(ang / 2))
        a0 = math.atan2(a[1] - c[1], a[0] - c[0]); a1 = math.atan2(b[1] - c[1], b[0] - c[0])
        da = (a1 - a0 + math.pi) % (2 * math.pi) - math.pi
        for k in range(seg + 1):
            th = a0 + da * k / seg
            out.append(c + r * np.array([math.cos(th), math.sin(th)]))
    return np.array(out)


def _ccw(poly):
    x, y = poly[:, 0], poly[:, 1]
    area = 0.5 * np.sum(x * np.roll(y, -1) - np.roll(x, -1) * y)
    return poly if area > 0 else poly[::-1].copy()


def _inset(poly, d):
    """Move each vertex of a CCW polygon inward by d (vertex-normal offset)."""
    nxt = np.roll(poly, -1, 0); prv = np.roll(poly, 1, 0)
    e1 = poly - prv; e2 = nxt - poly
    n1 = np.stack([e1[:, 1], -e1[:, 0]], 1); n2 = np.stack([e2[:, 1], -e2[:, 0]], 1)
    n1 /= np.linalg.norm(n1, axis=1, keepdims=True) + 1e-12
    n2 /= np.linalg.norm(n2, axis=1, keepdims=True) + 1e-12
    vn = n1 + n2; vn /= np.linalg.norm(vn, axis=1, keepdims=True) + 1e-12
    return poly - vn * d


# ----------------------------------------------------------------------------- mesh builder
class MB:
    """Accumulates parts (numpy verts + faces) with material index and per-vertex float attributes."""

    def __init__(self):
        self.V, self.F, self.M, self.A = [], [], [], {}
        self.n = 0

    def add(self, verts, faces, mat=0, attrs=None):
        verts = np.asarray(verts, float).reshape(-1, 3)
        nv = len(verts)
        self.V.append(verts)
        if isinstance(faces, np.ndarray) and faces.ndim == 2:
            self.F.append(faces + self.n)
            nf = len(faces)
        else:
            fl = [np.asarray(f, np.int64) + self.n for f in faces]
            self.F.extend(fl)
            nf = len(fl)
        self.M.append(np.full(nf, mat, np.int32))
        for k in set(self.A) | set(attrs or {}):
            if k not in self.A:
                self.A[k] = [np.zeros(self.n)]
            v = (attrs or {}).get(k, 0.0)
            self.A[k].append(np.broadcast_to(np.asarray(v, float), (nv,)).copy())
        self.n += nv
        return self

    def mesh(self, name, smooth=True, sharp_angle=35):
        V = np.concatenate(self.V) if self.V else np.zeros((0, 3))
        sizes, flat = [], []
        for f in self.F:
            if f.ndim == 2:
                sizes.append(np.full(len(f), f.shape[1], np.int64)); flat.append(f.ravel())
            else:
                sizes.append(np.array([len(f)], np.int64)); flat.append(f)
        sizes = np.concatenate(sizes) if sizes else np.zeros(0, np.int64)
        flat = np.concatenate(flat) if flat else np.zeros(0, np.int64)
        me = bpy.data.meshes.new(name)
        me.vertices.add(len(V)); me.vertices.foreach_set('co', V.astype(np.float32).ravel())
        me.loops.add(len(flat)); me.loops.foreach_set('vertex_index', flat.astype(np.int32))
        starts = np.concatenate([[0], np.cumsum(sizes)[:-1]]).astype(np.int32)
        me.polygons.add(len(sizes)); me.polygons.foreach_set('loop_start', starts)
        mi = np.concatenate(self.M) if self.M else np.zeros(0, np.int32)
        me.polygons.foreach_set('material_index', mi)
        me.update(calc_edges=True)
        me.polygons.foreach_set('use_smooth', np.full(len(sizes), smooth, bool))
        if smooth and sharp_angle:
            me.set_sharp_from_angle(angle=math.radians(sharp_angle))
        for k, parts in self.A.items():
            a = np.concatenate(parts).astype(np.float32)
            at = me.attributes.new(k, 'FLOAT', 'POINT'); at.data.foreach_set('value', a)
        me.update()
        return me

    def obj(self, name, coll, mats, smooth=True, sharp_angle=35):
        me = self.mesh(name, smooth, sharp_angle)
        for m in mats:
            me.materials.append(m)
        o = bpy.data.objects.new(name, me)
        coll.objects.link(o)
        return o


def _grid_faces(nu, nv):
    """Quad faces for a (nu, nv) vertex grid laid out row-major (u slow, v fast)."""
    i = np.arange(nu - 1)[:, None] * nv + np.arange(nv - 1)[None, :]
    i = i.ravel()
    return np.stack([i, i + nv, i + nv + 1, i + 1], 1)


def extrude_x(prof, x0, x1, chamfer=0.0015, caps=True):
    """Extrude a closed (y, z) profile along +X from x0 to x1 with chamfered ends. Returns verts, faces."""
    prof = _ccw(np.asarray(prof, float))
    P = len(prof)
    rings = []
    if chamfer > 0:
        # rounded end edges: quarter circle of radius `chamfer`
        th = np.radians([0, 35, 65, 90])
        a = [(chamfer * (1 - math.cos(t)), _inset(prof, chamfer * (1 - math.sin(t))) if t < math.pi / 2 - 1e-6 else prof) for t in th]
        xs = [(x0 + dx, p) for dx, p in a] + [(x1 - dx, p) for dx, p in a[::-1]]
    else:
        xs = [(x0, prof), (x1, prof)]
    for x, p in xs:
        rings.append(np.column_stack([np.full(P, x), p[:, 0], p[:, 1]]))
    V = np.concatenate(rings)
    faces = []
    R = len(rings)
    i = np.arange(P); j = (i + 1) % P
    for r in range(R - 1):
        a = r * P; b = (r + 1) * P
        faces.append(np.stack([a + i, a + j, b + j, b + i], 1))
    faces = [f for f in np.concatenate(faces)]
    if caps:
        faces.append(np.arange(P)[::-1].copy())
        faces.append((R - 1) * P + np.arange(P))
    return V, faces


def lathe_np(profile, seg=24, axis='z', cap0=True, cap1=True):
    """Revolve (r, h) profile around the local axis. Returns verts, faces (outward normals)."""
    pr = np.asarray(profile, float)
    n = len(pr)
    a = np.linspace(0, 2 * math.pi, seg, endpoint=False)
    ca, sa = np.cos(a), np.sin(a)
    V = np.zeros((seg * n, 3))
    V[:, 0] = (ca[:, None] * pr[None, :, 0]).ravel()
    V[:, 1] = (sa[:, None] * pr[None, :, 0]).ravel()
    V[:, 2] = np.tile(pr[:, 1], seg)
    F = []
    for i in range(seg):
        j = (i + 1) % seg
        for k in range(n - 1):
            F.append([i * n + k, j * n + k, j * n + k + 1, i * n + k + 1])
    F = [f for f in F]
    if cap0 and pr[0, 0] > 1e-6:
        F.append([i * n for i in range(seg)][::-1])
    if cap1 and pr[-1, 0] > 1e-6:
        F.append([i * n + n - 1 for i in range(seg)])
    if axis == 'x':
        V = V[:, [2, 0, 1]]
    elif axis == 'y':
        V = V[:, [1, 2, 0]]
    return V, F


def tube_np(path, radius, sides=8, closed_ends=True):
    """Sweep a circle along a 3D polyline (parallel-transport frames). radius: scalar or per-point."""
    P = np.asarray(path, float)
    n = len(P)
    r = np.broadcast_to(np.asarray(radius, float), (n,))
    T = np.gradient(P, axis=0)
    T /= np.linalg.norm(T, axis=1, keepdims=True) + 1e-12
    ref = np.array([0, 0, 1.0]) if abs(T[0, 2]) < 0.9 else np.array([1.0, 0, 0])
    N = np.cross(T[0], ref); N /= np.linalg.norm(N)
    Ns = [N]
    for i in range(1, n):
        v = np.cross(Ns[-1], T[i]); B = np.cross(T[i], Ns[-1])
        Nn = np.cross(B, T[i]); Nn /= np.linalg.norm(Nn) + 1e-12
        Ns.append(Nn)
    Ns = np.array(Ns); Bs = np.cross(T, Ns)
    a = np.linspace(0, 2 * math.pi, sides, endpoint=False)
    V = (P[:, None, :] + r[:, None, None] * (np.cos(a)[None, :, None] * Ns[:, None, :] + np.sin(a)[None, :, None] * Bs[:, None, :]))
    V = V.reshape(-1, 3)
    F = []
    for i in range(n - 1):
        for k in range(sides):
            k2 = (k + 1) % sides
            F.append([i * sides + k, i * sides + k2, (i + 1) * sides + k2, (i + 1) * sides + k])
    if closed_ends:
        F.append(list(range(sides))[::-1])
        F.append([(n - 1) * sides + k for k in range(sides)])
    return V, F


def catmull(points, per=6, closed=False):
    """Catmull-Rom resample of a 3D point list."""
    P = np.asarray(points, float)
    if closed:
        P = np.concatenate([P[-1:], P, P[:2]])
    else:
        P = np.concatenate([P[:1] * 2 - P[1:2], P, P[-1:] * 2 - P[-2:-1]])
    out = []
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = P[i - 1], P[i], P[i + 1], P[i + 2]
        for k in range(per):
            t = k / per
            out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3))
    if not closed:
        out.append(P[-2])
    return np.array(out)


def box_np(sx, sy, sz, c=(0, 0, 0), r=0.0, seg=2):
    """Box (optionally with rounded vertical+horizontal edges via a rounded (x,z) profile extruded along y)."""
    if r <= 0:
        x, y, z = sx / 2, sy / 2, sz / 2
        V = np.array([(-x, -y, -z), (x, -y, -z), (x, y, -z), (-x, y, -z), (-x, -y, z), (x, -y, z), (x, y, z), (-x, y, z)])
        F = [[0, 3, 2, 1], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]]
        return V + np.asarray(c), F
    x, z = sx / 2, sz / 2
    prof = _round_path([(-x, -z), (x, -z), (x, z), (-x, z)], [r] * 4, seg, closed=True)
    V, F = extrude_x(prof[:, [0, 1]], -sy / 2, sy / 2, chamfer=min(r, sy / 4))
    # extrude_x gives (x_along, a, b) -> map: along -> y, a -> x, b -> z
    V = V[:, [1, 0, 2]]
    F = [f[::-1] for f in F]   # swapping axes mirrors winding
    return V + np.asarray(c), F


def _xf(V, rot_z=0.0, rot_x=0.0, rot_y=0.0, t=(0, 0, 0), s=1.0):
    V = np.asarray(V, float) * s
    if rot_x:
        c, s_ = math.cos(rot_x), math.sin(rot_x)
        V = V @ np.array([[1, 0, 0], [0, c, s_], [0, -s_, c]])
    if rot_y:
        c, s_ = math.cos(rot_y), math.sin(rot_y)
        V = V @ np.array([[c, 0, -s_], [0, 1, 0], [s_, 0, c]])
    if rot_z:
        c, s_ = math.cos(rot_z), math.sin(rot_z)
        V = V @ np.array([[c, s_, 0], [-s_, c, 0], [0, 0, 1]])
    return V + np.asarray(t, float)


# ============================================================================= node helpers
def _fresh(name):
    mat = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new('ShaderNodeOutputMaterial')
    return mat, nt, out


def N(nt, kind, ins=None, **props):
    """Create a node; ins maps input name/index -> value or socket."""
    n = nt.nodes.new(kind)
    for k, v in props.items():
        setattr(n, k, v)
    for k, v in (ins or {}).items():
        if isinstance(v, bpy.types.NodeSocket):
            nt.links.new(v, n.inputs[k])
        else:
            n.inputs[k].default_value = v
    return n


def L(nt, a, b):
    nt.links.new(a, b)


def math_(nt, op, a, b=None, c=None, clamp=False):
    n = nt.nodes.new('ShaderNodeMath'); n.operation = op; n.use_clamp = clamp
    for i, v in enumerate((a, b, c)):
        if v is None:
            continue
        if isinstance(v, bpy.types.NodeSocket):
            nt.links.new(v, n.inputs[i])
        else:
            n.inputs[i].default_value = v
    return n.outputs[0]


def mrange(nt, v, a0, a1, b0=0.0, b1=1.0, clamp=True, interp='SMOOTHSTEP'):
    n = nt.nodes.new('ShaderNodeMapRange'); n.clamp = clamp; n.interpolation_type = interp
    for k, x in (('From Min', a0), ('From Max', a1), ('To Min', b0), ('To Max', b1)):
        if isinstance(x, bpy.types.NodeSocket):
            nt.links.new(x, n.inputs[k])
        else:
            n.inputs[k].default_value = x
    nt.links.new(v, n.inputs['Value'])
    return n.outputs['Result']


def mixc(nt, fac, a, b, blend='MIX'):
    n = nt.nodes.new('ShaderNodeMix'); n.data_type = 'RGBA'; n.blend_type = blend
    for i, v in ((0, fac), (6, a), (7, b)):
        if isinstance(v, bpy.types.NodeSocket):
            nt.links.new(v, n.inputs[i])
        else:
            n.inputs[i].default_value = v if i else v
    return n.outputs[2]


def mixf(nt, fac, a, b):
    n = nt.nodes.new('ShaderNodeMix'); n.data_type = 'FLOAT'
    for i, v in ((0, fac), (2, a), (3, b)):
        if isinstance(v, bpy.types.NodeSocket):
            nt.links.new(v, n.inputs[i])
        else:
            n.inputs[i].default_value = v
    return n.outputs[0]


def mixs(nt, fac, a, b):
    n = nt.nodes.new('ShaderNodeMixShader')
    if isinstance(fac, bpy.types.NodeSocket):
        nt.links.new(fac, n.inputs[0])
    else:
        n.inputs[0].default_value = fac
    nt.links.new(a, n.inputs[1]); nt.links.new(b, n.inputs[2])
    return n.outputs[0]


def col(h):
    return srgb(h) if isinstance(h, str) else h


def _img(nt, path, vec, non_color=False, proj='BOX', blend=0.3):
    n = nt.nodes.new('ShaderNodeTexImage')
    n.image = bpy.data.images.load(path, check_existing=True)
    if non_color:
        n.image.colorspace_settings.name = 'Non-Color'
    n.projection = proj; n.projection_blend = blend
    nt.links.new(vec, n.inputs['Vector'])
    return n


def tex(nt, tex_id, vec, scale=1.0, maps=('diff', 'rough', 'disp'), res='2k', proj='BOX', blend=0.3, offset=None):
    """Poly Haven maps box-projected from vec. Returns dict of output sockets."""
    t = ph_texture(tex_id, res)
    mp = N(nt, 'ShaderNodeMapping', {'Vector': vec, 'Scale': (scale,) * 3})
    v = mp.outputs[0]
    if offset is not None:
        v = N(nt, 'ShaderNodeVectorMath', {0: v, 1: offset}, operation='ADD').outputs[0]
    out = {}
    for k in maps:
        if k in t:
            out[k] = _img(nt, t[k], v, k != 'diff', proj, blend).outputs['Color']
    return out


def coords(nt, kind='Object'):
    return N(nt, 'ShaderNodeTexCoord').outputs[kind]


def inst_offset(nt, amount=37.0):
    """Per-object/instance random 3D offset (decorrelates textures of instances)."""
    oi = N(nt, 'ShaderNodeObjectInfo')
    r = oi.outputs['Random']
    v = N(nt, 'ShaderNodeCombineXYZ', {0: math_(nt, 'MULTIPLY', r, amount), 1: math_(nt, 'MULTIPLY', r, amount * 1.7),
                                        2: math_(nt, 'MULTIPLY', r, amount * 0.6)}).outputs[0]
    return v, r


def bump(nt, h, dist=0.005, strength=1.0, normal=None):
    b = N(nt, 'ShaderNodeBump', {'Height': h, 'Distance': dist, 'Strength': strength})
    if normal is not None:
        L(nt, normal, b.inputs['Normal'])
    return b.outputs[0]


def bsdf(nt, color=(0.8, 0.8, 0.8, 1), rough=0.5, metal=0.0, normal=None, spec=0.5, **kw):
    b = N(nt, 'ShaderNodeBsdfPrincipled')
    for k, v in (('Base Color', color), ('Roughness', rough), ('Metallic', metal), ('Specular IOR Level', spec)):
        if isinstance(v, bpy.types.NodeSocket):
            L(nt, v, b.inputs[k])
        else:
            b.inputs[k].default_value = col(v) if k == 'Base Color' else v
    if normal is not None:
        L(nt, normal, b.inputs['Normal'])
    for k, v in kw.items():
        k2 = k.replace('_', ' ')
        if isinstance(v, bpy.types.NodeSocket):
            L(nt, v, b.inputs[k2])
        else:
            b.inputs[k2].default_value = v
    return b


# ----------------------------------------------------------------------------- shared shader groups
def _zone_group():
    """Shader group 'trk_zone': Fac = 1 inside an underpass (world x range, soft ends), else 0."""
    ng = bpy.data.node_groups.get('trk_zone')
    if ng:
        return ng
    ng = bpy.data.node_groups.new('trk_zone', 'ShaderNodeTree')
    ng.interface.new_socket('Fac', in_out='OUTPUT', socket_type='NodeSocketFloat')
    nt = ng
    go = nt.nodes.new('NodeGroupOutput')
    geo = N(nt, 'ShaderNodeNewGeometry')
    sep = N(nt, 'ShaderNodeSeparateXYZ', {0: geo.outputs['Position']})
    acc = None
    for k in range(2):
        xa = N(nt, 'ShaderNodeValue'); xa.name = xa.label = f'xa{k}'; xa.outputs[0].default_value = 1e6
        xb = N(nt, 'ShaderNodeValue'); xb.name = xb.label = f'xb{k}'; xb.outputs[0].default_value = 1e6 + 1
        soft = 2.5
        m1 = mrange(nt, sep.outputs[0], math_(nt, 'SUBTRACT', xa.outputs[0], soft * 0.2), math_(nt, 'ADD', xa.outputs[0], soft))
        m2 = mrange(nt, sep.outputs[0], math_(nt, 'SUBTRACT', xb.outputs[0], soft), math_(nt, 'ADD', xb.outputs[0], soft * 0.2), 1.0, 0.0)
        m = math_(nt, 'MULTIPLY', m1, m2)
        acc = m if acc is None else math_(nt, 'MAXIMUM', acc, m)
    # also limit laterally (inside the walls)
    ay = math_(nt, 'ABSOLUTE', sep.outputs[1])
    my = mrange(nt, ay, 6.5, 8.5, 1.0, 0.0)
    L(nt, math_(nt, 'MULTIPLY', acc, my), go.inputs[0])
    return ng


def _set_zone(k, xa, xb):
    ng = _zone_group()
    ng.nodes[f'xa{k}'].outputs[0].default_value = xa
    ng.nodes[f'xb{k}'].outputs[0].default_value = xb


def zone(nt):
    g = N(nt, 'ShaderNodeGroup'); g.node_tree = _zone_group()
    return g.outputs[0]


def _haze_group():
    """Shader group 'trk_haze': mixes a shader toward the night haze by camera distance.
    Values 'haze_density' (1/m), 'haze_strength', colour 'haze_color' are set by night_world()."""
    ng = bpy.data.node_groups.get('trk_haze')
    if ng:
        return ng
    ng = bpy.data.node_groups.new('trk_haze', 'ShaderNodeTree')
    ng.interface.new_socket('Shader', in_out='INPUT', socket_type='NodeSocketShader')
    ng.interface.new_socket('Amount', in_out='INPUT', socket_type='NodeSocketFloat').default_value = 1.0
    ng.interface.new_socket('Shader', in_out='OUTPUT', socket_type='NodeSocketShader')
    nt = ng
    gi = nt.nodes.new('NodeGroupInput'); go = nt.nodes.new('NodeGroupOutput')
    dens = N(nt, 'ShaderNodeValue'); dens.name = dens.label = 'haze_density'; dens.outputs[0].default_value = 1 / 1400
    stren = N(nt, 'ShaderNodeValue'); stren.name = stren.label = 'haze_strength'; stren.outputs[0].default_value = 0.25
    hc = N(nt, 'ShaderNodeRGB'); hc.name = hc.label = 'haze_color'; hc.outputs[0].default_value = srgb('#6E93B4')
    cam = N(nt, 'ShaderNodeCameraData')
    d = math_(nt, 'MULTIPLY', cam.outputs['View Distance'], dens.outputs[0])
    f = math_(nt, 'SUBTRACT', 1.0, math_(nt, 'EXPONENT', math_(nt, 'MULTIPLY', d, -1.0)))
    f = math_(nt, 'MULTIPLY', f, gi.outputs['Amount'], clamp=True)
    em = N(nt, 'ShaderNodeEmission', {'Color': hc.outputs[0], 'Strength': stren.outputs[0]})
    L(nt, mixs(nt, f, gi.outputs['Shader'], em.outputs[0]), go.inputs[0])
    return ng


def haze(nt, shader, amount=1.0):
    g = N(nt, 'ShaderNodeGroup'); g.node_tree = _haze_group()
    L(nt, shader, g.inputs['Shader'])
    g.inputs['Amount'].default_value = amount
    return g.outputs[0]


def snow_bsdf(nt, normal=None, tint=(0.86, 0.90, 0.96, 1.0), rough=0.62, sss=0.0):
    b = bsdf(nt, tint, rough, 0.0, normal, spec=0.5)
    if sss > 0:
        b.subsurface_method = 'BURLEY'
        b.inputs['Subsurface Weight'].default_value = sss
        b.inputs['Subsurface Radius'].default_value = (0.5, 0.7, 1.0)
        b.inputs['Subsurface Scale'].default_value = 0.02
    return b


def snow_dust(nt, base_shader, amount=0.7, scale=9.0, up=(0.55, 0.85), vec=None, extra_mask=None, normal=None):
    """Mix a base shader toward powder snow on upward-facing parts (noise-broken). Respects the underpass zone."""
    geo = N(nt, 'ShaderNodeNewGeometry')
    nz = N(nt, 'ShaderNodeSeparateXYZ', {0: geo.outputs['Normal']}).outputs[2]
    m_up = mrange(nt, nz, up[0], up[1])
    v = vec if vec is not None else geo.outputs['Position']
    no = N(nt, 'ShaderNodeTexNoise', {'Vector': v, 'Scale': scale, 'Detail': 6.0, 'Roughness': 0.6})
    m_n = mrange(nt, no.outputs['Fac'], 0.62 - 0.25 * amount, 0.70 - 0.25 * amount)
    m = math_(nt, 'MULTIPLY', m_up, m_n)
    if extra_mask is not None:
        m = math_(nt, 'MULTIPLY', m, extra_mask)
    m = math_(nt, 'MULTIPLY', m, math_(nt, 'SUBTRACT', 1.0, zone(nt)))
    hb = bump(nt, no.outputs['Fac'], 0.004, 0.6, normal)
    s = snow_bsdf(nt, hb, rough=0.7)
    return mixs(nt, m, base_shader, s.outputs[0])


# ============================================================================= materials
def _mat(name, builder):
    m = bpy.data.materials.get(name)
    if m is not None and m.get('trk_built'):
        return m
    m = builder(name)
    m['trk_built'] = 1
    return m


def mat_rail(name='trk_rail'):
    """CHN60 rail: polished running band on the head, oxidised edges, brown rust on web/foot, snow on the foot."""
    def b(name):
        mat, nt, out = _fresh(name)
        oc = coords(nt)
        sep = N(nt, 'ShaderNodeSeparateXYZ', {0: oc})
        z = sep.outputs[2]
        g = N(nt, 'ShaderNodeAttribute', attribute_name='gauge').outputs['Fac']       # + toward the gauge side
        top = mrange(nt, z, -0.0055, -0.0015)
        band = mrange(nt, math_(nt, 'ABSOLUTE', math_(nt, 'SUBTRACT', g, 0.004)), 0.016, 0.027, 1.0, 0.0)
        # streaky longitudinal polish variation
        sv = N(nt, 'ShaderNodeMapping', {'Vector': oc, 'Scale': (0.6, 260.0, 260.0)}).outputs[0]
        streak = N(nt, 'ShaderNodeTexNoise', {'Vector': sv, 'Scale': 1.0, 'Detail': 8.0, 'Roughness': 0.7}).outputs['Fac']
        blot = N(nt, 'ShaderNodeTexNoise', {'Vector': oc, 'Scale': 3.0, 'Detail': 4.0}).outputs['Fac']
        gauge_corner = math_(nt, 'MULTIPLY', mrange(nt, g, 0.022, 0.034), mrange(nt, z, -0.018, -0.008))
        polish = math_(nt, 'MAXIMUM', math_(nt, 'MULTIPLY', top, band), math_(nt, 'MULTIPLY', gauge_corner, 0.7))
        head = mrange(nt, z, -0.05, -0.035)                                      # whole head (edge oxide)
        r = tex(nt, 'rust_coarse_01', oc, 5.0)
        rust_c = mixc(nt, 0.55, r['diff'], col('#3A2016'), 'MULTIPLY')
        rust_c = mixc(nt, mrange(nt, blot, 0.35, 0.75), rust_c, mixc(nt, 1.0, rust_c, (0.55, 0.45, 0.40, 1), 'MULTIPLY'))
        oxide = col('#2E2B29')
        steel = mixc(nt, streak, col('#B9BCC0'), col('#D3D5D8'))
        c1 = mixc(nt, math_(nt, 'MULTIPLY', head, 0.75), rust_c, oxide)
        c2 = mixc(nt, polish, c1, steel)
        rough_rust = math_(nt, 'MULTIPLY_ADD', r['rough'], 0.3, 0.62)
        r1 = mixf(nt, math_(nt, 'MULTIPLY', head, 0.75), rough_rust, 0.42)
        r_pol = math_(nt, 'MULTIPLY_ADD', streak, 0.16, 0.05)
        r2 = mixf(nt, polish, r1, r_pol)
        m1 = mixf(nt, math_(nt, 'MULTIPLY', head, 0.75), 0.0, 0.75)
        m2 = mixf(nt, polish, m1, 1.0)
        nb = bump(nt, r['disp'], 0.0015, mixf(nt, polish, 1.0, 0.05))
        bs = bsdf(nt, c2, r2, m2, nb, Anisotropic=mixf(nt, polish, 0.0, 0.55))
        L(nt, N(nt, 'ShaderNodeCombineXYZ', {0: 1.0, 1: 0.0, 2: 0.0}).outputs[0], bs.inputs['Tangent'])
        # wet in the underpass
        foot = mrange(nt, z, -0.135, -0.12, 1.0, 0.0)
        sh = snow_dust(nt, bs.outputs[0], 0.9, 25.0, (0.80, 0.93), extra_mask=foot)
        L(nt, sh, out.inputs[0])
        return mat
    return _mat(name, b)


def mat_fishplate(name='trk_fishplate'):
    def b(name):
        mat, nt, out = _fresh(name)
        oc = coords(nt)
        off, rnd = inst_offset(nt)
        t = tex(nt, 'rusty_metal_04', oc, 4.0, offset=off)
        c = mixc(nt, 0.65, t['diff'], col('#2A1A12'), 'MULTIPLY')
        c = N(nt, 'ShaderNodeHueSaturation', {'Color': c, 'Saturation': 0.75, 'Value': 0.9}).outputs[0]
        rough = math_(nt, 'MULTIPLY_ADD', t['rough'], 0.4, 0.45)
        nb = bump(nt, t['disp'], 0.002, 0.8)
        bs = bsdf(nt, c, rough, 0.25, nb)
        L(nt, snow_dust(nt, bs.outputs[0], 0.55, 7.0, (0.75, 0.95)), out.inputs[0])
        return mat
    return _mat(name, b)


def mat_bolt(name='trk_bolt'):
    def b(name):
        mat, nt, out = _fresh(name)
        oc = coords(nt)
        off, rnd = inst_offset(nt)
        t = tex(nt, 'rusty_metal_04', oc, 14.0, offset=off)
        c = mixc(nt, 0.7, t['diff'], col('#231A15'), 'MULTIPLY')
        # oily dark steel with rust bloom
        no = N(nt, 'ShaderNodeTexNoise', {'Vector': oc, 'Scale': 90.0, 'Detail': 4.0}).outputs['Fac']
        c = mixc(nt, mrange(nt, no, 0.45, 0.6), col('#1E1D1C'), c)
        rough = mixf(nt, mrange(nt, no, 0.45, 0.6), 0.32, 0.7)
        bs = bsdf(nt, c, rough, mixf(nt, mrange(nt, no, 0.45, 0.6), 0.8, 0.2), bump(nt, t['disp'], 0.001))
        L(nt, snow_dust(nt, bs.outputs[0], 0.7, 60.0, (0.7, 0.9)), out.inputs[0])
        return mat
    return _mat(name, b)


def mat_sleeper(name='trk_sleeper'):
    def b(name):
        mat, nt, out = _fresh(name)
        oc = coords(nt)
        off, rnd = inst_offset(nt)
        t = tex(nt, 'concrete_wall_008', oc, 1.6, offset=off)
        c = N(nt, 'ShaderNodeHueSaturation', {'Color': t['diff'], 'Saturation': 0.45, 'Value': 1.05}).outputs[0]
        z = N(nt, 'ShaderNodeSeparateXYZ', {0: oc}).outputs[2]
        grime = mrange(nt, z, -0.33, -0.22, 1.0, 0.0)
        dirt = N(nt, 'ShaderNodeTexNoise', {'Vector': N(nt, 'ShaderNodeVectorMath', {0: oc, 1: off}, operation='ADD').outputs[0],
                                             'Scale': 6.0, 'Detail': 6.0, 'Roughness': 0.65}).outputs['Fac']
        dm = math_(nt, 'MAXIMUM', grime, mrange(nt, dirt, 0.5, 0.75))
        c = mixc(nt, math_(nt, 'MULTIPLY', dm, 0.6), c, mixc(nt, 1.0, c, col('#5A5048'), 'MULTIPLY'))
        # rail-seat rust stains around the fastenings
        ay = math_(nt, 'ABSOLUTE', N(nt, 'ShaderNodeSeparateXYZ', {0: oc}).outputs[1])
        seat = mrange(nt, math_(nt, 'ABSOLUTE', math_(nt, 'SUBTRACT', ay, RAIL_Y)), 0.08, 0.26, 1.0, 0.0)
        c = mixc(nt, math_(nt, 'MULTIPLY', seat, mrange(nt, dirt, 0.35, 0.7, 0.15, 0.6)), c, col('#5B3A26'))
        wet = zone(nt)
        c = mixc(nt, math_(nt, 'MULTIPLY', wet, 0.45), c, mixc(nt, 1.0, c, (0.45, 0.45, 0.45, 1), 'MULTIPLY'))
        rough = mixf(nt, wet, math_(nt, 'MULTIPLY_ADD', t['rough'], 0.3, 0.6), 0.3)
        bs = bsdf(nt, c, rough, 0.0, bump(nt, t['disp'], 0.004, 1.0))
        L(nt, snow_dust(nt, bs.outputs[0], 0.75, 14.0, (0.6, 0.9)), out.inputs[0])
        return mat
    return _mat(name, b)


def mat_plain(name, color, rough=0.5, metal=0.0, dust=0.6, dust_scale=40.0):
    def b(name):
        mat, nt, out = _fresh(name)
        oc = coords(nt)
        no = N(nt, 'ShaderNodeTexNoise', {'Vector': oc, 'Scale': 60.0, 'Detail': 5.0}).outputs['Fac']
        c = mixc(nt, mrange(nt, no, 0.3, 0.7, 0.0, 0.35), col(color), col('#5A4A3C'))
        bs = bsdf(nt, c, mixf(nt, no, rough * 0.85, min(1.0, rough * 1.25)), metal, bump(nt, no, 0.0008))
        sh = snow_dust(nt, bs.outputs[0], dust, dust_scale, (0.6, 0.88)) if dust > 0 else bs.outputs[0]
        L(nt, sh, out.inputs[0])
        return mat
    return _mat(name, b)


def mat_clip(name='trk_clip'):
    def b(name):
        mat, nt, out = _fresh(name)
        oc = coords(nt)
        off, rnd = inst_offset(nt)
        v = N(nt, 'ShaderNodeVectorMath', {0: oc, 1: off}, operation='ADD').outputs[0]
        no = N(nt, 'ShaderNodeTexNoise', {'Vector': v, 'Scale': 70.0, 'Detail': 6.0, 'Roughness': 0.6}).outputs['Fac']
        rust = mrange(nt, no, 0.48, 0.62)
        c = mixc(nt, rust, col('#22201F'), col('#6A3A22'))
        bs = bsdf(nt, c, mixf(nt, rust, 0.38, 0.8), mixf(nt, rust, 0.75, 0.1), bump(nt, no, 0.0006))
        L(nt, snow_dust(nt, bs.outputs[0], 0.75, 80.0, (0.6, 0.85)), out.inputs[0])
        return mat
    return _mat(name, b)


def mat_stone(name='trk_stone'):
    """Crushed granite/basalt ballast: per-instance tone, rock-surface micro detail, powder on top, wet in zone."""
    def b(name):
        mat, nt, out = _fresh(name)
        oc = coords(nt)
        off, rnd = inst_offset(nt, 13.0)
        t = tex(nt, 'rock_surface', oc, 7.0, offset=off)
        bw = N(nt, 'ShaderNodeRGBToBW', {0: t['diff']}).outputs[0]
        ramp = N(nt, 'ShaderNodeValToRGB', {0: rnd})
        cr = ramp.color_ramp
        cr.elements[0].color = srgb('#5F6063'); cr.elements[1].color = srgb('#A7A6A3')
        e = cr.elements.new(0.35); e.color = srgb('#7E7D7B')
        e = cr.elements.new(0.7); e.color = srgb('#77706A')
        e = cr.elements.new(0.9); e.color = srgb('#505256')
        tone = ramp.outputs[0]
        bw2 = math_(nt, 'MULTIPLY', bw, 3.0)
        c = mixc(nt, 1.0, tone, N(nt, 'ShaderNodeCombineColor', {0: bw2, 1: bw2, 2: bw2}).outputs[0], 'MULTIPLY')
        # crevice grime from object-space distance to centre (stones are ~unit sized instances)
        wet = zone(nt)
        c = mixc(nt, math_(nt, 'MULTIPLY', wet, 0.5), c, mixc(nt, 1.0, c, (0.70, 0.71, 0.73, 1), 'MULTIPLY'))
        rough = mixf(nt, wet, math_(nt, 'MULTIPLY_ADD', t['rough'], 0.25, 0.62), 0.55)
        bs = bsdf(nt, c, rough, 0.0, bump(nt, t['disp'], 0.004, 1.0))
        L(nt, snow_dust(nt, bs.outputs[0], 0.62, 30.0, (0.45, 0.8)), out.inputs[0])
        return mat
    return _mat(name, b)


def mat_ballast_base(name='trk_ballast_base'):
    def b(name):
        mat, nt, out = _fresh(name)
        oc = coords(nt)
        t = tex(nt, 'gray_rocks', oc, 1.8)
        c = N(nt, 'ShaderNodeHueSaturation', {'Color': t['diff'], 'Saturation': 0.35, 'Value': 0.8}).outputs[0]
        wet = zone(nt)
        c = mixc(nt, math_(nt, 'MULTIPLY', wet, 0.5), c, mixc(nt, 1.0, c, (0.4, 0.4, 0.4, 1), 'MULTIPLY'))
        bs = bsdf(nt, c, mixf(nt, wet, math_(nt, 'MULTIPLY_ADD', t['rough'], 0.2, 0.7), 0.2), 0.0, bump(nt, t['disp'], 0.03, 1.0))
        L(nt, snow_dust(nt, bs.outputs[0], 0.75, 9.0, (0.5, 0.85)), out.inputs[0])
        return mat
    return _mat(name, b)


def mat_snow(name='trk_snow', scale=1.0, sparkle=1.0, sss=0.18, zone_cut=True, haze_amt=1.0, drift=0.0):
    """Moonlit snow: snow_02 micro relief, SSS, real specular glints (random-normal facets), haze, zone cut."""
    def b(name):
        mat, nt, out = _fresh(name)
        geo = N(nt, 'ShaderNodeNewGeometry')
        pos = geo.outputs['Position']
        t = tex(nt, 'snow_02', pos, 0.55 * scale)
        bw = N(nt, 'ShaderNodeRGBToBW', {0: t['diff']}).outputs[0]
        c = mixc(nt, mrange(nt, bw, 0.4, 0.9, 0.0, 1.0), (0.70, 0.76, 0.84, 1), (0.86, 0.90, 0.96, 1))
        n1 = N(nt, 'ShaderNodeTexNoise', {'Vector': pos, 'Scale': 2.2 * scale, 'Detail': 5.0, 'Roughness': 0.55}).outputs['Fac']
        n2 = N(nt, 'ShaderNodeTexNoise', {'Vector': pos, 'Scale': 60.0 * scale, 'Detail': 3.0}).outputs['Fac']
        h = math_(nt, 'MULTIPLY_ADD', t['disp'], 0.6, math_(nt, 'MULTIPLY_ADD', n2, 0.08, math_(nt, 'MULTIPLY', n1, 0.5)))
        if drift > 0:
            dv = N(nt, 'ShaderNodeMapping', {'Vector': pos, 'Scale': (0.35, 1.0, 1.0), 'Rotation': (0, 0, 0.5)}).outputs[0]
            rip = N(nt, 'ShaderNodeTexWave', {'Vector': dv, 'Scale': 0.9, 'Distortion': 6.0, 'Detail': 3.0}, wave_type='BANDS').outputs['Fac']
            h = math_(nt, 'MULTIPLY_ADD', rip, drift, h)
        nb = bump(nt, h, 0.012, 0.9)
        s = snow_bsdf(nt, nb, c, mixf(nt, t['rough'], 0.5, 0.75), sss)
        sh = s.outputs[0]
        if sparkle > 0:
            vor = N(nt, 'ShaderNodeTexVoronoi', {'Vector': pos, 'Scale': 220.0 * scale, 'Randomness': 1.0})
            rc = vor.outputs['Color']
            r1 = N(nt, 'ShaderNodeSeparateColor', {0: rc}).outputs[0]
            m = math_(nt, 'MULTIPLY', mrange(nt, r1, 1 - 0.12 * sparkle, 1 - 0.12 * sparkle + 0.005),
                      mrange(nt, vor.outputs['Distance'], 0.34, 0.24))
            jit = N(nt, 'ShaderNodeVectorMath', {0: rc, 1: (0.5, 0.5, 0.5)}, operation='SUBTRACT').outputs[0]
            jit = N(nt, 'ShaderNodeVectorMath', {0: jit, 3: 1.2}, operation='SCALE').outputs[0]
            nn = N(nt, 'ShaderNodeVectorMath', {0: N(nt, 'ShaderNodeVectorMath', {0: geo.outputs['Normal'], 1: jit}, operation='ADD').outputs[0]},
                   operation='NORMALIZE').outputs[0]
            gl = N(nt, 'ShaderNodeBsdfGlossy', {'Color': (1, 1, 1, 1), 'Roughness': 0.10, 'Normal': nn})
            gl.distribution = 'GGX'
            sh = mixs(nt, math_(nt, 'MULTIPLY', m, 0.85), sh, gl.outputs[0])
        if zone_cut:
            sh = mixs(nt, zone(nt), sh, N(nt, 'ShaderNodeBsdfTransparent').outputs[0])
        if haze_amt > 0:
            sh = haze(nt, sh, haze_amt)
        L(nt, sh, out.inputs[0])
        return mat
    return _mat(name, b)


# ============================================================================= rail / joint geometry
def rail_profile():
    """CHN60 half profile → full closed (lateral, z) polygon. Lateral 0 = rail centre line; z 0 = head top."""
    pts = [(0.0, 0.0), (0.020, -0.0007), (0.0365, -0.0105), (0.0362, -0.0415), (0.00825, -0.0513),
           (0.00825, -0.1475), (0.0750, -0.1645), (0.0750, -0.176), (0.0, -0.176)]
    rad = [0, 0.035, 0.010, 0.003, 0.015, 0.017, 0.004, 0.003, 0]
    half = _round_path(pts, rad, seg=4)
    other = half[::-1].copy(); other[:, 0] *= -1
    full = np.concatenate([half[:-1], other[:-1]])
    return _ccw(full)


def fishplate_profile():
    """Joint-bar section on the +u side of the web (u, z)."""
    pts = [(0.0185, -0.0490), (0.0345, -0.0436), (0.0395, -0.0480), (0.0430, -0.0640), (0.0430, -0.1290),
           (0.0560, -0.1530), (0.0565, -0.1588), (0.0240, -0.1508), (0.0135, -0.1400), (0.0135, -0.0680)]
    rad = [0.002, 0.003, 0.004, 0.008, 0.008, 0.003, 0.002, 0.004, 0.006, 0.006]
    return _ccw(_round_path(pts, rad, seg=2, closed=True))


def _rail_mesh(mb, side, segs, prof):
    """side: −1 → right rail (y = −RAIL_Y), +1 → left rail. segs: list of (xa, xb)."""
    yc = side * RAIL_Y
    for xa, xb in segs:
        V, F = extrude_x(prof, xa, xb, 0.0022)
        g = -side * V[:, 1]               # positive toward the track centre (gauge side)
        V[:, 1] += yc
        mb.add(V, F, 0, {'gauge': g})


def _joint_mesh(lod='hero'):
    """Both joint bars + (hero) six bolts for one rail joint at x = 0, rail centred at y = 0."""
    mb = MB()
    fp = fishplate_profile()
    for s in (1, -1):
        p = fp.copy(); p[:, 0] *= s
        V, F = extrude_x(_ccw(p), -FISH_HALF, FISH_HALF, 0.004)
        mb.add(V, F, 0)
    if lod == 'hero':
        dome = [(0.0, 0.0), (0.019, 0.0), (0.0195, 0.003), (0.018, 0.008), (0.014, 0.0125), (0.008, 0.0150), (0.0, 0.0158)]
        washer = [(0.0125, 0.0), (0.023, 0.0), (0.0235, 0.0012), (0.0235, 0.0038), (0.023, 0.005), (0.0125, 0.005)]
        hexnut = [(0.0, 0.0), (0.0175, 0.0), (0.0208, 0.0025), (0.0208, 0.0195), (0.0175, 0.022), (0.0, 0.022)]
        stub = [(0.0, 0.0), (0.0115, 0.0), (0.0115, 0.013), (0.010, 0.016), (0.0, 0.016)]
        rng = np.random.default_rng(3)
        for k, bx in enumerate([-0.35, -0.21, -0.07, 0.07, 0.21, 0.35]):
            s = 1 if k % 2 == 0 else -1          # alternate head / nut sides
            # domed head on side s, nut on −s
            V, F = lathe_np(dome, 20, 'y')         # along +y
            V[:, 1] *= s
            if s < 0:
                F = [f[::-1] for f in F]
            V[:, 1] += s * 0.0430
            V = _xf(V, t=(bx, 0, BOLT_Z))
            mb.add(V, F, 1)
            # washer + hex nut + thread stub on −s
            base = 0.0430
            for prof, segn, mi, h in ((washer, 24, 1, 0.005), (hexnut, 6, 1, 0.022), (stub, 12, 1, 0.016)):
                V, F = lathe_np(prof, segn, 'y')
                V[:, 1] = V[:, 1] * (-s) + (-s) * base
                if -s < 0:
                    F = [f[::-1] for f in F]
                rot = rng.uniform(0, math.pi / 3) if segn == 6 else 0
                if rot:
                    c, si = math.cos(rot), math.sin(rot)
                    xz = V[:, [0, 2]] @ np.array([[c, si], [-si, c]])
                    V[:, 0], V[:, 2] = xz[:, 0], xz[:, 1]
                V = _xf(V, t=(bx, 0, BOLT_Z))
                mb.add(V, F, mi)
                base += h
    return mb


def _clip_path():
    """Type-II ω elastic clip centre line (x along rail, u away from rail centre, z)."""
    half = [(0.000, 0.104, -0.1300), (-0.010, 0.124, -0.1325), (-0.014, 0.148, -0.1360), (-0.030, 0.162, -0.1385),
            (-0.050, 0.151, -0.1405), (-0.058, 0.122, -0.1450), (-0.052, 0.094, -0.1505), (-0.043, 0.073, -0.1545)]
    full = [(-x, u, z) for (x, u, z) in half[::-1]][:-1] + half
    full = full[::-1]
    pts = np.array(full)
    return catmull(pts, 5)


def _fastening(mb, yr, side_sign, lod='hero'):
    """Rail-seat fastening set around rail centre y = yr (pad, insulators, ω-clips, washers, nuts, bolts)."""
    # pad (black rubber), 10 mm under the foot
    V, F = box_np(0.19, 0.162, 0.010, (0, yr, -0.181), r=0.002, seg=1)
    mb.add(V, F, 3)
    for s in (-1, 1):
        u_sign = s
        # insulating block (挡板座) against the foot edge
        V, F = box_np(0.11, 0.032, 0.034, (0, yr + u_sign * 0.093, SLEEPER_TOP + 0.017), r=0.004, seg=2)
        mb.add(V, F, 4)
        # gauge apron plate on the block
        V, F = box_np(0.095, 0.050, 0.006, (0, yr + u_sign * 0.112, SLEEPER_TOP + 0.037), r=0.002, seg=1)
        mb.add(V, F, 1)
        if lod != 'hero':
            continue
        cp = _clip_path()
        cp[:, 1] = yr + u_sign * cp[:, 1]
        V, F = tube_np(cp, 0.0065, 8)
        if u_sign < 0:
            F = [f[::-1] for f in F]
        mb.add(V, F, 2)
        # T-bolt, washer, nut
        bx, by = 0.0, yr + u_sign * 0.125
        V, F = lathe_np([(0.0, 0.0), (0.0110, 0.0), (0.0110, 0.076), (0.0095, 0.079), (0.0, 0.079)], 12)
        mb.add(_xf(V, t=(bx, by, SLEEPER_TOP)), F, 2)
        V, F = lathe_np([(0.0115, 0.0), (0.0235, 0.0), (0.0235, 0.004), (0.0115, 0.004)], 24)
        mb.add(_xf(V, t=(bx, by, -0.1236)), F, 2)
        V, F = lathe_np([(0.0, 0.0), (0.0160, 0.0), (0.0187, 0.0022), (0.0187, 0.0172), (0.0160, 0.0195), (0.0, 0.0195)], 6)
        mb.add(_xf(V, rot_z=0.3 * s + 0.1 * side_sign, t=(bx, by, -0.1196)), F, 2)


def _sleeper_section(wb, wt, zt, zb=SLEEPER_BOT):
    pts = [(-wb / 2, zb), (wb / 2, zb), (wt / 2, zt), (-wt / 2, zt)]
    return _round_path(pts, [0.008, 0.008, 0.014, 0.014], seg=2, closed=True)


def _sleeper_mesh(mb, lod='hero'):
    """Type-III prestressed concrete sleeper, 2.6 m, rail seats at ±RAIL_Y (local origin = sleeper centre)."""
    secs = [(-1.30, 0.29, 0.19, -0.192), (-1.27, 0.30, 0.20, -0.188), (-0.98, 0.30, 0.20, SLEEPER_TOP),
            (-0.52, 0.30, 0.20, SLEEPER_TOP), (-0.40, 0.285, 0.19, -0.212), (-0.18, 0.27, 0.18, -0.228),
            (0.0, 0.265, 0.178, -0.230)]
    secs = secs + [(-y, a, b, c) for (y, a, b, c) in secs[::-1][1:]]
    rings = [_sleeper_section(wb, wt, zt) for (_, wb, wt, zt) in secs]
    P = len(rings[0])
    V = np.concatenate([np.column_stack([r[:, 0], np.full(P, y), r[:, 1]]) for (y, *_), r in zip(secs, rings)])
    F = []
    i = np.arange(P); j = (i + 1) % P
    for k in range(len(secs) - 1):
        a, b = k * P, (k + 1) * P
        F.extend(np.stack([a + i, b + i, b + j, a + j], 1))
    F.append(np.arange(P))
    F.append((len(secs) - 1) * P + np.arange(P)[::-1])
    # orientation check: section polygon is CCW in (x, z); lofting along +y
    mb.add(V, F, 0)
    for s in (-1, 1):
        _fastening(mb, s * RAIL_Y, s, lod)


def _sleeper_snow(mb, seed, amount=1.0):
    """Thin powder cap on the sleeper top (local), with breaks at the rail seats."""
    rng = np.random.default_rng(seed)
    ys = np.linspace(-1.285, 1.285, 140)
    xs = np.linspace(-0.098, 0.098, 9)
    Y, X = np.meshgrid(ys, xs, indexing='ij')
    # sleeper top height along y (match sections)
    yk = np.array([-1.30, -1.27, -0.98, -0.52, -0.40, -0.18, 0.0, 0.18, 0.40, 0.52, 0.98, 1.27, 1.30])
    zk = np.array([-0.192, -0.188, SLEEPER_TOP, SLEEPER_TOP, -0.212, -0.228, -0.230, -0.228, -0.212, SLEEPER_TOP, SLEEPER_TOP, -0.188, -0.192])
    wk = np.array([0.19, 0.20, 0.20, 0.20, 0.19, 0.18, 0.178, 0.18, 0.19, 0.20, 0.20, 0.20, 0.19])
    zt = np.interp(Y, yk, zk)
    w = np.interp(Y, yk, wk) / 2 - 0.004
    Xs = X / 0.098 * w
    o = rng.uniform(0, 100)
    n = fbm(Y * 6 + o, Xs * 6, 4, seed) * 0.5 + 0.5
    n2 = fbm(Y * 30 + o, Xs * 30, 3, seed + 7) * 0.5 + 0.5
    edge = _smooth((w - np.abs(Xs)) / 0.035)
    seat = np.minimum(_smooth((np.abs(np.abs(Y) - RAIL_Y) - 0.13) / 0.06), 1.0)
    th = (0.0015 + 0.009 * n ** 1.6 + 0.004 * n2) * amount * edge * (0.25 + 0.75 * seat)
    th = th - 0.002 * (1 - seat) - 0.0025 * (n2 < 0.38)
    Z = zt + th
    V = np.column_stack([Xs.ravel(), Y.ravel(), Z.ravel()])
    F = _grid_faces(len(ys), len(xs))
    keep = (th.ravel()[F].max(1) > 0.0012)
    mb.add(V, F[keep][:, ::-1], 5)


# ============================================================================= instancing
def _inst_group():
    ng = bpy.data.node_groups.get('trk_inst')
    if ng:
        return ng
    ng = bpy.data.node_groups.new('trk_inst', 'GeometryNodeTree')
    ng.interface.new_socket('Geometry', in_out='INPUT', socket_type='NodeSocketGeometry')
    ng.interface.new_socket('Collection', in_out='INPUT', socket_type='NodeSocketCollection')
    ng.interface.new_socket('Geometry', in_out='OUTPUT', socket_type='NodeSocketGeometry')
    nt = ng
    gi = nt.nodes.new('NodeGroupInput'); go = nt.nodes.new('NodeGroupOutput')
    ci = N(nt, 'GeometryNodeCollectionInfo', {'Separate Children': True, 'Reset Children': True})
    ci.transform_space = 'ORIGINAL'
    L(nt, gi.outputs['Collection'], ci.inputs['Collection'])
    rot = N(nt, 'GeometryNodeInputNamedAttribute', {'Name': 'rot'}, data_type='FLOAT_VECTOR')
    scl = N(nt, 'GeometryNodeInputNamedAttribute', {'Name': 'scl'}, data_type='FLOAT_VECTOR')
    var = N(nt, 'GeometryNodeInputNamedAttribute', {'Name': 'var'}, data_type='INT')
    e2r = N(nt, 'FunctionNodeEulerToRotation', {0: rot.outputs['Attribute']})
    io = N(nt, 'GeometryNodeInstanceOnPoints', {'Points': gi.outputs['Geometry'], 'Instance': ci.outputs[0],
                                                'Pick Instance': True, 'Instance Index': var.outputs['Attribute'],
                                                'Rotation': e2r.outputs[0], 'Scale': scl.outputs['Attribute']})
    L(nt, io.outputs[0], go.inputs[0])
    return ng


def instancer(name, coll, src_coll, pts, rot=None, scl=None, var=None):
    """Points object that instances the children of src_coll (picked by 'var') at pts with rot/scl."""
    pts = np.asarray(pts, np.float32).reshape(-1, 3)
    n = len(pts)
    me = bpy.data.meshes.new(name)
    me.vertices.add(n); me.vertices.foreach_set('co', pts.ravel())
    for k, arr, typ in (('rot', rot, 'FLOAT_VECTOR'), ('scl', scl, 'FLOAT_VECTOR'), ('var', var, 'INT')):
        if arr is None:
            arr = np.zeros((n, 3)) if k == 'rot' else (np.ones((n, 3)) if k == 'scl' else np.zeros(n, int))
        a = me.attributes.new(k, typ, 'POINT')
        if typ == 'INT':
            a.data.foreach_set('value', np.asarray(arr, np.int32).ravel())
        else:
            arr = np.asarray(arr, np.float32)
            if arr.ndim == 1:
                arr = np.repeat(arr[:, None], 3, 1)
            a.data.foreach_set('vector', arr.ravel())
    me.update()
    o = bpy.data.objects.new(name, me)
    coll.objects.link(o)
    m = o.modifiers.new('inst', 'NODES'); m.node_group = _inst_group()
    sock = next(s for s in m.node_group.interface.items_tree if s.name == 'Collection' and s.in_out == 'INPUT')
    m[sock.identifier] = src_coll
    return o


# ============================================================================= stones
def _stone_variants(n=10, seed=11):
    """Crushed-rock meshes: icosphere, ellipsoid stretch, flattened by random planes (angular facets)."""
    c = bpy.data.collections.get('trk_stones_src')
    if c and len(c.objects) >= n:
        return c
    c = _subtemplates('trk_stones_src')
    import bmesh
    rng = np.random.default_rng(seed)
    m = mat_stone()
    for k in range(n):
        bm = bmesh.new()
        bmesh.ops.create_icosphere(bm, subdivisions=3, radius=0.5)
        V = np.array([v.co[:] for v in bm.verts])
        V *= rng.uniform([0.75, 0.6, 0.45], [1.0, 0.9, 0.75])
        for _ in range(rng.integers(7, 11)):
            nrm = rng.normal(size=3); nrm /= np.linalg.norm(nrm)
            d = rng.uniform(0.22, 0.36)
            proj = V @ nrm
            over = proj > d
            V[over] -= np.outer(proj[over] - d, nrm)
        V += rng.normal(0, 0.006, V.shape)
        for v, p in zip(bm.verts, V):
            v.co = p
        me = bpy.data.meshes.new(f'trk_stone_{k}')
        bm.to_mesh(me); bm.free()
        me.polygons.foreach_set('use_smooth', np.ones(len(me.polygons), bool))
        me.set_sharp_from_angle(angle=math.radians(38))
        me.materials.append(m)
        o = bpy.data.objects.new(f'trk_stone_{k}', me)
        c.objects.link(o)
    return c


# ============================================================================= cross-section functions
def ballast_z(r):
    """Ballast surface height at lateral distance r = |y|."""
    r = np.abs(np.asarray(r, float))
    s = _smooth((r - 1.12) / 0.30)
    z = CRIB_Z + (SHOULDER_Z - CRIB_Z) * s
    slope = SHOULDER_Z - (r - 1.75) / 1.75
    z = np.where(r > 1.75, slope, z)
    return np.maximum(z, SUBGRADE_Z)


_BANK = np.array([(1.10, -0.272), (1.35, -0.245), (1.62, -0.215), (1.95, -0.200), (2.20, -0.240), (2.50, -0.39),
                  (2.85, -0.555), (3.20, -0.610), (3.60, -0.680), (4.10, -0.820), (4.70, -0.900), (5.40, -0.950),
                  (6.20, -1.040), (7.00, -0.965), (8.50, -0.90), (12.0, -0.88), (20.0, -0.90)])


def bank_z(r):
    """Snow surface of the shoulder bank / embankment / near field at lateral distance r (shared by track + field)."""
    r = np.abs(np.asarray(r, float))
    k = _BANK
    # Catmull-Rom through control points in r
    i = np.clip(np.searchsorted(k[:, 0], r) - 1, 0, len(k) - 2)
    r0, r1 = k[i, 0], k[i + 1, 0]
    t = np.clip((r - r0) / (r1 - r0), 0, 1)
    z0, z1 = k[i, 1], k[i + 1, 1]
    zm = k[np.maximum(i - 1, 0), 1]; zp = k[np.minimum(i + 2, len(k) - 1), 1]
    rm = k[np.maximum(i - 1, 0), 0]; rp = k[np.minimum(i + 2, len(k) - 1), 0]
    m0 = (z1 - zm) / np.maximum(r1 - rm, 1e-6) * (r1 - r0)
    m1 = (zp - z0) / np.maximum(rp - r0, 1e-6) * (r1 - r0)
    t2, t3 = t * t, t * t * t
    z = (2 * t3 - 3 * t2 + 1) * z0 + (t3 - 2 * t2 + t) * m0 + (-2 * t3 + 3 * t2) * z1 + (t3 - t2) * m1
    z = np.where(r < k[0, 0], k[0, 1] - (k[0, 0] - r) * 0.5, z)
    z = np.where(r > k[-1, 0], k[-1, 1], z)
    return z


def _zones():
    sc = bpy.context.scene
    return [tuple(z) for z in sc.get(_ZONE_KEY, [])]


def _in_zone(x, soft=1.5):
    """1 inside a registered underpass zone (with soft ends), 0 outside."""
    x = np.asarray(x, float)
    m = np.zeros_like(x)
    for z in _zones():
        xa, xb = z[0], z[1]
        m = np.maximum(m, _smooth((x - xa + 0.3) / soft) * _smooth((xb + 0.3 - x) / soft))
    return m


def _snow_surface(x, y, seed, amount=1.0):
    """Track snow height (powder in four-foot/cribs, banks on shoulders). Returns (z_snow, thickness)."""
    r = np.abs(y)
    zb = ballast_z(r)
    o = seed * 13.7
    n1 = fbm(x * 1.3 + o, y * 1.3, 4, seed)
    n2 = fbm(x * 7.0 + o, y * 7.0, 3, seed + 5)
    n3 = fbm(x * 0.12 + o, y * 0.4, 2, seed + 9)
    t = (0.003 + 0.016 * n1 + 0.008 * n2 + 0.008 * n3) * amount - 0.004 * (1 - amount)
    # less powder right under/against the rails (sheltered by the head), more in the middle of the four-foot
    near_rail = np.exp(-((r - RAIL_Y) / 0.10) ** 2)
    mid = np.exp(-(r / 0.35) ** 2)
    t = t - 0.006 * near_rail + 0.004 * mid
    zp = zb + t
    zbank = bank_z(r) + (0.035 * fbm(x * 0.35 + o, r * 0.6, 3, seed + 3) + 0.012 * n2) * amount
    zbank = zbank - (1 - amount) * 0.12
    z = np.where(r > 1.1, np.maximum(zp, zbank), zp)
    z = z - 0.14 * _smooth((r - 2.62) / 0.28)          # dive under the field surface at the outer edge
    zf = _in_zone(x)
    z = z - zf * 0.25
    return z, z - zb


# ============================================================================= build_track
def build_track(x0, x1, coll=None, lod='hero', seed=0, snow=1.0):
    """Build track from x0 to x1. See module docstring. Returns dict(rails, joints, sleepers, ...)."""
    t0 = time.time()
    coll = _coll(coll, 'track')
    tag = f'{lod}_{int(x0)}_{int(x1)}'
    rng = np.random.default_rng(seed + 101)
    joints = [JOINT_EVERY * k for k in range(math.ceil(x0 / JOINT_EVERY), math.floor(x1 / JOINT_EVERY) + 1)]
    # ---- rails (one object per side, all segments)
    cuts = [x0] + [j for j in joints if x0 < j < x1] + [x1]
    segs = []
    for a, b in zip(cuts[:-1], cuts[1:]):
        xa = a + (JOINT_GAP / 2 if a in joints else 0.0)
        xb = b - (JOINT_GAP / 2 if b in joints else 0.0)
        segs.append((xa, xb))
    prof = rail_profile()
    rails = []
    for side in (-1, 1):
        mb = MB()
        _rail_mesh(mb, side, segs, prof)
        o = mb.obj(f'trk_rail_{"R" if side < 0 else "L"}_{tag}', coll, [mat_rail()], True, 32)
        rails.append(o)
    # ---- joints (linked duplicates of one assembly mesh)
    jme_name = f'trk_joint_{lod}'
    jme = bpy.data.meshes.get(jme_name)
    if jme is None:
        jme = _joint_mesh(lod).mesh(jme_name, True, 40)
        jme.materials.append(mat_fishplate()); jme.materials.append(mat_bolt())
    fish = []
    for j in joints:
        for side in (-1, 1):
            o = bpy.data.objects.new(f'trk_joint_{tag}', jme)
            o.location = (j, side * RAIL_Y, 0)
            o.rotation_euler = (0, 0, math.pi if side > 0 else 0)
            coll.objects.link(o)
            fish.append(o)
    # ---- sleepers (instanced variants with their own snow caps)
    src_name = f'trk_sleepers_{lod}'
    src = bpy.data.collections.get(src_name)
    nvar = 4 if lod == 'hero' else 2
    if src is None or len(src.objects) < nvar:
        src = _subtemplates(src_name)
        mats = [mat_sleeper(), mat_plain('trk_apron', '#3C3B3A', 0.5, 0.5, 0.7), mat_clip(),
                mat_plain('trk_pad', '#141414', 0.65, 0.0, 0.0), mat_plain('trk_nylon', '#2C2E30', 0.42, 0.0, 0.7),
                mat_snow('trk_snow_cap', 2.0, 0.6, 0.0, True, 0.0)]
        for k in range(nvar):
            mb = MB()
            _sleeper_mesh(mb, lod)
            if snow > 0:
                _sleeper_snow(mb, seed * 31 + k, snow)
            mb.obj(f'trk_sleeper_{lod}_{k}', src, mats, True, 40)
    xs = []
    k0 = math.floor(x0 / JOINT_EVERY); k1 = math.ceil(x1 / JOINT_EVERY)
    pitch = JOINT_EVERY / SLEEPERS_PER_RAIL
    for k in range(k0, k1):
        for i in range(SLEEPERS_PER_RAIL):
            x = JOINT_EVERY * k + (i + 0.5) * pitch
            if x0 + 0.15 <= x <= x1 - 0.15:
                xs.append(x)
    xs = np.array(xs)
    n = len(xs)
    pts = np.column_stack([xs + rng.normal(0, 0.006, n), rng.normal(0, 0.004, n), rng.normal(0, 0.002, n)])
    rot = np.column_stack([np.zeros(n), rng.normal(0, 0.002, n), rng.normal(0, 0.004, n)])
    var = rng.integers(0, nvar, n)
    sleepers = instancer(f'trk_sleepers_{tag}', coll, src, pts, rot, None, var)
    # ---- ballast base surface
    rmax = 2.95
    if lod == 'hero':
        yy = np.concatenate([np.linspace(-rmax, -1.9, 12), np.linspace(-1.85, 1.85, 38), np.linspace(1.9, rmax, 12)])
        nx = max(2, int((x1 - x0) / 0.25) + 1)
    else:
        yy = np.concatenate([np.linspace(-rmax, -1.9, 6), np.linspace(-1.75, 1.75, 8), np.linspace(1.9, rmax, 6)])
        nx = max(2, int((x1 - x0) / 1.0) + 1)
    xx = np.linspace(x0, x1, nx)
    X, Y = np.meshgrid(xx, yy, indexing='ij')
    Z = ballast_z(Y) - (0.012 if lod == 'hero' else 0.0) + 0.006 * fbm(X * 3, Y * 3, 3, seed + 2)
    mb = MB(); mb.add(np.column_stack([X.ravel(), Y.ravel(), Z.ravel()]), _grid_faces(nx, len(yy)), 0)
    ballast = mb.obj(f'trk_ballast_{tag}', coll, [mat_ballast_base()], True, 0)
    # ---- snow surface
    dx = 0.035 if lod == 'hero' else 0.30
    dy = 0.03 if lod == 'hero' else 0.12
    yy = np.concatenate([np.arange(-rmax, -1.6, dy * 1.6), np.arange(-1.6, 1.6, dy), np.arange(1.6, rmax + 1e-6, dy * 1.6)])
    nx = max(2, int((x1 - x0) / dx) + 1)
    xx = np.linspace(x0, x1, nx)
    X, Y = np.meshgrid(xx, yy, indexing='ij')
    Z, T = _snow_surface(X, Y, seed, snow)
    V = np.column_stack([X.ravel(), Y.ravel(), Z.ravel()])
    F = _grid_faces(nx, len(yy))
    keep = T.ravel()[F].max(1) > 0.001
    mb = MB(); mb.add(V, F[keep], 0)
    snow_o = mb.obj(f'trk_snow_{tag}', coll, [mat_snow('trk_snow', 1.0, 1.0, 0.18, True, 1.0, 0.2)], True, 0)
    # ---- snow on the rail foot (both sides of each rail), not under joint bars or clips
    foot = []
    if snow > 0:
        sx = np.arange(x0, x1, 0.02 if lod == 'hero' else 0.08)
        us = np.array([0.0105, 0.016, 0.026, 0.040, 0.055, 0.068, 0.0735])
        for side in (-1, 1):
            mb = MB()
            for us_sign in (-1, 1):
                X, U = np.meshgrid(sx, us, indexing='ij')
                zf = -0.1475 - (U - 0.00825) / 4 - 0.001
                zf = np.where(U < 0.0135, -0.1475 + (0.0135 - U) * 1.6, zf)    # creep into the web fillet
                nn = fbm(X * 9 + side * 7 + us_sign * 3, U * 40, 3, seed + 21) * 0.5 + 0.5
                nn2 = fbm(X * 45 + side, U * 90, 2, seed + 22) * 0.5 + 0.5
                th = (0.003 + 0.016 * nn ** 1.5 + 0.004 * nn2) * snow
                th *= np.clip((0.0745 - U) / 0.012, 0, 1) ** 0.6 * (1.0 + 0.6 * np.clip((0.03 - U) / 0.02, 0, 1))
                mask = np.ones_like(X)
                for j in joints:
                    mask *= np.clip((np.abs(X - j) - FISH_HALF - 0.005) / 0.01, 0, 1)
                d = np.abs(((X - pitch / 2) % pitch) - pitch / 2)    # distance to nearest sleeper centre
                mask *= np.clip((d - 0.09) / 0.02, 0, 1)
                mask *= (1 - _in_zone(X))
                th = th * mask
                th = np.where(nn < 0.30, th * np.clip((nn - 0.22) / 0.08, 0, 1), th)
                Yw = side * RAIL_Y - side * us_sign * U
                V = np.column_stack([X.ravel(), Yw.ravel(), (zf + th).ravel()])
                F = _grid_faces(len(sx), len(us))
                if side * us_sign > 0:          # keep normals pointing up
                    F = F[:, ::-1]
                keep = th.ravel()[F].max(1) > 0.0012
                mb.add(V, F[keep], 0)
            foot.append(mb.obj(f'trk_footsnow_{tag}', coll, [mat_snow('trk_snow_cap', 2.0, 0.6, 0.0, True, 0.0)], True, 0))
    # ---- crushed-stone ballast (hero only)
    stones = None
    if lod == 'hero':
        src = _stone_variants()
        nvar = len(src.objects)
        area = (x1 - x0) * 2 * 2.85
        dens = 720
        cnt = int(area * dens)
        P = np.column_stack([rng.uniform(x0, x1, cnt), rng.uniform(-2.85, 2.85, cnt)])
        size = 0.040 * rng.lognormal(0, 0.22, cnt)
        r = np.abs(P[:, 1])
        zb = ballast_z(r)
        d = np.abs(((P[:, 0] - pitch / 2) % pitch) - pitch / 2)
        # sleeper footprint (top 0.20 → bottom 0.30 wide; stones near its sides sit lower)
        keep = ~((r < 1.31) & (d < 0.115 + 0.25 * size))
        zs, _ = _snow_surface(P[:, 0], P[:, 1], seed, snow)
        sink = rng.uniform(-0.35, 0.10, cnt) * size
        zc = zb + sink + 0.004
        top = zc + 0.33 * size
        keep &= top > zs - 0.004
        keep &= r < 2.85
        P, size, zc = P[keep], size[keep], zc[keep]
        cnt = len(P)
        pts = np.column_stack([P, zc])
        rot = rng.uniform(0, 2 * math.pi, (cnt, 3)) * np.array([0.25, 0.25, 1.0])
        scl = size[:, None] * rng.uniform(0.85, 1.15, (cnt, 3))
        stones = instancer(f'trk_stones_{tag}', coll, src, pts, rot, scl, rng.integers(0, nvar, cnt))
    print(f'[track] build_track({x0},{x1},{lod}) {time.time() - t0:.1f}s', flush=True)
    return dict(rails=rails, joints=joints, sleepers=sleepers, fishplates=fish, stones=stones, ballast=ballast,
                snow=snow_o, foot_snow=foot, coll=coll)



# ============================================================================= field
def mat_concrete_pole(name='trk_pole'):
    def b(name):
        mat, nt, out = _fresh(name)
        oc = coords(nt)
        off, rnd = inst_offset(nt)
        t = tex(nt, 'concrete_wall_008', oc, 2.0, offset=off)
        c = N(nt, 'ShaderNodeHueSaturation', {'Color': t['diff'], 'Saturation': 0.4, 'Value': 0.95}).outputs[0]
        z = N(nt, 'ShaderNodeSeparateXYZ', {0: oc}).outputs[2]
        streak = N(nt, 'ShaderNodeTexNoise', {'Vector': N(nt, 'ShaderNodeMapping', {'Vector': oc, 'Scale': (40.0, 40.0, 1.5)}).outputs[0],
                                               'Scale': 1.0, 'Detail': 4.0}).outputs['Fac']
        g = math_(nt, 'MAXIMUM', mrange(nt, z, 1.2, 0.0), mrange(nt, streak, 0.55, 0.75, 0.0, 0.6))
        c = mixc(nt, g, c, mixc(nt, 1.0, c, col('#4E4840'), 'MULTIPLY'))
        bs = bsdf(nt, c, math_(nt, 'MULTIPLY_ADD', t['rough'], 0.3, 0.6), 0.0, bump(nt, t['disp'], 0.004))
        L(nt, haze(nt, snow_dust(nt, bs.outputs[0], 0.8, 8.0, (0.7, 0.9))), out.inputs[0])
        return mat
    return _mat(name, b)


def mat_dark(name, color, rough=0.6, metal=0.0, dust=0.7, haze_amt=1.0):
    def b(name):
        mat, nt, out = _fresh(name)
        oc = coords(nt)
        no = N(nt, 'ShaderNodeTexNoise', {'Vector': oc, 'Scale': 30.0, 'Detail': 4.0}).outputs['Fac']
        bs = bsdf(nt, mixc(nt, mrange(nt, no, 0.3, 0.7, 0.0, 0.4), col(color), col('#4A3A2E')), rough, metal)
        sh = snow_dust(nt, bs.outputs[0], dust, 6.0, (0.55, 0.85)) if dust > 0 else bs.outputs[0]
        L(nt, haze(nt, sh, haze_amt) if haze_amt > 0 else sh, out.inputs[0])
        return mat
    return _mat(name, b)


def mat_glow(name, color, strength, haze_amt=0.55):
    def b(name):
        mat, nt, out = _fresh(name)
        em = N(nt, 'ShaderNodeEmission', {'Color': col(color), 'Strength': strength})
        L(nt, haze(nt, em.outputs[0], haze_amt), out.inputs[0])
        return mat
    return _mat(name, b)


def _axis_coords(a0, a1, core, step, grow=1.18, far=4000.0):
    """1D coordinates: uniform `step` over [a0, a1] (the core), geometric growth outward to ±far."""
    c = np.linspace(a0, a1, max(2, int(round((a1 - a0) / step)) + 1))
    lo, hi = [], []
    d = step; x = a0
    while x > -far + a0 * 0:
        d *= grow; x -= d; lo.append(x)
        if a0 - x > far:
            break
    d = step; x = a1
    while True:
        d *= grow; x += d; hi.append(x)
        if x - a1 > far:
            break
    return np.concatenate([lo[::-1], c, hi])


def field_z(x, y, seed=0):
    """Snow height of the field / embankment at (x, y) (numpy). The near part follows bank_z()."""
    r = np.abs(y)
    o = seed * 7.7
    near = bank_z(r) + 0.05 * fbm(x * 0.15 + o, y * 0.15, 3, seed + 1) * _smooth((r - 3.0) / 3.0)
    # gentle rolling plain further out (amplitude grows with distance)
    amp = 0.25 + np.clip(r - 15, 0, None) * 0.01 + np.clip(np.hypot(r, 0) - 600, 0, None) * 0.004
    roll = fbm(x * 0.004 + o, y * 0.006, 4, seed + 2) * amp * 2.2 + 0.4 * fbm(x * 0.03 + o, y * 0.03, 3, seed + 3) * np.clip((r - 10) / 30, 0, 1)
    plain = FIELD_Z - 0.05 + roll
    w = _smooth((r - 14.0) / 20.0)
    return near * (1 - w) + plain * w


def _pole_mesh():
    """Concrete line-side pole (8.6 m above ground) with two angle-iron crossarms, braces and pin insulators."""
    mb = MB()
    H = 8.6
    V, F = lathe_np([(0.0, -1.2), (0.17, -1.2), (0.16, 0.0), (0.098, H - 0.05), (0.085, H), (0.0, H + 0.01)], 18)
    mb.add(V, F, 0)
    arms = [(H - 0.30, 1.50, (-0.62, -0.20, 0.20, 0.62)), (H - 1.15, 1.10, (-0.45, 0.45))]
    ins = []
    for z, ln, xs_ in arms:
        # L-section angle iron 63 x 63 x 6, along y
        prof = np.array([(-0.0315, 0.0), (0.0315, 0.0), (0.0315, 0.006), (-0.0255, 0.006), (-0.0255, 0.063), (-0.0315, 0.063)])
        V, F = extrude_x(prof, -ln / 2, ln / 2, 0.002)
        V = V[:, [1, 0, 2]]; F = [f[::-1] for f in F]
        V[:, 0] += 0.13
        V[:, 2] += z
        mb.add(V, F, 1)
        # bolt-through clamp band around the pole
        V, F = lathe_np([(0.105, z - 0.02), (0.112, z - 0.02), (0.112, z + 0.06), (0.105, z + 0.06)], 16, cap0=False, cap1=False)
        mb.add(V, F, 1)
        # V braces
        for sgn in (-1, 1):
            V, F = tube_np(np.array([(0.12, 0.0, z - 0.55), (0.13, sgn * ln * 0.33, z - 0.005)]), 0.008, 5)
            mb.add(V, F, 1)
        for yy in xs_:
            ins.append((0.13, yy, z + 0.063))
    for p in ins:
        V, F = lathe_np([(0.0, 0.0), (0.012, 0.0), (0.012, 0.03), (0.045, 0.04), (0.046, 0.05), (0.03, 0.06), (0.04, 0.075),
                         (0.041, 0.085), (0.025, 0.10), (0.026, 0.115), (0.0, 0.12)], 16)
        mb.add(_xf(V, t=p), F, 2)
    return mb, [(p[0], p[1], p[2] + 0.105) for p in ins]


def _tree_mesh(seed, kind='poplar'):
    """Procedural bare winter tree (trunk + 3 levels of branches) as tubes. Returns MB."""
    rng = np.random.default_rng(seed)
    mb = MB()
    if kind == 'poplar':
        Ht = rng.uniform(15, 20); spread = (12, 30); n1 = 26; base = 0.25
    else:                              # rounded crown (elm / willow / locust)
        Ht = rng.uniform(9, 13); spread = (35, 70); n1 = 16; base = 0.18

    def branch(p, d, length, r0, depth):
        nseg = max(2, 6 - depth)
        pts = [np.array(p)]; dd = np.array(d, float)
        for i in range(nseg):
            dd = dd + rng.normal(0, 0.12 + 0.06 * depth, 3); dd[2] += 0.08 if kind == 'poplar' else 0.02
            dd /= np.linalg.norm(dd)
            pts.append(pts[-1] + dd * length / nseg)
        pts = np.array(pts)
        rr = np.linspace(r0, r0 * 0.35, len(pts))
        sides = 5 if depth < 2 else 3
        V, F = tube_np(pts, rr, sides, closed_ends=False)
        mb.add(V, F, 0)
        if depth >= 3:
            return
        nchild = {0: n1, 1: 6 if kind == 'poplar' else 7, 2: 4}[depth]
        for k in range(nchild):
            t = rng.uniform(0.25 if depth == 0 else 0.15, 0.97)
            idx = t * (len(pts) - 1); i0 = int(idx); f = idx - i0
            q = pts[i0] * (1 - f) + pts[min(i0 + 1, len(pts) - 1)] * f
            az = rng.uniform(0, 2 * math.pi)
            el = math.radians(rng.uniform(*spread)) if depth == 0 else math.radians(rng.uniform(20, 55))
            # child direction relative to parent
            tdir = pts[-1] - pts[0]; tdir /= np.linalg.norm(tdir)
            perp = np.cross(tdir, [0.3, 0.7, 0.1]); perp /= np.linalg.norm(perp)
            perp2 = np.cross(tdir, perp)
            side = perp * math.cos(az) + perp2 * math.sin(az)
            cd = tdir * math.cos(el) + side * math.sin(el)
            if depth == 0 and kind != 'poplar':
                cd[2] = abs(cd[2]) * 0.8 + 0.2
            ln = length * (0.42 if depth == 0 else 0.5) * rng.uniform(0.6, 1.1) * (1.15 - t * 0.5 if depth == 0 else 1)
            branch(q, cd, ln, max(0.004, r0 * rr[min(i0, len(rr) - 1)] / r0 * 0.45), depth + 1)

    branch((0, 0, -0.5), (rng.normal(0, 0.03), rng.normal(0, 0.03), 1.0), Ht, base, 0)
    return mb


def _tree_variants():
    c = bpy.data.collections.get('trk_trees_src')
    if c and len(c.objects) >= 6:
        return c
    c = _subtemplates('trk_trees_src')
    m = mat_dark('trk_bark', '#2E2925', 0.8, 0.0, 0.5, 1.0)
    for k in range(6):
        kind = 'poplar' if k < 4 else 'round'
        mb = _tree_mesh(100 + k, kind)
        mb.obj(f'trk_tree_{k}', c, [m], True, 0)
    return c


def mat_grass(name='trk_grass'):
    def b(name):
        mat, nt, out = _fresh(name)
        oc = coords(nt)
        z = N(nt, 'ShaderNodeSeparateXYZ', {0: oc}).outputs[2]
        off, rnd = inst_offset(nt)
        c = mixc(nt, mrange(nt, z, 0.0, 0.35), col('#4A3C2A'), col('#A89064'))
        c = mixc(nt, math_(nt, 'MULTIPLY', rnd, 0.6), c, col('#7D6A4A'))
        bs = bsdf(nt, c, 0.75, 0.0)
        tr = N(nt, 'ShaderNodeBsdfTranslucent', {'Color': mixc(nt, 1.0, c, (0.6, 0.5, 0.3, 1), 'MULTIPLY')})
        sh = mixs(nt, 0.25, bs.outputs[0], tr.outputs[0])
        L(nt, haze(nt, snow_dust(nt, sh, 0.5, 30.0, (0.4, 0.8))), out.inputs[0])
        return mat
    return _mat(name, b)


def _tuft_variants():
    c = bpy.data.collections.get('trk_tufts_src')
    if c and len(c.objects) >= 7:
        return c
    c = _subtemplates('trk_tufts_src')
    rng = np.random.default_rng(77)
    m = mat_grass()
    for k in range(5):
        mb = MB()
        nbl = rng.integers(10, 26)
        for j in range(nbl):
            h = rng.uniform(0.12, 0.5) * (1.0 if k < 3 else 0.6)
            a = rng.uniform(0, 2 * math.pi); lean = rng.uniform(0.15, 0.75)
            base = np.array([rng.normal(0, 0.03), rng.normal(0, 0.03), -0.05])
            dirv = np.array([math.cos(a) * math.sin(lean), math.sin(a) * math.sin(lean), math.cos(lean)])
            side = np.array([-math.sin(a), math.cos(a), 0.0])
            nseg = 4
            pts = [base + dirv * h * t + np.array([0, 0, -1.0]) * (h * 0.35 * lean * t * t) for t in np.linspace(0, 1, nseg + 1)]
            w = 0.004 * (1 - np.linspace(0, 1, nseg + 1)) + 0.0004
            V = []
            for p_, ww in zip(pts, w):
                V.append(p_ - side * ww); V.append(p_ + side * ww)
            F = [[2 * i, 2 * i + 1, 2 * i + 3, 2 * i + 2] for i in range(nseg)]
            mb.add(np.array(V), F, 0)
            if rng.random() < 0.25 and k < 3:       # a seed head
                V2, F2 = lathe_np([(0, 0), (0.006, 0.01), (0.007, 0.04), (0.0, 0.06)], 5)
                mb.add(_xf(V2, t=pts[-1]), F2, 0)
        mb.obj(f'trk_tuft_{k}', c, [m], True, 0)
    for k in range(5, 7):                      # tall dry weeds (wormwood-like stems with seed sprays)
        mb = MB()
        for j in range(rng.integers(4, 9)):
            h = rng.uniform(0.45, 1.0)
            base = np.array([rng.normal(0, 0.04), rng.normal(0, 0.04), -0.05])
            lean = rng.normal(0, 0.12, 2)
            pts = np.array([base + np.array([lean[0] * t * h, lean[1] * t * h, t * h]) for t in np.linspace(0, 1, 7)])
            V, F = tube_np(pts, np.linspace(0.0035, 0.0012, 7), 4, closed_ends=False); mb.add(V, F, 0)
            for q in range(rng.integers(4, 10)):
                t0_ = rng.uniform(0.45, 0.95); p0 = base + np.array([lean[0] * t0_ * h, lean[1] * t0_ * h, t0_ * h])
                a = rng.uniform(0, 2 * math.pi); ln = rng.uniform(0.05, 0.16) * (1.2 - t0_)
                d = np.array([math.cos(a) * 0.7, math.sin(a) * 0.7, 0.75]); d /= np.linalg.norm(d)
                P2 = np.array([p0, p0 + d * ln * 0.5 + np.array([0, 0, 0.01]), p0 + d * ln])
                V, F = tube_np(P2, np.array([0.0014, 0.001, 0.0006]), 3, closed_ends=False); mb.add(V, F, 0)
                V, F = lathe_np([(0, 0), (0.004, 0.006), (0.005, 0.02), (0.0, 0.03)], 4); mb.add(_xf(V, t=P2[-1]), F, 0)
        mb.obj(f'trk_tuft_{k}', c, [m], True, 0)
    return c


def build_field(x0, x1, coll=None, seed=0, poles=True, trees=True, village=True, hills=True, pole_x=None, tufts=True):
    """Moonlit snow plain around the track for x0..x1 (terrain continues to the horizon). See module docstring."""
    t0 = time.time()
    coll = _coll(coll, 'field')
    rng = np.random.default_rng(seed + 202)
    # ---- terrain
    span = x1 - x0
    step = max(0.5, span / 1400.0)
    xs = _axis_coords(x0, x1, None, step, 1.16, 5000.0)
    ys_core = np.concatenate([np.arange(2.55, 8.0, 0.10), np.arange(8.0, 30.0, 0.5)])
    d = 0.5; y = ys_core[-1]; far = []
    while y < 5000:
        d *= 1.16; y += d; far.append(y)
    ys_pos = np.concatenate([ys_core, far])
    ys = np.concatenate([-ys_pos[::-1], ys_pos])
    X, Y = np.meshgrid(xs, ys, indexing='ij')
    Z = field_z(X, Y, seed) - 0.012
    # the track bed: vertices between ±2.6 (gap) are not generated; close the gap under the track
    V = np.column_stack([X.ravel(), Y.ravel(), Z.ravel()])
    F = _grid_faces(len(xs), len(ys))
    # remove the faces that bridge the gap across the track (between y = −2.6 and +2.6)
    yv = V[:, 1]
    bad = (yv[F[:, 0]] < 0) & (yv[F[:, 3]] > 0)
    F = F[~bad]
    # a coarse under-plate across the track bed so nothing shows through gaps
    mb = MB(); mb.add(V, F, 0)
    gx = xs
    gy = np.array([-2.7, 2.7])
    GX, GY = np.meshgrid(gx, gy, indexing='ij')
    mb.add(np.column_stack([GX.ravel(), GY.ravel(), np.full(GX.size, SUBGRADE_Z - 0.03)]), _grid_faces(len(gx), 2), 1)
    snow = mb.obj(f'trk_fieldsnow_{int(x0)}_{int(x1)}', coll, [mat_snow('trk_snow_field', 1.0, 1.0, 0.0, True, 1.0, 0.35),
                                                               mat_dark('trk_subgrade', '#3A3836', 0.9, 0.0, 0.0, 0.0)], True, 0)
    out = dict(snow=snow, poles=[], wires=None, trees=[], hills=None, village=None, coll=coll)
    # ---- poles + wires along y = −4
    if poles:
        pa, pb = pole_x if pole_x else (x0, x1)
        pmb, tops = _pole_mesh()
        pme = pmb.mesh('trk_pole', True, 40)
        for m in (mat_concrete_pole(), mat_dark('trk_angle_iron', '#2B2826', 0.55, 0.6, 0.85),
                  mat_dark('trk_insulator', '#8E9AA2', 0.18, 0.0, 0.5)):
            pme.materials.append(m)
        px = np.arange(math.ceil(pa / 50.0) * 50.0, pb + 1e-6, 50.0)
        wires = MB()
        prev = None
        for i, x in enumerate(px):
            yb = -4.0 + rng.normal(0, 0.05)
            zb = float(field_z(np.array([x]), np.array([yb]), seed)[0]) - 0.05
            o = bpy.data.objects.new('trk_pole', pme)
            o.location = (x, yb, zb)
            lean = (rng.normal(0, 0.008), rng.normal(0, 0.010))
            o.rotation_euler = (lean[0], lean[1], rng.normal(0, 0.03))
            coll.objects.link(o)
            out['poles'].append(o)
            bpy.context.view_layer.update()
            mw = o.matrix_world
            from mathutils import Vector as _V
            cur = [mw @ _V(t) for t in tops]
            if prev is not None:
                for a, b in zip(prev, cur):
                    n = 28
                    tt = np.linspace(0, 1, n)
                    P = np.outer(1 - tt, a) + np.outer(tt, b)
                    span_ = (b - a).length
                    P[:, 2] -= 4 * (0.009 * span_) * tt * (1 - tt)
                    V, F = tube_np(P, 0.0055, 4, closed_ends=False)
                    wires.add(V, F, 0)
            prev = cur
        if wires.V:
            out['wires'] = wires.obj('trk_wires', coll, [mat_dark('trk_wire', '#1E1E20', 0.6, 0.3, 0.0, 0.6)], True, 0)
    # ---- tree lines (poplar wind-breaks parallel to the track) + clumps
    if trees:
        src = _tree_variants()
        P, R, S, VAR = [], [], [], []
        ext = 900.0
        rows = [(115.0, 0.1), (-135.0, 0.3), (260.0, 0.5), (-420.0, 0.6), (650.0, 0.75), (-900.0, 0.85)]
        for yr, gap in rows:
            xx = np.arange(x0 - ext, x1 + ext, 3.6)
            xx = xx + rng.normal(0, 0.8, len(xx))
            # gaps in the rows
            keep = vnoise(xx * 0.01, np.full(len(xx), yr), seed + 5) > 0.25 + gap * 0.25
            xx = xx[keep]
            yy = yr + rng.normal(0, 1.2, len(xx))
            for xv, yv in zip(xx, yy):
                zv = float(field_z(np.array([xv]), np.array([yv]), seed)[0])
                P.append((xv, yv, zv - 0.3)); R.append((rng.normal(0, 0.03), rng.normal(0, 0.03), rng.uniform(0, 6.28)))
                s_ = rng.uniform(0.8, 1.2); S.append((s_, s_, s_ * rng.uniform(0.9, 1.15))); VAR.append(rng.integers(0, 4))
        for xr in (x1 + 520.0, x0 - 380.0, x1 + 1500.0):       # field-boundary rows crossing the line
            yy = np.arange(-1600, 1600, 3.8); yy = yy + rng.normal(0, 0.8, len(yy))
            keep = (vnoise(np.full(len(yy), xr), yy * 0.012, seed + 6) > 0.3) & (np.abs(yy) > 25)
            for yv in yy[keep]:
                xv = xr + rng.normal(0, 1.0)
                zv = float(field_z(np.array([xv]), np.array([yv]), seed)[0])
                P.append((xv, yv, zv - 0.3)); R.append((rng.normal(0, 0.03), rng.normal(0, 0.03), rng.uniform(0, 6.28)))
                s_ = rng.uniform(0.8, 1.2); S.append((s_, s_, s_ * rng.uniform(0.9, 1.15))); VAR.append(rng.integers(0, 4))
        for k in range(28):                       # clumps around farmsteads
            cx = rng.uniform(x0 - ext, x1 + ext); cy = rng.choice([-1, 1]) * rng.uniform(120, 1500)
            for j in range(rng.integers(4, 14)):
                xv, yv = cx + rng.normal(0, 12), cy + rng.normal(0, 10)
                zv = float(field_z(np.array([xv]), np.array([yv]), seed)[0])
                P.append((xv, yv, zv - 0.3)); R.append((0, 0, rng.uniform(0, 6.28)))
                s_ = rng.uniform(0.8, 1.3); S.append((s_, s_, s_)); VAR.append(rng.integers(0, 6))
        out['trees'].append(instancer('trk_trees', coll, src, P, R, S, VAR))
    # ---- dry grass tufts poking through the snow (embankment toe, ditches, near field)
    if tufts:
        src = _tuft_variants()
        area_x = min(x1 - x0, 2500.0)
        P, R, S, VAR = [], [], [], []
        for sgn in (-1, 1):
            n = int(area_x * 40 * 0.30)
            xx = rng.uniform(x0, x0 + area_x, n)
            yy = sgn * (3.0 + rng.exponential(5.0, n))
            clump = vnoise(xx * 0.18, yy * 0.18, seed + 50) * vnoise(xx * 0.9, yy * 0.9, seed + 51)
            keep = rng.random(n) < np.clip(clump - 0.12, 0, 1) ** 1.5 * 3.0
            for z_ in _zones():
                keep &= ~((xx > z_[0] - 1.0) & (xx < z_[1] + 1.0) & (np.abs(yy) < (z_[2] if len(z_) > 2 else 6.0) + 1.5))
            xx, yy = xx[keep], yy[keep]
            zz = field_z(xx, yy, seed) - 0.012
            for xv, yv, zv in zip(xx, yy, zz):
                P.append((xv, yv, zv)); R.append((rng.normal(0, 0.08), rng.normal(0, 0.08), rng.uniform(0, 6.28)))
                s_ = rng.uniform(0.7, 1.5); S.append((s_, s_, s_ * rng.uniform(0.8, 1.35))); VAR.append(rng.choice(7, p=[.2, .2, .17, .14, .14, .08, .07]))
        if P:
            out['tufts'] = instancer('trk_tufts', coll, src, P, R, S, VAR)
    # ---- far low hills (a ring of snow ridges)
    if hills:
        cx = (x0 + x1) / 2
        ang = np.linspace(0, 2 * math.pi, 900, endpoint=False)
        rad = np.array([2600, 3200, 3900, 4600, 5600])
        A, Rr = np.meshgrid(ang, rad, indexing='ij')
        hh = (fbm(np.cos(A) * 6 + 3, np.sin(A) * 6, 5, seed + 40) * 0.5 + 0.5) ** 1.7
        prof = np.array([0.0, 0.55, 1.0, 0.7, 0.2])[None, :]
        Hh = (35 + 140 * hh) * prof - 4.0
        V = np.column_stack([(cx + Rr * np.cos(A)).ravel(), (Rr * np.sin(A)).ravel(), Hh.ravel()])
        F = []
        na, nr = len(ang), len(rad)
        for i in range(na):
            j = (i + 1) % na
            for k in range(nr - 1):
                F.append([i * nr + k, i * nr + k + 1, j * nr + k + 1, j * nr + k])
        mb = MB(); mb.add(V, F, 0)
        out['hills'] = mb.obj('trk_hills', coll, [mat_snow('trk_snow_hills', 0.05, 0.0, 0.0, False, 1.0)], True, 0)
    # ---- village lights on the horizon
    if village:
        mb = MB()
        houses = MB()
        for k in range(22):
            d = rng.uniform(700, 2600); a = rng.uniform(0, 2 * math.pi)
            if abs(math.sin(a)) * d < 140:          # keep villages off the line itself
                continue
            ex = x1 if math.cos(a) > 0 else x0
            cx = ex + d * math.cos(a) * 0.8; cy = d * math.sin(a)
            nl = rng.integers(3, 12)
            for j in range(nl):
                lx, ly = cx + rng.normal(0, 40), cy + rng.normal(0, 25)
                lz = float(field_z(np.array([lx]), np.array([ly]), seed)[0]) + rng.uniform(1.2, 5.0)
                V, F = lathe_np([(0, -1), (0.6, -0.5), (0.6, 0.5), (0, 1)], 8)
                mb.add(V * rng.uniform(0.45, 0.9) + (lx, ly, lz), F, int(rng.random() < 0.3))
                if rng.random() < 0.7:
                    V, F = box_np(rng.uniform(8, 14), rng.uniform(5, 7), rng.uniform(3, 4), (lx + rng.normal(0, 6), ly + 5, lz - 1.5))
                    houses.add(V, F, 0)
        out['village'] = mb.obj('trk_village_lights', coll, [mat_glow('trk_village_warm', '#FFB46A', 900, 0.62),
                                                              mat_glow('trk_village_sodium', '#FF9B45', 700, 0.62)], True, 0)
        if houses.V:
            houses.obj('trk_village_houses', coll, [mat_dark('trk_house', '#2B2F36', 0.8, 0.0, 0.9, 1.0)], False, 0)
        for ob in (out['village'],):
            ob.visible_shadow = False
    print(f'[track] build_field({x0},{x1}) {time.time() - t0:.1f}s', flush=True)
    return out


# ============================================================================= snowfall
def _snowfall_group():
    ng = bpy.data.node_groups.get('trk_snowfall')
    if ng:
        return ng
    ng = bpy.data.node_groups.new('trk_snowfall', 'GeometryNodeTree')
    I = ng.interface
    I.new_socket('Geometry', in_out='INPUT', socket_type='NodeSocketGeometry')
    I.new_socket('Collection', in_out='INPUT', socket_type='NodeSocketCollection')
    I.new_socket('Time', in_out='INPUT', socket_type='NodeSocketFloat')
    I.new_socket('Box Min', in_out='INPUT', socket_type='NodeSocketVector')
    I.new_socket('Box Size', in_out='INPUT', socket_type='NodeSocketVector')
    I.new_socket('Wind', in_out='INPUT', socket_type='NodeSocketVector')
    I.new_socket('Geometry', in_out='OUTPUT', socket_type='NodeSocketGeometry')
    nt = ng
    gi = nt.nodes.new('NodeGroupInput'); go = nt.nodes.new('NodeGroupOutput')

    def attr(name, typ='FLOAT_VECTOR'):
        return N(nt, 'GeometryNodeInputNamedAttribute', {'Name': name}, data_type=typ).outputs['Attribute']

    def vm(op, a, b=None, sc=None):
        n = nt.nodes.new('ShaderNodeVectorMath'); n.operation = op
        for i, v in ((0, a), (1, b)):
            if v is None:
                continue
            if isinstance(v, bpy.types.NodeSocket):
                L(nt, v, n.inputs[i])
            else:
                n.inputs[i].default_value = v
        if sc is not None:
            if isinstance(sc, bpy.types.NodeSocket):
                L(nt, sc, n.inputs[3])
            else:
                n.inputs[3].default_value = sc
        return n.outputs[0]

    T = gi.outputs['Time']
    pos = N(nt, 'GeometryNodeInputPosition').outputs[0]
    vel = vm('ADD', attr('vel'), gi.outputs['Wind'])
    p = vm('ADD', pos, vm('SCALE', vel, None, T))
    ph = attr('ph', 'FLOAT'); amp = attr('amp', 'FLOAT'); fr = attr('fr', 'FLOAT')
    a1 = math_(nt, 'ADD', math_(nt, 'MULTIPLY', T, fr), ph)
    sx = math_(nt, 'MULTIPLY', math_(nt, 'SINE', a1), amp)
    sy = math_(nt, 'MULTIPLY', math_(nt, 'COSINE', math_(nt, 'MULTIPLY_ADD', a1, 0.77, 1.3)), amp)
    p = vm('ADD', p, N(nt, 'ShaderNodeCombineXYZ', {0: sx, 1: sy, 2: 0.0}).outputs[0])
    rel = vm('SUBTRACT', p, gi.outputs['Box Min'])
    sr = N(nt, 'ShaderNodeSeparateXYZ', {0: rel}); ss = N(nt, 'ShaderNodeSeparateXYZ', {0: gi.outputs['Box Size']})
    w = [math_(nt, 'FLOORED_MODULO', sr.outputs[i], ss.outputs[i]) for i in range(3)]
    p2 = vm('ADD', N(nt, 'ShaderNodeCombineXYZ', {0: w[0], 1: w[1], 2: w[2]}).outputs[0], gi.outputs['Box Min'])
    sp = N(nt, 'GeometryNodeSetPosition', {'Geometry': gi.outputs['Geometry'], 'Position': p2})
    rot = vm('ADD', attr('rot'), vm('SCALE', attr('spin'), None, T))
    ci = N(nt, 'GeometryNodeCollectionInfo', {'Separate Children': True, 'Reset Children': True})
    L(nt, gi.outputs['Collection'], ci.inputs['Collection'])
    io = N(nt, 'GeometryNodeInstanceOnPoints', {'Points': sp.outputs[0], 'Instance': ci.outputs[0], 'Pick Instance': True,
                                                'Instance Index': attr('var', 'INT'),
                                                'Rotation': N(nt, 'FunctionNodeEulerToRotation', {0: rot}).outputs[0],
                                                'Scale': attr('scl')})
    L(nt, io.outputs[0], go.inputs[0])
    return ng


def mat_flake(name='trk_flake'):
    def b(name):
        mat, nt, out = _fresh(name)
        d = N(nt, 'ShaderNodeBsdfDiffuse', {'Color': (0.92, 0.95, 1.0, 1)})
        tr = N(nt, 'ShaderNodeBsdfTranslucent', {'Color': (0.85, 0.9, 1.0, 1)})
        sh = mixs(nt, 0.45, d.outputs[0], tr.outputs[0])
        sh = mixs(nt, 0.22, sh, N(nt, 'ShaderNodeBsdfTransparent').outputs[0])
        L(nt, sh, out.inputs[0])
        return mat
    return _mat(name, b)


def _flake_variants():
    c = bpy.data.collections.get('trk_flakes_src')
    if c and len(c.objects) >= 4:
        return c
    c = _subtemplates('trk_flakes_src')
    import bmesh
    rng = np.random.default_rng(5)
    m = mat_flake()
    for k in range(4):
        bm = bmesh.new()
        nb = [1, 2, 3, 4][k]
        for j in range(nb):
            ret = bmesh.ops.create_icosphere(bm, subdivisions=1, radius=1.0 if j == 0 else rng.uniform(0.45, 0.8))
            off = rng.normal(0, 0.6, 3) * (j > 0); off[2] *= 0.3
            bmesh.ops.translate(bm, verts=ret['verts'], vec=off)
        for v in bm.verts:
            v.co.z *= 0.32
        me = bpy.data.meshes.new(f'trk_flake_{k}'); bm.to_mesh(me); bm.free()
        me.polygons.foreach_set('use_smooth', np.ones(len(me.polygons), bool))
        me.materials.append(m)
        o = bpy.data.objects.new(f'trk_flake_{k}', me); c.objects.link(o)
    return c


def snowfall(center, size=(60, 20, 12), density=1.0, coll=None, seed=0):
    """Static world-space instanced snowflakes filling a box (centre, size). Returns the object."""
    coll = _coll(coll, 'snowfall')
    rng = np.random.default_rng(seed + 303)
    cx, cy, cz = center; sx, sy, sz = size
    n = int(sx * sy * sz * 1.4 * density)
    P = np.column_stack([rng.uniform(cx - sx / 2, cx + sx / 2, n), rng.uniform(cy - sy / 2, cy + sy / 2, n),
                         rng.uniform(cz - sz / 2, cz + sz / 2, n)])
    me = bpy.data.meshes.new('trk_snowfall')
    me.vertices.add(n); me.vertices.foreach_set('co', P.astype(np.float32).ravel())

    def put(name, arr, typ='FLOAT_VECTOR'):
        a = me.attributes.new(name, typ, 'POINT')
        if typ == 'FLOAT':
            a.data.foreach_set('value', np.asarray(arr, np.float32))
        elif typ == 'INT':
            a.data.foreach_set('value', np.asarray(arr, np.int32))
        else:
            a.data.foreach_set('vector', np.asarray(arr, np.float32).ravel())
    put('vel', np.column_stack([rng.normal(0.25, 0.12, n), rng.normal(0.05, 0.1, n), -rng.uniform(0.55, 1.15, n)]))
    put('ph', rng.uniform(0, 2 * math.pi, n), 'FLOAT')
    put('amp', rng.uniform(0.03, 0.16, n), 'FLOAT')
    put('fr', rng.uniform(0.6, 1.8, n), 'FLOAT')
    put('rot', rng.uniform(0, 2 * math.pi, (n, 3)))
    put('spin', rng.normal(0, 1.5, (n, 3)))
    r = 0.0085 * rng.lognormal(0, 0.35, n)
    put('scl', np.column_stack([r, r * rng.uniform(0.8, 1.2, n), r]))
    put('var', rng.integers(0, 4, n), 'INT')
    me.update()
    o = bpy.data.objects.new('trk_snowfall', me)
    coll.objects.link(o)
    m = o.modifiers.new('snowfall', 'NODES'); m.node_group = _snowfall_group()
    ids = {s.name: s.identifier for s in m.node_group.interface.items_tree if s.in_out == 'INPUT'}
    m[ids['Collection']] = _flake_variants()
    m[ids['Time']] = 0.0
    m[ids['Box Min']] = (cx - sx / 2, cy - sy / 2, cz - sz / 2)
    m[ids['Box Size']] = (sx, sy, sz)
    m[ids['Wind']] = (0.15, 0.05, 0.0)
    o['trk_ids'] = ids
    o.visible_shadow = False
    o.visible_diffuse = False
    o.visible_glossy = False
    o.visible_transmission = False
    o.visible_volume_scatter = False
    return o


def advance_snow(snow, t):
    """Set the flake time (seconds). Flakes fall ~0.55–1.15 m/s, drift with the wind, sway, wrap in the box."""
    m = snow.modifiers['snowfall']
    m[snow['trk_ids']['Time']] = float(t)
    snow.update_tag()


def animate_snow(snow, frame_start, frame_end, fps=None):
    """Keyframe the flake time linearly: t = frame / fps over [frame_start, frame_end]."""
    fps = fps or bpy.context.scene.render.fps
    m = snow.modifiers['snowfall']
    key = snow['trk_ids']['Time']
    for f in (frame_start, frame_end):
        m[key] = f / fps
        snow.keyframe_insert(data_path=f'modifiers["snowfall"]["{key}"]', frame=f)
    ad = snow.animation_data
    if ad and ad.action:
        for fc in ad.action.fcurves:
            for kp in fc.keyframe_points:
                kp.interpolation = 'LINEAR'
            fc.extrapolation = 'LINEAR'


# ============================================================================= world
def _hdri_sun(path):
    """Direction (azimuth, elevation in radians, Blender world frame, no rotation) of the brightest HDRI pixel."""
    img = bpy.data.images.load(path, check_existing=True)
    w, h = img.size
    px = np.empty(w * h * 4, np.float32); img.pixels.foreach_get(px)
    px = px.reshape(h, w, 4)
    lum = px[..., 0] * 0.2126 + px[..., 1] * 0.7152 + px[..., 2] * 0.0722
    i = int(np.argmax(lum)); vy, ux = divmod(i, w)
    u = (ux + 0.5) / w; v = (vy + 0.5) / h
    # Cycles equirect: u = (π − atan2(dir.y, dir.x)) / 2π ; v = 0.5 + elevation / π
    az = math.pi - 2 * math.pi * u
    el = (v - 0.5) * math.pi
    return math.atan2(math.sin(az), math.cos(az)), el, float(lum.max())


def _set_haze(density, strength, color):
    ng = _haze_group()
    ng.nodes['haze_density'].outputs[0].default_value = density
    ng.nodes['haze_strength'].outputs[0].default_value = strength
    ng.nodes['haze_color'].outputs[0].default_value = col(color)


def film_finish(glare=0.6, vignette=0.22):
    """Compositor: soft fog-glow on lights / moon / speculars and a gentle vignette."""
    sc = bpy.context.scene
    sc.use_nodes = True
    nt = sc.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    rl = nt.nodes.new('CompositorNodeRLayers')
    comp = nt.nodes.new('CompositorNodeComposite')
    cur = rl.outputs['Image']
    if glare > 0:
        g = nt.nodes.new('CompositorNodeGlare'); g.glare_type = 'FOG_GLOW'; g.quality = 'HIGH'
        g.threshold = 1.0; g.size = 8; g.mix = -1 + glare * 0.5
        nt.links.new(cur, g.inputs['Image']); cur = g.outputs['Image']
    if vignette > 0:
        em = nt.nodes.new('CompositorNodeEllipseMask'); em.width = 0.95; em.height = 0.9
        bl = nt.nodes.new('CompositorNodeBlur'); bl.filter_type = 'GAUSS'; bl.use_relative = True
        bl.factor_x = 25.0; bl.factor_y = 25.0
        nt.links.new(em.outputs['Mask'], bl.inputs['Image'])
        mr = nt.nodes.new('CompositorNodeMapRange')
        mr.inputs['From Min'].default_value = 0.0; mr.inputs['From Max'].default_value = 1.0
        mr.inputs['To Min'].default_value = 1 - vignette; mr.inputs['To Max'].default_value = 1.0
        nt.links.new(bl.outputs['Image'], mr.inputs['Value'])
        mx = nt.nodes.new('CompositorNodeMixRGB'); mx.blend_type = 'MULTIPLY'
        mx.inputs[0].default_value = 1.0
        nt.links.new(cur, mx.inputs[1]); nt.links.new(mr.outputs[0], mx.inputs[2])
        cur = mx.outputs[0]
    nt.links.new(cur, comp.inputs['Image'])


def _moon_disc(az, el, dist=4000.0, ang=1.3, coll=None):
    """Visible moon: an emissive disc (soft limb, faint maria) at the moon direction."""
    d = np.array([math.sin(math.radians(az)) * math.cos(math.radians(el)), -math.cos(math.radians(az)) * math.cos(math.radians(el)),
                  math.sin(math.radians(el))])
    r = dist * math.tan(math.radians(ang / 2))
    mat, nt, out = _fresh('trk_moon_disc')
    oc = coords(nt, 'Object')
    sep = N(nt, 'ShaderNodeSeparateXYZ', {0: oc})
    rr = math_(nt, 'SQRT', math_(nt, 'ADD', math_(nt, 'MULTIPLY', sep.outputs[0], sep.outputs[0]), math_(nt, 'MULTIPLY', sep.outputs[1], sep.outputs[1])))
    limb = mrange(nt, rr, 1.0, 0.55, 0.0, 1.0)
    mar = N(nt, 'ShaderNodeTexNoise', {'Vector': oc, 'Scale': 1.6, 'Detail': 5.0, 'Roughness': 0.6}).outputs['Fac']
    c = mixc(nt, mrange(nt, mar, 0.45, 0.65, 0.0, 0.55), col('#F4F7FF'), col('#9FA8B8'))
    em = N(nt, 'ShaderNodeEmission', {'Color': c, 'Strength': math_(nt, 'MULTIPLY', limb, 60.0)})
    tr = N(nt, 'ShaderNodeBsdfTransparent')
    L(nt, mixs(nt, mrange(nt, rr, 1.0, 0.97), tr.outputs[0], em.outputs[0]), out.inputs[0])
    V = [(math.cos(a), math.sin(a), 0) for a in np.linspace(0, 2 * math.pi, 48, endpoint=False)]
    me = bpy.data.meshes.new('trk_moon_disc'); me.from_pydata(V, [], [list(range(48))])
    me.materials.append(mat)
    o = bpy.data.objects.new('trk_moon_disc', me)
    _coll(coll, 'world').objects.link(o)
    o.scale = (r, r, r)
    o.location = tuple(d * dist)
    from mathutils import Vector as _V
    o.rotation_euler = _V(tuple(-d)).to_track_quat('-Z', 'Y').to_euler()
    o.visible_shadow = False; o.visible_diffuse = False
    return o


def _add_stars(nt, strength=1.0):
    """Add a faint star field (camera rays only, above the horizon) on top of the world background."""
    out = next(n for n in nt.nodes if n.type == 'OUTPUT_WORLD')
    src = out.inputs['Surface'].links[0].from_socket
    tc = N(nt, 'ShaderNodeTexCoord')
    vor = N(nt, 'ShaderNodeTexVoronoi', {'Vector': tc.outputs['Generated'], 'Scale': 420.0, 'Randomness': 1.0})
    vor.voronoi_dimensions = '3D'
    r = N(nt, 'ShaderNodeSeparateColor', {0: vor.outputs['Color']}).outputs[0]
    m = math_(nt, 'MULTIPLY', mrange(nt, r, 0.985, 0.995), mrange(nt, vor.outputs['Distance'], 0.10, 0.02))
    z = N(nt, 'ShaderNodeSeparateXYZ', {0: tc.outputs['Generated']}).outputs[2]
    m = math_(nt, 'MULTIPLY', m, mrange(nt, z, 0.12, 0.45))
    m = math_(nt, 'MULTIPLY', m, math_(nt, 'MULTIPLY_ADD', N(nt, 'ShaderNodeSeparateColor', {0: vor.outputs['Color']}).outputs[1], 2.5, 0.5))
    lp = N(nt, 'ShaderNodeLightPath')
    m = math_(nt, 'MULTIPLY', m, lp.outputs['Is Camera Ray'])
    em = N(nt, 'ShaderNodeBackground', {'Color': (0.85, 0.9, 1.0, 1.0), 'Strength': math_(nt, 'MULTIPLY', m, 1.6 * strength)})
    add = N(nt, 'ShaderNodeAddShader')
    L(nt, src, add.inputs[0]); L(nt, em.outputs[0], add.inputs[1])
    L(nt, add.outputs[0], out.inputs['Surface'])


def night_world(kind='plain', strength=1.0, moon_azimuth=110, moon_elevation=None, hdri=None, haze=1.0, disc=True, fill=1.6):
    """Night world. 'plain': day-for-night graded HDRI + moon (+ disc); 'underpass': dark-blue low sky + dim moon."""
    sc = bpy.context.scene
    for o in [o for o in bpy.data.objects if o.name.startswith(('moon', 'trk_moon_disc'))]:
        bpy.data.objects.remove(o)
    if kind == 'plain':
        hid = hdri or 'qwantani_moonrise_puresky'
        path = ph_hdri(hid)
        saz, sel, smax = _hdri_sun(path)
        # rotate the HDRI so its sun sits at the moon azimuth (moon direction in XY = (sin az, −cos az))
        maz = math.atan2(-math.cos(math.radians(moon_azimuth)), math.sin(math.radians(moon_azimuth)))
        if moon_elevation is None:
            moon_elevation = min(45.0, max(8.0, math.degrees(sel)))
        w = world_hdri(hid, strength=0.26 * strength * fill, rotation=saz - maz, tint='#3A6B8C', tint_mix=0.80,
                       bg_strength=0.26 * strength)
        nt = w.node_tree
        env = next(n for n in nt.nodes if n.type == 'TEX_ENVIRONMENT')
        hsv = next(n for n in nt.nodes if n.type == 'HUE_SAT')
        # normalise the HDRI to its median sky level, cap the sun/moon blob
        img = env.image
        px = np.empty(img.size[0] * img.size[1] * 4, np.float32); img.pixels.foreach_get(px)
        px = px.reshape(img.size[1], img.size[0], 4)[img.size[1] // 2:]
        med = float(np.median(px[..., :3].mean(-1)))
        norm = nt.nodes.new('ShaderNodeVectorMath'); norm.operation = 'SCALE'; norm.inputs[3].default_value = 0.35 / max(med, 1e-4)
        cap = nt.nodes.new('ShaderNodeVectorMath'); cap.operation = 'MINIMUM'; cap.inputs[1].default_value = (2.0, 2.0, 2.0)
        nt.links.new(env.outputs['Color'], norm.inputs[0]); nt.links.new(norm.outputs[0], cap.inputs[0])
        nt.links.new(cap.outputs[0], hsv.inputs['Color'])
        hsv.inputs['Saturation'].default_value = 0.85
        _add_stars(nt)
        mo = moon(strength=2.0 * strength, elevation=moon_elevation, azimuth=moon_azimuth, color='#B4CBF5', angle=0.6)
        dsc = _moon_disc(moon_azimuth, moon_elevation) if disc else None
        _set_haze(1 / 1500.0 * haze, 0.16 * strength, '#5C84AC')
    else:
        w = bpy.data.worlds.get('World') or bpy.data.worlds.new('World')
        sc.world = w; w.use_nodes = True
        nt = w.node_tree
        for n in list(nt.nodes):
            nt.nodes.remove(n)
        out = nt.nodes.new('ShaderNodeOutputWorld')
        tc = N(nt, 'ShaderNodeTexCoord')
        z = N(nt, 'ShaderNodeSeparateXYZ', {0: tc.outputs['Generated']}).outputs[2]
        g = mrange(nt, z, -0.05, 0.6, 0.0, 1.0)
        c = mixc(nt, g, col('#2E557A'), col('#0F2238'))
        bg = N(nt, 'ShaderNodeBackground', {'Color': c, 'Strength': 0.9 * strength * fill})
        bg2 = N(nt, 'ShaderNodeBackground', {'Color': c, 'Strength': 0.9 * strength})
        lp = N(nt, 'ShaderNodeLightPath')
        L(nt, mixs(nt, lp.outputs['Is Camera Ray'], bg.outputs[0], bg2.outputs[0]), out.inputs[0])
        mo = moon(strength=1.6 * strength, elevation=moon_elevation or 20.0, azimuth=moon_azimuth, color='#BFD4FF', angle=0.6)
        dsc = None
        _set_haze(1 / 900.0 * haze, 0.20 * strength, '#4F7499')
    film_finish()
    return dict(world=w, moon=mo, moon_disc=dsc)



# ============================================================================= underpass
def mat_wall(name='trk_wall'):
    """Board-formed abutment concrete: tie holes, water streaks below the deck, efflorescence, damp base."""
    def b(name):
        mat, nt, out = _fresh(name)
        oc = coords(nt)
        sep = N(nt, 'ShaderNodeSeparateXYZ', {0: oc})
        x, y, z = sep.outputs[0], sep.outputs[1], sep.outputs[2]
        t = tex(nt, 'wood_textured_concrete', oc, 0.55)
        c = N(nt, 'ShaderNodeHueSaturation', {'Color': t['diff'], 'Saturation': 0.08, 'Value': 1.15}).outputs[0]
        c = mixc(nt, 0.35, c, col('#8E8E8A'))
        # vertical water streaks (stronger near the top, fading down)
        sv = N(nt, 'ShaderNodeMapping', {'Vector': oc, 'Scale': (5.0, 5.0, 0.35)}).outputs[0]
        st = N(nt, 'ShaderNodeTexNoise', {'Vector': sv, 'Scale': 1.0, 'Detail': 8.0, 'Roughness': 0.65}).outputs['Fac']
        top = mrange(nt, z, 0.5, 4.8)
        streak = math_(nt, 'MULTIPLY', mrange(nt, st, 0.5, 0.72), top)
        c = mixc(nt, math_(nt, 'MULTIPLY', streak, 0.75), c, mixc(nt, 1.0, c, col('#3C3A36'), 'MULTIPLY'))
        # efflorescence (white lime) streaks
        ef = N(nt, 'ShaderNodeTexNoise', {'Vector': N(nt, 'ShaderNodeMapping', {'Vector': oc, 'Scale': (9.0, 9.0, 0.5)}).outputs[0],
                                          'Scale': 1.3, 'Detail': 6.0}).outputs['Fac']
        efm = math_(nt, 'MULTIPLY', mrange(nt, ef, 0.66, 0.78), mrange(nt, z, 2.0, 4.6))
        c = mixc(nt, math_(nt, 'MULTIPLY', efm, 0.55), c, col('#D9D8D2'))
        # tie holes on a 0.6 x 0.45 m grid (plugged, with a rust bleed below)
        fx = math_(nt, 'SUBTRACT', math_(nt, 'FRACT', math_(nt, 'DIVIDE', x, 0.6)), 0.5)
        fz = math_(nt, 'SUBTRACT', math_(nt, 'FRACT', math_(nt, 'DIVIDE', math_(nt, 'SUBTRACT', z, 0.2), 0.45)), 0.5)
        dh = math_(nt, 'SQRT', math_(nt, 'ADD', math_(nt, 'MULTIPLY', math_(nt, 'MULTIPLY', fx, 0.6), math_(nt, 'MULTIPLY', fx, 0.6)),
                                      math_(nt, 'MULTIPLY', math_(nt, 'MULTIPLY', fz, 0.45), math_(nt, 'MULTIPLY', fz, 0.45))))
        hole = mrange(nt, dh, 0.016, 0.011)
        bleed = math_(nt, 'MULTIPLY', mrange(nt, math_(nt, 'ABSOLUTE', math_(nt, 'MULTIPLY', fx, 0.6)), 0.012, 0.004),
                      math_(nt, 'MULTIPLY', mrange(nt, math_(nt, 'MULTIPLY', fz, 0.45), -0.012, -0.012 - 0.16, 1.0, 0.0),
                            mrange(nt, math_(nt, 'MULTIPLY', fz, 0.45), -0.005, -0.014)))
        c = mixc(nt, math_(nt, 'MULTIPLY', bleed, 0.35), c, col('#6B4A35'))
        c = mixc(nt, hole, c, col('#2A2826'))
        # damp base, wet sheen
        damp = math_(nt, 'MAXIMUM', mrange(nt, z, 0.15, -0.55), math_(nt, 'MULTIPLY', streak, 0.5))
        c = mixc(nt, math_(nt, 'MULTIPLY', damp, 0.55), c, mixc(nt, 1.0, c, (0.42, 0.43, 0.45, 1), 'MULTIPLY'))
        rough = mixf(nt, damp, math_(nt, 'MULTIPLY_ADD', t['rough'], 0.3, 0.62), 0.32)
        bs = bsdf(nt, c, rough, 0.0, bump(nt, math_(nt, 'ADD', t['disp'], math_(nt, 'MULTIPLY', hole, -0.6)), 0.01, 1.0))
        L(nt, snow_dust(nt, bs.outputs[0], 0.9, 4.0, (0.75, 0.95)), out.inputs[0])
        return mat
    return _mat(name, b)


def mat_soffit(name='trk_soffit'):
    """Deck underside: precast concrete, soot band over the track (diesel exhaust), wet joints, lime drips."""
    def b(name):
        mat, nt, out = _fresh(name)
        oc = coords(nt)
        sep = N(nt, 'ShaderNodeSeparateXYZ', {0: oc})
        t = tex(nt, 'concrete_wall_008', oc, 0.9)
        c = N(nt, 'ShaderNodeHueSaturation', {'Color': t['diff'], 'Saturation': 0.3, 'Value': 0.95}).outputs[0]
        n = N(nt, 'ShaderNodeTexNoise', {'Vector': oc, 'Scale': 0.9, 'Detail': 6.0, 'Roughness': 0.6}).outputs['Fac']
        soot = math_(nt, 'MULTIPLY', mrange(nt, math_(nt, 'ABSOLUTE', sep.outputs[1]), 2.6, 1.0), mrange(nt, n, 0.3, 0.7, 0.55, 0.95))
        c = mixc(nt, soot, c, mixc(nt, 1.0, c, col('#1F1D1C'), 'MULTIPLY'))
        jx = math_(nt, 'ABSOLUTE', math_(nt, 'SUBTRACT', math_(nt, 'FRACT', math_(nt, 'DIVIDE', sep.outputs[0], 1.0)), 0.5))
        wetj = math_(nt, 'MULTIPLY', mrange(nt, jx, 0.47, 0.5), mrange(nt, n, 0.35, 0.6))
        c = mixc(nt, math_(nt, 'MULTIPLY', wetj, 0.6), c, mixc(nt, 1.0, c, col('#5E5C58'), 'MULTIPLY'))
        lime = math_(nt, 'MULTIPLY', mrange(nt, jx, 0.485, 0.5), mrange(nt, N(nt, 'ShaderNodeTexNoise', {'Vector': oc, 'Scale': 4.0}).outputs['Fac'], 0.6, 0.7))
        c = mixc(nt, lime, c, col('#CFCDC6'))
        bs = bsdf(nt, c, mixf(nt, wetj, math_(nt, 'MULTIPLY_ADD', t['rough'], 0.3, 0.6), 0.25), 0.0, bump(nt, t['disp'], 0.008))
        L(nt, snow_dust(nt, bs.outputs[0], 0.9, 4.0, (0.75, 0.95)), out.inputs[0])
        return mat
    return _mat(name, b)


def mat_apron(name='trk_apron_floor'):
    """Wet concrete apron / cable-trough lids with slab joints, puddles (mirror water), damp edges."""
    def b(name):
        mat, nt, out = _fresh(name)
        oc = coords(nt)
        sep = N(nt, 'ShaderNodeSeparateXYZ', {0: oc})
        t = tex(nt, 'damaged_concrete_floor', oc, 0.7)
        c = N(nt, 'ShaderNodeHueSaturation', {'Color': t['diff'], 'Saturation': 0.4, 'Value': 1.25}).outputs[0]
        jx = math_(nt, 'ABSOLUTE', math_(nt, 'SUBTRACT', math_(nt, 'FRACT', math_(nt, 'DIVIDE', sep.outputs[0], 0.5)), 0.5))
        joint = mrange(nt, jx, 0.485, 0.495)
        pv = N(nt, 'ShaderNodeMapping', {'Vector': oc, 'Scale': (0.55, 1.1, 1.0)}).outputs[0]
        pn = N(nt, 'ShaderNodeTexNoise', {'Vector': pv, 'Scale': 1.4, 'Detail': 5.0, 'Roughness': 0.55}).outputs['Fac']
        pn2 = math_(nt, 'ADD', pn, math_(nt, 'MULTIPLY', t['disp'], -0.25))
        puddle = mrange(nt, pn2, 0.62, 0.64)
        damp = mrange(nt, pn2, 0.20, 0.45, 0.55, 1.0)
        c = mixc(nt, joint, c, mixc(nt, 1.0, c, (0.35, 0.35, 0.35, 1), 'MULTIPLY'))
        c = mixc(nt, math_(nt, 'MULTIPLY', damp, 0.6), c, mixc(nt, 1.0, c, (0.5, 0.5, 0.52, 1), 'MULTIPLY'))
        c = mixc(nt, puddle, c, col('#151719'))
        rough = mixf(nt, damp, math_(nt, 'MULTIPLY_ADD', t['rough'], 0.22, 0.22), 0.10)
        rough = mixf(nt, puddle, rough, 0.012)
        nb = bump(nt, math_(nt, 'ADD', t['disp'], math_(nt, 'MULTIPLY', joint, -0.5)), 0.008, mixf(nt, puddle, 1.0, 0.0))
        bs = bsdf(nt, c, rough, 0.0, nb, spec=mixf(nt, puddle, 0.5, 0.6))
        L(nt, bs.outputs[0], out.inputs[0])
        return mat
    return _mat(name, b)


def mat_water(name='trk_water'):
    """Shallow puddle sheets: mirror-flat water where the mask says so, transparent elsewhere."""
    def b(name):
        mat, nt, out = _fresh(name)
        oc = coords(nt)
        pv = N(nt, 'ShaderNodeMapping', {'Vector': oc, 'Scale': (0.22, 1.3, 1.0)}).outputs[0]
        pn = N(nt, 'ShaderNodeTexNoise', {'Vector': pv, 'Scale': 1.6, 'Detail': 3.0, 'Roughness': 0.45}).outputs['Fac']
        m = mrange(nt, pn, 0.585, 0.60)
        rip = N(nt, 'ShaderNodeTexNoise', {'Vector': oc, 'Scale': 40.0, 'Detail': 2.0}).outputs['Fac']
        w = bsdf(nt, (0.02, 0.025, 0.03, 1), 0.02, 0.0, bump(nt, rip, 0.0006, 0.3), spec=0.5)
        L(nt, mixs(nt, m, N(nt, 'ShaderNodeBsdfTransparent').outputs[0], w.outputs[0]), out.inputs[0])
        return mat
    return _mat(name, b)


def mat_ice(name='trk_ice'):
    def b(name):
        mat, nt, out = _fresh(name)
        oc = coords(nt)
        n = N(nt, 'ShaderNodeTexNoise', {'Vector': oc, 'Scale': 30.0, 'Detail': 4.0}).outputs['Fac']
        g = bsdf(nt, (0.86, 0.94, 1.0, 1), mixf(nt, n, 0.03, 0.22), 0.0, bump(nt, n, 0.002, 0.6), Transmission_Weight=0.92, IOR=1.31)
        milky = bsdf(nt, (0.9, 0.95, 1.0, 1), 0.4, 0.0)
        L(nt, mixs(nt, 0.35, g.outputs[0], milky.outputs[0]), out.inputs[0])
        return mat
    return _mat(name, b)


def _prism(mb, plan, z0, z1, mat, z1b=None):
    """Vertical prism from a CCW plan polygon (list of (x, y)), bottom z0, top z1 (or per-vertex z1b)."""
    plan = np.asarray(plan, float)
    if (0.5 * np.sum(plan[:, 0] * np.roll(plan[:, 1], -1) - np.roll(plan[:, 0], -1) * plan[:, 1])) < 0:
        plan = plan[::-1]
        if z1b is not None:
            z1b = list(z1b)[::-1]
    n = len(plan)
    zt = np.asarray(z1b if z1b is not None else [z1] * n, float)
    V = np.concatenate([np.column_stack([plan, np.full(n, z0)]), np.column_stack([plan, zt])])
    F = [list(range(n))[::-1], list(range(n, 2 * n))]
    for i in range(n):
        j = (i + 1) % n
        F.append([i, j, n + j, n + i])
    mb.add(V, F, mat)


def _icicle(rng, length, r0):
    nring = 9
    t = np.linspace(0, 1, nring)
    r = r0 * (1 - t) ** 0.85 * (1 + 0.18 * np.sin(t * rng.uniform(14, 26) + rng.uniform(0, 6)))
    r[-1] = 0.0
    prof = [(float(rr), float(-tt * length)) for rr, tt in zip(r, t)]
    V, F = lathe_np(prof[::-1], 8)
    bend = rng.normal(0, 0.04, 2)
    V[:, 0] += bend[0] * (-V[:, 2] / max(length, 1e-3)) ** 2 * length
    V[:, 1] += bend[1] * (-V[:, 2] / max(length, 1e-3)) ** 2 * length
    return V, F


def _carve_snow(xa, xb, half_width=6.3):
    """Push already-built track/field snow below the surface inside a new underpass zone."""
    for o in bpy.data.objects:
        if o.type == 'MESH' and o.name.startswith('trk_tufts'):        # no grass under the deck
            me = o.data
            V = np.empty(len(me.vertices) * 3, np.float32); me.vertices.foreach_get('co', V); V = V.reshape(-1, 3)
            m = (V[:, 0] > xa - 1.0) & (V[:, 0] < xb + 1.0) & (np.abs(V[:, 1]) < half_width + 1.5)
            if m.any():
                V[m, 2] -= 100.0
                me.vertices.foreach_set('co', V.ravel()); me.update()
            continue
        if o.type != 'MESH' or not o.name.startswith(('trk_snow_', 'trk_fieldsnow_', 'trk_footsnow_')):
            continue
        me = o.data
        V = np.empty(len(me.vertices) * 3, np.float32); me.vertices.foreach_get('co', V); V = V.reshape(-1, 3)
        m = np.zeros(len(V))
        x = V[:, 0]
        m = np.maximum(m, _smooth((x - xa + 0.3) / 1.5) * _smooth((xb + 0.3 - x) / 1.5))
        m *= (np.abs(V[:, 1]) < half_width)
        if m.max() <= 0:
            continue
        V[:, 2] -= 0.30 * m
        me.vertices.foreach_set('co', V.ravel()); me.update()


def build_underpass(x_center, length=14.0, coll=None, lamp=True, fill=1.0, width=11.6):
    """Concrete road bridge over the track centred at x_center. See module docstring."""
    t0 = time.time()
    coll = _coll(coll, 'underpass')
    rng = np.random.default_rng(int(x_center * 10) % 9973 + 404)
    xc, Lh = x_center, length / 2
    W = width / 2              # inner wall faces at y = ±W
    SOF = 5.4                  # soffit
    xa, xb = xc - Lh - 0.3, xc + Lh + 0.3
    # register the zone (track snow built afterwards is thinned geometrically; materials go wet / snow-free)
    zs = [tuple(z) for z in bpy.context.scene.get(_ZONE_KEY, [])]
    k = len(zs) % 2
    zs.append((xa, xb, W)); bpy.context.scene[_ZONE_KEY] = [list(z) for z in zs[-2:]]
    _set_zone(k, xa, xb)
    _carve_snow(xa, xb, W + 0.5)
    # ---- abutments + cap beams + wing walls
    mbw = MB()
    for s in (-1, 1):
        y0, y1 = s * W, s * (W + 1.0)
        _prism(mbw, [(xa, y0), (xb, y0), (xb, y1), (xa, y1)], -1.1, 4.95, 0)
        _prism(mbw, [(xa - 0.05, s * (W - 0.28)), (xb + 0.05, s * (W - 0.28)), (xb + 0.05, s * (W + 1.0)), (xa - 0.05, s * (W + 1.0))],
               4.95, SOF - 0.06, 0)
        # wing walls: splay 30° away from the track, top following the road-embankment side slope
        for e in (-1, 1):
            xe = xb if e > 0 else xa
            ang = math.radians(30)
            ln = 7.5
            p0 = np.array([xe, s * W]); d = np.array([e * math.cos(ang), s * math.sin(ang)])
            nrm = np.array([-d[1], d[0]]) * (1 if (e * s) > 0 else -1)
            thick = 0.45
            a0 = p0; a1 = p0 + d * ln
            b0 = a0 + nrm * thick
            b1 = a1 + (b0 - a0)
            ztop0 = SOF + 0.6; ztop1 = max(0.2, SOF + 0.6 - ln * math.cos(ang) / 1.5)
            _prism(mbw, [tuple(a0), tuple(a1), tuple(b1), tuple(b0)], -1.1, 0, 0, z1b=[ztop0, ztop1, ztop1, ztop0])
    walls = mbw.obj('trk_abutments', coll, [mat_wall()], False, 0)
    # ---- deck: precast slab beams, bearings, cornices, parapets
    mbd = MB()
    nb = int(round(length / 1.0))
    bw = length / nb
    for i in range(nb):
        x = xc - Lh + (i + 0.5) * bw
        V, F = box_np(bw - 0.012, 2 * (W + 1.2), 0.62, (x, 0, SOF + 0.31), r=0.012, seg=2)
        mbd.add(V, F, 0)
        for s in (-1, 1):
            V, F = box_np(0.32, 0.28, 0.055, (x, s * (W + 0.25), SOF - 0.03), r=0.006, seg=1)
            mbd.add(V, F, 1)
    V, F = box_np(length + 0.6, 2 * (W + 1.6), 0.14, (xc, 0, SOF + 0.69), r=0.01, seg=1)
    mbd.add(V, F, 0)
    for e in (-1, 1):
        xe = xc + e * Lh
        # cornice with a drip nose
        V, F = box_np(0.55, 2 * (W + 2.2), 0.62, (xe + e * 0.0, 0, SOF + 0.48), r=0.02, seg=2)
        mbd.add(V, F, 0)
        V, F = box_np(0.06, 2 * (W + 2.2), 0.05, (xe + e * 0.24, 0, SOF + 0.155), r=0.008, seg=1)
        mbd.add(V, F, 0)
        # parapet with posts
        V, F = box_np(0.24, 2 * (W + 2.2), 1.05, (xe + e * 0.08, 0, SOF + 0.79 + 0.525), r=0.02, seg=2)
        mbd.add(V, F, 0)
        V, F = box_np(0.30, 2 * (W + 2.2) + 0.1, 0.10, (xe + e * 0.08, 0, SOF + 0.79 + 1.10), r=0.02, seg=2)
        mbd.add(V, F, 0)
    deck = mbd.obj('trk_deck', coll, [mat_soffit(), mat_plain('trk_bearing', '#1A1A1A', 0.7, 0.0, 0.0)], True, 30)
    # ---- snow caps on parapets / cornices / wing tops
    mbs = MB()
    for e in (-1, 1):
        xe = xc + e * Lh
        for (cx_, wdt, ztop) in ((xe + e * 0.08, 0.30, SOF + 0.79 + 1.15), (xe + e * 0.24, 0.12, SOF + 0.79)):
            ys = np.linspace(-(W + 2.2), W + 2.2, 160); xs_ = np.linspace(-wdt / 2, wdt / 2, 6)
            Y, X = np.meshgrid(ys, xs_, indexing='ij')
            th = (0.03 + 0.04 * (fbm(Y * 2 + e, X * 2, 3, 7) * 0.5 + 0.5)) * (1 - (2 * X / wdt) ** 4)
            Vv = np.column_stack([(cx_ + X).ravel(), Y.ravel(), (ztop + th).ravel()])
            Ff = _grid_faces(len(ys), len(xs_))[:, ::-1]
            mbs.add(Vv, Ff, 0)
    mbs.obj('trk_bridge_snow', coll, [mat_snow('trk_snow_cap', 2.0, 0.6, 0.0, True, 0.0)], True, 0)
    # ---- road embankment (snow) behind the abutments and wing walls
    tw = math.tan(math.radians(30))
    xs_ = np.concatenate([np.linspace(xc - Lh - 22, xa - 0.01, 60), np.linspace(xa, xb, 30), np.linspace(xb + 0.01, xc + Lh + 22, 60)])
    for s in (-1, 1):
        ys = np.concatenate([np.linspace(W - 0.4, 14, 70), np.linspace(14.5, 230, 60)]) * s
        X, Y = np.meshgrid(xs_, ys, indexing='ij')
        ay = np.abs(Y)
        H = np.where(ay < 30, SOF + 0.85, SOF + 0.85 - (ay - 30) / 200 * (SOF + 1.85))
        dxo = np.clip(np.abs(X - xc) - (Lh + 0.5), 0, None)
        Z = H - dxo / 1.5 + 0.06 * fbm(X * 0.3, Y * 0.3, 3, 9)
        front = ay < W + 0.6 + np.clip(np.abs(X - xc) - (Lh + 0.3), 0, None) * tw
        Z = np.where(front, -1.3, Z)
        Z = np.maximum(Z, field_z(X, Y) - 0.25)
        Vv = np.column_stack([X.ravel(), Y.ravel(), Z.ravel()])
        Ff = _grid_faces(len(xs_), len(ys))
        if s < 0:
            Ff = Ff[:, ::-1]
        mb = MB(); mb.add(Vv, Ff, 0)
        mb.obj('trk_road_embankment', coll, [mat_snow('trk_snow_field', 1.0, 1.0, 0.0, True, 1.0, 0.35)], True, 0)
    # ---- floor: aprons + drainage channels + puddle sheets
    mbf = MB()
    fx0, fx1 = xa - 3.0, xb + 3.0
    for s in (-1, 1):
        _prism(mbf, [(fx0, s * 2.62), (fx1, s * 2.62), (fx1, s * (W - 0.48)), (fx0, s * (W - 0.48))], -1.0, -0.70, 0)
        _prism(mbf, [(fx0, s * (W - 0.48)), (fx1, s * (W - 0.48)), (fx1, s * (W - 0.38)), (fx0, s * (W - 0.38))], -1.0, -0.72, 0)
        _prism(mbf, [(fx0, s * (W - 0.38)), (fx1, s * (W - 0.38)), (fx1, s * W), (fx0, s * W)], -1.0, -0.98, 0)
    floor = mbf.obj('trk_apron', coll, [mat_apron()], False, 0)
    mbw2 = MB()
    for s in (-1, 1):
        _prism(mbw2, [(fx0, s * (W - 0.38)), (fx1, s * (W - 0.38)), (fx1, s * (W - 0.01)), (fx0, s * (W - 0.01))], -1.0, -0.93, 0)
    gx = np.linspace(xa - 1.0, xb + 1.0, 80); gy = np.linspace(-0.62, 0.62, 12)
    GX, GY = np.meshgrid(gx, gy, indexing='ij')
    mbw2.add(np.column_stack([GX.ravel(), GY.ravel(), np.full(GX.size, CRIB_Z + 0.006)]), _grid_faces(len(gx), len(gy)), 1)
    for s in (-1, 1):
        GX, GY = np.meshgrid(gx, np.linspace(s * 2.64, s * (W - 0.5), 8), indexing='ij')
        F_ = _grid_faces(len(gx), 8)
        mbw2.add(np.column_stack([GX.ravel(), GY.ravel(), np.full(GX.size, -0.697)]), F_ if s > 0 else F_[:, ::-1], 1)
    mbw2.obj('trk_puddles', coll, [principled('trk_channel_water', '#0B0D0F', 0.03, spec=0.6), mat_water()], False, 0)
    # ---- icicles (cornice drip noses + cap-beam edges)
    mbi = MB()
    for e in (-1, 1):
        xe = xc + e * (Lh + 0.24)
        for y in np.arange(-(W + 2.1), W + 2.1, 0.07):
            if rng.random() < 0.55:
                continue
            ln = float(np.clip(rng.lognormal(math.log(0.16), 0.75), 0.03, 0.85))
            V, F = _icicle(rng, ln, rng.uniform(0.008, 0.022) * (0.6 + ln))
            mbi.add(V + (xe + rng.normal(0, 0.008), y + rng.normal(0, 0.02), SOF + 0.13), F, 0)
    for s in (-1, 1):
        for x in np.arange(xa, xb, 0.18):
            if rng.random() < 0.88:
                continue
            ln = float(np.clip(rng.lognormal(math.log(0.06), 0.5), 0.02, 0.18))
            V, F = _icicle(rng, ln, rng.uniform(0.006, 0.014) * (0.6 + ln))
            mbi.add(V + (x, s * (W - 0.27), 4.95), F, 0)
    icicles = mbi.obj('trk_icicles', coll, [mat_ice()], True, 0)
    # ---- caged wall lamp (blue-white practical) on the +y wall
    lamp_o = None
    if lamp:
        lx, ly, lz = xc + 3.2, W - 0.02, 3.35
        mbl = MB()
        V, F = box_np(0.20, 0.03, 0.30, (lx, ly - 0.015, lz), r=0.01, seg=1); mbl.add(V, F, 0)
        V, F = lathe_np([(0.0, 0.0), (0.075, 0.0), (0.085, 0.03), (0.085, 0.05), (0.0, 0.05)], 24, 'y')
        V[:, 1] = -V[:, 1]; F = [f[::-1] for f in F]; mbl.add(V + (lx, ly - 0.03, lz), F, 0)
        V, F = lathe_np([(0.0, 0.0), (0.066, 0.0), (0.068, 0.07), (0.058, 0.13), (0.03, 0.155), (0.0, 0.16)], 24, 'y')
        V[:, 1] = -V[:, 1]; F = [f[::-1] for f in F]; mbl.add(V + (lx, ly - 0.08, lz), F, 1)
        for a in np.linspace(0, 2 * math.pi, 6, endpoint=False):
            P = np.array([(math.cos(a) * 0.078, -0.08 - t * 0.17 * 0.95, math.sin(a) * 0.078 * (1 - t ** 3)) for t in np.linspace(0, 1, 8)])
            P[:, 0] *= (1 - np.linspace(0, 1, 8) ** 3 * 0.6)
            V, F = tube_np(P + (lx, ly, lz), 0.004, 5); mbl.add(V, F, 0)
        for rr, yy in ((0.08, -0.12), (0.072, -0.19)):
            th = np.linspace(0, 2 * math.pi, 25)
            P = np.column_stack([np.cos(th) * rr, np.full(25, yy), np.sin(th) * rr]) + (lx, ly, lz)
            V, F = tube_np(P, 0.0035, 5, closed_ends=False); mbl.add(V, F, 0)
        P = np.array([(lx, ly - 0.03, lz + 0.15), (lx, ly - 0.03, lz + 0.35), (lx + 0.05, ly - 0.03, lz + 0.5), (lx + 0.05, ly - 0.03, 4.9)])
        V, F = tube_np(catmull(P, 6), 0.012, 8); mbl.add(V, F, 0)
        V, F = box_np(0.16, 0.08, 0.20, (lx + 0.05, ly - 0.04, 4.6), r=0.01, seg=1); mbl.add(V, F, 0)
        glass_m = bpy.data.materials.get('trk_lamp_glass')
        if glass_m is None:
            glass_m, nt, out = _fresh('trk_lamp_glass')
            em = N(nt, 'ShaderNodeEmission', {'Color': srgb('#D6E6FF'), 'Strength': 28.0})
            L(nt, mixs(nt, 0.15, em.outputs[0], N(nt, 'ShaderNodeBsdfGlass', {'Roughness': 0.15}).outputs[0]), out.inputs[0])
        mbl.obj('trk_lamp', coll, [mat_dark('trk_lamp_metal', '#3B4148', 0.45, 0.6, 0.6, 0.0), glass_m], True, 30)
        lamp_o = _point('trk_lamp_light', (lx, ly - 0.16, lz), 70.0, '#CFE2FF', 0.05, coll)
    # ---- blue fill: sky light pouring in through both openings + snow bounce under the deck
    fills = []
    if fill > 0:
        for e in (-1, 1):
            fills.append(_area('trk_fill_opening', (xc + e * (Lh + 6.0), 0.0, 4.2), (xc, 0.0, 1.0), 10.0, 2000 * fill, '#6F9BD0',
                               size_y=6.0, coll=coll))
        fills.append(_area('trk_fill_soffit', (xc, 0.0, SOF - 0.05), (xc, 0.0, -1.0), 10.0, 420 * fill, '#5D86B8', size_y=2 * W - 1.0, coll=coll))
        fills.append(_area('trk_fill_floor', (xc, 0.0, -0.45), (xc, 0.0, 6.0), 10.0, 260 * fill, '#4E7AAE', size_y=2 * W - 1.0, coll=coll))
        for f in fills:
            f.visible_camera = False
    print(f'[track] build_underpass({x_center}) {time.time() - t0:.1f}s', flush=True)
    return dict(walls=[walls], deck=deck, floor=floor, lamp=lamp_o, icicles=icicles, coll=coll, zone=(xa, xb))


# ============================================================================= stand-ins for the review stills
def mat_wheel(name='trk_wheel'):
    def b(name):
        mat, nt, out = _fresh(name)
        oc = coords(nt)
        sep = N(nt, 'ShaderNodeSeparateXYZ', {0: oc})
        rr = math_(nt, 'SQRT', math_(nt, 'ADD', math_(nt, 'MULTIPLY', sep.outputs[0], sep.outputs[0]),
                                          math_(nt, 'MULTIPLY', sep.outputs[2], sep.outputs[2])))
        tread = mrange(nt, rr, 0.449, 0.452)
        t = tex(nt, 'rusty_metal_04', oc, 6.0)
        grime = mixc(nt, 0.8, t['diff'], col('#1C1612'), 'MULTIPLY')
        sv = N(nt, 'ShaderNodeMapping', {'Vector': oc, 'Scale': (1.0, 300.0, 1.0)}).outputs[0]
        streak = N(nt, 'ShaderNodeTexNoise', {'Vector': sv, 'Scale': 1.0, 'Detail': 6.0}).outputs['Fac']
        steel = mixc(nt, streak, col('#A9ACB0'), col('#CFD2D6'))
        c = mixc(nt, tread, grime, steel)
        bs = bsdf(nt, c, mixf(nt, tread, math_(nt, 'MULTIPLY_ADD', t['rough'], 0.3, 0.55), math_(nt, 'MULTIPLY_ADD', streak, 0.12, 0.08)),
                  mixf(nt, tread, 0.3, 1.0), bump(nt, t['disp'], 0.002, mixf(nt, tread, 1.0, 0.0)))
        L(nt, bs.outputs[0], out.inputs[0])
        return mat
    return _mat(name, b)


def standin_wheel(x, side=-1, coll=None, axle=True):
    """Stand-in steel wheel (r = 0.4575 at the taping line, 28 mm flange) rolling on the rail at x."""
    prof = [(0.0, 0.16), (0.085, 0.16), (0.085, 0.145), (0.125, 0.145), (0.135, 0.12), (0.25, 0.088), (0.392, 0.112),
            (0.422, 0.135), (0.4505, 0.135), (0.4535, 0.131), (0.4575, 0.070), (0.4595, 0.046), (0.4655, 0.036),
            (0.4790, 0.022), (0.4855, 0.012), (0.4855, 0.006), (0.4800, 0.0), (0.400, 0.0), (0.372, 0.018),
            (0.250, 0.048), (0.150, 0.0), (0.130, -0.03), (0.095, -0.03), (0.095, -0.66 if axle else -0.04), (0.0, -0.66 if axle else -0.04)]
    V, F = lathe_np(prof[::-1], 72, 'y')
    # local +y = outward (field side); back face at y = 0
    if side < 0:
        V[:, 1] = -V[:, 1]
        F = [f[::-1] for f in F]
    mb = MB(); mb.add(V, F, 0)
    o = mb.obj('trk_wheel', _coll(coll, 'standins'), [mat_wheel()], True, 30)
    o.location = (x, side * (1.353 / 2), 0.4575)
    return o


def standin_window_band(x0, x1, y=1.5, z=2.5, coll=None, strength=6.0, facing=1, lamp_w=900.0):
    """Stand-in lit train side (window light band): a dark car-side panel at y with 1.0 x 0.9 m window openings
    every 1.9 m centred at height z, glowing tungsten panes (emissive but light-transmitting) and one warm lamp
    behind each window, so the light leaves through the openings and forms window-shaped pools outside."""
    coll = _coll(coll, 'standins')
    xc = np.arange(x0 + 0.95, x1 - 0.5, 1.9)
    # car side with holes: build as a grid of panels around the windows
    mb = MB()
    zt, zb = z + 1.2, z - 1.25
    t = 0.05
    yy = y - facing * t / 2
    edges = [x0] + sum([[x - 0.5, x + 0.5] for x in xc], []) + [x1]
    for a, b_ in zip(edges[0::2], edges[1::2]):        # piers between windows (full height)
        V, F = box_np(b_ - a, t, zt - zb, ((a + b_) / 2, yy, (zt + zb) / 2)); mb.add(V, F, 0)
    for x in xc:                                       # above / below each window
        V, F = box_np(1.0, t, zt - (z + 0.45), (x, yy, (zt + z + 0.45) / 2)); mb.add(V, F, 0)
        V, F = box_np(1.0, t, (z - 0.45) - zb, (x, yy, (z - 0.45 + zb) / 2)); mb.add(V, F, 0)
    V, F = box_np(x1 - x0, 2.9, zb - 0.55, ((x0 + x1) / 2, y - facing * 1.45, (zb + 0.55) / 2)); mb.add(V, F, 0)   # underframe
    mb.obj('trk_window_backing', coll, [principled('trk_backing', '#0E1712', 0.8)], False, 0)
    mat, nt, out = _fresh('trk_standin_window')
    em = N(nt, 'ShaderNodeEmission', {'Color': srgb(PAL['tungsten']), 'Strength': strength})
    add = N(nt, 'ShaderNodeAddShader')
    L(nt, N(nt, 'ShaderNodeBsdfTransparent').outputs[0], add.inputs[0]); L(nt, em.outputs[0], add.inputs[1])
    L(nt, add.outputs[0], out.inputs[0])
    mbp = MB()
    for x in xc:
        V = np.array([(x - 0.5, yy, z - 0.45), (x + 0.5, yy, z - 0.45), (x + 0.5, yy, z + 0.45), (x - 0.5, yy, z + 0.45)])
        mbp.add(V, [[0, 1, 2, 3] if facing < 0 else [3, 2, 1, 0]], 0)
        _spot('trk_window_lamp', (x, y - facing * 2.55, z + 1.0), (x, y + facing * 2.4, -0.75), lamp_w, PAL['tungsten'],
              46, 0.30, 0.12, coll)
    o = mbp.obj('trk_window_band', coll, [mat], False, 0)
    o.visible_shadow = False
    # interior: warm ceiling + far wall so the windows read as a lit carriage
    V, F = box_np(x1 - x0, 0.05, zt - zb, ((x0 + x1) / 2, y - facing * 2.9, (zt + zb) / 2)); mbi = MB(); mbi.add(V, F, 0)
    V, F = box_np(x1 - x0, 3.0, 0.05, ((x0 + x1) / 2, y - facing * 1.5, zt)); mbi.add(V, F, 0)
    V, F = box_np(x1 - x0, 3.0, 0.05, ((x0 + x1) / 2, y - facing * 1.5, zb)); mbi.add(V, F, 0)
    mbi.obj('trk_window_interior', coll, [principled('trk_interior', '#C9A57E', 0.7)], False, 0)
    return o


def _area(name, loc, look, size, energy, color, shape='RECTANGLE', size_y=None, coll=None):
    d = bpy.data.lights.new(name, 'AREA'); d.energy = energy; d.color = col(color)[:3]
    d.shape = shape; d.size = size; d.size_y = size_y or size
    o = bpy.data.objects.new(name, d); _coll(coll, 'lights').objects.link(o)
    o.location = loc; aim(o, look)
    return o


def _spot(name, loc, look, energy, color, angle=40, blend=0.6, radius=0.3, coll=None):
    d = bpy.data.lights.new(name, 'SPOT'); d.energy = energy; d.color = col(color)[:3]
    d.spot_size = math.radians(angle); d.spot_blend = blend; d.shadow_soft_size = radius
    o = bpy.data.objects.new(name, d); _coll(coll, 'lights').objects.link(o)
    o.location = loc; aim(o, look)
    return o


def _point(name, loc, energy, color, radius=0.05, coll=None):
    d = bpy.data.lights.new(name, 'POINT'); d.energy = energy; d.color = col(color)[:3]; d.shadow_soft_size = radius
    o = bpy.data.objects.new(name, d); _coll(coll, 'lights').objects.link(o)
    o.location = loc
    return o


def _test_render(res=(960, 540), samples=48):
    setup_render(res, samples)
    sc = bpy.context.scene
    sc.render.threads_mode = 'FIXED'; sc.render.threads = 2
    sc.cycles.use_adaptive_sampling = True
    sc.cycles.adaptive_threshold = 0.02


def _luma(path):
    img = bpy.data.images.load(path, check_existing=False)
    px = np.empty(len(img.pixels), np.float32); img.pixels.foreach_get(px)
    px = px.reshape(-1, 4)
    # pixels are linear for PNG? Blender stores display-referred sRGB bytes as float 0–1 for 8-bit PNGs
    y = 0.2126 * px[:, 0] + 0.7152 * px[:, 1] + 0.0722 * px[:, 2]
    bpy.data.images.remove(img)
    return float(y.mean() * 255)


# ============================================================================= review stills
def _cam(loc, look, lens, fstop=None, focus=None):
    c = camera('cam', loc, look, lens=lens, fstop=fstop, focus=focus)
    c.data.clip_end = 20000.0
    c.data.clip_start = 0.02
    return c


def _finish(name, res, samples, t_build):
    _test_render(res, samples)
    out = f'{SCRATCH}/{name}.png'
    t1 = time.time()
    render_still(out)
    tr = time.time() - t1
    print(f'[track] {name}: build {t_build:.1f}s  render {tr:.1f}s  mean luma {_luma(out):.1f}  -> {out}', flush=True)
    return out


def shot_joint(res=(960, 540), samples=64):
    """joint_macro.png — 0.4 m above the rail, 0.6 m from the joint, 50 mm f/2.8, stand-in wheel past the joint."""
    reset(); t0 = time.time()
    build_track(-9, 13, lod='hero')
    build_field(-250, 400, pole_x=(-150, 400))
    standin_wheel(0.52, -1)
    snowfall((1.2, -0.9, 0.9), (4.0, 3.0, 2.4), 1.2, seed=3)
    night_world('plain', strength=1.7, moon_azimuth=117, moon_elevation=24, disc=False)
    # warm window spill from a carriage passing on the camera side: the accent that makes the rust and bolts read
    _spot('trk_spill', (-1.1, -2.6, 1.9), (0.05, -0.80, -0.10), 380, PAL['tungsten'], 26, 0.85, 0.5)
    from mathutils import Vector
    loc = (-0.52, -1.05, 0.40)
    c = _cam(loc, (0.22, -0.70, -0.04), 50, 2.8)
    c.data.dof.focus_distance = (Vector(loc) - Vector((0.0, -0.80, -0.06))).length
    return _finish('joint_macro', res, samples, time.time() - t0)


def shot_plain(res=(960, 540), samples=48):
    """plain_wide.png — 2 m above the rail head, looking down the line to the horizon, 35 mm, falling snow."""
    reset(); t0 = time.time()
    build_track(8, 110, lod='hero')
    build_track(110, 1800, lod='mid'); build_track(-300, 8, lod='mid')
    build_field(-300, 1800, pole_x=(-100, 1800))
    snowfall((52, 0, 5.5), (60, 20, 12), 1.6)
    night_world('plain', moon_azimuth=101, moon_elevation=11)
    _cam((22.0, -0.9, 2.0), (84.0, 0.2, 0.9), 35)
    return _finish('plain_wide', res, samples, time.time() - t0)


def shot_underpass(res=(960, 540), samples=48):
    """underpass.png — inside the bridge looking along the track, stand-in window band (y = 1.5, z ≈ 2.5, 20 m)."""
    reset(); t0 = time.time()
    build_underpass(0.0, 14.0)
    build_track(-30, 45, lod='hero')
    build_track(45, 700, lod='mid'); build_track(-300, -30, lod='mid')
    build_field(-250, 700, pole_x=(-150, 700))
    standin_window_band(-10.0, 10.0, 1.5, 2.5)
    snowfall((14.0, 0.0, 4.0), (14.0, 12.0, 8.0), 1.2, seed=2)
    night_world('underpass', moon_azimuth=100, moon_elevation=20)
    _cam((-4.6, 4.35, 1.7), (9.0, 2.3, -0.55), 18)
    return _finish('underpass', res, samples, time.time() - t0)


def shot_embankment(res=(960, 540), samples=48):
    """embankment.png — low 3/4 side view of the track on its embankment, field + tree lines + moon behind."""
    reset(); t0 = time.time()
    build_track(0, 50, lod='hero')
    build_track(50, 900, lod='mid'); build_track(-900, 0, lod='mid')
    build_field(-600, 600, pole_x=(-400, 400))
    snowfall((20.0, -6.0, 3.0), (30.0, 14.0, 8.0), 1.0, seed=4)
    night_world('plain', moon_azimuth=152, moon_elevation=18)
    _cam((15.0, -9.5, 0.45), (24.0, 0.0, 0.45), 28)
    return _finish('embankment', res, samples, time.time() - t0)


if __name__ == '__main__':
    os.makedirs(SCRATCH, exist_ok=True)
    which = sys.argv[1:] or ['all']
    shots = dict(joint=shot_joint, plain=shot_plain, underpass=shot_underpass, embankment=shot_embankment)
    for k, f in shots.items():
        if 'all' in which or k in which:
            f()
