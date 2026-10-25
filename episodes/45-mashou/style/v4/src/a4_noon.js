// A4 「正午12点，十二个【一起喷水】。」 (39.94 s, the HIT): the 海晏堂 water clock as memory at noon, frontal 八 view.
// Two rows of six on the two terraces, facing the pool; you third from the front on the left; all twelve arcs up at once.
const items = [];
for (let i = 5; i >= 0; i--) for (const side of [-1, 1]) { const k = side < 0 ? K.ROW_L[i] : K.ROW_R[i]; items.push({k, side, i, st: K.statue(k, side, i, 'noon')}); }
const P = [960, 0];
let statues = '', arcs = '';
items.forEach(({k, side, i, st}) => {
	statues += `<g filter="url(#rimSun)">${st.svg}</g>`;
	if (st.hero && !window.NOHERO) statues += K.horseHead(st.hero);
	const land = [960 + (side < 0 ? -1 : 1) * (50 + 130 * (1 - i / 5)), 905 - 220 * (i / 5) - 4];
	const you = k === '马';
	arcs += K.arc(st.mouth, land, 150 * st.s + 40, st.s * (you ? 1.15 : 1), you ? {core: '#FFE2B4', glow: '#FFB070', gA: 0.5} : {});
});
const svg = `<defs>
 <linearGradient id="sky" x1="0" x2="0" gradientUnits="userSpaceOnUse" y1="0" y2="660"><stop offset="0" stop-color="#34494E"/><stop offset=".36" stop-color="#5F716C"/><stop offset=".62" stop-color="#A39C84"/><stop offset="1" stop-color="#CDBB93"/></linearGradient>
 <linearGradient id="poolN" x1="0" x2="0" gradientUnits="userSpaceOnUse" y1="670" y2="930"><stop offset="0" stop-color="#9DAE9F"/><stop offset=".5" stop-color="#6B857B"/><stop offset="1" stop-color="#4C645D"/></linearGradient>
 <linearGradient id="fg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#5F574A"/><stop offset="1" stop-color="#2C2721"/></linearGradient>
 <radialGradient id="vig" cx="960" cy="600" r="1150" gradientUnits="userSpaceOnUse"><stop offset=".45" stop-color="#1A140F" stop-opacity="0"/><stop offset="1" stop-color="#1A140F" stop-opacity=".85"/></radialGradient>
 ${K.rimFilter('rimSun', 3, 5, '#F6E9C8', 0.85, 1.0)}
 ${K.blur('hz', 3)}${K.blur('hz8', 10)}
</defs>
<rect width="1920" height="1080" fill="url(#sky)"/><g transform="translate(960,620) scale(1.22) translate(-960,-620)">
<g filter="url(#hz8)" opacity=".85">
 ${Array.from({length: 22}, (_, i) => `<ellipse cx="${60 + i * 88}" cy="${560 + (i % 3) * 14}" rx="${70 + (i % 4) * 16}" ry="${60 + (i % 5) * 10}" fill="${i % 2 ? '#7C8574' : '#8A9180'}"/>`).join('')}
</g>
<g filter="url(#hz)">${K.facade('noon')}</g>
${K.stairs('noon')}
${K.pool('noon')}
<rect x="0" y="940" width="1920" height="140" fill="url(#fg)"/>
${Array.from({length: 5}, (_, i) => `<path d="M0,${960 + i * i * 6} L1920,${960 + i * i * 6}" stroke="#211C17" stroke-width="2" opacity=".5"/>`).join('')}
${statues}
${arcs}</g>
<rect width="1920" height="1080" fill="url(#vig)"/>`;
K.page(svg, K.hud4({sub: '正午12点，十二个[一起喷水]。', stamp: {s1: '12:00 · 正午', s2: '记忆里的海晏堂水力钟'}, era: '清', rows: [['在家', '12/12', 'hhhhhhyhhhhh']]}), K.CSS4);
