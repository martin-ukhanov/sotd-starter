import { getVisibleRect } from '#lib/utils/clip.ts';
import type { ThreeRect } from '#lib/three/types.ts';

/**
 * Converts a client rect (top-left origin, y down) to a canvas rect (bottom-left origin, y up).
 *
 * @param rect - The rect, such as from `getBoundingClientRect()`.
 * @param canvasRect - The canvas's client rect.
 * @returns The rect on the canvas, in CSS pixels.
 */
export function toCanvasRect(rect: DOMRect, canvasRect: DOMRect): ThreeRect {
	return {
		left: rect.left - canvasRect.left,
		bottom: canvasRect.bottom - rect.bottom,
		width: rect.width,
		height: rect.height
	};
}

/**
 * Checks whether a canvas rect has any area on the canvas.
 *
 * @param rect - The canvas rect.
 * @param canvasRect - The canvas's client rect.
 * @returns Whether any of it is on the canvas.
 */
export function isOnCanvas({ left, bottom, width, height }: ThreeRect, canvasRect: DOMRect) {
	return (
		width > 0 &&
		height > 0 &&
		left < canvasRect.width &&
		bottom < canvasRect.height &&
		left + width > 0 &&
		bottom + height > 0
	);
}

/**
 * Gets the part of an element visible on the canvas, once its ancestors clip it. Elements off the
 * canvas skip reading their ancestors, as they can't be visible anyway.
 *
 * @param el - The element.
 * @param rect - The element's client rect.
 * @param canvasRect - The canvas's client rect.
 * @returns The visible part as a canvas rect, empty when there's none.
 */
export function getCanvasClip(el: Element, rect: DOMRect, canvasRect: DOMRect): ThreeRect {
	return isOnCanvas(toCanvasRect(rect, canvasRect), canvasRect)
		? toCanvasRect(getVisibleRect(el, rect), canvasRect)
		: { left: 0, bottom: 0, width: 0, height: 0 };
}
