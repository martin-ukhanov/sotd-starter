import { addRafCallback, removeRafCallback, type RafPriority } from '$lib/raf';

export function useRaf(callback: FrameRequestCallback, priority?: RafPriority | number) {
	$effect(() => {
		addRafCallback(callback, priority);
		return () => removeRafCallback(callback);
	});
}
