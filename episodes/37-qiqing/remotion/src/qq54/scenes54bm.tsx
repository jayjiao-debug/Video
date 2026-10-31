import React from 'react';
import {W, H} from '../qq50/kit50';
import {Cao, Pal, RimF, Rod5, strand, qpts, rnd, f1, P} from './cao54b';
import {Npc, LampStand} from './npc54b';
import {CaoWalk, caoHipX, NpcWalk, npcTorchAt, Flame, flick} from './rig54b';
/* ep54 look B · key scenes owned by the rig/motion builder: K1 the hook (174, the 北部尉 gate), K7 the flight (189, also the
   6-s motion test MOT54). Both use the 铜灯影 grammar: depth planes with haze between, one key on its own object, warm-black
   NPC silhouettes with a key rim, 曹操 drawn (cel-shaded) with his cool 石青 accent rim. */
const SIL = '#140D0A', RIMW = '#FFB070', KEY = '#F3DDB4', ACC = '#8FD0DC';
const PAL: Pal = {skin: '#C38D64', skinS: '#9C6848', skinH: '#E8BC8E', hair: '#15100E', robe: '#262A31', robeS: '#16181C', robeH: '#575B62', trim: '#5C2E24',
	metal: '#3C3B3A', metalS: '#1B1A1A', metalH: '#9A968C', lace: '#6E2C22', under: '#55302A', underS: '#2E1915', cape: '#2C1716', capeS: '#170B0B', gold: '#C09A52', line: '#2A1810'};

/* ---------- the 洛阳 gate wall (sheet coordinates: ground y 520, central passage x 560); long, for a tracking camera ---------- */
const GateWall: React.FC<{t: number; x0?: number; x1?: number}> = ({t, x0 = -700, x1 = 1900}) => {
	const GY = 520, fl = 1 + 0.035 * Math.sin(t * 5.3) + 0.02 * Math.sin(t * 11.9 + 1);
	const pass = (cx: number, w: number, h: number, k: string) => <g key={k}>
		<rect x={cx - w / 2 - 8} y={GY - h - 10} width={w + 16} height={h + 10} fill="#1A1410" />
		<rect x={cx - w / 2} y={GY - h} width={w} height={h} fill="url(#k7psg)" opacity={fl} />
		{[0.12, 0.3, 0.7, 0.88].map((u) => <rect key={u} x={cx - w / 2 + w * u - 2} y={GY - h} width={4} height={h} fill="#3A2A1E" opacity={0.55} />)}
		<rect x={cx - w / 2 - 8} y={GY - h - 10} width={w + 16} height={8} fill="#2A1E16" />
	</g>;
	const n = Math.ceil((x1 - x0) / 26);
	return <g>
		<rect x={x0} y={300} width={x1 - x0} height={GY - 300} fill="#332B24" />
		<rect x={x0} y={300} width={x1 - x0} height={GY - 300} fill="url(#k7wallG)" opacity={fl} />
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
		<path d="M318,192 C420,186 700,186 802,192 L806,184 C790,180 760,166 708,138 L412,138 C360,166 330,180 314,184 Z" fill="url(#k7roof)" />
		<path d="M404,140 L716,140 L724,128 L716,132 L404,132 L396,128 Z" fill="#141414" />
		{Array.from({length: 30}, (_, i) => <path key={i} d={`M${420 + i * 9.6},142 L${326 + i * 16.4},188`} stroke="#5A6466" strokeOpacity={0.35} strokeWidth={1.2} />)}
		{Array.from({length: 31}, (_, i) => <circle key={i} cx={322 + i * 15.9} cy={189} r={2.4} fill="#4A5254" opacity={0.7} />)}
	</g>; };
/** a Han 阙 (母阙 + 子阙), base centre (0,0) in its own units (sheet units) */
const QueD = <g>
	<path d="M28,-16 L72,-16 L68,-140 L30,-140 Z M22,-140 L96,-136 C90,-142 84,-150 80,-162 L28,-164 Z M32,-164 L76,-164 L74,-170 L34,-170 Z" />
	<rect x={-42} y={-18} width={84} height={18} /><path d="M-32,-16 L32,-16 L28,-212 L-28,-212 Z" /><rect x={-35} y={-224} width={70} height={12} />
	{[-34, -20, -6, 8, 22].map((bx) => <rect key={bx} x={bx} y={-240} width={11} height={16} />)}
	<rect x={-40} y={-244} width={80} height={6} /><rect x={-36} y={-266} width={72} height={22} />
	<path d="M-80,-262 L80,-262 L80,-267 L54,-294 L-54,-294 L-80,-267 Z" /><rect x={-30} y={-312} width={60} height={18} />
	<path d="M-63,-308 L63,-308 L63,-312 L36,-336 L-36,-336 L-63,-312 Z" /><path d="M-42,-336 L42,-336 L45,-344 L-45,-344 Z" />
</g>;
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

/* ---------- K7: the flight, 189 (the motion test). 曹操 (35, disguised) walks right out of the gate passage and away. ---------- */
const CAMV = 240;                       // px/s at the road plane
const PX = {sky: 0.04, far: 0.2, wall: 0.6, que: 0.75, mid: 0.82, road: 1, fg: 1.38};
const S7 = 0.55, CAO0 = 640, ROADY = 1000;
export const K7: React.FC<{t?: number}> = ({t = 2.2}) => {
	const cam = CAMV * t, sx = (p: number) => -cam * p;
	/* wall plane: sheet coords ×2, central passage at screen x 700 at t = 0, ground y 800 */
	const WG = 2, WX = 700 - 560 * WG, WY = 800 - 520 * WG;
	/* 曹操: hip world x in Cao units; screen x = CAO0 + (hip − hip0)·S − cam */
	const cx = CAO0 + (caoHipX(t) - caoHipX(0)) * S7 - cam, cy = ROADY - 750 * S7;
	/* guards on the wall plane, walking left (k 0.74 px/cm at ground 800) */
	const gk = 0.74, guards = [{x0: 1560, t0: 0.3}, {x0: 1700, t0: 0.85}];
	/* torch-bearer in the mid-ground, walking left (k 1.7, ground 900) */
	const tk = 1.7, tx = 2050 + sx(PX.mid) - npcHipXs(t, 0.2, 70, 1.9) * tk, ty = 905;
	const tch = npcTorchAt(t, 70, 1.9, 0.2), tfx = tx - (tch[0] - npcHipXs(t, 0.2, 70, 1.9)) * tk, tfy = ty + tch[1] * tk;
	/* a lamp on a stand at the road edge he walks past (plane 0.92, ground 960) */
	const lx = 1150 + sx(0.92), lpx = 1880 + sx(0.92);
	const hz = (t * 7) % 400;
	return <svg width={W} height={H} style={{position: 'absolute'}}>
		<defs>
			<SkyDefs p="k7" />
			<RimF id="k7cao" lx={-1} ly={-0.25} k={5} c="#FFD9A8" o={0.95} lx2={1} ly2={-0.25} k2={4} c2={ACC} o2={0.9} blur={1} />
			<RimF id="k7rimW" lx={0} ly={-1} k={1.6} c={RIMW} o={0.85} lx2={-1} ly2={0} k2={1.4} c2={RIMW} o2={0.6} />
			<RimF id="k7rimT" lx={1} ly={-0.6} k={2.6} c="#FFC27A" o={0.95} />
			<RimF id="k7rimQ" lx={-1} ly={-0.1} k={3} c={RIMW} o={0.8} lx2={0} ly2={-1} k2={2} c2="#9FB8B6" o2={0.5} />
		</defs>
		{/* P0 sky, stars, moon */}
		<rect width={W} height={H} fill="url(#k7sky)" />
		<g transform={`translate(${sx(PX.sky)},0)`}>
			{Array.from({length: 70}, (_, i) => <circle key={i} cx={rnd(i, 1) * 2100} cy={rnd(i, 2) * 380} r={0.8 + rnd(i, 3) * 1.4} fill="#E8EEE6" opacity={(0.25 + rnd(i, 4) * 0.5) * (0.8 + 0.2 * Math.sin(t * (1 + rnd(i, 5) * 3) + i))} />)}
			<circle cx={1130} cy={120} r={230} fill="url(#k7moon)" /><circle cx={1130} cy={120} r={34} fill="#EEF0E6" />
		</g>
		{/* P1 far hills / inner-city roofs */}
		<g transform={`translate(${sx(PX.far)},0)`} filter="url(#k7bl3)">
			<path d="M-200,330 C0,290 200,280 400,306 C600,270 800,262 1000,290 C1200,256 1400,266 1600,296 C1800,270 2000,276 2300,300 L2300,420 L-200,420 Z" fill="#2E3B3B" />
			<path d="M-200,350 L200,350 L220,326 L380,326 L400,350 L1500,350 L1520,330 L1700,330 L1720,350 L2300,350 L2300,420 L-200,420 Z" fill="#26302F" />
		</g>
		{/* P2 the wall with the 门楼 and the three passages; lamps on stands at the passage */}
		<g transform={`translate(${sx(PX.wall)},0)`}>
			<g filter="url(#k7dof)"><g transform={`translate(${WX},${WY}) scale(${WG})`}><GateWall t={t} x0={-700} x1={1900} /></g></g>
			<rect x={-800} y={800} width={4400} height={140} fill="#2A231D" />
			<ellipse cx={700} cy={806} rx={420} ry={60} fill="url(#k7pool)" />
			{[[700 - 150, 11], [700 + 150, 23]].map(([x, sd]) => <g key={sd}><LampStand x={x} y={800} k={0.74} />
				<Flame x={x} y={800 - 117 * 0.74} s={0.74} t={t} seed={sd} ivory /></g>)}
			{/* guards on their beat, walking left past the gate */}
			{guards.map((g, i) => <g key={i} fill={SIL} filter="url(#k7rimW)" transform={`translate(${g.x0},800) scale(${-gk},${gk})`}><NpcWalk t={t} kind="ji" t0={g.t0} /></g>)}
		</g>
		<rect x={-50 - hz} y={700} width={2420} height={170} fill="url(#k7haze)" />
		{/* P3 the right 阙, nearer than the wall */}
		<g transform={`translate(${sx(PX.que)},0)`} fill={SIL} filter="url(#k7rimQ)"><g transform="translate(1960,858) scale(1.55)">{QueD}</g></g>
		{/* mid-ground ground plane and the torch-bearer */}
		<rect y={860} width={W} height={220} fill="url(#k7gnd)" />
		<g fill={SIL} filter="url(#k7rimT)" transform={`translate(${f1(tx + npcHipXs(t, 0.2, 70, 1.9) * tk)},${ty}) scale(${-tk},${tk})`}><NpcWalk t={t} kind="torch" L={70} f={1.9} t0={0.2} /></g>
		<ellipse cx={tfx} cy={ty + 6} rx={200} ry={26} fill="url(#k7pool)" opacity={0.7 * flick(t, 3).s} />
		<Flame x={tfx} y={tfy} s={1.7} t={t} seed={3} glow={1.3} />
		{/* the road-edge lamp he walks past */}
		<ellipse cx={lx} cy={968} rx={260} ry={34} fill="url(#k7pool)" opacity={0.85} />
		<LampStand x={lx} y={962} k={2.2} /><Flame x={lx} y={962 - 117 * 2.2} s={2.2} t={t} seed={41} ivory glow={1.2} />
		<LampStand x={lpx} y={962} k={2.2} /><Flame x={lpx} y={962 - 117 * 2.2} s={2.2} t={t} seed={57} ivory glow={1.2} />
		{/* P4 曹操 on the road */}
		<ellipse cx={cx} cy={ROADY + 2} rx={120} ry={10} fill="#0A0605" opacity={0.55} />
		<g filter="url(#k7cao)"><g transform={`translate(${f1(cx - caoHipX(t) * S7)},${f1(cy)}) scale(${S7})`}>
			<CaoWalk t={t} pal={{...PAL, skin: '#BE8A62'}} id="k7c" bow={11} robe="#2F2B27" robeS="#1B1815" robeH="#5E564C" trim="#3A3029" />
		</g></g>
		{/* P5 foreground hitching posts, out of focus, fast parallax */}
		<g transform={`translate(${sx(PX.fg)},0)`} filter="url(#k7bl8)" fill="#0A0605">
			{[1500, 2300, 3100].map((x) => <g key={x}><rect x={x} y={850} width={46} height={240} /><rect x={x - 170} y={898} width={400} height={22} /></g>)}
		</g>
		<rect width={W} height={H} fill="url(#k7vig)" />
	</svg>; };
/** NpcWalk hip x (cm) helper with the walker's own clock */
const npcHipXs = (t: number, t0: number, L = 64, f = 1.8) => { const s = (t + t0) * f; return L * s - L / 2; };

/* ---------- K1: the hook, 174. The 北部尉 office gate at night, 五色棒 racks both sides; the rod raised over 蹇硕's uncle. ---------- */
const S1 = 0.75;
const Rack: React.FC<{x: number; y: number; w: number; h: number; dim?: number}> = ({x, y, w, h, dim = 1}) => { const n = 10;
	return <g opacity={dim}>
		<rect x={x} y={y - h} width={12} height={h} fill="#3A2A1E" /><rect x={x + w - 12} y={y - h} width={12} height={h} fill="#3A2A1E" />
		{Array.from({length: n}, (_, i) => <Rod5 key={i} a={[x + 20 + i * (w - 40) / (n - 1), y - 8]} b={[x + 16 + i * (w - 40) / (n - 1) + (i % 3) * 2, y - h - 18 + (i % 2) * 6]} r={7} ph={(i * 2) % 5} lit={-1} />)}
		<rect x={x - 6} y={y - h + 10} width={w + 12} height={11} fill="#4A3626" /><rect x={x - 6} y={y - h + 10} width={w + 12} height={3} fill="#E0B47A" opacity={0.55} />
		<rect x={x - 4} y={y - h * 0.42} width={w + 8} height={9} fill="#3A2A1E" /><rect x={x - 4} y={y - h * 0.42} width={w + 8} height={2.4} fill="#E0B47A" opacity={0.4} />
		<rect x={x - 8} y={y - 16} width={w + 16} height={18} fill="#2E2218" /><rect x={x - 8} y={y - 16} width={w + 16} height={3} fill="#E0B47A" opacity={0.4} />
	</g>; };
/** the uncle of 蹇硕: an older man of rank in a rich wide-sleeved robe, forced to his knees, arms pulled back so his chest is
    thrust out, head raised toward 曹操, his 进贤冠 knocked askew (cm, facing +x, knees on y = 0); one tone */
const Uncle = <g>
	<path d="M-42,0 C-48,-8 -46,-24 -34,-36 C-28,-42 -22,-50 -20,-60 C-18,-76 -14,-92 -6,-102 C0,-107 10,-107 15,-102 C22,-94 24,-84 23,-74 C25,-60 29,-44 37,-28 C43,-18 49,-8 51,0 Z" />
	<path d="M-50,0 C-52,-6 -48,-10 -40,-10 L50,-8 C55,-6 56,-2 54,0 Z" />
	{/* sash ends and a jade pendant hanging at the hip */}
	<path d="M-22,-56 C-26,-40 -28,-26 -26,-12 L-22,-12 C-23,-26 -20,-40 -17,-54 Z" />
	{/* arms pulled back, the wide sleeves hanging from them */}
	<path d="M-8,-100 C-22,-96 -38,-88 -54,-82 L-52,-76 C-36,-80 -20,-86 -4,-90 Z" />
	<path d="M-26,-90 C-30,-74 -40,-58 -54,-48 C-56,-60 -54,-72 -50,-82 Z" />
	<path d="M-52,-82 C-58,-86 -62,-84 -62,-79 C-62,-75 -57,-74 -53,-76 Z" />
	{/* neck and the head raised (tilted up toward 曹操), a beard */}
	<path d="M0,-104 L12,-104 L14,-114 L2,-116 Z" />
	<g transform="rotate(-18 6 -104) translate(4,44)">
		<path d="M-7,-160 C-7.5,-167 -2,-171 3.5,-171 C8.5,-171 11,-167.5 11.2,-163 L11.6,-160.2 L13.2,-156.6 L11.8,-155.8 C12.2,-154.6 12,-153.2 11.2,-152.2 C11.6,-150.8 11,-149.2 9.6,-148.6 C7,-147.8 4.6,-148.2 3,-149.4 L2.6,-146 L-4,-146 C-5,-150 -6.6,-154 -7,-160 Z" />
		<path d="M4,-150 C5,-143 10,-139 15,-140 C14,-144 13,-148 12,-151 Z" />
		<path d="M-6,-168 C-8,-176 -2,-180 3,-178 C7,-176 6,-170 2,-168 Z" /><path d="M-4,-176 L8,-182" stroke="#140D0A" strokeWidth={1.2} />
	</g>
</g>;
/** a guard gripping with both arms forward (cm, facing +x, soles at 0): reach to (rx, ry) */
const Gripper: React.FC<{rx: number; ry: number}> = ({rx, ry}) => <g>
	<Npc x={0} y={0} k={1} kind="plain" />
	<path d={strand(qpts([4, -132], [rx * 0.5, (ry - 132) / 2 + 8], [rx, ry], 8), (u) => 5.2 - u * 1.4)} /><circle cx={rx} cy={ry} r={4.2} />
	<path d={strand(qpts([0, -130], [rx * 0.45, (ry - 130) / 2 + 14], [rx - 6, ry + 8], 8), (u) => 5 - u * 1.4)} />
</g>;
export const K1: React.FC = () => {
	const GX = 1200, PY = 900, SY = 952;          // gate centre, platform top, street
	const lampX = 860, lampK = 2.6, flY = SY - 117 * lampK;
	/* 曹操: feet on the platform at x 1205, facing left (flip); rod raised high above and behind his head */
	const cx = 1215, cy = PY - 750 * S1;
	const raised = <g>
		{/* the raised near arm: the wide sleeve has fallen back toward the shoulder and hangs from the upper arm */}
		<path d="M24,66 C20,20 4,-26 -12,-62 C-10,-86 -4,-104 2,-112 L22,-104 C16,-90 12,-72 10,-58 C20,-20 34,30 40,80 Z" fill={PAL.robe} />
		<path d="M-12,-62 C-30,-40 -52,0 -60,44 C-54,70 -40,86 -24,92 C-30,60 -24,20 -6,-20 Z" fill={PAL.robe} />
		<path d="M-12,-62 C-30,-40 -52,0 -60,44 C-54,70 -40,86 -24,92 C-36,60 -34,24 -18,-14 Z" fill={PAL.robeS} />
		<path d="M24,66 C20,20 4,-26 -12,-62 L-4,-66 C10,-30 26,16 32,62 Z" fill={PAL.robeH} opacity={0.7} />
		<path d="M2,-112 L22,-104" stroke={PAL.trim} strokeWidth={9} />
		<path d="M4,-112 C6,-124 8,-134 12,-142 L26,-136 C22,-128 20,-118 20,-106 Z" fill={PAL.skin} />
		<path d="M20,-106 C20,-118 22,-128 26,-136 L22,-138 C17,-128 15,-118 15,-108 Z" fill={PAL.skinS} />
		<path d="M4,-150 C14,-158 30,-154 32,-142 C32,-132 22,-128 12,-130 C4,-132 0,-142 4,-150 Z" fill={PAL.skin} />
		<path d="M4,-150 C12,-156 24,-155 30,-148 C22,-148 12,-146 6,-142 Z" fill={PAL.skinH} />
	</g>;
	return <svg width={W} height={H} style={{position: 'absolute'}}>
		<defs>
			<SkyDefs p="k1" />
			<radialGradient id="k1key" cx={lampX} cy={flY} r="900" gradientUnits="userSpaceOnUse" gradientTransform={`translate(${lampX} ${flY}) scale(1 0.7) translate(${-lampX} ${-flY})`}><stop offset="0" stopColor={KEY} stopOpacity="0.62" /><stop offset="0.3" stopColor="#D9A877" stopOpacity="0.3" /><stop offset="1" stopColor="#D9A877" stopOpacity="0" /></radialGradient>
			<RimF id="k1cao" lx={1} ly={-0.3} k={5} c="#FFE0B0" o={0.95} lx2={-1} ly2={-0.2} k2={4} c2={ACC} o2={0.95} blur={1} />
			<RimF id="k1rimR" lx={1} ly={-0.35} k={3.4} c={RIMW} o={0.95} />
			<RimF id="k1rimTop" lx={0} ly={-1} k={2} c="#9FB8B6" o={0.5} />
		</defs>
		<rect width={W} height={H} fill="url(#k1sky)" />
		{Array.from({length: 50}, (_, i) => <circle key={i} cx={rnd(i, 7) * W} cy={rnd(i, 8) * 300} r={0.8 + rnd(i, 9) * 1.2} fill="#E8EEE6" opacity={0.2 + rnd(i, 4) * 0.4} />)}
		{/* far: the roofs of 洛阳's north district and a 阙 pair, hazed */}
		<g filter="url(#k1bl3)">
			<path d="M-20,470 L120,470 L140,446 L330,446 L350,470 L560,470 L572,452 L700,452 L712,470 L1500,470 L1516,440 L1720,440 L1736,470 L1940,470 L1940,560 L-20,560 Z" fill="#2B3534" />
			<g fill="#28312F"><g transform="translate(1640,480) scale(0.75)">{QueD}</g><g transform="translate(1860,480) scale(0.75) scale(-1,1)">{QueD}</g></g>
		</g>
		<rect y={420} width={W} height={160} fill="url(#k1haze)" />
		{/* the office compound wall (rammed earth, tiled coping) */}
		<rect x={-20} y={560} width={1960} height={SY - 560} fill="#3A3029" />
		<rect x={-20} y={540} width={1960} height={360} fill="url(#k1key)" />
		{Array.from({length: 26}, (_, i) => <path key={i} d={`M-20,${572 + i * 13} L1940,${572 + i * 13}`} stroke="#000" strokeOpacity={0.13} strokeWidth={1.3} />)}
		<g filter="url(#k1rimTop)"><path d="M-20,566 L1940,566 L1940,546 C1700,540 200,540 -20,546 Z" fill="#1E1B19" /></g>
		{Array.from({length: 70}, (_, i) => <circle key={i} cx={-10 + i * 28.4} cy={566} r={4} fill="#2C2826" />)}
		{/* the gatehouse (门屋): platform, steps, pillars, closed lacquered doors with 铺首, 斗拱, a straight-ridged roof */}
		<g>
			<rect x={GX - 330} y={PY} width={660} height={SY - PY} fill="#2A231E" />
			{[0, 1, 2].map((i) => <rect key={i} x={GX - 150 - i * 0} y={PY + 2 + i * 22} width={300} height={4} fill="#E0B47A" opacity={0.18} />)}
			<rect x={GX - 330} y={PY} width={660} height={5} fill="#E0B47A" opacity={0.25} />
			<rect x={GX - 170} y={420} width={340} height={PY - 420} fill="#3B2622" />
			<rect x={GX - 170} y={420} width={340} height={PY - 420} fill="url(#k1key)" opacity={0.6} />
			<rect x={GX - 2} y={420} width={4} height={PY - 420} fill="#120C0A" />
			{Array.from({length: 5}, (_, r) => Array.from({length: 4}, (_, c) => <circle key={`${r}${c}`} cx={GX - 150 + c * 30 + (c > 1 ? 180 : 0) - (c > 1 ? 60 : 0)} cy={470 + r * 80} r={4} fill="#8C6A44" opacity={0.7} />))}
			<circle cx={GX - 26} cy={650} r={13} fill="none" stroke="#B08A54" strokeWidth={4} /><circle cx={GX + 26} cy={650} r={13} fill="none" stroke="#7A5E3C" strokeWidth={4} />
			{[GX - 205, GX + 175].map((x) => <rect key={x} x={x} y={392} width={30} height={PY - 392} fill="#1E1714" />)}
			<rect x={GX - 215} y={402} width={430} height={20} fill="#1E1714" />
			{Array.from({length: 9}, (_, i) => <g key={i} fill="#1C1612"><rect x={GX - 228 + i * 54} y={378} width={26} height={16} /><rect x={GX - 236 + i * 54} y={372} width={42} height={7} /></g>)}
			<path d={`M${GX - 330},372 C${GX - 200},364 ${GX + 200},364 ${GX + 330},372 L${GX + 334},362 C${GX + 300},354 ${GX + 250},330 ${GX + 200},300 L${GX - 200},300 C${GX - 250},330 ${GX - 300},354 ${GX - 334},362 Z`} fill="url(#k1roof)" />
			<path d={`M${GX - 212},302 L${GX + 212},302 L${GX + 222},288 L${GX + 212},292 L${GX - 212},292 L${GX - 222},288 Z`} fill="#141414" />
			{Array.from({length: 28}, (_, i) => <path key={i} d={`M${GX - 196 + i * 14.5},304 L${GX - 320 + i * 23.7},368`} stroke="#5A6466" strokeOpacity={0.3} strokeWidth={1.4} />)}
			{Array.from({length: 30}, (_, i) => <circle key={i} cx={GX - 326 + i * 22.5} cy={369} r={3.4} fill="#4A5254" opacity={0.7} />)}
		</g>
		{/* the 五色棒 racks on both sides of the gate (县门左右各十余枚) */}
		<Rack x={GX - 470} y={SY - 4} w={230} h={330} />
		<Rack x={GX + 240} y={SY - 4} w={230} h={330} dim={0.82} />
		<rect y={SY} width={W} height={H - SY} fill="url(#k1gnd)" />
		<ellipse cx={lampX + 40} cy={SY + 30} rx={520} ry={70} fill="url(#k1pool)" />
		{/* the key: a Han lamp on a tall stand */}
		<LampStand x={lampX} y={SY + 4} k={lampK} />
		<Flame x={lampX} y={flY} s={lampK} t={0.4} seed={5} ivory glow={1.5} />
		{/* the held man and his two guards (NPC silhouettes, real proportions, k 3.0 px/cm) */}
		<g fill={SIL} filter="url(#k1rimR)">
			<g transform={`translate(392,${SY + 14}) scale(2.5)`}><Gripper rx={48} ry={-76} /></g>
			<g transform={`translate(660,${SY + 18}) scale(2.5)`}>{Uncle}</g>
			<g transform={`translate(548,${SY + 22}) scale(2.52)`}><Gripper rx={42} ry={-98} /></g>
			{/* his 进贤冠, knocked off, on the ground before him */}
			<g transform={`translate(800,${SY + 22}) scale(2.5) rotate(-70)`}><path d="M-8,-1 C-8.8,-7 -7,-11.6 -1.6,-13.2 L8.4,-13.4 C11,-12 12,-9 12,-6 C8,-7 3,-7 -1,-5 Z M-6.8,-10.6 L10.4,-11.4 L11.2,-29 L-5.4,-19.6 Z" /></g>
		</g>
		{/* 曹操 (20) on the platform, facing left, the 五色棒 raised high */}
		<ellipse cx={cx} cy={PY + 4} rx={110} ry={10} fill="#0A0605" opacity={0.55} />
		<g transform={`translate(${cx},${cy}) scale(${-S1},${S1})`} filter="url(#k1cao)">
			<Cao pal={PAL} id="k1c" old={false} armour={false} arm={{sh: [8, 84], el: [20, 206], hd: [100, 240]}} noArm
				prop="rod" propA={[34, -128]} propB={[-440, -170]} extra={raised} />
		</g>
		<rect width={W} height={H} fill="url(#k1vig)" />
	</svg>; };
export type _P54bm = P;
