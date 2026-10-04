import React, {useMemo} from 'react';
import type {ThreeElements} from '@react-three/fiber';
import * as THREE from 'three';
import {geoEquirectangular, geoGraticule10, geoPath} from 'd3-geo';
import {feature} from 'topojson-client';
import land50 from 'world-atlas/land-50m.json';

/**
 * Hero props for 《续命》 v4, built procedurally in three.js so they share one material
 * language (glazed ceramic, oily roasted bean, glassy atoms) and one light rig.
 * Sizes are in "cup units": the cup is 1 tall.
 */

type G = ThreeElements['group'];

const V = (x: number, y: number) => new THREE.Vector2(x, y);

// ---------------------------------------------------------------- the cup

/** wall profile, outside up then inside down, revolved by LatheGeometry */
const CUP_PROFILE = [
	V(0, 0),
	V(0.36, 0),
	V(0.4, 0.015),
	V(0.41, 0.05),
	V(0.44, 0.2),
	V(0.5, 0.5),
	V(0.55, 0.8),
	V(0.575, 0.97),
	V(0.578, 1.0),
	V(0.57, 1.012),
	V(0.556, 1.0),
	V(0.548, 0.95),
	V(0.52, 0.75),
	V(0.47, 0.45),
	V(0.42, 0.18),
	V(0.3, 0.09),
	V(0, 0.08),
];

/** cup radius (inside) at height y, for placing the liquid */
export const cupInnerR = (y: number) => {
	const ins = CUP_PROFILE.slice(10);
	for (let i = 0; i < ins.length - 1; i++) {
		const a = ins[i];
		const b = ins[i + 1];
		if (y <= a.y && y >= b.y) return a.x + ((b.x - a.x) * (y - a.y)) / (b.y - a.y);
	}
	return 0.4;
};

export const Cup: React.FC<{glaze?: string; level?: number; t?: number; swirl?: number; children?: React.ReactNode} & G> = ({glaze = '#efe5d6', level = 0.86, t = 0, swirl = 1, children, ...g}) => {
	const body = useMemo(() => new THREE.LatheGeometry(CUP_PROFILE, 160), []);
	const handle = useMemo(() => {
		const path = new THREE.CatmullRomCurve3([
			new THREE.Vector3(0.53, 0.82, 0),
			new THREE.Vector3(0.78, 0.84, 0),
			new THREE.Vector3(0.86, 0.6, 0),
			new THREE.Vector3(0.74, 0.36, 0),
			new THREE.Vector3(0.47, 0.3, 0),
		]);
		return new THREE.TubeGeometry(path, 64, 0.045, 24, false);
	}, []);
	const y = 0.08 + level * 0.9;
	return (
		<group {...g}>
			<mesh geometry={body}>
				<meshPhysicalMaterial color={glaze} roughness={0.22} clearcoat={1} clearcoatRoughness={0.08} side={THREE.DoubleSide} />
			</mesh>
			<mesh geometry={handle}>
				<meshPhysicalMaterial color={glaze} roughness={0.22} clearcoat={1} clearcoatRoughness={0.08} />
			</mesh>
			<CoffeeSurface y={y} r={cupInnerR(y) - 0.002} t={t} swirl={swirl} />
			{children}
		</group>
	);
};

// ---------------------------------------------------------------- the coffee surface: crema swirl, real specular

const surfaceFrag = /* glsl */ `
uniform float uT; uniform float uSwirl; uniform vec3 uKey;
varying vec2 vUv; varying vec3 vW;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*n(p);p*=2.03;a*=.5;}return s;}
void main(){
  vec2 p=vUv*2.-1.; float r=length(p); float a=atan(p.y,p.x);
  float tw=a+uSwirl*(2.2*(1.-r))+uT*.12;
  vec2 q=vec2(cos(tw),sin(tw))*r*4.;
  float w=fbm(q*1.3+uT*.04);
  float m=fbm(q+w*1.6);
  // espresso body: near black-brown, warmer toward the rim where the crema gathers
  vec3 dark=vec3(.035,.014,.006), body=vec3(.16,.07,.03), crema=vec3(.48,.27,.12);
  float rim=smoothstep(.55,1.,r);
  vec3 c=mix(dark,body,smoothstep(.3,.8,m));
  // tiger-striping: thin crema ribbons riding the swirl
  float rib=smoothstep(.56,.6,m)-smoothstep(.6,.68,m);
  c=mix(c,crema,clamp(rib*.65+rim*.55*smoothstep(.4,.7,w),0.,1.));
  // gloss: key highlight plus a soft sheen of the room
  vec3 V=normalize(cameraPosition-vW); vec3 L=normalize(uKey-vW); vec3 H=normalize(V+L);
  float sp=pow(max(H.y,0.),400.)*3.+pow(max(H.y,0.),30.)*.12;
  float fr=pow(1.-max(V.y,0.),4.)*.25;
  gl_FragColor=vec4(c+sp*vec3(1.,.9,.75)+fr*vec3(.5,.55,.7),1.);
  #include <colorspace_fragment>
}`;
const surfaceVert = /* glsl */ `
varying vec2 vUv; varying vec3 vW;
void main(){vUv=uv; vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w;}`;

export const CoffeeSurface: React.FC<{y: number; r: number; t: number; swirl?: number; keyPos?: [number, number, number]}> = ({y, r, t, swirl = 1, keyPos = [3, 4, 3]}) => {
	const mat = useMemo(
		() =>
			new THREE.ShaderMaterial({
				vertexShader: surfaceVert,
				fragmentShader: surfaceFrag,
				uniforms: {uT: {value: 0}, uSwirl: {value: 1}, uKey: {value: new THREE.Vector3()}},
			}),
		[],
	);
	mat.uniforms.uT.value = t;
	mat.uniforms.uSwirl.value = swirl;
	mat.uniforms.uKey.value.set(...keyPos);
	return (
		<mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]} material={mat}>
			<circleGeometry args={[r, 128]} />
		</mesh>
	);
};

// ---------------------------------------------------------------- the coffee bean

/** an ellipsoid with one flattened face and the S-shaped centre cut */
export const useBeanGeometry = () =>
	useMemo(() => {
		const g = new THREE.SphereGeometry(1, 96, 64);
		const p = g.attributes.position;
		const v = new THREE.Vector3();
		for (let i = 0; i < p.count; i++) {
			v.fromBufferAttribute(p, i);
			let {x, y, z} = v;
			if (y < 0) y *= 0.42; // the flat face
			const sx = x - 0.09 * Math.sin(z * 2.8); // S-curve of the cut
			const cut = Math.exp(-((sx / 0.05) ** 2)) * Math.max(0, 1 - Math.abs(z) ** 3);
			const lip = Math.exp(-(((Math.abs(sx) - 0.09) / 0.06) ** 2)) * Math.max(0, 1 - Math.abs(z) ** 3);
			if (y < 0.05) y += 0.34 * cut - 0.04 * lip;
			p.setXYZ(i, x * 0.62, y * 0.5, z * 0.85);
		}
		g.computeVertexNormals();
		return g;
	}, []);

/** roast 0 = green, 1 = dark roast; sheen grows with the oil */
export const beanColor = (roast: number) => {
	const stops = ['#a9b37e', '#c9a35a', '#8a4b22', '#4a2512', '#24110a'];
	const k = Math.min(0.9999, Math.max(0, roast)) * (stops.length - 1);
	const i = Math.floor(k);
	return new THREE.Color(stops[i]).lerp(new THREE.Color(stops[i + 1]), k - i);
};

export const Bean: React.FC<{roast?: number; glow?: number} & G> = ({roast = 0.8, glow = 0, ...g}) => {
	const geo = useBeanGeometry();
	const c = beanColor(roast);
	return (
		<group {...g}>
			<mesh geometry={geo}>
				<meshPhysicalMaterial
					color={c}
					roughness={0.75 - 0.4 * roast}
					clearcoat={Math.max(0, roast - 0.6) * 1.8}
					clearcoatRoughness={0.35}
					sheen={0.4}
					sheenColor={roast < 0.3 ? '#e8f0c0' : '#ffb070'}
					emissive="#ff6a1a"
					emissiveIntensity={glow}
				/>
			</mesh>
		</group>
	);
};

// ---------------------------------------------------------------- molecules

type Atom = {el: 'C' | 'N' | 'O' | 'H'; p: [number, number, number]; core?: boolean};
type Bond = [number, number, number?];

/** caffeine (1,3,7-trimethylxanthine), flat purine core + three methyls, coordinates in Å-ish */
const ring = (() => {
	const v = (k: number): [number, number, number] => [1.4 * Math.cos(((30 + 60 * k) * Math.PI) / 180) - 1, 1.4 * Math.sin(((30 + 60 * k) * Math.PI) / 180), 0];
	const pc = 2.174 - 1;
	const R = 1.191;
	const pv = (deg: number): [number, number, number] => [pc + R * Math.cos((deg * Math.PI) / 180), R * Math.sin((deg * Math.PI) / 180), 0];
	return {C5: v(0), C6: v(1), N1: v(2), C2: v(3), N3: v(4), C4: v(5), N7: pv(72), C8: pv(0), N9: pv(-72)};
})();

export const CAFFEINE: {atoms: Atom[]; bonds: Bond[]} = {
	atoms: [
		{el: 'N', p: ring.N1, core: true}, // 0
		{el: 'C', p: ring.C2, core: true}, // 1
		{el: 'N', p: ring.N3, core: true}, // 2
		{el: 'C', p: ring.C4, core: true}, // 3
		{el: 'C', p: ring.C5, core: true}, // 4
		{el: 'C', p: ring.C6, core: true}, // 5
		{el: 'N', p: ring.N7, core: true}, // 6
		{el: 'C', p: ring.C8, core: true}, // 7
		{el: 'N', p: ring.N9, core: true}, // 8
		{el: 'O', p: [-1, 2.62, 0]}, // 9  on C6
		{el: 'O', p: [-3.25, -1.3, 0]}, // 10 on C2
		{el: 'C', p: [-3.25, 1.3, 0.1]}, // 11 methyl N1
		{el: 'C', p: [-1, -2.65, -0.1]}, // 12 methyl N3
		{el: 'C', p: [1.95, 2.35, 0.1]}, // 13 methyl N7
		{el: 'H', p: [3.35, 0, 0]}, // 14 on C8
	],
	bonds: [
		[0, 1], [1, 2], [2, 3], [3, 4, 2], [4, 5], [5, 0], [4, 6], [6, 7], [7, 8, 2], [8, 3],
		[5, 9, 2], [1, 10, 2], [0, 11], [2, 12], [6, 13], [7, 14],
	],
};

/** adenosine: the same purine core (adenine, NH2 on C6) plus a ribose ring off N9 */
export const ADENOSINE: {atoms: Atom[]; bonds: Bond[]} = {
	atoms: [
		{el: 'N', p: ring.N1, core: true},
		{el: 'C', p: ring.C2, core: true},
		{el: 'N', p: ring.N3, core: true},
		{el: 'C', p: ring.C4, core: true},
		{el: 'C', p: ring.C5, core: true},
		{el: 'C', p: ring.C6, core: true},
		{el: 'N', p: ring.N7, core: true},
		{el: 'C', p: ring.C8, core: true},
		{el: 'N', p: ring.N9, core: true},
		{el: 'N', p: [-1, 2.65, 0]}, // 9 NH2 on C6
		{el: 'H', p: [-1.95, -1.25, 0]}, // 10 H on C2
		// ribose, puckered out of plane
		{el: 'C', p: [2.35, -2.75, 0.3]}, // 11 C1'
		{el: 'O', p: [3.7, -3.1, 0.7]}, // 12 O4'
		{el: 'C', p: [4.1, -4.4, 0.2]}, // 13 C4'
		{el: 'C', p: [2.9, -5.1, -0.4]}, // 14 C3'
		{el: 'C', p: [1.8, -4.1, -0.5]}, // 15 C2'
		{el: 'O', p: [3.0, -6.4, -0.8]}, // 16 OH
		{el: 'O', p: [0.5, -4.5, -1.0]}, // 17 OH
		{el: 'C', p: [5.5, -4.6, 0.8]}, // 18 C5'
		{el: 'O', p: [6.4, -3.6, 0.5]}, // 19 OH
	],
	bonds: [
		[0, 1, 2], [1, 2], [2, 3, 2], [3, 4], [4, 5], [5, 0], [4, 6], [6, 7, 2], [7, 8], [8, 3],
		[5, 9], [1, 10], [8, 11], [11, 12], [12, 13], [13, 14], [14, 15], [15, 11], [14, 16], [15, 17], [13, 18], [18, 19],
	],
};

const EL: Record<Atom['el'], {r: number; c: string}> = {
	C: {r: 0.36, c: '#3b4250'},
	N: {r: 0.34, c: '#4f7dff'},
	O: {r: 0.34, c: '#ff5a48'},
	H: {r: 0.2, c: '#e9e6df'},
};

/** ball-and-stick; `core` (0..1) lights the shared purine skeleton in gold */
export const Molecule: React.FC<{mol: {atoms: Atom[]; bonds: Bond[]}; core?: number; ghost?: number} & G> = ({mol, core = 0, ghost = 1, ...g}) => {
	const up = new THREE.Vector3(0, 1, 0);
	return (
		<group {...g}>
			{mol.atoms.map((a, i) => {
				const e = EL[a.el];
				const lit = a.core ? core : 0;
				return (
					<mesh key={i} position={a.p}>
						<sphereGeometry args={[e.r, 48, 32]} />
						<meshPhysicalMaterial color={e.c} roughness={0.18} clearcoat={1} clearcoatRoughness={0.05} emissive="#f1c56d" emissiveIntensity={lit * 0.55} transparent={ghost < 1} opacity={ghost} />
					</mesh>
				);
			})}
			{mol.bonds.flatMap(([a, b, order = 1], i) => {
				const A = new THREE.Vector3(...mol.atoms[a].p);
				const B = new THREE.Vector3(...mol.atoms[b].p);
				const mid = A.clone().add(B).multiplyScalar(0.5);
				const dir = B.clone().sub(A);
				const len = dir.length();
				const q = new THREE.Quaternion().setFromUnitVectors(up, dir.clone().normalize());
				const side = new THREE.Vector3(0, 0, 1).cross(dir).normalize().multiplyScalar(0.11);
				const offs = order === 2 ? [side, side.clone().multiplyScalar(-1)] : [new THREE.Vector3()];
				const lit = mol.atoms[a].core && mol.atoms[b].core ? core : 0;
				return offs.map((o, k) => (
					<mesh key={`${i}-${k}`} position={mid.clone().add(o)} quaternion={q}>
						<cylinderGeometry args={[0.075, 0.075, len, 16]} />
						<meshPhysicalMaterial color="#c9ccd4" roughness={0.3} metalness={0.2} emissive="#f1c56d" emissiveIntensity={lit * 0.5} transparent={ghost < 1} opacity={ghost} />
					</mesh>
				));
			})}
		</group>
	);
};

// ---------------------------------------------------------------- the globe (real coastlines from world-atlas)

const useLandTexture = () =>
	useMemo(() => {
		const w = 4096;
		const h = 2048;
		const cv = document.createElement('canvas');
		cv.width = w;
		cv.height = h;
		const ctx = cv.getContext('2d')!;
		ctx.fillStyle = '#05070d';
		ctx.fillRect(0, 0, w, h);
		const proj = geoEquirectangular().scale(w / (2 * Math.PI)).translate([w / 2, h / 2]);
		const path = geoPath(proj, ctx);
		ctx.beginPath();
		path(geoGraticule10());
		ctx.strokeStyle = 'rgba(140,160,200,0.10)';
		ctx.lineWidth = 1.5;
		ctx.stroke();
		const land = feature(land50 as any, (land50 as any).objects.land);
		ctx.beginPath();
		path(land as any);
		ctx.fillStyle = '#4a3220';
		ctx.fill();
		const t = new THREE.CanvasTexture(cv);
		t.colorSpace = THREE.SRGBColorSpace;
		t.anisotropy = 8;
		// emissive coastlines only
		const ce = document.createElement('canvas');
		ce.width = w;
		ce.height = h;
		const cx = ce.getContext('2d')!;
		cx.fillStyle = '#000';
		cx.fillRect(0, 0, w, h);
		const p2 = geoPath(proj, cx);
		cx.beginPath();
		p2(land as any);
		cx.strokeStyle = '#ffc57a';
		cx.lineWidth = 2.2;
		cx.stroke();
		const e = new THREE.CanvasTexture(ce);
		e.colorSpace = THREE.SRGBColorSpace;
		e.anisotropy = 8;
		return {t, e};
	}, []);

/** lon/lat to a point on the unit sphere, matching SphereGeometry's uv layout */
export const ll = (lon: number, lat: number, r = 1) => {
	const phi = ((90 - lat) * Math.PI) / 180;
	const th = ((lon + 180) * Math.PI) / 180;
	return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th));
};

const atmoFrag = /* glsl */ `
varying vec3 vN; varying vec3 vV;
void main(){ float d=dot(vN,vV); float f=pow(clamp(-d/.42,0.,1.),2.2)*.42; gl_FragColor=vec4(vec3(1.,.72,.42)*f,f); }`;
const atmoVert = /* glsl */ `
varying vec3 vN; varying vec3 vV;
void main(){ vec4 w=modelMatrix*vec4(position,1.); vN=normalize(mat3(modelMatrix)*normal); vV=normalize(cameraPosition-w.xyz); gl_Position=projectionMatrix*viewMatrix*w; }`;

export type Route = {from: [number, number]; to: [number, number]; p: number};

/** great-circle arc lifted off the surface; p draws it in */
const Arc: React.FC<Route> = ({from, to, p}) => {
	const geo = useMemo(() => {
		const a = ll(...from);
		const b = ll(...to);
		const pts: THREE.Vector3[] = [];
		const n = 80;
		const ang = a.angleTo(b);
		for (let i = 0; i <= n; i++) {
			const u = i / n;
			const v = new THREE.Vector3().copy(a).lerp(b, u).normalize();
			pts.push(v.multiplyScalar(1.004 + 0.12 * ang * Math.sin(Math.PI * u)));
		}
		return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, 0.0045, 8, false);
	}, [from, to]);
	if (p <= 0) return null;
	const count = Math.floor(geo.index!.count * Math.min(1, p));
	geo.setDrawRange(0, count - (count % 3));
	const curve = (geo as THREE.TubeGeometry).parameters.path;
	const head = curve.getPointAt(Math.min(1, p));
	return (
		<group>
			<mesh geometry={geo}>
				<meshBasicMaterial color="#ffc070" toneMapped={false} />
			</mesh>
			{p < 1 ? (
				<mesh position={head}>
					<sphereGeometry args={[0.014, 16, 12]} />
					<meshBasicMaterial color="#fff2d0" toneMapped={false} />
				</mesh>
			) : null}
		</group>
	);
};

export const Globe: React.FC<{routes?: Route[]; cities?: {at: [number, number]; o: number}[]} & G> = ({routes = [], cities = [], ...g}) => {
	const {t: tex, e: coast} = useLandTexture();
	const atmo = useMemo(() => new THREE.ShaderMaterial({vertexShader: atmoVert, fragmentShader: atmoFrag, transparent: true, side: THREE.BackSide, depthWrite: false, blending: THREE.AdditiveBlending}), []);
	return (
		<group {...g}>
			<mesh>
				<sphereGeometry args={[1, 128, 96]} />
				<meshStandardMaterial map={tex} roughness={0.7} metalness={0} emissive="#ffffff" emissiveMap={coast} emissiveIntensity={0.55} />
			</mesh>
			<mesh material={atmo} scale={1.1}>
				<sphereGeometry args={[1, 64, 48]} />
			</mesh>
			{routes.map((r, i) => (
				<Arc key={i} {...r} />
			))}
			{cities.map((c, i) =>
				c.o > 0 ? (
					<mesh key={i} position={ll(c.at[0], c.at[1], 1.006)}>
						<sphereGeometry args={[0.012 * c.o, 16, 12]} />
						<meshBasicMaterial color="#ffe2a8" toneMapped={false} />
					</mesh>
				) : null,
			)}
		</group>
	);
};

// ---------------------------------------------------------------- DNA

export const DNA: React.FC<{turns?: number; len?: number; split?: number; t?: number; color?: string} & G> = ({turns = 3, len = 6, split = 0, t = 0, color = '#ffcf8a', ...g}) => {
	const n = turns * 12;
	return (
		<group {...g}>
			{Array.from({length: n}, (_, i) => {
				const u = i / (n - 1);
				const y = (u - 0.5) * len;
				const a = u * turns * Math.PI * 2 + t;
				const r = 0.6;
				const s = split * Math.max(0, Math.sin(u * Math.PI));
				const A: [number, number, number] = [r * Math.cos(a) - s, y, r * Math.sin(a)];
				const B: [number, number, number] = [r * Math.cos(a + Math.PI) + s, y, r * Math.sin(a + Math.PI)];
				const mid = new THREE.Vector3((A[0] + B[0]) / 2, y, (A[2] + B[2]) / 2);
				const d = new THREE.Vector3(B[0] - A[0], 0, B[2] - A[2]);
				const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
				return (
					<group key={i}>
						<mesh position={A}>
							<sphereGeometry args={[0.09, 20, 14]} />
							<meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={0.6} roughness={0.2} clearcoat={1} />
						</mesh>
						<mesh position={B}>
							<sphereGeometry args={[0.09, 20, 14]} />
							<meshPhysicalMaterial color="#9fc0ff" emissive="#9fc0ff" emissiveIntensity={0.5} roughness={0.2} clearcoat={1} />
						</mesh>
						{split < 0.3 ? (
							<mesh position={mid} quaternion={q}>
								<cylinderGeometry args={[0.025, 0.025, d.length(), 8]} />
								<meshStandardMaterial color="#e8dccb" transparent opacity={0.35 * (1 - split / 0.3)} />
							</mesh>
						) : null}
					</group>
				);
			})}
		</group>
	);
};

// ---------------------------------------------------------------- coffee cherry, leaf, flower

export const Cherry: React.FC<{ripe?: number} & G> = ({ripe = 1, ...g}) => {
	const c = new THREE.Color('#6f9a3a').lerp(new THREE.Color('#b0141e'), ripe);
	return (
		<group {...g}>
			<mesh scale={[1, 1.12, 1]}>
				<sphereGeometry args={[0.16, 48, 32]} />
				<meshPhysicalMaterial color={c} roughness={0.25} clearcoat={1} clearcoatRoughness={0.1} />
			</mesh>
			<mesh position={[0, -0.18, 0]}>
				<torusGeometry args={[0.022, 0.012, 8, 24]} />
				<meshStandardMaterial color="#3a1a10" roughness={0.8} />
			</mesh>
		</group>
	);
};

/** glossy coffee leaf: elliptic blade, wavy edge, sunken veins, bent along the midrib */
export const useLeafGeometry = () =>
	useMemo(() => {
		const g = new THREE.PlaneGeometry(1, 2.6, 60, 120);
		const p = g.attributes.position;
		for (let i = 0; i < p.count; i++) {
			let x = p.getX(i);
			let y = p.getY(i);
			const v = (y + 1.3) / 2.6; // 0 base .. 1 tip
			const half = 0.5 * Math.sin(Math.PI * Math.pow(v, 0.8)) * (1 - 0.15 * v);
			x *= 2 * half;
			const ax = Math.abs(x) / Math.max(0.001, half);
			const wave = 0.03 * Math.sin(v * 38) * ax ** 2;
			const vein = -0.012 * Math.max(0, Math.cos((v * 9 - ax * 2.2) * Math.PI)) ** 8 * (1 - ax);
			const z = -0.18 * x * x * 4 + 0.25 * Math.sin(v * Math.PI) + wave + vein - 0.02 * Math.exp(-((x / 0.02) ** 2));
			p.setXYZ(i, x, y, z);
		}
		g.computeVertexNormals();
		return g;
	}, []);

export const Leaf: React.FC<{color?: string; glow?: number} & G> = ({color = '#1f4a22', glow = 0, ...g}) => {
	const geo = useLeafGeometry();
	return (
		<group {...g}>
			<mesh geometry={geo}>
				<meshPhysicalMaterial color={color} roughness={0.28} clearcoat={0.8} clearcoatRoughness={0.15} side={THREE.DoubleSide} sheen={0.3} sheenColor="#b8e08a" emissive="#ffb347" emissiveIntensity={glow} />
			</mesh>
		</group>
	);
};

/** coffee flower: five narrow white petals, long stamens */
export const Flower: React.FC<{open?: number; glow?: number} & G> = ({open = 1, glow = 0, ...g}) => {
	const petal = useMemo(() => {
		const s = new THREE.Shape();
		s.moveTo(0, 0);
		s.bezierCurveTo(0.08, 0.15, 0.09, 0.45, 0, 0.62);
		s.bezierCurveTo(-0.09, 0.45, -0.08, 0.15, 0, 0);
		const geo = new THREE.ShapeGeometry(s, 24);
		const p = geo.attributes.position;
		for (let i = 0; i < p.count; i++) p.setZ(i, 0.06 * Math.sin((p.getY(i) / 0.62) * Math.PI));
		geo.computeVertexNormals();
		return geo;
	}, []);
	return (
		<group {...g}>
			{Array.from({length: 5}, (_, i) => (
				<group key={i} rotation={[0, 0, (i / 5) * Math.PI * 2]}>
					<mesh geometry={petal} rotation={[-(1 - open) * 1.3 - 0.15, 0, 0]}>
						<meshPhysicalMaterial color="#fbf6ec" roughness={0.45} transmission={0.25} thickness={0.05} side={THREE.DoubleSide} emissive="#ffe0a0" emissiveIntensity={glow} />
					</mesh>
				</group>
			))}
			{Array.from({length: 5}, (_, i) => {
				const a = ((i + 0.5) / 5) * Math.PI * 2;
				return (
					<group key={`s${i}`} rotation={[0, 0, a]}>
						<mesh position={[0, 0.14, 0.12]} rotation={[0.9, 0, 0]}>
							<cylinderGeometry args={[0.006, 0.006, 0.3, 6]} />
							<meshStandardMaterial color="#f6efdc" />
						</mesh>
						<mesh position={[0, 0.25, 0.24]}>
							<sphereGeometry args={[0.022, 12, 8]} />
							<meshStandardMaterial color="#e8c070" emissive="#f1c56d" emissiveIntensity={glow * 2} />
						</mesh>
					</group>
				);
			})}
		</group>
	);
};

// ---------------------------------------------------------------- saucer, table, steam

export const Saucer: React.FC<{glaze?: string} & G> = ({glaze = '#efe5d6', ...g}) => {
	const geo = useMemo(
		() => new THREE.LatheGeometry([V(0, 0.0), V(0.4, 0.0), V(0.45, 0.02), V(0.8, 0.06), V(0.95, 0.11), V(0.96, 0.125), V(0.93, 0.125), V(0.78, 0.08), V(0.45, 0.05), V(0, 0.045)], 160),
		[],
	);
	return (
		<mesh geometry={geo} {...(g as any)}>
			<meshPhysicalMaterial color={glaze} roughness={0.22} clearcoat={1} clearcoatRoughness={0.08} side={THREE.DoubleSide} />
		</mesh>
	);
};

export const Table: React.FC<{color?: string; y?: number; size?: number}> = ({color = '#1b120c', y = 0, size = 400}) => (
	<mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
		<planeGeometry args={[size, size]} />
		<meshPhysicalMaterial color={color} roughness={0.38} clearcoat={0.6} clearcoatRoughness={0.25} />
	</mesh>
);

const steamFrag = /* glsl */ `
uniform float uT; uniform float uO; uniform float uSeed; varying vec2 vUv;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7))+uSeed)*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*n(p);p*=2.02;a*=.5;}return s;}
void main(){
  vec2 p=vUv; float y=p.y;
  float sway=(fbm(vec2(y*2.5-uT*.35,uSeed))-.5)*.55*y;
  float x=(p.x-.5-sway)/(.08+.22*y);
  float wisp=exp(-x*x*2.2);
  float tex=fbm(vec2(p.x*5.,y*3.-uT*.6))*1.6;
  float a=wisp*tex*smoothstep(0.,.18,y)*(1.-smoothstep(.45,1.,y))*uO;
  gl_FragColor=vec4(vec3(1.,.95,.88)*a,a);
}`;
const plainVert = /* glsl */ `varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;

/** soft rising wisps, billboarded planes with an fbm shader */
export const Steam: React.FC<{t: number; o?: number; n?: number} & G> = ({t, o = 0.5, n = 3, ...g}) => {
	const mats = useMemo(
		() =>
			Array.from(
				{length: n},
				(_, i) =>
					new THREE.ShaderMaterial({
						vertexShader: plainVert,
						fragmentShader: steamFrag,
						uniforms: {uT: {value: 0}, uO: {value: 0}, uSeed: {value: i * 7.13}},
						transparent: true,
						depthWrite: false,
						blending: THREE.AdditiveBlending,
						side: THREE.DoubleSide,
					}),
			),
		[n],
	);
	mats.forEach((m, i) => {
		m.uniforms.uT.value = t + i * 3.1;
		m.uniforms.uO.value = o;
	});
	return (
		<group {...g}>
			{mats.map((m, i) => (
				<mesh key={i} material={m} position={[(i - (n - 1) / 2) * 0.12, 0.75, (i % 2) * 0.05]}>
					<planeGeometry args={[0.9, 1.6]} />
				</mesh>
			))}
		</group>
	);
};
