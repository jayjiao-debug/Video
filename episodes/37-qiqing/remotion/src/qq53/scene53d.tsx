import React from 'react';
import {W, H, rnd, lerp, cl, seg} from '../qq50/kit50';
import {B, Pool} from '../qq50/styleB';
import {Cam, V3, P2, proj, poly, mix, lookAt, blobOn} from './parts53';
import {bladeOutline} from './parts53';
import {Sword3D, SwordPose} from './sword3d';
import {RingDisc} from './props53';
import {Glint} from './kfA53';
import {spline, sstep} from './cam53';
/* ep53 · TakeD, the camera of legs 14–17 and the museum: the same metric world as world53d (metres; the cut plane y = 0; z = 0 is
   the ground AND the museum floor). One camera, a pure function of time: C1 Hermite channels through the poses below.
   The museum case stands on the floor directly above the tomb (CASE_X): the way up from the sword's grave ends under its own
   showcase. */
export const CASE_X = -0.55;
type Pose = [number, number, number, number, number, number, number, number, number, number];   // t, P(3), T(3), f, cx, cy
export const POSES: Pose[] = [
	[80.3, -0.14, -0.12, -10.20, -0.42, 0.15, -10.47, 1380, 960, 540],
	[81.954, -0.16, -0.13, -10.18, -0.42, 0.15, -10.47, 1380, 960, 540],
	[83.0, -0.50, -0.20, -9.30, -0.55, 0.16, -10.46, 1380, 960, 560],
	[84.219, -0.55, -0.10, -8.20, -0.55, 0.20, -10.46, 1380, 960, 580],
	[86.483, -0.25, -0.95, -6.90, -0.25, 0.45, -10.30, 1000, 960, 560],
	[88.5, -0.55, -2.30, -7.20, -0.40, 0.50, -10.20, 1100, 960, 580],
	[90.445, -0.90, -4.20, -8.10, -1.05, 0.50, -9.80, 1380, 960, 600],
	[93.5, -1.0, -6.0, -6.9, -1.25, 0.6, -9.45, 1380, 960, 622],
	[94.2, -1.0, -6.9, -5.4, -1.1, 0.0, -8.2, 1200, 960, 580],
	[94.9, -0.98, -7.8, -2.7, -0.9, 0.0, -5.0, 1000, 960, 560],
	[95.54, -0.95, -8.4, 0.0, -0.8, 0.0, -1.0, 900, 960, 540],
	[96.4, -0.9, -4.9, 0.55, -0.55, 0.0, 0.8, 1000, 960, 560],
	[97.4, -0.8, -3.0, 0.85, -0.55, 0.0, 0.95, 1050, 960, 560],
	[98.6, -0.68, -1.8, 1.0, -0.55, 0.0, 1.0, 1150, 960, 560],
	[99.8, -0.62, -1.3, 1.07, -0.58, 0.0, 1.0, 1250, 960, 550],
	[100.9, -0.62, -0.62, 1.08, -0.65, 0.0, 1.0, 1300, 960, 540],
	[101.6, -0.62, -0.30, 1.08, -0.72, 0.0, 1.0, 1350, 960, 540],
	[102.332, -0.6, -0.10, 1.08, -0.78, 0.0, 1.0, 1380, 960, 540],
	[104.6, -0.58, -0.75, 1.30, -0.55, 0.0, 0.98, 1500, 960, 640],
	[106.861, CASE_X, -1.3, 1.8, CASE_X, 0.0, 0.96, 2100, 960, 790],
	[108.2, CASE_X, -2.4, 2.1, CASE_X, 0.0, 0.98, 2100, 960, 700],
];
const ch = (i: number) => spline(POSES.map((p) => [p[0], p[i]] as [number, number]));
const CH = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(ch);
export const worldCam = (t: number): Cam => { const v = CH.map((f) => f(Math.max(POSES[0][0], Math.min(POSES[POSES.length - 1][0], t))));
	return lookAt([v[0], v[1], v[2]], [v[3], v[4], v[5]], v[6], v[7], v[8]); };
export const toMM = (c: Cam): Cam => ({...c, p: [c.p[0] * 1000, c.p[1] * 1000, c.p[2] * 1000]});
const pp = (c: Cam, q: V3): P2 => { const p = proj(c, q); return [p[0], p[1]]; };

/* ---------- the ground: the top of the pit fill, which becomes the museum floor as the camera breaks the surface ---------- */
export const FLOOR_T: [number, number] = [94.4, 95.9];
export const Ground: React.FC<{c: Cam; t: number}> = ({c, t}) => { const k = sstep(seg(t, FLOOR_T[0], FLOOR_T[1])), under = c.p[2] < 0;
	const y0 = under ? 0 : -40, G = poly(c, [[-40, y0, 0], [40, y0, 0], [40, 40, 0], [-40, 40, 0]]);
	const col = mix('#4A3824', '#1C100B', k);
	const lines: React.ReactNode[] = [];
	for (let i = -10; i <= 10; i++) { const x = i * 0.6; lines.push(<path key={`x${i}`} d={poly(c, [[x, Math.max(y0, -14), 0], [x, 14, 0]], false)} stroke="#E8BC66" strokeOpacity={0.15 * k} strokeWidth={1.4} fill="none" />); }
	for (let j = -14; j <= 14; j++) { const y = j * 0.6; if (y < y0) continue; lines.push(<path key={`y${j}`} d={poly(c, [[-6, y, 0], [6, y, 0]], false)} stroke="#E8BC66" strokeOpacity={0.15 * k} strokeWidth={1.4} fill="none" />); }
	const mots = Array.from({length: 130}, (_, i) => { const x = lerp(-5, 5, rnd(i, 21)), y = lerp(Math.max(y0, -8), 12, rnd(i, 22)), p = proj(c, [x, y, 0]); if (p[2] < 0.3) return null;
		const r = Math.max(1, 1380 * 0.06 * (0.4 + rnd(i, 23)) / p[2]); return <ellipse key={i} cx={p[0]} cy={p[1]} rx={r} ry={r * 0.35} fill={['#6E5634', '#3A2C1C', '#7A6A4C'][i % 3]} opacity={0.5 * (1 - k)} />; });
	return <g>
		<path d={G} fill={col} />
		{mots}
		{lines}
		<Pool id="gfl" x={proj(c, [CASE_X, 0, 0])[0]} y={proj(c, [CASE_X, 0.2, 0])[1]} rx={Math.max(80, 1380 * 1.6 / Math.max(0.5, proj(c, [CASE_X, 0, 0])[2]))} ry={Math.max(30, 1380 * 0.55 / Math.max(0.5, proj(c, [CASE_X, 0, 0])[2]))} a={0.34 * k} col="#FFC878" />
		<path d={poly(c, [[-3.5, 0, 0], [3.5, 0, 0]], false)} stroke="#EDE6D2" strokeOpacity={0.5 * (1 - k)} strokeWidth={2} fill="none" />
	</g>; };

/* ---------- the case (mm world, shifted to stand above the tomb) ---------- */
export const SP_CASE53: SwordPose = {x0: -278 + CASE_X * 1000, ya: 0, z0: 1000, dir: 1};
export const CaseW: React.FC<{c: Cam; t: number; dull: number; bloom: number; gauge: number; id: string}> = ({c, t, dull, bloom, gauge, id}) => { const cm = toMM(c), X = CASE_X * 1000;
	const q = (x: number, y: number, z: number): V3 => [x + X, y, z];
	const top: V3[] = [q(-430, -210, 940), q(430, -210, 940), q(430, 210, 940), q(-430, 210, 940)], front: V3[] = [q(-430, -210, 940), q(430, -210, 940), q(430, -210, 0), q(-430, -210, 0)];
	const side: V3[] = [q(430, -210, 940), q(430, 210, 940), q(430, 210, 0), q(430, -210, 0)];
	const sp = proj(cm, q(0, 0, 1000)), pl = proj(cm, q(0, 0, 940));
	const holder = (x: number) => { const a = proj(cm, q(x, -6, 940)), b = proj(cm, q(x, -6, 1000 - 9)), w = c.f * 7 / a[2];
		return <g key={x}><path d={`M${a[0] - w},${a[1]} L${b[0] - w * 0.6},${b[1]} L${b[0] + w * 0.6},${b[1]} L${a[0] + w},${a[1]} Z`} fill="#E8F0F2" opacity={0.1} /><path d={`M${a[0] - w},${a[1]} L${b[0] - w * 0.6},${b[1]}`} stroke="#F4FAFC" strokeOpacity={0.35} strokeWidth={1.5} /></g>; };
	const mir = proj(cm, q(-360, 130, 985)), mr = c.f * 30 / mir[2];
	const glassBox = [[-430, -210], [430, -210], [430, 210], [-430, 210]].map(([x, y]) => q(x, y, 1400));
	const edge = (a: V3, b: V3) => poly(cm, [a, b], false);
	const sw = SP_CASE53, bo = bladeOutline(sw.x0 + 97, 1, 0, 1002.4);
	const bl = (s: number, w: number, r: number, seed: number) => blobOn(cm, sw.x0 + 97 + s, w, r, seed, 1002.6, 10, 0.5);
	const gp = (u: number): V3 => q(170 + 220 * u, -150, 941);
	return <g>
		<defs><filter id={`cw${id}`} x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="6" /></filter>
			<filter id={`cb${id}`} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1.2" /></filter></defs>
		<path d={poly(cm, side)} fill="#140B07" />
		<path d={poly(cm, front)} fill="#1A0F0A" />
		<path d={poly(cm, top)} fill="#21130D" />
		<path d={edge(q(-430, -210, 940), q(430, -210, 940))} stroke={B.gold} strokeOpacity={0.45} strokeWidth={2} fill="none" />
		<Pool id={`cp${id}`} x={pl[0]} y={pl[1] + 10} rx={Math.max(60, c.f * 420 / pl[2])} ry={Math.max(20, c.f * 120 / pl[2])} a={0.4} col="#FFC878" />
		<path d={poly(cm, [q(-270, 30, 941), q(278, 30, 941), q(278, -10, 941), q(-270, -10, 941)])} fill="#000" opacity={0.45} filter={`url(#cw${id})`} />
		{[-150, 160].map(holder)}
		<g transform={`translate(${mir[0]},${mir[1]})`}>
			<path d={`M-4,${mr * 1.6} L0,0 L4,${mr * 1.6} Z`} fill="#2A1A12" />
			<ellipse cx={0} cy={0} rx={mr * 1.12} ry={mr} fill="#0E0806" stroke={B.gold} strokeOpacity={0.5} strokeWidth={2} />
			<RingDisc x={0} y={0} r={mr * 0.78} ry={0.9} id={`m${id}`} />
		</g>
		{/* the climate panel: a soft glow on the plinth front, no numbers */}
		<path d={poly(cm, [q(250, -210.5, 700), q(390, -210.5, 700), q(390, -210.5, 600), q(250, -210.5, 600)])} fill="#BFE6D8" opacity={0.18} />
		<path d={poly(cm, [q(250, -210.5, 700), q(390, -210.5, 700), q(390, -210.5, 600), q(250, -210.5, 600)])} fill="none" stroke="#BFE6D8" strokeOpacity={0.5} strokeWidth={1.4} />
		{/* the brightness gauge beside the blade: a thin bar on the plinth top with a marker that slips a little */}
		<path d={poly(cm, [gp(0), gp(1)], false)} stroke="#F2E6CC" strokeOpacity={0.55} strokeWidth={2} fill="none" />
		{[0, 0.25, 0.5, 0.75, 1].map((u) => <path key={u} d={poly(cm, [gp(u), [gp(u)[0], gp(u)[1] + 14, 941]], false)} stroke="#F2E6CC" strokeOpacity={0.5} strokeWidth={1.4} fill="none" />)}
		<circle cx={pp(cm, gp(gauge))[0]} cy={pp(cm, gp(gauge))[1] - 4} r={Math.max(2.5, c.f * 6 / Math.max(300, proj(cm, gp(gauge))[2]))} fill="#FFE6A8" />
		{/* the case glass: thin frame lines in the air */}
		{glassBox.map((a, i) => <path key={i} d={edge(a, glassBox[(i + 1) % 4])} stroke="#E9EEF0" strokeOpacity={0.14} strokeWidth={1.4} fill="none" />)}
		{[[-430, -210], [430, -210]].map(([x, y], i) => <path key={`v${i}`} d={edge(q(x, y, 940), q(x, y, 1400))} stroke="#E9EEF0" strokeOpacity={0.2} strokeWidth={1.6} fill="none" />)}
		<Sword3D c={cm} sp={SP_CASE53} id={`${id}s`} />
		{dull > 0 && <path d={poly(cm, bo)} fill="#4A4234" opacity={0.22 * dull} />}
		{bloom > 0 && <g filter={`url(#cb${id})`}><path d={bl(250, 7, 4.2 * bloom, 5)} fill="#7A5434" opacity={0.3 * bloom} /><path d={bl(250, 7, 2.6 * bloom, 6)} fill="#4E5E38" opacity={0.95} /><path d={bl(250.4, 7.3, 1.4 * bloom, 7)} fill="#9AA668" opacity={0.85} /></g>}
		<Glint x={proj(cm, q(-170, 22, 1002))[0]} y={proj(cm, q(-170, 22, 1002))[1]} r={Math.max(6, 12 * 2100 / Math.max(900, sp[2]))} o={0.7} />
	</g>; };

/* ---------- crossing the front glass (KF03 / KF13): dark blurred posts at both edges and a reflection streak, strongest as the lens passes the pane ---------- */
export const GlassPass: React.FC<{c: Cam; id: string}> = ({c, id}) => { const s = cl(1 - Math.abs(c.p[1] + 0.27) / 0.22); if (s <= 0.01 || c.p[2] < 0.7) return null;
	return <g opacity={s}>
		<defs><filter id={`gp${id}`} x="-50%" y="-10%" width="200%" height="120%"><feGaussianBlur stdDeviation="14" /></filter></defs>
		<g filter={`url(#gp${id})`}><rect x={-60} y={-40} width={130} height={H + 80} fill="#050302" opacity={0.9} /><rect x={W - 70} y={-40} width={130} height={H + 80} fill="#050302" opacity={0.9} />
			<rect x={70} y={-40} width={10} height={H + 80} fill="#E9EEF0" opacity={0.25} /><rect x={W - 80} y={-40} width={8} height={H + 80} fill="#E9EEF0" opacity={0.18} /></g>
		<path d="M1240,-40 L1420,-40 L860,1120 L680,1120 Z" fill="#F4F8FA" opacity={0.05} />
		<path d="M1430,-40 L1460,-40 L900,1120 L870,1120 Z" fill="#F4F8FA" opacity={0.09} />
	</g>; };
