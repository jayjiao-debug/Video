/* ep59 v3: the real photos as small prints beside the action (owner 21:27: "more photos throughout his trip as the small cutout …
   at least make the photos look nice"). Not full screen, no flash, the scene keeps playing behind.

   <Print3 src t dur …/> : a photographic print with a cream die-cut border, a strip of tape, a handwritten caption, a two-part
   shadow (contact + ambient) that grows as it lifts, a slight perspective tilt that settles, and a warm grade that bridges the
   photo toward the film's palette. It tosses in from `from` with a small overshoot, drifts while it holds, and leaves the way
   it came (or drops). t = seconds since its start; dur = how long it holds before leaving.

   The photos live in public/ep59/photos/ (git-ignored: never committed; © Karl Bushby / the press, credited on the end card),
   so a composition that shows them renders locally, not on the GitHub farm. */
import React from 'react';
import {Img, staticFile} from 'remotion';

const cl = (x: number) => Math.min(1, Math.max(0, x));
const eo = (x: number) => 1 - Math.pow(1 - cl(x), 3);
const sm = (x: number) => { const u = cl(x); return u * u * (3 - 2 * u); };
/** a damped overshoot 0→1 (the print lands and settles) */
const settle = (x: number) => { const u = Math.max(0, x); return u >= 1.6 ? 1 : 1 - Math.exp(-5.2 * u) * Math.cos(7.5 * u); };

export type From = 'left' | 'right' | 'top' | 'bottom';
export const Print3: React.FC<{
	src: string; t: number; dur: number;
	w?: number;                 // picture width in px (the border adds ~6 %)
	cx?: number; cy?: number;   // where it settles (centre)
	rot?: number;               // settled rotation (deg)
	pos?: string;               // object-position of the crop
	aspect?: number;            // picture w/h (default 4/3)
	from?: From;                // where it comes from (and leaves to)
	out?: 'back' | 'drop' | 'fade';
	caption?: string;           // handwritten, under the picture: 「2006.3 · 白令海峡」
	tape?: boolean;
	grade?: string;             // CSS filter on the photo
	z?: number;                 // stacking order among prints
}> = ({src, t, dur, w = 520, cx = 1290, cy = 520, rot = -3, pos = '50% 50%', aspect = 4 / 3, from = 'right', out = 'back', caption, tape = true,
	grade = 'saturate(0.86) contrast(1.05) brightness(0.96) sepia(0.10)', z = 0}) => {
	if (t < 0 || t > dur + 0.7) return null;
	const IN = 0.42, OUT = 0.38;
	const a = settle(t / IN * 1.15);                            // 0 → 1 with a small overshoot
	const u = cl((t - dur) / OUT), e = eo(u) * eo(u);           // the exit
	const dist = 1300;
	const dir = {left: [-1, 0], right: [1, 0], top: [0, -1], bottom: [0, 1]}[from];
	const away = out === 'drop' ? [0, 1] : dir;
	const dx = dir[0] * dist * (1 - a) + (out === 'fade' ? 0 : away[0] * dist * e);
	const dy = dir[1] * dist * (1 - a) + (out === 'fade' ? 0 : away[1] * dist * e) + (out === 'drop' ? 0 : -18 * Math.sin(Math.PI * cl(t / IN)));
	const r = rot + (1 - a) * (dir[0] !== 0 ? 14 * dir[0] : 9) + (out === 'fade' ? 0 : e * 12 * (away[0] || 0.6));
	const lift = (1 - sm(t / (IN * 1.2))) + e;                  // 1 while in the air, 0 when resting
	const tiltY = (1 - a) * -16 * (dir[0] || 0.5) + 2.2 * Math.sin(t * 0.9);       // a slow breathing tilt while it holds
	const tiltX = 1.6 * Math.sin(t * 0.7 + 1);
	const drift = 6 * Math.sin(t * 0.8), push = 1 + 0.025 * cl(t / Math.max(1, dur));
	const op = out === 'fade' ? 1 - sm(u) : 1;
	const h = w / aspect, bd = Math.round(w * 0.045), bot = caption ? Math.round(w * 0.16) : bd;
	const W = w + 2 * bd, H = h + bd + bot;
	const sh1 = `0 ${(4 + 24 * lift).toFixed(1)}px ${(8 + 40 * lift).toFixed(1)}px rgba(0,0,0,${(0.5 - 0.2 * lift).toFixed(2)})`;
	const sh2 = `0 ${(18 + 50 * lift).toFixed(1)}px ${(50 + 70 * lift).toFixed(1)}px rgba(0,0,0,${(0.45).toFixed(2)})`;
	return <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, pointerEvents: 'none', perspective: 1600, zIndex: z, opacity: op}}>
		<div style={{position: 'absolute', left: cx - W / 2, top: cy - H / 2, width: W, height: H, boxSizing: 'border-box',
			transform: `translate(${(dx + drift).toFixed(1)}px, ${dy.toFixed(1)}px) rotate(${r.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) rotateX(${tiltX.toFixed(2)}deg) scale(${(push * (1 + 0.06 * lift)).toFixed(4)})`,
			transformOrigin: '50% 40%'}}>
			{/* the card: cream paper with a faint warm gradient */}
			<div style={{position: 'absolute', inset: 0, borderRadius: 3, background: 'linear-gradient(160deg, #FBF7EE 0%, #F2EADB 60%, #E9DFCC 100%)', boxShadow: `${sh1}, ${sh2}`}} />
			{/* the picture */}
			<div style={{position: 'absolute', left: bd, top: bd, width: w, height: h, overflow: 'hidden', background: '#16130f'}}>
				<Img src={staticFile(`ep59/photos/${src}`)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, filter: grade}} />
				{/* a soft inner vignette and a light sheen that moves with the tilt (it reads as a glossy print) */}
				<div style={{position: 'absolute', inset: 0, boxShadow: 'inset 0 0 60px rgba(0,0,0,0.28)'}} />
				<div style={{position: 'absolute', inset: 0, background: `linear-gradient(${(115 + tiltY * 3).toFixed(1)}deg, rgba(255,255,255,0) 35%, rgba(255,250,235,0.10) 50%, rgba(255,255,255,0) 65%)`}} />
			</div>
			{caption && <div style={{position: 'absolute', left: 0, right: 0, top: bd + h + Math.round(bot * 0.2), textAlign: 'center',
				fontFamily: "'LXGW WenKai', 'Noto Sans CJK SC'", fontWeight: 700, fontSize: Math.round(w * 0.056), color: '#4B4036', letterSpacing: 1.5}}>{caption}</div>}
			{tape && <div style={{position: 'absolute', left: W / 2 - w * 0.13, top: -w * 0.03, width: w * 0.26, height: w * 0.075, transform: `rotate(${(-rot * 0.6 - 2).toFixed(1)}deg)`,
				background: 'linear-gradient(180deg, rgba(246,236,210,0.78), rgba(232,220,190,0.70))', boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
				clipPath: 'polygon(2% 0, 98% 4%, 100% 30%, 97% 55%, 100% 80%, 98% 100%, 1% 96%, 3% 70%, 0 45%, 2% 20%)'}} />}
		</div>
	</div>;
};

/** the photos (public/ep59/photos/), with crops that frame the subject; iw/ih = pixel size */
export const PH3 = {
	nowFace: {src: 's13.jpg', pos: '68% 30%', aspect: 4 / 5, note: '2026-11-02 Hull: him in the press crowd, tight on his face'},
	hug: {src: 's13.jpg', pos: '50% 50%', aspect: 1130 / 837, note: '2026-11-02 Hull: his mother with her arm round him'},
	young1998: {src: 's00.jpg', pos: '50% 35%', aspect: 4 / 5, note: 'young Karl with his first hi-vis cart'},
	jungle: {src: 's09b.jpg', pos: '50% 45%', aspect: 4 / 3, note: 'sitting in the jungle'},
	americas: {src: 's06b.jpg', pos: '55% 40%', aspect: 4 / 3, note: 'cowboy hat, the cart with a Union Jack, cactus desert'},
	beringIce: {src: 's07b.jpg', pos: '50% 50%', aspect: 4 / 3, note: 'red suit through pressure ice, red sled'},
	beringDusk: {src: 's10b.jpg', pos: '50% 60%', aspect: 4 / 3, note: 'dusk on the frozen sea, a sled on a line'},
	frostFace: {src: 's05a.jpg', pos: '50% 40%', aspect: 4 / 3, note: 'frost-white beard and hood'},
	frostCart: {src: 's05b.jpg', pos: '50% 40%', aspect: 4 / 3, note: 'frosted beard with goggles and the cart'},
	snowRoad: {src: 's04a.jpg', pos: '50% 50%', aspect: 4 / 3, note: 'snowy road, the orange cart'},
	swimDawn: {src: 's02a.jpg', pos: '45% 45%', aspect: 4 / 3, note: 'wetsuit, V sign, dawn beach (the Channel)'},
} as const;
