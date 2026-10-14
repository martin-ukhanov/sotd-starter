/** An ordered list of callbacks that run in ascending order. */
export class CallbackList<T extends (...args: never[]) => void> {
	#list: { callback: T; order: number }[] = [];

	/** The number of callbacks in the list. */
	get size() {
		return this.#list.length;
	}

	/**
	 * Adds a callback with the given order.
	 *
	 * @param callback - The callback to add.
	 * @param order - Where the callback runs; lower values run first. Default `0`.
	 * @returns A function that removes the callback.
	 */
	add(callback: T, order = 0) {
		const entry = { callback, order };
		const index = this.#list.findIndex((cb) => cb.order > order);

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
	 * Runs every callback in order, passing along the given arguments.
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
