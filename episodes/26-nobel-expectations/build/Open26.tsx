import React from 'react';
import {AbsoluteFill, Composition, Img, interpolate, registerRoot, spring, staticFile, useCurrentFrame, Easing} from 'remotion';
import {Sub, lineAt} from '../kf/common';
import lines from './ep26v4_open.json';

/* ep26 v4 · 试镜: the opening 0–20.7 s (hook + title on drop 1).
   Look: documentary night — warm near-black room, the phone is the only light source; gold for ideas (预期 / 饼). */
const W = 1920, H = 1080, FPS = 30;
const SANS = '"Noto Sans CJK SC", sans-serif';
const SERIF = '"Noto Serif CJK SC", serif';
const GOLD = '#f1c56d';
const ease = Easing.bezier(0.33, 0, 0.2, 1);
const lerp = (f: number, a: number, b: number, x: number, y: number, e = ease) => interpolate(f, [a, b], [x, y], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});
const T = {s2: 75, s3: 164, s4: 244, s5: 323, s6: 403, drop: 499, end: 622};

/* ---------- the room ---------- */
const Room: React.FC<{glow?: number; gx?: number; gy?: number}> = ({glow = 1, gx = 900, gy = 560}) => (
	<AbsoluteFill style={{background: '#070605'}}>
		<AbsoluteFill style={{background: `radial-gradient(1100px 760px at ${gx}px ${gy}px, rgba(70,52,32,${0.9 * glow}) 0%, rgba(30,22,14,0.9) 45%, #070605 100%)`}} />
	</AbsoluteFill>
);
const Grain: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<svg width={W} height={H} style={{position: 'absolute', inset: 0, mixBlendMode: 'overlay', opacity: 0.5}}>
			<filter id="grain">
				<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={f % 12} />
				<feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.22 0" />
			</filter>
			<rect width={W} height={H} filter="url(#grain)" />
		</svg>
	);
};
const Vignette = () => <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.65) 100%)'}} />;

/* ---------- the phone (generic UI, no real app) ---------- */
const PW = 400, PH = 820, SW = 372, SH = 792;
const Phone: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
	<div style={{position: 'absolute', width: PW, height: PH, borderRadius: 62, background: 'linear-gradient(160deg,#2b2b2e,#0d0d0f 40%,#18181b)', boxShadow: '0 40px 90px rgba(0,0,0,0.75), inset 0 0 0 2px #3a3a3e', ...style}}>
		<div style={{position: 'absolute', left: 14, top: 14, width: SW, height: SH, borderRadius: 50, overflow: 'hidden', background: '#000'}}>{children}</div>
		<div style={{position: 'absolute', left: PW / 2 - 55, top: 26, width: 110, height: 30, borderRadius: 16, background: '#000'}} />
	</div>
);
const StatusBar: React.FC<{dark?: boolean}> = ({dark}) => (
	<div style={{position: 'absolute', left: 30, right: 30, top: 18, display: 'flex', justifyContent: 'space-between', fontFamily: SANS, fontSize: 20, fontWeight: 700, color: dark ? '#1b1b1b' : '#f2f2f2'}}>
		<span>21:04</span>
		<span style={{letterSpacing: 2}}>●●● ▮</span>
	</div>
);
const Banner: React.FC<{y: number; o?: number; light?: boolean}> = ({y, o = 1, light}) => (
	<div style={{position: 'absolute', left: 14, right: 14, top: y, opacity: o, borderRadius: 26, padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'center',
		background: light ? 'rgba(250,250,250,0.96)' : 'rgba(58,62,74,0.82)', boxShadow: '0 10px 30px rgba(0,0,0,0.35)'}}>
		<div style={{width: 58, height: 58, borderRadius: 15, background: 'linear-gradient(160deg,#5b8cff,#3a5fd0)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
			<svg width={34} height={30} viewBox="0 0 34 30"><path d="M4 4 h26 a3 3 0 0 1 3 3 v13 a3 3 0 0 1 -3 3 h-15 l-7 6 v-6 h-4 a3 3 0 0 1 -3 -3 v-13 a3 3 0 0 1 3 -3z" fill="#fff" /></svg>
		</div>
		<div style={{flex: 1, fontFamily: SANS, color: light ? '#161616' : '#fff'}}>
			<div style={{display: 'flex', justifyContent: 'space-between', fontSize: 23, fontWeight: 800}}>
				<span>老板</span>
				<span style={{fontSize: 18, fontWeight: 500, opacity: 0.6}}>现在</span>
			</div>
			<div style={{fontSize: 31, fontWeight: 700, marginTop: 4}}>明年给你涨工资</div>
		</div>
	</div>
);
const LockScreen: React.FC<{wake: number; banner: number}> = ({wake, banner}) => (
	<div style={{position: 'absolute', inset: 0, opacity: wake, background: 'radial-gradient(120% 80% at 30% 10%, #2c3a5c 0%, #121726 55%, #090b12 100%)'}}>
		<StatusBar />
		<div style={{position: 'absolute', top: 92, width: '100%', textAlign: 'center', fontFamily: SANS, color: '#f4f4f4'}}>
			<div style={{fontSize: 24, fontWeight: 600, opacity: 0.85}}>10月12日 星期一</div>
			<div style={{fontSize: 118, fontWeight: 300, lineHeight: 1.05}}>21:04</div>
		</div>
		<Banner y={interpolate(banner, [0, 1], [-140, 300])} o={banner} />
	</div>
);

/* delivery app: generic, warm brand colour, no real logo */
const Dish: React.FC<{c1: string; c2: string}> = ({c1, c2}) => (
	<svg width={96} height={96} viewBox="0 0 96 96">
		<circle cx={48} cy={50} r={42} fill="#efe9df" />
		<circle cx={48} cy={50} r={33} fill={c1} />
		<circle cx={38} cy={42} r={9} fill={c2} />
		<circle cx={58} cy={56} r={8} fill={c2} />
		<circle cx={55} cy={38} r={5} fill="#7fae52" />
	</svg>
);
const AppScreen: React.FC<{f: number}> = ({f}) => {
	const tap = T.s2 + 34;
	const sel = lerp(f, tap, tap + 8, 0, 1);
	const total = Math.round(lerp(f, tap + 4, tap + 26, 26, 58));
	const ripple = f >= tap && f < tap + 18 ? (f - tap) / 18 : -1;
	const card = (y: number, name: string, desc: string, price: string, on: number, c1: string, c2: string) => (
		<div style={{position: 'absolute', left: 18, right: 18, top: y, height: 156, borderRadius: 22, background: '#fff', boxShadow: `0 0 0 ${3 * on}px #e8553a, 0 6px 18px rgba(0,0,0,0.08)`, display: 'flex', alignItems: 'center', padding: '0 18px', gap: 16}}>
			<Dish c1={c1} c2={c2} />
			<div style={{fontFamily: SANS, flex: 1}}>
				<div style={{fontSize: 27, fontWeight: 800, color: '#1d1d1d', whiteSpace: 'nowrap'}}>{name}</div>
				<div style={{fontSize: 18, color: '#8a8a8a', marginTop: 4}}>{desc}</div>
				<div style={{fontSize: 40, fontWeight: 900, color: '#e8553a', marginTop: 6}}>{price}</div>
			</div>
			<div style={{width: 40, height: 40, borderRadius: 20, background: on > 0.5 ? '#e8553a' : '#eee', color: '#fff', fontFamily: SANS, fontSize: 26, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{on > 0.5 ? '✓' : ''}</div>
		</div>
	);
	return (
		<div style={{position: 'absolute', inset: 0, background: '#f4efe7'}}>
			<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 150, background: 'linear-gradient(180deg,#f06a45,#e8553a)'}} />
			<StatusBar />
			<div style={{position: 'absolute', left: 26, top: 66, fontFamily: SANS, fontSize: 34, fontWeight: 900, color: '#fff'}}>今晚吃点啥</div>
			<div style={{position: 'absolute', right: 20, top: 70, fontFamily: SANS, fontSize: 18, fontWeight: 700, color: '#fff', background: 'rgba(0,0,0,0.18)', borderRadius: 16, padding: '6px 12px'}}>余额 ¥1,286</div>
			{card(180, '番茄牛腩饭', '平时常点', '¥26', 1 - sel, '#c8572f', '#e9a23b')}
			{card(356, '牛排套餐', '配饮料和甜点', '¥58', sel, '#6b3a22', '#3b2416')}
			<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 108, background: '#1f1f1f', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 22px 10px'}}>
				<div style={{fontFamily: SANS, color: '#fff', fontSize: 22}}>合计 <span style={{fontSize: 36, fontWeight: 900, color: '#ffb199'}}>¥{total}</span></div>
				<div style={{fontFamily: SANS, color: '#fff', fontSize: 24, fontWeight: 800, background: '#e8553a', borderRadius: 30, padding: '12px 26px'}}>去结算</div>
			</div>
			{ripple >= 0 && <div style={{position: 'absolute', left: 300 - 60 * ripple, top: 430 - 60 * ripple, width: 120 * ripple + 10, height: 120 * ripple + 10, borderRadius: '50%', border: '4px solid rgba(232,85,58,0.7)', opacity: 1 - ripple}} />}
		</div>
	);
};

/* ---------- ideas in gold: the bubble and the 饼 ---------- */
const Bubble: React.FC<{x: number; y: number; r: number; o: number; label: number}> = ({x, y, r, o, label}) => (
	<g opacity={o}>
		<circle cx={x} cy={y} r={r * 1.9} fill="url(#halo)" />
		<circle cx={x} cy={y} r={r} fill="url(#bub)" stroke={GOLD} strokeOpacity={0.75} strokeWidth={2.5} />
		<ellipse cx={x - r * 0.35} cy={y - r * 0.42} rx={r * 0.32} ry={r * 0.16} fill="#fff" opacity={0.35} transform={`rotate(-30 ${x - r * 0.35} ${y - r * 0.42})`} />
		<text x={x} y={y + 22} textAnchor="middle" style={{fontFamily: SANS, fontSize: 64, fontWeight: 900}} fill={GOLD} opacity={label}>预期</text>
	</g>
);
/** a flatbread: golden crust, char marks, sesame; bite = 0..1 takes a bite from the upper right */
const Bing: React.FC<{x: number; y: number; r: number; o?: number; bite?: number; sx?: number}> = ({x, y, r, o = 1, bite = 0, sx = 1}) => {
	const seeds = Array.from({length: 26}, (_, i) => {
		const a = i * 2.39996, d = Math.sqrt((i + 0.5) / 26) * r * 0.78;
		return [x + Math.cos(a) * d, y + Math.sin(a) * d, (i * 47) % 180];
	});
	const bx = x + r * 0.78, by = y - r * 0.62;
	return (
		<g opacity={o} transform={`translate(${x} ${y}) scale(${sx} 1) translate(${-x} ${-y})`}>
			<defs>
				<radialGradient id="crust" cx="0.42" cy="0.38" r="0.7">
					<stop offset="0" stopColor="#f6cf7e" />
					<stop offset="0.55" stopColor="#d99a43" />
					<stop offset="0.9" stopColor="#9c5d22" />
					<stop offset="1" stopColor="#6e3d14" />
				</radialGradient>
				<mask id="bite">
					<rect x={x - r - 10} y={y - r - 10} width={2 * r + 20} height={2 * r + 20} fill="#fff" />
					{bite > 0 && [[0, 0, 0.36], [-0.3, 0.12, 0.2], [0.14, 0.32, 0.22]].map(([dx, dy, rr], i) => <circle key={i} cx={bx + dx * r} cy={by + dy * r} r={rr * r * bite} fill="#000" />)}
				</mask>
			</defs>
			<ellipse cx={x + 14} cy={y + r * 0.95} rx={r * 0.95} ry={r * 0.16} fill="#000" opacity={0.45} />
			<g mask="url(#bite)">
				<circle cx={x} cy={y} r={r} fill="url(#crust)" />
				<circle cx={x} cy={y} r={r * 0.86} fill="none" stroke="#7a4317" strokeOpacity={0.35} strokeWidth={r * 0.05} />
				{[-0.35, 0, 0.35].map((k, i) => <path key={i} d={`M${x - r * 0.55} ${y + k * r - r * 0.12} q ${r * 0.55} ${-r * 0.18} ${r * 1.1} 0`} stroke="#6b3812" strokeOpacity={0.4} strokeWidth={r * 0.06} fill="none" strokeLinecap="round" />)}
				{seeds.filter((_, i) => i % 3 === 1).map(([sx2, sy2, a], i) => <ellipse key={`g${i}`} cx={sx2 + r * 0.08} cy={sy2 + r * 0.05} rx={r * 0.045} ry={r * 0.025} fill="#5f8f3a" opacity={0.85} transform={`rotate(${a + 60} ${sx2} ${sy2})`} />)}
				{seeds.map(([sx2, sy2, a], i) => <ellipse key={i} cx={sx2} cy={sy2} rx={r * 0.035} ry={r * 0.018} fill="#fff4d6" opacity={0.9} transform={`rotate(${a} ${sx2} ${sy2})`} />)}
			</g>
		</g>
	);
};
/** 2D medal for the flip (the 3D medal takes over on the drop) */
const Medal2D: React.FC<{x: number; y: number; r: number; sx: number}> = ({x, y, r, sx}) => (
	<g transform={`translate(${x} ${y}) scale(${sx} 1) translate(${-x} ${-y})`}>
		<defs>
			<radialGradient id="gold2" cx="0.35" cy="0.3" r="0.8">
				<stop offset="0" stopColor="#fff0c2" />
				<stop offset="0.45" stopColor="#d9a64e" />
				<stop offset="1" stopColor="#7a5318" />
			</radialGradient>
		</defs>
		<circle cx={x} cy={y} r={r} fill="url(#gold2)" />
		<circle cx={x} cy={y} r={r * 0.92} fill="none" stroke="#7a5318" strokeOpacity={0.5} strokeWidth={4} />
		{[-1, 1].map((sd) => Array.from({length: 12}, (_, i) => {
			const a = Math.PI / 2 + sd * (0.4 + i * 0.19), lx = x + Math.cos(a) * r * 0.72, ly = y + Math.sin(a) * r * 0.72;
			return <ellipse key={`${sd}${i}`} cx={lx} cy={ly} rx={r * 0.09} ry={r * 0.035} fill="#8a5f1c" opacity={0.55} transform={`rotate(${(a * 180) / Math.PI + sd * 55} ${lx} ${ly})`} />;
		}))}
		<text x={x} y={y + r * 0.16} textAnchor="middle" style={{fontFamily: SERIF, fontSize: r * 0.42, fontWeight: 900}} fill="#7a5318" opacity={0.75}>2026</text>
	</g>
);

/* ---------- shots ---------- */
const Shot1: React.FC<{f: number}> = ({f}) => {
	const wake = lerp(f, 6, 14, 0, 1);
	const banner = spring({frame: f - 16, fps: FPS, config: {damping: 16, stiffness: 120}});
	const push = lerp(f, 0, T.s2, 1, 1.08, Easing.linear);
	return (
		<AbsoluteFill>
			<Room glow={0.35 + 0.65 * wake} gx={980} gy={560} />
			<AbsoluteFill style={{transform: `scale(${push})`}}>
				{/* table: dark wood under the phone, lit by the screen */}
				<div style={{position: 'absolute', left: -400, top: 380, width: 2800, height: 1400, transform: 'perspective(1600px) rotateX(58deg)', transformOrigin: '50% 0%',
					background: `radial-gradient(700px 500px at 1400px 300px, rgba(120,140,190,${0.28 * wake}), rgba(0,0,0,0) 70%), repeating-linear-gradient(92deg, #1a120b 0px, #22170e 7px, #170f09 15px, #1e140c 26px)`}} />
				<div style={{position: 'absolute', left: 760, top: 150, transform: 'perspective(1800px) rotateX(46deg) rotateZ(-16deg)', transformOrigin: '50% 50%'}}>
					<Phone>
						<LockScreen wake={wake} banner={banner} />
					</Phone>
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

const K = 1.12, PX = 360, PY = 40; // frontal phone position and scale (screen origin = PX+14K, PY+14K)
const Frontal: React.FC<{f: number}> = ({f}) => {
	const inS6 = f >= T.s6;
	const out = lerp(f, T.s6, T.s6 + 24, 0, 1);
	const enter = lerp(f, T.s2, T.s2 + 10, 0, 1);
	const banner = spring({frame: f - T.s4 - 4, fps: FPS, config: {damping: 16, stiffness: 120}});
	// bubble: rises from the 去结算 button at s3, becomes the 饼 at s4
	const bx0 = PX + (14 + SW - 90) * K, by0 = PY + (14 + SH - 50) * K;
	const rise = lerp(f, T.s3, T.s3 + 30, 0, 1);
	const bob = Math.sin((f - T.s3) / 14) * 8;
	const bX = interpolate(rise, [0, 1], [bx0, 1290]), bY = interpolate(rise, [0, 1], [by0, 400]) + bob * rise;
	const bR = interpolate(rise, [0, 1], [20, 150]);
	const morph = lerp(f, T.s4 + 2, T.s4 + 20, 0, 1);
	const bite = lerp(f, T.s5 + 14, T.s5 + 20, 0, 1, Easing.out(Easing.back(2)));
	// s6: 饼 to centre and flip into the medal
	const cx = lerp(f, T.s6, T.s6 + 30, 1290, 960), cy = lerp(f, T.s6, T.s6 + 30, 400 + bob, 450);
	const flipT = lerp(f, T.s6 + 30, T.drop - 6, 0, 1, Easing.inOut(Easing.cubic));
	const ang = flipT * Math.PI * 3; // one and a half turns
	const sx = Math.cos(ang);
	const showMedal = ang > Math.PI / 2;
	const grow = lerp(f, T.s6 + 30, T.drop, 170, 230);
	const crumbs = f >= T.s5 + 16 ? Array.from({length: 14}, (_, i) => {
		const t = (f - T.s5 - 16) / FPS;
		return [1290 + 120 + ((i * 37) % 60) - 30 + t * ((i % 5) - 2) * 30, 290 + ((i * 53) % 50) + t * t * 420 + t * 60, 3 + (i % 3) * 2, Math.max(0, 1 - t / 1.3)];
	}) : [];
	return (
		<AbsoluteFill>
			<Room glow={1} gx={PX + 200} gy={560} />
			{/* phone */}
			<div style={{position: 'absolute', left: PX - 220 * out, top: PY, opacity: enter * (1 - out * 0.85), transform: `scale(${K * (1 - 0.12 * out)})`, transformOrigin: '0 0'}}>
				<Phone>
					<AppScreen f={f} />
					<Banner y={interpolate(banner, [0, 1], [-140, 44])} o={banner} light />
				</Phone>
			</div>
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				<defs>
					<radialGradient id="halo"><stop offset="0" stopColor={GOLD} stopOpacity={0.35} /><stop offset="1" stopColor={GOLD} stopOpacity={0} /></radialGradient>
					<radialGradient id="bub" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stopColor="#fff6dc" stopOpacity={0.28} /><stop offset="0.7" stopColor={GOLD} stopOpacity={0.12} /><stop offset="1" stopColor={GOLD} stopOpacity={0.35} /></radialGradient>
					<radialGradient id="warm"><stop offset="0" stopColor="#ffcf7a" stopOpacity={0.4} /><stop offset="1" stopColor="#ffcf7a" stopOpacity={0} /></radialGradient>
				</defs>
				{f >= T.s2 + 40 && f < T.s3 + 12 && (
					<g opacity={lerp(f, T.s2 + 40, T.s2 + 50, 0, 1) * lerp(f, T.s3, T.s3 + 12, 1, 0)}>
						<text x={1060} y={430} style={{fontFamily: SANS, fontSize: 96, fontWeight: 900}} fill="#8f8674">¥26</text>
						<line x1={1055} x2={1250} y1={400} y2={400} stroke="#8f8674" strokeWidth={6} />
						<text x={1290} y={430} style={{fontFamily: SANS, fontSize: 96, fontWeight: 900}} fill="#8f8674">→</text>
						<text x={1420} y={440} style={{fontFamily: SANS, fontSize: 140, fontWeight: 900}} fill={GOLD}>¥58</text>
						<line x1={1060} x2={1700} y1={500} y2={500} stroke={GOLD} strokeOpacity={0.5} strokeWidth={1.5} />
						<text x={1060} y={565} style={{fontFamily: SANS, fontSize: 40, fontWeight: 700}} fill="#efe6d2">钱包余额 ¥1,286 · 一分没变</text>
					</g>
				)}
				{f >= T.s3 && f < T.s4 + 20 && <Bubble x={bX} y={bY} r={bR} o={(1 - morph) * lerp(f, T.s3, T.s3 + 6, 0, 1)} label={lerp(f, T.s3 + 22, T.s3 + 32, 0, 1)} />}
				{f >= T.s4 && !inS6 && (
					<g>
						<circle cx={1290} cy={400 + bob} r={300} fill="url(#warm)" opacity={morph} />
						<Bing x={1290} y={400 + bob} r={interpolate(morph, [0, 1], [120, 170])} o={morph} bite={bite} />
						{/* annotation: hairline from the 饼 to the boss's message */}
						<g opacity={lerp(f, T.s4 + 22, T.s4 + 34, 0, 1)}>
							<path d={`M${1290 - 180} ${400 + bob} L ${PX + (PW - 6) * K} ${PY + 100 * K}`} stroke={GOLD} strokeWidth={2} strokeDasharray="6 8" fill="none" />
							<circle cx={PX + (PW - 6) * K} cy={PY + 100 * K} r={7} fill={GOLD} />
							<text x={1290} y={640} textAnchor="middle" style={{fontFamily: SANS, fontSize: 46, fontWeight: 900}} fill={GOLD}>老板画的饼</text>
						</g>
						{crumbs.map(([x, y, r, o], i) => <circle key={i} cx={x} cy={y} r={r} fill="#d99a43" opacity={o} />)}
						{f >= T.s5 + 20 && (
							<g opacity={lerp(f, T.s5 + 24, T.s5 + 34, 0, 1)}>
								<rect x={1290 - 250} y={700} width={500} height={78} rx={39} fill="rgba(0,0,0,0.35)" stroke={GOLD} strokeWidth={2} />
								<text x={1290} y={752} textAnchor="middle" style={{fontFamily: SANS, fontSize: 38, fontWeight: 700}} fill="#efe6d2">余额 ¥1,286 · 一分没少</text>
							</g>
						)}
					</g>
				)}
				{inS6 && (
					<g>
						<circle cx={cx} cy={cy} r={grow * 2} fill="url(#warm)" />
						{!showMedal ? <Bing x={cx} y={cy} r={grow} sx={Math.max(0.02, Math.abs(sx))} bite={1} /> : <Medal2D x={cx} y={cy} r={grow} sx={Math.max(0.02, Math.abs(sx))} />}
					</g>
				)}
			</svg>
		</AbsoluteFill>
	);
};

const TitleShot: React.FC<{f: number}> = ({f}) => {
	const t = f - T.drop;
	const flash = lerp(t, 0, 6, 0.55, 0);
	const push = lerp(t, 0, T.end - T.drop, 1.0, 1.07, Easing.linear);
	const r1 = lerp(t, 2, 16, 0, 1), r2 = lerp(t, 8, 22, 0, 1), r3 = lerp(t, 18, 32, 0, 1);
	const fadeOut = lerp(f, T.end - 10, T.end, 1, 0);
	const sweep = lerp(t, 4, 60, -400, 2400, Easing.inOut(Easing.cubic));
	return (
		<AbsoluteFill style={{opacity: fadeOut, background: '#000'}}>
			<AbsoluteFill style={{transform: `scale(${push})`, transformOrigin: '25% 50%'}}>
				<Img src={staticFile('ep26/medal.png')} style={{width: W, height: H}} />
			</AbsoluteFill>
			<AbsoluteFill style={{background: `linear-gradient(105deg, rgba(255,230,170,0) ${sweep / 24 - 6}%, rgba(255,230,170,0.16) ${sweep / 24}%, rgba(255,230,170,0) ${sweep / 24 + 6}%)`, mixBlendMode: 'screen'}} />
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				<defs>
					<linearGradient id="tt" x1="0" y1="330" x2="0" y2="620" gradientUnits="userSpaceOnUse">
						<stop offset="0" stopColor="#fff3cf" />
						<stop offset="0.5" stopColor="#f3cd7a" />
						<stop offset="1" stopColor="#b8862a" />
					</linearGradient>
				</defs>
				<g opacity={r1} transform={`translate(${(1 - r1) * 30} 0)`} style={{filter: `blur(${(1 - r1) * 8}px)`}}>
					<text x={1340} y={430} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 112}} fill="url(#tt)">画饼，</text>
				</g>
				<g opacity={r2} transform={`translate(${(1 - r2) * 30} 0)`} style={{filter: `blur(${(1 - r2) * 8}px)`}}>
					<text x={1340} y={580} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 112}} fill="url(#tt)">到底有没有用？</text>
				</g>
				<g opacity={r3}>
					<line x1={1340 - 260 * r3} x2={1340 + 260 * r3} y1={650} y2={650} stroke={GOLD} strokeOpacity={0.6} strokeWidth={1.5} />
					<text x={1340} y={704} textAnchor="middle" style={{fontFamily: SANS, fontSize: 30, fontWeight: 500}} fill="#e6dcc6" letterSpacing="0.2em">2026 诺贝尔经济学奖 · 霍尔 & 伍德福德</text>
				</g>
			</svg>
			<AbsoluteFill style={{background: '#fff4dc', opacity: flash}} />
		</AbsoluteFill>
	);
};

const Open26: React.FC = () => {
	const f = useCurrentFrame();
	const t = f / FPS;
	const sub = f < T.drop ? lineAt(lines as any, t) : '';
	// short dip at the s1→s2 cut ("同一晚")
	const dip = f >= T.s2 - 3 && f < T.s2 + 3 ? 1 - Math.abs(f - T.s2) / 3 : 0;
	return (
		<AbsoluteFill style={{background: '#000'}}>
			{f < T.s2 ? <Shot1 f={f} /> : f < T.drop ? <Frontal f={f} /> : <TitleShot f={f} />}
			<Vignette />
			<Grain />
			<AbsoluteFill style={{background: '#000', opacity: dip * 0.8}} />
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}><Sub t={sub} /></svg>
		</AbsoluteFill>
	);
};

const Root: React.FC = () => <Composition id="OPEN26" component={Open26} durationInFrames={T.end} fps={FPS} width={W} height={H} />;
registerRoot(Root);
