import React from 'react';
import {AbsoluteFill, Composition, Img, registerRoot, staticFile, useCurrentFrame} from 'remotion';
import data from '../../public/ep57/petra/petra.json';
/* ep57 · 佩特拉 history, built live in Remotion in the episode's flat-colour + ink look (hist_c.py petra_caravan / petra_tax,
   exported by tools/export_petra.py). Two shots of 3 bars (5.016 s, t = 0 on a downbeat, beat 0.418 s).
   Shot A 「两千年前，运香料的骆驼队都要经过这里」: the caravan walks up the Siq toward the Treasury (each camel glides in
     perspective, the near camels' legs pace smoothly, the far ones stay still), the camera pushes in with parallax; the
     cargo tags pop on beats 1–3; the route widget draws the incense route 乳香·没药 → 佩特拉 (lit on bar 2, a leader to the
     Treasury) → 地中海 (bar 3).
   Shot B 「纳巴泰人收过路税发了财，把城刻进了石头里」: fixed camera at the toll point. Coins fly to the counter on beats 1–3
     (the toll counter ticks), then into the strongbox; the masons' setting-out is marked on the raw cliff; from bar 2 the
     Treasury is carved from the top down, one ledge per beat: the band under the masons breaks into rubble that falls
     to the plaza, the façade's elements come out rough-cut and are finished a beat later, the masons step down with the
     ledge, the basket follows; the height mark grows with the cut to 39 m (beat 11). */
const W = 1920, H = 1080, FPS = 30, BEAT = 0.418, BAR = 4 * BEAT, SHOT = 5.016, INK = '#2A211B', GOLD = '#F2C66E', CREAM = '#FFF6E6';
const cl = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const sm = (u: number) => { const v = cl(u); return v * v * (3 - 2 * v); };
const eo = (u: number) => 1 - Math.pow(1 - cl(u), 3);
const eio = (u: number) => { const x = cl(u); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const back = (u: number) => { const x = cl(u) - 1; return 1 + 2.7 * x * x * x + 1.7 * x * x; };
const mul = (seed: number) => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
type V2 = [number, number];
const D: any = data, DA = D.A, DB = D.B;
const pts = (ps: V2[]) => ps.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
const Raw: React.FC<{s: string; op?: number}> = ({s, op}) => <g opacity={op} dangerouslySetInnerHTML={{__html: s}} />;

/* ---------- the reference widgets (Q57CHICHEN / Q57COLO) ---------- */
const Widget: React.FC<{x: number; y: number; w: number; h: number; children: React.ReactNode; op?: number}> = ({x, y, w, h, children, op = 1}) =>
	<g opacity={op}><rect x={x} y={y} width={w} height={h} rx={18} fill="rgba(20,16,12,.72)" stroke="rgba(242,198,110,.85)" strokeWidth={2.5} />{children}</g>;
const T2: React.FC<{x: number; y: number; s: string; size: number; col?: string; anchor?: 'start' | 'middle' | 'end'; w?: number}> = ({x, y, s, size, col = CREAM, anchor = 'start', w = 900}) =>
	<text x={x} y={y} textAnchor={anchor} fontFamily="Noto Sans CJK SC" fontWeight={w} fontSize={size} fill={col} style={{fontVariantNumeric: 'tabular-nums'}}>{s}</text>;
const Callout: React.FC<{from: V2; to: V2; label: string; u: number; side?: number}> = ({from, to, label, u, side = 1}) => {
	if (u <= 0) return null; const a = cl(u / .5), b = cl((u - .4) / .4), mx = from[0] + (to[0] - from[0]) * a, my = from[1] + (to[1] - from[1]) * a;
	return <g><line x1={from[0]} y1={from[1]} x2={mx} y2={my} stroke={GOLD} strokeWidth={3} /><circle cx={from[0]} cy={from[1]} r={7} fill={GOLD} stroke={INK} strokeWidth={2} />
		<g opacity={b}><rect x={to[0] - (side > 0 ? 0 : 20 + label.length * 34)} y={to[1] - 30} width={20 + label.length * 34} height={50} rx={12} fill="rgba(20,16,12,.8)" stroke={GOLD} strokeWidth={2} />
		<T2 x={to[0] + (side > 0 ? 10 : -10)} y={to[1] + 7} s={label} size={30} col={GOLD} anchor={side > 0 ? 'start' : 'end'} /></g></g>; };
const Txt: React.FC<{x: number; y: number; s: string; size: number; op?: number; sc?: number; col?: string}> = ({x, y, s, size, op = 1, sc = 1, col = GOLD}) =>
	<g transform={`translate(${x},${y}) scale(${sc})`} opacity={op}><text x={0} y={0} textAnchor="middle" fontFamily="Noto Sans CJK SC" fontWeight={900} fontSize={size} fill={col} stroke={INK} strokeWidth={size * .16} paintOrder="stroke" strokeLinejoin="round">{s}</text></g>;

/* ================= shot A: the caravan in the Siq ================= */
const V = .04, TREF = 1.0, CK = 132.5, PER = 1.25;   // walking pace (depth units / s), the drawing's pose is the one at t = 1 s
type CLn = [number, number, number][];
const lifted = (y: number, lift: number) => y > -50 ? y - lift * (y + 50) / 50 : y;
/* hist_c.limb: a polygon round a centreline, with a foot pad; `lift` raises the lower leg (the foot swinging forward) */
const limb = (c: CLn, foot: number, lift: number): V2[] => {
	const L: V2[] = c.map(([x, y, w]) => [x - w, lifted(y, lift)]), R: V2[] = c.map(([x, y, w]) => [x + w, lifted(y, lift)]);
	const [x] = c[c.length - 1]; L.push([x - foot * .8, -lift]); R.push([x + foot * 1.2, -lift]);
	return [...L, ...R.reverse()];
};
type Placed = {x: number; y: number; r: number};
const place = (it: any, t: number): Placed => {
	const Z0 = CK / (it.y0 - DA.HY), r = Z0 / (Z0 + V * (t - TREF));
	return {x: DA.VX + (it.x0 - DA.VX) * r, y: DA.HY + (it.y0 - DA.HY) * r, r};
};
/* a camel: its body and load are the exported drawing; the four legs are hist_c.camel's, pacing (near pair together) */
const CamelG: React.FC<{it: any; t: number; p: Placed}> = ({it, t, p}) => {
	const k = it.k, ph = 2 * Math.PI * t / PER + it.ph, S = it.amp * Math.sin(ph), c = Math.cos(ph), a = Math.min(1, it.amp);
	const lN = 7 * a * Math.pow(Math.max(0, c), 1.5), lF = 7 * a * Math.pow(Math.max(0, -c), 1.5), h = -S;
	const ff: CLn = [[60, -100, 10], [60 - 3 * S, -76, 7], [58 - 5 * S, -54, 6.5], [57 - 6 * S, -46, 4.5], [55 - 8 * S, -14, 4], [54 - 8 * S, -5, 5]];
	const fh: CLn = [[-58, -106, 12], [-55 + 3 * h, -82, 8], [-52 + 6 * h, -58, 6.5], [-50 + 7 * h, -46, 4.5], [-46 + 9 * h, -14, 4], [-45 + 9 * h, -5, 5]];
	const nf: CLn = [[74, -104, 12], [78 + 2 * S, -78, 8], [82 + 4 * S, -54, 7], [83 + 5 * S, -46, 5], [86 + 8 * S, -14, 4.5], [88 + 8 * S, -5, 6]];
	const nh: CLn = [[-70, -112, 16], [-68 - 2 * h, -84, 10], [-74 - 3 * h, -58, 7], [-72 - 3 * h, -46, 5], [-70 - 5 * h, -14, 4.5], [-70 - 5 * h, -5, 6]];
	const pp = (ps: V2[]) => pts(ps.map(([x, y]) => [x * k, y * k] as V2)), sw = it.sw;
	const leg = (c_: CLn, foot: number, lift: number, fill: string) => <polygon points={pp(limb(c_, foot, lift))} fill={fill} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />;
	return <g transform={`translate(${p.x.toFixed(2)},${p.y.toFixed(2)}) scale(${p.r.toFixed(5)})`}>
		<Raw s={it.shadow} />
		{leg(ff, 9, lF, it.pal.dark)}{leg(fh, 9, lF, it.pal.dark)}{leg(nf, 10, lN, it.pal.body)}{leg(nh, 10, lN, it.pal.body)}
		<ellipse cx={(82 + 4 * S) * k} cy={-54 * k} rx={8 * k} ry={6 * k} fill={it.pal.knee} stroke={INK} strokeWidth={sw * .8} />
		<ellipse cx={(-74 - 3 * h) * k} cy={-58 * k} rx={8 * k} ry={6 * k} fill={it.pal.knee} stroke={INK} strokeWidth={sw * .8} />
		<polyline points={pp([[90 + 8 * S, lifted(-6, lN)], [88 + 8 * S, lifted(-14, lN)], [85 + 5 * S, -46]])} fill="none" stroke={it.rim} strokeWidth={Math.max(1.5, 2.5 * k)} strokeLinecap="round" opacity={.7} />
		<Raw s={it.body} />
	</g>;
};
/* a walker (hist_c.figure, pose walk): the feet under the robe step alternately; the rest of the figure is rigid */
const FigG: React.FC<{it: any; t: number; p: Placed}> = ({it, t, p}) => {
	const tr = `translate(${p.x.toFixed(2)},${p.y.toFixed(2)}) scale(${p.r.toFixed(5)})`;
	if (!it.walk) return <g transform={tr}><Raw s={it.svg} /></g>;
	const k = it.k, ph = 2 * Math.PI * t / (PER * .8) + 1.3, d = 3.5 * Math.sin(ph), c = Math.cos(ph);
	const lfar = 2.5 * Math.max(0, c), lnear = 2.5 * Math.max(0, -c);
	const bar = (ps: V2[]) => { const s = pts(ps.map(([x, y]) => [x * k, y * k] as V2));
		return <g><polyline points={s} fill="none" stroke={INK} strokeWidth={it.lw + 2 * it.sw} strokeLinecap="round" strokeLinejoin="round" />
			<polyline points={s} fill="none" stroke="#3A2A24" strokeWidth={it.lw} strokeLinecap="round" strokeLinejoin="round" /></g>; };
	return <g transform={tr}><Raw s={it.shadow} />
		{bar([[-3, -14], [-7 + d, -3 - lfar], [-11 + d, -1 - lfar]])}
		<Raw s={it.body} />
		{bar([[5, -12], [8 - d, -3 - lnear], [14 - d, -1 - lnear]])}
		<Raw s={it.post} /></g>;
};
const Caravan: React.FC<{t: number}> = ({t}) => {
	const P: Record<string, Placed> = {}, IT: Record<string, any> = {};
	for (const it of DA.items) if (it.id) { P[it.id] = place(it, t); IT[it.id] = it; }
	const anc = (id: string, n: string): V2 => { const p = P[id], a = IT[id].anc[n]; return [p.x + a[0] * p.r, p.y + a[1] * p.r]; };
	const o: React.ReactNode[] = [];
	DA.items.forEach((it: any, i: number) => {
		if (it.kind === 'camel') o.push(<CamelG key={i} it={it} t={t} p={P[it.id]} />);
		else if (it.kind === 'fig') o.push(<FigG key={i} it={it} t={t} p={P[it.id]} />);
		else { const a = anc(it.a[0], it.a[1]), b = anc(it.b[0], it.b[1]), r = (P[it.a[0]].r + P[it.b[0]].r) / 2;
			o.push(<path key={i} d={`M${a[0].toFixed(2)},${a[1].toFixed(2)} Q${((a[0] + b[0]) / 2).toFixed(2)},${((a[1] + b[1]) / 2 + it.sag * r).toFixed(2)} ${b[0].toFixed(2)},${b[1].toFixed(2)}`}
				fill="none" stroke="#5A2C1E" strokeWidth={it.w * Math.min(1.2, r)} strokeLinecap="round" />); } });
	// the cargo tags pop on beats 1, 2, 3 (乳香 on the near camel first), hanging from their sacks
	const pop: Record<string, number> = {c1: 1, c2: 2, c3: 3};
	for (const it of DA.items) { if (!it.tag) continue; const u = (t - pop[it.id] * BEAT + .06) / .38; if (u <= 0) continue; const p = P[it.id], [px, py] = it.tag.pivot;
		o.push(<g key={`tag${it.id}`} transform={`translate(${p.x.toFixed(2)},${p.y.toFixed(2)}) scale(${p.r.toFixed(5)})`}>
			<g transform={`translate(${px},${py}) scale(${back(u).toFixed(4)}) translate(${-px},${-py})`} opacity={cl(u * 3)}><Raw s={it.tag.svg} /></g></g>); }
	return <g>{o}</g>;
};

/* the incense-route widget: a small map, lon/lat projected (plate carrée) */
const MX = 1458, MY = 212, MW = 344, MH = 292, MS = 11.1, LON0 = 26, LAT0 = 37.5;
const mp = ([lo, la]: V2): V2 => [MX + (lo - LON0) * MS, MY + (LAT0 - la) * MS];
const MED: V2[] = [[25, 38], [27.3, 38], [27.5, 36.9], [28.3, 36.75], [29.6, 36.2], [30.6, 36.8], [31.5, 36.7], [32.6, 36.1], [34.0, 36.3], [34.7, 36.8], [35.6, 36.6], [36.0, 36.0],
	[35.95, 35.5], [35.8, 34.9], [35.6, 34.4], [35.3, 33.6], [35.1, 33.1], [34.9, 32.6], [34.75, 32.1], [34.5, 31.6], [34.2, 31.3], [33.6, 31.15], [32.6, 31.05], [32.2, 31.25],
	[31.6, 31.5], [31.0, 31.55], [30.3, 31.4], [29.6, 31.0], [28.8, 30.9], [27.6, 31.2], [25, 31.4]];
const CYPRUS: V2[] = [[32.3, 35.05], [32.9, 35.4], [33.9, 35.35], [34.6, 35.7], [34.0, 35.0], [33.6, 34.7], [32.8, 34.6], [32.4, 34.8]];
const RED: V2[] = [[32.55, 29.95], [32.9, 29.4], [33.6, 28.3], [34.25, 27.75], [34.5, 28.3], [34.95, 29.5], [35.05, 29.3], [34.85, 28.1], [35.6, 27.4], [36.6, 25.9], [38.1, 24.1],
	[39.15, 21.5], [40.5, 19.6], [41.7, 17.7], [42.6, 16.4], [42.9, 14.8], [43.3, 13.2], [43.5, 12.7], [45.0, 12.8], [47.5, 13.7], [49.1, 14.5], [51.5, 15.3], [52.3, 15.8],
	[54.1, 16.9], [55.5, 17.8], [56.8, 18.7], [57.8, 19.3], [58.6, 20.6], [59.5, 22.0], [60, 22], [60, 9], [51.3, 9], [51.25, 11.8], [49.5, 11.3], [47.5, 11.1], [45.5, 10.6],
	[44.0, 10.5], [43.3, 11.5], [43.3, 12.0], [42.7, 13.0], [41.7, 13.9], [40.5, 15.0], [39.5, 15.6], [38.6, 17.8], [37.2, 19.6], [37.0, 21.3], [36.4, 22.4], [35.5, 23.9],
	[34.8, 25.3], [34.2, 26.2], [33.8, 27.2], [33.1, 28.35], [32.65, 29.1]];
const GULF: V2[] = [[48.0, 29.9], [48.4, 28.5], [49.3, 27.4], [50.1, 26.6], [50.6, 25.4], [50.8, 24.75], [51.3, 26.1], [51.6, 25.3], [51.6, 24.6], [52.6, 24.2], [54.4, 24.3],
	[55.4, 25.3], [56.1, 26.1], [56.35, 26.4], [56.3, 25.6], [56.6, 24.4], [57.6, 23.8], [60, 23.4], [60, 25.4], [58, 25.5], [57.3, 25.8], [57.0, 26.8], [56.3, 27.2],
	[55.5, 26.7], [54.6, 26.6], [53.6, 26.9], [52.6, 27.4], [51.4, 28.0], [50.8, 28.9], [50.2, 29.8], [49.5, 30.0], [48.9, 30.4]];
const ROUTE1: V2[] = [[50.5, 16.2], [47.2, 15.3], [45.3, 15.6], [44.0, 17.6], [42.0, 20.0], [40.2, 21.8], [39.6, 24.5], [37.9, 26.8], [36.6, 28.4], [35.44, 30.33]];
const ROUTE2: V2[] = [[35.44, 30.33], [34.45, 31.5], [32.9, 32.6]];
const partial = (ps: V2[], u: number): V2[] => {
	if (u <= 0) return [ps[0]]; const seg = ps.slice(1).map((p, i) => Math.hypot(p[0] - ps[i][0], p[1] - ps[i][1])), L = seg.reduce((a, b) => a + b, 0);
	let d = L * cl(u); const o: V2[] = [ps[0]];
	for (let i = 0; i < seg.length; i++) { if (d >= seg[i]) { o.push(ps[i + 1]); d -= seg[i]; continue; } const f = d / seg[i]; o.push([ps[i][0] + (ps[i + 1][0] - ps[i][0]) * f, ps[i][1] + (ps[i + 1][1] - ps[i][1]) * f]); break; }
	return o; };
const MapLabel: React.FC<{x: number; y: number; s: string; size?: number; col?: string; op?: number; sc?: number; anchor?: 'start' | 'middle' | 'end'}> = ({x, y, s, size = 22, col = CREAM, op = 1, sc = 1, anchor = 'middle'}) =>
	<g transform={`translate(${x},${y}) scale(${sc})`} opacity={op}><text x={0} y={0} textAnchor={anchor} fontFamily="Noto Sans CJK SC" fontWeight={900} fontSize={size} fill={col} stroke="#1E1812" strokeWidth={4.5} paintOrder="stroke" strokeLinejoin="round">{s}</text></g>;
const RouteWidget: React.FC<{t: number; treasury: V2}> = ({t, treasury}) => {
	const u1 = eio((t - BEAT) / (BAR - BEAT)), u2 = eio((t - BAR - 2 * BEAT) / (2 * BEAT));
	const r1 = partial(ROUTE1.map(mp), u1), r2 = partial(ROUTE2.map(mp), u2), head = u2 > 0 ? r2[r2.length - 1] : r1[r1.length - 1];
	const src = mp(ROUTE1[0]), pet = mp([35.44, 30.33]), us = (t - BEAT + .05) / .35, lit = t >= BAR, lu = t - BAR;
	const end = r2[r2.length - 1], ang = Math.atan2(end[1] - r2[Math.max(0, r2.length - 2)][1], end[0] - r2[Math.max(0, r2.length - 2)][0]);
	const lead = cl((lu - .08) / .45), lx = pet[0] + (treasury[0] - pet[0]) * eo(lead), ly = pet[1] + (treasury[1] - pet[1]) * eo(lead);
	const um = (t - 2 * BAR + .05) / .4, ship = mp([29.3, 32.5]), uship = (t - 2 * BAR - BEAT + .05) / .4;
	return <g opacity={cl(t / .4)}>
		<defs><clipPath id="pa_map"><rect x={MX} y={MY} width={MW} height={MH} rx={10} /></clipPath></defs>
		<Widget x={1440} y={150} w={380} h={372}>
			<T2 x={1466} y={194} s="香料之路" size={30} col={GOLD} />
			<T2 x={1794} y={194} s="公元1世纪" size={24} col="#CFC3AE" anchor="end" />
			<g clipPath="url(#pa_map)">
				<rect x={MX} y={MY} width={MW} height={MH} fill="#D6B588" />
				{[MED, RED, GULF].map((pg, i) => <polygon key={i} points={pts(pg.map(mp))} fill="#5C88A8" stroke="#2E3B44" strokeWidth={1.4} strokeLinejoin="round" />)}
				<polygon points={pts(CYPRUS.map(mp))} fill="#D6B588" stroke="#2E3B44" strokeWidth={1.2} />
				<MapLabel x={mp([30.2, 35.3])[0]} y={mp([30.2, 35.3])[1]} s="地中海" size={20} col="#E8F1F7" op={.75 + .25 * cl(um * 2)} sc={um > 0 ? .9 + .1 * back(um) : .9} />
				<MapLabel x={mp([45.5, 23.6])[0]} y={mp([45.5, 23.6])[1]} s="阿拉伯" size={20} col="#6E5636" op={.9} />
				{/* the route: the incense lands → Petra → the sea */}
				<polyline points={pts(ROUTE1.map(mp))} fill="none" stroke="#8A7050" strokeWidth={2} strokeDasharray="5 6" opacity={.6} />
				<polyline points={pts(r1)} fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
				<polyline points={pts(r1)} fill="none" stroke={GOLD} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
				{u2 > 0 && <g><polyline points={pts(r2)} fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
					<polyline points={pts(r2)} fill="none" stroke={GOLD} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
					{u2 >= 1 && <polygon points={pts([[end[0] + 9 * Math.cos(ang), end[1] + 9 * Math.sin(ang)], [end[0] - 6 * Math.cos(ang) - 7 * Math.sin(ang), end[1] - 6 * Math.sin(ang) + 7 * Math.cos(ang)], [end[0] - 6 * Math.cos(ang) + 7 * Math.sin(ang), end[1] - 6 * Math.sin(ang) - 7 * Math.cos(ang)]])} fill={GOLD} stroke={INK} strokeWidth={2} />}</g>}
				{uship > 0 && <g transform={`translate(${ship[0]},${ship[1] + 2 * Math.sin((t - 2 * BAR) * 5)}) scale(${back(uship)})`}>
					<path d="M-13,0 L13,0 L9,7 L-9,7 Z" fill="#8E5B3E" stroke={INK} strokeWidth={1.6} /><line x1={0} y1={0} x2={0} y2={-20} stroke={INK} strokeWidth={1.6} />
					<path d="M1,-19 L12,-3 L1,-3 Z" fill={CREAM} stroke={INK} strokeWidth={1.4} /></g>}
				{/* the incense lands */}
				{us > 0 && <g transform={`translate(${src[0]},${src[1]}) scale(${back(us)})`}><circle r={13} fill={GOLD} opacity={.35} /><circle r={6.5} fill={GOLD} stroke={INK} strokeWidth={2} /></g>}
				{us > 0 && <MapLabel x={src[0] + 4} y={src[1] - 18} s="乳香 · 没药" size={21} col={GOLD} sc={back(us)} />}
				{/* Petra: waiting, then lit when the route reaches it (bar 2) */}
				{lit && <circle cx={pet[0]} cy={pet[1]} r={10 + 30 * eo(lu / .7)} fill="none" stroke={GOLD} strokeWidth={3} opacity={1 - cl(lu / .7)} />}
				{lit && <circle cx={pet[0]} cy={pet[1]} r={12 + 1.5 * Math.sin(lu * 6)} fill={GOLD} opacity={.35} />}
				<circle cx={pet[0]} cy={pet[1]} r={lit ? 7.5 : 5.5} fill={lit ? '#FFE7A8' : '#8C7A66'} stroke={INK} strokeWidth={2.2} />
				{lit && <MapLabel x={pet[0] + 16} y={pet[1] + 8} s="佩特拉" size={24} col={GOLD} anchor="start" sc={back(lu / .35)} />}
				{t > BEAT && u2 < 1 && <circle cx={head[0]} cy={head[1]} r={5} fill={CREAM} stroke={INK} strokeWidth={2} />}
			</g>
			<rect x={MX} y={MY} width={MW} height={MH} rx={10} fill="none" stroke="rgba(242,198,110,.6)" strokeWidth={1.5} />
		</Widget>
		{/* the leader: the lit dot on the map is this place */}
		{lead > 0 && <g><line x1={pet[0]} y1={pet[1]} x2={lx} y2={ly} stroke={GOLD} strokeWidth={3} strokeDasharray="10 7" />
			{lead >= 1 && <circle cx={treasury[0]} cy={treasury[1]} r={16 + 6 * eo((lu - .53) / .4)} fill="none" stroke={GOLD} strokeWidth={4} opacity={.9} />}
			{lead >= 1 && <circle cx={treasury[0]} cy={treasury[1]} r={6} fill={GOLD} stroke={INK} strokeWidth={2} />}</g>}
	</g>;
};
const Siq: React.FC<{t: number}> = ({t}) => {
	const u = eio(t / SHOT), cx = DA.TX, cy = 600, sF = 1 + .045 * u, sN = 1 + .12 * u;
	const tre: V2 = [cx + (DA.TX - cx) * sF, cy + (DA.TY - 104 * DA.TK - cy) * sF];
	const lay = (s: number): React.CSSProperties => ({position: 'absolute', inset: 0, transform: `scale(${s.toFixed(5)})`, transformOrigin: `${cx}px ${cy}px`});
	return <AbsoluteFill>
		<div style={lay(sF)}><Img src={staticFile('ep57/petra/a_far.svg')} style={{position: 'absolute', width: W, height: H}} /></div>
		<div style={lay(sN)}><Img src={staticFile('ep57/petra/a_near.svg')} style={{position: 'absolute', width: W, height: H}} />
			<svg width={W} height={H} style={{position: 'absolute', overflow: 'visible'}}><Caravan t={t} /></svg></div>
		<svg width={W} height={H} style={{position: 'absolute'}}><RouteWidget t={t} treasury={tre} /></svg>
	</AbsoluteFill>;
};

/* ================= shot B: the tolls pay for the Treasury, carved from the top down ================= */
const TCX = DB.TCX, TBY = DB.TBY, TK = DB.TK, GY = DB.ground;
const LV = [-172, -150, -130, -104, -86, -64, -36, 3];             // the work ledge, in the façade's units (urn top −162, base 0)
const TS = LV.map((_, i) => (3 + i) * BEAT);                        // step i on beat 3 + i: beat 4 (bar 2) … beat 10
const ly = (v: number) => TBY + v * TK;
const ledgeV = (t: number) => { let v = LV[0]; for (let i = 1; i < LV.length; i++) v += (LV[i] - LV[i - 1]) * eo((t - TS[i]) / .22); return v; };
const archHW = (v: number) => { const A: V2[] = [[0, -170], [26, -166], [50, -156], [57, -132]]; if (v >= -132) return 57; if (v <= -170) return 0;
	for (let i = 0; i < 3; i++) if (v <= A[i + 1][1]) return A[i][0] + (A[i + 1][0] - A[i][0]) * (v - A[i][1]) / (A[i + 1][1] - A[i][1]); return 57; };
const TRE = DB.tre.map((e: any) => { let tf = 99;
	for (let i = 1; i < LV.length; i++) if (ly(LV[i]) >= e.y1 - .5) { tf = i < LV.length - 1 ? TS[i + 1] : TS[i] + BEAT; break; }
	return {...e, tf}; });
/* the rubble: each band under the ledge breaks into blocks; each block cracks in two as it falls; the pieces lie on the plaza */
const G = 2600;
type Piece = {pts: V2[]; dx: number; rot: number; gx: number; gy: number};
type Chunk = {cx: number; cy: number; t0: number; vx: number; col: string; land: number; s: number; pcs: Piece[]};
const CHUNKS: Chunk[] = (() => {
	const R = mul(5757), o: Chunk[] = [], cols = ['#C97B5C', '#D08664', '#BF7356', '#D99270', '#B86E52'];
	const hgt: Record<number, number> = {};
	for (let i = 1; i < LV.length; i++) { const v0 = LV[i - 1], v1 = LV[i], rows = Math.max(1, Math.round((v1 - v0) / 13));
		for (let rr = rows - 1; rr >= 0; rr--) { const a = v0 + (v1 - v0) * rr / rows, b = v0 + (v1 - v0) * (rr + 1) / rows, hw = Math.min(56, archHW(b) + 1);
			if (hw < 4) continue; const n = Math.max(2, Math.round(2 * hw / 14));
			for (let j = 0; j < n; j++) { const x0 = -hw + 2 * hw * j / n, x1 = -hw + 2 * hw * (j + 1) / n, w = (x1 - x0) * TK, h = (b - a) * TK, J = (k: number) => (R() - .5) * k;
				const cx = TCX + (x0 + x1) / 2 * TK, cy = ly((a + b) / 2), t0 = TS[i] + R() * .07 + (rows - 1 - rr) * .035, vx = (x0 + x1) / 2 * 1.2 + J(50);
				// a jagged block, cracked down the middle (the crack is shared by both halves)
				const top: V2 = [J(w * .3), -h / 2 + J(h * .2)], bot: V2 = [J(w * .3), h / 2 + J(h * .2)], mid: V2 = [J(w * .25), J(h * .2)];
				const L: V2[] = [top, [-w * .25 + J(w * .15), -h / 2 + J(h * .25)], [-w / 2 + J(w * .1), -h / 2 + J(h * .15)], [-w / 2 + J(w * .2), J(h * .3)], [-w / 2 + J(w * .1), h / 2 + J(h * .15)], [-w * .25 + J(w * .15), h / 2 + J(h * .25)], bot, mid];
				const Rr: V2[] = [top, mid, bot, [w * .25 + J(w * .15), h / 2 + J(h * .25)], [w / 2 + J(w * .1), h / 2 + J(h * .15)], [w / 2 + J(w * .2), J(h * .3)], [w / 2 + J(w * .1), -h / 2 + J(h * .15)], [w * .25 + J(w * .15), -h / 2 + J(h * .25)]];
				const land = t0 + Math.sqrt(2 * Math.max(10, GY + 20 - cy) / G), pcs: Piece[] = [];
				for (const [pg, sd] of [[L, -1], [Rr, 1]] as [V2[], number][]) { const dx = sd * (10 + R() * 26), gx = cl(cx + vx * (land - t0) + dx, TCX - 50 * TK, TCX + 64 * TK), bin = Math.round(gx / 16);
					hgt[bin] = (hgt[bin] || 0) + 2.2; pcs.push({pts: pg, dx, rot: (R() - .5) * 260, gx, gy: GY + 8 + R() * 26 - hgt[bin]}); }
				const land2 = t0 + Math.sqrt(2 * Math.max(10, (pcs[0].gy + pcs[1].gy) / 2 - cy) / G);   // they land where they lie
				o.push({cx, cy, t0, vx, col: cols[Math.floor(R() * cols.length)], land: land2, s: .36 + R() * .12, pcs}); } } }
	return o; })();
const PILE = CHUNKS.flatMap((c) => c.pcs.map((p) => ({c, p}))).sort((a, b) => a.p.gy - b.p.gy);
/* the masons' marks on the raw face: the outline of the cut and the ledges still to come (drawn in during bar 1, top → bottom) */
const GUIDE: [V2, V2][] = (() => { const o: [V2, V2][] = [], P = (x: number, y: number): V2 => [TCX + x * TK, ly(y)];
	const dash = (a: V2, b: V2, st = 6.5) => { const n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / st));
		for (let i = 0; i < n; i++) o.push([P(a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n), P(a[0] + (b[0] - a[0]) * (i + .5) / n, a[1] + (b[1] - a[1]) * (i + .5) / n)]); };
	const arch: V2[] = [[-57, -132], [-50, -156], [-26, -166], [0, -170], [26, -166], [50, -156], [57, -132]];
	arch.slice(1).forEach((p, i) => dash(arch[i], p)); dash([-57, -132], [-57, 2], 7); dash([57, -132], [57, 2], 7);
	for (let i = 1; i < LV.length; i++) { const hw = Math.min(57, archHW(LV[i])); dash([-hw, LV[i]], [hw, LV[i]], 7); }
	return o.sort((a, b) => Math.min(a[0][1], a[1][1]) - Math.min(b[0][1], b[1][1])); })();
const rimY = (x: number) => { const r = DB.rim as V2[]; for (let i = 1; i < r.length; i++) if (x <= r[i][0]) return r[i - 1][1] + (r[i][1] - r[i - 1][1]) * (x - r[i - 1][0]) / (r[i][0] - r[i - 1][0]); return r[r.length - 1][1]; };
/* the masons' strikes: chips on every beat from each pick */
const CHIPS = (() => { const R = mul(91); return Array.from({length: 12 * 3 * 3}, () => ({vx: 40 + R() * 70, vy: -60 - R() * 90, s: 2.5 + R() * 2.5, a: R() * 6.28})); })();
/* the tolls: landing times (in beats). Bar 1: one on each beat, onto the counter; then the box fills, faster and faster */
const LAND = [1, 2, 3, ...Array.from({length: 8}, (_, i) => 4.5 + i * .5), ...Array.from({length: 11}, (_, i) => 8 + (i + 1) / 3)];
const STK = DB.stacks as [number, number][];
const Stack: React.FC<{x: number; base: number; n: number}> = ({x, base, n}) => {
	const rx = 21, ry = 7, th = 8.5, top = base - th * n;
	return <g><path d={`M${x - rx},${top} L${x - rx},${base} A${rx},${ry} 0 0 0 ${x + rx},${base} L${x + rx},${top} Z`} fill="#D9A441" stroke={INK} strokeWidth={2} />
		<path d={Array.from({length: n - 1}, (_, i) => `M${x - rx},${top + th * (i + 1)} A${rx},${ry} 0 0 0 ${x + rx},${top + th * (i + 1)}`).join(' ')} fill="none" stroke="#B07F2C" strokeWidth={1.5} />
		<ellipse cx={x} cy={top} rx={rx} ry={ry} fill={GOLD} stroke={INK} strokeWidth={2} /><ellipse cx={x - rx * .25} cy={top - ry * .2} rx={rx * .45} ry={ry * .35} fill="#FFE6A0" opacity={.8} />
		<line x1={x + rx * .55} y1={top + 3} x2={x + rx * .55} y2={base + ry * .6} stroke="#FFE6A0" strokeWidth={2.5} opacity={.55} /></g>; };
const Coin: React.FC<{x: number; y: number; r?: number; tilt?: number; sw?: number}> = ({x, y, r = 14, tilt = .45, sw = 2}) =>
	<g><ellipse cx={x} cy={y + 2.5} rx={r} ry={r * tilt} fill="#B07F2C" stroke={INK} strokeWidth={sw} /><ellipse cx={x} cy={y} rx={r} ry={r * tilt} fill={GOLD} stroke={INK} strokeWidth={sw} />
		<ellipse cx={x - r * .25} cy={y - r * tilt * .2} rx={r * .4} ry={r * tilt * .3} fill="#FFE6A0" opacity={.85} /></g>;
const CHISEL = (() => { const R = mul(13); return Array.from({length: 130}, () => [R() * 104 - 52, 2.8 + Math.pow(R(), 1.8) * 15] as V2); })();

const Carve: React.FC<{t: number}> = ({t}) => {
	const v = ledgeV(t), L = ly(v), x0 = TCX - 56 * TK, x1 = TCX + 56 * TK;
	const o: React.ReactNode[] = [];
	// the cut: the facade above the ledge — each element rough-cut first, finished a beat later
	o.push(<g key="cut" clipPath="url(#pb_cut)">{TRE.map((e: any, i: number) => { if (L <= e.y0) return null; const f = i === 0 ? 1 : eo((t - e.tf) / .12);
		return <g key={i}>{f < 1 && <Raw s={e.rough} op={1 - f} />}{f < 1 && e.hatch && <Raw s={e.hatch} op={1 - f} />}{f > 0 && <Raw s={e.fin} op={f} />}</g>; })}</g>);
	// on the raw face below: the setting-out (drawn in during bar 1) and the fresh chisel marks under the ledge
	const ng = Math.floor(GUIDE.length * eio((t - .15) / 1.35));
	o.push(<g key="raw" clipPath="url(#pb_raw)"><path d={GUIDE.slice(0, ng).map(([a, b]) => `M${a[0].toFixed(1)},${a[1].toFixed(1)} L${b[0].toFixed(1)},${b[1].toFixed(1)}`).join(' ')} fill="none" stroke="#FFF4E4" strokeWidth={2.4} strokeLinecap="round" opacity={.75} />
		<path d={CHISEL.map(([x, d]) => `M${(TCX + x * TK).toFixed(1)},${(L + d * TK).toFixed(1)} l${(1.4 * TK).toFixed(1)},${(2.2 * TK).toFixed(1)}`).join(' ')} stroke={DB.raw_d} strokeWidth={1.6} opacity={.7} /></g>);
	// the work ledge
	o.push(<g key="ledge"><polygon points={pts([[x0, L - 1], [x1, L - 1], [x1, L + 2.3 * TK], [x0, L + 2.3 * TK]])} fill={DB.ledge} />
		<line x1={x0 - 6} y1={L - 1} x2={x1 + 6} y2={L - 1} stroke={INK} strokeWidth={2.5} /><line x1={x0} y1={L + 2.3 * TK} x2={x1} y2={L + 2.3 * TK} stroke={DB.raw_d} strokeWidth={1.8} /></g>);
	// rubble falling from the band just cut
	CHUNKS.forEach((c, i) => { if (t < c.t0 || t >= c.land) return; const tau = t - c.t0, f = tau / (c.land - c.t0), x = c.cx + c.vx * tau, y = c.cy + .5 * G * tau * tau, s = 1 - (1 - c.s) * sm(f), sp = sm((f - .12) / .5);
		c.pcs.forEach((p, j) => o.push(<polygon key={`ch${i}${j}`} points={pts(p.pts)} transform={`translate(${(x + p.dx * sp).toFixed(2)},${y.toFixed(2)}) rotate(${(p.rot * tau * sp).toFixed(2)}) scale(${s.toFixed(4)})`}
			fill={c.col} stroke={INK} strokeWidth={1.8 / s} strokeLinejoin="round" />)); });
	// the masons, on the ledge (rigid), and the chips from their picks on every beat
	const b = Math.floor(t / BEAT), tb = t - b * BEAT, Lb = ly(ledgeV(b * BEAT));
	DB.masons.forEach((m: any, i: number) => { const mx = TCX + m.x * TK;
		if (m.pick) { const R = CHIPS.slice(((b % 12) * 3 + i % 3) * 3, ((b % 12) * 3 + i % 3) * 3 + 3);
			if (tb < .32) { o.push(<ellipse key={`d${i}`} cx={mx + m.f * 12} cy={Lb + 4} rx={10 + 20 * eo(tb / .32)} ry={5 + 6 * eo(tb / .32)} fill="#FBE2C8" opacity={.55 * (1 - tb / .32)} />);
				R.forEach((c, j) => { const x = mx + m.f * (8 + c.vx * tb), y = Lb + 3 + c.vy * tb + 700 * tb * tb;
					o.push(<polygon key={`c${i}${j}`} points={pts([0, 1, 2].map((q) => [x + c.s * Math.cos(c.a + q * 2.1), y + c.s * .8 * Math.sin(c.a + q * 2.1)] as V2))} fill="#C26E52" stroke={INK} strokeWidth={1.2} opacity={1 - cl((tb - .2) / .12)} />); }); } }
		o.push(<g key={`m${i}`} transform={`translate(${mx},${(L - 1).toFixed(2)})`}><Raw s={m.svg} /></g>); });
	// the basket on its rope, lowered with the ledge
	const rx = TCX + 60 * TK, by = L - 64, ry = rimY(rx) + 6;
	o.push(<g key="rope"><line x1={rx} y1={ry} x2={rx} y2={by} stroke="#6E4426" strokeWidth={3} /><line x1={rx - 16} y1={ry - 10} x2={rx + 2} y2={ry + 4} stroke={INK} strokeWidth={7} strokeLinecap="round" />
		<line x1={rx - 16} y1={ry - 10} x2={rx + 2} y2={ry + 4} stroke="#8A5A32" strokeWidth={4} strokeLinecap="round" />
		<path d={`M${rx - 18},${by} L${rx + 18},${by} Q${rx + 16},${by + 22} ${rx},${by + 22} Q${rx - 16},${by + 22} ${rx - 18},${by} Z`} fill="#C9A060" stroke={INK} strokeWidth={2} />
		<line x1={rx - 16} y1={by + 8} x2={rx + 16} y2={by + 8} stroke="#8A6430" strokeWidth={1.5} /></g>);
	return <g>{o}</g>;
};
const Toll: React.FC<{t: number}> = ({t}) => {
	const v = ledgeV(t), L = ly(v), o: React.ReactNode[] = [];
	const landed = LAND.filter((b) => t >= b * BEAT).length, hx = DB.hand[0], hy = DB.hand[1];
	// the rubble lying on the plaza, with a puff of dust where each block lands
	PILE.forEach(({c, p}, i) => { if (t < c.land) return; const s = c.s;
		o.push(<polygon key={`p${i}`} points={pts(p.pts)} transform={`translate(${p.gx.toFixed(1)},${p.gy.toFixed(1)}) rotate(${(p.rot * (c.land - c.t0)).toFixed(1)}) scale(${s.toFixed(3)})`} fill={c.col} stroke={INK} strokeWidth={1.8 / s} strokeLinejoin="round" />); });
	CHUNKS.forEach((c, i) => { const u = (t - c.land) / .45; if (u < 0 || u > 1) return; const gx = (c.pcs[0].gx + c.pcs[1].gx) / 2;
		o.push(<ellipse key={`dust${i}`} cx={gx} cy={GY + 18} rx={18 + 44 * eo(u)} ry={6 + 12 * eo(u)} fill="#F6DEC4" opacity={.5 * (1 - u)} />); });
	// the counter's stacks (bar 1 coins), the strongbox filling (after)
	const nStack = STK.map(([, n]) => n);
	LAND.slice(0, 3).forEach((b, i) => { if (t >= b * BEAT) nStack[i] += 1; });
	STK.forEach(([x], i) => o.push(<Stack key={`s${i}`} x={x} base={DB.counter} n={nStack[i]} />));
	const nHeap = 22 + Math.max(0, landed - 3);
	DB.heap.slice(0, nHeap).forEach(([x, y]: V2, i: number) => o.push(<Coin key={`h${i}`} x={x} y={y} r={11} tilt={.45} sw={1.5} />));
	// coins in the air: from the trader's hand, on a parabola, landing on their beat
	LAND.forEach((b, i) => { const tl = b * BEAT, dur = i < 3 ? .4 : .34, u = (t - tl + dur) / dur; if (u <= 0 || u >= 1) return;
		const tx = i < 3 ? STK[i][0] : DB.heap[Math.min(DB.heap.length - 1, 22 + i - 3)][0], ty = i < 3 ? DB.counter - 8.5 * (STK[i][1] + 1) : DB.heap[Math.min(DB.heap.length - 1, 22 + i - 3)][1];
		const x = hx + 20 + (tx - hx - 20) * u, y = hy - 10 + (ty - hy + 10) * u - (i < 3 ? 120 : 170) * 4 * u * (1 - u), sp = Math.abs(Math.cos((t - tl) * 14));
		o.push(<g key={`f${i}`} transform={`translate(${x.toFixed(2)},${y.toFixed(2)}) scale(1,${(.35 + .65 * sp).toFixed(3)})`}><Coin x={0} y={0} r={13} tilt={.5} /></g>); });
	LAND.slice(0, 3).forEach((b, i) => { const u = (t - b * BEAT) / .5; if (u < 0 || u > 1) return;
		o.push(<Txt key={`p1${i}`} x={STK[i][0]} y={DB.counter - 8.5 * (STK[i][1] + 1) - 24 - 40 * eo(u)} s="+1" size={34} op={1 - cl((u - .6) / .4)} sc={.7 + .3 * back(u * 2)} />); });
	// the height of the cut, growing with the ledge: 0 → 39 m
	const yT = ly(-162), yE = cl(L, yT, TBY), xm = TCX + 69 * TK, m = 39 * (yE - yT) / (TBY - yT), done = t - 11 * BEAT;
	if (L > yT) { const lab = done > 0 ? '39 m' : `${Math.round(m)} m`, ym = (yT + yE) / 2, sc = done > 0 ? .85 + .15 * back(done / .35) : 1;
		o.push(<g key="mark"><line x1={TCX + 6} y1={yT} x2={xm + 10} y2={yT} stroke={GOLD} strokeWidth={2} strokeDasharray="6 6" opacity={.8} />
			{yE > TBY - 2 && <line x1={TCX + 57 * TK} y1={TBY} x2={xm + 10} y2={TBY} stroke={GOLD} strokeWidth={2} strokeDasharray="6 6" opacity={.8} />}
			<line x1={xm} y1={yT} x2={xm} y2={yE} stroke={INK} strokeWidth={7} strokeLinecap="round" /><line x1={xm} y1={yT} x2={xm} y2={yE} stroke={GOLD} strokeWidth={3.5} strokeLinecap="round" />
			<line x1={xm - 12} y1={yT} x2={xm + 12} y2={yT} stroke={GOLD} strokeWidth={4} strokeLinecap="round" /><line x1={xm - 12} y1={yE} x2={xm + 12} y2={yE} stroke={GOLD} strokeWidth={4} strokeLinecap="round" />
			<g transform={`translate(${xm + 20},${ym}) scale(${sc})`}><rect x={0} y={-27} width={done > 0 ? 116 : 104} height={50} rx={12} fill="rgba(20,16,12,.8)" stroke={GOLD} strokeWidth={2} />
				<T2 x={12} y={9} s={lab} size={done > 0 ? 34 : 30} col={GOLD} /></g></g>); }
	// the callout: they cut from the top down
	const uc = (t - 5 * BEAT) / .6, fade = 1 - cl((t - 9 * BEAT) / .3);
	if (uc > 0 && fade > 0) o.push(<g key="call" opacity={fade}><Callout from={[TCX - 44 * TK, L + 2]} to={[790, 420]} label="从上往下凿" u={uc} side={-1} /></g>);
	// the toll widget: coins counted as they land; the era
	o.push(<Widget key="w" x={1440} y={150} w={380} h={196} op={cl(t / .4)}>
		<T2 x={1468} y={198} s="过路税" size={32} col={GOLD} />
		<g transform="translate(1494,258)"><Coin x={0} y={0} r={20} tilt={.5} sw={2.2} /></g>
		<T2 x={1532} y={278} s={`× ${landed}`} size={58} />
		<T2 x={1468} y={326} s="纳巴泰人 · 公元1世纪" size={26} col="#CFC3AE" />
	</Widget>);
	return <g>{o}</g>;
};
const Plaza: React.FC<{t: number}> = ({t}) => {
	const L = ly(ledgeV(t));
	const clouds = [[420, 50, 1.0], [980, 30, .8], [1500, 62, .9], [1820, 26, .7]].map(([x, y, k], i) => <g key={i} transform={`translate(${((x + 16 * t) % 2120) - 100},${y}) scale(${k})`} opacity={.9}>
		<ellipse cx={0} cy={0} rx={110} ry={22} fill="#F4F7FB" stroke="#D5DEEA" strokeWidth={2} /><ellipse cx={-36} cy={-14} rx={58} ry={22} fill="#F4F7FB" /><ellipse cx={34} cy={-16} rx={50} ry={20} fill="#F4F7FB" /></g>);
	return <AbsoluteFill>
		<svg width={W} height={H} style={{position: 'absolute'}}>
			<defs><linearGradient id="pb_sky" x1="0" y1="0" x2="0" y2="220" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#86AED3" /><stop offset=".6" stopColor="#B7D0E2" /><stop offset="1" stopColor="#E4ECEA" /></linearGradient></defs>
			<rect width={W} height={H} fill="url(#pb_sky)" />{clouds}</svg>
		<Img src={staticFile('ep57/petra/b_back.svg')} style={{position: 'absolute', width: W, height: H}} />
		<Img src={staticFile('ep57/petra/b_mid.svg')} style={{position: 'absolute', width: W, height: H}} />
		<svg width={W} height={H} style={{position: 'absolute'}}>
			<defs><clipPath id="pb_cut"><rect x={0} y={0} width={W} height={L} /></clipPath><clipPath id="pb_raw"><rect x={0} y={L} width={W} height={Math.max(0, TBY + 3 - L)} /></clipPath>
				<pattern id="pb_chisel" width={7} height={7} patternUnits="userSpaceOnUse" patternTransform="rotate(28)"><line x1={0} y1={0} x2={0} y2={4} stroke="#A85A44" strokeWidth={1.5} opacity={.7} /></pattern></defs>
			<Carve t={t} />
			<Toll t={t} />
		</svg>
	</AbsoluteFill>;
};

const Scene: React.FC<{ts?: number}> = ({ts = 1}) => {
	const f = useCurrentFrame() * ts, n1 = Math.round(SHOT * FPS);
	return <AbsoluteFill style={{background: '#000'}}>{f < n1 ? <Siq t={f / FPS} /> : <Plaza t={(f - n1) / FPS} />}</AbsoluteFill>;
};
/* Q57PETRA106: the same scene for the 106 BPM track (owner 2026-11-03 12:07): time scaled so each 0.418 s beat lasts 0.566 s */
/* ...141: the same for the 140.8 BPM DJ track (owner 17:08): each 0.418 s beat lasts 0.42611 s */
const TS141 = 0.418 / 0.42611;
const TS106 = 0.418 / 0.56606;
registerRoot(() => <><Composition id="Q57PETRA" component={Scene} durationInFrames={2 * Math.round(SHOT * FPS)} fps={FPS} width={W} height={H} />
	<Composition id="Q57PETRA106" component={Scene} defaultProps={{ts: TS106}} durationInFrames={Math.round(2 * SHOT * FPS / TS106)} fps={FPS} width={W} height={H} />
	<Composition id="Q57PETRA141" component={Scene} defaultProps={{ts: TS141}} durationInFrames={Math.round(2 * SHOT * FPS / TS141)} fps={FPS} width={W} height={H} /></>);
