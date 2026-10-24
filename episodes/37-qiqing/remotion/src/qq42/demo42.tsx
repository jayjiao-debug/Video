import React from 'react';
import {W, H, SERIF, SANS, MONO, GOLD, rnd, lerp, Glow, Plate, Label, Subs, Blur, Smoke, Rimmed, fkPose, jointAt, Look4} from './kit42';
import {Room, Papyrus, Hieratic, LK} from './frames42';
/* ep42 demo (0–32.27): cold open → rewind → title → Egypt, animated from the key-frame components.
   Music map: HIT 9.060 · title 11.891 · Egypt 18.682 · end 32.270. Grid: beat 0.56605, downbeats 0.5688 + 2.2642n. */
export const DT = {hit: 9.06, title: 11.891, egypt: 18.682, end: 32.27};
export const BEAT = 0.56605, beatAt = (k: number) => 0.5688 + BEAT * k;
const cl = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (t: number, a: number, b: number) => cl((t - a) / (b - a));
const ease = (u: number) => { const x = cl(u); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const easeOut = (u: number) => 1 - Math.pow(1 - cl(u), 3);
const easeIn = (u: number) => Math.pow(cl(u), 3);
const sm = (u: number) => { const v = cl(u); return v * v * (3 - 2 * v); };
type P2 = [number, number];
const LookCam: React.FC<{z: number; L: P2; S: P2; roll?: number; children: React.ReactNode}> = ({z, L, S, roll = 0, children}) =>
	<g transform={`translate(${S[0]},${S[1]}) rotate(${roll}) scale(${z}) translate(${-L[0]},${-L[1]})`}>{children}</g>;
const toScreen = (p: P2, z: number, L: P2, S: P2): P2 => [S[0] + (p[0] - L[0]) * z, S[1] + (p[1] - L[1]) * z];

/* ======================= cold open: the phone, typing, results ======================= */
export const PHX = 1420, PHY = 520, PW = 380, PH = 780, PROT = -4;
const SX = PHX - PW / 2 + 14, SY = PHY - PH / 2 + 14, SW = PW - 28, SHH = PH - 28;
const QUERY = '人活着，到底为了什么？';
export const TYPE_T = [0.08, 0.36, 0.64, 1.05, 1.3, 1.44, 1.58, 1.72, 1.86, 2.0, 2.14];   // 人活着 0–0.87, pause, 到底为了什么？ 1.28–2.21
const SEARCH_T = 2.32;
const KW = (SW - 20) / 10, keyPos = (r: number, k: number, n: number): P2 => [SX + 10 + (10 - n) * KW / 2 + k * KW + KW / 2, SY + SHH - 312 + r * 66 + 27];
const KEYS: [number, number][] = TYPE_T.map((_, i) => { const r = Math.floor(rnd(i, 21) * 3), n = [10, 9, 7][r]; return [r, Math.floor(rnd(i, 22) * n)]; });
const SEARCH_KEY: P2 = [SX + SW - 62, SY + SHH - 87];
/** where the thumb tip is at time t (phone-local coordinates) and how far it is pressed in (0..1) */
const thumbAt = (t: number): {p: P2; press: number} => {
	const targets: [number, P2][] = [[-0.3, keyPos(1, 6, 9)], ...TYPE_T.map((tt, i) => [tt, keyPos(KEYS[i][0], KEYS[i][1], [10, 9, 7][KEYS[i][0]])] as [number, P2]), [SEARCH_T, SEARCH_KEY], [3.0, [SX + SW - 90, SY + SHH - 150]], [8.55, [SX + SW - 110, SY + SHH - 260]], [9.06, [SX + SW - 120, SY + SHH - 330]], [9.3, [SX + SW - 100, SY + SHH - 40]]];
	let i = 0; while (i < targets.length - 1 && t >= targets[i + 1][0]) i++;
	const [t0, p0] = targets[i], [t1, p1] = targets[Math.min(targets.length - 1, i + 1)], dur = Math.max(0.01, t1 - t0), u = i === targets.length - 1 ? 1 : ease(cl((t - t0) / Math.min(dur, 0.16)));
	const p: P2 = [lerp(p0[0], p1[0], u), lerp(p0[1], p1[1], u)];
	const press = Math.max(0, ...[...TYPE_T, SEARCH_T].map((tt) => 1 - Math.abs(t - tt) / 0.07));
	return {p: [p[0], p[1] - (1 - press) * 10], press};
};
/** one result card in the list */
const ResultCard: React.FC<{y: number; i: number; op: number}> = ({y, i, op}) => <g opacity={op}>
	<rect x={SX + 16} y={y} width={SW - 32} height={108} rx={14} fill="#1f2937" />
	<rect x={SX + 30} y={y + 18} width={72} height={72} rx={10} fill={['#3a4658', '#45505e', '#384252', '#3e485a'][i % 4]} />
	<rect x={SX + 116} y={y + 24} width={[170, 150, 186, 140][i % 4]} height={14} rx={7} fill="#c8d2e0" opacity={0.8} />
	<rect x={SX + 116} y={y + 52} width={180} height={10} rx={5} fill="#7a8698" opacity={0.6} /><rect x={SX + 116} y={y + 72} width={120} height={10} rx={5} fill="#7a8698" opacity={0.45} />
</g>;
/** the papyrus result: a strip of handwriting tagged 约前1850 */
const PapyrusCard: React.FC<{y: number; glow: number}> = ({y, glow}) => <g>
	<Glow x={PHX} y={y + 60} r={260} c="#ffcf7a" o={0.45 * glow} id="pcG" />
	<rect x={SX + 12} y={y - 4} width={SW - 24} height={124} rx={16} fill="#2b2418" stroke={GOLD} strokeWidth={2 + glow * 1.5} strokeOpacity={0.5 + 0.5 * glow} />
	<g><rect x={SX + 26} y={y + 12} width={SW - 52} height={52} fill="#dcc596" /><Hieratic x={SX + 34} y={y + 12} w={SW - 70} h={48} cols={14} seed={8} /></g>
	<rect x={SX + 26} y={y + 76} width={92} height={30} rx={15} fill={GOLD} /><text x={SX + 72} y={y + 98} textAnchor="middle" style={{fontFamily: SANS, fontSize: 18, fontWeight: 700}} fill="#2b1a08">约前1850</text>
	<rect x={SX + 132} y={y + 84} width={150} height={13} rx={6} fill="#e8d8b0" opacity={0.75} />
</g>;
/** the screen: status bar, search box being typed, keyboard, then results; `rew` (0..) scrolls the list violently backwards */
const Screen: React.FC<{t: number; rew?: number; rewT?: number}> = ({t, rew = -1, rewT = 0}) => {
	const n = TYPE_T.filter((tt) => t >= tt).length, typed = QUERY.slice(0, n), blink = (Math.floor(t * 2.2) % 2 === 0) || (t < 2.4 && n < QUERY.length);
	const kbOut = easeIn(seg(t, 2.45, 2.85)), res = seg(t, 2.55, 3.3), pc = easeOut(seg(t, 5.1, 5.6)), glow = sm(seg(t, 5.3, 6.2)) * (0.85 + 0.15 * Math.sin(t * 5));
	const th = thumbAt(t);
	const searchKeyLit = 1 - Math.abs(t - SEARCH_T) / 0.12;
	return <g>
		<defs><linearGradient id="dmScr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1b2534" /><stop offset="1" stopColor="#0b1018" /></linearGradient>
			<clipPath id="dmScrC"><rect x={SX} y={SY} width={SW} height={SHH} rx={44} /></clipPath>
			<filter id="dmVb" x="-10%" y="-60%" width="120%" height="220%"><feGaussianBlur stdDeviation={`0 ${rew > 0 ? 6 + 30 * Math.min(1, rew) : 0}`} /></filter></defs>
		<rect x={SX} y={SY} width={SW} height={SHH} rx={44} fill="url(#dmScr)" />
		<g clipPath="url(#dmScrC)">
			{rew < 0 ? <g>
				{/* results */}
				{res > 0 && <g transform={`translate(0,${pc * 132})`}>{[0, 1, 2, 3, 4].map((i) => <ResultCard key={i} i={i} y={SY + 168 + i * 124 + (1 - easeOut(seg(t, 2.55 + i * 0.08, 3.0 + i * 0.08))) * 40} op={easeOut(seg(t, 2.55 + i * 0.08, 3.0 + i * 0.08))} />)}</g>}
				{pc > 0 && <PapyrusCard y={SY + 168 + (1 - pc) * 520} glow={glow} />}
				{/* keyboard */}
				{kbOut < 1 && <g transform={`translate(0,${kbOut * 360})`}>
					<rect x={SX} y={SY + SHH - 330} width={SW} height={330} fill="#1a212c" />
					{[10, 9, 7].map((nn, r) => Array.from({length: nn}, (_, k) => { const [x, y] = keyPos(r, k, nn), lit = Math.max(0, ...TYPE_T.map((tt, i) => (KEYS[i][0] === r && KEYS[i][1] === k ? 1 - Math.abs(t - tt - 0.03) / 0.12 : 0)));
						return <rect key={`${r}_${k}`} x={x - KW / 2 + 3} y={y - 27} width={KW - 6} height={54} rx={7} fill={lit > 0 ? '#6a7890' : '#3a4352'} />; }))}
					<rect x={SX + 70} y={SY + SHH - 114} width={SW - 190} height={54} rx={7} fill="#3a4352" />
					<rect x={SX + SW - 112} y={SY + SHH - 114} width={100} height={54} rx={7} fill={searchKeyLit > 0 ? '#7fb0ff' : '#2f7cf6'} /><text x={SX + SW - 62} y={SY + SHH - 79} textAnchor="middle" style={{fontFamily: SANS, fontSize: 20, fontWeight: 700}} fill="#fff">搜索</text>
				</g>}
			</g> : <RewindCards rew={rew} rewT={rewT} />}
			{/* status bar + search box stay on top */}
			<rect x={SX} y={SY} width={SW} height={150} fill="#1b2534" opacity={rew < 0 ? 1 : 0.9} />
			<rect x={PHX - 50} y={SY + 16} width={100} height={26} rx={13} fill="#05070a" />
			<text x={SX + 34} y={SY + 40} style={{fontFamily: SANS, fontSize: 22, fontWeight: 700}} fill="#e6ecf5">03:07</text>
			<g transform={`translate(${SX + 112},${SY + 32})`}><circle r={8} fill="none" stroke="#e6ecf5" strokeWidth={2.4} /><path d="M0,-4 V0 L3,2" stroke="#e6ecf5" strokeWidth={2} fill="none" /><path d="M-8,-8 l-3,-3 M8,-8 l3,-3" stroke="#e6ecf5" strokeWidth={2.4} /></g>
			<rect x={SX + SW - 70} y={SY + 26} width={34} height={15} rx={4} fill="none" stroke="#e6ecf5" strokeWidth={2} /><rect x={SX + SW - 67} y={SY + 29} width={13} height={9} rx={2} fill="#e6ecf5" />
			<rect x={SX + 18} y={SY + 76} width={SW - 36} height={62} rx={31} fill="#263243" stroke={n > 0 ? '#5a86c0' : '#3a4a60'} strokeWidth={2} />
			<circle cx={SX + 48} cy={SY + 104} r={9} fill="none" stroke="#9fb3cc" strokeWidth={3} /><path d={`M${SX + 54},${SY + 111} l7,7`} stroke="#9fb3cc" strokeWidth={3} strokeLinecap="round" />
			{n === 0 ? <text x={SX + 70} y={SY + 115} style={{fontFamily: SANS, fontSize: 22}} fill="#6a7a90">搜索</text> : <text x={SX + 70} y={SY + 115} style={{fontFamily: SANS, fontSize: 22, fontWeight: 500}} fill="#ffffff">{typed}</text>}
			{blink && rew < 0 && <rect x={SX + 70 + n * 22 + 2} y={SY + 94} width={3} height={28} fill="#6fb1ff" />}
		</g>
		{rew < 0 && <Thumb p={th.p} press={th.press} />}
		{rew >= 0 && rewT < 0.35 && <Thumb p={thumbAt(DT.hit + rewT).p} press={0} />}
	</g>;
};
/* the right hand: fingertips round the left edge, palm under the phone, wrist and sleeve going down out of frame, thumb on the glass */
const THUMB_BASE: P2 = [PHX + PW / 2 - 6, PHY + PH / 2 - 70];
const thumbPath = (tip: P2) => { const [bx, by] = THUMB_BASE, dx = tip[0] - bx, dy = tip[1] - by, l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l, nx = -uy, ny = ux;
	const P = (s: number, w: number) => `${(bx + ux * s * l + nx * w).toFixed(1)},${(by + uy * s * l + ny * w).toFixed(1)}`;
	return `M${P(-0.12, 34)} L${P(0.55, 25)} Q${P(0.92, 22)} ${P(1.0, 0)} Q${P(0.92, -21)} ${P(0.55, -21)} L${P(-0.12, -30)} Z`; };
const HAND_STATIC = [
	`M${PHX - PW / 2 + 40},${PHY + PH / 2 - 30} Q${PHX - 40},${PHY + PH / 2 + 70} ${PHX + 120},${PHY + PH / 2 + 60} Q${PHX + PW / 2 + 40},${PHY + PH / 2 + 30} ${PHX + PW / 2 + 30},${PHY + PH / 2 - 110} L${PHX + PW / 2 + 70},${PHY + PH / 2 - 40} Q${PHX + PW / 2 + 70},${PHY + PH / 2 + 110} ${PHX + 140},${PHY + PH / 2 + 150} L${PHX - 40},${PHY + PH / 2 + 140} Q${PHX - PW / 2 + 10},${PHY + PH / 2 + 60} ${PHX - PW / 2 + 40},${PHY + PH / 2 - 30} Z`,
	...[0, 1, 2, 3].map((i) => { const y = PHY + 130 + i * 62, x = PHX - PW / 2 + 4; return `M${x + 6},${y - 22} Q${x - 30},${y - 20} ${x - 30},${y + 2} Q${x - 30},${y + 24} ${x + 6},${y + 24} Z`; }),
];
const SLEEVE = `M${PHX - 70},${PHY + PH / 2 + 120} Q${PHX + 60},${PHY + PH / 2 + 170} ${PHX + 170},${PHY + PH / 2 + 130} L${PHX + 120},${H + 160} L${PHX - 260},${H + 160} Z`;
const Thumb: React.FC<{p: P2; press: number}> = ({p, press}) => <g>
	<path d={thumbPath(p)} fill="#ffcf96" opacity={0.4} transform="translate(3,-2)" />
	<path d={thumbPath(p)} fill="#0d0b0f" />
	{press > 0.2 && <circle cx={p[0] - 8} cy={p[1] - 12} r={10 + 12 * press} fill="#9fc8ff" opacity={0.18 * press} />}
</g>;
const HandBack: React.FC = () => <g>
	<g fill="#ffcf96" opacity={0.42} transform="translate(3,-2)"><path d={SLEEVE} />{HAND_STATIC.map((d, i) => <path key={i} d={d} />)}</g>
	<g fill="#0d0b0f"><path d={SLEEVE} />{HAND_STATIC.map((d, i) => <path key={i} d={d} />)}</g>
	<path d={`M${PHX - 66},${PHY + PH / 2 + 118} Q${PHX + 60},${PHY + PH / 2 + 166} ${PHX + 172},${PHY + PH / 2 + 126}`} stroke="#2a2430" strokeWidth={10} fill="none" />{/* cuff seam */}
</g>;
/** the viewer seen from behind (head, hood, shoulders); breathing and a small nod */
const Viewer: React.FC<{t: number}> = ({t}) => {
	const nod = 3 * Math.sin(Math.PI * seg(t, 2.2, 2.7)) + 1.2 * Math.sin(t * 1.3), by = 3 * Math.sin(t * 1.6);
	const body = <g transform={`translate(0,${by})`}>
		<path d="M-60,1100 L-60,990 Q40,900 250,890 Q420,880 560,905 Q760,930 900,1100 Z" />
		<path d="M250,905 Q300,840 430,850 Q560,860 600,920 Q520,960 420,955 Q300,955 250,905 Z" />
		<path d="M330,900 L340,830 L510,830 L520,905 Z" />
		<g transform={`rotate(${nod} 430 820)`}>
			<ellipse cx={430} cy={740} rx={142} ry={160} />
			<path d="M300,690 Q310,560 430,566 Q560,570 574,700 L560,690 Q548,640 520,620 L530,600 Q480,610 470,596 Q440,612 400,598 L408,618 Q350,628 318,700 Z" />
			<path d="M560,730 Q590,740 584,780 Q576,808 556,800 Z" />
		</g>
		<path d="M700,960 Q820,930 900,1000 L960,1100 L760,1100 Z" />{/* right shoulder, the arm goes forward out of frame */}
	</g>;
	return <g><g fill="#ffcf96" opacity={0.42} transform="translate(4,-3)">{body}</g><g fill="#09080c">{body}</g></g>;
};
const PhoneLive: React.FC<{t: number; rew?: number; rewT?: number; bezel?: number}> = ({t, rew = -1, rewT = 0, bezel = 1}) => <g transform={`rotate(${PROT} ${PHX} ${PHY})`}>
	<Glow x={PHX} y={PHY} r={520} c="#7fa6ff" o={0.2} id="dmPhG" />
	<g opacity={bezel}><HandBack /><rect x={PHX - PW / 2} y={PHY - PH / 2} width={PW} height={PH} rx={58} fill="#111318" stroke="#2a2d36" strokeWidth={3} /></g>
	<Screen t={t} rew={rew} rewT={rewT} />
</g>;
const coldCam = (t: number) => { const a = ease(seg(t, 0, 5.1)), b = ease(seg(t, 5.1, 9.06));
	return {z: 1 + 0.06 * a + 0.39 * b, L: [lerp(lerp(1000, 1200, a), PHX - 10, b), lerp(540, 470, b)] as P2, S: [lerp(1000, 1080, a + b * 0), lerp(540, 470, b)] as P2}; };
export const ColdOpen: React.FC<{t: number}> = ({t}) => { const c = coldCam(t);
	return <g><LookCam z={c.z} L={c.L} S={[lerp(c.S[0], 1180, ease(seg(t, 5.1, 9.06))), c.S[1]]}>
		<RoomLive t={t} />
		<PhoneLive t={t} />
		<Viewer t={t} />
	</LookCam></g>; };
const RoomLive: React.FC<{t: number}> = ({t}) => <g>
	<Room />
	{/* city lights in the window twinkle a little */}
	{Array.from({length: 10}, (_, i) => <circle key={i} cx={130 + rnd(i, 31) * 370} cy={430 + rnd(i, 32) * 100} r={3 + 3 * rnd(i, 33)} fill="#ffe2b0" opacity={0.25 * (0.5 + 0.5 * Math.sin(t * (1.2 + rnd(i, 34) * 2) + i))} />)}
</g>;

/* ======================= rewind: the list flies backwards, the glass turns to papyrus ======================= */
type Mat = 'glass' | 'form' | 'letter' | 'scroll' | 'slips' | 'clay' | 'papyrus';
const MATS: Mat[] = ['glass', 'glass', 'form', 'form', 'letter', 'scroll', 'scroll', 'slips', 'slips', 'clay', 'clay', 'papyrus', 'papyrus', 'papyrus'];
const MatCard: React.FC<{y: number; m: Mat; i: number}> = ({y, m, i}) => { const x = SX + 16, w = SW - 32, h = 112;
	switch (m) {
		case 'glass': return <g><rect x={x} y={y} width={w} height={h} rx={14} fill="#1f2937" /><rect x={x + 14} y={y + 18} width={72} height={72} rx={10} fill="#3a4658" /><rect x={x + 100} y={y + 26} width={170} height={14} rx={7} fill="#c8d2e0" opacity={0.8} /><rect x={x + 100} y={y + 54} width={150} height={10} rx={5} fill="#7a8698" /></g>;
		case 'form': return <g><rect x={x} y={y} width={w} height={h} fill="#efe6d0" />{Array.from({length: 5}, (_, k) => <g key={k}><rect x={x + 14} y={y + 16 + k * 19} width={90} height={5} fill="#3a3a44" opacity={0.7} /><rect x={x + 112} y={y + 20 + k * 19} width={w - 130} height={1.5} fill="#3a3a44" opacity={0.5} /></g>)}</g>;
		case 'letter': return <g><rect x={x} y={y} width={w} height={h} fill="#f2ead6" />{Array.from({length: 5}, (_, k) => <path key={k} d={`M${x + 16},${y + 22 + k * 18} q20,-8 40,0 t40,0 t40,0 t40,0 t40,0 t40,0`} stroke="#2a2440" strokeWidth={1.6} fill="none" opacity={0.7} />)}</g>;
		case 'scroll': return <g><rect x={x + 10} y={y + 10} width={w - 20} height={h - 20} fill="#e8d8b0" /><rect x={x} y={y} width={w} height={14} rx={7} fill="#8a6038" /><rect x={x} y={y + h - 14} width={w} height={14} rx={7} fill="#8a6038" />{Array.from({length: 4}, (_, k) => <rect key={k} x={x + 26} y={y + 30 + k * 16} width={w - 60} height={3} fill="#3a2a1a" opacity={0.6} />)}</g>;
		case 'slips': return <g>{Array.from({length: 11}, (_, k) => <g key={k}><rect x={x + 6 + k * 27} y={y} width={22} height={h} fill={k % 2 ? '#d8b878' : '#ccaa6a'} />{Array.from({length: 4}, (_, r) => <rect key={r} x={x + 13 + k * 27} y={y + 12 + r * 24} width={8} height={12} fill="#2a1a0a" opacity={0.7} />)}</g>)}<rect x={x} y={y + 30} width={w} height={3} fill="#5a3a1a" /><rect x={x} y={y + 80} width={w} height={3} fill="#5a3a1a" /></g>;
		case 'clay': return <g><rect x={x + 4} y={y} width={w - 8} height={h} rx={20} fill="#6e4426" />{Array.from({length: 4}, (_, r) => Array.from({length: 9}, (_, k) => <path key={`${r}_${k}`} d={`M${x + 24 + k * 32},${y + 18 + r * 24} l10,4 l-10,4 Z M${x + 30 + k * 32},${y + 22 + r * 24} h14`} stroke="#2a1608" strokeWidth={2} fill="#2a1608" />))}</g>;
		default: return <g><rect x={x} y={y} width={w} height={h} fill="#dcc596" /><Hieratic x={x + 8} y={y + 6} w={w - 16} h={h - 12} cols={16} seed={i} /></g>;
	}
};
const RewindCards: React.FC<{rew: number; rewT: number}> = ({rew, rewT}) => {
	// the list scrolls DOWN fast (back up through older and older results), slowing at the end; card k enters from the top
	const off = 2350 * (1 - Math.pow(1 - cl(rewT / 2.3), 2.2)), step = 128, base = SY + 168;
	const k0 = Math.max(0, Math.floor((off - (SY + SHH - base)) / step) - 1), k1 = Math.ceil((off - (SY - step - base)) / step) + 1;
	return <g filter="url(#dmVb)">{Array.from({length: Math.max(0, k1 - k0 + 1)}, (_, j) => { const k = k0 + j, y = base + off - k * step;
		return <MatCard key={k} y={y} m={MATS[Math.min(MATS.length - 1, Math.floor(k * MATS.length / 19))]} i={k} />; })}
		<rect x={SX} y={SY} width={SW} height={SHH} fill="#c9a86a" opacity={0.08 * rew} />
	</g>;
};
/** year shown during the rewind */
const yearAt = (u: number) => { const keys: [number, number][] = [[0, 2026], [0.14, 1938], [0.28, 1888], [0.45, 170], [0.6, -399], [0.7, -500], [0.84, -1800], [0.92, -1850], [1, -1850]];
	let i = 0; while (i < keys.length - 2 && u > keys[i + 1][0]) i++; const [a, ya] = keys[i], [b, yb] = keys[i + 1], y = Math.round(lerp(ya, yb, cl((u - a) / (b - a))));
	return y > 0 ? `${y}` : `公元前 ${-y}`; };
export const Rewind: React.FC<{tau: number; t: number}> = ({tau, t}) => {
	const c0 = coldCam(DT.hit - 0.001), S0: P2 = [lerp(c0.S[0], 1180, 1), c0.S[1]];
	const pz = ease(seg(tau, 0, 1.0)), z = lerp(c0.z, 2.3, pz), L: P2 = [lerp(c0.L[0], PHX, pz), lerp(c0.L[1], PHY, pz)], S: P2 = [lerp(S0[0], 960, pz), lerp(S0[1], 540, pz)];
	const kick = (k: number) => Math.exp(-((tau - (beatAt(k) - DT.hit)) ** 2) / 0.004);
	const punch = [16, 17, 18, 19].reduce((s, k) => s + kick(k), 0) + Math.exp(-(tau ** 2) / 0.004);
	const roll = lerp(0, -PROT, ease(seg(tau, 0.2, 1.0))) + 0.6 * Math.sin(tau * 40) * Math.exp(-tau * 2);
	const rew = cl(tau / 0.25), pap = sm(seg(tau, 1.35, 2.2)), expand = ease(seg(tau, 1.85, 2.75)), bezel = 1 - sm(seg(tau, 1.4, 2.0)), roomFade = sm(seg(tau, 0.1, 0.9));
	// the screen's rectangle on screen (rotation is straightened by then)
	const zz = z * (1 + 0.03 * punch), tl = toScreen([SX, SY], zz, L, S), br = toScreen([SX + SW, SY + SHH], zz, L, S);
	const rx0 = lerp(tl[0], -60, expand), rx1 = lerp(br[0], W + 60, expand), ry0 = lerp(Math.max(-40, tl[1]), -40, expand), ry1 = lerp(Math.min(H + 40, br[1]), H + 40, expand);
	return <g>
		<rect width={W} height={H} fill="#07060a" />
		<LookCam z={zz} L={L} S={S} roll={roll}>
			<g opacity={1 - roomFade}><RoomLive t={t} /><Viewer t={t} /></g>
			<PhoneLive t={DT.hit} rew={rew} rewT={tau} bezel={bezel} />
		</LookCam>
		{/* the glass turns to papyrus, then unrolls to the frame's edges */}
		<defs><clipPath id="rwPapC"><rect x={rx0} y={ry0} width={rx1 - rx0} height={ry1 - ry0} rx={lerp(44 * z, 0, expand)} /></clipPath></defs>
		<g clipPath="url(#rwPapC)" opacity={pap}><Papyrus id="dmPap" /></g>
		{expand > 0 && expand < 1 && [rx0, rx1].map((x, i) => <g key={i}><rect x={x - 22} y={-20} width={44} height={H + 40} rx={20} fill="#b99662" /><rect x={x - 22} y={-20} width={10} height={H + 40} fill="#8a6a3a" opacity={0.6} /></g>)}
		<g opacity={1 - sm(seg(tau, 2.5, 2.83))}>
			<text x={96} y={150} style={{fontFamily: MONO, fontWeight: 700, fontSize: 64 * (1 + 0.12 * punch)}} fill="#f4ead2" stroke="rgba(0,0,0,0.55)" strokeWidth={6} paintOrder="stroke">◀◀</text>
			<text x={W - 90} y={150} textAnchor="end" style={{fontFamily: SANS, fontWeight: 700, fontSize: 76, letterSpacing: '0.04em'}} fill="#f4ead2" stroke="rgba(0,0,0,0.55)" strokeWidth={6} paintOrder="stroke">{yearAt(cl(tau / 2.45))}</text>
		</g>
	</g>;
};

/* ======================= title: written in ink on the papyrus ======================= */
const L1 = '人活着为了什么？', L2 = '人类问了近四千年';
const L1S = 116, L1A = 116 * 1.08, L1X = W / 2 + 37 - (L1A * 8) / 2, L2S = 100, L2A = 108, L2X = W / 2 + 6 - (L2A * 8) / 2;
const InkChar: React.FC<{ch: string; x: number; y: number; s: number; u: number; gold?: boolean; id: string}> = ({ch, x, y, s, u, gold, id}) => {
	if (u <= 0) return null; const k = easeOut(u);
	return <g>
		<defs><clipPath id={id}><rect x={x - 10} y={y - s * 1.0} width={(s + 20) * k} height={s * 1.3} /></clipPath></defs>
		<g clipPath={`url(#${id})`} transform={`translate(${x + s / 2},${y - s * 0.35}) scale(${1 + 0.12 * (1 - k)}) translate(${-x - s / 2},${-y + s * 0.35})`}>
			{gold ? <text x={x} y={y} style={{fontFamily: SERIF, fontWeight: 900, fontSize: s}} fill="url(#ttGoldD)" stroke="#4a2a0a" strokeWidth={5} paintOrder="stroke">{ch}</text>
				: <><text x={x} y={y} style={{fontFamily: SERIF, fontWeight: 900, fontSize: s, filter: 'blur(2.5px)'}} fill="#2a1a0c" opacity={0.35 * k}>{ch}</text><text x={x} y={y} style={{fontFamily: SERIF, fontWeight: 900, fontSize: s}} fill="#1c1209" opacity={0.6 + 0.4 * k}>{ch}</text></>}
		</g>
	</g>;
};
export const Title: React.FC<{tau: number; t: number}> = ({tau, t}) => {
	const slam = Math.exp(-(tau ** 2) / 0.01), push = lerp(1.0, 1.05, ease(seg(tau, 0, 6.8))) + 0.025 * slam, dx = 10 * Math.sin(tau * 0.5), dy = 6 * Math.sin(tau * 0.37 + 1);
	const burn = sm(seg(tau, 0, 0.8)), fadeTitle = 1 - sm(seg(tau, 6.25, 6.79)), goldGlow = sm(seg(tau, 2.6, 3.6)) * (0.85 + 0.15 * Math.sin(t * 3));
	return <g>
		<defs>
			<radialGradient id="dmBurn" cx="0.5" cy="0.5" r="0.72"><stop offset="0.5" stopColor="#2a1608" stopOpacity="0" /><stop offset="1" stopColor="#1a0c04" stopOpacity="0.85" /></radialGradient>
			<linearGradient id="ttGoldD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe9a8" /><stop offset="0.55" stopColor="#f2c25a" /><stop offset="1" stopColor="#c98a24" /></linearGradient>
		</defs>
		<g transform={`translate(${W / 2 + dx},${H / 2 + dy}) scale(${push}) translate(${-W / 2},${-H / 2})`}>
			<Papyrus id="dmPap" />
			<g opacity={fadeTitle}>
				{L1.split('').map((ch, i) => <InkChar key={i} id={`ic1_${i}`} ch={ch} x={L1X + i * L1A} y={500} s={L1S} u={seg(tau, i * 0.13, i * 0.13 + 0.22)} />)}
				<path d="M640,548 Q960,560 1290,544" stroke="#1c1209" strokeWidth={3} fill="none" opacity={0.5} strokeDasharray={660} strokeDashoffset={660 * (1 - ease(seg(tau, 1.0, 1.6)))} />
				<Glow x={W / 2} y={640} r={520} c="#ffcf6a" o={0.28 * goldGlow} id="dmTtGl" />
				{L2.split('').map((ch, i) => <InkChar key={i} id={`ic2_${i}`} ch={ch} x={L2X + i * L2A} y={680} s={L2S} u={seg(tau, 2.45 + i * 0.15, 2.45 + i * 0.15 + 0.24)} gold />)}
			</g>
		</g>
		<rect width={W} height={H} fill="url(#dmBurn)" opacity={burn} />
	</g>;
};

/* ======================= Egypt: the scribe, his Ba, the greedy world ======================= */
type FKA = {hip: number; lean: number; neck: number; lt: number; lk: number; rt: number; rk: number; la: number; le: number; ra: number; re: number};
const mixF = (a: FKA, b: FKA, k: number): FKA => Object.fromEntries(Object.keys(a).map((n) => [n, lerp(a[n as keyof FKA], b[n as keyof FKA], k)])) as FKA;
const SC_WRITE: FKA = {hip: 0.1, lean: 30, neck: 22, lt: 82, lk: 162, rt: 78, rk: 158, la: 10, le: 80, ra: 25, re: 60};
const SC_ARGA: FKA = {...SC_WRITE, lean: 8, neck: -8, ra: 100, re: -18};
const SC_ARGB: FKA = {...SC_WRITE, lean: 14, neck: -2, ra: 70, re: 26};
const SC_LOOK: FKA = {...SC_WRITE, lean: 6, neck: -16, ra: 24, re: 62};
/** scribe pose at Egypt time tau */
const scribeFK = (tau: number): FKA => {
	const T2 = 22.645 - DT.egypt, T3 = 26.607 - DT.egypt, TS = 28.3 - DT.egypt;
	const w = {...SC_WRITE, re: SC_WRITE.re + 4 * Math.sin(tau * 11) + 2 * Math.sin(tau * 4.3), ra: SC_WRITE.ra + 2 * Math.sin(tau * 2.1)};
	if (tau < T2 + 0.3) return w;
	if (tau < T3) { const k = sm(seg(tau, T2 + 0.3, T2 + 0.9)), bt = (tau + DT.egypt - beatAt(39)) / (2 * BEAT), alt = 0.5 - 0.5 * Math.cos(Math.PI * 2 * bt * 0.5);
		return mixF(w, mixF(SC_ARGA, SC_ARGB, sm(alt)), k * (1 - sm(seg(tau, T3 - 0.35, T3)))); }
	if (tau < TS) return w;
	const k = sm(seg(tau, TS, TS + 0.7)), br = 0.5 * Math.sin(tau * 1.7);
	return mixF(w, {...SC_LOOK, lean: SC_LOOK.lean + br}, k);
};
/** the Ba: a falcon's body with a HUMAN head (Egyptian bob wig, a face in profile, a short ritual beard). Faces right; ground at y=0. */
const Ba2: React.FC<{x: number; y: number; s: number; flip?: boolean; wing: number; op: number; tilt?: number}> = ({x, y, s, flip, wing, op, tilt = 0}) => {
	const wingD = 'M0,0 Q-30,6 -70,52 L-94,104 L-80,96 L-84,118 L-66,100 L-66,118 L-50,92 Q-24,60 14,22 Z';
	const body = 'M4,-150 Q-30,-146 -42,-112 Q-52,-80 -70,-52 L-108,-24 L-100,-12 L-42,-46 Q-16,-58 2,-58 Q30,-62 40,-92 Q48,-124 38,-150 Z';
	const legs = 'M-8,-60 L-12,0 L0,0 L4,-60 Z M10,-60 L14,0 L26,0 L18,-60 Z M-22,0 L6,-2 L6,3 L-22,4 Z M6,0 L36,-2 L36,3 L6,4 Z';
	const neck = 'M6,-178 L36,-170 L40,-140 L2,-146 Z';
	const face = 'M14,-176 Q8,-222 40,-232 Q60,-234 64,-214 L66,-206 L78,-192 L68,-189 L70,-181 L66,-178 L69,-172 Q66,-164 58,-163 L52,-160 L38,-160 Z';
	const wig = 'M-12,-160 Q-22,-206 2,-228 Q22,-244 48,-238 Q66,-232 66,-214 L46,-214 Q40,-212 38,-204 L38,-166 L44,-156 L-14,-150 Z';
	const beard = 'M58,-164 L64,-142 L56,-140 L52,-160 Z';
	const g = (fill: string, wingK: number, o = 1) => <g opacity={o}>
		<g transform={`translate(-14,-128) rotate(${wingK * 0.85 + 6})`}><path d={wingD} fill={fill} opacity={0.75} /></g>
		<path d={body} fill={fill} /><path d={legs} fill={fill} /><path d={neck} fill={fill} />
		<g transform={`rotate(${tilt} 30 -165)`}><path d={face} fill={fill} /><path d={wig} fill={fill} /><path d={beard} fill={fill} /></g>
		<g transform={`translate(-6,-132) rotate(${wingK + 4})`}><path d={wingD} fill={fill} /></g>
	</g>;
	return <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`} opacity={op}>
		<Blur id="ba2B" s={9}>{g('#ffcf70', wing, 0.55)}</Blur>
		{g('#f6d79a', wing)}
		{/* inner detail so the face reads: the wig darker, the eye */}
		<g transform={`rotate(${tilt} 30 -165)`}><path d="M-12,-160 Q-22,-206 2,-228 Q22,-244 48,-238 Q66,-232 66,-214 L46,-214 Q40,-212 38,-204 L38,-166 L44,-156 L-14,-150 Z" fill="#b8822e" opacity={0.85} />
			<path d="M-8,-176 L36,-178 M-10,-192 L36,-194" stroke="#8a5a1a" strokeWidth={2} opacity={0.5} />
			<path d="M50,-204 Q56,-207 62,-203 Q56,-201 50,-204 Z" fill="#3a2410" /><path d="M58,-163 L64,-142 L56,-140 L52,-160 Z" fill="#b8822e" /></g>
		<g transform={`translate(-6,-132) rotate(${wing + 4})`}>{[0, 1, 2].map((i) => <path key={i} d={`M${-10 - i * 14},${20 + i * 18} Q${-30 - i * 14},${40 + i * 18} ${-50 - i * 10},${70 + i * 14}`} stroke="#c8963c" strokeWidth={2} fill="none" opacity={0.7} />)}</g>
	</g>;
};
/** small background people: fkPose silhouettes at a distance */
const PERSON: Look4 = {dress: 'shirt', legs: 'bare', head: 'egwig'};
const Greed: React.FC<{tau: number}> = ({tau}) => {
	const te = tau + DT.egypt, snatch = sm(seg(te, beatAt(47) - 0.1, beatAt(47) + 0.35)), flee = sm(seg(te, beatAt(48), beatAt(52))), turn = sm(seg(te, 27.0, 27.5));
	const gy = 796, h = 150;
	const carry = fkPose({hip: 0.655, lean: 4, neck: 2, lt: 10 * Math.sin(te * 3), lk: 8, rt: -10 * Math.sin(te * 3), rk: 8, la: 60, le: 40, ra: 64, re: 36});
	const reach = fkPose({hip: 0.62, lean: 16, neck: 4, lt: 16, lk: 14, rt: -14, rk: 10, la: 80, le: 6, ra: 86, re: 4});
	const runP = fkPose({hip: 0.62, lean: 14, neck: 6, lt: 28 * Math.sin(te * 9), lk: 30, rt: -28 * Math.sin(te * 9), rk: 30, la: 60, le: 50, ra: 64, re: 40});
	const hoard = fkPose({hip: 0.3, lean: 40, neck: 20, lt: 94, lk: 120, rt: 70, rk: 120, la: 70, le: 60, ra: 74, re: 54});
	const walkAway = fkPose({hip: 0.655, lean: 6, neck: 8, lt: 20 * Math.sin(te * 2.6), lk: 12, rt: -20 * Math.sin(te * 2.6), rk: 12, la: -14 * Math.sin(te * 2.6), le: 20, ra: 14 * Math.sin(te * 2.6), re: 20});
	const ax = 1400 + 16 * seg(te, 21, 27), bx = lerp(1300, 1220, flee), dx = 1730 + 60 * seg(te, 26.6, 32.3);
	const aP = snatch < 0.5 ? carry : reach, bP = snatch < 0.3 ? fkPose({hip: 0.655, lean: 10, neck: 4, lt: 8, lk: 8, rt: -6, rk: 6, la: 40, le: 30, ra: 30, re: 30}) : snatch < 1 ? reach : runP;
	const aHand = jointAt(carry, 'RHand', ax, gy, h), bHand = jointAt(runP, 'RHand', bx, gy, h, true);
	const basket: P2 = [lerp(aHand[0] + 8, bHand[0] - 8, snatch), lerp(aHand[1], bHand[1], snatch)];
	const col = '#2a1c1e', rim = '#ffc898';
	return <g>
		<path d="M1180,812 Q1300,770 1500,778 Q1700,782 1920,770 L1920,840 L1180,840 Z" fill="#7a5e48" />
		<path d="M1200,806 Q1400,782 1920,776" stroke="#b08a64" strokeWidth={2} fill="none" opacity={0.6} />
		{/* the grain heap and the man hoarding it */}
		<path d="M1530,798 Q1590,738 1650,798 Z" fill="#a07a4a" /><path d="M1548,790 Q1590,750 1632,790" stroke="#c8a06a" strokeWidth={2} fill="none" opacity={0.6} />
		<Rimmed x={1670} ground={gy + 2} h={h} pose={hoard} look={PERSON} flip col={col} rim={rim} rimOp={0.4} rimDx={2} />
		<Rimmed x={dx} ground={gy - 2} h={h * 0.95} pose={walkAway} look={PERSON} col={col} rim={rim} rimOp={0.35} rimDx={2} />
		<Rimmed x={ax} ground={gy} h={h} pose={aP} look={PERSON} col={col} rim={rim} rimOp={0.4} rimDx={2} />
		<Rimmed x={bx} ground={gy} h={h} pose={bP} look={PERSON} flip={snatch > 0.5 || turn < 0 ? true : false} col={col} rim={rim} rimOp={0.4} rimDx={2} />
		<g transform={`translate(${basket[0]},${basket[1]})`}><path d="M-16,-2 L16,-2 L12,16 L-12,16 Z" fill="#6a4a2a" /><path d="M-16,-2 Q0,-12 16,-2" fill="#c8a06a" /></g>
	</g>;
};
const Birds: React.FC<{t: number}> = ({t}) => <g>{[0, 1, 2, 3].map((i) => { const x = 1700 - ((t * (34 + 8 * i) + i * 260) % 2200), y = 240 + i * 26 + 8 * Math.sin(t * 0.7 + i), f = Math.sin(t * (5 + i) + i) * 10, s = 1 - i * 0.12;
	return <path key={i} d={`M${x - 18 * s},${y - f * s} Q${x - 8 * s},${y - 4 * s} ${x},${y} Q${x + 8 * s},${y - 4 * s} ${x + 18 * s},${y - f * s}`} stroke="#3a2a30" strokeWidth={2.4} fill="none" opacity={0.7} />; })}</g>;
const Water: React.FC<{t: number}> = ({t}) => <g>{Array.from({length: 34}, (_, i) => { const y = 600 + rnd(i, 51) * 220, len = 30 + 90 * rnd(i, 52), x = ((rnd(i, 53) * 2200 + t * (8 + 10 * rnd(i, 54))) % 2200) - 140;
	return <rect key={i} x={x} y={y} width={len} height={2} rx={1} fill="#ffe2c0" opacity={(0.12 + 0.2 * rnd(i, 55)) * (0.5 + 0.5 * Math.sin(t * (1.5 + rnd(i, 56) * 2) + i))} />; })}</g>;
const Palm: React.FC<{x: number; y: number; s: number; t: number}> = ({x, y, s, t}) => { const sw = 2.5 * Math.sin(t * 0.9), top: P2 = [x + 40 * s + sw * 2, y - 560 * s];
	return <g fill="#1c1418">
		<path d={`M${x - 12 * s},${y} Q${x + 10 * s},${y - 300 * s} ${top[0] - 6 * s},${top[1]} L${top[0] + 8 * s},${top[1]} Q${x + 26 * s},${y - 300 * s} ${x + 14 * s},${y} Z`} />
		{Array.from({length: 9}, (_, i) => { const a = -160 + i * 40 + 3 * Math.sin(t * 1.1 + i), r = (150 + 30 * rnd(i, 61)) * s, rad = a * Math.PI / 180, droop = 70 * s;
			const tip: P2 = [top[0] + Math.cos(rad) * r, top[1] + Math.sin(rad) * r * 0.5 + droop], mid: P2 = [top[0] + Math.cos(rad) * r * 0.5, top[1] + Math.sin(rad) * r * 0.5 - 10 * s];
			return <path key={i} d={`M${top[0]},${top[1]} Q${mid[0]},${mid[1] - 14 * s} ${tip[0]},${tip[1]} Q${mid[0]},${mid[1] + 10 * s} ${top[0]},${top[1] + 8 * s} Z`} />; })}
	</g>; };
const Reeds: React.FC<{t: number}> = ({t}) => <g>{Array.from({length: 16}, (_, i) => { const x = 250 + i * 16 + 10 * rnd(i, 71), h = 90 + 70 * rnd(i, 72), b = 6 * Math.sin(t * 1.3 + i * 0.6);
	return <path key={i} d={`M${x - 3},${880} Q${x + b * 0.5},${880 - h * 0.6} ${x + b},${880 - h} Q${x + b * 0.5 + 2},${880 - h * 0.6} ${x + 3},${880} Z`} fill="#1e2218" opacity={0.85} />; })}</g>;
export const Egypt: React.FC<{tau: number; t: number}> = ({tau, t}) => {
	const x = 640, g = 905, h = 640, fk = scribeFK(tau), pose = fkPose(fk);
	const lh = jointAt(pose, 'LHand', x, g, h), rh = jointAt(pose, 'RHand', x, g, h), kn = jointAt(pose, 'LKnee', x, g, h), hp = jointAt(pose, 'Hips', x, g, h);
	const py = g - 0.11 * h, rollL = 700, rollR = 1010;   // the roll lies in his lap; the pen moves over it
	const writing = tau < 22.645 - DT.egypt + 0.3 || (tau > 26.607 - DT.egypt && tau < 28.3 - DT.egypt);
	const pen: P2 = [rh[0] + 24, py];
	const penX = rh[0] + 20 - 6 * seg(tau, 0, 9.6), written = rollR - 14 - penX;
	// camera: from a close-up of the pen on the papyrus, pull back to the wide shot; at the end a slow drift east
	const pb = ease(seg(tau, 0, 3.4)), z = lerp(5.2, 1, pb) * lerp(1, 1.03, sm(seg(tau, 9.6, 13.6))), L: P2 = [lerp(pen[0] - 30, 960, pb) + 40 * sm(seg(tau, 9.6, 13.6)), lerp(py, 540, pb)];
	const T2 = 22.645 - DT.egypt, baIn = sm(seg(tau, T2 + 0.25, T2 + 0.9)), bt = (tau + DT.egypt - beatAt(39)) / BEAT;
	const wing = tau < T2 ? 0 : (tau < 26.4 - DT.egypt ? 55 + 45 * Math.abs(Math.sin(Math.PI * bt * 0.5)) : lerp(60, 8, sm(seg(tau, 26.4 - DT.egypt, 27.2 - DT.egypt)))) * baIn;
	const baTilt = 5 * Math.sin(Math.PI * bt * 0.5) * (tau < 26.4 - DT.egypt ? 1 : 0);
	return <g>
		<LookCam z={z} L={L} S={[960, 540]}>
			<Plate k="nile" />
			<Water t={t} />
			<Glow x={760} y={430} r={700} c="#ffb27a" o={0.18} id="egSunD" />
			<Birds t={t} />
			<Greed tau={tau} />
			<path d="M0,860 Q500,840 1100,870 Q1500,890 1920,900 L1920,1080 L0,1080 Z" fill="#6e5440" opacity={0.92} />
			<path d="M0,880 Q600,872 1920,915" stroke="#a88660" strokeWidth={3} fill="none" opacity={0.5} />
			<Reeds t={t} />
			<Palm x={110} y={900} s={1.05} t={t} />
			{/* the scribe */}
			<Rimmed x={x} ground={g} h={h} pose={pose} look={LK.scribe} col="#120c0c" rim="#ffd2a0" rimOp={0.5} />
			<path d={`M${hp[0] - 60},${hp[1] - 40} L${hp[0] + 40},${hp[1] - 44} Q${kn[0] + 30},${kn[1] - 30} ${kn[0] + 40},${kn[1] + 8} L${hp[0] - 70},${g - 6} Z`} fill="#120c0c" />
			{/* the roll across his lap: written columns run right to left from the far end up to the pen */}
			<g transform={`rotate(-4 ${rollL} ${py})`}>
				<rect x={rollL} y={py - 30} width={rollR - rollL} height={62} fill="#e9d6a4" />
				<g opacity={0.5}>{Array.from({length: 9}, (_, i) => <rect key={i} x={rollL} y={py - 30 + i * 7} width={rollR - rollL} height={2} fill={i % 2 ? '#f6e6bc' : '#c9b07a'} />)}</g>
				<Hieratic x={penX + 6} y={py - 26} w={Math.max(0, written)} h={54} cols={Math.max(1, Math.round(written / 13))} seed={3} />
				{writing && <rect x={penX - 4} y={py - 26} width={10} height={54 * (0.3 + 0.7 * ((tau * 1.3) % 1))} fill="none" />}
				<rect x={rollL - 14} y={py - 34} width={26} height={70} rx={12} fill="#cdb47c" stroke="#8a7042" strokeWidth={1.5} />
				<rect x={rollR - 12} y={py - 34} width={26} height={70} rx={12} fill="#cdb47c" stroke="#8a7042" strokeWidth={1.5} />
			</g>
			{/* his hands on the roll: the left holds it, the right holds the rush pen */}
			<path d={`M${rh[0] + 2},${rh[1] - 6} L${writing ? rh[0] + 22 : rh[0] + 34},${writing ? py - 4 + 8 * Math.sin(tau * 11) : rh[1] - 34}`} stroke="#2a1c10" strokeWidth={3} strokeLinecap="round" />
			<g transform={`translate(${x + 230},${g - 6}) rotate(-6)`}><rect x={-80} y={-14} width={170} height={16} rx={3} fill="#7a5532" stroke="#3a2614" strokeWidth={1.5} />
				<circle cx={-62} cy={-6} r={6} fill="#141010" /><circle cx={-44} cy={-6} r={6} fill="#8c2a1c" /><rect x={-28} y={-9} width={108} height={5} rx={2} fill="#3a2614" /><path d="M-20,-7 L76,-7" stroke="#c9a46a" strokeWidth={1.4} /></g>
			<g transform={`translate(${x - 170},${g - 4})`}><path d="M-22,0 Q-30,-30 -12,-46 L12,-46 Q30,-30 22,0 Z" fill="#5a3a24" /><rect x={-14} y={-52} width={28} height={8} rx={3} fill="#4a2e1c" /></g>
			{/* the Ba: it gathers out of the written columns and stands on the stone beside him */}
			<path d="M960,912 Q980,872 1060,868 Q1140,870 1150,912 Z" fill="#3a2c24" />
			{tau > T2 - 0.1 && tau < T2 + 1.0 && Array.from({length: 18}, (_, i) => { const u = cl((tau - T2 - i * 0.025) / 0.6), sx = 820 + rnd(i, 81) * 120, sy = py - 10, ex = 1050 + (rnd(i, 82) - 0.5) * 80, ey = 760 + rnd(i, 83) * 100;
				return u > 0 && u < 1 && <circle key={i} cx={lerp(sx, ex, u)} cy={lerp(sy, ey, u) - 60 * Math.sin(Math.PI * u)} r={2 + 2 * rnd(i, 84)} fill="#ffe2a0" opacity={0.9 * Math.sin(Math.PI * u)} />; })}
			{baIn > 0 && <><Glow x={1055} y={720} r={260} c="#ffd27a" o={0.35 * baIn} id="ba2G" /><Ba2 x={1055} y={874} s={1.3 * lerp(0.92, 1, baIn)} flip wing={wing} op={baIn} tilt={baTilt} /></>}
		</LookCam>
	</g>;
};
void SERIF; void Smoke; void Label; void Subs;
