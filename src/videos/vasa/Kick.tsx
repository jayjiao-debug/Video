import { useLayoutEffect, useState } from "react";
import { useThree } from "@react-three/fiber";
import { delayRender, continueRender, useCurrentFrame, getInputProps } from "remotion";
// Re-runs the R3F frame loop after the composer has subscribed, so post-processed output reaches the canvas.
export const Kick: React.FC = () => {
  const f = useCurrentFrame();
  const advance = useThree((s) => s.advance);
  useLayoutEffect(() => {
    const h = delayRender("kick");
    const n = Number((getInputProps() as { kick?: number }).kick ?? 2);
    if (n <= 1) requestAnimationFrame(() => { advance(performance.now()); continueRender(h); });
    else requestAnimationFrame(() => { advance(performance.now()); requestAnimationFrame(() => { advance(performance.now()); continueRender(h); }); });
  }, [f, advance]);
  return null;
};
