<script lang="ts" module>
	import { SvelteMap } from 'svelte/reactivity';
	import type { ThreeView } from '#lib/three/types.ts';

	export const viewMap = new SvelteMap<Element, ThreeView>();
</script>

<script lang="ts">
	import { getThree } from '#lib/three/context.ts';
	import { useThreeLoop } from '#lib/three/hooks/useThreeLoop.svelte.ts';
	import { findCamera, resizeCamera } from '#lib/three/utils/camera.ts';
	import ThreeViewPortal from './ThreeViewPortal.svelte';

	const { canvas, renderer, scene: mainScene, camera: mainCamera, viewport } = getThree();

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

	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const observed = new Set<Element>();
	let observer: IntersectionObserver;

	function resetRenderArea() {
		const { width, height } = viewport;
		renderer.setScissorTest(false);
		renderer.setScissor(0, 0, width, height);
		renderer.setViewport(0, 0, width, height);
	}

	function init() {
		renderer.autoClear = false;

		observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				const view = viewMap.get(entry.target);
				if (view) view.isIntersecting = entry.isIntersecting;
			});
		});

		return () => {
			renderer.autoClear = true;
			resetRenderArea();
			observer.disconnect();
			viewMap.forEach((view) => (view.isIntersecting = false));
		};
	}

	function syncViews() {
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const active = new Set<Element>();

		viewMap.forEach((view) => {
			active.add(view.domElement);

			// Add new views
			if (!observed.has(view.domElement)) {
				observer.observe(view.domElement);
				observed.add(view.domElement);
			}
		});

		// Remove old views
		observed.forEach((el) => {
			if (!active.has(el)) {
				observer.unobserve(el);
				observed.delete(el);
			}
		});
	}

	function updateViewRect(view: ThreeView, canvasRect: DOMRect) {
		const { left, bottom, width, height } = view.domElement.getBoundingClientRect();

		if (!width || !height) {
			view.rect = undefined;
			return;
		}

		const pixelRatio = renderer.getPixelRatio();
		const snap = (value: number) => Math.round(value * pixelRatio) / pixelRatio;

		const rawLeft = left - canvasRect.left;
		const rawBottom = canvasRect.bottom - bottom;

		const snapLeft = snap(rawLeft);
		const snapBottom = snap(rawBottom);

		const rect = {
			left: snapLeft,
			bottom: snapBottom,
			width: snap(rawLeft + width) - snapLeft,
			height: snap(rawBottom + height) - snapBottom
		};

		if (view.rect) Object.assign(view.rect, rect);
		else view.rect = rect;
	}

	function measureViews() {
		if (!viewMap.size) return;
		const canvasRect = canvas.getBoundingClientRect();

		viewMap.forEach((view) => {
			if (view.isIntersecting) updateViewRect(view, canvasRect);
		});
	}

	function renderViews(views: ThreeView[]) {
		if (!views.length) return;
		renderer.setScissorTest(true);

		views.forEach((view) => {
			if (!view.isIntersecting || !view.rect) return;

			try {
				if (!view.camera) view.camera = findCamera(view.scene);
				else if (!view.camera.parent) view.camera = undefined;

				if (!view.camera) return;

				const { left, bottom, width, height } = view.rect;
				resizeCamera(view.camera, width, height);

				renderer.setViewport(left, bottom, width, height);
				renderer.setScissor(left, bottom, width, height);
				renderer.clearDepth();

				if (view.render) view.render();
				else renderer.render(view.scene, view.camera);
			} catch (e) {
				console.error('Error rendering view:', e);
			}
		});

		resetRenderArea();
	}

	function renderMain() {
		if (!mainCamera.current) return;
		renderer.clearDepth();
		renderer.render(mainScene, mainCamera.current);
	}

	function render() {
		const { below, above } = orderedViews;
		renderViews(below);
		renderMain();
		renderViews(above);
	}

	$effect(init);
	$effect(syncViews);

	useThreeLoop(measureViews, { stage: 'beforeRender', order: -Infinity });
	useThreeLoop(render, { stage: 'render' });
</script>

{#each viewMap.values() as view (view.scene.id)}
	<ThreeViewPortal {view} />
{/each}
