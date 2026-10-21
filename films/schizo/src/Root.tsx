import React from 'react';
import { Film, FILM_LEN } from './Film';
import { Cine, CINE_FRAMES } from './Cine';
import { KnowTest, KT_FRAMES } from './KnowTest';
import { Puppet2DSheet } from './Puppet2DSheet';
import { Puppet2DTest, P2D_LEN } from './Puppet2DTest';
import { Composition } from 'remotion';
import { Looks, LOOKS } from './Looks';
import { PuppetSheet } from './PuppetSheet';
import { PuppetTest, TEST_FRAMES } from './PuppetTest';
export const Root: React.FC = () => (<>
  <Composition id="Looks" component={Looks} durationInFrames={LOOKS.length} fps={30} width={1920} height={1080} />
  <Composition id="PuppetSheet" component={PuppetSheet} durationInFrames={1} fps={30} width={1920} height={1080} />
  <Composition id="PuppetTest" component={PuppetTest} durationInFrames={TEST_FRAMES} fps={30} width={1920} height={1080} />
  {/* QA views of the same take: front close and side close */}
  <Composition id="PuppetQAFront" component={PuppetTest} defaultProps={{ dbg: [0.25, 1.05, 0.6, -0.1, 0.85, -1.2, 32] }} durationInFrames={TEST_FRAMES} fps={30} width={1920} height={1080} />
  <Composition id="PuppetQASide" component={PuppetTest} defaultProps={{ dbg: [1.6, 1.05, -0.9, -0.15, 0.85, -1.25, 32] }} durationInFrames={TEST_FRAMES} fps={30} width={1920} height={1080} />
  <Composition id="Puppet2DTest" component={Puppet2DTest} durationInFrames={P2D_LEN} fps={30} width={1920} height={1080} />
  <Composition id="Puppet2DSheet" component={Puppet2DSheet} durationInFrames={1} fps={30} width={1920} height={1080} />
  <Composition id="KnowTest" component={KnowTest} durationInFrames={KT_FRAMES} fps={30} width={1920} height={1080} />
  <Composition id="Cine" component={Cine} durationInFrames={CINE_FRAMES} fps={30} width={1920} height={1080} />
  <Composition id="Film" component={Film} durationInFrames={FILM_LEN} fps={30} width={1920} height={1080} />
</>);
