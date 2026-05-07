<script lang="ts">
	import { get } from 'animejs';
	import { getBreakpoints } from '$lib/composables/useBreakpoints.svelte';

	const breakpoints = getBreakpoints();

	let numCols = $state(0);
	let isVisible = $state(false);

	function onkeydown(e: KeyboardEvent) {
		if (e.metaKey && e.key.toLowerCase() === 'g') {
			isVisible = !isVisible;
		}
	}

	$effect(() => {
		if (breakpoints.lg || !breakpoints.lg) {
			numCols = get(':root', '--layout-grid-cols', false);
		}
	});
</script>

<svelte:document {onkeydown} />

<div class={['pointer-events-none fixed inset-0 z-9999 layout-grid', { invisible: !isVisible }]}>
	{#each { length: numCols }}
		<div class="bg-[red]/10"></div>
	{/each}
</div>
