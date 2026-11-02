import React from 'react';
import {Composition, registerRoot, useCurrentFrame} from 'remotion';
import {Act4} from './act554';
/* ep55 何尊 v2 · act 4 (builder 4): frame f renders film time t = f / 30; this act covers 101.1 → 137.3 s (frames 3033–4118). */
const F: React.FC = () => <Act4 t={useCurrentFrame() / 30} />;
const Root: React.FC = () => <Composition id="ACT4" component={F} width={1920} height={1080} fps={30} durationInFrames={5450} />;
registerRoot(Root);
