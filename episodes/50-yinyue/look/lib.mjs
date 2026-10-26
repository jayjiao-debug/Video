// Shared drawing kit for the music series look 「黑胶 · 节奏的形状」.
export const W = 1920, H = 1080;
// fixed instrument inks for the whole series
export const INK = { kick: '#FF4F9A', snare: '#FFD23F', hat: '#3EE6B4', bass: '#6CA8FF', paper: '#F4EEE3', ink: '#14122A', dim: '#2a2745' };
export const F = `font-family="Noto Sans CJK SC, sans-serif"`;
export const P = (cx, cy, r, deg) => [cx + r * Math.sin(deg * Math.PI / 180), cy - r * Math.cos(deg * Math.PI / 180)];
export const defs = `<defs>
 <filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="7"/><feColorMatrix type="saturate" values="0"/>
  <feComponentTransfer><feFuncA type="table" tableValues="0 .55"/></feComponentTransfer></filter>
 <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>
 <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="40"/></filter>
 <pattern id="ht" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx="6" cy="6" r="2.6" fill="#fff"/></pattern>
 <pattern id="htk" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx="5" cy="5" r="2" fill="#000"/></pattern>
 <radialGradient id="vig" cx=".5" cy=".5" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>
 <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".45" stop-color="#fff" stop-opacity=".09"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/></linearGradient>
</defs>`;
export const finish = (s, vig = true) => `${s}${vig ? `<rect width="${W}" height="${H}" fill="url(#vig)"/>` : ''}<rect width="${W}" height="${H}" filter="url(#grain)" opacity=".22" style="mix-blend-mode:overlay"/>`;

// ---------- the record ----------
// rings: [{f: radius as fraction of R, n: steps, hits: [i], col, big: [i], lab: {i: text}, shape: bool, size}]
export function record({ cx, cy, R, rot = 0, rings, label, labelCol = INK.kick, now = true, beam = true }) {
	let s = `<g>`;
	s += `<circle cx="${cx}" cy="${cy + R * .04}" r="${R * 1.02}" fill="#000" opacity=".45" filter="url(#glow)"/>`;
	s += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="#0b0a14"/>`;
	for (let r = R * .36; r < R * .985; r += R * .018) s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#24223a" stroke-width="1.2" opacity="${.5 + .5 * Math.sin(r * .3)}"/>`;
	// light sheen across the vinyl
	s += `<path d="M${cx - R * .9} ${cy - R * .45} L${cx + R * .2} ${cy - R * .98} L${cx + R * .5} ${cy - R * .85} L${cx - R * .7} ${cy - R * .1}Z" fill="#fff" opacity=".035"/>`;
	s += `<path d="M${cx + R * .9} ${cy + R * .45} L${cx - R * .2} ${cy + R * .98} L${cx - R * .4} ${cy + R * .9} L${cx + R * .75} ${cy + R * .2}Z" fill="#fff" opacity=".03"/>`;
	// the playhead: a fixed beam at 12 o'clock
	if (beam) s += `<rect x="${cx - R * .006}" y="${cy - R * 1.08}" width="${R * .012}" height="${R * .74}" fill="#fff" opacity=".7"/>
		<path d="M${cx - R * .045} ${cy - R * 1.16} L${cx + R * .045} ${cy - R * 1.16} L${cx} ${cy - R * 1.08}Z" fill="#fff"/>`;
	for (const g of rings) {
		const r = g.f * R, sz = (g.size || .045) * R;
		s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${g.col}" stroke-width="2" opacity=".28"/>`;
		for (let i = 0; i < g.n; i++) { const [x, y] = P(cx, cy, r, i * 360 / g.n + rot); s += `<circle cx="${x}" cy="${y}" r="${sz * .22}" fill="${g.col}" opacity=".35"/>`; }
		const vis = g.vis ?? g.hits.length, shown = g.hits.slice(0, vis), full = vis >= g.hits.length;
		const pt = (i) => P(cx, cy, r, i * 360 / g.n + rot);
		if (g.shape && shown.length >= 2) {
			const pts = shown.map((i) => pt(i).map((v) => v.toFixed(1)).join(',')).join(' ');
			if (full && shown.length > 2) s += `<polygon points="${pts}" fill="${g.col}" opacity="${.13 * (g.fillA ?? 1)}"/><polygon points="${pts}" fill="none" stroke="${g.col}" stroke-width="${R * .009}" stroke-linejoin="round" opacity=".9"/>`;
			else s += `<polyline points="${pts}" fill="none" stroke="${g.col}" stroke-width="${R * .009}" stroke-linejoin="round" opacity=".9"/>`;
		}
		if (g.tail && shown.length && !full) { const [x1, y1] = pt(shown[shown.length - 1]), [x2, y2] = P(cx, cy, r, 0);
			s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${g.col}" stroke-width="${R * .009}" stroke-dasharray="${R * .02} ${R * .02}" opacity=".7"/>`; }
		for (const i of shown) {
			const a = ((i * 360 / g.n + rot) % 360 + 360) % 360, [x, y] = pt(i), big = (g.big || []).includes(i);
			const amt = g.flash ? (g.flash[i] || 0) : (now && (a < 4 || a > 356) ? 1 : 0);
			const rr = sz * (big ? 1.5 : 1) * (1 + .35 * amt);
			if (amt > .01) s += `<circle cx="${x}" cy="${y}" r="${rr * 2.4}" fill="${g.col}" opacity="${.55 * amt}" filter="url(#glow)"/>
				<circle cx="${x}" cy="${y}" r="${rr * (1.4 + .9 * (1 - amt))}" fill="none" stroke="${g.col}" stroke-width="3" opacity="${.8 * amt}"/><circle cx="${x}" cy="${y}" r="${rr * (1.8 + 1.6 * (1 - amt))}" fill="none" stroke="${g.col}" stroke-width="2" opacity="${.4 * amt}"/>`;
			s += `<circle cx="${x}" cy="${y}" r="${rr}" fill="${g.col}" ${amt > .05 ? `stroke="#fff" stroke-width="${rr * .22 * amt}"` : ''}/>`;
			if (g.lab && g.lab[i]) { const [lx, ly] = P(cx, cy, r - sz * (big ? 3.4 : 2.9), i * 360 / g.n + rot);
				s += `<text x="${lx}" y="${ly + R * .03}" text-anchor="middle" ${F} font-size="${R * (big ? .12 : .095)}" font-weight="900" fill="${amt > .3 ? '#fff' : g.col}" stroke="#0b0a14" stroke-width="${R * .02}" paint-order="stroke">${g.lab[i]}</text>`; }
		}
		if (g.name) { const yy = cy + (g.nameDy || 0), xx = cx - R - 34;
			s += `<line x1="${cx - r}" y1="${cy}" x2="${xx + 10}" y2="${yy}" stroke="${g.col}" stroke-width="2" opacity=".6"/><circle cx="${cx - r}" cy="${cy}" r="5" fill="${g.col}"/>
			<text x="${xx}" y="${yy + 14}" text-anchor="end" ${F} font-size="${g.nameSize || 40}" font-weight="900" fill="${g.col}">${g.name}</text>`; }
	}
	// label + hole
	s += `<circle cx="${cx}" cy="${cy}" r="${R * .3}" fill="${labelCol}"/><circle cx="${cx}" cy="${cy}" r="${R * .3}" fill="url(#htk)" opacity=".12"/>
	<circle cx="${cx}" cy="${cy}" r="${R * .275}" fill="none" stroke="#000" stroke-opacity=".18" stroke-width="2"/>`;
	if (label) s += `<text x="${cx}" y="${cy + R * (label.sub ? .025 : .055)}" text-anchor="middle" ${F} font-size="${R * (label.size || .2)}" font-weight="900" fill="${INK.ink}">${label.t}</text>
		${label.sub ? `<text x="${cx}" y="${cy + R * .15}" text-anchor="middle" ${F} font-size="${R * .065}" font-weight="700" fill="${INK.ink}" letter-spacing="${R * .01}">${label.sub}</text>` : ''}`;
	if (!label) s += `<circle cx="${cx}" cy="${cy}" r="${R * .025}" fill="#0b0a14"/>`;
	return s + `</g>`;
}
// caption: top-left, one line, keyword on a marker stripe
export function caption(parts, { x = 140, y = 160, size = 58, col = '#fff' } = {}) {
	const html = parts.map((p) => typeof p === 'string' ? p : `<span style="background:linear-gradient(transparent 52%, ${p.c || INK.snare} 52%, ${p.c || INK.snare} 90%, transparent 90%);padding:0 .12em">${p.k}</span>`).join('');
	return `<foreignObject x="${x}" y="${y - size * 1.05}" width="${W - x - 120}" height="${size * 1.5}"><div xmlns="http://www.w3.org/1999/xhtml" style="font:900 ${size}px 'Noto Sans CJK SC';color:${col};white-space:nowrap;line-height:1.3">${html}</div></foreignObject>`;
}
export const chapter = (n, t, col = '#fff') => `<text x="140" y="96" ${F} font-size="26" font-weight="700" fill="${col}" opacity=".6" letter-spacing="8">${n} · ${t}</text>`;
export const stars = (n, seed, y1, col = '#fff') => { let s = '', k = seed; const r = () => (k = (k * 9301 + 49297) % 233280) / 233280;
	for (let i = 0; i < n; i++) s += `<circle cx="${r() * W}" cy="${r() * y1}" r="${.8 + r() * 2.2}" fill="${col}" opacity="${.2 + r() * .6}"/>`; return s; };

