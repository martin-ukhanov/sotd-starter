import { Vector3, type Object3D, type PerspectiveCamera, type OrthographicCamera } from 'three';
import { isDescendantOf } from '#lib/three/utils/object.ts';
import type { ThreeCamera } from '#lib/three/types.ts';

/**
 * Checks whether an object is a perspective camera.
 *
 * @param obj - The object to check.
 * @returns `true` if the object is a perspective camera.
 */
export function isPerspectiveCamera(obj: Object3D): obj is PerspectiveCamera {
	return !!(obj as PerspectiveCamera).isPerspectiveCamera;
}

/**
 * Checks whether an object is an orthographic camera.
 *
 * @param obj - The object to check.
 * @returns `true` if the object is an orthographic camera.
 */
export function isOrthographicCamera(obj: Object3D): obj is OrthographicCamera {
	return !!(obj as OrthographicCamera).isOrthographicCamera;
}

/**
 * Checks whether an object is a perspective or orthographic camera.
 *
 * @param obj - The object to check.
 * @returns `true` if the object is a perspective or orthographic camera.
 */
export function isThreeCamera(obj: Object3D): obj is ThreeCamera {
	return isPerspectiveCamera(obj) || isOrthographicCamera(obj);
}

/**
 * Finds the first perspective or orthographic camera in an object and its descendants.
 *
 * @param obj - The object to search.
 * @returns The first camera found, or `undefined` if there is none.
 */
export function findCamera(obj: Object3D): ThreeCamera | undefined {
	if (isThreeCamera(obj)) return obj;

	for (let i = 0; i < obj.children.length; i++) {
		const found = findCamera(obj.children[i]);
		if (found) return found;
	}

	return undefined;
}

/**
 * Returns the current camera if the object still contains it, otherwise the first one found.
 *
 * @param camera - The current camera.
 * @param obj - The object to search.
 * @returns The resolved camera, or `undefined` if there is none.
 */
export function resolveCamera(camera: ThreeCamera | undefined, obj: Object3D) {
	return camera && isDescendantOf(camera, obj) ? camera : findCamera(obj);
}

/**
 * Updates a camera's projection to fit the given size.
 *
 * @param camera - The camera to resize.
 * @param width - The width in pixels.
 * @param height - The height in pixels.
 */
export function resizeCamera(camera: ThreeCamera, width: number, height: number) {
	if (!width || !height) return;

	if (isPerspectiveCamera(camera)) {
		const aspect = width / height;

		if (camera.aspect === aspect) return;

		camera.aspect = aspect;
		camera.updateProjectionMatrix();
	} else {
		const right = width / 2;
		const top = height / 2;

		if (camera.right === right && camera.top === top) return;

		camera.left = -right;
		camera.right = right;
		camera.top = top;
		camera.bottom = -top;
		camera.updateProjectionMatrix();
	}
}

const _origin = new Vector3();
const _position = new Vector3();
const _direction = new Vector3();

/**
 * Gets the size of the area visible to a camera, in world units.
 *
 * @param camera - The camera to measure.
 * @param target - The world-space point or depth to measure at (perspective only). Default `(0, 0, 0)`.
 * @returns The visible width and height.
 */
export function getWorldSize(camera: ThreeCamera, target: Vector3 | number = _origin) {
	if (isPerspectiveCamera(camera)) {
		const { fov, aspect, zoom } = camera;
		let depth: number;

		if (typeof target === 'number') {
			depth = target;
		} else {
			// Distance to the target along the camera's view direction
			camera.getWorldPosition(_position);
			camera.getWorldDirection(_direction);
			depth = _position.subVectors(target, _position).dot(_direction);
		}

		const height = (2 * Math.tan((fov * Math.PI) / 360) * depth) / zoom;
		return { width: height * aspect, height };
	}

	const { left, right, top, bottom, zoom } = camera;

	return {
		width: (right - left) / zoom,
		height: (top - bottom) / zoom
	};
}
