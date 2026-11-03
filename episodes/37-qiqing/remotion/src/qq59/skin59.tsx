import React, {useEffect, useState} from 'react';
import {continueRender, delayRender, staticFile, Img} from 'remotion';
/* ep59 skin: the house furniture (ep44 layout D, the approved standard), reskinned for this film's one accent: the gold of his route.
   - story text top-left (x 150, y 132), 65 px heavy sans in cream on a soft feathered dark pool; rows stack; key words stay cream
     with a gold underline; a question alone is centred (Punch)
   - stamp top-right: 「年份 · 国家 城市」 (year in Cormorant italic, place in 霞鹜文楷) + a dim ≤ 10 字 note, gold rule
   - counter bottom-left: year · 他 N 岁 (odometer digits) · 已走 N 公里
   - the J seal bottom-right (74 px, .9, −6°); phone-safe corners: ≥ 120 px from the sides, ≥ 58 px from top/bottom
   Everything here is HTML over the SVG picture (its own compositor layer, see EP59.tsx). */
export const W = 1920, H = 1080, SAFE_X = 120, SAFE_Y = 58;
export const SANS = "'Noto Sans CJK SC','Noto Sans CJK',sans-serif", FIG = "'DejaVu Sans','Noto Sans CJK SC',sans-serif";
export const KAI = "'LXGW WenKai','Noto Serif CJK SC',serif", YEAR = "'Cormorant59i','Cormorant59','LXGW WenKai',serif", SERIF = "'Noto Serif CJK SC',serif";
/** the film's palette for furniture: cream ink, the route gold (the one saturated accent) */
export const INK = '#FFF4E2', GOLD = '#FFC24A', GOLD_D = '#D9962E', GOLD_HI = '#FFE3A0';
const halo = '0 0 2px rgba(8,8,12,0.95), 0 2px 7px rgba(8,8,12,0.72), 0 3px 22px rgba(8,8,12,0.55)';
const QUIET = '0 0 2px rgba(8,8,12,0.9), 0 1px 5px rgba(8,8,12,0.7), 0 2px 14px rgba(8,8,12,0.45)';
const ring = (w: number, c: string) => [[1, 0], [0.7, 0.7], [0, 1], [-0.7, 0.7], [-1, 0], [-0.7, -0.7], [0, -1], [0.7, -0.7]].map(([x, y]) => `${(x * w).toFixed(2)}px ${(y * w).toFixed(2)}px 0 ${c}`).join(', ');
const KEY_SH = `${ring(1.6, 'rgba(10,8,8,0.92)')}, 0 0 3px rgba(10,8,8,0.9), 0 2px 10px rgba(10,8,8,0.72), 0 0 26px rgba(10,8,8,0.55)`;
const SUB_FS = 65;
export const cl = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const seg = (t: number, a: number, b: number) => cl((t - a) / (b - a));
export const sm = (u: number) => { const v = cl(u); return v * v * (3 - 2 * v); };
export const visLen = (s: string) => s.replace(/[[\]]/g, '').length;

/* ---------- fonts: 霞鹜文楷 (stamp / labels) and Cormorant (years); each distinct text waits for its glyphs ---------- */
let fontLink: Promise<void> | null = null;
const fontsReady = new Set<string>();
const ensureFonts = () => fontLink ??= new Promise<void>((res) => {
	const st = document.createElement('style');
	st.textContent = `@font-face{font-family:'Cormorant59i';font-style:italic;font-weight:500;src:url(${staticFile('fonts/cormorant-garamond-latin-500-italic.woff2')}) format('woff2');}
@font-face{font-family:'Cormorant59';font-style:normal;font-weight:600;src:url(${staticFile('fonts/cormorant-garamond-latin-600-normal.woff2')}) format('woff2');}
@font-face{font-family:'Cormorant59';font-style:normal;font-weight:700;src:url(${staticFile('fonts/cormorant-garamond-latin-700-normal.woff2')}) format('woff2');}`;
	document.head.appendChild(st);
	const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = staticFile('fonts/wenkai/wenkai-bold.css'); l.onload = () => res(); l.onerror = () => res(); document.head.appendChild(l); });
/** hold the frame until the KAI glyphs of `text` and the Cormorant figures are loaded */
export const useFonts59 = (text: string) => {
	const [h] = useState(() => (typeof document === 'undefined' || fontsReady.has(text) ? null : delayRender(`ep59 fonts: ${text}`)));
	useEffect(() => { if (h === null) return;
		ensureFonts().then(() => Promise.all([document.fonts.load(`700 44px 'LXGW WenKai'`, text), document.fonts.load(`italic 500 44px 'Cormorant59i'`, '0123456789→–'), document.fonts.load(`600 44px 'Cormorant59'`, '0123456789')]))
			.then(() => { fontsReady.add(text); continueRender(h); }, () => continueRender(h)); }, [h, text]);
};

/** centred lines: close the full-width gaps around corner brackets (「…？」 would otherwise read with a hole before 」 and after 「) */
const tight = (s: string, next = ''): React.ReactNode => s.split('').map((ch, i, a) => (ch === '「' && i === 0 ? <span key={i} style={{marginLeft: '-0.45em'}}>{ch}</span>
	: /[？。！]/.test(ch) && (a[i + 1] ?? next) === '」' ? <span key={i} style={{marginRight: '-0.42em'}}>{ch}</span> : ch));
/** "[key]" markup → spans, revealing only the first n characters; key words cream with a gold underline that grows as they type */
export const Marked: React.FC<{s: string; n?: number; pull?: boolean}> = ({s, n = 1e9, pull}) => {
	let left = n; const parts = s.split(/(\[[^\]]+\])/).filter(Boolean), out: React.ReactNode[] = [];
	parts.forEach((p, i) => {
		const key = p.startsWith('['), txt = key ? p.slice(1, -1) : p, vis = txt.slice(0, Math.max(0, left)), hid = txt.slice(vis.length); left -= txt.length;
		if (key) out.push(<span key={i} style={{color: INK, textShadow: KEY_SH, position: 'relative', display: 'inline-block'}}>
			{vis && <span style={{position: 'absolute', left: '0.05em', width: `calc(${(100 * vis.length) / txt.length}% - 0.1em)`, bottom: '0.12em', height: '0.11em', borderRadius: '0.06em', background: GOLD, boxShadow: '0 0 0 1.5px rgba(16,9,8,0.55), 0 2px 8px rgba(16,9,8,0.6)'}} />}
			<span style={{position: 'relative'}}>{vis}</span><span style={{opacity: 0}}>{hid}</span></span>);
		else if (pull && i === parts.length - 1 && /[？。！」]$/.test(vis) && hid === '') out.push(<span key={i}>{tight(vis.slice(0, -1), vis.slice(-1))}<span style={{marginRight: '-0.5em'}}>{vis.slice(-1)}</span></span>);
		else if (pull) out.push(<span key={i}>{tight(vis)}<span style={{opacity: 0}}>{hid}</span></span>);
		else out.push(<span key={i}>{vis}<span style={{opacity: 0}}>{hid}</span></span>);
	});
	return <>{out}</>;
};
export type SubRow = {s: string; n?: number; o?: number};
/** layout D: rows stack top-left; a feathered dark pool sized to the block keeps them readable on light and dark grounds */
export const Story: React.FC<{rows: SubRow[]; pool?: number}> = ({rows, pool = 0.34}) => {
	if (rows.length === 0) return null;
	const rowH = SUB_FS * 1.5, th = rowH * rows.length, tw = SUB_FS * Math.max(...rows.map((r) => visLen(r.s))) * 1.03;
	const cx = 150 + tw / 2, cy = 132 + th / 2, rx = tw / 2 + 320, ry = th / 2 + 196, c = (k: number) => `rgba(6,6,10,${(pool * k).toFixed(3)})`;
	return <>
		<div style={{position: 'absolute', left: cx - rx, top: cy - ry, width: 2 * rx, height: 2 * ry, background: `radial-gradient(closest-side, ${c(1)} 0%, ${c(0.93)} 40%, ${c(0.62)} 64%, ${c(0.26)} 84%, ${c(0)} 100%)`}} />
		<div style={{position: 'absolute', left: 150, top: 132, fontFamily: SANS, color: INK, textShadow: halo, fontWeight: 900, fontSize: SUB_FS, lineHeight: 1.5, letterSpacing: '0.03em', whiteSpace: 'nowrap'}}>
			{rows.map((r, i) => <div key={i} style={{opacity: r.o ?? 1}}><Marked s={r.s} n={r.n} /></div>)}</div>
	</>;
};
/** a question alone, centred */
export const Punch: React.FC<{s: string; o?: number; top?: number; size?: number}> = ({s, o = 1, top = 452, size = 80}) => { const w = visLen(s) * size * 1.06;
	return <>
		<div style={{position: 'absolute', left: 960 - w / 2 - 260, width: w + 520, top: top - 120, height: size + 270, background: 'radial-gradient(closest-side, rgba(6,6,10,0.5) 0%, rgba(6,6,10,0.44) 45%, rgba(6,6,10,0.18) 80%, rgba(6,6,10,0) 100%)', opacity: o}} />
		<div style={{position: 'absolute', left: 0, right: 0, top, textAlign: 'center', fontFamily: SANS, color: INK, textShadow: halo, fontWeight: 900, fontSize: size, letterSpacing: '0.06em', opacity: o, whiteSpace: 'nowrap'}}><Marked s={s} pull /></div></>; };

/** top-right stamp, two lines */
export const Stamp: React.FC<{y: string; place: string; note: string; o?: number}> = ({y, place, note, o = 1}) => {
	useFonts59(`${y}${place}${note}·→`);
	return <div style={{position: 'absolute', top: SAFE_Y + 8, right: SAFE_X + 40, textAlign: 'right', paddingRight: 14, borderRight: `3px solid ${GOLD}`, opacity: 0.92 * o, color: INK, textShadow: QUIET, whiteSpace: 'nowrap'}}>
		<div style={{lineHeight: 1.15, display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: 10}}>
			<span style={{fontFamily: YEAR, fontStyle: 'italic', fontWeight: 500, fontSize: 50, letterSpacing: '0.01em'}}>{y}</span>
			<span style={{fontFamily: YEAR, fontWeight: 600, fontSize: 32, color: GOLD}}>·</span>
			<span style={{fontFamily: KAI, fontWeight: 700, fontSize: 36, letterSpacing: '0.05em'}}>{place}</span></div>
		<div style={{fontFamily: KAI, fontWeight: 700, fontSize: 27, lineHeight: 1.45, marginTop: 2, letterSpacing: '0.06em', opacity: 0.8}}>{note}</div>
	</div>;
};
/** an odometer number (v may be fractional while it rolls); `sep` adds thousands separators */
export const Odo: React.FC<{v: number; size: number; blur?: number; sep?: boolean}> = ({v, size, blur = 0, sep}) => {
	const a = Math.floor(v + 1e-6), f = v - a, lh = size, fmt = (n: number) => (sep ? Math.max(0, n).toLocaleString('en-US') : String(Math.max(0, n)));
	return <span style={{display: 'inline-block', position: 'relative', height: lh, overflow: 'hidden', verticalAlign: 'bottom', minWidth: `${fmt(a + 1).length * 0.6}em`, textAlign: 'right'}}>
		<span style={{display: 'block', transform: `translateY(${-f * lh}px)`, filter: blur > 0.2 ? `blur(${blur}px)` : undefined}}>
			<span style={{display: 'block', height: lh, lineHeight: `${lh}px`}}>{fmt(a)}</span><span style={{display: 'block', height: lh, lineHeight: `${lh}px`}}>{fmt(a + 1)}</span></span></span>;
};
/** bottom-left counter 「第 N 年 · 他 N 岁」 (· 已走约 N 公里 when km is given). The props stay calendar-based: `year` may be fractional
    while it rolls; the year count is N = year − 1998 (he left on 1 Nov 1998: 1999 is still 第 1 年, mid-2012 is 第 14 年, 2026 第 28 年). */
export const Counter: React.FC<{year: number; age: number; km?: number | null; kmApprox?: boolean; blur?: number; o?: number; kmO?: number; pulse?: number}> = ({year, age, km, kmApprox, blur = 0, o = 1, kmO = 1, pulse = 0}) => {
	useFonts59('第年他岁已走公里约·');
	const n = Math.max(1, year - 1998), small: React.CSSProperties = {fontFamily: KAI, fontWeight: 700, fontSize: 30, letterSpacing: '0.06em', marginBottom: 5};
	const num: React.CSSProperties = {fontFamily: YEAR, fontWeight: 600, fontSize: 56, lineHeight: 1, fontVariantNumeric: 'lining-nums tabular-nums', fontFeatureSettings: "'lnum' 1, 'tnum' 1"};
	return <div style={{position: 'absolute', left: SAFE_X + 30, bottom: SAFE_Y + 4, display: 'flex', alignItems: 'flex-end', gap: 7, whiteSpace: 'nowrap', color: INK, opacity: 0.92 * o,
		textShadow: pulse > 0 ? `0 0 2px rgba(8,8,12,0.9), 0 1px 5px rgba(8,8,12,0.7), 0 0 ${14 + 20 * pulse}px rgba(255,190,90,${0.6 * pulse})` : QUIET}}>
		<span style={small}>第</span><span style={num}><Odo v={n} size={56} blur={blur * 0.6} /></span><span style={small}>年</span>
		<span style={{...small, color: GOLD, margin: '0 4px 5px'}}>·</span>
		<span style={small}>他</span><span style={num}><Odo v={age} size={56} blur={blur * 0.6} /></span><span style={small}>岁</span>
		{km !== null && km !== undefined && <span style={{opacity: kmO, display: 'flex', alignItems: 'flex-end', gap: 6, marginLeft: 18}}>
			<span style={{...small, opacity: 0.85}}>{kmApprox ? '已走约' : '已走'}</span>
			<span style={{fontFamily: FIG, fontSize: 38, fontWeight: 400, lineHeight: 1, marginBottom: 3, fontVariantNumeric: 'tabular-nums', color: GOLD_HI}}><Odo v={km} size={38} blur={blur * 0.6} sep /></span>
			<span style={{...small, opacity: 0.85}}>公里</span></span>}
	</div>;
};
/** a small in-frame counter for a scene (e.g. 「第 N 天」 on the ice, 「已走 N 公里」 on the highway): label, rolling number, unit, an optional bar */
export const Tally: React.FC<{pre: string; v: number; unit: string; x: number; y: number; o?: number; sep?: boolean; bar?: number; barL?: string; barR?: string; size?: number}> = ({pre, v, unit, x, y, o = 1, sep, bar, barL = '', barR = '', size = 64}) => {
	useFonts59(`${pre}${unit}${barL}${barR}`);
	const small: React.CSSProperties = {fontFamily: KAI, fontWeight: 700, fontSize: Math.round(size * 0.5), letterSpacing: '0.06em', marginBottom: Math.round(size * 0.1)};
	return <div style={{position: 'absolute', left: x, top: y, opacity: o, color: INK, textShadow: halo, whiteSpace: 'nowrap'}}>
		<div style={{display: 'flex', alignItems: 'flex-end', gap: 8}}>
			<span style={small}>{pre}</span>
			<span style={{fontFamily: YEAR, fontWeight: 700, fontSize: size, lineHeight: 1, color: GOLD_HI, fontVariantNumeric: 'lining-nums tabular-nums', fontFeatureSettings: "'lnum' 1, 'tnum' 1"}}><Odo v={v} size={size} sep={sep} /></span>
			<span style={small}>{unit}</span></div>
		{bar !== undefined && <div style={{marginTop: 10, width: 420}}>
			<div style={{position: 'relative', height: 8, borderRadius: 4, background: 'rgba(255,244,226,0.22)', boxShadow: '0 1px 6px rgba(0,0,0,0.6)'}}>
				<div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${(100 * cl(bar)).toFixed(2)}%`, borderRadius: 4, background: GOLD}} />
				<div style={{position: 'absolute', left: `calc(${(100 * cl(bar)).toFixed(2)}% - 9px)`, top: -5, width: 18, height: 18, borderRadius: 9, background: '#FFF6E0', boxShadow: `0 0 12px ${GOLD}`}} /></div>
			<div style={{display: 'flex', justifyContent: 'space-between', marginTop: 8, fontFamily: KAI, fontWeight: 700, fontSize: 26, letterSpacing: '0.05em', opacity: 0.86}}><span>{barL}</span><span>{barR}</span></div></div>}
	</div>;
};
/** the brand seal (the owner's red J stamp), bottom-right */
export const SEAL_SRC = staticFile('ep44/jseal.png');
export const Seal: React.FC<{o?: number}> = ({o = 0.9}) => <Img src={SEAL_SRC} style={{position: 'absolute', right: SAFE_X, bottom: SAFE_Y - 6, width: 74, height: 74, opacity: o, transform: 'rotate(-6deg)'}} />;
/** ◀◀ the rewind mark (top-left, only while no story text is on screen) */
export const RewindMark: React.FC<{o: number}> = ({o}) => <svg width={200} height={90} style={{position: 'absolute', left: 150, top: 150, opacity: o}}>
	<path d="M70,10 l-60,36 l60,36 Z M140,10 l-60,36 l60,36 Z" fill={INK} style={{filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.6))'}} /></svg>;
/** the film title: line 1 smaller, line 2 big with 28年 in gold; each character drops in (k = 0..1 per char) */
export const TITLE_L1 = '他走路回家，', TITLE_L2 = '走了28年';
export const Title: React.FC<{u: number; o?: number; push?: number; top?: number}> = ({u, o = 1, push = 1, top = 700}) => {
	const chars: {ch: string; x: number; y: number; fs: number; gold: boolean; i: number}[] = [];
	const l1 = TITLE_L1.split(''), l2 = ['走', '了', '28', '年'];
	l1.forEach((ch, j) => chars.push({ch, x: (j - (l1.length - 1) / 2) * 74, y: 0, fs: 70, gold: false, i: chars.length}));
	const w2 = [1, 1, 1.12, 1];   // '28' is one slot a little wider
	let xx = -w2.reduce((a, b) => a + b, 0) * 130 / 2;
	l2.forEach((ch, j) => { chars.push({ch, x: xx + w2[j] * 130 / 2, y: 150, fs: 136, gold: ch === '28' || ch === '年', i: chars.length}); xx += w2[j] * 130; });
	return <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, opacity: o}}>
		<div style={{position: 'absolute', left: 960 - 620, width: 1240, top: top - 110, height: 420, background: 'radial-gradient(closest-side, rgba(5,6,12,0.62) 0%, rgba(5,6,12,0.5) 45%, rgba(5,6,12,0.2) 78%, rgba(5,6,12,0) 100%)'}} />
		<div style={{position: 'absolute', left: 960, top, transform: `scale(${push})`, transformOrigin: '0 100px'}}>
			{chars.map((c) => { const k = sm(seg(u, c.i * 0.034, c.i * 0.034 + 0.2)); if (k <= 0) return null;
				return <div key={c.i} style={{position: 'absolute', left: c.x, top: c.y - 40 * (1 - k), transform: `translate(-50%,0) scale(${0.7 + 0.3 * k})`, opacity: k, fontFamily: SANS, fontWeight: 900, fontSize: c.fs, lineHeight: 1, whiteSpace: 'nowrap',
					color: c.gold ? GOLD : INK, textShadow: c.gold ? `${ring(2, 'rgba(14,8,4,0.85)')}, 0 0 30px rgba(255,170,60,0.45)` : `${ring(2, 'rgba(8,8,12,0.75)')}, 0 4px 18px rgba(8,8,12,0.6)`}}>{c.ch}</div>; })}
		</div>
	</div>;
};
