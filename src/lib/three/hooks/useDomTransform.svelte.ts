import { getThree } from '#lib/three/context.ts';
import { getWorldSize } from '#lib/three/utils/camera.ts';
import { useThreeLoop } from '#lib/three/hooks/useThreeLoop.svelte.ts';
import { extract, type MaybeGetter } from '#lib/utils/getter.ts';
import type { Object3D } from 'three';

/**
 * Positions an object over a DOM element every frame, so its local space is CSS pixels from the
 * element's top-left corner, y up. Expects the object in the scene root and a camera facing z = 0.
 *
 * @param element - The element to follow.
 * @param object - The object to position.
 */
export function useDomTransform(
	element: MaybeGetter<Element | undefined>,
	object: MaybeGetter<Object3D | undefined>
) {
	const { domElement, canvas, size, camera } = getThree();

	useThreeLoop(() => {
		const el = extract(element);
		const obj = extract(object);
		const cam = camera.current;

		if (!el || !obj || !cam || !size.height) return;

		const { pixelRatio } = size;
		const snap = (value: number) => Math.round(value * pixelRatio) / pixelRatio;

		const frameRect = domElement.getBoundingClientRect();
		const canvasRect = canvas.getBoundingClientRect();
		const rect = el.getBoundingClientRect();

		const left = snap(rect.left - canvasRect.left) - snap(frameRect.left - canvasRect.left);
		const top = snap(canvasRect.bottom - frameRect.top) - snap(canvasRect.bottom - rect.top);

		const unitsPerPixel = getWorldSize(cam).height / size.height;

		obj.position.x = (left - size.width / 2) * unitsPerPixel;
		obj.position.y = (size.height / 2 - top) * unitsPerPixel;
		obj.scale.setScalar(unitsPerPixel);
	});
}
