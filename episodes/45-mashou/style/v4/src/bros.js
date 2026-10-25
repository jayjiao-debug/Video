// ep45 v4 · the eleven brothers, redrawn for phone size (storyboard "Look": brothers rule B1–B5).
// Each head is a profile silhouette in a 100×100 box, facing LEFT, neck base at y = 100. The one defining feature of each
// animal BREAKS the outline (horns, antlers, long ears, comb, spiral horn, drop ear, snout disc, whiskers, tongue, ruff,
// flat face), because a silhouette is read by its outline, not by interior detail. Interior marks are a bonus only.
(() => {
const NECK = 'M52,100 C54,88 58,78 64,72 L86,68 C90,80 91,92 90,100 Z';
const W = (d, w = 6) => `<path d="${d}" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
K.BRO = {
	鼠: `<path d="M6,66 C14,56 30,46 52,44 C74,42 88,52 88,64 C88,76 78,84 62,84 C44,84 24,76 6,68 Z"/>
		<circle cx="64" cy="30" r="17"/><circle cx="6" cy="66" r="4"/>${W('M12,64 L-10,54 M12,66 L-12,66 M12,68 L-10,78', 1.8)}`,
	牛: `<path d="M6,48 C8,42 24,36 44,34 L74,34 C88,38 92,54 90,70 C88,84 72,90 52,88 L6,86 Z"/>
		<path d="M52,40 C56,22 48,6 26,0 C36,10 40,22 40,38 Z"/><path d="M74,42 L100,40 L98,52 L76,56 Z"/>`,
	虎: `<path d="M6,58 C6,44 22,34 44,30 C66,26 86,36 92,52 C96,68 90,80 80,86 L78,98 L70,88 L62,98 L56,88 L48,96 L44,86 C26,86 8,76 6,64 Z"/>
		<circle cx="56" cy="26" r="9"/><circle cx="74" cy="30" r="8"/><ellipse cx="12" cy="64" rx="12" ry="14"/>`,
	兔: `<ellipse cx="44" cy="66" rx="25" ry="17"/><path d="M50,56 C42,30 44,6 54,0 C66,6 66,32 62,56 Z"/>
		<path d="M62,58 C62,32 72,10 82,6 C90,16 84,40 72,60 Z"/>`,
	龙: `<path d="M-2,54 L14,48 C26,42 44,36 64,38 L84,44 C90,54 90,64 84,72 L62,74 L40,72 L24,76 L6,76 L18,68 L2,62 Z"/>
		${W('M56,40 L52,14 M53,22 L40,10 M52,14 L58,2', 6)}${W('M70,40 L72,12 M71,22 L84,12 M72,12 L66,2', 6)}
		<path d="M84,42 L100,36 L92,48 L102,52 L92,58 L100,66 L86,68 Z"/>${W('M4,52 C-6,44 -8,32 2,28', 3)}`,
	蛇: `<path d="M-2,42 C6,32 26,26 46,26 C62,28 72,36 70,48 C66,58 50,60 30,58 C14,56 2,50 -2,46 Z"/>
		${W('M-2,44 L-16,44 M-16,44 L-24,38 M-16,44 L-24,50', 3)}<path d="M52,52 C64,56 70,66 66,76 L56,84 C54,74 52,66 42,58 Z"/><ellipse cx="62" cy="90" rx="26" ry="9" fill="none" stroke="currentColor" stroke-width="9"/>`,
	羊: `<path d="M4,62 C8,48 28,40 48,40 C62,40 70,48 72,58 C70,70 58,78 42,80 L20,84 C10,84 4,74 4,62 Z"/>
		${W('M58,40 C62,20 88,16 94,36 C98,54 82,64 72,56 C64,50 68,40 78,42', 10)}<path d="M14,82 L18,98 L26,84 Z"/>`,
	// 猴 (r3, note 3a): no brow bar. A round cranium, a deep concave face, a protruding rounded muzzle with the mouth open (a notch in
	// the outline), a large round ear set mid-head at the back, a jagged cheek fringe under the jaw.
	猴: `<path d="M46,20 C37,22 33,29 34,36 C34,41 37,45 39,49 C32,50 25,53 21,58 C18,62 19,66 23,66 L31,65 L24,70 C24,75 28,78 34,78 L50,82 C70,85 87,72 87,54 C87,33 73,18 58,18 C54,18 50,19 46,20 Z"/>
		<circle cx="86" cy="50" r="12.5"/><path d="M34,77 L30,90 L39,83 L41,96 L48,85 L52,98 L56,85 L63,94 L64,80 Z"/>`,
	鸡: `<circle cx="54" cy="58" r="19"/><path d="M38,52 L14,58 L38,66 Z"/>
		<path d="M38,44 L40,22 L48,36 L54,16 L60,34 L68,18 L72,36 L80,30 L76,48 Z"/><ellipse cx="38" cy="78" rx="7" ry="12"/>
		<path d="M66,70 L92,76 L86,84 L94,92 L70,92 Z"/>`,
	狗: `<path d="M0,58 C2,52 16,50 30,48 L42,38 C56,32 76,34 84,46 C90,58 86,72 74,78 L44,80 L30,76 L8,72 C2,70 -2,64 0,58 Z"/>
		<path d="M56,40 L62,8 L78,38 Z"/><path d="M10,70 C12,82 18,90 24,92 C28,86 26,80 22,74 Z"/>`,
	猪: `<path d="M14,44 L12,78 L22,80 C36,88 60,90 78,80 C90,72 92,52 82,42 C70,30 40,32 22,42 Z"/>
		<ellipse cx="11" cy="61" rx="7" ry="17"/><path d="M58,40 C56,22 72,12 86,18 L74,48 Z"/>`,
};
// eye position per head (a small incised dot, visible only when the head is lit; silhouettes don't need it)
K.BEYE = {鼠: [40, 54], 牛: [38, 50], 虎: [36, 52], 兔: [36, 60], 龙: [42, 50], 蛇: [26, 46], 羊: [36, 54], 猴: [40, 41], 鸡: [48, 54], 狗: [38, 54], 猪: [40, 52]};
// mouth (spout point) per head, in box units
K.BMOUTH = {鼠: [4, 65], 牛: [8, 72], 虎: [10, 72], 兔: [20, 72], 龙: [8, 72], 蛇: [4, 52], 羊: [6, 70], 猴: [18, 68], 鸡: [16, 60], 狗: [4, 66], 猪: [6, 66]};
/** a brother's head. (x, y) = neck base centre on screen, size = box px, face -1 left / +1 right. */
const CUT = {牛: 'M4,64 L14,64', 虎: 'M50,32 L46,46 M62,30 L58,44 M74,36 L68,48 M86,50 L76,56 M88,64 L78,66', 狗: 'M24,64 L4,64'};
K.bro = (kind, x, y, size, face, fill, extra = '') => { const m = CUT[kind] ? K.uid('bm') : null;
	return `<g transform="translate(${x},${y}) scale(${(-face) * size / 100},${size / 100}) translate(-70,-100)" fill="${fill}" color="${fill}" ${extra}>${m ? `<mask id="${m}" maskUnits="userSpaceOnUse" x="-40" y="-40" width="180" height="180"><rect x="-40" y="-40" width="180" height="180" fill="#fff"/><path d="${CUT[kind]}" stroke="#000" stroke-width="3.2" stroke-linecap="round"/></mask>` : ''}<g ${m ? `mask="url(#${m})"` : ''}><path d="${NECK}"/>${K.BRO[kind]}</g></g>`; };
K.broPt = (kind, x, y, size, face, p) => { const q = (p === 'mouth' ? K.BMOUTH : K.BEYE)[kind]; return [x + (-face) * (q[0] - 70) * size / 100, y + (q[1] - 100) * size / 100]; };
})();
