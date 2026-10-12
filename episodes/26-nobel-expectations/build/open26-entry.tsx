import React from 'react';
import {Composition, registerRoot} from 'remotion';
import Open26, {T, W, H, FPS} from './Open26';
const Root: React.FC = () => <Composition id="OPEN26" component={Open26} durationInFrames={T.end} fps={FPS} width={W} height={H} />;
registerRoot(Root);
