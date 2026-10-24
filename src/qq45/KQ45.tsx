import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {W, H, HatchDefs, HorseHead, ZODIAC, Z, rnd, lerp} from './kit45';
import {QDefs, Shadow, Sky3, Tree3, Haiyantang3, Pool3} from './sets45';
import {Story, Stamp, Brand, Dial, dialFor} from './skin45';
/* ep45 quality pass: two stills for the owner (frame i at second i). */
const Grain: React.FC = () => <g pointerEvents="none"><rect width={W} height={H} filter="url(#paper)" opacity={0.18} style={{mixBlendMode: 'multiply'}} />
	<defs><radialGradient id="vq" cx="0.5" cy="0.5" r="0.8"><stop offset="0.62" stopColor="#0c1418" stopOpacity="0" /><stop offset="1" stopColor="#0c1418" stopOpacity="0.3" /></radialGradient></defs><rect width={W} height={H} fill="url(#vq)" /></g>;
const Q1 = <g>
	<defs><linearGradient id="q1w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1F3540" /><stop offset="1" stopColor="#2F4B55" /></linearGradient>
		<linearGradient id="beam" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFF4E0" stopOpacity="0.5" /><stop offset="1" stopColor="#FFF4E0" stopOpacity="0" /></linearGradient>
		<radialGradient id="pool" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#FFF1DA" stopOpacity="0.6" /><stop offset="1" stopColor="#FFF1DA" stopOpacity="0" /></radialGradient></defs>
	<rect width={W} height={H} fill="url(#q1w)" />
	{Array.from({length: 6}, (_, i) => <g key={i}><rect x={120 + i * 300} y={0} width={4} height={H} fill="#16262E" opacity={0.6} /><rect x={124 + i * 300} y={0} width={2} height={H} fill="#46646E" opacity={0.5} /></g>)}
	{/* the vitrine floor + pedestal */}
	<rect x={0} y={900} width={W} height={180} fill="#1B2C33" /><rect x={0} y={900} width={W} height={3} fill="#4C6670" />
	<Shadow x={1230} y={1004} rx={420} ry={30} o={0.55} />
	<rect x={830} y={950} width={760} height={130} fill="url(#mbV)" stroke="#2B2722" strokeWidth={1.5} /><rect x={830} y={950} width={760} height={10} fill="#FAF5EC" /><rect x={1450} y={960} width={140} height={120} fill="#8E826D" opacity={0.5} />
	{/* spotlight from the upper left */}
	<path d="M560,-40 L760,-40 L1700,960 L980,1000 Z" fill="url(#beam)" filter="url(#soft14)" />
	<ellipse cx={1210} cy={952} rx={360} ry={30} fill="url(#pool)" />
	{Array.from({length: 40}, (_, i) => { const u = rnd(i, 3), x = lerp(640, 1500, u) + (rnd(i, 4) - 0.5) * 200 * u, y = lerp(30, 900, u); return <circle key={i} cx={x} cy={y} r={1 + 2.2 * rnd(i, 5)} fill="#FFF4E0" opacity={0.25 + 0.4 * rnd(i, 6)} />; })}
	<HorseHead x={1170} y={640} s={1.12} id="q1h" glow={0.8} lx={-500} ly={-700} />
	{/* glass of the case: two faint verticals + a reflection band */}
	<rect x={760} y={60} width={3} height={880} fill="#BFD9DE" opacity={0.25} /><rect x={1660} y={60} width={3} height={880} fill="#BFD9DE" opacity={0.25} />
	<path d="M1560,60 L1620,60 L1460,940 L1400,940 Z" fill="#E6F2F4" opacity={0.06} />
</g>;
const Q2 = <g>
	<Sky3 id="q2s" top="#7FA7C2" bot="#E3ECE8" seed={4} />
	<Tree3 x={170} g={575} h={360} seed={7} hue="pine" haze={0.25} /><Tree3 x={1760} g={575} h={340} seed={8} hue="pine" haze={0.25} />
	<Tree3 x={330} g={590} h={430} seed={2} hue="willow" /><Tree3 x={1610} g={590} h={420} seed={3} hue="round" />
	<rect x={0} y={575} width={W} height={H - 575} fill="url(#pave)" />
	{Array.from({length: 24}, (_, i) => <line key={i} x1={960} y1={560} x2={-600 + i * 130} y2={H} stroke="#8D7D5F" strokeWidth={1} opacity={0.35} />)}
	{Array.from({length: 12}, (_, i) => { const y = 580 + Math.pow(i / 11, 1.6) * 500; return <line key={i} x1={0} y1={y} x2={W} y2={y} stroke="#8D7D5F" strokeWidth={1} opacity={0.3} />; })}
	<Haiyantang3 cx={960} g={575} k={0.8} />
	<Pool3 cx={960} g={575} k={1.22} present="all" id="q2p" />
</g>;
const FR = [
	{scene: Q1, furn: <><Story rows={[{s: '假如说，你是圆明园的[马首]。'}]} /><Brand /><Stamp y="2026" place="圆明园" l2="正觉寺 · 文殊亭" /></>},
	{scene: Q2, furn: <><Story rows={[{s: '你和十一个兄弟，坐在[水池两边]。'}]} /><Brand /><Stamp y="乾隆年间" place="海晏堂" l2="圆明园 · 西洋楼" /><Dial st={dialFor(new Set<Z>(ZODIAC))} rows={[{label: '在家', n: 12}]} hand={0} /></>},
];
const KQ: React.FC = () => { const f = useCurrentFrame(), F = FR[Math.min(FR.length - 1, Math.floor(f / 30))];
	return <AbsoluteFill style={{background: '#22374A'}}><svg width={W} height={H} style={{position: 'absolute'}}><HatchDefs /><QDefs />{F.scene}<Grain /></svg>{F.furn}</AbsoluteFill>; };
registerRoot(() => <Composition id="KQ45" component={KQ} durationInFrames={2 * 30} fps={30} width={W} height={H} />);
