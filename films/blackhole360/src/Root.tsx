import React from 'react';
import { Composition } from 'remotion';
import { BotSheets } from './Bot';

export const Root: React.FC = () => (
  <>
    <Composition id="BotSheets" component={BotSheets} durationInFrames={4} fps={1} width={1920} height={1080} />
  </>
);
