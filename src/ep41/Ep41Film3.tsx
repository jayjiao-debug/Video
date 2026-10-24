import React from 'react';
import {AbsoluteFill, Composition, Img, registerRoot, staticFile, useCurrentFrame} from 'remotion';
import {PLATES3} from './plates3';
import {W, H, FPS, SERIF, SANS, LATS, cl, fio} from './v3base';
import {Grain, Letterbox} from './fx';
import {VhsOverlay, vhsJitter, yearAt} from './vhs';
import {OPEN3} from './s41open';
import {TITLE3} from './s41title';
import {SCENES3, LETTERBOX3} from './scenes3';
import {SUBS3, LABELS3} from './subs3';
/* ep41 v3 — the cut. Fixed music map (brief_v3.md). Each scene owns its own entrance and exit (motivated transitions);
   the master switches on the music cuts, runs the VHS rewind, the title, labels, subtitles, letterbox and grain. */
export const T3 = {hit: 9.30, title: 11.564, s1: 18.965, s2: 34.836, s3: 54.875, s4: 72.80, s5: 90.63, s6: 110.17, s7: 128.282, crash: 143.895, s8: 145.43, climax: 154.54, fin: 160.67, outro: 172.64, end: 187.83};   // after the music fix at the first splice (−0.215 s), measured landmarks
const BOUNDS = [T3.s1, T3.s2, T3.s3, T3.s4, T3.s5, T3.s6, T3.s7, T3.s8, T3.fin, T3.outro, T3.end];

const sceneAt = (t: number) => { let i = -1; for (let k = 0; k < BOUNDS.length - 1; k++) if (t >= BOUNDS[k]) i = k; return i; };
const Scene: React.FC<{i: number; t: number; tau?: number}> = ({i, t, tau}) => { const C = SCENES3[i]; return <C tau={tau ?? t - BOUNDS[i]} t={t} />; };

/* the rewind: one bar. The frozen Bell frame jerks back; five eras flash past backwards with ◀◀ REW and a year counter. */
const FLASHES: [number, number, number, number][] = [   // [scene index, tau from, tau to, year] — played backwards
	[3, 12.0, 9.0, 1860],     // Scott: the drum / the moon
	[2, 16.0, 13.0, 1844],    // Morse: the key and the wire
	[2, 4.0, 1.5, 1825],      // Morse: the sealed letter
	[1, 10.5, 7.5, 757],      // Du Fu: beacons lighting (backwards: going out)
	[0, 8.0, 5.0, -1200],     // Shang: the crack spreading (backwards: closing)
];
const Rewind: React.FC<{t: number; f: number}> = ({t, f}) => {
	const tau = t - T3.hit, D = T3.title - T3.hit;
	let body: React.ReactNode, year = '1876';
	if (tau < 0.22) body = <svg width={W} height={H}><OPEN3 tau={T3.hit - 0.001} t={T3.hit} /></svg>;   // freeze
	else { const v = (tau - 0.22) / (D - 0.22), k = Math.min(FLASHES.length - 1, Math.floor(v * FLASHES.length)), loc = v * FLASHES.length - k, [si, a, b] = FLASHES[k];
		body = <Scene i={si} t={BOUNDS[si] + lerp2(a, b, loc)} tau={lerp2(a, b, loc)} />; }
	const jit = vhsJitter(f, 1);
	return <AbsoluteFill style={{background: '#000'}}>
		<AbsoluteFill style={{transform: `translateX(${jit}px) skewX(${jit * 0.08}deg)`, filter: 'saturate(0.75) contrast(1.15) brightness(0.92)'}}>{body}</AbsoluteFill>
		<svg width={W} height={H} style={{position: 'absolute'}}><VhsOverlay f={f} W={W} H={H} year={year} label={tau < 0.22 ? '❚❚ PAUSE' : '◀◀ REW'} /></svg>
	</AbsoluteFill>;
};
const lerp2 = (a: number, b: number, u: number) => a + (b - a) * u;

export const Ep41Film3: React.FC = () => {
	const f = useCurrentFrame(), t = f / FPS;
	let body: React.ReactNode;
	if (t < T3.hit) body = <svg width={W} height={H}><OPEN3 tau={t} t={t} /></svg>;
	else if (t < T3.title) body = <Rewind t={t} f={f} />;
	else if (t < T3.s1) body = <svg width={W} height={H}><TITLE3 tau={t - T3.title} t={t} dur={T3.s1 - T3.title} /></svg>;
	else body = <Scene i={sceneAt(t)} t={t} />;
	const s = SUBS3.filter(([a, b]) => t >= a - 0.05 && t < b + 0.05).pop();
	const lab = LABELS3.find(([a, b]) => t >= a && t < b);
	const lb = LETTERBOX3(t), subY = 0, endFade = 1 - cl((t - (T3.end - 1.4)) / 1.4);
	return <AbsoluteFill style={{background: '#000'}}>
		{/* SVG <image> is not tracked by delayRender: hidden <Img>s make Remotion wait until every plate is decoded */}
		<div style={{position: 'absolute', width: 1, height: 1, overflow: 'hidden', opacity: 0}}>{PLATES3.map((p) => <Img key={p} src={staticFile(p)} style={{width: 1, height: 1}} />)}</div>
		<AbsoluteFill style={{opacity: endFade}}>{body}</AbsoluteFill>
		<svg width={W} height={H} style={{position: 'absolute'}}>
			<Letterbox k={lb} />
			<Grain f={f} vig={0.45} grain={0.05} />
			<defs><linearGradient id="subBand3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.5" /></linearGradient>
				<radialGradient id="lblS3" cx="0.2" cy="0.3" r="0.8"><stop offset="0" stopColor="#000" stopOpacity="0.45" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient></defs>
			{s && lb < 0.5 && <rect x={0} y={860} width={W} height={220} fill="url(#subBand3)" opacity={0.9} />}
			{lab && <g opacity={fio(t, lab[0], lab[1], 0.5)} transform={`translate(0,${lb * 50})`}><ellipse cx={330} cy={130} rx={420} ry={150} fill="url(#lblS3)" />
				<rect x={96} y={96} width={40} height={5} fill="#e0453a" /><text x={148} y={106} style={{fontFamily: SANS, fontWeight: 500, fontSize: 28, letterSpacing: '0.06em'}} fill="#fff" opacity={0.9}>{lab[2]}</text>
				<text x={96} y={160} style={{fontFamily: SERIF, fontWeight: 900, fontSize: 44, letterSpacing: '0.04em'}} fill="#fff">{lab[3]}</text></g>}
			{s && <g opacity={fio(t, s[0] - 0.05, s[1] + 0.05, 0.15)} transform={`translate(0,${subY})`}>
				{s[3] && <text x={W / 2} y={962} textAnchor="middle" style={{fontFamily: /[a-zA-Z]/.test(s[3]) ? LATS : SERIF, fontSize: s[3].length > 60 ? 28 : 33, fontStyle: /[a-zA-Z]/.test(s[3]) ? 'italic' : 'normal'}} fill="#fff" opacity={0.88} stroke="rgba(0,0,0,0.45)" strokeWidth={4} paintOrder="stroke">{s[3]}</text>}
				<text x={W / 2} y={s[3] ? 1022 : 1006} textAnchor="middle" style={{fontFamily: SANS, fontSize: s[2].length > 22 ? 42 : 48, fontWeight: 700, letterSpacing: '0.03em'}} fill="#ffe6b0" stroke="rgba(0,0,0,0.65)" strokeWidth={7} paintOrder="stroke">{s[2]}</text></g>}
		</svg>
	</AbsoluteFill>;
};
registerRoot(() => <Composition id="EP41V3" component={Ep41Film3} durationInFrames={Math.round(T3.end * FPS)} fps={FPS} width={W} height={H} />);
void H;
