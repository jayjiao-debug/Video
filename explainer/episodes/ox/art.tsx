import React from 'react';
import {random} from 'remotion';
import {Ticket} from '../../src/art/Ox';

/**
 * 《八百人猜牛》 episode-only art: the swarm of tickets that circles the ox in the
 * cold open and bursts on the music's first hit.
 */

export type SwarmCfg = {
	f: number;
	/** orbit centre (hero-plane coordinates) */
	cx: number;
	cy: number;
	n?: number;
	/** frame the swarm blows outward (the hit) */
	burst?: number;
	/** frame it starts gathering */
	start?: number;
	/** draw only the half of the orbit in front of (1) or behind (−1) the ox */
	side: 1 | -1;
	/** 0..1 tightening before the hit */
	tighten?: number;
	/** 0..1 the tickets rush the lens (the wipe into the title card) */
	rush?: number;
};

export const TicketSwarm: React.FC<SwarmCfg> = ({f, cx, cy, n = 56, burst, start = -60, side, tighten = 0, rush = 0}) => (
	<g>
		{Array.from({length: n}, (_, i) => {
			const r = (k: string) => random(`sw${k}${i}`);
			const rx = (250 + r('rx') * 430) * (1 - 0.18 * tighten);
			const ry = rx * (0.22 + r('ry') * 0.14);
			const dir = r('d') > 0.25 ? 1 : -1;
			const w = (0.014 + r('w') * 0.014) * dir;
			const th = r('p') * Math.PI * 2 + f * w * (1 + 1.4 * tighten);
			const depth = Math.sin(th);
			if (Math.sign(depth || 1) !== side) return null;
			const y0 = -110 - r('y') * 250 + 18 * Math.sin(f / (14 + r('fy') * 10) + i);
			let x = cx + Math.cos(th) * rx;
			let y = cy + y0 + depth * ry;
			let o = Math.min(1, Math.max(0, (f - start - r('in') * 30) / 14));
			if (burst !== undefined && f >= burst) {
				const t = f - burst;
				const k = 1 + 0.09 * t + 0.004 * t * t;
				x = cx + (x - cx) * k + (r('bx') - 0.5) * 30 * t;
				y = cy + (y - cy) * k - 4 * t;
				o *= Math.max(0, 1 - t / 26);
			}
			if (rush > 0) {
				// fly at the lens: out from the centre of frame, growing fast (front half more)
				const k = rush * rush * (side > 0 ? 1 : 0.4);
				x = 960 + (x - 960) * (1 + 2.2 * k);
				y = 540 + (y - 540) * (1 + 2.2 * k) - 120 * k;
			}
			const s = (0.22 + 0.08 * depth) * (0.8 + 0.4 * r('s')) * (1 + (side > 0 ? 9 : 2) * rush * rush * (0.5 + r('rs')));
			const spin = r('rot') * 360 + f * (2 + r('sp') * 5) * dir;
			const flipX = Math.cos(f * (0.08 + r('fl') * 0.1) + i);
			const lit = 0.55 + 0.45 * Math.max(0, Math.cos(th - 0.6));
			return (
				<g key={i} transform={`translate(${x},${y}) rotate(${spin}) scale(${s * flipX},${s})`} opacity={o}>
					<Ticket lod="mid" />
					<rect x={-100} y={-62} width={200} height={124} rx={6} fill="#1a1020" opacity={0.55 * (1 - lit)} />
				</g>
			);
		})}
	</g>
);
