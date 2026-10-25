// ep45 FULL FILM, part B: DESK 47.87 – 56.95 (iris from the 2007 spot into Ho's lamp; D7 Ho signs; D8 the price card rises;
// D9 the card morphs into a light column, the short London column, the 「二十多倍」 bracket; crane up the column + a light-edged
// wipe down into Paris) · PARIS 56.7 – 64.86 (P1 the rat and rabbit, a clerk's bid; P2 two strikes, the placard slide, five
// day/night cycles) · held-board wipe → PRESS 64.28 – 68.55 (P3 the 「未付款」 stamp) · cloth band → HALL 67.96 – 75.6 (P4 the cloth
// lowered, the lateral track; E1 the brass plaque and its glint) · match-cut plaque → lamp base → DESK at night 75.6 – 83.3 (E2 the
// lamp goes out on the stop; E3 the push into the star) → iris from the star onto the van's copper slats (E4, part of the drop).
(() => {
const P = window.P45, rnd = K.rnd, B = P.beat, F = P.FILM;
const S = '#120D0B';
// ------------------------------------------------------------------------------------------------ DESK (Ho's room, HK)
const ho = {x: 1745, floor: 830, h: 500};
const deskHero = {x: 1120 - (922 - 836) * (125 / 925), y: 600 - 260 * (125 / 925), h: 125, curl: 1, glow: 0.7, key: 1.7, mood: 'warm', refl: '#DCE4E0', base: 'block', block: {w: 420, h: 260}};
/** the room. o: {lamp 0..1 (on), ember 0..1, ho: bool, pen: [x,y] | null, horse: bool, chairEmpty: bool, card: {k, y}, price: {...}, star: 0..1 (copper)} */
const deskWorld = (t, o) => {
	const L = o.lamp, warm = L, curtain = 6 * Math.sin(t * 0.9) + 3 * Math.sin(t * 2.1);
	const wall = [P.mixC('#2E3A3C', '#5A4A3E', warm), P.mixC('#2A3133', '#4E4036', warm), P.mixC('#1E2224', '#2E241E', warm)];
	const starC = P.mixC('#F8FAF4', '#FFB070', o.star ?? 0), tw = 0.85 + 0.15 * Math.sin(t * 5.3);
	let s = `<defs>
	 <linearGradient id="dwall" gradientUnits="userSpaceOnUse" y1="0" y2="0" x1="-600" x2="2600"><stop offset="0" stop-color="${wall[0]}"/><stop offset=".5" stop-color="${wall[1]}"/><stop offset="1" stop-color="${wall[2]}"/></linearGradient>
	 <linearGradient id="dnight" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#2C4248"/><stop offset=".7" stop-color="#47605F"/><stop offset="1" stop-color="#5F716A"/></linearGradient>
	 <linearGradient id="dmoon" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#9FB8B6" stop-opacity="${(0.34 * (1 - 0.7 * L)).toFixed(3)}"/><stop offset="1" stop-color="#9FB8B6" stop-opacity="0"/></linearGradient>
	 <linearGradient id="dfloor" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${P.mixC('#2E3434', '#3D2F25', warm)}"/><stop offset="1" stop-color="${P.mixC('#161A1B', '#1E1712', warm)}"/></linearGradient>
	 <radialGradient id="dember" cx="1236" cy="398" r="60" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FF9A50" stop-opacity="${(0.9 * (o.ember ?? 0)).toFixed(3)}"/><stop offset=".3" stop-color="#C8582A" stop-opacity="${(0.35 * (o.ember ?? 0)).toFixed(3)}"/><stop offset="1" stop-color="#C8582A" stop-opacity="0"/></radialGradient>
	 <radialGradient id="dpool" cx="1240" cy="560" r="560" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#F3DDB4" stop-opacity="${(0.42 * L).toFixed(3)}"/><stop offset=".45" stop-color="#E8C090" stop-opacity="${(0.12 * L).toFixed(3)}"/><stop offset="1" stop-color="#E8C090" stop-opacity="0"/></radialGradient>
	 ${K.blur('db3', 3)}${K.blur('db10', 10)}${K.rimFilter('drim', 4, -2, '#F3DDB4', 0.9 * L + 0.2, 1.3)}
	</defs>
	<rect x="-600" y="-900" width="3200" height="2400" fill="url(#dwall)"/>
	<rect x="420" y="270" width="480" height="460" fill="url(#dnight)"/>
	<g filter="url(#db10)">${Array.from({length: 40}, (_, i) => `<circle cx="${420 + rnd(i) * 480}" cy="${600 + rnd(i + 9) * 120}" r="${3 + rnd(i + 3) * 6}" fill="${i % 3 ? '#B9C7C2' : '#E8C890'}" opacity="${((0.2 + rnd(i + 7) * 0.3) * (0.85 + 0.15 * Math.sin(t * (1 + rnd(i)) + i))).toFixed(3)}"/>`).join('')}</g>
	<circle cx="540" cy="360" r="38" fill="${starC}" opacity="${(0.22 * tw + 0.2 * (o.star ?? 0)).toFixed(3)}" filter="url(#db10)"/><circle cx="540" cy="360" r="7" fill="${starC}"/><path d="M540,${334 - 6 * tw} L540,${386 + 6 * tw} M${514 - 6 * tw},360 L${566 + 6 * tw},360" stroke="${starC}" stroke-width="2.5" opacity="${(0.85 * tw).toFixed(3)}"/>
	<rect x="652" y="270" width="16" height="460" fill="#1E2526"/><rect x="420" y="430" width="480" height="14" fill="#1E2526"/>
	<rect x="400" y="250" width="520" height="22" fill="#1A2021"/><rect x="400" y="728" width="520" height="26" fill="#2A3233"/>
	<path d="M880,250 C${900 + curtain},380 ${860 + curtain * 1.4},520 ${910 + curtain},760 L${1000 + curtain * 0.5},760 C${960 + curtain},540 990,400 960,250 Z" fill="${P.mixC('#3A4446', '#4A3A30', warm)}"/>
	<path d="M420,270 L900,270 L1500,1080 L700,1080 Z" fill="url(#dmoon)"/>
	<rect x="-600" y="830" width="3200" height="600" fill="url(#dfloor)"/>
	<rect x="-600" y="-900" width="3200" height="2400" fill="url(#dpool)"/>`;
	if (o.price) s += o.price;
	s += `<path d="M1020,600 L1640,600 L1640,620 L1020,620 Z" fill="#2A2420"/><path d="M1020,600 L1640,600" stroke="${P.mixC('#8FA6A2', '#F3DDB4', L)}" stroke-width="2" opacity=".6"/>
	<rect x="1040" y="620" width="30" height="210" fill="${S}"/><rect x="1580" y="620" width="30" height="210" fill="${S}"/><rect x="1380" y="620" width="230" height="160" fill="#18120F"/>
	<path d="M1540,594 L1630,591 L1634,598 L1544,600 Z" fill="${P.mixC('#AFC2BE', '#F3E6CC', L)}" opacity=".7"/>`;
	if (o.horse) s += K.horseHead({...deskHero, glow: 0.7 + 0.2 * L});
	if (o.card) s += o.card;
	// the brass lamp (on: the shade glows and the filament is bright)
	s += `<ellipse cx="1256" cy="596" rx="46" ry="9" fill="#6E5432"/><ellipse cx="1256" cy="592" rx="46" ry="9" fill="#9A7A4A"/><path d="M1212,592 C1230,586 1280,586 1300,592" stroke="#D7C08C" stroke-width="2" opacity=".55"/>
	<path d="M1256,590 L1256,470 C1256,440 1250,420 1240,404" stroke="#9A7A4A" stroke-width="9" fill="none"/><path d="M1252,590 L1252,470" stroke="#D7C08C" stroke-width="2" opacity=".5"/>
	<path d="M1180,352 L1292,352 L1312,404 L1160,404 Z" fill="${P.mixC('#4A4232', '#C8A060', L)}"/><path d="M1180,352 L1292,352 L1312,404 L1160,404 Z" fill="none" stroke="#B89A62" stroke-width="3" opacity=".8"/><ellipse cx="1236" cy="404" rx="76" ry="7" fill="${P.mixC('#2A2018', '#FFF0D0', L)}"/>
	${L > 0 ? `<ellipse cx="1236" cy="430" rx="160" ry="60" fill="#FFE8C0" opacity="${(0.25 * L).toFixed(3)}" filter="url(#db10)"/>` : ''}
	<rect x="-600" y="-900" width="3200" height="2400" fill="url(#dember)"/>${(o.ember ?? 0) > 0 ? `<ellipse cx="1236" cy="402" rx="12" ry="4" fill="#E07A3A" opacity="${o.ember.toFixed(3)}"/>` : ''}`;
	if (o.ho) { const hand2 = [1622, 598], pen = o.pen ?? [1590, 596];
		s += `<g filter="url(#drim)">${K.seated(ho.x, ho.floor, ho.h, -1, '#140E0B', [pen, hand2])}</g><path d="M${pen[0]},${pen[1]} l-16,8" stroke="#0A0807" stroke-width="3" stroke-linecap="round"/>`; }
	if (o.chairEmpty) s += `<g fill="${S}" transform="translate(-10,80)"><rect x="1774" y="380" width="22" height="260"/><rect x="1690" y="380" width="110" height="18"/><rect x="1660" y="628" width="190" height="22"/><rect x="1670" y="650" width="16" height="100"/><rect x="1824" y="650" width="16" height="100"/></g>`;
	return s;
};
const D7 = 48.148, SIGN = [B(84), 50.5], CARD = 51.544, MORPH = [53.525, 54.10], SHORT = B(93.5), BRACK = B(94.5);
const pen = (t) => { if (t >= SIGN[0] && t < SIGN[1]) { const w = t - SIGN[0]; return [1588 + 14 * Math.sin(w * 11) + 6 * Math.sin(w * 23), 594 + 2.5 * Math.cos(w * 17)]; }
	const r = P.smooth(P.seg(t, CARD + 0.1, CARD + 0.5)); return [P.lerp(1590, 1606, r), P.lerp(596, 599, r)]; };
const IRIS = [47.87, 48.45];
const camDesk = (() => { const s = F.spot2007(IRIS[0]); return P.cam([1236 - (s[0] - 960) / 1.25, 450 - (s[1] - 540) / 1.25, 1.25], [
	{t0: 48.40, t1: 50.60, to: [960, 540, 1.0]}, {t0: 51.5, t1: 53.5, to: [1050, 520, 1.08]}, {t0: 53.85, t1: 55.6, to: [1340, 0, 0.95]}, {t0: 55.7, t1: 56.95, to: [1430, -260, 1.2]}]); })();
const cardSvg = (t) => {
	if (t < CARD) return '';
	const k = P.easeOut3(P.seg(t, CARD, CARD + 0.3)), dy = (1 - k) * 230 + P.jolt(t, CARD + 0.3, 6, 0.3, 1.5), m = P.smooth(P.seg(t, ...MORPH));
	const r0 = {x: 1290, y: 400, w: 270, h: 200}, r1 = {x: 1380, y: -380, w: 100, h: 710};
	const R = {x: P.lerp(r0.x, r1.x, m), y: P.lerp(r0.y, r1.y, m) + dy, w: P.lerp(r0.w, r1.w, m), h: P.lerp(r0.h, r1.h, m)}, txt = 1 - P.seg(t, MORPH[0], MORPH[0] + 0.15);
	return `<defs><clipPath id="deskTop"><rect x="-600" y="-900" width="3200" height="1500"/></clipPath><linearGradient id="col" x1="0" x2="1"><stop offset="0" stop-color="#F3DDB4" stop-opacity=".55"/><stop offset=".5" stop-color="#FFF4DC" stop-opacity=".95"/><stop offset="1" stop-color="#F3DDB4" stop-opacity=".55"/></linearGradient></defs>
	<g clip-path="url(#deskTop)"><rect x="${R.x}" y="${R.y}" width="${R.w}" height="${R.h}" fill="${m > 0 ? 'url(#col)' : '#F3E6CC'}" stroke="#A8865E" stroke-width="${3 * (1 - m)}"/>
	${m > 0 ? `<rect x="${R.x - 30}" y="${R.y}" width="${R.w + 60}" height="${R.h}" fill="#FFE8C0" opacity="${(0.18 * m).toFixed(3)}" filter="url(#db10)"/>` : ''}
	${txt > 0 ? `<g opacity="${txt.toFixed(3)}"><text x="${R.x + R.w / 2}" y="${R.y + 112}" text-anchor="middle" font-family="Cormorant Garamond" font-weight="600" font-size="120" fill="#2A1E16">6910</text><text x="${R.x + R.w / 2}" y="${R.y + 172}" text-anchor="middle" font-family="Noto Sans CJK SC" font-weight="900" font-size="48" fill="#2A1E16" letter-spacing="4">万港元</text></g>` : ''}</g>`;
};
const priceSvg = (t) => {
	if (t < MORPH[1] - 0.1) return '';
	const a = P.seg(t, MORPH[1] - 0.1, MORPH[1] + 0.2), sh = P.easeOut(P.seg(t, SHORT, SHORT + 0.3)), br = P.smooth(P.seg(t, BRACK, BRACK + 0.3));
	return `<g opacity="${a.toFixed(3)}"><text x="1430" y="-418" text-anchor="middle" font-family="Cormorant Garamond" font-weight="600" font-size="92" fill="#FFF1DC">6910<tspan font-family="Noto Sans CJK SC" font-weight="900" font-size="44">万港元</tspan></text>
		<text x="1430" y="384" text-anchor="middle" font-family="Noto Sans CJK SC" font-weight="900" font-size="48" fill="#E9DCC4" opacity=".85">≈ 884万美元</text></g>
	${sh > 0 ? `<rect x="1080" y="${330 - 32 * sh}" width="100" height="${32 * sh}" fill="url(#col)"/><text x="1130" y="280" text-anchor="middle" font-family="Noto Sans CJK SC" font-weight="900" font-size="48" fill="#FFF1DC" opacity="${sh.toFixed(3)}">三四十万美元</text>` : ''}
	${br > 0 ? `<path d="M1560,${298 - (298 + 380) * br} L1560,298 M1540,298 L1560,298 M1540,${298 - (298 + 380) * br} L1560,${298 - (298 + 380) * br}" stroke="#C8693A" stroke-width="6" fill="none"/>
		<g opacity="${br.toFixed(3)}"><rect x="1590" y="-90" width="300" height="104" fill="#A84A26"/><text x="1740" y="-8" text-anchor="middle" font-family="Noto Serif CJK SC" font-weight="900" font-size="72" fill="#FFF1DC">二十多倍</text></g>` : ''}`;
};
F.deskRender = (t) => {
	const cam = camDesk(t), meta = {cam, camId: 12, events: []};
	const dim = 0.3 * P.smooth(P.seg(t, MORPH[0], MORPH[1]));
	const world = deskWorld(t, {lamp: 1, ho: true, pen: pen(t), horse: true, card: cardSvg(t), price: priceSvg(t)});
	let svg = `<defs><radialGradient id="dvig" cx="960" cy="560" r="1150" gradientUnits="userSpaceOnUse"><stop offset=".55" stop-color="#080A0B" stop-opacity="0"/><stop offset="1" stop-color="#080A0B" stop-opacity=".62"/></radialGradient></defs>
		<g transform="${P.camT(cam)}">${world}</g>${dim > 0 ? `<rect width="1920" height="1080" fill="#0A0807" opacity="${dim.toFixed(3)}"/><g transform="${P.camT(cam)}">${cardSvg(t)}${priceSvg(t)}</g>` : ''}<rect width="1920" height="1080" fill="url(#dvig)"/>`;
	if (t < IRIS[1]) {   // mode 5 iris: the 2007 spot's pool opens out as Ho's lamp pool at the same screen point
		const u = P.smooth(P.seg(t, ...IRIS)), s = F.spot2007(t), R = 20 + 1500 * u;
		svg = F.saleRender(t).svg + `<defs><radialGradient id="irisG" cx="${s[0]}" cy="${s[1]}" r="${R}" gradientUnits="userSpaceOnUse"><stop offset=".9" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient>
			<mask id="iris" maskUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080"><rect width="1920" height="1080" fill="url(#irisG)"/></mask></defs><g mask="url(#iris)">${svg}</g>`;
		meta.events.push({iris: u});
	}
	if (t >= CARD && t < CARD + 1 / 30) meta.events.push({card: t});
	return {svg, meta};
};
F.camDesk = camDesk;
// ------------------------------------------------------------------------------------------------ PARIS + PRESS
const P1 = 56.921, STR1 = 60.32, STR2 = B(105), PLAC = B(106), BID = B(101), HANG = B(107), CYC = B(109), WIPE = [56.70, 57.20], HELD = [64.28, 64.86], P3 = 64.563, STAMP = B(113), HAND = B(112);
const camPar = P.cam([960, 260, 1.0], [{t0: 56.90, t1: 58.60, to: [700, 560, 1.2]}, {t0: 59.40, t1: 60.90, to: [960, 540, 1.0]}, {t0: 63.15, t1: 64.40, to: [430, 540, 1.0]}, {t0: 64.40, t1: 64.9, to: [415, 540, 1.0], ease: 'out'}]);
const parisWorld = (t) => {
	const night = (() => { if (t < CYC || t > CYC + 1.25) return 1; const ph = ((t - CYC) / 0.25) % 1; return ph < 0.5 ? 0.15 + 1.7 * Math.abs(ph - 0.25) * 2 * 0.5 : 1; })();
	const win = (x) => `<path d="M${x},700 L${x},300 C${x},230 ${x + 160},230 ${x + 160},300 L${x + 160},700 Z" fill="url(#pwin)"/>
		<path d="M${x + 80},250 L${x + 80},700 M${x},420 L${x + 160},420 M${x},560 L${x + 160},560" stroke="#2A2420" stroke-width="7"/>
		<path d="M${x},700 L${x},300 C${x},230 ${x + 160},230 ${x + 160},300 L${x + 160},700" stroke="#8A7458" stroke-width="5" fill="none"/>`;
	let clerks = '';
	[[1420, 0.96], [1590, 1.0], [1760, 0.97]].forEach(([x, k], i) => { const u = 44 * k, g = 900, X = (d) => x - d * u, Y = (d) => g - d * u;
		const ear = i === 1 && t >= HANG ? P.smooth(P.seg(t, HANG, HANG + 0.3)) : 0;
		const hand = [P.lerp(X(0.62), X(0.9), ear), P.lerp(Y(6.95), 744, ear)];
		const bidUp = i === 0 ? P.easeOut(P.seg(t, BID, BID + 0.2)) * (1 - P.smooth(P.seg(t, BID + 1.2, BID + 1.6))) : 0;
		const far = [P.lerp(X(0.9), X(1.1), bidUp), P.lerp(744, Y(8.2), bidUp)];
		const f = K.figure({x, ground: g, h: 8 * u, face: -1, col: S, hat: i === 1 ? 'hair' : undefined, coat: 0.4, hands: [hand, far], elbow: [1, 1]});
		clerks += f.svg + f.armBack + f.armFront + `<path d="M${hand[0] + 0.3 * u * (1 - ear)},${hand[1] - 0.5 * u * (1 - ear)} L${hand[0] - 0.3 * u},${hand[1] + 0.05 * u}" stroke="#4A3A30" stroke-width="${0.15 * u}" stroke-linecap="round"/>`; });
	// the rostrum (between the podium and the easel) and the auctioneer, two strikes
	const U = 40, AX = 770, G0 = 820, rest = [AX - 70, 640];
	const st = (t0) => (t >= t0 - 0.5 / 30 && t < t0 + 0.2 ? 1 : 0);
	const up = (a, b) => Math.sin(Math.PI * P.seg(t, a, b));
	const lift = Math.max(up(59.95, STR1 - 0.5 / 30), up(STR1 + 0.12, STR2 - 0.5 / 30)), gh = [AX - 70 + 20 * lift, 640 - 80 * lift];
	const fig = K.figure({x: AX, ground: G0, h: 8 * U, face: -1, col: S, hat: 'hair', coat: 0.4, hands: [gh, [AX - 40, 650]], elbow: [1, -1]});
	const gav = `<g transform="rotate(${(55 * lift).toFixed(1)} ${gh[0]} ${gh[1]})"><rect x="${gh[0] - 44}" y="${gh[1] - 3.5}" width="50" height="7" rx="3.5" fill="#5A3820"/><rect x="${gh[0] - 62}" y="${gh[1] - 13}" width="22" height="26" rx="5" fill="#6A4226"/></g>
		${st(STR1) || st(STR2) ? [-30, -14, 14, 30].map((a) => `<path d="M${gh[0] - 51 + a * 0.9},${gh[1] - 18 - Math.abs(a) * 0.2} l${a * 0.5},${-14 + Math.abs(a) * 0.15}" stroke="#FFE2B0" stroke-width="2.5" stroke-linecap="round" opacity=".8"/>`).join('') : ''}`;
	const pl = P.easeOut3(P.seg(t, PLAC, PLAC + 0.3)), bx = 760;
	const board = `<rect x="${bx}" y="300" width="480" height="300" fill="#2A1E16" stroke="#C8955E" stroke-width="5"/><rect x="${bx + 12}" y="312" width="456" height="276" fill="#F3E6CC"/>
		<clipPath id="pcl"><rect x="${bx + 12}" y="312" width="456" height="276"/></clipPath><g clip-path="url(#pcl)"><g transform="translate(0,${(-300 * (1 - pl)).toFixed(1)})">
		<text x="${bx + 240}" y="390" text-anchor="middle" font-family="Noto Sans CJK SC" font-weight="900" font-size="56" fill="#5A4636">两件合计</text>
		<text x="${bx + 240}" y="520" text-anchor="middle" font-family="Noto Sans CJK SC" font-weight="900" font-size="100" fill="#2A1E16">3149<tspan font-size="64">万欧元</tspan></text></g></g>`;
	return {board, svg: `<defs>
	 <linearGradient id="pwall" x1="0" x2="0" gradientUnits="userSpaceOnUse" y1="0" y2="1080"><stop offset="0" stop-color="#3A3230"/><stop offset=".6" stop-color="#5A4A40"/><stop offset="1" stop-color="#46382E"/></linearGradient>
	 <linearGradient id="pwin" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${P.mixC('#C8D8DC', '#2A3E4A', night)}"/><stop offset="1" stop-color="${P.mixC('#E8EEEA', '#4A5E66', night)}"/></linearGradient>
	 <linearGradient id="pfloor" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#4A3A30"/><stop offset="1" stop-color="#211814"/></linearGradient>
	 <radialGradient id="plamp" cx="470" cy="560" r="360" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#F6E2BC" stop-opacity=".55"/><stop offset=".5" stop-color="#E8C890" stop-opacity=".14"/><stop offset="1" stop-color="#E8C890" stop-opacity="0"/></radialGradient>
	 <radialGradient id="pboard" cx="1000" cy="460" r="420" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#F6E2BC" stop-opacity=".32"/><stop offset="1" stop-color="#F6E2BC" stop-opacity="0"/></radialGradient>
	 ${K.rimFilter('prim', -4, 0, '#F0C890', 0.85, 1.3)}${K.rimFilter('primB', 3, -2, '#FFB070', 1, 1.2)}
	</defs>
	<rect x="-600" y="-700" width="3200" height="1800" fill="url(#pwall)"/>
	${[60, 330, 1330, 1600].map(win).join('')}
	${Array.from({length: 24}, (_, i) => `<circle cx="${[60, 330, 1330, 1600][i % 4] + 20 + rnd(i) * 120}" cy="${300 + rnd(i + 3) * 380}" r="${1 + rnd(i + 5) * 2}" fill="#DCE6E2" opacity="${((0.15 + rnd(i + 7) * 0.3) * night).toFixed(3)}"/>`).join('')}
	<rect x="-600" y="770" width="3200" height="400" fill="url(#pfloor)"/><path d="M-600,770 L2600,770" stroke="#7A5E48" stroke-width="2" opacity=".6"/>
	<rect x="-600" y="-700" width="3200" height="1800" fill="url(#plamp)"/>
	<path d="M300,640 L640,640 L650,820 L290,820 Z" fill="#2A211B"/><rect x="284" y="630" width="372" height="14" fill="#3E3128"/><path d="M284,630 L656,630" stroke="#F6E2BC" stroke-width="2.5" opacity=".7"/>
	${[[390, '鼠'], [550, '兔']].map(([x]) => `<rect x="${x - 34}" y="600" width="68" height="30" fill="#141010"/><path d="M${x - 34},600 L${x + 34},600" stroke="#C9B79A" stroke-width="2" opacity=".6"/>`).join('')}
	<g filter="url(#primB)">${K.bro('鼠', 390, 602, 190, -1, '#2A1A12')}${K.bro('兔', 550, 602, 190, -1, '#2A1A12')}</g>
	<rect x="-600" y="-700" width="3200" height="1800" fill="url(#pboard)"/>
	<path d="M880,860 L950,300 M1120,860 L1050,300 M1000,640 L1000,880" stroke="#2A1C14" stroke-width="12" stroke-linecap="round"/>
	<g filter="url(#prim)">${fig.svg}${fig.armBack}</g><path d="M${AX - 100},820 L${AX - 92},650 L${AX + 20},650 L${AX + 28},820 Z" fill="#24190F"/><rect x="${AX - 110}" y="640" width="150" height="12" fill="#3A281C"/><ellipse cx="${AX - 90}" cy="640" rx="22" ry="5" fill="#6A4428"/>
	<g filter="url(#prim)">${fig.armFront}${gav}</g>
	<g filter="url(#prim)">${clerks}</g>
	<rect x="1310" y="742" width="560" height="22" fill="#3A281C"/><path d="M1310,742 L1870,742" stroke="#E9C690" stroke-width="2.5" opacity=".8"/>
	<path d="M1320,764 L1860,764 L1850,900 L1330,900 Z" fill="#24190F"/>
	${[1400, 1570, 1740].map((x) => `<rect x="${x - 26}" y="728" width="52" height="16" rx="4" fill="#1A1210"/>`).join('')}`};
};
const pressWorld = (t) => {
	const u = 520 / 8, x = 960, fl = 872, hu = P.easeOut(P.seg(t, HAND, HAND + 0.3)), hand = [P.lerp(x - 1.6 * u, x - 1.35 * u, hu), P.lerp(704, 610, hu)];
	return K.pressRoom().replace(`${K.seated(x, fl, 520, -1, '#120D0B', [[x - 1.6 * u, 704]])}`, K.seated(x, fl, 520, -1, '#120D0B', [hand]));
};
const camPress = P.cam([960, 540, 1.0], [{t0: 64.6, t1: 68.0, to: [940, 540, 1.06]}]);
/** the result board, screen-locked (x 1290–1770, y 300–600) on both sides of the held-prop wipe; the 「未付款」 stamp lands on b113 */
const heldBoard = (t) => {
	const w = parisWorld(t), su = P.seg(t, STAMP, STAMP + 0.12), jy = P.jolt(t, STAMP + 0.12, 3, 0.3, 2), sc = 1.25 - 0.25 * P.easeOut(su);
	const stamp = t >= STAMP ? `<g transform="translate(1010,470) scale(${sc.toFixed(3)}) translate(-1010,-470)"><g transform="rotate(-12 1010 470)"><rect x="812" y="400" width="400" height="140" rx="10" fill="#F3E6CC" fill-opacity=".82" stroke="#C0302A" stroke-width="12"/><text x="1012" y="508" text-anchor="middle" font-family="Noto Sans CJK SC" font-weight="900" font-size="98" fill="#C0302A" letter-spacing="8">未付款</text></g></g>` : '';
	return `<g transform="translate(${960 - 430},${jy.toFixed(2)})">${w.board}${stamp}</g>`;
};
F.parisRender = (t) => {
	const meta = {events: []}; let svg = '';
	const parisFrame = (tt) => { const c = camPar(tt), w = parisWorld(tt); return {c, s: `<g transform="${P.camT(c)}">${w.svg}${tt < HELD[0] ? w.board : ''}</g>`}; };
	if (t < HELD[0]) {
		const pf = parisFrame(t); meta.cam = pf.c; meta.camId = 13; svg += pf.s;
		if (t < WIPE[1]) {   // mode 12 light-edged wipe down from the top: the column's light becomes the windows' light
			const e = P.lerp(-80, 1160, P.smooth(P.seg(t, ...WIPE))), dc = camDesk(t);
			const desk = `<g transform="${P.camT(dc)}">${deskWorld(t, {lamp: 1, ho: true, pen: pen(t), horse: true, card: cardSvg(t), price: priceSvg(t)})}</g><rect width="1920" height="1080" fill="#0A0807" opacity=".3"/><g transform="${P.camT(dc)}">${cardSvg(t)}${priceSvg(t)}</g>`;
			svg = `<defs><clipPath id="pw"><rect x="0" y="${Math.max(0, e).toFixed(1)}" width="1920" height="1200"/></clipPath><linearGradient id="pwe" x1="0" x2="0" gradientUnits="userSpaceOnUse" y1="${e - 160}" y2="${e + 20}"><stop offset="0" stop-color="#FFF0D0" stop-opacity="0"/><stop offset=".85" stop-color="#FFF0D0" stop-opacity=".6"/><stop offset="1" stop-color="#FFF0D0" stop-opacity="0"/></linearGradient></defs>
				${svg}<g clip-path="url(#pw)">${desk}</g><rect x="0" y="${e - 160}" width="1920" height="180" fill="url(#pwe)"/>`;
			meta.events.push({wipeP: e}); meta.camId = 12; meta.cam = dc;
		}
	} else if (t < HELD[1]) {   // mode 2 held-prop wipe with a roller shadow: Paris goes right → left to Beijing behind the same board
		const e = P.lerp(1980, -60, P.smooth(P.seg(t, ...HELD))), pf = parisFrame(t), pc = camPress(t);
		svg += pf.s + `<defs><clipPath id="hw"><rect x="${e.toFixed(1)}" y="0" width="${(2000 - e).toFixed(1)}" height="1080"/></clipPath><linearGradient id="roll" gradientUnits="userSpaceOnUse" x1="${e - 60}" x2="${e}" y1="0" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></linearGradient></defs>
			<g clip-path="url(#hw)"><g transform="${P.camT(pc)}">${pressWorld(t)}</g></g><rect x="${e - 60}" y="0" width="60" height="1080" fill="url(#roll)"/>` + heldBoard(t);
		meta.cam = pc; meta.camId = 14; meta.events.push({held: e});
	} else {
		const pc = camPress(t); meta.cam = pc; meta.camId = 14;
		svg += `<g transform="${P.camT(pc)}">${pressWorld(t)}</g>` + heldBoard(t);
	}
	svg += `<defs><radialGradient id="pvig2" cx="960" cy="560" r="1150" gradientUnits="userSpaceOnUse"><stop offset=".5" stop-color="#0E0907" stop-opacity="0"/><stop offset="1" stop-color="#0E0907" stop-opacity=".62"/></radialGradient></defs><rect width="1920" height="1080" fill="url(#pvig2)"/>`;
	[[STR1, 'strike1'], [STR2, 'strike2'], [PLAC, 'placard'], [STAMP, 'stamp']].forEach(([x, n]) => { if (t >= x - 0.5 / 30 && t < x + 0.5 / 30) meta.events.push({[n]: t}); });
	return {svg, meta};
};
F.parisDate = (t) => (t < CYC ? '2.25' : ['2.26', '2.27', '2.28', '3.1', '3.2'][Math.min(4, Math.floor((t - CYC) / 0.25))]);
// ------------------------------------------------------------------------------------------------ HALL (国家博物馆)
const CLOTH = [67.96, 68.55], PL1 = 900, PL2 = 1760, GLINT = B(129.5), MATCH = 75.601;
const camHall = P.cam([900, 540, 1.0], [{t0: 68.5, t1: 70.9, to: [900, 540, 1.05]}, {t0: 70.9, t1: 72.9, to: [PL2, 540, 1.0]}, {t0: 72.9, t1: 74.19, to: [PL2, 548, 1.02]}, {t0: 74.19, t1: MATCH, to: [PL2, 700, 1.5]}]);
const hallHero = {x: PL2 - (922 - 836) * (300 / 925), y: 560, h: 300, curl: 1, glow: 0.9, key: 1.9, mood: 'warm', refl: '#E6ECE6', base: 'cut'};
const hallWorld = (t) => {
	const g = P.seg(t, GLINT, GLINT + 0.5);
	const win = (x) => `<rect x="${x}" y="80" width="150" height="560" fill="url(#hwin)"/><path d="M${x + 75},80 L${x + 75},640 M${x},270 L${x + 150},270 M${x},460 L${x + 150},460" stroke="#3A4448" stroke-width="6"/><rect x="${x}" y="80" width="150" height="560" fill="none" stroke="#8C8A80" stroke-width="5"/>`;
	const plinth = (cx, w, top) => `<rect x="${cx - w / 2}" y="${top}" width="${w}" height="${880 - top}" fill="url(#hpl)"/><rect x="${cx - w / 2 - 8}" y="${top - 12}" width="${w + 16}" height="14" fill="#E8E2D4"/><path d="M${cx - w / 2},${top} L${cx - w / 2},880" stroke="#FFFFFF" stroke-width="3" opacity=".5"/>`;
	// the cloth (P4): held at two corners by the two staff, lowered to the floor 68.3–69.2, then let go
	const lower = P.smooth(P.seg(t, 68.3, 69.2)), held = t < 69.25;
	const cl = 520 + 360 * lower;
	const staffA = window.WALKER({look: 'staff', x: PL1 - 210 - 60 * P.smooth(P.seg(t, 69.3, 70.0)), ground: 880, h: 420, face: 1, stand: 1, u: 0.25, col: S, rim: '#E6ECE6', rimOp: 0.4, reach: held ? [PL1 - 150, cl] : null});
	const staffB = window.WALKER({look: 'staff', x: PL1 + 210 + 60 * P.smooth(P.seg(t, 69.3, 70.0)), ground: 880, h: 410, face: -1, stand: 1, u: 0.6, col: S, rim: '#E6ECE6', rimOp: 0.4, reach: held ? [PL1 + 150, cl] : null});
	const cloth = held ? `<path d="M${PL1 - 150},${cl} C${PL1 - 60},${cl + 30} ${PL1 + 60},${cl + 30} ${PL1 + 150},${cl} L${PL1 + 170},${Math.min(880, cl + 360)} L${PL1 - 170},${Math.min(880, cl + 360)} Z" fill="#2A1E2A" opacity=".96"/>`
		: `<path d="M${PL1 - 190},880 C${PL1 - 120},860 ${PL1 + 120},858 ${PL1 + 190},880 Z" fill="#2A1E2A"/>`;
	const ropes = (x0, x1) => { let s = '', r = `M${x0},860`; for (let x = x0; x <= x1; x += 220) { s += `<rect x="${x - 6}" y="800" width="12" height="150" fill="#B89A62"/><circle cx="${x}" cy="798" r="10" fill="#E8C690"/><rect x="${x - 20}" y="946" width="40" height="8" rx="3" fill="#8A7048"/>`; if (x > x0) r += ` Q${x - 110},905 ${x},860`; } return s + `<path d="${r}" stroke="#7A2A22" stroke-width="8" fill="none"/>`; };
	return `<defs>
	 <linearGradient id="hwall" x1="0" x2="0" gradientUnits="userSpaceOnUse" y1="-400" y2="900"><stop offset="0" stop-color="#2A2C2C"/><stop offset=".6" stop-color="#4A4A46"/><stop offset="1" stop-color="#3A3834"/></linearGradient>
	 <linearGradient id="hwin" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#2A3E4A"/><stop offset="1" stop-color="#4A5E66"/></linearGradient>
	 <linearGradient id="hpl" x1="0" x2="1"><stop offset="0" stop-color="#CFC8BA"/><stop offset="1" stop-color="#A8A294"/></linearGradient>
	 <linearGradient id="hfl" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#3A3632"/><stop offset="1" stop-color="#1E1C1A"/></linearGradient>
	 <radialGradient id="hsp1" cx="${PL1}" cy="520" r="420" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#E6ECE6" stop-opacity=".38"/><stop offset="1" stop-color="#E6ECE6" stop-opacity="0"/></radialGradient>
	 <radialGradient id="hsp2" cx="${PL2}" cy="480" r="460" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFB070" stop-opacity=".34"/><stop offset="1" stop-color="#FFB070" stop-opacity="0"/></radialGradient>
	 <linearGradient id="brass" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#D8B46A"/><stop offset=".5" stop-color="#A8823E"/><stop offset="1" stop-color="#7A5A2A"/></linearGradient>
	 <linearGradient id="gl" gradientUnits="userSpaceOnUse" x1="${PL2 - 260 + 520 * g}" x2="${PL2 - 200 + 520 * g}" y1="0" y2="0"><stop offset="0" stop-color="#FFF6E0" stop-opacity="0"/><stop offset=".5" stop-color="#FFF6E0" stop-opacity="${(0.9 * Math.sin(Math.PI * g)).toFixed(3)}"/><stop offset="1" stop-color="#FFF6E0" stop-opacity="0"/></linearGradient>
	 ${K.rimFilter('hrim', -3, -2, '#E6ECE6', 0.7, 1.2)}${K.rimFilter('hrimB', 3, -2, '#FFB070', 0.9, 1.2)}
	</defs>
	<rect x="-600" y="-600" width="3800" height="2000" fill="url(#hwall)"/>
	${Array.from({length: 16}, (_, i) => `<path d="M${-600 + i * 240},-600 L${-600 + i * 240},40" stroke="#5A5A54" stroke-width="3" opacity=".35"/>`).join('')}<rect x="-600" y="30" width="3800" height="14" fill="#5A5A54" opacity=".6"/>
	${[100, 420, 1240, 1560, 2100, 2420].map(win).join('')}
	<rect x="-600" y="880" width="3800" height="500" fill="url(#hfl)"/><path d="M-600,880 L3200,880" stroke="#8C8A80" stroke-width="2" opacity=".6"/>
	<rect x="-600" y="-600" width="3800" height="2000" fill="url(#hsp1)"/><rect x="-600" y="-600" width="3800" height="2000" fill="url(#hsp2)"/>
	${plinth(PL1, 360, 640)}<g filter="url(#hrim)">${K.bro('鼠', PL1 - 80, 640, 250, -1, '#2A1A12')}${K.bro('兔', PL1 + 90, 640, 250, -1, '#2A1A12')}</g>
	${cloth}<g filter="url(#hrim)">${staffA.svg}${staffB.svg}</g>
	${plinth(PL2, 300, 560)}${K.horseHead(hallHero)}
	<rect x="${PL2 - 135}" y="700" width="270" height="86" fill="url(#brass)" stroke="#5A3E1A" stroke-width="3"/>
	<text x="${PL2}" y="738" text-anchor="middle" font-family="Noto Serif CJK SC" font-weight="900" font-size="28" fill="#3A2A14">马首铜像</text><text x="${PL2}" y="772" text-anchor="middle" font-family="Noto Serif CJK SC" font-weight="900" font-size="24" fill="#3A2A14">何鸿燊先生捐赠</text>
	<rect x="${PL2 - 135}" y="700" width="270" height="86" fill="url(#gl)"/>
	${ropes(-200, 3000)}`;
};
F.plaqueScreen = (t) => P.toScr(camHall(t), [PL2, 743]);
F.hallRender = (t) => {
	const meta = {events: []}; let svg = '';
	const cam = camHall(t); meta.cam = cam; meta.camId = 15;
	svg += `<g transform="${P.camT(cam)}">${hallWorld(t)}</g>`;
	if (t < CLOTH[1]) {   // mode 6 foreground band: the dark cloth sweeps toward the lens left → right; the hall behind it
		const u = P.seg(t, ...CLOTH), lead = P.lerp(-2600, 2600, P.smooth(u)), tail = lead - 1400;
		const press = `<g transform="${P.camT(camPress(t))}">${pressWorld(t)}</g>${heldBoard(t)}`;
		svg = `<defs><clipPath id="cb"><rect x="${Math.max(-10, tail + 700).toFixed(1)}" y="0" width="3000" height="1080"/></clipPath></defs>${svg}<g clip-path="url(#cb)">${press}</g>
			<defs><filter id="clb" filterUnits="userSpaceOnUse" x="-3000" y="-400" width="9000" height="2000"><feGaussianBlur stdDeviation="16 6"/></filter></defs>
			<g filter="url(#clb)"><path d="M${tail},-100 C${tail + 300},200 ${tail + 200},700 ${tail + 420},1180 L${lead},1180 C${lead - 200},700 ${lead - 60},300 ${lead - 260},-100 Z" fill="#1A1218"/>${[0.25, 0.5, 0.75].map((f) => `<path d="M${tail + 1400 * f},-100 C${tail + 1400 * f + 120},400 ${tail + 1400 * f - 60},800 ${tail + 1400 * f + 80},1180" stroke="#2E2230" stroke-width="30" fill="none"/>`).join('')}</g>`;
		meta.events.push({cloth: u});
	}
	svg += `<defs><radialGradient id="hvig2" cx="960" cy="560" r="1150" gradientUnits="userSpaceOnUse"><stop offset=".5" stop-color="#0B0B0A" stop-opacity="0"/><stop offset="1" stop-color="#0B0B0A" stop-opacity=".6"/></radialGradient></defs><rect width="1920" height="1080" fill="url(#hvig2)"/>`;
	if (t >= GLINT && t < GLINT + 1 / 30) meta.events.push({glint: t});
	return {svg, meta};
};
// ------------------------------------------------------------------------------------------------ DESK at night (E2, E3)
const STOP = 76.165, E3 = [80.20, 83.0], IRIS2 = [82.68, 83.30];
const camNight = (() => { const s = F.plaqueScreen(MATCH - 1 / 30), z = 1.5;
	const road0 = P.toScr(P.DROP.camRoad(82.96), [815, 690]), zs = 2.0;   // the crate slats' glow
	return P.cam([1256 - (s[0] - 960) / z, 592 - (s[1] - 540) / z, z], [{t0: MATCH, t1: 78.40, to: [960, 540, 1.0]}, {t0: 78.40, t1: E3[0], to: [955, 535, 1.02], ease: 'linear'},
		{t0: E3[0], t1: E3[1], to: [540 - (road0[0] - 960) / zs, 360 - (road0[1] - 540) / zs, zs]}]); })();
F.nightRender = (t) => {
	const cam = camNight(t), meta = {cam, camId: 16, events: []};
	const lamp = t < STOP - 0.5 / 30 ? 1 : 0, ember = t < STOP - 0.5 / 30 ? 0 : Math.max(0, 1 - (t - STOP) / 1.2);
	const star = P.smooth(P.seg(t, E3[0], E3[1]));
	let svg = `<defs><radialGradient id="nvig3" cx="960" cy="560" r="1150" gradientUnits="userSpaceOnUse"><stop offset=".55" stop-color="#080A0B" stop-opacity="0"/><stop offset="1" stop-color="#080A0B" stop-opacity=".7"/></radialGradient></defs>
		<g transform="${P.camT(cam)}">${deskWorld(t, {lamp, ember, chairEmpty: true, star})}</g><rect width="1920" height="1080" fill="url(#nvig3)"/>`;
	if (t >= IRIS2[0]) {   // mode 5 iris from the star (its bloom hides the edge) onto the crate's copper glow in the van
		const u = P.smooth(P.seg(t, ...IRIS2)), s = P.toScr(cam, [540, 360]), R = 10 + 1700 * u, rc = P.DROP.camRoad(t);
		svg += `<defs><radialGradient id="iris2" cx="${s[0]}" cy="${s[1]}" r="${R}" gradientUnits="userSpaceOnUse"><stop offset=".86" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient>
			<mask id="im2" maskUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080"><rect width="1920" height="1080" fill="url(#iris2)"/></mask></defs>
			<g mask="url(#im2)"><g transform="${P.camT(rc)}">${P.DROP.roadWorld(t)}</g></g>${K.blur('ibl', 30)}<circle cx="${s[0]}" cy="${s[1]}" r="${(R * 0.95).toFixed(1)}" fill="none" stroke="#FFC890" stroke-width="40" opacity="${(0.35 * (1 - u)).toFixed(3)}" filter="url(#ibl)"/>`;
		meta.events.push({iris2: u});
	}
	if (t >= STOP - 0.5 / 30 && t < STOP + 0.5 / 30) meta.events.push({stop: t});
	return {svg, meta};
};
F.BT = {D7, CARD, MORPH, P1, STR1, STR2, PLAC, CYC, HELD, P3, STAMP, CLOTH, GLINT, MATCH, STOP, IRIS, IRIS2, WIPE};
})();
