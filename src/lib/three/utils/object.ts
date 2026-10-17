import type { Object3D } from 'three';

/**
 * Checks whether an object is a descendant of another object.
 *
 * @param obj - The object to check.
 * @param ancestor - The object to look for among its ancestors.
 * @returns `true` if `ancestor` is one of the object's ancestors.
 */
export function isDescendantOf(obj: Object3D, ancestor: Object3D) {
	for (let parent = obj.parent; parent; parent = parent.parent) {
		if (parent === ancestor) return true;
	}

	return false;
}
