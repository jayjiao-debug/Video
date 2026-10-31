import React from 'react';
import {W, H, cl, seg, ease, eout, eio} from '../qq50/kit50';
import {Pal, RimF, Rod5, Dao, Head, strand, qpts, rnd, f1, P} from './cao54b';
import {Npc, LampStand} from './npc54b';
import {CaoWalk, caoHipX, NpcWalk, npcTorchAt, Flame, flick} from './rig54b';
/* ep54 demo · scenes by the rig builder. t = FILM time (s).
   Open (0–16.59): card 1 = K1 animated (push-in, the rod rising and hovering, the man straining, lamp flicker); bar 2 (4.638) cut to
   a close glide along a 五色棒 rack (a hand draws one rod out of frame: use implied, nothing shown); bar 4 (8.622) the wide 洛阳 gate
   at curfew, a patrol walking, a slow crane up; the title (12.61–16.59) over the same wide, darkened.
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
   OPEN · shot A (0–4.638): K1 animated
   ===================================================================================================================== */
const Rack: React.FC<{x: number; y: number; w: number; h: number; dim?: number; n?: number; r?: number}> = ({x, y, w, h, dim = 1, n = 10, r = 7}) =>
	<g opacity={dim}>
		<rect x={x} y={y - h} width={12} height={h} fill="#3A2A1E" /><rect x={x + w - 12} y={y - h} width={12} height={h} fill="#3A2A1E" />
		{Array.from({length: n}, (_, i) => <Rod5 key={i} a={[x + 20 + i * (w - 40) / (n - 1), y - 8]} b={[x + 16 + i * (w - 40) / (n - 1) + (i % 3) * 2, y - h - 18 + (i % 2) * 6]} r={r} ph={(i * 2) % 5} lit={-1} />)}
		<rect x={x - 6} y={y - h + 10} width={w + 12} height={11} fill="#4A3626" /><rect x={x - 6} y={y - h + 10} width={w + 12} height={3} fill="#E0B47A" opacity={0.55} />
		<rect x={x - 4} y={y - h * 0.42} width={w + 8} height={9} fill="#3A2A1E" /><rect x={x - 4} y={y - h * 0.42} width={w + 8} height={2.4} fill="#E0B47A" opacity={0.4} />
		<rect x={x - 8} y={y - 16} width={w + 16} height={18} fill="#2E2218" /><rect x={x - 8} y={y - 16} width={w + 16} height={3} fill="#E0B47A" opacity={0.4} />
	</g>;
const HEADP = 'M-7,-160 C-7.5,-167 -2,-171 3.5,-171 C8.5,-171 11,-167.5 11.2,-163 L11.6,-160.2 L13.2,-156.6 L11.8,-155.8 C12.2,-154.6 12,-153.2 11.2,-152.2 C11.6,-150.8 11,-149.2 9.6,-148.6 C7,-147.8 4.6,-148.2 3,-149.4 L2.6,-146 L-4,-146 C-5,-150 -6.6,-154 -7,-160 Z';
/** 蹇硕's uncle on his knees (cm, facing +x, knees on y = 0); st = strain (deg, the torso rocks about the knees), hu = head lift (deg) */
const UNC_W: P = [-60, -80], UNC_S: P = [-2, -100];
const rotAbout = (q: P, deg: number, c: P = [0, 0]): P => { const r = deg * Math.PI / 180, dx = q[0] - c[0], dy = q[1] - c[1]; return [c[0] + dx * Math.cos(r) - dy * Math.sin(r), c[1] + dx * Math.sin(r) + dy * Math.cos(r)]; };
const UncleA: React.FC<{st: number; hu: number}> = ({st, hu}) => <g>
	<path d="M-50,0 C-52,-6 -48,-10 -40,-10 L50,-8 C55,-6 56,-2 54,0 Z" />
	<g transform={`rotate(${f1(st)} 0 -10)`}>
		<path d="M-42,0 C-48,-8 -46,-24 -34,-36 C-28,-42 -22,-50 -20,-60 C-18,-76 -14,-92 -6,-102 C0,-107 10,-107 15,-102 C22,-94 24,-84 23,-74 C25,-60 29,-44 37,-28 C43,-18 49,-8 51,0 Z" />
		<path d="M-22,-56 C-26,-40 -28,-26 -26,-12 L-22,-12 C-23,-26 -20,-40 -17,-54 Z" />
		<path d="M-8,-100 C-22,-96 -38,-88 -54,-82 L-52,-76 C-36,-80 -20,-86 -4,-90 Z" />
		<path d="M-26,-90 C-30,-74 -40,-58 -54,-48 C-56,-60 -54,-72 -50,-82 Z" />
		<path d="M-52,-82 C-58,-86 -62,-84 -62,-79 C-62,-75 -57,-74 -53,-76 Z" />
		<path d="M0,-104 L12,-104 L14,-114 L2,-116 Z" />
		<g transform={`rotate(${f1(-18 - hu)} 6 -104) translate(4,44)`}>
			<path d={HEADP} /><path d="M4,-150 C5,-143 10,-139 15,-140 C14,-144 13,-148 12,-151 Z" />
			<path d="M-6,-168 C-8,-176 -2,-180 3,-178 C7,-176 6,-170 2,-168 Z" />
		</g>
	</g>
</g>;
const Gripper: React.FC<{rx: number; ry: number; lean?: number}> = ({rx, ry, lean = 0}) => <g transform={`rotate(${f1(lean)} 0 -2)`}>
	<Npc x={0} y={0} k={1} kind="plain" />
	<path d={strand(qpts([4, -132], [rx * 0.5, (ry - 132) / 2 + 8], [rx, ry], 8), (u) => 5.2 - u * 1.4)} /><circle cx={rx} cy={ry} r={4.2} />
	<path d={strand(qpts([0, -130], [rx * 0.45, (ry - 130) / 2 + 14], [rx - 6, ry + 8], 8), (u) => 5 - u * 1.4)} />
</g>;
/** 曹操 (20) strike-ready (Cao units, facing +x); rise = the raised arm + rod rotation about the shoulder (deg, 0 = full height) */
const CaoStrikeA: React.FC<{id: string; rise: number; coil: number; look: number}> = ({id, rise, coil, look}) => {
	const R = PAL.robe, RS = PAL.robeS, RH = PAL.robeH, TR = PAL.trim;
	const skirt = 'M-62,292 C-78,380 -128,560 -206,708 C-120,736 60,740 184,700 C160,640 136,580 118,530 C96,460 66,380 52,286 Z';
	const torso = 'M-38,44 C-58,58 -70,100 -68,160 C-66,220 -62,262 -62,298 L52,290 C58,220 62,160 54,112 C48,82 36,60 14,46 Z';
	const shoe = (x: number, a: number, c: string) => <g transform={`translate(${x},728) rotate(${a})`}><path d="M-26,4 C-28,-8 -16,-14 0,-14 L52,-8 C76,-4 98,2 100,14 C100,20 94,22 86,22 L-22,22 C-28,20 -28,12 -26,4 Z" fill={c} /></g>;
	const sh: P = [-14, 80], el: P = [-86, -6], hd: P = [-56, -124];
	return <g>
		<defs><clipPath id={`${id}sk`}><path d={skirt} /></clipPath><clipPath id={`${id}to`}><path d={torso} /></clipPath></defs>
		<g transform={`rotate(${f1(-4 - coil)} 0 330)`}>
			<g transform={`rotate(${f1(rise)} ${sh[0]} ${sh[1]})`}>
				<Rod5 a={[-30, -96]} b={[-410, -300]} r={11} ph={1} lit={1} />
				<path d={strand(qpts(sh, [sh[0] - 50, sh[1] - 30], el, 8), (u) => 34 - u * 4)} fill={RS} />
				<path d={`M${sh[0] + 10},${sh[1]} C${sh[0] - 30},${sh[1] - 10} ${el[0] - 34},${el[1] + 40} ${el[0] - 30},${el[1] + 70} C${el[0] - 10},${el[1] + 120} ${sh[0] - 50},${sh[1] + 60} ${sh[0] - 20},${sh[1] + 40} Z`} fill={RS} />
				<path d={strand(qpts(el, [el[0] - 6, el[1] - 60], hd, 8), (u) => 20 - u * 6)} fill={PAL.skinS} />
				<path d={`M${el[0] + 12},${el[1] - 20} L${el[0] - 18},${el[1] + 4}`} stroke={TR} strokeWidth={10} />
				<g transform={`translate(${hd[0]},${hd[1]}) rotate(-30)`}><path d="M-13,-12 C0,-17 15,-11 16,0 C17,11 7,16 -5,14 C-14,12 -17,-4 -13,-12 Z" fill={PAL.skin} /><path d="M-5,14 C7,16 17,11 16,0 L10,0 C10,8 4,12 -4,11 Z" fill={PAL.skinS} /></g>
			</g>
		</g>
		{shoe(-150, 0, '#0C0A08')}{shoe(150, -4, '#141110')}
		<g transform={`rotate(${f1(-4 - coil)} 0 330)`}>
			<path d={skirt} fill={R} />
			<g clipPath={`url(#${id}sk)`}>
				<path d="M-20,280 C-30,420 -80,580 -110,740 L-260,740 L-260,280 Z" fill={RS} />
				<path d="M40,300 C70,420 110,560 150,720 L220,720 L220,280 Z" fill={RH} opacity={0.6} />
				<path d="M-8,300 C-20,450 -60,600 -90,720 M20,300 C40,440 70,580 96,712 M-40,320 C-70,460 -120,600 -160,712" fill="none" stroke={RS} strokeWidth={4} opacity={0.75} />
				<rect x={-260} y={690} width={460} height={60} fill={TR} transform="rotate(-6 0 700)" />
			</g>
			<path d={torso} fill={R} />
			<g clipPath={`url(#${id}to)`}>
				<path d="M-14,48 C-16,140 -18,220 -20,298 L-80,300 L-80,40 Z" fill={RS} />
				<path d="M44,92 C56,150 54,230 50,290 L64,290 L64,80 Z" fill={RH} opacity={0.6} />
			</g>
			<path d="M14,46 C25,56 33,72 37,92 L29,96 C25,77 19,61 8,51 Z" fill="#D8CDB8" />
			<path d="M24,52 C8,104 -18,152 -48,196 L-58,186 C-28,146 -2,100 14,48 Z" fill={TR} />
			<path d="M-64,284 L55,272 L57,292 L-64,304 Z" fill="#1A120E" /><ellipse cx={50} cy={282} rx={7} ry={5} fill={PAL.gold} />
			<path d="M-30,300 L-18,298 L-24,520 L-36,522 Z" fill="#A08240" />
			<Dao a={[64, 266]} b={[-90, 548]} pal={PAL} />
			<g transform={`rotate(${f1(22 + look + coil)} 0 40) translate(0,49) scale(0.88) translate(0,-40)`}><Head old={false} pal={PAL} id={id} /></g>
		</g>
		{(() => { const s0: P = [16, 86], e0: P = [74, 196], h0: P = [140, 286];
			return <g>
				<path d={`M${s0[0] + 20},${s0[1] - 10} C${s0[0] + 50},${s0[1] + 30} ${e0[0] + 20},${e0[1] - 30} ${e0[0] + 28},${e0[1] - 4} L${h0[0] - 6},${h0[1] - 22} C${h0[0] + 2},${h0[1] + 8} ${h0[0] - 4},${h0[1] + 40} ${h0[0] - 20},${h0[1] + 70} C${h0[0] - 50},${h0[1] + 100} ${e0[0] - 20},${e0[1] + 96} ${e0[0] - 30},${e0[1] + 40} C${e0[0] - 40},${e0[1]} ${s0[0] - 30},${s0[1] + 60} ${s0[0] - 26},${s0[1] + 10} Z`} fill={R} />
				<path d={`M${e0[0] - 30},${e0[1] + 40} C${e0[0] - 20},${e0[1] + 96} ${h0[0] - 50},${h0[1] + 100} ${h0[0] - 20},${h0[1] + 70} C${h0[0] - 34},${h0[1] + 76} ${e0[0] - 4},${e0[1] + 70} ${e0[0] - 18},${e0[1] + 22} Z`} fill={RS} />
				<path d={`M${s0[0] + 20},${s0[1] - 10} C${s0[0] + 50},${s0[1] + 30} ${e0[0] + 20},${e0[1] - 30} ${e0[0] + 28},${e0[1] - 4} L${h0[0] - 6},${h0[1] - 22} L${h0[0] - 10},${h0[1] - 10} L${e0[0] + 16},${e0[1] + 8} C${e0[0] + 10},${e0[1] - 26} ${s0[0] + 24},${s0[1] + 40} ${s0[0] + 10},${s0[1] - 2} Z`} fill={RH} opacity={0.75} />
				<path d={`M${h0[0] - 6},${h0[1] - 22} C${h0[0] + 2},${h0[1] + 8} ${h0[0] - 4},${h0[1] + 40} ${h0[0] - 20},${h0[1] + 70}`} fill="none" stroke={TR} strokeWidth={9} />
				<g transform={`translate(${h0[0] + 2},${h0[1] + 12}) rotate(52)`}>
					<path d="M-10,-11 C2,-14 13,-9 14,0 C15,9 6,13 -4,12 C-12,10 -14,-4 -10,-11 Z" fill={PAL.skin} />
					<path d="M10,-6 C22,-6 34,-4 40,-2 C40,1 38,2 34,2 C26,2 18,1 10,2 Z" fill={PAL.skin} />
					<path d="M-4,12 C4,12 12,8 14,1 C10,6 2,9 -6,9 Z" fill={PAL.skinS} />
				</g>
			</g>; })()}
	</g>; };
const ShotA: React.FC<{t: number}> = ({t}) => {
	const GX = 1175, GG = 800, FG = 1030, S = 3.1 / 4.98, lampX = 560, lampK = 2.7, lampG = 988, flY = lampG - 117 * lampK, cx = 1300, cy = FG - 750 * S;
	/* camera: a slow push-in on the group (front plane 6 %, the gate plane 3.5 %: parallax) */
	const u = ease(cl(t / 4.64)), zf = zoom(1060, 720, 1 + 0.06 * u), zb = zoom(1060, 720, 1 + 0.035 * u);
	/* acting: the rod rises (−14° → 0 by 1.7 s, ease-out) and hovers with a tremble; he coils back a little; the man strains */
	const rise = -14 * (1 - eout(cl(t / 1.7))) + 1.1 * Math.sin(t * 2.4) * seg(t, 1.2, 2) + 0.5 * Math.sin(t * 7.1 + 1) * seg(t, 1.6, 2.4);
	const coil = 1.6 * eio(cl(t / 2.2));
	const st = 3.4 * Math.sin(t * 2.9) * Math.max(0, Math.sin(t * 1.3 + 0.4)) + 1.6 * Math.sin(t * 6.3 + 2) * 0.4;
	const hu = 6 * Math.max(0, Math.sin(t * 1.7 + 0.8));
	const wr = rotAbout(UNC_W, st, [0, -10]), so = rotAbout(UNC_S, st, [0, -10]);
	const gA = {x: 730, y: FG + 6}, gB = {x: 1000, y: 994};
	const uX = 1040, uY = FG + 2;
	const rA: P = [(uX + 3.1 * wr[0] - gA.x) / 3.1, (uY + 3.1 * wr[1] - gA.y) / 3.1], rB: P = [(uX + 3.1 * so[0] - gB.x) / 2.86, (uY + 3.1 * so[1] - gB.y) / 2.86];
	return <svg width={W} height={H} style={{position: 'absolute'}}>
		<defs>
			<SkyDefs p="oa" />
			<radialGradient id="oakey" cx={lampX} cy={flY} r="980" gradientUnits="userSpaceOnUse" gradientTransform={`translate(${lampX} ${flY}) scale(1 0.66) translate(${-lampX} ${-flY})`}><stop offset="0" stopColor={KEY} stopOpacity="0.6" /><stop offset="0.32" stopColor="#D9A877" stopOpacity="0.3" /><stop offset="1" stopColor="#D9A877" stopOpacity="0" /></radialGradient>
			<RimF id="oacao" lx={1} ly={-0.3} k={5} c="#FFE0B0" o={0.95} lx2={-1} ly2={-0.2} k2={4} c2={ACC} o2={0.95} blur={1} />
			<RimF id="oarimL" lx={-1} ly={-0.35} k={3.2} c={RIMW} o={0.95} />
			<RimF id="oarimTop" lx={0} ly={-1} k={1.6} c="#9FB8B6" o={0.5} />
		</defs>
		<g transform={zb}>
			<rect x={-100} y={-100} width={W + 200} height={H + 200} fill="url(#oasky)" />
			{Array.from({length: 50}, (_, i) => <circle key={i} cx={rnd(i, 7) * W} cy={rnd(i, 8) * 300} r={0.8 + rnd(i, 9) * 1.2} fill="#E8EEE6" opacity={(0.2 + rnd(i, 4) * 0.4) * (0.8 + 0.2 * Math.sin(t * (1 + rnd(i, 5) * 2) + i))} />)}
			<g filter="url(#oabl3)">
				<path d="M-120,452 L120,452 L140,430 L330,430 L350,452 L560,452 L572,436 L700,436 L712,452 L1500,452 L1516,426 L1720,426 L1736,452 L2040,452 L2040,520 L-120,520 Z" fill="#2B3534" />
				<g fill="#28312F"><g transform="translate(1660,470) scale(0.6)">{QueD}</g><g transform="translate(1850,470) scale(0.6) scale(-1,1)">{QueD}</g></g>
			</g>
			<rect x={-100} y={400} width={W + 200} height={140} fill="url(#oahaze)" />
			<rect x={-120} y={476} width={2160} height={GG - 476} fill="#3A3029" />
			<rect x={-120} y={460} width={2160} height={360} fill="url(#oakey)" opacity={0.94 + 0.06 * flick(t, 5).s} />
			{Array.from({length: 24}, (_, i) => <path key={i} d={`M-120,${486 + i * 13} L2040,${486 + i * 13}`} stroke="#000" strokeOpacity={0.13} strokeWidth={1.2} />)}
			<g filter="url(#oarimTop)"><path d="M-120,482 L2040,482 L2040,466 C1700,462 200,462 -120,466 Z" fill="#1E1B19" /></g>
			{Array.from({length: 88}, (_, i) => <circle key={i} cx={-110 + i * 25} cy={482} r={3.2} fill="#2C2826" />)}
			<g>
				<rect x={GX - 250} y={GG - 14} width={500} height={14} fill="#2A231E" /><rect x={GX - 250} y={GG - 14} width={500} height={3} fill="#E0B47A" opacity={0.25} />
				<rect x={GX - 132} y={GG - 410} width={264} height={396} fill="#3B2622" />
				<rect x={GX - 132} y={GG - 410} width={264} height={396} fill="url(#oakey)" opacity={0.55} />
				<rect x={GX - 1.5} y={GG - 410} width={3} height={396} fill="#120C0A" />
				{Array.from({length: 5}, (_, r) => [-100, -70, 70, 100].map((dx) => <circle key={`${r}${dx}`} cx={GX + dx} cy={GG - 370 + r * 70} r={3} fill="#8C6A44" opacity={0.7} />))}
				<circle cx={GX - 20} cy={GG - 200} r={9} fill="none" stroke="#B08A54" strokeWidth={3} /><circle cx={GX + 20} cy={GG - 200} r={9} fill="none" stroke="#7A5E3C" strokeWidth={3} />
				{[GX - 162, GX + 138].map((x) => <rect key={x} x={x} y={GG - 432} width={24} height={418} fill="#1E1714" />)}
				<rect x={GX - 170} y={GG - 440} width={340} height={16} fill="#1E1714" />
				{Array.from({length: 8}, (_, i) => <g key={i} fill="#1C1612"><rect x={GX - 182 + i * 50} y={GG - 456} width={20} height={13} /><rect x={GX - 188 + i * 50} y={GG - 461} width={32} height={6} /></g>)}
				<path d={`M${GX - 290},${GG - 460} C${GX - 170},${GG - 466} ${GX + 170},${GG - 466} ${GX + 290},${GG - 460} L${GX + 294},${GG - 469} C${GX + 262},${GG - 476} ${GX + 220},${GG - 498} ${GX + 176},${GG - 524} L${GX - 176},${GG - 524} C${GX - 220},${GG - 498} ${GX - 262},${GG - 476} ${GX - 294},${GG - 469} Z`} fill="url(#oaroof)" />
				<path d={`M${GX - 186},${GG - 522} L${GX + 186},${GG - 522} L${GX + 195},${GG - 534} L${GX + 186},${GG - 530} L${GX - 186},${GG - 530} L${GX - 195},${GG - 534} Z`} fill="#141414" />
				{Array.from({length: 26}, (_, i) => <path key={i} d={`M${GX - 172 + i * 13.8},${GG - 520} L${GX - 282 + i * 22.6},${GG - 464}`} stroke="#5A6466" strokeOpacity={0.3} strokeWidth={1.2} />)}
				{Array.from({length: 27}, (_, i) => <circle key={i} cx={GX - 286 + i * 22} cy={GG - 463} r={2.8} fill="#4A5254" opacity={0.7} />)}
			</g>
			<Rack x={GX - 200 - 196 - 30} y={GG} w={196} h={168} />
			<Rack x={GX + 230} y={GG} w={196} h={168} dim={0.86} />
			<rect x={-120} y={GG} width={2160} height={H - GG + 120} fill="url(#oagnd)" />
		</g>
		<g transform={zf}>
			<ellipse cx={900} cy={FG - 20} rx={720} ry={110} fill="url(#oapool)" opacity={0.92 + 0.08 * flick(t, 5).s} />
			<LampStand x={lampX} y={lampG} k={lampK} />
			<Flame x={lampX} y={flY} s={lampK} t={t} seed={5} ivory glow={1.6} />
			<g fill="#3A2C23" filter="url(#oarimL)"><g transform={`translate(${gB.x},${gB.y}) scale(2.86) rotate(4)`}><Gripper rx={rB[0]} ry={rB[1]} lean={-0.4 * st} /></g></g>
			<g fill={SIL} filter="url(#oarimL)">
				<g transform={`translate(${uX},${uY}) scale(3.1)`}><UncleA st={st} hu={hu} /></g>
				<g transform={`translate(${gA.x},${gA.y}) scale(3.1) rotate(-3)`}><Gripper rx={rA[0]} ry={rA[1]} lean={-1.2 - 0.5 * st} /></g>
				<g transform={`translate(1150,${FG + 8}) scale(3.1) rotate(-70)`}><path d="M-8,-1 C-8.8,-7 -7,-11.6 -1.6,-13.2 L8.4,-13.4 C11,-12 12,-9 12,-6 C8,-7 3,-7 -1,-5 Z M-6.8,-10.6 L10.4,-11.4 L11.2,-29 L-5.4,-19.6 Z" /></g>
			</g>
			<ellipse cx={cx} cy={FG + 4} rx={170} ry={12} fill="#0A0605" opacity={0.55} />
			<g transform={`translate(${cx},${cy}) scale(${-S},${S})`} filter="url(#oacao)"><CaoStrikeA id="oas" rise={rise} coil={coil} look={-1.5 * Math.sin(t * 1.1)} /></g>
		</g>
		<rect width={W} height={H} fill="url(#oavig)" />
	</svg>; };

/* =====================================================================================================================
   OPEN · shot B (4.638–8.622): close along a 五色棒 rack; the camera glides right ~10 px/frame; a hand draws one rod out of frame
   ===================================================================================================================== */
const ShotB: React.FC<{t: number}> = ({t}) => {
	/* a slow glide (4–5 px/frame): the rods are high-contrast stripes, so anything faster strobes */
	const PAN = (mm: number) => 120 * mm + 6 * mm * mm, t0 = BAR(2), m = t - t0, pan = PAN(m), push = 1 + 0.025 * ease(cl(m / 4));
	const RX0 = 120, SP = 74, N = 52, TOP = 372, BOT = 960, r = 21;
	/* the rod a hand draws out: the one passing screen x ≈ 1180 at m = 2.0 */
	const kPull = Math.round((1120 + PAN(2) - RX0) / SP), pullU = eio(cl((m - 2.25) / 0.7)), handIn = ease(cl((m - 1.6) / 0.5)) * (1 - ease(cl((m - 2.95) / 0.4)));
	const rods = Array.from({length: N}, (_, i) => { const x = RX0 + i * SP + (rnd(i, 3) - 0.5) * 6, tilt = (rnd(i, 4) - 0.5) * 2.2, lift = i === kPull ? -760 * pullU : 0;
		return {x, tilt, lift, ph: (i * 2 + Math.floor(rnd(i, 5) * 2)) % 5, top: TOP + (i % 2) * 14 + rnd(i, 6) * 8}; });
	const lampSX = 260 - pan * 0.25;           // the lamp is off screen left; its light falls off to the right
	return <svg width={W} height={H} style={{position: 'absolute'}}>
		<defs>
			<radialGradient id="obkey" cx={lampSX} cy={520} r="1500" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor={KEY} stopOpacity="0.5" /><stop offset="0.45" stopColor="#D9A877" stopOpacity="0.18" /><stop offset="1" stopColor="#D9A877" stopOpacity="0" /></radialGradient>
			<linearGradient id="obdark" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.38" /></linearGradient>
			<linearGradient id="obtop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#000" stopOpacity="0.6" /><stop offset="1" stopColor="#000" stopOpacity="0" /></linearGradient>
			<filter id="obbl" x="-20%" y="-5%" width="140%" height="110%"><feGaussianBlur stdDeviation="9" /></filter>
			<filter id="obdof" x="-2%" y="-2%" width="104%" height="104%"><feGaussianBlur stdDeviation="2" /></filter>
			<RimF id="obrim" lx={-1} ly={-0.4} k={3} c={RIMW} o={0.9} />
		</defs>
		<g transform={zoom(960, 640, push)}>
			{/* the rammed-earth wall behind the rack (parallax 0.6), lit by the lamp off left */}
			<g transform={`translate(${f1(-pan * 0.6)},0)`} filter="url(#obdof)">
				<rect x={-200} y={-50} width={4200} height={1200} fill="#3A3029" />
				{Array.from({length: 70}, (_, i) => <path key={i} d={`M-200,${-40 + i * 17} L4000,${-40 + i * 17 + (i % 2 ? 1 : -1)}`} stroke="#000" strokeOpacity={0.14} strokeWidth={1.6} />)}
				{Array.from({length: 70}, (_, i) => <path key={'h' + i} d={`M-200,${-38 + i * 17} L4000,${-38 + i * 17}`} stroke={KEY} strokeOpacity={0.05} strokeWidth={1.2} />)}
			</g>
			<rect x={-100} y={-100} width={W + 200} height={H + 200} fill="url(#obkey)" opacity={0.93 + 0.07 * flick(t, 5).s} />
			{/* the rack: posts, rails and the rods (parallax 1) */}
			<g transform={`translate(${f1(-pan)},0)`}>
				{Array.from({length: 11}, (_, i) => <rect key={i} x={RX0 - 50 + i * 420} y={TOP - 40} width={26} height={BOT - TOP + 60} fill="#2E2218" />)}
				<rect x={RX0 - 70} y={TOP + 30} width={N * SP + 120} height={22} fill="#4A3626" /><rect x={RX0 - 70} y={TOP + 30} width={N * SP + 120} height={5} fill="#E0B47A" opacity={0.55} />
				{rods.map((d, i) => <g key={i} transform={`translate(0,${f1(d.lift)})`}><Rod5 a={[d.x, BOT - 6]} b={[d.x + d.tilt * 10, d.top]} r={r} ph={d.ph} lit={-1} /></g>)}
				<rect x={RX0 - 70} y={TOP + 330} width={N * SP + 120} height={18} fill="#3A2A1E" opacity={0.95} /><rect x={RX0 - 70} y={TOP + 330} width={N * SP + 120} height={4} fill="#E0B47A" opacity={0.42} />
				<rect x={RX0 - 80} y={BOT - 20} width={N * SP + 140} height={40} fill="#2E2218" /><rect x={RX0 - 80} y={BOT - 20} width={N * SP + 140} height={5} fill="#E0B47A" opacity={0.4} />
				{/* the empty slot's shadow once the rod is gone */}
				<rect x={RX0 + kPull * SP - 18} y={BOT - 30} width={36} height={10} fill="#000" opacity={0.35 * pullU} />
				{/* a sleeved forearm and hand (a runner, silhouette) comes in from above, grips, draws the rod up and away */}
				{handIn > 0.001 && <g fill={SIL} filter="url(#obrim)" transform={`translate(${f1(RX0 + kPull * SP + 4)},${f1(-520 + 900 * handIn - 760 * pullU)})`}>
					<path d="M-40,-420 C-20,-300 -6,-160 -10,-10 L30,-6 C40,-150 30,-300 20,-420 Z" />
					<path d="M-34,-60 C-50,-40 -56,-10 -40,8 L36,10 C46,-12 44,-40 30,-60 Z" />
					<path d="M-22,0 C-30,10 -30,30 -18,40 L24,40 C36,30 36,10 26,0 Z" />
				</g>}
			</g>
			{/* a foreground post, out of focus (parallax 1.45) */}
			<g transform={`translate(${f1(-pan * 1.45)},0)`} filter="url(#obbl)" fill="#0B0706">
				<rect x={1560} y={-40} width={90} height={1160} /><rect x={3000} y={-40} width={90} height={1160} />
			</g>
			<rect x={-100} y={-100} width={W + 200} height={H + 200} fill="url(#obdark)" />
			<rect x={-100} y={-100} width={W + 200} height={480} fill="url(#obtop)" />
		</g>
	</svg>; };

/* =====================================================================================================================
   OPEN · shot C (8.622–16.59): the wide 洛阳 gate at curfew (the sheet's set, full frame), a patrol walking, a slow crane up;
   under the title (12.61–16.59) the same wide keeps drifting, a little darker
   ===================================================================================================================== */
const ShotC: React.FC<{t: number}> = ({t}) => {
	const m = t - BAR(4), u = eio(cl(m / 8)), SC = 1920 / 1120, GY = 520;
	/* crane up: nearer planes sink more; the whole frame eases in 5 % */
	const dyP = (k: number) => k * 34 * u, zs = 1 + 0.05 * u;
	const fl = 1 + 0.035 * Math.sin(t * 5.3) + 0.02 * Math.sin(t * 11.9 + 1);
	const stars = Array.from({length: 46}, (_, i) => [rnd(i, 1) * 1120, rnd(i, 2) * 230, 0.6 + rnd(i, 3) * 1.1, 0.25 + rnd(i, 4) * 0.5]);
	const dark = 0.36 * seg(t, BAR(6) - 0.25, BAR(6) + 0.3);
	/* the patrol: two 戟 guards walking right along the road in front of the gate (sheet coords, k 0.46 px/cm, ground y 584) */
	const pk = 0.46, patrol = [{x0: 150, t0: 0.2, L: 66, f: 1.82, sw: 1.1, ln: 3}, {x0: 92, t0: 0.65, L: 63, f: 1.76, sw: 0.85, ln: 4}];
	return <svg width={W} height={H} style={{position: 'absolute'}}>
		<defs>
			<SkyDefs p="oc" />
			<RimF id="ocQL" lx={1} ly={0} k={3} c={RIMW} o={0.9} lx2={-0.3} ly2={-1} k2={2} c2="#9FB8B6" o2={0.55} />
			<RimF id="ocQR" lx={-1} ly={0} k={3} c={RIMW} o={0.9} lx2={0.3} ly2={-1} k2={2} c2="#9FB8B6" o2={0.55} />
			<RimF id="ocBk" lx={-1} ly={-0.2} k={1.6} c="#FFE2B4" lx2={1} ly2={-0.2} k2={1.6} c2="#FFE2B4" />
			<RimF id="ocPt" lx={-0.7} ly={-0.7} k={1.8} c={RIMW} o={0.85} />
			<linearGradient id="ocspill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={KEY} stopOpacity="0.62" /><stop offset="1" stopColor={KEY} stopOpacity="0.06" /></linearGradient>
			<linearGradient id="ochaze1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6E7670" stopOpacity="0" /><stop offset="0.7" stopColor="#6E7670" stopOpacity="0.5" /><stop offset="1" stopColor="#6E7670" stopOpacity="0.1" /></linearGradient>
		</defs>
		<g transform={`${zoom(960, 560, zs)} scale(${SC})`}>
			<g transform={`translate(0,${f1(dyP(0.1))})`}>
				<rect x={-60} y={-80} width={1240} height={760} fill="url(#ocsky)" />
				{stars.map(([x, y, r, o], i) => <circle key={i} cx={x} cy={y} r={r} fill="#E8EEE6" opacity={o * (0.8 + 0.2 * Math.sin(t * (1 + rnd(i, 5) * 3) + i))} />)}
				<circle cx={905} cy={96} r={150} fill="url(#ocmoon)" /><circle cx={905} cy={96} r={25} fill="#E4E8DC" />
			</g>
			<g transform={`translate(${f1(-6 * u)},${f1(dyP(0.3))})`} filter="url(#ocbl3)">
				<path d="M-60,262 C80,232 170,222 260,240 C340,214 430,206 520,226 C620,198 760,208 860,232 C940,214 1040,218 1180,240 L1180,320 L-60,320 Z" fill="#2E3B3B" />
				<path d="M-60,286 L40,286 L52,270 L150,270 L162,286 L230,286 L238,276 L296,276 L304,286 L830,286 L840,268 L950,268 L962,286 L1010,286 L1018,274 L1084,274 L1092,286 L1180,286 L1180,320 L-60,320 Z" fill="#26302F" />
			</g>
			<rect x={-60 - (m * 4) % 200} y={210} width={1440} height={110} fill="url(#ochaze1)" />
			<g transform={`translate(0,${f1(dyP(0.55))})`}>
				<g filter="url(#ocdof)"><GateWall t={t} p="oc" x0={-80} x1={1200} /></g>
				<g fill={SIL} filter="url(#ocBk)"><Npc x={503} y={GY} k={0.37} kind="ji" /><Npc x={617} y={GY} k={0.37} kind="ji" flip /></g>
				<LampStand x={480} y={GY} k={0.37} /><Flame x={480} y={GY - 117 * 0.37} s={0.37} t={t} seed={11} ivory />
				<LampStand x={640} y={GY} k={0.37} /><Flame x={640} y={GY - 117 * 0.37} s={0.37} t={t} seed={23} ivory />
				<rect x={-80} y={GY} width={1300} height={200} fill="url(#ocgnd)" />
				<path d={`M514,${GY} L606,${GY} L800,700 L320,700 Z`} fill="url(#ocspill)" opacity={fl} />
				<path d={`M398,${GY} L462,${GY} L330,700 L200,700 Z M658,${GY} L722,${GY} L920,700 L790,700 Z`} fill="url(#ocspill)" opacity={0.42 * fl} />
			</g>
			<rect x={-60 + (m * 6) % 300 - 300} y={440} width={1600} height={130} fill="url(#ochaze)" />
			<g transform={`translate(0,${f1(dyP(0.75))})`}>
				<g fill={SIL} filter="url(#ocQL)"><g transform="translate(196,556) scale(1.02,1.02) scale(-1,1)">{QueD}</g></g>
				<g fill={SIL} filter="url(#ocQR)"><g transform="translate(924,556) scale(1.02)">{QueD}</g></g>
				{/* the patrol on the road (their own walk clocks; not on the beat) */}
				{patrol.map((g, i) => <g key={i} fill={SIL} filter="url(#ocPt)" transform={`translate(${g.x0},590) scale(${pk})`}><NpcWalk t={m} kind="ji" t0={g.t0} L={g.L} f={g.f} swing={g.sw} lean={g.ln} /></g>)}
			</g>
			<g transform={`translate(${f1(-10 * u)},${f1(dyP(1.4))})`} filter="url(#ocbl8)" fill="#0B0706">
				<path d="M-60,-60 L760,-60 L760,6 C540,18 270,34 -60,62 Z" />
				{Array.from({length: 34}, (_, i) => <circle key={i} cx={-40 + i * 23.5} cy={56 - i * 1.9} r={7.5} />)}
				<rect x={-60} y={-60} width={92} height={800} />
			</g>
			<rect x={-100} y={-100} width={1320} height={830} fill="url(#ocvig)" />
		</g>
		<rect width={W} height={H} fill="#06080A" opacity={dark} />
	</svg>; };
export const Open: React.FC<{t: number}> = ({t}) => t < BAR(2) ? <ShotA t={t} /> : t < BAR(4) ? <ShotB t={t} /> : <ShotC t={t} />;

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
