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
	牛: `<path d="M4,52 C4,44 20,36 44,34 L76,34 C88,38 92,54 90,70 C88,84 72,90 52,88 L20,88 C6,86 2,74 4,64 Z"/>
		${W('M58,38 C70,30 74,16 62,4', 10)}${W('M70,36 C84,28 88,14 80,2', 7)}<path d="M80,42 L100,38 L98,50 L82,54 Z"/>`,
	虎: `<path d="M6,58 C6,44 22,34 44,30 C66,26 86,36 92,52 C96,68 90,80 80,86 L78,98 L70,88 L62,98 L56,88 L48,96 L44,86 C26,86 8,76 6,64 Z"/>
		<circle cx="56" cy="26" r="9"/><circle cx="74" cy="30" r="8"/><ellipse cx="12" cy="64" rx="12" ry="14"/>`,
	兔: `<ellipse cx="44" cy="66" rx="25" ry="17"/><path d="M50,56 C42,30 44,6 54,0 C66,6 66,32 62,56 Z"/>
		<path d="M62,58 C62,32 72,10 82,6 C90,16 84,40 72,60 Z"/>`,
	龙: `<path d="M-2,54 L14,48 C26,42 44,36 64,38 L84,44 C90,54 90,64 84,72 L62,74 L40,72 L24,76 L6,76 L18,68 L2,62 Z"/>
		${W('M56,40 L52,14 M53,22 L40,10 M52,14 L58,2', 6)}${W('M70,40 L72,12 M71,22 L84,12 M72,12 L66,2', 6)}
		<path d="M84,42 L100,36 L92,48 L102,52 L92,58 L100,66 L86,68 Z"/>${W('M4,52 C-6,44 -8,32 2,28', 3)}`,
	蛇: `<path d="M-2,46 C6,36 26,30 46,30 C62,32 72,40 70,52 C66,62 50,64 30,62 C14,60 2,54 -2,50 Z"/>
		${W('M-2,48 L-16,48 M-16,48 L-24,42 M-16,48 L-24,54', 3)}<path d="M52,56 C70,60 80,72 74,82 C70,88 66,92 70,100 L52,100 C48,90 54,84 56,78 C58,72 50,66 42,62 Z"/>`,
	羊: `<path d="M4,62 C8,48 28,40 48,40 C62,40 70,48 72,58 C70,70 58,78 42,80 L20,84 C10,84 4,74 4,62 Z"/>
		${W('M58,40 C62,20 88,16 94,36 C98,54 82,64 72,56 C64,50 68,40 78,42', 10)}<path d="M14,82 L18,98 L26,84 Z"/>`,
	猴: `<circle cx="60" cy="50" r="22"/><path d="M44,40 C34,40 26,46 24,52 C20,54 16,60 18,66 C22,74 34,76 44,72 Z"/><circle cx="80" cy="56" r="11"/>
		<path d="M24,46 C30,36 44,32 54,34 L52,40 C42,40 32,44 26,50 Z"/><path d="M18,66 L14,70 L22,72 Z"/>`,
	鸡: `<circle cx="54" cy="58" r="19"/><path d="M38,52 L14,58 L38,66 Z"/>
		<path d="M38,44 L40,22 L48,36 L54,16 L60,34 L68,18 L72,36 L80,30 L76,48 Z"/><ellipse cx="38" cy="78" rx="7" ry="12"/>
		<path d="M66,70 L92,76 L86,84 L94,92 L70,92 Z"/>`,
	狗: `<path d="M0,58 C2,52 16,50 30,48 L42,38 C56,32 76,34 84,46 C90,58 86,72 74,78 L44,80 L30,76 L8,72 C2,70 -2,64 0,58 Z"/>
		<path d="M56,40 L62,8 L78,38 Z"/><path d="M10,70 C12,82 18,90 24,92 C28,86 26,80 22,74 Z"/>`,
	猪: `<path d="M14,44 L12,78 L22,80 C36,88 60,90 78,80 C90,72 92,52 82,42 C70,30 40,32 22,42 Z"/>
		<ellipse cx="11" cy="61" rx="7" ry="17"/><path d="M58,40 C56,22 72,12 86,18 L74,48 Z"/>`,
};
// eye position per head (a small incised dot, visible only when the head is lit; silhouettes don't need it)
K.BEYE = {鼠: [40, 54], 牛: [38, 50], 虎: [36, 52], 兔: [36, 60], 龙: [42, 50], 蛇: [26, 46], 羊: [36, 54], 猴: [44, 50], 鸡: [48, 54], 狗: [38, 54], 猪: [40, 52]};
// mouth (spout point) per head, in box units
K.BMOUTH = {鼠: [4, 65], 牛: [8, 72], 虎: [10, 72], 兔: [20, 72], 龙: [8, 72], 蛇: [4, 52], 羊: [6, 70], 猴: [20, 66], 鸡: [16, 60], 狗: [4, 66], 猪: [6, 66]};
/** a brother's head. (x, y) = neck base centre on screen, size = box px, face -1 left / +1 right. */
const CUT = {虎: 'M50,32 L46,46 M62,30 L58,44 M74,36 L68,48 M86,50 L76,56 M88,64 L78,66', 狗: 'M24,64 L4,64'};
K.bro = (kind, x, y, size, face, fill, extra = '') => { const m = CUT[kind] ? K.uid('bm') : null;
	return `<g transform="translate(${x},${y}) scale(${(-face) * size / 100},${size / 100}) translate(-70,-100)" fill="${fill}" color="${fill}" ${extra}>${m ? `<mask id="${m}" maskUnits="userSpaceOnUse" x="-40" y="-40" width="180" height="180"><rect x="-40" y="-40" width="180" height="180" fill="#fff"/><path d="${CUT[kind]}" stroke="#000" stroke-width="3.2" stroke-linecap="round"/></mask>` : ''}<g ${m ? `mask="url(#${m})"` : ''}><path d="${NECK}"/>${K.BRO[kind]}</g></g>`; };
K.broPt = (kind, x, y, size, face, p) => { const q = (p === 'mouth' ? K.BMOUTH : K.BEYE)[kind]; return [x + (-face) * (q[0] - 70) * size / 100, y + (q[1] - 100) * size / 100]; };
})();
