// THE PROPS of the starter film: none yet. A film's props/index.ts gives { group, prop(name, key?), begin() } (Newton's
// is the model: every prop hidden at the start of every frame; a shot puts the ones it shows).
import * as THREE from "three";
import type { Mats } from "../bt/pbr";

export type PropName = never;
export type Prop = { group: THREE.Group };
export const buildProps = (M: Mats) => {
  void M;
  const group = new THREE.Group(); group.name = "props";
  return { group, prop(name: PropName): Prop { throw new Error(`no prop "${String(name)}" in the starter film`); }, begin() {} };
};
export type Props = ReturnType<typeof buildProps>;
