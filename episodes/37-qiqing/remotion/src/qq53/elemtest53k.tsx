import React from 'react';
import {AbsoluteFill, Composition, registerRoot} from 'remotion';
import {W, H, SANS} from '../qq50/kit50';
import {LacDefs, Lacquer, Vignette} from '../qq50/styleB';
import {ElementTile53, ElementKey, TileState} from './elements53k';
/* ep53 · ELEMENTS53 — a TEST composition (not in the film): the four element tiles at normal size (260 px, top row, with the states the
   film will use: Cu normal, Sn highlighted, Pb normal, Cr question) and at a small size (170 px, bottom row: all normal, Cr question). */
const ROW: [ElementKey, TileState][] = [['Cu', 'normal'], ['Sn', 'hi'], ['Pb', 'normal'], ['Cr', 'question']];
const Test: React.FC = () => <AbsoluteFill style={{background: '#0F0806'}}>
	<svg width={W} height={H} style={{position: 'absolute'}}><LacDefs /><Lacquer sheen={0.2} id="et" />
		{ROW.map(([k, st], i) => <ElementTile53 key={k} el={k} x={510 + i * 300} y={400} s={260} state={st} id={`a${k}`} />)}
		{ROW.map(([k], i) => <ElementTile53 key={k} el={k} x={660 + i * 200} y={800} s={170} state={k === 'Cr' ? 'question' : 'normal'} id={`b${k}`} />)}
		<text x={80} y={1040} fontFamily={SANS} fontSize={24} fill="#8A7A60">ELEMENTS53 test · top 260 px (Cu normal · Sn hi · Pb normal · Cr question) · bottom 170 px</text>
		<Vignette id="et" a={0.5} /></svg></AbsoluteFill>;
const Root: React.FC = () => <Composition id="ELEMENTS53" component={Test} width={W} height={H} fps={30} durationInFrames={30} />;
registerRoot(Root);
