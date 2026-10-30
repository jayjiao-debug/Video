import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {SANS, KAI} from '../qq50/kit50';
import {useStampFonts} from '../qq44/skin44';
import {SwordFlat} from './flat53s';
import {A as SA} from './swordspec53s';
/* ep53 covers, three layouts of our own (owner: "not so copy-like" — the template's kicker / two left lines / sub line is gone).
   The sword is the film's own flat renderer (flat53s.SwordFlat, design C), the type is the film's title type (Noto Sans CJK 900) and
   its stamp type (LXGW WenKai), on the film's lacquer dark with one warm pool. Frame = layout: 0 竖剑竖排, 1 大字居中, 2 剑贯标题, 3 VIBE (the channel's own cover style). */
const L1 = '埋了两千多年', L2 = '为什么还亮着', Q = '？', NAME = '越王勾践剑', SUB = '1965年出土 · 湖北省博物馆';
const GOLD = 'linear-gradient(180deg, #FFF0C4 0%, #F2C766 48%, #C98A2E 100%)';
const HALO = '0 2px 3px rgba(10,5,3,0.9), 0 0 26px rgba(10,5,3,0.75)';
const SWL = SA.L / 10;   // the sword's length in cm (55.6)

/** the whole sword from its pommel end p0 to its tip p1 (screen px) */
const Sword: React.FC<{p0: [number, number]; p1: [number, number]; id: string}> = ({p0, p1, id}) => { const len = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]), k = len / SWL, rot = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]) * 180 / Math.PI;
	return <g transform={`rotate(${rot} ${p0[0]} ${p0[1]})`}><SwordFlat S={(a, w) => [p0[0] + a * k, p0[1] - w * k]} id={id} spec={0.45} /></g>; };
const Ground: React.FC<{w: number; h: number; px: number; py: number; rx: number; ry: number; id: string}> = ({w, h, px, py, rx, ry, id}) => <>
	<defs><radialGradient id={`bg${id}`} cx="50%" cy="45%" r="75%"><stop offset="0" stopColor="#24120C" /><stop offset="1" stopColor="#0A0504" /></radialGradient>
		<radialGradient id={`pl${id}`}><stop offset="0" stopColor="#FFC070" stopOpacity="0.34" /><stop offset="0.5" stopColor="#E08A38" stopOpacity="0.12" /><stop offset="1" stopColor="#E08A38" stopOpacity="0" /></radialGradient></defs>
	<rect width={w} height={h} fill={`url(#bg${id})`} />
	<ellipse cx={px} cy={py} rx={rx} ry={ry} fill={`url(#pl${id})`} /></>;
const gold = (fs: number, extra: React.CSSProperties = {}): React.CSSProperties => ({fontFamily: SANS, fontWeight: 900, fontSize: fs, lineHeight: 1.12, whiteSpace: 'nowrap',
	backgroundImage: GOLD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(0 3px 3px rgba(10,5,3,0.85)) drop-shadow(0 0 18px rgba(10,5,3,0.6))', ...extra});
const cream = (fs: number, extra: React.CSSProperties = {}): React.CSSProperties => ({fontFamily: SANS, fontWeight: 900, fontSize: fs, lineHeight: 1.12, whiteSpace: 'nowrap', color: '#F6EEDC', textShadow: HALO, ...extra});
const kai = (fs: number, extra: React.CSSProperties = {}): React.CSSProperties => ({fontFamily: KAI, fontWeight: 700, fontSize: fs, color: '#E8D6B8', letterSpacing: '0.12em', whiteSpace: 'nowrap', textShadow: HALO, ...extra});
/** a small vermilion name seal (vertical, two columns) */
const Seal: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => <div style={{position: 'absolute', left: x, top: y, width: s, height: s * 1.5, border: `${s * 0.05}px solid #C8432A`, borderRadius: s * 0.08,
	background: 'rgba(200,67,42,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
	<div style={{writingMode: 'vertical-rl', fontFamily: KAI, fontWeight: 700, fontSize: s * 0.36, lineHeight: 1.05, color: '#E25A3C', letterSpacing: '0.02em'}}>{NAME}</div></div>;

/* 0 竖剑竖排: the sword stands like the textbook photo (hilt up), the question in two vertical columns beside it, a name seal */
const V0: React.FC<{w: number; h: number}> = ({w, h}) => { const tall = h > w, sx = tall ? w * 0.76 : w * 0.68, y0 = tall ? h * 0.06 : h * 0.05, y1 = tall ? h * 0.82 : h * 0.95, sy = (y0 + y1) / 2;
	const fs = tall ? 132 : 118, colX = tall ? w * 0.26 : w * 0.30, top = tall ? h * 0.075 : h * 0.07;
	return <>
		<svg width={w} height={h} style={{position: 'absolute'}}><Ground w={w} h={h} px={sx} py={sy} rx={w * 0.35} ry={h * 0.55} id="v0" /><Sword p0={[sx, y0]} p1={[sx, y1]} id="v0" /></svg>
		<div style={{position: 'absolute', left: colX, top, display: 'flex', flexDirection: 'row-reverse', gap: fs * 0.22}}>
			<div style={{...cream(fs), writingMode: 'vertical-rl', lineHeight: 1}}>{L1}</div>
			<div style={{...gold(fs), writingMode: 'vertical-rl', lineHeight: 1, marginTop: fs * 1.05}}>{L2}{Q}</div>
		</div>
		<Seal x={tall ? w * 0.075 : w * 0.085} y={tall ? h * 0.075 : h * 0.07} s={tall ? 96 : 88} />
		<div style={{...kai(tall ? 34 : 30), position: 'absolute', left: tall ? w * 0.075 : w * 0.085, top: (tall ? h * 0.075 : h * 0.07) + (tall ? 96 : 88) * 1.5 + 24, writingMode: 'vertical-rl', letterSpacing: '0.18em'}}>{SUB}</div>
	</>; };

/* 1 大字居中: the question centred and big over the sword lying across the frame (wide) or across the diagonal (tall) */
const V1: React.FC<{w: number; h: number}> = ({w, h}) => { const tall = h > w, p0: [number, number] = tall ? [w * 0.12, h * 0.80] : [w * 0.07, h * 0.74], p1: [number, number] = tall ? [w * 0.90, h * 0.33] : [w * 0.94, h * 0.62], sy = (p0[1] + p1[1]) / 2;
	return <>
		<svg width={w} height={h} style={{position: 'absolute'}}><Ground w={w} h={h} px={w / 2} py={sy} rx={w * 0.6} ry={h * 0.32} id="v1" /><Sword p0={p0} p1={p1} id="v1" /></svg>
		<div style={{position: 'absolute', left: 0, right: 0, top: tall ? h * 0.07 : h * 0.08, textAlign: 'center'}}>
			<div style={kai(tall ? 38 : 36, {letterSpacing: '0.3em', marginBottom: 18})}>{NAME}</div>
			<div style={cream(tall ? 104 : 104)}>{L1}</div>
			<div style={gold(tall ? 120 : 128, {marginTop: 6})}>{L2}<span style={{marginRight: '-0.5em'}}>{Q}</span></div>
		</div>
	</>; };

/* 2 剑贯标题: the sword cuts diagonally between the two lines: line 1 above-left of it, line 2 below-right */
const V2: React.FC<{w: number; h: number}> = ({w, h}) => { const tall = h > w, p0: [number, number] = tall ? [w * 0.10, h * 0.80] : [w * 0.08, h * 0.82], p1: [number, number] = tall ? [w * 0.92, h * 0.08] : [w * 0.95, h * 0.30], sy = (p0[1] + p1[1]) / 2;
	return <>
		<svg width={w} height={h} style={{position: 'absolute'}}><Ground w={w} h={h} px={w / 2} py={sy} rx={w * 0.55} ry={h * 0.4} id="v2" /><Sword p0={p0} p1={p1} id="v2" /></svg>
		<div style={{position: 'absolute', left: tall ? w * 0.075 : w * 0.07, top: tall ? h * 0.07 : h * 0.08}}>
			<div style={kai(tall ? 36 : 34, {marginBottom: 10})}>{NAME}</div>
			<div style={{...cream(tall ? 118 : 116), whiteSpace: 'pre', lineHeight: 1.04}}>{tall ? '埋了\n两千多年' : L1}</div>
		</div>
		<div style={{position: 'absolute', right: tall ? w * 0.075 : w * 0.07, top: tall ? h * 0.60 : h * 0.76, textAlign: 'right'}}>
			<div style={{...gold(tall ? 128 : 124), whiteSpace: 'pre', lineHeight: 1.04}}>{tall ? '为什么\n还亮着？' : `${L2}${Q}`}</div>
		</div>
	</>; };

/* 3 VIBE (owner: "和我的风格类似的", like the channel's own covers, e.g. ep31 Cover31): the hero up top (tall) or on the right (wide),
   a small spaced VIBE知识大赏 line, the hook in Noto Serif 900 (cream line + gold-gradient line), 《片名》 under it, a soft vignette */
const SERIF = '"Noto Serif CJK SC", serif';
const V3: React.FC<{w: number; h: number}> = ({w, h}) => { const tall = h > w;
	const p0: [number, number] = tall ? [w * 0.08, h * 0.42] : [w * 0.70, h * 0.05], p1: [number, number] = tall ? [w * 0.93, h * 0.07] : [w * 0.70, h * 0.95];
	const fs = tall ? 112 : 108, line = (c: React.CSSProperties): React.CSSProperties => ({fontFamily: SERIF, fontWeight: 900, fontSize: fs, lineHeight: 1.16, whiteSpace: 'nowrap', ...c});
	return <>
		<svg width={w} height={h} style={{position: 'absolute'}}><Ground w={w} h={h} px={(p0[0] + p1[0]) / 2} py={(p0[1] + p1[1]) / 2} rx={tall ? w * 0.6 : w * 0.3} ry={tall ? h * 0.26 : h * 0.6} id="v3" /><Sword p0={p0} p1={p1} id="v3" /></svg>
		<div style={{position: 'absolute', left: tall ? 0 : 96, right: tall ? 0 : 'auto', top: tall ? h * 0.475 : h * 0.29, textAlign: tall ? 'center' : 'left'}}>
			<div style={{fontFamily: SANS, fontWeight: 700, fontSize: 34, color: 'rgba(242,230,204,0.62)', letterSpacing: '0.3em', marginBottom: 26, whiteSpace: 'nowrap'}}>VIBE知识大赏</div>
			<div style={line({color: '#F6EEDC', textShadow: '0 6px 30px rgba(0,0,0,0.6)'})}>{L1}</div>
			<div style={line({backgroundImage: 'linear-gradient(180deg, #ffe39b 0%, #f5c76b 45%, #c9913a 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.6))'})}>{L2}{tall ? <span style={{marginRight: '-0.5em'}}>{Q}</span> : Q}</div>
			<div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 38, color: '#E8BC66', letterSpacing: '0.2em', marginTop: 30, whiteSpace: 'nowrap'}}>《{NAME}》</div>
		</div>
		<div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)'}} />
	</>; };
const Cover: React.FC<{w: number; h: number}> = ({w, h}) => { useStampFonts(`${NAME}${SUB}${L1}${L2}${Q}`); const f = useCurrentFrame();
	return <AbsoluteFill style={{background: '#0A0504', overflow: 'hidden'}}>{f === 0 ? <V0 w={w} h={h} /> : f === 1 ? <V1 w={w} h={h} /> : f === 2 ? <V2 w={w} h={h} /> : <V3 w={w} h={h} />}</AbsoluteFill>; };
registerRoot(() => <>
	<Composition id="COVER53T" component={() => <Cover w={1080} h={1440} />} width={1080} height={1440} fps={1} durationInFrames={4} />
	<Composition id="COVER53W" component={() => <Cover w={1440} h={1080} />} width={1440} height={1080} fps={1} durationInFrames={4} />
</>);
