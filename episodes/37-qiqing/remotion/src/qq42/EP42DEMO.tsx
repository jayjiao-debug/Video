import React from 'react';
import {AbsoluteFill, Composition, Img, registerRoot, staticFile, useCurrentFrame} from 'remotion';
import {W, H, Grain, Label, Subs} from './kit42';
import {DT, ColdOpen, Rewind, Title, Egypt} from './demo42';
/* ep42 demo: film 0–32.27 (968 frames). Scenes switch on the music map; subtitles and labels in the ep41 v3 style. */
const FPS = 30;
const SUBS: [number, number, string][] = [
	[0.0, 2.26, '“人活着，到底为了什么？”'],
	[2.27, 4.87, '凌晨三点，你也搜过吧？'],
	[5.097, 8.9, '[近四千年前]，就有人写下了这个问题。'],
	[9.06, 11.86, '而泥板上的答案，和[哈佛]一样。'],
	[18.682, 22.48, '一卷埃及[莎草纸]上，无名诗人写下：'],
	[22.645, 26.09, '一个人，和自己的灵魂吵了起来。'],
	[26.607, 30.75, '人人自私贪心，这样活着，[值不值]？'],
];
const LABELS: [number, number, string, string][] = [[0.25, 8.85, '今天', '凌晨 3:07'], [19.6, 40, '约公元前 1850 年', '古埃及']];
const fio = (t: number, a: number, b: number, f: number) => Math.max(0, Math.min(1, (t - a) / f, (b - t) / f));
const Demo: React.FC = () => {
	const f = useCurrentFrame(), t = f / FPS;
	let body: React.ReactNode;
	if (t < DT.hit) body = <ColdOpen t={t} />;
	else if (t < DT.title) body = <Rewind tau={t - DT.hit} t={t} />;
	else if (t < DT.egypt - 0.32) body = <Title tau={t - DT.title} t={t} />;
	else if (t < DT.egypt + 0.3) { const k = Math.max(0, Math.min(1, (t - (DT.egypt - 0.32)) / 0.62)), u = k * k * (3 - 2 * k);
		body = <><Egypt tau={t - DT.egypt} t={t} /><g opacity={1 - u}><Title tau={t - DT.title} t={t} /></g></>; }
	else body = <Egypt tau={t - DT.egypt} t={t} />;
	const s = SUBS.find(([a, b]) => t >= a && t < b), lab = LABELS.find(([a, b]) => t >= a && t < b);
	return <AbsoluteFill style={{background: '#000'}}>
		<div style={{position: 'absolute', width: 1, height: 1, overflow: 'hidden', opacity: 0}}><Img src={staticFile('ep42/nile.webp')} style={{width: 1, height: 1}} /></div>
		<svg width={W} height={H} style={{position: 'absolute'}}>
			{body}
			<Grain f={f} vig={0.45} grain={0.05} />
			{lab && <g opacity={fio(t, lab[0], lab[1], 0.5)}><Label date={lab[2]} name={lab[3]} /></g>}
			{s && <g opacity={fio(t, s[0] - 0.04, s[1] + 0.04, 0.12)}><Subs zh={s[2]} /></g>}
		</svg>
	</AbsoluteFill>;
};
registerRoot(() => <Composition id="EP42DEMO" component={Demo} durationInFrames={968} fps={FPS} width={W} height={H} />);
