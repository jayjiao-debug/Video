import React from 'react';
import {staticFile} from 'remotion';
import {W, H, rnd, cl, sm, lerp, Rimmed, fkPose, jointAt, Glow, Look4} from './v3base';
import {ease, easeIn, easeOut, seg, drift} from './fx';
import {MORSE_END, voiceWave, tracePath, CamC, reach, toBody, TRACE_Y} from './s41morse';
/* 斯科特 1860 (73.015–90.845, 17.83 s). Opens on 莫尔斯's last frame: the trembling wire is now the trace on soot.
   S1: pull back — Scott sings into the barrel horn of his phonautograph, his assistant turns the drum's crank, the
   bristle scratches a wavy line; we hear only the scratch. S2: he holds the sheet to the lamp; the lamp gutters; the
   sheet is filed away; dust, days, years. S3: 2008 — a scan light crosses the sheet, the trace lights up and the REAL
   1860 recording plays (the waveform follows its measured envelope). S4: double exposure of that waveform over Scott at
   the horn; push through the window to the waning-gibbous moon, which ends at Bell's window moon (≈(510,300), r 34). */

/** scene-relative seconds; VO from vo_timeline_v3.md (film − 73.015) */
export const SCOTT_T = {
	c1: 0.485, c1End: 3.485, c2: 3.985, c2End: 6.985, cq: 7.785, cqEnd: 12.565, c3: 13.085, c3End: 15.355, end: 17.83,
	soot: 0.62, pull: 0.65, pullEnd: 3.0,                    // S1: the trace on soot → pull back to the room
	hold: 3.962, gutter: 5.15, file: 5.66, shut: 6.0, open2008: 7.2,   // S2: hold to the lamp, lamp gutters, filed, years
	scan: 7.3, scanEnd: 7.9,                                  // S3: scan bar, then the real recording plays (cq)
	dex: 12.45, through: 15.05, moon: 17.35,                  // S4: double exposure; through the window to the moon
};
const T = SCOTT_T;
/** RMS envelope of vo07/CQ_cut.mp3 (the real 1860 recording, First Sounds, CC BY), 30 values per second, 4.78 s */
const ENV = [0.12, 0.11, 0.13, 0.16, 0.17, 0.18, 0.23, 0.25, 0.42, 0.52, 0.51, 0.49, 0.57, 0.56, 0.54, 0.60, 0.65, 0.69, 0.68, 0.69, 0.70, 0.69, 0.71, 0.67, 0.56, 0.51, 0.47, 0.43, 0.43, 0.43, 0.43, 0.44, 0.41, 0.43, 0.44, 0.47, 0.58, 0.56, 0.55, 0.61, 0.55, 0.42, 0.44, 0.51, 0.56, 0.51, 0.46, 0.44, 0.25, 0.09, 0.04, 0.03, 0.05, 0.21, 0.66, 0.66, 0.65, 0.68, 0.80, 0.82, 0.80, 0.75, 0.59, 0.69, 0.67, 0.63, 0.64, 0.65, 0.69, 0.78, 0.79, 0.88, 1.00, 0.96, 0.93, 0.85, 0.71, 0.67, 0.47, 0.37, 0.34, 0.35, 0.37, 0.36, 0.28, 0.32, 0.37, 0.45, 0.42, 0.46, 0.50, 0.52, 0.57, 0.61, 0.58, 0.65, 0.70, 0.62, 0.51, 0.34, 0.16, 0.06, 0.07, 0.04, 0.04, 0.03, 0.03, 0.03, 0.04, 0.03, 0.03, 0.29, 0.69, 0.73, 0.81, 0.89, 0.65, 0.33, 0.53, 0.46, 0.33, 0.23, 0.20, 0.15, 0.10, 0.05, 0.01];
const env = (s: number) => { const x = s * 30; if (x < 0 || x >= ENV.length - 1) return 0; const i = Math.floor(x); return lerp(ENV[i], ENV[i + 1], x - i); };
const CQ_DUR = 4.78;
type P2 = [number, number];

/* ---------- the room (plate scott_room, 1920 wide) ---------- */
const PANES: [number, number, number, number][] = [[526, 108, 158, 134], [727, 108, 154, 134], [526, 261, 158, 147], [727, 261, 154, 147], [526, 427, 158, 154], [727, 427, 154, 154]];
const HORN = {mx: 622, my: 560, mr: 104, nx: 936};
const STY: P2 = [1000, 590], DRUM = {x0: 958, x1: 1072, y0: 564, y1: 636}, CRANK = {cx: 1100, cy: 600, r: 32};
const SC = {x: 548, g: 1012, h: 700}, AS = {x: 1222, g: 1016, h: 680};
const SCOTT_LOOK: Look4 = {dress: 'coat', head: 'short', beard: 'full'};
const ASSIST_LOOK: Look4 = {dress: 'shirt', head: 'cap', build: 0.92};
const MOON_W: P2 = [604, 176];        // the moon's place in the window (room coords), r = 34 * 0.59
const Z0 = 22;                         // the opening close-up on the stylus
const drumV = (tau: number) => lerp(MORSE_END.speed, 190, easeOut(seg(tau, 0, 1.1)));
const integ = (f: (x: number) => number, a: number, b: number) => { let s = 0; const n = Math.max(1, Math.ceil((b - a) * 60)), d = (b - a) / n; for (let i = 0; i < n; i++) s += f(a + (i + 0.5) * d) * d; return s; };
const phaseAt = (tau: number) => MORSE_END.phase + integ(drumV, 0, Math.max(0, tau));
const crankA = (tau: number) => integ(drumV, 0, Math.max(0, tau)) * 0.012;   // the crank turns with the drum

/** waning gibbous, 88 % lit on the left; maria, not a blown disc; halo ≤ 0.18 */
const Moon: React.FC<{x: number; y: number; r: number; sky?: string}> = ({x, y, r, sky = '#1B2348'}) => <g>
	<circle cx={x} cy={y} r={r * 2.4} fill="url(#scHalo)" />
	<circle cx={x} cy={y} r={r} fill="#F6EFD6" />
	{[[-0.32, -0.22, 0.3], [0.12, -0.38, 0.2], [-0.12, 0.16, 0.34], [0.28, 0.22, 0.17], [-0.42, 0.34, 0.14]].map(([dx, dy, rr], i) => <ellipse key={i} cx={x + dx * r} cy={y + dy * r} rx={rr * r} ry={rr * r * 0.82} fill="#D9CFB2" opacity={0.85} />)}
	{[[0.05, 0.55, 0.06], [-0.55, -0.1, 0.05], [0.4, -0.05, 0.05]].map(([dx, dy, rr], i) => <circle key={i} cx={x + dx * r} cy={y + dy * r} r={rr * r} fill="#EDE5CC" />)}
	<path d={`M${x},${y - r} A${r},${r} 0 0,1 ${x},${y + r} A${r * 0.76},${r} 0 0,0 ${x},${y - r} Z`} fill={sky} opacity={0.86} />
</g>;
/** Paris at night beyond the window, in final-frame coordinates (the moon ends at Bell's window moon) */
const Exterior: React.FC<{t: number}> = ({t}) => <g>
	<defs>
		<linearGradient id="scSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#070B1E" /><stop offset="0.55" stopColor="#1B2348" /><stop offset="1" stopColor="#33406B" /></linearGradient>
		<radialGradient id="scHalo"><stop offset="0.38" stopColor="#F6EFD6" stopOpacity="0.18" /><stop offset="1" stopColor="#F6EFD6" stopOpacity="0" /></radialGradient>
	</defs>
	<rect x={-3000} y={-3000} width={8000} height={7000} fill="url(#scSky)" />
	{Array.from({length: 90}, (_, i) => <circle key={i} cx={-600 + rnd(i, 1) * 3100} cy={-500 + rnd(i, 2) * 1150} r={0.6 + rnd(i, 3) * 1.3} fill="#E8ECFF" opacity={(0.25 + 0.5 * rnd(i, 4)) * (0.6 + 0.4 * Math.sin(t * 2 + i))} />)}
	{Array.from({length: 4}, (_, i) => <ellipse key={i} cx={((rnd(i, 5) * 2600 + t * 14) % 2600) - 340} cy={120 + i * 110} rx={300} ry={12} fill="#33406B" opacity={0.35} />)}
	<Moon x={510} y={300} r={34} />
	{/* Notre-Dame (1859 spire) far, then roofs with mansards and chimney pots */}
	<g fill="#0C1024"><rect x={1300} y={520} width={90} height={300} /><rect x={1500} y={520} width={90} height={300} /><rect x={1390} y={600} width={110} height={220} /><rect x={1590} y={640} width={260} height={180} /><path d={`M1700,640 L1712,470 L1724,640 Z`} /><rect x={1296} y={512} width={98} height={10} /><rect x={1496} y={512} width={98} height={10} /></g>
	<path d={(() => { let d = 'M-900,1200 L-900,860'; for (let i = 0; i < 18; i++) { const x = -900 + i * 220, y = 800 + 50 * rnd(i, 7); d += ` L${x + 20},${y} L${x + 60},${y - 46} L${x + 160},${y - 46} L${x + 200},${y} L${x + 220},${y + 20}`; } return d + ' L3200,1200 Z'; })()} fill="#10142C" />
	{Array.from({length: 18}, (_, i) => { const x = -900 + i * 220 + 70 + 60 * rnd(i, 8), y = 800 + 50 * rnd(i, 7) - 46; return <g key={i} fill="#10142C"><rect x={x} y={y - 34} width={26} height={36} />{[0, 9, 18].map((k) => <rect key={k} x={x + k + 1} y={y - 44} width={6} height={12} />)}
		{rnd(i, 9) > 0.55 && <rect x={x - 40} y={y + 30} width={12} height={16} fill="#FFCF8A" opacity={0.7} />}</g>; })}
</g>;

/** the phonautograph on the bench: barrel horn (mouth left), membrane, bristle, soot drum on its axle, crank */
const Phono: React.FC<{tau: number; t: number; pxw: number; sing: number; lineCol: string}> = ({tau, t, pxw, sing, lineCol}) => {
	const ph = phaseAt(tau), aw = MORSE_END.amp / Z0, a = crankA(tau), jit = sing * 0.4 * Math.sin(t * 90);
	const row = (y: number, off: number, x1: number) => { let d = ''; for (let x = DRUM.x0 + 2; x <= x1; x += 0.3) d += `${d ? 'L' : 'M'}${x.toFixed(2)},${(y + aw * voiceWave((x - STY[0]) * Z0 + W / 2 + ph + off)).toFixed(2)}`; return d; };
	const fresh = 1 - seg(tau, 0.1, T.soot);
	return <g>
		<defs><linearGradient id="scDrum" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#060507" /><stop offset="0.35" stopColor="#1C1A20" /><stop offset="0.5" stopColor="#25222A" /><stop offset="0.7" stopColor="#17151A" /><stop offset="1" stopColor="#060507" /></linearGradient>
			<linearGradient id="scHorn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3A2E26" /><stop offset="0.4" stopColor="#1E1A1C" /><stop offset="1" stopColor="#0E0C0E" /></linearGradient></defs>
		<rect x={600} y={661} width={540} height={11} fill="#21180F" />
		<path d={`M700,640 L706,662 L716,662 L712,630 Z M860,598 L864,662 L874,662 L872,594 Z`} fill="#1A130C" />
		<path d={`M${HORN.mx},${HORN.my - HORN.mr} C700,472 830,520 ${HORN.nx},${HORN.my - 20} L${HORN.nx},${HORN.my + 20} C830,602 700,650 ${HORN.mx},${HORN.my + HORN.mr} Z`} fill="url(#scHorn)" />
		<path d={`M${HORN.mx + 10},${HORN.my - HORN.mr + 6} C700,478 830,524 ${HORN.nx - 4},${HORN.my - 16}`} stroke="#8A6A44" strokeWidth={3} fill="none" opacity={0.5} />
		<ellipse cx={HORN.mx} cy={HORN.my} rx={18} ry={HORN.mr} fill="#2C2730" /><ellipse cx={HORN.mx + 3} cy={HORN.my} rx={12} ry={HORN.mr - 8} fill="#0B090C" />
		<rect x={HORN.nx - 2} y={HORN.my - 24} width={14} height={48} rx={3} fill="#2A2420" /><rect x={HORN.nx + 8} y={HORN.my - 26} width={4} height={52} fill="#B08A4A" />
		{/* drum on its axle between two posts; the paper is lampblacked; earlier turns of the helix below the stylus */}
		<rect x={952} y={598} width={10} height={64} fill="#21180F" /><rect x={1080} y={598} width={10} height={64} fill="#21180F" />
		<line x1={944} y1={600} x2={CRANK.cx} y2={600} stroke="#8A7A5A" strokeWidth={4} />
		<rect x={DRUM.x0} y={DRUM.y0} width={DRUM.x1 - DRUM.x0} height={DRUM.y1 - DRUM.y0} rx={5} fill="url(#scDrum)" />
		{Array.from({length: 30}, (_, i) => { const x = DRUM.x0 + ((rnd(i, 1) * 114 - (ph / Z0) % 114 + 228) % 114), y = DRUM.y0 + 4 + rnd(i, 2) * 64; return <circle key={i} cx={x} cy={y} r={0.25 + 0.3 * rnd(i, 3)} fill="#3A3640" opacity={0.6} />; })}
		<g opacity={1 - fresh}>{[1, 2, 3, 4].map((k) => <path key={k} d={row(STY[1] + 8 * k, k * 977, DRUM.x1 - 2)} stroke="#E9E1CC" strokeWidth={1.3 * pxw} fill="none" opacity={0.8 - k * 0.12} />)}</g>
		<path d={row(STY[1], 0, STY[0])} stroke={lineCol} strokeWidth={lerp(4, 1.6, cl((Z0 * pxw - 1) / 3)) * pxw} fill="none" />
		{fresh > 0 && <path d={(() => { let d = ''; for (let x = STY[0]; x <= DRUM.x1 + 60; x += 0.3) d += `${d ? 'L' : 'M'}${x.toFixed(2)},${(STY[1] + aw * voiceWave((x - STY[0]) * Z0 + W / 2 + ph)).toFixed(2)}`; return d; })()} stroke={lineCol} strokeWidth={4 * pxw} fill="none" opacity={fresh} />}
		{/* the bristle from the membrane to the soot, vibrating with the song */}
		<path d={`M${HORN.nx + 12},${HORN.my - 2} Q${STY[0] - 24},${STY[1] - 30} ${STY[0] + jit},${STY[1] - 0.6}`} stroke="#D9C9A0" strokeWidth={1.4 * Math.max(0.7, pxw * 2)} fill="none" />
		<g transform={`translate(${CRANK.cx},${CRANK.cy}) rotate(${a / Math.PI * 180})`}><rect x={-4} y={-4} width={CRANK.r + 4} height={8} rx={3} fill="#2A2018" /><circle cx={CRANK.r} cy={0} r={7} fill="#2A2018" /><circle cx={0} cy={0} r={6} fill="#B08A4A" /></g>
	</g>;
};
const knobAt = (tau: number): P2 => { const a = crankA(tau); return [CRANK.cx + Math.cos(a) * CRANK.r, CRANK.cy + Math.sin(a) * CRANK.r]; };

/** Scott at the horn and his assistant at the crank; sing 0..1 drives the breath, head and the voice rings */
const Singers: React.FC<{tau: number; t: number; sing: number; ghost?: boolean}> = ({tau, t, sing, ghost}) => {
	const b = Math.sin(t * 3.3) * sing, b2 = Math.sin(t * 2.1 + 1) * sing;
	const base = {hip: 0.37, lean: 21 + 2 * b, neck: -6 + 3 * b2, lt: 84, lk: 88, rt: 78, rk: 82, la: 40, le: 60, ra: 20, re: 70};
	const sp = fkPose(reach(base, 'l', toBody([HORN.mx + 12, HORN.my + HORN.mr - 18], SC.x, SC.g, SC.h)));
	const hd = jointAt(sp, 'Head', SC.x, SC.g, SC.h), top = jointAt(sp, 'Top', SC.x, SC.g, SC.h), mouth: P2 = [hd[0] + 0.07 * SC.h + (top[0] - hd[0]) * -0.2, hd[1] + 0.035 * SC.h];
	const k = knobAt(tau), ap = fkPose(reach({hip: 0.655 + 0.002 * Math.sin(t * 1.7), lean: 12, neck: 16, lt: 4, lk: 6, rt: -6, rk: 6, la: 40, le: 40, ra: 8, re: 20}, 'l', toBody([k[0] + 4, k[1]], AS.x, AS.g, AS.h, true)));
	const col = ghost ? '#0A0E1C' : '#07080F';
	return <g>
		{/* stool */}
		<path d={`M${SC.x - 58},${SC.g} L${SC.x - 44},${SC.g - 232} L${SC.x + 44},${SC.g - 232} L${SC.x + 58},${SC.g} L${SC.x + 46},${SC.g} L${SC.x + 34},${SC.g - 216} L${SC.x - 34},${SC.g - 216} L${SC.x - 46},${SC.g} Z`} fill="#1A130C" />
		<rect x={SC.x - 52} y={SC.g - 242} width={104} height={14} rx={4} fill="#2A1E14" />
		<Rimmed x={SC.x} ground={SC.g} h={SC.h} pose={sp} look={SCOTT_LOOK} col={col} rim="#FFCF8A" rimOp={ghost ? 0 : 0.16} rimDx={2} rimDy={-1} T={t} />
		<Rimmed x={AS.x} ground={AS.g} h={AS.h} pose={ap} look={ASSIST_LOOK} flip col={col} rim="#FFCF8A" rimOp={ghost ? 0 : 0.16} rimDx={-2} rimDy={-1} T={t} />
		{sing > 0.05 && Array.from({length: 3}, (_, i) => { const u = (t * 1.3 + i / 3) % 1, r = 8 + u * 40; return <path key={i} d={`M${mouth[0] + r * 0.3},${mouth[1] - r} A${r},${r} 0 0,1 ${mouth[0] + r * 0.3},${mouth[1] + r}`} fill="none" stroke="#F4ECD4" strokeWidth={2.2 - 1.4 * u} opacity={sing * 0.45 * (1 - u)} />; })}
	</g>;
};
const LAMP: P2 = [1078, 455];
/** the room: exterior behind the window holes, plate, lamp, phonautograph, people */
const Room: React.FC<{tau: number; t: number; pxw: number; sing: number; lamp: number; people: boolean; lineCol: string; scott2?: React.ReactNode}> = ({tau, t, pxw, sing, lamp, people, lineCol, scott2}) => {
	const fl = 0.9 + 0.1 * Math.sin(t * 13) * Math.sin(t * 7.1);
	return <g>
		<defs><mask id="scPanes" maskUnits="userSpaceOnUse" x={-100} y={-100} width={2200} height={1300}><rect x={-100} y={-100} width={2200} height={1300} fill="#fff" />{PANES.map(([x, y, w, h], i) => <rect key={i} x={x} y={y} width={w} height={h} fill="#000" />)}</mask></defs>
		<image href={staticFile('ep41/scott_room.webp')} x={0} y={0} width={1920} height={1080} mask="url(#scPanes)" />
		{/* the hanging lamp hangs from a chain (no cord) */}
		{Array.from({length: 24}, (_, i) => <ellipse key={i} cx={1077} cy={8 + i * 15.4} rx={2.6} ry={6} fill="none" stroke="#2A2218" strokeWidth={2} />)}
		<rect width={W} height={H} fill="#05060C" opacity={0.55 * (1 - lamp)} />
		<Glow x={LAMP[0]} y={LAMP[1]} r={260} c="#FFCF8A" o={0.22 * fl * lamp} id="scLampG" />
		<circle cx={LAMP[0]} cy={LAMP[1] + 4} r={10} fill="#FFE2A6" opacity={0.7 * fl * lamp} />
		<Phono tau={tau} t={t} pxw={pxw} sing={sing} lineCol={lineCol} />
		{people && <Singers tau={tau} t={t} sing={sing} />}
		{scott2}
		<rect x={0} y={0} width={W} height={H} fill="url(#scTL)" />
	</g>;
};

/** the soot sheet (unwrapped): black with white wavy rows; glow = lit trace behind the scan bar; play = playhead 0..1 */
const Sheet: React.FC<{x: number; y: number; w: number; h: number; scan?: number; play?: number; backlit?: number; t: number}> = ({x, y, w, h, scan = -1, play = -1, backlit = 0, t}) => {
	const rows = [0.22, 0.42, 0.62, 0.82], sx = x + scan * w, amp = h * 0.045;
	const rowD = (r: number, x0: number, x1: number) => { let d = ''; for (let xx = x0; xx <= x1; xx += 3) d += `${d ? 'L' : 'M'}${xx.toFixed(1)},${(y + r * h + amp * voiceWave((xx - x) * 2.2 + r * 3000)).toFixed(1)}`; return d; };
	return <g>
		<rect x={x - 6} y={y - 6} width={w + 12} height={h + 12} fill="#2A2420" opacity={0.6} />
		<rect x={x} y={y} width={w} height={h} fill="#121014" />
		{Array.from({length: 60}, (_, i) => <circle key={i} cx={x + rnd(i, 11) * w} cy={y + rnd(i, 12) * h} r={0.6 + rnd(i, 13)} fill="#2A2630" opacity={0.7} />)}
		{rows.map((r, i) => <path key={i} d={rowD(r, x + 4, x + w - 4)} stroke={backlit > 0 ? '#FFE9B8' : '#E9E1CC'} strokeWidth={backlit > 0 ? 2.4 : 1.8} fill="none" opacity={0.85} />)}
		{backlit > 0 && rows.map((r, i) => <path key={i} d={rowD(r, x + 4, x + w - 4)} stroke="#FFCF8A" strokeWidth={7} fill="none" opacity={0.3 * backlit} />)}
		{scan > 0 && rows.map((r, i) => <g key={i}><path d={rowD(r, x + 4, Math.min(sx, x + w - 4))} stroke="#BFE9FF" strokeWidth={8} fill="none" opacity={0.35} /><path d={rowD(r, x + 4, Math.min(sx, x + w - 4))} stroke="#EAF8FF" strokeWidth={2.4} fill="none" /></g>)}
		{scan > 0 && scan < 1 && <g><rect x={sx - 3} y={y - 20} width={6} height={h + 40} fill="#E8F8FF" /><rect x={sx - 40} y={y - 20} width={80} height={h + 40} fill="url(#scBar)" /></g>}
		{play >= 0 && play <= 1 && (() => { const px = x + 4 + play * (w - 8), py = y + rows[1] * h + amp * voiceWave((px - x) * 2.2 + rows[1] * 3000); return <g><Glow x={px} y={py} r={90} c="#BFE9FF" o={0.6} id="scPlay" /><circle cx={px} cy={py} r={6} fill="#FFFFFF" /></g>; })()}
		{void t}
	</g>;
};
/** the 2008 waveform of the real recording, drawn up to the playhead (mirrored bars on a line) */
const Waveform: React.FC<{x: number; y: number; w: number; amp: number; upto: number; op?: number; col?: string}> = ({x, y, w, amp, upto, op = 1, col = '#BFE9FF'}) => {
	const n = 180, bars: React.ReactNode[] = [];
	for (let i = 0; i < n; i++) { const u = i / (n - 1); if (u > upto) break; const e = env(u * CQ_DUR), hgt = Math.max(1.5, e * amp * (0.75 + 0.25 * Math.sin(i * 2.7)));
		bars.push(<rect key={i} x={x + u * w - 2} y={y - hgt} width={4} height={hgt * 2} rx={2} fill={col} opacity={0.9} />); }
	return <g opacity={op}><rect x={x} y={y - 1} width={w * upto} height={2} fill={col} opacity={0.6} />{bars}</g>;
};

export const SCOTT3: React.FC<{tau: number; t: number}> = ({tau, t}) => {
	const defs = <defs>
		<radialGradient id="scTL" cx="0.12" cy="0.1" r="0.55"><stop offset="0" stopColor="#05060C" stopOpacity="0.5" /><stop offset="1" stopColor="#05060C" stopOpacity="0" /></radialGradient>
		<linearGradient id="scBar" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#BFE9FF" stopOpacity="0" /><stop offset="0.5" stopColor="#BFE9FF" stopOpacity="0.45" /><stop offset="1" stopColor="#BFE9FF" stopOpacity="0" /></linearGradient>
	</defs>;
	const roomCamExt = (z: number, cx: number, cy: number, p: P2): P2 => [W / 2 + (p[0] - cx) * z, H / 2 + (p[1] - cy) * z];
	if (tau < T.hold) {   // S1: from the trace on soot (= 莫尔斯's last frame) pull back to the singer; only the scratch is heard
		const u = ease(seg(tau, T.pull, T.pullEnd)), z = Math.exp(lerp(Math.log(Z0), Math.log(1.06), u)) * lerp(1, 1.08, seg(tau, T.pullEnd, T.hold));
		const cx = lerp(STY[0], 900, u), cy = lerp(STY[1], 540, u), d = drift(t, u);
		const black = 1 - sm(seg(tau, 0.08, T.soot)), lineCol = mixHex(MORSE_END.col, '#F4ECD4', seg(tau, 0.1, T.soot));
		const em = roomCamExt(z, cx + d.px, cy + d.py, MOON_W);
		return <g>{defs}
			<g transform={`translate(${em[0]},${em[1]}) scale(${0.59 * z}) translate(-510,-300)`}><Exterior t={t} /></g>
			<CamC z={z} cx={cx + d.px} cy={cy + d.py}><Room tau={tau} t={t} pxw={1 / z} sing={sm(seg(tau, 0.3, 1.0))} lamp={1} people lineCol={lineCol} /></CamC>
			{black > 0 && <g><rect width={W} height={H} fill="#07080F" opacity={black} /><path d={tracePath(phaseAt(tau), MORSE_END.amp)} stroke="#F2CF7A" strokeWidth={12} fill="none" opacity={0.25 * black} /><path d={tracePath(phaseAt(tau), MORSE_END.amp)} stroke={lineCol} strokeWidth={4} fill="none" opacity={black} /></g>}
		</g>;
	}
	if (tau < T.file) {   // S2: he holds the sheet to the lamp; the scratched lines glow; the lamp gutters
		const SX = 868, SG = 1014, SH = 700, sheet = {x: 1004, y: 420, w: 112, h: 52};
		const base = {hip: 0.655, lean: 4 + Math.sin(t * 1.5) * 0.6, neck: -8, lt: 3, lk: 3, rt: -5, rk: 5, la: 60, le: 60, ra: 60, re: 60};
		const p1 = reach(base, 'l', toBody([sheet.x + 10, sheet.y + sheet.h * 0.6], SX, SG, SH)), pose = fkPose(reach(p1, 'r', toBody([sheet.x + sheet.w - 8, sheet.y + sheet.h * 0.45], SX, SG, SH)));
		const g = seg(tau, T.gutter, T.file), lamp = 1 - 0.75 * sm(g) + 0.25 * Math.sin(t * 40) * Math.sin(Math.PI * g);
		const z = lerp(1.7, 2.7, ease(seg(tau, T.hold, T.file))), d = drift(t, 0.7), cx = lerp(1000, 1070, ease(seg(tau, T.hold, T.file))), cy = lerp(470, 462, ease(seg(tau, T.hold, T.file)));
		const em = roomCamExt(z, cx + d.px, cy + d.py, MOON_W);
		return <g>{defs}
			<g transform={`translate(${em[0]},${em[1]}) scale(${0.59 * z}) translate(-510,-300)`}><Exterior t={t} /></g>
			<CamC z={z} cx={cx + d.px} cy={cy + d.py}><Room tau={tau} t={t} pxw={1 / z} sing={0} lamp={lamp} people={false} lineCol="#F4ECD4"
				scott2={<g><Rimmed x={SX} ground={SG} h={SH} pose={pose} look={SCOTT_LOOK} col="#07080F" rim="#FFCF8A" rimOp={0.18 * lamp} rimDx={2.5} rimDy={-1} T={t} />
					<Sheet x={sheet.x} y={sheet.y} w={sheet.w} h={sheet.h} backlit={lamp} t={t} /></g>} /></CamC>
		</g>;
	}
	if (tau < T.open2008) {   // filed away: the sheet itself lies in an archive drawer of the Académie; dust settles on it,
		// daylight crosses it again and again, and the year on its paper label runs 1860 → 2008
		const lay = ease(seg(tau, T.file, T.shut)), yrs = seg(tau, T.shut + 0.05, T.open2008 - 0.2), yk = yrs < 0.5 ? 2 * yrs * yrs : 1 - 2 * (1 - yrs) * (1 - yrs);
		const year = Math.round(lerp(1860, 2008, yk)), dust = sm(seg(tau, T.shut, T.open2008 - 0.1)), cool = sm(seg(tau, T.open2008 - 0.3, T.open2008));
		const z = lerp(1.0, 1.1, ease(seg(tau, T.file, T.open2008))), d = drift(t, 0.6);
		return <g>{defs}<CamC z={z} cx={960 + d.px} cy={520 + d.py}>
			{/* the drawer: dark oak sides, the inside lined with card */}
			<rect x={-300} y={-300} width={W + 600} height={H + 600} fill="#120D09" />
			<rect x={150} y={110} width={1620} height={860} rx={6} fill="#2E2116" />
			<rect x={190} y={150} width={1540} height={780} fill="#1E160F" />
			<path d="M190,150 L1730,150 L1700,180 L220,180 Z" fill="#3A2A1C" /><path d="M190,150 L220,180 L220,900 L190,930 Z" fill="#2A1E14" />
			{/* the folder (card) and the phonautogram on it */}
			<rect x={250} y={205} width={1420} height={690} fill="#B9AA88" /><path d="M960,205 L960,895" stroke="#9C8C6C" strokeWidth={3} />
			<g transform={`translate(0,${lerp(-260, 0, lay)}) rotate(${lerp(-3, 0, lay)} 960 500)`} opacity={sm(seg(tau, T.file, T.file + 0.12))}>
				<Sheet x={330} y={270} w={1260} h={430} t={t} />
				{/* the paper label pasted on the sheet's margin: 「Académie des sciences」 and the year */}
				<g transform="translate(1250,700)"><rect x={0} y={0} width={330} height={128} fill="#EDE3CA" stroke="#8A7A5A" strokeWidth={3} />
					<text x={18} y={44} style={{fontFamily: '"FreeSerif", "DejaVu Serif", serif', fontStyle: 'italic', fontSize: 30}} fill="#3A2C20">Académie des sciences</text>
					<path d="M18,60 L312,60" stroke="#8A7A5A" strokeWidth={1.5} />
					<text x={165} y={108} textAnchor="middle" style={{fontFamily: '"DejaVu Serif", serif', fontSize: 44, fontWeight: 700, letterSpacing: '0.06em'}} fill={year >= 2008 ? '#1E4A66' : '#3A2C20'}>{year}</text></g>
			</g>
			{/* dust settling: a grey film and specks that build up over the years */}
			<rect x={250} y={205} width={1420} height={690} fill="#9C9480" opacity={0.3 * dust} />
			{Array.from({length: 320}, (_, i) => { const tt = 0.05 + rnd(i, 3) * 0.9; if (dust < tt) return null; return <circle key={i} cx={260 + rnd(i, 1) * 1400} cy={215 + rnd(i, 2) * 670} r={0.8 + rnd(i, 4) * 2.2} fill="#C8BEA6" opacity={0.55 * cl((dust - tt) * 6)} />; })}
			{/* days pass: daylight from a window crosses the drawer again and again */}
			{yrs > 0 && yrs < 1 && Array.from({length: 3}, (_, i) => { const u = (yrs * 7 + i / 3) % 1; return <path key={i} d={`M${lerp(-700, 2300, u)},-200 l420,0 l-380,1500 l-420,0 Z`} fill="#F2E6C8" opacity={0.1 * Math.sin(Math.PI * u)} />; })}
			{Array.from({length: 50}, (_, i) => <circle key={i} cx={((rnd(i, 5) * 2000 + t * 10 * rnd(i, 7)) % 2000) - 40} cy={((rnd(i, 6) * 1200 + t * 30 * (0.3 + rnd(i, 8))) % 1200) - 60} r={1 + rnd(i, 9) * 1.6} fill="#D8CCB0" opacity={0.25} />)}
			<rect x={-300} y={-300} width={W + 600} height={H + 600} fill="#BFE9FF" opacity={0.12 * cool} />
		</CamC><rect width={W} height={H} fill="url(#scTL)" /><defs><linearGradient id="scBot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#05060C" stopOpacity="0" /><stop offset="1" stopColor="#05060C" stopOpacity="0.45" /></linearGradient></defs><rect x={0} y={780} width={W} height={300} fill="url(#scBot)" /></g>;
	}
	if (tau < T.dex + 0.5) {   // S3: 2008 — the scan light crosses the sheet; the trace lights up and plays the real voice
		const sc = seg(tau, T.scan, T.scanEnd), play = seg(tau, T.cq, T.cq + CQ_DUR), sheet = {x: 160, y: 300, w: 1600, h: 480};
		const z = lerp(1.04, 1.16, ease(seg(tau, T.open2008, T.dex))), d = drift(t, 0.5), cx = lerp(900, 1040, ease(seg(tau, T.cq, T.cqEnd))), cy = 520;
		const fade = 1 - seg(tau, T.dex, T.dex + 0.5);
		return <g>{fade < 1 && <S4 tau={tau} t={t} defs={defs} />}<g opacity={fade}>{defs}<CamC z={z} cx={cx + d.px} cy={cy + d.py}>
			<rect x={-300} y={-300} width={W + 600} height={H + 600} fill="#0C1418" />
			<rect x={60} y={200} width={1800} height={680} rx={14} fill="#1A2A32" /><rect x={90} y={230} width={1740} height={620} fill="#0E1A20" />
			<Sheet x={sheet.x} y={sheet.y} w={sheet.w} h={sheet.h} scan={tau >= T.scan ? sc : -1} play={tau >= T.cq ? play : -1} t={t} />
			<Waveform x={sheet.x + 4} y={sheet.y + sheet.h * 0.42} w={sheet.w - 8} amp={120} upto={tau >= T.cq ? play : 0} op={0.55} />
			<rect x={60} y={200} width={1800} height={680} rx={14} fill="none" stroke="#3A5260" strokeWidth={6} />
			<path d="M60,200 L700,200 L300,880 L60,880 Z" fill="#BFE9FF" opacity={0.04} />
		</CamC><rect width={W} height={H} fill="url(#scTL)" /></g></g>;
	}
	return <S4 tau={tau} t={t} defs={defs} />;
};
/** S4: double exposure — the 2008 waveform over Scott singing at the horn; then through the window to the moon */
const S4: React.FC<{tau: number; t: number; defs: React.ReactNode}> = ({tau, t, defs}) => {
	const roomCamExt = (z: number, cx: number, cy: number, p: P2): P2 => [W / 2 + (p[0] - cx) * z, H / 2 + (p[1] - cy) * z];
	const k = ease(seg(tau, T.through, T.moon)), z1 = lerp(1.0, 1.2, ease(seg(tau, T.dex, T.through))), z = z1 * Math.exp(lerp(0, Math.log(16), ease(seg(tau, T.through + 0.3, T.moon - 0.45))));
	const cx = lerp(lerp(940, 720, ease(seg(tau, T.dex, T.through))), 605, ease(seg(tau, T.through, T.through + 0.8))), cy = lerp(lerp(540, 380, ease(seg(tau, T.dex, T.through))), 175, ease(seg(tau, T.through, T.through + 0.8)));
	const d = drift(t, 1 - k), emRoom = roomCamExt(z1, cx + d.px, cy + d.py, MOON_W), em: P2 = [lerp(emRoom[0], 510, k), lerp(emRoom[1], 300, k)], ze = lerp(0.59 * z1, 1, k);
	const roomOp = 1 - sm(seg(tau, T.moon - 0.45, T.moon - 0.15)), wave = (1 - sm(seg(tau, T.through - 0.2, T.through + 0.7))) * sm(seg(tau, T.dex, T.dex + 0.5));
	const sing = 0.6 + 0.4 * Math.sin(t * 2.2);
	return <g>{defs}
		<g transform={`translate(${em[0]},${em[1]}) scale(${ze}) translate(-510,-300)`}><Exterior t={t} /></g>
		{roomOp > 0 && <g opacity={roomOp}><CamC z={z} cx={cx + d.px} cy={cy + d.py}><Room tau={tau} t={t} pxw={1 / z} sing={sing} lamp={0.85} people lineCol="#F4ECD4" /></CamC>
			<rect width={W} height={H} fill="#1B2A55" opacity={0.28 * wave} style={{mixBlendMode: 'screen'}} /></g>}
		{wave > 0 && <g><Waveform x={170} y={TRACE_Y + 40} w={1580} amp={130} upto={1} op={0.5 * wave} /><Waveform x={170} y={TRACE_Y + 40} w={1580} amp={130} upto={1} op={0.35 * wave} col="#FFFFFF" /></g>}
	</g>;
};
const mixHex = (a: string, b: string, u: number) => { const p = (c: string, i: number) => parseInt(c.slice(1 + 2 * i, 3 + 2 * i), 16); return '#' + [0, 1, 2].map((i) => Math.round(lerp(p(a, i), p(b, i), cl(u))).toString(16).padStart(2, '0')).join(''); };
void easeOut; void sm;
