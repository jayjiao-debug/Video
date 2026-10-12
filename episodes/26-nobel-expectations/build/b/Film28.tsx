import React from 'react';
import {AbsoluteFill, Composition, Sequence, useCurrentFrame} from 'remotion';
import {C, W, H, SANS, Sub, useFonts} from './kit';
import {E, ramp, mix} from './motion';
import {subAt} from './OpenB';
import {OpenD} from './OpenD';
import {Hall, CityScene, Loop, Bank, BingFlight} from './scenesA';
import {VaultScene, LedgerScene, BookScene, ScaleScene, CardsScene, NearCity, PhoneSection} from './scenesB';
import {EndCard} from '../../brand/Brand';
import {JUNO} from '../../brand/identity';

/* ep26 v3 · the film. One world: a single warm key light moves between subjects (no cuts to black, no flashes);
   scenes overlap during their transitions and carry shared objects across. */
export const FPS = 30, FILM_END = 163.0, END_AT = 154.34;

/* key light: [time it is reached, x, y, strength] — eased on CAM over 0.9 s before each time */
const KEYS: [number, number, number, number][] = [
	[20.9, 900, 520, 0.8], [34.9, 960, 500, 0.9], [38.4, 960, 600, 0.6], [49.7, 960, 470, 1.0], [63.9, 500, 480, 0.85], [68.9, 1250, 420, 1.0],
	[73.8, 860, 460, 0.95], [77.2, 960, 380, 0.9], [84.1, 960, 470, 0.9], [87.4, 860, 460, 0.95], [99.0, 520, 420, 1.0], [102.9, 960, 380, 0.95],
	[111.7, 1220, 470, 1.0], [121.5, 1220, 470, 0.3], [123.3, 960, 600, 0.7], [127.3, 900, 520, 0.9], [136.1, 760, 520, 1.0],
];
const keyAt = (t: number) => {
	let k = KEYS[0];
	for (let i = 1; i < KEYS.length; i++) {
		const [tt] = KEYS[i];
		if (t >= tt) { k = KEYS[i]; continue; }
		const p = ramp(t, tt - 0.9, tt, E.CAM);
		return [mix(p, k[1], KEYS[i][1]), mix(p, k[2], KEYS[i][2]), mix(p, k[3], KEYS[i][3])];
	}
	return [k[1], k[2], k[3]];
};

const END_V = {id: 'ep26', src: '', title: '画饼，到底有没有用？', kicker: '', tagline: '', taglineEn: '', motif: 'coin' as const, card: [16.6, 20.7] as [number, number], extend: 0, question: '老板画的饼，你吃过几次？',
	sources: '来源：诺贝尔奖委员会 2026；Hall 1978；Woodford 2003、2012；欧洲央行 2012–2013；BIS；欧盟法院 2015', duration: 0};

export const Film28: React.FC = () => {
	useFonts();
	const f = useCurrentFrame();
	const t = f / FPS;
	const [kx, ky, kk] = keyAt(t);
	const mark = ramp(t, 21, 21.6, E.ENTER) * (1 - ramp(t, END_AT - 0.5, END_AT, E.EXIT));
	return (
		<AbsoluteFill style={{background: C.bg}}>
			{t >= 20.4 && t < END_AT + 0.4 && (
				<>
					<AbsoluteFill style={{background: `radial-gradient(1000px 760px at ${kx}px ${ky}px, rgba(120,92,58,${0.42 * kk}), rgba(10,10,11,0) 70%)`}} />
					<Hall t={t} />
					<CityScene t={t} />
					<Loop t={t} />
					<Bank t={t} />
					<BingFlight t={t} />
					<VaultScene t={t} />
					<LedgerScene t={t} />
					<BookScene t={t} />
					<ScaleScene t={t} />
					<CardsScene t={t} />
					<NearCity t={t} />
					<PhoneSection t={t} />
					<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.7) 100%)', pointerEvents: 'none'}} />
				</>
			)}
			{t < 20.95 && <OpenD t={t} />}
			<Sequence from={Math.round(END_AT * FPS)}><EndCard v={END_V} cfg={{videos: []}} dur={Math.round((FILM_END - END_AT) * FPS)} /></Sequence>
			{t < END_AT && <Sub t={subAt(t)} />}
			<div style={{position: 'absolute', top: 40, right: 56, opacity: 0.55 * mark, fontFamily: SANS, fontWeight: 500, fontSize: 20, letterSpacing: '0.3em', color: '#f3ede2', textShadow: '0 1px 6px rgba(0,0,0,0.6)'}}>{JUNO.mark}</div>
		</AbsoluteFill>
	);
};
export const Film28Root: React.FC = () => <Composition id="FILM28" component={Film28} durationInFrames={Math.round(FILM_END * FPS)} fps={FPS} width={W} height={H} />;
