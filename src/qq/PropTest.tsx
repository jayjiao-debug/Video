import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {Plastron, Fire, TangLetter, TelegraphKey, Phonautograph, LiquidTransmitter, ReedReceiver, HexKite, Teletype, Cabinet, DeskPhone} from './props41';
import {MilkyWay, StarField, hill} from './sky41';
import {Rimmed, POSES} from './figure4';
export const PropTest: React.FC = () => { const f = useCurrentFrame(), t = f / 30; const hl = hill(1920, 1080, 1300, 820, 700, 1000);
	return <AbsoluteFill style={{background: '#070814'}}><svg width={1920} height={1080}>
		<StarField t={t} /><MilkyWay t={t} />
		<path d={hl.d} fill="#05050a" />
		<Rimmed x={1250} ground={hl.yAt(1250) + 2} h={150} pose={POSES.lookUp} look={{dress: 'jacket', head: 'short'}} rim="#9fb4ff" rimOp={0.5} />
		<Rimmed x={1330} ground={hl.yAt(1330) + 2} h={140} pose={POSES.lookUp} look={{dress: 'dress', head: 'long'}} rim="#9fb4ff" rimOp={0.5} flip />
		<g transform="translate(0,-40)">
		<Plastron x={150} y={300} s={0.9} k={0.8} ink={1} glow={1} /><Fire x={340} y={380} t={t} r={0.8} />
		<TangLetter x={500} y={300} open={1} /><TangLetter x={640} y={300} open={0} rot={-8} />
		<g fill="#ccc"><rect x={720} y={180} width={1200} height={260} fill="#c6a982" /></g>
		<TelegraphKey x={850} y={400} press={0.5} spark={0.6} />
		<Phonautograph x={1200} y={420} s={0.8} trace={0.7} t={t} />
		<LiquidTransmitter x={1550} y={420} s={0.9} vib={1} t={t} /><ReedReceiver x={1750} y={330} rot={-20} glow={1} />
		<HexKite x={150} y={560} rot={20} col="#ddd" />
		<Teletype x={400} y={760} s={0.8} paperText="LO" t={t} /><Cabinet x={560} y={760} s={0.6} t={t} />
		<DeskPhone x={900} y={760} />
		</g>
	</svg></AbsoluteFill>; };
registerRoot(() => <Composition id="PT" component={PropTest} durationInFrames={60} fps={30} width={1920} height={1080} />);
