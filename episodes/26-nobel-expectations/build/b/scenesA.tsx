import React from 'react';
import {interpolate} from 'remotion';
import {Phone, AppScreen, Banner, T as T0} from '../Open26';
import {C, W, H, SANS, SERIF, NUM} from './kit';
import {E, ramp, mix, enter, exit, env, land, slam, riseStyle, riseT, drift, Cam} from './motion';
import {SL, Plate2, HL} from './ui';
import {Bread} from './OpenB';
import {City, CITY_W, Bond, Stack, CoinDefs, Slip, SlipDefs, Lectern, Towers, Note, Brick, Net, CRIMSON, PAPER, INKB} from './props';
import L from '../ep26v4_lines.json';

/* ep26 v3 · scenes 20.45–99 s: Hall → phone → city → Europe loop → ECB/Draghi → (vault/ledger in scenesB) → loop "why" */
const lines = L as {start: number; end: number; text: string}[];
export const st = (n: number) => lines[n - 1].start;
const PW = 400, PH = 820;

/* ---------- the window the phone dives into (T4) and comes back out of (T16) ---------- */
export const W0 = (() => {
	let best = 0, bd = 1e9;
	CITY_W.forEach((w, i) => { if (w.w === 20 && w.d < bd) { bd = w.d; best = i; } });
	return best;
})();
export const W0C = {x: CITY_W[W0].x + 10, y: CITY_W[W0].y + 15};

/* phone screen for line 12: the order is "明年" itself */
const AppNext: React.FC = () => (
	<div style={{position: 'absolute', inset: 0, background: '#f4efe7', fontFamily: SANS}}>
		<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 150, background: 'linear-gradient(180deg,#f06a45,#e8553a)'}} />
		<div style={{position: 'absolute', left: 26, top: 66, fontSize: 34, fontWeight: 900, color: '#fff'}}>今晚吃点啥</div>
		<div style={{position: 'absolute', left: 18, right: 18, top: 190, height: 220, borderRadius: 22, background: '#fff', boxShadow: '0 0 0 3px #e8553a', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 18}}>
			<div style={{width: 120, height: 132, borderRadius: 12, overflow: 'hidden', background: '#f6efe0', boxShadow: '0 4px 10px rgba(0,0,0,0.15)', flexShrink: 0}}>
				<div style={{height: 36, background: '#c94b35', color: '#fff', fontSize: 22, fontWeight: 800, textAlign: 'center', lineHeight: '36px'}}>2027</div>
				<div style={{fontFamily: SERIF, fontSize: 40, fontWeight: 900, color: '#3a2a1a', textAlign: 'center', marginTop: 18}}>明年</div>
			</div>
			<div>
				<div style={{fontSize: 30, fontWeight: 800, color: '#1d1d1d'}}>牛排套餐</div>
				<div style={{fontSize: 42, fontWeight: 900, color: '#e8553a', marginTop: 8}}>¥58</div>
			</div>
		</div>
		<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 120, background: '#1f1f1f', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
			<div style={{color: '#fff', fontSize: 26, fontWeight: 800, background: '#e8553a', borderRadius: 34, padding: '14px 26px'}}>去结算 · 花的是明年的钱</div>
		</div>
	</div>
);

/* ===================== Hall 20.45–38.4 ===================== */
export const Hall: React.FC<{t: number}> = ({t}) => {
	if (t < 20.45 || t > 38.5) return null;
	const x0 = 160, x1 = 1760, yb = 700, xN = 560, xP = 1360, lo = 600, hi = 370;
	const sx = mix(ramp(t, 20.45, 20.95, E.MOVE), -80, 1990);
	const chartO = 1 - exit(t, 34.2, 0.45);
	const d = drift(t, 20.7, 1);
	// old belief
	const oldP = ramp(t, 21.4, 23.6, E.MOVE);
	const oldPts = (p: number) => {
		const xe = x0 + (x1 - x0) * p;
		const pts = [[x0, lo]];
		if (xe > xP) pts.push([xP, lo], [xP + 30, hi], [xe, hi]); else pts.push([xe, lo]);
		return pts.map((q) => q.join(',')).join(' ');
	};
	// Hall's data: a light band sweeps and leaves dots on the true step; the gold line draws through them
	const band = mix(ramp(t, st(9) + 0.3, st(9) + 2.3, E.MOVE), x0 - 60, x1 + 60);
	const dots = Array.from({length: 40}, (_, i) => {
		const x = x0 + 30 + (i * (x1 - x0 - 60)) / 39;
		const y = (x > xN + 15 ? hi : lo) + Math.sin(i * 2.3) * 16;
		return {x, y, o: t > st(9) ? Math.min(1, Math.max(0, (band - x) / 60)) : 0};
	});
	const realP = ramp(t, st(10), st(10) + 1.4, E.MOVE);
	const realPts = (p: number) => {
		const xe = x0 + (x1 - x0) * p;
		const pts = [[x0, lo]];
		if (xe > xN) pts.push([xN, lo], [xN + 30, hi], [xe, hi]); else pts.push([xe, lo]);
		return pts.map((q) => q.join(',')).join(' ');
	};
	const xA = ramp(t, st(10) + 1.0, st(10) + 1.15, E.MOVE), xB = ramp(t, st(10) + 1.15, st(10) + 1.3, E.MOVE);
	// line 11: the boss's banner lands on 今天; the jump pulses once
	const bl = land(t, st(11) + 0.1);
	const pulse = ramp(t, st(11) + 0.5, st(11) + 1.1, E.ENTER);
	// T3: banner flies into the phone; the phone assembles around it
	const fly = ramp(t, 34.1, 34.9, E.MOVE);
	const phoneIn = ramp(t, 34.45, 35.0, E.ENTER);
	const ph = {cx: 960, cy: 500, s: 1.05};
	const bannerChart = {x: xN, y: 236, s: 1.25};
	const bannerPhone = {x: ph.cx, y: ph.cy + (-PH / 2 + 14 + 44 + 45) * ph.s, s: ph.s};
	const bx = mix(fly, bannerChart.x, bannerPhone.x), by = mix(fly, bannerChart.y, bannerPhone.y) - Math.sin(fly * Math.PI) * 80, bs = mix(fly, bannerChart.s, bannerPhone.s);
	// T4: the phone shrinks into one city window
	const dive = ramp(t, 37.4, 38.4, E.CAM);
	const dS = mix(dive, ph.s, (20 * 2.0) / PW);
	const dX = mix(dive, ph.cx, W0C.x), dY = mix(dive, ph.cy, W0C.y);
	const phoneO = (1 - ramp(t, 38.1, 38.4, E.EXIT));
	return (
		<>
			<Cam x={d.x} y={d.y} s={d.s} o={chartO}>
				<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
					<defs>
						<linearGradient id="streak" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={C.gold} stopOpacity={0} /><stop offset="0.85" stopColor="#fff1c8" stopOpacity={1} /><stop offset="1" stopColor="#fff1c8" stopOpacity={0} /></linearGradient>
						<linearGradient id="bandG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={C.gold} stopOpacity={0} /><stop offset="0.5" stopColor={C.gold} stopOpacity={0.28} /><stop offset="1" stopColor={C.gold} stopOpacity={0} /></linearGradient>
					</defs>
					{/* axis, drawn by the streak */}
					<line x1={x0} x2={Math.min(x1, sx)} y1={yb} y2={yb} stroke={C.gold} strokeOpacity={0.55} strokeWidth={2} />
					{t < 21.1 && <rect x={sx - 420} y={yb - 2} width={440} height={4} fill="url(#streak)" style={{filter: 'drop-shadow(0 0 18px rgba(241,197,109,0.9))'}} />}
					{[[xN, '今天', '听说要涨工资'], [xP, '明年', '钱真正到账']].map(([x, a, b], k) => {
						const p = enter(t, 20.95 + k * 0.08, 0.6);
						return (
							<g key={a as string} opacity={Math.min(1, p / 0.6)} transform={riseT(p)}>
								<line x1={x as number} x2={x as number} y1={yb} y2={280} stroke={C.gold} strokeOpacity={0.22} strokeDasharray="4 8" />
								<circle cx={x as number} cy={yb} r={10} fill={C.gold} />
								<text x={x as number} y={yb + 84} textAnchor="middle" style={{fontFamily: SANS, fontSize: 72, fontWeight: 900}} fill={C.ink}>{a as string}</text>
								<text x={x as number} y={yb + 136} textAnchor="middle" style={{fontFamily: SANS, fontSize: 40, fontWeight: 700}} fill={C.mute}>{b as string}</text>
							</g>
						);
					})}
					<g opacity={enter(t, 21.0)}><SL x={x0} y={lo + 70} text="你花的钱" size={44} anchor="start" col={C.mute} weight={700} /></g>
					<g opacity={env(t, 20.95, st(9) - 0.2)} transform={riseT(enter(t, 20.95))}><Plate2 x={x0} y={170} name="以前的经济学家" sub="教科书上的说法" /></g>
					<polyline points={oldPts(oldP)} fill="none" stroke="#9a9184" strokeWidth={6} strokeDasharray="16 12" opacity={t < 21.4 ? 0 : 1} />
					<g opacity={enter(t, st(8) + 0.8)} transform={riseT(enter(t, st(8) + 0.8))}><SL x={xP + 40} y={hi - 40} text="以前以为：到账才多花" size={44} anchor="start" col="#c9bfac" /></g>
					{/* Hall's check */}
					{t > st(9) + 0.3 && t < st(10) + 0.4 && <rect x={band - 60} y={250} width={120} height={yb - 250} fill="url(#bandG)" />}
					{dots.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={5} fill={C.gold} opacity={p.o * 0.8} />)}
					<g opacity={env(t, st(9), 1e9)} transform={riseT(enter(t, st(9)))}><Plate2 x={x1} y={170} name="霍尔 · 斯坦福大学" sub="1978 年 · 用真实消费数据检验" anchor="end" /></g>
					<polyline points={realPts(realP)} fill="none" stroke={C.gold} strokeWidth={9} strokeLinejoin="round" opacity={t < st(10) ? 0 : 1} style={{filter: 'drop-shadow(0 0 12px rgba(226,194,127,0.7))'}} />
					<line x1={xP - 40} x2={mix(xA, xP - 40, xP + 70)} y1={hi - 20} y2={mix(xA, hi - 20, lo + 30)} stroke={C.red} strokeWidth={9} strokeLinecap="round" opacity={xA > 0 ? 1 : 0} />
					<line x1={xP + 70} x2={mix(xB, xP + 70, xP - 40)} y1={hi - 20} y2={mix(xB, hi - 20, lo + 30)} stroke={C.red} strokeWidth={9} strokeLinecap="round" opacity={xB > 0 ? 1 : 0} />
					<g opacity={enter(t, st(10) + 1.3)} transform={riseT(enter(t, st(10) + 1.3))}><SL x={xP} y={yb - 40} text="到账这天：不变" size={44} /></g>
					<circle cx={xN + 15} cy={(lo + hi) / 2} r={60 + 90 * pulse} fill="none" stroke={C.gold} strokeWidth={4} opacity={pulse > 0 ? 1 - pulse : 0} />
					<g opacity={enter(t, st(11) + 0.4)} transform={riseT(enter(t, st(11) + 0.4))}><SL x={xN + 90} y={hi + 110} text="听说那天，就变了" size={64} anchor="start" col={C.gold} weight={900} /></g>
				</svg>
			</Cam>
			{/* the boss's banner: lands on 今天, then flies into the phone (T3) */}
			{t > st(11) && t < 35.0 && (
				<div style={{position: 'absolute', left: bx - 186, top: by - 60, width: 372, height: 120, transform: `scale(${bs}) translateY(${(1 - Math.min(1, bl)) * -200}px)`, opacity: Math.min(1, bl * 2)}}>
					<Banner y={0} light />
				</div>
			)}
			{/* the phone: line 12 (以后), then dives into a window (T4) */}
			{t > 34.4 && (
				<div style={{position: 'absolute', left: dX - PW / 2, top: dY - PH / 2, opacity: Math.min(1, phoneIn / 0.6) * phoneO, transform: `scale(${dS * mix(phoneIn, 0.94, 1)})`, transformOrigin: '50% 50%'}}>
					<Phone>
						<AppNext />
						{t > 34.85 && <Banner y={44} light />}
					</Phone>
				</div>
			)}
		</>
	);
};

/* ===================== City 37.4–49.7 ===================== */
export const CityScene: React.FC<{t: number}> = ({t}) => {
	if (t < 37.4 || t > 49.8) return null;
	const appear = ramp(t, 37.4, 38.6, E.CAM);
	const s = mix(ramp(t, 37.5, 44.5, E.CAM), 2.2, 1.0) * mix(ramp(t, 44.5, 49.0, E.LIN), 1, 0.97);
	const lit = mix(ramp(t, st(13), st(14) + 1.6, E.MOVE), 0.1, 0.6);
	const ripple = t > st(16) + 0.35 ? mix(ramp(t, st(16) + 0.35, st(16) + 1.25, E.MOVE), 0, 1800) : -1;
	const outR = t > 48.3 ? mix(ramp(t, 48.3, 49.0, E.CAM), 2600, 0) : 1e9;
	const bnr = land(t, st(15) + 0.15);
	const bnrOut = exit(t, 48.3, 0.35);
	const roll = ramp(t, st(16), st(16) + 0.3, E.MOVE);
	return (
		<>
			<Cam s={s} fx={W0C.x} fy={W0C.y} o={appear}>
				<svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
					<City lit={lit} outR={outR} ripple={ripple} force={W0} />
				</svg>
			</Cam>
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				<g opacity={env(t, st(13) + 0.3, st(14) - 0.3)} transform={riseT(enter(t, st(13) + 0.3))}><SL x={960} y={130} text="每扇亮着的窗，都有一个看手机的人" size={52} /></g>
				<g opacity={env(t, st(14) + 0.3, st(15) - 0.3)} transform={riseT(enter(t, st(14) + 0.3))}><SL x={960} y={140} text="几亿人，同一个「以后」" size={72} col={C.gold} weight={900} /></g>
			</svg>
			{/* one banner: 老板 → 管着全国钱的人 (rolls, no typing dots) */}
			{t > st(15) && (
				<div style={{position: 'absolute', left: 960 - 330, top: 70, width: 660, opacity: Math.min(1, bnr * 2) * (1 - bnrOut), transform: `translateY(${(1 - Math.min(1, bnr)) * -160 - 40 * bnrOut}px)`}}>
					<div style={{borderRadius: 32, padding: '20px 26px', background: 'rgba(250,250,250,0.96)', display: 'flex', gap: 20, alignItems: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.55)'}}>
						<div style={{position: 'relative', width: 80, height: 80, flexShrink: 0}}>
							<div style={{position: 'absolute', inset: 0, borderRadius: 20, background: 'linear-gradient(160deg,#5b8cff,#3a5fd0)', opacity: 1 - roll}} />
							<div style={{position: 'absolute', inset: 0, borderRadius: 40, background: 'radial-gradient(circle at 35% 30%,#f6dfa6,#b98a3c)', opacity: roll, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SERIF, fontSize: 44, fontWeight: 900, color: '#5a3e10'}}>¥</div>
						</div>
						<div style={{flex: 1, fontFamily: SANS, color: '#161616'}}>
							<div style={{height: 46, overflow: 'hidden', fontSize: 36, fontWeight: 900}}>
								<div style={{transform: `translateY(${-46 * roll}px)`}}><div style={{height: 46}}>老板</div><div style={{height: 46}}>管着全国钱的人</div></div>
							</div>
							<div style={{fontSize: 40, fontWeight: 800, marginTop: 4}}>{roll < 0.5 ? '明年给你涨工资' : '明年……'}</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

/* ===================== Europe loop: 49.0–63.9 (forming), 73.0–76.9 (calm), 86.4–99.0 (why it stopped) ===================== */
const CX = 960, CY = 420, RX = 610, RY = 300;
const ang = [-Math.PI / 2, 0, Math.PI / 2, Math.PI];
const pt = (a: number, k = 1) => [CX + RX * k * Math.cos(a), CY + RY * k * Math.sin(a)];
const arc = (a0: number, a1: number) => 'M' + Array.from({length: 31}, (_, i) => pt(a0 + ((a1 - a0) * i) / 30).map((v) => v.toFixed(1)).join(' ')).join(' L');
export const Loop: React.FC<{t: number}> = ({t}) => {
	const formP = t >= 49.0 && t <= 63.95, calmP = t >= 73.0 && t <= 77.25, whyP = t >= 86.4 && t <= 99.05;
	if (!formP && !calmP && !whyP) return null;
	const calm = t >= 73.0, why = t >= 86.4;
	// camera
	let cam = {x: 0, y: 0, s: 1, r: 0, o: 1, br: 1};
	if (formP) {
		const push = ramp(t, st(17), st(17) + 2.5, E.CAM);
		const rot = ramp(t, st(20), 63.0, E.CAM);
		const back = ramp(t, 62.9, 63.9, E.CAM);
		cam = {x: 0, y: mix(back, 0, 180), s: mix(push, 1, 1.06) * mix(back, 1, 0.75), r: 4 * rot, o: 1 - ramp(t, 63.2, 63.9, E.EXIT), br: 1};
	} else if (calmP) {
		const inn = ramp(t, 73.0, 73.8, E.CAM), side = ramp(t, 73.9, 74.6, E.CAM), outT = ramp(t, 76.2, 77.2, E.CAM);
		cam = {x: mix(inn, 2200, 0) + mix(side, 0, -400) + mix(outT, 0, 2300), y: 0, s: mix(side, 1, 0.8), r: 0, o: 1, br: 1};
	} else {
		const inn = ramp(t, 86.4, 87.4, E.CAM), push = ramp(t, st(30), st(30) + 2.2, E.CAM), back = ramp(t, st(33), st(33) + 2.2, E.CAM);
		const wipe = ramp(t, 98.2, 99.0, E.CAM);
		cam = {x: mix(inn, 2200, 0), y: 0, s: mix(push, 1, 1.08) * mix(back, 1, 0.92), r: 0, o: 1 - ramp(t, 98.6, 99.0, E.EXIT), br: mix(wipe, 1, 0.15)};
	}
	// forming
	const pool = ramp(t, 49.0, 49.7, E.CAM);
	const drop = land(t, 49.25);
	const stamps = [0, 1, 2, 3, 4].map((i) => (t < st(18) + 0.3 + i * 0.506 ? 0 : 1 - (slam(t, st(18) + 0.3 + i * 0.506).s - 1) * 4));
	const slips = [enter(t, st(18) + 0.1, 0.7), enter(t, st(18) + 1.0, 0.7), enter(t, st(19) + 0.08, 0.7), enter(t, st(20) + 0.07, 0.7)];
	const draw = [ramp(t, st(18) + 1.0, st(18) + 1.6), ramp(t, st(19) + 0.2, st(19) + 0.8), ramp(t, st(20) + 0.2, st(20) + 0.8), ramp(t, st(20) + 0.8, st(20) + 1.4)];
	const flowStart = st(20) + 1.4;
	const fearUp = ramp(t, st(20), st(21) + 1.5, E.CAM);
	const calmK = calm ? ramp(t, st(26), st(26) + 1.4, E.CAM) : 0;
	const fear = calm ? 0 : fearUp;
	// dash flow: accelerate while forming; crawl when calm; decelerate to zero on line 33
	const flow = t < flowStart ? 0 : !calm ? (t - flowStart) ** 2 * 220 : !why ? 300 + (t - 73) * mix(calmK, 120, 30) : 400 + 30 * Math.min(t - 86.4, st(33) - 86.4) + 30 * 2 * ramp(t, st(33), st(33) + 2, E.ENTER);
	const arcCol = calm ? '#8f877a' : `rgb(${196 + 30 * fear},${80 - 20 * fear},${61 - 20 * fear})`;
	const headO = calm ? (why ? 1 - ramp(t, st(33), st(33) + 2) : 0.5) : 1;
	// lenders' coins: leave the light on "不敢借", come back when calm, fully with 信
	const away = ramp(t, st(19) + 0.3, st(19) + 1.6, E.MOVE) * (1 - 0.5 * calmK) * (why ? 1 - ramp(t, st(31) + 0.2, st(31) + 1.0, E.MOVE) : 1);
	const xin = why ? [0, 1, 2, 3].map((i) => enter(t, st(31) + i * 0.09, 0.5)) : [0, 0, 0, 0];
	// the 饼 on the bond (lands by T8 at 73.82), becomes the net on line 32
	const bingO = calm ? (t < 73.82 ? 0 : 1) * (why ? 1 - ramp(t, st(32) + 0.1, st(32) + 0.7, E.EXIT) : 1) : 0;
	const netP = why ? ramp(t, st(32) + 0.2, st(32) + 1.0, E.MOVE) : 0;
	const bondDrop = why ? land(t, st(32) + 0.9, {damping: 9, stiffness: 140}) : 0;
	const sag = 18 + 12 * Math.sin(Math.min(1, bondDrop) * Math.PI);
	const bondY = CY + (1 - drop) * -30 + 20 * Math.min(1.15, bondDrop);
	const bottomText = why && t >= st(31) ? '大家信了：它真会出手' : calm && t >= st(26) + 0.3 ? '大家不慌了' : '大家怕，不敢借';
	const bottomCol = why && t >= st(31) ? '#8a5a12' : calm ? INKB : '#9a2e1e';
	const flip3 = calm ? ramp(t, st(26) + 0.2, st(26) + 0.6, E.MOVE) : 0;
	const others = formP ? enter(t, st(21), 0.7) : 0;
	const tagO = formP ? env(t, 49.4, st(21) - 0.2) : 0;
	const spread = calmP ? ramp(t, st(26) + 0.4, st(26) + 1.4, E.MOVE) : 0;
	const panelO = calmP ? env(t, st(26) + 0.1, 76.2) : 0;
	return (
		<>
			{/* the key-light pool on the table, grown from the last lit window (T6); crimson fear pool under it */}
			<svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: cam.o, filter: `brightness(${cam.br})`, transform: `translateX(${cam.x}px)`}}>
				<defs>
					<radialGradient id="pool"><stop offset="0" stopColor="#3a2a16" stopOpacity={0.9} /><stop offset="1" stopColor="#3a2a16" stopOpacity={0} /></radialGradient>
					<radialGradient id="fearPool"><stop offset="0" stopColor={CRIMSON} stopOpacity={0.45} /><stop offset="1" stopColor={CRIMSON} stopOpacity={0} /></radialGradient>
					<radialGradient id="trustPool"><stop offset="0" stopColor="#ffcf7a" stopOpacity={0.3} /><stop offset="1" stopColor="#ffcf7a" stopOpacity={0} /></radialGradient>
				</defs>
				<ellipse cx={formP ? mix(pool, W0C.x, CX) : CX} cy={formP ? mix(pool, W0C.y, CY + 40) : CY + 40} rx={formP ? mix(pool, 12, 820) : 820} ry={formP ? mix(pool, 12, 520) : 520} fill="url(#pool)" />
				<ellipse cx={CX} cy={CY + 120} rx={900} ry={480} fill="url(#fearPool)" opacity={fear} />
				{why && <ellipse cx={CX} cy={CY + 80} rx={800} ry={460} fill="url(#trustPool)" opacity={ramp(t, st(31), st(31) + 1.2, E.CAM)} />}
			</svg>
			<Cam x={cam.x} y={cam.y} s={cam.s} r={cam.r} fx={CX} fy={CY} o={cam.o} filter={cam.br < 1 ? `brightness(${cam.br})` : undefined}>
				<svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
					<CoinDefs />
					<SlipDefs />
					{/* the rest of Europe, faint, outside the loop */}
					<g opacity={others * 0.4}>
						<Bond x={150} y={250} s={0.32} name="意大利" id="it" />
						<Bond x={1780} y={300} s={0.32} name="葡萄牙" id="pt" />
						<Bond x={1770} y={760} s={0.3} name="希腊" id="gr" />
					</g>
					{/* safety net (line 32) */}
					{netP > 0 && <Net x={CX} y={CY + 190} sag={sag} p={netP} />}
					<Bond x={CX} y={bondY} s={0.85 * mix(drop, 0.97, 1)} name="西班牙" stamps={stamps} id="es" nameShift={calm ? mix(ramp(t, 73.6, 74.2, E.MOVE), 0, 150) : 0} o={formP ? Math.min(1, pool * 2) : 1} />
					{bingO > 0 && (
						<g opacity={bingO} transform={`translate(0 ${why ? 160 * ramp(t, st(32) + 0.1, st(32) + 0.7, E.MOVE) : 0})`}>
							<Bread x={CX - 170} y={CY - 10} r={120} id="lb" />
							<text x={CX - 170} y={CY + 8} textAnchor="middle" style={{fontFamily: SERIF, fontSize: 54, fontWeight: 900}} fill="#4a2a10">我来借</text>
						</g>
					)}
					{/* arcs between the slips */}
					{[0, 1, 2, 3].map((k) => {
						const a0 = ang[k] + 0.34, a1 = ang[k] + Math.PI / 2 - 0.34;
						const d = arc(a0, a1);
						const [ex, ey] = pt(a1), [px, py] = pt(a1 - 0.04);
						const deg = (Math.atan2(ey - py, ex - px) * 180) / Math.PI;
						const dk = calm ? 1 : draw[k];
						return dk > 0 && (
							<g key={k}>
								<path d={d} fill="none" stroke={arcCol} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray={`${dk} 1`} />
								{t > flowStart && <path d={d} fill="none" stroke="#fff4e0" strokeOpacity={0.7 * headO} strokeWidth={4} strokeDasharray="14 90" strokeDashoffset={-flow} strokeLinecap="round" />}
								{dk > 0.97 && <polygon points="-4,-15 26,0 -4,15" fill={arcCol} transform={`translate(${ex} ${ey}) rotate(${deg})`} />}
							</g>
						);
					})}
					{/* slips */}
					{['旧债到期', '得借新钱来还', '', '更还不上'].map((txt, k) => {
						if (k === 2) return null;
						const [x, y] = pt(ang[k], k === 0 ? 1.0 : 1);
						const p = calm ? 1 : slips[k];
						return <Slip key={k} x={x} y={y} text={txt} rot={[-2, 2, 0, -3][k]} o={Math.min(1, p / 0.6)} dy={(1 - p) * 40} col={calm ? '#5a4a3a' : k === 3 ? '#9a2e1e' : '#2e1f12'} />;
					})}
					{(() => {
						const [x, y] = pt(ang[2]);
						const p = calm ? 1 : slips[2];
						return (
							<g>
								<g opacity={1 - flip3}><Slip x={x} y={y} text="大家怕，不敢借" rot={1.5} o={Math.min(1, p / 0.6)} dy={(1 - p) * 40} col="#9a2e1e" /></g>
								<g opacity={flip3} transform={`translate(0 ${(1 - flip3) * 30})`}><Slip x={x} y={y} text={bottomText} rot={1.5} col={bottomCol} /></g>
							</g>
						);
					})()}
					{/* lenders */}
					{[-1, 1].map((sd) => [0, 1].map((j) => {
						const bx = CX + sd * (470 + j * 130 + away * 200), by = CY + RY + 40 + j * 30;
						const lit = Math.max(0.15, 1 - Math.abs(bx - CX) / 1100);
						return (
							<g key={`${sd}${j}`} opacity={formP ? slips[2] : 1}>
								<Stack x={bx} y={by} lit={lit} />
								{why && <text x={bx} y={by - 150} textAnchor="middle" style={{fontFamily: SERIF, fontSize: 56, fontWeight: 900}} fill={C.gold} opacity={xin[(sd + 1) + j] * 1} transform={`translate(0 ${(1 - xin[(sd + 1) + j]) * 24})`}>信</text>}
							</g>
						);
					}))}
					{why && netP > 0 && <g opacity={enter(t, st(32) + 1.0)} transform={riseT(enter(t, st(32) + 1.0))}><SL x={CX + 520} y={CY + 290} text="有人兜底" size={56} col={C.gold} /></g>}
				</svg>
			</Cam>
			<svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: cam.o}}>
				<g opacity={tagO}><SL x={80} y={880} text="2012 · 欧洲" size={40} anchor="start" col={C.mute} weight={700} /></g>
				{why && <g opacity={enter(t, st(33) + 0.5)} transform={riseT(enter(t, st(33) + 0.5))}><SL x={1520} y={200} text="漩涡停了" size={80} col={C.gold} serif weight={900} /></g>}
				{/* the spread (facts row 14): 6 个多点 → 不到 3 个点 */}
				{panelO > 0 && (
					<g opacity={panelO} transform={riseT(enter(t, st(26) + 0.1))}>
						<rect x={1330} y={250} width={560} height={420} rx={30} fill="#0a0a0b" opacity={0.5} style={{filter: 'blur(20px)'}} />
						<text x={1370} y={320} style={{fontFamily: SANS, fontSize: 44, fontWeight: 800}} fill={C.ink}>西班牙借钱</text>
						<text x={1370} y={380} style={{fontFamily: SANS, fontSize: 44, fontWeight: 800}} fill={C.ink}>比德国多付的利息</text>
						<rect x={1370} y={440} width={480} height={56} fill="none" stroke={C.mute} strokeDasharray="8 8" strokeOpacity={0.6} />
						<rect x={1370} y={440} width={mix(spread, 480, 220)} height={56} fill={spread < 0.5 ? CRIMSON : C.gold} opacity={0.9} />
						<text x={1370} y={590} style={{fontFamily: SANS, fontSize: 64, fontWeight: 900}} fill={spread < 0.5 ? C.red : C.gold}>{spread < 0.5 ? '6 个多点' : '不到 3 个点'}</text>
						<text x={1370} y={640} style={{fontFamily: SANS, fontSize: 32, fontWeight: 600}} fill={C.mute}>2012.7 → 2013.5</text>
					</g>
				)}
			</svg>
		</>
	);
};

/* ===================== ECB + Draghi's 饼: 62.9–74.0 ===================== */
export const LEC = {x: 1250, top: 640, bx: 1250, by: 330, br: 150};
export const Bank: React.FC<{t: number}> = ({t}) => {
	if (t < 62.9 || t > 74.0) return null;
	const rise = enter(t, 63.0, 1.2);
	const tilt = ramp(t, 63.2, 65.2, E.CAM);
	const outT = ramp(t, 73.0, 73.8, E.CAM);
	const camX = mix(outT, 0, -1400);
	const beats = Math.max(0, Math.floor((t - 63.25) / 0.506) + 1);
	const floors = Math.min(1, beats / 6) * (t > 63.25 ? 1 : 0);
	const notes = Array.from({length: 10}, (_, i) => {
		const a = st(23) + 0.2 + i * 0.07;
		const p = ramp(t, a, a + 0.75, E.MOVE);
		return {p, x: mix(p, 420, 820), y: mix(p, 860, 790 - i * 6) - Math.sin(p * Math.PI) * 160, r: mix(p, -20 + i * 4, 0)};
	});
	const brick = ramp(t, st(23) + 1.0, st(23) + 1.3, E.MOVE);
	const lect = enter(t, st(24) - 0.1, 0.7);
	const bRise = ramp(t, st(24) + 0.1, st(24) + 0.8, E.ENTER);
	const word = enter(t, st(25), 0.5);
	const inf = ramp(t, st(25) + 0.5, st(25) + 1.0, E.MOVE);
	return (
		<Cam x={camX} y={mix(tilt, 120, 0)}>
			<svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
				<defs>
					<radialGradient id="spot"><stop offset="0" stopColor="#ffd998" stopOpacity={0.35} /><stop offset="1" stopColor="#ffd998" stopOpacity={0} /></radialGradient>
				</defs>
				<g transform={`translate(0 ${(1 - rise) * 320})`} opacity={Math.min(1, rise / 0.4)}>
					<Towers x={170} y={900} floorsLit={floors} spec={0.5 + 0.5 * tilt} />
				</g>
				<g opacity={enter(t, 63.6)} transform={riseT(enter(t, 63.6))}><SL x={720} y={140} text="欧洲央行" size={64} anchor="start" /></g>
				{/* notes stream from the slot into a banded brick */}
				{t > st(23) + 0.2 && brick < 1 && notes.map((n, i) => n.p > 0 && <Note key={i} x={n.x} y={n.y} rot={n.r} s={0.8} />)}
				{brick > 0 && <g opacity={brick}><Brick x={820} y={790} s={0.9} /></g>}
				<g opacity={env(t, st(23) + 0.4, st(24) + 0.2)} transform={riseT(enter(t, st(23) + 0.4))}><SL x={820} y={640} text="能印钱" size={64} col={C.gold} weight={900} /></g>
				{/* the lectern in its own spot; the 饼 rises out of its light */}
				<g opacity={Math.min(1, lect / 0.6)} transform={riseT(lect, 40)}>
					<ellipse cx={LEC.x} cy={LEC.top + 120} rx={330} ry={260} fill="url(#spot)" />
					<Lectern x={LEC.x} y={LEC.top} />
				</g>
				{t > st(24) && t < 73.0 && (
					<g>
						<circle cx={LEC.bx} cy={LEC.by} r={260} fill="url(#spot)" opacity={bRise} />
						<g transform={`translate(0 ${(1 - bRise) * 220}) translate(${LEC.bx} ${LEC.by}) scale(${mix(bRise, 0.6, 1)}) translate(${-LEC.bx} ${-LEC.by})`} opacity={Math.min(1, bRise * 2)}>
							<Bread x={LEC.bx} y={LEC.by} r={LEC.br} id="dr" />
							<g opacity={word}>
								<text x={LEC.bx} y={LEC.by + 28} textAnchor="middle" style={{fontFamily: SERIF, fontSize: 76, fontWeight: 900}} fill="#fff3d0" opacity={0.5}>我来借</text>
								<text x={LEC.bx} y={LEC.by + 26} textAnchor="middle" style={{fontFamily: SERIF, fontSize: 76, fontWeight: 900}} fill="#4a2a10">我来借</text>
							</g>
						</g>
					</g>
				)}
				<g opacity={env(t, st(24) + 0.3, 73.0)} transform={riseT(enter(t, st(24) + 0.3))}><Plate2 x={LEC.x - 210} y={250} name="德拉吉 · 欧洲央行行长" sub="2012 年 7 月 · 伦敦" anchor="end" /></g>
				<g opacity={env(t, st(25) + 0.2, 73.0)} transform={riseT(enter(t, st(25) + 0.2))}>
					<SL x={LEC.x - 30} y={570} text="要多少，给多少 · 上限" size={52} />
					<path d={`M${LEC.x + 300} 553 c 18 -26 46 -26 46 0 s -28 26 -46 0 s -28 -26 -46 0 s 28 26 46 0`} stroke={C.gold} strokeWidth={6} fill="none" pathLength={1} strokeDasharray={`${inf} 1`} transform={`translate(28 0)`} />
				</g>
			</svg>
		</Cam>
	);
};
/** T8: the 饼 flies from the lectern onto Spain's bond (73.0–73.82) */
export const BingFlight: React.FC<{t: number}> = ({t}) => {
	if (t < 73.0 || t >= 73.82) return null;
	const p = ramp(t, 73.0, 73.8, E.MOVE);
	const x = mix(p, LEC.bx, CX - 170), y = mix(p, LEC.by, CY - 10) - Math.sin(p * Math.PI) * 140, r = mix(p, LEC.br, 120);
	return (
		<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
			<g transform={`rotate(${8 * p} ${x} ${y})`}>
				<Bread x={x} y={y} r={r} id="fl" />
				<text x={x} y={y + mix(p, 26, 18)} textAnchor="middle" style={{fontFamily: SERIF, fontSize: mix(p, 76, 54), fontWeight: 900}} fill="#4a2a10">我来借</text>
			</g>
		</svg>
	);
};
