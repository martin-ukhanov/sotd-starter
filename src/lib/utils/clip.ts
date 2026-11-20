interface Edges {
	left: number;
	top: number;
	right: number;
	bottom: number;
}

const UNCLIPPED: Readonly<Edges> = Object.freeze({
	left: -Infinity,
	top: -Infinity,
	right: Infinity,
	bottom: Infinity
});

// Cleared after each task, so elements read in the same frame share their ancestors' work
const styles = new Map<Element, CSSStyleDeclaration>();
const contentClips = new Map<Element, Readonly<Edges>>();

function clearCaches() {
	styles.clear();
	contentClips.clear();
}

function getStyle(el: Element) {
	let style = styles.get(el);

	if (!style) {
		if (!styles.size) queueMicrotask(clearCaches);
		style = getComputedStyle(el);
		styles.set(el, style);
	}

	return style;
}

// The parent in the flattened tree, so elements in shadow DOM are clipped by the page around them
function getParent(el: Element) {
	if (el.assignedSlot) return el.assignedSlot;

	const { parentNode } = el;
	if (parentNode instanceof ShadowRoot) return parentNode.host;
	return parentNode instanceof Element ? parentNode : null;
}

// Whether an element places positioned descendants, which skip the ancestors between when clipped
function placesPositioned(el: Element, position: string) {
	const style = getStyle(el);
	if (position === 'absolute' && style.position !== 'static') return true;

	// These also place fixed descendants, which otherwise belong to the viewport
	return (
		style.transform !== 'none' ||
		style.translate !== 'none' ||
		style.rotate !== 'none' ||
		style.scale !== 'none' ||
		style.perspective !== 'none' ||
		style.filter !== 'none' ||
		style.backdropFilter !== 'none' ||
		style.containerType !== 'normal' ||
		/paint|layout|strict|content/.test(style.contain) ||
		/transform|perspective|filter/.test(style.willChange)
	);
}

// The nearest ancestor that can clip an element: its parent, or a positioned element's containing
// block. The body is skipped, as its overflow can be the viewport's
function getClippingAncestor(el: Element) {
	const { position } = getStyle(el);
	let parent = getParent(el);

	if (position === 'absolute' || position === 'fixed') {
		while (parent && parent !== document.body && !placesPositioned(parent, position)) {
			parent = getParent(parent);
		}
	}

	return parent === document.body || parent === document.documentElement ? null : parent;
}

// Transform scale. Offset sizes are rounded, so differences under a pixel are ignored
function getScale(size: number, offsetSize: number) {
	return offsetSize && Math.abs(size - offsetSize) >= 1 ? size / offsetSize : 1;
}

// An element's padding box on the axes its own `overflow` or paint containment clips
function getOwnClip(el: Element): Readonly<Edges> {
	if (!(el instanceof HTMLElement)) return UNCLIPPED;

	const style = getStyle(el);
	const containsPaint = /paint|strict|content/.test(style.contain);
	const clipsX = containsPaint || style.overflowX !== 'visible';
	const clipsY = containsPaint || style.overflowY !== 'visible';

	if ((!clipsX && !clipsY) || style.display === 'inline' || style.display === 'contents') {
		return UNCLIPPED;
	}

	const rect = el.getBoundingClientRect();
	const scaleX = getScale(rect.width, el.offsetWidth);
	const scaleY = getScale(rect.height, el.offsetHeight);

	// Border and scrollbar widths, measured in from its exact rect as client sizes are rounded
	const insetRight = el.offsetWidth - el.clientLeft - el.clientWidth;
	const insetBottom = el.offsetHeight - el.clientTop - el.clientHeight;

	return {
		left: clipsX ? rect.left + el.clientLeft * scaleX : -Infinity,
		top: clipsY ? rect.top + el.clientTop * scaleY : -Infinity,
		right: clipsX ? rect.right - insetRight * scaleX : Infinity,
		bottom: clipsY ? rect.bottom - insetBottom * scaleY : Infinity
	};
}

function intersect(a: Readonly<Edges>, b: Readonly<Edges>): Readonly<Edges> {
	if (a === UNCLIPPED) return b;
	if (b === UNCLIPPED) return a;

	return {
		left: Math.max(a.left, b.left),
		top: Math.max(a.top, b.top),
		right: Math.min(a.right, b.right),
		bottom: Math.min(a.bottom, b.bottom)
	};
}

// The area an element's ancestors let it draw in
function getAncestorClip(el: Element) {
	const ancestor = getClippingAncestor(el);
	return ancestor ? getContentClip(ancestor) : UNCLIPPED;
}

// The area an element's content draws in: its own clip within its ancestors'
function getContentClip(el: Element) {
	let clip = contentClips.get(el);

	if (!clip) {
		clip = intersect(getAncestorClip(el), getOwnClip(el));
		contentClips.set(el, clip);
	}

	return clip;
}

/**
 * Gets the part of an element visible on screen once its ancestors' `overflow` and the viewport
 * clip it, like CSS. Rounded corners stay square, and ancestor clips are cached for the current
 * task, so read it after layout settles.
 *
 * @param el - The element.
 * @param rect - The element's rect, if already read. Defaults to `el.getBoundingClientRect()`.
 * @returns The visible rect, in CSS pixels from the viewport's top-left. Empty when fully clipped.
 */
export function getVisibleRect(el: Element, rect = el.getBoundingClientRect()) {
	const { clientWidth, clientHeight } = document.documentElement;
	const viewport = {
		left: 0,
		top: 0,
		right: clientWidth,
		bottom: clientHeight
	};
	const clip = intersect(getAncestorClip(el), viewport);

	const left = Math.max(rect.left, clip.left);
	const top = Math.max(rect.top, clip.top);
	const right = Math.min(rect.right, clip.right);
	const bottom = Math.min(rect.bottom, clip.bottom);

	return new DOMRect(left, top, Math.max(right - left, 0), Math.max(bottom - top, 0));
}
