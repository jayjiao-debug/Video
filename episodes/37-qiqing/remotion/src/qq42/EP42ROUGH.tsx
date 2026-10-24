import React from 'react';
import {AbsoluteFill, Composition, Img, registerRoot, staticFile, useCurrentFrame} from 'remotion';
import {W, H, Grain, Label, Subs} from './kit42';
import {T, HookPhone, Harvard, TabletShot, Rush, Egypt2} from './demo42b';
import {SUBS42, LABELS42, M42} from './lines42';
import {RoughA} from './rough42a';
import {RoughB} from './rough42b_slot';
/* ep42 rough full cut (145.124 s): the EP42DEMO picture to 25.477, RoughA (Babylon → Danube) to the CRASH at 79.815, then RoughB. */
const FPS = 30;
const PLATES = ['ep42/nile.webp', 'ep42/sea.webp', 'ep42/danube.webp', 'ep42/field.webp', 'ep42/study.webp'];
const SUBS = SUBS42.filter(([, , s]) => !s.startsWith('朋友的语音'));
const fio = (t: number, a: number, b: number, f: number) => Math.max(0, Math.min(1, (t - a) / f, (b - t) / f));
const Demo: React.FC<{t: number}> = ({t}) => {
	if (t < T.harvard) return <HookPhone t={t} />;
	if (t < T.tablet) return <Harvard t={t} />;
	if (t < T.hit) return <TabletShot t={t} />;
	if (t < T.egypt - 0.3) return <Rush t={t} />;
	if (t < T.egypt) { const k = (t - (T.egypt - 0.3)) / 0.3, u = k * k * (3 - 2 * k); return <><Egypt2 t={T.egypt} /><g opacity={1 - u}><Rush t={t} /></g></>; }
	return <Egypt2 t={t} />;
};
const Rough: React.FC = () => {
	const f = useCurrentFrame(), t = f / FPS;
	const body = t < M42.babylon ? <Demo t={t} /> : t < M42.crash ? <RoughA t={t} /> : <RoughB t={t} />;
	const s = SUBS.find(([a, b]) => t >= a && t < b), lab = LABELS42.find(([a, b]) => t >= a && t < b);
	return <AbsoluteFill style={{background: '#000'}}>
		<div style={{position: 'absolute', width: 1, height: 1, overflow: 'hidden', opacity: 0}}>{PLATES.map((p) => <Img key={p} src={staticFile(p)} style={{width: 1, height: 1}} />)}</div>
		<svg width={W} height={H} style={{position: 'absolute'}}>
			{body}
			<Grain f={f} vig={0.45} grain={0.05} />
			{lab && <g opacity={fio(t, lab[0], lab[1], 0.4)}><Label date={lab[2]} name={lab[3]} /></g>}
			{s && <g opacity={fio(t, s[0] - 0.04, s[1] + 0.04, 0.12)}><Subs zh={s[2]} /></g>}
		</svg>
	</AbsoluteFill>;
};
registerRoot(() => <Composition id="EP42ROUGH" component={Rough} durationInFrames={4354} fps={FPS} width={W} height={H} />);
