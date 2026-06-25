<script lang="ts" module>
	import { SvelteMap } from 'svelte/reactivity';
	import type { ThreeView } from '$lib/three/types';

	export const viewMap = new SvelteMap<HTMLElement, ThreeView>();
</script>

<script lang="ts">
	import { getThree } from '$lib/three/context';
	import { useThreeLoop } from '$lib/three/hooks/useThreeLoop.svelte';
	import { findCamera, resizeCamera } from '$lib/three/utils/camera';
	import ThreeViewPortal from './ThreeViewPortal.svelte';

	const { canvas, renderer, scene: mainScene, camera: mainCamera, viewport } = getThree();

	const viewGroups = $derived(
		viewMap.values().reduce(
			(groups, view) => {
				(view.renderBelow ? groups.below : groups.above).push(view);
				return groups;
			},
			{
				below: [] as ThreeView[],
				above: [] as ThreeView[]
			}
		)
	);

	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const observed = new Set<HTMLElement>();
	const sizeCache = new WeakMap<ThreeView, { width: number; height: number }>();

	let observer: IntersectionObserver;

	function updateViewBounds(view: ThreeView, canvasRect: DOMRect, viewRect?: DOMRect) {
		viewRect ??= view.domElement.getBoundingClientRect();

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
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const active = new Set<HTMLElement>();

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

	function renderMain() {
		if (!mainCamera.current) return;
		renderer.setViewport(0, 0, viewport.width, viewport.height);
		renderer.render(mainScene, mainCamera.current);
	}

	function renderViews(views: ThreeView[], canvasRect: DOMRect) {
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
			const view = viewMap.get(entry.target as HTMLElement);

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
			observer.disconnect();
			viewMap.forEach((view) => (view.isIntersecting = false));
		};
	});

	$effect(syncViews);

	useThreeLoop(
		() => {
			let canvasRect: DOMRect | undefined;

			if (viewGroups.below.length) {
				canvasRect = canvas.getBoundingClientRect();
				renderViews(viewGroups.below, canvasRect);
				renderer.clearDepth();
			}

			renderMain();

			if (viewGroups.above.length) {
				canvasRect ??= canvas.getBoundingClientRect();
				renderer.clearDepth();
				renderViews(viewGroups.above, canvasRect);
			}
		},
		{ stage: 'render' }
	);
</script>

{#each viewMap.values() as view (view.scene.id)}
	<ThreeViewPortal {view} />
{/each}
