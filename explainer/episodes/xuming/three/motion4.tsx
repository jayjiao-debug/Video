import React from 'react';
import {AbsoluteFill, Sequence, random, useCurrentFrame} from 'remotion';
import {loadEpisodeFonts} from '../../../src/lib/fonts';
import {ease, mix, prog} from '../../../src/lib/context';
import {font} from '../../../src/lib/theme';
import {CAFFEINE, Cup, Globe, Molecule, Saucer, Steam, Table} from './props3d';
import {Lights, Stage3D} from './stage3d';

/**
 * v4 motion test: the same opening beats, re-shot in 3D to show the new transition grammar.
 *  1. macro on the crema -> crane back to reveal cup, saucer, steam (rack focus)
 *  2. push INTO the coffee: the surface fills frame and becomes the dark of the inside (match on colour)
 *  3. molecules in depth of field; the hero one turns to camera and its skeleton lights gold on the hit
 *  4. whip pan (screen-space smear) -> the globe, the route drawing itself
 */

export const MOTION4_N = 450;

const lerp3 = (a: number[], b: number[], t: number) => a.map((v, i) => mix(v, b[i], t)) as [number, number, number];

const Subtitle: React.FC<{text: string; from: number; to: number; f: number}> = ({text, from, to, f}) => {
	const o = Math.min(prog(f, from, 10), 1 - prog(f, to - 8, 8));
	if (o <= 0) return null;
	return (
		<div style={{position: 'absolute', left: 0, right: 0, bottom: 64, textAlign: 'center', fontFamily: font.serif, fontWeight: 700, fontSize: 42, letterSpacing: '0.04em', color: '#f3ead8', opacity: o, textShadow: '0 2px 18px rgba(0,0,0,.8)'}}>
			{text}
		</div>
	);
};

// ---------------------------------------------------------------- shot 1+2: the cup

const LEVEL_Y = 0.05 + 0.08 + 0.86 * 0.9; // saucer lift + cup floor + level

const CupShot: React.FC = () => {
	const f = useCurrentFrame();
	const reveal = prog(f, 40, 110, ease.inOut);
	const dive = prog(f, 162, 34, ease.in);
	const orbit = -0.5 + 0.35 * prog(f, 0, 200, ease.inOut);
	const r = mix(0.35, 3.3, reveal);
	const h = mix(LEVEL_Y + 0.22, 1.55, reveal);
	let pos: [number, number, number] = [Math.sin(orbit) * r, h, Math.cos(orbit) * r];
	let target: [number, number, number] = [0, mix(LEVEL_Y, 0.5, reveal), 0];
	// dive: crane up over the rim, then drop straight down into the surface
	const up = prog(f, 140, 30, ease.inOut);
	pos = lerp3(pos, [0.05, 1.9, 0.9], up);
	target = lerp3(target, [0, LEVEL_Y, 0], up);
	pos = lerp3(pos, [0.01, LEVEL_Y + 0.02, 0.012], dive);
	const focus = Math.hypot(pos[0] - target[0], pos[1] - target[1], pos[2] - target[2]);
	return (
		<Stage3D fog={[8, 30]} cam={{pos, target, fov: mix(30, 36, reveal) - 8 * dive}} focus={focus} aperture={mix(0.004, 0.0015, reveal)} bloom={0.55} threshold={0.75} fade={prog(f, 188, 10, ease.in)}>
			<Lights rim={[-2.5, 3.5, -4]} rimI={22} keyI={55} />
			<Table color="#0d0907" />
			<Saucer />
			<Cup position={[0, 0.05, 0]} t={f / 30} swirl={1 + 3 * dive} />
			<Steam t={f / 30} position={[0, 1.05, 0]} o={0.22 * reveal * (1 - dive)} />
		</Stage3D>
	);
};

// ---------------------------------------------------------------- shot 3: molecules in depth

const FIELD = Array.from({length: 16}, (_, i) => ({
	p: [(random(`mx${i}`) - 0.5) * 26, (random(`my${i}`) - 0.5) * 14, -random(`mz${i}`) * 40 - 4] as [number, number, number],
	r: [random(`ra${i}`) * 6, random(`rb${i}`) * 6, random(`rc${i}`) * 6] as [number, number, number],
	s: 0.55 + random(`ms${i}`) * 0.3,
}));

const MoleculeShot: React.FC = () => {
	const f = useCurrentFrame();
	const lit = prog(f, 60, 24, ease.out);
	const turn = prog(f, 10, 70, ease.inOut);
	const z = mix(10, 6.5, prog(f, 0, 130, ease.out));
	return (
		<Stage3D cam={{pos: [0.4 * Math.sin(f / 40), 0.2, z], target: [0, 0, 0], fov: 38}} focus={z} aperture={0.006} bloom={0.8} threshold={0.7} fade={1 - prog(f, 0, 14, ease.out)} bg="#07050a" fog={[12, 48]}>
			<Lights rim={[-6, 4, -6]} rimI={60} keyI={90} />
			{FIELD.map((m, i) => (
				<Molecule key={i} mol={CAFFEINE} position={[m.p[0], m.p[1] + f / 160, m.p[2]]} rotation={[m.r[0] + f / 90, m.r[1] + f / 70, m.r[2]]} scale={m.s} />
			))}
			<Molecule mol={CAFFEINE} core={lit} position={[0, 0, 0]} rotation={[mix(1.1, 0.12, turn), mix(-2.2, -0.15, turn) + f / 300, mix(0.6, 0, turn)]} scale={0.95} />
		</Stage3D>
	);
};

// ---------------------------------------------------------------- shot 4: whip pan to the globe

const MOCHA: [number, number] = [43.25, 13.32];
const INDIA: [number, number] = [75.7, 13.4];
const AMS: [number, number] = [4.9, 52.37];
const MART: [number, number] = [-61.0, 14.6];

const GlobeShot: React.FC = () => {
	const f = useCurrentFrame();
	const whipIn = 1 - prog(f, 0, 12, ease.out);
	const push = prog(f, 0, 105, ease.out);
	const legs = [prog(f, 14, 26, ease.inOut), prog(f, 34, 30, ease.inOut), prog(f, 58, 36, ease.inOut)];
	return (
		<Stage3D cam={{pos: [0, 0.35, mix(4.2, 3.0, push)], target: [0, 0.05, 0], fov: 35}} bloom={0.75} threshold={0.6} blur={[0.3 * whipIn, 0]}>
			<Lights rim={[-4, 3, -4]} rimI={40} keyI={70} />
			<Globe
				rotation={[0.28, mix(-1.6, -0.55, prog(f, 0, 105, ease.inOut)) - 0.6 * whipIn, 0]}
				routes={[
					{from: MOCHA, to: INDIA, p: legs[0]},
					{from: MOCHA, to: AMS, p: legs[1]},
					{from: AMS, to: MART, p: legs[2]},
				]}
				cities={[
					{at: MOCHA, o: 1},
					{at: INDIA, o: legs[0] >= 1 ? 1 : 0},
					{at: AMS, o: legs[1] >= 1 ? 1 : 0},
					{at: MART, o: legs[2] >= 1 ? 1 : 0},
				]}
			/>
		</Stage3D>
	);
};

/** the out-going half of the whip: the molecule shot smears and slides */
const WhipOut: React.FC = () => {
	const f = useCurrentFrame();
	const k = prog(f, 0, 12, ease.in);
	return (
		<Stage3D cam={{pos: [mix(0, -6, k), 0.2, 6.5], target: [mix(0, -8, k), 0, 0], fov: 38}} focus={6.5} aperture={0.006} bloom={0.8} threshold={0.7} bg="#07050a" fog={[12, 48]} blur={[0.3 * k, 0]}>
			<Lights rim={[-6, 4, -6]} rimI={60} keyI={90} />
			<Molecule mol={CAFFEINE} core={1} rotation={[0.12, -0.15 + (130 + f) / 300, 0]} scale={0.95} />
		</Stage3D>
	);
};

export const XumingMotion4: React.FC = () => {
	loadEpisodeFonts('xuming');
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: '#05060b'}}>
			<Sequence from={0} durationInFrames={200}>
				<CupShot />
			</Sequence>
			<Sequence from={200} durationInFrames={130}>
				<MoleculeShot />
			</Sequence>
			<Sequence from={330} durationInFrames={12}>
				<WhipOut />
			</Sequence>
			<Sequence from={342} durationInFrames={108}>
				<GlobeShot />
			</Sequence>
			<Subtitle f={f} from={20} to={140} text="每天，全世界约有二十亿杯咖啡被端起。" />
			<Subtitle f={f} from={225} to={328} text="咖啡因的骨架，和腺苷几乎一模一样。" />
			<Subtitle f={f} from={356} to={448} text="七颗偷渡的种子，长满了半个美洲。" />
			<div style={{position: 'absolute', right: 56, top: 40, fontFamily: font.sans, fontSize: 20, letterSpacing: '0.12em', color: '#f1c56d', opacity: 0.55}}>◆ Juno · VIBE知识大赏</div>
		</AbsoluteFill>
	);
};
