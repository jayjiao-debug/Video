/* Every subtitle, on the beat grid: [from beat, to beat, Chinese, English]. Mark-up follows the
   colour of each quantity: [yellow] the answer / flow, {red} challenge or the trap, <blue> skill. */
export const LINES: [number, number, string, string][] = [
  // S1 cold open
  [1, 9, '你有没有过：做一件事，一抬头，[天黑了]？', 'Ever looked up from something and found it was dark?'],
  [9, 17, '明明只过了一会儿，几个小时却没了', 'It felt like a moment. Hours were gone.'],
  [17, 25, '那一刻，你忘了饿，也忘了[自己]', 'You forgot to eat. You forgot yourself.'],
  [25, 31, '为什么会这样？', 'Why does that happen?'],
  // S2 painters
  [39, 47, '一位心理学家，盯着画家看', 'A psychologist watched painters at work.'],
  [47, 55, '画得顺的时候，他们[不吃不睡]', 'When it went well, they forgot to eat or sleep.'],
  [55, 64, '可画一完成，他们就{没兴趣}了', 'The moment it was done, they lost interest.'],
  // S3 the name
  [64, 72, '他又去问攀岩者、棋手、舞者、外科医生', 'He asked climbers, chess players, dancers, surgeons.'],
  [72, 80, '他们说的，是同一种感觉', 'They all described the same feeling.'],
  [80, 88, '像被一股[水流]带着走', 'Like being carried along by a current.'],
  [88, 96, '1975 年，他给它起名：[心流]', 'In 1975 he gave it a name: flow.'],
  // S4 the channel
  [96, 104, '什么时候会进入心流？', 'When do we slip into flow?'],
  [104, 112, '太难，{焦虑}', 'Too hard: anxiety.'],
  [112, 120, '太简单，<无聊>', 'Too easy: boredom.'],
  [120, 128, '难度和能力[刚好]对上', 'Challenge and skill, just matched.'],
  // S5 pagers
  [128, 136, '他让人带上传呼机，一天随机响 8 次', 'Pagers beeped at random, about 8 times a day.'],
  [136, 144, '每响一次，就记下：在做什么，感觉怎样', 'Each beep: what are you doing, how do you feel?'],
  [144, 152, '78 位芝加哥上班族，记了一整周', '78 Chicago workers, for a whole week.'],
  [152, 159, '结果让人意外……', 'The result was a surprise…'],
  // S6 the paradox of work
  [161, 169, '上班时，心流占 <54%>；下班后，只有 17%', 'Flow at work: 54% of the time. In leisure: 17%.'],
  [169, 177, '可上班时，大家还是{更想}去做别的事', 'Yet at work, people wished they were elsewhere.'],
  [177, 185, '下班看电视最放松，却也最[被动]', 'TV after work: the most relaxed, and the most passive.'],
  // S7 the brain
  [185, 193, '即兴演奏时，前额叶一部分<安静>了', 'Improvising, part of the prefrontal cortex goes quiet.'],
  [193, 201, '研究提示：“盯着自己”的声音，小了', 'Studies suggest the self-monitoring voice turns down.'],
  [201, 209, '所以你会[忘了]自己', 'So you forget yourself.'],
  // S8 just hard enough
  [209, 217, '怎样更容易进入心流？', 'How do you get there more often?'],
  [217, 225, '有模型算出：答对约 [85%] 学得最快', 'A 2019 model: learning is fastest at about 85% correct.'],
  [225, 233, '全对，学不到东西；全错，也学不会', 'All right teaches nothing. All wrong teaches nothing.'],
  [233, 241, '好游戏会悄悄调难度，把你[留]在这里', 'Good games quietly tune the difficulty to keep you there.'],
  // S9 the zone
  [241, 249, '1974 年，网球手阿瑟·阿什写到对手：', '1974: tennis player Arthur Ashe, about an opponent:'],
  [249, 257, '“他进入了我们说的 [the zone]”', '“He is in what we call the zone.”'],
  [257, 265, '契克森米哈赖小时候经历了战争', 'Csikszentmihalyi lived through the war as a child.'],
  [265, 273, '他说，下棋是进入[另一个世界]的方法', 'He said chess was a way into a different world.'],
  // S10 back to the clock
  [273, 281, '它不在躺平里，也不在硬撑里', 'It isn’t in lying flat. It isn’t in grinding through.'],
  [281, 289, '在一件[刚刚好难]的事里', 'It’s in something just hard enough.'],
  [289, 297, '那时候，时间会消失', 'And then time disappears.'],
  [297, 310, '你最近一次[忘了时间]，是在做什么？', 'When did you last lose track of time?'],
];
