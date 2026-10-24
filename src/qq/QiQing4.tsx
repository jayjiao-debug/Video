import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';

/* 《七情》 v4 — what v3 got wrong (owner: "not distinct, no tension; the background should say what they are"):
   every voice now has its own silhouette, pose and world, and the head is huge and cropped.
   惧: front close-up, eyes snapped wide, both hands clamped over the mouth, hair on end; around it, eyes open in the dark
       and stare (瞿, 鹰隼之视); its jade 璧 halo cracks and sheds shards; ice cracks run across the frame; cyan lightning.
   爱: profile, hair streaming in the wind and turning into red threads that cross the whole frame; a peony blooms
       behind the head; petals; heartbeat rings on the beat; the 璧 halo bound with red thread.
   Music: the owner's reference track (117.45 BPM). Kick enters at 6.15 s; one reveal per 4 bars, on downbeats. */

const W = 1920, H = 1080, FPS = 30;
const cl01 = (x: number) => Math.max(0, Math.min(1, x));
const ease = (u: number) => { const v = cl01(u); return v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2; };
const out3 = (u: number) => 1 - Math.pow(1 - cl01(u), 3);
const outBack = (u: number) => { const v = cl01(u), c1 = 2.2, c3 = c1 + 1; return 1 + c3 * Math.pow(v - 1, 3) + c1 * Math.pow(v - 1, 2); };
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const fade = (T: number, a: number, d = 0.4) => ease((T - a) / d);
const rnd = (i: number, k = 0) => { const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); };

const SERIF = '"Noto Serif CJK SC", serif';
const GOLD = '#e6c47a';

// music grid (seconds in the track = seconds in the film)
const BEAT = 0.5108;
const V1 = 6.15, R1 = 10.22, V2 = 14.28, R2 = 18.34, OUT = 22.41;
export const QQ4_END = 28.6;

type Voice = {n: number; ch: string; py: string; col: string; hot: string; deep: string; when: string; line: string; say: string; sym: string; t0: number; rv: number; t1: number};
const VOICES: Voice[] = [
	{n: 4, ch: '惧', py: 'jù', col: '#5fe0ff', hot: '#d8f8ff', deep: '#06202c', when: '它在你按下发送前说', line: '“万一，他不回呢？”', say: '怕失去，所以不敢开口。', sym: '盯着你的眼睛', t0: V1, rv: R1, t1: V2},
	{n: 5, ch: '爱', py: 'ài', col: '#ff4f86', hot: '#ffd6e4', deep: '#2c0616', when: '它在你记住他随口一句话时说', line: '“他说过，他怕冷。”', say: '心里有人，才会记得。', sym: '一根红线', t0: V2, rv: R2, t1: OUT},
];
const SEVEN = [{ch: '喜', col: '#ffc94a'}, {ch: '怒', col: '#ff4a3a'}, {ch: '哀', col: '#7aa2ff'}, {ch: '惧', col: '#5fe0ff'}, {ch: '爱', col: '#ff4f86'}, {ch: '恶', col: '#a6e36a'}, {ch: '欲', col: '#c47bff'}];
const NUM = ['零', '一', '二', '三', '四', '五', '六', '七'];

// ---------------------------------------------------------------- defs
const Defs: React.FC<{col: string; deep: string; hot: string}> = ({col, deep, hot}) => (
	<defs>
		<filter id="gS" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" /></filter>
		<filter id="gM" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="10" /></filter>
		<filter id="gL" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="34" /></filter>
		<radialGradient id="bgG" cx="0.72" cy="0.48" r="0.8"><stop offset="0" stopColor={deep} /><stop offset="0.5" stopColor="#08070d" /><stop offset="1" stopColor="#030205" /></radialGradient>
		<radialGradient id="orbG" cx="0.45" cy="0.4" r="0.7"><stop offset="0" stopColor={col} stopOpacity="0.5" /><stop offset="0.6" stopColor={deep} stopOpacity="0.95" /><stop offset="1" stopColor="#05040a" /></radialGradient>
		<radialGradient id="auraG"><stop offset="0" stopColor={col} stopOpacity="0.5" /><stop offset="1" stopColor={col} stopOpacity="0" /></radialGradient>
		<radialGradient id="hotG"><stop offset="0" stopColor="#fff" /><stop offset="0.35" stopColor={hot} stopOpacity="0.9" /><stop offset="1" stopColor={col} stopOpacity="0" /></radialGradient>
		<linearGradient id="nameG" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="0.45" stopColor={hot} /><stop offset="1" stopColor={col} /></linearGradient>
		<linearGradient id="goldG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff2c8" /><stop offset="0.5" stopColor={GOLD} /><stop offset="1" stopColor="#a8823c" /></linearGradient>
		<linearGradient id="jadeG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={hot} stopOpacity="0.55" /><stop offset="0.5" stopColor={col} stopOpacity="0.28" /><stop offset="1" stopColor={deep} stopOpacity="0.6" /></linearGradient>
	</defs>
);

/** jagged lightning between two points, re-rolled a few times a second so it flickers */
const Bolt: React.FC<{a: [number, number]; b: [number, number]; seed: number; T: number; col: string; w?: number; o?: number}> = ({a, b, seed, T, col, w = 2.4, o = 1}) => {
	const roll = Math.floor(T * 14), n = 12;
	const pts = Array.from({length: n + 1}, (_, i) => { const u = i / n, j = (i === 0 || i === n) ? 0 : (rnd(seed * 31 + i, roll) - 0.5) * 70; const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1; return [a[0] + dx * u - dy / L * j, a[1] + dy * u + dx / L * j]; });
	const d = 'M' + pts.map((p) => p.map((v) => v.toFixed(1)).join(',')).join(' L');
	const flick = rnd(seed, roll) > 0.35 ? 1 : 0.2;
	return <g opacity={o * flick}><path d={d} stroke={col} strokeWidth={w * 4} fill="none" opacity={0.5} filter="url(#gM)" /><path d={d} stroke="#fff" strokeWidth={w} fill="none" /></g>;
};

/** background: dark world, constellation, one huge thin arc slicing the frame */
const World: React.FC<{T: number; v: Voice; lit: number}> = ({T, v, lit}) => (
	<g>
		<rect width={W} height={H} fill="url(#bgG)" />
		{Array.from({length: 50}, (_, i) => <circle key={i} cx={rnd(i) * W} cy={rnd(i, 1) * H} r={0.8 + 1.4 * rnd(i, 2)} fill="#eef" opacity={0.15 + 0.35 * Math.sin(T * 1.2 + i * 2.1) ** 2} />)}
		<circle cx={520} cy={560} r={620} fill="none" stroke={v.hot} strokeWidth={2.2} opacity={0.25 + 0.4 * lit} />
		<circle cx={520} cy={560} r={640} fill="none" stroke={v.col} strokeWidth={10} opacity={0.12 * lit} filter="url(#gM)" />
	</g>
);

/** the 璧 (jade disc) halo: thick ring of translucent jade with raised grain dots; cracked or bound per voice */
const Bi: React.FC<{T: number; v: Voice; x: number; y: number; s: number; crack: number; bind: number; o?: number}> = ({T, v, x, y, s, crack, bind, o = 1}) => {
	const r0 = 250, r1 = 340;
	return <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
		<circle r={560} fill="url(#auraG)" />
		<path d={`M0,${-r1} A${r1},${r1} 0 1,1 -0.1,${-r1} Z M0,${-r0} A${r0},${r0} 0 1,0 0.1,${-r0} Z`} fill="url(#jadeG)" fillRule="evenodd" />
		<circle r={r1} fill="none" stroke={v.hot} strokeWidth={3} />
		<circle r={r0} fill="none" stroke={v.hot} strokeWidth={3} />
		<circle r={r1 + 14} fill="none" stroke="url(#goldG)" strokeWidth={2} opacity={0.7} />
		<g transform={`rotate(${T * 5})`}>
			{Array.from({length: 4}, (_, ring) => Array.from({length: 40 + ring * 6}, (_, i) => { const rr = r0 + 18 + ring * 20, a = (i / (40 + ring * 6)) * Math.PI * 2 + ring * 0.1; return <circle key={ring + '-' + i} cx={Math.cos(a) * rr} cy={Math.sin(a) * rr} r={4} fill="none" stroke={v.hot} strokeWidth={1.2} opacity={0.5} />; }))}
		</g>
		{/* 惧: cracks race round the disc and shards fly off */}
		{crack > 0 && <g>
			{Array.from({length: 9}, (_, i) => { const a0 = rnd(i, 3) * Math.PI * 2; const pts = Array.from({length: 6}, (_, k) => { const rr = lerp(r0 - 10, r1 + 30, k / 5), a = a0 + (rnd(i * 7 + k, 4) - 0.5) * 0.25; return [Math.cos(a) * rr, Math.sin(a) * rr]; }); const len = 200; return <path key={i} d={'M' + pts.map((p) => p.join(',')).join(' L')} stroke="#fff" strokeWidth={2.6} fill="none" strokeDasharray={len} strokeDashoffset={len * (1 - out3(crack * 1.5 - i * 0.05))} />; })}
			{Array.from({length: 14}, (_, i) => { const a = rnd(i, 5) * Math.PI * 2, d = r1 + 20 + 380 * out3(crack) * (0.4 + rnd(i, 6)), sz = 10 + 22 * rnd(i, 7); return <path key={'s' + i} transform={`translate(${Math.cos(a) * d},${Math.sin(a) * d}) rotate(${T * 90 * (rnd(i, 8) - 0.5) + i * 40})`} d={`M0,${-sz} L${sz * 0.6},${sz * 0.3} L${-sz * 0.4},${sz * 0.7} Z`} fill={v.col} opacity={0.45 * (1 - crack * 0.3)} stroke={v.hot} strokeWidth={1.4} />; })}
		</g>}
		{/* 爱: red thread winds round and round the disc */}
		{bind > 0 && Array.from({length: 5}, (_, i) => { const rr = r0 + 14 + i * 18, len = 2 * Math.PI * rr; return <circle key={i} r={rr} fill="none" stroke={v.col} strokeWidth={3} strokeDasharray={len} strokeDashoffset={len * (1 - cl01(bind * 1.4 - i * 0.12))} transform={`rotate(${-90 + i * 50 + T * 10})`} opacity={0.9} />; })}
	</g>;
};

// ---------------------------------------------------------------- 惧: front close-up, hands over the mouth
const FRONT = 'M0,-160 C86,-160 118,-90 114,-16 C110,58 70,132 0,156 C-70,132 -110,58 -114,-16 C-118,-90 -86,-160 0,-160 Z';
const finger = (bx: number, by: number, tx: number, ty: number, w: number) => { const dx = tx - bx, dy = ty - by, L = Math.hypot(dx, dy), nx = -dy / L * w / 2, ny = dx / L * w / 2; return `M${bx + nx},${by + ny} L${tx + nx},${ty + ny} A${w / 2},${w / 2} 0 0,0 ${tx - nx},${ty - ny} L${bx - nx},${by - ny} Z`; };
const Fear: React.FC<{T: number; v: Voice; u: number; eyes: number; hands: number}> = ({T, v, u, eyes, hands}) => {
	const c = v.col, draw = out3(u), L = 3000;
	const neon = (d: string, w = 3, key?: string | number) => <g key={key}>
		<path d={d} fill="none" stroke={c} strokeWidth={w * 3.5} opacity={0.5} filter="url(#gM)" strokeDasharray={L} strokeDashoffset={L * (1 - draw)} />
		<path d={d} fill="none" stroke={v.hot} strokeWidth={w} strokeDasharray={L} strokeDashoffset={L * (1 - draw)} />
	</g>;
	const tr = 1.6 * Math.sin(T * 37) * Math.sin(T * 6.3);
	// hair standing on end: a jagged crown of strands
	const spikes = Array.from({length: 23}, (_, i) => { const a = lerp(-172, -8, i / 22) * Math.PI / 180, r0 = 150, r1 = 190 + 60 * rnd(i, 2) + 30 * Math.sin(i * 1.7); return [Math.cos(a) * r0, Math.sin(a) * r0 - 14, Math.cos(a + 0.03 * Math.sin(T * 9 + i)) * r1, Math.sin(a) * r1 - 14] as const; });
	const hair = 'M-118,-30 ' + spikes.map(([x0, y0, x1, y1], i) => `L${x1.toFixed(1)},${y1.toFixed(1)} L${(spikes[i + 1] ? (x0 + spikes[i + 1][0]) / 2 : 118).toFixed(1)},${(spikes[i + 1] ? (y0 + spikes[i + 1][1]) / 2 : -30).toFixed(1)}`).join(' ') + ' Z';
	// one finger: a tapered, slightly curled capsule from (bx,by) up to (tx,ty)
	const fing = (bx: number, by: number, tx: number, ty: number, w: number, curl: number) => { const mx = (bx + tx) / 2 + curl, my = (by + ty) / 2; const dx = tx - bx, dy = ty - by, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L; const w0 = w / 2, w1 = w * 0.42; return `M${bx + nx * w0},${by + ny * w0} Q${mx + nx * w0},${my + ny * w0} ${tx + nx * w1},${ty + ny * w1} A${w1},${w1} 0 0,0 ${tx - nx * w1},${ty - ny * w1} Q${mx - nx * w0},${my - ny * w0} ${bx - nx * w0},${by - ny * w0} Z`; };
	const fingers = (s: 1 | -1) => [0, 1, 2, 3].map((i) => { const bx = s * (14 + i * 27), by = 150 + i * 6, tx = s * (6 + i * 30) + tr, ty = [18, 4, 10, 30][i] + tr; return fing(bx, by, tx, ty, 28 - i * 1.5, s * (6 - i * 2)); });
	return <g>
		{/* neck and shoulders, hunched up */}
		<path d="M-60,120 C-62,200 -70,240 -120,270 C-230,300 -330,330 -420,420 L-460,700 L460,700 L420,420 C330,330 230,300 120,270 C70,240 62,200 60,120 Z" fill="#07090d" opacity={draw} />
		{neon('M-60,120 C-62,200 -70,240 -120,270 C-230,300 -330,330 -420,420 M60,120 C62,200 70,240 120,270 C230,300 330,330 420,420', 3)}
		<path d={hair} fill="#081018" opacity={draw} />
		{neon(hair, 2.2)}
		<path d={FRONT} fill="#0a0d14" opacity={draw} />
		{neon(FRONT, 3.2)}
		{/* brows pulled up and together */}
		<g opacity={draw}>{[1, -1].map((s) => <path key={s} d={`M${s * 14},-56 C${s * 30},-74 ${s * 56},-74 ${s * 76},-62`} stroke={v.hot} strokeWidth={3} fill="none" />)}</g>
		{/* eyes: snap wide open, tiny pupils */}
		{[1, -1].map((s) => <g key={s} transform={`translate(${s * 46},-18)`}>
			<path d={`M-30,0 Q0,${lerp(4, -22, eyes)} 30,0 Q0,${lerp(4, 22, eyes)} -30,0 Z`} fill="#fff" opacity={0.25 + 0.75 * eyes} />
			<path d="M-30,0 Q0,6 30,0" stroke="#fff" strokeWidth={2.6} fill="none" opacity={draw * (1 - eyes)} />
			<circle cx={tr * 0.6} cy={0} r={4.5 * eyes} fill="#05080c" />
			<ellipse rx={64} ry={30} fill={c} opacity={0.7 * eyes} filter="url(#gM)" />
		</g>)}
		<path d="M-6,36 C-2,44 4,44 8,36" stroke={v.hot} strokeWidth={2} fill="none" opacity={draw} />
		{/* both hands clamped over the mouth, trembling */}
		<g opacity={hands} transform={`translate(0,${120 * (1 - out3(hands))})`}>
			{[1, -1].map((s) => <g key={s}>
				{/* palm and wrist */}
				<path d={`M${s * 4},146 C${s * 2},200 ${s * 20},250 ${s * 60},290 L${s * 120},420 L${s * 230},420 C${s * 200},330 ${s * 150},230 ${s * 130},170 C${s * 100},150 ${s * 40},140 ${s * 4},146 Z`} fill="#0b1018" stroke={v.hot} strokeWidth={2.6} />
				{/* thumb along the jaw */}
				<path d={fing(s * 128, 200, s * 116 + tr, 70, 30, s * 22)} fill="#0b1018" stroke={v.hot} strokeWidth={2.6} />
				{fingers(s as 1 | -1).slice().reverse().map((d, i) => <path key={i} d={d} fill="#0b1018" stroke={v.hot} strokeWidth={2.6} />)}
				{/* knuckle creases */}
				{[0, 1, 2, 3].map((i) => <path key={'k' + i} d={`M${s * (8 + i * 28) - 9},${92 + i * 3} q9,-5 18,0`} stroke={v.hot} strokeWidth={1.4} fill="none" opacity={0.6} />)}
			</g>)}
		</g>
		{/* a cold sweat bead */}
		<path d={`M-96,${-60 + ((T * 30) % 80)} c6,10 10,16 0,22 c-10,-6 -6,-12 0,-22 Z`} fill={v.hot} opacity={0.9 * eyes} />
	</g>;
};

/** the eyes in the dark: they open one by one and look at the figure */
const WatchingEyes: React.FC<{T: number; v: Voice; u: number; cx: number; cy: number}> = ({T, v, u, cx, cy}) => (
	<g>
		{Array.from({length: 22}, (_, i) => {
			const x = 860 + rnd(i, 11) * 1040, y = 60 + rnd(i, 12) * 960;
			if (Math.hypot(x - cx, y - cy) < 380) return null;
			const open = out3((u - i * 0.035) * 3) * (0.85 + 0.15 * Math.sin(T * 2 + i)), blink = (Math.sin(T * 0.9 + i * 3.3) > 0.985) ? 0.1 : 1;
			const s = 0.6 + 0.9 * rnd(i, 13), ang = Math.atan2(cy - y, cx - x), op = open * blink;
			if (open <= 0.01) return null;
			return <g key={i} transform={`translate(${x},${y}) scale(${s})`} opacity={0.85}>
				<path d={`M-40,0 Q0,${-26 * op} 40,0 Q0,${26 * op} -40,0 Z`} fill="#02080b" stroke={v.col} strokeWidth={2.4} />
				<circle cx={Math.cos(ang) * 10 * op} cy={Math.sin(ang) * 6 * op} r={10 * op} fill={v.hot} />
				<circle cx={Math.cos(ang) * 10 * op} cy={Math.sin(ang) * 6 * op} r={4 * op} fill="#000" />
				<ellipse rx={60} ry={30} fill={v.col} opacity={0.25 * op} filter="url(#gM)" />
			</g>;
		})}
	</g>
);

/** ice cracks running across the frame from the halo */
const IceCracks: React.FC<{v: Voice; u: number; cx: number; cy: number}> = ({v, u, cx, cy}) => (
	<g>{Array.from({length: 7}, (_, i) => {
		const a = lerp(150, 330, rnd(i, 21)) * Math.PI / 180;
		const pts: [number, number][] = [[cx + Math.cos(a) * 330, cy + Math.sin(a) * 330]];
		for (let k = 1; k < 9; k++) { const p = pts[k - 1], aa = a + (rnd(i * 9 + k, 22) - 0.5) * 0.9; pts.push([p[0] + Math.cos(aa) * 70, p[1] + Math.sin(aa) * 70]); }
		const d = 'M' + pts.map((p) => p.map((n) => n.toFixed(1)).join(',')).join(' L'), len = 700;
		return <g key={i}><path d={d} stroke={v.col} strokeWidth={8} fill="none" opacity={0.35} filter="url(#gM)" strokeDasharray={len} strokeDashoffset={len * (1 - out3(u - i * 0.06))} /><path d={d} stroke={v.hot} strokeWidth={2} fill="none" strokeDasharray={len} strokeDashoffset={len * (1 - out3(u - i * 0.06))} /></g>;
	})}</g>
);

// ---------------------------------------------------------------- 爱: profile, hair into red threads
const PROFILE = 'M0,-235 C70,-232 118,-196 128,-140 C131,-122 130,-110 136,-100 C140,-90 142,-82 146,-72 C156,-50 170,-30 174,-18 C176,-10 168,-4 156,-4 C152,-4 152,2 156,8 C160,13 158,18 150,20 C156,24 156,32 148,38 C142,42 142,50 146,58 C150,74 138,92 112,98 C86,104 64,108 56,128 C50,170 52,220 62,280 C90,322 190,350 280,384 C330,410 352,480 360,620 L-380,620 C-372,480 -340,400 -260,370 C-170,340 -110,320 -96,280 C-84,220 -80,140 -92,80 C-130,40 -168,-20 -165,-90 C-160,-180 -90,-238 0,-235 Z';
const Love: React.FC<{T: number; v: Voice; u: number; eyes: number; wind: number}> = ({T, v, u, eyes, wind}) => {
	const c = v.col, draw = out3(u), L = 3400;
	const neon = (d: string, w = 3) => <>
		<path d={d} fill="none" stroke={c} strokeWidth={w * 3.5} opacity={0.5} filter="url(#gM)" strokeDasharray={L} strokeDashoffset={L * (1 - draw)} />
		<path d={d} fill="none" stroke={v.hot} strokeWidth={w} strokeDasharray={L} strokeDashoffset={L * (1 - draw)} />
	</>;
	// streaming hair: strands leave the back of the head and flow back (to +x, mirrored to the right of frame) in the wind
	const strands = Array.from({length: 22}, (_, i) => {
		const k = i / 21, y0 = -230 + k * 300, x0 = -150 - 40 * Math.sin(k * 3);
		const ln = (300 + 260 * rnd(i, 31)) * (0.4 + 0.6 * wind), ph = T * 2.4 - i * 0.35;
		const w1 = Math.sin(ph) * 70 * wind, w2 = Math.sin(ph + 1.7) * 90 * wind, drop = 40 + 160 * k;
		return `M${x0 + 110},${y0} C${x0 - ln * 0.25},${y0 - 30 + w1} ${x0 - ln * 0.6},${y0 + drop * 0.5 - w2} ${x0 - ln},${y0 + drop + w1}`;
	});
	return <g>
		<path d={PROFILE} fill="#0d0710" opacity={draw} />
		{neon(PROFILE, 3.2)}
		{/* hair mass on the head */}
		<path d="M124,-160 C112,-214 62,-252 -6,-252 C-110,-252 -190,-180 -194,-80 C-196,-20 -180,40 -150,80 C-150,20 -120,-60 -80,-110 C-40,-160 40,-180 124,-160 Z" fill="#14081a" opacity={draw} />
		{neon('M124,-160 C112,-214 62,-252 -6,-252 C-110,-252 -190,-180 -194,-80 C-196,-20 -180,40 -150,80', 2.6)}
		{strands.map((d, i) => <g key={i}>
			{i % 3 === 0 && <path d={d} stroke={c} strokeWidth={9} fill="none" opacity={0.35 * draw} filter="url(#gM)" strokeDasharray={1200} strokeDashoffset={1200 * (1 - out3(u * 1.2 - i * 0.015))} />}
			<path d={d} stroke={i % 3 === 0 ? c : v.hot} strokeWidth={i % 3 === 0 ? 3 : 1.3 + rnd(i, 3)} fill="none" opacity={(i % 3 === 0 ? 1 : 0.6) * draw} strokeDasharray={1200} strokeDashoffset={1200 * (1 - out3(u * 1.2 - i * 0.015))} />
		</g>)}
		{/* a hairpin with a dangling bead */}
		<g opacity={draw} transform="translate(-70,-200) rotate(-30)"><line x1={0} y1={0} x2={120} y2={0} stroke="url(#goldG)" strokeWidth={5} /><circle cx={0} cy={0} r={9} fill={c} /><line x1={6} y1={0} x2={6 + 8 * Math.sin(T * 2)} y2={60} stroke={GOLD} strokeWidth={1.4} /><circle cx={6 + 8 * Math.sin(T * 2)} cy={64} r={5} fill={c} /></g>
		{/* eye: closed, then opening soft and bright */}
		<g transform="translate(108,-96)">
			<path d={`M-22,0 Q0,${lerp(6, -10, eyes)} 22,2 Q0,${lerp(6, 9, eyes)} -22,0 Z`} fill="#fff" opacity={eyes} />
			<path d="M-22,0 Q0,7 22,2" stroke="#fff" strokeWidth={2.6} fill="none" opacity={draw} />
			{[-14, -4, 6, 16].map((lx) => <line key={lx} x1={lx} y1={4} x2={lx * 1.15 - 4} y2={14} stroke="#fff" strokeWidth={1.6} opacity={draw * (1 - eyes)} />)}
			<ellipse rx={56} ry={26} fill={c} opacity={0.75 * eyes} filter="url(#gM)" />
		</g>
		<path d="M84,-124 C100,-130 120,-128 134,-118" stroke={v.hot} strokeWidth={2.4} fill="none" opacity={draw} />
		<path d="M146,30 C152,32 154,34 150,38" stroke={c} strokeWidth={3} fill="none" opacity={draw} />
		{/* the heart glowing in the chest */}
		<g transform="translate(90,360)" opacity={draw}>
			<circle r={90} fill="url(#hotG)" opacity={0.55 + 0.45 * Math.sin(T * Math.PI * 2 / BEAT / 2) ** 2} />
			<path d="M0,26 C-40,0 -40,-36 -14,-36 C-4,-36 0,-26 0,-20 C0,-26 4,-36 14,-36 C40,-36 40,0 0,26 Z" fill={c} />
		</g>
	</g>;
};

/** a peony blooming behind the head */
const Peony: React.FC<{T: number; v: Voice; u: number; x: number; y: number}> = ({T, v, u, x, y}) => {
	const b = outBack(u);
	if (u <= 0) return null;
	return <g transform={`translate(${x},${y}) rotate(${T * 4}) scale(${b})`} opacity={cl01(u * 2)}>
		{[[16, 520, 210], [14, 430, 180], [12, 330, 150], [10, 220, 110]].map(([n, r, w], ring) => Array.from({length: n}, (_, i) => {
			const a = (i / n) * 360 + ring * 13;
			return <path key={ring + '-' + i} transform={`rotate(${a})`} d={`M0,0 C${-w * 0.6},${-r * 0.35} ${-w},${-r * 0.8} ${-w * 0.35},${-r} C${-w * 0.12},${-r * 1.06} ${w * 0.12},${-r * 0.94} 0,${-r * 0.9} C${w * 0.12},${-r * 0.94} ${w * 0.35},${-r * 1.06} ${w * 0.35},${-r} C${w},${-r * 0.8} ${w * 0.6},${-r * 0.35} 0,0 Z`} fill={v.col} fillOpacity={0.05 + ring * 0.025} stroke={ring % 2 ? v.hot : v.col} strokeWidth={2.2} opacity={0.75} />;
		}))}
	</g>;
};

/** red threads from the figure out across the frame (the hair turned thread) */
const Threads: React.FC<{T: number; v: Voice; u: number; ox: number; oy: number}> = ({T, v, u, ox, oy}) => (
	<g>{Array.from({length: 9}, (_, i) => {
		const ex = i < 5 ? 980 + i * 190 : 1960, ey = i < 5 ? -40 : 120 + (i - 5) * 230, w = Math.sin(T * 1.4 + i) * 60;
		const d = `M${ox},${oy + (i - 4) * 24} C${ox + 160},${oy - 260 + w} ${ex - 200},${ey + 260 - w} ${ex},${ey}`, len = 1800;
		return <g key={i}>
			<path d={d} stroke={v.col} strokeWidth={6} fill="none" opacity={0.3} filter="url(#gM)" strokeDasharray={len} strokeDashoffset={len * (1 - out3(u - i * 0.05))} />
			<path d={d} stroke={v.col} strokeWidth={2.2} fill="none" strokeDasharray={len} strokeDashoffset={len * (1 - out3(u - i * 0.05))} />
		</g>;
	})}</g>
);

// ---------------------------------------------------------------- shared bits
const BlurText: React.FC<{x: number; y: number; text: string; size: number; u: number; out?: number; weight?: number; col?: string; spacing?: string; anchor?: 'start' | 'middle'; id: string}> = ({x, y, text, size, u, out = 0, weight = 900, col = '#fff', spacing = '0.04em', anchor = 'start', id}) => {
	const b = 14 * (1 - out3(u)) + 18 * ease(out), o = cl01(u * 1.6) * (1 - ease(out));
	if (o <= 0.001) return null;
	return <g>
		<filter id={id} x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation={`${(b * 2.2).toFixed(2)} ${(b * 0.4).toFixed(2)}`} /></filter>
		<text x={x} y={y} textAnchor={anchor} style={{fontFamily: SERIF, fontWeight: weight, fontSize: size, letterSpacing: spacing}} fill={col} opacity={o * 0.45} filter="url(#gM)">{text}</text>
		<text x={x - 60 * (1 - out3(u))} y={y} textAnchor={anchor} style={{fontFamily: SERIF, fontWeight: weight, fontSize: size, letterSpacing: spacing}} fill={col} opacity={o} filter={b > 0.2 ? `url(#${id})` : undefined}>{text}</text>
	</g>;
};
const Icon: React.FC<{x: number; y: number; ch: string; col: string; o: number; s?: number}> = ({x, y, ch, col, o, s = 1}) => (
	<g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
		<circle r={46} fill={col} opacity={0.15} filter="url(#gM)" />
		<path d="M0,-40 A40,40 0 1,1 -0.1,-40 Z M0,-24 A24,24 0 1,0 0.1,-24 Z" fill={col} fillOpacity={0.18} fillRule="evenodd" stroke={col} strokeWidth={2} />
		<text y={12} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 34}} fill="#fff">{ch}</text>
	</g>
);

// ---------------------------------------------------------------- one voice
const VoiceScene: React.FC<{T: number; v: Voice}> = ({T, v}) => {
	const t = T - v.t0, rv = v.rv - v.t0, len = v.t1 - v.t0;
	const fear = v.ch === '惧';
	const cx = 1400, cy = fear ? 500 : 470;
	const cap = fade(t, 0.25, 0.45), quote = fade(t, 0.55, 0.7), outQ = fade(t, rv - 0.3, 0.28);
	const orb = fade(t, 0, 0.4) * (1 - fade(t, rv - 0.1, 0.2));
	const lit = cl01((t - rv + 0.05) / 0.5);
	const rise = cl01((t - rv) / 0.7), eyes = fear ? ease((t - rv - 0.75) / 0.12) : ease((t - rv - 1.0) / 0.5);
	const hands = fear ? cl01((t - rv - 0.35) / 0.4) : 0;
	const world = cl01((t - rv - 0.2) / 2.2);
	const flash = Math.max(0, 1 - Math.abs(t - rv) / 0.18), flare = Math.max(0, 1 - Math.abs(t - rv - (fear ? 0.8 : 1.1)) / 0.22);
	const name = cl01((t - rv - 0.35) / 0.35), sub = fade(t, rv + 0.2, 0.35), say = fade(t, rv + 1.3, 0.45), tags = fade(t, rv + 1.7, 0.45);
	const leave = fade(t, len - 0.35, 0.35);
	const shake = fear && t > rv + 0.7 ? 4 * Math.sin(T * 41) * Math.sin(T * 7.3) * (1 - cl01((t - rv - 0.7) / 3)) : 0;
	const push = 1 + 0.06 * ease(t / len);
	const beatPulse = Math.max(0, 1 - ((T - 0.07) % BEAT) / 0.18);
	const sweep = cl01((t - rv - 0.75) / 0.6);
	return (
		<svg width={W} height={H}>
			<Defs col={v.col} deep={v.deep} hot={v.hot} />
			<g opacity={1 - leave} transform={`translate(${shake},${shake * 0.6})`}>
				<World T={T} v={v} lit={lit} />
				{/* the world behind the figure */}
				{fear ? <>
					<WatchingEyes T={T} v={v} u={world} cx={cx} cy={cy} />
					<IceCracks v={v} u={world * 1.3} cx={cx} cy={cy} />
				</> : <>
					<Peony T={T} v={v} u={cl01((t - rv - 0.1) / 1.0)} x={cx + 40} y={cy - 40} />
					{lit > 0 && [0, 1, 2].map((k) => { const ph = ((T - v.rv) / (BEAT * 2) + k / 3) % 1; return <circle key={k} cx={cx - 30} cy={cy + 300} r={60 + 700 * ph} fill="none" stroke={v.col} strokeWidth={3 * (1 - ph)} opacity={0.6 * (1 - ph) * lit} />; })}
				</>}
				<g transform={`translate(${cx},${cy}) scale(${push}) translate(${-cx},${-cy})`}>
					<Bi T={T} v={v} x={cx} y={cy} s={lerp(0.8, 1, out3(t / 0.6)) * (1 + 0.04 * beatPulse * lit)} crack={fear ? cl01((t - rv) / 1.2) : 0} bind={fear ? 0 : cl01((t - rv - 0.3) / 1.6)} />
					{/* the orb: the moment in the glass, with the voice's own pattern */}
					<g opacity={orb}>
						<circle cx={cx} cy={cy} r={248} fill="url(#orbG)" />
						{fear ? Array.from({length: 7}, (_, i) => { const a = i * 0.9; return <path key={i} d={`M${cx},${cy} L${cx + Math.cos(a) * 120},${cy + Math.sin(a) * 120} L${cx + Math.cos(a + 0.2) * 240},${cy + Math.sin(a + 0.2) * 240}`} stroke={v.hot} strokeWidth={1.2} fill="none" opacity={0.35} />; })
							: Array.from({length: 10}, (_, i) => <ellipse key={i} cx={cx} cy={cy - 120} rx={40} ry={110} transform={`rotate(${i * 36 + T * 8},${cx},${cy})`} fill="none" stroke={v.hot} strokeWidth={1.2} opacity={0.25} />)}
						<g transform={`translate(${cx},${cy})`}>
							{fear ? <g>
								<rect x={-70} y={-130} width={140} height={250} rx={20} fill="none" stroke={v.hot} strokeWidth={4} />
								<rect x={-34} y={-70} width={66} height={30} rx={10} fill="none" stroke={v.hot} strokeWidth={2.4} />
								<text x={-1} y={-49} textAnchor="middle" style={{fontFamily: SERIF, fontSize: 18, fontWeight: 700}} fill={v.hot}>在吗？</text>
								<rect x={20} y={78} width={38} height={26} rx={9} fill={v.col} opacity={0.5 + 0.5 * Math.sin(T * 5) ** 2} />
								<g transform={`translate(${62 + 3 * Math.sin(T * 33)},${150 + 3 * Math.sin(T * 29)})`}><path d="M-22,10 C-26,-20 -14,-40 4,-40 C20,-38 26,-16 22,12 C18,40 -18,40 -22,10 Z" fill="#05080c" stroke={v.hot} strokeWidth={3} /></g>
							</g> : <g>
								<path d="M-60,-30 L-48,110 C-46,128 46,128 48,110 L60,-30 Z" fill="none" stroke={v.hot} strokeWidth={4} />
								<ellipse cx={0} cy={-30} rx={60} ry={13} fill="none" stroke={v.hot} strokeWidth={3} />
								<path d="M60,0 C100,0 100,70 52,70" stroke={v.hot} strokeWidth={4} fill="none" />
								{[0, 1, 2].map((i) => { const ph = (T * 0.55 + i / 3) % 1; return <path key={i} d={`M${-26 + i * 26},${-50 - ph * 90} c-12,-18 12,-30 0,-48`} stroke={v.hot} strokeWidth={3} fill="none" opacity={Math.sin(Math.PI * ph)} />; })}
								<path d="M-120,140 C-40,120 60,124 130,150" stroke={v.col} strokeWidth={10} fill="none" />
							</g>}
						</g>
					</g>
					{/* the voice itself, huge and cropped */}
					{rise > 0 && <g transform={`translate(${cx + (fear ? 0 : 30)},${cy + lerp(120, 0, out3(rise))}) scale(${(fear ? 1.85 : 1.45) * lerp(0.8, 1, outBack(rise))}) ${fear ? '' : 'scale(-1,1)'}`} opacity={cl01(rise * 3)}>
						{fear ? <Fear T={T} v={v} u={rise} eyes={eyes} hands={hands} /> : <Love T={T} v={v} u={rise} eyes={eyes} wind={cl01((t - rv) / 1.5)} />}
					</g>}
				</g>
				{!fear && <Threads T={T} v={v} u={cl01((t - rv - 0.4) / 1.6)} ox={cx + 120} oy={cy - 60} />}
				{/* lightning */}
				{lit > 0 && (fear ? [[[cx - 340, cy - 120], [880, 140]], [[cx + 300, cy + 200], [1900, 460]], [[cx - 280, cy + 240], [1000, 900]]] : [[[cx - 330, cy - 60], [940, 300]], [[cx + 320, cy - 200], [1880, 120]]]).map(([a, b], i) => <Bolt key={i} a={a as [number, number]} b={b as [number, number]} seed={i + v.n * 10} T={T} col={v.col} o={lit * (0.5 + 0.5 * Math.sin(T * 3 + i))} />)}
				{/* particles: frost or petals */}
				{Array.from({length: 40}, (_, i) => { const sp = 0.06 + 0.05 * rnd(i, 1), ph = (T * sp + rnd(i, 2)) % 1; const x = 820 + rnd(i, 3) * 1100 + 50 * Math.sin(T * 0.8 + i); if (fear) { const y = -30 + ph * 1140; return <path key={i} transform={`translate(${x},${y}) rotate(${T * 50 + i * 30}) scale(${0.6 + rnd(i, 4)})`} d="M-7,0 L7,0 M0,-7 L0,7 M-5,-5 L5,5 M-5,5 L5,-5" stroke={v.hot} strokeWidth={1.6} opacity={0.6 * Math.sin(Math.PI * ph) * (0.3 + 0.7 * lit)} />; } const y = 1100 - ph * 1180; return <ellipse key={i} cx={x} cy={y} rx={5 + 5 * rnd(i, 5)} ry={10 + 7 * rnd(i, 6)} transform={`rotate(${T * 70 + i * 40},${x},${y})`} fill={v.col} opacity={0.6 * Math.sin(Math.PI * ph) * (0.3 + 0.7 * lit)} />; })}
				{/* left: the moment and the line */}
				<BlurText id={`c${v.n}`} x={150} y={470} text={v.when} size={36} weight={600} col="#cfc8de" spacing="0.14em" u={cap} out={outQ} />
				<BlurText id={`q${v.n}`} x={130} y={590} text={v.line} size={88} u={quote} out={outQ} />
				{/* left: the name, wiping in with a streak */}
				<BlurText id={`s${v.n}`} x={150} y={330} text={`七情之${NUM[v.n]}，它叫`} size={38} weight={700} col="#efe9fb" spacing="0.16em" u={sub} />
				{name > 0 && <g>
					<clipPath id={`sw${v.n}`}><rect x={60 + 620 * sweep} y={340} width={110} height={360} transform="skewX(-18)" /></clipPath>
					<g transform={`translate(${-120 * (1 - out3(name))},0)`} opacity={cl01(name * 2.5)}>
						<text x={140} y={640} style={{fontFamily: SERIF, fontWeight: 900, fontSize: 330}} fill={v.col} opacity={0.7} filter="url(#gL)">{v.ch}</text>
						<text x={140} y={640} style={{fontFamily: SERIF, fontWeight: 900, fontSize: 330}} fill="url(#nameG)">{v.ch}</text>
						<text x={140} y={640} style={{fontFamily: SERIF, fontWeight: 900, fontSize: 330}} fill="#fff" clipPath={`url(#sw${v.n})`}>{v.ch}</text>
						<text x={510} y={470} style={{fontFamily: SERIF, fontWeight: 600, fontSize: 52, fontStyle: 'italic', letterSpacing: '0.1em'}} fill="#fff">{v.py}</text>
						<rect x={492} y={410} width={6} height={230} fill="url(#goldG)" />
						<text x={510} y={540} style={{fontFamily: SERIF, fontWeight: 600, fontSize: 30, letterSpacing: '0.24em'}} fill={GOLD}>七情 · 之{NUM[v.n]}</text>
					</g>
					{/* the streak across the name */}
					<ellipse cx={lerp(-200, 1100, ease(name))} cy={520} rx={500} ry={10} fill="#fff" opacity={0.85 * Math.sin(Math.PI * cl01(name))} filter="url(#gS)" />
				</g>}
				<BlurText id={`y${v.n}`} x={150} y={760} text={v.say} size={46} weight={800} col="#ffffff" spacing="0.06em" u={say} />
				{tags > 0 && <g opacity={tags} transform="translate(150,840)">
					{[['出处', '《礼记·礼运》'], ['象征', v.sym]].map(([k, val], i) => <g key={k} transform={`translate(${i * 340},0)`}>
						<rect x={0} y={-30} width={64} height={40} rx={4} fill={v.col} />
						<text x={32} y={-2} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 700, fontSize: 22}} fill="#070509">{k}</text>
						<text x={80} y={-1} style={{fontFamily: SERIF, fontWeight: 600, fontSize: 28}} fill="#e8e2f4">{val}</text>
					</g>)}
				</g>}
			</g>
			{flash > 0 && <>
				<rect width={W} height={H} fill={v.hot} opacity={0.35 * flash} />
				<ellipse cx={cx} cy={cy} rx={1100 * flash} ry={60} fill="#fff" opacity={0.8 * flash} filter="url(#gL)" />
			</>}
			{flare > 0 && <><ellipse cx={cx} cy={cy - (fear ? 30 : 140)} rx={900 * flare} ry={8} fill="#fff" opacity={0.9 * flare} filter="url(#gS)" /><circle cx={cx} cy={cy - (fear ? 30 : 140)} r={140 * flare} fill="url(#hotG)" opacity={0.8 * flare} /></>}
		</svg>
	);
};

// ---------------------------------------------------------------- intro / outro
const Intro: React.FC<{T: number}> = ({T}) => {
	const leave = fade(T, V1 - 0.3, 0.3);
	return (
		<svg width={W} height={H}>
			<Defs col="#b9b0ff" deep="#141026" hot="#ece8ff" />
			<g opacity={1 - leave}>
				<rect width={W} height={H} fill="url(#bgG)" />
				<BlurText id="i1" x={960} y={360} text="两千年前，《礼记》写道：" size={40} weight={600} col="#cfc8de" spacing="0.14em" anchor="middle" u={fade(T, 0.25, 0.6)} />
				<BlurText id="i2" x={960} y={480} text="人心里，天生住着七个声音。" size={84} anchor="middle" u={fade(T, 1.2, 0.8)} />
				{SEVEN.map((s, i) => { const o = cl01((T - (2.6 + i * BEAT * 0.5)) / 0.18); return <Icon key={s.ch} x={960 + (i - 3) * 132} y={650} ch={s.ch} col={s.col} o={o} s={lerp(1.7, 1, outBack(o))} />; })}
				<BlurText id="i3" x={960} y={800} text="七者，弗学而能" size={34} weight={600} col={GOLD} spacing="0.5em" anchor="middle" u={fade(T, 4.6, 0.6)} />
			</g>
		</svg>
	);
};
const Outro: React.FC<{T: number}> = ({T}) => {
	const t = T - OUT, q = fade(t, 0.15, 0.5), qOut = fade(t, 1.75, 0.3), title = cl01((t - 2.04) / 0.4);
	return (
		<svg width={W} height={H}>
			<Defs col={GOLD} deep="#1c1408" hot="#fff2c8" />
			<rect width={W} height={H} fill="url(#bgG)" />
			<g opacity={1 - qOut}>
				<BlurText id="o1" x={960} y={450} text="你心里，哪个声音最大？" size={78} anchor="middle" u={q} />
				{SEVEN.map((s, i) => <Icon key={s.ch} x={960 + (i - 3) * 132} y={620} ch={s.ch} col={s.col} o={fade(t, 0.5 + i * 0.07, 0.2)} />)}
			</g>
			{title > 0 && <g opacity={title * (1 - fade(t, 5.6, 0.5))} transform={`translate(960,540) scale(${lerp(1.3, 1, out3(title))}) translate(-960,-540)`}>
				<g transform={`translate(960,520) rotate(${T * 10})`}>{SEVEN.map((s, i) => { const a = i / 7 * Math.PI * 2; return <circle key={s.ch} cx={Math.cos(a) * 320} cy={Math.sin(a) * 320} r={13} fill={s.col} filter="url(#gS)" />; })}<circle r={320} fill="none" stroke="url(#goldG)" strokeWidth={2} opacity={0.6} /></g>
				<text x={960} y={590} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 230, letterSpacing: '0.12em'}} fill="#fff2d0" opacity={0.7} filter="url(#gL)">七情</text>
				<text x={960} y={590} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 230, letterSpacing: '0.12em'}} fill="url(#goldG)">七情</text>
				<text x={960} y={680} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 600, fontSize: 34, letterSpacing: '0.9em'}} fill={GOLD}>喜怒哀惧爱恶欲</text>
				<ellipse cx={lerp(400, 1520, ease(title))} cy={520} rx={600} ry={9} fill="#fff" opacity={0.8 * Math.sin(Math.PI * title)} filter="url(#gS)" />
			</g>}
		</svg>
	);
};

export const QiQing4: React.FC = () => {
	const T = useCurrentFrame() / FPS;
	const node = T < V1 ? <Intro T={T} /> : T < V2 ? <VoiceScene T={T} v={VOICES[0]} /> : T < OUT ? <VoiceScene T={T} v={VOICES[1]} /> : <Outro T={T} />;
	return <AbsoluteFill style={{background: '#030205'}}>
		{node}
		<div style={{position: 'absolute', right: 56, bottom: 40, fontFamily: SERIF, fontSize: 20, letterSpacing: '0.3em', color: 'rgba(230,224,245,0.4)'}}>VIBE知识大赏 · 七情</div>
	</AbsoluteFill>;
};

registerRoot(() => <Composition id="QQ4" component={QiQing4} durationInFrames={Math.round(QQ4_END * FPS)} fps={FPS} width={W} height={H} />);
