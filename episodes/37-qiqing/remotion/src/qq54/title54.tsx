import React from 'react';
import {W, seg, cl, SERIF} from '../qq50/kit50';
import {thB} from '../qq50/styleB';
/* ep54 · the title card over film 12.61–16.59 (bar 6 → bar 8), drawn on top of the 洛阳 wide. Owner: "这个title的画风做的更符合这个故事"
   (make the title's art fit the story). TitleArt is the whole title layer; demo54core.Overlay draws it during the title window. */
export const TITLE_A = 0.654 + 1.99203 * 6, TITLE_B = 0.654 + 1.99203 * 8;
/** the title on bar 6: slams in (scale 1.18 → 1 over 5 frames, a soft flash), holds, lifts off before bar 8 */
export const TitleArt: React.FC<{t: number}> = ({t}) => { const u = cl((t - TITLE_A) * 30 / 5), k = 1.18 - 0.18 * (1 - Math.pow(1 - u, 3)), out = 1 - seg(t, TITLE_B - 0.35, TITLE_B);
	const flash = Math.max(0, 1 - (t - TITLE_A) * 30 / 6) * 0.35;
	return <>
		<div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 46%, rgba(8,5,4,0.62) 0%, rgba(8,5,4,0.35) 45%, rgba(8,5,4,0) 75%)', opacity: out}} />
		{flash > 0.004 && <div style={{position: 'absolute', inset: 0, background: '#F3DDB4', opacity: flash}} />}
		<div style={{position: 'absolute', left: 0, top: 300, width: W, textAlign: 'center', transform: `scale(${k})`, opacity: out, color: '#FFF3DC', fontFamily: SERIF, textShadow: thB.halo}}>
			<div style={{fontSize: 168, fontWeight: 900, letterSpacing: '0.18em', lineHeight: 1.1}}>曹操</div>
			<div style={{fontSize: 74, fontWeight: 800, marginTop: 26, color: '#8FD0DC', letterSpacing: '0.06em'}}>到底是英雄，还是奸雄？</div>
		</div></>; };
