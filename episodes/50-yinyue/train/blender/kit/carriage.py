"""kit/carriage.py — the green carriage exterior (绿皮车): a Chinese 22/25B-type 硬座 passenger car with
bogies and wheelsets, for 《开往零点的列车》.

World conventions: metres, Z up, track along +X centred on y = 0, rail top z = 0, the train runs toward +X.
A car's local origin is the car centre at rail-top height (see common.py).

API
---
build_carriage(name='car', x=0.0, coll=None, lod='hero', number=None, standin=False) -> dict
    Builds one car centred at (x, 0, 0). Returns a dict:
      'root'          Empty at (x, 0, 0); parent of everything (move / animate this).
      'body'          main shell object (green painted steel, real window + door openings).
      'wheels'        list of 4 wheelset objects (axle + both wheels); each spins about its local Y
                      (use spin_wheels). Children of the bogies.
      'bogies'        list of 2 bogie objects (leading bogie at local x = +9.0 first).
      'glass'         list of window-glass objects: 22 side windows (L00..L10 on -Y, R00..R10 on +Y, each
                      placed at its window centre), then one object holding the 4 entry-door and 2
                      end-door windows. Thin single-sided panes, UV 0..1 per window (dirt/frost corners).
      'plaque_anchor' Empty on the -Y side below the window of bay 5 (x = 0), z = 1.72, 6 mm off the
                      side: the 水牌 board's centre. The board lies in the anchor's local XZ plane and
                      its front faces -Y (anchor rotation is identity).
      'window_bays'   list of the 11 bay-centre x values (car-local): (i - 5) * 1.9.
      'doors', 'parts' (name -> object), 'lod', 'name', 'number'   (extras)
    lod='hero': full detail (springs, brakes, hoses, ventilators, gutter snow, ...).
    lod='mid' : light version for distant cars (simple bogies, plain roof, no underframe clutter).
    number: car number painted on the side (default derived from the name).
    standin: also build the test-only warm interior stand-in (see standin_interior).
spin_wheels(car, distance_m) -> None
    Sets every wheelset's rotation for a travelled distance: rotation_euler.y = distance_m / 0.4575
    (positive distance = rolling toward +X). Keyframe it yourself if you animate.
build_train(n_cars=6, x_front=0.0, coll=None, lods=None, standin=False) -> list of car dicts
    Car i is centred at x_front - 25.5 * i (cars coupled nose to tail along -X); the gangway bellows
    and couplers of neighbours meet at the coupler planes. lods: None (first car 'hero', the rest
    'mid'), a single lod string, or a list per car.
standin_interior(car, coll=None) -> list of objects
    Test-only interior stand-in (floor, seat backs with white covers, tables, emissive ceiling lamps,
    warm back panel and area lights) so windows glow tungsten #FFB46A. The real interior module
    replaces it.

Run this file to build the test scenes and render the four review stills:
    /home/user/venv-bpy/bin/python kit/carriage.py [three_quarter bogie_macro flank train_wide]
        [--samples N] [--res 960x540]
"""
import bpy, bmesh, math, random, os, sys, time
from mathutils import Vector, Matrix, noise as mnoise

sys.path.insert(0, '/home/user/Video/episodes/50-yinyue/train/blender')
from common import *  # noqa: F401,F403
import common as _C

# ---------------------------------------------------------------- dimensions (metres)
HALF = 12.25                       # half body length
W_OUT, W_IN = 1.55, 1.47           # outer / inner side faces
FLOOR = 1.28
SKIRT = 1.00                       # bottom edge of the body side
BAYS = [(i - 5) * 1.9 for i in range(11)]
WIN_W, WIN_H, WIN_ZC, WIN_R = 1.0, 0.9, 2.50, 0.08
DOOR_X, DOOR_W, DOOR_Z0, DOOR_Z1 = 11.55, 0.72, 0.95, 3.22
WHEEL_R = 0.4575
BOGIE_X, WB = 9.0, 1.2
CAR_PITCH = 25.5
OUT_DIR = '/tmp/claude-0/-home-user-Video/ca950e1c-26f8-5f17-9c2a-78a6336a8884/scratchpad/kit/carriage'


# ================================================================ mesh building
class MB:
    """Accumulates verts / faces / material indices / optional per-loop UVs, then makes one mesh."""

    def __init__(self):
        self.v, self.f, self.m, self.uv = [], [], [], []

    def add(self, verts, faces, mat=0, uvs=None):
        o = len(self.v)
        self.v.extend(tuple(p) for p in verts)
        for i, f in enumerate(faces):
            self.f.append(tuple(o + k for k in f))
            self.m.append(mat if isinstance(mat, int) else mat[i])
            self.uv.append(None if uvs is None else uvs[i])
        return self

    def mesh(self, name, smooth_angle=35.0, recalc=True):
        me = bpy.data.meshes.new(name)
        me.from_pydata(self.v, [], self.f)
        me.polygons.foreach_set('material_index', self.m)
        if any(u is not None for u in self.uv):
            uvl = me.uv_layers.new(name='UVMap')
            for p, u in zip(me.polygons, self.uv):
                for k in range(p.loop_total):
                    uvl.data[p.loop_start + k].uv = u[k] if u else (0.0, 0.0)
        me.update()
        if recalc:
            bm = bmesh.new(); bm.from_mesh(me)
            bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
            bm.to_mesh(me); bm.free()
        me.shade_smooth()
        if smooth_angle:
            me.set_sharp_from_angle(angle=math.radians(smooth_angle))
        return me


def _xz(u, v, w):        # plane XZ, depth along Y
    return (u, w, v)


def _yz(u, v, w):        # plane YZ, depth along X
    return (w, u, v)


def rrect(cx, cy, w, h, r, seg=6):
    """Closed CCW rounded rectangle path [(u, v)]. r: radius or (bl, br, tr, tl)."""
    rs = r if isinstance(r, (tuple, list)) else (r, r, r, r)
    hw, hh = w / 2, h / 2
    pts = []
    for (px, py, rr, a0) in ((cx - hw, cy - hh, rs[0], 180), (cx + hw, cy - hh, rs[1], 270),
                             (cx + hw, cy + hh, rs[2], 0), (cx - hw, cy + hh, rs[3], 90)):
        if rr <= 1e-6:
            pts.append((px, py)); continue
        ccx = px + (rr if px < cx else -rr); ccy = py + (rr if py < cy else -rr)
        for k in range(seg + 1):
            a = math.radians(a0 + 90 * k / seg)
            pts.append((ccx + rr * math.cos(a), ccy + rr * math.sin(a)))
    return pts


def prism(mb, poly, w0, w1, to3=_xz, mat=0):
    n = len(poly)
    verts = [to3(u, v, w0) for u, v in poly] + [to3(u, v, w1) for u, v in poly]
    faces = [tuple(range(n))[::-1], tuple(range(n, 2 * n))]
    faces += [(i, (i + 1) % n, n + (i + 1) % n, n + i) for i in range(n)]
    mb.add(verts, faces, mat)


def bx(mb, size, c, mat=0):
    sx, sy, sz = (s / 2 for s in size)
    x, y, z = c
    v = [(x - sx, y - sy, z - sz), (x + sx, y - sy, z - sz), (x + sx, y + sy, z - sz), (x - sx, y + sy, z - sz),
         (x - sx, y - sy, z + sz), (x + sx, y - sy, z + sz), (x + sx, y + sy, z + sz), (x - sx, y + sy, z + sz)]
    f = [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)]
    mb.add(v, f, mat)


def bx2(mb, lo, hi, mat=0):
    bx(mb, [h - l for l, h in zip(lo, hi)], [(l + h) / 2 for l, h in zip(lo, hi)], mat)


def _path_normals(path):
    N = len(path)
    out = []
    for i in range(N):
        p0, p1, p2 = Vector(path[i - 1]), Vector(path[i]), Vector(path[(i + 1) % N])
        e1 = (p1 - p0).normalized(); e2 = (p2 - p1).normalized()
        n1 = Vector((e1.y, -e1.x)); n2 = Vector((e2.y, -e2.x))
        nn = (n1 + n2).normalized()
        out.append(nn / max(0.35, nn.dot(n1)))
    return out


def sweep(mb, path, section, to3=_xz, mat=0, closed_section=True, closed_path=True):
    """Sweep a 2D section [(n, w)] (n = outward offset from the path, w = depth) along a CCW path."""
    nr = _path_normals(path)
    N, S = len(path), len(section)
    verts = [to3(path[i][0] + n * nr[i].x, path[i][1] + n * nr[i].y, w) for i in range(N) for (n, w) in section]
    faces, mats = [], []
    for i in range(N if closed_path else N - 1):
        j = (i + 1) % N
        for k in range(S if closed_section else S - 1):
            k2 = (k + 1) % S
            faces.append((i * S + k, j * S + k, j * S + k2, i * S + k2))
            mats.append(mat if isinstance(mat, int) else mat[k])
    mb.add(verts, faces, mats)


def revolve(mb, prof, seg, to3, mat=0, closed=True, a0=0.0, a1=None, caps=False):
    """Revolve a profile [(axial, radius)] around an axis; to3(axial, radius, angle) -> xyz.
    mat: int or per-profile-segment list. a0..a1: partial sweep (caps closes the ends)."""
    full = a1 is None
    P = len(prof)
    nseg = seg if full else seg + 1
    span = 2 * math.pi if full else (a1 - a0)
    verts = [to3(a, r, a0 + span * i / seg) for i in range(nseg) for (a, r) in prof]
    faces, mats = [], []
    for i in range(seg):
        j = (i + 1) % nseg if full else i + 1
        for k in range(P if closed else P - 1):
            k2 = (k + 1) % P
            faces.append((i * P + k, j * P + k, j * P + k2, i * P + k2))
            mats.append(mat if isinstance(mat, int) else mat[k])
    if caps and not full:
        faces.append(tuple(range(P))[::-1]); mats.append(mats[0])
        faces.append(tuple((nseg - 1) * P + k for k in range(P))); mats.append(mats[0])
    mb.add(verts, faces, mats)


def to_y(cx, cy, cz, side=1):
    """to3 for revolving around a Y-parallel axis through (cx, cy, cz); axial grows along side*Y."""
    return lambda a, r, t: (cx + r * math.sin(t), cy + side * a, cz + r * math.cos(t))


def to_x(cx, cy, cz, side=1):
    return lambda a, r, t: (cx + side * a, cy + r * math.cos(t), cz + r * math.sin(t))


def cyl(mb, p0, p1, r, seg=16, mat=0, caps=True):
    p0, p1 = Vector(p0), Vector(p1)
    d = p1 - p0
    ax = d.normalized()
    u = ax.orthogonal().normalized(); v = ax.cross(u)
    ring = [(math.cos(2 * math.pi * i / seg), math.sin(2 * math.pi * i / seg)) for i in range(seg)]
    verts = [p0 + r * (c * u + s * v) for c, s in ring] + [p1 + r * (c * u + s * v) for c, s in ring]
    faces = [(i, (i + 1) % seg, seg + (i + 1) % seg, seg + i) for i in range(seg)]
    if caps:
        faces += [tuple(range(seg))[::-1], tuple(range(seg, 2 * seg))]
    mb.add(verts, faces, mat)


def tube(mb, pts, r, seg=8, mat=0, caps=True):
    """Tube along a 3D polyline with parallel-transport frames."""
    P = [Vector(p) for p in pts]
    n = len(P)
    T = []
    for i in range(n):
        a = P[min(i + 1, n - 1)] - P[max(i - 1, 0)]
        T.append(a.normalized())
    nrm = T[0].orthogonal().normalized()
    verts = []
    for i in range(n):
        if i > 0:
            b = T[i - 1].cross(T[i])
            if b.length > 1e-8:
                ang = math.acos(max(-1.0, min(1.0, T[i - 1].dot(T[i]))))
                nrm = Matrix.Rotation(ang, 3, b.normalized()) @ nrm
        bv = T[i].cross(nrm)
        rr = r(i / (n - 1)) if callable(r) else r
        for k in range(seg):
            a = 2 * math.pi * k / seg
            verts.append(P[i] + rr * (math.cos(a) * nrm + math.sin(a) * bv))
    faces = []
    for i in range(n - 1):
        for k in range(seg):
            k2 = (k + 1) % seg
            faces.append((i * seg + k, (i + 1) * seg + k, (i + 1) * seg + k2, i * seg + k2))
    if caps:
        faces += [tuple(range(seg))[::-1], tuple((n - 1) * seg + k for k in range(seg))]
    mb.add(verts, faces, mat)


def bez(p0, c0, c1, p1, n=16):
    p0, c0, c1, p1 = map(Vector, (p0, c0, c1, p1))
    out = []
    for i in range(n):
        t = i / (n - 1)
        out.append(((1 - t) ** 3) * p0 + 3 * ((1 - t) ** 2) * t * c0 + 3 * (1 - t) * t * t * c1 + t ** 3 * p1)
    return out


def coil(mb, cx, cy, z0, z1, R, wr, turns, seg=8, per=18, mat=0):
    """Helical compression spring with closed (flattened) end coils."""
    N = int(per * turns)
    pts = []
    for i in range(N + 1):
        u = i / N
        t = 2 * math.pi * turns * u
        zf = u - 0.8 * math.sin(2 * math.pi * u) / (2 * math.pi)
        pts.append((cx + R * math.cos(t), cy + R * math.sin(t), z0 + wr + (z1 - z0 - 2 * wr) * zf))
    tube(mb, pts, wr, seg, mat)


def _eval_mesh(obj):
    bpy.context.view_layer.update()
    dg = bpy.context.evaluated_depsgraph_get()
    ev = obj.evaluated_get(dg)
    return bpy.data.meshes.new_from_object(ev, preserve_all_data_layers=True, depsgraph=dg)


def _tmp(me):
    o = bpy.data.objects.new('_crg_tmp', me)
    bpy.context.scene.collection.objects.link(o)
    return o


def _apply_bevel(me, width, seg=2, angle=50.0):
    o = _tmp(me)
    m = o.modifiers.new('bevel', 'BEVEL')
    m.width = width; m.segments = seg; m.limit_method = 'ANGLE'; m.angle_limit = math.radians(angle)
    m.use_clamp_overlap = True; m.harden_normals = True
    new = _eval_mesh(o)
    bpy.data.objects.remove(o)
    name = me.name
    bpy.data.meshes.remove(me)
    new.name = name
    return new


def _boolean_diff(me, cutter_me):
    o = _tmp(me); c = _tmp(cutter_me)
    m = o.modifiers.new('cut', 'BOOLEAN'); m.operation = 'DIFFERENCE'; m.solver = 'EXACT'; m.object = c
    new = _eval_mesh(o)
    bpy.data.objects.remove(o); bpy.data.objects.remove(c)
    name = me.name
    bpy.data.meshes.remove(me); bpy.data.meshes.remove(cutter_me)
    new.name = name
    return new


def _cached(key, fn):
    me = bpy.data.meshes.get(key)
    if me is None:
        me = fn()
        me.name = key
    return me


def _set_mats(me, mats):
    idx = [0] * len(me.polygons)
    me.polygons.foreach_get('material_index', idx)
    me.materials.clear()          # (clearing the slots also wipes the face indices: restore them)
    for m in mats:
        me.materials.append(m)
    me.polygons.foreach_set('material_index', idx)
    me.update()
    return me


def _obj(name, me, coll, parent=None, loc=(0, 0, 0), rot=(0, 0, 0)):
    o = bpy.data.objects.new(name, me)
    coll.objects.link(o)
    if parent is not None:
        o.parent = parent
    o.location = loc
    o.rotation_euler = rot
    return o


# ================================================================ materials
def _sock(v):
    return isinstance(v, bpy.types.NodeSocket)


class G:
    """Tiny node-graph helper for one material."""

    def __init__(self, name):
        self.mat = bpy.data.materials.new(name)
        self.mat.use_nodes = True
        self.nt = self.mat.node_tree
        for n in list(self.nt.nodes):
            self.nt.nodes.remove(n)
        self.out = self.nt.nodes.new('ShaderNodeOutputMaterial')
        self._co = {}

    def L(self, a, b):
        self.nt.links.new(a, b)

    def set(self, node, key, val):
        s = node.inputs[key]
        if _sock(val):
            self.L(val, s)
        else:
            s.default_value = val

    def n(self, typ, ins=None, **props):
        node = self.nt.nodes.new(typ)
        for k, v in props.items():
            setattr(node, k, v)
        for k, v in (ins or {}).items():
            self.set(node, k, v)
        return node

    def m(self, op, a, b=0.0, c=None, clamp=False):
        node = self.nt.nodes.new('ShaderNodeMath'); node.operation = op; node.use_clamp = clamp
        self.set(node, 0, a); self.set(node, 1, b)
        if c is not None:
            self.set(node, 2, c)
        return node.outputs[0]

    def add(self, a, b, clamp=False): return self.m('ADD', a, b, clamp=clamp)
    def mul(self, a, b, clamp=False): return self.m('MULTIPLY', a, b, clamp=clamp)
    def sub(self, a, b, clamp=False): return self.m('SUBTRACT', a, b, clamp=clamp)

    def ss(self, x, e0, e1):
        """smoothstep x: e0 -> 0, e1 -> 1 (e0 > e1 allowed)."""
        if e0 > e1:
            return self.sub(1.0, self.ss(x, e1, e0))
        node = self.n('ShaderNodeMapRange', interpolation_type='SMOOTHSTEP', clamp=True)
        self.set(node, 'Value', x); node.inputs[1].default_value = e0; node.inputs[2].default_value = e1
        node.inputs[3].default_value = 0.0; node.inputs[4].default_value = 1.0
        return node.outputs[0]

    def lin(self, x, a, b, c=0.0, d=1.0, clamp=True):
        node = self.n('ShaderNodeMapRange', interpolation_type='LINEAR', clamp=clamp)
        self.set(node, 'Value', x)
        for i, v in zip((1, 2, 3, 4), (a, b, c, d)):
            self.set(node, i, v)
        return node.outputs[0]

    def mixc(self, fac, a, b, blend='MIX'):
        node = self.n('ShaderNodeMix', data_type='RGBA', blend_type=blend, clamp_result=False)
        self.set(node, 0, fac)
        node.inputs[6].default_value = a if not _sock(a) else (0, 0, 0, 1)
        node.inputs[7].default_value = b if not _sock(b) else (0, 0, 0, 1)
        if _sock(a): self.L(a, node.inputs[6])
        if _sock(b): self.L(b, node.inputs[7])
        return node.outputs[2]

    def mixf(self, fac, a, b):
        node = self.n('ShaderNodeMix', data_type='FLOAT', clamp_factor=True)
        self.set(node, 0, fac); self.set(node, 2, a); self.set(node, 3, b)
        return node.outputs[0]

    def mixs(self, fac, a, b):
        node = self.n('ShaderNodeMixShader')
        self.set(node, 0, fac); self.L(a, node.inputs[1]); self.L(b, node.inputs[2])
        return node.outputs[0]

    def coord(self, kind='Object'):
        if 'tc' not in self._co:
            self._co['tc'] = self.n('ShaderNodeTexCoord')
        return self._co['tc'].outputs[kind]

    def geo(self):
        if 'geo' not in self._co:
            self._co['geo'] = self.n('ShaderNodeNewGeometry')
        return self._co['geo']

    def sep(self, vec):
        node = self.n('ShaderNodeSeparateXYZ'); self.L(vec, node.inputs[0])
        return node.outputs

    def comb(self, x, y, z):
        node = self.n('ShaderNodeCombineXYZ')
        for i, v in enumerate((x, y, z)):
            self.set(node, i, v)
        return node.outputs[0]

    def vmap(self, vec, scale=(1, 1, 1), loc=(0, 0, 0), rot=(0, 0, 0)):
        node = self.n('ShaderNodeMapping'); self.L(vec, node.inputs['Vector'])
        node.inputs['Scale'].default_value = scale if isinstance(scale, (tuple, list)) else (scale,) * 3
        node.inputs['Location'].default_value = loc; node.inputs['Rotation'].default_value = rot
        return node.outputs[0]

    def noise(self, vec, scale=1.0, detail=2.0, rough=0.5, dist=0.0, dims='3D'):
        node = self.n('ShaderNodeTexNoise', noise_dimensions=dims)
        if vec is not None:
            self.L(vec, node.inputs['Vector'])
        node.inputs['Scale'].default_value = scale; node.inputs['Detail'].default_value = detail
        node.inputs['Roughness'].default_value = rough; node.inputs['Distortion'].default_value = dist
        return node.outputs['Fac']

    def img(self, path, vec, noncolor=False, proj='BOX', blend=0.25):
        node = self.n('ShaderNodeTexImage')
        node.image = bpy.data.images.load(path, check_existing=True)
        if noncolor:
            node.image.colorspace_settings.name = 'Non-Color'
        node.projection = proj; node.projection_blend = blend
        self.L(vec, node.inputs['Vector'])
        return node

    def ao(self, dist=0.15, samples=8):
        node = self.n('ShaderNodeAmbientOcclusion', samples=samples)
        node.inputs['Distance'].default_value = dist
        return node.outputs['AO']

    def edge(self, radius=0.01, samples=6):
        """1 on convex/concave hard edges (bevel-node trick)."""
        bv = self.n('ShaderNodeBevel', samples=samples); bv.inputs['Radius'].default_value = radius
        d = self.n('ShaderNodeVectorMath', operation='DOT_PRODUCT')
        self.L(bv.outputs[0], d.inputs[0]); self.L(self.geo().outputs['Normal'], d.inputs[1])
        return self.ss(d.outputs['Value'], 0.985, 0.85)

    def bsdf(self, color=(0.5, 0.5, 0.5, 1), rough=0.5, metal=0.0, **kw):
        b = self.n('ShaderNodeBsdfPrincipled')
        self.set(b, 'Base Color', srgb(color) if isinstance(color, str) else color)
        self.set(b, 'Roughness', rough); self.set(b, 'Metallic', metal)
        for k, v in kw.items():
            self.set(b, k, v)
        return b

    def bump(self, height, strength=1.0, dist=1.0, normal=None):
        b = self.n('ShaderNodeBump'); b.inputs['Strength'].default_value = strength
        b.inputs['Distance'].default_value = dist
        self.L(height, b.inputs['Height'])
        if normal is not None:
            self.L(normal, b.inputs['Normal'])
        return b.outputs[0]

    def normalmap(self, path, vec, strength=1.0):
        t = self.img(path, vec, True)
        nm = self.n('ShaderNodeNormalMap'); nm.inputs['Strength'].default_value = strength
        self.L(t.outputs['Color'], nm.inputs['Color'])
        return nm.outputs[0]

    def tinted(self, tex_node, tint, keep_rust=0.0):
        """Repaint a texture to `tint` keeping its value variation (like common.pbr)."""
        col = tex_node.outputs['Color']
        bw = self.n('ShaderNodeRGBToBW'); self.L(col, bw.inputs[0])
        var = self.m('DIVIDE', bw.outputs[0], _C._mean_lum(tex_node.image))
        out = self.mixc(1.0, srgb(tint) if isinstance(tint, str) else tint, self.comb(var, var, var), 'MULTIPLY')
        return out, var

    def top_snow(self, shader, amount=1.0, thresh=(0.55, 0.85), scale=9.0, mask_mul=None):
        """Dust fine snow onto upward-facing surfaces (snow caught on ledges): soft coverage regions
        (about 1/scale m across) filled with millimetre grain, densest where the surface faces straight up."""
        nz = self.sep(self.geo().outputs['Normal'])[2]
        up = self.ss(nz, thresh[0], thresh[1])
        co = self.coord('Object')
        cov = self.ss(self.add(self.noise(co, scale * 0.35, 2.0, 0.5), 0.25 * (amount - 0.6)), 0.40, 0.62)
        grain = self.ss(self.noise(co, scale * 9.0, 3.0, 0.7), 0.30, 0.62)
        mask = self.mul(self.mul(up, cov), self.mul(self.add(0.35, self.mul(grain, 0.65)), min(1.0, amount)))
        if mask_mul is not None:
            mask = self.mul(mask, mask_mul)
        sn = self.bsdf((0.80, 0.84, 0.88, 1), 0.55, **{'Subsurface Weight': 0.3, 'Subsurface Scale': 0.01})
        return self.mixs(self.mul(mask, 0.92, clamp=True), shader, sn.outputs[0])

    def done(self, shader):
        self.L(shader, self.out.inputs['Surface'])
        return self.mat


def _mat(name, fn):
    m = bpy.data.materials.get(name)
    return m if m is not None else fn(name)


def _m_paint(name, rivets=True):
    """Body paint: 墨绿 satin painted steel + yellow stripes, grime streaks, edge wear, rivets and seams."""
    g = G(name)
    t = ph_texture('green_metal_rust')
    co = g.coord('Object')
    xyz = g.sep(co); x, z = xyz[0], xyz[2]
    nrm = g.sep(g.coord('Normal'))
    side = g.ss(g.m('ABSOLUTE', nrm[1]), 0.6, 0.85)
    v1 = g.vmap(co, 0.55)
    v2 = g.vmap(co, 0.23, loc=(0.37, 0.11, 0.53), rot=(0, 0, 0.4))
    d1 = g.img(t['diff'], v1); d2 = g.img(t['diff'], v2)
    big = g.ss(g.noise(co, 0.35, 2.0), 0.42, 0.58)
    dcol = g.mixc(big, d1.outputs['Color'], d2.outputs['Color'])
    bw = g.n('ShaderNodeRGBToBW'); g.L(dcol, bw.inputs[0])
    var = g.m('DIVIDE', bw.outputs[0], _C._mean_lum(d1.image))
    var = g.lin(var, 0.0, 2.0, 0.55, 1.45)   # keep variation subtle
    varc = g.comb(var, var, var)
    green = g.mixc(1.0, srgb('#1D4C36'), varc, 'MULTIPLY')
    yellow = g.mixc(1.0, srgb('#D9A626'), varc, 'MULTIPLY')
    # keep the texture's rust spots (red > green in the source)
    sc = g.n('ShaderNodeSeparateColor'); g.L(dcol, sc.inputs[0])
    rust = g.ss(g.sub(sc.outputs['Red'], sc.outputs['Green']), -0.01, 0.06)
    rust = g.mul(rust, 0.85)
    # stripes (sides only)
    s1 = g.mul(g.ss(z, 1.913, 1.917), g.ss(z, 1.987, 1.983))
    s2 = g.mul(g.ss(z, 3.128, 3.132), g.ss(z, 3.172, 3.168))
    stripe = g.mul(g.add(s1, s2), side)
    col = g.mixc(stripe, green, yellow)
    col = g.mixc(rust, col, g.mixc(0.35, dcol, (0.09, 0.045, 0.02, 1), 'MULTIPLY'))
    # ---- weathering. On dark green paint, dirt reads LIGHTER (dust film, dried salt, rain streaks)
    # and matte; only crevices and the soot under the cantrail go darker.
    sv = g.comb(g.mul(x, 26.0), g.mul(nrm[1], 3.0), g.mul(z, 0.7))
    streak = g.ss(g.noise(sv, 1.0, 4.0, 0.55), 0.46, 0.66)
    fine = g.ss(g.noise(g.comb(g.mul(x, 90.0), 0.0, g.mul(z, 1.5)), 1.0, 3.0, 0.6), 0.5, 0.68)
    q = g.sub(g.m('WRAP', g.add(x, 0.95), 1.9, 0.0), 0.95)          # distance from bay centre
    prox = g.ss(g.m('ABSOLUTE', g.sub(g.m('ABSOLUTE', q), 0.5)), 0.22, 0.0)
    under = g.mul(g.ss(z, 2.07, 2.02), g.lin(z, 1.1, 2.0, 0.25, 1.0))
    gs = g.mul(g.add(g.mul(streak, g.add(0.35, g.mul(prox, 0.65))), g.mul(fine, 0.35)), under)
    lowdust = g.mul(g.ss(z, 1.75, 1.02), g.add(0.55, g.mul(g.noise(g.comb(g.mul(x, 2.0), 0.0, g.mul(z, 5.0)), 1.0, 5.0, 0.6), 0.6)))
    blot = g.mul(g.ss(g.noise(co, 0.9, 4.0, 0.6), 0.55, 0.75), 0.35)
    dust = g.add(g.add(g.mul(gs, 0.75), g.mul(lowdust, 0.9)), blot, clamp=True)
    col = g.mixc(g.mul(dust, 0.55), col, (0.075, 0.072, 0.062, 1))
    # rust-tinted streaks running down from the window corners
    rs = g.mul(g.mul(streak, prox), g.mul(g.ss(z, 2.06, 2.0), g.lin(z, 1.4, 2.0, 0.0, 1.0)))
    col = g.mixc(g.mul(rs, 0.45), col, (0.09, 0.045, 0.022, 1))
    # darker: crevices (AO) and soot under the cantrail
    sv2 = g.comb(g.mul(x, 7.0), 0.0, g.mul(z, 0.6))
    soot = g.mul(g.ss(g.noise(sv2, 1.0, 3.0, 0.6), 0.5, 0.8), g.ss(z, 3.0, 3.6))
    aoo = g.mul(g.sub(1.0, g.ao(0.10, 6)), 1.4)
    dark = g.add(aoo, g.mul(soot, 0.35), clamp=True)
    col = g.mixc(g.mul(dark, 0.8), col, (0.012, 0.011, 0.009, 1))
    grime = g.add(dust, dark, clamp=True)
    # ---- edge wear (lighter, scuffed)
    ew = g.mul(g.edge(0.012, 6), g.ss(g.noise(co, 14.0, 3.0, 0.7), 0.42, 0.6))
    col = g.mixc(g.mul(ew, 0.55), col, (0.16, 0.19, 0.16, 1))
    # ---- roughness: satin paint, rougher grime
    rmap = g.img(t['rough'], v1, True)
    rough = g.lin(rmap.outputs['Color'], 0.0, 1.0, 0.36, 0.55)
    rough = g.mixf(grime, rough, 0.82)
    rough = g.mixf(rust, rough, 0.85)
    # ---- bump: texture normal + rivets + seams
    nmap = g.normalmap(t['nor'], v1, 0.35)
    h = None
    if rivets:
        dzr = g.m('MINIMUM', g.m('MINIMUM', g.m('ABSOLUTE', g.sub(z, 1.06)), g.m('ABSOLUTE', g.sub(z, 1.335))),
                  g.m('ABSOLUTE', g.sub(z, 3.47)))
        dxr = g.sub(g.m('WRAP', x, 0.075, 0.0), 0.0375)
        dr = g.m('SQRT', g.add(g.mul(dxr, dxr), g.mul(dzr, dzr)))
        riv = g.mul(g.ss(dr, 0.0075, 0.002), g.ss(g.m('ABSOLUTE', x), 11.1, 11.05))
        qp = g.sub(g.m('WRAP', x, 1.9, 0.0), 0.95)                        # distance from pier centre
        seamv = g.mul(g.ss(g.m('ABSOLUTE', qp), 0.0022, 0.0006), g.mul(g.ss(z, 1.02, 1.05), g.ss(z, 3.56, 3.5)))
        seamv = g.mul(seamv, g.ss(g.m('ABSOLUTE', x), 10.5, 10.45))
        seamh = g.add(g.ss(g.m('ABSOLUTE', g.sub(z, 1.30)), 0.002, 0.0006),
                      g.ss(g.m('ABSOLUTE', g.sub(z, 3.42)), 0.002, 0.0006))
        h = g.sub(g.mul(riv, 0.0018), g.mul(g.add(seamv, seamh, clamp=True), 0.0007))
        h = g.mul(h, side)
    nrm_out = g.bump(h, 1.0, 1.0, nmap) if h is not None else nmap
    b = g.bsdf(rough=0.4, **{'Specular IOR Level': 0.4})
    g.L(col, b.inputs['Base Color']); g.L(rough, b.inputs['Roughness']); g.L(nrm_out, b.inputs['Normal'])
    return g.done(g.top_snow(b.outputs[0], 0.7))


def _m_roof(name):
    g = G(name)
    t = ph_texture('blue_metal_plate')
    co = g.coord('Object'); xyz = g.sep(co)
    v = g.vmap(co, 0.45)
    d = g.img(t['diff'], v)
    col, var = g.tinted(d, '#3E4245')
    sv = g.comb(g.mul(xyz[0], 14.0), g.mul(xyz[1], 1.2), 0.0)
    soot = g.ss(g.noise(sv, 1.0, 4.0, 0.6), 0.45, 0.75)
    aoo = g.sub(1.0, g.ao(0.12, 6))
    grime = g.add(g.mul(soot, 0.45), g.mul(aoo, 1.2), clamp=True)
    col = g.mixc(grime, col, (0.02, 0.019, 0.017, 1))
    r = g.img(t['rough'], v, True)
    rough = g.lin(r.outputs['Color'], 0, 1, 0.45, 0.7)
    b = g.bsdf(rough=0.55)
    g.L(col, b.inputs['Base Color']); g.L(rough, b.inputs['Roughness'])
    g.L(g.normalmap(t['nor'], v, 0.5), b.inputs['Normal'])
    return g.done(g.top_snow(b.outputs[0], 0.9))


def _m_interior(name):
    g = G(name)
    n = g.noise(g.coord('Object'), 3.0, 3.0)
    b = g.bsdf('#CFC6AE', 0.6)
    g.L(g.mixc(g.mul(n, 0.3), srgb('#CFC6AE'), srgb('#B9AE93')), b.inputs['Base Color'])
    return g.done(b.outputs[0])


def _m_alu(name):
    """Window-frame aluminium: dull anodised, oxidised, grime in the crevices."""
    g = G(name)
    co = g.coord('Object')
    n1 = g.noise(co, 18.0, 4.0, 0.6)
    n2 = g.noise(co, 3.0, 3.0)
    aoo = g.sub(1.0, g.ao(0.04, 6))
    base = g.mixc(g.mul(n2, 0.5), (0.36, 0.37, 0.38, 1), (0.27, 0.27, 0.27, 1))
    col = g.mixc(g.add(g.mul(aoo, 1.6), g.mul(g.ss(n1, 0.55, 0.75), 0.35), clamp=True), base, (0.07, 0.065, 0.06, 1))
    rough = g.add(0.36, g.mul(g.add(n1, g.mul(aoo, 0.8)), 0.3))
    b = g.bsdf(metal=0.9)
    g.L(col, b.inputs['Base Color']); g.L(rough, b.inputs['Roughness'])
    g.L(g.bump(g.noise(co, 60.0, 2.0), 0.08, 0.002), b.inputs['Normal'])
    return g.done(g.top_snow(b.outputs[0], 0.8, (0.5, 0.8), 14.0))


def _m_rubber(name):
    g = G(name)
    n = g.noise(g.coord('Object'), 20.0, 3.0)
    b = g.bsdf((0.012, 0.012, 0.013, 1), 0.55, **{'Specular IOR Level': 0.35})
    g.L(g.lin(n, 0.3, 0.7, 0.45, 0.75), b.inputs['Roughness'])
    g.L(g.mixc(g.ss(n, 0.55, 0.75), (0.012, 0.012, 0.013, 1), (0.05, 0.048, 0.045, 1)), b.inputs['Base Color'])
    return g.done(g.top_snow(b.outputs[0], 0.7, (0.6, 0.9), 20.0))


def _m_glass(name):
    """Thin window glass: fresnel reflections, dirt + frost creeping in from the bottom corners.
    Uses the pane UV (0..1 over the whole window; v = 0 at the bottom)."""
    g = G(name)
    uv = g.sep(g.coord('UV')); u, v = uv[0], uv[1]
    rnd = g.n('ShaderNodeObjectInfo').outputs['Random']
    du = g.m('MINIMUM', u, g.sub(1.0, u))
    corner = g.m('SQRT', g.add(g.mul(g.mul(du, du), 1.6), g.mul(v, v)))
    nz = g.noise(g.comb(g.mul(u, 1.0), g.mul(v, 0.9), rnd), 6.0, 5.0, 0.65)
    c_mask = g.ss(g.add(corner, g.mul(g.sub(nz, 0.5), 0.18)), 0.26, 0.04)
    bottom = g.mul(g.ss(v, 0.10, 0.0), 0.6)
    midband = g.mul(g.ss(g.m('ABSOLUTE', g.sub(v, 0.535)), 0.05, 0.0), 0.4)
    dirt = g.mul(g.add(g.add(c_mask, bottom), midband, clamp=True), g.lin(rnd, 0, 1, 0.55, 1.0))
    streak = g.ss(g.noise(g.comb(g.mul(u, 40.0), g.mul(v, 2.0), rnd), 1.0, 3.0), 0.55, 0.8)
    dirt = g.add(dirt, g.mul(streak, 0.12), clamp=True)
    frost = g.mul(g.ss(g.add(corner, g.mul(g.sub(nz, 0.5), 0.25)), 0.20, 0.0), g.lin(rnd, 0, 1, 0.3, 0.9))
    tr = g.n('ShaderNodeBsdfTransparent'); tr.inputs['Color'].default_value = (0.90, 0.95, 0.93, 1)
    gl = g.n('ShaderNodeBsdfGlossy'); g.set(gl, 'Roughness', g.add(0.02, g.mul(dirt, 0.25)))
    lw = g.n('ShaderNodeLayerWeight'); lw.inputs['Blend'].default_value = 0.1
    refl = g.add(0.07, g.mul(lw.outputs['Fresnel'], 0.7), clamp=True)
    sh = g.mixs(refl, tr.outputs[0], gl.outputs[0])
    dd = g.n('ShaderNodeBsdfDiffuse'); dd.inputs['Color'].default_value = (0.16, 0.15, 0.13, 1)
    dt = g.n('ShaderNodeBsdfTranslucent'); dt.inputs['Color'].default_value = (0.30, 0.27, 0.22, 1)
    dirt_sh = g.mixs(0.5, dd.outputs[0], dt.outputs[0])
    sh = g.mixs(g.mul(dirt, 0.75), sh, dirt_sh)
    ft = g.n('ShaderNodeBsdfTranslucent'); ft.inputs['Color'].default_value = (0.75, 0.78, 0.80, 1)
    fd = g.n('ShaderNodeBsdfDiffuse'); fd.inputs['Color'].default_value = (0.7, 0.75, 0.8, 1)
    sh = g.mixs(g.mul(frost, 0.55), sh, g.mixs(0.6, fd.outputs[0], ft.outputs[0]))
    return g.done(sh)


def _m_snow(name):
    """Settled snow: photo-scanned snow surface (snow_02) for relief, faint blue SSS, crystal sparkle,
    and soot-grey contamination on the lower / older parts."""
    g = G(name)
    co = g.coord('Object')
    t = ph_texture('snow_02')
    v = g.vmap(co, 1.6)
    d = g.img(t['diff'], v)
    col, var = g.tinted(d, '#E4ECF3')
    dirt = g.mul(g.ss(g.noise(co, 1.5, 4.0, 0.6), 0.55, 0.8), 0.25)
    col = g.mixc(dirt, col, (0.42, 0.42, 0.42, 1))
    b = g.bsdf(rough=0.55, **{'Subsurface Weight': 0.45, 'Subsurface Scale': 0.015,
                              'Subsurface Radius': (0.55, 0.75, 1.0), 'Specular IOR Level': 0.45})
    g.L(col, b.inputs['Base Color'])
    vor = g.n('ShaderNodeTexVoronoi'); vor.inputs['Scale'].default_value = 700.0
    g.L(co, vor.inputs['Vector'])
    sparkle = g.mul(g.ss(vor.outputs['Distance'], 0.07, 0.0), g.ss(g.noise(co, 30.0, 2.0), 0.45, 0.6))
    g.L(g.lin(sparkle, 0, 1, 0.6, 0.05), b.inputs['Roughness'])
    h = g.add(g.mul(g.noise(co, 60.0, 4.0, 0.6), 0.0012), g.mul(g.noise(co, 9.0, 3.0), 0.003))
    g.L(g.bump(h, 1.0, 1.0, g.normalmap(t['nor'], v, 1.4)), b.inputs['Normal'])
    return g.done(b.outputs[0])


def _m_dirty_metal(name, base='#2A2C2E', tex='blue_metal_plate', scale=1.2, rust_amt=0.35, dust='#4A3226',
                   rough=(0.45, 0.75), snow=0.8, ao=0.08, metal=0.0):
    """Generic grimy painted steel (bogies, underframe, couplers): texture breakup, brake dust, rust."""
    g = G(name)
    co = g.coord('Object')
    t = ph_texture(tex)
    v = g.vmap(co, scale)
    d = g.img(t['diff'], v)
    col, var = g.tinted(d, base)
    r = ph_texture('rust_coarse_01')
    rv = g.vmap(co, scale * 0.8, loc=(0.3, 0.7, 0.1))
    rd = g.img(r['diff'], rv)
    rmask = g.mul(g.ss(g.noise(co, 2.5, 5.0, 0.65), 0.52, 0.72), rust_amt)
    col = g.mixc(rmask, col, g.mixc(0.5, rd.outputs['Color'], (0.2, 0.2, 0.2, 1), 'MULTIPLY'))
    aoo = g.sub(1.0, g.ao(ao, 6))
    dz = g.ss(g.sep(co)[2], 0.9, 0.0)
    dm = g.add(g.mul(aoo, 1.2), g.mul(dz, 0.25), clamp=True)
    col = g.mixc(dm, col, srgb(dust))
    ew = g.mul(g.edge(0.008, 4), g.ss(g.noise(co, 20.0, 3.0), 0.45, 0.6))
    col = g.mixc(g.mul(ew, 0.5), col, (0.12, 0.12, 0.12, 1))
    rr = g.img(t['rough'], v, True)
    rgh = g.lin(rr.outputs['Color'], 0, 1, rough[0], rough[1])
    rgh = g.mixf(rmask, rgh, 0.9)
    b = g.bsdf(metal=metal)
    g.L(col, b.inputs['Base Color']); g.L(rgh, b.inputs['Roughness'])
    g.L(g.normalmap(t['nor'], v, 0.6), b.inputs['Normal'])
    sh = b.outputs[0]
    if snow:
        sh = g.top_snow(sh, snow, (0.5, 0.85), 11.0)
    return g.done(sh)


def _m_tread(name):
    """Polished running band of the wheel: bright steel, circumferential micro-scratches, heat tint."""
    g = G(name)
    co = g.coord('Object')
    xyz = g.sep(co)
    rad = g.m('SQRT', g.add(g.mul(xyz[0], xyz[0]), g.mul(xyz[2], xyz[2])))
    ang = g.m('ARCTAN2', xyz[0], xyz[2])
    sv = g.comb(g.mul(xyz[1], 900.0), g.mul(rad, 300.0), g.mul(ang, 0.6))
    scr = g.noise(sv, 1.0, 3.0, 0.5)
    band = g.noise(g.comb(g.mul(xyz[1], 60.0), ang, 0.0), 2.0, 2.0)
    tint = g.ss(g.noise(g.comb(g.mul(xyz[1], 25.0), g.mul(ang, 3.0), 1.0), 1.0, 3.0), 0.55, 0.8)
    col = g.mixc(g.mul(scr, 0.35), (0.70, 0.70, 0.71, 1), (0.48, 0.49, 0.50, 1))
    col = g.mixc(g.mul(tint, 0.5), col, (0.40, 0.33, 0.28, 1))
    rough = g.add(0.16, g.add(g.mul(scr, 0.16), g.mul(band, 0.10)))
    tg = g.n('ShaderNodeTangent', direction_type='RADIAL', axis='Y')
    b = g.bsdf(metal=1.0, **{'Anisotropic': 0.6})
    g.L(col, b.inputs['Base Color']); g.L(rough, b.inputs['Roughness']); g.L(tg.outputs[0], b.inputs['Tangent'])
    g.L(g.bump(g.mul(scr, 0.00004), 1.0, 1.0), b.inputs['Normal'])
    return g.done(b.outputs[0])


def _m_stainless(name):
    """Brushed stainless (grab rails, kick plates, handles): scuffed, grime in crevices, hand-polished spots."""
    g = G(name)
    co = g.coord('Object'); xyz = g.sep(co)
    br = g.noise(g.comb(g.mul(xyz[0], 2.0), g.mul(xyz[1], 2.0), g.mul(xyz[2], 400.0)), 1.0, 3.0)
    sm = g.noise(co, 9.0, 4.0, 0.6)
    aoo = g.sub(1.0, g.ao(0.03, 4))
    col = g.mixc(g.mul(br, 0.25), (0.40, 0.41, 0.42, 1), (0.30, 0.31, 0.32, 1))
    col = g.mixc(g.add(g.mul(aoo, 1.5), g.mul(g.ss(sm, 0.55, 0.75), 0.4), clamp=True), col, (0.08, 0.075, 0.07, 1))
    rough = g.add(0.38, g.add(g.mul(br, 0.15), g.mul(g.ss(sm, 0.5, 0.7), 0.25)))
    b = g.bsdf(metal=1.0)
    g.L(col, b.inputs['Base Color']); g.L(rough, b.inputs['Roughness'])
    return g.done(g.top_snow(b.outputs[0], 0.6, (0.6, 0.9), 20.0))


def _m_vestibule(name):
    """Dim warm vestibule seen through the end-door window (emissive card)."""
    g = G(name)
    co = g.coord('Object'); xyz = g.sep(co)
    grad = g.ss(xyz[2], 1.6, 3.2)
    e = g.n('ShaderNodeEmission')
    g.L(g.mixc(grad, srgb('#3A2A1C'), srgb('#C88A50')), e.inputs['Color'])
    e.inputs['Strength'].default_value = 1.5
    return g.done(e.outputs[0])


def _m_web(name):
    """Wheel web / rim: dark mill-scaled steel under brake dust and rust bloom, gritty relief."""
    g = G(name)
    co = g.coord('Object')
    t = ph_texture('rust_coarse_01')
    v = g.vmap(co, 3.0)
    d = g.img(t['diff'], v)
    r2 = ph_texture('rusty_metal_02')
    v2 = g.vmap(co, 4.0, loc=(0.2, 0.5, 0.1))
    d2 = g.img(r2['diff'], v2)
    n1 = g.noise(co, 45.0, 6.0, 0.75)
    big = g.noise(co, 5.0, 3.0, 0.6)
    rust = g.mixc(0.55, d.outputs['Color'], (0.40, 0.31, 0.27, 1), 'MULTIPLY')
    scale_ = g.mixc(0.7, d2.outputs['Color'], (0.05, 0.045, 0.04, 1), 'MULTIPLY')
    base = g.mixc(g.ss(big, 0.35, 0.7), (0.030, 0.022, 0.018, 1), (0.055, 0.036, 0.026, 1))    # brake-dust brown
    col = g.mixc(g.mul(g.ss(n1, 0.44, 0.62), g.lin(big, 0.3, 0.7, 0.45, 0.95)), base, g.mixc(0.25, rust, base))
    col = g.mixc(g.mul(g.ss(g.noise(co, 25.0, 4.0, 0.7), 0.55, 0.72), 0.4), col, scale_)
    aoo = g.sub(1.0, g.ao(0.05, 6))
    col = g.mixc(g.mul(aoo, 1.2), col, (0.012, 0.009, 0.007, 1))
    rr = g.img(t['rough'], v, True)
    rough = g.lin(rr.outputs['Color'], 0, 1, 0.6, 0.95)
    grit = g.add(g.mul(g.noise(co, 300.0, 3.0, 0.6), 0.00025), g.mul(g.noise(co, 40.0, 4.0, 0.6), 0.0007))
    b = g.bsdf(rough=0.8, **{'Specular IOR Level': 0.22})
    g.L(col, b.inputs['Base Color']); g.L(rough, b.inputs['Roughness'])
    g.L(g.bump(grit, 1.0, 1.0, g.normalmap(t['nor'], v, 1.8)), b.inputs['Normal'])
    return g.done(b.outputs[0])


def _snow_kick(center, n=70, seed=4, rail_y=-0.7525):
    """Test-only dressing for the macro: fresh snow lying on the rail head ahead of the wheel (the wheel
    ploughs it clean), plus fine powder and a few small clumps thrown up at the contact."""
    rng = random.Random(seed)
    mb = MB()
    cx, cy, cz = center
    for i in range(n):
        big = i < 8
        r = (0.0018 + 0.0022 * rng.random()) if big else (0.0005 + 0.0009 * rng.random())
        x = cx + (0.015 + 0.20 * rng.random() ** 1.7)
        y = cy + (rng.random() - 0.5) * 0.10 - 0.02
        z = cz + 0.003 + (0.10 if not big else 0.05) * rng.random() ** 1.6
        verts, faces = [], []
        segs, rings = 6, 4
        for a in range(rings + 1):
            th = math.pi * a / rings
            for b in range(segs):
                ph = 2 * math.pi * b / segs
                k = r * (0.45 + 1.1 * rng.random())
                verts.append((x + 2.2 * k * math.sin(th) * math.cos(ph), y + k * math.sin(th) * math.sin(ph),
                              z + 1.3 * k * math.cos(th)))
        for a in range(rings):
            for b in range(segs):
                b2 = (b + 1) % segs
                faces.append((a * segs + b, a * segs + b2, (a + 1) * segs + b2, (a + 1) * segs + b))
        mb.add(verts, faces, 0)
    # snow strip on the rail head from just ahead of the contact forward, ragged edges, heaped at the wheel
    nx, ny = 480, 12
    x0, x1 = cx + 0.012, cx + 1.6
    verts, faces = [], []
    for i in range(nx + 1):
        x = x0 + (x1 - x0) * i / nx
        f = (x - x0) / (x1 - x0)
        heap = 0.010 * math.exp(-((x - x0) / 0.03) ** 2)
        w0 = 0.028 + 0.008 * mnoise.noise(Vector((x * 30, 1.0, 0.0)))
        cover = max(0.0, min(1.0, 0.5 + 1.6 * mnoise.noise(Vector((x * 9.0, 3.0, 1.0)))))   # breaks in the layer
        for j in range(ny + 1):
            yy = rail_y - w0 + 2 * w0 * j / ny
            e = 1 - abs(2 * j / ny - 1)
            h = (0.0035 + 0.0025 * mnoise.noise(Vector((x * 60, yy * 90, 2.0)))
                 + 0.0015 * mnoise.noise(Vector((x * 200, yy * 200, 5.0)))) * (e ** 0.35) * cover + heap * e
            verts.append((x, yy, max(-0.001, h)))
    for i in range(nx):
        for j in range(ny):
            a = i * (ny + 1) + j
            faces.append((a, a + ny + 1, a + ny + 2, a + 1))
    mb.add(verts, faces, 0)
    o = _obj('snowkick', mb.mesh('snowkick', smooth_angle=None), bpy.context.scene.collection)
    o.data.materials.append(materials()['snow'])
    return o


def _m_mark(name, color='#E6D4A0', wear=0.35):
    """Stencilled cream paint, worn through in places."""
    g = G(name)
    co = g.coord('Object')
    n = g.noise(co, 22.0, 5.0, 0.7)
    keep = g.ss(n, 0.30 + 0.2 * wear, 0.38 + 0.2 * wear)
    xyz = g.sep(co)
    gr = g.add(g.mul(g.ss(xyz[2], 1.9, 1.0), 0.45), g.mul(g.sub(1.0, g.ao(0.05, 4)), 0.5), clamp=True)
    col = g.mixc(gr, srgb(color), (0.20, 0.18, 0.13, 1))
    col = g.mixc(g.mul(g.ss(g.noise(co, 5.0, 3.0), 0.5, 0.7), 0.4), col, (0.35, 0.32, 0.24, 1))
    b = g.bsdf(rough=0.55)
    g.L(col, b.inputs['Base Color'])
    tr = g.n('ShaderNodeBsdfTransparent')
    return g.done(g.mixs(keep, tr.outputs[0], b.outputs[0]))


def materials():
    """All carriage materials (built once per blend, shared by every car)."""
    M = {}
    M['paint'] = _mat('crg_paint', _m_paint)
    M['paint_door'] = _mat('crg_paint_door', lambda n: _m_paint(n, rivets=False))
    M['inner'] = _mat('crg_interior', _m_interior)
    M['roof'] = _mat('crg_roof', _m_roof)
    M['alu'] = _mat('crg_alu', _m_alu)
    M['rubber'] = _mat('crg_rubber', _m_rubber)
    M['glass'] = _mat('crg_glass', _m_glass)
    M['snow'] = _mat('crg_snow', _m_snow)
    M['under'] = _mat('crg_under', lambda n: _m_dirty_metal(n, '#25221F', 'rusty_metal_02', 0.9, 0.45, '#3A2A20',
                                                            (0.55, 0.85), 0.9, 0.12))
    M['bogie'] = _mat('crg_bogie', lambda n: _m_dirty_metal(n, '#2E3032', 'blue_metal_plate', 1.4, 0.3, '#4A2E22',
                                                            (0.45, 0.72), 0.9, 0.08))
    M['spring'] = _mat('crg_spring', lambda n: _m_dirty_metal(n, '#2A2B2C', 'rusty_metal_02', 3.0, 0.55, '#4A2E22',
                                                              (0.4, 0.7), 0.6, 0.03))
    M['shoe'] = _mat('crg_shoe', lambda n: _m_dirty_metal(n, '#3A3633', 'rust_coarse_01', 4.0, 0.6, '#5A3424',
                                                          (0.6, 0.9), 0.2, 0.02))
    M['web'] = _mat('crg_web', _m_web)
    M['axle'] = _mat('crg_axle', lambda n: _m_dirty_metal(n, '#2C2B2A', 'rusty_metal_02', 2.0, 0.5, '#3A2A20',
                                                          (0.45, 0.7), 0.4, 0.05))
    M['steel'] = _mat('crg_steel', lambda n: _m_dirty_metal(n, '#2B2B2B', 'blue_metal_plate', 2.0, 0.4, '#3A2A20',
                                                            (0.35, 0.6), 0.7, 0.05, 0.3))
    M['step'] = _mat('crg_step', lambda n: _m_dirty_metal(n, '#3A3C3C', 'metal_plate', 2.0, 0.3, '#3A2A20',
                                                          (0.4, 0.7), 1.0, 0.03, 0.4))
    M['tread'] = _mat('crg_tread', _m_tread)
    M['handle'] = _mat('crg_handle', _m_stainless)
    M['vest'] = _mat('crg_vestibule', _m_vestibule)
    M['mark'] = _mat('crg_mark', _m_mark)
    M['bellows'] = _mat('crg_bellows', _m_rubber)
    M['red'] = _mat('crg_cockred', lambda n: _m_dirty_metal(n, '#8A2A22', 'rusty_metal_02', 3.0, 0.3, '#2A2018',
                                                            (0.4, 0.6), 0.3, 0.02))
    return M


# ================================================================ body shell
def _half_profile():
    """Outer section points (y, z) of the +Y half, from the skirt bottom up to the roof crown."""
    pts = [(1.515, 1.00), (1.528, 1.10), (1.539, 1.20), (1.546, 1.30), (1.550, 1.40), (1.55, 3.55)]
    for a in (7.5, 15.0, 22.5, 30.0, 36.5, 42.5):
        t = math.radians(a)
        pts.append((1.25 + 0.30 * math.cos(t), 3.55 + 0.30 * math.sin(t)))
    R, zc = 1.9955, 2.4045
    th0 = math.atan2(1.25, 1.1455)
    n = 16
    for k in range(1, n + 1):
        th = th0 * (1 - k / n)
        pts.append((R * math.sin(th), zc + R * math.cos(th)))
    return pts


def _full_profile():
    r = _half_profile()
    left = [(-y, z) for (y, z) in r]
    return left + [(y, z) for (y, z) in reversed(r[:-1])]


def _offset(poly, d):
    """Offset an open polyline (clockwise over the roof) inward by d."""
    out = []
    n = len(poly)
    for i in range(n):
        p = Vector(poly[i])
        ns = []
        for a, b in ((i - 1, i), (i, i + 1)):
            if 0 <= a and b < n:
                e = (Vector(poly[b]) - Vector(poly[a])).normalized()
                ns.append(Vector((-e.y, e.x)))
        nn = sum(ns, Vector((0, 0))).normalized()
        mit = 1 / max(0.5, nn.dot(ns[0]))
        out.append(tuple(p - nn * d * mit))
    return out


def _shell_mesh():
    outer = _full_profile()
    # make the outer/inner normals point away from the car axis for a clockwise path over the roof
    inner = _offset(outer, 0.08)
    sec = outer + inner[::-1]
    mb = MB()
    prism(mb, sec, -HALF, HALF, _yz, 0)
    me = mb.mesh('crg_shell_raw', smooth_angle=None)
    # window + door cutters
    cm = MB()
    for s in (-1, 1):
        for bxc in BAYS:
            prism(cm, rrect(bxc, WIN_ZC, WIN_W, WIN_H, WIN_R, 6), s * 1.25, s * 1.8, _xz)
        for dx in (-DOOR_X, DOOR_X):
            prism(cm, rrect(dx, (DOOR_Z0 + DOOR_Z1) / 2, DOOR_W, DOOR_Z1 - DOOR_Z0, (0, 0, 0.06, 0.06), 5),
                  s * 1.25, s * 1.8, _xz)
    me = _boolean_diff(me, cm.mesh('crg_cut', smooth_angle=None))
    # end walls (inside the shell's end rims)
    ew = MB()
    for sg in (-1, 1):
        prism(ew, inner, sg * (HALF - 0.07), sg * HALF, _yz, 0)
    ewm = ew.mesh('crg_endwall_raw', smooth_angle=None)
    bm = bmesh.new(); bm.from_mesh(me); bm.from_mesh(ewm)
    bm.to_mesh(me); bm.free(); bpy.data.meshes.remove(ewm)
    me.shade_smooth(); me.set_sharp_from_angle(angle=math.radians(30))
    me = _apply_bevel(me, 0.007, 2, 40)
    # material slots: 0 paint, 1 interior, 2 roof
    idx = []
    for p in me.polygons:
        c, n = p.center, p.normal
        rad = Vector((0, c.y, c.z - 2.4)).normalized()
        if abs(c.x) > 12.1 and abs(n.x) > 0.9:
            k = 0 if n.x * c.x > 0 else 1
        elif n.dot(rad) < -0.5:
            k = 1
        elif c.z > 3.625 and n.dot(rad) > 0.3:
            k = 2
        else:
            k = 0
        idx.append(k)
    me.polygons.foreach_set('material_index', idx)
    me.update()
    return me


# ================================================================ windows
FRAME_SEC = [(0.050, 0.004), (0.050, -0.003), (0.046, -0.008), (0.038, -0.011), (0.004, -0.012),
             (-0.003, -0.0095), (-0.006, -0.004), (-0.006, 0.086), (0.004, 0.086), (0.004, 0.004)]


def _gasket(mb, path, d, mat=1):
    sec = [(0.001, d + 0.003), (0.001, d - 0.004), (0.004, d - 0.0075), (0.010, d - 0.0085),
           (0.0135, d - 0.0060), (0.0145, d + 0.003)]
    sweep(mb, path, sec, _xz, mat)


def _window_frame_mesh():
    """Aluminium window frame with the mid rail, lower sash and rubber gaskets (window-local: hole centre at
    origin, x across, z up, y = depth into the car from the outer skin)."""
    mb = MB()
    hw, hh = WIN_W / 2, WIN_H / 2
    sweep(mb, rrect(0, 0, WIN_W, WIN_H, WIN_R, 8), FRAME_SEC, _xz, 0)
    # mid rail (liftable lower sash's meeting rail)
    rail = [(-0.025, 0.006), (-0.025, 0.055), (0.025, 0.055), (0.025, 0.006), (0.020, 0.0), (-0.020, 0.0)]
    prism(mb, [(z, d) for z, d in rail], -hw + 0.005, hw - 0.005,
          lambda u, v, w: (w, v, u), 0)
    # upper pane gasket path (visible glass outline) and lower pane + its sash frame
    up = rrect(0, (0.025 + hh - 0.019) / 2, WIN_W - 0.038, hh - 0.019 - 0.025, (0, 0, WIN_R - 0.019, WIN_R - 0.019), 8)
    lo = rrect(0, -(0.025 + hh - 0.019) / 2, WIN_W - 0.038, hh - 0.019 - 0.025, (WIN_R - 0.019, WIN_R - 0.019, 0, 0), 8)
    _gasket(mb, up, 0.022)
    _gasket(mb, lo, 0.050)
    # lower sash frame: thin aluminium ring just outside its gasket
    sweep(mb, lo, [(0.0145, 0.040), (0.0145, 0.060), (0.026, 0.060), (0.026, 0.040)], _xz, 0)
    # two finger lifts on the lower sash top rail
    for sx in (-0.30, 0.30):
        bx(mb, (0.06, 0.012, 0.012), (sx, 0.040, -0.035), 0)
    return _set_mats(mb.mesh('crg_winframe'), [])


def _glass_mesh():
    """Upper pane (d = 0.022) and lower pane (d = 0.050); UV spans the whole window (v = 0 at the bottom)."""
    mb = MB()
    hw, hh = WIN_W / 2, WIN_H / 2

    def pane(poly, d):
        verts = [(u, d, v) for u, v in poly]
        uvs = [[((u + hw) / WIN_W, (v + hh) / WIN_H) for u, v in poly]]
        mb.add(verts, [tuple(range(len(poly)))], 0, uvs)
    pane(rrect(0, (0.012 + hh - 0.01) / 2, WIN_W - 0.02, hh - 0.01 - 0.012, (0, 0, WIN_R - 0.01, WIN_R - 0.01), 8), 0.022)
    pane(rrect(0, -(0.012 + hh - 0.01) / 2, WIN_W - 0.02, hh - 0.01 - 0.012, (WIN_R - 0.01, WIN_R - 0.01, 0, 0), 8), 0.050)
    return mb.mesh('crg_glass', smooth_angle=None, recalc=False)


def _sill_snow(mb, cx, side, rng, z0=WIN_ZC - WIN_H / 2):
    """Snow lying on a window's bottom reveal, piled into the rounded corners (car coords)."""
    hw = WIN_W / 2 - 0.006
    nu, nd = 48, 7
    d0, d1 = -0.018, 0.043
    seed = rng.random() * 100
    rows = []
    for i in range(nu + 1):
        u = -hw + 2 * hw * i / nu
        au = abs(u)
        rr = WIN_R - 0.006
        floor = 0.0
        if au > hw - rr:
            k = au - (hw - rr)
            floor = rr - math.sqrt(max(0.0, rr * rr - k * k))
        base = 0.005 + 0.013 * (0.5 + 0.5 * mnoise.noise(Vector((u * 6 + seed, seed, 0.3)))) ** 1.5
        pile = 0.028 * (max(0.0, (au - 0.34) / 0.15) ** 1.6) * (0.7 + 0.3 * rng.random())
        dfront = d0 + 0.018 * max(0.0, mnoise.noise(Vector((u * 11 + seed, 2.0, seed))))
        row = []
        for j in range(nd + 1):
            d = d0 + (d1 - d0) * j / nd
            f = (d - d0) / (d1 - d0)
            lip = max(0.0, min(1.0, (d - dfront) / 0.010)) ** 0.5
            h = (base * (0.70 + 0.45 * f) + pile) * lip
            h += 0.0035 * mnoise.noise(Vector((u * 45 + seed, d * 45, 1.7))) * lip
            top = max(floor + 0.002, h)
            row.append((u, d, top, floor - 0.003))
        rows.append(row)
    verts, faces = [], []
    W = nd + 1
    for row in rows:
        for (u, d, top, bot) in row:
            verts.append((u, d, top))
    nt = len(verts)
    for row in rows:
        for (u, d, top, bot) in row:
            verts.append((u, d, bot))
    for i in range(nu):
        for j in range(nd):
            a = i * W + j
            faces.append((a, a + W, a + W + 1, a + 1))
            faces.append((nt + a, nt + a + 1, nt + a + W + 1, nt + a + W))
    for i in range(nu):   # front + back skirts
        faces.append((i * W, nt + i * W, nt + (i + 1) * W, (i + 1) * W))
        faces.append((i * W + nd, (i + 1) * W + nd, nt + (i + 1) * W + nd, nt + i * W + nd))
    for j in range(nd):
        faces.append((j, j + 1, nt + j + 1, nt + j))
        faces.append((nu * W + j, nt + nu * W + j, nt + nu * W + j + 1, nu * W + j + 1))
    # to car coords: window local (u, d, h) -> world; -Y side: y = -1.55 + d ; +Y side mirrored (x flips too)
    out = []
    for (u, d, h) in verts:
        if side < 0:
            out.append((cx + u, -W_OUT + d, z0 + h))
        else:
            out.append((cx - u, W_OUT - d, z0 + h))
    mb.add(out, faces, 0)


# ================================================================ doors, steps, handles
def _doors_mesh():
    """Four entry doors (car coords), recessed 12 mm, each with a small window hole."""
    mb = MB()
    cm = MB()
    for sx in (-1, 1):
        for sy in (-1, 1):
            cx = sx * DOOR_X
            poly = rrect(cx, (SKIRT + 0.008 + DOOR_Z1 - 0.008) / 2, DOOR_W - 0.016, DOOR_Z1 - 0.016 - SKIRT,
                         (0, 0, 0.055, 0.055), 5)
            prism(mb, poly, sy * (W_OUT - 0.012), sy * (W_OUT - 0.052), _xz, 0)
            prism(cm, rrect(cx, 2.58, 0.40, 0.56, 0.06, 5), sy * 1.4, sy * 1.7, _xz)
    me = mb.mesh('crg_doors_raw', smooth_angle=None)
    me = _boolean_diff(me, cm.mesh('crg_dcut', smooth_angle=None))
    me.shade_smooth(); me.set_sharp_from_angle(angle=math.radians(30))
    me = _apply_bevel(me, 0.006, 2, 40)
    # door fittings: window frame + gasket, rubber door seal, kick plate, handle, lock
    fm = MB()
    for sx in (-1, 1):
        for sy in (-1, 1):
            cx = sx * DOOR_X

            def T(u, v, w, cx=cx, sy=sy):       # door-local (u across, v = z, w = depth) -> car coords
                return (cx + (u if sy < 0 else -u), sy * (W_OUT - w), v)
            wpath = rrect(0, 2.58, 0.40, 0.56, 0.06, 6)
            sweep(fm, wpath, [(0.030, 0.012), (0.030, 0.006), (0.024, 0.002), (0.004, 0.001), (-0.004, 0.004),
                              (-0.004, 0.040), (0.004, 0.040)], T, 0)
            sweep(fm, rrect(0, 2.58, 0.392, 0.552, 0.056, 6),
                  [(0.001, 0.032), (0.001, 0.024), (-0.004, 0.021), (-0.010, 0.022), (-0.012, 0.032)], T, 1)
            # rubber seal around the door leaf
            dp = rrect(0, (DOOR_Z0 + DOOR_Z1) / 2 + 0.025, DOOR_W, DOOR_Z1 - DOOR_Z0 - 0.05, (0, 0, 0.06, 0.06), 5)
            sweep(fm, dp, [(0.0, 0.005), (0.0, 0.06), (-0.010, 0.06), (-0.010, 0.016)], T, 1)
            # kick plate (scuffed stainless) and handle + lock
            prism(fm, [(-0.33, SKIRT + 0.03), (0.33, SKIRT + 0.03), (0.33, SKIRT + 0.26), (-0.33, SKIRT + 0.26)],
                  0.009, 0.0125, lambda u, v, w: T(u, v, w), 2)
            hu = 0.26
            tube(fm, [T(hu, 1.86, 0.012), T(hu, 1.86, -0.035), T(hu - 0.13, 1.86, -0.04)], 0.011, 8, 2)
            cyl(fm, T(hu, 1.86, 0.010), T(hu, 1.86, -0.006), 0.03, 12, 2)
            cyl(fm, T(hu, 1.95, 0.010), T(hu, 1.95, 0.004), 0.016, 10, 2)
    fme = fm.mesh('crg_doorfit')
    return me, fme


def _door_glass_mesh():
    mb = MB()
    for sx in (-1, 1):
        for sy in (-1, 1):
            cx = sx * DOOR_X
            poly = rrect(0, 2.58, 0.392, 0.552, 0.056, 6)
            verts = [(cx + (u if sy < 0 else -u), sy * (W_OUT - 0.028), v) for u, v in poly]
            uvs = [[((u + 0.2) / 0.4, (v - 2.30) / 0.56) for u, v in poly]]
            mb.add(verts, [tuple(range(len(poly)))], 0, uvs)
    _end_door_glass(mb)
    return mb.mesh('crg_doorglass', smooth_angle=None, recalc=False)


def _fittings_mesh(lod):
    """Grab handles, hanging steps, end-wall handles, plaque anchor brackets — car coords.
    mats: 0 handle steel, 1 step plate, 2 under/steel brackets."""
    mb = MB()
    for sx in (-1, 1):
        for sy in (-1, 1):
            cx = sx * DOOR_X
            # long grab rails both sides of the door
            for du in (-DOOR_W / 2 - 0.075, DOOR_W / 2 + 0.075):
                x = cx + du
                y0, y1 = sy * W_OUT, sy * (W_OUT + 0.065)
                tube(mb, [(x, y0 * 0.99, 1.16), (x, y1 * 0.995, 1.20), (x, y1, 1.26), (x, y1, 2.30), (x, y1 * 0.995, 2.36),
                          (x, y0 * 0.99, 2.40)], 0.016, 10, 0)
                for z in (1.16, 2.40):
                    cyl(mb, (x, sy * (W_OUT - 0.005), z), (x, sy * (W_OUT + 0.012), z), 0.032, 12, 0)
            # hanging step under the door: flat-bar hangers + two checker-plate treads with lips
            for du in (-0.32, 0.32):
                x = cx + du
                tube(mb, [(x, sy * 1.47, SKIRT + 0.02), (x, sy * 1.53, 0.80), (x, sy * 1.565, 0.50)],
                     0.012, 6, 2)
            for (zt, yi, yo) in ((0.52, 1.40, 1.58), (0.79, 1.36, 1.545)):
                lo, hi = sorted((sy * yi, sy * yo))
                bx2(mb, (cx - 0.33, lo, zt - 0.012), (cx + 0.33, hi, zt), 1)
                lo, hi = sorted((sy * (yo - 0.012), sy * yo))
                bx2(mb, (cx - 0.33, lo, zt - 0.05), (cx + 0.33, hi, zt), 1)
    for sx in (-1, 1):
        # gangway end door: leaf with a lit vestibule window (glass is in the door-glass object)
        xe = sx * HALF
        for (y0, y1, z0, z1) in ((-0.36, 0.36, 1.32, 2.22), (-0.36, 0.36, 2.86, 3.12), (-0.36, -0.20, 2.22, 2.86),
                                 (0.20, 0.36, 2.22, 2.86)):
            lo, hi = sorted((xe, xe + sx * 0.018))
            bx2(mb, (lo, y0, z0), (hi, y1, z1), 2)
        lo, hi = sorted((xe - sx * 0.03, xe + sx * 0.004))
        bx2(mb, (lo, -0.20, 2.22), (hi, 0.20, 2.86), 3)
        tube(mb, [(xe + sx * 0.018, 0.27, 1.95), (xe + sx * 0.06, 0.27, 1.95), (xe + sx * 0.06, 0.15, 1.95)], 0.01, 8, 0)
    if lod == 'hero':
        # end-wall grab handles and lamp brackets
        for sx in (-1, 1):
            xe = sx * HALF
            for yy in (-0.85, 0.85):
                tube(mb, [(xe, yy, 1.35), (xe + sx * 0.06, yy, 1.40), (xe + sx * 0.06, yy, 2.25), (xe, yy, 2.30)],
                     0.015, 10, 0)
            for yy in (-1.22, 1.22):
                lo, hi = sorted((xe, xe + sx * 0.10))
                bx2(mb, (lo, yy - 0.06, 3.05), (hi, yy + 0.06, 3.09), 2)
                bx2(mb, (lo, yy - 0.015, 3.09), (hi, yy + 0.015, 3.20), 2)
    return mb.mesh('crg_fittings_' + lod)


def _end_door_glass(mb):
    for sx in (-1, 1):
        xe = sx * HALF + sx * 0.012
        poly = [(-0.20, 2.22), (0.20, 2.22), (0.20, 2.86), (-0.20, 2.86)]
        verts = [(xe, u, v) for u, v in poly]
        uvs = [[((u + 0.2) / 0.4, (v - 2.22) / 0.64) for u, v in poly]]
        mb.add(verts, [(0, 1, 2, 3)], 0, uvs)


# ================================================================ roof: drip rails, ventilators, snow
def _drip_mesh():
    mb = MB()
    for s in (-1, 1):
        sec = [(1.532, 3.612), (1.574, 3.612), (1.576, 3.645), (1.566, 3.645), (1.564, 3.625), (1.532, 3.628)]
        prism(mb, [(s * y, z) for y, z in sec], -HALF + 0.02, HALF - 0.02, _yz, 0)
    return mb.mesh('crg_drip')


def _vent_mesh(lod):
    mb = MB()
    prof = [(-0.06, 0.135), (0.04, 0.135), (0.05, 0.095), (0.12, 0.095), (0.125, 0.19), (0.145, 0.215),
            (0.185, 0.205), (0.215, 0.15), (0.232, 0.07), (0.238, 0.001)]
    snow = MB()
    seg = 28 if lod == 'hero' else 12
    xs = [b + 0.95 for b in BAYS[:-1]] + [-11.2, 11.2]
    for i, x in enumerate(xs):
        revolve(mb, [(a, r) for a, r in prof], seg, lambda a, r, t, x=x: (x + r * math.cos(t), r * math.sin(t), 4.39 + a),
                0, closed=False)
        if lod == 'hero':
            sp = [(0.185, 0.198), (0.212, 0.165), (0.236, 0.10), (0.249, 0.05), (0.253, 0.001)]

            def f(a, r, t, x=x, ph=i * 1.7):
                k = 0.006 * mnoise.noise(Vector((math.cos(t) * 2 + ph, math.sin(t) * 2, r * 8)))
                return (x + r * math.cos(t), r * math.sin(t), 4.39 + a + k * (r > 0.01))
            revolve(snow, sp, seg, f, 0, closed=False)
    return mb.mesh('crg_vents_' + lod), (snow.mesh('crg_ventsnow') if lod == 'hero' else None)


def _roof_snow_mesh(seed=3):
    """Thin uneven snow sheet on the roof: drifts, wind ripples, piles in the lee of the ventilators; its
    edge wanders down the cantrail and in places reaches past the gutter as a small drooping cornice;
    overhangs the car ends a little."""
    prof = _full_profile()
    pts = [Vector(p) for p in prof if p[1] > 3.60]          # gutter (left) -> crown -> gutter (right)
    seg_len = [0.0]
    for a_, b_ in zip(pts, pts[1:]):
        seg_len.append(seg_len[-1] + (b_ - a_).length)
    total = seg_len[-1]

    def at(s):
        """Point + outward normal on the roof profile at arc length s; extrapolates past the gutters as a
        drooping cornice."""
        if s < 0 or s > total:
            i0, i1 = (0, 1) if s < 0 else (-1, -2)
            p0 = pts[i0]
            t = (pts[i0] - pts[i1]).normalized()              # pointing out/down past the gutter
            k = -s if s < 0 else s - total
            p = p0 + t * k + Vector((0, -2.5 * k * k))
            n = Vector((-t.y, t.x))
            if n.dot(Vector((p.x, p.y - 2.4))) < 0:
                n = -n
            return p, n
        for i in range(len(pts) - 1):
            if seg_len[i + 1] >= s:
                t = (s - seg_len[i]) / max(1e-9, seg_len[i + 1] - seg_len[i])
                p = pts[i].lerp(pts[i + 1], t)
                e = (pts[i + 1] - pts[i]).normalized()
                n = Vector((-e.y, e.x))
                if n.dot(Vector((p.x, p.y - 2.4))) < 0:
                    n = -n
                return p, n
        return pts[-1], Vector((0, 1))
    vents = [b + 0.95 for b in BAYS[:-1]] + [-11.2, 11.2]
    nx, ns = 490, 60
    over = 0.045
    x0, x1 = -HALF - over, HALF + over
    off = seed * 13.1

    def N(*a):
        return mnoise.noise(Vector(a))
    top, bot = [], []
    for i in range(nx + 1):
        x = x0 + (x1 - x0) * i / nx
        beyond = abs(x) - HALF
        eL = 0.10 + 0.15 * N(x * 0.30 + off, 0.5, 0.1) + 0.04 * N(x * 2.3, off, 0.7)
        eR = 0.10 + 0.15 * N(x * 0.30 + off, 3.5, 0.1) + 0.04 * N(x * 2.3, off, 2.7)
        eL, eR = max(-0.03, min(0.32, eL)), max(-0.03, min(0.32, eR))
        s0, s1 = eL, total - eR
        rt, rb = [], []
        for j in range(ns + 1):
            s = s0 + (s1 - s0) * j / ns
            p, n = at(s)
            slope = math.degrees(math.acos(max(-1, min(1, n.y))))
            base = 0.034 * (1.0 - max(0.0, min(1.0, (slope - 38) / 34)))
            drift = 0.75 + 0.35 * N(x * 0.45 + off, s * 1.2, 0.3) + 0.15 * N(x * 1.7, s * 2.5, off)
            ripple = 0.004 * N(x * 9.0 - s * 2.0, s * 3.0, off + 5.0)
            th = max(0.006, base * drift) + ripple
            for xv in vents:                                     # lee piles behind the ventilators
                dx, dy = (x - (xv - 0.30)) / 0.42, (p.x) / 0.30
                th += 0.026 * math.exp(-dx * dx - dy * dy)
            edge = max(0.0, min(1.0, min(s - s0, s1 - s) / 0.06))
            th = 0.007 + (th - 0.007) * (edge ** 0.7)
            if beyond > 0:
                th *= max(0.4, 1 - beyond / over * 0.5)
            droop = -0.5 * max(0.0, beyond)
            P = Vector((p.x, p.y)) + n * th
            B = Vector((p.x, p.y)) - n * (0.004 if 0 <= s <= total else 0.0)
            if beyond > 0 or s < 0 or s > total:
                B = Vector((p.x, p.y)) - n * 0.002
            rt.append((x, P.x, P.y + droop))
            rb.append((x, B.x, B.y + droop))
        top.append(rt); bot.append(rb)
    verts, faces = [], []
    W = ns + 1
    for r in top:
        verts.extend(r)
    nt = len(verts)
    for r in bot:
        verts.extend(r)
    for i in range(nx):
        for j in range(ns):
            a = i * W + j
            faces.append((a, a + W, a + W + 1, a + 1))
            faces.append((nt + a, nt + a + 1, nt + a + W + 1, nt + a + W))
    for i in range(nx):
        faces.append((i * W, nt + i * W, nt + (i + 1) * W, (i + 1) * W))
        faces.append((i * W + ns, (i + 1) * W + ns, nt + (i + 1) * W + ns, nt + i * W + ns))
    for j in range(ns):
        faces.append((j, j + 1, nt + j + 1, nt + j))
        faces.append((nx * W + j, nt + nx * W + j, nt + nx * W + j + 1, nx * W + j + 1))
    mb = MB(); mb.add(verts, faces, 0)
    return mb.mesh('crg_roofsnow', smooth_angle=70)


# ================================================================ underframe, ends
def _under_mesh(lod):
    """mats: 0 under grime, 1 steel, 2 rubber hoses, 3 red cock handles"""
    mb = MB()
    bx2(mb, (-HALF + 0.08, -1.44, 1.12), (HALF - 0.08, 1.44, 1.27), 0)              # floor pan
    for s in (-1, 1):                                                               # sole bars
        lo, hi = sorted((s * 1.38, s * 1.445))
        bx2(mb, (-HALF + 0.1, lo, 0.95), (HALF - 0.1, hi, 1.12), 0)
    for sx in (-1, 1):                                                              # body bolsters + centre plate
        bx2(mb, (sx * BOGIE_X - 0.25, -1.40, 0.90), (sx * BOGIE_X + 0.25, 1.40, 1.12), 0)
        cyl(mb, (sx * BOGIE_X, 0, 0.80), (sx * BOGIE_X, 0, 0.90), 0.19, 24, 0)
        # end (head) beam
        lo, hi = sorted((sx * (HALF - 0.12), sx * (HALF + 0.02)))
        bx2(mb, (lo, -1.42, 0.72), (hi, 1.42, 1.03), 0)
    if lod == 'hero':
        bx2(mb, (-HALF + 0.2, -0.15, 1.08), (HALF - 0.2, 0.15, 1.12), 0)            # centre sill (I-beam)
        bx2(mb, (-HALF + 0.2, -0.012, 0.90), (HALF - 0.2, 0.012, 1.08), 0)
        bx2(mb, (-HALF + 0.2, -0.15, 0.88), (HALF - 0.2, 0.15, 0.90), 0)
        for x in (-7.2, -4.9, -2.4, 2.4, 4.9, 7.2, -11.0, 11.0):                    # cross bearers
            bx2(mb, (x - 0.06, -1.38, 0.98), (x + 0.06, 1.38, 1.12), 0)
        # battery box with latches and hangers
        bx2(mb, (-4.5, -1.25, 0.62), (-2.7, -0.40, 1.08), 0)
        for xx in (-4.2, -3.6, -3.0):
            bx2(mb, (xx - 0.04, -1.265, 0.95), (xx + 0.04, -1.245, 1.02), 1)
        for xx in (-4.4, -2.8):
            bx2(mb, (xx - 0.03, -1.27, 0.62), (xx + 0.03, -1.24, 1.12), 0)
        # aux reservoir with end domes and straps
        revolve(mb, [(-0.66, 0.001), (-0.64, 0.12), (-0.60, 0.20), (-0.55, 0.22), (0.55, 0.22), (0.60, 0.20),
                     (0.64, 0.12), (0.66, 0.001)], 28, to_x(3.6, -0.40, 0.84), 0, closed=False)
        for xx in (3.2, 4.0):
            revolve(mb, [(-0.025, 0.225), (0.025, 0.225), (0.025, 0.235), (-0.025, 0.235)], 28,
                    to_x(xx, -0.40, 0.84), 1)
            bx2(mb, (xx - 0.025, -0.45, 1.06), (xx + 0.025, -0.35, 1.12), 0)
        # brake cylinder + lever + rods
        revolve(mb, [(0, 0.001), (0.0, 0.17), (0.02, 0.19), (0.46, 0.19), (0.48, 0.17), (0.48, 0.001)], 28,
                to_x(1.9, 0.55, 0.86), 0, closed=False)
        cyl(mb, (2.38, 0.55, 0.86), (2.75, 0.55, 0.86), 0.035, 12, 1)
        bx2(mb, (2.75, 0.50, 0.72), (2.80, 0.60, 1.05), 0)
        for sx, x0 in ((1, 2.78), (-1, 1.9)):
            tube(mb, [(x0, 0.40, 0.95), (sx * 8.3, 0.40, 0.95)], 0.02, 8, 1)
        # control valve, electric boxes
        bx2(mb, (2.2, -1.15, 0.78), (2.6, -0.80, 1.10), 0)
        bx2(mb, (-1.1, 0.70, 0.66), (-0.1, 1.25, 1.10), 0)
        bx2(mb, (5.2, -1.20, 0.70), (6.0, -0.60, 1.10), 0)
        bx2(mb, (-6.4, 0.55, 0.72), (-5.3, 1.15, 1.10), 0)
        for (x0, x1, y0, y1) in ((-1.1, -0.1, 0.70, 1.25), (5.2, 6.0, -1.20, -0.60), (-6.4, -5.3, 0.55, 1.15)):
            yf = y0 if (y0 + y1) < 0 else y1                                         # outboard face
            bx2(mb, (x0 + 0.03, yf - 0.006, 0.80), (x1 - 0.03, yf + 0.006, 0.82), 1)  # lid seam strip
            for k in range(2):                                                        # latches
                xx = x0 + (x1 - x0) * (k + 1) / 3
                bx2(mb, (xx - 0.03, yf - 0.012, 0.86), (xx + 0.03, yf + 0.012, 0.95), 1)
        # pipes along the car
        for (yy, zz, rr) in ((0.65, 1.00, 0.022), (-0.65, 1.00, 0.022), (1.25, 1.06, 0.03), (-1.10, 1.02, 0.035)):
            cyl(mb, (-HALF + 0.15, yy, zz), (HALF - 0.15, yy, zz), rr, 10, 1)
        # toilet drop chute (old 22-type)
        cyl(mb, (-10.6, 0.55, 0.62), (-10.6, 0.55, 1.12), 0.07, 14, 0)
        cyl(mb, (10.0, -0.55, 0.66), (10.0, -0.55, 1.12), 0.06, 14, 0)
    return mb.mesh('crg_under_' + lod)


def _ends_mesh(lod):
    """Bellows (mat 0), steel face plates / couplers (mat 1), hoses (mat 2), red cock handles (mat 3) — both ends."""
    mb = MB()
    zc, bw, bh = 2.27, 1.16, 2.16
    path = rrect(0, zc, bw, bh, 0.16, 5)
    nf = 8
    for sx in (-1, 1):
        x0, x1 = HALF, HALF + 0.44
        sec = [(0.0, x0)]
        for k in range(nf):
            a = x0 + (x1 - x0) * (k + 0.5) / nf
            b = x0 + (x1 - x0) * (k + 1.0) / nf
            sec += [(0.045, a - 0.016), (0.072, a - 0.006), (0.072, a + 0.006), (0.045, a + 0.016), (0.0, b - 0.006),
                    (0.0, b)]
        sec = [(n, sx * w) for n, w in sec]
        sweep(mb, path, sec, _yz, 0, closed_section=False)
        # inner sleeve so the bellows never looks hollow
        sweep(mb, path, [(-0.002, sx * x0), (-0.002, sx * (x1 + 0.03))], _yz, 0, closed_section=False)
        # face plate (where neighbours meet) and end-wall mounting frame
        fp = [(-0.05, sx * x1), (0.075, sx * x1), (0.075, sx * (HALF + 0.50)), (-0.05, sx * (HALF + 0.50))]
        sweep(mb, path, fp, _yz, 1)
        mf = [(-0.03, sx * (HALF - 0.005)), (0.08, sx * (HALF - 0.005)), (0.08, sx * (HALF + 0.03)),
              (-0.03, sx * (HALF + 0.03))]
        sweep(mb, path, mf, _yz, 1)
        # coupler: draft gear housing, shank, head, knuckle, guard arm
        xs = sx

        def X(a):
            return xs * a
        bx2(mb, (min(X(11.6), X(12.14)), -0.2, 0.76), (max(X(11.6), X(12.14)), 0.2, 1.0), 1)
        bx2(mb, (min(X(12.10), X(12.60)), -0.09, 0.80), (max(X(12.10), X(12.60)), 0.09, 0.96), 1)
        bx2(mb, (min(X(12.55), X(12.72)), -0.15, 0.70), (max(X(12.55), X(12.72)), 0.12, 1.06), 1)
        cyl(mb, (X(12.68), xs * 0.13, 0.73), (X(12.68), xs * 0.13, 1.03), 0.075, 16, 1)
        bx2(mb, (min(X(12.62), X(12.75)), -0.21 * 1, 0.76), (max(X(12.62), X(12.75)), -0.13, 1.00), 1) if xs > 0 else \
            bx2(mb, (min(X(12.62), X(12.75)), 0.13, 0.76), (max(X(12.62), X(12.75)), 0.21, 1.00), 1)
        if lod == 'hero':
            # uncoupling lever
            tube(mb, [(X(12.62), 0.0, 1.08), (X(12.40), -0.25 * xs, 1.10), (X(12.33), -1.25 * xs, 1.10),
                      (X(12.33), -1.38 * xs, 1.02)], 0.014, 8, 1)
            # brake + main reservoir hoses with angle cocks and glad hands
            for yy in (-0.34, 0.34):
                p0 = (X(12.30), yy, 0.86)
                cyl(mb, (X(12.20), yy, 0.86), p0, 0.03, 12, 1)
                bx2(mb, (min(X(12.26), X(12.30)), yy - 0.01, 0.89), (max(X(12.26), X(12.30)), yy + 0.01, 0.99), 3)
                pts = bez(p0, (X(12.48), yy, 0.84), (X(12.62), yy * 0.95, 0.60), (X(12.70), yy * 0.9, 0.62), 18)
                tube(mb, pts, 0.022, 10, 2)
                bx2(mb, (min(X(12.68), X(12.76)), yy * 0.9 - 0.035, 0.58), (max(X(12.68), X(12.76)), yy * 0.9 + 0.035, 0.66), 1)
            # electrical jumper cable hanging under the bellows
            sock = (X(HALF + 0.02), 0.95, 1.22)
            bx2(mb, (min(X(HALF), X(HALF + 0.08)), 0.87, 1.16), (max(X(HALF), X(HALF + 0.08)), 1.03, 1.30), 1)
            pts = bez(sock, (X(12.45), 0.95, 1.05), (X(12.62), 0.75, 0.86), (X(12.74), 0.60, 1.00), 22)
            tube(mb, pts, 0.026, 10, 2)
    return mb.mesh('crg_ends_' + lod)


# ================================================================ bogie + wheelset
WHEEL_PROF = [(0.000, 0.395), (0.000, 0.468), (0.003, 0.478), (0.009, 0.4835), (0.016, 0.4848), (0.023, 0.4830),
              (0.029, 0.4770), (0.034, 0.4680), (0.040, 0.4615), (0.048, 0.4588), (0.060, 0.4580), (0.070, 0.4575),
              (0.100, 0.4560), (0.122, 0.4549), (0.128, 0.4530), (0.133, 0.4480), (0.135, 0.4440), (0.135, 0.4050),
              (0.128, 0.3950), (0.110, 0.3850), (0.090, 0.3300), (0.085, 0.2700), (0.098, 0.2200), (0.120, 0.1900),
              (0.150, 0.1750), (0.160, 0.1650), (0.160, 0.1000), (-0.020, 0.1000), (-0.020, 0.1550), (-0.010, 0.1700),
              (0.020, 0.2000), (0.045, 0.2600), (0.050, 0.3300), (0.030, 0.3800), (0.012, 0.3920)]
BACK_TO_BACK = 1.353


def _wheelset_mesh(lod):
    """Axle + two wheels, origin at the axle centre. mats: 0 tread (polished), 1 web (rusty), 2 axle, 3 paint mark."""
    mb = MB()
    seg = 128 if lod == 'hero' else 48
    mats = [0 if 2 <= k <= 13 else 1 for k in range(len(WHEEL_PROF))]
    for s in (-1, 1):
        revolve(mb, WHEEL_PROF, seg, to_y(0, s * BACK_TO_BACK / 2, 0, s), mats)
        # slip check mark on the rim face
        a0, a1 = -0.03, 0.03
        y = s * (BACK_TO_BACK / 2 + 0.1357)
        q = [(0.406, a0), (0.443, a0 * 0.95), (0.443, a1 * 0.95), (0.406, a1)]
        verts = [(r * math.sin(t), y, r * math.cos(t)) for r, t in q]
        mb.add(verts, [(0, 1, 2, 3)], 3)
    prof = [(-0.86, 0.075), (-0.70, 0.075), (-0.69, 0.098), (-0.56, 0.098), (-0.54, 0.088), (0.54, 0.088),
            (0.56, 0.098), (0.69, 0.098), (0.70, 0.075), (0.86, 0.075)]
    revolve(mb, prof, 32 if lod == 'hero' else 16, lambda a, r, t: (r * math.sin(t), a, r * math.cos(t)), 2,
            closed=False)
    return mb.mesh('crg_wheelset_' + lod, smooth_angle=50)


def _arc_block(mb, cx, cz, y0, y1, r0, r1, p0, p1, n, mat):
    """Curved block (brake shoe) around a Y axis through (cx, *, cz): radii r0..r1, angles p0..p1 (from +X, CCW in XZ)."""
    verts, faces = [], []
    for i in range(n + 1):
        a = p0 + (p1 - p0) * i / n
        ca, sa = math.cos(a), math.sin(a)
        for (y, r) in ((y0, r0), (y1, r0), (y1, r1), (y0, r1)):
            verts.append((cx + r * ca, y, cz + r * sa))
    for i in range(n):
        for k in range(4):
            k2 = (k + 1) % 4
            faces.append((i * 4 + k, (i + 1) * 4 + k, (i + 1) * 4 + k2, i * 4 + k2))
    faces.append((3, 2, 1, 0)); faces.append((n * 4, n * 4 + 1, n * 4 + 2, n * 4 + 3))
    mb.add(verts, faces, mat)


def _bogie_mesh(lod):
    """Cast-steel passenger bogie (209-like). Origin at the bogie centre on rail top.
    mats: 0 frame paint, 1 springs, 2 brake shoes, 3 rubber, 4 steel"""
    mb = MB()
    hero = lod == 'hero'
    frame = [(-1.86, 0.70), (-1.86, 0.80), (-1.72, 0.865), (1.72, 0.865), (1.86, 0.80), (1.86, 0.70), (0.62, 0.70),
             (0.48, 0.655), (-0.48, 0.655), (-0.62, 0.70)]
    for s in (-1, 1):
        prism(mb, frame, s * 0.93, s * 1.11, _xz, 0)
        if hero:
            # top flange, ribs
            lo, hi = sorted((s * 0.915, s * 1.125))
            bx2(mb, (-1.70, lo, 0.845), (1.70, hi, 0.877), 0)
            for xr in (-1.44, -0.96, -0.62, 0.62, 0.96, 1.44):
                lo, hi = sorted((s * 1.105, s * 1.125))
                bx2(mb, (xr - 0.02, lo, 0.70), (xr + 0.02, hi, 0.85), 0)
        for xw in (-WB, WB):
            # axle box with end cover and bolts
            cyl(mb, (xw, s * 0.86, 0.4575), (xw, s * 1.12, 0.4575), 0.135, 28 if hero else 12, 0)
            cyl(mb, (xw, s * 1.12, 0.4575), (xw, s * 1.15, 0.4575), 0.122, 28 if hero else 12, 4)
            if hero:
                cyl(mb, (xw, s * 1.15, 0.4575), (xw, s * 1.166, 0.4575), 0.05, 16, 4)
                for k in range(6):
                    a = 2 * math.pi * k / 6 + 0.3
                    px, pz = xw + 0.095 * math.cos(a), 0.4575 + 0.095 * math.sin(a)
                    cyl(mb, (px, s * 1.15, pz), (px, s * 1.164, pz), 0.012, 6, 4)
                # spring seat wings, springs with guide pillars, caps
                lo, hi = sorted((s * 0.95, s * 1.09))
                bx2(mb, (xw - 0.33, lo, 0.45), (xw + 0.33, hi, 0.495), 0)
                for dx in (-0.25, 0.25):
                    coil(mb, xw + dx, s * 1.02, 0.495, 0.70, 0.066, 0.015, 5.0, 8, 18, 1)
                    cyl(mb, (xw + dx, s * 1.02, 0.495), (xw + dx, s * 1.02, 0.70), 0.028, 10, 4)
                    cyl(mb, (xw + dx, s * 1.02, 0.685), (xw + dx, s * 1.02, 0.70), 0.085, 16, 0)
                # speed-sensor cable from one axle-box cover up to the frame
                if xw > 0:
                    tube(mb, bez((xw + 0.03, s * 1.17, 0.40), (xw + 0.10, s * 1.22, 0.30), (xw + 0.38, s * 1.20, 0.55),
                                 (xw + 0.42, s * 1.125, 0.76), 20), 0.011, 8, 3)
                    cyl(mb, (xw + 0.03, s * 1.15, 0.40), (xw + 0.03, s * 1.18, 0.40), 0.02, 10, 4)
        if hero:
            # spring plank, central (bolster) springs, swing hangers, vertical damper
            lo, hi = sorted((s * 0.94, s * 1.10))
            bx2(mb, (-0.40, lo, 0.24), (0.40, hi, 0.29), 0)
            for dx in (-0.20, 0.20):
                coil(mb, dx, s * 1.02, 0.29, 0.56, 0.095, 0.024, 4.5, 8, 18, 1)
            for dx in (-0.44, 0.44):
                lo, hi = sorted((s * 1.115, s * 1.155))
                bx2(mb, (dx - 0.03, lo, 0.23), (dx + 0.03, hi, 0.72), 0)
                cyl(mb, (dx, s * 1.10, 0.27), (dx, s * 1.17, 0.27), 0.03, 10, 4)
                cyl(mb, (dx, s * 1.10, 0.68), (dx, s * 1.17, 0.68), 0.03, 10, 4)
            cyl(mb, (0.58, s * 1.16, 0.30), (0.58, s * 1.16, 0.58), 0.042, 14, 4)
            cyl(mb, (0.58, s * 1.16, 0.58), (0.58, s * 1.16, 0.70), 0.018, 10, 4)
            cyl(mb, (0.58, s * 1.13, 0.30), (0.58, s * 1.19, 0.30), 0.03, 10, 4)
            # brake: shoes on the inboard side of each wheel, heads, hangers, beams
            for xw in (-WB, WB):
                inward = math.pi if xw > 0 else 0.0
                y0, y1 = sorted((s * 0.712, s * 0.802))
                _arc_block(mb, xw, 0.4575, y0, y1, WHEEL_R + 0.003, WHEEL_R + 0.055, inward - 0.30, inward + 0.30, 10, 2)
                y0, y1 = sorted((s * 0.70, s * 0.815))
                _arc_block(mb, xw, 0.4575, y0, y1, WHEEL_R + 0.055, WHEEL_R + 0.085, inward - 0.22, inward + 0.22, 8, 0)
                hx = xw + (-1 if xw > 0 else 1) * (WHEEL_R + 0.10)
                lo, hi = sorted((s * 0.89, s * 0.93))
                bx2(mb, (hx - 0.02, lo, 0.44), (hx + 0.02, hi, 0.70), 0)
        # bolster end visible under the frame
        lo, hi = sorted((s * 0.90, s * 1.14))
        bx2(mb, (-0.19, lo, 0.56), (0.19, hi, 0.66), 0)
    # transoms, end beams, bolster, pivot
    for xt in (-0.42, 0.42):
        cyl(mb, (xt, -0.93, 0.78), (xt, 0.93, 0.78), 0.07, 16, 0)
    for xe in (-1.79, 1.79):
        bx2(mb, (xe - 0.05, -0.93, 0.72), (xe + 0.05, 0.93, 0.82), 0)
    bx2(mb, (-0.19, -0.90, 0.56), (0.19, 0.90, 0.68), 0)
    cyl(mb, (0, 0, 0.68), (0, 0, 0.80), 0.17, 24, 0)
    if hero:
        for yy in (-0.85, 0.85):
            bx2(mb, (-0.10, yy - 0.08, 0.68), (0.10, yy + 0.08, 0.76), 0)
        for xb in (-(WB - WHEEL_R - 0.10), WB - WHEEL_R - 0.10):
            cyl(mb, (xb, -0.80, 0.44), (xb, 0.80, 0.44), 0.035, 12, 4)
            bx2(mb, (xb - 0.02, -0.04, 0.40), (xb + 0.02, 0.04, 0.68), 0)
        tube(mb, [(-(WB - WHEEL_R - 0.10), 0, 0.62), (WB - WHEEL_R - 0.10, 0, 0.62)], 0.02, 8, 4)
    return mb.mesh('crg_bogie_' + lod)


# ================================================================ markings
def _markings_mesh(number, lod):
    """Painted cream car markings on both sides (flattened text, car coords)."""
    items = [('硬座车', 'NotoSansCJKsc-Bold.otf', 0.13, 7.95, 1.72),
             (f'YZ22  {number}', 'NotoSansCJKsc-Bold.otf', 0.13, 9.30, 1.72),
             ('北京局  京段', 'NotoSansCJKsc-Bold.otf', 0.095, -8.6, 1.73)]
    if lod == 'hero':
        items += [('定员 118', 'NotoSansCJKsc-Bold.otf', 0.048, -10.15, 1.57),
                  ('自重 42.0t   换长 2.2', 'NotoSansCJKsc-Bold.otf', 0.048, -10.15, 1.50)]
    mb = MB()
    tmp_coll = bpy.context.scene.collection
    for (txt, font, size, x, z) in items:
        o = text_obj('_crg_txt', txt, font=font, size=size, coll=tmp_coll)
        o.data.resolution_u = 4
        me = _eval_mesh(o)
        verts = [v.co.copy() for v in me.vertices]
        polys = [tuple(p.vertices) for p in me.polygons]
        bpy.data.objects.remove(o); bpy.data.meshes.remove(me)
        for s in (-1, 1):
            out = []
            for v in verts:
                if s < 0:   # reads from -Y: text x -> +X, text y -> +Z
                    out.append((x + v.x, -(W_OUT + 0.0015), z + v.y))
                else:       # reads from +Y: text x -> -X
                    out.append((-x - v.x, W_OUT + 0.0015, z + v.y))
            mb.add(out, polys, 0)
    return mb.mesh('crg_marks_' + str(number), smooth_angle=None, recalc=False)


# ================================================================ assembly
def _number_for(name):
    return 345678 + (sum(ord(c) * (i + 1) for i, c in enumerate(name)) % 97) * 7


def build_carriage(name='car', x=0.0, coll=None, lod='hero', number=None, standin=False):
    """Build one 22/25B-type 硬座 car centred at (x, 0, 0). See the module docstring for the returned dict."""
    assert lod in ('hero', 'mid')
    hero = lod == 'hero'
    coll = coll or bpy.context.scene.collection
    M = materials()
    number = number or _number_for(name)
    root = bpy.data.objects.new(name, None)
    root.empty_display_type = 'ARROWS'; root.empty_display_size = 1.5
    coll.objects.link(root)
    root.location = (x, 0, 0)
    parts = {}

    def add(key, me, mats, loc=(0, 0, 0), rot=(0, 0, 0), parent=root):
        if mats and not me.materials:
            _set_mats(me, mats)
        o = _obj(f'{name}.{key}', me, coll, parent, loc, rot)
        parts[key] = o
        return o

    body = add('body', _cached('crg_shell', _shell_mesh), [M['paint'], M['inner'], M['roof']])
    dm = bpy.data.meshes.get('crg_doors')
    if dm is None:
        dm, fm = _doors_mesh(); dm.name = 'crg_doors'; fm.name = 'crg_doorfit'
        _set_mats(dm, [M['paint_door']]); _set_mats(fm, [M['alu'], M['rubber'], M['handle']])
    doors = add('doors', dm, [])
    add('doorfit', bpy.data.meshes['crg_doorfit'], [])
    add('fittings', _cached('crg_fittings_' + lod, lambda: _fittings_mesh(lod)),
        [M['handle'], M['step'], M['paint_door'], M['vest']])
    add('drip', _cached('crg_drip', _drip_mesh), [M['roof']])
    vm = bpy.data.meshes.get('crg_vents_' + lod)
    if vm is None:
        vm, vs = _vent_mesh(lod); vm.name = 'crg_vents_' + lod
        if vs is not None:
            vs.name = 'crg_ventsnow'
    add('vents', vm, [M['roof']])
    add('roofsnow', _cached('crg_roofsnow', _roof_snow_mesh), [M['snow']])
    if hero:
        add('ventsnow', bpy.data.meshes['crg_ventsnow'], [M['snow']])
    add('under', _cached('crg_under_' + lod, lambda: _under_mesh(lod)), [M['under'], M['steel'], M['rubber'], M['red']])
    add('ends', _cached('crg_ends_' + lod, lambda: _ends_mesh(lod)), [M['bellows'], M['steel'], M['rubber'], M['red']])
    add('marks', _markings_mesh(number, lod), [M['mark']])

    # windows: frame + glass instanced per bay, sill snow unique per car
    fr = _cached('crg_winframe', _window_frame_mesh)
    if not fr.materials:
        _set_mats(fr, [M['alu'], M['rubber']])
    gm = _cached('crg_glass', _glass_mesh)
    if not gm.materials:
        _set_mats(gm, [M['glass']])
    glass = []
    rng = random.Random(number)
    sm = MB()
    for side in (-1, 1):
        for i, bxc in enumerate(BAYS):
            loc = (bxc, side * W_OUT, WIN_ZC)
            rot = (0, 0, 0) if side < 0 else (0, 0, math.pi)
            tag = f'{"L" if side < 0 else "R"}{i:02d}'
            add(f'winframe.{tag}', fr, [], loc, rot)
            glass.append(add(f'glass.{tag}', gm, [], loc, rot))
            _sill_snow(sm, bxc, side, rng)
    add('sillsnow', sm.mesh(f'crg_sillsnow_{number}', smooth_angle=70), [M['snow']])
    dg = _cached('crg_doorglass', _door_glass_mesh)
    if not dg.materials:
        _set_mats(dg, [M['glass']])
    glass.append(add('glass.doors', dg, []))

    # bogies + wheelsets
    bm = _cached('crg_bogie_' + lod, lambda: _bogie_mesh(lod))
    if not bm.materials:
        _set_mats(bm, [M['bogie'], M['spring'], M['shoe'], M['rubber'], M['steel']])
    wm = _cached('crg_wheelset_' + lod, lambda: _wheelset_mesh(lod))
    if not wm.materials:
        _set_mats(wm, [M['tread'], M['web'], M['axle'], M['mark']])
    bogies, wheels = [], []
    for bxp in (BOGIE_X, -BOGIE_X):
        b = add(f'bogie.{"A" if bxp > 0 else "B"}', bm, [], (bxp, 0, 0))
        bogies.append(b)
        for dx in (WB, -WB):
            w = _obj(f'{name}.wheelset.{len(wheels)}', wm, coll, b, (dx, 0, WHEEL_R))
            w.rotation_mode = 'XYZ'
            wheels.append(w)

    pa = bpy.data.objects.new(f'{name}.plaque_anchor', None)
    pa.empty_display_type = 'PLAIN_AXES'; pa.empty_display_size = 0.3
    coll.objects.link(pa); pa.parent = root; pa.location = (0.0, -(W_OUT + 0.006), 1.72)

    car = dict(root=root, body=body, wheels=wheels, bogies=bogies, glass=glass, plaque_anchor=pa,
               window_bays=list(BAYS), doors=doors, parts=parts, lod=lod, name=name, number=number)
    if standin:
        standin_interior(car, coll)
    return car


def spin_wheels(car, distance_m):
    """Rotate every wheelset for a travelled distance (rolling toward +X)."""
    a = distance_m / WHEEL_R
    for w in car['wheels']:
        w.rotation_euler[1] = a


def build_train(n_cars=6, x_front=0.0, coll=None, lods=None, standin=False):
    """n_cars coupled nose to tail along -X; car i centred at x_front - 25.5 * i."""
    out = []
    for i in range(n_cars):
        if lods is None:
            lod = 'hero' if i == 0 else 'mid'
        elif isinstance(lods, str):
            lod = lods
        else:
            lod = lods[i]
        out.append(build_carriage(f'car{i + 1:02d}', x_front - CAR_PITCH * i, coll, lod,
                                  number=345678 + 37 * i, standin=standin))
    return out


# ================================================================ test-only interior stand-in
def standin_interior(car, coll=None, lamp_w=90.0, spill_w=16.0):
    """Warm-lit stand-in so the windows glow tungsten in tests: floor, seat backs with white covers,
    tables, emissive ceiling lamp strips, a warm back panel and a few area lights."""
    coll = coll or bpy.context.scene.collection
    root = car['root']
    nm = car['name']
    mats = [_mat('crg_si_floor', lambda n: principled(n, '#4A3B2E', 0.55)),
            _mat('crg_si_seat', lambda n: principled(n, '#2C4A63', 0.8)),
            _mat('crg_si_cover', lambda n: principled(n, '#E8E2D2', 0.85)),
            _mat('crg_si_table', lambda n: principled(n, '#7A5A3E', 0.4)),
            _mat('crg_si_lamp', lambda n: emission(n, PAL['tungsten'], 20.0)),
            _mat('crg_si_back', lambda n: emission(n, '#FFB070', 0.9)),
            _mat('crg_si_curtain', lambda n: _curtain_mat(n))]
    me = bpy.data.meshes.get('crg_standin')
    if me is None:
        mb = MB()
        bx2(mb, (-11.0, -1.46, 1.27), (11.0, 1.46, 1.285), 0)
        for c in BAYS:
            for s in (-1, 1):
                lo, hi = sorted((s * 1.44, s * 0.25))
                for dx in (-0.66, 0.66):
                    bx2(mb, (c + dx - 0.06, lo, 1.30), (c + dx + 0.06, hi, 2.32), 1)
                    bx2(mb, (c + dx - 0.07, lo + 0.02, 2.12), (c + dx + 0.07, hi - 0.02, 2.36), 2)
                    bx2(mb, (c + dx * 0.55 - 0.22, lo, 1.70), (c + dx * 0.55 + 0.22, hi, 1.78), 1)
                lo, hi = sorted((s * 1.46, s * 1.02))
                bx2(mb, (c - 0.32, lo, 2.00), (c + 0.32, hi, 2.03), 3)
                # curtains bunched at the window sides
                for dx in (-0.45, 0.45):
                    lo, hi = sorted((s * 1.43, s * 1.40))
                    bx2(mb, (c + dx - 0.07, lo, 2.02), (c + dx + 0.07, hi, 3.0), 6)
            bx2(mb, (c - 0.7, -0.62, 3.84), (c + 0.7, -0.54, 3.86), 4)
            bx2(mb, (c - 0.7, 0.54, 3.84), (c + 0.7, 0.62, 3.86), 4)
        bx2(mb, (-10.9, -0.03, 1.4), (10.9, 0.03, 3.6), 5)
        me = mb.mesh('crg_standin')
        _set_mats(me, mats)
    out = [_obj(f'{nm}.standin', me, coll, root)]
    for c in BAYS:          # the light leaving each window (motivated spill onto the snow)
        for s in (-1, 1):
            ld = bpy.data.lights.new(f'{nm}.si_spill', 'AREA')
            ld.energy = spill_w; ld.color = srgb(PAL['tungsten'])[:3]; ld.shape = 'RECTANGLE'
            ld.size = 0.8; ld.size_y = 0.6; ld.spread = math.radians(28)
            lo = bpy.data.objects.new(f'{nm}.si_spill', ld); coll.objects.link(lo)
            lo.parent = root; lo.location = (c, s * 1.30, 2.55)
            lo.rotation_euler = (math.radians(45 * s), 0, 0)      # emits along local -Z: out and 45 deg down
            out.append(lo)
    for c in BAYS[::2]:
        ld = bpy.data.lights.new(f'{nm}.si_lamp', 'AREA')
        ld.energy = lamp_w; ld.color = srgb(PAL['tungsten'])[:3]; ld.shape = 'RECTANGLE'; ld.size = 1.6; ld.size_y = 1.6
        lo = bpy.data.objects.new(f'{nm}.si_lamp', ld); coll.objects.link(lo)
        lo.parent = root; lo.location = (c, 0, 3.70)
        out.append(lo)
    return out


def _curtain_mat(name):
    g = G(name)
    b = g.bsdf('#C9B48A', 0.9)
    t = g.n('ShaderNodeBsdfTranslucent'); t.inputs['Color'].default_value = srgb('#E0B070')
    return g.done(g.mixs(0.5, b.outputs[0], t.outputs[0]))


# ================================================================ test scenes / review stills
def _test_world(strength=0.42, moon_e=3.0, moon_el=20, moon_az=-150, bg=0.16):
    world_hdri('snowy_field', strength=strength, tint=PAL['night'], tint_mix=0.85, bg_strength=bg)
    return moon(strength=moon_e, elevation=moon_el, azimuth=moon_az)


def _ground_and_track(x0=-90, x1=60, joints=True):
    M = materials()
    coll = bpy.context.scene.collection
    snow = M['snow']
    # snow field with gentle undulation
    mb = MB()
    N = 160
    S = 220.0
    vs = []
    for j in range(N + 1):
        for i in range(N + 1):
            x = -S / 2 + S * i / N - 15
            y = -S / 2 + S * j / N
            d = max(0.0, abs(y) - 3.2)
            ridge = 0.32 * math.exp(-((abs(y) - 4.6) / 1.1) ** 2) * (0.8 + 0.4 * mnoise.noise(Vector((x * 0.08, 0.5, 0.2))))
            z = -0.9 + ridge + 0.35 * mnoise.noise(Vector((x * 0.035, y * 0.035, 0.3))) * min(1.0, d / 8) \
                + 0.08 * mnoise.noise(Vector((x * 0.25, y * 0.25, 1.3))) * min(1.0, d / 3)
            vs.append((x, y, z))
    fs = [(j * (N + 1) + i, j * (N + 1) + i + 1, (j + 1) * (N + 1) + i + 1, (j + 1) * (N + 1) + i)
          for j in range(N) for i in range(N)]
    mb.add(vs, fs, 0)
    g = _obj('snowfield', mb.mesh('snowfield', smooth_angle=None), coll)
    g.data.materials.append(_mat('t_snowground', _m_snow_ground))
    # ballast bed
    mb = MB()
    sec = [(-2.9, -0.95), (-1.75, -0.40), (1.75, -0.40), (2.9, -0.95)]
    prism(mb, [(y, z) for y, z in sec], x0, x1, _yz, 0)
    bo = _obj('ballast', mb.mesh('ballast', smooth_angle=None), coll)
    bo.data.materials.append(_mat('t_ballast', _m_ballast))
    # sleepers
    mb = MB()
    x = x0 + 0.3
    while x < x1:
        bx(mb, (0.24, 2.6, 0.20), (x, 0, -0.176 - 0.012 - 0.10), 0)
        x += 0.6
    so = _obj('sleepers', _apply_bevel(mb.mesh('sleepers', smooth_angle=None), 0.012, 2, 50), coll)
    so.data.materials.append(_mat('t_concrete', lambda n: _m_dirty_metal(n, '#8E8C86', 'concrete_wall_008', 0.8, 0.05,
                                                                           '#3A3430', (0.75, 0.95), 1.0, 0.05)))
    # rails (UIC60-ish) with joints every 12.5 m
    rail = [(-0.075, -0.176), (0.075, -0.176), (0.075, -0.165), (0.012, -0.145), (0.009, -0.060), (0.034, -0.045),
            (0.036, -0.006), (0.030, 0.0), (-0.030, 0.0), (-0.036, -0.006), (-0.034, -0.045), (-0.009, -0.060),
            (-0.012, -0.145), (-0.075, -0.165)]
    mb = MB()
    ks = [k * 12.5 for k in range(int(x0 // 12.5), int(x1 // 12.5) + 2)]
    for yc in (-0.7525, 0.7525):
        for a, b in zip(ks, ks[1:]):
            a2, b2 = max(a + 0.004, x0), min(b - 0.004, x1)
            if b2 <= a2:
                continue
            prism(mb, [(yc + y, z) for y, z in rail], a2, b2, _yz, 0)
        for k in ks:
            if x0 < k < x1:
                for sy in (-1, 1):   # joint bars + bolts
                    y = yc + sy * 0.022
                    lo, hi = sorted((y, y + sy * 0.018))
                    bx2(mb, (k - 0.40, lo, -0.120), (k + 0.40, hi, -0.055), 0)
                    for dx in (-0.30, -0.10, 0.10, 0.30):
                        cyl(mb, (k + dx, y + sy * 0.018, -0.088), (k + dx, y + sy * 0.040, -0.088), 0.014, 6, 0)
    ro = _obj('rails', _apply_bevel(mb.mesh('rails', smooth_angle=40), 0.002, 1, 50), coll)
    ro.data.materials.append(_mat('t_rail', _m_rail))
    # dry weeds poking through the snow beside the bank, and a line of wooden telegraph poles
    rng = random.Random(11)
    mb = MB()
    clumps = [(x0 + (x1 - x0) * rng.random(), (-1 if rng.random() < 0.7 else 1) * (3.2 + 10 * rng.random() ** 1.5))
              for _ in range(70)]
    for k in range(900):
        cxw, cyw = clumps[k % len(clumps)]
        x = cxw + rng.gauss(0, 0.35)
        y = cyw + rng.gauss(0, 0.25)
        if abs(y) < 3.0:
            continue
        z = -0.9 + 0.25 * mnoise.noise(Vector((x * 0.04, y * 0.04, 0.3))) * min(1.0, max(0.0, abs(y) - 3.2) / 8) - 0.02
        h = 0.08 + 0.35 * rng.random() ** 2
        lean = Vector(((rng.random() - 0.5) * 0.25, (rng.random() - 0.5) * 0.25, 1.0)).normalized()
        p0 = Vector((x, y, z)); p1 = p0 + lean * h
        tube(mb, [p0, p0.lerp(p1, 0.5) + Vector((0.01, 0, 0)), p1], (lambda t: 0.004 * (1 - 0.8 * t)), 4, 0, caps=False)
    wo = _obj('weeds', mb.mesh('weeds', smooth_angle=None, recalc=False), coll)
    wo.data.materials.append(_mat('t_weed', lambda n: principled(n, '#3B3022', 0.8)))
    mb = MB()
    for k in range(int(x0 // 50) - 1, int(x1 // 50) + 2):
        x = k * 50.0 + 7.0
        cyl(mb, (x, -16.0, -1.2), (x, -16.0, 7.5), 0.13, 12, 0)
        bx(mb, (0.12, 1.6, 0.10), (x, -16.0, 7.0), 0)
        bx(mb, (0.12, 1.2, 0.10), (x, -16.0, 6.5), 0)
    po = _obj('poles', mb.mesh('poles', smooth_angle=40), coll)
    po.data.materials.append(_mat('t_pole', lambda n: _m_dirty_metal(n, '#3A3028', 'rust_coarse_01', 0.5, 0.2,
                                                                        '#2A2018', (0.7, 0.9), 0.8, 0.05)))
    return g


def _m_snow_ground(name):
    g = G(name)
    t = ph_texture('snow_02')
    co = g.coord('Object')
    v = g.vmap(co, 0.5)
    d = g.img(t['diff'], v)
    col, _ = g.tinted(d, '#DCE6EE')
    b = g.bsdf(rough=0.6, **{'Subsurface Weight': 0.4, 'Subsurface Scale': 0.03, 'Subsurface Radius': (0.6, 0.8, 1.0)})
    g.L(col, b.inputs['Base Color'])
    g.L(g.normalmap(t['nor'], v, 0.8), b.inputs['Normal'])
    vor = g.n('ShaderNodeTexVoronoi'); vor.inputs['Scale'].default_value = 600.0; g.L(co, vor.inputs['Vector'])
    g.L(g.lin(g.ss(vor.outputs['Distance'], 0.05, 0.0), 0, 1, 0.6, 0.1), b.inputs['Roughness'])
    return g.done(b.outputs[0])


def _m_ballast(name):
    g = G(name)
    t = ph_texture('gravel_floor')
    co = g.coord('Object')
    v = g.vmap(co, 0.9)
    d = g.img(t['diff'], v)
    col, _ = g.tinted(d, '#4A4642')
    b = g.bsdf(rough=0.85)
    g.L(col, b.inputs['Base Color'])
    g.L(g.normalmap(t['nor'], v, 1.0), b.inputs['Normal'])
    sn = g.bsdf((0.80, 0.85, 0.9, 1), 0.6, **{'Subsurface Weight': 0.3, 'Subsurface Scale': 0.02})
    dsp = g.img(t['disp'], v, True)
    m = g.ss(g.add(g.mul(dsp.outputs['Color'], 0.6), g.mul(g.noise(co, 0.8, 3.0), 0.7)), 0.55, 0.75)
    return g.done(g.mixs(m, b.outputs[0], sn.outputs[0]))


def _m_rail(name):
    """Rail: polished running band on the head, rusty brown everywhere else, snow on the foot."""
    g = G(name)
    co = g.coord('Object'); xyz = g.sep(co)
    yl = g.sub(g.m('ABSOLUTE', xyz[1]), 0.7525)
    band = g.mul(g.ss(xyz[2], -0.006, -0.001), g.ss(g.m('ABSOLUTE', g.add(yl, 0.004)), 0.027, 0.019))
    rust = ph_texture('rust_coarse_01')
    v = g.vmap(co, 2.0)
    rd = g.img(rust['diff'], v)
    rc = g.mixc(0.75, rd.outputs['Color'], (0.20, 0.15, 0.12, 1), 'MULTIPLY')
    rc = g.mixc(g.mul(g.ss(g.noise(co, 8.0, 4.0, 0.6), 0.45, 0.7), 0.7), rc, (0.018, 0.015, 0.013, 1))
    steel = g.n('ShaderNodeBsdfPrincipled')
    steel.inputs['Metallic'].default_value = 1.0
    scr = g.noise(g.comb(g.mul(xyz[0], 3.0), g.mul(xyz[1], 900.0), 0.0), 1.0, 3.0)
    g.L(g.mixc(g.mul(scr, 0.3), (0.80, 0.80, 0.81, 1), (0.58, 0.58, 0.60, 1)), steel.inputs['Base Color'])
    g.L(g.add(0.12, g.mul(scr, 0.14)), steel.inputs['Roughness'])
    rb = g.bsdf(rough=0.8)
    g.L(rc, rb.inputs['Base Color'])
    g.L(g.normalmap(rust['nor'], v, 0.8), rb.inputs['Normal'])
    sh = g.mixs(band, rb.outputs[0], steel.outputs[0])
    return g.done(g.top_snow(sh, 0.9, (0.6, 0.9), 12.0, mask_mul=g.sub(1.0, g.ss(g.m('ABSOLUTE', yl), 0.03, 0.026))))


def _snowfall(center, size, n=1500, seed=1, cam=None, clear=1.5, rmax=0.004):
    """Falling snow: small soft flakes (slightly stretched = motion) scattered in a box, none within
    `clear` metres of the camera. One mesh."""
    rng = random.Random(seed)
    mb = MB()
    cx, cy, cz = center
    sx, sy, sz = size
    cp = Vector(cam.location) if cam is not None else None
    k = 0
    while k < n:
        p = Vector((cx + (rng.random() - 0.5) * sx, cy + (rng.random() - 0.5) * sy, cz + (rng.random() - 0.5) * sz))
        if cp is not None and (p - cp).length < clear:
            continue
        k += 1
        r = rmax * (0.35 + 0.65 * rng.random())
        L = r * (2.0 + 2.5 * rng.random())
        x, y, z = p
        v = [(x - r, y, z), (x + r, y, z), (x, y - r, z), (x, y + r, z), (x, y, z - L), (x, y, z + L)]
        f = [(0, 2, 5), (2, 1, 5), (1, 3, 5), (3, 0, 5), (2, 0, 4), (1, 2, 4), (3, 1, 4), (0, 3, 4)]
        mb.add(v, f, 0)
    o = _obj('snowfall', mb.mesh('snowfall', smooth_angle=None, recalc=False), bpy.context.scene.collection)
    o.data.materials.append(_mat('t_flake', _m_flake))
    o.visible_shadow = False
    return o


def _m_flake(name):
    g = G(name)
    b = g.bsdf('#F4F8FF', 0.6, **{'Emission Color': srgb('#DDE8FF'), 'Emission Strength': 0.25})
    tr = g.n('ShaderNodeBsdfTransparent')
    return g.done(g.mixs(0.35, b.outputs[0], tr.outputs[0]))


def _comp(haze='#5E86A6', amount=0.35, mist=(8.0, 120.0), vignette=0.28):
    """Compositor: mist-pass depth haze + a soft vignette."""
    sc = bpy.context.scene
    sc.view_layers[0].use_pass_mist = True
    w = sc.world
    w.mist_settings.start, w.mist_settings.depth = mist
    w.mist_settings.falloff = 'QUADRATIC'
    sc.use_nodes = True
    nt = sc.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    rl = nt.nodes.new('CompositorNodeRLayers')
    mul = nt.nodes.new('CompositorNodeMath'); mul.operation = 'MULTIPLY'; mul.inputs[1].default_value = amount
    nt.links.new(rl.outputs['Mist'], mul.inputs[0])
    mix = nt.nodes.new('CompositorNodeMixRGB')
    mix.inputs[2].default_value = srgb(haze)
    nt.links.new(mul.outputs[0], mix.inputs[0]); nt.links.new(rl.outputs['Image'], mix.inputs[1])
    last = mix.outputs[0]
    gl = nt.nodes.new('CompositorNodeGlare'); gl.glare_type = 'FOG_GLOW'; gl.quality = 'MEDIUM'
    gl.threshold = 0.9; gl.size = 8; gl.mix = -0.72
    nt.links.new(last, gl.inputs[0]); last = gl.outputs[0]
    if vignette:
        el = nt.nodes.new('CompositorNodeEllipseMask'); el.width = 0.95; el.height = 0.95
        bl = nt.nodes.new('CompositorNodeBlur'); bl.filter_type = 'FAST_GAUSS'; bl.use_relative = True
        bl.factor_x = bl.factor_y = 30.0
        nt.links.new(el.outputs[0], bl.inputs[0])
        mr = nt.nodes.new('CompositorNodeMapRange')
        mr.inputs[3].default_value = 1.0 - vignette; mr.inputs[4].default_value = 1.0
        nt.links.new(bl.outputs[0], mr.inputs[0])
        vm = nt.nodes.new('CompositorNodeMixRGB'); vm.blend_type = 'MULTIPLY'; vm.inputs[0].default_value = 1.0
        nt.links.new(last, vm.inputs[1]); nt.links.new(mr.outputs[0], vm.inputs[2])
        last = vm.outputs[0]
    comp = nt.nodes.new('CompositorNodeComposite')
    nt.links.new(last, comp.inputs[0])


def _render_setup(res, samples, exposure):
    setup_render(res=res, samples=samples, exposure=exposure)
    sc = bpy.context.scene
    sc.render.threads_mode = 'FIXED'; sc.render.threads = 2
    sc.cycles.adaptive_threshold = 0.02
    sc.cycles.use_light_tree = True
    sc.cycles.max_bounces = 6; sc.cycles.diffuse_bounces = 3; sc.cycles.glossy_bounces = 3
    sc.cycles.transparent_max_bounces = 12


def _luma(path):
    """Mean Rec.709 luma (0-255) of a written PNG."""
    import numpy as np
    im = bpy.data.images.load(path, check_existing=False)
    px = np.empty(len(im.pixels), dtype=np.float32)
    im.pixels.foreach_get(px)
    bpy.data.images.remove(im)
    px = px.reshape(-1, 4)
    return float((0.2126 * px[:, 0] + 0.7152 * px[:, 1] + 0.0722 * px[:, 2]).mean() * 255)


SHOTS = ('three_quarter', 'bogie_macro', 'flank', 'train_wide')


def render_review(shots=SHOTS, samples=64, res=(960, 540), out=OUT_DIR):
    os.makedirs(out, exist_ok=True)
    report = {}
    single = [s for s in shots if s != 'train_wide']
    if single:
        reset()
        t0 = time.time()
        _test_world()
        _ground_and_track(-60, 45)
        car = build_carriage('car', x=12.5 - BOGIE_X - WB - 0.15, lod='hero', standin=True)
        spin_wheels(car, 0.37)
        tb = time.time() - t0
        print(f'[carriage] single-car scene built in {tb:.1f}s')
        for shot in single:
            for o in [o for o in bpy.data.objects if o.name.startswith(('cam', 'snowfall', 'key', 'snowkick'))]:
                bpy.data.objects.remove(o)
            exp = _shot(shot, car)
            _render_setup(res, samples, exp)
            p = f'{out}/{shot}.png'
            t1 = time.time(); render_still(p); tr = time.time() - t1
            report[shot] = dict(build=tb, render=tr, luma=_luma(p))
            print(f'[carriage] {shot}: render {tr:.1f}s, mean luma {report[shot]["luma"]:.1f}')
    if 'train_wide' in shots:
        reset()
        t0 = time.time()
        _test_world()
        _ground_and_track(-110, 60)
        cars = build_train(4, x_front=20.0, lods=['hero', 'mid', 'mid', 'mid'], standin=True)
        for c in cars:
            spin_wheels(c, 1.3)
        tb = time.time() - t0
        print(f'[carriage] train scene built in {tb:.1f}s')
        exp = _shot('train_wide', cars)
        _render_setup(res, samples, exp)
        p = f'{out}/train_wide.png'
        t1 = time.time(); render_still(p); tr = time.time() - t1
        report['train_wide'] = dict(build=tb, render=tr, luma=_luma(p))
        print(f'[carriage] train_wide: render {tr:.1f}s, mean luma {report["train_wide"]["luma"]:.1f}')
    return report


def _shot(shot, car):
    """Places camera / key light / snowfall / haze for a review shot; returns the exposure."""
    sc = bpy.context.scene.collection
    if shot == 'three_quarter':
        cx = car['root'].location.x
        cam = camera('cam', loc=(cx + 24.5, -9.0, 1.35), look_at=(cx + 3.6, 0.0, 2.3), lens=42, fstop=4.0)
        cam.data.dof.focus_distance = 15.5
        _snowfall((cx + 14, -7, 2.0), (22, 12, 8), 2200, 3, cam, 2.5, 0.006)
        _comp(amount=0.30, mist=(10.0, 110.0))
        return 1.4
    if shot == 'bogie_macro':
        wx = car['root'].location.x + BOGIE_X + WB
        tgt = Vector((wx + 0.03, -0.7465, 0.002))                       # tread at rail contact
        cam = camera('cam', loc=(wx + 0.48, -1.03, 0.04), look_at=(wx + 0.02, -0.77, 0.065), lens=50, fstop=2.8)
        cam.data.dof.focus_distance = (cam.location - tgt).length
        for nm, loc, size, e, col, at in (
                ('key', (wx + 1.3, -2.3, 1.1), 1.4, 120, '#BFD4FF', (wx + 0.05, -0.8, 0.1)),           # moon key
                ('key_bounce', (wx + 1.7, -0.95, 0.12), 1.6, 70, '#A9C6DB', (wx + 0.2, -0.78, 0.15)),  # lit snow ahead
                ('key_rim', (wx - 0.9, -2.0, 2.3), 0.8, 30, PAL['tungsten'], (wx, -0.78, 0.1))):       # window spill
            
            k = bpy.data.lights.new(nm, 'AREA'); k.energy = e; k.size = size; k.color = srgb(col)[:3]
            ko = bpy.data.objects.new(nm, k); sc.objects.link(ko)
            ko.location = loc; aim(ko, at)
        _snowfall((wx + 0.3, -1.0, 0.25), (1.4, 1.0, 0.8), 160, 5, cam, 0.25, 0.0025)
        _snow_kick((wx, -0.75, 0.0))
        _comp(amount=0.15, mist=(0.5, 30.0), vignette=0.32)
        return 1.6
    if shot == 'flank':
        cx = car['root'].location.x
        cam = camera('cam', loc=(cx - 13.5, -2.35, 2.05), look_at=(cx + 6.0, -1.45, 2.55), lens=32, fstop=4.0)
        cam.data.dof.focus_distance = 7.0
        _snowfall((cx - 6, -2.8, 2.2), (14, 3, 5), 900, 7, cam, 1.2, 0.004)
        _comp(amount=0.25, mist=(4.0, 80.0))
        return 1.4
    if shot == 'train_wide':
        cars = car
        fx = cars[0]['root'].location.x
        cam = camera('cam', loc=(fx + 40.0, -26.0, 0.3), look_at=(fx - 4.5, -3.3, 1.7), lens=55, fstop=8.0)
        cam.data.dof.focus_distance = 42.0
        _snowfall((fx + 14, -18, 3), (40, 24, 10), 2600, 9, cam, 5.0, 0.009)
        _comp(amount=0.35, mist=(15.0, 160.0))
        return 1.4
    raise ValueError(shot)


if __name__ == '__main__':
    args = sys.argv[1:]
    samples, res = 64, (960, 540)
    if '--samples' in args:
        i = args.index('--samples'); samples = int(args[i + 1]); del args[i:i + 2]
    if '--res' in args:
        i = args.index('--res'); res = tuple(int(v) for v in args[i + 1].split('x')); del args[i:i + 2]
    shots = [a for a in args if a in SHOTS] or list(SHOTS)
    rep = render_review(shots, samples, res)
    for k, v in rep.items():
        print(f'[carriage] {k}: build {v["build"]:.1f}s render {v["render"]:.1f}s luma {v["luma"]:.1f}/255')
