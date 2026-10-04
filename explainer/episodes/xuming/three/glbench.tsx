import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Stage3D} from './stage3d';

/** render-cost probe: a single lit box, optionally without the post chain */
export const GLBench: React.FC<{fx: boolean}> = ({fx}) => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<Stage3D cam={{pos: [0, 0, 5]}} fx={fx}>
				<pointLight position={[2, 2, 3]} intensity={30} />
				<mesh rotation={[f / 20, f / 30, 0]}>
					<boxGeometry args={[1, 1, 1]} />
					<meshStandardMaterial color="#c08040" />
				</mesh>
			</Stage3D>
		</AbsoluteFill>
	);
};
