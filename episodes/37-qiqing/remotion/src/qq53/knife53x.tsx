import React from 'react';
/* ep53 v3: the bronze knife (铜削) that lay beside the sword in the inner coffin (facts A9: 「左侧有把套在黑漆鞘里的青铜剑和1件铜削」).
   ONE shared component for both chamber scenes (TakeB3 and TakeD3). STUB (producer): a simple curved single-edged bronze
   knife with a ring pommel, drawn in a local frame (mm): x along the knife 0 (ring) → 260 (tip), y across. The TakeB3 builder
   owns its final look; keep the props. */
export const BronzeKnife53: React.FC<{M: (x: number, y: number) => [number, number]; o?: number; id: string}> = ({M, o = 1, id}) => {
	const pts = (a: [number, number][]) => a.map(([x, y]) => M(x, y).map((v) => v.toFixed(1)).join(',')).join(' ');
	const blade: [number, number][] = [[40, -9], [120, -11], [200, -9], [255, 2], [200, 8], [120, 9], [40, 9]];
	return <g opacity={o}>
		<polygon points={pts(blade)} fill={`url(#kn${id})`} stroke="#2A1A0C" strokeWidth={1} />
		<defs><linearGradient id={`kn${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8A6A3A" /><stop offset="1" stopColor="#4A3418" /></linearGradient></defs>
		<polygon points={pts([[0, -6], [40, -6], [40, 6], [0, 6]])} fill="#5A4020" />
		<circle cx={M(-8, 0)[0]} cy={M(-8, 0)[1]} r={Math.max(2, Math.hypot(M(10, 0)[0] - M(0, 0)[0], M(10, 0)[1] - M(0, 0)[1]))} fill="none" stroke="#6A4C26" strokeWidth={2} />
	</g>; };
