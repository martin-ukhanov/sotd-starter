<script lang="ts">
	import { Scene } from 'three';
	import { ref, rawRef } from '#lib/utils/ref.svelte.ts';
	import { viewMap } from '#lib/three/components/view/ThreeViewRenderer.svelte';
	import type { ThreeView, ThreeRect } from '#lib/three/types.ts';

	type Props = Partial<Pick<ThreeView, 'renderOrder' | 'children'>>;

	const { renderOrder = 0, children }: Props = $props();

	const viewport = $state<ThreeRect>({
		left: 0,
		bottom: 0,
		width: 0,
		height: 0
	});

	const scissor = $state<ThreeRect>({
		left: 0,
		bottom: 0,
		width: 0,
		height: 0
	});

	let domElement: HTMLElement;

	const view: ThreeView = {
		viewport,
		scissor,
		scene: new Scene(),
		camera: rawRef(),
		render: rawRef(),
		isVisible: ref(false),
		get domElement() {
			return domElement;
		},
		get renderOrder() {
			return renderOrder;
		},
		get children() {
			return children;
		}
	};

	$effect(() => {
		viewMap.set(domElement, view);
		return () => viewMap.delete(domElement);
	});
</script>

<div bind:this={domElement} class="relative size-full"></div>
