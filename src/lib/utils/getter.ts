export type Getter<T> = () => T;
export type MaybeGetter<T> = T | Getter<T>;

/**
 * Resolves a value that may be a getter function or a direct value.
 *
 * @template T - The expected return type.
 * @param value - A value or a function that returns a value.
 * @returns The resolved value.
 */
export function extract<T>(value: MaybeGetter<T>) {
	return typeof value === 'function' ? (value as Getter<T>)() : value;
}
