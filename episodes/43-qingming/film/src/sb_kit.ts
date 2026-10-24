// Builder-B helpers for groups 'song' (scenes 09–13) and 'resto' (30–31). Not part of the shared kit.
// - Strip: the painter's canvases on a real plane lying on a table (a THREE.Group tilted about the table's front edge).
//   theta 0 = the paper faces the camera (the full-frame insert), theta ≈ 78° = lying on the table seen from a seated eye.
//   One camera move + one tilt = "pull back from the silk to the desk" (and back), no cut.
// - ScreenLayer: a Live canvas re-placed every frame to cover the screen, so figures / props are drawn in screen px from
//   projected 3D points (contacts stay exact while the camera and the strip move).
// - Materials: plain (with a uv clip), paint-in reveal (lines first, then washes), glyph writing + glow.
import * as THREE from 'three';
import {Stage, Live, D, W, H, mkCanvas, canvasTex, PaintOpts, clamp01, lerp, hash} from './core';
import {FigOpts, P} from './figures';

export type P2 = [number, number];

// ------------------------------------------------------------------------------------------------ materials
const VS = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
const STD = `uniform float uOpacity, uGlowPass, uEmissive, uHeroR; uniform vec2 uHero; uniform vec3 uTint; uniform vec4 uClip; varying vec2 vUv;
float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }`;
const stdU = (emissive = 0, tint = '#ffffff') => ({uOpacity: {value: 1}, uGlowPass: {value: 0}, uEmissive: {value: emissive}, uHero: {value: new THREE.Vector2(960, 540)}, uHeroR: {value: 900},
	uTint: {value: new THREE.Color(tint)}, uClip: {value: new THREE.Vector4(-1, 2, -1, 2)}});
const CLIP = `if (vUv.x < uClip.x || vUv.x > uClip.y || vUv.y < uClip.z || vUv.y > uClip.w) discard;`;
const shader = (uniforms: Record<string, any>, decl: string, body: string, glowExtra = '') => new THREE.ShaderMaterial({
	uniforms, vertexShader: VS, transparent: true, depthWrite: false, depthTest: true,
	fragmentShader: `${STD}\n${decl}\nvoid main(){\n${CLIP}\n${body}\nif (uGlowPass > 0.5) gl_FragColor = vec4(col * uEmissive ${glowExtra}, a); else gl_FragColor = vec4(col, a);\n#include <colorspace_fragment>\n}`,
});
export type Mat = THREE.ShaderMaterial;
/** a plain textured material with tint, opacity, emissive and a uv clip (uClip = x0, x1, y0, y1 in uv) */
export const texMat = (tex: THREE.Texture, emissive = 0, tint = '#ffffff') => shader({...stdU(emissive, tint), map: {value: tex}}, `uniform sampler2D map;`,
	`vec4 c = texture2D(map, vUv); float a = c.a * uOpacity; if (a < 0.003) discard; vec3 col = c.rgb * uTint;`);
/** paint-in: blank silk → ink lines (where the painting is dark) → washes, by an order map (r = reveal time 0..1) */
export const revealMat = (full: THREE.Texture, blank: THREE.Texture, order: THREE.Texture, emissive = 0) => shader(
	{...stdU(emissive), map: {value: full}, blank: {value: blank}, order: {value: order}, uProgL: {value: 0}, uProgW: {value: 0}, uFeath: {value: 0.05}},
	`uniform sampler2D map, blank, order; uniform float uProgL, uProgW, uFeath;`,
	`vec3 f = texture2D(map, vUv).rgb, bk = texture2D(blank, vUv).rgb; float o = texture2D(order, vUv).r;
	float d = clamp((lum(bk) - lum(f)) / max(lum(bk) - 0.01, 0.05), 0.0, 1.0);
	float lineM = smoothstep(0.40, 0.80, d);
	float rl = smoothstep(o, o + uFeath, uProgL), rw = smoothstep(o, o + uFeath, uProgW);
	vec3 col = mix(bk, f, max(rw, rl * lineM)) * uTint; float a = uOpacity;`);
/** glyph writing: order map r = glyph index (255 none), g = y in its box, b = x in its box; uProg = glyphs written (fractional =
 *  the current glyph writes top → bottom); glowT (128×1, r) = per-glyph glow: the ink turns amber and the paper round it lights */
export const glyphMat = (full: THREE.Texture, blank: THREE.Texture, order: THREE.Texture, glowT: THREE.Texture, emissive = 0) => shader(
	{...stdU(emissive), map: {value: full}, blank: {value: blank}, order: {value: order}, glowT: {value: glowT}, uProg: {value: 999}},
	`uniform sampler2D map, blank, order, glowT; uniform float uProg;`,
	`vec3 f = texture2D(map, vUv).rgb, bk = texture2D(blank, vUv).rgb; vec3 og = texture2D(order, vUv).rgb;
	float idx = floor(og.r * 255.0 + 0.5), n = floor(uProg), fr = uProg - n;
	float k = idx > 250.0 ? 0.0 : (idx < n - 0.5 ? 1.0 : (abs(idx - n) < 0.5 ? smoothstep(og.g - 0.05, og.g + 0.03, fr * 1.08) : 0.0));
	vec3 col = mix(bk, f, k);
	float gl = idx > 250.0 ? 0.0 : texture2D(glowT, vec2((idx + 0.5) / 128.0, 0.5)).r * k;
	float rad = length(vec2(og.b, og.g) - 0.5) * 2.0;
	float halo = gl * (1.0 - smoothstep(0.15, 1.3, rad));
	float ink = clamp(1.0 - lum(col) / max(lum(bk), 0.05), 0.0, 1.0);
	col = mix(col, vec3(0.70, 0.33, 0.05) * (0.45 + 0.55 * ink), gl * smoothstep(0.15, 0.6, ink) * 0.92);
	col += vec3(0.20, 0.12, 0.04) * halo * (1.0 - ink);
	col *= uTint; float a = uOpacity;`, `+ vec3(1.0, 0.70, 0.32) * halo * 0.85`);
/** a flat-colour material (for props on the strip) */
export const solidMat = (col: string) => { const c = mkCanvas(4, 4), g = c.getContext('2d')!; g.fillStyle = col; g.fillRect(0, 0, 4, 4); return texMat(canvasTex(c)); };
/** a data texture (n × 1, r channel) for per-glyph glow */
export class GlowData {
	data = new Uint8Array(128 * 4); tex = new THREE.DataTexture(this.data, 128, 1, THREE.RGBAFormat); key = '';
	constructor() { this.tex.magFilter = this.tex.minFilter = THREE.NearestFilter; this.tex.needsUpdate = true; }
	set(vals: (i: number) => number, n = 84) { const v: number[] = []; for (let i = 0; i < n; i++) v.push(Math.round(clamp01(vals(i)) * 255)); const k = v.join(','); if (k === this.key) return; this.key = k; v.forEach((x, i) => (this.data[i * 4] = x)); this.tex.needsUpdate = true; }
}
/** a texture holding data (no colour-space conversion, no mipmaps) */
export const dataTex = (cv: HTMLCanvasElement) => { const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.NoColorSpace; t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; t.magFilter = THREE.LinearFilter; return t; };
/** a hi-quality texture for big canvases */
export const bigTex = (cv: HTMLCanvasElement) => { const t = canvasTex(cv); t.anisotropy = 4; return t; };

// ------------------------------------------------------------------------------------------------ canvases
/** blank silk exactly as the painter's background (ground fill + the same weave overlay) */
export const blankLike = (src: HTMLCanvasElement, weave: (c: HTMLCanvasElement) => void, ground = '#FFF3D8') => {
	const c = mkCanvas(src.width, src.height), g = c.getContext('2d')!; g.fillStyle = ground; g.fillRect(0, 0, c.width, c.height); weave(c); return c;
};
/** crop a canvas region */
export const crop = (src: HTMLCanvasElement, x: number, y: number, w: number, h: number, ow = w, oh = h) => { const c = mkCanvas(Math.round(ow), Math.round(oh)); c.getContext('2d')!.drawImage(src, x, y, w, h, 0, 0, c.width, c.height); return c; };
/** a stroke-order map for paint-in: right→left sweep (from x1 to x0, as fractions) broken into brush-stroke patches */
export const strokeOrder = (w = 1024, h = 384, seed = 7, x0 = 0, x1 = 1, n = 1100) => {
	const c = mkCanvas(w, h), g = c.getContext('2d')!, base = (x: number) => clamp01(((x1 * w) - x) / ((x1 - x0) * w)) * 0.9 + 0.04;
	const gr = g.createLinearGradient(0, 0, w, 0); for (let i = 0; i <= 10; i++) { const v = Math.round(base(i / 10 * w) * 255); gr.addColorStop(i / 10, `rgb(${v},${v},${v})`); } g.fillStyle = gr; g.fillRect(0, 0, w, h);
	const strokes: [number, number, number, number, number, number][] = [];
	for (let i = 0; i < n; i++) { const x = hash(seed + i * 3.1) * w, y = hash(seed + i * 7.3) * h, L = 20 + hash(i * 1.7 + seed) * 90, a = (hash(i * 5.9) - 0.5) * 1.1, wd = 6 + hash(i * 2.3) * 26;
		strokes.push([x, y, L, a, wd, clamp01(base(x) + (hash(i * 9.1) - 0.5) * 0.12)]); }
	strokes.sort((p, q) => q[5] - p[5]);
	g.lineCap = 'round';
	for (const [x, y, L, a, wd, v] of strokes) { const s = Math.round(v * 255); g.strokeStyle = `rgb(${s},${s},${s})`; g.lineWidth = wd; g.beginPath(); g.moveTo(x - Math.cos(a) * L / 2, y - Math.sin(a) * L / 2); g.lineTo(x + Math.cos(a) * L / 2, y + Math.sin(a) * L / 2); g.stroke(); }
	const o = mkCanvas(w, h), og = o.getContext('2d')!; og.filter = 'blur(1.5px)'; og.drawImage(c, 0, 0); return o;
};
/** the glyph order map for glyph boxes given in a canvas of size (cw, ch); the map is (cw/ds, ch/ds) */
export const glyphOrder = (glyphs: {i: number; x: number; y: number; size: number}[], cw: number, ch: number, ds = 2, ox = 0, oy = 0) => {
	const w = Math.round(cw / ds), h = Math.round(ch / ds), c = mkCanvas(w, h), g = c.getContext('2d')!, id = g.createImageData(w, h), d = id.data;
	for (let i = 0; i < w * h; i++) { d[i * 4] = 255; d[i * 4 + 3] = 255; }
	for (const gl of glyphs) {
		const half = gl.size * 0.62, x0 = Math.max(0, Math.floor((gl.x - ox - half) / ds)), x1 = Math.min(w - 1, Math.ceil((gl.x - ox + half) / ds)), y0 = Math.max(0, Math.floor((gl.y - oy - half) / ds)), y1 = Math.min(h - 1, Math.ceil((gl.y - oy + half) / ds));
		for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const k = (y * w + x) * 4, fy = (y - y0) / Math.max(1, y1 - y0), fx = (x - x0) / Math.max(1, x1 - x0);
			d[k] = gl.i; d[k + 1] = Math.round(clamp01(fy * 0.9 + (1 - fx) * 0.1) * 255); d[k + 2] = Math.round(fx * 255); }
	}
	g.putImageData(id, 0, 0); return c;
};
/** a roller / roll seen lying across the paper: a cylinder shaded across x, knob ends at both ends (canvas 64 × 512) */
export const rollerCanvas = (body = ['#9C8462', '#FFF3D8', '#B8A27E'], mount = '#34506A', knob = '#EADCC0') => {
	const c = mkCanvas(64, 512), g = c.getContext('2d')!, gr = g.createLinearGradient(0, 0, 64, 0);
	gr.addColorStop(0, body[0]); gr.addColorStop(0.42, body[1]); gr.addColorStop(1, body[2]); g.fillStyle = gr; g.beginPath(); g.roundRect(4, 26, 56, 460, 10); g.fill();
	g.fillStyle = mount; g.fillRect(4, 26, 56, 26); g.fillRect(4, 460, 56, 26);
	g.fillStyle = knob; g.beginPath(); g.roundRect(14, 2, 36, 30, 8); g.fill(); g.beginPath(); g.roundRect(14, 480, 36, 30, 8); g.fill();
	return c;
};
/** a wood plank texture (table tops), lit a little toward its centre */
export const woodCanvas = (w = 1024, h = 256, base = '#3a2c20', dark = '#2a2018', seed = 3) => {
	const c = mkCanvas(w, h), g = c.getContext('2d')!; g.fillStyle = base; g.fillRect(0, 0, w, h);
	for (let i = 0; i < 70; i++) { const y = hash(seed + i) * h, a = 0.05 + hash(i * 3.3) * 0.08; g.strokeStyle = `rgba(20,14,10,${a})`; g.lineWidth = 1 + hash(i * 1.9) * 2; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + 4, w * 0.6, y - 5, w, y + 2); g.stroke(); }
	const v = g.createLinearGradient(0, 0, 0, h); v.addColorStop(0, dark); v.addColorStop(0.2, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = v; g.fillRect(0, 0, w, h);
	return c;
};
/** a soft radial glow sprite (for halos on an emissive plane) */
export const glowCanvas = (col = '255,214,150', n = 256) => { const c = mkCanvas(n, n), g = c.getContext('2d')!, gr = g.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
	gr.addColorStop(0, `rgba(${col},1)`); gr.addColorStop(0.4, `rgba(${col},.4)`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.fillRect(0, 0, n, n); return c; };

// ------------------------------------------------------------------------------------------------ the strip
export class Strip {
	g = new THREE.Group(); theta = 0;
	/** x0 / yEdge: frame px (depth 0) of the strip's local origin = the left end of the table's front edge; z0 world depth */
	constructor(public st: Stage, public x0: number, public yEdge: number, public z0 = 0) { this.g.position.set(x0 - W / 2, H / 2 - yEdge, z0); st.scene.add(this.g); }
	/** add a plane at local px: x right from the origin, y up (away) from the front edge, lz toward the camera at theta 0 */
	plane(mat: Mat | THREE.ShaderMaterial, lx: number, ly: number, w: number, h: number, lz = 0, order = 0) {
		const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(lx + w / 2, ly + h / 2, lz); m.renderOrder = order; this.g.add(m);
		if (!this.st.mats.includes(mat)) this.st.mats.push(mat); return m;
	}
	place(m: THREE.Mesh, lx: number, ly: number, w: number, h: number, lz = 0) { const gp = m.geometry as THREE.PlaneGeometry; const pw = gp.parameters.width, ph = gp.parameters.height; m.scale.set(w / pw, h / ph, 1); m.position.set(lx + w / 2, ly + h / 2, lz); }
	tilt(theta: number) { this.theta = theta; this.g.rotation.x = -theta; this.g.updateMatrixWorld(true); }
	world(lx: number, ly: number, lz = 0) { return this.g.localToWorld(new THREE.Vector3(lx, ly, lz)); }
	/** screen px of a local point under the stage's current camera */
	screen(lx: number, ly: number, lz = 0): P2 { const v = this.st.toScreen(this.world(lx, ly, lz)); return [v.x, v.y]; }
}

// ------------------------------------------------------------------------------------------------ screen-space layers + projection
export class ScreenLayer {
	live: Live;
	constructor(public st: Stage, name: string, public z = 0, o: PaintOpts = {}, order = 0) { this.live = new Live(st, name, W / 2, H / 2, W, H, z, o, 1, order); }
	fit() { const c = this.st.cam, L = this.live.L, s = (c.position.z - this.z) / (D - this.z); L.mesh.position.set(c.position.x, c.position.y, this.z); L.mesh.scale.set(s, s, 1); }
	draw(key: string, f: (g: CanvasRenderingContext2D) => void) { this.fit(); this.live.draw(key, f); }
	get mat() { return this.live.L.mat; }
}
/** screen px of frame px (x, y) at depth z under the current camera */
export const proj = (st: Stage, x: number, y: number, z = 0): P2 => { const v = st.toScreen(st.at(x, y, z)); return [v.x, v.y]; };
/** screen scale at depth z (1 = rest) */
export const scaleAt = (st: Stage, x: number, y: number, z: number) => { const a = proj(st, x, y, z), c = proj(st, x, y - 100, z); return (a[1] - c[1]) / 100; };
/** a figure placed in frame px at depth z → the same figure in screen px (for ScreenLayer casts) */
export const onScreen = (st: Stage, o: FigOpts, z: number): FigOpts => { const [sx, sy] = proj(st, o.x, o.ground, z), k = scaleAt(st, o.x, o.ground, z); return {...o, x: sx, ground: sy, h: o.h * k}; };

// ------------------------------------------------------------------------------------------------ small drawing helpers
export const ink = '#2A1F17', SIL = '#15100C';
/** a brush in the hand: from the grip to the tip */
export const drawBrush = (g: CanvasRenderingContext2D, grip: P2, tip: P2, w = 5) => {
	const dx = tip[0] - grip[0], dy = tip[1] - grip[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
	const top: P2 = [grip[0] - dx * 0.55, grip[1] - dy * 0.55];
	g.fillStyle = SIL; g.beginPath(); g.moveTo(top[0] + nx * w * 0.45, top[1] + ny * w * 0.45); g.lineTo(tip[0] - dx * 0.18 + nx * w * 0.55, tip[1] - dy * 0.18 + ny * w * 0.55);
	g.quadraticCurveTo(tip[0] + nx * w * 0.2, tip[1] + ny * w * 0.2, tip[0], tip[1]); g.quadraticCurveTo(tip[0] - nx * w * 0.2, tip[1] - ny * w * 0.2, tip[0] - dx * 0.18 - nx * w * 0.55, tip[1] - dy * 0.18 - ny * w * 0.55);
	g.lineTo(top[0] - nx * w * 0.45, top[1] - ny * w * 0.45); g.closePath(); g.fill();
};
/** ease between keyed values: keys [[t, v], …] (smooth between neighbours) */
export const keyed = (t: number, keys: [number, number][], ease = (u: number) => u * u * (3 - 2 * u)) => {
	if (t <= keys[0][0]) return keys[0][1]; for (let i = 1; i < keys.length; i++) if (t < keys[i][0]) { const [a, va] = keys[i - 1], [z, vz] = keys[i]; return lerp(va, vz, ease((t - a) / (z - a))); } return keys[keys.length - 1][1];
};
export const lerpP = (a: P2, c: P2, u: number): P2 => [lerp(a[0], c[0], u), lerp(a[1], c[1], u)];
export {lerp, clamp01};
export type {P};
