<script lang="ts">
	import { Scene } from 'three';
	import { viewMap } from '#lib/three/components/view/ThreeViewRenderer.svelte';
	import type { ThreeView, ThreeViewRect } from '#lib/three/types.ts';

	type Props = Partial<Pick<ThreeView, 'renderOrder' | 'children'>>;

	const { renderOrder = 0, children }: Props = $props();

	let domElement: HTMLElement;
	let rect = $state<ThreeViewRect>();

	const view: ThreeView = {
		scene: new Scene(),
		isIntersecting: false,

		get domElement() {
			return domElement;
		},
		get rect() {
			return rect;
		},
		set rect(value) {
			rect = value;
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
