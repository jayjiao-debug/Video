import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Act1} from './act551';
import {NoOverlay} from './ov55v2';
/* ep55 · 何尊 — the Douyin cover picture: card 1 (1965 scrap yard, the bronze 尊 on the scale with its 30元 tag), no overlay. */
const T = 5.2;
const C: React.FC = () => <NoOverlay.Provider value={true}><Act1 t={T} /></NoOverlay.Provider>;
const Root: React.FC = () => <Composition id="COVER55" component={C} width={1920} height={1080} fps={30} durationInFrames={1} />;
registerRoot(Root);
