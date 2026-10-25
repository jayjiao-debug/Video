import './skinflag44';
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Rough, FRAMES, FPS} from './EP44ROUGH';
import {W, H} from './kit44';
/* picture only (no captions, stamp, counter or seal) for cover art */
const Pic: React.FC = () => <Rough pictureOnly />;
registerRoot(() => <Composition id="COVERPIC" component={Pic} durationInFrames={FRAMES} fps={FPS} width={W} height={H} />);
