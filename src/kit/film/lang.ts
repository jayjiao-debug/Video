// A film's language switch (the general part of Hongmen's lang.ts). Input prop lang: "en" renders a film's English
// version; anything else (or nothing) the original. Builders keep their OWN on-screen strings next to their shots with
// L(zh, en). A film's own lang.ts re-exports these and adds its layout constants and shared strings (TXT).
//   npx remotion still src/index.ts <Comp> out.png --props='{"lang":"en"}'
import { IP } from "./env";

export type Lang = "zh" | "en";
export const LANG: Lang = IP.lang === "en" ? "en" : "zh";
export const EN = LANG === "en";
/** pick by language */
export const L = <T,>(zh: T, en: T): T => (EN ? en : zh);
