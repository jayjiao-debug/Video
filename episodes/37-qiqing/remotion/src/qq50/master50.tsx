import React from 'react';
import {Img} from 'remotion';
import {W, H, Subs, Counter, seg, cl, lerp, eout, land, KAI, SANS, SAFE_X, SAFE_Y} from './kit50';
import {B, thB, SealB} from './styleB';
import {useStampFonts, YEAR, SEAL_SRC} from '../qq44/skin44';
import {LINES50, lineAt, lastLine, CARD_T, TITLE_T} from './lines50';
/* ep50 master overlays (Builder A): subtitles (layout D, rows stack; C1 and the Q lines centred, the Q gloss row shown
   with row 1), the stamp (fades in after the subtitle has typed), the counter (with the rewind spins and the 前118 → 621
   race), the J seal, and the title card. All of it is hidden from CARD_T on: the end card (PartB) draws its own question. */

/* ---------- beat grid (music_map_ep50.json): downbeats 0.1932 + 2.2642·k, beats every 0.566 s ---------- */
export const DOWNBEAT = (k: number) => 0.1932 + 2.2642 * k;
export const BEAT = (n: number) => 0.1932 + 0.566 * n;

/* ---------- the pillar wipe: a dark foreground pillar passes the camera right → left; behind it the era changes.
   Left of the pillar = the old picture, right of it = the new one. cross = the moment its centre passes x0. ---------- */
export const PILLAR_W = 380, PILLAR_V = 1200;   // px, px/s (40 px per frame, soft-edged so it does not strobe)
export const pillarX = (t: number, cross: number, x0 = 860) => x0 - PILLAR_V * (t - cross);
export const wipeSpan = (cross: number, x0 = 860): [number, number] => [cross - (W + PILLAR_W / 2 - x0) / PILLAR_V, cross + (x0 + PILLAR_W / 2) / PILLAR_V];
export type PillarKind = 'post' | 'banner' | 'redpillar' | 'gate';
export const Pillar: React.FC<{x: number; kind: PillarKind; id: string}> = ({x, kind, id}) => { const w = PILLAR_W;
	const body = kind === 'redpillar' ? '#4A1A10' : kind === 'banner' ? '#0A0605' : '#130A07';
	return <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
		<defs><linearGradient id={`pg${id}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={body} stopOpacity="0" /><stop offset="0.12" stopColor={body} stopOpacity="0.96" /><stop offset="0.5" stopColor={body} /><stop offset="0.88" stopColor={body} stopOpacity="0.96" /><stop offset="1" stopColor={body} stopOpacity="0" /></linearGradient></defs>
		<g transform={`translate(${x - w / 2},0)`}>
			<rect x={0} y={-20} width={w} height={H + 40} fill={`url(#pg${id})`} />
			{kind === 'redpillar' && <><rect x={w * 0.2} y={-20} width={4} height={H + 40} fill={B.gold} opacity={0.35} /><rect x={w * 0.78} y={-20} width={3} height={H + 40} fill={B.gold} opacity={0.25} /></>}
			{kind === 'banner' && <path d={`M${w * 0.18},-20 V${H * 0.86} L${w * 0.5},${H * 0.78} L${w * 0.82},${H * 0.86} V-20`} fill="none" stroke={B.gold} strokeOpacity={0.3} strokeWidth={3} />}
			{kind === 'gate' && <><rect x={w * 0.1} y={-20} width={w * 0.8} height={150} fill="#1E100B" /><path d={`M${w * 0.06},130 H${w * 0.94}`} stroke={B.gold} strokeOpacity={0.35} strokeWidth={3} /></>}
			{kind === 'post' && <rect x={w * 0.46} y={-20} width={3} height={H + 40} fill={B.gold} opacity={0.22} />}
		</g></svg>; };
/** compose an old and a new picture split by the passing pillar */
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
/** centred block: C1 and the Q lines (row 1 in the period face, the gloss row with it, never typed after it) */
const SubsCentre: React.FC<{rows: string[]; gloss: string; q: boolean; n: number[]; o: number}> = ({rows, gloss, q, n, o}) => {
	const len = Math.max(...rows.map((r) => r.replace(/[[\]]/g, '').length), gloss.length * 0.65), tw = 65 * len * 1.05, hh = 97 * rows.length + (gloss ? 70 : 0);
	return <div style={{opacity: o}}>
		<div style={{position: 'absolute', left: 960 - tw / 2 - 280, top: 132 + hh / 2 - (hh / 2 + 190), width: tw + 560, height: hh + 380, background: 'radial-gradient(closest-side, rgba(16,7,4,0.46), rgba(16,7,4,0.4) 45%, rgba(16,7,4,0.16) 80%, rgba(16,7,4,0))'}} />
		<div style={{position: 'absolute', left: 0, right: 0, top: 132, textAlign: 'center', color: thB.ink, textShadow: thB.halo, whiteSpace: 'nowrap'}}>
			{rows.map((r, i) => { const ls = q ? 0.08 : 0.03, pull = (/[。？！，、：；]$/.test(r) ? (0.5 + ls) / 2 : ls / 2) + (q ? 0.06 : 0);   // measured: 960 ± 2 on rendered frames (the period face sits 4 px left)
				return <div key={i} style={{fontFamily: q ? KAI : SANS, fontWeight: q ? 700 : 900, fontSize: q ? 68 : 65, lineHeight: 1.5, letterSpacing: `${ls}em`}}><span style={{position: 'relative', left: `${pull}em`}}><Marked s={r} n={n[i]} /></span></div>; })}
			{gloss && <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 42, lineHeight: 1.6, letterSpacing: '0.06em', color: B.cream, opacity: 0.9}}><span style={{position: 'relative', left: '0.03em'}}>{gloss}</span></div>}
		</div></div>; };
export const Subtitles: React.FC<{t: number}> = ({t}) => {
	const i = lineAt(t); if (i < 0 || t >= CARD_T) return null;
	const L = LINES50[i], {rows, gloss} = split(L.s), dur = L.b - L.a;
	const r2 = i === 0 ? 0.3 : L.a + 0.45;   // row 2 types straight after row 1 (round 1: the punch rows must read)
	void dur;
	const n = rows.map((r, k) => (i === 0 && k === 0 ? 1e9 : k === 0 ? nTyped(r, t, L.a) : L.q ? nTyped(r, t, L.a + 0.2) : nTyped(r, t, r2)));
	const o = 1;   // fully opaque, also through the pillar wipes
	if (L.c) return <SubsCentre rows={rows} gloss={gloss} q={L.q} n={L.q ? rows.map(() => 1e9) : n} o={o} />;
	const vis = rows.map((r, k) => ({s: r, n: n[k]})).filter((r, k) => k === 0 || t >= r2);
	return <div style={{opacity: o}}><Subs rows={vis} th={thB} /></div>;
};

/* ---------- stamp: line 1 (year · place) fades in after the subtitle has typed and HOLDS while it is unchanged; a changed note
   retypes on its own ---------- */
const StampBox: React.FC<{y: string; place: string; note: string; o: number; nNote: number}> = ({y, place, note, o, nNote}) => { useStampFonts(`${y}${place}${note}·`);
	return <div style={{position: 'absolute', top: SAFE_Y + 6, right: SAFE_X + 40, textAlign: 'right', paddingRight: 14, borderRight: `3px solid ${thB.rule}`, color: thB.ink, textShadow: thB.halo, whiteSpace: 'nowrap', opacity: o}}>
		<div style={{lineHeight: 1.15, display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: 10}}>
			<span style={{fontFamily: /^[0-9.]+$/.test(y) ? YEAR : KAI, fontWeight: /^[0-9.]+$/.test(y) ? 600 : 700, fontSize: /^[0-9.]+$/.test(y) ? 48 : 38}}>{y}</span>
			{place && <><span style={{fontFamily: YEAR, fontWeight: 600, fontSize: 32, color: thB.rule}}>·</span><span style={{fontFamily: KAI, fontWeight: 700, fontSize: 36, letterSpacing: '0.05em'}}>{place}</span></>}</div>
		<div style={{fontFamily: KAI, fontWeight: 700, fontSize: 30, lineHeight: 1.45, marginTop: 2, letterSpacing: '0.04em', opacity: 0.88}}>{note.slice(0, nNote)}<span style={{opacity: 0}}>{note.slice(nNote)}</span></div>
	</div>; };
type LineStamp = {y: string; place: string; note: string} | null;
const sameHead = (a: LineStamp, b: LineStamp) => !!a && !!b && a.y === b.y && a.place === b.place;
const sameSt = (a: LineStamp, b: LineStamp) => sameHead(a, b) && a!.note === b!.note;
const showFrom = (a: number) => Math.max(LINES50[a].a, a === 3 ? TITLE_T[1] : 0, a === 1 ? 4.6 : 0, a === 2 ? 6.9 : 0) + 0.6;   // after the subtitle has typed (the 1024 stamp after the rewind lands)
export const StampLayer: React.FC<{t: number}> = ({t}) => {
	if (t >= CARD_T || (t >= TITLE_T[0] - 0.2 && t < TITLE_T[1])) return null;
	const k = lastLine(t); if (k < 0) return null;
	const st = LINES50[k].st; if (!st) return null;
	let h = k; while (h > 0 && sameHead(LINES50[h - 1].st, st)) h--;   // the header has been up since line h
	let a = k; while (a > 0 && sameSt(LINES50[a - 1].st, st)) a--;     // this exact note since line a
	const t0 = showFrom(h), tn = a === h ? t0 : showFrom(a);
	return <StampBox y={st.y} place={st.place} note={st.note} o={seg(t, t0, t0 + 0.35)} nNote={Math.ceil(st.note.length * seg(t, tn, tn + 0.4))} />;
};

/* ---------- counter: era + year, with animated spins ---------- */
const yearLabel = (y: number) => (y < 0 ? `前${-y}` : `${y}`);
export const counterAt = (t: number): {era: string; year: string} | null => {
	if (t >= CARD_T) return null;
	if (t >= 3.0 && t < 4.4) return {era: '', year: '2026'};   // the scan, before the rewind
	if (t >= 4.4 && t < 5.2) { const u = eout(seg(t, 4.4, 5.15)); return {era: '', year: `${Math.round(lerp(2026, 1024, u))}`}; }   // 倒回一千年
	if (t >= 6.5 && t < 7.3) { const u = eout(seg(t, 6.5, 7.25)); const y = Math.round(lerp(1024, -1300, u)); return {era: '', year: y <= -1290 ? '约前1300' : yearLabel(y === 0 ? 1 : y)}; }
	if (t >= 45.0 && t < 47.75) { const u = seg(t, 45.6, 47.4), y = Math.round(lerp(-118, 621, u * u * (3 - 2 * u))); return {era: u >= 1 ? '唐' : '', year: yearLabel(y === 0 ? 1 : y)}; }   // skips year 0; 唐 only once it lands
	const k = lastLine(t); if (k < 0) return {era: '', year: '2026'};
	return LINES50[k].ct;
};
export const CounterLayer: React.FC<{t: number}> = ({t}) => { const c = counterAt(t); if (!c) return null;
	const land前221 = t >= 37.0 && t < 37.6 ? land(seg(t, 37.0, 37.5)) : 1;
	return <div style={{transform: `scale(${lerp(1.25, 1, land前221)})`, transformOrigin: `${SAFE_X + 30}px ${H - SAFE_Y}px`, position: 'absolute', inset: 0}}><Counter era={c.era || undefined} year={c.year || undefined} th={thB} /></div>; };

/* ---------- the title card (9.25–12.25): a lacquer plaque (feathered scrim, thin double gold frame, cloud-curl corners) in the
   clear upper band, ink ≈ y 140–370; slams in on the 9.25 hit (1.25 → 1.0 in 4 frames, then a 2-cycle damped jolt). Each row
   is optically centred: a trailing ？ is pulled back by (½ em + letter-spacing) / 2. ---------- */
const curlD = (x: number, y: number, r: number, dir = 1) => { const pts: string[] = [];
	for (let i = 0; i <= 30; i++) { const th = (i / 30) * 2.2 * Math.PI, rr = r * (0.15 + 0.85 * i / 30); pts.push(`${(x + dir * rr * Math.cos(th)).toFixed(1)},${(y - rr * Math.sin(th)).toFixed(1)}`); }
	return 'M' + pts.join('L'); };
export const TitleCard: React.FC<{t: number}> = ({t}) => { if (t < TITLE_T[0] || t >= TITLE_T[1] + 0.4) return null;
	const f = (t - TITLE_T[0]) * 30, sc = f < 4 ? 1.25 - 0.25 * f / 4 : 1 + 0.03 * Math.exp(-(f - 4) / 9) * Math.sin(2 * Math.PI * (f - 4) / 8) * (f < 20 ? 1 : 0);
	const o = cl(f / 2) * (1 - seg(t, TITLE_T[1] - 0.1, TITLE_T[1] + 0.35)), fs = 116, ls = 0.06;
	const PX = 960, PY = 206, PW = 1180, PH2 = 296, OY = PY + PH2 / 2 - 10;   // plaque y 58–354 (≥ 58 from the top); the bun clears its lower edge by ≥ 20 px; the slam scales about the lower edge (OY), so the overshoot grows upward
	return <div style={{position: 'absolute', inset: 0, opacity: o}}>
		<div style={{position: 'absolute', left: PX - PW / 2 - 120, top: PY - PH2 / 2 - 90, width: PW + 240, height: PH2 + 180, background: 'radial-gradient(closest-side, rgba(10,5,3,0.82), rgba(10,5,3,0.72) 60%, rgba(10,5,3,0))'}} />
		<svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, transform: `scale(${sc})`, transformOrigin: `${PX}px ${OY}px`}}>
			<rect x={PX - PW / 2} y={PY - PH2 / 2} width={PW} height={PH2} fill="none" stroke={B.gold} strokeOpacity={0.55} strokeWidth={2} />
			<rect x={PX - PW / 2 + 10} y={PY - PH2 / 2 + 10} width={PW - 20} height={PH2 - 20} fill="none" stroke={B.gold} strokeOpacity={0.3} strokeWidth={1.2} />
			{[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([dx, dy], k) => <path key={k} d={curlD(PX + dx * (PW / 2 - 34), PY + dy * (PH2 / 2 - 34), 20, -dx)} fill="none" stroke={B.goldL} strokeOpacity={0.7} strokeWidth={2.2} strokeLinecap="round" />)}
		</svg>
		<div style={{position: 'absolute', left: 0, right: 0, top: 84, textAlign: 'center', transform: `scale(${sc})`, transformOrigin: `${PX}px ${OY - 84}px`, fontFamily: SANS, fontWeight: 900, fontSize: fs, lineHeight: 1.12, letterSpacing: `${ls}em`, textShadow: thB.halo, whiteSpace: 'nowrap'}}>
			<div style={{color: '#FFF6E6'}}><span style={{position: 'relative', left: `${ls / 2}em`}}>钱是怎么从贝壳</span></div>
			<div style={{color: B.gold}}><span style={{position: 'relative', left: `${(0.5 + ls) / 2}em`}}>变成二维码的？</span></div>
		</div></div>; };

/** everything that sits on top of the picture */
export const Overlay: React.FC<{t: number}> = ({t}) => <>
	<Subtitles t={t} />
	<StampLayer t={t} />
	<CounterLayer t={t} />
	{t < CARD_T && <SealB />}
	<TitleCard t={t} />
	<Img src={SEAL_SRC} style={{position: 'absolute', width: 1, height: 1, opacity: 0}} />
</>;
void W; void KAI;
