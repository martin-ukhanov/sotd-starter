<script lang="ts">
	import { Scene } from 'three';
	import { viewMap } from '#lib/three/components/view/ThreeViewRenderer.svelte';
	import type { ThreeView } from '#lib/three/types.ts';

	type Props = Partial<Pick<ThreeView, 'renderOrder' | 'children'>>;

	const { renderOrder = 0, children }: Props = $props();

	const viewport = $state<ThreeView['viewport']>({
		left: 0,
		bottom: 0,
		width: 0,
		height: 0
	});

	let domElement: HTMLElement;
	let isVisible = $state(false);

	const view: ThreeView = {
		scene: new Scene(),
		viewport,

		get domElement() {
			return domElement;
		},
		get isVisible() {
			return isVisible;
		},
		set isVisible(value) {
			isVisible = value;
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
