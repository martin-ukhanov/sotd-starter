export interface Ref<T> {
	value: T;
}

export interface ReadonlyRef<T> {
	readonly value: T;
}

export function ref<T>(initial: T): Ref<T>;
export function ref<T>(): Ref<T | undefined>;
export function ref<T>(initial?: T): Ref<T | undefined> {
	let value = $state(initial);

	return {
		get value() {
			return value;
		},
		set value(next) {
			value = next;
		}
	};
}

export function rawRef<T>(initial: T): Ref<T>;
export function rawRef<T>(): Ref<T | undefined>;
export function rawRef<T>(initial?: T): Ref<T | undefined> {
	let value = $state.raw(initial);

	return {
		get value() {
			return value;
		},
		set value(next) {
			value = next;
		}
	};
}

export function readonlyRef<T>(ref: Ref<T>): ReadonlyRef<T> {
	return {
		get value() {
			return ref.value;
		}
	};
}
