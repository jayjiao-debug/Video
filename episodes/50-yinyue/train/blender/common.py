"""Shared kit for the 《开往零点的列车》 Blender scenes (bpy 4.2, the same version as the GPU farm).

Run any scene with the Blender Python module:  /home/user/venv-bpy/bin/python scene.py
(The farm runs the same scripts with `pip install bpy==4.2.0` on an L4.)

World conventions (all builders follow these):
- Metres, Z up. The track runs along +X, centred on y = 0. Rail top is z = 0.
- The train travels toward +X. A car's local origin is the car centre at rail-top height.
- Car body 24.5 m long (25.5 m over couplers), 3.1 m wide; floor at z = 1.28; roof top z ≈ 4.40.
- Bogie centres at x = ±9.0, wheelsets at bogie centre ± 1.2 (2.4 m wheelbase), wheel radius 0.4575.
- 硬座 bays (one window + one table each) are 1.9 m apart: 11 bays, bay i centre x = (i − 5) × 1.9.
- Rail joints every 12.5 m. Sleepers every 0.6 m. Ballast top z = −0.40. Field snow level z = −0.9.
"""
import bpy, os, json, math, urllib.request, functools

ASSETS = os.environ.get('TRAIN_ASSETS', '/home/user/assets')
FONTS = f'{ASSETS}/fonts'
PH = f'{ASSETS}/polyhaven'

# palette (treatment §5.2), sRGB hex
PAL = {
    'carriage': '#1F4A3A', 'stripe': '#E8B22A', 'tungsten': '#FFB46A', 'night': '#3A6B8C',
    'snow_lit': '#A9C6DB', 'shadow': '#1B3346', 'led_red': '#FF3B2F', 'led_amber': '#FFC247',
    'lantern': '#D23A2B', 'gold': '#FFD27A',
}


def srgb(h, a=1.0):
    """'#RRGGBB' → linear RGBA tuple for Blender colour sockets."""
    h = h.lstrip('#')
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return (*lin, a)


# ---------------------------------------------------------------- Poly Haven (CC0) cache
def _get(url, path):
    if not os.path.exists(path):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        req = urllib.request.Request(url, headers={'User-Agent': 'train-film/1.0'})
        tmp = f'{path}.{os.getpid()}.part'
        with urllib.request.urlopen(req, timeout=120) as r, open(tmp, 'wb') as f:
            f.write(r.read())
        os.replace(tmp, path)
    return path


@functools.lru_cache(None)
def _files(asset_id):
    p = f'{PH}/_api/{asset_id}.json'
    _get(f'https://api.polyhaven.com/files/{asset_id}', p)
    return json.load(open(p))


def ph_texture(asset_id, res='2k'):
    """Download a Poly Haven texture set. Returns {'diff','nor','rough','disp','ao','arm'} → local paths (missing maps omitted)."""
    f = _files(asset_id)
    want = {'diff': 'Diffuse', 'nor': 'nor_gl', 'rough': 'Rough', 'disp': 'Displacement', 'ao': 'AO', 'arm': 'arm',
            'metal': 'Metal'}
    out = {}
    for k, key in want.items():
        if key in f:
            r = res if res in f[key] else sorted(f[key])[0]
            fmt = 'jpg' if 'jpg' in f[key][r] else 'png' if 'png' in f[key][r] else next(iter(f[key][r]))
            url = f[key][r][fmt]['url']
            out[k] = _get(url, f'{PH}/textures/{asset_id}/{os.path.basename(url)}')
    return out


def ph_hdri(asset_id, res='2k'):
    f = _files(asset_id)['hdri']
    r = res if res in f else sorted(f)[0]
    url = f[r]['hdr']['url']
    return _get(url, f'{PH}/hdris/{os.path.basename(url)}')


def ph_model(asset_id, res='1k'):
    """Download a Poly Haven model as glTF (+ its textures). Returns the .gltf path."""
    g = _files(asset_id)['gltf']
    r = res if res in g else sorted(g)[0]
    e = g[r]['gltf']
    d = f'{PH}/models/{asset_id}_{r}'
    path = _get(e['url'], f'{d}/{os.path.basename(e["url"])}')
    for rel, inc in e.get('include', {}).items():
        _get(inc['url'], f'{d}/{rel}')
    return path


def import_model(asset_id, res='1k', collection=None):
    """Import a Poly Haven glTF; returns the list of new objects (parented under one empty named asset_id)."""
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=ph_model(asset_id, res))
    new = [o for o in bpy.data.objects if o not in before]
    root = bpy.data.objects.new(asset_id, None)
    (collection or bpy.context.scene.collection).objects.link(root)
    for o in new:
        if o.parent is None:
            o.parent = root
        if collection:
            for c in list(o.users_collection):
                c.objects.unlink(o)
            collection.objects.link(o)
    return root, new


# ---------------------------------------------------------------- materials
def _nodes(mat):
    mat.use_nodes = True
    nt = mat.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new('ShaderNodeOutputMaterial')
    return nt, out


def principled(name, color='#808080', rough=0.5, metal=0.0, emit=None, emit_strength=0.0, alpha=1.0,
               transmission=0.0, ior=1.45, coat=0.0, spec=0.5):
    """Plain Principled BSDF material. color: hex or linear RGBA tuple."""
    mat = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    nt, out = _nodes(mat)
    b = nt.nodes.new('ShaderNodeBsdfPrincipled')
    b.inputs['Base Color'].default_value = srgb(color) if isinstance(color, str) else color
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    b.inputs['Alpha'].default_value = alpha
    b.inputs['Transmission Weight'].default_value = transmission
    b.inputs['IOR'].default_value = ior
    b.inputs['Coat Weight'].default_value = coat
    b.inputs['Specular IOR Level'].default_value = spec
    if emit is not None:
        b.inputs['Emission Color'].default_value = srgb(emit) if isinstance(emit, str) else emit
        b.inputs['Emission Strength'].default_value = emit_strength
    nt.links.new(b.outputs[0], out.inputs[0])
    return mat


def _mean_lum(img):
    import numpy as np
    px = np.empty(len(img.pixels), dtype=np.float32)
    img.pixels.foreach_get(px)
    px = px.reshape(-1, 4)[::7]
    return float(max(1e-3, (0.2126 * px[:, 0] + 0.7152 * px[:, 1] + 0.0722 * px[:, 2]).mean()))


def pbr(name, tex_id, scale=1.0, tint=None, tint_mix=1.0, rough_mul=1.0, rough_add=0.0, metal=None,
        normal_strength=1.0, coords='Object', projection='BOX', blend=0.25, res='2k', bump=None):
    """PBR material from a Poly Haven texture set, box-projected in object space (no UVs needed).

    scale: texture repeats per metre. tint: hex colour multiplied over the diffuse (tint_mix 0–1)
    — use it to repaint e.g. a painted-metal texture in the carriage green. coords: 'Object' | 'UV' | 'Generated'.
    """
    t = ph_texture(tex_id, res)
    mat = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    nt, out = _nodes(mat)
    L = nt.links.new
    b = nt.nodes.new('ShaderNodeBsdfPrincipled')
    tc = nt.nodes.new('ShaderNodeTexCoord')
    mp = nt.nodes.new('ShaderNodeMapping')
    mp.inputs['Scale'].default_value = (scale, scale, scale)
    L(tc.outputs[coords], mp.inputs['Vector'])
    proj = projection if coords != 'UV' else 'FLAT'

    def img(path, non_color):
        n = nt.nodes.new('ShaderNodeTexImage')
        n.image = bpy.data.images.load(path, check_existing=True)
        if non_color:
            n.image.colorspace_settings.name = 'Non-Color'
        n.projection = proj
        n.projection_blend = blend
        L(mp.outputs[0], n.inputs['Vector'])
        return n

    d = img(t['diff'], False)
    col = d.outputs['Color']
    if tint:
        # repaint: keep the texture's light/dark variation, move its colour to the tint
        bw = nt.nodes.new('ShaderNodeRGBToBW'); L(col, bw.inputs[0])
        div = nt.nodes.new('ShaderNodeMath'); div.operation = 'DIVIDE'
        div.inputs[1].default_value = _mean_lum(d.image)
        L(bw.outputs[0], div.inputs[0])
        mul = nt.nodes.new('ShaderNodeMix'); mul.data_type = 'RGBA'; mul.blend_type = 'MULTIPLY'
        mul.inputs['Factor'].default_value = 1.0
        mul.inputs[6].default_value = srgb(tint); L(div.outputs[0], mul.inputs[7])
        mix = nt.nodes.new('ShaderNodeMix'); mix.data_type = 'RGBA'
        mix.inputs['Factor'].default_value = tint_mix
        L(col, mix.inputs[6]); L(mul.outputs[2], mix.inputs[7])
        col = mix.outputs[2]
    L(col, b.inputs['Base Color'])
    if 'rough' in t:
        r = img(t['rough'], True)
        m = nt.nodes.new('ShaderNodeMath'); m.operation = 'MULTIPLY_ADD'
        m.inputs[1].default_value = rough_mul; m.inputs[2].default_value = rough_add; m.use_clamp = True
        L(r.outputs['Color'], m.inputs[0]); L(m.outputs[0], b.inputs['Roughness'])
    if metal is not None:
        b.inputs['Metallic'].default_value = metal
    elif 'metal' in t:
        L(img(t['metal'], True).outputs['Color'], b.inputs['Metallic'])
    if 'nor' in t:
        n = img(t['nor'], True)
        nm = nt.nodes.new('ShaderNodeNormalMap'); nm.inputs['Strength'].default_value = normal_strength
        L(n.outputs['Color'], nm.inputs['Color']); L(nm.outputs[0], b.inputs['Normal'])
    L(b.outputs[0], out.inputs[0])
    mat['tex'] = tex_id
    return mat


def emission(name, color='#FFB46A', strength=5.0):
    mat = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    nt, out = _nodes(mat)
    e = nt.nodes.new('ShaderNodeEmission')
    e.inputs['Color'].default_value = srgb(color) if isinstance(color, str) else color
    e.inputs['Strength'].default_value = strength
    nt.links.new(e.outputs[0], out.inputs[0])
    return mat


def glass(name, color='#FFFFFF', rough=0.02, ior=1.5, frost=None):
    """Clear glass. frost: optional (amount 0–1) condensation via a noise-driven roughness."""
    mat = principled(name, color, rough=rough, transmission=1.0, ior=ior)
    if frost:
        nt = mat.node_tree
        b = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')
        nz = nt.nodes.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 60; nz.inputs['Detail'].default_value = 6
        ramp = nt.nodes.new('ShaderNodeMapRange')
        ramp.inputs['From Min'].default_value = 0.45; ramp.inputs['From Max'].default_value = 0.6
        ramp.inputs['To Min'].default_value = rough; ramp.inputs['To Max'].default_value = 0.08 + 0.35 * frost
        nt.links.new(nz.outputs['Fac'], ramp.inputs['Value']); nt.links.new(ramp.outputs[0], b.inputs['Roughness'])
    return mat


# ---------------------------------------------------------------- objects
def collection(name, parent=None):
    c = bpy.data.collections.get(name) or bpy.data.collections.new(name)
    p = parent or bpy.context.scene.collection
    if c.name not in [x.name for x in p.children]:
        p.children.link(c)
    return c


def link(obj, coll=None):
    (coll or bpy.context.scene.collection).objects.link(obj)
    return obj


def mesh_obj(name, verts, faces, coll=None, mat=None, smooth=False):
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    me.update()
    o = bpy.data.objects.new(name, me)
    link(o, coll)
    if mat:
        o.data.materials.append(mat)
    if smooth:
        for p in me.polygons:
            p.use_smooth = True
    return o


def box(name, size, loc=(0, 0, 0), coll=None, mat=None, bevel=0.0, segments=2):
    """Axis-aligned box of size (sx, sy, sz) centred at loc, with an optional bevel modifier."""
    sx, sy, sz = (s / 2 for s in size)
    v = [(-sx, -sy, -sz), (sx, -sy, -sz), (sx, sy, -sz), (-sx, sy, -sz), (-sx, -sy, sz), (sx, -sy, sz), (sx, sy, sz), (-sx, sy, sz)]
    f = [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)]
    o = mesh_obj(name, v, f, coll, mat)
    o.location = loc
    if bevel:
        m = o.modifiers.new('bevel', 'BEVEL'); m.width = bevel; m.segments = segments; m.limit_method = 'ANGLE'
        m.harden_normals = False
        for p in o.data.polygons:
            p.use_smooth = True
        o.data.shade_smooth() if hasattr(o.data, 'shade_smooth') else None
    return o


def lathe(name, profile, segments=64, coll=None, mat=None, smooth=True, cap_bottom=True):
    """Revolve a (r, z) profile around Z. profile from bottom to top."""
    verts, faces = [], []
    n = len(profile)
    for i in range(segments):
        a = 2 * math.pi * i / segments
        for r, z in profile:
            verts.append((r * math.cos(a), r * math.sin(a), z))
    for i in range(segments):
        j = (i + 1) % segments
        for k in range(n - 1):
            faces.append((i * n + k, j * n + k, j * n + k + 1, i * n + k + 1))
    if cap_bottom and profile[0][0] > 0:
        c = len(verts); verts.append((0, 0, profile[0][1]))
        for i in range(segments):
            j = (i + 1) % segments
            faces.append((c, j * n, i * n))
    return mesh_obj(name, verts, faces, coll, mat, smooth)


def text_obj(name, body, font='NotoSansCJKsc-Black.otf', size=0.2, extrude=0.0, coll=None, mat=None, align='CENTER'):
    cu = bpy.data.curves.new(name, 'FONT')
    cu.body = body
    cu.font = bpy.data.fonts.load(f'{FONTS}/{font}', check_existing=True)
    cu.size = size
    cu.extrude = extrude
    cu.align_x = align
    cu.align_y = 'CENTER'
    o = bpy.data.objects.new(name, cu)
    link(o, coll)
    if mat:
        o.data.materials.append(mat)
    return o


# ---------------------------------------------------------------- world, camera, render
def world_hdri(asset_id='snowy_field', strength=0.3, rotation=0.0, tint='#3A6B8C', tint_mix=0.6, res='2k',
               bg_strength=None):
    """HDRI world graded toward the snow-night blue (day-for-night). bg_strength: separate strength for camera rays."""
    sc = bpy.context.scene
    w = bpy.data.worlds.get('World') or bpy.data.worlds.new('World')
    sc.world = w
    w.use_nodes = True
    nt = w.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    L = nt.links.new
    out = nt.nodes.new('ShaderNodeOutputWorld')
    env = nt.nodes.new('ShaderNodeTexEnvironment')
    env.image = bpy.data.images.load(ph_hdri(asset_id, res), check_existing=True)
    tc = nt.nodes.new('ShaderNodeTexCoord'); mp = nt.nodes.new('ShaderNodeMapping')
    mp.inputs['Rotation'].default_value = (0, 0, rotation)
    L(tc.outputs['Generated'], mp.inputs['Vector']); L(mp.outputs[0], env.inputs['Vector'])
    # desaturate + tint
    hsv = nt.nodes.new('ShaderNodeHueSaturation'); hsv.inputs['Saturation'].default_value = 0.3
    L(env.outputs['Color'], hsv.inputs['Color'])
    mix = nt.nodes.new('ShaderNodeMix'); mix.data_type = 'RGBA'; mix.blend_type = 'MULTIPLY'
    mix.inputs['Factor'].default_value = tint_mix
    L(hsv.outputs['Color'], mix.inputs[6]); mix.inputs[7].default_value = srgb(tint)
    bg = nt.nodes.new('ShaderNodeBackground'); bg.inputs['Strength'].default_value = strength
    L(mix.outputs[2], bg.inputs['Color'])
    if bg_strength is None:
        L(bg.outputs[0], out.inputs['Surface'])
    else:
        bg2 = nt.nodes.new('ShaderNodeBackground'); bg2.inputs['Strength'].default_value = bg_strength
        L(mix.outputs[2], bg2.inputs['Color'])
        lp = nt.nodes.new('ShaderNodeLightPath'); ms = nt.nodes.new('ShaderNodeMixShader')
        L(lp.outputs['Is Camera Ray'], ms.inputs[0]); L(bg.outputs[0], ms.inputs[1]); L(bg2.outputs[0], ms.inputs[2])
        L(ms.outputs[0], out.inputs['Surface'])
    return w


def moon(strength=0.6, elevation=28, azimuth=-35, color='#BFD4FF', angle=0.6):
    """A sun lamp as the moon: cool, soft-edged."""
    d = bpy.data.lights.new('moon', 'SUN'); d.energy = strength; d.color = srgb(color)[:3]; d.angle = math.radians(angle)
    o = bpy.data.objects.new('moon', d); link(o)
    o.rotation_euler = (math.radians(90 - elevation), 0, math.radians(azimuth))
    return o


def camera(name='cam', loc=(0, 0, 0), look_at=None, lens=35, fstop=None, focus=None, sensor=36):
    cd = bpy.data.cameras.new(name); cd.lens = lens; cd.sensor_width = sensor
    o = bpy.data.objects.new(name, cd); link(o)
    o.location = loc
    if look_at is not None:
        aim(o, look_at)
    if fstop:
        cd.dof.use_dof = True; cd.dof.aperture_fstop = fstop
        if focus is not None:
            if isinstance(focus, (int, float)):
                cd.dof.focus_distance = focus
            else:
                cd.dof.focus_object = focus
    bpy.context.scene.camera = o
    return o


def aim(obj, target):
    from mathutils import Vector
    d = Vector(target) - obj.location
    obj.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()


def setup_render(res=(1920, 1080), samples=128, preview=False, motion_blur=False, look='AgX - Medium High Contrast',
                 exposure=0.0, fps=30):
    """Cycles on the GPU when one exists (farm: OptiX), else CPU. OIDN denoise. AgX."""
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    gpu = False
    try:
        prefs = bpy.context.preferences.addons['cycles'].preferences
        for kind in ('OPTIX', 'CUDA'):
            try:
                prefs.compute_device_type = kind; prefs.get_devices()
                if any(d.type == kind for d in prefs.devices):
                    gpu = True
                    break
            except Exception:
                pass
        for d in prefs.devices:
            d.use = d.type != 'CPU'
    except Exception:
        pass
    sc.cycles.device = 'GPU' if gpu else 'CPU'
    sc.cycles.samples = samples
    sc.cycles.use_adaptive_sampling = True
    sc.cycles.use_denoising = True
    sc.cycles.denoiser = 'OPTIX' if gpu else 'OPENIMAGEDENOISE'
    sc.cycles.max_bounces = 8; sc.cycles.transmission_bounces = 8; sc.cycles.glossy_bounces = 4
    sc.cycles.caustics_reflective = False; sc.cycles.caustics_refractive = False
    sc.cycles.sample_clamp_indirect = 8.0
    sc.render.resolution_x, sc.render.resolution_y = res
    sc.render.resolution_percentage = 100
    sc.render.fps = fps
    sc.render.use_motion_blur = motion_blur
    sc.render.motion_blur_shutter = 0.5
    sc.view_settings.view_transform = 'AgX'
    try:
        sc.view_settings.look = look
    except TypeError:
        pass
    sc.view_settings.exposure = exposure
    sc.render.image_settings.file_format = 'PNG'
    sc.render.film_transparent = False
    if preview:
        sc.cycles.samples = min(samples, 48)
    return gpu


def render_still(path, frame=None):
    sc = bpy.context.scene
    if frame is not None:
        sc.frame_set(frame)
    sc.render.filepath = path
    bpy.ops.render.render(write_still=True)
    return path


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
