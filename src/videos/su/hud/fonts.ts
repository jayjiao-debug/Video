// hud/fonts.ts: the two display typefaces of the Su film's skin (v3, Jay 2026-11-14: a themed title, intro cards and
// 综艺 effects, all in one skin). Two small subsets (public/su/fonts/*.woff2, tens of KB, SIL Open Font License) hold
// exactly the characters the skin draws (STRINGS below): scripts/su/fonts.py fetches them from Google Fonts, run it
// after adding a string. The page waits (delayRender) until both faces are in; a failed load stops the render
// (cancelRender) instead of silently drawing the fallback face.
//   KUAILE  ZCOOL KuaiLe (站酷快乐体, OFL): round and chubby like his belly: 花字, 记者OS, labels, numbers
//   XING    Zhi Mang Xing (志莽行书, OFL): running script, his own art: names on the title and the cards
import { useEffect, useState } from "react";
import { cancelRender, continueRender, delayRender, staticFile } from "remotion";

export const KUAILE = "'ZCOOL KuaiLe', 'FrSans', sans-serif";
export const XING = "'Zhi Mang Xing', 'FrSans', serif";

/** every character the skin draws in either face (the title, the cards, the effects). Add a string here when a new
 *  overlay uses one of the two faces: a character missing from the subset falls back to FrSans. */
const STRINGS = [
  // title, lead card
  "采访苏东坡的一天", "1097年 · 惠州", "今日采访对象", "东坡居士", "饭量诗才运气", "今日目标：荔枝三百颗",
  // banners
  "出场人物", "差役", "带来：坏消息", "苏过", "小儿子 · 唯一跟来海南的家人",
  // effects
  "当事狗", "很不高兴", "记者OS", "这是被贬，还是度假？", "今日已吃 0123456789 / 300 颗", "海南待办①②③", "绝密",
  // his poem written on the screen as he reads it (C25, v4)
  "报道先生春睡美", "道人轻打五更钟", "纵笔",
];
export const SKIN_TEXT = [...new Set(STRINGS.join("").replace(/\s/g, "") + "，。！？：·「」")].join("");

const FACES: [string, string][] = [["ZCOOL KuaiLe", "su/fonts/kuaile.woff2"], ["Zhi Mang Xing", "su/fonts/xing.woff2"]];
let loading: Promise<void> | null = null, done = false;
const load = (): Promise<void> => {
  if (loading) return loading;
  loading = (typeof document === "undefined" ? Promise.resolve() : Promise.all(FACES.map(async ([name, file]) => {
    const face = new FontFace(name, `url(${staticFile(file)}) format("woff2")`, { display: "block" });
    await face.load();
    document.fonts.add(face);
  })).then(() => { done = true; }));
  return loading;
};

/** true once both display faces are in; the page's render waits for it */
export function useSkinFonts() {
  const [ready, setReady] = useState(done);
  const [handle] = useState(() => (done ? null : delayRender("su skin fonts", { timeoutInMilliseconds: 60000 })));
  useEffect(() => {
    if (handle === null) return;
    load().then(() => { setReady(true); continueRender(handle); }, (e) => cancelRender(e));
  }, [handle]);
  return ready;
}
