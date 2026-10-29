import React from 'react';
import {Img} from 'remotion';
import {W, H, seg, land, lerp, cl, SANS, SERIF, SAFE_X} from '../qq50/kit50';
import {B, Pool, thB} from '../qq50/styleB';
import {SEAL_SRC} from '../qq44/skin44';
import {proj} from './parts53';
import {Sword3D} from './sword3d';
import {Cleaver, Kitchen, CAM0, SW_HOOK} from './kfA53';
import {TITLE53, SOURCES53} from './lines53';
import {END_Q53} from './kfF53';
import {CARD_T53, frameOf} from './master53';
/* ep53 · TakeD, the end (leg 18): the held kitchen (frame 0's framing, the sword only a faint glow in the window) with the
   Juno end card on it. KF14's layout; the J stamp is complete on frame f3274 (the downbeat 109.125), nothing before it. */
export const KitchenEnd: React.FC<{glow?: number}> = ({glow = 1}) => { const c = CAM0, mid = proj(c, [480, -19, 0]);
	return <g>
		<defs><filter id="k14Far" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4" /></filter></defs>
		<Kitchen c={c} />
		<Pool id="k14d" x={mid[0]} y={mid[1]} rx={560} ry={330} a={0.75} col="#080403" />
		<Pool id="k14s" x={mid[0] - 20} y={mid[1] + 10} rx={300} ry={170} a={0.2 * glow} col="#FFB868" />
		<g filter="url(#k14Far)" opacity={0.4 * glow}><Sword3D c={c} sp={SW_HOOK} id="k14s" /></g>
		<Cleaver c={c} rho={0.95} />
	</g>; };
const fade = (t: number, a: number, d = 0.4) => seg(t, a, a + d);
export const EndCardAnim: React.FC<{t: number}> = ({t}) => {
	const f0 = frameOf(CARD_T53), f = frameOf(t), T0 = f0 / 30;
	const fs = 76, q = END_Q53, tw = fs * q.length * 1.03, [t1, t2] = TITLE53;
	const dim = 0.72 * seg(t, T0 - 0.1, T0 + 0.35);
	const title = fade(t, T0 + 0.35), qq = fade(t, T0 + 0.7), pill = t >= T0 + 1.2 ? land(seg(t, T0 + 1.2, T0 + 1.6)) : 0, src = fade(t, T0 + 1.3);
	const jolt = f >= f0 && f - f0 < 18 ? 1 + 0.045 * Math.exp(-(f - f0) / 5) * Math.cos(2 * Math.PI * (f - f0) / 8) : 1;
	return <div style={{position: 'absolute', inset: 0}}>
		<div style={{position: 'absolute', inset: 0, background: `rgba(8,4,3,${dim})`}} />
		{f >= f0 && <Img src={SEAL_SRC} style={{position: 'absolute', left: 960 - 70, top: 120, width: 140, height: 140, transform: `rotate(-6deg) scale(${jolt})`, filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.5))'}} />}
		<div style={{position: 'absolute', left: 0, right: 0, top: 290, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 60, lineHeight: 1.35, letterSpacing: '0.05em', color: B.gold, textShadow: thB.halo, whiteSpace: 'nowrap', opacity: title}}>
			{t1.slice(0, -1)}<span style={{marginRight: '-0.05em'}}>{t1.slice(-1)}</span><br />{t2.slice(0, -1)}<span style={{marginRight: '-0.55em'}}>{t2.slice(-1)}</span></div>
		<div style={{position: 'absolute', left: 960 - tw / 2 - 260, top: 560 - 150, width: tw + 520, height: fs * 1.5 + 300, opacity: qq, background: 'radial-gradient(closest-side, rgba(16,7,4,0.42), rgba(16,7,4,0.36) 45%, rgba(16,7,4,0.15) 80%, rgba(16,7,4,0))'}} />
		<div style={{position: 'absolute', left: 0, right: 0, top: 560 + 10 * (1 - qq), opacity: qq, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: fs, lineHeight: 1.5, letterSpacing: '0.03em', color: thB.ink, textShadow: thB.halo, whiteSpace: 'nowrap'}}>{q.slice(0, -1)}<span style={{marginRight: '-0.53em'}}>{q.slice(-1)}</span></div>
		{pill > 0 && <div style={{position: 'absolute', left: 760, top: 790, width: 400, height: 58, borderRadius: 29, border: `2px solid ${B.gold}`, background: 'rgba(255,217,138,0.08)', textAlign: 'center', lineHeight: '58px', fontFamily: SERIF, fontWeight: 700, fontSize: 28, letterSpacing: '0.1em', color: B.gold, opacity: cl(pill * 2), transform: `scale(${lerp(0.9, 1, pill)})`}}>关注 Juno · 一起看懂世界</div>}
		<div style={{position: 'absolute', left: SAFE_X, right: SAFE_X, top: 905, textAlign: 'center', fontFamily: SANS, fontSize: 24, lineHeight: 1.6, color: '#F2E6CC', opacity: 0.78 * src, whiteSpace: 'nowrap'}}>{SOURCES53}</div>
	</div>; };
export const FADE_OUT_T = 113.633 - 0.5;
void W; void H;
