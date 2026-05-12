import { CallbackList } from '$lib/utils/callbackList';

const RAF_PRIORITIES = {
	lenis: -3,
	anime: -2,
	three: -1,
	default: 0
} as const;

export type RafPriority = keyof typeof RAF_PRIORITIES;

export class Raf {
	static #id: number | undefined;
	static #callbacks = new CallbackList<FrameRequestCallback>();

	static #run = (time: number) => {
		this.#callbacks.run(time);
		this.#id = requestAnimationFrame(this.#run);
	};

	static get isRunning() {
		return this.#id !== undefined;
	}

	static add(callback: FrameRequestCallback, priority: RafPriority | number = 'default') {
		const resolvedPriority = typeof priority === 'string' ? RAF_PRIORITIES[priority] : priority;
		this.#callbacks.add(callback, resolvedPriority);
	}

	static remove(callback: FrameRequestCallback) {
		this.#callbacks.remove(callback);
	}

	static start() {
		if (this.#id === undefined) {
			this.#id = requestAnimationFrame(this.#run);
		}
	}

	static stop() {
		if (this.#id !== undefined) {
			cancelAnimationFrame(this.#id);
			this.#id = undefined;
		}
	}
}
