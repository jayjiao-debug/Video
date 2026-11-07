extends Node3D
## Synty POLYGON Ancient Egypt in Godot 4.5 (Forward+). Built at runtime from the Synty FBX source files (FBXDocument) and the
## texture atlas; no editor import. Shots: shot=temple (the night temple from the three.js test, for comparison) and
## shot=ante (Carter's first look into Tutankhamun's antechamber by candlelight, 法老的诅咒 B3). t0=<s> starts the clock there.

const A := "/dev/shm/gp/assets/"  # the project assets folder (Synty files, not in the repo)
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
	matmap = JSON.parse_string(FileAccess.get_file_as_string(A + "matmap.json"))
	cam = Camera3D.new(); add_child(cam); cam.make_current()
	if shot == "temple": build_temple()
	elif shot == "debug": build_debug()
	else: build_ante()
	_update(0.0)

func _process(delta: float) -> void:
	t += delta
	_update(delta)

# ---------------------------------------------------------------- assets
func tex(n: String) -> Texture2D:
	if tex_cache.has(n): return tex_cache[n]
	var img := Image.load_from_file(A + "tex/" + n)
	img.generate_mipmaps()
	var tx := ImageTexture.create_from_image(img)
	tex_cache[n] = tx
	return tx

func mat_for(p: String, slot: int, gold := false) -> StandardMaterial3D:
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

# ---------------------------------------------------------------- shots
func build_temple() -> void:
	environment(true, 0.008, Color(0.4, 0.45, 0.7), 1.1, 11.0)
	var moon := DirectionalLight3D.new(); add_child(moon); moon.look_at_from_position(Vector3(-15, 26, -26), Vector3(0, 1, 0))
	moon.light_color = Color(0.62, 0.7, 1.0); moon.light_energy = 1.4; moon.shadow_enabled = true; moon.directional_shadow_max_distance = 40; moon.light_volumetric_fog_energy = 1.2
	var key := SpotLight3D.new(); add_child(key); key.look_at_from_position(Vector3(3.5, 5.2, 9.5), Vector3(0, 1.4, 0.4))
	key.light_color = Color(1, 0.8, 0.62); key.light_energy = 3.0; key.spot_range = 22; key.spot_angle = 24; key.spot_angle_attenuation = 1.5; key.shadow_enabled = true
	floor_plane(72, 18)
	for k in range(-4, 5): piece("SM_Bld_Pillar_Ornate_Large_01", Vector3(k * 4.2, 0, -4.4), 0, 0.9)
	for sd in [-1, 1]:
		piece("SM_Prop_Brazier_01", Vector3(sd * 4.7, 0, 2.3), 0, 1.2)
		fire(Vector3(sd * 4.7, 0.95, 2.3), 1.0 if sd < 0 else 2.0, 6.0, 10.0, sd < 0)
	piece("SM_Prop_Statue_12", Vector3(-6, 0, -1.5), 0.4, 1.4)
	piece("SM_Prop_Statue_01", Vector3(6, 0, -1.5), -0.4, 1.4)
	figure("SM_Chr_Guard_Male_01", ["SM_Chr_Attach_Headpiece_02"], [], Vector3(-3, 0, 0), 0.3, "ArmsFolded_Casual_Loop_Masc", 0.3)
	figure("SM_Chr_Queen_01", [], ["SM_Chr_Attach_Headpiece_Queen_01"], Vector3(-1.5, 0, 0.4), 0.18, "Inspect_Hands_Masc", 0.9)
	figure("SM_Chr_Priest_01", ["SM_Chr_Attach_Headpiece_01"], ["SM_Chr_Attach_Crown_01"], Vector3(0, 0, 0.7), 0.0, "HeadNod_Small_Masc", 0.0)
	figure("SM_Chr_Pharaoh_01", ["SM_Chr_Attach_Headpiece_Pharaoh_04"], [], Vector3(1.5, 0, 0.4), -0.18, "Base_Masc", 0.6)
	figure("SM_Chr_Priestess_01", ["SM_Chr_Attach_Headpiece_04"], [], Vector3(3, 0, 0), -0.3, "Base_Femn", 1.2)
	dust(Vector3(0, 2, 0), Vector3(8, 2, 4), 160, Color(0.9, 0.7, 0.45))

func build_ante() -> void:
	environment(false, 0.025, Color(0.9, 0.75, 0.55), 1.2, 8.0)
	floor_plane(14, 4)
	var W := "Wall_Hieroglyph_01.png"
	box(Vector3(10, 4, 0.3), Vector3(0, 2, -5.1), W, Vector2(6, 2.4), Color(0.85, 0.8, 0.72))
	box(Vector3(0.3, 4, 8), Vector3(-5, 2, -1.2), W, Vector2(4.8, 2.4), Color(0.85, 0.8, 0.72))
	box(Vector3(0.3, 4, 8), Vector3(5, 2, -1.2), W, Vector2(4.8, 2.4), Color(0.85, 0.8, 0.72))
	box(Vector3(10, 4, 0.3), Vector3(0, 2, 2.6), W, Vector2(3, 1.2), Color(0.9, 0.82, 0.7))
	box(Vector3(10, 0.3, 8), Vector3(0, 3.9, -1.2), "Stucco_01.png", Vector2(3, 3), Color(0.7, 0.62, 0.5))
	# the treasure, packed in as Carter saw it: funerary couch, thrones, chest, chariot parts, guardian statues by the sealed door
	piece("SM_Prop_Bed_Funerary_01", Vector3(0, 0, -4.1), 0, 1.0, true)
	piece("SM_Prop_Chair_Throne_01", Vector3(-2.7, 0, -2.9), 0.6, 1.0, true)
	piece("SM_Prop_Treasure_Chest_01", Vector3(-1.7, 0, -1.7), 0.3, 1.0, true)
	piece("SM_Prop_Jewellery_Box_01", Vector3(-0.9, 0, -2.4), -0.2, 1.0, true)
	piece("SM_Prop_Vase_Pile_01", Vector3(-3.8, 0, -1.2), 0.5, 1.0)
	piece("SM_Prop_Statue_Small_01", Vector3(-3.6, 0, -4.1), 0.4, 1.0, true)
	piece("SM_Prop_Statue_Small_02", Vector3(-2.9, 0, -4.3), 0.2, 1.0, true)
	piece("SM_Prop_Statue_Small_03", Vector3(-4.2, 0, -3.4), 0.9, 1.0, true)
	piece("SM_Prop_Statue_01", Vector3(4.1, 0, -3.6), -1.35, 1.0)
	piece("SM_Prop_Statue_12", Vector3(4.1, 0, -1.4), -1.25, 1.0)
	piece("SM_Prop_Chair_Throne_01", Vector3(1.4, 0, -2.6), -0.5, 1.0, true)
	piece("SM_Prop_Statue_Small_02", Vector3(0.9, 0, -4.2), -0.3, 1.0, true)
	piece("SM_Prop_Chair_Throne_02", Vector3(2.3, 0, -0.7), -0.8, 1.0, true)
	piece("SM_Prop_Coin_Pile_01", Vector3(0.5, 0, -1.2), 0.0, 1.0)
	piece("SM_Prop_Coin_Pile_03", Vector3(-0.5, 0, -3.1), 1.0, 1.0)
	piece("SM_Prop_Canopic_Jar_01", Vector3(1.1, 0, -3.8), 0.3, 1.0, true)
	piece("SM_Prop_Vase_01", Vector3(-0.2, 0, -0.6), 0.0, 1.0)
	piece("SM_Prop_Vase_03", Vector3(3.3, 0, 0.6), 0.0, 1.0)
	# the candle, just in front of the hole Carter is looking through
	fire(Vector3(-1.6, 1.25, 1.75), 3.0, 6.5, 12.0, true, 0.22, false)  # Carter's candle, just out of frame
	var fill := OmniLight3D.new(); fill.position = Vector3(1.5, 3.2, -2.0); fill.light_color = Color(0.45, 0.4, 0.55); fill.light_energy = 0.25; fill.omni_range = 9; add_child(fill)
	dust(Vector3(0, 1.6, -1.5), Vector3(4, 1.5, 3), 220, Color(1.0, 0.75, 0.45))

func build_debug() -> void:
	var e := Environment.new(); e.background_mode = Environment.BG_COLOR; e.background_color = Color(0.3, 0.32, 0.36)
	e.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR; e.ambient_light_color = Color(1, 1, 1); e.ambient_light_energy = 0.6
	var we := WorldEnvironment.new(); we.environment = e; add_child(we)
	var sun := DirectionalLight3D.new(); add_child(sun); sun.look_at_from_position(Vector3(3, 6, 8), Vector3.ZERO); sun.light_energy = 1.2
	floor_plane(20, 5)
	var f := figure("SM_Chr_Priest_01", ["SM_Chr_Attach_Headpiece_01"], ["SM_Chr_Attach_Crown_01"], Vector3(0, 0, 0), 0.0, "HeadNod_Small_Masc", 0.0)
	figure("SM_Chr_Queen_01", [], ["SM_Chr_Attach_Headpiece_Queen_01"], Vector3(-1.2, 0, 0), 0.3, "Base_Femn", 0.0)
	piece("SM_Prop_Statue_01", Vector3(1.4, 0, 0), -0.4, 1.0)
	var sk: Skeleton3D = f.find_children("*", "Skeleton3D", true, false)[0]
	var ap: AnimationPlayer = f.find_children("*", "AnimationPlayer", true, false)[0]
	print("DBG playing=", ap.is_playing(), " cur=", ap.current_animation, " root=", ap.root_node, " len=", anim("HeadNod_Small_Masc").length)
	var a := anim("HeadNod_Small_Masc")
	for i in min(3, a.get_track_count()): print("DBG track ", a.track_get_path(i), " -> node? ", f.get_node_or_null(NodePath(String(a.track_get_path(i)).split(":")[0])) != null)
	print("DBG shoulder bone ", sk.find_bone("Shoulder_L"), " rest ", sk.get_bone_rest(sk.find_bone("Shoulder_L")).basis.get_euler())

# ---------------------------------------------------------------- per frame
func sm01(x: float) -> float:
	var u := clampf(x, 0.0, 1.0)
	return u * u * (3.0 - 2.0 * u)

func _update(_d: float) -> void:
	for f in flames:
		var l: OmniLight3D = f[0]
		l.light_energy = f[2] * (0.84 + 0.1 * sin(t * 11.0 + f[1]) + 0.06 * sin(t * 23.7 + f[1] * 2.0))
	if shot == "debug":
		cam.fov = 40; cam.look_at_from_position(Vector3(0, 1.3, 4.2), Vector3(0, 1.0, 0)); return
	if shot == "temple":
		var u := sm01(t / 4.0)
		var pos := Vector3(-1.2 + 2.6 * u, 1.55, 8.0 - 0.8 * u)
		cam.fov = 36
		cam.look_at_from_position(pos, Vector3(-0.2 + 0.9 * u, 1.28, 0))
	else:
		var u := sm01(t / 5.0)
		cam.fov = 52
		cam.look_at_from_position(Vector3(-1.3 + 0.06 * sin(t * 0.7), 1.7, 2.3), Vector3(-1.4 + 2.8 * u, 0.8, -3.2))
