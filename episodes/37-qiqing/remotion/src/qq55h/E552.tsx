import React from 'react';
import {Composition, registerRoot, useCurrentFrame} from 'remotion';
import {Act2} from './act552';
/* ep55 何尊 v2 · act 2 (builder 2): cards G–M, film 42.20 → 73.90. Frame f renders film time t = f / 30. */
const F: React.FC = () => <Act2 t={useCurrentFrame() / 30} />;
const Root: React.FC = () => <Composition id="ACT2" component={F} width={1920} height={1080} fps={30} durationInFrames={5450} />;
registerRoot(Root);
