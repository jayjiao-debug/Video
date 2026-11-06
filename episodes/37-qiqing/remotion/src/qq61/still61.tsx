/* ep61 · Nut as the giant star-dressed woman (owner 22:35: the thin arch "looks weird and doesn't make sense"): two key frames. */
import React from 'react';
import {AbsoluteFill, Composition, registerRoot} from 'remotion';
import {Pose, POSES} from '../qq60/rig60';
import {Bands, Subtitle, FC, PIC_T, PIC_B, FW, FH, InMaster60, rng} from '../qq60/frame60';
import {God61, P61} from './cast61';
import {NUT_LOW, NUT_ARCH} from './mystic61';
import {GY} from './shots61';
const W = FW, CY = (PIC_T + PIC_B) / 2;
const Night: React.FC = () => <g>
	<defs><linearGradient id="s61n" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#04061A" /><stop offset="0.6" stopColor="#141C4E" /><stop offset="1" stopColor="#1E3554" /></linearGradient>
		<filter id="s61b"><feGaussianBlur stdDeviation={50} /></filter><filter id="s61b14"><feGaussianBlur stdDeviation={14} /></filter>
		<radialGradient id="s61v" cx="50%" cy="48%" r="72%"><stop offset="52%" stopColor="#000" stopOpacity={0} /><stop offset="100%" stopColor="#02030A" stopOpacity={0.8} /></radialGradient></defs>
	<rect x={-200} y={-200} width={W + 400} height={FH + 400} fill="url(#s61n)" />
	<ellipse cx={420} cy={260} rx={480} ry={170} fill="#5B3A9A" opacity={0.22} filter="url(#s61b)" /><ellipse cx={1080} cy={360} rx={420} ry={150} fill="#1F8A8A" opacity={0.16} filter="url(#s61b)" />
	{(() => { const R = rng(4); return Array.from({length: 120}, (_, i) => <circle key={i} cx={R() * W} cy={R() * 760} r={0.7 + R() * 2} fill="#E6ECFF" opacity={0.3 + R() * 0.7} />); })()}
</g>;
const Earth: React.FC = () => <g><path d="M-200 868 C300 856 700 870 1100 860 C1300 856 1500 864 1700 862 V1200 H-200Z" fill="#16301F" /><path d="M-200 868 C300 856 700 870 1100 860 C1300 856 1500 864 1700 862" stroke="#4FA06A" strokeWidth={3} fill="none" opacity={0.6} /></g>;
/** Geb lying face up, head to the RIGHT (so his face is under Nut's) */
const GebR: React.FC<{x: number; s: number; id: string}> = ({x, s, id}) => <g transform={`rotate(90 ${x} ${GY - 4})`}><God61 id={id} who="geb" pose={{...POSES.rest, fs: -14, fe: 4, bs: -2, be: 6, rt: -3, at: 3, rk: 2, ak: 2, head: -6, neck: -2, lean: 0}} x={x} y={GY - 4} s={s} face={-1} bProp="none" fProp="none" /></g>;
const Frame: React.FC<{k: 'low' | 'arch'}> = ({k}) => <InMaster60.Provider value={true}><AbsoluteFill style={{background: FC.navy}}>
	<svg width={FW} height={FH}><defs><clipPath id="s61c"><rect x={0} y={PIC_T} width={FW} height={PIC_B - PIC_T} /></clipPath></defs>
		<g clipPath="url(#s61c)"><Night /><Earth />
			{k === 'low' ? <>
				<GebR x={520} s={22} id="gl" />
				<God61 id="nl" who="nut" pose={NUT_LOW} x={600} y={GY} s={58} />
				<rect x={-200} y={-200} width={W + 400} height={FH + 400} fill="#02030C" opacity={0.3} />
			</> : <>
				<ellipse cx={720} cy={420} rx={520} ry={260} fill="#9FB8FF" opacity={0.18} filter="url(#s61b)" />
				<God61 id="na" who="nut" pose={NUT_ARCH} x={500} y={GY} s={64} />
				<GebR x={170} s={22} id="ga" />
				<God61 id="sa" who="shu" pose={P61.lift(1)} x={700} y={GY} s={22} bProp="none" fProp="none" />
			</>}
			<rect x={-200} y={-200} width={W + 400} height={FH + 400} fill="url(#s61v)" /></g></svg>
	<AbsoluteFill><Bands t={0} /><Subtitle t={1} sub={{text: k === 'low' ? '整天紧紧抱在一起，天贴着地。' : '把女儿高高托起。', t0: 0, t1: 3}} gods={['盖布', '努特', '舒']} /></AbsoluteFill>
</AbsoluteFill></InMaster60.Provider>;
registerRoot(() => <><Composition id="STILLLOW" component={() => <Frame k="low" />} durationInFrames={1} fps={30} width={FW} height={FH} />
	<Composition id="STILLARCH" component={() => <Frame k="arch" />} durationInFrames={1} fps={30} width={FW} height={FH} /></>);
void CY;
