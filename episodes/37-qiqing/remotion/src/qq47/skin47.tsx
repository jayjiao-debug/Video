import React from 'react';
import {PP, AU, KEY} from './kit47';
/* ep47 skin "对折剪纸": series layout (story top-left, stamp top-right, brand mark, punch centred) reskinned:
   heavy sans story text in paper-white on a soft ink scrim, key words moon-gold (no glow);
   the stamp is a split tally (符): a paper tag cut in two along a zigzag — year on the left half, source on the right. */
export const SANS = "'Noto Sans CJK SC','Noto Sans CJK',sans-serif", SERIF = "'Noto Serif CJK SC','Noto Serif CJK',serif", NUM = "'DejaVu Sans','Noto Sans CJK SC',sans-serif";
export const INK = '#FFF8EA';
const SH = '0 0 2px rgba(27,24,48,0.95), 0 2px 6px rgba(27,24,48,0.7), 0 3px 22px rgba(27,24,48,0.55)';
const fx: React.CSSProperties = {position: 'absolute', fontFamily: SANS, color: INK, textShadow: SH};

/** "[key]" → moon-gold spans; typed reveal of the first n characters; pull = pull back a final ？/。 for centring */
export const Marked: React.FC<{s: string; n?: number; pull?: boolean}> = ({s, n = 1e9, pull}) => {
	let left = n; const parts = s.split(/(\[[^\]]+\])/).filter(Boolean), out: React.ReactNode[] = [];
	parts.forEach((p, i) => {
		const key = p.startsWith('['), txt = key ? p.slice(1, -1) : p, vis = txt.slice(0, Math.max(0, left)), hid = txt.slice(vis.length); left -= txt.length;
		const st: React.CSSProperties = key ? {color: KEY} : {};
		if (pull && i === parts.length - 1 && !key && /[？。！，：]$/.test(vis) && hid === '') out.push(<span key={i} style={st}>{vis.slice(0, -1)}<span style={{marginRight: '-0.5em'}}>{vis.slice(-1)}</span></span>);
		else out.push(<span key={i} style={st}>{vis}<span style={{opacity: 0}}>{hid}</span></span>);
	});
	return <>{out}</>;
};
export type SubRow = {s: string; n?: number; o?: number};
/** story text, top-left; rows stack (the latest is last) */
export const Story: React.FC<{rows: SubRow[]; o?: number}> = ({rows, o = 1}) => rows.length === 0 ? null : <div style={{opacity: o}}>
	<div style={{position: 'absolute', borderRadius: '50%', filter: 'blur(42px)', left: 30, top: 70, width: 1120, height: 130 + 88 * rows.length, background: 'rgba(27,24,48,0.34)'}} />
	<div style={{...fx, left: 150, top: 132, fontWeight: 900, fontSize: 58, lineHeight: 1.5, letterSpacing: '0.03em', whiteSpace: 'nowrap'}}>{rows.map((r, i) => <div key={i} style={{opacity: r.o ?? 1}}><Marked s={r.s} n={r.n} /></div>)}</div>
</div>;
/** a punch line, centred and bigger */
export const Punch: React.FC<{s: string; o?: number; n?: number; top?: number; size?: number}> = ({s, o = 1, n, top = 470, size = 78}) => <>
	<div style={{position: 'absolute', left: 360, right: 360, top: top - 30, height: 170, borderRadius: '50%', filter: 'blur(42px)', background: 'rgba(27,24,48,0.42)', opacity: o}} />
	<div style={{...fx, left: 0, right: 0, top, textAlign: 'center', fontWeight: 900, fontSize: size, letterSpacing: '0.06em', opacity: o}}><Marked s={s} n={n} pull /></div></>;
/** the classical original, small, under the story block */
export const Orig: React.FC<{s: string; o?: number; top?: number}> = ({s, o = 1, top = 330}) =>
	<div style={{...fx, left: 154, top, fontFamily: SERIF, fontWeight: 700, fontSize: 34, letterSpacing: '0.12em', opacity: 0.88 * o}}>「{s}」</div>;

/** the split tally (符): two paper halves with a zigzag seam; gap opens it */
const ZIG = 'L0,8 L-7,16 L0,24 L-7,32 L0,40 L-7,48 L0,56 L-7,64 L0,72 L-7,80 L0,88 L-7,96 L0,104';
export const Stamp: React.FC<{y: string; src: string; l3?: string; o?: number; gap?: number}> = ({y, src, l3, o = 1, gap = 6}) => <div style={{position: 'absolute', top: 88, right: 60, opacity: o, display: 'flex', alignItems: 'flex-start', filter: 'drop-shadow(0 4px 8px rgba(27,24,48,0.4))'}}>
	<div style={{background: PP.cream, color: PP.ink, padding: '10px 26px 10px 22px', fontFamily: NUM, fontWeight: 800, fontSize: 46, lineHeight: '84px', height: 104, boxSizing: 'border-box', clipPath: 'polygon(0 0, 100% 0, 100% 8%, 96% 15%, 100% 23%, 96% 31%, 100% 38%, 96% 46%, 100% 54%, 96% 62%, 100% 69%, 96% 77%, 100% 85%, 96% 92%, 100% 100%, 0 100%)', borderRadius: '10px 0 0 10px', whiteSpace: 'nowrap'}}>
		<span style={{fontFamily: SANS}}>{y}</span></div>
	<div style={{width: gap}} />
	<div style={{background: PP.indigo, color: INK, padding: '10px 22px 10px 30px', fontFamily: SANS, fontWeight: 800, fontSize: 36, lineHeight: '42px', minHeight: 104, boxSizing: 'border-box', clipPath: 'polygon(4% 0, 100% 0, 100% 100%, 4% 100%, 0 92%, 4% 85%, 0 77%, 4% 69%, 0 62%, 4% 54%, 0 46%, 4% 38%, 0 31%, 4% 23%, 0 15%, 4% 8%)', borderRadius: '0 10px 10px 0', whiteSpace: 'nowrap', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
		<div>{src}</div>{l3 && <div style={{fontSize: 28, fontWeight: 600, opacity: 0.85}}>{l3}</div>}</div>
</div>;
export const Brand: React.FC<{o?: number}> = ({o = 1}) => <div style={{...fx, top: 30, right: 62, fontSize: 28, letterSpacing: '0.06em', fontWeight: 700, opacity: 0.92 * o}}><span style={{color: KEY}}>◆</span> Juno · VIBE知识大赏</div>;
/** title card text (centred, two lines) */
export const Title: React.FC<{a: string; b: string; o?: number; top?: number}> = ({a, b, o = 1, top = 700}) => <div style={{opacity: o}}>
	<div style={{position: 'absolute', left: 260, right: 260, top: top - 40, height: 260, borderRadius: '50%', filter: 'blur(48px)', background: 'rgba(27,24,48,0.45)'}} />
	<div style={{...fx, left: 0, right: 0, top, textAlign: 'center', fontWeight: 900, fontSize: 86, letterSpacing: '0.05em', lineHeight: 1.25}}>{a}</div>
	<div style={{...fx, left: 0, right: 0, top: top + 120, textAlign: 'center', fontWeight: 800, fontSize: 52, letterSpacing: '0.1em', color: KEY}}>{b}</div>
</div>;
export {AU};
