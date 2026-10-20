import React from 'react';
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
</>);
