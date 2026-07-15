<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import { devicePixelRatio } from 'svelte/reactivity/window';
	import { WebGLRenderer, Scene, Timer, Vector2, type Camera } from 'three';
	import { setThree, setThreeLoop, setThreeParent } from '$lib/three/context';
	import { findCamera, resizeCamera } from '$lib/three/utils/camera';
	import { ref } from '$lib/utils/ref.svelte';
	import { CallbackList } from '$lib/utils/callbackList';
	import { useRaf } from '$lib/hooks/useRaf.svelte';
	import type {
		ThreeViewport,
		ThreeLoopStage,
		ThreeLoopState,
		ThreeLoopCallback,
		ThreeLoop
	} from '$lib/three/types';

	const { children }: { children?: Snippet } = $props();

	let canvas: HTMLCanvasElement;
	let containerWidth = $state(0);
	let containerHeight = $state(0);
	let isReady = $state(false);

	const camera = ref.raw<Camera>();

	let renderer: WebGLRenderer | undefined;

	const scene = new Scene();
	const timer = new Timer();
	const currentSize = new Vector2();

	const viewport: ThreeViewport = {
		get width() {
			return containerWidth;
		},
		get height() {
			return containerHeight;
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

	const addLoopCallback: ThreeLoop['add'] = (callback, options) => {
		const { stage = 'beforeRender', priority = 0 } = options ?? {};
		loopCallbacks[stage].add(callback, priority);
	};

	const removeLoopCallback: ThreeLoop['remove'] = (callback) => {
		loopCallbacks.beforeRender.remove(callback);
		loopCallbacks.render.remove(callback);
		loopCallbacks.afterRender.remove(callback);
	};

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

	setThreeLoop({
		get add() {
			return addLoopCallback;
		},
		get remove() {
			return removeLoopCallback;
		}
	});

	setThreeParent({
		get current() {
			return scene;
		}
	});

	function runLoop(state: ThreeLoopState) {
		untrack(() => {
			if (!renderer) return;
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
		if (sizeChanged && camera.current) resizeCamera(camera.current, width, height);

		runLoop({ delta: 0, elapsed: timer.getElapsed() });
	}

	const raf: FrameRequestCallback = (time) => {
		if (!renderer) return;

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
		runLoop({ delta: timer.getDelta(), elapsed: timer.getElapsed() });
	};

	$effect(() => {
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
	});

	$effect(onResize);
	useRaf(raf, 'three');
</script>

<div
	bind:clientWidth={containerWidth}
	bind:clientHeight={containerHeight}
	class="relative size-full"
>
	<canvas bind:this={canvas} class="size-full">
		{#if isReady}
			{@render children?.()}
		{/if}
	</canvas>
</div>
