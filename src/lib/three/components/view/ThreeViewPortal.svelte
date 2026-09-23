<script lang="ts">
	import { untrack } from 'svelte';
	import { ref } from '$lib/utils/ref.svelte';
	import { getThreeLoop, setThreeLoop, setThreeParent, setThreeView } from '$lib/three/context';
	import type { ThreeView } from '$lib/three/types';

	const { view }: { view: ThreeView } = $props();
	const subscribe = getThreeLoop();

	setThreeLoop((callback, options) =>
		subscribe((state) => {
			if (view.isIntersecting) callback(state);
		}, options)
	);

	setThreeParent(ref.from(() => view.scene));
	setThreeView(untrack(() => view));
</script>

{@render view.children?.()}
