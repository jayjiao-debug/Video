"""kit/props.py — hero props for 《开往零点的列车》 (bpy 4.2, Cycles).

World conventions (common.py): metres, Z up. Every prop is built with its origin at the centre of its
footprint, resting on z = loc[2] (put loc on a table top, e.g. the 硬座 table top at car-local z = 2.03).

API
---
build_tea_jar(loc=(0, 0, 0), coll=None, fill=0.78, sleeve=True, seed=7, lid_on=True)
    -> dict(root, glass, tea, leaves, lid, sleeve, fill_z)
    THE HERO OF FRAME 0. A reused canned-fruit glass jar 罐头瓶 used as a tea cup: 0.124 m tall with the lid,
    0.082 m diameter. Thick, slightly green soda-lime glass (closed solid: outer + inner wall, 6 mm base,
    moulded heel, label panel, shoulder, transfer bead and a helical thread on the neck), condensation fog
    on the inner glass above the tea. Green tea filled to `fill` (fraction of the inner height): IOR 1.33
    liquid with yellow-green volume absorption + a little forward scatter, a meniscus at the wall.
    20 long unfurled tea leaves (translucent, folded, curled) drifting at different depths, some upright,
    3 resting on the bottom, 2 floating. A printed red/gold tinplate twist-off lid (worn to bare tin at
    the edges) sits on the rim. sleeve=True adds a hand-knitted red wool sleeve 杯套 on the lower half.
    'root' is an Empty at loc (move/parent this). Glass and tea cast tinted (fake-caustic) shadows.
set_tea_ripple(jar, t_since_hit, strength=1.0) -> None
    Concentric rings on the tea surface for a 哐 hit t seconds ago: a ring wave front running in from the
    wall (≈0.23 m/s capillary-gravity speed, λ ≈ 7 mm) plus converging standing rings, decaying with
    τ ≈ 0.55 s. Edits the tea mesh's surface vertices in place (call it per frame before rendering).
    t_since_hit=None → calm (flat surface with the meniscus).
set_lid_tick(jar, amount) -> None
    The lid hop for a 哐 hit: amount 0..1 lifts the lid up to 2.5 mm, tilts it up to 2.5° and turns it 1.5°.
    0 puts it back at rest.
build_thermos(loc=(0, 0, 0), coll=None, height=0.30) -> root Empty   (Poly Haven 'modified_thermos', CC0,
    scaled to `height`; falls back to a modelled enamel thermos if the download fails)
build_mandarin(loc=(0, 0, 0), coll=None, seed=1, radius=0.034) -> object  (modelled: oblate, dimpled peel
    with oil-gland bump, calyx and a short stem; orange subsurface skin)
build_noodle_cup(loc=(0, 0, 0), coll=None) -> dict(root, cup, lid, noodles, fork)   (泡面 paper cup with a
    printed band, rolled rim, half-peeled foil lid curling back, noodles + broth, a white plastic fork)

Review stills: /home/user/venv-bpy/bin/python kit/props.py [tea_macro tea_ripple] [--samples N] [--res WxH]
(led_close / plaque / station_sign live in kit/led.py and kit/plaque.py; run kit/plaque.py / kit/led.py.)
"""
import bpy, math, random, os, sys, time
import numpy as np

sys.path.insert(0, '/home/user/Video/episodes/50-yinyue/train/blender')
from common import *  # noqa: F401,F403
import common as _C

OUT_DIR = '/tmp/claude-0/-home-user-Video/ca950e1c-26f8-5f17-9c2a-78a6336a8884/scratchpad/kit/props_signs'
GEN = os.path.join(_C.ASSETS, 'generated', 'props')

# ---------------------------------------------------------------- jar dimensions (metres)
R_OUT = 0.041
NECK_R = 0.0322
RIM_Z = 0.1197
GLASS_BOT_IN = 0.0068


# ================================================================ small node helpers
def _new_mat(name):
    mat = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new('ShaderNodeOutputMaterial')
    return mat, nt, out


def _n(nt, kind, ins=None, **props):
    n = nt.nodes.new(kind)
    for k, v in props.items():
        setattr(n, k, v)
    for k, v in (ins or {}).items():
        if hasattr(v, 'is_linked') or hasattr(v, 'links'):
            nt.links.new(v, n.inputs[k])
        else:
            n.inputs[k].default_value = v
    return n


def _math(nt, op, a, b=None, clamp=False):
    m = nt.nodes.new('ShaderNodeMath'); m.operation = op; m.use_clamp = clamp
    for i, v in enumerate((a, b)):
        if v is None:
            continue
        if isinstance(v, (int, float)):
            m.inputs[i].default_value = v
        else:
            nt.links.new(v, m.inputs[i])
    return m.outputs[0]


def _mr(nt, v, a0, a1, b0=0.0, b1=1.0, interp='SMOOTHSTEP'):
    m = nt.nodes.new('ShaderNodeMapRange'); m.interpolation_type = interp
    m.inputs['From Min'].default_value = a0; m.inputs['From Max'].default_value = a1
    m.inputs['To Min'].default_value = b0; m.inputs['To Max'].default_value = b1
    nt.links.new(v, m.inputs['Value'])
    return m.outputs[0]


def _mixc(nt, fac, a, b, blend='MIX'):
    m = nt.nodes.new('ShaderNodeMix'); m.data_type = 'RGBA'; m.blend_type = blend; m.clamp_result = True
    for sock, v in ((0, fac), (6, a), (7, b)):
        if isinstance(v, (int, float)):
            m.inputs[sock].default_value = v
        elif isinstance(v, (tuple, list)):
            m.inputs[sock].default_value = v
        else:
            nt.links.new(v, m.inputs[sock])
    return m.outputs[2]


def _mixs(nt, fac, a, b):
    m = nt.nodes.new('ShaderNodeMixShader')
    if isinstance(fac, (int, float)):
        m.inputs[0].default_value = fac
    else:
        nt.links.new(fac, m.inputs[0])
    nt.links.new(a, m.inputs[1]); nt.links.new(b, m.inputs[2])
    return m.outputs[0]


def _col(h):
    return srgb(h) if isinstance(h, str) else h


def _bump(nt, h, dist=0.0005, strength=1.0, normal=None):
    b = nt.nodes.new('ShaderNodeBump'); b.inputs['Distance'].default_value = dist
    b.inputs['Strength'].default_value = strength
    nt.links.new(h, b.inputs['Height'])
    if normal is not None:
        nt.links.new(normal, b.inputs['Normal'])
    return b.outputs[0]


def _shadow_tint(nt, shader, tint, strength=1.0):
    """Fake caustic: shadow rays pass the surface as tinted transparency (glass/liquid shadows glow)."""
    lp = nt.nodes.new('ShaderNodeLightPath')
    tr = _n(nt, 'ShaderNodeBsdfTransparent', {'Color': _col(tint)})
    fac = _math(nt, 'MULTIPLY', lp.outputs['Is Shadow Ray'], strength)
    return _mixs(nt, fac, shader, tr.outputs[0])


# ================================================================ geometry
def _lathe(name, prof, seg=128, coll=None, mats=(), dr=None, face_mat=None, attrs=None, smooth=True):
    """Revolve a (r, z) profile around Z. r == 0 points become single poles (no degenerate quads).
    dr(theta_array, r, z, k) -> radial offset array; face_mat(k) -> material index of band k..k+1;
    attrs: {name: per-profile-point floats} stored as POINT float attributes. Returns (obj, ring_index_list)."""
    th = np.linspace(0, 2 * np.pi, seg, endpoint=False)
    V, rings = [], []
    A = {n: [] for n in (attrs or {})}
    for k, (r, z) in enumerate(prof):
        if r <= 1e-7:
            rings.append(np.full(seg, len(V))); V.append(np.array([[0.0, 0.0, z]]))
            for n in A:
                A[n].append(np.array([attrs[n][k]]))
        else:
            rr = r + (dr(th, r, z, k) if dr else 0.0)
            start = sum(len(v) for v in V)
            rings.append(np.arange(start, start + seg))
            V.append(np.stack([rr * np.cos(th), rr * np.sin(th), np.full(seg, z)], 1))
            for n in A:
                A[n].append(np.full(seg, attrs[n][k]))
    # fix pole indices (computed before concatenation)
    off, fixed = 0, []
    for v, rg in zip(V, rings):
        fixed.append(rg if len(v) > 1 else np.full(seg, off))
        off += len(v)
    rings = fixed
    verts = np.concatenate(V)
    faces, fm = [], []
    for k in range(len(prof) - 1):
        a, b = rings[k], rings[k + 1]
        m = face_mat(k) if face_mat else 0
        for i in range(seg):
            j = (i + 1) % seg
            f = []
            for v in (a[i], a[j], b[j], b[i]):
                if v not in f:
                    f.append(int(v))
            if len(f) >= 3:
                faces.append(f); fm.append(m)
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts.tolist(), [], faces)
    me.update()
    me.polygons.foreach_set('material_index', fm)
    for n, vals in A.items():
        at = me.attributes.new(n, 'FLOAT', 'POINT')
        at.data.foreach_set('value', np.concatenate(vals).astype(np.float32))
    if smooth:
        me.shade_smooth()
    o = bpy.data.objects.new(name, me)
    link(o, coll)
    for m in mats:
        o.data.materials.append(m)
    return o, rings


def _interp_r(prof, z):
    """Radius of a monotone-in-z profile segment list at height z."""
    zs = [p[1] for p in prof]; rs = [p[0] for p in prof]
    if zs[0] > zs[-1]:
        zs, rs = zs[::-1], rs[::-1]
    return float(np.interp(z, zs, rs))


def _jar_profiles():
    """Outer (bottom centre → rim) and inner (rim → bottom centre) glass profiles, plus attrs."""
    outer = [(0.0, 0.0030), (0.012, 0.0028), (0.024, 0.0020), (0.031, 0.0010), (0.0345, 0.0002), (0.0362, 0.0),
             (0.0378, 0.0003), (0.0392, 0.0011), (0.0402, 0.0025), (0.0408, 0.0045), (0.04100, 0.0075),
             (0.04100, 0.0160), (0.04085, 0.0180), (0.04060, 0.0200)]  # step into the moulded label panel
    for z in np.linspace(0.0215, 0.0745, 12):
        outer.append((0.04060, float(z)))
    outer += [(0.04085, 0.0765), (0.04100, 0.0785), (0.04100, 0.0890), (0.04090, 0.0920), (0.04045, 0.0950),
              (0.03960, 0.0978), (0.03830, 0.1003), (0.03680, 0.1022), (0.03530, 0.1038), (0.03420, 0.1052),
              (0.03400, 0.1062), (0.03455, 0.1072), (0.03460, 0.1086), (0.03380, 0.1096), (0.03260, 0.1101)]
    for z in np.arange(0.1104, 0.1186, 0.00022):
        outer.append((NECK_R, float(z)))
    outer += [(0.03215, 0.1189), (0.03185, 0.1194), (0.03130, 0.1197), (0.03040, 0.1197), (0.02970, 0.1193),
              (0.02935, 0.1186)]
    inner = [(0.02925, 0.1170), (0.02920, 0.1100), (0.02960, 0.1060), (0.03120, 0.1035), (0.03400, 0.1010),
             (0.03640, 0.0985), (0.03780, 0.0955), (0.03815, 0.0925)]
    for z in np.linspace(0.0900, 0.0150, 16):
        inner.append((0.03820, float(z)))
    inner += [(0.03810, 0.0115), (0.03760, 0.0088), (0.03640, 0.0074), (0.0340, 0.0068), (0.024, 0.0066),
              (0.012, 0.0067), (0.0, 0.0068)]
    return outer, inner


def _thread_dr(th, r, z, k):
    """Helical glass thread on the neck (single start, pitch 3.6 mm, ridge 1.1 mm, ends faded)."""
    if r < NECK_R - 1e-5 or r > NECK_R + 1e-5 or z < 0.1103 or z > 0.1187:
        return 0.0
    pitch = 0.0036
    ph = (z / pitch - th / (2 * np.pi)) % 1.0
    tri = np.clip(1.0 - np.abs(ph - 0.5) / 0.30, 0, 1)
    prof = tri ** 0.7 * (3 - 2 * tri) * tri  # rounded crest
    fade = np.clip((z - 0.1106) / 0.0018, 0, 1) * np.clip((0.1184 - z) / 0.0016, 0, 1)
    # thread starts / ends around the circumference like a lug finish (4 gaps)
    gaps = 0.55 + 0.45 * np.clip(np.cos(4 * th + 13.0 * z) * 3.0, -1, 1)
    return 0.0011 * prof * fade * np.clip(gaps, 0, 1)


# ---------------------------------------------------------------- materials
def mat_glass(name='prop_jar_glass', fog=False):
    """Thick soda-lime glass: faint green volume tint (edges read green), tiny surface waviness;
    fog=True adds condensation (droplet lenses + milky roughness) for the inner wall above the tea."""
    mat, nt, out = _new_mat(name)
    b = _n(nt, 'ShaderNodeBsdfPrincipled', {'Base Color': _col('#F4FBF6'), 'Roughness': 0.015, 'IOR': 1.52,
                                           'Transmission Weight': 1.0, 'Specular IOR Level': 0.5})
    tc = nt.nodes.new('ShaderNodeTexCoord')
    # moulded-glass waviness (very low frequency) so reflections are not CG-perfect
    nz = _n(nt, 'ShaderNodeTexNoise', {'Vector': tc.outputs['Object'], 'Scale': 38.0, 'Detail': 3.0})
    nrm = _bump(nt, nz.outputs['Fac'], dist=0.00012, strength=0.35)
    if fog:
        vor = _n(nt, 'ShaderNodeTexVoronoi', {'Vector': tc.outputs['Object'], 'Scale': 1400.0, 'Randomness': 1.0})
        vor.feature = 'F1'
        drop = _mr(nt, vor.outputs['Distance'], 0.42, 0.0)            # dome per droplet
        dens = _n(nt, 'ShaderNodeTexNoise', {'Vector': tc.outputs['Object'], 'Scale': 90.0, 'Detail': 4.0})
        sep = _n(nt, 'ShaderNodeSeparateXYZ', {'Vector': tc.outputs['Object']})
        # denser fog right above the tea, thinning toward the rim; patchy
        zf = _mr(nt, sep.outputs['Z'], 0.118, 0.096, 0.25, 1.0)
        patch = _mr(nt, dens.outputs['Fac'], 0.38, 0.62)
        amt = _math(nt, 'MULTIPLY', zf, patch)
        h = _math(nt, 'MULTIPLY', drop, amt)
        nrm = _bump(nt, h, dist=0.0004, strength=0.9, normal=nrm)
        rough = _mr(nt, amt, 0.0, 1.0, 0.03, 0.30, 'LINEAR')
        nt.links.new(rough, b.inputs['Roughness'])
    nt.links.new(nrm, b.inputs['Normal'])
    surf = _shadow_tint(nt, b.outputs[0], '#E9F5EC', 0.92)
    nt.links.new(surf, out.inputs['Surface'])
    va = _n(nt, 'ShaderNodeVolumeAbsorption', {'Color': (0.80, 0.92, 0.84, 1), 'Density': 6.0})
    nt.links.new(va.outputs[0], out.inputs['Volume'])
    return mat


def mat_tea(name='prop_tea'):
    """Green tea: clear yellow-green liquid. Absorption gives depth-dependent colour; a light forward scatter
    makes it glow when back-lit."""
    mat, nt, out = _new_mat(name)
    b = _n(nt, 'ShaderNodeBsdfPrincipled', {'Base Color': (1, 1, 1, 1), 'Roughness': 0.0, 'IOR': 1.333,
                                           'Transmission Weight': 1.0})
    surf = _shadow_tint(nt, b.outputs[0], (1, 1, 1, 1), 1.0)
    nt.links.new(surf, out.inputs['Surface'])
    va = _n(nt, 'ShaderNodeVolumeAbsorption', {'Color': (0.80, 0.86, 0.16, 1), 'Density': 26.0})
    vs = _n(nt, 'ShaderNodeVolumeScatter', {'Color': (1.0, 0.88, 0.42, 1), 'Density': 1.4, 'Anisotropy': 0.55})
    add = _n(nt, 'ShaderNodeAddShader')
    nt.links.new(va.outputs[0], add.inputs[0]); nt.links.new(vs.outputs[0], add.inputs[1])
    nt.links.new(add.outputs[0], out.inputs['Volume'])
    return mat


def mat_leaf(name='prop_tea_leaf'):
    mat, nt, out = _new_mat(name)
    tc = nt.nodes.new('ShaderNodeTexCoord')
    ob = _n(nt, 'ShaderNodeObjectInfo')
    at = _n(nt, 'ShaderNodeAttribute', attribute_name='leafvar')
    nz = _n(nt, 'ShaderNodeTexNoise', {'Vector': tc.outputs['Object'], 'Scale': 220.0, 'Detail': 5.0})
    vein = _n(nt, 'ShaderNodeTexWave', {'Vector': tc.outputs['UV'], 'Scale': 7.0, 'Distortion': 2.0,
                                        'Detail': 2.0}, wave_type='BANDS', bands_direction='X')
    c1 = _mixc(nt, at.outputs['Fac'], _col('#6E8A2C'), _col('#4D6420'))
    c2 = _mixc(nt, _mr(nt, nz.outputs['Fac'], 0.3, 0.7, 0.0, 0.35), c1, _col('#8E9A3A'))
    b = _n(nt, 'ShaderNodeBsdfPrincipled', {'Base Color': c2, 'Roughness': 0.42, 'Subsurface Weight': 0.0})
    tr = _n(nt, 'ShaderNodeBsdfTranslucent', {'Color': _col('#B8C84A')})
    nt.links.new(_bump(nt, vein.outputs['Fac'], 0.00008, 0.4), b.inputs['Normal'])
    s = _mixs(nt, 0.38, b.outputs[0], tr.outputs[0])
    nt.links.new(s, out.inputs['Surface'])
    return mat


def _lid_print_image(path, res=1024):
    """Printed lid top: tin-red lacquer with gold rings, a gold ring band of small characters, a medallion."""
    if os.path.exists(path):
        return path
    from PIL import Image, ImageDraw, ImageFont, ImageFilter
    os.makedirs(os.path.dirname(path), exist_ok=True)
    im = Image.new('RGB', (res, res), (168, 28, 26))
    d = ImageDraw.Draw(im)
    c = res / 2
    R = res / 2  # image spans r = 0.0355 m
    def ring(r0, r1, col):
        d.ellipse([c - r1, c - r1, c + r1, c + r1], fill=col)
        d.ellipse([c - r0, c - r0, c + r0, c + r0], fill=(168, 28, 26))
    gold = (222, 178, 84)
    ring(R * 0.865, R * 0.90, gold)
    ring(R * 0.62, R * 0.64, gold)
    ring(R * 0.565, R * 0.575, gold)
    # characters around the band
    f = ImageFont.truetype(f'{FONTS}/NotoSerifSC-Black.otf', int(res * 0.072))
    txt = '糖水黄桃·罐头食品·开胃清甜·'
    n = len(txt)
    for i, ch in enumerate(txt):
        a = -math.pi / 2 + 2 * math.pi * i / n
        tile = Image.new('L', (int(res * 0.1), int(res * 0.1)), 0)
        ImageDraw.Draw(tile).text((tile.width / 2, tile.height / 2), ch, font=f, fill=255, anchor='mm')
        tile = tile.rotate(-math.degrees(a) - 90, resample=Image.BICUBIC)
        rr = R * 0.752
        x, y = c + rr * math.cos(a) - tile.width / 2, c + rr * math.sin(a) - tile.height / 2
        im.paste(Image.new('RGB', tile.size, gold), (int(x), int(y)), tile)
    # medallion
    d.ellipse([c - R * 0.40, c - R * 0.40, c + R * 0.40, c + R * 0.40], fill=gold)
    d.ellipse([c - R * 0.36, c - R * 0.36, c + R * 0.36, c + R * 0.36], fill=(150, 22, 22))
    f2 = ImageFont.truetype(f'{FONTS}/NotoSerifSC-Black.otf', int(res * 0.24))
    d.text((c, c + res * 0.01), '桃', font=f2, fill=gold, anchor='mm')
    im = im.filter(ImageFilter.GaussianBlur(0.7))
    im.save(path)
    return path


def mat_lid(name='prop_jar_lid'):
    """Printed tinplate: red lacquer + gold print on top (image, object XY), two gold lines on the skirt,
    bare tin showing through where 'edge' is high (rim roll, skirt curl) and on scratches."""
    mat, nt, out = _new_mat(name)
    tc = nt.nodes.new('ShaderNodeTexCoord')
    sep = _n(nt, 'ShaderNodeSeparateXYZ', {'Vector': tc.outputs['Object']})
    # top print: object XY (r = 0.0355 → UV 0..1)
    mp = _n(nt, 'ShaderNodeMapping', {'Vector': tc.outputs['Object'], 'Scale': (1 / 0.071, 1 / 0.071, 1),
                                       'Location': (0.5, 0.5, 0)})
    img = _n(nt, 'ShaderNodeTexImage', {'Vector': mp.outputs[0]}, extension='EXTEND')
    img.image = bpy.data.images.load(_lid_print_image(f'{GEN}/lid_print.png'), check_existing=True)
    edge = _n(nt, 'ShaderNodeAttribute', attribute_name='edge').outputs['Fac']
    skirt = _n(nt, 'ShaderNodeAttribute', attribute_name='skirt').outputs['Fac']
    inside = _n(nt, 'ShaderNodeAttribute', attribute_name='inside').outputs['Fac']
    red = _col('#9E1C1A')
    gold = _col('#D9AE55')
    lines = _mr(nt, _math(nt, 'ABSOLUTE', _math(nt, 'SUBTRACT', sep.outputs['Z'], -0.0035)), 0.00035, 0.00015)
    lines2 = _mr(nt, _math(nt, 'ABSOLUTE', _math(nt, 'SUBTRACT', sep.outputs['Z'], -0.0058)), 0.00025, 0.0001)
    skirt_col = _mixc(nt, _math(nt, 'MAXIMUM', lines, lines2), red, gold)
    col = _mixc(nt, skirt, img.outputs['Color'], skirt_col)
    col = _mixc(nt, inside, col, _col('#C9A45A'))  # gold lacquer inside
    # wear: edges + scratches
    nz = _n(nt, 'ShaderNodeTexNoise', {'Vector': tc.outputs['Object'], 'Scale': 900.0, 'Detail': 8.0,
                                       'Roughness': 0.7})
    nz2 = _n(nt, 'ShaderNodeTexNoise', {'Vector': tc.outputs['Object'], 'Scale': 160.0, 'Detail': 4.0})
    wear_e = _math(nt, 'MULTIPLY', edge, _mr(nt, nz2.outputs['Fac'], 0.3, 0.62, 0.35, 1.0))
    wear = _mr(nt, _math(nt, 'ADD', wear_e, _math(nt, 'MULTIPLY', nz.outputs['Fac'], 0.45)), 0.62, 0.70)
    wave = _n(nt, 'ShaderNodeTexWave', {'Vector': tc.outputs['Object'], 'Scale': 60.0, 'Distortion': 9.0,
                                        'Detail': 3.0}, wave_type='BANDS')
    scratch = _mr(nt, wave.outputs['Fac'], 0.985, 1.0, 0.0, 1.0)
    scratch = _math(nt, 'MULTIPLY', scratch, _mr(nt, nz2.outputs['Fac'], 0.55, 0.65))
    wear = _math(nt, 'MAXIMUM', wear, _math(nt, 'MULTIPLY', scratch, _math(nt, 'SUBTRACT', 1.0, skirt)), True)
    wear = _math(nt, 'MULTIPLY', wear, _math(nt, 'SUBTRACT', 1.0, inside))
    tin = _col('#B9B6AE')
    col = _mixc(nt, wear, col, tin)
    b = _n(nt, 'ShaderNodeBsdfPrincipled', {'Base Color': col, 'Coat Roughness': 0.12})
    nt.links.new(_mr(nt, wear, 0, 1, 0.0, 1.0, 'LINEAR'), b.inputs['Metallic'])
    nt.links.new(_mr(nt, wear, 0, 1, 0.28, 0.22, 'LINEAR'), b.inputs['Roughness'])
    nt.links.new(_mr(nt, wear, 0, 1, 0.8, 0.0, 'LINEAR'), b.inputs['Coat Weight'])
    # the lacquer is a little metallic-looking itself (printed tin)
    dust = _mr(nt, nz2.outputs['Fac'], 0.4, 0.8, 0.0, 0.25)
    nt.links.new(_bump(nt, _math(nt, 'ADD', wear, _math(nt, 'MULTIPLY', nz.outputs['Fac'], 0.2)), 0.00004, 0.6),
                 b.inputs['Normal'])
    nt.links.new(b.outputs[0], out.inputs['Surface'])
    return mat


def _knit_height(path, cell=(24, 28), cols=8, rows=8, seed=3):
    """Tileable stockinette height map (V stitches of two slanted lobes) with yarn twist and irregularity."""
    if os.path.exists(path):
        return path
    from PIL import Image
    os.makedirs(os.path.dirname(path), exist_ok=True)
    cw, ch = cell
    W, H = cw * cols, ch * rows
    rng = np.random.default_rng(seed)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    h = np.zeros((H, W), np.float32)
    for r in range(rows):
        for c in range(cols):
            jx, jy = rng.normal(0, 0.8), rng.normal(0, 0.8)
            sz = 1.0 + rng.normal(0, 0.05)
            for side in (-1, 1):
                cx = c * cw + cw / 2 + side * cw * 0.24 + jx
                cy = r * ch + ch * 0.55 + jy
                for ox in (-W, 0, W):
                    for oy in (-H, 0, H):
                        dx = xx - (cx + ox); dy = yy - (cy + oy)
                        a = side * 0.55
                        u = dx * math.cos(a) - dy * math.sin(a)
                        v = dx * math.sin(a) + dy * math.cos(a)
                        e = (u / (cw * 0.26 * sz)) ** 2 + (v / (ch * 0.62 * sz)) ** 2
                        lobe = np.clip(1 - e, 0, 1) ** 0.6
                        twist = 0.85 + 0.15 * np.sin((u * 0.9 + v * 1.6) * 1.3)
                        h = np.maximum(h, lobe * twist)
    h += rng.normal(0, 0.03, h.shape).astype(np.float32)
    h = np.clip(h, 0, 1)
    Image.fromarray((h * 255).astype(np.uint8)).save(path)
    return path


def mat_wool(name='prop_wool', knit_path=None, reps=(9, 2.0)):
    mat, nt, out = _new_mat(name)
    tc = nt.nodes.new('ShaderNodeTexCoord')
    sep = _n(nt, 'ShaderNodeSeparateXYZ', {'Vector': tc.outputs['Object']})
    ang = _math(nt, 'ARCTAN2', sep.outputs['Y'], sep.outputs['X'])
    u = _math(nt, 'MULTIPLY', _math(nt, 'ADD', _math(nt, 'DIVIDE', ang, 2 * math.pi), 0.5), reps[0])
    v = _math(nt, 'MULTIPLY', sep.outputs['Z'], 1.0 / (8 * 0.0036))
    cmb = _n(nt, 'ShaderNodeCombineXYZ', {'X': u, 'Y': v})
    img = _n(nt, 'ShaderNodeTexImage', {'Vector': cmb.outputs[0]}, extension='REPEAT', interpolation='Cubic')
    img.image = bpy.data.images.load(knit_path, check_existing=True)
    img.image.colorspace_settings.name = 'Non-Color'
    fz = _n(nt, 'ShaderNodeTexNoise', {'Vector': tc.outputs['Object'], 'Scale': 3000.0, 'Detail': 6.0})
    h = _math(nt, 'ADD', img.outputs['Color'], _math(nt, 'MULTIPLY', fz.outputs['Fac'], 0.25))
    big = _n(nt, 'ShaderNodeTexNoise', {'Vector': tc.outputs['Object'], 'Scale': 70.0, 'Detail': 3.0})
    base = _mixc(nt, _mr(nt, img.outputs['Color'], 0.0, 0.9), _col('#4A0B0A'), _col('#B5251E'))
    base = _mixc(nt, _mr(nt, big.outputs['Fac'], 0.35, 0.65, 0, 0.3), base, _col('#C8402E'))
    b = _n(nt, 'ShaderNodeBsdfPrincipled', {'Base Color': base, 'Roughness': 0.85, 'Sheen Weight': 0.8,
                                           'Sheen Roughness': 0.35, 'Sheen Tint': _col('#FF9A80'),
                                           'Subsurface Weight': 0.25, 'Subsurface Radius': (0.004, 0.0015, 0.001),
                                           'Subsurface Scale': 1.0})
    nt.links.new(_bump(nt, h, 0.0012, 1.0), b.inputs['Normal'])
    nt.links.new(b.outputs[0], out.inputs['Surface'])
    return mat


# ---------------------------------------------------------------- leaves
def _leaf_mesh(rng, L, W):
    nu, nv = 18, 7
    fold = rng.uniform(0.15, 0.55)
    curl = rng.uniform(-6, 6)
    twist = rng.uniform(-1.2, 1.2)
    ser = rng.uniform(0.03, 0.07)
    verts, uvs = [], []
    for i in range(nu + 1):
        u = i / nu
        w = (math.sin(math.pi * u ** 0.85) ** 0.85) * W / 2 * (1 + ser * math.sin(u * 46))
        w = max(w, 0.00025 if 0 < i < nu else 0.00008)
        for j in range(nv + 1):
            v = j / nv * 2 - 1
            x = u * L
            y = v * w
            z = fold * abs(y) + curl * (x - L / 2) ** 2 * 0.9
            # twist along length
            a = twist * (u - 0.5)
            y, z = y * math.cos(a) - z * math.sin(a), y * math.sin(a) + z * math.cos(a)
            # edge wave (unfurled leaves are crinkled)
            z += 0.0004 * math.sin(u * 19 + v * 2) * abs(v)
            verts.append((x - L / 2, y, z)); uvs.append((u, (v + 1) / 2))
    faces = []
    for i in range(nu):
        for j in range(nv):
            a = i * (nv + 1) + j
            faces.append((a, a + nv + 1, a + nv + 2, a + 1))
    # stem
    return verts, faces, uvs


def _build_leaves(name, coll, rng, r_in_fn, z_bot, z_top, n_float=13, n_bottom=4, n_top=2):
    """All leaves in one object. r_in_fn(z) = inner radius available at z."""
    allv, allf, alluv, var = [], [], [], []
    from mathutils import Matrix, Euler, Vector

    def place(L, W, loc, rot):
        v, f, uv = _leaf_mesh(rng, L, W)
        M = Matrix.Translation(loc) @ Euler(rot, 'XYZ').to_matrix().to_4x4()
        o = len(allv)
        vv = rng.uniform(0, 1)
        for p in v:
            allv.append(tuple(M @ Vector(p))); var.append(vv)
        allf.extend(tuple(o + k for k in face) for face in f)
        alluv.extend(uv[k] for face in f for k in face)

    def fits(L, loc, rot):
        from mathutils import Euler, Vector
        R = Euler(rot, 'XYZ').to_matrix()
        for s in (-0.5, 0.5):
            p = Vector(loc) + R @ Vector((s * L, 0, 0))
            if math.hypot(p.x, p.y) > r_in_fn(p.z) - 0.0022 or p.z < z_bot + 0.0008 or p.z > z_top - 0.0012:
                return False
        return True

    placed = 0
    tries = 0
    # drifting leaves: mostly upright-ish (unfurled leaves hang vertical in a glass)
    while placed < n_float and tries < 4000:
        tries += 1
        L = rng.uniform(0.020, 0.034); W = L * rng.uniform(0.30, 0.42)
        z = rng.uniform(z_bot + 0.012, z_top - 0.010)
        a = rng.uniform(0, 2 * math.pi); r = rng.uniform(0.0, 0.030)
        tilt = rng.uniform(math.radians(35), math.radians(88)) * (1 if rng.uniform() < 0.8 else 0.3)
        rot = (rng.uniform(-0.6, 0.6), -tilt, rng.uniform(0, 2 * math.pi))
        loc = (r * math.cos(a), r * math.sin(a), z)
        if fits(L, loc, rot):
            place(L, W, loc, rot); placed += 1
    placed = 0
    while placed < n_bottom and tries < 8000:
        tries += 1
        L = rng.uniform(0.018, 0.030); W = L * rng.uniform(0.32, 0.42)
        a = rng.uniform(0, 2 * math.pi); r = rng.uniform(0.0, 0.026)
        rot = (rng.uniform(-0.15, 0.15), rng.uniform(-0.12, 0.12), rng.uniform(0, 2 * math.pi))
        loc = (r * math.cos(a), r * math.sin(a), z_bot + 0.0018 + rng.uniform(0, 0.0015))
        if fits(L, loc, rot):
            place(L, W, loc, rot); placed += 1
    placed = 0
    while placed < n_top and tries < 12000:
        tries += 1
        L = rng.uniform(0.016, 0.024); W = L * rng.uniform(0.32, 0.4)
        a = rng.uniform(0, 2 * math.pi); r = rng.uniform(0.004, 0.022)
        rot = (rng.uniform(-0.1, 0.1), rng.uniform(-0.1, 0.1), rng.uniform(0, 2 * math.pi))
        loc = (r * math.cos(a), r * math.sin(a), z_top - 0.0016)
        if fits(L, loc, rot) or True:
            place(L, W, loc, rot); placed += 1
    me = bpy.data.meshes.new(name)
    me.from_pydata(allv, [], allf)
    me.update()
    uvl = me.uv_layers.new(name='UVMap')
    uvl.data.foreach_set('uv', np.array(alluv, np.float32).ravel())
    at = me.attributes.new('leafvar', 'FLOAT', 'POINT'); at.data.foreach_set('value', np.array(var, np.float32))
    me.shade_smooth()
    o = bpy.data.objects.new(name, me); link(o, coll)
    return o


# ---------------------------------------------------------------- the jar
def build_tea_jar(loc=(0, 0, 0), coll=None, fill=0.78, sleeve=True, seed=7, lid_on=True):
    rng = np.random.default_rng(seed)
    root = bpy.data.objects.new('tea_jar', None); link(root, coll)
    root.empty_display_size = 0.05
    root.location = loc
    outer, inner = _jar_profiles()
    prof = outer + inner
    n_out = len(outer)
    fill_z = GLASS_BOT_IN + fill * (RIM_Z - GLASS_BOT_IN)

    def face_mat(k):
        if k < n_out - 1:
            return 0
        z = 0.5 * (prof[k][1] + prof[min(k + 1, len(prof) - 1)][1])
        return 1 if z > fill_z + 0.0015 else 0

    gl, _ = _lathe('tea_jar.glass', prof, 160, coll, [mat_glass('prop_jar_glass'), mat_glass('prop_jar_glass_fog', True)],
                   dr=_thread_dr, face_mat=face_mat)
    gl.parent = root

    # ---- tea: follows the inner wall (+0.15 mm overlap into the glass), meniscus, fine radial top rings
    inner_up = inner[::-1]

    def r_in(z):
        return _interp_r(inner_up[1:], z)  # skip the axis point

    zb = GLASS_BOT_IN + 0.00005
    side = [(0.0, zb)]
    for rr in (0.012, 0.024, 0.034):
        side.append((rr + 0.0001, zb + (0.00002 if rr < 0.03 else 0.0003)))
    for z in np.linspace(0.0090, fill_z - 0.0015, 14):
        side.append((r_in(z) + 0.00015, float(z)))
    rw = r_in(fill_z) + 0.00015
    top = []
    # meniscus: rises ~1.3 mm at the wall over ~2.5 mm
    for d in (0.0, 0.0002, 0.0005, 0.0009, 0.0014, 0.002, 0.0028):
        top.append((rw - d, fill_z + 0.0013 * math.exp(-d / 0.0007)))
    for rr in np.arange(rw - 0.0034, 0.0002, -0.0004):
        top.append((float(rr), fill_z))
    top.append((0.0, fill_z))
    tprof = side + top
    tea, rings = _lathe('tea_jar.tea', tprof, 144, coll, [mat_tea()], smooth=True)
    tea.parent = root
    k0 = len(side)
    surf_idx = np.concatenate([np.unique(rings[k]) for k in range(k0, len(tprof))])
    co = np.empty(len(tea.data.vertices) * 3, np.float32); tea.data.vertices.foreach_get('co', co)
    co = co.reshape(-1, 3)
    tea['surf_idx'] = surf_idx.tolist()
    tea['surf_z'] = co[surf_idx, 2].tolist()
    tea['rw'] = rw

    leaves = _build_leaves('tea_jar.leaves', coll, rng, r_in, GLASS_BOT_IN, fill_z)
    leaves.data.materials.append(mat_leaf())
    leaves.parent = root

    # ---- lid (origin on the rim top); profile from axis outwards over the top, down the skirt, back inside
    lp = [(0.0, 0.0041), (0.006, 0.00405), (0.0105, 0.0039), (0.0122, 0.0034), (0.0135, 0.0032),
          (0.0240, 0.0032), (0.0275, 0.0031), (0.0292, 0.0029), (0.0305, 0.0031), (0.0322, 0.0039),
          (0.0336, 0.0043), (0.0347, 0.0040), (0.0354, 0.0031), (0.0357, 0.0018), (0.0358, 0.0000),
          (0.0358, -0.0035), (0.0358, -0.0060), (0.0357, -0.0074), (0.0353, -0.0083), (0.0346, -0.0087),
          (0.0339, -0.0083), (0.0337, -0.0074), (0.0337, -0.0005), (0.0333, 0.0006), (0.0310, 0.0014),
          (0.0285, 0.0009), (0.0270, 0.0014), (0.0, 0.0015)]
    edge = [0, 0, 0, .3, .2, 0, 0, .2, .2, .4, .9, 1.0, .9, .6, .25, .1, .2, .6, 1.0, 1.0, .8, .3, 0, 0, 0, 0, 0, 0]
    skirt = [0] * 13 + [1] * 10 + [1, 1, 1, 1, 1]
    skirt = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.0, 0.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    inside = [0] * 20 + [0.3] + [1] * 7

    def lid_dr(th, r, z, k):
        if 14 <= k <= 16:   # shallow lugs/knurl ribs on the skirt
            return 0.00012 * np.clip(np.sin(th * 72) * 3, -1, 1)
        return 0.0

    lid, _ = _lathe('tea_jar.lid', lp, 216, coll, [mat_lid()], dr=lid_dr,
                    attrs=dict(edge=edge, skirt=skirt, inside=inside))
    lid.parent = root
    lid.location = (0, 0, RIM_Z + 0.00005)
    lid.rotation_euler = (0, 0, rng.uniform(0, 2 * math.pi))
    lid['rest'] = (lid.location.z, lid.rotation_euler.z)
    if not lid_on:
        lid.hide_render = lid.hide_viewport = True

    sl = None
    if sleeve:
        kp = _knit_height(f'{GEN}/knit.png')
        from PIL import Image
        hk = np.asarray(Image.open(kp), np.float32) / 255.0
        z0, z1 = 0.006, 0.056
        ro, ri = R_OUT + 0.0034, R_OUT + 0.0003
        sp = [(ri, z1 - 0.001), (ri, z0 + 0.003), (ri + 0.0008, z0 + 0.0005), (ri + 0.0018, z0 - 0.0006),
              (ro - 0.0008, z0 - 0.0006), (ro, z0 + 0.0012)]
        for z in np.arange(z0 + 0.0025, z1 - 0.004, 0.0006):
            sp.append((ro, float(z)))
        # rolled rib top edge
        sp += [(ro + 0.0004, z1 - 0.0035), (ro + 0.0007, z1 - 0.002), (ro + 0.0004, z1 - 0.0004),
               (ro - 0.0012, z1 + 0.0006), (ri + 0.0012, z1 + 0.0003), (ri, z1 - 0.001)]
        reps = 9
        Hh, Ww = hk.shape

        def sdr(th, r, z, k):
            if r < ro - 1e-5:
                return 0.0
            uu = ((th / (2 * np.pi)) * reps * Ww).astype(int) % Ww
            vv = int((z / (8 * 0.0036)) * Hh) % Hh
            return 0.0011 * (hk[Hh - 1 - vv, uu] - 0.5)

        sl, _ = _lathe('tea_jar.sleeve', sp[:-1], 288, coll, [mat_wool(knit_path=kp, reps=(reps, 2))], dr=sdr)
        sl.parent = root
    return dict(root=root, glass=gl, tea=tea, leaves=leaves, lid=lid, sleeve=sl, fill_z=fill_z)


def set_tea_ripple(jar, t_since_hit, strength=1.0):
    tea = jar['tea']
    idx = np.array(tea['surf_idx'], np.int64)
    z0 = np.array(tea['surf_z'], np.float32)
    rw = float(tea['rw'])
    me = tea.data
    co = np.empty(len(me.vertices) * 3, np.float32); me.vertices.foreach_get('co', co)
    co = co.reshape(-1, 3)
    if t_since_hit is None or strength == 0:
        co[idx, 2] = z0
    else:
        t = max(0.0, float(t_since_hit))
        r = np.hypot(co[idx, 0], co[idx, 1])
        A = 0.00032 * strength * math.exp(-t / 0.55)
        lam = 0.0072; k = 2 * math.pi / lam; c = 0.23; w = k * c
        front = rw - c * t
        d = rw - r
        env_front = np.clip((r - front + 0.004) / 0.006, 0, 1)
        conv = np.sqrt(rw / (r + 0.008))
        z = A * conv * np.sin(k * d - w * t + 0.4) * env_front
        # standing rings (the jar 'rings' after the jolt), grows in over the first 50 ms
        z += 0.45 * A * np.cos(k * 1.08 * r) * (1 - 0.6 * r / rw) * min(1.0, t / 0.05)
        # no displacement right at the wall (meniscus is pinned)
        z *= np.clip(d / 0.0025, 0, 1)
        co[idx, 2] = z0 + z
    me.vertices.foreach_set('co', co.ravel())
    me.update()


def set_lid_tick(jar, amount):
    lid = jar['lid']
    z, rz = lid['rest']
    a = max(0.0, min(1.0, float(amount)))
    lid.location.z = z + 0.0025 * a
    lid.rotation_euler = (math.radians(2.5) * a, math.radians(-1.2) * a, rz + math.radians(1.5) * a)


# ---------------------------------------------------------------- other props
def build_mandarin(loc=(0, 0, 0), coll=None, seed=1, radius=0.034):
    import bmesh
    rng = np.random.default_rng(seed)
    me = bpy.data.meshes.new('mandarin')
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=96, v_segments=56, radius=radius)
    from mathutils import noise, Vector
    off = Vector(rng.uniform(-50, 50, 3).tolist())
    for v in bm.verts:
        p = v.co.copy()
        n = p.normalized()
        squash = 0.80 + 0.05 * n.z
        lobes = 1 + 0.012 * math.sin(math.atan2(n.y, n.x) * 9) * (1 - abs(n.z))
        bump = 1 + 0.025 * noise.noise(p * 40 + off)
        top_dip = -0.10 * max(0.0, n.z - 0.85) / 0.15 * radius
        v.co = Vector((p.x * lobes * bump, p.y * lobes * bump, p.z * squash * bump + top_dip * (n.z > 0)))
    bmesh.ops.translate(bm, verts=bm.verts, vec=(0, 0, radius * 0.80))
    bm.to_mesh(me); bm.free()
    me.shade_smooth()
    o = bpy.data.objects.new('mandarin', me); link(o, coll); o.location = loc
    o.rotation_euler = (rng.uniform(-0.2, 0.2), rng.uniform(-0.2, 0.2), rng.uniform(0, 6.28))
    mat, nt, out = _new_mat('prop_mandarin')
    tc = nt.nodes.new('ShaderNodeTexCoord')
    vor = _n(nt, 'ShaderNodeTexVoronoi', {'Vector': tc.outputs['Object'], 'Scale': 900.0})
    vor.feature = 'SMOOTH_F1'
    nz = _n(nt, 'ShaderNodeTexNoise', {'Vector': tc.outputs['Object'], 'Scale': 60.0, 'Detail': 4.0})
    col = _mixc(nt, _mr(nt, nz.outputs['Fac'], 0.35, 0.7), _col('#E8650C'), _col('#F58A1E'))
    sep = _n(nt, 'ShaderNodeSeparateXYZ', {'Vector': tc.outputs['Object']})
    col = _mixc(nt, _mr(nt, sep.outputs['Z'], radius * 1.45, radius * 1.6, 0, 0.6), col, _col('#C8761A'))
    b = _n(nt, 'ShaderNodeBsdfPrincipled', {'Base Color': col, 'Roughness': 0.38, 'Subsurface Weight': 0.35,
                                           'Subsurface Radius': (0.006, 0.0025, 0.001), 'Coat Weight': 0.25,
                                           'Coat Roughness': 0.3})
    h = _math(nt, 'ADD', vor.outputs['Distance'], _math(nt, 'MULTIPLY', nz.outputs['Fac'], 0.3))
    nt.links.new(_bump(nt, h, 0.0004, 0.7), b.inputs['Normal'])
    nt.links.new(b.outputs[0], out.inputs['Surface'])
    o.data.materials.append(mat)
    # calyx + stem
    cal = []
    for i in range(5):
        a = i * 2 * math.pi / 5
        cal.append(box(f'mandarin.calyx{i}', (0.007, 0.0028, 0.0008), (0, 0, 0), coll,
                       principled('prop_calyx', '#4E5A22', rough=0.6), bevel=0.0004))
        c = cal[-1]; c.parent = o
        c.location = (0.003 * math.cos(a), 0.003 * math.sin(a), radius * 1.52)
        c.rotation_euler = (0, -0.25, a)
    st = lathe('mandarin.stem', [(0.0012, 0.0), (0.0010, 0.004), (0.0007, 0.006)], 12, coll,
               principled('prop_stem', '#5B4A28', rough=0.7))
    st.parent = o; st.location = (0, 0, radius * 1.50); st.rotation_euler = (0.3, 0, 0)
    return o


def build_thermos(loc=(0, 0, 0), coll=None, height=0.30):
    try:
        root, objs = import_model('modified_thermos', '1k', coll)
        bpy.context.view_layer.update()
        zs = []
        for o in objs:
            if o.type == 'MESH':
                for c in o.bound_box:
                    zs.append((o.matrix_world @ __import__('mathutils').Vector(c)).z)
        h = max(zs) - min(zs) if zs else height
        s = height / h if h > 0 else 1.0
        root.scale = (s, s, s)
        root.location = (loc[0], loc[1], loc[2] - min(zs) * s if zs else loc[2])
        return root
    except Exception as e:  # modelled fallback: enamel-painted steel thermos
        print('thermos download failed, modelling:', e)
        root = bpy.data.objects.new('thermos', None); link(root, coll); root.location = loc
        body = lathe('thermos.body', [(0.05, 0), (0.052, 0.004), (0.052, height * 0.8), (0.04, height * 0.88),
                                      (0.03, height * 0.9)], 64, coll, principled('prop_thermos', '#2F6B4E', 0.35, coat=0.6))
        body.parent = root
        return root


def build_noodle_cup(loc=(0, 0, 0), coll=None):
    from PIL import Image, ImageDraw, ImageFont
    root = bpy.data.objects.new('noodle_cup', None); link(root, coll); root.location = loc
    H, r0, r1 = 0.105, 0.042, 0.057
    path = f'{GEN}/noodle_band.png'
    if not os.path.exists(path):
        os.makedirs(GEN, exist_ok=True)
        im = Image.new('RGB', (2048, 512), (236, 228, 210))
        d = ImageDraw.Draw(im)
        d.rectangle([0, 150, 2048, 400], fill=(196, 30, 28))
        d.rectangle([0, 400, 2048, 420], fill=(232, 178, 42))
        f = ImageFont.truetype(f'{FONTS}/NotoSansCJKsc-Black.otf', 170)
        for x in (330, 1354):
            d.text((x, 270), '红烧牛肉面', font=f, fill=(255, 236, 200), anchor='mm')
        f2 = ImageFont.truetype(f'{FONTS}/NotoSansCJKsc-Bold.otf', 60)
        for x in (330, 1354):
            d.text((x, 470), '香辣 · 劲道 · 3分钟', font=f2, fill=(120, 30, 20), anchor='mm')
        im.save(path)
    mat, nt, out = _new_mat('prop_noodle_cup')
    tc = nt.nodes.new('ShaderNodeTexCoord')
    sep = _n(nt, 'ShaderNodeSeparateXYZ', {'Vector': tc.outputs['Object']})
    u = _math(nt, 'ADD', _math(nt, 'DIVIDE', _math(nt, 'ARCTAN2', sep.outputs['Y'], sep.outputs['X']), 2 * math.pi), 0.5)
    v = _math(nt, 'DIVIDE', sep.outputs['Z'], H)
    img = _n(nt, 'ShaderNodeTexImage', {'Vector': _n(nt, 'ShaderNodeCombineXYZ', {'X': u, 'Y': v}).outputs[0]})
    img.image = bpy.data.images.load(path, check_existing=True)
    b = _n(nt, 'ShaderNodeBsdfPrincipled', {'Base Color': img.outputs['Color'], 'Roughness': 0.45})
    nt.links.new(b.outputs[0], out.inputs['Surface'])
    cup = lathe('noodle_cup.cup', [(0.0, 0.0), (r0 - 0.002, 0.0), (r0, 0.002), (r1, H - 0.004), (r1 + 0.002, H - 0.002),
                                  (r1 + 0.0025, H), (r1 + 0.001, H + 0.002), (r1 - 0.0008, H), (r1 - 0.001, H - 0.004),
                                  (r0 - 0.001, 0.006), (0.0, 0.006)], 96, coll, mat, cap_bottom=False)
    cup.parent = root
    # broth + noodles
    nd, ntn, out2 = _new_mat('prop_noodles')
    tc2 = ntn.nodes.new('ShaderNodeTexCoord')
    wv = _n(ntn, 'ShaderNodeTexWave', {'Vector': tc2.outputs['Object'], 'Scale': 70.0, 'Distortion': 14.0,
                                       'Detail': 4.0}, wave_type='BANDS')
    bb = _n(ntn, 'ShaderNodeBsdfPrincipled', {'Base Color': _mixc(ntn, wv.outputs['Fac'], _col('#B07A2E'), _col('#E4B866')),
                                            'Roughness': 0.25, 'Subsurface Weight': 0.3})
    ntn.links.new(_bump(ntn, wv.outputs['Fac'], 0.002, 1.0), bb.inputs['Normal'])
    ntn.links.new(bb.outputs[0], out2.inputs['Surface'])
    noodles = lathe('noodle_cup.noodles', [(0.0, H - 0.022), (r1 - 0.004, H - 0.022)], 64, coll, nd)
    noodles.parent = root
    # half-peeled foil lid: a disc, rear half bent up and back around a hinge line
    import bmesh
    me = bpy.data.meshes.new('noodle_cup.lid')
    bm = bmesh.new()
    bmesh.ops.create_grid(bm, x_segments=60, y_segments=60, size=r1 + 0.004)
    for v in list(bm.verts):
        if math.hypot(v.co.x, v.co.y) > r1 + 0.004:
            bm.verts.remove(v)
    hinge = -0.005
    for v in bm.verts:
        y = v.co.y
        if y > hinge:
            s = y - hinge
            R = 0.022
            a = s / R
            v.co.y = hinge + R * math.sin(min(a, 2.6))
            v.co.z = R * (1 - math.cos(min(a, 2.6))) + (s - R * 2.6) * 0.0 if a < 2.6 else R * (1 - math.cos(2.6))
            v.co.z += 0.0004 * math.sin(v.co.x * 400)
    bm.to_mesh(me); bm.free()
    lid = bpy.data.objects.new('noodle_cup.lid', me); link(lid, coll); lid.parent = root
    lid.location = (0, 0, H + 0.0022)
    sol = lid.modifiers.new('sol', 'SOLIDIFY'); sol.thickness = 0.0003
    lid.data.materials.append(principled('prop_foil', '#D9D4C8', rough=0.25, metal=0.9))
    me.shade_smooth()
    fork = box('noodle_cup.fork', (0.012, 0.11, 0.0015), (0.01, -0.02, H + 0.004), coll,
               principled('prop_fork', '#F2F0EA', rough=0.35), bevel=0.0006)
    fork.parent = root
    fork.rotation_euler = (0.08, 0, 0.5)
    return dict(root=root, cup=cup, lid=lid, noodles=noodles, fork=fork)


# ================================================================ review scenes
def _render_setup(res, samples):
    setup_render(res, samples)
    sc = bpy.context.scene
    sc.render.threads_mode = 'FIXED'; sc.render.threads = 2
    sc.cycles.adaptive_threshold = 0.02
    sc.cycles.max_bounces = 16; sc.cycles.transmission_bounces = 16; sc.cycles.transparent_max_bounces = 16
    sc.cycles.volume_bounces = 2
    sc.cycles.sample_clamp_indirect = 6.0


def _glare(mix=-0.75, threshold=0.9, size=8, vignette=0.18):
    from kit import track as T
    T.film_finish(glare=0.5, vignette=vignette)
    nt = bpy.context.scene.node_tree
    for n in nt.nodes:
        if n.type == 'GLARE':
            n.threshold = threshold; n.size = size; n.mix = mix


def _area(name, loc, look, size, energy, color, size_y=None, shape='RECTANGLE'):
    d = bpy.data.lights.new(name, 'AREA'); d.energy = energy; d.color = srgb(color)[:3]
    d.shape = shape; d.size = size; d.size_y = size_y or size
    o = bpy.data.objects.new(name, d); link(o); o.location = loc; aim(o, look)
    return o


def _table_mat():
    mat, nt, out = _new_mat('prop_table_top')
    tc = nt.nodes.new('ShaderNodeTexCoord')
    nz = _n(nt, 'ShaderNodeTexNoise', {'Vector': tc.outputs['Object'], 'Scale': 14.0, 'Detail': 6.0})
    fine = _n(nt, 'ShaderNodeTexNoise', {'Vector': tc.outputs['Object'], 'Scale': 900.0, 'Detail': 4.0})
    sc = _n(nt, 'ShaderNodeTexWave', {'Vector': tc.outputs['Object'], 'Scale': 18.0, 'Distortion': 22.0,
                                      'Detail': 4.0}, wave_type='BANDS')
    scratch = _mr(nt, sc.outputs['Fac'], 0.97, 1.0, 0, 1)
    col = _mixc(nt, _mr(nt, nz.outputs['Fac'], 0.3, 0.7, 0, 0.5), _col('#E6DBC2'), _col('#D6C8AA'))
    # old tea ring stain
    sep = _n(nt, 'ShaderNodeSeparateXYZ', {'Vector': tc.outputs['Object']})
    rr = _math(nt, 'SQRT', _math(nt, 'ADD', _math(nt, 'POWER', _math(nt, 'SUBTRACT', sep.outputs['X'], 0.11), 2),
                                  _math(nt, 'POWER', _math(nt, 'SUBTRACT', sep.outputs['Y'], 0.07), 2)))
    ring = _mr(nt, _math(nt, 'ABSOLUTE', _math(nt, 'SUBTRACT', rr, 0.040)), 0.0018, 0.0)
    col = _mixc(nt, _math(nt, 'MULTIPLY', ring, 0.35), col, _col('#A88A4E'))
    b = _n(nt, 'ShaderNodeBsdfPrincipled', {'Base Color': col, 'Coat Weight': 0.15, 'Coat Roughness': 0.2})
    nt.links.new(_math(nt, 'ADD', _mr(nt, fine.outputs['Fac'], 0.3, 0.7, 0.22, 0.38),
                       _math(nt, 'MULTIPLY', scratch, 0.2)), b.inputs['Roughness'])
    nt.links.new(_bump(nt, _math(nt, 'SUBTRACT', fine.outputs['Fac'], _math(nt, 'MULTIPLY', scratch, 0.6)),
                       0.00006, 0.5), b.inputs['Normal'])
    nt.links.new(b.outputs[0], out.inputs['Surface'])
    return mat


def _night_window_backdrop(coll, y_win=0.24, seed=5):
    """Wall with a window right behind the table; outside: deep blue night with snow streaks."""
    rng = random.Random(seed)
    wall = principled('prop_wall', '#B9B49A', rough=0.6)
    # wall around the window (window from z=0.02 to 0.92, x from -0.5..0.5 relative)
    box('bg.wall_l', (0.6, 0.04, 1.4), (-0.80, y_win + 0.02, 0.4), coll, wall, 0.005)
    box('bg.wall_r', (0.6, 0.04, 1.4), (0.80, y_win + 0.02, 0.4), coll, wall, 0.005)
    box('bg.sill', (1.2, 0.07, 0.02), (0, y_win - 0.01, 0.01), coll, principled('prop_sill', '#8C8A80', 0.35, 0.6), 0.004)
    box('bg.frame_b', (1.0, 0.03, 0.02), (0, y_win, 0.03), coll, principled('prop_frame', '#5E6460', 0.4, 0.7), 0.003)
    gm = principled('prop_winglass', '#FFFFFF', rough=0.04, transmission=1.0, ior=1.5)
    box('bg.glass', (1.0, 0.006, 0.9), (0, y_win + 0.01, 0.47), coll, gm)
    # outside: graded night
    mat, nt, out = _new_mat('prop_night_out')
    tc = nt.nodes.new('ShaderNodeTexCoord')
    sep = _n(nt, 'ShaderNodeSeparateXYZ', {'Vector': tc.outputs['Object']})
    g = _mr(nt, sep.outputs['Z'], -0.5, 1.6)
    c = _mixc(nt, g, _col('#5F8EB0'), _col('#1E3D5A'))
    nz = _n(nt, 'ShaderNodeTexNoise', {'Vector': tc.outputs['Object'], 'Scale': 1.5, 'Detail': 2.0})
    c = _mixc(nt, _mr(nt, nz.outputs['Fac'], 0.3, 0.7, 0, 0.3), c, _col('#A9C6DB'))
    em = _n(nt, 'ShaderNodeEmission', {'Color': c, 'Strength': 1.6})
    nt.links.new(em.outputs[0], out.inputs['Surface'])
    p = box('bg.night', (8.0, 0.01, 4.0), (0, y_win + 3.2, 0.6), coll, mat)
    # snow streaks (flakes flying past; long exposure) — thin emissive capsules at 0.6–3 m
    fl = emission('prop_flake', '#DCE8F5', 3.5)
    for i in range(46):
        y = y_win + rng.uniform(0.5, 2.8)
        x = rng.uniform(-1.6, 1.6) * (y / 1.4)
        z = rng.uniform(-0.2, 1.3)
        ln = rng.uniform(0.05, 0.16)
        o = box(f'bg.streak{i}', (ln, 0.004, 0.004), (x, y, z), coll, fl)
        o.rotation_euler = (0, math.radians(rng.uniform(12, 22)), 0)
    return p


def scene_tea(ripple=None, res=(960, 540), samples=64, lid_tick=0.0):
    reset()
    t0 = time.time()
    coll = collection('props')
    # table top (cream laminate, aluminium edge) — table top at z = 0 in this test scene
    box('table', (1.2, 0.44, 0.03), (0, 0.0, -0.015), coll, _table_mat(), 0.003)
    box('table.edge', (1.2, 0.012, 0.034), (0, -0.226, -0.016), coll, principled('prop_alu', '#B8BBBE', 0.3, 1.0), 0.003)
    jar = build_tea_jar((0, 0, 0), coll)
    build_mandarin((0.20, 0.10, 0), coll)
    build_mandarin((0.255, 0.135, 0), coll, seed=4, radius=0.031)
    _night_window_backdrop(coll)
    if ripple is not None:
        set_tea_ripple(jar, ripple)
    if lid_tick:
        set_lid_tick(jar, lid_tick)
    # world: dim cool interior ambience
    w = bpy.data.worlds.new('World'); bpy.context.scene.world = w; w.use_nodes = True
    w.node_tree.nodes['Background'].inputs['Color'].default_value = srgb('#3A6B8C')
    w.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.25
    # key: warm tungsten, upper side-back (the car's ceiling lamp)
    _area('key', (-0.32, 0.30, 0.42), (0, 0, 0.05), 0.22, 26.0, '#FFB46A')
    # rim: narrow warm strip behind-right for the glass edge
    _area('rim', (0.30, 0.22, 0.16), (0, 0, 0.06), 0.03, 6.0, '#FFC890', size_y=0.25)
    # product strip: tall softbox front-left for the long vertical highlight on the glass
    _area('strip', (-0.42, -0.40, 0.10), (0, 0, 0.06), 0.04, 9.0, '#FFE2BC', size_y=0.40)
    # cool fill from the camera side (window bounce)
    _area('fill', (0.25, -0.70, 0.30), (0, 0, 0.05), 0.8, 5.0, '#A9C6DB')
    cam = camera('cam', (0.02, -0.80, 0.135), (0.0, 0.0, 0.062), lens=90, fstop=2.0, focus=0.80 - 0.035)
    _render_setup(res, samples)
    _glare(mix=-0.8, threshold=1.2, size=7)
    return jar, time.time() - t0


def _luma(path):
    from PIL import Image
    a = np.asarray(Image.open(path).convert('RGB'), np.float32)
    return float((0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]).mean())


def _parse(argv):
    names, res, samples = [], (960, 540), 64
    i = 0
    while i < len(argv):
        a = argv[i]
        if a == '--samples':
            samples = int(argv[i + 1]); i += 2; continue
        if a == '--res':
            res = tuple(int(x) for x in argv[i + 1].split('x')); i += 2; continue
        names.append(a); i += 1
    return names or ['tea_macro', 'tea_ripple'], res, samples


if __name__ == '__main__':
    names, res, samples = _parse(sys.argv[1:])
    os.makedirs(OUT_DIR, exist_ok=True)
    for nm in names:
        jar, tb = scene_tea(ripple=0.12 if nm == 'tea_ripple' else None, res=res, samples=samples,
                            lid_tick=0.0)
        t1 = time.time()
        p = render_still(f'{OUT_DIR}/{nm}.png')
        print(f'[props] {nm}: build {tb:.1f}s render {time.time() - t1:.1f}s luma {_luma(p):.1f} -> {p}')
