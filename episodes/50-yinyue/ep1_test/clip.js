// Genre-switch demo: renderAt(t) draws layout A from clip_score.json (window.SCORE). Players move on their own notes,
// bob gently on the beat, and the whole stage swaps jazz -> rock with a diagonal wipe on the bar line.
const SC = window.SCORE;
for (const g of ['jazz', 'rock']) SC.parts[g].forEach(([pl, , pat, len, mark]) => { const P = LINEUP[g].players[pl]; if (!P._reset) { P.parts = []; P._reset = true; } P.parts.push([pat, len, mark]); });
const tSw = SC.bars.find((b) => b.genre === 'rock').t;
function stateAt(genre, t) {
	const bars = SC.bars.filter((b) => b.genre === genre); let b = bars[0]; for (const x of bars) if (x.t <= t) b = x;
	const now = Math.floor((t - b.t) / SC.step); const n = LINEUP[genre].players.length;
	const act = Array(n).fill(0), bobs = Array(n).fill(0);
	for (const h of SC.hits) if (h.genre === genre) { const d = t - h.t; if (d >= 0 && d < 1.2) act[h.player] = Math.max(act[h.player], Math.exp(-d / (.1 + .08 * (h.len - 1)))); }
	const beat = (t / (SC.step * 4)) % 1;
	for (let i = 0; i < n; i++) bobs[i] = -10 * Math.pow(1 - beat, 3) * (genre === 'rock' ? 1.6 : 1) * (i % 2 ? .8 : 1);
	return { now: now >= 0 && now < 16 ? now : -1, act, bobs };
}
window.renderAt = (t) => {
	let s = '';
	const u = (t - tSw) / .32;
	if (u < 0) s = genreFrame('jazz', stateAt('jazz', t));
	else if (u >= 1) s = genreFrame('rock', stateAt('rock', t));
	else {
		const x = -400 + 2720 * (1 - Math.pow(1 - u, 2)), k = 300;
		s = genreFrame('rock', stateAt('rock', t)) + `<clipPath id="wipe"><polygon points="${x},0 2400,0 2400,1080 ${x - k},1080"/></clipPath><g clip-path="url(#wipe)">${genreFrame('jazz', stateAt('jazz', t))}</g>`
			+ `<polygon points="${x - 14},0 ${x + 14},0 ${x - k + 14},1080 ${x - k - 14},1080" fill="#F2B632"/>`;
	}
	const tEnd = SC.bars[SC.bars.length - 1].t + SC.bar;
	if (t > tEnd + .4) s += `<rect width="1920" height="1080" fill="#000" opacity="${Math.min(1, (t - tEnd - .4) / .8)}"/>`;
	document.getElementById('art').innerHTML = s;
};
window.READY = true;
