import React from 'react';
import {Img} from 'remotion';
import {W, H, seg, land, lerp, cl, rnd, SANS, SERIF, SAFE_X} from '../qq50/kit50';
import {B, Pool, thB} from '../qq50/styleB';
import {SEAL_SRC} from '../qq44/skin44';
import {proj} from './parts53';
import {Sword3D} from './sword3d';
import {Kitchen, CAM0, SW_HOOK} from './kfA53';
import {Cam, V3, poly, blobOn} from './parts53';
import {TITLE53, SOURCES53} from './lines53';
import {END_Q53} from './kfF53';
import {CARD_T53, frameOf} from './master53';
/* ep53 · TakeD, the end (leg 18): the held kitchen (frame 0's framing, the sword only a faint glow in the window) with the
   Juno end card on it. KF14's layout; the J stamp is complete on frame f3274 (the downbeat 109.125), nothing before it. */
/* ---------- your cleaver, drawn as a kitchen cleaver: the blade tapers toward the front, the back is rounded, the wooden handle runs off the bottom-left edge ---------- */
const KF = 200, HX = -210;
const spineY = (x: number) => lerp(-98, -82, cl(x / KF));
const bladeOutline = (): V3[] => { const pts: V3[] = [[0, -4, 0], [2, 0, 0], [KF - 20, 0, 0]];
	for (let i = 1; i <= 8; i++) { const a = (i / 8) * Math.PI / 2; pts.push([KF - 20 + 20 * Math.sin(a), -20 + 20 * Math.cos(a), 0]); }
	pts.push([KF, spineY(KF - 22) + 22, 0]);
	for (let i = 1; i <= 8; i++) { const a = (i / 8) * Math.PI / 2; pts.push([KF - 22 + 22 * Math.cos(a), spineY(KF - 22) + 22 - 22 * Math.sin(a), 0]); }
	for (let i = 1; i <= 8; i++) { const x = lerp(KF - 22, 6, i / 8); pts.push([x, spineY(x), 0]); }
	pts.push([0, -92, 0]); return pts; };
const RUSTD: [number, number, number, number][] = (() => { const out: [number, number, number, number][] = [];
	const cl0: [number, number, number, number][] = [[168, -70, 16, 18], [120, -80, 13, 12], [70, -85, 14, 13], [24, -84, 12, 10], [12, -40, 16, 14], [92, -46, 10, 8], [146, -34, 8, 6], [40, -20, 9, 7], [178, -20, 7, 5], [110, -8, 5, 6], [60, -6, 5, 5], [16, -8, 5, 5]];
	cl0.forEach(([x, y, r, n], c) => { for (let i = 0; i < n; i++) { const a = rnd(c * 40 + i, 61) * 6.283, d = r * Math.sqrt(rnd(c * 40 + i, 62));
		out.push([x + d * Math.cos(a), y + d * Math.sin(a) * 0.9, (1.2 + 3.4 * rnd(c * 40 + i, 63)) * (1 - 0.45 * d / r), rnd(c * 40 + i, 64)]); } });
	return out; })();
const RUST_COL = ['#8A4620', '#A6582A', '#6A3518', '#B86A32', '#7A3E1C'];
export const CleaverD: React.FC<{c: Cam; rho: number}> = ({c, rho}) => {
	const top = poly(c, bladeOutline()), p0 = proj(c, [0, -96, 0]), p1 = proj(c, [KF * 0.7, 0, 0]);
	const bevel = poly(c, [[2, -9, 0.05], [KF - 16, -9, 0.05], [KF - 6, -4, 0.05], [KF - 14, 0, 0.05], [2, 0, 0.05]]);
	const spine = poly(c, [[4, -98, 0.05], [KF - 22, spineY(KF - 22), 0.05], [KF - 22, spineY(KF - 22) + 4, 0.05], [4, -93, 0.05]]);
	const spots = RUSTD.map(([x, y, r, b], i) => { const k = cl((rho - b * 0.7) / 0.3); if (k <= 0) return null; const d = blobOn(c, x, y, r * (0.4 + 0.6 * k), i, 0.08, 9, 0.7);
		return d ? <path key={i} d={d} fill={RUST_COL[i % 5]} opacity={0.55 + 0.4 * k * rnd(i, 66)} /> : null; });
	const beads: [number, number, number][] = [[64, -52, 5.2], [104, -28, 3.6], [140, -54, 4.4], [30, -40, 3.2], [118, -68, 2.6], [46, -62, 2.4], [170, -40, 2.8]];
	const y0 = -88, y1 = -58, zc = 8, r = 13;
	const hTop = poly(c, [[-8, y0, zc + r * 0.55], [HX, y0 + 4, zc + r * 0.5], [HX - 6, (y0 + y1) / 2 + 2, zc + r * 0.45], [HX, y1 - 2, zc + r * 0.5], [-8, y1, zc + r * 0.55]]);
	const hSide = poly(c, [[-8, y1, zc + r * 0.55], [HX, y1 - 2, zc + r * 0.5], [HX, y1, zc - r * 0.4], [-8, y1 + 3, zc - r * 0.4]]);
	const bol = poly(c, [[2, y0 - 4, 0], [-12, y0 - 2, zc + r * 0.6], [-12, y1 + 2, zc + r * 0.6], [2, y1 + 4, 0]]);
	const q0 = proj(c, [-100, y0, zc + r]), q1 = proj(c, [-100, y1, zc]);
	return <g>
		<defs><linearGradient id="kS2" gradientUnits="userSpaceOnUse" x1={p0[0]} y1={p0[1]} x2={p1[0]} y2={p1[1]}><stop offset="0" stopColor="#4C5052" /><stop offset="0.5" stopColor="#6E7274" /><stop offset="0.75" stopColor="#7E8283" /><stop offset="1" stopColor="#5A5E60" /></linearGradient>
			<linearGradient id="kW2" gradientUnits="userSpaceOnUse" x1={q0[0]} y1={q0[1]} x2={q1[0]} y2={q1[1]}><stop offset="0" stopColor="#6A4630" /><stop offset="0.5" stopColor="#4A2E1C" /><stop offset="1" stopColor="#2A190F" /></linearGradient>
			<filter id="kR2" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="1.1" /></filter>
			<clipPath id="kC2"><path d={top} /></clipPath></defs>
		<path d={poly(c, bladeOutline().map(([x, y]) => [x + 3, y + 5, -3] as V3))} fill="#000" opacity={0.5} />
		<path d={poly(c, [[-8, y0 + 5, -2.9], [HX, y0 + 7, -2.9], [HX, y1 + 9, -2.9], [-8, y1 + 9, -2.9]])} fill="#000" opacity={0.45} />
		<path d={top} fill="url(#kS2)" />
		<g clipPath="url(#kC2)">
			<path d={bevel} fill="#A6AAA8" opacity={0.62} />
			<path d={spine} fill="#9A9E9C" opacity={0.55} />
			{Array.from({length: 14}, (_, i) => { const y = -8.5 + i * 0.6; return <path key={i} d={poly(c, [[4, y, 0.06], [KF - 14, y, 0.06]], false)} stroke="#E8ECEA" strokeOpacity={0.05 + 0.05 * rnd(i, 3)} strokeWidth={1} fill="none" />; })}
			<g filter="url(#kR2)">{spots}</g>
		</g>
		<path d={poly(c, Array.from({length: 24}, (_, i) => { const a = i / 24 * 2 * Math.PI; return [168 + 8 * Math.cos(a), -66 + 8 * Math.sin(a), 0.1] as V3; }))} fill="#0E0A08" stroke="#2E3032" strokeWidth={1.5} />
		<path d={poly(c, [[2, -0.3, 0.1], [KF - 14, -0.3, 0.1]], false)} stroke="#F0F2F0" strokeWidth={2.2} strokeOpacity={0.75} fill="none" />
		{beads.map(([x, y, rr], i) => { const p = proj(c, [x, y, 0.2]), R = c.f * rr / p[2], q = proj(c, [x - rr * 0.3, y - rr * 0.35, 0.5]);
			return <g key={`w${i}`}><ellipse cx={p[0]} cy={p[1]} rx={R} ry={R * 0.62} fill="#8A9294" opacity={0.55} /><circle cx={q[0]} cy={q[1]} r={Math.max(1.2, R * 0.26)} fill="#F4F8F8" opacity={0.9} /></g>; })}
		<path d={hSide} fill="#1E120C" />
		<path d={hTop} fill="url(#kW2)" />
		{Array.from({length: 6}, (_, i) => { const y = lerp(y0 + 4, y1 - 4, (i + 0.5) / 6); return <path key={i} d={poly(c, [[-14, y, zc + r * 0.56], [HX + 6, y + 0.6, zc + r * 0.51]], false)} stroke="#8A5E40" strokeOpacity={0.35} strokeWidth={1} fill="none" />; })}
		{[-44, -104, -164].map((x) => { const q = proj(c, [x, (y0 + y1) / 2, zc + r * 0.56]), R = c.f * 3.8 / q[2]; return <g key={x}><ellipse cx={q[0]} cy={q[1]} rx={R} ry={R * 0.6} fill="#8A8E8E" stroke="#2A2C2C" strokeWidth={1} /></g>; })}
		<path d={bol} fill="#6A6E70" stroke="#2A2C2E" strokeWidth={1} />
	</g>; };

export const KitchenEnd: React.FC<{glow?: number}> = ({glow = 1}) => { const c = CAM0, mid = proj(c, [480, -19, 0]);
	const wn = [proj(c, [150, -19, 40]), proj(c, [860, -19, 40]), proj(c, [860, -19, -2]), proj(c, [150, -19, -2])], sa = proj(c, [228, -19, 0]), sb = proj(c, [784, -19, 0]);
	const cx = (sa[0] + sb[0]) / 2, cy = (sa[1] + sb[1]) / 2, ww = Math.abs(sb[0] - sa[0]) * 0.62 + 120, hh = Math.abs(sb[1] - sa[1]) * 0.62 + 120;
	return <g>
		<defs><filter id="k14Far" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4" /></filter></defs>
		<Kitchen c={c} />
		<Pool id="k14d" x={mid[0]} y={mid[1]} rx={560} ry={330} a={0.75} col="#080403" />
		<g opacity={glow}><rect x={cx - ww / 2} y={cy - hh / 2} width={ww} height={hh} fill="#1A0D09" stroke="#6A4A34" strokeWidth={1} strokeOpacity={0.8} />
			<path d={`M${cx},${cy - hh / 2} V${cy + hh / 2} M${cx - ww / 2},${cy} H${cx + ww / 2}`} stroke="#6A4A34" strokeWidth={1} strokeOpacity={0.5} /></g>
		<Pool id="k14s" x={cx - 10} y={cy + 6} rx={ww * 0.5} ry={hh * 0.5} a={0.3 * glow} col="#FFB868" />
		<g filter="url(#k14Far)" opacity={0.6 * glow}><Sword3D c={c} sp={SW_HOOK} id="k14s" /></g>
		<CleaverD c={c} rho={0.95} />
	</g>; };
const fade = (t: number, a: number, d = 0.4) => seg(t, a, a + d);
export const EndCardAnim: React.FC<{t: number}> = ({t}) => {
	const f0 = frameOf(CARD_T53), f = frameOf(t), T0 = f0 / 30;
	const fs = 76, q = END_Q53, tw = fs * q.length * 1.03, [t1, t2] = TITLE53;
	const dim = 0.72 * seg(t, T0 - 0.1, T0 + 0.35);
	const title = fade(t, T0 + 0.35), qq = fade(t, T0 + 0.7), pill = t >= T0 + 1.2 ? land(seg(t, T0 + 1.2, T0 + 1.6)) : 0, src = fade(t, T0 + 1.3);
	const jolt = f >= f0 && f - f0 < 18 ? 1 + 0.045 * Math.exp(-(f - f0) / 5) * Math.cos(2 * Math.PI * (f - f0) / 8) : 1;
	return <div style={{position: 'absolute', inset: 0}}>
		<div style={{position: 'absolute', inset: 0, background: `rgba(8,4,3,${dim})`}} />
		{f >= f0 && <Img src={SEAL_SRC} style={{position: 'absolute', left: 960 - 70, top: 120, width: 140, height: 140, transform: `rotate(-6deg) scale(${jolt})`, filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.5))'}} />}
		<div style={{position: 'absolute', left: 0, right: 0, top: 290, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 60, lineHeight: 1.35, letterSpacing: '0.05em', color: B.gold, textShadow: thB.halo, whiteSpace: 'nowrap', opacity: title}}>
			{t1.slice(0, -1)}<span style={{marginRight: '-0.05em'}}>{t1.slice(-1)}</span><br />{t2.slice(0, -1)}<span style={{marginRight: '-0.55em'}}>{t2.slice(-1)}</span></div>
		<div style={{position: 'absolute', left: 960 - tw / 2 - 260, top: 560 - 150, width: tw + 520, height: fs * 1.5 + 300, opacity: qq, background: 'radial-gradient(closest-side, rgba(16,7,4,0.42), rgba(16,7,4,0.36) 45%, rgba(16,7,4,0.15) 80%, rgba(16,7,4,0))'}} />
		<div style={{position: 'absolute', left: 0, right: 0, top: 560 + 10 * (1 - qq), opacity: qq, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: fs, lineHeight: 1.5, letterSpacing: '0.03em', color: thB.ink, textShadow: thB.halo, whiteSpace: 'nowrap'}}>{q.slice(0, -1)}<span style={{marginRight: '-0.53em'}}>{q.slice(-1)}</span></div>
		{pill > 0 && <div style={{position: 'absolute', left: 760, top: 790, width: 400, height: 58, borderRadius: 29, border: `2px solid ${B.gold}`, background: 'rgba(255,217,138,0.08)', textAlign: 'center', lineHeight: '58px', fontFamily: SERIF, fontWeight: 700, fontSize: 28, letterSpacing: '0.1em', color: B.gold, opacity: cl(pill * 2), transform: `scale(${lerp(0.9, 1, pill)})`}}>关注 Juno · 一起看懂世界</div>}
		<div style={{position: 'absolute', left: SAFE_X, right: SAFE_X, top: 905, textAlign: 'center', fontFamily: SANS, fontSize: 24, lineHeight: 1.6, color: '#F2E6CC', opacity: 0.78 * src, whiteSpace: 'nowrap'}}>{SOURCES53}</div>
	</div>; };
export const FADE_OUT_T = 113.633 - 0.5;
void W; void H;
