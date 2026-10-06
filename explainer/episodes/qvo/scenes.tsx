import React from 'react';
import {random} from 'remotion';
import {Beam, C, Counter, E, FPS, GratKind, HCursor, MONO, Plate, S, SANS, Stamp, TLX, Tr, Tx, VCursor, clamp, ez, lock, mix, path, pr, stampK, xyPath} from './kit';

/**
 * The 27 scope scenes of 《量子计算机不是同时算》 (storyboard.md, Look A). Each scene is a pure function of the
 * film clock T (seconds) and knows its own window [a, b). Times are tied to the real TTS line starts (S/E).
 */

export type Scene = {
	name: string;
	a: number;
	b: number;
	chapter: string;
	status: string;
	grat: GratKind;
	gratO?: number;
	/** optional camera on the scope layer: scale about a point */
	cam?: (T: number) => {s: number; x: number; y: number};
	draw: (T: number, sc: Scene) => React.ReactNode;
};

const TAU = Math.PI * 2;
const DROP1 = TLX.drop1;
const DROP2 = TLX.drop2;
const BREAK = TLX.breakAt;
const BUILD = 46.8;
const HB = 0.254; // half a beat
const sin = Math.sin;
const cos = Math.cos;
const gauss = (x: number, s: number) => Math.exp(-(x * x) / (2 * s * s));

// ---------------------------------------------------------------- shared pictures

/** the opening fan: 32 traces bursting from one */
const FAN = Array.from({length: 32}, (_, i) => ({
	f: 1.2 + random(`ff${i}`) * 2.2,
	ph: random(`fp${i}`) * TAU,
	A: (40 + random(`fa${i}`) * 260) * (random(`fs${i}`) > 0.5 ? 1 : -1),
	w: 1.5 + random(`fw${i}`) * 2,
}));
const fanY = (i: number, x: number, t: number, burst: number) => {
	const u = (x - 96) / 1728;
	const base = 60 * sin(TAU * 2 * u - t * 4);
	const tr = FAN[i];
	const own = tr.A * Math.min(1, u * 1.6) * sin(TAU * tr.f * u + tr.ph - t * tr.w);
	return 460 + mix(base, own, burst);
};
const Fan: React.FC<{t: number; burst: number; o?: number; collapse?: number; red?: number}> = ({t, burst, o = 1, collapse = 0, red = 0}) => {
	const ds = FAN.map((_, i) => path((x) => mix(fanY(i, x, t, burst), 250 + (x - 96) * 0, collapse), 96, 1824, 6));
	return (
		<g opacity={o}>
			<g filter="url(#phos)" opacity={0.18}>
				{ds.map((d, i) => (
					<path key={i} d={d} fill="none" stroke={C.trace} strokeWidth={8} />
				))}
			</g>
			{ds.map((d, i) => (
				<path key={i} d={d} fill="none" stroke={i === 0 && red > 0 ? C.red : C.trace} strokeWidth={2.2} opacity={i === 0 ? 1 : (0.75 - 0.4 * (i / 32)) * (1 - red)} />
			))}
		</g>
	);
};

/** the hook question on a plate, top centre */
const Question: React.FC<{T: number; at: number; o?: number; strike?: number; y?: number; size?: number}> = ({T, at, o = 1, strike = 0, y = 240, size = 110}) => {
	const lo = lock(T, at) * o;
	if (lo <= 0) return null;
	const w = size * 8.4;
	return (
		<g opacity={lo}>
			<Plate x={960 - w / 2 - 40} y={y - size * 0.95} w={w + 80} h={size * 1.35} />
			<Tx x={960} y={y} size={size} font={SANS} weight={900} anchor="middle">
				同时算所有答案？
			</Tx>
			{strike > 0 ? <line x1={960 - w / 2} y1={y - size * 0.32} x2={960 - w / 2 + w * strike} y2={y - size * 0.32} stroke={C.red} strokeWidth={6} /> : null}
		</g>
	);
};

/** a coin in XY mode: an ellipse whose width follows |cos θ|; `fall` 0..1 lays it flat */
const XYCoin: React.FC<{cx: number; cy: number; R: number; th: number; fall?: number; ghosts?: number[]; face?: '0' | '1'; o?: number}> = ({cx, cy, R, th, fall = 0, ghosts = [], face, o = 1}) => {
	const one = (t: number, op: number, key: string, core: boolean) => {
		const c = cos(t);
		const w = Math.max(0.04, Math.abs(c));
		const rx = mix(R * w, R * 0.65, fall);
		const ry = mix(R, R * 0.11, fall);
		const shown = face ?? (c >= 0 ? '1' : '0');
		const rim = R * 0.05 * Math.abs(sin(t)) * (1 - fall) + fall * R * 0.04;
		return (
			<g key={key} opacity={op}>
				{core ? <ellipse cx={cx} cy={cy} rx={rx + rim} ry={ry} fill="none" stroke={C.trace} strokeWidth={14} opacity={0.22} filter="url(#phos)" /> : null}
				<ellipse cx={cx + (fall > 0 ? 0 : rim)} cy={cy + (fall > 0 ? rim : 0)} rx={rx} ry={ry} fill="none" stroke={C.dim} strokeWidth={2.5} />
				<ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={C.screen} fillOpacity={0.6} stroke={C.trace} strokeWidth={3.5} />
				{core && w > 0.22 && fall < 0.6 ? (
					<text x={cx} y={cy + R * 0.36} textAnchor="middle" transform={`translate(${cx},${cy}) scale(${rx / R},1) translate(${-cx},${-cy})`} style={{fontFamily: MONO, fontWeight: 700, fontSize: R * 1.0}} fill={C.ro}>
						{shown}
					</text>
				) : null}
				{core && fall >= 0.6 ? (
					<text x={cx} y={cy - R * 0.2} textAnchor="middle" style={{fontFamily: MONO, fontWeight: 700, fontSize: R * 0.55}} fill={C.ro} opacity={clamp((fall - 0.6) * 3)}>
						{shown}
					</text>
				) : null}
			</g>
		);
	};
	return (
		<g opacity={o}>
			{ghosts.map((g, i) => one(g, [0.35, 0.18, 0.08][i] ?? 0, `g${i}`, false))}
			{one(th, 1, 'c', true)}
		</g>
	);
};

/** a flat coin glyph: a thin ellipse + rim, a beam dot resting on it */
const FlatCoin: React.FC<{cx: number; cy: number; rx?: number; label?: string; o?: number}> = ({cx, cy, rx = 150, label, o = 1}) => (
	<g opacity={o}>
		<ellipse cx={cx} cy={cy} rx={rx} ry={rx * 0.17} fill="none" stroke={C.trace} strokeWidth={14} opacity={0.22} filter="url(#phos)" />
		<path d={`M${cx - rx},${cy} L${cx - rx},${cy + 10} A${rx},${rx * 0.17} 0 0 0 ${cx + rx},${cy + 10} L${cx + rx},${cy}`} fill="none" stroke={C.dim} strokeWidth={2.5} />
		<ellipse cx={cx} cy={cy} rx={rx} ry={rx * 0.17} fill="none" stroke={C.trace} strokeWidth={3.5} />
		<Beam x={cx} y={cy} />
		{label ? (
			<Tx x={cx} y={cy - 70} size={140} anchor="middle" halo>
				{label}
			</Tx>
		) : null}
	</g>
);

/** n answer rows with ket labels; amp(i) 0..1, red row index */
const Rows: React.FC<{T: number; n: number; y0: number; dy: number; x0: number; x1: number; amp: (i: number) => number; red?: number; kets?: boolean; ketX?: number; ketSize?: number; bits?: number; freeze?: number; ghost?: (i: number) => number; A?: number}> = ({
	T,
	n,
	y0,
	dy,
	x0,
	x1,
	amp,
	red = -1,
	kets = true,
	ketX = 270,
	ketSize = 48,
	bits = 3,
	freeze,
	ghost,
	A = 36,
}) => {
	const t = freeze !== undefined ? Math.min(T, freeze) : T;
	const step = n > 16 ? 8 : 4;
	const fns = Array.from({length: n}, (_, i) => {
		const fr = 2 + random(`rf${i}`) * 2.5;
		const ph = random(`rp${i}`) * TAU;
		const a = amp(i) * (i === red ? A * 1 : A);
		return (x: number) => y0 + i * dy + a * sin(TAU * fr * ((x - x0) / (x1 - x0)) * 2 + ph - t * 3);
	});
	return (
		<g>
			{n <= 32 ? (
				<g filter="url(#phos)" opacity={0.18}>
					{fns.map((fn, i) => (i === red ? null : <path key={i} d={path(fn, x0, x1, step * 2)} fill="none" stroke={C.trace} strokeWidth={8} />))}
				</g>
			) : null}
			{fns.map((fn, i) => {
				const d = path(fn, x0, x1, step);
				const g = ghost ? ghost(i) : 0;
				return (
					<g key={i}>
						{g > 0 ? (
							<path
								d={path((x) => 2 * (y0 + i * dy) - fn(x) + 0, x0, x1, step)}
								fill="none"
								stroke={C.dim}
								strokeWidth={2.5}
								strokeDasharray="10 8"
								opacity={g}
							/>
						) : null}
						{i === red ? <Tr d={d} color={C.red} w={3} hot /> : <path d={d} fill="none" stroke={C.trace} strokeWidth={n > 32 ? 1.4 : 2.6} opacity={n > 32 ? 0.75 : 0.9} />}
					</g>
				);
			})}
			{kets
				? Array.from({length: n}, (_, i) => (
						<Tx key={i} x={ketX} y={y0 + i * dy + ketSize * 0.36} size={ketSize} anchor="end" fill={i === red ? C.redL : C.trace}>
							{`|${i.toString(2).padStart(bits, '0')}⟩`}
						</Tx>
					))
				: null}
		</g>
	);
};

/** the padlock trace around a rectangle */
const lockPath = (x0: number, y0: number, x1: number, y1: number) => {
	const cx = (x0 + x1) / 2;
	const r = Math.min(110, (x1 - x0) * 0.22);
	return `M${cx - r},${y0} L${cx - r},${y0 - r * 0.4} A${r},${r} 0 0 1 ${cx + r},${y0 - r * 0.4} L${cx + r},${y0} M${x0},${y0} L${x1},${y0} L${x1},${y1} L${x0},${y1} Z`;
};

// ---------------------------------------------------------------- scenes

const sceneList = (): Scene[] => {
	const L: Scene[] = [];

	// 1 Fan · h1, h2
	L.push({
		name: 'fan',
		a: 0,
		b: S('h3'),
		chapter: '00 · 传说',
		status: 'CH1 200 mV/div · TIME 1 ms/div · TRIG ▲ AUTO',
		grat: 'full',
		draw: (T, sc) => {
			const h2 = S('h2');
			const t = Math.min(T, h2);
			const burst = 0.3 + 0.7 * pr(T, 0.2, 0.45, ez.io);
			const sweep = pr(T, h2, E('h2') - h2 + 0.2, ez.io);
			const cx = 96 + 1728 * sweep;
			const stampAt = h2 + (E('h2') - h2 + 0.2) * 0.5;
			const fold = pr(T, sc.b - 0.35, 0.35, ez.io);
			return (
				<g>
					<Fan t={t} burst={burst * (1 - fold)} o={1 - 0.5 * fold} />
					<Question T={T} at={S('h1', 0.6)} o={1 - fold} />
					{T >= h2 && fold < 1 ? <VCursor x={cx} o={1 - fold} /> : null}
					<Stamp x={960} y={480} T={T} at={stampAt} text="误导 ✗" size={140} color={C.red} o={1 - fold} />
				</g>
			);
		},
	});

	// 2 Record · h3, h4, VO-free gap into the drop
	L.push({
		name: 'record',
		a: S('h3'),
		b: DROP1,
		chapter: '00 · 纪录',
		status: 'CH1 ▸ CLASSICAL · CH2 ▸ WILLOW · TIME 1 min/div',
		grat: 'full',
		cam: (T) => ({s: 1 + 0.03 * pr(T, S('h4'), 3, ez.io), x: 960, y: 450}),
		draw: (T) => {
			const h3 = S('h3');
			const h4 = S('h4');
			const gap = E('h4') + 0.1;
			const burstT = T - (h3 + 0.25);
			const burstEnv = burstT < 0 ? 0 : burstT < 0.35 ? burstT / 0.35 : Math.exp(-(burstT - 0.35) * 5);
			const ch2 = path((x) => 640 + 120 * burstEnv * gauss(x - 1100, 110) * sin((x - 900) * 0.09 - T * 20), 96, 1824, 2);
			const ch2on = pr(T, h3 - 0.1, 0.3);
			const ch1on = pr(T, h4, 0.3);
			// timebase zoom in the gap: CH1 compresses, then flattens into one bright line for the title
			const zoom = 1 + 40 * pr(T, gap + 0.3, DROP1 - gap - 0.5, ez.in);
			const flat = pr(T, DROP1 - 0.2, 0.2, ez.in);
			const ch1 = path((x) => mix(330 + 50 * sin(((x - 96) / 1728) * TAU * 3 * zoom - T * 6), 330, flat), 96, 1824, 2);
			const zeros = pr(T, h4 + 0.3, DROP1 - 0.6 - h4 - 0.3, ez.arrive);
			const universe = lock(T, gap);
			const tag = pr(T, gap, 0.3);
			const tdiv = ['1 min/div', '1 年/div', '10⁸ 年/div', '10²⁴ 年/div'][Math.min(3, Math.max(0, Math.floor((T - gap - 0.3) / 0.508) + 1))];
			return (
				<g>
					<line x1={60} y1={450} x2={1860} y2={450} stroke={C.frame} strokeWidth={2.5} />
					<Tx x={150} y={175} size={44} font={SANS} fill={C.trace} o={0.6 + 0.4 * ch1on}>
						CH1 ▸ 最快的超级计算机之一 · Google 估计
					</Tx>
					<Counter x={150} y={290} size={74} text="10,000,000,000,000,000,000,000,000 年" lit={T < h4 ? 0 : 0.04 + 0.96 * zeros} />
					<Tr d={ch1} o={0.35 + 0.65 * ch1on} w={flat > 0 ? 3 + 2 * flat : 2.6} hot={flat > 0} />
					<g opacity={ch2on * (1 - pr(T, DROP1 - 0.25, 0.2))}>
						<Tx x={150} y={510} size={44} fill={C.redL} font={SANS}>
							CH2 ▸ Google Willow · 2024.12
						</Tx>
						<Tr d={ch2} color={C.red} w={3} hot ghosts={[1, 2, 3].map((k) => path((x) => 640 + 120 * (burstT - k / FPS < 0 ? 0 : burstEnv) * gauss(x - 1100, 110) * sin((x - 900) * 0.09 - (T - k / FPS) * 20), 700, 1500, 4))} />
						<g opacity={lock(T, h3 + 0.4) * (1 - tag)}>
							<Tx x={150} y={740} size={170} fill={C.red} halo>
								{'<5'}
							</Tx>
							<Tx x={150 + 2 * 0.6 * 170 + 30} y={740} size={130} fill={C.red} font={SANS} weight={900}>
								分钟
							</Tx>
						</g>
						<g opacity={tag}>
							<line x1={150} y1={640} x2={150} y2={560} stroke={C.red} strokeWidth={3} />
							<Tx x={170} y={580} size={44} fill={C.redL} font={SANS}>
								{'< 5 分钟'}
							</Tx>
						</g>
					</g>
					{universe > 0 ? (
						<g opacity={universe * (1 - pr(T, DROP1 - 0.25, 0.2))}>
							<Tx x={150} y={740} size={96} font={SANS} weight={900} halo>
								远超宇宙年龄
							</Tx>
							<Tx x={1360} y={175} size={44} fill={C.ro}>
								{`TIME ${tdiv}`}
							</Tx>
							<g opacity={pr(T, gap + 0.8, 0.3)}>
								<line x1={152} y1={400} x2={152} y2={455} stroke={C.dim} strokeWidth={3} />
								<Plate x={168} y={378} w={400} h={60} />
								<Tx x={180} y={420} size={44} fill={C.dim} font={SANS}>
									宇宙年龄 138 亿年
								</Tx>
							</g>
						</g>
					) : null}
				</g>
			);
		},
	});

	// 3 Title · 14.24 hardest drop
	const TITLE = [...'《量子计算机不是同时算》'];
	L.push({
		name: 'title',
		a: DROP1,
		b: S('s1'),
		chapter: '',
		status: 'TRIG ▲ SINGLE · ARMED',
		grat: 'full',
		cam: (T) => ({s: 1 + 0.06 * Math.exp(-(T - DROP1) * 12), x: 960, y: 540}),
		draw: (T, sc) => {
			const size = 132;
			const w = TITLE.length * size;
			const grp = (i: number) => (i <= 5 ? 0 : i <= 7 ? 1 : 2);
			const out = pr(T, sc.b - 0.45, 0.4, ez.io);
			const sq = pr(T, sc.b - 0.4, 0.4);
			const base = path((x) => {
				const bit = random(`sq${Math.floor((x + T * 900) / 60)}`) > 0.5 ? 1 : 0;
				return 560 - sq * bit * 70;
			}, 96, 1824, 3);
			const pulse = Math.exp(-(T - DROP1) * 8);
			return (
				<g>
					<Tr d={base} w={3 + 2 * pulse} hot />
					<path d={`M948,100 L972,100 L960,122 Z`} fill={C.red} />
					<g opacity={1 - out}>
						{TITLE.map((ch, i) => {
							const at = DROP1 + grp(i) * HB;
							const k = (T - at) * FPS;
							if (k < 0) return null;
							const bloom = k < 2;
							const sc2 = grp(i) === 1 ? (k < 3 ? 1.12 : 1 + 0.12 * Math.exp(-(k - 3) / 3)) : 1;
							const x = 960 - w / 2 + (i + 0.5) * size;
							return (
								<g key={i} transform={`translate(${x},520) scale(${sc2}) translate(${-x},-520)`}>
									<text x={x} y={520} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 900, fontSize: size}} fill={C.trace} opacity={0.5} filter="url(#phosHero)">
										{ch}
									</text>
									<text x={x} y={520} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 900, fontSize: size}} fill={bloom ? C.hot : C.ro}>
										{ch}
									</text>
								</g>
							);
						})}
						<Tx x={960} y={640} size={26} anchor="middle" fill={C.tex} o={0.55 * pr(T, DROP1 + 0.6, 0.3)} ls={6}>
							QUANTUM COMPUTING · GOOGLE WILLOW · 2024
						</Tx>
					</g>
					<Beam x={960 - w / 2 + Math.min(1, (T - DROP1) / (3 * HB)) * w} y={560} o={1 - pr(T, DROP1 + 3 * HB, 0.2)} />
				</g>
			);
		},
	});

	// 4 Bits · s1
	L.push({
		name: 'bits',
		a: S('s1'),
		b: S('s2'),
		chapter: '01 · 比特',
		status: 'LOGIC D0–D7 · 1 GSa/s · TRIG EDGE ▲',
		grat: 'full',
		cam: (T) => {
			const z = pr(T, S('s2') - 0.47, 0.47, ez.in);
			return {s: 1 + 13 * z, x: 960, y: 515};
		},
		draw: (T, sc) => {
			const bit = (k: number, lane: number) => random(`b${lane}-${k}`) > 0.5;
			const sq = (lane: number, yHi: number, yLo: number, speed: number, cell: number) =>
				path((x) => (bit(Math.floor((x + T * speed) / cell), lane) ? yHi : yLo), 96, 1824, 2);
			return (
				<g>
					<Tx x={150} y={180} size={44} fill={C.trace} font={SANS}>
						8 GB 运行内存（以此计）
					</Tx>
					<Counter x={150} y={300} size={96} text="≈ 64,000,000,000 bit" lit={pr(T, sc.a + 0.2, 2.0, ez.arrive)} />
					<Tr d={sq(0, 470, 560, 900, 60)} w={3} hot />
					{Array.from({length: 8}, (_, i) => (
						<g key={i} opacity={pr(T, sc.a + 0.1 + i * 0.07, 0.2)}>
							<path d={sq(i + 1, 604 + i * 23, 618 + i * 23, 600 + i * 30, 24 + i * 3)} fill="none" stroke={C.trace} strokeWidth={1.6} opacity={0.75} />
							<Tx x={66} y={618 + i * 23} size={18} fill={C.tex} o={0.5}>
								{`D${i}`}
							</Tx>
						</g>
					))}
				</g>
			);
		},
	});

	// 5 Flat coins · s2
	L.push({
		name: 'flat',
		a: S('s2'),
		b: S('s3'),
		chapter: '01 · 比特',
		status: 'MODE XY · STATIC',
		grat: 'full',
		gratO: 0.5,
		draw: (T, sc) => {
			const inn = pr(T, sc.a, 0.35);
			const shrink = pr(T, sc.b - 0.3, 0.3, ez.in);
			const shim = 0.97 + 0.03 * sin(T * 9);
			return (
				<g opacity={shim}>
					<g transform={`translate(${-400 * shrink},0)`} opacity={1 - shrink}>
						<FlatCoin cx={mix(960, 640, inn)} cy={mix(515, 600, inn)} label="0" o={inn} />
						<FlatCoin cx={mix(960, 1280, inn)} cy={mix(515, 360, inn)} label="1" o={inn} />
					</g>
					<Tx x={960} y={772} size={72} font={SANS} weight={900} anchor="middle" o={lock(T, sc.a + 0.5) * (1 - shrink)}>
						非 0 即 1
					</Tx>
				</g>
			);
		},
	});

	// 6 Willow's 105 · s3
	L.push({
		name: '105',
		a: S('s3'),
		b: S('s4'),
		chapter: '01 · 比特',
		status: 'SPLIT · CH1 CLASSICAL │ CH2 WILLOW',
		grat: 'split',
		draw: (T, sc) => {
			const sw = pr(T, sc.a + 0.15, 1.2, ez.lin);
			const rows = sw * 7;
			const collapse = pr(T, sc.b - 0.35, 0.35, ez.in);
			return (
				<g>
					<Tx x={150} y={310} size={60} fill={C.dim}>
						64,000,000,000
					</Tx>
					<Tx x={150} y={380} size={44} fill={C.dim}>
						bit
					</Tx>
					<Tx x={1000} y={180} size={44} fill={C.redL}>
						Google Willow
					</Tx>
					{Array.from({length: 105}, (_, i) => {
						const r = Math.floor(i / 15);
						const c = i % 15;
						const on = r < rows ? 1 : 0;
						const x = mix(1000 + c * 50, 1060, collapse);
						const y = mix(230 + r * 40, 230, collapse);
						return on ? <circle key={i} cx={x} cy={y} r={8} fill={C.red} opacity={0.9} /> : <circle key={i} cx={1000 + c * 50} cy={230 + r * 40} r={3} fill={C.grat} />;
					})}
					{sw > 0 && sw < 1 ? <HCursor y={230 + rows * 40 - 20} x0={980} x1={1740} /> : null}
					<g opacity={lock(T, sc.a + 1.2) * (1 - collapse)}>
						<Tx x={1000} y={735} size={220} fill={C.red} halo>
							105
						</Tx>
						<Tx x={1000 + 3 * 0.6 * 220 + 30} y={735} size={56} fill={C.redL}>
							qubits
						</Tx>
					</g>
				</g>
			);
		},
	});

	// 7 The cold · s4
	const KY = (k: number) => 140 + ((Math.log10(300) - Math.log10(k)) / (Math.log10(300) + 3)) * 640;
	L.push({
		name: 'cold',
		a: S('s4'),
		b: S('s5'),
		chapter: '01 · 比特',
		status: 'CH1 TEMP · LOG K · ROLL',
		grat: 'full',
		gratO: 0.6,
		draw: (T, sc) => {
			const p = pr(T, sc.a, 1.7, ez.io);
			const xHead = 260 + 1440 * p;
			const temp = (x: number) => {
				const u = (x - 260) / 1440;
				return Math.pow(10, mix(Math.log10(300), Math.log10(0.01), 1 - Math.exp(-u * 4.2)) / 1);
			};
			const d = path((x) => KY(temp(x)), 260, xHead, 4);
			const cur = pr(T, sc.a + 1.8, 0.2);
			return (
				<g>
					<line x1={220} y1={140} x2={220} y2={780} stroke={C.grat} strokeWidth={2} />
					{[300, 30, 3, 0.3, 0.03, 0.003].map((k) => (
						<g key={k}>
							<line x1={212} y1={KY(k)} x2={228} y2={KY(k)} stroke={C.dim} strokeWidth={2} />
						</g>
					))}
					<Tx x={232} y={150} size={30} fill={C.tex} o={0.6}>
						K
					</Tx>
					<line x1={220} y1={KY(2.7)} x2={1840} y2={KY(2.7)} stroke={C.dim} strokeWidth={2} strokeDasharray="10 8" />
					<Tx x={1300} y={KY(2.7) - 16} size={44} fill={C.dim} font={SANS}>
						外太空 2.7 K
					</Tx>
					<Tx x={1100} y={210} size={56} fill={C.trace} font={SANS}>
						超导量子芯片
					</Tx>
					<Tr d={d} w={3} hot />
					{p < 1 ? <Beam x={xHead} y={KY(temp(xHead))} /> : null}
					<g opacity={lock(T, sc.a + 1.6)}>
						<Tx x={1100} y={KY(0.01) - 30} size={96} halo>
							≈ 10 mK
						</Tx>
					</g>
					{cur > 0 ? (
						<g>
							<HCursor y={KY(2.7)} x0={600} x1={900} o={cur} />
							<HCursor y={KY(0.01)} x0={600} x1={900} o={cur} />
							<line x1={760} y1={KY(2.7)} x2={760} y2={KY(0.01)} stroke={C.red} strokeWidth={2} opacity={cur} />
							<Tx x={790} y={(KY(2.7) + KY(0.01)) / 2 + 22} size={64} fill={C.red} o={lock(T, sc.a + 2.0)} halo>
								×100+
							</Tx>
						</g>
					) : null}
				</g>
			);
		},
	});

	// 8 Face-off · s5 → zoom into the cursor at the break
	L.push({
		name: 'faceoff',
		a: S('s5'),
		b: BREAK,
		chapter: '01 · 比特',
		status: 'CH1 vs CH2 · CURSOR ▌',
		grat: 'full',
		gratO: 0.6,
		cam: (T) => {
			const z = pr(T, BREAK - 0.53, 0.53, ez.in);
			return {s: 1.0 + 0.03 * pr(T, S('s5'), 1.6) + 5 * z, x: 1574, y: 525};
		},
		draw: (T, sc) => {
			const slide = pr(T, sc.a + 0.25, 0.33);
			const blink = Math.floor(T * 4) % 2 === 0 ? 1 : 0.15;
			const gone = pr(T, sc.b - 0.32, 0.3, ez.in);
			return (
				<g opacity={1 - gone}>
					<line x1={96} y1={640} x2={1824} y2={640} stroke={C.trace} strokeWidth={2} opacity={0.5} />
					<Tx x={150} y={560} size={72} fill={C.dim}>
						64,000,000,000
					</Tx>
					<Tx x={150} y={610} size={44} fill={C.dim}>
						bit
					</Tx>
					<Tx x={930} y={560} size={64} fill={C.ro} o={0.6}>
						vs
					</Tx>
					<g transform={`translate(${300 * (1 - slide)},0)`} opacity={slide}>
						<Tx x={1130} y={600} size={220} fill={C.red} halo>
							105
						</Tx>
						<rect x={1130 + 3 * 0.6 * 220 + 18} y={440} width={60} height={170} fill={C.red} opacity={blink} />
						<Tx x={1130} y={680} size={56} fill={C.redL}>
							qubit
						</Tx>
					</g>
				</g>
			);
		},
	});

	// 9 The spinning coin · b1 (the break)
	const th = (T: number) => TAU * 0.55 * Math.max(0, T - BREAK);
	L.push({
		name: 'spin',
		a: BREAK,
		b: S('b2'),
		chapter: '02 · 量子比特',
		status: 'MODE XY ⟶ YT',
		grat: 'xy',
		draw: (T, sc) => {
			const appear = pr(T, BREAK, 0.4);
			const head = Math.min(1780, 1000 + (T - BREAK) * 300);
			const hist = (x: number) => 450 - 200 * cos(th(T - (head - x) / 300));
			const d = head > 1001 ? path(hist, Math.max(1000, head - 780), head, 3) : '';
			const shrink = pr(T, sc.b - 0.45, 0.45, ez.io);
			return (
				<g>
					<line x1={900} y1={100} x2={900} y2={800} stroke={C.frame} strokeWidth={2.5} />
					<Tx x={150} y={180} size={56} fill={C.trace}>
						QUBIT
					</Tx>
					<rect x={360} y={135} width={110} height={60} rx={6} fill="none" stroke={C.ro} strokeWidth={3} />
					<Tx x={415} y={180} size={44} font={SANS} anchor="middle">
						示意
					</Tx>
					<g transform={`translate(${mix(0, -260, shrink)},0) translate(560,450) scale(${mix(1, 0.6, shrink)}) translate(-560,-450)`}>
						<XYCoin cx={560} cy={450} R={230} th={th(T)} ghosts={[1, 2, 3].map((k) => th(T - k / FPS))} o={appear} />
					</g>
					{d ? <Tr d={d} w={3} hot /> : null}
					{head > 1001 ? <Beam x={head} y={hist(head)} /> : null}
					<Tx x={1000} y={210} size={44} fill={C.dim} font={SANS} o={pr(T, BREAK + 1, 0.4)}>
						硬币的宽度 · 随时间
					</Tx>
				</g>
			);
		},
	});

	// 10 Superposition · b2  /  11 Measure · b3 (shared rows)
	const rowsY = [300, 450, 640];
	const comp = (k: number, x: number, t: number) => {
		const u = (x - 760) / 1060;
		const A = [0.8, 0.6][k] * 110;
		return A * sin(TAU * 2.2 * u - t * 3.6 + k * 1.1);
	};
	const supRows = (t: number, collapse: number) =>
		[0, 1, 2].map((k) =>
			path(
				(x) => {
					const v = k < 2 ? comp(k, x, t) * 0.7 : comp(0, x, t) + comp(1, x, t);
					return rowsY[k] + mix(v * (k < 2 ? 1 : 0.55), k < 2 ? 0 : -60, collapse);
				},
				760,
				1820,
				3,
			),
		);
	L.push({
		name: 'superpos',
		a: S('b2'),
		b: S('b3'),
		chapter: '02 · 量子比特',
		status: 'CH1 |0⟩ · CH2 |1⟩ · MATH = CH1 + CH2',
		grat: 'rows',
		draw: (T, sc) => {
			const split = pr(T, sc.a, 0.47, ez.io);
			const ds = supRows(T, 0);
			return (
				<g>
					<XYCoin cx={300} cy={450} R={138} th={th(T)} ghosts={[1, 2].map((k) => th(T - k / FPS))} />
					{['|0⟩', '|1⟩', '= 叠加'].map((s, k) => (
						<Tx key={k} x={600} y={rowsY[k] + 18} size={52} fill={k < 2 ? C.dim : C.trace} font={k === 2 ? SANS : MONO} o={k === 2 ? 1 : split}>
							{s}
						</Tx>
					))}
					<g opacity={split}>
						<path d={ds[0]} fill="none" stroke={C.dim} strokeWidth={2} />
						<path d={ds[1]} fill="none" stroke={C.dim} strokeWidth={2} />
					</g>
					<Tr d={ds[2]} w={3} hot />
					<Tx x={760} y={200} size={72} o={lock(T, sc.a + 0.4)}>
						|0⟩ + |1⟩
					</Tx>
					<g opacity={lock(T, sc.a + 1.4)}>
						<Tx x={1180} y={200} size={72} font={SANS} weight={900} halo>
							叠加
						</Tx>
						<Tx x={1340} y={200} size={44} fill={C.dim}>
							SUPERPOSITION
						</Tx>
					</g>
				</g>
			);
		},
	});
	L.push({
		name: 'measure',
		a: S('b3'),
		b: S('b4'),
		chapter: '02 · 量子比特',
		status: 'TRIG ▲ SINGLE · STOPPED',
		grat: 'rows',
		draw: (T, sc) => {
			const TR = sc.a + 0.3;
			const fall = pr(T, TR, 10 / FPS, ez.in);
			const collapse = pr(T, TR + 0.1, 0.4, ez.io);
			const tt = Math.min(T, TR);
			const up = pr(T, sc.b - 0.4, 0.4, ez.io);
			const ds = supRows(tt, collapse);
			return (
				<g>
					{T >= TR ? <VCursor x={300} y0={100} y1={800} solid o={1 - 0.6 * pr(T, TR + 0.3, 0.4)} /> : null}
					{T >= TR ? (
						<Tx x={330} y={150} size={44} fill={C.redL} font={SANS}>
							TRIG · 测量
						</Tx>
					) : null}
					<XYCoin cx={300} cy={450} R={138} th={T < TR ? th(T) : 0} fall={fall * (1 - up)} face={T < TR ? undefined : '1'} ghosts={T < TR ? [th(T - 1 / FPS)] : []} />
					<g opacity={1 - up}>
						<path d={ds[0]} fill="none" stroke={C.dim} strokeWidth={2} opacity={1 - collapse} />
						<path d={ds[1]} fill="none" stroke={C.dim} strokeWidth={2} opacity={1 - collapse} />
						<Tr d={ds[2]} w={3} hot />
					</g>
					<Tx x={1100} y={520} size={160} o={lock(T, TR + 0.25)} halo>
						→ 1
					</Tx>
				</g>
			);
		},
	});

	// 12 Amplitude · b4
	const DROPS = Array.from({length: 40}, (_, i) => (((i + 1) * 0.6180339887) % 1 < 0.64 ? 0 : 1));
	L.push({
		name: 'amplitude',
		a: S('b4'),
		b: BUILD,
		chapter: '02 · 量子比特',
		status: 'CH1 |0⟩ · CH2 |1⟩ · HIST 0/1',
		grat: 'split',
		draw: (T, sc) => {
			const t = T;
			const wave = (k: number) => path((x) => [330, 600][k] - [0.8, 0.6][k] * 140 * sin(TAU * 1.5 * ((x - 150) / 850) - t * 3), 150, 1000, 3);
			const arr = pr(T, sc.a + 0.4, 0.4);
			const n = Math.max(0, Math.floor((T - sc.a - 0.3) / 0.45));
			const c0 = DROPS.slice(0, n).filter((d) => d === 0).length;
			const c1 = n - c0;
			const coinPh = ((T - sc.a - 0.3) % 0.45) / 0.45;
			const lastFace = DROPS[Math.max(0, n - 1)];
			return (
				<g>
					<Tx x={150} y={180} size={64} font={SANS} weight={700} o={lock(T, sc.a + 1.2)}>
						振幅 = 波的高度
					</Tx>
					{[0, 1].map((k) => (
						<g key={k}>
							<path d={wave(k)} fill="none" stroke={C.trace} strokeWidth={2.6} />
							<line x1={150} y1={[330, 600][k]} x2={1000} y2={[330, 600][k]} stroke={C.grat} strokeWidth={2} />
							<g opacity={arr}>
								<line x1={560} y1={[330, 600][k]} x2={560} y2={[330, 600][k] - [0.8, 0.6][k] * 140} stroke={C.ro} strokeWidth={2.5} />
								<path d={`M552,${[330, 600][k] - [0.8, 0.6][k] * 140 + 12} L560,${[330, 600][k] - [0.8, 0.6][k] * 140} L568,${[330, 600][k] - [0.8, 0.6][k] * 140 + 12}`} fill="none" stroke={C.ro} strokeWidth={2.5} />
								<Tx x={580} y={[330, 600][k] - 40} size={52} fill={C.ro}>
									{['|0⟩', '|1⟩'][k]}
								</Tx>
							</g>
						</g>
					))}
					<Tx x={1150} y={180} size={64} o={lock(T, sc.a + 1.8)}>
						P = |振幅|²
					</Tx>
					{T > sc.a + 0.3 ? <XYCoin cx={1700} cy={300} R={70} th={coinPh < 0.7 ? coinPh * 30 : 0} fall={coinPh < 0.7 ? 0 : clamp((coinPh - 0.7) / 0.2)} face={coinPh < 0.7 ? undefined : lastFace ? '1' : '0'} /> : null}
					<g opacity={pr(T, sc.a + 2.2, 0.3)}>
						<Tx x={1280} y={300} size={44} anchor="middle" fill={C.ro}>
							64%
						</Tx>
						<Tx x={1480} y={300} size={44} anchor="middle" fill={C.ro}>
							36%
						</Tx>
						<rect x={1560} y={720} width={110} height={60} rx={6} fill="none" stroke={C.ro} strokeWidth={3} />
						<Tx x={1615} y={765} size={44} font={SANS} anchor="middle">
							示意
						</Tx>
					</g>
					{[c0, c1].map((c, k) => (
						<g key={k}>
							<rect x={1220 + k * 200} y={760 - c * 62} width={120} height={c * 62} fill={C.trace} opacity={0.7} stroke={C.trace} strokeWidth={2} />
							<Tx x={1280 + k * 200} y={790} size={44} anchor="middle" fill={C.trace}>
								{String(k)}
							</Tx>
						</g>
					))}
				</g>
			);
		},
	});

	// 13 Combinations · u1 / 14 Doubling · u2, u2b
	const smallCoins = (T: number, n: number) => (
		<g>
			{Array.from({length: n}, (_, i) => (
				<XYCoin key={i} cx={190 + i * 105} cy={190} R={44} th={th(T) + i * 0.9} />
			))}
		</g>
	);
	L.push({
		name: 'combos',
		a: BUILD,
		b: S('u2'),
		chapter: '03 · 组合',
		status: '4 CH · |00⟩ |01⟩ |10⟩ |11⟩',
		grat: 'rows',
		draw: (T, sc) => {
			const on = (i: number) => pr(T, Math.max(sc.a, S('u1')) + i * 0.13, 0.3);
			return (
				<g>
					{smallCoins(T, 2)}
					<Tx x={1100} y={215} size={64} font={`${MONO}, ${SANS}`} o={lock(T, S('u1', 1.0))}>
						2 枚 → 4 种组合
					</Tx>
					<Rows T={T} n={4} y0={340} dy={120} x0={330} x1={1824} amp={(i) => on(i)} ketX={290} ketSize={52} bits={2} A={44} />
				</g>
			);
		},
	});
	L.push({
		name: 'doubling',
		a: S('u2'),
		b: S('u3'),
		chapter: '03 · 组合',
		status: 'CH × 2ⁿ · DENSITY ▲',
		grat: 'rows',
		draw: (T, sc) => {
			const k = Math.max(0, Math.min(5, Math.floor((T - sc.a - 0.3) / 0.508) + 1));
			const n = 4 * Math.pow(2, k);
			const ten = T >= S('u2b');
			const y0 = 360;
			const dy = (790 - y0) / n;
			return (
				<g>
					{smallCoins(T, ten ? 10 : 2 + k)}
					<Plate x={1240} y={110} w={600} h={210} />
					{ten ? (
						<>
							<Tx x={1270} y={240} size={140} o={lock(T, S('u2b'))} halo>
								2¹⁰
							</Tx>
							<Tx x={1270} y={305} size={60} font={`${MONO}, ${SANS}`} o={lock(T, S('u2b', 0.5))}>
								= 1,024 种
							</Tx>
						</>
					) : (
						<>
							<Tx x={1270} y={240} size={140}>
								2ⁿ
							</Tx>
							<Tx x={1270} y={305} size={60} font={`${MONO}, ${SANS}`}>
								{`n = ${2 + k} → ${n} 种`}
							</Tx>
						</>
					)}
					<Rows T={T} n={Math.min(n, 64)} y0={y0 + (790 - y0) / Math.min(n, 64) / 2} dy={(790 - y0) / Math.min(n, 64)} x0={330} x1={1824} amp={() => (n > 16 ? 0.6 : 0.6)} kets={n <= 8} ketX={290} ketSize={44} bits={3} A={Math.min(44, Math.max(10, dy * 1.4))} />
				</g>
			);
		},
	});

	// 15 The wall · u3 / 16 The myth again · u4
	const wall = (T: number, y0: number, y1: number, bright: number, collapse = 0, jitter = 0) => {
		const n = 120;
		const ds = Array.from({length: n}, (_, i) => {
			const cy = y0 + ((i + 0.5) / n) * (y1 - y0);
			const fr = 1 + random(`wf${i}`) * 4;
			const ph = random(`wp${i}`) * TAU;
			const a = (y1 - y0) * 0.08 * (1 + random(`wa${i}`)) + jitter * sin(T * 50 + i);
			return path((x) => {
				const xx = 960 + (x - 960) * (1 - collapse);
				void xx;
				return mix(cy + a * sin(TAU * fr * ((x - 60) / 1800) + ph - T * 4), 450, collapse);
			}, 60, 1860, 8);
		});
		return (
			<g>
				<rect x={60} y={y0} width={1800} height={y1 - y0} fill="url(#wallBand)" opacity={bright} filter="url(#phos)" />
				{ds.map((d, i) => (
					<path key={i} d={d} fill="none" stroke={C.trace} strokeWidth={1.2} opacity={0.35 * bright} transform={collapse > 0 ? `translate(960,0) scale(${1 - collapse},1) translate(-960,0)` : undefined} />
				))}
			</g>
		);
	};
	L.push({
		name: 'wall',
		a: S('u3'),
		b: S('u4'),
		chapter: '03 · 组合',
		status: 'CH × 2³⁰⁰ · OVERFLOW',
		grat: 'rows',
		draw: (T, sc) => {
			const type = pr(T, sc.a + 0.1, 1.5, ez.lin);
			const txt = '2³⁰⁰ ≈ 2 × 10⁹⁰ 种组合';
			const shown = [...txt].slice(0, Math.ceil(type * [...txt].length)).join('');
			const out = pr(T, sc.b - 0.33, 0.33);
			return (
				<g>
					{wall(T, 520, 790, 0.6 + 0.4 * pr(T, sc.a, 3))}
					<g opacity={1 - out} transform={`translate(0,${-120 * out})`}>
						<rect x={150} y={160} width={1100} height={170} fill={C.plate} opacity={0.9} />
						<path d={`M150,160 L1250,160 M150,330 L1250,330 M150,160 L150,330 M1250,160 L1250,${type > 0.8 ? 200 : 330}`} fill="none" stroke={C.frame} strokeWidth={3} />
						{type > 0.8 ? <line x1={1250} y1={290} x2={1250} y2={330} stroke={C.frame} strokeWidth={3} /> : null}
						<Tx x={180} y={285} size={110} font={`${MONO}, ${SANS}`} halo>
							{shown}
						</Tx>
						<rect x={150} y={360} width={1100} height={120} fill={C.plate} opacity={0.9} stroke={C.frame} strokeWidth={3} />
						<Tx x={180} y={445} size={64} fill={C.dim} font={`${MONO}, ${SANS}`} o={lock(T, sc.a + 1.9)}>
							可观测宇宙的原子 ≈ 10⁸⁰（估算）
						</Tx>
					</g>
				</g>
			);
		},
	});
	L.push({
		name: 'myth',
		a: S('u4'),
		b: DROP2,
		chapter: '03 · 组合',
		status: 'CH × ALL · TRIG ARMED',
		grat: 'rows',
		cam: (T) => ({s: 1 + 0.05 * pr(T, S('u4'), DROP2 - S('u4'), ez.io), x: 960, y: 450}),
		draw: (T, sc) => {
			const grow = pr(T, sc.a, 0.4, ez.io);
			const jit = pr(T, DROP2 - 0.55, 0.5);
			const blink = Math.floor(T * (jit > 0 ? 8 : 4)) % 2 === 0 ? 1 : 0.15;
			return (
				<g>
					{wall(T, mix(520, 110, grow), 790, 1, 0, 2 * jit)}
					<Question T={T} at={sc.a} y={470} size={120} />
					<rect x={960 + 120 * 4.2 + 30} y={360} width={50} height={130} fill={C.red} opacity={blink * lock(T, sc.a)} />
				</g>
			);
		},
	});

	// 17 不是。 · the second drop
	L.push({
		name: 'no',
		a: DROP2,
		b: S('r3'),
		chapter: '04 · 测量',
		status: 'TRIG ▲ SINGLE · 1 SHOT',
		grat: 'full',
		cam: (T) => ({s: 1 + 0.06 * Math.exp(-(T - DROP2) * 12), x: 960, y: 450}),
		draw: (T, sc) => {
			const c = pr(T, DROP2 + 1 / FPS, 4 / FPS, ez.in);
			const fade = pr(T, S('r2'), 8 / FPS);
			const spikeH = 360 * (0.92 + 0.08 * sin(T * 6));
			const spike = path((x) => 450 - spikeH * gauss(x - 960, 9) * c, 96, 1824, 2);
			const typed = pr(T, S('r2', 0.1), 0.6, ez.lin);
			const mtxt = 'MEASURE → |1011…⟩';
			const split = pr(T, sc.b - 0.45, 0.45, ez.io);
			return (
				<g>
					{c < 1 ? wall(T, 110, 790, 1 - c, c) : null}
					<g transform={`translate(0,0)`} opacity={1 - split}>
						<Tr d={spike} w={3} hot />
					</g>
					{split > 0 ? (
						<g opacity={split}>
							<Tr d={path((x) => mix(450, 330, split) + 60 * split * sin(((x - 96) / 1728) * TAU * 3 - T * 3), 96, 1824, 3)} />
							<Tr d={path((x) => mix(450, 500, split) - 60 * split * sin(((x - 96) / 1728) * TAU * 3 - T * 3), 96, 1824, 3)} />
						</g>
					) : null}
					<VCursor x={960} solid o={1 - 0.6 * pr(T, DROP2 + 0.4, 0.5)} />
					<g opacity={1 - fade}>
						<Question T={T} at={DROP2 - 1} y={470} size={120} strike={pr(T, DROP2, 3 / FPS)} />
					</g>
					<g opacity={1 - fade}>
						{stampK(T, DROP2) > 0 ? (
							<g transform={`translate(960,470) scale(${stampK(T, DROP2)})`}>
								<Tx x={0} y={80} size={240} fill={C.red} anchor="middle" halo>
									✗
								</Tx>
							</g>
						) : null}
					</g>
					{T >= S('r2') ? (
						<g opacity={1 - split}>
							<Tx x={150} y={640} size={96} halo>
								{[...mtxt].slice(0, Math.ceil(typed * [...mtxt].length)).join('')}
							</Tx>
							<Tx x={150} y={735} size={64} font={SANS} o={lock(T, S('r2', 0.8))}>
								1 个 · 随机
							</Tx>
						</g>
					) : null}
				</g>
			);
		},
	});

	// 18 Interference · r3, r4, r5
	L.push({
		name: 'interference',
		a: S('r3'),
		b: S('r6'),
		chapter: '05 · 干涉',
		status: 'CH1 · CH2 · MATH = CH1 + CH2',
		grat: 'rows',
		draw: (T, sc) => {
			const r4 = S('r4');
			const r5 = S('r5');
			const phase = Math.PI * pr(T, r4 + 0.1, 0.6, ez.io);
			const noisy = pr(T, r5, 0.3);
			const relabel = T >= r5;
			const u = (x: number) => (x - 700) / 1124;
			const ch1 = (x: number, t: number) => mix(70 * sin(TAU * 2.5 * u(x) - t * 4), 40 * sin(TAU * 4 * u(x) - t * 7) + 22 * sin(TAU * 9.3 * u(x) - t * 11) + 12 * sin(TAU * 17 * u(x) + t * 5), noisy);
			const ch2 = (x: number, t: number) => (phase >= Math.PI - 1e-3 || noisy > 0 ? -ch1(x, t) : 70 * sin(TAU * 2.5 * u(x) - t * 4 + phase));
			const mathHead = 700 + 1124 * pr(T, sc.a + 0.3, 0.9, ez.lin);
			const yy = [330, 500, 680];
			const sum = (x: number) => yy[2] - 0.5 * (ch1(x, T) + ch2(x, T)) - (noisy > 0 ? 3 * sin(x * 0.3 + T * 9) : 0);
			const ghost = pr(T, r4 + 0.3, 0.2) * (1 - pr(T, r5 + 0.6, 0.4));
			const lbl = relabel ? ['CH1 噪声', 'CH2 反相波', '≈ 安静'] : ['CH1', 'CH2', 'MATH'];
			return (
				<g>
					<g opacity={lock(T, sc.a + 0.2) * (1 - pr(T, r4 + 1.2, 0.3))}>
						<Tx x={150} y={200} size={96} font={SANS} weight={900} halo>
							干涉
						</Tx>
						<Tx x={370} y={200} size={44} fill={C.dim}>
							INTERFERENCE
						</Tx>
					</g>
					{lbl.map((s, k) => (
						<Tx key={s} x={150} y={yy[k] + 18} size={52} font={`${MONO}, ${SANS}`} fill={k === 2 ? C.ro : C.trace} o={relabel ? lock(T, r5) : 1}>
							{s}
						</Tx>
					))}
					<Tr d={path((x) => yy[0] - ch1(x, T), 700, 1824, 3)} />
					<Tr d={path((x) => yy[1] - ch2(x, T), 700, 1824, 3)} />
					{ghost > 0 ? <path d={path((x) => yy[0] + ch1(x, T), 700, 1824, 3)} fill="none" stroke={C.dim} strokeWidth={2.5} strokeDasharray="10 8" opacity={ghost} /> : null}
					<Tr d={path(sum, 700, mathHead, 3)} w={3} hot />
					{mathHead < 1823 ? <Beam x={mathHead} y={sum(mathHead)} /> : null}
					<g opacity={lock(T, r4 + 0.8) * (1 - pr(T, r5, 0.2))}>
						<Plate x={1130} y={545} w={560} h={80} />
						<Tx x={1150} y={605} size={64} font={`${MONO}, ${SANS}`}>
							波峰 + 波谷 = 0
						</Tx>
					</g>
					{relabel ? (
						<g transform="translate(1700,190) scale(0.9)" opacity={pr(T, r5, 0.4)}>
							<path d="M-70,30 L-70,-5 A70,70 0 0 1 70,-5 L70,30" fill="none" stroke={C.trace} strokeWidth={6} strokeDasharray={300} strokeDashoffset={300 * (1 - pr(T, r5, 0.4))} />
							<rect x={-88} y={14} width={34} height={64} rx={14} fill="none" stroke={C.trace} strokeWidth={6} />
							<rect x={54} y={14} width={34} height={64} rx={14} fill="none" stroke={C.trace} strokeWidth={6} />
						</g>
					) : null}
				</g>
			);
		},
	});

	// 19 KEY · wrong answers cancel · r6, r7, r8
	const RIGHT = 5;
	L.push({
		name: 'key',
		a: S('r6'),
		b: S('r9'),
		chapter: '05 · 干涉',
		status: '8 CH · 3 qubits · MATH Σ',
		grat: 'rows',
		draw: (T, sc) => {
			const r6 = S('r6');
			const r7 = S('r7');
			const r8 = S('r8');
			const order = [0, 1, 2, 3, 4, 6, 7];
			const cancel = (i: number) => (i === RIGHT ? 0 : pr(T, r6 + 0.2 + order.indexOf(i) * 0.22, 0.4, ez.io));
			const grow = pr(T, r7, 1.2, ez.arrive);
			const TR = r8 + 0.35;
			const sweep = pr(T, TR, 12 / FPS, ez.lin);
			const frozen = T >= TR + 12 / FPS;
			const pct = mix(12.5, 94.1, pr(T, r7 + 0.1, 1.3, ez.arrive));
			return (
				<g>
					<g opacity={lock(T, r6 + 0.1) * (1 - pr(T, r7, 0.2))}>
						<Plate x={980} y={100} w={380} h={74} />
						<Tx x={1000} y={155} size={56} font={`${MONO}, ${SANS}`}>
							错的 → 0
						</Tx>
					</g>
					<g opacity={frozen ? 1 : 1}>
						<Rows
							T={T}
							n={8}
							y0={210}
							dy={80}
							x0={300}
							x1={1380}
							amp={(i) => (i === RIGHT ? (T < r7 ? 1 : 1 + 1.6 * grow) : (1 - cancel(i)) * (frozen ? 0.25 : 1))}
							red={T >= r7 ? RIGHT : -1}
							freeze={frozen ? TR + 12 / FPS : undefined}
							ghost={(i) => (i === RIGHT ? 0 : clamp(cancel(i) * 3) * (1 - pr(T, r7 + 0.4, 0.3)))}
							A={30}
						/>
					</g>
					{/* % column (texture) */}
					{Array.from({length: 8}, (_, i) => (i === RIGHT ? null : (
						<Tx key={i} x={1410} y={218 + i * 80} size={26} fill={C.tex} o={0.55 * (T >= r7 && (i === 4 || i === 6) ? 0 : T >= r7 ? 0.7 : 1 - 0.8 * cancel(i))}>
							{T >= r7 ? `${(0.6 + random(`pc${i}`) * 0.5).toFixed(1)}%` : '12.5%'}
						</Tx>
					)))}
					{T >= r7 ? (
						<g>
							<Tx x={1460} y={640} size={100} fill={C.red} halo>
								{`${pct.toFixed(1)}%`}
							</Tx>
							<rect x={1460} y={665} width={110} height={60} rx={6} fill="none" stroke={C.ro} strokeWidth={3} />
							<Tx x={1515} y={710} size={44} font={SANS} anchor="middle">
								示意
							</Tx>
							<Tx x={1590} y={710} size={44} fill={C.redL} font={SANS}>
								▲ 互相加强
							</Tx>
						</g>
					) : null}
					{T >= TR && sweep < 1 ? <VCursor x={300 + 1080 * sweep} solid /> : null}
					{frozen ? (
						<g opacity={lock(T, TR + 12 / FPS)}>
							<Plate x={300} y={110} w={800} h={150} />
							<Tx x={330} y={225} size={120} fill={C.red} halo>
								RESULT 101
							</Tx>
						</g>
					) : null}
				</g>
			);
		},
	});

	// 20 Only some problems · r9
	L.push({
		name: 'some',
		a: S('r9'),
		b: S('r10'),
		chapter: '06 · 用处',
		status: 'CH1 少数题 · CH2 大多数题 · REF classical',
		grat: 'rows',
		draw: (T, sc) => {
			const p1 = pr(T, sc.a + 0.1, 1.4, ez.io);
			const p2 = pr(T, sc.a + 0.5, 1.4, ez.io);
			const up = (x: number) => 430 - 260 * Math.pow((x - 150) / 1650, 3) * 3.2;
			const flat = (x: number) => 720 - 30 * ((x - 150) / 1650) - 10 * sin(x * 0.02);
			return (
				<g>
					<line x1={60} y1={450} x2={1860} y2={450} stroke={C.frame} strokeWidth={2.5} />
					<Tx x={150} y={230} size={64} font={`${SANS}`} weight={700} o={lock(T, sc.a + 0.3)}>
						少数题 ▲▲▲ 快得离谱
					</Tx>
					<line x1={150} y1={430} x2={1800} y2={400} stroke={C.dim} strokeWidth={2} strokeDasharray="10 8" />
					<Tr d={path((x) => Math.max(110, up(x)), 150, 150 + 1650 * p1, 3)} w={3} hot />
					<Tx x={150} y={540} size={64} font={SANS} weight={700} fill={C.dim} o={lock(T, sc.a + 0.7)}>
						大多数题 ▲ 强不了多少
					</Tx>
					<line x1={150} y1={730} x2={1800} y2={700} stroke={C.dim} strokeWidth={2} strokeDasharray="10 8" />
					<Tr d={path(flat, 150, 150 + 1650 * p2, 3)} />
					<Tx x={1820} y={780} size={30} fill={C.tex} anchor="end" o={0.6}>
						Aaronson · SciAm 2008
					</Tx>
				</g>
			);
		},
	});

	// 21 Just a speed test · r10 (callback to the record)
	L.push({
		name: 'speedtest',
		a: S('r10'),
		b: S('r11'),
		chapter: '06 · 用处',
		status: 'RECALL REF1 · 2024.12',
		grat: 'full',
		cam: (T) => ({s: mix(0.6, 1, pr(T, S('r10'), 0.47, ez.io)), x: 300, y: 700}),
		draw: (T, sc) => {
			const curl = pr(T, sc.b - 0.4, 0.4, ez.io);
			return (
				<g opacity={1 - curl}>
					<Tx x={150} y={330} size={110} halo>
						10²⁵ 年
					</Tx>
					<Tx x={700} y={330} size={56} o={0.6}>
						vs
					</Tx>
					<Tx x={900} y={330} size={110} fill={C.red} font={`${MONO}, ${SANS}`} halo>
						{'< 5 分钟'}
					</Tx>
					<Tr d={path((x) => 430 + 18 * sin(x * 0.03 - T * 5), 150, 1800, 4)} w={2} />
					<Tr d={path((x) => 520 + 60 * gauss(x - 1200, 60) * sin(x * 0.09), 150, 1800, 3)} color={C.red} w={2.4} />
					<Stamp x={960} y={650} T={T} at={sc.a + 1.2} text="测速题 · 暂无实际用途（Google）" size={60} />
				</g>
			);
		},
	});

	// 22 Molecules · r11
	const MOL: [number, number][] = (() => {
		const pts: [number, number][] = [];
		for (let k = 0; k <= 6; k++) pts.push([560 + 170 * cos((k / 6) * TAU - Math.PI / 2), 440 + 170 * sin((k / 6) * TAU - Math.PI / 2)]);
		return pts;
	})();
	L.push({
		name: 'molecule',
		a: S('r11'),
		b: S('r12'),
		chapter: '06 · 用处',
		status: 'MODE XY · TRACE LOOP 1.2 s',
		grat: 'xy',
		draw: (T, sc) => {
			const loop = ((T - sc.a) / 1.2) % 1;
			const drawn = Math.min(1, (T - sc.a) / 1.2);
			const hex = xyPath(MOL);
			const bonds = `M${MOL[0][0]},${MOL[0][1]} L${MOL[0][0]},${MOL[0][1] - 120} M${MOL[3][0]},${MOL[3][1]} L${MOL[3][0]},${MOL[3][1] + 120} M${MOL[1][0]},${MOL[1][1]} L${MOL[1][0] + 110},${MOL[1][1] - 60}`;
			const per = 6 * 170;
			const k = Math.floor(loop * 6);
			const fr = loop * 6 - k;
			const hx = mix(MOL[k][0], MOL[k + 1][0], fr);
			const hy = mix(MOL[k][1], MOL[k + 1][1], fr);
			const collapse = pr(T, sc.b - 0.33, 0.33, ez.in);
			return (
				<g>
					<g transform={`translate(560,440) scale(${1 - collapse}) translate(-560,-440)`}>
						<g>
							<path d={hex} fill="none" stroke={C.trace} strokeWidth={14} opacity={0.22} filter="url(#phos)" />
							<path d={hex} fill="none" stroke={C.trace} strokeWidth={3.5} strokeDasharray={per} strokeDashoffset={per * (1 - drawn)} />
							<path d={bonds} fill="none" stroke={C.trace} strokeWidth={3.5} opacity={pr(T, sc.a + 0.9, 0.3)} />
							{[MOL[0], MOL[2], MOL[4]].map(([x, y], i) => (
								<circle key={i} cx={x} cy={y} r={14} fill={C.trace} opacity={pr(T, sc.a + 1 + i * 0.1, 0.2)} />
							))}
							<Beam x={hx} y={hy} />
						</g>
					</g>
					<Tx x={1050} y={300} size={64} font={`${MONO}, ${SANS}`} o={lock(T, sc.a + 0.5)}>
						分子模拟 → 新药 · 电池
					</Tx>
					<g opacity={lock(T, sc.a + 1.0)}>
						<rect x={1050} y={340} width={290} height={64} rx={6} fill="none" stroke={C.ro} strokeWidth={3} />
						<Tx x={1195} y={388} size={44} font={SANS} anchor="middle">
							将来 · 可能
						</Tx>
					</g>
				</g>
			);
		},
	});

	// 23 Factoring · r12, r13
	L.push({
		name: 'factor',
		a: S('r12'),
		b: S('r14'),
		chapter: '07 · 加密',
		status: 'CH1 ▸ N · DECODE',
		grat: 'full',
		gratO: 0.5,
		draw: (T, sc) => {
			const N = 'N = 999,985,999,949';
			const typed = Math.min(N.length, Math.floor((T - sc.a) * 15));
			const split = pr(T, sc.a + 1.2, 0.4, ez.io);
			const r13 = S('r13');
			const lockDraw = pr(T, r13, 0.6, ez.io);
			const factorsO = split * (1 - pr(T, r13, 0.3));
			const lp = lockPath(380, 290, 1540, 430);
			const save = pr(T, sc.b - 0.47, 0.47, ez.io);
			return (
				<g transform={`translate(${mix(0, 370 - 960 * 0.3, save)},${mix(0, 650 - 360 * 0.3, save)}) scale(${mix(1, 0.3, save)})`} opacity={mix(1, 0.6, save)}>
					<Tx x={960} y={390} size={100} anchor="middle" halo>
						{N.slice(0, typed)}
					</Tx>
					{split > 0 && split < 1 ? <VCursor x={1080} y0={280} y1={420} solid /> : null}
					<g opacity={factorsO} transform={`translate(0,${30 * (1 - split)})`}>
						<Tx x={960} y={510} size={72} anchor="middle" fill={C.trace}>
							= 1,000,003 × 999,983
						</Tx>
					</g>
					{lockDraw > 0 ? (
						<g>
							<path d={lp} fill="none" stroke={C.trace} strokeWidth={14} opacity={0.22 * lockDraw} filter="url(#phos)" />
							<path d={lp} fill="none" stroke={C.trace} strokeWidth={3.5} strokeDasharray={4000} strokeDashoffset={4000 * (1 - lockDraw)} />
						</g>
					) : null}
					<Tx x={960} y={560} size={56} font={SANS} anchor="middle" o={lock(T, r13 + 0.4) * (1 - save)}>
						RSA · 靠「大数难分解」
					</Tx>
					{T > r13 + 1.0 ? (
						<g transform={`translate(1640,360) scale(${stampK(T, r13 + 1.0)})`} opacity={1 - save}>
							<circle r={52} fill={C.plate} stroke={C.ro} strokeWidth={3} />
							<Tx x={0} y={24} size={64} font={SANS} weight={900} anchor="middle">
								你
							</Tx>
						</g>
					) : null}
					<g opacity={1 - save}>
						<Tx x={150} y={770} size={44} fill={C.dim}>
							Shor · 1994
						</Tx>
						<rect x={1560} y={720} width={110} height={60} rx={6} fill="none" stroke={C.ro} strokeWidth={3} />
						<Tx x={1615} y={765} size={44} font={SANS} anchor="middle">
							示意
						</Tx>
					</g>
				</g>
			);
		},
	});

	// 24 Harvest now · r14
	L.push({
		name: 'harvest',
		a: S('r14'),
		b: S('r15'),
		chapter: '07 · 加密',
		status: 'REF1 SAVED · TIME/DIV ▸▸',
		grat: 'full',
		gratO: 0.6,
		draw: (T, sc) => {
			const ramp = pr(T, sc.a, E('r14') - sc.a, ez.in);
			const fr = 3 + 15 * ramp;
			const roll = ['1 天', '1 月', '1 年', '10 年'][Math.min(3, Math.floor((T - sc.a) / 0.8))];
			const out = pr(T, sc.b - 0.4, 0.4);
			return (
				<g>
					<rect x={120} y={520} width={500} height={260} fill="none" stroke={C.frame} strokeWidth={3} />
					<Tx x={120} y={500} size={44} fill={C.trace} font={`${MONO}, ${SANS}`}>
						REF1 · 已存储 · 今天
					</Tx>
					<g transform="translate(370,650) scale(0.3) translate(-960,-360)" opacity={0.45}>
						<path d={lockPath(380, 290, 1540, 430)} fill="none" stroke={C.trace} strokeWidth={10} />
						<Tx x={960} y={390} size={100} anchor="middle">
							N = 999,985,999,949
						</Tx>
					</g>
					<Tr d={path((x) => 470 + 40 * sin(((x - 700) / 1124) * TAU * fr - T * 10 * (1 + ramp * 4)), 700, 1824, 2)} o={1 - out} />
					<Tx x={760} y={300} size={120} font={SANS} weight={900} o={lock(T, sc.a + 0.8)} halo>
						先存后解
					</Tx>
					<Tx x={760} y={380} size={36} fill={C.dim} o={lock(T, sc.a + 1.0)}>
						HARVEST NOW, DECRYPT LATER · NIST
					</Tx>
					<Tx x={760} y={640} size={44} font={`${MONO}, ${SANS}`}>
						{`TIME/DIV ▸▸ ${roll}`}
					</Tx>
				</g>
			);
		},
	});

	// 25 How many qubits · r15, r16
	const QY = (n: number) => 780 - (Math.log10(n) - 1) * (640 / 7);
	L.push({
		name: 'howmany',
		a: S('r15'),
		b: S('r17'),
		chapter: '07 · 加密',
		status: 'CURSORS ΔY · LOG qubits',
		grat: 'logy',
		draw: (T, sc) => {
			const drop = pr(T, sc.a, 0.4, ez.arrive);
			const r16 = S('r16');
			const ghost = pr(T, r16 + 0.1, 0.25);
			const slide = pr(T, r16 + 1.2, 0.67, ez.io);
			const topY = QY(1e6) + 40 * slide;
			const stampAt = S('r16b', 0.1);
			const out = pr(T, sc.b - 0.45, 0.4, ez.io);
			return (
				<g opacity={1 - out}>
					<line x1={260} y1={140} x2={260} y2={780} stroke={C.grat} strokeWidth={2} />
					{[1, 2, 3, 4, 5, 6, 7, 8].map((k) => (
						<g key={k}>
							<line x1={250} y1={QY(Math.pow(10, k))} x2={270} y2={QY(Math.pow(10, k))} stroke={C.dim} strokeWidth={2} />
							<Tx x={240} y={QY(Math.pow(10, k)) + 12} size={30} fill={C.tex} anchor="end" o={0.6}>
								{`10${['¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸'][k - 1]}`}
							</Tx>
						</g>
					))}
					<rect x={300} y={topY} width={1000} height={QY(105) - topY} fill={C.trace} opacity={0.06 * drop} />
					<g transform={`translate(0,${-200 * (1 - drop)})`} opacity={drop}>
						<HCursor y={topY} x0={300} x1={1300} />
						<Tx x={340} y={topY - 18} size={44} font={`${MONO}, ${SANS}`}>
							{'破解 RSA-2048 需要 < 1,000,000（估计 · 2025）'}
						</Tx>
						<HCursor y={QY(105)} x0={300} x1={1300} />
						<Tx x={340} y={QY(105) - 18} size={56} fill={C.red} halo>
							Willow 105
						</Tx>
					</g>
					<Tx x={700} y={(topY + QY(105)) / 2 + 20} size={56} fill={C.ro} o={lock(T, sc.a + 1.2)}>
						≈ 1 万倍
					</Tx>
					{ghost > 0 ? (
						<g opacity={ghost}>
							<line x1={300} y1={QY(2e7)} x2={1300} y2={QY(2e7)} stroke={C.dim} strokeWidth={2} strokeDasharray="10 8" />
							<Tx x={340} y={QY(2e7) - 16} size={44} fill={C.dim}>
								2019 · 20,000,000
							</Tx>
							<path d={`M1250,${QY(2e7)} L1250,${topY}`} stroke={C.dim} strokeWidth={2} strokeDasharray="6 6" />
						</g>
					) : null}
					{slide > 0 ? (
						<Tx x={340} y={topY + 52} size={44} font={`${MONO}, ${SANS}`} fill={C.trace} o={lock(T, r16 + 1.9)}>
							2026 ↓ 新论文更少
						</Tx>
					) : null}
					<g>
						{stampK(T, stampAt) > 0 ? (
							<g transform={`translate(1480,700) rotate(-3) scale(${stampK(T, stampAt)})`}>
								<rect x={-330} y={-80} width={660} height={150} rx={6} fill={C.plate} fillOpacity={0.9} stroke={C.trace} strokeWidth={3} />
								<Tx x={0} y={-12} size={48} font={SANS} weight={900} anchor="middle" fill={C.trace}>
									好在：抗量子加密标准已发布
								</Tx>
								<Tx x={0} y={46} size={44} anchor="middle" fill={C.trace}>
									NIST · 2024.08
								</Tx>
							</g>
						) : null}
					</g>
				</g>
			);
		},
	});

	// 26 Payoff · r17, r18
	L.push({
		name: 'payoff',
		a: S('r17'),
		b: S('e1'),
		chapter: '08 · 结论',
		status: '8 CH · MATH Σ · RESULT',
		grat: 'rows',
		draw: (T, sc) => {
			const r18 = S('r18');
			const strike = pr(T, sc.a + 0.8, 0.3);
			const flat = pr(T, r18 + 0.15, 0.25, ez.in);
			const grow = pr(T, r18 + 0.15, 0.6);
			const fan = pr(T, sc.b - 0.47, 0.47, ez.io);
			return (
				<g opacity={1 - fan}>
					<g opacity={T >= r18 ? 0.4 : 1}>
						<Tx x={300} y={210} size={96} fill={C.red}>
							✗
						</Tx>
						<Tx x={400} y={210} size={96} font={SANS} weight={900}>
							算得多
						</Tx>
						<line x1={400} y1={178} x2={400 + 290 * strike} y2={178} stroke={C.red} strokeWidth={6} />
					</g>
					{T >= r18 ? (
						<g opacity={lock(T, r18 + 0.15)}>
							<Tx x={1000} y={210} size={96} fill={C.red}>
								✓
							</Tx>
							<Tx x={1100} y={210} size={96} font={SANS} weight={900} halo>
								错的抵消
							</Tx>
						</g>
					) : null}
					<Rows
						T={T}
						n={8}
						y0={300}
						dy={66}
						x0={300}
						x1={1820}
						amp={(i) => pr(T, sc.a + 0.05 * i, 0.35) * (i === RIGHT ? 1 + 1.2 * grow : 1 - flat)}
						red={T >= r18 ? RIGHT : -1}
						ghost={(i) => (i === RIGHT ? 0 : flat > 0 && flat < 1 ? 1 : 0)}
						ketSize={44}
						A={26}
					/>
				</g>
			);
		},
	});

	// 27 Send it · e1, e2 (back to the opening fan, collapsing into one red beam)
	L.push({
		name: 'send',
		a: S('e1'),
		b: TLX.endCard,
		chapter: '00 · 传说',
		status: 'CH1 200 mV/div · TIME 1 ms/div · TRIG ▲ AUTO',
		grat: 'full',
		draw: (T, sc) => {
			const e2 = S('e2');
			const open = pr(T, sc.a, 0.47, ez.io);
			const coll = pr(T, e2, 14 / FPS, ez.io);
			const toDot = pr(T, E('e2'), sc.b - E('e2'), ez.io);
			const bx = mix(1824, 960, toDot);
			return (
				<g>
					<Fan t={T} burst={open * (1 - coll)} red={coll} o={1 - toDot} />
					<Question T={T} at={sc.a} strike={pr(T, sc.a + 1.2, 0.2)} o={1 - coll} />
					{stampK(T, sc.a + 1.2) > 0 ? (
						<g transform={`translate(960,240) scale(${stampK(T, sc.a + 1.2)})`} opacity={1 - coll}>
							<Tx x={0} y={80} size={240} fill={C.red} anchor="middle" halo>
								✗
							</Tx>
						</g>
					) : null}
					{coll > 0 ? <Tr d={path((x) => mix(460, 250, toDot), 96, bx, 4)} color={C.red} w={3} hot o={coll} /> : null}
					{coll > 0 ? <Beam x={bx} y={mix(460, 250, toDot)} red o={coll} /> : null}
				</g>
			);
		},
	});
	return L;
};

export const SCENES = sceneList();
