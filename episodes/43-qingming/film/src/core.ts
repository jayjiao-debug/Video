// ep43 engine core: 2.5D silhouette stages in three.js, rim light from the hero, selective bloom, a two-stage
// compositor with motivated transition masks. Frame coordinates are 1920×1080 px (x right, y down); a layer authored in
// frame px at depth z keeps its framing when the camera is at rest, and gains parallax when the camera moves.
import * as THREE from 'three';

export const W = 1920, H = 1080, D = 1600;           // camera distance for depth 0
export const FOV = (2 * Math.atan(H / 2 / D) * 180) / Math.PI;
export const BPM = 106, BEAT = 60 / BPM, BAR = 4 * BEAT, BAR0 = 1.4498;
/** film time of bar j (fractional bars allowed: 3.5 = bar 3 beat 3) */
export const bar = (j: number) => BAR0 + j * BAR;
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
export const smooth = (u: number) => { u = clamp01(u); return u * u * (3 - 2 * u); };
export const easeOut = (u: number) => 1 - Math.pow(1 - clamp01(u), 3);
export const easeIn = (u: number) => Math.pow(clamp01(u), 3);
export const easeInOut = (u: number) => { u = clamp01(u); return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; };
/** 0→1 over [a,b] with easing */
export const ramp = (t: number, a: number, b: number, e: (u: number) => number = smooth) => e((t - a) / Math.max(1e-6, b - a));
/** deterministic hash noise */
export const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
export const hex = (c: string) => new THREE.Color(c);

// ---------------------------------------------------------------------------------------------------------- renderer
export let renderer: THREE.WebGLRenderer;
export const initRenderer = (canvas: HTMLCanvasElement) => {
	renderer = new THREE.WebGLRenderer({canvas, antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance'});
	renderer.setPixelRatio(1); renderer.setSize(W, H, false);
	renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.NoToneMapping;
	renderer.autoClear = true;
	return renderer;
};

// ---------------------------------------------------------------------------------------------------------- textures
export const canvasTex = (cv: HTMLCanvasElement | OffscreenCanvas) => {
	const t = new THREE.CanvasTexture(cv as any); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
	t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter; t.generateMipmaps = true; return t;
};
export const mkCanvas = (w: number, h: number) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
/** rasterise an SVG document string (with its own width/height/viewBox) to a canvas at scale s */
export const svgToCanvas = (svg: string, w: number, h: number, s = 1): Promise<HTMLCanvasElement> => new Promise((res, rej) => {
	const img = new Image(); const url = URL.createObjectURL(new Blob([svg], {type: 'image/svg+xml'}));
	img.onload = () => { const c = mkCanvas(Math.round(w * s), Math.round(h * s)); const g = c.getContext('2d')!; g.drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url); res(c); };
	img.onerror = (e) => { URL.revokeObjectURL(url); rej(new Error('svg raster failed ' + svg.slice(0, 200))); };
	img.src = url;
});
/** wrap SVG body markup in a document of the given frame size */
export const svgDoc = (body: string, w = W, h = H, defs = '', ox = 0, oy = 0) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${ox} ${oy} ${w} ${h}">${defs ? `<defs>${defs}</defs>` : ''}${body}</svg>`;
/** vertical gradient canvas from stops [[offset 0..1, '#hex'], …] */
export const gradCanvas = (stops: [number, string][], w = 64, h = 1024) => {
	const c = mkCanvas(w, h), g = c.getContext('2d')!, gr = g.createLinearGradient(0, 0, 0, h);
	for (const [o, col] of stops) gr.addColorStop(o, col); g.fillStyle = gr; g.fillRect(0, 0, w, h); return c;
};

// ---------------------------------------------------------------------------------------------------------- paint material
const VS = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
const FS = `
uniform sampler2D map; uniform float uOpacity; uniform vec3 uTint; uniform vec4 uFog;
uniform vec3 uRimCol; uniform float uRimAmt; uniform vec2 uHero; uniform float uHeroR; uniform vec2 uRimW;
uniform float uGlowPass; uniform float uEmissive; uniform float uRimGlow; uniform vec2 uRes;
varying vec2 vUv;
void main(){
	vec4 c = texture2D(map, vUv);
	float a = c.a * uOpacity;
	if (a < 0.003) discard;
	vec3 col = c.rgb * uTint;
	col = mix(col, uFog.rgb, uFog.a);
	float rim = 0.0;
	if (uRimAmt > 0.0) {
		vec2 fp = gl_FragCoord.xy * (1920.0 / uRes.x);
		vec2 d = uHero - fp; float dist = length(d); vec2 dir = d / max(dist, 1.0);
		float a2 = texture2D(map, vUv + dir * uRimW).a;
		float a3 = texture2D(map, vUv + dir * uRimW * 0.5).a;
		float edge = c.a * (1.0 - min(a2, a3));
		float fall = 1.0 - smoothstep(0.0, uHeroR, dist);
		rim = clamp(edge * uRimAmt * fall * 1.6, 0.0, 1.0);
		col = mix(col, uRimCol, rim);
	}
	if (uGlowPass > 0.5) gl_FragColor = vec4(col * uEmissive + uRimCol * rim * uRimGlow, a);
	else gl_FragColor = vec4(col, a);
	#include <colorspace_fragment>
}`;
export type PaintOpts = {opacity?: number; tint?: string; fog?: [string, number]; rim?: number; rimPx?: number; emissive?: number; rimGlow?: number; depthWrite?: boolean; blending?: THREE.Blending};
export const paintMat = (tex: THREE.Texture, w: number, h: number, o: PaintOpts = {}) => {
	const rimPx = o.rimPx ?? 7;
	return new THREE.ShaderMaterial({
		uniforms: {
			map: {value: tex}, uOpacity: {value: o.opacity ?? 1}, uTint: {value: hex(o.tint ?? '#ffffff')},
			uFog: {value: new THREE.Vector4(...(hex(o.fog?.[0] ?? '#000000').toArray() as [number, number, number]), o.fog?.[1] ?? 0)},
			uRimCol: {value: hex('#FFD58F')}, uRimAmt: {value: o.rim ?? 0}, uHero: {value: new THREE.Vector2(1250, 480)}, uHeroR: {value: 900},
			uRimW: {value: new THREE.Vector2(rimPx / w, rimPx / h)}, uGlowPass: {value: 0}, uEmissive: {value: o.emissive ?? 0}, uRimGlow: {value: o.rimGlow ?? 0.25},
			uRes: {value: new THREE.Vector2(W, H)},
		},
		vertexShader: VS, fragmentShader: FS, transparent: true, depthWrite: o.depthWrite ?? false, depthTest: true, blending: o.blending ?? THREE.NormalBlending,
	});
};

// ---------------------------------------------------------------------------------------------------------- stage
/** A layer: a textured plane authored in frame px at a depth. */
export type Layer = {mesh: THREE.Mesh; mat: THREE.ShaderMaterial; z: number; cx: number; cy: number; w: number; h: number; name: string};
export class Stage {
	scene = new THREE.Scene(); cam = new THREE.PerspectiveCamera(FOV, W / H, 10, 40000);
	layers: Layer[] = []; mats: THREE.ShaderMaterial[] = []; hero = new THREE.Vector2(1250, 480); heroR = 900;
	extras: THREE.Object3D[] = [];
	constructor(public name: string) { this.cam.position.set(0, 0, D); this.cam.lookAt(0, 0, 0); }
	/** world position for frame px at depth z, so that it frames the same at rest */
	at(px: number, py: number, z: number) { const s = (D - z) / D; return new THREE.Vector3((px - W / 2) * s, (H / 2 - py) * s, z); }
	/** add a texture as a plane: (cx,cy) centre and (w,h) size in frame px as seen from the rest camera */
	add(name: string, tex: THREE.Texture, cx: number, cy: number, w: number, h: number, z: number, o: PaintOpts = {}, order = 0) {
		const s = (D - z) / D, mat = paintMat(tex, w, h, o);
		const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w * s, h * s), mat);
		mesh.position.copy(this.at(cx, cy, z)); mesh.renderOrder = order || Math.round(z); this.scene.add(mesh);
		const L = {mesh, mat, z, cx, cy, w, h, name}; this.layers.push(L); this.mats.push(mat); return L;
	}
	/** move an existing layer to new frame px centre (keeps depth) */
	place(L: Layer, cx: number, cy: number, scale = 1, rot = 0) { L.mesh.position.copy(this.at(cx, cy, L.z)); L.mesh.scale.setScalar(scale); L.mesh.rotation.z = rot; L.cx = cx; L.cy = cy; }
	get(name: string) { return this.layers.find((l) => l.name === name)!; }
	/** camera: x,y = frame px the camera centres on (960,540 = rest), zoom = 1 rest (2 = twice as close at depth 0), roll in rad */
	setCam(x = W / 2, y = H / 2, zoom = 1, roll = 0, tiltX = 0) {
		const d = D / zoom, p = new THREE.Vector3(x - W / 2, H / 2 - y, 0);
		this.cam.position.set(p.x, p.y + tiltX * d, d); this.cam.up.set(Math.sin(roll), Math.cos(roll), 0); this.cam.lookAt(p.x, p.y, 0);
		this.cam.updateMatrixWorld(true);
	}
	/** project a world point to frame px */
	toScreen(v: THREE.Vector3) { const p = v.clone().project(this.cam); return new THREE.Vector2((p.x + 1) / 2 * W, (1 - p.y) / 2 * H); }
	setHero(px: number, py: number, r = 900) { this.hero.set(px, py); this.heroR = r; }
	/** hero given at a depth: converted to its on-screen position under the current camera */
	heroAt(px: number, py: number, z: number, r = 900) { const s = this.toScreen(this.at(px, py, z)); this.setHero(s.x, s.y, r); }
}

// ---------------------------------------------------------------------------------------------------------- bloom + compositor
const QUAD_VS = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
const quadScene = new THREE.Scene(), quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2)); quadScene.add(quad);
const runQuad = (mat: THREE.Material, target: THREE.WebGLRenderTarget | null) => { quad.material = mat; renderer.setRenderTarget(target); renderer.render(quadScene, quadCam); };
const blurMat = new THREE.ShaderMaterial({uniforms: {tex: {value: null}, dir: {value: new THREE.Vector2()}}, vertexShader: QUAD_VS, depthTest: false, depthWrite: false,
	fragmentShader: `uniform sampler2D tex; uniform vec2 dir; varying vec2 vUv;
	void main(){ vec3 s = texture2D(tex, vUv).rgb * 0.2270270270;
	s += texture2D(tex, vUv + dir * 1.3846153846).rgb * 0.3162162162; s += texture2D(tex, vUv - dir * 1.3846153846).rgb * 0.3162162162;
	s += texture2D(tex, vUv + dir * 3.2307692308).rgb * 0.0702702703; s += texture2D(tex, vUv - dir * 3.2307692308).rgb * 0.0702702703;
	gl_FragColor = vec4(s, 1.0); }`});
const copyMat = new THREE.ShaderMaterial({uniforms: {tex: {value: null}}, vertexShader: QUAD_VS, depthTest: false, depthWrite: false, fragmentShader: `uniform sampler2D tex; varying vec2 vUv; void main(){ gl_FragColor = texture2D(tex, vUv); }`});
const rt = (w: number, h: number) => new THREE.WebGLRenderTarget(w, h, {type: THREE.HalfFloatType, samples: 0, colorSpace: THREE.LinearSRGBColorSpace});
type Slot = {base: THREE.WebGLRenderTarget; glow: THREE.WebGLRenderTarget; mips: [THREE.WebGLRenderTarget, THREE.WebGLRenderTarget][]};
const mkSlot = (): Slot => ({base: new THREE.WebGLRenderTarget(W, H, {samples: 4, type: THREE.HalfFloatType}), glow: rt(W / 2, H / 2), mips: [[rt(W / 2, H / 2), rt(W / 2, H / 2)], [rt(W / 4, H / 4), rt(W / 4, H / 4)], [rt(W / 8, H / 8), rt(W / 8, H / 8)], [rt(W / 16, H / 16), rt(W / 16, H / 16)]]});
let slots: Slot[] = [];
export const initPost = () => { slots = [mkSlot(), mkSlot()]; };
const blackBg = new THREE.Color('#000000');
/** render a stage (base + glow pass) into slot k; bloom mips blurred */
export const renderStage = (st: Stage, k: number, bloom = 1) => {
	const s = slots[k];
	for (const m of st.mats) { m.uniforms.uHero.value.copy(st.hero); m.uniforms.uHeroR.value = st.heroR; m.uniforms.uGlowPass.value = 0; }
	st.scene.background = null; renderer.setClearColor(0x000000, 1);
	renderer.setRenderTarget(s.base); renderer.clear(); renderer.render(st.scene, st.cam);
	if (bloom > 0) {
		for (const m of st.mats) m.uniforms.uGlowPass.value = 1;
		const hidden: THREE.Object3D[] = []; for (const o of st.extras) if (o.visible && !(o as any).userData.glow) { o.visible = false; hidden.push(o); }
		renderer.setRenderTarget(s.glow); renderer.setClearColor(blackBg, 1); renderer.clear(); renderer.render(st.scene, st.cam);
		for (const o of hidden) o.visible = true;
		for (const m of st.mats) m.uniforms.uGlowPass.value = 0;
		let src: THREE.Texture = s.glow.texture;
		for (const [a, b] of s.mips) {
			copyMat.uniforms.tex.value = src; runQuad(copyMat, a);
			blurMat.uniforms.tex.value = a.texture; blurMat.uniforms.dir.value.set(1 / a.width, 0); runQuad(blurMat, b);
			blurMat.uniforms.tex.value = b.texture; blurMat.uniforms.dir.value.set(0, 1 / a.height); runQuad(blurMat, a);
			src = a.texture;
		}
	}
};
// transition masks: 0 none (A only), 1 cut/mix by k (k≥.5 → B), 2 wipe along dir with soft edge + roller shadow,
// 3 ink bleed from point (noise), 4 ripple (B through ripples), 5 iris from point, 6 foreground band (dark body sweeps), 7 dissolve, 8 light burst (white-gold flash peaks at k=.5)
export type Xf = {mode: number; k: number; dir?: [number, number]; pt?: [number, number]; soft?: number; band?: number};
const compMat = new THREE.ShaderMaterial({
	uniforms: {
		A: {value: null}, B: {value: null}, Ag0: {value: null}, Ag1: {value: null}, Ag2: {value: null}, Ag3: {value: null}, Bg0: {value: null}, Bg1: {value: null}, Bg2: {value: null}, Bg3: {value: null},
		bloomA: {value: 1}, bloomB: {value: 1}, mode: {value: 0}, k: {value: 0}, dir: {value: new THREE.Vector2(1, 0)}, pt: {value: new THREE.Vector2(0.5, 0.5)}, soft: {value: 0.04}, band: {value: 0.18},
		exposure: {value: 1}, vig: {value: 0.35}, vigCol: {value: hex('#120c08')}, lift: {value: 0}, tint: {value: hex('#ffffff')}, grain: {value: 0}, time: {value: 0}, flash: {value: 0},
	},
	vertexShader: QUAD_VS, depthTest: false, depthWrite: false,
	fragmentShader: `
	uniform sampler2D A, B, Ag0, Ag1, Ag2, Ag3, Bg0, Bg1, Bg2, Bg3; uniform float bloomA, bloomB, k, soft, band, exposure, vig, lift, grain, time, flash; uniform int mode;
	uniform vec2 dir, pt; uniform vec3 vigCol, tint; varying vec2 vUv;
	float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
	float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(h21(i), h21(i+vec2(1,0)), f.x), mix(h21(i+vec2(0,1)), h21(i+vec2(1,1)), f.x), f.y); }
	float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ s += a * n2(p); p *= 2.03; a *= 0.5; } return s; }
	vec3 bl(sampler2D g0, sampler2D g1, sampler2D g2, sampler2D g3, vec2 uv){ return (texture2D(g0, uv).rgb * 0.35 + texture2D(g1, uv).rgb * 0.45 + texture2D(g2, uv).rgb * 0.6 + texture2D(g3, uv).rgb * 0.75) * 0.5; }
	vec3 sideA(vec2 uv){ return texture2D(A, uv).rgb + bl(Ag0, Ag1, Ag2, Ag3, uv) * bloomA; }
	vec3 sideB(vec2 uv){ return texture2D(B, uv).rgb + bl(Bg0, Bg1, Bg2, Bg3, uv) * bloomB; }
	void main(){
		vec2 uv = vUv; vec3 col;
		if (mode == 0) col = sideA(uv);
		else if (mode == 1) col = k < 0.5 ? sideA(uv) : sideB(uv);
		else if (mode == 2) { // wipe: edge travels along dir; B revealed behind; a soft roller shadow on the leading edge
			vec2 d = normalize(dir); float p = dot(uv - 0.5, d) / (abs(d.x) * 0.5 + abs(d.y) * 0.5) * 0.5 + 0.5; float e = k * (1.0 + 2.0 * soft) - soft;
			float m = smoothstep(e - soft, e + soft, p); col = mix(sideB(uv), sideA(uv), m);
			col *= 1.0 - 0.55 * exp(-pow((p - e) / (soft * 2.5), 2.0)) * step(0.001, k) * step(k, 0.999);
		} else if (mode == 3) { // ink bleed from pt
			float r = length((uv - pt) * vec2(1.7778, 1.0)); float nz = fbm(uv * 6.0 + 3.1) * 0.35;
			float m = smoothstep(k * 1.9 - 0.06, k * 1.9 + 0.06, r + nz); col = mix(sideB(uv), sideA(uv), m);
		} else if (mode == 4) { // ripple: A rippled out, B rippled in
			float r = length((uv - pt) * vec2(1.7778, 1.0)); float amp = 0.012 * sin(k * 3.14159);
			vec2 off = (uv - pt) / max(r, 0.001) * sin(r * 60.0 - k * 20.0) * amp;
			col = mix(sideA(uv + off), sideB(uv + off), smoothstep(0.35, 0.65, k));
		} else if (mode == 5) { // iris
			float r = length((uv - pt) * vec2(1.7778, 1.0)); float m = smoothstep(k * 2.1 - soft, k * 2.1 + soft, r); col = mix(sideB(uv), sideA(uv), m);
		} else if (mode == 6) { // dark foreground band sweeps along dir; switch hidden under it
			vec2 d = normalize(dir); float p = dot(uv - 0.5, d) / (abs(d.x) * 0.5 + abs(d.y) * 0.5) * 0.5 + 0.5; float c = mix(-band, 1.0 + band, k);
			float under = 1.0 - smoothstep(band * 0.8, band, abs(p - c));
			col = (p < c ? sideB(uv) : sideA(uv)); col = mix(col, vec3(0.055, 0.04, 0.03), under);
		} else if (mode == 7) col = mix(sideA(uv), sideB(uv), smoothstep(0.0, 1.0, k));
		else if (mode == 9) { // rectangular pane (pt = centre, dir = half size, uv units): B inside the pane, fading in by k, with a glass sheen
			vec2 q = abs(uv - pt) / dir; float inside = 1.0 - smoothstep(0.98, 1.0, max(q.x, q.y));
			col = mix(sideA(uv), mix(sideA(uv), sideB(uv), k), inside);
			col += inside * vec3(0.06, 0.06, 0.07) * (1.0 - smoothstep(0.0, 0.6, abs(uv.x - pt.x + uv.y - pt.y - 0.2)));
		} else if (mode == 10) { // directional smear (whip pan): A smears out along dir, B smears in, switch at k=.5
			vec2 d = normalize(dir) * 0.06 * sin(k * 3.14159); vec3 a = vec3(0.0), b = vec3(0.0);
			for (int i = 0; i < 12; i++) { float f = float(i) / 11.0 - 0.5; a += sideA(uv + d * f); b += sideB(uv + d * f); }
			col = (k < 0.5 ? a : b) / 12.0;
		} else if (mode == 11) { // picture-in-picture: A shrinks into the rect (pt centre, dir half-size) over B
			vec2 c = mix(vec2(0.5), pt, k), hs = mix(vec2(0.5), dir, k); vec2 q = (uv - c) / hs * 0.5 + 0.5;
			bool inR = all(greaterThanEqual(q, vec2(0.0))) && all(lessThanEqual(q, vec2(1.0)));
			col = inR ? sideA(q) : sideB(uv);
			if (inR) { vec2 e = min(q, 1.0 - q); col *= 0.75 + 0.25 * smoothstep(0.0, 0.03, min(e.x, e.y)); }
		} else if (mode == 12) { // light-edged wipe: B revealed behind a bright soft edge travelling along dir
			vec2 d = normalize(dir); float p = dot(uv - 0.5, d) / (abs(d.x) * 0.5 + abs(d.y) * 0.5) * 0.5 + 0.5; float e = k * (1.0 + 2.0 * soft) - soft;
			float m = smoothstep(e - soft, e + soft, p); col = mix(sideB(uv), sideA(uv), m);
			col += vec3(1.0, 0.9, 0.7) * 0.35 * exp(-pow((p - e) / soft, 2.0)) * step(0.001, k) * step(k, 0.999);
		}
		else { col = k < 0.5 ? sideA(uv) : sideB(uv); }
		col *= exposure * tint; col += lift;
		col += vec3(1.0, 0.86, 0.6) * flash;
		float v = length((uv - 0.5) * vec2(1.0, 0.85)); col = mix(col, vigCol, smoothstep(0.45, 1.05, v) * vig);
		col += (h21(uv * 1920.0 + time) - 0.5) * grain;
		gl_FragColor = vec4(col, 1.0);
		#include <colorspace_fragment>
	}`,
});
export type Grade = {exposure?: number; vig?: number; vigCol?: string; lift?: number; tint?: string; grain?: number; flash?: number};
/** composite slot 0 (A) and optionally slot 1 (B) to the screen */
export const composite = (x: Xf, g: Grade = {}, t = 0, bloomA = 1, bloomB = 1) => {
	const u = compMat.uniforms, a = slots[0], b = slots[1];
	u.A.value = a.base.texture; u.B.value = b.base.texture;
	[u.Ag0, u.Ag1, u.Ag2, u.Ag3].forEach((s, i) => (s.value = a.mips[i][0].texture)); [u.Bg0, u.Bg1, u.Bg2, u.Bg3].forEach((s, i) => (s.value = b.mips[i][0].texture));
	u.bloomA.value = bloomA; u.bloomB.value = bloomB; u.mode.value = x.mode; u.k.value = x.k;
	if (x.dir) u.dir.value.set(x.dir[0], x.dir[1]); if (x.pt) u.pt.value.set(x.pt[0], x.pt[1]); u.soft.value = x.soft ?? 0.04; u.band.value = x.band ?? 0.18;
	u.exposure.value = g.exposure ?? 1; u.vig.value = g.vig ?? 0.35; u.vigCol.value.set(g.vigCol ?? '#120c08'); u.lift.value = g.lift ?? 0; u.tint.value.set(g.tint ?? '#ffffff');
	u.grain.value = g.grain ?? 0; u.flash.value = g.flash ?? 0; u.time.value = t;
	runQuad(compMat, null);
};

// ---------------------------------------------------------------------------------------------------------- particles
/** deterministic particles drawn as soft sprites: snow, embers, dust */
export class Motes {
	pts: THREE.Points; n: number; pos: Float32Array; seed: number[];
	constructor(public st: Stage, n: number, public kind: 'snow' | 'ember' | 'dust', z = 200, size = 10, color = '#D9E1E6', glow = false) {
		this.n = n; const g = new THREE.BufferGeometry(); this.pos = new Float32Array(n * 3); g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
		const c = mkCanvas(64, 64), x = c.getContext('2d')!, gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,.65)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
		const m = new THREE.PointsMaterial({size, map: canvasTex(c), color: hex(color), transparent: true, depthWrite: false, sizeAttenuation: true, blending: glow ? THREE.AdditiveBlending : THREE.NormalBlending, opacity: 0.9});
		this.pts = new THREE.Points(g, m); this.pts.userData.glow = glow; this.pts.renderOrder = 9000; st.scene.add(this.pts); st.extras.push(this.pts);
		this.seed = Array.from({length: n}, (_, i) => i); this.z = z;
	}
	z: number;
	/** t in seconds; area in frame px (x0,y0,x1,y1); wind px/s */
	update(t: number, area = [0, 0, W, H], fall = 90, wind = 30, opacity = 0.9) {
		const [x0, y0, x1, y1] = area, w = x1 - x0, h = y1 - y0;
		for (let i = 0; i < this.n; i++) {
			const a = hash(i * 3.1), b = hash(i * 7.7), c = hash(i * 1.3), z = this.z - c * 900;
			let x: number, y: number;
			if (this.kind === 'snow') { x = x0 + ((a * w + wind * t + Math.sin(t * 0.9 + i) * 18) % w + w) % w; y = y0 + ((b * h + fall * (0.6 + c) * t) % h); }
			else if (this.kind === 'ember') { x = x0 + ((a * w + wind * t + Math.sin(t * 1.7 + i) * 30) % w + w) % w; y = y1 - ((b * h + fall * (0.5 + c) * t) % h); }
			else { x = x0 + ((a * w + Math.sin(t * 0.3 + i) * 40 + wind * t) % w + w) % w; y = y0 + ((b * h - fall * (0.2 + 0.4 * c) * t) % h + h) % h; }
			const v = this.st.at(x, y, z); this.pos[i * 3] = v.x; this.pos[i * 3 + 1] = v.y; this.pos[i * 3 + 2] = v.z;
		}
		(this.pts.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true; (this.pts.material as THREE.PointsMaterial).opacity = opacity;
	}
}

// ---------------------------------------------------------------------------------------------------------- live canvas layers
/** a layer whose canvas is redrawn by a callback (figures, animated paint); draws only when its key changes */
export class Live {
	cv: HTMLCanvasElement; g: CanvasRenderingContext2D; tex: THREE.CanvasTexture; L: Layer; key = '';
	constructor(public st: Stage, name: string, cx: number, cy: number, w: number, h: number, z: number, o: PaintOpts = {}, public res = 1, order = 0) {
		this.cv = mkCanvas(Math.round(w * res), Math.round(h * res)); this.g = this.cv.getContext('2d')!; this.tex = canvasTex(this.cv);
		this.tex.generateMipmaps = false; this.tex.minFilter = THREE.LinearFilter;
		this.L = st.add(name, this.tex, cx, cy, w, h, z, o, order);
	}
	/** draw(g, s) gets the context already scaled so 1 unit = 1 frame px within the layer's box */
	draw(key: string, f: (g: CanvasRenderingContext2D) => void) {
		if (key === this.key) return; this.key = key; const g = this.g; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, this.cv.width, this.cv.height);
		g.setTransform(this.res, 0, 0, this.res, 0, 0); f(g); this.tex.needsUpdate = true;
	}
	/** like draw, but the context is in world px (the layer box offset applied) */
	drawW(key: string, f: (g: CanvasRenderingContext2D) => void) { const L = this.L; this.draw(key, (g) => { g.translate(-(L.cx - L.w / 2), -(L.cy - L.h / 2)); f(g); }); }
}
/** fill SVG path data strings on a canvas (fast, synchronous) */
export const fillPaths = (g: CanvasRenderingContext2D, svg: string, col?: string) => {
	const re = /<path[^>]*\sd="([^"]+)"[^>]*?(?:fill="([^"]+)")?[^>]*\/?>/g; let m: RegExpExecArray | null;
	while ((m = re.exec(svg))) { const fill = col ?? (/fill="([^"]+)"/.exec(m[0])?.[1] ?? '#15100C'); if (fill === 'none') continue; g.fillStyle = fill; g.fill(new Path2D(m[1])); }
};
