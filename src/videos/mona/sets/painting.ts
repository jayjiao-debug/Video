// THE PAINTING of 采访蒙娜丽莎的一天 (look test, 23 Nov 2026): the panel as a small stage. She stands at the origin facing +z.
// In front of her (z = FRAME_Z) the museum wall with one opening, and round the opening a carved gilt frame; behind her
// a low parapet with two column bases (the loggia she sits in) and, further back, the landscape as one painted board
// (hazy blue-green mountains, water higher on the right than on the left, a winding road on the left, a bridge on the
// right), bigger than the opening so that it slides a little behind her as the camera moves.
//   const P = paintingSet(M)          P.group -> scene.add; P.open = the opening (x0, x1, y0, y1); P.frameZ
//   P.torch(x, y, r, k)               the guard's torch on the picture: a soft disc of light at (x, y) of the opening's
//                                     plane, r wide, k strong (0 = off)
//   P.dim(k)                          the gallery's light: 1 = open hours, 0 = night
import * as THREE from "three";
import type { Mats } from "../../bt/pbr";

export const OPEN = { x0: -0.37, x1: 0.37, y0: 0.6, y1: 1.6 } as const;
export const FRAME_Z = 0.42;

const rng = (seed: number) => { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };
const canvasTex = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => {
  const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
  draw(cv.getContext("2d")!);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
};

/** the board's size (m) and the height of its middle */
const BW = 2.2, BH = 2.5, BY = 1.08;
/** the landscape: x in metres across the board (0 = behind her), y = height in metres */
const paintLandscape = (g: CanvasRenderingContext2D, W: number, H: number) => {
  const X = (x: number) => (x / BW + 0.5) * W, Y = (y: number) => (1 - (y - (BY - BH / 2)) / BH) * H, S = W / BW;
  const poly = (pts: [number, number][], col: string) => { g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(X(p[0]), Y(p[1])) : g.moveTo(X(p[0]), Y(p[1])))); g.closePath(); g.fillStyle = col; g.fill(); };
  const tri = (x: number) => 1 - Math.abs(((x % 1) + 1) % 1 - 0.5) * 2;
  /** a jagged ridge between x0 and x1: its crest at base + amp x (peaks), filled down to `floor` */
  const ridge = (x0: number, x1: number, base: number, amp: number, seed: number, col: string, floor: number, sharp = 1.6) => {
    const pts: [number, number][] = [];
    for (let x = x0; x <= x1 + 1e-6; x += 0.01) {
      const k = 0.58 * Math.pow(tri(x * 1.7 + seed), sharp) + 0.27 * Math.pow(tri(x * 4.3 + seed * 2.3), sharp) + 0.15 * tri(x * 11 + seed * 5.1);
      pts.push([x, base + amp * k]);
    }
    poly([...pts, [x1, floor], [x0, floor]], col);
  };
  // the sky: deep blue-green above, a pale yellow haze down at the mountains
  const sky = g.createLinearGradient(0, Y(2.3), 0, Y(1.2));
  sky.addColorStop(0, "#4f7473"); sky.addColorStop(0.42, "#86a391"); sky.addColorStop(0.8, "#c8caa0"); sky.addColorStop(1, "#ddd3a4");
  g.fillStyle = sky; g.fillRect(0, 0, W, H);
  // the far mountains: pale, one behind the other, paler with distance
  ridge(-1.1, 1.1, 1.34, 0.42, 0.31, "#a9bda6", 1.0);
  ridge(-1.1, 1.1, 1.3, 0.36, 1.73, "#8eaa9c", 1.0, 2.1);
  ridge(-1.1, 0.05, 1.2, 0.34, 2.9, "#739790", 1.0);
  ridge(0.0, 1.1, 1.32, 0.3, 4.4, "#6f948c", 1.0, 2.0);
  // the water: on the right a high lake up among the peaks; on the left a lower one
  poly([[0.0, 1.36], [1.1, 1.36], [1.1, 1.22], [0.0, 1.22]], "#a9c3b0");
  poly([[-1.1, 1.22], [0.02, 1.22], [0.02, 1.08], [-1.1, 1.08]], "#94b3a4");
  g.strokeStyle = "rgba(236,240,214,0.55)"; g.lineWidth = 0.006 * S;
  for (const [x0, x1, y] of [[0.12, 0.7, 1.33], [0.3, 1.0, 1.3], [0.1, 0.5, 1.27], [-0.9, -0.3, 1.19], [-0.6, -0.1, 1.15], [-1.0, -0.5, 1.12]]) { g.beginPath(); g.moveTo(X(x0), Y(y)); g.lineTo(X(x1), Y(y)); g.stroke(); }
  // nearer crags at the water's edge, blue-green going to brown
  ridge(0.0, 1.1, 1.14, 0.2, 6.2, "#5f8076", 0.8, 1.3);
  ridge(-1.1, 0.02, 1.02, 0.2, 7.7, "#5d7b6c", 0.8, 1.3);
  ridge(0.0, 1.1, 1.04, 0.14, 8.8, "#6f7350", 0.7, 1.1);
  ridge(-1.1, 0.02, 0.95, 0.13, 9.9, "#77704a", 0.7, 1.1);
  // the near land: red-brown earth
  ridge(-1.1, 1.1, 0.9, 0.08, 11.3, "#83643a", 0.2, 1.0);
  ridge(-1.1, 1.1, 0.8, 0.07, 12.9, "#6b4a2a", 0.2, 1.0);
  // the river on the right, coming down from the lake to under the bridge
  g.lineCap = "round"; g.lineJoin = "round";
  const river: [number, number][] = [[0.34, 1.22], [0.3, 1.12], [0.42, 1.04], [0.5, 0.97], [0.44, 0.9], [0.52, 0.8]];
  g.strokeStyle = "#8fb0a0"; g.beginPath(); river.forEach((p, i) => (i ? g.lineTo(X(p[0]), Y(p[1])) : g.moveTo(X(p[0]), Y(p[1])))); g.lineWidth = 0.05 * S; g.stroke();
  // the bridge: a stone deck on four arches
  const bx0 = 0.3, bx1 = 0.66, by = 0.985, bh = 0.05;
  poly([[bx0, by], [bx1, by + 0.008], [bx1, by + 0.008 - bh], [bx0, by - bh]], "#b39b68");
  g.fillStyle = "#4d5a48";
  for (let i = 0; i < 4; i++) { const cx = bx0 + 0.05 + i * 0.087; g.beginPath(); g.ellipse(X(cx), Y(by - bh + 0.002), 0.031 * S, 0.034 * S, 0, Math.PI, 0); g.fill(); }
  g.strokeStyle = "#6e5a36"; g.lineWidth = 0.007 * S; g.beginPath(); g.moveTo(X(bx0), Y(by)); g.lineTo(X(bx1), Y(by + 0.008)); g.stroke();
  // the road on the left: an ochre ribbon winding up from the near land to the water
  const road: [number, number][] = [[-0.3, 0.78], [-0.42, 0.86], [-0.3, 0.93], [-0.46, 0.99], [-0.36, 1.04], [-0.5, 1.08]];
  for (const [col, k] of [["#7a5a2c", 1.5], ["#d2b06a", 1]] as [string, number][]) {
    for (let i = 0; i < road.length - 1; i++) {
      const a = road[i], b = road[i + 1], m: [number, number] = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      g.strokeStyle = col; g.lineWidth = (0.05 - i * 0.008) * k * S; g.beginPath();
      const p0 = i ? [(road[i - 1][0] + a[0]) / 2, (road[i - 1][1] + a[1]) / 2] : a;
      g.moveTo(X(p0[0]), Y(p0[1])); g.quadraticCurveTo(X(a[0]), Y(a[1]), X(m[0]), Y(m[1])); g.stroke();
    }
  }
  // the air between: haze over the far things, strongest at the water
  const haze = g.createLinearGradient(0, Y(1.75), 0, Y(0.95));
  haze.addColorStop(0, "rgba(214,214,176,0)"); haze.addColorStop(0.5, "rgba(214,214,176,0.34)"); haze.addColorStop(1, "rgba(214,214,176,0)");
  g.fillStyle = haze; g.fillRect(0, 0, W, H);
  // soften it all (his smoke: no hard edge anywhere)
  const cv = g.canvas; g.filter = `blur(${Math.max(1, W / 420)}px)`; g.drawImage(cv, 0, 0); g.filter = "none";
  // the old varnish: warm and yellow, darker to the corners and to the ground
  g.fillStyle = "rgba(150,112,30,0.2)"; g.fillRect(0, 0, W, H);
  const low = g.createLinearGradient(0, Y(1.0), 0, Y(0.6));
  low.addColorStop(0, "rgba(40,26,12,0)"); low.addColorStop(1, "rgba(40,26,12,0.6)");
  g.fillStyle = low; g.fillRect(0, 0, W, H);
  const vg = g.createRadialGradient(W / 2, Y(1.2), W * 0.2, W / 2, Y(1.2), W * 0.62);
  vg.addColorStop(0, "rgba(30,20,8,0)"); vg.addColorStop(1, "rgba(30,20,8,0.5)");
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  // the cracks of five hundred years: a fine net, only on the painted board
  const R = rng(1503);
  g.strokeStyle = "rgba(48,32,14,0.11)"; g.lineWidth = 1;
  for (let i = 0; i < 900; i++) {
    let x = R() * W, y = R() * H, a = R() < 0.5 ? (R() - 0.5) * 0.5 : Math.PI / 2 + (R() - 0.5) * 0.5;
    g.beginPath(); g.moveTo(x, y);
    for (let k = 0, n = 3 + Math.floor(R() * 5); k < n; k++) { a += (R() - 0.5) * 0.7; x += Math.cos(a) * W * 0.0055; y += Math.sin(a) * W * 0.0055; g.lineTo(x, y); }
    g.stroke();
  }
};

/** the frame's carving: a run of leaves between two rows of beads (u along the bar, v across it: 0 = the outer edge) */
const paintGilt = (g: CanvasRenderingContext2D, W: number, H: number) => {
  g.fillStyle = "#c9993a"; g.fillRect(0, 0, W, H);
  const band = g.createLinearGradient(0, 0, 0, H);
  band.addColorStop(0, "#8a6420"); band.addColorStop(0.12, "#e8c264"); band.addColorStop(0.3, "#b98a30"); band.addColorStop(0.62, "#e2b852"); band.addColorStop(0.86, "#a77a28"); band.addColorStop(1, "#6e4e18");
  g.fillStyle = band; g.fillRect(0, 0, W, H);
  const n = 8, sx = W / n;
  for (let i = 0; i < n; i++) {
    const cx = (i + 0.5) * sx;
    // a leaf scroll in the middle band
    g.fillStyle = "#f0d078"; g.beginPath(); g.ellipse(cx, H * 0.47, sx * 0.4, H * 0.13, 0, 0, 7); g.fill();
    g.strokeStyle = "#7c5a1c"; g.lineWidth = 2.4; g.beginPath(); g.ellipse(cx, H * 0.47, sx * 0.4, H * 0.13, 0, 0, 7); g.stroke();
    g.beginPath(); g.moveTo(cx - sx * 0.34, H * 0.47); g.quadraticCurveTo(cx, H * 0.4, cx + sx * 0.34, H * 0.47); g.stroke();
    g.fillStyle = "#8a6420"; g.beginPath(); g.arc(i * sx, H * 0.47, H * 0.035, 0, 7); g.fill();
    // beads at the inner edge
    for (let k = 0; k < 4; k++) { const bx = (i + k / 4 + 0.125) * sx; g.fillStyle = "#f3d98a"; g.beginPath(); g.arc(bx, H * 0.84, H * 0.04, 0, 7); g.fill(); g.strokeStyle = "#7c5a1c"; g.lineWidth = 1.6; g.stroke(); }
  }
};

/** frame = the gilt frame's bars (hide it for the bare panel on its easel); room: false = no gallery wall, floor or
 *  skirting (sets/stage.ts builds the room round the picture and lifts the group) */
export type PaintingSet = { group: THREE.Group; frame: THREE.Group; open: typeof OPEN; frameZ: number; torch: (x: number, y: number, r: number, k: number) => void; dim: (k: number) => void };
export const paintingSet = (M: Mats, o: { wall?: string; label?: boolean; room?: boolean } = {}): PaintingSet => {
  const G = new THREE.Group(), { x0, x1, y0, y1 } = OPEN, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, ow = x1 - x0, oh = y1 - y0;
  const add = <T extends THREE.Object3D>(m: T, shadow = true) => { m.traverse((q) => { q.castShadow = shadow; q.receiveShadow = true; }); G.add(m); return m; };
  // ----- the landscape board
  const land = new THREE.Mesh(new THREE.PlaneGeometry(BW, BH), new THREE.MeshBasicMaterial({ map: canvasTex(1100, 1250, (g) => paintLandscape(g, 1100, 1250)) }));
  land.position.set(0, BY, -1.25); add(land, false);
  // ----- the loggia: a parapet behind her, a column base at each side
  const stone = M.paint({ color: "#6e583a", roughness: 0.9 }), stoneD = M.paint({ color: "#3d2e1d", roughness: 0.9 });
  const para = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.79, 0.16), stoneD); para.position.set(0, 0.395, -0.46); add(para);
  const cope = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.03, 0.22), stone); cope.position.set(0, 0.79, -0.46); add(cope);
  // (of each column only the round base shows, half cut by the picture's edge, as on the panel)
  for (const s of [-1, 1]) {
    const base = new THREE.Mesh(new THREE.SphereGeometry(0.07, 20, 14), stone); base.scale.set(1, 0.6, 1); base.position.set(s * 0.44, 0.845, -0.46); add(base);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.05, 20), stone); neck.position.set(s * 0.44, 0.905, -0.46); add(neck);
  }
  // the floor of her box and its dark sides (so that nothing of the gallery shows inside)
  const dark = new THREE.MeshBasicMaterial({ color: "#1c140c" });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.7), dark); floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0.001, -0.5); add(floor, false);
  // ----- the gallery wall with its opening
  const wallM = M.paint({ color: o.wall ?? "#2d3b62", roughness: 0.95 }), wz = FRAME_Z - 0.03, big = 6;
  if (o.room !== false) {
  for (const [w, h, x, y] of [[big, big, x0 - big / 2, cy], [big, big, x1 + big / 2, cy], [ow, big, cx, y1 + big / 2], [ow, big, cx, y0 - big / 2]] as [number, number, number, number][]) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wallM); m.position.set(x, y, wz); add(m, false);
  }
  const parquet = new THREE.Mesh(new THREE.PlaneGeometry(12, 8), M.wood({ color: "#8c6a44" })); parquet.rotation.x = -Math.PI / 2; parquet.position.set(0, 0, wz + 4); add(parquet, false);
  const skirt = new THREE.Mesh(new THREE.BoxGeometry(12, 0.09, 0.02), M.paint({ color: "#1d2742" })); skirt.position.set(0, 0.045, wz + 0.01); add(skirt, false);
  }
  // ----- the frame: an inner slope with the carving, an outer rail
  const gilt = canvasTex(1024, 128, (g) => paintGilt(g, 1024, 128)); gilt.wrapS = THREE.RepeatWrapping;
  const fw = 0.13, rail = 0.04;
  const bar = (len: number, rep: number) => {
    const t = gilt.clone(); t.needsUpdate = true; t.repeat.set(rep, 1);
    const carved = M.metalWith({ color: "#f1d48a", map: t, roughness: 0.42, metalness: 0.75 });
    const plain = M.metalWith({ color: "#c8992f", map: null, roughness: 0.36, metalness: 0.85 });
    const g = new THREE.Group();
    // (the bar lies along x; its inner edge is at y = 0, its outer edge at y = fw)
    const inner = new THREE.Mesh(new THREE.BoxGeometry(len, fw - rail, 0.05), [plain, plain, plain, plain, carved, plain]);
    inner.position.set(0, (fw - rail) / 2, 0.025); g.add(inner);
    const outer = new THREE.Mesh(new THREE.BoxGeometry(len, rail, 0.085), plain); outer.position.set(0, fw - rail / 2, 0.0425); g.add(outer);
    const lip = new THREE.Mesh(new THREE.BoxGeometry(len, 0.012, 0.062), plain); lip.position.set(0, 0.006, 0.031); g.add(lip);
    return g;
  };
  const FW = ow + 2 * fw, FH = oh + 2 * fw, frameG = new THREE.Group(); frameG.name = "mona.frame";
  const top = bar(FW, Math.round(FW / 0.3)); top.position.set(cx, y1, FRAME_Z); frameG.add(top);
  const bot = bar(FW, Math.round(FW / 0.3)); bot.rotation.z = Math.PI; bot.position.set(cx, y0, FRAME_Z); frameG.add(bot);
  const lef = bar(FH, Math.round(FH / 0.3)); lef.rotation.z = Math.PI / 2; lef.position.set(x0, cy, FRAME_Z); frameG.add(lef);
  const rig = bar(FH, Math.round(FH / 0.3)); rig.rotation.z = -Math.PI / 2; rig.position.set(x1, cy, FRAME_Z); frameG.add(rig);
  add(frameG, false);
  // the label under it
  if (o.label !== false && o.room !== false) {
    const lab = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.07, 0.008), M.metalWith({ color: "#d8b45a", map: canvasTex(256, 96, (g) => {
      g.fillStyle = "#e6c878"; g.fillRect(0, 0, 256, 96); g.strokeStyle = "#7c5a1c"; g.lineWidth = 5; g.strokeRect(6, 6, 244, 84);
      g.fillStyle = "#5a3e14"; for (const [y, w] of [[30, 150], [50, 190], [68, 110]]) g.fillRect(128 - w / 2, y, w, 6);
    }), roughness: 0.5, metalness: 0.6 }));
    lab.position.set(cx, y0 - fw - 0.1, wz + 0.005); add(lab, false);
  }
  // ----- the torch: a soft disc of light on the picture's plane (added light, drawn over everything inside)
  const torchTex = canvasTex(256, 256, (g) => {
    const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    gr.addColorStop(0, "rgba(255,244,200,1)"); gr.addColorStop(0.55, "rgba(255,236,170,0.75)"); gr.addColorStop(0.8, "rgba(255,226,150,0.22)"); gr.addColorStop(1, "rgba(255,220,140,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  });
  const torchM = new THREE.MeshBasicMaterial({ map: torchTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false });
  const torch = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), torchM); torch.renderOrder = 999; torch.position.z = FRAME_Z + 0.1; torch.visible = false; G.add(torch);
  // ----- the night: a dark sheet over the gallery, in front of everything, with a hole where the torch falls
  const nightM = new THREE.ShaderMaterial({
    transparent: true, depthTest: false, depthWrite: false,
    uniforms: { uA: { value: 0 }, uC: { value: new THREE.Vector2() }, uR: { value: 0.5 }, uK: { value: 0 } },
    vertexShader: "varying vec2 vW; void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xy; gl_Position = projectionMatrix * viewMatrix * w; }",
    fragmentShader: "uniform float uA, uR, uK; uniform vec2 uC; varying vec2 vW; void main() { float s = 1.0 - smoothstep(uR * 0.62, uR, distance(vW, uC)); gl_FragColor = vec4(0.0015, 0.0035, 0.016, uA * (1.0 - uK * s)); }",
  });
  const night = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), nightM); night.renderOrder = 998; night.position.set(0, 1.1, FRAME_Z + 0.09); night.visible = false; G.add(night);
  return {
    group: G, frame: frameG, open: OPEN, frameZ: FRAME_Z,
    // (the torch: the night lifts inside its disc, and a little warm light is added on top)
    torch: (x, y, r, k) => { torch.visible = k > 0.001; torch.position.x = x; torch.position.y = y; torch.scale.set(r * 2, r * 2, 1); torchM.opacity = 0.09 * k; nightM.uniforms.uC.value.set(x + G.position.x, y + G.position.y); nightM.uniforms.uR.value = r; nightM.uniforms.uK.value = Math.min(1, k); },
    dim: (k) => { const a = (1 - k) * 0.86; night.visible = a > 0.001; nightM.uniforms.uA.value = a; },
  };
};
