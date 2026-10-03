import { Raf, type RafPriority } from '#lib/core/raf.ts';

export function useRaf(callback: FrameRequestCallback, priority?: RafPriority | number) {
	$effect(() => {
		Raf.add(callback, priority);
		return () => Raf.remove(callback);
	});
}
