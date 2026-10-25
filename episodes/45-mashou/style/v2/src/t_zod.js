let svg = `<rect width="1920" height="1080" fill="#cfc6b4"/>`;
Object.keys(K.ZODIAC).forEach((k, i) => { const x = 140 + i * 160; const b = K.stoneBody(x, 700, 220, -1, '#3a2a20'); svg += b.svg + K.zhead(k, b.top[0], b.top[1] + 6, 110, -1, '#3a2a20'); svg += `<text x="${x}" y="760" font-size="40" text-anchor="middle" font-family="Noto Sans CJK SC">${k}</text>`; });
K.page(svg, '');
