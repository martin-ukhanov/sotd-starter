import { untrack } from 'svelte';
import {
	createScope,
	type Scope,
	type ScopeParams as _ScopeParams,
	type ScopeConstructorCallback,
	type DOMTargetSelector
} from 'animejs';

// Types
export type ScopeParams = Omit<_ScopeParams, 'root'> & {
	root?: DOMTargetSelector | (() => DOMTargetSelector) | undefined;
};

export interface ScopeRef {
	readonly value: Scope | undefined;
}

// Overloads
export function useAnime(): ScopeRef;
export function useAnime(params: ScopeParams): ScopeRef;
export function useAnime(constructor: ScopeConstructorCallback): ScopeRef;
export function useAnime(params: ScopeParams, constructor: ScopeConstructorCallback): ScopeRef;

// Implementation
export function useAnime(
	a1?: ScopeParams | ScopeConstructorCallback,
	a2?: ScopeConstructorCallback
): ScopeRef {
	let scope = $state.raw<Scope>();
	let params: ScopeParams | undefined;
	let constructor: ScopeConstructorCallback | undefined;

	if (typeof a1 === 'function') {
		constructor = a1;
	} else {
		params = a1;
		constructor = a2;
	}

	$effect(() => {
		const root = typeof params?.root === 'function' ? params.root() : params?.root;
		scope = createScope({ ...params, root });

		if (constructor) {
			untrack(() => scope?.add(constructor));
		}

		return () => {
			scope?.revert();
			scope = undefined;
		};
	});

	return {
		get value() {
			return scope;
		}
	};
}
