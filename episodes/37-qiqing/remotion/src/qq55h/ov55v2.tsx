import React from 'react';
import {Subs, Stamp, Seal, SANS} from '../qq50/kit50';
import {thK, f1} from './kf55h';
import {Counter, NoteStamp, Centre} from './kfall55h';
import {Card2, nextT2, FILM_END} from './cards55v2';
/* ep55 · script v2 — the ONE overlay every act uses (subtitles, stamp, counter, seal, the measure label).
   Usage inside a scene: <FilmOv2 t={t} c={card2('K')} measure={box} />  (measure only when the 尊 is drawn enlarged
   next to people or a set at a size that is not its real one; pass its screen box). */
const W = 1920, H = 1080;
const cl = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const seg = (t: number, a: number, b: number) => cl((t - a) / (b - a));
export const CPS = 16;                       /* typing speed (house value) */
const plain = (s: string) => s.replace(/[[\]]/g, '');

export type MBox = {x: number; y0: number; y1: number};
/** 「高 38.8 厘米 · 示意放大」 beside the 尊: a thin rule from its rim (y0) to its foot (y1) at x, with 10/20/30 cm ticks */
export const MeasureLabel: React.FC<{b: MBox; o?: number}> = ({b, o = 0.6}) => { const {x, y0, y1} = b, c = '#F2E6CC';
	return <svg width={W} height={H} style={{position: 'absolute', opacity: o}}>
		<g stroke={c} strokeWidth={1.6} fill="none"><path d={`M${f1(x)},${f1(y0)} L${f1(x)},${f1(y1)}`} /><path d={`M${f1(x - 7)},${f1(y0)} L${f1(x + 7)},${f1(y0)} M${f1(x - 7)},${f1(y1)} L${f1(x + 7)},${f1(y1)}`} />
			{[10, 20, 30].map((cm) => { const y = y1 - ((y1 - y0) * cm) / 38.8; return <path key={cm} d={`M${f1(x)},${f1(y)} L${f1(x + 5)},${f1(y)}`} />; })}</g>
		<text x={x + 14} y={y1 - 34} fontFamily={SANS} fontWeight={500} fontSize={24} fill={c} letterSpacing={1}>高 38.8 厘米</text>
		<text x={x + 14} y={y1 - 6} fontFamily={SANS} fontWeight={400} fontSize={22} fill={c} letterSpacing={2}>示意放大</text>
	</svg>; };

/** the rolling counter for the burial card: 0 → 约3000 across the card */
const rollAge = (t: number, c: Card2) => { const u = seg(t, c.t + 0.4, nextT2(c.id) - 0.3), e = u * u * (3 - 2 * u); return String(Math.round(e * 2990)); };

/** subtitles type at CPS from the card start (card 1 is whole from frame 0); the stamp fades in after typing; counter + seal */
export const FilmOv2: React.FC<{t: number; c: Card2; measure?: MBox | null; measureO?: number; hideCounter?: boolean}> = ({t, c, measure, measureO = 0.6, hideCounter}) => {
	const rows = c.rows ?? [], typed = c.t === 0 ? 1e9 : (t - c.t) * CPS, r0 = rows[0] ? plain(rows[0]).length : 0;
	const n = [Math.min(r0, typed), Math.max(0, typed - r0)];
	const total = plain(rows.join('')).length, stampU = c.t === 0 ? 1 : seg(typed, total + 6, total + 6 + 0.35 * CPS);
	const mode = c.mode ?? 'tl', none = mode === 'none';
	const bigU = seg(t, c.t, c.t + 0.18);
	return <>
		{measure && <MeasureLabel b={measure} o={measureO} />}
		{!none && mode === 'tl' && rows.length > 0 && <Subs rows={rows.map((s, i) => ({s, n: n[i] ?? 0}))} th={thK} />}
		{!none && mode === 'big' && rows.length > 0 && <div style={{position: 'absolute', inset: 0, opacity: bigU, transform: `scale(${(1.06 - 0.06 * bigU).toFixed(4)})`, transformOrigin: '50% 20%'}}><Centre rows={rows} y={c.bigY ?? 380} size={112} /></div>}
		{!none && c.st && stampU > 0 && <div style={{position: 'absolute', inset: 0, opacity: stampU}}>{c.st.y ? <Stamp y={c.st.y} place={c.st.place ?? ''} note={c.st.note} th={thK} /> : <NoteStamp note={c.st.note} />}</div>}
		{!none && !hideCounter && c.age && <Counter age={c.roll ? rollAge(t, c) : c.age} roll={c.roll} />}
		{!none && <Seal />}
	</>; };

/** a hard check for builders: the film's end */
export const END_T = FILM_END;
