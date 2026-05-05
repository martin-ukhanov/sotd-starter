import { addRafTick, removeRafTick, type RafPriority } from '$lib/raf';

export function useRaf(callback: FrameRequestCallback, priority?: RafPriority | number) {
	$effect(() => {
		addRafTick(callback, priority);
		return () => removeRafTick(callback);
	});
}
