extends "res://west.gd"
## The rest of 一块怀表 after the cold open: the poker night, the warning, the square, the trial, the legend, the archive,
## Deadwood. Shares west.gd's loaders, town, characters, watch and camera helpers. Times are local to each shot.

## Hermite through keys with tangents clamped to the segment length, so a far key can't fling the path or the gaze
func herm(a, b, c, d, u: float):
	var L: float = (c - b).length()
	var m1 = (c - a) * 0.5; var m2 = (d - b) * 0.5
	if m1.length() > L: m1 = m1.normalized() * L
	if m2.length() > L: m2 = m2.normalized() * L
	var u2 := u * u; var u3 := u2 * u
	return (2.0 * u3 - 3.0 * u2 + 1.0) * b + (u3 - 2.0 * u2 + u) * m1 + (-2.0 * u3 + 3.0 * u2) * c + (u3 - u2) * m2

func keyed(keys: Array, tt: float) -> Array:
	if tt <= keys[0][0]: return [keys[0][1], keys[0][2], keys[0][3]]
	if tt >= keys[-1][0]: return [keys[-1][1], keys[-1][2], keys[-1][3]]
	var i := 0
	while i < keys.size() - 2 and tt > keys[i + 1][0]: i += 1
	var u: float = (tt - keys[i][0]) / (keys[i + 1][0] - keys[i][0])
	var a: Array = keys[max(i - 1, 0)]; var b: Array = keys[i]; var c: Array = keys[i + 1]; var d: Array = keys[min(i + 2, keys.size() - 1)]
	return [herm(a[1], b[1], c[1], d[1], u), herm(a[2], b[2], c[2], d[2], u), lerpf(b[3], c[3], sm(u))]

# ================================================================ puppets: the idle runs under code-set poses
## Each frame: the idle is sampled at time t, then listed bones are re-aimed (skeleton-space directions) or nudged.
func puppet(model: String, pos: Vector3, ry: float, ph := 0.0) -> Dictionary:
	var ch := person(model, pos, ry, "Base_Masc", ph)
	var ap: AnimationPlayer = ch["ap"]; ap.callback_mode_process = AnimationMixer.ANIMATION_CALLBACK_MODE_PROCESS_MANUAL
	ch["ph"] = ph; ch["base"] = pos; ch["ry"] = ry; ch["drop"] = 0.0
	return ch

func bid(ch: Dictionary, n: String) -> int:
	return bone(ch["sk"], n)

func anim_at(ch: Dictionary) -> void:
	var ap: AnimationPlayer = ch["ap"]; var clip := ap.get_animation("idle")
	ap.seek(fmod(ch["ph"] + t, clip.length), true); ap.advance(0.0)
	var n: Node3D = ch["node"]; n.position = ch["base"] - Vector3(0, ch["drop"], 0); n.rotation.y = ch["ry"]

## turn bone b so its rest direction (toward child c) points along dir (skeleton space); returns the new global basis
func aim(ch: Dictionary, b: int, c: int, dir: Vector3, parent_g = null) -> Basis:
	var sk: Skeleton3D = ch["sk"]
	var d_rest := (sk.get_bone_global_rest(c).origin - sk.get_bone_global_rest(b).origin).normalized()
	var g := Basis(Quaternion(d_rest, dir.normalized())) * sk.get_bone_global_rest(b).basis
	var pb: Basis = parent_g if parent_g != null else sk.get_bone_global_pose(sk.get_bone_parent(b)).basis
	sk.set_bone_pose_rotation(b, (pb.orthonormalized().inverse() * g.orthonormalized()).get_rotation_quaternion())
	return g

func bend(ch: Dictionary, n: String, axis: Vector3, ang: float) -> void:   # rotate a bone about a skeleton-space axis, on top of the idle
	var sk: Skeleton3D = ch["sk"]; var b := bid(ch, n)
	var g := sk.get_bone_global_pose(b).basis; var pb := sk.get_bone_global_pose(sk.get_bone_parent(b)).basis
	var ng := Basis(Quaternion(axis.normalized(), ang)) * g
	sk.set_bone_pose_rotation(b, (pb.orthonormalized().inverse() * ng.orthonormalized()).get_rotation_quaternion())
	sk.force_update_all_bone_transforms()

func to_skel(ch: Dictionary, v: Vector3) -> Vector3:   # world direction → skeleton space
	return (ch["sk"].global_transform.basis.inverse() * v).normalized()

## seated: thighs forward, shins down; the body drops onto the chair
func sit(ch: Dictionary, spread := 0.12, shin_back := 0.15) -> void:
	ch["drop"] = 0.40
	for s in [["l", 1.0], ["r", -1.0]]:
		var th := bid(ch, "thigh_" + s[0]); var ca_ := bid(ch, "calf_" + s[0]); var ft := bid(ch, "foot_" + s[0])
		var g := aim(ch, th, ca_, Vector3(spread * s[1], -0.06, 1.0))
		aim(ch, ca_, ft, Vector3(0.02 * s[1], -1.0, -shin_back), g)

## two-bone arm IK: the hand reaches a world point; the elbow bends toward a world pole
func reach(ch: Dictionary, side: String, target: Vector3, pole: Vector3) -> void:
	var sk: Skeleton3D = ch["sk"]; var sx := sk.global_transform
	var ua := bid(ch, "upperarm_" + side); var la := bid(ch, "lowerarm_" + side); var hd := bid(ch, "hand_" + side)
	var S: Vector3 = sx * sk.get_bone_global_pose(ua).origin
	var a := sk.get_bone_global_rest(ua).origin.distance_to(sk.get_bone_global_rest(la).origin)
	var b := sk.get_bone_global_rest(la).origin.distance_to(sk.get_bone_global_rest(hd).origin) + 0.06
	var v := target - S; var d := clampf(v.length(), 0.08, a + b - 0.002); var dir := v.normalized()
	var ca_ := clampf((a * a + d * d - b * b) / (2.0 * a * d), -1.0, 1.0); var al := acos(ca_)
	var pv := (pole - S); var n := dir.cross(pv).normalized()
	if n.length() < 0.01: n = Vector3.UP
	var e_dir := dir.rotated(n, al)
	var E := S + e_dir * a
	var g := aim(ch, ua, la, to_skel(ch, E - S))
	var g2 := aim(ch, la, hd, to_skel(ch, target - E), g)
	ch["hand_" + side] = target; ch["hand_dir_" + side] = (target - E).normalized()

## a procedural walk in place (the caller moves the body): legs swing, knees fold on the swing, arms counter-swing
func walk_pose(ch: Dictionary, phase: float, amp := 1.0) -> void:
	for s in [["l", 1.0, 0.0], ["r", -1.0, PI]]:
		var ph: float = phase + s[2]
		var sw := sin(ph) * 0.42 * amp
		var th := bid(ch, "thigh_" + s[0]); var ca_ := bid(ch, "calf_" + s[0]); var ft := bid(ch, "foot_" + s[0])
		var g := aim(ch, th, ca_, Vector3(0.06 * s[1], -cos(sw), sin(sw)))
		var knee := maxf(0.0, sin(ph + 1.2)) * 0.9 * amp + 0.08
		aim(ch, ca_, ft, Vector3(0.0, -cos(sw - knee), sin(sw - knee)), g)
		var ua := bid(ch, "upperarm_" + s[0]); var la := bid(ch, "lowerarm_" + s[0]); var hd := bid(ch, "hand_" + s[0])
		var asw := -sin(ph) * 0.32 * amp
		var ga := aim(ch, ua, la, Vector3(0.17 * s[1], -cos(asw), sin(asw)))
		aim(ch, la, hd, Vector3(0.1 * s[1], -cos(asw + 0.35), sin(asw + 0.35)), ga)
	ch["drop"] = absf(cos(phase)) * -0.025 * amp + 0.02 * amp

## a prop carried in a hand: placed at the hand, pointing along the forearm
func carry(ch: Dictionary, side: String, prop: Node3D, fwd_off := 0.07, fix := Basis.IDENTITY) -> void:
	var sk: Skeleton3D = ch["sk"]; var hd := bid(ch, "hand_" + side)
	var p: Vector3 = sk.global_transform * sk.get_bone_global_pose(hd).origin
	var dir: Vector3 = ch.get("hand_dir_" + side, Vector3.DOWN)
	var upv := Vector3.UP if absf(dir.y) < 0.9 else Vector3(0, 0, 1)
	prop.global_transform = Transform3D(Basis.looking_at(dir, upv) * fix, p + dir * fwd_off)

# ================================================================ sets and light
func interior_env(bg: Color, amb: Color, amb_e: float, exposure := 1.0) -> void:
	env = Environment.new(); env.background_mode = Environment.BG_COLOR; env.background_color = bg
	env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR; env.ambient_light_color = amb; env.ambient_light_energy = amb_e
	env.tonemap_mode = Environment.TONE_MAPPER_ACES; env.tonemap_exposure = exposure; env.tonemap_white = 6.0
	env.ssao_enabled = true; env.ssao_radius = 0.8; env.ssao_intensity = 2.2; env.ssil_enabled = true
	env.glow_enabled = true; env.glow_intensity = 0.7; env.glow_strength = 1.1; env.glow_bloom = 0.05; env.glow_hdr_threshold = 1.0
	env.volumetric_fog_enabled = true; env.volumetric_fog_density = 0.012; env.volumetric_fog_albedo = Color(1.0, 0.85, 0.7); env.volumetric_fog_anisotropy = 0.5
	env.adjustment_enabled = true; env.adjustment_contrast = 1.12; env.adjustment_saturation = 1.06
	var we := WorldEnvironment.new(); we.environment = env
	ca = CameraAttributesPractical.new(); ca.dof_blur_amount = 0.2; we.camera_attributes = ca; add_child(we)

func lamp(pos: Vector3, col: Color, e: float, rng: float, shadow := true) -> OmniLight3D:
	var l := OmniLight3D.new(); l.position = pos; l.light_color = col; l.light_energy = e; l.omni_range = rng; l.shadow_enabled = shadow
	l.light_volumetric_fog_energy = 1.5; add_child(l); return l

func glow_ball(pos: Vector3, col: Color, r: float, e: float) -> MeshInstance3D:
	var o := MeshInstance3D.new(); var sp := SphereMesh.new(); sp.radius = r; sp.height = r * 2.0; o.mesh = sp
	var om := StandardMaterial3D.new(); om.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED; om.albedo_color = col; om.emission_enabled = true; om.emission = col; om.emission_energy_multiplier = e
	o.material_override = om; o.position = pos; add_child(o); return o

func night_town() -> DirectionalLight3D:
	var moon := town(Vector3(-0.35, 0.42, -0.6), 1.1, 0.004)
	moon.light_color = Color(0.55, 0.66, 1.0); moon.light_energy = 0.45; moon.light_volumetric_fog_energy = 0.6
	var sm: ShaderMaterial = env.sky.sky_material
	sm.set_shader_parameter("zen", Vector3(0.01, 0.015, 0.04)); sm.set_shader_parameter("mid", Vector3(0.03, 0.045, 0.09))
	sm.set_shader_parameter("hor", Vector3(0.08, 0.09, 0.16)); sm.set_shader_parameter("glow", Vector3(0.12, 0.16, 0.3))
	env.ambient_light_energy = 0.18; env.sdfgi_energy = 0.5
	env.fog_light_color = Color(0.12, 0.15, 0.26); env.volumetric_fog_albedo = Color(0.5, 0.58, 0.8)
	for c in get_children():
		if c is CPUParticles3D: c.visible = false
	return moon

## the gold watch (same build as the cold open), lying on a table, with a short coil of chain
func make_watch(pos: Vector3, ry: float, chain := 26) -> Dictionary:
	var w := Node3D.new(); w.position = pos; w.rotation.y = ry; add_child(w)
	var g := gold(); var dial := StandardMaterial3D.new(); dial.albedo_color = Color(0.8, 0.74, 0.62); dial.roughness = 0.45
	var ink := StandardMaterial3D.new(); ink.albedo_color = Color(0.05, 0.04, 0.03)
	cyl(0.026, 0.009, g, Vector3.ZERO, w); cyl(0.0228, 0.002, dial, Vector3(0, 0.0046, 0), w)
	var bez := MeshInstance3D.new(); var tor := TorusMesh.new(); tor.inner_radius = 0.0224; tor.outer_radius = 0.0272; tor.rings = 48; bez.mesh = tor; bez.material_override = g; bez.position = Vector3(0, 0.0048, 0); w.add_child(bez)
	for i in 12:
		var a := i * TAU / 12.0
		var tk := bar(Vector3(0.0009, 0.0004, 0.0032), ink, w); tk.position = Vector3(sin(a) * 0.0198, 0.0058, -cos(a) * 0.0198); tk.rotation.y = -a
	var hands := {}
	for hd in [["h", Vector3(0.0016, 0.0004, 0.010), 0.0060], ["m", Vector3(0.0011, 0.0004, 0.0155), 0.0064], ["s", Vector3(0.0005, 0.0004, 0.018), 0.0068]]:
		var piv := Node3D.new(); piv.position = Vector3(0, hd[2], 0); w.add_child(piv)
		var hb := bar(hd[1], ink, piv); hb.position = Vector3(0, 0, -hd[1].z * 0.42); hands[hd[0]] = piv
	var crown := cyl(0.0035, 0.004, g, Vector3(0, 0, -0.029), w); crown.rotation.x = PI / 2
	var bow := MeshInstance3D.new(); var bt := TorusMesh.new(); bt.inner_radius = 0.0045; bt.outer_radius = 0.0062; bow.mesh = bt; bow.material_override = g
	bow.position = Vector3(0, 0, -0.036); bow.rotation.z = PI / 2; w.add_child(bow)
	var links: Array = []
	for i in chain:
		var lk := MeshInstance3D.new(); var lt := TorusMesh.new(); lt.inner_radius = 0.0011; lt.outer_radius = 0.0019; lt.rings = 10; lt.ring_segments = 6; lk.mesh = lt
		lk.material_override = g; w.add_child(lk); links.append(lk)
	return {"node": w, "hands": hands, "links": links}

func tick_watch(wt: Dictionary) -> void:
	var sec := floorf(t); var frac := t - sec
	var tk := sec + (1.0 if frac > 0.08 else frac / 0.08)
	wt["hands"]["s"].rotation.y = -(tk + 12.0) * TAU / 60.0
	wt["hands"]["m"].rotation.y = -(17.0 + t / 60.0) * TAU / 60.0
	wt["hands"]["h"].rotation.y = -(6.0 + 17.0 / 60.0) * TAU / 12.0

## lay the chain links along a list of local points (watch space)
func lay_chain(wt: Dictionary, pts: Array) -> void:
	var links: Array = wt["links"]; var P := make_path(pts); var step: float = P["len"] / maxf(links.size(), 1)
	for i in links.size():
		var p := path_at(P, i * step); var q := path_at(P, minf(P["len"], i * step + 0.003))
		var tg := (q - p); var lk: MeshInstance3D = links[i]
		lk.position = p
		if tg.length() > 1e-5: lk.basis = Basis.looking_at(tg.normalized(), Vector3.UP if absf(tg.normalized().y) < 0.95 else Vector3.RIGHT) * Basis(Vector3(0, 0, 1), PI / 2 if i % 2 == 0 else 0.0)

func dof(far_d: float, far_tr: float, near_d := 0.0, near_tr := 0.3) -> void:
	ca.dof_blur_far_enabled = far_d > 0.0; ca.dof_blur_far_distance = maxf(far_d, 0.05); ca.dof_blur_far_transition = far_tr
	ca.dof_blur_near_enabled = near_d > 0.0; ca.dof_blur_near_distance = maxf(near_d, 0.02); ca.dof_blur_near_transition = near_tr

func floor_y(x: float, z: float, maxy := 1.5) -> float:
	return ground_y(x, z, maxy)

func stars(n := 420) -> void:
	var mm := MultiMesh.new(); mm.transform_format = MultiMesh.TRANSFORM_3D; mm.instance_count = n
	var sp := SphereMesh.new(); sp.radius = 0.9; sp.height = 1.8; sp.radial_segments = 6; sp.rings = 3; mm.mesh = sp
	var rng := RandomNumberGenerator.new(); rng.seed = 1865
	for i in n:
		var a := rng.randf() * TAU; var el := asin(rng.randf_range(0.08, 1.0))
		var d := Vector3(cos(el) * cos(a), sin(el), cos(el) * sin(a)) * 600.0
		mm.set_instance_transform(i, Transform3D(Basis().scaled(Vector3.ONE * rng.randf_range(0.4, 1.4)), d))
	var mi := MultiMeshInstance3D.new(); mi.multimesh = mm
	var m := StandardMaterial3D.new(); m.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED; m.albedo_color = Color(0.85, 0.9, 1.0); m.emission_enabled = true; m.emission = Color(0.85, 0.9, 1.0); m.emission_energy_multiplier = 3.0; m.disable_fog = true
	mi.material_override = m; mi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF; add_child(mi)

# ================================================================ B1 · night over Springfield, down to the hotel's lit window (6.3 s)
func build_night() -> void:
	night_town(); stars()
	for p in [Vector3(-5.2, 1.6, -36.6), Vector3(-5.2, 1.6, -41.4), Vector3(-5.2, 4.6, -39.0), Vector3(-15.0, 1.8, -13.0), Vector3(-12.0, 4.6, -15.0), Vector3(9.5, 1.6, -26.0), Vector3(9.0, 1.6, -14.0)]:
		lamp(p, Color(1.0, 0.62, 0.3), 3.2, 7.0, false)
	for p in [Vector3(-5.6, 2.6, -34.6), Vector3(-5.6, 2.6, -43.4), Vector3(4.9, 2.6, -21.0), Vector3(-6.0, 2.6, -24.0)]:
		lamp(p, Color(1.0, 0.66, 0.34), 1.6, 4.5, false); glow_ball(p, Color(1.0, 0.7, 0.4), 0.06, 8.0)
	var K := [
		[0.0, Vector3(7.0, 17.0, -8.0), Vector3(-3.0, 1.5, -38.0), 46.0],
		[2.6, Vector3(3.5, 7.5, -25.0), Vector3(-3.0, 2.0, -38.5), 40.0],
		[5.0, Vector3(1.2, 2.5, -35.6), Vector3(-3.0, 1.9, -38.5), 34.0],
		[6.4, Vector3(0.0, 2.2, -37.2), Vector3(-3.0, 1.85, -38.6), 28.0]]
	upd = func():
		var k := keyed(K, t); cam.fov = k[2]; cam.look_at_from_position(k[0], k[1])
		dof(k[0].distance_to(k[1]) + 2.0, 8.0)

# ================================================================ B2 · the poker night: one take round the table (40 s)
var R := Vector3.ZERO
func build_cardroom() -> void:
	interior_env(Color(0.015, 0.02, 0.04), Color(0.32, 0.24, 0.2), 0.22, 1.05)
	var room := piece("SM_Bld_Large_01", Vector3.ZERO, 0.0, 1.0)
	var fy := floor_y(0.0, -4.2)
	R = Vector3(0.0, fy, -4.2)
	var shut := MeshInstance3D.new(); var sq := QuadMesh.new(); sq.size = Vector2(12, 8); shut.mesh = sq   # close the open front with darkness
	var sm := StandardMaterial3D.new(); sm.albedo_color = Color(0.02, 0.02, 0.03); sm.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED; shut.material_override = sm
	shut.position = Vector3(0, fy + 3.0, 0.6); shut.rotation.y = PI; add_child(shut)
	var table := piece("SM_Prop_PokerTable_01", R, 0.0, 1.0)
	var tb := AABB(); var first := true
	for mi in table.find_children("*", "MeshInstance3D", true, false):
		var a: AABB = (mi as MeshInstance3D).global_transform * (mi as MeshInstance3D).get_aabb(); tb = a if first else tb.merge(a); first = false
	var top := tb.end.y
	piece("SM_Prop_Chair_01", R + Vector3(-0.85, 0, 0), PI / 2, 1.0); piece("SM_Prop_Chair_01", R + Vector3(0.85, 0, 0), -PI / 2, 1.0)
	piece("SM_Prop_Fireplace_01", Vector3(2.6, fy, -7.75), 0.0, 1.0)
	piece("SM_Prop_Piano_01", Vector3(-3.6, fy, -7.3), 0.0, 1.0); piece("SM_Prop_Piano_Seat_01", Vector3(-3.6, fy, -6.5), 0.0, 1.0)
	piece("SM_Prop_Shelf_01", Vector3(4.6, fy, -5.2), -PI / 2, 1.0)
	for b in [[Vector3(4.45, fy + 1.32, -5.5), "SM_Prop_Bottle_01"], [Vector3(4.45, fy + 1.32, -5.0), "SM_Prop_Bottle_03"], [Vector3(4.45, fy + 0.9, -5.3), "SM_Prop_Bottle_05"]]:
		piece(b[1], b[0], 0.0, 0.8)
	piece("SM_Prop_Photo_01", Vector3(-1.2, fy + 1.9, -7.9), 0.0, 1.0); piece("SM_Prop_Photo_02", Vector3(0.6, fy + 2.0, -7.9), 0.0, 1.0)
	piece("SM_Prop_Table_Small_01", Vector3(-3.8, fy, -3.0), 0.4, 1.0); piece("SM_Prop_Lantern_02", Vector3(-3.8, fy + 0.78, -3.0), 0.0, 0.8)
	piece("SM_Prop_Bottle_02", R + Vector3(-0.1, top - fy, -0.52), 0.0, 0.7); piece("SM_Prop_Cup_01", R + Vector3(-0.35, top - fy, -0.28), 0.0, 0.7)
	piece("SM_Prop_Cup_02", R + Vector3(0.36, top - fy, 0.3), 0.0, 0.7)
	for c in [["SM_Prop_Card_Pile_01", Vector3(0.1, 0, -0.12), 0.4], ["SM_Prop_Card_01", Vector3(-0.3, 0, 0.12), 0.9], ["SM_Prop_Card_02", Vector3(-0.26, 0.001, 0.16), 1.4],
			["SM_Prop_Card_03", Vector3(0.3, 0, -0.18), -0.6], ["SM_Prop_Poker_Chip_01", Vector3(-0.42, 0, 0.0), 0.0], ["SM_Prop_Poker_Chip_02", Vector3(-0.4, 0, -0.12), 0.0]]:
		piece(c[0], R + Vector3(c[1].x, top - fy + c[1].y, c[1].z), c[2], 0.6)
	var chips := piece("SM_Prop_Poker_Chip_03", R + Vector3(0.36, top - fy, 0.05), 0.0, 0.6)
	var hang := piece("SM_Prop_Lantern_01", R + Vector3(0, 1.72, 0), 0.0, 1.0)
	var key := lamp(R + Vector3(0, 1.62, 0), Color(1.0, 0.68, 0.36), 3.4, 5.5); key.shadow_blur = 1.5
	var flame := glow_ball(R + Vector3(0, 1.66, 0), Color(1.0, 0.72, 0.4), 0.035, 10.0)
	var fire := lamp(Vector3(2.6, fy + 0.5, -7.3), Color(1.0, 0.45, 0.15), 2.2, 5.0, false)
	var moonl := SpotLight3D.new(); moonl.position = Vector3(-5.5, fy + 2.4, -4.5); moonl.look_at_from_position(moonl.position, R + Vector3(0, 0.6, 0)); moonl.light_color = Color(0.45, 0.55, 1.0)
	moonl.light_energy = 1.2; moonl.spot_range = 9; moonl.spot_angle = 30; moonl.shadow_enabled = true; add_child(moonl)
	var hk := puppet("SK_Chr_Bandit_Male_01", R + Vector3(-0.8, 0, 0), PI / 2, 0.0)
	var tt := puppet("SK_Character_Badguy_01", R + Vector3(0.8, 0, 0), -PI / 2, 1.3)
	catchlights(hk); catchlights(tt)
	var guest := puppet("SK_Character_Business_Man_01", Vector3(3.1, fy, -6.6), -2.6, 0.5)
	var wt := make_watch(R + Vector3(-0.04, top - fy + 0.0045, 0.08), 0.6, 30)
	var wnode: Node3D = wt["node"]; var w_rest := wnode.global_transform
	var H_HEAD := R + Vector3(-0.8, 1.22, 0); var T_HEAD := R + Vector3(0.8, 1.22, 0)
	var WAT := wnode.global_position
	var K := [
		[0.0, R + Vector3(0.0, 1.9, 2.95), R + Vector3(0, 0.95, 0), 44.0],
		[3.0, R + Vector3(0.45, 1.62, 2.25), R + Vector3(0, 0.98, 0), 40.0],
		[4.8, R + Vector3(1.6, 1.38, 0.6), H_HEAD, 30.0],
		[6.4, R + Vector3(1.48, 1.33, 0.28), H_HEAD, 26.0],
		[8.2, R + Vector3(-1.52, 1.36, -0.5), T_HEAD, 28.0],
		[9.8, R + Vector3(-1.44, 1.32, -0.28), T_HEAD, 26.0],
		[12.4, R + Vector3(0.3, 2.25, -1.15), R + Vector3(0, 0.82, 0), 48.0],
		[14.8, R + Vector3(-0.05, 1.32, 1.0), R + Vector3(0.42, 0.9, 0.02), 32.0],
		[17.4, R + Vector3(-0.98, 1.3, 0.48), T_HEAD + Vector3(-0.2, -0.05, 0), 30.0],
		[19.2, R + Vector3(0.45, 1.3, 1.05), H_HEAD, 28.0],
		[21.0, R + Vector3(0.02, 1.02, 0.48), WAT, 24.0],
		[23.4, R + Vector3(0.0, 0.98, 0.36), WAT + Vector3(0.02, 0.0, 0), 22.0],
		[25.6, R + Vector3(-0.48, 1.2, 0.58), R + Vector3(0.62, 1.1, -0.02), 30.0],
		[29.5, R + Vector3(0.0, 1.2, 0.46), R + Vector3(0.42, 1.1, 0.06), 22.0],
		[33.5, R + Vector3(0.78, 1.24, 0.42), H_HEAD, 26.0],
		[38.4, R + Vector3(-0.05, 1.25, 0.36), H_HEAD, 26.0],
		[40.4, R + Vector3(-0.1, 1.3, 0.34), R + Vector3(0.0, 1.66, 0.0), 26.0]]
	upd = func():
		for ch in [hk, tt, guest]: anim_at(ch)
		# Tutt leans in on 「你欠我35块」, sits back after
		bend(tt, "spine_01", Vector3.RIGHT, 0.06 + 0.3 * seg(16.6, 17.2) * (1.0 - seg(20.5, 21.5)))
		bend(hk, "spine_01", Vector3.RIGHT, 0.08)
		bend(hk, "neck_01", Vector3.UP, 0.0)
		for ch in [hk, tt]: sit(ch)
		var tp: Vector3 = R + Vector3(0, top - fy, 0)
		# Hickok's hands rest on the felt; he never moves
		reach(hk, "l", tp + Vector3(-0.42, 0.03, -0.16), R + Vector3(-1.0, 0.7, -0.6))
		reach(hk, "r", tp + Vector3(-0.42, 0.03, 0.16), R + Vector3(-1.0, 0.7, 0.6))
		# Tutt: left hand pushes his chips back (N06), right hand takes the watch (N10), holds it, then dangles it (N12)
		var push := seg(14.3, 15.4) * (1.0 - seg(16.0, 16.8))
		chips.position = R + Vector3(0.36 - 0.2 * seg(14.3, 15.4), top - fy, 0.05)
		reach(tt, "l", tp + Vector3(0.42 - 0.16 * push, 0.04, 0.12 + 0.02 * push), R + Vector3(1.0, 0.7, 0.7))
		var rest_r := tp + Vector3(0.42, 0.03, -0.15)
		var grabbed := tp + Vector3(-0.02, 0.03, 0.08)
		var held := R + Vector3(0.55, 1.02, -0.02)
		var dang := R + Vector3(0.42, 1.36, 0.06)
		var hr: Vector3
		if t < 22.8: hr = rest_r
		elif t < 23.55: hr = rest_r.lerp(grabbed, sm((t - 22.8) / 0.75))
		elif t < 24.6: hr = grabbed.lerp(held, sm((t - 23.55) / 1.05))
		elif t < 27.4: hr = held
		else: hr = held.lerp(dang, seg(27.4, 28.4))
		reach(tt, "r", hr, R + Vector3(1.1, 0.6, -0.7))
		# the watch: on the table, in his hand, then hanging from its chain and swinging
		tick_watch(wt)
		var hand_p: Vector3 = tt["sk"].global_transform * tt["sk"].get_bone_global_pose(bid(tt, "hand_r")).origin
		if t < 23.5:
			wnode.global_transform = w_rest
			lay_chain(wt, [Vector3(0, 0.0, -0.04), Vector3(0.03, -0.003, -0.07), Vector3(0.07, -0.003, -0.05), Vector3(0.09, -0.003, 0.0), Vector3(0.07, -0.003, 0.04)])
		else:
			var n_w := Vector3(-1, 0, 0.25).normalized(); var up_w := Vector3.UP
			var bas := Basis(up_w.cross(n_w).normalized() * -1.0, n_w, -up_w).orthonormalized()
			var swing := 0.0; var drop_len := 0.05
			if t >= 27.4:
				var u := t - 27.4; drop_len = lerpf(0.05, 0.17, sm(u / 0.9))
				swing = 0.32 * sin(TAU * 0.62 * u) * exp(-u * 0.12) * sm(u / 0.6)
			var rot := Basis(n_w, swing)
			var wc: Vector3 = hand_p + rot * Vector3(0, -drop_len - 0.04, 0)
			if t < 27.4: wc = hand_p + Vector3(0.0, -0.03, 0.0) + (tt["hand_dir_r"] as Vector3) * 0.05
			wnode.global_transform = Transform3D(rot * bas, wc)
			var hl: Vector3 = wnode.global_transform.affine_inverse() * (hand_p + Vector3(0, -0.02, 0))
			lay_chain(wt, [Vector3(0, 0, -0.04), Vector3(0, 0, -0.04).lerp(hl, 0.5) + Vector3(0.004, 0, 0), hl])
		# the flame breathes
		key.light_energy = 3.4 + 0.25 * sin(t * 13.0) + 0.15 * sin(t * 31.0); fire.light_energy = 2.2 + 0.5 * sin(t * 9.0) * sin(t * 4.3)
		var k := keyed(K, t); cam.fov = k[2]; cam.look_at_from_position(k[0], k[1])
		var fd: float = k[0].distance_to(k[1])
		dof(fd + 0.08, clampf(fd * 0.35, 0.15, 2.0), (0.3 if t > 31.5 and t < 37.0 else 0.0), 0.25)

# ================================================================ the square (golden hour), Hickok north, Tutt south
var HP := Vector3.ZERO; var FP := Vector3.ZERO; var DN := Vector3.ZERO; var RT := Vector3.ZERO
func square_setup() -> void:
	town()
	HP = at_ground(-3.0, 6.0); FP = at_ground(6.5, -62.5)
	var dv := FP - HP; dv.y = 0; DN = dv.normalized(); RT = Vector3(-DN.z, 0, DN.x)

func face(a: Vector3, b: Vector3) -> float:
	return atan2(b.x - a.x, b.z - a.z)

func make_hat() -> Node3D:   # a dark felt hat for the roll (character hats are part of their meshes)
	var h := Node3D.new(); add_child(h)
	var m := StandardMaterial3D.new(); m.albedo_color = Color(0.16, 0.11, 0.08); m.roughness = 0.9
	var brim := MeshInstance3D.new(); var bc := CylinderMesh.new(); bc.top_radius = 0.2; bc.bottom_radius = 0.2; bc.height = 0.015; brim.mesh = bc; brim.material_override = m; h.add_child(brim)
	var crown := MeshInstance3D.new(); var cc := CylinderMesh.new(); cc.top_radius = 0.085; cc.bottom_radius = 0.1; cc.height = 0.13; crown.mesh = cc; crown.material_override = m; crown.position = Vector3(0, 0.07, 0); h.add_child(crown)
	return h

## walkers: [model, from, to, t0, speed]
func walkers_tick(ws: Array) -> void:
	for w in ws:
		var ch: Dictionary = w["ch"]; var a: Vector3 = w["from"]; var b: Vector3 = w["to"]
		var dist := a.distance_to(b); var dur: float = dist / w["v"]
		var u := clampf((t - w["t0"]) / dur, 0.0, 1.0)
		ch["base"] = a.lerp(b, u); ch["base"].y = w["y"]; ch["ry"] = face(a, b)
		anim_at(ch)
		if u > 0.0 and u < 1.0: walk_pose(ch, u * dist / 0.7 * PI)

# ================================================================ B3 · next day, 6 pm: the square clears; Hickok waits; Tutt walks in (9.4 s)
func build_square_a() -> void:
	square_setup()
	var hk := puppet("SK_Chr_Bandit_Male_01", HP, face(HP, FP), 0.0)
	var t_from := at_ground(8.9, -74.0)
	var tt := puppet("SK_Character_Badguy_01", t_from, face(t_from, FP), 0.7)
	var ws: Array = []
	var folk := [["SK_Character_Cowboy_01", Vector3(1.5, 0, -40), Vector3(6.5, 0, -42), 0.6], ["SK_Character_Woman_01", Vector3(-1.0, 0, -36), Vector3(-6.2, 0, -35), 0.3],
		["SK_Chr_GoldMiner_Male_01", Vector3(3.0, 0, -30), Vector3(6.4, 0, -27), 0.9], ["SK_Character_Business_Man_01", Vector3(-2.0, 0, -26), Vector3(-6.4, 0, -25.3), 0.5],
		["SK_Chr_Mexican_Male_01", Vector3(0.5, 0, -48), Vector3(5.6, 0, -46.5), 1.1], ["SK_Character_Cowgirl_01", Vector3(-1.5, 0, -45), Vector3(-6.0, 0, -43), 0.8],
		["SK_Chr_Salesman_Male_01", Vector3(2.0, 0, -19), Vector3(5.6, 0, -17.2), 0.4], ["SK_Chr_Traveller_Female_01", Vector3(-0.5, 0, -52), Vector3(-4.5, 0, -55), 1.4]]
	for f in folk:
		var a := at_ground(f[1].x, f[1].z); var b := at_ground(f[2].x, f[2].z)
		var ch := puppet(f[0], a, face(a, b), f[3])
		ws.append({"ch": ch, "from": a, "to": b, "t0": f[3], "v": 1.9, "y": (a.y + b.y) * 0.5})
	ws.append({"ch": tt, "from": t_from, "to": FP, "t0": 5.0, "v": 1.9, "y": FP.y})
	var sunp := HP + DN * -400.0 + Vector3(0, 60, 0)
	var c0 := Vector3(8.4, 0, -71.5); c0.y = at_ground(c0.x, c0.z).y + 2.6
	var K := [
		[0.0, c0 + Vector3(0, 0.6, 0), HP + Vector3(0, 9.0, 0), 34.0],
		[3.0, c0 + Vector3(0, 0.2, 0), HP + Vector3(0, 3.0, 0), 34.0],
		[5.4, c0 + DN * 0.4 - Vector3(0, 0.6, 0), HP + Vector3(0, 1.4, 0), 28.0],
		[9.4, c0 + DN * 1.4 - Vector3(0, 1.3, 0), HP + Vector3(0, 1.3, 0), 22.0]]
	upd = func():
		anim_at(hk)
		walkers_tick(ws)
		var k := keyed(K, t); cam.fov = k[2]; cam.look_at_from_position(k[0], k[1])
		var tdist: float = k[0].distance_to(tt["node"].global_position + Vector3(0, 1.2, 0))
		dof((tdist + 0.5) if t > 7.0 else 60.0, 30.0, 0.0)

# ================================================================ B4a · 「戴夫，别过来！」 Tutt fires and misses; Hickok braces on his arm and fires (10.2 s)
func build_square_b() -> void:
	square_setup()
	var hk := puppet("SK_Chr_Bandit_Male_01", HP, face(HP, FP), 0.0)
	var tt := puppet("SK_Character_Badguy_01", FP, face(FP, HP), 0.7)
	var trig := arm_rig(tt, HP + Vector3(1.2, 1.0, 0.0), [1.95, 2.25, 2.7, 3.0])
	var gun := fbx("SM_Wep_Revolver_01"); apply_west(gun, "SM_Wep_Revolver_01"); add_child(gun)
	var flash := lamp(Vector3.ZERO, Color(1.0, 0.78, 0.45), 0.0, 5.0); var flare := glow_ball(Vector3.ZERO, Color(1, 0.85, 0.55), 0.05, 40.0); flare.visible = false
	var smoke := CPUParticles3D.new(); smoke.amount = 70; smoke.lifetime = 2.2; smoke.one_shot = true; smoke.explosiveness = 0.9; smoke.emitting = false
	smoke.spread = 25; smoke.initial_velocity_min = 0.5; smoke.initial_velocity_max = 2.0; smoke.gravity = Vector3(0.3, 0.2, 0); smoke.damping_min = 1.5; smoke.damping_max = 3.0
	smoke.scale_amount_min = 0.2; smoke.scale_amount_max = 0.6
	var q := QuadMesh.new(); var qm := StandardMaterial3D.new(); qm.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED; qm.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	qm.billboard_mode = BaseMaterial3D.BILLBOARD_PARTICLES; qm.billboard_keep_scale = true; qm.albedo_texture = soft_dot(); qm.albedo_color = Color(0.9, 0.85, 0.78, 0.35); q.material = qm; smoke.mesh = q; add_child(smoke)
	var miss := CPUParticles3D.new(); miss.amount = 40; miss.lifetime = 1.4; miss.one_shot = true; miss.explosiveness = 1.0; miss.emitting = false
	miss.direction = Vector3(0, 1, 0); miss.spread = 35; miss.initial_velocity_min = 1.0; miss.initial_velocity_max = 3.0; miss.gravity = Vector3(0, -3.0, 0)
	miss.scale_amount_min = 0.1; miss.scale_amount_max = 0.3
	var q2 := QuadMesh.new(); var qm2 := qm.duplicate(); qm2.albedo_color = Color(0.75, 0.58, 0.42, 0.6); q2.material = qm2; miss.mesh = q2
	miss.position = HP + DN * 3.5 - RT * 0.8 + Vector3(0, 0.05, 0); add_child(miss)
	var fired := [false, false]
	var rim := lamp(HP + DN * 1.3 + Vector3(0, 1.5, 0), Color(1.0, 0.8, 0.62), 1.4, 3.0, false)
	var head := HP + Vector3(0, 1.62, 0)
	var K := [
		[0.0, HP + DN * 2.4 + RT * 0.9 + Vector3(0, 1.3, 0), head, 30.0],
		[1.7, HP + DN * 2.0 + RT * 1.1 + Vector3(0, 1.4, 0), head, 32.0],
		[3.4, HP - DN * 1.4 + RT * 0.55 + Vector3(0, 1.72, 0), FP + Vector3(0, 1.0, 0), 5.5],
		[5.4, HP - DN * 1.35 + RT * 0.5 + Vector3(0, 1.7, 0), FP + Vector3(0, 1.0, 0), 5.0],
		[7.4, HP + RT * 1.25 + DN * 1.05 + Vector3(0, 1.45, 0), HP + DN * 0.5 + Vector3(0, 1.38, 0), 32.0],
		[10.2, HP + RT * 0.95 + DN * 0.95 + Vector3(0, 1.42, 0), HP + DN * 0.55 + Vector3(0, 1.38, 0), 28.0]]
	upd = func():
		anim_at(hk); anim_at(tt)
		pose_arm(trig)
		# Hickok: gun hanging at his side, then raised and laid across his left forearm, aimed at Tutt; fires at 9.55
		var fwd := DN; var rt := RT
		var sh: Vector3 = HP + Vector3(0, 1.42, 0)
		var aimp := FP + Vector3(0, 1.15, 0)
		var adir := (aimp - (sh + fwd * 0.5)).normalized()
		var u := seg(5.9, 7.1)
		var lh_rest := HP + Vector3(0, 0.95, 0) - rt * 0.28 + fwd * 0.05
		var lh_brace := sh + fwd * 0.42 + rt * 0.02 - Vector3(0, 0.12, 0)
		reach(hk, "l", lh_rest.lerp(lh_brace, u), HP + Vector3(0, 0.9, 0) - rt * 0.9 - fwd * 0.2)
		var rh_rest := HP + Vector3(0, 0.92, 0) + rt * 0.3 + fwd * 0.08
		var rh_brace := lh_brace + fwd * 0.04 + Vector3(0, 0.05, 0) - rt * 0.02
		reach(hk, "r", rh_rest.lerp(rh_brace, u), HP + Vector3(0, 0.9, 0) + rt * 0.9 - fwd * 0.2)
		var sk: Skeleton3D = hk["sk"]
		var hp_: Vector3 = sk.global_transform * sk.get_bone_global_pose(bid(hk, "hand_r")).origin
		var gdir := Vector3(0.05, -1.0, 0.25).normalized().lerp(adir, u).normalized()
		var kick := 0.0
		if t > 9.55: kick = sin(clampf((t - 9.55) / 0.08, 0.0, 1.0) * PI * 0.5) * (1.0 - clampf((t - 9.63) / 0.4, 0.0, 1.0))
		gdir = (gdir + Vector3(0, 0.35 * kick, 0)).normalized()
		var org := hp_ + gdir * 0.06
		gun.global_transform = Transform3D(Basis.looking_at(gdir, Vector3.UP if absf(gdir.y) < 0.9 else rt) * GUN_FIX, org); gun.scale = Vector3.ONE * 1.35
		var muzzle := org + gdir * 0.3 + Vector3(0, 0.03, 0)
		var on := t >= 9.55 and t < 9.62
		flash.position = muzzle; flash.light_energy = 4.0 if on else 0.0; flare.position = muzzle; flare.visible = on
		if t >= 9.55 and not fired[0]: smoke.global_position = muzzle; smoke.direction = gdir; smoke.restart(); fired[0] = true
		if t >= 3.25 and not fired[1]: miss.restart(); fired[1] = true
		var k := keyed(K, t); cam.fov = k[2]; cam.look_at_from_position(k[0], k[1])
		if opts.has("wide"): cam.fov = 70.0; cam.look_at_from_position(k[0] + DN * 4.0 + Vector3(0, 1.5, 0), HP + Vector3(0, 1.0, 0))
		if opts.has("dbg"): print("CAM ", k[0], " look ", k[1], " fov ", k[2], " HP ", HP, " head ", hk["sk"].global_transform * hk["sk"].get_bone_global_pose(bid(hk, "head")).origin)
		var fd: float = k[0].distance_to(k[1])
		dof(fd + 0.3, clampf(fd * 0.3, 0.3, 30.0), (1.0 if t > 2.6 and t < 5.8 else 0.0), 0.5)

# ================================================================ B4b · 「兄弟们，我中枪了」 Tutt staggers; his hat rolls to the courthouse steps (5.2 s)
func build_square_c() -> void:
	square_setup()
	var tt := puppet("SK_Character_Badguy_01", FP, face(FP, HP), 0.7)
	var hat := make_hat()
	var steps := Vector3(5.0, 0, -60.0); steps.y = at_ground(steps.x, steps.z).y
	var smoke := dust(HP + DN * 3.0 + Vector3(0, 1.5, 0), Vector3(0.8, 0.4, 0.8), 40, Color(0.95, 0.9, 0.85, 0.25), 0.4, Vector3(0.25, 0.05, 0.0))
	var cpos := HP - DN * 0.8 + RT * 0.6 + Vector3(0, 1.62, 0)
	upd = func():
		anim_at(tt)
		# hand to the chest, a step back, the knees go
		var back := seg(0.3, 2.0)
		tt["base"] = FP + DN * 0.35 * back
		tt["node"].rotation.x = 0.0
		tt["drop"] = 0.75 * seg(2.0, 3.0)
		bend(tt, "spine_01", Vector3.RIGHT, -0.22 * seg(0.3, 0.9) + 0.7 * seg(2.0, 2.9))
		var sk: Skeleton3D = tt["sk"]
		var chest: Vector3 = sk.global_transform * sk.get_bone_global_pose(bid(tt, "spine_03")).origin
		var tf := (HP - FP).normalized()
		reach(tt, "l", chest + tf * 0.16 + Vector3(0, -0.05, 0), chest + tf * 0.3 - RT * 0.5 + Vector3(0, -0.4, 0))
		# the hat falls and rolls to the steps
		var hstart := FP + Vector3(0, 1.75, 0)
		var hu := seg(2.4, 4.6)
		var hp_: Vector3
		if t < 2.4: hp_ = sk.global_transform * sk.get_bone_global_pose(bid(tt, "head")).origin + Vector3(0, 0.16, 0); hat.visible = false
		else:
			hat.visible = true
			var g0 := FP + DN * 0.4 + Vector3(0, 0.2, 0)
			hp_ = g0.lerp(steps + Vector3(0, 0.2, 0), hu); hp_.y = lerpf(FP.y + 1.5, steps.y + 0.2, clampf((t - 2.4) / 0.45, 0.0, 1.0))
			hat.rotation = Vector3(PI / 2 * clampf((t - 2.4) / 0.4, 0.0, 1.0), face(FP, steps), -hu * TAU * 2.2)
			if hu >= 1.0: hat.rotation = Vector3(PI / 2 + 0.0, face(FP, steps), 0.0).lerp(Vector3(0, face(FP, steps), 0), seg(4.6, 5.0))
		hat.position = hp_
		var look := (FP + Vector3(0, 1.1, 0)).lerp(steps + Vector3(0, 0.3, 0), seg(2.6, 4.2))
		cam.fov = lerpf(5.2, 6.5, seg(2.6, 4.2)); cam.look_at_from_position(cpos, look)
		dof(cpos.distance_to(look), 12.0, 4.0, 2.0)

# ================================================================ own textures (generated: cards, page, covers, ledger, tag)
var own_cache := {}
func own(n: String) -> Texture2D:
	if own_cache.has(n): return own_cache[n]
	var img := Image.load_from_file(ProjectSettings.globalize_path("res://own/" + n + ".png")); img.generate_mipmaps()
	own_cache[n] = ImageTexture.create_from_image(img); return own_cache[n]

func slab(size: Vector3, front: Texture2D, back_col := Color(0.9, 0.88, 0.82), rough := 0.8, both := false) -> Node3D:   # a thin box with a picture on its +Y face
	var n := Node3D.new(); add_child(n)
	var bx := MeshInstance3D.new(); var bm := BoxMesh.new(); bm.size = size; bx.mesh = bm
	var m := StandardMaterial3D.new(); m.albedo_color = back_col; m.roughness = rough; bx.material_override = m; n.add_child(bx)
	if front:
		var f := MeshInstance3D.new(); var pm := PlaneMesh.new(); pm.size = Vector2(size.x, size.z); f.mesh = pm
		var fm := StandardMaterial3D.new(); fm.albedo_texture = front; fm.roughness = rough; f.material_override = fm; f.position = Vector3(0, size.y * 0.5 + 0.0005, 0); n.add_child(f)
		if both:
			var f2 := f.duplicate(); f2.position = Vector3(0, -size.y * 0.5 - 0.0005, 0); f2.rotation.z = PI; n.add_child(f2)
	return n

func bbox_of(n: Node) -> AABB:
	var bb := AABB(); var first := true
	for mi in n.find_children("*", "MeshInstance3D", true, false):
		var a: AABB = (mi as MeshInstance3D).global_transform * (mi as MeshInstance3D).get_aabb(); bb = a if first else bb.merge(a); first = false
	return bb

## seated listener: legs down, hands on the knees
func sit_listen(ch: Dictionary) -> void:
	sit(ch)
	var sk: Skeleton3D = ch["sk"]; var sx := sk.global_transform
	for s in ["l", "r"]:
		var knee: Vector3 = sx * sk.get_bone_global_pose(bid(ch, "calf_" + s)).origin
		var sh: Vector3 = sx * sk.get_bone_global_pose(bid(ch, "upperarm_" + s)).origin
		var out := (sh - (sx * sk.get_bone_global_pose(bid(ch, "spine_03")).origin)); out.y = 0
		reach(ch, s, knee + Vector3(0, 0.08, 0) - sx.basis.z.normalized() * 0.08, sh + out.normalized() * 0.4 + Vector3(0, -0.5, 0))

# ================================================================ B5 · the trial: a packed room, the evidence, the gavel, out into the light (13.5 s)
func build_trial() -> void:
	interior_env(Color(0.6, 0.58, 0.55), Color(0.62, 0.56, 0.5), 0.9, 1.55)
	var room := piece("SM_Bld_Church_01", Vector3.ZERO, 0.0, 1.0)
	var fy := floor_y(0.0, 0.0)
	var desk := piece("SM_Prop_Desk_01", Vector3(0, fy, -4.3), PI, 1.0)
	piece("SM_Prop_Chair_01", Vector3(0, fy, -5.0), 0.0, 1.0)
	var judge := puppet("SK_Character_Business_Man_01", Vector3(0, fy, -5.0), 0.0, 0.2)
	var pews: Array = []
	var models := ["SK_Character_Cowboy_01", "SK_Character_Woman_01", "SK_Chr_GoldMiner_Male_01", "SK_Chr_Thug_Male_01", "SK_Character_Cowgirl_01", "SK_Chr_Salesman_Male_01",
		"SK_Chr_Mexican_Male_02", "SK_Character_Gunman_01", "SK_Chr_Hunter_Male_01", "SK_Chr_Traveller_Female_01", "SK_Chr_Soldier_Male_01", "SK_Chr_GoldMiner_Male_02"]
	var crowd: Array = []
	var mi := 0
	for z in [-1.2, 0.2, 1.6, 3.0]:
		for x in [-1.75, 1.75]:
			piece("SM_Prop_Church_Pew_01", Vector3(x, fy, z), PI, 1.0)
			for dx in [-0.45, 0.4]:
				if (mi * 7) % 5 == 3: mi += 1; continue
				var ch := puppet(models[mi % models.size()], Vector3(x + dx, fy, z + 0.05), PI, mi * 0.37)
				crowd.append(ch); mi += 1
	var hk := puppet("SK_Chr_Bandit_Male_01", Vector3(-0.3, fy, -3.0), PI, 0.0)
	var etab := piece("SM_Prop_Table_Small_01", Vector3(1.5, fy, -3.4), 0.0, 1.0)
	var et := bbox_of(etab).end.y
	var rev := piece("SM_Wep_Revolver_02", Vector3(1.5, et + 0.01, -3.4), 0.6, 1.0); rev.rotation.z = PI / 2
	var tg := slab(Vector3(0.12, 0.002, 0.07), own("tag")); tg.position = Vector3(1.38, et + 0.002, -3.25); tg.rotation.y = -0.3
	var gavel := Node3D.new(); add_child(gavel)
	var wood := StandardMaterial3D.new(); wood.albedo_color = Color(0.32, 0.18, 0.1); wood.roughness = 0.6
	var ghd := cyl(0.035, 0.12, wood, Vector3.ZERO, gavel); ghd.rotation.z = PI / 2
	var ghl := cyl(0.011, 0.24, wood, Vector3(0, 0, 0.12), gavel); ghl.rotation.x = PI / 2
	var dt := bbox_of(desk).end.y
	var block := cyl(0.05, 0.02, wood, Vector3(0.25, dt + 0.01, -4.25), self)
	for p in [Vector3(-3.4, fy + 3.2, -2.0), Vector3(3.4, fy + 3.2, 0.5), Vector3(-3.4, fy + 3.2, 3.0)]:
		var sl := SpotLight3D.new(); sl.position = p + Vector3(signf(p.x) * 2.0, 1.5, 0); sl.look_at_from_position(sl.position, Vector3(0, fy + 0.8, p.z - 0.5))
		sl.light_color = Color(1.0, 0.86, 0.66); sl.light_energy = 6.0; sl.spot_range = 12; sl.spot_angle = 18; sl.shadow_enabled = true; sl.light_volumetric_fog_energy = 2.0; add_child(sl)
	var doorlight := lamp(Vector3(0, fy + 2.0, 5.2), Color(1.0, 0.92, 0.8), 0.0, 9.0, false)
	lamp(Vector3(0, fy + 2.6, -3.5), Color(1.0, 0.82, 0.62), 1.6, 6.0, false)
	for z in [-0.5, 2.3]: lamp(Vector3(0, fy + 2.8, z), Color(1.0, 0.86, 0.7), 2.2, 5.0, false)
	var K := [
		[0.0, Vector3(0.7, fy + 2.1, 4.6), Vector3(0, fy + 1.0, -3.5), 46.0],
		[2.6, Vector3(0.6, fy + 2.0, 1.2), Vector3(0, fy + 1.1, -4.0), 40.0],
		[3.4, Vector3(1.0, fy + 1.4, -2.2), Vector3(1.5, et, -3.4), 34.0],
		[5.5, Vector3(1.35, et + 0.35, -2.95), Vector3(1.5, et + 0.02, -3.4), 30.0],
		[6.4, Vector3(0.9, dt + 0.45, -3.4), Vector3(0.2, dt + 0.05, -4.25), 34.0],
		[8.8, Vector3(0.75, dt + 0.35, -3.55), Vector3(0.22, dt + 0.06, -4.25), 30.0],
		[9.6, Vector3(0.2, fy + 1.7, -4.4), Vector3(0, fy + 1.4, 2.0), 40.0],
		[13.5, Vector3(0.0, fy + 1.6, -2.2), Vector3(0, fy + 1.6, 5.5), 40.0]]
	upd = func():
		anim_at(judge); sit(judge)
		for ch in crowd:
			anim_at(ch); sit_listen(ch)
			bend(ch, "neck_01", Vector3.UP, 0.25 * sin(t * 0.7 + ch["ph"] * 3.0) * seg(9.0, 10.5))
		# the gavel: up, then down on the block at 8.0, and once more at 8.45
		var sk: Skeleton3D = judge["sk"]
		var up_ := Vector3(0.25, dt + 0.32, -4.3); var down := Vector3(0.25, dt + 0.07, -4.27)
		var g := up_
		if t > 7.3 and t < 8.0: g = up_.lerp(down, pow((t - 7.3) / 0.7, 3.0))
		elif t >= 8.0 and t < 8.25: g = down.lerp(up_, sm((t - 8.0) / 0.25) * 0.7)
		elif t >= 8.25 and t < 8.45: g = down.lerp(up_, 0.7).lerp(down, pow((t - 8.25) / 0.2, 2.0))
		elif t >= 8.45: g = down.lerp(up_, sm((t - 8.45) / 0.6) * 0.5)
		reach(judge, "r", g, Vector3(0.7, dt - 0.2, -4.6))
		var hp_: Vector3 = sk.global_transform * sk.get_bone_global_pose(bid(judge, "hand_r")).origin
		gavel.global_transform = Transform3D(Basis(Vector3.UP, PI / 2) * Basis(Vector3.RIGHT, -0.3), hp_ + Vector3(0, 0.0, 0.02))
		# Hickok stands before the bench, then walks out toward the door and the light
		if t < 9.4: hk["base"] = Vector3(-0.3, fy, -3.0); hk["ry"] = PI; anim_at(hk)
		else:
			var u := clampf((t - 9.4) / 4.2, 0.0, 1.0); var a := Vector3(-0.3, fy, -3.0); var b := Vector3(0.0, fy, 2.6)
			hk["base"] = a.lerp(b, u); hk["ry"] = face(a, b); anim_at(hk); walk_pose(hk, u * a.distance_to(b) / 0.7 * PI)
		doorlight.light_energy = 14.0 * seg(9.8, 13.3)
		env.tonemap_exposure = 1.55 + 2.4 * pow(seg(11.0, 13.5), 2.0)
		var k := keyed(K, t); cam.fov = k[2]; cam.look_at_from_position(k[0], k[1])
		var fd: float = k[0].distance_to(k[1]) if t < 9.4 else k[0].distance_to(hk["node"].global_position + Vector3(0, 1.2, 0))
		dof(fd + 0.1, clampf(fd * 0.3, 0.12, 3.0))

# ================================================================ B6a · the press: the legend goes to print (9.4 s)
func build_press() -> void:
	interior_env(Color(0.03, 0.025, 0.02), Color(0.45, 0.34, 0.26), 0.55, 1.15)
	var floor_m := StandardMaterial3D.new(); floor_m.albedo_texture = noise_tex(5, 0.04, false, Color(0.12, 0.08, 0.05), Color(0.22, 0.15, 0.1)); floor_m.uv1_scale = Vector3(4, 4, 4)
	var fl := MeshInstance3D.new(); var fpm := PlaneMesh.new(); fpm.size = Vector2(12, 12); fl.mesh = fpm; fl.material_override = floor_m; add_child(fl)
	var iron := StandardMaterial3D.new(); iron.albedo_color = Color(0.08, 0.08, 0.09); iron.metallic = 0.7; iron.roughness = 0.45
	var brass := gold()
	var press := Node3D.new(); add_child(press)
	for b in [[Vector3(1.3, 0.75, 0.8), Vector3(0, 0.375, 0)], [Vector3(0.14, 1.4, 0.7), Vector3(-0.58, 1.45, 0)], [Vector3(0.14, 1.4, 0.7), Vector3(0.58, 1.45, 0)], [Vector3(1.3, 0.2, 0.7), Vector3(0, 2.2, 0)]]:
		var m := bar(b[0], iron, press); m.position = b[1]
	var screw := cyl(0.05, 0.6, brass, Vector3(0, 1.85, 0), press)
	var platen := bar(Vector3(0.9, 0.09, 0.6), iron, press)
	var bedsheet := slab(Vector3(0.62, 0.002, 0.82), own("page")); bedsheet.position = Vector3(0, 0.76, 0)
	var wheel := MeshInstance3D.new(); var tor := TorusMesh.new(); tor.inner_radius = 0.28; tor.outer_radius = 0.33; wheel.mesh = tor; wheel.material_override = brass; wheel.position = Vector3(0.72, 1.3, 0); wheel.rotation.z = PI / 2; press.add_child(wheel)
	var sheets: Array = []
	for i in 40:
		var sh := slab(Vector3(0.62, 0.0015, 0.82), own("page")); sh.visible = false; sheets.append(sh)
	var key := SpotLight3D.new(); key.position = Vector3(-1.6, 3.2, 1.8); key.look_at_from_position(key.position, Vector3(0, 0.8, 0.4)); key.light_color = Color(1.0, 0.8, 0.55); key.light_energy = 9.0
	key.spot_range = 8; key.spot_angle = 34; key.shadow_enabled = true; key.light_volumetric_fog_energy = 2.0; add_child(key)
	lamp(Vector3(1.2, 1.4, 1.6), Color(1.0, 0.6, 0.3), 2.4, 4.0, false)
	lamp(Vector3(-0.9, 2.6, -1.2), Color(0.7, 0.75, 1.0), 4.5, 4.5, false)
	lamp(Vector3(-1.4, 1.2, 1.2), Color(1.0, 0.75, 0.5), 2.5, 3.5, false)
	lamp(Vector3(0.0, 1.2, 1.4), Color(1.0, 0.78, 0.55), 1.2, 3.0, false)
	iron.albedo_color = Color(0.2, 0.19, 0.2); iron.metallic = 0.6; iron.roughness = 0.35
	var cycle := func(tt: float) -> float:   # press strokes: slow, then faster and faster (the count runs to 100 in the edit)
		return tt / 0.9 if tt < 5.6 else 5.6 / 0.9 + (tt - 5.6) / 0.9 + pow(maxf(tt - 5.6, 0.0), 2.0) * 1.1
	var K := [
		[0.0, Vector3(2.0, 1.6, 3.0), Vector3(0, 1.2, 0), 42.0],
		[3.0, Vector3(0.7, 1.35, 1.7), Vector3(0, 0.8, 0.5), 36.0],
		[5.2, Vector3(0.05, 1.45, 1.25), Vector3(0, 0.78, 0.75), 34.0],
		[9.4, Vector3(-0.9, 1.7, 2.3), Vector3(0, 0.9, 0.6), 42.0]]
	upd = func():
		var c: float = cycle.call(t); var ph := fmod(c, 1.0)
		var py := 0.9 + 0.35 * (0.5 + 0.5 * cos(ph * TAU))
		platen.position = Vector3(0, py, 0); screw.position = Vector3(0, py + 0.55, 0); screw.rotation.y = c * TAU
		wheel.rotation.x = c * TAU * 0.5
		var n := int(c)
		for i in sheets.size():
			var s: Node3D = sheets[i]
			if i >= n: s.visible = false; continue
			s.visible = true
			var age := c - i - 0.55
			var u := clampf(age / 0.45, 0.0, 1.0)
			var p := Vector3(0, 0.765, 0).lerp(Vector3(0.05 * sin(i * 1.7), 0.02 + i * 0.002, 0.95), sm(u)); p.y += sin(u * PI) * 0.12
			s.position = p; s.rotation = Vector3(-sin(u * PI) * 0.4, 0.06 * sin(i * 2.3), 0)
		var k := keyed(K, t); cam.fov = k[2]; cam.look_at_from_position(k[0], k[1])
		var fd: float = k[0].distance_to(k[1]); dof(fd + 0.1, clampf(fd * 0.3, 0.2, 2.0))

# ================================================================ B6b · dime novels tumbling past (3.4 s)
func build_novels() -> void:
	interior_env(Color(0.02, 0.015, 0.01), Color(0.4, 0.3, 0.22), 0.3, 1.0)
	env.volumetric_fog_enabled = false
	var key := SpotLight3D.new(); key.position = Vector3(-1.2, 2.2, 2.4); key.look_at_from_position(key.position, Vector3(0, 0, 0)); key.light_color = Color(1.0, 0.82, 0.6); key.light_energy = 8.0; key.spot_range = 8; key.spot_angle = 40; add_child(key)
	lamp(Vector3(1.5, -0.5, 1.5), Color(1.0, 0.55, 0.25), 1.5, 5.0, false)
	var books: Array = []
	var rng := RandomNumberGenerator.new(); rng.seed = 7
	for i in 14:
		var b := slab(Vector3(0.16, 0.012, 0.24), own("cover%d" % (i % 6)), Color(0.85, 0.8, 0.7), 0.6, true)
		books.append([b, Vector3(rng.randf_range(-0.45, 0.45), rng.randf_range(0.25, 0.9) + i * 0.1, rng.randf_range(-0.45, 0.35)), Vector3(rng.randf_range(-2, 2), rng.randf_range(-2, 2), rng.randf_range(-2, 2)), rng.randf_range(0.0, TAU)])
	upd = func():
		for bk in books:
			var b: Node3D = bk[0]; var p0: Vector3 = bk[1]
			b.position = p0 + Vector3(sin(t * 1.3 + bk[3]) * 0.08, -t * 0.62, 0); b.rotation = (bk[2] as Vector3) * (t * 0.35) + Vector3(-1.1, 0, 0)
		cam.fov = 38.0; cam.look_at_from_position(Vector3(0, 0.2, 1.55), Vector3(0, 0.15 - t * 0.04, 0))
		if opts.has("dbg"): print("NOV ", books[0][0].global_position, " ", books[3][0].global_position, " vis ", books[0][0].visible, " cam ", cam.global_position)
		dof(1.55, 0.45, 0.9, 0.3)

# ================================================================ B6c / B9 · the square, wide: golden hour with the two men, or empty at dusk
func build_square_wide() -> void:
	square_setup()
	var dusk := opts.has("dusk")
	if dusk:
		var sm_: ShaderMaterial = env.sky.sky_material
		sm_.set_shader_parameter("zen", Vector3(0.05, 0.07, 0.18)); sm_.set_shader_parameter("mid", Vector3(0.22, 0.24, 0.38))
		sm_.set_shader_parameter("hor", Vector3(0.95, 0.5, 0.3)); sm_.set_shader_parameter("glow", Vector3(0.9, 0.35, 0.15))
		for c in get_children():
			if c is DirectionalLight3D: c.light_energy = 0.55; c.light_color = Color(1.0, 0.42, 0.25)
			if c is CPUParticles3D: c.visible = false
		env.ambient_light_energy = 0.2; env.tonemap_exposure = 0.6; env.sdfgi_energy = 0.4
		env.fog_light_color = Color(0.5, 0.32, 0.3)
		for p in [Vector3(-5.6, 2.6, -34.6), Vector3(4.9, 2.6, -21.0), Vector3(-6.0, 2.6, -24.0), Vector3(4.9, 2.6, -40.0)]:
			lamp(p, Color(1.0, 0.66, 0.34), 2.0, 5.0, false); glow_ball(p, Color(1.0, 0.7, 0.4), 0.06, 8.0)
	else:
		puppet("SK_Chr_Bandit_Male_01", HP, face(HP, FP), 0.0); puppet("SK_Character_Badguy_01", FP, face(FP, HP), 0.7)
	var mid := (HP + FP) * 0.5
	var p0 := mid + RT * 26.0 + Vector3(0, 30.0, 0) - DN * 6.0
	var p1 := mid + RT * 18.0 + Vector3(0, 24.0, 0) + DN * 4.0
	if dusk: p0 = HP + DN * 18.0 + Vector3(0, 2.2, 0) + RT * 1.0; p1 = HP + DN * 30.0 + Vector3(0, 1.8, 0) + RT * 0.6
	upd = func():
		for c in get_children():
			if c is Node3D and c.has_meta("pup"): pass
		var u := seg(0.0, 6.0)
		var p := p0.lerp(p1, u)
		var look := mid if not dusk else (FP + Vector3(0, 1.5, 0)).lerp(FP + Vector3(0, 1.2, 0), u)
		cam.fov = 44.0 if not dusk else 36.0; cam.look_at_from_position(p, look)
		dof(p.distance_to(look) + 30.0, 60.0)

# ================================================================ B7a · 2026: the archive (5.9 s)
func build_archive() -> void:
	interior_env(Color(0.05, 0.05, 0.06), Color(0.35, 0.33, 0.32), 0.3, 1.05)
	var room := piece("SM_Bld_Double_01", Vector3.ZERO, 0.0, 1.0)
	var fy := floor_y(0.0, -4.0)
	var shut := MeshInstance3D.new(); var sq := QuadMesh.new(); sq.size = Vector2(8, 8); shut.mesh = sq
	var sm := StandardMaterial3D.new(); sm.albedo_color = Color(0.03, 0.03, 0.035); sm.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED; shut.material_override = sm
	shut.position = Vector3(0, fy + 3.0, 0.6); shut.rotation.y = PI; add_child(shut)
	for z in [-7.4, -5.6]:
		piece("SM_Prop_Shelf_01", Vector3(-2.1, fy, z), PI / 2, 1.0); piece("SM_Prop_Shelf_01", Vector3(2.1, fy, z), -PI / 2, 1.0)
	for b in [[Vector3(-1.9, 0.0, -6.6), "SM_Prop_Crate_01", 0.6], [Vector3(1.8, 0.0, -6.4), "SM_Prop_Crate_02", 0.6], [Vector3(-1.6, 0.0, -4.8), "SM_Prop_WoodBox_01", 0.7],
			[Vector3(1.5, 0.0, -4.4), "SM_Prop_Stack_01", 0.7], [Vector3(-1.9, 1.0, -7.3), "SM_Prop_Stack_02", 0.5], [Vector3(1.9, 1.0, -5.5), "SM_Prop_Stack_03", 0.5], [Vector3(0.9, 0.0, -7.2), "SM_Prop_Suitcase_01", 0.8]]:
		piece(b[1], Vector3(b[0].x, fy + b[0].y, b[0].z), 0.3, b[2])
	var desk := piece("SM_Prop_Table_01", Vector3(0, fy, -4.0), 0.0, 1.0)
	var dt := bbox_of(desk).end.y
	var bookL := slab(Vector3(0.3, 0.03, 0.42), own("ledger"), Color(0.35, 0.18, 0.12)); bookL.position = Vector3(-0.155, dt + 0.016, -4.0); bookL.rotation.z = 0.05
	var bookR := slab(Vector3(0.3, 0.03, 0.42), own("ledger"), Color(0.35, 0.18, 0.12)); bookR.position = Vector3(0.155, dt + 0.016, -4.0); bookR.rotation = Vector3(0, PI, -0.05)
	piece("SM_Prop_Lantern_01", Vector3(0.45, dt, -4.25), 0.0, 0.7)
	lamp(Vector3(0.45, dt + 0.35, -4.25), Color(1.0, 0.75, 0.45), 1.6, 3.0)
	var beam := SpotLight3D.new(); beam.position = Vector3(-3.5, fy + 3.4, -3.0); beam.look_at_from_position(beam.position, Vector3(0, dt, -4.0)); beam.light_color = Color(0.85, 0.9, 1.0)
	beam.light_energy = 7.0; beam.spot_range = 9; beam.spot_angle = 14; beam.shadow_enabled = true; beam.light_volumetric_fog_energy = 4.0; add_child(beam)
	env.volumetric_fog_density = 0.03
	dust(Vector3(-1.0, dt + 0.6, -3.6), Vector3(1.4, 0.8, 0.8), 160, Color(1.0, 0.95, 0.85, 0.7), 0.008, Vector3(0.03, 0.01, 0.0))
	var K := [[0.0, Vector3(0.9, fy + 1.9, -1.6), Vector3(0, dt, -4.3), 40.0], [5.9, Vector3(0.05, dt + 0.62, -3.55), Vector3(0, dt, -4.0), 34.0]]
	upd = func():
		var k := keyed(K, t); cam.fov = k[2]; cam.look_at_from_position(k[0], k[1])
		var fd: float = k[0].distance_to(k[1]); dof(fd + 0.1, clampf(fd * 0.3, 0.1, 2.0))

# ================================================================ B7b · the map: the two marks, 69 m; then Hickok's mark slides closer (7.6 s)
func build_map() -> void:
	square_setup()
	for c in get_children():
		if c is CPUParticles3D: c.visible = false
	var mk := func(col: Color) -> MeshInstance3D:
		var m := MeshInstance3D.new(); var cy := CylinderMesh.new(); cy.top_radius = 1.4; cy.bottom_radius = 1.4; cy.height = 0.2; m.mesh = cy
		var mm := StandardMaterial3D.new(); mm.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED; mm.albedo_color = col; mm.emission_enabled = true; mm.emission = col; mm.emission_energy_multiplier = 3.0
		m.material_override = mm; add_child(m); return m
	var mh: MeshInstance3D = mk.call(Color(1.0, 0.85, 0.5)); var mt: MeshInstance3D = mk.call(Color(1.0, 0.45, 0.3))
	var lm := StandardMaterial3D.new(); lm.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED; lm.albedo_color = Color(1, 0.94, 0.8); lm.emission_enabled = true; lm.emission = Color(1, 0.9, 0.7); lm.emission_energy_multiplier = 2.0
	var line := MeshInstance3D.new(); var bx := BoxMesh.new(); bx.size = Vector3(0.5, 0.1, 1.0); line.mesh = bx; line.material_override = lm; add_child(line)
	var near_ := FP - DN * 40.0
	var mid := (HP + FP) * 0.5
	upd = func():
		var hpos := HP.lerp(near_, sm(clampf((t - 0.9) / 2.2, 0.0, 1.0)))
		mh.position = hpos + Vector3(0, 6.0, 0); mt.position = FP + Vector3(0, 6.0, 0)
		var a := hpos + Vector3(0, 6.0, 0); var b := FP + Vector3(0, 6.0, 0)
		line.position = (a + b) * 0.5; line.scale = Vector3(1, 1, a.distance_to(b)); line.rotation.y = atan2(DN.x, DN.z)
		cam.projection = Camera3D.PROJECTION_ORTHOGONAL; cam.size = lerpf(98.0, 92.0, seg(0.0, 7.6))
		cam.look_at_from_position(mid + Vector3(0, 120, 0), mid, -DN)
		ca.dof_blur_far_enabled = false; ca.dof_blur_near_enabled = false

# ================================================================ B8a · Deadwood, 1876: the saloon; Hickok's back to the door; a shadow (11.0 s)
func build_saloon() -> void:
	interior_env(Color(0.01, 0.012, 0.02), Color(0.3, 0.22, 0.18), 0.18, 1.0)
	var room := piece("SM_Bld_Saloon_01", Vector3.ZERO, 0.0, 1.0)
	var fy := floor_y(0.0, 0.0)
	var T0 := Vector3(-1.5, fy, -1.0)
	var table := piece("SM_Prop_PokerTable_01", T0, 0.0, 1.0)
	var top := bbox_of(table).end.y
	var hk := puppet("SK_Chr_Bandit_Male_01", T0 + Vector3(0, 0, 0.82), PI, 0.0)
	var p1 := puppet("SK_Chr_Captain_Male_01", T0 + Vector3(0.82, 0, 0), -PI / 2, 0.6)
	var p2 := puppet("SK_Chr_Salesman_Male_01", T0 + Vector3(0, 0, -0.82), 0.0, 1.1)
	var p3 := puppet("SK_Character_Gunman_01", T0 + Vector3(-0.82, 0, 0), PI / 2, 1.7)
	for c in [[Vector3(0, 0, 0.85), PI], [Vector3(0.85, 0, 0), -PI / 2], [Vector3(0, 0, -0.85), 0.0], [Vector3(-0.85, 0, 0), PI / 2]]: piece("SM_Prop_Chair_01", T0 + c[0], c[1], 1.0)
	for c in [["SM_Prop_Card_Pile_01", Vector3(0.0, 0, 0.0), 0.3], ["SM_Prop_Poker_Chip_01", Vector3(0.3, 0, 0.1), 0.0], ["SM_Prop_Poker_Chip_02", Vector3(-0.2, 0, -0.3), 0.0], ["SM_Prop_Bottle_04", Vector3(0.25, 0, -0.25), 0.0]]:
		piece(c[0], Vector3(T0.x + c[1].x, top, T0.z + c[1].z), c[2], 0.6)
	var hang := piece("SM_Prop_Lantern_01", T0 + Vector3(0, 1.75, 0), 0.0, 1.0)
	var key := lamp(T0 + Vector3(0, 1.62, 0), Color(1.0, 0.66, 0.34), 3.0, 5.0)
	glow_ball(T0 + Vector3(0, 1.66, 0), Color(1.0, 0.72, 0.4), 0.035, 10.0)
	for p in [Vector3(4.5, fy + 2.2, -5.0), Vector3(-5.5, fy + 2.2, 3.0), Vector3(3.0, fy + 2.2, 4.0)]: lamp(p, Color(1.0, 0.6, 0.3), 1.0, 5.0, false)
	var killer := puppet("SK_Chr_Thug_Male_02", T0 + Vector3(0.9, 0, 4.0), face(Vector3(0.9, 0, 4.0), Vector3(0.0, 0, 0.82)), 0.3)
	var door := SpotLight3D.new(); door.position = T0 + Vector3(1.4, 2.1, 6.5); door.look_at_from_position(door.position, T0 + Vector3(0, 0.7, 0.4)); door.light_color = Color(1.0, 0.86, 0.66)
	door.light_energy = 0.0; door.spot_range = 12; door.spot_angle = 22; door.shadow_enabled = true; door.light_volumetric_fog_energy = 3.0; add_child(door)
	var K := [
		[0.0, T0 + Vector3(-3.6, 3.2, -3.4), T0 + Vector3(0, 1.0, 0), 42.0],
		[4.0, T0 + Vector3(-2.4, 1.8, -1.6), T0 + Vector3(0, 1.1, 0.5), 38.0],
		[7.4, T0 + Vector3(0.35, 1.38, -1.1), T0 + Vector3(0.15, 1.25, 1.3), 34.0],
		[11.0, T0 + Vector3(0.3, 1.35, -0.85), T0 + Vector3(0.2, 1.3, 1.5), 30.0]]
	upd = func():
		for ch in [hk, p1, p2, p3]:
			anim_at(ch); sit(ch)
			var sk: Skeleton3D = ch["sk"]; var f: Vector3 = sk.global_transform.basis.z.normalized(); var rt := Vector3.UP.cross(f).normalized()
			var c: Vector3 = ch["base"] + f * 0.42; c.y = top + 0.03
			reach(ch, "l", c + rt * 0.16, ch["base"] + Vector3(0, 1.0, 0) + rt * 0.7 - f * 0.4)
			reach(ch, "r", c - rt * 0.16, ch["base"] + Vector3(0, 1.0, 0) - rt * 0.7 - f * 0.4)
		killer["base"] = T0 + Vector3(0.9, 0, 4.0).lerp(Vector3(0.45, 0, 2.2), seg(7.6, 9.6)); anim_at(killer)
		if t > 7.6 and t < 9.6: walk_pose(killer, (t - 7.6) * 4.0, 0.6)
		door.light_energy = 18.0 * seg(7.4, 8.4)
		key.light_energy = 3.0 + 0.2 * sin(t * 12.0)
		var k := keyed(K, t); cam.fov = k[2]; cam.look_at_from_position(k[0], k[1])
		var fd: float = k[0].distance_to(k[1]); dof(fd + 0.2, clampf(fd * 0.3, 0.2, 2.0))

# ================================================================ B8b · the dead man's hand: five cards fall face up; the lamp goes out (14.1 s)
func build_cards() -> void:
	interior_env(Color(0.0, 0.0, 0.0), Color(0.3, 0.22, 0.18), 0.1, 1.0)
	var table := piece("SM_Prop_PokerTable_01", Vector3.ZERO, 0.0, 1.0)
	var top := bbox_of(table).end.y
	var key := SpotLight3D.new(); key.position = Vector3(0.1, top + 1.6, 0.2); key.look_at_from_position(key.position, Vector3(0, top, 0)); key.light_color = Color(1.0, 0.72, 0.4)
	key.light_energy = 2.6; key.spot_range = 4; key.spot_angle = 30; key.shadow_enabled = true; add_child(key)
	var faces := ["card_as", "card_ac", "card_8s", "card_8c", "card_back"]
	var cards: Array = []
	var land := [Vector3(-0.15, 0, 0.02), Vector3(-0.075, 0, -0.01), Vector3(0.0, 0, 0.015), Vector3(0.075, 0, -0.005), Vector3(0.15, 0, 0.02)]
	for i in 5:
		var c := slab(Vector3(0.063, 0.0012, 0.088), own(faces[i]), Color(0.95, 0.93, 0.88), 0.5)
		var bk := MeshInstance3D.new(); var pm := PlaneMesh.new(); pm.size = Vector2(0.063, 0.088); bk.mesh = pm
		var bm := StandardMaterial3D.new(); bm.albedo_texture = own("card_back"); bk.material_override = bm; bk.position = Vector3(0, -0.0007, 0); bk.rotation.z = PI; c.add_child(bk)
		cards.append(c)
	upd = func():
		for i in 5:
			var c: Node3D = cards[i]
			var t0 := 0.9 + i * 0.32
			var u := clampf((t - t0) / 0.9, 0.0, 1.0)
			var p: Vector3 = land[i] + Vector3(0, top + 0.001 + i * 0.0003, 0)
			var flip := (1.0 - sm(u)) * PI * (1.0 if i < 4 else 2.0)
			c.position = p + Vector3(0.02 * (1.0 - u), 0.25 * pow(1.0 - u, 2.0), -0.05 * (1.0 - u))
			c.rotation = Vector3(flip, -0.12 + i * 0.06 + (1.0 - u) * 0.6, 0.0)
			c.visible = t >= t0 - 0.05
		key.light_energy = 2.6 * (1.0 - seg(10.5, 13.6)) * (1.0 + 0.04 * sin(t * 15.0))
		var u2 := seg(7.4, 14.1)
		var p := Vector3(0.0, top + 0.42, 0.18).lerp(Vector3(0.0, top + 0.16, 0.04), u2)
		cam.fov = 36.0; cam.look_at_from_position(p, Vector3(0, top, -0.01), Vector3(0, 0, -1).lerp(Vector3.UP, 0.25).normalized())
		dof(p.distance_to(Vector3(0, top, 0)) + 0.03, 0.08)

# ---------------------------------------------------------------- load log (to pack only the files these shots use)
func fbx(p: String, dir := "fbx/") -> Node3D:
	if opts.has("logload"): print("LOAD ", dir, p)
	return super(p, dir)
func tex(n: String) -> Texture2D:
	if opts.has("logload"): print("TEX ", n)
	return super(n)
