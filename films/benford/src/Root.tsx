import React from 'react';
import { Composition } from 'remotion';
import '@fontsource/cormorant-garamond/400-italic.css';
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/600.css';
import '@fontsource/cormorant-garamond/700.css';
import { GlobeTest } from './GlobeTest';
import { Film } from './Film';
import { FPS, W, H, FILM_FRAMES, b } from './lib';

/* Composition ids: only a-z, A-Z, 0-9 and "-" (no underscores). */
export const Root: React.FC = () => (
  <>
    <Composition id="Benford" component={Film} durationInFrames={FILM_FRAMES} fps={FPS} width={W} height={H} defaultProps={{ music: false }} />
    <Composition id="Sample01" component={Film} durationInFrames={Math.round((b(44) + 0.6) * FPS)} fps={FPS} width={W} height={H} defaultProps={{ music: true }} />
    <Composition id="GlobeTest" component={GlobeTest} durationInFrames={6} fps={FPS} width={W} height={H} />
  </>
);
