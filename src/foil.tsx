/* 镭射纸雕 · materials and cut-outs. Every object is a flat paper/foil cut-out with a little thickness,
   standing in depth so the camera's moves give parallax and the coloured club light rakes across the foil. */
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';

const tex = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, srgb = false) => {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d')!);
  const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; return t;
};
let rs = 9; const rnd = () => { rs = (rs * 16807) % 2147483647; return rs / 2147483647; };

/** a diffraction-grating emboss: fine concentric rings, so the foil breaks light into moving bands */
let _grating: THREE.Texture | null = null;
const grating = () => _grating ?? (_grating = tex(1024, 1024, (g) => {
  g.fillStyle = '#808080'; g.fillRect(0, 0, 1024, 1024);
  for (let r = 2; r < 1500; r += 3) { g.strokeStyle = `rgba(${r % 6 ? 255 : 0},${r % 6 ? 255 : 0},${r % 6 ? 255 : 0},0.35)`; g.lineWidth = 1.5; g.beginPath(); g.arc(-200, -200, r, 0, Math.PI * 2); g.stroke(); }
  for (let i = 0; i < 3000; i++) { g.fillStyle = `rgba(255,255,255,${rnd() * 0.12})`; g.fillRect(rnd() * 1024, rnd() * 1024, 2, 2); }
}));
/** paper tooth */
let _tooth: THREE.Texture | null = null;
const tooth = () => _tooth ?? (_tooth = tex(512, 512, (g) => { g.fillStyle = '#808080'; g.fillRect(0, 0, 512, 512); for (let i = 0; i < 40000; i++) { const v = Math.floor(100 + rnd() * 60); g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(rnd() * 512, rnd() * 512, 2, 2); } }));

/** the holographic foil: a rainbow that slides as the camera and the light move. One shared clock. */
export const HOLO_T = { value: 0 };
export const holoMat = (tint: string, k: number, mask: THREE.Texture | null = null) => new THREE.ShaderMaterial({
  uniforms: { time: HOLO_T, tint: { value: new THREE.Color(tint) }, k: { value: k }, mask: { value: mask }, useMask: { value: mask ? 1 : 0 } },
  transparent: !!mask, depthWrite: !mask,
  vertexShader: `varying vec3 vW; varying vec3 vN; varying vec2 vUv; void main(){ vUv = uv; vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * w; }`,
  fragmentShader: `uniform float time; uniform vec3 tint; uniform float k; uniform sampler2D mask; uniform float useMask; varying vec3 vW; varying vec3 vN; varying vec2 vUv;
    void main(){
      float alpha = 1.0; if (useMask > 0.5) { alpha = texture2D(mask, vUv).a; if (alpha < 0.02) discard; }
      vec3 V = normalize(cameraPosition - vW); vec3 N = normalize(vN);
      float grat = sin(length(vW.xy - vec2(-0.6, 1.2)) * 420.0) * 0.5 + 0.5;
      float phase = dot(V, vec3(0.9, 0.55, 0.25)) * 3.2 + vW.x * 1.7 + vW.y * 1.1 + grat * 0.12 + time * 0.18;
      vec3 rainbow = 0.5 + 0.5 * cos(6.28318 * (phase + vec3(0.0, 0.33, 0.67)));
      float band = pow(0.5 + 0.5 * sin(phase * 9.0), 8.0);
      float fres = pow(1.0 - abs(dot(N, V)), 3.0);
      vec3 silver = vec3(0.72, 0.74, 0.8) * tint;
      vec3 c = mix(silver * 0.55, rainbow, 0.72) * (0.45 + 1.2 * band) + fres * 0.6;
      gl_FragColor = vec4(c * k, alpha);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`,
});
export type Kind = 'holo' | 'gold' | 'chrome' | 'black' | 'lacquer' | 'paper' | 'glow' | 'rosegold';
const cache = new Map<string, THREE.Material>();
export const mat = (kind: Kind, color = '#ffffff', extra = 0): THREE.Material => {
  const key = `${kind}|${color}|${extra}`; const hit = cache.get(key); if (hit) return hit;
  let m: THREE.Material;
  switch (kind) {
    case 'holo': m = holoMat(color, 1 + extra); break;
    case 'gold': m = new THREE.MeshPhysicalMaterial({ color: color === '#ffffff' ? '#f0c46a' : color, metalness: 1, roughness: 0.24, iridescence: 0.35, iridescenceIOR: 1.4, iridescenceThicknessRange: [300, 500], bumpMap: tooth(), bumpScale: 0.15 }); break;
    case 'rosegold': m = new THREE.MeshPhysicalMaterial({ color: '#f2a88a', metalness: 1, roughness: 0.22, iridescence: 0.5, iridescenceIOR: 1.5, iridescenceThicknessRange: [250, 600] }); break;
    case 'chrome': m = new THREE.MeshPhysicalMaterial({ color: '#f4f6ff', metalness: 1, roughness: 0.06 }); break;
    case 'black': m = new THREE.MeshPhysicalMaterial({ color: color === '#ffffff' ? '#0a0910' : color, roughness: 0.92, sheen: 0.6, sheenColor: new THREE.Color('#5a4a8a'), sheenRoughness: 0.5, bumpMap: tooth(), bumpScale: 0.3 }); break;
    case 'lacquer': m = new THREE.MeshPhysicalMaterial({ color, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.04, iridescence: 0.25, iridescenceIOR: 1.3, bumpMap: tooth(), bumpScale: 0.08 }); break;
    case 'paper': m = new THREE.MeshStandardMaterial({ color: color === '#ffffff' ? '#efe6d2' : color, roughness: 0.95, bumpMap: tooth(), bumpScale: 0.2 }); break;
    case 'glow': m = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(1 + extra), toneMapped: false }); break;
  }
  cache.set(key, m!); return m!;
};

/** SVG path (y down, px) → extruded shapes; one cut-out */
const geoCache = new Map<string, THREE.BufferGeometry>();
export const cutGeo = (d: string, depth = 0.006, bevel = 0.0016) => {
  const key = `${d}|${depth}|${bevel}`; const hit = geoCache.get(key); if (hit) return hit;
  const data = new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${d}"/></svg>`);
  const shapes = data.paths.flatMap((p) => SVGLoader.createShapes(p));
  const g = new THREE.ExtrudeGeometry(shapes, { depth: depth * 1000, bevelEnabled: bevel > 0, bevelThickness: bevel * 1000, bevelSize: bevel * 1000 * 0.8, bevelSegments: 2, curveSegments: 24 });
  g.scale(0.001, -0.001, 0.001); g.computeVertexNormals();
  geoCache.set(key, g); return g;
};

/** a cut-out: d in px (1 px = 1 mm), placed at position (m), uniform scale */
export const Cut: React.FC<{ d: string; kind: Kind; color?: string; depth?: number; bevel?: number; glow?: number; shadow?: boolean } & JSX.IntrinsicElements['group']> =
  ({ d, kind, color, depth, bevel, glow = 0, shadow = true, ...g }) => {
    const geo = useMemo(() => cutGeo(d, depth, bevel), [d, depth, bevel]);
    return <group {...g}><mesh geometry={geo} material={mat(kind, color, glow)} castShadow={shadow} receiveShadow={shadow} /></group>;
  };

/* ------------------------------------------------------------------ path helpers (px, y down) */
export const rect = (x: number, y: number, w: number, h: number) => `M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`;
export const circle = (cx: number, cy: number, r: number) => `M ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} Z`;
/** ring = outer circle with an inner hole (counter-wound) */
export const ring = (cx: number, cy: number, r0: number, r1: number) => `${circle(cx, cy, r1)} M ${cx + r0} ${cy} A ${r0} ${r0} 0 1 1 ${cx - r0} ${cy} A ${r0} ${r0} 0 1 1 ${cx + r0} ${cy} Z`;
/** a deco arch frame: outer arch with an inner arch hole */
export const archFrame = (w: number, h: number, t: number) => {
  const o = (W: number, H: number, ox: number, oy: number, cw: boolean) => {
    const r = W / 2; const sweep = cw ? 1 : 0;
    return cw ? `M ${ox} ${oy + H} L ${ox} ${oy + r} A ${r} ${r} 0 0 ${sweep} ${ox + W} ${oy + r} L ${ox + W} ${oy + H} Z`
      : `M ${ox + W} ${oy + H} L ${ox + W} ${oy + r} A ${r} ${r} 0 0 0 ${ox} ${oy + r} L ${ox} ${oy + H} Z`;
  };
  return `${o(w, h, -w / 2, -h, true)} ${o(w - 2 * t, h - t, -w / 2 + t, -h + t, false)}`;
};
/** n thin rays from the origin between angles (radians, 0 = right, y down) */
export const rays = (n: number, r0: number, r1: number, a0: number, a1: number, wid = 0.012) =>
  Array.from({ length: n }, (_, i) => { const a = a0 + (i / (n - 1)) * (a1 - a0), w = wid * (i % 2 ? 0.55 : 1);
    const p = (r: number, s: number) => `${(Math.cos(a + s) * r).toFixed(1)} ${(Math.sin(a + s) * r).toFixed(1)}`;
    return `M ${p(r0, -w * 0.3)} L ${p(r1, -w)} L ${p(r1, w)} L ${p(r0, w * 0.3)} Z`; }).join(' ');

/* ------------------------------------------------------------------ the hero bag, as layered cut-outs (our design) */
export const BAG = {
  body: 'M -142 0 Q -160 0 -158 -18 L -132 -202 Q -130 -220 -112 -220 L 112 -220 Q 130 -220 132 -202 L 158 -18 Q 160 0 142 0 Z',
  flap: 'M -136 -222 L 136 -222 L 138 -150 Q 122 -88 0 -84 Q -122 -88 -138 -150 Z',
  handle: 'M -86 -222 C -86 -350, 86 -350, 86 -222 L 70 -222 C 70 -330, -70 -330, -70 -222 Z',
  clasp: 'M -34 -108 L 34 -108 L 34 -86 L -34 -86 Z',
  tag: 'M -20 -26 L 20 -26 L 20 26 L -20 26 Z M 4 -16 A 4 4 0 1 0 -4 -16 A 4 4 0 1 0 4 -16 Z',
};
const stitchPath = (pts: [number, number][], dash = 7, gap = 6, w = 2.2) => {
  const segs: string[] = []; let carry = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], L = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / L, uy = (y1 - y0) / L, nx = -uy * w / 2, ny = ux * w / 2;
    for (let s = carry; s < L; s += dash + gap) { const e = Math.min(L, s + dash); const ax = x0 + ux * s, ay = y0 + uy * s, bx = x0 + ux * e, by = y0 + uy * e;
      segs.push(`M ${(ax + nx).toFixed(1)} ${(ay + ny).toFixed(1)} L ${(bx + nx).toFixed(1)} ${(by + ny).toFixed(1)} L ${(bx - nx).toFixed(1)} ${(by - ny).toFixed(1)} L ${(ax - nx).toFixed(1)} ${(ay - ny).toFixed(1)} Z`); }
    carry = 0;
  }
  return segs.join(' ');
};
const q = (a: [number, number], c: [number, number], b: [number, number], n = 14): [number, number][] => Array.from({ length: n + 1 }, (_, i) => { const u = i / n, v = 1 - u; return [v * v * a[0] + 2 * v * u * c[0] + u * u * b[0], v * v * a[1] + 2 * v * u * c[1] + u * u * b[1]]; });
const flapCurve = (): [number, number][] => [[-126, -212], ...q([-127, -150], [-114, -100], [0, -96]), ...q([0, -96], [114, -100], [127, -150]).slice(1), [126, -212]];
export const STITCH = {
  flap: stitchPath(flapCurve()),
  body: stitchPath([[-128, -12], [-145, -26], [-126, -192]]) + ' ' + stitchPath([[128, -12], [145, -26], [126, -192]]) + ' ' + stitchPath([[-128, -10], [128, -10]]),
};

export const HeroBag: React.FC<{ swing?: number; leather?: string; stitch?: Kind; stitchColor?: string; glowStitch?: number; tag?: boolean } & JSX.IntrinsicElements['group']> =
  ({ swing = 0, leather = '#6e0818', stitch = 'gold', stitchColor, glowStitch = 0, tag = true, ...g }) => (
    <group {...g}>
      {/* layers 6 mm apart, so they throw shadows on one another */}
      <Cut d={BAG.handle} kind="lacquer" color={leather} position={[0, 0, -0.012]} />
      <Cut d={BAG.body} kind="lacquer" color={leather} />
      <Cut d={STITCH.body} kind={glowStitch ? 'glow' : stitch} color={stitchColor} glow={glowStitch} depth={0.001} bevel={0} position={[0, 0, 0.0085]} shadow={false} />
      <Cut d={BAG.flap} kind="lacquer" color={leather} position={[0, 0, 0.012]} />
      <Cut d={STITCH.flap} kind={glowStitch ? 'glow' : stitch} color={stitchColor} glow={glowStitch} depth={0.001} bevel={0} position={[0, 0, 0.0205]} shadow={false} />
      <Cut d={BAG.clasp} kind="gold" position={[0, 0, 0.022]} />
      {[-78, 78].map((x) => <Cut key={x} d={ring(x, -222, 7, 12)} kind="gold" position={[0, 0, 0.006]} />)}
      {[-120, 120].map((x) => <Cut key={x} d={`M ${x - 10} 0 L ${x + 10} 0 L ${x + 7} 6 L ${x - 7} 6 Z`} kind="gold" />)}
      {tag && <group position={[0.078, 0.222, 0.026]} rotation={[0, 0, (-swing * Math.PI) / 180]}>
        {Array.from({ length: 6 }, (_, i) => <Cut key={i} d={ring(0, 0, 2.2, 3.6)} kind="gold" depth={0.0015} bevel={0} position={[0.004 + i * 0.005, -0.008 - i * 0.009, 0]} shadow={false} />)}
        <Cut d={BAG.tag} kind="holo" position={[0.036, -0.076, 0]} scale={1.15} />
      </group>}
    </group>
  );
