// React.createElement for the segment files (they are .ts: no JSX)
import React from "react";
export const h = React.createElement;
export const frag = (...kids: React.ReactNode[]) => React.createElement(React.Fragment, null, ...kids);
