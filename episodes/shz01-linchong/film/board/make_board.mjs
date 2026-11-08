// v4 keyframe storyboard sheets: node make_board.mjs <outdir>
// Reused frames come from /dev/shm/shz01/board/v2/t_XXX.XX.jpg (v2 timeline, --clean), new ones from
// /dev/shm/shz01/board/new/<KEY>.jpg (film/board/v4new.mjs). Missing frames show a placeholder.
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const V2 = (t) => `/dev/shm/shz01/board/v2/t_${t.toFixed(2).padStart(6, '0')}.jpg`;
const NEW = (k) => `/dev/shm/shz01/board/new/${k}.jpg`;
// [key, v4 time, line id, line, picture note, source, tag]
const K = [
  ['K01', 0.3, 'W01', '东京八十万禁军教头林冲，为因身犯重罪，断配沧州，', '休书在写，他的手签字（旁白念休书原文）', V2(0.6), 'hand'],
  ['K02', 5.9, 'W02', '……情愿立此休书，任从改嫁。', '红手印按下，抬手', V2(4.3), 'hand'],
  ['K03', 9.2, 'W03', '这是林冲留给妻子的休书。', '戴枷强忍泪的林冲', V2(12.0), ''],
  ['K04', 12.1, 'W04', '成亲三年，两人没红过一次脸。', '她的手拿着休书，他在后面', V2(9.4), 'hand'],
  ['K05', 15.5, 'W05', '他为什么要休了她？', '泪落在「休」字上', V2(8.9), ''],
  ['K06', 18.66, '—', '（标题）', '「林冲」笔画 · 印章 · 帽枪葫芦剪影', V2(24.0), ''],
  ['K07', 27.0, 'W06', '那时候，他有一身本事，', '教场练枪', V2(28.7), ''],
  ['K08', 29.5, 'W06', '……有一个家。', '暖窗里两个人的影子', V2(34.0), ''],
  ['K09', 31.6, 'W07', '直到那天在岳庙，有人调戏他的娘子。', '岳庙，高衙内拦路', V2(41.5), ''],
  ['K10', 35.8, 'W08', '他一把扳过那人，拳头举起来——', '扳人举拳', V2(45.3), 'hand'],
  ['K11', 39.7, 'W09', '却认出，那是上司高太尉的干儿子。', '高衙内露脸', V2(47.0), ''],
  ['K12', 43.6, 'W10', '拳头，软了。', '拳头一根根松开', V2(50.1), 'hand'],
  ['K13', 45.8, 'W11', '连最好的朋友陆谦，也站到了他们那边。', '陆谦笑脸入阴影', V2(54.5), ''],
  ['K14', 50.2, 'W12', '一把宝刀，把他引进了白虎节堂。', '白虎节堂，高俅指他', V2(59.6), ''],
  ['K15', 53.6, 'W13', '刺了面，押往沧州。', '刺字 → 上枷', V2(62.5), ''],
  ['K16', 56.0, 'W14', '临走前，他请人写了这封休书。', '酒馆：代笔先生写，林冲口述', NEW('K16'), 'new'],
  ['K17', 59.3, 'W15', '他怕自己死在路上，', '他看着休书', V2(11.0), ''],
  ['K18', 61.6, 'W16', '更怕高衙内逼她，误了她一辈子。', '她在门口的背影', V2(16.2), ''],
  ['K19', 65.0, 'W17', '她哭着问：我清清白白，你为什么不要我？', '越过她肩：休书和泪', V2(7.0), 'hand'],
  ['K20', 69.4, 'W18', '他只说：我是好意。', '他的特写，嘴唇动了动', V2(10.2), ''],
  ['K21', 71.6, 'W19', '岳父说：放你回来时，依旧夫妻完聚。', '岳父的手搭在肩上（笛声回来）', V2(70.0), 'hand'],
  ['K22', 75.6, 'W20', '为了这句话，他忍着活下去。', '记忆化成沧州初雪', V2(73.3), ''],
  ['K23', 78.9, 'W21', '沧州下了大雪，压塌了他的草屋。', '草料场，屋顶塌', V2(75.4), ''],
  ['K24', 82.6, 'W22', '他躲进山神庙，草料场却烧了起来。', '石头抵门，门缝透火光', V2(80.6), ''],
  ['K25', 86.5, 'W23–24', '门外是陆谦的声音：烧死了，拾他一两块骨头回去交差。', '门缝里三个剪影', V2(84.0), ''],
  ['K26', 92.3, 'W25', '回不去了。', '火光一线照在眼睛上（静音）', V2(91.0), ''],
  ['K27', 93.65, 'W26', '他一把拽开庙门。', '起拍：庙门大开，火和风雪扑进来', NEW('K26'), 'new'],
  ['K28', 95.5, 'W27', '一枪戳倒差拨，', '火光剪影：出枪，差拨倒飞', NEW('K27'), 'new'],
  ['K29', 97.6, 'W27', '再一枪，追倒了逃跑的富安。', '富安逃，林冲追上第二枪', NEW('K28'), 'new'],
  ['K30', 100.0, 'W28', '陆谦被他掀翻在雪里，刀，就搁在脸上。', '雪地上踩住陆谦，刀在脸边', NEW('K29'), 'new'],
  ['K31', 104.2, 'W29', '杀人可恕，情理难容！', '火光里的怒脸', NEW('K30'), 'new'],
  ['K32', 106.9, 'W30', '这一回，他没有再忍。', '刀落即切：雪地泼墨', NEW('K31'), 'new'],
  ['K33', 109.4, 'W31', '再后来，他落草梁山。', '风雪孤影（帽、枪、葫芦）', V2(97.0), ''],
  ['K34', 111.8, 'W32', '他想接娘子上山，却一拖再拖。', '梁山泊码头', V2(101.0), ''],
  ['K35', 115.2, 'W33', '派去的人回来说：娘子被逼自尽，已故半载。', '小船靠岸 →「已故半载」书法', V2(114.2), ''],
  ['K36', 119.2, 'W34', '他哭了。', '一滴泪', V2(115.9), ''],
  ['K37', 120.6, 'W35', '那封休书，没能护住她。', '灯下，他手里的旧休书', NEW('K36'), 'new'],
  ['K38', 123.3, 'W36', '他立下它，只是想让她好好活着。', '红手印特写', V2(130.5), ''],
  ['K39', 127.0, 'W37', '从此，他心里再没有可挂念的人。', '空窗', V2(118.5), ''],
  ['K40', 134.2, 'W38', '依旧夫妻完聚——', '大字书法，墨化成雪', V2(135.8), ''],
  ['K41', 137.4, 'W39', '这句话，他终究没能等到。', '只剩红手印 → J 印', V2(137.2), ''],
  ['END', 141.86, '—', '（片尾，无问题）', 'J 印 · 标题 · 关注 · 下回：鲁智深 · 资料', V2(146.0), ''],
];
const TAG = { new: ['新画', '#b3302a'], hand: ['手→2D重画', '#7a5a2a'], '': ['沿用 v2', '#4a5a4a'] };

const out = process.argv[2] || '/dev/shm/shz01/board/sheets';
fs.mkdirSync(out, { recursive: true });
const PER = 15;
const cell = (k) => {
  const [key, t, id, line, note, src, tag] = k;
  const ok = fs.existsSync(src);
  const [tl, tc] = TAG[tag];
  const img = ok ? `<img src="file://${src}">` : `<div class="ph">${key} 待画</div>`;
  return `<div class="c"><div class="f">${img}<span class="k">${key}</span><span class="tg" style="background:${tc}">${tl}</span></div>
  <div class="t"><b>${t.toFixed(1)}s</b> · ${id}</div><div class="l">${line}</div><div class="n">${note}</div></div>`;
};
const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const pages = Math.ceil(K.length / PER);
for (let p = 0; p < pages; p++) {
  const chunk = K.slice(p * PER, (p + 1) * PER);
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  body{margin:0;background:#16130f;color:#efe6d4;font-family:'Noto Sans CJK SC';width:1920px}
  h1{font-size:30px;margin:22px 30px 6px;font-weight:700;color:#E2B865} .sub{margin:0 30px 14px;color:#a99f8e;font-size:18px}
  .g{display:grid;grid-template-columns:repeat(3,620px);gap:16px 20px;padding:0 20px 24px 30px}
  .f{position:relative;width:620px;height:349px;background:#000;border-radius:4px;overflow:hidden}
  .f img{width:620px;height:349px;display:block} .ph{width:620px;height:349px;display:flex;align-items:center;justify-content:center;color:#6b6257;font-size:28px;border:2px dashed #4a4038;box-sizing:border-box}
  .k{position:absolute;left:8px;top:8px;background:#000c;padding:2px 8px;font-size:18px;font-weight:700}
  .tg{position:absolute;right:8px;top:8px;padding:2px 8px;font-size:16px;font-weight:700;border-radius:3px}
  .t{margin-top:6px;font-size:17px;color:#c9b98f} .l{font-size:21px;font-weight:700;line-height:1.35;margin-top:2px} .n{font-size:16px;color:#a99f8e;margin-top:2px}
  </style></head><body><h1>《林冲为什么要休妻？》v4 关键帧分镜 · ${p + 1}/${pages}</h1>
  <div class="sub">配乐《笛子戏》不变 · 时间为 v4 旁白位置 · 「沿用 v2」= 现有镜头重剪 · 「新画」= 新镜头 · 「手→2D重画」= 手部改用 2D 新画法</div>
  <div class="g">${chunk.map(cell).join('')}</div></body></html>`;
  const f = `${out}/board_${p + 1}.html`;
  fs.writeFileSync(f, html);
  const pg = await browser.newPage({ viewport: { width: 1920, height: 1000 } });
  await pg.goto('file://' + f);
  await pg.evaluate(() => Promise.all([...document.images].map((i) => (i.complete ? 1 : new Promise((r) => { i.onload = i.onerror = r; })))));
  await pg.evaluate(() => document.fonts.ready);
  await pg.screenshot({ path: `${out}/林冲v4_分镜_${p + 1}.jpg`, type: 'jpeg', quality: 86, fullPage: true });
  await pg.close();
}
await browser.close();
console.log('sheets in', out);
