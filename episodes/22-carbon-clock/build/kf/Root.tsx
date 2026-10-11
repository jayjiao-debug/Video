import React from 'react';
import {Composition} from 'remotion';
import {KeyFrame, type KF, type Line} from './common';
import {FRAMES22, LINES22} from './ep22';
import {FRAMES23, LINES23} from './ep23';
import {FRAMES24, LINES24} from './ep24';
import {FRAMES25, LINES25} from './ep25';

const EPS: Record<string, {frames: KF[]; lines: Line[]}> = {
	'22': {frames: FRAMES22, lines: LINES22 as Line[]},
	'23': {frames: FRAMES23, lines: LINES23 as Line[]},
	'24': {frames: FRAMES24, lines: LINES24 as Line[]},
	'25': {frames: FRAMES25, lines: LINES25 as Line[]},
};
const KFComp: React.FC<{ep: string; i: number}> = ({ep, i}) => <KeyFrame frames={EPS[ep].frames} lines={EPS[ep].lines} i={i} />;
export const KF_COUNTS = Object.fromEntries(Object.entries(EPS).map(([k, v]) => [k, v.frames.length]));
export const KFRoot: React.FC = () => (
	<>
		{Object.keys(EPS).map((ep) => (
			<Composition key={ep} id={`KF${ep}`} component={KFComp} durationInFrames={1} fps={30} width={1920} height={1080} defaultProps={{ep, i: 0}} />
		))}
	</>
);
