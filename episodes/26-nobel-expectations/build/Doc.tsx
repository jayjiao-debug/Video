import React, {useLayoutEffect, useMemo, useRef} from 'react';
import {AbsoluteFill, Composition, registerRoot} from 'remotion';
import * as THREE from 'three';
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

/** a volumetric beam faked with nested additive cones */
const Beam: React.FC<{top: [number, number, number]; len: number; r0: number; r1: number; color?: string; k?: number}> = ({top, len, r0, r1, color = '#ffd9a0', k = 1}) => (
	<group position={[top[0], top[1] - len / 2, top[2]]}>
		{[1, 0.75, 0.5, 0.3].map((s, i) => (
			<mesh key={i}>
				<cylinderGeometry args={[r0 * s, r1 * s, len, 64, 1, true]} />
				<meshBasicMaterial color={color} transparent opacity={0.035 * k * (1 + i * 0.6)} depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
			</mesh>
		))}
	</group>
);

const Note: React.FC<{tex: THREE.Texture; position: [number, number, number]; rotation: [number, number, number]; s?: number; glow?: number; o?: number}> = ({tex, position, rotation, s = 1, glow = 0.25, o = 1}) => {
	const e = useEnv();
	return (
		<mesh position={position} rotation={rotation} scale={s}>
			<planeGeometry args={[2, 1, 24, 12]} />
			<meshPhysicalMaterial map={tex} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={glow} roughness={0.55} sheen={0.6} side={THREE.DoubleSide} transparent opacity={o} {...envProps(e, 0.4)} />
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
		<instancedMesh ref={ref} args={[undefined, undefined, items.length]}>
			<cylinderGeometry args={[0.16, 0.16, 0.022, 48]} />
			<meshPhysicalMaterial color="#b98a3a" metalness={1} roughness={0.3} bumpMap={bump} bumpScale={0.6} {...envProps(e, 0.35)} />
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
		return Array.from({length: 70}, () => ({p: [(r() - 0.5) * 34, -3 + r() * 9, -16 - r() * 6] as [number, number, number], c: r() > 0.3 ? '#ffb45e' : '#9fc3ff', s: 0.08 + r() * 0.16}));
	}, []);
	return (
		<AbsoluteFill style={{background: '#04050a'}}>
			<Stage3D cam={{pos: [0, -0.4, 6.2], target: [0, 0.3, 0], fov: 38}} bg="#05060b" env={0.9} focus={6.0} aperture={0.004} bloom={0.55} threshold={0.88} vig={0.85} grain={0.04}>
				<pointLight position={[2.5, 4, 3]} color="#ffcf96" intensity={9} decay={2} />
				<pointLight position={[-4, 1, -3]} color="#7fa6ff" intensity={7} decay={2} />
				<ambientLight intensity={0.05} />
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
				<Beam top={[1.2, 7, -1]} len={10} r0={0.3} r1={3.2} k={0.35} />
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
			<Stage3D cam={{pos: [0, 7.4, 11.5], target: [0, -0.8, 0], fov: 34}} bg="#05060a" env={0.9} fog={[12, 30]} focus={11.0} aperture={0.0005} bloom={0.45} threshold={0.93} vig={0.85} grain={0.04}>
				<pointLight position={[0, 9, 1]} color="#ffd9a0" intensity={36} decay={2} />
				<pointLight position={[0, 4.5, 4.5]} color="#fff0d8" intensity={1.2} decay={2} />
				<pointLight position={[-6, 2, -5]} color="#7fa6ff" intensity={18} decay={2} />
				<pointLight position={[6, 1, 4]} color="#ff9a5a" intensity={8} decay={2} />
				<ambientLight intensity={0.04} />
				<Coins items={coins} />
				<Beam top={[0, 12, 2.0]} len={12} r0={0.25} r1={1.8} k={0.4} />
				<Note tex={tex} position={[0, 1.6, 1.2]} rotation={[-0.55, 0.06, -0.03]} s={1.7} glow={0.03} />
				<Dust n={400} box={[9, 7, 7]} center={[0, 0.5, 0]} size={0.015} />
			</Stage3D>
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
				<Sub t="钱还没出，先给一个[承诺]" />
			</svg>
		</AbsoluteFill>
	);
};

const FR: React.FC[] = [DocHook, DocKey];
const DocFrame: React.FC<{i: number}> = ({i}) => {
	const C = FR[i];
	return <C />;
};
const Root: React.FC = () => <Composition id="DOC26" component={DocFrame} durationInFrames={1} fps={30} width={W} height={H} defaultProps={{i: 0}} />;
registerRoot(Root);
