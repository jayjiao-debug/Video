// Storyboard key frames for 林冲 (script v3), 9:16, 1080x1920, 国风漫画 vector style.
import { front, side, EX, NE } from './manhua.mjs';
import { fullFront } from './fullbody2.mjs';
import { fullSide as inkSide } from './fullbody.mjs';
const f = (n) => (Math.round(n * 10) / 10).toString();
const LN = '#2a1c17';
const L = (w = 4) => `stroke="${LN}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;

function rnd(seed) { let s = seed; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); }
function snow(n, seed, op = 1) {
  const r = rnd(seed); let o = '';
  for (let i = 0; i < n; i++) o += `<circle cx="${f(r() * 1080)}" cy="${f(r() * 1920)}" r="${f(2 + r() * r() * 9)}" fill="#fff" opacity="${f((0.45 + r() * 0.55) * op)}"/>`;
  return o;
}
const head = (part, x, y, k) => `<g transform="translate(${f(x - 300 * k)},${f(y - 400 * k)}) scale(${k})">${part.body}</g>`;
const grad = (id, a, b, vertical = true) => `<linearGradient id="${id}" x1="0" y1="0" x2="${vertical ? 0 : 1}" y2="${vertical ? 1 : 0}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
// subtitles: ≤16 字 per row; long lines split at the comma nearest the middle
function splitSub(t) {
  const n = t.replace(/[，。：？！—…\s]/g, '').length;
  if (n <= 16) return [t];
  const cuts = [...t.matchAll(/[，：—]/g)].map((m) => m.index + 1);
  if (!cuts.length) return [t];
  const best = cuts.reduce((a, b) => (Math.abs(b - t.length / 2) < Math.abs(a - t.length / 2) ? b : a));
  return [t.slice(0, best).replace(/[，]$/, ''), t.slice(best)];
}
const sub = (t, y = 1440) => !t ? '' : splitSub(t).map((row, i, arr) => `<text x="540" y="${y + (i - (arr.length - 1)) * 70}" text-anchor="middle" font-family="Noto Sans CJK SC" font-weight="700" font-size="54" fill="#fbf7ef" stroke="#141010" stroke-width="10" paint-order="stroke" stroke-linejoin="round">${row}</text>`).join('');
const frame = (defs, body, subtitle) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920"><defs>${defs}</defs>${body}${sub(subtitle)}</svg>`;
const XIUSHU = ['东京八十万禁军教头林冲', '为因身犯重罪断配沧州', '去后存亡不保有妻张氏', '年少情愿立此休书任从', '改嫁永无争执委是自行', '情愿即非相逼恐后无凭', '立此文约为照'];
function xiushuPaper(x0, y0, w, h, fs = 62, fade = 1) {
  let o = `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="#efe5cf" ${L(3)}/><rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="url(#pg)" opacity="0.5"/>`;
  XIUSHU.forEach((col, i) => {
    const x = x0 + w - 70 - i * (fs * 1.45);
    o += `<text x="${f(x)}" y="${y0 + 90}" font-family="Ma Shan Zheng" font-size="${fs}" fill="#1d1712" style="writing-mode:vertical-rl;letter-spacing:4px" opacity="${fade}">${col}</text>`;
  });
  return o;
}
function thumbprint(cx, cy, r = 46, op = 1) {
  let o = `<g opacity="${op}">`;
  for (let k = 0; k < 9; k++) o += `<ellipse cx="${cx}" cy="${cy + k * 1.5}" rx="${r - k * 5}" ry="${(r - k * 5) * 1.3}" fill="none" stroke="#c4372f" stroke-width="3.2" stroke-dasharray="${8 + k} 4"/>`;
  return o + `<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r * 1.3}" fill="#c4372f" opacity="0.18"/></g>`;
}

export const FRAMES = [
  // 01 休书 being written
  { id: 'S01', t: '0.5', note: '休书的原文一笔一笔写出来', make: () => frame(grad('wd', '#3d2c22', '#2a1e17') + grad('pg', '#fff7e6', '#d9c7a4'),
    `<rect width="1080" height="1920" fill="url(#wd)"/>${[...Array(14)].map((_, i) => `<path d="M0,${140 * i + 40} C300,${140 * i + 10} 700,${140 * i + 70} 1080,${140 * i + 30}" stroke="#4a372b" stroke-width="5" fill="none"/>`).join('')}
<g transform="rotate(-3 540 760)">${xiushuPaper(150, 220, 780, 1080)}</g>
<g transform="rotate(32 860 300)"><rect x="700" y="280" width="420" height="22" rx="10" fill="#6b4a2c" ${L(3)}/><path d="M700,280 L640,291 L700,302Z" fill="#1d1712" ${L(2)}/></g>`, '如果有一天，你要亲手写一封休书，给你最爱的人。') },
  // 02 her hands, a tear on the ink
  { id: 'S02', t: '5.5', note: '她攥着休书的手，一滴泪落在墨上晕开', make: () => frame(grad('pg', '#fff7e6', '#d9c7a4') + grad('bg2', '#3a2b26', '#1f1714'),
    `<rect width="1080" height="1920" fill="url(#bg2)"/><g transform="rotate(4 540 1000)">${xiushuPaper(120, 640, 840, 760, 70)}</g>
<path d="M60,700 C120,640 210,640 250,700 C270,760 260,860 230,900 C180,940 100,930 70,880Z" fill="#f2d1b8" ${L()}/><path d="M120,690 C130,740 128,800 118,850 M170,682 C182,740 180,810 170,870 M214,690 C224,740 222,800 212,860" fill="none" ${L(2.4)}/>
<path d="M-20,620 C40,600 80,640 80,700 L60,900 C20,940 -20,940 -40,900Z" fill="#e7c4c9" ${L()}/>
<path d="M1020,720 C960,660 870,660 830,720 C810,780 820,880 850,920 C900,960 980,950 1010,900Z" fill="#f2d1b8" ${L()}/><path d="M960,710 C950,760 952,820 962,870 M910,702 C898,760 900,830 910,890 M866,710 C856,760 858,820 868,880" fill="none" ${L(2.4)}/>
<path d="M1100,640 C1040,620 1000,660 1000,720 L1020,920 C1060,960 1100,960 1120,920Z" fill="#e7c4c9" ${L()}/>
<path d="M560,430 C548,470 540,500 560,520 C580,500 572,470 560,430Z" fill="#cfe9f7" ${L(2)}/>
<ellipse cx="575" cy="1000" rx="70" ry="40" fill="#5a4a3a" opacity="0.35"/><ellipse cx="575" cy="1000" rx="40" ry="22" fill="#1d1712" opacity="0.25"/>`, '她哭着问你：我清清白白，你为什么不要我？') },
  // 03 his face: 隐忍, wet eyes, the cangue
  { id: 'S03', t: '9.8', note: '他红着眼，咬着牙，不敢看她；脖子上套着枷', make: () => {
    const h = front({ ...EX['隐忍'], tear: 1 }, { hat: false, headscarf: 'tokyo', noScarf: true, cangue: true, tattoo: false });
    return frame(grad('bg3', '#4b3529', '#20160f') + h.defs, `<rect width="1080" height="1920" fill="url(#bg3)"/><circle cx="880" cy="320" r="260" fill="#f0b46a" opacity="0.12"/>${head(h, 540, 900, 1.7)}`, '你说不出口——你是怕自己回不来，误了她一辈子。');
  } },
  // 04 wide street: he is led away, she sinks at the door
  { id: 'S04', t: '14.6', note: '公差押着他走远，她瘫坐在门口，开始飘雪', make: () => frame(grad('sk4', '#55657a', '#a9b4c0'),
    `<rect width="1080" height="1920" fill="url(#sk4)"/>
<path d="M0,500 L380,900 L380,1000 L0,1500Z" fill="#3c4655" ${L(3)}/><path d="M1080,500 L700,900 L700,1000 L1080,1500Z" fill="#46505f" ${L(3)}/>
<path d="M0,480 L400,880 L0,880Z M1080,480 L680,880 L1080,880Z" fill="#2b313b"/>
<path d="M0,1500 L380,1000 L700,1000 L1080,1500 L1080,1920 L0,1920Z" fill="#e9eef2"/>
${[0, 1, 2].map((i) => `<g transform="translate(${500 + i * 34},${930 - i * 4}) scale(${0.5 - i * 0.02})"><rect x="-14" y="-90" width="28" height="70" rx="12" fill="#1f2530"/><circle cx="0" cy="-104" r="13" fill="#1f2530"/><rect x="-12" y="-22" width="10" height="40" fill="#1f2530"/><rect x="2" y="-22" width="10" height="40" fill="#1f2530"/>${i === 1 ? '<rect x="-34" y="-86" width="68" height="14" fill="#7a5a3a"/>' : ''}</g>`).join('')}
<path d="M40,1060 L230,1060 L230,1420 L40,1420Z" fill="#2a2420" ${L(3)}/><path d="M60,1300 C90,1250 150,1240 180,1290 C200,1330 190,1390 160,1410 L70,1410 C50,1380 48,1330 60,1300Z" fill="#e7c4c9" ${L(3)}/><circle cx="120" cy="1250" r="30" fill="#1c1a20" ${L(3)}/><circle cx="136" cy="1226" r="14" fill="#1c1a20"/>${snow(220, 4)}`, '可这一别，就是一辈子。') },
  // 05 title
  { id: 'S05', t: '19.5', note: '片名：林冲 · 豹子头', make: () => frame(grad('sk5', '#1b2330', '#36475a'),
    `<rect width="1080" height="1920" fill="url(#sk5)"/>${snow(160, 9, 0.8)}
<text x="560" y="420" font-family="Zhi Mang Xing" font-size="400" fill="#f4efe6" style="writing-mode:vertical-rl">林冲</text>
<text x="300" y="560" font-family="Ma Shan Zheng" font-size="72" fill="#d8d0c2" style="writing-mode:vertical-rl;letter-spacing:10px">豹子头</text>
<rect x="250" y="900" width="110" height="110" fill="#c4372f"/><text x="305" y="975" text-anchor="middle" font-family="Ma Shan Zheng" font-size="46" fill="#f4efe6">人物志</text>
<rect x="268" y="1030" width="74" height="74" fill="none" stroke="#c4372f" stroke-width="6"/><text x="305" y="1086" text-anchor="middle" font-family="Ma Shan Zheng" font-size="52" fill="#c4372f">壹</text>`, '这个人，叫林冲。') },
  // 06 training ground, 东京 look
  { id: 'S06', t: '27.0', note: '东京校场：绿袍头巾的禁军教头', make: () => {
    const b = fullFront(EX['平静'], { tokyo: true, inner: true });
    return frame(grad('sk6', '#f3e3c3', '#e2c290') + b.defs, `<rect width="1080" height="1920" fill="url(#sk6)"/>
<path d="M0,1100 L1080,1100 L1080,1920 L0,1920Z" fill="#d7b483"/><rect x="0" y="900" width="1080" height="200" fill="#a6483a" ${L(3)}/><path d="M0,900 L1080,900 L1080,870 L0,870Z" fill="#3a2a22"/>
${[120, 330, 760, 960].map((x) => `<rect x="${x}" y="520" width="10" height="400" fill="#3a2a22"/><path d="M${x + 10},530 L${x + 130},560 L${x + 10},640Z" fill="#c4372f" ${L(2.5)}/>`).join('')}
<g transform="translate(40,-40) scale(1.0)">${b.body}</g>`, '你本来什么都有：八十万禁军教头，一身本事。');
  } },
  // 07 warm window at night, her silhouette sewing
  { id: 'S07', t: '31.5', note: '家里亮着灯，窗上是她缝衣的剪影', make: () => frame(grad('sk7', '#1f2633', '#2d3646'),
    `<rect width="1080" height="1920" fill="url(#sk7)"/><rect x="120" y="380" width="840" height="1120" fill="#3d3530" ${L(4)}/>
<rect x="260" y="560" width="560" height="620" fill="#f6c67a"/><rect x="260" y="560" width="560" height="620" fill="url(#lw)"/>
${[0, 1, 2, 3].map((i) => `<rect x="${260 + i * 140}" y="560" width="8" height="620" fill="#3d3530"/>`).join('')}${[0, 1, 2].map((i) => `<rect x="260" y="${560 + i * 206}" width="560" height="8" fill="#3d3530"/>`).join('')}
<path d="M480,1180 C470,1080 500,1000 560,990 C590,940 640,940 650,990 C700,1010 720,1100 700,1180Z" fill="#3a2a22" opacity="0.85"/><circle cx="604" cy="930" r="44" fill="#3a2a22" opacity="0.85"/><circle cx="630" cy="890" r="24" fill="#3a2a22" opacity="0.85"/>
<path d="M650,1040 L760,980" stroke="#3a2a22" stroke-width="5" opacity="0.85"/>`.replace('url(#lw)', '#ffd99a'), '家里的娘子，成亲三年，没跟你红过一次脸。') },
  // 08 temple courtyard: the nobleman blocks her
  { id: 'S08', t: '38.8', note: '岳庙：高衙内（簪花的花花太岁）拦住她', make: () => {
    const g = side({ ...NE, brow: 0.3, eye: 0.8, mouth: 0.8 }, { hat: false, cap: 'gao', beard: false, col: { coat: '#7a3a5a', cloak: '#a34f6f', cloakS: '#7a3a5a', scarf: '#5a2a40', scarfS: '#40202e' } });
    return frame(grad('sk8', '#f2dcb5', '#e0b98a') + g.defs, `<rect width="1080" height="1920" fill="url(#sk8)"/>
<path d="M0,1250 L1080,1250 L1080,1920 L0,1920Z" fill="#c9a679"/><path d="M80,420 L1000,420 L1060,500 L20,500Z" fill="#7a3a2a" ${L(3)}/><rect x="120" y="500" width="40" height="760" fill="#9a4a36"/><rect x="920" y="500" width="40" height="760" fill="#9a4a36"/>
<path d="M440,1180 L640,1180 L620,1300 L460,1300Z" fill="#6b5a3a" ${L(3)}/><path d="M520,1180 C500,1080 560,1040 540,960 C600,1020 560,1090 580,1180" fill="none" stroke="#d8cfc2" stroke-width="6" opacity="0.8"/>
<g transform="translate(-140,560) scale(0.85)"><path d="M300,900 C260,700 300,560 380,520 C460,500 520,560 520,700 L560,900Z" fill="#efd9dc" ${L()}/><circle cx="410" cy="470" r="70" fill="#1c1a20" ${L()}/><circle cx="440" cy="400" r="40" fill="#1c1a20"/><path d="M360,560 C340,650 350,760 380,860" stroke="#d8b7bc" stroke-width="6" fill="none"/></g>
<g transform="translate(1180,300) scale(-1.25,1.25)">${g.body}</g>`, '直到那天在岳庙，有人当众调戏她。');
  } },
  // 09 two-shot: fist raised, the sneer
  { id: 'S09', t: '42.4', note: '他扳过那人，拳头举起——认出是上司的干儿子', make: () => {
    const l = side(EX['怒'], { hat: false, col: { coat: '#2f6b52', cloak: '#2f6b52', cloakS: '#22513e' } });
    const g = side({ ...NE, brow: 0.35, eye: 0.75, mouth: 0.9 }, { hat: false, cap: 'gao', beard: false, col: { coat: '#7a3a5a', cloak: '#a34f6f', cloakS: '#7a3a5a', scarf: '#5a2a40', scarfS: '#40202e' } });
    return frame(grad('sk9', '#e8c9a0', '#b9875a') + l.defs + g.defs, `<rect width="1080" height="1920" fill="url(#sk9)"/>
<g transform="translate(-160,520) scale(1.3)">${l.body}<path d="M140,94 C120,40 150,0 200,6 C250,10 262,60 240,100 C230,130 160,140 140,94Z" fill="#f3d3b8" ${L(3)}/><path d="M160,40 C190,30 220,34 240,46 M150,66 C180,58 214,60 244,72" fill="none" ${L(2.4)}/><path d="M168,130 C200,220 230,330 260,420" stroke="#2f6b52" stroke-width="60" stroke-linecap="round"/></g>
<g transform="translate(1260,620) scale(-1.15,1.15)">${g.body}</g>`, '却认出，那是你上司的干儿子。');
  } },
  // 10 the fist opening
  { id: 'S10', t: '49.0', note: '特写：拳头慢慢松开', make: () => frame(grad('sk10', '#2a1f1a', '#120d0b'),
    `<rect width="1080" height="1920" fill="url(#sk10)"/><path d="M380,1500 C360,1300 360,1150 400,1060 L700,1060 C740,1150 740,1300 720,1500Z" fill="#2f6b52" ${L(5)}/>
<path d="M360,1080 C330,940 360,760 470,700 C560,660 680,690 720,780 C760,880 740,1000 700,1080Z" fill="#f3d3b8" ${L(5)}/>
<path d="M440,720 C430,640 470,600 510,610 C540,620 548,680 540,720 M540,706 C540,600 600,570 630,600 C660,630 650,690 640,730 M640,740 C670,680 720,690 730,730" fill="#f3d3b8" ${L(5)}/>
<path d="M420,860 C470,880 560,880 640,850 M440,940 C500,960 580,960 660,930" fill="none" ${L(3)}/><path d="M300,700 l-60,-20 M290,780 l-70,0 M780,700 l60,-20 M790,780 l70,0" ${L(4)} opacity="0.6"/>`, '拳头，软了。') },
  // 11 隐忍 1
  { id: 'S11', t: '50.8', note: '隐忍：咬紧牙关', make: () => { const h = front(EX['隐忍'], { hat: false, headscarf: 'tokyo', noScarf: true, col: { coat: '#2f6b52', coatS: '#22513e' } });
    return frame(grad('sk11', '#3a2f2a', '#1a1412') + h.defs, `<rect width="1080" height="1920" fill="url(#sk11)"/>${head(h, 540, 860, 1.7)}`, '你忍了。'); } },
  // 12 陆谦 pouring wine, half his face in shadow
  { id: 'S12', t: '52.4', note: '陆谦笑着斟酒，半张脸在阴影里', make: () => {
    const h = front({ ...NE, mouth: 0.6, eye: 0.85, look: [-0.4, 0.2] }, { hat: false, headscarf: 'futou', beard: false, thinMoustache: true, noScarf: false, shade: 'half', col: { coat: '#5a4a6a', cloak: '#3a3040', cloakS: '#2a2230', scarf: '#2a2230', scarfS: '#1a1620' } });
    return frame(grad('sk12', '#4a3328', '#1c130f') + h.defs, `<rect width="1080" height="1920" fill="url(#sk12)"/><circle cx="240" cy="380" r="200" fill="#f0b46a" opacity="0.15"/>${head(h, 560, 820, 1.55)}
<path d="M120,1180 C120,1120 200,1100 240,1120 L300,1060 L330,1080 L290,1150 C320,1200 300,1300 230,1310 C150,1310 120,1250 120,1180Z" fill="#8a6a4a" ${L()}/><path d="M300,1080 C330,1140 350,1200 360,1260" stroke="#e8d8b0" stroke-width="7" fill="none"/>
<path d="M330,1260 L420,1260 L410,1320 L340,1320Z" fill="#d8d0c0" ${L()}/>`, '最好的朋友陆谦，帮着他们害你，');
  } },
  // 13 tattoo, cangue, head bowed
  { id: 'S13', t: '60.3', note: '脸上刺了字，戴着枷，低下头', make: () => { const h = front({ ...EX['隐忍'], eye: 0.25, look: [0, 0.8] }, { hat: false, headscarf: 'tokyo', noScarf: true, cangue: true, tattoo: true });
    return frame(grad('sk13', '#5b6470', '#2a2f37') + h.defs, `<rect width="1080" height="1920" fill="url(#sk13)"/><g transform="rotate(-5 540 900)">${head(h, 540, 900, 1.7)}</g>`, '你还是忍了。'); } },
  // 14 the mountain temple in the snow at night
  { id: 'S14', t: '75.1', note: '雪夜，山神庙，石头抵住庙门；远处草料场起火', make: () => frame(grad('sk14', '#141b26', '#33445a'),
    `<rect width="1080" height="1920" fill="url(#sk14)"/><ellipse cx="160" cy="1040" rx="320" ry="160" fill="#f08a3a" opacity="0.35"/><path d="M40,1060 C80,960 120,990 150,900 C180,980 220,940 250,1060Z" fill="#e2562f" opacity="0.8"/>
<path d="M0,1080 C300,1040 700,1060 1080,1030 L1080,1920 L0,1920Z" fill="#e6ecf1"/>
<path d="M300,760 L860,760 L960,860 L200,860Z" fill="#2a2b30" ${L()}/><path d="M290,752 L870,752 L940,830 C760,810 400,810 220,830Z" fill="#f5f8fa" ${L(3)}/>
<rect x="290" y="860" width="580" height="320" fill="#4a3d36" ${L()}/><rect x="510" y="930" width="140" height="250" fill="#1a1412" ${L()}/><path d="M640,1180 C620,1130 680,1110 720,1130 C760,1150 750,1190 720,1196 L650,1196Z" fill="#8a8a92" ${L()}/>
<rect x="330" y="920" width="120" height="100" fill="#2a221d" ${L(3)}/><rect x="710" y="920" width="120" height="100" fill="#2a221d" ${L(3)}/>${snow(260, 14)}`, '雪压塌了草屋，你躲进山神庙，搬石头抵住了门。') },
  // 15 eyes in the dark, firelight
  { id: 'S15', t: '86.9', note: '特写：黑暗里他的眼睛，火光映红', make: () => { const h = front({ ...NE, brow: -0.6, eye: 1.05 }, { hat: false, headscarf: 'tokyo', noScarf: true, tattoo: true, light: '#ff5a2a' });
    return frame(h.defs, `<rect width="1080" height="1920" fill="#0d0a0a"/><g>${head(h, 540, 1260, 4.2)}</g><rect x="0" y="0" width="1080" height="560" fill="#0d0a0a"/><rect x="0" y="1360" width="1080" height="560" fill="#0d0a0a"/>`, '忍，是回不去的。'); } },
  // 16 lone figure in the snow
  { id: 'S16', t: '96.2', note: '他一个人走进风雪：斗笠、花枪、葫芦的剪影', make: () => {
    const sil = inkSide('P', undefined, { silhouette: true });
    return frame(grad('sk16', '#9aa8b8', '#e6ecf1'), `<rect width="1080" height="1920" fill="url(#sk16)"/><path d="M0,1500 C400,1460 700,1480 1080,1440 L1080,1920 L0,1920Z" fill="#f4f7f9"/>
<g transform="translate(250,560) scale(0.55)">${sil.replace(/<svg[^>]*>/, '').replace('</svg>', '').replace(/<rect width="1000" height="2000"[^>]*\/>/, '').replace(/<path d="M0,1830[^>]*\/>/, '')}</g>${snow(320, 16)}`, '那一夜雪越下越大，你一个人，上了梁山。');
  } },
  // 17 已故半载
  { id: 'S17', t: '109.8', note: '梁山泊芦苇与小船，「已故半载」四个大字', make: () => frame(grad('sk17', '#c9d3d6', '#8fa4ad'),
    `<rect width="1080" height="1920" fill="url(#sk17)"/><path d="M0,1000 L1080,1000 L1080,1920 L0,1920Z" fill="#6f8790"/>${[...Array(8)].map((_, i) => `<path d="M${60 + i * 90},${1080 + i * 50} h${300 - i * 10}" stroke="#a9bcc3" stroke-width="5" stroke-linecap="round"/>`).join('')}
<path d="M300,1120 L560,1120 L520,1160 L340,1160Z" fill="#2a2420" ${L(3)}/><rect x="420" y="1060" width="22" height="60" fill="#2a2420"/><circle cx="431" cy="1046" r="14" fill="#2a2420"/>
${[...Array(18)].map((_, i) => `<path d="M${700 + i * 22},1920 C${700 + i * 22},1600 ${720 + i * 22},1450 ${740 + i * 24},${1250 + (i % 4) * 40}" stroke="#3a4a3a" stroke-width="7" fill="none"/>`).join('')}
<text x="760" y="240" font-family="Zhi Mang Xing" font-size="190" fill="#1d2326" style="writing-mode:vertical-rl">已故半载</text>`, '娘子被逼，自缢身死，已故半载。') },
  // 18 his face: grief
  { id: 'S18', t: '113.6', note: '悲：一滴泪', make: () => { const h = front(EX['悲'], { hat: false, headscarf: 'tokyo', noScarf: true, tattoo: true });
    return frame(grad('sk18', '#5b6c78', '#2b343c') + h.defs, `<rect width="1080" height="1920" fill="url(#sk18)"/>${head(h, 540, 860, 1.7)}`, '你哭了。'); } },
  // 19 empty room at 六和寺
  { id: 'S19', t: '124.8', note: '六和寺空屋：斗笠和花枪靠在门边', make: () => frame(grad('sk19', '#3a3230', '#211b1a'),
    `<rect width="1080" height="1920" fill="url(#sk19)"/><path d="M620,300 L960,300 L960,900 L620,900Z" fill="#e8dcc0" opacity="0.9" ${L(4)}/><path d="M620,900 L960,900 L1080,1500 L500,1500Z" fill="#e8dcc0" opacity="0.18"/>
${[1, 2, 3].map((i) => `<rect x="${620 + i * 85}" y="300" width="8" height="600" fill="#3a3230"/>`).join('')}<path d="M0,1300 L1080,1300 L1080,1920 L0,1920Z" fill="#4a3d36"/>
<path d="M180,600 L250,1320" stroke="${LN}" stroke-width="20" stroke-linecap="round"/><path d="M180,600 L250,1320" stroke="#7a5332" stroke-width="12" stroke-linecap="round"/><path d="M170,600 L160,500 L196,594Z" fill="#d4dadf" ${L(3)}/>
<path d="M172,590 q-40,30 -30,90 M180,592 q-20,40 -10,96 M188,592 q10,40 0,90" stroke="#c4372f" stroke-width="8" fill="none" stroke-linecap="round"/>
<ellipse cx="420" cy="1300" rx="190" ry="34" fill="#ddd6ca" ${L(4)}/><path d="M320,1296 C330,1230 380,1210 420,1210 C470,1210 512,1240 520,1296Z" fill="#ddd6ca" ${L(4)}/>`, '再后来，你病倒在杭州六和寺，再没起来。') },
  // 20 callback: the 休书, the print fading, the question
  { id: 'S20', t: '138.8', note: '回到开场的休书，手印慢慢淡去；结尾提问', make: () => frame(grad('pg', '#fff7e6', '#d9c7a4') + grad('wd', '#3d2c22', '#2a1e17'),
    `<rect width="1080" height="1920" fill="url(#wd)"/><g transform="rotate(-3 540 760)" opacity="0.55">${xiushuPaper(150, 220, 780, 1080, 62, 0.6)}${thumbprint(300, 1150, 46, 0.35)}</g>
<rect x="0" y="0" width="1080" height="1920" fill="#000" opacity="0.35"/>
<text x="540" y="900" text-anchor="middle" font-family="Noto Sans CJK SC" font-weight="900" font-size="74" fill="#fbf7ef">如果重来一次，</text><text x="540" y="1010" text-anchor="middle" font-family="Noto Sans CJK SC" font-weight="900" font-size="74" fill="#fbf7ef">岳庙那一拳，你打不打？</text>`, '') },
];
