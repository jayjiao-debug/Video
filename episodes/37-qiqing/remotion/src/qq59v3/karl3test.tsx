import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {Karl, Mum, Camel, Cart, Sled, ATTIRES, Attire, Action, KARL_CYCLE, RIM} from './karl3';

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
		<Karl x={1340} y={690} h={h} attire="home2026" action="lookUp" phase={0.2} rim={rim} />{lab(1340, 720, 'lookUp')}
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

registerRoot(() => <>
	<Composition id="K3Sheet" component={Sheet} durationInFrames={1} fps={FPS} width={W} height={H} defaultProps={{dark: false}} />
	<Composition id="K3SheetDark" component={Sheet} durationInFrames={1} fps={FPS} width={W} height={H} defaultProps={{dark: true}} />
	<Composition id="K3Actions" component={Actions} durationInFrames={1} fps={FPS} width={W} height={H} />
</>);
void useCurrentFrame; void KARL_CYCLE; type _A = Action;
