import React, {useEffect, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
/* ep44 episode skin (owner note 2): same layout as look A, reskinned for "you are Einstein's brain".
   Key words in the brain's rose-gold, a modern sans for the story text, lab-record mono years in the stamp,
   and the counter as a specimen label. No red anywhere. */
export const SANS = "'Noto Sans CJK SC','Noto Sans CJK',sans-serif", MONO = "'DejaVu Sans Mono',monospace", FIG = "'DejaVu Sans','Noto Sans CJK SC',sans-serif";
export const ROSE = '#FFB291', ROSE_D = '#C9775E', INK = '#F4EEE4';
const SH = '0 0 2px rgba(10,8,8,0.95), 0 2px 6px rgba(10,8,8,0.7), 0 3px 22px rgba(10,8,8,0.55)';
const KEY_SH = '0 0 2px rgba(10,8,8,0.95), 0 2px 6px rgba(10,8,8,0.7), 0 0 18px rgba(255,140,105,0.55)';
const fx: React.CSSProperties = {position: 'absolute', fontFamily: SANS, color: INK, textShadow: SH};

/** "[key]" markup → spans, revealing only the first n characters (typed reveal) */
export const Marked: React.FC<{s: string; n?: number; pull?: boolean}> = ({s, n = 1e9, pull}) => {
	let left = n; const out: React.ReactNode[] = [];
	s.split(/(\[[^\]]+\])/).filter(Boolean).forEach((p, i) => {
		const key = p.startsWith('['), txt = key ? p.slice(1, -1) : p, vis = txt.slice(0, Math.max(0, left)), hid = txt.slice(vis.length); left -= txt.length;
		const isLast = i === s.split(/(\[[^\]]+\])/).filter(Boolean).length - 1;
		const st: React.CSSProperties = key ? {color: ROSE, textShadow: KEY_SH} : {};
		if (pull && isLast && !key && /[？。！]$/.test(vis) && hid === '') out.push(<span key={i} style={st}>{vis.slice(0, -1)}<span style={{marginRight: '-0.5em'}}>{vis.slice(-1)}</span></span>);
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
export const Counter: React.FC<{era?: string; v: number; blur?: number; o?: number; who?: string; date?: string; pulse?: number; grey?: boolean; lift?: number}> = ({era, v, blur = 0, o = 1, who = '你', date, pulse = 0, grey, lift = 0}) =>
	<div style={{...fx, left: 150, bottom: 58 + lift, display: 'flex', alignItems: 'flex-end', gap: 10, whiteSpace: 'nowrap', opacity: o, transform: pulse ? `scale(${1 + 0.1 * pulse})` : undefined, transformOrigin: '0% 100%', color: grey ? '#9aa0a4' : INK, textShadow: pulse ? `0 0 2px rgba(10,8,8,0.9), 0 2px 8px rgba(10,8,8,0.75), 0 0 ${20 + 30 * pulse}px rgba(255,150,110,${0.6 * pulse})` : '0 0 2px rgba(10,8,8,0.9), 0 2px 8px rgba(10,8,8,0.75), 0 0 26px rgba(10,8,8,0.55)'}}>
		{era && <span style={{fontSize: 26, fontWeight: 700, opacity: 0.8, marginBottom: 8, marginRight: 6, letterSpacing: '0.08em'}}>{era}</span>}
		<span style={{fontSize: 30, fontWeight: 700, marginBottom: 6}}>{who}</span>
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
	const soft = '0 0 2px rgba(10,8,8,0.95), 0 2px 8px rgba(10,8,8,0.7), 0 2px 20px rgba(10,8,8,0.55)';
	return <div style={{position: 'absolute', top: 54, right: 60, textAlign: 'right', paddingRight: 18, borderRight: `4px solid ${ROSE}`, opacity: o, color: INK, textShadow: soft, whiteSpace: 'nowrap'}}>
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
/** the brand as a small round seal, bottom-right, low opacity */
export const Seal: React.FC = () => <div style={{position: 'absolute', right: 56, bottom: 52, width: 54, height: 54, borderRadius: '50%', border: `2.5px solid ${INK}`, opacity: 0.36, transform: 'rotate(-10deg)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
	<div style={{position: 'absolute', inset: 4, borderRadius: '50%', border: `1px solid ${INK}`}} />
	<span style={{fontFamily: "'DejaVu Serif',serif", fontWeight: 700, fontSize: 28, color: INK, lineHeight: 1, marginTop: 2}}>J</span></div>;
/** story text, top-left; rows stack (row 1 stays while row 2 types) */
export const Story: React.FC<{rows: SubRow[]}> = ({rows}) => rows.length === 0 ? null : <>
	<div style={{position: 'absolute', borderRadius: '50%', filter: 'blur(38px)', left: 40, top: 70, width: 1080, height: 120 + 88 * rows.length, background: 'rgba(12,16,20,0.30)'}} />
	<div style={{...fx, left: 150, top: 132, fontWeight: 900, fontSize: 58, lineHeight: 1.5, letterSpacing: '0.03em', whiteSpace: 'nowrap'}}>{rows.map((r, i) => r.small ? <div key={i} style={{opacity: r.o ?? 1, fontSize: 34, fontWeight: 700, lineHeight: 1.6, letterSpacing: '0.12em', paddingLeft: '1.2em'}}>{r.s}</div>
			: <div key={i} style={{opacity: r.o ?? 1, paddingLeft: r.indent ? `${r.indent * 1.03}em` : undefined}}><Marked s={r.s} n={r.n} /></div>)}</div>
</>;
export const Punch: React.FC<{s: string; o?: number; n?: number}> = ({s, o = 1, n}) => <>
	<div style={{position: 'absolute', left: 460, right: 460, top: 440, height: 160, borderRadius: '50%', filter: 'blur(40px)', background: 'rgba(10,12,16,0.38)', opacity: o}} />
	<div style={{...fx, left: 0, right: 0, top: 470, textAlign: 'center', fontWeight: 900, fontSize: 76, letterSpacing: '0.06em', opacity: o}}><Marked s={s} n={n} pull /></div></>;
