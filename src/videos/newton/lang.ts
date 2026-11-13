// The film's language. Every subtitle and fact card already shows BOTH languages (Chinese large, English small under
// it: captions.ts / story.ts CARDS carry zh + en), so the input prop lang: "en" only switches the strings picked with
// L(zh, en) (the title as one string, a builder's own labels). Everything else (the shots, the cuts, every frame
// number) is the same.
// LANG / EN / L live in the shared kit (src/kit/film/lang.ts). Builders keep their OWN on-screen strings next to their
// shots with L(zh, en); TXT holds only the strings that more than one package shows.
import { L } from "../../kit/film/lang";
import { TITLE_RAW } from "./voice";
export { LANG, EN, L, type Lang } from "../../kit/film/lang";

export const TXT = {
  /** the film's title (the title block on the shut door after A02) */
  title: L(TITLE_RAW[2], TITLE_RAW[3]),
  /** the small line under it */
  subtitle: L(TITLE_RAW[4], TITLE_RAW[5]),
  /** both rows of the title block, both languages */
  titleZh: TITLE_RAW[2], titleEn: TITLE_RAW[3], subtitleZh: TITLE_RAW[4], subtitleEn: TITLE_RAW[5],
  /** the fact cards' source line (most come from Humphrey Newton's account) */
  source: L("汉弗莱·牛顿的回忆", "Humphrey Newton's account"),
};
