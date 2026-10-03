import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';
import {BrassFilterPot, COFFEE_DEFS, PaperCup, Steam} from '../../src/art/Coffee';
import {CAST} from '../../src/art/cast';
import {Figure, POSES, blinkAt, lerpPose} from '../../src/art/Figure';
import {Materials} from '../../src/art/materials';
import {Kitchen1908} from '../../src/art/sets/Kitchen1908';
import {Metro} from '../../src/art/sets/Metro';
import {lookAt} from '../../src/art/sets/Airfield';
import {ease, prog} from '../../src/lib/context';
import {loadEpisodeFonts} from '../../src/lib/fonts';
import {color, font} from '../../src/lib/theme';

/**
 * 5-second motion test for 《续命》's signature move, the rewind:
 * the 8 a.m. metro runs forward → time slows and stops → runs backwards, faster
 * and faster (steam sucks back into the lid, the city slides back) → the camera
 * dives into the lid's sip hole and comes out of one of the holes Melitta punched
 * in her brass pot, 1908 → drips fly back up, time catches, runs forward again,
 * and she lays the paper in.
 */

// the shared clock: forward, a stop, then an accelerating rewind
const clock = (f: number) => {
	if (f < 46) return f;
	if (f < 58) return 46 + 6 * Math.sin(((f - 46) / 12) * (Math.PI / 2)); // decelerate to a stop at 52
	const k = f - 58;
	return 52 - 0.06 * k ** 2.1; // rewind, accelerating
};

const DIVE_AT = 84; // into the sip hole
const OUT_AT = 90; // out of the punched hole
const RESUME = 118; // the kitchen's clock catches and runs forward

const CommuterCup: React.FC = () => (
	<g transform="translate(2,14) scale(0.15)">
		<PaperCup />
	</g>
);

export const CoffeeRewindTest: React.FC = () => {
	loadEpisodeFonts('coffee');
	const f = useCurrentFrame();
	const T = clock(f);
	const rewinding = f >= 58 && f < RESUME ? 1 : 0;
	const rw = f >= 58 ? prog(f, 58, 10) * (1 - prog(f, RESUME - 4, 8)) : 0;

	// ---------- the metro, with the dive into the lid
	const lid = {x: 1004, y: 610};
	const aim = prog(f, DIVE_AT - 26, 12, ease.inOut);
	const dive = prog(f, DIVE_AT - 14, 14, ease.in);
	const base = {x: 990, y: 650, z: 1.5 + 0.06 * prog(f, 0, 46)};
	const metroCam = lookAt(base.x + (lid.x - base.x) * aim, base.y + (lid.y - base.y) * aim, base.z + 0.4 * aim + 40 * dive ** 3);

	// ---------- the kitchen, pulling out of a hole in the brass base
	const hole = {x: 1000, y: 730};
	const out = prog(f, OUT_AT, 24, ease.out);
	const end = {x: 960, y: 720, z: 1.55};
	const kitchenCam = lookAt(hole.x + (end.x - hole.x) * out, hole.y + (end.y - hole.y) * out, end.z + 40 * (1 - out) ** 3);
	const kT = f < RESUME ? 300 - (f - OUT_AT) * 4 : 300 - (RESUME - OUT_AT) * 4 + (f - RESUME);
	const paper = prog(f, RESUME + 6, 18, ease.out);

	return (
		<AbsoluteFill style={{background: '#000'}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080">
				<Materials />
				<COFFEE_DEFS />
				<defs>
					<radialGradient id="vignette-hard" cx="50%" cy="45%" r="62%">
						<stop offset="0.35" stopColor="#000" stopOpacity="0" />
						<stop offset="1" stopColor="#000" stopOpacity="0.95" />
					</radialGradient>
				</defs>
				{f < DIVE_AT ? (
					<g>
						<Metro
							frame={T}
							travel={T * 14}
							cam={metroCam}
							crowd={[300, 520, 1300, 1500].map((x, i) => (
								<g key={x} transform={`translate(${x}, 960) scale(1.25)`}>
									<Figure look={[CAST.coworker, CAST.officegirl, CAST.economist, CAST.clerk][i]} pose={POSES.hold} holdNear={i % 2 ? <CommuterCup /> : undefined} flip={i % 2 === 1} rim="none" silhouette="#3a4250" shadow={false} />
								</g>
							))}
						>
							<g transform="translate(900, 1040) scale(1.7)">
								<Figure look={CAST.commuter} pose={lerpPose(POSES.stand, POSES.hold, 1)} reach={{near: [70, -250]}} holdNear={<CommuterCup />} expression="neutral" blink={blinkAt(T, 'cm')} rim="warm" />
							</g>
							<g transform={`translate(${lid.x + 6},${lid.y - 4}) scale(0.55)`}>
								<Steam t={T * 3} seed="mcup" height={220} width={28} opacity={0.55} />
							</g>
						</Metro>
					</g>
				) : (
					<Kitchen1908
						t={kT}
						cam={kitchenCam}
						table={
							<g transform="translate(1000, 860) scale(0.7)">
								<BrassFilterPot paper={paper} drip={f < RESUME ? 1 : 0} t={f < RESUME ? -f * 3 : f} />
							</g>
						}
					>
						<g transform="translate(740, 1060) scale(1.75)">
							<Figure look={CAST.melitta} pose={lerpPose(POSES.stand, POSES.write, prog(f, RESUME, 14))} reach={f > RESUME + 4 ? {near: [150 - 30 * paper, -170]} : undefined} expression="thinking" blink={blinkAt(kT, 'mel')} rim="warm" shadow={false} />
						</g>
					</Kitchen1908>
				)}
				{/* the rewind look: cool tint, tape lines rolling up, a soft vignette */}
				<g opacity={rw}>
					<rect width={1920} height={1080} fill="#2a4a7a" opacity={0.12} style={{mixBlendMode: 'multiply'}} />
					{Array.from({length: 7}, (_, i) => {
						const y = ((1080 - ((f * 34 + i * 160) % 1240)) + 1240) % 1240 - 80;
						return <rect key={i} x={0} y={y} width={1920} height={2 + 3 * random(`tl${i}`)} fill="#fff" opacity={0.18} />;
					})}
					<rect width={1920} height={1080} fill="url(#vignette-hard)" opacity={0.45} />
				</g>
				{/* the dark of the hole between the two worlds */}
				<rect width={1920} height={1080} fill="#050302" opacity={interpolate(f, [DIVE_AT - 3, DIVE_AT, OUT_AT, OUT_AT + 4], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
				{/* the year rolls back while the tape rewinds, and lands on 1908 */}
				{f >= 58 ? (
					<g opacity={prog(f, 58, 6) * (1 - prog(f, 140, 10))}>
						<rect x={760} y={70} width={400} height={190} rx={24} fill="#0b0806" opacity={0.55} />
						<text x={960} y={190} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 700, fontSize: 132, fill: color.gold, letterSpacing: '0.04em'}}>
							{Math.round(interpolate(f, [58, 76, OUT_AT + 8], [2025, 1990, 1908], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease.inOut}))}
						</text>
						<text x={960} y={240} textAnchor="middle" opacity={f < OUT_AT + 8 ? 0.8 : 0} style={{fontFamily: font.sans, fontSize: 30, letterSpacing: '0.6em', fill: '#efe6d6'}}>
							◀◀
						</text>
					</g>
				) : null}
				{/* a pinpoint of warm light growing in the dark: the hole we come out of */}
				{f >= DIVE_AT && f < OUT_AT + 4 ? <circle cx={960} cy={540} r={6 + (f - DIVE_AT) * 9} fill="url(#glow-lamp)" opacity={0.9} /> : null}
			</svg>
		</AbsoluteFill>
	);
};
