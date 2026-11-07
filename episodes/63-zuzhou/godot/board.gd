extends Node3D
## Synty POLYGON Ancient Egypt in Godot 4.5 (Forward+). Built at runtime from the Synty FBX source files (FBXDocument) and the
## texture atlas; no editor import. Shots: shot=temple (the night temple from the three.js test, for comparison) and
## shot=ante (Carter's first look into Tutankhamun's antechamber by candlelight, 法老的诅咒 B3). t0=<s> starts the clock there.

var A := OS.get_environment("GP_ASSETS") if OS.has_environment("GP_ASSETS") else "/dev/shm/gp/assets/"  # the Synty assets folder (never in the repo)
var matmap: Dictionary
var tex_cache := {}
var fbx_cache := {}
var anim_cache := {}
var shot := "temple"
var t := 0.0
var cam: Camera3D
var flames := []

func _ready() -> void:
	for a in OS.get_cmdline_user_args():
		if a.begins_with("shot="): shot = a.substr(5)
		if a.begins_with("t0="): t = float(a.substr(3))
		if "=" in a: opts[a.get_slice("=", 0)] = a.get_slice("=", 1)
	matmap = JSON.parse_string(FileAccess.get_file_as_string(A + "matmap.json"))
	cam = Camera3D.new(); add_child(cam); cam.make_current()
	call("build_" + shot)
	_update(0.0)

func _process(delta: float) -> void:
	t += delta
	_update(delta)

# ---------------------------------------------------------------- assets
func tex(n: String) -> Texture2D:
	if tex_cache.has(n): return tex_cache[n]
	var img := Image.load_from_file(A + "tex/" + n)
	if img == null:
		push_warning("missing texture " + n + ", using the Egypt atlas")
		img = Image.load_from_file(A + "tex/PolygonAncientEgypt_01_A.png")
	img.generate_mipmaps()
	var tx := ImageTexture.create_from_image(img)
	tex_cache[n] = tx
	return tx

func rock_mat() -> StandardMaterial3D:
	var m := StandardMaterial3D.new(); m.albedo_color = Color(0.72, 0.56, 0.4); m.roughness = 0.95
	m.normal_enabled = true; m.normal_texture = tex("RockWall_Normals_01.png"); m.uv1_triplanar = true; m.uv1_scale = Vector3(0.25, 0.25, 0.25)
	return m

func mat_for(p: String, slot: int, gold := false) -> StandardMaterial3D:
	if p.begins_with("SM_Env_Rock"): return rock_mat()
	var slots: Array = matmap["mat"].get(p, [])
	var n: String = "PolygonAncientEgypt_01_A.png"
	if slot < slots.size(): n = slots[slot]
	elif slots.size() > 0: n = slots[0]
	var atlas := n == "PolygonAncientEgypt_01_A.png"
	var m := StandardMaterial3D.new()
	m.albedo_texture = tex("PolygonAncientEgypt_Texture_01_A_Gold.png" if (atlas and gold) else n)
	m.roughness = 0.8
	if atlas:
		m.normal_enabled = true; m.normal_texture = tex("PolygonAncientEgypt_Texture_01_Normals.png")
		m.emission_enabled = true; m.emission_texture = tex("PolygonEgypt_Emissive_01_A.png"); m.emission = Color(0, 0, 0); m.emission_energy_multiplier = 1.6  # ADD op: colour + texture, so the colour must be black
	if gold:
		m.metallic = 0.25; m.roughness = 0.42
	return m

func apply_mats(root: Node, p: String, gold := false) -> void:
	for mi in root.find_children("*", "MeshInstance3D", true, false):
		for s in mi.mesh.get_surface_count():
			mi.set_surface_override_material(s, mat_for(p, s, gold))

func fbx(p: String, dir := "fbx/") -> Node3D:
	# parse each FBX once, keep the generated scene as a template, hand out duplicates
	var key := dir + p
	if not fbx_cache.has(key):
		var doc := FBXDocument.new(); var st := FBXState.new()
		var err := doc.append_from_file(A + dir + p + ".fbx", st)
		if err != OK: push_error("fbx load failed " + key)
		fbx_cache[key] = doc.generate_scene(st)
	return fbx_cache[key].duplicate()

func piece(p: String, pos: Vector3, ry := 0.0, s := 1.0, gold := false) -> Node3D:
	var n := fbx(p); apply_mats(n, p, gold)
	n.position = pos; n.rotation.y = ry; n.scale = Vector3.ONE * s
	add_child(n)
	return n

var gr_c := {}   # bone -> global rest rotation, Egypt characters (Unity-style bone axes)
var gr_r := {}   # bone -> global rest rotation, PolygonSyntyCharacter (the rig the animations were authored on; same T-pose)
var parent_of := {}
var rig_parent := {}
func _rests() -> void:
	if not gr_c.is_empty(): return
	var sc: Skeleton3D = fbx("Characters").find_children("*", "Skeleton3D", true, false)[0]
	var sr: Skeleton3D = fbx("PolygonSyntyCharacter", "anim/").find_children("*", "Skeleton3D", true, false)[0]
	for i in sc.get_bone_count():
		var b := sc.get_bone_name(i)
		gr_c[b] = sc.get_bone_global_rest(i).basis.get_rotation_quaternion()
		parent_of[b] = sc.get_bone_name(sc.get_bone_parent(i)) if sc.get_bone_parent(i) >= 0 else ""
	for i in sr.get_bone_count():
		gr_r[sr.get_bone_name(i)] = sr.get_bone_global_rest(i).basis.get_rotation_quaternion()
		rig_parent[sr.get_bone_name(i)] = sr.get_bone_name(sr.get_bone_parent(i)) if sr.get_bone_parent(i) >= 0 else ""

## retarget: the same world-space change from the T-pose, expressed in the characters' bone axes:
## q_c = GRc(parent)^-1 * GRr(parent) * q_a * GRr(bone)^-1 * GRc(bone)
func retarget(a: Animation) -> void:
	_rests()
	var drop := []
	for i in a.get_track_count():
		var b := String(a.track_get_path(i)).get_slice(":", 1)
		if not gr_c.has(b) or not gr_r.has(b): drop.append(i); continue
		var pb: String = parent_of[b]
		var L: Quaternion = (gr_c[pb] if pb != "" else Quaternion()).inverse() * (gr_r[pb] if pb != "" and gr_r.has(pb) else Quaternion())
		var R: Quaternion = gr_r[b].inverse() * gr_c[b]
		var ty := a.track_get_type(i)
		for k in a.track_get_key_count(i):
			if ty == Animation.TYPE_ROTATION_3D:
				a.track_set_key_value(i, k, (L * (a.track_get_key_value(i, k) as Quaternion) * R).normalized())
			elif ty == Animation.TYPE_POSITION_3D:
				a.track_set_key_value(i, k, L * (a.track_get_key_value(i, k) as Vector3))
	drop.reverse()
	for i in drop: a.remove_track(i)

func anim(name: String) -> Animation:
	if anim_cache.has(name): return anim_cache[name]
	var sc := fbx("A_POLY_IDL_" + name, "anim/")
	var ap: AnimationPlayer = sc.find_children("*", "AnimationPlayer", true, false)[0]
	var a: Animation = ap.get_animation(ap.get_animation_list()[0]).duplicate()
	a.loop_mode = Animation.LOOP_LINEAR
	retarget(a)
	anim_cache[name] = a
	sc.free()
	return a

## one figure = a fresh copy of Characters.fbx with only its body + attachments visible, an idle from the Idles pack,
## and static head pieces (crowns) hung on the Head bone
func figure(body: String, att: Array, extra: Array, pos: Vector3, ry: float, idle: String, ph: float) -> Node3D:
	var c := fbx("Characters")
	var keep := [body] + att
	for mi in c.find_children("*", "MeshInstance3D", true, false):
		mi.visible = String(mi.name) in keep
		if mi.visible:
			for s in mi.mesh.get_surface_count(): mi.set_surface_override_material(s, mat_for("Characters", s))
	for old in c.find_children("*", "AnimationPlayer", true, false): old.free()
	var sk: Skeleton3D = c.find_children("*", "Skeleton3D", true, false)[0]
	for e in extra:
		var ba := BoneAttachment3D.new(); ba.bone_name = "Head"; sk.add_child(ba)
		var x := fbx(e); apply_mats(x, e)
		x.transform = Transform3D(sk.get_bone_global_rest(sk.find_bone("Head")).basis.inverse(), Vector3.ZERO)  # modelled around the head joint, world-aligned
		ba.add_child(x)
	var ap := AnimationPlayer.new(); c.add_child(ap)
	var lib := AnimationLibrary.new(); lib.add_animation("idle", anim(idle)); ap.add_animation_library("", lib)
	c.position = pos; c.rotation.y = ry
	add_child(c)
	ap.play("idle"); ap.seek(fmod(ph + t, anim(idle).length), true)
	return c

func fire(pos: Vector3, seed: float, energy: float, rng: float, shadow: bool, size := 1.0, show := true) -> void:
	var p := CPUParticles3D.new(); p.visible = show; p.amount = 36; p.lifetime = 0.7; p.position = pos; p.preprocess = 1.0
	p.emission_shape = CPUParticles3D.EMISSION_SHAPE_SPHERE; p.emission_sphere_radius = 0.1 * size
	p.direction = Vector3.UP; p.spread = 12; p.initial_velocity_min = 0.35 * size; p.initial_velocity_max = 0.7 * size; p.gravity = Vector3(0, 0.5, 0)
	p.scale_amount_min = 0.22 * size; p.scale_amount_max = 0.42 * size
	var sc := Curve.new(); sc.add_point(Vector2(0, 0.6)); sc.add_point(Vector2(0.3, 1.0)); sc.add_point(Vector2(1, 0.15)); p.scale_amount_curve = sc
	var g := Gradient.new(); g.set_color(0, Color(1, 0.9, 0.6, 1)); g.set_color(1, Color(1, 0.3, 0.05, 0)); p.color_ramp = g
	var q := QuadMesh.new(); var qm := StandardMaterial3D.new()
	qm.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED; qm.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA; qm.blend_mode = BaseMaterial3D.BLEND_MODE_ADD
	qm.billboard_mode = BaseMaterial3D.BILLBOARD_PARTICLES; qm.billboard_keep_scale = true; qm.vertex_color_use_as_albedo = true; qm.albedo_texture = tex("Circle_Soft_01.png"); qm.albedo_color = Color(3.0, 2.0, 1.0)
	q.material = qm; p.mesh = q
	add_child(p)
	var l := OmniLight3D.new(); l.position = pos + Vector3(0, 0.3 * size, 0); l.light_color = Color(1, 0.68, 0.42); l.light_energy = energy; l.omni_range = rng
	l.shadow_enabled = shadow; l.light_volumetric_fog_energy = 1.5
	add_child(l)
	flames.append([l, seed, energy])

func dust(center: Vector3, extents: Vector3, n: int, col: Color) -> void:
	var p := CPUParticles3D.new(); p.amount = n; p.lifetime = 14; p.preprocess = 14; p.position = center
	p.emission_shape = CPUParticles3D.EMISSION_SHAPE_BOX; p.emission_box_extents = extents
	p.direction = Vector3(1, 0.3, 0); p.spread = 180; p.initial_velocity_min = 0.02; p.initial_velocity_max = 0.08; p.gravity = Vector3.ZERO
	p.scale_amount_min = 0.01; p.scale_amount_max = 0.025
	var q := QuadMesh.new(); var qm := StandardMaterial3D.new()
	qm.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED; qm.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA; qm.blend_mode = BaseMaterial3D.BLEND_MODE_ADD
	qm.billboard_mode = BaseMaterial3D.BILLBOARD_PARTICLES; qm.billboard_keep_scale = true; qm.albedo_texture = tex("Circle_Soft_01.png"); qm.albedo_color = col
	q.material = qm; p.mesh = q
	add_child(p)

func floor_plane(size: float, rep: float) -> void:
	var mi := MeshInstance3D.new(); var pm := PlaneMesh.new(); pm.size = Vector2(size, size); mi.mesh = pm
	var m := StandardMaterial3D.new(); m.albedo_texture = tex("Temple_Middle_01.png"); m.normal_enabled = true; m.normal_texture = tex("Temple_Middle_01_Normals.png")
	m.uv1_scale = Vector3(rep, rep, 1); m.roughness = 0.55; m.albedo_color = Color(0.85, 0.78, 0.7)
	mi.material_override = m
	add_child(mi)

func box(size: Vector3, pos: Vector3, texn: String, rep: Vector2, tint := Color(1, 1, 1)) -> void:
	var mi := MeshInstance3D.new(); var bm := BoxMesh.new(); bm.size = size; mi.mesh = bm
	var m := StandardMaterial3D.new(); m.albedo_texture = tex(texn); m.uv1_scale = Vector3(rep.x, rep.y, 1); m.roughness = 0.9; m.albedo_color = tint
	mi.material_override = m; mi.position = pos
	add_child(mi)

func environment(night: bool, fog: float, fog_albedo: Color, exposure: float, dof_far: float) -> void:
	var e := Environment.new()
	if night:
		e.background_mode = Environment.BG_SKY
		var sky := Sky.new(); var sm := ShaderMaterial.new(); var sh := Shader.new()
		sh.code = """shader_type sky;
float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void sky(){ float h = clamp(EYEDIR.y, 0.0, 1.0);
	vec3 c = mix(vec3(0.07, 0.09, 0.22), vec3(0.008, 0.01, 0.05), smoothstep(0.0, 0.6, h));
	vec2 g = vec2(atan(EYEDIR.z, EYEDIR.x) * 300.0, EYEDIR.y * 300.0); float r = h21(floor(g));
	if (r > 0.986 && h > 0.04) { c += vec3(1.6) * smoothstep(0.22, 0.0, length(fract(g) - 0.5)); }
	COLOR = c; }"""
		sm.shader = sh; sky.sky_material = sm; e.sky = sky
		e.ambient_light_source = Environment.AMBIENT_SOURCE_SKY; e.ambient_light_energy = 0.7
	else:
		e.background_mode = Environment.BG_COLOR; e.background_color = Color(0, 0, 0)
		e.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR; e.ambient_light_color = Color(0.2, 0.22, 0.32); e.ambient_light_energy = 0.3
	e.tonemap_mode = Environment.TONE_MAPPER_ACES; e.tonemap_exposure = exposure
	e.ssao_enabled = true; e.ssao_radius = 0.8; e.ssao_intensity = 1.6
	e.ssil_enabled = true
	e.sdfgi_enabled = true; e.sdfgi_use_occlusion = true
	e.glow_enabled = true; e.glow_intensity = 0.6; e.glow_bloom = 0.0; e.glow_hdr_threshold = 1.0
	e.volumetric_fog_enabled = fog > 0.0; e.volumetric_fog_density = fog; e.volumetric_fog_albedo = fog_albedo
	e.adjustment_enabled = true; e.adjustment_contrast = 1.08; e.adjustment_saturation = 1.0 if night else 0.82
	var we := WorldEnvironment.new(); we.environment = e
	var ca := CameraAttributesPractical.new(); ca.dof_blur_far_enabled = true; ca.dof_blur_far_distance = dof_far; ca.dof_blur_far_transition = dof_far * 0.6; ca.dof_blur_amount = 0.035
	we.camera_attributes = ca
	add_child(we)

# ================================================================ storyboard: 法老的诅咒 · 序 开罗之夜
# shot=cairo (S1/S3) | hotel (S2) | manor (S4) | dog (S5) | seal (S6/S8) | valley (S7); user arg out=1 = lights out (S3), burst=1 (S8)
var opts := {}
var windows := []          # [mesh, material, off_time]
var cam_keys := {}         # from/to positions + look targets, fov, duration
var flash_light: DirectionalLight3D
var shot_t0 := 0.0

func _opt(k: String, d := "") -> String:
	return opts.get(k, d)

func sky_env(top: Color, hor: Color, moon_dir: Vector3, moon_size: float, stars: float, ambient: float, fog: float, fog_col: Color, exposure: float, dof_near: float, dof_far: float, sat: float) -> void:
	var e := Environment.new()
	e.background_mode = Environment.BG_SKY
	var sky := Sky.new(); var sm := ShaderMaterial.new(); var sh := Shader.new()
	sh.code = """shader_type sky;
uniform vec3 top; uniform vec3 hor; uniform vec3 moon; uniform float msize; uniform float stars;
float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void sky(){ float h = clamp(EYEDIR.y, 0.0, 1.0);
	vec3 c = mix(hor, top, smoothstep(0.0, 0.55, h));
	float m = dot(normalize(EYEDIR), normalize(moon));
	c += vec3(0.85, 0.9, 1.0) * (smoothstep(1.0 - msize, 1.0 - msize * 0.7, m) * 4.0 + pow(max(m, 0.0), 60.0) * 0.25);
	vec2 g = vec2(atan(EYEDIR.z, EYEDIR.x) * 300.0, EYEDIR.y * 300.0); float r = h21(floor(g));
	if (r > 0.988 && h > 0.06) { c += vec3(stars) * smoothstep(0.22, 0.0, length(fract(g) - 0.5)); }
	COLOR = c; }"""
	sm.shader = sh; sm.set_shader_parameter("top", Vector3(top.r, top.g, top.b)); sm.set_shader_parameter("hor", Vector3(hor.r, hor.g, hor.b))
	sm.set_shader_parameter("moon", moon_dir); sm.set_shader_parameter("msize", moon_size); sm.set_shader_parameter("stars", stars)
	sky.sky_material = sm; e.sky = sky
	e.ambient_light_source = Environment.AMBIENT_SOURCE_SKY; e.ambient_light_energy = ambient
	e.tonemap_mode = Environment.TONE_MAPPER_ACES; e.tonemap_exposure = exposure
	e.ssao_enabled = true; e.ssao_radius = 1.0; e.ssao_intensity = 1.8; e.ssil_enabled = true
	e.sdfgi_enabled = true; e.sdfgi_use_occlusion = true
	e.glow_enabled = true; e.glow_intensity = 0.7; e.glow_bloom = 0.0; e.glow_hdr_threshold = 1.0
	e.volumetric_fog_enabled = fog > 0.0; e.volumetric_fog_density = fog; e.volumetric_fog_albedo = fog_col
	e.adjustment_enabled = true; e.adjustment_contrast = 1.15; e.adjustment_saturation = sat
	var we := WorldEnvironment.new(); we.environment = e
	var ca := CameraAttributesPractical.new()
	if dof_near > 0.0: ca.dof_blur_near_enabled = true; ca.dof_blur_near_distance = dof_near; ca.dof_blur_near_transition = dof_near * 0.5
	if dof_far > 0.0: ca.dof_blur_far_enabled = true; ca.dof_blur_far_distance = dof_far; ca.dof_blur_far_transition = dof_far * 0.6
	ca.dof_blur_amount = 0.05
	we.camera_attributes = ca
	add_child(we)

func dark_env(amb: Color, amb_e: float, fog: float, fog_col: Color, exposure: float, dof_near: float, dof_far: float, sat: float) -> void:
	sky_env(Color(0, 0, 0), Color(0, 0, 0), Vector3(0, -1, 0), 0.0, 0.0, 0.0, fog, fog_col, exposure, dof_near, dof_far, sat)
	var we: WorldEnvironment = find_children("*", "WorldEnvironment", true, false)[-1]
	we.environment.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR; we.environment.ambient_light_color = amb; we.environment.ambient_light_energy = amb_e

func glow_quad(size: Vector2, pos: Vector3, ry: float, col: Color, energy: float) -> StandardMaterial3D:
	var mi := MeshInstance3D.new(); var q := QuadMesh.new(); q.size = size; mi.mesh = q
	var m := StandardMaterial3D.new(); m.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED; m.albedo_color = col * energy
	mi.material_override = m; mi.position = pos; mi.rotation.y = ry
	add_child(mi)
	return m

func solid_box(size: Vector3, pos: Vector3, col: Color, texn := "", rep := Vector2(1, 1)) -> MeshInstance3D:
	var mi := MeshInstance3D.new(); var bm := BoxMesh.new(); bm.size = size; mi.mesh = bm
	var m := StandardMaterial3D.new(); m.albedo_color = col; m.roughness = 0.95
	if texn != "": m.albedo_texture = tex(texn); m.uv1_scale = Vector3(rep.x, rep.y, 1)
	mi.material_override = m; mi.position = pos
	add_child(mi)
	return mi

## a single-character FBX (City Characters, Explorer Kit) with a retargeted idle
## older Synty rigs (City Characters, Explorer Kit) name the same bones differently
const RIG_MAP := {"Hips": "Pelvis", "Neck": "neck_01", "Shoulder_L": "UpperArm_L", "Shoulder_R": "UpperArm_R", "Elbow_L": "lowerarm_l", "Elbow_R": "lowerarm_r",
	"UpperLeg_L": "Thigh_L", "UpperLeg_R": "Thigh_R", "LowerLeg_L": "calf_l", "LowerLeg_R": "calf_r", "Ankle_L": "Foot_L", "Ankle_R": "Foot_R"}
var anim_rig_cache := {}
## retarget a clip from the animation rig (PolygonSyntyCharacter) onto any T-posed skeleton: map names, then
## q_t = GRt(parent)^-1 * GRr(parent) * q_a * GRr(bone)^-1 * GRt(bone)
func anim_for(sk: Skeleton3D, skel_path: String, idle: String) -> Animation:
	var key := idle + "@" + str(sk.get_bone_count()) + skel_path
	if anim_rig_cache.has(key): return anim_rig_cache[key]
	_rests()
	var lower := {}
	for i in sk.get_bone_count(): lower[sk.get_bone_name(i).to_lower()] = i
	var grt := {}
	for i in sk.get_bone_count(): grt[i] = sk.get_bone_global_rest(i).basis.get_rotation_quaternion()
	var sc := fbx("A_POLY_IDL_" + idle, "anim/")
	var ap0: AnimationPlayer = sc.find_children("*", "AnimationPlayer", true, false)[0]
	var a: Animation = ap0.get_animation(ap0.get_animation_list()[0]).duplicate()
	sc.free()
	a.loop_mode = Animation.LOOP_LINEAR
	var drop := []
	for i in a.get_track_count():
		var b := String(a.track_get_path(i)).get_slice(":", 1)
		var tn: String = RIG_MAP.get(b, b)
		if not lower.has(tn.to_lower()) or not gr_r.has(b): drop.append(i); continue
		var ti: int = lower[tn.to_lower()]
		var tp := sk.get_bone_parent(ti)
		# the source parent: the animation rig parent of b
		var sp: String = rig_parent.get(b, "")
		var L: Quaternion = (grt[tp] if tp >= 0 else Quaternion()).inverse() * (gr_r[sp] if sp != "" and gr_r.has(sp) else Quaternion())
		var R: Quaternion = gr_r[b].inverse() * grt[ti]
		var ty := a.track_get_type(i)
		for k in a.track_get_key_count(i):
			if ty == Animation.TYPE_ROTATION_3D: a.track_set_key_value(i, k, (L * (a.track_get_key_value(i, k) as Quaternion) * R).normalized())
			elif ty == Animation.TYPE_POSITION_3D: a.track_set_key_value(i, k, L * (a.track_get_key_value(i, k) as Vector3))
		a.track_set_path(i, NodePath(skel_path + ":" + sk.get_bone_name(ti)))
	drop.reverse()
	for i in drop: a.remove_track(i)
	anim_rig_cache[key] = a
	return a

func person(p: String, pos: Vector3, ry: float, idle: String, ph: float, att := []) -> Node3D:
	var c := fbx(p); apply_mats(c, p)
	for old in c.find_children("*", "AnimationPlayer", true, false): old.free()
	var sk: Skeleton3D = c.find_children("*", "Skeleton3D", true, false)[0]
	var clip: Animation = anim(idle) if sk.find_bone("Hips") >= 0 else anim_for(sk, String(c.get_path_to(sk)), idle)
	for e in att:   # hats etc., modelled around the head joint
		var hb := sk.find_bone("head") if sk.find_bone("head") >= 0 else sk.find_bone("Head")
		var ba := BoneAttachment3D.new(); ba.bone_idx = hb; sk.add_child(ba)
		var x := fbx(e); apply_mats(x, e)
		x.transform = Transform3D(sk.get_bone_global_rest(hb).basis.inverse(), Vector3.ZERO)
		ba.add_child(x)
	var ap := AnimationPlayer.new(); c.add_child(ap)
	var lib := AnimationLibrary.new(); lib.add_animation("idle", clip); ap.add_animation_library("", lib)
	c.position = pos; c.rotation.y = ry
	add_child(c)
	ap.play("idle"); ap.seek(fmod(ph + t, clip.length), true)
	return c

## the dog rig carries every breed; keep one, play a clip from the Dogs pack (same rig, no retarget)
func dog(breed: String, pos: Vector3, ry: float, clip: String, at: float, loop := false) -> Node3D:
	var d := fbx("Unity_SK_Animals_Dog_01")
	for mi in d.find_children("*", "MeshInstance3D", true, false):
		mi.visible = String(mi.name) == breed
		if mi.visible:
			# each breed has its own texture (the shared atlas gives the wrong colours)
			var dm := StandardMaterial3D.new(); dm.albedo_texture = tex("PolygonDog_" + breed.get_slice("_", 3) + "_01.png"); dm.roughness = 0.85
			for s in mi.mesh.get_surface_count(): mi.set_surface_override_material(s, dm)
	for old in d.find_children("*", "AnimationPlayer", true, false): old.free()
	var sc := fbx(clip, "fbx/anim/")
	var src_ap: AnimationPlayer = sc.find_children("*", "AnimationPlayer", true, false)[0]
	var a: Animation = src_ap.get_animation(src_ap.get_animation_list()[0]).duplicate()
	a.loop_mode = Animation.LOOP_LINEAR if loop else Animation.LOOP_NONE
	sc.free()
	var ap := AnimationPlayer.new(); d.add_child(ap)
	var lib := AnimationLibrary.new(); lib.add_animation("clip", a); ap.add_animation_library("", lib)
	d.position = pos; d.rotation.y = ry
	add_child(d)
	ap.play("clip"); ap.seek(clampf(at, 0.0, a.length - 0.01), true)
	return d

func rain(center: Vector3, ext: Vector3, n: int, alpha := 0.2, width := 0.012) -> void:
	var p := CPUParticles3D.new(); p.amount = n; p.lifetime = 0.6; p.preprocess = 1.0; p.position = center
	p.emission_shape = CPUParticles3D.EMISSION_SHAPE_BOX; p.emission_box_extents = ext
	p.direction = Vector3(0.15, -1, 0); p.spread = 2; p.initial_velocity_min = 11; p.initial_velocity_max = 14; p.gravity = Vector3.ZERO
	var q := QuadMesh.new(); q.size = Vector2(width, 0.55); var qm := StandardMaterial3D.new()
	qm.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED; qm.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA; qm.albedo_color = Color(0.7, 0.78, 0.95, alpha)
	qm.billboard_mode = BaseMaterial3D.BILLBOARD_FIXED_Y; qm.billboard_keep_scale = true
	q.material = qm; p.mesh = q
	add_child(p)

func cam_path(p0: Vector3, p1: Vector3, l0: Vector3, l1: Vector3, fov: float, dur: float) -> void:
	cam_keys = {"p0": p0, "p1": p1, "l0": l0, "l1": l1, "fov": fov, "dur": dur}

# ---------------------------------------------------------------- S1 / S3: Cairo rooftops at night
func build_cairo() -> void:
	sky_env(Color(0.01, 0.016, 0.06), Color(0.1, 0.13, 0.28), Vector3(0.28, 0.2, -0.94), 0.0025, 1.4, 0.75, 0.012, Color(0.3, 0.36, 0.6), 1.55, 0.0, 60.0, 0.95)
	var moon := DirectionalLight3D.new(); add_child(moon); moon.look_at_from_position(Vector3(-35, 42, 84), Vector3.ZERO)
	moon.light_color = Color(0.6, 0.7, 1.0); moon.light_energy = 1.2; moon.shadow_enabled = true; moon.directional_shadow_max_distance = 120
	var g := solid_box(Vector3(300, 0.2, 300), Vector3(0, -0.1, -40), Color(0.42, 0.36, 0.3), "Stucco_01.png", Vector2(40, 40))
	var rng := RandomNumberGenerator.new(); rng.seed = 23
	var hotel := Vector3(9, 0, -24)
	for i in 140:
		var x := rng.randf_range(-60, 60); var z := rng.randf_range(-110, 6)
		if Vector2(x - hotel.x, z - hotel.z).length() < 9: continue
		if x < -4 and z > -6: continue   # keep the foreground left open for the palms
		var w := rng.randf_range(4, 9); var d := rng.randf_range(4, 9); var h := rng.randf_range(3, 8) * (1.4 if rng.randf() < 0.12 else 1.0)
		var tint := Color(0.78, 0.7, 0.6) * rng.randf_range(0.75, 1.05)
		solid_box(Vector3(w, h, d), Vector3(x, h / 2, z), tint, "Stucco_01.png", Vector2(w / 3, h / 3))
		solid_box(Vector3(w + 0.3, 0.4, d + 0.3), Vector3(x, h + 0.2, z), tint * 0.9)   # parapet
		var nwin := int(w / 2.2)
		for k in nwin:
			for fl in int(h / 3.2):
				var lit := rng.randf() < 0.38
				var wp := Vector3(x - w / 2 + 1.1 + k * 2.2, 1.6 + fl * 3.0, z + d / 2 + 0.02)
				if lit:
					var m := glow_quad(Vector2(0.7, 1.1), wp, 0, Color(1.0, 0.55, 0.22), rng.randf_range(0.9, 1.6))
					var dist := Vector2(wp.x - hotel.x, wp.z - hotel.z).length()
					windows.append([m, m.albedo_color, 0.6 + dist * 0.035])
				else:
					glow_quad(Vector2(0.7, 1.1), wp, 0, Color(0.02, 0.02, 0.03), 1.0)
	# the hotel: a taller European block, one window brighter (the earl's room)
	solid_box(Vector3(14, 16, 10), hotel + Vector3(0, 8, 0), Color(0.8, 0.74, 0.64), "Stucco_01.png", Vector2(5, 5))
	solid_box(Vector3(14.6, 0.6, 10.6), hotel + Vector3(0, 16.3, 0), Color(0.7, 0.64, 0.56))
	for k in 5:
		for fl in 4:
			var wp := hotel + Vector3(-5.6 + k * 2.8, 2.5 + fl * 3.6, 5.03)
			var room := (k == 3 and fl == 2)
			var m := glow_quad(Vector2(1.2, 1.9), wp, 0, Color(1.0, 0.68, 0.36) if room else Color(1.0, 0.55, 0.22), 2.6 if room else (1.2 if (k + fl) % 3 != 0 else 0.0))
			if m.albedo_color.r > 0.1: windows.append([m, m.albedo_color, 0.0 if room else 0.3 + k * 0.05])
	var lamp := OmniLight3D.new(); lamp.position = hotel + Vector3(2.8, 9.7, 6.2); lamp.light_color = Color(1, 0.65, 0.35); lamp.light_energy = 2.0; lamp.omni_range = 8; add_child(lamp)
	windows.append([lamp, Color(2.0, 0, 0), 0.0])
	for pp in [[Vector3(-9, 0, 4), 0.3, 1.0], [Vector3(-14, 0, -2), 1.4, 1.2], [Vector3(-5, 0, -40), 2.0, 1.1], [Vector3(22, 0, -50), 0.7, 1.0], [Vector3(-26, 0, -30), 2.6, 1.1]]:
		piece("SM_Env_Tree_Palm_0" + str(1 + int(pp[1]) % 3), pp[0], pp[1], pp[2])
	# rooftop clutter near camera: jars, pots, a palm in the foreground
	for rp in [[Vector3(-1.5, 0, 6), "SM_Prop_Jar_Pile_01"], [Vector3(3, 0, 4), "SM_Prop_Pot_01"], [Vector3(-6, 0, -9), "SM_Prop_Jar_Pile_01"]]:
		piece(rp[1], rp[0], 0.3, 1.2)
	if _opt("out") == "1":
		cam_path(Vector3(-4, 24, 40), Vector3(-4, 25, 44), Vector3(8, 6, -40), Vector3(8, 6, -40), 38, 5.0)
	else:
		cam_path(Vector3(-12, 20, 34), Vector3(-5, 13, 16), Vector3(10, 9, -30), Vector3(9, 9, -24), 38, 3.6)

# ---------------------------------------------------------------- S2: the hotel room, seen through the half-open door
func build_hotel() -> void:
	dark_env(Color(0.25, 0.3, 0.45), 0.5, 0.01, Color(0.5, 0.45, 0.4), 1.55, 0.0, 9.0, 0.9)
	var floor := solid_box(Vector3(12, 0.1, 12), Vector3(0, -0.05, -2), Color(0.5, 0.36, 0.26), "Wood_Fancy_01.png", Vector2(6, 6))
	for k in range(-2, 2): piece("SM_Bld_Wall_Window_01" if k == 0 else "SM_Bld_Wall_Door_01" if false else "SM_Bld_Wall_Window_01", Vector3(k * 2.5, 0, -5), 0, 1.0)
	for k in range(-2, 1): piece("SM_Bld_Wall_Window_01", Vector3(5, 0, -5 + (k + 1) * 2.5 + 2.5), -PI / 2, 1.0)
	solid_box(Vector3(0.3, 3, 8), Vector3(-5.1, 1.5, -1), Color(0.55, 0.42, 0.34), "WallPaper_Tex_03.png", Vector2(3, 1.2))
	solid_box(Vector3(12, 0.2, 12), Vector3(0, 3.05, -2), Color(0.5, 0.45, 0.4))
	# front wall with the doorway the camera looks through
	piece("SM_Bld_Wall_Door_01", Vector3(-1.25, 0, 2.2), 0, 1.0)
	print("BOARD door wall placed")
	solid_box(Vector3(4, 3, 0.3), Vector3(-3.25, 1.5, 2.2), Color(0.4, 0.3, 0.25), "WallPaper_Tex_03.png", Vector2(1.5, 1.2))
	solid_box(Vector3(4, 3, 0.3), Vector3(3.25, 1.5, 2.2), Color(0.4, 0.3, 0.25), "WallPaper_Tex_03.png", Vector2(1.5, 1.2))
	var door := piece("SM_Bld_Door_01", Vector3(-0.6, 0, 2.1), -1.25, 1.0)
	piece("SM_Prop_Bed_Large_01", Vector3(0.2, 0, -3.6), 0, 1.0)
	# the shape under the covers (no body shown)
	var mi := MeshInstance3D.new(); var cm := CapsuleMesh.new(); cm.radius = 0.28; cm.height = 1.7; mi.mesh = cm
	var sm := StandardMaterial3D.new(); sm.albedo_color = Color(0.85, 0.82, 0.76); sm.roughness = 0.9; mi.material_override = sm
	mi.position = Vector3(0.1, 0.75, -3.35); mi.rotation = Vector3(PI / 2, 0, 0.08); mi.scale = Vector3(1, 1, 0.55); add_child(mi)
	piece("SM_Prop_Table_Side_01", Vector3(-1.5, 0, -4.3), 0, 1.0)
	piece("SM_Prop_Lamp_01", Vector3(-1.5, 0.64, -4.3), 0.4, 0.9)
	var lamp := OmniLight3D.new(); lamp.position = Vector3(-1.5, 1.35, -4.2); lamp.light_color = Color(1, 0.62, 0.32); lamp.light_energy = 7.0; lamp.omni_range = 8; lamp.shadow_enabled = true; add_child(lamp)
	flames.append([lamp, 5.0, 7.0])
	piece("SM_Prop_Curtain_02_Open_01", Vector3(-0.25, 0.4, -4.75), 0, 1.0)
	var key := OmniLight3D.new(); key.position = Vector3(0.6, 2.6, -2.2); key.light_color = Color(1, 0.75, 0.5); key.light_energy = 3.0; key.omni_range = 5.0; add_child(key)   # soft key on the bed, so the shape under the covers reads
	var moon := SpotLight3D.new(); add_child(moon); moon.look_at_from_position(Vector3(1.5, 4, -9), Vector3(0.5, 0.4, -2.5)); moon.light_color = Color(0.55, 0.65, 1.0); moon.light_energy = 6.0; moon.spot_range = 14; moon.spot_angle = 22; moon.shadow_enabled = true; moon.light_volumetric_fog_energy = 2.0
	piece("SM_Prop_Dresser_01", Vector3(3.6, 0, -3.2), -PI / 2, 1.0)
	piece("SM_Prop_Clock_02", Vector3(4.8, 1.9, -1.6), -PI / 2, 1.0)
	piece("SM_Prop_Gramophone_01", Vector3(3.6, 0.85, -3.4), -2.0, 1.0)
	piece("SM_Prop_Suitcase_01", Vector3(2.6, 0, -0.6), 0.5, 1.0)
	piece("SM_Prop_Rug_02", Vector3(0.2, 0.01, -1.6), 0, 1.0)
	dust(Vector3(0.5, 1.6, -2.5), Vector3(2, 1, 1.5), 90, Color(0.8, 0.8, 0.95))
	cam_path(Vector3(0.05, 1.5, 4.4), Vector3(0.0, 1.45, 2.9), Vector3(0.0, 0.95, -3.4), Vector3(0.0, 0.9, -3.4), 46, 4.2)

# ---------------------------------------------------------------- S4: the manor in the rain
func build_manor(close := false) -> void:
	sky_env(Color(0.02, 0.03, 0.06), Color(0.12, 0.16, 0.24), Vector3(-0.3, 0.3, -0.9), 0.0, 0.0, 0.8, 0.012, Color(0.4, 0.45, 0.55), 1.6, 0.0, 30.0, 0.8)
	var sky_l := DirectionalLight3D.new(); add_child(sky_l); sky_l.look_at_from_position(Vector3(10, 30, 20), Vector3.ZERO); sky_l.light_color = Color(0.55, 0.65, 0.9); sky_l.light_energy = 1.3; sky_l.shadow_enabled = true
	flash_light = sky_l
	solid_box(Vector3(200, 0.2, 200), Vector3(0, -0.1, 0), Color(0.24, 0.3, 0.2), "", Vector2(1, 1))
	var y0 := 1.5   # the house sits up on a plinth; the steps lead to the door
	solid_box(Vector3(20, y0, 1.5), Vector3(0, y0 / 2, -0.7), Color(0.45, 0.42, 0.4), "Brick_Brown_Tex.png", Vector2(6, 1))
	for fl in 2:
		for k in range(-4, 4):
			var p := "SM_Bld_Wall_Door_Double_Large_01" if (k == -1 and fl == 0) else "SM_Bld_Wall_Window_01"
			piece(p, Vector3(k * 2.5, y0 + fl * 3.0, 0), 0, 1.0)
	solid_box(Vector3(20.5, 0.4, 3), Vector3(0, y0 + 6.2, -1.2), Color(0.25, 0.22, 0.22))
	for k in range(-4, 4): piece("SM_Bld_Roof_01", Vector3(k * 2.5, y0 + 6.2, 0.2), 0, 1.0)
	piece("SM_Bld_Steps_01", Vector3(-2.5, y0, 2.5), 0, 1.0)
	for sx in [-2.3, 0.0]: piece("SM_Bld_Porch_Pillar_01", Vector3(sx - 0.2, y0 + 1.0, 2.4), 0, 0.75)
	piece("SM_Bld_Porch_Roof_01", Vector3(-2.5, y0 + 3.0, 2.9), 0, 1.0)
	piece("SM_Prop_Light_Wall_01", Vector3(-0.2, y0 + 2.4, 0.25), 0, 1.0)
	var pl := OmniLight3D.new(); pl.position = Vector3(-1.25, y0 + 2.2, 1.0); pl.light_color = Color(1, 0.66, 0.35); pl.light_energy = 4.5; pl.omni_range = 7; pl.shadow_enabled = true; add_child(pl)
	flames.append([pl, 7.0, 4.5])
	glow_quad(Vector2(1.3, 1.6), Vector3(5.0 + 1.25, y0 + 4.6, 0.05), 0, Color(1.0, 0.66, 0.36), 1.5)   # one lit window upstairs
	piece("SM_Prop_Door_Mat_01", Vector3(-1.25, y0 + 0.01, 0.9), 0, 1.0)
	dog("SK_Animal_Dog_Pointer_01", Vector3(-1.25, y0, 1.1), float(_opt("dogry", "0.25")), _opt("dogclip", "_POLYGON_Dog_Action_Standing_Howl"), float(_opt("dogt", "1.2")))
	solid_box(Vector3(4.4, 0.05, 16), Vector3(-1.25, 0.03, 10), Color(0.32, 0.3, 0.27), "Stucco_01.png", Vector2(2, 8))   # wet gravel drive
	piece("SM_Env_Tree_Large_Twisted_01", Vector3(-11, 0, 9), 0.6, 0.9)
	piece("SM_Env_Tree_Large_Twisted_02", Vector3(10, 0, 7), 2.2, 0.9)
	piece("SM_Bld_Fence_Gate_Fancy_01", Vector3(-3.6, 0, 19), 0, 1.0)
	for k in range(-3, 3): piece("SM_Env_Hedge_01", Vector3(k * 4.0 + 2.0, 0, 5.5), 0, 1.0)
	if close:
		rain(Vector3(-2.5, y0 + 3.4, 3.35), Vector3(1.6, 0.4, 0.08), 260, 0.2, 0.008)   # a sheet running off the porch roof edge
		rain(Vector3(-1, 8, 14), Vector3(14, 4, 6), 1600, 0.1)
	else:
		rain(Vector3(-1, 8, 10), Vector3(14, 4, 10), 2600, 0.12)
	cam_path(Vector3(-2.3, 1.2, 14), Vector3(-1.9, 1.4, 10.5), Vector3(-1.3, 2.7, 0), Vector3(-1.3, 2.5, 0), 46, 4.6)

# ---------------------------------------------------------------- S5: the dog lies down (side-on, low, from the porch edge)
func build_dog() -> void:
	build_manor(true)
	var rim := OmniLight3D.new(); rim.position = Vector3(-0.6, 2.3, 2.6); rim.light_color = Color(0.55, 0.65, 1.0); rim.light_energy = 1.6; rim.omni_range = 4.0; add_child(rim)   # cool spill from the wet night
	cam_path(Vector3(0.5, 1.9, 2.2), Vector3(0.42, 1.88, 2.1), Vector3(-1.3, 1.66, 1.0), Vector3(-1.3, 1.64, 1.0), 34, 2.4)

# ---------------------------------------------------------------- S6 / S8: the sealed doorway
func build_seal() -> void:
	var burst := _opt("burst") == "1"
	dark_env(Color(0.3, 0.25, 0.2), 0.2, 0.05 if burst else 0.03, Color(0.9, 0.75, 0.5), 1.25, 0.0, 0.0, 0.85)
	# KV62's corridor is plain rock-cut limestone (no carved walls); the end is the plastered, seal-stamped doorway
	solid_box(Vector3(8, 0.1, 14), Vector3(0, -0.05, 2), Color(0.5, 0.42, 0.32), "Stucco_01.png", Vector2(4, 7))
	for sx in [-1.9, 1.9]:
		var w := solid_box(Vector3(0.4, 3.4, 14), Vector3(sx, 1.7, 2), Color(0.7, 0.66, 0.6), "Stucco_01.png", Vector2(6, 1.5))
		var wm: StandardMaterial3D = w.material_override; wm.normal_enabled = true; wm.normal_texture = tex("RockWall_Normals_01.png"); wm.normal_scale = 1.4
	solid_box(Vector3(4.2, 0.4, 14), Vector3(0, 3.4, 2), Color(0.5, 0.43, 0.34), "Stucco_01.png", Vector2(2, 7))
	piece("SM_Bld_Wall_Door_Tomb_01", Vector3(-1.25, 0, -4.8), 0, 1.0)
	# fill the gaps between the door module and the corridor (so no light leaks round the module itself)
	solid_box(Vector3(0.7, 3.4, 0.2), Vector3(-1.6, 1.7, -4.9), Color(0.6, 0.53, 0.43), "Stucco_01.png", Vector2(0.4, 1.5))
	solid_box(Vector3(0.7, 3.4, 0.2), Vector3(1.6, 1.7, -4.9), Color(0.6, 0.53, 0.43), "Stucco_01.png", Vector2(0.4, 1.5))
	solid_box(Vector3(3.8, 0.6, 0.2), Vector3(0, 3.3, -4.9), Color(0.6, 0.53, 0.43), "Stucco_01.png", Vector2(2, 0.3))
	if not burst:
		# the plastered blocking in the doorway, stamped all over with the necropolis seals (small dark ovals, jittered)
		solid_box(Vector3(0.96, 1.92, 0.12), Vector3(0, 0.97, -4.8), Color(0.86, 0.78, 0.64), "Stucco_01.png", Vector2(1, 2))
		var rng := RandomNumberGenerator.new(); rng.seed = 7
		var smat := StandardMaterial3D.new(); smat.albedo_color = Color(0.52, 0.42, 0.3); smat.roughness = 0.9
		for r in 7:
			for c in 4:
				var s := MeshInstance3D.new(); var cy := CylinderMesh.new(); cy.top_radius = 0.045; cy.bottom_radius = 0.052; cy.height = 0.02; s.mesh = cy
				s.material_override = smat
				s.position = Vector3(-0.32 + c * 0.213 + rng.randf_range(-0.025, 0.025), 0.22 + r * 0.25 + rng.randf_range(-0.02, 0.02), -4.735)
				s.rotation = Vector3(PI / 2, 0, rng.randf_range(-0.3, 0.3)); s.scale = Vector3(1, 1, 1.45); add_child(s)
	var gold := OmniLight3D.new(); gold.position = Vector3(0, 1.0, -5.6); gold.light_color = Color(1, 0.72, 0.3); gold.light_energy = 14.0 if burst else 6.0; gold.omni_range = 12; gold.light_volumetric_fog_energy = 4.0; gold.shadow_enabled = true; add_child(gold)
	glow_quad(Vector2(1.1, 2.1), Vector3(0, 1.0, -5.0), 0, Color(1, 0.75, 0.35), 6.0 if burst else 2.4)   # leaks round the plaster edges
	# torchlight: one torch half way down on the left, one carried behind the camera
	piece("SM_Prop_Torch_01", Vector3(-1.45, 0, -3.3), PI / 2, 2.2)
	fire(Vector3(-1.45, 1.9, -3.3), 2.0, 2.2, 6.0, true, 0.4, true)
	fire(Vector3(0.9, 1.8, 3.4), 4.0, 3.0, 10.0, true, 0.4, false)
	dust(Vector3(0, 1.4, -2.8), Vector3(1.4, 1.1, 2.0), 260, Color(1.2, 0.9, 0.5))
	cam_path(Vector3(0.15, 1.45, 3.2), Vector3(0.05, 1.35, 0.8), Vector3(0, 1.05, -4.8), Vector3(0, 1.0, -4.8), 40, 4.0)
	if burst:   # S8 carries S6's push-in on through the doorway
		cam_path(Vector3(0.05, 1.35, 0.8), Vector3(0.0, 1.3, -1.8), Vector3(0, 1.0, -4.8), Vector3(0, 1.0, -4.8), 40, 3.4)

# ---------------------------------------------------------------- S7: the Valley of the Kings, over Weigall's shoulder
func build_valley() -> void:
	sky_env(Color(0.25, 0.45, 0.85), Color(0.85, 0.8, 0.72), Vector3(0.4, 0.8, -0.3), 0.0, 0.0, 0.55, 0.002, Color(0.95, 0.85, 0.7), 0.82, 1.4, 0.0, 0.9)
	var sun := DirectionalLight3D.new(); add_child(sun); sun.look_at_from_position(Vector3(20, 40, 12), Vector3.ZERO); sun.light_color = Color(1, 0.92, 0.78); sun.light_energy = 2.4; sun.shadow_enabled = true; sun.directional_shadow_max_distance = 80
	var sand := Color(0.86, 0.72, 0.52)
	# KV62's entrance is a stairwell cut down into the valley floor: build the ground round a rectangular hole
	var x0 := 0.9; var x1 := 3.1; var zf := -9.6; var zb := -12.6
	solid_box(Vector3(150, 0.2, 300), Vector3(x0 - 75, -0.1, 0), sand, "Stucco_01.png", Vector2(30, 60))
	solid_box(Vector3(150, 0.2, 300), Vector3(x1 + 75, -0.1, 0), sand, "Stucco_01.png", Vector2(30, 60))
	solid_box(Vector3(x1 - x0, 0.2, 150), Vector3((x0 + x1) / 2, -0.1, zf + 75), sand, "Stucco_01.png", Vector2(1, 30))
	solid_box(Vector3(x1 - x0, 0.2, 150), Vector3((x0 + x1) / 2, -0.1, zb - 75), sand, "Stucco_01.png", Vector2(1, 30))
	var cut := Color(0.66, 0.55, 0.42)
	solid_box(Vector3(0.1, 3, zf - zb), Vector3(x0 + 0.05, -1.5, (zf + zb) / 2), cut, "Stucco_01.png", Vector2(1, 1))
	solid_box(Vector3(0.1, 3, zf - zb), Vector3(x1 - 0.05, -1.5, (zf + zb) / 2), cut, "Stucco_01.png", Vector2(1, 1))
	solid_box(Vector3(x1 - x0, 1.0, 0.1), Vector3((x0 + x1) / 2, -0.5, zb + 0.05), cut, "Stucco_01.png", Vector2(1, 1))
	solid_box(Vector3(1.5, 2.0, 0.1), Vector3((x0 + x1) / 2, -2.0, zb + 0.1), Color(0.01, 0.008, 0.006))   # the doorway at the foot of the steps
	for k in 7: solid_box(Vector3(x1 - x0 - 0.2, 0.3, 0.45), Vector3((x0 + x1) / 2, -0.15 - k * 0.3, zf - 0.22 - k * 0.42), Color(0.74, 0.62, 0.47))
	# the low retaining wall round the stairwell, where the press waited
	var wall := Color(0.8, 0.68, 0.52)
	solid_box(Vector3(0.45, 0.75, zf - zb + 0.9), Vector3(x0 - 0.25, 0.37, (zf + zb) / 2 - 0.45), wall, "Stucco_01.png", Vector2(2, 0.5))
	solid_box(Vector3(0.45, 0.75, zf - zb + 0.9), Vector3(x1 + 0.25, 0.37, (zf + zb) / 2 - 0.45), wall, "Stucco_01.png", Vector2(2, 0.5))
	solid_box(Vector3(x1 - x0 + 0.95, 0.75, 0.45), Vector3((x0 + x1) / 2, 0.37, zb - 0.45), wall, "Stucco_01.png", Vector2(2, 0.5))
	piece("SM_Env_Rock_Cliff_16", Vector3(0, -1, -26), 0, 1.4)
	piece("SM_Env_Rock_Cliff_12", Vector3(-22, -1, -16), 0.9, 1.2)
	piece("SM_Env_Rock_Cliff_09", Vector3(20, -1, -14), -0.8, 1.3)
	piece("SM_Env_Rock_Rough_01", Vector3(7, 0, -7), 0.4, 1.0)
	person("SK_Character_Grandpa", Vector3(2.0, -0.6, zf - 0.85), PI, "Base_Masc", 0.4)   # Carnarvon, two steps down
	var close := _opt("close") == "1"   # the hook's first frame: tight on the earl at the top of the steps, Weigall's shoulder soft
	person("SK_Chr_Explorer_Male_01", Vector3(0.15, 0, -6.4) if close else Vector3(-0.5, 0, 0.55), PI + 0.3, "ArmsFolded_Casual_Loop_Masc", 0.0, ["SM_Chr_Attach_Hat_Hunter_01"])   # Weigall (sun hat), back to us
	# the press round the wall, in suits and sun hats, all turned to the stairwell
	var press := [["SK_Chr_Explorer_Male_01", ["SM_Chr_Attach_Hat_Hunter_01"], Vector3(-0.4, 0, -9.4), 2.0], ["SK_Chr_Explorer_Male_01", ["SM_Chr_Attach_Hat_Male_01"], Vector3(-0.3, 0, -10.8), 1.6],
		["SK_Chr_Explorer_Female_01", ["SM_Chr_Attach_Hat_Female_01"], Vector3(-1.0, 0, -11.9), 1.3], ["SK_Chr_Explorer_Male_01", ["SM_Chr_Attach_Hat_Male_01"], Vector3(4.3, 0, -10.0), -1.9],
		["SK_Chr_Explorer_Male_01", ["SM_Chr_Attach_Hat_Hunter_01"], Vector3(4.7, 0, -11.6), -1.4], ["SK_Chr_Explorer_Male_01", [], Vector3(-1.5, 0, -8.5), 2.3]]
	for k in press.size():
		var pr: Array = press[k]
		person(pr[0], pr[2], pr[3], ["Base_Masc", "HeadNod_Small_Masc", "ArmsFolded_Casual_Loop_Masc"][k % 3], k * 0.37, pr[1])
	var we: WorldEnvironment = find_children("*", "WorldEnvironment", true, false)[-1]
	var ca: CameraAttributesPractical = we.camera_attributes
	ca.dof_blur_near_enabled = true; ca.dof_blur_near_distance = 2.6 if close else 4.0; ca.dof_blur_near_transition = 1.2 if close else 2.0; ca.dof_blur_amount = 0.12
	if close:
		cam_path(Vector3(0.75, 1.6, -4.9), Vector3(0.7, 1.58, -5.15), Vector3(2.0, 0.55, -10.4), Vector3(2.0, 0.45, -10.5), 30, 3.2)
		return
	cam_path(Vector3(-0.2, 1.62, 2.0), Vector3(-0.3, 1.6, 1.75), Vector3(1.8, 0.7, -10.8), Vector3(2.0, 0.55, -11.0), 30, 5.0)

func _update_board() -> void:
	if cam_keys.is_empty(): return
	var u := sm01(t / cam_keys["dur"])
	cam.fov = cam_keys["fov"]
	cam.look_at_from_position(cam_keys["p0"].lerp(cam_keys["p1"], u), cam_keys["l0"].lerp(cam_keys["l1"], u))
	if _opt("out") == "1":
		for w in windows:
			var on: bool = t * float(_opt("wave", "1")) < w[2]
			if w[0] is StandardMaterial3D: w[0].albedo_color = w[1] if on else Color(0.02, 0.02, 0.03)
			else: w[0].visible = on
	for f in flames:
		var l: Light3D = f[0]
		l.light_energy = f[2] * (0.88 + 0.08 * sin(t * 9.0 + f[1]) + 0.04 * sin(t * 21.0 + f[1] * 2.0))

func sm01(x: float) -> float:
	var u := clampf(x, 0.0, 1.0)
	return u * u * (3.0 - 2.0 * u)

func _update(_d: float) -> void:
	_update_board()
