import React from 'react';
import {W, H, seg} from '../qq50/kit50';
import {Pool, Vignette} from '../qq50/styleB';
import {sstep} from './cam53';
import {TakeC} from './take53c';
import {Chamber53} from './scene53c';
import {BladeFlat, MarkSet} from './blade53c';
import {litOf, hexMix, LATC} from './inscr53c';
import {homog} from './kfG53';
import {T0F, T1F, A_C0, glideAt, mapG, vigK} from './cam53g';
import {Reflection53g, px, PK, PW, lobeK} from './shadow53g';
/* ep53 v3 TakeG, 51.954 → 92.709: the 勾践 thread, ONE camera move (cam53g). Frame 1559 and frame 2781 ARE v2 TakeC at 56.482
   (the inscription view after 鸠浅＝勾践, which the paper test starts from). In between, the paper test's picture (the same
   blade53c.BladeFlat / MarkSet from the one sword spec, the same lit marks, the same ground, pool and vignette) seen through
   cam53g: the camera drops low over the face beside the inscription, glides toward the tip while the story plays as a shadow
   play mirrored in the bronze (shadow53g, on a panel mapped by the camera's homography, the spec lattice over it), then rises
   and slides back to the hand-off view. The v2 hand-off frame is a 50/50 blend of Chamber53 and Paper53: Chamber53's share
   fades out over the first 0.4 s and back in over the last 0.4 s, riding with the blade. */
const lit = (side: number, n: number) => Math.min(1, litOf(side, n, 56.482));
const col = (side: number, n: number) => hexMix(LATC, '#FFF2C8', lit(side, n));
export const TakeG: React.FC<{t: number}> = ({t}) => {
	const fr = Math.round(t * 30);
	if (fr <= Math.round(T0F * 30) || fr >= Math.round(T1F * 30)) return <TakeC t={56.482} />;
	const g = glideAt(t), S = mapG(t);
	/* the Chamber53 share of the v2 blend: continues its own glide (0.83 cm/s) at the start; at the end it is the 56.482 picture
       shifted with the blade (the camera is face-on again by then) */
	const g0 = 0.5 * (1 - sstep(seg(t, T0F, T0F + 0.4))), g1 = 0.5 * sstep(seg(t, T1F - 0.4, T1F));
	const ref = [0, 1, 2, 3, 4, 6].some((i) => vigK(i, t) > 0.004) || lobeK(t) > 0.004;
	const a0 = g.a - 9, a1 = g.a + 15, ww = (a1 - a0) * PK, hh = 2 * PW * PK, q = [S(a1, PW), S(a0, PW), S(a0, -PW), S(a1, -PW)];
	return <>
		<svg width={W} height={H} style={{position: 'absolute'}}>
			<rect x={-40} y={-40} width={W + 80} height={H + 80} fill="#24100C" />
			<BladeFlat S={S} id="g53g" />
		</svg>
		{ref && <div style={{position: 'absolute', left: 0, top: 0, width: ww, height: hh, transformOrigin: '0 0', transform: homog(q, ww, hh)}}>
			<svg width={ww} height={hh} viewBox={`${px(a1)} 0 ${ww} ${hh}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}><Reflection53g t={t} a0={a0} a1={a1} /></svg></div>}
		<svg width={W} height={H} style={{position: 'absolute'}}>
			<MarkSet id="g53g" S={S} o={1} col={col} lit={lit} />
			<Pool id="g53gp" x={960} y={640} rx={1100} ry={380} a={0.22} col="#FFC070" />
			<Vignette id="g53gv" a={0.55} />
		</svg>
		{g0 > 0.004 && <div style={{position: 'absolute', inset: 0, opacity: g0}}><Chamber53 t={56.482 + (t - T0F)} /></div>}
		{g1 > 0.004 && <div style={{position: 'absolute', inset: 0, opacity: g1, transform: `translate(${((g.a - A_C0) * 76).toFixed(2)}px,0)`}}><Chamber53 t={56.482} /></div>}
	</>;
};
