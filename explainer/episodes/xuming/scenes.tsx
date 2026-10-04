import React from 'react';
import {AbsoluteFill, Sequence, interpolate, random, useCurrentFrame} from 'remotion';
import {noise2D} from '@remotion/noise';
import {GlowDefs} from '../../src/art/glow/kit';
import {ease, mix, prog, useAbsoluteFrame, useCue, useScene} from '../../src/lib/context';
import {font} from '../../src/lib/theme';
import type {SceneMap, SceneProps} from '../../src/lib/types';
import {Clock, Defs3, Num, Thin} from './kit3';
import {Tag} from './look3';
import {BRAND, EPISODE, Rolling, XTitle, landed, pqrst, scenesV3, useEvents} from './scenes_v3';
import {EndCard} from '../../src/brand/Brand';
import {ADENOSINE, Bean, CAFFEINE, Cherry, Cup, DNA, Flower, Globe, Leaf, Molecule, Saucer, Steam, Table, leafPoint, ll} from './three/props3d';
import {Lights, Stage3D, type Cam, type StageFx} from './three/stage3d';
import {BeanSwarm, Bee3D, CacaoPod, Drum, RoomWindow, Caterpillar, Chromosome, Membrane, Rays3D, Receptor3D, Sea, Ship, Shrubs, Soft, TeaLeaf, Terrain, Tower, TreeCard, brainPoints, dust, terrainH, type Particle} from './three/kit4';
import * as THREE from 'three';

/**
 * 《续命》 v4: the same script and music, re-shot in real 3D (three.js) after the approved
 * motion test: rack focus, crane moves, a dive through the crema, molecules in depth of
 * field, whip pans. 2D only for type (subtitles, numbers, the Juno cards).
 */

export {EPISODE};

const W = 1920;
const H = 1080;
type V3 = [number, number, number];
/** 0..1 as x goes from a to b (prog() is for frames: it clamps durations to >= 1) */
const ramp = (x: number, a: number, b: number) => Math.min(1, Math.max(0, (x - a) / (b - a)));
const lerp3 = (a: V3, b: V3, t: number) => a.map((v, i) => mix(v, b[i], t)) as V3;

/** the frame: a 3D canvas under, an SVG layer for type and the subtitle scrim, overlays on top */
const Stage4: React.FC<{three: React.ReactNode; children?: React.ReactNode; over?: React.ReactNode; scrim?: number}> = ({three, children, over, scrim = 0.55}) => (
	<AbsoluteFill style={{background: '#05060b'}}>
		{three}
		<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
			<GlowDefs />
			<Defs3 />
			<defs>
				<linearGradient id="sub-band" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#000" stopOpacity="0" />
					<stop offset="1" stopColor="#000" stopOpacity="0.9" />
				</linearGradient>
				<radialGradient id="brand-glow">
					<stop offset="0" stopColor="#ffe7b0" stopOpacity="0.9" />
					<stop offset="0.35" stopColor="#f1c56d" stopOpacity="0.35" />
					<stop offset="1" stopColor="#f1c56d" stopOpacity="0" />
				</radialGradient>
				<filter id="mblur" x="-10%" y="-40%" width="120%" height="180%">
					<feGaussianBlur stdDeviation="0 6" />
				</filter>
			</defs>
			{children}
			<rect x={0} y={840} width={W} height={240} fill="url(#sub-band)" opacity={scrim} />
		</svg>
		{over}
	</AbsoluteFill>
);

/** one 3D shot: camera + post + the house lights */
const Shot: React.FC<{cam: Cam; fx?: StageFx; bg?: string; fog?: [number, number]; env?: number; children: React.ReactNode}> = ({cam, fx = {}, bg, fog, env, children}) => (
	<Stage3D cam={cam} bg={bg} fog={fog} env={env} {...fx}>
		{children}
	</Stage3D>
);

// cup geometry: saucer lift 0.05, cup floor 0.08, level 0.86 of 0.9
const LEVEL_Y = 0.05 + 0.08 + 0.86 * 0.9;

// ---------------------------------------------------------------- 1. hook: crema macro, two billion, a heartbeat, the cup

const Hook: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const af = useAbsoluteFrame();
	const cue0 = useCue();
	const cue = (i: number, o = 0) => cue0(i + 1, o); // line 0 is the opening pause
	const scene = useScene();
	const events = useEvents();
	const end = scene.duration;
	const t = af / 30 + 4;
	// two billion lands on an accent
	const landC = events(cue(0) + 50, cue(1) - 24, 1)[0];
	const cO = landed(f, cue(0) + 2, cue(1) - 12);
	// the line goes flat; a drop of coffee falls into the cup; it beats back to life
	const dropAt = events(cue(1) + 6, cue(1) + 40, 1)[0];
	const beats: {at: number; a: number}[] = [{at: dropAt, a: 1.5}];
	// the heart keeps its own clock (72 bpm = 25 frames), not the music's: slow at first, then steady
	for (let b = dropAt + 34, k = 0; b < cue(2) + 40; k++, b += 25 + 9 * 0.6 ** k + Math.round((random(`bj${k}`) - 0.5) * 3)) beats.push({at: b, a: 0.95 + 0.1 * random(`bt${k}`)});
	const lineO = prog(f, cue(1) - 16, 14) * (1 - prog(f, cue(2) + 34, 16));
	const impact = f >= dropAt ? Math.exp(-(f - dropAt) / 7) : 0;
	const head = 1480;
	let ecg = '';
	for (let x = 100; x <= head; x += 3) {
		const tx = f - (head - x) / 11;
		let v = 0.006 * noise2D('flat', x / 30, f / 8);
		for (const b of beats) v += b.a * pqrst(tx - b.at);
		ecg += `${ecg ? 'L' : 'M'}${x},${540 - v * 250} `;
	}
	const headV = beats.reduce((s, b) => s + b.a * pqrst(f - b.at), 0);
	const bpm = Math.round(interpolate(f, [dropAt, dropAt + 15, dropAt + 40], [0, 44, 72], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
	// camera: macro drift -> crane back to reveal the cup -> rise to top-down for the title
	const backStart = cue(2) + 40;
	const reveal = prog(f, backStart, 80, ease.inOut);
	const rise = prog(f, backStart + 70, end - backStart - 70, ease.inOut);
	const drift = af / 260;
	const macro: V3 = [0.16 * Math.sin(drift), LEVEL_Y + 0.17 + 0.02 * Math.sin(drift * 1.3), 0.3 + 0.04 * Math.cos(drift)];
	const orbit = -0.55 + 0.25 * reveal;
	const wide: V3 = [Math.sin(orbit) * 3.0, 1.45, Math.cos(orbit) * 3.0];
	const top: V3 = [0.0, 3.4, 0.02];
	let pos = lerp3(macro, wide, reveal);
	pos = lerp3(pos, top, rise);
	const target = lerp3([0, LEVEL_Y, -0.04], [0, mix(0.5, LEVEL_Y, rise), 0], reveal);
	const focus = Math.hypot(pos[0] - target[0], pos[1] - target[1], pos[2] - target[2]);
	const swirl = 0.6 + 4.3 * prog(f, backStart + 60, end - backStart - 60, ease.in);
	// the drop: falls through the macro frame into the centre of the cup
	const fall = prog(f, dropAt - 16, 16, ease.in);
	const ripple = f >= dropAt ? Math.min(1, (f - dropAt) / 40) : 0;
	const splash: Particle[] =
		f >= dropAt && f < dropAt + 24
			? Array.from({length: 18}, (_, i) => {
					const u = (f - dropAt) / 24;
					const a = (i / 18) * Math.PI * 2;
					const sp = 0.05 + 0.03 * random(`sp${i}`);
					return {p: [Math.cos(a) * sp * u * 2, LEVEL_Y + 0.12 * u - 0.22 * u * u, Math.sin(a) * sp * u * 2] as V3, s: 0.012, c: '#ffd8a0', a: 1 - u};
				})
			: [];
	const dim = 1 - 0.45 * Math.max(cO, lineO);
	return (
		<Stage4
			three={
				<Shot cam={{pos, target, fov: mix(34, 30, reveal)}} fx={{focus, aperture: mix(0.006, 0.0015, reveal), bloom: 0.6, threshold: 0.75, fade: 1 - dim}} fog={[8, 30]}>
					<Lights rim={[-2.5, 3.5, -4]} rimI={22} keyI={55} />
					<Table color="#0d0907" />
					<Saucer />
					<Cup position={[0, 0.05, 0]} t={t} swirl={swirl} ripple={ripple} glow={0.25 * impact} />
					<Steam t={t} position={[0, 1.05, 0]} o={0.22 * reveal * (1 - rise)} />
					{f >= dropAt - 16 && f < dropAt ? (
						<mesh position={[0, mix(LEVEL_Y + 0.5, LEVEL_Y, fall), -0.02]} scale={[1, 1.5, 1]}>
							<sphereGeometry args={[0.012, 16, 12]} />
							<meshPhysicalMaterial color="#3a1a08" roughness={0.05} clearcoat={1} emissive="#ff9a30" emissiveIntensity={0.6} />
						</mesh>
					) : null}
					<Soft items={splash} />
				</Shot>
			}
		>
			{/* two billion */}
			{cO > 0 ? (
				<g opacity={cO}>
					<Rolling value="2,000,000,000" f={f} start={cue(0) + 4} land={landC} y={570} size={150} id="hk" />
					<text x={960} y={640} textAnchor="middle" opacity={prog(f, landC - 4, 14)} style={{fontFamily: font.sans, fontSize: 22, letterSpacing: '0.6em', fill: '#efe4d0'}}>
						杯 · 每一天 · 全世界
					</text>
					{f >= landC ? <circle cx={960} cy={520} r={100 + 900 * prog(f, landC, 30, ease.out)} fill="none" stroke="#f1c56d" strokeWidth={1.4} opacity={0.5 * (1 - prog(f, landC, 30))} /> : null}
				</g>
			) : null}
			{/* the heartbeat */}
			{lineO > 0 ? (
				<g opacity={lineO}>
					<g opacity={0.07} stroke="#ffe0b0" strokeWidth={1}>
						{Array.from({length: 40}, (_, i) => <line key={`v${i}`} x1={i * 48} y1={330} x2={i * 48} y2={750} />)}
						{Array.from({length: 9}, (_, i) => <line key={`h${i}`} x1={0} y1={348 + i * 48} x2={W} y2={348 + i * 48} />)}
					</g>
					<defs>
						<linearGradient id="trail" x1="100" y1="0" x2={head} y2="0" gradientUnits="userSpaceOnUse">
							<stop offset="0" stopColor="#ffe7b8" stopOpacity="0" />
							<stop offset="0.6" stopColor="#ffe7b8" stopOpacity="0.5" />
							<stop offset="1" stopColor="#fff6e0" stopOpacity="1" />
						</linearGradient>
					</defs>
					<path d={ecg} fill="none" stroke="url(#trail)" strokeWidth={10} opacity={0.45} filter="url(#b8)" />
					<path d={ecg} fill="none" stroke="url(#trail)" strokeWidth={2.6} strokeLinejoin="round" />
					<circle cx={head} cy={540 - 250 * headV} r={46 + 60 * impact} fill="url(#ember)" />
					<text x={1770} y={150} textAnchor="end" style={{fontFamily: font.latin, fontWeight: 500, fontSize: 70, fill: '#ffe7b8'}}>
						{bpm}
					</text>
					<text x={1770} y={182} textAnchor="end" style={{fontFamily: font.sans, fontSize: 15, letterSpacing: '0.4em', fill: '#c99a5a'}}>
						BPM
					</text>
				</g>
			) : null}
		</Stage4>
	);
};

// ---------------------------------------------------------------- 2. sleep: the title in the cup, the dive, the synapse, the brain

const RX = [-3, 0, 3];
const POCKET = 0.72; // receptor pocket height above the membrane

/** adenosine drifting down toward the receptors; deterministic per index */
const drifter = (i: number, f: number, start: number): V3 => {
	const u = Math.max(0, f - start - i * 9) / 240;
	return [(random(`dx${i}`) - 0.5) * 14 + 0.6 * Math.sin(u * 5 + i), 6.2 - 4.4 * Math.min(1, u) + 0.3 * Math.sin(f / 30 + i), -1.5 - random(`dz${i}`) * 5];
};

const Sleep: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const af = useAbsoluteFrame();
	const cue = useCue();
	const scene = useScene();
	const events = useEvents();
	const end = scene.duration;
	const t = af / 30 + 4;
	// A: title over the cup, top-down; then the dive
	const settle = prog(f, 0, 60, ease.out);
	const dive = prog(f, 138, 30, ease.in);
	// B: the synapse fills with adenosine; three dock on events; the light goes down
	const dots = prog(f, cue(0) + 20, cue(1) - cue(0) + 30, (x) => x);
	const dock = events(cue(1) + 6, cue(2) - 20, 3, 18);
	const docked = dock.map((d) => (f >= d ? Math.min(1, (f - d) / 14) : 0));
	const tired = docked.reduce((s, d) => s + d, 0) / 3;
	const lids = prog(f, cue(1) + 10, cue(2) - cue(1) - 20, ease.inOut) * (1 - prog(f, cue(2) - 14, 10));
	// C/D: push into the middle pocket -> the two molecules, the shared skeleton in gold
	const zin = prog(f, cue(2) - 18, 18, ease.in);
	const molShot = f >= cue(2) && f < cue(3) - 2;
	const cafIn = prog(f, cue(2) + 30, 40, ease.inOut);
	const coreHits = events(cue(2) + 70, cue(3) - 16, 3, 10);
	const core = coreHits.reduce((s, h) => s + prog(f, h, 10) / 3, 0);
	// E: back out; caffeine takes the pockets on the beats; adenosine bounces off; light returns
	const back = prog(f, cue(3) - 2, 26, ease.out);
	const cafAt = events(cue(3) + 8, cue(4) - 10, 3, 16);
	const cafDocked = cafAt.map((a) => (f >= a ? 1 : 0));
	const relief = prog(f, cue(4), 50, ease.inOut);
	const truck = prog(f, cue(4) - 10, cue(5) - cue(4) + 10, ease.inOut);
	// F: pull back to the whole brain; the fog of tiredness held at its edge
	const brain = prog(f, cue(5) - 6, 40, ease.inOut);
	const fogR = prog(f, cue(5) + 30, 70, ease.out);
	const flare = prog(f, end - 16, 16, ease.in);

	let three: React.ReactNode;
	if (f < 170) {
		const pos: V3 = lerp3([0, mix(3.6, 3.25, settle), 0.02], [0.01, LEVEL_Y + 0.02, 0.012], dive);
		three = (
			<Shot cam={{pos, target: [0, LEVEL_Y, 0], fov: 35, roll: f / 300}} fx={{bloom: 0.6, threshold: 0.75, fade: prog(f, 158, 12, ease.in)}} fog={[8, 30]}>
				<Lights rim={[-2.5, 3.5, -4]} rimI={22} keyI={55} />
				<Table color="#0d0907" />
				<Saucer />
				<Cup position={[0, 0.05, 0]} t={t} swirl={mix(4.9, 1.4, settle) + 4 * dive} />
			</Shot>
		);
	} else if (molShot) {
		// D: the key and the lock, close
		const k = f - cue(2);
		three = (
			<Shot cam={{pos: [0.3 * Math.sin(k / 50), 0.1, mix(13, 11.5, prog(f, cue(2), cue(3) - cue(2)))], target: [0, 0, 0], fov: 38}} fx={{bloom: 0.7, threshold: 0.7, focus: 12, aperture: 0.003}} bg="#06050c">
				<Lights rim={[-6, 4, -6]} rimI={60} keyI={90} rimColor="#7fa6ff" />
				<Molecule mol={ADENOSINE} core={core} position={[mix(0, -3.6, cafIn), 0.6, 0]} rotation={[0.15, -0.4 + k / 160, 0.05]} scale={0.95} />
				<Molecule mol={CAFFEINE} core={core} position={[mix(14, 3.8, cafIn), 0, 0]} rotation={[0.15, 0.3 - k / 170, 0]} scale={0.95} />
				<Soft items={dust('md', 60, [26, 14, 10], t, '#9fc8ff', 0.05, 0.5)} />
			</Shot>
		);
	} else if (brain < 1) {
		// B / E: the synapse
		const camZ = mix(8.5, 7.2, prog(f, 170, cue(2) - 170));
		let pos: V3 = [mix(0, 3.5, truck), mix(2.6, 2.2, prog(f, 170, 200)), camZ];
		let target: V3 = [mix(0, 3.5, truck), 0.9, 0];
		pos = lerp3(pos, [0, POCKET + 0.5, 1.2], zin * (1 - back));
		target = lerp3(target, [0, POCKET, 0], zin * (1 - back));
		pos = lerp3(pos, [truck * 3.5, 9, 18], brain);
		const focus = Math.hypot(pos[0] - target[0], pos[1] - target[1], pos[2] - target[2]);
		const keyI = 80 * (1 - 0.55 * tired * (1 - back)) * (back > 0 ? mix(0.6, 1.15, relief) : 1);
		const nA = Math.round(3 + 7 * dots);
		const rx = [...RX, 6, 9, -6];
		three = (
			<Shot cam={{pos, target, fov: 36}} fx={{focus, aperture: 0.004, bloom: 0.75, threshold: 0.65, fade: Math.max(1 - prog(f, 170, 16), 0.0)}} bg="#05040e" fog={[10, 34]}>
				<Lights keyPos={[2, 5.5, 6]} keyI={keyI} keyColor={back > 0 ? '#ffd8a0' : '#cfe0ff'} rim={[-5, 3, -6]} rimI={50} rimColor="#8a7dff" />
				<Membrane t={t} w={26} d={9} color="#6c8cff" position={[0, -0.05, -1]} />
				{brain === 0 ? <Membrane t={t + 2} w={20} d={6} color="#4a5cb0" position={[0, 7.5, -2]} o={0.35} /> : null}
				{rx.map((x, i) => {
					const a = i < 3 ? (back > 0 ? 0 : docked[i]) : 0;
					const c = i < 3 ? cafDocked[i] : back > 0 ? prog(f, cafAt[2] + 10 + i * 6, 14) : 0;
					return <Receptor3D key={i} position={[x, 0, 0]} scale={0.9} glow={0.22 * a + 0.2 * c} glowColor={c > 0 ? '#ffc070' : '#7ff7ff'} />;
				})}
				{/* adenosine drifting down */}
				{Array.from({length: nA}, (_, i) => {
					const p = drifter(i, f, 170);
					return <Molecule key={i} mol={ADENOSINE} position={p} rotation={[f / 90 + i, f / 70 + i * 2, 0]} scale={0.11} />;
				})}
				{/* adenosine docked (B) */}
				{back === 0
					? RX.map((x, i) =>
							docked[i] > 0 ? <Molecule key={`d${i}`} mol={ADENOSINE} position={[x, mix(POCKET + 1.6, POCKET, docked[i]), 0]} rotation={[0.2, i, 0]} scale={0.18} /> : null,
						)
					: null}
				{/* caffeine falling into the pockets (E); adenosine knocked away */}
				{back > 0
					? rx.map((x, i) => {
							const at = i < 3 ? cafAt[i] : cafAt[2] + 10 + i * 6;
							const u = prog(f, at - 22, 22, ease.in);
							if (u <= 0) return null;
							const kx = f > at ? (f - at) / 30 : 0;
							return (
								<group key={`c${i}`}>
									<Molecule mol={CAFFEINE} core={0.35} position={[x + (1 - u) * (i % 2 ? -1.5 : 1.5), mix(POCKET + 5, POCKET, u), 0]} rotation={[0.2, i * 1.3 + (1 - u) * 3, 0]} scale={0.2} />
									{kx > 0 && kx < 1 ? <Molecule mol={ADENOSINE} position={[x + (i % 2 ? -1 : 1) * 3 * kx, POCKET + 1.2 + 2.5 * Math.sin(kx * Math.PI * 0.6), 0.5]} rotation={[kx * 6, i, 0]} scale={0.16} ghost={1 - kx} /> : null}
								</group>
							);
						})
					: null}
				<Soft items={dust('sy', 120, [30, 9, 12], t, back > 0 ? '#ffe0b0' : '#bcd4ff', 0.04, 0.6).map((p) => ({...p, p: [p.p[0], p.p[1] + 3.5, p.p[2]] as V3}))} />
			</Shot>
		);
	} else {
		// F: the brain as a cloud of light; the fog of tiredness kept at the edge
		const pts = brainPoints(5200);
		const pull = prog(f, cue(5) - 6, end - cue(5), ease.out);
		const items: Particle[] = pts.map((p, i) => {
			const lit = prog(f, cue(5) + 10 + (p[2] + 1) * 30, 24);
			return {p: [p[0] * 3, p[1] * 3, p[2] * 3] as V3, s: 0.03 + 0.03 * p[3], c: lit > 0.5 ? '#ffe2b0' : '#8fe8f0', a: (0.12 + 0.88 * p[3] ** 2) * (0.55 + 0.45 * lit)};
		});
		const fog: Particle[] = Array.from({length: 260}, (_, i) => {
			const a = random(`fa${i}`) * Math.PI * 2 + af / 400;
			const e = (random(`fe${i}`) - 0.5) * Math.PI;
			const rr = mix(3.6, 5.6, fogR) + random(`fr${i}`) * 1.2;
			return {p: [Math.cos(a) * Math.cos(e) * rr, Math.sin(e) * rr * 0.8, Math.sin(a) * Math.cos(e) * rr] as V3, s: 0.5, c: '#3a2a6a', a: 0.35};
		});
		three = (
			<Shot cam={{pos: [mix(4.2, 7.5, pull) * Math.cos(0.9 + af / 300), mix(2.6, 4.2, pull), mix(4.2, 7.5, pull) * Math.sin(0.9 + af / 300)], target: [0, -0.2, 0], fov: 36}} fx={{bloom: 0.9, threshold: 0.5}} bg="#06040c">
				<Soft items={items} />
				<Soft items={fog} additive={false} />
			</Shot>
		);
	}

	return (
		<Stage4
			three={three}
			over={
				<Sequence durationInFrames={160} layout="none">
					<AbsoluteFill>
						<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
							<GlowDefs />
							<defs>
								<radialGradient id="brand-glow">
									<stop offset="0" stopColor="#ffe7b0" stopOpacity="0.9" />
									<stop offset="0.35" stopColor="#f1c56d" stopOpacity="0.35" />
									<stop offset="1" stopColor="#f1c56d" stopOpacity="0" />
								</radialGradient>
								<radialGradient id="cupdark">
									<stop offset="0" stopColor="#05060b" stopOpacity="0.75" />
									<stop offset="0.7" stopColor="#05060b" stopOpacity="0.55" />
									<stop offset="1" stopColor="#05060b" stopOpacity="0" />
								</radialGradient>
							</defs>
							<circle cx={960} cy={540} r={520} fill="url(#cupdark)" opacity={prog(f, 0, 16) * (1 - prog(f, 134, 14))} />
							<XTitle f={f} />
						</svg>
					</AbsoluteFill>
				</Sequence>
			}
		>
			{/* tiredness: the eyelids come down */}
			{lids > 0 ? (
				<g>
					<rect width={W} height={300 * lids + 20} fill="url(#lidT)" />
					<rect y={H - 300 * lids - 20} width={W} height={300 * lids + 20} fill="url(#lidB)" />
				</g>
			) : null}
			<g transform="translate(1690,200)" opacity={landed(f, cue(0) + 20, cue(2) - 20)}>
				<Clock x={0} y={0} r={70} h={8 + 15 * dots} m={(60 * 15 * dots) % 60} c="#cfe8ff" />
				<text y={110} textAnchor="middle" style={{fontFamily: font.latin, fontSize: 22, letterSpacing: '0.2em', fill: '#cfe8ff'}} opacity={0.8}>
					{`${String(Math.floor(8 + 15 * dots)).padStart(2, '0')}:${String(Math.floor((60 * 15 * dots) % 60)).padStart(2, '0')}`}
				</text>
			</g>
			<g opacity={landed(f, cue(0) + 10, cue(2) - 20)}>
				<Tag en="Adenosine" zh="腺苷 · 醒着时一点点积累" />
			</g>
			<g opacity={landed(f, cue(2) + 4, cue(3) - 6)}>
				<Tag en="Adenosine · Caffeine" zh="腺苷与咖啡因 · 共享嘌呤骨架（金色）" />
			</g>
			<g opacity={landed(f, coreHits[2] + 6, cue(3) - 10)}>
				<Thin text="同一个骨架" x={960} y={170} size={64} fill="#ffe2b0" w={700} />
			</g>
			<g opacity={landed(f, cue(3) + 10, cue(5) - 6)}>
				<Tag en="Adenosine receptor" zh="腺苷受体 · 咖啡因占位，却不开锁" />
			</g>
			<g opacity={landed(f, cue(5) + 20, end - 20)}>
				<Tag en="Blocked, not removed" zh="疲惫没有消失 · 只是被挡在外面" />
			</g>
			<rect width={W} height={H} fill="#fff1d0" opacity={flare} />
		</Stage4>
	);
};


// ---------------------------------------------------------------- 3. origin: under the canopy, the forest 600,000 years ago, two wild coffees

/** the forest set: layered tree cards in green fog, a warm sky, god rays, a coffee shrub in front */
const Forest: React.FC<{t: number; f: number; rays?: number; canopy?: number}> = ({t, f, rays = 1, canopy = 1}) => (
	<group>
		<mesh>
			<sphereGeometry args={[60, 32, 16]} />
			<meshBasicMaterial color="#d9b678" side={THREE.BackSide} fog={false} toneMapped={false} />
		</mesh>
		{/* overhead canopy, seen from below at the start */}
		<TreeCard seed="canopy" n={3} color="#050a06" o={canopy} w={90} h={50} position={[0, 12, -2]} rotation={[Math.PI / 2.2, 0, 0]} />
		{[
			[-40, 30, 0.35, '#2a4a2c'],
			[-26, 26, 0.5, '#1d3a22'],
			[-16, 22, 0.75, '#122a18'],
			[-8, 18, 0.9, '#0a1a0e'],
			[-2, 14, 1, '#050c07'],
		].map(([z, w, o, c], i) => (
			<TreeCard key={i} seed={`fr${i}`} n={5 + i} color={c as string} o={o as number} w={w as number} h={(w as number) * 0.5625} position={[(i % 2 ? 2 : -2) + 0.3 * Math.sin(t / 3 + i), ((w as number) * 0.5625) / 2 - 2.2, z as number]} />
		))}
		<mesh position={[0, -2.2, -20]} rotation={[-Math.PI / 2, 0, 0]}>
			<planeGeometry args={[200, 60]} />
			<meshStandardMaterial color="#060c07" roughness={1} />
		</mesh>
		<Rays3D n={8} o={0.2 * rays} len={30} spread={0.9} color="#ffe6b0" position={[8, 16, -14]} rotation={[0, 0, 0.45]} seed="or" />
		<Soft items={dust('fo', 160, [24, 10, 20], t, '#ffe6b0', 0.04, 0.6).map((p) => ({...p, p: [p.p[0], p.p[1] + 3, p.p[2] - 6] as V3}))} />
		{/* a wild coffee branch, close and soft */}
		<group position={[2.6, 1.2, 3.2]} rotation={[0.2, -0.5, -0.6 + 0.04 * Math.sin(f / 40)]}>
			<Leaf position={[-0.4, 0.3, 0]} rotation={[0.4, 0.3, 0.9]} scale={0.5} color="#173d1c" />
			<Leaf position={[0.5, 0.2, -0.1]} rotation={[0.3, -0.4, -0.95]} scale={0.45} color="#1b4520" />
			{[0, 1, 2, 3, 4].map((i) => (
				<Cherry key={i} ripe={i % 2 ? 0.2 : 0.9} position={[-0.1 + 0.12 * i, -0.25 - 0.05 * (i % 2), 0.05 * (i % 3)]} scale={0.5} />
			))}
		</group>
	</group>
);

const Origin: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const af = useAbsoluteFrame();
	const cue = useCue();
	const scene = useScene();
	const events = useEvents();
	const end = scene.duration;
	const t = af / 30;
	const fromFlare = 1 - prog(f, 0, 20, ease.out);
	const tilt = prog(f, 0, cue(1) - 10, ease.inOut);
	const push = prog(f, cue(1) - 30, cue(2) - cue(1) + 20, (x) => x);
	const stamp = events(cue(1) + 20, cue(2) - 30, 1)[0];
	const flowers = f >= cue(2) - 14 && f < cue(2) + 96;
	const pol = prog(f, cue(2) + 30, 50, ease.inOut);
	const fly = prog(f, cue(2) + 96, 40, ease.out);
	const eqAt = events(cue(2) + 120, end - 20, 1)[0];
	const collapse = prog(f, end - 22, 22, ease.in);
	let three: React.ReactNode;
	if (f < cue(2) - 14) {
		const pos: V3 = [mix(-0.5, 0.4, push), mix(1.1, 1.7, tilt), mix(9, 2.5, push)];
		const target: V3 = [mix(0.2, 0.6, tilt), mix(14, 2.2, tilt), mix(2, -12, tilt) + mix(0, -6, push)];
		three = (
			<Shot cam={{pos, target, fov: 40, roll: 0.05 * (1 - tilt)}} fx={{bloom: 0.8, threshold: 0.7, focus: Math.max(2, 12 - 6 * push), aperture: 0.003, fade: prog(f, cue(2) - 26, 12)}} bg="#0d2014" fog={[4, 46]}>
				<Lights keyPos={[6, 12, -6]} keyI={300} keyColor="#ffe0a8" rim={[-4, 4, 6]} rimI={30} rimColor="#9fd0a0" />
				<Forest t={t} f={f} canopy={1 - Math.min(1, Math.max(0, (tilt - 0.35) / 0.3))} />
			</Shot>
		);
	} else if (flowers) {
		const bez = (u: number): V3 => [mix(mix(-1.45, 0, u), mix(0, 1.45, u), u), 0.3 + 1.1 * 2 * u * (1 - u), 0.2 * Math.sin(u * 6)];
		const trail: Particle[] = pol > 0 ? Array.from({length: 26}, (_, k) => ({p: bez(Math.max(0, pol - k * 0.012)), s: 0.05 * (1 - k / 26), c: '#ffe7b8', a: 1 - k / 26})) : [];
		three = (
			<Shot cam={{pos: [0.2 * Math.sin(f / 60), 0.4, 4.6], target: [0, 0.3, 0], fov: 35}} fx={{bloom: 0.7, threshold: 0.7, focus: 4.6, aperture: 0.003, fade: 1 - prog(f, cue(2) - 14, 14)}} bg="#04120a" fog={[6, 20]}>
				<Lights keyPos={[2, 4, 4]} keyI={60} keyColor="#ffe6c0" rim={[-3, 2, -3]} rimI={40} rimColor="#9fe8b0" />
				{[-1.45, 1.45].map((x, i) => (
					<Flower key={i} position={[x, 0.1, 0]} rotation={[0.25, (i ? -1 : 1) * 0.3 + (f - cue(2)) / 300, 0]} scale={1.35} open={prog(f, cue(2) - 10 + i * 6, 40, ease.out)} glow={0.1} />
				))}
				<Soft items={trail} />
				<Soft items={dust('pl', 90, [10, 6, 6], t, '#d8ffd0', 0.03, 0.5)} />
			</Shot>
		);
	} else {
		const items = Array.from({length: 44}, (_, i) => {
			const left = i < 22;
			const tx = ((i % 11) - 5) * 0.62;
			const ty = 0.9 - Math.floor(i / 11) * 0.62;
			const u = Math.max(0, Math.min(1, fly * 1.4 - random(`cd${i}`) * 0.4));
			const sx = (left ? -1 : 1) * (6 + random(`cx${i}`) * 3);
			const sy = (random(`cy${i}`) - 0.5) * 5;
			const sz = -2 - random(`cz${i}`) * 4;
			const p: V3 = lerp3(lerp3([sx, sy, sz], [tx, ty, 0], u), [0, 0, 0], collapse);
			return {p, r: (1 - u) * 3 * (left ? 1 : -1), c: left ? '#7fc8ff' : '#ffc070', s: 0.8 - 0.25 * (i % 11) / 10};
		});
		three = (
			<Shot cam={{pos: [0, 0.2, mix(7.5, 7, fly)], target: [0, 0.1, 0], fov: 35}} fx={{bloom: 0.6, threshold: 0.8}} bg="#04120a">
				<Lights keyPos={[3, 4, 5]} keyI={70} rim={[-3, 2, -4]} rimI={40} rimColor="#9fe8b0" />
				{items.map((c, i) => (
					<Chromosome key={i} color={c.c} position={c.p} rotation={[0, c.r, c.r * 0.5]} scale={c.s} glow={0.12 + collapse} />
				))}
				{collapse > 0 ? <Soft items={[{p: [0, 0, 0], s: 2 + 6 * collapse, c: '#fff1d0', a: collapse}]} /> : null}
				<Soft items={dust('ch', 70, [14, 8, 6], t, '#d8ffd0', 0.03, 0.4)} />
			</Shot>
		);
	}
	return (
		<Stage4 three={three}>
			<g opacity={landed(f, stamp, cue(2) - 20)} style={{filter: `blur(${6 * (1 - prog(f, stamp, 14))}px)`}}>
				<Thin text="60 万年前" y={380} size={110} w={500} />
			</g>
			<g opacity={landed(f, cue(1) + 6, cue(2) - 20)}>
				<Tag en="Coffea arabica · SW Ethiopia" zh="埃塞俄比亚西南高地森林" />
			</g>
			{flowers
				? [412, 1508].map((x, i) => (
						<text key={i} x={x} y={820} textAnchor="middle" opacity={landed(f, cue(2) + 10 + i * 6, cue(2) + 84)} style={{fontFamily: font.latinItalic, fontStyle: 'italic', fontSize: 34, fill: '#efe4d0'}}>
							{i ? 'Coffea canephora' : 'Coffea eugenioides'}
						</text>
					))
				: null}
			<g opacity={landed(f, eqAt, end - 18)}>
				<Num text="22 + 22 → 44" y={200} size={88} />
			</g>
			<g opacity={landed(f, cue(2) + 100, end - 18)}>
				<Tag en="Allotetraploid" zh="阿拉比卡 · 四倍体 · 44 条染色体" />
			</g>
			<rect width={W} height={H} fill="#fff1d0" opacity={fromFlare} />
		</Stage4>
	);
};

// ---------------------------------------------------------------- 4. defense: caffeine in the veins, the caterpillar, the soil, three inventions

/** veins of a Leaf as tubes that light from the base outward (k 0..1) */
const Veins: React.FC<{k: number; color?: string}> = ({k, color = '#ffb347'}) => {
	const tubes = React.useMemo(() => {
		const mk = (pts: V3[]) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))), 48, 0.008, 6, false);
		const mid = mk(Array.from({length: 24}, (_, i) => leafPoint(0, 0.02 + (i / 23) * 0.95)));
		const lat: {geo: THREE.TubeGeometry; at: number}[] = [];
		for (let j = 0; j < 9; j++) {
			const v0 = 0.12 + j * 0.088;
			for (const s of [-1, 1]) lat.push({geo: mk(Array.from({length: 10}, (_, i) => leafPoint(s * (i / 9) * 0.85, v0 + (i / 9) * 0.12))), at: v0});
		}
		return {mid, lat};
	}, []);
	const draw = (g: THREE.TubeGeometry, p: number) => {
		const n = g.index!.count;
		const c = Math.floor(n * Math.max(0, Math.min(1, p)));
		g.setDrawRange(0, c - (c % 3));
	};
	draw(tubes.mid, k * 1.3);
	tubes.lat.forEach((l) => draw(l.geo, (k * 1.3 - l.at) * 3));
	return (
		<group>
			{[tubes.mid, ...tubes.lat.map((l) => l.geo)].map((g, i) => (
				<mesh key={i} geometry={g}>
					<meshBasicMaterial color={color} toneMapped={false} />
				</mesh>
			))}
		</group>
	);
};

const Defense: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const af = useAbsoluteFrame();
	const cue = useCue();
	const scene = useScene();
	const events = useEvents();
	const end = scene.duration;
	const t = af / 30;
	const fromGlow = 1 - prog(f, 0, 16);
	// D1: caffeine lights the veins
	const veins = prog(f, 4, cue(1) - 10, ease.inOut);
	const word = events(cue(0) + 20, cue(1) - 10, 1)[0];
	// D2: the caterpillar arrives, bites, is poisoned, curls and drops
	const crawl = prog(f, cue(1) - 10, 50, ease.out);
	const bite = events(cue(1) + 36, cue(2) - 30, 1)[0];
	const hurt = prog(f, bite + 4, 14);
	const curl = prog(f, bite + 20, 18, ease.inOut);
	const drop = prog(f, bite + 40, 30, ease.in);
	// D3: down into the soil
	const soil = f >= cue(2) && f < cue(3);
	const sprout = prog(f, cue(2) + 20, 40, ease.out);
	const wilt = prog(f, cue(2) + 80, 50, ease.inOut);
	// D4: three plants, three spotlights, one molecule
	const spots = [cue(3) + 6, cue(3) + 27, cue(3) + 44]; // three lamps switched on by hand, not on the grid
	const rise = prog(f, spots[2] + 10, 40, ease.inOut);
	const meet = prog(f, end - 44, 30, ease.inOut);
	const white = prog(f, end - 14, 14, ease.in);
	let three: React.ReactNode;
	if (f < cue(2)) {
		const follow = prog(f, cue(1) - 10, cue(2) - cue(1), ease.inOut);
		const cx = mix(-0.6, -0.25, follow);
		three = (
			<Shot cam={{pos: [cx + 0.3, 0.9 - 0.5 * follow, 2.6 - 0.6 * follow], target: [cx + 0.05, 0.1, 0.2], fov: 35}} fx={{bloom: 0.8, threshold: 0.6, focus: 2.5, aperture: 0.004, fade: fromGlow * 0.8}} bg="#06100a" fog={[3, 14]}>
				<Lights keyPos={[2, 3, 3]} keyI={45} keyColor="#ffe6c0" rim={[-3, 1, -3]} rimI={30} rimColor="#9fe8b0" />
				<group rotation={[-1.1, 0, -1.15]} scale={1.1}>
					<Leaf color="#1c4a20" glow={0.04 * veins} />
					<Veins k={veins} />
					{/* the caterpillar walks in along the leaf's right edge */}
					<group position={(() => {
						const p = leafPoint(0.35, mix(1.12, 0.6, crawl));
						return [p[0] + 0.4 * drop, p[1] - 0.2 * drop, p[2] - 2.2 * drop * drop - 0.3 * drop] as V3;
					})()} rotation={new THREE.Euler(Math.PI / 2 + drop * 2, 0, -Math.PI / 2 - 0.15 + drop, 'ZYX')}>
						<Caterpillar t={t} curl={curl} hurt={hurt * (1 - drop * 0.5)} scale={0.7} />
					</group>
				</group>
				{f >= bite && f < bite + 20 ? <Soft items={Array.from({length: 10}, (_, i) => ({p: [-0.3 + random(`cr${i}`) * 0.1, 0.2 - ((f - bite) / 20) * 0.6 * random(`cv${i}`), 0.4] as V3, s: 0.012, c: '#4a8a30', a: 1 - (f - bite) / 20}))} additive={false} /> : null}
				<Soft items={dust('df', 80, [6, 4, 4], t, '#d0ffb0', 0.02, 0.5)} />
			</Shot>
		);
	} else if (soil) {
		const k = f - cue(2);
		three = (
			<Shot cam={{pos: [0, mix(2.4, 0.75, prog(f, cue(2), 50, ease.out)), 2.4], target: [0, 0.15, 0], fov: 35}} fx={{bloom: 0.7, threshold: 0.6, focus: 2.4, aperture: 0.003}} bg="#0a0806" fog={[4, 16]}>
				<Lights keyPos={[1.5, 3, 2]} keyI={110} keyColor="#ffd8a0" rim={[-3, 2, -3]} rimI={40} rimColor="#ffb070" fill={0.12} />
				<Terrain amp={0.15} color="#1a120c" />
				{Array.from({length: 7}, (_, i) => {
					const u = prog(f, cue(2) - 10 + i * 9, 60, (x) => x);
					return <Leaf key={i} position={[(random(`fl${i}`) - 0.5) * 4 + 0.3 * Math.sin(u * 6 + i), mix(3.5, 0.05, u), (random(`fz${i}`) - 0.5) * 2]} rotation={[mix(0, -Math.PI / 2, u) + 0.3 * Math.sin(k / 9 + i), i, 0.4 * Math.sin(k / 13 + i)]} scale={0.22} color={i % 2 ? '#4a3a18' : '#2c3a16'} />;
				})}
				{/* caffeine seeping into the ground */}
				<Soft items={Array.from({length: 60}, (_, i) => {
					const u = ((k / 60 + random(`sp${i}`)) % 1);
					return {p: [(random(`sx${i}`) - 0.5) * 3.5, 0.05 - u * 0.3, (random(`sz${i}`) - 0.5) * 1.5] as V3, s: 0.03, c: '#ffb347', a: 0.8 * Math.sin(u * Math.PI)};
				})} />
				{/* seedlings come up, then give up */}
				{[-0.9, 0, 0.9].map((x, i) => {
					const h = 0.35 * sprout;
					const bend = wilt * (1.1 + 0.2 * i);
					const col = new THREE.Color('#6fae3a').lerp(new THREE.Color('#5a4020'), wilt);
					return (
						<group key={i} position={[x, 0.02, 0.4]} rotation={[0, 0, bend * (i % 2 ? -1 : 1)]}>
							<mesh position={[0, h / 2, 0]}>
								<cylinderGeometry args={[0.012, 0.016, Math.max(0.001, h), 8]} />
								<meshStandardMaterial color={col} />
							</mesh>
							{[1, -1].map((s) => (
								<mesh key={s} position={[0.05 * s, h, 0]} rotation={[0, 0, -s * (0.9 - 0.7 * wilt)]} scale={[0.06 * sprout, 0.03 * sprout, 0.01]}>
									<sphereGeometry args={[1, 12, 8]} />
									<meshStandardMaterial color={col} />
								</mesh>
							))}
						</group>
					);
				})}
			</Shot>
		);
	} else {
		const xs = [-2.4, 0, 2.4];
		three = (
			<Shot cam={{pos: [0, 1.2, mix(7.5, 6.8, prog(f, cue(3), end - cue(3)))], target: [0, 0.8, 0], fov: 35}} fx={{bloom: 0.9, threshold: 0.55, fade: 0}} bg="#040404" env={0.05}>
				<ambientLight intensity={0.02} />
				{xs.map((x, i) => {
					const on = prog(f, spots[i], 8);
					const p0: V3 = [x, 1.5, 0];
					const p = lerp3(lerp3(p0, [x, 2.4, 0], rise), [0, 2.6, 0.5], meet);
					return (
						<group key={i}>
							<pointLight position={[x, 3.2, 1.2]} intensity={28 * on} distance={6} decay={1.5} color="#fff0d0" />
							<Rays3D n={3} o={0.22 * on} len={6} spread={0.25} color="#fff0d0" position={[x, 6, -0.4]} seed={`sp${i}`} />
							<mesh position={[x, 0.4, 0]}>
								<cylinderGeometry args={[0.6, 0.65, 0.8, 48]} />
								<meshStandardMaterial color="#1a1714" roughness={0.6} />
							</mesh>
							{i === 0 ? <TeaLeaf position={[x, 1.25, 0]} rotation={[0.3, 0.4 + f / 120, 0]} scale={0.35} /> : null}
							{i === 1 ? <CacaoPod position={[x, 1.3, 0]} rotation={[0.2, f / 120, 0.4]} scale={0.6} /> : null}
							{i === 2
								? [0, 1, 2, 3].map((k) => <Cherry key={k} ripe={0.95} position={[x - 0.15 + 0.1 * k, 1.05 + 0.06 * (k % 2), 0.05 * (k % 3)]} scale={0.9} />)
								: null}
							{on > 0 ? <Molecule mol={CAFFEINE} core={0.6 + 0.4 * meet} position={p} rotation={[0.2, f / 50 + i, 0]} scale={0.14 * prog(f, spots[i] + 4, 16, ease.back)} /> : null}
						</group>
					);
				})}
				{meet > 0 ? <Soft items={[{p: [0, 2.6, 0.5], s: 1 + 6 * meet, c: '#fff1d0', a: meet}]} /> : null}
			</Shot>
		);
	}
	return (
		<Stage4 three={three}>
			<g opacity={landed(f, word, cue(1) - 8)}>
				<Thin text="防身术" x={1480} y={300} size={96} fill="#ffc977" w={420} />
			</g>
			<g opacity={landed(f, 10, cue(2) - 10)}>
				<Tag en="Caffeine · a natural pesticide" zh="咖啡因 · 天然杀虫剂 · Nathanson 1984" />
			</g>
			<g opacity={landed(f, cue(2) + 10, cue(3) - 10)}>
				<Tag en="Allelopathy" zh="化感作用 · 落叶抑制别的种子发芽" />
			</g>
			{['茶', '可可', '咖啡'].map((n, i) => (
				<g key={n} opacity={landed(f, spots[i] + 4, end - 16)}>
					<text x={[548, 960, 1372][i]} y={800} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 700, fontSize: 44, fill: '#efe4d0'}}>
						{n}
					</text>
				</g>
			))}
			<g opacity={landed(f, cue(3) + 10, end - 16)}>
				<Tag en="Convergent evolution" zh="趋同演化 · Denoeud et al. 2014" />
			</g>
			<rect width={W} height={H} fill="#fff1d0" opacity={white} />
		</Stage4>
	);
};

// ---------------------------------------------------------------- projection: pin 2D type to 3D points

const projector = (cam: Cam) => {
	const c = new THREE.PerspectiveCamera(cam.fov ?? 35, W / H, 0.01, 400);
	c.position.set(...cam.pos);
	c.up.set(Math.sin(cam.roll ?? 0), Math.cos(cam.roll ?? 0), 0);
	c.lookAt(...(cam.target ?? [0, 0, 0]));
	c.updateMatrixWorld();
	return (p: THREE.Vector3): [number, number, boolean] => {
		const v = p.clone().project(c);
		return [(v.x * 0.5 + 0.5) * W, (-v.y * 0.5 + 0.5) * H, v.z < 1];
	};
};

// ---------------------------------------------------------------- 5. bloom: the first rain, a hillside in flower, nectar, the bee that remembers

const Bloom: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const af = useAbsoluteFrame();
	const cue = useCue();
	const scene = useScene();
	const events = useEvents();
	const end = scene.duration;
	const t = af / 30;
	const fromWhite = 1 - prog(f, 0, 14, ease.out);
	// B1: rain, then the wave of white across the hill
	const rain = 1 - prog(f, 50, 30);
	const wave = prog(f, 40, cue(1) - 50, ease.inOut);
	const crane = prog(f, 0, cue(1), ease.inOut);
	// B2: one flower, its nectar
	const nectar = prog(f, cue(1) + 20, 30);
	// B3: the bee arrives, drinks; 24 h; three come back
	const beeIn = prog(f, cue(2) - 6, 46, ease.inOut);
	const clockT = prog(f, cue(2) + 40, 50, ease.inOut);
	const land = events(cue(2) + 90, cue(3) - 14, 3, 12);
	const x3 = landed(f, land[2] + 2, cue(3) - 10);
	// B4: petals rise into stars
	const rise = prog(f, cue(3) - 8, end - cue(3) + 8, ease.inOut);
	let three: React.ReactNode;
	if (f < cue(1) - 4) {
		const pos: V3 = [mix(-6, -2, crane), mix(1.2, 7, crane), mix(14, 20, crane)];
		const drops: Particle[] =
			rain > 0
				? Array.from({length: 260}, (_, i) => {
						const y = 12 - ((f * 0.9 + random(`ry${i}`) * 14) % 14);
						return {p: [(random(`rx${i}`) - 0.5) * 30 + pos[0], y, pos[2] - 3 - random(`rz${i}`) * 16] as V3, s: 0.05, c: '#cfe0ff', a: 0.5 * rain};
					})
				: [];
		three = (
			<Shot cam={{pos, target: [2, mix(1.5, 0, crane), -6], fov: 40}} fx={{bloom: 0.9, threshold: 0.6, fade: fromWhite * 0.6}} bg="#2a1a14" fog={[8, 60]}>
				<mesh>
					<sphereGeometry args={[90, 32, 16]} />
					<meshBasicMaterial color="#e09a5a" side={THREE.BackSide} fog={false} toneMapped={false} />
				</mesh>
				<Soft items={[{p: [10, 1.5, -60], s: 14, c: '#ffe0a8', a: 0.9}]} />
				<directionalLight position={[10, 4, -30]} intensity={2.5} color="#ffc890" />
				<Lights keyPos={[0, 10, 10]} keyI={60} keyColor="#ffd8b0" rim={[10, 3, -20]} rimI={200} rimColor="#ffb070" />
				<Terrain amp={3} color="#140d0a" />
				<Shrubs seed="hill" n={420} area={[-30, 30, -30, 8]} wave={wave * 1.25 - 0.1} t={t} />
				<Soft items={drops} />
			</Shot>
		);
	} else if (f < cue(3) - 8) {
		const k = f - cue(1);
		const zoom = prog(f, cue(1) - 4, 60, ease.out);
		const caf: V3 = [0.05 * Math.sin(k / 20), 0.15 + 0.5 * prog(f, cue(1) + 50, 60, ease.inOut), 0.25];
		// the bee's flight: from off-left to hovering over the nectar
		const bp: V3 = lerp3([-4, 1.4, 1], [0.35, 0.45 + 0.03 * Math.sin(f / 3), 0.35], beeIn);
		const second = (i: number): V3 => {
			const u = prog(f, land[i] - 30, 30, ease.out);
			return lerp3([-5 + i, 2 - i, 1.5], [1.6 + i * 0.5, 0.9 - i * 0.6, -0.4 - i * 0.3], u);
		};
		three = (
			<Shot cam={{pos: [mix(0.4, 0.15, zoom) + 0.1 * Math.sin(k / 50), mix(1.0, 0.75, zoom), mix(3.4, 2.6, zoom) + (f >= cue(2) ? 0.8 * prog(f, cue(2), 40, ease.inOut) : 0)], target: [0.15, 0.2, 0], fov: 35}} fx={{bloom: 0.6, threshold: 0.8, focus: mix(3.3, 2.6, zoom), aperture: 0.004}} bg="#160c08" fog={[3, 14]}>
				<Lights keyPos={[2, 3, 3]} keyI={22} keyColor="#ffe0b0" rim={[-2, 2, -3]} rimI={30} rimColor="#ffb070" />
				<Flower rotation={[0.25, 0.2 + k / 300, 0]} scale={1.8} glow={0} />
				{/* nectar droplet */}
				<mesh position={[0, 0, 0.06]} scale={0.06 + 0.02 * nectar}>
					<sphereGeometry args={[1, 32, 24]} />
					<meshPhysicalMaterial color="#ffcf70" roughness={0.02} transparent opacity={0.85} emissive="#ffb030" emissiveIntensity={0.6 * nectar} />
				</mesh>
				{nectar > 0 && f < cue(2) + 10 ? <Molecule mol={CAFFEINE} core={0.5} position={caf} rotation={[0.3, k / 40, 0]} scale={0.05 * nectar} /> : null}
				{f >= cue(2) - 6 ? <Bee3D flap={f * 2.4} position={bp} rotation={[0, -0.6, 0.15 * Math.sin(f / 9)]} scale={0.9} /> : null}
				{[0, 1, 2].map((i) => (f >= land[i] - 30 ? <Bee3D key={i} flap={f * 2.4 + i} position={second(i)} rotation={[0, -0.9 + i * 0.3, 0.1]} scale={0.6} /> : null))}
				<Soft items={dust('bl', 90, [8, 5, 6], t, '#fff4dc', 0.05, 0.4).map((p) => ({...p, p: [p.p[0], p.p[1], p.p[2] - 4] as V3}))} />
			</Shot>
		);
	} else {
		const petals: Particle[] = Array.from({length: 320}, (_, i) => {
			const x0 = (random(`px${i}`) - 0.5) * 30;
			const z0 = -random(`pz${i}`) * 30;
			const sp = 0.5 + random(`ps${i}`);
			const y = -2 + rise * 22 * sp + 0.3 * Math.sin(t + i);
			const star = y > 8;
			return {p: [x0 + 0.5 * Math.sin(t / 2 + i), y, z0] as V3, s: star ? 0.06 : 0.14, c: star ? '#ffffff' : '#fff4e0', a: star ? 0.9 : 0.8};
		});
		three = (
			<Shot cam={{pos: [0, mix(1, 6, rise), 12], target: [0, mix(2, 14, rise), -10], fov: 40}} fx={{bloom: 0.8, threshold: 0.5}} bg={rise > 0.5 ? '#0a0c1e' : '#1a1020'} fog={[10, 50]}>
				<mesh>
					<sphereGeometry args={[90, 32, 16]} />
					<meshBasicMaterial color={new THREE.Color('#5a3040').lerp(new THREE.Color('#080a1a'), rise)} side={THREE.BackSide} fog={false} />
				</mesh>
				<Terrain amp={3} color="#0a0708" />
				<Shrubs seed="hill" n={300} area={[-30, 30, -30, 8]} wave={2} blossom={1 - rise} t={t} />
				<Soft items={petals} />
			</Shot>
		);
	}
	return (
		<Stage4 three={three}>
			<g opacity={landed(f, 30, cue(1) - 10)}>
				<Tag en="Coffea arabica · in bloom" zh="咖啡花 · 旱季后第一场雨 · 只开三四天" />
			</g>
			<g opacity={landed(f, cue(1) + 30, cue(2) - 10)}>
				<Tag en="Nectar" zh="花蜜里的咖啡因 · 低于蜜蜂能尝出的苦味" />
			</g>
			<g opacity={landed(f, cue(2) + 30, cue(3) - 10)}>
				<g transform="translate(1660,230)">
					<Clock x={0} y={0} r={80} h={9 + 24 * clockT} m={(60 * 24 * clockT) % 60} c="#ffe2b0" />
				</g>
				<Thin text="24 h" x={1660} y={370} size={44} w={300} />
				<Tag en="Wright et al., Science 2013" zh="24 小时后还记得花香的比例" />
			</g>
			<g opacity={x3} transform={`translate(560,330) scale(${1 + 0.15 * (1 - prog(f, land[2], 10))}) translate(-560,-330)`}>
				<Num text="×3" x={560} y={330} size={200} />
			</g>
		</Stage4>
	);
};

// ---------------------------------------------------------------- 6. journey: the port of Mocha, roasted beans, seven seeds, the globe

const ROUTE = {
	mocha: [43.25, 13.3] as [number, number],
	india: [75.77, 13.32] as [number, number],
	ams: [4.9, 52.37] as [number, number],
	paris: [2.35, 48.86] as [number, number],
	mart: [-61.02, 14.64] as [number, number],
};
const AMERICAS: [number, number][] = [
	[-75, 4],
	[-47, -15],
	[-84, 10],
	[-66, 8],
	[-90, 15],
	[-77, 18],
	[-56, -25],
];
const TOWERS = Array.from({length: 24}, (_, i) => ({
	x: -10 + (i % 8) * 2.7 + (random(`tx${i}`) - 0.5) * 1.4,
	z: -3 - Math.floor(i / 8) * 3.2 - random(`tz${i}`) * 1.5,
	h: 1.8 + random(`th${i}`) * 2.6 + Math.floor(i / 8) * 0.6,
	w: 1.1 + random(`tw${i}`) * 0.6,
}));

const Journey: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const af = useAbsoluteFrame();
	const cue = useCue();
	const scene = useScene();
	const events = useEvents();
	const end = scene.duration;
	const t = af / 30;
	// J1: descend from the stars to Mocha at night; windows light on the beats
	const down = prog(f, 0, cue(1) - 10, ease.inOut);
	const win = [6, 15, 21, 33, 40, 52].map((x, i) => x + Math.round(random(`wn${i}`) * 4));
	// J2: a green bean roasted over embers; the ban
	const roastK = prog(f, cue(1) + 10, 70, ease.inOut);
	const seal = events(cue(1) + 40, cue(2) - 20, 1)[0];
	const sealK = f >= seal ? prog(f, seal, 8, ease.back) : 0;
	// J3: seven seeds; whip to the globe
	const seeds = (() => {
		const out: number[] = [];
		for (let i = 0, t0 = cue(2) + 4; i < 7; i++, t0 += 6 + 12 * 0.84 ** i + Math.round((random(`sd${i}`) - 0.5) * 3)) out.push(Math.round(t0));
		return out;
	})();
	const whip = cue(2) + 100;
	// J4: the routes west
	const routeIN = prog(f, whip + 6, 40, ease.inOut);
	const legs = events(cue(3) + 20, end - 40, 3, 20);
	const legP = legs.map((l) => prog(f, l - 20, 26, ease.inOut));
	const fan = prog(f, legs[2] + 16, 50, ease.out);
	let three: React.ReactNode;
	let labels: React.ReactNode = null;
	if (f < cue(1) - 4) {
		const dd = ease.out(down);
		const pos: V3 = [mix(-2, 1.5, dd), mix(9, 2.0, dd), mix(8, 13, dd)];
		const target: V3 = [0, mix(7, 2.0, dd), mix(-10, -5, dd)];
		const stars: Particle[] = Array.from({length: 500}, (_, i) => {
			const a = random(`sa${i}`) * Math.PI * 2;
			const e = 0.1 + random(`se${i}`) * 1.4;
			return {p: [Math.cos(a) * Math.cos(e) * 80, Math.sin(e) * 80, Math.sin(a) * Math.cos(e) * 80] as V3, s: 0.25 + random(`ss${i}`) * 0.4, c: '#ffffff', a: 0.5 + 0.5 * Math.sin(t * 2 + i)};
		});
		three = (
			<Shot cam={{pos, target, fov: 40}} fx={{bloom: 0.9, threshold: 0.55}} bg="#05070f" fog={[10, 60]}>
				<Lights keyPos={[-10, 20, 10]} keyI={420} keyColor="#9fb4ff" rim={[10, 5, -20]} rimI={150} rimColor="#5a6aaa" fill={0.06} />
				<Soft items={[{p: [-24, 30, -60], s: 6, c: '#e8eeff', a: 0.9}]} />
				<Soft items={stars} />
				<Terrain amp={1.2} color="#0d0b0a" position={[0, -0.6, -10]} />
				<Sea t={t} position={[0, -0.2, 20]} />
				{TOWERS.map((b, i) => (
					<Tower key={i} seed={`t${i}`} h={b.h} w={b.w} lit={prog(f, win[i % 6] + Math.floor(i / 6) * 3, 6)} position={[b.x, terrainH(b.x, b.z + 10, 1.2) - 0.6, b.z]} />
				))}
				<Ship t={t} position={[4, -0.15, 5]} rotation={[0, -0.4, 0]} scale={0.9} lantern={1} />
			</Shot>
		);
	} else if (f < cue(2) - 4) {
		const embers: Particle[] = Array.from({length: 120}, (_, i) => {
			const u = (t * (0.3 + random(`ev${i}`) * 0.5) + random(`eu${i}`)) % 1;
			return {p: [(random(`ex${i}`) - 0.5) * 3, -1.2 + u * 3, (random(`ez${i}`) - 0.5) * 2] as V3, s: 0.04 + 0.04 * random(`es${i}`), c: '#ffa050', a: (1 - u) * 0.9};
		});
		three = (
			<Shot cam={{pos: [0.2 * Math.sin(f / 40), 0.3, 3.2 - 0.3 * roastK], target: [0, 0, 0], fov: 35}} fx={{bloom: 0.6, threshold: 0.8, focus: 3.1, aperture: 0.003}} bg="#0a0402">
				<pointLight position={[0, -1.6, 0.4]} color="#ff6a20" intensity={9 * (0.75 + 0.25 * Math.sin(t * 6))} distance={6} decay={1.5} />
				<Lights keyPos={[2, 3, 3]} keyI={25} rimI={15} rimColor="#ff9a50" />
				<Bean roast={0.05 + 0.75 * roastK} position={[0, 0, 0]} rotation={[-0.9, 0.4 + f / 80, 0.3]} scale={0.9} />
				<Soft items={embers} />
			</Shot>
		);
	} else if (f < whip) {
		three = (
			<Shot cam={{pos: [mix(0, -3, prog(f, whip - 12, 12, ease.in)), 0.2, 6], target: [mix(0, -6, prog(f, whip - 12, 12, ease.in)), 0, 0], fov: 35}} fx={{bloom: 0.7, threshold: 0.6, blur: [0.3 * prog(f, whip - 12, 12, ease.in), 0]}} bg="#07080c">
				<Lights keyPos={[2, 4, 5]} keyI={60} rim={[-3, 2, -4]} rimI={40} />
				{seeds.map((s, i) => {
					const k = prog(f, s, 12, ease.back);
					return k > 0 ? <Bean key={i} roast={0.02} position={[(i - 3) * 1.15, 0.15 * Math.sin(f / 15 + i), 0]} rotation={[-1.0 + 0.2 * Math.sin(f / 20 + i), i * 0.6 + f / 90, 0.2]} scale={0.45 * k} /> : null;
				})}
			</Shot>
		);
	} else {
		const whipIn = 1 - prog(f, whip, 12, ease.out);
		const out = prog(f, cue(3) - 20, 60, ease.inOut);
		const rotY = mix(-2.5, mix(-1.45, -0.45, prog(f, legs[1], end - legs[1], ease.inOut)), out) - 0.6 * whipIn;
		const rotX = mix(0.12, 0.35, out);
		const cam: Cam = {pos: [0, 0.3, mix(2.9, 3.4, out)], target: [0, mix(0.15, 0.2, out), 0], fov: 35};
		const pj = projector(cam);
		const rot = new THREE.Euler(rotX, rotY, 0);
		const at = (ll2: [number, number]) => pj(ll(ll2[0], ll2[1], 1.01).applyEuler(rot));
		const city = (p: [number, number], name: string, sub: string, o: number, dx = 18, dy = -14) => {
			const [x, y] = at(p);
			const facing = ll(p[0], p[1]).applyEuler(rot).z > 0.15;
			if (o <= 0 || !facing) return null;
			return (
				<g key={name} opacity={o}>
					<text x={x + dx} y={y + dy} style={{fontFamily: font.serif, fontWeight: 700, fontSize: 28, fill: '#f3ead8'}}>
						{name}
					</text>
					<text x={x + dx} y={y + dy + 24} style={{fontFamily: font.sans, fontSize: 15, letterSpacing: '0.2em', fill: '#c99a5a'}}>
						{sub}
					</text>
				</g>
			);
		};
		labels = (
			<g>
				{city(ROUTE.mocha, '摩卡', '也门', prog(f, whip + 10, 14))}
				{city(ROUTE.india, '奇克马加卢尔', '1670 · 七颗种子', prog(f, whip + 40, 14))}
				{city(ROUTE.ams, '阿姆斯特丹', '1706', prog(f, legs[0], 14))}
				{city(ROUTE.paris, '巴黎', '1714 · 送给法国国王', prog(f, legs[1], 14), 18, 30)}
				{city(ROUTE.mart, '马提尼克', '1723', prog(f, legs[2], 14))}
			</g>
		);
		three = (
			<Shot cam={cam} fx={{bloom: 0.75, threshold: 0.6, blur: [0.3 * whipIn, 0]}} bg="#05060b">
				<Lights keyPos={[3, 3, 4]} keyI={60} rim={[-4, 3, -4]} rimI={40} />
				<Globe
					rotation={[rotX, rotY, 0]}
					routes={[
						{from: ROUTE.mocha, to: ROUTE.india, p: routeIN},
						{from: ROUTE.mocha, to: ROUTE.ams, p: legP[0]},
						{from: ROUTE.ams, to: ROUTE.paris, p: legP[1]},
						{from: ROUTE.paris, to: ROUTE.mart, p: legP[2]},
						...AMERICAS.map((a, i) => ({from: ROUTE.mart, to: a, p: Math.max(0, Math.min(1, fan * 1.4 - i * 0.06))})),
					]}
					cities={[
						{at: ROUTE.mocha, o: 1},
						{at: ROUTE.india, o: routeIN >= 1 ? 1 : 0},
						{at: ROUTE.ams, o: legP[0] >= 1 ? 1 : 0},
						{at: ROUTE.paris, o: legP[1] >= 1 ? 1 : 0},
						{at: ROUTE.mart, o: legP[2] >= 1 ? 1 : 0},
						...AMERICAS.map((a, i) => ({at: a, o: fan * 1.4 - i * 0.06 >= 1 ? 0.7 : 0})),
					]}
				/>
				<Soft items={dust('gl', 200, [20, 12, 8], t, '#ffffff', 0.03, 0.5).map((p) => ({...p, p: [p.p[0], p.p[1], p.p[2] - 8] as V3}))} />
			</Shot>
		);
	}
	return (
		<Stage4 three={three}>
			{labels}
			<g opacity={landed(f, 20, cue(1) - 10)}>
				<Tag en="Mocha, Yemen" zh="也门 · 摩卡港" />
			</g>
			{f >= cue(1) - 4 && f < cue(2) - 4 ? (
				<g>
					{sealK > 0 ? (
						<g transform={`translate(1380,560) scale(${mix(1.8, 1, sealK)})`} opacity={Math.min(1, sealK * 1.5)}>
							<circle r={150} fill="none" stroke="#c8342a" strokeWidth={3} opacity={0.9} />
							<circle r={132} fill="none" stroke="#c8342a" strokeWidth={1} opacity={0.6} />
							<Thin text="禁" x={0} y={34} size={110} fill="#c8342a" w={900} />
						</g>
					) : null}
					<g opacity={landed(f, cue(1) + 6)}>
						<Tag en="Roasted before export" zh="出口前先烘过 · 种不活" />
					</g>
				</g>
			) : null}
			<g opacity={landed(f, seeds[6], whip - 4)}>
				<Thin text="7" x={960} y={300} size={120} fill="#e9f0c0" w={200} />
			</g>
			<g opacity={landed(f, cue(3) + 10)}>
				<Tag en="The smuggled seeds" zh="被偷偷带走的种子" />
			</g>
		</Stage4>
	);
};

// ---------------------------------------------------------------- 7. roast: green beans, the drum, the crack, a nebula of aroma

const AROMAS: [string, string, number, number][] = [
	['焦糖', '#ffc070', 400, 300],
	['坚果', '#c8906a', 1520, 300],
	['莓果', '#ff8aa0', 1560, 780],
	['花香', '#c8a0ff', 360, 780],
	['巧克力', '#d0a080', 960, 220],
];

const PILE = Array.from({length: 110}, (_, i) => {
	const a = random(`pa${i}`) * Math.PI * 2;
	const r = Math.sqrt(random(`pr${i}`)) * 2.4;
	return {p: [Math.cos(a) * r * 1.4, (1 - r / 2.4) * 0.7 + random(`ph${i}`) * 0.12, Math.sin(a) * r * 0.8] as V3, r: [random(`r1${i}`) * 6, random(`r2${i}`) * 6, random(`r3${i}`) * 6] as V3};
});

const Roast: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const af = useAbsoluteFrame();
	const cue = useCue();
	const scene = useScene();
	const events = useEvents();
	const end = scene.duration;
	const t = af / 30;
	const fromDark = 1 - prog(f, 0, 14);
	const heat = prog(f, cue(1) - 10, 44, ease.in);
	const crack = events(cue(1) + 30, cue(1) + 60, 1)[0];
	const burst = f >= crack ? Math.exp(-(f - crack) / 8) : 0;
	const meetAt = events(cue(2) + 4, cue(2) + 40, 1)[0];
	const neb = prog(f, meetAt - 10, 50, ease.out);
	const words = [0, 11, 19, 30, 37].map((d) => meetAt + 14 + d);
	const landN = events(meetAt + 30, end - 24, 1)[0];
	const gather = prog(f, end - 22, 22, ease.in);
	let three: React.ReactNode;
	if (f < cue(1) - 6) {
		const slide = prog(f, 0, cue(1), (x) => x);
		three = (
			<Shot cam={{pos: [mix(-1.6, 1.2, slide), 1.5, 3.4], target: [mix(-0.8, 0.6, slide), 0.3, 0], fov: 35}} fx={{bloom: 0.6, threshold: 0.8, focus: 3.3, aperture: 0.005, fade: fromDark}} bg="#07100a" fog={[3, 12]}>
				<Lights keyPos={[2, 4, 2]} keyI={60} keyColor="#f0ffe0" rim={[-3, 2, -3]} rimI={40} rimColor="#a0e8a0" />
				<BeanSwarm items={PILE.map((b) => ({...b, s: 0.26, roast: 0.02}))} />
				<Soft items={dust('gr', 120, [6, 3, 4], t, '#b8f0a0', 0.05, 0.45).map((p) => ({...p, p: [p.p[0], p.p[1] + 1.4, p.p[2]] as V3}))} />
			</Shot>
		);
	} else if (f < cue(2) - 6) {
		const spin = f / 14;
		const roastK = 0.05 + 0.7 * heat + 0.15 * (f >= crack ? 1 : 0);
		const beans = Array.from({length: 70}, (_, i) => {
			const lane = random(`dl${i}`);
			const ph = (spin * (0.6 + 0.3 * lane) + random(`dp${i}`) * Math.PI * 2) % (Math.PI * 2);
			// carried up the wall, then tumbling down through the middle
			const up = ph < Math.PI * 1.2;
			const a = up ? -Math.PI / 2 - 0.4 + ph * 0.75 : 0;
			const y = up ? Math.sin(a) * 1.35 : mix(1.0, -1.3, (ph - Math.PI * 1.2) / (Math.PI * 0.8));
			const z = up ? Math.cos(a) * 1.35 : mix(-0.6, 0.4, (ph - Math.PI * 1.2) / (Math.PI * 0.8));
			const pop = f >= crack && i % 7 === 0 ? 1 + 0.4 * burst : 1;
			return {p: [(lane - 0.5) * 2.6, y, z] as V3, r: [ph * 3 + i, i, ph * 2] as V3, s: 0.16 * pop, roast: roastK};
		});
		const shake: V3 = [6 * burst * (random(`sx${f}`) - 0.5) * 0.05, 6 * burst * (random(`sy${f}`) - 0.5) * 0.05, 0];
		const chaff: Particle[] =
			f >= crack
				? Array.from({length: 80}, (_, i) => {
						const k = Math.min(1, (f - crack) / 40);
						const a = random(`ca${i}`) * Math.PI * 2;
						const d = (0.3 + random(`cd${i}`) * 2.2) * k;
						return {p: [Math.cos(a) * d, Math.sin(a) * d * 0.7 + 0.3 * k, 0.5 + random(`cz${i}`)] as V3, s: 0.05, c: '#e0b070', a: 1 - k};
					})
				: [];
		three = (
			<Shot cam={{pos: [2.6 + shake[0], 0.2 + shake[1], 2.2], target: [0, -0.2, 0], fov: 50}} fx={{bloom: 0.9, threshold: 0.6, focus: 2.8, aperture: 0.004}} bg="#060302">
				<pointLight position={[0, -2.5, 0]} color="#ff5a10" intensity={20 + 60 * heat} distance={8} decay={1.5} />
				<Lights keyPos={[3, 2, 3]} keyI={30} rimI={20} rimColor="#ff8a40" />
				<Drum heat={heat} spin={spin} />
				<BeanSwarm items={beans} />
				<Soft items={chaff} />
				{burst > 0.05 ? <Soft items={[{p: [0, 0, 0.5], s: 6 * burst, c: '#fff0c0', a: burst}]} /> : null}
			</Shot>
		);
	} else {
		const k = f - (cue(2) - 6);
		const cols = ['#ffc070', '#c8906a', '#ff8aa0', '#c8a0ff', '#a07050', '#ffe0a0'];
		const neb3: Particle[] = Array.from({length: 900}, (_, i) => {
			const a = random(`na${i}`) * Math.PI * 2 + t * (0.1 + 0.2 * random(`nv${i}`));
			const r = Math.pow(random(`nr${i}`), 0.6) * 4.5 * neb * (1 - gather);
			const y = (random(`ny${i}`) - 0.3) * 2.4 * neb * (1 - gather) + 0.5 * Math.sin(a * 2);
			return {p: [Math.cos(a) * r, y, Math.sin(a) * r * 0.6] as V3, s: random(`nb${i}`) > 0.95 ? 0.3 : 0.05, c: cols[i % 6], a: 0.7};
		});
		three = (
			<Shot cam={{pos: [0, mix(0.8, 1.6, prog(f, cue(2), 120)), mix(5, 7.5, neb)], target: [0, 0.2, 0], fov: 38}} fx={{bloom: 1.0, threshold: 0.45}} bg="#07040a">
				<Lights keyPos={[2, 3, 3]} keyI={40} rimI={30} rimColor="#c8a0ff" />
				<BeanSwarm items={PILE.slice(0, 40).map((b) => ({p: [b.p[0] * 0.8, b.p[1] - 1.6, b.p[2] * 0.8] as V3, r: b.r, s: 0.2, roast: 0.85}))} />
				<Soft items={neb3} />
				{gather > 0 ? <Soft items={[{p: [0, 0.3, 0], s: 1 + 5 * gather, c: '#fff1d0', a: gather}]} /> : null}
			</Shot>
		);
	}
	return (
		<Stage4 three={three}>
			<g opacity={landed(f, cue(0) + 6, cue(1) - 10)}>
				<Tag en="Green coffee" zh="生豆 · 闻起来像青草" />
			</g>
			{f >= cue(1) - 6 && f < cue(2) - 6 ? (
				<g>
					<Num text={`${Math.round(mix(150, 196, heat))}°C`} x={1560} y={600} size={170} fill="#ffb060" />
					<g opacity={landed(f, cue(1))}>
						<Tag en={f >= crack ? 'First crack' : 'Roasting drum'} zh={f >= crack ? '一爆 · 水汽撑破细胞壁 · 约 196 °C' : '滚筒 · 两百度左右'} />
					</g>
				</g>
			) : null}
			{f >= cue(2) - 6 ? (
				<g opacity={1 - gather}>
					{f >= meetAt + 20 ? <Rolling value="1,000+" f={f} start={meetAt + 20} land={landN} y={600} size={170} id="ar" /> : null}
					{AROMAS.map(([w, c, x, y], i) => (
						<g key={w} opacity={landed(f, words[i])} style={{filter: `blur(${4 * (1 - prog(f, words[i], 10))}px)`}}>
							<text x={x} y={y} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 700, fontSize: 46, fill: c}}>
								{w}
							</text>
						</g>
					))}
					<g opacity={landed(f, cue(2))}>
						<Tag en={neb > 0.5 ? 'Volatile compounds' : 'Maillard reaction'} zh={neb > 0.5 ? '已鉴定的咖啡香气物质 · 一千多种' : '美拉德反应 · 糖 + 氨基酸'} />
					</g>
				</g>
			) : null}
		</Stage4>
	);
};

// ---------------------------------------------------------------- 8. body: afternoon to midnight, two genes, more locks

const Body: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const af = useAbsoluteFrame();
	const cue = useCue();
	const scene = useScene();
	const events = useEvents();
	const end = scene.duration;
	const t = af / 30;
	const fromGlow = 1 - prog(f, 0, 16);
	const time = prog(f, 6, cue(1) - 20, ease.inOut);
	const hours = 15 + 9 * time;
	const dec = prog(f, cue(1), cue(2) - cue(1), (x) => x);
	const batches = events(cue(2) + 10, end - 30, 3, 20);
	const nLocks = f < batches[0] ? 3 : f < batches[1] ? 6 : 12;
	const toCup = prog(f, end - 18, 18, ease.in);
	let three: React.ReactNode;
	if (f < cue(1) - 6) {
		const sky = new THREE.Color('#b8c8e0').lerp(new THREE.Color('#e08a50'), Math.min(1, time * 2)).lerp(new THREE.Color('#0a0e22'), Math.max(0, time * 2 - 1));
		three = (
			<Shot cam={{pos: [-0.8 + 0.3 * time, 1.7, 4.6 - 0.4 * time], target: [0.9, 1.4, -1.5], fov: 40}} fx={{bloom: 0.7, threshold: 0.7, focus: 4.4, aperture: 0.002, fade: fromGlow * 0.7}} bg="#06070c">
				<Lights keyPos={[1, 3, -2]} keyI={mix(20, 5, time)} keyColor={`#${sky.getHexString()}`} rim={[-3, 3, 3]} rimI={mix(10, 25, time)} rimColor="#ffcf90" fill={0.05} />
				<RoomWindow sky={`#${sky.getHexString()}`} skyI={mix(1, 0.25, time)} position={[1.2, 0, 0]} />
				<Table color="#1b120c" />
				<group position={[1.1, 0, -0.6]}>
					<Saucer />
					<Cup position={[0, 0.05, 0]} t={t} level={mix(0.86, 0.29, time)} />
				</group>
				{time > 0.6 ? <Soft items={Array.from({length: 40}, (_, i) => ({p: [1.2 + (random(`ws${i}`) - 0.5) * 4, 2.5 + (random(`wy${i}`) - 0.5) * 4, -3.5] as V3, s: 0.03, c: '#ffffff', a: ramp(time, 0.6, 1)}))} /> : null}
			</Shot>
		);
	} else if (f < cue(2) - 6) {
		const cloud = (x: number, keep: number, seed: string): Particle[] =>
			Array.from({length: 90}, (_, i) => {
				const a = random(`${seed}a${i}`) * Math.PI * 2 + t * 0.5;
				const r = 0.8 + random(`${seed}r${i}`) * 1.2 + (1 - keep) * 2.5;
				return {p: [x + Math.cos(a) * r, (random(`${seed}y${i}`) - 0.5) * 5, Math.sin(a) * r * 0.6] as V3, s: 0.07, c: '#ffc070', a: (random(`${seed}k${i}`) < keep ? 0.9 : 0) * keep};
			});
		three = (
			<Shot cam={{pos: [0, 0, 9.5], target: [0, 0, 0], fov: 38}} fx={{bloom: 0.8, threshold: 0.55}} bg="#07060e">
				<Lights keyPos={[3, 3, 5]} keyI={60} rim={[-3, 2, -4]} rimI={40} />
				<DNA position={[-3, 0, 0]} rotation={[0, 0, 0.2]} t={t * 1.5} color="#e8e8ff" len={6} />
				<DNA position={[3, 0, 0]} rotation={[0, 0, 0.2]} t={t * 1.5} color="#ffcf8a" len={6} />
				<Soft items={cloud(-3, Math.exp(-dec * 4), 'fa')} />
				<Soft items={cloud(3, Math.exp(-dec * 0.6), 'sl')} />
			</Shot>
		);
	} else {
		const pull = prog(f, cue(2) - 6, end - cue(2), ease.inOut);
		const spots: V3[] = Array.from({length: 12}, (_, i) => [((i % 6) - 2.5) * 2.2, 0, i < 6 ? 0 : -2.4] as V3);
		three = (
			<Shot cam={{pos: [0, mix(2.4, 5.5, pull), mix(6.5, 10.5, pull)], target: [0, 0.4, -1], fov: 38}} fx={{bloom: 0.8, threshold: 0.6, fade: toCup * 0.3}} bg="#05040e" fog={[8, 30]}>
				<Lights keyPos={[2, 6, 6]} keyI={90} keyColor="#cfe0ff" rim={[-5, 3, -6]} rimI={50} rimColor="#8a7dff" />
				<Membrane t={t} w={26} d={9} color="#6c8cff" position={[0, -0.05, -1]} />
				{spots.map((p, i) => {
					const at = i < 3 ? cue(2) - 6 : i < 6 ? batches[0] : batches[1];
					const order = [2, 3, 1, 4, 0, 5, 8, 9, 7, 10, 6, 11][i];
					const k = order < 3 ? 1 : interpolate(f - at - (order % 6) * 2, [0, 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease.back});
					const pp = spots[order];
					return k > 0 ? <Receptor3D key={i} position={pp} scale={0.85 * k} glow={0.2} /> : null;
				})}
				{toCup > 0 ? <Soft items={[{p: [0, 1, 0], s: 2 + 10 * toCup, c: '#ffe2b0', a: toCup}]} /> : null}
			</Shot>
		);
	}
	return (
		<Stage4 three={three}>
			{f < cue(1) - 6 ? (
				<g>
					<g transform="translate(420,470)">
						<Clock x={0} y={0} r={230} h={hours} m={(hours % 1) * 60} />
					</g>
					<text x={420} y={790} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 500, fontSize: 52, fill: '#f6e7c8', letterSpacing: '0.08em'}}>
						{`${String(Math.floor(hours) % 24).padStart(2, '0')}:${String(Math.floor((hours % 1) * 60)).padStart(2, '0')}`}
					</text>
					<text x={1380} y={830} textAnchor="middle" style={{fontFamily: font.sans, fontSize: 24, letterSpacing: '0.2em', fill: '#ffd896'}} opacity={ramp(time, 0.8, 0.95)}>
						还剩 ≈ 1/3
					</text>
					<g opacity={landed(f, cue(0) + 6)}>
						<Tag en="Half-life ≈ 5 h" zh="半衰期约 5 小时 · 因人而异" />
					</g>
				</g>
			) : null}
			{f >= cue(1) - 6 && f < cue(2) - 6 ? (
				<g>
					{['快 · 倒头就睡', '慢 · 失眠到天亮'].map((n, i) => (
						<text key={n} x={[560, 1360][i]} y={160} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 600, fontSize: 40, fill: i ? '#ffd896' : '#e8e8e8'}}>
							{n}
						</text>
					))}
					<g opacity={landed(f, cue(1) + 6)}>
						<Tag en="CYP1A2" zh="肝脏里分解咖啡因的基因" />
					</g>
				</g>
			) : null}
			{f >= cue(2) - 6 ? (
				<g opacity={landed(f, cue(2) + 6, end - 16)}>
					<Num text={`${nLocks}`} x={960} y={160} size={90} fill="#9fe8f0" />
					<text x={960} y={210} textAnchor="middle" style={{fontFamily: font.sans, fontSize: 20, letterSpacing: '0.4em', fill: '#9fe8f0'}} opacity={0.7}>
						把锁
					</text>
					<Tag en="Tolerance" zh="耐受 · 受体变多，同样的咖啡不够分" />
				</g>
			) : null}
		</Stage4>
	);
};

// ---------------------------------------------------------------- 9. coda: morning, the cup by the window; the Juno end card

const Coda: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const af = useAbsoluteFrame();
	const cue = useCue();
	const scene = useScene();
	const end = scene.duration;
	const t = af / 30;
	const endAt = end - 6 * 30;
	const fromGlow = 1 - prog(f, 0, 16);
	const orbit = prog(f, 0, endAt, ease.inOut);
	const ghostTree = landed(f, cue(0) + 10, cue(1) - 6, 20);
	const ghostFlower = landed(f, cue(1) + 4, cue(2) - 2, 20);
	const sun = prog(f, cue(2) - 16, 40, ease.inOut);
	const card = prog(f, endAt, 30, ease.inOut);
	const sky = new THREE.Color('#c87a40').lerp(new THREE.Color('#e8b878'), sun);
	return (
		<Stage4
			three={
				<Shot cam={{pos: [mix(-1.4, -0.6, orbit), mix(1.5, 1.35, orbit), mix(4.4, 3.4, orbit)], target: [0.4, 1.35, -1.2], fov: 38}} fx={{bloom: 0.6, threshold: 0.75, focus: 3.4, aperture: 0.002, fade: 0.88 * card + fromGlow * 0.6}} bg="#0a0604">
					<Lights keyPos={[0.8, 3, -2.2]} keyI={mix(35, 60, sun)} keyColor={`#${sky.getHexString()}`} rim={[-3, 3, 3]} rimI={10} fill={0.05} />
					<RoomWindow sky={`#${sky.getHexString()}`} skyI={mix(0.6, 0.8, sun)} position={[0.8, 0, 0]} />
					<Table color="#22160e" />
					<group position={[0.4, 0, -0.9]}>
						<Saucer />
						<Cup position={[0, 0.05, 0]} t={t} level={0.86} />
						<Steam t={t} position={[0, 1.05, 0]} o={0.3} />
						{/* memories rising out of the steam */}
						<group position={[0, 1.75, 0]} scale={0.9}>
							<TreeCard seed="ghost" n={1} ground={false} color="#ffe2b0" o={0.85 * ghostTree} w={3} h={1.7} />
						</group>
						<group position={[0, 1.55, 0]}>
							{ghostFlower > 0 ? <Flower scale={0.5 * ghostFlower} glow={0.5} rotation={[0.3, t / 3, 0]} /> : null}
							{Array.from({length: 7}, (_, i) => {
								const k = prog(f, cue(1) + 20 + i * 4, 16, ease.back) * ghostFlower;
								const a = (i / 7) * Math.PI * 2 + t / 2;
								return k > 0 ? <Bean key={i} roast={0.05} glow={0.6} position={[Math.cos(a) * 0.55, 0.05 * Math.sin(t + i), Math.sin(a) * 0.55]} rotation={[-1, a, 0]} scale={0.08 * k} /> : null;
							})}
						</group>
					</group>
					<Rays3D n={6} o={0.18 * (0.4 + sun)} len={7} spread={0.5} color="#fff0d0" position={[1.2, 4.6, -2.8]} rotation={[0.5, 0, 0.35]} seed="cr" />
					<Soft items={dust('cd', 120, [6, 4, 4], t, '#fff0d0', 0.03, 0.6).map((p) => ({...p, p: [p.p[0] + 0.6, p.p[1] + 2, p.p[2] - 1] as V3}))} />
				</Shot>
			}
			over={
				<Sequence from={endAt} layout="none">
					<EndCard v={EPISODE} cfg={BRAND} dur={end - endAt} />
				</Sequence>
			}
		/>
	);
};

export const scenes: SceneMap = {...scenesV3, Hook, Sleep, Origin, Defense, Bloom, Journey, Roast, Body, Coda};
