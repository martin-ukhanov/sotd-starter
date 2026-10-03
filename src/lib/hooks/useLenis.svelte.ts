import { rootLenis } from '#lib/core/lenis.svelte.ts';
import { unref, type MaybeRef } from '#lib/utils/ref.svelte.ts';
import type Lenis from 'lenis';
import type { ScrollCallback } from 'lenis';

export function useLenis(
	callback: ScrollCallback,
	instance: MaybeRef<Lenis | undefined> = rootLenis
) {
	$effect(() => unref(instance)?.on('scroll', callback));
}
