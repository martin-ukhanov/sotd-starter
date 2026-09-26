<script lang="ts">
	import { Scene } from 'three';
	import { viewMap } from './ThreeViewRenderer.svelte';
	import type { Snippet } from 'svelte';
	import type { ThreeView, ThreeViewRect } from '$lib/three/types';

	const { renderBelow, children }: { renderBelow?: boolean; children?: Snippet } = $props();

	let domElement: HTMLElement;
	let rect = $state<ThreeViewRect>();

	const view: ThreeView = {
		get domElement() {
			return domElement;
		},
		get children() {
			return children;
		},
		get rect() {
			return rect;
		},
		set rect(value) {
			rect = value;
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
