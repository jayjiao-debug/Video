// HTML layer on top of the canvas: subtitles, counters, tags, big numbers, title, end card. Rebuilt every frame.
export const GOLD = '#f6cf78', BLUE = '#3d6fd8', RED = '#d8463a';
const PUNCT = '？！。，：；、”';
const sh = (c: string) => `0 0 3px rgba(8,6,10,.95), 0 0 10px rgba(8,6,10,.7), 0 0 6px ${c}, 0 0 26px ${c}, 0 2px 10px rgba(0,0,0,.65)`;
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
/** fade envelope for an element alive in [a,b] (s): 0.25 s in, 0.25 s out */
export const env = (t: number, a: number, b: number, fi = 0.22, fo = 0.22) => clamp01((t - a) / fi) * clamp01((b - t) / fo);
/** subtitle with [key words] in gold; trailing full-width punctuation pulled back so the ink is centred */
export const sub = (hud: HTMLElement, text: string, t: number, a: number, b: number) => {
	const o = env(t, a, b, 0.18, 0.18); if (o <= 0) return;
	let html = text.replace(/\[([^\]]+)\]/g, `<span style="color:${GOLD};text-shadow:0 0 3px rgba(8,6,10,.95),0 0 18px rgba(246,207,120,.45),0 4px 26px rgba(8,6,10,.6)">$1</span>`);
	const last = text.replace(/\]$/, '').slice(-1);
	if (PUNCT.includes(last)) html = html.replace(/(.)(<\/span>)?$/, (m, ch, sp) => `<span style="margin-right:-0.54em">${ch}</span>${sp ?? ''}`);
	hud.insertAdjacentHTML('beforeend', `<div class="sub" style="opacity:${o}">${html}</div>`);
};
export const counters = (hud: HTMLElement, b: number, r: number, o = 1, labels?: [string, string]) => {
	if (o <= 0) return;
	hud.insertAdjacentHTML('beforeend', `<div class="num" style="left:86px;top:50px;font-size:112px;opacity:${o};text-shadow:${sh(BLUE)}">${b}</div><div class="num" style="right:86px;top:50px;font-size:112px;text-align:right;opacity:${o};text-shadow:${sh(RED)}">${r}</div>` +
		(labels ? `<div class="lbl" style="left:92px;top:182px;font-size:36px;opacity:${o * 0.9}">${labels[0]}</div><div class="lbl" style="right:92px;top:182px;font-size:36px;text-align:right;opacity:${o * 0.9}">${labels[1]}</div>` : ''));
};
/** a label at a screen point; anchor c = centred */
export const tag = (hud: HTMLElement, x: number, y: number, text: string, o: number, size = 44, color = '#fff', glow?: string, anchor: 'l' | 'c' | 'r' = 'c') => {
	if (o <= 0) return; const tr = anchor === 'c' ? 'translate(-50%,-50%)' : anchor === 'r' ? 'translate(-100%,-50%)' : 'translate(0,-50%)';
	hud.insertAdjacentHTML('beforeend', `<div class="lbl" style="left:${x}px;top:${y}px;transform:${tr};font-size:${size}px;color:${color};opacity:${o};${glow ? `text-shadow:${sh(glow)}` : ''}">${text}</div>`);
};
/** big number / word with a slam: scale from 1.6 → 1 with a short damped jolt */
export const slam = (hud: HTMLElement, x: number, y: number, text: string, t: number, a: number, b: number, size = 220, glow = BLUE, color = '#fff') => {
	const o = env(t, a, b, 0.06, 0.3); if (o <= 0) return; const u = t - a;
	const s = u < 0.12 ? 1.6 - 0.6 * (u / 0.12) : 1 + 0.05 * Math.exp(-(u - 0.12) * 9) * Math.sin((u - 0.12) * 40);
	hud.insertAdjacentHTML('beforeend', `<div class="num" style="left:${x}px;top:${y}px;transform:translate(-50%,-50%) scale(${s});font-size:${size}px;color:${color};opacity:${o};text-shadow:${sh(glow)}">${text}</div>`);
};
/** a feathered scrim behind a block of text (owner: no boxes) */
export const scrim = (hud: HTMLElement, x: number, y: number, w: number, h: number, o: number) => { if (o <= 0) return; hud.insertAdjacentHTML('beforeend', `<div style="position:absolute;left:${x - w / 2}px;top:${y - h / 2}px;width:${w}px;height:${h}px;background:rgba(14,10,14,.58);filter:blur(34px);opacity:${o}"></div>`); };
export const html = (hud: HTMLElement, s: string) => hud.insertAdjacentHTML('beforeend', s);
