<script lang="ts">
	import { Scene } from 'three';
	import { viewMap } from './ThreeViewRenderer.svelte';
	import type { Snippet } from 'svelte';
	import type { ThreeView } from '$lib/three/types';

	const { renderBelow, children }: { renderBelow?: boolean; children?: Snippet } = $props();

	let domElement: HTMLElement;

	const view: ThreeView = {
		get domElement() {
			return domElement;
		},
		get children() {
			return children;
		},
		get renderBelow() {
			return renderBelow;
		},
		scene: new Scene()
	};

	$effect(() => {
		viewMap.set(domElement, view);
		return () => viewMap.delete(domElement);
	});
</script>

<div bind:this={domElement} class="relative size-full"></div>
