<script lang="ts">
	import { get } from 'animejs';

	let numCols = $state(0);
	let isVisible = $state(false);

	function setCols() {
		if (isVisible) {
			numCols = get(':root', '--layout-grid-cols', false);
		}
	}

	function onkeydown(e: KeyboardEvent) {
		if (e.metaKey && e.key.toLowerCase() === 'g') {
			isVisible = !isVisible;
			setCols();
		}
	}
</script>

<svelte:window onresize={setCols} />
<svelte:document {onkeydown} />

<div class={['pointer-events-none fixed inset-0 z-9999 layout-grid', { invisible: !isVisible }]}>
	{#each { length: numCols }}
		<div class="bg-[red]/15"></div>
	{/each}
</div>
