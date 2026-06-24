<script lang="ts">
	import { Scene } from 'three';
	import { views } from './ThreeViewRenderer.svelte';
	import type { Snippet } from 'svelte';

	const { children }: { children: Snippet } = $props();

	let domElement: HTMLElement;
	const scene = new Scene();

	$effect(() => {
		views.set(domElement, { domElement, children, scene });
		return () => views.delete(domElement);
	});
</script>

<div bind:this={domElement} class="relative size-full"></div>
