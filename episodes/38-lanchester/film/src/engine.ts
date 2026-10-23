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
type Part = {geo: THREE.BufferGeometry; mat: THREE.Material; coat: boolean; gear?: boolean};
export type PoseName = 'rest' | 'aim' | 'march' | 'charge';
export const POSE_NAMES: PoseName[] = ['rest', 'aim', 'march', 'charge'];
type Poses = Record<PoseName, Part[]>;
export type Assets = {sky: THREE.DataTexture; env: THREE.Texture; ground: THREE.Texture[]; hi: Poses; lo: Poses; grass: Part[]; shipA: Part[]; shipB: Part[]; water: THREE.Texture};
/** starting bone rotations (added to the bind pose); the aim and charge arms are then solved onto the musket */
const POSES: Record<PoseName, Record<string, number[]>> = {
	rest: {upperarm_l: [0, 1.2, 0], upperarm_r: [0, 1.2, 0]},
	aim: {upperarm_l: [0, 0.6, 0.5], upperarm_r: [0, 0.5, 0.2], head: [0, 0.25, -0.3], neck_01: [0, 0, -0.12]},
	march: {upperarm_l: [0, 1.15, 0.25], upperarm_r: [0, 1.0, -0.3], thigh_l: [0, 0, 0.35], thigh_r: [0, 0, -0.3]},
	charge: {upperarm_l: [0, 0.9, 0.5], upperarm_r: [0, 1.0, 0.2]},
};
/** where the musket goes, in the soldier's frame after normalising (metres, facing +z, his right = −x):
 *  butt = offset from his right shoulder joint, dir = barrel direction, rh/lh = where along it (0 butt → 1 muzzle) each hand grips */
type Grip = {butt: number[]; dir: number[]; rh: number; lh?: number};
const GRIPS: Partial<Record<PoseName, Grip>> = {
	rest: {butt: [0.0, -1.3, 0.12], dir: [0.02, 1, 0.06], rh: 0.5}, // order arms: butt by the right foot, bayonet up
	aim: {butt: [0.07, 0.06, 0.03], dir: [0.05, -0.01, 1], rh: 0.17, lh: 0.3},
	march: {butt: [0.02, -0.62, 0.06], dir: [0.03, 1, -0.12], rh: 0.04}, // carried upright at the right side
	charge: {butt: [0.03, -0.52, -0.08], dir: [0.1, 0.3, 1], rh: 0.05, lh: 0.38},
};
/** muzzle of the aimed musket in the soldier's frame (metres): read off the bake, used for flashes, smoke and tracers */
export const MUZZLE = {fwd: 1.3, y: 1.45};
type Norm = {c: THREE.Vector3; minY: number; sc: number; rotate: boolean};
const V = () => new THREE.Vector3();
/** the musket's butt-end and muzzle-end vertices (found once on its bind geometry by its long axis) */
const musketEnds = (P: THREE.BufferAttribute) => {
	const n = P.count, m = V(), v = V(); for (let k = 0; k < n; k++) m.add(v.fromBufferAttribute(P, k)); m.divideScalar(n);
	const C = [0, 0, 0, 0, 0, 0, 0, 0, 0]; for (let k = 0; k < n; k++) { v.fromBufferAttribute(P, k).sub(m); const a = [v.x, v.y, v.z]; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) C[i * 3 + j] += a[i] * a[j]; }
	let ax = V().set(1, 0.3, 0.2).normalize(); for (let it = 0; it < 60; it++) ax = V().set(C[0] * ax.x + C[1] * ax.y + C[2] * ax.z, C[3] * ax.x + C[4] * ax.y + C[5] * ax.z, C[6] * ax.x + C[7] * ax.y + C[8] * ax.z).normalize();
	const t = Array.from({length: n}, (_, k) => v.fromBufferAttribute(P, k).sub(m).dot(ax)); const lo = Math.min(...t), hi = Math.max(...t), L = hi - lo;
	const A: number[] = [], B: number[] = []; t.forEach((x, k) => { if (x < lo + 0.05 * L) A.push(k); if (x > hi - 0.05 * L) B.push(k); });
	const spread = (S: number[]) => { const c = V(); S.forEach((k) => c.add(v.fromBufferAttribute(P, k))); c.divideScalar(S.length); let r = 0; S.forEach((k) => { const d = v.fromBufferAttribute(P, k).sub(c); r += d.sub(ax.clone().multiplyScalar(d.dot(ax))).length(); }); return r / S.length; };
	return spread(A) > spread(B) ? {butt: A, muzzle: B} : {butt: B, muzzle: A};
};
/** butt point, unit axis, length and the "stock side" unit vector of a posed musket */
const musketFrame = (P: THREE.BufferAttribute, e: {butt: number[]; muzzle: number[]}) => {
	const v = V(), mean = (S: number[]) => { const c = V(); S.forEach((k) => c.add(v.fromBufferAttribute(P, k))); return c.divideScalar(S.length); };
	const butt = mean(e.butt), muz = mean(e.muzzle), ax = muz.clone().sub(butt); const L = ax.length(); ax.normalize();
	const cen = V(); for (let k = 0; k < P.count; k++) cen.add(v.fromBufferAttribute(P, k)); cen.divideScalar(P.count);
	const d = cen.sub(butt); const u = d.sub(ax.clone().multiplyScalar(d.dot(ax))).normalize();
	return {butt, muz, ax, L, u};
};
const basis = (a: THREE.Vector3, u: THREE.Vector3) => new THREE.Matrix4().makeBasis(a, u, a.clone().cross(u));
/** two-bone CCD: turn the links so the effector reaches the target (world space) */
const ccd = (eff: THREE.Object3D, links: THREE.Object3D[], target: THREE.Vector3, it = 40) => {
	const ep = V(), lp = V(), q = new THREE.Quaternion(), wq = new THREE.Quaternion(), pq = new THREE.Quaternion();
	for (let n = 0; n < it; n++) for (const L of links) {
		L.updateMatrixWorld(true); eff.getWorldPosition(ep); L.getWorldPosition(lp);
		const a = ep.clone().sub(lp).normalize(), b = target.clone().sub(lp).normalize(); q.setFromUnitVectors(a, b);
		L.getWorldQuaternion(wq); L.parent!.getWorldQuaternion(pq); L.quaternion.copy(pq.invert().multiply(q.multiply(wq))); L.updateMatrixWorld(true);
	}
};
const bayonetMat = new THREE.MeshStandardMaterial({color: '#dfe3e8', metalness: 0.9, roughness: 0.25});
const skin = (m: any) => { const geo: THREE.BufferGeometry = m.geometry.clone(); const P = geo.attributes.position, v = V();
	if (m.isSkinnedMesh) { m.skeleton.update(); for (let k = 0; k < P.count; k++) { v.fromBufferAttribute(P, k); m.applyBoneTransform(k, v); P.setXYZ(k, v.x, v.y, v.z); } geo.deleteAttribute('skinIndex'); geo.deleteAttribute('skinWeight'); }
	geo.applyMatrix4(m.matrixWorld); return geo; };
const bake = (scene: THREE.Object3D, poseName: PoseName | null, size: number, along: 'y' | 'len', coatRe?: RegExp, norm?: Norm): {parts: Part[]; norm: Norm} => {
	const o = skClone(scene); const pose = poseName ? POSES[poseName] : null;
	if (pose) o.traverse((b: any) => { if (!b.isBone) return; for (const [k, r] of Object.entries(pose)) if (b.name.startsWith(k + '_')) { b.rotation.x += r[0]; b.rotation.y += r[1]; b.rotation.z += r[2]; } });
	o.updateMatrixWorld(true);
	const bone = (pre: string) => { let f: THREE.Object3D | null = null; o.traverse((b: any) => { if (!f && b.isBone && b.name.startsWith(pre + '_')) f = b; }); return f as THREE.Object3D | null; };
	let musketMesh: any = null; o.traverse((m: any) => { if (m.isMesh && /Musket/.test(m.name + ' ' + m.parent?.name + ' ' + (m.material?.name ?? ''))) musketMesh = m; });
	const grip = poseName && norm ? GRIPS[poseName] : undefined;
	let musketGeo: THREE.BufferGeometry | null = null;
	if (musketMesh) {
		musketGeo = skin(musketMesh); const ends = (musketMesh.userData.ends ||= musketEnds(skin(musketMesh).attributes.position as THREE.BufferAttribute));
		if (grip && norm) {
			const f = musketFrame(musketGeo.attributes.position as THREE.BufferAttribute, ends);
			const sh = bone('upperarm_r')!.getWorldPosition(V());
			const butt = sh.clone().add(V().fromArray(grip.butt).divideScalar(norm.sc)), dir = V().fromArray(grip.dir).normalize();
			const down = V().set(0, -1, 0); const uT = down.sub(dir.clone().multiplyScalar(down.dot(dir))).normalize();
			const R = basis(dir, uT).multiply(basis(f.ax, f.u).transpose()); const tr = butt.clone().sub(f.butt.clone().applyMatrix4(R));
			musketGeo.applyMatrix4(new THREE.Matrix4().makeTranslation(tr.x, tr.y, tr.z).multiply(R));
			const at = (k: number, off: number) => butt.clone().add(dir.clone().multiplyScalar(f.L * k)).add(uT.clone().multiplyScalar(off / norm.sc));
			for (let pass = 0; pass < 2; pass++) { ccd(bone('hand_r')!, [bone('lowerarm_r')!, bone('upperarm_r')!], at(grip.rh, 0.035)); if (grip.lh !== undefined) ccd(bone('hand_l')!, [bone('lowerarm_l')!, bone('upperarm_l')!], at(grip.lh, 0.04)); }
			o.updateMatrixWorld(true);
		}
	}
	const parts: Part[] = [];
	o.traverse((m: any) => {
		if (!m.isMesh) return; const isM = m === musketMesh; const geo = isM ? musketGeo! : skin(m);
		const mat = Array.isArray(m.material) ? m.material[0] : m.material;
		parts.push({geo, mat, coat: coatRe ? coatRe.test(m.name + ' ' + mat?.name + ' ' + m.parent?.name) : false, gear: isM});
	});
	if (musketMesh && norm) { // a socket bayonet on the muzzle
		const f = musketFrame(musketGeo!.attributes.position as THREE.BufferAttribute, musketMesh.userData.ends); const L = 0.43 / norm.sc;
		const b = new THREE.CylinderGeometry(0.0025 / norm.sc, 0.011 / norm.sc, L, 5); b.translate(0, L / 2, 0); b.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V().set(0, 1, 0), f.ax));
		const p = f.muz.clone().add(f.u.clone().multiplyScalar(0.018 / norm.sc)).sub(f.ax.clone().multiplyScalar(0.03 / norm.sc)); b.translate(p.x, p.y, p.z);
		parts.push({geo: b, mat: bayonetMat, coat: false, gear: true});
		if (poseName === 'aim' && size === 1.8) { const tip = f.muz.clone(); MUZZLE.fwd = (tip.z - norm.c.z) * norm.sc; MUZZLE.y = (tip.y - norm.minY) * norm.sc; }
	}
	if (!norm) {
		const bb = new THREE.Box3(); for (const p of parts) if (!p.gear) { p.geo.computeBoundingBox(); bb.union(p.geo.boundingBox!); }
		const sz = bb.getSize(V()), c = bb.getCenter(V()); const rotate = along === 'len' && sz.z > sz.x;
		norm = {c, minY: bb.min.y, sc: along === 'y' ? size / sz.y : size / Math.max(sz.x, sz.z), rotate};
	}
	const n = norm;
	for (const p of parts) { p.geo.translate(-n.c.x, -n.minY, -n.c.z); if (n.rotate) p.geo.rotateY(Math.PI / 2); p.geo.scale(n.sc, n.sc, n.sc); p.geo.computeBoundingSphere(); if (!p.geo.attributes.normal) p.geo.computeVertexNormals(); }
	return {parts, norm: n};
};
/** all poses of the soldier, sharing one normalisation (the rest pose's) so feet never jump when the pose changes */
export const soldierPoses = (sc: THREE.Object3D): Poses => {
	const rest0 = bake(sc, 'rest', 1.8, 'y', /Jacket/); const N = rest0.norm;
	return Object.fromEntries(POSE_NAMES.map((p) => [p, bake(sc, p, 1.8, 'y', /Jacket/, N).parts])) as Poses;
};
const tex = async (f: string, srgb = false, rep = 1) => { const t = await new THREE.TextureLoader().loadAsync(A(f)); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
export const loadAssets = async (): Promise<Assets> => {
	const gl = new GLTFLoader();
	const [sky, gD, gN, gR, hi, lo, grass, sa, sb, water] = await Promise.all([
		new RGBELoader().loadAsync(A('sky.hdr')), tex('ground_diff.jpg', true, 520), tex('ground_nor.jpg', false, 520), tex('ground_rough.jpg', false, 520),
		gl.loadAsync(A('soldier.glb')), gl.loadAsync(A('soldier_lo.glb')), gl.loadAsync(A('grass/grass.gltf')), gl.loadAsync(A('ship_bucentaure.glb')), gl.loadAsync(A('ship_agamemnon.glb')),
		tex('waternormals.jpg', false, 1),
	]);
	sky.mapping = THREE.EquirectangularReflectionMapping;
	const pm = new THREE.PMREMGenerator(renderer); const env = pm.fromEquirectangular(sky).texture;
	const ship = (sc: THREE.Object3D) => { sc.traverse((o: any) => { if (o.isLine || o.isLineSegments) o.visible = false; }); return bake(sc, null, 58, 'len').parts; };
	return {sky, env, ground: [gD, gN, gR], hi: soldierPoses(hi.scene), lo: soldierPoses(lo.scene), grass: bake(grass.scene, null, 0.55, 'y').parts, shipA: ship(sa.scene), shipB: ship(sb.scene), water};
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
	const gmat = new THREE.MeshStandardMaterial({map: a.ground[0], normalMap: a.ground[1], roughnessMap: a.ground[2], color: '#d8d2b8', vertexColors: true});
	gmat.onBeforeCompile = (sh) => { sh.fragmentShader = sh.fragmentShader.replace('#include <map_fragment>', `#ifdef USE_MAP
		vec2 uvB = mat2(0.799, -0.602, 0.602, 0.799) * vMapUv * 0.173 + vec2(0.37, 0.71); vec2 uvC = mat2(0.276, 0.961, -0.961, 0.276) * vMapUv * 0.0491 + vec2(0.13, 0.52);
		float nz = 0.5 + 0.5 * sin(vMapUv.x * 0.031 + sin(vMapUv.y * 0.023) * 2.0) * sin(vMapUv.y * 0.027 + 1.3);
		vec4 sampledDiffuseColor = mix(mix(texture2D(map, vMapUv), texture2D(map, uvB), smoothstep(0.2, 0.8, nz)), texture2D(map, uvC), 0.35);
		diffuseColor *= sampledDiffuseColor;
	#endif`); };
	const ground = new THREE.Mesh(g, gmat);
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
type Pose = PoseName;
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
		for (const side of [0, 1] as const) for (const ps of POSE_NAMES) { this.sets[`hi-${ps}-${side}`] = mk(a.hi[ps], NEAR, side); this.sets[`lo-${ps}-${side}`] = mk(a.lo[ps], cap, side); }
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
	let p: Pose = pose; if (pose === 'aim' && sim.kind === 'rifle') { p = 'rest'; if (t > sim.t0 - 0.9 && fallK > 2.5) p = 'aim'; // time-lapsed fights: everyone is firing all the time
		else { for (const ft of F[i]) if (t > ft - 0.9 * fallK && t < ft + 0.5 * fallK) { p = 'aim'; break; } if (t < sim.t0 + 0.6 && t > sim.t0 - 0.9) p = 'aim'; } }
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
		sm.push([u.x + dx + dir * (MUZZLE.fwd + 0.1 + age * 0.7) + age * 0.6, MUZZLE.y + 0.05 + age * 0.75, u.z + dz + age * 0.8 + (u.fx - 0.5) * 1.5, sz, 0.9, 0.88, 0.84, a]);
		if (age < 0.09) fl.push([u.x + dx + dir * MUZZLE.fwd, MUZZLE.y, u.z + dz, 0.9 + (1 - age / 0.09) * 0.8, 2.4, 1.6, 0.7, 1 - age / 0.09]);
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
		const x1 = a.x + dir * MUZZLE.fwd + dx, z1 = a.z + dz, y1 = MUZZLE.y; const tx = s.hit ? b.x + dx : b.x + dx + dir * 3, tz = b.z + dz + (s.hit ? 0 : (a.fx - 0.5) * 3), ty = s.hit ? 1.3 : 0.9;
		const f0 = Math.max(0, age / FLIGHT - len), f1 = age / FLIGHT; const c = a.side ? [3.2, 1.6, 1.1] : [1.4, 2.1, 3.4];
		out.push([x1 + (tx - x1) * f0, y1 + (ty - y1) * f0, z1 + (tz - z1) * f0, x1 + (tx - x1) * f1, y1 + (ty - y1) * f1, z1 + (tz - z1) * f1, c[0] * br, c[1] * br, c[2] * br]); }
	return out;
};

// ================================================================ glowing ground squares (strength = area)
/** squares on the field as lit slabs: a tinted floor, glowing walls that fade upward, and bright edge ribbons */
const wallTex = (() => { let t: THREE.CanvasTexture | null = null; return () => { if (t) return t; const c = document.createElement('canvas'); c.width = 4; c.height = 128; const g = c.getContext('2d')!; const gr = g.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.75, 'rgba(255,255,255,0.35)'); gr.addColorStop(1, 'rgba(255,255,255,1)'); g.fillStyle = gr; g.fillRect(0, 0, 4, 128); t = new THREE.CanvasTexture(c); return t; }; })();
export class GroundSquares {
	group = new THREE.Group(); items: {floor: THREE.Mesh; walls: THREE.Mesh[]; edges: THREE.Mesh[]}[] = [];
	constructor(scene: THREE.Scene, n: number) { scene.add(this.group);
		const add = (m: THREE.Mesh) => { m.renderOrder = 1; m.frustumCulled = false; this.group.add(m); return m; };
		for (let i = 0; i < n; i++) {
			const floor = add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({transparent: true, depthWrite: false, toneMapped: false})));
			const walls = [0, 1, 2, 3].map(() => add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1).translate(0, 0.5, 0), new THREE.MeshBasicMaterial({map: wallTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false}))));
			const edges = [0, 1, 2, 3].map(() => add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false}))));
			this.items.push({floor, walls, edges}); } }
	/** each: {x, z (corner), w, d, color, a, edge?, edgeColor?, wall?} ; corner at (x, z), extends +x, +z */
	set(list: {x: number; z: number; w: number; d: number; color: string; a: number; edge?: number; edgeColor?: string; wall?: number}[]) {
		this.items.forEach((it, i) => { const s = list[i]; const on = !!s && s.a > 0.001; it.floor.visible = on; it.walls.forEach((m) => (m.visible = on)); it.edges.forEach((m) => (m.visible = on)); if (!s || !on) return;
			const y = 0.12 + i * 0.03, cx = s.x + s.w / 2, cz = s.z + s.d / 2, ec = s.edgeColor ?? s.color, ew = Math.max(0.6, Math.min(3.2, Math.max(s.w, s.d) * 0.006)), wh = (s.wall ?? 1) * Math.min(14, Math.max(2, Math.max(s.w, s.d) * 0.03));
			it.floor.position.set(cx, y, cz); it.floor.scale.set(s.w, 1, s.d); const fm = it.floor.material as THREE.MeshBasicMaterial; fm.color.set(s.color); fm.opacity = 0.3 * s.a;
			const sides = [[cx, s.z, s.w, 0], [cx, s.z + s.d, s.w, 0], [s.x, cz, s.d, Math.PI / 2], [s.x + s.w, cz, s.d, Math.PI / 2]];
			sides.forEach(([x, z, len, ry], k) => { const w = it.walls[k]; w.position.set(x, y, z); w.rotation.set(0, ry, 0); w.scale.set(len, wh, 1); const wm = w.material as THREE.MeshBasicMaterial; wm.color.set(ec); wm.opacity = 0.32 * s.a * (s.edge ?? 1) * (s.wall ?? 1);
				const e = it.edges[k]; e.position.set(x, y + 0.02, z); e.rotation.set(0, ry, 0); e.scale.set(len + ew, 1, ew); const em = e.material as THREE.MeshBasicMaterial; em.color.set(ec).multiplyScalar(1.6); em.opacity = (s.edge ?? 1) * s.a; });
		});
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
