import React from 'react';
import {AbsoluteFill, Composition, Img, staticFile, useCurrentFrame, Easing} from 'remotion';
import {C, FPS, H, W, SANS, SERIF, NUM, Stage, Sub, Figure, Rule, Cap, lerp, on, off, rise, useFonts} from './kit';
import L from '../ep26v4_lines.json';

/* ep26 · look B opening (0–20.73 s): the boss's sentence → ¥0 arrived / +¥32 spent → 预期 → 饼 → bite → medal → title on drop 1 */
const lines = L as {start: number; end: number; text: string}[];
export const subAt = (t: number) => { for (let i = lines.length - 1; i >= 0; i--) if (t >= lines[i].start) return t < lines[i].end + 0.2 ? lines[i].text : ''; return ''; };
export const DROP = 16.625, OPEN_END = 20.73;

/* ---------- the 饼: a golden flatbread, lit, textured, no outlines ---------- */
export const Bread: React.FC<{x: number; y: number; r: number; bite?: number; sx?: number; o?: number; id?: string}> = ({x, y, r, bite = 0, sx = 1, o = 1, id = 'br'}) => {
	const specks = Array.from({length: 46}, (_, i) => {
		const a = i * 2.39996, d = Math.sqrt((i + 0.5) / 46) * r * 0.82;
		return [x + Math.cos(a) * d, y + Math.sin(a) * d, (i * 53) % 180, 0.5 + ((i * 37) % 10) / 20];
	});
	const bx = x + r * 0.74, by = y - r * 0.6;
	return (
		<g opacity={o} transform={`translate(${x} ${y}) scale(${sx} 1) translate(${-x} ${-y})`}>
			<defs>
				<radialGradient id={`${id}g`} cx="0.38" cy="0.32" r="0.78">
					<stop offset="0" stopColor="#f6dca4" />
					<stop offset="0.45" stopColor="#d9a556" />
					<stop offset="0.85" stopColor="#9c6726" />
					<stop offset="1" stopColor="#5e3a12" />
				</radialGradient>
				<filter id={`${id}t`} x="-10%" y="-10%" width="120%" height="120%">
					<feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="4" seed="7" />
					<feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.2  0 0 0 0 0.05  0 0 0 1.2 -0.45" />
					<feComposite in2="SourceGraphic" operator="in" />
				</filter>
				<mask id={`${id}m`}>
					<rect x={x - r - 20} y={y - r - 20} width={2 * r + 40} height={2 * r + 40} fill="#fff" />
					{bite > 0 && [[0, 0, 0.34], [-0.28, 0.14, 0.19], [0.16, 0.3, 0.2]].map(([dx, dy, rr], i) => <circle key={i} cx={bx + dx * r} cy={by + dy * r} r={rr * r * bite} fill="#000" />)}
				</mask>
			</defs>
			<ellipse cx={x + r * 0.08} cy={y + r * 1.02} rx={r * 0.92} ry={r * 0.12} fill="#000" opacity={0.6} style={{filter: 'blur(10px)'}} />
			<g mask={`url(#${id}m)`}>
				<circle cx={x} cy={y} r={r} fill={`url(#${id}g)`} />
				<circle cx={x} cy={y} r={r} fill="#fff" filter={`url(#${id}t)`} opacity={0.9} />
				{specks.map(([sx2, sy2, a, s], i) => <ellipse key={i} cx={sx2} cy={sy2} rx={r * 0.03 * s} ry={r * 0.014 * s} fill="#fff6dd" opacity={0.75} transform={`rotate(${a} ${sx2} ${sy2})`} />)}
				<circle cx={x} cy={y} r={r * 0.97} fill="none" stroke="#4a2c0c" strokeOpacity={0.35} strokeWidth={r * 0.06} />
				<ellipse cx={x - r * 0.35} cy={y - r * 0.42} rx={r * 0.38} ry={r * 0.2} fill="#fff" opacity={0.12} transform={`rotate(-30 ${x - r * 0.35} ${y - r * 0.42})`} />
			</g>
		</g>
	);
};
/* the medal, 2D, engraved — the 3D medal takes over on the drop */
export const Medal: React.FC<{x: number; y: number; r: number; sx?: number}> = ({x, y, r, sx = 1}) => (
	<g transform={`translate(${x} ${y}) scale(${sx} 1) translate(${-x} ${-y})`}>
		<defs>
			<radialGradient id="mdg" cx="0.36" cy="0.3" r="0.8"><stop offset="0" stopColor="#fff1c8" /><stop offset="0.45" stopColor="#d7a650" /><stop offset="1" stopColor="#6e4a14" /></radialGradient>
		</defs>
		<circle cx={x} cy={y} r={r} fill="url(#mdg)" />
		<circle cx={x} cy={y} r={r * 0.93} fill="none" stroke="#5e3f10" strokeOpacity={0.45} strokeWidth={3} />
		{[-1, 1].map((sd) => Array.from({length: 13}, (_, i) => {
			const a = Math.PI / 2 + sd * (0.38 + i * 0.18), lx = x + Math.cos(a) * r * 0.74, ly = y + Math.sin(a) * r * 0.74;
			return <ellipse key={`${sd}${i}`} cx={lx} cy={ly} rx={r * 0.085} ry={r * 0.032} fill="#6e4a14" opacity={0.5} transform={`rotate(${(a * 180) / Math.PI + sd * 55} ${lx} ${ly})`} />;
		}))}
		<text x={x} y={y + r * 0.15} textAnchor="middle" style={{fontFamily: NUM, fontSize: r * 0.5, fontWeight: 700}} fill="#5e3f10" opacity={0.7}>2026</text>
	</g>
);

const PhoneObj: React.FC<{lit: number; note: number}> = ({lit, note}) => (
	<div style={{position: 'absolute', left: 250, top: 170, transform: 'perspective(1800px) rotateX(42deg) rotateZ(-18deg)', filter: 'blur(1.2px)'}}>
		<div style={{width: 380, height: 780, borderRadius: 60, background: 'linear-gradient(160deg,#2a2a2d,#0c0c0e 45%,#18181b)', boxShadow: '0 50px 90px rgba(0,0,0,0.8), inset 0 0 0 2px #333'}}>
			<div style={{position: 'absolute', left: 14, top: 14, width: 352, height: 752, borderRadius: 48, overflow: 'hidden', background: '#000'}}>
				<div style={{position: 'absolute', inset: 0, opacity: lit, background: 'radial-gradient(120% 80% at 30% 10%, #34405e 0%, #141927 55%, #090b12 100%)'}}>
					<div style={{position: 'absolute', top: 90, width: '100%', textAlign: 'center', fontFamily: SANS, color: '#f4f4f4', fontSize: 110, fontWeight: 300}}>21:04</div>
					<div style={{position: 'absolute', left: 16, right: 16, top: 290, height: 104, borderRadius: 26, background: 'rgba(240,240,245,0.9)', opacity: note, transform: `translateY(${(1 - note) * -40}px)`}}>
						<div style={{position: 'absolute', left: 18, top: 20, width: 62, height: 62, borderRadius: 16, background: 'linear-gradient(160deg,#5b8cff,#3a5fd0)'}} />
						<div style={{position: 'absolute', left: 98, top: 18, fontFamily: SANS, fontSize: 24, fontWeight: 800, color: '#111'}}>老板</div>
						<div style={{position: 'absolute', left: 98, top: 52, fontFamily: SANS, fontSize: 28, fontWeight: 600, color: '#111'}}>明年给你涨工资</div>
					</div>
				</div>
			</div>
		</div>
	</div>
);

export const OpenB: React.FC = () => {
	useFonts();
	const f = useCurrentFrame();
	const t = f / FPS;
	if (t >= DROP) return <TitleB t={t} />;
	const s1 = t < 2.48;
	// shot 1: the message
	const lit = lerp(t, 0.15, 0.5, 0, 1), note = lerp(t, 0.45, 0.85, 0, 1), quote = lerp(t, 0.7, 1.3, 0, 1);
	// shot 2: the two numbers
	const n1 = on(t, 2.6), n2 = on(t, 3.3);
	const spent = Math.round(lerp(t, 3.5, 4.6, 0, 32));
	const numsOut = off(t, 5.35, 0.4);
	// shot 3–6: ring → 饼 → bite → medal
	const ring = lerp(t, 5.5, 6.6, 0, 1);
	const word = on(t, 6.0, 0.5) * off(t, 8.1, 0.35);
	const fill = lerp(t, 8.1, 8.8, 0, 1);
	const bite = lerp(t, 11.3, 11.5, 0, 1, Easing.out(Easing.back(2)));
	const flip = lerp(t, 13.9, 16.3, 0, 1, Easing.inOut(Easing.cubic));
	const ang = flip * Math.PI * 2;
	const sx = Math.max(0.02, Math.abs(Math.cos(ang)));
	const showMedal = ang > Math.PI / 2;
	const br = lerp(t, 8.1, 9.0, 160, 210) + lerp(t, 13.9, 16.4, 0, 40);
	const by = 440 + Math.sin(t * 1.6) * 6;
	const crumbs = t > 11.4 ? Array.from({length: 12}, (_, i) => {
		const u = t - 11.4;
		return [960 + 150 + ((i * 41) % 70) - 20 + u * ((i % 5) - 2) * 24, by - 150 + ((i * 29) % 40) + u * u * 500, 2 + (i % 3) * 1.6, Math.max(0, 1 - u / 1.2)];
	}) : [];
	return (
		<AbsoluteFill>
			{s1 ? (
				<Stage kx={520} ky={560} k={0.4 + 0.6 * lit} tint="90,110,160">
					<PhoneObj lit={lit} note={note} />
					<div style={{position: 'absolute', left: 980, top: 330, ...rise(quote)}}>
						<div style={{fontFamily: SANS, fontSize: 40, fontWeight: 600, color: C.mute, letterSpacing: '0.1em'}}>老板 · 晚上 21:04</div>
						<div style={{position: 'relative', fontFamily: SERIF, fontSize: 108, fontWeight: 700, color: C.ink, marginTop: 26, lineHeight: 1.25}}>
							<span style={{position: 'absolute', left: -78, top: -46, fontFamily: NUM, color: C.gold, fontSize: 190, lineHeight: 1}}>“</span>
							明年给你<br />涨工资
						</div>
					</div>
				</Stage>
			) : (
				<Stage kx={960} ky={470} k={t < 5.4 ? 0.6 : 0.6 + 0.6 * ring}>
					{/* shot 2: blurred phone glow (the food app) + the two numbers */}
					{t < 5.8 && (
						<>
							<div style={{position: 'absolute', left: 250, top: 260, width: 360, height: 680, borderRadius: 56, background: 'linear-gradient(170deg,#f2a07a,#d95f3b 26%,#f1ebe2 28%,#f1ebe2)', filter: 'blur(22px)', opacity: 0.5 * numsOut, transform: 'rotate(-7deg)'}} />
							<div style={{position: 'absolute', left: 860, top: 200, opacity: numsOut}}>
								<Figure label="涨的工资 · 现在到账" value="¥0" style={rise(n1)} />
								<Rule style={{margin: '30px 0 34px', opacity: n2}} w={760} />
								<Figure label="今晚的饭 · ¥26 → ¥58" value={`+¥${spent}`} note="多花了" col={C.gold} style={rise(n2)} />
							</div>
						</>
					)}
					<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
						<defs>
							<radialGradient id="halo"><stop offset="0" stopColor={C.gold} stopOpacity={0.32} /><stop offset="1" stopColor={C.gold} stopOpacity={0} /></radialGradient>
						</defs>
						{t >= 5.4 && (
							<g>
								<circle cx={960} cy={by} r={br * 2} fill="url(#halo)" opacity={ring} />
								{/* 预期: a thin gold ring drawing on */}
								<circle cx={960} cy={by} r={170} fill="none" stroke={C.gold} strokeWidth={2.5} pathLength={1} strokeDasharray={`${ring} 1`} transform={`rotate(-90 960 ${by})`} opacity={1 - fill} />
								<circle cx={960} cy={by} r={186} fill="none" stroke={C.gold} strokeOpacity={0.35} strokeWidth={1} pathLength={1} strokeDasharray={`${ring} 1`} transform={`rotate(-90 960 ${by})`} opacity={1 - fill} />
								<text x={960} y={by + 40} textAnchor="middle" style={{fontFamily: SERIF, fontSize: 120, fontWeight: 700}} fill={C.gold} opacity={word}>预期</text>
								{/* → 饼 → bite → medal */}
								{fill > 0 && (showMedal ? <Medal x={960} y={by} r={br} sx={sx} /> : <Bread x={960} y={by} r={br} bite={bite} sx={sx} o={fill} />)}
								{crumbs.map(([x, y, r, o], i) => <circle key={i} cx={x} cy={y} r={r} fill="#e2b866" opacity={o} />)}
							</g>
						)}
					</svg>
					<div style={{position: 'absolute', left: 0, right: 0, top: 740, textAlign: 'center', ...rise(on(t, 8.6) * off(t, 13.7, 0.4))}}>
						<Cap size={46} col={C.mute}>{t < 10.8 ? '老板画的饼' : '饼还没到手，已经咬了一口'}</Cap>
					</div>
				</Stage>
			)}
			<Sub t={subAt(t)} />
		</AbsoluteFill>
	);
};

export const TitleB: React.FC<{t: number}> = ({t}) => {
	const u = t - DROP;
	const flash = lerp(u, 0, 0.2, 0.5, 0);
	const push = lerp(u, 0, 4.1, 1.0, 1.06, Easing.linear);
	const r1 = lerp(u, 0.05, 0.6, 0, 1), r2 = lerp(u, 0.25, 0.8, 0, 1), r3 = lerp(u, 0.6, 1.1, 0, 1);
	const out = lerp(t, OPEN_END - 0.35, OPEN_END, 1, 0);
	return (
		<AbsoluteFill style={{background: '#000', opacity: out}}>
			<AbsoluteFill style={{transform: `scale(${push})`, transformOrigin: '25% 50%'}}>
				<Img src={staticFile('ep26/medal.png')} style={{width: W, height: H}} />
			</AbsoluteFill>
			<div style={{position: 'absolute', left: 900, top: 330, width: 960, textAlign: 'center'}}>
				<div style={{fontFamily: SERIF, fontWeight: 900, fontSize: 116, lineHeight: 1.2, color: C.ink, ...rise(r1)}}>画饼，</div>
				<div style={{fontFamily: SERIF, fontWeight: 900, fontSize: 116, lineHeight: 1.2, color: C.gold, ...rise(r2)}}>到底有没有用？</div>
				<div style={{width: 520 * r3, height: 1.5, background: C.line, margin: '34px auto 26px'}} />
				<div style={{fontFamily: SANS, fontSize: 36, fontWeight: 500, color: C.mute, letterSpacing: '0.12em', opacity: r3}}>2026 诺贝尔经济学奖 · 霍尔 & 伍德福德</div>
			</div>
			<AbsoluteFill style={{background: '#fff4dc', opacity: flash}} />
		</AbsoluteFill>
	);
};

const Root: React.FC = () => <Composition id="OPENB" component={OpenB} durationInFrames={Math.round(OPEN_END * FPS)} fps={FPS} width={W} height={H} />;
export const OpenBRoot = Root;
