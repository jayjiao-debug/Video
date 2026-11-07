extends Node3D
## 一块怀表 · the hero cold open (9:16). Western town from POLYGON Western (+ Frontier), golden hour.
## Shots (user arg shot=…): lineup, duel, hhand, tumble, ohand, heyes, oeyes, flash, reveal, watch.
## Assets: GP_ASSETS (fbx/, tex/, anim/, west_mat.json). Synty files never go in the repo.

var A := OS.get_environment("GP_ASSETS") if OS.has_environment("GP_ASSETS") else "/dev/shm/west/assets/"
var shot := "lineup"
var t := 0.0
var opts := {}
var cam: Camera3D
var wm: Dictionary
var frontier := {}
var tex_cache := {}
var mat_cache := {}
var fbx_cache := {}
var ca: CameraAttributesPractical
var env: Environment
var upd := Callable()
var re_suffix := RegEx.create_from_string("_\\d+$")

func _ready() -> void:
	for a in OS.get_cmdline_user_args():
		if "=" in a: opts[a.get_slice("=", 0)] = a.get_slice("=", 1)
	shot = opts.get("shot", shot); t = float(opts.get("t0", "0"))
	wm = JSON.parse_string(FileAccess.get_file_as_string(A + "west_mat.json"))
	for f in wm["frontier"]: frontier[f] = true
	cam = Camera3D.new(); add_child(cam); cam.make_current(); cam.near = 0.03; cam.far = 1500
	call("build_" + shot)
	_tick()

func _process(delta: float) -> void:
	t += delta
	_tick()

func _tick() -> void:
	if upd.is_valid(): upd.call()

func sm(x: float) -> float:
	var u := clampf(x, 0.0, 1.0); return u * u * (3.0 - 2.0 * u)
func seg(a: float, b: float) -> float:
	return sm((t - a) / (b - a))

# ---------------------------------------------------------------- textures and materials
func tex(n: String) -> Texture2D:
	if tex_cache.has(n): return tex_cache[n]
	var img: Image = null
	for ext in [".png", ".tga", ".jpg"]:
		if FileAccess.file_exists(A + "tex/" + n + ext): img = Image.load_from_file(A + "tex/" + n + ext); break
	if img == null: img = Image.load_from_file(A + "tex/PolygonWestern_Texture_01_A.png")
	img.generate_mipmaps()
	tex_cache[n] = ImageTexture.create_from_image(img)
	return tex_cache[n]

func mat(texn: String, glass := false) -> StandardMaterial3D:
	var key := texn + ("#g" if glass else "")
	if mat_cache.has(key): return mat_cache[key]
	var m := StandardMaterial3D.new()
	if glass:
		m.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA; m.albedo_color = Color(0.6, 0.66, 0.7, 0.12); m.roughness = 0.04; m.metallic = 0.5; m.metallic_specular = 0.9
	else:
		m.albedo_texture = tex(texn); m.roughness = 0.88
	mat_cache[key] = m
	return m

func slots_for(names: Array) -> Array:
	for n0 in names:
		var n: String = n0
		for _i in 3:
			if wm["mesh"].has(n): return wm["mesh"][n]
			if wm["mesh"].has(n + "_01"): return wm["mesh"][n + "_01"]
			var m := re_suffix.search(n)
			if m == null: break
			n = n.substr(0, m.get_start())
	return []

func apply_west(root: Node, p: String) -> void:
	var fr := frontier.has(p) or p.begins_with("WF_") or p.begins_with("SK_Chr_")
	var dflt := "PolygonWesternFrontier_Texture_01_A" if fr else "PolygonWestern_Texture_01_A"
	for mi in root.find_children("*", "MeshInstance3D", true, false):
		var slots := slots_for([String(mi.name), String(mi.get_parent().name), p])
		for s in mi.mesh.get_surface_count():
			var mn := ""; var tn := dflt
			if s < slots.size(): mn = slots[s][0]; tn = slots[s][1]
			elif slots.size() > 0: mn = slots[-1][0]; tn = slots[-1][1]
			var glass := "glass" in mn.to_lower() or "glass" in String(mi.name).to_lower() or "Broken_Windows" in tn
			if tn.begins_with("No Albedo") or tn.begins_with("Uses custom"): tn = dflt
			mi.set_surface_override_material(s, mat(tn, glass))

func fbx(p: String, dir := "fbx/") -> Node3D:
	var key := dir + p
	if not fbx_cache.has(key):
		var doc := FBXDocument.new(); var st := FBXState.new()
		if doc.append_from_file(A + dir + p + ".fbx", st) != OK: push_error("fbx load failed " + key)
		fbx_cache[key] = doc.generate_scene(st)
	return fbx_cache[key].duplicate()

func piece(p: String, pos: Vector3, ry := 0.0, s := 1.0) -> Node3D:
	var n := fbx(p); apply_west(n, p)
	n.position = pos; n.rotation.y = ry; n.scale = Vector3.ONE * s
	add_child(n); return n

# ---------------------------------------------------------------- characters (idles retargeted from the Synty animation rig)
const RIG_MAP := {"Hips": "Pelvis", "Neck": "neck_01", "Shoulder_L": "UpperArm_L", "Shoulder_R": "UpperArm_R", "Elbow_L": "lowerarm_l", "Elbow_R": "lowerarm_r",
	"Wrist_L": "Hand_L", "Wrist_R": "Hand_R", "UpperLeg_L": "Thigh_L", "UpperLeg_R": "Thigh_R", "LowerLeg_L": "calf_l", "LowerLeg_R": "calf_r", "Ankle_L": "Foot_L", "Ankle_R": "Foot_R"}
var gr_r := {}
var rig_parent := {}
var anim_rig_cache := {}
func _rests() -> void:
	if not gr_r.is_empty(): return
	var sr: Skeleton3D = fbx("PolygonSyntyCharacter", "anim/").find_children("*", "Skeleton3D", true, false)[0]
	for i in sr.get_bone_count():
		gr_r[sr.get_bone_name(i)] = sr.get_bone_global_rest(i).basis.get_rotation_quaternion()
		rig_parent[sr.get_bone_name(i)] = sr.get_bone_name(sr.get_bone_parent(i)) if sr.get_bone_parent(i) >= 0 else ""

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
		var sp: String = rig_parent.get(b, "")
		var L: Quaternion = (grt[tp] if tp >= 0 else Quaternion()).inverse() * (gr_r[sp] if sp != "" and gr_r.has(sp) else Quaternion())
		var R: Quaternion = gr_r[b].inverse() * grt[ti]
		var ty := a.track_get_type(i)
		if ty == Animation.TYPE_POSITION_3D and ti != lower.get("pelvis", -1): drop.append(i); continue
		for k in a.track_get_key_count(i):
			if ty == Animation.TYPE_ROTATION_3D: a.track_set_key_value(i, k, (L * (a.track_get_key_value(i, k) as Quaternion) * R).normalized())
			elif ty == Animation.TYPE_POSITION_3D: a.track_set_key_value(i, k, L * (a.track_get_key_value(i, k) as Vector3))
		a.track_set_path(i, NodePath(skel_path + ":" + sk.get_bone_name(ti)))
	drop.reverse()
	for i in drop: a.remove_track(i)
	anim_rig_cache[key] = a
	return a

func person(p: String, pos: Vector3, ry: float, idle: String, ph: float) -> Dictionary:
	var c := fbx(p); apply_west(c, p)
	for old in c.find_children("*", "AnimationPlayer", true, false): old.free()
	var sk: Skeleton3D = c.find_children("*", "Skeleton3D", true, false)[0]
	var clip := anim_for(sk, String(c.get_path_to(sk)), idle)
	var ap := AnimationPlayer.new(); c.add_child(ap)
	var lib := AnimationLibrary.new(); lib.add_animation("idle", clip); ap.add_animation_library("", lib)
	c.position = pos; c.rotation.y = ry
	add_child(c)
	ap.play("idle"); ap.seek(fmod(ph + t, clip.length), true)
	return {"node": c, "sk": sk}

func bone(sk: Skeleton3D, n: String) -> int:
	for i in sk.get_bone_count():
		if sk.get_bone_name(i).to_lower() == n.to_lower(): return i
	return -1

## a static piece modelled in character space (holster, revolver in its holster) that follows one bone
func attach(ch: Dictionary, p: String, bn: String, off := Transform3D.IDENTITY) -> Node3D:
	var sk: Skeleton3D = ch["sk"]; var b := bone(sk, bn)
	var ba := BoneAttachment3D.new(); ba.bone_idx = b; sk.add_child(ba)
	var x := fbx(p); apply_west(x, p)
	x.transform = sk.get_bone_global_rest(b).affine_inverse() * off
	ba.add_child(x); return x

## the squint: squash the eyes bone along the axis that is vertical in the world, lower the brows
func squint(ch: Dictionary, amount: float) -> void:
	var sk: Skeleton3D = ch["sk"]
	var e := bone(sk, "eyes"); var br := bone(sk, "eyebrows")
	if e >= 0:
		var up := sk.get_bone_global_rest(e).basis.inverse() * Vector3.UP
		var s := Vector3.ONE
		var ax := 0
		if absf(up.y) > absf(up[ax]): ax = 1
		if absf(up.z) > absf(up[ax]): ax = 2
		s[ax] = lerpf(1.0, 0.32, amount)
		sk.set_bone_pose_scale(e, s)
	if br >= 0:
		var up2 := sk.get_bone_global_rest(br).basis.inverse() * Vector3.UP
		sk.set_bone_pose_position(br, sk.get_bone_rest(br).origin - up2.normalized() * 0.012 * amount)

# ---------------------------------------------------------------- world: sky, sun, ground, atmosphere
func world(sun_dir_from: Vector3, sun_col: Color, sun_e: float, exposure: float, fog: float) -> DirectionalLight3D:
	env = Environment.new()
	env.background_mode = Environment.BG_SKY
	var sky := Sky.new(); var smat := ShaderMaterial.new(); var sh := Shader.new()
	sh.code = """shader_type sky;
uniform vec3 sun_dir; uniform vec3 zen; uniform vec3 mid; uniform vec3 hor; uniform vec3 glow;
float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vn(vec2 p){ vec2 i = floor(p); vec2 f = fract(p); f = f*f*(3.0-2.0*f);
	return mix(mix(h21(i), h21(i+vec2(1,0)), f.x), mix(h21(i+vec2(0,1)), h21(i+vec2(1,1)), f.x), f.y); }
void sky(){
	float h = EYEDIR.y;
	vec3 c = mix(hor, mid, smoothstep(0.0, 0.18, h)); c = mix(c, zen, smoothstep(0.15, 0.7, h));
	float sd = max(dot(normalize(EYEDIR), normalize(sun_dir)), 0.0);
	c += glow * (pow(sd, 6.0) * 0.55 + pow(sd, 60.0) * 1.2);
	c += vec3(1.0, 0.85, 0.6) * smoothstep(0.9993, 0.9997, sd) * 12.0;
	vec2 uv = EYEDIR.xz / max(h + 0.12, 0.05) * 1.6;
	float cl = vn(uv * 1.3) * 0.6 + vn(uv * 3.1) * 0.3 + vn(uv * 7.0) * 0.1;
	cl = smoothstep(0.55, 0.85, cl) * smoothstep(0.02, 0.25, h);
	vec3 ccol = mix(vec3(1.0, 0.62, 0.42), vec3(1.0, 0.9, 0.8), smoothstep(0.0, 0.5, h)) * (0.9 + pow(sd, 3.0) * 0.8);
	c = mix(c, ccol, cl * 0.75);
	if (h < 0.0) c = mix(hor, vec3(0.55, 0.38, 0.26), smoothstep(0.0, -0.1, h));
	COLOR = c; }"""
	smat.shader = sh
	smat.set_shader_parameter("sun_dir", sun_dir_from.normalized())
	smat.set_shader_parameter("zen", Vector3(0.16, 0.30, 0.58)); smat.set_shader_parameter("mid", Vector3(0.52, 0.58, 0.68))
	smat.set_shader_parameter("hor", Vector3(1.0, 0.70, 0.46)); smat.set_shader_parameter("glow", Vector3(1.0, 0.55, 0.25))
	sky.sky_material = smat; env.sky = sky
	env.ambient_light_source = Environment.AMBIENT_SOURCE_SKY; env.ambient_light_energy = 0.55
	env.reflected_light_source = Environment.REFLECTION_SOURCE_SKY
	env.tonemap_mode = Environment.TONE_MAPPER_ACES; env.tonemap_exposure = exposure; env.tonemap_white = 6.0
	env.ssao_enabled = true; env.ssao_radius = 1.2; env.ssao_intensity = 2.0
	env.ssil_enabled = true
	env.sdfgi_enabled = true; env.sdfgi_use_occlusion = true; env.sdfgi_energy = 0.9
	env.glow_enabled = true; env.glow_intensity = 0.55; env.glow_strength = 1.1; env.glow_bloom = 0.04; env.glow_hdr_threshold = 1.1
	env.volumetric_fog_enabled = fog > 0.0; env.volumetric_fog_density = fog; env.volumetric_fog_albedo = Color(1.0, 0.86, 0.7)
	env.volumetric_fog_anisotropy = 0.6; env.volumetric_fog_length = 120.0
	env.fog_enabled = true; env.fog_light_color = Color(0.95, 0.72, 0.52); env.fog_density = 0.0016; env.fog_aerial_perspective = 0.6; env.fog_sky_affect = 0.0
	env.adjustment_enabled = true; env.adjustment_contrast = 1.12; env.adjustment_saturation = 1.08
	var we := WorldEnvironment.new(); we.environment = env
	ca = CameraAttributesPractical.new(); ca.dof_blur_amount = 0.12
	we.camera_attributes = ca
	add_child(we)
	var sun := DirectionalLight3D.new(); add_child(sun)
	sun.look_at_from_position(sun_dir_from.normalized() * 100.0, Vector3.ZERO)
	sun.light_color = sun_col; sun.light_energy = sun_e; sun.shadow_enabled = true
	sun.directional_shadow_mode = DirectionalLight3D.SHADOW_PARALLEL_4_SPLITS; sun.directional_shadow_max_distance = 140
	sun.shadow_blur = 1.2; sun.light_volumetric_fog_energy = 1.4; sun.light_angular_distance = 0.6
	return sun

func noise_tex(seed: int, freq: float, normal: bool, lo: Color, hi: Color) -> Texture2D:
	var n := FastNoiseLite.new(); n.seed = seed; n.frequency = freq; n.fractal_octaves = 5
	var img := n.get_seamless_image(512, 512, false, normal, 0.1, normal)
	if not normal:
		img.convert(Image.FORMAT_RGB8)
		for y in 512:
			for x in 512:
				var v := img.get_pixel(x, y).r
				img.set_pixel(x, y, lo.lerp(hi, v))
	img.generate_mipmaps()
	return ImageTexture.create_from_image(img)

func ground(center: Vector3, size: float, lo: Color, hi: Color, uv: float) -> MeshInstance3D:
	var g := MeshInstance3D.new(); var pm := PlaneMesh.new(); pm.size = Vector2(size, size); g.mesh = pm
	var m := StandardMaterial3D.new(); m.albedo_texture = noise_tex(3, 0.02, false, lo, hi); m.uv1_scale = Vector3(uv, uv, uv)
	m.normal_enabled = true; m.normal_texture = noise_tex(7, 0.05, true, Color.BLACK, Color.WHITE); m.normal_scale = 0.6; m.roughness = 0.95
	g.material_override = m; g.position = center; add_child(g); return g

func soft_dot() -> Texture2D:
	var gt := GradientTexture2D.new(); gt.fill = GradientTexture2D.FILL_RADIAL; gt.fill_from = Vector2(0.5, 0.5); gt.fill_to = Vector2(1.0, 0.5)
	var gr := Gradient.new(); gr.set_color(0, Color(1, 1, 1, 1)); gr.set_color(1, Color(1, 1, 1, 0)); gt.gradient = gr
	gt.width = 64; gt.height = 64; return gt

func dust(center: Vector3, ext: Vector3, n: int, col: Color, sz := 0.02, vel := Vector3(0.6, 0.05, 0.0)) -> CPUParticles3D:
	var p := CPUParticles3D.new(); p.amount = n; p.lifetime = 12; p.preprocess = 12; p.position = center
	p.emission_shape = CPUParticles3D.EMISSION_SHAPE_BOX; p.emission_box_extents = ext
	p.direction = vel.normalized(); p.spread = 25; p.initial_velocity_min = vel.length() * 0.5; p.initial_velocity_max = vel.length() * 1.5; p.gravity = Vector3(0, -0.01, 0)
	p.scale_amount_min = sz * 0.5; p.scale_amount_max = sz * 1.5
	var q := QuadMesh.new(); var qm := StandardMaterial3D.new()
	qm.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED; qm.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA; qm.blend_mode = BaseMaterial3D.BLEND_MODE_ADD
	qm.billboard_mode = BaseMaterial3D.BILLBOARD_PARTICLES; qm.billboard_keep_scale = true; qm.albedo_texture = soft_dot(); qm.albedo_color = col
	q.material = qm; p.mesh = q; add_child(p); return p

# ---------------------------------------------------------------- shot: lineup (casting and material check)
func build_lineup() -> void:
	world(Vector3(0.4, 0.5, 1.0), Color(1, 0.9, 0.8), 2.0, 1.0, 0.0)
	ground(Vector3.ZERO, 60, Color(0.7, 0.55, 0.4), Color(0.85, 0.7, 0.52), 8)
	var names := ["SK_Character_Gunman_01", "SK_Character_Badguy_01", "SK_Character_Cowboy_01", "SK_Character_Sheriff_01", "SK_Character_Business_Man_01",
		"SK_Chr_Bandit_Male_01", "SK_Chr_Thug_Male_01", "SK_Chr_Hunter_Male_01", "SK_Chr_Captain_Male_01", "SK_Chr_Salesman_Male_01"]
	for i in names.size():
		person(names[i], Vector3(-4.5 + i * 1.0, 0, 0), 0.0, "Base_Masc", i * 0.3)
	piece("SM_Wep_Revolver_01", Vector3(-4.5, 1.0, 1.2), 0.0, 1.0)
	piece("SM_CharacterAttachment_Holster_01", Vector3(-3.5, 0, 1.2), 0.0, 1.0)
	piece("SM_Prop_PokerTable_01", Vector3(3, 0, 3), 0.0, 1.0)
	cam.fov = 40; cam.look_at_from_position(Vector3(0, 2.2, 9.5), Vector3(0, 0.9, 0))

# ---------------------------------------------------------------- the town (Synty's dressed demo street) + desert around it
var G := -0.42                      # street level in the demo scene
var hero: Dictionary
var foe: Dictionary
var weeds := []
func town(sun_from := Vector3(0.12, 0.15, 1.0), exposure := 0.95, fog := 0.006) -> DirectionalLight3D:
	var sun := world(sun_from, Color(1.0, 0.66, 0.4), 3.2, exposure, fog)
	var tw := fbx("POLYGON_Western_Demo_Scene"); apply_west(tw, ""); add_child(tw)
	ground(Vector3(0, G, -20), 900, Color(0.66, 0.47, 0.31), Color(0.86, 0.66, 0.46), 90)
	var road := ground(Vector3(0.3, G + 0.005, -25), 1, Color(0.6, 0.43, 0.29), Color(0.78, 0.6, 0.42), 1)
	road.scale = Vector3(11, 1, 90)
	(road.material_override as StandardMaterial3D).uv1_scale = Vector3(4, 30, 1)
	for b in [["SM_Env_Butte_01", Vector3(-60, G - 2, -330), 3.2, 0.3], ["SM_Env_Butte_02", Vector3(70, G - 2, -300), 3.6, 1.2], ["SM_Env_Butte_03", Vector3(-160, G - 2, -260), 3.0, 2.0],
			["SM_Env_Butte_04", Vector3(170, G - 2, -360), 4.0, 0.7], ["SM_Env_Butte_01", Vector3(10, G - 2, -520), 5.0, 2.6], ["SM_Env_Butte_03", Vector3(-260, G - 2, -140), 3.0, 1.0]]:
		piece(b[0], b[1], b[3], b[2])
	piece("SM_Bld_TowerClock_01", Vector3(8.6, G, -57), -PI / 2, 1.0)
	for c in [[-11, -3], [12, 2], [-16, -48], [17, -60], [-9, 14], [13, -20], [-20, -25]]:
		piece("SM_Env_Cactus_0%d" % (1 + (abs(c[0] + c[1]) % 9)), Vector3(c[0], G, c[1]), c[1] * 0.37, 1.0)
	for d in [[-14, -58], [15, 8], [-25, 5]]: piece("SM_Env_TreeDead_0%d" % (1 + abs(d[0]) % 3), Vector3(d[0], G, d[1]), d[0] * 0.2, 1.0)
	dust(Vector3(0.3, G + 1.2, -14), Vector3(5, 1.2, 9), 420, Color(1.0, 0.82, 0.6, 0.9), 0.018)
	dust(Vector3(0.3, G + 0.25, -14), Vector3(6, 0.25, 10), 160, Color(0.9, 0.7, 0.5, 0.35), 0.12, Vector3(1.4, 0.02, 0))
	return sun

func cast(hpos: Vector3, fpos: Vector3) -> void:
	hero = person("SK_Chr_Bandit_Male_01", hpos, PI, "Base_Masc", 0.0)
	foe = person("SK_Character_Badguy_01", fpos, 0.0, "Base_Masc", 0.9)

func hide_hero(on: bool) -> void:
	for gi in hero["node"].find_children("*", "GeometryInstance3D", true, false):
		gi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_SHADOWS_ONLY if on else GeometryInstance3D.SHADOW_CASTING_SETTING_ON

func tumbleweed(from: Vector3, to: Vector3, t0: float, dur: float) -> void:
	var w := piece("SM_Prop_Tumbleweed_01", from, 0.0, 1.0)
	weeds.append([w, from, to, t0, dur])

func roll_weeds() -> void:
	for wd in weeds:
		var u := clampf((t - wd[3]) / wd[4], 0.0, 1.0)
		var p: Vector3 = (wd[1] as Vector3).lerp(wd[2], u)
		p.y += absf(sin(u * PI * 5.0)) * 0.25
		wd[0].position = p; wd[0].rotation = Vector3(0, 0, -u * TAU * 3.0)

# ---------------------------------------------------------------- shot: the duel (one continuous move, 0–7.8 s)
## 0–1.2 over the shoulder (16:9 band in post) · 1.2–3.4 dolly zoom into his eyes (bars open) · 3.4–4.9 his POV ·
## 4.9–6.9 crash-push onto the opponent's eyes (bars close) · 6.9–7.8 the eyes; he narrows them.
var D := {}
func build_duel() -> void:
	town()
	var hp := at_ground(0.3, -8); var fp := at_ground(0.3, -20)
	cast(hp, fp)
	var hy := hp.y; var fy := fp.y
	var oh := Vector3(0.3, fy + 1.62, -20)
	D = {"p0": Vector3(1.0, hy + 1.72, 0.5), "p1": Vector3(0.3, hy + 1.6, -8.1), "pe": Vector3(0.3, fy + 1.63, -18.65),
		"look0": Vector3(0.3, fy + 1.25, -20), "lookE": Vector3(0.3, fy + 1.648, -19.92), "head": oh, "hidden": false, "hz": hp.z}
	D["k"] = D["p0"].distance_to(oh) * 0.240
	var fill := OmniLight3D.new(); fill.position = Vector3(0.35, fy + 1.3, -19.0); fill.light_color = Color(1.0, 0.78, 0.6); fill.light_energy = 1.2; fill.omni_range = 2.2; add_child(fill)   # bounce from the street onto his face
	upd = _upd_duel

func _upd_duel() -> void:
	var p: Vector3; var look: Vector3 = D["look0"]; var tanv: float
	if t < 4.9:
		var u: float
		if t < 1.2: u = 0.05 * t / 1.2
		elif t < 3.4: u = 0.05 + 0.95 * seg(1.2, 3.4)
		else: u = 1.0
		p = D["p0"].lerp(D["p1"], u)
		if t >= 3.4: p += Vector3(sin(t * 1.3) * 0.004, sin(t * 2.1) * 0.003, 0)
		tanv = D["k"] / p.distance_to(D["head"])
	else:
		var tv1: float = D["k"] / (D["p1"] as Vector3).distance_to(D["head"])
		var u := seg(4.9, 6.9)
		p = D["p1"].lerp(D["pe"], u) + Vector3(0, 0, -0.08 * seg(6.9, 7.8))
		look = D["look0"].lerp(D["lookE"], sm(u * 1.4))
		tanv = lerpf(tv1, 0.235, u)
	cam.fov = rad_to_deg(2.0 * atan(tanv))
	cam.look_at_from_position(p, look)
	var d := p.distance_to(D["head"])
	ca.dof_blur_far_enabled = true; ca.dof_blur_far_distance = d + (1.0 if t < 4.9 else 0.35); ca.dof_blur_far_transition = 4.0 if t < 4.9 else 1.5
	if not D["hidden"] and p.z < D["hz"] + 0.45: hide_hero(true); D["hidden"] = true
	squint(foe, seg(7.0, 7.5))


# ---------------------------------------------------------------- terrain height (the demo scene carries its own ground)
func ground_y(x: float, z: float, maxy := 4.0) -> float:
	var best := -INF
	for mi in find_children("*", "MeshInstance3D", true, false):
		var m := mi as MeshInstance3D
		if m.mesh == null or not m.is_inside_tree(): continue
		var gx := m.global_transform
		var bb := gx * m.get_aabb()
		if x < bb.position.x or x > bb.end.x or z < bb.position.z or z > bb.end.z or bb.position.y > maxy: continue
		var f := m.mesh.get_faces()
		for i in range(0, f.size(), 3):
			var a := gx * f[i]; var b := gx * f[i + 1]; var c := gx * f[i + 2]
			var d := (b.z - c.z) * (a.x - c.x) + (c.x - b.x) * (a.z - c.z)
			if absf(d) < 1e-9: continue
			var l1 := ((b.z - c.z) * (x - c.x) + (c.x - b.x) * (z - c.z)) / d
			var l2 := ((c.z - a.z) * (x - c.x) + (a.x - c.x) * (z - c.z)) / d
			var l3 := 1.0 - l1 - l2
			if l1 < 0 or l2 < 0 or l3 < 0: continue
			var y := l1 * a.y + l2 * b.y + l3 * c.y
			if y <= maxy and y > best: best = y
	return best if best > -INF else G

func at_ground(x: float, z: float) -> Vector3:
	return Vector3(x, ground_y(x, z), z)

# ---------------------------------------------------------------- cutaways (each a short render; same set, same light)
func duel_set() -> void:
	town()
	cast(at_ground(0.3, -8), at_ground(0.3, -20))

func look_lens(p: Vector3, look: Vector3, fov: float, focus: float, far_tr := 2.0) -> void:
	cam.fov = fov; cam.look_at_from_position(p, look)
	ca.dof_blur_far_enabled = true; ca.dof_blur_far_distance = focus; ca.dof_blur_far_transition = far_tr

## his hand over the holster, the opponent soft in the distance
func build_hhand() -> void:
	duel_set(); var h: Vector3 = hero["node"].position
	upd = func():
		var u := t / 1.0
		look_lens(h + Vector3(0.95 - 0.05 * u, 0.92, 1.45), h + Vector3(0.3, 0.72, 0.0), 22, 1.6, 0.6)

## the opponent's hand, the gunslinger soft behind
func build_ohand() -> void:
	duel_set(); var f: Vector3 = foe["node"].position
	var fill := OmniLight3D.new(); fill.position = f + Vector3(-0.6, 0.9, 0.9); fill.light_energy = 0.8; fill.omni_range = 2.5; fill.light_color = Color(1, 0.8, 0.6); add_child(fill)
	upd = func():
		var u := t / 1.0
		look_lens(f + Vector3(-0.95 + 0.05 * u, 0.92, 1.45), f + Vector3(-0.3, 0.72, 0.0), 22, 1.6, 0.6)

## low between their boots: a tumbleweed rolls through
func build_tumble() -> void:
	duel_set(); var h: Vector3 = hero["node"].position
	tumbleweed(Vector3(-5.5, h.y + 0.4, -12.0), Vector3(6.0, h.y + 0.4, -13.0), 0.0, 1.3)
	dust(at_ground(0, -13) + Vector3(0, 0.15, 0), Vector3(4, 0.12, 1.5), 140, Color(0.95, 0.75, 0.55, 0.5), 0.09, Vector3(2.5, 0.05, 0))
	upd = func():
		roll_weeds()
		look_lens(h + Vector3(0.5, 0.2, 1.4), h + Vector3(0.1, 0.75, -12.0), 28, 13.4, 6.0)

## his eyes, under the brim, against the sun
func build_heyes() -> void:
	duel_set(); var h: Vector3 = hero["node"].position
	var fill := OmniLight3D.new(); fill.position = h + Vector3(0.05, 1.3, -1.0); fill.light_energy = 1.3; fill.omni_range = 2.2; fill.light_color = Color(1, 0.78, 0.6); add_child(fill)
	upd = func():
		squint(hero, seg(0.12, 0.55))
		look_lens(h + Vector3(0, 1.648, -1.38 + 0.05 * t), h + Vector3(0, 1.648, -0.05), 11, 1.4, 0.8)

## the opponent's eyes, tighter
func build_oeyes() -> void:
	duel_set(); var f: Vector3 = foe["node"].position
	var fill := OmniLight3D.new(); fill.position = f + Vector3(0.05, 1.3, 1.0); fill.light_energy = 1.2; fill.omni_range = 2.2; fill.light_color = Color(1, 0.78, 0.6); add_child(fill)
	upd = func():
		squint(foe, 1.0)
		look_lens(f + Vector3(0, 1.648, 1.3 - 0.06 * t), f + Vector3(0, 1.648, 0.05), 12, 1.3, 0.8)

## the draw, from high above the street: a flash from his hip
func build_flash() -> void:
	duel_set(); var h: Vector3 = hero["node"].position
	var fl := OmniLight3D.new(); fl.position = h + Vector3(0.28, 0.95, -0.45); fl.light_color = Color(1.0, 0.8, 0.5); fl.omni_range = 4; fl.light_energy = 0.0; fl.shadow_enabled = true; add_child(fl)
	var flare := MeshInstance3D.new(); var sp := SphereMesh.new(); sp.radius = 0.11; sp.height = 0.22; flare.mesh = sp
	var fm := StandardMaterial3D.new(); fm.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED; fm.albedo_color = Color(1, 0.85, 0.55); fm.emission_enabled = true; fm.emission = Color(1, 0.8, 0.5); fm.emission_energy_multiplier = 30
	flare.material_override = fm; flare.position = fl.position; flare.visible = false; add_child(flare)
	upd = func():
		var on := t >= 0.2 and t < 0.27
		fl.light_energy = 7.0 if on else 0.0; flare.visible = on
		var f: Vector3 = foe["node"].position
		look_lens(f + Vector3(-0.55, 1.55, -1.7), h + Vector3(0, 1.0, 0), 20, f.distance_to(h) + 1.5, 4.0)

# ---------------------------------------------------------------- the reveal: one long crane up and back; the real distance is 69 m
func build_reveal() -> void:
	town()
	var hp := at_ground(-3.0, 6.0); var fp := at_ground(6.5, -62.5)
	hero = person("SK_Chr_Bandit_Male_01", hp, atan2(fp.x - hp.x, fp.z - hp.z), "Base_Masc", 0.0)
	foe = person("SK_Character_Badguy_01", fp, atan2(hp.x - fp.x, hp.z - fp.z), "Base_Masc", 0.9)
	var dirv := (fp - hp); dirv.y = 0; var dn := dirv.normalized(); var right := Vector3(-dn.z, 0, dn.x)
	# a line drawn on the ground between them, growing from his boots to the other man's
	var line := MeshInstance3D.new(); var bx := BoxMesh.new(); bx.size = Vector3(0.4, 0.03, 1.0); line.mesh = bx
	var lm := StandardMaterial3D.new(); lm.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED; lm.albedo_color = Color(1.0, 0.93, 0.78); lm.emission_enabled = true; lm.emission = Color(1, 0.9, 0.7); lm.emission_energy_multiplier = 2.5
	line.material_override = lm; add_child(line)
	var ticks := []
	for e in [hp, fp]:
		var tk := MeshInstance3D.new(); var tb := BoxMesh.new(); tb.size = Vector3(1.6, 0.03, 0.18); tk.mesh = tb; tk.material_override = lm
		tk.position = e + right * 1.4 + Vector3(0, 0.06, 0); tk.rotation.y = atan2(dn.x, dn.z); tk.visible = false; add_child(tk); ticks.append(tk)
	var mid := (hp + fp) * 0.5
	var p0 := hp - dn * 8.5 + right * 0.8 + Vector3(0, 1.72, 0)
	var p1 := hp - dn * 8.0 + right * -8.0 + Vector3(0, 80.0, 0)
	upd = func():
		var u := seg(0.0, 3.6)
		var p := p0.lerp(p1, u); p.y = lerpf(p0.y, p1.y, sm(u * 1.1))
		var look := (fp + Vector3(0, 1.2, 0)).lerp(mid - dn * 3.0, sm(u))
		look_lens(p, look, lerpf(27.0, 48.0, u), p.distance_to(look) + 40.0, 30.0)
		var g := seg(2.2, 3.4)
		var a := hp + right * 1.4 + Vector3(0, 0.06, 0)
		var b := a + (fp - hp) * g
		line.visible = g > 0.001
		line.position = (a + b) * 0.5; line.scale = Vector3(1, 1, maxf(a.distance_to(b), 0.01)); line.rotation.y = atan2(dn.x, dn.z)
		ticks[0].visible = g > 0.01; ticks[1].visible = g > 0.99

# ---------------------------------------------------------------- the watch, on the card table
func gold() -> StandardMaterial3D:
	var m := StandardMaterial3D.new(); m.albedo_color = Color(1.0, 0.76, 0.33); m.metallic = 1.0; m.roughness = 0.22; return m

func surface_y(n: Node, x: float, z: float) -> float:
	var best := -INF
	for mi in n.find_children("*", "MeshInstance3D", true, false):
		var m := mi as MeshInstance3D; var gx := m.global_transform; var f := m.mesh.get_faces()
		for i in range(0, f.size(), 3):
			var a := gx * f[i]; var b := gx * f[i + 1]; var c := gx * f[i + 2]
			var d := (b.z - c.z) * (a.x - c.x) + (c.x - b.x) * (a.z - c.z)
			if absf(d) < 1e-12: continue
			var l1 := ((b.z - c.z) * (x - c.x) + (c.x - b.x) * (z - c.z)) / d
			var l2 := ((c.z - a.z) * (x - c.x) + (a.x - c.x) * (z - c.z)) / d
			if l1 < 0 or l2 < 0 or l1 + l2 > 1: continue
			best = maxf(best, l1 * a.y + l2 * b.y + (1.0 - l1 - l2) * c.y)
	return best if best > -INF else top_y(n)

func top_y(n: Node) -> float:
	var y := -INF
	for mi in n.find_children("*", "MeshInstance3D", true, false):
		var bb: AABB = (mi as MeshInstance3D).global_transform * (mi as MeshInstance3D).get_aabb()
		y = maxf(y, bb.end.y)
	return y

func cyl(r: float, h: float, m: Material, pos: Vector3, parent: Node3D) -> MeshInstance3D:
	var mi := MeshInstance3D.new(); var c := CylinderMesh.new(); c.top_radius = r; c.bottom_radius = r; c.height = h; c.radial_segments = 48; mi.mesh = c
	mi.material_override = m; mi.position = pos; parent.add_child(mi); return mi

func bar(size: Vector3, m: Material, parent: Node3D) -> MeshInstance3D:
	var mi := MeshInstance3D.new(); var b := BoxMesh.new(); b.size = size; mi.mesh = b; mi.material_override = m; parent.add_child(mi); return mi

func build_watch() -> void:
	env = Environment.new(); env.background_mode = Environment.BG_COLOR; env.background_color = Color(0.03, 0.02, 0.015)
	env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR; env.ambient_light_color = Color(0.25, 0.18, 0.13); env.ambient_light_energy = 0.35
	env.tonemap_mode = Environment.TONE_MAPPER_ACES; env.tonemap_exposure = 1.0
	env.ssao_enabled = true; env.glow_enabled = true; env.glow_intensity = 0.8; env.glow_bloom = 0.06; env.glow_hdr_threshold = 1.0
	env.adjustment_enabled = true; env.adjustment_contrast = 1.12; env.adjustment_saturation = 1.05
	var we := WorldEnvironment.new(); we.environment = env
	ca = CameraAttributesPractical.new(); ca.dof_blur_amount = 0.2; we.camera_attributes = ca; add_child(we)
	var felt := MeshInstance3D.new(); var fp := PlaneMesh.new(); fp.size = Vector2(3, 3); felt.mesh = fp
	var fmat := StandardMaterial3D.new(); fmat.albedo_texture = noise_tex(11, 0.2, false, Color(0.03, 0.13, 0.07), Color(0.07, 0.24, 0.13)); fmat.uv1_scale = Vector3(6, 6, 6)
	fmat.normal_enabled = true; fmat.normal_texture = noise_tex(12, 0.5, true, Color.BLACK, Color.WHITE); fmat.normal_scale = 0.4; fmat.roughness = 1.0
	felt.material_override = fmat; add_child(felt)
	var ty := 0.0
	for c in [["SM_Prop_Card_01", Vector3(-0.11, 0, 0.06), 0.45], ["SM_Prop_Card_02", Vector3(-0.085, 0.001, 0.085), 0.9], ["SM_Prop_Card_03", Vector3(0.12, 0, 0.1), -0.5],
			["SM_Prop_Card_Pile_01", Vector3(-0.2, 0, -0.12), 0.3], ["SM_Prop_Poker_Chip_01", Vector3(0.14, 0, -0.06), 0.0], ["SM_Prop_Poker_Chip_02", Vector3(0.19, 0, -0.01), 0.0],
			["SM_Prop_Poker_Chip_03", Vector3(0.1, 0, -0.16), 0.0], ["SM_Wep_Revolver_01", Vector3(-0.3, 0.012, -0.3), 1.9]]:
		var n := piece(c[0], Vector3(c[1].x, ty + c[1].y, c[1].z), c[2], 0.6 if c[0].begins_with("SM_Wep") else 0.32)
	var lantern := piece("SM_Prop_Lantern_01", Vector3(0.42, ty, -0.35), 0.0, 1.0)
	var lamp := OmniLight3D.new(); lamp.position = Vector3(0.42, ty + 0.25, -0.35); lamp.light_color = Color(1.0, 0.62, 0.3); lamp.light_energy = 2.4; lamp.omni_range = 3.5; lamp.shadow_enabled = true; add_child(lamp)
	var key := SpotLight3D.new(); key.position = Vector3(-0.5, ty + 0.9, 0.4); key.look_at_from_position(key.position, Vector3(0, ty, 0)); key.light_color = Color(1.0, 0.8, 0.6); key.light_energy = 2.0; key.spot_angle = 22; key.shadow_enabled = true; add_child(key)
	var rim := OmniLight3D.new(); rim.position = Vector3(0.2, ty + 0.25, 0.5); rim.light_color = Color(0.55, 0.65, 1.0); rim.light_energy = 0.5; rim.omni_range = 1.5; add_child(rim)
	for b in [[Vector3(-2.5, 1.6, -3.5), Color(1, 0.6, 0.3)], [Vector3(1.8, 1.9, -4.2), Color(1, 0.7, 0.4)], [Vector3(3.5, 1.2, -2.8), Color(1, 0.55, 0.25)], [Vector3(-1.0, 2.3, -5.5), Color(1, 0.65, 0.35)]]:
		var o := MeshInstance3D.new(); var sp := SphereMesh.new(); sp.radius = 0.06; sp.height = 0.12; o.mesh = sp
		var om := StandardMaterial3D.new(); om.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED; om.albedo_color = b[1]; om.emission_enabled = true; om.emission = b[1]; om.emission_energy_multiplier = 6
		o.material_override = om; o.position = b[0] + Vector3(0, ty, 0); add_child(o)   # far saloon lamps, out of focus
	# the watch: hunter case, lid open, cream dial, ticking second hand, a chain trailing toward the camera
	var w := Node3D.new(); w.position = Vector3(0.0, ty + 0.0045, 0.0); w.rotation.y = 0.35; add_child(w)
	var g := gold(); var dial := StandardMaterial3D.new(); dial.albedo_color = Color(0.8, 0.74, 0.62); dial.roughness = 0.45
	var ink := StandardMaterial3D.new(); ink.albedo_color = Color(0.05, 0.04, 0.03)
	cyl(0.026, 0.009, g, Vector3.ZERO, w)
	cyl(0.0228, 0.002, dial, Vector3(0, 0.0046, 0), w)
	var bez := MeshInstance3D.new(); var tor := TorusMesh.new(); tor.inner_radius = 0.0224; tor.outer_radius = 0.0272; tor.rings = 48; bez.mesh = tor; bez.material_override = g; bez.position = Vector3(0, 0.0048, 0); w.add_child(bez)
	for i in 60:
		var a := i * TAU / 60.0; var big := i % 5 == 0
		var tk := bar(Vector3(0.0009 if big else 0.0004, 0.0004, 0.0032 if big else 0.0014), ink, w)
		var r := 0.0198 if big else 0.0207
		tk.position = Vector3(sin(a) * r, 0.0058, -cos(a) * r); tk.rotation.y = -a
	var hands := {}
	for hd in [["h", Vector3(0.0016, 0.0004, 0.010), 0.0060], ["m", Vector3(0.0011, 0.0004, 0.0155), 0.0064], ["s", Vector3(0.0005, 0.0004, 0.018), 0.0068]]:
		var piv := Node3D.new(); piv.position = Vector3(0, hd[2], 0); w.add_child(piv)
		var hb := bar(hd[1], ink, piv); hb.position = Vector3(0, 0, -hd[1].z * 0.42)
		hands[hd[0]] = piv
	cyl(0.0012, 0.0012, g, Vector3(0, 0.0072, 0), w)
	var crown := cyl(0.0035, 0.004, g, Vector3(0, 0, -0.029), w); crown.rotation.x = PI / 2
	var bow := MeshInstance3D.new(); var bt := TorusMesh.new(); bt.inner_radius = 0.0045; bt.outer_radius = 0.0062; bow.mesh = bt; bow.material_override = g
	bow.position = Vector3(0, 0, -0.036); bow.rotation.z = PI / 2; w.add_child(bow)
	var lid := Node3D.new(); lid.position = Vector3(-0.026, 0.0045, 0); lid.rotation.z = deg_to_rad(-100); w.add_child(lid)
	var lidm := cyl(0.026, 0.0025, g, Vector3(0.026, 0, 0), lid)
	var glass := cyl(0.0225, 0.0008, mat("", true), Vector3(0, 0.0074, 0), w)
	# chain: links along a lazy curve from the bow toward the camera and off the table edge
	for i in 110:
		var u := i / 109.0
		var pp := Vector3(0.012 * sin(u * 5.0) + u * 0.05, 0.0, -0.04 - u * 0.0) .lerp(Vector3(-0.06 + 0.04 * sin(u * 3.0), 0, 0.26), u)
		var lk := MeshInstance3D.new(); var lt := TorusMesh.new(); lt.inner_radius = 0.0011; lt.outer_radius = 0.0019; lt.rings = 12; lt.ring_segments = 8; lk.mesh = lt
		lk.material_override = g; lk.position = Vector3(pp.x, 0.0018, pp.z) if i > 0 else Vector3(0, 0, -0.04)
		lk.rotation = Vector3(0, atan2(0.05 - 0.1, 0.3) + u * 1.5, PI / 2 if i % 2 == 0 else 0.0); w.add_child(lk)
	upd = func():
		var sec := floorf(t + 0.0)
		var frac := t - sec
		var tick := sec + (1.0 if frac > 0.08 else frac / 0.08) + (sin(clampf((frac - 0.08) / 0.12, 0.0, 1.0) * PI) * 0.12 if frac > 0.08 else 0.0)
		hands["s"].rotation.y = -(tick + 12.0) * TAU / 60.0
		hands["m"].rotation.y = -(17.0 + t / 60.0) * TAU / 60.0
		hands["h"].rotation.y = -(6.0 + 17.0 / 60.0) * TAU / 12.0
		var u := seg(0.0, 5.5)
		var p := Vector3(0.015, ty + lerpf(0.17, 0.105, u), lerpf(0.33, 0.2, u))
		cam.fov = lerpf(36.0, 31.0, u); cam.look_at_from_position(p, w.position + Vector3(0, 0, 0.03))
		ca.dof_blur_far_enabled = true; ca.dof_blur_far_distance = p.distance_to(w.position) + 0.05; ca.dof_blur_far_transition = 0.25
		ca.dof_blur_near_enabled = true; ca.dof_blur_near_distance = maxf(p.distance_to(w.position) - 0.08, 0.02); ca.dof_blur_near_transition = 0.06
