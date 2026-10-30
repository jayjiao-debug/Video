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
/* 4–7 (owner: "title在中间，sword 换大小，4 种有张力的排版"): the channel style (VIBE line, serif hook, 《片名》), the title centred,
   the sword at four sizes and angles. swordAt: the guard's centre g, the angle (deg, screen), k px per cm. */
const GC = SA.guardC / 10;
const swordAt = (g: [number, number], ang: number, k: number): {p0: [number, number]; p1: [number, number]} => { const d = [Math.cos(ang * Math.PI / 180), Math.sin(ang * Math.PI / 180)];
	const p0: [number, number] = [g[0] - d[0] * GC * k, g[1] - d[1] * GC * k]; return {p0, p1: [p0[0] + d[0] * SWL * k, p0[1] + d[1] * SWL * k]}; };
const Glint: React.FC<{x: number; y: number; r: number}> = ({x, y, r}) => <g>
	<circle cx={x} cy={y} r={r * 0.9} fill="#FFE6A8" opacity={0.35} filter="url(#glb)" />
	<path d={`M${x},${y - r} L${x + r * 0.12},${y - r * 0.12} L${x + r},${y} L${x + r * 0.12},${y + r * 0.12} L${x},${y + r} L${x - r * 0.12},${y + r * 0.12} L${x - r},${y} L${x - r * 0.12},${y - r * 0.12} Z`} fill="#FFFBEE" /></g>;
const Title: React.FC<{tall: boolean; cy: number; gap?: number; scrim?: boolean}> = ({tall, cy, gap = 0, scrim = false}) => { const fs = tall ? 120 : 112;
	const line = (c: React.CSSProperties): React.CSSProperties => ({fontFamily: SERIF, fontWeight: 900, fontSize: fs, lineHeight: 1.16, whiteSpace: 'nowrap', ...c});
	return <div style={{position: 'absolute', left: 0, right: 0, top: cy, transform: 'translateY(-50%)', textAlign: 'center'}}>
		{scrim && <div style={{position: 'absolute', left: '50%', top: '50%', width: fs * 9, height: fs * 4.6, transform: 'translate(-50%,-50%)', background: 'radial-gradient(ellipse at center, rgba(8,4,2,0.82) 0%, rgba(8,4,2,0.55) 45%, rgba(8,4,2,0) 72%)'}} />}
		<div style={{position: 'relative'}}>
			<div style={{fontFamily: SANS, fontWeight: 700, fontSize: 34, color: 'rgba(242,230,204,0.66)', letterSpacing: '0.3em', marginBottom: 22, whiteSpace: 'nowrap', textShadow: HALO}}>VIBE知识大赏</div>
			<div style={line({color: '#F6EEDC', textShadow: '0 6px 30px rgba(0,0,0,0.7), 0 2px 4px rgba(0,0,0,0.8)'})}>{L1}</div>
			<div style={line({marginTop: gap, backgroundImage: 'linear-gradient(180deg, #ffe39b 0%, #f5c76b 45%, #c9913a 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.7)) drop-shadow(0 2px 3px rgba(0,0,0,0.8))'})}>{L2}<span style={{marginRight: '-0.5em'}}>{Q}</span></div>
			<div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 38, color: '#E8BC66', letterSpacing: '0.2em', marginTop: 26, whiteSpace: 'nowrap', textShadow: HALO}}>《{NAME}》</div>
		</div></div>; };
const VIG = <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.55) 100%)'}} />;
const Lay: React.FC<{w: number; h: number; n: number}> = ({w, h, n}) => { const tall = h > w, cy = tall ? h * 0.46 : h * 0.5;
	/* 4 巨剑斜贯: a giant sword (≈2.3 frames long) slants behind the title, guard low-left, the tip far off the top right */
	/* 5 剑尖指题: the sword hangs point-down from above, its tip a hand's breadth over the title, a glint on the point */
	/* 6 横剑压题: a big sword lies flat right under the title, guard left, the blade running out of the frame */
	/* 7 一剑劈题: the whole sword slices between the two lines of the title (a shallow slant) */
	const S = n === 4 ? (tall ? swordAt([190, 930], -35, 58) : swordAt([300, 860], -22, 50))
		: n === 5 ? (tall ? swordAt([w / 2, -250], 90, 15) : swordAt([w / 2, -250], 90, 13))
		: n === 6 ? (tall ? swordAt([150, cy + 330], -3, 30) : swordAt([230, cy + 335], -3, 32))
		: (tall ? swordAt([150, cy + 46], -4, 21) : swordAt([180, cy + 40], -3, 24));
	const tip = S.p1;
	return <>
		<svg width={w} height={h} style={{position: 'absolute'}}><defs><filter id="glb" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="10" /></filter></defs>
			<Ground w={w} h={h} px={w / 2} py={cy} rx={w * 0.62} ry={h * 0.45} id={`l${n}`} /><Sword p0={S.p0} p1={S.p1} id={`l${n}`} />
			{n === 5 && <Glint x={tip[0]} y={tip[1] - 6} r={tall ? 46 : 40} />}</svg>
		<Title tall={tall} cy={n === 5 ? cy + (tall ? 70 : 60) : cy} scrim={n === 4} gap={n === 7 ? (tall ? 150 : 140) : 0} />
		{VIG}
	</>; };
const Cover: React.FC<{w: number; h: number}> = ({w, h}) => { useStampFonts(`${NAME}${SUB}${L1}${L2}${Q}`); const f = useCurrentFrame();
	return <AbsoluteFill style={{background: '#0A0504', overflow: 'hidden'}}>{f === 0 ? <V0 w={w} h={h} /> : f === 1 ? <V1 w={w} h={h} /> : f === 2 ? <V2 w={w} h={h} /> : f === 3 ? <V3 w={w} h={h} /> : <Lay w={w} h={h} n={f} />}</AbsoluteFill>; };
registerRoot(() => <>
	<Composition id="COVER53T" component={() => <Cover w={1080} h={1440} />} width={1080} height={1440} fps={1} durationInFrames={8} />
	<Composition id="COVER53W" component={() => <Cover w={1440} h={1080} />} width={1440} height={1080} fps={1} durationInFrames={8} />
</>);
