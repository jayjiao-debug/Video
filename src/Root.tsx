import React from 'react';
import { Composition } from 'remotion';
import { Test3D } from './t3/Test3D';
import { Open3D } from './t3/Open3D';
import { Reveal3D } from './t3/Reveal3D';
import { V1Film } from './v1/V1';
import '@fontsource/cormorant-garamond/400-italic.css';
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/600.css';
import { Main } from './Main';
import { Cover } from './Cover';
import { Main2, DURATION2 } from './ep2/Main2';
import { Cover2 } from './ep2/Cover2';
import { Cover3 } from './ep2/Cover3';
import { Main3, DURATION3 } from './ep3/Main3';
import { Main4, DURATION4 } from './ep4/Main4';
import { CastSheet4, PropSheet4 } from './ep4/Sheet4';
import { Cover4 } from './ep4/Cover4';
import { CastSheet3, PropSheet3 } from './ep3/Sheet3';
import { CharSheet } from './v/board';
import { KeyFrame, Compare, CompareL } from './v/scenesV';
import { PeepTest } from './v/peepTest';
import { Sheet2 } from './v/sheet2';
import '@fontsource/ma-shan-zheng/400.css';
import { DURATION, FPS, W, H } from './lib';

export const Root: React.FC = () => (
  <>
    <Composition id="Main" component={Main} durationInFrames={DURATION} fps={FPS} width={W} height={H} defaultProps={{ music: true }} />
    <Composition id="Silent" component={Main} durationInFrames={DURATION} fps={FPS} width={W} height={H} defaultProps={{ music: false }} />
    <Composition id="Ep2" component={Main2} durationInFrames={DURATION2} fps={FPS} width={W} height={H} defaultProps={{ music: true }} />
    <Composition id="VK1" component={KeyFrame} durationInFrames={1} fps={FPS} width={1080} height={1920} defaultProps={{ k: 1 }} />
    <Composition id="VK2" component={KeyFrame} durationInFrames={1} fps={FPS} width={1080} height={1920} defaultProps={{ k: 2 }} />
    <Composition id="VK3" component={KeyFrame} durationInFrames={1} fps={FPS} width={1080} height={1920} defaultProps={{ k: 3 }} />
    <Composition id="VK4" component={KeyFrame} durationInFrames={1} fps={FPS} width={1080} height={1920} defaultProps={{ k: 4 }} />
    <Composition id="VK5" component={KeyFrame} durationInFrames={1} fps={FPS} width={1080} height={1920} defaultProps={{ k: 5 }} />
    <Composition id="VK6" component={KeyFrame} durationInFrames={1} fps={FPS} width={1080} height={1920} defaultProps={{ k: 6 }} />
    <Composition id="VK7" component={KeyFrame} durationInFrames={1} fps={FPS} width={1080} height={1920} defaultProps={{ k: 7 }} />
    <Composition id="VK8" component={KeyFrame} durationInFrames={1} fps={FPS} width={1080} height={1920} defaultProps={{ k: 8 }} />
    <Composition id="VK9" component={KeyFrame} durationInFrames={1} fps={FPS} width={1080} height={1920} defaultProps={{ k: 9 }} />
    <Composition id="Sheet2" component={Sheet2} durationInFrames={1} fps={FPS} width={2400} height={1250} />
    <Composition id="PeepTest" component={PeepTest} durationInFrames={1} fps={FPS} width={2000} height={1000} />
    <Composition id="VCompareL" component={CompareL} durationInFrames={1} fps={FPS} width={2380} height={2150} />
    <Composition id="VCompare" component={Compare} durationInFrames={1} fps={FPS} width={2380} height={2150} />
    <Composition id="BoardChars" component={CharSheet} durationInFrames={1} fps={FPS} width={2400} height={1400} />
    <Composition id="Ep3Cast" component={CastSheet3} durationInFrames={1} fps={FPS} width={1920} height={1080} />
    <Composition id="Ep3Props" component={PropSheet3} durationInFrames={1} fps={FPS} width={1920} height={1080} />
    <Composition id="Ep4Cover43" component={Cover4} durationInFrames={1} fps={FPS} width={1440} height={1080} defaultProps={{ w: 1440, h: 1080 }} />
    <Composition id="Ep4Cover34" component={Cover4} durationInFrames={1} fps={FPS} width={1080} height={1440} defaultProps={{ w: 1080, h: 1440 }} />
    <Composition id="Ep4Cast" component={CastSheet4} durationInFrames={1} fps={FPS} width={1920} height={1080} />
    <Composition id="Ep4Props" component={PropSheet4} durationInFrames={1} fps={FPS} width={1920} height={1080} />
    <Composition id="Ep4" component={Main4} durationInFrames={DURATION4} fps={FPS} width={W} height={H} defaultProps={{ music: true }} />
    <Composition id="Ep3" component={Main3} durationInFrames={DURATION3} fps={FPS} width={W} height={H} defaultProps={{ music: true }} />
    <Composition id="Ep2C3-169" component={Cover3} durationInFrames={1} fps={FPS} width={1920} height={1080} defaultProps={{ w: 1920, h: 1080 }} />
    <Composition id="Ep2C3-43" component={Cover3} durationInFrames={1} fps={FPS} width={1440} height={1080} defaultProps={{ w: 1440, h: 1080 }} />
    <Composition id="Ep2C3-34" component={Cover3} durationInFrames={1} fps={FPS} width={1080} height={1440} defaultProps={{ w: 1080, h: 1440 }} />
    <Composition id="Ep2Cover169" component={Cover2} durationInFrames={1} fps={FPS} width={1920} height={1080} defaultProps={{ w: 1920, h: 1080 }} />
    <Composition id="Ep2Cover43" component={Cover2} durationInFrames={1} fps={FPS} width={1440} height={1080} defaultProps={{ w: 1440, h: 1080 }} />
    <Composition id="Ep2Cover34" component={Cover2} durationInFrames={1} fps={FPS} width={1080} height={1440} defaultProps={{ w: 1080, h: 1440 }} />
    <Composition id="Cover" component={Cover} durationInFrames={1} fps={FPS} width={1920} height={1080} defaultProps={{ tall: false }} />
    <Composition id="CoverMid" component={Cover} durationInFrames={1} fps={FPS} width={1440} height={1080} defaultProps={{ mid: true }} />
    <Composition id="CoverTall" component={Cover} durationInFrames={1} fps={FPS} width={1080} height={1440} defaultProps={{ tall: true }} />
    <Composition id="Test3D" component={Test3D} durationInFrames={90} fps={30} width={1920} height={1080} />
    <Composition id="Open3D" component={Open3D} durationInFrames={630} fps={30} width={1920} height={1080} />
    <Composition id="Reveal3D" component={Reveal3D} durationInFrames={912} fps={30} width={1920} height={1080} />
    <Composition id="V1Film" component={V1Film} durationInFrames={3915} fps={30} width={1920} height={1080} />
  </>
);
