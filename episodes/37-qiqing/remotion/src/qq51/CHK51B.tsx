import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {W, H} from '../qq50/kit50';
import {Overlay} from './master51';
import {PartB} from './partB';
/* throwaway check for Builder B: PartB + the master overlay; frame = film t × 30 */
const C: React.FC = () => { const t = useCurrentFrame() / 30; return <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}><PartB t={t} /><Overlay t={t} /></AbsoluteFill>; };
registerRoot(() => <Composition id="CHK51B" component={C} width={W} height={H} fps={30} durationInFrames={3578} />);
