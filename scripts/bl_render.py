# Blender test: import a frame of our three.js cannon set (GLB with camera) and render it with Cycles.
import bpy, sys, math, time
from mathutils import Vector
GLB, OUT, SAMPLES = sys.argv[-3], sys.argv[-2], int(sys.argv[-1])
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=GLB)
sc = bpy.context.scene
sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = SAMPLES; sc.cycles.use_denoising = True
sc.cycles.max_bounces = 6; sc.cycles.transparent_max_bounces = 16
sc.render.resolution_x, sc.render.resolution_y = 1080, 1920
sc.render.image_settings.file_format = 'JPEG'; sc.render.image_settings.quality = 90
sc.view_settings.view_transform = 'Standard'; sc.view_settings.look = 'None'; sc.view_settings.exposure = 0.0
sc.camera = next(o for o in bpy.data.objects if o.type == 'CAMERA')
for o in [o for o in bpy.data.objects if o.type == 'LIGHT']: bpy.data.objects.remove(o)

def nodes_of(m):
    m.use_nodes = True; return m.node_tree.nodes, m.node_tree.links
def tex_of(m):
    return next((n for n in m.node_tree.nodes if n.type == 'TEX_IMAGE'), None)
def principled(m, base=None, metal=0.0, rough=0.6, spec=0.3):
    N, L = nodes_of(m); b = next((n for n in N if n.type == 'BSDF_PRINCIPLED'), None)
    if b is None: return
    if base is not None:
        for l in list(b.inputs['Base Color'].links): L.remove(l)
        b.inputs['Base Color'].default_value = (*base, 1)
    b.inputs['Metallic'].default_value = metal; b.inputs['Roughness'].default_value = rough
    if 'Specular IOR Level' in b.inputs: b.inputs['Specular IOR Level'].default_value = spec
def unlit(m, strength=1.0, keep_alpha=True):
    """flat colour/texture straight to the image (cards, painted plates), alpha-cut"""
    N, L = nodes_of(m); t = tex_of(m)
    b = next((n for n in N if n.type == 'BSDF_PRINCIPLED'), None)
    base_col = b.inputs['Base Color'].default_value[:] if b else (1, 1, 1, 1)
    out = next(n for n in N if n.type == 'OUTPUT_MATERIAL')
    em = N.new('ShaderNodeEmission'); em.inputs['Strength'].default_value = strength
    if t: L.new(t.outputs['Color'], em.inputs['Color'])
    else: em.inputs['Color'].default_value = base_col
    if t and keep_alpha:
        tr = N.new('ShaderNodeBsdfTransparent'); mx = N.new('ShaderNodeMixShader')
        L.new(t.outputs['Alpha'], mx.inputs['Fac']); L.new(tr.outputs[0], mx.inputs[1]); L.new(em.outputs[0], mx.inputs[2]); L.new(mx.outputs[0], out.inputs['Surface'])
    else: L.new(em.outputs[0], out.inputs['Surface'])
    m.surface_render_method = 'DITHERED' if hasattr(m, 'surface_render_method') else None

for m in bpy.data.materials:
    n = m.name.split('.')[0]
    if n == 'CARD' or n == 'FX': unlit(m, 1.0)
    elif n.startswith('MeshBasicMaterial|ffffff'): unlit(m, 1.0)       # painted backdrop plates + enemy ship card
    elif n.startswith('MeshBasicMaterial|111216'): principled(m, (0.01, 0.01, 0.012), rough=0.9)
    elif n.startswith('MeshBasicMaterial|ffb03a'):  # lit match: glowing orange
        unlit(m, 6.0, False); em = next(x for x in m.node_tree.nodes if x.type == 'EMISSION'); em.inputs['Color'].default_value = (1.0, 0.45, 0.08, 1)
    elif n.startswith('MeshBasicMaterial'): principled(m, rough=0.7)
    elif n == 'MeshMatcapMaterial|ffffff': principled(m, (0.30, 0.32, 0.35), metal=1.0, rough=0.28)   # gun iron
    elif n.startswith('MeshMatcapMaterial'): principled(m, (0.08, 0.085, 0.09), metal=1.0, rough=0.35)  # balls
    elif n.startswith('MeshLambertMaterial|50535c'): principled(m, (0.10, 0.105, 0.115), metal=0.8, rough=0.45)  # iron fittings
    else: principled(m, rough=0.75, spec=0.25)
# contact-shadow decals are not needed: Cycles makes real ones
for o in list(bpy.data.objects):
    if o.type == 'MESH' and any(s.material and s.material.name.startswith('BLOB') for s in o.material_slots): bpy.data.objects.remove(o)
# the sea had a custom shader (exported with no material): give it water
water = bpy.data.materials.new('Water'); principled(water) if False else None
water.use_nodes = True; WN, WL = water.node_tree.nodes, water.node_tree.links; wb = WN['Principled BSDF']
wb.inputs['Base Color'].default_value = (0.02, 0.38, 0.5, 1); wb.inputs['Roughness'].default_value = 0.22
# wind ripples: stretched noise -> bump, plus light streaks mixed into the colour
tc = WN.new('ShaderNodeTexCoord'); mp = WN.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (0.35, 2.2, 1.0)
nz = WN.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 6.0; nz.inputs['Detail'].default_value = 6.0
bm = WN.new('ShaderNodeBump'); bm.inputs['Strength'].default_value = 0.25; bm.inputs['Distance'].default_value = 0.05
WL.new(tc.outputs['Object'], mp.inputs['Vector']); WL.new(mp.outputs['Vector'], nz.inputs['Vector']); WL.new(nz.outputs['Fac'], bm.inputs['Height']); WL.new(bm.outputs['Normal'], wb.inputs['Normal'])
ramp = WN.new('ShaderNodeValToRGB'); ramp.color_ramp.elements[0].position = 0.62; ramp.color_ramp.elements[0].color = (0.02, 0.38, 0.5, 1)
ramp.color_ramp.elements[1].position = 0.72; ramp.color_ramp.elements[1].color = (0.55, 0.85, 0.9, 1)
WL.new(nz.outputs['Fac'], ramp.inputs['Fac']); WL.new(ramp.outputs['Color'], wb.inputs['Base Color'])
for o in bpy.data.objects:
    if o.type == 'MESH' and (len(o.material_slots) == 0 or all(s.material is None for s in o.material_slots)) and max(o.dimensions) > 100:
        o.data.materials.clear(); o.data.materials.append(water)
# sun from the same direction as the three.js key light (three (x,y,z) -> Blender (x,-z,y))
d3 = Vector((0 - -5, 0 - 7.5, -1 - 4.5)); d = Vector((d3.x, -d3.z, d3.y)).normalized()
bpy.ops.object.light_add(type='SUN'); sun = bpy.context.object; sun.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
sun.data.energy = 3.2; sun.data.angle = math.radians(4); sun.data.color = (1.0, 0.95, 0.88)
w = bpy.data.worlds.new('sky'); sc.world = w; w.use_nodes = True
bg = w.node_tree.nodes['Background']; bg.inputs['Color'].default_value = (0.45, 0.65, 0.95, 1); bg.inputs['Strength'].default_value = 0.9
import os
if os.environ.get('INK'):
    # outlines like the reference: Freestyle on props only (not on the drawn cards, backdrops or sea)
    nl = bpy.data.collections.new('NOLINE'); sc.collection.children.link(nl)
    flat = ('CARD', 'FX', 'MeshBasicMaterial|ffffff', 'Water')
    for o in bpy.data.objects:
        if o.type == 'MESH' and any(sl.material and sl.material.name.split('.')[0].startswith(flat) for sl in o.material_slots):
            nl.objects.link(o)
    sc.render.use_freestyle = True; sc.render.line_thickness_mode = 'ABSOLUTE'; sc.render.line_thickness = float(os.environ['INK'])
    fs = bpy.context.view_layer.freestyle_settings; fs.crease_angle = math.radians(140); fs.use_culling = True; fs.as_render_pass = False
    ls = fs.linesets[0] if len(fs.linesets) else fs.linesets.new('ink')
    ls.select_by_collection = True; ls.collection = nl; ls.collection_negation = 'EXCLUSIVE'
    ls.select_silhouette = True; ls.select_border = True; ls.select_crease = bool(os.environ.get('CREASE'))
    ls.linestyle = ls.linestyle or bpy.data.linestyles.new('ink')
    ls.linestyle.color = (0.04, 0.03, 0.06); ls.linestyle.thickness = float(os.environ['INK'])
sc.render.filepath = OUT
t0 = time.time(); bpy.ops.render.render(write_still=True); print('RENDER_SECONDS', round(time.time() - t0, 1))
