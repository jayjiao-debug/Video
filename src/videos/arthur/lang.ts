// The film's language. Input prop lang: "en" renders the English version (YouTube): English captions (captions_en.ts,
// timed to the English narration), English tags, name tags, stamps, pull counter and inscription. Everything else
// (the shots, the cuts, every frame number) is the Chinese film's: the English narration is fitted to the same line
// slots, see scripts/arthur/en/README.md.
import { getInputProps } from "remotion";

export type Lang = "zh" | "en";
export const LANG: Lang = (getInputProps() as { lang?: string }).lang === "en" ? "en" : "zh";
export const EN = LANG === "en";
/** pick by language */
export const L = <T,>(zh: T, en: T): T => (EN ? en : zh);

/** Corner tags sit this far from the left edge. Phones taller than 16:9 show a 9:16 film scaled to the screen's
 *  height and cut its sides (measured on a 19.4:9 phone in Douyin: 48 px of 1080 on each side), so type keeps about
 *  96 px from the left and right edges. */
export const TAG_X = 96;

/** every word drawn over the picture (the captions are in captions.ts / captions_en.ts) */
export const TXT = {
  book: L("《亚瑟王之死》", "Le Morte d'Arthur · 1485"),
  london: L("伦敦", "London"),
  newYear: L("新年", "New Year's Day"),
  arthur: L("亚瑟", "ARTHUR"),
  kay: L("凯", "KAY"),
  kaySub: L("亚瑟的哥哥", "Arthur's big brother"),
  bro: L("弟弟", "little brother"),
  stuck: L("不动", "STUCK"),
  daysLater: L("几天后", "Days later"),
  delay1: L("改天再拔", "DELAYED"),
  february: L("二月", "February"),
  delay2: L("又拖", "DELAYED"),
  spring: L("春天", "Spring"),
  delay3: L("还拖", "AGAIN!"),
  summer: L("初夏", "Early summer"),
  /** the pull counter: zh 第 N 次, en PULL N */
  pull: L(["第", "次"] as [string, string], ["PULL", ""] as [string, string]),
  /** the stone's gold letters, row by row (en: Malory's line, shortened: "Whoso pulleth out this sword of this stone
   *  and anvil, is rightwise king born of all England") */
  stone: L(["拔出此剑者", "即为英格兰之王"], ["WHOSO PULLETH OUT", "THIS SWORD IS RIGHTWISE", "KING OF ALL ENGLAND"]),
};
/** a stamp's box is sized by its characters: full-width for Chinese, narrower for Latin capitals */
export const STAMP_CW = L(1.08, 0.72);
