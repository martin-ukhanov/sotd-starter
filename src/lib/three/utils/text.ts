export interface TextStyle {
	readonly font: string;
	readonly color: string;
	readonly letterSpacing: string;
	readonly textTransform: string;
	readonly hyphens: string;
	readonly isVisible: boolean;
}

export interface TextWord {
	readonly text: string;
	/** Distance from the element's left edge, in CSS pixels. */
	readonly left: number;
	/** Distance from the element's top edge, in CSS pixels. */
	readonly top: number;
	/** Height of the word's box, in CSS pixels. */
	readonly height: number;
	readonly style: TextStyle;
}

const WORD = /\S+/g;
const SOFT_HYPHEN = String.fromCharCode(0xad);

// Styles that move text without necessarily resizing its element
const LAYOUT_STYLES = ['display', 'textAlign', 'wordSpacing', 'textIndent', 'whiteSpace'] as const;

const graphemes = new Intl.Segmenter(undefined, { granularity: 'grapheme' });

function getTextStyle(element: Element): TextStyle {
	const {
		fontStyle,
		fontWeight,
		fontSize,
		fontFamily,
		color,
		letterSpacing,
		textTransform,
		hyphens,
		visibility
	} = getComputedStyle(element);

	return {
		font: `${fontStyle} ${fontWeight} ${fontSize} ${fontFamily}`,
		color,
		letterSpacing: letterSpacing === 'normal' ? '0px' : letterSpacing,
		textTransform,
		hyphens,
		isVisible: visibility === 'visible'
	};
}

function transformText(text: string, transform: string, isWordStart: boolean) {
	if (transform === 'uppercase') return text.toUpperCase();
	if (transform === 'lowercase') return text.toLowerCase();

	// CSS capitalizes the first letter or number, skipping leading punctuation
	if (transform === 'capitalize' && isWordStart) {
		return text.replace(/[\p{L}\p{N}]/u, (character) => character.toUpperCase());
	}

	return text;
}

// Rects without a width are skipped, since they don't contain any text
function getRects(range: Range) {
	return [...range.getClientRects()].filter((rect) => rect.width);
}

// Merges a range's rects on the line at `lineTop`, skipping the previous line's hyphen
function getLineRect(range: Range, lineTop: number) {
	let left = Infinity;
	let top = Infinity;
	let right = -Infinity;
	let bottom = -Infinity;

	for (const rect of getRects(range)) {
		if (Math.abs(rect.top - lineTop) > 1) continue;

		left = Math.min(left, rect.left);
		top = Math.min(top, rect.top);
		right = Math.max(right, rect.right);
		bottom = Math.max(bottom, rect.bottom);
	}

	return left === Infinity ? undefined : new DOMRect(left, top, right - left, bottom - top);
}

// Splits part of a text node into one `[start, end, top]` per line it wraps across
function splitLines(node: Text, start: number, end: number, range: Range) {
	const lines: [number, number, number][] = [];
	let offset = start;

	for (const { segment } of graphemes.segment(node.data.slice(start, end))) {
		range.setStart(node, offset);
		range.setEnd(node, offset + segment.length);

		// The last rect is the grapheme's own, after any hyphen drawn at the previous line's end
		const top = getRects(range).at(-1)?.top;
		const line = lines.at(-1);

		if (line && (top === undefined || Math.abs(top - line[2]) <= 1)) {
			line[1] = offset + segment.length;
		} else if (top !== undefined) {
			lines.push([lines.length ? offset : start, offset + segment.length, top]);
		}

		offset += segment.length;
	}

	return lines;
}

/**
 * Measures the words of an element's text as the browser laid them out.
 *
 * @param element - The element to measure.
 * @returns Each word's position and style.
 */
export function measureTextLayout(element: Element) {
	const origin = element.getBoundingClientRect();
	const styles = new Map<Element, TextStyle>();
	const words: TextWord[] = [];
	const range = document.createRange();
	const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);

	while (walker.nextNode()) {
		const node = walker.currentNode as Text;
		const parent = node.parentElement;
		if (!parent) continue;

		let style = styles.get(parent);

		if (!style) {
			style = getTextStyle(parent);
			styles.set(parent, style);
		}

		if (!style.isVisible) continue;

		for (const match of node.data.matchAll(WORD)) {
			const start = match.index;
			const end = start + match[0].length;

			range.setStart(node, start);
			range.setEnd(node, end);

			// No rects when hidden, more than one when the word wraps
			const rects = getRects(range);
			if (!rects.length) continue;

			const lines =
				rects.length === 1 ? [[start, end, rects[0].top]] : splitLines(node, start, end, range);

			for (const [index, [lineStart, lineEnd, lineTop]] of lines.entries()) {
				const text = node.data.slice(lineStart, lineEnd);
				const isLastLine = index === lines.length - 1;

				// Browsers draw a hyphen where they hyphenate a word
				const isHyphenated =
					!isLastLine &&
					(text.endsWith(SOFT_HYPHEN) || (style.hyphens === 'auto' && !text.endsWith('-')));

				range.setStart(node, lineStart);
				range.setEnd(node, lineEnd);

				const rect = getLineRect(range, lineTop);
				if (!rect) continue;

				words.push({
					text: transformText(
						text.replaceAll(SOFT_HYPHEN, '') + (isHyphenated ? '-' : ''),
						style.textTransform,
						index === 0
					),
					left: rect.left - origin.left,
					top: rect.top - origin.top,
					height: rect.height,
					style
				});
			}
		}
	}

	return words;
}

/**
 * Builds a key from the text and layout styles of an element and everything inside it. Comparing
 * keys catches changes that don't resize the element, such as hover colors, themes or alignment.
 *
 * @param element - The element to read styles from.
 * @returns A key that changes whenever any of the styles do.
 */
export function getTextStyleKey(element: Element) {
	let key = '';

	for (const el of [element, ...element.querySelectorAll('*')]) {
		const style = getComputedStyle(el);
		const layout = LAYOUT_STYLES.map((property) => style[property]);
		key += [...Object.values(getTextStyle(el)), ...layout].join('|') + ';';
	}

	return key;
}

/**
 * Loads the fonts the words use.
 *
 * @param words - The words to load fonts for.
 * @returns `true` if any font wasn't loaded yet.
 */
export async function loadTextLayoutFonts(words: TextWord[]) {
	const fonts = new Map<string, string>();

	for (const { text, style } of words) {
		fonts.set(style.font, (fonts.get(style.font) ?? '') + text);
	}

	const unloaded = [...fonts].filter(([font, text]) => !document.fonts.check(font, text));
	await Promise.all(unloaded.map(([font, text]) => document.fonts.load(font, text)));

	return unloaded.length > 0;
}

/**
 * Draws words, resizing the canvas to fit their ink, which can extend past the element.
 *
 * @param context - The context to draw with.
 * @param words - The words to draw.
 * @param pixelRatio - Device pixel ratio to draw at.
 * @param color - Replaces every word's color.
 * @returns The canvas's position relative to the element's top-left corner, and its size, in CSS pixels.
 */
export function drawTextLayout(
	context: OffscreenCanvasRenderingContext2D,
	words: TextWord[],
	pixelRatio: number,
	color?: string
) {
	const { canvas } = context;
	const glyphs: { text: string; left: number; baseline: number; style: TextStyle }[] = [];

	let minX = Infinity;
	let minY = Infinity;
	let maxX = -Infinity;
	let maxY = -Infinity;

	for (const { text, left, top, height, style } of words) {
		context.font = style.font;
		context.letterSpacing = style.letterSpacing;

		const metrics = context.measureText(text);
		const ascent = metrics.fontBoundingBoxAscent;
		const descent = metrics.fontBoundingBoxDescent;

		// Center the font's ascent and descent in the word's box, like CSS does
		const baseline = top + (height - ascent - descent) / 2 + ascent;

		minX = Math.min(minX, left - metrics.actualBoundingBoxLeft);
		maxX = Math.max(maxX, left + metrics.actualBoundingBoxRight);
		minY = Math.min(minY, baseline - metrics.actualBoundingBoxAscent);
		maxY = Math.max(maxY, baseline + metrics.actualBoundingBoxDescent);

		glyphs.push({ text, left, baseline, style });
	}

	// Rounded out to whole device pixels, with one to spare for antialiasing
	const x = Math.floor(minX * pixelRatio) - 1;
	const y = Math.floor(minY * pixelRatio) - 1;

	// Resizing also clears the canvas and resets its state
	canvas.width = Math.ceil(maxX * pixelRatio) + 1 - x;
	canvas.height = Math.ceil(maxY * pixelRatio) + 1 - y;

	context.setTransform(pixelRatio, 0, 0, pixelRatio, -x, -y);

	for (const { text, left, baseline, style } of glyphs) {
		context.font = style.font;
		context.letterSpacing = style.letterSpacing;
		context.fillStyle = color ?? style.color;
		context.fillText(text, left, baseline);
	}

	return {
		left: x / pixelRatio,
		top: y / pixelRatio,
		width: canvas.width / pixelRatio,
		height: canvas.height / pixelRatio
	};
}
