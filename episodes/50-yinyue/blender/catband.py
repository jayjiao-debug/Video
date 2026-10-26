"""Blender (bpy 4.2) clay cat drummer. Builds the scene, animates it from hits.json (same motion rules as the score),
renders with Cycles. Blender is Z-up; the camera looks along +Y, so the cat faces -Y.
  python3 catband.py still <t> <out.png> [w h samples]
  python3 catband.py anim <outdir> [w h samples fps t0 t1]"""
import bpy, bmesh, json, math, sys, os
from mathutils import Vector, Quaternion
ARGS = sys.argv[1:]
HITS = json.load(open(os.environ.get('HITS', os.path.join(os.path.dirname(__file__), 'hits.json'))))

# ---------------- scene reset ----------------
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
def mat(name, color, rough=.55, sss=.12, metal=0., coat=0., bump=.06, stripes=None, alpha=1.):
	m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; b = nt.nodes['Principled BSDF']
	b.inputs['Base Color'].default_value = (*color, 1); b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal
	b.inputs['Subsurface Weight'].default_value = sss; b.inputs['Subsurface Radius'].default_value = (.08, .05, .04)
	b.inputs['Coat Weight'].default_value = coat
	if bump:   # clay fingerprint texture
		n = nt.nodes.new('ShaderNodeTexNoise'); n.inputs['Scale'].default_value = 90; n.inputs['Detail'].default_value = 6
		bp = nt.nodes.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = bump; bp.inputs['Distance'].default_value = .02
		nt.links.new(n.outputs['Fac'], bp.inputs['Height']); nt.links.new(bp.outputs['Normal'], b.inputs['Normal'])
	if stripes:   # tabby bands from object coordinates
		tc = nt.nodes.new('ShaderNodeTexCoord'); wv = nt.nodes.new('ShaderNodeTexWave'); wv.wave_type = 'BANDS'; wv.bands_direction = 'Z'
		wv.inputs['Scale'].default_value = stripes[1]; wv.inputs['Distortion'].default_value = 4; wv.inputs['Detail'].default_value = 2
		cr = nt.nodes.new('ShaderNodeValToRGB'); cr.color_ramp.elements[0].position = .55; cr.color_ramp.elements[0].color = (*color, 1)
		cr.color_ramp.elements[1].position = .62; cr.color_ramp.elements[1].color = (*stripes[0], 1)
		nt.links.new(tc.outputs['Object'], wv.inputs['Vector']); nt.links.new(wv.outputs['Fac'], cr.inputs['Fac']); nt.links.new(cr.outputs['Color'], b.inputs['Base Color'])
	return m
srgb = lambda h: tuple(((int(h[i:i + 2], 16) / 255) ** 2.2) for i in (1, 3, 5))
M = {'fur': mat('fur', srgb('#F29A3E'), stripes=(srgb('#D46F22'), 1.7)), 'furP': mat('furP', srgb('#F29A3E')), 'white': mat('white', srgb('#FFF6EC')),
	'pink': mat('pink', srgb('#FF8FA6')), 'blush': mat('blush', srgb('#FF7F99'), rough=.8, bump=0), 'eye': mat('eye', srgb('#1a1620'), rough=.05, sss=0, coat=1, bump=0),
	'red': mat('red', srgb('#E84B57'), rough=.4, coat=.3), 'head': mat('drumhead', srgb('#F7F1EA'), rough=.45, sss=.05, bump=.02), 'wood': mat('wood', srgb('#DDA46A'), rough=.5),
	'gold': mat('gold', srgb('#C9962E'), rough=.3, metal=1, sss=0, bump=0), 'chrome': mat('chrome', srgb('#D8DDE6'), rough=.15, metal=1, sss=0, bump=0),
	'floor': mat('floor', srgb('#D9C8F0'), rough=.7, sss=0, bump=.01), 'dark': mat('dark', srgb('#2a2230'), rough=.5, sss=0, bump=0)}

def obj(mesh_name, data, mat_, loc=(0, 0, 0), smooth=True, subsurf=2):
	o = bpy.data.objects.new(mesh_name, data); sc.collection.objects.link(o); o.location = loc
	if hasattr(data, 'materials'): data.materials.append(mat_)
	if smooth and hasattr(data, 'polygons'):
		for p in data.polygons: p.use_smooth = True
	if subsurf: md = o.modifiers.new('ss', 'SUBSURF'); md.levels = 1; md.render_levels = subsurf
	return o
def uvs(name, r, m, loc, scale=(1, 1, 1), seg=32):
	me = bpy.data.meshes.new(name); bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=seg // 2, radius=r); bm.to_mesh(me); bm.free()
	o = obj(name, me, m, loc); o.scale = scale; return o
def cyl(name, r1, r2, depth, m, loc, seg=48, subsurf=0, rot=(0, 0, 0)):
	me = bpy.data.meshes.new(name); bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=r1, radius2=r2, depth=depth); bm.to_mesh(me); bm.free()
	o = obj(name, me, m, loc, subsurf=subsurf); o.rotation_euler = rot
	if not subsurf: bv = o.modifiers.new('bv', 'BEVEL'); bv.width = min(.02, depth * .2); bv.segments = 3
	return o
def torus(name, R, r, m, loc, rot=(0, 0, 0)):
	me = bpy.data.meshes.new(name); bm = bmesh.new()
	# build a torus by revolving a circle
	segs, rs = 64, 16
	verts = [[bm.verts.new(((R + r * math.cos(b)) * math.cos(a), (R + r * math.cos(b)) * math.sin(a), r * math.sin(b))) for b in [j * 2 * math.pi / rs for j in range(rs)]] for a in [i * 2 * math.pi / segs for i in range(segs)]]
	for i in range(segs):
		for j in range(rs): bm.faces.new((verts[i][j], verts[(i + 1) % segs][j], verts[(i + 1) % segs][(j + 1) % rs], verts[i][(j + 1) % rs]))
	bm.to_mesh(me); bm.free(); o = obj(name, me, m, loc, subsurf=0); o.rotation_euler = rot; return o

# ---------------- stage ----------------
w = sc.world = bpy.data.worlds.new('w'); w.use_nodes = True; w.node_tree.nodes['Background'].inputs['Color'].default_value = (*srgb('#EFE4FA'), 1); w.node_tree.nodes['Background'].inputs['Strength'].default_value = .35
me = bpy.data.meshes.new('cyc'); bm = bmesh.new(); prof = [(y, 0) for y in (-12, -2, 2)] + [(2 + 3 * math.sin(a * math.pi / 2 / 8), 3 - 3 * math.cos(a * math.pi / 2 / 8)) for a in range(1, 9)] + [(5, 12)]
rows = [[bm.verts.new((x, y, z)) for (y, z) in prof] for x in (-14, 14)]
for k in range(len(prof) - 1): bm.faces.new((rows[0][k], rows[1][k], rows[1][k + 1], rows[0][k + 1]))
bm.to_mesh(me); bm.free(); cyc = obj('cyc', me, M['floor'], (0, 2.5, 0), subsurf=0)
def area(name, loc, size, power, color, target=(0, 0, 1.3)):
	l = bpy.data.lights.new(name, 'AREA'); l.size = size; l.energy = power; l.color = color; o = bpy.data.objects.new(name, l); sc.collection.objects.link(o); o.location = loc
	d = Vector(target) - Vector(loc); o.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler(); return o
area('key', (-4, -5, 6), 4, 900, (1, .96, .9)); area('fill', (5, -4, 2.5), 5, 250, (.85, .9, 1)); area('rim', (2.5, 4, 4.5), 3, 700, (1, .78, .88))

# ---------------- drum kit ----------------
kick = [cyl('kick', .62, .62, .5, M['red'], (0, -.95, .64), rot=(math.pi / 2, 0, 0)), cyl('kickHead', .56, .56, .52, M['head'], (0, -.95, .64), rot=(math.pi / 2, 0, 0))]
kHoop = torus('kHoop', .6, .035, M['chrome'], (0, -1.22, .64), rot=(math.pi / 2, 0, 0)); kLogo = cyl('kLogo', .22, .22, .02, M['red'], (0, -1.215, .64), rot=(math.pi / 2, 0, 0))
for s in (-1, 1): cyl(f'kFoot{s}', .03, .03, .55, M['chrome'], (s * .52, -.85, .2), seg=16, rot=(0, s * .5, 0))
snare = cyl('snare', .32, .32, .16, M['red'], (-.82, -.62, 1.05), rot=(-.25, -.12, 0)); sHead = cyl('sHead', .3, .3, .17, M['head'], (-.82, -.62, 1.055), rot=(-.25, -.12, 0))
cyl('sStand', .025, .025, 1.0, M['chrome'], (-.82, -.6, .5), seg=16)
hatB = cyl('hatB', .34, .02, .045, M['gold'], (.98, -.6, 1.22), rot=(math.pi, 0, 0)); hatT = cyl('hatT', .02, .34, .045, M['gold'], (.98, -.6, 1.27))
cyl('hStand', .025, .025, 1.22, M['chrome'], (.98, -.6, .61), seg=16)
crash = cyl('crash', .03, .5, .045, M['gold'], (-1.3, -.25, 2.05), rot=(-.35, -.25, 0)); cyl('cStand', .025, .025, 2.0, M['chrome'], (-1.32, -.2, 1.0), seg=16)

# ---------------- the cat ----------------
body = uvs('body', .6, M['fur'], (0, 0, .97), (1, .92, 1.08)); belly = uvs('belly', .42, M['white'], (0, -.38, .9), (1, .55, 1.1))
head = uvs('head', .66, M['furP'], (0, -.05, 1.92), (1.12, 1, .98))
parts_head = []   # (object, offset from head centre)
def hp(o, off): parts_head.append((o, Vector(off))); return o
for s in (-1, 1):
	e = cyl(f'ear{s}', .22, .03, .42, M['furP'], (0, 0, 0), seg=32, subsurf=2); hp(e, (s * .46, .02, .58)); e['tilt'] = s
	i = cyl(f'earIn{s}', .14, .02, .3, M['pink'], (0, 0, 0), seg=32, subsurf=2); hp(i, (s * .45, -.07, .55)); i['tilt'] = s
	hp(uvs(f'muz{s}', .15, M['white'], (0, 0, 0), (1.15, .7, .9)), (s * .12, -.6, -.2))
	hp(uvs(f'eye{s}', .125, M['eye'], (0, 0, 0), (1, .55, 1.15)), (s * .28, -.62, .03))
	hp(uvs(f'blush{s}', .1, M['blush'], (0, 0, 0), (1.1, .35, .65)), (s * .45, -.52, -.14))
for k, dx in enumerate((-.13, 0, .13)): hp(uvs(f'fs{k}', .05, M['dark'] if False else bpy.data.materials['fur'], (0, 0, 0), (.5, .3, 1.6)), (dx, -.5, .42))
hp(uvs('nose', .055, M['pink'], (0, 0, 0), (1.3, .8, .9)), (0, -.71, -.1))
for s in (-1, 1):
	for k in (0, 1):
		wk = cyl(f'whisk{s}{k}', .006, .006, .38, M['white'], (0, 0, 0), seg=6); hp(wk, (s * .48, -.52, -.2 + k * .07)); wk['wh'] = (s, k)
mouth = bpy.data.curves.new('mouth', 'CURVE'); mouth.dimensions = '3D'; mouth.bevel_depth = .012; sp = mouth.splines.new('BEZIER'); sp.bezier_points.add(2)
for p, co in zip(sp.bezier_points, [(-.09, 0, .02), (0, 0, -.02), (.09, 0, .02)]): p.co = co; p.handle_left_type = p.handle_right_type = 'AUTO'
mo = bpy.data.objects.new('mouth', mouth); sc.collection.objects.link(mo); mouth.materials.append(M['dark']); hp(mo, (0, -.68, -.2))
arms = {}
for side in ('L', 'R'):
	arms[side] = {'arm': uvs(f'arm{side}', .5, M['furP'], (0, 0, 0)), 'paw': uvs(f'paw{side}', .15, M['furP'], (0, 0, 0)),
		'stick': cyl(f'stick{side}', .022, .016, .62, M['wood'], (0, 0, 0), seg=16), 'tip': uvs(f'tip{side}', .03, M['wood'], (0, 0, 0))}
for s in (-1, 1): uvs(f'foot{s}', .17, M['furP'], (s * .34, -.5, .14), (1, 1.3, .7))
tailc = bpy.data.curves.new('tail', 'CURVE'); tailc.dimensions = '3D'; tailc.bevel_depth = .085; tailc.bevel_resolution = 6; tsp = tailc.splines.new('NURBS'); tsp.points.add(7); tsp.use_endpoint_u = True; tsp.order_u = 4
tail = bpy.data.objects.new('tail', tailc); sc.collection.objects.link(tail); tailc.materials.append(M['furP'])

# ---------------- motion (same rules as the score) ----------------
T = {k: [h['t'] for h in HITS['hits'] if h['i'] == k] for k in ('kick', 'snare', 'hat', 'crash')}
clamp = lambda x, a=0., b=1.: max(a, min(b, x))
def sstep(a, b, x): k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k)
def prevnext(arr, t):
	p, n = -1e9, 1e9
	for x in arr:
		if x <= t + 1e-6: p = max(p, x)
		else: n = min(n, x)
	return p, n
def env(arr, t, d): p, _ = prevnext(arr, t); return 0 if p < -1e8 else math.exp(-(t - p) / d)
def stroke(arr, t, up):
	p, n = prevnext(arr, t); d1, d2 = t - p, n - t; I = n - p; Aw = min(.15, I * .45)
	rest = (.35 if p < -1e8 else .35 * sstep(0, .22, d1)) * up + (0 if p < -1e8 else .3 * up * math.sin(math.pi * clamp(d1 / .13)))
	if n > 1e8: return rest
	wind = up * (1 - (1 - clamp(d2 / Aw)) ** 3); wg = 1 - sstep(Aw, Aw + .18, d2); return rest + (wind - rest) * wg
def wob(arr, t, amp, d, f): p, _ = prevnext(arr, t); return 0 if p < -1e8 else amp * math.exp(-(t - p) / d) * math.sin((t - p) * f * 2 * math.pi)
def aim(o, a, b, axis='Z'):
	d = (b - a); o.rotation_mode = 'QUATERNION'; o.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(d.normalized())
def place_arm(A, shoulder, paw, hit, h):
	p = paw + Vector((0, .08 * h, .3 * h)); A['paw'].location = p
	d = shoulder - p; L = d.length; A['arm'].location = p + d * .5; aim(A['arm'], p, shoulder); A['arm'].scale = (.22, .22, L / 1.0 * 1.05)
	down = (hit - paw).normalized(); upd = Vector((down.x * .3, .2, 1.2)).normalized(); sd = (down * (1 - h) + upd * h).normalized()
	A['stick'].location = p + sd * .27; aim(A['stick'], p, p + sd); A['tip'].location = p + sd * .58
def pose(t):
	B, t0 = HITS['beat'], HITS['t0']; ph = (t - t0) / B
	kE, sE = env(T['kick'], t, .12), env(T['snare'], t, .1)
	nod = .11 * (.5 + .5 * math.cos(2 * math.pi * (ph - .08))) if t > t0 - .3 else 0
	sway = .045 * math.sin(math.pi * ph) if t > t0 else 0
	body.scale = (1 + .025 * kE, .92 * (1 + .025 * kE), 1.08 * (1 - .045 * kE)); body.location.z = .97 - .035 * kE
	hc = Vector((sway * .4, -.05, 1.92 - .05 * kE)); head.location = hc
	q = Quaternion((1, 0, 0), nod - .03) @ Quaternion((0, 1, 0), -sway * .6)
	head.rotation_mode = 'QUATERNION'; head.rotation_quaternion = q
	blink = .12 if any(abs(t - b) < .07 for b in (2.1, 5.3, 8.4)) else 1; sq = .25 if env(T['crash'], t, .5) > .2 else 1
	for o, off in parts_head:
		o.location = hc + q @ off; o.rotation_mode = 'QUATERNION'; base = q
		if 'tilt' in o: base = q @ Quaternion((0, 1, 0), o['tilt'] * (.38 + .1 * sE)) @ Quaternion((1, 0, 0), .2 * sE * math.sin(t * 40))
		if 'wh' in o: s, k = o['wh']; base = q @ Quaternion((0, 1, 0), math.pi / 2 + s * (-.12 if k else .1))
		if o.name == 'band': base = q @ Quaternion((1, 0, 0), .3)
		o.rotation_quaternion = base
		if o.name.startswith('eye'): o.scale = (1, .55, 1.15 * min(blink, sq))
	hatT.location.z = 1.27 + .012 * env(T['hat'], t, .05); hatT.rotation_euler = (wob(T['hat'], t, .04, .12, 7), 0, 0)
	sHead.location.z = 1.055 - .015 * sE; snare.location.z = 1.05 - .015 * sE
	for o in kick: o.scale = (1 + .035 * kE, 1 + .035 * kE, 1)
	crash.rotation_euler = (-.35 + wob(T['crash'], t, .25, .7, 3.2), -.25 + wob(T['crash'], t, .12, .7, 2.4), 0)
	useC = t > t0 + 15.5 * B
	place_arm(arms['L'], Vector((.5, -.32, 1.24)), Vector((.76, -.55, 1.42)), Vector((.98, -.6, 1.28)), stroke(T['hat'], t, .55))
	if useC: place_arm(arms['R'], Vector((-.5, -.32, 1.24)), Vector((-.95, -.4, 1.95)), Vector((-1.25, -.25, 2.08)), stroke(T['crash'], t, 1.2))
	else: place_arm(arms['R'], Vector((-.5, -.32, 1.24)), Vector((-.6, -.6, 1.32)), Vector((-.82, -.66, 1.13)), stroke(T['snare'], t, 1))
	for i, pt in enumerate(tsp.points):
		k = i / 7; sw = .35 * math.sin(math.pi * ph * .5 - k * 1.6) * k
		pt.co = (.45 + k * .5 + sw * .2, .4 + k * .18 - sw * .25, .5 + k * .95 - k * k * .25, 1)
	tailc.bevel_depth = .085
	ct = clamp(t / HITS['dur']); cam.location = (-.35 + .5 * ct, -6.9 + .9 * ct, 1.85); aim_cam(cam, Vector((0, -.3, 1.32)))
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam; cam.data.lens = 42
cam.data.dof.use_dof = True; cam.data.dof.aperture_fstop = 4.0
def aim_cam(c, target): c.rotation_euler = (target - c.location).to_track_quat('-Z', 'Y').to_euler(); c.data.dof.focus_distance = (target - c.location).length - .3

# ---------------- render settings ----------------
def setup(w, h, samples):
	sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = samples; sc.cycles.use_adaptive_sampling = True; sc.cycles.adaptive_threshold = .03
	sc.cycles.use_denoising = True; sc.cycles.max_bounces = 4; sc.cycles.diffuse_bounces = 2; sc.cycles.glossy_bounces = 2; sc.cycles.transmission_bounces = 2
	sc.render.resolution_x, sc.render.resolution_y = w, h; sc.render.film_transparent = False
	sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Punchy'
	sc.render.threads_mode = 'AUTO'; sc.render.use_persistent_data = True
if ARGS[0] == 'still':
	t, out = float(ARGS[1]), ARGS[2]; w_, h_, smp = (int(x) for x in (ARGS[3:6] if len(ARGS) > 5 else (1280, 720, 48)))
	setup(w_, h_, smp); pose(t); sc.render.filepath = out; bpy.ops.render.render(write_still=True)
else:
	outdir = ARGS[1]; w_, h_, smp = (int(x) for x in (ARGS[2:5] if len(ARGS) > 4 else (1280, 720, 32))); fps = int(ARGS[5]) if len(ARGS) > 5 else 30
	t0 = float(ARGS[6]) if len(ARGS) > 6 else 0; t1 = float(ARGS[7]) if len(ARGS) > 7 else HITS['dur']
	setup(w_, h_, smp); os.makedirs(outdir, exist_ok=True)
	for f in range(int(t0 * fps), int(t1 * fps)):
		path = os.path.join(outdir, f'f{f:05d}.png')
		if os.path.exists(path): continue
		pose(f / fps); sc.render.filepath = path; bpy.ops.render.render(write_still=True)
