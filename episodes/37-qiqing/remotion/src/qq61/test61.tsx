/* ep61 · motion test (owner 2026-11-06: "PPT vibes… not much action… visuals very plain"): shots 5–6 (Geb and Nut, Shu parts them)
   re-cut with the new grammar: 6 camera set-ups in 13 s, cuts on the lines, characters act (Geb wakes and reaches, Nut forms out of the
   stars and sinks onto him, their faces meet, Shu walks in, crouches, wind-up, explodes upward), depth layers with parallax, light and
   particles (star swirl, shockwave, dust, wind streaks, dawn, birds, sprouting papyrus). Composition TEST61 (13.15 s). */
import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {Bands, Subtitle, FC, PIC_T, PIC_B, FW, FH, InMaster60, rng} from '../qq60/frame60';
import {PAL} from '../qq60/geo60';
import {POSES, lerpPose, Pose} from '../qq60/rig60';
import {walkPose, STRIDE} from '../qq60/cast60';
import {God61, P61} from './cast61';
import {NutArch, GY} from './shots61';
import {SetDefs61} from './sets61_kit';
import {BirdsCrossing, PapyrusThicket} from './sets61_nature';

const FPS = 30, DUR = 13.15;
const cl = (v: number) => Math.max(0, Math.min(1, v)), sm = (v: number) => { const u = cl(v); return u * u * (3 - 2 * u); };
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
/** ease-out with overshoot (springy settle) */
const back = (v: number, k = 1.9) => { const u = cl(v) - 1; return 1 + (k + 1) * u * u * u + k * u * u; };
const u_ = (t: number, a: number, d: number) => sm((t - a) / d);
const LINES: [number, number, string][] = [[0, 4.0, '他们又生下大地[盖布]和天空[努特]。'], [4.0, 7.05, '这对兄妹，紧紧抱在一起。'], [7.05, 10.57, '父亲舒看不下去，把他们[撑开]——'], [10.57, 13.15, '从此，天在上，地在下。']];
const GODS = ['盖布', '努特', '舒'];
const W = FW, CY = (PIC_T + PIC_B) / 2;

/* ---------- shared drawing ---------- */
const Sky: React.FC<{a?: string; b?: string; dawn?: number}> = ({a = '#060A1E', b = '#1A2A60', dawn = 0}) => <g>
	<defs><linearGradient id="t61sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={a} /><stop offset="0.7" stopColor={b} /><stop offset="1" stopColor={dawn > 0 ? '#E89A5A' : b} /></linearGradient></defs>
	<rect x={-400} y={-300} width={W + 800} height={FH + 600} fill="url(#t61sky)" />
	{dawn > 0 && <ellipse cx={720} cy={900} rx={900} ry={300} fill="#FFB060" opacity={0.45 * dawn} filter="url(#t61b60)" />}</g>;
const StarField: React.FC<{seed: number; n: number; T: number; box?: [number, number, number, number]; o?: number}> = ({seed, n, T, box = [-300, -200, W + 300, 760], o = 1}) => {
	const R = rng(seed);
	return <g opacity={o}>{Array.from({length: n}, (_, i) => { const x = box[0] + R() * (box[2] - box[0]), y = box[1] + R() * (box[3] - box[1]), r = 0.8 + R() * 2.2, ph = R() * 6.3;
		return <circle key={i} cx={x} cy={y} r={r} fill="#E6ECFF" opacity={0.35 + 0.65 * (0.5 + 0.5 * Math.sin(T * (1 + R() * 2) + ph))} />; })}</g>;
};
const Defs: React.FC = () => <defs>
	<filter id="t61b6"><feGaussianBlur stdDeviation={6} /></filter><filter id="t61b20"><feGaussianBlur stdDeviation={20} /></filter><filter id="t61b60"><feGaussianBlur stdDeviation={60} /></filter>
	<radialGradient id="t61vig" cx="50%" cy="50%" r="72%"><stop offset="50%" stopColor="#000" stopOpacity={0} /><stop offset="100%" stopColor="#000" stopOpacity={0.75} /></radialGradient>
</defs>;
/** Earth band: Geb's land under him, a soil ridge with a little green */
const Land: React.FC<{y: number; c?: string}> = ({y, c = '#1E3A2A'}) => <g>
	<path d={`M-400 ${y + 20} C200 ${y - 10} 600 ${y + 6} 1000 ${y - 6} C1300 ${y - 14} 1600 ${y + 4} 1900 ${y} V1400 H-400Z`} fill={c} />
	<path d={`M-400 ${y + 20} C200 ${y - 10} 600 ${y + 6} 1000 ${y - 6} C1300 ${y - 14} 1600 ${y + 4} 1900 ${y}`} stroke="#3F7A55" strokeWidth={4} fill="none" opacity={0.7} /></g>;
/** foreground reeds (parallax, dark) */
const Reeds: React.FC<{x: number; y: number; n?: number; seed?: number; T: number; h?: number}> = ({x, y, n = 14, seed = 3, T, h = 220}) => {
	const R = rng(seed);
	return <g fill="none" stroke="#04060E" strokeLinecap="round">{Array.from({length: n}, (_, i) => { const bx = x + i * 26 + R() * 14, hh = h * (0.6 + R() * 0.5), a = 4 * Math.sin(T * 1.2 + i);
		return <path key={i} d={`M${bx} ${y}Q${bx + a} ${y - hh * 0.5} ${bx + a * 2 + (R() - 0.5) * 30} ${y - hh}`} strokeWidth={6 + R() * 4} />; })}</g>;
};
/** Geb lying (head to the left, face up); reach 0..1 lifts the near arm toward the sky, wake turns the head up */
const gebPose = (reach: number, wake: number, T: number): Pose => ({...POSES.rest, fs: lerp(4, 70, reach), fe: lerp(8, 20, reach), bs: -2, be: 6, rt: -3, at: 3, rk: 2, ak: 2, head: lerp(6, -8, wake) + 0.6 * Math.sin(T), neck: lerp(4, -4, wake), lean: 0});
const Geb: React.FC<{x: number; y: number; s: number; reach?: number; wake?: number; T: number; id: string}> = ({x, y, s, reach = 0, wake = 1, T, id}) =>
	<g transform={`rotate(-90 ${x} ${y})`}><God61 id={id} who="geb" pose={gebPose(reach, wake, T)} x={x} y={y} s={s} bProp="none" fProp="none" t={T} /></g>;
/* Shu poses: crouch under a low sky (arms bent up), the wind-up dip, the full lift */
const CROUCH0: Pose = {lean: 6, neck: -2, head: -10, bs: 150, be: 70, bw: -10, fs: 158, fe: 66, fw: -10, rt: 40, rk: 92, at: 70, ak: 96};
const DIP0: Pose = {...CROUCH0, lean: 10, head: -4, rt: 56, rk: 118, at: 86, ak: 124, be: 96, fe: 92};
const CROUCH = lerpPose(POSES.rest, CROUCH0, 0.62), DIP = lerpPose(POSES.rest, DIP0, 0.72);   // full values flip the leg solver; these read as a deep crouch

/* ---------- the six set-ups ---------- */
/** A 0–2.0 · Geb wakes and reaches up (close, push in, reeds slide past) */
const ShotA: React.FC<{t: number}> = ({t}) => { const T = t, pan = -60 * sm(t / 2), z = 1.0 + 0.06 * sm(t / 2);
	return <g transform={`translate(${W / 2},${CY}) scale(${z}) translate(${-W / 2 + pan},${-CY})`}>
		<Sky /><StarField seed={3} n={90} T={T} />
		<g transform={`translate(${pan * -0.6},0)`}><path d="M-300 760 C100 700 400 730 760 700 C1100 674 1400 720 1800 700 V1200 H-300Z" fill="#101C3A" /></g>
		<Land y={800} />
		<Geb id="ta" x={1660} y={812} s={44} reach={u_(t, 0.7, 1.0)} wake={u_(t, 0.2, 0.6)} T={T} />
		<g transform={`translate(${pan * 0.8},0)`}><Reeds x={-80} y={950} T={T} n={10} h={300} /><Reeds x={1220} y={950} T={T} seed={8} n={10} h={260} /></g>
	</g>; };
/** B 2.0–4.0 · Nut forms out of the stars (stars swirl into her arch, then the body and face fill in; tilt down) */
const ShotB: React.FC<{t: number}> = ({t}) => { const T = t + 2, k = u_(t, 0.1, 1.3), body = u_(t, 1.0, 0.7), tilt = 80 * (1 - sm(t / 2));
	const R = rng(17), x0 = 140, x1 = 1300, cx = 720, gy = 860, h = 460;
	const pt = (u: number): [number, number] => [(1 - u) ** 2 * x0 + 2 * (1 - u) * u * cx + u * u * x1, (1 - u) ** 2 * gy + 2 * (1 - u) * u * (gy - 2 * h) + u * u * gy];
	return <g transform={`translate(0,${-tilt})`}>
		<Sky /><StarField seed={5} n={110} T={T} o={1 - 0.5 * k} />
		{Array.from({length: 120}, (_, i) => { const u = i / 119, p = pt(u), sx = R() * W, sy = R() * 700 - 100, e = sm(k * 1.15 - R() * 0.15), off = (R() - 0.5) * 50;
			const x = lerp(sx, p[0], e), y = lerp(sy, p[1] + off, e); return <circle key={i} cx={x} cy={y} r={2 + R() * 3} fill="#FFF2C8" opacity={0.85 * (1 - body * 0.7)} />; })}
		<g opacity={body}><NutArch cx={cx} gy={gy} span={x1 - x0} h={h} w={80} seed={6} /></g>
		<ellipse cx={720} cy={400} rx={520} ry={200} fill="#6A7CFF" opacity={0.18 * k} filter="url(#t61b60)" />
		<Land y={880} />
	</g>; };
/** C 4.0–5.8 · Nut sinks onto Geb, the world darkens and closes in (low wide, slow push) */
const ShotC: React.FC<{t: number}> = ({t}) => { const T = t + 4, d = u_(t, 0.0, 1.5), h = lerp(440, 150, d), z = 1 + 0.05 * sm(t / 1.8);
	return <g transform={`translate(${W / 2},${CY}) scale(${z}) translate(${-W / 2},${-CY})`}>
		<Sky /><StarField seed={7} n={90} T={T} o={1 - 0.7 * d} />
		<Land y={860} />
		<Geb id="tc" x={1150} y={846} s={24} reach={0.6 + 0.3 * d} T={T} />
		<NutArch cx={700} gy={845} span={980} h={h} w={84} seed={4} />
		<rect x={-200} y={-200} width={W + 400} height={FH + 400} fill="#02040E" opacity={0.45 * d} />
		<rect x={-200} y={-200} width={W + 400} height={FH + 400} fill="url(#t61vig)" opacity={0.6 + 0.4 * d} />
	</g>; };
/** C2 5.8–7.05 · their faces meet (close-up), a small warm light between them, a slow drift */
const ShotC2: React.FC<{t: number}> = ({t}) => { const T = t + 5.8, dr = 20 * sm(t / 1.25), s = 64;
	return <g transform={`translate(${-dr},0)`}>
		<rect x={-200} y={-200} width={W + 400} height={FH + 400} fill="#05081A" />
		<StarField seed={9} n={50} T={T} o={0.5} />
		<ellipse cx={640} cy={540} rx={300} ry={150} fill="#FFB866" opacity={0.28 + 0.06 * Math.sin(T * 2)} filter="url(#t61b60)" />
		{/* Nut from above (lying face-down, head to the left) and Geb below (face-up, head to the left) */}
		<g transform={`rotate(-90 1760 418)`}><God61 id="tc2n" who="nut" pose={{...POSES.rest, head: -6 + 2 * Math.sin(T * 1.3), neck: -4}} x={1760} y={418} s={s} face={-1} t={T} /></g>
		<Geb id="tc2g" x={1800} y={668} s={s} reach={0.05} wake={1} T={T} />
		<rect x={-200} y={-200} width={W + 400} height={FH + 400} fill="url(#t61vig)" />
	</g>; };
/** D 7.05–8.6 · Shu walks in under the pressing sky, stops, looks up, sinks into a crouch (medium, truck with him) */
const ShotD: React.FC<{t: number}> = ({t}) => { const T = t + 7.05, s = 15, wl = cl(t / 0.95), dist = 330 * sm(wl * 0.9 + 0.1 * wl), ph = dist / (STRIDE * s);
	const stop = u_(t, 0.85, 0.3), cr = u_(t, 1.1, 0.4), x = 420 + dist, pan = -dist * 0.5;
	const pose = lerpPose(lerpPose(walkPose(ph, {stride: 1}), {...P61.rest(T), head: -16, neck: -6}, stop), CROUCH, cr);
	return <g transform={`translate(${W / 2},${CY}) scale(1.25) translate(${-W / 2 + pan},${-CY})`}>
		<rect x={-400} y={-300} width={W + 800} height={FH + 600} fill="#070A1C" />
		<NutArch cx={760} gy={860} span={1500} h={250} w={110} seed={11} />
		<Land y={866} c="#152A20" />
		<Geb id="td" x={1700} y={858} s={18} reach={0.9} T={T} />
		<God61 id="tds" who="shu" pose={pose} x={x} y={GY} s={s} bProp="none" fProp="none" t={T} />
		{cr > 0.3 && <path d={`M${x - 60} ${GY + 4}q60 -10 120 0`} stroke="#3F7A55" strokeWidth={3} fill="none" opacity={cr} />}
		<rect x={-400} y={-300} width={W + 800} height={FH + 600} fill="url(#t61vig)" />
	</g>; };
/** E 8.6–10.57 · the push: wind-up dip, explosion upward (low angle hero; shockwave, dust, star streaks, flash), he grows to a giant */
const ShotE: React.FC<{t: number}> = ({t}) => { const T = t + 8.6, dip = u_(t, 0.0, 0.25), go = cl((t - 0.3) / 0.55), k = back(go, 1.6), grow = back(cl((t - 0.35) / 0.9), 1.2);
	const s = lerp(17, 27, grow), pose = go > 0 ? lerpPose(DIP, P61.lift(T), Math.min(1.08, k)) : lerpPose(CROUCH, DIP, dip);
	const handY = go > 0 ? lerp(GY - 11.5 * s, GY - 23.6 * s, Math.min(1, k)) : GY - lerp(11.5, 9.8, dip) * s, h = 850 - handY;
	const boom = cl((t - 0.3) / 0.9), flash = Math.max(0, 1 - Math.abs(t - 0.36) / 0.12), z = lerp(1.35, 1.0, sm((t - 0.3) / 1.4)), sh = 6 * Math.max(0, 1 - (t - 0.3) / 0.4) * (t > 0.3 ? 1 : 0);
	const R = rng(29);
	return <g transform={`translate(${W / 2},${CY + 40}) scale(${z}) translate(${-W / 2},${-CY - 40 + sh * Math.sin(t * 90)})`}>
		<Sky a="#050818" b="#1A2660" /><StarField seed={13} n={80} T={T} />
		{go > 0 && Array.from({length: 40}, (_, i) => { const x = R() * W, y0 = R() * 900, L = 60 + 260 * (1 - boom); return <line key={i} x1={x} y1={y0} x2={x} y2={y0 + L} stroke="#CFE0FF" strokeWidth={2 + R() * 2} opacity={0.6 * (1 - boom)} />; })}
		<NutArch cx={720} gy={850} span={1300} h={h} w={84} seed={13} />
		<Land y={872} />
		<Geb id="te" x={1500} y={866} s={16} reach={0.9} T={T} />
		{go > 0 && <g>
			<ellipse cx={720} cy={GY + 4} rx={60 + 700 * boom} ry={14 + 70 * boom} fill="none" stroke="#FFFFFF" strokeWidth={10 * (1 - boom)} opacity={1 - boom} />
			<ellipse cx={720} cy={GY + 4} rx={40 + 420 * boom} ry={10 + 40 * boom} fill="none" stroke="#9FD8FF" strokeWidth={6 * (1 - boom)} opacity={1 - boom} />
			{Array.from({length: 36}, (_, i) => { const a = Math.PI + (i / 35) * Math.PI, d = 40 + 520 * boom * (0.6 + R() * 0.6); return <circle key={i} cx={720 + Math.cos(a) * d} cy={GY + Math.sin(a) * d * 0.35 - 30 * boom} r={(6 + R() * 10) * (1 - 0.6 * boom)} fill="#6A5A3A" opacity={0.8 * (1 - boom)} />; })}
			{Array.from({length: 18}, (_, i) => { const a = -Math.PI / 2 + (i - 8.5) * 0.16; return <path key={i} d={`M${720 + Math.cos(a) * 120} ${GY - 200 + Math.sin(a) * 120}L${720 + Math.cos(a) * (300 + 500 * boom)} ${GY - 200 + Math.sin(a) * (300 + 500 * boom)}`} stroke="#FFFFFF" strokeWidth={3} opacity={0.5 * (1 - boom)} />; })}
		</g>}
		<God61 id="tes" who="shu" pose={pose} x={720} y={GY} s={s} bProp="none" fProp="none" t={T} />
		<rect x={-400} y={-300} width={W + 800} height={FH + 600} fill="#FFFFFF" opacity={0.55 * flash} />
		<rect x={-400} y={-300} width={W + 800} height={FH + 600} fill="url(#t61vig)" opacity={0.7} />
	</g>; };
/** F 10.57–13.15 · the new world: dawn floods in, papyrus sprouts along Geb, birds cross, the camera cranes up and back */
const ShotF: React.FC<{t: number}> = ({t}) => { const T = t + 10.57, dawn = u_(t, 0.0, 1.6), z = lerp(1.12, 1.0, sm(t / 2.6)), cy = lerp(40, -10, sm(t / 2.6));
	return <g transform={`translate(${W / 2},${CY}) scale(${z}) translate(${-W / 2},${-CY + cy})`}>
		<SetDefs61 />
		<Sky a="#0A1236" b="#33427A" dawn={dawn} />
		<StarField seed={15} n={70} T={T} box={[-300, -200, W + 300, 420]} />
		<ellipse cx={720} cy={860} rx={260 + 140 * dawn} ry={70 + 30 * dawn} fill="#FFE2A0" opacity={0.7 * dawn} filter="url(#t61b20)" />
		<NutArch cx={720} gy={850} span={1300} h={620} w={76} seed={13} />
		<g opacity={0.9}><BirdsCrossing x={0} y={300} s={14} t={T + 6} n={7} w={1440} period={7} color="#1A1430" /></g>
		<Land y={872} c="#21452F" />
		{[0, 1, 2, 3, 4, 5].map((i) => { const g = back(cl((t - 0.3 - i * 0.18) / 0.7), 1.4), x = [170, 330, 560, 900, 1110, 1290][i]; return <g key={i} transform={`translate(${x},880) scale(1,${Math.max(0.01, g)}) translate(${-x},-880)`}>
			<PapyrusThicket x={x} y={880} s={9} t={T} w={9} h={13} n={7} seed={i + 2} /></g>; })}
		<Geb id="tf" x={1290} y={866} s={14} reach={0.2} T={T} />
		<God61 id="tfs" who="shu" pose={P61.lift(T)} x={720} y={GY} s={27} bProp="none" fProp="none" t={T} />
		<rect x={-400} y={-300} width={W + 800} height={FH + 600} fill="url(#t61vig)" opacity={0.55} />
	</g>; };

const SHOTS_T: [number, number, React.FC<{t: number}>][] = [[0, 2.0, ShotA], [2.0, 4.0, ShotB], [4.0, 5.8, ShotC], [5.8, 7.05, ShotC2], [7.05, 8.6, ShotD], [8.6, 10.57, ShotE], [10.57, DUR, ShotF]];
const Test61: React.FC = () => {
	const t = useCurrentFrame() / FPS, i = Math.max(0, SHOTS_T.findIndex(([a, b]) => t >= a && t < b)), [a, , Shot] = SHOTS_T[i === -1 ? SHOTS_T.length - 1 : i];
	return <InMaster60.Provider value={true}><AbsoluteFill style={{background: FC.navy}}>
		<svg width={FW} height={FH} viewBox={`0 0 ${FW} ${FH}`} style={{position: 'absolute', inset: 0}}>
			<Defs /><SetDefs61 />
			<defs><clipPath id="t61pic"><rect x={0} y={PIC_T} width={FW} height={PIC_B - PIC_T} /></clipPath></defs>
			<g clipPath="url(#t61pic)"><Shot t={t - a} /></g>
		</svg>
		<AbsoluteFill><Bands t={t} />
			{LINES.filter(([a0, b0]) => t >= a0 - 0.2 && t < b0 + 0.2).map(([a0, b0, text]) => <Subtitle key={a0} t={t} sub={{text, t0: a0, t1: b0}} gods={GODS} />)}</AbsoluteFill>
	</AbsoluteFill></InMaster60.Provider>;
};
void PAL;
registerRoot(() => <Composition id="TEST61" component={Test61} durationInFrames={Math.round(DUR * FPS)} fps={FPS} width={FW} height={FH} />);
