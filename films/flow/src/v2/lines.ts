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
export const RIDGE: Line[] = [
  [0.5, 5.5, '正确率取决于两件事：<你多强>，{题多难}', 'How often you are right depends on two things: your skill, and the challenge.'],
  [5.5, 11, '把每一处“学得多快”，画成高度', 'Draw how fast you learn as height.'],
  [11, 17, '学得最快的地方，连成一道[山脊]', 'The fastest learning forms a ridge.'],
  [17, 22.5, '山脊上每一点，正确率都约 [85%]', 'Everywhere on the ridge, you are right about 85% of the time.'],
  [22.5, 27.5, '把它压平，从正上方看', 'Press it flat and look from above.'],
  [27.5, 33.5, '这正是[心流]的通道：难度刚好跟上技能', 'It is the flow channel: challenge keeping pace with skill.'],
  [33.5, 39.5, '论文作者自己，也把它和[心流]连在了一起', 'The authors themselves linked it to flow.'],
];
