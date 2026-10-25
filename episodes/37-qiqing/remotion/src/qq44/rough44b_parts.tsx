import React from 'react';
import {W, H, rnd, lerp, Glow, Rimmed, fkPose, Look4, Pose, B, jointAt, Sky, HeadGlow} from './kit44';
import {Cam, seg, ease, eo, ei, sm, K2Scene, K2_C, k2Glow, skullBack, GLOW_BACK} from './demo44';
import {SANS, ROSE, INK} from './skin44';
import {Motes, Wallpaper, Frame, Curtain, Cloud} from './bg44';
/* ep44 rough cut, builder B: private copies of demo44 internals (the K2 compass close-up and the K1 house camera),
   changed only where the ending needs it. The shared files are not edited. */
type P2 = [number, number];
export const RIMB = '#ffc4a0';
export const LKB: Record<string, Look4> = {
	child: {dress: 'tunic', head: 'child', build: 1.12}, diamond: {dress: 'coat', head: 'bob'}, harvey: {dress: 'jacket', head: 'baldf', build: 1.05},
	young: {dress: 'jacket', head: 'short'}, evelyn: {dress: 'dress', head: 'bob'}, expert: {dress: 'coat', head: 'glasses'},
	r1: {dress: 'coat', head: 'short'}, r2: {dress: 'jacket', head: 'glasses'}, r3: {dress: 'coat', head: 'bob'}, r4: {dress: 'jacket', head: 'bald'}, r5: {dress: 'shirt', head: 'short'}, r6: {dress: 'coat', head: 'bun'},
};
export const scr = (p: P2, cx: number, cy: number, z: number): P2 => [(p[0] - cx) * z + W / 2, (p[1] - cy) * z + H / 2];
const placeHead = (pose: Pose, hx: number, hy: number, h: number, flip = false) => ({x: hx - (flip ? -1 : 1) * pose.Head[0] * h, ground: hy + pose.Head[1] * h});
export const headC = (pose: Pose, x: number, g: number, h: number, flip = false): P2 => { const hd = jointAt(pose, 'Head', x, g, h, flip), tp = jointAt(pose, 'Top', x, g, h, flip); return [lerp(hd[0], tp[0], 0.45), lerp(hd[1], tp[1], 0.45)]; };

/** horizontal whip streaks (screen space), as in demo44 */
export const Streaks: React.FC<{k: number; seed?: number}> = ({k, seed = 0}) => k <= 0.01 ? null : <g opacity={k}>{Array.from({length: 28}, (_, i) =>
	<rect key={i} x={-200 + rnd(i, 7 + seed) * W} y={rnd(i, 8 + seed) * H} width={300 + 600 * rnd(i, 9)} height={2 + 5 * rnd(i, 10)} fill={i % 4 ? '#d8d2c8' : B.mid} opacity={0.25 + 0.35 * rnd(i, 11)} />)}</g>;

/** a rubber stamp that slams in: rose = 「找到了！」, grey = the debunk */
export const RStamp: React.FC<{x: number; y: number; s: string; k: number; grey?: boolean; rot?: number; size?: number; o?: number; strike?: number}> = ({x, y, s, k, grey, rot = -8, size = 44, o = 1, strike = 0}) => {
	if (k <= 0) return null;
	if (strike > 0) { const w = s.length * size * 1.02 + size * 0.9;   // the claim, struck through in grey (the debunk lands beside it)
		return <g><RStamp x={x} y={y} s={s} k={k} grey={grey} rot={rot} size={size} o={o * (1 - 0.45 * Math.min(1, strike))} />
			<g transform={`translate(${x},${y}) rotate(${rot})`}><line x1={-w / 2 - size * 0.15} y1={size * 0.05} x2={-w / 2 - size * 0.15 + (w + size * 0.3) * eo(Math.min(1, strike))} y2={-size * 0.05} stroke="#d8d2c8" strokeWidth={size * 0.13} strokeLinecap="round" /></g></g>; }
	const sc = 1 + 0.9 * (1 - eo(k)), op = Math.min(1, k * 3) * o, w = s.length * size * 1.02 + size * 0.9, h = size * 1.55;
	const ink = grey ? '#c9c4ba' : ROSE, back = grey ? 'rgba(22,22,22,0.78)' : 'rgba(46,18,12,0.62)';
	return <g transform={`translate(${x},${y}) rotate(${rot}) scale(${sc})`} opacity={op}>
		{!grey && <Glow x={0} y={0} r={w * 0.7} c={B.halo} o={0.25} id={`rs${Math.round(x)}_${Math.round(y)}`} />}
		<rect x={-w / 2} y={-h / 2} width={w} height={h} rx={size * 0.14} fill={back} stroke={ink} strokeWidth={size * 0.09} />
		<rect x={-w / 2 + size * 0.16} y={-h / 2 + size * 0.16} width={w - size * 0.32} height={h - size * 0.32} rx={size * 0.08} fill="none" stroke={ink} strokeWidth={size * 0.03} opacity={0.7} />
		<text x={0} y={size * 0.36} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 900, fontSize: size, letterSpacing: '0.06em'}} fill={ink}>{s}</text></g>;
};

/** the open, unplaced sky (no marker anywhere): shared shape for the ashes beat and the museum match */
export const OpenSky: React.FC<{t: number; id: string; x?: number; y?: number; w?: number; h?: number; ash?: number}> = ({t, id, x = 0, y = 0, w = W, h = H, ash = 0.6}) => <g>
	<Sky id={id} x={x} y={y} w={w} h={h} stops={[[0, '#1b2632'], [0.45, '#3d4a58'], [0.78, '#8a8486'], [1, '#c4a28c']]} />
	<Glow x={x + w * 0.62} y={y + h * 0.98} r={w * 0.42} c="#f0c8a8" o={0.32} id={`${id}h`} />
	{[[0.18, 0.3, 1.3], [0.55, 0.18, 1.7], [0.84, 0.42, 1.1], [0.36, 0.6, 0.9]].map(([cx, cy, s], i) => <Cloud key={i} x={x + w * cx + t * 9 * (i + 1) % (w * 0.3)} y={y + h * cy} s={s * w / 1920} col="#56606c" o={0.5} />)}
	{Array.from({length: 22}, (_, i) => { const px = x + ((rnd(i, 81) * w + t * (14 + 10 * rnd(i, 82))) % w), py = y + h * (0.25 + 0.7 * rnd(i, 83)) - ((t * 12 * rnd(i, 84)) % (h * 0.2));
		return <circle key={i} cx={px} cy={py} r={(1.2 + 2 * rnd(i, 85)) * w / 1920} fill="#efe6dc" opacity={ash * (0.25 + 0.35 * Math.abs(Math.sin(t * 0.7 + i)))} />; })}
</g>;

/* ---------- K1 house camera (copied from demo44) so the brain can land in the boy's head ---------- */
const KX = 1920;
export const kidP = fkPose({hip: 0.36, lean: 10, neck: 22, lt: 88, lk: 92, rt: 84, rk: 88, la: 52, le: 76, ra: 48, re: 80});
const fatherP = (t: number) => fkPose({hip: 0.37, lean: lerp(4, 12, ease(seg(t, 18.5, 19.2))), neck: 14, lt: 86, lk: 90, rt: 82, rk: 86, la: 40, le: 60, ra: lerp(18, 62, ease(seg(t, 18.5, 19.2))), re: lerp(70, 34, ease(seg(t, 18.5, 19.2)))});
const compassAt = (t: number): P2 => { const fh = jointAt(fatherP(t), 'RHand', KX + 760, 910, 700), kh = jointAt(kidP, 'RHand', KX + 1080, 904, 430, true), k = ease(seg(t, 19.3, 19.9)); return [lerp(fh[0] + 18, kh[0] - 10, k), lerp(fh[1] - 14, kh[1] - 18, k)]; };
export const homeCam = (t: number): {cx: number; cy: number; z: number} => {
	let cx = 900 + 30 * Math.sin(t * 0.3), cy = 600, z = 1.12 + 0.012 * (t - 14.75);
	const pan = ease(seg(t, 17.85, 18.75)); cx = lerp(cx, KX + 980 + 20 * Math.sin(t * 0.4), pan); cy = lerp(cy, 560, pan); z = lerp(z, 1.05 + 0.01 * (t - 18.25), pan);
	const push = ease(seg(t, 20.75, 21.55)), cp = compassAt(t); cx = lerp(cx, cp[0], push); cy = lerp(cy, cp[1], push); z = lerp(z, 3.4, push);
	return {cx, cy, z};
};
/** the boy's head on screen in the K1 house shot at demo time tm */
export const kidHeadScreen = (tm: number): P2 => { const c = homeCam(tm), h = skullBack(kidP, KX + 1080, 904, 430, true, GLOW_BACK); return scr(h, c.cx, c.cy, c.z); };   // lands on the head glow (round 2: back of the skull)

/* ---------- the ending on K2's exact shot (F2–F4), now Fixer 1's fixed close-up from demo44 (`K2Scene`: the boy's own forearms,
   real thumbs, child scale). ft = story time; F2 starts at 142.0 = demo 21.5 (the 22 s frame). Changes from the demo: no push into
   the needle tip; F3 the boy looks up from the compass (他 line: the glow dims a little); F4 the glow ramps ~1.5x to the film's brightest,
   peaking ~0.5 s after 好奇心 types and holding; the end card (EndCard, below) then dims the whole shot to ~30 %. ---------- */
export const NeedleEnd: React.FC<{t: number}> = ({t: ft}) => {
	const u = ft - 142.0, t = 21.5 + u;
	const dim = sm(seg(ft, 145.5, 146.0)) * (1 - sm(seg(ft, 149.0, 149.5))), bright = sm(seg(ft, 149.0, 149.8)), look = ease(seg(ft, 145.6, 146.7));
	const flare = (0.55 + 0.45 * sm(seg(u, 0, 0.5)) + 0.1 * Math.sin(t * 4)) * (1 - 0.4 * dim) + 0.45 * bright;
	const intro = eo(seg(u, 0, 0.5)), drift = Math.max(0, u - 0.5);
	/* from F3 the camera tilts up a little so his head (and the F4 glow) sits clear of the two subtitle rows */
	const frame = ease(seg(ft, 145.4, 146.9));
	const cx = lerp(lerp(K2_C[0] - 120, 1000, intro), 940, frame) - 6 * drift, cy = lerp(lerp(K2_C[1] - 60, 560, intro), 468, frame) - 2 * drift, z = lerp(1.7, 1.06, intro) + 0.006 * drift;
	const g = k2Glow(look);
	return <g>
		<Sky id="bk2s" stops={[[0, '#4a3a30'], [0.7, '#3a2c24'], [1, '#2a201a']]} />
		<Cam cx={cx} cy={cy} z={z}>
			<K2Scene t={t} id="bk2" look={look} flare={Math.min(1, flare)} bright={bright} fieldK={1 - 0.5 * look} rimOp={0.5 + 0.25 * bright} />
			{/* F4: the extra rise on top of K2's own glow (radius and opacity about 1.5x at the peak) */}
			{bright > 0 && <g><Glow x={g[0]} y={g[1]} r={630} c={B.mid} o={0.22 * bright} id="bk2xb" /><HeadGlow x={g[0]} y={g[1]} r={99} id="bk2x" o={0.55 * bright} /></g>}
		</Cam>
	</g>;
};

void ei; void H;

/* ---------- the Juno end card (story 152.75 → 162.5): the compass shot dimmed to ~30 % underneath, J monogram, the title in rose-gold,
   (the question itself is the master's centred punch line at 76 px, y 470), the follow pill and the sources line from script.md.
   No "出品". The master hides the corner seal and the counter while it is up, and fades to black at the very end. ---------- */
export const END_T = 152.75;
const SOURCES = ['资料：Witelson 等《柳叶刀》1999 · Falk 等《Brain》2013 · Levy《新泽西月刊》1978 · Burrell《科学美国人》2015 · NPR 2005',
	'美国国家健康与医学博物馆 · Paterniti（C-SPAN 2000）· 诺贝尔奖官网 · 美国国家档案馆 · 爱因斯坦《自述》'];
/* round 2 (owner note 2): the title in two lines, 「假如说你是」 (small) over 「爱因斯坦的大脑」 (big); same reveal span as the 9-character title */
const TITLE_L1 = '假如说你是', TITLE_L2 = '爱因斯坦的大脑';
const CARD_CH = [...TITLE_L1.split('').map((ch, j) => ({ch, x: 960 + (j - (TITLE_L1.length - 1) / 2) * 48, y: 318, fs: 42})),
	...TITLE_L2.split('').map((ch, j) => ({ch, x: 960 + (j - (TITLE_L2.length - 1) / 2) * 74, y: 404, fs: 68}))];
const CARD_STEP = 0.4 / (CARD_CH.length - 1);
const CARD_SERIF = "'Noto Serif CJK SC','Noto Serif CJK',serif";
/** the channel monogram: a ring that draws itself, an italic J, a small four-point spark (rose-gold, the film's one colour) */
const JMark: React.FC<{draw: number}> = ({draw}) => { const r = 50, c = 2 * Math.PI * r, k = Math.min(1, draw * 1.3), spark = Math.max(0, Math.min(1, (draw - 0.6) / 0.4));
	return <g>
		<circle r={r} fill="none" stroke={ROSE} strokeWidth={2.6} strokeDasharray={c} strokeDashoffset={c * (1 - k)} transform="rotate(-90)" />
		<circle r={43} fill="none" stroke={ROSE} strokeWidth={1} opacity={0.4 * draw} />
		<text y={21} textAnchor="middle" style={{fontFamily: "'DejaVu Serif',serif", fontStyle: 'italic', fontWeight: 700, fontSize: 60}} fill={ROSE} opacity={Math.max(0, Math.min(1, (draw - 0.3) / 0.4))}>J</text>
		<path d="M0,-9 L2.2,-2.2 L9,0 L2.2,2.2 L0,9 L-2.2,2.2 L-9,0 L-2.2,-2.2 Z" fill="#fff1e6" transform={`translate(37,-37) scale(${spark * 1.3}) rotate(${draw * 90})`} />
	</g>; };
export const EndCard: React.FC<{t: number}> = ({t}) => {
	if (t < END_T - 0.05) return null;
	const dim = sm(seg(t, END_T, END_T + 0.6)), mono = seg(t, END_T + 0.5, END_T + 1.6), pill = eo(seg(t, END_T + 1.3, END_T + 1.7)), src = sm(seg(t, END_T + 1.8, END_T + 2.4));
	return <g>
		<rect width={W} height={H} fill="#07090a" opacity={0.7 * dim} />
		<defs><linearGradient id="ecRose" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe2d2" /><stop offset="0.55" stopColor={ROSE} /><stop offset="1" stopColor="#d98a6c" /></linearGradient></defs>
		<g transform="translate(960,196)" opacity={sm(seg(t, END_T + 0.4, END_T + 0.8))}><JMark draw={mono} /></g>
			{CARD_CH.map((c, i) => { const k = seg(t, END_T + 0.15 + i * CARD_STEP, END_T + 0.45 + i * CARD_STEP); return k > 0 &&
				<text key={i} x={c.x} y={c.y + 14 * (1 - eo(k))} textAnchor="middle" style={{fontFamily: CARD_SERIF, fontWeight: 900, fontSize: c.fs}} fill="url(#ecRose)" stroke="rgba(30,14,10,0.55)" strokeWidth={c.fs > 50 ? 4 : 3} paintOrder="stroke" opacity={eo(k)}>{c.ch}</text>; })}
		{pill > 0.01 && <g transform={`translate(960,712) scale(${0.85 + 0.15 * pill})`} opacity={pill}>
			<rect x={-250} y={-33} width={500} height={66} rx={33} fill="rgba(255,178,145,0.10)" stroke={ROSE} strokeOpacity={0.8} strokeWidth={2} />
			<text x={0} y={11} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 700, fontSize: 31, letterSpacing: '0.08em'}} fill={INK}>关注 Juno · 一起看懂世界</text></g>}
		<g opacity={0.66 * src} style={{fontFamily: SANS, fontSize: 21, fontWeight: 500}} fill="#d8d0c8">
			{SOURCES.map((s, i) => <text key={i} x={960} y={986 + i * 32} textAnchor="middle">{s}</text>)}</g>
	</g>;
};
