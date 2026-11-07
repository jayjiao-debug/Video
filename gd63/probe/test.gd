extends Node3D
## GPU probe scene (no Synty assets): boxes, a warm omni light with shadows, SDFGI, SSAO, volumetric fog, glow.

func _ready() -> void:
	var env := Environment.new()
	env.background_mode = Environment.BG_COLOR
	env.background_color = Color(0.05, 0.06, 0.1)
	env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	env.ambient_light_color = Color(0.2, 0.22, 0.3)
	env.sdfgi_enabled = true
	env.ssao_enabled = true
	env.volumetric_fog_enabled = true
	env.volumetric_fog_density = 0.03
	env.glow_enabled = true
	env.tonemap_mode = Environment.TONE_MAPPER_ACES
	var we := WorldEnvironment.new()
	we.environment = env
	add_child(we)
	var fl := MeshInstance3D.new()
	var pm := PlaneMesh.new()
	pm.size = Vector2(20, 20)
	fl.mesh = pm
	add_child(fl)
	for i in 5:
		var b := MeshInstance3D.new()
		b.mesh = BoxMesh.new()
		b.position = Vector3(i * 1.6 - 3.2, 0.5, 0)
		var m := StandardMaterial3D.new()
		m.albedo_color = Color.from_hsv(i / 5.0, 0.6, 0.9)
		b.material_override = m
		add_child(b)
	var l := OmniLight3D.new()
	l.position = Vector3(0, 2.5, 1.5)
	l.light_color = Color(1, 0.7, 0.4)
	l.light_energy = 4.0
	l.omni_range = 10.0
	l.shadow_enabled = true
	l.light_volumetric_fog_energy = 3.0
	add_child(l)
	var c := Camera3D.new()
	add_child(c)
	c.make_current()
	c.look_at_from_position(Vector3(0, 2.2, 6), Vector3(0, 0.5, 0))
	print("RENDERER ", RenderingServer.get_video_adapter_name(), " | ", RenderingServer.get_video_adapter_vendor(), " | ", RenderingServer.get_video_adapter_api_version())
