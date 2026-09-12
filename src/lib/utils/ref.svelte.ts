import type { Getter } from '$lib/utils/getter';

const REF = Symbol('ref');

export interface Ref<T> {
	readonly [REF]: true;
	current: T;
}

export interface ReadonlyRef<T> {
	readonly [REF]: true;
	readonly current: T;
}

export type MaybeRef<T> = T | Ref<T>;

/**
 * Creates a reactive reference backed by `$state`.
 *
 * @template T - The type of the value held by the `Ref`.
 * @param initial - Optional initial value. If omitted, the `Ref` is initialized as `undefined`.
 * @returns A `Ref` whose `.current` getter/setter is reactive.
 */
export function ref<T>(initial: T): Ref<T>;
export function ref<T>(): Ref<T | undefined>;
export function ref<T>(initial?: T): Ref<T | undefined> {
	let current = $state(initial);

	return {
		[REF]: true,
		get current() {
			return current;
		},
		set current(next) {
			current = next;
		}
	};
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ref {
	/**
	 * Creates a reactive reference backed by `$state.raw`.
	 *
	 * @template T - The type of the value held by the `Ref`.
	 * @param initial - Optional initial value. If omitted, the ref is initialized as `undefined`.
	 * @returns A `Ref` whose `.current` getter/setter is reactive on reassignment.
	 */
	export function raw<T>(initial: T): Ref<T>;
	export function raw<T>(): Ref<T | undefined>;
	export function raw<T>(initial?: T): Ref<T | undefined> {
		let current = $state.raw(initial);

		return {
			[REF]: true,
			get current() {
				return current;
			},
			set current(next) {
				current = next;
			}
		};
	}

	/**
	 * Wraps a `Ref`, or a raw value, to expose only a getter, hiding the setter.
	 *
	 * @template T - The type of the value held by the `Ref`.
	 * @param source - A `Ref` to wrap, or a raw value to back a new `Ref` with.
	 * @returns A `ReadonlyRef` that mirrors the source's value but cannot be reassigned.
	 */
	export function readonly<T>(source: MaybeRef<T>): ReadonlyRef<T> {
		const target = isRef(source) ? source : ref(source);

		return {
			[REF]: true,
			get current() {
				return target.current;
			}
		};
	}

	/**
	 * Converts a getter into a `Ref`.
	 *
	 * @template T - The type of the value produced by the getter.
	 * @param getter - Function called on every read of `.current`.
	 * @returns A `ReadonlyRef` that reads through to the getter.
	 */
	export function from<T>(getter: Getter<T>): ReadonlyRef<T> {
		return {
			[REF]: true,
			get current() {
				return getter();
			}
		};
	}
}

/**
 * Checks whether a value is a `Ref`.
 *
 * @template T - The type of the value held by the `Ref`.
 * @param value - A value or a `Ref` holding a value.
 * @returns `true` if the value is a `Ref`.
 */
export function isRef<T>(value: MaybeRef<T>): value is Ref<T> {
	return typeof value === 'object' && value !== null && REF in value;
}

/**
 * Resolves a value that may or may not be a `Ref`.
 *
 * @template T - The expected value type.
 * @param value - A value or a `Ref` holding a value.
 * @returns The resolved value.
 */
export function unref<T>(value: MaybeRef<T>) {
	return isRef(value) ? value.current : value;
}
