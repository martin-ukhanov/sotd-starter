import { SvelteSet } from 'svelte/reactivity';
import Lenis, { type LenisOptions as _LenisOptions } from 'lenis';
import { rawRef, readonlyRef } from '$lib/utils/ref.svelte';

export type LenisOptions = Omit<_LenisOptions, 'autoRaf'> & { root?: boolean };

export const lenisInstances = new SvelteSet<Lenis>();
const rootLenisInstance = rawRef<Lenis>();

export function createLenis({ root, wrapper, content, ...options }: LenisOptions = {}) {
	if (root && rootLenisInstance.current) return;
	if (!(root || (wrapper && content))) return;

	const newInstance = new Lenis({
		...options,
		...(root ? {} : { wrapper, content }),
		autoRaf: false
	});

	lenisInstances.add(newInstance);
	if (root) rootLenisInstance.current = newInstance;

	return newInstance;
}

export function destroyLenis(instance: Lenis | undefined) {
	if (!instance) return;

	instance.destroy();
	lenisInstances.delete(instance);

	if (instance === rootLenisInstance.current) {
		rootLenisInstance.current = undefined;
	}
}

export const lenis = readonlyRef(rootLenisInstance);
