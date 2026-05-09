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
	if ((camera as PerspectiveCamera).isPerspectiveCamera) {
		const pCam = camera as PerspectiveCamera;
		pCam.aspect = width / height;
		pCam.updateProjectionMatrix();
	} else if ((camera as OrthographicCamera).isOrthographicCamera) {
		const oCam = camera as OrthographicCamera;
		oCam.left = width / -2;
		oCam.right = width / 2;
		oCam.top = height / 2;
		oCam.bottom = height / -2;
		oCam.updateProjectionMatrix();
	}
}
