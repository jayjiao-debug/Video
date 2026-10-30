import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {W, H, seg} from '../qq50/kit50';
import {LacDefs, Vignette} from '../qq50/styleB';
import {Cam, V3, proj, camBasis, toCam} from './parts53';
import {Sword3D} from './sword3d';
import {camAt, Museum, Ground53, SP} from './take53';
import {worldCam, toMM, CASE_X} from './scene53d';
import {HallBack, CaseHall} from './hall53d';
import {DisplayFront, titleQuadOn} from './display53k';
import {TitleOnGlass} from './master53';
import {sstep} from './cam53';
/* ep53 · DISPLAY53K — a TEST composition (not in the film): the v3 lectern display (display53k) seen through the film's own cameras
   dollied in along their view axis until the sword fills the target share of the frame width (60 % while the title is etched on the
   hood, 9.5–11.764 s; 48 % in the wide hall views and back in the museum at the end). It shows the framing the v3 re-time can use: the
   whole hood stays inside the frame. Frames = film time × 30. The sword is sword3d's level Sword3D (the film's own renderer is the
   other engineer's). */
const pull = (c: Cam, sw: [V3, V3], target: number): Cam => { const a = proj(c, sw[0]), b = proj(c, sw[1]), frac = Math.abs(b[0] - a[0]) / W;
	const mid: V3 = [(sw[0][0] + sw[1][0]) / 2, (sw[0][1] + sw[1][1]) / 2, (sw[0][2] + sw[1][2]) / 2], D = toCam(c, mid)[2], k = Math.min(1, frac / target);
	const {F} = camBasis(c), s = (1 - k) * D; return {...c, p: [c.p[0] + F[0] * s, c.p[1] + F[1] * s, c.p[2] + F[2] * s]}; };
const Demo: React.FC<{t: number}> = ({t}) => {
	const target = t < 11.764 ? 0.6 : 0.48;
	if (t < 30) { const c = pull(camAt(t), [[-278, 0, 1000], [278, 0, 1000]], target), lite = sstep(seg(t, 9.9, 11.3)) * (1 - sstep(seg(t, 17.0, 18.8)));
		return <AbsoluteFill style={{background: '#0F0806'}}>
			<svg width={W} height={H} style={{position: 'absolute'}}><LacDefs />
				<Ground53 id="dm" k={0.35} />
				<Museum c={c} t={t} hall={1} hood={1} ppl={sstep(seg(t, 11.3, 12.9))} lite={lite} />
				<Sword3D c={c} sp={SP} id="dms" />
				<DisplayFront c={c} hood={1} />
				<Vignette id="dm" a={0.6} /></svg>
			<TitleOnGlass t={t} quad={t >= 9.5 && t < 11.764 ? titleQuadOn(c) : null} /></AbsoluteFill>; }
	const X = CASE_X * 1000, cw = toMM(worldCam(t)), cm = pull(cw, [[-278 + X, 0, 1000], [278 + X, 0, 1000]], target), cc: Cam = {...cm, p: [cm.p[0] - X, cm.p[1], cm.p[2]]};
	return <AbsoluteFill style={{background: '#0F0806'}}>
		<svg width={W} height={H} style={{position: 'absolute'}}><LacDefs />
			<Ground53 id="dm" k={0.35} />
			<HallBack cm={cm} hall={1} lite={0.9} />
			<CaseHall cm={cm} t={t} hood={1} lite={0.9} />
			<Sword3D c={cc} sp={SP} id="dms" />
			<DisplayFront c={cc} hood={1} />
			<Vignette id="dm" a={0.6} /></svg></AbsoluteFill>; };
const DemoC: React.FC = () => <Demo t={useCurrentFrame() / 30} />;
const Root: React.FC = () => <Composition id="DISPLAY53K" component={DemoC} width={W} height={H} fps={30} durationInFrames={3409} />;
registerRoot(Root);
