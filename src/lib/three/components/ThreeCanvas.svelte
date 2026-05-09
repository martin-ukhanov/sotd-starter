<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import { devicePixelRatio } from 'svelte/reactivity/window';
	import { WebGLRenderer, Timer, Scene, type Camera, type Object3D } from 'three';
	import { setThree, setThreeLoop, setThreeParent } from '$three/context';
	import { resizeCamera } from '$three/utils/resizeCamera';
	import { rawRef } from '$lib/utils/ref.svelte';
	import { CallbackList } from '$lib/utils/callbackList';
	import { useRaf } from '$lib/composables/useRaf.svelte';
	import type {
		ThreeViewport,
		ThreeLoopStage,
		ThreeLoopState,
		ThreeLoopCallback
	} from '$three/types';

	const { children }: { children?: Snippet } = $props();

	let canvas: HTMLCanvasElement;

	let containerWidth = $state(0);
	let containerHeight = $state(0);

	let renderer = $state.raw<WebGLRenderer>();
	let isReady = $state(false);

	const camera = rawRef<Camera>();

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

	const scene = new Scene();
	const timer = new Timer();

	const loopCallbacks: Record<ThreeLoopStage, CallbackList<ThreeLoopCallback>> = {
		beforeRender: new CallbackList(),
		render: new CallbackList(),
		afterRender: new CallbackList()
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
		add: (callback, { stage = 'beforeRender', priority = 0 } = {}) => {
			loopCallbacks[stage].add(callback, priority);
		},
		remove: (callback) => {
			loopCallbacks.beforeRender.remove(callback);
			loopCallbacks.render.remove(callback);
			loopCallbacks.afterRender.remove(callback);
		}
	});

	setThreeParent(scene);

	function findCamera(obj: Object3D): Camera | undefined {
		if ((obj as Camera).isCamera) return obj as Camera;

		for (let i = 0; i < obj.children.length; i++) {
			const found = findCamera(obj.children[i]!);
			if (found) return found;
		}

		return undefined;
	}

	function runLoop(state: ThreeLoopState) {
		const { beforeRender, render, afterRender } = loopCallbacks;
		beforeRender.run(state);

		if (render.size) {
			render.run(state);
		} else if (camera.current) {
			renderer?.render(scene, camera.current);
		}

		afterRender.run(state);
	}

	function onResize() {
		renderer?.setSize(viewport.width, viewport.height, false);
		renderer?.setPixelRatio(viewport.pixelRatio);

		if (camera.current) {
			resizeCamera(camera.current, viewport.width, viewport.height);
		}

		runLoop({
			delta: 0,
			elapsed: timer.getElapsed()
		});
	}

	$effect(() => {
		untrack(() => {
			renderer = new WebGLRenderer({
				canvas,
				antialias: true,
				alpha: true
			});

			renderer.setClearAlpha(0);
			isReady = true;
		});

		timer.connect(document);
		$effect(onResize);

		useRaf((time) => {
			if (!camera.current) {
				const foundCamera = findCamera(scene);

				if (foundCamera) {
					resizeCamera(foundCamera, viewport.width, viewport.height);
					camera.current = foundCamera;
				} else {
					renderer?.clear();
				}
			}

			timer.update(time);

			runLoop({
				delta: timer.getDelta(),
				elapsed: timer.getElapsed()
			});
		}, 'three');

		return () => {
			renderer?.dispose();
			timer.dispose();
		};
	});
</script>

<div bind:clientWidth={containerWidth} bind:clientHeight={containerHeight} class="size-full">
	<canvas bind:this={canvas} class="size-full">
		{#if isReady}
			{@render children?.()}
		{/if}
	</canvas>
</div>
