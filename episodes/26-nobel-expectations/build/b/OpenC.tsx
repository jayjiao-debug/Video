import React from 'react';
import {AbsoluteFill, Composition, interpolate, spring, useCurrentFrame, Easing} from 'remotion';
import {Shot1, Phone, AppScreen, Banner, T} from '../Open26';
import {C, FPS, H, W, SERIF, Stage, Sub, Figure, Rule, Cap, lerp, on, off, rise, useFonts} from './kit';
import {Bread, Medal, TitleB, subAt, DROP, OPEN_END} from './OpenB';

/* ep26 · opening, v1's story beats (phone, the tap, the bubble out of the checkout button, the 饼 tied to the boss's message)
   with look B's craft (light, serif numerals, refined 饼, readable type) and the clear ¥0 / +¥32 money beat. */
const K = 1.12, PX = 300, PY = 40, SW = 372, SH = 792;

const Frontal: React.FC<{f: number}> = ({f}) => {
	const t = f / FPS;
	const enter = lerp(t, 2.5, 2.8, 0, 1);
	const out = lerp(t, 13.44, 14.2, 0, 1);
	const tapT = (T.s2 + 34) / FPS;
	// the money beat
	const n1 = on(t, 2.7), n2 = on(t, tapT + 0.1);
	const spent = Math.round(lerp(t, tapT + 0.15, tapT + 1.0, 0, 32));
	const numsOut = off(t, 5.3, 0.35);
	// 预期 rises out of the checkout button
	const bx0 = PX + (14 + SW - 90) * K, by0 = PY + (14 + SH - 50) * K;
	const rise_ = lerp(t, 5.46, 6.5, 0, 1);
	const bob = Math.sin(t * 1.7) * 7;
	const rx = interpolate(rise_, [0, 1], [bx0, 1330]), ry = interpolate(rise_, [0, 1], [by0, 420]) + bob * rise_;
	const rr = interpolate(rise_, [0, 1], [18, 150]);
	const word = on(t, 6.2, 0.45);
	const fill = lerp(t, 8.12, 8.8, 0, 1);
	const banner = spring({frame: f - Math.round(8.2 * FPS), fps: FPS, config: {damping: 16, stiffness: 120}});
	const link = on(t, 8.9, 0.4);
	const bite = lerp(t, 11.3, 11.5, 0, 1, Easing.out(Easing.back(2)));
	// the flip into the medal
	const cx = lerp(t, 13.44, 14.3, 1330, 960), cy = lerp(t, 13.44, 14.3, 420 + bob, 450);
	const flip = lerp(t, 14.1, 16.4, 0, 1, Easing.inOut(Easing.cubic));
	const ang = flip * Math.PI * 2, sx = Math.max(0.02, Math.abs(Math.cos(ang)));
	const br = interpolate(fill, [0, 1], [150, 170]) + lerp(t, 14.1, 16.5, 0, 50);
	const crumbs = t > 11.4 ? Array.from({length: 12}, (_, i) => {
		const u = t - 11.4;
		return [1330 + 120 + ((i * 41) % 70) - 30 + u * ((i % 5) - 2) * 24, 420 - 130 + ((i * 29) % 40) + u * u * 520, 2 + (i % 3) * 1.6, Math.max(0, 1 - u / 1.2)];
	}) : [];
	return (
		<Stage kx={t < 5.4 ? 760 : 1100} ky={520} k={0.9}>
			<div style={{position: 'absolute', left: PX - 260 * out, top: PY, opacity: enter * (1 - out * 0.9), transform: `scale(${K * (1 - 0.1 * out)})`, transformOrigin: '0 0', filter: t > 5.4 ? `brightness(${lerp(t, 5.4, 6.2, 1, 0.75)})` : undefined}}>
				<Phone>
					<AppScreen f={f} />
					<Banner y={interpolate(banner, [0, 1], [-140, 44])} o={banner} light />
				</Phone>
			</div>
			{/* ¥0 arrived / +¥32 spent */}
			{t < 5.8 && (
				<div style={{position: 'absolute', left: 980, top: 190, opacity: numsOut}}>
					<Figure label="涨的工资 · 现在到账" value="¥0" size={170} style={rise(n1)} />
					<Rule style={{margin: '26px 0 30px', opacity: n2}} w={760} />
					<Figure label="今晚的饭 · ¥26 → ¥58" value={`+¥${spent}`} note="多花了" col={C.gold} size={170} style={rise(n2)} />
				</div>
			)}
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				<defs>
					<radialGradient id="halo"><stop offset="0" stopColor={C.gold} stopOpacity={0.3} /><stop offset="1" stopColor={C.gold} stopOpacity={0} /></radialGradient>
				</defs>
				{t >= 5.46 && t < 13.44 && (
					<g>
						<circle cx={rx} cy={ry} r={rr * 2.2} fill="url(#halo)" />
						<circle cx={rx} cy={ry} r={rr} fill="none" stroke={C.gold} strokeWidth={2.5} opacity={1 - fill} />
						<circle cx={rx} cy={ry} r={rr + 14} fill="none" stroke={C.gold} strokeOpacity={0.35} strokeWidth={1} opacity={1 - fill} />
						<text x={rx} y={ry + 34} textAnchor="middle" style={{fontFamily: SERIF, fontSize: 96, fontWeight: 700}} fill={C.gold} opacity={word * (1 - fill)}>预期</text>
						{fill > 0 && <Bread x={1330} y={420 + bob} r={br} bite={bite} o={fill} id="c1" />}
						{/* tie the 饼 to the boss's message */}
						<g opacity={link}>
							<path d={`M${1330 - br - 16} ${420 + bob} L ${PX + (400 - 6) * K} ${PY + 100 * K}`} stroke={C.gold} strokeOpacity={0.8} strokeWidth={1.5} strokeDasharray="5 8" fill="none" />
							<circle cx={PX + (400 - 6) * K} cy={PY + 100 * K} r={6} fill={C.gold} />
						</g>
						{crumbs.map(([x, y, r, o], i) => <circle key={i} cx={x} cy={y} r={r} fill="#e2b866" opacity={o} />)}
					</g>
				)}
				{t >= 13.44 && (ang > Math.PI / 2 ? <Medal x={cx} y={cy} r={br} sx={sx} /> : <Bread x={cx} y={cy} r={br} bite={1} sx={sx} id="c2" />)}
			</svg>
			<div style={{position: 'absolute', left: 1330 - 400, width: 800, top: 640, textAlign: 'center', ...rise(link * off(t, 13.3, 0.3))}}>
				<Cap size={48}>老板画的饼</Cap>
				<div style={{fontFamily: SERIF, fontSize: 38, fontWeight: 600, color: C.mute, marginTop: 14, opacity: on(t, 11.6)}}>到账：¥0　·　先咬了一口</div>
			</div>
		</Stage>
	);
};

export const OpenC: React.FC = () => {
	useFonts();
	const f = useCurrentFrame();
	const t = f / FPS;
	if (t >= DROP) return <TitleB t={t} />;
	return (
		<AbsoluteFill>
			{f < T.s2 ? <Shot1 f={f} /> : <Frontal f={f} />}
			<Sub t={subAt(t)} />
		</AbsoluteFill>
	);
};
export const OpenCRoot: React.FC = () => <Composition id="OPENC" component={OpenC} durationInFrames={Math.round(OPEN_END * FPS)} fps={FPS} width={W} height={H} />;
