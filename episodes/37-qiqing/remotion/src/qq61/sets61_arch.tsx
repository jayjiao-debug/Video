import React from 'react';
import {PAL, sp, poly, lerp} from '../qq60/geo60';
import {WingedSun} from '../qq60/props60';
import {SetP, at, ck, Ck, S61, Sd, Ln, Rod, rect, sps, Cornice, TorusV, Glyphs, phaseOf, wave, rng, flick} from './sets61_kit';

/* ep61 · SET-DRESSING library — ARCHITECTURE. Origins: centre of the foot on the ground line unless noted; units = figure grid units.
   Sources per piece: episodes/61-zhongshen/setsbook.md. */

/* ---------------- temple pylon with flagstaffs ---------------- */
/** two battered towers with cavetto cornices, the gateway between them (winged sun on the lintel, door leaves ajar), four cedar
    flagstaffs standing in niches, their pennants streaming in the wind (t). w = total width, h = tower height (units). */
export const Pylon: React.FC<SetP & {w?: number; h?: number; flags?: boolean; open?: number; glow?: number}> = ({x, y, s, t = 0, w = 44, h = 28, flags = true, open = 0.35, glow = 0}) => {
	const c = ck(s), gw = 7.5, bat = h * 0.075, gh = h * 0.7;
	const tower = (sg: number) => { const xo = sg * w / 2, xi = sg * gw / 2, top = -h, xo2 = xo - sg * bat, xi2 = xi + sg * bat * 0.4;
		const nich = [0.3, 0.68].map((u) => lerp(xi, xo, u));
		return <g key={sg}>
			<Sd d={poly([[xo, 0], [xi, 0], [xi2, top], [xo2, top]])} f={S61.stone} c={c} k={1.2} />
			{/* block courses */}
			{Array.from({length: Math.floor(h / 1.6)}, (_, i) => { const yy = -1.6 * (i + 1), u = -yy / h; return <path key={i} d={`M${lerp(xo, xo2, u)} ${yy}L${lerp(xi, xi2, u)} ${yy}`} stroke={S61.stone3} strokeWidth={c.LW * 0.8} opacity={0.5} />; })}
			{/* incised relief panel: the king before the gods (glyph columns as the carved text) */}
			<Glyphs x={Math.min(lerp(xi, xo, 0.38), lerp(xi, xo, 0.62)) + 0.6} y={top + 4.2} cols={2} rows={Math.floor(h * 0.4)} cell={0.9} seed={sg > 0 ? 7 : 3} color={S61.stone3} o={0.85} />
			{/* flagstaff niches */}
			{nich.map((nx, i) => <path key={i} d={rect(nx - 0.55, -0.02, nx + 0.55, top + 2.6)} fill={S61.stone3} opacity={0.75} />)}
			<TorusV x={xo - sg * 0.1} y0={0} y1={top} c={c} />
			<Cornice x0={Math.min(xo2, xi2)} x1={Math.max(xo2, xi2)} y={top} h={2.4} c={c} flare={0.7} />
		</g>; };
	const poles = flags ? [-1, 1].flatMap((sg) => [0.3, 0.68].map((u) => sg * lerp(gw / 2, w / 2, u))) : [];
	const pole = (px: number, i: number) => { const top = -h * 1.32, ph = phaseOf(i, 3), L = 5.2, n = 12;
		const str = (k: number, colr: string, dy: number) => { const pts: [number, number][] = [];
			for (let j = 0; j <= n; j++) { const u = j / n, a = u * (0.5 + 0.5 * u); pts.push([px + u * L, top + dy + 0.9 * a * Math.sin(t * 4.2 - u * 5 + ph + k)]); }
			const back = pts.slice().reverse().map(([a, b], j) => [a, b + 0.55 * (1 - (n - j) / n * 0.6)] as [number, number]);
			return <Sd key={k} d={sp([...pts, ...back], true, 0.12)} f={colr} c={c} k={0.7} />; };
		return <g key={i}>
			<Rod a={[px, 0.2]} b={[px, top]} w={0.42} f={S61.wood} c={c} />
			{[0.18, 0.42, 0.66].map((u) => <rect key={u} x={px - 0.4} y={-h * u - 0.3} width={0.8} height={0.5} fill={PAL.gold} stroke={PAL.ink} strokeWidth={c.LW} />)}
			{str(0, PAL.red, 0.4)}{str(1.4, PAL.linen, 1.2)}
		</g>; };
	const gx = gw / 2 + 0.5, lint = -gh;
	return <g transform={at(x, y, s)}>
		{poles.map((px, i) => <g key={i}>{pole(px, i)}</g>)}
		{tower(-1)}{tower(1)}
		{/* the gateway: jambs, the dark passage, door leaves, lintel with the winged sun, cornice */}
		<rect x={-gw / 2 + 0.9} y={lint + 2.4} width={gw - 1.8} height={gh - 2.4} fill="#1A1210" />
		{glow > 0 && <ellipse cx={0} cy={lint * 0.45} rx={gw * 0.5} ry={gh * 0.45} fill="url(#g60-warm)" opacity={glow * (0.8 + 0.2 * flick(t, 2))} style={{mixBlendMode: 'screen'}} />}
		{[-1, 1].map((sg) => { const lw = (gw - 1.8) / 2, wv = lw * (1 - open * 0.75);
			return <g key={sg}><Sd d={rect(sg * (gw / 2 - 0.9), lint + 2.4, sg * (gw / 2 - 0.9 - wv), 0)} f={S61.wood} c={c} k={0.8} />
				{[0.2, 0.45, 0.7].map((u) => <path key={u} d={`M${sg * (gw / 2 - 0.9)} ${lint + 2.4 + (gh - 2.4) * u}L${sg * (gw / 2 - 0.9 - wv)} ${lint + 2.4 + (gh - 2.4) * u}`} stroke={PAL.gold} strokeWidth={c.LW * 2.4} />)}</g>; })}
		{[-1, 1].map((sg) => <Sd key={sg} d={rect(sg * gx, 0, sg * (gw / 2 - 0.9), lint + 2.4)} f={S61.stoneHi} c={c} />)}
		<Sd d={rect(-gx - 0.3, lint + 2.4, gx + 0.3, lint)} f={S61.stoneHi} c={c} />
		<Cornice x0={-gx - 0.3} x1={gx + 0.3} y={lint} h={1.8} c={c} flare={0.5} />
		{[-1, 1].map((sg) => <Glyphs key={sg} x={sg * (gw / 2 + 0.15) - 0.45} y={lint + 3.4} cols={1} rows={Math.floor((gh - 4) / 1.0)} cell={0.75} seed={11 + sg} color={PAL.blue} rule={false} />)}
	</g>;
	// the winged sun is drawn by the caller-agnostic px component on top (keeps its own line weights)
};
/** the winged sun for a Pylon's lintel, in px (draw after the Pylon) */
export const PylonSun: React.FC<SetP & {h?: number}> = ({x, y, s, t = 0, h = 28}) => <WingedSun x={x} y={y + (-h * 0.7 + 1.2) * s} s={s * 0.55} span={5.6} t={t} />;

/* ---------------- columns ---------------- */
export type ColKind = 'papyrus' | 'lotus';
/** a bundle column (papyrus: triangular stems, lotus: round stems) with an open (flower) or closed (bud) capital; h = total height */
export const Column61: React.FC<SetP & {h?: number; w?: number; kind?: ColKind; open?: boolean; paint?: boolean}> = ({x, y, s, h = 18, w = 2.4, kind = 'papyrus', open = true, paint = true}) => {
	const c = ck(s), capH = h * 0.17, abH = 0.8, shTop = -h + abH + capH, base = 0.7, r = w / 2;
	const shaft = sps([[-r * 0.86, -base, 1], [r * 0.86, -base, 1], [r * 1.02, -base - 1.4], [r * 0.92, shTop + 0.5], [r * 0.9, shTop, 1], [-r * 0.9, shTop, 1], [-r * 0.92, shTop + 0.5], [-r * 1.02, -base - 1.4]], 0.2);
	const stems = kind === 'papyrus' ? [-0.5, 0, 0.5] : [-0.66, -0.22, 0.22, 0.66];
	const capOpen = kind === 'papyrus'
		? sps([[-r * 0.9, shTop, 1], [r * 0.9, shTop, 1], [r * 1.5, shTop - capH * 0.45], [r * 2.15, shTop - capH * 0.92], [r * 2.2, shTop - capH, 1], [-r * 2.2, shTop - capH, 1], [-r * 2.15, shTop - capH * 0.92], [-r * 1.5, shTop - capH * 0.45]], 0.2)
		: poly([[-r * 0.9, shTop], [r * 0.9, shTop], [r * 1.9, shTop - capH * 0.75], [r * 2.15, shTop - capH], [r * 1.5, shTop - capH * 0.82], [r * 1.05, shTop - capH], [r * 0.5, shTop - capH * 0.82], [0, shTop - capH], [-r * 0.5, shTop - capH * 0.82], [-r * 1.05, shTop - capH], [-r * 1.5, shTop - capH * 0.82], [-r * 2.15, shTop - capH], [-r * 1.9, shTop - capH * 0.75]]);
	const capClosed = sps([[-r * 0.9, shTop, 1], [r * 0.9, shTop, 1], [r * 1.3, shTop - capH * 0.3], [r * 1.2, shTop - capH * 0.75], [r * 0.85, shTop - capH, 1], [-r * 0.85, shTop - capH, 1], [-r * 1.2, shTop - capH * 0.75], [-r * 1.3, shTop - capH * 0.3]], 0.22);
	const capW = open ? r * 2.2 : r * 0.85;
	return <g transform={at(x, y, s)}>
		<Sd d={sps([[-r * 1.35, 0, 1], [r * 1.35, 0, 1], [r * 1.3, -base, 1], [-r * 1.3, -base, 1]])} f={S61.stone2} c={c} />
		<Sd d={shaft} f={S61.stone} c={c} k={1.1} />
		{stems.map((u) => <path key={u} d={`M${u * r * 1.6} ${-base - 0.3}Q${u * r * 2.0} ${-base - 1.4} ${u * r * 1.75} ${-base - 2.6}L${u * r * 1.7} ${shTop - 0.2}`} fill="none" stroke={S61.stone3} strokeWidth={c.LW * 1.2} />)}
		{/* foot leaves (triangular sheaths) */}
		{paint && [-0.6, 0, 0.6].map((u) => <path key={u} d={poly([[u * r * 1.5 - r * 0.32, -base - 0.1], [u * r * 1.5 + r * 0.32, -base - 0.1], [u * r * 1.55, -base - 1.9]])} fill={PAL.green} stroke={PAL.ink} strokeWidth={c.LW} opacity={0.9} />)}
		{/* the five tie bands under the capital with the little stems hanging between */}
		{[0, 1, 2, 3, 4].map((i) => <rect key={i} x={-r * 0.92} y={shTop + 0.6 + i * 0.36} width={r * 1.84} height={0.26} fill={paint ? [PAL.blue, PAL.red, PAL.blue, PAL.red, PAL.blue][i] : S61.stone3} stroke={PAL.ink} strokeWidth={c.LW * 0.6} />)}
		{paint && [-0.45, 0, 0.45].map((u) => <path key={u} d={`M${u * r * 1.6} ${shTop + 2.4}L${u * r * 1.6} ${shTop + 4.0}`} stroke={PAL.green} strokeWidth={c.LW * 2.2} />)}
		<Sd d={open ? capOpen : capClosed} f={paint ? (open ? PAL.green : S61.leaf3) : S61.stone} c={c} k={1.1} />
		{/* capital painting: sepals at the foot, umbel strokes / petals */}
		{paint && (open ? <g>{Array.from({length: 9}, (_, i) => { const u = (i - 4) / 4; return <path key={i} d={`M${u * r * 0.55} ${shTop - 0.1}L${u * r * 2.05} ${shTop - capH + 0.25}`} stroke={kind === 'papyrus' ? PAL.ink : PAL.linen} strokeWidth={c.LW * (kind === 'papyrus' ? 0.9 : 2)} opacity={0.7} />; })}
			{[-1, 0, 1].map((u) => <path key={u} d={poly([[u * r * 0.7 - r * 0.35, shTop], [u * r * 0.7 + r * 0.35, shTop], [u * r * 0.85, shTop - capH * 0.5]])} fill={PAL.blue} stroke={PAL.ink} strokeWidth={c.LW} />)}
			<path d={`M${-r * 2.15} ${shTop - capH + 0.25}L${r * 2.15} ${shTop - capH + 0.25}`} stroke={PAL.gold} strokeWidth={c.LW * 2.4} /></g>
			: <g>{[-1, 0, 1].map((u) => <path key={u} d={poly([[u * r * 0.75 - r * 0.38, shTop], [u * r * 0.75 + r * 0.38, shTop], [u * r * 0.85, shTop - capH * (kind === 'lotus' ? 0.95 : 0.55)]])} fill={kind === 'lotus' ? PAL.blue : PAL.green} stroke={PAL.ink} strokeWidth={c.LW} />)}
				{[-0.5, 0.5].map((u) => <path key={u} d={`M${u * r * 1.2} ${shTop - 0.3}L${u * r * 0.9} ${shTop - capH + 0.2}`} stroke={PAL.ink} strokeWidth={c.LW * 0.9} opacity={0.6} />)}</g>)}
		<Sd d={rect(-Math.max(r * 1.0, capW * 0.42), -h, Math.max(r * 1.0, capW * 0.42), -h + abH)} f={S61.stone2} c={c} />
	</g>;
};

/* ---------------- architrave with the winged sun ---------------- */
/** the beam laid across columns: origin = centre of the beam's UNDERSIDE; w = length (units). The winged sun spreads its wings over
    the middle (its feathers ripple with t); the cavetto cornice crowns it. */
export const Architrave: React.FC<SetP & {w?: number}> = ({x, y, s, t = 0, w = 30}) => {
	const c = ck(s), bh = 2.8;
	return <g>
		<g transform={at(x, y, s)}>
			<Sd d={rect(-w / 2, -bh, w / 2, 0)} f={S61.stone} c={c} k={1.1} />
			<rect x={-w / 2 + 0.3} y={-bh + 0.3} width={w - 0.6} height={bh - 0.6} fill="none" stroke={PAL.red} strokeWidth={c.LW * 1.4} />
			{[-1, 1].map((sg) => <Glyphs key={sg} x={sg > 0 ? w * 0.18 : -w / 2 + 1} y={-bh + 0.6} cols={Math.floor((w * 0.32 - 1) / 1.1)} rows={1} cell={0.88} seed={5 + sg} rule={false} />)}
			<Cornice x0={-w / 2} x1={w / 2} y={-bh} h={2.2} c={c} flare={0.7} />
		</g>
		<WingedSun x={x} y={y - bh * 0.5 * s} s={s * 0.62} span={Math.min(10, w * 0.14)} t={t} />
	</g>;
};

/* ---------------- obelisk ---------------- */
/** granite shaft on a plinth, one column of carved signs, gilded pyramidion that catches the sun (a glint slides across it). h = shaft height */
export const Obelisk: React.FC<SetP & {h?: number; stone?: string}> = ({x, y, s, t = 0, h = 30, stone = S61.granite}) => {
	const c = ck(s), b = 1.5, tp = 1.0, pyr = 1.9, top = -h - 1.6, glint = wave(t, 4.5);
	return <g transform={at(x, y, s)}>
		<Sd d={rect(-2.6, -1.6, 2.6, 0)} f={S61.stone2} c={c} />
		<Sd d={poly([[-b, -1.6], [b, -1.6], [tp, top], [-tp, top]])} f={stone} c={c} k={1.1} />
		<path d={poly([[0.15, -1.6], [b, -1.6], [tp, top], [0.1, top]])} fill="#000" opacity={0.12} />
		<Glyphs x={-0.48} y={top + 1.2} cols={1} rows={Math.floor(h / 1.05) - 2} cell={0.78} seed={23} color="#3E2C28" rule={false} o={0.85} />
		<Sd d={poly([[-tp, top], [tp, top], [0, top - pyr]])} f={PAL.gold} c={c} />
		<path d={poly([[0, top], [tp, top], [0, top - pyr]])} fill={PAL.gold2} opacity={0.7} />
		<path d={poly([[lerp(-tp, 0, glint) - 0.15, top], [lerp(-tp, 0, glint) + 0.25, top], [0, top - pyr]])} fill="#FFF6D8" opacity={0.75} />
		<circle cx={0} cy={top - pyr} r={1.6} fill="url(#g60-gold)" opacity={0.4 + 0.35 * glint} style={{mixBlendMode: 'screen'}} />
	</g>;
};

/* ---------------- seated colossus (profile, faces +x) ---------------- */
/** a seated king on a block throne (sema-tawy on its side), nemes headdress with the uraeus, false beard, hands flat on the knees,
    on a plinth. Origin = plinth foot centre; about 24 units tall at s = 1 unit (scale up for colossal). Stone does not move: t unused. */
export const Colossus: React.FC<SetP & {stone?: string; paint?: boolean}> = ({x, y, s, stone = S61.stone, paint = true}) => {
	const c = ck(s), sk = paint ? PAL.skinM : stone;
	return <g transform={at(x, y, s)}>
		<Sd d={rect(-6.2, -2, 6.6, 0)} f={S61.stone2} c={c} />
		{/* throne block */}
		<Sd d={rect(-5.2, -11.6, 1.2, -2)} f={stone} c={c} k={1.1} />
		<Sd d={rect(-5.2, -12.6, -3.6, -11.6)} f={stone} c={c} />
		<rect x={-4.6} y={-10.9} width={5.1} height={8.3} fill="none" stroke={S61.stone3} strokeWidth={c.LW * 1.4} />
		{/* sema-tawy: lung + windpipe bound with papyrus and lily */}
		<g stroke={paint ? PAL.blue : S61.stone3} strokeWidth={c.LW * 1.6} fill="none">
			<path d="M-2.05 -3.4L-2.05 -9.4" /><ellipse cx={-2.05} cy={-6.3} rx={0.6} ry={0.9} />
			<path d="M-2.05 -5.4Q-3.4 -6.2 -3.9 -8.6M-2.05 -5.4Q-0.7 -6.2 -0.2 -8.6" />
		</g>
		{paint && <><path d={poly([[-4.3, -8.8], [-3.6, -8.4], [-3.4, -9.4]])} fill={PAL.green} /><path d={poly([[0.2, -8.8], [-0.5, -8.4], [-0.7, -9.4]])} fill={PAL.green} /></>}
		{/* legs: shin and foot, thigh */}
		<Sd d={sps([[1.5, -2.0, 1], [4.6, -2.0, 1], [4.4, -2.6], [3.2, -2.9], [3.1, -9.3], [3.5, -10.2], [3.2, -11.4], [1.2, -11.4, 1], [1.5, -9.3]], 0.16)} f={sk} c={c} />
		<Sd d={sps([[-3.8, -11.3, 1], [3.6, -11.4], [3.8, -12.3], [3.3, -12.9], [-3.8, -13.0, 1]], 0.18)} f={paint ? PAL.linen : stone} c={c} />
		{paint && Array.from({length: 7}, (_, i) => <path key={i} d={`M${-3.2 + i * 0.95} -11.3L${-3.0 + i * 0.95} -12.95`} stroke={PAL.gold} strokeWidth={c.LW} opacity={0.8} />)}
		{/* torso */}
		<Sd d={sps([[-3.6, -13.0, 1], [0.8, -13.0, 1], [1.3, -15.6], [1.9, -18.0], [1.6, -19.2], [-0.5, -19.6], [-3.4, -19.2], [-3.7, -16.2]], 0.18)} f={sk} c={c} />
		<rect x={-3.6} y={-13.4} width={4.4} height={0.5} fill={PAL.gold} stroke={PAL.ink} strokeWidth={c.LW} />
		{/* arm: upper arm down the side, forearm along the thigh, hand flat on the knee */}
		<Sd d={sps([[-1.6, -19.0], [-0.4, -18.8], [0.0, -15.6], [0.4, -13.6], [3.6, -13.3], [3.9, -12.7], [3.4, -12.5], [-0.3, -12.6], [-1.4, -13.3], [-1.9, -16.0]], 0.18)} f={sk} c={c} />
		{/* broad collar */}
		{paint && [0, 1, 2].map((i) => <path key={i} d={`M${-2.7 + i * 0.1} ${-19.4 + i * 0.4}Q0 ${-18.2 + i * 0.4} ${1.7 - i * 0.05} ${-19.0 + i * 0.5}`} fill="none" stroke={[PAL.blue, PAL.red, PAL.green][i]} strokeWidth={c.LW * 2.6} />)}
		{/* head: nemes with lappet, face to +x, beard, uraeus */}
		<Sd d={sps([[-1.6, -19.6], [-0.1, -19.6], [0.5, -20.4], [1.6, -20.9], [2.0, -21.8], [1.7, -22.2], [1.9, -22.9], [1.4, -24.2], [0.2, -24.6], [-1.6, -24.1]], 0.2)} f={sk} c={c} />
		<Sd d={sps([[0.55, -20.4, 1], [0.95, -20.4], [0.95, -18.9], [0.65, -18.6], [0.45, -19.0]], 0.15)} f={paint ? PAL.blue : S61.stone3} c={c} k={0.8} />
		<Sd d={sps([[-3.8, -17.4, 1], [-2.4, -17.0], [-1.7, -19.3], [-0.9, -20.4], [0.6, -21.0], [0.7, -23.2], [1.3, -24.3], [0.4, -25.4], [-1.8, -25.6], [-3.4, -24.4], [-3.6, -21.8], [-4.2, -20.2]], 0.18)} f={paint ? PAL.gold : stone} c={c} k={1.1} />
		{paint && Array.from({length: 7}, (_, i) => <path key={i} d={`M${-3.4 + i * 0.35} ${-25.0 + i * 0.12}Q${-3.6 + i * 0.5} ${-21.6} ${-3.4 + i * 0.25} ${-17.6 - i * 0.1}`} fill="none" stroke={PAL.blue} strokeWidth={c.LW * 2.2} />)}
		<Sd d={sps([[-1.2, -21.0], [0.0, -20.8], [0.4, -21.6], [-0.3, -22.3], [-1.2, -22.1]], 0.2)} f={paint ? PAL.gold : stone} c={c} k={0.8} />
		<path d="M0.85 -22.4Q1.15 -22.7 1.45 -22.45Q1.15 -22.25 0.85 -22.4Z" fill={PAL.white} stroke={PAL.ink} strokeWidth={c.LW} />
		<circle cx={1.2} cy={-22.45} r={0.1} fill={PAL.ink} /><path d="M0.6 -22.8Q1.2 -23.05 1.6 -22.8" fill="none" stroke={PAL.ink} strokeWidth={c.LW * 1.4} />
		<path d="M1.0 -22.3L1.9 -22.0" stroke={PAL.ink} strokeWidth={c.LW * 1.2} />
		<Sd d={sps([[1.1, -25.2], [1.5, -25.9], [1.9, -25.4], [1.6, -24.8]], 0.2)} f={paint ? PAL.gold : stone} c={c} k={0.8} />
	</g>;
};

/* ---------------- sphinx & ram-sphinx (recumbent, profile, faces +x) ---------------- */
/** a recumbent lion with the king's head in the nemes (kind 'king') or a ram's head (kind 'ram', a small king standing between the paws);
    the tail tip flicks now and then (t). Origin = plinth foot centre; ~11 units tall, 20 long. */
export const Sphinx: React.FC<SetP & {kind?: 'king' | 'ram'; plinth?: boolean; seed?: number; stone?: string}> = ({x, y, s, t = 0, kind = 'king', plinth = true, seed = 0, stone = S61.stone}) => {
	const c = ck(s), py = plinth ? -1.8 : 0, ph = phaseOf(seed, 5), flick_ = 0.5 * Math.sin(t * 0.9 + ph) + 0.3 * Math.max(0, Math.sin(t * 2.2 + ph * 2));
	const body = sps([[-9.4, py, 1], [5.8, py, 1], [5.6, py - 1.2], [4.8, py - 3.8], [4.2, py - 5.6], [1.0, py - 5.3], [-3.4, py - 5.0], [-6.6, py - 5.6], [-8.6, py - 5.0], [-9.6, py - 3.2]], 0.2);
	const fore = sps([[2.6, py, 1], [10.2, py, 1], [10.4, py - 0.5], [9.6, py - 0.95], [5.2, py - 1.0], [4.0, py - 2.6], [2.6, py - 2.2]], 0.18);
	const haunch = sps([[-8.8, py - 0.1], [-4.8, py - 0.1], [-4.4, py - 1.3], [-5.2, py - 3.6], [-7.4, py - 4.2], [-8.8, py - 3.0]], 0.22);
	const tail = sp([[-9.3, py - 3.0], [-10.4, py - 2.0], [-10.2, py - 0.9], [-8.4, py - 0.6], [-6.6, py - 1.0 - flick_ * 0.6], [-6.1, py - 1.6 - flick_ * 1.1]], false, 0.2);
	return <g transform={at(x, y, s)}>
		{plinth && <><Sd d={rect(-10.6, py, 11.0, 0)} f={S61.stone2} c={c} /><path d={`M-10.4 ${py + 0.5}L10.8 ${py + 0.5}`} stroke={PAL.red} strokeWidth={c.LW * 1.6} /></>}
		<path d={tail} fill="none" stroke={PAL.ink} strokeWidth={c.OW * 2 + 0.36} strokeLinecap="round" /><path d={tail} fill="none" stroke={stone} strokeWidth={0.36} strokeLinecap="round" />
		<Sd d={body} f={stone} c={c} k={1.1} />
		<Sd d={haunch} f={stone} c={c} />
		<Sd d={fore} f={stone} c={c} />
		{[8.9, 9.5, 10.0].map((xx) => <path key={xx} d={`M${xx} ${py}L${xx - 0.1} ${py - 0.5}`} stroke={PAL.ink} strokeWidth={c.LW} />)}
		{Array.from({length: 4}, (_, i) => <path key={i} d={`M${-2.6 + i * 1.3} ${py - 4.7}Q${-2.2 + i * 1.3} ${py - 3.2} ${-2.6 + i * 1.3} ${py - 1.9}`} fill="none" stroke={S61.stone3} strokeWidth={c.LW} opacity={0.7} />)}
		{kind === 'king' ? <g>
			{/* nemes: the striped headcloth falls behind and in front of the shoulders */}
			<Sd d={sps([[1.8, py - 4.6], [4.2, py - 4.4], [4.6, py - 6.2], [5.6, py - 7.0], [5.8, py - 9.2], [4.6, py - 10.4], [2.6, py - 10.2], [1.8, py - 8.8], [1.0, py - 6.4]], 0.2)} f={PAL.gold} c={c} k={1.1} />
			{Array.from({length: 6}, (_, i) => <path key={i} d={`M${2.1 + i * 0.5} ${py - 10.0 + i * 0.05}Q${1.6 + i * 0.6} ${py - 7.4} ${1.4 + i * 0.55} ${py - 4.9}`} fill="none" stroke={PAL.blue} strokeWidth={c.LW * 2} />)}
			<Sd d={sps([[4.6, py - 6.4], [5.6, py - 6.2], [6.2, py - 7.0], [6.9, py - 7.4], [6.8, py - 8.0], [7.0, py - 8.5], [6.6, py - 9.6], [5.2, py - 9.6], [4.6, py - 8.4]], 0.2)} f={stone} c={c} />
			<Sd d={sps([[4.6, py - 9.4], [6.0, py - 9.6], [6.4, py - 10.2], [5.2, py - 10.9], [3.4, py - 10.6]], 0.2)} f={PAL.gold} c={c} k={0.8} />
			<path d="M5.95 -0 " />
			<path d={`M5.9 ${py - 8.5}Q6.2 ${py - 8.7} 6.5 ${py - 8.5}Q6.2 ${py - 8.35} 5.9 ${py - 8.5}Z`} fill={PAL.white} stroke={PAL.ink} strokeWidth={c.LW} />
			<path d={`M5.7 ${py - 8.85}Q6.2 ${py - 9.05} 6.7 ${py - 8.85}`} fill="none" stroke={PAL.ink} strokeWidth={c.LW * 1.2} />
			<Sd d={sps([[6.0, py - 6.5, 1], [6.5, py - 6.5], [6.6, py - 5.0], [6.2, py - 4.9]], 0.15)} f={PAL.blue} c={c} k={0.7} />
			<Sd d={sps([[5.5, py - 10.5], [5.9, py - 11.2], [6.3, py - 10.7], [6.0, py - 10.2]], 0.2)} f={PAL.gold} c={c} k={0.7} />
		</g> : <g>
			{/* ram head with a curled horn, mane lappets, the small king figure in front of the chest */}
			<Sd d={sps([[1.8, py - 4.6], [4.4, py - 4.6], [4.8, py - 7.6], [3.6, py - 9.4], [2.2, py - 8.8], [1.2, py - 6.4]], 0.2)} f={PAL.blue} c={c} />
			<Sd d={sps([[3.4, py - 7.2], [5.0, py - 6.8], [6.4, py - 6.4], [7.4, py - 6.8], [7.5, py - 7.6], [6.6, py - 8.8], [5.0, py - 9.6], [3.4, py - 9.2]], 0.22)} f={stone} c={c} k={1.1} />
			<path d={`M7.2 ${py - 6.9}Q6.6 ${py - 6.2} 6.0 ${py - 6.6}`} fill="none" stroke={PAL.ink} strokeWidth={c.LW} />
			<circle cx={5.9} cy={py - 8.2} r={0.17} fill={PAL.ink} />
			<g transform={`translate(4.4 ${py - 8.6})`}><Sd d={sp([[0.0, -0.2], [-0.9, -1.0], [-1.8, -0.4], [-1.8, 0.8], [-0.8, 1.5], [0.3, 1.0], [0.4, 0.3], [-0.4, 0.5], [-0.9, 0.0], [-0.6, -0.5]], true, 0.22)} f={S61.stone2} c={c} />
				<path d="M-0.4 -0.3Q-1.3 -0.6 -1.3 0.4Q-0.6 1.0 0.0 0.5" fill="none" stroke={S61.stone3} strokeWidth={c.LW * 1.3} /></g>
			<g transform={`translate(7.6 ${py})`}>
				<Sd d={sps([[-0.55, 0, 1], [0.55, 0, 1], [0.5, -2.4], [0.7, -3.2], [0.2, -3.9], [-0.5, -3.6], [-0.6, -2.4]], 0.2)} f={S61.stoneHi} c={c} k={0.8} />
				<Sd d={sps([[-0.45, -3.6], [0.4, -3.95], [0.55, -4.6], [0.0, -5.0], [-0.5, -4.6]], 0.2)} f={PAL.gold} c={c} k={0.7} />
			</g>
		</g>}
	</g>;
};
/** an avenue of ram-sphinxes on plinths, receding: n sphinxes, gap (units at the nearest), depth shrink k; drawn far → near.
    Each tail flicks on its own clock. Origin = foot of the NEAREST sphinx. */
export const SphinxAvenue: React.FC<SetP & {n?: number; gap?: number; k?: number; kind?: 'king' | 'ram'; face?: 1 | -1}> = ({x, y, s, t = 0, n = 5, gap = 17, k = 0.8, kind = 'ram', face = 1}) => {
	const items = Array.from({length: n}, (_, i) => { const sc = Math.pow(k, i), off = Array.from({length: i}, (_, j) => gap * Math.pow(k, j) * (1 - 0.5 * (1 - k))).reduce((a, b) => a + b, 0);
		return {sc, dx: -face * off * s, dy: -(1 - sc) * 9 * s, i}; }).reverse();
	return <g>{items.map(({sc, dx, dy, i}) => <g key={i} transform={face < 0 ? `translate(${x + dx},0) scale(-1,1) translate(${-(x + dx)},0)` : undefined}>
		<Sphinx x={x + dx} y={y + dy} s={s * sc} t={t} kind={kind} seed={i + 1} /></g>)}</g>;
};

/* ---------------- naos (shrine) ---------------- */
/** a stone shrine on a plinth: battered walls, torus and cavetto, a frieze of rearing uraei on top, double doors (open 0..1) with the
    gilded cult image inside lit by a lamp (flicker). Origin = foot centre; w × h units. */
export const Naos61: React.FC<SetP & {w?: number; h?: number; open?: number; image?: boolean}> = ({x, y, s, t = 0, w = 7, h = 10, open = 0.7, image = true}) => {
	const c = ck(s), pl = 0.9, top = -h + 2.2, dw = w * 0.56, dh = (h - 2.2 - pl) * 0.78, dy0 = -pl, dy1 = -pl - dh, f = flick(t, 4);
	return <g transform={at(x, y, s)}>
		<Sd d={rect(-w / 2 - 0.8, -pl, w / 2 + 0.8, 0)} f={S61.stone2} c={c} />
		<Sd d={poly([[-w / 2, -pl], [w / 2, -pl], [w / 2 - 0.35, top], [-w / 2 + 0.35, top]])} f={S61.stone} c={c} k={1.1} />
		<TorusV x={-w / 2 + 0.2} y0={-pl} y1={top} c={c} /><TorusV x={w / 2 - 0.2} y0={-pl} y1={top} c={c} />
		<Cornice x0={-w / 2 + 0.35} x1={w / 2 - 0.35} y={top} h={1.4} c={c} flare={0.4} />
		{/* uraeus frieze */}
		{Array.from({length: Math.round(w / 0.75)}, (_, i) => { const ux = -w / 2 + 0.6 + i * ((w - 1.2) / Math.max(1, Math.round(w / 0.75) - 1)), uy = top - 1.55;
			return <g key={i}><Sd d={sps([[ux - 0.22, uy, 1], [ux + 0.22, uy, 1], [ux + 0.2, uy - 0.45], [ux + 0.28, uy - 0.75], [ux, uy - 0.9], [ux - 0.24, uy - 0.7], [ux - 0.18, uy - 0.4]], 0.2)} f={PAL.gold} c={c} k={0.6} />
				<circle cx={ux} cy={uy - 1.05} r={0.16} fill={PAL.red} stroke={PAL.ink} strokeWidth={c.LW * 0.7} /></g>; })}
		{/* doorway */}
		<rect x={-dw / 2} y={dy1} width={dw} height={dh} fill="#140E10" />
		<ellipse cx={0} cy={dy0 - dh * 0.4} rx={dw * 0.55} ry={dh * 0.5} fill="url(#g60-warm)" opacity={0.55 + 0.12 * f} style={{mixBlendMode: 'screen'}} />
		{image && <g transform={`translate(${-dw * 0.05},${dy0})`}>
			<Sd d={rect(-dw * 0.32, -dh * 0.34, dw * 0.12, 0)} f={PAL.gold2} c={c} k={0.7} />
			<Sd d={sps([[-dw * 0.12, -dh * 0.34, 1], [dw * 0.26, -dh * 0.34, 1], [dw * 0.3, -dh * 0.5], [dw * 0.12, -dh * 0.52], [dw * 0.1, -dh * 0.7], [dw * 0.2, -dh * 0.78], [dw * 0.12, -dh * 0.9], [-dw * 0.06, -dh * 0.9], [-dw * 0.12, -dh * 0.7]], 0.2)} f={PAL.gold} c={c} k={0.7} />
		</g>}
		{[-1, 1].map((sg) => { const ww = (dw / 2) * (1 - open * 0.8);
			return <g key={sg}><Sd d={rect(sg * dw / 2, dy1, sg * (dw / 2 - ww), dy0)} f={S61.wood} c={c} k={0.7} />
				{[0.25, 0.5, 0.75].map((u) => <circle key={u} cx={sg * (dw / 2 - ww * 0.5)} cy={dy1 + dh * u} r={0.12} fill={PAL.gold} />)}</g>; })}
		<rect x={-dw / 2 - 0.15} y={dy1 - 0.15} width={dw + 0.3} height={dh + 0.15} fill="none" stroke={PAL.ink} strokeWidth={c.OW * 2} />
		<WingSmall x={0} y={dy1 - 0.75} w={dw * 0.8} c={c} />
	</g>;
};
/** a small flat winged disc for lintels (unit space) */
export const WingSmall: React.FC<{x: number; y: number; w: number; c: Ck}> = ({x, y, w, c}) => <g>
	{[-1, 1].map((sg) => <path key={sg} d={sps([[x + sg * 0.35, y - 0.25, 1], [x + sg * w / 2, y - 0.1], [x + sg * w / 2, y + 0.05, 1], [x + sg * 0.35, y + 0.3, 1]], 0.15)} fill={PAL.blue} stroke={PAL.ink} strokeWidth={c.LW} />)}
	<circle cx={x} cy={y} r={0.38} fill={PAL.red} stroke={PAL.ink} strokeWidth={c.LW} />
</g>;

/* ---------------- throne / chair ---------------- */
/** a royal chair (profile, faces +x): lion legs standing on drums, a tall back, cushion, the sema-tawy openwork between the legs. Origin = floor centre */
export const Throne61: React.FC<SetP & {cushion?: string}> = ({x, y, s, cushion = PAL.red}) => {
	const c = ck(s);
	const leg = (lx: number, front: boolean) => <g key={lx}>
		<Sd d={rect(lx - 0.55, -0.45, lx + 0.65, 0)} f={PAL.gold2} c={c} k={0.8} />
		<Sd d={sps([[lx - 0.4, -0.45, 1], [lx + 0.7, -0.45, 1], [lx + 0.75, -0.95], [lx + 0.35, -1.25], [lx + 0.28, -2.6], [lx + 0.5, -4.1, 1], [lx - 0.5, -4.1, 1], [lx - 0.35, -2.6], front ? [lx - 0.6, -1.3] : [lx - 0.2, -1.3]], 0.2)} f={PAL.gold} c={c} />
		{[0, 1, 2].map((k) => <path key={k} d={`M${lx + 0.2 + k * 0.2} -0.5L${lx + 0.25 + k * 0.2} -0.85`} stroke={PAL.ink} strokeWidth={c.LW * 0.8} />)}
	</g>;
	return <g transform={at(x, y, s)}>
		{/* back */}
		<Sd d={poly([[-3.0, -4.1], [-2.2, -4.1], [-3.0, -10.4], [-3.9, -10.2]])} f={PAL.gold} c={c} />
		<path d="M-3.25 -5.0L-3.75 -9.6" stroke={PAL.blue} strokeWidth={c.LW * 2.6} />
		{leg(-2.6, false)}{leg(2.0, true)}
		{/* openwork sema-tawy between the legs */}
		<g stroke={PAL.gold2} strokeWidth={c.LW * 2} fill="none"><path d="M-0.3 -0.9L-0.3 -3.7M-2.0 -2.3L1.4 -2.3" /><path d="M-0.3 -2.3Q-1.6 -1.6 -1.9 -0.9M-0.3 -2.3Q1.0 -1.6 1.3 -0.9" /></g>
		<Sd d={rect(-3.2, -4.6, 3.0, -4.0)} f={PAL.gold2} c={c} />
		<Sd d={sps([[-2.9, -4.55, 1], [2.8, -4.55, 1], [2.9, -4.95], [2.4, -5.25], [-2.6, -5.25], [-3.0, -5.0]], 0.2)} f={cushion} c={c} />
		{/* lion head at the front of the seat rail */}
		<Sd d={sps([[2.6, -4.1], [3.3, -4.3], [3.9, -4.9], [3.7, -5.5], [3.1, -5.7], [2.6, -5.3]], 0.25)} f={PAL.gold} c={c} k={0.8} />
		<circle cx={3.35} cy={-5.05} r={0.08} fill={PAL.ink} />
	</g>;
};

/* ---------------- stepped dais ---------------- */
/** a raised platform with a flight of steps on the side (`steps` on the left end, faces +x), the side panel painted with the palace-facade
    (serekh) pattern. Origin = foot centre; w × h units; the top surface is at y - h·s. */
export const Dais: React.FC<SetP & {w?: number; h?: number; steps?: number}> = ({x, y, s, w = 16, h = 2.6, steps = 5}) => {
	const c = ck(s), sw = h * 0.85, x0 = -w / 2 + sw;
	return <g transform={at(x, y, s)}>
		<Sd d={rect(x0, -h, w / 2, 0)} f={S61.stone} c={c} k={1.1} />
		{Array.from({length: Math.max(2, Math.round((w - sw) / 1.2))}, (_, i) => { const px = x0 + 0.5 + i * 1.2; return px > w / 2 - 0.8 ? null : <g key={i}>
			<rect x={px} y={-h + 0.45} width={0.7} height={h - 0.8} fill={i % 2 ? PAL.red : PAL.blue} opacity={0.85} />
			<rect x={px + 0.18} y={-h + 0.8} width={0.34} height={h - 1.4} fill={PAL.linen} opacity={0.8} /></g>; })}
		<Sd d={rect(x0 - 0.2, -h - 0.3, w / 2 + 0.2, -h)} f={S61.stoneHi} c={c} />
		{Array.from({length: steps}, (_, i) => { const sh = h / steps, sx = -w / 2 + (sw / steps) * i;
			return <Sd key={i} d={rect(sx, -(i + 1) * sh, x0, -i * sh)} f={i % 2 ? S61.stone : S61.stoneHi} c={c} k={0.7} />; })}
	</g>;
};

/* ---------------- false door ---------------- */
/** the stela-door between the living and the dead (frontal): nested jambs with glyph columns, the offering-table panel (the owner at
    the table of bread), the drum roll over the narrow central niche, torus and cavetto. The ka light breathes in the niche (t). Origin = foot centre */
export const FalseDoor: React.FC<SetP & {w?: number; h?: number; red?: boolean}> = ({x, y, s, t = 0, w = 8, h = 12, red = true}) => {
	const c = ck(s), body = red ? '#B4583A' : S61.stone, k = 0.45 + 0.35 * wave(t, 5);
	const sp_ = red ? Array.from({length: 46}, (_, i) => { const R = rng(i + 3); return <circle key={i} cx={-w / 2 + R() * w} cy={-R() * (h - 1.6)} r={0.05 + R() * 0.07} fill="#2A1912" opacity={0.45} />; }) : null;
	const fr = (ins: number, top: number) => rect(-w / 2 + ins, -0.0, w / 2 - ins, top);
	return <g transform={at(x, y, s)}>
		<Sd d={fr(0, -h + 1.6)} f={body} c={c} k={1.1} />{sp_}
		<Sd d={fr(1.3, -h + 3.1)} f={red ? '#C46A48' : S61.stoneHi} c={c} />
		<Sd d={fr(2.3, -h + 5.6)} f={body} c={c} />
		{/* glyph columns on the outer and inner jambs */}
		{[-1, 1].map((sg) => <g key={sg}><Glyphs x={sg * (w / 2 - 0.65) - 0.42} y={-h + 2.2} cols={1} rows={Math.floor((h - 2.6) / 0.86)} cell={0.68} seed={30 + sg} color={red ? '#F3E3B8' : PAL.blue} rule={false} />
			<Glyphs x={sg * (w / 2 - 1.8) - 0.36} y={-h + 3.9} cols={1} rows={Math.floor((h - 4.4) / 0.76)} cell={0.58} seed={40 + sg} color={red ? '#F3E3B8' : PAL.red} rule={false} /></g>)}
		{/* offering panel: the owner seated at a table of bread loaves */}
		<Sd d={rect(-w / 2 + 2.3, -h + 5.6, w / 2 - 2.3, -h + 3.1)} f={S61.stoneHi} c={c} k={0.8} />
		<g transform={`translate(${-0.9},${-h + 5.45}) scale(0.55)`}>
			<Sd d={sps([[-1.2, 0, 1], [-0.4, 0, 1], [-0.5, -1.6], [0.3, -1.7], [0.4, -3.3], [0.0, -3.9], [-0.6, -3.7], [-0.7, -2.0], [-1.2, -1.9]], 0.2)} f={PAL.skinM} c={c} k={0.6} />
			<Sd d={rect(-1.5, -1.8, -0.2, -1.5)} f={PAL.wood} c={c} k={0.5} />
		</g>
		<g transform={`translate(${0.6},${-h + 5.45}) scale(0.55)`}>
			<Rod a={[0, 0]} b={[0, -1.4]} w={0.3} f={PAL.gold} c={c} />
			{[-0.9, -0.5, -0.1, 0.3, 0.7].map((bx, i) => <path key={i} d={poly([[bx - 0.15, -1.45], [bx + 0.15, -1.45], [bx, -3.2 + (i % 2) * 0.4]])} fill={S61.bread} stroke={PAL.ink} strokeWidth={c.LW * 0.8} />)}
		</g>
		{/* drum roll + niche with the ka light */}
		<Sd d={sps([[-1.3, -h + 6.3, 1], [1.3, -h + 6.3, 1], [1.35, -h + 6.75], [1.3, -h + 7.2, 1], [-1.3, -h + 7.2, 1], [-1.35, -h + 6.75]], 0.3)} f={red ? '#C46A48' : S61.stone2} c={c} />
		<rect x={-0.9} y={-h + 7.2} width={1.8} height={h - 7.2} fill="#1B0F0C" />
		<ellipse cx={0} cy={-(h - 7.2) * 0.45} rx={1.4} ry={(h - 7.2) * 0.55} fill="url(#g60-gold)" opacity={k} style={{mixBlendMode: 'screen'}} />
		<TorusV x={-w / 2 + 0.15} y0={0} y1={-h + 1.6} c={c} /><TorusV x={w / 2 - 0.15} y0={0} y1={-h + 1.6} c={c} />
		<Cornice x0={-w / 2} x1={w / 2} y={-h + 1.6} h={1.6} c={c} flare={0.45} />
	</g>;
};

/* ---------------- tomb facade (Deir el-Medina type chapel) ---------------- */
/** a rock-cut tomb chapel: the cliff behind, a forecourt wall with its gate, the mud-brick chapel crowned by a small steep pyramid with a
    white-limestone pyramidion and a stela niche; a lamp burns in the niche (t). Origin = ground centre; about 22 wide, 16 tall */
export const TombFacade: React.FC<SetP> = ({x, y, s, t = 0}) => {
	const c = ck(s), f = flick(t, 7);
	return <g transform={at(x, y, s)}>
		{/* cliff */}
		<Sd d={sps([[-13, 0, 1], [13, 0, 1], [13, -11.5], [9.6, -12.8], [6.0, -12.0], [2.4, -14.6], [-2.8, -13.8], [-6.6, -15.4], [-10.4, -13.2], [-13, -13.6]], 0.2)} f={S61.sand2} c={c} />
		{[[-11, -11], [-5, -12.6], [3, -12.2], [9, -10.4]].map(([a, b], i) => <path key={i} d={`M${a} ${b}l2.6 0.8l2.0 -0.3`} fill="none" stroke={S61.sand3} strokeWidth={c.LW * 1.6} />)}
		{/* rock-cut doorway in the cliff */}
		<Sd d={rect(-9.6, -6.0, -6.8, 0)} f={S61.sand3} c={c} /><rect x={-9.0} y={-5.4} width={1.6} height={5.4} fill="#1B120C" />
		{/* forecourt wall */}
		<Sd d={rect(-6.2, -3.2, 10.6, 0)} f={S61.stoneHi} c={c} />
		<Sd d={rect(-1.4, -4.4, 1.4, 0)} f={S61.stoneHi} c={c} /><rect x={-0.7} y={-3.4} width={1.4} height={3.4} fill="#2A1A12" />
		{/* chapel + pyramid */}
		<Sd d={rect(2.6, -6.4, 9.4, -3.2)} f={S61.stone} c={c} />
		<Sd d={poly([[3.0, -6.4], [9.0, -6.4], [6.0, -13.4]])} f={S61.stoneHi} c={c} k={1.1} />
		<path d={poly([[6.0, -6.4], [9.0, -6.4], [6.0, -13.4]])} fill={S61.stone2} opacity={0.6} />
		<Sd d={poly([[5.35, -11.9], [6.65, -11.9], [6.0, -13.4]])} f={PAL.white} c={c} />
		<Sd d={sps([[5.1, -7.0, 1], [6.9, -7.0, 1], [6.9, -9.0], [6.0, -9.6], [5.1, -9.0]], 0.3)} f="#2A1A12" c={c} k={0.8} />
		<ellipse cx={6.0} cy={-7.6} rx={1.1} ry={0.9} fill="url(#g60-warm)" opacity={0.6 + 0.15 * f} style={{mixBlendMode: 'screen'}} />
		<circle cx={6.0} cy={-7.45} r={0.16 + 0.03 * f} fill={S61.flame2} />
		{Array.from({length: 4}, (_, i) => <path key={i} d={`M2.6 ${-3.9 - i * 0.65}L9.4 ${-3.9 - i * 0.65}`} stroke={S61.stone3} strokeWidth={c.LW * 0.8} opacity={0.6} />)}
	</g>;
};

/* ---------------- pyramid group ---------------- */
/** the three Giza pyramids with the queens' pyramids, the lit face and the shade face, the middle one keeping its white casing cap;
    heat shimmer drifts over the sand (t). Origin = ground centre; ~60 wide */
export const Pyramids: React.FC<SetP & {k?: number}> = ({x, y, s, t = 0, k = 1}) => {
	const c = ck(s);
	const pyr = (px: number, b: number, h: number, cap = 0, key = '') => <g key={key}>
		<Sd d={poly([[px - b / 2, 0], [px + b / 2, 0], [px, -h]])} f={S61.sand} c={c} k={1.1} />
		<path d={poly([[px + b * 0.08, 0], [px + b / 2, 0], [px, -h]])} fill={S61.sand3} opacity={0.75} />
		{cap > 0 && <path d={poly([[px - b / 2 * cap, -h * (1 - cap)], [px + b / 2 * cap, -h * (1 - cap)], [px, -h]])} fill={S61.stoneHi} stroke={PAL.ink} strokeWidth={c.LW} />}
		{Array.from({length: Math.floor(h / 1.2)}, (_, i) => { const yy = -1.2 * (i + 1), hw = (b / 2) * (1 + yy / h); return yy < -h * (1 - cap) ? null : <path key={i} d={`M${px - hw} ${yy}L${px + hw} ${yy}`} stroke={S61.sand3} strokeWidth={c.LW * 0.6} opacity={0.4} />; })}
	</g>;
	return <g transform={at(x, y, s * k)}>
		{pyr(12, 10, 6.4, 0, 'c')}
		{pyr(-14, 24, 15.6, 0, 'a')}
		{pyr(2, 22.4, 15.0, 0.12, 'b')}
		{[20, 23.2, 26.4].map((px, i) => <g key={i}>{pyr(px, 2.6, 1.8, 0, 'q' + i)}</g>)}
		{Array.from({length: 5}, (_, i) => { const u = ((t * 0.12 + i / 5) % 1); return <path key={'h' + i} d={`M${-28 + u * 8} ${-0.8 - i * 0.7}Q${-10} ${-1.2 - i * 0.7 + 0.3 * Math.sin(t * 2 + i)} ${8} ${-0.8 - i * 0.7}T${30 - u * 6} ${-0.8 - i * 0.7}`} fill="none" stroke="#FFF2D0" strokeWidth={0.22} opacity={0.25 * Math.sin(Math.PI * u)} />; })}
	</g>;
};

/* ---------------- mastaba ---------------- */
/** an Old-Kingdom bench tomb: battered mud-brick walls whitewashed, the niched palace facade, a false-door niche with its offering slab.
    Origin = foot centre; w × h units */
export const Mastaba: React.FC<SetP & {w?: number; h?: number}> = ({x, y, s, w = 18, h = 5.2}) => {
	const c = ck(s), bat = h * 0.18;
	return <g transform={at(x, y, s)}>
		<Sd d={poly([[-w / 2, 0], [w / 2, 0], [w / 2 - bat, -h], [-w / 2 + bat, -h]])} f={S61.stoneHi} c={c} k={1.1} />
		{Array.from({length: Math.round(w / 1.5)}, (_, i) => { const px = -w / 2 + 1.2 + i * 1.5; return px > w / 2 - 1.2 ? null : <path key={i} d={rect(px, -h + 0.7, px + 0.55, -0.1)} fill={S61.stone2} opacity={0.8} />; })}
		{Array.from({length: 6}, (_, i) => <path key={'b' + i} d={`M${-w / 2 + bat * (i + 1) / 7} ${-(i + 1) * h / 7}L${w / 2 - bat * (i + 1) / 7} ${-(i + 1) * h / 7}`} stroke={S61.stone3} strokeWidth={c.LW * 0.6} opacity={0.35} />)}
		<Sd d={rect(-1.6, -h + 0.5, 1.6, 0)} f={'#B4583A'} c={c} />
		<rect x={-0.55} y={-h + 1.6} width={1.1} height={h - 1.6} fill="#1B0F0C" />
		<Sd d={rect(-1.4, -0.45, 1.4, 0)} f={S61.stone} c={c} k={0.8} />
		<path d={poly([[-0.3, -0.45], [0.3, -0.45], [0, -0.9]])} fill={S61.bread} stroke={PAL.ink} strokeWidth={c.LW} />
		<Sd d={rect(-w / 2 + bat - 0.2, -h - 0.3, w / 2 - bat + 0.2, -h)} f={S61.stone2} c={c} k={0.8} />
	</g>;
};

/* ---------------- palace window of appearances ---------------- */
/** the palace front where the king shows himself and throws gold collars: a balcony window between slender papyrus columns, a cushion
    over the sill with its fringe swaying (t), the cavetto cornice with the uraeus frieze, the rekhyt-bird dado below. Origin = foot centre; ~16 × 18 */
export const WindowOfAppearances: React.FC<SetP> = ({x, y, s, t = 0}) => {
	const c = ck(s), sill = -8.4, wtop = -15.4;
	return <g transform={at(x, y, s)}>
		<Sd d={rect(-8, -16.2, 8, 0)} f={S61.stone} c={c} k={1.1} />
		{/* palace-facade niches on the wall */}
		{[-6.6, -5.0, 3.8, 5.4].map((px) => <path key={px} d={rect(px, -15.2, px + 1.0, -0.6)} fill={S61.stone2} opacity={0.75} />)}
		{/* window opening with two slender columns */}
		<rect x={-3.6} y={wtop} width={7.2} height={sill - wtop} fill="#1A1414" />
		{[-2.6, 2.6].map((px) => <g key={px}><Rod a={[px, sill]} b={[px, wtop + 1.3]} w={0.55} f={PAL.green} c={c} />
			<Sd d={sps([[px - 0.35, wtop + 1.4, 1], [px + 0.35, wtop + 1.4, 1], [px + 0.95, wtop + 0.2], [px - 0.95, wtop + 0.2]], 0.2)} f={PAL.green} c={c} k={0.7} /></g>)}
		<Cornice x0={-3.9} x1={3.9} y={wtop} h={1.2} c={c} flare={0.4} />
		{/* balcony sill with the cushion and its hanging cloth */}
		<Sd d={rect(-4.6, sill, 4.6, sill + 0.8)} f={S61.stoneHi} c={c} />
		<Sd d={sps([[-4.0, sill, 1], [4.0, sill, 1], [3.9, sill - 0.6], [-3.9, sill - 0.6]], 0.3)} f={PAL.red} c={c} k={0.8} />
		{Array.from({length: 9}, (_, i) => { const px = -3.6 + i * 0.9, sw = 0.25 * Math.sin(t * 2.1 + i * 0.8); return <Sd key={i} d={poly([[px - 0.35, sill + 0.8], [px + 0.35, sill + 0.8], [px + 0.3 + sw, sill + 3.0], [px - 0.3 + sw, sill + 3.0]])} f={i % 2 ? PAL.blue : PAL.gold} c={c} k={0.6} />; })}
		{/* rekhyt (lapwing) frieze: the people adoring */}
		{Array.from({length: 7}, (_, i) => { const px = -6 + i * 2; return <g key={'r' + i} transform={`translate(${px},-2.6)`}>
			<Sd d={sps([[-0.6, 0.6], [0.4, 0.6], [0.7, 0.1], [0.5, -0.6], [0.1, -0.9], [-0.5, -0.6], [-0.8, 0.0]], 0.25)} f={PAL.blue} c={c} k={0.5} />
			<path d="M0.2 -0.6Q0.9 -1.6 1.4 -1.2M0.2 -0.6Q-0.2 -1.7 0.3 -2.0" fill="none" stroke={PAL.ink} strokeWidth={c.LW * 1.2} /><circle cx={0.35} cy={-0.95} r={0.3} fill={PAL.blue} stroke={PAL.ink} strokeWidth={c.LW * 0.8} /></g>; })}
		<Cornice x0={-8} x1={8} y={-16.2} h={2.0} c={c} flare={0.6} />
		{Array.from({length: 13}, (_, i) => { const ux = -7.2 + i * 1.2, uy = -18.4; return <g key={'u' + i}><Sd d={sps([[ux - 0.25, uy, 1], [ux + 0.25, uy, 1], [ux + 0.22, uy - 0.5], [ux + 0.3, uy - 0.85], [ux, uy - 1.0], [ux - 0.26, uy - 0.8], [ux - 0.2, uy - 0.45]], 0.2)} f={PAL.gold} c={c} k={0.6} />
			<circle cx={ux} cy={uy - 1.2} r={0.18} fill={PAL.red} stroke={PAL.ink} strokeWidth={c.LW * 0.7} /></g>; })}
	</g>;
};
export const _archKeep = {Ln};
