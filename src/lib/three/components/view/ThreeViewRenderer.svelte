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
	let observer: IntersectionObserver;

	function init() {
		renderer.autoClear = false;

		observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				const view = viewMap.get(entry.target as HTMLElement);
				if (view) view.isIntersecting = entry.isIntersecting;
			});
		});

		return () => {
			renderer.autoClear = true;
			observer.disconnect();
			viewMap.forEach((view) => (view.isIntersecting = false));
		};
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

		view.rect = {
			left: snapLeft,
			bottom: snapBottom,
			width: snap(rawLeft + width) - snapLeft,
			height: snap(rawBottom + height) - snapBottom
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

	function renderViews(views: ThreeView[], canvasRect: DOMRect) {
		renderer.setScissorTest(true);

		views.forEach((view) => {
			if (!view.isIntersecting) return;

			updateViewRect(view, canvasRect);
			if (!view.rect) return;

			if (!view.camera) view.camera = findCamera(view.scene);
			else if (!view.camera.parent) view.camera = undefined;

			if (!view.camera) return;

			const { left, bottom, width, height } = view.rect;
			resizeCamera(view.camera, width, height);

			renderer.setViewport(left, bottom, width, height);
			renderer.setScissor(left, bottom, width, height);

			if (view.render) view.render();
			else renderer.render(view.scene, view.camera);
		});

		renderer.setScissorTest(false);
	}

	function renderMain() {
		if (!mainCamera.current) return;
		renderer.setViewport(0, 0, viewport.width, viewport.height);
		renderer.render(mainScene, mainCamera.current);
	}

	function render() {
		const { below, above } = viewGroups;
		let canvasRect: DOMRect | undefined;

		if (below.length) {
			canvasRect = canvas.getBoundingClientRect();
			renderViews(below, canvasRect);
			renderer.clearDepth();
		}

		renderMain();

		if (above.length) {
			canvasRect ??= canvas.getBoundingClientRect();
			renderer.clearDepth();
			renderViews(above, canvasRect);
		}
	}

	$effect(init);
	$effect(syncViews);

	useThreeLoop(render, { stage: 'render' });
</script>

{#each viewMap.values() as view (view.scene.id)}
	<ThreeViewPortal {view} />
{/each}
