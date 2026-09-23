import Lenis, { type LenisOptions as _LenisOptions } from 'lenis';
import { ref } from '$lib/utils/ref.svelte';

export type LenisOptions = Omit<_LenisOptions, 'autoRaf'> & { root?: boolean };

// eslint-disable-next-line svelte/prefer-svelte-reactivity
const instances = new Set<Lenis>();
const rootInstance = ref.raw<Lenis>();

export function createLenis({ root, wrapper, content, ...options }: LenisOptions = {}) {
	if (root && rootInstance.current) return;
	if (!(root || (wrapper && content))) return;

	const instance = new Lenis({
		lerp: 0.125,
		stopInertiaOnNavigate: true,
		naiveDimensions: true,
		...options,
		...(root ? {} : { wrapper, content }),
		autoRaf: false
	});

	instances.add(instance);
	if (root) rootInstance.current = instance;

	return instance;
}

export function destroyLenis(instance: Lenis | undefined) {
	if (!instance) return;

	instance.destroy();
	instances.delete(instance);

	if (instance === rootInstance.current) {
		rootInstance.current = undefined;
	}
}

export const lenisRaf: FrameRequestCallback = (time) => {
	instances.forEach((instance) => instance.raf(time));
};

export const rootLenis = ref.readonly(rootInstance);
