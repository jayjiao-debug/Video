import React from 'react';
import {Img} from 'remotion';
import {W, H, Subs, seg, KAI} from '../qq50/kit50';
import {thB} from '../qq50/styleB';
import {useStampFonts, YEAR, SEAL_SRC, SAFE_X, SAFE_Y} from '../qq44/skin44';
import {SubsCentre, cq} from '../qq51/master51';
import {TitleOnGlass, frameOf, onHit, H1_ROW2} from './master53';
import {TITLE_T53} from './lines53';
import type {Line53} from './lines53';
import {LINES53V3, CARD_T3} from './lines53v3';
import {DepthTag} from './parts53';
import {ElementTile53} from './elements53k';
import type {ElementKey, TileState} from './elements53k';
import {DA3, frame3} from './v3map53';
import {camB3, camDepthB3} from './cam53b3';
import {camD3} from './take53d3';
/* ep53 v3 overlay (on top of Film53v3's picture). The v2 furniture of master53 (layout D subtitles + scrim, two-line stamp,
   hollow J seal, the title on the glass, the depth tag), copied here with a `lines` parameter so v2 keeps master53 as is:
   - Subtitles53v3 / SubScrim53v3: lines_v3.json (LINES53V3), rows typed, Q line centred; none on the title, none from the card;
   - StampLayer53v3: v2 behaviour (types after the line, holds while unchanged, only the changed part retypes; S4 rolls
     2026 → 1965 and presses on beat 41; second line 38 px with the dark shadow) + a faint feathered scrim for bright frames;
   - SealHollow53v3: same size and place as SealHollow, plus a soft dark halo (no box) so it reads over bright bronze;
   - DepthLayer53v3: ALL depth readings of v3 (the descent 0 → 10.8, the second chamber 10.8 → 0), v2's DepthTag, bottom-left;
   - TileLayer53v3: the element tiles (ElementTile53) in ONE fixed bottom-right zone (2 slots, 220 px), each complete on its
     hit frame and leaving with a 0.2 s fade. Every layer is a pure function of t. */

/* ---------- lines ---------- */
const lineAtL = (lines: Line53[], t: number) => lines.findIndex((l) => t >= l.a && t < l.b);
const lastLineL = (lines: Line53[], t: number) => { let k = -1; lines.forEach((l, i) => { if (t >= l.a) k = i; }); return k; };
const split = (s: string) => { const m = s.match(/^([\s\S]*?)\{([^}]*)\}\s*$/); const main = m ? m[1].replace(/\n$/, '') : s; return {rows: main.split('\n'), gloss: m ? m[2] : ''}; };
const nTyped = (s: string, t: number, a: number, dur = 0.35) => Math.ceil(s.replace(/[[\]]/g, '').length * seg(t, a, a + dur));
const inTitle = (t: number) => t >= TITLE_T53[0] && t < TITLE_T53[1];
export const Subtitles53v3: React.FC<{t: number; lines?: Line53[]}> = ({t, lines = LINES53V3}) => {
	const i = lineAtL(lines, t); if (i < 0 || t >= CARD_T3 || inTitle(t)) return null;
	const L = lines[i], {rows, gloss} = split(cq(L.s));
	const r2 = i === 0 ? H1_ROW2[0] : L.a + 0.45;
	const n = rows.map((r, k) => (i === 0 && k === 0 ? 1e9 : k === 0 ? nTyped(r, t, L.a) : i === 0 ? nTyped(r, t, r2, H1_ROW2[1] - H1_ROW2[0]) : nTyped(r, t, r2)));
	if (L.q) return <SubsCentre rows={rows} gloss={gloss} q n={rows.map(() => 1e9)} />;
	const vis = rows.map((r, k) => ({s: r, n: n[k]})).filter((r, k) => k === 0 || t >= r2);
	return <Subs rows={vis} th={thB} />;
};
export const SubScrim53v3: React.FC<{t: number; lines?: Line53[]}> = ({t, lines = LINES53V3}) => { const i = lineAtL(lines, t); if (i < 0 || t >= CARD_T3 || inTitle(t) || lines[i].q) return null;
	const L = lines[i], o = seg(t, L.a, L.a + 0.2) * (1 - seg(t, L.b - 0.2, L.b)); if (o < 0.004) return null;
	const m = 'linear-gradient(180deg, rgba(0,0,0,0) 0%, #000 28%, #000 72%, rgba(0,0,0,0) 100%)';
	return <div style={{position: 'absolute', left: 0, top: 40, width: 1100, height: 280, opacity: o, background: 'linear-gradient(90deg, rgba(18,9,6,0.45) 0%, rgba(18,9,6,0.4) 35%, rgba(18,9,6,0.16) 72%, rgba(18,9,6,0) 100%)', WebkitMaskImage: m, maskImage: m}} />; };

/* ---------- stamp (top-right, two lines): master53's stampAt with a lines parameter ---------- */
const STAMP_PRESS = 0.4432 + 0.56605 * 41;   // beat 41, 23.651 (f710)
type StampState = {y: string; place: string; note: string; oHead: number; nPlace: number; nNote: number; press: number};
export const stampAt53v3 = (t: number, lines: Line53[] = LINES53V3): StampState | null => {
	if (t >= CARD_T3 || inTitle(t)) return null;
	const k = lastLineL(lines, t); if (k < 0) return null;
	const typedEnd = (j: number) => { const L = lines[j], {rows} = split(L.s); return L.q ? L.a : L.a + (rows.length > 1 ? 0.8 : 0.35); };
	const showFrom = (j: number) => typedEnd(j) + 0.45;
	const id = lines[k].id;
	/* v3.4: H1 is the 1977 paper test (its own stamp from lines53v3, the generic path); the kitchen hand-over is gone */
	if (id === 'S4') {   // the place clears, the year rolls down to 1965 (eased), the note types; pressed on beat 41
		const u = seg(t, 21.25, STAMP_PRESS), e = u < 1 ? 1 - Math.pow(1 - u, 2.2) : 1, yr = u >= 1 ? 1965 : Math.min(2026, Math.max(1966, Math.round(2026 - 61 * e)));
		const press = t >= STAMP_PRESS - 1e-6 ? Math.exp(-(t - STAMP_PRESS) / 0.12) * Math.cos((t - STAMP_PRESS) * 40) : 0;
		return {y: String(yr), place: '湖北省博物馆', note: '回到出土那天', oHead: 1, nPlace: Math.ceil(6 * (1 - seg(t, 20.821, 21.05))), nNote: Math.ceil(6 * seg(t, showFrom(k), showFrom(k) + 0.4)), press};
	}
	if (id === 'H2' && t >= 9.2) return {y: '春秋末年', place: '越国', note: '剑首 · 11道同心圆', oHead: 1, nPlace: 99, nNote: Math.ceil(10 * seg(t, 9.2, 9.45)), press: 0};
	const st = lines[k].st; if (!st) return null;
	const place = st.place ?? '';
	const pk = k > 0 && lines[k].a - lines[k - 1].b < 0.3 ? k - 1 : -1, prev = pk >= 0 ? (lines[pk].id === 'S4' ? {y: '1965', place: '', note: '回到出土那天'} : lines[pk].st) : null;
	const t0 = showFrom(k);
	/* fix4-a (#15): a year that only extends the previous one (前473年 → 前473年后) is the same stamp going on, not a new one */
	const sameStamp = !!prev && (prev.y === st.y || st.y.startsWith(prev.y));
	if (!prev || !sameStamp) return {y: st.y, place, note: st.note, oHead: seg(t, t0, t0 + 0.35), nPlace: 99, nNote: 99, press: 0};
	/* hold the previous year, place and note until the new ones type (no clearing at the line start) */
	if (t < t0) return {y: prev.y, place: prev.place ?? '', note: prev.note, oHead: 1, nPlace: 99, nNote: 99, press: 0};
	const samePlace = (prev.place ?? '') === place, sameNote = prev.note === st.note;
	return {y: st.y, place, note: st.note, oHead: 1, nPlace: samePlace ? 99 : Math.ceil(place.length * seg(t, t0, t0 + 0.35)), nNote: sameNote ? 99 : Math.ceil(st.note.length * seg(t, t0, t0 + 0.4)), press: 0};
};
const StampBox: React.FC<{s: StampState}> = ({s}) => { const note = cq(s.note); useStampFonts(`${s.y}${s.place}${note}·−>→《》“”今`);
	const num = /^[0-9.–→ ]+$/.test(s.y), pv = s.place.slice(0, s.nPlace), nv = note.slice(0, s.nNote);
	return <div style={{position: 'absolute', top: SAFE_Y + 6, right: SAFE_X + 40, textAlign: 'right', paddingRight: 14, borderRight: `3px solid ${thB.rule}`, color: thB.ink, textShadow: thB.halo, whiteSpace: 'nowrap', opacity: s.oHead}}>
		<div style={{lineHeight: 1.15, display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: 10}}>
			<span style={{fontFamily: num ? YEAR : KAI, fontWeight: num ? 600 : 700, fontSize: num ? 52 : 38, fontVariantNumeric: num ? 'lining-nums tabular-nums' : undefined, display: 'inline-block', transform: `scale(${1 + 0.06 * s.press})`, transformOrigin: '100% 70%'}}>{s.y}</span>
			{pv && <><span style={{fontFamily: YEAR, fontWeight: 600, fontSize: 32, color: thB.rule}}>·</span><span style={{fontFamily: KAI, fontWeight: 700, fontSize: 36, letterSpacing: '0.05em'}}>{pv}</span></>}</div>
		<div style={{fontFamily: KAI, fontWeight: 700, fontSize: 38, lineHeight: 1.4, marginTop: 2, letterSpacing: '0.03em', opacity: 0.94, textShadow: `0 2px 2px rgba(14,7,4,0.95), ${thB.halo}`}}>{nv}<span style={{opacity: 0}}>{note.slice(nv.length) || ' '}</span></div>
	</div>; };
/** the stamp's own scrim (storyboard_v3: the macro and reflection frames are bright top-right): feathered, no edge */
const StampScrim: React.FC<{o: number}> = ({o}) => <div style={{position: 'absolute', top: SAFE_Y - 34, right: SAFE_X - 10, width: 600, height: 190, opacity: o,
	background: 'radial-gradient(closest-side, rgba(14,7,4,0.42), rgba(14,7,4,0.3) 50%, rgba(14,7,4,0.1) 80%, rgba(14,7,4,0))'}} />;
export const StampLayer53v3: React.FC<{t: number; lines?: Line53[]}> = ({t, lines}) => { const s = stampAt53v3(t, lines);
	return s && s.oHead > 0.004 ? <><StampScrim o={s.oHead} /><StampBox s={s} /></> : null; };

/* ---------- the hollow J seal: SealHollow's size and place (92 px, right SAFE_X + 1, bottom SAFE_Y − 1) + a soft dark halo ---------- */
export const SealHollow53v3: React.FC<{o?: number}> = ({o = 0.65}) => <>
	<div style={{position: 'absolute', right: SAFE_X + 1 - 44, bottom: SAFE_Y - 1 - 44, width: 180, height: 180, borderRadius: '50%',
		background: 'radial-gradient(closest-side, rgba(10,5,3,0.5), rgba(10,5,3,0.4) 45%, rgba(10,5,3,0.14) 75%, rgba(10,5,3,0))'}} />
	<svg width={92} height={92} viewBox="0 0 92 92" style={{position: 'absolute', right: SAFE_X + 1, bottom: SAFE_Y - 1, opacity: o, filter: 'drop-shadow(0 0 2px rgba(10,5,3,0.9)) drop-shadow(0 1px 5px rgba(10,5,3,0.6))'}}>
		<circle cx={46} cy={46} r={39} fill="none" stroke="#D0583C" strokeWidth={3.2} />
		<circle cx={46} cy={46} r={33} fill="none" stroke="#D0583C" strokeWidth={1.2} opacity={0.7} />
		<path d="M38,27 H58 M50,27 V56 Q50,67 40,67 Q32,67 30,59" fill="none" stroke="#D0583C" strokeWidth={4.2} strokeLinecap="round" strokeLinejoin="round" transform="rotate(-6,46,46)" />
	</svg></>;

/* ---------- depth: every reading of v3 (v2's DepthTag, bottom-left) ----------
   v3.1 (owner: "the metres must match the depth the picture shows now, not jump up suddenly at the bottom"): every reading is a
   function of the CAMERA (its depth below ground and its view), never of a clock of its own.
   - descent (TakeB3, cam53b3.camB3): 0.0 while the camera is above the ground (it breaks the ground at 29.45). The camera looks ≈ 62°
     down, so the survey pole's marks in view are always below it: the reading is the depth of the pole at the TOP edge of the frame
     (the shallowest depth in view; −2/−4/−6/−8 m each leave the top edge exactly as the tag passes 2/4/6/8), blended in from the
     camera's own depth over its first 3.2 m (29.45 → ≈30.8) so it leaves 0.0 smoothly (≤ 4.5 m/s). Past the 椁 roof the same
     top-edge depth runs on down the open chamber and reaches 10.8, the 椁 floor, at ≈35.6 as the view tilts top-down (36.670);
     it holds 10.8 to the draw, fading out over 38.5–38.935;
   - second chamber: 10.8 from 118.2 while the tomb is shown; from the camera's deepest point in L1 (DEPTH3.low, ≈125.8, found from
     take53d3.camD3) the reading is 10.8 · D / D_low (D = the camera's depth), so it counts down with the camera's own rise and is
     0.0 from f3902 (130.069), the frame the camera breaks the surface (camD3 z = −0.009 m there); fading out by 130.6. */
const POLE_Y = 1.47;   // the survey pole's wall plane in the shaft world (tomb53b3: PY = SB − 0.03)
/** the depth (m) of the pole line at the frame's top edge for the descent camera at t */
export const topDepthB3 = (t: number) => { const c = camB3(t), k = c.cy / c.f, ry = POLE_Y - c.y;
	return -(c.z + ry * (k * Math.cos(c.p) - Math.sin(c.p)) / (Math.cos(c.p) + k * Math.sin(c.p))); };
export const depthReadB3 = (t: number) => { const d = camDepthB3(t); if (d <= 0) return 0;
	const u = Math.min(1, d / 3.2), w = u * u * (3 - 2 * u);
	return Math.min(10.8, d + w * Math.max(0, topDepthB3(t) - d)); };
const camDepthD3 = (t: number) => Math.max(0, -camD3(t).p[2]);
/** the camera's deepest frame in L1 (it swings round to the front of the cut-away, then rises) */
const LOW3 = (() => { let fm = frame3(125.5), dm = 0; for (let f = frame3(125.0); f <= frame3(127.0); f++) { const d = camDepthD3(f / 30); if (d > dm) { dm = d; fm = f; } } return {t: fm / 30, d: dm}; })();
export const DEPTH3 = {in: 24.9, out0: 38.5, out1: DA3(17), in2: 118.2, low: LOW3.t, up1: 130.069, out2: 130.6};
export const depth53v3 = (t: number): {v: number; o: number} | null => { const D = DEPTH3;
	if (t >= D.in && t < D.out1) return {v: depthReadB3(t), o: seg(t, D.in, D.in + 0.25) * (1 - seg(t, D.out0, D.out1))};
	if (t >= D.in2 && t < D.out2) { const v = t < D.low ? 10.8 : frame3(t) >= frame3(D.up1) ? 0 : Math.min(10.8, 10.8 * camDepthD3(t) / LOW3.d);
		return {v, o: seg(t, D.in2, D.in2 + 0.3) * (1 - seg(t, D.out2 - 0.3, D.out2))}; }
	return null; };
export const DepthLayer53v3: React.FC<{t: number}> = ({t}) => { const d = depth53v3(t); if (!d || d.o < 0.004) return null;
	return <div style={{opacity: d.o}}><DepthTag v={d.v} /></div>; };

/* ---------- element tiles: one fixed zone bottom-right (slot L centre 1452, slot R 1683; y 790; 214 px; x 1345–1790, y 683–897), clear of the seal
   (x 1707–1799, y 931–1023) and of the subtitles; Cr always in slot L (both times), never struck ---------- */
export const TILE53O = {s: 214, y: 790, xL: 1452, xR: 1683, fade: 0.2};
type TileCue = {el: ElementKey; slot: 'L' | 'R'; a: number; b: number; state: TileState; faint?: boolean; note?: string};
export const TILES53V3: TileCue[] = [
	{el: 'Cr', slot: 'L', a: 18.557, b: 20.6, state: 'question'},              // 「镀了铬」, the lull hit
	{el: 'Cu', slot: 'L', a: DA3(44), b: 102.2, state: 'normal'},              // 「料好」 100.068
	{el: 'Pb', slot: 'R', a: DA3(44), b: 102.2, state: 'normal', faint: true, note: '≈ 0'},
	{el: 'Cr', slot: 'L', a: 102.332, b: 106.7, state: 'question'},            // 「镀铬？」
	{el: 'Sn', slot: 'R', a: DA3(46), b: 106.7, state: 'hi'},                  // 「热镀锡」 104.597
];
const TileOne: React.FC<{c: TileCue; t: number; i: number}> = ({c, t, i}) => { const {s, y, xL, xR, fade} = TILE53O;
	useStampFonts('≈0');
	const f = frameOf(t) - frameOf(c.a), o = 1 - seg(t, c.b - fade, c.b);
	const k = 1 + 0.035 * Math.exp(-f / 2.2), x = c.slot === 'L' ? xL : xR;   // complete on its frame; a 3-frame settle, no late ease
	return <g transform={`translate(${x},${y}) scale(${k}) translate(${-x},${-y})`}>
		<ElementTile53 el={c.el} x={x} y={y} s={s} state={c.state} o={o} id={`v3t${i}`} />
		{/* faint (铅 ≈ 0): dimmed by a dark veil, not made transparent (the bright blade must not show through) */}
		{c.faint && <rect x={x - s / 2} y={y - s / 2} width={s} height={s} rx={s * 0.09} fill="#120906" opacity={0.5 * o} />}
		{c.note && <text x={x + s * 0.33} y={y - s * 0.5 + s * 0.215} textAnchor="middle" fontFamily={YEAR} fontWeight={700} fontSize={s * 0.16} fill="#F0CC80" opacity={o} stroke="#0C0604" strokeWidth={3} style={{paintOrder: 'stroke', fontVariantNumeric: 'lining-nums'}}>{c.note}</text>}
	</g>; };
export const TileLayer53v3: React.FC<{t: number}> = ({t}) => { const on = TILES53V3.map((c, i) => ({c, i})).filter(({c}) => onHit(t, c.a) && t < c.b);
	return on.length ? <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>{on.map(({c, i}) => <TileOne key={i} c={c} t={t} i={i} />)}</svg> : null; };

/* ---------- everything on top of the picture (nothing from the end card on: TakeD3 draws the card and its seal) ---------- */
export const Overlay53v3: React.FC<{t: number; quad: [number, number][] | null}> = ({t, quad}) => t >= CARD_T3 ? null : <>
	<TitleOnGlass t={t} quad={quad} />
	<TileLayer53v3 t={t} />
	<SubScrim53v3 t={t} />
	<Subtitles53v3 t={t} />
	<StampLayer53v3 t={t} />
	<DepthLayer53v3 t={t} />
	<SealHollow53v3 />
	<Img src={SEAL_SRC} style={{position: 'absolute', width: 1, height: 1, opacity: 0}} />
</>;
