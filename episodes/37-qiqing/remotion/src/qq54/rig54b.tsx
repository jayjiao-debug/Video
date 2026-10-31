import React from 'react';
import {Head, Pal, strand, qpts, P, f1} from './cao54b';
import {HEAD, ZE, NECK} from './npc54b';
/* ep54 look B · the walk. One kinematic model drives 曹操 (Cao units, 1 u ≈ 2 mm) and the NPCs (cm).
   Steps: f steps/s; step k plants foot (k mod 2) at P_k = x0 + k·L and holds it there (fixed in world space, so no sliding) while
   the hip moves at constant speed L·f. The swing foot leaves from its heel-off pose behind and lands flat at P_{k+1} on a
   lifted arc. Contact (u = 0): both feet down, the legs spread, the hip low. Passing (u = 0.5): the hip high, the swing foot
   under the hip. Legs are two-bone IK with the knee forward. Arms counter-swing the same-side leg. The robe or tunic skirt and the
   sleeves are built from the leg and arm state a little earlier in time (lag), so they follow through. */
export type Foot = {x: number; y: number; a: number};
export type WalkS = {hipX: number; hipY: number; feet: [Foot, Foot]; fw: [number, number]};
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const ease = (u: number) => u * u * (3 - 2 * u);
/** walk state at time t. L stride (one step), f steps/s, H0 hip height at contact (above the ankle line), bob, lift, toe = toe offset
    from the ankle, ah = ankle height above the sole; y up is negative (screen), the sole line is y = 0, so the ankle line is at −ah */
export const walkAt = (t: number, o: {L: number; f?: number; x0?: number; H0: number; bob: number; lift: number; toe: number; ah: number; dir?: 1 | -1}): WalkS => {
	const f = o.f ?? 2, x0 = o.x0 ?? 0, s = t * f, k = Math.floor(s), u = s - k, L = o.L;
	const Pk = (n: number) => x0 + n * L;
	const hipX = x0 + L * s - L / 2, hipY = -o.ah - o.H0 - o.bob * Math.sin(Math.PI * u) ** 2;
	const stance = ((k % 2) + 2) % 2, sw = 1 - stance;
	/* heel-off in the last 35 % of stance: the foot pivots about the toe */
	const hoff = (pv: number) => 26 * clamp((pv - 0.65) / 0.35, 0, 1) ** 2;
	const pivot = (px: number, deg: number): Foot => { const r = deg * Math.PI / 180, tx = px + o.toe, ty = 0, ax = px - tx, ay = -o.ah - ty;
		return {x: tx + ax * Math.cos(r) - ay * Math.sin(r), y: ty + ax * Math.sin(r) + ay * Math.cos(r) + o.ah, a: deg}; };
	const st = pivot(Pk(k), hoff(u));
	/* the swing foot trails (heel up, shin back) through passing and reaches forward late, as in a real gait */
	const from = pivot(Pk(k - 1), 26), e = ease(u) ** 1.5;
	const swF: Foot = {x: from.x + (Pk(k + 1) - from.x) * e, y: from.y * (1 - e) - o.lift * Math.sin(Math.PI * Math.min(1, u * 1.18)), a: 26 * (1 - u) ** 2 - 12 * Math.sin(Math.PI * clamp((u - 0.55) / 0.45, 0, 1))};
	const feet: [Foot, Foot] = stance === 0 ? [st, swF] : [swF, st];
	const fw: [number, number] = [clamp((feet[0].x - hipX) / (L / 2), -1.3, 1.3), clamp((feet[1].x - hipX) / (L / 2), -1.3, 1.3)];
	return {hipX, hipY, feet, fw};
};
/** two-bone IK, knee toward +x */
export const ik = (hx: number, hy: number, ax: number, ay: number, T: number, S: number): [number, number] => {
	const dx = ax - hx, dy = ay - hy, d = clamp(Math.hypot(dx, dy), 1e-3, T + S - 0.01), th = Math.atan2(dy, dx);
	const al = Math.acos(clamp((T * T + d * d - S * S) / (2 * T * d), -1, 1));
	return [hx + T * Math.cos(th - al), hy + T * Math.sin(th - al)]; };
/** flicker: a flame's own clock (seed) → scale ~1 ± 0.2 and a sway */
export const flick = (t: number, seed: number) => ({s: 1 + 0.11 * Math.sin(t * 13.1 + seed) + 0.07 * Math.sin(t * 23.7 + seed * 2.3) + 0.04 * Math.sin(t * 41.3 + seed * 3.1), w: Math.sin(t * 8.7 + seed * 1.7) + 0.5 * Math.sin(t * 15.3 + seed)});
export const Flame: React.FC<{x: number; y: number; s: number; t: number; seed: number; glow?: number; ivory?: boolean}> = ({x, y, s, t, seed, glow = 1, ivory}) => {
	const F = flick(t, seed), h = s * F.s, w = F.w * 1.6 * s, gid = `fl${seed}`;
	const c1 = ivory ? '#F6E2B8' : '#EE9A48', c2 = ivory ? '#FFF2D6' : '#FFD58A', c3 = '#FFF6E2';
	return <g>
		<defs><radialGradient id={gid}><stop offset="0" stopColor={ivory ? '#F3DDB4' : '#FFC27A'} stopOpacity={0.55 * glow} /><stop offset="0.35" stopColor={ivory ? '#F3DDB4' : '#FFB46A'} stopOpacity={0.18 * glow} /><stop offset="1" stopColor="#FFB46A" stopOpacity="0" /></radialGradient></defs>
		<circle cx={x} cy={y - 8 * s} r={62 * s * (0.94 + 0.06 * F.s)} fill={`url(#${gid})`} />
		<path d={`M${f1(x - 5 * s)},${f1(y)} C${f1(x - 6 * s)},${f1(y - 9 * h)} ${f1(x - s + w)},${f1(y - 15 * h)} ${f1(x + w * 1.4)},${f1(y - 24 * h)} C${f1(x + 3 * s + w)},${f1(y - 15 * h)} ${f1(x + 6.4 * s)},${f1(y - 8 * h)} ${f1(x + 5 * s)},${f1(y)} Z`} fill={c1} />
		<path d={`M${f1(x - 3 * s)},${f1(y)} C${f1(x - 3.4 * s)},${f1(y - 6 * h)} ${f1(x + w * 0.7)},${f1(y - 11 * h)} ${f1(x + w)},${f1(y - 16 * h)} C${f1(x + 2.2 * s)},${f1(y - 9 * h)} ${f1(x + 3.8 * s)},${f1(y - 5 * h)} ${f1(x + 3 * s)},${f1(y)} Z`} fill={c2} />
		<ellipse cx={x} cy={y - 3 * h} rx={1.8 * s} ry={3.2 * h} fill={c3} />
	</g>; };

/* ---------- 曹操 walking (Cao units: soles y = 750 at rest, hip joint 340 at rest; facing +x) ---------- */
const CT = 200, CS = 196, CAH = 22, CL = 300;
/* contact: legs just straight at half a stride; passing: the hip rises ~5 cm, the stance knee nearly straight */
const caoWalk = (t: number) => walkAt(t, {L: CL, H0: 363, bob: 24, lift: 34, toe: 96, ah: CAH});
export type CaoWalkProps = {t: number; pal: Pal; id: string; bow?: number; bundle?: boolean; mid?: boolean; old?: boolean; cap?: 'wu' | 'ze'; robe?: string; robeS?: string; robeH?: string; trim?: string; t0?: number};
/** 曹操 in a walk, drawn at world x = hipX(t) (Cao units from the walk origin); origin = soles line y = 750 in Cao local terms */
export const CaoWalk: React.FC<CaoWalkProps> = (p) => {
	const {pal, id} = p, t = p.t + (p.t0 ?? 0), R = p.robe ?? pal.robe, RS = p.robeS ?? pal.robeS, RH = p.robeH ?? pal.robeH, TR = p.trim ?? pal.trim;
	const W = caoWalk(t), Wl = caoWalk(t - 0.07), Wa = caoWalk(t - 0.05), Ws = caoWalk(t - 0.13);
	const base = 750, hx = W.hipX, hy = base + W.hipY, dy = hy - 340, X = (v: number) => hx + v, Y = (v: number) => v + dy;
	const leg = (S: WalkS, i: 0 | 1, hxx: number, hyy: number) => { const ft = S.feet[i], ax = ft.x, ay = base + ft.y - CAH;
		const kn = ik(hxx + (i ? -6 : 6), hyy, ax, ay, CT, CS); return {kn, an: [ax, ay] as P, a: ft.a}; };
	const Lg = [leg(W, 0, hx, hy), leg(W, 1, hx, hy)], Ll = [leg(Wl, 0, Wl.hipX, base + Wl.hipY), leg(Wl, 1, Wl.hipX, base + Wl.hipY)];
	/* the shin at the hem height (lagged), for the robe skirt */
	const hemY = Y(640), shinAt = (l: {kn: P; an: P}) => { const u = clamp((hemY - l.kn[1]) / Math.max(1, l.an[1] - l.kn[1]), 0, 1); return l.kn[0] + (l.an[0] - l.kn[0]) * u + (hx - Wl.hipX); };
	const sx = [shinAt(Ll[0]), shinAt(Ll[1])], fxh = Math.max(...sx) + 30, bxh = Math.min(...sx) - 34, kF = Math.max(Ll[0].kn[0], Ll[1].kn[0]) + (hx - Wl.hipX);
	const skirt = `M${f1(X(-62))},${f1(Y(292))} C${f1(X(-74))},${f1(Y(380))} ${f1((X(-70) + bxh) / 2 - 6)},${f1(Y(520))} ${f1(bxh)},${f1(hemY)} C${f1((bxh + fxh) / 2)},${f1(hemY + 10)} ${f1(fxh - 20)},${f1(hemY + 8)} ${f1(fxh)},${f1(hemY)} C${f1(Math.max(fxh, kF + 34))},${f1(Y(520))} ${f1(X(60))},${f1(Y(380))} ${f1(X(52))},${f1(Y(286))} Z`;
	const shoe = (l: {an: P; a: number}, c: string) => <g transform={`translate(${f1(l.an[0])},${f1(l.an[1])}) rotate(${f1(l.a)})`}>
		<path d="M-26,4 C-28,-8 -16,-14 0,-14 L52,-8 C76,-4 98,2 100,14 C100,20 94,22 86,22 L-22,22 C-28,20 -28,12 -26,4 Z" fill={c} />
		<path d="M-22,18 L94,18" stroke="#000" strokeOpacity={0.4} strokeWidth={3} /></g>;
	const legD = (l: {kn: P; an: P}, w0: number) => strand(qpts([l.kn[0], l.kn[1]], [(l.kn[0] + l.an[0]) / 2 + 3, (l.kn[1] + l.an[1]) / 2], [l.an[0], l.an[1] - 6], 8), (u) => w0 - u * 8);
	/* arms: swing against the same-side leg (lagged), elbow bends more on the forward swing; sleeve bag lags further */
	const arm = (i: 0 | 1, S: WalkS) => { const ph = -0.5 * S.fw[i] * 0.62, b = 0.3 + 0.5 * Math.max(0, ph);
		const sh: P = [X(i ? -18 : 10), Y(88)], el: P = [sh[0] + 150 * Math.sin(ph), sh[1] + 150 * Math.cos(ph)], hd: P = [el[0] + 136 * Math.sin(ph + b), el[1] + 136 * Math.cos(ph + b)];
		return {sh, el, hd, ph}; };
	const aN = arm(0, Wa), aF = arm(1, Wa), sN = arm(0, Ws), sF = arm(1, Ws);
	const sleeve = (a: {sh: P; el: P; hd: P}, s: {el: P; hd: P}, c: string, cs: string) => { const bag: P = [(s.el[0] + s.hd[0]) / 2 - 18, Math.max(s.el[1], s.hd[1]) + 30];
		return <g>
			<path d={strand(qpts(a.sh, a.el, a.hd, 10), (u) => 30 - u * 6)} fill={c} />
			<path d={`M${f1(a.el[0] - 18)},${f1(a.el[1] - 6)} Q${f1(bag[0])},${f1(bag[1] + 20)} ${f1(a.hd[0] - 6)},${f1(a.hd[1] + 18)} L${f1(a.hd[0] + 8)},${f1(a.hd[1] - 10)} Z`} fill={c} />
			<path d={`M${f1(a.el[0] - 14)},${f1(a.el[1] + 10)} Q${f1(bag[0])},${f1(bag[1] + 14)} ${f1(a.hd[0] - 6)},${f1(a.hd[1] + 14)}`} fill="none" stroke={cs} strokeWidth={10} opacity={0.7} />
			<path d={`M${f1(a.hd[0] - 10)},${f1(a.hd[1] + 18)} L${f1(a.hd[0] + 10)},${f1(a.hd[1] - 12)}`} stroke={TR} strokeWidth={7} />
		</g>; };
	const fist = (a: {el: P; hd: P}, c: string) => { const ang = Math.atan2(a.hd[1] - a.el[1], a.hd[0] - a.el[0]) * 180 / Math.PI - 90;
		return <g transform={`translate(${f1(a.hd[0])},${f1(a.hd[1])}) rotate(${f1(ang)})`}><path d="M-11,0 C-12,10 -6,20 2,20 C10,20 13,10 11,0 Z" fill={c} /><path d="M2,20 C10,20 13,10 11,0 L6,0 C7,9 5,15 2,17 Z" fill={pal.skinS} /></g>; };
	const bow = p.bow ?? 0, bob = (base + Ws.hipY) - (base + W.hipY);
	return <g>
		<defs><clipPath id={`${id}cw`}><path d={skirt} /></clipPath></defs>
		{/* far arm + far leg (behind) */}
		{sleeve(aF, sF, RS, '#0A0A0C')}{fist(aF, pal.skinS)}
		{/* the legs show only below the hem (the robe covers the knees whatever the lag does) */}
		<defs><clipPath id={`${id}lg`}><rect x={hx - 2000} y={hemY - 12} width={4000} height={800} /></clipPath></defs>
		<g clipPath={`url(#${id}lg)`}>
			<path d={legD(Lg[1], 30)} fill="#17140F" />
			<path d={legD(Lg[0], 30)} fill="#2A2520" />
			<path d={strand(qpts([Lg[0].kn[0] + 8, Lg[0].kn[1] + 40], [(Lg[0].kn[0] + Lg[0].an[0]) / 2 + 8, (Lg[0].kn[1] + Lg[0].an[1]) / 2], [Lg[0].an[0] + 6, Lg[0].an[1] - 14], 6), () => 4)} fill="#5A5248" opacity={0.6} />
		</g>
		{shoe(Lg[1], '#0C0A08')}{shoe(Lg[0], '#141110')}
		{/* bundle on the back (follows through) */}
		<g transform={`translate(${f1(X(0))},${f1(Y(0) + bob * 0.8)})`}>
			<path d="M-112,110 C-134,150 -130,214 -104,240 C-84,256 -54,252 -42,232 C-34,196 -40,150 -56,116 C-70,98 -96,96 -112,110 Z" fill="#4E4338" />
			<path d="M-112,110 C-134,150 -130,214 -104,240 C-96,246 -88,249 -80,249 C-104,222 -110,166 -98,112 Z" fill="#2E2822" />
			<path d="M-100,130 C-90,170 -80,200 -60,224 M-84,112 C-74,150 -64,180 -48,200" fill="none" stroke="#2E2822" strokeWidth={3} opacity={0.6} />
			<path d="M-92,104 C-86,90 -70,88 -62,100 C-70,108 -84,110 -92,104 Z M-80,98 L-70,78 L-62,84 Z" fill="#3E352C" />
		</g>
		{/* the robe: plain dark 袍, skirt over the legs */}
		<path d={skirt} fill={R} />
		<g clipPath={`url(#${id}cw)`}>
			<path d={`M${f1(X(-14))},${f1(Y(280))} C${f1(X(-18))},${f1(Y(450))} ${f1(bxh + 30)},${f1(hemY - 60)} ${f1(bxh + 24)},${f1(hemY + 20)} L${f1(X(-200))},${f1(hemY + 20)} L${f1(X(-200))},${f1(Y(280))} Z`} fill={RS} />
			<path d={`M${f1(fxh - 14)},${f1(hemY)} C${f1(kF + 20)},${f1(Y(520))} ${f1(X(46))},${f1(Y(380))} ${f1(X(40))},${f1(Y(290))} L${f1(X(200))},${f1(Y(290))} L${f1(X(200))},${f1(hemY + 20)} Z`} fill={RH} opacity={0.5} />
			<path d={`M${f1(X(-10))},${f1(Y(300))} Q${f1(kF - 10)},${f1(Y(470))} ${f1((fxh + bxh) / 2 + 10)},${f1(hemY)}`} fill="none" stroke={RS} strokeWidth={4} opacity={0.8} />
			<rect x={X(-300)} y={hemY - 14} width={600} height={30} fill={TR} opacity={0.75} />
		</g>
		<g transform={`translate(${f1(X(0))},${f1(dy)})`}>
			<defs><clipPath id={`${id}tor`}><path d="M-38,44 C-58,58 -70,100 -68,160 C-66,220 -62,262 -62,298 L52,290 C58,220 62,160 54,112 C48,82 36,60 14,46 Z" /></clipPath></defs>
			<path d="M-38,44 C-58,58 -70,100 -68,160 C-66,220 -62,262 -62,298 L52,290 C58,220 62,160 54,112 C48,82 36,60 14,46 Z" fill={R} />
			<g clipPath={`url(#${id}tor)`}>
				<path d="M-14,48 C-16,140 -18,220 -20,298 L-80,300 L-80,40 Z" fill={RS} />
				<path d="M44,92 C56,150 54,230 50,290 L64,290 L64,80 Z" fill={RH} opacity={0.55} />
			</g>
			<path d="M14,46 C25,56 33,72 37,92 L29,96 C25,77 19,61 8,51 Z" fill="#B8AE9C" />
			<path d="M24,52 C8,104 -18,152 -48,196 L-58,186 C-28,146 -2,100 14,48 Z" fill={TR} />
			{/* cloth sash (no gilt hook, no ribbon: he is in disguise) and the bundle's strap across the chest */}
			<path d="M-64,282 L54,272 L56,294 L-64,304 Z" fill="#2E2A24" />
			<path d="M40,64 C20,120 -20,190 -70,236 L-80,226 C-34,184 6,116 26,58 Z" fill="#5A4C3C" />
		</g>
		{sleeve(aN, sN, R, RS)}{fist(aN, pal.skin)}
		<g transform={`translate(${f1(X(0))},${f1(dy)}) rotate(${f1(bow)} 0 40) translate(0,49) scale(0.88) translate(0,-40)`}>
			<Head old={p.old ?? false} mid={p.mid ?? true} cap={p.cap ?? 'ze'} pal={pal} id={id} />
		</g>
	</g>; };
/** the walk's hip x at time t (Cao units from the origin), for cameras and placement */
export const caoHipX = (t: number) => caoWalk(t).hipX;

/* ---------- NPC walking (cm, soles at 0; one tone; facing +x, flip for −x) ---------- */
const NT = 43, NS = 42, NAH = 7;
export type NpcWalkKind = 'ji' | 'torch' | 'plain';
export const npcWalk = (t: number, L = 64, f = 1.8) => { const H0 = 0.99 * Math.sqrt((NT + NS) ** 2 - (L / 2) ** 2); return walkAt(t, {L, f, H0, bob: Math.min(7.5, 0.985 * (NT + NS) - H0), lift: 7, toe: 18, ah: NAH}); };
export const NpcWalk: React.FC<{t: number; kind?: NpcWalkKind; L?: number; f?: number; t0?: number}> = ({t: t1, kind = 'plain', L = 64, f = 1.8, t0 = 0}) => {
	const t = t1 + t0, W = npcWalk(t, L, f), Wl = npcWalk(t - 0.07, L, f), Wa = npcWalk(t - 0.05, L, f);
	const hx = W.hipX, hy = W.hipY, dy = hy - (-NAH - 82), X = (v: number) => hx + v, Y = (v: number) => v + dy;
	const leg = (S: WalkS, i: 0 | 1, hxx: number, hyy: number) => { const ft = S.feet[i], ax = ft.x, ay = ft.y - NAH, kn = ik(hxx, hyy, ax, ay, NT, NS); return {kn, an: [ax, ay] as P, a: ft.a}; };
	const Lg = [leg(W, 0, hx, hy), leg(W, 1, hx, hy)], Ll = [leg(Wl, 0, Wl.hipX, Wl.hipY), leg(Wl, 1, Wl.hipX, Wl.hipY)];
	const legD = (l: {kn: P; an: P}) => strand([[(hx + l.kn[0]) / 2 + 0, (hy + l.kn[1]) / 2 - 6], l.kn, [(l.kn[0] + l.an[0]) / 2, (l.kn[1] + l.an[1]) / 2], l.an], (u) => 6.2 - u * 2);
	const thigh = (l: {kn: P}) => strand([[hx, hy - 4], l.kn], (u) => 7 - u * 1);
	const shoe = (l: {an: P; a: number}) => <path transform={`translate(${f1(l.an[0])},${f1(l.an[1])}) rotate(${f1(l.a)})`} d="M-6,-2 L6,-3 C12,-2 18,1 19,5 L19,7 L-6,7 Z" />;
	/* tunic skirt from the belt (−100) to the knee hem (−50), its hem following the (lagged) knees */
	const kx = [Ll[0].kn[0], Ll[1].kn[0]].map((v) => v + (hx - Wl.hipX)), hemY = Y(-50);
	const fx = Math.max(...kx) + 10, bx = Math.min(...kx) - 11;
	const skirt = `M${f1(X(-12.4))},${f1(Y(-100))} C${f1(X(-14.6))},${f1(Y(-84))} ${f1(bx + 1)},${f1(Y(-64))} ${f1(bx)},${f1(hemY)} C${f1((bx + fx) / 2)},${f1(hemY + 1.6)} ${f1(fx - 4)},${f1(hemY + 1.4)} ${f1(fx)},${f1(hemY)} C${f1(fx - 1)},${f1(Y(-66))} ${f1(X(13.8))},${f1(Y(-84))} ${f1(X(13))},${f1(Y(-100))} Z`;
	const sw = -0.42 * Wa.fw[0], swF = -0.42 * Wa.fw[1];
	const armD = (sx: number, ph: number, w: number) => { const sh: P = [X(sx), Y(-134)], el: P = [sh[0] + 27 * Math.sin(ph), sh[1] + 27 * Math.cos(ph)], b = 0.25 + 0.5 * Math.max(0, ph), hd: P = [el[0] + 25 * Math.sin(ph + b), el[1] + 25 * Math.cos(ph + b)];
		return {d: strand([sh, el, hd], (u) => w - u * 1.4), hd}; };
	const far = armD(-2, swF, 4.8);
	const near = kind === 'plain' ? armD(2, sw, 5.2) : null;
	const tilt = Math.sin((W.hipX / L) * Math.PI) * 1.2;
	return <g>
		<path d={far.d} /><circle cx={far.hd[0]} cy={far.hd[1]} r={3.6} />
		<path d={thigh(Lg[1])} /><path d={legD(Lg[1])} />{shoe(Lg[1])}
		<path d={thigh(Lg[0])} /><path d={legD(Lg[0])} />{shoe(Lg[0])}
		<path d={skirt} />
		<g transform={`translate(${f1(X(0))},${f1(dy)})`}>
			<path d="M-4,-141 C-11,-140 -13.4,-135 -13.4,-126 C-13.4,-114 -12.2,-106 -11.6,-101 L-12.6,-98 L13,-98 L12.4,-101 C13.4,-107 15,-116 14.4,-126 C13.8,-134 9.6,-140 5,-141 Z" />
			<path d={NECK} /><path d={HEAD} /><path d={ZE} />
			{kind !== 'torch' && <path d="M10,-100 L-26,-62 L-24.4,-60.4 L11.6,-98.4 Z" />}
			{kind === 'ji' && <g transform={`rotate(${f1(tilt)} 15 -98)`}>
				<path d="M2,-134 L8,-110 L15,-100 L11,-97 L3,-106 L-3,-130 Z" /><circle cx={15} cy={-99} r={4} />
				<rect x={13.8} y={-252} width={2.6} height={250} />
				<path d="M15.1,-270 C16.6,-264 17,-258 16.4,-252 L13.8,-252 C13.2,-258 13.6,-264 15.1,-270 Z" />
				<path d="M16.2,-246 L30,-243 C33,-242.4 34,-240 33,-238.4 L16.2,-241.4 Z" /><path d="M13.8,-246 L9,-244.6 L9,-242.8 L13.8,-243 Z" /></g>}
			{kind === 'torch' && <g><path d="M2,-134 L12,-114 L24,-126 L27,-122 L13,-106 L-3,-128 Z" /><circle cx={25} cy={-125} r={4} />
				<path d="M21,-118 L33,-156 L36.4,-155 L24.6,-117 Z" /></g>}
		</g>
		{near && <><path d={near.d} /><circle cx={near.hd[0]} cy={near.hd[1]} r={4} /></>}
	</g>; };
/** where an NpcWalk's torch head is (local cm, add the walker's transform) */
export const npcTorchAt = (t: number, L = 64, f = 1.8, t0 = 0): P => { const W = npcWalk(t + t0, L, f); return [W.hipX + 34.7, W.hipY - (-NAH - 82) - 157]; };
export const npcHipX = (t: number, L = 64, f = 1.8, t0 = 0) => npcWalk(t + t0, L, f).hipX;
