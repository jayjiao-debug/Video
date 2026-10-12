import React, {useLayoutEffect, useMemo, useRef} from 'react';
import {AbsoluteFill, Composition, registerRoot} from 'remotion';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {Stage3D, envProps, useEnv} from '../../episodes/xuming/three/stage3d';
import {Sub} from '../kf/common';

/* ep26 gate 2a round 3: 高级纪录片 · 华丽炫技 — macro 3D, real light, depth of field, bloom. No cartoon people. */
const W = 1920, H = 1080;
const SANS = '"Noto Sans CJK SC", sans-serif';
const GOLD = '#f1c56d';
const tx = (size: number, weight = 900) => ({fontFamily: SANS, fontSize: size, fontWeight: weight, fontVariantNumeric: 'lining-nums' as const});
const rnd = (s: number) => () => ((s = (s * 16807) % 2147483647) / 2147483647);

/* ---------- textures drawn on a canvas (engraved banknote; coin face relief) ---------- */
const noteTexture = (title: string, big: string, small: string, ink: string, paper: string, serial: string) => {
	const c = document.createElement('canvas');
	c.width = 2048;
	c.height = 1024;
	const g = c.getContext('2d')!;
	g.fillStyle = paper;
	g.fillRect(0, 0, 2048, 1024);
	g.strokeStyle = ink;
	// background wave lines
	g.globalAlpha = 0.28;
	g.lineWidth = 1.4;
	for (let k = 0; k < 60; k++) {
		g.beginPath();
		for (let i = 0; i <= 120; i++) {
			const x = i * 17.2, y = 40 + k * 16 + Math.sin(i * 0.32 + k * 0.45) * 9;
			if (i) g.lineTo(x, y);
			else g.moveTo(x, y);
		}
		g.stroke();
	}
	// guilloche rosettes
	const ros = (cx: number, cy: number, s: number) => {
		for (let j = 0; j < 6; j++) {
			const R = (230 - j * 26) * s, r = (31 + j * 2) * s, d = (120 - j * 15) * s, k = (R - r) / r;
			g.globalAlpha = 0.55 - j * 0.06;
			g.lineWidth = 1.6;
			g.beginPath();
			for (let i = 0; i <= 3000; i++) {
				const a = (i / 3000) * Math.PI * 2 * r;
				const x = cx + (R - r) * Math.cos(a) + d * Math.cos(k * a), y = cy + (R - r) * Math.sin(a) - d * Math.sin(k * a);
				if (i) g.lineTo(x, y);
				else g.moveTo(x, y);
			}
			g.stroke();
		}
	};
	ros(330, 512, 1.15);
	ros(1718, 512, 1.15);
	g.globalAlpha = 1;
	g.lineWidth = 10;
	g.strokeRect(40, 40, 1968, 944);
	g.lineWidth = 3;
	g.strokeRect(64, 64, 1920, 896);
	g.fillStyle = ink;
	g.textAlign = 'center';
	g.font = `700 64px ${SANS}`;
	g.fillText(title, 1024, 250);
	g.font = `900 200px ${SANS}`;
	g.fillText(big, 1024, 560);
	g.font = `500 60px ${SANS}`;
	g.fillText(small, 1024, 700);
	g.font = `500 52px "DejaVu Sans Mono", monospace`;
	g.fillStyle = '#9a3b2c';
	g.fillText(serial, 1024, 880);
	const t = new THREE.CanvasTexture(c);
	t.colorSpace = THREE.SRGBColorSpace;
	t.anisotropy = 8;
	return t;
};
const coinBump = () => {
	const c = document.createElement('canvas');
	c.width = c.height = 512;
	const g = c.getContext('2d')!;
	g.fillStyle = '#808080';
	g.fillRect(0, 0, 512, 512);
	g.strokeStyle = '#c8c8c8';
	g.lineWidth = 10;
	g.beginPath();
	g.arc(256, 256, 236, 0, Math.PI * 2);
	g.stroke();
	g.lineWidth = 3;
	for (let i = 0; i < 120; i++) {
		const a = (i / 120) * Math.PI * 2;
		g.beginPath();
		g.moveTo(256 + Math.cos(a) * 214, 256 + Math.sin(a) * 214);
		g.lineTo(256 + Math.cos(a) * 228, 256 + Math.sin(a) * 228);
		g.stroke();
	}
	g.fillStyle = '#d0d0d0';
	g.font = `900 230px "DejaVu Sans", sans-serif`;
	g.textAlign = 'center';
	g.textBaseline = 'middle';
	g.fillText('1', 256, 270);
	return new THREE.CanvasTexture(c);
};

/* ---------- pieces ---------- */
const Dust: React.FC<{n: number; box: [number, number, number]; center?: [number, number, number]; size?: number; color?: string; seed?: number}> = ({n, box, center = [0, 0, 0], size = 0.03, color = '#ffe2a8', seed = 7}) => {
	const geo = useMemo(() => {
		const r = rnd(seed);
		const p = new Float32Array(n * 3);
		for (let i = 0; i < n; i++) {
			p[i * 3] = center[0] + (r() - 0.5) * box[0];
			p[i * 3 + 1] = center[1] + (r() - 0.5) * box[1];
			p[i * 3 + 2] = center[2] + (r() - 0.5) * box[2];
		}
		const g = new THREE.BufferGeometry();
		g.setAttribute('position', new THREE.BufferAttribute(p, 3));
		return g;
	}, [n, seed]);
	return (
		<points geometry={geo}>
			<pointsMaterial color={color} size={size} sizeAttenuation transparent opacity={0.85} depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} />
		</points>
	);
};

/** soft shadows on (PCF soft); set before the first frame */
const Shadows: React.FC = () => {
	const {gl} = useThree();
	gl.shadowMap.enabled = true;
	gl.shadowMap.type = THREE.PCFSoftShadowMap;
	return null;
};

/** THE key light: one spotlight with soft shadows, aimed at the hero */
const KeySpot: React.FC<{from: [number, number, number]; to: [number, number, number]; intensity: number; angle: number; color?: string}> = ({from, to, intensity, angle, color = '#ffd9a8'}) => {
	const target = useMemo(() => {
		const o = new THREE.Object3D();
		o.position.set(...to);
		o.updateMatrixWorld();
		return o;
	}, [to[0], to[1], to[2]]);
	return (
		<>
			<primitive object={target} />
			<spotLight position={from} target={target} color={color} intensity={intensity} angle={angle} penumbra={0.85} decay={2} distance={0} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-bias={-0.0004} shadow-radius={6} />
		</>
	);
};

/** a soft volumetric beam along the key light: bright core, smooth edges, fades along its length */
const beamFrag = /* glsl */ `
uniform vec3 uColor; uniform float uK; varying vec3 vN; varying vec3 vV; varying float vY;
void main(){
  float core = pow(abs(dot(normalize(vN), normalize(vV))), 2.2);   // brightest where we look through the middle
  float along = smoothstep(0.0, 0.25, vY) * (1.0 - smoothstep(0.55, 1.0, vY)); // fade in near the lamp, fade out at the floor
  float a = core * along * uK;
  gl_FragColor = vec4(uColor * a, a);
}`;
const beamVert = /* glsl */ `
varying vec3 vN; varying vec3 vV; varying float vY;
void main(){
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalMatrix * normal; vV = -mv.xyz; vY = uv.y;
  gl_Position = projectionMatrix * mv;
}`;
const SoftBeam: React.FC<{from: [number, number, number]; to: [number, number, number]; r0: number; r1: number; k?: number; color?: string}> = ({from, to, r0, r1, k = 0.35, color = '#ffd9a8'}) => {
	const {pos, quat, len} = useMemo(() => {
		const A = new THREE.Vector3(...from), B = new THREE.Vector3(...to);
		const dir = B.clone().sub(A);
		const L = dir.length() * 1.25;
		const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir.clone().normalize());
		return {pos: A.clone().add(dir.clone().normalize().multiplyScalar(L / 2)), quat: q, len: L};
	}, [from.join(), to.join()]);
	const mat = useMemo(() => new THREE.ShaderMaterial({uniforms: {uColor: {value: new THREE.Color(color)}, uK: {value: k}}, vertexShader: beamVert, fragmentShader: beamFrag, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.FrontSide}), [color, k]);
	return (
		<mesh position={pos} quaternion={quat} material={mat}>
			<cylinderGeometry args={[r0, r1, len, 96, 1, true]} />
		</mesh>
	);
};

const Note: React.FC<{tex: THREE.Texture; position: [number, number, number]; rotation: [number, number, number]; s?: number; glow?: number; o?: number}> = ({tex, position, rotation, s = 1, glow = 0.25, o = 1}) => {
	const e = useEnv();
	return (
		<mesh position={position} rotation={rotation} scale={s} castShadow receiveShadow>
			<planeGeometry args={[2, 1, 24, 12]} />
			<meshPhysicalMaterial map={tex} color="#b8ae9b" emissiveMap={tex} emissive="#ffffff" emissiveIntensity={glow} roughness={0.7} side={THREE.DoubleSide} transparent opacity={o} {...envProps(e, 0.15)} />
		</mesh>
	);
};

/** thousands of coins in one draw call */
const Coins: React.FC<{items: {p: [number, number, number]; r: [number, number, number]; s: number}[]}> = ({items}) => {
	const ref = useRef<THREE.InstancedMesh>(null);
	const e = useEnv();
	const bump = useMemo(() => coinBump(), []);
	useLayoutEffect(() => {
		const m = new THREE.Matrix4(), q = new THREE.Quaternion(), eu = new THREE.Euler();
		items.forEach((it, i) => {
			eu.set(...it.r);
			q.setFromEuler(eu);
			m.compose(new THREE.Vector3(...it.p), q, new THREE.Vector3(it.s, it.s, it.s));
			ref.current!.setMatrixAt(i, m);
		});
		ref.current!.instanceMatrix.needsUpdate = true;
	}, [items]);
	return (
		<instancedMesh ref={ref} args={[undefined, undefined, items.length]} castShadow receiveShadow>
			<cylinderGeometry args={[0.16, 0.16, 0.022, 48]} />
			<meshPhysicalMaterial color="#c99642" metalness={1} roughness={0.34} bumpMap={bump} bumpScale={0.5} {...envProps(e, 0.22)} />
		</instancedMesh>
	);
};

/* ---------- frame 1 · 2.6 s: money that hasn't arrived yet ---------- */
const DocHook: React.FC = () => {
	const notes = useMemo(() => {
		const tex = noteTexture('工 资 通 知', '明年涨工资', '到账日期：明年', '#5a3b22', '#efe3c6', 'No. 000000');
		const r = rnd(3);
		return Array.from({length: 8}, (_, i) => ({
			tex,
			p: [(r() - 0.5) * 9, 2.6 - r() * 5.2, -6 + r() * 6] as [number, number, number],
			rot: [(r() - 0.5) * 1.2, (r() - 0.5) * 1.4, (r() - 0.5) * 0.9] as [number, number, number],
			s: 0.75 + r() * 0.5,
		}));
	}, []);
	const bokeh = useMemo(() => {
		const r = rnd(11);
		return Array.from({length: 40}, () => ({p: [(r() - 0.5) * 34, -3 + r() * 9, -16 - r() * 6] as [number, number, number], c: r() > 0.3 ? '#a8763a' : '#4f6488', s: 0.08 + r() * 0.14}));
	}, []);
	return (
		<AbsoluteFill style={{background: '#04050a'}}>
			<Stage3D cam={{pos: [0, -0.4, 6.2], target: [0, 0.3, 0], fov: 38}} bg="#05060b" env={0.35} focus={5.85} aperture={0.0028} bloom={0.55} threshold={0.88} vig={0.85} grain={0.04}>
				<Shadows />
				<KeySpot from={[-3.2, 6.5, 2.2]} to={[-0.6, 0.15, 0.4]} intensity={150} angle={0.3} />
				<pointLight position={[3.5, 2.5, -4]} color="#7fa6ff" intensity={14} decay={2} />
				<ambientLight intensity={0.015} />
				{bokeh.map((b, i) => (
					<mesh key={i} position={b.p}>
						<sphereGeometry args={[b.s, 12, 8]} />
						<meshBasicMaterial color={b.c} toneMapped={false} />
					</mesh>
				))}
				{/* the hero note, sharp, closest to focus */}
				<Note tex={notes[0].tex} position={[-0.6, 0.15, 0.4]} rotation={[-0.3, -0.38, 0.1]} s={1.5} glow={0.06} />
				<Note tex={notes[0].tex} position={[2.6, -1.6, 3.6]} rotation={[0.4, 0.6, -0.3]} s={1.2} glow={0.03} o={0.9} />
				{notes.slice(1).map((n, i) => (
					<Note key={i} tex={n.tex} position={n.p} rotation={n.rot} s={n.s} glow={0.04} o={0.9} />
				))}
				<SoftBeam from={[-3.2, 6.5, 0.6]} to={[-0.9, 0.0, -1.4]} r0={0.12} r1={2.2} k={0.4} />
				<Dust n={500} box={[12, 8, 8]} center={[0, 0.5, -1]} size={0.018} />
			</Stage3D>
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
				<g>
					<line x1={1270} y1={210} x2={1700} y2={210} stroke={GOLD} strokeOpacity={0.7} strokeWidth={2} />
					<text x={1270} y={180} style={tx(26, 500)} fill="#e9e1cf" letterSpacing="0.2em">老板 · 21:04</text>
					<text x={1270} y={270} style={tx(54, 900)} fill="#ffffff">明年给你涨工资</text>
				</g>
				<Sub t="钱还没到，你今晚就多花了一点" />
			</svg>
		</AbsoluteFill>
	);
};

/* ---------- frame 2 · 61 s: the fear vortex, frozen; one promise in the beam ---------- */
const DocKey: React.FC = () => {
	const coins = useMemo(() => {
		const r = rnd(5);
		return Array.from({length: 3800}, (_, i) => {
			// three spiral arms winding into a dark centre: the fear spiral, frozen
			const u = r();
			const arm = i % 3;
			const rad = 0.6 + Math.pow(u, 0.85) * 5.4;
			const a = arm * ((Math.PI * 2) / 3) + Math.log(rad + 0.4) * 3.2 + (r() - 0.5) * 0.95 * (0.35 + u);
			const y = -2.4 + Math.pow(rad / 6, 1.7) * 3.0 + (r() - 0.5) * 0.45;
			return {p: [Math.cos(a) * rad, y, Math.sin(a) * rad] as [number, number, number], r: [Math.PI / 2 - 0.35 + (r() - 0.5) * 0.6, -a + (r() - 0.5) * 0.5, (r() - 0.5) * 0.8] as [number, number, number], s: 0.8 + r() * 0.5};
		});
	}, []);
	const tex = useMemo(() => noteTexture('欧 洲 央 行 · 承 诺', '不惜一切代价', '保住欧元 · 伦敦 · 2012年7月26日', '#1f4a3c', '#efe6cf', 'No. 20120726'), []);
	return (
		<AbsoluteFill style={{background: '#04050a'}}>
			<Stage3D cam={{pos: [0, 7.4, 11.5], target: [0, -0.8, 0], fov: 34}} bg="#05060a" env={0.3} fog={[12, 30]} focus={11.0} aperture={0.0005} bloom={0.45} threshold={0.93} vig={0.85} grain={0.04}>
				<Shadows />
				<KeySpot from={[0.4, 10.5, 4.2]} to={[0, 0.6, 0.6]} intensity={520} angle={0.36} />
				<pointLight position={[0, 6, -9]} color="#6f8fff" intensity={30} decay={2} />
				<ambientLight intensity={0.012} />
				<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.75, 0]} receiveShadow>
					<planeGeometry args={[60, 60]} />
					<meshPhysicalMaterial color="#0b0907" roughness={0.55} clearcoat={0.4} clearcoatRoughness={0.4} />
				</mesh>
				<Coins items={coins} />
				<SoftBeam from={[0.4, 10.5, 4.2]} to={[0, 0.6, 0.6]} r0={0.1} r1={2.0} k={0.5} />
				<Note tex={tex} position={[0, 1.6, 1.2]} rotation={[-0.55, 0.06, -0.03]} s={1.7} glow={0.0} />
				<Dust n={400} box={[9, 7, 7]} center={[0, 0.5, 0]} size={0.015} />
			</Stage3D>
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
				<Sub t="钱还没出，先给一个[承诺]" />
			</svg>
		</AbsoluteFill>
	);
};


/* ---------- title · 16.8 s: a generic gold medal (laurel + 2026; not the real Nobel design), raking key light ---------- */
const medalBump = () => {
	const c = document.createElement('canvas');
	c.width = c.height = 1024;
	const g = c.getContext('2d')!;
	g.fillStyle = '#707070';
	g.fillRect(0, 0, 1024, 1024);
	g.fillStyle = '#d8d8d8';
	g.strokeStyle = '#d8d8d8';
	g.lineWidth = 14;
	g.beginPath();
	g.arc(512, 512, 470, 0, Math.PI * 2);
	g.stroke();
	// laurel: leaves along two arcs
	for (const side of [-1, 1]) {
		for (let i = 0; i < 16; i++) {
			const a = Math.PI / 2 + side * (0.35 + i * 0.16);
			const x = 512 + Math.cos(a) * 360, y = 512 + Math.sin(a) * 360;
			g.save();
			g.translate(x, y);
			g.rotate(a + side * 0.9);
			g.beginPath();
			g.ellipse(0, 0, 46, 17, 0, 0, Math.PI * 2);
			g.fill();
			g.restore();
		}
	}
	g.font = `900 210px "DejaVu Sans", sans-serif`;
	g.textAlign = 'center';
	g.textBaseline = 'middle';
	g.fillText('2026', 512, 520);
	const t = new THREE.CanvasTexture(c);
	t.center.set(0.5, 0.5);
	t.rotation = Math.PI / 2;
	return t;
};
const DocTitle: React.FC = () => {
	const bump = useMemo(() => medalBump(), []);
	const e = useEnv;
	return (
		<AbsoluteFill style={{background: '#04050a'}}>
			<Stage3D cam={{pos: [1.3, 0.5, 4.4], target: [0.75, 0.05, 0], fov: 30}} bg="#05060a" env={0.25} focus={4.5} aperture={0.004} bloom={0.5} threshold={0.9} vig={0.85} grain={0.04}>
				<Shadows />
				<KeySpot from={[-2.2, 2.0, 3.4]} to={[-0.25, 0, 0]} intensity={190} angle={0.45} />
				<pointLight position={[1.5, 1.2, -3]} color="#7fa6ff" intensity={10} decay={2} />
				<ambientLight intensity={0.01} />
				<group position={[-0.25, 0.05, 0]} rotation={[0.08, 0.5, 0.06]}>
					<mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
						<cylinderGeometry args={[1, 1, 0.09, 128]} />
						<MedalMat bump={bump} />
					</mesh>
					<mesh>
						<torusGeometry args={[1, 0.05, 24, 160]} />
						<MedalMat />
					</mesh>
				</group>
				<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.15, 0]} receiveShadow>
					<planeGeometry args={[30, 30]} />
					<meshPhysicalMaterial color="#0c0907" roughness={0.6} />
				</mesh>
				<Dust n={300} box={[5, 3, 3]} center={[0, 0.4, 0]} size={0.012} />
			</Stage3D>
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
				<defs>
					<linearGradient id="tt-gold" x1="0" y1="330" x2="0" y2="470" gradientUnits="userSpaceOnUse">
						<stop offset="0" stopColor="#fff3cf" />
						<stop offset="0.5" stopColor="#f3cd7a" />
						<stop offset="1" stopColor="#b8862a" />
					</linearGradient>
				</defs>
				<text x={1380} y={450} textAnchor="middle" style={{fontFamily: '"Noto Serif CJK SC", serif', fontWeight: 900, fontSize: 104}} fill="url(#tt-gold)">《一句话，</text>
				<text x={1420} y={590} textAnchor="middle" style={{fontFamily: '"Noto Serif CJK SC", serif', fontWeight: 900, fontSize: 104}} fill="url(#tt-gold)">值多少钱？》</text>
				<line x1={1150} x2={1650} y1={650} y2={650} stroke={GOLD} strokeOpacity={0.6} strokeWidth={1.5} />
				<text x={1400} y={700} textAnchor="middle" style={tx(30, 500)} fill="#e6dcc6" letterSpacing="0.2em">2026 诺贝尔经济学奖 · 霍尔 & 伍德福德</text>
			</svg>
		</AbsoluteFill>
	);
};
const MedalMat: React.FC<{bump?: THREE.Texture}> = ({bump}) => {
	const e = useEnv();
	return <meshPhysicalMaterial color="#d2a24e" metalness={1} roughness={0.3} bumpMap={bump} bumpScale={bump ? 2.2 : 0} {...envProps(e, 0.35)} />;
};

/* ---------- reveal · 82.5 s: the strongbox opens — empty, dust turning in the beam ---------- */
const Steel: React.FC = () => {
	const e = useEnv();
	return <meshPhysicalMaterial color="#6b6e72" metalness={0.8} roughness={0.5} {...envProps(e, 0.25)} />;
};
const DocVault: React.FC = () => {
	const w = 2.4, d = 1.6, h = 0.9, t = 0.06;
	return (
		<AbsoluteFill style={{background: '#04050a'}}>
			<Stage3D cam={{pos: [0, 3.5, 5.2], target: [0, 0.35, -0.2], fov: 34}} bg="#05060a" env={0.25} focus={5.6} aperture={0.002} bloom={0.55} threshold={0.88} vig={0.85} grain={0.04}>
				<Shadows />
				<KeySpot from={[0.3, 5.5, 1.2]} to={[0, 0, 0]} intensity={230} angle={0.42} />
				<pointLight position={[0, 3.2, -4.5]} color="#7fa6ff" intensity={22} decay={2} />
				<ambientLight intensity={0.01} />
				<mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
					<planeGeometry args={[30, 30]} />
					<meshPhysicalMaterial color="#0d0a08" roughness={0.5} clearcoat={0.4} />
				</mesh>
				<group position={[0, 0, 0]}>
					{/* inside floor, lined with dark felt */}
					<mesh position={[0, t, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
						<planeGeometry args={[w - 2 * t, d - 2 * t]} />
						<meshStandardMaterial color="#3a1414" roughness={0.95} />
					</mesh>
					{[[0, h / 2, d / 2, w, h, t], [0, h / 2, -d / 2, w, h, t], [w / 2, h / 2, 0, t, h, d], [-w / 2, h / 2, 0, t, h, d]].map(([x, y, z, sx, sy, sz], i) => (
						<mesh key={i} position={[x, y, z]} castShadow receiveShadow>
							<boxGeometry args={[sx, sy, sz]} />
							<Steel />
						</mesh>
					))}
					{/* the lid, hinged open at the back */}
					<group position={[0, h, -d / 2]} rotation={[-1.95, 0, 0]}>
						<mesh position={[0, 0.0, d / 2]} castShadow>
							<boxGeometry args={[w + 0.06, t * 1.6, d + 0.06]} />
							<Steel />
						</mesh>
					</group>
				</group>
				<SoftBeam from={[0.3, 5.5, 1.2]} to={[0, 0.05, 0]} r0={0.1} r1={1.4} k={0.22} />
				<Dust n={500} box={[2.2, 2.2, 1.5]} center={[0, 1.1, 0]} size={0.014} />
			</Stage3D>
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
				<Sub t="[一分钱都没有]" />
			</svg>
		</AbsoluteFill>
	);
};

const FR: React.FC[] = [DocHook, DocKey, DocTitle, DocVault];
const DocFrame: React.FC<{i: number}> = ({i}) => {
	const C = FR[i];
	return <C />;
};
const Root: React.FC = () => <Composition id="DOC26" component={DocFrame} durationInFrames={1} fps={30} width={W} height={H} defaultProps={{i: 0}} />;
registerRoot(Root);
