// Every standard accessory by name, with the role it signals. Films can pick by name; the sheets and checks in
// scripts/rig3d/ go through this list, so an accessory that is listed here is checked with the rest.
//   rc.add(look, { acc: accessories("suit", "glasses.square", "briefcase") })
import type { Acc } from "../rig3d";
import { glasses, moustache, topHat, headphones, tie, backpack, briefcase, hardHat, chefHat, gradCap, peakedCap, labCoat, cowboyHat, apron, faceMask, coffeeCup, phone, pen, finger } from "./index";

export type AccEntry = { zh: string; role: string; make: () => Acc[] };
export const ACCESSORIES: Record<string, AccEntry> = {
  "glasses.round": { zh: "圆框眼镜", role: "学霸、程序员", make: () => [glasses({ kind: "round" })] },
  "glasses.square": { zh: "方框眼镜", role: "老师、上班族", make: () => [glasses({ kind: "square" })] },
  "glasses.shades": { zh: "墨镜", role: "酷的人、保镖", make: () => [glasses({ kind: "shades" })] },
  "moustache.curl": { zh: "翘胡子", role: "老派绅士、厨师", make: () => [moustache({ kind: "curl" })] },
  "moustache.handlebar": { zh: "八字胡", role: "老板、魔术师", make: () => [moustache({ kind: "handlebar" })] },
  "moustache.walrus": { zh: "大胡子", role: "大叔、教授", make: () => [moustache({ kind: "walrus" })] },
  "moustache.pencil": { zh: "小胡子", role: "精明的人", make: () => [moustache({ kind: "pencil" })] },
  topHat: { zh: "礼帽", role: "有钱人、魔术师", make: () => [topHat()] },
  bowler: { zh: "圆顶礼帽", role: "老派职员、侦探", make: () => [topHat({ bowler: true, col: "#4a4a55" })] },
  headphones: { zh: "耳机", role: "打游戏的、不听课的", make: () => [headphones()] },
  headset: { zh: "带麦耳机", role: "客服、主播", make: () => [headphones({ mic: true, col: "#3f6fb5" })] },
  tie: { zh: "领带", role: "上班族", make: () => [tie()] },
  suit: { zh: "西装领带", role: "老板、律师", make: () => [tie({ suit: "#2f3f66" })] },
  backpack: { zh: "书包", role: "学生", make: () => [backpack()] },
  briefcase: { zh: "公文包", role: "上班族、推销员", make: () => [briefcase()] },
  hardHat: { zh: "安全帽", role: "工人、工程师", make: () => [hardHat()] },
  chefHat: { zh: "厨师帽", role: "厨师", make: () => [chefHat()] },
  gradCap: { zh: "学士帽", role: "毕业生、学霸", make: () => [gradCap()] },
  peakedCap: { zh: "大檐帽", role: "警察、保安", make: () => [peakedCap()] },
  pilotCap: { zh: "白色大檐帽", role: "机长、船长", make: () => [peakedCap({ col: "#f4f2ec", band: "#22242e" })] },
  labCoat: { zh: "白大褂", role: "科学家、研究员", make: () => [labCoat()] },
  doctorCoat: { zh: "白大褂加听诊器", role: "医生", make: () => [labCoat({ stethoscope: true })] },
  cowboyHat: { zh: "牛仔帽", role: "牛仔、冒险家", make: () => [cowboyHat()] },
  apron: { zh: "围裙", role: "厨师、咖啡师、店员", make: () => [apron()] },
  faceMask: { zh: "口罩", role: "医生、病人、不想被认出来的人", make: () => [faceMask()] },
  coffeeCup: { zh: "咖啡杯", role: "上班族、熬夜的学生", make: () => [coffeeCup()] },
  phone: { zh: "手机", role: "低头族、打电话的人（姿势 phone 会把它举到脸前或耳边，见 RIG3D_poses.md）", make: () => [phone()] },
  pen: { zh: "笔", role: "学生、记笔记的人（姿势 write 会让它在桌面上写，见 RIG3D_poses.md）", make: () => [pen()] },
  finger: { zh: "竖起的食指", role: "让人别出声的人、保密的人（姿势 shh 会把手举到嘴前、食指竖在嘴唇上，表情用 hush，见 RIG3D_poses.md）", make: () => [finger()] },
};
/** the accessories of the named catalogue entries, in order */
export const accessories = (...names: string[]): Acc[] => names.flatMap((n) => {
  const e = ACCESSORIES[n];
  if (!e) throw new Error(`rigacc: no accessory called "${n}" (see kit/rigacc/catalog.ts)`);
  return e.make();
});
/** the catalogue as name -> maker, for the previews (rigLab's accSets) */
export const ACC_SETS: Record<string, () => Acc[]> = Object.fromEntries(Object.entries(ACCESSORIES).map(([k, e]) => [k, e.make]));
