import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {Bands, Subtitle, FC, F_SERIF, PIC_T, PIC_B, FW, FH} from '../qq60/frame60';
import {PAL} from '../qq60/geo60';
import {SHOTS, CX, MID} from './shots61';
import {TreeChip, FamilyTree61, LIT, NodeId, TW} from './tree61';

/* ep61 storyboard boards: composition BOARD61 = 1440 × 1080, 30 fps, one frame per shot (frame i = key frame of shot i+1).
   Render a frame with scripts/frame.mjs (see tasks/ep61-storyboard/result.md). */
const fmtT = (a: number, b: number) => `${a.toFixed(1)}–${b.toFixed(1)} s`;
export const Board: React.FC<{i: number}> = ({i}) => {
	const sh = SHOTS[i], Scene = sh.scene;
	return <AbsoluteFill style={{background: PAL.plaster, overflow: 'hidden'}}>
		<svg width={FW} height={FH} viewBox={`0 0 ${FW} ${FH}`} style={{position: 'absolute', inset: 0}}>
			<defs><clipPath id="pic"><rect x={0} y={PIC_T} width={FW} height={PIC_B - PIC_T} /></clipPath></defs>
			<rect width={FW} height={FH} fill={FC.navy} />
			<g clipPath="url(#pic)"><Scene />{sh.chip !== false && <TreeChip n={sh.n} />}</g>
			{/* shot label (board only, not part of the film) */}
			<g transform={`translate(${FW - 500},${PIC_T + 40})`}><rect x={-6} y={-30} width={476} height={38} rx={6} fill="#18224A" opacity={0.85} />
				<text x={4} y={-3} fontSize={24} fontFamily={F_SERIF} fontWeight={900} fill={FC.cream}>镜 {String(sh.n).padStart(2, '0')} · {fmtT(sh.t0, sh.t1)} · {sh.size === 'wide' ? '全景' : sh.size === 'medium' ? '中景' : '特写'} · 第{sh.lines}句</text></g>
		</svg>
		<Bands t={0} /><Subtitle t={0} sub={{text: sh.text}} />
	</AbsoluteFill>;
};
const BoardFrame: React.FC = () => { const f = useCurrentFrame(); return <Board i={Math.min(SHOTS.length - 1, f)} />; };
/** the final family tree on its own (exported as the "family tree" picture for the pinned comment): 1440 × 1080, no bands */
const TreeCard: React.FC = () => <AbsoluteFill style={{background: PAL.plaster}}>
	<svg width={FW} height={FH} viewBox={`0 0 ${FW} ${FH}`}>
		<rect width={FW} height={FH} fill="#E8D4AA" /><rect x={0} y={0} width={FW} height={130} fill={FC.lapis} />
		<text x={CX} y={88} textAnchor="middle" fontSize={64} fontFamily={F_SERIF} fontWeight={900} fill={PAL.goldHi}>古埃及众神 · 一家人</text>
		<g transform={`translate(${CX - 568},${190})`}><FamilyTree61 lit={LIT[22] as NodeId[]} cid="card" /></g>
		<text x={CX} y={FH - 24} textAnchor="middle" fontSize={34} fontFamily={F_SERIF} fontWeight={900} fill={FC.ink}>你最想先听谁的故事？</text>
	</svg></AbsoluteFill>;
registerRoot(() => <>
	<Composition id="BOARD61" component={BoardFrame} durationInFrames={SHOTS.length} fps={30} width={FW} height={FH} />
	<Composition id="TREE61" component={TreeCard} durationInFrames={1} fps={30} width={FW} height={FH} />
</>);
void MID;
