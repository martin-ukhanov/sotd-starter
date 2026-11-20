<script lang="ts" module>
	import { SvelteMap } from 'svelte/reactivity';
	import type { ThreeView, ThreeRect } from '#lib/three/types.ts';

	export const viewMap = new SvelteMap<Element, ThreeView>();
</script>

<script lang="ts">
	import { getThree } from '#lib/three/context.ts';
	import { toCanvasRect, getCanvasClip, isOnCanvas } from '#lib/three/utils/canvas.ts';
	import { resolveCamera, resizeCamera } from '#lib/three/utils/camera.ts';
	import { useThreeLoop } from '#lib/three/hooks/useThreeLoop.svelte.ts';
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

	// Snaps a rect to whole device pixels
	function snapRect({ left, bottom, width, height }: ThreeRect): ThreeRect {
		const { pixelRatio } = size;
		const snapX = (value: number) => Math.round(value * pixelRatio) / pixelRatio;
		const snapY = (value: number) => Math.ceil(value * pixelRatio - 0.5) / pixelRatio;

		const snappedLeft = snapX(left);
		const snappedBottom = snapY(bottom);

		return {
			left: snappedLeft,
			bottom: snappedBottom,
			width: snapX(left + width) - snappedLeft,
			height: snapY(bottom + height) - snappedBottom
		};
	}

	function updateViewRects(view: ThreeView, canvasRect: DOMRect) {
		const { domElement, viewport, scissor, isVisible } = view;
		const rect = domElement.getBoundingClientRect();

		Object.assign(viewport, toCanvasRect(rect, canvasRect));
		Object.assign(scissor, getCanvasClip(domElement, rect, canvasRect));

		isVisible.current = isOnCanvas(snapRect(scissor), canvasRect);
	}

	function updateViewCamera(view: ThreeView) {
		const { camera, scene, viewport } = view;
		const cam = resolveCamera(camera.current, scene);
		camera.current = cam;

		if (!cam) return;

		const {
			left: snappedLeft,
			bottom: snappedBottom,
			width: snappedWidth,
			height: snappedHeight
		} = snapRect(viewport);

		if (!snappedWidth || !snappedHeight) return;

		// Resize camera to the exact viewport
		const { left, bottom, width, height } = viewport;
		resizeCamera(cam, width, height);

		// Crop camera to the snapped viewport
		const { view: offset } = cam;
		const offsetX = snappedLeft - left;
		const offsetY = bottom + height - (snappedBottom + snappedHeight);

		if (
			offset?.enabled &&
			offset.fullWidth === width &&
			offset.fullHeight === height &&
			offset.offsetX === offsetX &&
			offset.offsetY === offsetY &&
			offset.width === snappedWidth &&
			offset.height === snappedHeight
		) {
			return;
		}

		cam.setViewOffset(width, height, offsetX, offsetY, snappedWidth, snappedHeight);
	}

	function updateViews() {
		if (!viewMap.size) return;
		const canvasRect = canvas.getBoundingClientRect();

		for (const view of viewMap.values()) {
			updateViewRects(view, canvasRect);
			updateViewCamera(view);
		}
	}

	function resetRenderArea() {
		const { width, height } = size;
		renderer.setScissorTest(false);
		renderer.setScissor(0, 0, width, height);
		renderer.setViewport(0, 0, width, height);
	}

	function renderView({ viewport, scissor, render, scene, camera }: ThreeView) {
		const snappedViewport = snapRect(viewport);
		const snappedScissor = snapRect(scissor);

		renderer.setViewport(
			snappedViewport.left,
			snappedViewport.bottom,
			snappedViewport.width,
			snappedViewport.height
		);

		renderer.setScissor(
			snappedScissor.left,
			snappedScissor.bottom,
			snappedScissor.width,
			snappedScissor.height
		);

		renderer.setScissorTest(true);
		renderer.clearDepth();

		if (render.current) render.current();
		else if (camera.current) renderer.render(scene, camera.current);
	}

	function renderViews(views: ThreeView[]) {
		if (!views.length) return;

		for (const view of views) {
			if (!view.isVisible.current) continue;

			try {
				renderView(view);
			} catch (e) {
				console.error('<ThreeViewRenderer> failed to render view:', e);
			}
		}

		resetRenderArea();
		renderer.clearDepth();
	}

	function dispose() {
		resetRenderArea();

		for (const view of viewMap.values()) {
			view.isVisible.current = false;
		}
	}

	useThreeLoop(updateViews, { stage: 'beforeRender', order: -Infinity });
	useThreeLoop(() => renderViews(orderedViews.below), { stage: 'render', order: -1 });
	useThreeLoop(() => renderViews(orderedViews.above), { stage: 'render', order: 1 });

	$effect(() => dispose);
</script>

{#each viewMap.values() as view (view.domElement)}
	<ThreeViewPortal {...view} />
{/each}
