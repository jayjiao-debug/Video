// The film's language. Input prop lang: "en" renders the English version: English captions (captions_en.ts, a stub
// until WP13 generates it), English tags, stamps (Chinese seal + English gloss) and labels. Everything else (the shots,
// the cuts, every frame number) is the Chinese film's.
// LANG / EN / L live in the shared kit (src/kit/film/lang.ts). Builders keep their OWN on-screen strings next to their
// shots with L(zh, en); the tag strings, the chip's labels and TAG_X live in hud/ (hud/index.ts). TXT holds only the
// strings that more than one package shows. No personal name in English, ever (BUILD_PLAN section 5).
import { L } from "../../kit/film/lang";
export { LANG, EN, L, type Lang } from "../../kit/film/lang";

export const TXT = {
  /** the source tag in the top-left corner, 174-2083 (BIBLE 6.4): no chapter name (it carries 廉颇 / a name in English) */
  source: L("《史记》", "Records of the Grand Historian"),
};
