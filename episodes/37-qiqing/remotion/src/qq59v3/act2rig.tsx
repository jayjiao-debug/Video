import React from 'react';
import {Composition, registerRoot, useCurrentFrame} from 'remotion';
import {Karl, FK, poseJoints, KARL_CYCLE} from './act2_karl';

/* act 2 · rig check for the local variant: haul phases (to pick a both-feet-down stop), the designed poses, the guard. */
export const HANDS_UP: FK = {lean: -2, neck: -6, lt: 3, lk: 4, rt: -5, rk: 5, la: 168, le: 14, ra: 160, re: 18};
export const CROUCH: FK = {lean: 38, neck: -18, lt: 52, lk: 88, rt: -8, rk: 70, la: 30, le: 6, ra: 24, re: 10};
export const RAISE: FK = {lean: -4, neck: -14, lt: 4, lk: 6, rt: -14, rk: 8, la: 172, le: 6, ra: 20, re: 30};
const Sheet: React.FC = () => {
	const f = useCurrentFrame();
	return <svg width={1920} height={1080} style={{background: '#2a2d36'}}>
		{Array.from({length: 10}, (_, i) => <g key={i}><Karl x={120 + i * 180} y={330} h={230} attire="ice" action="haulSled" phase={i / 10} />
			<text x={120 + i * 180} y={370} fill="#ddd" fontSize={22}>{(i / 10).toFixed(1)}</text></g>)}
		{Array.from({length: 6}, (_, i) => <g key={'w' + i}><Karl x={120 + i * 180} y={640} h={230} attire="siberia" action="walk" phase={i / 6} />
			<text x={120 + i * 180} y={680} fill="#ddd" fontSize={22}>{(i / 6).toFixed(2)}</text></g>)}
		<Karl x={1250} y={640} h={230} attire="ice" action="pose" phase={0} fk={HANDS_UP} hands={['open', 'open']} />
		<Karl x={1450} y={640} h={230} attire="guard" action="walk" phase={f / 30 / KARL_CYCLE.walk.sec} facing={-1} />
		<Karl x={1650} y={640} h={230} attire="guard" action="stand" phase={0} />
		<Karl x={300} y={1040} h={300} attire="siberia" action="pose" phase={0} fk={CROUCH} hands={['fist', 'fist']} />
		<Karl x={700} y={1040} h={300} attire="siberia" action="pose" phase={0} fk={RAISE} hands={['fist', 'open']} />
		{(() => { const j = poseJoints(RAISE, 700, 1040, 300); return <circle cx={j.LHand[0]} cy={j.LHand[1]} r={6} fill="gold" />; })()}
		{(() => { const j = poseJoints(CROUCH, 300, 1040, 300); return <circle cx={j.LHand[0]} cy={j.LHand[1]} r={6} fill="gold" />; })()}
	</svg>;
};
registerRoot(() => <Composition id="A2Rig" component={Sheet} durationInFrames={30} fps={30} width={1920} height={1080} />);
