import React from 'react';
import { Composition } from 'remotion';
import { BotSheets } from './Bot';
import { Bot3DSheets } from './Bot3D';
import { Test2D } from './Test2D';
import { Board, N_PANELS } from './Board';

export const Root: React.FC = () => (
  <>
    <Composition id="BotSheets" component={BotSheets} durationInFrames={4} fps={1} width={1920} height={1080} />
    <Composition id="Bot3D" component={Bot3DSheets} durationInFrames={4} fps={1} width={1920} height={1080} />
    <Composition id="Test2D" component={Test2D} durationInFrames={300} fps={30} width={1920} height={1080} />
    <Composition id="Board" component={Board} durationInFrames={N_PANELS} fps={1} width={1920} height={1080} />
  </>
);
