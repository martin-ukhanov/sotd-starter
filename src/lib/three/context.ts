import { createContext } from 'svelte';
import type { MaybeRef } from '$lib/utils/ref.svelte';
import type { ThreeContext, ThreeLoop, ThreeNode } from '$three/types';

export const [getThree, setThree] = createContext<ThreeContext>();
export const [getThreeLoop, setThreeLoop] = createContext<ThreeLoop>();
export const [getThreeParent, setThreeParent] = createContext<MaybeRef<ThreeNode | undefined>>();
