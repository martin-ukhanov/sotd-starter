<script lang="ts" module>
	import { SvelteMap } from 'svelte/reactivity';
	import type { ThreeView } from '$lib/three/types';

	export const views = new SvelteMap<HTMLElement, ThreeView>();
</script>

<script lang="ts">
	import { getThree } from '$lib/three/context';
	import { useThreeLoop } from '$lib/three/hooks/useThreeLoop.svelte';
	import { findCamera, resizeCamera } from '$lib/three/utils/camera';
	import ThreeViewPortal from './ThreeViewPortal.svelte';

	const { canvas, renderer, scene: mainScene, camera: mainCamera, viewport } = getThree();

	const observed = new Set<HTMLElement>();
	const sizeCache = new WeakMap<ThreeView, { width: number; height: number }>();

	let observer: IntersectionObserver | undefined;

	function updateViewBounds(view: ThreeView, canvasRect: DOMRect, viewRect?: DOMRect) {
		viewRect = viewRect ?? view.domElement.getBoundingClientRect();

		if (viewRect.width === 0 || viewRect.height === 0) {
			view.bounds = undefined;
			return;
		}

		view.bounds = {
			left: viewRect.left - canvasRect.left,
			bottom: canvasRect.bottom - viewRect.bottom,
			width: viewRect.width,
			height: viewRect.height
		};
	}

	function syncViews() {
		if (!observer) return;
		const active = new Set<HTMLElement>();

		views.forEach((view) => {
			active.add(view.domElement);

			// Add new views
			if (!observed.has(view.domElement)) {
				observer?.observe(view.domElement);
				observed.add(view.domElement);
			}
		});

		// Remove old views
		observed.forEach((el) => {
			if (!active.has(el)) {
				observer?.unobserve(el);
				observed.delete(el);
			}
		});
	}

	function renderMainPass() {
		if (!mainCamera.current) return;
		renderer.setViewport(0, 0, viewport.width, viewport.height);
		renderer.render(mainScene, mainCamera.current);
	}

	function renderViewsPass() {
		const canvasRect = canvas.getBoundingClientRect();
		renderer.setScissorTest(true);

		views.forEach((view) => {
			if (!view.isIntersecting) return;

			updateViewBounds(view, canvasRect);
			if (!view.bounds) return;

			if (!view.camera) view.camera = findCamera(view.scene);
			else if (!view.camera.parent) view.camera = undefined;

			if (!view.camera) return;

			const { left, bottom, width, height } = view.bounds;
			const cachedSize = sizeCache.get(view);

			if (!cachedSize || cachedSize.width !== width || cachedSize.height !== height) {
				resizeCamera(view.camera, width, height);
				sizeCache.set(view, { width, height });
			}

			renderer.setViewport(left, bottom, width, height);
			renderer.setScissor(left, bottom, width, height);
			renderer.render(view.scene, view.camera);
		});

		renderer.setScissorTest(false);
	}

	const onIntersect: IntersectionObserverCallback = (entries) => {
		const canvasRect = canvas.getBoundingClientRect();

		entries.forEach((entry) => {
			const view = views.get(entry.target as HTMLElement);

			if (view) {
				if (entry.isIntersecting) {
					updateViewBounds(view, canvasRect, entry.boundingClientRect);
				}

				view.isIntersecting = entry.isIntersecting;
			}
		});
	};

	$effect(() => {
		renderer.autoClear = false;
		observer = new IntersectionObserver(onIntersect);

		return () => {
			renderer.autoClear = true;
			observer?.disconnect();
			views.forEach((view) => (view.isIntersecting = false));
		};
	});

	$effect(syncViews);

	useThreeLoop(
		() => {
			renderMainPass();
			renderer.clearDepth();
			renderViewsPass();
		},
		{ stage: 'render' }
	);
</script>

{#each views.values() as view (view.scene.id)}
	<ThreeViewPortal {view} />
{/each}
