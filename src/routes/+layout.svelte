<script lang="ts">
	import 'lenis/dist/lenis.css';
	import './layout.css';
	import { dev } from '$app/environment';
	import LayoutGrid from '$lib/components/LayoutGrid.svelte';
	import favicon from '$lib/assets/favicon.svg';

	const { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<main>
	{@render children()}
</main>

{#if dev}
	<LayoutGrid />
{/if}
