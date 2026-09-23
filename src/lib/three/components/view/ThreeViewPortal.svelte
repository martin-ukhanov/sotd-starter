<script lang="ts">
	import { ref } from '$lib/utils/ref.svelte';
	import { getThreeLoop, setThreeLoop, setThreeParent } from '$lib/three/context';
	import type { ThreeView } from '$lib/three/types';

	const { view }: { view: ThreeView } = $props();
	const subscribe = getThreeLoop();

	setThreeLoop((callback, options) =>
		subscribe((state) => {
			if (view.isIntersecting) callback(state);
		}, options)
	);

	setThreeParent(ref.from(() => view.scene));
</script>

{@render view.children?.()}
