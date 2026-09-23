import type { Object3D, Camera, PerspectiveCamera, OrthographicCamera } from 'three';

export function findCamera(obj: Object3D): Camera | undefined {
	if ((obj as Camera).isCamera) return obj as Camera;

	for (let i = 0; i < obj.children.length; i++) {
		const found = findCamera(obj.children[i]);
		if (found) return found;
	}

	return undefined;
}

export function resizeCamera(camera: Camera, width: number, height: number) {
	if (!width || !height) return;

	if ((camera as PerspectiveCamera).isPerspectiveCamera) {
		const pCam = camera as PerspectiveCamera;
		const aspect = width / height;

		if (pCam.aspect === aspect) return;

		pCam.aspect = aspect;
		pCam.updateProjectionMatrix();
	} else if ((camera as OrthographicCamera).isOrthographicCamera) {
		const oCam = camera as OrthographicCamera;
		const right = width / 2;
		const top = height / 2;

		if (oCam.right === right && oCam.top === top) return;

		oCam.left = -right;
		oCam.right = right;
		oCam.top = top;
		oCam.bottom = -top;
		oCam.updateProjectionMatrix();
	}
}
