import { untrack } from 'svelte';
import {
	createScope,
	type Scope,
	type ScopeParams as _ScopeParams,
	type ScopeConstructorCallback,
	type DOMTargetSelector
} from 'animejs';
import { extract, type MaybeGetter } from '$lib/utils/getter';
import { ref, type ReadonlyRef } from '$lib/utils/ref.svelte';

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
	const scope = ref.raw<Scope>();
	let params: ScopeParams | undefined;
	let constructor: ScopeConstructorCallback | undefined;

	if (typeof a1 === 'function') {
		constructor = a1;
	} else {
		params = a1;
		constructor = a2;
	}

	$effect(() => {
		scope.current = createScope({
			...params,
			root: extract(params?.root)
		});

		if (constructor) {
			untrack(() => scope.current?.add(constructor));
		}

		return () => {
			scope.current?.revert();
			scope.current = undefined;
		};
	});

	return ref.readonly(scope);
}
