import React from 'react';
import {W, H, SERIF, SANS, MONO, rnd, lerp, Glow, Plate, Blur, Rimmed, fkPose, jointAt, Look4} from './kit42';
import {LK, Hieratic, Tablet} from './frames42';
import {LookCam, PHX, PHY, PhoneLive, RoomLive, Viewer, MatCard, MATS, InkChar, mixF, SC_WRITE, SC_ARGA, SC_ARGB, SC_LOOK, FKA, Ba2, Greed, Birds, Water, Palm, Reeds, BEAT, beatAt} from './demo42';
/* ep42 demo v2 (owner's new hook, no title card): phone 0–2.27 → Harvard montage → the tablet (HIT 9.060 push) →
   rewind to 11.891 → Egypt with the title inked onto the scribe's papyrus, then the pull back; ends 25.48. */
export const T = {harvard: 2.267, dark: 6.06, tablet: 6.9, hit: 9.06, egypt: 11.891, e2: 15.85, e3: 19.82, stop: 21.55, end: 25.48};
const cl = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (t: number, a: number, b: number) => cl((t - a) / (b - a));
const ease = (u: number) => { const x = cl(u); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const easeOut = (u: number) => 1 - Math.pow(1 - cl(u), 3);
const easeIn = (u: number) => Math.pow(cl(u), 3);
const sm = (u: number) => { const v = cl(u); return v * v * (3 - 2 * v); };
type P2 = [number, number];

/* ---------------- 0–2.267 the phone ---------------- */
export const HookPhone: React.FC<{t: number}> = ({t}) => {
	const a = ease(seg(t, 0, 2.0)), dive = easeIn(seg(t, 1.95, 2.267));
	const z = (1 + 0.1 * a) * lerp(1, 2.6, dive), L: P2 = [lerp(lerp(1000, 1180, a), PHX - 20, dive), lerp(540, 500, a)], S: P2 = [lerp(1000, 1060, a), lerp(540, 500, a)];
	return <g>
		<LookCam z={z} L={L} S={S}><RoomLive t={t} /><PhoneLive t={t} /><Viewer t={t} /></LookCam>
		<rect width={W} height={H} fill="#dce8ff" opacity={0.55 * easeIn(seg(t, 2.02, 2.267))} />
	</g>;
};

/* ---------------- 2.267–7.3 Harvard: flashbulbs, 724, files, one face aging ---------------- */
type Sitter = {head: Look4['head']; lean: number; neck: number; build?: number; collar?: boolean};
const YOUNG: Sitter[] = [{head: 'short', lean: 0, neck: -2, collar: true}, {head: 'short', lean: 2, neck: 2, build: 1.06, collar: true}, {head: 'cap', lean: 1, neck: 0, collar: true}, {head: 'bowl', lean: -1, neck: 4, collar: true}, {head: 'cap', lean: 3, neck: -3, build: 1.1, collar: true}];
const AGES: Sitter[] = [{head: 'short', lean: 0, neck: -2, collar: true}, {head: 'short', lean: 3, neck: 3, build: 1.08, collar: true}, {head: 'baldf', lean: 6, neck: 8, build: 1.12, collar: true}, {head: 'baldf', lean: 12, neck: 15, build: 1.1, collar: true}];
const PW2 = 460, PH2 = 560;
/** a 1930s studio portrait: paper border, sepia ground, a sitter in jacket and collar */
const Portrait: React.FC<{cx: number; cy: number; s: number; rot?: number; sit: Sitter; tone?: number; op?: number; id: string; wife?: number}> = ({cx, cy, s, rot = 0, sit, tone = 0, op = 1, id, wife = 0}) => {
	const pose = fkPose({hip: 0.655, lean: sit.lean, neck: sit.neck, lt: 2, lk: 2, rt: -3, rk: 3, la: 4, le: 8, ra: 6, re: 10}), hh = 1150;
	const top = jointAt(pose, 'Top', 0, 0, hh), gx = -top[0] - 30, gy = -PH2 / 2 + 70 - top[1];
	const nk = jointAt(pose, 'Neck1', gx, gy, hh), sp = jointAt(pose, 'Spine1', gx, gy, hh);
	const bg1 = tone > 0.5 ? '#c8a888' : '#bba07c', bg2 = tone > 0.5 ? '#6a4a3a' : '#5e4a34';
	return <g transform={`translate(${cx},${cy}) rotate(${rot}) scale(${s})`} opacity={op}>
		<rect x={-PW2 / 2 - 16} y={-PH2 / 2 - 16} width={PW2 + 32} height={PH2 + 60} fill="#ece2c8" />
		<defs><clipPath id={`${id}c`}><rect x={-PW2 / 2} y={-PH2 / 2} width={PW2} height={PH2} /></clipPath>
			<radialGradient id={`${id}g`} cx="0.45" cy="0.35" r="0.75"><stop offset="0" stopColor={bg1} /><stop offset="1" stopColor={bg2} /></radialGradient></defs>
		<g clipPath={`url(#${id}c)`}>
			<rect x={-PW2 / 2} y={-PH2 / 2} width={PW2} height={PH2} fill={`url(#${id}g)`} />
			{wife > 0 && <g opacity={wife} transform={`translate(${lerp(240, 150, wife)},20)`}><Rimmed x={gx} ground={gy + 40} h={hh * 0.94} pose={fkPose({hip: 0.655, lean: -10, neck: -12, lt: 2, lk: 2, rt: -3, rk: 3, la: 4, le: 8, ra: 40, re: 30})} look={{dress: 'dress', head: 'bun'}} flip col="#3a2a24" rimOp={0} /></g>}
			<Rimmed x={gx} ground={gy} h={hh} pose={pose} look={{dress: 'jacket', head: sit.head, build: sit.build}} col="#21170f" rim="#fff0d0" rimOp={0.35} />
			{sit.collar && <path d={`M${nk[0] + 30},${nk[1] + 20} L${sp[0] + 70},${sp[1] - 60} L${nk[0] + 52},${nk[1] + 64} Z`} fill="#e8e0d0" opacity={0.9} />}
			{sit.collar && <path d={`M${nk[0] + 46},${nk[1] + 44} L${sp[0] + 66},${sp[1] - 40} L${sp[0] + 58},${sp[1] + 30} Z`} fill="#3a2a22" />}
			<rect x={-PW2 / 2} y={-PH2 / 2} width={PW2} height={PH2} fill="#3a2410" opacity={0.08 + 0.1 * (1 - tone)} />
		</g>
	</g>;
};
const FLASH_T = [0, 0.283, 0.566, 0.849, 1.132];   // 8th notes from the downbeat at 2.267
const AGE_T = [1.70, 1.98, 2.27, 2.55];
const Folder: React.FC<{x: number; y: number; i: number}> = ({x, y, i}) => <g transform={`translate(${x},${y}) rotate(${(rnd(i, 3) - 0.5) * 5})`}>
	<rect x={-230} y={-12} width={460} height={26} rx={3} fill={i % 2 ? '#c9a466' : '#d4b074'} stroke="#8a6a3a" strokeWidth={1.5} />
	<rect x={-200 + (i % 4) * 90} y={-24} width={90} height={16} rx={3} fill={i % 2 ? '#c9a466' : '#d4b074'} stroke="#8a6a3a" strokeWidth={1.5} />
	<text x={-155 + (i % 4) * 90} y={-12} textAnchor="middle" style={{fontFamily: MONO, fontSize: 11}} fill="#4a3418">No.{String(Math.round(1 + i * 90.3)).padStart(4, '0')}</text>
</g>;
export const Harvard: React.FC<{t: number}> = ({t}) => {
	const tau = t - T.harvard, cur = FLASH_T.filter((a) => tau >= a).length - 1;
	const flash = Math.max(0, ...FLASH_T.map((a) => (tau >= a ? Math.exp(-(tau - a) / 0.07) : 0)), ...AGE_T.map((a) => (tau >= a ? 0.6 * Math.exp(-(tau - a) / 0.05) : 0)));
	const count = Math.round(724 * easeOut(seg(t, 2.3, 3.0))), pop = Math.exp(-((t - 3.0) ** 2) / 0.01);
	const files = seg(tau, 1.13, 1.7), ageIdx = AGE_T.filter((a) => tau >= a).length - 1, year = Math.round(lerp(1938, 2026, easeOut(seg(t, 3.97, 5.1))));
	const dark = sm(seg(t, 6.15, 6.9)), push = lerp(1, 1.08, seg(tau, 0, 5)), wife = sm(seg(t, 5.25, 5.9));
	const portraitOut = easeIn(seg(tau, 1.13, 1.45));
	return <g>
		<defs><radialGradient id="hvBg" cx="0.5" cy="0.45" r="0.7"><stop offset="0" stopColor="#3a2a1e" /><stop offset="1" stopColor="#0c0806" /></radialGradient></defs>
		<rect width={W} height={H} fill="url(#hvBg)" />
		<g transform={`translate(${W / 2},${H / 2}) scale(${push}) translate(${-W / 2},${-H / 2})`}>
			{/* earlier sitters pinned around: a wall of portraits growing */}
			{FLASH_T.map((a, k) => k < cur && tau < 1.75 && <Portrait key={k} id={`pw${k}`} cx={[470, 1450, 330, 1600, 760][k]} cy={[330, 300, 720, 700, 220][k]} s={0.5} rot={[-6, 5, 4, -5, 2][k]} sit={YOUNG[k]} op={0.75 * (1 - files)} />)}
			{/* the sitter now: each flash a new young man */}
			{tau < 1.45 && cur >= 0 && <Portrait id="pnow" cx={960} cy={lerp(470, 1300, portraitOut)} s={lerp(1.02, 1, seg(tau, FLASH_T[cur], FLASH_T[cur] + 0.2))} sit={YOUNG[cur]} />}
			{/* the files thicken */}
			{tau > 1.1 && tau < 1.85 && <g opacity={1 - seg(tau, 1.7, 1.85)}>{Array.from({length: 14}, (_, i) => { const at = 1.13 + i * 0.04, u = easeOut(seg(tau, at, at + 0.12)); return u > 0 && <Folder key={i} i={i} x={960} y={lerp(-80, 900 - i * 24, u)} />; })}</g>}
			{/* one face across eight decades */}
			{tau >= 1.7 && <Portrait id="page" cx={960} cy={470} s={lerp(0.95, 1.05, seg(tau, 1.7, 3.9))} sit={AGES[Math.max(0, ageIdx)]} tone={sm(seg(tau, 2.3, 3.0))} wife={wife} />}
		</g>
		{/* the flashbulb: a pop of warm light from the camera at top right */}
		<Glow x={1500} y={150} r={900} c="#fff2d8" o={0.85 * flash} id="hvFl" />
		<rect width={W} height={H} fill="#fff6e6" opacity={0.35 * flash} />
		{/* the numbers */}
		<g opacity={1 - dark}>
			{t < 3.97 ? <g><text x={W - 90} y={190} textAnchor="end" style={{fontFamily: SANS, fontWeight: 900, fontSize: 120 * (1 + 0.1 * pop)}} fill="#ffd27a" stroke="rgba(0,0,0,0.55)" strokeWidth={6} paintOrder="stroke">{count}<tspan style={{fontSize: 48}} fill="#fff">人</tspan></text>
				<text x={W - 92} y={250} textAnchor="end" style={{fontFamily: MONO, fontWeight: 700, fontSize: 44}} fill="#f4ead2" stroke="rgba(0,0,0,0.5)" strokeWidth={4} paintOrder="stroke">1938</text></g>
				: <text x={W - 70} y={140} textAnchor="end" style={{fontFamily: MONO, fontWeight: 700, fontSize: 78}} fill="#f4ead2" stroke="rgba(0,0,0,0.55)" strokeWidth={6} paintOrder="stroke">1938 → {year}</text>}
		</g>
		<rect width={W} height={H} fill="#000" opacity={dark} />
	</g>;
};

/* ---------------- 7.3–9.06 the tablet emerges from the dark; the hard push lands on the HIT ---------------- */
const TB = {x: 560, y: 150, w: 800, h: 760, row: 7, rows: 14};
const ROW_Y = TB.y + 36 + TB.row * ((TB.h - 60) / TB.rows), ROW_X = TB.x + 30 + (TB.w - 60) / 4;
export const tabletCam = (t: number) => { const slow = ease(seg(t, T.tablet, 8.6)), hard = easeIn(seg(t, 8.55, T.hit));
	return {z: lerp(0.96, 1.18, slow) * lerp(1, 2.4, hard), L: [lerp(960, ROW_X, slow * 0.4 + hard * 0.6), lerp(530, ROW_Y, slow * 0.3 + hard * 0.7)] as P2}; };
const TabletScene: React.FC<{t: number; z: number; L: P2; blur?: number}> = ({t, z, L, blur = 0}) => {
	const lit = sm(seg(t, T.tablet, 7.9)), sweep = seg(t, 7.6, 9.0);
	return <g>
		<rect width={W} height={H} fill="#070403" />
		<g style={blur > 0.5 ? {filter: `blur(${blur * 0.4}px)`} : undefined}>
			<LookCam z={z} L={L} S={[960, 540]}>
				<Glow x={960} y={520} r={820} c="#ff9e4a" o={0.35 * lit} id="tbW" />
				<g opacity={lit}><Tablet x={TB.x} y={TB.y} w={TB.w} h={TB.h} seed={5} rows={TB.rows} glowRow={TB.row} /></g>
				<Glow x={lerp(TB.x + 50, TB.x + TB.w / 2 - 20, sweep)} y={ROW_Y} r={90} c="#ffe2a0" o={0.6 * lit * (sweep > 0 && sweep < 1 ? 1 : 0.4)} id="tbSw" />
			</LookCam>
		</g>
		<rect width={W} height={H} fill="#000" opacity={1 - lit} />
	</g>;
};
export const TabletShot: React.FC<{t: number}> = ({t}) => { const c = tabletCam(t); return <TabletScene t={t} z={c.z} L={c.L} />; };

/* ---------------- 9.06–11.891 the wedges blur into a backwards time-rush ---------------- */
const yearAt2 = (u: number) => { const keys: [number, number][] = [[0, 2026], [0.12, 1938], [0.25, 1888], [0.42, 170], [0.58, -399], [0.68, -500], [0.82, -1800], [0.9, -1850], [1, -1850]];
	let i = 0; while (i < keys.length - 2 && u > keys[i + 1][0]) i++; const [a, ya] = keys[i], [b, yb] = keys[i + 1], y = Math.round(lerp(ya, yb, cl((u - a) / (b - a))));
	return y > 0 ? `${y}` : `公元前 ${-y}`; };
export const Rush: React.FC<{t: number}> = ({t}) => {
	const tau = t - T.hit, c = tabletCam(T.hit - 0.001), punch = (k: number) => Math.exp(-((t - beatAt(k)) ** 2) / 0.003);
	const P = [15, 16, 17, 18, 19].reduce((s, k) => s + punch(k), 0);
	const zt = c.z * lerp(1, 3.2, easeOut(seg(tau, 0, 0.5))), tabOp = 1 - sm(seg(tau, 0.35, 0.8));
	const speed = lerp(1, 0.25, seg(tau, 1.6, 2.83)), toPap = sm(seg(tau, 2.1, 2.7));
	const streakCol = (i: number) => (toPap > 0.5 ? (i % 2 ? '#e8d4a4' : '#c9ab74') : (i % 3 ? '#ffb45a' : '#fff0c8'));
	return <g>
		<rect width={W} height={H} fill="#0a0604" />
		<g opacity={tabOp}><TabletScene t={T.hit} z={zt} L={c.L} blur={30 * seg(tau, 0, 0.6)} /></g>
		<defs><filter id="rsBl" x="-20%" y="-10%" width="140%" height="120%"><feGaussianBlur stdDeviation={`${lerp(26, 6, seg(tau, 1.8, 2.8))} 0`} /></filter>
			<radialGradient id="rsV" cx="0.5" cy="0.5" r="0.6"><stop offset="0.2" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.8" /></radialGradient></defs>
		<g opacity={sm(seg(tau, 0.15, 0.5))}>
			{/* streaks rushing to the right: we travel left, back in time */}
			<g filter="url(#rsBl)">{Array.from({length: 60}, (_, i) => { const y = 540 + (rnd(i, 1) - 0.5) * 1100, len = 200 + 500 * rnd(i, 2), x = ((rnd(i, 3) * 2600 + tau * 5200 * speed * (0.6 + rnd(i, 4))) % 2800) - 500;
				return <rect key={i} x={x} y={y} width={len} height={2 + 5 * rnd(i, 5)} fill={streakCol(i)} opacity={0.25 + 0.45 * rnd(i, 6)} />; })}</g>
			{/* era materials whip past: glass, 1938 forms, letters, scrolls, slips, clay, papyrus */}
			<g filter="url(#rsBl)">{MATS.map((m, k) => { const at = 0.25 + k * 0.17, u = seg(tau, at, at + 0.42); if (u <= 0 || u >= 1) return null;
				const x = lerp(-700, 2100, u), y = 540 + (k % 2 ? -1 : 1) * (120 + 60 * rnd(k, 9)), s = 2.4;
				return <g key={k} transform={`translate(${x},${y}) scale(${s}) translate(${-(PHX)},${-PHY})`}><MatCard y={PHY - 56} m={m} i={k} /></g>; })}</g>
			<rect width={W} height={H} fill="url(#rsV)" />
		</g>
		{/* the papyrus surface arrives */}
		<g opacity={toPap * 0.9}><rect width={W} height={H} fill="#d7bd88" />{Array.from({length: 150}, (_, i) => <rect key={i} x={0} y={i * 7.2} width={W} height={2 + 3 * rnd(i, 2)} fill={rnd(i, 1) > 0.5 ? '#f2dcaa' : '#a88a58'} opacity={0.14 + 0.12 * rnd(i, 3)} />)}</g>
		<g opacity={1 - sm(seg(tau, 2.45, 2.8))}>
			<text x={96} y={150} style={{fontFamily: MONO, fontWeight: 700, fontSize: 64 * (1 + 0.14 * P)}} fill="#f4ead2" stroke="rgba(0,0,0,0.55)" strokeWidth={6} paintOrder="stroke">◀◀</text>
			<text x={W - 90} y={150} textAnchor="end" style={{fontFamily: SANS, fontWeight: 700, fontSize: 76 * (1 + 0.05 * P), letterSpacing: '0.04em'}} fill="#f4ead2" stroke="rgba(0,0,0,0.55)" strokeWidth={6} paintOrder="stroke">{yearAt2(cl(tau / 2.5))}</text>
		</g>
	</g>;
};

/* ---------------- 11.891–25.48 Egypt: the title inks itself on the scribe's papyrus; pull back to the Nile ---------------- */
const L1 = '人活着为了什么？', L2 = '人类问了近四千年';
const L1S = 116, L1A = 116 * 1.08, L1X = W / 2 + 37 - (L1A * 8) / 2, L2S = 100, L2A = 108, L2X = W / 2 + 6 - (L2A * 8) / 2;
const ZC = 18.5;
const scribeFK2 = (te: number): FKA => {
	const w = {...SC_WRITE, re: SC_WRITE.re + 4 * Math.sin(te * 11) + 2 * Math.sin(te * 4.3), ra: SC_WRITE.ra + 2 * Math.sin(te * 2.1)};
	if (te < 16.25) return w;
	if (te < T.e3) { const k = sm(seg(te, 16.25, 16.8)), bt = (te - beatAt(27)) / (2 * BEAT), alt = 0.5 - 0.5 * Math.cos(Math.PI * bt);
		return mixF(w, mixF(SC_ARGA, SC_ARGB, sm(alt)), k * (1 - sm(seg(te, T.e3 - 0.35, T.e3)))); }
	if (te < T.stop) return w;
	return mixF(w, {...SC_LOOK, lean: SC_LOOK.lean + 0.5 * Math.sin(te * 1.7)}, sm(seg(te, T.stop, T.stop + 0.7)));
};
export const Egypt2: React.FC<{t: number}> = ({t}) => {
	const tau = t - T.egypt, x = 640, g = 905, h = 640, fk = scribeFK2(t), pose = fkPose(fk);
	const rh = jointAt(pose, 'RHand', x, g, h), kn = jointAt(pose, 'LKnee', x, g, h), hp = jointAt(pose, 'Hips', x, g, h);
	const py = g - 0.11 * h, rollL = 700, rollR = 1010, CX = 940, CY = py - 2;
	const writing = t < 16.25 || (t > T.e3 && t < T.stop);
	const penX = rh[0] + 20, written = rollR - 14 - penX;
	// camera: hold close on the title, then pull back (log-eased) to the wide shot; a slow drift east at the end
	const hold = seg(tau, 0, 2.9), pull = ease(seg(tau, 2.9, 4.95)), lz = lerp(Math.log(ZC * lerp(1, 0.93, hold)), 0, pull);
	const drift = sm(seg(t, T.stop, T.end)), z = Math.exp(lz) * lerp(1, 1.03, drift);
	// keep the papyrus in view while pulling back: it travels from frame centre to its place in the wide shot as the zoom falls
	const z0 = ZC * 0.93, zp = Math.exp(lz), u = cl((z0 - zp) / (z0 - 1)), sp: P2 = [lerp(960, CX, u), lerp(540, CY, u)];
	const L: P2 = [CX - (sp[0] - 960) / zp + 40 * drift, CY - (sp[1] - 540) / zp];
	const titleOp = 1 - sm(seg(tau, 3.4, 4.3));
	const baIn = sm(seg(t, 16.2, 16.8)), bt = (t - beatAt(27)) / BEAT;
	const wing = (t < T.e3 - 0.2 ? 55 + 45 * Math.abs(Math.sin(Math.PI * bt * 0.5)) : lerp(60, 8, sm(seg(t, T.e3 - 0.2, T.e3 + 0.6)))) * baIn, baTilt = t < T.e3 - 0.2 ? 5 * Math.sin(Math.PI * bt * 0.5) : 0;
	return <g>
		<LookCam z={z} L={L} S={[960, 540]}>
			<Plate k="nile" />
			<Water t={t} />
			<Glow x={760} y={430} r={700} c="#ffb27a" o={0.18} id="egSun2" />
			<Birds t={t} />
			<Greed te={t} k0={35} />
			<path d="M0,860 Q500,840 1100,870 Q1500,890 1920,900 L1920,1080 L0,1080 Z" fill="#6e5440" opacity={0.92} />
			<path d="M0,880 Q600,872 1920,915" stroke="#a88660" strokeWidth={3} fill="none" opacity={0.5} />
			<Reeds t={t} />
			<Palm x={110} y={900} s={1.05} t={t} />
			<Rimmed x={x} ground={g} h={h} pose={pose} look={LK.scribe} col="#120c0c" rim="#ffd2a0" rimOp={0.5} />
			<path d={`M${hp[0] - 60},${hp[1] - 40} L${hp[0] + 40},${hp[1] - 44} Q${kn[0] + 30},${kn[1] - 30} ${kn[0] + 40},${kn[1] + 8} L${hp[0] - 70},${g - 6} Z`} fill="#120c0c" />
			{/* the roll in his lap, with real fibres (they hold up in the close-up) */}
			<g>
				<rect x={rollL} y={py - 31} width={rollR - rollL} height={62} fill="#dcc391" />
				{Array.from({length: 138}, (_, i) => <rect key={i} x={rollL} y={py - 31 + i * 0.45} width={rollR - rollL} height={0.12 + 0.2 * rnd(i, 2)} fill={rnd(i, 1) > 0.5 ? '#f2dcaa' : '#a88a58'} opacity={0.2 + 0.15 * rnd(i, 3)} />)}
				{Array.from({length: 120}, (_, i) => <rect key={i} x={rollL + i * 2.6 + rnd(i, 7)} y={py - 31} width={0.1 + 0.15 * rnd(i, 5)} height={62} fill={rnd(i, 4) > 0.5 ? '#f0d8a4' : '#9c7e4e'} opacity={0.12} />)}
				<Blur id="egPapB" s={0.8}>{Array.from({length: 10}, (_, i) => <ellipse key={i} cx={rollL + rnd(i, 7) * 310} cy={py - 25 + rnd(i, 8) * 50} rx={6 + 10 * rnd(i, 9)} ry={3 + 5 * rnd(i, 10)} fill="#8a6a3a" opacity={0.12} />)}</Blur>
				<g opacity={1 - titleOp}><Hieratic x={penX + 6} y={py - 26} w={Math.max(0, written)} h={54} cols={Math.max(1, Math.round(written / 13))} seed={3} /></g>
				<rect x={rollL - 14} y={py - 34} width={26} height={70} rx={12} fill="#cdb47c" stroke="#8a7042" strokeWidth={1.5} />
				<rect x={rollR - 12} y={py - 34} width={26} height={70} rx={12} fill="#cdb47c" stroke="#8a7042" strokeWidth={1.5} />
			</g>
			{/* the title: ink blooms on the fibres, then the characters resolve; the second line in gold */}
			{titleOp > 0 && <g opacity={titleOp} transform={`translate(${CX},${CY}) scale(${1 / ZC}) translate(${-W / 2},${-H / 2})`}>
				<defs><linearGradient id="ttGoldD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe9a8" /><stop offset="0.55" stopColor="#f2c25a" /><stop offset="1" stopColor="#c98a24" /></linearGradient></defs>
				{L1.split('').map((ch, i) => { const a = 0.05 + i * 0.12, b = seg(tau, a - 0.12, a + 0.25);
					return <g key={i}>{b > 0 && b < 1 && <Blur id={`ib1_${i}`} s={10}><circle cx={L1X + i * L1A + L1S / 2} cy={455} r={lerp(8, 70, easeOut(b))} fill="#1c1209" opacity={0.5 * Math.sin(Math.PI * b)} /></Blur>}
						<InkChar id={`ec1_${i}`} ch={ch} x={L1X + i * L1A} y={500} s={L1S} u={seg(tau, a, a + 0.22)} /></g>; })}
				<path d="M640,548 Q960,560 1290,544" stroke="#1c1209" strokeWidth={3} fill="none" opacity={0.5} strokeDasharray={660} strokeDashoffset={660 * (1 - ease(seg(tau, 1.0, 1.5)))} />
				<Glow x={W / 2} y={640} r={520} c="#ffcf6a" o={0.3 * sm(seg(tau, 1.2, 2.2))} id="egTtGl" />
				{L2.split('').map((ch, i) => <InkChar key={i} id={`ec2_${i}`} ch={ch} x={L2X + i * L2A} y={680} s={L2S} u={seg(tau, 1.0 + i * 0.13, 1.0 + i * 0.13 + 0.24)} gold />)}
			</g>}
			{/* the right hand holds the rush pen */}
			<path d={`M${rh[0] + 2},${rh[1] - 6} L${writing ? rh[0] + 22 : rh[0] + 34},${writing ? py - 4 + 8 * Math.sin(t * 11) : rh[1] - 34}`} stroke="#2a1c10" strokeWidth={3} strokeLinecap="round" />
			<g transform={`translate(${x + 230},${g - 6}) rotate(-6)`}><rect x={-80} y={-14} width={170} height={16} rx={3} fill="#7a5532" stroke="#3a2614" strokeWidth={1.5} />
				<circle cx={-62} cy={-6} r={6} fill="#141010" /><circle cx={-44} cy={-6} r={6} fill="#8c2a1c" /><rect x={-28} y={-9} width={108} height={5} rx={2} fill="#3a2614" /><path d="M-20,-7 L76,-7" stroke="#c9a46a" strokeWidth={1.4} /></g>
			<g transform={`translate(${x - 170},${g - 4})`}><path d="M-22,0 Q-30,-30 -12,-46 L12,-46 Q30,-30 22,0 Z" fill="#5a3a24" /><rect x={-14} y={-52} width={28} height={8} rx={3} fill="#4a2e1c" /></g>
			{/* the Ba gathers out of the written columns and stands on the stone beside him */}
			<path d="M960,912 Q980,872 1060,868 Q1140,870 1150,912 Z" fill="#3a2c24" />
			{t > 16.0 && t < 17.0 && Array.from({length: 18}, (_, i) => { const u = cl((t - 16.0 - i * 0.025) / 0.6), sx = 880 + rnd(i, 81) * 110, sy = py - 10, ex = 1050 + (rnd(i, 82) - 0.5) * 80, ey = 760 + rnd(i, 83) * 100;
				return u > 0 && u < 1 && <circle key={i} cx={lerp(sx, ex, u)} cy={lerp(sy, ey, u) - 60 * Math.sin(Math.PI * u)} r={2 + 2 * rnd(i, 84)} fill="#ffe2a0" opacity={0.9 * Math.sin(Math.PI * u)} />; })}
			{baIn > 0 && <><Glow x={1055} y={720} r={260} c="#ffd27a" o={0.35 * baIn} id="ba2G2" /><Ba2 x={1055} y={874} s={1.3 * lerp(0.92, 1, baIn)} flip wing={wing} op={baIn} tilt={baTilt} /></>}
		</LookCam>
	</g>;
};
void SERIF;
