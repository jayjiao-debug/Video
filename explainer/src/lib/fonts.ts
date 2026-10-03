import {continueRender, delayRender, staticFile} from 'remotion';

const loaded = new Set<string>();

/** Load the per-episode subset fonts written by pipeline/fonts.py. */
export const loadEpisodeFonts = (episode: string) => {
	if (loaded.has(episode) || typeof document === 'undefined') return;
	loaded.add(episode);
	const faces: [string, string][] = [
		['EpSerif', 'serif'],
		['EpSans', 'sans'],
		['EpLatin', 'latin'],
		['EpLatinItalic', 'latin-italic'],
	];
	const handle = delayRender(`fonts for ${episode}`);
	Promise.all(
		faces.map(([family, file]) => {
			const face = new FontFace(family, `url(${staticFile(`build/${episode}/fonts/${file}.woff2`)}) format('woff2')`, {
				weight: '200 900',
				style: file.endsWith('italic') ? 'italic' : 'normal',
			});
			return face.load().then((f) => document.fonts.add(f));
		}),
	)
		.then(() => continueRender(handle))
		.catch((err) => {
			console.error(err);
			continueRender(handle);
		});
};
