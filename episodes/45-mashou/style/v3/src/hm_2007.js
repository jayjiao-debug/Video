// Height map (white = high) for L3 铜壁 · key D6a, 2007 Hong Kong, the room BEFORE the sale: empty gilt chairs with
// catalogues on the seats, the gavel lying still on its block, the lot board cast 撤拍, a porter in white gloves beside
// your pedestal (you ≈ ¼ of his height). Shaded in Python (relief.py); you are added in the round afterwards.
const G = (v) => { const c = Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, '0'); return `#${c}${c}${c}`; };
const FL = 990, PX_M = 760 / 1.75;   // floor line; px per metre at the front plane
const M = (m) => m * PX_M;
let s = `<defs>
 <linearGradient id="vg" x1="0" x2="1"><stop offset="0" stop-color="${G(0.5)}"/><stop offset=".5" stop-color="${G(0.62)}"/><stop offset="1" stop-color="${G(0.5)}"/></linearGradient>
 <linearGradient id="torso" x1="0" x2="1"><stop offset="0" stop-color="${G(0.56)}"/><stop offset=".55" stop-color="${G(0.7)}"/><stop offset="1" stop-color="${G(0.58)}"/></linearGradient>
 <filter id="sm" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="2"/></filter>
</defs>
<rect width="1920" height="1080" fill="${G(0.2)}"/>`;
// the panel: outer moulding (two steps) and the cornice band; pilasters only below the subtitle zone
s += `<rect x="0" y="0" width="1920" height="1080" fill="none" stroke="${G(0.62)}" stroke-width="56"/><rect x="34" y="34" width="1852" height="1012" fill="none" stroke="${G(0.42)}" stroke-width="12"/>`;
s += `<rect x="40" y="252" width="1840" height="20" fill="${G(0.3)}"/><rect x="40" y="272" width="1840" height="6" fill="${G(0.26)}"/>`;
[740, 1400].forEach((x) => { s += `<rect x="${x}" y="278" width="46" height="${FL - 278}" fill="${G(0.27)}"/>`; });
// wall panelling between the pilasters (very low)
s += `<rect x="70" y="620" width="640" height="${FL - 650}" fill="none" stroke="${G(0.25)}" stroke-width="6"/>`;
// skirting + floor
s += `<rect x="40" y="${FL - 26}" width="1840" height="26" fill="${G(0.34)}"/><rect x="40" y="${FL}" width="1840" height="${1046 - FL}" fill="${G(0.4)}"/>`;
// ---- the empty chairs (gilt auction chairs, profile, facing right) with a catalogue on each seat
const chair = (x, floor, k, lv) => { const m = (v) => M(v) * k; let c = '';
	const seatY = floor - m(0.46), backX = x - m(0.44);
	c += `<path d="M${backX + m(0.02)},${floor} C${backX - m(0.02)},${floor - m(0.25)} ${backX + m(0.03)},${seatY} ${backX + m(0.02)},${floor - m(0.95)} L${backX + m(0.065)},${floor - m(0.95)} C${backX + m(0.07)},${seatY} ${backX + m(0.045)},${floor - m(0.25)} ${backX + m(0.06)},${floor} Z" fill="${G(lv)}"/>`;
	c += `<ellipse cx="${backX + m(0.05)}" cy="${floor - m(0.72)}" rx="${m(0.065)}" ry="${m(0.2)}" fill="${G(lv + 0.06)}"/><ellipse cx="${backX + m(0.05)}" cy="${floor - m(0.72)}" rx="${m(0.035)}" ry="${m(0.15)}" fill="${G(lv - 0.08)}"/>`;
	c += `<path d="M${backX},${seatY - m(0.02)} Q${x - m(0.2)},${seatY - m(0.075)} ${x + m(0.04)},${seatY - m(0.03)} L${x + m(0.04)},${seatY + m(0.05)} L${backX},${seatY + m(0.05)} Z" fill="${G(lv + 0.04)}"/>`;
	c += `<path d="M${x - m(0.02)},${seatY + m(0.04)} L${x + m(0.03)},${seatY + m(0.04)} L${x + m(0.015)},${floor} L${x - m(0.01)},${floor} Z" fill="${G(lv)}"/>`;
	c += `<rect x="${x - m(0.36)}" y="${seatY - m(0.13)}" width="${m(0.32)}" height="${m(0.06)}" rx="${m(0.01)}" fill="${G(lv + 0.26)}"/><rect x="${x - m(0.36)}" y="${seatY - m(0.13)}" width="${m(0.03)}" height="${m(0.06)}" fill="${G(lv + 0.34)}"/><path d="M${x - m(0.32)},${seatY - m(0.1)} L${x - m(0.08)},${seatY - m(0.1)}" stroke="${G(lv + 0.12)}" stroke-width="${m(0.008)}"/>`;
	return c; };
[[300, 0.42], [500, 0.42], [700, 0.42]].forEach(([x, lv]) => { s += chair(x - 30, FL - 60, 0.86, lv); });
[[230, 0.58], [440, 0.58], [650, 0.58]].forEach(([x, lv]) => { s += chair(x, FL, 1, lv); });
// ---- your pedestal (you stand on it in the round)
const pX = 1000, pW = M(0.56), pTop = FL - M(1.0);
s += `<rect x="${pX - pW / 2 - 14}" y="${FL - 30}" width="${pW + 28}" height="30" fill="${G(0.66)}"/>
<rect x="${pX - pW / 2}" y="${pTop + 26}" width="${pW}" height="${FL - 30 - pTop - 26}" fill="url(#vg)"/>
<rect x="${pX - pW / 2 + 22}" y="${pTop + 60}" width="${pW - 44}" height="${FL - pTop - 130}" fill="none" stroke="${G(0.5)}" stroke-width="6"/>
<rect x="${pX - pW / 2 - 12}" y="${pTop}" width="${pW + 24}" height="28" fill="${G(0.72)}"/>`;
// ---- the porter (2007: dark suit, tie, short hair, white gloves), standing beside you, facing left, hands clasped in front
const por = (x, h, f) => { const u = h / 8, X = (d) => x + f * d * u, Y = (d) => FL - d * u; let p = '';
	const hip = [X(0), Y(4.0)];
	[[0.32, 0.6], [-0.22, 0.54]].forEach(([sx, lv]) => { const foot = [X(sx), Y(0.1)], knee = K.two(hip, foot, 2.0 * u, 1.95 * u, f > 0 ? -1 : 1);
		p += K.limb([hip, knee, foot], 0.44 * u, 0.36 * u, G(lv));
		p += `<path d="M${foot[0] - f * 0.25 * u},${foot[1] - 0.22 * u} L${foot[0] + f * 0.62 * u},${foot[1] - 0.06 * u} Q${foot[0] + f * 0.7 * u},${foot[1] + 0.1 * u} ${foot[0] + f * 0.5 * u},${foot[1] + 0.1 * u} L${foot[0] - f * 0.3 * u},${foot[1] + 0.1 * u} Z" fill="${G(lv + 0.12)}"/>`;
		p += `<path d="M${(hip[0] + foot[0]) / 2 + f * 0.05 * u},${Y(2.2)} L${foot[0] + f * 0.1 * u},${Y(0.4)}" stroke="${G(lv + 0.08)}" stroke-width="${0.05 * u}"/>`; });
	// jacket: shoulders, chest, hem below the hip, a vent; lapel + tie
	p += `<path d="M${X(-0.62)},${Y(6.55)} C${X(-0.9)},${Y(5.7)} ${X(-0.8)},${Y(4.4)} ${X(-0.72)},${Y(3.45)} L${X(0.72)},${Y(3.45)} C${X(0.8)},${Y(4.4)} ${X(0.9)},${Y(5.5)} ${X(0.66)},${Y(6.4)} Q${X(0.1)},${Y(6.75)} ${X(-0.62)},${Y(6.55)} Z" fill="url(#torso)"/>`;
	p += `<path d="M${X(0.55)},${Y(6.45)} L${X(0.28)},${Y(5.2)} L${X(0.66)},${Y(4.4)}" stroke="${G(0.42)}" stroke-width="${0.07 * u}" fill="none"/>`;
	p += `<path d="M${X(0.5)},${Y(6.5)} L${X(0.62)},${Y(6.48)} L${X(0.58)},${Y(5.3)} L${X(0.5)},${Y(5.2)} Z" fill="${G(0.8)}"/>`;
	p += `<path d="M${X(0.2)},${Y(6.45)} L${X(0.6)},${Y(6.6)} L${X(0.56)},${Y(7.0)} L${X(0.22)},${Y(7.0)} Z" fill="${G(0.66)}"/>`;
	p += `<path d="M${X(0.18)},${Y(6.5)} L${X(0.62)},${Y(6.62)} L${X(0.6)},${Y(6.75)} L${X(0.2)},${Y(6.66)} Z" fill="${G(0.85)}"/>`;
	p += K.profileHead(X(0.42), Y(7.32), 0.46 * u, f, G(0.7), null);
	p += `<path d="M${X(-0.06)},${Y(7.3)} C${X(-0.12)},${Y(8.05)} ${X(0.75)},${Y(8.15)} ${X(0.92)},${Y(7.62)} C${X(0.6)},${Y(7.78)} ${X(0.2)},${Y(7.72)} ${X(0.06)},${Y(7.42)} Z" fill="${G(0.78)}"/>`;
	p += `<ellipse cx="${X(0.18)}" cy="${Y(7.28)}" rx="${0.09 * u}" ry="${0.15 * u}" fill="${G(0.78)}"/>`;
	// near arm: down and forward, gloved hands clasped in front at the waist (far hand under it)
	const sh = [X(0.08), Y(6.2)], hand = [X(0.62), Y(4.1)], e = K.two(sh, hand, 1.45 * u, 1.35 * u, f > 0 ? 1 : -1);
	p += `<ellipse cx="${hand[0] + f * 0.12 * u}" cy="${hand[1] + 0.12 * u}" rx="${0.26 * u}" ry="${0.2 * u}" fill="${G(0.86)}"/>`;
	p += K.limb([sh, e, hand], 0.34 * u, 0.25 * u, G(0.78));
	p += `<rect x="${Math.min(hand[0], hand[0] - f * 0.32 * u)}" y="${hand[1] - 0.17 * u}" width="${0.32 * u}" height="${0.06 * u}" fill="${G(0.92)}"/>`;
	p += `<ellipse cx="${hand[0]}" cy="${hand[1]}" rx="${0.27 * u}" ry="${0.21 * u}" fill="${G(0.95)}"/>`;
	return p; };
s += por(1260, 760, -1);
// ---- the rostrum (a reading desk with a slanted top) with the gavel lying still on its block on the side ledge
const rx0 = 1480, rx1 = 1740, rTop = FL - M(1.2);
s += `<path d="M${rx0},${FL} L${rx0 + 16},${rTop + 40} L${rx1 - 16},${rTop + 40} L${rx1},${FL} Z" fill="${G(0.5)}"/>
<rect x="${rx0 + 46}" y="${rTop + 90}" width="${rx1 - rx0 - 92}" height="${FL - rTop - 160}" fill="none" stroke="${G(0.62)}" stroke-width="8"/>
<ellipse cx="${(rx0 + rx1) / 2}" cy="${rTop + 200}" rx="46" ry="46" fill="none" stroke="${G(0.66)}" stroke-width="10"/>
<path d="M${rx0 - 20},${rTop + 42} L${rx0 + 70},${rTop - 6} L${rx1 + 10},${rTop + 14} L${rx1 + 10},${rTop + 42} Z" fill="${G(0.7)}"/>
<rect x="${rx0 - 120}" y="${rTop + 60}" width="140" height="18" fill="${G(0.66)}"/><path d="M${rx0 - 110},${rTop + 78} L${rx0 - 90},${rTop + 78} L${rx0 - 30},${rTop + 140} L${rx0 - 40},${rTop + 150} Z" fill="${G(0.58)}"/>
<rect x="${rx0 - 110}" y="${rTop + 42}" width="100" height="18" rx="4" fill="${G(0.84)}"/>
<rect x="${rx0 - 100}" y="${rTop - 6}" width="56" height="48" rx="8" fill="${G(1)}"/><rect x="${rx0 - 92}" y="${rTop - 6}" width="6" height="48" fill="${G(0.8)}"/><rect x="${rx0 - 58}" y="${rTop - 6}" width="6" height="48" fill="${G(0.8)}"/>
<rect x="${rx0 - 46}" y="${rTop + 13}" width="150" height="10" rx="5" fill="${G(0.92)}"/><circle cx="${rx0 + 106}" cy="${rTop + 18}" r="9" fill="${G(0.95)}"/>`;
// ---- the lot board on the wall: cast 撤拍 (raised letters in a recessed field)
const bx = 1480, by = 296, bw = 300, bh = 186;
s += `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="${G(0.72)}"/><rect x="${bx + 18}" y="${by + 18}" width="${bw - 36}" height="${bh - 36}" fill="${G(0.1)}"/>
<text x="${bx + bw / 2}" y="${by + bh / 2 + 46}" text-anchor="middle" font-family="Noto Serif CJK SC" font-weight="900" font-size="128" letter-spacing="6" fill="${G(1)}">撤拍</text>`;
K.page(s, '');
