// The film's language. Chinese first (Douyin): every caption shows the Chinese AND the line's English under it.
// LANG / EN / L live in the shared kit (src/kit/film/lang.ts).
import { L } from "../../kit/film/lang";
export { LANG, EN, L, type Lang } from "../../kit/film/lang";

export const TXT = {
  /** the film's title (the title block, A, frames 0-90) */
  title: L("采访李白的一天", "A Day with Li Bai"),
  /** the line under the title */
  subtitle: L("744年 · 长安", "744 · Chang'an"),
  /** the vlog's REC label */
  rec: "REC",
};
