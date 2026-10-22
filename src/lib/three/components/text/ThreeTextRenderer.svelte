<script lang="ts" module>
	import { SvelteMap } from 'svelte/reactivity';
	import ThreeText from '#lib/three/components/text/ThreeText.svelte';
	import type { ThreeTextOptions } from '#lib/three/attachments/threeText.ts';
	import type { ThreeText as ThreeTextType } from '#lib/three/types.ts';

	export const textMap = new SvelteMap<
		HTMLElement,
		ThreeTextOptions & Pick<ThreeTextType, 'domElement'>
	>();
</script>

{#each textMap.values() as { ref, ...text } (text.domElement)}
	<ThreeText
		{...text}
		bind:mesh={
			() => ref?.current,
			(mesh) => {
				if (ref) ref.current = mesh;
			}
		}
	/>
{/each}
