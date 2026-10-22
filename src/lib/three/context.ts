import { createContext } from 'svelte';
import type { Ref } from '#lib/utils/ref.svelte.ts';
import type { ThreeContext, ThreeLoopSubscribe, ThreeNode } from '#lib/three/types.ts';

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
