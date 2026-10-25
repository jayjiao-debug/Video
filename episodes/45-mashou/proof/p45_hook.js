// ep45 proof 1 (script v8): the hook, 0 – 15.4 s. RING at night, every head stays on its seat (the count is held back to C1/C2).
// H1 0.0 the question (counter 「回来了 ?/12」, neutral dots) · H2 3.997 a paper auction tag drops on its cord beside the copper
// horse: 「6910万港元」 · H3 6.827 the tag turns over to one copper 「捐」, swings, settles · one continuous push to the horse from
// frame 0 · title 9.05 → 11.638 「兽首，到底回来了几个？」 over the defocused, dimmed ring, HUD hidden · OUT 11.07 (b17): match-cut on
// the horse's face (same screen point, same size, under the title's defocus) into POOL NOON (the v7_a2_noon set), racking into
// focus as the title leaves; A1 11.638 「十二兽首，原本是喷泉的出水口。」 and the pull back to all twelve; trickles from every mouth
// (b22.5) and the water-clock hop (兔 龙 蛇 → 马, one per half-beat). Lines: lines_v8s.json.
(() => {
const P = window.P45, rnd = K.rnd, B = P.beat;
const TAG = 3.997, FLIP = 6.827, TITLE = 9.05, CUT = B(17), A1 = 11.638, TRICKLE = B(22.5), HOPS = [B(23), B(23.5), B(24), B(24.5)];
const R = P.makeRing({RIM: P.BAR0});
const {hero0, face, HL} = R;
// ---- camera: one push from frame 0 (moving at both ends) to the title framing at ×2.3, cut at 11.07 while still moving
const Z = 2.3, camRing = P.cam([960, 540, 1.0], [{t0: 0, t1: CUT, to: [face[0], face[1] + 70 / Z, Z], ease: 'mix'}]);
// ---- the price tag (world space, on a cord from the horse's throat; it drops from behind the head, then hangs and swings)
const A = K.headPt(hero0, 'throat');
const tag = (t) => {
	if (t < TAG) return '';
	const tau = t - TAG, drop = P.easeIn(P.seg(tau, 0, 0.24)), L = P.lerp(-150, 58, drop);
	const fu = P.seg(t, FLIP, FLIP + 0.2), sx = Math.cos(Math.PI * P.smooth(fu)), back = fu >= 0.5;
	const th = (tau > 0.24 ? 10 * Math.sin(2 * Math.PI * (tau - 0.24) / 0.9) * Math.exp(-(tau - 0.24) / 0.7) : 0)
		+ (t > FLIP + 0.2 ? 7 * Math.sin(2 * Math.PI * (t - FLIP - 0.2) / 0.9) * Math.exp(-(t - FLIP - 0.2) / 0.8) : 0) + 0.8 * Math.sin(t * 1.7);
	const W = 210, H = 176, x0 = A[0] - W / 2, y0 = A[1] + L;
	const front = `<text x="${A[0]}" y="${y0 + 104}" text-anchor="middle" font-family="Cormorant Garamond" font-weight="600" font-size="94" fill="#2A1E16">6910</text>
		<text x="${A[0]}" y="${y0 + 152}" text-anchor="middle" font-family="Noto Sans CJK SC" font-weight="900" font-size="42" fill="#2A1E16" letter-spacing="4">万港元</text>`;
	const backF = `<text x="${A[0]}" y="${y0 + 150}" text-anchor="middle" font-family="Noto Serif CJK SC" font-weight="900" font-size="128" fill="url(#tagCu)" stroke="#5A2A12" stroke-width="1.5">捐</text>`;
	return `<defs><clipPath id="tagClip"><rect x="${A[0] - 400}" y="${A[1] - 6}" width="800" height="900"/></clipPath><linearGradient id="tagCu" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#FFD9A6"/><stop offset=".55" stop-color="#F09A5E"/><stop offset="1" stop-color="#C8693A"/></linearGradient></defs>
	<g clip-path="${drop < 1 ? 'url(#tagClip)' : 'none'}"><g transform="rotate(${th.toFixed(2)} ${A[0]} ${A[1]})">
	 ${L > 0 ? `<path d="M${A[0]},${A[1]} L${A[0]},${y0 + 18}" stroke="#2A1E16" stroke-width="2.6"/>` : ''}
	 <g transform="translate(${A[0]},0) scale(${Math.max(0.01, Math.abs(sx)).toFixed(4)},1) translate(${-A[0]},0)">
	  <path d="M${x0 + 26},${y0} L${x0 + W - 26},${y0} L${x0 + W},${y0 + 26} L${x0 + W},${y0 + H} L${x0},${y0 + H} L${x0},${y0 + 26} Z" fill="${back ? '#E6D8BA' : '#EFE3C8'}" stroke="#A8865E" stroke-width="3"/>
	  <circle cx="${A[0]}" cy="${y0 + 18}" r="8" fill="#3A2A1E"/><circle cx="${A[0]}" cy="${y0 + 18}" r="13" fill="none" stroke="#C8A878" stroke-width="3"/>
	  ${back ? backF : front}
	 </g></g></g>`;   // while it drops, the tag is clipped at the jaw line: it slides out from under the head
};
// ---- POOL NOON (v7_a2_noon set), its horse at brother scale (K.statue), framed to match the ring horse at the cut
const NOON_T = 'translate(960,620) scale(1.22) translate(-960,-620)', NW = (p) => [960 + (p[0] - 960) * 1.22, 620 + (p[1] - 620) * 1.22];
const items = []; for (let i = 5; i >= 0; i--) for (const side of [-1, 1]) { const k = side < 0 ? K.ROW_L[i] : K.ROW_R[i]; items.push({k, side, i, st: K.statue(k, side, i, 'noon')}); }
const nh = items.find((q) => q.k === '马').st.hero, nFace = NW([nh.x + 0.28 * nh.h, nh.y - 0.52 * nh.h]);
let NB = null;
const noonBase = () => NB ?? (NB = {
	defs: `<defs>
	 <linearGradient id="nsky" x1="0" x2="0" gradientUnits="userSpaceOnUse" y1="0" y2="660"><stop offset="0" stop-color="#34494E"/><stop offset=".36" stop-color="#5F716C"/><stop offset=".62" stop-color="#A39C84"/><stop offset="1" stop-color="#CDBB93"/></linearGradient>
	 <linearGradient id="poolN" x1="0" x2="0" gradientUnits="userSpaceOnUse" y1="670" y2="930"><stop offset="0" stop-color="#9DAE9F"/><stop offset=".5" stop-color="#6B857B"/><stop offset="1" stop-color="#4C645D"/></linearGradient>
	 <linearGradient id="nfg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#5F574A"/><stop offset="1" stop-color="#2C2721"/></linearGradient>
	 ${K.rimFilter('rimSun', 3, 5, '#F6E9C8', 0.85, 1.0)}${K.blur('nhz', 3)}${K.blur('nhz8', 10)}</defs>`,
	back: `<rect x="-600" y="-600" width="3120" height="2280" fill="url(#nsky)"/><g transform="${NOON_T}">
	<g filter="url(#nhz8)" opacity=".85">${Array.from({length: 22}, (_, i) => `<ellipse cx="${60 + i * 88}" cy="${560 + (i % 3) * 14}" rx="${70 + (i % 4) * 16}" ry="${60 + (i % 5) * 10}" fill="${i % 2 ? '#7C8574' : '#8A9180'}"/>`).join('')}</g>
	<g filter="url(#nhz)">${K.facade('noon')}</g>${K.stairs('noon')}${K.pool('noon')}
	<rect x="-400" y="940" width="2720" height="400" fill="url(#nfg)"/>${Array.from({length: 5}, (_, i) => `<path d="M-400,${960 + i * i * 6} L2320,${960 + i * i * 6}" stroke="#211C17" stroke-width="2" opacity=".5"/>`).join('')}
	${items.filter((q) => q.k !== '马').map(({st}) => `<g filter="url(#rimSun)">${st.svg}</g>`).join('')}</g>`,
	horse: (() => { const st = items.find((q) => q.k === '马').st; return `<g transform="${NOON_T}"><g filter="url(#rimSun)">${st.svg}</g>${K.horseHead(st.hero)}</g>`; })(),
});
/** a thin falling trickle from every mouth (b22.5, 0.3 s stagger from the horse outward), then the clock hop to the horse */
const water = (t) => {
	let s = '';
	const order = items.slice().sort((a, b) => Math.hypot(...[0, 1].map((j) => a.st.mouth[j] - nh.x * (1 - j) - nh.y * j)) - Math.hypot(...[0, 1].map((j) => b.st.mouth[j] - nh.x * (1 - j) - nh.y * j)));
	order.forEach((q, n) => { const t0 = TRICKLE + 0.3 * n / 4; if (t < t0) return; const [mx, my] = q.st.mouth, len = 60 * P.easeOut(P.seg(t, t0, t0 + 0.3)) * (q.st.s ?? 1) + 10, wob = 1.5 * Math.sin(t * 9 + n);
		s += `<path d="M${mx},${my} q${(wob + 4 * (q.side < 0 ? 1 : -1)).toFixed(1)},${(len / 2).toFixed(1)} ${(6 * (q.side < 0 ? 1 : -1)).toFixed(1)},${len.toFixed(1)}" stroke="#F3F1E8" stroke-width="${(2.6 * (q.st.s ?? 1)).toFixed(2)}" fill="none" opacity=".85" stroke-linecap="round"/>`; });
	const hopK = ['兔', '龙', '蛇', '马'];
	HOPS.forEach((h0, n) => { const u = P.seg(t, h0, h0 + 0.42); if (u <= 0 || u >= 1) return; const q = items.find((z) => z.k === hopK[n]);
		const land = [960 + (q.side < 0 ? -1 : 1) * (50 + 130 * (1 - q.i / 5)), 905 - 220 * (q.i / 5) - 4], up = Math.sin(Math.PI * u);
		s += `<g opacity="${up.toFixed(3)}">${K.arc(q.st.mouth, land, (190 * q.st.s + 50) * (0.4 + 0.6 * up), q.st.s * 1.05, q.k === '马' ? {core: '#FFE2B4', glow: '#FFB070', gA: 0.5} : {})}</g>`; });
	return `<g transform="${NOON_T}">${s}</g>`;
};
// match the noon camera to the ring horse at the cut: same face point on screen, same horse height
const cR = camRing(CUT), Sface = P.toScr(cR, face), zN = (hero0.h * cR.z) / (nh.h * 1.22);
const camNoon = P.cam([nFace[0] - (Sface[0] - 960) / zN, nFace[1] - (Sface[1] - 540) / zN, zN], [
	{t0: CUT, t1: A1, to: [nFace[0] - (Sface[0] - 960) / (zN * 0.97), nFace[1] - (Sface[1] - 540) / (zN * 0.97), zN * 0.97], ease: 'linear'},
	{t0: A1, t1: 15.3, to: [960, 540, 1.0]},
]);
const noonVig = `<radialGradient id="nvig" cx="960" cy="600" r="1150" gradientUnits="userSpaceOnUse"><stop offset=".45" stop-color="#1A140F" stop-opacity="0"/><stop offset="1" stop-color="#1A140F" stop-opacity=".85"/></radialGradient>`;
// ---- the title (house slam), v8 text
const titleHtml = (t) => {
	if (t < TITLE || t >= 11.62) return '';
	const u = P.seg(t, TITLE, TITLE + 0.12), sc = 1.25 - 0.25 * P.easeOut(u), jy = P.jolt(t, TITLE + 0.12, 6, 0.36, 2), op = 1 - P.smooth(P.seg(t, 11.36, 11.60));
	const su = P.seg(t, TITLE + 0.16, TITLE + 0.30), seal = su <= 0 ? 'opacity:0' : `opacity:${(0.95 * Math.min(1, su * 3)).toFixed(3)};transform:rotate(-6deg) scale(${(1.25 - 0.25 * P.easeOut(su)).toFixed(3)})`;
	return `<div id="title" style="position:absolute;left:0;right:0;top:806px;text-align:center;font-family:'Noto Serif CJK SC',serif;font-weight:900;font-size:128px;line-height:1;letter-spacing:.06em;white-space:nowrap;z-index:20;opacity:${op.toFixed(3)};transform:translateY(${jy.toFixed(2)}px) scale(${sc.toFixed(4)});transform-origin:50% 60%">
	 <div style="position:absolute;left:0;right:0;top:-40px;height:2px;background:linear-gradient(90deg,rgba(200,105,58,0) 22%,rgba(232,150,90,.85) 50%,rgba(200,105,58,0) 78%)"></div>
	 <span style="color:#FFF1DC;text-shadow:0 0 3px rgba(10,8,6,.9),0 4px 26px rgba(10,8,6,.85)">兽首<span style="margin-right:-.5em">，</span>到底回来了</span><span style="color:#FFB070;background:linear-gradient(180deg,#FFD9A6 0%,#F09A5E 55%,#C8693A 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;filter:drop-shadow(0 0 18px rgba(255,140,70,.45)) drop-shadow(0 3px 6px rgba(10,8,6,.9))">几个？</span><img src="${window.JSEAL}" style="width:92px;height:92px;transform:rotate(-6deg);vertical-align:top;margin-left:6px;margin-top:-30px;${seal}">
	</div>`;
};
const LINES = window.LINES45;
const render = (t) => {
	const meta = {events: []};
	let svg = '';
	const titleOn = t >= TITLE, dofIn = P.smooth(P.seg(t, TITLE, TITLE + 0.35)), dofOut = 1 - P.smooth(P.seg(t, 11.36, A1)), dof = dofIn * dofOut;
	if (t < CUT - 0.5 / 30) {
		const cam = camRing(t); meta.cam = cam; meta.camId = 0;
		const world = R.ringWorld(t, {noHero: titleOn, heroExtra: tag(t)});
		svg += `<g transform="${P.camT(cam)}">${dof > 0.01 ? `<defs>${K.blur('dof', (7 * dof).toFixed(2))}</defs><g filter="url(#dof)">${world}</g>` : world}</g>`;
		if (titleOn) svg += `<rect width="1920" height="1080" fill="#0E1416" opacity="${(0.28 * dof).toFixed(3)}"/>
			<g transform="${P.camT(cam)}">${K.horseHead(R.heroAt(t))}</g>`;   // only the head stays sharp (seat + tag go soft with the ring)
		svg += P.ringVig(cam, HL, 1 - dof);
		if (t >= TAG && t < TAG + 1 / 30) meta.events.push({tag: t});
		if (t >= FLIP && t < FLIP + 1 / 30) meta.events.push({flip: t});
	} else {
		const cam = camNoon(t), b = noonBase(); meta.cam = cam; meta.camId = 1;
		if (t < CUT + 0.5 / 30) meta.events.push({cut: t});
		const bl = (7 * Z / cam.z) * dof;
		svg += b.defs + `<defs>${noonVig}</defs><g transform="${P.camT(cam)}">${bl > 0.05 ? `<defs>${K.blur('ndof', bl.toFixed(2))}</defs><g filter="url(#ndof)">${b.back}${water(t)}</g>` : b.back + water(t)}</g>`;
		if (dof > 0.01) svg += `<rect width="1920" height="1080" fill="#0E1416" opacity="${(0.28 * dof).toFixed(3)}"/>`;
		svg += `<g transform="${P.camT(cam)}">${b.horse}</g><rect width="1920" height="1080" fill="url(#nvig)" opacity="${(1 - 0.5 * dof).toFixed(3)}"/>`;
	}
	if (titleOn && t < 11.62) svg += `<defs><radialGradient id="tvig" cx="960" cy="470" r="1100" gradientUnits="userSpaceOnUse"><stop offset=".35" stop-color="#0A0E0F" stop-opacity="0"/><stop offset="1" stop-color="#0A0E0F" stop-opacity=".7"/></radialGradient>
		<linearGradient id="tfloor" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#0E1112" stop-opacity="0"/><stop offset="1" stop-color="#0E1112" stop-opacity=".78"/></linearGradient></defs>
		<rect y="640" width="1920" height="440" fill="url(#tfloor)" opacity="${dof.toFixed(3)}"/><rect width="1920" height="1080" fill="url(#tvig)" opacity="${dof.toFixed(3)}"/>`;
	// ---- HUD
	const hud = [];
	const ln = P.lineAt(LINES, t); if (ln) hud.push(P.subHtml(ln[2], t, ln[0]));
	const hudOp = t < TITLE ? 1 : 1 - P.seg(t, TITLE, TITLE + 0.15);
	if (t < A1) {
		if (hudOp > 0) {
			hud.push(P.stampHtml('圆明园 · 十二兽首', '海晏堂 · 水力钟', {op: hudOp}));
			const num = t >= P.BAR0 && t < 3.9 ? String(Math.floor(rnd(Math.floor(t * 15) + 11) * 13)) : '?';
			hud.push(P.blockHtml([{lab: '回来了', num: num + '/12', dots: P.ZOD.map(() => P.dot('e')).join('')}], null, {op: hudOp}));
			hud.push(P.sealHtml(hudOp));
		}
	} else {
		const op = P.seg(t, A1, A1 + 0.2);
		hud.push(P.stampHtml('乾隆年间 · 海晏堂', '圆明园 · 水力钟'));
		hud.push(P.blockHtml([{lab: '在家', num: '12/12', dots: P.ZOD.map(() => P.dot('h')).join('')}], '清', {op}));
		hud.push(P.sealHtml());
	}
	hud.push(titleHtml(t));
	return {svg, hud: P.hud(hud), meta};
};
P.SCENES.hook = {t0: 0, t1: 15.4, render};
})();
