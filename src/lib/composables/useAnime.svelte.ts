import { untrack } from 'svelte';
import {
	createScope,
	type Scope,
	type ScopeParams as _ScopeParams,
	type ScopeConstructorCallback,
	type DOMTargetSelector
} from 'animejs';
import { extract, type MaybeGetter } from '$lib/utils/getter';
import { rawRef, readonlyRef, type ReadonlyRef } from '$lib/utils/ref.svelte';

export type ScopeParams = Omit<_ScopeParams, 'root'> & {
	root?: MaybeGetter<DOMTargetSelector>;
};

export function useAnime(): ReadonlyRef<Scope | undefined>;
export function useAnime(params: ScopeParams): ReadonlyRef<Scope | undefined>;
export function useAnime(constructor: ScopeConstructorCallback): ReadonlyRef<Scope | undefined>;
export function useAnime(
	params: ScopeParams,
	constructor: ScopeConstructorCallback
): ReadonlyRef<Scope | undefined>;

export function useAnime(
	a1?: ScopeParams | ScopeConstructorCallback,
	a2?: ScopeConstructorCallback
): ReadonlyRef<Scope | undefined> {
	const scope = rawRef<Scope>();
	let params: ScopeParams | undefined;
	let constructor: ScopeConstructorCallback | undefined;

	if (typeof a1 === 'function') {
		constructor = a1;
	} else {
		params = a1;
		constructor = a2;
	}

	$effect(() => {
		scope.value = createScope({
			...params,
			root: extract(params?.root)
		});

		if (constructor) {
			untrack(() => scope.value?.add(constructor));
		}

		return () => {
			scope.value?.revert();
			scope.value = undefined;
		};
	});

	return readonlyRef(scope);
}
