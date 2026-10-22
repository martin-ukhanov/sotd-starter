<script lang="ts">
	import {
		CanvasTexture,
		Group,
		Mesh,
		PlaneGeometry,
		MeshBasicMaterial,
		LinearFilter,
		SRGBColorSpace
	} from 'three';
	import { getThree } from '#lib/three/context.ts';
	import {
		drawTextLayout,
		getTextStyleKey,
		loadTextLayoutFonts,
		measureTextLayout
	} from '#lib/three/utils/text.ts';
	import { useEventListener } from '#lib/hooks/useEventListener.svelte.ts';
	import { useResizeObserver } from '#lib/hooks/useResizeObserver.svelte.ts';
	import { useMutationObserver } from '#lib/hooks/useMutationObserver.svelte.ts';
	import { useDomTransform } from '#lib/three/hooks/useDomTransform.svelte.ts';
	import { useThreeLoop } from '#lib/three/hooks/useThreeLoop.svelte.ts';
	import ThreeNode from '#lib/three/components/ThreeNode.svelte';
	import type { ThreeText } from '#lib/three/types.ts';

	let {
		domElement,
		material,
		segments = 1,
		debug = false,
		mesh = $bindable()
	}: ThreeText & { mesh?: Mesh } = $props();

	const [widthSegments, heightSegments] = $derived(
		typeof segments === 'number' ? [segments, segments] : segments
	);

	const { size } = getThree();

	const canvas = new OffscreenCanvas(1, 1);
	const context = canvas.getContext('2d')!;

	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;
	texture.minFilter = LinearFilter;
	texture.generateMipmaps = false;

	let group = $state.raw<Group>();
	let bounds = $state.raw({ left: 0, top: 0, width: 0, height: 0 });
	let drawnElement = $state.raw<HTMLElement>();

	const isDrawn = $derived(domElement === drawnElement);

	// Latest draw inputs, set by an effect so changing them triggers a redraw
	let input: { domElement: HTMLElement; pixelRatio: number; color?: string } | undefined;
	let version = 0;
	let isRedrawScheduled = false;
	let styleKey = '';

	async function redraw() {
		const current = ++version;

		if (!input) {
			drawnElement = undefined;
			return;
		}

		const { domElement: el, pixelRatio, color } = input;
		let words = measureTextLayout(el);

		// The DOM text reflows once its fonts load, so measure again
		const hadUnloadedFonts = await loadTextLayoutFonts(words);
		if (current !== version) return;
		if (hadUnloadedFonts) words = measureTextLayout(el);

		if (!words.length) {
			drawnElement = undefined;
			return;
		}

		const { width: previousWidth, height: previousHeight } = canvas;
		bounds = drawTextLayout(context, words, pixelRatio, color);

		// Texture storage can't be resized, so free it and let it be created again at the new size
		if (canvas.width !== previousWidth || canvas.height !== previousHeight) texture.dispose();
		texture.needsUpdate = true;

		drawnElement = el;
	}

	// Resize observers never fire for inline elements, so also watch the nearest block around them
	function getResizeTargets(el: HTMLElement) {
		let block: Element | null = el;

		while (block && getComputedStyle(block).display === 'inline') {
			block = block.parentElement;
		}

		return block && block !== el ? [el, block] : [el];
	}

	// Batches triggers into one redraw
	function scheduleRedraw() {
		if (isRedrawScheduled) return;
		isRedrawScheduled = true;

		queueMicrotask(() => {
			isRedrawScheduled = false;
			redraw();
		});
	}

	function dispose() {
		version++;
		texture.dispose();
	}

	$effect(() => {
		input = {
			domElement,
			pixelRatio: size.pixelRatio,
			color: debug ? 'rgba(255, 0, 0, 0.5)' : undefined
		};

		scheduleRedraw();
	});

	// Hide the element once its text is drawn
	$effect(() => {
		const el = domElement;
		if (!isDrawn || debug) return;

		const { opacity } = el.style;
		el.style.opacity = '0';

		return () => (el.style.opacity = opacity);
	});

	useEventListener(() => document.fonts, 'loadingdone', scheduleRedraw);
	useResizeObserver(() => getResizeTargets(domElement), scheduleRedraw);
	useMutationObserver(() => domElement, scheduleRedraw, {
		subtree: true,
		childList: true,
		characterData: true
	});

	useThreeLoop(() => {
		const key = getTextStyleKey(domElement);
		if (key === styleKey) return;

		styleKey = key;
		scheduleRedraw();
	});

	useDomTransform(
		() => domElement,
		() => group
	);

	$effect(() => dispose);
</script>

<ThreeNode is={Group} bind:node={group} options={{ visible: isDrawn }}>
	<ThreeNode
		is={Mesh}
		bind:node={mesh}
		options={{
			scale: [bounds.width, bounds.height, 1],
			position: [bounds.left + bounds.width / 2, -(bounds.top + bounds.height / 2), 0]
		}}
	>
		<ThreeNode is={PlaneGeometry} args={[1, 1, widthSegments, heightSegments]} />

		{#if material}
			{@render material(texture)}
		{:else}
			<ThreeNode
				is={MeshBasicMaterial}
				options={{ map: texture, transparent: true, toneMapped: false, depthWrite: false }}
			/>
		{/if}
	</ThreeNode>
</ThreeNode>
