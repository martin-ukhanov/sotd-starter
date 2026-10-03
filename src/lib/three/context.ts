import { createContext } from 'svelte';
import type { Ref } from '#lib/utils/ref.svelte.ts';
import type {
	ThreeContext,
	ThreeLoopSubscribe,
	ThreeNode,
	ThreeViewContext
} from '#lib/three/types.ts';

/*
	Context
*/
export const [getThree, setThree] = createContext<ThreeContext>();

/*
	Loop
*/
export const [getThreeLoop, setThreeLoop] = createContext<ThreeLoopSubscribe>();

/*
	Parent
*/
export const [getThreeParent, setThreeParent] =
	createContext<Readonly<Ref<ThreeNode | undefined>>>();

/*
	View
*/
const [_getThreeView, setThreeView, hasThreeView] = createContext<ThreeViewContext>();

function getThreeView() {
	return hasThreeView() ? _getThreeView() : undefined;
}

export { getThreeView, setThreeView };
