import React from 'react';
import {Img} from 'remotion';
import {seg, land, lerp, cl, SANS, SERIF, SAFE_X} from '../qq50/kit50';
import {B, thB} from '../qq50/styleB';
import {SEAL_SRC} from '../qq44/skin44';
import {TITLE53} from './lines53';
import {END_Q53} from './kfF53';
import {SOURCES53V3, CARD_T3, END_SUB53, LINES53V3} from './lines53v3';
import {frame3, LEN3} from './v3map53';
/* ep53 v3 · the end card (TakeD3, 140.824 → 145.333) on the held museum picture (v3.4: TakeA at the title shot, take53d3/museum53e4): v2's EndCardAnim re-timed. The J stamp is complete on
   f4225 (= frame3(140.824)), absent on f4224; title +0.35, question +0.7, pill +1.2, sources +1.3 (SOURCES53V3, two rows, 24 px);
   the card holds 4.0 s, then a 0.5 s fade to black that is complete on the film's last frame (4359). */
export const CARD_F3 = frame3(CARD_T3);
export const FADE3: [number, number] = [(frame3(LEN3) - 1) / 30 - 0.5, (frame3(LEN3) - 1) / 30];
const fade = (t: number, a: number, d = 0.4) => seg(t, a, a + d);
export const EndCard3: React.FC<{t: number}> = ({t}) => {
	const f0 = CARD_F3, f = frame3(t), T0 = f0 / 30;
	const fs = 76, q = LINES53V3.find((l) => l.id === 'END')?.s ?? END_Q53, tw = fs * q.length * 1.03, [t1, t2] = TITLE53;
	const dim = 0.72 * seg(t, T0 - 0.1, T0 + 0.35);
	const title = fade(t, T0 + 0.35), qq = fade(t, T0 + 0.7), pill = t >= T0 + 1.2 ? land(seg(t, T0 + 1.2, T0 + 1.6)) : 0, src = fade(t, T0 + 1.3);
	const jolt = f >= f0 && f - f0 < 18 ? 1 + 0.045 * Math.exp(-(f - f0) / 5) * Math.cos(2 * Math.PI * (f - f0) / 8) : 1;
	return <div style={{position: 'absolute', inset: 0}}>
		<div style={{position: 'absolute', inset: 0, background: `rgba(8,4,3,${dim})`}} />
		{f >= f0 && <Img src={SEAL_SRC} style={{position: 'absolute', left: 960 - 70, top: 120, width: 140, height: 140, transform: `rotate(-6deg) scale(${jolt})`, filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.5))'}} />}
		<div style={{position: 'absolute', left: 0, right: 0, top: 290, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 60, lineHeight: 1.35, letterSpacing: '0.05em', color: B.gold, textShadow: thB.halo, whiteSpace: 'nowrap', opacity: title}}>
			{t1.slice(0, -1)}<span style={{marginRight: '-0.05em'}}>{t1.slice(-1)}</span><br />{t2.slice(0, -1)}<span style={{marginRight: '-0.55em'}}>{t2.slice(-1)}</span></div>
		<div style={{position: 'absolute', left: 960 - tw / 2 - 260, top: 560 - 150, width: tw + 520, height: fs * 1.5 + 300, opacity: qq, background: 'radial-gradient(closest-side, rgba(16,7,4,0.42), rgba(16,7,4,0.36) 45%, rgba(16,7,4,0.15) 80%, rgba(16,7,4,0))'}} />
		{/* v3.4: the small row under the question (the answers people give in the comments) */}
		<div style={{position: 'absolute', left: 0, right: 0, top: 690 + 10 * (1 - qq), opacity: 0.92 * qq, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 40, letterSpacing: '0.06em', color: '#E8DCC6', textShadow: thB.halo, whiteSpace: 'nowrap'}}>{END_SUB53.slice(0, -1)}<span style={{marginRight: '-0.5em'}}>{END_SUB53.slice(-1)}</span></div>
		<div style={{position: 'absolute', left: 0, right: 0, top: 560 + 10 * (1 - qq), opacity: qq, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: fs, lineHeight: 1.5, letterSpacing: '0.03em', color: thB.ink, textShadow: thB.halo, whiteSpace: 'nowrap'}}>{q.slice(0, -1)}<span style={{marginRight: '-0.53em'}}>{q.slice(-1)}</span></div>
		{pill > 0 && <div style={{position: 'absolute', left: 760, top: 776, width: 400, height: 58, borderRadius: 29, border: `2px solid ${B.gold}`, background: 'rgba(255,217,138,0.08)', textAlign: 'center', lineHeight: '58px', fontFamily: SERIF, fontWeight: 700, fontSize: 28, letterSpacing: '0.1em', color: B.gold, opacity: cl(pill * 2), transform: `scale(${lerp(0.9, 1, pill)})`}}>关注 Juno · 一起看懂世界</div>}
		<div style={{position: 'absolute', left: SAFE_X, right: SAFE_X, top: 880, textAlign: 'center', fontFamily: SANS, fontSize: 24, lineHeight: 1.6, color: '#D8CCB6', opacity: 0.88 * src, whiteSpace: 'nowrap', textShadow: '0 1px 3px rgba(0,0,0,0.8)'}}>
			{SOURCES53V3[0]}<br />{SOURCES53V3[1]}</div>
		<div style={{position: 'absolute', inset: 0, background: '#000', opacity: seg(t, FADE3[0], FADE3[1])}} />
	</div>; };
