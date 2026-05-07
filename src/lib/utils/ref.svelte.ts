export interface Ref<T> {
	current: T;
}

export interface ReadonlyRef<T> {
	readonly current: T;
}

/**
 * Creates a reactive reference backed by `$state`.
 *
 * @template T - The type of the value held by the ref.
 * @param initial - Optional initial value. If omitted, the ref is initialized as `undefined`.
 * @returns A `Ref` whose `.current` getter/setter is reactive.
 */
export function ref<T>(initial: T): Ref<T>;
export function ref<T>(): Ref<T | undefined>;
export function ref<T>(initial?: T): Ref<T | undefined> {
	let current = $state(initial);

	return {
		get current() {
			return current;
		},
		set current(next) {
			current = next;
		}
	};
}

/**
 * Creates a reactive reference backed by `$state.raw`.
 *
 * @template T - The type of the value held by the ref.
 * @param initial - Optional initial value. If omitted, the ref is initialized as `undefined`.
 * @returns A `Ref` whose `.current` getter/setter is reactive on reassignment.
 */
export function rawRef<T>(initial: T): Ref<T>;
export function rawRef<T>(): Ref<T | undefined>;
export function rawRef<T>(initial?: T): Ref<T | undefined> {
	let current = $state.raw(initial);

	return {
		get current() {
			return current;
		},
		set current(next) {
			current = next;
		}
	};
}

/**
 * Wraps a `Ref` to expose only its getter, hiding the setter.
 *
 * @template T - The type of the value held by the source ref.
 * @param source - The source ref to wrap.
 * @returns A `ReadonlyRef` that mirrors the source's value but cannot be reassigned.
 */
export function readonlyRef<T>(source: Ref<T>): ReadonlyRef<T> {
	return {
		get current() {
			return source.current;
		}
	};
}
