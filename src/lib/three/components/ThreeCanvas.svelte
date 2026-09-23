<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import { devicePixelRatio } from 'svelte/reactivity/window';
	import { WebGLRenderer, Scene, Timer, Vector2, type Camera } from 'three';
	import { setThree, setThreeLoop, setThreeParent } from '$lib/three/context';
	import { findCamera, resizeCamera } from '$lib/three/utils/camera';
	import { ref } from '$lib/utils/ref.svelte';
	import { CallbackList } from '$lib/utils/callbackList';
	import { useElementVisibility } from '$lib/hooks/useElementVisibility.svelte';
	import { useRaf } from '$lib/hooks/useRaf.svelte';
	import type {
		ThreeViewport,
		ThreeLoopStage,
		ThreeLoopState,
		ThreeLoopCallback
	} from '$lib/three/types';

	const { children }: { children?: Snippet } = $props();

	let canvas: HTMLCanvasElement;
	let container: HTMLElement;
	let containerSize = $state({ width: 0, height: 0 });
	let isReady = $state(false);

	const camera = ref.raw<Camera>();

	const scene = new Scene();
	const timer = new Timer();
	const currentSize = new Vector2();

	let renderer: WebGLRenderer | undefined;

	const viewport: ThreeViewport = {
		get width() {
			return containerSize.width;
		},
		get height() {
			return containerSize.height;
		},
		get pixelRatio() {
			return Math.min(devicePixelRatio.current ?? 1, 2);
		}
	};

	const loopCallbacks: Record<ThreeLoopStage, CallbackList<ThreeLoopCallback>> = {
		beforeRender: new CallbackList(),
		render: new CallbackList(),
		afterRender: new CallbackList()
	};

	const isVisible = useElementVisibility(() => container);

	setThree({
		get canvas() {
			return canvas;
		},
		get renderer() {
			return renderer!;
		},
		get scene() {
			return scene;
		},
		get camera() {
			return camera;
		},
		get viewport() {
			return viewport;
		}
	});

	setThreeLoop((callback, options) => {
		const { stage = 'beforeRender', priority = 0 } = options ?? {};
		return loopCallbacks[stage].add(callback, priority);
	});

	setThreeParent(ref.from(() => scene));

	function init() {
		renderer = new WebGLRenderer({
			canvas,
			antialias: true,
			alpha: true
		});

		timer.connect(document);
		isReady = true;

		return () => {
			renderer?.dispose();
			timer.dispose();
		};
	}

	function runLoop(state: ThreeLoopState) {
		untrack(() => {
			if (!renderer || !isVisible.current) return;
			renderer.clear();

			const { beforeRender, render, afterRender } = loopCallbacks;
			beforeRender.run(state);

			if (render.size) render.run(state);
			else if (camera.current) renderer.render(scene, camera.current);

			afterRender.run(state);
		});
	}

	function onResize() {
		if (!renderer) return;

		const { width, height, pixelRatio } = viewport;
		const { width: currentWidth, height: currentHeight } = renderer.getSize(currentSize);
		const currentPixelRatio = renderer.getPixelRatio();

		const sizeChanged = width !== currentWidth || height !== currentHeight;
		const pixelRatioChanged = pixelRatio !== currentPixelRatio;

		if (sizeChanged) renderer.setSize(width, height, false);
		if (pixelRatioChanged) renderer.setPixelRatio(pixelRatio);
		if (camera.current) resizeCamera(camera.current, width, height);

		runLoop({
			delta: 0,
			elapsed: timer.getElapsed()
		});
	}

	const raf: FrameRequestCallback = (time) => {
		if (!camera.current) {
			const foundCamera = findCamera(scene);

			if (foundCamera) {
				resizeCamera(foundCamera, viewport.width, viewport.height);
				camera.current = foundCamera;
			}
		} else if (!camera.current.parent) {
			camera.current = undefined;
		}

		timer.update(time);

		runLoop({
			delta: timer.getDelta(),
			elapsed: timer.getElapsed()
		});
	};

	$effect(init);
	$effect(onResize);

	useRaf(raf, 'three');
</script>

<div
	bind:this={container}
	bind:clientWidth={containerSize.width}
	bind:clientHeight={containerSize.height}
	class="relative size-full"
>
	<canvas bind:this={canvas} class="size-full">
		{#if isReady}
			{@render children?.()}
		{/if}
	</canvas>
</div>
