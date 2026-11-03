import React from 'react';
import {AbsoluteFill, Composition, Img, registerRoot, staticFile, useCurrentFrame} from 'remotion';
import data from '../../public/ep57/colo/colo.json';
/* ep57 · 斗兽场, built live in Remotion in the episode's flat-colour + ink look (owner 09:54). Fixed camera (owner 09:25).
   Still layers are the story drawing's own SVGs (tools/export_colosseum.py); the amphitheatre is built here from its
   geometry: every bay rises in stone courses (the work sweeping round the ring), arches are turned on timber centring,
   scaffolding wraps the bays still being built, treadwheel cranes lift a block on every beat, the stone piles shrink.
   6 bars (10.03 s): 1–2 Nero's lake (公元64年) · 3 the lake filled in (公元72年) · 4–6 built (72 → 80) · end: finished, crowd, 5万座位. */
const W = 1920, H = 1080, FPS = 30, BEAT = 0.418, BAR = 4 * BEAT, DUR = 6 * BAR, INK = '#2A211B', GOLD = '#F2C66E';
const cl = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const sm = (u: number) => { const v = cl(u); return v * v * (3 - 2 * v); };
const eo = (u: number) => 1 - Math.pow(1 - cl(u), 3);
const back = (u: number) => { const x = cl(u) - 1; return 1 + 2.7 * x * x * x + 1.7 * x * x; };
type A2 = [number, number]; type Pt = number[];
const D: any = data;
const yAt = (Y: number, zr: number) => D.HY - D.FL * (Y - D.HC) / zr;
const P = (a: A2, Y: number) => [a[0], yAt(Y, a[1])];
const pts = (ps: Pt[]) => ps.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
const Widget: React.FC<{x: number; y: number; w: number; h: number; op?: number; children: React.ReactNode}> = ({x, y, w, h, op = 1, children}) =>
	<g opacity={op}><rect x={x} y={y} width={w} height={h} rx={18} fill="rgba(20,16,12,.72)" stroke="rgba(242,198,110,.85)" strokeWidth={2.5} />{children}</g>;
const T2: React.FC<{x: number; y: number; s: string; size: number; col?: string; anchor?: 'start' | 'middle' | 'end'}> = ({x, y, s, size, col = '#FFF6E6', anchor = 'start'}) =>
	<text x={x} y={y} textAnchor={anchor} fontFamily="Noto Sans CJK SC" fontWeight={900} fontSize={size} fill={col} style={{fontVariantNumeric: 'tabular-nums'}}>{s}</text>;
const Callout: React.FC<{from: A2; to: A2; label: string; u: number; side?: number}> = ({from, to, label, u, side = 1}) => {
	if (u <= 0) return null; const a = cl(u / .5), b = cl((u - .4) / .4), mx = from[0] + (to[0] - from[0]) * a, my = from[1] + (to[1] - from[1]) * a, w = 24 + label.length * 34;
	return <g><line x1={from[0]} y1={from[1]} x2={mx} y2={my} stroke={GOLD} strokeWidth={3} /><circle cx={from[0]} cy={from[1]} r={7} fill={GOLD} stroke={INK} strokeWidth={2} />
		<g opacity={b}><rect x={side > 0 ? to[0] : to[0] - w} y={to[1] - 30} width={w} height={50} rx={12} fill="rgba(20,16,12,.8)" stroke={GOLD} strokeWidth={2} />
			<T2 x={to[0] + (side > 0 ? 12 : -12)} y={to[1] + 7} s={label} size={30} col={GOLD} anchor={side > 0 ? 'start' : 'end'} /></g></g>; };

const TOP = 46.4, COURSE = 1.2;
const Build: React.FC<{t: number; prog: number}> = ({t, prog}) => {
	const HK: Record<number, number> = {};
	for (const b of D.bays) { const h = TOP * cl(prog * 1.35 - .35 * b.rank); HK[b.k] = h >= TOP ? TOP : Math.floor(h / COURSE) * COURSE; }
	const o: React.ReactNode[] = [];
	if (prog < .35) o.push(<polyline key="trench" points={pts(D.foot)} fill="none" stroke="#5E4632" strokeWidth={3} strokeDasharray="10 8" opacity={1 - prog / .35} />);
	D.piles.forEach(([x, y, s]: number[], i: number) => { const n = Math.round(5 * (1 - prog));
		for (let j = 0; j < n; j++) o.push(<rect key={`p${i}${j}`} x={x + (j - n / 2) * s * 1.1} y={y - s} width={s * 1.1} height={s} fill="#E2D3B0" stroke={INK} strokeWidth={1.2} />); });
	for (const b of D.bays) { const Yb = HK[b.k]; if (Yb <= 0) continue;   // walls
		o.push(<polygon key={`w${b.k}`} points={pts([P(b.a, 0), P(b.b, 0), P(b.b, Yb), P(b.a, Yb)])} fill="url(#r_wall)" stroke={INK} strokeWidth={2} strokeLinejoin="round" />);
		o.push(<line key={`wt${b.k}`} x1={b.a[0]} y1={yAt(Yb, b.a[1])} x2={b.b[0]} y2={yAt(Yb, b.b[1])} stroke={INK} strokeWidth={3} />); }
	for (const b of D.bays) { if (b.cm < .1) continue; const Yb = HK[b.k], sw = b.cm > .45 ? 2.2 : 1.5;   // arches
		for (const s of b.storeys) { if (Yb <= s.sill) break;
			if (Yb >= s.crown) { o.push(<polygon key={`a${b.k}${s.sill}`} points={pts(s.arch)} fill={D.pal.jamb} stroke={INK} strokeWidth={sw} />); o.push(<polygon key={`i${b.k}${s.sill}`} points={pts(s.inner)} fill={D.pal.open} />); }
			else { const tp = Math.min(Yb, s.spring); o.push(<polygon key={`o${b.k}${s.sill}`} points={pts([P(b.w0, s.sill), P(b.w1, s.sill), P(b.w1, tp), P(b.w0, tp)])} fill={D.pal.open} stroke={INK} strokeWidth={sw} />);
				if (Yb > s.spring - 1.5) o.push(<polyline key={`c${b.k}${s.sill}`} points={pts(s.centring)} fill="none" stroke="#9A7044" strokeWidth={Math.max(2.5, sw * 1.8)} />); } } }
	D.bays.forEach((b: any, i: number) => { if (b.cm < .1 || i === 0) return; const Yb = HK[b.k], sw = b.cm > .45 ? 2 : 1.4;   // engaged columns
		for (const s of b.storeys) { if (Yb <= s.y0 + .3) break; const tp = Math.min(Yb, s.y1 - .6);
			o.push(<polygon key={`col${b.k}${s.y0}`} points={pts([P(b.c0, s.y0 + .3), P(b.c1, s.y0 + .3), P(b.c1, tp), P(b.c0, tp)])} fill={b.col} stroke={INK} strokeWidth={sw} />); } });
	for (const [y0, y1] of D.bands) for (const b of D.bays) if (HK[b.k] >= y1)   // entablatures
		o.push(<polygon key={`bd${b.k}${y0}`} points={pts([P(b.a, y1), P(b.b, y1), P(b.b, y0), P(b.a, y0)])} fill={D.pal.band} stroke={INK} strokeWidth={1.6} />);
	for (const b of D.bays) { const Yb = HK[b.k]; if (Yb >= TOP || Yb <= 0 || b.cm < .12) continue;   // scaffolding
		const sw = Math.max(1.6, D.FL / b.sa[1] * .22);
		o.push(<line key={`sp${b.k}`} x1={b.sa[0]} y1={yAt(0, b.sa[1])} x2={b.sa[0]} y2={yAt(Yb + 3.2, b.sa[1])} stroke="#8A6A48" strokeWidth={sw} />);
		for (let L = 3; L < Yb + 3; L += 3) o.push(<line key={`sl${b.k}${L}`} x1={b.sa[0]} y1={yAt(L, b.sa[1])} x2={b.sb[0]} y2={yAt(L, b.sb[1])} stroke="#8A6A48" strokeWidth={sw * .8} />);
		if (b.k % 3 === 0) o.push(<line key={`sb${b.k}`} x1={b.sa[0]} y1={yAt(0, b.sa[1])} x2={b.sb[0]} y2={yAt(Math.min(Yb, 9), b.sb[1])} stroke="#7A5A3A" strokeWidth={sw * .7} />); }
	const front = D.bays.filter((b: any) => HK[b.k] > 0 && HK[b.k] < TOP && b.cm > .35);   // treadwheel cranes: a block goes up on every beat
	const pick = front.filter((_: any, i: number) => i % Math.max(1, Math.floor(front.length / 3)) === 0).slice(0, 3);
	pick.forEach((b: any, i: number) => { const s = D.FL / b.cr[1], bx = b.cr[0], by = yAt(HK[b.k], b.cr[1]), top = [bx + s * 1.5, by - s * 8.5], jib = [top[0] - s * 5, top[1] + s * 1.5];
		const ph = ((t / BEAT) + i * .3) % 1, ly = by + s * 9 - (s * 9 + 1.5 * s) * sm(Math.min(1, ph / .8)), w = Math.max(2, s * .32);
		o.push(<g key={`cr${b.k}`}><line x1={bx} y1={by} x2={top[0]} y2={top[1]} stroke="#7A5A3A" strokeWidth={w} /><line x1={bx + s * 3} y1={by} x2={top[0]} y2={top[1]} stroke="#7A5A3A" strokeWidth={w} />
			<line x1={top[0]} y1={top[1]} x2={jib[0]} y2={jib[1]} stroke="#7A5A3A" strokeWidth={w} /><circle cx={bx + s * 1.6} cy={by - s * 2.2} r={s * 2} fill="none" stroke="#7A5A3A" strokeWidth={w} />
			<line x1={jib[0]} y1={jib[1]} x2={jib[0]} y2={ly} stroke={INK} strokeWidth={1.2} /><rect x={jib[0] - s * .8} y={ly} width={s * 1.6} height={s * 1.1} fill="#E2D3B0" stroke={INK} strokeWidth={1.4} /></g>); });
	return <g>{o}</g>;
};

const Scene: React.FC<{ts?: number}> = ({ts = 1}) => {
	const t = useCurrentFrame() * ts / FPS;
	const fillT = (t - 2 * BAR) / (BAR / 4), fillU = t < 2 * BAR ? 0 : cl((Math.floor(fillT) + sm(fillT % 1)) / 4);   // four cartloads, one per beat
	const lx = D.lake.map((p: number[]) => p[0]), x0 = Math.min(...lx), x1 = Math.max(...lx), ly = D.lake.map((p: number[]) => p[1]);
	const a_lake = 1 - sm((t - 2.75 * BAR) / (.25 * BAR));
	const prog = cl((t - 3 * BAR) / (2.55 * BAR)), fin = sm((t - 5.55 * BAR) / (.3 * BAR)), crowd = sm((t - 5.6 * BAR) / (.35 * BAR));
	const year = t < 2 * BAR ? 64 : t < 3 * BAR ? 72 : Math.round(72 + 8 * prog);
	const seats = Math.round(50000 * eo((t - 5.5 * BAR) / (.3 * BAR)));
	const lakeC: A2 = [(x0 + x1) / 2, (Math.min(...ly) + Math.max(...ly)) / 2];
	const clouds = [[300, 470, 46], [900, 360, 50], [1300, 250, 44], [1640, 300, 54]].map(([x, y, w], i) => { const cx = ((x + 30 * t) % 2100) - 90;
		return <g key={i} opacity={.92}><ellipse cx={cx} cy={y} rx={w * 1.4} ry={w * .55} fill="#F4F7FB" stroke="#D5DEEA" strokeWidth={2} /><ellipse cx={cx + w * .7} cy={y - w * .25} rx={w * .8} ry={w * .5} fill="#F4F7FB" /></g>; });
	return <AbsoluteFill style={{background: '#000'}}>
		<Img src={staticFile('ep57/colo/back.svg')} style={{position: 'absolute', width: W, height: H}} />
		<svg width={W} height={H} style={{position: 'absolute'}}>
			<defs dangerouslySetInnerHTML={{__html: D.grad}} />
			{clouds}
			{fin < 1 && <Build t={t} prog={prog} />}
		</svg>
		{fin > 0 && <Img src={staticFile('ep57/colo/finished.svg')} style={{position: 'absolute', width: W, height: H, opacity: fin}} />}
		<Img src={staticFile('ep57/colo/crowd.svg')} style={{position: 'absolute', width: W, height: H, opacity: crowd}} />
		<Img src={staticFile('ep57/colo/front.svg')} style={{position: 'absolute', width: W, height: H}} />
		<Img src={staticFile('ep57/colo/family.svg')} style={{position: 'absolute', width: W, height: H, opacity: crowd}} />
		{a_lake > 0 && <div style={{position: 'absolute', inset: 0, opacity: a_lake}}>
			<Img src={staticFile('ep57/colo/lake.svg')} style={{position: 'absolute', width: W, height: H}} />
			<svg width={W} height={H} style={{position: 'absolute'}}><defs><clipPath id="fillc"><rect x={0} y={0} width={x0 + (x1 - x0) * fillU} height={H} /></clipPath></defs>
				<g clipPath="url(#fillc)"><polygon points={pts(D.lake)} fill="#BFA77E" stroke={INK} strokeWidth={3} />
					{Array.from({length: 16}, (_, i) => <line key={i} x1={x0 + (x1 - x0) * i / 15} y1={Math.min(...ly)} x2={x0 + (x1 - x0) * i / 15 - 60} y2={Math.max(...ly)} stroke="#A88F66" strokeWidth={3} opacity={.7} />)}</g>
				{fillU > 0 && fillU < 1 && <line x1={x0 + (x1 - x0) * fillU} y1={Math.min(...ly) - 10} x2={x0 + (x1 - x0) * fillU} y2={Math.max(...ly) + 10} stroke="#7A5A3A" strokeWidth={6} />}
			</svg></div>}
		<svg width={W} height={H} style={{position: 'absolute'}}>
			<Callout from={lakeC} to={[560, 470]} label="尼禄的私人湖" u={(t - .6) / .6 * (t < 2 * BAR ? 1 : 0)} side={-1} />
			<Widget x={1440} y={150} w={380} h={t > 5.5 * BAR ? 250 : 190} op={sm(t / .4)}>
				<T2 x={1468} y={205} s={t < 2 * BAR ? '尼禄的金宫' : t < 3 * BAR ? '填湖 · 开工' : prog < 1 ? '建造中' : '落成'} size={32} col={GOLD} />
				<T2 x={1468} y={275} s={`公元 ${year} 年`} size={56} />
				{t > 3 * BAR && <g><rect x={1468} y={295} width={320} height={12} rx={6} fill="rgba(255,246,230,.2)" /><rect x={1468} y={295} width={320 * prog} height={12} rx={6} fill={GOLD} /></g>}
				{t > 5.5 * BAR && <T2 x={1468} y={370} s={`${seats.toLocaleString('en-US')} 个座位`} size={40} col={GOLD} />}
			</Widget>
		</svg>
	</AbsoluteFill>;
};
/* Q57COLO106: the same scene for the 106 BPM track (owner 2026-11-03 12:07): time scaled so each 0.418 s beat lasts 0.566 s */
/* ...141: the same for the 140.8 BPM DJ track (owner 17:08): each 0.418 s beat lasts 0.42611 s */
const TS141 = 0.418 / 0.42611;
const TS106 = 0.418 / 0.56606;
registerRoot(() => <><Composition id="Q57COLO" component={Scene} durationInFrames={Math.round(DUR * FPS)} fps={FPS} width={W} height={H} />
	<Composition id="Q57COLO106" component={Scene} defaultProps={{ts: TS106}} durationInFrames={Math.round(DUR * FPS / TS106)} fps={FPS} width={W} height={H} />
	<Composition id="Q57COLO141" component={Scene} defaultProps={{ts: TS141}} durationInFrames={Math.round(DUR * FPS / TS141)} fps={FPS} width={W} height={H} /></>);
