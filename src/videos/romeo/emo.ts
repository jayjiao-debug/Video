// THE PARTY AND BALCONY EMOTES (v7). The owner, 24 Nov, on the v6.1 cut: "IM thinking of adding more expressive emotes
// to the characters in that balcony, party scenes". Each proposal on the emote sheet (desk_notes/2026-11-24_v61/emotes)
// is one switch here, numbered as on the sheet; the owner says yes / no / more per line. The faces are the series'
// approved meme faces (people.ts FACES: gloom, aghast, scheming, rage, speechless); the marks are hud/manpu.tsx and the
// sunburst prop (props/things.ts sunBurst). Format limits: one big emote in about eight seconds, a symbol pops a beat
// after its face and fades by itself, none in the turn, the tomb or the shard.
// v7.1: the owner on the sheet, 24 Nov: "new emotes look gourgeous", then "All nine": every switch is on.
export const EMO = {
  /** 1  B01  Romeo sulking by the wall for Rosaline: 黑线 (gloom) instead of the hollow face */
  b01Gloom: true,
  /** 2  B02  his jaw drops at the first sight of her (惊掉下巴), then he melts into the smitten face as she appears in his eyes */
  b02Aghast: true,
  /** 3  B06  "快去，问他叫什么": her order with a 坏笑 (scheming) instead of the bossy face */
  b06Scheme: true,
  /** 4  B07  "我只拍": 暴怒 (rage) instead of the huff face (the puff of breath stays) */
  b07Rage: true,
  /** 5  C01  her famous line: sparkles twinkle round her head as she sighs his name */
  c01Sparkle: true,
  /** 6  C03  a sunburst behind him on 太阳; on 半夜 it switches off */
  c03Sun: true,
  /** 7  C06  "才认识三小时吧？": 无语 (speechless, a drop of sweat) as it lands, instead of the caught face */
  c06Speechless: true,
  /** 8  C11  "你要是真心想娶我": on 娶 (the snap zoom) she is caught for half a second, steam puffs off her head, then she
   *  is all business again (the script's "caught for half a second, then all business") */
  c11Steam: true,
  /** 9  C12  "九点整！": a dust cloud where he stood; the lens tilts down onto it, he is already gone */
  c12Dust: true,
};
