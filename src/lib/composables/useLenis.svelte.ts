import { lenis } from '$lib/lenis.svelte';
import type Lenis from 'lenis';
import type { ScrollCallback } from 'lenis';

export function useLenis(callback: ScrollCallback, instance?: Lenis) {
	$effect(() => (instance ?? lenis.current)?.on('scroll', callback));
}
