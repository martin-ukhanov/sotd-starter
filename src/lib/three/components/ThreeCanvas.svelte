<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import { devicePixelRatio } from 'svelte/reactivity/window';
	import { WebGLRenderer, Scene, Timer, Vector2 } from 'three';
	import { setThree, setThreeLoop, setThreeParent } from '#lib/three/context.ts';
	import { resolveCamera, resizeCamera } from '#lib/three/utils/camera.ts';
	import { ref } from '#lib/utils/ref.svelte.ts';
	import { CallbackList } from '#lib/utils/callbackList.ts';
	import { useElementVisibility } from '#lib/hooks/useElementVisibility.svelte.ts';
	import { useRaf } from '#lib/hooks/useRaf.svelte.ts';
	import type {
		ThreeSize,
		ThreeContext,
		ThreeCamera,
		ThreeLoopStage,
		ThreeLoopState,
		ThreeLoopCallback
	} from '#lib/three/types.ts';

	const { children }: { children?: Snippet } = $props();

	let container: HTMLElement;
	let canvas: HTMLCanvasElement;

	let containerRect = $state.raw<DOMRectReadOnly>();
	let isReady = $state(false);

	const isVisible = useElementVisibility(() => container);
	const camera = ref.raw<ThreeCamera>();

	const scene = new Scene();
	const timer = new Timer();
	const currentSize = new Vector2();

	let renderer: WebGLRenderer;

	const size: ThreeSize = {
		get width() {
			return containerRect?.width ?? 0;
		},
		get height() {
			return containerRect?.height ?? 0;
		},
		get pixelRatio() {
			return Math.min(devicePixelRatio.current ?? 1, 2);
		}
	};

	const context: ThreeContext = {
		size,
		scene,
		camera,
		isVisible,

		get domElement() {
			return container;
		},
		get canvas() {
			return canvas;
		},
		get renderer() {
			return renderer;
		}
	};

	const loopCallbacks: Record<ThreeLoopStage, CallbackList<ThreeLoopCallback>> = {
		beforeRender: new CallbackList(),
		afterRender: new CallbackList()
	};

	setThree(context);

	setThreeLoop((callback, options) => {
		const { stage = 'beforeRender', order = 0 } = options ?? {};
		return loopCallbacks[stage].add(callback, order);
	});

	setThreeParent(ref.from(() => scene));

	function init() {
		renderer = new WebGLRenderer({
			canvas,
			antialias: true,
			alpha: true
		});

		renderer.autoClear = false;
		renderer.setClearAlpha(0);

		timer.connect(document);
		isReady = true;

		return () => {
			renderer.dispose();
			timer.dispose();
		};
	}

	function updateCamera() {
		const resolved = resolveCamera(camera.current, scene);
		camera.current = resolved;

		if (resolved) {
			resizeCamera(resolved, size.width, size.height);
		}
	}

	function runLoop(state: ThreeLoopState) {
		if (!isVisible.current) return;

		updateCamera();
		renderer.clear();

		const { beforeRender, afterRender } = loopCallbacks;
		beforeRender.run(state);

		// Clear depth left by anything rendered in beforeRender
		renderer.clearDepth();

		if (context.render) context.render();
		else if (camera.current) renderer.render(scene, camera.current);

		afterRender.run(state);
	}

	function onResize() {
		const { width, height, pixelRatio } = size;
		if (!width || !height) return;

		const { width: currentWidth, height: currentHeight } = renderer.getSize(currentSize);
		const currentPixelRatio = renderer.getPixelRatio();

		if (width !== currentWidth || height !== currentHeight) {
			renderer.setSize(width, height, false);
		}

		if (pixelRatio !== currentPixelRatio) {
			renderer.setPixelRatio(pixelRatio);
		}

		untrack(() =>
			runLoop({
				delta: 0,
				elapsed: timer.getElapsed()
			})
		);
	}

	const raf: FrameRequestCallback = (time) => {
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
	class="relative size-full overflow-clip"
	bind:contentRect={containerRect}
>
	<canvas bind:this={canvas} class="size-full">
		{#if isReady}
			{@render children?.()}
		{/if}
	</canvas>
</div>
