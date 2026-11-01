import React from 'react';
import {Composition, registerRoot, useCurrentFrame} from 'remotion';
import {W, H, Overlay, Frame, thDark} from './kit55';
import {Theme} from '../qq50/kit50';
import * as LA from './look55a';
import * as LB from './look55b';
import * as LC from './look55c';
/* ep55 家书 · look tests entry (LOOKS55): frame i = look ⌊i/3⌋, beat i % 3 (0 hook · 1 home · 2 tomb), with the overlay */
type L = {name: string; m: Record<string, React.FC>; th: Theme; disc?: string; bg?: string};
const LOOKS: L[] = [
	{name: 'A 篝火 · 主角刻画', m: LA as unknown as Record<string, React.FC>, th: thDark},
	{name: 'B 墨牍 · 水墨', m: LB as unknown as Record<string, React.FC>, th: LB.thInk, disc: '#ECE3CF'},
	{name: 'C 陶俑微缩 · 灯下泥塑', m: LC as unknown as Record<string, React.FC>, th: thDark},
];
const BEATN = ['帧0 · 钩子：营火写信', '帧1 · 安陆：信到家', '帧2 · 睡虎地4号墓'];
const All: React.FC = () => { const f = useCurrentFrame(), li = Math.min(LOOKS.length - 1, Math.floor(f / 3)), k = f % 3, L = LOOKS[li], C = L.m[`Look${k + 1}`];
	return <Frame bg={L.bg}><C /><Overlay beat={k} th={L.th} sealDisc={L.disc} label={`look ${L.name} · ${BEATN[k]}`} /></Frame>; };
const Root: React.FC = () => <Composition id="LOOKS55" component={All} width={W} height={H} fps={30} durationInFrames={LOOKS.length * 3} />;
registerRoot(Root);
