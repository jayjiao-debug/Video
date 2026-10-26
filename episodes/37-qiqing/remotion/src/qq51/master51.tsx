import React from 'react';
import {Img} from 'remotion';
import {W, H, Subs, Counter, seg, cl, lerp, eout, land, KAI, SANS} from '../qq50/kit50';
import {B, thB, SealB, curl} from '../qq50/styleB';
import {useStampFonts, YEAR, SEAL_SRC, SAFE_X, SAFE_Y} from '../qq44/skin44';
import {LINES51, lineAt, lastLine, CARD_T, TITLE_T, GUESS_T} from './lines51';
/* ep51 master overlays + shared timing (Builder A; started from master50).
   WHAT BUILDER B CAN IMPORT (stable signatures):
   - grid: DA(k), BA(n) (grid A, t < 70.63), DB(k), BB(n) (grid B, t ≥ 74.26), HUSH = [70.63, 74.26], P = beat length,
     beatAt(t) → {n, t0, ph} on whichever grid is active, nearestBeat(t).
   - wipes: Pillar, WipeSplit, pillarX, wipeSpan, PILLAR_W, PILLAR_V, PillarKind
     ('post' | 'banner' | 'redpillar' | 'gate' | 'screen' | 'shop' | 'door' | 'pipe' | 'vermilion').
   - overlay: Subtitles, StampLayer, CounterLayer, TitleCard, Overlay (all hidden from CARD_T; the end card is B's),
     cq (ASCII " → curly “”).
   The overlay draws all subtitles/stamps/counters from lines51.ts, so parts draw only picture. */

/* ---------- music grid (BUILD_BRIEF): 106 bpm, 4/4 ---------- */
export const P = 0.56605;
export const DA = (k: number) => 0.4432 + 2.2642 * k;
export const BA = (n: number) => 0.4432 + P * n;
export const DB = (k: number) => 74.2586 + 2.2642 * k;
export const BB = (n: number) => 74.2586 + P * n;
export const HUSH: [number, number] = [70.63, 74.26];
/** the beat at or before t on the active grid: n = beat index on that grid, t0 = its time, ph = 0..1 phase to the next beat */
export const beatAt = (t: number) => { const b = t >= HUSH[1] ? 74.2586 : 0.4432, n = Math.floor((t - b) / P); return {n, t0: b + n * P, ph: (t - b) / P - n}; };
export const nearestBeat = (t: number) => { const b = t >= HUSH[1] ? 74.2586 : 0.4432; return b + Math.round((t - b) / P) * P; };
/** ASCII quote pairs → curly “” */
export const cq = (s: string) => { let k = 0; return s.replace(/"/g, () => (k++ % 2 === 0 ? '“' : '”')); };

/* ---------- the foreground wipe: a dark object passes the camera right → left; behind it the era changes.
   Left of it = the old picture, right of it = the new one. cross = the moment its centre passes x0 (put it on a beat). ---------- */
export const PILLAR_W = 380, PILLAR_V = 1200;   // px, px/s (soft-edged so it does not strobe)
export const pillarX = (t: number, cross: number, x0 = 860) => x0 - PILLAR_V * (t - cross);
export const wipeSpan = (cross: number, x0 = 860): [number, number] => [cross - (W + PILLAR_W / 2 - x0) / PILLAR_V, cross + (x0 + PILLAR_W / 2) / PILLAR_V];
export type PillarKind = 'post' | 'banner' | 'redpillar' | 'gate' | 'screen' | 'shop' | 'door' | 'pipe' | 'vermilion';
export const Pillar: React.FC<{x: number; kind: PillarKind; id: string}> = ({x, kind, id}) => { const w = PILLAR_W;
	const body = kind === 'redpillar' || kind === 'vermilion' ? '#4A1A10' : kind === 'banner' ? '#0A0605' : kind === 'screen' ? '#140907' : kind === 'shop' ? '#1A0E09' : kind === 'pipe' ? '#15171A' : '#130A07';
	return <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
		<defs><linearGradient id={`pg${id}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={body} stopOpacity="0" /><stop offset="0.12" stopColor={body} stopOpacity="0.96" /><stop offset="0.5" stopColor={body} /><stop offset="0.88" stopColor={body} stopOpacity="0.96" /><stop offset="1" stopColor={body} stopOpacity="0" /></linearGradient></defs>
		<g transform={`translate(${x - w / 2},0)`}>
			<rect x={0} y={-20} width={w} height={H + 40} fill={`url(#pg${id})`} />
			{(kind === 'redpillar' || kind === 'vermilion') && <><rect x={w * 0.2} y={-20} width={4} height={H + 40} fill={B.gold} opacity={0.35} /><rect x={w * 0.78} y={-20} width={3} height={H + 40} fill={B.gold} opacity={0.25} /></>}
			{kind === 'vermilion' && Array.from({length: 9}, (_, i) => <path key={i} d={`M${w * 0.12},${i * 130} H${w * 0.88}`} stroke="#2A0D08" strokeOpacity={0.5} strokeWidth={3} />)}
			{kind === 'banner' && <path d={`M${w * 0.18},-20 V${H * 0.86} L${w * 0.5},${H * 0.78} L${w * 0.82},${H * 0.86} V-20`} fill="none" stroke={B.gold} strokeOpacity={0.3} strokeWidth={3} />}
			{kind === 'gate' && <><rect x={w * 0.1} y={-20} width={w * 0.8} height={150} fill="#1E100B" /><path d={`M${w * 0.06},130 H${w * 0.94}`} stroke={B.gold} strokeOpacity={0.35} strokeWidth={3} /></>}
			{kind === 'post' && <rect x={w * 0.46} y={-20} width={3} height={H + 40} fill={B.gold} opacity={0.22} />}
			{kind === 'screen' && <>
				<rect x={w * 0.14} y={-20} width={w * 0.72} height={H + 40} fill="none" stroke={B.gold} strokeOpacity={0.3} strokeWidth={2.5} />
				<rect x={w * 0.2} y={-20} width={w * 0.6} height={H + 40} fill="none" stroke={B.gold} strokeOpacity={0.15} strokeWidth={1.5} />
				{[260, 620].map((y) => <path key={y} d={curl(w * 0.4, y, 30, 1, 2.4)} fill="none" stroke={B.gold} strokeOpacity={0.28} strokeWidth={2.4} strokeLinecap="round" />)}</>}
			{kind === 'shop' && <>
				<rect x={w * 0.38} y={-20} width={w * 0.24} height={H + 40} fill="#22120B" stroke={B.gold} strokeOpacity={0.25} strokeWidth={2} />
				<rect x={w * 0.08} y={60} width={w * 0.84} height={70} fill="#24130C" stroke={B.gold} strokeOpacity={0.3} strokeWidth={2} />
				<rect x={w * 0.62} y={180} width={w * 0.22} height={360} fill="#2A160E" stroke={B.gold} strokeOpacity={0.3} strokeWidth={2} /></>}
			{kind === 'door' && <><rect x={w * 0.12} y={-20} width={w * 0.76} height={H + 40} fill="none" stroke={B.gold} strokeOpacity={0.3} strokeWidth={3} />
				{Array.from({length: 7}, (_, i) => <circle key={i} cx={w * 0.5} cy={120 + i * 130} r={10} fill={B.gold} opacity={0.3} />)}</>}
			{kind === 'pipe' && <><rect x={w * 0.3} y={-20} width={w * 0.4} height={H + 40} fill="#22262B" /><rect x={w * 0.36} y={-20} width={6} height={H + 40} fill="#8E959B" opacity={0.3} />
				{[200, 640].map((y) => <rect key={y} x={w * 0.24} y={y} width={w * 0.52} height={34} fill="#30353A" stroke="#8E959B" strokeOpacity={0.3} />)}</>}
		</g></svg>; };
/** compose an old and a new picture split by the passing foreground object */
export const WipeSplit: React.FC<{t: number; cross: number; kind: PillarKind; id: string; oldP: React.ReactNode; newP: React.ReactNode; x0?: number}> = ({t, cross, kind, id, oldP, newP, x0 = 860}) => {
	const [t0, t1] = wipeSpan(cross, x0);
	if (t <= t0) return <>{oldP}</>;
	if (t >= t1) return <>{newP}</>;
	const px = pillarX(t, cross, x0);
	return <>
		<div style={{position: 'absolute', inset: 0, clipPath: `inset(0 ${W - px}px 0 0)`}}>{oldP}</div>
		<div style={{position: 'absolute', inset: 0, clipPath: `inset(0 0 0 ${px}px)`}}>{newP}</div>
		<Pillar x={px} kind={kind} id={id} />
	</>; };

/* ---------- subtitles ---------- */
const split = (s: string) => { const m = s.match(/^([\s\S]*?)\{([^}]*)\}\s*$/); const main = m ? m[1].replace(/\n$/, '') : s; return {rows: main.split('\n'), gloss: m ? m[2] : ''}; };
const nTyped = (s: string, t: number, a: number, dur = 0.35) => Math.ceil(s.replace(/[[\]]/g, '').length * seg(t, a, a + dur));
const Marked: React.FC<{s: string; n: number}> = ({s, n}) => { let left = n; const parts = s.split(/(\[[^\]]+\])/).filter(Boolean);
	return <>{parts.map((p, i) => { const key = p.startsWith('['), txt = key ? p.slice(1, -1) : p, vis = txt.slice(0, Math.max(0, left)), hid = txt.slice(vis.length); left -= txt.length;
		if (!key) return <span key={i}>{vis}<span style={{opacity: 0}}>{hid}</span></span>;
		return <span key={i} style={{position: 'relative', display: 'inline-block'}}>{vis && <span style={{position: 'absolute', left: '0.05em', width: `calc(${(100 * vis.length) / txt.length}% - 0.1em)`, bottom: '0.1em', height: '0.13em', borderRadius: '0.06em', background: thB.key}} />}<span style={{position: 'relative'}}>{vis}</span><span style={{opacity: 0}}>{hid}</span></span>; })}</>; };
/** centred block: the Q lines (row 1 in the period face, the gloss row shown with it) and other centred rows */
export const SubsCentre: React.FC<{rows: string[]; gloss: string; q: boolean; n: number[]; o?: number}> = ({rows, gloss, q, n, o = 1}) => {
	const len = Math.max(...rows.map((r) => r.replace(/[[\]]/g, '').length), gloss.length * 0.65), tw = 65 * len * 1.05, hh = 97 * rows.length + (gloss ? 70 : 0);
	return <div style={{opacity: o}}>
		<div style={{position: 'absolute', left: 960 - tw / 2 - 280, top: 132 + hh / 2 - (hh / 2 + 190), width: tw + 560, height: hh + 380, background: 'radial-gradient(closest-side, rgba(16,7,4,0.46), rgba(16,7,4,0.4) 45%, rgba(16,7,4,0.16) 80%, rgba(16,7,4,0))'}} />
		<div style={{position: 'absolute', left: 0, right: 0, top: 132, textAlign: 'center', color: thB.ink, textShadow: thB.halo, whiteSpace: 'nowrap'}}>
			{rows.map((r, i) => { const ls = q ? 0.08 : 0.03, pull = (/[。？！，、：；]$/.test(r) ? (0.5 + ls) / 2 : ls / 2) + (q ? 0.06 : 0);
				return <div key={i} style={{fontFamily: q ? KAI : SANS, fontWeight: q ? 700 : 900, fontSize: q ? 68 : 65, lineHeight: 1.5, letterSpacing: `${ls}em`}}><span style={{position: 'relative', left: `${pull}em`}}><Marked s={r} n={n[i]} /></span></div>; })}
			{gloss && <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 44, lineHeight: 1.6, letterSpacing: '0.06em', color: B.cream, opacity: 0.92}}><span style={{position: 'relative', left: '0.03em'}}>{gloss}</span></div>}
		</div></div>; };
/** H1 (frame 0): row 1 is on screen from frame 0; row 2 types 1.55–1.95 so 不会冷 is read by ~2.1 (the light dies on BA(3)) */
export const H1_ROW2: [number, number] = [1.55, 1.95];
export const Subtitles: React.FC<{t: number}> = ({t}) => {
	const i = lineAt(t); if (i < 0 || t >= CARD_T) return null;
	const L = LINES51[i], {rows, gloss} = split(L.s);
	const r2 = i === 0 ? H1_ROW2[0] : L.a + 0.45;   // row 2 types straight after row 1 (gap 0.1 s)
	const n = rows.map((r, k) => (i === 0 && k === 0 ? 1e9 : k === 0 ? nTyped(r, t, L.a) : i === 0 ? nTyped(r, t, r2, H1_ROW2[1] - H1_ROW2[0]) : nTyped(r, t, r2)));
	if (L.c) return <SubsCentre rows={rows} gloss={gloss} q={L.q} n={L.q ? rows.map(() => 1e9) : n} />;
	const vis = rows.map((r, k) => ({s: r, n: n[k]})).filter((r, k) => k === 0 || t >= r2);
	return <Subs rows={vis} th={thB} />;
};

/* ---------- stamp: line 1 (year · place) fades in after the subtitle has typed and HOLDS while unchanged; a changed note
   retypes on its own. Hidden on H3 (no stamp), the title, 先猜？ and the end card; after a hidden stretch it comes back. ---------- */
const StampBox: React.FC<{y: string; place: string; note: string; o: number; nNote: number}> = ({y, place, note, o, nNote}) => { useStampFonts(`${y}${place}${note}·−>`);
	const num = /^[0-9.]+$/.test(y);
	return <div style={{position: 'absolute', top: SAFE_Y + 6, right: SAFE_X + 40, textAlign: 'right', paddingRight: 14, borderRight: `3px solid ${thB.rule}`, color: thB.ink, textShadow: thB.halo, whiteSpace: 'nowrap', opacity: o}}>
		<div style={{lineHeight: 1.15, display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: 10}}>
			<span style={{fontFamily: num ? YEAR : KAI, fontWeight: num ? 600 : 700, fontSize: num ? 48 : 38}}>{y}</span>
			{place && <><span style={{fontFamily: YEAR, fontWeight: 600, fontSize: 32, color: thB.rule}}>·</span><span style={{fontFamily: KAI, fontWeight: 700, fontSize: 36, letterSpacing: '0.05em'}}>{place}</span></>}</div>
		<div style={{fontFamily: KAI, fontWeight: 700, fontSize: 30, lineHeight: 1.45, marginTop: 2, letterSpacing: '0.04em', opacity: 0.88}}>{note.slice(0, nNote)}<span style={{opacity: 0}}>{note.slice(nNote)}</span></div>
	</div>; };
type LineStamp = {y: string; place: string; note: string} | null;
const sameHead = (a: LineStamp, b: LineStamp) => !!a && !!b && a.y === b.y && a.place === b.place;
const sameSt = (a: LineStamp, b: LineStamp) => sameHead(a, b) && a!.note === b!.note;
/** lines k−1 and k are joined (no hidden stretch between them) */
const joined = (k: number) => LINES51[k].a - LINES51[k - 1].b < 0.3;
const typedEnd = (k: number) => { const L = LINES51[k], {rows} = split(L.s); return k === 0 ? H1_ROW2[1] : L.q ? L.a : L.a + (rows.length > 1 ? 0.8 : 0.35); };
const showFrom = (k: number) => typedEnd(k) + 0.45;
export const StampLayer: React.FC<{t: number}> = ({t}) => {
	if (t >= CARD_T || (t >= TITLE_T[0] && t < TITLE_T[1]) || (t >= GUESS_T[0] && t < GUESS_T[1])) return null;
	const k = lastLine(t); if (k < 0) return null;
	const st = LINES51[k].st; if (!st) return null;
	let h = k; while (h > 0 && joined(h) && sameHead(LINES51[h - 1].st, st)) h--;   // the header has been up since line h
	let a = k; while (a > 0 && joined(a) && sameSt(LINES51[a - 1].st, st)) a--;     // this exact note since line a
	const t0 = showFrom(h), tn = a === h ? t0 : showFrom(a);
	return <StampBox y={st.y} place={st.place} note={st.note} o={seg(t, t0, t0 + 0.35)} nNote={Math.ceil(st.note.length * seg(t, tn, tn + 0.4))} />;
};

/* ---------- counter: era / year, with the two hook spins (no BC years; they flip through era names) ---------- */
const FLIP_H1 = ['清', '明', '宋', '唐', '汉', '秦', '战国早期'], FLIP_H3 = ['春秋', '周'];
export const counterAt = (t: number): {era: string; year: string; k: number} | null => {
	if (t >= CARD_T) return null;
	if (t < 1.0) return {era: '', year: '2026', k: 1};
	if (t < 2.05) { const i = Math.min(FLIP_H1.length - 1, Math.floor((t - 1.0) / 0.15)); return {era: FLIP_H1[i], year: '', k: i === FLIP_H1.length - 1 ? land(seg(t, 1.0 + 0.15 * i, 1.45 + 0.15 * i)) : 0.6}; }
	if (t >= 7.2 && t < 8.4) { const i = t < 7.75 ? -1 : t < 8.1 ? 0 : 1; return {era: i < 0 ? '战国早期' : FLIP_H3[i], year: '', k: i === 1 ? land(seg(t, 8.1, 8.5)) : 1}; }
	const k = lastLine(t); if (k < 0) return {era: '', year: '2026', k: 1};
	const c = LINES51[k].ct; if (!c) return null;
	const changed = k > 0 && LINES51[k - 1].ct && (LINES51[k - 1].ct!.era !== c.era || LINES51[k - 1].ct!.year !== c.year);
	return {...c, k: changed && k !== 2 ? land(seg(t, LINES51[k].a, LINES51[k].a + 0.45)) : 1};
};
export const CounterLayer: React.FC<{t: number}> = ({t}) => { const c = counterAt(t); if (!c) return null;
	return <div style={{transform: `scale(${lerp(1.2, 1, c.k)})`, transformOrigin: `${SAFE_X + 30}px ${H - SAFE_Y}px`, position: 'absolute', inset: 0}}><Counter era={c.era || undefined} year={c.year || undefined} th={thB} /></div>; };

/* ---------- the title card (9.50–12.50): the ep50 plaque, slams in on DA(4) = 9.50 (1.25 → 1.0 in 4 frames + a damped jolt),
   ink centred (a trailing ？ pulled back by (½ em + letter-spacing) / 2); the walker's bun clears its lower edge ---------- */
const curlD = (x: number, y: number, r: number, dir = 1) => { const pts: string[] = [];
	for (let i = 0; i <= 30; i++) { const th = (i / 30) * 2.2 * Math.PI, rr = r * (0.15 + 0.85 * i / 30); pts.push(`${(x + dir * rr * Math.cos(th)).toFixed(1)},${(y - rr * Math.sin(th)).toFixed(1)}`); }
	return 'M' + pts.join('L'); };
export const TitleCard: React.FC<{t: number}> = ({t}) => { if (t < TITLE_T[0] || t >= TITLE_T[1]) return null;   // gone before Q1's centred row arrives at 12.50
	const f = (t - TITLE_T[0]) * 30, sc = f < 4 ? 1.25 - 0.25 * f / 4 : 1 + 0.03 * Math.exp(-(f - 4) / 9) * Math.sin(2 * Math.PI * (f - 4) / 8) * (f < 20 ? 1 : 0);
	const o = cl(f / 2) * (1 - seg(t, TITLE_T[1] - 0.3, TITLE_T[1] - 0.02)), fs = 116, ls = 0.06;
	const PX = 960, PY = 206, PW = 1180, PH2 = 296, OY = PY + PH2 / 2 - 10;
	return <div style={{position: 'absolute', inset: 0, opacity: o}}>
		<div style={{position: 'absolute', left: PX - PW / 2 - 120, top: PY - PH2 / 2 - 90, width: PW + 240, height: PH2 + 180, background: 'radial-gradient(closest-side, rgba(10,5,3,0.82), rgba(10,5,3,0.72) 60%, rgba(10,5,3,0))'}} />
		<svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, transform: `scale(${sc})`, transformOrigin: `${PX}px ${OY}px`}}>
			<rect x={PX - PW / 2} y={PY - PH2 / 2} width={PW} height={PH2} fill="none" stroke={B.gold} strokeOpacity={0.55} strokeWidth={2} />
			<rect x={PX - PW / 2 + 10} y={PY - PH2 / 2 + 10} width={PW - 20} height={PH2 - 20} fill="none" stroke={B.gold} strokeOpacity={0.3} strokeWidth={1.2} />
			{[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([dx, dy], k) => <path key={k} d={curlD(PX + dx * (PW / 2 - 34), PY + dy * (PH2 / 2 - 34), 20, -dx)} fill="none" stroke={B.goldL} strokeOpacity={0.7} strokeWidth={2.2} strokeLinecap="round" />)}
		</svg>
		<div style={{position: 'absolute', left: 0, right: 0, top: 84, textAlign: 'center', transform: `scale(${sc})`, transformOrigin: `${PX}px ${OY - 84}px`, fontFamily: SANS, fontWeight: 900, fontSize: fs, lineHeight: 1.12, letterSpacing: `${ls}em`, textShadow: thB.halo, whiteSpace: 'nowrap'}}>
			<div style={{color: '#FFF6E6'}}><span style={{position: 'relative', left: `${ls / 2}em`}}>古代没有冰箱</span></div>
			<div style={{color: B.gold}}><span style={{position: 'relative', left: `${(0.5 + ls) / 2}em`}}>夏天怎么吃冰？</span></div>
		</div></div>; };

/** everything that sits on top of the picture (hidden from the end card on; B's end card draws its own) */
export const Overlay: React.FC<{t: number}> = ({t}) => <>
	<Subtitles t={t} />
	<StampLayer t={t} />
	<CounterLayer t={t} />
	{t < CARD_T && <SealB />}
	<TitleCard t={t} />
	<Img src={SEAL_SRC} style={{position: 'absolute', width: 1, height: 1, opacity: 0}} />
</>;
void eout; void KAI;
