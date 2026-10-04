/* Every subtitle, on the beat grid: [from beat, to beat, Chinese, English]. [gold] marks the answer,
   {red} the trap. The film shows each line from b(from) to b(to). */
export const LINES: [number, number, string, string][] = [
  // S1 cold open
  [1, 10, '凌晨两点，一个醉汉晃出了家门', '2 a.m. A drunk man stumbles out of his front door.'],
  [10, 20, '每到路口，他就[随便]挑一条路', 'At every corner he picks a street at random.'],
  [20, 25, '他还能走回家吗？', 'Will he ever find his way home?'],
  [25, 31, '换成一只喝醉的[小鸟]呢？', 'And what about a drunk bird?'],
  // S2 the answer first
  [39, 47, '1921 年，[波利亚]证明了一件怪事', 'In 1921, George Pólya proved something strange.'],
  [47, 55, '在平面上乱走，迟早[一定]会回到家', 'Wander at random on a plane, and you will get home, with probability 1.'],
  [55, 64, '在空中乱飞，却[很可能]永远回不去', 'Wander at random in space, and you very likely never will.'],
  // S3 one dimension, then two
  [64, 72, '先看一维：只能往前，或者往后', 'One dimension: forward or back.'],
  [72, 80, '900 步之内，[97%] 的人回到过起点', 'Within 900 steps, 97% have been back to the start.'],
  [80, 88, '二维：东南西北，随便走', 'Two dimensions: north, south, east or west.'],
  [88, 96, '回得慢多了，但走下去，[全部]都会回来', 'Much slower. But keep walking, and every one comes back.'],
  // S4 Pólya's walk
  [96, 104, '波利亚常去苏黎世郊外的树林散步', 'Pólya liked to walk in the woods outside Zürich.'],
  [104, 112, '一个上午，他[反复]撞见同一对情侣', 'One morning he kept running into the same young couple.'],
  [112, 120, '“看起来像我在跟踪他们。我真没有。”', '“It looked as if I was snooping around, which was, I assure you, not the case.”'],
  [120, 128, '两个乱走的人，为什么总会[再遇见]？', 'So he asked: why do two random walkers keep meeting?'],
  // S5 one more direction
  [128, 136, '可如果，再多一个方向：[上下]', 'Now add one more direction: up and down.'],
  [136, 144, '1,600 只鸟，从同一个鸟巢出发', '1,600 birds leave the same nest.'],
  [144, 152, '飞回来的比例，越涨越慢……', 'The share that makes it back climbs slower and slower…'],
  [152, 159, '然后，停住了', '…and then it stops.'],
  // S6 the drop
  [161, 169, '在三维空间，能飞回巢的只有 [34%]', 'In three dimensions, only 34% ever return.'],
  [169, 177, '“醉汉终会回家，醉鸟却可能永远迷路。”', '“A drunk man will find his way home, but a drunk bird may get lost forever.” — Kakutani'],
  [177, 185, '维度越高越回不去：四维 [19%]，五维 [14%]', 'Four dimensions: 19%. Five: 14%.'],
  // S7 why
  [185, 193, '走 n 步，你离起点通常只有 [√n] 远', 'After n steps you are typically only √n from the start.'],
  [193, 201, '平面上地方小，脚印一遍遍[叠]在一起', 'On a plane that patch is small: your footprints pile up.'],
  [201, 209, '空间里地方太大，脚印几乎[不重叠]', 'In space it is so big they hardly ever overlap.'],
  // S8 Brownian motion
  [209, 217, '1827 年，布朗看见花粉里的[微粒]在乱跳', '1827: Robert Brown sees particles from inside pollen jiggling.'],
  [217, 225, '岩石粉末也在跳：它不是“活的”', 'Powdered rock jiggles too. It is not life.'],
  [225, 233, '1905 年，爱因斯坦算出：是[分子]在乱撞', '1905: Einstein shows it is molecules knocking it about.'],
  [233, 241, '佩兰用实验证实，1926 年获[诺贝尔奖]', 'Jean Perrin confirmed it by experiment: Nobel Prize, 1926.'],
  // S9 prices
  [241, 249, '1900 年，巴舍利耶把[价格]当成随机游走', 'In 1900, Louis Bachelier treated market prices as a random walk.'],
  [249, 257, '比爱因斯坦，早了五年', 'Five years before Einstein.'],
  [257, 265, '1973 年，学生们用[抛硬币]画了张股价图', 'In 1973, Burton Malkiel\'s students charted a stock by flipping coins.'],
  [265, 273, '一位看图专家看完说：{马上买}', 'A chartist looked at it and said: buy immediately.'],
  // S10 back to the street
  [273, 281, '醉汉晃了一整夜，最后还是[到家]了', 'He stumbled all night, and still got home.'],
  [281, 289, '小鸟飞得更自由，也更容易[回不去]', 'The bird is freer, and far more likely to be lost.'],
  [289, 297, '路越多的地方，越容易走散', 'The more ways there are to go, the easier it is to drift apart.'],
  [297, 310, '你有没有一个，[再也回不去]的地方？', 'Is there a place you can never go back to?'],
];
