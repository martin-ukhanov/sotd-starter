<script lang="ts">
	import { Scene } from 'three';
	import { viewMap } from './ThreeViewRenderer.svelte';
	import type { Snippet } from 'svelte';

	const { renderBelow, children }: { renderBelow?: boolean; children?: Snippet } = $props();

	let domElement: HTMLElement;
	const scene = new Scene();

	$effect(() => {
		viewMap.set(domElement, { domElement, scene, children, renderBelow });
		return () => viewMap.delete(domElement);
	});
</script>

<div bind:this={domElement} class="relative size-full"></div>
