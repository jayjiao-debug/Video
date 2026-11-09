import React from "react";
import { Composition } from "remotion";
import { VasaTest, VASA_FRAMES } from "./videos/vasa/Bridge";
import { BtCannon, BT_FRAMES } from "./videos/bt/BtCannon";
import { BtOil, OIL_FRAMES } from "./videos/bt/BtOil";
import { FriendsFilm } from "./videos/friends/Film";
import { GroupFilm, GROUP_FRAMES } from "./videos/group/Film";
export const Root: React.FC = () => <>
  <Composition id="BtCannon" component={BtCannon} durationInFrames={BT_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="BtOil" component={BtOil} durationInFrames={OIL_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="VasaTest" component={VasaTest} durationInFrames={VASA_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="FriendsFilm" component={FriendsFilm} durationInFrames={2286} fps={30} width={1080} height={1920} />
  <Composition id="GroupFilm" component={GroupFilm} durationInFrames={GROUP_FRAMES} fps={30} width={1080} height={1920} />
</>;
