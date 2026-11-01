import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Zun, lookAt, ZunLight, V3, ZUN} from './zun55h';
/* ep55 · 何尊 model turntable: the bare object at the reference angles, a neutral studio light, so the owner can judge the object.
   view 0 front (on a flange, 7° above, as the studio photo) · 1 at 45° (a flat face) · 2 side (on the side flange) ·
   3 top-down into the mouth · 4 silhouette (front, flat black, for the overlay check against the photo) */
export const TT_VIEWS = [
	{name: '正面 · 对扉棱 (front, on a flange)', az: 0, el: 7},
	{name: '45° · 对器面 (a flat face)', az: 45, el: 9},
	{name: '侧面 · 对侧扉棱 (side flange)', az: 90, el: 7},
	{name: '俯视 · 口内 (top-down into the mouth)', az: 45, el: 74},
	{name: 'silhouette', az: 0, el: 7},
];
export const studioLight = (az: number): ZunLight => { const a = (az + 38) * Math.PI / 180;
	return {dir: [Math.cos(a) * 0.62, Math.sin(a) * 0.62, 0.62] as V3, col: '#FFE2B8', k: 1.25, amb: 0.42, ambCol: '#7F8A96', spec: 0.9, shin: 22,
		rim: {dir: [-Math.cos(az * Math.PI / 180) * 0.7, -Math.sin(az * Math.PI / 180) * 0.7, 0.45] as V3, col: '#B9D2E6', k: 0.55}, inside: 0.35}; };
export const TurnView: React.FC<{v: number}> = ({v}) => { const V = TT_VIEWS[v], a = V.az * Math.PI / 180, e = V.el * Math.PI / 180;
	const top = v === 3, D = top ? 150 : 270, tgt: V3 = top ? [0, 0, 26] : [0, 0, 19.4];
	const cam = lookAt([tgt[0] + D * Math.cos(e) * Math.cos(a), tgt[1] + D * Math.cos(e) * Math.sin(a), tgt[2] + D * Math.sin(e)], tgt, top ? 2900 : 820 * 270 / ZUN.H / 1.18, 960, top ? 540 : 560);
	const sil = v === 4;
	return <AbsoluteFill style={{background: sil ? '#FFFFFF' : 'radial-gradient(ellipse at 50% 45%, #3A3936 0%, #1B1A19 70%, #121212 100%)'}}>
		<svg width={1920} height={1080} style={{position: 'absolute', filter: sil ? 'brightness(0)' : undefined}}>
			<Zun cam={cam} light={studioLight(V.az)} id={`tt${v}`} patina={0.18} reveal={1} glow={0} shadow={!sil} />
		</svg>
		{!sil && <div style={{position: 'absolute', left: 40, top: 30, color: '#E8E2D6', fontFamily: "'Noto Sans CJK SC',sans-serif", fontSize: 40, fontWeight: 700}}>{V.name}</div>}
	</AbsoluteFill>; };
