<script lang="ts">
	import { useAnime } from '$lib/composables/useAnime.svelte';
	import { useEventListener } from '$lib/composables/useEventListener.svelte';
	import { utils, createAnimatable, createTimer } from 'animejs';
	import type { PointerEventHandler } from 'svelte/elements';

	interface SliderConfig {
		dragSpeed?: number;
		releaseSpeed?: number;
		dragMult?: number;
		bounce?: number | false;
		snap?: boolean;
		cursor?: boolean;
	}

	const {
		dragSpeed = 0.1,
		releaseSpeed,
		dragMult = 1,
		bounce = 0.1,
		snap = true,
		cursor = true
	}: SliderConfig = $props();

	let containerEl: HTMLElement;
	let trackEl: HTMLElement;
	let slideEls = $state<HTMLElement[]>([]);

	let pointerId = $state<number>();
	let minX = 0;
	let startX = 0;
	let lastX = 0;
	let virtualX = 0;
	let targetX = 0;
	let currentX = 0;
	let isDragging = false;
	let snapPoints: number[] = [];

	function calculateMinX() {
		minX = Math.min(0, containerEl.offsetWidth - trackEl.scrollWidth);
	}

	function calculateSnapPoints() {
		const snaps = slideEls.map((slideEl) => -slideEl.offsetLeft);
		const filteredSnaps = snaps.filter((snap) => snap > minX);

		if (filteredSnaps.length < snaps.length) {
			filteredSnaps.push(minX);
		}

		snapPoints = filteredSnaps;
	}

	const onPointerStart: PointerEventHandler<HTMLElement> = (e) => {
		if (pointerId || e.button !== 0) return;

		pointerId = e.pointerId;
		startX = e.clientX;
		lastX = startX;
		virtualX = targetX;

		if (cursor) {
			document.body.style.cursor = 'grabbing';
		}
	};

	const onPointerMove: PointerEventHandler<HTMLElement> = (e) => {
		if (e.pointerId !== pointerId) return;

		if (!isDragging) {
			isDragging = true;

			if (e.pointerType === 'mouse') {
				e.currentTarget.setPointerCapture(pointerId);
			}
		}

		const deltaX = (e.clientX - lastX) * dragMult;
		virtualX += deltaX;

		if (virtualX > 0) {
			targetX = virtualX * (bounce || 0);
		} else if (virtualX < minX) {
			targetX = minX + (virtualX - minX) * (bounce || 0);
		} else {
			targetX = virtualX;
		}

		lastX = e.clientX;
	};

	const onPointerEnd: PointerEventHandler<HTMLElement> = (e) => {
		if (e.pointerId !== pointerId) return;

		if (snap) {
			targetX = utils.snap(targetX, snapPoints);
		} else {
			targetX = utils.clamp(targetX, minX, 0);
		}

		if (e.pointerType === 'mouse' && e.currentTarget.hasPointerCapture(pointerId)) {
			e.currentTarget.releasePointerCapture(pointerId);
		}

		pointerId = undefined;
		isDragging = false;

		if (cursor) {
			document.body.style.cursor = '';
		}
	};

	useAnime(() => {
		calculateMinX();
		calculateSnapPoints();

		const trackAnimatable = createAnimatable(trackEl, { x: 0 });

		createTimer({
			onUpdate: ({ deltaTime }) => {
				const speed = isDragging ? dragSpeed : (releaseSpeed ?? dragSpeed);
				currentX = utils.damp(currentX, targetX, Math.max(0, deltaTime), speed);
				trackAnimatable.x(currentX);
			}
		});

		useEventListener(window, 'resize', () => {
			calculateMinX();
			calculateSnapPoints();
			targetX = utils.snap(targetX, snapPoints);
			virtualX = targetX;
			currentX = targetX;
		});
	});
</script>

<div
	bind:this={containerEl}
	role="none"
	class={[
		'touch-none overflow-x-clip select-none',
		{ 'cursor-grab': cursor },
		{ 'cursor-grabbing': cursor && pointerId }
	]}
	ondragstart={(e) => e.preventDefault()}
	onpointerdown={onPointerStart}
	onpointermove={onPointerMove}
	onpointerup={onPointerEnd}
	onpointercancel={onPointerEnd}
	onlostpointercapture={onPointerEnd}
>
	<div bind:this={trackEl} class="flex">
		{#each { length: 10 }, i}
			<div
				bind:this={slideEls[i]}
				class="flex aspect-square w-64 shrink-0 items-center justify-center border text-center text-2xl"
			>
				{i + 1}
				<button onclick={() => console.log('HELLO')}>Hello</button>
			</div>
		{/each}
	</div>
</div>
