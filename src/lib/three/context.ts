import { createContext } from 'svelte';
import type { Ref } from '$lib/utils/ref.svelte';
import type { ThreeContext, ThreeLoopSubscribe, ThreeNode } from '$lib/three/types';

export const [getThree, setThree] = createContext<ThreeContext>();
export const [getThreeLoop, setThreeLoop] = createContext<ThreeLoopSubscribe>();
export const [getThreeParent, setThreeParent] =
	createContext<Readonly<Ref<ThreeNode | undefined>>>();
