import React from 'react';
import {AbsoluteFill, Sequence, random, spring, useCurrentFrame} from 'remotion';
import {CAST} from '../../src/art/cast';
import {Figure, POSES, blinkAt, lerpPose} from '../../src/art/Figure';
import {Materials} from '../../src/art/materials';
import {BallotBox, OX_DEFS, Ox, Signboard, Ticket} from '../../src/art/Ox';
import {lookAt} from '../../src/art/sets/Airfield';
import {Fair1906} from '../../src/art/sets/Fair1906';
import {TitleCard} from '../../src/brand/Brand';
import {camMix} from '../../src/components/FullFrame';
import {GlowDefs} from '../../src/components/Stage';
import {ease, prog} from '../../src/lib/context';
import {loadEpisodeFonts} from '../../src/lib/fonts';
import {color, font} from '../../src/lib/theme';
import {TicketSwarm} from './art';
import {BRAND, EPISODE} from './brand';

/**
 * 5-second motion test for 《八百人猜牛》's cold open, cut to the track:
 * the camera pushes through the crowd at the 1906 show; ~70 tickets circle the ox in
 * the lantern light; a butcher posts his ticket (sprung pose); the ox blinks, swishes,
 * turns its head; the swarm tightens, then on the music's first hit (3.56 s, frame 107)
 * a gold flash, a short shake, the tickets blow outward and the Juno title card lands.
 */
export const OX_TEST_N = 156;
const HIT = 107;
// the card fades up 16 frames before the hit so its title lands and flares on the beat
const CARD = HIT - 16;

export const OxMotionTest: React.FC = () => {
	loadEpisodeFonts('ox');
	const f = useCurrentFrame();
	const fps = 30;
	const push = prog(f, 0, CARD, ease.inOut);
	const tighten = prog(f, CARD - 30, 18, ease.in);
	const rush = prog(f, CARD - 14, 16, ease.in);
	const cam = camMix(lookAt(1000, 640, 1.12), lookAt(1040, 640, 1.42 + 0.06 * tighten + 0.9 * rush * rush), push);
	const shake = 0;
	const sx = shake * (random(`kx${f}`) - 0.5);
	const sy = shake * (random(`ky${f}`) - 0.5);
	// the butcher writes, then posts the ticket with a spring
	const post = spring({frame: f - 34, fps, config: {damping: 11, stiffness: 120}});
	const butcherPose = lerpPose(POSES.write, POSES.hold, post);
	const slot: [number, number] = [118, -200];
	// the ox turns its head toward us as the tickets gather
	const look = spring({frame: f - 62, fps, config: {damping: 14}});
	const flash = 0;
	const sub = prog(f, 10, 8) * (1 - prog(f, CARD - 6, 6));
	const swarmC = {cx: 1050, cy: 720};
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080">
				<Materials />
				<OX_DEFS />
				<GlowDefs />
				<g transform={`translate(${sx},${sy})`}>
					<Fair1906
						frame={f + 80}
						cam={cam}
						lamp={1 - 0.15 * tighten + 0.6 * flash}
						front={
							<g>
								{[
									[150, 'gent'],
									[390, 'shopgirl'],
									[1600, 'butcher'],
									[1830, 'drover'],
								].map(([x, who], i) => (
									<g key={i} transform={`translate(${x},1260) scale(1.3)`}>
										<Figure look={CAST[who as string]} facing="back" silhouette="#07080d" rim="none" shadow={false} />
									</g>
								))}
							</g>
						}
					>
						<TicketSwarm f={f} {...swarmC} side={-1} tighten={tighten} rush={rush} />
						<g transform="translate(440,890)">
							<Signboard />
						</g>
						<g transform="translate(1050,880) scale(0.95)">
							<Ox pose={{head: -8 * look, tail: Math.sin(f / 9) * 0.8, breath: 0.5 + 0.5 * Math.sin(f / 22)}} blink={blinkAt(f, 'ox')} lit={0.9 + 0.3 * flash} />
						</g>
						<g transform="translate(1390,885) scale(0.95)">
							<Figure look={CAST.drover} pose={POSES.hold} reach={{near: [-70, -210]}} flip rim="warm" blink={blinkAt(f, 'dr')} expression={f > 70 ? 'smile' : 'neutral'} />
						</g>
						<g transform="translate(640,892) scale(0.95)">
							<Figure
								look={CAST.butcher}
								pose={butcherPose}
								reach={post > 0.2 ? {near: slot} : undefined}
								rim="warm"
								blink={blinkAt(f, 'bu')}
								holdNear={
									post < 0.85 ? (
										<g transform="scale(0.12) rotate(-20)">
											<Ticket lod="mid" />
										</g>
									) : undefined
								}
							/>
						</g>
						<g transform="translate(745,896) scale(0.9)">
							<BallotBox />
						</g>
						<TicketSwarm f={f} {...swarmC} side={1} tighten={tighten} rush={rush} />
					</Fair1906>
				</g>
				<rect width={1920} height={1080} fill="#fff1cf" opacity={0.85 * flash} />
				<rect x={0} y={800} width={1920} height={280} fill="url(#sub-scrim-mt)" opacity={0.7} />
				<defs>
					<linearGradient id="sub-scrim-mt" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#000" stopOpacity="0" />
						<stop offset="1" stopColor="#000" stopOpacity="1" />
					</linearGradient>
				</defs>
			</svg>
			<div style={{position: 'absolute', top: 952 - 40, width: 1920, textAlign: 'center', fontFamily: font.serif, fontWeight: 600, fontSize: 54, color: color.text, opacity: sub, textShadow: '0 2px 12px rgba(0,0,0,0.8)'}}>
				800个人，猜一头牛有多重。
			</div>
			<Sequence from={CARD} layout="none">
				<TitleCard v={EPISODE} cfg={BRAND} dur={150} />
			</Sequence>
		</AbsoluteFill>
	);
};
