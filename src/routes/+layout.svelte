<script lang="ts">
	import 'lenis/dist/lenis.css';
	import './layout.css';
	import { dev } from '$app/environment';
	import { setBreakpoints } from '$lib/context';
	import { useBreakpoints } from '$lib/composables/useBreakpoints.svelte';
	import LayoutGrid from '$lib/components/LayoutGrid.svelte';
	import favicon from '$lib/assets/favicon.svg';

	const { children } = $props();

	// Context
	setBreakpoints(useBreakpoints());
</script>

<svelte:head>
	<title>🏆 Site of the Day (SOTD) Starter</title>
	<link rel="icon" href={favicon} />
</svelte:head>

<main>
	{@render children()}
</main>

{#if dev}
	<LayoutGrid />
{/if}
