import React from 'react';
import {Composition, registerRoot, useCurrentFrame} from 'remotion';
import {Act5} from './act555';
/* ep55 何尊 v2 · act 5 (X5 → END): frame f = film time f / 30; the act covers frames 4119–5449. */
const F: React.FC = () => <Act5 t={Math.max(137.3, useCurrentFrame() / 30)} />;
const Root: React.FC = () => <Composition id="ACT5" component={F} width={1920} height={1080} fps={30} durationInFrames={5450} />;
registerRoot(Root);
