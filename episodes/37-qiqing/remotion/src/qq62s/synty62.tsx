/* Synty POLYGON Ancient Egypt · look test (owner 2026-11-07: "see if you will be able to use these").
   The FBX source files + texture atlas, loaded with three.js FBXLoader inside Remotion. The assets are NOT in the repo (licence + public
   repo): they live in a local public dir built by mkpub (PUBLIC_DIR=/dev/shm/synty/pub). Units are Synty's centimetres.
   Compositions: HEADS62 (diagnostic: every body and head piece in a row), SYNTY62 (8 s: the avenue at golden hour, then the gods),
   SYNTYB62 (look v2 after "the lighting, facial expressions etc is very mid": normal + glow maps, image-based light, a film lighting set-up,
   haze, light shafts, dust, AO + bloom + depth of field + grade, eyebrow/eye acting). */
import React, {useEffect, useMemo, useState} from 'react';
import {AbsoluteFill, Composition, continueRender, delayRender, registerRoot, staticFile, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useFrame, useThree} from '@react-three/fiber';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {GTAOPass} from 'three/examples/jsm/postprocessing/GTAOPass.js';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {BokehPass} from 'three/examples/jsm/postprocessing/BokehPass.js';
import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass.js';
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass.js';
import * as THREE from 'three';
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader.js';
import {clone as skClone} from 'three/examples/jsm/utils/SkeletonUtils.js';

const W = 1440, H = 1080, FPS = 30;
type MatMap = {mat: Record<string, string[]>; tex: string[]};
type Lib = {fbx: Record<string, THREE.Group>; tex: Record<string, THREE.Texture>; mm: MatMap};
const ATLAS = 'PolygonAncientEgypt_01_A.png';
const TILED = new Set(['Wall_Hieroglyph_01.png', 'Wall_Mural_01.png', 'Wall_Mural_02.png', 'Stucco_01.png', 'Temple_Middle_01.png', 'Temple_Middle_01_Normals.png', 'Ornate_Marble_01.png', 'Ornate_Marble_01_Normals.png']);
const ATLAS_N = 'PolygonAncientEgypt_Texture_01_Normals.png', ATLAS_E = 'PolygonEgypt_Emissive_01_A.png';
const LINEAR = (n: string) => /_Normals\.png$/.test(n);

let LIB: Promise<Lib> | null = null;
const loadLib = (): Promise<Lib> => {
	if (LIB) return LIB;
	LIB = (async () => {
		const mm: MatMap = await (await fetch(staticFile('matmap.json'))).json();
		const tl = new THREE.TextureLoader(), fl = new FBXLoader();
		const tex: Record<string, THREE.Texture> = {};
		await Promise.all(mm.tex.map(async (n) => {
			const t = await tl.loadAsync(staticFile('tex/' + n)); t.colorSpace = LINEAR(n) ? THREE.NoColorSpace : THREE.SRGBColorSpace; t.anisotropy = 8;
			if (TILED.has(n)) t.wrapS = t.wrapT = THREE.RepeatWrapping;
			tex[n] = t;
		}));
		const fbx: Record<string, THREE.Group> = {};
		await Promise.all(Object.keys(mm.mat).map(async (p) => {
			const g = await fl.loadAsync(staticFile('fbx/' + p + '.fbx'));
			const slots = mm.mat[p];
			g.traverse((c) => {
				const m = c as THREE.Mesh; if (!m.isMesh) return;
				const one = (i: number) => {
					const n = slots[i] ?? slots[0] ?? ATLAS;
					if (p === 'SM_Env_Skydome_01') return new THREE.MeshBasicMaterial({map: tex[n], side: THREE.BackSide, fog: false});
					const atlas = !tex[n] || n === ATLAS;
					// the atlas also has a normal map and a glow (emissive) map: gems, gold leaf and flames light up and catch the bloom
					return new THREE.MeshStandardMaterial({map: tex[n] ?? tex[ATLAS], roughness: 0.78, metalness: 0,
						...(atlas && tex[ATLAS_N] ? {normalMap: tex[ATLAS_N], normalScale: new THREE.Vector2(1, 1)} : {}),
						...(atlas && tex[ATLAS_E] ? {emissiveMap: tex[ATLAS_E], emissive: new THREE.Color('#FFFFFF'), emissiveIntensity: 1.2} : {})});
				};
				m.material = Array.isArray(m.material) ? m.material.map((_, i) => one(i)) : one(0);
				m.castShadow = true; m.receiveShadow = true;
			});
			fbx[p] = g;
		}));
		return {fbx, tex, mm};
	})();
	return LIB;
};
const useLib = () => {
	const [lib, setLib] = useState<Lib | null>(null);
	const [h] = useState(() => delayRender('synty assets', {timeoutInMilliseconds: 240000}));
	useEffect(() => { loadLib().then((l) => { setLib(l); continueRender(h); }); }, [h]);
	return lib;
};

/* ---------- characters: one clone of Characters.fbx per figure, only its meshes visible, arms brought down from the T-pose ---------- */
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
/** rotate `bone` (in world space) so the direction bone -> child points along `dir` */
const aim = (bone: THREE.Object3D, child: THREE.Object3D, dir: THREE.Vector3) => {
	bone.updateWorldMatrix(true, true);
	const a = V(0, 0, 0).setFromMatrixPosition(bone.matrixWorld), b = V(0, 0, 0).setFromMatrixPosition(child.matrixWorld);
	const dq = new THREE.Quaternion().setFromUnitVectors(b.sub(a).normalize(), dir.clone().normalize());
	const wq = new THREE.Quaternion(), pq = new THREE.Quaternion(); bone.getWorldQuaternion(wq); bone.parent!.getWorldQuaternion(pq);
	bone.quaternion.copy(pq.invert().multiply(dq.multiply(wq))); bone.updateWorldMatrix(false, true);
};
type Arms = 'down' | 'raise' | 'offer' | 'tpose';
const ARMS: Record<Arms, [THREE.Vector3, THREE.Vector3] | null> = {   // [upper arm, forearm] for the left (+x) arm; mirrored for the right
	tpose: null, down: [V(0.2, -1, 0.05), V(0.1, -1, 0.4)], raise: [V(0.55, 0.85, 0.15), V(0.2, 1, 0.1)], offer: [V(0.25, -0.8, 0.5), V(0.1, -0.15, 1)],
};
/** FBXLoader gives each extra skin that shares a node a "sub-bone", chained under the main bone (same name, several levels deep);
    pose the main bones so every skin (body + hair + head pieces) follows */
const mainOf = (b?: THREE.Object3D) => { let c = b; while (c && c.parent && c.parent.name === c.name) c = c.parent; return c; };
/** rotate a bone about a world axis */
const rotW = (bone: THREE.Object3D, axis: THREE.Vector3, ang: number) => {
	bone.updateWorldMatrix(true, false);
	const dq = new THREE.Quaternion().setFromAxisAngle(axis, ang), wq = new THREE.Quaternion(), pq = new THREE.Quaternion();
	bone.getWorldQuaternion(wq); bone.parent!.getWorldQuaternion(pq); bone.quaternion.copy(pq.invert().multiply(dq.multiply(wq))); bone.updateWorldMatrix(false, true);
};
const sm = (u: number) => { const v = Math.max(0, Math.min(1, u)); return v * v * (3 - 2 * v); };
type Gest = {side: 'L' | 'R'; to: Arms; t0: number; t1: number; back?: number};
/** brow: eyebrows up (+, surprise) / down (-, anger) in cm, eased in over [t0, t0 + 0.4]; eyes: a sideways glance in cm (the faces have no mouth
    bone or blendshapes: brows and eyes are all the pack's faces can do) */
type Face = {brow: number; t0?: number; eyes?: number};
type Fig = {body: string; att?: string[]; extra?: string[]; at: [number, number, number]; ry?: number; s?: number; arms?: Arms; armsR?: Arms; gest?: Gest; look?: number; ph?: number; face?: Face};
const Figure: React.FC<{lib: Lib; f: Fig; t?: number}> = ({lib, f, t = 0}) => {
	const rig = useMemo(() => {
		const g = new THREE.Group();
		const c = skClone(lib.fbx.Characters) as THREE.Group; const keep = new Set([f.body, ...(f.att ?? [])]);
		let body: THREE.SkinnedMesh | null = null;
		c.traverse((o) => { const m = o as THREE.SkinnedMesh; if (!m.isMesh) return; m.visible = keep.has(m.name); if (m.name === f.body) body = m; m.frustumCulled = false; });
		g.add(c); c.updateMatrixWorld(true);
		const B = (n: string) => (body ? mainOf((body as THREE.SkinnedMesh).skeleton.bones.find((b) => b.name === n)) : undefined);
		const bones = {shL: B('Shoulder_L'), elL: B('Elbow_L'), haL: B('Hand_L'), shR: B('Shoulder_R'), elR: B('Elbow_R'), haR: B('Hand_R'), sp: B('Spine_02'), hd: B('Head'), br: B('Eyebrows'), ey: B('Eyes')};
		const rest = new Map<THREE.Object3D, [THREE.Quaternion, THREE.Vector3]>(); Object.values(bones).forEach((b) => b && rest.set(b, [b.quaternion.clone(), b.position.clone()]));
		// static head pieces (crowns, the leopard head) are modelled around the head joint: hang them on the main Head bone, world-aligned
		for (const e of f.extra ?? []) {
			const x = lib.fbx[e].clone(), hd = bones.hd;
			if (hd) { const hp = V(0, 0, 0).setFromMatrixPosition(hd.matrixWorld); x.applyMatrix4(hd.matrixWorld.clone().invert().multiply(new THREE.Matrix4().makeTranslation(hp.x, hp.y, hp.z))); hd.add(x); }
			else g.add(x);
		}
		return {g, c, bones, rest};
	}, [lib, f]);
	// per frame: back to the bind pose, then idle sway, arms (world directions), head turn; posed with the group at identity
	const {g, c, bones: k, rest} = rig;
	g.position.set(0, 0, 0); g.rotation.set(0, 0, 0); g.scale.setScalar(1);
	rest.forEach(([q, p], b) => { b.quaternion.copy(q); b.position.copy(p); }); c.updateMatrixWorld(true);
	const ph = f.ph ?? 0;
	if (k.sp) { rotW(k.sp, V(0, 1, 0), 0.05 * Math.sin(t * 0.8 + ph)); rotW(k.sp, V(1, 0, 0), 0.015 * Math.sin(t * 1.7 + ph)); }
	for (const s of ['L', 'R'] as const) {
		const sh = s === 'L' ? k.shL : k.shR, el = s === 'L' ? k.elL : k.elR, ha = s === 'L' ? k.haL : k.haR; if (!sh || !el || !ha) continue;
		const base = ARMS[s === 'R' && f.armsR ? f.armsR : f.arms ?? 'down']; if (!base) continue;
		let p = base;
		if (f.gest && f.gest.side === s) { const to = ARMS[f.gest.to]!; const u = sm((t - f.gest.t0) / (f.gest.t1 - f.gest.t0)) * (f.gest.back ? 1 - sm((t - f.gest.back) / 0.7) : 1);
			p = [base[0].clone().lerp(to[0], u), base[1].clone().lerp(to[1], u)]; }
		const side = Math.sign(V(0, 0, 0).setFromMatrixPosition(sh.matrixWorld).x) || 1;
		aim(sh, el, V(p[0].x * side, p[0].y, p[0].z)); aim(el, ha, V(p[1].x * side, p[1].y, p[1].z));
	}
	if (k.hd && f.look) rotW(k.hd, V(0, 1, 0), f.look * Math.sin(t * 0.45 + ph));
	const nudge = (b: THREE.Object3D | undefined, d: THREE.Vector3) => {   // move a bone by a world-space offset
		if (!b || !b.parent) return; b.parent.updateWorldMatrix(true, false);
		const w = V(0, 0, 0).setFromMatrixPosition(b.matrixWorld).add(d); b.position.copy(b.parent.worldToLocal(w)); b.updateWorldMatrix(false, true);
	};
	if (f.face) {
		const u = f.face.t0 === undefined ? 1 : sm((t - f.face.t0) / 0.4);
		// posed with the group at identity, so world up / world x are the figure's own up / sideways
		nudge(k.br, V(0, f.face.brow * u, 0));
		if (f.face.eyes) nudge(k.ey, V(f.face.eyes * u, 0, 0));
	}
	g.position.set(...f.at); g.rotation.y = f.ry ?? 0; g.scale.setScalar(f.s ?? 1); g.updateMatrixWorld(true);
	return <primitive object={g} />;
};
const Piece: React.FC<{lib: Lib; p: string; at: [number, number, number]; ry?: number; s?: number | [number, number, number]}> = ({lib, p, at, ry = 0, s = 1}) => {
	const obj = useMemo(() => lib.fbx[p].clone(), [lib, p]);
	return <primitive object={obj} position={at} rotation={[0, ry, 0]} scale={s} />;
};
const Cam: React.FC<{pos: THREE.Vector3; look: THREE.Vector3; fov: number}> = ({pos, look, fov}) => {
	const {camera} = useThree();
	const c = camera as THREE.PerspectiveCamera; c.position.copy(pos); c.fov = fov; c.near = 10; c.far = 700000; c.updateProjectionMatrix(); c.lookAt(look);
	return null;
};
const Canvas: React.FC<{children: React.ReactNode; exposure?: number; fog?: [string, number, number]}> = ({children, exposure = 1.0, fog}) =>
	<ThreeCanvas width={W} height={H} shadows gl={{antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: exposure, preserveDrawingBuffer: true}}>
		{fog && <fog attach="fog" args={[fog[0], fog[1], fog[2]]} />}
		{children}
	</ThreeCanvas>;

/* ---------- HEADS62: what is in the pack (diagnostic, not for the owner) ---------- */
const BODIES = ['SM_Chr_Pharaoh_01', 'SM_Chr_Queen_01', 'SM_Chr_Guard_Male_01', 'SM_Chr_Guard_Female_01', 'SM_Chr_Priest_01', 'SM_Chr_Priestess_01', 'SM_Chr_Fancy_Villager_Male_01',
	'SM_Chr_Fancy_Villager_Female_01', 'SM_Chr_Villager_Male_01', 'SM_Chr_Assassin_01', 'SM_Chr_Mummy_01', 'SM_Chr_Mummy_02', 'SM_Chr_Mummy_03'];
const HEADS = ['SM_Chr_Attach_Headpiece_01', 'SM_Chr_Attach_Headpiece_02', 'SM_Chr_Attach_Headpiece_03', 'SM_Chr_Attach_Headpiece_04', 'SM_Chr_Attach_Headpiece_05',
	'SM_Chr_Attach_Headpiece_Pharaoh_01', 'SM_Chr_Attach_Headpiece_Pharaoh_04', 'SM_Chr_Attach_Headdress_01', 'SM_Chr_Attach_Hood_01', 'SM_Chr_Attach_Mask_01'];
const EXTRA = ['SM_Chr_Attach_Crown_01', 'SM_Chr_Attach_Crown_02', 'SM_Chr_Attach_Crown_03', 'SM_Chr_Attach_Leopard_Head_01'];
const Heads: React.FC<{row: number}> = ({row}) => {
	const lib = useLib();
	const figs: Fig[] = row === 0 ? BODIES.map((b, i) => ({body: b, at: [(i - 6) * 75, 0, 0]}))
		: [...HEADS.map((h) => ({body: 'SM_Chr_Assassin_01', att: [h]})), ...EXTRA.map((e) => ({body: 'SM_Chr_Assassin_01', extra: [e]}))].map((f, i) => ({...f, at: [(i - 6.5) * 70, 0, 0] as [number, number, number]}));
	return <AbsoluteFill style={{background: '#8A8F99'}}>{lib && <Canvas exposure={1.1}>
		<Cam pos={V(0, row === 0 ? 120 : 150, 1250)} look={V(0, row === 0 ? 95 : 120, 0)} fov={row === 0 ? 42 : 40} />
		<hemisphereLight args={['#FFFFFF', '#776655', 1.6]} /><directionalLight position={[300, 600, 900]} intensity={2.2} />
		{figs.map((f, i) => <Figure key={i} lib={lib} f={f} />)}
	</Canvas>}</AbsoluteFill>;
};

/* ---------- SYNTY62: the look test ---------- */
const Sun: React.FC<{pos: [number, number, number]; target: [number, number, number]; i: number; color: string; ext: number}> = ({pos, target, i, color, ext}) => {
	const light = useMemo(() => { const l = new THREE.DirectionalLight(color, i); l.castShadow = true; l.shadow.mapSize.set(2048, 2048);
		const c = l.shadow.camera; c.left = -ext; c.right = ext; c.top = ext; c.bottom = -ext; c.near = 100; c.far = 60000; l.shadow.bias = -0.0004; l.shadow.normalBias = 2; return l; }, [color, i, ext]);
	light.position.set(...pos); light.target.position.set(...target); light.target.updateMatrixWorld();
	return <><primitive object={light} /><primitive object={light.target} /></>;
};
const Ground: React.FC<{color: string}> = ({color}) => <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[600000, 600000]} /><meshStandardMaterial color={color} roughness={1} /></mesh>;
/** a sky dome: horizon -> mid -> zenith gradient, a sun disc with a glow, optional stars */
const Sky: React.FC<{top: string; mid: string; hor: string; sun: THREE.Vector3; sunI?: number; stars?: number; T?: number}> = ({top, mid, hor, sun, sunI = 1, stars = 0, T = 0}) => {
	const mat = useMemo(() => new THREE.ShaderMaterial({side: THREE.BackSide, depthWrite: false, fog: false,
		uniforms: {top: {value: new THREE.Color(top)}, mid: {value: new THREE.Color(mid)}, hor: {value: new THREE.Color(hor)}, sun: {value: sun.clone().normalize()}, sunI: {value: sunI}, stars: {value: stars}, T: {value: 0}},
		vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
		fragmentShader: `uniform vec3 top, mid, hor, sun; uniform float sunI, stars, T; varying vec3 vP;
			float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
			void main(){ vec3 d = normalize(vP); float h = clamp(d.y, 0.0, 1.0);
				vec3 c = mix(hor, mid, smoothstep(0.0, 0.16, h)); c = mix(c, top, smoothstep(0.16, 0.75, h));
				float s = max(dot(d, sun), 0.0); c += sunI * vec3(1.0, 0.72, 0.42) * (pow(s, 900.0) * 6.0 + pow(s, 40.0) * 0.5 + pow(s, 6.0) * 0.18);
				if (stars > 0.0) { vec2 g = vec2(atan(d.z, d.x) * 260.0, d.y * 260.0); vec2 id = floor(g); float r = h21(id);
					if (r > 0.985) { vec2 f = fract(g) - 0.5; float tw = 0.6 + 0.4 * sin(T * (1.0 + r * 3.0) + r * 40.0); c += stars * tw * smoothstep(0.18, 0.0, length(f)) * smoothstep(0.05, 0.3, h); } }
				gl_FragColor = vec4(c, 1.0);
				#include <tonemapping_fragment>
				#include <colorspace_fragment>
			}`}), [top, mid, hor, sun, sunI, stars]);
	mat.uniforms.T.value = T;
	return <mesh material={mat} scale={300000} renderOrder={-1} frustumCulled={false}><sphereGeometry args={[1, 48, 24]} /></mesh>;
};
/** a whole pyramid as one textured 4-sided cone (the pack's pyramid is modular blocks; fine for distance) */
const Pyramid: React.FC<{lib: Lib; at: [number, number, number]; base: number; h: number; ry?: number}> = ({lib, at, base, h, ry = 0.3}) => {
	const mat = useMemo(() => { const t = lib.tex['Stucco_01.png'].clone(); t.repeat.set(10, 10); t.needsUpdate = true; return new THREE.MeshStandardMaterial({map: t, color: '#E9C48C', roughness: 0.95}); }, [lib]);
	return <mesh position={[at[0], at[1] + h / 2, at[2]]} rotation={[0, Math.PI / 4 + ry, 0]} material={mat} castShadow receiveShadow><coneGeometry args={[base / Math.SQRT2, h, 4, 1]} /></mesh>;
};
/** brazier fire: additive glow sprites that flicker on their own clock, plus the light they throw */
const glowTex = (() => { let t: THREE.Texture | null = null; return () => {
	if (t) return t; const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d')!;
	const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,240,200,1)'); g.addColorStop(0.25, 'rgba(255,170,70,0.85)'); g.addColorStop(1, 'rgba(255,90,20,0)');
	x.fillStyle = g; x.fillRect(0, 0, 128, 128); t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }; })();
const Fire: React.FC<{at: [number, number, number]; T: number; seed: number; light?: boolean}> = ({at, T, seed, light = true}) => {
	const mat = useMemo(() => new THREE.SpriteMaterial({map: glowTex(), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false}), []);
	const fl = 0.82 + 0.1 * Math.sin(T * 11 + seed) + 0.08 * Math.sin(T * 23.7 + seed * 2);
	return <group position={at}>
		{[0, 1, 2].map((i) => { const p = ((T * 0.9 + i / 3 + seed * 0.13) % 1); return <sprite key={i} material={mat} position={[6 * Math.sin(T * 3 + i + seed), 10 + p * 55, 0]} scale={(70 - 40 * p) * fl} />; })}
		<sprite material={mat} position={[0, 18, 0]} scale={150 * fl} />
		{light && <pointLight position={[0, 40, 0]} intensity={45000 * fl} distance={2600} decay={1.5} color="#FF9A3C" castShadow={seed === 1} />}
	</group>;
};

// the pack's god heads: Headpiece_01 falcon (Horus; + Crown_01 sun disc = Ra), _02 jackal (Anubis), _03 hippo (Taweret), _04 cat (Bastet),
// _05 crocodile (Sobek); Crown_03 = Amun's plumes
const GODS: Fig[] = [
	{body: 'SM_Chr_Guard_Male_01', att: ['SM_Chr_Attach_Headpiece_02'], at: [-300, 0, 0], ry: 0.3, look: 0.25, ph: 1},
	{body: 'SM_Chr_Queen_01', extra: ['SM_Chr_Attach_Headpiece_Queen_01'], at: [-150, 0, 40], ry: 0.18, arms: 'down', gest: {side: 'L', to: 'offer', t0: 1.0, t1: 1.8}, look: 0.2, ph: 2},
	{body: 'SM_Chr_Priest_01', att: ['SM_Chr_Attach_Headpiece_01'], extra: ['SM_Chr_Attach_Crown_01'], at: [0, 0, 70], ry: 0, arms: 'down', gest: {side: 'R', to: 'raise', t0: 0.5, t1: 1.5}, look: 0.12, ph: 0},
	{body: 'SM_Chr_Pharaoh_01', att: ['SM_Chr_Attach_Headpiece_Pharaoh_04'], at: [150, 0, 40], ry: -0.18, look: 0.22, ph: 3},
	{body: 'SM_Chr_Priestess_01', att: ['SM_Chr_Attach_Headpiece_04'], at: [300, 0, 0], ry: -0.3, arms: 'down', gest: {side: 'R', to: 'offer', t0: 1.6, t1: 2.4}, look: 0.25, ph: 4},
];
const SUN_A = V(0.36, 0.07, -1).normalize();
const Avenue: React.FC<{lib: Lib; t: number}> = ({lib, t}) => {
	// the camera glides down an avenue of god statues toward the sphinx; the pyramids stand in the haze, the sun low behind them
	const u = sm(t / 4);
	const pos = V(-220 + 140 * u, 190 - 40 * u, 4300 - 1500 * u), look = V(30 * u, 620 + 80 * u, -3000);
	const statues = [-1, 1].flatMap((sd) => [0, 1, 2, 3].map((k) => ({at: [sd * 520, 0, 1800 - k * 900] as [number, number, number], ry: -sd * Math.PI / 2, p: k % 2 ? 'SM_Prop_Statue_07' : 'SM_Prop_Statue_08'})));
	return <>
		<Cam pos={pos} look={look} fov={38} />
		<Sky top="#2B2F6E" mid="#B9677A" hor="#F6B27A" sun={SUN_A} sunI={1.2} />
		<hemisphereLight args={['#FFC9A0', '#5B3E2A', 1.0]} />
		<Sun pos={[SUN_A.x * 30000, 5200, SUN_A.z * 30000]} target={[0, 0, 0]} i={3.0} color="#FFB870" ext={6000} />
		<directionalLight position={[-6000, 3000, 8000]} intensity={0.55} color="#9FB2FF" />
		<Ground color="#C4925A" />
		<Piece lib={lib} p="SM_Bld_Sphinx_Large_01" at={[0, 0, -4600]} ry={0} s={0.85} />
		<Pyramid lib={lib} at={[-16000, 0, -70000]} base={23000} h={14600} /><Pyramid lib={lib} at={[9000, 0, -88000]} base={21500} h={13800} ry={0.45} /><Pyramid lib={lib} at={[26000, 0, -100000]} base={10500} h={6500} ry={0.2} />
		<Piece lib={lib} p="SM_Bld_Obelisk_Large_01" at={[-900, 0, -1300]} s={0.75} /><Piece lib={lib} p="SM_Bld_Obelisk_Large_01" at={[900, 0, -1300]} s={0.75} />
		{statues.map((s, i) => <Piece key={i} lib={lib} p={s.p} at={s.at} ry={s.ry} s={1.6} />)}
		{[-1, 1].flatMap((sd) => [0, 1, 2].map((k) => <Piece key={sd + '' + k} lib={lib} p={k % 2 ? 'SM_Env_Tree_Palm_02' : 'SM_Env_Tree_Palm_01'} at={[sd * (1600 + 500 * k), 0, 1400 - 1900 * k]} ry={k * 1.3 + sd} s={1 + 0.15 * k} />))}
		<Piece lib={lib} p="SM_Env_SandDunes_01" at={[-6200, -30, -9000]} s={2.2} /><Piece lib={lib} p="SM_Env_SandDunes_02" at={[6600, -30, -11000]} ry={1.2} s={2.4} />
		<Piece lib={lib} p="SM_Env_SandDunes_01" at={[-4200, -40, 2400]} ry={2.4} s={1.3} /><Piece lib={lib} p="SM_Env_SandDunes_02" at={[4600, -40, 3000]} ry={0.6} s={1.4} />
	</>;
};
const Gods: React.FC<{lib: Lib; t: number; T: number}> = ({lib, t, T}) => {
	// a temple court at night: fire in the braziers, painted pillars, the gods in a line; the camera dollies along them
	const u = sm(t / 4);
	const pos = V(-120 + 260 * u, 155, 800 - 80 * u), look = V(-20 + 90 * u, 128, 0);
	return <>
		<Cam pos={pos} look={look} fov={36} />
		<Sky top="#05061A" mid="#141A48" hor="#2E3566" sun={V(0, -1, 0)} sunI={0} stars={1.4} T={T} />
		<hemisphereLight args={['#7D86D8', '#2A1A10', 0.55]} />
		<Sun pos={[-2600, 3400, -2600]} target={[0, 100, 0]} i={1.6} color="#9DB0FF" ext={1800} />
		<Ground color="#6E4E33" />
		{[-1, 1].map((sd) => <group key={sd}><Piece lib={lib} p="SM_Prop_Brazier_01" at={[sd * 470, 0, 230]} s={1.2} /><Fire at={[sd * 470, 92, 230]} T={T} seed={sd === -1 ? 1 : 2} /></group>)}
		{[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((k) => <Piece key={k} lib={lib} p="SM_Bld_Pillar_Ornate_Large_01" at={[k * 420, 0, -440]} s={0.9} />)}
		<Piece lib={lib} p="SM_Prop_Statue_12" at={[-600, 0, -150]} ry={0.4} s={1.4} /><Piece lib={lib} p="SM_Prop_Statue_01" at={[600, 0, -150]} ry={-0.4} s={1.4} />
		{GODS.map((f, i) => <Figure key={i} lib={lib} f={f} t={t} />)}
	</>;
};
const Synty: React.FC = () => {
	const lib = useLib(); const f = useCurrentFrame(); const t = f / FPS;
	const wide = t < 4;
	return <AbsoluteFill style={{background: '#000'}}>{lib && (wide
		? <Canvas exposure={1.0} fog={['#EFAE7C', 14000, 150000]}><Avenue lib={lib} t={t} /></Canvas>
		: <Canvas exposure={1.2} fog={['#141A48', 2500, 9000]}><Gods lib={lib} t={t - 4} T={t} /></Canvas>)}</AbsoluteFill>;
};

/* ---------- look v2: the same temple shot, lit and finished like a film ---------- */
const GradeShader = {
	uniforms: {tDiffuse: {value: null as THREE.Texture | null}, T: {value: 0}, vig: {value: 0.6}, grain: {value: 0.03}},
	vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
	fragmentShader: `uniform sampler2D tDiffuse; uniform float T, vig, grain; varying vec2 vUv;
		float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
		void main(){ vec3 c = texture2D(tDiffuse, vUv).rgb; float l = dot(c, vec3(0.299, 0.587, 0.114));
			c = mix(c, c * vec3(0.82, 0.94, 1.15), (1.0 - smoothstep(0.0, 0.45, l)) * 0.55);   // cool shadows
			c = mix(c, c * vec3(1.1, 1.0, 0.86), smoothstep(0.45, 1.0, l) * 0.5);            // warm highlights
			c = (c - 0.5) * 1.07 + 0.5;
			vec2 d = vUv - 0.5; d.x *= 1.333; c *= 1.0 - vig * smoothstep(0.32, 0.95, length(d));
			c += (h(vUv * vec2(1440.0, 1080.0) + fract(T * 7.0)) - 0.5) * grain;
			gl_FragColor = vec4(c, 1.0); }`,
};
/** takes over rendering: scene -> ambient occlusion -> bloom -> depth of field -> tone map -> grade (vignette, grain, split tone) */
const Post: React.FC<{T: number; focus: number; aperture?: number; maxblur?: number; bloom?: [number, number, number]}> = ({T, focus, aperture = 1.1e-5, maxblur = 0.006, bloom = [0.5, 0.5, 0.92]}) => {
	const {gl, scene, camera} = useThree();
	const P = useMemo(() => {
		const c = new EffectComposer(gl); c.setPixelRatio(1); c.setSize(W, H);
		c.addPass(new RenderPass(scene, camera));
		const ao = new GTAOPass(scene, camera, W, H); ao.blendIntensity = 0.9; ao.updateGtaoMaterial({radius: 28, distanceExponent: 1.5, thickness: 60, scale: 1.2, samples: 16}); c.addPass(ao);
		c.addPass(new UnrealBloomPass(new THREE.Vector2(W, H), bloom[0], bloom[1], bloom[2]));
		const k = new BokehPass(scene, camera, {focus, aperture, maxblur}); c.addPass(k);
		c.addPass(new OutputPass());
		const g = new ShaderPass(GradeShader); c.addPass(g);
		return {c, k, g};
	}, [gl, scene, camera]);
	P.g.uniforms.T.value = T; (P.k.uniforms as unknown as Record<string, {value: number}>).focus.value = focus;
	useFrame(() => P.c.render(), 1);
	return null;
};
/** image-based light: a small night-sky dome with two fire spots, pre-filtered into scene.environment */
const EnvLight: React.FC<{k: number; warm: [number, number, number][]}> = ({k, warm}) => {
	const {gl, scene} = useThree();
	useMemo(() => {
		const es = new THREE.Scene();
		es.add(new THREE.Mesh(new THREE.SphereGeometry(100, 32, 16), new THREE.ShaderMaterial({side: THREE.BackSide,
			vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
			fragmentShader: 'varying vec3 vP; void main(){ float h = normalize(vP).y; vec3 c = mix(vec3(0.10, 0.07, 0.05), vec3(0.16, 0.2, 0.42), smoothstep(-0.2, 0.15, h)); c = mix(c, vec3(0.03, 0.04, 0.12), smoothstep(0.2, 0.9, h)); gl_FragColor = vec4(c, 1.0); }'})));
		for (const w of warm) { const m = new THREE.Mesh(new THREE.SphereGeometry(9, 12, 8), new THREE.MeshBasicMaterial({color: new THREE.Color(4, 1.9, 0.6)})); m.position.set(...w); es.add(m); }
		const pm = new THREE.PMREMGenerator(gl); scene.environment = pm.fromScene(es, 0, 0.1, 1000).texture; scene.environmentIntensity = k; pm.dispose();
	}, [gl, scene, k, warm]);
	return null;
};
const canvasTex = (w: number, h: number, draw: (x: CanvasRenderingContext2D) => void) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d')!); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
const shaftTex = (() => { let t: THREE.Texture | null = null; return () => t ?? (t = canvasTex(64, 256, (x) => {
	const g = x.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, 'rgba(255,255,255,0.9)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 256);
	x.globalCompositeOperation = 'destination-in'; const s = x.createLinearGradient(0, 0, 64, 0); s.addColorStop(0, 'rgba(0,0,0,0)'); s.addColorStop(0.5, 'rgba(0,0,0,1)'); s.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = s; x.fillRect(0, 0, 64, 256); })); })();
const hazeTex = (() => { let t: THREE.Texture | null = null; return () => { if (t) return t; let r = 7; const R = () => (r = (r * 16807) % 2147483647) / 2147483647;
	t = canvasTex(512, 512, (x) => { for (let i = 0; i < 70; i++) { const cx = R() * 512, cy = R() * 512, rr = 40 + R() * 110; const g = x.createRadialGradient(cx, cy, 0, cx, cy, rr); g.addColorStop(0, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 512, 512); } });
	t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }; })();
/** moonlight shafts falling between the pillars (additive planes) */
const Shafts: React.FC<{T: number}> = ({T}) => {
	const mat = useMemo(() => new THREE.MeshBasicMaterial({map: shaftTex(), color: '#8FA8FF', transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false}), []);
	mat.opacity = 0.15 + 0.02 * Math.sin(T * 0.7);
	return <group>{[-630, -210, 210, 630].map((x, i) => <mesh key={i} material={mat} position={[x + 120, 330, -330]} rotation={[0, 0, 0.32]}><planeGeometry args={[170, 760]} /></mesh>)}</group>;
};
/** drifting haze near the floor */
const Haze: React.FC<{T: number}> = ({T}) => {
	const mats = useMemo(() => [0, 1].map((i) => { const t = hazeTex().clone(); t.needsUpdate = true; t.repeat.set(2, 2);
		return new THREE.MeshBasicMaterial({map: t, color: i ? '#4A56A8' : '#7A6A90', transparent: true, opacity: 0.32, depthWrite: false, fog: false}); }), []);
	mats.forEach((m, i) => { m.map!.offset.set(T * (0.008 + i * 0.006), T * 0.003 * (i ? -1 : 1)); });
	return <group>{mats.map((m, i) => <mesh key={i} material={m} rotation={[-Math.PI / 2, 0, 0]} position={[0, 14 + i * 22, 0]}><planeGeometry args={[4200, 3000]} /></mesh>)}</group>;
};
/** dust in the air, catching the fire light */
const Dust: React.FC<{T: number}> = ({T}) => {
	const {geo, base} = useMemo(() => { let r = 11; const R = () => (r = (r * 16807) % 2147483647) / 2147483647; const n = 500, base = new Float32Array(n * 4);
		for (let i = 0; i < n; i++) { base[i * 4] = -800 + R() * 1600; base[i * 4 + 1] = R() * 420; base[i * 4 + 2] = -350 + R() * 800; base[i * 4 + 3] = R() * 6.28; }
		const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3)); return {geo, base}; }, []);
	const mat = useMemo(() => new THREE.PointsMaterial({map: glowTex(), color: '#FFCF94', size: 3.2, sizeAttenuation: true, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false}), []);
	const pa = geo.attributes.position as THREE.BufferAttribute;
	for (let i = 0; i < pa.count; i++) { const ph = base[i * 4 + 3]; pa.setXYZ(i, base[i * 4] + 18 * Math.sin(T * 0.3 + ph) + T * 6, ((base[i * 4 + 1] + T * 4 + 30 * Math.sin(T * 0.2 + ph)) % 420 + 420) % 420, base[i * 4 + 2] + 14 * Math.cos(T * 0.25 + ph)); }
	pa.needsUpdate = true;
	return <points geometry={geo} material={mat} frustumCulled={false} />;
};
const TempleFloor: React.FC<{lib: Lib}> = ({lib}) => {
	const mat = useMemo(() => { const m = lib.tex['Temple_Middle_01.png'].clone(), n = lib.tex['Temple_Middle_01_Normals.png'].clone(); [m, n].forEach((t) => { t.repeat.set(18, 18); t.needsUpdate = true; });
		return new THREE.MeshStandardMaterial({map: m, normalMap: n, color: '#C9B49A', roughness: 0.5, metalness: 0}); }, [lib]);
	return <mesh rotation={[-Math.PI / 2, 0, 0]} material={mat} receiveShadow><planeGeometry args={[7200, 7200]} /></mesh>;
};
const GODS2: Fig[] = GODS.map((f, i) => ({...f, face: [undefined, {brow: 1.1, t0: 4.3, eyes: 0.35}, {brow: -0.9, t0: 3.9}, {brow: -0.6, t0: 4.1, eyes: -0.3}, undefined][i]}));
const GodsV2: React.FC<{lib: Lib; t: number; T: number}> = ({lib, t, T}) => {
	// 0-3 s: the same dolly as v1 (for the before/after); 3-6 s: a push in on Ra and the queen (the brows react)
	let pos: THREE.Vector3, look: THREE.Vector3, fov: number, focus: number;
	if (t < 3) { const u = sm((t + 0.5) / 4); pos = V(-120 + 260 * u, 155, 800 - 80 * u); look = V(-20 + 90 * u, 128, 0); fov = 36; focus = 740; }
	else { const u = sm((t - 3) / 3); pos = V(-150 + 40 * u, 162, 340 - 50 * u); look = V(-60 + 10 * u, 152, 50); fov = 30; focus = 300 - 50 * u; }
	return <>
		<Cam pos={pos} look={look} fov={fov} />
		<Sky top="#04051A" mid="#10164A" hor="#262E66" sun={V(0, -1, 0)} sunI={0} stars={1.6} T={T} />
		<EnvLight k={0.55} warm={[[-55, 8, 30], [55, 8, 30]]} />
		<hemisphereLight args={['#5A63B0', '#2A1A10', 0.25]} />
		<Sun pos={[-1500, 2600, -3000]} target={[0, 100, 0]} i={2.6} color="#A9BCFF" ext={1800} />
		<spotLight position={[350, 520, 950]} target-position={[0, 140, 40]} angle={0.45} penumbra={1} intensity={90000} distance={3000} decay={1.6} color="#FFC9A0" />
		<TempleFloor lib={lib} />
		{[-1, 1].map((sd) => <group key={sd}><Piece lib={lib} p="SM_Prop_Brazier_01" at={[sd * 470, 0, 230]} s={1.2} /><Fire at={[sd * 470, 92, 230]} T={T} seed={sd === -1 ? 1 : 2} /></group>)}
		{[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((k) => <Piece key={k} lib={lib} p="SM_Bld_Pillar_Ornate_Large_01" at={[k * 420, 0, -440]} s={0.9} />)}
		<Piece lib={lib} p="SM_Prop_Statue_12" at={[-600, 0, -150]} ry={0.4} s={1.4} /><Piece lib={lib} p="SM_Prop_Statue_01" at={[600, 0, -150]} ry={-0.4} s={1.4} />
		{GODS2.map((f, i) => <Figure key={i} lib={lib} f={f} t={t + 0.5} />)}
		<Shafts T={T} /><Haze T={T} /><Dust T={T} />
		<Post T={T} focus={focus} />
	</>;
};
const SyntyB: React.FC = () => {
	const lib = useLib(); const t = useCurrentFrame() / FPS;
	return <AbsoluteFill style={{background: '#000'}}>{lib && <Canvas exposure={1.25} fog={['#11163A', 1800, 9000]}><GodsV2 lib={lib} t={t} T={t + 4} /></Canvas>}</AbsoluteFill>;
};

const Root: React.FC = () => <>
	<Composition id="SYNTY62" component={Synty} durationInFrames={8 * FPS} fps={FPS} width={W} height={H} />
	<Composition id="SYNTYB62" component={SyntyB} durationInFrames={6 * FPS} fps={FPS} width={W} height={H} />
	<Composition id="HEADSA62" component={() => <Heads row={0} />} durationInFrames={1} fps={FPS} width={W} height={H} />
	<Composition id="HEADSB62" component={() => <Heads row={1} />} durationInFrames={1} fps={FPS} width={W} height={H} />
</>;
registerRoot(Root);
