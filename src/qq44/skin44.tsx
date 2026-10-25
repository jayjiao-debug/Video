import React, {createContext, useContext, useEffect, useState} from 'react';
import {continueRender, delayRender, staticFile, Img} from 'remotion';
/* ep44 episode skin (owner note 2): same layout as look A, reskinned for "you are Einstein's brain".
   Key words in the brain's rose-gold, a modern sans for the story text, lab-record mono years in the stamp,
   and the counter as a specimen label. No red anywhere. */
export const SANS = "'Noto Sans CJK SC','Noto Sans CJK',sans-serif", MONO = "'DejaVu Sans Mono',monospace", FIG = "'DejaVu Sans','Noto Sans CJK SC',sans-serif";
export const ROSE = '#FFB291', ROSE_D = '#C9775E', INK = '#F4EEE4';
const SH = '0 0 2px rgba(10,8,8,0.95), 0 2px 6px rgba(10,8,8,0.7), 0 3px 22px rgba(10,8,8,0.55)';
const KEY_SH = '0 0 2px rgba(10,8,8,0.95), 0 2px 6px rgba(10,8,8,0.7), 0 0 18px rgba(255,140,105,0.55)';
const fx: React.CSSProperties = {position: 'absolute', fontFamily: SANS, color: INK, textShadow: SH};
/* caption-layout test (owner note vs the reference film): A = the current skin (default, unchanged); B = big captions (65 px), quiet stamp
   and counter at the reference proportions, key words a lighter rose-gold with a thin dark outline + soft dark glow; C = B + a feathered
   dark pool behind the subtitle block (≈42 % at its centre); D = B's sizes, key words cream with a rose-gold underline stroke, lighter pool
   (≈32 %). Set per composition through <SkinCtx.Provider> (EP44SKIN-A…D in SKINTEST.tsx); EP44ROUGH stays on A. */
export type Skin = 'A' | 'B' | 'C' | 'D';
export const SkinCtx = createContext<Skin>('A');
const useSkin = () => useContext(SkinCtx);
export const ROSE_HI = '#FFC6A6', CREAM = '#FFF4E2';
const SUB_FS = 65, SUB_SMALL = 38;
/** a thin dark outline from 8 tight shadows (stays outside the fill, unlike -webkit-text-stroke) */
const ring = (w: number, c: string) => [[1, 0], [0.7, 0.7], [0, 1], [-0.7, 0.7], [-1, 0], [-0.7, -0.7], [0, -1], [0.7, -0.7]].map(([x, y]) => `${(x * w).toFixed(2)}px ${(y * w).toFixed(2)}px 0 ${c}`).join(', ');
const KEY_SH_B = `${ring(1.6, 'rgba(16,9,8,0.92)')}, 0 0 3px rgba(16,9,8,0.9), 0 2px 10px rgba(16,9,8,0.72), 0 0 26px rgba(16,9,8,0.55)`;
const QUIET_SH = '0 0 2px rgba(10,8,8,0.9), 0 1px 5px rgba(10,8,8,0.7), 0 2px 14px rgba(10,8,8,0.45)';

/** "[key]" markup → spans, revealing only the first n characters (typed reveal) */
export const Marked: React.FC<{s: string; n?: number; pull?: boolean}> = ({s, n = 1e9, pull}) => {
	const skin = useSkin();
	let left = n; const out: React.ReactNode[] = [];
	s.split(/(\[[^\]]+\])/).filter(Boolean).forEach((p, i) => {
		const key = p.startsWith('['), txt = key ? p.slice(1, -1) : p, vis = txt.slice(0, Math.max(0, left)), hid = txt.slice(vis.length); left -= txt.length;
		const isLast = i === s.split(/(\[[^\]]+\])/).filter(Boolean).length - 1;
		const st: React.CSSProperties = !key ? {} : skin === 'A' ? {color: ROSE, textShadow: KEY_SH} : skin === 'D' ? {color: CREAM, textShadow: KEY_SH_B} : {color: ROSE_HI, textShadow: KEY_SH_B};
		if (key && skin === 'D') out.push(<span key={i} style={{...st, position: 'relative', display: 'inline-block'}}>{vis && <span style={{position: 'absolute', left: '0.05em', width: `calc(${(100 * vis.length) / txt.length}% - 0.1em)`, bottom: '0.13em', height: '0.11em', borderRadius: '0.06em', background: ROSE, boxShadow: '0 0 0 1.5px rgba(16,9,8,0.55), 0 2px 8px rgba(16,9,8,0.6)'}} />}{vis}<span style={{opacity: 0}}>{hid}</span></span>);
		else if (pull && isLast && !key && /[？。！]$/.test(vis) && hid === '') out.push(<span key={i} style={st}>{vis.slice(0, -1)}<span style={{marginRight: '-0.5em'}}>{vis.slice(-1)}</span></span>);
		else out.push(<span key={i} style={st}>{vis}<span style={{opacity: 0}}>{hid}</span></span>);
	});
	return <>{out}</>;
};
export type SubRow = {s: string; n?: number; o?: number; indent?: number; small?: boolean};
/** an odometer number: v may be fractional while it rolls */
export const Odo: React.FC<{v: number; size: number; blur?: number}> = ({v, size, blur = 0}) => {
	const a = Math.floor(v + 1e-6), f = v - a, lh = size * 1.0;
	return <span style={{display: 'inline-block', position: 'relative', height: lh, overflow: 'hidden', verticalAlign: 'bottom', minWidth: `${String(Math.max(a, a + 1)).length * 0.62}em`, textAlign: 'center'}}>
		<span style={{display: 'block', transform: `translateY(${-f * lh}px)`, filter: blur > 0.2 ? `blur(${blur}px)` : undefined}}>
			<span style={{display: 'block', height: lh, lineHeight: `${lh}px`}}>{Math.max(0, a)}</span><span style={{display: 'block', height: lh, lineHeight: `${lh}px`}}>{Math.max(0, a + 1)}</span></span></span>;
};
/** the counter (bottom-left): no box, just calm text over the picture; era tag optional */
export const Counter: React.FC<{era?: string; v: number; blur?: number; o?: number; who?: string; date?: string; pulse?: number; grey?: boolean; lift?: number; whoFrom?: string; whoK?: number}> = (p) =>
	useSkin() === 'A' ? <CounterA {...p} /> : <CounterQ {...p} />;
/** 你/他 in the counter; while whoK < 1 it cross-dissolves from `whoFrom` (same width, so nothing shifts) */
const Who: React.FC<{who: string; from?: string; k?: number; style: React.CSSProperties}> = ({who, from, k = 1, style}) => from === undefined || k >= 1 ? <span style={style}>{who}</span>
	: <span style={{...style, position: 'relative', display: 'inline-block'}}><span style={{opacity: 1 - k}}>{from}</span><span style={{position: 'absolute', left: 0, top: 0, opacity: k}}>{who}</span></span>;
/** B/C/D: the counter at the reference proportions (number 42, 你/岁 24, era 22), lighter weights, a little dimmer */
const CounterQ: React.FC<React.ComponentProps<typeof Counter>> = ({era, v, blur = 0, o = 1, who = '你', date, pulse = 0, grey, lift = 0, whoFrom, whoK}) =>
	<div style={{...fx, left: SAFE_X, bottom: SAFE_Y + lift, display: 'flex', alignItems: 'flex-end', gap: 7, whiteSpace: 'nowrap', opacity: 0.88 * o, transform: pulse ? `scale(${1 + 0.1 * pulse})` : undefined, transformOrigin: '0% 100%', color: grey ? '#9aa0a4' : INK, textShadow: pulse ? `0 0 2px rgba(10,8,8,0.9), 0 1px 5px rgba(10,8,8,0.7), 0 0 ${14 + 22 * pulse}px rgba(255,150,110,${0.6 * pulse})` : QUIET_SH}}>
		{era && <span style={{fontSize: 22, fontWeight: 500, opacity: 0.75, marginBottom: 5, marginRight: 5, letterSpacing: '0.1em'}}>{era}</span>}
		<Who who={who} from={whoFrom} k={whoK} style={{fontSize: 24, fontWeight: 500, marginBottom: 4}} />
		<span style={{fontFamily: FIG, fontSize: 42, fontWeight: 400, lineHeight: 1, fontVariantNumeric: 'tabular-nums'}}><Odo v={v} size={42} blur={blur * 0.7} /></span>
		<span style={{fontSize: 24, fontWeight: 500, marginBottom: 4}}>岁</span>
		{date && <span style={{fontFamily: MONO, fontSize: 17, fontWeight: 400, opacity: 0.55, marginBottom: 6, marginLeft: 10, letterSpacing: '0.04em'}}>{date}</span>}
	</div>;
const CounterA: React.FC<React.ComponentProps<typeof Counter>> = ({era, v, blur = 0, o = 1, who = '你', date, pulse = 0, grey, lift = 0, whoFrom, whoK}) =>
	<div style={{...fx, left: SAFE_X, bottom: SAFE_Y + lift, display: 'flex', alignItems: 'flex-end', gap: 10, whiteSpace: 'nowrap', opacity: o, transform: pulse ? `scale(${1 + 0.1 * pulse})` : undefined, transformOrigin: '0% 100%', color: grey ? '#9aa0a4' : INK, textShadow: pulse ? `0 0 2px rgba(10,8,8,0.9), 0 2px 8px rgba(10,8,8,0.75), 0 0 ${20 + 30 * pulse}px rgba(255,150,110,${0.6 * pulse})` : '0 0 2px rgba(10,8,8,0.9), 0 2px 8px rgba(10,8,8,0.75), 0 0 26px rgba(10,8,8,0.55)'}}>
		{era && <span style={{fontSize: 26, fontWeight: 700, opacity: 0.8, marginBottom: 8, marginRight: 6, letterSpacing: '0.08em'}}>{era}</span>}
		<Who who={who} from={whoFrom} k={whoK} style={{fontSize: 30, fontWeight: 700, marginBottom: 6}} />
		<span style={{fontFamily: FIG, fontSize: 62, fontWeight: 700, lineHeight: 1, fontVariantNumeric: 'tabular-nums'}}><Odo v={v} size={62} blur={blur} /></span>
		<span style={{fontSize: 30, fontWeight: 700, marginBottom: 6}}>岁</span>
		{date && <span style={{fontFamily: MONO, fontSize: 22, fontWeight: 700, opacity: 0.55, marginBottom: 10, marginLeft: 14, letterSpacing: '0.04em'}}>{date}</span>}
	</div>;
/* stamp fonts (owner note, full cut): 霞鹜文楷 for the Chinese, like a lab-notebook entry; the year in Cormorant Garamond.
   Each distinct stamp text waits for its own glyph subsets before the frame is captured. */
export const KAI = "'LXGW WenKai','Noto Serif CJK SC',serif", YEAR = "'Cormorant44','LXGW WenKai','Noto Serif CJK SC',serif";
let fontLink: Promise<void> | null = null;
const fontsReady = new Set<string>();
const ensureFonts = () => fontLink ??= new Promise<void>((res) => {
	const st = document.createElement('style');
	st.textContent = `@font-face{font-family:'Cormorant44';font-style:normal;font-weight:600;src:url(${staticFile('fonts/cormorant-garamond-latin-600-normal.woff2')}) format('woff2');}
@font-face{font-family:'Cormorant44';font-style:normal;font-weight:700;src:url(${staticFile('fonts/cormorant-garamond-latin-700-normal.woff2')}) format('woff2');}`;
	document.head.appendChild(st);
	const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = staticFile('fonts/wenkai/wenkai-bold.css'); l.onload = () => res(); l.onerror = () => res(); document.head.appendChild(l); });
/** hold the frame until the stamp fonts (and the glyphs of `text`) are loaded */
export const useStampFonts = (text: string) => {
	const [h] = useState(() => (typeof document === 'undefined' || fontsReady.has(text) ? null : delayRender(`stamp fonts: ${text}`)));
	useEffect(() => { if (h === null) return;
		ensureFonts().then(() => Promise.all([document.fonts.load(`700 44px 'LXGW WenKai'`, text), document.fonts.load(`700 44px 'Cormorant44'`, '0123456789'), document.fonts.load(`600 44px 'Cormorant44'`, '0123456789')]))
			.then(() => { fontsReady.add(text); continueRender(h); }, () => continueRender(h)); }, [h, text]);
};
const StampBody: React.FC<{y: string; place?: string; note?: string; o: number}> = ({y, place, note, o}) => {
	useStampFonts(`${y}${place ?? ''}${note ?? ''}·→`);
	if (useSkin() !== 'A') return <div style={{position: 'absolute', top: SAFE_Y + 6, right: SAFE_X, textAlign: 'right', paddingRight: 14, borderRight: `2px solid ${ROSE}`, opacity: 0.85 * o, color: INK, textShadow: QUIET_SH, whiteSpace: 'nowrap'}}>
		<div style={{lineHeight: 1.15, display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: 9}}>
			<span style={{fontFamily: YEAR, fontWeight: 600, fontSize: 46, letterSpacing: '0.02em'}}>{y}</span>
			{place && <><span style={{fontFamily: YEAR, fontWeight: 600, fontSize: 30, color: ROSE}}>·</span><span style={{fontFamily: KAI, fontWeight: 700, fontSize: 34, letterSpacing: '0.05em'}}>{place}</span></>}
		</div>
		{note && <div style={{fontFamily: KAI, fontWeight: 700, fontSize: 24, lineHeight: 1.45, marginTop: 3, letterSpacing: '0.06em', opacity: 0.7}}>{note}</div>}
	</div>;
	const soft = '0 0 2px rgba(10,8,8,0.95), 0 2px 8px rgba(10,8,8,0.7), 0 2px 20px rgba(10,8,8,0.55)';
	return <div style={{position: 'absolute', top: SAFE_Y + 6, right: SAFE_X, textAlign: 'right', paddingRight: 18, borderRight: `4px solid ${ROSE}`, opacity: o, color: INK, textShadow: soft, whiteSpace: 'nowrap'}}>
		<div style={{lineHeight: 1.1, display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: 12}}>
			<span style={{fontFamily: YEAR, fontWeight: 700, fontSize: 60, letterSpacing: '0.02em'}}>{y}</span>
			{place && <><span style={{fontFamily: YEAR, fontWeight: 700, fontSize: 44, color: ROSE}}>·</span><span style={{fontFamily: KAI, fontWeight: 700, fontSize: 42, letterSpacing: '0.05em'}}>{place}</span></>}
		</div>
		{note && <div style={{fontFamily: KAI, fontWeight: 700, fontSize: 30, lineHeight: 1.45, marginTop: 2, letterSpacing: '0.06em', opacity: 0.78}}>{note}</div>}
	</div>;
};
/** stamp (top-right): line 1 = year (Cormorant italic) · place (文楷); line 2 = a short dim note (文楷, ≤ 10 字); rose-gold rule */
export const Stamp: React.FC<{y: string; place?: string; note?: string; o?: number}> = ({y, place, note, o = 1}) =>
	<StampBody key={`${y}|${place}|${note}`} y={y} place={place} note={note} o={o} />;
/** the brand seal, bottom-right: the owner's red hand-pressed J stamp (public/ep44/jseal.png, cut from the owner's reference).
    Round 5 (owner: elements too close to the edge get cut off on iPhone): every corner element sits inside a phone-safe margin
    (SAFE_X from the sides, SAFE_Y from top/bottom). */
export const SAFE_X = 120, SAFE_Y = 58;
export const SEAL_SRC = staticFile('ep44/jseal.png');
export const Seal: React.FC = () => <Img src={SEAL_SRC} style={{position: 'absolute', right: SAFE_X, bottom: SAFE_Y - 6, width: 74, height: 74, opacity: 0.9, transform: 'rotate(-6deg)'}} />;
/** story text, top-left; rows stack (row 1 stays while row 2 types) */
export const Story: React.FC<{rows: SubRow[]}> = ({rows}) => {
	const skin = useSkin();
	return rows.length === 0 ? null : skin === 'A' ? <StoryA rows={rows} /> : <StoryQ rows={rows} skin={skin} />;
};
/** B/C/D: 65 px rows; B keeps today's blurred pool (scaled to the bigger text), C/D a feathered radial pool sized to the block */
const StoryQ: React.FC<{rows: SubRow[]; skin: Skin}> = ({rows, skin}) => {
	const rowH = SUB_FS * 1.5, th = rows.reduce((a, r) => a + (r.small ? SUB_SMALL * 1.6 : rowH), 0);
	const tw = SUB_FS * Math.max(...rows.map((r) => (r.small ? (r.s.length * 1.12 + 1.2) * SUB_SMALL / SUB_FS : (r.s.replace(/[[\]]/g, '').length + (r.indent ?? 0)) * 1.03)));
	const a = skin === 'C' ? 0.42 : 0.32, cx = 150 + tw / 2, cy = 132 + th / 2, rx = tw / 2 + 330, ry = th / 2 + 200, c = (k: number) => `rgba(6,6,9,${(a * k).toFixed(3)})`;
	return <>
		{skin === 'B' ? <div style={{position: 'absolute', borderRadius: '50%', filter: 'blur(38px)', left: 40, top: 70, width: 1210, height: 120 + rowH * rows.length, background: 'rgba(12,16,20,0.30)'}} />
			: <div style={{position: 'absolute', left: cx - rx, top: cy - ry, width: 2 * rx, height: 2 * ry, background: `radial-gradient(closest-side, ${c(1)} 0%, ${c(0.93)} 40%, ${c(0.62)} 64%, ${c(0.26)} 84%, ${c(0)} 100%)`}} />}
		<div style={{...fx, left: 150, top: 132, fontWeight: 900, fontSize: SUB_FS, lineHeight: 1.5, letterSpacing: '0.03em', whiteSpace: 'nowrap'}}>{rows.map((r, i) => r.small ? <div key={i} style={{opacity: r.o ?? 1, fontSize: SUB_SMALL, fontWeight: 700, lineHeight: 1.6, letterSpacing: '0.12em', paddingLeft: '1.2em'}}>{r.s}</div>
				: <div key={i} style={{opacity: r.o ?? 1, paddingLeft: r.indent ? `${r.indent * 1.03}em` : undefined}}><Marked s={r.s} n={r.n} /></div>)}</div>
	</>;
};
const StoryA: React.FC<{rows: SubRow[]}> = ({rows}) => <>
	<div style={{position: 'absolute', borderRadius: '50%', filter: 'blur(38px)', left: 40, top: 70, width: 1080, height: 120 + 88 * rows.length, background: 'rgba(12,16,20,0.30)'}} />
	<div style={{...fx, left: 150, top: 132, fontWeight: 900, fontSize: 58, lineHeight: 1.5, letterSpacing: '0.03em', whiteSpace: 'nowrap'}}>{rows.map((r, i) => r.small ? <div key={i} style={{opacity: r.o ?? 1, fontSize: 34, fontWeight: 700, lineHeight: 1.6, letterSpacing: '0.12em', paddingLeft: '1.2em'}}>{r.s}</div>
			: <div key={i} style={{opacity: r.o ?? 1, paddingLeft: r.indent ? `${r.indent * 1.03}em` : undefined}}><Marked s={r.s} n={r.n} /></div>)}</div>
</>;
export const Punch: React.FC<{s: string; o?: number; n?: number}> = ({s, o = 1, n}) => <>
	<div style={{position: 'absolute', left: 460, right: 460, top: 440, height: 160, borderRadius: '50%', filter: 'blur(40px)', background: 'rgba(10,12,16,0.38)', opacity: o}} />
	<div style={{...fx, left: 0, right: 0, top: 470, textAlign: 'center', fontWeight: 900, fontSize: 76, letterSpacing: '0.06em', opacity: o}}><Marked s={s} n={n} pull /></div></>;
