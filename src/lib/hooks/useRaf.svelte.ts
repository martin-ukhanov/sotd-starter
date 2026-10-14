import { Raf, type RafOrder } from '#lib/core/raf.ts';

export function useRaf(callback: FrameRequestCallback, order?: RafOrder | number) {
	$effect(() => Raf.add(callback, order));
}
