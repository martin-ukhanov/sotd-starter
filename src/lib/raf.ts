const RAF_PRIORITIES = {
	lenis: -2,
	anime: -1,
	default: 0
} as const;

export type RafPriority = keyof typeof RAF_PRIORITIES;

const tickToPriority = new Map<FrameRequestCallback, number>();
const ticksByPriority = new Map<number, Set<FrameRequestCallback>>();

let sortedPriorities: number[] = [];
let rafId: number | undefined;

function sortPriorities() {
	sortedPriorities = Array.from(ticksByPriority.keys()).sort((a, b) => a - b);
}

function raf(time: number) {
	sortedPriorities.forEach((priority) => {
		ticksByPriority.get(priority)?.forEach((tick) => {
			try {
				tick(time);
			} catch (error) {
				console.error('Error in RAF callback:', error);
				removeRafTick(tick);
			}
		});
	});

	rafId = requestAnimationFrame(raf);
}

export function addRafTick(
	callback: FrameRequestCallback,
	priority: RafPriority | number = 'default'
) {
	const resolvedPriority = typeof priority === 'string' ? RAF_PRIORITIES[priority] : priority;

	if (tickToPriority.has(callback)) {
		const oldPriority = tickToPriority.get(callback)!;
		ticksByPriority.get(oldPriority)?.delete(callback);
	}

	if (!ticksByPriority.has(resolvedPriority)) {
		ticksByPriority.set(resolvedPriority, new Set());
		sortPriorities();
	}

	tickToPriority.set(callback, resolvedPriority);
	ticksByPriority.get(resolvedPriority)?.add(callback);
}

export function removeRafTick(callback: FrameRequestCallback) {
	const priority = tickToPriority.get(callback);

	if (priority !== undefined) {
		tickToPriority.delete(callback);
		ticksByPriority.get(priority)?.delete(callback);

		if (ticksByPriority.get(priority)?.size === 0) {
			ticksByPriority.delete(priority);
			sortPriorities();
		}
	}
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
