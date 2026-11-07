/* Synty POLYGON Ancient Egypt · look test (owner 2026-11-07: "see if you will be able to use these").
   The FBX source files + texture atlas, loaded with three.js FBXLoader inside Remotion. The assets are NOT in the repo (licence + public
   repo): they live in a local public dir built by mkpub (PUBLIC_DIR=/dev/shm/synty/pub). Units are Synty's centimetres.
   Compositions: HEADS62 (diagnostic: every body and head piece in a row), SYNTY62 (8 s: the avenue at golden hour, then the gods). */
import React, {useEffect, useMemo, useState} from 'react';
import {AbsoluteFill, Composition, continueRender, delayRender, registerRoot, staticFile, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader.js';
import {clone as skClone} from 'three/examples/jsm/utils/SkeletonUtils.js';

const W = 1440, H = 1080, FPS = 30;
type MatMap = {mat: Record<string, string[]>; tex: string[]};
type Lib = {fbx: Record<string, THREE.Group>; tex: Record<string, THREE.Texture>; mm: MatMap};
const ATLAS = 'PolygonAncientEgypt_01_A.png';
const TILED = new Set(['Wall_Hieroglyph_01.png', 'Wall_Mural_01.png', 'Wall_Mural_02.png', 'Stucco_01.png']);

let LIB: Promise<Lib> | null = null;
const loadLib = (): Promise<Lib> => {
	if (LIB) return LIB;
	LIB = (async () => {
		const mm: MatMap = await (await fetch(staticFile('matmap.json'))).json();
		const tl = new THREE.TextureLoader(), fl = new FBXLoader();
		const tex: Record<string, THREE.Texture> = {};
		await Promise.all(mm.tex.map(async (n) => {
			const t = await tl.loadAsync(staticFile('tex/' + n)); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
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
					return new THREE.MeshStandardMaterial({map: tex[n] ?? tex[ATLAS], roughness: 0.82, metalness: 0});
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
type Fig = {body: string; att?: string[]; extra?: string[]; at: [number, number, number]; ry?: number; s?: number; arms?: Arms; armsR?: Arms; gest?: Gest; look?: number; ph?: number};
const Figure: React.FC<{lib: Lib; f: Fig; t?: number}> = ({lib, f, t = 0}) => {
	const rig = useMemo(() => {
		const g = new THREE.Group();
		const c = skClone(lib.fbx.Characters) as THREE.Group; const keep = new Set([f.body, ...(f.att ?? [])]);
		let body: THREE.SkinnedMesh | null = null;
		c.traverse((o) => { const m = o as THREE.SkinnedMesh; if (!m.isMesh) return; m.visible = keep.has(m.name); if (m.name === f.body) body = m; m.frustumCulled = false; });
		g.add(c); c.updateMatrixWorld(true);
		const B = (n: string) => (body ? mainOf((body as THREE.SkinnedMesh).skeleton.bones.find((b) => b.name === n)) : undefined);
		const bones = {shL: B('Shoulder_L'), elL: B('Elbow_L'), haL: B('Hand_L'), shR: B('Shoulder_R'), elR: B('Elbow_R'), haR: B('Hand_R'), sp: B('Spine_02'), hd: B('Head')};
		const rest = new Map<THREE.Object3D, THREE.Quaternion>(); Object.values(bones).forEach((b) => b && rest.set(b, b.quaternion.clone()));
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
	rest.forEach((q, b) => b.quaternion.copy(q)); c.updateMatrixWorld(true);
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

const Root: React.FC = () => <>
	<Composition id="SYNTY62" component={Synty} durationInFrames={8 * FPS} fps={FPS} width={W} height={H} />
	<Composition id="HEADSA62" component={() => <Heads row={0} />} durationInFrames={1} fps={FPS} width={W} height={H} />
	<Composition id="HEADSB62" component={() => <Heads row={1} />} durationInFrames={1} fps={FPS} width={W} height={H} />
</>;
registerRoot(Root);
