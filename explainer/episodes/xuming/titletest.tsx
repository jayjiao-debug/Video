import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {JUNO} from '../../src/brand/identity';
import {Liquid} from '../../src/art/glow/Liquid';
import {AMBER, Finish, GlowDefs, Motes, Statement} from '../../src/art/glow/kit';
import {ease, prog} from '../../src/lib/context';
import {loadEpisodeFonts} from '../../src/lib/fonts';
import {font} from '../../src/lib/theme';

/**
 * Motion test for 《续命》 v2: the cold open's liquid gold turns out to be the
 * surface of one cup; the camera pulls back to the rim, the crema is stirred,
 * and on the hit 「续命」 gathers out of the swirl like poured cream. No flash,
 * no light-line: the title is made of the episode's own object.
 */
const HIT = 118;
const W = 1920;
const H = 1080;

export const XumingTitleTest: React.FC = () => {
	loadEpisodeFonts('xuming');
	const f = useCurrentFrame();
	// pull back from "the whole frame is coffee" to "it's one cup"
	const back = prog(f, 62, 50, ease.inOut);
	const rim = 1300 - (1300 - 380) * back;
	const swirl = 0.4 + 5 * prog(f, 70, 52, ease.in) - 2.5 * prog(f, HIT, 50, ease.out);
	const flow = f / 30 + 10 + 2.2 * prog(f, 80, 50, ease.in);
	const statement = prog(f, 6, 14) * (1 - prog(f, 64, 12));
	const statement2 = prog(f, 34, 14) * (1 - prog(f, 64, 12));
	// the title gathers: displacement melts away, ripple runs out from the centre
	const gather = prog(f, HIT - 4, 26, ease.out);
	const ripple = prog(f, HIT, 40, ease.out);
	const dim = 1 - 0.45 * prog(f, HIT, 20);
	const meta = (d: number) => prog(f, HIT + d, 16);
	return (
		<AbsoluteFill style={{background: AMBER.ink}}>
			{/* the liquid, masked to the cup as we pull back */}
			<div
				style={{
					position: 'absolute',
					left: 960 - rim,
					top: 540 - rim,
					width: rim * 2,
					height: rim * 2,
					borderRadius: '50%',
					overflow: 'hidden',
					opacity: dim,
				}}
			>
				<div style={{position: 'absolute', left: rim - 960, top: rim - 540, width: W, height: H}}>
					<Liquid t={flow} swirl={swirl} scale={2.2 + 1.2 * back} light={[0.5 + 0.22 * (1 - back), 0.45 - 0.13 * (1 - back), 0.55 - 0.2 * back]} gain={1.1} />
				</div>
			</div>
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
				<GlowDefs />
				<defs>
					<filter id="pour" x="-30%" y="-60%" width="160%" height="220%">
						<feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves={2} seed={5} />
						<feDisplacementMap in="SourceGraphic" scale={140 * (1 - gather)} xChannelSelector="R" yChannelSelector="G" />
					</filter>
					<linearGradient id="left-scrim2" x1="0" y1="0" x2="1" y2="0">
						<stop offset="0" stopColor="#000" stopOpacity="0.7" />
						<stop offset="0.6" stopColor="#000" stopOpacity="0" />
					</linearGradient>
				</defs>
				<rect width={W} height={H} fill="url(#left-scrim2)" opacity={1 - back} />
				{/* the cup: rim and a soft shadow appear as we pull back */}
				<g opacity={prog(f, 80, 24)}>
					<circle cx={960} cy={548} r={rim + 70} fill="#000" opacity={0.5} filter="url(#g-lg)" />
					<circle cx={960} cy={540} r={rim + 38} fill="none" stroke="#efe2c8" strokeWidth={58} opacity={0.1} />
					<circle cx={960} cy={540} r={rim + 66} fill="none" stroke={AMBER.cream} strokeWidth={2} opacity={0.4} />
					<circle cx={960} cy={540} r={rim + 6} fill="none" stroke={AMBER.cream} strokeWidth={2} opacity={0.3} />
				</g>
				<Motes f={f} n={50} seed="tt" ring o={0.6 * (1 - back)} />
				<Statement text="每天，全世界约有[二十亿]杯咖啡被端起。" x={190} y={470} anchor="start" size={68} o={statement} />
				<Statement text="你管它叫——[续命]。" x={190} y={570} anchor="start" size={52} o={statement2} />
				{/* ripple out of the cup on the hit */}
				{ripple > 0 && ripple < 1 ? (
					<g fill="none" stroke={AMBER.gold}>
						<circle cx={960} cy={540} r={60 + 900 * ripple} strokeWidth={3} opacity={0.7 * (1 - ripple)} filter="url(#g-sm)" />
						<circle cx={960} cy={540} r={40 + 600 * ripple} strokeWidth={2} opacity={0.5 * (1 - ripple)} />
					</g>
				) : null}
				{/* the title, gathering out of the swirl */}
				{f >= HIT - 4 ? (
					<g opacity={prog(f, HIT - 4, 10)}>
						<text x={960} y={540 + 52} textAnchor="middle" filter="url(#pour)" style={{fontFamily: font.serif, fontWeight: 900, fontSize: 210, fill: 'url(#gold-text)', letterSpacing: '0.12em'}}>
							续命
						</text>
						<text x={960} y={540 + 52} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 900, fontSize: 210, fill: AMBER.gold, letterSpacing: '0.12em'}} opacity={0.35 * gather} filter="url(#g-lg)">
							续命
						</text>
					</g>
				) : null}
				<text x={960} y={330} textAnchor="middle" opacity={meta(10)} style={{fontFamily: font.sans, fontSize: 20, letterSpacing: '0.42em', fill: AMBER.amber, fontWeight: 600}}>
					CAFFEINE · ADENOSINE · 600,000 YEARS
				</text>
				<text x={960} y={720} textAnchor="middle" opacity={meta(18)} style={{fontFamily: font.serif, fontWeight: 700, fontSize: 40, fill: AMBER.cream, letterSpacing: '0.1em'}}>
					它续的，到底是什么？
				</text>
				<text x={960} y={768} textAnchor="middle" opacity={0.7 * meta(24)} style={{fontFamily: font.latinItalic, fontStyle: 'italic', fontSize: 28, fill: AMBER.cream}}>
					What does your morning cup actually renew?
				</text>
				<text x={960} y={850} textAnchor="middle" opacity={0.75 * meta(30)} style={{fontFamily: font.sans, fontSize: 22, letterSpacing: '0.3em', fill: JUNO.colors.gold}}>
					— {JUNO.credit} · {JUNO.series} —
				</text>
				{/* corner mark: hidden while the card is up */}
				<text x={1770} y={64} textAnchor="end" opacity={0.55 * (1 - prog(f, HIT - 10, 8))} style={{fontFamily: font.sans, fontSize: 20, fill: AMBER.cream, letterSpacing: '0.1em'}}>
					◆ {JUNO.mark}
				</text>
				<Finish />
			</svg>
		</AbsoluteFill>
	);
};
