// The film's language. Input prop lang: "en" renders the English version: English captions (captions_en.ts, a stub until
// the English pass generates it), English cards and HUD strings. Everything else (the shots, the cuts, every frame
// number) is the Chinese film's.
// LANG / EN / L live in the shared kit (src/kit/film/lang.ts). Builders keep their OWN on-screen strings next to their
// shots with L(zh, en); TXT holds only the strings that more than one package shows.
import { L } from "../../kit/film/lang";
export { LANG, EN, L, type Lang } from "../../kit/film/lang";

export const TXT = {
  /** the film's title (the title card after A14) */
  title: L("采访秦始皇的一天", "A Day with the First Emperor"),
  /** the source line under every fact card */
  source: L("史记·秦始皇本纪", "Records of the Grand Historian"),
  /** the D03 card: the same terrace, the next day */
  nextDay: L("第二天", "The next day"),
  /** the vlog's record label */
  rec: "REC",
};
