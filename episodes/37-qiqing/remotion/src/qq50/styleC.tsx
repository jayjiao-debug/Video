import React from 'react';
import {stringPath, strandD, ticksD, furrows, treeD} from './kit50';
import {W, H, Theme, Subs, Stamp, Counter, Seal, Glyph, COMP_C, cowrie, bubi, spade, qrCells, Jiaozi, Walker, bentWalk, jointAt, grounded, shop, seg, ease, eio, eout, land, lerp, cl, rnd, typed, KAI} from './kit50';
/* LOOK C 「铸」 — cast bronze. The film is one bronze plate: everything is cast in relief and lit by a single raking
   light that moves (the light is computed from the relief every frame, so depth and gloss change as it travels).
   Depth = relief height (far = low and dark, near = high and polished); recesses keep green patina; borders are
   云雷纹. Things appear by being poured (molten glow → cooling → lit metal). Metal-cold is polished steel; the money
   is fresh-cast gold glow — the episode accent. People are low-relief figures, polished where they stand forward. */
export const C = {plate: '#4A3422', plate2: '#2E2117', pat: '#4F8A7A', patL: '#7DB5A3', bron: '#8E6738', bronL: '#C8955A', far: '#5C4229', mid: '#7A5732', steel: '#A8B6BD', hot: '#FFB347', hotL: '#FFF1BE', hotD: '#EE7F22', iron: '#4A4744', cream: '#F4E6C8'};
export const thC: Theme = {ink: '#FFF5E2', key: C.hot, rule: C.hot, dim: 0.78, pool: 'rgba(16,10,6,A)', poolA: 0.42,
	halo: '0 0 2px rgba(16,10,6,0.95), 0 2px 8px rgba(16,10,6,0.75), 0 2px 22px rgba(16,10,6,0.6)'};

/** relief lighting: height = blurred alpha; diffuse multiplies the albedo, specular adds gloss; one distant light (az, el) */
const Relief: React.FC<{id: string; az: number; el?: number; blur: number; z: number; gloss?: number; sh?: number}> = ({id, az, el = 38, blur, z, gloss = 0.6, sh = 6}) => {
	const dx = -Math.cos(az * Math.PI / 180) * sh, dy = -Math.sin(az * Math.PI / 180) * sh;
	return <filter id={id} filterUnits="userSpaceOnUse" x={-W} y={-H} width={3 * W} height={3 * H} colorInterpolationFilters="sRGB">
		<feGaussianBlur in="SourceAlpha" stdDeviation={blur} result="hb" />
		<feDiffuseLighting in="hb" surfaceScale={z} diffuseConstant={1.25} lightingColor="#FFEBD0" result="dif"><feDistantLight azimuth={az} elevation={el} /></feDiffuseLighting>
		<feSpecularLighting in="hb" surfaceScale={z} specularConstant={gloss} specularExponent={18} lightingColor="#FFF4DC" result="spe"><feDistantLight azimuth={az} elevation={el + 6} /></feSpecularLighting>
		<feComposite in="SourceGraphic" in2="dif" operator="arithmetic" k1={1.35} k2={0} k3={0} k4={0} result="lit" />
		<feComposite in="spe" in2="SourceAlpha" operator="in" result="spe2" />
		<feComposite in="lit" in2="spe2" operator="arithmetic" k1={0} k2={1} k3={0.7} k4={0} result="sum" />
		<feComposite in="sum" in2="SourceAlpha" operator="in" result="obj" />
		<feGaussianBlur in="SourceAlpha" stdDeviation={sh * 0.6} result="sb" /><feOffset in="sb" dx={dx} dy={dy} result="so" />
		<feColorMatrix in="so" values="0 0 0 0 0.09  0 0 0 0 0.2  0 0 0 0 0.17  0 0 0 0.7 0" result="shadow" />
		<feMerge><feMergeNode in="shadow" /><feMergeNode in="obj" /></feMerge>
	</filter>;
};
/** the plate: bronze albedo with patina blooms, a hammered surface lit by the same light */
const Plate: React.FC<{az: number; id: string}> = ({az, id}) => <g>
	<defs>
		<filter id={`pt${id}`} filterUnits="userSpaceOnUse" x={0} y={0} width={W} height={H} colorInterpolationFilters="sRGB">
			<feTurbulence type="fractalNoise" baseFrequency="0.006" numOctaves={4} seed={12} result="n" />
			<feFlood floodColor={C.plate} result="alb" />
			<feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={3} seed={3} result="hm" />
			<feDiffuseLighting in="hm" surfaceScale={2.2} diffuseConstant={1.3} lightingColor="#FFE9CC" result="dif"><feDistantLight azimuth={az} elevation={42} /></feDiffuseLighting>
			<feComposite in="alb" in2="dif" operator="arithmetic" k1={1.25} k2={0} k3={0} k4={0} />
		</filter>
		<radialGradient id={`pv${id}`} cx="0.42" cy="0.4" r="0.85"><stop offset="0" stopColor="#FFD9A0" stopOpacity="0.16" /><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.45" /></radialGradient>
	</defs>
	<rect width={W} height={H} filter={`url(#pt${id})`} />
	<defs><filter id={`pn${id}`} x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves={4} seed={7} />
		<feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.52  0 0 0 0 0.45  3 0 0 0 -1.2" /></filter>
		<radialGradient id={`pm${id}`} cx="0.5" cy="0.5" r="0.72"><stop offset="0.62" stopColor="#000" /><stop offset="1" stopColor="#fff" /></radialGradient>
		<mask id={`pk${id}`}><rect width={W} height={H} fill={`url(#pm${id})`} /></mask></defs>
	<rect width={W} height={H} filter={`url(#pn${id})`} mask={`url(#pk${id})`} opacity={0.55} />
	<rect width={W} height={H} fill={`url(#pv${id})`} />
</g>;
/** 云雷纹 band: square spirals in a row, cast in low relief */
const LeiBand: React.FC<{y: number; x0: number; x1: number; flt: string}> = ({y, x0, x1, flt}) => { const n = Math.floor((x1 - x0) / 52);
	const sp = (x: number, dir: number) => { const s = 40, P = (a: number, b: number) => `${x + (dir > 0 ? a : s - a)},${y + 6 + b}`;
		return `M${P(0, 0)}L${P(s, 0)}L${P(s, s)}L${P(8, s)}L${P(8, 8)}L${P(s - 8, 8)}L${P(s - 8, s - 8)}L${P(16, s - 8)}L${P(16, 16)}L${P(s - 16, 16)}`; };
	return <g filter={`url(#${flt})`}>
		<rect x={x0} y={y - 4} width={x1 - x0} height={5} fill={C.bron} /><rect x={x0} y={y + 51} width={x1 - x0} height={5} fill={C.bron} />
		<path d={Array.from({length: n}, (_, i) => sp(x0 + 6 + i * 52, i % 2 ? -1 : 1)).join(' ')} fill="none" stroke={C.bron} strokeWidth={5} />
	</g>; };
/** molten metal: emissive, glow kept inside the shape */
const HotDefs: React.FC = () => <defs>
	<linearGradient id="hotG" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stopColor="#FFFBE6" /><stop offset="0.35" stopColor={C.hotL} /><stop offset="0.7" stopColor={C.hot} /><stop offset="1" stopColor={C.hotD} /></linearGradient>
	<linearGradient id="steelG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7F8E96" /><stop offset="0.46" stopColor="#C9D5DA" /><stop offset="0.52" stopColor="#FFFFFF" /><stop offset="0.6" stopColor="#B5C2C8" /><stop offset="1" stopColor="#68757C" /></linearGradient>
	<filter id="hotIn" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur in="SourceAlpha" stdDeviation={8} result="b" /><feComposite in="SourceAlpha" in2="b" operator="arithmetic" k2={1} k3={-1} result="rim" />
		<feFlood floodColor="#FFF6D8" /><feComposite in2="rim" operator="in" result="core" /><feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="core" /></feMerge></filter>
	<filter id="cS" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="6" dy="12" stdDeviation="9" floodColor="#120A04" floodOpacity="0.6" /></filter>
</defs>;

/* ---------- C1: the hook ---------- */
const CH = ['财', '货', '贵', '钱'], CX = [236, 566, 896, 1290], CY = 410, CS = 300;
const Cowrie: React.FC<{x: number; y: number; L: number; rot?: number; o?: number; cool?: number}> = ({x, y, L, rot = 0, o = 1}) => { const c = cowrie(L);
	return <g transform={`translate(${x},${y}) rotate(${rot})`} opacity={o} filter="url(#hotIn)">
		<path d={c.body} fill="url(#hotG)" /><path d={c.body} fill="none" stroke="#B4500F" strokeWidth={L * 0.03} opacity={0.6} /><path d={c.slit} fill="#7A3008" /><path d={c.teeth} stroke="#FFE7A8" strokeWidth={L * 0.025} strokeLinecap="round" />
	</g>; };
const REST = [[640, 858, -8], [745, 862, 6], [835, 856, -3]];
export const HookC: React.FC<{t: number}> = ({t}) => {
	const r1 = '财、货、贵，都带个"贝"，', r2 = '偏偏"钱"，是[金]字旁。';
	const az = 215 + 14 * t, cam = 1 + 0.02 * ease(seg(t, 0, 4));
	return <>
		<svg width={W} height={H} style={{position: 'absolute'}}>
			<HotDefs />
			<defs><Relief id="rHi" az={az} blur={4} z={7} gloss={0.75} sh={8} /><Relief id="rLo" az={az} blur={2.2} z={3} gloss={0.4} sh={3} /><Relief id="rQr" az={az} blur={1} z={2} gloss={0.3} sh={1.5} /></defs>
			<Plate az={az} id="h" />
			<g transform={`translate(960,560) scale(${cam}) translate(-960,-560)`}>
				<LeiBand y={344} x0={150} x1={1640} flt="rLo" />
				{/* 2026, the stall: a cast counter, a code plaque and the phone, low relief */}
				<g filter="url(#rLo)"><rect x={540} y={880} width={860} height={110} fill={C.far} /><rect x={540} y={880} width={860} height={8} fill={C.bronL} />
					<rect x={1112} y={770} width={112} height={112} rx={6} fill={C.bronL} /></g>
				<g filter="url(#rQr)" transform="translate(1124,782)"><path d={qrCells(22, 4).map(([j, i]) => `M${j * 4},${i * 4}h4.2v4.2h-4.2z`).join('')} fill={C.plate2} />
					{[[0, 0], [0, 15], [15, 0]].map(([i, j]) => <path key={`${i}${j}`} d={`M${j * 4},${i * 4}h28v28h-28z M${j * 4 + 4},${i * 4 + 4}v20h20v-20z M${j * 4 + 8},${i * 4 + 8}h12v12h-12z`} fill={C.plate2} fillRule="evenodd" />)}</g>
				<g transform="translate(925,770) rotate(-7)">
					<g filter="url(#rHi)"><rect x={0} y={0} width={96} height={180} rx={15} fill={C.bron} /></g>
					<rect x={8} y={14} width={80} height={150} rx={7} fill="#2B2722" />
					<circle cx={48} cy={82} r={26} fill="none" stroke={C.hot} strokeWidth={5} opacity={seg(t, 0.15, 0.35)} />
					<path d="M35,82 l9,10 l18,-21" fill="none" stroke={C.hotL} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" opacity={seg(t, 0.2, 0.4)} />
				</g>
				{CH.map((ch, i) => { const a = 0.12 + i * 0.32, k = land(seg(t, a, a + 0.5)), x = CX[i], s = CS;
					if (k <= 0) return null;
					const sc = lerp(1.18, 1, k), op = cl(k * 3), isQ = ch === '钱', [ccx] = COMP_C[ch];
					return <g key={ch} opacity={op} transform={`translate(${x + s / 2},${CY + s / 2}) scale(${sc}) translate(${-x - s / 2},${-CY - s / 2})`}>
						<g filter="url(#rHi)"><Glyph ch={ch} x={x} y={CY} s={s} part="rest" id={`c${i}`} fill={C.bron} /></g>
						{!isQ && <g filter="url(#rLo)" opacity={seg(t, 0.75 + i * 0.2, 1.05 + i * 0.2)}><Glyph ch={ch} x={x} y={CY} s={s} part="comp" id={`cg${i}`} fill={C.plate2} /></g>}
						{isQ && (t > 1.35
							? <g filter="url(#rHi)"><Glyph ch={ch} x={x} y={CY} s={s} part="comp" id="cq" fill="url(#steelG)" /></g>
							: <g filter="url(#rHi)"><Glyph ch={ch} x={x} y={CY} s={s} part="comp" id="cq0" fill={C.bron} /></g>)}
						{isQ && t > 1.35 && <path d={`M${x + ccx * s + 62},${CY + 62} l7,-22 l7,22 l22,7 l-22,7 l-7,22 l-7,-22 l-22,-7 Z`} fill="#FFFFFF" opacity={Math.sin(Math.PI * seg(t, 1.35, 2.7)) * 0.95} />}
					</g>; })}
				{/* each 贝 re-melts: it glows molten (the money's accent), rises out of the plate, becomes a cowrie and drops onto the counter */}
				{[0, 1, 2].map((i) => { const a = 0.55 + 0.2 * i, x = CX[i], s = CS, ch = CH[i], [ccx, ccy] = COMP_C[ch], lx = x + ccx * s, ly = CY + ccy * s;
					const hot = seg(t, a, a + 0.2), lk = eio(seg(t, a + 0.15, a + 0.5)), mk = ease(seg(t, a + 0.5, a + 0.85)), dk = seg(t, 2.35 + 0.15 * i, 2.75 + 0.15 * i);
					if (t < 0.12 + i * 0.32) return null;
					const [rx, ry, rr] = REST[i];
					const cxw = lerp(lx, rx, eio(dk)), cyw = lerp(ly - 30, ry, dk * dk) - Math.sin(Math.PI * dk) * 60;
					return <g key={i}>
						{mk < 1 && <g opacity={1 - mk} transform={`translate(${lx},${ly}) translate(${-14 * lk},${-46 * lk}) rotate(${-6 * lk}) scale(${1 + 0.1 * lk - 0.4 * mk}) translate(${-lx},${-ly})`} filter={lk > 0.02 ? 'url(#cS)' : undefined}>
							{hot > 0 ? <g filter="url(#hotIn)"><Glyph ch={ch} x={x} y={CY} s={s} part="comp" id={`cr${i}`} fill="url(#hotG)" /></g>
								: <g filter="url(#rHi)"><Glyph ch={ch} x={x} y={CY} s={s} part="comp" id={`cr${i}`} fill={C.bron} /></g>}
						</g>}
						{mk > 0 && <g filter="url(#cS)"><Cowrie x={cxw} y={cyw} L={lerp(s * 0.5, 118, dk)} rot={lerp(-12, rr, dk)} o={mk} /></g>}
					</g>; })}
			</g>
		</svg>
		<Subs rows={[{s: r1, n: typed(r1, t, 0, 0.5)}, {s: r2, n: typed(r2, t, 1.15, 0.6)}].filter((r, i) => i === 0 || t > 1.15)} th={thC} />
		<Counter year="2026" th={thC} />
		<Seal disc={C.cream} />
	</>;
};

/* ---------- C2: the Song street, cast in three relief depths ---------- */
const IronString: React.FC<{hx: number; hy: number; g: number; sway?: number}> = ({hx, hy, g, sway = 0}) => {
	const pts = stringPath(hx, hy, g, sway), e = pts[pts.length - 1];
	return <g filter="url(#rIron)">
		<g fill="none" strokeLinecap="round" stroke={C.iron}><path d={strandD(pts, -8)} strokeWidth={20} /><path d={strandD(pts, 8)} strokeWidth={20} /></g>
		<path d={ticksD(pts, 15)} stroke="#24221F" strokeWidth={2.5} />
		{[[-6, -16, -18], [16, -20, 8], [36, -14, 22]].map(([dx, dy, r], i) => { const x = e[0] + dx, y = e[1] + dy;
			return <g key={i} transform={`rotate(${r},${x},${y})`}><circle cx={x} cy={y} r={20} fill="#5A5652" stroke="#77716B" strokeWidth={2} /><rect x={x - 6} y={y - 6} width={12} height={12} fill="#2A2622" /></g>; })}
	</g>;
};
export const SongC: React.FC<{t: number}> = ({t}) => {
	const g = 905, h = 600, wx = 820 + 34 * t, ph = 0.22 + t / 1.5, sw = Math.sin(t * 4.2), pose = bentWalk(ph, 0.9 + 0.1 * sw);
	const nh = jointAt(pose, 'LHand', wx, g, h), fh = jointAt(pose, 'RHand', wx, g, h);
	const cam = -24 * t, az = 200 + 10 * t;
	const shops = [shop(-160, g - 4, 560, 390), shop(450, g - 4, 520, 360), shop(1080, g - 4, 600, 410), shop(1740, g - 4, 520, 380)];
	const far = Array.from({length: 8}, (_, i) => shop(-260 + i * 330, 560, 300, 120 + 50 * rnd(i, 3)));
	const r1 = '于是有了[交子]：', r2 = '一张纸，能换一千文。';
	return <>
		<svg width={W} height={H} style={{position: 'absolute'}}>
			<HotDefs />
			<defs><Relief id="rFar" az={az} blur={3} z={2} gloss={0.2} sh={2} /><Relief id="rMid" az={az} blur={3} z={4} gloss={0.45} sh={5} />
				<Relief id="rHi" az={az} blur={5} z={8} gloss={0.8} sh={10} /><Relief id="rIron" az={az} blur={3} z={5} gloss={0.5} sh={6} /></defs>
			<Plate az={az} id="s" />
			<g transform={`translate(${cam * 0.25},0)`} filter="url(#rFar)">
				<g fill={C.plate2}>{far.map((s, i) => <path key={i} d={s.roof} />)}
					<path d="M1260,560 V420 H1540 V560 Z M1210,420 Q1320,392 1340,352 H1460 Q1480,392 1590,420 Z M1290,352 Q1370,334 1380,306 H1420 Q1430,334 1510,352 Z" /></g>
			</g>
			<g transform={`translate(${cam * 0.6},0)`}>
				<g filter="url(#rMid)">
					{shops.map((s, i) => <g key={i} fill={C.mid}><path d={s.roof} /><path d={s.posts} /><path d={s.beam} /><path d={s.sign} /><path d={s.counter} />
						<path d={s.tiles} stroke={C.plate2} strokeWidth={3} /><path d={s.shutter} stroke={C.bron} strokeWidth={6} /></g>)}
					{[[255, 560], [700, 575], [1360, 545]].map(([x, y], i) => <g key={i} fill={C.mid}><rect x={x - 1.5} y={y - 44} width={3} height={20} /><ellipse cx={x} cy={y} rx={22} ry={27} /><rect x={x - 12} y={y + 24} width={24} height={8} /></g>)}
					<rect x={1036} y={430} width={8} height={475} fill={C.mid} /><path d="M1044,446 H1122 V650 L1083,628 L1044,650 Z" fill={C.mid} />
					<Walker x={1250} ground={g - 4} h={420} pose={grounded({lean: 6, neck: 12, lt: 2, lk: 2, rt: -3, rk: 3, la: 30, le: 70, ra: 24, re: 74})} col={C.plate2} look={{dress: 'robe', head: 'futou'}} />
					<path d={shops[2].counter} fill={C.mid} />
					{[0, 1, 2, 3].map((i) => <ellipse key={i} cx={1150 + i * 46} cy={g - 4 - 0.3 * 410 - 12} rx={26} ry={13} fill={C.iron} />)}
				</g>
			</g>
			<g filter="url(#rMid)"><rect x={-20} y={g} width={W + 40} height={8} fill={C.bronL} />
				<path d={Array.from({length: 30}, (_, i) => { const x = ((i * 90 + cam) % 2700 + 2700) % 2700 - 300; return `M${x},${g + 30} l45,40 l-45,40 l-45,-40 Z`; }).join(' ')} fill="none" stroke={C.bron} strokeWidth={5} /></g>
			<IronString hx={nh[0]} hy={nh[1]} g={g} sway={sw * 0.3} />
			<g filter="url(#rHi)"><Walker x={wx} ground={g} h={h} pose={pose} col="#A97C46" look={{dress: 'tunic', head: 'futou', legs: 'trousers'}} /></g>
			<g transform={`translate(${fh[0] - 6},${fh[1] - 160}) rotate(${-5 + 2.5 * Math.sin(t * 2)})`} filter="url(#cS)">
				<Jiaozi w={100} h={162} red="#B83A22" ink="#2A211A" paper={C.cream} id="jz" />
				<rect x={0} y={0} width={100} height={162} fill="none" stroke={C.hot} strokeWidth={4} opacity={0.9} />
			</g>
			<g fontFamily={KAI} fontWeight={700} fontSize={46}>
				<text x={fh[0] + 116} y={fh[1] - 74} fill={C.hotL} style={{paintOrder: 'stroke'}} stroke="#1A120A" strokeWidth={6}>一张</text>
				<path d={`M${nh[0] - 170},${g - 24} L${nh[0] - 220},${g - 112}`} stroke={C.cream} strokeWidth={2} opacity={0.7} />
				<text x={nh[0] - 360} y={g - 124} fill={C.cream} stroke="#1A120A" strokeWidth={6} style={{paintOrder: 'stroke'}}>一千文</text>
			</g>
		</svg>
		<Subs rows={[{s: r1}, {s: r2}]} th={thC} />
		<Stamp y="北宋" place="益州" note="一交一缗" th={thC} />
		<Counter era="北宋" th={thC} />
		<Seal disc={C.cream} />
	</>;
};

/* ---------- motion test: 钅 melts → pours into the spade's mould → cools → re-cast as the 布币 ---------- */
export const MorphC: React.FC<{t: number}> = ({t}) => {
	const s = 520, cam = 1 + 0.03 * eio(seg(t, 0, 4)), az = 205 + 30 * t;
	const rest = 1 - ease(seg(t, 0.3, 0.9)), slide = eio(seg(t, 0.3, 0.9)), melt = seg(t, 0.7, 1.2), pour = eio(seg(t, 1.0, 1.75)), cool = seg(t, 1.75, 2.2);
	const qx = lerp(560, 640, slide), qy = lerp(330, 300, slide);
	const shrink = eio(seg(t, 2.2, 2.8)), coinHot = seg(t, 2.35, 2.6), coinCool = seg(t, 2.9, 3.4), hop = seg(t, 3.25, 3.75);
	const sp = spade(400, 260), bb = bubi(470), cx = 960, cy = lerp(720, 640, shrink);
	const r1 = '原来，"钱"是一把[铲子]。', r2 = '东周时，铲子变成了货币，';
	const fillY = lerp(940, 250, pour);
	return <>
		<svg width={W} height={H} style={{position: 'absolute'}}>
			<HotDefs />
			<defs><Relief id="rHi" az={az} blur={5} z={8} gloss={0.85} sh={10} /><Relief id="rLo" az={az} blur={2.2} z={3} gloss={0.4} sh={3} />
				<filter id="mould" filterUnits="userSpaceOnUse" x={-W} y={-H} width={3 * W} height={3 * H}><feGaussianBlur in="SourceAlpha" stdDeviation={4} result="b" /><feDiffuseLighting in="b" surfaceScale={-5} diffuseConstant={1.2} lightingColor="#FFE8C8" result="d"><feDistantLight azimuth={az} elevation={40} /></feDiffuseLighting>
					<feComposite in="SourceGraphic" in2="d" operator="arithmetic" k1={1.3} /><feComposite in2="SourceAlpha" operator="in" /></filter>
				<clipPath id="pourC"><rect x={0} y={fillY} width={W} height={H} /></clipPath></defs>
			<Plate az={az} id="m" />
			<g transform={`translate(960,560) scale(${cam}) translate(-960,-560)`}>
				<LeiBand y={268} x0={240} x1={1640} flt="rLo" />
				<g filter="url(#rLo)" fill={C.far}><path d={treeD(1480, 900, 1.5)} /><path d={treeD(380, 900, 1.1)} /><rect x={-40} y={900} width={W + 80} height={220} />
					<path d={furrows(900)} stroke={C.mid} strokeWidth={8} fill="none" /></g>
				{rest > 0.01 && <g filter="url(#rHi)" opacity={rest}><Glyph ch="钱" x={560} y={330} s={s} part="rest" id="mr" fill={C.bron} /></g>}
				{/* the mould (sunk into the plate) */}
				<g opacity={seg(t, 0.4, 0.8) * (1 - shrink)} transform={`translate(${cx},${cy})`} filter="url(#mould)"><path d={sp.blade} fill={C.plate2} /><path d={sp.handle} fill={C.plate2} /></g>
				{/* 钅: steel → glowing → drains away as it pours */}
				{melt < 1 && <g opacity={1 - ease(seg(t, 0.95, 1.3))} transform={`translate(${qx + 130},${qy + 260}) scale(${1 - 0.25 * melt},${1 - 0.4 * melt}) translate(${-qx - 130},${-qy - 260})`}>
					{melt <= 0 ? <g filter="url(#rHi)"><Glyph ch="钱" x={qx} y={qy} s={s} part="comp" id="mq" fill="url(#steelG)" /></g>
						: <g filter="url(#hotIn)"><Glyph ch="钱" x={qx} y={qy} s={s} part="comp" id="mqh" fill="url(#hotG)" /></g>}
				</g>}
				{pour > 0 && pour < 1 && <path d={`M${qx + 150},${qy + 330} C${qx + 200},${qy + 400} ${cx - 40},${cy - 330} ${cx},${cy - 300}`} stroke="url(#hotG)" strokeWidth={10 + 18 * Math.min(1, 3 * Math.sin(Math.PI * pour))} fill="none" strokeLinecap="round" />}
				{/* the spade fills from the bottom, then cools into lit metal */}
				<g transform={`translate(${cx},${cy}) scale(${lerp(1, 0.96, shrink)})`} opacity={1 - shrink}>
					<g clipPath="url(#pourC)" transform={`translate(${-cx},${-cy})`}><g transform={`translate(${cx},${cy})`}>
						<g opacity={1 - cool} filter="url(#hotIn)"><path d={sp.blade} fill="url(#hotG)" /><path d={sp.handle} fill="url(#hotG)" /></g>
						<g opacity={cool} filter="url(#rHi)"><path d={sp.blade} fill={C.bron} /><path d={sp.handle} fill={C.far} /></g>
					</g></g>
				</g>
				{/* re-cast: the spade glows again, shrinks into the coin, and cools to polished gold (the accent) */}
				{shrink > 0 && <g transform={`translate(${cx},${cy})`} opacity={shrink}>
					<g opacity={1 - coinCool} filter="url(#hotIn)"><path d={bb.body} fill="url(#hotG)" /></g>
					<g opacity={coinCool} filter="url(#rHi)"><path d={bb.body} fill="#D9A651" /></g>
					<path d={bb.hole} fill="#2A2018" /><path d={bb.nail} fill="#2A2018" />
					<path d={bb.ribs} stroke={coinCool > 0.5 ? '#8A6430' : C.hotD} strokeWidth={4} fill="none" opacity={0.7} />
				</g>}
				{coinHot > 0 && coinHot < 1 && <circle cx={cx} cy={cy} r={60 + 260 * coinHot} fill="none" stroke={C.hotL} strokeWidth={4} opacity={1 - coinHot} />}
				{hop > 0 && <g transform={`translate(${1260},${lerp(420, 520, eout(hop)) - Math.sin(Math.PI * hop) * 50})`} opacity={cl(hop * 3)}>
					<g filter="url(#rHi)"><rect x={-18} y={-14} width={176} height={176} rx={8} fill={C.far} /></g>
					<Glyph ch="钱" x={0} y={0} s={140} part="rest" id="hr" fill={C.cream} />
					<Glyph ch="钱" x={0} y={0} s={140} part="comp" id="hq" fill="url(#steelG)" />
				</g>}
			</g>
		</svg>
		<Subs rows={[t < 2.05 ? {s: r1} : {s: r2, n: typed(r2, t, 2.05, 0.5)}]} th={thC} />
		<Counter era={t < 2.05 ? '商周' : '东周'} th={thC} />
		<Seal disc={C.cream} />
	</>;
};
