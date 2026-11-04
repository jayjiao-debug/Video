/* throwaway dev entry for act C (not committed): pose tests */
import React from 'react';
import {Composition, registerRoot, useCurrentFrame} from 'remotion';
import {God, Pose, wristTo, holdAt, reach, solve} from './rig60';
import {Stage60, FW, FH} from './frame60';
import {Skiff} from './props60b';
import {ANI} from './cast60';
import {EyeFx} from './act60c_common';
import {PAL, ap} from './geo60';

const mk = (rot: number, o: {at: number; ak: number; rt: number; rk: number; neck: number; head: number; b: [number, number]; f: [number, number]; bw: number; fw: number; bend?: number}): {pose: Pose; rot: number} => {
	let p: Pose = {lean: 0, neck: o.neck, head: o.head, bs: 0, be: 0, bw: 0, fs: 0, fe: 0, fw: 0, rt: o.rt, rk: o.rk, at: o.at, ak: o.ak, y: 9.6};
	p = wristTo(holdAt(p, 'b', o.b, false, o.bend ?? 1), 'b', o.bw);
	p = wristTo(holdAt(p, 'f', o.f, false, o.bend ?? 1), 'f', o.fw);
	return {pose: p, rot};
};
const V = [
	mk(-60, {at: 74, ak: 80, rt: 30, rk: 12, neck: 8, head: 4, b: [-1.5, -8.4], f: [-1.0, -10.3], bw: -165, fw: -100}),
	mk(-52, {at: 66, ak: 80, rt: 24, rk: 14, neck: 8, head: 4, b: [-1.5, -8.4], f: [-1.0, -10.3], bw: -165, fw: -100}),
	mk(-58, {at: 72, ak: 78, rt: 28, rk: 10, neck: 10, head: 6, b: [-1.6, -8.2], f: [-1.3, -8.6], bw: -170, fw: -175, bend: -1}),
	mk(-56, {at: 70, ak: 80, rt: 26, rk: 12, neck: 6, head: 2, b: [-1.6, -8.6], f: [-0.6, -10.7], bw: -170, fw: -95}),
];
const Dev: React.FC = () => { const t = useCurrentFrame() / 30;
	return <Stage60 t={t} grade="reeds" bg="plaster" frame={false}>
		{V.map((v, i) => { const hx = 250 + (i % 2) * 650, hy = 330 + Math.floor(i / 2) * 420, AS = 20;
			return <g key={i}><g transform={`translate(${hx},${hy}) rotate(${v.rot}) translate(${-hx},${-hy})`}>
				<God id={`dv${i}`} cast={ANI} pose={v.pose} x={hx} y={hy + 9.6 * AS} s={AS} sec={{t}} />
				<EyeFx id={`dve${i}`} pose={v.pose} x={hx} y={hy + 9.6 * AS} s={AS} skin={PAL.skinM} lid={1} smile={1} /></g>
				<Skiff x={hx + 70} y={hy + 18} s={20} t={0} len={22} />
				<text x={hx} y={hy + 120} fontSize={30}>{i}</text></g>; })}
	</Stage60>; };
registerRoot(() => <Composition id="C60DEV" component={Dev} durationInFrames={30} fps={30} width={FW} height={FH} />);
export const _k = {reach, solve, ap};
