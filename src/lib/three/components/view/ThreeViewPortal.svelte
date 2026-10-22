<script lang="ts">
	import { ref } from '#lib/utils/ref.svelte.ts';
	import {
		getThree,
		setThree,
		getThreeLoop,
		setThreeLoop,
		setThreeParent
	} from '#lib/three/context.ts';
	import type { ThreeView } from '#lib/three/types.ts';

	const { domElement, viewport, scene, camera, isVisible, render, children }: ThreeView = $props();

	const { canvas, size, renderer } = getThree();
	const subscribe = getThreeLoop();

	setThree(
		Object.freeze({
			canvas,
			renderer,
			isVisible: ref.from(() => isVisible.current),
			size: {
				get width() {
					return viewport.width;
				},
				get height() {
					return viewport.height;
				},
				get pixelRatio() {
					return size.pixelRatio;
				}
			},
			get domElement() {
				return domElement;
			},
			get scene() {
				return scene;
			},
			get camera() {
				return camera;
			},
			get render() {
				return render;
			}
		})
	);

	setThreeLoop((callback, options) =>
		subscribe((state) => {
			if (isVisible.current) callback(state);
		}, options)
	);

	setThreeParent(ref.from(() => scene));
</script>

{@render children?.()}
