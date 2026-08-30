/** An ordered list of callbacks that run in ascending priority order. */
export class CallbackList<T extends (...args: never[]) => void> {
	#list: { callback: T; priority: number }[] = [];

	/** The number of callbacks in the list. */
	get size() {
		return this.#list.length;
	}

	/**
	 * Adds a callback at the given priority.
	 *
	 * @param callback - The callback to add.
	 * @param priority - The priority of the callback. Default `0`.
	 * @returns A function that removes the callback.
	 */
	add(callback: T, priority = 0) {
		const entry = { callback, priority };
		const index = this.#list.findIndex((cb) => cb.priority > priority);

		if (index === -1) {
			this.#list.push(entry);
		} else {
			this.#list.splice(index, 0, entry);
		}

		return () => {
			const entryIndex = this.#list.indexOf(entry);
			if (entryIndex !== -1) this.#list.splice(entryIndex, 1);
		};
	}

	/**
	 * Removes the first matching callback, if one exists.
	 *
	 * @param callback - The callback to remove.
	 */
	remove(callback: T) {
		const index = this.#list.findIndex((cb) => cb.callback === callback);
		if (index !== -1) this.#list.splice(index, 1);
	}

	/**
	 * Runs every callback in priority order, passing along the given arguments.
	 *
	 * @param args - The arguments to pass to each callback.
	 */
	run(...args: Parameters<T>) {
		for (const { callback } of [...this.#list]) {
			try {
				callback(...args);
			} catch (e) {
				console.error('Error in CallbackList:', e);
			}
		}
	}
}
