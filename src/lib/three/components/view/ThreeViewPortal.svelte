<script lang="ts">
	import { untrack } from 'svelte';
	import { ref } from '#lib/utils/ref.svelte.ts';
	import {
		getThree,
		setThree,
		getThreeLoop,
		setThreeLoop,
		setThreeParent
	} from '#lib/three/context.ts';
	import type { ThreeView } from '#lib/three/types.ts';

	const { view }: { view: ThreeView } = $props();

	const { domElement, viewport, scene, camera, isVisible, render } = untrack(() => view);
	const { canvas, size, renderer } = getThree();
	const subscribe = getThreeLoop();

	setThree(
		Object.freeze({
			domElement,
			canvas,
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
			renderer,
			scene,
			camera,
			isVisible: ref.readonly(isVisible),
			render
		})
	);

	setThreeLoop((callback, options) =>
		subscribe((state) => {
			if (isVisible.current) callback(state);
		}, options)
	);

	setThreeParent(ref.from(() => scene));
</script>

{@render view.children?.()}
