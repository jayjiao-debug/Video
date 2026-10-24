import React from 'react';
import {AbsoluteFill, Composition, Img, registerRoot, staticFile, useCurrentFrame} from 'remotion';
import {W, H, Grain, Label, Subs} from './kit42';
import {SUBS42, LABELS42} from './lines42';
import {RoughB} from './rough42b';
/* Builder B's throwaway check composition: RoughB with grain, labels and subtitles as the master draws them (skips the 朋友的语音 subtitle). */
const FPS = 30;
const fio = (t: number, a: number, b: number, f: number) => Math.max(0, Math.min(1, (t - a) / f, (b - t) / f));
const Chk: React.FC = () => {
	const f = useCurrentFrame(), t = Math.max(79.815, f / FPS);
	const s = SUBS42.find(([a, b, z]) => t >= a && t < b && !z.startsWith('朋友的语音')), lab = LABELS42.find(([a, b]) => t >= a && t < b);
	return <AbsoluteFill style={{background: '#000'}}>
		<div style={{position: 'absolute', width: 1, height: 1, overflow: 'hidden', opacity: 0}}>{['field', 'sea'].map((k) => <Img key={k} src={staticFile(`ep42/${k}.webp`)} style={{width: 1, height: 1}} />)}</div>
		<svg width={W} height={H} style={{position: 'absolute'}}>
			<RoughB t={t} />
			<Grain f={f} vig={0.45} grain={0.05} />
			{lab && <g opacity={fio(t, lab[0], lab[1], 0.4)}><Label date={lab[2]} name={lab[3]} /></g>}
			{s && <g opacity={fio(t, s[0] - 0.04, s[1] + 0.04, 0.12)}><Subs zh={s[2]} /></g>}
		</svg>
	</AbsoluteFill>;
};
registerRoot(() => <Composition id="CHKB" component={Chk} durationInFrames={4354} fps={FPS} width={W} height={H} />);
