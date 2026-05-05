import { SvelteSet } from 'svelte/reactivity';
import Lenis, { type LenisOptions as _LenisOptions } from 'lenis';

export type LenisOptions = Omit<_LenisOptions, 'autoRaf'> & { root?: boolean };

export const lenisInstances = new SvelteSet<Lenis>();
let rootInstance = $state.raw<Lenis>();

export function createLenis({ root, wrapper, content, ...options }: LenisOptions = {}) {
	if (root && rootInstance) return;
	if (!(root || (wrapper && content))) return;

	const newInstance = new Lenis({
		...options,
		...(root ? {} : { wrapper, content }),
		autoRaf: false
	});

	lenisInstances.add(newInstance);
	if (root) rootInstance = newInstance;

	return newInstance;
}

export function destroyLenis(instance: Lenis | undefined) {
	if (!instance) return;

	instance.destroy();
	lenisInstances.delete(instance);

	if (instance === rootInstance) rootInstance = undefined;
}

export const lenis = {
	get value() {
		return rootInstance;
	}
};
