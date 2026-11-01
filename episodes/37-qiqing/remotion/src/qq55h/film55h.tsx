import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Subs, Stamp, Seal} from '../qq50/kit50';
import {Zun, lookAt, Cam, V3, ZunLight} from './zun55h';
import {homeCam, rotL, HOME_EL, HOME_D} from './home55h';
import {thK, Glow, Vig, Plume, Person, YardBG, Tag30, rnd, P} from './kf55h';
import {Body, Sil, kneel} from './rig55h';
import {CARDS_ALL, CardD, HZ, ScaleLabel, Counter, Motes, Beam, Scale, Forge, Shards, Hall, HallStand, TitleText, TBack, SilZun,
	LY, LYlow, LM, L4c, LH, LTop, L2c, L6e} from './kfall55h';
/* ep55 · 何尊 — the film, picture only (FILM55; frame f = film time f / 30). Scenes are pure functions of the film time t.
   The 尊 holds HOME (home55h) across every cut; inside a shot the camera only orbits it (same size, same place) unless the
   shot is one of the scripted pushes (card 2 → the eyes; card 6 → the crane over the lip). Cuts on the script's card times
   (bar j at 1.4498 + 2.26415·j; T on drop 1 at 9.05). Motion per motion.md: every second has camera drift + an acting beat. */
const W = 1920, H = 1080;
export const BAR = (j: number) => 1.4498 + 2.26415 * j;
const cl = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const seg = (t: number, a: number, b: number) => cl((t - a) / (b - a));
const ease = (u: number) => u * u * (3 - 2 * u);
const eio = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const land = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : 1 - Math.exp(-6 * u) * Math.cos(9 * u));
const card = (id: string) => CARDS_ALL.find((c) => c.id === id)!;
const nextT = (id: string) => { const i = CARDS_ALL.findIndex((c) => c.id === id); return CARDS_ALL[i + 1]?.t ?? 140; };

/* ============================== the overlay at film time t ============================== */
const CPS = 16;   /* typing speed, characters per second (the house value, ep54 demo54core) */
const plain = (s: string) => s.replace(/[[\]]/g, '');
const FilmOverlay: React.FC<{t: number; c: CardD; label: number}> = ({t, c, label}) => { const rows = c.rows ?? [];
	const typed = c.t === 0 ? 1e9 : (t - c.t) * CPS, r0 = rows[0] ? plain(rows[0]).length : 0, n = [Math.min(r0, typed), Math.max(0, typed - r0)];
	const total = plain(rows.join('')).length, stampU = c.t === 0 ? 1 : seg(typed, total + 6, total + 6 + 0.35 * CPS);
	return <>
		{label > 0.01 && <div style={{position: 'absolute', inset: 0, opacity: label}}><ScaleLabel /></div>}
		{c.mode !== 'none' && rows.length > 0 && <Subs rows={rows.map((s, i) => ({s, n: n[i] ?? 0}))} th={thK} />}
		{c.st?.y && stampU > 0 && <div style={{position: 'absolute', inset: 0, opacity: stampU}}><Stamp y={c.st.y} place={c.st.place ?? ''} note={c.st.note} th={thK} /></div>}
		{c.mode !== 'none' && c.age && <Counter age={c.age} roll={c.roll} />}
		{c.mode !== 'none' && <Seal />}
	</>; };

/* ============================== camera helpers ============================== */
type CP = {az: number; el: number; D: number; T: V3; f: number; cx: number; cy: number};
/** the HOME camera at az as interpolable parameters */
const homeCP = (az: number): CP => { const c = homeCam(az); return {az, el: HOME_EL, D: HOME_D, T: [0, 0, 19.4], f: c.f, cx: c.cx, cy: c.cy}; };
const camOf = (p: CP): Cam => { const a = (p.az * Math.PI) / 180, e = (p.el * Math.PI) / 180;
	return lookAt([p.T[0] + p.D * Math.cos(e) * Math.cos(a), p.T[1] + p.D * Math.cos(e) * Math.sin(a), p.T[2] + p.D * Math.sin(e)], p.T, p.f, p.cx, p.cy); };
const mixCP = (a: CP, b: CP, u: number): CP => ({az: lerp(a.az, b.az, u), el: lerp(a.el, b.el, u), D: Math.exp(lerp(Math.log(a.D), Math.log(b.D), u)), T: [lerp(a.T[0], b.T[0], u), lerp(a.T[1], b.T[1], u), lerp(a.T[2], b.T[2], u)],
	f: lerp(a.f, b.f, u), cx: lerp(a.cx, b.cx, u), cy: lerp(a.cy, b.cy, u)});
const dimL = (L: ZunLight, k: number): ZunLight => ({...L, k: L.k * k, amb: L.amb * (0.4 + 0.6 * k), spec: L.spec * k, rim: L.rim ? {...L.rim, k: L.rim.k * k} : undefined});
/** a background layer that parallaxes with the orbit: far = small shift */
const Par: React.FC<{d: number; children: React.ReactNode; s?: number}> = ({d, children, s = 1.36}) => <g transform={`translate(${(960 + d).toFixed(1)},600) scale(${s}) translate(-960,-600)`}>{children}</g>;
/** an orbit across a card between two HOME views with the same box (30° ↔ 60°, or −30° ↔ −60°), and the parallax it implies */
const orbit = (t: number, a: number, b: number, az0: number, az1: number) => { const u = seg(t, a, b), az = lerp(az0, az1, 0.15 * u + 0.85 * ease(u)); return {az, d: -(az - az0) * 10 - (az0 === 60 || az0 === -60 ? Math.sign(az0) * 300 : 0)}; };
const flick = (t: number, s: number) => 0.85 + 0.1 * Math.sin(t * 7.3 + s) + 0.05 * Math.sin(t * 17.1 + s * 2);
const Rising: React.FC<{t: number; n: number; x0: number; x1: number; y0: number; y1: number; c: string; seed: number; v: number; o?: number; r?: number}> = ({t, n, x0, x1, y0, y1, c, seed, v, o = 0.6, r = 2.4}) => <g>
	{Array.from({length: n}, (_, i) => { const h = y1 - y0, y = y1 - (((rnd(i, seed + 1) * h) + t * v * (0.6 + 0.8 * rnd(i, seed + 5))) % h), x = x0 + rnd(i, seed) * (x1 - x0) + Math.sin(t * 0.9 + i) * 12;
		return <circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r={(0.6 + rnd(i, seed + 2) * r).toFixed(2)} fill={c} opacity={o * (0.3 + 0.7 * rnd(i, seed + 3))} />; })}</g>;
const Shell: React.FC<{bg: string; t: number; c: CardD; label?: number; vig?: number; children: React.ReactNode; top?: React.ReactNode}> = ({bg, t, c, label = 1, vig = 0.6, children, top}) => <AbsoluteFill style={{background: bg}}>
	<svg width={W} height={H} style={{position: 'absolute'}}>{children}</svg>
	<svg width={W} height={H} style={{position: 'absolute'}}><Vig id={`fv${c.id}`} a={vig} /></svg>
	{top}<FilmOverlay t={t} c={c} label={label} />
</AbsoluteFill>;

/* ============================== 1 · 0.00 the scrap yard ============================== */
const S1: React.FC<{t: number}> = ({t}) => { const c = card('1'), {az, d} = orbit(t, 0, nextT('1'), 30, 60);
	const swing = 5 * Math.exp(-t * 0.45) * Math.sin(t * 2.7), poise = 1590 + 26 * Math.exp(-t * 0.9) * Math.cos(t * 5.2);
	const cam = homeCam(az);
	return <Shell bg="#0E0B0A" t={t} c={c} vig={0.55}>
		<Par d={d}><YardBG /><Glow x={380} y={745} r={150} c="#FF8A34" o={0.35 * flick(t, 1)} id="f1fl" sy={0.7} />
			<Plume x={397} y={420} h={300} w={120} c="#7A6A62" o={0.3} id="f1sm" seed={t * 0.7} />
			<Person id="f1w" f={{kind: 'worker', lean: 8 + 2 * Math.sin(t * 1.3), stride: 0.1, hN: [26 + 4 * Math.sin(t * 6), -112 + 3 * Math.cos(t * 6)], hF: [22, -104]}} x={330} y={812} k={2.0} rim="#FFB874" lx={1} ly={0.2} />
			<path d="M372,586 L398,578 L402,602 L376,608 Z" fill="#D8C8A6" opacity={0.85} /></Par>
		<Scale poise={poise} />
		<HZ z={{az, light: LY, patina: 0.95, shadow: true}} id="f1z" />
		<g transform={`rotate(${swing.toFixed(2)} 760 400)`}><Tag30 cam={cam} /></g>
		<Rising t={t} n={90} x0={300} x1={1800} y0={200} y1={1000} c="#FFE2B8" seed={11} v={60} o={0.55} r={3.2} />
	</Shell>; };

/* ============================== 2 · 5.98 push in to the eyes ============================== */
const S2: React.FC<{t: number}> = ({t}) => { const c = card('2'), a = c.t, u = eio(seg(t, a + 0.15, nextT('2') - 0.05));
	const close: CP = {az: 10, el: 4, D: 132, T: [0, 0, 16.2], f: 3900, cx: 960, cy: 650};
	const cam = camOf(mixCP(homeCP(30), close, u)), dim = 1 - 0.55 * seg(t, nextT('2') - 0.55, nextT('2'));
	const L = rotL(dimL(u < 0.5 ? LYlow : L2c, dim), lerp(30, 10, u));
	return <Shell bg="#0E0A08" t={t} c={c} vig={0.62 + 0.1 * u} label={1 - seg(u, 0, 0.25)}>
		<defs><radialGradient id="f2bg" cx="70%" cy="60%" r="80%"><stop offset="0" stopColor="#5A3A26" /><stop offset="0.5" stopColor="#24180F" /><stop offset="1" stopColor="#0C0907" /></radialGradient>
			<filter id="f2bk" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={14} /></filter></defs>
		<g opacity={1 - seg(u, 0.1, 0.55)}><g transform={`translate(960 640) scale(${(1 + 0.9 * u).toFixed(3)}) translate(-960 -640)`}><YardBG /><rect width={W} height={H} fill="#1A0E08" opacity={0.25} /><Scale beam={false} /></g></g>
		<g opacity={seg(u, 0.2, 0.7)}><rect width={W} height={H} fill="url(#f2bg)" />
			<g filter="url(#f2bk)">{Array.from({length: 14}, (_, i) => <circle key={i} cx={1480 + rnd(i, 4) * 440 + Math.sin(t + i) * 10} cy={420 + rnd(i, 5) * 420} r={18 + rnd(i, 6) * 40} fill={i % 3 ? '#FFB070' : '#FF7A30'} opacity={0.18 + 0.2 * rnd(i, 7)} />)}</g></g>
		<Beam pts={[[1920, 300], [1920, 760], [700, 1000], [560, 820]]} c="#FFC890" o={0.16 * dim} id="f2bm" dir={[1, 0, 0, 0]} />
		<Zun cam={cam} light={L} id="f2z" patina={0.95} shadow={false} inscription={false} />
		<Rising t={t} n={110} x0={300} x1={1880} y0={200} y1={1040} c="#FFE2B8" seed={31} v={70} o={0.55 * (0.5 + 0.5 * dim)} r={2.6} />
	</Shell>; };

/* ============================== T · 9.05 the title slams; the silhouette orbits 60° → 30° and heats from the foot ============================== */
const ST: React.FC<{t: number}> = ({t}) => { const c = card('T'), a = c.t, b = nextT('T'), u = seg(t, a, b), az = 60 - 30 * eio(u), cam = homeCam(az);
	const h = ease(seg(t, a + 3.0, b - 0.1)), hEnd = ease(seg(t, b - 0.55, b)), s = (1 + 0.18 * (1 - land(seg(t, a, a + 0.5)))) * (1 + 0.06 * ease(seg(t, a + 0.5, b))), flash = Math.exp(-(t - a) * 7);
	const beat = 0.5 + 0.5 * Math.cos(((t - 1.4498) / 0.56604) * 2 * Math.PI);
	const sb = (1 - h).toFixed(3), sm = (1 - 0.55 * h - 0.4 * hEnd).toFixed(3), st = (1 - 0.85 * hEnd).toFixed(3);
	return <Shell bg="#070403" t={t} c={c} vig={0.75}
		top={<div style={{position: 'absolute', inset: 0, transform: `scale(${s.toFixed(4)})`, transformOrigin: '50% 60%', filter: `brightness(${(1 + 0.8 * flash + 0.12 * beat).toFixed(3)})`}}><TitleText /></div>}>
		<TBack heat={h} />
		<Glow x={960} y={600} r={700} c="#FF9A40" o={0.12 + 0.1 * beat} id="ftbt" sy={0.8} />
		<Glow x={960} y={600} r={620} c="#FFD088" o={0.5 * flash} id="ftfl" />
		{h > 0 && <Zun cam={cam} light={rotL(LM, az)} id="ftm" patina={0.3} molten={0.85} shadow={false} inscription={false} />}
		<defs><linearGradient id="fthg" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#fff" stopOpacity={sb} /><stop offset="0.5" stopColor="#fff" stopOpacity={sm} /><stop offset="0.85" stopColor="#fff" stopOpacity={st} /></linearGradient>
			<mask id="fthm" maskUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}><rect x={0} y={300} width={W} height={640} fill="url(#fthg)" /></mask></defs>
		<SilZun cam={cam} id="fts" rim="#FFD088" halo={h > 0.3 ? '#FF9A40' : '#FFB050'} haloO={0.9} mask="url(#fthm)" />
		<Rising t={t} n={130} x0={100} x1={1820} y0={80} y1={1060} c="#FFB060" seed={77} v={90 + 90 * h} o={0.65} r={3.4} />
	</Shell>; };

/* ============================== 3 · 15.03 born in the fire ============================== */
const S3: React.FC<{t: number}> = ({t}) => { const c = card('3'), u = seg(t, c.t, nextT('3')), {az, d} = orbit(t, c.t, nextT('3'), 30, 60);
	return <Shell bg="#070505" t={t} c={c}>
		<Par d={d}><Forge fire={1} pour id="f3" />
			<Glow x={358} y={648} r={170} c="#FFC060" o={0.35 * flick(t, 2)} id="f3pf" /><Glow x={200} y={760} r={260} c="#FF7A2A" o={0.25 * flick(t, 3)} id="f3fu" />
			<Person id="f3m" f={{kind: 'zhou', lean: -4 + 6 * Math.sin(t * 1.6), stride: 0.2, hN: [-36 + 6 * Math.sin(t * 1.6), -112 - 8 * Math.sin(t * 1.6)], hF: [-30, -100], flip: true}} x={1600} y={812} k={2.2} rim="#FFC070" lx={-1} ly={0.15} />
			<Plume x={900} y={330} h={300} w={160} c="#E8C8A8" o={0.16} id="f3s1" seed={1 + t * 0.8} /><Plume x={1020} y={340} h={260} w={140} c="#E8C8A8" o={0.13} id="f3s2" seed={3 + t * 0.7} /></Par>
		<Glow x={960} y={600} r={460} c="#FFB050" o={0.42 * flick(t, 4)} id="f3h" />
		<HZ z={{az, light: LM, patina: 0.3, molten: lerp(0.95, 0.82, u), shadow: false}} id="f3z" />
		<Shards />
		<Rising t={t} n={110} x0={300} x1={1600} y0={100} y1={960} c="#FFB050" seed={33} v={120} o={0.75} r={3.2} />
	</Shell>; };

/* ============================== 4 · 19.56 cooling; 何 bows ============================== */
const S4: React.FC<{t: number}> = ({t}) => { const c = card('4'), u = seg(t, c.t, nextT('4')), o = orbit(t, c.t, nextT('4'), 60, 30), az = o.az, d = -(az - 30) * 10;
	const bow = 12 + 9 * ease(seg(t, BAR(9) - 0.2, BAR(9) + 0.5)) - 4 * ease(seg(t, BAR(9) + 1.2, BAR(9) + 2.0));
	return <Shell bg="#070505" t={t} c={c}>
		<Par d={d}><Forge fire={0.45} id="f4" /><Glow x={200} y={760} r={240} c="#FF7A2A" o={0.2 * flick(t, 5)} id="f4fu" />
			<Sil id="f4he" x={330} y={806} k={2.25} rim="#FFB060" lx={1} ly={0.15}><Body s={kneel(bow)} dress="robe" hat="guan" /></Sil>
			<Plume x={930} y={340} h={300} w={150} c="#E8C8A8" o={0.12 * (1 - 0.6 * u)} id="f4st" seed={2 + t * 0.8} /></Par>
		<Glow x={960} y={600} r={420} c="#FFB050" o={0.3 - 0.12 * u} id="f4h" />
		<HZ z={{az, light: L4c, patina: 0.05, molten: lerp(0.45, 0.12, u), fresh: 0.6, shadow: true}} id="f4z" />
		<Shards />
		<Rising t={t} n={70} x0={400} x1={1500} y0={120} y1={940} c="#FFC070" seed={44} v={70} o={0.55} r={3} />
	</Shell>; };

/* ============================== 5 · 24.09 the hall: the king's hand, 何 bows deeper ============================== */
const S5: React.FC<{t: number}> = ({t}) => { const c = card('5'), {az} = orbit(t, c.t, nextT('5'), -30, -60), d = -(az + 30) * 10;
	const arm = ease(seg(t, c.t + 0.35, c.t + 1.5)), hand: P = [lerp(14, 44, arm), lerp(-92, -128, arm)];
	const bow = 10 + 8 * ease(seg(t, BAR(11) - 0.2, BAR(11) + 0.45));
	return <Shell bg="#0A0605" t={t} c={c} vig={0.65}>
		<Par d={d}><Hall people id="f5" stand={false} kingHand={hand} heBow={bow} />
			<Glow x={560} y={680} r={240} c="#FFB060" o={0.2 * flick(t, 6)} id="f5la" /><Glow x={1360} y={680} r={240} c="#FFB060" o={0.2 * flick(t, 7)} id="f5lb" /></Par>
		<HallStand />
		<HZ z={{az, light: LH, patina: 0.02, fresh: 0.62}} id="f5z" />
		<Rising t={t} n={70} x0={300} x1={1620} y0={160} y1={940} c="#FFD8A0" seed={55} v={50} o={0.45} r={3} />
	</Shell>; };

/* ============================== 6 · 28.62 daybreak in the workshop; the crane up over the lip and down into the mouth ============================== */
const S6: React.FC<{t: number}> = ({t}) => { const c = card('6'), a = c.t, u = eio(seg(t, a + 0.25, nextT('6') - 0.25));
	const end: CP = {az: -135, el: 66, D: 92, T: [0, 0, 18], f: 2500, cx: 960, cy: 640}, home = homeCP(-60);
	const p = u < 1e-4 ? home : mixCP(home, end, u), cam = camOf(p), drift = -60 - 4 * seg(t, a, a + 0.55);
	const camUse = u < 1e-4 ? homeCam(drift) : cam;
	return <Shell bg="#070505" t={t} c={c} label={1 - seg(u, 0, 0.15)}>
		<g opacity={1 - seg(u, 0.25, 0.6)}><g transform={`translate(0 ${(600 * u).toFixed(1)})`}><Par d={300 - 900 * u}><Forge fire={0.15} id="f6" /></Par>
			<Beam pts={[[820, 0], [1100, 0], [1260, 900], [660, 900]]} c="#FFE0A8" o={0.24} id="f6sh" /></g></g>
		<g opacity={seg(u, 0.3, 0.7)}><rect width={W} height={H} fill="#1E140C" /><Glow x={960} y={640} r={640} c="#FFB060" o={0.2} id="f6g" /></g>
		<Zun cam={camUse} light={u > 0.5 ? L6e : rotL(LTop, p.az)} id="f6z" patina={0} fresh={0.6} reveal={1} glow={0} shadow={u < 0.2} />
		<g opacity={1 - seg(u, 0, 0.2)}><Shards /></g>
		<Rising t={t} n={90} x0={500} x1={1460} y0={40} y1={900} c="#FFE6B8" seed={61} v={60} o={0.5} r={3} />
	</Shell>; };

/* ============================== the router ============================== */
const SCENES: {id: string; C: React.FC<{t: number}>}[] = [{id: '1', C: S1}, {id: '2', C: S2}, {id: 'T', C: ST}, {id: '3', C: S3}, {id: '4', C: S4}, {id: '5', C: S5}, {id: '6', C: S6}];
export const Film55: React.FC<{t: number}> = ({t}) => { const s = [...SCENES].reverse().find((k) => t >= card(k.id).t);
	if (!s || t >= nextT('6')) return <AbsoluteFill style={{background: '#000'}} />;
	return <s.C t={t} />; };
void ([] as V3[]);
