import React from 'react';
import {Composition, registerRoot, useCurrentFrame} from 'remotion';
import {Film55} from './film55h';
/* ep55 · 何尊 — the film, picture only: frame f = film time f / 30 (140 s). Built so far: 0 → 33.15 (cards 1, 2, T, 3–6). */
const F: React.FC = () => <Film55 t={useCurrentFrame() / 30} />;
const Root: React.FC = () => <Composition id="FILM55" component={F} width={1920} height={1080} fps={30} durationInFrames={4200} />;
registerRoot(Root);
