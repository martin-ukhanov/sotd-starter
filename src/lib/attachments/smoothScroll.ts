import { createLenis, destroyLenis, type LenisOptions } from '$lib/lenis.svelte';
import type { Attachment } from 'svelte/attachments';
import type Lenis from 'lenis';

export type SmoothScrollOptions = Omit<LenisOptions, 'root'> & {
	onInit?(instance?: Lenis): void;
};

export function smoothScroll({
	wrapper,
	content,
	onInit,
	...options
}: SmoothScrollOptions = {}): Attachment {
	return (el) => {
		const lenis = createLenis({
			...options,
			root: false,
			wrapper: wrapper ?? el,
			content: content ?? el.children[0]
		});

		onInit?.(lenis);
		return () => destroyLenis(lenis);
	};
}
