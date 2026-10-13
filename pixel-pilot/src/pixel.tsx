// Pixel-grid primitives. The world is 480x270 art pixels; the camera shows it at an
// integer zoom (4 = whole room at 1920x1080, 6 and 8 = closer shots), so every art
// pixel is a whole block of screen pixels. Positions are always rounded to the grid.
import React from 'react';
import {Img, staticFile} from 'remotion';

export const W = 480;
export const H = 270;

export const px: React.CSSProperties = {imageRendering: 'pixelated'};

export const Sprite: React.FC<{
	name: string;
	x: number;
	y: number;
	opacity?: number;
	blend?: React.CSSProperties['mixBlendMode'];
	flip?: boolean;
}> = ({name, x, y, opacity = 1, blend, flip}) => (
	<Img
		src={staticFile(`sprites/${name}.png`)}
		style={{
			...px,
			position: 'absolute',
			left: Math.round(x),
			top: Math.round(y),
			opacity,
			mixBlendMode: blend,
			transform: flip ? 'scaleX(-1)' : undefined,
		}}
	/>
);

/** Integer-step bounce used for every pop-in: art pixels above the rest position. */
const DROP = [-7, -4, -2, 0, 1, 1, 0];
export const popY = (age: number) => (age < 0 ? null : age < DROP.length ? DROP[age] : 0);

/** Opacity quantised to 4 steps, so fades look like old hardware. */
export const stepFade = (v: number) => Math.round(Math.max(0, Math.min(1, v)) * 4) / 4;

export const FONT12 = '"Fusion Pixel 12px Proportional Simplified Chinese"';
export const FONT8 = '"Fusion Pixel 8px Proportional Simplified Chinese"';

export const C = {
	ink: '#16111e',
	panel: '#1d1729',
	panel2: '#2a2238',
	gold: '#e8b648',
	gold2: '#b07c2c',
	cream: '#f4e6c4',
	red: '#d64040',
	teal: '#349488',
	sky: '#78dcff',
	white: '#ffffff',
};

/** 1-art-pixel text outline in the ink colour. */
export const outline1 = `1px 0 ${C.ink}, -1px 0 ${C.ink}, 0 1px ${C.ink}, 0 -1px ${C.ink}, 1px 1px ${C.ink}, -1px 1px ${C.ink}, 1px -1px ${C.ink}, -1px -1px ${C.ink}`;
