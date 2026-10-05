/* Every subtitle, on the beat grid: [from beat, to beat, Chinese, English]. [gold] marks the answer,
   {red} the trap. The film shows each line from b(from) to b(to). */
export const LINES: [number, number, string, string][] = [
  // S1 cold open: the question, from something the viewer has lived through
  [1, 9, '演出结束，全场开始鼓掌', 'The show ends. The whole hall starts clapping.'],
  [9, 17, '你有没有发现：拍着拍着，掌声就[整齐]了？', 'Ever noticed? After a while, the applause falls into step.'],
  [17, 25, '没人喊口令，也没人带头', 'No one counts. No one leads.'],
  [25, 31, '为什么会这样？', 'Why does that happen?'],
  // S2 not just people
  [39, 47, '不只是人：泰国的萤火虫也会[一起]闪', 'Not just people: fireflies in Thailand flash together too.'],
  [47, 55, '1917 年，还有人说：那是你自己在{眨眼}', 'In 1917, someone said: you are just blinking.'],
  [55, 64, '1968 年，仪器测到：它们真的[同时]闪', '1968: instruments show they really do flash together.'],
  // S3 how
  [64, 72, '跟着闪？来不及：看见再闪，慢将近一拍', 'Copying is too slow: seeing, then flashing, takes almost a cycle.'],
  [72, 80, '邻居一亮，就把自己的[表]拨快一点', 'When a neighbour flashes, each one nudges its own clock forward.'],
  [80, 88, '一只乱闪；十几只，[节奏]就出来了', 'One alone flashes irregularly. A dozen or more find a rhythm.'],
  [88, 96, '1975 年，藏本由纪把它写成了一道[方程]', '1975: Yoshiki Kuramoto writes it down as an equation.'],
  // S4 Huygens
  [96, 104, '1665 年 2 月，惠更斯生病躺在床上', 'February 1665. Christiaan Huygens is sick in bed.'],
  [104, 112, '他发现墙上两只摆钟，总是[反着]摆', 'His two pendulum clocks always swing in opposite directions.'],
  [112, 120, '故意打乱，过了半小时，又对上了', 'He disturbs them. Within half an hour they lock again.'],
  [120, 128, '他把这叫作“一种奇怪的[共鸣]”', 'He called it "an odd kind of sympathy".'],
  // S5 metronomes
  [128, 136, '2012 年，日本一间实验室，32 个节拍器', '2012. A lab in Japan. 32 metronomes.'],
  [136, 144, '放在同一块吊起来的木板上', 'On one board, hung on strings.'],
  [144, 152, '木板轻轻晃，谁也没去碰它们', 'The board sways a little. Nobody touches them.'],
  [152, 159, '两分钟后……', 'Two minutes later…'],
  // S6 the drop
  [161, 169, '[全部]对齐', 'All in step.'],
  [169, 177, '晃动的木板，就是它们的“悄悄话”', 'The swaying board is how they talk to each other.'],
  [177, 185, '同样的事，每天发生在你的[心脏]里', 'The same thing happens in your heart, every day.'],
  // S7 heart
  [185, 193, '心脏里，有上万个起搏细胞', 'Your heart has thousands of pacemaker cells.'],
  [193, 201, '没有哪一个是[总指挥]', 'None of them is in charge.'],
  [201, 209, '它们互相带着，打出你的每一次心跳', 'They pull each other into every heartbeat.'],
  // S8 the bridge
  [209, 217, '2000 年 6 月 10 日，伦敦千禧桥开通', '10 June 2000. London’s Millennium Bridge opens.'],
  [217, 225, '人一多，桥开始[左右晃]，人也跟着桥晃', 'Crowded, it sways sideways, and people sway with it.'],
  [225, 233, '超过约 [160] 人，突然大晃，两天后关闭', 'Above about 160 walkers the sway jumps. Closed two days later.'],
  [233, 241, '加装阻尼器花了约 500 万英镑，2002 年重开', 'Dampers, about £5 million, reopened in 2002.'],
  // S9 applause
  [241, 249, '回到开头：2000 年，物理学家录下了掌声', 'Back to the applause: in 2000, physicists recorded it.'],
  [249, 257, '掌声会自己变[整齐]，节奏还慢了一半', 'It falls into step by itself, at half the speed.'],
  [257, 265, '可大家想更响，就越拍越快', 'But people want it louder, so they clap faster.'],
  [265, 273, '整齐，又[散]了', 'And the rhythm falls apart.'],
  // S10 back to the river
  [273, 281, '萤火虫、摆钟、心跳、桥上的人', 'Fireflies, clocks, hearts, a crowd on a bridge.'],
  [281, 289, '没有指挥，每个都只是往[身边]靠一点', 'No conductor. Each just leans a little toward its neighbours.'],
  [289, 297, '节奏，就这样长出来了', 'And a rhythm grows.'],
  [297, 310, '你现在的节奏，是[你自己]的吗？', 'Is the rhythm you live by your own?'],
];
