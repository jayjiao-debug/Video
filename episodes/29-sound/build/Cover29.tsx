import React from 'react';
import {AbsoluteFill, Composition, Img, registerRoot, staticFile} from 'remotion';
import {JUNO} from '../brand/identity';

/* ep29 《为什么好听？》 covers: the film's own binaural frame (0:54 — left ear 363 Hz, right ear 369 Hz),
   hook = the 6 Hz wobble lives in neither ear, only in the brain. */
const SANS = '"Noto Sans CJK SC", sans-serif', SERIF = '"Noto Serif CJK SC", serif';
const gold: React.CSSProperties = {background: 'linear-gradient(180deg, #fff3d2 0%, #f1c56d 55%, #c8913a 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(0 6px 22px rgba(4,6,14,0.85))'};
const Hook: React.FC<{size: number; top: number}> = ({size, top}) => (
	<div style={{position: 'absolute', top, width: '100%', textAlign: 'center', fontFamily: SERIF, fontWeight: 900, fontSize: size, lineHeight: 1.18, letterSpacing: '0.04em', whiteSpace: 'nowrap'}}>
		<div style={gold}>耳朵里没有的声音</div>
		<div style={gold}>大脑却听见了</div>
	</div>
);
const Foot: React.FC<{top: number; s: number}> = ({top, s}) => (
	<div style={{position: 'absolute', top, width: '100%', textAlign: 'center'}}>
		<div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 64 * s, color: '#f3ede2', letterSpacing: '0.06em', whiteSpace: 'nowrap'}}>《为什么好听<span style={{marginRight: '-0.5em'}}>？</span>》</div>
		<div style={{fontFamily: SANS, fontWeight: 700, fontSize: 30 * s, letterSpacing: '0.42em', color: JUNO.colors.gold, opacity: 0.85, marginTop: 14 * s}}>{JUNO.series}</div>
	</div>
);
const Cover: React.FC<{layout: 'wide' | 'tall'}> = ({layout}) => {
	const wide = layout === 'wide';
	const W = wide ? 1440 : 1080;
	const s = wide ? W / 1920 : 0.62, artY = wide ? 215 : 340, artX = (W - 1920 * s) / 2;
	return (
		<AbsoluteFill style={{background: '#070a18', overflow: 'hidden'}}>
			<Img src={staticFile('cover29_bg.png')} style={{position: 'absolute', left: artX, top: artY, width: 1920 * s, height: 1080 * s}} />
			<div style={{position: 'absolute', left: artX + 1460 * s, top: artY, width: 460 * s, height: 90 * s, background: '#070a18', filter: 'blur(6px)'}} />
			<AbsoluteFill style={{background: `linear-gradient(180deg, #070a18 ${(artY / (wide ? 1080 : 1440)) * 100 - 2}%, rgba(7,10,24,0) ${(artY / (wide ? 1080 : 1440)) * 100 + 6}%, rgba(7,10,24,0) ${wide ? 78 : 58}%, #070a18 ${wide ? 92 : 69.5}%)`}} />
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(3,4,10,0.65) 100%)'}} />
			<Hook size={wide ? 118 : 104} top={wide ? 56 : 110} />
			<Foot top={wide ? 868 : 1000} s={1} />
		</AbsoluteFill>
	);
};
const Root: React.FC = () => (
	<>
		<Composition id="COVER29W" component={Cover} durationInFrames={1} fps={30} width={1440} height={1080} defaultProps={{layout: 'wide' as const}} />
		<Composition id="COVER29T" component={Cover} durationInFrames={1} fps={30} width={1080} height={1440} defaultProps={{layout: 'tall' as const}} />
	</>
);
registerRoot(Root);
