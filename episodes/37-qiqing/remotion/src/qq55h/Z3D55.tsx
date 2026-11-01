import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {Zun3D, Env, CamRig, Studio, surfP, sTh, INSCR_AZ} from './zun3d55h';
import {Look, FLOOR_Z, INSCR} from './tex55h';
import {Overlay} from './kf55h';
/* ep55 · 何尊 3D entry (three.js through @remotion/three; render with GL=swangle).
   Z3D-TT: the model turntable, frame i = view i (front on a flange · 45° on a face · side · top-down into the mouth · close-up)
   Z3D-LOOKS: frame i = look i (clean · dirty · molten · reveal), front 45°
   Z3D-KF3: KF3, 1975, looking down into the mouth as the inscription is cleaned; 中 / 或 glow
   GLTEST: a lit sphere (proves WebGL works in the headless renderer) */
const W = 1920, H = 1080;
const BG = 'radial-gradient(ellipse at 50% 45%, #3A3936 0%, #1B1A19 70%, #121212 100%)';
const LBL: React.CSSProperties = {position: 'absolute', left: 40, top: 30, color: '#E8E2D6', fontFamily: "'Noto Sans CJK SC',sans-serif", fontSize: 40, fontWeight: 700};

type View = {name: string; az: number; el: number; D: number; target: [number, number, number]; fov: number};
const closeT = surfP(sTh(8.0), 17.6);
export const TT3: View[] = [
	{name: '正面 · 对扉棱 (front, on a flange)', az: 0, el: 16, D: 150, target: [0, 19.4, 0], fov: 20},
	{name: '45° · 对器面 (a flat face)', az: 45, el: 9, D: 150, target: [0, 19.4, 0], fov: 20},
	{name: '侧面 · 对侧扉棱 (side flange)', az: 90, el: 7, D: 150, target: [0, 19.4, 0], fov: 20},
	{name: '俯视 · 口内 (top-down into the mouth)', az: 45, el: 74, D: 125, target: [0, 24, 0], fov: 20},
	{name: '特写 · 饕餮与卷角 (the face and a horn, 45°)', az: 40, el: 10, D: 62, target: [closeT.x * 0.85, 17.2, closeT.z * 0.85], fov: 20},
];
const Scene: React.FC<{v: View; look: Look; glow?: number; reveal?: number}> = ({v, look, glow, reveal}) => <>
	<CamRig az={v.az} el={v.el} D={v.D} target={v.target} fov={v.fov} />
	<Env intensity={look === 'molten' ? 0.35 : 0.9} rotY={v.az * Math.PI / 180} />
	<Studio az={v.az} />
	<Zun3D look={look} glow={glow} reveal={reveal} />
</>;
const Canvas3: React.FC<{children: React.ReactNode; exposure?: number}> = ({children, exposure = 1}) =>
	<ThreeCanvas width={W} height={H} shadows gl={{antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: exposure, preserveDrawingBuffer: true}} camera={{fov: 20, near: 1, far: 2000, position: [0, 20, 150]}}>
		{children}
	</ThreeCanvas>;

const TT: React.FC = () => { const f = useCurrentFrame(), v = TT3[Math.min(TT3.length - 1, f)];
	return <AbsoluteFill style={{background: BG}}>
		<Canvas3><Scene v={v} look="clean" /></Canvas3>
		<div style={LBL}>{v.name}</div>
	</AbsoluteFill>; };

const LOOKS: {look: Look; name: string; glow?: number; reveal?: number}[] = [
	{look: 'clean', name: 'clean · 博物院'}, {look: 'dirty', name: 'dirty · 1963–65'}, {look: 'molten', name: 'molten · 铸造'}, {look: 'reveal', name: 'reveal · 1975', glow: 1, reveal: 0.6}];
const Looks: React.FC = () => { const f = useCurrentFrame(), L = LOOKS[Math.min(LOOKS.length - 1, f)], v = TT3[1];
	return <AbsoluteFill style={{background: L.look === 'molten' ? '#120a06' : BG}}>
		<Canvas3><Scene v={v} look={L.look} glow={L.glow} reveal={L.reveal} /></Canvas3>
		<div style={LBL}>{L.name}</div>
	</AbsoluteFill>; };

/* ============================== KF3 · 1975 · inside the mouth, the inscription appears (3D) ============================== */
const rnd = (i: number, s = 0) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
/** the camera looks down into the mouth from 77 cm above the floor, offset 7 cm toward az 45° (a flat face) so the text reads upright;
    the lamp comes from screen top-right, high, so the lip throws a shadow across one side of the floor */
const KF3_SHIFT: [number, number] = [110, 120];
const KF3Scene: React.FC = () => { const a = INSCR_AZ, off = 7, up = 76.8;
	const Rt = [Math.cos(a), 0, -Math.sin(a)], U = [-Math.sin(a), 0, -Math.cos(a)];
	const L = [0.55 * Rt[0] + 0.32 * U[0], 0.78, 0.55 * Rt[2] + 0.32 * U[2]], D = 120;
	return <>
		<CamRig az={45} el={Math.atan2(up, off) * 180 / Math.PI} D={Math.hypot(up, off)} target={[0, FLOOR_Z, 0]} fov={2 * Math.atan(540 / 3900) * 180 / Math.PI} shift={KF3_SHIFT} />
		<Env intensity={0.22} rotY={a} />
		<directionalLight position={[L[0] * D, FLOOR_Z + L[1] * D, L[2] * D]} intensity={4.2} color="#FFD49A" castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0008} shadow-normalBias={0.1}
			shadow-camera-left={-24} shadow-camera-right={24} shadow-camera-top={24} shadow-camera-bottom={-24} shadow-camera-near={40} shadow-camera-far={240} />
		<directionalLight position={[-L[0] * D, FLOOR_Z + 90, -L[2] * D]} intensity={0.35} color="#7F98AA" />
		<Zun3D look="reveal" reveal={0.62} glow={1} />
	</>; };
/** screen position of an inscription glyph (for the CSS glow over 中 / 或) */
const kf3Screen = (key: string) => { const g = INSCR.find((q) => q.key === key)!, a = INSCR_AZ, off = 7, up = 76.8, el = Math.atan2(up, off), D = Math.hypot(up, off);
	const P = new THREE.Vector3(g.u * Math.cos(a) + g.v * Math.sin(a), FLOOR_Z, -g.u * Math.sin(a) + g.v * Math.cos(a));
	const cam = new THREE.PerspectiveCamera(2 * Math.atan(540 / 3900) * 180 / Math.PI, W / H, 1, 2000);
	cam.position.set(D * Math.sin(a) * Math.cos(el), FLOOR_Z + D * Math.sin(el), D * Math.cos(a) * Math.cos(el)); cam.lookAt(0, FLOOR_Z, 0); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
	const q = P.project(cam); return [(q.x + 1) / 2 * W + KF3_SHIFT[0], (1 - q.y) / 2 * H + KF3_SHIFT[1]]; };
const KF3: React.FC = () => { const gl = ['zhong', 'huo'].map(kf3Screen);
	return <AbsoluteFill style={{background: 'linear-gradient(135deg, #2A1C14 0%, #120C09 100%)'}}>
	<Canvas3 exposure={1.05}><KF3Scene /></Canvas3>
	{gl.map(([x, y], i) => <div key={i} style={{position: 'absolute', left: x - 90, top: y - 90, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,196,96,0.42) 0%, rgba(255,170,60,0.16) 40%, rgba(255,160,60,0) 70%)', mixBlendMode: 'screen'}} />)}
	<svg width={W} height={H} style={{position: 'absolute'}}>
		<defs><linearGradient id="k3beam" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFE2B0" stopOpacity={0.2} /><stop offset="1" stopColor="#FFE2B0" stopOpacity={0} /></linearGradient>
			<radialGradient id="k3v" cx="50%" cy="52%" r="75%"><stop offset="0.5" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.62} /></radialGradient></defs>
		<path d="M1920,-40 L1380,-40 L860,760 L1260,820 Z" fill="url(#k3beam)" />
		{Array.from({length: 40}, (_, i) => { const u = rnd(i, 21), v = rnd(i, 22); return <circle key={i} cx={1000 + u * 640 - v * 260} cy={60 + v * 700} r={1 + rnd(i, 23) * 2.2} fill="#FFE8C0" opacity={0.25 + 0.4 * rnd(i, 24)} />; })}
		<path d="M1700,980 L1240,700" stroke="#1A120C" strokeWidth={16} strokeLinecap="round" />
		<path d="M1700,980 L1240,700" stroke="#C8925A" strokeWidth={2} strokeOpacity={0.5} transform="translate(0,-7)" />
		<rect width={W} height={H} fill="url(#k3v)" />
	</svg>
	<Overlay i={2} />
</AbsoluteFill>; };

/** a slow turn, for measuring the steady per-frame render time (the page stays open between frames) */
const Spin: React.FC = () => { const f = useCurrentFrame(), v: View = {...TT3[0], az: f * 1.5, el: 10};
	return <AbsoluteFill style={{background: BG}}><Canvas3><Scene v={v} look="clean" /></Canvas3></AbsoluteFill>; };
const GLTest: React.FC = () => <AbsoluteFill style={{background: '#202020'}}>
	<ThreeCanvas width={W} height={H} camera={{fov: 30, position: [0, 0, 8]}} gl={{antialias: true}}>
		<ambientLight intensity={0.3} />
		<directionalLight position={[3, 4, 5]} intensity={2.5} />
		<mesh><sphereGeometry args={[1.5, 64, 32]} /><meshStandardMaterial color="#b08850" metalness={0.6} roughness={0.35} /></mesh>
	</ThreeCanvas>
	<div style={{position: 'absolute', left: 30, top: 20, color: '#fff', fontSize: 40}}>three r{THREE.REVISION}</div>
</AbsoluteFill>;

const Root: React.FC = () => <>
	<Composition id="GLTEST" component={GLTest} width={W} height={H} fps={1} durationInFrames={1} />
	<Composition id="Z3D-TT" component={TT} width={W} height={H} fps={30} durationInFrames={TT3.length} />
	<Composition id="Z3D-LOOKS" component={Looks} width={W} height={H} fps={30} durationInFrames={LOOKS.length} />
 	<Composition id="Z3D-SPIN" component={Spin} width={W} height={H} fps={30} durationInFrames={240} />
	<Composition id="Z3D-KF3" component={KF3} width={W} height={H} fps={30} durationInFrames={1} />
</>;
registerRoot(Root);
