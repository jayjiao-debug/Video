import React from 'react';
import {W, H, rnd, lerp, Glow, Rimmed, fkPose, Look4, Pose, B, jointAt, Sky, HeadGlow} from './kit44';
import {Cam, seg, ease, eo, ei, sm, Compass44} from './demo44';
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
export const RStamp: React.FC<{x: number; y: number; s: string; k: number; grey?: boolean; rot?: number; size?: number; o?: number}> = ({x, y, s, k, grey, rot = -8, size = 44, o = 1}) => {
	if (k <= 0) return null;
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
export const kidHeadScreen = (tm: number): P2 => { const c = homeCam(tm), h = headC(kidP, KX + 1080, 904, 430, true); return scr(h, c.cx, c.cy, c.z); };

/* ---------- K2 compass close-up (copied from demo44 Needle) ---------- */
const rotAt = (t: number) => 38 * ease(seg(t, 21.7, 22.4)) - 70 * ease(seg(t, 22.7, 23.4)) + 22 * ease(seg(t, 23.6, 24.1));
const pol = (deg: number, R: number): P2 => [Math.cos(deg * Math.PI / 180) * R, Math.sin(deg * Math.PI / 180) * R];
const SKIN = '#1b1311', EDGE = '#5a463c', NAIL = '#4e3e36';
const finger = (R0: number, R1: number, a0: number, a1: number, w0: number, w1: number) => { const L: P2[] = [], Rr: P2[] = [], n = 10;
	for (let i = 0; i <= n; i++) { const k = i / n, a = lerp(a0, a1, k), R = lerp(R0, R1, k), w = lerp(w0, w1, k) / 2, c = pol(a, R), nx = Math.cos(a * Math.PI / 180), ny = Math.sin(a * Math.PI / 180); L.push([c[0] + nx * w, c[1] + ny * w]); Rr.push([c[0] - nx * w, c[1] - ny * w]); }
	const f = (p: P2) => `${p[0].toFixed(4)},${p[1].toFixed(4)}`;
	return {d: `M${L.map(f).join(' L')} L${Rr.reverse().map(f).join(' L')} Z`, tip: pol(a1, R1), at: (k: number) => ({c: pol(lerp(a0, a1, k), lerp(R0, R1, k)), a: lerp(a0, a1, k), w: lerp(w0, w1, k)})}; };
const THUMB = finger(1.16, 0.88, 108, 148, 0.21, 0.15);
const Finger: React.FC<{F: ReturnType<typeof finger>; s: number}> = ({F, s}) => { const t = F.at(1);
	return <g><path d={F.d} fill={SKIN} stroke={EDGE} strokeWidth={2.2 / s} strokeLinejoin="round" /><circle cx={F.tip[0]} cy={F.tip[1]} r={t.w / 2} fill={SKIN} />
		<path d={(() => { const q = F.at(1), c = q.c, n = [Math.cos((q.a + 90) * Math.PI / 180), Math.sin((q.a + 90) * Math.PI / 180)]; return `M${c[0] + n[0] * q.w * 0.5 - Math.cos(q.a * Math.PI / 180) * q.w * 0.5},${c[1] + n[1] * q.w * 0.5 - Math.sin(q.a * Math.PI / 180) * q.w * 0.5} A${q.w / 2},${q.w / 2} 0 0 1 ${c[0] + n[0] * q.w * 0.5 + Math.cos(q.a * Math.PI / 180) * q.w * 0.5},${c[1] + n[1] * q.w * 0.5 + Math.sin(q.a * Math.PI / 180) * q.w * 0.5}`; })()} stroke={EDGE} strokeWidth={2.2 / s} fill="none" />
		{[0.42, 0.74].map((k) => { const q = F.at(k), nx = Math.cos(q.a * Math.PI / 180), ny = Math.sin(q.a * Math.PI / 180); return <line key={k} x1={q.c[0] + nx * q.w * 0.42} y1={q.c[1] + ny * q.w * 0.42} x2={q.c[0] - nx * q.w * 0.42} y2={q.c[1] - ny * q.w * 0.42} stroke={EDGE} strokeWidth={1.6 / s} opacity={0.75} />; })}</g>; };
const HAND_D = (() => { const f = (p: P2) => `${p[0].toFixed(4)},${p[1].toFixed(4)}`, out: string[] = [];
	out.push('M-1.42,2.6', 'C-1.5,2.05 -1.62,1.55 ' + f(pol(140, 1.5)));
	for (let i = 0; i <= 24; i++) { const k = i / 24, a = lerp(140, 176, k), R = 1.46 + 0.035 * Math.abs(Math.sin(k * Math.PI * 3.6)) - 0.12 * k * k; out.push('L' + f(pol(a, R))); }
	out.push('Q' + f(pol(184, 1.24)) + ' ' + f(pol(181, 1.1)));
	for (let i = 0; i <= 12; i++) out.push('L' + f(pol(lerp(181, 124, i / 12), 1.08)));
	out.push('Q-0.35,1.16 -0.06,1.12', 'Q-0.02,1.4 -0.3,1.62', 'C-0.6,1.85 -0.82,2.2 -0.88,2.6 Z');
	return out.join(' '); })();
const HandBack: React.FC<{m: number; r: number}> = ({m, r}) => <g transform={`scale(${m * r},${r})`}>
	<path d={HAND_D} fill={SKIN} /><path d={HAND_D} fill="none" stroke={RIMB} strokeWidth={2.4 / r} opacity={0.4} />
	{[150, 160, 169].map((a) => { const p0 = pol(a + 1, 1.1), p1 = pol(a + 3, 1.3); return <path key={a} d={`M${p0[0]},${p0[1]} Q${pol(a + 2.5, 1.2)[0]},${pol(a + 2.5, 1.2)[1]} ${p1[0]},${p1[1]}`} stroke={EDGE} strokeWidth={2.4 / r} fill="none" opacity={0.85} />; })}</g>;
const HandThumb: React.FC<{m: number; r: number}> = ({m, r}) => { const q = THUMB.at(0.93);
	return <g transform={`scale(${m * r},${r})`}><Finger F={THUMB} s={r} />
		<ellipse cx={q.c[0]} cy={q.c[1]} rx={q.w * 0.3} ry={q.w * 0.22} fill={NAIL} transform={`rotate(${q.a + 90} ${q.c[0]} ${q.c[1]})`} />
		<path d={(() => { const a = THUMB.at(0.1).c, b = THUMB.at(0.6).c; return `M${a[0]},${a[1]} Q${(a[0] + b[0]) / 2 - 0.05},${(a[1] + b[1]) / 2 - 0.05} ${b[0]},${b[1]}`; })()} stroke={RIMB} strokeWidth={2 / r} fill="none" opacity={0.45} transform="translate(-0.06,-0.04)" /></g>; };

/** the ending on K2's exact shot. ft = film time; F2 starts at 142.0 = demo 21.5 (the 22 s frame).
    Changes from the demo: no push into the needle tip; F3 the boy looks up (他 line: the glow dims a little);
    F4 the glow rises to its brightest; Q the picture dims under the centred question and fades out by 160.5. */
export const NeedleEnd: React.FC<{t: number}> = ({t: ft}) => {
	const u = ft - 142.0, t = 21.5 + u, rot = rotAt(t), north = -8, needle = north + 0.85 * (rot - rotAt(t - 0.22)) + 6 * Math.sin(t * 9) * Math.exp(-((t - 23.45) ** 2) / 0.1);
	const dim = sm(seg(ft, 145.5, 146.0)) * (1 - sm(seg(ft, 149.0, 149.5))), bright = sm(seg(ft, 149.05, 150.3));
	const flare = (0.55 + 0.45 * sm(seg(u, 0, 0.5)) + 0.1 * Math.sin(t * 4)) * (1 - 0.4 * dim) + 0.45 * bright;
	const C: P2 = [1060, 600], r = 170;
	const tip: P2 = [C[0] + Math.sin(needle * Math.PI / 180) * r * 0.72, C[1] - Math.cos(needle * Math.PI / 180) * r * 0.72];
	const intro = eo(seg(u, 0, 0.5)), fl = seg(t, 23.7, 24.6), look = ease(seg(ft, 145.6, 146.7)), frame = ease(seg(ft, 145.2, 146.9));
	let cx = lerp(C[0] - 120, 1000, intro), cy = lerp(C[1] - 60, 560, intro), z = lerp(1.7, 1.06, intro) + 0.02 * Math.min(u, 3.3);
	const kp = fkPose({hip: 0.36, lean: lerp(16, 7, look), neck: lerp(34, -6, look), lt: 88, lk: 92, rt: 84, rk: 88, la: 52, le: 76, ra: 48, re: 80}), ph = placeHead(kp, 470, 250, 1500, false), hc = headC(kp, ph.x, ph.ground, 1500);
	const z2 = 0.9 + 0.006 * Math.max(0, ft - 147); cx = lerp(cx, hc[0] + 260 / z2 + 8 * Math.max(0, ft - 147), frame); cy = lerp(cy, hc[1] + 100 / z2, frame); z = lerp(z, z2, frame);
	const qDim = sm(seg(ft, 152.6, 153.6)), out = sm(seg(ft, 157.5, 159.5));
	return <g>
		<Sky id="bk2s" stops={[[0, '#4a3a30'], [0.7, '#3a2c24'], [1, '#2a201a']]} />
		<Cam cx={cx} cy={cy} z={z}>
			<Wallpaper id="bk2w" x={-300} y={-300} w={2600} h={1100} col="#5e4a3c" o={0.45} s={2.2} />
			<rect x={-300} y={800} width={2600} height={600} fill="#2e221b" /><rect x={-300} y={792} width={2600} height={14} fill="#241a14" />
			<Frame x={1480} y={-60} w={380} h={300} col="#241a14" /><Curtain x={-120} y={-200} w={300} h={1300} />
			<Glow x={1900} y={700} r={520} c="#ffcf9a" o={0.14} id="bk2st" />
			<Glow x={260} y={760} r={600} c="#ffd28a" o={0.16} id="bk2l" />
			<Motes t={t} x={300} y={100} w={1500} h={800} n={26} o={0.35} />
			{Array.from({length: 7}, (_, i) => <circle key={i} cx={1500 + rnd(i, 3) * 400} cy={200 + rnd(i, 4) * 400} r={30 + 40 * rnd(i, 5)} fill="#ffe2b0" opacity={0.04 + 0.04 * rnd(i, 6)} />)}
			<defs><clipPath id="bk2k"><rect x={-400} y={-400} width={1180} height={2000} /></clipPath></defs><g clipPath="url(#bk2k)"><Rimmed x={ph.x} ground={ph.ground} h={1500} pose={kp} look={LKB.child} col="#130e0d" rim={RIMB} rimOp={0.5 + 0.25 * bright} /></g>
			<Glow x={hc[0]} y={hc[1]} r={420} c={B.mid} o={0.3 * bright} id="bk2hb" />
			<HeadGlow x={hc[0]} y={hc[1]} r={60 + 22 * bright} id="bk2h" o={Math.min(1, flare)} />
			{fl > 0 && <g opacity={fl * 0.8 * (1 - 0.5 * frame)}>{Array.from({length: 7}, (_, i) => { const s = (i - 3) * 0.32, L = 900;
				return <path key={i} d={`M${tip[0]},${tip[1]} C${tip[0] + Math.sin(s) * 300},${tip[1] - 300} ${tip[0] + Math.sin(s) * L},${tip[1] - 200 - 300 * Math.cos(s)} ${tip[0] + Math.sin(s) * L * 1.4},${tip[1] + 200}`} stroke={B.core} strokeWidth={2} fill="none" strokeDasharray="14 12" strokeDashoffset={-t * 60} opacity={0.6 - Math.abs(i - 3) * 0.12} />; })}</g>}
			<Glow x={C[0]} y={C[1]} r={r * 3.4} c={B.mid} o={0.5 * Math.min(1.2, flare)} id="bk2cg" />
			<g transform={`translate(${C[0]},${C[1]}) rotate(${rot * 0.9})`}><HandBack m={1} r={r} /><HandBack m={-1} r={r} /></g>
			<Compass44 x={C[0]} y={C[1]} r={r} a={needle} rot={rot} glow={Math.min(1, flare)} id="bk2c" halo={false} />
			<g transform={`translate(${C[0]},${C[1]}) rotate(${rot * 0.9})`}><HandThumb m={1} r={r} /><HandThumb m={-1} r={r} /></g>
			<Glow x={tip[0]} y={tip[1]} r={60} c={B.core} o={0.6 * Math.min(1, flare)} id="bk2t" />
		</Cam>
		{/* Q: the picture dims under the centred question (nothing gets brighter after this); the master does the last fade */}
		<rect width={W} height={H} fill="#07090a" opacity={0.42 * qDim + 0.3 * out} />
	</g>;
};
void ei; void H;
