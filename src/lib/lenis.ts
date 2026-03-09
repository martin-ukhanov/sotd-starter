import Lenis, { type LenisOptions as _LenisOptions } from 'lenis';

export type LenisOptions = Omit<_LenisOptions, 'autoRaf'> & { root?: boolean };

export const lenisInstances = new Set<Lenis>();
export let lenis: Lenis | undefined; // Root instance

export function createLenis({ root, wrapper, content, ...options }: LenisOptions = {}) {
	// Prevent duplicate root instances
	if (root && lenis) return;

	// Require wrapper and content for non-root instances
	if (!(root || (wrapper && content))) return;

	const newInstance = new Lenis({
		...options,
		...(root ? {} : { wrapper, content }),
		autoRaf: false
	});

	lenisInstances.add(newInstance);
	if (root) lenis = newInstance;

	return newInstance;
}

export function destroyLenis(instance: Lenis | undefined) {
	if (!instance) return;

	instance.destroy();
	lenisInstances.delete(instance);

	// Root instance destroyed
	if (instance === lenis) lenis = undefined;
}
