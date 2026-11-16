// The film's language. Input prop lang: "en" renders the English version: English captions (captions_en.ts, a stub
// until the English narration exists), English tags and stamps. Everything else (the shots, the cuts, every frame
// number) is the Chinese film's.
// Segment and overlay builders keep their OWN on-screen strings next to their shots with L(zh, en); nobody edits this
// file after the skeleton. TXT holds only the strings that more than one builder shows.
// LANG / EN / L live in the shared kit (src/kit/film/lang.ts); the layout constants and TXT below are this film's.
import { EN, L } from "../../kit/film/lang";
export { LANG, EN, L, type Lang } from "../../kit/film/lang";

/** Corner tags sit this far from the left edge (phones taller than 16:9 cut the sides of a 9:16 film: English type
 *  keeps 96 px from the edges; the Chinese film 44, as published before) */
export const TAG_X = EN ? 96 : 44;
/** a stamp's box is sized by its characters: full-width for Chinese, narrower for Latin capitals */
export const STAMP_CW = L(1.08, 0.72);

/** the words drawn over the picture that are shared between builders (name tags come from people.ts ROLES; the
 *  captions are in captions.ts / captions_en.ts) */
export const TXT = {
  title: L("鸿门宴", "The Hongmen Feast"),
  /** the source tag in the top-left corner from line 3 on */
  source: L("《史记》", "Records of the Grand Historian"),
  n40: L("40万", "400,000"),
  n10: L("10万", "100,000"),
  officer: L("刘邦的军官", "Liu Bang's officer"),
  informer: L("曹无伤 · 告密的", "CAO WUSHANG · the informer"),
  qinjia: L("亲家", "IN-LAWS"),
  raw: L("生的", "RAW"),
  idiomDance: L("项庄舞剑，意在沛公", "Xiang Zhuang's sword dance aims at Liu Bang"),
  idiomFish: L("人为刀俎，我为鱼肉", "They are the knife and board, we are the fish"),
  times: L(["×1", "×2", "×3"], ["×1", "×2", "×3"]),
  // ---- the overlay package's strings (hud/): "name · role" per name tag (hud/tag.tsx TAGS), the title's two rows,
  // the full source tag, the informer's mark, the bubble of line 21
  tag: {
    liu: L("刘邦", "Liu Bang"),
    xiangYu: L("项羽", "Xiang Yu"),
    uncle: L("项伯 · 项羽的叔叔", "Xiang Bo · Xiang Yu's uncle"),
    fanZeng: L("范增 · 项羽的谋士", "Fan Zeng · Xiang Yu's adviser"),
    dancer: L("项庄", "Xiang Zhuang"),
    fanKuai: L("樊哙 · 刘邦的保镖", "Fan Kuai · Liu Bang's bodyguard"),
    zhang: L("张良 · 刘邦的谋士", "Zhang Liang · Liu Bang's adviser"),
  },
  titleAsk: L("到底死了谁？", "Who actually died?"),
  sourceFull: L("《史记·项羽本纪》", "Shiji · Annals of Xiang Yu"),
  informerMark: L("密", "!"),
  informerName: L("曹无伤", "Cao Wushang"),
};
