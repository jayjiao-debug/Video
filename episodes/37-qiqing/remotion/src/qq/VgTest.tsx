import React from 'react';
import {AbsoluteFill, Composition, registerRoot} from 'remotion';
import {Voyager, voyRecordPos} from './voyager';
const P: [number, number, number][] = [[0.0, -1.57, 0], [0.3, -1.35, 0], [-0.35, -1.3, 0.1], [0.5, -1.15, -0.1], [-0.6, -1.45, 0], [0.2, -1.0, 0.15]];
export const VgTest: React.FC = () => <AbsoluteFill style={{background: '#04050b'}}><svg width={1920} height={1080}>
	{P.map(([yaw, pitch, roll], i) => { const x = 330 + (i % 3) * 630, y = 290 + Math.floor(i / 3) * 520, r = voyRecordPos(x, y, 70, yaw, pitch, roll);
		return <g key={i}><Voyager x={x} y={y} s={70} yaw={yaw} pitch={pitch} roll={roll} mag={0.3} recordGlow={0.4} /><circle cx={r[0]} cy={r[1]} r={20} fill="none" stroke="#f0f" strokeWidth={2} /><text x={x - 280} y={y - 220} fill="#fff" fontSize={22}>{`${yaw} ${pitch} ${roll} z=${r[2].toFixed(2)}`}</text></g>; })}
</svg></AbsoluteFill>;
registerRoot(() => <Composition id="VG" component={VgTest} durationInFrames={10} fps={30} width={1920} height={1080} />);
