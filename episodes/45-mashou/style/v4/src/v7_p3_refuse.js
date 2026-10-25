// v7 P3 「5天后，买家却说：[这个款不能付]。」 64.56–68.24 s: Beijing, 2009.3.2, the buyer's press table (a silhouette, no face,
// microphones); the Paris result board stands at right and the red 「未付款」 stamp lands on it on 「不能付」. Counter hidden.
const p = K.pressRoom();
const board = K.saleParis({bx: 1290, stamp: true});
// only the board (+ its easel) from the Paris set, re-placed at right
const b0 = board.indexOf('<!-- the result board on its easel -->'), b1 = board.indexOf('<!-- the phone bank');
const easel = board.slice(b0, b1).replace(/M880,860 L950,300 M1120,860 L1050,300 M1000,640 L1000,880/, 'M1410,880 L1480,300 M1650,880 L1580,300 M1530,640 L1530,900').replace('cx="1000" cy="460"', 'cx="1530" cy="460"');
const defs = board.slice(0, board.indexOf('</defs>') + 7);
K.page(p.replace('<rect width="1920" height="1080" fill="url(#bvig)"/>', defs + easel + '<rect width="1920" height="1080" fill="url(#bvig)"/>'),
	K.hud4({sub: '5天后，买家却说：[这个款不能付]。', stamp: {s1: '2009.3.2 · 北京', s2: '买家记者会'}, era: '当代'}), K.CSS4);
