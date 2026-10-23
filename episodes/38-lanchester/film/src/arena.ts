// ep38 v5: the game arena (generic fantasy heroes, KayKit CC0) and the city aerial (Osaka photogrammetry, CC BY) for the real-life examples.
import * as THREE from 'three';
import {GLTFLoader, type GLTF} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {clone as skClone} from 'three/examples/jsm/utils/SkeletonUtils.js';
import {A, toScreen} from './engine';

export const HERO_NAMES = ['Knight', 'Barbarian', 'Mage', 'Rogue', 'Rogue_Hooded'] as const;
export type HeroPose = {char: number; side: 0 | 1; x: number; z: number; ry: number; clip: string; time: number; hp: number; dead?: number};
const tex = async (f: string, srgb: boolean, rep: number) => { const t = await new THREE.TextureLoader().loadAsync(A(f)); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
const fit = (o: THREE.Object3D, size: number, along: 'y' | 'xz' = 'y') => { o.updateMatrixWorld(true); const bb = new THREE.Box3().setFromObject(o); const s = bb.getSize(new THREE.Vector3()); const k = size / (along === 'y' ? s.y : Math.max(s.x, s.z)); o.scale.multiplyScalar(k); o.updateMatrixWorld(true); const b2 = new THREE.Box3().setFromObject(o); const c = b2.getCenter(new THREE.Vector3()); o.position.x -= c.x; o.position.z -= c.z; o.position.y -= b2.min.y; return o; };

export type Arena = {scene: THREE.Scene; set: (heroes: HeroPose[]) => void; bolts: THREE.Group; bolt: (a: number[], b: number[], k: number, col: string) => void; clearBolts: () => void; heroTop: (h: HeroPose) => number[]};
export const makeArena = async (sky: THREE.Texture, env: THREE.Texture): Promise<Arena> => {
	const gl = new GLTFLoader();
	const chars: GLTF[] = await Promise.all(HERO_NAMES.map((n) => gl.loadAsync(A(`v2/kaykit/${n}.glb`))));
	const sc = new THREE.Scene(); sc.background = sky; sc.environment = env; sc.environmentIntensity = 0.6; sc.backgroundIntensity = 0.7; sc.fog = new THREE.Fog('#2a2430', 30, 90);
	const [cd, cn, cr, gd, gn] = await Promise.all([tex('v2/polyhaven/cobblestone_floor_07/textures/cobblestone_floor_07_diff_2k.jpg', true, 4), tex('v2/polyhaven/cobblestone_floor_07/textures/cobblestone_floor_07_nor_gl_2k.jpg', false, 4), tex('v2/polyhaven/cobblestone_floor_07/textures/cobblestone_floor_07_rough_2k.jpg', false, 4), tex('ground_diff.jpg', true, 18), tex('ground_nor.jpg', false, 18)]);
	const plaza = new THREE.Mesh(new THREE.CircleGeometry(10, 64).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({map: cd, normalMap: cn, roughnessMap: cr, color: '#a89c90'})); plaza.position.y = 0.02; plaza.receiveShadow = true; sc.add(plaza);
	const grass = new THREE.Mesh(new THREE.CircleGeometry(80, 64).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({map: gd, normalMap: gn, color: '#9fae7a'})); grass.receiveShadow = true; sc.add(grass);
	const rim = new THREE.Mesh(new THREE.TorusGeometry(10, 0.35, 10, 96).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({color: '#7d7468', roughness: 0.9})); rim.position.y = 0.1; rim.receiveShadow = rim.castShadow = true; sc.add(rim);
	const RA = (() => { let s = 3; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();
	for (let i = 0; i < 30; i++) { const a = RA() * Math.PI * 2, d = 15 + RA() * 20, h = 3 + RA() * 4; const t = new THREE.Mesh(new THREE.IcosahedronGeometry(h * 0.45, 1), new THREE.MeshStandardMaterial({color: new THREE.Color().setHSL(0.27 + RA() * 0.05, 0.35, 0.22 + RA() * 0.08), roughness: 1, flatShading: true})); t.position.set(Math.cos(a) * d, h * 0.75, Math.sin(a) * d); t.castShadow = true; sc.add(t);
		const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.22, h * 0.6, 6), new THREE.MeshStandardMaterial({color: '#4a3424'})); tr.position.set(t.position.x, h * 0.3, t.position.z); sc.add(tr); }
	const sun = new THREE.DirectionalLight('#ffd9b0', 3.2); sun.position.set(-10, 18, 8); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, {left: -20, right: 20, top: 20, bottom: -20}); sc.add(sun, new THREE.HemisphereLight('#c8d4ff', '#3a2a20', 0.5));
	// a pool of heroes: 7 per side, each with its own skeleton and mixer
	type Slot = {wrap: THREE.Group; mixer: THREE.AnimationMixer; char: number; ring: THREE.Mesh; action?: THREE.AnimationAction; clip?: string};
	const pool: Slot[] = [];
	for (let side = 0; side < 2; side++) for (let i = 0; i < 7; i++) { const char = i % HERO_NAMES.length; const o = skClone(chars[char].scene); fit(o, 1.8); o.traverse((m: any) => { if (m.isMesh) { m.castShadow = true; m.frustumCulled = false; } });
		const wrap = new THREE.Group(); wrap.add(o); wrap.visible = false; sc.add(wrap);
		const ring = new THREE.Mesh(new THREE.RingGeometry(0.75, 0.95, 40).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({color: side ? '#ff4a3a' : '#3a8bff', transparent: true, opacity: 0.9, toneMapped: false, depthWrite: false})); ring.visible = false; sc.add(ring);
		pool.push({wrap, mixer: new THREE.AnimationMixer(o), char, ring}); }
	const bolts = new THREE.Group(); sc.add(bolts);
	const sphere = new THREE.SphereGeometry(0.22, 16, 12), cyl = new THREE.CylinderGeometry(0.05, 0.12, 1, 8);
	return {
		scene: sc, bolts,
		set: (heroes) => {
			const used = new Set<Slot>();
			for (const h of heroes) { const s = pool.find((p) => !used.has(p) && p.char === h.char && pool.indexOf(p) >= (h.side ? 7 : 0) && pool.indexOf(p) < (h.side ? 14 : 7)); if (!s) continue; used.add(s);
				s.wrap.visible = true; s.wrap.position.set(h.x, 0, h.z); s.wrap.rotation.y = h.ry; s.ring.visible = h.dead === undefined; s.ring.position.set(h.x, 0.04, h.z);
				const clipName = h.dead !== undefined ? 'Death_A' : h.clip; if (s.clip !== clipName) { s.mixer.stopAllAction(); const c = chars[s.char].animations.find((a) => a.name === clipName) ?? chars[s.char].animations[0]; s.action = s.mixer.clipAction(c); s.action.setLoop(h.dead !== undefined ? THREE.LoopOnce : THREE.LoopRepeat, Infinity); s.action.clampWhenFinished = true; s.action.play(); s.clip = clipName; }
				s.mixer.setTime(h.dead !== undefined ? h.dead : h.time); }
			for (const p of pool) if (!used.has(p)) { p.wrap.visible = false; p.ring.visible = false; }
		},
		bolt: (a, b, k, col) => { const A0 = new THREE.Vector3(...a), B0 = new THREE.Vector3(...b), p = A0.clone().lerp(B0, k); const s = new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({color: new THREE.Color(col).multiplyScalar(4), toneMapped: false})); s.position.copy(p); bolts.add(s);
			const len = Math.min(p.distanceTo(A0), 3.5); const l = new THREE.Mesh(cyl, new THREE.MeshBasicMaterial({color: new THREE.Color(col).multiplyScalar(2.5), transparent: true, opacity: 0.55, toneMapped: false})); l.scale.set(1, len, 1); const back = p.clone().add(A0.clone().sub(p).setLength(len / 2)); l.position.copy(back); l.lookAt(p); l.rotateX(Math.PI / 2); bolts.add(l); },
		clearBolts: () => { while (bolts.children.length) bolts.remove(bolts.children[0]); },
		heroTop: (h) => [h.x, 2.45, h.z],
	};
};
/** HP bar above a hero (HUD) */
export const hpBar = (hud: HTMLElement, p: number[], k: number, side: 0 | 1, o = 1) => { const q = toScreen(p); if (!q.front || o <= 0) return; const col = side ? '#ff5a47' : '#4aa0ff';
	hud.insertAdjacentHTML('beforeend', `<div style="position:absolute;left:${q.x - 46}px;top:${q.y}px;width:92px;height:11px;background:rgba(10,10,14,.75);border:2px solid rgba(0,0,0,.8);border-radius:3px;opacity:${o}"><div style="width:${Math.max(0, k) * 100}%;height:100%;background:${col};box-shadow:0 0 8px ${col}"></div></div>`); };

// ---------------------------------------------------------------- the city
export type City = {scene: THREE.Scene; setGlow: (zones: {x: number; z: number; r: number; color: string; k: number}[]) => void};
export const makeCity = async (sky: THREE.Texture, env: THREE.Texture): Promise<City> => {
	const gl = new GLTFLoader(); const os = await gl.loadAsync(A('v2/models/osaka.glb'));
	const sc = new THREE.Scene(); sc.background = new THREE.Color('#241c22'); sc.environment = env; sc.environmentIntensity = 0.7; sc.fog = new THREE.Fog('#241c22', 750, 1500);
	const city = fit(os.scene, 1200, 'xz'); sc.add(city);
	const under = new THREE.Mesh(new THREE.PlaneGeometry(6000, 6000).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({color: '#2a2228', roughness: 1})); under.position.y = 2; sc.add(under);
	sc.add(Object.assign(new THREE.DirectionalLight('#ffcf9a', 2.4), {position: new THREE.Vector3(-400, 300, -300)}), new THREE.HemisphereLight('#d8e0ff', '#40302a', 0.5));
	// zones tint the buildings themselves: up to 8 discs (x, z, r) with colour × strength, added as emissive in the city's own shader
	const N = 8; const zoneU = {value: Array.from({length: N}, () => new THREE.Vector4(0, 0, 0, 0))}, colU = {value: Array.from({length: N}, () => new THREE.Vector3())};
	city.traverse((m: any) => { if (!m.isMesh) return; const mat = m.material as THREE.MeshStandardMaterial; mat.onBeforeCompile = (sh) => {
		sh.uniforms.zones = zoneU; sh.uniforms.zcol = colU;
		sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWp;').replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWp = (modelMatrix * vec4(transformed, 1.0)).xyz;');
		sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>\nvarying vec3 vWp; uniform vec4 zones[${N}]; uniform vec3 zcol[${N}];`).replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
			for (int i = 0; i < ${N}; i++) { float d = length(vWp.xz - zones[i].xy); float k = zones[i].w * (1.0 - smoothstep(zones[i].z * 0.82, zones[i].z, d)); totalEmissiveRadiance += zcol[i] * k * (0.35 + 0.65 * smoothstep(0.0, 80.0, vWp.y)); }`); }; mat.needsUpdate = true; });
	return {scene: sc, setGlow: (zones) => { for (let i = 0; i < N; i++) { const z = zones[i]; if (!z) { zoneU.value[i].set(0, 0, 0, 0); continue; } zoneU.value[i].set(z.x, z.z, z.r, z.k); const c = new THREE.Color(z.color); colU.value[i].set(c.r, c.g, c.b); } }};
};
