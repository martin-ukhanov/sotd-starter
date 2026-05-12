import { SvelteSet } from 'svelte/reactivity';
import Lenis, { type LenisOptions as _LenisOptions } from 'lenis';
import { ref } from '$lib/utils/ref.svelte';

export type LenisOptions = Omit<_LenisOptions, 'autoRaf'> & { root?: boolean };

export const lenisInstances = new SvelteSet<Lenis>();
const rootRef = ref.raw<Lenis>();

export function createLenis({ root, wrapper, content, ...options }: LenisOptions = {}) {
	if (root && rootRef.current) return;
	if (!(root || (wrapper && content))) return;

	const newInstance = new Lenis({
		...options,
		...(root ? {} : { wrapper, content }),
		autoRaf: false
	});

	lenisInstances.add(newInstance);
	if (root) rootRef.current = newInstance;

	return newInstance;
}

export function destroyLenis(instance: Lenis | undefined) {
	if (!instance) return;

	instance.destroy();
	lenisInstances.delete(instance);

	if (instance === rootRef.current) {
		rootRef.current = undefined;
	}
}

export const lenis = ref.readonly(rootRef);
