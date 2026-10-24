import React from 'react';
import {AbsoluteFill, Composition, Img, registerRoot, staticFile, useCurrentFrame} from 'remotion';
import {W, H, Grain, Label, Subs} from './kit42';
import {T, HookPhone, Harvard, TabletShot, Rush, Egypt2} from './demo42b';
/* ep42 demo v2: film 0–25.5 (765 frames). Hook (phone → Harvard → tablet), HIT 9.060 rewind, Egypt from 11.891 with the title inked on the papyrus. */
const FPS = 30;
const SUBS: [number, number, string][] = [
	[0.0, 2.26, '“人活着，到底为了什么？”'],
	[2.27, 4.9, '哈佛追踪[724]个人八十多年，'],
	[5.02, 6.14, '找到了答案。'],
	[6.23, 8.76, '可这个答案，[近四千年前]，'],
	[8.83, 10.42, '就刻在一块[泥板]上。'],
	[11.891, 15.62, '一卷埃及[莎草纸]上，无名诗人写下：'],
	[15.85, 19.45, '一个人，和自己的灵魂吵了起来。'],
	[19.82, 24.2, '人人自私贪心，这样活着，[值不值]？'],
];
const LABELS: [number, number, string, string][] = [[0.15, 2.2, '今天', '凌晨 3:07'], [2.6, 6.1, '1938 年起', '哈佛大学 · 美国'], [16.9, 40, '约公元前 1850 年', '古埃及']];
const fio = (t: number, a: number, b: number, f: number) => Math.max(0, Math.min(1, (t - a) / f, (b - t) / f));
const Demo: React.FC = () => {
	const f = useCurrentFrame(), t = f / FPS;
	let body: React.ReactNode;
	if (t < T.harvard) body = <HookPhone t={t} />;
	else if (t < T.tablet) body = <Harvard t={t} />;
	else if (t < T.hit) body = <TabletShot t={t} />;
	else if (t < T.egypt - 0.3) body = <Rush t={t} />;
	else if (t < T.egypt) { const k = (t - (T.egypt - 0.3)) / 0.3, u = k * k * (3 - 2 * k); body = <><Egypt2 t={T.egypt} /><g opacity={1 - u}><Rush t={t} /></g></>; }
	else body = <Egypt2 t={t} />;
	const s = SUBS.find(([a, b]) => t >= a && t < b), lab = LABELS.find(([a, b]) => t >= a && t < b);
	return <AbsoluteFill style={{background: '#000'}}>
		<div style={{position: 'absolute', width: 1, height: 1, overflow: 'hidden', opacity: 0}}><Img src={staticFile('ep42/nile.webp')} style={{width: 1, height: 1}} /></div>
		<svg width={W} height={H} style={{position: 'absolute'}}>
			{body}
			<Grain f={f} vig={0.45} grain={0.05} />
			{lab && <g opacity={fio(t, lab[0], lab[1], 0.4)}><Label date={lab[2]} name={lab[3]} /></g>}
			{s && <g opacity={fio(t, s[0] - 0.04, s[1] + 0.04, 0.12)}><Subs zh={s[2]} /></g>}
		</svg>
	</AbsoluteFill>;
};
registerRoot(() => <Composition id="EP42DEMO" component={Demo} durationInFrames={765} fps={FPS} width={W} height={H} />);
