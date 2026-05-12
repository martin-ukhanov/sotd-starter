import { createContext } from 'svelte';
import type { ReadonlyRef } from '$lib/utils/ref.svelte';
import type { ThreeContext, ThreeLoop, ThreeNode } from '$lib/three/types';

export const [getThree, setThree] = createContext<ThreeContext>();
export const [getThreeLoop, setThreeLoop] = createContext<ThreeLoop>();
export const [getThreeParent, setThreeParent] = createContext<ReadonlyRef<ThreeNode | undefined>>();
