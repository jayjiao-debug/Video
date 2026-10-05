import React from 'react';
import { Composition } from 'remotion';
import '@fontsource/cormorant-garamond/400-italic.css';
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/600.css';
import '@fontsource/cormorant-garamond/700.css';
import { Film } from './Film';
import { Cover } from './Cover';
import { FPS, W, H, FILM_FRAMES } from './lib';

/* Composition ids: only a-z, A-Z, 0-9 and "-" (no underscores). */
export const Root: React.FC = () => (
  <>
    <Composition id="Zero" component={Film} durationInFrames={FILM_FRAMES} fps={FPS} width={W} height={H} defaultProps={{ music: false }} />
    <Composition id="CoverWide" component={Cover} durationInFrames={1} fps={FPS} width={1440} height={1080} defaultProps={{ layout: 'wide' as const }} />
    <Composition id="CoverTall" component={Cover} durationInFrames={1} fps={FPS} width={1080} height={1440} defaultProps={{ layout: 'tall' as const }} />
  </>
);
