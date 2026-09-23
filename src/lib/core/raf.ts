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

	static #nativeRequest: typeof requestAnimationFrame | undefined;
	static #nativeCancel: typeof cancelAnimationFrame | undefined;

	static #nativeId = 0;
	static #nativeCallbacks = new Map<number, FrameRequestCallback>();

	static get isRunning() {
		return this.#id !== undefined;
	}

	static add(callback: FrameRequestCallback, priority: RafPriority | number = 'default') {
		const resolvedPriority = typeof priority === 'string' ? RAF_PRIORITIES[priority] : priority;
		return this.#callbacks.add(callback, resolvedPriority);
	}

	static remove(callback: FrameRequestCallback) {
		this.#callbacks.remove(callback);
	}

	static #run: FrameRequestCallback = (time) => {
		this.#id = this.#nativeRequest?.(this.#run);
		this.#callbacks.run(time);
	};

	static #runNative: FrameRequestCallback = (time) => {
		if (!this.#nativeCallbacks.size) return;

		for (const id of [...this.#nativeCallbacks.keys()]) {
			const callback = this.#nativeCallbacks.get(id);
			if (!callback) continue;

			this.#nativeCallbacks.delete(id);

			try {
				callback(time);
			} catch (e) {
				console.error('Error in requestAnimationFrame:', e);
			}
		}
	};

	static start() {
		if (this.#id !== undefined) return;

		this.#nativeRequest ??= window.requestAnimationFrame.bind(window);
		this.#nativeCancel ??= window.cancelAnimationFrame.bind(window);

		window.requestAnimationFrame = (callback) => {
			const id = ++this.#nativeId;
			this.#nativeCallbacks.set(id, callback);
			return id;
		};

		window.cancelAnimationFrame = (id) => {
			this.#nativeCallbacks.delete(id);
		};

		this.add(this.#runNative);
		this.#id = this.#nativeRequest(this.#run);
	}

	static stop() {
		if (this.#id === undefined) return;

		this.#nativeCancel?.(this.#id);
		this.#id = undefined;

		this.remove(this.#runNative);
		this.#nativeCallbacks.clear();

		if (this.#nativeRequest) window.requestAnimationFrame = this.#nativeRequest;
		if (this.#nativeCancel) window.cancelAnimationFrame = this.#nativeCancel;
	}
}
