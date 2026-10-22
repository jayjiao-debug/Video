// ep38 engine: world, instanced armies (two detail levels × poses × sides), effects, ocean + fleets, ground squares, camera, post.
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader.js';
import {clone as skClone} from 'three/examples/jsm/utils/SkeletonUtils.js';
import {Water} from 'three/examples/jsm/objects/Water.js';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass.js';
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass.js';
import {rnd, type Sim, type Unit} from './sim';

export const W = 1920, H = 1080;
export const A = (f: string) => `assets/${f}`;

// ================================================================ renderer + post
export const canvas = document.getElementById('c') as HTMLCanvasElement;
export const renderer = new THREE.WebGLRenderer({canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance'});
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.72;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
export const camera = new THREE.PerspectiveCamera(36, W / H, 0.3, 12000);
const rt = new THREE.WebGLRenderTarget(W, H, {type: THREE.HalfFloatType, samples: 4});
export const composer = new EffectComposer(renderer, rt);
const renderPass = new RenderPass(new THREE.Scene(), camera); composer.addPass(renderPass);
export const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.5, 0.5, 2.2); composer.addPass(bloom);
const grade = new ShaderPass({
	uniforms: {tDiffuse: {value: null}, vig: {value: 0.38}, warm: {value: 0.03}, fade: {value: 0}, sepia: {value: 0}},
	vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
	fragmentShader: `uniform sampler2D tDiffuse; uniform float vig; uniform float warm; uniform float fade; uniform float sepia; varying vec2 vUv;
		void main(){ vec4 c = texture2D(tDiffuse, vUv); vec2 d = vUv - 0.5; float v = 1.0 - vig * smoothstep(0.25, 0.85, length(d * vec2(1.0, 0.75)) * 1.4);
		c.rgb *= v; c.r += warm * 0.6 * (1.0 - c.r); c.b -= warm * 0.5 * c.b; float l = dot(c.rgb, vec3(0.3,0.59,0.11)); vec3 sp = mix(vec3(0.16,0.12,0.09), vec3(0.93,0.86,0.72), smoothstep(0.0, 0.9, l)); c.rgb = mix(c.rgb, sp, sepia); c.rgb *= (1.0 - fade); gl_FragColor = c; }`,
});
composer.addPass(grade); composer.addPass(new OutputPass());
export const setGrade = (o: {vig?: number; warm?: number; fade?: number; bloom?: number; exposure?: number; sepia?: number}) => {
	grade.uniforms.sepia.value = o.sepia ?? 0;
	if (o.vig !== undefined) grade.uniforms.vig.value = o.vig; if (o.warm !== undefined) grade.uniforms.warm.value = o.warm; grade.uniforms.fade.value = o.fade ?? 0;
	bloom.strength = o.bloom ?? 0.5; renderer.toneMappingExposure = o.exposure ?? 0.66;
};
export const draw = (scene: THREE.Scene) => { renderPass.scene = scene; composer.render(); };

// ================================================================ camera keys
export type Key = {t: number; pos: number[]; look: number[]; fov?: number; roll?: number; upZ?: boolean};
const ease = (u: number) => { const v = Math.max(0, Math.min(1, u)); return v * v * v * (v * (v * 6 - 15) + 10); };
export const camKeys = (keys: Key[], t: number) => {
	let i = 0; while (i < keys.length - 2 && t > keys[i + 1].t) i++;
	const a = keys[i], b = keys[Math.min(i + 1, keys.length - 1)], u = b.t === a.t ? 0 : ease((t - a.t) / (b.t - a.t));
	const pos = a.pos.map((v, k) => v + (b.pos[k] - v) * u), look = a.look.map((v, k) => v + (b.look[k] - v) * u), fov = (a.fov ?? 36) + ((b.fov ?? 36) - (a.fov ?? 36)) * u, roll = (a.roll ?? 0) + ((b.roll ?? 0) - (a.roll ?? 0)) * u;
	camera.position.set(pos[0], pos[1], pos[2]); const dy = look[1] - pos[1], dl = Math.hypot(look[0] - pos[0], dy, look[2] - pos[2]); if (a.upZ) camera.up.set(0, 0, 1); else if (dy / dl < -0.97) camera.up.set(0, 0, -1); else camera.up.set(Math.sin(roll), Math.cos(roll), 0); camera.lookAt(look[0], look[1], look[2]); camera.fov = fov; camera.updateProjectionMatrix();
	return {pos, look};
};
/** orbit around a point (bullet time) */
export const camOrbit = (c: number[], r: number, h: number, ang: number, fov = 34, lookY = 1.3) => { camera.position.set(c[0] + Math.cos(ang) * r, c[1] + h, c[2] + Math.sin(ang) * r); camera.up.set(0, 1, 0); camera.lookAt(c[0], lookY, c[2]); camera.fov = fov; camera.updateProjectionMatrix(); };
export const toScreen = (v: number[]) => { const p = new THREE.Vector3(v[0], v[1], v[2]).project(camera); return {x: (p.x + 1) / 2 * W, y: (1 - p.y) / 2 * H, front: p.z < 1}; };

// ================================================================ assets
type Part = {geo: THREE.BufferGeometry; mat: THREE.Material; coat: boolean};
type Poses = Record<'rest' | 'aim' | 'march', Part[]>;
export type Assets = {sky: THREE.DataTexture; env: THREE.Texture; ground: THREE.Texture[]; hi: Poses; lo: Poses; grass: Part[]; shipA: Part[]; shipB: Part[]; water: THREE.Texture};
const POSES: Record<keyof Poses, Record<string, number[]>> = {
	rest: {upperarm_l: [0, 1.2, 0], upperarm_r: [0, 1.2, 0]},
	aim: {upperarm_l: [0, 0.4, 1.25], upperarm_r: [0, 0.95, 0.55], lowerarm_r: [0, 0, 1.15], hand_r: [0, 1.5, 0.75]},
	march: {upperarm_l: [0, 1.15, 0.25], upperarm_r: [0, 1.0, -0.3], thigh_l: [0, 0, 0.35], thigh_r: [0, 0, -0.3]},
};
const bake = (scene: THREE.Object3D, pose: Record<string, number[]> | null, size: number, along: 'y' | 'len', coatRe?: RegExp): Part[] => {
	const o = skClone(scene);
	if (pose) o.traverse((b: any) => { if (!b.isBone) return; for (const [k, r] of Object.entries(pose)) if (b.name.startsWith(k + '_')) { b.rotation.x += r[0]; b.rotation.y += r[1]; b.rotation.z += r[2]; } });
	o.updateMatrixWorld(true);
	const parts: Part[] = [], bb = new THREE.Box3();
	o.traverse((m: any) => {
		if (!m.isMesh) return; const geo: THREE.BufferGeometry = m.geometry.clone(); const P = geo.attributes.position, v = new THREE.Vector3();
		if (m.isSkinnedMesh) { m.skeleton.update(); for (let k = 0; k < P.count; k++) { v.fromBufferAttribute(P, k); m.applyBoneTransform(k, v); P.setXYZ(k, v.x, v.y, v.z); } geo.deleteAttribute('skinIndex'); geo.deleteAttribute('skinWeight'); }
		geo.applyMatrix4(m.matrixWorld); geo.computeBoundingBox(); bb.union(geo.boundingBox!);
		const mat = Array.isArray(m.material) ? m.material[0] : m.material;
		parts.push({geo, mat, coat: coatRe ? coatRe.test(m.name + ' ' + mat?.name + ' ' + m.parent?.name) : false});
	});
	const sz = bb.getSize(new THREE.Vector3()), c = bb.getCenter(new THREE.Vector3());
	const rotate = along === 'len' && sz.z > sz.x; // lay ships along x
	const sc = along === 'y' ? size / sz.y : size / Math.max(sz.x, sz.z);
	for (const p of parts) { p.geo.translate(-c.x, -bb.min.y, -c.z); if (rotate) p.geo.rotateY(Math.PI / 2); p.geo.scale(sc, sc, sc); p.geo.computeBoundingSphere(); if (!p.geo.attributes.normal) p.geo.computeVertexNormals(); }
	return parts;
};
const tex = async (f: string, srgb = false, rep = 1) => { const t = await new THREE.TextureLoader().loadAsync(A(f)); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
export const loadAssets = async (): Promise<Assets> => {
	const gl = new GLTFLoader();
	const [sky, gD, gN, gR, hi, lo, grass, sa, sb, water] = await Promise.all([
		new RGBELoader().loadAsync(A('sky.hdr')), tex('ground_diff.jpg', true, 180), tex('ground_nor.jpg', false, 180), tex('ground_rough.jpg', false, 180),
		gl.loadAsync(A('soldier.glb')), gl.loadAsync(A('soldier_lo.glb')), gl.loadAsync(A('grass/grass.gltf')), gl.loadAsync(A('ship_bucentaure.glb')), gl.loadAsync(A('ship_agamemnon.glb')),
		tex('waternormals.jpg', false, 1),
	]);
	sky.mapping = THREE.EquirectangularReflectionMapping;
	const pm = new THREE.PMREMGenerator(renderer); const env = pm.fromEquirectangular(sky).texture;
	const pose = (sc: THREE.Object3D): Poses => ({rest: bake(sc, POSES.rest, 1.8, 'y', /Jacket/), aim: bake(sc, POSES.aim, 1.8, 'y', /Jacket/), march: bake(sc, POSES.march, 1.8, 'y', /Jacket/)});
	const ship = (sc: THREE.Object3D) => { sc.traverse((o: any) => { if (o.isLine || o.isLineSegments) o.visible = false; }); return bake(sc, null, 58, 'len'); };
	return {sky, env, ground: [gD, gN, gR], hi: pose(hi.scene), lo: pose(lo.scene), grass: bake(grass.scene, null, 0.55, 'y'), shipA: ship(sa.scene), shipB: ship(sb.scene), water};
};

// ================================================================ the land
export const SUN_DIR = new THREE.Vector3(-0.62, 0.22, 0.75).normalize(); // low golden sun, behind-left of the opening camera
export const makeLand = (a: Assets) => {
	const scene = new THREE.Scene(); scene.background = a.sky; scene.environment = a.env; scene.environmentIntensity = 0.45; scene.backgroundIntensity = 0.85; scene.fog = new THREE.Fog('#b4ada8', 600, 6500);
	const g = new THREE.PlaneGeometry(16000, 16000, 260, 260); g.rotateX(-Math.PI / 2); const p = g.attributes.position; const col = new Float32Array(p.count * 3);
	for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), d = Math.hypot(x, z);
		p.setY(i, d < 900 ? 0 : Math.min(90, (d - 900) * 0.045 * (1 + Math.sin(x * 0.004) * Math.cos(z * 0.003))));
		const n = 0.5 + 0.25 * Math.sin(x * 0.013 + z * 0.007) + 0.2 * Math.sin(x * 0.031 - z * 0.019) + 0.1 * Math.sin(x * 0.07 + z * 0.05);
		col[i * 3] = 0.78 + 0.32 * n; col[i * 3 + 1] = 0.8 + 0.28 * n; col[i * 3 + 2] = 0.72 + 0.2 * n; }
	g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.computeVertexNormals();
	const ground = new THREE.Mesh(g, new THREE.MeshStandardMaterial({map: a.ground[0], normalMap: a.ground[1], roughnessMap: a.ground[2], color: '#d8d2b8', vertexColors: true}));
	ground.receiveShadow = true; scene.add(ground);
	const hgt = (x: number, z: number) => { const d = Math.hypot(x, z); return d < 900 ? 0 : Math.min(90, (d - 900) * 0.045 * (1 + Math.sin(x * 0.004) * Math.cos(z * 0.003))); };
	// forest on the rising ground
	const R = rnd(11), n = 3200, canopy = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 2), new THREE.MeshStandardMaterial({color: '#34422a', roughness: 1}), n), trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.25, 0.35, 1, 6), new THREE.MeshStandardMaterial({color: '#3a2c20'}), n);
	const o = new THREE.Object3D(), cc = new THREE.Color();
	for (let i = 0; i < n; i++) { const ang = R() * Math.PI * 2, d = 980 + R() * 420 + (R() < 0.3 ? R() * 500 : 0); const x = Math.sin(ang) * d, z = Math.cos(ang) * d, y = hgt(x, z), h = 8 + R() * 10;
		o.position.set(x, y + h * 0.35, z); o.scale.set(0.6, h * 0.7, 0.6); o.rotation.set(0, 0, 0); o.updateMatrix(); trunk.setMatrixAt(i, o.matrix);
		o.position.set(x, y + h * 0.78, z); o.scale.set(h * 0.33, h * 0.42, h * 0.33); o.rotation.set(R(), R(), R()); o.updateMatrix(); canopy.setMatrixAt(i, o.matrix); canopy.setColorAt(i, cc.setHSL(0.24 + R() * 0.06, 0.25 + R() * 0.1, 0.18 + R() * 0.08)); }
	canopy.castShadow = true; scene.add(canopy, trunk);
	// grass tufts near the armies
	const G = 4000, gm = a.grass.map((pp) => { const m = new THREE.InstancedMesh(pp.geo, pp.mat, G); m.receiveShadow = true; scene.add(m); return m; });
	for (let i = 0; i < G; i++) { const x = (R() - 0.5) * 360, z = (R() - 0.5) * 640; o.position.set(x, 0, z); o.rotation.set(0, R() * 6.28, 0); o.scale.setScalar(0.6 + R() * 1.0); o.updateMatrix(); for (const m of gm) m.setMatrixAt(i, o.matrix); }
	// sun
	const sun = new THREE.DirectionalLight('#ffcf9a', 3.6); sun.position.copy(SUN_DIR).multiplyScalar(500); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096);
	const sc = sun.shadow.camera as THREE.OrthographicCamera; sc.left = -330; sc.right = 330; sc.top = 320; sc.bottom = -320; sc.near = 10; sc.far = 1500; sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02;
	scene.add(sun, sun.target, new THREE.HemisphereLight('#f4d2b4', '#4a4030', 0.35));
	return {scene, sun};
};

// ================================================================ armies
export const NEAR = 90;
type Pose = keyof Poses;
const blueCoat = (m: THREE.MeshStandardMaterial) => {
	const c = m.clone(); const img: any = m.map?.image; if (!img) { c.color = new THREE.Color('#3355aa'); return c; }
	const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height; const g = cv.getContext('2d')!; g.drawImage(img, 0, 0);
	const d = g.getImageData(0, 0, cv.width, cv.height); for (let i = 0; i < d.data.length; i += 4) { const r = d.data[i]; const g2 = d.data[i + 1], b2 = d.data[i + 2]; d.data[i] = b2 * 0.32 + 10; d.data[i + 1] = g2 * 0.42 + 18; d.data[i + 2] = Math.min(255, r * 0.62 + 30); } g.putImageData(d, 0, 0);
	const t = new THREE.CanvasTexture(cv); t.flipY = m.map!.flipY; t.colorSpace = THREE.SRGBColorSpace; c.map = t; return c;
};
export type Body = {x: number; z: number; ry: number; side: 0 | 1; pose: Pose; fall: number; fallDir?: number; s?: number; lean?: number};
/** one pool of instanced soldiers; call set(bodies, camPos) every frame */
export class Army {
	sets: Record<string, THREE.InstancedMesh[]> = {};
	o = new THREE.Object3D();
	constructor(a: Assets, scene: THREE.Scene, cap: number) {
		const mk = (parts: Part[], n: number, side: 0 | 1) => parts.map((p) => { const mat = side === 0 && p.coat ? blueCoat(p.mat as THREE.MeshStandardMaterial) : p.mat; const m = new THREE.InstancedMesh(p.geo, mat, n); m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; m.count = 0; scene.add(m); return m; });
		for (const side of [0, 1] as const) for (const ps of ['rest', 'aim', 'march'] as const) { this.sets[`hi-${ps}-${side}`] = mk(a.hi[ps], NEAR, side); this.sets[`lo-${ps}-${side}`] = mk(a.lo[ps], cap, side); }
	}
	set(bodies: Body[], cam: THREE.Vector3) {
		const near = new Set(bodies.map((b, i) => ({i, d: (b.x - cam.x) ** 2 + (b.z - cam.z) ** 2})).sort((p, q) => p.d - q.d).slice(0, NEAR).map((x) => x.i));
		const lists: Record<string, THREE.Matrix4[]> = {};
		bodies.forEach((b, i) => {
			const o = this.o; o.position.set(b.x, b.fall * 0.12, b.z); o.rotation.set(0, b.ry, 0); if (b.lean) o.rotateX(b.lean); if (b.fall > 0) o.rotateX(-b.fall * 1.45 * (b.fallDir ?? 1)); o.scale.setScalar(b.s ?? 1); o.updateMatrix();
			const key = `${near.has(i) ? 'hi' : 'lo'}-${b.fall > 0 ? 'rest' : b.pose}-${b.side}`; (lists[key] ||= []).push(o.matrix.clone());
		});
		for (const [k, ms] of Object.entries(this.sets)) { const L = lists[k] || []; for (const m of ms) { const cap = m.instanceMatrix.count; const n = Math.min(cap, L.length); for (let i = 0; i < n; i++) m.setMatrixAt(i, L[i]); m.count = n; m.visible = n > 0; m.instanceMatrix.needsUpdate = true; } }
	}
}
const fireIdx = new WeakMap<Sim, number[][]>();
const fires = (sim: Sim) => { let f = fireIdx.get(sim); if (!f) { f = sim.units.map(() => []); for (const s of sim.shots) f[s.from].push(s.t); fireIdx.set(sim, f); } return f; };
/** bodies of a simulation at time t: men raise the musket ~0.9 s before each shot and lower it ~0.5 s after (reloading);
 *  `fallK` = sim seconds per real second, so a fall always takes ~0.45 real seconds */
export const simBodies = (sim: Sim, t: number, pose: Pose = 'aim', dx = 0, dz = 0, fallK = 1): Body[] => { const F = fires(sim); return sim.units.map((u, i) => {
	const fall = t < u.death ? 0 : Math.min(1, (t - u.death) / (0.45 * fallK));
	let p: Pose = pose; if (pose === 'aim' && sim.kind === 'rifle') { p = t < sim.t0 - 0.6 ? 'rest' : 'rest'; for (const ft of F[i]) if (t > ft - 0.9 && t < ft + 0.5) { p = 'aim'; break; } if (t < sim.t0 + 0.6 && t > sim.t0 - 0.9) p = 'aim'; }
	return {x: u.x + dx, z: u.z + dz, ry: (u.side === 0 ? Math.PI / 2 : -Math.PI / 2) + (u.fx - 0.5) * 0.22, side: u.side, pose: p, fall, fallDir: u.fx < 0.25 ? -1 : 1, s: 0.95 + u.fx * 0.1};
}); };

// ================================================================ smoke + flashes
const spriteTex = (() => { let t: THREE.CanvasTexture | null = null; return () => { if (t) return t; const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d')!;
	for (let k = 0; k < 6; k++) { const x = 64 + (Math.random() - 0.5) * 30, y = 64 + (Math.random() - 0.5) * 30, r = 34 + Math.random() * 26; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); }
	t = new THREE.CanvasTexture(c); return t; }; })();
const pointsMat = (additive: boolean) => new THREE.ShaderMaterial({
	uniforms: {map: {value: spriteTex()}, scale: {value: H / 2 / Math.tan((36 * Math.PI) / 360)}, fogColor: {value: new THREE.Color('#b9b2ad')}},
	vertexShader: 'attribute float size; attribute vec4 rgba; varying vec4 vC; uniform float scale; void main(){ vC = rgba; vec4 mv = modelViewMatrix * vec4(position,1.0); gl_PointSize = min(900.0, size * scale / -mv.z); gl_Position = projectionMatrix * mv; }',
	fragmentShader: 'uniform sampler2D map; varying vec4 vC; void main(){ vec4 t = texture2D(map, gl_PointCoord); gl_FragColor = vec4(vC.rgb, vC.a * t.a); }',
	transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending, toneMapped: !additive,
});
export class Puffs {
	pts: THREE.Points; n: number;
	constructor(scene: THREE.Scene, n: number, additive: boolean) { this.n = n; const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3)); g.setAttribute('size', new THREE.BufferAttribute(new Float32Array(n), 1)); g.setAttribute('rgba', new THREE.BufferAttribute(new Float32Array(n * 4), 4)); this.pts = new THREE.Points(g, pointsMat(additive)); this.pts.frustumCulled = false; this.pts.renderOrder = additive ? 3 : 2; scene.add(this.pts); }
	/** items: [x,y,z,size,r,g,b,a] */
	set(items: number[][]) { const g = this.pts.geometry, P = g.attributes.position as THREE.BufferAttribute, S = g.attributes.size as THREE.BufferAttribute, C = g.attributes.rgba as THREE.BufferAttribute; const n = Math.min(items.length, this.n);
		// far → near so normal blending composites correctly
		const cp = camera.position; const it = items.slice(0, n).sort((p, q) => ((q[0] - cp.x) ** 2 + (q[1] - cp.y) ** 2 + (q[2] - cp.z) ** 2) - ((p[0] - cp.x) ** 2 + (p[1] - cp.y) ** 2 + (p[2] - cp.z) ** 2));
		for (let i = 0; i < n; i++) { const v = it[i]; P.setXYZ(i, v[0], v[1], v[2]); S.setX(i, v[3]); C.setXYZW(i, v[4], v[5], v[6], v[7]); }
		g.setDrawRange(0, n); P.needsUpdate = S.needsUpdate = C.needsUpdate = true; (this.pts.material as THREE.ShaderMaterial).uniforms.scale.value = H / 2 / Math.tan((camera.fov * Math.PI) / 360); }
}
/** musket smoke and flashes of a rifle sim at time t */
export const simSmoke = (sim: Sim, t: number, dx = 0, dz = 0) => {
	const sm: number[][] = [], fl: number[][] = [];
	for (const s of sim.shots) {
		const age = t - s.t; if (age < 0 || age > 8) continue; const u = sim.units[s.from], dir = u.side ? -1 : 1;
		const a = 0.14 * Math.exp(-age / 2.6) * Math.min(1, age * 7), sz = 0.9 + age * 1.05;
		sm.push([u.x + dx + dir * (1.4 + age * 0.7) + age * 0.6, 1.5 + age * 0.75, u.z + dz + age * 0.8 + (u.fx - 0.5) * 1.5, sz, 0.9, 0.88, 0.84, a]);
		if (age < 0.09) fl.push([u.x + dx + dir * 1.3, 1.45, u.z + dz, 0.9 + (1 - age / 0.09) * 0.8, 2.4, 1.6, 0.7, 1 - age / 0.09]);
	}
	return {sm, fl};
};

// ================================================================ tracers (musket balls in flight; frozen in bullet time)
export class Tracers {
	lines: THREE.LineSegments; n: number;
	constructor(scene: THREE.Scene, n: number) { this.n = n; const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 6), 3)); g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(n * 6), 3));
		this.lines = new THREE.LineSegments(g, new THREE.LineBasicMaterial({vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false})); this.lines.frustumCulled = false; scene.add(this.lines); }
	/** segs: [x1,y1,z1,x2,y2,z2,r,g,b] */
	set(segs: number[][]) { const g = this.lines.geometry, P = g.attributes.position as THREE.BufferAttribute, C = g.attributes.color as THREE.BufferAttribute; const n = Math.min(this.n, segs.length);
		for (let i = 0; i < n; i++) { const s = segs[i]; P.setXYZ(i * 2, s[0], s[1], s[2]); P.setXYZ(i * 2 + 1, s[3], s[4], s[5]); C.setXYZ(i * 2, s[6] * 0.15, s[7] * 0.15, s[8] * 0.15); C.setXYZ(i * 2 + 1, s[6], s[7], s[8]); }
		g.setDrawRange(0, n * 2); P.needsUpdate = C.needsUpdate = true; }
}
export const FLIGHT = 0.28;
/** tracer segments of a rifle sim at time t (a ball flies FLIGHT s from muzzle to target / past it) */
export const simTracers = (sim: Sim, t: number, opts: {len?: number; bright?: number; dx?: number; dz?: number} = {}) => {
	const out: number[][] = []; const len = opts.len ?? 0.06, br = (opts.bright ?? 1) * 0.45, dx = opts.dx ?? 0, dz = opts.dz ?? 0;
	for (const s of sim.shots) { const age = t - s.t; if (age < 0 || age > FLIGHT || (!s.hit && s.from % 3)) continue; const a = sim.units[s.from], b = sim.units[s.to], dir = a.side ? -1 : 1;
		const x1 = a.x + dir * 1.3 + dx, z1 = a.z + dz, y1 = 1.45; const tx = s.hit ? b.x + dx : b.x + dx + dir * 3, tz = b.z + dz + (s.hit ? 0 : (a.fx - 0.5) * 3), ty = s.hit ? 1.3 : 0.9;
		const f0 = Math.max(0, age / FLIGHT - len), f1 = age / FLIGHT; const c = a.side ? [3.2, 1.6, 1.1] : [1.4, 2.1, 3.4];
		out.push([x1 + (tx - x1) * f0, y1 + (ty - y1) * f0, z1 + (tz - z1) * f0, x1 + (tx - x1) * f1, y1 + (ty - y1) * f1, z1 + (tz - z1) * f1, c[0] * br, c[1] * br, c[2] * br]); }
	return out;
};

// ================================================================ glowing ground squares (strength = area)
export class GroundSquares {
	group = new THREE.Group(); items: {m: THREE.Mesh; e: THREE.LineSegments}[] = [];
	constructor(scene: THREE.Scene, n: number) { scene.add(this.group);
		for (let i = 0; i < n; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({color: '#4a90ff', transparent: true, opacity: 0.3, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false})); m.rotation.x = -Math.PI / 2;
			const e = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(1, 1)), new THREE.LineBasicMaterial({color: '#9cc8ff', transparent: true, toneMapped: false})); e.rotation.x = -Math.PI / 2;
			this.group.add(m, e); this.items.push({m, e}); } }
	/** each: {x, z (corner), w, d, color, a} ; corner at (x, z), extends +x, +z */
	set(list: {x: number; z: number; w: number; d: number; color: string; a: number; edge?: number}[]) {
		this.items.forEach((it, i) => { const s = list[i]; it.m.visible = it.e.visible = !!s && s.a > 0.001; if (!s) return;
			for (const o of [it.m, it.e]) { o.position.set(s.x + s.w / 2, 0.15 + i * 0.02, s.z + s.d / 2); o.scale.set(s.w, s.d, 1); }
			(it.m.material as THREE.MeshBasicMaterial).color.set(s.color); (it.m.material as THREE.MeshBasicMaterial).opacity = 0.15 * s.a;
			(it.e.material as THREE.LineBasicMaterial).color.set(s.color); (it.e.material as THREE.LineBasicMaterial).opacity = (s.edge ?? 1) * s.a; });
	}
}

// ================================================================ the sea
export const makeSea = (a: Assets) => {
	const scene = new THREE.Scene(); scene.background = a.sky; scene.environment = a.env; scene.environmentIntensity = 0.8; scene.backgroundIntensity = 0.85; scene.fog = new THREE.Fog('#b9b3ae', 1500, 12000);
	a.water.wrapS = a.water.wrapT = THREE.RepeatWrapping;
	const water = new Water(new THREE.PlaneGeometry(30000, 30000), {textureWidth: 1024, textureHeight: 1024, waterNormals: a.water, sunDirection: SUN_DIR.clone(), sunColor: 0xffd8a8, waterColor: 0x0f2733, distortionScale: 3.0, alpha: 1.0, fog: true});
	water.rotation.x = -Math.PI / 2; scene.add(water);
	const sun = new THREE.DirectionalLight('#ffd6a8', 2.6); sun.position.copy(SUN_DIR).multiplyScalar(2000); scene.add(sun, new THREE.HemisphereLight('#f4d2b4', '#203040', 0.4));
	const mk = (parts: Part[], n: number) => parts.map((p) => { const m = new THREE.InstancedMesh(p.geo, p.mat, n); m.frustumCulled = false; m.count = 0; scene.add(m); return m; });
	return {scene, water, combined: mk(a.shipA, 40), british: mk(a.shipB, 32)};
};
export type ShipPose = {x: number; z: number; heading: number; roll?: number};
export const setFleet = (meshes: THREE.InstancedMesh[], ships: ShipPose[], t: number) => {
	const o = new THREE.Object3D();
	ships.forEach((s, i) => { o.position.set(s.x, -2.2 + Math.sin(t * 0.9 + i) * 0.25, s.z); o.rotation.set(0, s.heading, 0); o.rotateX(Math.sin(t * 0.7 + i * 1.3) * 0.015 + (s.roll ?? 0)); o.rotateZ(Math.sin(t * 0.5 + i) * 0.01); o.updateMatrix(); for (const m of meshes) m.setMatrixAt(i, o.matrix); });
	for (const m of meshes) { m.count = ships.length; m.instanceMatrix.needsUpdate = true; }
};
