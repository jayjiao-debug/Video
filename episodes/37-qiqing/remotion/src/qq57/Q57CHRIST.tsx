import React from 'react';
import {AbsoluteFill, Composition, Img, registerRoot, staticFile, useCurrentFrame} from 'remotion';
import data from '../../public/ep57/christ/christ.json';
/* ep57 · 基督像 history, built live in Remotion in the episode's look (flat colour + ink line, warm rim light, faceless figures).
   Still layers are SVGs exported from the drawing code (tools/export_christ.py); everything that moves is built here.
   Shot A 「1922年，里约的天主教徒觉得这座城越来越不信神了，」 the 1920s Rio street (hist_b christ_1922) as 5 depth planes:
     the camera starts on the queue at the church's donation box and pulls back / tilts up to the mountain. One coin goes
     into the box on every beat (the man at the slot, the girl's toss, the woman's toss, the worker's flip), each one
     then flies up to the bare summit; from bar 2 coins rise from all over the town too. Widget: 1922 · count of coins.
   Shot B 「于是大家捐钱，在山顶立起了它。」 fixed camera beside the summit, the bay, Sugarloaf and the city far below:
     the pedestal is laid block by block (the stone pile shrinks), the scaffold tower climbs and its derrick lowers the
     body in four sections, one per beat, then the head; braced towers rise under the arms and their gin poles set the
     arms out to the sides (bar 3 downbeat = hands). Then the scaffold comes down top-first (the timber stack refills).
     Widgets: year 1926 → 1931 with progress, a stage checklist, a 30 m height mark, 28 m arm span, 38 m with pedestal.
   Each shot 5.016 s = 3 bars at 143.6 BPM (t = 0 on a downbeat, beat 0.418 s). */
const W = 1920, H = 1080, FPS = 30, BEAT = 0.418, SHOT = 5.016, INK = '#2A211B', GOLD = '#F2C66E';
const cl = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const sm = (u: number) => { const v = cl(u); return v * v * (3 - 2 * v); };
const eo = (u: number) => 1 - Math.pow(1 - cl(u), 3);
const eio = (u: number) => { const x = cl(u); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const back = (u: number) => { const x = cl(u) - 1; return 1 + 2.7 * x * x * x + 1.7 * x * x; };
type V2 = [number, number];
const D: any = data;
const lerp2 = (a: V2, b: V2, u: number): V2 => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
const bez = (p0: V2, p1: V2, p2: V2, u: number): V2 => [(1 - u) * (1 - u) * p0[0] + 2 * (1 - u) * u * p1[0] + u * u * p2[0], (1 - u) * (1 - u) * p0[1] + 2 * (1 - u) * u * p1[1] + u * u * p2[1]];
const pts = (ps: V2[] | number[][]) => ps.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
const mul = (seed: number) => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const src = (n: string) => staticFile(`ep57/christ/${n}.svg`);

/* ---------- the reference widgets ---------- */
const Widget: React.FC<{x: number; y: number; w: number; h: number; children: React.ReactNode; op?: number}> = ({x, y, w, h, children, op = 1}) =>
	<g opacity={op}><rect x={x} y={y} width={w} height={h} rx={18} fill="rgba(20,16,12,.72)" stroke="rgba(242,198,110,.85)" strokeWidth={2.5} />{children}</g>;
const T2: React.FC<{x: number; y: number; s: string; size: number; col?: string; anchor?: 'start' | 'middle' | 'end'; w?: number}> = ({x, y, s, size, col = '#FFF6E6', anchor = 'start', w = 900}) =>
	<text x={x} y={y} textAnchor={anchor} fontFamily="Noto Sans CJK SC" fontWeight={w} fontSize={size} fill={col} style={{fontVariantNumeric: 'tabular-nums'}}>{s}</text>;
const Callout: React.FC<{from: V2; to: V2; label: string; u: number; side?: number}> = ({from, to, label, u, side = 1}) => {
	if (u <= 0) return null; const a = cl(u / .5), b = cl((u - .4) / .4), mx = from[0] + (to[0] - from[0]) * a, my = from[1] + (to[1] - from[1]) * a;
	return <g><line x1={from[0]} y1={from[1]} x2={mx} y2={my} stroke={GOLD} strokeWidth={3} /><circle cx={from[0]} cy={from[1]} r={7} fill={GOLD} stroke={INK} strokeWidth={2} />
		<g opacity={b}><rect x={to[0] - (side > 0 ? 0 : 20 + label.length * 34)} y={to[1] - 30} width={20 + label.length * 34} height={50} rx={12} fill="rgba(20,16,12,.8)" stroke={GOLD} strokeWidth={2} />
		<T2 x={to[0] + (side > 0 ? 10 : -10)} y={to[1] + 7} s={label} size={30} col={GOLD} anchor={side > 0 ? 'start' : 'end'} /></g></g>; };
const Pill: React.FC<{x: number; y: number; s: string; size?: number; anchor?: 'start' | 'end'; col?: string; op?: number}> = ({x, y, s, size = 30, anchor = 'start', col = GOLD, op = 1}) => {
	const w = 22 + [...s].reduce((a, ch) => a + (ch.charCodeAt(0) > 255 ? size : size * .58), 0);
	return <g opacity={op}><rect x={anchor === 'start' ? x : x - w} y={y - size * .95} width={w} height={size * 1.6} rx={12} fill="rgba(20,16,12,.8)" stroke={GOLD} strokeWidth={2} />
		<T2 x={anchor === 'start' ? x + 11 : x - 11} y={y + size * .28} s={s} size={size} col={col} anchor={anchor} /></g>; };
const Coin: React.FC<{x: number; y: number; r: number; tilt?: number; op?: number}> = ({x, y, r, tilt = .62, op = 1}) =>
	<g opacity={op}><ellipse cx={x} cy={y} rx={r} ry={Math.max(.6, r * tilt)} fill={GOLD} stroke={INK} strokeWidth={r > 5 ? 1.8 : 1.1} />
		{tilt > .25 && <ellipse cx={x - r * .2} cy={y - r * .15 * tilt} rx={r * .5} ry={r * .3 * tilt} fill="#FFF0C2" />}</g>;

/* ================================================================ shot A · 1922, the street and the donation box */
type Pl = {z: number; cx: number; cy: number};
const camA = (t: number): Pl => { const u = eio(cl((t - .45) / 4.25)); return {z: 1.22 - .22 * u, cx: 880 + 80 * u, cy: 630 - 90 * u}; };
const plane = (c: Pl, k: number): Pl => ({z: 1 + (c.z - 1) * k, cx: 960 + (c.cx - 960) * k, cy: 540 + (c.cy - 540) * k});
const tfm = (p: Pl) => `translate(${(960 - p.cx * p.z).toFixed(3)}px,${(540 - p.cy * p.z).toFixed(3)}px) scale(${p.z.toFixed(5)})`;
const prj = (p: Pl, q: V2): V2 => [(q[0] - p.cx) * p.z + 960, (q[1] - p.cy) * p.z + 540];
const Lay: React.FC<{n: string; p: Pl; dx?: number}> = ({n, p, dx = 0}) =>
	<Img src={src(n)} style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transformOrigin: '0 0', transform: tfm(p) + (dx ? ` translate(${dx.toFixed(2)}px,0px)` : '')}} />;
const PSvg: React.FC<{p: Pl; children: React.ReactNode}> = ({p, children}) =>
	<svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', transformOrigin: '0 0', transform: tfm(p)}}>{children}</svg>;
const K_SKY = .04, K_FAR = .18, K_MT = .38, K_TOWN = .7;
const SLOT: V2 = [561, 637], SUM: V2 = [1333, 421];
const AR = D.arms;
/* person20's elbow rule (hist_b), as an offset from the shoulder-hand midpoint */
const elb = (a: any, h: V2): V2 => {
	const s: V2 = a.sF, mx = (s[0] + h[0]) / 2, my = (s[1] + h[1]) / 2, dx = h[0] - s[0], dy = h[1] - s[1], L = Math.hypot(dx, dy) || 1, b = a.h * .05;
	const e1: V2 = [mx - dy / L * b, my + dx / L * b], e2: V2 = [mx + dy / L * b, my - dx / L * b];
	let e = Math.abs(e1[0] - a.x) > Math.abs(e2[0] - a.x) ? e1 : e2;
	if (h[1] < s[1]) e = e1[1] > e2[1] ? e1 : e2;
	return [e[0] - mx, e[1] - my]; };
const reach = (a: any, h: V2): V2 => { const s: V2 = a.sF, L = Math.hypot(h[0] - s[0], h[1] - s[1]); return L > a.m ? [s[0] + (h[0] - s[0]) * a.m / L, s[1] + (h[1] - s[1]) * a.m / L] : h; };
type Key = [number, V2];
const pose = (a: any, keys: Key[], t: number) => {
	let i = 0; while (i < keys.length - 1 && t >= keys[i + 1][0]) i++;
	const [t0, h0] = keys[i], [t1, h1] = i < keys.length - 1 ? keys[i + 1] : keys[i];
	const u = t1 > t0 ? sm((t - t0) / (t1 - t0)) : 0, H0 = reach(a, h0), H1 = reach(a, h1), hand = lerp2(H0, H1, u), o = lerp2(elb(a, H0), elb(a, H1), u);
	return {hand, e: [(a.sF[0] + hand[0]) / 2 + o[0], (a.sF[1] + hand[1]) / 2 + o[1]] as V2}; };
const inHand = (a: any, hand: V2): V2 => [hand[0] + a.face * a.aw * .3, hand[1] - a.aw * .55];
const Arm: React.FC<{a: any; hand: V2; e: V2; coin?: boolean}> = ({a, hand, e, coin}) => {
	const p: V2[] = [a.sF, e, hand], rp = p.map((q) => [q[0] + a.aw * .3, q[1]]), c = inHand(a, hand), h = a.h;
	const ln = {fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
	return <g>
		<polyline points={pts(p)} stroke={INK} strokeWidth={a.aw + a.lw * 2} {...ln} /><polyline points={pts(p)} stroke={a.sleeve} strokeWidth={a.aw} {...ln} />
		<ellipse cx={hand[0]} cy={hand[1]} rx={a.aw * .55} ry={a.aw * .6} fill={a.skin} stroke={INK} strokeWidth={a.lw * .8} />
		{a.kind === 'worker' && <polyline points={pts([a.sF, lerp2(a.sF, e, .7)])} stroke={a.cloth2} strokeWidth={a.aw * 1.08} {...ln} />}
		{coin && <Coin x={c[0]} y={c[1]} r={h * (a.kind === 'dress' && h < 300 ? .032 : .022)} />}
		{a.bag && <g><polyline points={pts([hand, [hand[0] + a.face * h * .01, hand[1] + h * .04]])} stroke={INK} strokeWidth={2} {...ln} />
			<polygon points={pts([[hand[0] - h * .035, hand[1] + h * .04], [hand[0] + h * .035, hand[1] + h * .04], [hand[0] + h * .04, hand[1] + h * .1], [hand[0] - h * .04, hand[1] + h * .1]])} fill={a.bag} stroke={INK} strokeWidth={a.lw} strokeLinejoin="round" /></g>}
		<polyline points={pts(rp)} stroke={a.rimc} strokeWidth={a.rw * .8} opacity={.8} {...ln} />
	</g>; };
/* the donations: one coin into the box on every beat, 1 → 9 */
const bt = (b: number) => b * BEAT;
const T_MAN = [1, 4, 8].map(bt), T_GIRL = [2, 6].map(bt), T_WOM = [3, 7].map(bt), T_WRK = [5, 9].map(bt);
const T_BOX = [...T_MAN, ...T_GIRL, ...T_WOM, ...T_WRK].sort((a, b) => a - b);
const kMan: Key[] = (() => { const S: V2 = AR.man.hand, R0: V2 = AR.man.rest, k: Key[] = [[0, S]];
	T_MAN.forEach((ta, i) => { if (i) k.push([ta - .55, R0], [ta - .12, S]); k.push([ta + .05, S], [ta + .45, R0]); }); return k; })();
const kGirl: Key[] = (() => { const R0: V2 = AR.girl.rest, S: V2 = AR.girl.hand, k: Key[] = [[0, R0]];
	T_GIRL.forEach((ta) => k.push([ta - .6, R0], [ta - .32, S], [ta - .22, S], [ta + .25, R0])); return k; })();
const W_REL: V2 = [772, 680];
const kWom: Key[] = (() => { const S: V2 = AR.woman.hand, k: Key[] = [[0, S]];
	T_WOM.forEach((ta) => k.push([ta - .62, S], [ta - .34, W_REL], [ta - .24, W_REL], [ta + .2, S])); return k; })();
const K_COCK: V2 = [1046, 600], TR_WRK = T_WRK.map((ta) => ta - .78);
const kWrk: Key[] = (() => { const S: V2 = AR.worker.hand, k: Key[] = [[0, S]];
	TR_WRK.forEach((tr) => k.push([tr - .38, S], [tr - .14, K_COCK], [tr, S])); return k; })();
/* coins that rise from the whole town to the summit (seeded, smooth) */
const TOWN = (() => { const R = mul(1922), n = 34; return Array.from({length: n}, (_, i) => {
	const tl = bt(3.6 + 5.6 * i / (n - 1) + (R() - .5) * .4), x0 = 450 + R() * 980, y0 = 640 + R() * 60, dur = 1.0 + R() * .35;
	return {tl, dur, p0: [x0, y0] as V2, p1: [(x0 + SUM[0]) / 2 + (R() - .5) * 140, Math.min(y0, SUM[1]) - 120 - R() * 70] as V2, p2: [SUM[0] + (R() - .5) * 14, SUM[1] + (R() - .5) * 6] as V2}; })
	.sort((a, b) => a.tl - b.tl); })();
const BOX_FLY = 1.15, BOX_P0: V2 = [562, 628], BOX_P1: V2 = [720, 300];
/* where each arriving coin settles on the summit: a heap that grows row by row */
const HEAP = (() => { const R = mul(31), o: V2[] = []; for (let r = 0; r < 9; r++) { const n = 9 - r;
	for (let j = 0; j < n; j++) o.push([SUM[0] + (j - (n - 1) / 2) * 7.4 + (R() - .5) * 1.6, SUM[1] + 3 - r * 4.3 + (R() - .5) * 1.2]); } return o; })();

const ShotA: React.FC<{t: number}> = ({t}) => {
	const cam = camA(t), pS = plane(cam, K_SKY), pF = plane(cam, K_FAR), pM = plane(cam, K_MT), pT = plane(cam, K_TOWN), p1 = plane(cam, 1);
	const man = pose(AR.man, kMan, t), girl = pose(AR.girl, kGirl, t), wom = pose(AR.woman, kWom, t), wrk = pose(AR.worker, kWrk, t);
	const prev = (ts: number[], i: number) => (i ? ts[i - 1] : -9);
	const manCoin = T_MAN.some((ta, i) => t < ta - .12 && (i === 0 || t > ta - .55));
	const girlCoin = T_GIRL.some((ta, i) => t < ta - .3 && t > prev(T_GIRL, i) + .3);
	const womCoin = T_WOM.some((ta, i) => t < ta - .32 && t > prev(T_WOM, i) + .35);
	const wrkCoin = TR_WRK.some((tr, i) => t < tr && t > prev(TR_WRK, i) + .5);
	/* coins in the air near the box (street plane) */
	const air: React.ReactNode[] = [];
	T_MAN.forEach((ta, i) => { const u = (t - (ta - .12)) / .12; if (u < 0 || u >= 1) return; const p0 = inHand(AR.man, reach(AR.man, AR.man.hand));
		const q = lerp2(p0, [SLOT[0], SLOT[1] + 2], sm(u)); air.push(<Coin key={`m${i}`} x={q[0]} y={q[1]} r={8.5} tilt={.62 - .5 * sm(u)} />); });
	T_GIRL.forEach((ta, i) => { const u = (t - (ta - .3)) / .3; if (u < 0 || u >= 1) return; const p0 = inHand(AR.girl, reach(AR.girl, AR.girl.hand));
		const q = bez(p0, [548, 600], [SLOT[0], SLOT[1] + 2], u); air.push(<Coin key={`g${i}`} x={q[0]} y={q[1]} r={7} tilt={.62 - .45 * cl((u - .7) / .3)} />); });
	T_WOM.forEach((ta, i) => { const u = (t - (ta - .32)) / .32; if (u < 0 || u >= 1) return; const p0 = inHand(AR.woman, reach(AR.woman, W_REL));
		const q = bez(p0, [655, 555], [SLOT[0], SLOT[1] + 2], u); air.push(<Coin key={`w${i}`} x={q[0]} y={q[1]} r={7.5} tilt={.62 - .45 * cl((u - .7) / .3)} />); });
	T_WRK.forEach((ta, i) => { const tr = TR_WRK[i], u = (t - tr) / (ta - tr); if (u < 0 || u >= 1) return; const p0 = inHand(AR.worker, AR.worker.hand);
		const q = bez(p0, [800, 290], [SLOT[0], SLOT[1] + 2], u); air.push(<Coin key={`k${i}`} x={q[0]} y={q[1]} r={9} tilt={u > .85 ? .15 : .12 + .55 * Math.abs(Math.cos((t - tr) * 13))} />); });
	/* the box answers each coin: the brass cross glows, the 捐 badge pulses */
	const lastBox = Math.max(-9, ...T_BOX.filter((ta) => ta <= t)), pu = 1 - eo((t - lastBox) / .35);
	/* coins flying to the summit */
	const flyBox = T_BOX.map((ta) => ({t0: ta + .04, dur: BOX_FLY, p0: BOX_P0, p1: BOX_P1, p2: SUM, k0: 1, r0: 11}));
	const flyTown = TOWN.map((c) => ({t0: c.tl, dur: c.dur, p0: c.p0, p1: c.p1, p2: c.p2, k0: K_TOWN, r0: 6.5}));
	const flight = (f: any, key: string) => { const u0 = (t - f.t0) / f.dur; if (u0 < 0 || u0 >= 1) return null;
		const at = (w: number) => { const u = eio(w), pl = plane(cam, f.k0 + (K_MT - f.k0) * u); return {s: prj(pl, bez(f.p0, f.p1, f.p2, u)), r: (f.r0 - (f.r0 - 3.4) * u) * pl.z}; };
		const c = at(u0), tr = [0, .025, .05, .075, .1].map((d) => at(Math.max(0, u0 - d)).s);
		return <g key={key} opacity={u0 < .06 ? u0 / .06 : 1}><polyline points={pts(tr)} fill="none" stroke="#FFE7A8" strokeWidth={c.r * 1.1} strokeLinecap="round" strokeLinejoin="round" opacity={.5} />
			<Coin x={c.s[0]} y={c.s[1]} r={c.r} /></g>; };
	const arrivals = [...flyBox, ...flyTown].map((f) => f.t0 + f.dur).filter((x) => x <= t).sort((a, b) => a - b), nArr = arrivals.length;
	/* the route the money takes: box → summit, dotted in during bar 1–2 */
	const gU = sm((t - bt(2.5)) / bt(3)), route = gU > 0 && Array.from({length: 28}, (_, i) => { const u = (i + .5) / 28; if (u > gU) return null;
		const pl = plane(cam, 1 + (K_MT - 1) * u), s = prj(pl, bez(BOX_P0, BOX_P1, SUM, u));
		return <circle key={i} cx={s[0]} cy={s[1]} r={3 * pl.z} fill={GOLD} stroke={INK} strokeWidth={1.2} opacity={.8} />; });
	const count = T_BOX.filter((ta) => ta <= t).length + TOWN.filter((c) => c.tl <= t).length;
	const lastInc = Math.max(-9, ...T_BOX.filter((ta) => ta <= t), ...TOWN.map((c) => c.tl).filter((x) => x <= t)), bump = 1 + .16 * (1 - eo((t - lastInc) / .25));
	const sumS = prj(pM, SUM);
	return <AbsoluteFill style={{background: '#6C83AA'}}>
		<Lay n="a_sky" p={pS} /><Lay n="a_far" p={pF} /><Lay n="a_mount" p={pM} />
		<PSvg p={pM}>
			<defs><radialGradient id="sg"><stop offset="0" stopColor="#FFF3C4" stopOpacity=".95" /><stop offset=".45" stopColor="#FFD98A" stopOpacity=".5" /><stop offset="1" stopColor="#FFD98A" stopOpacity="0" /></radialGradient></defs>
			{nArr > 0 && <circle cx={SUM[0]} cy={SUM[1] - 8} r={26 + 1.4 * nArr} fill="url(#sg)" opacity={cl(.3 + .02 * nArr, 0, .9)} />}
			{arrivals.map((ta, i) => { const q = HEAP[Math.min(i, HEAP.length - 1)], dy = -9 * (1 - eo((t - ta) / .15));
				return <Coin key={`h${i}`} x={q[0]} y={q[1] + dy} r={3.8} tilt={.55} />; })}
			{arrivals.map((ta, i) => { const u = (t - ta) / .4; if (u >= 1) return null;
				return <circle key={i} cx={SUM[0]} cy={SUM[1] - 6} r={6 + 18 * eo(u)} fill="none" stroke="#FFF3C4" strokeWidth={2.4} opacity={.9 * (1 - u)} />; })}
		</PSvg>
		<Lay n="a_town" p={pT} />
		<svg width={W} height={H} style={{position: 'absolute'}}>{flyTown.map((f, i) => flight(f, `t${i}`))}</svg>
		<Lay n="a_street" p={p1} /><Lay n="a_tram" p={p1} dx={150 * t / SHOT} /><Lay n="a_mid" p={p1} /><Lay n="a_near" p={p1} />
		<PSvg p={p1}>
			<defs><radialGradient id="bg"><stop offset="0" stopColor="#FFF0C2" stopOpacity="1" /><stop offset="1" stopColor="#FFE6A8" stopOpacity="0" /></radialGradient></defs>
			<ellipse cx={560} cy={684} rx={44} ry={46} fill="url(#bg)" opacity={.85 * pu} />
			<path d="M560,662 L560,706 M546,676 L574,676" stroke="#FFF4CF" strokeWidth={5} strokeLinecap="round" opacity={pu} />
			<ellipse cx={SLOT[0]} cy={SLOT[1]} rx={22} ry={6} fill="#FFE6A8" opacity={.7 * pu} />
			<g transform={`translate(468,600) scale(${1 + .16 * pu})`}><circle r={36} fill={GOLD} stroke={INK} strokeWidth={3.5} /><circle r={28} fill="none" stroke="#C9953C" strokeWidth={2.5} />
				<text y={15} fontFamily="Noto Sans CJK SC" fontWeight={900} fontSize={40} textAnchor="middle" fill={INK}>捐</text></g>
		</PSvg>
		<Lay n="a_girl" p={p1} /><PSvg p={p1}><Arm a={AR.girl} hand={girl.hand} e={girl.e} coin={girlCoin} /></PSvg>
		<Lay n="a_man" p={p1} /><PSvg p={p1}><Arm a={AR.man} hand={man.hand} e={man.e} coin={manCoin} /></PSvg>
		<Lay n="a_woman" p={p1} /><PSvg p={p1}><Arm a={AR.woman} hand={wom.hand} e={wom.e} coin={womCoin} /></PSvg>
		<Lay n="a_oldman" p={p1} />
		<Lay n="a_worker" p={p1} /><PSvg p={p1}><Arm a={AR.worker} hand={wrk.hand} e={wrk.e} coin={wrkCoin} />{air}</PSvg>
		<svg width={W} height={H} style={{position: 'absolute'}}>
			{route}
			{flyBox.map((f, i) => flight(f, `b${i}`))}
			<Callout from={[sumS[0], sumS[1] - 6]} to={[1440, 524]} label="科尔科瓦多山顶" u={(t - bt(8)) / .6} />
			<Widget x={1440} y={150} w={380} h={282} op={cl(t / .3)}>
				<T2 x={1468} y={200} s="里约热内卢" size={32} col={GOLD} />
				<T2 x={1468} y={272} s="1922 年" size={60} />
				<T2 x={1468} y={320} s="天主教会发起募捐" size={30} col="#CFC3AE" />
				<Coin x={1494} y={384} r={20} />
				<g transform={`translate(1530,400) scale(${bump})`}><T2 x={0} y={0} s={`× ${count}`} size={48} col={GOLD} /></g>
				<T2 x={1530 + bump * 27 * (2.4 + String(count).length) + 8} y={398} s="枚" size={30} col="#CFC3AE" />
			</Widget>
		</svg>
	</AbsoluteFill>;
};

/* ================================================================ shot B · 1926 → 1931, the statue built on the summit */
const SY = .5093, SX = .94 * SY, X0 = 760, YB = 828, YG = 2187.5, TOPH = 1052;
const sx = (u: number) => X0 + (u - 840) * SX, sy = (v: number) => YB + (v - 1948) * SY;
const GT = `translate(${X0},${YB}) scale(${SX},${SY}) translate(-840,-1948)`;
const NS = {vectorEffect: 'non-scaling-stroke' as const};
const TIM = '#9A7650', TIM_L = '#B08A5C';
const Tim: React.FC<{a: V2; b: V2; w?: number; c?: string}> = ({a, b, w = 2.2, c = TIM}) => <g>
	<line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={INK} strokeWidth={w + 2} strokeLinecap="round" opacity={.9} {...NS} />
	<line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={c} strokeWidth={w} strokeLinecap="round" {...NS} /></g>;
/* time keys (in beats) → eased piecewise value */
const keyed = (keys: [number, number][], b: number) => { if (b <= keys[0][0]) return keys[0][1];
	for (let i = 0; i < keys.length - 1; i++) { const [b0, v0] = keys[i], [b1, v1] = keys[i + 1]; if (b <= b1) return v0 + (v1 - v0) * sm((b - b0) / (b1 - b0)); }
	return keys[keys.length - 1][1]; };
const T_KEYS: [number, number][] = [[0, 1880], [1.0, 1880], [1.4, 1688], [2.0, 1688], [2.4, 1468], [3.0, 1468], [3.4, 1318], [4.0, 1318], [4.4, 1164], [5.0, 1164], [5.4, 1040], [8.4, 1040], [10.0, YG]];
const TA_KEYS: [number, number][] = [[0, YG], [3.6, YG], [5.8, 1244], [8.6, 1244], [10.1, YG]];
const DESC = .6;   // beats a piece takes to come down
type Piece = {id: string; clip: number[][]; land: number; drop: number; hook: V2; by: 'M' | 'L' | 'R'};
const rect = (x0: number, y0: number, x1: number, y1: number) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
const PIECES: Piece[] = [
	{id: 's1', clip: rect(690, 1700, 995, 1962), land: 2, drop: 52, hook: [840, 1700], by: 'M'},
	{id: 's2', clip: rect(690, 1480, 995, 1700), land: 3, drop: 52, hook: [840, 1480], by: 'M'},
	{id: 's3', clip: rect(600, 1330, 1100, 1480), land: 4, drop: 52, hook: [840, 1330], by: 'M'},
	{id: 's4', clip: [[714, 1166], [785, 1166], [785, 1178], [895, 1178], [895, 1166], [958, 1166], [958, 1330], [714, 1330]], land: 5, drop: 52, hook: [840, 1180], by: 'M'},
	{id: 'hd', clip: rect(785, 1040, 895, 1178), land: 6, drop: 48, hook: [840, TOPH], by: 'M'},
	{id: 'l1', clip: rect(540, 1140, 714, 1345), land: 7, drop: 46, hook: [627, 1201], by: 'L'},
	{id: 'r1', clip: rect(958, 1140, 1130, 1345), land: 7, drop: 46, hook: [1044, 1206], by: 'R'},
	{id: 'l2', clip: rect(360, 1140, 540, 1345), land: 8, drop: 46, hook: [455, 1195], by: 'L'},
	{id: 'r2', clip: rect(1130, 1140, 1305, 1345), land: 8, drop: 46, hook: [1215, 1181], by: 'R'},
];
const SEAMS: {land: number; a: V2; b: V2}[] = [{land: 3, a: [690, 1700], b: [995, 1700]}, {land: 4, a: [690, 1480], b: [995, 1480]}, {land: 5, a: [690, 1330], b: [995, 1330]},
	{land: 6, a: [785, 1178], b: [895, 1178]}, {land: 7, a: [714, 1140], b: [714, 1345]}, {land: 7, a: [958, 1140], b: [958, 1345]}, {land: 8, a: [540, 1140], b: [540, 1345]}, {land: 8, a: [1130, 1140], b: [1130, 1345]}];
const DUST: Record<string, V2[]> = {s1: [[735, 1946], [963, 1946]], s2: [[742, 1700], [953, 1700]], s3: [[724, 1480], [951, 1480]], s4: [[720, 1330], [951, 1330]], hd: [[798, 1176], [882, 1176]],
	l1: [[714, 1330]], r1: [[958, 1334]], l2: [[515, 1260]], r2: [[1150, 1290]]};
const PED = (() => { const o: {x0: number; x1: number; y0: number; y1: number; land: number; c: number; j: number}[] = []; const ch = (YG - 1948) / 3;
	for (let c = 0; c < 3; c++) for (let j = 0; j < 4; j++) o.push({x0: 700 + j * 70, x1: 770 + j * 70, y1: YG - c * ch, y0: YG - (c + 1) * ch, land: (c + 1) / 3 - (3 - j) * .1, c, j}); return o; })();
const PILE = (() => { const o: V2[] = []; [[5, 0], [4, 15], [3, 30]].forEach(([n, dx], r) => { for (let i = 0; i < n; i++) o.push([1350 + dx + i * 31, YG - r * 19]); }); return o; })();
const LEDG = Array.from({length: 13}, (_, k) => 1020 + 96 * k);

const Worker: React.FC<{u: number; v: number; pose?: 'down' | 'up' | 'carry'; shirt?: string; ground?: boolean}> = ({u, v, pose = 'down', shirt = '#ECE4D4', ground}) => {
	const P = (q: number[][]) => q.map(([x, y]) => `${(u + x).toFixed(1)},${(v + y).toFixed(1)}`).join(' ');
	const fr = pose === 'up' ? [[7, -41], [13, -52], [12, -64]] : pose === 'carry' ? [[7, -41], [14, -34], [7, -29]] : [[7, -41], [10, -33], [10, -25]];
	const bk = pose === 'carry' ? [[-7, -41], [-11, -34], [-4, -29]] : [[-7, -41], [-10, -33], [-10, -25]];
	const sk = '#B98A6A', st = {strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none', ...NS};
	return <g>
		{ground && <ellipse cx={u - 7} cy={v} rx={17} ry={3.5} fill="#3A2E28" opacity={.3} />}
		<polyline points={P(bk)} stroke={INK} strokeWidth={4.4} {...st} /><polyline points={P(bk)} stroke={shirt} strokeWidth={2.4} {...st} />
		<polygon points={P([[-6, -26], [-1, -26], [-2, 0], [-8, 0]])} fill="#4A4038" stroke={INK} strokeWidth={1.1} {...NS} />
		<polygon points={P([[1, -26], [6, -26], [8, 0], [2, 0]])} fill="#4A4038" stroke={INK} strokeWidth={1.1} {...NS} />
		<polygon points={P([[-8, -44], [8, -44], [9, -25], [-9, -25]])} fill={shirt} stroke={INK} strokeWidth={1.1} {...NS} />
		<ellipse cx={u} cy={v - 49.5} rx={5.4} ry={5.6} fill={sk} stroke={INK} strokeWidth={1.1} {...NS} />
		<polygon points={P([[-6, -51], [-5, -55.5], [0, -57], [5, -55.5], [6, -51], [10, -50.5]])} fill="#5A4636" stroke={INK} strokeWidth={1.1} {...NS} />
		{pose === 'carry' && <rect x={u - 9} y={v - 37} width={18} height={11} fill="#A39A8D" stroke={INK} strokeWidth={1.1} {...NS} />}
		<polyline points={P(fr)} stroke={INK} strokeWidth={4.4} {...st} /><polyline points={P(fr)} stroke={shirt} strokeWidth={2.4} {...st} />
		<polyline points={P([[9, -43], [10, -26], [7, -1]])} stroke="#FFE1A0" strokeWidth={1.2} opacity={.85} {...st} />
	</g>; };

const ShotB: React.FC<{t: number}> = ({t}) => {
	const b = t / BEAT, T = keyed(T_KEYS, b), TA = keyed(TA_KEYS, b);
	const pieceU = (p: Piece) => (b - (p.land - DESC)) / DESC;
	const landedBlocks = PED.filter((q) => b >= q.land).length;
	const used = cl((YG - T) / (YG - 1040)) * .65 + cl((YG - TA) / (YG - 1244)) * .35, planks = 1 + Math.round(9 * (1 - used));
	const deck = Math.min(T + 60, YG), fold = sm((b - 8.2) / .4), mh = 70 * (1 - fold), tip = lerp2([840, T - 52], [975, T - 8], fold);
	const towerOn = T < YG - 4, armOn = TA < YG - 4;
	const o: React.ReactNode[] = [];
	/* the cast shadow (sun on the right) grows with the pedestal and the figure */
	{ const LANDS0: [number, number][] = [[2, 1700], [3, 1480], [4, 1330], [5, 1176], [6, TOPH]]; let top = 1948; LANDS0.forEach(([bl, tp]) => { if (b >= bl) top = tp; });
		const len = (120 + 300 * (1948 - top) / 896) * cl(landedBlocks / 6);
		if (len > 0) o.push(<polygon key="shadow" points={pts([[704, YG - 3], [704, YG + 10], [704 - len, YG + 34], [704 - len + 70, YG + 4]])} fill="#3A2E28" opacity={.34} />); }
	o.push(<rect key="plinth" x={686} y={YG - 12} width={308} height={12} fill="#7E766C" stroke={INK} strokeWidth={1.6} {...NS} />);
	/* props on the platform: the timber stack (feeds the scaffold), the stone pile (feeds the pedestal) */
	for (let i = 0; i < planks; i++) o.push(<rect key={`pk${i}`} x={205 + (i % 2) * 6} y={YG - 9 * (i + 1)} width={150} height={9} fill={i % 2 ? TIM_L : '#C49A62'} stroke={INK} strokeWidth={1.3} {...NS} />);
	PILE.slice(0, Math.max(0, 12 - landedBlocks)).forEach(([x, y], i) => o.push(<rect key={`pl${i}`} x={x} y={y - 19} width={29} height={19} fill={i % 2 ? '#A39A8D' : '#968D81'} stroke={INK} strokeWidth={1.3} {...NS} />));
	/* back scaffolding: arm towers, then the central tower round the figure */
	if (armOn) for (const [xa, xb] of [[395, 565], [1115, 1285]]) { const xm = (xa + xb) / 2;
		for (const x of [xa, xm, xb]) o.push(<Tim key={`ap${x}`} a={[x, YG]} b={[x, TA]} />);
		for (let y = 1250; y < YG; y += 110) { const e = sm((y - TA - 4) / 40); if (e <= 0) continue; o.push(<Tim key={`al${xa}${y}`} a={[xa - 10, y]} b={[xa - 10 + (xb - xa + 20) * e, y]} w={1.8} />); }
		for (let y = 1250; y < YG - 110; y += 220) { if (y < TA) continue; o.push(<Tim key={`ab${xa}${y}`} a={[xa, y]} b={[xm, y + 110]} w={1.4} />); if (y + 110 >= TA) o.push(<Tim key={`ac${xa}${y}`} a={[xm, y + 110]} b={[xb, Math.min(YG, y + 220)]} w={1.4} />); } }
	if (towerOn) { for (const x of [700, 760, 920, 980]) o.push(<Tim key={`tp${x}`} a={[x, YG]} b={[x, T]} />);
		LEDG.forEach((y, k) => { const e = sm((y - T - 6) / 40); if (e <= 0 || k % 2) return; o.push(<Tim key={`tl${k}`} a={[680, y]} b={[680 + 320 * e, y]} w={1.8} />);
			if (y + 96 < YG && y + 96 > T) o.push(<Tim key={`tb${k}`} a={k % 4 ? [700, y] : [760, y]} b={k % 4 ? [760, y + 96] : [700, y + 96]} w={1.3} />, <Tim key={`tc${k}`} a={k % 4 ? [920, y] : [980, y]} b={k % 4 ? [980, y + 96] : [920, y + 96]} w={1.3} />); }); }
	/* the pedestal, block by block */
	PED.forEach((q, i) => { const u = (b - (q.land - .35)) / .35; if (u < 0) return; const dy = -24 * (1 - eo(u));
		o.push(<rect key={`pd${i}`} x={q.x0} y={q.y0 + dy} width={q.x1 - q.x0} height={q.y1 - q.y0} fill={(q.c + q.j) % 2 ? '#A69D90' : '#9A9185'} stroke={INK} strokeWidth={1.6} {...NS} />);
		if (q.j === 3) o.push(<line key={`pr${i}`} x1={q.x1 - 4} y1={q.y0 + dy + 4} x2={q.x1 - 4} y2={q.y1 + dy - 4} stroke="#FFE1A0" strokeWidth={2} opacity={.8} {...NS} />); });
	{ const u = (b - .75) / .3; if (u >= 0) o.push(<rect key="slab" x={690} y={1937 - 20 * (1 - eo(u))} width={300} height={12} fill="#B3AA9C" stroke={INK} strokeWidth={1.8} {...NS} />); }
	/* the statue: each piece comes down on its rope and lands on its beat */
	const dust: React.ReactNode[] = [];
	for (const p of PIECES) { const u = pieceU(p); if (u < 0) continue; const off = -p.drop * (1 - eo(u));
		o.push(<g key={p.id} transform={`translate(0,${off.toFixed(2)})`}><use href="#sv" clipPath={`url(#cp_${p.id})`} /></g>);
		const du = (b - p.land) / .7; if (du > 0 && du < 1) (DUST[p.id] || []).forEach(([x, y], j) => [-1, 1].forEach((s) => dust.push(
			<circle key={`d${p.id}${j}${s}`} cx={x + s * 30 * eo(du)} cy={y - 6 - 10 * eo(du)} r={8 + 14 * eo(du)} fill="#EFE5D3" opacity={.6 * (1 - du)} />))); }
	o.push(<g key="seams" clipPath="url(#cp_sil)">{SEAMS.filter((s) => b >= s.land).map((s, i) => <line key={i} x1={s.a[0]} y1={s.a[1]} x2={s.b[0]} y2={s.b[1]} stroke={INK} strokeWidth={1.3} opacity={.32} {...NS} />)}</g>);
	o.push(<g key="dust">{dust}</g>);
	/* front: ledgers passing in front of the figure, the working deck, the arm-tower caps */
	if (towerOn) { LEDG.forEach((y, k) => { const e = sm((y - T - 6) / 40); if (e <= 0 || !(k % 2)) return; o.push(<Tim key={`fl${k}`} a={[680, y]} b={[680 + 320 * e, y]} w={1.8} c={TIM_L} />); });
		if (deck < YG - 4) o.push(<Tim key="deck" a={[664, deck]} b={[1016, deck]} w={3.2} c="#C49A62" />); }
	if (armOn && TA <= 1250) { const e = sm((1250 - TA) / 6) * (1 - sm((b - 8.7) / .2));
		o.push(<Tim key="capL" a={[375, 1244]} b={[585, 1244]} w={2.6} c={TIM_L} />, <Tim key="capR" a={[1095, 1244]} b={[1305, 1244]} w={2.6} c={TIM_L} />);
		if (e > 0) o.push(<Tim key="lkL" a={[565, 1244]} b={[565 + 135 * e, 1244]} w={1.8} c={TIM_L} />, <Tim key="lkR" a={[1115, 1244]} b={[1115 - 135 * e, 1244]} w={1.8} c={TIM_L} />); }
	/* the main derrick on the tower top: mast, boom, topping lift, rope and hook */
	const hookAt = (p: Piece, u: number): V2 => [p.hook[0], p.hook[1] - p.drop * (1 - eo(u))];
	if (towerOn && fold < 1) { const mt: V2 = [980, T - mh];
		o.push(<Tim key="mast" a={[980, T]} b={mt} w={2.6} c="#7A5A3A" />, <Tim key="boom" a={[980, T]} b={tip} w={2.4} c="#7A5A3A" />);
		o.push(<line key="lift" x1={mt[0]} y1={mt[1]} x2={tip[0]} y2={tip[1]} stroke={INK} strokeWidth={1.2} {...NS} />);
		const cur = PIECES.find((p) => p.by === 'M' && pieceU(p) >= 0 && b < p.land + .35);
		let hk: V2 = [tip[0], tip[1] + 22];
		if (cur) hk = b < cur.land ? hookAt(cur, pieceU(cur)) : lerp2(cur.hook, [tip[0], tip[1] + 22], sm((b - cur.land) / .35));
		o.push(<line key="rope" x1={tip[0]} y1={tip[1]} x2={hk[0]} y2={hk[1]} stroke={INK} strokeWidth={1.3} {...NS} />, <rect key="hook" x={hk[0] - 7} y={hk[1] - 10} width={14} height={10} fill="#5A4636" stroke={INK} strokeWidth={1.2} {...NS} />); }
	/* gin poles on the arm towers set the arm pieces */
	const gp = sm((b - 5.8) / .4) * (1 - sm((b - 8.2) / .35));
	if (gp > 0) for (const [side, px, j0, j1] of [['L', 565, 380, 700], ['R', 1115, 1300, 980]] as [string, number, number, number][]) {
		const top = 1244 - 144 * gp, je = sm((b - 6.0) / .3) * (1 - sm((b - 8.15) / .25)), ja: V2 = [px + (j0 - px) * je, 1110], jb: V2 = [px + (j1 - px) * je, 1110];
		o.push(<Tim key={`gp${side}`} a={[px, 1244]} b={[px, top]} w={2.2} c="#7A5A3A" />);
		if (je > 0) { o.push(<Tim key={`gj${side}`} a={ja} b={jb} w={2} c="#7A5A3A" />);
			const ps = PIECES.filter((p) => p.by === side), cur = ps.find((p) => pieceU(p) >= 0 && b < p.land + .3);
			const trol = b < 7.1 ? ps[0].hook[0] : b < 7.4 ? ps[0].hook[0] + (ps[1].hook[0] - ps[0].hook[0]) * sm((b - 7.1) / .3) : ps[1].hook[0];
			let hk: V2 = [trol, 1132];
			if (cur) hk = b < cur.land ? hookAt(cur, pieceU(cur)) : lerp2(cur.hook, [trol, 1132], sm((b - cur.land) / .3));
			if (je > .98) o.push(<line key={`gr${side}`} x1={trol} y1={1110} x2={hk[0]} y2={hk[1]} stroke={INK} strokeWidth={1.3} {...NS} />, <rect key={`gh${side}`} x={hk[0] - 6} y={hk[1] - 9} width={12} height={9} fill="#5A4636" stroke={INK} strokeWidth={1.2} {...NS} />); } }
	/* the workers: two on the deck (they ride it up and down), two on the arm towers, two at the stone pile */
	o.push(<Worker key="wl" u={676} v={deck} ground={deck >= YG - 1} />, <Worker key="wr" u={1004} v={deck} pose={b > 1.2 && b < 8.3 ? 'up' : 'down'} shirt="#D9CCB0" ground={deck >= YG - 1} />);
	if (TA < YG - 30 || b > 9) { const av = Math.min(TA + 116, YG); o.push(<Worker key="al" u={430} v={av} pose={b > 6.2 && b < 8.2 ? 'up' : 'down'} shirt="#C9D2D8" ground={av >= YG - 1} />, <Worker key="ar" u={1250} v={av} pose={b > 6.2 && b < 8.2 ? 'up' : 'down'} ground={av >= YG - 1} />); }
	o.push(<Worker key="g1" u={1318} v={YG} pose={landedBlocks < 12 ? 'carry' : 'down'} shirt="#D9CCB0" ground />, <Worker key="g2" u={1535} v={YG} ground />);

	/* overlay: the 30 m mark, 38 m with the pedestal, the 28 m arm span, the widgets */
	const LANDS: [number, number][] = [[2, 1700], [3, 1480], [4, 1330], [5, 1176], [6, TOPH]];
	let v = 1948; LANDS.forEach(([bl, top], i) => { const prevTop = i ? LANDS[i - 1][1] : 1948; v += (top - prevTop) * eo((b - bl) / .5); });
	const meters = Math.round((1948 - v) / (1948 - TOPH) * 30), mOn = cl((b - 1.95) / .3), done30 = b >= 6.4;
	const yb0 = sy(1948), yv = sy(v), MX = 1020;
	const u38 = cl((b - 8.7) / .6), y38 = sy(YG) + (sy(TOPH) - sy(YG)) * eo(u38);
	const u28 = cl((b - 8.6) / .5), hl = sx(384), hr = sx(1284), hc = (hl + hr) / 2, ARMY = 422;
	const prog = cl(b / 10.1), year = Math.floor(1926 + 5 * prog + 1e-6), fin = b >= 10.1, stamp = (b - 10.3) / .35;
	const stages: [string, number, number, number][] = [['基座', 1.0, 1468, 446], ['身体', 5.0, 1652, 446], ['头部', 6.0, 1468, 506], ['双臂', 8.0, 1652, 506]];
	const clouds = [[260, 300, 50], [820, 214, 40], [1250, 330, 46], [1690, 250, 52], [520, 470, 34], [1520, 520, 30]].map(([x, y, w], i) => { const cx = ((x + 16 * t) % 2120) - 100;
		return <g key={i} opacity={.9}><ellipse cx={cx} cy={y} rx={w * 1.5} ry={w * .5} fill="#F4F1EC" /><ellipse cx={cx - w * .4} cy={y - w * .3} rx={w * .8} ry={w * .5} fill="#F7F4EF" />
			<ellipse cx={cx + w * .5} cy={y - w * .22} rx={w * .7} ry={w * .42} fill="#F7F4EF" /><ellipse cx={cx} cy={y + w * .22} rx={w * 1.3} ry={w * .16} fill="#E6C9AE" opacity={.8} /></g>; });
	return <AbsoluteFill style={{background: '#7F97C0'}}>
		<Img src={src('b_back')} style={{position: 'absolute', width: W, height: H}} />
		<svg width={W} height={H} style={{position: 'absolute'}}>{clouds}</svg>
		<Img src={src('b_mid')} style={{position: 'absolute', width: W, height: H}} />
		<Img src={src('b_forest')} style={{position: 'absolute', width: W, height: H}} />
		<Img src={src('b_rock')} style={{position: 'absolute', width: W, height: H}} />
		<svg width={W} height={H} style={{position: 'absolute'}}>
			<defs dangerouslySetInnerHTML={{__html: '<linearGradient id="sv_col" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8C8781"/><stop offset=".55" stop-color="#B9B1A5"/><stop offset="1" stop-color="#E0D4BF"/></linearGradient>'
				+ `<g id="sv">${D.statue.svg}</g>`}} />
			<defs>{PIECES.map((p) => <clipPath key={p.id} id={`cp_${p.id}`}><polygon points={pts(p.clip)} /></clipPath>)}
				<clipPath id="cp_sil"><polygon points={pts(D.statue.cloak)} /><polygon points={pts(D.statue.col)} /></clipPath></defs>
			<g transform={GT}>{o}</g>
		</svg>
		<Img src={src('b_front')} style={{position: 'absolute', width: W, height: H}} />
		<svg width={W} height={H} style={{position: 'absolute'}}>
			{mOn > 0 && <g opacity={mOn}>
				<line x1={sx(990)} y1={yb0} x2={MX - 10} y2={yb0} stroke="#FFF6E6" strokeWidth={2} strokeDasharray="6 6" opacity={.8} />
				<line x1={sx(890)} y1={yv} x2={MX - 10} y2={yv} stroke="#FFF6E6" strokeWidth={2} strokeDasharray="6 6" opacity={.8} />
				<line x1={MX} y1={yb0} x2={MX} y2={yv} stroke={GOLD} strokeWidth={4} /><line x1={MX - 12} y1={yb0} x2={MX + 12} y2={yb0} stroke={GOLD} strokeWidth={4} />
				<line x1={MX - 12} y1={yv} x2={MX + 12} y2={yv} stroke={GOLD} strokeWidth={4} />
				<Pill x={MX + 16} y={(yb0 + yv) / 2} s={`${meters} m`} size={done30 ? 36 : 32} col={done30 ? GOLD : '#FFF6E6'} /></g>}
			{u38 > 0 && <g><line x1={1180} y1={sy(YG)} x2={1180} y2={y38} stroke={GOLD} strokeWidth={3} /><line x1={1168} y1={sy(YG)} x2={1192} y2={sy(YG)} stroke={GOLD} strokeWidth={3} />
				{u38 >= 1 && <line x1={1168} y1={y38} x2={1192} y2={y38} stroke={GOLD} strokeWidth={3} />}
				<line x1={sx(990)} y1={sy(YG)} x2={1168} y2={sy(YG)} stroke="#FFF6E6" strokeWidth={2} strokeDasharray="6 6" opacity={.7 * u38} />
				<Pill x={1194} y={(sy(YG) + sy(TOPH)) / 2 + 40} s="含基座 38 m" size={28} op={cl((u38 - .5) / .5)} /></g>}
			{u28 > 0 && <g>{[[hc - 34, hc - 34 - (hc - 34 - hl) * eo(u28)], [hc + 34, hc + 34 + (hr - hc - 34) * eo(u28)]].map(([a, z], i) =>
				<line key={i} x1={a} y1={ARMY} x2={z} y2={ARMY} stroke={GOLD} strokeWidth={3.5} />)}
				{u28 >= 1 && [hl, hr].map((x, i) => <line key={`k${i}`} x1={x} y1={ARMY - 12} x2={x} y2={ARMY + 12} stroke={GOLD} strokeWidth={3.5} />)}
				<Pill x={hl - 14} y={ARMY} s="臂展 28 m" size={30} anchor="end" op={cl((u28 - .5) / .5)} /></g>}
			<Widget x={1440} y={150} w={380} h={fin ? 222 : 170}>
				<T2 x={1468} y={198} s={fin ? '基督像 · 落成' : '基督像 · 建造中'} size={30} col={GOLD} />
				<T2 x={1468} y={262} s={`${year} 年`} size={56} />
				<rect x={1468} y={282} width={320} height={12} rx={6} fill="rgba(255,246,230,.2)" /><rect x={1468} y={282} width={320 * prog} height={12} rx={6} fill={GOLD} />
				{fin && <g transform={`translate(1468,346) scale(${stamp > 0 ? 1.35 - .35 * back(stamp) : 1.35})`} opacity={cl(stamp * 3)}><T2 x={0} y={0} s="10月12日 揭幕" size={34} col={GOLD} /></g>}
			</Widget>
			<Widget x={1440} y={fin ? 392 : 340} w={380} h={130}>
				{stages.map(([s, bd, x, y], i) => { const done = b >= bd, on = !done && (i === 0 || b >= stages[i - 1][1]), y0 = y + (fin ? 52 : 0) - 56, ck = cl((b - bd) / .25);
					return <g key={s}><rect x={x} y={y0 - 26} width={30} height={30} rx={6} fill="none" stroke={done ? GOLD : on ? '#FFF6E6' : '#7E7466'} strokeWidth={2.5} />
						{ck > 0 && <path d={`M${x + 6},${y0 - 11} L${x + 13},${y0 - 3} L${x + 26},${y0 - 22}`} fill="none" stroke={GOLD} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - ck} />}
						<T2 x={x + 42} y={y0} s={s} size={32} col={done ? '#FFF6E6' : on ? GOLD : '#8E8474'} /></g>; })}
			</Widget>
		</svg>
	</AbsoluteFill>;
};

const Scene: React.FC = () => {
	const f = useCurrentFrame(), n1 = Math.round(SHOT * FPS);
	return f < n1 ? <ShotA t={f / FPS} /> : <ShotB t={(f - n1) / FPS} />;
};
registerRoot(() => <Composition id="Q57CHRIST" component={Scene} durationInFrames={2 * Math.round(SHOT * FPS)} fps={FPS} width={W} height={H} />);
