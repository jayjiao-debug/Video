const svg = `<rect width="1920" height="1080" fill="#3a2a22"/>
${K.horseHead({x: 560, y: 1040, h: 1000, curl: 1, glow: 0.6})}
${K.horseHead({x: 1420, y: 640, h: 560, curl: 0, glow: 0.4, mood: 'fire'})}
${K.horseHead({x: 1180, y: 1040, h: 300, curl: 1, glow: 0.6})}
${K.horseHead({x: 1700, y: 1040, h: 300, curl: 1, glow: 0.6, flip: true})}`;
K.page(svg, '');
