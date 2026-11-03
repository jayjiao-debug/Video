import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {satProj, satMaxTilt, SatView} from './globe59';
import {southView, northView, pullView} from './part1b59';
import {globeView, goalView, signSun} from './demo59';
import {geoDistance} from 'd3-geo';
/* scratch lab (delete before hand-off): screen speed of the globe moves, frame to frame (max over sample points near the nadir) */
const speed = (V: (t: number) => SatView, t: number) => { const a = V(t), b = V(t + 1 / 30); let mx = 0;
	const pa = satProj(a), pb = satProj(b), span = Math.min(40, Math.max(0.02, a.alt * 30));
	for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) { const ll: [number, number] = [a.lon + i * span / 3 / Math.max(0.2, Math.cos(a.lat * Math.PI / 180)), Math.max(-85, Math.min(85, a.lat + j * span / 3))];
		const hz = Math.acos(1 / (1 + Math.min(a.alt, b.alt))); if (geoDistance(ll, [a.lon, a.lat]) > hz * 0.9 || geoDistance(ll, [b.lon, b.lat]) > hz * 0.9) continue;
		const p = pa(ll), q = pb(ll); if (!p || !q) continue; if (p[0] < 0 || p[0] > 1920 || p[1] < 0 || p[1] > 1080) continue; mx = Math.max(mx, Math.hypot(q[0] - p[0], q[1] - p[1])); }
	return mx; };
const D = (n: number) => 0.144 + 1.70444 * n;
const RANGES: [string, (t: number) => SatView, number, number][] = [
	['globe', (t) => globeView(t, signSun(15.72)), 10.3, 16.1], ['goal', (t) => goalView(t, [0, 0]), 20.5, D(14) + 0.1],
	['south', southView, D(20) + 0.95, D(22)], ['north', northView, D(26), D(28)], ['pull', pullView, D(32) + 0.5, D(34)],
];
const Lab: React.FC = () => <div style={{width: 1920, height: 1080, background: '#111', color: '#eee', fontFamily: 'monospace', fontSize: 15, display: 'flex', gap: 30, padding: 20}}>
	{RANGES.map(([n, V, a, b]) => { const rows: string[] = []; for (let t = a; t < b; t += 1 / 15) { const s = speed(V, t), v = V(t); rows.push(`${t.toFixed(2)} ${s.toFixed(0).padStart(4)} alt ${v.alt.toFixed(3)} ${s > 30 ? '<<<' : ''}`); }
		return <div key={n}><b>{n}</b>{rows.map((r, i) => <div key={i} style={{color: r.endsWith('<<<') ? '#ff7060' : '#ddd'}}>{r}</div>)}</div>; })}
</div>;
void satMaxTilt;
registerRoot(() => <Composition id="LAB59" component={Lab} durationInFrames={1} fps={30} width={1920} height={1080} />);
