import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Stage3D} from './stage3d';
import {Flower} from './props3d';

/** render-cost / debug probe */
export const GLBench: React.FC<{fx: boolean}> = ({fx}) => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<Stage3D cam={{pos: [0, 0, 4]}} fx={fx} focus={f < 10 ? undefined : 4} aperture={0.004} fog={[6, 20]}>
				<pointLight position={[2, 2, 3]} intensity={30} />
				<Flower position={[-1, 0, 0]} open={f < 10 ? 1 : 0.9} glow={0.3} />
				<Flower position={[1, 0, 0]} open={1} glow={0.3} rotation={[0, 0, f / 10]} />
			</Stage3D>
		</AbsoluteFill>
	);
};
