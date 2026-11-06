import React from 'react';
import {PAL, sp, poly, lerp, cl, sm} from '../qq60/geo60';
import {Flame, Smoke, Embers, Dust, Glow} from '../qq60/frame60';
import {SetP, at, ck, S61, Sd, Ln, Rod, rect, sps, starD, phaseOf, wave, rng, flick} from './sets61_kit';
import {FishSchool} from './sets61_animals';

/* ep61 · SET-DRESSING library — NATURE + AMBIENT MOTION. Strips (river, sky, dunes) take x = centre, y = TOP edge (sky: top; river:
   the waterline), w / h in units. Plants and single things: origin = foot centre. */

/* ---------------- the Nile ---------------- */
/** a band of water painted the Egyptian way: lapis with rows of zigzag water lines drifting downstream, ripple rings and sun
    sparkles on top. x = centre, y = waterline, w × h units; flow = units/s (negative flows left). */
export const Nile: React.FC<SetP & {w?: number; h?: number; flow?: number; dark?: boolean; sparkle?: number}> = ({x, y, s, t = 0, w = 60, h = 8, flow = 0.6, dark = false, sparkle = 1}) => {
	const c = ck(s), rows = Math.max(2, Math.round(h / 1.0)), step = 1.3, R = rng(9);
	const lines = Array.from({length: rows}, (_, r) => { const yy = (r + 0.6) * (h / rows), sh = r % 2 ? step / 2 : 0, off = ((t * flow * (1 + r * 0.08)) % step + step) % step; let d = '';
		for (let xx = -w / 2 - step * 2 + off + sh; xx < w / 2 + step; xx += step) d += `${d ? 'L' : 'M'}${xx.toFixed(2)} ${yy.toFixed(2)}L${(xx + step / 2).toFixed(2)} ${(yy - 0.32).toFixed(2)}`;
		return <path key={r} d={d} fill="none" stroke={dark ? '#3D5FA8' : S61.waterHi} strokeWidth={c.LW * 1.4} opacity={(dark ? 0.7 : 0.85) * (1 - r / rows * 0.4)} />; });
	const spark = Array.from({length: Math.round(w * 0.5 * sparkle)}, (_, i) => { const px = -w / 2 + R() * w, py = R() * h * 0.5 + 0.2, ph = R() * 6.28, k = Math.max(0, Math.sin(t * (1.5 + R()) + ph)) ** 6;
		return k < 0.05 ? null : <path key={i} d={`M${px - 0.4 * k} ${py}L${px} ${py - 0.12}L${px + 0.4 * k} ${py}L${px} ${py + 0.12}Z`} fill="#FFF6D8" opacity={k} />; });
	const cid = `nile-${Math.round(x)}-${Math.round(y)}-${Math.round(w * 10)}-${Math.round(s * 10)}`;
	return <g transform={at(x, y, s)}>
		<defs><clipPath id={cid}><rect x={-w / 2} y={-0.5} width={w} height={h + 0.5} /></clipPath></defs>
		<rect x={-w / 2} y={0} width={w} height={h} fill={dark ? 'url(#s61-nun)' : 'url(#s61-water)'} />
		<rect x={-w / 2} y={0} width={w} height={h} fill={dark ? S61.deep : PAL.blue} opacity={0.35} />
		<g clipPath={`url(#${cid})`}>{lines}
		<g style={{mixBlendMode: 'screen'}}>{spark}</g></g>
		<rect x={-w / 2} y={-0.06} width={w} height={0.16} fill={PAL.ink} />
	</g>;
};
/** spreading ripple rings on water (where a fish rose, a bird stepped, an oar dipped): n rings, period p (unit space px via s) */
export const Ripples: React.FC<SetP & {n?: number; p?: number; r?: number; seed?: number}> = ({x, y, s, t = 0, n = 3, p = 2.4, r = 2.4, seed = 0}) => {
	const c = ck(s);
	return <g transform={at(x, y, s)}>{Array.from({length: n}, (_, i) => { const u = (((t + phaseOf(seed, 2) + (i * p) / n) % p) + p) % p / p;
		return <ellipse key={i} cx={0} cy={0} rx={r * u} ry={r * u * 0.22} fill="none" stroke={S61.waterHi} strokeWidth={c.LW * 1.6 * (1 - u)} opacity={0.9 * (1 - u)} />; })}</g>;
};

/* ---------------- papyrus thicket ---------------- */
/** a stand of papyrus: triangular stems with the umbel heads, buds among them, sheath leaves at the base; every stem sways on its own
    phase and the whole stand leans with gusts (t). x = centre of the base, w = width, h = height (units). */
export const PapyrusThicket: React.FC<SetP & {w?: number; h?: number; n?: number; seed?: number; gust?: number}> = ({x, y, s, t = 0, w = 10, h = 14, n = 16, seed = 1, gust = 1}) => {
	const c = ck(s), R = rng(seed), stems = Array.from({length: n}, (_, i) => ({bx: -w / 2 + (i + 0.3 + R() * 0.4) * (w / n), hh: h * (0.62 + R() * 0.4), a: (R() - 0.5) * 18, ph: R() * 6.28, bud: R() < 0.22, dark: R() < 0.5}))
		.sort((a, b) => b.hh - a.hh);
	const g = gust * (2.2 * Math.sin(t * 0.7) + 1.2 * Math.sin(t * 1.9 + 1));
	return <g transform={at(x, y, s)}>
		{stems.map((st, i) => { const a = (st.a + g + 3 * Math.sin(t * 1.3 + st.ph)) * Math.PI / 180, ex = st.bx + Math.sin(a) * st.hh, ey = -Math.cos(a) * st.hh, mx_ = st.bx + Math.sin(a) * st.hh * 0.45;
			const head = st.bud ? sps([[ex - 0.35, ey + 0.2], [ex + 0.35, ey + 0.2], [ex + 0.45, ey - 0.6], [ex, ey - 1.4, 1], [ex - 0.45, ey - 0.6]], 0.22)
				: sps([[ex - 0.14, ey + 0.1, 1], [ex + 0.14, ey + 0.1, 1], [ex + 1.05 + Math.sin(a) * 0.4, ey - 1.3], [ex + Math.sin(a) * 0.4, ey - 1.55], [ex - 1.05 + Math.sin(a) * 0.4, ey - 1.3]], 0.24);
			return <g key={i}>
				<path d={`M${st.bx} 0Q${mx_} ${-st.hh * 0.5} ${ex} ${ey}`} fill="none" stroke={PAL.ink} strokeWidth={0.3 + 2 * c.OW} />
				<path d={`M${st.bx} 0Q${mx_} ${-st.hh * 0.5} ${ex} ${ey}`} fill="none" stroke={st.dark ? S61.leaf2 : PAL.green} strokeWidth={0.3} />
				<Sd d={head} f={st.bud ? S61.leaf3 : st.dark ? S61.leaf2 : PAL.green} c={c} k={0.8} />
				{!st.bud && <path d={`M${ex - 1.0 + Math.sin(a) * 0.4} ${ey - 1.35}Q${ex + Math.sin(a) * 0.4} ${ey - 1.75} ${ex + 1.0 + Math.sin(a) * 0.4} ${ey - 1.35}`} fill="none" stroke={PAL.gold} strokeWidth={c.LW * 1.6} />}
			</g>; })}
		{/* sheaths at the base */}
		{Array.from({length: Math.round(n * 0.8)}, (_, i) => { const bx = -w / 2 + (i + 0.5) * (w / Math.round(n * 0.8)); return <path key={'s' + i} d={poly([[bx - 0.45, 0.05], [bx + 0.45, 0.05], [bx + 0.1 * Math.sin(i), -1.6 - (i % 3) * 0.4]])} fill={i % 2 ? S61.leaf2 : S61.reed} stroke={PAL.ink} strokeWidth={c.LW} />; })}
	</g>;
};

/* ---------------- lotus pond ---------------- */
/** a pond in profile: water with zigzag lines, floating pads, blue and white lotus flowers that open over `cycle` seconds (each on its
    own clock: bud → open → bud), fish gliding beneath. x = centre, y = waterline, w × h units */
export const LotusPond: React.FC<SetP & {w?: number; h?: number; n?: number; cycle?: number; seed?: number; fish?: boolean}> = ({x, y, s, t = 0, w = 20, h = 5, n = 6, cycle = 8, seed = 2, fish = true}) => {
	const c = ck(s), R = rng(seed), items = Array.from({length: n}, (_, i) => ({px: -w / 2 + (i + 0.5) * (w / n) + (R() - 0.5) * 0.8, hh: 1.6 + R() * 2.2, blue: R() < 0.6, ph: R(), sw: R() * 6.28}));
	return <g>
		<Nile x={x} y={y} s={s} t={t} w={w} h={h} flow={0.2} sparkle={0.4} />
		{fish && <FishSchool x={x} y={y + h * 0.6 * s} s={s} t={t} w={w * 0.9} n={3} seed={seed} />}
		<g transform={at(x, y, s)}>
			{items.map((it, i) => <ellipse key={'p' + i} cx={it.px + 0.9} cy={0.05} rx={1.1} ry={0.22} fill={S61.leaf2} stroke={PAL.ink} strokeWidth={c.LW} />)}
			{items.map((it, i) => <LotusFlower key={i} x={it.px} y={0} h={it.hh} open={sm(cl(1.6 * Math.sin(Math.PI * (((t / cycle + it.ph) % 1))) - 0.2))} sway={4 * Math.sin(t * 1.1 + it.sw)} blue={it.blue} c={c} />)}
		</g>
	</g>;
};
/** one lotus on its stalk (unit space): open 0 = bud, 1 = fully open */
export const LotusFlower: React.FC<{x: number; y: number; h: number; open: number; sway?: number; blue?: boolean; c: ReturnType<typeof ck>}> = ({x, y, h, open, sway = 0, blue = true, c}) => {
	const a = sway * Math.PI / 180, ex = x + Math.sin(a) * h, ey = y - Math.cos(a) * h, sp_ = lerp(0.12, 0.85, open), ph = lerp(1.2, 0.95, open);
	const pet = (k: number) => { const aa = k * sp_ * 38 * Math.PI / 180; return sps([[ex, ey, 1], [ex + Math.sin(aa) * 0.5 + 0.25, ey - 0.35], [ex + Math.sin(aa) * ph, ey - Math.cos(aa) * ph, 1], [ex + Math.sin(aa) * 0.5 - 0.25, ey - 0.35]], 0.2); };
	return <g transform={`rotate(0)`}>
		<path d={`M${x} ${y}Q${x + Math.sin(a) * h * 0.4} ${y - h * 0.5} ${ex} ${ey}`} fill="none" stroke={PAL.green} strokeWidth={0.16} />
		{[-2, 2, -1, 1, 0].map((k) => <Sd key={k} d={pet(k)} f={Math.abs(k) === 2 ? S61.leaf3 : blue ? S61.lotusB : S61.lotus} c={c} k={0.6} />)}
	</g>;
};

/* ---------------- date palm ---------------- */
/** a date palm: scaled trunk leaning a little, a crown of fronds tossing in the wind, two bunches of red dates. Origin = foot; h = height */
export const DatePalm: React.FC<SetP & {h?: number; seed?: number; lean?: number}> = ({x, y, s, t = 0, h = 16, seed = 0, lean = 0.06}) => {
	const c = ck(s), ph = phaseOf(seed, 9), sw = 0.35 * Math.sin(t * 0.8 + ph), tx = h * lean + sw, ty = -h;
	const trunk = sps([[-0.6, 0, 1], [0.6, 0, 1], [0.42 + tx * 0.5, -h * 0.5], [tx + 0.32, ty, 1], [tx - 0.32, ty, 1], [-0.42 + tx * 0.5, -h * 0.5]], 0.18);
	const fr = [-165, -140, -112, -86, -62, -36, -12, 12].map((a0, i) => { const a = (a0 + 6 * Math.sin(t * 1.3 + i * 0.9 + ph)) * Math.PI / 180, L = h * (0.36 + 0.06 * Math.sin(i * 2.3)), ex = tx + Math.cos(a) * L, ey = ty + Math.sin(a) * L * 0.6 + L * 0.32;
		const mx_ = tx + Math.cos(a) * L * 0.5, my = ty + Math.sin(a) * L * 0.45 - 0.4, nx = -Math.sin(a), ny = Math.cos(a) * 0.6;
		const lf = Array.from({length: 7}, (_, k) => { const u = (k + 1) / 8, px = lerp(lerp(tx, mx_, u), lerp(mx_, ex, u), u), py = lerp(lerp(ty, my, u), lerp(my, ey, u), u);
			return `M${px} ${py}l${nx * 0.9 + 0.15} ${ny * 0.9 + 0.5}M${px} ${py}l${-nx * 0.9 + 0.15} ${-ny * 0.9 + 0.5}`; }).join('');
		return <g key={i}><path d={lf} stroke={i % 2 ? PAL.green : S61.leaf2} strokeWidth={0.26} strokeLinecap="round" />
			<path d={`M${tx} ${ty}Q${mx_} ${my} ${ex} ${ey}`} fill="none" stroke={PAL.ink} strokeWidth={c.LW * 1.6} /></g>; });
	return <g transform={at(x, y, s)}>
		<Sd d={trunk} f="#9A6A3A" c={c} />
		{Array.from({length: Math.floor(h / 0.75)}, (_, i) => { const yy = -0.5 - i * 0.75, u = -yy / h, xx = tx * u * u * 0.6 + tx * u * 0.4, ww = lerp(0.55, 0.32, u); return <path key={i} d={`M${xx - ww} ${yy}L${xx} ${yy - 0.3}L${xx + ww} ${yy}`} fill="none" stroke="#6A4626" strokeWidth={c.LW * 1.2} />; })}
		{fr}
		{[-1, 1].map((sg) => <g key={sg}>{[0, 1, 2, 3, 4, 5].map((k) => <circle key={k} cx={tx + sg * (0.5 + (k % 2) * 0.32)} cy={ty + 0.5 + k * 0.3} r={0.22} fill={PAL.red} stroke={PAL.ink} strokeWidth={c.LW * 0.7} />)}</g>)}
	</g>;
};

/* ---------------- desert dunes ---------------- */
/** three layers of dunes (far, mid, near), the crest sand streaming off in the wind (t). x = centre, y = ground line (bottom), w units; h = height of the far crest */
export const Dunes: React.FC<SetP & {w?: number; h?: number; seed?: number; wind?: number}> = ({x, y, s, t = 0, w = 60, h = 9, seed = 3, wind = 1}) => {
	const c = ck(s), R = rng(seed);
	const layer = (k: number, f: string, hh: number, n: number) => { const pts: [number, number][] = [[-w / 2 - 2, 0]];
		for (let i = 0; i <= n; i++) pts.push([-w / 2 + (i / n) * w, -hh * (0.45 + 0.55 * Math.abs(Math.sin(i * 1.7 + k * 2.1 + R() * 0.6)))]);
		pts.push([w / 2 + 2, 0]);
		const crest = pts.slice(1, -1);
		return {d: sp(pts.map((p, i) => (i === 0 || i === pts.length - 1 ? [p[0], p[1], 1] : p)) as never, true, 0.22), f, crest}; };
	const L = [layer(0, S61.sand2, h, 5), layer(1, S61.sand, h * 0.7, 4), layer(2, '#EBCB8A', h * 0.42, 3)];
	return <g transform={at(x, y, s)}>
		{L.map((l, i) => <g key={i}><Sd d={l.d} f={l.f} c={c} />
			{l.crest.map(([cx_, cy], j) => { const u = ((t * 0.6 * wind + j * 0.37 + i * 0.21) % 1); return <path key={j} d={`M${cx_} ${cy}q${1.2 + 2.4 * u} ${-0.25 - 0.3 * u} ${2.6 + 3.4 * u} ${0.1}`} fill="none" stroke="#FFF1CE" strokeWidth={0.12} opacity={0.6 * Math.sin(Math.PI * u) * wind} />; })}
			{l.crest.slice(0, -1).map(([cx_, cy], j) => <path key={'r' + j} d={`M${cx_ + 0.6} ${cy + 0.8}q2 0.3 3.2 1.2`} fill="none" stroke={S61.sand3} strokeWidth={c.LW} opacity={0.5} />)}</g>)}
	</g>;
};

/* ---------------- night sky ---------------- */
/** a night sky: deep-blue gradient, five-pointed Egyptian stars (sba) that twinkle, small dot stars, now and then a shooting star.
    x = centre, y = top, w × h units */
export const NightSky: React.FC<SetP & {w?: number; h?: number; n?: number; seed?: number; meteor?: boolean}> = ({x, y, s, t = 0, w = 60, h = 24, n = 70, seed = 4, meteor = true}) => {
	const R = rng(seed), mu = ((t % 7) / 7), mx_ = -w * 0.3 + mu * w * 0.5, my = h * 0.15 + mu * h * 0.25;
	return <g transform={at(x, y, s)}>
		<rect x={-w / 2} y={0} width={w} height={h} fill="url(#s61-night)" />
		{Array.from({length: n}, (_, i) => { const px = -w / 2 + R() * w, py = R() * h * 0.95, big = R() < 0.3, r = big ? 0.35 + R() * 0.3 : 0.08 + R() * 0.08, tw = 0.45 + 0.55 * Math.abs(Math.sin(t * (0.5 + R()) + R() * 6));
			return big ? <path key={i} d={starD(px, py, r)} fill={PAL.star} opacity={tw} /> : <circle key={i} cx={px} cy={py} r={r} fill="#F3E3B0" opacity={tw * 0.85} />; })}
		{meteor && mu < 0.18 && <path d={`M${mx_} ${my}l${-3.5} ${-1.2}`} stroke="#FFF6D8" strokeWidth={0.12} strokeLinecap="round" opacity={Math.sin(Math.PI * mu / 0.18)} />}
	</g>;
};

/* ---------------- sun at the horizon ---------------- */
/** the sun on the horizon between the two hills of the akhet sign, a band sky (dawn / dusk) and the light rays fanning out.
    rise 0..1 (0 = below the horizon, 1 = disc clear); with `auto` the sun rises (mode 'rise') or sets ('set') over 10 s. x = centre, y = horizon line */
export const HorizonSun: React.FC<SetP & {w?: number; h?: number; mode?: 'rise' | 'set'; rise?: number; auto?: boolean; sky?: boolean}> = ({x, y, s, t = 0, w = 60, h = 22, mode = 'set', rise, auto = true, sky = true}) => {
	const c = ck(s), u = rise ?? (auto ? (mode === 'rise' ? cl(0.25 + t / 10) : cl(0.95 - t / 10)) : 0.6), r = 3.2, cy = lerp(r * 0.9, -r * 1.25, u);
	return <g transform={at(x, y, s)}>
		{sky && <rect x={-w / 2} y={-h} width={w} height={h} fill={mode === 'rise' ? 'url(#s61-dawn)' : 'url(#s61-dusk)'} />}
		<ellipse cx={0} cy={cy} rx={r * 6} ry={r * 4} fill="url(#g60-warm)" opacity={0.55 + 0.1 * u} style={{mixBlendMode: 'screen'}} />
		{Array.from({length: 13}, (_, i) => { const a = (-90 + (i - 6) * 13 + 2 * Math.sin(t * 0.5 + i)) * Math.PI / 180; return <path key={i} d={`M${Math.cos(a) * r * 1.4} ${cy + Math.sin(a) * r * 1.4}L${Math.cos(a) * r * 4.2} ${cy + Math.sin(a) * r * 4.2}`} stroke="#FFE8A8" strokeWidth={0.18} opacity={0.35 * u} strokeLinecap="round" />; })}
		<circle cx={0} cy={cy} r={r} fill={mode === 'rise' ? '#F08A2A' : PAL.red} stroke={PAL.ink} strokeWidth={c.OW * 1.5} />
		<circle cx={0} cy={cy} r={r * 0.75} fill="none" stroke={PAL.gold} strokeWidth={c.LW * 2} opacity={0.8} />
		{/* the two hills of the horizon (akhet) */}
		{[-1, 1].map((sg) => <Sd key={sg} d={sps([[sg * 0.6, 0.05, 1], [sg * 11, 0.05, 1], [sg * 9.6, -1.8], [sg * 6.0, -4.8], [sg * 3.2, -4.4], [sg * 1.2, -2.0]], 0.24)} f={S61.sand3} c={c} />)}
		<rect x={-w / 2} y={0} width={w} height={0.3} fill={PAL.ink} />
	</g>;
};

/* ---------------- Nun (the primeval waters) and the benben mound ---------------- */
/** the dark limitless waters before creation: wave lines rolling and curling, faint glints. x = centre, y = top, w × h units */
export const Nun: React.FC<SetP & {w?: number; h?: number; seed?: number}> = ({x, y, s, t = 0, w = 60, h = 14, seed = 6}) => {
	const R = rng(seed), rows = Math.round(h / 1.6);
	const cid = `nun-${Math.round(x)}-${Math.round(y)}-${Math.round(w * 10)}`;
	return <g transform={at(x, y, s)}>
		<defs><clipPath id={cid}><rect x={-w / 2} y={0} width={w} height={h} /></clipPath></defs>
		<rect x={-w / 2} y={0} width={w} height={h} fill="url(#s61-nun)" />
		{Array.from({length: rows}, (_, r) => { const yy = (r + 0.7) * (h / rows), off = Math.sin(t * 0.6 + r) * 1.2 + t * 0.35 * (r % 2 ? 1 : -1), step = 3.2; let d = '';
			for (let xx = -w / 2 - step * 2 + (off % step); xx < w / 2 + step; xx += step) d += `M${xx} ${yy}q${step * 0.25} ${-0.7} ${step * 0.5} 0q${step * 0.12} ${0.35} ${step * 0.3} ${0.05}q-${step * 0.1} -0.35 -${step * 0.05} -0.5`;
			return <path key={r} d={d} fill="none" stroke={r % 2 ? '#3D5FA8' : '#5A7CC8'} strokeWidth={0.14} opacity={0.55 + 0.25 * (r / rows)} clipPath={`url(#${cid})`} />; })}
		{Array.from({length: 26}, (_, i) => { const px = -w / 2 + R() * w, py = R() * h, k = Math.max(0, Math.sin(t * (0.6 + R()) + R() * 6)) ** 8; return <circle key={i} cx={px} cy={py} r={0.12} fill="#BFD8F0" opacity={k * 0.8} />; })}
	</g>;
};
/** the first land rising out of Nun: a mound with the benben stone (a gilded pyramidion) on top that catches the first light; rise 0..1
    (auto: rises over 6 s); water swirls round its foot. Origin = waterline centre */
export const Benben: React.FC<SetP & {rise?: number; auto?: boolean}> = ({x, y, s, t = 0, rise, auto = true}) => {
	const c = ck(s), u = rise ?? (auto ? sm(cl(t / 6)) : 1), lift = lerp(5.5, 0, u), glint = u * (0.7 + 0.3 * wave(t, 3));
	return <g><Ripples x={x} y={y + 0.1 * s} s={s} t={t} n={3} p={3} r={9} /><g transform={at(x, y, s)}>
		<defs><clipPath id={`bb-${Math.round(x)}-${Math.round(y)}`}><rect x={-20} y={-30} width={40} height={30.05} /></clipPath></defs>
		<g clipPath={`url(#bb-${Math.round(x)}-${Math.round(y)})`}><g transform={`translate(0,${lift})`}>
			<Sd d={sps([[-9, 0.6, 1], [9, 0.6, 1], [6.4, -1.6], [3.0, -3.4], [-2.6, -3.5], [-6.6, -1.8]], 0.25)} f={S61.mud} c={c} k={1.1} />
			{[[-4, -2.2], [-1, -2.9], [2.6, -2.5], [5, -1.5]].map(([a, b], i) => <path key={i} d={`M${a} ${b}l1.2 0.3`} stroke={S61.mud2} strokeWidth={c.LW * 1.4} />)}
			<Sd d={poly([[-1.7, -3.3], [1.7, -3.3], [0, -6.8]])} f={PAL.gold} c={c} />
			<path d={poly([[0, -3.3], [1.7, -3.3], [0, -6.8]])} fill={PAL.gold2} opacity={0.7} />
			<circle cx={0} cy={-6.8} r={2.6} fill="url(#g60-gold)" opacity={glint} style={{mixBlendMode: 'screen'}} />
		</g></g>
	</g></g>;
};

/* ---------------- red sky (rage) ---------------- */
/** a sky of blood for Sekhmet / Set: a red-to-orange gradient, torn dark cloud bands racing, a pulse of light (heartbeat). Design choice
    (no object): use for rage beats. x = centre, y = top, w × h units */
export const RedSky: React.FC<SetP & {w?: number; h?: number; seed?: number; pulse?: number}> = ({x, y, s, t = 0, w = 60, h = 24, seed = 8, pulse = 1}) => {
	const R = rng(seed), beat = pulse * (Math.max(0, Math.sin(t * 2 * Math.PI / 1.6)) ** 6);
	return <g transform={at(x, y, s)}>
		<rect x={-w / 2} y={0} width={w} height={h} fill="url(#s61-red)" />
		{Array.from({length: 7}, (_, i) => { const yy = h * (0.08 + i * 0.12), sp_ = 1.6 + R() * 1.6, off = ((t * sp_ + R() * w) % (w + 20)) - 10, ww = 10 + R() * 14;
			return <path key={i} d={sps([[-w / 2 + off, yy], [-w / 2 + off + ww * 0.3, yy - 0.7 - R() * 0.6], [-w / 2 + off + ww * 0.7, yy - 0.4], [-w / 2 + off + ww, yy + 0.1], [-w / 2 + off + ww * 0.5, yy + 0.6]], 0.3)} fill="#3A0806" opacity={0.45 + 0.1 * i / 7} />; })}
		<rect x={-w / 2} y={0} width={w} height={h} fill="#FF4A1E" opacity={beat * 0.18} style={{mixBlendMode: 'screen'}} />
	</g>;
};

/* ---------------- ambient motion (px-space wrappers around the ep60 particles, plus new ones) ---------------- */
/** a flame on a wick / torch (wraps the ep60 Flame): x, y px, s = size factor */
export const FlameFx: React.FC<SetP & {seed?: number; glow?: number}> = ({x, y, s, t = 0, seed = 0, glow = 1}) => <Flame x={x} y={y} s={s} t={t} seed={seed} glow={glow} />;
/** incense smoke: a curling ribbon (three strands, rising, drifting, fading) over the soft ep60 smoke. s = px per unit; h = rise height (units) */
export const SmokeCurl: React.FC<SetP & {h?: number; seed?: number; o?: number; drift?: number; color?: string}> = ({x, y, s, t = 0, h = 9, seed = 1, o = 0.75, drift = 1, color = '#F3EBDD'}) => {
	const strands = [0, 1, 2].map((k) => { const ph = phaseOf(seed * 3 + k, 4), pts: string[] = [];
		for (let i = 0; i <= 26; i++) { const u = i / 26, yy = -u * h, xx = drift * u * u * 1.6 + (0.25 + 0.9 * u) * Math.sin(u * 7 - t * 1.6 + ph) + 0.3 * Math.sin(u * 13 - t * 2.3 + ph * 2) * u;
			pts.push(`${i ? 'L' : 'M'}${(xx).toFixed(3)} ${yy.toFixed(3)}`); }
		return <path key={k} d={pts.join('')} fill="none" stroke={color} strokeWidth={(0.16 - k * 0.03)} strokeLinecap="round" opacity={o * (1 - k * 0.25)} />; });
	return <g>
		{color === '#F3EBDD' && <Smoke t={t} x={x} y={y} n={6} seed={seed + 2} h={h * s * 1.1} s={s / 30} o={0.22} />}
		<g transform={at(x, y, s)}>
			<defs><linearGradient id={`sc-${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity={0} /><stop offset="0.6" stopColor="#fff" stopOpacity={0.9} /><stop offset="1" stopColor="#fff" stopOpacity={1} /></linearGradient>
				<mask id={`scm-${seed}`} maskUnits="userSpaceOnUse" x={-6} y={-h - 1} width={14} height={h + 2}><rect x={-6} y={-h - 1} width={14} height={h + 2} fill={`url(#sc-${seed})`} /></mask></defs>
			<g mask={`url(#scm-${seed})`}>{strands}</g>
		</g>
	</g>;
};
/** dust motes drifting in light (wraps ep60 Dust): box = [x0, y0, x1, y1] px */
export const DustMotes: React.FC<{t?: number; box: [number, number, number, number]; n?: number; seed?: number; o?: number}> = ({t = 0, box, n = 50, seed = 1, o = 0.7}) => <Dust t={t} box={box} n={n} seed={seed} o={o} />;
/** sparks rising from a fire (wraps ep60 Embers) */
export const Sparks: React.FC<SetP & {n?: number; seed?: number; h?: number}> = ({x, y, s, t = 0, n = 12, seed = 2, h = 220}) => <Embers t={t} x={x} y={y} n={n} seed={seed} h={h} s={s} spread={30 * s} />;
/** a flock of birds crossing the sky (dark silhouettes, flapping out of step), flying +x across `w` px every `period` s. x, y = left start (px), s = px per unit */
export const BirdsCrossing: React.FC<SetP & {n?: number; w?: number; period?: number; seed?: number; color?: string}> = ({x, y, s, t = 0, n = 6, w = 1600, period = 14, seed = 5, color = '#2A1912'}) => {
	const R = rng(seed);
	return <g>{Array.from({length: n}, (_, i) => { const ox = R() * 6, oy = (R() - 0.5) * 5, ph = R() * 6.28, sp_ = 0.85 + R() * 0.3, u = (((t / period) * sp_ + R()) % 1), px = x - 100 + u * (w + 200) + ox * s, py = y + oy * s + 0.6 * s * Math.sin(t * 0.8 + ph);
		const f = Math.sin(t * 9 * sp_ + ph), k = s * (0.8 + R() * 0.4);
		return <path key={i} d={`M${px - 1.2 * k} ${py - f * 0.7 * k}Q${px - 0.5 * k} ${py - 0.2 * k - f * 0.3 * k} ${px} ${py}Q${px + 0.5 * k} ${py - 0.2 * k - f * 0.3 * k} ${px + 1.2 * k} ${py - f * 0.7 * k}`} fill="none" stroke={color} strokeWidth={Math.max(1.4, 0.18 * k)} strokeLinecap="round" />; })}</g>;
};
/** glints dancing on water (px box) */
export const WaterShimmer: React.FC<{t?: number; box: [number, number, number, number]; n?: number; seed?: number; o?: number}> = ({t = 0, box, n = 40, seed = 7, o = 0.9}) => {
	const R = rng(seed), [x0, y0, x1, y1] = box;
	return <g style={{mixBlendMode: 'screen'}}>{Array.from({length: n}, (_, i) => { const px = x0 + R() * (x1 - x0) + 8 * Math.sin(t * 0.7 + i), py = y0 + R() * (y1 - y0), ph = R() * 6.28, L = 6 + R() * 14, k = Math.max(0, Math.sin(t * (1.2 + R() * 1.4) + ph)) ** 4;
		return <path key={i} d={`M${px - L / 2} ${py}L${px + L / 2} ${py}`} stroke="#FFF2D0" strokeWidth={2} strokeLinecap="round" opacity={k * o} />; })}</g>;
};
/** shafts of light from a high window / doorway: a fan of n beams from (x, y) px, length L px, slowly breathing, with motes inside */
export const LightShafts: React.FC<SetP & {n?: number; L?: number; spread?: number; a?: number; o?: number; motes?: boolean}> = ({x, y, s, t = 0, n = 3, L = 700, spread = 18, a = 20, o = 0.5, motes = true}) => {
	const beams = Array.from({length: n}, (_, i) => { const aa = (a + (i - (n - 1) / 2) * spread / Math.max(1, n - 1)) * Math.PI / 180, w0 = 14 * s, w1 = 90 * s, ex = x + Math.sin(aa) * L, ey = y + Math.cos(aa) * L, nx = Math.cos(aa), ny = -Math.sin(aa);
		const k = o * (0.75 + 0.25 * Math.sin(t * 0.6 + i * 1.7));
		return <path key={i} d={poly([[x + nx * w0, y + ny * w0], [x - nx * w0, y - ny * w0], [ex - nx * w1, ey - ny * w1], [ex + nx * w1, ey + ny * w1]])} fill="url(#s61-shaft)" opacity={k} style={{mixBlendMode: 'screen'}} />; });
	return <g>{beams}{motes && <Dust t={t} box={[x - L * 0.2, y + 20, x + L * 0.6, y + L * 0.9]} n={30} seed={11} o={0.55} />}</g>;
};
export const _natKeep = {Glow, Ln, Rod, rect, flick};
