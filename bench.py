"""GPU benchmark for our usual pipeline (three.js page in headless Chrome) + one Blender Cycles still for comparison.
Assets come from the public asset-output branch (CC-BY / CC0, credits in out/endurance-0x/credits.json)."""
import modal, json, pathlib, subprocess, time

RAW = "https://raw.githubusercontent.com/jayjiao-debug/Video/asset-output/out"
ASSETS = [f"{RAW}/endurance-03/models/merchant_schooner.glb",
          f"{RAW}/endurance-01/polyhaven/belfast_sunset_puresky_2k.hdr",
          f"{RAW}/endurance-01/polyhaven/snow_02/textures/snow_02_diff_2k.jpg",
          f"{RAW}/endurance-01/polyhaven/snow_02/textures/snow_02_nor_gl_2k.jpg",
          f"{RAW}/endurance-01/polyhaven/snow_02/textures/snow_02_rough_2k.jpg"]
dl = " && ".join(f"curl -sSLO {u}" for u in ASSETS)

web = (modal.Image.from_registry("mcr.microsoft.com/playwright:v1.48.2-jammy", add_python="3.11")
       .run_commands("mkdir -p /app && cd /app && npm init -y >/dev/null && npm i three@0.169 playwright-core@1.48.2",
                     f"mkdir -p /app/assets && cd /app/assets && {dl}")
       .add_local_dir("web", "/app/src"))

blender = (modal.Image.debian_slim(python_version="3.11")
           .apt_install("curl", "libxi6", "libxxf86vm1", "libxfixes3", "libxrender1", "libgl1", "libxkbcommon0", "libsm6", "libegl1")
           .pip_install("bpy==4.2.0")
           .run_commands(f"mkdir -p /assets && cd /assets && {dl}"))

app = modal.App("juno-bench")

def _web(n, flagsets):
    subprocess.run("cp -r /app/src/* /app/ && ln -sfn /app/assets /app/assets", shell=True)
    res, imgs = [], {}
    for fs in flagsets:
        r = subprocess.run(["node", "bench.mjs", "/tmp/o", str(n), fs], cwd="/app", capture_output=True, text=True, timeout=1800)
        line = [l for l in r.stdout.splitlines() if l.startswith("RESULT ")]
        res.append(json.loads(line[0][7:]) if line else {"flagset": fs, "error": (r.stderr or r.stdout)[-600:]})
    for f in sorted(pathlib.Path("/tmp/o").glob("*.jpg"))[:: max(1, n // 3)]:
        imgs[f.name] = f.read_bytes()
    return res, imgs

@app.function(image=web, gpu="T4", timeout=3600)
def web_t4(n): return _web(n, ["vulkan", "egl", "angle_gl"])

@app.function(image=web, gpu="L4", timeout=3600)
def web_l4(n): return _web(n, ["vulkan", "egl", "angle_gl"])

@app.function(image=web, cpu=8, timeout=3600)
def web_cpu(n): return _web(n, ["cpu"])

CYCLES = r'''
import bpy, math, time
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
prefs = bpy.context.preferences.addons["cycles"].preferences
for kind in ("OPTIX", "CUDA"):
    try:
        prefs.compute_device_type = kind; prefs.get_devices()
        if any(d.type == kind for d in prefs.devices): break
    except Exception: pass
for d in prefs.devices: d.use = d.type != "CPU"
sc.render.engine = "CYCLES"; sc.cycles.device = "GPU"; sc.cycles.samples = 128; sc.cycles.use_denoising = True
sc.render.resolution_x, sc.render.resolution_y = 1280, 720
sc.view_settings.view_transform = "AgX"
bpy.ops.import_scene.gltf(filepath="/assets/merchant_schooner.glb")
ship = [o for o in sc.objects if o.type == "MESH"]
for o in ship:
    if o.name.startswith(("ID3inst", "cylinder.043", "ellipse.023", "ID0inst")): o.hide_render = True
root = [o for o in sc.objects if o.parent is None][0]
bpy.context.view_layer.update()
import mathutils
pts = [o.matrix_world @ mathutils.Vector(c) for o in ship if not o.hide_render for c in o.bound_box]
mn = mathutils.Vector([min(p[i] for p in pts) for i in range(3)]); mx = mathutils.Vector([max(p[i] for p in pts) for i in range(3)])
L = max(mx.x - mn.x, mx.y - mn.y); s = 52.0 / L
root.scale = (root.scale.x * s, root.scale.y * s, root.scale.z * s)
bpy.context.view_layer.update()
pts = [o.matrix_world @ mathutils.Vector(c) for o in ship if not o.hide_render for c in o.bound_box]
mn = mathutils.Vector([min(p[i] for p in pts) for i in range(3)]); mx = mathutils.Vector([max(p[i] for p in pts) for i in range(3)])
# beam to 7.6 m: squash the narrow horizontal axis
ax = 0 if (mx.x - mn.x) < (mx.y - mn.y) else 1
f = 7.6 / min(mx.x - mn.x, mx.y - mn.y)
sv = list(root.scale); sv[ax] *= f; root.scale = sv
bpy.context.view_layer.update()
pts = [o.matrix_world @ mathutils.Vector(c) for o in ship if not o.hide_render for c in o.bound_box]
mn = mathutils.Vector([min(p[i] for p in pts) for i in range(3)]); mx = mathutils.Vector([max(p[i] for p in pts) for i in range(3)])
root.location -= mathutils.Vector(((mn.x + mx.x) / 2, (mn.y + mx.y) / 2, mn.z + 0.42 * 8.5))
for o in ship:
    for m in o.data.materials:
        if m and m.use_nodes:
            b = m.node_tree.nodes.get("Principled BSDF")
            if b and o.name.startswith(("box_", "box.003", "ellipse_", "ellipse.021")):
                b.inputs["Base Color"].default_value = (0.03, 0.028, 0.026, 1); b.inputs["Roughness"].default_value = 0.8
                for l in list(b.inputs["Base Color"].links): m.node_tree.links.remove(l)
# snow ground
bpy.ops.mesh.primitive_plane_add(size=3000); g = bpy.context.object
mat = bpy.data.materials.new("snow"); mat.use_nodes = True; nt = mat.node_tree; bs = nt.nodes["Principled BSDF"]
tc = nt.nodes.new("ShaderNodeTexCoord"); mp = nt.nodes.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value = (250, 250, 1)
nt.links.new(tc.outputs["UV"], mp.inputs["Vector"])
def tex(path, cs):
    t = nt.nodes.new("ShaderNodeTexImage"); t.image = bpy.data.images.load(path); t.image.colorspace_settings.name = cs; nt.links.new(mp.outputs["Vector"], t.inputs["Vector"]); return t
nt.links.new(tex("/assets/snow_02_diff_2k.jpg", "sRGB").outputs["Color"], bs.inputs["Base Color"])
nt.links.new(tex("/assets/snow_02_rough_2k.jpg", "Non-Color").outputs["Color"], bs.inputs["Roughness"])
nm = nt.nodes.new("ShaderNodeNormalMap"); nt.links.new(tex("/assets/snow_02_nor_gl_2k.jpg", "Non-Color").outputs["Color"], nm.inputs["Color"]); nt.links.new(nm.outputs["Normal"], bs.inputs["Normal"])
bs.inputs["Subsurface Weight"].default_value = 0.15
g.data.materials.append(mat)
# world HDRI + low sun behind the ship
w = bpy.data.worlds.new("w"); sc.world = w; w.use_nodes = True; wn = w.node_tree
env = wn.nodes.new("ShaderNodeTexEnvironment"); env.image = bpy.data.images.load("/assets/belfast_sunset_puresky_2k.hdr")
wn.links.new(env.outputs["Color"], wn.nodes["Background"].inputs["Color"]); wn.nodes["Background"].inputs["Strength"].default_value = 0.8
bpy.ops.object.light_add(type="SUN"); sun = bpy.context.object; sun.data.energy = 3.0; sun.data.color = (1.0, 0.7, 0.45); sun.data.angle = math.radians(1.5)
sun.rotation_euler = (math.radians(84), 0, math.radians(200))
# camera: the 4 s frame of our test (high, three-quarter, backlit)
bpy.ops.object.camera_add(location=(95, 120, 34)); cam = bpy.context.object; sc.camera = cam; cam.data.lens = 70
tgt = bpy.data.objects.new("t", None); sc.collection.objects.link(tgt); tgt.location = (0, 0, 9)
c = cam.constraints.new("TRACK_TO"); c.target = tgt; c.track_axis = "TRACK_NEGATIVE_Z"; c.up_axis = "UP_Y"
sc.render.filepath = "/tmp/cycles.png"
t = time.time(); bpy.ops.render.render(write_still=True); print("CYCLES_SECONDS", round(time.time() - t, 1), "DEVICES", [d.name for d in prefs.devices if d.use])
'''

def _cycles():
    pathlib.Path("/tmp/c.py").write_text(CYCLES)
    t = time.time()
    r = subprocess.run(["python", "/tmp/c.py"], capture_output=True, text=True, timeout=1800)
    line = [l for l in r.stdout.splitlines() if "CYCLES_SECONDS" in l]
    img = pathlib.Path("/tmp/cycles.png").read_bytes() if pathlib.Path("/tmp/cycles.png").exists() else b""
    return {"line": line[0] if line else None, "wall": round(time.time() - t, 1), "err": None if line else (r.stderr or r.stdout)[-1500:]}, img

@app.function(image=blender, gpu="T4", timeout=3600)
def cyc_t4(): return _cycles()

@app.function(image=blender, gpu="L4", timeout=3600)
def cyc_l4(): return _cycles()

@app.local_entrypoint()
def main():
    out = pathlib.Path("out"); out.mkdir(exist_ok=True)
    N = 24
    calls = {"web_t4": web_t4.spawn(N), "web_l4": web_l4.spawn(N), "web_cpu8": web_cpu.spawn(N), "cyc_t4": cyc_t4.spawn(), "cyc_l4": cyc_l4.spawn()}
    summary = {}
    for k, c in calls.items():
        try:
            a, b = c.get()
        except Exception as e:
            summary[k] = {"error": repr(e)[:800]}; continue
        summary[k] = a
        if isinstance(b, dict):
            for name, data in b.items(): (out / f"{k}_{name}").write_bytes(data)
        elif b:
            (out / f"{k}.png").write_bytes(b)
    (out / "summary.json").write_text(json.dumps(summary, indent=1))
    print(json.dumps(summary, indent=1))
