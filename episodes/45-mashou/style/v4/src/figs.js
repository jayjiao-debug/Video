// ep45 v3 figure helpers (one-tone profile silhouettes): 1860 soldier with a period kepi and a fuller torso,
// carrying the head with BOTH hands; a museum visitor (hair, nose, collar, hands behind the back); the empty stone seat.
(() => {
/** 1860 French kepi on a profile head at (hx, hy) radius r, facing f: soft crown higher at the back, narrower than the
 *  band at the top, the flat top tilted down to the front, a short visor angled down. Never wider at the top (police cap). */
K.kepi = (hx, hy, r, f, col) => {
	const X = (d) => hx + f * d * r, Y = (d) => hy + d * r;
	return `<path d="M${X(-1.02)},${Y(-0.18)} L${X(-0.88)},${Y(-1.36)} L${X(0.52)},${Y(-1.08)} L${X(0.86)},${Y(-0.42)} Z" fill="${col}"/>
	<path d="M${X(-1.04)},${Y(-0.14)} L${X(0.9)},${Y(-0.44)} L${X(0.92)},${Y(-0.62)} L${X(-1.0)},${Y(-0.36)} Z" fill="${col}"/>
	<path d="M${X(0.78)},${Y(-0.46)} L${X(1.5)},${Y(-0.14)} L${X(1.46)},${Y(-0.02)} L${X(0.8)},${Y(-0.26)} Z" fill="${col}"/>`;
};
/** a profile head with nose, lips, chin, ear bump and hair options. (hx, hy) centre, r radius, f facing. */
K.profileHead = (hx, hy, r, f, col, hair) => {
	const X = (d) => hx + f * d * r, Y = (d) => hy + d * r;
	let s = `<path d="M${X(-0.95)},${Y(-0.05)} C${X(-1.0)},${Y(-1.2)} ${X(0.9)},${Y(-1.25)} ${X(0.92)},${Y(-0.25)}
		L${X(1.0)},${Y(-0.05)} L${X(1.24)},${Y(0.22)} L${X(1.0)},${Y(0.32)} L${X(1.04)},${Y(0.46)} L${X(0.98)},${Y(0.56)} L${X(1.02)},${Y(0.66)}
		C${X(0.96)},${Y(0.92)} ${X(0.7)},${Y(1.02)} ${X(0.36)},${Y(1.0)} C${X(0.1)},${Y(0.98)} ${X(-0.3)},${Y(0.9)} ${X(-0.6)},${Y(0.62)}
		C${X(-0.9)},${Y(0.4)} ${X(-0.98)},${Y(0.2)} ${X(-0.95)},${Y(-0.05)} Z" fill="${col}"/>`;
	if (hair === 'bun') s += `<path d="M${X(-1.0)},${Y(0.3)} C${X(-1.12)},${Y(-1.15)} ${X(0.4)},${Y(-1.45)} ${X(0.95)},${Y(-0.45)} C${X(0.6)},${Y(-0.75)} ${X(0)},${Y(-0.62)} ${X(-0.42)},${Y(-0.1)} C${X(-0.6)},${Y(0.15)} ${X(-0.8)},${Y(0.35)} ${X(-1.0)},${Y(0.3)} Z" fill="${col}"/>
		<ellipse cx="${X(-1.05)}" cy="${Y(-0.62)}" rx="${0.42 * r}" ry="${0.38 * r}" fill="${col}"/>`;
	if (hair === 'short') s += `<path d="M${X(-1.0)},${Y(0.05)} C${X(-1.1)},${Y(-1.2)} ${X(0.5)},${Y(-1.42)} ${X(0.98)},${Y(-0.42)} C${X(0.5)},${Y(-0.7)} ${X(-0.2)},${Y(-0.6)} ${X(-0.5)},${Y(-0.2)} Z" fill="${col}"/>`;
	return s;
};
/** 1860 soldier walking right, carrying the head against his chest with both hands. Returns {back, body, front, hero}.
 *  x = hip x, ground = feet line, h = height. The head (hero) is placed so the collar sits on the near forearm. */
K.soldierCarry = (x, ground, h, col, opts = {}) => {
	const u = h / 8, f = 1, X = (d) => x + f * d * u, Y = (d) => ground - d * u;
	const st = opts.stride ?? [0.95, -0.7];
	const hip = [X(0), Y(4.0)];
	let body = '';
	// legs (trousers) with boots
	st.forEach((sx, i) => { const foot = [X(sx), Y(0.12)], knee = K.two(hip, foot, 2.0 * u, 1.95 * u, -1);
		body += K.limb([hip, knee, foot], 0.55 * u, 0.42 * u, col);
		body += `<path d="M${foot[0] - 0.3 * u},${foot[1] - 0.3 * u} L${foot[0] + 0.62 * u},${foot[1] - 0.12 * u} Q${foot[0] + 0.72 * u},${foot[1] + 0.12 * u} ${foot[0] + 0.5 * u},${foot[1] + 0.12 * u} L${foot[0] - 0.34 * u},${foot[1] + 0.12 * u} Z" fill="${col}"/>`; });
	// greatcoat torso: broad chest, belt, skirt to mid-thigh flaring with the stride
	body += `<path d="M${X(-0.55)},${Y(6.5)} C${X(-0.92)},${Y(5.8)} ${X(-0.86)},${Y(4.7)} ${X(-0.7)},${Y(4.0)} L${X(-0.92)},${Y(3.0)} L${X(0.78)},${Y(3.05)}
		L${X(0.62)},${Y(4.0)} C${X(0.8)},${Y(4.7)} ${X(0.92)},${Y(5.6)} ${X(0.6)},${Y(6.38)} Q${X(0.05)},${Y(6.68)} ${X(-0.55)},${Y(6.5)} Z" fill="${col}"/>
		<path d="M${X(-0.72)},${Y(4.05)} L${X(0.64)},${Y(4.05)}" stroke="${opts.beltCol ?? '#2a1a12'}" stroke-width="${0.12 * u}" opacity=".8"/>`;
	// neck, head and kepi (head tilted slightly down: looking at what he carries)
	const hx = X(0.28), hy = Y(7.2), r = 0.47 * u;
	body += `<path d="M${X(-0.05)},${Y(6.3)} L${X(0.42)},${Y(6.35)} L${X(0.38)},${Y(6.9)} L${X(0.0)},${Y(6.9)} Z" fill="${col}"/>`;
	body += K.profileHead(hx, hy, r, f, col, null) + K.kepi(hx, hy, r, f, col);
	// pack strap / cross belt
	body += `<path d="M${X(-0.55)},${Y(6.35)} L${X(0.62)},${Y(4.1)}" stroke="${opts.beltCol ?? '#2a1a12'}" stroke-width="${0.1 * u}" opacity=".7"/>`;
	// the head he carries: collar bottom at belly height, held against the chest
	const hh = h / 4.0;   // true scale ≈ ¼ of a person
	const hero = {x: X(1.02), y: Y(3.95), h: hh, flip: true};
	const sh = [X(0.1), Y(6.25)];
	// far hand: under the far end of the collar (cupping the front of the base)
	const farT = [X(1.5), Y(3.9)], nearT = [X(0.62), Y(3.9)];
	const ef = K.two([sh[0] + 0.15 * u, sh[1] - 0.05 * u], farT, 1.5 * u, 1.45 * u, 1);
	const back = K.limb([[sh[0] + 0.15 * u, sh[1] - 0.05 * u], ef, farT], 0.34 * u, 0.24 * u, col) + `<ellipse cx="${farT[0]}" cy="${farT[1] + 0.05 * u}" rx="${0.27 * u}" ry="${0.2 * u}" fill="${col}"/>`;
	// near arm: elbow down at the side, forearm level under the collar, mitten under the near end
	const en = K.two(sh, [nearT[0] + 0.3 * u, nearT[1]], 1.45 * u, 1.35 * u, 1);
	const front = K.limb([sh, en, [nearT[0] + 0.3 * u, nearT[1] + 0.05 * u]], 0.36 * u, 0.26 * u, col) + `<ellipse cx="${nearT[0] + 0.3 * u}" cy="${nearT[1] + 0.07 * u}" rx="${0.28 * u}" ry="${0.21 * u}" fill="${col}"/>`;
	return {back, body, front, hero, u};
};
/** museum visitor standing in profile, hands clasped behind the back, slight forward lean (looking into the case). */
K.visitor = (x, ground, h, f, col) => {
	const u = h / 8, X = (d) => x + f * d * u, Y = (d) => ground - d * u;
	let s = '';
	const hip = [X(0), Y(4.0)];
	[[0.25, 0], [-0.2, 1]].forEach(([sx]) => { const foot = [X(sx), Y(0.1)], knee = K.two(hip, foot, 2.0 * u, 1.95 * u, f > 0 ? -1 : 1);
		s += K.limb([hip, knee, foot], 0.48 * u, 0.36 * u, col) + `<path d="M${foot[0] - f * 0.25 * u},${foot[1] - 0.2 * u} L${foot[0] + f * 0.6 * u},${foot[1] - 0.08 * u} L${foot[0] + f * 0.6 * u},${foot[1] + 0.1 * u} L${foot[0] - f * 0.28 * u},${foot[1] + 0.1 * u} Z" fill="${col}"/>`; });
	// coat: shoulders forward a little (leaning to look), collar stand, hem at the upper thigh
	s += `<path d="M${X(-0.55)},${Y(6.45)} C${X(-0.85)},${Y(5.6)} ${X(-0.8)},${Y(4.4)} ${X(-0.78)},${Y(3.2)} L${X(0.66)},${Y(3.2)} C${X(0.7)},${Y(4.3)} ${X(0.9)},${Y(5.5)} ${X(0.78)},${Y(6.3)} Q${X(0.25)},${Y(6.62)} ${X(-0.55)},${Y(6.45)} Z" fill="${col}"/>`;
	s += `<path d="M${X(0.12)},${Y(6.3)} L${X(0.6)},${Y(6.5)} L${X(0.56)},${Y(6.95)} L${X(0.16)},${Y(6.95)} Z" fill="${col}"/>`;
	s += `<path d="M${X(0.0)},${Y(6.42)} L${X(0.42)},${Y(6.85)} L${X(0.72)},${Y(6.4)} Z" fill="${col}"/>`;   // turned-up collar
	s += K.profileHead(X(0.55), Y(7.25), 0.47 * u, f, col, 'bun');
	// arm hanging back, hands clasped behind (the mitten sits at the small of the back)
	const sh = [X(0.05), Y(6.15)], hand = [X(-0.5), Y(3.95)], e = K.two(sh, hand, 1.45 * u, 1.35 * u, f > 0 ? -1 : 1);
	s += K.limb([sh, e, hand], 0.32 * u, 0.24 * u, col) + `<ellipse cx="${hand[0]}" cy="${hand[1]}" rx="${0.26 * u}" ry="${0.22 * u}" fill="${col}"/>`;
	return s;
};
/** the empty stone seat: the robed stone body with an empty neck socket (a collar ring with nothing in it) */
K.emptySeat = (x, y, h, face, fill, rimCol) => {
	const b = K.stoneBody(x, y, h, face, fill), [tx, ty] = b.top, s = h / 140;
	return b.svg + `<path d="M${tx - 34 * s},${ty + 4 * s} C${tx - 34 * s},${ty - 8 * s} ${tx + 34 * s},${ty - 8 * s} ${tx + 34 * s},${ty + 4 * s} L${tx + 30 * s},${ty + 12 * s} L${tx - 30 * s},${ty + 12 * s} Z" fill="${fill}"/>
	<ellipse cx="${tx}" cy="${ty - 1 * s}" rx="${30 * s}" ry="${6 * s}" fill="#050302"/>
	<path d="M${tx - 30 * s},${ty - 2 * s} C${tx - 10 * s},${ty - 8 * s} ${tx + 14 * s},${ty - 8 * s} ${tx + 32 * s},${ty}" stroke="${rimCol}" stroke-width="${2.5 * s}" fill="none" opacity=".9"/>`;
};
})();
