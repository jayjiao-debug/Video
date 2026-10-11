import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {demoAt, camDir, add, sub, mul, norm, cross, len, lerp3, HEAD_R, type V3, type J} from './rig3';
import {camAt} from './Flat35';

/* B · cel-shaded 3D (the Guilty Gear Xrd approach): the same mocap skeleton dresses a model built
   from simple shapes; two-tone toon shading, inverted-hull outlines, one warm key light (the lantern),
   a cool fill from the window. Same camera as A. */

const OUT = '#141218';
const COL = {skin: '#eac6a4', suit: '#30333d', shoe: '#18171c', hair: '#2a201b', shirt: '#ece8de', tie: '#8e2e2e', ink: '#141218'};

const useGradient = () =>
	useMemo(() => {
		const t = new THREE.DataTexture(new Uint8Array([120, 120, 120, 255, 255, 255, 255, 255]), 2, 1, THREE.RGBAFormat);
		t.minFilter = THREE.NearestFilter;
		t.magFilter = THREE.NearestFilter;
		t.needsUpdate = true;
		return t;
	}, []);

const v = (a: V3) => new THREE.Vector3(a[0], a[1], a[2]);
const quatFromTo = (dir: V3) => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), v(norm(dir)));
const quatBasis = (x: V3, y: V3, z: V3) => new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(v(x), v(y), v(z)));

const Toon: React.FC<{color: string; g: THREE.Texture}> = ({color, g}) => <meshToonMaterial color={color} gradientMap={g} />;
const Hull: React.FC = () => <meshBasicMaterial color={OUT} side={THREE.BackSide} />;
const LW = 0.0065;

/** a tapered limb segment with rounded ends, plus its outline hull */
const Bone: React.FC<{a: V3; b: V3; ra: number; rb: number; color: string; g: THREE.Texture}> = ({a, b, ra, rb, color, g}) => {
	const L = len(sub(b, a));
	const q = quatFromTo(sub(b, a));
	const mid = lerp3(a, b, 0.5);
	return (
		<group>
			<mesh position={v(mid)} quaternion={q}>
				<cylinderGeometry args={[rb, ra, L, 18]} />
				<Toon color={color} g={g} />
			</mesh>
			<mesh position={v(mid)} quaternion={q}>
				<cylinderGeometry args={[rb + LW, ra + LW, L, 18]} />
				<Hull />
			</mesh>
			{[[a, ra], [b, rb]].map(([p, r], i) => (
				<group key={i}>
					<mesh position={v(p as V3)}>
						<sphereGeometry args={[r as number, 18, 12]} />
						<Toon color={color} g={g} />
					</mesh>
					<mesh position={v(p as V3)}>
						<sphereGeometry args={[(r as number) + LW, 18, 12]} />
						<Hull />
					</mesh>
				</group>
			))}
		</group>
	);
};

/** an ellipsoid oriented by a basis, plus outline */
const Blob: React.FC<{p: V3; q: THREE.Quaternion; s: V3; color: string; g: THREE.Texture; outline?: boolean}> = ({p, q, s, color, g, outline = true}) => (
	<group position={v(p)} quaternion={q}>
		<mesh scale={s}>
			<sphereGeometry args={[1, 24, 16]} />
			<Toon color={color} g={g} />
		</mesh>
		{outline ? (
			<mesh scale={[s[0] + LW, s[1] + LW, s[2] + LW]}>
				<sphereGeometry args={[1, 24, 16]} />
				<Hull />
			</mesh>
		) : null}
	</group>
);

const Coat: React.FC<{j: J; g: THREE.Texture}> = ({j, g}) => {
	const up = norm(sub(j.Neck, j.Hips));
	const left = norm(sub(j.LeftArm, j.RightArm));
	const fwd = norm(cross(up, left));
	const hip = lerp3(j.LeftUpLeg, j.RightUpLeg, 0.5);
	const hem = add(hip, mul(up, -0.075));
	const top = add(j.Neck, mul(up, 0.01));
	const H = len(sub(top, hem));
	const geo = useMemo(() => {
		const prof = [[0.0, 0], [0.97, 0], [0.95, 0.15], [0.9, 0.42], [1.04, 0.72], [1.06, 0.84], [0.8, 0.94], [0.42, 0.99], [0.36, 1.12], [0.0, 1.12]].map(([r, y]) => new THREE.Vector2(r, y));
		return new THREE.LatheGeometry(prof, 28);
	}, []);
	const q = quatBasis(mul(left, -1), up, fwd);
	return (
		<group position={v(hem)} quaternion={q}>
			<mesh geometry={geo} scale={[0.15, H, 0.085]}>
				<Toon color={COL.suit} g={g} />
			</mesh>
			<mesh geometry={geo} scale={[0.15 + LW, H + LW, 0.085 + LW]} position={[0, -LW / 2, 0]}>
				<Hull />
			</mesh>
			{/* shirt and tie on the chest */}
			<mesh position={[0, H * 0.86, 0.066]} rotation={[0.25, 0, Math.PI / 4]}>
				<boxGeometry args={[0.05, 0.05, 0.01]} />
				<meshBasicMaterial color={COL.shirt} />
			</mesh>
			<mesh position={[0, H * 0.7, 0.08]} rotation={[0.1, 0, 0]}>
				<boxGeometry args={[0.02, H * 0.3, 0.008]} />
				<Toon color={COL.tie} g={g} />
			</mesh>
			{[0.48, 0.36].map((k) => (
				<mesh key={k} position={[0.012, H * k, 0.079]}>
					<sphereGeometry args={[0.0055, 8, 6]} />
					<meshBasicMaterial color={COL.ink} />
				</mesh>
			))}
		</group>
	);
};

const Head: React.FC<{hd: ReturnType<typeof demoAt>['head']; g: THREE.Texture; talk: boolean; expr: string; f: number}> = ({hd, g, talk, expr, f}) => {
	const R = HEAD_R;
	const right = mul(hd.left, -1);
	const q = quatBasis(right, hd.up, hd.fwd);
	const blink = f % 117 < 3 ? 0.15 : 1;
	return (
		<group position={v(hd.c)} quaternion={q}>
			<mesh>
				<sphereGeometry args={[R, 32, 24]} />
				<Toon color={COL.skin} g={g} />
			</mesh>
			<mesh>
				<sphereGeometry args={[R + LW, 32, 24]} />
				<Hull />
			</mesh>
			{/* hair: a cap over the top and back */}
			<group rotation={[-0.55, 0, 0]}>
				<mesh>
					<sphereGeometry args={[R * 1.05, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
					<Toon color={COL.hair} g={g} />
				</mesh>
			</group>
			{[-1, 1].map((s) => (
				<group key={s}>
					<mesh position={[s * 1.0 * R, -0.05 * R, -0.08 * R]} scale={[0.1 * R, 0.2 * R, 0.14 * R]}>
						<sphereGeometry args={[1, 12, 8]} />
						<Toon color={COL.skin} g={g} />
					</mesh>
					<mesh position={[s * 0.36 * R, 0.06 * R, 0.93 * R]} scale={[0.07 * R, 0.11 * R * blink, 0.03 * R]}>
						<sphereGeometry args={[1, 12, 8]} />
						<meshBasicMaterial color={COL.ink} />
					</mesh>
					<mesh position={[s * 0.36 * R, 0.06 * R, 1.0 * R]}>
						<torusGeometry args={[0.2 * R, 0.014 * R, 8, 24]} />
						<meshBasicMaterial color="#2a2522" />
					</mesh>
					<mesh position={[s * 0.36 * R, (expr === 'thinking' ? 0.34 : 0.3) * R, 0.92 * R]} rotation={[0, 0, s * 0.1]}>
						<boxGeometry args={[0.22 * R, 0.04 * R, 0.02 * R]} />
						<meshBasicMaterial color={COL.hair} />
					</mesh>
				</group>
			))}
			<mesh position={[0, 0.06 * R, 1.02 * R]} rotation={[0, 0, Math.PI / 2]}>
				<cylinderGeometry args={[0.018 * R, 0.018 * R, 0.32 * R, 6]} />
				<meshBasicMaterial color="#2a2522" />
			</mesh>
			<mesh position={[0, -0.14 * R, 1.0 * R]}>
				<sphereGeometry args={[0.12 * R, 12, 8]} />
				<Toon color={COL.skin} g={g} />
			</mesh>
			<mesh position={[0, -0.46 * R, 0.9 * R]} scale={talk ? [0.09 * R, 0.07 * R, 0.03 * R] : [0.14 * R, 0.025 * R, 0.03 * R]}>
				<sphereGeometry args={[1, 12, 8]} />
				<meshBasicMaterial color={talk ? '#3a1f1a' : COL.ink} />
			</mesh>
		</group>
	);
};

const Lantern3D: React.FC<{p: V3; g: THREE.Texture; on: number}> = ({p, g, on}) => (
	<group position={v(p)}>
		<mesh position={[0, -0.03, 0]}>
			<torusGeometry args={[0.035, 0.004, 6, 20, Math.PI]} />
			<meshBasicMaterial color="#2a2420" />
		</mesh>
		<mesh position={[0, -0.05, 0]}>
			<cylinderGeometry args={[0.04, 0.045, 0.02, 16]} />
			<Toon color="#3a2e24" g={g} />
		</mesh>
		<mesh position={[0, -0.12, 0]}>
			<cylinderGeometry args={[0.042, 0.042, 0.12, 16]} />
			<meshBasicMaterial color="#ffd37a" transparent opacity={0.55 + 0.4 * on} />
		</mesh>
		<mesh position={[0, -0.12, 0]}>
			<sphereGeometry args={[0.018, 10, 8]} />
			<meshBasicMaterial color="#fff6d8" />
		</mesh>
		<mesh position={[0, -0.19, 0]}>
			<cylinderGeometry args={[0.05, 0.05, 0.02, 16]} />
			<Toon color="#3a2e24" g={g} />
		</mesh>
		<pointLight position={[0, -0.12, 0]} color="#ffb45e" intensity={2.6 * on} distance={5} decay={1.4} />
	</group>
);

const Cam: React.FC<{t: number}> = ({t}) => {
	const {camera} = useThree();
	const {target, zoom} = camAt(t);
	const c0 = camDir();
	const c = [c0[0], c0[1], -c0[2]];
	const d = 5.47 / zoom;
	target[2] = -target[2];
	camera.position.set(target[0] + c[0] * d, target[1] + c[1] * d, target[2] + c[2] * d);
	camera.lookAt(target[0], target[1], target[2]);
	camera.updateProjectionMatrix();
	return null;
};

const Scene: React.FC<{f: number}> = ({f}) => {
	const g = useGradient();
	const t = f / 30;
	const D = demoAt(t);
	const j = D.j;
	const flick = 0.92 + 0.08 * Math.sin(t * 17) * Math.sin(t * 5.3);
	const limbs: React.ReactNode[] = [];
	for (const s of ['Left', 'Right']) {
		limbs.push(<Bone key={s + 'th'} a={j[`${s}UpLeg`]} b={j[`${s}Leg`]} ra={0.042} rb={0.034} color={COL.suit} g={g} />);
		limbs.push(<Bone key={s + 'sh'} a={j[`${s}Leg`]} b={j[`${s}Foot`]} ra={0.034} rb={0.027} color={COL.suit} g={g} />);
		limbs.push(<Bone key={s + 'ua'} a={j[`${s}Arm`]} b={j[`${s}ForeArm`]} ra={0.031} rb={0.027} color={COL.suit} g={g} />);
		limbs.push(<Bone key={s + 'fa'} a={j[`${s}ForeArm`]} b={j[`${s}Hand`]} ra={0.027} rb={0.024} color={COL.suit} g={g} />);
		// shoe
		const F = j[`${s}Foot`], T = j[`${s}ToeBase`];
		const fd = norm([T[0] - F[0], 0, T[2] - F[2]]);
		const heel = add(F, mul(fd, -0.03)), toe = add(T, mul(fd, 0.045));
		const mid = lerp3(heel, toe, 0.5);
		const side = norm(cross([0, 1, 0], fd));
		limbs.push(<Blob key={s + 'shoe'} p={[mid[0], Math.max(0.026, mid[1] - 0.01), mid[2]]} q={quatBasis(side, [0, 1, 0], fd)} s={[0.032, 0.026, len(sub(toe, heel)) / 2]} color={COL.shoe} g={g} />);
		// hand: a mitten along hand → index, thumb toward the thumb marker
		const W = j[`${s}Hand`], I = j[`${s}HandIndex1`], Th = j[s === 'Right' ? 'RThumb' : 'LThumb'];
		const hd = norm(sub(I, W));
		let thumb = norm(sub(Th, W));
		thumb = norm(sub(thumb, mul(hd, thumb[0] * hd[0] + thumb[1] * hd[1] + thumb[2] * hd[2])));
		const flat = norm(cross(hd, thumb));
		const grip = s === 'Right' && D.held;
		limbs.push(
			<group key={s + 'hand'}>
				<Blob p={add(W, mul(hd, grip ? 0.03 : 0.045))} q={quatBasis(thumb, hd, flat)} s={grip ? [0.03, 0.032, 0.026] : [0.03, 0.05, 0.018]} color={COL.skin} g={g} />
				<Blob p={add(add(W, mul(hd, 0.03)), mul(thumb, 0.028))} q={quatBasis(thumb, hd, flat)} s={[0.012, 0.022, 0.012]} color={COL.skin} g={g} />
				<mesh position={v(W)} quaternion={quatFromTo(hd)}>
					<cylinderGeometry args={[0.027, 0.027, 0.012, 14]} />
					<meshBasicMaterial color={COL.shirt} />
				</mesh>
			</group>,
		);
	}
	return (
		<group scale={[1, 1, -1]}>
			<Cam t={t} />
			<ambientLight intensity={0.6} color="#9aa6c4" />
			<directionalLight position={[2, 4, 3]} intensity={0.5} color="#9ab4d8" />
			<directionalLight position={[1.5, 2.5, -4]} intensity={0.7} color="#fff0dc" />
			<directionalLight position={[-1, 3, -4]} intensity={0.35} color="#ffd8a8" />
			{/* room */}
			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[2.5, 0, -1]}>
				<planeGeometry args={[16, 8]} />
				<Toon color="#3a2a1e" g={g} />
			</mesh>
			{Array.from({length: 14}, (_, i) => (
				<mesh key={i} position={[2.5, 0.001, 1.1 - i * 0.3]} rotation={[-Math.PI / 2, 0, 0]}>
					<planeGeometry args={[16, 0.008]} />
					<meshBasicMaterial color="#1e140e" />
				</mesh>
			))}
			<mesh position={[2.5, 1.3, 1.1]} rotation={[0, Math.PI, 0]}>
				<planeGeometry args={[16, 2.6]} />
				<Toon color="#25332b" g={g} />
			</mesh>
			<mesh position={[2.5, 0.21, 1.09]} rotation={[0, Math.PI, 0]}>
				<planeGeometry args={[16, 0.42]} />
				<Toon color="#3a281c" g={g} />
			</mesh>
			<mesh position={[3.58, 1.22, 1.085]} rotation={[0, Math.PI, 0]}>
				<planeGeometry args={[0.75, 0.95]} />
				<meshBasicMaterial color="#22304a" />
			</mesh>
			{/* character */}
			<Coat j={j} g={g} />
			<Bone a={j.Neck} b={j.Head} ra={0.03} rb={0.028} color={COL.skin} g={g} />
			<Head hd={D.head} g={g} talk={D.talk} expr={D.expr} f={f} />
			{limbs}
			<Lantern3D p={D.lantern} g={g} on={flick} />
			<mesh position={[j.Hips[0], 0.002, j.Hips[2]]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 0.6, 1]}>
				<circleGeometry args={[0.16, 24]} />
				<meshBasicMaterial color="#000" transparent opacity={0.3} />
			</mesh>
		</group>
	);
};

export const Toon3D: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: '#0b0d10'}}>
			<ThreeCanvas width={1920} height={1080} gl={{antialias: true}} camera={{fov: 20, near: 0.05, far: 60, position: [0, 1, -5]}}>
				<Scene f={f} />
			</ThreeCanvas>
			<div style={{position: 'absolute', left: 60, bottom: 30, fontFamily: 'Noto Sans CJK SC, sans-serif', fontSize: 26, color: '#c9b48a', letterSpacing: '0.06em'}}>B · 三渲二（卡通着色 3D），35° 视角 · 同一套动捕数据</div>
		</AbsoluteFill>
	);
};
export const TOON3D_N = 12 * 30;
