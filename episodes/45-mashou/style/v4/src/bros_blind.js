const ks = ['鼠','牛','虎','兔','龙','蛇','羊','猴','鸡','狗','猪'];
let s = `<rect width="1920" height="1080" fill="#D8D2C0"/><rect y="540" width="1920" height="540" fill="#C0582F"/>`;
ks.forEach((k, i) => { s += K.bro(k, 150 + i * 165, 400, 150, -1, '#2A2019') ;
 s += K.bro(k, 150 + i * 165, 900, 110, 1, '#1d120d'); });
K.page(s, '');
