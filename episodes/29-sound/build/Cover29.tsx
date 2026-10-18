import React from 'react';
import {AbsoluteFill, Composition, Img, registerRoot, staticFile} from 'remotion';

/* ep29 《为什么好听？》 covers (owner: "too much text, not strong visual"): the film's own title-drop frame at 1:24.7 —
   the particle title bursting inside the neon sound rings — and nothing else. Its own VIBE知识大赏 line is the series mark. */
const HERO = 'cover29_hero.png';
const Cover: React.FC<{layout: 'wide' | 'tall'}> = ({layout}) => {
	if (layout === 'wide') {
		return (
			<AbsoluteFill style={{background: '#05060d', overflow: 'hidden'}}>
				<Img src={staticFile(HERO)} style={{position: 'absolute', left: -240, top: 0, width: 1920, height: 1080}} />
				<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 62%, rgba(3,4,10,0.45) 100%)'}} />
			</AbsoluteFill>
		);
	}
	const s = 0.75, top = 330;                                     // the title spans ~67…1012 px: inside the 6 % margins
	const fade = 'linear-gradient(180deg, transparent 0%, #000 14%, #000 86%, transparent 100%)';
	return (
		<AbsoluteFill style={{background: '#05060d', overflow: 'hidden'}}>
			<Img src={staticFile(HERO)} style={{position: 'absolute', left: (1080 - 2560) / 2, top: 0, width: 2560, height: 1440, filter: 'blur(28px) brightness(0.5) saturate(1.2)'}} />
			<Img src={staticFile(HERO)} style={{position: 'absolute', left: (1080 - 1920 * s) / 2, top, width: 1920 * s, height: 1080 * s, WebkitMaskImage: fade, maskImage: fade}} />
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(3,4,10,0.55) 100%)'}} />
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
