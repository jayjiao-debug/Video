import React from 'react';
import {AbsoluteFill, Composition, registerRoot} from 'remotion';
import {JUNO} from '../brand/identity';
import {SANS, SERIF, P, PaperDefs} from './paper28';
import {Rest} from './Rest28';

/* ep28 covers: the film's own peak frame (the great field after the 2:48 drop, everyone in the light, every heart
   full), with only the title — the owner wants no extra hook text. */
const T = 179.4;
const Scene: React.FC<{s: number; x: number; y: number}> = ({s, x, y}) => (
	<svg width={1920 * s} height={1080 * s} viewBox="0 0 1920 1080" style={{position: 'absolute', left: x, top: y}}>
		<PaperDefs />
		<defs>
			<radialGradient id="pool28">
				<stop offset="0" stopColor={P.lampHi} stopOpacity="1" /><stop offset="0.45" stopColor={P.lamp} stopOpacity="0.92" />
				<stop offset="0.8" stopColor={P.lampLo} stopOpacity="0.35" /><stop offset="1" stopColor={P.lampLo} stopOpacity="0" />
			</radialGradient>
		</defs>
		<Rest t={T} />
		<rect width={1920} height={1080} filter="url(#fiber)" opacity={0.55} style={{mixBlendMode: 'multiply'}} />
		<rect width={1920} height={1080} filter="url(#grain)" opacity={0.22} style={{mixBlendMode: 'multiply'}} />
	</svg>
);
const Title: React.FC<{size: number; top: number; split?: boolean}> = ({size, top, split}) => (
	<div style={{position: 'absolute', top, width: '100%', textAlign: 'center'}}>
		<div style={{fontFamily: SANS, fontWeight: 700, fontSize: size * 0.24, letterSpacing: '0.42em', color: JUNO.colors.gold, opacity: 0.9}}>{JUNO.series}</div>
		<div style={{fontFamily: SERIF, fontWeight: 700, fontSize: size, letterSpacing: '0.03em', lineHeight: 1.15, whiteSpace: 'nowrap', marginTop: size * 0.08, background: 'linear-gradient(180deg, #fff3d2 0%, #f1c56d 55%, #c8913a 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(0 6px 22px rgba(10,6,12,0.75))'}}>{split ? <>生命<br />平等吗<span style={{marginRight: '-0.5em'}}>？</span></> : <>生命平等吗<span style={{marginRight: '-0.5em'}}>？</span></>}</div>
	</div>
);
const Cover: React.FC<{layout: 'wide' | 'tall'}> = ({layout}) => {
	const wide = layout === 'wide';
	const W = wide ? 1440 : 1080, H = wide ? 1080 : 1440;
	const s = wide ? 0.76 : 0.6;             // the scene, scaled to show the whole field
	const sx = (W - 1920 * s) / 2, sy = wide ? H - 1080 * s + 30 : 470;
	return (
		<AbsoluteFill style={{background: `linear-gradient(180deg, ${P.duskTop}, ${P.dusk} 55%, ${P.duskLow})`, overflow: 'hidden'}}>
			<Scene s={s} x={sx} y={sy} />
			<AbsoluteFill style={{background: `linear-gradient(180deg, rgba(43,37,50,0) ${wide ? 82 : 66}%, #2b2532 ${wide ? 100 : 77.5}%)`}} />
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 55%, rgba(0,0,0,0) 55%, rgba(14,10,18,0.6) 100%)'}} />
			<AbsoluteFill style={{background: `linear-gradient(180deg, rgba(20,16,26,0.85) 0%, rgba(20,16,26,0.35) ${wide ? 30 : 34}%, rgba(20,16,26,0) ${wide ? 44 : 46}%)`}} />
			<Title size={wide ? 168 : 150} top={wide ? 70 : 170} />
		</AbsoluteFill>
	);
};
const Root: React.FC = () => (
	<>
		<Composition id="COVER28W" component={Cover} durationInFrames={1} fps={30} width={1440} height={1080} defaultProps={{layout: 'wide' as const}} />
		<Composition id="COVER28T" component={Cover} durationInFrames={1} fps={30} width={1080} height={1440} defaultProps={{layout: 'tall' as const}} />
	</>
);
registerRoot(Root);
