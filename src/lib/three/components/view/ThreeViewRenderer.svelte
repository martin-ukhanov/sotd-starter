<script lang="ts" module>
	import { SvelteMap } from 'svelte/reactivity';
	import type { ThreeView } from '#lib/three/types.ts';

	export const viewMap = new SvelteMap<Element, ThreeView>();
</script>

<script lang="ts">
	import { getThree } from '#lib/three/context.ts';
	import { useThreeLoop } from '#lib/three/hooks/useThreeLoop.svelte.ts';
	import { resolveCamera, resizeCamera } from '#lib/three/utils/camera.ts';
	import ThreeViewPortal from '#lib/three/components/view/ThreeViewPortal.svelte';

	const { canvas, size, renderer } = getThree();

	const orderedViews = $derived.by(() => {
		const views = viewMap
			.values()
			.toArray()
			.sort((a, b) => a.renderOrder - b.renderOrder);

		return {
			below: views.filter((view) => view.renderOrder < 0),
			above: views.filter((view) => view.renderOrder >= 0)
		};
	});

	function updateViewport(view: ThreeView, canvasRect: DOMRect) {
		const { domElement, viewport, isVisible } = view;
		const { left, bottom, width, height } = domElement.getBoundingClientRect();

		const pixelRatio = renderer.getPixelRatio();
		const snap = (value: number) => Math.round(value * pixelRatio) / pixelRatio;

		const rawLeft = left - canvasRect.left;
		const rawBottom = canvasRect.bottom - bottom;

		const snapLeft = snap(rawLeft);
		const snapBottom = snap(rawBottom);

		Object.assign(viewport, {
			left: snapLeft,
			bottom: snapBottom,
			width: snap(rawLeft + width) - snapLeft,
			height: snap(rawBottom + height) - snapBottom
		});

		const isEmpty = !viewport.width || !viewport.height;

		const isOutside =
			viewport.left >= canvasRect.width ||
			viewport.bottom >= canvasRect.height ||
			viewport.left + viewport.width <= 0 ||
			viewport.bottom + viewport.height <= 0;

		isVisible.current = !isEmpty && !isOutside;
	}

	function updateViewCamera(view: ThreeView) {
		const resolved = resolveCamera(view.camera.current, view.scene);
		view.camera.current = resolved;

		if (resolved) {
			const { width, height } = view.viewport;
			resizeCamera(resolved, width, height);
		}
	}

	function updateViews() {
		if (!viewMap.size) return;
		const canvasRect = canvas.getBoundingClientRect();

		for (const view of viewMap.values()) {
			updateViewport(view, canvasRect);
			updateViewCamera(view);
		}
	}

	function resetRenderArea() {
		const { width, height } = size;
		renderer.setScissorTest(false);
		renderer.setScissor(0, 0, width, height);
		renderer.setViewport(0, 0, width, height);
	}

	function renderViews(views: ThreeView[]) {
		if (!views.length) return;

		for (const view of views) {
			const { viewport, scene, camera, isVisible, render } = view;
			if (!isVisible.current) continue;

			try {
				const { left, bottom, width, height } = viewport;
				renderer.setViewport(left, bottom, width, height);
				renderer.setScissor(left, bottom, width, height);
				renderer.setScissorTest(true);
				renderer.clearDepth();

				if (render.current) render.current();
				else if (camera.current) renderer.render(scene, camera.current);
			} catch (e) {
				console.error('Error rendering view:', e);
			}
		}

		resetRenderArea();
		renderer.clearDepth();
	}

	function dispose() {
		resetRenderArea();

		for (const { isVisible } of viewMap.values()) {
			isVisible.current = false;
		}
	}

	useThreeLoop(updateViews, { stage: 'beforeRender', order: -Infinity });
	useThreeLoop(() => renderViews(orderedViews.below), { stage: 'render', order: -1 });
	useThreeLoop(() => renderViews(orderedViews.above), { stage: 'render', order: 1 });

	$effect(() => dispose);
</script>

{#each viewMap.values() as view (view.scene.id)}
	<ThreeViewPortal {view} />
{/each}
