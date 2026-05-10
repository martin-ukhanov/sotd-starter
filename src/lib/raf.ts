import { CallbackList } from '$lib/utils/callbackList';

const RAF_PRIORITIES = {
	lenis: -3,
	anime: -2,
	three: -1,
	default: 0
} as const;

export type RafPriority = keyof typeof RAF_PRIORITIES;

const callbacks = new CallbackList<FrameRequestCallback>();
let rafId: number | undefined;

function raf(time: number) {
	callbacks.run(time);
	rafId = requestAnimationFrame(raf);
}

export function addRafCallback(
	callback: FrameRequestCallback,
	priority: RafPriority | number = 'default'
) {
	const resolvedPriority = typeof priority === 'string' ? RAF_PRIORITIES[priority] : priority;
	callbacks.add(callback, resolvedPriority);
}

export function removeRafCallback(callback: FrameRequestCallback) {
	callbacks.remove(callback);
}

export function startRafLoop() {
	if (rafId === undefined) {
		rafId = requestAnimationFrame(raf);
	}
}

export function stopRafLoop() {
	if (rafId !== undefined) {
		cancelAnimationFrame(rafId);
		rafId = undefined;
	}
}
