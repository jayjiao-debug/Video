// The film's language. Chinese first (Douyin): every caption shows the Chinese AND the line's English under it in both
// languages. Input prop lang: "en" renders the English version: the English is the caption's main text (captions_en.ts,
// a stub until an English voice pass generates it), English-first cards and HUD strings. Everything else (the shots,
// the cuts, every frame number) is the Chinese film's.
// LANG / EN / L live in the shared kit (src/kit/film/lang.ts). Builders keep their OWN on-screen strings next to their
// shots with L(zh, en); TXT holds only the strings that more than one package shows.
import { L } from "../../kit/film/lang";
export { LANG, EN, L, type Lang } from "../../kit/film/lang";

export const TXT = {
  /** her camera's REC label (hud/vlog.tsx) */
  rec: "REC",
  /** the film's title (the title block, A, frames 0-90) */
  title: L("采访苏东坡的一天", "A Day with Su Dongpo"),
  /** the line under the title */
  subtitle: L("1097年 · 惠州", "1097 · Huizhou"),
  /** the two time-jump stamps (hud/stamp.tsx): the seal's characters and the words beside it */
  jumpH: { seal: "儋州", zh: "两年后 · 儋州", en: "Two years later · Danzhou" },
  jumpI: { seal: "金山", zh: "四年后 · 金山寺", en: "Four years later · Jinshan Temple" },
  /** the three names of the ending (I57) and their English */
  names: [
    { zh: "黄州", en: "Huangzhou" },
    { zh: "惠州", en: "Huizhou" },
    { zh: "儋州", en: "Danzhou" },
  ],
};
