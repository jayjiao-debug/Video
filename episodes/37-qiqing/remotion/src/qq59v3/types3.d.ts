// react-dom ships no types here; kit3 only needs the static renderer (for the low-res blurred layers)
declare module 'react-dom/server' {
	import type {ReactElement} from 'react';
	export function renderToStaticMarkup(element: ReactElement): string;
}
