import React from 'react';
import {SANS} from '../qq50/kit50';
import {B} from '../qq50/styleB';
import {KAI, YEAR, useStampFonts} from '../qq44/skin44';
/* ep53 · ElementTile53: a periodic-table cell for the metals the film names (style B「漆」): lacquer-dark rounded square, thin gold rule,
   atomic number top-left, the big symbol, the Chinese name and the English name below. An SVG <g>: place it in any scene's <svg>.
   Normal size s = 260 px → symbol 112 px (≥ 90 px, legible on a phone); min. readable size ≈ 210 px.
   States: 'normal'; 'hi' (highlighted: warmer ground, brighter double rule, gold symbol, a soft glow); 'question' (for 铬: a dashed
   rule and a 「?」 badge — a question, never struck through; the tile has no strike/cross state at all). */
export type ElementKey = 'Cu' | 'Sn' | 'Pb' | 'Cr';
export type ElementData = {z: number; sym: string; zh: string; en: string};
export const ELEMENTS53: Record<ElementKey, ElementData> = {
	Cu: {z: 29, sym: 'Cu', zh: '铜', en: 'Copper'}, Sn: {z: 50, sym: 'Sn', zh: '锡', en: 'Tin'},
	Pb: {z: 82, sym: 'Pb', zh: '铅', en: 'Lead'}, Cr: {z: 24, sym: 'Cr', zh: '铬', en: 'Chromium'}};
export type TileState = 'normal' | 'hi' | 'question';
/** x, y = the tile's centre (px); s = side (px); o = opacity; hi 0..1 can also be animated between the states' looks */
export const ElementTile53: React.FC<{el: ElementKey | ElementData; x: number; y: number; s?: number; state?: TileState; o?: number; id: string}> = ({el, x, y, s = 260, state = 'normal', o = 1, id}) => {
	const d = typeof el === 'string' ? ELEMENTS53[el] : el;
	useStampFonts(`${d.zh}?？0123456789`);
	const hi = state === 'hi', q = state === 'question', r = s * 0.09, x0 = x - s / 2, y0 = y - s / 2;
	const rule = hi ? B.goldL : B.gold, symCol = hi ? B.goldL : q ? '#EADCC0' : B.cream;
	return <g opacity={o}>
		<defs>
			<linearGradient id={`et${id}`} x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stopColor={hi ? '#3A2214' : '#24140D'} /><stop offset="1" stopColor={hi ? '#22120A' : '#140A07'} /></linearGradient>
			<radialGradient id={`eg${id}`}><stop offset="0.55" stopColor="#FFC870" stopOpacity="0.32" /><stop offset="1" stopColor="#FFC870" stopOpacity="0" /></radialGradient>
		</defs>
		{hi && <rect x={x0 - s * 0.22} y={y0 - s * 0.22} width={s * 1.44} height={s * 1.44} rx={s * 0.4} fill={`url(#eg${id})`} />}
		{/* drop shadow, ground, the gold rule (dashed for the question), an inner hairline */}
		<rect x={x0 + s * 0.012} y={y0 + s * 0.03} width={s} height={s} rx={r} fill="#000" opacity={0.45} />
		<rect x={x0} y={y0} width={s} height={s} rx={r} fill={`url(#et${id})`} stroke={rule} strokeOpacity={hi ? 0.95 : 0.7} strokeWidth={Math.max(1.5, s * (hi ? 0.012 : 0.008))} strokeDasharray={q ? `${s * 0.05} ${s * 0.03}` : undefined} />
		<rect x={x0 + s * 0.035} y={y0 + s * 0.035} width={s * 0.93} height={s * 0.93} rx={r * 0.7} fill="none" stroke={rule} strokeOpacity={hi ? 0.45 : 0.22} strokeWidth={Math.max(1, s * 0.004)} />
		{/* atomic number, symbol, names */}
		<text x={x0 + s * 0.09} y={y0 + s * 0.19} fontFamily={YEAR} fontWeight={700} fontSize={s * 0.14} fill={rule} fillOpacity={0.95} style={{fontVariantNumeric: 'lining-nums'}}>{d.z}</text>
		<text x={x} y={y0 + s * 0.585} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={s * 0.43} letterSpacing={-s * 0.005} fill={symCol}
			style={{paintOrder: 'stroke'}} stroke="#0C0604" strokeWidth={s * 0.012} strokeOpacity={0.8}>{d.sym}</text>
		<text x={x} y={y0 + s * 0.785} textAnchor="middle" fontFamily={KAI} fontWeight={700} fontSize={s * 0.17} fill={B.cream} fillOpacity={0.95}>{d.zh}</text>
		<text x={x} y={y0 + s * 0.91} textAnchor="middle" fontFamily={YEAR} fontWeight={700} fontSize={s * 0.092} letterSpacing={s * 0.004} fill="#D8C8A8" fillOpacity={0.85}>{d.en}</text>
		{/* the question badge (top-right): a gold ring with 「?」 */}
		{q && <g><circle cx={x0 + s * 0.84} cy={y0 + s * 0.16} r={s * 0.095} fill="#1A0D09" stroke={B.gold} strokeWidth={Math.max(1.5, s * 0.008)} />
			<text x={x0 + s * 0.84} y={y0 + s * 0.16 + s * 0.045} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={s * 0.13} fill={B.goldL}>?</text></g>}
	</g>; };
