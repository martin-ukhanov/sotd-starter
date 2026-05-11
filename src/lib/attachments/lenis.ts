import { createLenis, destroyLenis, type LenisOptions as _LenisOptions } from '$lib/lenis.svelte';
import type { Attachment } from 'svelte/attachments';
import type { Ref } from '$lib/utils/ref.svelte';
import type Lenis from 'lenis';

export type LenisOptions = Omit<_LenisOptions, 'root'> & {
	ref?: Ref<Lenis | undefined>;
};

export function lenis({ wrapper, content, ref, ...options }: LenisOptions = {}): Attachment {
	return (el) => {
		const instance = createLenis({
			...options,
			root: false,
			wrapper: wrapper ?? el,
			content: content ?? el.children[0]
		});

		if (ref) ref.current = instance;

		return () => {
			destroyLenis(instance);
			if (ref) ref.current = undefined;
		};
	};
}
