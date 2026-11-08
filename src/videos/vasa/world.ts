// Stockholm harbour 1628 as one three.js scene: sky, water, quays, town, the Vasa rolling on its pivot, the king's
// empty chair, smoke, clouds and the cast. update(id, f, camera) poses everything for shot `id` at frame f (pure function of id + f).
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { staticFile } from "remotion";
import { Batch, boxGeo, V, lam, quad, buildTown, Kit, Ray, kitClone } from "./build";
import { beam, bed, ctex, stoneHD, cobbleHD, grassHD, waterNear, waterFar, cloudHD } from "./paint";
import { Pen } from "./toon";
import { LIGHTS, LOOK, LightPreset } from "./lights";
import { TONE, CHAR, LFB, twoTone, untone } from "./shade";
import { NOINK } from "./ink";
import { Pool, Actor, Fx, stage } from "./cast";
import { Ship } from "./ship";
import { D0, SHOTS, camAt, V3, FOREGROUND, ShotDef, ZS, ROLL_Y, tv, shipToWorld, poseAt, storyT, GUST1, GUST2, spl, clamp01, s1Pose, SALUTE_DT, halfW } from "./story";
import { buildHall, buildTable, Toy, TOY, TOY_FALL, toyLandT } from "./sets";

// ---------------- assets ----------------
const KENNEY = ["tree_oak", "tree_default", "tree_detailed", "tree_fat", "tree_cone", "tree-high-round", "tree", "plant_bushLarge", "plant_bushDetailed",
  "plant_bush", "hedge", "flower_redA", "flower_yellowA", "flower_purpleA", "grass_large", "grass", "lily_large", "lantern", "cart", "stall-red",
  "stall-green", "stall-bench", "banner-red", "banner-green", "windmill", "canoe"];
let kitP: Promise<Kit> | null = null;
export const loadKit = () => {
  if (!kitP) {
    const loader = new GLTFLoader();
    kitP = Promise.all(KENNEY.map((n) => loader.loadAsync(staticFile(`bridge/kenney/${n}.glb`)).then((g) => [n, g.scene] as const).catch(() => [n, null] as const)))
      .then((list) => Object.fromEntries(list.filter((e) => e[1]).map(([n, s]) => [n, s!])) as Kit);
  }
  return kitP;
};

const beamBetween = (a: THREE.Vector3, b: THREE.Vector3, th: number) => {
  const g = new THREE.BoxGeometry(th, a.distanceTo(b), th);
  const m = new THREE.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5),
    new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), b.clone().sub(a).normalize()), V(1, 1, 1));
  return g.applyMatrix4(m);
};
/** sun disc (solid, soft rim) and the flat golden halo (lighting.md 6 / depth.md 6.4: r50 13-26 % of the frame width) */
const discTex = () => ctex("sunDisc", 128, 128, (g) => {
  const gr = g.createRadialGradient(64, 64, 58, 64, 64, 64); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
});
const haloTex = () => ctex("sunHalo", 256, 256, (g) => {
  const im = g.createImageData(256, 256);
  for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
    const u = Math.hypot(x - 127.5, y - 127.5) / 128;
    const a = (0.55 * Math.exp(-((u / 0.25) ** 2)) + 0.35 * Math.exp(-((u / 0.6) ** 2))) * (1 - Math.min(1, Math.max(0, (u - 0.8) / 0.2)));
    const i = (y * 256 + x) * 4; im.data[i] = im.data[i + 1] = im.data[i + 2] = 255; im.data[i + 3] = Math.round(255 * Math.min(1, a));
  }
  g.putImageData(im, 0, 0);
});
/** per-shot sun override (lighting.md 9.1 notes: front-light the town wide); story.ts ShotDef sunAz/sunEl win if present */
// shot 12: the park is ringed by trees and houses, so a low sun ahead-right puts the whole lawn in their shadow
const SUN_SHOT: Record<string, { az?: number; el?: number }> = { s1_salute: { az: 150, el: 32 }, s1_echo: { az: 150, el: 32 }, s3_c: { az: 110 }, s1_officers: { az: 110 },
  s2_king: { az: 150, el: 35 }, s5_toy: { az: 130, el: 34 }, s5_cut: { az: 140, el: 45 }, s5_flip: { az: 130, el: 34 },
  s6_letter: { az: 150, el: 40 }, s6_builder: { az: 145, el: 36 }, s6_chair: { az: 140, el: 35 }, s6_up: { az: 155, el: 38 }, s6_promo: { az: 160, el: 36 } };
const smokeTex = () => ctex("smoke", 256, 256, (g) => {
  const p = new Pen(g);
  for (const [x, y, r, c] of [[90, 150, 60, "#8f8d96"], [150, 120, 70, "#a3a1aa"], [170, 165, 55, "#8f8d96"], [120, 100, 50, "#b4b2ba"]] as const) p.ell(x, y, r, r * 0.85, c, 0);
});

/** every lens position of the film looking at its subject: centre, sides and top of frame (houses there are left out) */
const sightLines = (): Ray[] => {
  const out: Ray[] = [];
  for (const s of SHOTS) if (s.set === "harbour") for (let f = s.a - 8; f < s.b + 8; f += 2) {
    const c = worldCam(s.id, Math.max(0, f)), o = V(...c.pos), look = V(...c.look);
    const fw = look.clone().sub(o), len = fw.length();
    fw.normalize();
    const rt = fw.clone().cross(V(0, 1, 0)).normalize(), up = rt.clone().cross(fw);
    const ty = Math.tan((c.fov * Math.PI) / 360), tx = ty * (9 / 16);
    for (const [sx, sy] of [[0, 0], [-0.6, 0], [0.6, 0], [0, 0.6], [0, -0.4]])
      out.push({ o, d: fw.clone().addScaledVector(rt, sx * tx).addScaledVector(up, sy * ty), len, core: sx === 0 && sy === 0 });
  }
  return out;
};

type Mats = Record<string, THREE.Material>;

/** camera in world space for shot id at frame f (ship-local shots ride the roll) */
export const worldCam = (id: number, f: number) => {
  const c = camAt(id, f), s = SHOTS[id - 1];
  if (!s.local) return c;
  const P = poseAt(s, tv(f));
  return { ...c, pos: shipToWorld(c.pos, P), look: shipToWorld(c.look, P), roll: c.roll - P.heel };
};
/** the empty chair on the quay (the king is away) */
export const CHAIR: V3 = [-7.2, D0, -32.7];

export class World {
  root = new THREE.Group();
  harbour = new THREE.Group();
  hall: THREE.Group; table: THREE.Group; toy: Toy;
  ship = new Ship();
  private pool = new Pool();
  private actors: Actor[] = [];
  private fxs: Fx[] = [];
  private hemi: THREE.HemisphereLight; private sun: THREE.DirectionalLight; private fill: THREE.DirectionalLight;
  private sky: THREE.Mesh; private skyMat: THREE.ShaderMaterial;
  private fog = new THREE.Fog("#bccbec", 25, 420);
  private WU: Record<string, THREE.IUniform>;
  private sunDisc: THREE.Sprite; private sunHalo: THREE.Sprite;
  private sunCache = new Map<number, THREE.Vector3>();
  private cloudMaps: Record<"day" | "golden", THREE.Texture[]>;
  private fgs: { o: THREE.Object3D; a: number; b: number }[] = [];
  private smoke: { m: THREE.Mesh; mat: THREE.MeshLambertMaterial; top: V3; k: number }[] = [];
  /** S1 gun salute: per lower river-side port a muzzle flash and three smoke puffs (world space once fired) */
  private salute: { px: number; rank: number; flash: THREE.Mesh; puffs: { m: THREE.Mesh; mat: THREE.MeshBasicMaterial }[] }[] = [];
  private clouds: THREE.Mesh[] = [];
  private chair = new THREE.Group();
  private shipPivot = new THREE.Group();
  private frustum = new THREE.Frustum();
  private m4 = new THREE.Matrix4(); private v = new THREE.Vector3(); private sph = new THREE.Sphere();

  constructor(kit: Kit) {
    const R = this.harbour, M: Mats = {};
    this.root.add(this.harbour);
    this.hall = buildHall(); this.root.add(this.hall);
    const tb = buildTable(); this.table = tb.group; this.toy = tb.toy; this.root.add(this.table);
    this.skyMat = new THREE.ShaderMaterial({
      uniforms: { c0: { value: new THREE.Color() }, c1: { value: new THREE.Color() }, c2: { value: new THREE.Color() },
        c3: { value: new THREE.Color() }, c4: { value: new THREE.Color() }, e: { value: new THREE.Vector4() } },
      vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `uniform vec3 c0, c1, c2, c3, c4; uniform vec4 e; varying vec3 vP;
        void main(){ float el = asin(clamp(normalize(vP).y, -1.0, 1.0));
          vec3 c = mix(c0, c1, smoothstep(0.0, e.x, el));
          c = mix(c, c2, smoothstep(e.x, e.y, el));
          c = mix(c, c3, smoothstep(e.y, e.z, el));
          c = mix(c, c4, smoothstep(e.z, e.w, el));
          gl_FragColor = vec4(c, 1.0); }`,
      side: THREE.BackSide, depthWrite: false, fog: false,
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(1100, 48, 24), this.skyMat);
    this.sky.renderOrder = -1; this.sky.frustumCulled = false; this.sky.layers.set(NOINK);
    R.add(this.sky);
    this.sunDisc = new THREE.Sprite(new THREE.SpriteMaterial({ map: discTex(), color: new THREE.Color(6.0, 4.4, 2.4), fog: false, depthWrite: false }));
    this.sunHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex(), color: new THREE.Color(1, 1, 1), fog: false, depthWrite: false, depthTest: true,
      transparent: true, blending: THREE.AdditiveBlending }));
    this.sunDisc.renderOrder = -0.5; this.sunHalo.renderOrder = 5;
    for (const m of [this.sunDisc, this.sunHalo]) { m.frustumCulled = false; m.layers.set(NOINK); R.add(m); }
    this.hemi = new THREE.HemisphereLight("#cfe6ff", "#6c5c8c", 1.1);
    this.sun = new THREE.DirectionalLight("#fff0d6", 2.6);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(4096, 4096);
    this.fill = new THREE.DirectionalLight("#9fb8ff", 0.35);
    this.root.add(this.hemi, this.sun, this.sun.target, this.fill, this.fill.target);
    this.cloudMaps = { day: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.day.cloud)), golden: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.golden.cloud)) };
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + 0.3, d = 620 + (i % 3) * 60;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: this.cloudMaps.day[i % 4], color: new THREE.Color(1.1, 1.1, 1.1), transparent: true, depthWrite: false, fog: false }));
      const w = 130 + (i % 4) * 30;
      m.position.set(Math.cos(a) * d, 120 + (i % 4) * 38, Math.sin(a) * d); m.scale.set(w, w / 2, 1);
      m.layers.set(NOINK);
      this.clouds.push(m); R.add(m);
    }

    // ---- ground, harbour, quays (static batch) ----
    const b = new Batch();
    M.grass = lam("grassHD", () => ({ map: grassHD() }));
    M.cobble = lam("cobbleHD", () => ({ map: cobbleHD() }));
    M.wall = lam("wallHD", () => ({ map: stoneHD("wallHD", ["#c9bcaa", "#bfb19f", "#d1c5b4", "#b8aa97"], "#958776") }));
    M.cope = lam("copeHD", () => ({ map: stoneHD("copeHD", ["#e6dccd", "#ddd3c3", "#ece4d6", "#d6cbba"], "#aea293") }));
    M.wood = lam("wood", () => ({ map: beam() }));
    M.bed = lam("bed", () => ({ map: bed() }));
    for (const s of [-1, 1]) {
      const zn = s * 30, zf = s * 900;
      b.add(s < 0 ? quadUp(-900, 900, zf, zn, 450, 217.5) : quadUp(-900, 900, zn, zf, 450, 217.5), M.grass);
      // v3: the cobbles stop at the coping instead of running 0.6 m under it, and the coping's top is flush with them
      // (v2's coping stood 8 mm proud: a sub-pixel step whose crease line flickered along the quay edge)
      b.add(s < 0 ? quadUp(-160, 160, -36.5, -30.6, 80, 1.475, 0.012) : quadUp(-160, 160, 30.6, 36.5, 80, 1.475, 0.012), M.cobble);
      b.add(s < 0 ? quadUp(-6, 6, -170, -36.5, 3, 33.375, 0.012) : quadUp(-6, 6, 36.5, 170, 3, 33.375, 0.012), M.cobble);
      b.add(s < 0 ? wallQuad(-900, 900, -30, 1) : wallQuad(900, -900, 30, -1), M.wall);
      // the coping: only its top and its river face (the ink pre-pass draws both sides of every face, and a box's back
      // face, flush with the cobbles' edge, read there as a dotted crease line)
      {
        const y0 = D0 - 0.12, y1 = D0 + 0.012, zr = s < 0 ? -29.4 : 29.4, zb = s < 0 ? -30.6 : 30.6;
        b.add(s < 0 ? quad(V(-600, y0, zr), V(600, y0, zr), V(600, y1, zr), V(-600, y1, zr), 600, 0.066)
          : quad(V(600, y0, zr), V(-600, y0, zr), V(-600, y1, zr), V(600, y1, zr), 600, 0.066), M.cope);
        b.add(s < 0 ? quad(V(-600, y1, zr), V(600, y1, zr), V(600, y1, zb), V(-600, y1, zb), 600, 0.6)
          : quad(V(-600, y1, zb), V(600, y1, zb), V(600, y1, zr), V(-600, y1, zr), 600, 0.6), M.cope);
        const zw = s < 0 ? -30 : 30; // underside of the lip, back to the wall face
        b.add(s < 0 ? quad(V(-600, y0, zw), V(600, y0, zw), V(600, y0, zr), V(-600, y0, zr), 600, 0.3)
          : quad(V(-600, y0, zr), V(600, y0, zr), V(600, y0, zw), V(-600, y0, zw), 600, 0.3), M.cope);
      }
      // mooring bollards along the quay edge
      for (let x = -40; x <= 40; x += 8) { const g = new THREE.CylinderGeometry(0.22, 0.28, 0.7, 10); b.add(g, M.wood, new THREE.Matrix4().makeTranslation(x, D0 + 0.35, s * 30.9)); }
    }
    b.add(quadUp(-900, 900, -30, 30, 225, 7.5, -0.6 - D0), M.bed);
    b.build(R);
    buildTown(R, kit, sightLines());

    const wNear = waterNear(), wFar = waterFar();
    for (const t of [wNear, wFar]) { t.colorSpace = THREE.NoColorSpace; t.anisotropy = 16; t.needsUpdate = true; }
    this.WU = {
      wNearC: { value: new THREE.Color() }, wMidC: { value: new THREE.Color() }, wFarC: { value: new THREE.Color() },
      wCrest: { value: new THREE.Color() }, wTrough: { value: new THREE.Color() }, wGlint: { value: new THREE.Color() },
      wShade: { value: new THREE.Vector3(0.5, 0.56, 0.72) }, wNearTex: { value: wNear }, wFarTex: { value: wFar }, wTime: { value: 0 },
    };
    const waterM = new THREE.MeshLambertMaterial({ color: 0xffffff });
    waterM.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, this.WU);
      sh.vertexShader = sh.vertexShader
        .replace("#include <common>", "#include <common>\nvarying vec3 vWP;")
        .replace("#include <project_vertex>", "#include <project_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;");
      sh.fragmentShader = sh.fragmentShader
        .replace("#include <common>", WATER_DECL)
        .replace("#include <map_fragment>", WATER_COL)
        .replace("#include <lights_fragment_begin>", "float sunVis = 1.0;\n" + LFB)
        .replace("#include <lights_fragment_end>", "#include <lights_fragment_end>\n  reflectedLight.directDiffuse = diffuseColor.rgb * mix(wShade, vec3(1.0), sunVis);\n  reflectedLight.indirectDiffuse = vec3(0.0);");
    };
    waterM.customProgramCacheKey = () => "river1";
    const wm = new THREE.Mesh(quadUp(-900, 900, -30, 30, 1, 1, -D0), waterM);
    wm.receiveShadow = true;
    R.add(wm);

    // ---- the ship on its roll pivot ----
    this.shipPivot.position.set(0, ROLL_Y, ZS);
    this.ship.group.position.set(0, -ROLL_Y, 0);
    this.shipPivot.add(this.ship.group);
    R.add(this.shipPivot);

    // ---- the king's empty chair on the quay: oversized, red and gold ----
    const red = lam("vasaRed", () => ({ color: "#a8322a" })), gold = lam("vasaGold", () => ({ color: "#d9a93a" }));
    const [cx, cy, cz] = CHAIR;
    const parts: [THREE.BufferGeometry, THREE.Material][] = [
      [boxGeo(V(-0.75, 0.75, -0.7), V(0.75, 1.0, 0.7)), gold],
      [boxGeo(V(-0.7, 1.0, -0.65), V(0.7, 1.22, 0.65)), red],
      [boxGeo(V(-0.75, 1.0, -0.75), V(0.75, 3.0, -0.55)), gold],
      [boxGeo(V(-0.6, 1.2, -0.56), V(0.6, 2.75, -0.5)), red],
      [boxGeo(V(-0.85, 1.0, -0.7), V(-0.68, 1.75, 0.7)), gold],
      [boxGeo(V(0.68, 1.0, -0.7), V(0.85, 1.75, 0.7)), gold],
    ];
    for (const [x, z] of [[-0.62, -0.58], [0.62, -0.58], [-0.62, 0.58], [0.62, 0.58]]) parts.push([boxGeo(V(x - 0.09, 0, z - 0.09), V(x + 0.09, 0.75, z + 0.09)), gold]);
    const crown = new THREE.ConeGeometry(0.32, 0.45, 5); crown.translate(0, 3.25, -0.65); parts.push([crown, gold]);
    for (const [g, m] of parts) { const mesh = new THREE.Mesh(g, m); mesh.castShadow = true; mesh.receiveShadow = true; this.chair.add(mesh); }
    this.chair.position.set(cx, cy, cz);
    R.add(this.chair);

    const smokeT = smokeTex();
    for (const [top, n] of [[[-22, D0 + 30.6, -77], 7], [[-80, D0 + 24.6, 93], 6]] as const)
      for (let k = 0; k < n; k++) {
        const mat = new THREE.MeshLambertMaterial({ map: smokeT, transparent: true, depthWrite: false });
        const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
        m.layers.set(NOINK);
        this.smoke.push({ m, mat, top: top as unknown as V3, k: k / n }); R.add(m);
      }
    const flashT = ctex("muzzle", 256, 256, (g) => {
      const gr = g.createRadialGradient(128, 128, 0, 128, 128, 126);
      gr.addColorStop(0, "rgba(255,255,235,1)"); gr.addColorStop(0.18, "rgba(255,236,150,1)"); gr.addColorStop(0.45, "rgba(255,150,50,0.75)"); gr.addColorStop(1, "rgba(255,90,20,0)");
      g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
    });
    const PX = [-13.8, -11.3, -8.8, -6.3, -3.8, -1.3, 1.2, 3.7, 6.2, 8.7, 11.2];
    PX.forEach((px, i) => {
      const flash = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: flashT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
      flash.layers.set(NOINK); flash.visible = false; flash.frustumCulled = false; R.add(flash);
      const puffs = [0, 1, 2, 3].map(() => {
        // writes depth (alpha-tested) so the world's ink lines stop at the smoke instead of showing through it
        const mat = new THREE.MeshBasicMaterial({ map: smokeT, transparent: true, depthWrite: true, alphaTest: 0.02 });
        mat.color.setRGB(1.55, 1.53, 1.5);
        const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
        m.layers.set(NOINK); m.visible = false; m.frustumCulled = false; R.add(m);
        return { m, mat };
      });
      this.salute.push({ px, rank: PX.length - 1 - i, flash, puffs });
    });
    for (const fg of FOREGROUND) {
      const o = kitClone(kit, fg.kit, fg.s ?? 1);
      if (!o) continue;
      o.position.set(...fg.pos); o.rotation.y = fg.yaw ?? 0; o.visible = false;
      this.fgs.push({ o, a: fg.a, b: fg.b }); R.add(o);
    }
  }

  private shotSun(id: number, s: ShotDef, L: LightPreset) {
    let v = this.sunCache.get(id);
    if (v) return v;
    let fx = 0, fz = 0;
    for (let f = s.a; f < s.b; f += 3) {
      const c = worldCam(id, f), x = c.look[0] - c.pos[0], z = c.look[2] - c.pos[2], n = Math.hypot(x, z) || 1;
      fx += x / n; fz += z / n;
    }
    const n = Math.hypot(fx, fz) || 1; fx /= n; fz /= n;
    const az = THREE.MathUtils.degToRad(SUN_SHOT[s.key]?.az ?? L.az), el = THREE.MathUtils.degToRad(SUN_SHOT[s.key]?.el ?? L.el);
    const hx = fx * Math.cos(az) - fz * Math.sin(az), hz = fz * Math.cos(az) + fx * Math.sin(az);
    v = new THREE.Vector3(hx * Math.cos(el), Math.sin(el), hz * Math.cos(el)).normalize();
    this.sunCache.set(id, v);
    return v;
  }

  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
  private fx(i: number) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }

  /** the roly-poly toy: rocks back up after each push (S5 lines 14-15); x-ray of its lead weight; then upside down it falls (line 17) */
  private poseToy(k: string, t: number) {
    const T = this.toy, R = TOY.R;
    let th = 0;
    if (k === "s5_flip") {
      // standing on its head: an inverted pendulum that tips over and lands with a clack (~53.9)
      const F = TOY_FALL, u = Math.max(0, t - F.t0), land = toyLandT();
      th = Math.min(F.th, F.k * Math.cosh(F.w * u));
      if (t > land) th = F.th - 0.12 * Math.exp(-(t - land) * 7) * Math.abs(Math.sin((t - land) * 22));
      T.inner.rotation.set(0, 0, Math.PI); T.inner.position.set(0, F.top, 0); // head down, resting on its crown
      // rolls on its round head: the head's centre stays r above the table and moves r * theta
      T.group.rotation.set(0, 0, -th);
      T.group.position.set(F.r * th - F.r * Math.sin(th), F.r - F.r * Math.cos(th), 0);
      T.mat.opacity = 1; T.weight.visible = false;
      return;
    }
    const push = (t0: number, a: number) => { const u = t - t0; return u > 0 ? a * Math.exp(-1.25 * u) * Math.sin(5.4 * u) : 0; };
    th = push(43.3, 0.55) + push(44.75, 0.42) + (k === "s5_cut" ? push(48.2, 0.3) : 0);
    // roll without slipping: the bottom sphere's centre moves by R * theta
    T.inner.rotation.set(0, 0, 0); T.inner.position.set(0, 0, 0);
    T.group.rotation.set(0, 0, -th);
    T.group.position.set(R * th - R * Math.sin(th), R - R * Math.cos(th), 0);
    const xr = k === "s5_toy" ? clamp01((t - 45.55) / 0.35) : 0;
    T.mat.opacity = 1 - 0.62 * xr; T.mat.depthWrite = xr < 0.5; T.weight.visible = xr > 0.02;
  }

  update(id: number, f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const t = tv(f), s = SHOTS[id - 1], L = LIGHTS[s.light], P = poseAt(s, t), heel = P.heel, inside = s.set !== "harbour";
    this.harbour.visible = !inside; this.hall.visible = s.set === "hall"; this.table.visible = s.set === "table";
    const c = worldCam(id, f);
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = 0.2; cam.far = 1500; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    const focus = V(...c.look), dist = cam.position.distanceTo(focus);
    cam.layers.enable(NOINK);
    const K = LOOK[s.light], sunDir = this.shotSun(id, s, L);
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI;
    const Rr = inside ? (s.set === "table" ? 0.9 : 9) : THREE.MathUtils.clamp(dist * 1.15 + 9, 14, 95);
    const sd = inside ? (s.set === "table" ? 3 : 30) : 220;
    this.sun.position.copy(focus).addScaledVector(sunDir, sd); this.sun.target.position.copy(focus);
    const sc = this.sun.shadow.camera;
    sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = inside ? sd * 0.1 : 20; sc.far = inside ? sd * 2.2 : 480; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    this.fill.intensity = 0;
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(...LOOK[s.light].bounce); TONE.uSat.value = LOOK[s.light].sat;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    // v2: the interiors are candle-lit: warm light and warm (not lavender) shadows, so the damask reads red and gold
    if (inside) {
      TONE.uLitCol.value.set(1.6, 1.36, 1.02); TONE.uShadeCol.value.set(0.52, 0.34, 0.28); TONE.uShadeLift.value.set(0.09, 0.05, 0.035);
      CHAR.uCharTint.value.set(1.0, 0.9, 0.78); CHAR.uSideTint.value.set(0.9, 0.82, 0.8);
    }
    const su = this.skyMat.uniforms;
    K.sky.c.forEach((h, i) => untone(h, su["c" + i].value));
    const e = K.sky.e.map((deg) => THREE.MathUtils.degToRad(deg));
    su.e.value.set(e[1], e[2], e[3], e[4]);
    this.sky.position.copy(cam.position);
    untone(L.fog, this.fog.color); this.fog.near = L.fogNear; this.fog.far = L.fogFar;
    scene.fog = inside ? null : this.fog; scene.background = null;
    this.sunDisc.visible = this.sunHalo.visible = false;
    for (let i = 0; i < this.clouds.length; i++) {
      const m = this.clouds[i], mat = m.material as THREE.MeshBasicMaterial;
      m.lookAt(cam.position.x, m.position.y, cam.position.z);
      mat.map = this.cloudMaps[s.light][i % 4];
    }
    const W = this.WU, wc = K.water;
    untone(wc.near, W.wNearC.value); untone(wc.mid, W.wMidC.value); untone(wc.far, W.wFarC.value);
    untone(wc.crest, W.wCrest.value); untone(wc.trough, W.wTrough.value); untone(wc.glint, W.wGlint.value);
    W.wShade.value.set(...wc.shade); W.wTime.value = t;
    for (const g of this.fgs) g.o.visible = f >= g.a && f < g.b;
    // ---- ship: pose, ports and guns, sails, flags (hoisted on "照常出发"), the loose cannon ----
    const tt = storyT(s, t), k = s.key;
    this.shipPivot.position.set(P.x, ROLL_Y + P.y, P.z);
    this.shipPivot.rotation.set(heel, 0, 0);
    this.shipPivot.visible = P.y > -30;
    const test = s.crowd === "test" || s.crowd === "freeze" || s.crowd === "officers";
    const sailing = s.crowd === "sail";
    const launch = s.crowd === "launch" || sailing;
    this.ship.poseFlags(t, launch ? (k === "s3_d" ? clamp01((t - 25.15) / 0.5) : 1) : 0.0);
    // S2: the lower ports open and the guns run out one by one, then "两层": the upper row, and the hull stretches
    if (k === "s2_ports") {
      const lowT = (i: number) => 12.5 + i * 0.075, upT = (i: number) => 13.95 + i * 0.04;
      this.ship.setPorts(t < 12.5 ? 0 : t < 13.95 ? 1 : 2);
      this.ship.setGuns((r, i) => { const t0 = r ? upT(i) : lowT(i); const u = clamp01((t - t0) / 0.18); return u <= 0 ? 0 : 1 + 0.25 * Math.sin(Math.PI * u) ; });
      const b = t - 13.95, st = b > 0 ? 0.07 * Math.exp(-b * 4.5) * Math.cos(b * 16) : 0;
      this.ship.group.scale.set(1, 1 + st, 1);
    } else {
      this.ship.setPorts(launch ? 2 : 0);
      const s1g = k.startsWith("s1_") && k !== "s1_officers";
      this.ship.setGuns((r, i) => { if (!launch) return 0; if (!s1g || r) return 1; const a = tt - (10 - i) * SALUTE_DT; return a < 0 || a > 0.6 ? 1 : 1 - 0.55 * Math.sin(Math.PI * Math.min(1, a / 0.6)) ** 0.5; });
      this.ship.group.scale.set(1, 1, 1);
    }
    // sails set when under way; gusts fill them
    const gust = Math.exp(-(((tt - GUST1 - 0.6) / 0.7) ** 2)) + Math.exp(-(((tt - GUST2 - 0.8) / 0.9) ** 2)) * (tt < GUST2 ? 1 : 1.2);
    this.ship.setSails(sailing ? 1 : 0, 0.8 + 0.7 * Math.min(1.3, gust));
    const slide = test ? clamp01((tt - 20.2) / 0.35) : 0;
    this.ship.cannons[0].position.z = 5.7 - 1.6 + 0.55 * slide * slide;
    this.ship.cannons[0].rotation.y = 0.25 * slide;
    this.chair.visible = test;
    this.shipPivot.updateMatrixWorld(true);
    // ---- S1 gun salute (story time, so the rewind runs it backwards) ----
    const s1 = k.startsWith("s1_") && k !== "s1_officers";
    for (const g of this.salute) {
      const tf = g.rank * SALUTE_DT, a = tt - tf;
      const on = s1 && a >= 0 && a < 4.5;
      g.flash.visible = on && a < 0.12;
      for (const pf of g.puffs) pf.m.visible = on;
      if (!on) continue;
      const PF = s1Pose(tf), w = halfW(g.px, 1.55);
      const mz = V(...shipToWorld([g.px, 1.55, w + 1.0], PF));
      if (g.flash.visible) {
        const sz = 3.4 * (1 - 0.45 * (a / 0.12));
        g.flash.position.copy(mz).add(V(0, 0.1, 0.9)); g.flash.scale.set(sz, sz, 1); g.flash.quaternion.copy(cam.quaternion);
      }
      g.puffs.forEach((pf, j) => {
        const grow = 1 - Math.exp(-a * 2.2), u = a / 4.5;
        const sz = 1.2 + 4.6 * grow + 0.9 * j;
        pf.m.position.set(mz.x + 0.9 * Math.sin(j * 2.1 + g.px) - 0.3 * a, mz.y + 0.2 + 0.6 * j + 0.7 * a, mz.z + 0.8 + (2.6 + 1.6 * j) * grow + 0.5 * a);
        pf.m.scale.set(sz, sz * 0.88, 1); pf.m.quaternion.copy(cam.quaternion);
        pf.mat.opacity = 0.94 * (1 - clamp01((u - 0.55) / 0.45)) ** 1.5 * Math.min(1, a / 0.05 + 0.2);
      });
    }
    // ---- the toy ----
    if (s.set === "table") this.poseToy(k, t);
    for (const sm of this.smoke) {
      const u = (t * 0.11 + sm.k) % 1, sz = 3 + u * 9;
      sm.m.position.set(sm.top[0] - u * 18, sm.top[1] + u * 13 + u * u * 4, sm.top[2] + u * 3);
      sm.m.scale.set(sz, sz, 1); sm.m.quaternion.copy(cam.quaternion);
      sm.mat.opacity = 0.85 * (1 - u) ** 1.2;
    }
    // ---- cast ----
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const st = stage(id, t, P, { pos: cam.position, right });
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    let ai = 0;
    const used: Actor[] = [];
    for (const p of st.places) {
      const sc2 = p.scale ?? 1;
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y + 1.1 * sc2, p.z), 3.5))) continue;
      const a = this.actor(ai++);
      const [w, h, k] = p.size ?? [300, 500, 0.5];
      a.r = this.pool.req(p.key, w, h, k, p.draw);
      a.mesh.visible = true;
      a.mesh.position.set(p.x, p.y, p.z);
      a.mesh.rotation.set(0, p.yaw ?? Math.atan2(cam.position.x - p.x, cam.position.z - p.z), p.roll ?? 0);
      a.mesh.scale.set(p.mirror ? -sc2 : sc2, sc2, sc2);
      a.mesh.castShadow = L.actorShadow;
      used.push(a);
    }
    for (let i = ai; i < this.actors.length; i++) this.actors[i].mesh.visible = false;
    let fi = 0;
    const fused: Fx[] = [];
    for (const p of st.fx) {
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y, p.z), Math.max(p.w, p.h)))) continue;
      const e = this.fx(fi++);
      e.r = this.pool.req(p.key, p.cw, p.ch, 1, p.draw);
      e.use(!!p.soft);
      e.mesh.visible = true;
      e.mesh.position.set(p.x, p.y, p.z);
      if (p.flat) e.mesh.rotation.set(-Math.PI / 2 + (p.tiltX ?? 0), 0, p.rot ?? 0);
      else { e.mesh.quaternion.copy(cam.quaternion); e.mesh.rotateZ(p.rot ?? 0); }
      e.mesh.scale.set(p.w, p.h, 1);
      fused.push(e);
    }
    for (let i = fi; i < this.fxs.length; i++) this.fxs[i].mesh.visible = false;
    this.pool.flush();
    for (const a of used) a.bind();
    for (const e of fused) e.bind();
    return focus;
  }
}

const WATER_DECL = `#include <common>
varying vec3 vWP;
uniform vec3 wNearC, wMidC, wFarC, wCrest, wTrough, wGlint, wShade;
uniform sampler2D wNearTex, wFarTex;
uniform float wTime;`;
const WATER_COL = `
  vec3 wV = vWP - cameraPosition;
  float wd = length(wV);
  float wDep = asin(clamp(-wV.y / wd, 0.0, 1.0));       // depression angle of the view ray
  float wf = 1.0 - smoothstep(0.0, 0.42, wDep);         // 1 at the horizon .. 0 at 24 deg down
  vec3 wc = mix(mix(wNearC, wMidC, smoothstep(0.0, 0.55, wf)), wFarC, smoothstep(0.55, 1.0, wf));
  vec2 wp = vWP.xz + vec2(0.35 * wTime, 0.0);           // slow river along +x
  vec4 mk = mix(texture2D(wNearTex, wp / 8.0), texture2D(wFarTex, wp / 40.0 + 0.37), smoothstep(25.0, 90.0, wd));
  wc = mix(wc, wTrough, mk.g * 0.6);
  wc = mix(wc, wCrest, mk.r * 0.7);
  wc = mix(wc, wGlint, mk.b * (0.3 + 0.5 * wf));
  diffuseColor.rgb = wc;`;

/** horizontal quad facing up at height D0 + dy covering x0..x1, z0..z1 (z0 < z1) */
function quadUp(x0: number, x1: number, z0: number, z1: number, u: number, v: number, dy = 0) {
  const y = D0 + dy, g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute([x0, y, z1, x1, y, z1, x1, y, z0, x0, y, z1, x1, y, z0, x0, y, z0], 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0], 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, u, 0, u, v, 0, 0, u, v, 0, v], 2));
  return g;
}
/** embankment wall from the river bed to the bank top at z, facing +z (dir 1) or -z (dir -1) */
function wallQuad(x0: number, x1: number, z: number, dir: number) {
  const g = new THREE.BufferGeometry(), y0 = -0.6, y1 = D0;
  g.setAttribute("position", new THREE.Float32BufferAttribute([x0, y0, z, x1, y0, z, x1, y1, z, x0, y0, z, x1, y1, z, x0, y1, z], 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(Array(6).fill([0, 0, dir]).flat(), 3));
  const u = Math.abs(x1 - x0) / 4, v = (y1 - y0) / 4;
  g.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, u, 0, u, v, 0, 0, u, v, 0, v], 2));
  return g;
}
