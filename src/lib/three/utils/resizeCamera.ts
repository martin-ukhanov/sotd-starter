import type { Camera, PerspectiveCamera, OrthographicCamera } from 'three';

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
