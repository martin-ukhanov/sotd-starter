import { Raf, type RafPriority } from '$lib/core/raf';

export function useRaf(callback: FrameRequestCallback, priority?: RafPriority | number) {
	$effect(() => {
		Raf.add(callback, priority);
		return () => Raf.remove(callback);
	});
}
