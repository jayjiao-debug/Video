import React from 'react';
import {W, H} from '../qq50/kit50';
/* ep54 look B · key scenes owned by the set builder (stubs until built): K4 许都, K5 官渡, K6 the handover to the AI drop, K8 洛阳 220 */
const Stub: React.FC<{c: string}> = ({c}) => <svg width={W} height={H} style={{position: 'absolute'}}><rect width={W} height={H} fill={c} /></svg>;
export const K4: React.FC = () => <Stub c="#333" />;
export const K5: React.FC = () => <Stub c="#3a3a3a" />;
export const K6: React.FC = () => <Stub c="#444" />;
export const K8: React.FC = () => <Stub c="#4a4a4a" />;
