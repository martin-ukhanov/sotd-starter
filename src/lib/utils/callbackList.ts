export class CallbackList<T extends (...args: never[]) => void> {
	#list: { callback: T; priority: number }[] = [];

	get size() {
		return this.#list.length;
	}

	add(callback: T, priority = 0) {
		this.remove(callback);

		const newCallback = { callback, priority };
		const index = this.#list.findIndex((cb) => cb.priority > priority);

		if (index === -1) {
			this.#list.push(newCallback);
		} else {
			this.#list.splice(index, 0, newCallback);
		}
	}

	remove(callback: T) {
		const index = this.#list.findIndex((cb) => cb.callback === callback);
		if (index !== -1) this.#list.splice(index, 1);
	}

	run(...args: Parameters<T>) {
		for (const { callback } of [...this.#list]) callback(...args);
	}
}
