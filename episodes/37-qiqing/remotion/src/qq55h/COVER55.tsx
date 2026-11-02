import React from 'react';
import {Composition, registerRoot, useCurrentFrame} from 'remotion';
import {Act1} from './act551';
import {Act2} from './act552';
import {NoOverlay} from './ov55v2';
/* ep55 · 何尊 — Douyin cover pictures, no overlay.
   COVER55: card 1 (1965 scrap yard, the bronze 尊 on the scale with its 30元 tag), t = 5.2.
   COVER55F: the foundry (owner 11-02 「do the furnace」), frame f = film time f / 10 between 50 and 61 s, so one bundle renders
   any moment: frame 0 = 50.0 s, frame 46 = 54.6 s, frame 96 = 59.6 s. */
const T = 5.2;
const C: React.FC = () => <NoOverlay.Provider value={true}><Act1 t={T} /></NoOverlay.Provider>;
const CF: React.FC = () => <NoOverlay.Provider value={true}><Act2 t={50 + useCurrentFrame() / 10} /></NoOverlay.Provider>;
const Root: React.FC = () => <>
	<Composition id="COVER55" component={C} width={1920} height={1080} fps={30} durationInFrames={1} />
	<Composition id="COVER55F" component={CF} width={1920} height={1080} fps={30} durationInFrames={111} />
</>;
registerRoot(Root);
