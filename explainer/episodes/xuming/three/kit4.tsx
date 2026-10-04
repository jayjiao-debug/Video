import React, {useLayoutEffect, useMemo, useRef} from 'react';
import * as THREE from 'three';
import type {ThreeElements} from '@react-three/fiber';
import {random} from 'remotion';
import {useBeanGeometry, beanColor, useLeafGeometry} from './props3d';
import {DPR, envProps, useEnv} from './stage3d';

/**
 * Supporting cast for 《续命》 v4: particles, the synapse, the brain, forests as layered
 * light cards, insects, the port of Mocha, the roaster, the room. Everything shares the
 * house light rig and post chain in stage3d.tsx.
 */

type G = ThreeElements['group'];
const V2 = (x: number, y: number) => new THREE.Vector2(x, y);
export const rnd = (k: string) => random(k);

// ---------------------------------------------------------------- soft particles

const softVert = /* glsl */ `
attribute float aSize; attribute vec3 aColor; attribute float aAlpha;
varying vec3 vC; varying float vA;
uniform float uScale;
void main(){ vC=aColor; vA=aAlpha; vec4 mv=modelViewMatrix*vec4(position,1.); gl_PointSize=aSize*uScale/max(.001,-mv.z); gl_Position=projectionMatrix*mv; }`;
const softFrag = /* glsl */ `
varying vec3 vC; varying float vA; uniform float uHard;
void main(){ vec2 p=gl_PointCoord*2.-1.; float d=dot(p,p); if(d>1.) discard;
  float a=mix(exp(-d*4.), 1.-smoothstep(.6,1.,d), uHard)*vA; gl_FragColor=vec4(vC*a,a); }`;

export type Particle = {p: [number, number, number]; s: number; c: THREE.ColorRepresentation; a: number};

/** additive glowing points; sizes are in world units (perspective-scaled) */
export const Soft: React.FC<{items: Particle[]; hard?: number; additive?: boolean} & G> = ({items, hard = 0, additive = true, ...g}) => {
	const n = items.length;
	const {geo, mat} = useMemo(() => {
		const geo = new THREE.BufferGeometry();
		geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(Math.max(1, n) * 3), 3));
		geo.setAttribute('aSize', new THREE.BufferAttribute(new Float32Array(Math.max(1, n)), 1));
		geo.setAttribute('aColor', new THREE.BufferAttribute(new Float32Array(Math.max(1, n) * 3), 3));
		geo.setAttribute('aAlpha', new THREE.BufferAttribute(new Float32Array(Math.max(1, n)), 1));
		const mat = new THREE.ShaderMaterial({
			vertexShader: softVert,
			fragmentShader: softFrag,
			uniforms: {uScale: {value: (DPR * 540) / Math.tan((35 * Math.PI) / 360)}, uHard: {value: 0}},
			transparent: true,
			depthWrite: false,
			blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
		});
		return {geo, mat};
	}, [n, additive]);
	const col = new THREE.Color();
	const P = geo.attributes.position as THREE.BufferAttribute;
	const S = geo.attributes.aSize as THREE.BufferAttribute;
	const C = geo.attributes.aColor as THREE.BufferAttribute;
	const A = geo.attributes.aAlpha as THREE.BufferAttribute;
	items.forEach((it, i) => {
		P.setXYZ(i, ...it.p);
		S.setX(i, it.s);
		col.set(it.c);
		C.setXYZ(i, col.r, col.g, col.b);
		A.setX(i, it.a);
	});
	P.needsUpdate = S.needsUpdate = C.needsUpdate = A.needsUpdate = true;
	geo.setDrawRange(0, n);
	mat.uniforms.uHard.value = hard;
	return (
		<group {...g}>
			<points geometry={geo} material={mat} frustumCulled={false} />
		</group>
	);
};

/** stable pseudo-random cloud in a box, drifting upward */
export const dust = (seed: string, n: number, box: [number, number, number], t: number, color: THREE.ColorRepresentation = '#ffd9a0', size = 0.05, alpha = 0.6): Particle[] =>
	Array.from({length: n}, (_, i) => {
		const near = rnd(`${seed}n${i}`) > 0.9;
		const y = ((rnd(`${seed}y${i}`) + t * (0.01 + 0.02 * rnd(`${seed}v${i}`))) % 1) - 0.5;
		return {
			p: [(rnd(`${seed}x${i}`) - 0.5) * box[0] + 0.1 * Math.sin(t + i), y * box[1], (rnd(`${seed}z${i}`) - 0.5) * box[2]],
			s: size * (near ? 4 : 0.6 + rnd(`${seed}s${i}`)),
			c: color,
			a: alpha * (near ? 0.25 : 0.4 + 0.6 * rnd(`${seed}a${i}`)) * Math.sin(Math.PI * (y + 0.5)),
		};
	});

// ---------------------------------------------------------------- instanced helper

/** an InstancedMesh whose matrices/colours are rewritten every frame */
export const Instances: React.FC<{
	geometry: THREE.BufferGeometry;
	material: THREE.Material;
	items: {p: [number, number, number]; r?: [number, number, number]; s?: number | [number, number, number]; c?: THREE.ColorRepresentation}[];
}> = ({geometry, material, items}) => {
	const ref = useRef<THREE.InstancedMesh>(null);
	const max = Math.max(1, items.length);
	const dummy = useMemo(() => new THREE.Object3D(), []);
	const col = useMemo(() => new THREE.Color(), []);
	useLayoutEffect(() => {
		const m = ref.current;
		if (!m) return;
		items.forEach((it, i) => {
			dummy.position.set(...it.p);
			dummy.rotation.set(...(it.r ?? [0, 0, 0]));
			const s = it.s ?? 1;
			if (typeof s === 'number') dummy.scale.setScalar(s);
			else dummy.scale.set(...s);
			dummy.updateMatrix();
			m.setMatrixAt(i, dummy.matrix);
			if (it.c !== undefined) m.setColorAt(i, col.set(it.c));
		});
		m.count = items.length;
		m.instanceMatrix.needsUpdate = true;
		if (m.instanceColor) m.instanceColor.needsUpdate = true;
	});
	return <instancedMesh ref={ref} args={[geometry, material, max]} frustumCulled={false} />;
};

export const BeanSwarm: React.FC<{items: {p: [number, number, number]; r: [number, number, number]; s: number; roast: number}[]}> = ({items}) => {
	const geo = useBeanGeometry();
	const env = useEnv();
	const mat = useMemo(() => new THREE.MeshPhysicalMaterial({roughness: 0.5, clearcoat: 0.6, clearcoatRoughness: 0.35, sheen: 0.4, sheenColor: new THREE.Color('#ffb070')}), []);
	mat.envMap = env.map;
	mat.envMapIntensity = env.intensity;
	return <Instances geometry={geo} material={mat} items={items.map((b) => ({p: b.p, r: b.r, s: b.s, c: beanColor(b.roast)}))} />;
};

// ---------------------------------------------------------------- the synapse

/** a lipid bilayer: two sheets of glossy heads, rippling */
export const Membrane: React.FC<{t: number; w?: number; d?: number; color?: string; o?: number} & G> = ({t, w = 24, d = 10, color = '#7fb4ff', o = 1, ...g}) => {
	const geo = useMemo(() => new THREE.SphereGeometry(0.14, 8, 5), []);
	const mat = useMemo(() => new THREE.MeshStandardMaterial({color, roughness: 0.3, metalness: 0.1, transparent: true}), [color]);
	mat.opacity = o;
	const items = useMemo(() => {
		const out: {x: number; z: number; k: number}[] = [];
		for (let x = -w / 2; x <= w / 2; x += 0.3) for (let z = -d / 2; z <= d / 2; z += 0.3) out.push({x: x + (rnd(`mx${x}${z}`) - 0.5) * 0.06, z, k: rnd(`mk${x}${z}`)});
		return out;
	}, [w, d]);
	const wave = (x: number, z: number) => 0.18 * Math.sin(x * 0.35 + t * 0.6) + 0.12 * Math.sin(z * 0.5 - t * 0.4);
	return (
		<group {...g}>
			<Instances geometry={geo} material={mat} items={items.map((m) => ({p: [m.x, wave(m.x, m.z), m.z] as [number, number, number], s: 0.85 + 0.3 * m.k}))} />
			<Instances geometry={geo} material={mat} items={items.map((m) => ({p: [m.x + 0.13, wave(m.x, m.z) - 0.7, m.z + 0.13] as [number, number, number], s: 0.75 + 0.3 * m.k}))} />
		</group>
	);
};

/** a receptor: a lumpy protein funnel with a pocket on top; `glow` lights its rim */
export const Receptor3D: React.FC<{color?: string; glow?: number; glowColor?: string} & G> = ({color = '#3fd0c8', glow = 0, glowColor = '#7ff7ff', ...g}) => {
	const geo = useMemo(() => {
		const prof = [V2(0.0, -1.2), V2(0.42, -1.2), V2(0.5, -0.6), V2(0.46, 0.0), V2(0.62, 0.45), V2(0.78, 0.7), V2(0.72, 0.82), V2(0.5, 0.62), V2(0.28, 0.38), V2(0.0, 0.32)];
		const g = new THREE.LatheGeometry(prof, 64);
		const p = g.attributes.position;
		const v = new THREE.Vector3();
		for (let i = 0; i < p.count; i++) {
			v.fromBufferAttribute(p, i);
			const a = Math.atan2(v.z, v.x);
			const bump = 1 + 0.08 * Math.sin(a * 5 + v.y * 4) + 0.05 * Math.sin(a * 11 - v.y * 7);
			p.setXYZ(i, v.x * bump, v.y, v.z * bump);
		}
		g.computeVertexNormals();
		return g;
	}, []);
	const env = useEnv();
	return (
		<group {...g}>
			<mesh geometry={geo}>
				<meshPhysicalMaterial {...envProps(env)} color={color} roughness={0.3} clearcoat={1} emissive={glowColor} emissiveIntensity={0.15 + glow} side={THREE.DoubleSide} />
			</mesh>
		</group>
	);
};

// ---------------------------------------------------------------- the brain as a cloud of light

/** points on a folded cortex: two hemispheres (long front-back), a midline fissure, gyri as
 * bright crests and dark sulci; plus a cerebellum. Returns [x, y, z, crest 0..1]. */
export const brainPoints = (n: number) =>
	Array.from({length: n}, (_, i) => {
		const cereb = i % 9 === 0;
		const side = i % 2 ? 1 : -1;
		const th = rnd(`bt${i}`) * Math.PI * 2;
		const ph = Math.acos(2 * rnd(`bp${i}`) - 1);
		let x = Math.sin(ph) * Math.cos(th);
		let y = Math.cos(ph);
		let z = Math.sin(ph) * Math.sin(th);
		if (cereb) {
			return [x * 0.42, -0.42 + y * 0.2, -0.62 + z * 0.26, 0.4 + 0.6 * Math.abs(Math.sin(y * 40))] as [number, number, number, number];
		}
		if (y < -0.45) y = -0.45 + (y + 0.45) * 0.35;
		const g = Math.sin(x * 16 + z * 11) * Math.sin(y * 14 - z * 8) + 0.6 * Math.sin(z * 21 + y * 7 + x * 3);
		const k = 1 + 0.045 * g;
		x = (Math.abs(x) * 0.48 + 0.045) * side;
		const crest = Math.max(0, Math.min(1, (g + 0.4) / 1.2));
		return [x * k, y * 0.6 * k, z * 0.9 * k, crest] as [number, number, number, number];
	});

// ---------------------------------------------------------------- chromosomes

export const Chromosome: React.FC<{color?: string; glow?: number} & G> = ({color = '#7fb4ff', glow = 0.3, ...g}) => (
	<group {...g}>
		{[0.32, -0.32].map((r, i) => (
			<mesh key={i} rotation={[0, 0, r]}>
				<capsuleGeometry args={[0.09, 0.55, 8, 16]} />
				<meshPhysicalMaterial color={color} roughness={0.35} clearcoat={0.8} emissive={color} emissiveIntensity={glow} />
			</mesh>
		))}
	</group>
);

// ---------------------------------------------------------------- canvas cards (forests, hills, skies): the 《微醺》 layered look in real depth

export const useCanvasTexture = (key: string, w: number, h: number, draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void) =>
	useMemo(() => {
		const cv = document.createElement('canvas');
		cv.width = w;
		cv.height = h;
		const ctx = cv.getContext('2d')!;
		draw(ctx, w, h);
		const t = new THREE.CanvasTexture(cv);
		t.colorSpace = THREE.SRGBColorSpace;
		t.anisotropy = 4;
		return t;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [key, w, h]);

/** draws a recursive tree silhouette */
const tree = (ctx: CanvasRenderingContext2D, x: number, y: number, a: number, l: number, w: number, d: number, seed: string) => {
	if (d > 9 || l < 3) return;
	const x1 = x + Math.cos(a) * l;
	const y1 = y + Math.sin(a) * l;
	ctx.lineWidth = w;
	ctx.beginPath();
	ctx.moveTo(x, y);
	ctx.quadraticCurveTo(x + Math.cos(a + 0.2) * l * 0.5, y + Math.sin(a + 0.2) * l * 0.5, x1, y1);
	ctx.stroke();
	if (d > 5 && rnd(`${seed}lf`) > 0.4) {
		ctx.beginPath();
		ctx.ellipse(x1, y1, 3 + l * 0.4, 2 + l * 0.2, a, 0, Math.PI * 2);
		ctx.fill();
	}
	const n = d < 2 ? 2 : rnd(`${seed}n`) > 0.3 ? 2 : 3;
	for (let i = 0; i < n; i++) tree(ctx, x1, y1, a + (rnd(`${seed}a${i}`) - 0.5) * 1.1, l * (0.68 + 0.14 * rnd(`${seed}l${i}`)), w * 0.68, d + 1, `${seed}${i}`);
};

/** a row of tree silhouettes on a transparent card; alpha only, coloured by the material */
export const TreeCard: React.FC<{seed: string; n?: number; color?: string; o?: number; w?: number; h?: number; ground?: boolean} & G> = ({seed, n = 6, color = '#0c140c', o = 1, w = 16, h = 9, ground = true, ...g}) => {
	const tex = useCanvasTexture(`tree${seed}${n}${ground}`, 2048, 1152, (ctx, cw, ch) => {
		ctx.fillStyle = '#fff';
		ctx.strokeStyle = '#fff';
		ctx.lineCap = 'round';
		for (let i = 0; i < n; i++) {
			const x = (cw * (i + 0.2 + 0.6 * rnd(`${seed}tx${i}`))) / n;
			const s = 0.5 + 0.4 * rnd(`${seed}ts${i}`);
			tree(ctx, x, ch, -Math.PI / 2 + (rnd(`${seed}ta${i}`) - 0.5) * 0.2, 260 * s, 30 * s, 0, `${seed}t${i}`);
		}
		// undergrowth
		for (let i = 0; i < (ground ? 260 : 0); i++) {
			const x = rnd(`${seed}gx${i}`) * cw;
			ctx.beginPath();
			ctx.ellipse(x, ch - rnd(`${seed}gy${i}`) * 70, 20 + rnd(`${seed}gw${i}`) * 60, 12 + rnd(`${seed}gh${i}`) * 30, 0, 0, Math.PI * 2);
			ctx.fill();
		}
	});
	return (
		<group {...g}>
			<mesh>
				<planeGeometry args={[w, h]} />
				<meshBasicMaterial color={color} alphaMap={tex} transparent opacity={o} depthWrite={false} />
			</mesh>
		</group>
	);
};

/** god rays: additive gradient blades hanging down from the origin (rotate the group to aim) */
export const Rays3D: React.FC<{n?: number; color?: string; o?: number; len?: number; spread?: number; seed?: string} & G> = ({n = 7, color = '#fff0c8', o = 0.25, len = 14, spread = 0.7, seed = 'r', ...g}) => {
	const mat = useMemo(
		() =>
			new THREE.ShaderMaterial({
				uniforms: {uC: {value: new THREE.Color(color)}, uO: {value: o}},
				vertexShader: `varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
				fragmentShader: `uniform vec3 uC; uniform float uO; varying vec2 vUv; void main(){ float a=pow(vUv.y,1.5)*pow(sin(vUv.x*3.14159),2.)*uO; gl_FragColor=vec4(uC*a,a);} `,
				transparent: true,
				depthWrite: false,
				blending: THREE.AdditiveBlending,
				side: THREE.DoubleSide,
			}),
		[color],
	);
	mat.uniforms.uO.value = o;
	return (
		<group {...g}>
			{Array.from({length: n}, (_, i) => {
				const w = 0.4 + rnd(`${seed}w${i}`) * 1.2;
				return (
					<group key={i} rotation={[0, 0, (n > 1 ? i / (n - 1) - 0.5 : 0) * spread + (rnd(`${seed}${i}`) - 0.5) * 0.1]}>
						<mesh material={mat} position={[0, -len / 2, -i * 0.02]}>
							<planeGeometry args={[w, len]} />
						</mesh>
					</group>
				);
			})}
		</group>
	);
};

/** rolling ground with fog-friendly dark material */
export const Terrain: React.FC<{seed?: string; size?: number; amp?: number; color?: string} & G> = ({seed = 't', size = 80, amp = 3, color = '#0d0a07', ...g}) => {
	const geo = useMemo(() => {
		const gg = new THREE.PlaneGeometry(size, size, 160, 160);
		const p = gg.attributes.position;
		for (let i = 0; i < p.count; i++) {
			const x = p.getX(i);
			const y = p.getY(i);
			const h = amp * (0.6 * Math.sin(x * 0.11 + 1.3) * Math.cos(y * 0.09) + 0.3 * Math.sin(x * 0.27 + y * 0.21) + 0.12 * Math.sin(x * 0.9 + y * 0.7));
			p.setZ(i, h);
		}
		gg.computeVertexNormals();
		return gg;
	}, [seed, size, amp]);
	return (
		<group {...g}>
			<mesh geometry={geo} rotation={[-Math.PI / 2, 0, 0]}>
				<meshStandardMaterial color={color} roughness={0.95} />
			</mesh>
		</group>
	);
};
/** height of Terrain at (x, z) in its local frame (matches the generator) */
export const terrainH = (x: number, z: number, amp = 3) => {
	const y = -z;
	return amp * (0.6 * Math.sin(x * 0.11 + 1.3) * Math.cos(y * 0.09) + 0.3 * Math.sin(x * 0.27 + y * 0.21) + 0.12 * Math.sin(x * 0.9 + y * 0.7));
};

/** coffee shrubs on a hillside with blossoms that open in a travelling wave */
export const Shrubs: React.FC<{seed: string; n: number; area: [number, number, number, number]; amp?: number; wave: number; blossom?: number; t: number}> = ({seed, n, area, amp = 3, wave, blossom = 1, t}) => {
	const bush = useMemo(() => {
		const g = new THREE.IcosahedronGeometry(1, 2);
		const p = g.attributes.position;
		const v = new THREE.Vector3();
		for (let i = 0; i < p.count; i++) {
			v.fromBufferAttribute(p, i);
			const k = 1 + 0.25 * Math.sin(v.x * 7) * Math.sin(v.y * 6) * Math.sin(v.z * 5);
			p.setXYZ(i, v.x * k, v.y * k * 0.8, v.z * k);
		}
		g.computeVertexNormals();
		return g;
	}, []);
	const bushMat = useMemo(() => new THREE.MeshStandardMaterial({color: '#13261a', roughness: 0.6}), []);
	const flower = useMemo(() => new THREE.SphereGeometry(1, 6, 4), []);
	const flowerMat = useMemo(() => new THREE.MeshStandardMaterial({color: '#fffaf0', emissive: '#fff4dc', emissiveIntensity: 0.6}), []);
	const shrubs = useMemo(
		() =>
			Array.from({length: n}, (_, i) => {
				const x = area[0] + rnd(`${seed}x${i}`) * (area[1] - area[0]);
				const z = area[2] + rnd(`${seed}z${i}`) * (area[3] - area[2]);
				return {x, z, y: terrainH(x, z, amp), s: 0.5 + rnd(`${seed}s${i}`) * 0.5};
			}),
		[seed, n, area, amp],
	);
	const flowers: {p: [number, number, number]; s: number}[] = [];
	shrubs.forEach((b, i) => {
		const local = (b.x - area[0]) / (area[1] - area[0]);
		const open = Math.max(0, Math.min(1, (wave - local) * 6)) * blossom;
		if (open <= 0) return;
		for (let k = 0; k < 14; k++) {
			const a = rnd(`${seed}fa${i}${k}`) * Math.PI * 2;
			const e = rnd(`${seed}fe${i}${k}`) * 1.2;
			flowers.push({
				p: [b.x + Math.cos(a) * b.s * Math.cos(e) * 1.02, b.y + b.s * 0.8 * Math.sin(e) + 0.4 * b.s, b.z + Math.sin(a) * b.s * Math.cos(e) * 1.02],
				s: 0.05 * open * (0.7 + 0.6 * rnd(`${seed}fs${i}${k}`)) * (1 + 0.1 * Math.sin(t * 2 + k)),
			});
		}
	});
	return (
		<group>
			<Instances geometry={bush} material={bushMat} items={shrubs.map((b) => ({p: [b.x, b.y + b.s * 0.5, b.z], s: b.s, r: [0, b.x, 0]}))} />
			<Instances geometry={flower} material={flowerMat} items={flowers} />
		</group>
	);
};

// ---------------------------------------------------------------- insects

const stripeTex = (() => {
	let t: THREE.CanvasTexture | null = null;
	return () => {
		if (t) return t;
		const cv = document.createElement('canvas');
		cv.width = 64;
		cv.height = 256;
		const ctx = cv.getContext('2d')!;
		for (let i = 0; i < 8; i++) {
			ctx.fillStyle = i % 2 ? '#1a1208' : '#e0a32a';
			ctx.fillRect(0, i * 32, 64, 32);
		}
		t = new THREE.CanvasTexture(cv);
		t.colorSpace = THREE.SRGBColorSpace;
		return t;
	};
})();

/** a honeybee; `flap` is the wing phase (radians); wings read as a blurred disc when fast */
export const Bee3D: React.FC<{flap: number; blur?: number; glow?: number} & G> = ({flap, blur = 1, glow = 0, ...g}) => {
	const tex = stripeTex();
	const wing = useMemo(() => {
		const s = new THREE.Shape();
		s.moveTo(0, 0);
		s.bezierCurveTo(0.15, 0.05, 0.55, 0.1, 0.62, 0.0);
		s.bezierCurveTo(0.55, -0.12, 0.2, -0.12, 0, 0);
		return new THREE.ShapeGeometry(s, 16);
	}, []);
	const up = Math.sin(flap) * 0.9;
	return (
		<group {...g}>
			{/* abdomen */}
			<mesh position={[-0.32, -0.02, 0]} rotation={[0, 0, Math.PI / 2 + 0.15]} scale={[1, 1.35, 1]}>
				<sphereGeometry args={[0.2, 32, 24]} />
				<meshPhysicalMaterial map={tex} roughness={0.45} clearcoat={0.5} sheen={1} sheenColor="#ffd070" emissive="#ffb030" emissiveIntensity={glow} />
			</mesh>
			{/* thorax, fuzzy */}
			<mesh position={[0, 0.02, 0]}>
				<sphereGeometry args={[0.16, 32, 24]} />
				<meshPhysicalMaterial color="#6a4318" roughness={0.9} sheen={1} sheenRoughness={0.4} sheenColor="#ffcf70" />
			</mesh>
			{/* head + eyes */}
			<mesh position={[0.2, 0.0, 0]}>
				<sphereGeometry args={[0.1, 24, 16]} />
				<meshPhysicalMaterial color="#1e140a" roughness={0.5} />
			</mesh>
			{[1, -1].map((s) => (
				<mesh key={s} position={[0.24, 0.03, 0.06 * s]}>
					<sphereGeometry args={[0.045, 16, 12]} />
					<meshPhysicalMaterial color="#0a0a10" roughness={0.1} clearcoat={1} />
				</mesh>
			))}
			{/* antennae */}
			{[1, -1].map((s) => (
				<mesh key={`a${s}`} position={[0.3, 0.1, 0.04 * s]} rotation={[0.3 * s, 0, -0.6]}>
					<cylinderGeometry args={[0.006, 0.006, 0.16, 6]} />
					<meshStandardMaterial color="#1a1208" />
				</mesh>
			))}
			{/* wings: a sharp pair plus a ghost pair for motion blur */}
			{[1, -1].map((s) =>
				[0, 1, 2].map((k) => (
					<mesh key={`w${s}${k}`} geometry={wing} position={[0.02, 0.12, 0.05 * s]} rotation={[s * (Math.PI / 2 - up - k * 0.35 * blur), 0, 0.25]}>
						<meshPhysicalMaterial color="#e8f0ff" transparent opacity={k === 0 ? 0.35 : 0.12 * blur} roughness={0.1} iridescence={1} side={THREE.DoubleSide} depthWrite={false} />
					</mesh>
				)),
			)}
			{/* legs */}
			{[-0.08, 0.0, 0.08].map((x, i) =>
				[1, -1].map((s) => (
					<mesh key={`l${i}${s}`} position={[x, -0.14, 0.08 * s]} rotation={[0.5 * s, 0, 0.3]}>
						<cylinderGeometry args={[0.008, 0.006, 0.2, 6]} />
						<meshStandardMaterial color="#20150a" />
					</mesh>
				)),
			)}
		</group>
	);
};

/** a caterpillar along a parametric spine; `curl` 0..1 rolls it into a ring; `hurt` flushes it red */
export const Caterpillar: React.FC<{t: number; curl?: number; hurt?: number; n?: number} & G> = ({t, curl = 0, hurt = 0, n = 13, ...g}) => {
	const col = new THREE.Color('#8fbf3a').lerp(new THREE.Color('#ff3020'), hurt * 0.5);
	return (
		<group {...g}>
			{Array.from({length: n}, (_, i) => {
				const u = i / (n - 1);
				// crawling: a travelling hump
				const hump = 0.07 * Math.max(0, Math.sin(u * Math.PI * 2 - t * 5)) * (1 - curl);
				const sx = -u * 1.1;
				const a = u * Math.PI * 1.7;
				const cx = mix(sx, -0.35 + 0.35 * Math.cos(a), curl);
				const cy = mix(hump, 0.35 * Math.sin(a), curl);
				const r = 0.075 * (i === 0 ? 1.1 : 1 - 0.25 * u ** 2);
				const twitch = hurt > 0 ? 0.02 * Math.sin(t * 40 + i) * hurt : 0;
				return (
					<mesh key={i} position={[cx, cy + r + twitch, twitch]}>
						<sphereGeometry args={[r, 20, 14]} />
						<meshPhysicalMaterial color={i === 0 ? '#3a2a10' : col} roughness={0.5} sheen={0.6} sheenColor="#e8ffb0" emissive="#ff2a10" emissiveIntensity={hurt * 0.6 * (0.6 + 0.4 * Math.sin(t * 12 + i))} />
					</mesh>
				);
			})}
		</group>
	);
};
const mix = (a: number, b: number, k: number) => a + (b - a) * k;

// ---------------------------------------------------------------- tea, cacao

export const CacaoPod: React.FC<G> = (g) => {
	const geo = useMemo(() => {
		const prof: THREE.Vector2[] = [];
		for (let i = 0; i <= 32; i++) {
			const u = i / 32;
			prof.push(V2(0.36 * Math.sin(Math.PI * u) ** 0.8 * (1 - 0.15 * u), (u - 0.5) * 1.5));
		}
		const g2 = new THREE.LatheGeometry(prof, 96);
		const p = g2.attributes.position;
		const v = new THREE.Vector3();
		for (let i = 0; i < p.count; i++) {
			v.fromBufferAttribute(p, i);
			const a = Math.atan2(v.z, v.x);
			const k = 1 + 0.07 * Math.abs(Math.cos(a * 5)) + 0.02 * Math.sin(v.y * 30);
			p.setXYZ(i, v.x * k, v.y, v.z * k);
		}
		g2.computeVertexNormals();
		return g2;
	}, []);
	return (
		<group {...g}>
			<mesh geometry={geo}>
				<meshPhysicalMaterial color="#c8702a" roughness={0.45} clearcoat={0.6} />
			</mesh>
		</group>
	);
};

export const TeaLeaf: React.FC<G> = (g) => {
	const geo = useLeafGeometry();
	return (
		<group {...g}>
			<mesh geometry={geo} scale={[0.7, 0.8, 1]}>
				<meshPhysicalMaterial color="#4f8a2e" roughness={0.35} clearcoat={0.6} side={THREE.DoubleSide} />
			</mesh>
		</group>
	);
};

// ---------------------------------------------------------------- the port of Mocha

/** Yemeni tower house: tall box, white-trimmed windows that light on cue */
export const Tower: React.FC<{h: number; w: number; lit: number; seed: string} & G> = ({h, w, lit, seed, ...g}) => {
	const tex = useCanvasTexture(`win${seed}${h}`, 128, 256, (ctx, cw, ch) => {
		ctx.fillStyle = '#000';
		ctx.fillRect(0, 0, cw, ch);
		const rows = Math.round(h * 2.2);
		for (let r = 0; r < rows; r++)
			for (let c = 0; c < 3; c++) {
				if (rnd(`${seed}w${r}${c}`) < 0.7) continue;
				ctx.fillStyle = '#fff';
				const x = 18 + c * 38;
				const y = 14 + (r * (ch - 30)) / rows;
				ctx.fillRect(x, y, 10, 12);
				ctx.beginPath();
				ctx.arc(x + 5, y, 5, Math.PI, 0);
				ctx.fill();
			}
	});
	return (
		<group {...g}>
			<mesh position={[0, h / 2, 0]}>
				<boxGeometry args={[w, h, w * 0.9]} />
				<meshStandardMaterial color="#5a4432" roughness={0.95} emissive="#ffb35a" emissiveMap={tex} emissiveIntensity={0.7 * lit} />
			</mesh>
			{/* white lime trim bands */}
			{[0.45, 0.75].map((k) => (
				<mesh key={k} position={[0, h * k, 0]}>
					<boxGeometry args={[w * 1.01, 0.04, w * 0.91]} />
					<meshStandardMaterial color="#d8cdb8" roughness={0.8} />
				</mesh>
			))}
			{/* white-washed crown with merlons */}
			<mesh position={[0, h + 0.06, 0]}>
				<boxGeometry args={[w * 1.03, 0.14, w * 0.93]} />
				<meshStandardMaterial color="#e2d8c4" roughness={0.8} />
			</mesh>
			{Array.from({length: 4}, (_, i) => (
				<mesh key={`m${i}`} position={[(i / 3 - 0.5) * w * 0.85, h + 0.2, w * 0.45]}>
					<boxGeometry args={[w * 0.12, 0.14, 0.05]} />
					<meshStandardMaterial color="#e2d8c4" roughness={0.8} />
				</mesh>
			))}
		</group>
	);
};

/** a three-masted merchant ship in silhouette with a stern lantern */
export const Ship: React.FC<{lantern?: number; t?: number} & G> = ({lantern = 1, t = 0, ...g}) => {
	const hull = useMemo(() => {
		const s = new THREE.Shape();
		s.moveTo(-1.6, 0.3);
		s.quadraticCurveTo(-1.2, -0.45, 0, -0.5);
		s.quadraticCurveTo(1.3, -0.45, 1.9, 0.35);
		s.lineTo(1.4, 0.45);
		s.lineTo(-1.3, 0.6);
		s.lineTo(-1.6, 0.3);
		return new THREE.ExtrudeGeometry(s, {depth: 0.6, bevelEnabled: false});
	}, []);
	const sail = (w: number, h: number) => {
		const g2 = new THREE.PlaneGeometry(w, h, 8, 8);
		const p = g2.attributes.position;
		for (let i = 0; i < p.count; i++) p.setZ(i, 0.12 * Math.cos((p.getX(i) / w) * Math.PI));
		g2.computeVertexNormals();
		return g2;
	};
	const sails = useMemo(() => [sail(1.0, 0.8), sail(0.85, 0.6), sail(0.7, 0.5)], []);
	return (
		<group {...g} rotation={[0.02 * Math.sin(t), (g.rotation as any)?.[1] ?? 0, 0.03 * Math.sin(t * 0.8)]}>
			<mesh geometry={hull} position={[0, 0, -0.3]}>
				<meshStandardMaterial color="#1a120c" roughness={0.8} />
			</mesh>
			{[-0.8, 0.1, 0.9].map((x, i) => (
				<group key={i} position={[x, 0.5, 0]}>
					<mesh position={[0, 1.0, 0]}>
						<cylinderGeometry args={[0.025, 0.035, 2.1, 8]} />
						<meshStandardMaterial color="#1a120c" />
					</mesh>
					<mesh geometry={sails[i === 1 ? 0 : i === 0 ? 1 : 2]} position={[0, 0.9, 0.05]}>
						<meshStandardMaterial color="#d8c8a8" roughness={0.9} side={THREE.DoubleSide} transparent opacity={0.85} />
					</mesh>
				</group>
			))}
			<mesh position={[-1.5, 0.75, 0]}>
				<sphereGeometry args={[0.05, 12, 8]} />
				<meshBasicMaterial color="#ffd080" toneMapped={false} />
			</mesh>
			<pointLight position={[-1.5, 0.8, 0.3]} color="#ffb060" intensity={3 * lantern} distance={6} decay={2} />
		</group>
	);
};

/** night sea: dark, glossy, with a wobble */
export const Sea: React.FC<{t: number; size?: number; color?: string} & G> = ({t, size = 200, color = '#060a12', ...g}) => {
	const geo = useMemo(() => new THREE.PlaneGeometry(size, size, 120, 120), [size]);
	const p = geo.attributes.position;
	for (let i = 0; i < p.count; i++) {
		const x = p.getX(i);
		const y = p.getY(i);
		p.setZ(i, 0.06 * Math.sin(x * 1.3 + t * 1.2) + 0.05 * Math.sin(y * 1.7 - t) + 0.03 * Math.sin((x + y) * 3 + t * 2));
	}
	p.needsUpdate = true;
	geo.computeVertexNormals();
	return (
		<group {...g}>
			<mesh geometry={geo} rotation={[-Math.PI / 2, 0, 0]}>
				<meshPhysicalMaterial color={color} roughness={0.12} metalness={0.2} clearcoat={1} />
			</mesh>
		</group>
	);
};

// ---------------------------------------------------------------- the roaster

export const Drum: React.FC<{heat: number; spin: number} & G> = ({heat, spin, ...g}) => (
	<group {...g}>
		<mesh rotation={[0, 0, Math.PI / 2]}>
			<cylinderGeometry args={[1.6, 1.6, 3.2, 64, 1, true]} />
			<meshPhysicalMaterial color="#2a2522" metalness={0.85} roughness={0.35} side={THREE.DoubleSide} emissive="#ff4a10" emissiveIntensity={0.05 * heat} />
		</mesh>
		{/* the paddles */}
		{[0, 1, 2, 3, 4, 5].map((i) => (
			<group key={i} rotation={[spin + (i * Math.PI) / 3, 0, 0]}>
				<mesh position={[0, 1.42, 0]}>
					<boxGeometry args={[3.0, 0.32, 0.04]} />
					<meshPhysicalMaterial color="#3a332e" metalness={0.8} roughness={0.4} />
				</mesh>
			</group>
		))}
	</group>
);

// ---------------------------------------------------------------- a room with a window (body, coda)

export const RoomWindow: React.FC<{sky: string; skyI?: number; wall?: string} & G> = ({sky, skyI = 1, wall = '#2a1f18', ...g}) => (
	<group {...g}>
		{/* back wall with a window opening: four wall panels around it */}
		{[
			[-5.5, 2.5, 7, 9],
			[5.5, 2.5, 7, 9],
			[0, 6.25, 4, 3.5],
			[0, -0.75, 4, 2.5],
		].map(([x, y, w, h], i) => (
			<mesh key={i} position={[x, y, -3]}>
				<planeGeometry args={[w, h]} />
				<meshStandardMaterial color={wall} roughness={0.95} />
			</mesh>
		))}
		{/* the sky outside */}
		<mesh position={[0, 2.5, -3.6]}>
			<planeGeometry args={[4.4, 4.4]} />
			<meshBasicMaterial color={new THREE.Color(sky).multiplyScalar(0.55)} />
		</mesh>
		{/* a distant skyline through the glass */}
		<mesh position={[0, 1.2, -3.55]}>
			<planeGeometry args={[4.4, 1.0]} />
			<meshBasicMaterial color={new THREE.Color(sky).multiplyScalar(0.18)} />
		</mesh>
		{/* window frame + mullions */}
		{[
			[0, 4.5, 4.1, 0.14],
			[0, 0.5, 4.1, 0.14],
			[-2, 2.5, 0.14, 4.1],
			[2, 2.5, 0.14, 4.1],
			[0, 2.5, 0.08, 4],
			[0, 2.5, 4, 0.08],
		].map(([x, y, w, h], i) => (
			<mesh key={`f${i}`} position={[x, y, -2.95]}>
				<boxGeometry args={[w, h, 0.18]} />
				<meshStandardMaterial color="#120c08" roughness={0.8} />
			</mesh>
		))}
		<pointLight position={[0, 2.8, -2.6]} color={sky} intensity={30 * skyI} distance={30} decay={1.6} />
	</group>
);
