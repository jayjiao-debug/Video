import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {Karl, Mum, Camel, Cart, Sled, ATTIRES, Attire, Action, KARL_CYCLE, RIM, karlTravel} from './karl3';
import {SeaShot} from './karl3sea';

/* ep59 v3 · test compositions for the Karl rig (karl3.tsx). Entry point: npx remotion render src/qq59v3/karl3test.tsx <ID> …
   K3Sheet / K3SheetDark  the model sheet (every attire, same scale)       K3Actions  every action in one still
   K3Cycles  walk / pushCart ×3 / haulSled / wade / leadCamel, 2 s each    K3Idle  stand / lookUp / hug
   K3Swim (6 s) and K3Float (3 s): the swim shot (karl3sea.tsx) */
const W = 1920, H = 1080, FPS = 30;
const NAME: Record<Attire, string> = {start1998: '1998 · start', jungle: 'Darién · jungle', ice: 'Bering · ice', siberia: 'Siberia', gobi: 'Gobi', swim: 'swim', home2026: '2026 · home'};

const Sheet: React.FC<{dark: boolean}> = ({dark}) => {
	const bg = dark ? '#0f1115' : '#7d7e82', ink = dark ? '#d8d2c6' : '#1a1a1e', g = 900, h = 620;
	return <AbsoluteFill style={{background: bg}}><svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
		{dark && <defs><radialGradient id="shg" cx="0.5" cy="0.55" r="0.7"><stop offset="0" stopColor="#262a32" /><stop offset="1" stopColor="#0f1115" /></radialGradient></defs>}
		{dark && <rect width={W} height={H} fill="url(#shg)" />}
		<rect x={0} y={g} width={W} height={H - g} fill={dark ? '#0a0b0e' : '#6c6d71'} />
		<text x={60} y={70} fill={ink} fontFamily="Helvetica, Arial, sans-serif" fontSize={30} fontWeight={700}>Karl · model sheet (karl3)</text>
		<text x={60} y={108} fill={ink} fontFamily="Helvetica, Arial, sans-serif" fontSize={20} opacity={0.75}>one head, hair and build · attire changes only · h = {h}px · rim light from the left</text>
		{ATTIRES.map((a, i) => { const x = 175 + i * 262;
			return <g key={a}><Karl x={x} y={g} h={h} attire={a} action="stand" phase={0.2} lightDir="left" />
				<text x={x} y={g + 60} fill={ink} fontFamily="Helvetica, Arial, sans-serif" fontSize={22} textAnchor="middle">{NAME[a]}</text></g>; })}
		<line x1={40} x2={W - 40} y1={g - h} y2={g - h} stroke={ink} strokeDasharray="6 8" opacity={0.35} />
	</svg></AbsoluteFill>;
};

/** every action in one still (QA) */
const Actions: React.FC = () => {
	const bg = '#2a2d33', rim = RIM;
	const lab = (x: number, y: number, s: string) => <text x={x} y={y} fill="#d8d2c6" fontFamily="Helvetica, Arial, sans-serif" fontSize={18} textAnchor="middle">{s}</text>;
	const h = 250;
	return <AbsoluteFill style={{background: bg}}><svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
		{[330, 690].map((y) => <rect key={y} x={0} y={y} width={W} height={3} fill="#1a1c20" />)}
		<Karl x={120} y={330} h={h} attire="home2026" action="walk" phase={0.15} rim={rim} />{lab(120, 360, 'walk')}
		<Karl x={330} y={330} h={h} attire="start1998" action="pushCart" phase={0.3} rim={rim} />{lab(420, 360, 'pushCart · 1998')}
		<Karl x={1060} y={330} h={h} attire="ice" action="haulSled" phase={0.3} rim={rim} />{lab(900, 360, 'haulSled')}
		<Karl x={1260} y={330} h={h} attire="siberia" action="pushCart" phase={0.6} rim={rim} />{lab(1380, 360, 'pushCart · Siberia')}
		<Karl x={1800} y={330} h={h} attire="home2026" action="hug" phase={0.2} rim={rim} />{lab(1820, 360, 'hug')}
		<Karl x={720} y={690} h={h} attire="gobi" action="leadCamel" phase={0.3} rim={rim} />{lab(500, 720, 'leadCamel')}
		<rect x={820} y={690 - 0.56 * h} width={300} height={0.56 * h} fill="#22343a" opacity={0.0} />
		<Karl x={960} y={690} h={h} attire="jungle" action="wade" phase={0.5} rim={rim} />{lab(960, 720, 'wade')}
		<Karl x={1180} y={690} h={h} attire="siberia" action="stand" phase={0.2} rim={rim} />{lab(1180, 720, 'stand')}
		<Karl x={1340} y={690} h={h} attire="home2026" action="lookUp" phase={0.2} rim={rim} facing={-1} lightDir="right" />{lab(1340, 720, 'lookUp (facing -1)')}
		<Karl x={1460} y={690} h={h} attire="home2026" action="pushCart" phase={0.1} rim={rim} />{lab(1600, 720, 'pushCart · 2026')}
		<rect x={0} y={900} width={W} height={2} fill="#3c4a52" />
		<Karl x={420} y={900} h={h} attire="swim" action="swim" phase={0.7} rim={rim} />{lab(380, 1000, 'swim')}
		<Karl x={900} y={900} h={h} attire="swim" action="float" phase={0.2} rim={rim} />{lab(900, 1000, 'float')}
		<Mum x={1150} y={1040} h={h * 0.88} action="stand" phase={0.1} rim={rim} />{lab(1150, 1065, 'Mum')}
		<Camel x={1500} y={1040} h={h * 0.55} rim={rim} />
		<Cart x={1700} y={1040} h={h * 0.55} kind="orange" rim={rim} />
		<Sled x={1880} y={1040} h={h * 0.55} rim={rim} />
	</svg></AbsoluteFill>;
};

/* ---------- motion cycles: a tracking camera (he stays put, the world slides by at exactly his speed: any foot slide shows against the marks) ---------- */
type Seg = {label: string; attire: Attire; action: Action; sx: number; h: number; sky: [string, string]; ground: string; mark: string; rim: string; light?: 'left' | 'right'};
const SEGS: Seg[] = [
	{label: 'walk · 2026', attire: 'home2026', action: 'walk', sx: 900, h: 600, sky: ['#2a2f3c', '#8a7a78'], ground: '#1d1c20', mark: '#3a3840', rim: '#ffd9a8'},
	{label: 'pushCart · 1998 (the Beast)', attire: 'start1998', action: 'pushCart', sx: 560, h: 560, sky: ['#3a4250', '#b8a890'], ground: '#2a2a2c', mark: '#4a4a4c', rim: '#ffe2b8'},
	{label: 'pushCart · Siberia', attire: 'siberia', action: 'pushCart', sx: 560, h: 560, sky: ['#5a6a7a', '#c8d0d6'], ground: '#d6dde2', mark: '#aab4bc', rim: '#fff4e4'},
	{label: 'haulSled · Bering ice', attire: 'ice', action: 'haulSled', sx: 1380, h: 560, sky: ['#26324a', '#e8b890'], ground: '#c4ced6', mark: '#98a6b2', rim: '#ffd0a0', light: 'right'},
	{label: 'wade · Darién', attire: 'jungle', action: 'wade', sx: 860, h: 640, sky: ['#0e1a14', '#2c4632'], ground: '#1a2a22', mark: '#2a3a30', rim: '#d8f0c8'},
	{label: 'leadCamel · Gobi', attire: 'gobi', action: 'leadCamel', sx: 1480, h: 430, sky: ['#5a4a5a', '#e8b880'], ground: '#a08060', mark: '#806448', rim: '#ffd9a8', light: 'right'},
	{label: 'pushCart · 2026 (orange bags)', attire: 'home2026', action: 'pushCart', sx: 560, h: 560, sky: ['#2a2f3c', '#9a8a80'], ground: '#1d1c20', mark: '#3a3840', rim: '#ffd9a8'},
];
const SEG_F = 60;
const SegView: React.FC<{sg: Seg; f: number; idx: number}> = ({sg, f, idx}) => {
	const G = 900, t = f / FPS, {phase, dx} = karlTravel(sg.action, t, sg.h), wade = sg.action === 'wade', wy = G - 0.56 * sg.h * 1.0;
	const marks = [] as React.ReactNode[];
	for (let i = -2; i < 40; i++) { const wx = i * 140, x = wx - dx + 200; if (x < -60 || x > W + 60) continue;
		marks.push(<rect key={i} x={x - 2} y={G} width={4} height={i % 2 ? 22 : 40} fill={sg.mark} />, <ellipse key={'s' + i} cx={x + 50} cy={G + 8} rx={14} ry={5} fill={sg.mark} opacity={0.7} />); }
	return <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
		<defs><linearGradient id={`sk${idx}`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={sg.sky[0]} /><stop offset="1" stopColor={sg.sky[1]} /></linearGradient></defs>
		<rect width={W} height={H} fill={`url(#sk${idx})`} />
		{wade && Array.from({length: 14}, (_, i) => { const x = ((i * 157 - dx * 0.6) % (W + 300) + W + 300) % (W + 300) - 150; return <path key={i} d={`M${x},${wy} Q${x + 30},${wy - 360 - 80 * (i % 3)} ${x + 90 + 40 * (i % 2)},${wy - 520 - 60 * (i % 4)} L${x + 100},${wy - 500} Q${x + 46},${wy - 330} ${x + 26},${wy} Z`} fill="#0c1a12" opacity={0.85} />; })}
		<rect x={0} y={G} width={W} height={H - G} fill={sg.ground} />{marks}
		{wade && <rect x={0} y={wy} width={W} height={H - wy} fill="#2a3e34" />}
		{wade && Array.from({length: 26}, (_, i) => { const x = ((i * 97 - dx) % (W + 200) + W + 200) % (W + 200) - 100; return <rect key={'w' + i} x={x} y={wy + 14 + (i % 5) * 24} width={60 + (i % 3) * 30} height={2} fill="#5e7a6a" opacity={0.5} />; })}
		<Karl x={sg.sx} y={G} h={sg.h} attire={sg.attire} action={sg.action} phase={phase} rim={sg.rim} lightDir={sg.light ?? 'left'} foam="#c8dccb" underO={0.22} />
		{wade && <rect x={0} y={wy} width={W} height={2} fill="#9ab8a4" opacity={0.5} />}
		<text x={60} y={80} fill="#f4efe6" fontFamily="Helvetica, Arial, sans-serif" fontSize={34} fontWeight={700} style={{paintOrder: 'stroke'}} stroke="#00000066" strokeWidth={4}>{sg.label}</text>
		<text x={60} y={120} fill="#f4efe6" fontFamily="Helvetica, Arial, sans-serif" fontSize={20} opacity={0.8}>phase {phase.toFixed(2)} · stride {KARL_CYCLE[sg.action].stride.toFixed(3)} h / cycle · {KARL_CYCLE[sg.action].sec}s / cycle</text>
	</svg>;
};
const Cycles: React.FC = () => { const f = useCurrentFrame(), i = Math.min(SEGS.length - 1, Math.floor(f / SEG_F));
	return <AbsoluteFill style={{background: '#111'}}><SegView sg={SEGS[i]} f={f - i * SEG_F} idx={i} /></AbsoluteFill>; };
/** idle actions: stand (breathing), lookUp, hug (with his mother), Mum walking */
const Idle: React.FC = () => { const f = useCurrentFrame(), t = f / FPS, seg = Math.min(2, Math.floor(f / 60)), G = 900;
	return <AbsoluteFill style={{background: '#14161b'}}><svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
		<rect x={0} y={G} width={W} height={H - G} fill="#0b0c0f" />
		{seg === 0 && <><Karl x={560} y={G} h={620} attire="home2026" action="stand" phase={t / 4.2} /><Karl x={1300} y={G} h={620} attire="siberia" action="stand" phase={t / 4.2 + 0.3} lightDir="right" rim="#cfe0ff" /></>}
		{seg === 1 && <><Karl x={560} y={G} h={620} attire="home2026" action="lookUp" phase={t / 4.2} /><Karl x={1300} y={G} h={620} attire="gobi" action="lookUp" phase={t / 4.2} t={t} /></>}
		{seg === 2 && <><Karl x={760} y={G} h={640} attire="home2026" action="hug" phase={t / 3.6} rim="#ffcf90" lightDir="right" /><Mum x={1500} y={G} h={640 * 0.88} action="walk" phase={t / 1.45} facing={-1} rim="#ffcf90" lightDir="right" /></>}
		<text x={60} y={80} fill="#f4efe6" fontFamily="Helvetica, Arial, sans-serif" fontSize={34} fontWeight={700}>{['stand (breathing)', 'lookUp', 'hug · Mum walking'][seg]}</text>
	</svg></AbsoluteFill>; };

/** the swim (6 s) and the float (3 s): low camera at the water line, dawn */
const Swim: React.FC<{mode: 'swim' | 'float'}> = ({mode}) => { const f = useCurrentFrame();
	return <AbsoluteFill style={{background: '#0b0d14'}}><svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}><SeaShot t={f / FPS} mode={mode} h={mode === 'float' ? 1100 : 1150} dur={mode === 'float' ? 3 : 6} /></svg></AbsoluteFill>; };

registerRoot(() => <>
	<Composition id="K3Sheet" component={Sheet} durationInFrames={1} fps={FPS} width={W} height={H} defaultProps={{dark: false}} />
	<Composition id="K3SheetDark" component={Sheet} durationInFrames={1} fps={FPS} width={W} height={H} defaultProps={{dark: true}} />
	<Composition id="K3Actions" component={Actions} durationInFrames={1} fps={FPS} width={W} height={H} />
	<Composition id="K3Cycles" component={Cycles} durationInFrames={SEGS.length * SEG_F} fps={FPS} width={W} height={H} />
	<Composition id="K3Idle" component={Idle} durationInFrames={180} fps={FPS} width={W} height={H} />
	<Composition id="K3Swim" component={Swim} durationInFrames={180} fps={FPS} width={W} height={H} defaultProps={{mode: 'swim' as const}} />
	<Composition id="K3Float" component={Swim} durationInFrames={90} fps={FPS} width={W} height={H} defaultProps={{mode: 'float' as const}} />
</>);
