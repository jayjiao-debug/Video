import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Zun, lookAt, ZunLight, V3, Cam, proj, toCam, scr} from './zun55h';
import {sm, pth, f1, rnd, P, Glow, Haze, Vig, Plume, tube, Person} from './kf55h';
import {Body, Sil, Sk, kneel} from './rig55h';
import {TitleText, SilZun, LY, LYlow, TBack} from './kfall55h';
import {homeCam, rotL} from './home55h';
import {FilmOv2} from './ov55v2';
import {card2} from './cards55v2';
import {cl, seg, ease, eio, lerp, lerpP, BEAT, BT, zunCam, beaks, armFK, poseFK, trackN, track, Glyphs55, Cowrie, CowrieString, YCam, layerT,
	Yard1965, PlatformScale1965, Worker1965, Tag30w, ZREST, DECK1965, worker1965, beam1965, tagSwing1965, ik2} from './act551k';
/* ep55 何尊 v2 · act 1 (builder 1): the cards 1, 2, T, A, B, C, D, E, F — film 0 → 42.2 s. Act1({t}) renders the full frame. */
const W = 1920, H = 1080;
const land = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : 1 - Math.exp(-6 * u) * Math.cos(9 * u));
const flick = (t: number, s: number) => 0.85 + 0.1 * Math.sin(t * 7.3 + s) + 0.05 * Math.sin(t * 17.1 + s * 2);
const dimL = (L: ZunLight, k: number): ZunLight => ({...L, k: L.k * k, amb: L.amb * (0.35 + 0.65 * k), spec: L.spec * k, rim: L.rim ? {...L.rim, k: L.rim.k * (0.6 + 0.4 * k)} : undefined});

/* ============================== common bits ============================== */
const Shell: React.FC<{t: number; id: string; bg: string; vig?: number; children: React.ReactNode; top?: React.ReactNode; hideCounter?: boolean}> = ({t, id, bg, vig = 0.6, children, top, hideCounter}) =>
	<AbsoluteFill style={{background: bg}}>
		<svg width={W} height={H} style={{position: 'absolute'}}>{children}</svg>
		<svg width={W} height={H} style={{position: 'absolute'}}><Vig id={`v1${id}`} a={vig} /></svg>
		{top}
		<FilmOv2 t={t} c={card2(id)} hideCounter={hideCounter} />
	</AbsoluteFill>;
/** particles rising (embers, sparks, dust) — each drifts on its own clock */
const Rising: React.FC<{t: number; n: number; x0: number; x1: number; y0: number; y1: number; c: string; seed: number; v: number; o?: number; r?: number; sway?: number}> = ({t, n, x0, x1, y0, y1, c, seed, v, o = 0.6, r = 2.4, sway = 12}) => <g>
	{Array.from({length: n}, (_, i) => { const h = y1 - y0, y = y1 - (((rnd(i, seed + 1) * h) + t * v * (0.6 + 0.8 * rnd(i, seed + 5))) % h), x = x0 + rnd(i, seed) * (x1 - x0) + Math.sin(t * 0.9 + i) * sway;
		return <circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r={(0.6 + rnd(i, seed + 2) * r).toFixed(2)} fill={c} opacity={o * (0.3 + 0.7 * rnd(i, seed + 3))} />; })}</g>;
/** dust motes drifting slowly in a light beam (they wander, they do not just rise) */
const Drift: React.FC<{t: number; n: number; x0: number; x1: number; y0: number; y1: number; c: string; seed: number; o?: number; r?: number; vx?: number}> = ({t, n, x0, x1, y0, y1, c, seed, o = 0.5, r = 2.2, vx = -14}) => <g>
	{Array.from({length: n}, (_, i) => { const w = x1 - x0, hh = y1 - y0, x = x0 + (((rnd(i, seed) * w + t * vx * (0.5 + rnd(i, seed + 4))) % w) + w) % w, y = y0 + rnd(i, seed + 1) * hh + Math.sin(t * (0.5 + rnd(i, seed + 6)) + i) * 18;
		const tw = 0.55 + 0.45 * Math.sin(t * (1.5 + 2 * rnd(i, seed + 7)) + i * 3);
		return <circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r={(0.6 + rnd(i, seed + 2) * r).toFixed(2)} fill={c} opacity={o * tw * (0.3 + 0.7 * rnd(i, seed + 3))} />; })}</g>;
/** a soft blur group (out-of-focus foreground / background) */
const Blur: React.FC<{id: string; s: number; children: React.ReactNode}> = ({id, s, children}) => s < 0.3 ? <g>{children}</g> : <g>
	<defs><filter id={id} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={s.toFixed(2)} /></filter></defs><g filter={`url(#${id})`}>{children}</g></g>;

/* ============================== 1 · 0.00 the scrap yard: the heave, the thud, the 30元 tag (crane down) ============================== */
const K1 = 4.4, WX = 1280, WY = 958;
const S1b = (b: P): P => [WX - K1 * b[0], WY + K1 * b[1]];
/** a 2.5D camera that puts world point F at screen point G at zoom s */
const camFocus = (F: P, G: P, s: number): YCam => ({x: (F[0] - 960) * s + 960 - G[0], y: (F[1] - 540) * s + 540 - G[1], s});
const mixCam = (a: YCam, b: YCam, u: number): YCam => ({x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), s: lerp(a.s, b.s, u)});
const S1: React.FC<{t: number}> = ({t}) => {
	const cr = ease(seg(t, 0, 1.75)), push = ease(seg(t, 2.0, 5.97)), drift = ease(seg(t, 1.6, 2.6));
	const sh = t > 1.45 ? 5 * Math.exp(-(t - 1.45) * 9) * Math.sin((t - 1.45) * 55) : 0;
	const restS = S1b(ZREST), c0: YCam = {x: 18 * drift, y: lerp(-260, 0, cr) + 20 * drift, s: 1 + 0.03 * drift}, c1 = camFocus([restS[0] + 10, restS[1] - 95], [990, 690], 1.72);
	const cm = mixCam(c0, c1, push), cam: YCam = {...cm, y: cm.y + sh};
	const w = worker1965(t), rest = S1b(ZREST), zc = zunCam(rest[0], rest[1], K1, 30, 6);
	const zo: P = [-K1 * w.zun[0], K1 * w.zun[1]], up = -w.zun[1];
	const bk = beaks(zc).reduce((a, q) => (q[0] > a[0] ? q : a)), beak: P = [bk[0] + zo[0], bk[1] + zo[1]];
	const deck = S1b(DECK1965);
	/* the tag: in his near hand while he writes, then tied to the beak and swinging */
	let tag: React.ReactNode = null;
	if (w.tag === 'hand') { const h = S1b(w.tagAt); tag = <Tag30w x={h[0] - 8} y={h[1] - 4} rot={-8 + 3 * Math.sin(t * 3)} write={w.write} anchor={t > 4.5 ? beak : null} s={0.95} id="a1tg" />; }
	else if (w.tag === 'hung') { const sw = tagSwing1965(t), a = (sw * Math.PI) / 180, L = 30; tag = <Tag30w x={beak[0] + L * Math.sin(a) + 6} y={beak[1] + L * Math.cos(a)} rot={-sw - 4} write={1} anchor={beak} s={0.95} id="a1tg" />; }
	const thud = seg(t, 1.45, 2.3), puff = t >= 1.45 && t < 2.4;
	const pen = w.pencil ? (() => { const h = S1b(w.s.hF), d: P = [-K1 * 9, K1 * 2.5]; return <path d={`M${f1(h[0])},${f1(h[1])} L${f1(h[0] + d[0])},${f1(h[1] + d[1])}`} stroke="#B89060" strokeWidth={3} strokeLinecap="round" />; })() : null;
	return <Shell t={t} id="1" bg="#0E0B0A" vig={0.55}>
		<Yard1965 cam={cam} t={t} id="a1y" />
		<g transform={layerT(cam, 1)}>
			{/* the low sun beam from the right, dust in it */}
			<path d="M1960,420 L1960,700 L980,960 L860,880 Z" fill="#FFC890" opacity={0.07} />
			<PlatformScale1965 x={deck[0]} y={deck[1]} k={K1} beam={beam1965(t)} poise={0.55} side="L" />
			<ellipse cx={rest[0] + 6} cy={rest[1] + 2} rx={78} ry={9} fill="#000" opacity={0.5 * (1 - cl(up / 30))} />
			<Worker1965 s={w.s} x={WX} y={WY} k={K1} id="a1wb" flip part="back" />
			<g transform={`translate(${f1(zo[0])},${f1(zo[1])}) rotate(${f1(-w.tilt)} ${f1(rest[0])} ${f1(rest[1] - 80)})`}>
				<Zun cam={zc} light={rotL(LY, 30)} id="a1z" patina={0.95} shadow={false} inscription={false} /></g>
			<Worker1965 s={w.s} x={WX} y={WY} k={K1} id="a1wf" flip part="front" />
			{pen}{tag}
			{puff && Array.from({length: 18}, (_, i) => { const a = (i / 18) * Math.PI, sp = 60 + 90 * rnd(i, 3), r = thud * sp;
				return <circle key={i} cx={rest[0] + Math.cos(a) * r * 1.6 * (i % 2 ? 1 : -1)} cy={rest[1] - Math.sin(a) * r * 0.35 - 4} r={3 + 9 * thud * rnd(i, 4)} fill="#C8A47A" opacity={0.4 * (1 - thud)} />; })}
			<Drift t={t} n={60} x0={760} x1={1700} y0={420} y1={940} c="#FFE2B8" seed={11} o={0.55} r={2.6} />
		</g>
		{/* foreground scrap, out of focus, rising into frame during the crane */}
		<g transform={layerT(cam, 1.3)}><Blur id="a1fb" s={5}>
			<g fill="#0C0907"><ellipse cx={150} cy={1070} rx={150} ry={60} /><path d="M330,1100 L380,1010 L560,1000 L620,1100 Z" />
				<circle cx={1760} cy={1040} r={90} fill="none" stroke="#0C0907" strokeWidth={18} /><path d="M1580,1100 L1640,1020 L1900,990 L1960,1100 Z" /></g>
			<path d="M1680,1000 L1840,1080" stroke="#3A2618" strokeWidth={14} strokeLinecap="round" /></Blur></g>
		<g transform={layerT(cam, 2.3)}><Blur id="a1fd" s={8}>
			<path d="M420,1180 L430,800 C470,780 590,780 630,800 L640,1180 Z" fill="#0C0806" /><path d="M430,800 C470,780 590,780 630,800" stroke="#FFB070" strokeWidth={5} fill="none" opacity={0.35} />
			<path d="M640,940 L860,1000" stroke="#0C0806" strokeWidth={34} strokeLinecap="round" /></Blur></g>
		<Rising t={t} n={40} x0={200} x1={1700} y0={200} y1={1000} c="#FFE2B8" seed={13} v={30} o={0.35} r={2.4} />
	</Shell>; };

/* ============================== 2 · 5.98 a low dolly across the scrap to the 饕餮's eye; the light dies ============================== */
const camAt = (az: number, el: number, D: number, T: V3, f: number, cx = 960, cy = 560): Cam => { const a = (az * Math.PI) / 180, e = (el * Math.PI) / 180;
	return lookAt([T[0] + D * Math.cos(e) * Math.cos(a), T[1] + D * Math.cos(e) * Math.sin(a), T[2] + D * Math.sin(e)], T, f, cx, cy); };
type Junk = {p: V3; kind: 'wheel' | 'pipe' | 'pot' | 'coil' | 'plate' | 'gear'; s: number; a?: number};
const JUNK: Junk[] = [
	{p: [150, 175, -14], kind: 'wheel', s: 34, a: 20}, {p: [118, 128, -14], kind: 'pipe', s: 60, a: -25}, {p: [96, 88, -14], kind: 'pot', s: 15},
	{p: [140, 60, -14], kind: 'coil', s: 18}, {p: [80, 150, -14], kind: 'plate', s: 22, a: 12}, {p: [165, 110, -14], kind: 'gear', s: 16},
	{p: [-70, 90, -14], kind: 'pot', s: 16}, {p: [-40, -90, -14], kind: 'wheel', s: 30, a: -10}, {p: [-90, -20, -14], kind: 'coil', s: 20},
];
const junkEl = (j: Junk, q: [number, number, number], k: number, i: number, rimC: string) => { const s = j.s * k, x = q[0], y = q[1];
	switch (j.kind) {
		case 'wheel': return <g key={i}><ellipse cx={x} cy={y - s} rx={s * 0.45} ry={s} fill="none" stroke="#120D0A" strokeWidth={s * 0.18} />
			{[0, 1, 2, 3].map((m) => <path key={m} d={`M${f1(x)},${f1(y - s)} L${f1(x + s * 0.42 * Math.cos(m * 0.8 + (j.a ?? 0)))},${f1(y - s + s * 0.95 * Math.sin(m * 0.8 + (j.a ?? 0)))}`} stroke="#120D0A" strokeWidth={s * 0.07} />)}
			<ellipse cx={x + s * 0.06} cy={y - s} rx={s * 0.45} ry={s} fill="none" stroke={rimC} strokeWidth={2} strokeOpacity={0.45} strokeDasharray={`${f1(s * 1.2)} ${f1(s * 9)}`} /></g>;
		case 'pipe': { const a = ((j.a ?? 0) * Math.PI) / 180, dx = Math.cos(a) * s, dy = Math.sin(a) * s * 0.3;
			return <g key={i}><path d={`M${f1(x - dx)},${f1(y - s * 0.12 - dy)} L${f1(x + dx)},${f1(y - s * 0.12 + dy)}`} stroke="#15100C" strokeWidth={s * 0.2} strokeLinecap="round" />
				<path d={`M${f1(x - dx)},${f1(y - s * 0.2 - dy)} L${f1(x + dx)},${f1(y - s * 0.2 + dy)}`} stroke={rimC} strokeWidth={2} strokeOpacity={0.5} /></g>; }
		case 'pot': return <g key={i}><path d={sm([[x - s, y], [x - s * 1.05, y - s * 0.9], [x - s * 0.6, y - s * 1.3], [x + s * 0.6, y - s * 1.3], [x + s * 1.05, y - s * 0.9], [x + s, y]])} fill="#17110D" />
			<ellipse cx={x} cy={y - s * 1.3} rx={s * 0.62} ry={s * 0.16} fill="#0A0705" /><path d={`M${f1(x + s * 0.7)},${f1(y - s * 1.25)} Q${f1(x + s * 1.1)},${f1(y - s * 0.6)} ${f1(x + s)},${f1(y)}`} fill="none" stroke={rimC} strokeWidth={2} strokeOpacity={0.5} /></g>;
		case 'coil': return <g key={i}>{[0, 1, 2, 3].map((m) => <ellipse key={m} cx={x + m * s * 0.12} cy={y - s * 0.4 - m * s * 0.08} rx={s} ry={s * 0.4} fill="none" stroke={m === 3 ? rimC : '#15100C'} strokeWidth={m === 3 ? 2 : s * 0.1} strokeOpacity={m === 3 ? 0.5 : 1} />)}</g>;
		case 'plate': return <g key={i}><path d={pth([[x - s, y], [x - s * 0.7, y - s * 1.1], [x + s * 0.9, y - s * 0.8], [x + s, y]])} fill="#1A130F" /><path d={`M${f1(x - s * 0.7)},${f1(y - s * 1.1)} L${f1(x + s * 0.9)},${f1(y - s * 0.8)}`} stroke={rimC} strokeWidth={2} strokeOpacity={0.5} /></g>;
		default: return <g key={i}><circle cx={x} cy={y - s} r={s} fill="#15100C" />{Array.from({length: 10}, (_, m) => { const a = (m / 10) * 2 * Math.PI; return <rect key={m} x={x + Math.cos(a) * s - s * 0.12} y={y - s + Math.sin(a) * s - s * 0.12} width={s * 0.24} height={s * 0.24} fill="#15100C" />; })}<circle cx={x} cy={y - s} r={s * 0.3} fill="#0A0705" /></g>;
	} };
const S2: React.FC<{t: number}> = ({t}) => { const a = 5.98, b = 9.03, u = ease(seg(t, a, b - 0.1)), uE = eio(seg(t, a + 0.2, b - 0.1));
	const az = lerp(66, 14, u), el = lerp(4, 1.5, u), D = Math.exp(lerp(Math.log(250), Math.log(70), uE)), T: V3 = [lerp(0, 9.6, uE), lerp(0, 4.6, uE), lerp(19, 14.8, uE)];
	const f = lerp(1750, 2500, uE), cam = camAt(az, el, D, T, f, 960, 600);
	const dim = ease(seg(t, b - 1.13, b - 0.05)), Lz = dimL(rotL(LYlow, 30), 1 - 0.88 * dim);
	/* the far yard parallax from a world point far behind the 尊 */
	const cam0 = camAt(66, 4, 250, [0, 0, 19], 1750, 960, 600), F: V3 = [-3000, -1200, 200], bx = (proj(cam, F)[0] - proj(cam0, F)[0]) * 0.25;
	const bgS = 1 + 0.25 * uE, bgBlur = 2 + 10 * uE;
	/* the deck top around the 尊 (the scale's platform, 80 × 60 cm, its top at the 尊's base z = 0) */
	const dk = ([[-40, -30, 0], [40, -30, 0], [40, 30, 0], [-40, 30, 0]] as V3[]).map((q) => proj(cam, q));
	const dkF = ([[40, -30, 0], [40, 30, 0], [40, 30, -12], [40, -30, -12]] as V3[]).map((q) => proj(cam, q)), dkS = ([[-40, 30, 0], [40, 30, 0], [40, 30, -12], [-40, 30, -12]] as V3[]).map((q) => proj(cam, q));
	const zd = proj(cam, [0, 0, 19])[2];
	const junk = JUNK.map((j, i) => ({j, i, q: proj(cam, j.p)})).filter((o) => o.q[2] > 25).sort((x, y) => y.q[2] - x.q[2]);
	const rimC = '#FFB070';
	const jEl = (o: {j: Junk; i: number; q: [number, number, number]}) => { const k = f / o.q[2], bl = Math.min(14, Math.abs(o.q[2] - zd) / zd * 9);
		return <Blur key={o.i} id={`a2j${o.i}`} s={bl}>{junkEl(o.j, o.q, k, o.i, rimC)}</Blur>; };
	return <Shell t={t} id="2" bg="#0E0A08" vig={0.6 + 0.15 * dim}>
		<g opacity={1 - 0.75 * dim}><Blur id="a2bg" s={bgBlur}><g transform={`translate(960 600) scale(${bgS.toFixed(3)}) translate(-960 -600)`}><Yard1965 cam={{x: -bx, y: 40, s: 1}} t={t} dim={dim} id="a2y" /></g></Blur></g>
		<rect width={W} height={H} fill="#1A0606" opacity={0.6 * dim} />
		{/* the sun beam with dust */}
		<path d="M1960,250 L1960,760 L760,1080 L560,900 Z" fill="#FFC890" opacity={0.1 * (1 - dim)} />
		{junk.filter((o) => o.q[2] > zd).map(jEl)}
		<path d={pth(dk.map((q) => [q[0], q[1]] as P))} fill="#2A2420" opacity={0.95} />
		<path d={pth(dkF.map((q) => [q[0], q[1]] as P))} fill="#1E1A18" /><path d={pth(dkS.map((q) => [q[0], q[1]] as P))} fill="#262120" />
		<path d={`M${f1(dk[1][0])},${f1(dk[1][1])} L${f1(dk[2][0])},${f1(dk[2][1])}`} stroke="#C99A6A" strokeWidth={2} strokeOpacity={0.55 * (1 - dim)} />
		<Zun cam={cam} light={Lz} id="a2z" patina={0.95} shadow inscription={false} />
		{dim > 0.02 && <g opacity={dim * dim}><SilZun cam={cam} id="a2s" rim="#FFB060" halo="#8A2A10" haloO={0.5} rimO={0.9} /></g>}
		{junk.filter((o) => o.q[2] <= zd).map(jEl)}
		<Drift t={t} n={90} x0={300} x1={1900} y0={200} y1={1040} c="#FFE2B8" seed={31} o={0.6 * (1 - dim)} r={2.8} vx={-30} />
	</Shell>; };

/* ============================== T · 9.03 the title on drop 1; a slow push; the halo swells into the rising sun ============================== */
const SUN: P = [1000, 560];
const ST: React.FC<{t: number}> = ({t}) => { const a = 9.03, b = 15.03, cam = homeCam(30);
	const push = 1 + 0.13 * ease(seg(t, a, b)), sunU = ease(seg(t, b - 0.7, b)), s = 1 + 0.18 * (1 - land(seg(t, a, a + 0.5))), flash = Math.exp(-(t - a) * 7);
	const beat = 0.5 + 0.5 * Math.cos(((t - 1.4498) / BEAT) * 2 * Math.PI), tOut = 1 - ease(seg(t, b - 0.5, b - 0.12));
	return <Shell t={t} id="T" bg="#070403" vig={0.75 - 0.5 * sunU}
		top={<div style={{position: 'absolute', inset: 0, opacity: tOut, transform: `scale(${(s * (1 + 0.03 * ease(seg(t, a + 0.5, b)))).toFixed(4)})`, transformOrigin: '50% 60%', filter: `brightness(${(1 + 0.8 * flash + 0.1 * beat).toFixed(3)})`}}><TitleText /></div>}>
		<TBack heat={0.35} />
		<Glow x={960} y={600} r={760} c="#FF9A40" o={0.1 + 0.32 * beat} id="tbt" sy={0.8} />
		<Glow x={960} y={600} r={620} c="#FFD088" o={0.55 * flash} id="tfl" />
		{/* the sun being born behind the silhouette */}
		<Glow x={lerp(960, SUN[0], sunU)} y={lerp(620, SUN[1], sunU)} r={lerp(300, 1100, sunU)} c="#FFC878" o={0.9 * sunU} id="tsn" sy={0.8} />
		<circle cx={SUN[0]} cy={SUN[1]} r={lerp(20, 95, sunU)} fill="#FFF0C8" opacity={sunU} />
		<g transform={`translate(960 620) scale(${push.toFixed(4)}) translate(-960 -620)`} opacity={1 - 0.45 * Math.pow(sunU, 3)}>
			<SilZun cam={cam} id="tsz" rim="#FFD088" halo={'#FF9A40'} haloO={0.9} rimO={1 - 0.6 * sunU} />
		</g>
		<Glow x={SUN[0]} y={SUN[1]} r={lerp(200, 760, sunU)} c="#FFE6B0" o={0.7 * sunU * sunU} id="tsb" />
		<circle cx={SUN[0]} cy={SUN[1]} r={88} fill="#FFF2D0" opacity={0.85 * Math.pow(sunU, 3)} />
		<Rising t={t} n={140} x0={100} x1={1820} y0={80} y1={1060} c="#FFB060" seed={77} v={110} o={0.7} r={3.6} />
		{/* big out-of-focus embers drifting past the lens */}
		<Blur id="tbk" s={6}><Rising t={t} n={26} x0={0} x1={1920} y0={-100} y1={1180} c="#FF9A40" seed={79} v={190} o={0.55} r={20} sway={70} /></Blur>
	</Shell>; };

/* ============================== people of the 西周 cards ============================== */
/** 周武王 / 周成王: kingrobe + 冕, facing +x; arms by joint angles (up, bend), the head tilt (− = looking up) */
export const King55: React.FC<{x: number; y: number; k: number; id: string; upN: number; bendN: number; upF: number; bendF: number; lean?: number; tilt?: number; flip?: boolean; rim?: string; lx?: number; ly?: number; stride?: number; fill?: string}> =
	({x, y, k, id, upN, bendN, upF, bendF, lean = 0, tilt = 0, flip, rim = '#FFD8A0', lx = 1, ly = 0.1, stride = 0.2, fill}) => {
	const hip: P = [0, -92], a = (lean * Math.PI) / 180, sh: P = [hip[0] + 50 * Math.sin(a), hip[1] - 50 * Math.cos(a)], hd: P = [sh[0] + 18 * Math.sin(a + 0.1), sh[1] - 18 * Math.cos(a + 0.1)];
	const n = armFK(sh, upN, bendN), fa = armFK([sh[0] - 1, sh[1] - 1], upF, bendF);
	const s: Sk = {hip, sh, hd, kN: [10 * stride + 3, -48], fN: [24 * stride + 4, -8], kF: [-8 * stride, -48], fF: [-22 * stride, -8], hN: n.h, hF: fa.h, eN: n.e, eF: fa.e, tilt};
	return <Sil id={id} x={x} y={y} k={k} flip={flip} rim={rim} lx={lx} ly={ly} fill={fill}><Body s={s} dress="kingrobe" hat="mian" /></Sil>; };
/** a kneeling 宗小子 (robe + 冠): bow (deg) and head tilt; hands joined (拱手) */
export const Noble55: React.FC<{x: number; y: number; k: number; id: string; bow?: number; tilt?: number; flip?: boolean; rim?: string; lx?: number; ly?: number; fill?: string; o?: number; rimW?: number}> =
	({x, y, k, id, bow = 14, tilt, flip, rim = '#FFB870', lx = 1, ly = 0.15, fill, o, rimW}) => { const s = kneel(bow); if (tilt !== undefined) s.tilt = tilt;
	return <Sil id={id} x={x} y={y} k={k} flip={flip} rim={rim} lx={lx} ly={ly} fill={fill} o={o} rimW={rimW}><Body s={s} dress="robe" hat="guan" /></Sil>; };
/** a banner on a pole: the cloth waves (a travelling wave), pole foot at (x, y), height h px, cloth w × L px */
const Banner: React.FC<{x: number; y: number; h: number; L: number; w: number; t: number; seed: number; c?: string; rim?: string; dir?: number}> = ({x, y, h, L, w, t, seed, c = '#4A1610', rim = '#FFB870', dir = 1}) => {
	const top: P = [x, y - h], n = 9, edge = (side: number) => Array.from({length: n + 1}, (_, i) => { const u = i / n, wv = Math.sin(u * 5 - t * 4.2 + seed) * 10 * u;
		return [top[0] + dir * (w * side + wv * 0.5 + u * 6), top[1] + 6 + u * L + wv * 0.25] as P; });
	const a = edge(0), b = edge(1);
	return <g><path d={`M${f1(x)},${f1(y)} L${f1(top[0])},${f1(top[1] - 10)}`} stroke="#0E0806" strokeWidth={Math.max(2, h * 0.012)} />
		<path d={sm([...a, ...b.reverse()])} fill={c} /><path d={sm(b.reverse(), false)} fill="none" stroke={rim} strokeWidth={1.6} strokeOpacity={0.5} />
		<path d={pth([[top[0] - 8, top[1] - 6], [top[0], top[1] - 22], [top[0] + 8, top[1] - 6]])} fill="#0E0806" /></g>; };
/** a fire: flame tongues flickering on their own clocks, a glow */
const Fire: React.FC<{x: number; y: number; s: number; t: number; id: string; o?: number}> = ({x, y, s, t, id, o = 1}) => <g opacity={o}>
	<Glow x={x} y={y - 40 * s} r={260 * s} c="#FF9A40" o={0.55 * flick(t, 1)} id={`${id}g`} />
	{Array.from({length: 9}, (_, i) => { const ph = t * (6 + rnd(i, 2) * 4) + i * 2.1, hh = (70 + 70 * rnd(i, 3)) * s * (0.8 + 0.25 * Math.sin(ph)), ww = (14 + 12 * rnd(i, 4)) * s, cx = x + (i - 4) * 11 * s + Math.sin(ph * 0.7) * 4 * s, lean = Math.sin(t * 2 + i) * 10 * s;
		return <path key={i} d={sm([[cx - ww, y], [cx - ww * 0.6, y - hh * 0.45], [cx + lean, y - hh], [cx + ww * 0.6, y - hh * 0.45], [cx + ww, y]])} fill={i % 3 === 0 ? '#FFE6A0' : i % 3 === 1 ? '#FFB04A' : '#FF7A2A'} opacity={0.85} />; })}
	{Array.from({length: 5}, (_, i) => { const cx = x + (i - 2) * 13 * s, hh = 34 * s * (0.8 + 0.3 * Math.sin(t * 9 + i)); return <path key={`c${i}`} d={sm([[cx - 7 * s, y], [cx, y - hh], [cx + 7 * s, y]])} fill="#FFF4D0" opacity={0.9} />; })}
</g>;

/* ============================== A · 15.03 dawn on the ridge: 武王 at the fire altar raises both arms; crane up to the sun ============================== */
const SkyDawn: React.FC<{id: string; warm?: number}> = ({id, warm = 0}) => <><defs><linearGradient id={`${id}sk`} x1="0" y1="0" x2="0" y2="1">
	<stop offset="0" stopColor="#1A1A30" /><stop offset="0.3" stopColor={warm ? '#3A3050' : '#2E2A48'} /><stop offset="0.5" stopColor="#7A4A52" /><stop offset="0.62" stopColor="#D8845A" /><stop offset="0.7" stopColor="#FFC07A" /><stop offset="1" stopColor="#5A2E1E" /></linearGradient></defs>
	<rect x={-400} y={-1400} width={W + 800} height={H + 2000} fill={`url(#${id}sk)`} /></>;
const SA: React.FC<{t: number}> = ({t}) => { const a = 15.03, cu = seg(t, 15.06, 19.56), cr = cu * (0.35 + 0.65 * cu * (1.5 - 0.5 * cu)) / 1.0, cam: YCam = {x: 60 * cu, y: -900 * cr, s: 1 + 0.06 * cu};
	const raise = eio(seg(t, 15.08, BT(26) + 0.1)), sway = Math.sin((t - 16.7) * 2.2) * 2 * seg(t, 16.7, 17.5);
	const upN = lerp(62, 158, raise) + sway, upF = lerp(58, 150, raise) + sway * 0.8, bendN = lerp(78, 14, raise), bendF = lerp(82, 18, raise);
	const tilt = lerp(6, -26, ease(seg(t, BT(24.5), BT(26.5)))), flare = Math.exp(-Math.max(0, t - BT(26)) * 3) * seg(t, BT(26) - 0.1, BT(26));
	const sunY = SUN[1] - 40 * seg(t, a, 19.56);
	return <Shell t={t} id="A" bg="#14141E" vig={0.5}>
		<g transform={layerT(cam, 0.06)}><SkyDawn id="aA" />
			<Glow x={SUN[0]} y={sunY} r={1000} c="#FFC878" o={0.75} id="aAsg" sy={0.75} />
			<Glow x={SUN[0]} y={sunY} r={380} c="#FFD890" o={0.95} id="aAsb" /><circle cx={SUN[0]} cy={sunY} r={88} fill="#FFEFC0" /><Glow x={SUN[0]} y={sunY} r={150} c="#FFFBEA" o={0.9} id="aAsc" /></g>
		<g transform={layerT(cam, 0.22)}>
			{Array.from({length: 6}, (_, i) => <path key={i} d={sm([[-300 + i * 420, 330 + rnd(i, 3) * 120], [-120 + i * 420, 300 + rnd(i, 4) * 100], [120 + i * 420, 336 + rnd(i, 5) * 110], [-60 + i * 420, 360 + rnd(i, 6) * 100]])} fill="#C87A5A" opacity={0.14} />)}
			<path d={sm([[-400, 720], [100, 660], [380, 690], [700, 640], [1000, 676], [1320, 630], [1640, 668], [2300, 640], [2300, 1600], [-400, 1600]])} fill="#5A3A40" opacity={0.85} />
			<Haze y={690} h={120} c="#FFB080" o={0.4} id="aAh1" /></g>
		<g transform={layerT(cam, 0.45)}>
			<path d={sm([[-400, 790], [200, 742], [520, 770], [900, 730], [1240, 760], [1600, 726], [2300, 760], [2300, 1700], [-400, 1700]])} fill="#2E1E22" /></g>
		<g transform={layerT(cam, 1)}>
			{/* the army behind him on the ridge: banners and a rank of 戈 */}
			{[150, 300, 450].map((x, i) => <Banner key={i} x={x} y={930} h={560 - i * 40} L={210} w={30} t={t} seed={i * 1.7} />)}
			<Sil id="aAarmy" x={110} y={930} k={1.6} rim="#FFC890" lx={1} ly={0.1}>{Array.from({length: 8}, (_, i) => <g key={i} transform={`translate(${i * 36},${(i % 2) * 6})`}>
				<Body s={{hip: [0, -92], sh: [2, -142], hd: [4, -160], kN: [3, -48], fN: [6, -8], kF: [-2, -48], fF: [-6, -8], hN: [14, -108], hF: [10, -100], tilt: 0}} dress="robe" hat="guan" />
				<path d={`M16,-10 L22,-232`} stroke="#120C09" strokeWidth={2.6} /><path d="M22,-222 L38,-218 L22,-214 Z" fill="#120C09" /></g>)}</Sil>
			{/* the ridge */}
			<path d={sm([[-400, 960], [300, 932], [800, 940], [1300, 930], [2300, 950], [2300, 1800], [-400, 1800]])} fill="#120C0A" />
			{Array.from({length: 40}, (_, i) => { const x = -100 + i * 55 + rnd(i, 2) * 30, y = 936 + Math.abs(x - 900) * 0.02; return <path key={i} d={`M${f1(x)},${f1(y)} l${f1(-4 + rnd(i, 3) * 8)},${f1(-10 - rnd(i, 4) * 16)}`} stroke="#120C0A" strokeWidth={3} />; })}
			{/* the altar: a rammed-earth platform, the pyre on it, the fire, the smoke */}
			<path d={pth([[740, 945], [760, 790], [1040, 790], [1060, 945]])} fill="#2A1A12" />
			{[830, 860, 890, 920].map((y, i) => <path key={i} d={`M${752 + i * 2},${y} L${1048 - i * 2},${y}`} stroke="#1A100B" strokeWidth={3} />)}
			<path d="M760,790 L1040,790" stroke="#FFC890" strokeWidth={2.5} strokeOpacity={0.6} />
			{[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${820 + i * 40},792 L${850 + i * 30},${758 - (i % 2) * 8}`} stroke="#140C08" strokeWidth={9} strokeLinecap="round" />)}
			<Plume x={900} y={660} h={560} w={180} c="#6A4A44" o={0.4} id="aAsm" seed={t * 0.5} />
			<Plume x={940} y={420} h={560} w={260} c="#7A5A54" o={0.26} id="aAsm2" seed={2 + t * 0.4} />
			{[0, 1, 2].map((i) => <Plume key={i} x={960 + i * 70 + 30 * Math.sin(t * 0.6 + i)} y={160 - i * 300} h={420} w={260 + i * 60} c="#6A4A44" o={0.3 - i * 0.05} id={`aAsu${i}`} seed={i * 2 + t * 0.5} />)}
			<Rising t={t} n={60} x0={800} x1={1200} y0={-700} y1={300} c="#FFC060" seed={25} v={170} o={0.7} r={2.8} sway={50} />
			<Fire x={900} y={772} s={1.15 + 0.6 * flare} t={t} id="aAf" />
			<King55 x={590} y={945} k={3.1} id="aAk" upN={upN} bendN={bendN} upF={upF} bendF={bendF} tilt={tilt} rim="#FFE0B0" lx={1} ly={-0.05} stride={0.25} />
			<Rising t={t} n={50} x0={780} x1={1060} y0={300} y1={760} c="#FFC060" seed={21} v={140} o={0.8} r={2.6} sway={30} />
		</g>
		<g transform={layerT(cam, 1.5)}><Blur id="aAfg" s={6}>
			<path d={sm([[-200, 1100], [100, 1010], [380, 1040], [520, 1100]])} fill="#0A0706" />
			<path d={sm([[1500, 1100], [1700, 1020], [2000, 1000], [2100, 1100]])} fill="#0A0706" />
			<path d="M1620,1100 L1700,560" stroke="#0A0706" strokeWidth={10} /><path d="M1690,600 L1730,592 L1700,580 Z" fill="#0A0706" /></Blur></g>
	</Shell>; };

/* ============================== B · 19.56 the smoke carries 宅 兹 中 或, one per beat; the camera follows them up ============================== */
const GX = 1262, GY = 300, GS = 150, GG = 168;
const SB: React.FC<{t: number}> = ({t}) => { const a = 19.56, tu = seg(t, a, 24.09), tl = tu * (0.4 + 0.6 * tu), cam: YCam = {x: 0, y: -1000 * tl, s: 1 + 0.08 * tu};
	const beats = [BT(33), BT(34), BT(35), BT(36)];   /* 20.13, 20.70, 21.26, 21.83 */
	const u = beats.reduce((s, tb, i) => s + cl((t - (tb - 0.2)) / 0.2) * (i < 4 ? 1 : 0), 0);
	const drift = 170 * tl, pulse = beats.reduce((s, tb) => s + (t >= tb ? Math.exp(-(t - tb) * 5) : 0), 0) + [BT(37), BT(38), BT(39)].reduce((s, tb) => s + (t >= tb ? 0.8 * Math.exp(-(t - tb) * 4) : 0), 0);
	const glow = 0.75 + 0.5 * cl(pulse);
	return <Shell t={t} id="B" bg="#14141E" vig={0.55}>
		<defs><filter id="aBwb" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={40} /></filter></defs>
		<g transform={layerT(cam, 0.08)}><SkyDawn id="aB" warm={1} /><Glow x={360} y={740} r={900} c="#FFC878" o={0.55} id="aBsg" sy={0.7} /><rect x={-400} y={-1400} width={2800} height={3200} fill="#1A0E14" opacity={0.28} /></g>
		<g transform={layerT(cam, 0.25)}>{Array.from({length: 8}, (_, i) => <path key={i} d={sm([[-300 + i * 330, 60 + rnd(i, 3) * 500], [-100 + i * 330, 30 + rnd(i, 4) * 480], [160 + i * 330, 70 + rnd(i, 5) * 500], [-40 + i * 330, 100 + rnd(i, 6) * 480]])} fill="#D8906A" opacity={0.13} />)}</g>
		<g transform={layerT(cam, 1)}>
			{/* the smoke column from the altar fire, leaning right as it rises */}
			{Array.from({length: 9}, (_, i) => <Plume key={i} x={1150 + i * 18 + 26 * Math.sin(t * 0.7 + i)} y={1000 - i * 220} h={400} w={240 + i * 36} c={i % 2 ? '#4A3230' : '#5E423C'} o={0.55 - i * 0.03} id={`aBp${i}`} seed={i * 1.3 + t * 0.55} />)}
			{Array.from({length: 10}, (_, i) => { const yy = 1000 - (((i * 260 + t * 150) % 2600)), xx = 1180 + (1000 - yy) * 0.06 + Math.sin(t * 0.8 + i * 2) * 60; return <ellipse key={`w${i}`} cx={xx} cy={yy} rx={170 + 40 * Math.sin(i)} ry={90} fill="#3E2A28" opacity={0.22} filter="url(#aBwb)" />; })}
			<path d={pth([[880, 1250], [900, 1020], [1400, 1020], [1420, 1250]])} fill="#24160F" /><path d="M900,1020 L1400,1020" stroke="#FFC890" strokeWidth={3} strokeOpacity={0.6} />
			{[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M${1000 + i * 45},1022 L${1040 + i * 36},${980 - (i % 2) * 10}`} stroke="#140C08" strokeWidth={14} strokeLinecap="round" />)}
			<Fire x={1150} y={1000} s={2.0} t={t} id="aBf" />
			<Rising t={t} n={110} x0={900} x1={1600} y0={-900} y1={1100} c="#FFC060" seed={23} v={220} o={0.75} r={3.2} sway={50} />
		</g>
		{/* wisps converging into each glyph just before its beat */}
		{beats.map((tb, i) => { const v = seg(t, tb - 0.45, tb), y = GY + i * GG - drift; if (v <= 0 || v >= 1) return null;
			return <g key={i}>{Array.from({length: 14}, (_, m) => { const ang = (m / 14) * 2 * Math.PI + i, r = (1 - ease(v)) * 220 + 10;
				return <circle key={m} cx={GX + Math.cos(ang) * r} cy={y + Math.sin(ang) * r * 0.8} r={6 + 10 * (1 - v)} fill="#FFE2A8" opacity={0.35 * v} />; })}</g>; })}
		<Glow x={GX} y={GY + 1.5 * GG - drift} r={480} c="#FFC060" o={0.16 + 0.32 * cl(pulse)} id="aBgl" sy={1.4} />
		<Glyphs55 chars="宅兹中或" x={GX} y={GY - drift} size={GS} gap={GG} u={u} glow={glow} id="aBg" />
	</Shell>; };

/* ============================== C · 24.09 洛邑: rammers on the beat, the walls rise, 成王's procession rolls through the gate ============================== */
type Q = [number, number, number];
const NEAR = 0.6;
/** project a world polygon, clipped against the camera's near plane (so faces never pop in or out) */
const clipProj = (cam: Cam, pts: V3[]): P[] | null => { const k = pts.map((q) => toCam(cam, q)), out: V3[] = [];
	for (let i = 0; i < k.length; i++) { const a = k[i], b = k[(i + 1) % k.length], ia = a[2] > NEAR, ib = b[2] > NEAR;
		if (ia) out.push(a); if (ia !== ib) { const u = (NEAR - a[2]) / (b[2] - a[2]); out.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, NEAR]); } }
	return out.length < 3 ? null : out.map((q) => scr(cam, q) as P); };
const clipSeg = (cam: Cam, a0: V3, b0: V3): [P, P] | null => { let a = toCam(cam, a0), b = toCam(cam, b0); if (a[2] <= NEAR && b[2] <= NEAR) return null;
	if (a[2] <= NEAR) { const u = (NEAR - a[2]) / (b[2] - a[2]); a = [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, NEAR]; }
	if (b[2] <= NEAR) { const u = (NEAR - b[2]) / (a[2] - b[2]); b = [b[0] + (a[0] - b[0]) * u, b[1] + (a[1] - b[1]) * u, NEAR]; }
	return [scr(cam, a) as P, scr(cam, b) as P]; };
const CH0 = 28.62;
const chY = (t: number) => 2 + 4.2 * (t - CH0);   /* the chariot's axle, metres along the road (x = 0) */
const wallH = (t: number) => 1.6 + [BT(40), BT(41), BT(42), BT(43), BT(44)].reduce((s, tb) => s + 1.3 * ease(seg(t, tb, tb + 0.22)), 0);
const SC: React.FC<{t: number}> = ({t}) => { const a = 24.09, u = eio(seg(t, a, CH0 - 0.15)), cy = chY(t);
	const hh = wallH(t), dr = t - a;
	const K: [number, {p: V3; g: V3; f: number}][] = [
		[a, {p: [-54 + 4 * dr, -7, hh + 2.4], g: [-46 + 4 * dr, 6, hh + 1.1], f: 1250}],
		[24.95, {p: [-54 + 4 * 0.86, -7, hh + 2.4], g: [-46 + 4 * 0.86, 6, hh + 1.1], f: 1250}],
		[26.6, {p: [-58, -86, 34], g: [-4, 30, 2], f: 1700}],
		[CH0, {p: [1.2, cy - 30, 5], g: [0, cy + 30, 6], f: 1500}]];
	const mixK = (x: {p: V3; g: V3; f: number}, y: {p: V3; g: V3; f: number}, v: number) => ({p: [lerp(x.p[0], y.p[0], v), lerp(x.p[1], y.p[1], v), lerp(x.p[2], y.p[2], v)] as V3, g: [lerp(x.g[0], y.g[0], v), lerp(x.g[1], y.g[1], v), lerp(x.g[2], y.g[2], v)] as V3, f: lerp(x.f, y.f, v)});
	const ck = track(K, t, mixK, eio), cam = lookAt(ck.p, ck.g, ck.f, 960, 600);
	void u;
	const pr = (q: V3): Q => proj(cam, q) as Q, ok = (qs: Q[]) => qs.every((q) => q[2] > 0.5);
	const poly = (pts: V3[], fill: string, key: string | number, o = 1, stroke?: string) => { const qs = clipProj(cam, pts); if (!qs) return null;
		return <path key={key} d={pth(qs)} fill={fill} opacity={o} stroke={stroke} strokeWidth={stroke ? 1.5 : undefined} strokeOpacity={0.5} />; };
	void ok;
	const h = wallH(t);
	/* a box: visible faces only (camera is in front, above, at x = cam.p[0]) */
	const box = (x0: number, x1: number, y0: number, y1: number, z1: number, key: string, cols = {top: '#D8B074', front: '#6E4E30', left: '#4E3620', right: '#B88A52'}) => { const cp = cam.p, out: React.ReactNode[] = [];
		if (cp[0] < x0) out.push(poly([[x0, y0, 0], [x0, y1, 0], [x0, y1, z1], [x0, y0, z1]], cols.left, `${key}l`));
		if (cp[0] > x1) out.push(poly([[x1, y0, 0], [x1, y1, 0], [x1, y1, z1], [x1, y0, z1]], cols.right, `${key}r`));
		if (cp[1] < y0) { out.push(poly([[x0, y0, 0], [x1, y0, 0], [x1, y0, z1], [x0, y0, z1]], cols.front, `${key}f`));
			/* rammed layers on the front face */
			const nL = Math.floor(z1 / 0.5); for (let i = 1; i < nL; i++) { const sg = clipSeg(cam, [x0, y0 - 0.01, i * 0.5], [x1, y0 - 0.01, i * 0.5]); if (sg) out.push(<path key={`${key}ly${i}`} d={`M${f1(sg[0][0])},${f1(sg[0][1])} L${f1(sg[1][0])},${f1(sg[1][1])}`} stroke="#3E2A18" strokeWidth={1.2} opacity={0.55} />); } }
		if (cp[2] > z1) out.push(poly([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], cols.top, `${key}t`));
		return <g key={key}>{out}</g>; };
	/* workers on a wall top: a row from a to b (world), ramming on the beat */
	const workers = (a0: V3, b0: V3, n: number, key: string) => Array.from({length: n}, (_, i) => { const uu = (i + 0.5) / n, wp: V3 = [lerp(a0[0], b0[0], uu), lerp(a0[1], b0[1], uu), h];
		const q = pr(wp); if (q[2] < 1) return null; const k = cam.f / q[2], hp = Math.max(2.1 * k, 24 * Math.min(1, k / 6)); if (hp < 2.5) return <circle key={`${key}${i}`} cx={q[0]} cy={q[1] - hp * 0.5} r={Math.max(0.8, hp * 0.25)} fill="#2A1A10" />;
		/* the rammer cycle: lifted between beats, slammed down on each beat */
		const ph = ((t - 1.4498) / BEAT + 1000) % 1, lift = ph < 0.08 ? 0 : ph < 0.7 ? ease((ph - 0.08) / 0.62) : 1 - Math.pow((ph - 0.7) / 0.3, 2.2), off = rnd(i, 7) * 0.12;
		if (hp > 44) { /* near: a jointed 西周 labourer (knee-length 短衣, topknot band); the arms lift the rammer by IK, the body dips on the hit */
			const kc = (k * 1.05) / 100, fl = i % 2 === 1, dip = 1 - lift, sx = fl ? -1 : 1, X = (bx: number) => q[0] + sx * kc * bx, Y = (by: number) => q[1] + kc * by;
			const hN: P = [30, -96 - 56 * lift + 6 * dip], hF: P = [31, -84 - 56 * lift + 6 * dip], pb = -44 * lift, pt = pb - 150, strike = ph < 0.2 ? 1 - ph / 0.2 : 0;
			return <g key={`${key}${i}`}>
				<Person id={`aCw${key}${i}`} f={{kind: 'zhou', lean: 10 + 10 * dip - 4 * lift, stride: 0.35, hN, hF, flip: fl}} x={q[0]} y={q[1]} k={kc} rim="#FFE0A8" lx={1} ly={0.2} />
				<path d={`M${f1(X(31))},${f1(Y(pt))} L${f1(X(31))},${f1(Y(pb - 18))}`} stroke="#2A180C" strokeWidth={Math.max(2, kc * 5)} strokeLinecap="round" />
				<path d={`M${f1(X(31))},${f1(Y(pb - 22))} L${f1(X(31))},${f1(Y(pb))}`} stroke="#2A180C" strokeWidth={Math.max(4, kc * 14)} />
				{strike > 0 && <ellipse cx={X(31)} cy={Y(-4)} rx={kc * (20 + 70 * (1 - strike))} ry={kc * (8 + 22 * (1 - strike))} fill="#F2DCB0" opacity={0.7 * strike} />}</g>; }
		const L = (x: number, y: number): P => [q[0] + x * hp * (i % 2 ? 1 : -1), q[1] + y * hp];
		const dip = 0.03 * (1 - lift), hipP = L(0, -0.5 + dip), sh = L(0.02, -0.8 + dip), hd = L(0.03, -0.92 + dip), poleX = 0.2, top = -0.95 - 0.35 * lift + off * 0, bot = -0.02 - 0.32 * lift;
		const hand = L(poleX, -0.72 - 0.3 * lift + dip), el = ik2(sh, hand, 0.17 * hp, 0.17 * hp, i % 2 ? 1 : -1);
		const strike = ph < 0.18 ? 1 - ph / 0.18 : 0;
		return <g key={`${key}${i}`} stroke="#1E120A" strokeLinecap="round" fill="#1E120A">
			<path d={`M${f1(L(-0.06, 0)[0])},${f1(L(-0.06, 0)[1])} L${f1(hipP[0])},${f1(hipP[1])} L${f1(L(0.07, 0)[0])},${f1(L(0.07, 0)[1])}`} strokeWidth={hp * 0.07} fill="none" />
			<path d={`M${f1(hipP[0])},${f1(hipP[1])} L${f1(sh[0])},${f1(sh[1])}`} strokeWidth={hp * 0.13} />
			<circle cx={hd[0]} cy={hd[1]} r={hp * 0.062} stroke="none" />
			<path d={`M${f1(sh[0])},${f1(sh[1])} L${f1(el[0])},${f1(el[1])} L${f1(hand[0])},${f1(hand[1])}`} strokeWidth={hp * 0.05} fill="none" />
			<path d={`M${f1(L(poleX, top)[0])},${f1(L(poleX, top)[1])} L${f1(L(poleX, bot)[0])},${f1(L(poleX, bot)[1])}`} strokeWidth={hp * 0.035} />
			<path d={`M${f1(L(poleX, bot)[0])},${f1(L(poleX, bot)[1])} L${f1(L(poleX, bot - 0.12)[0])},${f1(L(poleX, bot - 0.12)[1])}`} strokeWidth={hp * 0.1} />
			{strike > 0 && <ellipse cx={L(poleX, 0)[0]} cy={L(poleX, -0.05)[1]} rx={hp * (0.2 + 0.5 * (1 - strike))} ry={hp * (0.1 + 0.18 * (1 - strike))} fill="#F2DCB0" stroke="none" opacity={0.75 * strike} />}</g>; });
	/* the board frame (版) on a wall top */
	const boards = (x0: number, x1: number, y: number, key: string) => [y, y + 10].map((yy, i) => { const sg = clipSeg(cam, [x0, yy, h + 0.45], [x1, yy, h + 0.45]); if (!sg) return null; const mid = pr([(x0 + x1) / 2, yy, h + 0.45]);
		return <path key={`${key}${i}`} d={`M${f1(sg[0][0])},${f1(sg[0][1])} L${f1(sg[1][0])},${f1(sg[1][1])}`} stroke="#3A2414" strokeWidth={Math.max(1, Math.min(6, (cam.f / Math.max(5, mid[2])) * 0.3))} />; });
	const gateRoof = ease(seg(t, BT(45), BT(45) + 0.25)), roofZ = h + 2.8 + 6 * (1 - gateRoof);
	const horizon = pr([0, 4000, 0]);
	const proc = <Procession t={t} cam={cam} cy={cy} />;
	const passing = cy + 6 > -4;   /* the lead of the procession is in the gate */
	return <Shell t={t} id="C" bg="#3A4A62" vig={0.45}>
		<defs><linearGradient id="aCsk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#24406A" /><stop offset="0.55" stopColor="#7A8EA8" /><stop offset="0.82" stopColor="#F0C890" /><stop offset="1" stopColor="#FFD8A0" /></linearGradient>
			<linearGradient id="aCgr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8A7650" /><stop offset="0.4" stopColor="#5E4C30" /><stop offset="1" stopColor="#3A2C1A" /></linearGradient></defs>
		<rect x={0} y={horizon[1] - 1400} width={W} height={1400} fill="url(#aCsk)" />
		<Glow x={1320} y={horizon[1] - 70} r={700} c="#FFE0A8" o={0.75} id="aCsun" sy={0.6} /><circle cx={1320} cy={horizon[1] - 60} r={34} fill="#FFF6DC" />
		{/* the hills far beyond, the plain */}
		{poly(Array.from({length: 13}, (_, i) => [-4000 + i * 666, 3800, 120 + 140 * rnd(i, 9)] as V3).concat([[4000, 3800, 0], [-4000, 3800, 0]]), '#6A6A7E', 'hills', 0.85)}
		<rect x={0} y={horizon[1]} width={W} height={H} fill="url(#aCgr)" />
		{poly([[-3000, -600, 0], [3000, -600, 0], [3000, 3800, 0], [-3000, 3800, 0]], 'url(#aCgr)', 'ground')}
		{/* fields */}
		{Array.from({length: 14}, (_, i) => poly([[-700 + i * 100, 220, 0], [-650 + i * 100, 220, 0], [-650 + i * 100, 900, 0], [-700 + i * 100, 900, 0]], i % 2 ? '#7A6A40' : '#5E6E3E', `fd${i}`, 0.5))}
		{Array.from({length: 8}, (_, i) => poly([[-400 + i * 50, -400, 0], [-370 + i * 50, -400, 0], [-370 + i * 50, -180, 0], [-400 + i * 50, -180, 0]], i % 2 ? '#6A5A34' : '#566236', `fn${i}`, 0.45))}
		{/* the 洛 river: in front of the city, the camera crosses it */}
		{poly(Array.from({length: 21}, (_, i) => [-1500 + i * 150, -78 + 30 * Math.sin(i * 0.6), 0] as V3).concat(Array.from({length: 21}, (_, i) => [1500 - i * 150, -50 + 30 * Math.sin((20 - i) * 0.6), 0] as V3)), '#A8C0D0', 'river', 0.95)}
		{Array.from({length: 18}, (_, i) => { const x = -900 + i * 100 + ((t * 40) % 100), q = pr([x, -64 + 30 * Math.sin((x + 1500) / 150 * 0.6), 0.05]); if (q[2] < 1) return null; const k = cam.f / q[2];
			return <path key={`gl${i}`} d={`M${f1(q[0] - 4 * k)},${f1(q[1])} L${f1(q[0] + 4 * k)},${f1(q[1])}`} stroke="#FFFFFF" strokeWidth={Math.max(1, 0.4 * k)} opacity={0.6} />; })}
		{/* the road, a plank bridge where it crosses */}
		{poly([[-4, -600, 0], [4, -600, 0], [4, 300, 0], [-4, 300, 0]], '#B89A70', 'road')}
		{poly([[-5, -92, 0.3], [5, -92, 0.3], [5, -36, 0.3], [-5, -36, 0.3]], '#4A321E', 'bridge')}
		{/* the city: back + side walls, an inner platform, then the front wall around the gate */}
		{box(-90, 90, 138, 150, h, 'wb')}{workers([-80, 144, 0], [80, 144, 0], 16, 'kb')}
		{box(-90, -78, 0, 150, h, 'wl')}{workers([-84, 16, 0], [-84, 134, 0], 11, 'kl')}
		{box(78, 90, 0, 150, h, 'wr')}{workers([84, 16, 0], [84, 134, 0], 11, 'kr')}
		{box(-30, 30, 70, 110, 3, 'plat', {top: '#C49A68', front: '#8A643E', left: '#6A4A2E', right: '#A88054'})}
		{[[-50, 60], [45, 70], [-30, 125], [60, 120]].map(([x, y], i) => <Plume key={`sm${i}`} x={pr([x, y, 0])[0]} y={pr([x, y, 0])[1]} h={Math.min(400, cam.f / pr([x, y, 0])[2] * 30)} w={Math.min(140, cam.f / pr([x, y, 0])[2] * 9)} c="#E8E0D0" o={0.25} id={`aCs${i}`} seed={i + t * 0.6} />)}
		{box(-90, -14, 0, 12, h, 'wfl')}{boards(-86, -16, 1, 'bfl')}{workers([-86, 6, 0], [-17, 6, 0], 13, 'kfl')}
		{box(-14, -6, -4, 15, h + 2.5, 'tl', {top: '#B89262', front: '#80603E', left: '#5E442A', right: '#9E784A'})}
		{passing && proc}
		{box(6, 14, -4, 15, h + 2.5, 'tr', {top: '#B89262', front: '#80603E', left: '#5E442A', right: '#9E784A'})}
		{box(14, 90, 0, 12, h, 'wfr')}{boards(16, 86, 1, 'bfr')}{workers([17, 6, 0], [86, 6, 0], 13, 'kfr')}
		{/* the gatehouse roof drops into place on a beat */}
		{poly([[-16, -6, roofZ], [16, -6, roofZ], [14, 6, roofZ + 2.6], [-14, 6, roofZ + 2.6]], '#3A2618', 'roof', 0.3 + 0.7 * gateRoof)}
		{poly([[-14, -4, roofZ - 0.1], [14, -4, roofZ - 0.1], [14, -4, roofZ - 2.4], [-14, -4, roofZ - 2.4]], '#2A1A10', 'roofF', 0.3 + 0.7 * gateRoof)}
		{!passing && proc}
	</Shell>; };

/** the procession seen from behind as the camera follows it: banner bearers, two horses, the chariot with 成王 under the canopy */
export const Chariot55: React.FC<{t: number; x: number; y: number; k: number; side?: number}> = ({t, x, y, k, side = 0.18}) => {
	const S = (u: number, v: number): P => [x + u * k, y - v * k], rot = t * 4.2 / 0.7;   /* wheel spin: speed / radius */
	const wheel = (u: number) => { const c = S(u, 0.7), rx = 0.7 * k * side + 0.05 * k, ry = 0.7 * k;
		return <g><ellipse cx={c[0]} cy={c[1]} rx={rx} ry={ry} fill="none" stroke="#1A100A" strokeWidth={0.09 * k} />
			{Array.from({length: 9}, (_, i) => { const a = rot + (i / 9) * Math.PI; return <path key={i} d={`M${f1(c[0] - Math.cos(a) * rx)},${f1(c[1] - Math.sin(a) * ry)} L${f1(c[0] + Math.cos(a) * rx)},${f1(c[1] + Math.sin(a) * ry)}`} stroke="#1A100A" strokeWidth={0.03 * k} />; })}
			<ellipse cx={c[0]} cy={c[1]} rx={0.12 * k} ry={0.14 * k} fill="#1A100A" /></g>; };
	const bob = Math.abs(Math.sin(t * 7)) * 0.04;
	return <g>
		{/* the canopy pole and disc (盖), the king, the driver */}
		<path d={`M${f1(S(0, 1.2)[0])},${f1(S(0, 1.2)[1])} L${f1(S(0, 3.0)[0])},${f1(S(0, 3.0)[1])}`} stroke="#1A100A" strokeWidth={0.06 * k} />
		<ellipse cx={S(0, 3.05 + bob)[0]} cy={S(0, 3.05 + bob)[1]} rx={1.05 * k} ry={0.22 * k} fill="#3A1A12" />
		<path d={`M${f1(S(-1.05, 3.05 + bob)[0])},${f1(S(-1.05, 3.05 + bob)[1])} Q${f1(S(0, 2.95)[0])},${f1(S(0, 2.7)[1])} ${f1(S(1.05, 3.05 + bob)[0])},${f1(S(1.05, 3.05 + bob)[1])}`} fill="none" stroke="#F2C66E" strokeWidth={0.05 * k} opacity={0.7} />
		{Array.from({length: 9}, (_, i) => { const p = S(-1 + i * 0.25, 2.98 + bob); return <path key={i} d={`M${f1(p[0])},${f1(p[1])} l0,${f1(0.22 * k)}`} stroke="#5A2A18" strokeWidth={0.03 * k} />; })}
		{/* the driver (御) ahead-right, the king centre: robes from behind, the 冕 board and bead strings */}
		<path d={sm([S(0.3, 1.2), S(0.32, 1.95), S(0.48, 2.05), S(0.62, 1.95), S(0.64, 1.2)])} fill="#160E0A" /><circle cx={S(0.47, 2.15)[0]} cy={S(0.47, 2.15)[1]} r={0.11 * k} fill="#160E0A" />
		<path d={sm([S(-0.42, 1.15), S(-0.36, 1.9), S(-0.24, 2.18), S(0.24, 2.18), S(0.36, 1.9), S(0.42, 1.15)])} fill="#120A07" />
		<circle cx={S(0, 2.36)[0]} cy={S(0, 2.36)[1]} r={0.13 * k} fill="#120A07" />
		<path d={pth([S(-0.24, 2.55), S(0.24, 2.55), S(0.24, 2.6), S(-0.24, 2.6)])} fill="#120A07" />
		{[-0.18, -0.06, 0.06, 0.18].map((u, i) => <path key={i} d={`M${f1(S(u, 2.55)[0])},${f1(S(u, 2.55)[1])} l0,${f1(0.16 * k)}`} stroke="#F2C66E" strokeWidth={0.025 * k} opacity={0.8} />)}
		<path d={`M${f1(S(-0.42, 1.6)[0])},${f1(S(-0.42, 1.6)[1])} L${f1(S(-0.42, 2.0)[0])},${f1(S(-0.42, 2.0)[1])} M${f1(S(0.42, 1.6)[0])},${f1(S(0.42, 1.6)[1])} L${f1(S(0.42, 2.0)[0])},${f1(S(0.42, 2.0)[1])}`} stroke="#FFD8A0" strokeWidth={0.03 * k} opacity={0.5} />
		{/* the box (舆) from behind, the axle, the wheels */}
		<path d={pth([S(-0.72, 0.72), S(0.72, 0.72), S(0.72, 1.28), S(-0.72, 1.28)])} fill="#24150D" />
		<path d={pth([S(-0.3, 0.74), S(0.3, 0.74), S(0.3, 1.18), S(-0.3, 1.18)])} fill="#0E0805" />
		<path d={`M${f1(S(-0.72, 1.28)[0])},${f1(S(-0.72, 1.28)[1])} L${f1(S(0.72, 1.28)[0])},${f1(S(0.72, 1.28)[1])}`} stroke="#FFC890" strokeWidth={0.03 * k} opacity={0.6} />
		<path d={`M${f1(S(-1.25, 0.7)[0])},${f1(S(-1.25, 0.7)[1])} L${f1(S(1.25, 0.7)[0])},${f1(S(1.25, 0.7)[1])}`} stroke="#1A100A" strokeWidth={0.07 * k} />
		{wheel(-1.12)}{wheel(1.12)}
	</g>; };
/** horses from behind: two rumps and tails, hind legs stepping (a trot), heads up beyond */
const Horses: React.FC<{t: number; x: number; y: number; k: number}> = ({t, x, y, k}) => { const S = (u: number, v: number): P => [x + u * k, y - v * k];
	return <g fill="#160E09">{[-0.42, 0.42].map((u, i) => { const ph = t * 7 + i * Math.PI, la = Math.sin(ph) * 0.18, lb = Math.sin(ph + Math.PI) * 0.18, bob = Math.abs(Math.sin(ph)) * 0.05;
		const leg = (lx: number, lift: number, key: string) => { const hip = S(u + lx, 1.05 + bob), knee = S(u + lx * 1.1, 0.55 + lift * 0.6), hoof = S(u + lx * 1.05, 0.02 + lift);
			return <path key={key} d={`M${f1(hip[0])},${f1(hip[1])} L${f1(knee[0])},${f1(knee[1])} L${f1(hoof[0])},${f1(hoof[1])}`} stroke="#160E09" strokeWidth={0.1 * k} fill="none" strokeLinecap="round" />; };
		return <g key={i}>
			<path d={sm([S(u - 0.24, 2.05 + bob), S(u - 0.1, 2.55 + bob), S(u + 0.1, 2.6 + bob), S(u + 0.2, 2.1 + bob)])} />
			<circle cx={S(u, 2.68 + bob)[0]} cy={S(u, 2.68 + bob)[1]} r={0.15 * k} />
			<path d={pth([S(u - 0.08, 2.78 + bob), S(u - 0.04, 2.95 + bob), S(u, 2.8 + bob)])} />
			{leg(-0.12, Math.max(0, la), 'a')}{leg(0.12, Math.max(0, lb), 'b')}
			<path d={sm([S(u - 0.3, 1.0 + bob), S(u - 0.33, 1.5 + bob), S(u - 0.2, 1.75 + bob), S(u + 0.2, 1.75 + bob), S(u + 0.33, 1.5 + bob), S(u + 0.3, 1.0 + bob)])} />
			<path d={sm([S(u, 1.5 + bob), S(u + Math.sin(t * 3 + i) * 0.08, 1.1), S(u + Math.sin(t * 3 + i) * 0.14, 0.75)], false)} stroke="#160E09" strokeWidth={0.09 * k} fill="none" strokeLinecap="round" />
			<path d={`M${f1(S(u + 0.3, 1.5)[0])},${f1(S(u + 0.3, 1.5)[1])} L${f1(S(u + 0.33, 1.52)[0])},${f1(S(u + 0.33, 1.52)[1])}`} stroke="#FFD8A0" strokeWidth={0.03 * k} opacity={0.5} /></g>; })}
		<path d={`M${f1(S(0, 0.9)[0])},${f1(S(0, 0.9)[1])} L${f1(S(0, 1.9)[0])},${f1(S(0, 1.9)[1])}`} stroke="#160E09" strokeWidth={0.06 * k} />
	</g>; };
/** a walker seen from behind carrying a banner (the legs swing at the hip, the knees bend) */
const BannerBearer: React.FC<{t: number; x: number; y: number; k: number; seed: number}> = ({t, x, y, k, seed}) => { const S = (u: number, v: number): P => [x + u * k, y - v * k], ph = t * 6.5 + seed, bob = Math.abs(Math.sin(ph)) * 0.03;
	const leg = (u: number, lift: number) => { const hip = S(u, 0.92 + bob), knee = S(u * 1.05, 0.48 + lift * 0.7), ft = S(u * 1.1, 0.03 + lift); return `M${f1(hip[0])},${f1(hip[1])} L${f1(knee[0])},${f1(knee[1])} L${f1(ft[0])},${f1(ft[1])}`; };
	const wv = (v: number) => Math.sin(v * 4 - t * 4 + seed) * 0.12;
	return <g fill="#140C08" stroke="#140C08" strokeLinecap="round">
		<path d={leg(-0.09, Math.max(0, Math.sin(ph)) * 0.18)} strokeWidth={0.1 * k} fill="none" /><path d={leg(0.09, Math.max(0, -Math.sin(ph)) * 0.18)} strokeWidth={0.1 * k} fill="none" />
		<path d={sm([S(-0.22, 0.88 + bob), S(-0.24, 1.45 + bob), S(0, 1.52 + bob), S(0.24, 1.45 + bob), S(0.22, 0.88 + bob)])} stroke="none" />
		<circle cx={S(0, 1.62 + bob)[0]} cy={S(0, 1.62 + bob)[1]} r={0.1 * k} stroke="none" />
		<path d={`M${f1(S(0.2, 1.3)[0])},${f1(S(0.2, 1.3)[1])} L${f1(S(0.22, 4.2)[0])},${f1(S(0.22, 4.2)[1])}`} strokeWidth={0.045 * k} />
		<path d={sm([S(0.24, 4.1), S(0.24 + 0.55 + wv(0), 4.08), S(0.24 + 0.6 + wv(1), 3.0), S(0.24 + 0.5 + wv(2), 2.2), S(0.24 + 0.05, 2.4)])} fill="#7A1E14" stroke="none" />
	</g>; };
const Procession: React.FC<{t: number; cam: Cam; cy: number}> = ({t, cam, cy}) => {
	const items: {y: number; el: (q: Q, k: number) => React.ReactNode}[] = [
		{y: cy + 9, el: (q, k) => <BannerBearer t={t} x={q[0]} y={q[1]} k={k} seed={0} />}, {y: cy + 9.3, el: (q, k) => <BannerBearer t={t} x={q[0]} y={q[1]} k={k} seed={1.6} />},
		{y: cy + 3.2, el: (q, k) => <Horses t={t} x={q[0]} y={q[1]} k={k} />},
		{y: cy, el: (q, k) => <Chariot55 t={t} x={q[0]} y={q[1]} k={k} />},
	];
	const xs = [-1.9, 1.9, 0, 0];
	return <g>{items.map((it, i) => ({it, i, q: proj(cam, [xs[i], it.y, 0]) as Q})).filter((o) => o.q[2] > 1).sort((a, b) => b.q[2] - a.q[2]).map((o) => <g key={o.i}>{o.it.el(o.q, cam.f / o.q[2])}</g>)}</g>; };

/* ============================== D · 28.62 the hall: a dolly along the kneeling 宗小子 toward 成王, who speaks ============================== */
const HE_X = 2150;   /* 何's place in the near row (world px of the near layer) */
const hallCamX = (t: number) => 1500 * ((u) => 0.12 * u + 0.88 * ease(u))(seg(t, 28.62, 33.15 + 0.85));
const HallBack: React.FC<{cam: YCam; t: number; id: string; blur?: number}> = ({cam, t, id, blur = 0}) => <g>
	<defs><linearGradient id={`${id}w`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0E0806" /><stop offset="0.7" stopColor="#2A1A10" /><stop offset="1" stopColor="#1A100A" /></linearGradient>
		<linearGradient id={`${id}f`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3A2416" /><stop offset="1" stopColor="#0E0806" /></linearGradient></defs>
	<Blur id={`${id}bb`} s={blur}><g transform={layerT(cam, 0.45)}>
		<rect x={-1200} y={-200} width={6000} height={1000} fill={`url(#${id}w)`} />
		<rect x={-1200} y={0} width={6000} height={70} fill="#0A0604" /><path d="M-1200,70 L4800,70" stroke="#7A4A26" strokeWidth={3} strokeOpacity={0.6} />
		{Array.from({length: 9}, (_, i) => { const x = -200 + i * 480; return <g key={i}><rect x={x} y={70} width={50} height={640} fill="#4A160E" /><path d={`M${x + 50},70 L${x + 50},710`} stroke="#FF9A50" strokeWidth={2} strokeOpacity={0.3} /></g>; })}
		{Array.from({length: 7}, (_, i) => { const x = 60 + i * 480; return <path key={i} d={sm([[x, 300], [x + 300, 292], [x + 300, 640], [x + 150, 652], [x, 640]])} fill="#1E0F09" opacity={0.8} />; })}
		<Glow x={1960} y={500} r={460} c="#FFB060" o={0.26} id={`${id}dg`} />
	</g></Blur></g>;
const SD: React.FC<{t: number}> = ({t}) => { const cx = hallCamX(t), cam: YCam = {x: cx, y: 0, s: 1};
	/* 成王 speaks: the hand rises, opens toward them, beats with the words */
	const sp = seg(t, 30.9, 31.7), talk = Math.sin((t - 31.7) * 5.3) * 7 * seg(t, 31.7, 32.2);
	return <Shell t={t} id="D" bg="#0A0605" vig={0.62}>
		<HallBack cam={cam} t={t} id="aDh" blur={1.2} />
		<g transform={layerT(cam, 0.6)}>
			<path d={pth([[1700, 690], [2900, 680], [2920, 750], [1680, 762]])} fill="#3A2414" /><path d="M1680,762 L2920,750 L2920,790 L1680,802 Z" fill="#1A0F09" />
			<path d="M1700,690 L2900,680" stroke="#FFC070" strokeWidth={2.5} strokeOpacity={0.7} />
			{[0, 1, 2].map((i) => <path key={i} d={pth([[1640 - i * 30, 802 + i * 20], [1680 - i * 30, 802 + i * 20 - 22], [2920, 790 + i * 20 - 22], [2920, 802 + i * 20]])} fill={i % 2 ? '#20140C' : '#2A1A10'} />)}
			<rect x={1960} y={330} width={380} height={360} fill="#1A0C08" stroke="#7A4A26" strokeWidth={4} />
			{Array.from({length: 20}, (_, i) => { const cx = 2006 + (i % 4) * 96, cy = 372 + Math.floor(i / 4) * 64; return <path key={i} d={sm([[cx - 20, cy - 16], [cx + 12, cy - 20], [cx + 24, cy], [cx + 12, cy + 20], [cx - 20, cy + 16], [cx - 12, cy]])} fill="#3A1A10" stroke="#8A5A30" strokeWidth={1.2} strokeOpacity={0.5} />; })}
			<path d="M2290,690 L2340,690 L2322,676 L2320,520 L2348,508 L2282,508 L2310,520 L2308,676 Z" fill="#1E120A" />
			<path d={sm([[2306, 506], [2315 + Math.sin(t * 9) * 3, 470 - 5 * Math.sin(t * 7)], [2324, 506]])} fill="#FFE0A0" />
			<Glow x={2315} y={490} r={360} c="#FFB060" o={0.55 * flick(t, 9)} id="aDkl" />
			<King55 x={2120} y={690} k={2.55} id="aDk" flip upN={lerp(16, 84, ease(sp)) + talk} bendN={lerp(44, 16, ease(sp))} upF={14} bendF={46} tilt={4 + 2.5 * Math.sin(t * 3.1)} rim="#FFE0B0" lx={1} ly={0.1} stride={0.12} />
		</g>
		{/* the far row of nobles */}
		<g transform={layerT(cam, 0.7)}>
			<rect x={-1500} y={700} width={7000} height={500} fill="#1E140C" />
			{Array.from({length: 13}, (_, i) => <Noble55 key={i} x={120 + i * 170} y={770} k={1.75} id={`aDf${i}`} bow={14 + 3 * Math.sin(i * 1.7)} rim="#FFB060" lx={1} ly={0.15} fill="#120A07" />)}
		</g>
		{/* lamps */}
		<g transform={layerT(cam, 0.85)}>{Array.from({length: 7}, (_, i) => { const X = 200 + i * 420, by = 860; return <g key={i}>
			<path d={`M${X - 26},${by} L${X + 26},${by} L${X + 7},${by - 14} L${X + 6},${by - 150} L${X + 28},${by - 162} L${X - 28},${by - 162} L${X - 6},${by - 150} L${X - 7},${by - 14} Z`} fill="#1E120A" />
			<path d={sm([[X - 8, by - 166], [X + Math.sin(t * 9 + i) * 2, by - 200 - 4 * Math.sin(t * 7 + i)], [X + 8, by - 166]])} fill="#FFD890" />
			<Glow x={X} y={by - 180} r={260} c="#FFB060" o={0.55 * flick(t, i)} id={`aDl${i}`} /></g>; })}</g>
		{/* the near row */}
		<g transform={layerT(cam, 1)}>
			<path d="M-2000,880 L6000,880 L6000,1200 L-2000,1200 Z" fill="#24170E" />
			{Array.from({length: 14}, (_, i) => <path key={i} d={`M${-600 + i * 300},1080 L${-300 + i * 300},880`} stroke="#3A2618" strokeWidth={2} opacity={0.5} />)}
			{Array.from({length: 11}, (_, i) => { const X = 30 + i * 265 + (i >= 8 ? HE_X - (30 + 8 * 265) : 0); return <Noble55 key={i} x={X} y={1010} k={2.9} id={`aDn${i}`} bow={i === 8 ? 24 : 14 + 4 * Math.sin(i * 2.3)} rim="#FFB870" lx={1} ly={0.15} />; })}
		</g>
		{/* foreground pillars passing */}
		<g transform={layerT(cam, 1.55)}><Blur id="aDfp" s={7}>{[600, 1650, 4300].map((x, i) => <g key={i}><rect x={x} y={-100} width={120} height={1300} fill="#140806" /><path d={`M${x + 120},-100 L${x + 120},1200`} stroke="#FF9A50" strokeWidth={3} strokeOpacity={0.25} /></g>)}</Blur></g>
		<Drift t={t} n={50} x0={0} x1={1920} y0={200} y1={900} c="#FFD8A0" seed={41} o={0.4} r={2.2} vx={-40} />
	</Shell>; };

/* ============================== E · 33.15 the dolly comes to rest on one man: 何 lifts his head into the lamp light ============================== */
/** 何 kneeling, close: the rig's body with a real profile head (brow, nose, lips, chin) and a small 冠 held by a hairpin */
const HeClose: React.FC<{x: number; y: number; k: number; bow: number; tilt: number; lift: number}> = ({x, y, k, bow, tilt, lift}) => { const sk = kneel(bow); sk.tilt = tilt;
	const a = (tilt * Math.PI) / 180, R = (px: number, py: number): P => [sk.hd[0] + px * Math.cos(a) - py * Math.sin(a), sk.hd[1] + px * Math.sin(a) + py * Math.cos(a)];
	const face = sm(([[-10, -2], [-9.5, -9], [-4, -13.6], [3, -14], [8.4, -10.6], [10.8, -6], [11.6, -3.4], [11, -1.6], [13.4, 2], [14.8, 3.4], [12.2, 4.6], [12.6, 6], [11.6, 7], [12.1, 7.9], [11.2, 9.6], [10.2, 11.6], [7.4, 12.6], [2, 11], [-3, 9.5], [-8, 6], [-10.6, 2]] as P[]).map(([u, v]) => R(u, v)));
	const cap = sm(([[-4.5, -12.5], [-4, -19], [0, -22.5], [5.5, -21.5], [7.2, -16.5], [5.5, -12.2]] as P[]).map(([u, v]) => R(u, v)));
	const pin = sm(([[-9, -17.6], [12.5, -19.6], [12.5, -18.4], [-9, -16.4]] as P[]).map(([u, v]) => R(u, v)));
	return <Sil id="aEhe" x={x} y={y} k={k} rim={`rgb(255,${Math.round(196 + 30 * lift)},${Math.round(120 + 60 * lift)})`} lx={1} ly={-0.1 - 0.2 * lift} rimW={3 + 3.2 * lift}>
		<Body s={sk} dress="robe" hat="none" /><path d={face} /><path d={cap} /><path d={pin} /></Sil>; };
const SE: React.FC<{t: number}> = ({t}) => { const a = 33.15, st = 1 - Math.pow(1 - seg(t, a, a + 1.1), 3), cx = lerp(-240, 0, st) + 170 * seg(t, a + 1.05, 37.68), ps = 1 + 0.32 * seg(t, a + 0.75, 37.68);
	const lift = eio(seg(t, BT(59) - 0.15, BT(61) - 0.1)), bow = lerp(24, 3, lift), tilt = lerp(30, -8, lift);
	const lamp = 0.6 + 0.4 * (0.5 + 0.3 * Math.sin(t * 7.3) + 0.2 * Math.sin(t * 13.7 + 1));
	const cam: YCam = {x: cx, y: -90 * seg(t, a + 0.75, 37.68), s: ps};
	return <Shell t={t} id="E" bg="#0A0605" vig={0.7}>
		{/* behind: the hall out of focus — the far row, the dais light */}
		<HallBack cam={{x: 1500 + cx * 0.9, y: -40, s: 1}} t={t} id="aEh" blur={9} />
		<g transform={layerT(cam, 0.6)}><Blur id="aEfr" s={6}>
			<rect x={-800} y={760} width={4000} height={500} fill="#1A110A" />
			{Array.from({length: 6}, (_, i) => <Noble55 key={i} x={-120 + i * 380} y={930} k={3.4} id={`aEf${i}`} bow={16} rim="#FFB060" lx={1} ly={0.15} fill="#100906" />)}
		</Blur></g>
		<g transform={layerT(cam, 1, 960, 600)}>
			<path d="M-800,1000 L3000,1000 L3000,1300 L-800,1300 Z" fill="#20140C" />
			{/* the lamp before him */}
			<path d="M1430,1100 L1490,1100 L1468,1080 L1466,700 L1500,684 L1420,684 L1454,700 L1452,1080 Z" fill="#1A100A" />
			<path d={sm([[1446, 680], [1460 + Math.sin(t * 9) * 3, 616 - 6 * Math.sin(t * 7)], [1474, 680]])} fill="#FFE0A0" />
			<Glow x={1460 + 26 * Math.sin(t * 2.3)} y={650 + 12 * Math.sin(t * 3.1)} r={760} c="#FFB060" o={0.7 * lamp} id="aElg" />
			<Plume x={1462} y={600} h={420} w={50} c="#8A7060" o={0.18} id="aEsm" seed={t * 1.4} />
			<Glow x={1460} y={650} r={120} c="#FFF0C8" o={0.6 * lamp} id="aElc" />
			<HeClose x={760} y={1290} k={7.2} bow={bow} tilt={tilt} lift={lift} />
			{/* the light catching his face as he looks up */}
			<Glow x={lerp(1010, 1050, lift)} y={lerp(700, 560, lift)} r={110} c="#FFC880" o={0.22 * lift} id="aEfc" />
		</g>
		{/* incense smoke drifting through the lamp light */}
		<defs><filter id="aEwb" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={34} /></filter></defs>
		<g filter="url(#aEwb)">{Array.from({length: 6}, (_, i) => { const x = ((i * 420 + (t - 33.15) * (150 + 30 * i)) % 2600) - 400, y = 260 + 110 * i + 60 * Math.sin(t * 0.9 + i * 1.7);
			return <path key={i} d={sm([[x - 260, y + 40], [x - 90, y - 50 - 30 * Math.sin(t + i)], [x + 120, y + 10], [x + 300, y - 40], [x + 280, y + 40], [x + 40, y + 80], [x - 180, y + 90]])} fill={i % 2 ? '#C89A70' : '#A87E5C'} opacity={0.2} />; })}</g>
		<Drift t={t} n={40} x0={700} x1={1800} y0={300} y1={900} c="#FFE0B0" seed={51} o={0.45} r={2.4} vx={-12} />
		<Rising t={t} n={16} x0={1380} x1={1540} y0={300} y1={660} c="#FFD080" seed={53} v={60} o={0.6} r={1.8} sway={8} />
	</Shell>; };

/* ============================== F · 37.68 top-down: strings of cowries pour from a tipped basket into 何's raised hands ============================== */
/** 何's hands from above: dark red-brown sleeves from the bottom, the two hands cupped side by side, palms up, fingers toward
    the top (suggested by the scalloped edge, no outlines), a warm rim from the lamp */
const HandsUp: React.FC = () => { const hand = (cx: number, m: number) => { const X = (u: number) => cx + m * u;
	const tips: P[] = [[X(-46), 548], [X(-34), 520], [X(-20), 512], [X(-6), 506], [X(8), 510], [X(22), 516], [X(36), 530], [X(50), 556]];
	return <g>
		<path d={sm([[X(-80), 830], [X(-84), 700], [X(-66), 600], ...tips, [X(66), 600], [X(72), 700], [X(66), 830]])} fill="#5A3220" />
		<path d={sm([[X(-58), 790], [X(-60), 690], [X(-40), 620], [X(-6), 600], [X(30), 618], [X(48), 680], [X(46), 780], [X(4), 800]])} fill="#3A1E12" />
		<path d={sm([[X(-80), 770], [X(-116), 712], [X(-130), 660], [X(-122), 636], [X(-98), 664], [X(-76), 706]])} fill="#56301E" />
		<path d={sm([[X(-84), 700], [X(-66), 600], ...tips, [X(66), 600]], false)} stroke="#FFC890" strokeWidth={3.5} fill="none" opacity={0.55} />
	</g>; };
	return <g>
		<path d={sm([[540, 1220], [590, 960], [700, 840], [850, 806], [940, 880], [900, 1220]])} fill="#3E1610" />
		<path d={sm([[970, 1220], [930, 880], [1020, 806], [1170, 840], [1280, 960], [1330, 1220]])} fill="#3E1610" />
		<path d="M590,960 C640,870 740,820 850,808 M1020,808 C1130,820 1230,870 1280,960" stroke="#E8A060" strokeWidth={4} fill="none" opacity={0.5} />
		{hand(866, 1)}{hand(1004, -1)}
	</g>; };
const NSTR = 14;
const strT = (i: number) => 37.95 + i * 0.25;
const BASKET: P = [1340, 190];
/** one string: its head slides off the basket lip and falls (gravity) to its landing spot; the rest of the chain follows the
    head's path a little later, then lies in a loose curve across the hands */
const strPts = (t: number, i: number, lip: P): {pts: P[]; landed: number} => { const t0 = strT(i), T = 0.42, ang = (rnd(i, 5) - 0.5) * 1.2;
	const land: P = [935 + (rnd(i, 6) - 0.5) * 150, 650 + (rnd(i, 7) - 0.5) * 90 - i * 3];
	const head = (tau: number): P => { if (tau <= 0) return [lip[0] + 30 * tau * 10, lip[1] - 20 * tau * 10]; const u = Math.min(1, tau / T), e = u * u;
		return [lerp(lip[0], land[0], e), lerp(lip[1], land[1], e) - 60 * Math.sin(Math.PI * u) * (1 - u)]; };
	const dir = ang + (i % 2 ? Math.PI : 0), N = 8, sp = 50, curl = 0.5 + 0.5 * rnd(i, 9);
	const rest = (m: number): P => { const a = dir + curl * Math.sin(m * 0.7 + i); return [land[0] + Math.cos(a) * m * sp * 0.92, land[1] + Math.sin(a) * m * sp * 0.55]; };
	let landed = 0;
	const pts = Array.from({length: N}, (_, m) => { const tau = t - t0 - m * 0.05; if (tau <= T) return head(tau); landed++; const v = ease(Math.min(1, (tau - T) / 0.12)); const r = rest(m); return [lerp(land[0], r[0], v), lerp(land[1], r[1], v)] as P; });
	return {pts, landed}; };
const SF: React.FC<{t: number}> = ({t}) => { const a = 37.68, rotA = lerp(-9, 9, seg(t, a, 42.2)), ps = 1 + 0.26 * seg(t, a, 42.2);
	const tip = eio(seg(t, a + 0.05, 38.15)) * (1 - 0.3 * ease(seg(t, 41.3, 42.2)));
	const lip: P = [BASKET[0] - 150 * tip - 30, BASKET[1] + 130 * tip + 40];
	const strings = Array.from({length: NSTR}, (_, i) => { const t0 = strT(i); if (t < t0 - 0.05) return null; const {pts, landed} = strPts(t, i, lip);
		const sinceLand = t - t0 - 0.42, bounce = sinceLand > 0 ? 7 * Math.exp(-sinceLand * 10) * Math.abs(Math.sin(sinceLand * 28)) : 0;
		const lit = (k: number) => sinceLand > 0 ? cl(Math.exp(-sinceLand * 3.5) * (rnd(i * 12 + k, 3) > 0.55 ? 1 : 0.35)) : 0.15;
		void landed;
		return <CowrieString key={i} pts={pts.map(([x, y]) => [x, y - bounce] as P)} n={12} r={15} lit={lit} seed={i * 5} />; });
	const left = Math.max(0, NSTR - strings.filter(Boolean).length);
	return <Shell t={t} id="F" bg="#120A06" vig={0.6}>
		<defs><pattern id="aFmat" width="44" height="44" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="44" height="44" fill="#4A3220" /><rect width="22" height="44" fill="#553A26" /><path d="M0,0 L44,0 M0,22 L44,22" stroke="#2E1E12" strokeWidth={2} /></pattern></defs>
		<g transform={`translate(960 640) rotate(${f1(rotA)}) scale(${ps.toFixed(4)}) translate(-960 -640)`}>
			<rect x={-400} y={-400} width={2800} height={1900} fill="url(#aFmat)" />
			<rect x={-400} y={-400} width={2800} height={1900} fill="#140A05" opacity={0.4} />
			<Glow x={1150} y={420} r={950} c="#FFB060" o={0.3} id="aFlm" />
			<HandsUp />
			{strings}
			{/* the servant's sleeves from the top of the frame, hands on the rim, the basket tipping toward 何 */}
			<g transform={`translate(${f1(-40 * tip)},${f1(30 * tip)})`}>
				<path d={sm([[1080, -200], [1180, -200], [1200, 120], [1170, 200], [1110, 170], [1070, 40]])} fill="#2E1A10" />
				<path d={sm([[1500, -200], [1620, -200], [1610, 60], [1560, 180], [1500, 190], [1480, 100]])} fill="#2E1A10" />
				<path d="M1180,-200 C1196,0 1200,90 1176,196 M1500,-200 C1490,0 1488,100 1500,186" stroke="#C88A50" strokeWidth={3} fill="none" opacity={0.4} />
				<g transform={`translate(${BASKET[0]} ${BASKET[1]}) rotate(-38) scale(${(1 - 0.38 * tip).toFixed(3)} 1) rotate(38)`}>
					<ellipse rx={172} ry={172} fill="#6A4A26" /><ellipse rx={172} ry={172} fill="none" stroke="#3A2414" strokeWidth={12} />
					{Array.from({length: 18}, (_, i) => <path key={i} d={`M0,0 L${f1(162 * Math.cos((i / 18) * 2 * Math.PI))},${f1(162 * Math.sin((i / 18) * 2 * Math.PI))}`} stroke="#4A3018" strokeWidth={3} opacity={0.7} />)}
					{[50, 95, 140].map((r) => <circle key={r} r={r} fill="none" stroke="#7A5A30" strokeWidth={6} opacity={0.6} />)}
					<ellipse rx={136} ry={136} fill="#24160C" opacity={0.85} />
					{Array.from({length: Math.min(left, 6)}, (_, i) => <CowrieString key={i} pts={[[-90 + i * 8, -70 + i * 22], [-30, -50 + i * 24], [40, -64 + i * 26], [90 - i * 6, -40 + i * 20]]} n={6} r={13} seed={i * 3 + 50} lit={0.1} shadow={false} />)}
					<path d="M-172,0 A172,172 0 0 1 172,0" fill="none" stroke="#FFD8A0" strokeWidth={4} opacity={0.4} />
				</g>
				<path d={sm([[1150, 150], [1190, 130], [1210, 170], [1190, 210], [1150, 200]])} fill="#56301E" /><path d={sm([[1500, 150], [1540, 140], [1556, 180], [1530, 214], [1494, 200]])} fill="#56301E" />
			</g>
		</g>
		<Drift t={t} n={30} x0={300} x1={1800} y0={150} y1={1000} c="#FFE0B0" seed={61} o={0.35} r={2} vx={-10} />
	</Shell>; };

/* ============================== the router ============================== */
const SCENES: {id: string; t: number; C: React.FC<{t: number}>}[] = [
	{id: '1', t: 0, C: S1}, {id: '2', t: 5.98, C: S2}, {id: 'T', t: 9.03, C: ST}, {id: 'A', t: 15.03, C: SA}, {id: 'B', t: 19.56, C: SB},
	{id: 'C', t: 24.09, C: SC}, {id: 'D', t: 28.62, C: SD}, {id: 'E', t: 33.15, C: SE}, {id: 'F', t: 37.68, C: SF}];
export const Act1: React.FC<{t: number}> = ({t}) => { const s = [...SCENES].reverse().find((k) => t >= k.t - 1e-6) ?? SCENES[0];
	if (t >= 42.2 - 1e-6) return <AbsoluteFill style={{background: '#000'}} />;
	return <s.C t={t} />; };
void tube; void lerpP; void trackN; void Cowrie; void poseFK;
