import { textMap } from '#lib/three/components/text/ThreeTextRenderer.svelte';
import type { Attachment } from 'svelte/attachments';
import type { Mesh } from 'three';
import type { Ref } from '#lib/utils/ref.svelte.ts';
import type { ThreeText } from '#lib/three/types.ts';

export type ThreeTextOptions = Omit<ThreeText, 'domElement'> & {
	ref?: Ref<Mesh | undefined>;
};

export function threeText(options: ThreeTextOptions = {}): Attachment<HTMLElement> {
	return (el) => {
		textMap.set(el, { ...options, domElement: el });
		return () => textMap.delete(el);
	};
}
