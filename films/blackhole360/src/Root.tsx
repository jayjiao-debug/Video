import React from 'react';
import { Composition } from 'remotion';
import { BotSheets } from './Bot';
import { Bot3DSheets } from './Bot3D';

export const Root: React.FC = () => (
  <>
    <Composition id="BotSheets" component={BotSheets} durationInFrames={4} fps={1} width={1920} height={1080} />
    <Composition id="Bot3D" component={Bot3DSheets} durationInFrames={4} fps={1} width={1920} height={1080} />
  </>
);
