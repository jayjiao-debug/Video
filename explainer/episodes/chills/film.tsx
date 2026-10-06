import React from 'react';
import {AbsoluteFill, staticFile, useCurrentFrame} from 'remotion';
import {Monogram} from '../../src/brand/Brand';
import {
	A0,
	A1,
	C,
	CLIPS,
	COLS,
	FPS,
	FRAMES,
	GROUND,
	H,
	LENGTH,
	LINES,
	MONO,
	ORIGINALS,
	PX,
	SANS,
	SERIF,
	SPLICES,
	T_BREATH,
	T_CARD,
	T_CLIFF,
	T_DRAIN,
	T_DROP2,
	T_FINAL,
	T_LATE,
	T_MDROP,
	T_PATCH,
	T_PRED,
	T_SNIP1,
	T_SNIP2,
	T_SNIP3,
	T_SWEEP,
	T_TITLE,
	W,
	camera,
	cartT,
	clamp,
	colorMix,
	drain,
	ez,
	fmtTime,
	knobHz,
	meter,
	mix,
	pr,
	shake,
	songTime,
	stampK,
	tension,
} from './world';

/**
 * 《鸡皮疙瘩在等什么》 (ep13) · Look C "Riso Coaster". The song's tension is a roller coaster printed in three riso
 * inks; the real soundtrack runs as a strip under the ground with the playhead = the cart; every audio edit is a
 * scissors cut / stamp / knob on the strip and the track on the frame the sound changes (storyboard.md).
 */

export const CHILLS_FRAMES = FRAMES;

type Cam = {pan: number; z: number};
const X = (t: number, cam: Cam) => PX * t * cam.z; // world-layer x (inside the translated group)
const Y = (Tn: number, cam: Cam) => GROUND - 430 * Tn * cam.z;
const SX = (t: number, cam: Cam) => (PX * t - cam.pan) * cam.z; // screen x

const MULT: React.CSSProperties = {mixBlendMode: 'multiply'};

// ---------------------------------------------------------------- small drawn things

const Scissors: React.FC<{x: number; y: number; s?: number; open?: number; rot?: number}> = ({x, y, s = 1, open = 1, rot = 0}) => {
	const a = 14 * open;
	const one = (dx: number, dy: number, col: string) => (
		<g transform={`translate(${x + dx},${y + dy}) rotate(${rot}) scale(${s})`}>
			<g transform={`rotate(${-a})`}>
				<path d="M0,0 L-6,-70 L6,-70 Z" fill={col} />
				<circle cx={-10} cy={22} r={14} fill={C.paper} stroke={col} strokeWidth={8} />
			</g>
			<g transform={`rotate(${a})`}>
				<path d="M0,0 L-6,-70 L6,-70 Z" fill={col} />
				<circle cx={10} cy={22} r={14} fill={C.paper} stroke={col} strokeWidth={8} />
			</g>
			<circle r={4} fill={C.paper} />
		</g>
	);
	return (
		<g>
			<g style={MULT}>{one(3, -2, C.pink)}</g>
			<g style={MULT}>{one(0, 0, C.blue)}</g>
		</g>
	);
};

/** a stamped riso label: one ink misregistered under the other */
const Stamp: React.FC<{x: number; y: number; size: number; text: string; color: string; under?: string; T: number; at: number; anchor?: 'start' | 'middle' | 'end'; o?: number; font?: string; weight?: number; halo?: boolean}> = ({
	x,
	y,
	size,
	text,
	color,
	under,
	T,
	at,
	anchor = 'start',
	o = 1,
		font = SANS,
	weight = 900,
	halo = false,
}) => {
	const k = stampK(T, at);
	if (k <= 0 || o <= 0) return null;
	return (
		<g transform={`translate(${x},${y}) scale(${k}) translate(${-x},${-y})`} opacity={o}>
						{halo ? (
				<text x={x} y={y} textAnchor={anchor} style={{fontFamily: font, fontWeight: weight, fontSize: size}} fill={C.paper} stroke={C.paper} strokeWidth={14} strokeLinejoin="round" opacity={0.92}>
					{text}
				</text>
			) : null}
			{under ? (
				<text x={x + 3} y={y + 2} textAnchor={anchor} style={{fontFamily: font, fontWeight: weight, fontSize: size, ...MULT}} fill={under} opacity={0.55}>
					{text}
				</text>
			) : null}
			<text x={x} y={y} textAnchor={anchor} style={{fontFamily: font, fontWeight: weight, fontSize: size, ...MULT}} fill={color}>
				{text}
			</text>
		</g>
	);
};

const Head: React.FC<{x: number; y: number; r?: number; pink?: boolean}> = ({x, y, r = 20, pink}) => <circle cx={x} cy={y} r={r} fill={pink ? C.pink : C.blue} style={MULT} />;

const Bowl: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<path d="M-60,0 A60,46 0 0 0 60,0 Z" fill={C.pink} style={MULT} />
		<line x1={-70} y1={0} x2={70} y2={0} stroke={C.blue} strokeWidth={6} style={MULT} />
		{[-25, 0, 25].map((d) => (
			<path key={d} d={`M${d},-14 q-10,-14 0,-28 q10,-14 0,-28`} fill="none" stroke={C.blue} strokeWidth={4} style={MULT} />
		))}
	</g>
);

const Coin: React.FC<{x: number; y: number}> = ({x, y}) => (
	<g>
		<circle cx={x} cy={y} r={52} fill={C.yellow} style={MULT} />
		<circle cx={x} cy={y} r={52} fill="none" stroke={C.blue} strokeWidth={6} style={MULT} />
		<text x={x} y={y + 22} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 900, fontSize: 62, ...MULT}} fill={C.blue}>
			¥
		</text>
	</g>
);

/** a print sheet in the sky: arrives from the top, leaves upward (print-pull) */
const Sheet: React.FC<{T: number; a: number; b: number; x: number; y: number; w: number; h: number; children: React.ReactNode; frame?: boolean}> = ({T, a, b, x, y, w, h, children, frame = true}) => {
	if (T < a - 0.05 || T > b + 0.45) return null;
	const inn = pr(T, a, 14 / FPS, ez.out);
	const out = pr(T, b, 12 / FPS, ez.in);
	const dy = -(1 - inn) * (y + h + 40) - out * (y + h + 40);
	return (
		<g transform={`translate(0,${dy})`}>
			{frame ? (
				<>
					<rect x={x} y={y + h} width={w} height={10} fill={C.paperShade} opacity={out > 0 || inn < 1 ? 1 : 0} />
					<rect x={x} y={y} width={w} height={h} rx={8} fill={C.paper} stroke={C.blue} strokeWidth={3} />
				</>
			) : null}
			{children}
		</g>
	);
};

const Caption: React.FC<{x: number; y: number; text: string; anchor?: 'start' | 'middle' | 'end'}> = ({x, y, text, anchor = 'start'}) => (
	<text x={x} y={y} textAnchor={anchor} style={{fontFamily: `${SANS}`, fontWeight: 500, fontSize: 36, ...MULT}} fill={C.blue} opacity={0.75}>
		{text}
	</text>
);

/** a little coaster profile for diagrams: list of [u 0..1, tension] */
const Mini: React.FC<{x: number; y: number; w: number; h: number; pts: [number, number][]; color?: string; dash?: string; width?: number; plain?: boolean}> = ({x, y, w, h, pts, color = C.pink, dash, width = 8, plain}) => {
	const d = pts.map(([u, t], i) => `${i ? 'L' : 'M'}${(x + u * w).toFixed(1)},${(y + h - t * h).toFixed(1)}`).join('');
	return <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={dash} style={plain ? undefined : MULT} />;
};
const MINI_COASTER: [number, number][] = Array.from({length: 61}, (_, i) => {
	const u = i / 60;
	const t = u < 0.55 ? 0.1 + 0.84 * Math.pow(u / 0.55, 1.3) : u < 0.72 ? 0.94 : u < 0.8 ? 0.94 - 0.9 * ((1 - Math.cos((Math.PI * (u - 0.72)) / 0.08)) / 2) : 0.04 + 0.3 * Math.sin((Math.PI * (u - 0.8)) / 0.2);
	return [u, t];
});
/** the EDM pattern as a schematic: low groove, the build (铺垫), a held crest (拖延), the drop (兑现), the groove after */
const PATTERN: [number, number][] = Array.from({length: 241}, (_, i) => {
	const u = i / 240;
	let t: number;
	if (u < 0.14) t = 0.16 + 0.04 * Math.sin(u * 90);
	else if (u < 0.52) t = 0.16 + 0.78 * Math.pow((u - 0.14) / 0.38, 1.3);
	else if (u < 0.7) t = 0.94 + 0.012 * Math.sin((u - 0.52) * 70);
	else if (u < 0.74) t = 0.94 - 0.9 * ((1 - Math.cos((Math.PI * (u - 0.7)) / 0.04)) / 2);
	else t = 0.04 + 0.32 * Math.sin((Math.PI * (u - 0.74)) / 0.12) ** 2 * (u < 0.86 ? 1 : 0.5);
	return [u, Math.max(0.02, t)];
});

const Knob: React.FC<{x: number; y: number; hz: number}> = ({x, y, hz}) => {
	const a = -135 + 270 * clamp((Math.log(hz) - Math.log(400)) / (Math.log(12000) - Math.log(400)));
	const full = hz > 11000;
	return (
		<g>
			<circle cx={x} cy={y} r={64} fill={C.yellow} opacity={0.6} style={MULT} />
			<circle cx={x} cy={y} r={64} fill="none" stroke={C.blue} strokeWidth={6} style={MULT} />
			<line x1={x} y1={y} x2={x + 52 * Math.sin((a * Math.PI) / 180)} y2={y - 52 * Math.cos((a * Math.PI) / 180)} stroke={C.pink} strokeWidth={10} strokeLinecap="round" style={MULT} />
			<text x={x} y={y - 92} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 900, fontSize: 56, ...MULT}} fill={C.blue}>
				高音
			</text>
			<text x={x} y={y + 132} textAnchor="middle" style={{fontFamily: `${MONO}, ${SANS}`, fontWeight: 700, fontSize: 52, ...MULT}} fill={C.blue}>
				{full ? '全开' : `${Math.round(hz)} Hz`}
			</text>
		</g>
	);
};

// ---------------------------------------------------------------- the world (track, posts, cart, suns)

type Pt = {t: number; v: number; orig: boolean};
const railRuns = (T: number, cam: Cam) => {
	const t0 = cam.pan / PX - 1.2;
	const t1 = (cam.pan + W / cam.z) / PX + 1.2;
	const dt = 4 / PX;
	const runs: Pt[][] = [];
	let cur: Pt[] = [];
	for (let t = Math.floor(t0 / dt) * dt; t <= t1; t += dt) {
		const o = ORIGINALS.find((r) => T < r.cut && t >= r.from && t < r.to);
		const v = o ? o.fn(t) : tension(t, T);
		if (v === null) {
			if (cur.length) runs.push(cur);
			cur = [];
			continue;
		}
		cur.push({t, v, orig: !!o});
	}
	if (cur.length) runs.push(cur);
	return runs;
};

const World: React.FC<{T: number; cam: Cam}> = ({T, cam}) => {
	const runs = railRuns(T, cam);
	const sh = shake(T);
	const ct = cartT(T);
	// the rail in colour runs (pink → drained)
	const railPaths: {d: string; col: string}[] = [];
	for (const run of runs) {
		let d = '';
		let col = '';
		for (const p of run) {
			const k = drain(p.t, T);
			const c = k <= 0.02 ? C.pink : k >= 0.98 ? C.drained : colorMix(C.pink, C.drained, Math.round(k * 10) / 10);
			const xy = `${X(p.t, cam).toFixed(1)},${Y(p.v, cam).toFixed(1)}`;
			if (c !== col && d) {
				railPaths.push({d: d + `L${xy}`, col});
				d = `M${xy}`;
			} else d += `${d ? 'L' : 'M'}${xy}`;
			col = c;
		}
		if (d) railPaths.push({d, col});
	}
	const fills = runs.map((run) => {
		const top = run.map((p) => `${X(p.t, cam).toFixed(1)},${Y(p.v, cam).toFixed(1)}`).join(' L');
		return `M${X(run[0].t, cam).toFixed(1)},${GROUND} L${top} L${X(run[run.length - 1].t, cam).toFixed(1)},${GROUND} Z`;
	});
	// posts every beat (≈ 68 world px)
	const posts: React.ReactNode[] = [];
	for (const run of runs) {
		const a = run[0].t;
		const b = run[run.length - 1].t;
		const step = 68 / PX;
		let prev: {x: number; y: number} | null = null;
		let n = 0;
		for (let t = Math.ceil(a / step) * step; t <= b; t += step) {
			const p = run[Math.min(run.length - 1, Math.round((t - a) / (4 / PX)))];
			const x = X(t, cam);
			const y = Y(p.v, cam) + 9 * cam.z;
			posts.push(<line key={`p${t.toFixed(3)}`} x1={x} y1={y} x2={x} y2={GROUND} stroke={C.blue} strokeWidth={Math.max(3, 4.5 * cam.z)} />);
			if (prev && n % 2 === 0 && GROUND - y > 70 && GROUND - prev.y > 70) {
				posts.push(<line key={`b${t.toFixed(3)}`} x1={prev.x} y1={prev.y + 10} x2={x} y2={GROUND - 4} stroke={C.blue} strokeWidth={2} opacity={0.45} />);
			}
			prev = {x, y};
			n++;
		}
	}
	// ghosts of the cut originals
	const ghosts = ORIGINALS.filter((o) => T >= o.cut).map((o, i) => {
		const k = pr(T, o.cut + 0.1, 0.4);
		const fade = i === 1 ? 1 - pr(T, 53.4, 0.6) : 1;
		if (fade <= 0) return null;
		let d = '';
		for (let t = o.from; t < o.to; t += 4 / PX) d += `${d ? 'L' : 'M'}${X(t, cam).toFixed(1)},${(Y(o.fn(t), cam) - o.lift * k * cam.z).toFixed(1)}`;
		return <path key={i} d={d} fill="none" stroke={C.pink} strokeWidth={Math.max(4, 7 * cam.z)} strokeDasharray="16 13" opacity={0.7 * fade} />;
	});
	// suns over the crests
	const suns: [number, boolean][] = [
		[7.09, false],
		[31.39, false],
		[71.86, false],
		[92.1, true],
		[110.33, false],
	];
	const burst = (at: number) => (T >= at && T < at + 1 ? Math.exp(-(T - at) * 3) : 0);
	// the cart
	const cv = (() => {
		if (T >= T_CLIFF && T < T_PATCH) return tension(T_CLIFF - 0.01, T) ?? 0.94;
		return tension(ct, T) ?? 0.94;
	})();
	const slope = (() => {
		const a = tension(ct - 0.045, T) ?? cv;
		const b = tension(ct + 0.045, T) ?? cv;
		return (Math.atan2(-(b - a) * 430 * cam.z, 0.09 * PX * cam.z) * 180) / Math.PI;
	})();
	const lurch = T >= T_CLIFF && T < T_CLIFF + 0.4 ? 12 * Math.sin(((T - T_CLIFF) / 0.33) * Math.PI) * Math.exp(-(T - T_CLIFF) * 4) : 0;
	const hit = T >= 1.022 && T < 1.272 ? (T - 1.022) / 0.25 : -1; // the strongest early hit: the cart kicks up and lands
	const jolt = hit >= 0 ? -14 * Math.sin(hit * Math.PI) : 0;
	const bump = hit >= 0 ? 34 * Math.sin(hit * Math.PI) * (1 - 0.3 * hit) : 0;
	const cs = Math.max(0.6, cam.z);
	const cx = X(ct, cam) + jolt;
	const cy = Y(cv, cam) - 7 * cs - bump;
	const breathing = CLIPS.some((c) => c.kind === 'breath' && T >= c.from && T < c.to);
	const tremble = breathing ? 2 + Math.floor(clamp((T - (CLIPS.find((c) => c.kind === 'breath' && T >= c.from && T < c.to)?.from ?? T)) / 1.8) * 4) : 0;
	const squash = breathing ? 0.94 : hit >= 0 ? (hit < 0.5 ? 1.1 : hit > 0.85 ? 0.88 : 1) : 1;
	const cartPink = drain(ct, T) > 0.5 ? C.drained : C.pink;
	return (
		<g transform={`translate(${-cam.pan * cam.z + sh.x},${sh.y})`}>
			{/* yellow ink: halftone under the rail */}
			<g style={MULT} transform="translate(-2,2)">
				{fills.map((d, i) => (
					<path key={i} d={d} fill="url(#htY)" />
				))}
			</g>
			{/* pink ink */}
			<g style={MULT} transform="translate(3,-2)" filter="url(#rough)">
				{suns.map(([t, grey], i) => {
					const x = X(t, cam);
					if (x < cam.pan * cam.z - 400 || x > cam.pan * cam.z + W + 400) return null;
					const at = [T_TITLE, T_CLIFF, T_LATE, T_MDROP, T_FINAL][i];
					const r = (200 + 80 * burst(at)) * cam.z;
					return <circle key={i} cx={x} cy={GROUND - (GROUND - 170) * cam.z} r={r} fill={grey || (i === 3 && drain(t, T) > 0.5) ? 'url(#htD)' : 'url(#htP)'} opacity={0.55} />;
				})}
				{ghosts}
				{railPaths.map((p, i) => (
					<path key={i} d={p.d} fill="none" stroke={p.col} strokeWidth={Math.max(10, 17 * cam.z)} strokeLinejoin="round" strokeLinecap="round" />
				))}
				{/* the cart body */}
				<g transform={`translate(${cx},${cy}) rotate(${-slope + lurch}) scale(${cs},${cs * squash})`}>
					<rect x={-70} y={-48} width={140} height={48} rx={17} fill={cartPink} />
				</g>
			</g>
			{/* blue ink */}
			<g style={MULT} filter="url(#rough)">
				<line x1={cam.pan * cam.z - 200} y1={GROUND} x2={cam.pan * cam.z + W + 200} y2={GROUND} stroke={C.blue} strokeWidth={5} />
				{posts}
				{railPaths.map((p, i) => (
					<path key={i} d={p.d} fill="none" stroke={C.paper} strokeWidth={3} strokeDasharray="2 14" opacity={0.9} />
				))}
				<g transform={`translate(${cx},${cy}) rotate(${-slope + lurch}) scale(${cs},${cs * squash})`}>
					<rect x={-70} y={-48} width={140} height={48} rx={17} fill="url(#htB)" opacity={0.5} />
					<circle cx={-40} cy={2} r={12} fill={C.blue} />
					<circle cx={40} cy={2} r={12} fill={C.blue} />
					{[-40, 0, 40].map((hx, i) => (
						<circle key={i} cx={hx} cy={-62 + (breathing ? 6 : 0)} r={18} fill={C.blue} />
					))}
					{Array.from({length: tremble}, (_, i) => (
						<line key={i} x1={-50 + i * 20} y1={-100 - (i % 2) * 8} x2={-50 + i * 20} y2={-120 - (i % 2) * 8} stroke={C.blue} strokeWidth={9} strokeLinecap="round" transform={`translate(${Math.sin(T * 60 + i) * 2},0)`} />
					))}
				</g>
			</g>
		</g>
	);
};

// ---------------------------------------------------------------- the strip (the real soundtrack)

const Strip: React.FC<{T: number; cam: Cam}> = ({T, cam}) => {
	const vis = (a: number, b: number) => SX(b, cam) > 330 && SX(a, cam) < W + 20;
		const clips = CLIPS.filter((c) => vis(c.from, c.to));
		// demo 2: before the cut the strip shows the ORIGINAL order (铺垫 · 吸气 · 高潮 from 48.58); after it, the
	// slid-in drop. Whatever lies past that stays dim until the drop plays (no preview of the next build).
	const pre2 = T >= 42.0 && T < T_SNIP2;
	const dim = (t: number) => (pre2 && t >= T_DROP2 ? 0 : T >= 42.0 && T < T_DROP2 && t >= A1('drop2') ? 0.22 : 1);
	const PRE2: [number, number, string, string][] = [
		[T_DROP2, T_DROP2 + 6.084, '铺垫', 'build'],
		[T_DROP2 + 6.084, T_DROP2 + 8.098, '吸气', 'breath'],
		[T_DROP2 + 8.098, T_DROP2 + 12.156, '高潮', 'drop'],
	];
	const title = CLIPS.find((c) => c.from === T_TITLE)!;
	return (
		<g>
			<defs>
				<clipPath id="stripClip">
					<rect x={336} y={662} width={W - 336} height={146} />
				</clipPath>
			</defs>
			<g clipPath="url(#stripClip)">
				{clips.map((c, i) => {
					const x0 = SX(c.from, cam) + 3;
					const x1 = SX(c.to, cam) - 3;
					const preview = c.kind === 'deleted' && T < T_SNIP1;
					const kind = preview ? 'drop' : c.kind;
					const muffledNow = c.muffled && T >= T_DRAIN;
					const fill = kind === 'build' ? C.blue : kind === 'drop' ? (muffledNow ? C.drained : C.pink) : kind === 'bed' ? C.yellow : C.paper;
					const fo = kind === 'build' ? 0.18 : kind === 'drop' ? 0.22 : kind === 'bed' ? 0.35 : 1;
					const name = preview ? '高潮' : c.name;
											return (
							<g key={i} opacity={dim(c.from)}>
								<rect x={x0} y={664} width={Math.max(1, x1 - x0)} height={140} rx={10} fill={fill} fillOpacity={fo} style={MULT} />
							{kind === 'deleted' ? (
								<rect x={x0} y={664} width={Math.max(1, x1 - x0)} height={140} rx={10} fill="url(#hatch)" style={MULT} />
							) : null}
							<rect x={x0} y={664} width={Math.max(1, x1 - x0)} height={140} rx={10} fill="none" stroke={C.blue} strokeOpacity={0.8} strokeWidth={3} strokeDasharray={kind === 'breath' || kind === 'deleted' ? '8 6' : undefined} style={MULT} />
							<text x={x0 + 12} y={698} style={{fontFamily: SANS, fontWeight: 700, fontSize: 34, ...MULT}} fill={kind === 'drop' || kind === 'deleted' ? (muffledNow ? C.drainedType : C.pink) : C.blue}>
								{name}
							</text>
							{preview
								? COLS.filter((col) => col[0] >= title.from && col[0] < title.from + (c.to - c.from)).map((col, j) => {
										const t = c.from + (col[0] - title.from);
										const x = SX(t, cam);
										const w = Math.max(4, col[1] * PX * cam.z - 6);
										return <rect key={j} x={x} y={800 - col[2]} width={w} height={col[2]} fill={C.blue} opacity={0.5} style={MULT} />;
									})
								: null}
						</g>
					);
				})}
				{/* columns from the real master */}
				{COLS.filter((col) => vis(col[0], col[0] + col[1]) && col[2] > 0).map((col, i) => {
					const x = SX(col[0], cam);
					const w = Math.max(4, col[1] * PX * cam.z - 6);
					const dk = drain(col[0], T);
					const capCol = colorMix(C.pink, C.drained, dk);
					return (
													<g key={i} style={MULT} opacity={dim(col[0])}>
								<rect x={x} y={800 - col[2]} width={w} height={col[2]} fill={C.blue} />
							{col[3] > 1 ? <rect x={x} y={800 - col[2]} width={w} height={Math.min(col[2], col[3])} fill={capCol} /> : null}
							{col[4] > 1 && T >= T_DRAIN ? <rect x={x} y={800 - col[2] - col[4]} width={w} height={col[4]} fill="none" stroke={C.drained} strokeWidth={2} strokeDasharray="4 3" /> : null}
						</g>
					);
				})}
								{pre2
					? PRE2.filter(([a, b]) => vis(a, b)).map(([a, b, name, kind], i) => {
							const x0 = SX(a, cam) + 3;
							const x1 = SX(b, cam) - 3;
							const fill = kind === 'build' ? C.blue : kind === 'drop' ? C.pink : C.paper;
							const fo = kind === 'build' ? 0.18 : kind === 'drop' ? 0.22 : 1;
							return (
								<g key={`pre${i}`}>
									<rect x={x0} y={664} width={Math.max(1, x1 - x0)} height={140} rx={10} fill={fill} fillOpacity={fo} style={MULT} />
									<rect x={x0} y={664} width={Math.max(1, x1 - x0)} height={140} rx={10} fill="none" stroke={C.blue} strokeOpacity={0.8} strokeWidth={3} strokeDasharray={kind === 'breath' ? '8 6' : undefined} style={MULT} />
									<text x={x0 + 12} y={698} style={{fontFamily: SANS, fontWeight: 700, fontSize: 34, ...MULT}} fill={kind === 'drop' ? C.pink : C.blue}>
										{name}
									</text>
									{COLS.filter((col) => col[0] >= a - T_DROP2 && col[0] < b - T_DROP2 && col[2] > 0).map((col, j) => {
										const x = SX(col[0] + T_DROP2, cam);
										const w = Math.max(4, col[1] * PX * cam.z - 6);
										return (
											<g key={j} style={MULT}>
												<rect x={x} y={800 - col[2]} width={w} height={col[2]} fill={C.blue} />
												{col[3] > 1 ? <rect x={x} y={800 - col[2]} width={w} height={Math.min(col[2], col[3])} fill={C.pink} /> : null}
											</g>
										);
									})}
								</g>
							);
						})
					: null}
				{SPLICES.filter((s) => vis(s - 0.3, s + 0.3)).map((s) => (
					<text key={s} x={SX(s, cam)} y={668 + 22} textAnchor="middle" style={{fontFamily: '"DejaVu Sans"', fontSize: 28, ...MULT}} fill={C.blue}>
						✂
					</text>
				))}
			</g>
		</g>
	);
};

const StripHeader: React.FC<{T: number}> = ({T}) => {
	const st = songTime(T);
	const deleted = T >= T_CLIFF && T < T_PATCH;
	const jump = SPLICES.some((s) => T >= s && T < s + 0.2);
	return (
		<g>
			<rect x={40} y={662} width={290} height={144} rx={10} fill={C.paper} stroke={C.blue} strokeWidth={3} />
			<text x={62} y={702} style={{fontFamily: SANS, fontWeight: 700, fontSize: 30}} fill={C.blue}>
				原曲{deleted ? ' · 静音' : ''}
			</text>
			<text x={58} y={776} style={{fontFamily: MONO, fontWeight: 700, fontSize: 56}} fill={deleted || jump ? C.pink : C.blue}>
				{deleted ? '--:--.-' : fmtTime(st)}
			</text>
		</g>
	);
};

const Playhead: React.FC<{T: number; cam: Cam}> = ({T, cam}) => {
	const x = Math.max(420, SX(T, cam));
	const cx = SX(cartT(T), cam);
	const cv = T >= T_CLIFF && T < T_PATCH ? tension(T_CLIFF - 0.01, T) ?? 0.94 : tension(cartT(T), T) ?? 0.94;
	const cy = GROUND - 430 * cv * cam.z;
	return (
		<g style={MULT}>
			<line x1={cx} y1={cy + 10} x2={x} y2={GROUND} stroke={C.blue} strokeWidth={3} strokeDasharray="8 8" opacity={0.8} />
			<line x1={x} y1={662} x2={x} y2={806} stroke={C.blue} strokeWidth={4} />
			<path d={`M${x - 11},656 L${x + 11},656 L${x},676 Z`} fill={C.blue} />
		</g>
	);
};

// ---------------------------------------------------------------- the frame (meter, chapter, counter, corner)

const CHAPTERS: [number, string][] = [
	[0, '00 · 1分21秒'],
	[12.156, '01 · 不是人人都会'],
	[26.331, '02 · 第一刀 删掉高潮'],
	[42.504, '03 · 第二刀 删掉铺垫'],
	[64.789, '04 · 第三刀 晚到4秒'],
	[89.06, '05 · 第四刀 闷住高音'],
	[105.268, '06 · 还给你'],
];
const Frame: React.FC<{T: number}> = ({T}) => {
	const titleOn = T >= T_TITLE && T < 12.156;
	const ch = [...CHAPTERS].reverse().find(([t]) => T >= t)!;
	const chK = stampK(T, ch[0] + 0.01);
	const m = meter(T);
	const cuts = T < T_SNIP1 ? 0 : T < T_SNIP2 ? 1 : T < T_SNIP3 ? 2 : T < T_DRAIN ? 3 : 4;
	const counterOn = T >= 26.331 && T < 103.96 + 0.8;
	const peel = pr(T, 103.96, 0.7);
		const shakeM = T > 68.84 && T < 74.88 ? 2 * Math.sin(T * 90) : 0;
	// the open questions: the meter does not answer them
	const ask = (T >= 48.6 && T < 53.58) || (T >= 68.84 && T < 79.88) || (T >= 33.15 && T < 34.9);
	const pill = 'rgba(242,236,223,0.94)';
	return (
		<g>
			{!titleOn ? <rect x={36} y={38} width={520} height={56} rx={28} fill={pill} /> : null}
			<rect x={598} y={34} width={790} height={70} rx={35} fill={pill} />
			{!titleOn ? <rect x={W - 360} y={30} width={330} height={44} rx={22} fill={pill} /> : null}
			{counterOn && cuts > 0 && peel < 0.05 ? <rect x={1396} y={40} width={150} height={60} rx={30} fill={pill} /> : null}
			{!titleOn ? (
				<g transform={`translate(64,78) scale(${chK || 1}) translate(-64,-78)`}>
					<text x={64} y={78} style={{fontFamily: `${MONO}, ${SANS}`, fontWeight: 700, fontSize: 34, letterSpacing: 2}} fill={C.blue} opacity={0.9}>
						{ch[1]}
					</text>
				</g>
			) : null}
			<g transform={`translate(${shakeM},0)`}>
				<text x={790} y={88} textAnchor="end" style={{fontFamily: SANS, fontWeight: 900, fontSize: 36}} fill={C.pink}>
					鸡皮疙瘩
				</text>
				<rect x={806} y={56} width={420} height={30} rx={15} fill={C.paper} stroke={C.blue} strokeWidth={3} />
				<rect x={808} y={58} width={(416 * m) / 100} height={26} rx={13} fill={C.pink} style={MULT} />
				{T >= 111.45 && T < 117 ? <rect x={811} y={55} width={(416 * m) / 100} height={26} rx={13} fill={C.pink} opacity={0.5} style={MULT} /> : null}
									{ask ? <rect x={808} y={58} width={(416 * m) / 100} height={26} rx={13} fill="url(#hatch)" /> : null}
					<text x={1240} y={86} style={{fontFamily: SANS, fontWeight: 700, fontSize: 40}} fill={C.blue}>
						示意
					</text>
					{ask ? (
						<text x={1334} y={92} style={{fontFamily: SANS, fontWeight: 900, fontSize: 56}} fill={C.pink}>
							?
						</text>
					) : null}
			</g>
			{!titleOn ? (
				<text x={W - 56} y={62} textAnchor="end" style={{fontFamily: SANS, fontWeight: 500, fontSize: 24, letterSpacing: 2}} fill={C.ink} opacity={0.6}>
					◆ Juno · VIBE知识大赏
				</text>
			) : null}
			{counterOn && cuts > 0 ? (
				<g opacity={1 - peel} transform={`translate(${30 * peel},${-20 * peel}) rotate(${-8 * peel},1470,70)`}>
						<text x={1534} y={86} textAnchor="end" style={{fontFamily: `"DejaVu Sans", ${MONO}`, fontWeight: 700, fontSize: 44}} fill={C.blue}>
						✂ {cuts}/4
					</text>
				</g>
			) : null}
		</g>
	);
};

// ---------------------------------------------------------------- the sky: labels and info sheets

const Sky: React.FC<{T: number; cam: Cam}> = ({T, cam}) => {
	const items: React.ReactNode[] = [];
	// hook
	if (T < T_TITLE + 0.2) {
		const o = 1 - pr(T, T_TITLE, 0.15);
		items.push(
			<g key="hook" opacity={o}>
				<Stamp x={820} y={226} size={96} text="屏住" color={C.blue} T={T} at={-1} />
				<Stamp x={1012} y={226} size={96} text="呼吸" color={C.pink} T={T} at={-1} />
				<Stamp x={200} y={430} size={56} text="蓄力 ↗" color={C.blue} T={T} at={-1} />
				<Stamp x={1560} y={340} size={72} text="01:21" color={C.blue} T={T} at={3.042} font={MONO} weight={700} />
				<Stamp x={1580} y={420} size={64} text="↓ 冲！" color={C.pink} T={T} at={3.042} />
			</g>,
		);
		if (T >= 4.557 && T < 6.2) {
			const y = mix(-120, 200, pr(T, 4.557, 0.3)) - 400 * pr(T, 5.5, 0.6, ez.in);
			const open = T > 5.062 && T < 5.2 ? 0.1 : 1;
			items.push(<Scissors key="sc0" x={1523} y={y} s={0.8} open={open} />);
		}
	}
	// the title stamp on the hardest drop
	if (T >= T_TITLE && T < 12.6) {
		const out = pr(T, 12.156, 12 / FPS, ez.in);
		items.push(
			<g key="title" transform={`translate(0,${-560 * out})`}>
				<Stamp x={160} y={300} size={128} text="鸡皮疙瘩" color={C.blue} under={C.pink} T={T} at={T_TITLE} />
				<Stamp x={160} y={436} size={128} text="在等什么" color={C.pink} under={C.blue} T={T} at={T_TITLE} />
			</g>,
		);
	}
	// 1 · 38 heads
	items.push(
		<Sheet key="s38" T={T} a={14.81} b={18.16} x={380} y={150} w={1440} h={290}>
			{Array.from({length: 38}, (_, i) => {
				const r = Math.floor(i / 19);
				const c = i % 19;
				const pinkIdx = [2, 6, 11, 15, 22, 29, 34];
				const k = pinkIdx.indexOf(i);
				const on = k >= 0 && T >= 15.3 + k * 0.1;
				return <Head key={i} x={440 + c * 56} y={230 + r * 80} pink={on} />;
			})}
			<text x={1560} y={260} style={{fontFamily: MONO, fontWeight: 700, fontSize: 72, ...MULT}} fill={C.pink} opacity={pr(T, 15.9, 0.2)}>
				7/38
			</text>
			<Caption x={440} y={410} text="莫扎特《安魂曲》选段 · Grewe 2007" />
		</Sheet>,
	);
	// 2 · reward lamp, food, money, ?
	items.push(
		<Sheet key="lamp" T={T} a={18.16} b={26.331} x={380} y={130} w={1440} h={310}>
			<g>
				{Array.from({length: 8}, (_, i) => {
					const a = (i / 8) * Math.PI * 2;
					return <line key={i} x1={960 + 104 * Math.cos(a)} y1={250 + 104 * Math.sin(a)} x2={960 + 130 * Math.cos(a)} y2={250 + 130 * Math.sin(a)} stroke={C.blue} strokeWidth={5} style={MULT} />;
				})}
				<circle cx={960} cy={250} r={90} fill={T >= 18.222 ? 'url(#htP)' : C.paper} stroke={C.blue} strokeWidth={4} style={MULT} />
				<text x={960} y={428} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 900, fontSize: 64, ...MULT}} fill={C.pink}>
					奖赏区
				</text>
			</g>
			{T >= 20.91 ? (
				<g opacity={pr(T, 20.91, 0.3)}>
					<g transform={`translate(0,${T >= 23.66 ? 900 * pr(T, 23.66, 0.6, ez.in) : 0})`} opacity={1 - pr(T, 23.86, 0.3)}>
						<Bowl x={560} y={270} />
						<text x={560} y={380} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 700, fontSize: 48, ...MULT}} fill={C.blue}>
							美食
						</text>
					</g>
					<Coin x={1360} y={250} />
					<text x={1360} y={380} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 700, fontSize: 48, ...MULT}} fill={C.blue}>
						金钱
					</text>
					<line x1={650} y1={250} x2={850} y2={250} stroke={C.blue} strokeWidth={4} strokeDasharray="10 8" style={MULT} opacity={1 - pr(T, 23.66, 0.3)} />
					<line x1={1290} y1={250} x2={1070} y2={250} stroke={C.blue} strokeWidth={4} strokeDasharray="10 8" style={MULT} />
				</g>
			) : null}
			{T >= 24.305 ? <Stamp x={1110} y={230} size={140} text="?" color={C.pink} T={T} at={24.305} /> : null}
		</Sheet>,
	);
	// demo 1 labels
	if (T >= 26.331 && T < 29.4) {
		items.push(
			<g key="higher" opacity={pr(T, 26.4, 0.3) * (1 - pr(T, 29.0, 0.3))}>
				<line x1={440} y1={600} x2={440} y2={186} stroke={C.blue} strokeWidth={5} style={MULT} />
					<path d="M426,202 L440,172 L454,202 Z" fill={C.blue} style={MULT} />
					<text x={470} y={204} style={{fontFamily: SANS, fontWeight: 700, fontSize: 48, ...MULT}} fill={C.blue}>
					越高 = 越紧张（示意）
				</text>
			</g>,
		);
	}
	const xc = SX(T_CLIFF, cam);
	if (T >= T_SNIP1 - 0.25 && T < T_SNIP1 + 0.6) {
		const p = pr(T, T_SNIP1 - 0.25, 0.25, ez.in);
		const lineLen = pr(T, T_SNIP1 - 0.25, 0.2);
		items.push(
			<g key="snip1">
				<line x1={xc} y1={200} x2={xc} y2={200 + 606 * lineLen} stroke={C.blue} strokeWidth={3} strokeDasharray="10 8" style={MULT} />
				<Scissors x={xc} y={mix(150, 560, p)} s={0.9} open={T > T_SNIP1 && T < T_SNIP1 + 0.12 ? 0.1 : 1} />
			</g>,
		);
	}
	if (T >= T_SNIP1 && T < 34.9) {
		items.push(<Stamp key="deleted" x={xc + 60} y={330} size={72} text="已删除" color={C.pink} T={T} at={T_SNIP1 + 0.2} o={1 - pr(T, 34.5, 0.3)} />);
	}
	// 3 · 24 people → bars
	items.push(
		<Sheet key="s24" T={T} a={35.56} b={41.56} x={380} y={140} w={1440} h={300}>
			{T < 38.36 + 0.4
				? Array.from({length: 24}, (_, i) => <Head key={i} x={480 + (i % 12) * 84} y={220 + Math.floor(i / 12) * 84} r={22} />).map((h, i) => (
						<g key={i} opacity={1 - pr(T, 38.36, 0.4)}>
							{h}
						</g>
					))
				: null}
			{T >= 38.36 ? (
				<g opacity={pr(T, 38.36, 0.3)}>
					<text x={460} y={230} style={{fontFamily: SANS, fontWeight: 700, fontSize: 40, ...MULT}} fill={C.pink}>
						原版
					</text>
					<rect x={560} y={192} width={600 * pr(T, 38.4, 0.66)} height={60} fill="url(#htP)" style={MULT} />
					<rect x={560} y={192} width={600 * pr(T, 38.4, 0.66)} height={60} fill="none" stroke={C.pink} strokeWidth={3} style={MULT} />
					<text x={1180} y={240} style={{fontFamily: MONO, fontWeight: 700, fontSize: 60, ...MULT}} fill={C.pink}>
							30
							<tspan style={{fontFamily: SANS, fontWeight: 700, fontSize: 40}}> 次</tspan>
						</text>
					<text x={420} y={330} style={{fontFamily: SANS, fontWeight: 700, fontSize: 40, ...MULT}} fill={C.blue}>
						删掉后
					</text>
					<rect x={560} y={292} width={420 * pr(T, 38.4, 0.66)} height={60} fill={C.blue} opacity={0.6} style={MULT} />
					<rect x={980} y={292} width={180} height={60} fill="none" stroke={C.blue} strokeWidth={3} strokeDasharray="8 6" opacity={pr(T, 39.0, 0.3)} style={MULT} />
					<text x={1180} y={340} style={{fontFamily: MONO, fontWeight: 700, fontSize: 60, ...MULT}} fill={C.blue}>
							21
							<tspan style={{fontFamily: SANS, fontWeight: 700, fontSize: 40}}> 次</tspan>
						</text>
					<g opacity={pr(T, 39.3, 0.3)}>
						<path d="M985,380 L985,396 L1155,396 L1155,380" fill="none" stroke={C.pink} strokeWidth={4} style={MULT} />
						<text x={1350} y={300} style={{fontFamily: SANS, fontWeight: 900, fontSize: 56, ...MULT}} fill={C.pink}>
								少了约三成
						</text>
					</g>
				</g>
			) : null}
			<Caption x={460} y={428} text="Bannister & Eerola 2018 · 24人 · 起疙瘩次数" />
		</Sheet>,
	);
	// 4 · the mini-map
	items.push(
		<Sheet key="mini" T={T} a={41.56} b={42.504} x={500} y={130} w={1060} h={320}>
			<rect x={560 + 0} y={150} width={940 * 0.72} height={260} fill="url(#htP)" opacity={pr(T, 41.9, 0.3) * 0.5} style={MULT} />
			<Mini x={560} y={160} w={940} h={250} pts={MINI_COASTER} />
			<text x={600} y={200} style={{fontFamily: SANS, fontWeight: 700, fontSize: 48, ...MULT}} fill={C.blue} opacity={pr(T, 41.9, 0.3)}>
				铺垫 + 吸气
			</text>
		</Sheet>,
	);
	// demo 2 snips
	const xd = SX(T_DROP2, cam);
	if (T >= T_SNIP2 - 0.25 && T < T_SNIP2 + 0.6) {
		const p = pr(T, T_SNIP2 - 0.25, 0.25, ez.in);
		items.push(
			<g key="snip2">
				<line x1={xd} y1={200} x2={xd} y2={806} stroke={C.blue} strokeWidth={3} strokeDasharray="10 8" style={MULT} />
				<Scissors x={xd} y={mix(150, 560, p)} s={0.9} open={T > T_SNIP2 && T < T_SNIP2 + 0.12 ? 0.1 : 1} />
			</g>,
		);
	}
	if (T >= T_SNIP2 && T < T_DROP2 + 4) {
		items.push(
			<g key="d2labels">
				<Stamp x={xd + 300} y={280} size={64} text="铺垫" color={C.blue} T={T} at={T_SNIP2 + 0.15} o={0.6 * (1 - pr(T, T_SNIP2 + 1.6, 0.6))} />
				<Stamp x={xd + 20} y={470} size={56} text="高潮 ↓" color={C.pink} T={T} at={T_SNIP2 + 0.5} o={1 - pr(T, T_DROP2 + 3.5, 0.4)} />
			</g>,
		);
	}
	// 5 · waiting and payoff lamps
	items.push(
		<Sheet key="lamps" T={T} a={53.59} b={60.79} x={420} y={120} w={1400} h={320}>
			<Mini x={500} y={170} w={1100} h={230} pts={MINI_COASTER} />
			{[
				[0.3, '等待', '尾状核', C.blue, 53.59],
				[0.82, '兑现', '伏隔核 · 多巴胺', C.pink, 57.34],
			].map(([u, a, b, col, at], i) => {
				const on = T >= (at as number);
				const x = 500 + (u as number) * 1100;
				return (
					<g key={i} opacity={on ? 1 : 0.25}>
						<circle cx={x} cy={180} r={44} fill={on ? (i ? 'url(#htP)' : 'url(#htB)') : C.paper} stroke={col as string} strokeWidth={4} style={MULT} />
						<text x={x + 64} y={180} style={{fontFamily: SANS, fontWeight: 900, fontSize: 56, ...MULT}} fill={col as string}>
							{a as string}
						</text>
						<text x={x + 64} y={232} style={{fontFamily: SANS, fontWeight: 700, fontSize: 40, ...MULT}} fill={col as string}>
							{b as string}
						</text>
					</g>
				);
			})}
			<Caption x={460} y={428} text="Salimpoor 2011" />
		</Sheet>,
	);
	// 6 · beat ticks and the prediction marker (world-anchored)
	if (T >= 60.79 && T < 80.5) {
		const xm = SX(T_PRED, cam);
		const on = pr(T, 60.9, 0.4);
		const flash = T >= T_PRED && T < T_PRED + 0.14;
		items.push(
			<g key="pred" opacity={on * (1 - pr(T, 79.5, 0.3))}>
				<line x1={xm} y1={GROUND} x2={xm} y2={GROUND - (GROUND - 176) * on} stroke={flash ? C.pink : C.blue} strokeWidth={4} strokeDasharray="12 10" style={MULT} />
					<path d={`M${xm},176 L${xm - 34},189 L${xm},202 Z`} fill={flash ? C.pink : C.blue} style={MULT} />
					<text x={xm - 44} y={208} textAnchor="end" style={{fontFamily: SANS, fontWeight: 900, fontSize: 56}} fill={C.paper} stroke={C.paper} strokeWidth={14} strokeLinejoin="round" opacity={0.92}>
						预判
					</text>
					<text x={xm - 44} y={208} textAnchor="end" style={{fontFamily: SANS, fontWeight: 900, fontSize: 56, ...MULT}} fill={flash ? C.pink : C.blue}>
						预判
					</text>
			</g>,
		);
		if (T < 64.9) {
			const ticks: React.ReactNode[] = [];
			for (let t = 60.79; t < 72; t += 0.505) {
				const x = SX(t, cam);
				if (x < 330 || x > W) continue;
				ticks.push(<rect key={t} x={x - 2} y={654} width={4} height={14} fill={t <= T ? C.pink : C.blue} opacity={t <= T ? 1 : 0.45} style={MULT} />);
			}
			items.push(<g key="ticks">{ticks}</g>);
			items.push(
				<text key="beat" x={SX(cartT(T), cam) + 80} y={470} style={{fontFamily: SANS, fontWeight: 700, fontSize: 44, ...MULT}} fill={C.blue} opacity={pr(T, 61.2, 0.3) * (1 - pr(T, 64.6, 0.3))}>
					每拍约0.5秒
				</text>,
			);
		}
	}
	// demo 3: the stretch
	if (T >= T_SNIP3 - 0.25 && T < T_SNIP3 + 0.6) {
		const xs = SX(T_PRED, cam);
		const p = pr(T, T_SNIP3 - 0.25, 0.25, ez.in);
		items.push(
			<g key="snip3">
				<Scissors x={xs} y={mix(150, 560, p)} s={0.9} open={T > T_SNIP3 && T < T_SNIP3 + 0.12 ? 0.1 : 1} />
			</g>,
		);
	}
	if (T >= T_SNIP3 + 0.2 && T < 79.94) {
		const bar = (A1('wait3') - A0('wait3')) / 3;
		[2, 3].forEach((n, i) => {
			const t = A0('wait3') + (n - 0.5) * bar;
			items.push(<Stamp key={`x${n}`} x={SX(t, cam)} y={GROUND - 430 * 0.96 * cam.z - 112} size={56} text={`×${n}`} color={C.blue} T={T} at={T_SNIP3 + 0.2 + i * 0.2} anchor="middle" font={MONO} weight={700} halo />);
		});
	}
	if (T >= T_LATE && T < 79.94) {
		const a = SX(T_PRED, cam);
		const b = SX(T_LATE, cam);
		items.push(
			<g key="plus4" opacity={pr(T, T_LATE + 0.4, 0.3)}>
				<line x1={a + 6} y1={470} x2={b - 6} y2={470} stroke={C.pink} strokeWidth={5} style={MULT} />
				<path d={`M${a + 6},470 l18,-12 l0,24 Z M${b - 6},470 l-18,-12 l0,24 Z`} fill={C.pink} style={MULT} />
				<text x={(a + b) / 2} y={450} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 900, fontSize: 72}} fill={C.paper} stroke={C.paper} strokeWidth={16} strokeLinejoin="round" opacity={0.94}>
						+4秒
					</text>
					<text x={(a + b) / 2} y={450} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 900, fontSize: 72, ...MULT}} fill={C.pink}>
						+4秒
					</text>
			</g>,
		);
	}
	// 7 · 紧张 over the stretched crest
	if (T >= 79.94 && T < 83.6) {
		const a = SX(A0('wait3'), cam);
		const b = SX(A1('wait3'), cam);
		const g = pr(T, 79.94, 0.66);
		const bb = mix(a + (b - a) / 3, b, g);
		const yb = GROUND - 430 * 0.98 * cam.z - 30;
		items.push(
			<g key="tense" opacity={1 - pr(T, 83.34, 0.25)}>
				<path d={`M${a},${yb + 16} L${a},${yb} L${bb},${yb} L${bb},${yb + 16}`} fill="none" stroke={C.pink} strokeWidth={5} style={MULT} />
				<text x={(a + bb) / 2} y={yb - 24} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 900, fontSize: 72, ...MULT}} fill={C.pink}>
					紧张
				</text>
				<g opacity={pr(T, 80.8, 0.3)}>
						<Caption x={(a + bb) / 2} y={yb - 110} text="预期理论 · Huron 2020" anchor="middle" />
					</g>
			</g>,
		);
	}
	// 8 · the whole song as a coaster
	items.push(
		<Sheet key="song" T={T} a={83.34} b={86.94} x={120} y={110} w={1680} h={390}>
			<Mini x={160} y={200} w={1600} h={230} pts={PATTERN} width={8} />
				{/* the held crest, bracketed */}
				<path d={`M${160 + 0.52 * 1600},214 L${160 + 0.52 * 1600},196 L${160 + 0.7 * 1600},196 L${160 + 0.7 * 1600},214`} fill="none" stroke={C.blue} strokeWidth={4} opacity={stampK(T, 83.85) > 0 ? 1 : 0} style={MULT} />
				<Stamp x={160 + 0.27 * 1600} y={300} size={56} text="铺垫 ↗" color={C.blue} T={T} at={83.6} anchor="middle" />
				<Stamp x={160 + 0.61 * 1600} y={182} size={56} text="拖延" color={C.blue} T={T} at={83.85} anchor="middle" />
				<Stamp x={160 + 0.745 * 1600} y={330} size={56} text="↙ 兑现" color={C.pink} T={T} at={84.1} anchor="start" />
			<Caption x={160} y={485} text="电子舞曲的套路（示意） · Solberg & Dibben 2019" />
		</Sheet>,
	);
	// 9 · the knob
	if ((T >= 86.94 && T < 97.9) || (T >= 103.96 && T < 111.6)) {
		const o = T < 97.9 ? pr(T, 86.94, 0.3) * (1 - pr(T, 97.66, 0.25)) : pr(T, 103.96, 0.3) * (1 - pr(T, 111.3, 0.3));
		items.push(
			<g key="knob" opacity={o}>
				<Knob x={T < 100 ? 1560 : 330} y={T < 100 ? 330 : 360} hz={T < T_DRAIN - 0.1 ? 12000 : knobHz(T)} />
			</g>,
		);
	}
	if (T >= 95.31 && T < 97.6) {
		items.push(<Stamp key="men" x={1250} y={330} size={110} text="闷" color={C.drainedType} T={T} at={95.31} o={1 - pr(T, 97.3, 0.25)} />);
	}
	// 10 · frequency strip
	const fx = (hz: number) => 300 + ((Math.log10(hz) - Math.log10(50)) / (Math.log10(16000) - Math.log10(50))) * 1340;
	items.push(
		<Sheet key="freq" T={T} a={97.66} b={101.01} x={260} y={112} w={1420} h={346}>
				<g transform="translate(0,-20)">
			<line x1={300} y1={420} x2={1640} y2={420} stroke={C.blue} strokeWidth={4} style={MULT} />
			{[100, 1000, 10000].map((hz) => (
				<g key={hz}>
					<line x1={fx(hz)} y1={410} x2={fx(hz)} y2={432} stroke={C.blue} strokeWidth={3} style={MULT} />
					<text x={fx(hz)} y={470} textAnchor="middle" style={{fontFamily: MONO, fontWeight: 700, fontSize: 36, ...MULT}} fill={C.blue}>
						{hz >= 1000 ? `${hz / 1000}k` : String(hz)}
					</text>
				</g>
			))}
			<rect x={fx(800)} y={170} width={1640 - fx(800)} height={240} fill="url(#hatchD)" style={MULT} />
			<text x={1640} y={178} textAnchor="end" style={{fontFamily: SANS, fontWeight: 700, fontSize: 40, ...MULT}} fill={C.drainedType}>
				闷掉的部分
			</text>
			<rect x={fx(920)} y={232} width={fx(4400) - fx(920)} height={178} fill="url(#htP)" stroke={C.pink} strokeWidth={4} style={MULT} />
				<path d={`M300,232 L${fx(800)},232 Q${fx(1400)},232 ${fx(3000)},410`} fill="none" stroke={C.blue} strokeWidth={6} style={MULT} />
				<g>
					<rect x={fx(920) - 6} y={170} width={fx(4400) - fx(920) + 12} height={56} fill={C.paper} />
					<text x={fx(920)} y={216} style={{fontFamily: SANS, fontWeight: 900, fontSize: 50}} fill={C.blue}>
						中高音
					</text>
					<rect x={fx(920) + 8} y={368} width={196} height={36} rx={6} fill={C.paper} />
					<text x={fx(920) + 18} y={396} style={{fontFamily: MONO, fontWeight: 700, fontSize: 28}} fill={C.blue}>
						920–4400 Hz
					</text>
				</g>
							<Caption x={300} y={176} text="Nagel 2008" />
				</g>
			</Sheet>,
	);
	// 11 · layer stack
	items.push(
		<Sheet key="layers" T={T} a={101.01} b={103.96} x={300} y={130} w={1320} h={300}>
			{['低音', '鼓', '高音'].map((s, i) => {
				const y = 190 + i * 80;
				const back = T >= 102.226;
				return (
					<g key={s}>
						<text x={340} y={y + 16} style={{fontFamily: SANS, fontWeight: 700, fontSize: 48, ...MULT}} fill={i === 2 ? C.pink : C.blue}>
							{s}
						</text>
						{i < 2 ? <line x1={480} y1={y} x2={980} y2={y} stroke={C.blue} strokeWidth={10} strokeDasharray={i === 1 ? '16 10' : undefined} style={MULT} /> : null}
						{back ? <line x1={1000} y1={y} x2={1560} y2={y} stroke={i === 2 ? C.pink : C.blue} strokeWidth={10} style={MULT} opacity={pr(T, 102.226, 4 / FPS)} /> : null}
					</g>
				);
			})}
			<line x1={990} y1={150} x2={990} y2={410} stroke={C.pink} strokeWidth={3} strokeDasharray="10 8" style={MULT} />
			<text x={1000} y={420} style={{fontFamily: SANS, fontWeight: 700, fontSize: 36, ...MULT}} fill={C.pink}>
				高潮
			</text>
		</Sheet>,
	);
	// payoff: three lamps on the static frame (climb · crest · plunge); 兑现 bursts on the beat of "那一拍"
		// positions are given in the static payoff frame (pan = 103 s, z .72) and stay pinned to the world when the camera rides on
	const pin = (x: number, y: number) => ({x: SX(103 + x / (PX * 0.72), cam), y: GROUND - ((GROUND - y) * cam.z) / 0.72});
	if (T >= 112.356) {
		const BURST = 116.907;
		const lamps: [number, number, string, string, number, number][] = [
			// screen x, baseline y, word, ink, stamp time, lamp-on time
			[250, 330, '预测', C.blue, 112.356, 112.356],
			[640, 262, '等待', C.blue, 112.861, 112.861],
			[930, 450, '兑现', C.pink, 113.371, BURST],
		];
				lamps.forEach(([x0, y0, word, col, at, on], i) => {
			if (T < at) return;
			const {x, y} = pin(x0, y0);
			const lit = T >= on;
			const k = stampK(T, at);
			const halo = i < 2 && T >= 113.73 ? pr(T, 113.73, 0.3) : 0;
			const burst = i === 2 && lit ? clamp((T - BURST) / 0.5) : 0;
			const pop = i === 2 && lit ? stampK(T, BURST) : 1;
			const cy = y - 22;
			items.push(
				<g key={`lamp${i}`} transform={`translate(${x},${cy}) scale(${k * pop}) translate(${-x},${-cy})`}>
					{halo > 0 ? <circle cx={x} cy={cy} r={44} fill="url(#htB)" opacity={0.6 * halo} style={MULT} /> : null}
					{burst > 0 && burst < 1
						? [0, 1, 2].map((j) => <circle key={j} cx={x} cy={cy} r={26 + (40 + 30 * j) * burst} fill="none" stroke={C.pink} strokeWidth={5} opacity={1 - burst} style={MULT} />)
						: null}
					{i === 2 && lit ? <circle cx={x} cy={cy} r={46} fill="url(#htP)" opacity={0.8} style={MULT} /> : null}
					<circle cx={x} cy={cy} r={22} fill={lit ? (i === 2 ? C.pink : C.blue) : C.paper} stroke={col} strokeWidth={5} />
				</g>,
			);
			items.push(<Stamp key={`w${i}`} x={x + 40} y={y} size={64} text={word} color={col} T={T} at={at} halo />);
		});
	}
	if (T >= 113.73) {
		const bob = T >= 116.907 && T < 117.4 ? -18 * Math.sin(((T - 116.907) / 0.49) * Math.PI) : 0;
		items.push(
			<g key="bowl2" opacity={pr(T, 113.73, 0.3)} transform={`translate(0,${bob})`}>
								<Bowl x={pin(1480, 330).x} y={pin(1480, 330).y} />
			</g>,
		);
	}
	return <g>{items}</g>;
};

// ---------------------------------------------------------------- end card

/** where the cart is on screen (the end-card ink grows from it) */
const cartScreen = (cam: Cam, T: number) => {
	const ct = cartT(T);
	const v = tension(ct, T) ?? 0.2;
	return {x: SX(ct, cam), y: GROUND - 430 * v * cam.z - 30 * cam.z};
};

/** the track's real name (owner to confirm); empty = no BGM line */
const BGM = '';

const EndCard: React.FC<{T: number; from: {x: number; y: number}}> = ({T, from}) => {
	const a = T_CARD;
	const flood = pr(T, a, 0.65, ez.io);
	const reach = Math.max(...[[0, 0], [W, 0], [0, H], [W, H]].map(([x, y]) => Math.hypot(x - from.x, y - from.y))) + 20;
	const title = '《鸡皮疙瘩在等什么》';
	const size = 92;
	const width = [...title].length * size;
	return (
		<g>
			<circle cx={from.x} cy={from.y} r={reach * flood} fill={C.ink} />
			{/* the card's content only shows once the ink has covered it */}
			<g opacity={clamp((flood - 0.6) / 0.3)}>
			<g transform="translate(960,250)">
				<Monogram draw={0.4 + 0.6 * pr(T, a, 0.6, ez.io)} size={1} wordmark="Juno" />
			</g>
			<defs>
				<linearGradient id="c-gold" x1="0" y1={470 - size * 0.8} x2="0" y2={470 + size * 0.2} gradientUnits="userSpaceOnUse">
					<stop offset="0" stopColor="#FFF3CF" />
					<stop offset="0.45" stopColor="#F3CD7A" />
					<stop offset="0.7" stopColor="#C99140" />
					<stop offset="1" stopColor="#8A5A22" />
				</linearGradient>
			</defs>
			<text y={470} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: size}}>
				{[...title].map((ch, i) => (
					<tspan key={i} x={960 - width / 2 + (i + 0.5) * size} fill="url(#c-gold)" opacity={0.2 + 0.8 * pr(T, a + 0.15 + i * 0.05, 0.3)}>
						{ch}
					</tspan>
				))}
			</text>
			<g opacity={pr(T, a + 0.45, 0.4)}>
					<Mini x={780} y={520} w={360} h={70} pts={MINI_COASTER} color={C.gold} width={6} plain />
			</g>
			<text x={960} y={690} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 700, fontSize: 52, letterSpacing: 3}} fill={C.card} opacity={pr(T, a + 0.5, 0.4)}>
				你会发给哪个听歌起疙瘩的朋友？
			</text>
			<g opacity={pr(T, a + 0.9, 0.4)}>
				<rect x={480} y={730} width={960} height={72} rx={36} fill="none" stroke={C.gold} strokeOpacity={0.75} strokeWidth={2} />
				<text x={960} y={779} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 500, fontSize: 40, letterSpacing: 6}} fill={C.gold}>
					关注 Juno · 每期一个反直觉的知识
				</text>
			</g>
							{BGM ? (
					<text x={960} y={950} textAnchor="middle" style={{fontFamily: SANS, fontSize: 26}} fill={C.card} opacity={0.6 * pr(T, a + 1.1, 0.5)}>
						{`BGM：${BGM}`}
					</text>
				) : null}
				<text x={960} y={1004} textAnchor="middle" style={{fontFamily: SANS, fontSize: 22}} fill={C.card} opacity={0.45 * pr(T, a + 1.2, 0.5)}>
					《鸡皮疙瘩在等什么》 · VIBE知识大赏　|　Blood & Zatorre 2001 · Salimpoor et al. 2011 · Grewe et al. 2007 · Jain et al. 2023
				</text>
				<text x={960} y={1036} textAnchor="middle" style={{fontFamily: SANS, fontSize: 22}} fill={C.card} opacity={0.45 * pr(T, a + 1.2, 0.5)}>
					Bannister & Eerola 2018 · Huron 2020 · Solberg & Dibben 2019 · Nagel et al. 2008
				</text>
			<rect width={W} height={H} fill="#000" opacity={pr(T, LENGTH - 0.6, 0.6, ez.in)} />
			</g>
		</g>
	);
};

// ---------------------------------------------------------------- subtitles (HTML)

const Subtitle: React.FC<{T: number}> = ({T}) => {
	const i = LINES.findIndex(([a, b], k) => {
		const next = LINES[k + 1];
		const end = next && next[0] - b < 0.4 ? next[0] : b;
		return T >= (k === 0 ? 0 : a) && T < end;
	});
	if (i < 0) return null;
	const [a, , text] = LINES[i];
	if (a >= T_CARD - 0.1) return null;
	const o = i === 0 ? 1 : clamp((T - a) * 15);
	const parts = text.split(/(\[[^\]]+\])/).filter(Boolean);
	return (
		<div style={{position: 'absolute', left: 0, top: 820, width: W, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: o}}>
			<div style={{position: 'relative', padding: '18px 56px', borderRadius: 22, background: 'rgba(22,30,64,.88)', fontFamily: SERIF, fontWeight: 700, fontSize: 46, letterSpacing: 2, color: '#FFFFFF', whiteSpace: 'nowrap', boxShadow: '0 0 18px rgba(22,30,64,.35)'}}>
				{parts.map((p, j) =>
					p.startsWith('[') ? (
						<span key={j} style={{color: C.pinkSub}}>
							{p.slice(1, -1)}
						</span>
					) : (
						<React.Fragment key={j}>{p}</React.Fragment>
					),
				)}
			</div>
		</div>
	);
};

// ---------------------------------------------------------------- the film

export const ChillsFilm: React.FC = () => {
	const f = useCurrentFrame();
	const T = f / FPS;
	const cam = camera(T);
	const card = T >= T_CARD;
	return (
		<AbsoluteFill style={{background: C.paper}}>
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
				<defs>
					<pattern id="htY" width={14} height={14} patternUnits="userSpaceOnUse" patternTransform="rotate(20)">
						<circle cx={7} cy={7} r={4.6} fill={C.yellow} />
					</pattern>
					<pattern id="htP" width={14} height={14} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
						<circle cx={7} cy={7} r={4} fill={C.pink} />
					</pattern>
					<pattern id="htB" width={12} height={12} patternUnits="userSpaceOnUse" patternTransform="rotate(70)">
						<circle cx={6} cy={6} r={2.6} fill={C.blue} />
					</pattern>
					<pattern id="htD" width={14} height={14} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
						<circle cx={7} cy={7} r={4} fill={C.drained} />
					</pattern>
					<pattern id="hatch" width={14} height={14} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
						<rect width={3} height={14} fill={C.blue} opacity={0.45} />
					</pattern>
					<pattern id="hatchD" width={14} height={14} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
						<rect width={4} height={14} fill={C.drained} opacity={0.6} />
					</pattern>
					<filter id="rough" filterUnits="userSpaceOnUse" x={cam.pan * cam.z - 400} y={-200} width={W + 800} height={H + 400}>
						<feTurbulence type="fractalNoise" baseFrequency={1.4} numOctaves={1} seed={9} result="n" />
						<feDisplacementMap in="SourceGraphic" in2="n" scale={3} />
					</filter>
				</defs>
				{!card || T < T_CARD + 0.7 ? (
					<>
						<World T={T} cam={cam} />
						<Sky T={T} cam={cam} />
						<rect x={0} y={656} width={W} height={160} fill={C.paper} />
						<Strip T={T} cam={cam} />
						<Playhead T={T} cam={cam} />
						<StripHeader T={T} />
						<Frame T={T} />
					</>
				) : null}
				<image href={staticFile('chills/grain.png')} x={0} y={0} width={W} height={H} style={{mixBlendMode: 'multiply'}} opacity={card ? 0.15 : 0.35} />
				{card ? <EndCard T={T} from={cartScreen(camera(T_CARD), T_CARD)} /> : null}
			</svg>
			{!card ? <Subtitle T={T} /> : null}
		</AbsoluteFill>
	);
};
