export interface Ref<T> {
	current: T;
}

export interface ReadonlyRef<T> {
	readonly current: T;
}

export type MaybeRef<T> = T | Ref<T> | ReadonlyRef<T>;

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

/**
 * Checks whether a value is a `Ref` or `ReadonlyRef`.
 *
 * @template T - The type of the value held by the ref.
 * @param value - A raw value or a ref to test.
 * @returns `true` if the value exposes a `current` property, narrowing it to `Ref<T> | ReadonlyRef<T>`.
 */
export function isRef<T>(value: MaybeRef<T>): value is Ref<T> | ReadonlyRef<T> {
	return typeof value === 'object' && value !== null && 'current' in value;
}

/**
 * Unwraps a `MaybeRef`, returning the underlying value whether the input is a
 * raw value or a `Ref`/`ReadonlyRef`.
 *
 * @template T - The type of the value held by the ref.
 * @param value - A raw value or a ref to unwrap.
 * @returns The unwrapped value.
 */
export function unref<T>(value: MaybeRef<T>): T {
	return isRef(value) ? value.current : value;
}
