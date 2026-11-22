// SMALL SHARED PIECES of the grove, the balcony and the tomb (set builder "a"). The general helpers come from the
// finished films' parts (read-only imports: su's parts/common.ts and parts/town.ts); what is here is what those do not
// have: drifting mist cards, sun shafts, dust motes, crumpled paper, curled pages, fern / leaf fronds, a heraldic
// shield. Kit rules kept (src/kit/sets/okit.ts header, src/kit/fx/README.md): fine detail is paint; loose small things
// are props-kit Parts (NOINK + their own hull); mist, shafts, dust, fronds are NOINK; seeded only; every animate is a
// pure function of t.
import * as THREE from "three";
import type { Kit } from "../../../../kit/props/kit";
import { Part } from "../../../../kit/props/kit";
import { paint, rng, css, blotch, NOINK, clamp, type G2 } from "../../../../kit/sets/okit";

export { maker, lathe, bar, shade, shadeHex, levelQuad, wrapBlotch, glowSprite, rockFit, boxG, tileUV, uvRect, roundBox, flagsTex } from "../../../su/sets/parts/common";
export { blobG, bentLimb, panoramaRing } from "../../../su/sets/parts/town";
export { strandField, type Strand } from "../../../su/sets/parts/strands";
export { Part, NOINK };

// ------------------------------------------------------------------------------------------------ mist and light
/** A MIST BANK: an unlit, transparent, NOINK card (x0..x1 at depth z, y0..y1), densest low, its top edge soft and
 *  wavy; `warm` tints the left (sun side) of the card toward `sun`. drift(t) slides its texture a few centimetres (a
 *  pure function of t). */
export const mistCard = (o: { x0: number; x1: number; y0: number; y1: number; z: number; col: string; sun?: string; warm?: number; a: number; seed: number; ry?: number; footFade?: number }) => {
  const W = 512, H = 256;
  const tex = paint(W, H, (g) => {
    const r = rng(o.seed);
    g.clearRect(0, 0, W, H);
    // a soft wavy bank: many wide blotches whose density falls with height
    for (let i = 0; i < 90; i++) {
      const x = W * r(), hk = Math.pow(r(), 1.7), y = H * (1 - hk * 0.85) - 10, rad = 40 + 70 * r() * (1 - hk * 0.5);
      blotch(g, x, y, rad, o.col, 0.28 * (1 - hk * 0.6));
    }
    // a base layer along the bottom
    const gr = g.createLinearGradient(0, H, 0, H * 0.25);
    gr.addColorStop(0, css(o.col, 0.75)); gr.addColorStop(0.5, css(o.col, 0.3)); gr.addColorStop(1, css(o.col, 0));
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    if (o.sun && o.warm) {
      g.globalCompositeOperation = "source-atop";
      const sg = g.createLinearGradient(0, 0, W, 0);
      sg.addColorStop(0, css(o.sun, o.warm)); sg.addColorStop(0.55, css(o.sun, o.warm * 0.25)); sg.addColorStop(1, css(o.sun, 0));
      g.fillStyle = sg; g.fillRect(0, 0, W, H);
      g.globalCompositeOperation = "source-over";
    }
    // fade the side edges so a card never shows its end
    g.globalCompositeOperation = "destination-in";
    const eg = g.createLinearGradient(0, 0, W, 0);
    eg.addColorStop(0, "rgba(0,0,0,0)"); eg.addColorStop(0.12, "rgba(0,0,0,1)"); eg.addColorStop(0.88, "rgba(0,0,0,1)"); eg.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = eg; g.fillRect(0, 0, W, H);
    // and the bottom: the veil rises from nothing where the card meets the ground (no line along its foot)
    const bg = g.createLinearGradient(0, H, 0, H * (1 - (o.footFade ?? 0.18)));
    bg.addColorStop(0, "rgba(0,0,0,0)"); bg.addColorStop(1, "rgba(0,0,0,1)");
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = "source-over";
  });
  tex.wrapS = THREE.ClampToEdgeWrapping;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(o.x1 - o.x0, o.y1 - o.y0), new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: o.a, depthWrite: false, fog: false }));
  m.position.set((o.x0 + o.x1) / 2, (o.y0 + o.y1) / 2, o.z); m.rotation.y = o.ry ?? 0;
  m.layers.set(NOINK); m.renderOrder = 2; m.castShadow = false; m.receiveShadow = false; m.name = "mist";
  const x0 = m.position.x, ph = o.seed * 0.7;
  const drift = (t: number) => { m.position.x = x0 + 0.12 * Math.sin(t * 0.11 + ph); (m.material as THREE.MeshBasicMaterial).opacity = o.a * (0.94 + 0.06 * Math.sin(t * 0.23 + ph)); };
  return { mesh: m, drift };
};

/** A SHAFT OF LIGHT: a long soft additive NOINK quad from `top` to `foot` (world points), `w` wide at the top and `w2`
 *  at the foot, facing the camera side (+z); breathe(t) moves its opacity a little */
export const lightShaft = (top: THREE.Vector3, foot: THREE.Vector3, w: number, w2: number, col: string, a: number, ph = 0) => {
  const tex = paint(64, 256, (g, W, H) => {
    const gx = g.createLinearGradient(0, 0, W, 0);
    gx.addColorStop(0, css(col, 0)); gx.addColorStop(0.2, css(col, 0.25)); gx.addColorStop(0.38, css(col, 0.75)); gx.addColorStop(0.5, css(col, 1)); gx.addColorStop(0.62, css(col, 0.75)); gx.addColorStop(0.8, css(col, 0.25)); gx.addColorStop(1, css(col, 0));
    g.fillStyle = gx; g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = "destination-in";
    const gy = g.createLinearGradient(0, 0, 0, H);
    gy.addColorStop(0, "rgba(0,0,0,0)"); gy.addColorStop(0.35, "rgba(0,0,0,0.85)"); gy.addColorStop(0.7, "rgba(0,0,0,0.7)"); gy.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gy; g.fillRect(0, 0, W, H);
  });
  const d = foot.clone().sub(top), side = new THREE.Vector3(0, 0, 1).cross(d).normalize();
  const a0 = top.clone().addScaledVector(side, -w / 2), a1 = top.clone().addScaledVector(side, w / 2), b0 = foot.clone().addScaledVector(side, -w2 / 2), b1 = foot.clone().addScaledVector(side, w2 / 2);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute([a0.x, a0.y, a0.z, a1.x, a1.y, a1.z, b1.x, b1.y, b1.z, b0.x, b0.y, b0.z], 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute([0, 1, 1, 1, 1, 0, 0, 0], 2));
  geo.setIndex([0, 2, 1, 0, 3, 2]);
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: a, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
  const m = new THREE.Mesh(geo, mat); m.layers.set(NOINK); m.renderOrder = 6; m.name = "shaft"; m.frustumCulled = false; m.castShadow = false; m.receiveShadow = false;
  const breathe = (t: number) => { mat.opacity = a * (0.85 + 0.15 * Math.sin(t * 0.37 + ph)); };
  return { mesh: m, breathe };
};

/** DUST MOTES: n soft points drifting slowly inside a box (NOINK, additive); update(t) is a pure function of t */
export const dustMotes = (n: number, box: { x0: number; x1: number; y0: number; y1: number; z0: number; z1: number }, col: string, size: number, a: number, seed: number) => {
  const r = rng(seed), seeds = Array.from({ length: n }, () => [r(), r(), r(), r() * 6.28, 0.5 + r()]);
  const pos = new Float32Array(n * 3), geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const dot = paint(32, 32, (g, S) => { const gr = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.4, "rgba(255,255,255,0.5)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, S, S); });
  const mat = new THREE.PointsMaterial({ color: col, size, map: dot, transparent: true, opacity: a, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true, fog: false });
  const pts = new THREE.Points(geo, mat); pts.layers.set(NOINK); pts.frustumCulled = false; pts.name = "dust"; pts.renderOrder = 7;
  const update = (t: number) => {
    for (let i = 0; i < n; i++) {
      const [u, v, w, ph, s] = seeds[i];
      const y = box.y0 + (box.y1 - box.y0) * (((v + t * 0.008 * s) % 1 + 1) % 1);
      pos[i * 3] = box.x0 + (box.x1 - box.x0) * u + 0.06 * Math.sin(t * 0.21 * s + ph);
      pos[i * 3 + 1] = y + 0.03 * Math.sin(t * 0.33 * s + ph * 1.3);
      pos[i * 3 + 2] = box.z0 + (box.z1 - box.z0) * w + 0.05 * Math.cos(t * 0.17 * s + ph);
    }
    (geo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  };
  update(0);
  return { points: pts, update };
};

// ------------------------------------------------------------------------------------------------ paper
/** a crumpled paper ball (unit radius ~1, seeded): an icosahedron pushed in and out hard, flat shaded */
export const paperBallG = (seed: number, r0: number) => {
  const g = new THREE.IcosahedronGeometry(1, 1), p = g.attributes.position as THREE.BufferAttribute, r = rng(seed);
  const map = new Map<string, number>();
  for (let i = 0; i < p.count; i++) {
    const k = `${p.getX(i).toFixed(3)},${p.getY(i).toFixed(3)},${p.getZ(i).toFixed(3)}`;
    let s = map.get(k); if (s === undefined) { s = 0.72 + 0.4 * r(); map.set(k, s); }
    p.setXYZ(i, p.getX(i) * s * r0, p.getY(i) * s * r0 * 0.86, p.getZ(i) * s * r0);
  }
  g.computeVertexNormals();
  return g;
};
/** the paper's skin: cream with a few faint handwritten lines (crumpled: broken pieces of them) */
export const paperTex = (seed: number) => paint(256, 256, (g, W, H) => {
  const r = rng(seed);
  g.fillStyle = "#f1eadb"; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 10; i++) blotch(g, W * r(), H * r(), 30 + 40 * r(), r() < 0.5 ? "#ffffff" : "#d8ccb4", 0.25);
  g.strokeStyle = "rgba(70,56,64,0.55)"; g.lineWidth = 2.2; g.lineCap = "round";
  for (let y = 26; y < H - 16; y += 19) { let x = 18 + 20 * r(); g.beginPath(); g.moveTo(x, y); while (x < W - 30) { const nx = x + 6 + 8 * r(); g.lineTo(nx, y + (r() - 0.5) * 5); x = nx; if (r() < 0.08) { x += 14; g.moveTo(x, y); } } g.stroke(); }
});
/** A LOOSE PAGE lying on the ground: a thin closed slab w x l (2 mm), bent up along its length by `curl` (m at the far
 *  end) and across by `cup`; its top shows `face` (handwriting), the rest the paper colour. Origin = the page's middle
 *  on the ground. */
export const pageG = (w: number, l: number, curl: number, cup: number) => {
  const g = new THREE.BoxGeometry(w, 0.002, l, 6, 1, 8), p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i), u = (z / l + 0.5), v = (x / w) * 2;
    p.setY(i, p.getY(i) + 0.001 + curl * Math.pow(Math.max(0, u - 0.45) / 0.55, 2) + cup * v * v);
  }
  g.computeVertexNormals();
  return g;
};
/** the face of a page: handwriting in lines, a few words struck through with a single stroke, a small heart */
export const pageTex = (seed: number) => paint(256, 360, (g, W, H) => {
  const r = rng(seed);
  g.fillStyle = "#f3ecdc"; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 6; i++) blotch(g, W * r(), H * r(), 40 + 40 * r(), "#e2d6be", 0.25);
  g.strokeStyle = "rgba(64,50,62,0.75)"; g.lineWidth = 2.4; g.lineCap = "round"; g.lineJoin = "round";
  for (let y = 40; y < H - 30; y += 22) {
    let x = 22 + (y === 40 ? 30 : 0); const end = W - 22 - 40 * r();
    g.beginPath(); g.moveTo(x, y);
    while (x < end) { const nx = x + 4 + 5 * r(); g.quadraticCurveTo((x + nx) / 2, y - 6 * r(), nx, y + (r() - 0.5) * 4); x = nx; if (r() < 0.12) { x += 9; g.moveTo(x, y); } }
    g.stroke();
    if (r() < 0.22) { const a = 30 + (W - 120) * r(); g.beginPath(); g.moveTo(a, y - 3); g.lineTo(a + 50 + 30 * r(), y - 1); g.stroke(); }
  }
  // a small heart doodle in a corner
  g.fillStyle = "rgba(150,70,70,0.55)"; const hx = W - 46, hy = H - 40, s = 9;
  g.beginPath(); g.moveTo(hx, hy + s); g.bezierCurveTo(hx - 2 * s, hy - 0.2 * s, hx - s, hy - 1.4 * s, hx, hy - 0.5 * s); g.bezierCurveTo(hx + s, hy - 1.4 * s, hx + 2 * s, hy - 0.2 * s, hx, hy + s); g.fill();
});

// ------------------------------------------------------------------------------------------------ fronds and leaves
/** A FROND FIELD (ferns, ivy sprays, leafy twigs): curved ribbons carrying an alpha-tested painted leaf texture, one
 *  NOINK double-sided mesh (outline painted in the texture). Each frond runs from root along an arch (out by `out`,
 *  up by `up`, drooping to `droop` at the tip). update(t, amp) sways the tips (pure function of t). */
export type Frond = { root: THREE.Vector3; dir: number; out: number; up: number; droop: number; w: number; ph: number; tilt?: number };
export const frondField = (mat: THREE.Material, list: Frond[], name: string, seg = 6) => {
  const pos: number[] = [], uv: number[] = [], idx: number[] = [], base: number[] = [], kk: number[] = [], phs: number[] = [];
  for (const f of list) {
    const d = new THREE.Vector3(Math.sin(f.dir), 0, Math.cos(f.dir)), side = new THREE.Vector3(d.z, 0, -d.x), tilt = f.tilt ?? 0.35;
    const v0 = pos.length / 3;
    for (let i = 0; i <= seg; i++) {
      const k = i / seg, h = f.up * Math.sin(Math.PI * 0.5 * Math.min(1, k * 1.6)) - (f.up + f.droop) * Math.max(0, k - 0.62) ** 2 * 2.6;
      const c = f.root.clone().addScaledVector(d, f.out * k).setY(f.root.y + h), w = f.w * Math.sin(Math.PI * Math.min(0.98, 0.12 + k * 0.88));
      for (const s of [-1, 1]) {
        const q = c.clone().addScaledVector(side, (s * w) / 2).add(new THREE.Vector3(0, s * w * tilt * 0.5, 0));
        pos.push(q.x, q.y, q.z); base.push(q.x, q.y, q.z); uv.push(s < 0 ? 0 : 1, k); kk.push(k); phs.push(f.ph);
      }
      if (i < seg) { const a = v0 + i * 2; idx.push(a, a + 1, a + 3, a, a + 3, a + 2); }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  const mesh = new THREE.Mesh(g, mat); mesh.name = name; mesh.layers.set(NOINK); mesh.castShadow = true; mesh.receiveShadow = true; mesh.frustumCulled = false;
  const P = g.attributes.position as THREE.BufferAttribute;
  const update = (t: number, amp: number) => {
    for (let i = 0; i < P.count; i++) {
      const k = kk[i] * kk[i] * amp, p = phs[i];
      P.setXYZ(i, base[i * 3] + k * Math.sin(t * 0.9 + p), base[i * 3 + 1] + 0.4 * k * Math.sin(t * 1.3 + p * 1.7), base[i * 3 + 2] + 0.6 * k * Math.cos(t * 0.7 + p));
    }
    P.needsUpdate = true;
  };
  return { mesh, update };
};
/** a fern frond's texture (alpha): a midrib and paired leaflets narrowing to the tip, each with a painted dark edge */
export const fernTex = (fill: string, hi: string, line: string) => paint(128, 512, (g, W, H) => {
  g.clearRect(0, 0, W, H);
  const mid = W / 2, n = 18;
  for (let i = 0; i < n; i++) {
    const k = i / n, y = H * (1 - k) - 8, len = (W * 0.46) * Math.sin(Math.PI * Math.min(0.98, 0.15 + k * 0.85)) * (1 - 0.2 * k), hgt = H / n * 0.75;
    for (const s of [-1, 1]) {
      g.beginPath(); g.moveTo(mid, y); g.quadraticCurveTo(mid + s * len * 0.5, y - hgt * 1.3, mid + s * len, y - hgt * 1.4); g.quadraticCurveTo(mid + s * len * 0.55, y + hgt * 0.1, mid, y + hgt * 0.4); g.closePath();
      g.fillStyle = i % 2 ? fill : hi; g.fill(); g.strokeStyle = line; g.lineWidth = 2; g.stroke();
    }
  }
  g.strokeStyle = line; g.lineWidth = 4; g.beginPath(); g.moveTo(mid, H); g.lineTo(mid, 6); g.stroke();
});
/** a leaf spray texture (alpha): broad leaves (sycamore / ivy / laurel: `kind`) along a stem, painted dark edges */
export const leafSprayTex = (kind: "maple" | "ivy" | "oval", fill: string[], line: string, seed: number) => paint(256, 512, (g, W, H) => {
  const r = rng(seed);
  g.clearRect(0, 0, W, H);
  const leaf = (x: number, y: number, s: number, a: number, col: string) => {
    g.save(); g.translate(x, y); g.rotate(a); g.beginPath();
    if (kind === "oval") { g.ellipse(0, -s * 0.55, s * 0.32, s * 0.6, 0, 0, 7); }
    else {
      const lobes = kind === "maple" ? 5 : 3, pts: [number, number][] = [];
      for (let i = 0; i <= lobes * 2; i++) { const t = i / (lobes * 2), ang = -Math.PI / 2 + (t - 0.5) * (kind === "maple" ? 3.6 : 3.0), rr = i % 2 === 0 ? s : s * (kind === "maple" ? 0.5 : 0.62); pts.push([Math.cos(ang) * rr, Math.sin(ang) * rr - s * 0.15]); }
      g.moveTo(0, 0); for (const [px, py] of pts) g.lineTo(px, py); g.closePath();
    }
    g.fillStyle = col; g.fill(); g.strokeStyle = line; g.lineWidth = 2.2; g.lineJoin = "round"; g.stroke();
    g.strokeStyle = css(line, 0.4); g.lineWidth = 1.4; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -s * 0.8); g.stroke();
    g.restore();
  };
  g.strokeStyle = line; g.lineWidth = 4; g.beginPath(); g.moveTo(W / 2, H); g.quadraticCurveTo(W / 2 + 10, H / 2, W / 2 - 6, 20); g.stroke();
  const n = kind === "maple" ? 9 : 13;
  for (let i = 0; i < n; i++) {
    const k = i / n, y = H * (0.96 - 0.9 * k), s = (kind === "maple" ? 56 : 40) * (0.75 + 0.35 * r()) * (1 - 0.25 * k), side = i % 2 ? 1 : -1;
    leaf(W / 2 + side * (12 + 30 * r()), y, s, side * (0.5 + 0.5 * r()), fill[Math.floor(r() * fill.length)]);
  }
  leaf(W / 2, 30, kind === "maple" ? 48 : 34, 0, fill[0]);
});

// ------------------------------------------------------------------------------------------------ heraldry
/** a plain heraldic shield's outline (flat top, curved sides to a point), w wide and h high, centred on x, top at y */
export const shieldPath = (g: G2, x: number, y: number, w: number, h: number) => {
  g.beginPath(); g.moveTo(x - w / 2, y); g.lineTo(x + w / 2, y); g.lineTo(x + w / 2, y + h * 0.45);
  g.quadraticCurveTo(x + w / 2, y + h * 0.85, x, y + h); g.quadraticCurveTo(x - w / 2, y + h * 0.85, x - w / 2, y + h * 0.45); g.closePath();
};

/** a props-kit Part filled from pieces in one go (NOINK + hull) into `into` */
export const partOf = (K: Kit, into: THREE.Object3D, name: string, pieces: [THREE.Material, THREE.BufferGeometry, number?][]) => {
  const P = new Part(K);
  for (const [m, g, ink] of pieces) P.add(m, g, ink ?? 0.006);
  return P.into(into, name);
};
export const smooth01 = (e0: number, e1: number, x: number) => { const t = clamp((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };

/** a LEAF CLUSTER texture (alpha): a rounded bunch of broad leaves (maple / ivy / oval) with painted dark edges,
 *  lighter leaves toward the top; for crossed-card foliage */
export const leafClusterTex = (kind: "maple" | "ivy" | "oval", fill: string[], hi: string, line: string, seed: number, n = 34) => paint(512, 512, (g, W, H) => {
  const r = rng(seed);
  g.clearRect(0, 0, W, H);
  const leaf = (x: number, y: number, s: number, a: number, col: string) => {
    g.save(); g.translate(x, y); g.rotate(a); g.beginPath();
    if (kind === "oval") g.ellipse(0, -s * 0.55, s * 0.34, s * 0.6, 0, 0, 7);
    else {
      const lobes = kind === "maple" ? 5 : 3;
      g.moveTo(0, 0);
      for (let i = 0; i <= lobes * 2; i++) { const t = i / (lobes * 2), ang = -Math.PI / 2 + (t - 0.5) * (kind === "maple" ? 3.7 : 3.0), rr = i % 2 === 0 ? s : s * (kind === "maple" ? 0.52 : 0.62); g.lineTo(Math.cos(ang) * rr, Math.sin(ang) * rr - s * 0.15); }
      g.closePath();
    }
    g.fillStyle = col; g.fill(); g.strokeStyle = line; g.lineWidth = 3; g.lineJoin = "round"; g.stroke();
    g.strokeStyle = css(line, 0.35); g.lineWidth = 2; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -s * 0.75); g.stroke();
    g.restore();
  };
  // back leaves first (darker), front and top leaves last (lighter)
  for (let i = 0; i < n; i++) {
    const k = i / n, a = r() * 6.28, d = Math.sqrt(r()) * W * 0.36 * (1 - 0.15 * k), x = W / 2 + Math.cos(a) * d, y = H / 2 + Math.sin(a) * d * 0.9;
    const s = W * (0.085 + 0.04 * r()), col = k > 0.7 && y < H * 0.55 ? hi : fill[Math.floor(r() * fill.length)];
    leaf(x, y, s, a + Math.PI / 2 + (r() - 0.5) * 1.2, col);
  }
});
/** crossed vertical cards (3 at 60 degrees) of size s round the point p, into a geometry list (for a Batch) */
export const crossCardsG = (p: THREE.Vector3, s: number, yaw: number, sy = 1) => {
  const out: THREE.BufferGeometry[] = [];
  for (let k = 0; k < 3; k++) out.push(new THREE.PlaneGeometry(s, s * sy).rotateY(yaw + (k * Math.PI) / 3).translate(p.x, p.y, p.z));
  out.push(new THREE.PlaneGeometry(s, s).rotateX(-Math.PI / 2).rotateY(yaw).translate(p.x, p.y + 0.02, p.z));
  return out;
};
