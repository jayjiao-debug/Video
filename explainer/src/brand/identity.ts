/**
 * Juno's channel identity: the one place the brand's words, colours and fixed
 * timings live. Every episode, the title/end cards and the on-screen corner mark
 * read from here; never retype these strings in a scene. The rules for using them
 * are in .claude/skills/juno-brand/SKILL.md.
 */
export const JUNO = {
	name: 'Juno',
	credit: 'Juno 出品',
	series: 'VIBE知识大赏',
	follow: '关注 Juno · 每期一个反直觉的知识',
	/** corner mark, top-right in landscape */
	mark: 'Juno · VIBE知识大赏',
	colors: {
		gold: '#f1c56d', // the brand colour: titles, the J ring, the answer
		goldDeep: '#c8913a',
		ink: '#f3ede2', // text on dark
		night: '#05060b', // card backgrounds
	},
	/** seconds */
	timing: {
		// the cold open's length comes from the script (it must show what we're looking at, then ask the
		// question); the title lands on the first strong hit after it. Keep the cold open under this.
		coldOpenMax: 18,
		titleCard: [3.2, 5.3], // on-screen length range
		endCard: 6, // end card length; the music keeps playing under it
	},
} as const;

export type Juno = typeof JUNO;
