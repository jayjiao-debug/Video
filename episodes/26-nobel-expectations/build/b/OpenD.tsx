import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, Easing} from 'remotion';
import {Phone, AppScreen, Banner, LockScreen, T} from '../Open26';
import {C, W, H, SANS, SERIF, NUM, Figure, Rule} from './kit';
import {E, ramp, mix, enter, exit, env, land, riseStyle} from './motion';
import {Bread} from './OpenB';

/* ep26 v3 · opening 0–20.95 s.
   T0: the tilted phone on the table turns to face us (2.25–2.95) while its screen goes lock → app.
   T1: the 饼 flips into a medal that has thickness, drifts to the 3D still's spot and colour, and the still takes over on the drop with no flash.
   T2 (20.45–20.95): the title leaves upward, the still dims, a gold streak sweeps across and becomes the Hall chart's axis (drawn by the Hall scene). */
const PW = 400, PH = 820, SW = 372, SH = 792;
const FR = {cx: 524, cy: 499, s: 1.12}; // frontal phone centre/scale
const TL = {cx: 960, cy: 560, s: 1.0}; // tilted phone on the table
export const DROP = 16.625;
export const MEDAL = {x: 484, y: 516, r: 456}; // the 3D medal in medal.png

/** the 2D medal with an edge: face ellipse rx = r|cos|, reeded band on the trailing side */
const Coin: React.FC<{x: number; y: number; r: number; ang: number; grade: number}> = ({x, y, r, ang, grade}) => {
	const c = Math.cos(ang), s = Math.sin(ang);
	const rx = Math.max(1, r * Math.abs(c)), band = r * 0.09 * Math.abs(s);
	const side = s >= 0 ? 1 : -1;
	return (
		<g>
			<defs>
				<radialGradient id="cf" cx="0.36" cy="0.3" r="0.8"><stop offset="0" stopColor="#fff1c8" /><stop offset="0.45" stopColor="#d7a650" /><stop offset="1" stopColor="#6e4a14" /></radialGradient>
				<linearGradient id="ce" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#b48a3c" /><stop offset="0.5" stopColor="#8a6424" /><stop offset="1" stopColor="#4e3510" /></linearGradient>
				<pattern id="reed" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="url(#ce)" /><rect width="6" height="1" fill="#e9c98a" opacity={0.5} /></pattern>
			</defs>
			{/* edge band */}
			{band > 0.5 && (
				<g>
					<ellipse cx={x + side * band} cy={y} rx={rx} ry={r} fill="#5a3d10" />
					<rect x={side > 0 ? x : x - band} y={y - r} width={band} height={2 * r} fill="url(#reed)" />
				</g>
			)}
			<ellipse cx={x} cy={y} rx={rx} ry={r} fill="url(#cf)" />
			<g transform={`translate(${x} ${y}) scale(${rx / r} 1) translate(${-x} ${-y})`}>
				<circle cx={x} cy={y} r={r * 0.93} fill="none" stroke="#5e3f10" strokeOpacity={0.45} strokeWidth={3} />
				{[-1, 1].map((sd) => Array.from({length: 13}, (_, i) => {
					const a = Math.PI / 2 + sd * (0.38 + i * 0.18), lx = x + Math.cos(a) * r * 0.74, ly = y + Math.sin(a) * r * 0.74;
					return (
						<g key={`${sd}${i}`} transform={`rotate(${(a * 180) / Math.PI + sd * 55} ${lx} ${ly})`}>
							<ellipse cx={lx} cy={ly + 1} rx={r * 0.085} ry={r * 0.032} fill="#fff0c8" opacity={0.35} />
							<ellipse cx={lx} cy={ly} rx={r * 0.085} ry={r * 0.032} fill="#6e4a14" opacity={0.55} />
						</g>
					);
				}))}
				<text x={x} y={y + r * 0.16} textAnchor="middle" style={{fontFamily: NUM, fontSize: r * 0.5, fontWeight: 700}} fill="#5e3f10" opacity={0.7 * (1 - grade)}>2026</text>
			</g>
			{/* grade toward the 3D still's bronze */}
			<ellipse cx={x} cy={y} rx={rx} ry={r} fill="#7a5220" opacity={0.55 * grade} style={{mixBlendMode: 'multiply'}} />
		</g>
	);
};

export const OpenD: React.FC<{t: number}> = ({t}) => {
	if (t >= DROP + 0.25) return <TitleD t={t} />;
	const f = t * 30;
	// shot 1: phone already 40 % awake on frame 0, full by 0.25 s
	const wake = mix(ramp(t, 0, 0.25, E.ENTER), 0.4, 1);
	const banner = land(t, 0.45);
	// T0
	const tp = ramp(t, 2.25, 2.95, E.MOVE);
	const scr = ramp(t, 2.45, 2.75, E.MOVE);
	const push = mix(ramp(t, 0, 2.25, E.LIN), 1, 1.06);
	const ph = {cx: mix(tp, TL.cx, FR.cx), cy: mix(tp, TL.cy, FR.cy), s: mix(tp, TL.s * push, FR.s), rx: mix(tp, 46, 0), rz: mix(tp, -16, 0)};
	const tableY = mix(tp, 0, 120), tableO = 1 - tp;
	// the money beat
	const tapT = (T.s2 + 34) / 30;
	const n1 = enter(t, 2.75), n2 = enter(t, tapT + 0.1);
	const spent = Math.round(mix(ramp(t, tapT + 0.15, tapT + 1.0, E.MOVE), 0, 32));
	const numsOut = 1 - exit(t, 5.2, 0.35);
	// 预期 rises out of 去结算
	const bx0 = FR.cx + (-PW / 2 + 14 + SW - 90) * FR.s, by0 = FR.cy + (-PH / 2 + 14 + SH - 50) * FR.s;
	const rp = ramp(t, 5.46, 6.5, E.MOVE);
	const bob = Math.sin(t * 2.1) * 4;
	const rx = mix(rp, bx0, 1330), ry = mix(rp, by0, 420) + bob * rp;
	const rr = mix(rp, 18, 150);
	const word = enter(t, 6.2, 0.5);
	// 8.12: the boss draws the 饼 (gold pen outline, then it bakes in)
	const pen = ramp(t, 8.12, 8.62, E.MOVE), bake = ramp(t, 8.55, 9.0, E.MOVE);
	const ringO = 1 - ramp(t, 8.12, 8.4, E.EXIT);
	const bnr = land(t, 8.2);
	const link = enter(t, 8.9, 0.5);
	const bite = ramp(t, 11.3, 11.5, Easing.out(Easing.back(2)));
	// T1: to centre, flip with thickness, drift to the still's place and colour
	const phoneOut = ramp(t, 13.44, 14.2, E.MOVE);
	const mv = ramp(t, 13.44, 14.3, E.MOVE);
	const flip = ramp(t, 14.1, 16.0, E.MOVE);
	const ang = flip * Math.PI * 2;
	const toStill = ramp(t, 15.9, DROP, E.MOVE);
	const baseR = mix(ramp(t, 8.55, 9.0, E.MOVE), 150, 170) + mix(ramp(t, 14.1, 15.9, E.MOVE), 0, 50);
	const cx = mix(toStill, mix(mv, 1330, 960), MEDAL.x), cy = mix(toStill, mix(mv, 420 + bob, 450), MEDAL.y), cr = mix(toStill, baseR, MEDAL.r);
	const crumbs = t > 11.4 ? Array.from({length: 12}, (_, i) => {
		const u = t - 11.4;
		return [1330 + 120 + ((i * 41) % 70) - 30 + u * ((i % 5) - 2) * 24, 300 + ((i * 29) % 40) + u * u * 520, 2 + (i % 3) * 1.6, Math.max(0, 1 - u / 1.2)];
	}) : [];
	const keyX = mix(tp, 960, 760);
	return (
		<AbsoluteFill style={{background: C.bg}}>
			<AbsoluteFill style={{background: `radial-gradient(1000px 760px at ${t < 5.4 ? keyX : mix(ramp(t, 5.4, 6.4, E.CAM), 760, 1150)}px 540px, rgba(${t < 2.5 ? '90,110,160' : '120,92,58'},${0.42 * (t < 2.5 ? 0.4 + 0.6 * wake : 0.9)}), rgba(10,10,11,0) 70%)`}} />
			{/* the table under the tilted phone; horizon softened */}
			{tableO > 0 && (
				<div style={{position: 'absolute', left: -400, top: 380 + tableY, width: 2800, height: 1400, opacity: tableO, transform: 'perspective(1600px) rotateX(58deg)', transformOrigin: '50% 0%',
					background: `radial-gradient(700px 500px at 1400px 300px, rgba(120,140,190,${0.28 * wake}), rgba(0,0,0,0) 70%), repeating-linear-gradient(92deg, #1a120b 0px, #22170e 7px, #170f09 15px, #1e140c 26px)`,
					WebkitMaskImage: 'linear-gradient(180deg, rgba(0,0,0,0) 0px, rgba(0,0,0,1) 200px)'}} />
			)}
			{/* one phone throughout */}
			<div style={{position: 'absolute', left: ph.cx - PW / 2 - mix(phoneOut, 0, 260), top: ph.cy - PH / 2, opacity: 1 - phoneOut * 0.9,
				transform: `perspective(1800px) rotateX(${ph.rx}deg) rotateZ(${ph.rz}deg) scale(${ph.s * (1 - 0.1 * phoneOut)})`, transformOrigin: '50% 50%',
				filter: t > 5.4 ? `brightness(${mix(ramp(t, 5.4, 6.2, E.CAM), 1, 0.75)})` : undefined}}>
				<Phone>
					{scr < 1 && <div style={{position: 'absolute', inset: 0, opacity: 1 - scr}}><LockScreen wake={wake} banner={banner} /></div>}
					{scr > 0 && <div style={{position: 'absolute', inset: 0, opacity: scr}}><AppScreen f={f} /></div>}
					<Banner y={interpolate(bnr, [0, 1], [-140, 44])} o={Math.min(1, bnr * 1.5)} light />
				</Phone>
			</div>
			{/* ¥0 arrived / +¥32 spent */}
			{t > 2.6 && t < 5.7 && (
				<div style={{position: 'absolute', left: 980, top: 190, opacity: numsOut, transform: `translateY(${(1 - numsOut) * -24}px)`}}>
					<Figure label="涨的工资 · 现在到账" value="¥0" size={170} style={riseStyle(n1, true)} />
					<Rule style={{margin: '26px 0 30px', transform: `scaleX(${n2})`, transformOrigin: '0 0'}} w={760} />
					<Figure label="今晚的饭 · ¥26 → ¥58" value={`+¥${spent}`} note="多花了" col={C.gold} size={170} style={riseStyle(n2, true)} />
				</div>
			)}
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				<defs>
					<radialGradient id="halo"><stop offset="0" stopColor={C.gold} stopOpacity={0.3} /><stop offset="1" stopColor={C.gold} stopOpacity={0} /></radialGradient>
					<clipPath id="bakeClip"><circle cx={1330} cy={420 + bob} r={Math.max(0.1, bake * 200)} /></clipPath>
				</defs>
				{t >= 5.46 && t < 13.44 && (
					<g>
						<circle cx={rx} cy={ry} r={rr * 2.2} fill="url(#halo)" />
						<g opacity={ringO}>
							<circle cx={rx} cy={ry} r={rr} fill="none" stroke={C.gold} strokeWidth={2.5} />
							<circle cx={rx} cy={ry} r={rr + 14} fill="none" stroke={C.gold} strokeOpacity={0.35} strokeWidth={1} />
							<text x={rx} y={ry + 34} textAnchor="middle" style={{fontFamily: SERIF, fontSize: 96, fontWeight: 700}} fill={C.gold} opacity={word}>预期</text>
						</g>
						{/* the boss draws the 饼 */}
						{t >= 8.12 && (
							<g>
								<circle cx={1330} cy={420 + bob} r={baseR} fill="none" stroke={C.gold} strokeWidth={3} pathLength={1} strokeDasharray={`${pen} 1`} transform={`rotate(-90 1330 ${420 + bob})`} opacity={1 - bake} />
								<g clipPath="url(#bakeClip)"><Bread x={1330} y={420 + bob} r={baseR} bite={bite} id="d1" /></g>
							</g>
						)}
						<g opacity={link}>
							<path d={`M${1330 - baseR - 16} ${420 + bob} L ${FR.cx + (PW / 2 - 6) * FR.s} ${FR.cy + (-PH / 2 + 100) * FR.s}`} stroke={C.gold} strokeOpacity={0.8} strokeWidth={1.5} strokeDasharray="5 8" fill="none" pathLength={1} />
							<circle cx={FR.cx + (PW / 2 - 6) * FR.s} cy={FR.cy + (-PH / 2 + 100) * FR.s} r={6} fill={C.gold} />
						</g>
						{crumbs.map(([x, y, r, o], i) => <circle key={i} cx={x} cy={y} r={r} fill="#e2b866" opacity={o} />)}
					</g>
				)}
				{t >= 13.44 && (ang > Math.PI / 2 && ang < 1.5 * Math.PI || ang >= 1.5 * Math.PI ? (
					<Coin x={cx} y={cy} r={cr} ang={ang} grade={toStill} />
				) : (
					<g transform={`translate(${cx} ${cy}) scale(${Math.max(0.03, Math.abs(Math.cos(ang)))} 1) translate(${-cx} ${-cy})`}><Bread x={cx} y={cy} r={cr} bite={1} id="d2" /></g>
				))}
			</svg>
			<div style={{position: 'absolute', left: 1330 - 400, width: 800, top: 640, textAlign: 'center', ...riseStyle(link * (1 - exit(t, 13.3, 0.3)))}}>
				<div style={{display: 'inline-block', padding: '6px 28px', borderRadius: 40, background: 'rgba(10,10,11,0.5)', boxShadow: '0 0 34px 18px rgba(10,10,11,0.5)'}}>
					<div style={{fontFamily: SANS, fontSize: 54, fontWeight: 800, color: C.ink}}>老板画的饼</div>
					<div style={{fontFamily: SANS, fontSize: 40, fontWeight: 600, color: C.mute, marginTop: 6, ...riseStyle(enter(t, 11.6))}}>到账：¥0　·　先咬了一口</div>
				</div>
			</div>
			{t >= DROP - 0.2 && <TitleD t={t} />}
		</AbsoluteFill>
	);
};

/* title on the drop: the still takes over the 2D coin exactly; title words land; no flash */
export const TitleD: React.FC<{t: number}> = ({t}) => {
	const u = t - DROP;
	const settle = mix(ramp(u, 0, 0.4, E.ENTER), 1.03, 1.0) * mix(ramp(u, 0.4, 4.1, E.LIN), 1, 1.04);
	const r1 = enter(u, 0.0, 0.5), r2 = enter(u, 0.18, 0.55), r3 = enter(u, 0.5, 0.6);
	const out = exit(t, 20.45, 0.35); // T2: the title leaves upward
	const img = ramp(t, DROP - 0.2, DROP + 0.2, E.MOVE) * (1 - ramp(t, 20.45, 20.95, E.EXIT));
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{opacity: img, transform: `scale(${settle})`, transformOrigin: `${MEDAL.x}px ${MEDAL.y}px`}}>
				<Img src={staticFile('ep26/medal.png')} style={{width: W, height: H}} />
			</AbsoluteFill>
			{/* a glint sweeps across the gold after the drop */}
			<AbsoluteFill style={{opacity: img, transform: `scale(${settle})`, transformOrigin: `${MEDAL.x}px ${MEDAL.y}px`, clipPath: `ellipse(430px 456px at ${MEDAL.x}px ${MEDAL.y}px)`, mixBlendMode: 'screen'}}>
				<div style={{position: 'absolute', top: -200, height: 1500, width: 220, left: mix(ramp(u, 0.25, 1.4, E.MOVE), -300, 1100), transform: 'rotate(22deg)', background: 'linear-gradient(90deg, rgba(255,240,200,0) 0%, rgba(255,240,200,0.55) 50%, rgba(255,240,200,0) 100%)', filter: 'blur(6px)'}} />
			</AbsoluteFill>
			<div style={{position: 'absolute', left: 900, top: 330, width: 960, textAlign: 'center', opacity: 1 - out, transform: `translateY(${-60 * out}px)`}}>
				<div style={{fontFamily: SERIF, fontWeight: 900, fontSize: 116, lineHeight: 1.2, color: C.ink, ...riseStyle(r1, true, 40)}}>画饼，</div>
				<div style={{fontFamily: SERIF, fontWeight: 900, fontSize: 116, lineHeight: 1.2, color: C.gold, ...riseStyle(r2, true, 40)}}>到底有没有用？</div>
				<div style={{width: 520, height: 1.5, background: C.line, margin: '34px auto 26px', transform: `scaleX(${r3})`}} />
				<div style={{fontFamily: SANS, fontSize: 38, fontWeight: 600, color: C.mute, letterSpacing: '0.1em', ...riseStyle(r3)}}>2026 诺贝尔经济学奖 · 霍尔 & 伍德福德</div>
			</div>
		</AbsoluteFill>
	);
};
