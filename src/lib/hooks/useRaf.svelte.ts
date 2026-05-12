import { Raf, type RafPriority } from '$lib/raf';

export function useRaf(callback: FrameRequestCallback, priority?: RafPriority | number) {
	$effect(() => {
		Raf.add(callback, priority);
		return () => Raf.remove(callback);
	});
}
