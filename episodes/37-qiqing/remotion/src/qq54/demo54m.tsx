import React from 'react';
import {W, H, cl, seg, ease, eout, eio} from '../qq50/kit50';
import {Pal, RimF, Rod5, Dao, Head, strand, qpts, rnd, f1, P} from './cao54b';
import {Npc, LampStand} from './npc54b';
import {CaoWalk, caoHipX, NpcWalk, npcTorchAt, Flame, flick} from './rig54b';
import {OpenNew} from './op54open';
/* ep54 demo · scenes by the rig builder. t = FILM time (s).
   Open (0–16.59): six shots cut on the bar downbeats, built in op54open.tsx (the moment wide; 曹操 close, low angle; the 五色棒 racks;
   the gate head-on, the guards to attention; crane down onto 洛阳; the gates shut, the lamps go out); under the title it runs on dimmed.
   Flight (24.56–28.54): K7 on the motion clock m = t − 24.56. Line (32.53–36.51): close-up of 曹操 at 35, half in shadow, push-in,
   held on the drum cut. Before the drop every flame is warm ivory with a small core (orange is the drop's). */
const SIL = '#140D0A', RIMW = '#FFB070', KEY = '#F3DDB4', ACC = '#8FD0DC';
const BAR = (n: number) => 0.654 + 1.99203 * n;
const PAL: Pal = {skin: '#C38D64', skinS: '#9C6848', skinH: '#E8BC8E', hair: '#15100E', robe: '#262A31', robeS: '#16181C', robeH: '#575B62', trim: '#5C2E24',
	metal: '#3C3B3A', metalS: '#1B1A1A', metalH: '#9A968C', lace: '#6E2C22', under: '#55302A', underS: '#2E1915', cape: '#2C1716', capeS: '#170B0B', gold: '#C09A52', line: '#2A1810'};
const zoom = (fx: number, fy: number, s: number) => `translate(${f1(fx)},${f1(fy)}) scale(${s.toFixed(5)}) translate(${f1(-fx)},${f1(-fy)})`;

/* ---------- shared defs ---------- */
const SkyDefs: React.FC<{p: string}> = ({p}) => <>
	<linearGradient id={`${p}sky`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#16222B" /><stop offset="0.4" stopColor="#253740" /><stop offset="0.66" stopColor="#455654" /><stop offset="0.8" stopColor="#68706A" /></linearGradient>
	<radialGradient id={`${p}moon`}><stop offset="0" stopColor="#DCE4DA" stopOpacity="0.45" /><stop offset="0.3" stopColor="#9FB8B6" stopOpacity="0.18" /><stop offset="1" stopColor="#9FB8B6" stopOpacity="0" /></radialGradient>
	<linearGradient id={`${p}psg`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#C9A27A" /><stop offset="0.55" stopColor="#F3DDB4" /><stop offset="1" stopColor="#FFF0D2" /></linearGradient>
	<radialGradient id={`${p}wallG`} cx="560" cy="500" r="430" gradientUnits="userSpaceOnUse" gradientTransform="translate(560 500) scale(1 0.62) translate(-560 -500)"><stop offset="0" stopColor={KEY} stopOpacity="0.55" /><stop offset="0.4" stopColor="#D9A877" stopOpacity="0.26" /><stop offset="1" stopColor="#D9A877" stopOpacity="0" /></radialGradient>
	<linearGradient id={`${p}roof`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2C3234" /><stop offset="1" stopColor="#1A1A1A" /></linearGradient>
	<linearGradient id={`${p}gnd`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3A3028" /><stop offset="1" stopColor="#15110E" /></linearGradient>
	<linearGradient id={`${p}haze`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8E8676" stopOpacity="0" /><stop offset="0.6" stopColor="#8E8676" stopOpacity="0.36" /><stop offset="1" stopColor="#8E8676" stopOpacity="0" /></linearGradient>
	<radialGradient id={`${p}pool`}><stop offset="0" stopColor={KEY} stopOpacity="0.42" /><stop offset="1" stopColor={KEY} stopOpacity="0" /></radialGradient>
	<radialGradient id={`${p}vig`} cx="0.5" cy="0.52" r="0.78"><stop offset="0.62" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.5" /></radialGradient>
	<filter id={`${p}bl3`} x="-5%" y="-20%" width="110%" height="140%"><feGaussianBlur stdDeviation="3" /></filter>
	<filter id={`${p}bl8`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="8" /></filter>
	<filter id={`${p}dof`} x="-2%" y="-2%" width="104%" height="104%"><feGaussianBlur stdDeviation="1.1" /></filter>
</>;
/** a Han 阙 (母阙 + 子阙), base centre (0,0), sheet units */
const QueD = <g>
	<path d="M28,-16 L72,-16 L68,-140 L30,-140 Z M22,-140 L96,-136 C90,-142 84,-150 80,-162 L28,-164 Z M32,-164 L76,-164 L74,-170 L34,-170 Z" />
	<rect x={-42} y={-18} width={84} height={18} /><path d="M-32,-16 L32,-16 L28,-212 L-28,-212 Z" /><rect x={-35} y={-224} width={70} height={12} />
	{[-34, -20, -6, 8, 22].map((bx) => <rect key={bx} x={bx} y={-240} width={11} height={16} />)}
	<rect x={-40} y={-244} width={80} height={6} /><rect x={-36} y={-266} width={72} height={22} />
	<path d="M-80,-262 L80,-262 L80,-267 L54,-294 L-54,-294 L-80,-267 Z" /><rect x={-30} y={-312} width={60} height={18} />
	<path d="M-63,-308 L63,-308 L63,-312 L36,-336 L-36,-336 L-63,-312 Z" /><path d="M-42,-336 L42,-336 L45,-344 L-45,-344 Z" />
</g>;
/** the 洛阳 gate wall in sheet coordinates (ground y 520, central passage x 560): wall, parapet, three passages, the 门楼 */
const GateWall: React.FC<{t: number; p: string; x0?: number; x1?: number}> = ({t, p, x0 = -700, x1 = 1900}) => {
	const GY = 520, fl = 1 + 0.035 * Math.sin(t * 5.3) + 0.02 * Math.sin(t * 11.9 + 1);
	const pass = (cx: number, w: number, h: number, k: string) => <g key={k}>
		<rect x={cx - w / 2 - 8} y={GY - h - 10} width={w + 16} height={h + 10} fill="#1A1410" />
		<rect x={cx - w / 2} y={GY - h} width={w} height={h} fill={`url(#${p}psg)`} opacity={fl} />
		{[0.12, 0.3, 0.7, 0.88].map((u) => <rect key={u} x={cx - w / 2 + w * u - 2} y={GY - h} width={4} height={h} fill="#3A2A1E" opacity={0.55} />)}
		<rect x={cx - w / 2 - 8} y={GY - h - 10} width={w + 16} height={8} fill="#2A1E16" />
	</g>;
	const n = Math.ceil((x1 - x0) / 26);
	return <g>
		<rect x={x0} y={300} width={x1 - x0} height={GY - 300} fill="#332B24" />
		<rect x={x0} y={300} width={x1 - x0} height={GY - 300} fill={`url(#${p}wallG)`} opacity={fl} />
		{Array.from({length: 17}, (_, i) => <path key={i} d={`M${x0},${306 + i * 13} L${x1},${306 + i * 13 + (i % 2 ? 1 : -1)}`} stroke="#000" strokeOpacity={0.16} strokeWidth={1.4} />)}
		<g fill="#231D19">{Array.from({length: n}, (_, i) => <rect key={i} x={x0 + i * 26} y={286} width={16} height={16} />)}<rect x={x0} y={296} width={x1 - x0} height={8} /></g>
		{pass(560, 92, 150, 'c')}{pass(430, 68, 118, 'l')}{pass(690, 68, 118, 'r')}
		<rect x={352} y={282} width={416} height={18} fill="#1E1814" />
		{Array.from({length: 27}, (_, i) => <rect key={i} x={360 + i * 15.2} y={266} width={3} height={16} fill="#1E1814" />)}
		<rect x={356} y={262} width={408} height={5} fill="#1E1814" />
		<rect x={376} y={212} width={368} height={56} fill="#2A221C" />
		{[0, 1, 2, 3, 4].map((i) => <g key={i}><rect x={392 + i * 70} y={226} width={40} height={30} fill="#E9CB98" opacity={(i === 2 ? 0.85 : 0.55) * fl} />
			{[0, 1, 2, 3, 4, 5].map((j) => <rect key={j} x={394 + i * 70 + j * 6.6} y={226} width={2.2} height={30} fill="#2A1E16" />)}</g>)}
		{[376, 446, 516, 586, 656, 726].map((x) => <rect key={x} x={x} y={212} width={18} height={56} fill="#1C1612" />)}
		<rect x={366} y={204} width={388} height={9} fill="#1C1612" />
		{Array.from({length: 13}, (_, i) => <g key={i} fill="#1C1612"><rect x={372 + i * 30} y={194} width={18} height={10} /><rect x={366 + i * 30} y={190} width={30} height={5} /></g>)}
		<path d="M318,192 C420,186 700,186 802,192 L806,184 C790,180 760,166 708,138 L412,138 C360,166 330,180 314,184 Z" fill={`url(#${p}roof)`} />
		<path d="M404,140 L716,140 L724,128 L716,132 L404,132 L396,128 Z" fill="#141414" />
		{Array.from({length: 30}, (_, i) => <path key={i} d={`M${420 + i * 9.6},142 L${326 + i * 16.4},188`} stroke="#5A6466" strokeOpacity={0.35} strokeWidth={1.2} />)}
		{Array.from({length: 31}, (_, i) => <circle key={i} cx={322 + i * 15.9} cy={189} r={2.4} fill="#4A5254" opacity={0.7} />)}
	</g>; };

/* =====================================================================================================================
   OPEN (0 → BAR(8)): rebuilt in op54open.tsx: six shots cut on the bar downbeats (t >= BAR(n)), each with a camera move and an
   acting beat; FILM54 and the title (ttl54a draws a dimmed Open under itself) both take it from here
   ===================================================================================================================== */
export const Open: React.FC<{t: number}> = ({t}) => <OpenNew t={t} />;

/* =====================================================================================================================
   FLIGHT (24.56–28.54): K7 on the motion clock m = t − BAR(12); every flame ivory (orange is the drop's)
   ===================================================================================================================== */
const CAMV = 240, PX = {sky: 0.04, far: 0.2, wall: 0.6, que: 0.75, mid: 0.82, road: 1, fg: 1.38}, S7 = 0.55, CAO0 = 600, ROADY = 1000;
const npcHipXs = (t: number, t0: number, L = 64, f = 1.8) => { const s = (t + t0) * f; return L * s - L / 2; };
export const Flight: React.FC<{t: number}> = ({t: tf}) => {
	const t = tf - BAR(12) + 0.05, cam = CAMV * t, sx = (p: number) => -cam * p;
	const WG = 2, WX = 700 - 560 * WG, WY = 800 - 520 * WG;
	const cx = CAO0 + (caoHipX(t) - caoHipX(0)) * S7 - cam, cy = ROADY - 750 * S7;
	const gk = 0.74, guards = [{x0: 1500, t0: 0.3, L: 67, f: 1.88, sw: 1.25, ln: 2}, {x0: 1660, t0: 0.85, L: 62, f: 1.74, sw: 0.8, ln: 4.5}];
	const tk = 1.7, ty = 905, tbase = 1900 + sx(PX.mid);
	const tch = npcTorchAt(t, 70, 1.9, 0.2), tfx = tbase - tch[0] * tk, tfy = ty + tch[1] * tk;
	const lx = 1150 + sx(0.92), lpx = 1880 + sx(0.92), hz = (t * 7) % 400;
	return <svg width={W} height={H} style={{position: 'absolute'}}>
		<defs>
			<SkyDefs p="fl" />
			<RimF id="flcao" lx={-1} ly={-0.25} k={5} c="#FFD9A8" o={0.95} lx2={1} ly2={-0.25} k2={4} c2={ACC} o2={0.9} blur={1} />
			<RimF id="flrimW" lx={0} ly={-1} k={1.6} c={RIMW} o={0.85} lx2={-1} ly2={0} k2={1.4} c2={RIMW} o2={0.6} />
			<RimF id="flrimT" lx={1} ly={-0.6} k={2.6} c="#FFD9A8" o={0.95} />
			<RimF id="flrimQ" lx={-1} ly={-0.1} k={3} c={RIMW} o={0.8} lx2={0} ly2={-1} k2={2} c2="#9FB8B6" o2={0.5} />
		</defs>
		<rect width={W} height={H} fill="url(#flsky)" />
		<g transform={`translate(${sx(PX.sky)},0)`}>
			{Array.from({length: 70}, (_, i) => <circle key={i} cx={rnd(i, 1) * 2100} cy={rnd(i, 2) * 380} r={0.8 + rnd(i, 3) * 1.4} fill="#E8EEE6" opacity={(0.25 + rnd(i, 4) * 0.5) * (0.8 + 0.2 * Math.sin(t * (1 + rnd(i, 5) * 3) + i))} />)}
			<circle cx={1130} cy={120} r={230} fill="url(#flmoon)" /><circle cx={1130} cy={120} r={34} fill="#EEF0E6" />
		</g>
		<g transform={`translate(${sx(PX.far)},0)`} filter="url(#flbl3)">
			<path d="M-200,330 C0,290 200,280 400,306 C600,270 800,262 1000,290 C1200,256 1400,266 1600,296 C1800,270 2000,276 2300,300 L2300,420 L-200,420 Z" fill="#2E3B3B" />
			<path d="M-200,350 L200,350 L220,326 L380,326 L400,350 L1500,350 L1520,330 L1700,330 L1720,350 L2300,350 L2300,420 L-200,420 Z" fill="#26302F" />
		</g>
		<g transform={`translate(${sx(PX.wall)},0)`}>
			<g filter="url(#fldof)"><g transform={`translate(${WX},${WY}) scale(${WG})`}><GateWall t={t} p="fl" x0={-700} x1={1900} /></g></g>
			<rect x={-800} y={800} width={4400} height={140} fill="#2A231D" />
			<ellipse cx={700} cy={806} rx={420} ry={60} fill="url(#flpool)" />
			{[[700 - 150, 11], [700 + 150, 23]].map(([x, sd]) => <g key={sd}><LampStand x={x} y={800} k={0.74} /><Flame x={x} y={800 - 117 * 0.74} s={0.74} t={t} seed={sd} ivory /></g>)}
			{guards.map((g, i) => <g key={i} fill={SIL} filter="url(#flrimW)" transform={`translate(${g.x0},800) scale(${-gk},${gk})`}><NpcWalk t={t} kind="ji" t0={g.t0} L={g.L} f={g.f} swing={g.sw} lean={g.ln} /></g>)}
		</g>
		<rect x={-50 - hz} y={700} width={2420} height={170} fill="url(#flhaze)" />
		<g transform={`translate(${sx(PX.que)},0)`} fill={SIL} filter="url(#flrimQ)"><g transform="translate(1960,858) scale(1.55)">{QueD}</g></g>
		<rect y={860} width={W} height={220} fill="url(#flgnd)" />
		<g fill={SIL} filter="url(#flrimT)" transform={`translate(${f1(tbase)},${ty}) scale(${-tk},${tk})`}><NpcWalk t={t} kind="torch" L={70} f={1.9} t0={0.2} lean={3.5} /></g>
		<ellipse cx={tfx} cy={ty + 6} rx={200} ry={26} fill="url(#flpool)" opacity={0.7 * flick(t, 3).s} />
		<Flame x={tfx} y={tfy} s={1.5} t={t} seed={3} glow={1.2} ivory />
		<ellipse cx={lx} cy={968} rx={260} ry={34} fill="url(#flpool)" opacity={0.85} />
		<LampStand x={lx} y={962} k={2.2} /><Flame x={lx} y={962 - 117 * 2.2} s={2.2} t={t} seed={41} ivory glow={1.2} />
		<LampStand x={lpx} y={962} k={2.2} /><Flame x={lpx} y={962 - 117 * 2.2} s={2.2} t={t} seed={57} ivory glow={1.2} />
		<ellipse cx={cx} cy={ROADY + 2} rx={120} ry={10} fill="#0A0605" opacity={0.55} />
		<g filter="url(#flcao)"><g transform={`translate(${f1(cx - caoHipX(t) * S7)},${f1(cy)}) scale(${S7})`}>
			<CaoWalk t={t} pal={{...PAL, skin: '#BE8A62'}} id="flc" bow={11} glance={2.45} robe="#2F2B27" robeS="#1B1815" robeH="#5E564C" trim="#3A3029" />
		</g></g>
		<g transform={`translate(${sx(PX.fg)},0)`} filter="url(#flbl8)" fill="#0A0605">
			{[1500, 2300, 3100].map((x) => <g key={x}><rect x={x} y={850} width={46} height={240} /><rect x={x - 170} y={898} width={400} height={22} /></g>)}
		</g>
		<rect width={W} height={H} fill="url(#flvig)" />
	</svg>; };

/* =====================================================================================================================
   LINE (32.53–36.51): close-up of 曹操 at 35, profile facing left, a low lamp at the left lights the front of his face, the
   back half falls into shadow with the cool moon rim from a lattice window behind; cold, lowered lids; one slow blink;
   a slow push-in that settles, held on the drum cut (36.51)
   ===================================================================================================================== */
export const Line: React.FC<{t: number}> = ({t}) => {
	const a = BAR(16), m = t - a, K = 4.3, HX = 1400, HY = 830;
	const push = 1 + 0.075 * eout(cl(m / 3.3)), zf = zoom(1280, 330, push), zb = zoom(1280, 330, 1 + 0.03 * eout(cl(m / 3.3)));
	const F = flick(t, 9), warm = 0.9 + 0.1 * F.s;
	/* the eye: lids lowered (cold); one blink at m ≈ 1.15 (closes in 3 frames, opens in 4) */
	const blink = Math.max(0, 1 - Math.abs(m - 1.18) / 0.1) ** 0.8;
	const lid = 0.42 + 0.58 * blink, look = 0.6 * ease(seg(m, 1.6, 2.6));   /* after the blink the eyes slide forward to rest */
	const lampX = 520, lampY = 900;
	return <svg width={W} height={H} style={{position: 'absolute'}}>
		<defs>
			<linearGradient id="lnwall" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#2A221C" /><stop offset="0.55" stopColor="#1A1714" /><stop offset="1" stopColor="#121417" /></linearGradient>
			<radialGradient id="lnkey" cx={lampX} cy={lampY - 60} r="1100" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor={KEY} stopOpacity="0.5" /><stop offset="0.35" stopColor="#D9A877" stopOpacity="0.2" /><stop offset="1" stopColor="#D9A877" stopOpacity="0" /></radialGradient>
			<linearGradient id="lnshade" x1="0" y1="0" x2="1" y2="0.2"><stop offset="0.64" stopColor="#05070A" stopOpacity="0" /><stop offset="0.75" stopColor="#05070A" stopOpacity="0.55" /><stop offset="0.92" stopColor="#05070A" stopOpacity="0.8" /></linearGradient>
			<linearGradient id="lnmoon" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5F7A80" stopOpacity="0.55" /><stop offset="1" stopColor="#2C4248" stopOpacity="0.3" /></linearGradient>
			<radialGradient id="lnvig" cx="0.55" cy="0.5" r="0.75"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.62" /></radialGradient>
			<filter id="lnbl" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="6" /></filter>
			<radialGradient id="lnface"><stop offset="0" stopColor="#FFD9A8" stopOpacity="0.42" /><stop offset="0.6" stopColor="#FFD9A8" stopOpacity="0.12" /><stop offset="1" stopColor="#FFD9A8" stopOpacity="0" /></radialGradient>
			<RimF id="lnrim" lx={1} ly={0.2} k={3} c="#FFE0B0" o={0.9} lx2={-1} ly2={-0.35} k2={3.4} c2={ACC} o2={1} blur={1.2} />
			<clipPath id="lnhead"><rect x={-400} y={-400} width={800} height={800} /></clipPath>
		</defs>
		<g transform={zb}>
			<rect x={-100} y={-100} width={W + 200} height={H + 200} fill="url(#lnwall)" />
			{/* a lattice window behind him at right, moonlight */}
			<g filter="url(#lnbl)">
				<rect x={1560} y={150} width={330} height={520} fill="url(#lnmoon)" />
				{Array.from({length: 6}, (_, i) => <rect key={i} x={1560 + i * 62} y={150} width={9} height={520} fill="#0E1012" />)}
				{Array.from({length: 8}, (_, i) => <rect key={'h' + i} x={1560} y={150 + i * 70} width={330} height={8} fill="#0E1012" />)}
			</g>
			<rect x={-100} y={-100} width={W + 200} height={H + 200} fill="url(#lnkey)" opacity={warm} />
		</g>
		<g transform={zf}>
			{/* the head and shoulders, profile facing left (flip), drawn with the hero's parts */}
			<g filter="url(#lnrim)">
				<g transform={`translate(${HX},${HY}) scale(${-K},${K})`}>
					<path d="M-44,40 C-80,60 -110,120 -120,200 L120,200 C112,140 80,80 40,52 L14,46 Z" fill="#2F2B27" />
					<path d="M-44,40 C-80,60 -110,120 -120,200 L-30,200 C-30,140 -24,90 -14,48 Z" fill="#1B1815" />
					<path d="M14,46 C25,56 33,72 37,92 L29,96 C25,77 19,61 8,51 Z" fill="#B8AE9C" />
					<path d="M24,52 C8,104 -18,152 -48,196 L-58,186 C-28,146 -2,100 14,48 Z" fill="#3A3029" />
					<Head old={false} mid={false} cap="ze" pal={{...PAL, skin: '#BE8A62'}} id="lnh" />
					{/* the lamp, low at the front, warms the front planes of the face (clipped to the face) */}
					<g clipPath="url(#lnhfc)"><circle cx={70} cy={10} r={70} fill="url(#lnface)" opacity={warm} /></g>
					{/* a thin moustache, drooping at the corner (35: no beard yet) */}
					<path d="M47,-21.6 C44,-21 40.6,-19.4 37.4,-15.2" fill="none" stroke={PAL.hair} strokeWidth={1.5} strokeLinecap="round" opacity={0.85} />
					<path d="M46.4,-20 C43.6,-19.2 40.8,-17.6 38.6,-14.4" fill="none" stroke={PAL.hair} strokeWidth={0.8} opacity={0.5} />
					{/* cold eyes: the upper lid lowered over the eye (and the blink), the iris slid forward a little */}
					<path d={`M17,-56.4 C22.6,${f1(-59.4 + 6.4 * lid)} 28.6,${f1(-59 + 6.2 * lid)} 34.2,${f1(-55.4 + 1.6 * lid)} L34.4,-60 L16,-60 Z`} fill="#BE8A62" />
					<path d={`M17.4,${f1(-55.6 + 2.6 * lid)} C22.6,${f1(-58.8 + 6.4 * lid)} 28.6,${f1(-58.4 + 6.2 * lid)} 33.8,${f1(-54.8 + 1.6 * lid)}`} fill="none" stroke={PAL.line} strokeWidth={2.4} strokeLinecap="round" />
					<circle cx={28.6 + look} cy={-54.2} r={0.7} fill="#F6EEDF" opacity={0.8 * (1 - blink)} />
				</g>
			</g>
			{/* the back half of the head in shadow (the lamp is low at the front); the moon rim survives on the edge */}
			<rect x={-100} y={-100} width={W + 200} height={H + 200} fill="url(#lnshade)" />
		</g>
		{/* the lamp, low at the left, out of focus in the foreground */}
		<g filter="url(#lnbl)" opacity={0.95}><LampStand x={lampX} y={lampY + 330} k={3.2} /></g>
		<Flame x={lampX} y={lampY + 330 - 117 * 3.2} s={3.0} t={t} seed={9} ivory glow={1.3} />
		<rect width={W} height={H} fill="url(#lnvig)" />
	</svg>; };
export type _P54dm = P;
