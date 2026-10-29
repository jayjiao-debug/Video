import React from 'react';
import {Img} from 'remotion';
import {W, H, Subs, seg, cl, lerp, SANS, KAI} from '../qq50/kit50';
import {B, thB} from '../qq50/styleB';
import {useStampFonts, YEAR, SEAL_SRC, SAFE_X, SAFE_Y} from '../qq44/skin44';
import {SubsCentre, SealHollow, cq} from '../qq51/master51';
import {LINES53, TITLE53, TITLE_T53} from './lines53';
import {DepthTag} from './parts53';
/* ep53 master overlays + the shared timing (the ep51 engine layer, ep53 copy).
   - grid: P, DA(k), beatAt(n), frameOf(t), onHit(t, tb) (a hit is complete ON its frame);
   - Subtitles53 (layout D, rows typed, Q line centred with its gloss), StampLayer53 (two lines, top-right), SealHollow,
     TitleOnGlass (the plaque mapped onto the case's front pane: opaque and in contact on f285), DepthLayer (bottom-left);
   - every one of them is a pure function of t. The film's picture is drawn by EP53; these sit on top. */
export const FPS53 = 30, FRAMES53 = 3409, CARD_T53 = 109.125, BUILT_T53 = 33.274;
export const P = 0.56605;
export const DA = (k: number) => 0.4432 + 2.2642 * k;
export const beatAt = (n: number) => 0.4432 + P * n;
export const frameOf = (t: number) => Math.round(t * 30);
/** 1 from the hit's own frame on, 0 before */
export const onHit = (t: number, tb: number) => (frameOf(t) >= frameOf(tb) ? 1 : 0);

/* ---------- lines ---------- */
export const lineAt = (t: number) => LINES53.findIndex((l) => t >= l.a && t < l.b);
export const lastLine = (t: number) => { let k = -1; LINES53.forEach((l, i) => { if (t >= l.a) k = i; }); return k; };
const split = (s: string) => { const m = s.match(/^([\s\S]*?)\{([^}]*)\}\s*$/); const main = m ? m[1].replace(/\n$/, '') : s; return {rows: main.split('\n'), gloss: m ? m[2] : ''}; };
const nTyped = (s: string, t: number, a: number, dur = 0.35) => Math.ceil(s.replace(/[[\]]/g, '').length * seg(t, a, a + dur));
/** H1: row 1 is on screen from frame 0; row 2 types 1.05–1.45 so both rows are up by 1.5 s (gate 1, director note 1) */
export const H1_ROW2: [number, number] = [1.05, 1.45];
export const Subtitles53: React.FC<{t: number}> = ({t}) => {
	const i = lineAt(t); if (i < 0 || t >= CARD_T53) return null;
	const L = LINES53[i], {rows, gloss} = split(cq(L.s));
	const r2 = i === 0 ? H1_ROW2[0] : L.a + 0.45;
	const n = rows.map((r, k) => (i === 0 && k === 0 ? 1e9 : k === 0 ? nTyped(r, t, L.a) : i === 0 ? nTyped(r, t, r2, H1_ROW2[1] - H1_ROW2[0]) : nTyped(r, t, r2)));
	if (L.q) return <SubsCentre rows={rows} gloss={gloss} q n={rows.map(() => 1e9)} />;
	const vis = rows.map((r, k) => ({s: r, n: n[k]})).filter((r, k) => k === 0 || t >= r2);
	return <Subs rows={vis} th={thB} />;
};

/* ---------- stamp (top-right, two lines) ----------
   Line 1 = year · place, line 2 = a short note (script.md / lines53). It appears after the line has typed, HOLDS while
   unchanged, and only the changed part retypes. ep53 specials: H1 hands over from 你家厨房 to 春秋末年 · 越 / 越王勾践剑 at
   the knife→bronze match (1.575); S4 rolls the year 2026 → 1965 on its own clock and presses 1965 on beat 41 (23.651, f710);
   D1 keeps that 1965 and types the place. Hidden on the title (9.500–11.764) and from the end card. */
const STAMP_PRESS = beatAt(41);   // 23.651
const typedEnd = (k: number) => { const L = LINES53[k], {rows} = split(L.s); return L.q ? L.a : L.a + (rows.length > 1 ? 0.8 : 0.35); };
const showFrom = (k: number) => typedEnd(k) + 0.45;
type StampState = {y: string; place: string; note: string; oHead: number; nPlace: number; nNote: number; press: number};
export const stampAt = (t: number): StampState | null => {
	if (t >= CARD_T53 || (t >= TITLE_T53[0] && t < TITLE_T53[1])) return null;
	const k = lastLine(t); if (k < 0) return null;
	const id = LINES53[k].id;
	if (id === 'H1') {
		if (t < 1.42) return {y: '2026', place: '你家厨房', note: '一把普通的菜刀', oHead: 1 - seg(t, 1.28, 1.42), nPlace: 99, nNote: 99, press: 0};
		return {y: '春秋末年', place: '越', note: '越王勾践剑', oHead: seg(t, 1.575, 1.8), nPlace: 99, nNote: Math.ceil(5 * seg(t, 1.75, 2.05)), press: 0};
	}
	if (id === 'S4') {   // the place clears, the year rolls down to 1965 (eased), the note types
		const u = seg(t, 21.25, STAMP_PRESS), e = u < 1 ? 1 - Math.pow(1 - u, 2.2) : 1, yr = u >= 1 ? 1965 : Math.min(2026, Math.max(1966, Math.round(2026 - 61 * e)));
		const press = t >= STAMP_PRESS - 1e-6 ? Math.exp(-(t - STAMP_PRESS) / 0.12) * Math.cos((t - STAMP_PRESS) * 40) : 0;
		return {y: String(yr), place: '湖北省博物馆', note: '回到出土那天', oHead: 1, nPlace: Math.ceil(6 * (1 - seg(t, 20.821, 21.05))), nNote: Math.ceil(6 * seg(t, showFrom(k), showFrom(k) + 0.4)), press};
	}
	const st = LINES53[k].st; if (!st) return null;
	const place = st.place ?? '';
	/* the previous stamp on screen (joined lines only) */
	const pk = k > 0 && LINES53[k].a - LINES53[k - 1].b < 0.3 ? k - 1 : -1, prev = pk >= 0 ? (LINES53[pk].id === 'S4' ? {y: '1965', place: '', note: '回到出土那天'} : LINES53[pk].id === 'H1' ? {y: '春秋末年', place: '越', note: '越王勾践剑'} : LINES53[pk].st) : null;
	const t0 = showFrom(k);
	if (!prev || prev.y !== st.y) {   // a new head: the whole stamp fades in after the line has typed
		/* the head held since an earlier joined line? (S1 → S3 keep 2026 · 湖北省博物馆) */
		return {y: st.y, place, note: st.note, oHead: seg(t, t0, t0 + 0.35), nPlace: 99, nNote: 99, press: 0};
	}
	const samePlace = (prev.place ?? '') === place, sameNote = prev.note === st.note;
	return {y: st.y, place, note: st.note, oHead: 1, nPlace: samePlace ? 99 : Math.ceil(place.length * seg(t, t0, t0 + 0.35)), nNote: sameNote ? 99 : Math.ceil(st.note.length * seg(t, t0, t0 + 0.4)), press: 0};
};
const StampBox: React.FC<{s: StampState}> = ({s}) => { const note = cq(s.note); useStampFonts(`${s.y}${s.place}${note}·−>→《》“”`);
	const num = /^[0-9.–→ ]+$/.test(s.y), pv = s.place.slice(0, s.nPlace), nv = note.slice(0, s.nNote);
	return <div style={{position: 'absolute', top: SAFE_Y + 6, right: SAFE_X + 40, textAlign: 'right', paddingRight: 14, borderRight: `3px solid ${thB.rule}`, color: thB.ink, textShadow: thB.halo, whiteSpace: 'nowrap', opacity: s.oHead}}>
		<div style={{lineHeight: 1.15, display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: 10}}>
			<span style={{fontFamily: num ? YEAR : KAI, fontWeight: num ? 600 : 700, fontSize: num ? 52 : 38, fontVariantNumeric: num ? 'lining-nums tabular-nums' : undefined, display: 'inline-block', transform: `scale(${1 + 0.06 * s.press})`, transformOrigin: '100% 70%'}}>{s.y}</span>
			{pv && <><span style={{fontFamily: YEAR, fontWeight: 600, fontSize: 32, color: thB.rule}}>·</span><span style={{fontFamily: KAI, fontWeight: 700, fontSize: 36, letterSpacing: '0.05em'}}>{pv}</span></>}</div>
		<div style={{fontFamily: KAI, fontWeight: 700, fontSize: 30, lineHeight: 1.45, marginTop: 2, letterSpacing: '0.04em', opacity: 0.9}}>{nv}<span style={{opacity: 0}}>{note.slice(nv.length) || ' '}</span></div>
	</div>; };
export const StampLayer53: React.FC<{t: number}> = ({t}) => { const s = stampAt(t); return s && s.oHead > 0.004 ? <StampBox s={s} /> : null; };

/* ---------- the title on the case glass (9.500–11.764): the KF03 plaque, mapped onto the front pane's projection.
   On f285 it is fully opaque and in contact (scale 1.0), then a damped jolt (no flash); it rides the pane as the camera
   backs out and slides out of frame with it as the orbit begins. ---------- */
export const TSRC = {w: 1400, h: 640, pw: 1080, ph: 404};
const homog = (q: [number, number][], w: number, h: number) => {
	const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = q, dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3, dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
	const den = dx1 * dy2 - dy1 * dx2, g = (dx3 * dy2 - dy3 * dx2) / den, hh = (dx1 * dy3 - dy1 * dx3) / den;
	const a = (x1 - x0 + g * x1) / w, b = (x3 - x0 + hh * x3) / h, c = x0, d = (y1 - y0 + g * y1) / w, e = (y3 - y0 + hh * y3) / h, f = y0;
	return `matrix3d(${a},${d},0,${g / w},${b},${e},0,${hh / h},0,0,1,0,${c},${f},0,1)`; };
const LatticeRule: React.FC<{x0: number; x1: number; y: number; s?: number}> = ({x0, x1, y, s = 13}) => { const n = Math.floor((x1 - x0) / (s * 1.7));
	return <g>{Array.from({length: n}, (_, i) => { const cx = x0 + (i + 0.5) * (x1 - x0) / n; return <path key={i} d={`M${cx - s * 0.8},${y} L${cx},${y - s * 0.46} L${cx + s * 0.8},${y} L${cx},${y + s * 0.46} Z`} fill={i % 2 ? 'none' : '#F4F0E8'} fillOpacity={0.35} stroke="#F4F0E8" strokeOpacity={0.55} strokeWidth={1.4} />; })}</g>; };
export const TitleOnGlass: React.FC<{t: number; quad: [number, number][] | null}> = ({t, quad}) => {
	if (!quad || t < TITLE_T53[0] - 1e-6 || t >= TITLE_T53[1]) return null;
	const f = frameOf(t) - frameOf(TITLE_T53[0]); if (f < 0) return null;
	const sc = f < 18 ? 1 + 0.028 * Math.exp(-f / 6) * Math.sin(2 * Math.PI * f / 7) : 1;
	const o = 1 - seg(t, TITLE_T53[1] - 0.24, TITLE_T53[1] - 0.02);
	const {w, h, pw, ph} = TSRC, PX = w / 2, PY = h / 2, [r1, r2] = TITLE53, fs = 124, ls = 0.06;
	return <div style={{position: 'absolute', left: 0, top: 0, width: w, height: h, transformOrigin: '0 0', transform: homog(quad, w, h), opacity: o}}>
		<div style={{position: 'absolute', inset: 0, transform: `scale(${sc})`, transformOrigin: `${PX}px ${PY}px`}}>
			<div style={{position: 'absolute', left: PX - pw / 2 - 160, top: PY - ph / 2 - 100, width: pw + 320, height: ph + 200, background: 'radial-gradient(closest-side, rgba(10,5,3,0.62), rgba(10,5,3,0.5) 60%, rgba(10,5,3,0))'}} />
			<svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0}}>
				<rect x={PX - pw / 2} y={PY - ph / 2} width={pw} height={ph} fill="none" stroke="#F4F0E8" strokeOpacity={0.4} strokeWidth={1.5} />
				<rect x={PX - pw / 2 + 12} y={PY - ph / 2 + 12} width={pw - 24} height={ph - 24} fill="none" stroke="#F4F0E8" strokeOpacity={0.22} strokeWidth={1} />
				<LatticeRule x0={PX - pw / 2 + 30} x1={PX + pw / 2 - 30} y={PY - ph / 2 + 34} />
				<LatticeRule x0={PX - pw / 2 + 30} x1={PX + pw / 2 - 30} y={PY + ph / 2 - 34} />
			</svg>
			<div style={{position: 'absolute', left: 0, right: 0, top: PY - ph / 2 + 56, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: fs, lineHeight: 1.08, letterSpacing: `${ls}em`, whiteSpace: 'nowrap',
				textShadow: '0 -1px 0 rgba(255,255,255,0.55), 0 0 2px rgba(16,7,4,0.9), 0 2px 10px rgba(16,7,4,0.75), 0 0 30px rgba(16,7,4,0.5)'}}>
				<div style={{color: 'rgba(246,242,234,0.96)'}}><span style={{position: 'relative', left: `${ls / 2}em`}}>{r1}</span></div>
				<div style={{color: B.gold}}><span style={{position: 'relative', left: `${(0.5 + ls) / 2}em`}}>{r2.slice(0, -1)}<span style={{marginRight: '-0.5em'}}>{r2.slice(-1)}</span></span></div>
			</div>
		</div></div>; };

/* ---------- depth (D2 → D5 0 → 10.8 m, on its own clock: the descent's 1.2 m/s from 28.746) ---------- */
export const DEPTH_T0 = 28.746, DEPTH_V = 1.2;
export const DEPTH_T_END = 43.463;   // the tag holds 10.8 at the chamber floor and fades out on the draw (TakeC may move this)
export const DepthLayer: React.FC<{t: number}> = ({t}) => { if (t < DEPTH_T0 || t >= DEPTH_T_END) return null;
	const v = Math.min(10.8, DEPTH_V * (t - DEPTH_T0)), o = seg(t, DEPTH_T0, DEPTH_T0 + 0.25) * (1 - seg(t, DEPTH_T_END - 0.4, DEPTH_T_END));
	return <div style={{opacity: o}}><DepthTag v={v} /></div>; };

/* ---------- everything on top of the picture ---------- */
export const Overlay53: React.FC<{t: number; quad: [number, number][] | null}> = ({t, quad}) => <>
	<TitleOnGlass t={t} quad={quad} />
	<Subtitles53 t={t} />
	<StampLayer53 t={t} />
	<DepthLayer t={t} />
	{t < CARD_T53 && <SealHollow />}
	<Img src={SEAL_SRC} style={{position: 'absolute', width: 1, height: 1, opacity: 0}} />
</>;
void W; void H; void cl; void lerp;
