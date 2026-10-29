import React from 'react';
import {W, H, rnd, lerp, cl, SANS, KAI} from '../qq50/kit50';
import {B, Pool, thB} from '../qq50/styleB';
import {SealHollow} from '../qq51/master51';
import {Frame53, Sub53, Stamp53, Tag, Cam, lookAt, proj, poly, V3, mix} from './parts53';
import {Sword3D, SwordPose} from './sword3d';
import {RingDisc} from './props53';
import {TITLE53} from './lines53';
import {Glint} from './kfA53';
/* ep53 key frames, part B: the museum. KF03 the title riding the case's front glass (8.5–10.5 s, provisional) and KF04 the
   镀铬 claim (S3): the push along the axis from the pommel end. World units: mm. The sword lies level on two clear holders,
   blue glass up, pommel to the right (screen) in the front view; the plinth top at z = 940. */

/* ---------- the case: plinth, holders, the ringed mirror at the pommel end, the spot from above ---------- */
const SP_CASE: SwordPose = {x0: -278, ya: 0, z0: 1000, dir: 1};
const CaseSet: React.FC<{c: Cam; id: string}> = ({c, id}) => { const top: V3[] = [[-430, -210, 940], [430, -210, 940], [430, 210, 940], [-430, 210, 940]];
	const front: V3[] = [[-430, -210, 940], [430, -210, 940], [430, -210, 0], [-430, -210, 0]];
	const sp = proj(c, [0, 0, 1000]), pl = proj(c, [0, 0, 940]);
	const holder = (x: number) => { const a = proj(c, [x, -6, 940]), b = proj(c, [x, -6, 1000 - 9]), w = c.f * 7 / a[2];
		return <g key={x}><path d={`M${a[0] - w},${a[1]} L${b[0] - w * 0.6},${b[1]} L${b[0] + w * 0.6},${b[1]} L${a[0] + w},${a[1]} Z`} fill="#E8F0F2" opacity={0.1} /><path d={`M${a[0] - w},${a[1]} L${b[0] - w * 0.6},${b[1]}`} stroke="#F4FAFC" strokeOpacity={0.35} strokeWidth={1.5} /></g>; };
	const mir = proj(c, [-360, 130, 985]), mr = c.f * 30 / mir[2];
	return <g>
		<defs><linearGradient id={`cone${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFE2A8" stopOpacity="0.09" /><stop offset="0.7" stopColor="#FFD08A" stopOpacity="0.035" /><stop offset="1" stopColor="#FFC070" stopOpacity="0.02" /></linearGradient></defs>
		{/* the hall beyond the case: dark, a far rope line glowing faintly */}
		<rect x={-40} y={-40} width={W + 80} height={H + 80} fill="#0E0705" />
		<path d={`M${sp[0] - 260},-20 L${sp[0] + 260},-20 L${sp[0] + 620},${pl[1] + 40} L${sp[0] - 620},${pl[1] + 40} Z`} fill={`url(#cone${id})`} />
		<path d={poly(c, front)} fill="#1A0F0A" />
		<path d={poly(c, top)} fill="#21130D" />
		<path d={poly(c, [[-430, -210, 940], [430, -210, 940]], false)} stroke={B.gold} strokeOpacity={0.45} strokeWidth={2} fill="none" />
		<Pool id={`pl${id}`} x={pl[0]} y={pl[1] + 10} rx={c.f * 420 / pl[2]} ry={c.f * 120 / pl[2]} a={0.4} col="#FFC878" />
		{/* the sword's soft shadow on the plinth */}
		<path d={poly(c, [[-270, 30, 941], [278, 30, 941], [278, -10, 941], [-270, -10, 941]])} fill="#000" opacity={0.45} filter={`url(#sh${id})`} />
		<defs><filter id={`sh${id}`} x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="6" /></filter></defs>
		{[-150, 160].map(holder)}
		{/* the tilted mirror behind the pommel shows its 11 rings (the museum shows them this way) */}
		<g transform={`translate(${mir[0]},${mir[1]})`}>
			<path d={`M-4,${mr * 1.6} L0,0 L4,${mr * 1.6} Z`} fill="#2A1A12" />
			<ellipse cx={0} cy={0} rx={mr * 1.12} ry={mr} fill="#0E0806" stroke={B.gold} strokeOpacity={0.5} strokeWidth={2} />
			<RingDisc x={0} y={0} r={mr * 0.78} ry={0.9} id={`m${id}`} />
			<path d={`M${-mr * 0.7},${-mr * 0.4} Q${-mr * 0.3},${-mr * 0.82} ${mr * 0.35},${-mr * 0.75}`} stroke="#FFFFFF" strokeOpacity={0.25} strokeWidth={3} fill="none" />
		</g>
	</g>; };

/* ---------- KF03 · the title on the case's front glass ---------- */
const CAM_T = lookAt([0, -1300, 1800], [0, 0, 960], 2100, 960, 790);
/** the plaque border: a single row of small diamonds, the blade's own lattice, etched into the glass */
const LatticeRule: React.FC<{x0: number; x1: number; y: number; s?: number}> = ({x0, x1, y, s = 13}) => { const n = Math.floor((x1 - x0) / (s * 1.7));
	return <g>{Array.from({length: n}, (_, i) => { const cx = x0 + (i + 0.5) * (x1 - x0) / n; return <path key={i} d={`M${cx - s * 0.8},${y} L${cx},${y - s * 0.46} L${cx + s * 0.8},${y} L${cx},${y + s * 0.46} Z`} fill={i % 2 ? 'none' : '#F4F0E8'} fillOpacity={0.35} stroke="#F4F0E8" strokeOpacity={0.55} strokeWidth={1.4} />; })}</g>; };
export const KF03: React.FC = () => { const c = CAM_T, [r1, r2] = TITLE53, fs = 124, ls = 0.06;
	const PX = 960, PY = 322, PW = 1080, PH = 404;
	return <Frame53 id="k3" ground={false} vig={0.6} over={<>
		{/* the etched title on the glass plane (frosted fill, a bright top edge where the etch catches the spot) */}
		<div style={{position: 'absolute', left: PX - PW / 2 - 160, top: PY - PH / 2 - 100, width: PW + 320, height: PH + 200, background: 'radial-gradient(closest-side, rgba(10,5,3,0.62), rgba(10,5,3,0.5) 60%, rgba(10,5,3,0))'}} />
		<svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
			<defs><filter id="frost" x="-5%" y="-10%" width="110%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves={1} seed={3} result="n" /><feColorMatrix in="n" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -1.2 1.25" result="m" /><feComposite in="SourceGraphic" in2="m" operator="in" /></filter></defs>
			<rect x={PX - PW / 2} y={PY - PH / 2} width={PW} height={PH} fill="none" stroke="#F4F0E8" strokeOpacity={0.4} strokeWidth={1.5} />
			<rect x={PX - PW / 2 + 12} y={PY - PH / 2 + 12} width={PW - 24} height={PH - 24} fill="none" stroke="#F4F0E8" strokeOpacity={0.22} strokeWidth={1} />
			<LatticeRule x0={PX - PW / 2 + 30} x1={PX + PW / 2 - 30} y={PY - PH / 2 + 34} />
			<LatticeRule x0={PX - PW / 2 + 30} x1={PX + PW / 2 - 30} y={PY + PH / 2 - 34} />
		</svg>
		<div style={{position: 'absolute', left: 0, right: 0, top: PY - PH / 2 + 56, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: fs, lineHeight: 1.08, letterSpacing: `${ls}em`, whiteSpace: 'nowrap',
			textShadow: '0 -1px 0 rgba(255,255,255,0.55), 0 0 2px rgba(16,7,4,0.9), 0 2px 10px rgba(16,7,4,0.75), 0 0 30px rgba(16,7,4,0.5)'}}>
			<div style={{color: 'rgba(246,242,234,0.94)'}}><span style={{position: 'relative', left: `${ls / 2}em`}}>{r1}</span></div>
			<div style={{color: B.gold}}><span style={{position: 'relative', left: `${(0.5 + ls) / 2}em`}}>{r2.slice(0, -1)}<span style={{marginRight: '-0.5em'}}>{r2.slice(-1)}</span></span></div>
		</div>
		<svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, mixBlendMode: 'multiply', opacity: 0.22}}>
			<defs><filter id="frost2" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={7} /><feColorMatrix values="0 0 0 0 0.55  0 0 0 0 0.52  0 0 0 0 0.48  0 0 0 0 1" /></filter>
				<clipPath id="ttl"><text x={PX + fs * ls / 2} y={PY - PH / 2 + 56 + fs * 0.92} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={fs} letterSpacing={`${ls}em`}>{r1}</text><text x={PX + fs * (0.5 + ls) / 2} y={PY - PH / 2 + 56 + fs * 2.0} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={fs} letterSpacing={`${ls}em`}>{r2}</text></clipPath></defs>
			<rect width={W} height={H} filter="url(#frost2)" clipPath="url(#ttl)" />
		</svg>
		<SealHollow /></>}>
		<CaseSet c={c} id="k3" />
		<Sword3D c={c} sp={SP_CASE} id="k3s" />
		<Glint x={proj(c, [-170, 22, 1002])[0]} y={proj(c, [-170, 22, 1002])[1]} r={14} o={0.8} />
		{/* the front glass right at the lens: its frame posts out of focus at both edges, one bright reflection streak */}
		<defs><filter id="k3b" x="-50%" y="-10%" width="200%" height="120%"><feGaussianBlur stdDeviation="14" /></filter></defs>
		<g filter="url(#k3b)"><rect x={-60} y={-40} width={130} height={H + 80} fill="#050302" opacity={0.9} /><rect x={W - 70} y={-40} width={130} height={H + 80} fill="#050302" opacity={0.9} />
			<rect x={70} y={-40} width={10} height={H + 80} fill="#E9EEF0" opacity={0.25} /><rect x={W - 80} y={-40} width={8} height={H + 80} fill="#E9EEF0" opacity={0.18} /></g>
		<path d="M1240,-40 L1420,-40 L860,1120 L680,1120 Z" fill="#F4F8FA" opacity={0.045} />
		<path d="M1430,-40 L1460,-40 L900,1120 L870,1120 Z" fill="#F4F8FA" opacity={0.08} />
	</Frame53>; };

/* ---------- KF04 · S3 · the push along the axis from the pommel end; on 「镀了铬」 a silvery sheen washes along the blade ---------- */
const SP_S3: SwordPose = {x0: 0, ya: 0, z0: 0, dir: 1};
const CAM_S3 = lookAt([-290, -132, 104], [250, 30, -12], 1650, 1000, 600);
export const KF04: React.FC = () => { const c = CAM_S3, tagTo = proj(c, [330, 14, 2.3]);
	const plinth: V3[] = [[-400, -400, -60], [900, -400, -60], [900, 400, -60], [-400, 400, -60]];
	return <Frame53 id="k4" sheen={0.3} vig={0.62} over={<><Sub53 id="S3" /><Stamp53 id="S3" /><SealHollow /></>}>
		<defs><filter id="k4s" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="12" /></filter></defs>
		<path d={poly(c, plinth)} fill="#1C100B" />
		<Pool id="k4p" x={proj(c, [200, 0, -60])[0]} y={proj(c, [200, 0, -60])[1]} rx={620} ry={220} a={0.32} col="#FFC070" />
		<path d={poly(c, [[0, 30, -59], [556, 30, -59], [556, -26, -59], [0, -26, -59]])} fill="#000" opacity={0.5} filter="url(#k4s)" />
		{[[60, 0], [420, 0]].map(([x], i) => { const a = proj(c, [x, -4, -60]), b = proj(c, [x, -4, -10]), w = c.f * 6 / a[2]; return <path key={i} d={`M${a[0] - w},${a[1]} L${b[0] - w * 0.5},${b[1]} L${b[0] + w * 0.5},${b[1]} L${a[0] + w},${a[1]} Z`} fill="#E8F0F2" opacity={0.05} />; })}
		<Sword3D c={c} sp={SP_S3} id="k4s" sheen={0.56} />
		<Tag id="k4" x={tagTo[0] - 250} y={tagTo[1] + 190} s="镀铬？" fs={64} anchor="end" to={[tagTo[0] - 12, tagTo[1] + 10]} col={B.cream} />
	</Frame53>; };
void rnd; void lerp; void cl; void KAI; void thB; void mix;
