# ep61 · 三段式假发前垂片放到肩前 — 设计测试（仅供审阅）

- 新开关 `wigFront`（God61 / Actor 的属性，或 CAST61 条目上的 `wigFront: true`），**默认关闭**；没有任何角色、设定图、分镜或 ep60 使用它。
- 对照图 `WIGTEST61`（`src/qq61/wigtest61.tsx`，1440×1080，6 帧，每帧两个角色）：「现在」｜「垂片在前」｜「垂片在前 · 怒吼 / 仰头」，上排头部特写，下排全身。
- 渲染命令（在 `episodes/37-qiqing/remotion`，先 `npm ci`）：
  `node ../../../tasks/ep61-facerig/out/rf.mjs qq61/wigtest61 WIGTEST61 /tmp/wig wig 0 1 2 3 4 5`
  帧：0 拉 + 荷鲁斯，1 阿努比斯 + 托特，2 赛特 + 巴斯特，3 泰芙努特 + 塞赫迈特，4 伊西斯 + 奈芙蒂斯，5 玛阿特 + 舒
