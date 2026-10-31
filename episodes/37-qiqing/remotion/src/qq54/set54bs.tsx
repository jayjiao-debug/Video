import React from 'react';
import {P, f1, rnd, Pal} from './cao54b';
/* ep54 look B · set kit for the key scenes K4 / K5 / K6 / K8 (the set builder's own file; cao54b / npc54b are imported read-only).
   Silhouette parts are drawn in one fill (the caller sets fill and applies the rim filter in screen space). Units are cm unless
   noted, facing +x, ground at y = 0; place them with <g transform="translate(x,y) scale(k)">. */
export const SIL = '#140D0A', KEY = '#F3DDB4', RIMW = '#FFB070', ACC = '#8FD0DC', COOL = '#9FB8B6';
export const SERIF = "'Noto Serif CJK SC',serif";
export const PAL: Pal = {skin: '#C38D64', skinS: '#9C6848', skinH: '#E8BC8E', hair: '#15100E', robe: '#262A31', robeS: '#16181C', robeH: '#575B62', trim: '#5C2E24',
	metal: '#3C3B3A', metalS: '#1B1A1A', metalH: '#9A968C', lace: '#6E2C22', under: '#55302A', underS: '#2E1915', cape: '#2C1716', capeS: '#170B0B', gold: '#C09A52', line: '#2A1810'};
export const pts = (a: P[]) => a.map((p) => f1(p[0]) + ',' + f1(p[1])).join(' ');
/** a limb outline through joints with half-widths per joint, plus round joints */
export const limb = (j: P[], w: number[]) => { const L: P[] = [], R: P[] = [];
	j.forEach((p, i) => { const q = j[Math.min(i + 1, j.length - 1)], o = j[Math.max(i - 1, 0)], dx = q[0] - o[0], dy = q[1] - o[1], d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d;
		L.push([p[0] + nx * w[i], p[1] + ny * w[i]]); R.push([p[0] - nx * w[i], p[1] - ny * w[i]]); });
	return 'M' + pts(L.concat(R.reverse())).replace(/ /g, ' L') + ' Z'; };
export const Limb: React.FC<{j: P[]; w: number[]; fill?: string}> = ({j, w, fill}) => <g fill={fill}>
	<path d={limb(j, w)} />{j.slice(1, -1).map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={w[i + 1]} />)}</g>;

/* ---------- the horse (Han type: arched neck, small head, cropped mane, knotted tail), cm, facing +x, hooves at 0 ---------- */
const HBODY = 'M38,-142 C22,-135 2,-131 -18,-132 C-36,-133 -52,-140 -66,-135 C-74,-132 -80,-124 -81,-112 C-82,-100 -76,-90 -66,-86 L-48,-82 C-30,-80 -10,-79 10,-80 C26,-80 40,-79 52,-82 C62,-86 70,-95 72,-106 C74,-116 79,-130 88,-145 C94,-154 99,-159 103,-162 C109,-158 117,-149 123,-139 C126,-135 130,-131 134,-132 C138,-134 139,-139 136,-145 C129,-158 119,-172 109,-184 C105,-188 101,-191 96,-191 C84,-185 66,-167 52,-153 C46,-148 42,-145 38,-142 Z';
type Leg = {j: P[]; w: number[]; hoof: number};
const legs = (pose: number): {nf: Leg; ff: Leg; nh: Leg; fh: Leg} => {
	const plantF = (dx: number): Leg => ({j: [[52 + dx, -96], [55 + dx, -66], [57 + dx, -44], [57.5 + dx, -15], [61 + dx, -5]], w: [11, 7.5, 5.6, 4.6, 3.8], hoof: 0});
	const liftF = (dx: number): Leg => ({j: [[50 + dx, -96], [56 + dx, -70], [66 + dx, -50], [60 + dx, -22], [63 + dx, -13]], w: [11, 7.5, 5.6, 4.6, 3.8], hoof: 60});
	const plantH = (dx: number): Leg => ({j: [[-40 + dx, -104], [-46 + dx, -76], [-55 + dx, -50], [-51 + dx, -15], [-47 + dx, -5]], w: [15, 10, 5.4, 4.6, 3.8], hoof: 0});
	const backH = (dx: number): Leg => ({j: [[-46 + dx, -104], [-56 + dx, -76], [-68 + dx, -52], [-75 + dx, -18], [-73 + dx, -6]], w: [15, 10, 5.4, 4.6, 3.8], hoof: -14});
	return pose === 0 ? {nf: liftF(0), ff: plantF(-6), nh: plantH(0), fh: backH(-4)} : {nf: plantF(0), ff: liftF(-6), nh: backH(0), fh: plantH(-4)}; };
const Hoof: React.FC<{l: Leg}> = ({l}) => { const p = l.j[l.j.length - 1];
	return <g transform={`translate(${f1(p[0])},${f1(p[1])}) rotate(${l.hoof})`}><path d="M-4.6,-2.6 L4.4,-2.6 L7.4,5.2 L-5.2,5.2 Z" /></g>; };
const LegG: React.FC<{l: Leg; fill?: string}> = ({l, fill}) => <g fill={fill}><Limb j={l.j} w={l.w} /><Hoof l={l} />
	{/* the chestnut of the hock / the back of the knee: a small knob */}
	<circle cx={l.j[2][0] - (l.j[0][0] < 0 ? 3 : 0)} cy={l.j[2][1]} r={l.w[2] + 0.6} /></g>;
export const Horse: React.FC<{pose?: number; farFill?: string; tail?: 'knot' | 'free'; harness?: boolean}> = ({pose = 0, farFill = '#2A1E18', tail = 'knot', harness}) => { const L = legs(pose);
	return <g>
		<LegG l={L.ff} fill={farFill} /><LegG l={L.fh} fill={farFill} />
		<path d={HBODY} />
		{/* ears, forelock, the cropped mane with a tuft at the withers */}
		<path d="M93,-188 L90,-203 L98,-191 Z M98,-189 L99,-201 L103,-190 Z" />
		<path d="M100,-190 C106,-188 110,-184 111,-179 C106,-182 102,-184 98,-185 Z" />
		<path d="M96,-191 C84,-186 66,-169 50,-155 L46,-160 L48,-165 L44,-163 C58,-176 78,-192 96,-196 Z" />
		{tail === 'knot' ? <g><path d="M-68,-133 C-78,-138 -88,-134 -91,-124 C-94,-112 -91,-100 -88,-90 L-84,-91 C-86,-102 -88,-112 -86,-121 C-84,-127 -78,-130 -71,-128 Z" /><ellipse cx={-89} cy={-120} rx={5} ry={4.2} /></g>
			: <path d="M-70,-132 C-82,-132 -88,-122 -90,-106 C-92,-86 -88,-66 -92,-48 C-86,-56 -80,-64 -79,-80 C-78,-96 -78,-112 -72,-124 Z" />}
		<LegG l={L.nh} /><LegG l={L.nf} />
		{harness && <g>
			{/* the yoke (轭) on the neck before the withers, the breast strap, the bridle */}
			<path d="M44,-150 L50,-166 L56,-152 L60,-120 L56,-119 L52,-146 L48,-146 L44,-118 L40,-120 Z" />
			<path d="M54,-130 C66,-124 72,-110 72,-100" fill="none" strokeWidth={2.4} stroke="currentColor" />
			<path d="M101,-160 C110,-156 120,-146 128,-136 M106,-186 C112,-170 120,-156 128,-138" fill="none" strokeWidth={1.4} stroke="currentColor" />
		</g>}
	</g>; };
/** a rider seated on a Horse (same frame: saddle at x ≈ 0..10, y ≈ −140); kind: 'ji' carries a 戟 upright */
export const Rider: React.FC<{kind?: 'ji' | 'plain'}> = ({kind = 'plain'}) => <g>
	<path d="M-14,-138 C-16,-160 -10,-182 -4,-196 C0,-202 10,-202 14,-196 C18,-184 16,-160 14,-140 Z" />
	<path d={limb([[4, -136], [24, -114], [18, -84]], [9, 6.5, 5])} /><path d="M12,-86 L28,-84 L28,-78 L12,-79 Z" />
	<path d={limb([[8, -192], [22, -166], [40, -160]], [5.6, 4.6, 3.8])} /><circle cx={40} cy={-160} r={4} />
	<path d="M2,-198 L10,-198 L11,-206 L1,-206 Z" />
	<path d="M-4,-218 C-4,-226 2,-230 7,-230 C12,-230 15,-226 15,-221 L16,-216 C16,-212 14,-208 10,-207 L1,-206 C-2,-209 -4,-213 -4,-218 Z" />
	<path d="M-6,-219 C-6,-228 0,-233 8,-233 L14,-232 C16,-229 16,-226 15,-224 C10,-226 4,-226 -2,-222 Z M-6,-222 L-8,-236 L-1,-236 L1,-230 Z" />
	{kind === 'ji' && <g><rect x={38.6} y={-330} width={2.8} height={260} /><path d="M40,-350 C41.6,-342 42,-336 41.4,-330 L38.6,-330 C38,-336 38.4,-342 40,-350 Z" /><path d="M41.2,-322 L56,-319 C59,-318 60,-316 59,-314 L41.2,-317 Z" /></g>}
</g>;

/* ---------- the Han carriage (轺车 with a 伞盖), cm, facing +x, ground 0, axle at x = 0 ---------- */
export const Wheel: React.FC<{r?: number; n?: number; far?: boolean}> = ({r = 68, n = 22, far}) => <g>
	<circle cx={0} cy={-r} r={r - 2.5} fill="none" strokeWidth={5} stroke="currentColor" />
	{Array.from({length: n}, (_, i) => { const a = (i / n) * Math.PI * 2 + 0.1; return <line key={i} x1={Math.cos(a) * 8} y1={-r + Math.sin(a) * 8} x2={Math.cos(a) * (r - 4)} y2={-r + Math.sin(a) * (r - 4)} strokeWidth={far ? 1.6 : 1.9} stroke="currentColor" />; })}
	<circle cx={0} cy={-r} r={9.5} /><rect x={-16} y={-r - 3} width={32} height={6} />
</g>;
/** the imperial 轺车: two wheels, the box (舆) with its 轓 panels, the canopy (伞盖), the young emperor seated, the driver kneeling,
    the curved shaft (辀) rising to the yoke at x = yx, y = −150 */
export const Carriage: React.FC<{yx: number; farFill?: string}> = ({yx, farFill = '#2A1E18'}) => <g>
	<g color={farFill} fill={farFill} transform="translate(12,-6)"><Wheel far /></g>
	{/* the shaft and its pair: a rising curve to the yoke */}
	<path d={`M40,-84 C${yx * 0.45},-86 ${yx * 0.8},-104 ${yx},-148 L${yx + 3},-145 C${yx * 0.82 + 3},-100 ${yx * 0.46},-80 40,-78 Z`} />
	<path d={`M40,-86 C${yx * 0.45},-90 ${yx * 0.8},-108 ${yx + 10},-152 L${yx + 12},-150 C${yx * 0.82 + 6},-104 ${yx * 0.46},-84 40,-82 Z`} fill={farFill} />
	{/* box with rails, the 轓 boards over the wheel */}
	<path d="M-52,-74 L54,-74 L54,-112 L48,-112 L48,-80 L-46,-80 L-46,-108 L-52,-108 Z" />
	<path d="M-54,-82 L-14,-82 L-10,-100 L-58,-100 Z" />
	{[-36, -22, -8, 6, 20, 34].map((x) => <rect key={x} x={x} y={-108} width={2.2} height={28} />)}
	<rect x={-52} y={-112} width={106} height={4} />
	<path d="M48,-112 L54,-112 L56,-124 L50,-124 Z" />
	{/* the emperor, 15, seated: a slight figure in a tall 通天冠 slanting forward */}
	<path d="M-30,-104 C-32,-124 -28,-142 -22,-150 C-18,-154 -8,-154 -4,-150 C2,-140 4,-122 4,-104 Z" />
	<path d="M-4,-140 C4,-136 10,-128 12,-120 L8,-118 C4,-126 -2,-132 -8,-134 Z" /><circle cx={11} cy={-119} r={3.2} />
	<path d="M-19,-154 L-9,-154 L-8,-159 L-19,-159 Z" />
	<path d="M-22,-170 C-22,-177 -17,-180 -13,-180 C-8,-180 -5,-177 -5,-173 L-4,-169 C-4,-165 -6,-161 -9,-160 L-18,-159 C-21,-162 -22,-166 -22,-170 Z" />
	<path d="M-23,-171 L-20,-196 C-14,-200 -6,-198 -2,-190 L-4,-186 L-6,-174 Z" /><path d="M-24,-172 L-4,-175 L-4,-171 L-24,-168 Z" />
	{/* the driver, kneeling at the front, reins forward */}
	<path d="M26,-104 C24,-120 26,-134 32,-142 C36,-146 44,-146 46,-140 C48,-130 48,-116 46,-104 Z" />
	<path d="M34,-160 C34,-166 38,-169 42,-169 C46,-169 48,-166 48,-162 L49,-158 C49,-155 47,-152 44,-151 L37,-150 C35,-153 34,-156 34,-160 Z" />
	<path d="M33,-161 C33,-168 37,-172 43,-172 L48,-171 C49,-168 49,-166 48,-164 C44,-166 39,-166 35,-162 Z" />
	<path d={limb([[40, -138], [52, -126], [62, -128]], [3.6, 3, 2.6])} />
	<path d={`M62,-128 C${yx * 0.6 + 40},-150 ${yx + 40},-160 ${yx + 84},-138`} fill="none" strokeWidth={1.2} stroke="currentColor" />
	{/* the canopy pole and the round 伞盖, ribs drooping, a short fringe */}
	<rect x={-12.5} y={-262} width={3} height={160} />
	<path d="M-118,-232 C-80,-262 50,-268 96,-236 C100,-233 102,-230 100,-228 C60,-240 -60,-242 -116,-228 C-120,-229 -120,-231 -118,-232 Z" />
	<path d="M-16,-266 C-14,-272 -8,-272 -6,-266 Z" />
	{Array.from({length: 14}, (_, i) => { const x = -114 + i * 16, y = -229 - Math.sin((i / 13) * Math.PI) * 6; return <path key={i} d={`M${x},${y} L${x - 1},${y + 9} L${x + 2},${y + 9} Z`} />; })}
</g>;

/* ---------- banners, the 门楼, walls ---------- */
/** a tall Han banner on a pole: pole foot at (0,0) in cm; the flag hangs from a crossbar along the pole; ch = one character */
export const Banner: React.FC<{h?: number; w?: number; ch?: string; cloth?: string; clothS?: string; ink?: string; lit?: number; wave?: number; poleFill?: string}> = ({h = 400, w = 62, ch, cloth = '#5A2420', clothS = '#3A1714', ink = '#E6D4AE', lit = 1, wave = 0}) => {
	const top = -h + 22, bot = top + w * 2.5, sx = lit;
	const fl = `M3,${top} L${w + 4},${top + 2} C${w + 2 + wave},${top + w * 0.8} ${w + 6 - wave},${top + w * 1.6} ${w + 3 + wave * 0.5},${bot} L3,${bot - 2} Z`;
	return <g>
		<rect x={-1.6} y={-h} width={3.2} height={h} />
		<path d={`M0,${-h - 22} L-3.4,${-h} L3.4,${-h} Z`} />
		<rect x={-2} y={top - 3} width={w + 8} height={3} />
		<path d={fl} fill={cloth} />
		<path d={`M${w * 0.55},${top + 1} L${w + 4},${top + 2} C${w + 2 + wave},${top + w * 0.8} ${w + 6 - wave},${top + w * 1.6} ${w + 3 + wave * 0.5},${bot} L${w * 0.55},${bot - 1} Z`} fill={clothS} opacity={sx > 0 ? 0.0 : 0.7} />
		<path d={`M3,${top} L${w * 0.3},${top} L${w * 0.3},${bot - 2} L3,${bot - 2} Z`} fill={clothS} opacity={sx > 0 ? 0.6 : 0} />
		{[0, 1, 2].map((i) => <path key={i} d={`M${8 + i * w * 0.32},${bot - 2} C${6 + i * w * 0.32 + wave},${bot + 18} ${12 + i * w * 0.32},${bot + 30} ${8 + i * w * 0.32 + wave},${bot + 48} L${14 + i * w * 0.32 + wave},${bot + 46} C${17 + i * w * 0.32},${bot + 30} ${12 + i * w * 0.32 + wave},${bot + 18} ${16 + i * w * 0.32},${bot - 2} Z`} fill={clothS} />)}
		{ch && <text x={w * 0.5 + 4} y={top + w * 1.42} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={w * 0.82} fill={ink}>{ch}</text>}
	</g>; };

/** the 门楼 on a wall: 平座 with a railing, five bays, 斗拱, a straight-ridged hip roof with barely raised ends; base centre (0, 0) on
    the wall top, px at s = 1 (≈ 416 px wide); win = lit window opacity */
export const GateTower: React.FC<{win?: number; wall?: string; dark?: string; roof?: string}> = ({win = 0.6, wall = '#2A221C', dark = '#1C1612', roof = '#1E2224'}) => <g>
	<rect x={-208} y={-18} width={416} height={18} fill={dark} />
	{Array.from({length: 27}, (_, i) => <rect key={i} x={-200 + i * 15.2} y={-34} width={3} height={16} fill={dark} />)}
	<rect x={-204} y={-38} width={408} height={5} fill={dark} />
	<rect x={-184} y={-88} width={368} height={56} fill={wall} />
	{[0, 1, 2, 3, 4].map((i) => <g key={i}><rect x={-168 + i * 70} y={-74} width={40} height={30} fill="#E9CB98" opacity={win * (i === 2 ? 1 : 0.7)} />
		{[0, 1, 2, 3, 4, 5].map((j) => <rect key={j} x={-166 + i * 70 + j * 6.6} y={-74} width={2.2} height={30} fill="#2A1E16" />)}</g>)}
	{[-184, -114, -44, 26, 96, 166].map((x) => <rect key={x} x={x} y={-88} width={18} height={56} fill={dark} />)}
	<rect x={-194} y={-96} width={388} height={9} fill={dark} />
	{Array.from({length: 13}, (_, i) => <g key={i} fill={dark}><rect x={-188 + i * 30} y={-106} width={18} height={10} /><rect x={-194 + i * 30} y={-110} width={30} height={5} /></g>)}
	<path d="M-242,-108 C-140,-114 140,-114 242,-108 L246,-116 C230,-120 200,-134 148,-162 L-148,-162 C-200,-134 -230,-120 -246,-116 Z" fill={roof} />
	<path d="M-156,-160 L156,-160 L164,-172 L156,-168 L-156,-168 L-164,-172 Z" fill="#141414" />
	{Array.from({length: 30}, (_, i) => { const x0 = -140 + i * 9.6, x1 = -234 + i * 16.4; return <path key={i} d={`M${x0},-158 L${x1},-112`} stroke="#5A6466" strokeOpacity={0.3} strokeWidth={1.2} />; })}
</g>;

/** a traction trebuchet (霹雳车) in cm: a braced trestle with the pivot at (0, −420); beam angle a (deg, 0 = long arm pointing up,
    −90 = pointing left); the long arm ends in a sling (hanging with its stone, or flying); ropes from the short end come down to `ropes` */
export const Trebuchet: React.FC<{a: number; ropes: P[]; sling?: 'hang' | 'fly' | 'none'; far?: string}> = ({a, ropes, sling = 'hang', far = '#2A1E18'}) => { const r = (a * Math.PI) / 180, px = 0, py = -420, LA = 520, SA = 150;
	const tip: P = [px + Math.sin(r) * LA, py - Math.cos(r) * LA], sh: P = [px - Math.sin(r) * SA, py + Math.cos(r) * SA];
	const trestle = (dx: number, fill?: string) => <g fill={fill} transform={`translate(${dx},${dx ? -8 : 0})`}>
		<path d={limb([[-150, -10], [px - 8, py + 6]], [11, 8])} /><path d={limb([[150, -10], [px + 8, py + 6]], [11, 8])} />
		<path d={limb([[-104, -140], [104, -140]], [6, 6])} /><path d={limb([[-52, -290], [52, -290]], [5, 5])} />
		<path d={limb([[-104, -140], [44, -292]], [4.2, 4.2])} /><path d={limb([[104, -140], [-44, -292]], [4.2, 4.2])} />
		<rect x={-180} y={-18} width={360} height={18} /><rect x={-14} y={py - 6} width={28} height={22} /></g>;
	return <g>
		{trestle(26, far)}
		{trestle(0)}
		<circle cx={px} cy={py} r={13} />
		{/* the beam: several poles bound together, thick at the pivot, with lashings */}
		<path d={limb([sh, [px, py], tip], [12, 15, 6])} />
		{[0.3, 0.55, 0.8].map((u) => { const c: P = [px + Math.sin(r) * LA * u, py - Math.cos(r) * LA * u]; return <path key={u} d={limb([[c[0] - Math.cos(r) * 15, c[1] - Math.sin(r) * 15], [c[0] + Math.cos(r) * 15, c[1] + Math.sin(r) * 15]], [3.4, 3.4])} />; })}
		{sling === 'hang' ? <g><path d={`M${tip[0]},${tip[1]} C${tip[0] - 14},${tip[1] + 50} ${tip[0] - 4},${tip[1] + 100} ${tip[0] + 6},${tip[1] + 134}`} fill="none" stroke="currentColor" strokeWidth={3} />
			<path d={`M${tip[0]},${tip[1]} C${tip[0] + 18},${tip[1] + 50} ${tip[0] + 22},${tip[1] + 100} ${tip[0] + 14},${tip[1] + 134}`} fill="none" stroke="currentColor" strokeWidth={3} />
			<circle cx={tip[0] + 10} cy={tip[1] + 150} r={20} /></g>
			: sling === 'fly' ? <path d={`M${tip[0]},${tip[1]} C${tip[0] + 60},${tip[1] - 30} ${tip[0] + 110},${tip[1] + 10} ${tip[0] + 120},${tip[1] + 60}`} fill="none" stroke="currentColor" strokeWidth={3} /> : null}
		{ropes.map((q, i) => <line key={i} x1={sh[0] + (i - ropes.length / 2) * 3} y1={sh[1]} x2={q[0]} y2={q[1]} stroke="currentColor" strokeWidth={2.4} />)}
	</g>; };

/** a crewman hauling a rope (leaning back, arms up-forward to the rope), cm, facing +x (toward the machine), feet at 0 */
export const Puller: React.FC<{lean?: number}> = ({lean = 1}) => { const l = lean;
	return <g>
		<path d={limb([[-6 + l * -8, -92], [8, -48], [18, -4]], [7.4, 6, 4.6])} />
		<path d={limb([[-8 + l * -8, -92], [-22 - l * 4, -50], [-30 - l * 6, -4]], [7.4, 6, 4.6])} />
		<path d="M10,-6 L26,-6 L26,0 L10,0 Z M-38,-6 L-22,-6 L-24,0 L-40,0 Z" />
		<path d={limb([[-14 - l * 10, -96], [-6 - l * 22, -150]], [12, 11])} />
		<path d={limb([[-6 - l * 22, -146], [10 - l * 14, -160], [30 - l * 6, -168]], [5, 4.4, 3.8])} />
		<path d={limb([[-8 - l * 22, -142], [8 - l * 14, -148], [26 - l * 6, -158]], [5, 4.4, 3.8])} />
		<ellipse cx={-6 - l * 22} cy={-168} rx={9} ry={10.5} /><path d={`M${-16 - l * 22},-172 L${-14 - l * 22},-182 L${2 - l * 22},-180 L${4 - l * 22},-170 Z`} />
	</g>; };

/** a palisade (营栅): stakes with sharpened tops and two rails, from x0 to x1 (px), ground y, stake height h (px) */
export const Palisade: React.FC<{x0: number; x1: number; y: number; h: number; gap?: number; seed?: number; w?: number}> = ({x0, x1, y, h, gap = 16, seed = 3, w = 9}) => {
	const n = Math.floor((x1 - x0) / gap) + 1;
	return <g>
		{Array.from({length: n}, (_, i) => { const ww = w * (0.8 + rnd(i, seed + 3) * 0.45), x = x0 + i * gap + (rnd(i, seed) - 0.5) * 3, hh = h * (0.84 + rnd(i, seed + 1) * 0.26), lean = (rnd(i, seed + 2) - 0.5) * 5;
			return <path key={i} d={`M${f1(x - ww / 2)},${y} L${f1(x - ww / 2 + lean)},${f1(y - hh + ww)} L${f1(x + lean + (rnd(i, seed + 4) - 0.5) * ww * 0.5)},${f1(y - hh - ww * 0.7)} L${f1(x + ww / 2 + lean)},${f1(y - hh + ww * 0.8)} L${f1(x + ww / 2)},${y} Z`} />; })}
		<rect x={x0 - 6} y={y - h * 0.78} width={x1 - x0 + 12} height={Math.max(3, h * 0.045)} />
		<rect x={x0 - 6} y={y - h * 0.3} width={x1 - x0 + 12} height={Math.max(3, h * 0.045)} />
	</g>; };

/** 高橹 (楼橹): a timber archery tower as Han reliefs draw it: a straight post frame tied by beams with a brace in each bay, a projecting
    floor carrying a boarded parapet (arrow slits), archers behind it, and a straight-ridged hip roof on four short corner posts.
    px at s = 1 (frame ≈ 96 wide, parapet 124, top ≈ −324) */
export const Tower: React.FC<{archers?: number}> = ({archers = 4}) => <g>
	<g opacity={0.72}><rect x={-27} y={-214} width={5} height={214} /><rect x={22} y={-214} width={5} height={214} /></g>
	<rect x={-46} y={-216} width={10} height={216} /><rect x={36} y={-216} width={10} height={216} />
	<rect x={-52} y={-6} width={22} height={6} /><rect x={30} y={-6} width={22} height={6} />
	{[-34, -104, -170].map((y) => <rect key={y} x={-50} y={y} width={100} height={6} />)}
	<path d="M-38,-34 L38,-98 L40,-92 L-36,-28 Z" /><path d="M38,-104 L-38,-164 L-40,-158 L36,-98 Z" />
	{/* ladder on the far side */}
	<g opacity={0.72}><rect x={-12} y={-214} width={2.4} height={214} /><rect x={-2} y={-214} width={2.4} height={214} />{Array.from({length: 13}, (_, i) => <rect key={i} x={-12} y={-16 - i * 15} width={12} height={2} />)}</g>
	{/* the floor on projecting joists */}
	<rect x={-66} y={-222} width={132} height={8} />
	{[-66, -40, -14, 12, 38, 60].map((x) => <rect key={x} x={x} y={-214} width={6} height={5} />)}
	{/* the boarded parapet with arrow slits (cut through) */}
	<path fillRule="evenodd" d="M-64,-222 L64,-222 L66,-256 L-66,-256 Z M-44,-246 L-40,-246 L-40,-232 L-44,-232 Z M-12,-246 L-8,-246 L-8,-232 L-12,-232 Z M20,-246 L24,-246 L24,-232 L20,-232 Z M50,-246 L54,-246 L54,-232 L50,-232 Z" />
	{[-50, -30, -2, 30, 40].map((x) => <rect key={x} x={x} y={-254} width={1.2} height={30} fill="#3A3028" opacity={0.6} />)}
	<rect x={-68} y={-260} width={136} height={5} />
	{/* archers between the parapet and the eaves */}
	{Array.from({length: archers}, (_, i) => { const x = -44 + (i * 88) / Math.max(1, archers - 1);
		return <g key={i}><path d={`M${x - 6},-258 L${x - 6},-272 C${x - 6},-278 ${x + 6},-278 ${x + 6},-272 L${x + 6},-258 Z`} /><circle cx={x} cy={-283} r={5.6} />
			<path d={`M${x + 4},-272 L${x + 15},-279`} stroke="currentColor" strokeWidth={2.4} />
			<path d={`M${x + 12},-292 C${x + 21},-283 ${x + 21},-270 ${x + 12},-262`} fill="none" stroke="currentColor" strokeWidth={1.8} /></g>; })}
	{/* the roof on four short posts: straight ridge, ends barely raised */}
	<rect x={-62} y={-300} width={4} height={42} /><rect x={58} y={-300} width={4} height={42} />
	<path d="M-80,-298 L80,-298 L82,-304 L56,-322 L-56,-322 L-82,-304 Z" />
	<path d="M-58,-322 L58,-322 L60,-328 L-60,-328 Z" />
</g>;

/** 囷: the Han round granary (thatched cone on a plastered drum), px at s = 1 (≈ 150 wide) */
export const Qun: React.FC<{drum?: string; thatch?: string; edge?: string}> = ({drum = '#3A3430', thatch = '#2E2820', edge = '#6A6458'}) => <g>
	<path d="M-62,0 L-64,-92 C-30,-98 30,-98 64,-92 L62,0 Z" fill={drum} />
	<path d="M-80,-86 C-40,-98 40,-98 80,-86 L0,-168 Z" fill={thatch} />
	<path d="M-80,-86 C-40,-98 40,-98 80,-86" fill="none" stroke={edge} strokeWidth={2} opacity={0.6} />
	<rect x={-6} y={-178} width={12} height={12} rx={4} fill={thatch} />
	<rect x={18} y={-80} width={18} height={16} fill="#0E0B09" opacity={0.6} />
</g>;
/** a raised storehouse (干栏仓): a hip-roofed timber house on posts, px at s = 1 (≈ 220 wide) */
export const Store: React.FC<{body?: string; roof?: string}> = ({body = '#3A3430', roof = '#26221E'}) => <g>
	{[-90, -45, 0, 45, 90].map((x) => <rect key={x} x={x - 4} y={-46} width={8} height={46} fill={roof} />)}
	<rect x={-104} y={-52} width={208} height={8} fill={roof} />
	<rect x={-96} y={-120} width={192} height={70} fill={body} />
	<rect x={-24} y={-104} width={24} height={30} fill="#0E0B09" opacity={0.5} />
	<path d="M-124,-116 L124,-116 L84,-160 L-84,-160 Z" fill={roof} />
</g>;
