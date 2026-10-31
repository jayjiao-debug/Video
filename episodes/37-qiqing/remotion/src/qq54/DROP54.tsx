import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {W, H} from '../qq50/kit50';
import {Overlay} from './demo54core';
import {Label} from './look54frame';
import {Drop} from './drop54s';
import {Handover} from './demo54s';
/* ep54 · the drop key frames (DROP54, stills, frame i = FR[i]) and the drop clip (DROPV54: film 96.27–108.22 = the handover card
   into the drop, as video). Overlay = the demo's (subtitle, stamp, counter, seal). */
const FR: {t: number; d: string}[] = [
	{t: 100.22, d: 'D0 · 100.22 · 交接帧（最后一帧代码世界，背影举火）'},
	{t: 100.40, d: 'D1 · 100.26 drop · 转身：刀尖指向观众，第一次出现火色'},
	{t: 102.40, d: 'D2 · 102.25 · 五千人举火从他两侧冲向镜头'},
	{t: 104.60, d: 'D3 · 104.24 · 乌巢粮囷起火，火墙'},
	{t: 106.80, d: 'D4 · 106.2 · 袁军崩溃：旗倒，人逃'},
];
const sceneAt = (t: number) => (t < 100.256 ? Handover : Drop);
const Still: React.FC = () => { const f = useCurrentFrame(), k = FR[Math.min(FR.length - 1, f)], S = sceneAt(k.t);
	return <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}><S t={k.t} /><Overlay t={k.t} /><Label s={`look B · ${k.d}`} /></AbsoluteFill>; };
const T0 = 96.27;
const Vid: React.FC = () => { const t = T0 + useCurrentFrame() / 30, S = sceneAt(t);
	return <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}><S t={t} /><Overlay t={t} /></AbsoluteFill>; };
const Root: React.FC = () => <>
	<Composition id="DROP54" component={Still} width={W} height={H} fps={30} durationInFrames={FR.length} />
	<Composition id="DROPV54" component={Vid} width={W} height={H} fps={30} durationInFrames={Math.round((108.22 - T0) * 30)} />
</>;
registerRoot(Root);
