import { createContext } from 'svelte';
import type { Object3D } from 'three';
import type { ThreeContext, ThreeLoop } from '$three/types';

export const [getThree, setThree] = createContext<ThreeContext>();
export const [getThreeLoop, setThreeLoop] = createContext<ThreeLoop>();
export const [getThreeParent, setThreeParent] = createContext<Object3D>();
