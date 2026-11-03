/* ep59 real-photo moments (owner 19:05: "throw some real photos of his journey through the story, not really frequent, only if the
   photo will leave people in awe"; a photo of him at the start, him and his mother hugging at the end).
   The photos live in public/ep59/photos/ (git-ignored: never committed; copyright Karl Bushby / the press, credited on the end card),
   so any composition that shows them renders locally, not on the GitHub farm.

   <PhotoSlam src t dur …/> : a print with a white border slams in on its start time (a camera-flash bloom, a short settle, a slow
   push-in so it is never static), holds, then leaves by `out` ('fly' = tossed off frame, 'cut' = hard out, 'dissolve').
   t = seconds since the photo's start (from the caller's own clock); dur = how long it stays (seconds). */
import React from 'react';
import {Img, staticFile} from 'remotion';

const cl = (x: number) => Math.min(1, Math.max(0, x));
const eo = (x: number) => 1 - Math.pow(1 - cl(x), 3);
const sm = (x: number) => { const u = cl(x); return u * u * (3 - 2 * u); };

export type PhotoOut = 'fly' | 'cut' | 'dissolve';
export const PhotoSlam: React.FC<{
	src: string;                 // file name in public/ep59/photos, e.g. 's05a.jpg'
	t: number; dur: number;
	w?: number;                  // print width on screen (px, before the push-in)
	cx?: number; cy?: number;    // centre on screen
	rot?: number;                // settled rotation (deg)
	pos?: string;                // CSS object-position of the crop
	aspect?: number;             // picture aspect w/h (default 3/2)
	out?: PhotoOut;
	dim?: number;                // how much to darken what's behind (0..1)
	caption?: string;            // optional handwritten-style caption under the picture (e.g. 「2006 · 白令海峡」)
}> = ({src, t, dur, w = 1180, cx = 960, cy = 540, rot = -2.5, pos = '50% 50%', aspect = 3 / 2, out = 'fly', dim = .55, caption}) => {
	if (t < 0 || t > dur + .5) return null;
	const inU = eo(t / .16), settle = Math.sin(Math.min(1, t / .45) * Math.PI) * (1 - cl(t / .45)) * 1.6;
	const push = 1 + .035 * cl(t / Math.max(.5, dur));
	const u = cl((t - dur) / .32);                                 // the exit
	const ox = out === 'fly' ? 1500 * eo(u) : 0, oy = out === 'fly' ? -260 * eo(u) : 0, orot = out === 'fly' ? 18 * eo(u) : 0;
	const op = out === 'dissolve' ? 1 - sm(u) : out === 'cut' ? (u > 0 ? 0 : 1) : 1;
	const sc = (1.18 - .18 * inU) * push;
	const h = w / aspect, bd = Math.round(w * .028), bot = caption ? Math.round(w * .085) : bd;
	const flash = Math.max(0, 1 - t / .12) * .85;
	return <div style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
		<div style={{position: 'absolute', inset: 0, background: `rgba(8,6,4,${(dim * inU * (1 - (out === 'fly' ? u : out === 'dissolve' ? sm(u) : 0))).toFixed(3)})`}} />
		<div style={{position: 'absolute', left: cx - w / 2 - bd, top: cy - h / 2 - bd, width: w, padding: `${bd}px ${bd}px ${bot}px`, background: '#F7F3EA',
			boxShadow: '0 26px 60px rgba(0,0,0,.6)', opacity: op * cl(t / .05),
			transform: `translate(${ox}px, ${oy}px) rotate(${(rot + settle + orot).toFixed(2)}deg) scale(${sc.toFixed(4)})`, transformOrigin: '50% 50%'}}>
			<div style={{width: w, height: h, overflow: 'hidden', background: '#111'}}>
				<Img src={staticFile(`ep59/photos/${src}`)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos}} />
			</div>
			{caption && <div style={{position: 'absolute', left: 0, right: 0, bottom: Math.round(bot * .22), textAlign: 'center', fontFamily: "'LXGW WenKai', 'Noto Sans CJK SC'",
				fontWeight: 700, fontSize: Math.round(w * .036), color: '#4A4038', letterSpacing: 2}}>{caption}</div>}
		</div>
		{flash > 0 && <div style={{position: 'absolute', inset: 0, background: `rgba(255,248,235,${flash.toFixed(3)})`}} />}
	</div>;
};

/* the photos that earned a place (see the contact sheet …/scratchpad/ep59photos/clean_sheet.jpg); `pos` frames the subject */
export const PHOTOS = {
	nowFace: {src: 's13.jpg', pos: '70% 35%', note: '2026-11-02 Hull: him in the press crowd (tight on his face for the opening)'},
	hug: {src: 's13.jpg', pos: '50% 45%', note: '2026-11-02 Hull: him and his mother hugging (the ending)'},
	young1998: {src: 's00.jpg', pos: '50% 30%', note: 'young Karl with his first hi-vis cart'},
	americas: {src: 's06b.jpg', pos: '50% 40%', note: 'cowboy hat, the cart with a Union Jack, cactus desert'},
	beringIce: {src: 's07b.jpg', pos: '50% 50%', note: 'red suit hauling through pressure ice, red sled'},
	beringDusk: {src: 's10b.jpg', pos: '50% 60%', note: 'dusk on the frozen sea, a sled on a line'},
	frostFace: {src: 's05a.jpg', pos: '50% 40%', note: 'frost-white beard and hood (Siberian winter)'},
	swimDawn: {src: 's02a.jpg', pos: '45% 45%', note: 'wetsuit, V sign, dawn beach (the Channel swim)'},
} as const;
