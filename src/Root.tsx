import React from "react";
import { Composition } from "remotion";
import { VasaTest, VASA_FRAMES } from "./videos/vasa/Bridge";
export const Root: React.FC = () => <>
  <Composition id="VasaTest" component={VasaTest} durationInFrames={VASA_FRAMES} fps={30} width={1080} height={1920} />
</>;
