/* v2 subtitles: [from beat, to beat, zh, en]. Mark-up: [yellow] flow / the answer, {red} challenge, <blue> skill. */
export type Line = [number, number, string, string];
export const COLD: Line[] = [
  [0.6, 5.2, '有一个数字，能让你学得最快', 'There is a number that makes you learn fastest.'],
  [5.2, 10.2, '练习的时候，答对多少题最好？', 'When you practise, how often should you be right?'],
  [10.2, 14.2, '全对？<太简单>，学不到新东西', 'Always right? Too easy. Nothing new to learn.'],
  [14.2, 17.6, '一半对？跟{瞎猜}差不多', 'Half right? That is barely better than guessing.'],
  [17.6, 23, '两头都学不到，最快的点一定在中间', 'Both ends teach nothing, so the best point is in between.'],
  [23, 27.6, '2019 年的一项研究算出：约 [85%]', 'A 2019 study worked it out: about 85%.'],
  [27.6, 31, '而它，藏在一种你熟悉的状态里', 'And it hides in a feeling you know.'],
];
export const S2L: Line[] = [
  [39.4, 47, '你一定有过：一抬头，[天黑了]', 'You have had it: you look up, and it is dark.'],
  [47, 55, '1960 年代，一位心理学家盯着画家看', 'In the 1960s, a psychologist watched painters at work.'],
  [55, 64, '画的时候废寝忘食，画完却{没兴趣}了', 'Painting, they forgot to eat. Finished, they lost interest.'],
];
export const S3L: Line[] = [
  [64, 72, '他又去问攀岩者、棋手、舞者、外科医生', 'He asked climbers, chess players, dancers, surgeons.'],
  [72, 80, '他们描述的，是同一种感觉', 'They described the same feeling.'],
  [80, 88, '像被一股[水流]带着走', 'Like being carried along by a current.'],
  [88, 96, '1975 年，他给它起名：[心流]', 'In 1975 he gave it a name: flow.'],
];
export const MAPL: Line[] = [
  [96, 103, '什么时候会进入心流？两样东西说了算', 'When does flow happen? Two things decide.'],
  [103, 109, '事情比你强太多：{焦虑}', 'The task far beyond you: anxiety.'],
  [109, 115, '你比事情强太多：<无聊>', 'You far beyond the task: boredom.'],
  [115, 121, '两者[刚好]对上：心流', 'The two just matched: flow.'],
  [121, 128, '你变强了，难度也得跟上，才能留在这里', 'As you improve, the challenge must rise to keep you here.'],
  [128, 136, '可怎么在真实生活里，抓住心流？', 'But how do you catch flow in real life?'],
  [136, 144, '他发给人们传呼机，一天随机响 8 次左右', 'He gave people pagers that beeped about 8 times a day.'],
  [144, 152, '每响一次，记下此刻的难度和能力', 'At each beep: how hard is this, how able am I?'],
  [152, 160, '78 位芝加哥上班族，记了整整一周', '78 Chicago workers, for a whole week.'],
];
export const S6L: Line[] = [
  [161, 167, '上班时，心流占 [54%]；下班后，只有 17%', 'In flow at work: 54%. In leisure: 17%.'],
  [167, 173, '可上班时，他们更常{希望在别处}', 'Yet at work they more often wished to be elsewhere.'],
  [173, 179, '下班看电视：最放松，也最<被动>', 'TV after work: the most relaxed, and the most passive.'],
  [179, 185, '心流要的不是轻松，是[刚刚好的难]', 'Flow does not want easy. It wants just hard enough.'],
];
export const S7L: Line[] = [
  [185, 191, '为什么偏偏是 85%？看一道二选一的题', 'Why 85%? Take a question with two answers.'],
  [191, 197, '两个答案，在你脑中是两团模糊的印象', 'In your head, each answer is a fuzzy impression.'],
  [197, 203, '两团重叠的地方，就是你会{答错}的题', 'Where they overlap, you get it wrong.'],
  [203, 209, '练习，就是让两团变得更<清楚>', 'Practice makes them sharper.'],
  [209, 213, '离得太远：本来就不错，没得改', 'Too far apart: no mistakes to fix.'],
  [213, 217, '挨得太近：练了也难分开', 'Too close: hard to separate either way.'],
  [217, 221, '改进最大的，正是答对约 [85%] 的时候', 'The gain is largest at about 85% correct.'],
];
export const S9L: Line[] = [
  [261, 267, '1974 年，网球名将阿瑟·阿什写到对手：', '1974: tennis star Arthur Ashe, about an opponent:'],
  [267, 273, '“他进入了我们说的 [the zone]”', '“He is in what we call the zone.”'],
  [273, 281, '好游戏，会悄悄把难度调到这条线上', 'Good games quietly tune the difficulty onto this line.'],
  [281, 289, '让你总是“差一点点”，总想再来一局', 'Always almost. Always one more round.'],
];
export const S10L: Line[] = [
  [289, 295, '所以心流不在躺平里，也不在硬撑里', 'So flow is not in lying flat, nor in grinding.'],
  [295, 301, '在一件[刚刚好难]的事里', 'It is in something just hard enough.'],
  [301, 310, '那时候，时间会消失', 'And then time disappears.'],
];
export const RIDGE: Line[] = [
  [0.5, 5.5, '正确率取决于两件事：<你多强>，{题多难}', 'How often you are right depends on two things: your skill, and the challenge.'],
  [5.5, 11, '把每一处“学得多快”，画成高度', 'Draw how fast you learn as height.'],
  [11, 17, '学得最快的地方，连成一道[山脊]', 'The fastest learning forms a ridge.'],
  [17, 22.5, '山脊上每一点，正确率都约 [85%]', 'Everywhere on the ridge, you are right about 85% of the time.'],
  [22.5, 27.5, '把它压平，从正上方看', 'Press it flat and look from above.'],
  [27.5, 33.5, '这正是[心流]的通道：难度刚好跟上技能', 'It is the flow channel: challenge keeping pace with skill.'],
  [33.5, 39.5, '论文作者自己，也把它和[心流]连在了一起', 'The authors themselves linked it to flow.'],
];
