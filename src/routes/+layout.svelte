<script lang="ts">
	import 'lenis/dist/lenis.css';
	import '#layout.css';
	import { dev } from '$app/env';
	import { setBreakpoints, useBreakpoints } from '#lib/hooks/useBreakpoints.svelte.ts';
	import LayoutGrid from '#lib/components/LayoutGrid.svelte';
	import favicon from '#lib/assets/favicon.svg';

	// Global context
	setBreakpoints(useBreakpoints());

	const { children } = $props();
</script>

<svelte:head>
	<title>Site of the Day (SOTD) Starter</title>
	<link rel="icon" href={favicon} />
</svelte:head>

<main>
	{@render children()}
</main>

{#if dev}
	<LayoutGrid />
{/if}
