import React from 'react';
import {W, H, cl, seg, ease, eout, eio} from '../qq50/kit50';
import {Pal, RimF, Rod5, Dao, Head, strand, qpts, rnd, f1, P} from './cao54b';
import {Npc} from './npc54b';
import {Flame, flick} from './rig54b';
import {GatePlaque, GateGuards} from './gate54op';
/* ep54 · the OPENING rebuilt for retention (film 0 → BAR(8)): six shots cut on the bar downbeats (first frames
   80, 140, 199, 259, 319), each with a camera move and an acting beat; the sets and rigs are the demo's (the old demo54m ShotA/B/C,
   moved here; demo54m.Open now delegates to OpenNew).
     1  0 → BAR(1)      the moment, wide: the 北部尉 gate at night, the uncle straining in the guards' grip, 曹操 raising the rod; push-in 27 %;
                        the lamp throws their big shadows on the wall, swaying with the flame
     2  BAR(1) → BAR(2) close, low angle on 曹操 (20): hard eyes on the man below, the rod high against the sky; the rod starts down in the
                        last half beat (a wrist snap, a streak) and we cut on BAR(2) before any impact
     3  BAR(2) → BAR(3) the racks of 五色棒 (card 2): a fast lateral dolly, a foreground post, a lamp passing, its light sliding over the rods
     4  BAR(3) → BAR(4) the order: the gate head-on, racks both sides; the camera arcs onto the axis; the two 戟 guards snap to attention
                        (beat 2) and ground their 戟 (beat 3)
     5  BAR(4) → BAR(5) 洛阳 (card 3): crane down from the moon onto the wide gate with its plaque; the guards march LEFT in step
     6  BAR(5) → BAR(8) 京师敛迹: closer on the gate; two late walkers hurry in; the doors shut on the beats, the lamps and the 门楼
                        windows go out in rhythm; nearly dark by BAR(6); a slow push runs on under the title (BAR(6) → BAR(8)).
   Cuts are time comparisons, t >= BAR(n) (frames 80, 140, 199, 259, 319), so they land with the subtitle card changes.
   No violence shown: the rod is raised and starts its swing; we cut before any impact. Every flame is warm ivory (orange is the drop's). */
const SIL = '#140D0A', RIMW = '#FFB070', KEY = '#F3DDB4', ACC = '#8FD0DC';
const BAR = (n: number) => 0.654 + 1.99203 * n;
/** the first frame of shots 2–6: the first frame at or after each downbeat (t >= BAR(n), as FILM54's scene list and the overlay) */
export const OP_CUTS = [1, 2, 3, 4, 5].map((n) => Math.ceil(BAR(n) * 30 - 1e-9));   // 80 140 199 259 319
const PAL: Pal = {skin: '#C38D64', skinS: '#9C6848', skinH: '#E8BC8E', hair: '#15100E', robe: '#262A31', robeS: '#16181C', robeH: '#575B62', trim: '#5C2E24',
	metal: '#3C3B3A', metalS: '#1B1A1A', metalH: '#9A968C', lace: '#6E2C22', under: '#55302A', underS: '#2E1915', cape: '#2C1716', capeS: '#170B0B', gold: '#C09A52', line: '#2A1810'};
const zoom = (fx: number, fy: number, s: number) => `translate(${f1(fx)},${f1(fy)}) scale(${s.toFixed(5)}) translate(${f1(-fx)},${f1(-fy)})`;

/* ---------- shared defs (as demo54m) ---------- */
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
/** a Han 阙 (母阙 + 子阙), base centre (0,0) */
const QueD = <g>
	<path d="M28,-16 L72,-16 L68,-140 L30,-140 Z M22,-140 L96,-136 C90,-142 84,-150 80,-162 L28,-164 Z M32,-164 L76,-164 L74,-170 L34,-170 Z" />
	<rect x={-42} y={-18} width={84} height={18} /><path d="M-32,-16 L32,-16 L28,-212 L-28,-212 Z" /><rect x={-35} y={-224} width={70} height={12} />
	{[-34, -20, -6, 8, 22].map((bx) => <rect key={bx} x={bx} y={-240} width={11} height={16} />)}
	<rect x={-40} y={-244} width={80} height={6} /><rect x={-36} y={-266} width={72} height={22} />
	<path d="M-80,-262 L80,-262 L80,-267 L54,-294 L-54,-294 L-80,-267 Z" /><rect x={-30} y={-312} width={60} height={18} />
	<path d="M-63,-308 L63,-308 L63,-312 L36,-336 L-36,-336 L-63,-312 Z" /><path d="M-42,-336 L42,-336 L45,-344 L-45,-344 Z" />
</g>;
/** a pair of studded door leaves closing over an opening (cx, w, h, sill gy); c = 0 open … 1 shut (each leaf foreshortened as it swings) */
const Doors: React.FC<{cx: number; w: number; h: number; gy: number; c: number; lit: number}> = ({cx, w, h, gy, c, lit}) => {
	if (c < 0.002) return null;
	const lw = (w / 2) * c, x0 = cx - w / 2, x1 = cx + w / 2;
	const studs = (xa: number, xb: number) => Array.from({length: 5}, (_, r) => [0.25, 0.5, 0.75].map((u) => <circle key={`${r}${u}`} cx={xa + (xb - xa) * u} cy={gy - h + h * (0.14 + r * 0.18)} r={Math.max(0.4, 1.3 * c)} fill="#8C6A44" opacity={0.6} />));
	return <g>
		<rect x={x0} y={gy - h} width={lw} height={h} fill="#2B1C13" /><rect x={x1 - lw} y={gy - h} width={lw} height={h} fill="#22160F" />
		{studs(x0, x0 + lw)}{studs(x1 - lw, x1)}
		{/* the light through the closing gap catches the leaves' inner edges */}
		<rect x={x0 + lw - 1.6} y={gy - h} width={1.6} height={h} fill={KEY} opacity={0.7 * lit * (1 - c * 0.85)} />
		<rect x={x1 - lw} y={gy - h} width={1.6} height={h} fill={KEY} opacity={0.7 * lit * (1 - c * 0.85)} />
		{c > 0.97 && <rect x={cx - 0.8} y={gy - h} width={1.6} height={h} fill="#0E0906" />}
	</g>; };
/** the 洛阳 gate wall in sheet coordinates (ground y 520, central passage x 560); door = closure of the left / centre / right passages,
    win = the five 门楼 window lights (1 lit, 0 out), inner = drawn inside the central passage (over its light, under its doors) */
const GY0 = 520;
const PASS: [number, number, number][] = [[430, 68, 118], [560, 92, 150], [690, 68, 118]];
const GateWallOp: React.FC<{t: number; p: string; x0?: number; x1?: number; door?: number[]; win?: number[]; inner?: React.ReactNode}> = ({t, p, x0 = -700, x1 = 1900, door = [0, 0, 0], win = [1, 1, 1, 1, 1], inner}) => {
	const GY = GY0, fl = 1 + 0.035 * Math.sin(t * 5.3) + 0.02 * Math.sin(t * 11.9 + 1), open = 1 - (door[0] * 0.25 + door[1] * 0.5 + door[2] * 0.25);
	const pass = (i: number) => { const [cx, w, h] = PASS[i], c = door[i];
		return <g key={i}>
			<rect x={cx - w / 2 - 8} y={GY - h - 10} width={w + 16} height={h + 10} fill="#1A1410" />
			<rect x={cx - w / 2} y={GY - h} width={w} height={h} fill={`url(#${p}psg)`} opacity={fl} />
			{[0.12, 0.3, 0.7, 0.88].map((u) => <rect key={u} x={cx - w / 2 + w * u - 2} y={GY - h} width={4} height={h} fill="#3A2A1E" opacity={0.55} />)}
			{i === 1 && inner && <g clipPath={`url(#${p}pc)`}>{inner}</g>}
			<Doors cx={cx} w={w} h={h} gy={GY} c={c} lit={fl} />
			<rect x={cx - w / 2 - 8} y={GY - h - 10} width={w + 16} height={8} fill="#2A1E16" />
		</g>; };
	const n = Math.ceil((x1 - x0) / 26);
	return <g>
		<defs><clipPath id={`${p}pc`}><rect x={560 - 46} y={GY - 150} width={92} height={150} /></clipPath></defs>
		<rect x={x0} y={300} width={x1 - x0} height={GY - 300} fill="#332B24" />
		<rect x={x0} y={300} width={x1 - x0} height={GY - 300} fill={`url(#${p}wallG)`} opacity={fl * (0.12 + 0.88 * open)} />
		{Array.from({length: 17}, (_, i) => <path key={i} d={`M${x0},${306 + i * 13} L${x1},${306 + i * 13 + (i % 2 ? 1 : -1)}`} stroke="#000" strokeOpacity={0.16} strokeWidth={1.4} />)}
		<g fill="#231D19">{Array.from({length: n}, (_, i) => <rect key={i} x={x0 + i * 26} y={286} width={16} height={16} />)}<rect x={x0} y={296} width={x1 - x0} height={8} /></g>
		{pass(1)}{pass(0)}{pass(2)}
		<rect x={352} y={282} width={416} height={18} fill="#1E1814" />
		{Array.from({length: 27}, (_, i) => <rect key={i} x={360 + i * 15.2} y={266} width={3} height={16} fill="#1E1814" />)}
		<rect x={356} y={262} width={408} height={5} fill="#1E1814" />
		<rect x={376} y={212} width={368} height={56} fill="#2A221C" />
		{[0, 1, 2, 3, 4].map((i) => <g key={i}><rect x={392 + i * 70} y={226} width={40} height={30} fill="#E9CB98" opacity={(i === 2 ? 0.85 : 0.55) * fl * win[i]} />
			{win[i] < 1 && <rect x={392 + i * 70} y={226} width={40} height={30} fill="#15110E" opacity={0.85 * (1 - win[i])} />}
			{[0, 1, 2, 3, 4, 5].map((j) => <rect key={j} x={394 + i * 70 + j * 6.6} y={226} width={2.2} height={30} fill="#2A1E16" />)}</g>)}
		{[376, 446, 516, 586, 656, 726].map((x) => <rect key={x} x={x} y={212} width={18} height={56} fill="#1C1612" />)}
		<rect x={366} y={204} width={388} height={9} fill="#1C1612" />
		{Array.from({length: 13}, (_, i) => <g key={i} fill="#1C1612"><rect x={372 + i * 30} y={194} width={18} height={10} /><rect x={366 + i * 30} y={190} width={30} height={5} /></g>)}
		<path d="M318,192 C420,186 700,186 802,192 L806,184 C790,180 760,166 708,138 L412,138 C360,166 330,180 314,184 Z" fill={`url(#${p}roof)`} />
		<path d="M404,140 L716,140 L724,128 L716,132 L404,132 L396,128 Z" fill="#141414" />
		{Array.from({length: 30}, (_, i) => <path key={i} d={`M${420 + i * 9.6},142 L${326 + i * 16.4},188`} stroke="#5A6466" strokeOpacity={0.35} strokeWidth={1.2} />)}
		{Array.from({length: 31}, (_, i) => <circle key={i} cx={322 + i * 15.9} cy={189} r={2.4} fill="#4A5254" opacity={0.7} />)}
	</g>; };
/** a Han lamp on its tall stand (豆形灯 on a 灯檠), base (x, y), k px/cm; on = 1 lit … 0 out (the flame shrinks, a thread of smoke) */
const Lamp: React.FC<{x: number; y: number; k: number; t: number; seed: number; on?: number; glow?: number}> = ({x, y, k, t, seed, on = 1, glow = 1}) => {
	const fy = y - 117 * k, sm = on < 1 && on > 0 ? 0 : on <= 0 ? 1 : 0;
	return <g>
		<g transform={`translate(${f1(x)},${f1(y)}) scale(${k.toFixed(4)})`}><path d="M-14,0 C-12,-4 -6,-6 -2.4,-7 L-1.6,-110 L-9,-112 C-9,-115 -4,-117 0,-117 C4,-117 9,-115 9,-112 L1.6,-110 L2.4,-7 C6,-6 12,-4 14,0 Z" fill="#140D0A" /></g>
		{on > 0.01 && <g opacity={Math.min(1, on * 1.4)}><Flame x={x} y={fy} s={k * (0.35 + 0.65 * on)} t={t} seed={seed} ivory glow={glow * on} /></g>}
		{on < 0.99 && <path d={`M${f1(x)},${f1(fy - 4 * k)} C${f1(x - 4 * k)},${f1(fy - 14 * k)} ${f1(x + 5 * k)},${f1(fy - 22 * k)} ${f1(x + 1 * k)},${f1(fy - 34 * k)}`} fill="none" stroke="#9A9488" strokeWidth={1.4 * k} strokeLinecap="round" opacity={0.35 * (1 - on) * (1 - sm * 0.2)} />}
	</g>; };

/* =====================================================================================================================
   the 北部尉 gate set (from the demo's ShotA): racks, the kneeling uncle, the gripping guard, 曹操 strike-ready
   ===================================================================================================================== */
const Rack: React.FC<{x: number; y: number; w: number; h: number; dim?: number; n?: number; r?: number; rattle?: number; t?: number}> = ({x, y, w, h, dim = 1, n = 10, r = 7, rattle = 0, t = 0}) =>
	<g opacity={dim}>
		<rect x={x} y={y - h} width={12} height={h} fill="#3A2A1E" /><rect x={x + w - 12} y={y - h} width={12} height={h} fill="#3A2A1E" />
		{Array.from({length: n}, (_, i) => { const j = rattle * Math.sin(t * 47 + i * 2.1) * (0.6 + 0.4 * rnd(i, 9)), bx = x + 20 + i * (w - 40) / (n - 1);
			return <Rod5 key={i} a={[bx, y - 8]} b={[x + 16 + i * (w - 40) / (n - 1) + (i % 3) * 2 + j * 3, y - h - 18 + (i % 2) * 6 - Math.abs(j) * 2]} r={r} ph={(i * 2) % 5} lit={-1} />; })}
		<rect x={x - 6} y={y - h + 10} width={w + 12} height={11} fill="#4A3626" /><rect x={x - 6} y={y - h + 10} width={w + 12} height={3} fill="#E0B47A" opacity={0.55} />
		<rect x={x - 4} y={y - h * 0.42} width={w + 8} height={9} fill="#3A2A1E" /><rect x={x - 4} y={y - h * 0.42} width={w + 8} height={2.4} fill="#E0B47A" opacity={0.4} />
		<rect x={x - 8} y={y - 16} width={w + 16} height={18} fill="#2E2218" /><rect x={x - 8} y={y - 16} width={w + 16} height={3} fill="#E0B47A" opacity={0.4} />
	</g>;
/** the gate house (门屋) of the 北部尉 office, base centre (0, 0): doors with studs and ring knockers, posts, 斗拱 row, the tiled roof with a
    straight ridge whose ends lift only slightly; light = id of the key gradient on the doors; ring = knocker swing (deg) */
const BeiGate: React.FC<{p: string; light: string; ring?: number}> = ({p, light, ring = 0}) => <g>
	<rect x={-250} y={-14} width={500} height={14} fill="#2A231E" /><rect x={-250} y={-14} width={500} height={3} fill="#E0B47A" opacity={0.25} />
	<rect x={-132} y={-410} width={264} height={396} fill="#3B2622" />
	<rect x={-132} y={-410} width={264} height={396} fill={`url(#${light})`} opacity={0.55} />
	<rect x={-1.5} y={-410} width={3} height={396} fill="#120C0A" />
	{Array.from({length: 5}, (_, r) => [-100, -70, 70, 100].map((dx) => <circle key={`${r}${dx}`} cx={dx} cy={-370 + r * 70} r={3} fill="#8C6A44" opacity={0.7} />))}
	<g transform={`rotate(${f1(ring)} -20 -209)`}><circle cx={-20} cy={-200} r={9} fill="none" stroke="#B08A54" strokeWidth={3} /></g>
	<g transform={`rotate(${f1(-ring * 0.8)} 20 -209)`}><circle cx={20} cy={-200} r={9} fill="none" stroke="#7A5E3C" strokeWidth={3} /></g>
	{[-162, 138].map((x) => <rect key={x} x={x} y={-432} width={24} height={418} fill="#1E1714" />)}
	<rect x={-170} y={-440} width={340} height={16} fill="#1E1714" />
	{Array.from({length: 8}, (_, i) => <g key={i} fill="#1C1612"><rect x={-182 + i * 50} y={-456} width={20} height={13} /><rect x={-188 + i * 50} y={-461} width={32} height={6} /></g>)}
	<path d="M-290,-460 C-170,-466 170,-466 290,-460 L294,-469 C262,-476 220,-498 176,-524 L-176,-524 C-220,-498 -262,-476 -294,-469 Z" fill={`url(#${p}roof)`} />
	<path d="M-186,-522 L186,-522 L195,-534 L186,-530 L-186,-530 L-195,-534 Z" fill="#141414" />
	{Array.from({length: 26}, (_, i) => <path key={i} d={`M${-172 + i * 13.8},-520 L${-282 + i * 22.6},-464`} stroke="#5A6466" strokeOpacity={0.3} strokeWidth={1.2} />)}
	{Array.from({length: 27}, (_, i) => <circle key={i} cx={-286 + i * 22} cy={-463} r={2.8} fill="#4A5254" opacity={0.7} />)}
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
/** 曹操 (20) strike-ready (Cao units, facing +x); rise = the raised arm + rod rotation about the shoulder (deg, + swings the rod over and
    forward); lid = the upper lids lowered (hard eyes) with the brows knit; streak = the rod's swing since the last frame (deg): a motion streak */
const CaoStrikeA: React.FC<{id: string; rise: number; coil: number; look: number; lid?: number; streak?: number; wrist?: number}> = ({id, rise, coil, look, lid = 0, streak = 0, wrist = 0}) => {
	const R = PAL.robe, RS = PAL.robeS, RH = PAL.robeH, TR = PAL.trim;
	const skirt = 'M-62,292 C-78,380 -128,560 -206,708 C-120,736 60,740 184,700 C160,640 136,580 118,530 C96,460 66,380 52,286 Z';
	const torso = 'M-38,44 C-58,58 -70,100 -68,160 C-66,220 -62,262 -62,298 L52,290 C58,220 62,160 54,112 C48,82 36,60 14,46 Z';
	const shoe = (x: number, a: number, c: string) => <g transform={`translate(${x},728) rotate(${a})`}><path d="M-26,4 C-28,-8 -16,-14 0,-14 L52,-8 C76,-4 98,2 100,14 C100,20 94,22 86,22 L-22,22 C-28,20 -28,12 -26,4 Z" fill={c} /></g>;
	const sh: P = [-14, 80], el: P = [-86, -6], hd: P = [-56, -124], ra: P = [-30, -96], rb: P = [-410, -300];
	/* the streak: a fan swept by the rod since the last frame, and fading ghost rods */
	const sweep = (() => { if (Math.abs(streak) < 1.5) return null; const N = 10, pts: P[] = [], back: P[] = [];
		for (let i = 0; i <= N; i++) { const a = -streak * i / N; pts.push(rotAbout(rb, a, hd)); back.push(rotAbout([(ra[0] + rb[0] * 2) / 3, (ra[1] + rb[1] * 2) / 3], a, hd)); }
		return <g>
			<path d={'M' + pts.concat(back.reverse()).map((q) => f1(q[0]) + ',' + f1(q[1])).join(' L') + ' Z'} fill="#F4E6C8" opacity={0.2} />
			{[0.2, 0.42, 0.66].map((k, i) => { const a = -streak * k; return <g key={i} transform={`rotate(${f1(a)} ${hd[0]} ${hd[1]})`} opacity={0.34 - i * 0.09}><path d={`M${ra[0]},${ra[1]} L${rb[0]},${rb[1]}`} stroke="#E9D8B4" strokeWidth={20} strokeLinecap="round" /></g>; })}
		</g>; })();
	return <g>
		<defs><clipPath id={`${id}sk`}><path d={skirt} /></clipPath><clipPath id={`${id}to`}><path d={torso} /></clipPath></defs>
		<g transform={`rotate(${f1(-4 - coil)} 0 330)`}>
			<g transform={`rotate(${f1(rise)} ${sh[0]} ${sh[1]})`}>
				<g transform={`rotate(${f1(wrist)} ${hd[0]} ${hd[1]})`}>{sweep}<Rod5 a={ra} b={rb} r={11} ph={1} lit={1} /></g>
				<path d={strand(qpts(sh, [sh[0] - 50, sh[1] - 30], el, 8), (u) => 34 - u * 4)} fill={RS} />
				<path d={`M${sh[0] + 10},${sh[1]} C${sh[0] - 30},${sh[1] - 10} ${el[0] - 34},${el[1] + 40} ${el[0] - 30},${el[1] + 70} C${el[0] - 10},${el[1] + 120} ${sh[0] - 50},${sh[1] + 60} ${sh[0] - 20},${sh[1] + 40} Z`} fill={RS} />
				<path d={strand(qpts(el, [el[0] - 6, el[1] - 60], hd, 8), (u) => 17 - u * 5)} fill={PAL.skinS} />
				<path d={strand(qpts([el[0] + 4, el[1] - 4], [el[0] - 1, el[1] - 62], [hd[0] + 5, hd[1] + 2], 8), (u) => 7 - u * 2.4)} fill={PAL.skin} />
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
			<g transform={`rotate(${f1(22 + look + coil)} 0 40) translate(0,49) scale(0.88) translate(0,-40)`}><Head old={false} pal={PAL} id={id} />
				{lid > 0 && <g>
					{/* hard eyes: the brow knit down toward the nose, the upper lid lowered over the iris */}
					<path d="M10.6,-67 C21,-69 31,-69 40.4,-65.6 L40.6,-60.4 L10.6,-59.6 Z" fill={PAL.skin} />
					<path d={`M17,-56.4 C22.6,${f1(-59.4 + 6.4 * lid)} 28.6,${f1(-59 + 6.2 * lid)} 34.2,${f1(-55.4 + 1.6 * lid)} L34.4,-60 L16,-60 Z`} fill={PAL.skin} />
					<path d={`M17.4,${f1(-55.6 + 2.6 * lid)} C22.6,${f1(-58.8 + 6.4 * lid)} 28.6,${f1(-58.4 + 6.2 * lid)} 33.8,${f1(-54.8 + 1.6 * lid)}`} fill="none" stroke={PAL.line} strokeWidth={2.6} strokeLinecap="round" />
					<path d="M11.4,-64.6 C20,-66.4 29.4,-65 39.8,-59.6 L38.8,-57.2 C29.2,-61.6 20.4,-62.6 12.2,-61.4 Z" fill={PAL.hair} />
					<path d="M33,-60.2 C35,-62.8 37.6,-63.6 39.6,-63" fill="none" stroke={PAL.line} strokeWidth={0.9} opacity={0.5} />
				</g>}
			</g>
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
/** the night air the flame leans in: its light sways (px), shared by shots 1–2 */
const swayAt = (t: number) => 20 * Math.sin(t * 2.3 + 0.5) + 9 * Math.sin(t * 5.7);

/* =====================================================================================================================
   SHOT 1 (0 → BAR(1)): the moment, wide. Frame 0 is the hook: the rod already up, the man pulling back in the guards' grip.
   Camera: a 27 % push-in (front plane; the gate 10 %: parallax) with an arc to the right (front 170 px, the gate 90 px) and a tilt up, moving from frame 0 and easing.
   Acting: the rod rises to full height (1.25 s) and hovers with a tremble; 曹操 coils; the uncle pulls back twice against the grip
   and at 1.1–1.6 s lifts his head to look up at the rod. The lamp flame leans in the air: its light and the long cast shadows sway.
   ===================================================================================================================== */
const Shot1: React.FC<{t: number}> = ({t}) => {
	const GX = 1175, GG = 800, FG = 1030, S = 3.1 / 4.98, lampX = 560, lampK = 2.7, lampG = 988, flY = lampG - 117 * lampK, cx = 1300, cy = FG - 750 * S;
	const v = cl(t / BAR(1)), u = 0.7 * v + 0.3 * eout(v);
	const zf = `translate(${f1(-170 * u)},${f1(34 * u)}) ${zoom(1080, 700, 1 + 0.27 * u)}`, zb = `translate(${f1(-90 * u)},${f1(14 * u)}) ${zoom(1080, 700, 1 + 0.1 * u)}`;
	const F = flick(t, 5), sw = swayAt(t);
	const rise = -24 * (1 - eout(cl(t / 1.25))) + 1.3 * Math.sin(t * 2.6) * seg(t, 1.0, 1.6) + 0.7 * Math.sin(t * 8.3 + 1) * seg(t, 1.2, 1.8);
	const coil = 0.6 + 5 * eio(cl(t / 2.5));   /* he winds up: the body turns back over the bar */
	/* the uncle: two hard pulls back (negative = away from 曹操) and a shudder; at 1.1–1.6 s he looks up */
	const st = -3.5 + 7.5 * Math.sin(t * 4.1 + 0.9) + 1.8 * Math.sin(t * 12.3 + 2);
	const hu = 2 + 15 * eio(seg(t, 1.05, 1.6)) + 2.2 * Math.sin(t * 4.3);
	const wr = rotAbout(UNC_W, st, [0, -10]), so = rotAbout(UNC_S, st, [0, -10]);
	const gA = {x: 730, y: FG + 6}, gB = {x: 1000, y: 994};
	const uX = 1040, uY = FG + 2;
	const rA: P = [(uX + 3.1 * wr[0] - gA.x) / 3.1, (uY + 3.1 * wr[1] - gA.y) / 3.1], rB: P = [(uX + 3.1 * so[0] - gB.x) / 2.86, (uY + 3.1 * so[1] - gB.y) / 2.86];
	const lx = lampX + sw * 0.7, shS = 1.36 + 0.03 * Math.sin(t * 2.3 + 0.5) + 0.012 * Math.sin(t * 5.7);
	const figs = (id: string, rim: boolean) => <g>
		<g fill="#3A2C23" filter={rim ? 'url(#oarimL)' : undefined}><g transform={`translate(${gB.x},${gB.y}) scale(2.86) rotate(4)`}><Gripper rx={rB[0]} ry={rB[1]} lean={-0.4 * st} /></g></g>
		<g fill={SIL} filter={rim ? 'url(#oarimL)' : undefined}>
			<g transform={`translate(${uX},${uY}) scale(3.1)`}><UncleA st={st} hu={hu} /></g>
			<g transform={`translate(${gA.x},${gA.y}) scale(3.1) rotate(-3)`}><Gripper rx={rA[0]} ry={rA[1]} lean={-1.2 - 0.6 * st} /></g>
			<g transform={`translate(1150,${FG + 8}) scale(3.1) rotate(-70)`}><path d="M-8,-1 C-8.8,-7 -7,-11.6 -1.6,-13.2 L8.4,-13.4 C11,-12 12,-9 12,-6 C8,-7 3,-7 -1,-5 Z M-6.8,-10.6 L10.4,-11.4 L11.2,-29 L-5.4,-19.6 Z" /></g>
		</g>
		<g transform={`translate(${cx},${cy}) scale(${-S},${S})`} filter={rim ? 'url(#oacao)' : undefined}><CaoStrikeA id={id} rise={rise} coil={coil} look={-1.5 * Math.sin(t * 1.1)} /></g>
	</g>;
	return <svg width={W} height={H} style={{position: 'absolute'}}>
		<defs>
			<SkyDefs p="oa" />
			<radialGradient id="oakey" cx={lx} cy={flY} r="980" gradientUnits="userSpaceOnUse" gradientTransform={`translate(${f1(lx)} ${f1(flY)}) scale(1 0.66) translate(${f1(-lx)} ${f1(-flY)})`}><stop offset="0" stopColor={KEY} stopOpacity="0.62" /><stop offset="0.32" stopColor="#D9A877" stopOpacity="0.3" /><stop offset="1" stopColor="#D9A877" stopOpacity="0" /></radialGradient>
			<RimF id="oacao" lx={1} ly={-0.3} k={5} c="#FFE0B0" o={0.95} lx2={-1} ly2={-0.2} k2={4} c2={ACC} o2={0.95} blur={1} />
			<RimF id="oarimL" lx={-1} ly={-0.35} k={3.2} c={RIMW} o={0.95} />
			<RimF id="oarimTop" lx={0} ly={-1} k={1.6} c="#9FB8B6" o={0.5} />
			<filter id="oashd" x="-30%" y="-30%" width="160%" height="160%"><feColorMatrix type="matrix" values="0.08 0 0 0 0.03  0 0.06 0 0 0.02  0 0 0.05 0 0.02  0 0 0 0.74 0" /><feGaussianBlur stdDeviation="3.6" /></filter>
			<clipPath id="oawall"><rect x={-300} y={466} width={2600} height={GG - 466} /><rect x={GX - 170} y={GG - 440} width={340} height={440} /></clipPath>
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
			<rect x={-120} y={460} width={2160} height={360} fill="url(#oakey)" opacity={0.92 + 0.08 * F.s} />
			{Array.from({length: 24}, (_, i) => <path key={i} d={`M-120,${486 + i * 13} L2040,${486 + i * 13}`} stroke="#000" strokeOpacity={0.13} strokeWidth={1.2} />)}
			<g filter="url(#oarimTop)"><path d="M-120,482 L2040,482 L2040,466 C1700,462 200,462 -120,466 Z" fill="#1E1B19" /></g>
			{Array.from({length: 88}, (_, i) => <circle key={i} cx={-110 + i * 25} cy={482} r={3.2} fill="#2C2826" />)}
			<g transform={`translate(${GX},${GG})`}><BeiGate p="oa" light="oakey" /></g>
			<Rack x={GX - 200 - 196 - 30} y={GG} w={196} h={168} />
			<Rack x={GX + 230} y={GG} w={196} h={168} dim={0.86} />
			{/* their shadows thrown big on the wall and the gate by the lamp (centre of projection = the flame), swaying with it */}
			<g clipPath="url(#oawall)"><g filter="url(#oashd)" transform={`translate(${f1(-sw * 1.5)},0) translate(${f1(lx)},${f1(flY)}) scale(${shS.toFixed(4)}) translate(${f1(-lx)},${f1(-flY)})`}>{figs('oash', false)}</g></g>
			<rect x={-120} y={GG} width={2160} height={H - GG + 120} fill="url(#oagnd)" />
		</g>
		<g transform={zf}>
			<ellipse cx={900 + sw * 1.4} cy={FG - 20} rx={720} ry={110} fill="url(#oapool)" opacity={0.9 + 0.1 * F.s} />
			<Lamp x={lampX} y={lampG} k={lampK} t={t} seed={5} glow={1.6} />
			{figs('oas', true)}
			<ellipse cx={cx} cy={FG + 4} rx={170} ry={12} fill="#0A0605" opacity={0.55} />
		</g>
		<rect width={W} height={H} fill="url(#oavig)" />
	</svg>; };

/* =====================================================================================================================
   SHOT 2 (BAR(1) → BAR(2)): close, low angle on 曹操. The lamp low at the left lights his face from below; the night sky and the
   gate's eaves behind; the man's dark head blurred in the near foreground. Hard eyes fixed on him. A slow push; the rod trembles
   at the top, winds back on beat 3½, and in the last half beat swings over (a streak); we cut on BAR(2) before any impact.
   ===================================================================================================================== */
const S2 = 2.2;
/** shot 2's arm (about the shoulder) and wrist (the rod about the fist), deg: the hold with a tremble, the wind-up on beat 3 (rod and
    wrist cocked back), then from beat 4 the arm drives up over the head while the wrist snaps the rod over; at the cut the rod points
    up and forward (≈ 40° above level), still high above the man */
const pose2 = (m: number) => {
	const go = seg(m, 1.47, 2.0), wind = eio(seg(m, 1.0, 1.45)) * (1 - ease(seg(m, 1.47, 1.66)));
	const arm = 24 + 0.66 * Math.sin(m * 9.5) + 0.8 * Math.sin(m * 3.1) - 9 * wind + 7 * go ** 1.5;
	const wrist = -12 * wind + 80 * go ** 2.3;
	return {arm, wrist, tot: arm + wrist}; };
const Shot2: React.FC<{t: number}> = ({t}) => {
	const a = BAR(1), m = t - a, D = BAR(2) - a, v = cl(m / D);
	const pu = 0.55 * eout(v) + 0.45 * v;   /* the push starts at once (the cut lands in motion) and keeps going */
	const fx = 980, fy = 470, push = 1 + 0.13 * pu, zf = `translate(${f1(46 * pu)},${f1(-50 * pu)}) ${zoom(fx, fy, push)}`, zb = `translate(${f1(16 * pu)},${f1(-18 * pu)}) ${zoom(fx, fy, 1 + 0.05 * pu)}`;
	const F = flick(t, 5), sw = swayAt(t);
	const P2 = pose2(m), streak = P2.tot - pose2(m - 1 / 30).tot;
	const coil = 3 + 0.8 * Math.sin(m * 2.2) + 3.5 * eio(seg(m, 1.0, 1.45)) - 6 * seg(m, 1.47, 2.0) ** 2;
	const cx = 1040, cy = 640;
	const lampX = 330 + sw * 0.25, lampY = 1300, lk = 5.6, flY = lampY - 117 * lk;
	return <svg width={W} height={H} style={{position: 'absolute'}}>
		<defs>
			<linearGradient id="obsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#101A22" /><stop offset="0.55" stopColor="#1D2D36" /><stop offset="0.85" stopColor="#33433F" /><stop offset="1" stopColor="#4A524C" /></linearGradient>
			<radialGradient id="obkey" cx={lampX} cy={flY} r="1300" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor={KEY} stopOpacity="0.5" /><stop offset="0.35" stopColor="#D9A877" stopOpacity="0.2" /><stop offset="1" stopColor="#D9A877" stopOpacity="0" /></radialGradient>
			<radialGradient id="obface" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#FFD9A8" stopOpacity="0.32" /><stop offset="0.6" stopColor="#FFD9A8" stopOpacity="0.1" /><stop offset="1" stopColor="#FFD9A8" stopOpacity="0" /></radialGradient>
			<linearGradient id="obroof" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2C3234" /><stop offset="1" stopColor="#1A1A1A" /></linearGradient>
			<radialGradient id="obvig" cx="0.55" cy="0.45" r="0.8"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.62" /></radialGradient>
			<filter id="obbl" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="14" /></filter>
			<filter id="obbl4" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="4" /></filter>
			{/* warm key from the lamp low at the left, cool 石青 rim from the sky at the back (screen space) */}
			<RimF id="obcao" lx={-1} ly={0.25} k={6} c="#FFE0B0" o={0.95} lx2={1} ly2={-0.35} k2={5} c2={ACC} o2={0.95} blur={1.4} />
		</defs>
		<g transform={zb}>
			<rect x={-100} y={-100} width={W + 200} height={H + 200} fill="url(#obsky)" />
			{Array.from({length: 70}, (_, i) => <circle key={i} cx={rnd(i, 11) * W} cy={rnd(i, 12) * 820} r={0.8 + rnd(i, 13) * 1.5} fill="#E8EEE6" opacity={(0.2 + rnd(i, 14) * 0.45) * (0.75 + 0.25 * Math.sin(t * (1 + rnd(i, 15) * 2.5) + i))} />)}
			{/* thin night clouds drifting */}
			<g filter="url(#obbl)" opacity={0.55}>
				{[0, 1, 2].map((i) => <ellipse key={i} cx={((300 + i * 760 - t * 70 * (1 + i * 0.3)) % 2400 + 2400) % 2400 - 200} cy={170 + i * 150} rx={360 - i * 60} ry={26 + i * 6} fill="#40525A" />)}
			</g>
			{/* the gate's eave seen from below, behind him (right) */}
			<g transform="translate(1520,1010) scale(1.6)">
				<path d="M-290,-40 C-170,-46 170,-46 290,-40 L294,-49 C262,-56 220,-78 176,-104 L-176,-104 C-220,-78 -262,-56 -294,-49 Z" fill="url(#obroof)" />
				<path d="M-186,-102 L186,-102 L195,-114 L186,-110 L-186,-110 L-195,-114 Z" fill="#141414" />
				{Array.from({length: 27}, (_, i) => <circle key={i} cx={-286 + i * 22} cy={-43} r={2.8} fill="#4A5254" opacity={0.7} />)}
				<rect x={-200} y={-40} width={400} height={60} fill="#1C1612" />
				{Array.from({length: 8}, (_, i) => <g key={i} fill="#16110E"><rect x={-182 + i * 50} y={-36} width={20} height={13} /><rect x={-188 + i * 50} y={-41} width={32} height={6} /></g>)}
			</g>
			<rect x={-100} y={760} width={W + 200} height={420} fill="#1A1714" opacity={0.0} />
			<rect x={-100} y={-100} width={W + 200} height={H + 200} fill="url(#obkey)" opacity={0.9 + 0.1 * F.s} />
		</g>
		<g transform={zf}>
			<circle cx={cx - 120 + sw * 0.4} cy={cy - 120} r={420} fill="url(#obface)" opacity={0.85 + 0.15 * F.s} />
			<g filter="url(#obcao)"><g transform={`translate(${cx},${cy}) scale(${-S2},${S2})`}><CaoStrikeA id="obs" rise={P2.arm} wrist={P2.wrist} coil={coil} look={8 + 0.6 * Math.sin(m * 1.7)} lid={0.38} streak={streak} /></g></g>
		</g>
		{/* the near foreground: the man's head and shoulders, out of focus, low at the left; the lamp beside him */}
		<g filter="url(#obbl)" fill="#0B0706" transform={`translate(${f1(-30 * v)},0)`}>
			<path d="M-60,1120 C-40,980 60,900 200,880 C250,820 330,800 380,840 C420,870 420,930 400,960 C470,990 520,1040 540,1120 Z" />
		</g>
		<g filter="url(#obbl4)" transform={`translate(${f1(-40 * v)},0)`}><Lamp x={lampX} y={lampY} k={lk} t={t} seed={5} glow={1.2} /></g>
		<rect width={W} height={H} fill="url(#obvig)" />
	</svg>; };

/* =====================================================================================================================
   SHOT 3 (BAR(2) → BAR(3)): the racks of 五色棒 (card 2). A fast lateral dolly (cut in at 5.8 px/frame, easing to 3.7), a horizontal
   motion smear that follows the speed, a dark post in the near foreground, and a lamp on its stand passing between us and the rack:
   its light slides over the rods. The wall behind at parallax 0.55.
   ===================================================================================================================== */
const Shot3: React.FC<{t: number}> = ({t}) => {
	const a = BAR(2), m = t - a, D = BAR(3) - a;
	const V0 = 175, V1 = 110, PAN = (mm: number) => V0 * mm - 0.5 * (V0 - V1) / D * mm * mm, pan = PAN(m), vel = (V0 - (V0 - V1) * m / D) / 30;
	const push = 1 + 0.04 * ease(cl(m / D));
	const RX0 = 120, SP = 74, N = 34, TOP = 372, BOT = 960, r = 21;
	const rods = Array.from({length: N}, (_, i) => ({x: RX0 + i * SP + (rnd(i, 3) - 0.5) * 6, tilt: (rnd(i, 4) - 0.5) * 2.2, ph: (i * 2 + Math.floor(rnd(i, 5) * 2)) % 5, top: TOP + (i % 2) * 14 + rnd(i, 6) * 8}));
	/* the lamp in front of the rack (parallax 1.3) crosses the frame centre at m ≈ 0.9 */
	const lampSX = 960 + 1.3 * (PAN(0.9) - pan), F = flick(t, 7);
	return <svg width={W} height={H} style={{position: 'absolute'}}>
		<defs>
			<radialGradient id="ockey" cx={lampSX} cy={560} r="900" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor={KEY} stopOpacity="0.62" /><stop offset="0.4" stopColor="#D9A877" stopOpacity="0.22" /><stop offset="1" stopColor="#D9A877" stopOpacity="0" /></radialGradient>
			<radialGradient id="ocglint" cx={lampSX} cy={520} r="520" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#FFE9C4" stopOpacity="0.5" /><stop offset="0.5" stopColor="#FFE0B0" stopOpacity="0.14" /><stop offset="1" stopColor="#FFE0B0" stopOpacity="0" /></radialGradient>
			<linearGradient id="octop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#000" stopOpacity="0.62" /><stop offset="1" stopColor="#000" stopOpacity="0" /></linearGradient>
			<radialGradient id="ocvig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.5" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.55" /></radialGradient>
			<filter id="ocbl" x="-20%" y="-5%" width="140%" height="110%"><feGaussianBlur stdDeviation="12" /></filter>
			<filter id="ocsm" x="-3%" y="0%" width="106%" height="100%"><feGaussianBlur stdDeviation={`${(vel * 0.32).toFixed(2)} 0`} /></filter>
			<filter id="ocdof" x="-2%" y="-2%" width="104%" height="104%"><feGaussianBlur stdDeviation={`${(1.5 + vel * 0.2).toFixed(2)} 1.5`} /></filter>
		</defs>
		<g transform={zoom(960, 640, push)}>
			<g transform={`translate(${f1(-pan * 0.55)},0)`} filter="url(#ocdof)">
				<rect x={-200} y={-50} width={3400} height={1200} fill="#3A3029" />
				{Array.from({length: 70}, (_, i) => <path key={i} d={`M-200,${-40 + i * 17} L3200,${-40 + i * 17 + (i % 2 ? 1 : -1)}`} stroke="#000" strokeOpacity={0.14} strokeWidth={1.6} />)}
			</g>
			<rect x={-100} y={-100} width={W + 200} height={H + 200} fill="#000" opacity={0.25} />
			<rect x={-100} y={-100} width={W + 200} height={H + 200} fill="url(#ockey)" opacity={0.9 + 0.1 * F.s} />
			<g transform={`translate(${f1(-pan)},0)`} filter="url(#ocsm)">
				{Array.from({length: 8}, (_, i) => <rect key={i} x={RX0 - 50 + i * 420} y={TOP - 40} width={26} height={BOT - TOP + 60} fill="#2E2218" />)}
				<rect x={RX0 - 70} y={TOP + 30} width={N * SP + 120} height={22} fill="#4A3626" /><rect x={RX0 - 70} y={TOP + 30} width={N * SP + 120} height={5} fill="#E0B47A" opacity={0.55} />
				{rods.map((d, i) => <Rod5 key={i} a={[d.x, BOT - 6]} b={[d.x + d.tilt * 10, d.top]} r={r} ph={d.ph} lit={-1} />)}
				<rect x={RX0 - 70} y={TOP + 330} width={N * SP + 120} height={18} fill="#3A2A1E" opacity={0.95} /><rect x={RX0 - 70} y={TOP + 330} width={N * SP + 120} height={4} fill="#E0B47A" opacity={0.42} />
				<rect x={RX0 - 80} y={BOT - 20} width={N * SP + 140} height={40} fill="#2E2218" /><rect x={RX0 - 80} y={BOT - 20} width={N * SP + 140} height={5} fill="#E0B47A" opacity={0.4} />
			</g>
			{/* the lamp's light catching the rods as it passes (screen) */}
			<rect x={-100} y={-100} width={W + 200} height={H + 200} fill="url(#ocglint)" style={{mixBlendMode: 'screen'}} opacity={0.85 + 0.15 * F.s} />
			{/* the lamp on its stand, between us and the rack, slightly soft */}
			<g filter="url(#ocbl)" opacity={0.0}><rect x={0} y={0} width={1} height={1} /></g>
			<Lamp x={lampSX} y={1240} k={5.2} t={t} seed={7} glow={1.3} />
			{/* near-foreground posts, out of focus (parallax 1.7) */}
			<g transform={`translate(${f1(-pan * 1.7)},0)`} filter="url(#ocbl)" fill="#0B0706">
				<rect x={1500} y={-40} width={110} height={1160} /><rect x={2700} y={-40} width={110} height={1160} />
			</g>
			<rect x={-100} y={-100} width={W + 200} height={480} fill="url(#octop)" />
			<rect x={-100} y={-100} width={W + 200} height={H + 200} fill="url(#ocvig)" />
		</g>
	</svg>; };

/* =====================================================================================================================
   SHOT 4 (BAR(3) → BAR(4)): the order, head-on. The 北部尉 gate square to camera, a rack of 五色棒 on each side, a lamp at each
   end, two 戟 guards flanking the doors. The camera arcs in from the left onto the axis (lands on beat 3) and keeps a slow push;
   the guards slouch, snap to attention on beat 2, and ground their 戟 on beat 3 (a jolt; the racks' rods rattle; the ring knockers swing).
   ===================================================================================================================== */
const Shot4: React.FC<{t: number}> = ({t}) => {
	const a = BAR(3), m = t - a, D = BAR(4) - a, bt = D / 4;
	const arc = (1 - cl(m / (2 * bt))) ** 2, dx = 100 * arc;                        /* the arc lands on beat 3 (starts at 6.7 px/frame) */
	const snap = eout(seg(m, bt - 0.1, bt + 0.02)), lift = Math.sin(Math.PI * 0.5 * seg(m, 2 * bt - 0.22, 2 * bt - 0.06)) * 9 * (m < 2 * bt ? 1 : 0), hit = seg(m, 2 * bt, 2 * bt + 0.5);
	const thud = m >= 2 * bt ? Math.exp(-(m - 2 * bt) * 14) : 0, jolt = 4 * thud * Math.cos((m - 2 * bt) * 60);
	const push = 1 + 0.03 * cl(m / D) + 0.025 * eout(hit);
	const X = 1060, Y = 1000, K = 1.85, F1 = flick(t, 13), F2 = flick(t, 29);
	const gk = 1.38, lean = -5 * (1 - snap), stride = 0.32 * (1 - snap);
	const guard = (sx: number, flip: boolean) => <g transform={`translate(${sx},0) rotate(${f1(flip ? -lean : lean)} 0 0) translate(0,${f1(-lift + 2 * thud)})`}>
		<Npc x={0} y={0} k={gk} kind="ji" flip={flip} stride={stride} /></g>;
	const dust = (sx: number) => hit > 0 && hit < 1 ? <g opacity={0.5 * (1 - hit)}>{[-1, 1].map((s) => <ellipse key={s} cx={sx + s * (10 + 40 * eout(hit))} cy={-4 - 10 * hit} rx={14 + 20 * hit} ry={5 + 4 * hit} fill="#B9A589" />)}</g> : null;
	return <svg width={W} height={H} style={{position: 'absolute'}}>
		<defs>
			<SkyDefs p="od" />
			<radialGradient id="odkey" cx="0" cy="-260" r="900" gradientUnits="userSpaceOnUse" gradientTransform="scale(1 0.62)"><stop offset="0" stopColor={KEY} stopOpacity="0.55" /><stop offset="0.4" stopColor="#D9A877" stopOpacity="0.24" /><stop offset="1" stopColor="#D9A877" stopOpacity="0" /></radialGradient>
			<RimF id="odrim" lx={0} ly={-1} k={2.4} c={RIMW} o={0.9} lx2={1} ly2={0} k2={1.6} c2={RIMW} o2={0.5} />
			<RimF id="odrimTop" lx={0} ly={-1} k={1.6} c="#9FB8B6" o={0.5} />
			<filter id="odfg" x="-30%" y="-10%" width="160%" height="120%"><feGaussianBlur stdDeviation="11" /></filter>
		</defs>
		<g transform={`translate(0,${f1(jolt)}) ${zoom(X, 700, push)}`}>
			<g transform={`translate(${f1(dx * 0.15)},0)`}>
				<rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#odsky)" />
				{Array.from({length: 60}, (_, i) => <circle key={i} cx={rnd(i, 21) * (W + 200) - 100} cy={rnd(i, 22) * 330} r={0.8 + rnd(i, 23) * 1.2} fill="#E8EEE6" opacity={(0.2 + rnd(i, 24) * 0.4) * (0.8 + 0.2 * Math.sin(t * (1 + rnd(i, 25) * 2) + i))} />)}
			</g>
			<g transform={`translate(${f1(dx * 0.35)},0)`} filter="url(#odbl3)">
				<path d="M-200,470 L180,470 L200,446 L420,446 L440,470 L1460,470 L1480,442 L1700,442 L1720,470 L2200,470 L2200,540 L-200,540 Z" fill="#2B3534" />
			</g>
			<rect x={-100} y={420} width={W + 200} height={140} fill="url(#odhaze)" />
			<g transform={`translate(${f1(X + dx)},${Y}) scale(${K})`}>
				{/* the office wall either side, lit from the two lamps */}
				<rect x={-1400} y={-330} width={2800} height={330} fill="#3A3029" />
				<rect x={-1400} y={-560} width={2800} height={560} fill="url(#odkey)" opacity={0.9 + 0.05 * (F1.s + F2.s - 2)} />
				{Array.from({length: 25}, (_, i) => <path key={i} d={`M-1400,${-320 + i * 13} L1400,${-320 + i * 13}`} stroke="#000" strokeOpacity={0.13} strokeWidth={1.1} />)}
				<g filter="url(#odrimTop)"><path d="M-1400,-324 L1400,-324 L1400,-340 C1000,-344 -1000,-344 -1400,-340 Z" fill="#1E1B19" /></g>
				{Array.from({length: 116}, (_, i) => <circle key={i} cx={-1400 + i * 24.2} cy={-324} r={3} fill="#2C2826" />)}
				<BeiGate p="od" light="odkey" ring={14 * thud * Math.sin((m - 2 * bt) * 26)} />
				<Rack x={-426} y={0} w={196} h={168} rattle={thud} t={t} />
				<Rack x={230} y={0} w={196} h={168} rattle={thud} t={t} />
				<rect x={-1400} y={0} width={2800} height={260} fill="url(#odgnd)" />
				<ellipse cx={0} cy={18} rx={620} ry={60} fill="url(#odpool)" />
				<Lamp x={-470} y={6} k={1.5} t={t} seed={13} glow={1.3} /><Lamp x={470} y={6} k={1.5} t={t} seed={29} glow={1.3} />
				<g fill={SIL} filter="url(#odrim)">{guard(-196, true)}{guard(196, false)}</g>
				{dust(-196 - 22)}{dust(196 + 22)}
			</g>
			{/* near-foreground rods (a third rack, out of focus) at the frame edges: parallax 1.9 */}
			<g transform={`translate(${f1(dx * 1.9)},0)`} filter="url(#odfg)">
				{[-40, 40, 110].map((x, i) => <Rod5 key={i} a={[x, 1180]} b={[x + 14, 560 + i * 30]} r={34} ph={i * 2} lit={1} dim={0.8} />)}
				{[1830, 1900, 1975].map((x, i) => <Rod5 key={i} a={[x, 1180]} b={[x - 12, 600 + i * 26]} r={34} ph={i * 2 + 1} lit={-1} dim={0.8} />)}
				<rect x={-120} y={1010} width={2160} height={90} fill="#120C09" />
			</g>
		</g>
		<rect width={W} height={H} fill="url(#odvig)" />
	</svg>; };

/* =====================================================================================================================
   SHOT 5 (BAR(4) → BAR(5)): 洛阳 (card 3). The camera starts high on the moon and the night sky over the gate tower and cranes
   down onto the wide gate with its 「洛阳」 plaque (landing at 1.45 s), pulling back as it lands; the 戟 guards march LEFT in step.
   ===================================================================================================================== */
const LuoSky: React.FC<{t: number; m: number; p: string}> = ({t, m, p}) => {
	const stars = Array.from({length: 90}, (_, i) => [rnd(i, 1) * 1240 - 60, rnd(i, 2) * 760 - 520, 0.6 + rnd(i, 3) * 1.1, 0.25 + rnd(i, 4) * 0.5]);
	return <g>
		<rect x={-200} y={-700} width={1520} height={1400} fill={`url(#${p}skyT)`} />
		{stars.map(([x, y, r, o], i) => <circle key={i} cx={x} cy={y} r={r} fill="#E8EEE6" opacity={o * (0.8 + 0.2 * Math.sin(t * (1 + rnd(i, 5) * 3) + i))} />)}
		<circle cx={905} cy={96} r={150} fill={`url(#${p}moon)`} /><circle cx={905} cy={96} r={25} fill="#E4E8DC" />
		<g opacity={0.5}>{[0, 1].map((i) => <ellipse key={i} cx={760 + i * 260 - m * 9 * (1 + i)} cy={70 + i * 46} rx={150 - i * 30} ry={9} fill="#3E4F55" filter={`url(#${p}bl8)`} />)}</g>
	</g>; };
const SKYT = <><stop offset="0" stopColor="#0E161D" /><stop offset="0.45" stopColor="#16222B" /><stop offset="0.66" stopColor="#253740" /><stop offset="0.83" stopColor="#455654" /><stop offset="0.92" stopColor="#68706A" /></>;
const Shot5: React.FC<{t: number}> = ({t}) => {
	const m = t - BAR(4), SC = 1920 / 1120, GY = GY0;
	const c = 1 - ease(cl((m + 0.12) / 1.62)), Y = 340 * c;                          /* the crane: 340 sheet px (≈ 580 px), lands at 1.5 s */
	const dyP = (k: number) => Y * k, zs = 1 + 0.07 * c + 0.012 * ease(seg(m, 1.4, 4));
	const fl = 1 + 0.035 * Math.sin(t * 5.3) + 0.02 * Math.sin(t * 11.9 + 1);
	return <svg width={W} height={H} style={{position: 'absolute'}}>
		<defs>
			<SkyDefs p="oe" />
			<linearGradient id="oeskyT" x1="0" y1="-700" x2="0" y2="700" gradientUnits="userSpaceOnUse">{SKYT}</linearGradient>
			<RimF id="oeQL" lx={1} ly={0} k={3} c={RIMW} o={0.9} lx2={-0.3} ly2={-1} k2={2} c2="#9FB8B6" o2={0.55} />
			<RimF id="oeQR" lx={-1} ly={0} k={3} c={RIMW} o={0.9} lx2={0.3} ly2={-1} k2={2} c2="#9FB8B6" o2={0.55} />
			<RimF id="oeBk" lx={-1} ly={-0.2} k={1.6} c="#FFE2B4" lx2={1} ly2={-0.2} k2={1.6} c2="#FFE2B4" />
			<RimF id="oeGd" lx={0.15} ly={-1} k={1.1} c="#FFD7A0" o={0.8} lx2={1} ly2={0} k2={0.7} c2={RIMW} o2={0.45} blur={0.5} />
			<linearGradient id="oespill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={KEY} stopOpacity="0.62" /><stop offset="1" stopColor={KEY} stopOpacity="0.06" /></linearGradient>
			<linearGradient id="oehaze1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6E7670" stopOpacity="0" /><stop offset="0.7" stopColor="#6E7670" stopOpacity="0.5" /><stop offset="1" stopColor="#6E7670" stopOpacity="0.1" /></linearGradient>
		</defs>
		<g transform={`${zoom(960, 560, zs)} scale(${SC})`}>
			<g transform={`translate(0,${f1(dyP(0.22))})`}><LuoSky t={t} m={m} p="oe" /></g>
			<g transform={`translate(0,${f1(dyP(0.5))})`} filter="url(#oebl3)">
				<path d="M-60,262 C80,232 170,222 260,240 C340,214 430,206 520,226 C620,198 760,208 860,232 C940,214 1040,218 1180,240 L1180,320 L-60,320 Z" fill="#2E3B3B" />
				<path d="M-60,286 L40,286 L52,270 L150,270 L162,286 L230,286 L238,276 L296,276 L304,286 L830,286 L840,268 L950,268 L962,286 L1010,286 L1018,274 L1084,274 L1092,286 L1180,286 L1180,320 L-60,320 Z" fill="#26302F" />
			</g>
			<g transform={`translate(0,${f1(dyP(0.62))})`}><rect x={-60 - (m * 4) % 200} y={210} width={1440} height={110} fill="url(#oehaze1)" /></g>
			<g transform={`translate(0,${f1(dyP(1))})`}>
				<g filter="url(#oedof)"><GateWallOp t={t} p="oe" x0={-80} x1={1200} /></g>
				<GatePlaque cx={560} top={300} w={134} h={58} fl={fl} p="oe" />
				<g fill={SIL} filter="url(#oeBk)"><Npc x={503} y={GY} k={0.37} kind="ji" /><Npc x={617} y={GY} k={0.37} kind="ji" flip /></g>
				<Lamp x={480} y={GY} k={0.37} t={t} seed={11} /><Lamp x={640} y={GY} k={0.37} t={t} seed={23} />
				<rect x={-80} y={GY} width={1300} height={200} fill="url(#oegnd)" />
				<path d={`M514,${GY} L606,${GY} L800,700 L320,700 Z`} fill="url(#oespill)" opacity={fl} />
				<path d={`M398,${GY} L462,${GY} L330,700 L200,700 Z M658,${GY} L722,${GY} L920,700 L790,700 Z`} fill="url(#oespill)" opacity={0.42 * fl} />
			</g>
			<g transform={`translate(0,${f1(dyP(1.04))})`}><rect x={-60 + (m * 6) % 300 - 300} y={440} width={1600} height={130} fill="url(#oehaze)" /></g>
			<g transform={`translate(0,${f1(dyP(1.06))})`}><GateGuards m={m + 2.0} gy={552} k={0.41} lightX={560} rim="oeGd" blur="oebl3" inStep /></g>
			<g transform={`translate(0,${f1(dyP(1.1))})`}>
				<g fill={SIL} filter="url(#oeQL)"><g transform="translate(196,556) scale(1.02,1.02) scale(-1,1)">{QueD}</g></g>
				<g fill={SIL} filter="url(#oeQR)"><g transform="translate(924,556) scale(1.02)">{QueD}</g></g>
			</g>
			<g transform={`translate(${f1(-10 * (1 - c))},${f1(-Y * 1.3)})`} filter="url(#oebl8)" fill="#0B0706">
				<path d="M-60,-60 L760,-60 L760,6 C540,18 270,34 -60,62 Z" />
				{Array.from({length: 34}, (_, i) => <circle key={i} cx={-40 + i * 23.5} cy={56 - i * 1.9} r={7.5} />)}
				<rect x={-60} y={-60} width={92} height={800} />
			</g>
			<rect x={-100} y={-100} width={1320} height={830} fill="url(#oevig)" />
		</g>
	</svg>; };

/* =====================================================================================================================
   SHOT 6 (BAR(5) → BAR(8)): 京师敛迹, the city goes quiet. Closer on the gate. Two late walkers hurry in through the central passage.
   The doors shut on the beats (left on beat 2, right on beat 3, the centre on beat 4); the gate lamps go out with them and the
   门楼 windows go out on the off-beats; nearly dark and still by BAR(6), a breath before the title. A slow push runs on to BAR(8)
   (the title draws a dimmed copy of this).
   ===================================================================================================================== */
/** a late walker seen from behind (silhouette, cm, soles y = 0): robe, a bundle on the back, alternate feet under the hem; ph = gait (rad) */
const WalkerBack: React.FC<{ph: number; bundle?: boolean}> = ({ph, bundle}) => {
	const s = Math.sin(ph), bob = Math.abs(Math.cos(ph)) * 3, sw = s * 2.4, fl = Math.max(0, s) * 7, fr = Math.max(0, -s) * 7;
	return <g>
		<path d={`M-11,${f1(-1 - fl)} L-2,${f1(-1 - fl)} L-2,${f1(-11 - fl)} L-11,${f1(-11 - fl)} Z M2,${f1(-1 - fr)} L11,${f1(-1 - fr)} L11,${f1(-11 - fr)} L2,${f1(-11 - fr)} Z`} />
		<g transform={`translate(${f1(sw)},${f1(-bob)}) rotate(${f1(s * 1.5)} 0 -60)`}>
			<path d="M-14,-138 C-22,-134 -24,-122 -22,-100 C-24,-70 -26,-40 -28,-8 L28,-8 C26,-40 24,-70 22,-100 C24,-122 22,-134 14,-138 Z" />
			<path d={`M-20,-132 C-27,-120 ${f1(-30 - s * 4)},-100 ${f1(-28 - s * 6)},-78 L${f1(-21 - s * 6)},-78 C-22,-98 -20,-116 -16,-128 Z`} />
			<path d={`M20,-132 C27,-120 ${f1(30 + s * 4)},-100 ${f1(28 + s * 6)},-78 L${f1(21 + s * 6)},-78 C22,-98 20,-116 16,-128 Z`} />
			<path d="M-6,-150 L6,-150 L7,-138 L-7,-138 Z" />
			<ellipse cx={0} cy={-158} rx={9.5} ry={11.5} /><path d="M-5,-168 C-5,-176 5,-176 5,-168 Z" />
			{bundle && <path d="M-16,-128 C-12,-136 12,-136 16,-128 L18,-100 C10,-94 -10,-94 -18,-100 Z" />}
		</g>
	</g>; };
const Shot6: React.FC<{t: number}> = ({t}) => {
	const m = t - BAR(5), bt = 1.99203 / 4, SC = 1920 / 1120, GY = GY0;
	const fl = 1 + 0.035 * Math.sin(t * 5.3) + 0.02 * Math.sin(t * 11.9 + 1);
	/* the doors: each pair shuts in 0.26 s, landing exactly on its beat */
	const shut = (b: number, d = 0.26) => ease(seg(m, b * bt - d, b * bt));
	const door = [shut(1), shut(3, 0.3), shut(2)];
	const dL = door[0], dC = door[1], dR = door[2];
	const lampL = 1 - seg(m, bt - 0.06, bt + 0.05), lampR = 1 - seg(m, 2 * bt - 0.06, 2 * bt + 0.05);
	const win = [0, 1, 2, 3, 4].map((i) => 1 - seg(m, [2.5, 3.5, 3.5, 2.5, 3.5][i] * bt + (i === 2 ? 0.25 * bt : 0), [2.5, 3.5, 3.5, 2.5, 3.5][i] * bt + (i === 2 ? 0.25 * bt : 0) + 0.08));
	const open = 1 - (dL * 0.25 + dC * 0.5 + dR * 0.25);
	const dark = 0.34 * ease(seg(m, 1.2, 2.0));
	/* camera: closer on the gate, a slow push and a slight crane down that runs on (eased) to BAR(8) */
	const cam = 0.7 * eout(cl(m / 2.6)) + 0.3 * cl(m / 6), Z = 1.3 + 0.22 * cam, cxs = 545, cys = 392 + 24 * cam;   /* 13 % in the shot, then a 3 % drift under the title */
	/* two late walkers hurry from the near right into the central passage (feet y 610 → 520 at the threshold, then into the tunnel) */
	const walker = (t0: number, x0: number, y0: number, bundle: boolean, seed: number) => {
		const q = cl((m - t0) / 1.05), x = x0 + (556 - x0) * ease(q), y = y0 + (GY - 1 - y0) * q, k = 0.52 + (0.36 - 0.52) * q;
		const q2 = cl((m - t0 - 1.05) / 0.5), yy = y - 26 * q2, kk = k * (1 - 0.3 * q2), ph = (m + seed) * Math.PI * 2 * 1.35;
		const inside = q >= 1, o = 1 - q2 * 0.9;
		if (q2 >= 1) return null;
		const g = <g transform={`translate(${f1(x)},${f1(yy)}) scale(${kk.toFixed(4)})`} opacity={o}><WalkerBack ph={ph} bundle={bundle} /></g>;
		return {inside, g, shadow: <ellipse cx={x} cy={y + 10 * k} rx={12 * k} ry={34 * k} fill="#000" opacity={0.3 * open} filter="url(#ofbl3)" />};
	};
	const ws = [walker(-0.32, 700, 640, true, 0.3), walker(-0.08, 650, 660, false, 0.05)];
	const inner = <g fill="#120B08">{ws.map((w, i) => w && w.inside ? <g key={i}>{w.g}</g> : null)}</g>;
	return <svg width={W} height={H} style={{position: 'absolute'}}>
		<defs>
			<SkyDefs p="of" />
			<linearGradient id="ofskyT" x1="0" y1="-700" x2="0" y2="700" gradientUnits="userSpaceOnUse">{SKYT}</linearGradient>
			<RimF id="ofQL" lx={1} ly={0} k={3} c={RIMW} o={0.9} lx2={-0.3} ly2={-1} k2={2} c2="#9FB8B6" o2={0.55} />
			<RimF id="ofQR" lx={-1} ly={0} k={3} c={RIMW} o={0.9} lx2={0.3} ly2={-1} k2={2} c2="#9FB8B6" o2={0.55} />
			<RimF id="ofQLm" lx={0.3} ly={-1} k={2} c="#9FB8B6" o={0.6} />
			<RimF id="ofBk" lx={-1} ly={-0.2} k={1.4} c="#FFE2B4" lx2={1} ly2={-0.2} k2={1.4} c2="#FFE2B4" />
			<RimF id="ofWk" lx={0} ly={-1} k={1.2} c="#FFE2B4" o={0.8} lx2={-1} ly2={0} k2={1} c2="#FFE2B4" o2={0.6} />
			<linearGradient id="ofspill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={KEY} stopOpacity="0.62" /><stop offset="1" stopColor={KEY} stopOpacity="0.06" /></linearGradient>
			<linearGradient id="ofhaze1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6E7670" stopOpacity="0" /><stop offset="0.7" stopColor="#6E7670" stopOpacity="0.5" /><stop offset="1" stopColor="#6E7670" stopOpacity="0.1" /></linearGradient>
		</defs>
		<g transform={`translate(${f1(960 - cxs * SC * Z)},${f1(540 - cys * SC * Z)}) scale(${(SC * Z).toFixed(5)})`}>
			<g transform={`translate(${f1(cxs * 0.2 * (1 - 1 / Z))},${f1(-40 + 30 * cam)})`}><LuoSky t={t} m={m + 2} p="of" /></g>
			<g filter="url(#ofbl3)">
				<path d="M-60,262 C80,232 170,222 260,240 C340,214 430,206 520,226 C620,198 760,208 860,232 C940,214 1040,218 1180,240 L1180,320 L-60,320 Z" fill="#2E3B3B" />
				<path d="M-60,286 L40,286 L52,270 L150,270 L162,286 L230,286 L238,276 L296,276 L304,286 L830,286 L840,268 L950,268 L962,286 L1010,286 L1018,274 L1084,274 L1092,286 L1180,286 L1180,320 L-60,320 Z" fill="#26302F" />
			</g>
			<rect x={-60 - ((m + 2) * 4) % 200} y={210} width={1440} height={110} fill="url(#ofhaze1)" />
			<g filter="url(#ofdof)"><GateWallOp t={t} p="of" x0={-80} x1={1200} door={door} win={win} inner={inner} /></g>
			<GatePlaque cx={560} top={300} w={134} h={58} fl={0.35 + 0.65 * open * fl} p="of" />
			<g fill={SIL} filter="url(#ofBk)"><Npc x={503} y={GY} k={0.37} kind="ji" /><Npc x={617} y={GY} k={0.37} kind="ji" flip /></g>
			<Lamp x={480} y={GY} k={0.37} t={t} seed={11} on={lampL} /><Lamp x={640} y={GY} k={0.37} t={t} seed={23} on={lampR} />
			<rect x={-80} y={GY} width={1300} height={200} fill="url(#ofgnd)" />
			<path d={`M${f1(560 - 46 * (1 - dC))},${GY} L${f1(560 + 46 * (1 - dC))},${GY} L${f1(560 + 240 * (1 - dC))},700 L${f1(560 - 240 * (1 - dC))},700 Z`} fill="url(#ofspill)" opacity={fl} />
			<path d={`M${f1(430 - 34 * (1 - dL))},${GY} L${f1(430 + 34 * (1 - dL))},${GY} L${f1(265 + 65 * (1 - dL))},700 L${f1(265 - 65 * (1 - dL))},700 Z`} fill="url(#ofspill)" opacity={0.42 * fl} />
			<path d={`M${f1(690 - 34 * (1 - dR))},${GY} L${f1(690 + 34 * (1 - dR))},${GY} L${f1(855 + 65 * (1 - dR))},700 L${f1(855 - 65 * (1 - dR))},700 Z`} fill="url(#ofspill)" opacity={0.42 * fl} />
			{ws.map((w, i) => w && !w.inside ? <g key={i}>{w.shadow}<g fill={SIL} filter="url(#ofWk)">{w.g}</g></g> : null)}
			<rect x={-60 + ((m + 2) * 6) % 300 - 300} y={440} width={1600} height={130} fill="url(#ofhaze)" />
			<g fill={SIL} filter="url(#ofQL)" opacity={1}><g transform="translate(196,556) scale(1.02,1.02) scale(-1,1)">{QueD}</g></g>
			<g fill={SIL} filter="url(#ofQR)"><g transform="translate(924,556) scale(1.02)">{QueD}</g></g>
			<rect x={-100} y={-100} width={1320} height={830} fill="url(#ofvig)" />
		</g>
		<rect width={W} height={H} fill="#05070A" opacity={dark} />
	</svg>; };

/** the opening: the shot that owns this frame (cut frames = round(BAR(n)·30)) */
export const OpenNew: React.FC<{t: number}> = ({t}) => { const k = [1, 2, 3, 4, 5].filter((n) => t >= BAR(n)).length;
	return k === 0 ? <Shot1 t={t} /> : k === 1 ? <Shot2 t={t} /> : k === 2 ? <Shot3 t={t} /> : k === 3 ? <Shot4 t={t} /> : k === 4 ? <Shot5 t={t} /> : <Shot6 t={t} />; };
