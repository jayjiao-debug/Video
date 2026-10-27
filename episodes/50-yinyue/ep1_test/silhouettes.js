// One-tone musician silhouettes (owner rule: one flat tone, no visible joints, must read as a real person).
// Every part of a figure is the same colour; limbs are thick round-capped strokes so joints merge.
// drummer(x, y, s, {tone, hit}) : front view, seated behind the kit. hit 0..1 = left stick on the snare.
// bassist(x, y, s, {tone})      : standing, 3/4 to the left, bass across the body.

function limb(pts, w, tone) { return `<path d="M${pts.map((p) => p.join(' ')).join(' L')}" fill="none" stroke="${tone}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`; }
function mix(a, b, u) { return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]; }

function drummer(x, y, s, { tone = '#1B1530', hit = 0, hat = .3, shine = '#FFD9A0' } = {}) {
	const T = tone;
	let k = '';
	// --- the player (drawn first, the kit sits in front of the body)
	k += `<path d="M-100 -300 C-104 -360 -104 -400 -92 -416 C-72 -440 -42 -452 -24 -456 L24 -456 C42 -452 72 -440 92 -416 C104 -400 104 -360 100 -300Z" fill="${T}"/>`;          // torso, round shoulders
	k += `<rect x="-23" y="-478" width="46" height="34" fill="${T}"/>`;                                                                     // neck
	k += `<ellipse cx="0" cy="-500" rx="44" ry="53" fill="${T}"/><path d="M-47 -508 C-54 -572 54 -578 49 -505 C46 -536 -30 -546 -47 -508Z" fill="${T}"/>`; // head + hair
	// right hand (viewer's left) on the hi-hat, small bounce with the hats
	const rh = mix([-215, -372], [-222, -352], hat), rtip = mix([-318, -432], [-312, -398], hat);
	k += limb([[-78, -420], [-138, -340], rh], 34, T) + limb([rh, rtip], 7, T);
	// left hand (viewer's right) crosses down to the snare: raised when hit = 0, stick on the head when hit = 1
	const lh = mix([-70, -392], [-92, -322], hit), ltip = mix([-150, -470], [-196, -300], hit);
	k += limb([[80, -420], [70, -320], lh], 34, T) + limb([lh, ltip], 7, T);
	// --- the kit
	k += `<path d="M-330 0 L-330 -382 M-372 0 L-330 -60 L-288 0" stroke="${T}" stroke-width="7" fill="none"/>`;                                  // hi-hat stand
	k += `<ellipse cx="-330" cy="-392" rx="78" ry="9" fill="${T}" transform="rotate(${-4 + 4 * hat} -330 -392)"/><ellipse cx="-330" cy="-380" rx="78" ry="9" fill="${T}"/>`;
	k += `<path d="M-245 0 L-205 -250 L-165 0" stroke="${T}" stroke-width="7" fill="none"/>`;                                                   // snare stand
	k += `<rect x="-275" y="-298" width="140" height="48" rx="6" fill="${T}"/><ellipse cx="-205" cy="-298" rx="70" ry="15" fill="${T}"/>`;        // snare
	k += `<circle cx="0" cy="-150" r="148" fill="${T}"/><rect x="-150" y="-10" width="300" height="10" fill="${T}"/>`;                            // kick
	k += `<rect x="-118" y="-370" width="96" height="82" rx="10" fill="${T}"/><ellipse cx="-70" cy="-370" rx="48" ry="12" fill="${T}"/>`;          // rack toms
	k += `<rect x="22" y="-375" width="104" height="88" rx="10" fill="${T}"/><ellipse cx="74" cy="-375" rx="52" ry="13" fill="${T}"/>`;
	k += `<rect x="168" y="-262" width="128" height="180" rx="10" fill="${T}"/><ellipse cx="232" cy="-262" rx="64" ry="15" fill="${T}"/><path d="M178 -82 L172 0 M286 -82 L292 0" stroke="${T}" stroke-width="8"/>`;
	k += `<path d="M330 0 L300 -470 M290 0 L300 -60 L340 0" stroke="${T}" stroke-width="7" fill="none"/><ellipse cx="288" cy="-482" rx="108" ry="12" fill="${T}" transform="rotate(-14 288 -482)"/>`; // crash
	// a thin glint on the cymbals and the kick rim (light catching metal)
	k += `<path d="M-400 -394 Q-330 -406 -262 -394" stroke="${shine}" stroke-width="3" fill="none" opacity=".8"/><path d="M190 -448 Q290 -490 390 -510" stroke="${shine}" stroke-width="3" fill="none" opacity=".7"/>`;
	k += `<path d="M-120 -235 A148 148 0 0 1 120 -235" stroke="${shine}" stroke-width="3" fill="none" opacity="${.35 + .5 * hit}"/>`;
	return `<g transform="translate(${x} ${y}) scale(${s})">${k}</g>`;
}

function bassist(x, y, s, { tone = '#1B1530', pluck = 0 } = {}) {
	const T = tone;
	let k = '';
	k += `<ellipse cx="-62" cy="-10" rx="40" ry="12" fill="${T}"/><ellipse cx="52" cy="-10" rx="38" ry="12" fill="${T}"/>`;                              // shoes
	k += limb([[-30, -320], [-44, -160], [-56, -18]], 54, T) + limb([[30, -320], [40, -160], [48, -18]], 54, T);                                    // legs
	k += `<path d="M-66 -300 C-70 -380 -84 -470 -66 -500 C-40 -522 40 -522 66 -500 C82 -470 72 -380 66 -300Z" fill="${T}"/>`;                           // torso
	k += `<rect x="-16" y="-548" width="30" height="40" fill="${T}"/>`;
	k += `<ellipse cx="-4" cy="-585" rx="40" ry="50" fill="${T}"/><path d="M-40 -588 L-52 -574 L-40 -566Z" fill="${T}"/>`;                               // head, nose to the left
	k += `<path d="M-38 -605 C-40 -660 60 -662 50 -590 C58 -560 46 -540 34 -548 C40 -580 20 -610 -38 -605Z" fill="${T}"/>`;                               // hair, falling to the back
	// bass across the body, neck up to the left
	k += `<g transform="rotate(24 10 -350)"><path d="M-80 -350 C-90 -410 -10 -420 10 -385 C30 -420 110 -410 100 -350 C110 -290 30 -270 10 -300 C-10 -270 -90 -290 -80 -350Z" fill="${T}"/>
		<rect x="-330" y="-362" width="260" height="20" rx="4" fill="${T}"/><rect x="-372" y="-370" width="48" height="36" rx="6" fill="${T}"/></g>`;
	k += `<path d="M-60 -500 L70 -330" stroke="${T}" stroke-width="10"/>`;                                                                                // strap
	const ph = [40 + 6 * pluck, -330 + 10 * pluck];
	k += limb([[-60, -490], [-150, -420], [-227, -458]], 32, T) + limb([[60, -490], [96, -392], ph], 32, T);                                              // arms
	return `<g transform="translate(${x} ${y}) scale(${s})">${k}</g>`;
}
